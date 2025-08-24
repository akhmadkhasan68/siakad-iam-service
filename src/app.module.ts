import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SentryModule } from '@sentry/nestjs/setup';
import { ZodValidationPipe } from 'nestjs-zod';
import { join } from 'path';
import { config } from './config';
import { databaseConfig } from './infrastructures/databases/config';
import { ResponseInterceptor } from './infrastructures/interceptors/response.interceptor';
import { ActionModule } from './modules/action/action.module';
import { AuthModule } from './modules/auth/auth.module';
import { JwtAuthGuard } from './modules/auth/shared/guards/jwt-auth.guard';
import { PermissionGuard } from './modules/auth/shared/guards/permission.guard';
import { GroupModule } from './modules/group/group.module';
import { HealthModule } from './modules/health/health.module';
import { OrganizationModule } from './modules/organization/organization.module';
import { PermissionModule } from './modules/permission/permission.module';
import { ResourceModule } from './modules/resource/resource.module';
import { RoleModule } from './modules/role/role.module';
import { SessionModule } from './modules/session/session.module';
import { UserModule } from './modules/user/user.module';
import { GlobalExceptionHandlerFilter } from './shared/filters/global-exception.filter';
import { DateTimeUtil } from './shared/utils/datetime.util';

@Module({
    imports: [
        SentryModule.forRoot(),
        TypeOrmModule.forRoot(databaseConfig),
        BullModule.forRoot({
            connection: {
                host: config.redis.host,
                port: config.redis.port,
                password: config.redis.password,
            },
            prefix: `${config.app.name}:${config.app.env}:bull`,
            defaultJobOptions: {
                removeOnComplete: true,
                removeOnFail: true,
                attempts: config.queue.retryAttempts,
                backoff: {
                    type: 'exponential',
                    delay: DateTimeUtil.convertSecondsToMilliseconds(
                        config.queue.backoffDelayInSeconds,
                    ),
                },
            },
        }),
        MailerModule.forRoot({
            transport: {
                host: config.smtp.host,
                port: config.smtp.port,
                secure: false,
                ...(config.smtp.user && config.smtp.password
                    ? {
                          auth: {
                              user: config.smtp.user,
                              pass: config.smtp.password,
                          },
                      }
                    : {}),
            },
            defaults: {
                from: `"No Reply" <${config.smtp.emailSender}>`,
            },
            template: {
                dir: join(
                    __dirname,
                    './infrastructures/modules/mail/templates',
                ),
                adapter: new HandlebarsAdapter(),
                options: {
                    strict: true,
                },
            },
        }),
        HealthModule,
        AuthModule,
        ActionModule,
        GroupModule,
        OrganizationModule,
        PermissionModule,
        ResourceModule,
        RoleModule,
        SessionModule,
        UserModule,
    ],
    providers: [
        {
            provide: APP_FILTER,
            useClass: GlobalExceptionHandlerFilter,
        },
        {
            provide: APP_PIPE,
            useClass: ZodValidationPipe,
        },
        {
            provide: APP_GUARD,
            useClass: JwtAuthGuard,
        },
        {
            provide: APP_GUARD,
            useClass: PermissionGuard,
        },
        {
            provide: APP_INTERCEPTOR,
            useClass: ResponseInterceptor,
        },
    ],
})
export class AppModule {}
