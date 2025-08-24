import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Action } from 'src/infrastructures/databases/entities/action.entity';
import { ActionV1Controller } from './controllers/action-v1.controller';
import { ActionV1Repository } from './repositories/action-v1.repository';
import { ActionV1Service } from './services/action-v1.service';

@Module({
    imports: [TypeOrmModule.forFeature([Action])],
    controllers: [ActionV1Controller],
    providers: [ActionV1Repository, ActionV1Service],
    exports: [ActionV1Repository, ActionV1Service],
})
export class ActionModule {}
