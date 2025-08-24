import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/infrastructures/databases/entities/user.entity';
import { IUserCredentialPassword } from 'src/infrastructures/databases/interfaces/user-credential-password.interface';
import { Repository } from 'typeorm';

/**
 * UserCredentialPasswordV1Repository class is a TypeORM repository for managing user entities.
 * It extends the base Repository class from TypeORM.
 */
@Injectable()
export class UserCredentialPasswordV1Repository extends Repository<IUserCredentialPassword> {
    constructor(
        @InjectRepository(User)
        private readonly repo: Repository<IUserCredentialPassword>,
    ) {
        super(repo.target, repo.manager, repo.queryRunner);
    }

    private readonly defaultRelations: string[] = ['user'];

    /**
     * Finds a user credential password by user ID.
     * @param userId The ID of the user to find.
     * @returns A promise that resolves to the found user credential password or null if not found.
     */
    async findOneByUserIdOrFail(
        userId: string,
    ): Promise<IUserCredentialPassword> {
        return await this.findOneByOrFail({
            userId,
        });
    }

    /**
     * Finds a user by their ID with optional relations.
     * @param id The ID of the user to find.
     * @param relations Optional array of relations to include in the query.
     * @returns A promise that resolves to the found user or null if not found.
     */
    async findOneByIdWithRelations(
        id: string,
        relations?: string[],
    ): Promise<IUserCredentialPassword | null> {
        return await this.findOne({
            where: { id },
            relations: relations || this.defaultRelations,
        });
    }

    async findOneByIdOrFailWithRelations(
        id: string,
        relations?: string[],
    ): Promise<IUserCredentialPassword> {
        return await this.findOneOrFail({
            where: { id },
            relations: relations || this.defaultRelations,
        });
    }
}
