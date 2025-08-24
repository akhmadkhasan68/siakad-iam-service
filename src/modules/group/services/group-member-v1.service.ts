import {
    ConflictException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { GroupMember } from 'src/infrastructures/databases/entities/group-member.entity';
import { Group } from 'src/infrastructures/databases/entities/group.entity';
import { User } from 'src/infrastructures/databases/entities/user.entity';
import { IGroupMember } from 'src/infrastructures/databases/interfaces/group-member.interface';
import { IPaginateData } from 'src/shared/interfaces/paginate-response.interface';
import { DataSource } from 'typeorm';
import { GroupMemberCreateV1Request } from '../dtos/requests/group-member-create-v1.request';
import { GroupMemberPaginateV1Request } from '../dtos/requests/group-member-paginate-v1.request';
import { GroupMemberV1Repository } from '../repositories/group-member-v1.repository';

@Injectable()
export class GroupMemberV1Service {
    constructor(
        private readonly groupMemberRepository: GroupMemberV1Repository,
        private readonly dataSource: DataSource,
    ) {}

    async paginate(
        paginationDto: GroupMemberPaginateV1Request,
    ): Promise<IPaginateData<IGroupMember>> {
        return await this.groupMemberRepository.pagination(paginationDto);
    }

    async findOneById(id: string): Promise<IGroupMember> {
        return await this.groupMemberRepository.findOneByIdOrFail(id);
    }

    async findOneByIdWithRelations(id: string): Promise<IGroupMember> {
        return await this.groupMemberRepository.findOneByIdWithRelations(id);
    }

    async create(createDto: GroupMemberCreateV1Request): Promise<IGroupMember> {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            // Check for duplicate membership
            const existingMember = await queryRunner.manager.findOne(
                GroupMember,
                {
                    where: {
                        groupId: createDto.groupId,
                        userId: createDto.userId,
                    },
                },
            );

            if (existingMember) {
                throw new ConflictException(
                    'User is already a member of this group',
                );
            }

            // Verify group exists
            const group = await queryRunner.manager.findOne(Group, {
                where: { id: createDto.groupId },
            });

            if (!group) {
                throw new NotFoundException('Group not found');
            }

            // Verify user exists
            const user = await queryRunner.manager.findOne(User, {
                where: { id: createDto.userId },
            });

            if (!user) {
                throw new NotFoundException('User not found');
            }

            const groupMember = queryRunner.manager.create(GroupMember, {
                groupId: createDto.groupId,
                userId: createDto.userId,
            });

            const savedGroupMember =
                await queryRunner.manager.save<GroupMember>(groupMember);
            await queryRunner.commitTransaction();

            return savedGroupMember;
        } catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        } finally {
            await queryRunner.release();
        }
    }

    async delete(id: string): Promise<void> {
        const groupMember =
            await this.groupMemberRepository.findOneByIdOrFail(id);
        await this.groupMemberRepository.softRemove(groupMember);
    }

    async deleteByGroupAndUser(groupId: string, userId: string): Promise<void> {
        const groupMember = await this.groupMemberRepository.findByGroupAndUser(
            groupId,
            userId,
        );

        if (!groupMember) {
            throw new NotFoundException('Group membership not found');
        }

        await this.groupMemberRepository.softRemove(groupMember);
    }
}
