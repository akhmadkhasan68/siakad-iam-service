import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtKey } from 'src/infrastructures/databases/entities/jwt-key.entity';
import { RefreshToken } from 'src/infrastructures/databases/entities/refresh-token.entity';
import { TokenDenylist } from 'src/infrastructures/databases/entities/token-denylist.entity';
import { JwtKeyV1Controller } from './controllers/jwt-key-v1.controller';
import { RefreshTokenV1Controller } from './controllers/refresh-token-v1.controller';
import { TokenDenylistV1Controller } from './controllers/token-denylist-v1.controller';
import { JwtKeyV1Repository } from './repositories/jwt-key-v1.repository';
import { RefreshTokenV1Repository } from './repositories/refresh-token-v1.repository';
import { TokenDenylistV1Repository } from './repositories/token-denylist-v1.repository';
import { JwtKeyV1Service } from './services/jwt-key-v1.service';
import { RefreshTokenV1Service } from './services/refresh-token-v1.service';
import { TokenDenylistV1Service } from './services/token-denylist-v1.service';

@Module({
    imports: [TypeOrmModule.forFeature([JwtKey, RefreshToken, TokenDenylist])],
    controllers: [
        JwtKeyV1Controller,
        RefreshTokenV1Controller,
        TokenDenylistV1Controller,
    ],
    providers: [
        // Repositories
        JwtKeyV1Repository,
        RefreshTokenV1Repository,
        TokenDenylistV1Repository,
        
        // Services
        JwtKeyV1Service,
        RefreshTokenV1Service,
        TokenDenylistV1Service,
    ],
    exports: [
        // Repositories
        JwtKeyV1Repository,
        RefreshTokenV1Repository,
        TokenDenylistV1Repository,
        
        // Services
        JwtKeyV1Service,
        RefreshTokenV1Service,
        TokenDenylistV1Service,
    ],
})
export class TokenModule {}