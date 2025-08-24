import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Session } from 'src/infrastructures/databases/entities/session.entity';
import { SessionV1Controller } from './controllers/session-v1.controller';
import { SessionV1Repository } from './repositories/session-v1.repository';
import { SessionV1Service } from './services/session-v1.service';

@Module({
    imports: [TypeOrmModule.forFeature([Session])],
    controllers: [SessionV1Controller],
    providers: [
        // Repositories
        SessionV1Repository,
        
        // Services
        SessionV1Service,
    ],
    exports: [
        // Repositories
        SessionV1Repository,
        
        // Services
        SessionV1Service,
    ],
})
export class SessionModule {}