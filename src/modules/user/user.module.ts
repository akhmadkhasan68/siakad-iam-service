import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserCredentialPassword } from 'src/infrastructures/databases/entities/user-credential-password.entity';
import { User } from 'src/infrastructures/databases/entities/user.entity';
import { ExportDataModule } from 'src/infrastructures/modules/export-data/export-data.module';
import { ImportDataModule } from 'src/infrastructures/modules/import-data/import-data.module';
import { RoleModule } from '../role/role.module';
import { UserV1Controller } from './controllers/user-v1.controller';
import { UserCredentialPasswordV1Repository } from './repositories/user-credential-password-v1.repository';
import { UserV1Repository } from './repositories/user-v1.repository';
import { UserV1Service } from './services/user-v1.service';

@Module({
    imports: [
        TypeOrmModule.forFeature([User, UserCredentialPassword]),
        RoleModule,
        ImportDataModule,
        ExportDataModule,
    ],
    controllers: [UserV1Controller],
    providers: [
        // Repositories
        UserV1Repository,
        UserCredentialPasswordV1Repository,

        // Services
        UserV1Service,
    ],
    exports: [
        // Repositories
        UserV1Repository,
        UserCredentialPasswordV1Repository,

        // Services
        UserV1Service,
    ],
})
export class UserModule {}
