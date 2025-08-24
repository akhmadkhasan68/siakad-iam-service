# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Essential Commands

### Development Workflow

- `yarn start:dev` - Start development server with hot reload
- `yarn build` - Build the application for production
- `yarn start:prod` - Start production server
- `yarn lint` - Run ESLint and fix issues
- `yarn format` - Format code with Prettier

### Database Operations

- `yarn migrate` - Run all pending database migrations
- `yarn migrate:generate [migration_name]` - Generate new migration from entity changes
- `yarn migrate:revert` - Revert the last migration
- `yarn seed:run [seeder_file_name.ts]` - Run specific seeder file
- `yarn seed:run:all` - Run all seeders in sequence
- `yarn typeorm` - Access TypeORM CLI with project config

### Testing

- `yarn test` - Run unit tests
- `yarn test:watch` - Run tests in watch mode
- `yarn test:cov` - Run tests with coverage report
- `yarn test:e2e` - Run end-to-end tests

## High-Level Architecture

### Multi-Layer Architecture

The project follows a clean architecture pattern with distinct layers:

- **`src/infrastructures/`** - Infrastructure concerns (database, integrations, reusable modules)
- **`src/modules/`** - Feature modules (auth, user, role, permission, etc.)
- **`src/shared/`** - Cross-cutting concerns (constants, utilities, interfaces)

### Feature Module Pattern

Each feature module follows consistent structure:

```
module-name/
├── controllers/     # API endpoints with versioning (v1 suffix)
├── services/        # Business logic layer
├── repositories/    # Data access layer extending TypeORM Repository
├── dtos/
│   ├── requests/    # Input validation with Zod schemas
│   └── responses/   # Output transformation with static methods
└── module.ts        # NestJS module definition
```

### Database Architecture

- **TypeORM** with PostgreSQL and snake_case naming strategy
- **Entities** implement interfaces from `infrastructures/databases/interfaces/`
- **Custom Repository Pattern** - repositories extend TypeORM Repository and include business queries
- **Migration Path** - migrations stored in `src/infrastructures/databases/migrations/`
- **Seeding** - seeders in `src/infrastructures/databases/seeds/` with dependency tracking

### Authentication & Authorization System

Complex RBAC system spanning multiple components:

- **JWT Strategy** - Access + refresh token pattern in `modules/auth/shared/strategy/`
- **Permission Guard** - Resource-operation based permissions in `shared/guards/permission.guard.ts`
- **Permission Decorator** - `@Permission(RESOURCE.USER, [OPERATION.VIEW])` on controllers
- **User Permissions** - Resolved through `user.roles[].permissions[]` relationship chain
- **Permission Utils** - Slug generation and validation in `shared/utils/permission.util.ts`

### Infrastructure Modules

Reusable services with factory patterns:

**Storage Module** (`infrastructures/modules/storage/`):

- Factory service supporting local, MinIO, and Google Cloud Storage
- Driver selection via `STORAGE_DRIVER` environment variable

**Export/Import Modules** (`infrastructures/modules/export-data/`, `import-data/`):

- Strategy pattern for CSV, Excel, and PDF processing
- Template-based exports with Handlebars
- Validation pipelines for imports

**Queue Module** (`infrastructures/modules/queue/`):

- BullMQ integration with Redis
- Background job processing for emails and heavy operations
- Exponential backoff retry strategy

**Mail Module** (`infrastructures/modules/mail/`):

- Nodemailer with Handlebars template engine
- Templates stored in `templates/` directory
- Queue integration for async email sending

## Module Standardization Rules

### Naming Conventions

**File Naming:**
- Use kebab-case with descriptive suffixes
- Include version suffix for API versioning: `-v1`
- Examples: `user-create-v1.request.ts`, `user-v1.controller.ts`, `user-v1.service.ts`

**Class Naming:**
- Use PascalCase with version suffix
- Examples: `UserV1Controller`, `UserV1Service`, `UserV1Repository`

**Method Naming:**
- Use camelCase with descriptive action verbs
- Examples: `findOneById()`, `updatePasswordById()`, `softDeleteById()`

### File Structure Requirements

Every feature module MUST follow this exact structure:

```
module-name/
├── controllers/
│   └── module-name-v1.controller.ts          # API endpoints with versioning
├── services/
│   └── module-name-v1.service.ts             # Business logic layer
├── repositories/
│   ├── module-name-v1.repository.ts          # Primary entity repository
│   └── related-entity-v1.repository.ts       # Related entity repositories
├── dtos/
│   ├── requests/
│   │   ├── module-name-create-v1.request.ts  # Creation request DTO
│   │   ├── module-name-update-v1.request.ts  # Update request DTO
│   │   ├── module-name-paginate-v1.request.ts # Pagination request DTO
│   │   └── module-name-*.request.ts          # Other operation-specific DTOs
│   └── responses/
│       └── module-name-v1.response.ts        # Response transformation DTOs
├── templates/                                 # Optional: Import/export templates
│   ├── csv/
│   └── excel/
└── module-name.module.ts                      # NestJS module definition
```

### Controller Standards

**Route Structure:**
```typescript
@Controller({
    path: 'users',        // Resource name in plural
    version: '1',         // API version
})
@ApiBearerAuth(JwtAuthTypeEnum.AccessToken)
export class UserV1Controller {
    // Implementation
}
```

**Standard CRUD Endpoints:**
```typescript
// GET /v1/users - List with pagination
@Permission(RESOURCE.USER, [ACTION.VIEW])
@Get()
async paginate(@Query() paginationDto: UserPaginateV1Request): Promise<IPaginationResponse<UserV1Response>>

// POST /v1/users - Create new resource
@Permission(RESOURCE.USER, [ACTION.CREATE])
@Post()
async create(@Body() dataCreateDto: UserCreateV1Request): Promise<IBasicResponse<UserDetailV1Response>>

// GET /v1/users/:id - Get single resource
@Permission(RESOURCE.USER, [ACTION.VIEW])
@Get(':userId')
async getById(@Param('userId') userId: string): Promise<IBasicResponse<UserDetailV1Response>>

// PATCH /v1/users/:id - Update resource
@Permission(RESOURCE.USER, [ACTION.UPDATE])
@Patch(':userId')
async updateById(@Param('userId') userId: string, @Body() dataUser: UserUpdateV1Request): Promise<IBasicResponse<UserDetailV1Response>>

// DELETE /v1/users/:id - Soft delete resource
@Permission(RESOURCE.USER, [ACTION.DELETE])
@Delete(':userId')
async deleteByid(@Param('userId') userId: string): Promise<IBasicResponse<boolean | null>>
```

**Documentation Requirements:**
- Every controller method MUST include JSDoc comments
- Include @param, @returns, and @throws annotations
- Provide usage examples for complex operations

### DTO Standards

**Request DTO Pattern:**
```typescript
import { ERROR_MESSAGE_CONSTANT } from 'src/shared/constants/error-message.constant';
import { ZodUtils } from 'src/shared/utils/zod.util';
import { z } from 'zod';

export const UserCreateV1Schema = z.object({
    fullname: z.string().min(1, {
        message: ERROR_MESSAGE_CONSTANT.FieldRequiredWithName('Fullname'),
    }),
    email: z.string().email(),
    // Additional validations...
});

export class UserCreateV1Request extends ZodUtils.createCamelCaseDto(
    UserCreateV1Schema,
) {}
```

**Response DTO Pattern:**
```typescript
export class UserV1Response {
    id: string;
    fullName: string;
    email: string;

    static FromEntity(entity: IUser): UserV1Response {
        return {
            id: entity.id,
            fullName: entity.fullName,
            email: entity.email,
        };
    }

    static MapEntities(entities: IUser[]): UserV1Response[] {
        return entities.map((entity) => this.FromEntity(entity));
    }
}

// For detailed responses with relations
export class UserDetailV1Response extends UserV1Response {
    roles?: RoleDetailV1Response[];

    static FromEntity(entity: IUser): UserDetailV1Response {
        return {
            id: entity.id,
            fullName: entity.fullName,
            email: entity.email,
            roles: entity.roles 
                ? RoleDetailV1Response.MapEntities(entity.roles) 
                : [],
        };
    }
}
```

### Repository Standards

**Custom Repository Pattern:**
```typescript
@Injectable()
export class UserV1Repository extends Repository<IUser> {
    constructor(
        @InjectRepository(User)
        private readonly repo: Repository<IUser>,
    ) {
        super(repo.target, repo.manager, repo.queryRunner);
    }

    private readonly defaultRelations: string[] = [
        'roles',
        'roles.permissions',
    ];

    // Standard methods that every repository MUST implement
    async findOneByIdWithRelations(id: string, relations?: string[]): Promise<IUser | null>
    async findOneByIdOrFailWithRelations(id: string, relations?: string[]): Promise<IUser>
    async paginate(request: EntityPaginateV1Request): Promise<IPaginateData<IEntity>>
}
```

**Pagination Implementation:**
- Use `QueryFilterUtil` for search and filtering
- Use `QuerySortingUtil` for sorting
- Use `PaginationUtil` for offset calculation and metadata
- Define `ALLOWED_SORTS` map with database field mappings

### Service Standards

**Transaction Management:**
```typescript
async create(dataCreate: UserCreateV1Request): Promise<IUser> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
        const manager = queryRunner.manager;
        // Business logic here
        await queryRunner.commitTransaction();
        return result;
    } catch (error) {
        await queryRunner.rollbackTransaction();
        throw error;
    } finally {
        await queryRunner.release();
    }
}
```

**Standard Service Methods:**
- `create()` - Create new entity with validation
- `paginate()` - List entities with pagination
- `findOneById()` - Find single entity by ID
- `updateById()` - Update entity by ID
- `softDeleteById()` - Perform soft delete

**Validation Patterns:**
- Use `ZodValidationException` for business rule violations
- Validate related entity existence before operations
- Provide clear error messages with field paths

### Module Definition Standards

```typescript
@Module({
    imports: [
        TypeOrmModule.forFeature([PrimaryEntity, RelatedEntity]),
        RelatedModule,
        ImportDataModule,    // If import functionality needed
        ExportDataModule,    // If export functionality needed
    ],
    controllers: [EntityV1Controller],
    providers: [
        // Repositories
        EntityV1Repository,
        RelatedEntityV1Repository,
        
        // Services  
        EntityV1Service,
    ],
    exports: [
        // Export repositories and services for use by other modules
        EntityV1Repository,
        EntityV1Service,
    ],
})
export class EntityModule {}
```

## Key Patterns & Conventions

### API Versioning

- Controllers use `@Controller({ path: 'users', version: '1' })`
- All services, repositories, DTOs include `V1` suffix for future versioning

### Request/Response Flow

1. **Controller** validates with Zod schemas via `ZodValidationPipe`
2. **Service** contains business logic and transaction management
3. **Repository** handles data access with TypeORM QueryBuilder
4. **Response DTOs** transform entities using static `FromEntity()` and `MapEntities()` methods

**Complete Data Flow:**
```
HTTP Request
    ↓
Controller (Route + Permission Check)
    ↓
Request DTO (Zod Validation)
    ↓
Service (Business Logic + Transactions)
    ↓
Repository (Data Access + Relations)
    ↓
Service (Entity Processing)
    ↓
Response DTO (Entity Transformation)
    ↓
Controller (Standardized Response)
    ↓
HTTP Response
```

### Database Transactions

Services use TypeORM QueryRunner for complex operations:

```typescript
const queryRunner = this.dataSource.createQueryRunner();
await queryRunner.connect();
await queryRunner.startTransaction();
try {
    // operations
    await queryRunner.commitTransaction();
} catch (error) {
    await queryRunner.rollbackTransaction();
    throw error;
} finally {
    await queryRunner.release();
}
```

### Environment Configuration

- All config centralized in `src/config.ts`
- Environment variables with sensible defaults
- Type-safe configuration object exported as `config`

### Error Handling

- Global exception filter in `shared/filters/global-exception.filter.ts`
- Custom exceptions with consistent error response format
- Database constraint violations mapped to readable error messages

## Module-Specific Notes

### Auth Module

- Implements forgot password flow with email tokens
- Session management with device tracking
- Public routes marked with `@Public()` decorator to bypass JWT guard

### User Module

- Supports bulk import/export with Excel and CSV formats
- Password hashing handled automatically in entity `@BeforeInsert` hooks
- Soft delete implementation across all entities

### Permission System

- Resources and operations defined in `shared/constants/permission.constant.ts`
- Permission checking combines resource + operation into slugs (e.g., "user:view")
- Seeded with initial permissions in database seeders

## Docker Setup

- `docker-compose.yml` provides PostgreSQL, Redis, and Mailpit for development
- PostgreSQL 17, Redis 8.0.1, Mailpit for email testing
- Default credentials: postgres/Rahasia123, no Redis auth

## Documentation

- **Database Schema**: `docs/database.dbml` contains complete DBML schema definition
- **ERD**: Use `yarn dbdocs:publish` to publish database documentation (requires DBML setup)
