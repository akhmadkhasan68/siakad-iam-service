import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Organization } from 'src/infrastructures/databases/entities/organization.entity';
import { OrganizationV1Controller } from './controllers/organization-v1.controller';
import { OrganizationV1Repository } from './repositories/organization-v1.repository';
import { OrganizationV1Service } from './services/organization-v1.service';

@Module({
    imports: [TypeOrmModule.forFeature([Organization])],
    controllers: [OrganizationV1Controller],
    providers: [
        // Repositories
        OrganizationV1Repository,
        
        // Services
        OrganizationV1Service,
    ],
    exports: [
        // Repositories
        OrganizationV1Repository,
        
        // Services
        OrganizationV1Service,
    ],
})
export class OrganizationModule {}