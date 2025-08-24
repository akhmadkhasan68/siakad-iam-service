import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Resource } from 'src/infrastructures/databases/entities/resource.entity';
import { ResourceV1Controller } from './controllers/resource-v1.controller';
import { ResourceV1Repository } from './repositories/resource-v1.repository';
import { ResourceV1Service } from './services/resource-v1.service';

@Module({
    imports: [TypeOrmModule.forFeature([Resource])],
    controllers: [ResourceV1Controller],
    providers: [
        // Repositories
        ResourceV1Repository,
        
        // Services
        ResourceV1Service,
    ],
    exports: [
        // Repositories
        ResourceV1Repository,
        
        // Services
        ResourceV1Service,
    ],
})
export class ResourceModule {}
