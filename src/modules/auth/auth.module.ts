import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { config } from 'src/config';
import { Role } from 'src/infrastructures/databases/entities/role.entity';
import { ExportDataModule } from 'src/infrastructures/modules/export-data/export-data.module';
import { ImportDataModule } from 'src/infrastructures/modules/import-data/import-data.module';
import { MailModule } from 'src/infrastructures/modules/mail/mail.module';
import { QueueModule } from 'src/infrastructures/modules/queue/queue.module';
import { PermissionModule } from '../permission/permission.module';
import { RoleModule } from '../role/role.module';
import { UserModule } from '../user/user.module';
import { AuthForgotPasswordV1Controller } from './controllers/auth-forgot-password-v1.controller';
import { AuthLoginV1Controller } from './controllers/auth-login-v1.controller';
import { AuthLogoutV1Controller } from './controllers/auth-logout-v1.controller';
import { AuthMeV1Controller } from './controllers/auth-me-v1.controller';
import { AuthRefreshTokenV1Controller } from './controllers/auth-refresh-token-v1.controller';
import { AuthForgotPasswordV1Service } from './services/auth-forgot-password-v1.service';
import { AuthJwtV1Service } from './services/auth-jwt-v1.service';
import { AuthLoginV1Service } from './services/auth-login-v1.service';
import { AuthLogoutV1Service } from './services/auth-logout-v1.service';
import { AuthRefreshTokenV1Service } from './services/auth-refresh-token-v1.service';
import { JwtStrategy } from './shared/strategy/jwt.strategy';

@Module({
    imports: [
        TypeOrmModule.forFeature([Role]),
        PassportModule,
        JwtModule.register({
            secret: config.jwt.secret,
            signOptions: { expiresIn: config.jwt.expiresInSeconds },
        }),
        MailModule,
        QueueModule,
        ImportDataModule,
        ExportDataModule,
        UserModule,
        RoleModule,
        PermissionModule,
    ],
    controllers: [
        AuthLoginV1Controller,
        AuthLogoutV1Controller,
        AuthMeV1Controller,
        AuthRefreshTokenV1Controller,
        AuthForgotPasswordV1Controller,
    ],
    providers: [
        // Auth
        AuthLoginV1Service,
        AuthLogoutV1Service,
        AuthRefreshTokenV1Service,
        AuthJwtV1Service,
        AuthForgotPasswordV1Service,

        JwtStrategy,
    ],
})
export class AuthModule {}
