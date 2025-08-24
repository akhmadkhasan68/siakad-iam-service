import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Group } from 'src/infrastructures/databases/entities/group.entity';
import { GroupMember } from 'src/infrastructures/databases/entities/group-member.entity';
import { GroupV1Controller } from './controllers/group-v1.controller';
import { GroupMemberV1Controller } from './controllers/group-member-v1.controller';
import { GroupV1Repository } from './repositories/group-v1.repository';
import { GroupMemberV1Repository } from './repositories/group-member-v1.repository';
import { GroupV1Service } from './services/group-v1.service';
import { GroupMemberV1Service } from './services/group-member-v1.service';

@Module({
    imports: [TypeOrmModule.forFeature([Group, GroupMember])],
    controllers: [GroupV1Controller, GroupMemberV1Controller],
    providers: [
        // Repositories
        GroupV1Repository,
        GroupMemberV1Repository,
        
        // Services
        GroupV1Service,
        GroupMemberV1Service,
    ],
    exports: [
        // Repositories
        GroupV1Repository,
        GroupMemberV1Repository,
        
        // Services
        GroupV1Service,
        GroupMemberV1Service,
    ],
})
export class GroupModule {}