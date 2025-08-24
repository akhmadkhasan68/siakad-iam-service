# SIAKAD - IAM Service

Identity and Access Management microservice built with NestJS, featuring complete RBAC system with users, roles, permissions, and multi-organization support.

# Table of Contents

- [SIAKAD - IAM Service](#siakad---iam-service)
- [Table of Contents](#table-of-contents)
- [Tech Stack:](#tech-stack)
- [Project Installation](#project-installation)
    - [Quick Start:](#quick-start)
    - [ESLint Config](#eslint-config)
    - [Husky Config (If failed only)](#husky-config-if-failed-only)
    - [Setup Sentry](#setup-sentry)
    - [VSCode Extentions](#vscode-extentions)
- [Database](#database)
    - [Database Commands:](#database-commands)
    - [DB Schema ERD:](#db-schema-erd)
    - [Published Edited DBDOCS Commands:](#published-edited-dbdocs-commands)
- [Project Anatomy](#project-anatomy)

# Tech Stack:

- NestJS v11
- NodeJS LTS v22
- Yarn v1.22.22
- PostgreSQL 17.4

# Project Installation

- Install NodeJS LTS v22 (recommended to install [NVM](https://github.com/nvm-sh/nvm))
- Create Database
- Copy file `.env.example` to `.env` and adjust the configuration `cp .env.example .env`
- Run `yarn install`
- **Install wkhtmltopdf (required for PDF export):**
    - Linux: `sudo apt-get install wkhtmltopdf`
    - MacOS: `brew install wkhtmltopdf`
    - Windows: Download from [wkhtmltopdf.org](https://wkhtmltopdf.org/downloads.html)
- Run `yarn migrate`
- Run `yarn seed:run`

## Quick Start:

- Run `yarn build`
- Run `yarn start:dev` (local) or `yarn start:prod` (production)

## ESLint Config

- If you want to make config changes, edit `.eslintrc.json` then run `npx @eslint/migrate-config .eslintrc.json`
- Do not edit `eslint.config.mjs` manually

## Husky Config (If failed only)

- Run npx husky init
- Open/Create file `~/.config/husky/init.sh` (or` ~/.huskyrc` in Husky versions < v9) :

```sh
export NVM_DIR="$HOME/.nvm/nvm.sh"
. "$(dirname $NVM_DIR)/nvm.sh"

export NVM_DIR="$HOME/.nvm"
a=$(nvm ls | grep 'node')
b=${a#*(-> }
v=${b%%[)| ]*}

export PATH="$NVM_DIR/versions/node/$v/bin:$PATH"
```

## Setup Sentry

## VSCode Extentions

- [Prettier - Code Formatter](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)
- [Eslint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)

# Database

## Database Commands:

| Command                                  | Description                                              |
| ---------------------------------------- | -------------------------------------------------------- |
| `yarn migrate`                           | Create tables                                            |
| `yarn migrate:generate [migration_name]` | Generate migration add or changes the entities directory |
| `yarn seed:run [seeder_file_name.ts]`    | Run the specific seeder                                  |
| `yarn seed:run:all`                      | Run all seeder                                           |
| `yarn migrate:revert`                    | Revert migration tables                                  |

## DB Schema ERD:

We use DBML to create and publish the ERD documentation. Visit [here](https://www.dbml.org/home/#dbdiagram) to show you how to (official documentation)

## Published Edited DBDOCS Commands:

- Run `yarn dbdocs:publish`

# Project Anatomy

This project follows a **Clean Architecture** pattern with three distinct layers, ensuring separation of concerns and maintainability.

## Root Structure

```
iam-service/
├── src/                    # Application source code
├── docs/                   # Documentation (database schema, ERD)
├── docker-compose.yml      # Local development environment
├── CLAUDE.md              # AI assistant instructions
├── package.json           # Dependencies and scripts
└── tsconfig.json          # TypeScript configuration
```

## Three-Layer Architecture

### 1. Infrastructure Layer (`src/infrastructures/`)

Handles external dependencies and technical concerns:

```
infrastructures/
├── databases/
│   ├── entities/          # TypeORM entities with interfaces
│   ├── interfaces/        # Entity interface definitions
│   ├── migrations/        # Database schema migrations
│   └── seeds/             # Initial data and seeders
├── modules/
│   ├── storage/           # Multi-driver storage (Local, MinIO, GCS)
│   ├── mail/              # Email service with templates
│   ├── queue/             # Background job processing (BullMQ + Redis)
│   ├── export-data/       # CSV, Excel, PDF export strategies
│   └── import-data/       # Data import and validation
└── interceptors/          # Global response transformation
```

### 2. Feature Modules (`src/modules/`)

Business logic organized by domain:

```
modules/
├── auth/                  # Authentication & JWT management
├── user/                  # User management with import/export
├── organization/          # Multi-tenant organization support
├── role/                  # Role-based access control
├── permission/            # Granular permissions system
├── group/                 # User grouping functionality
├── session/               # User session tracking
├── token/                 # JWT keys and token management
└── health/                # Application health checks
```

**Each feature module follows consistent structure:**

```
module-name/
├── controllers/
│   └── module-name-v1.controller.ts     # API endpoints (versioned)
├── services/
│   └── module-name-v1.service.ts        # Business logic
├── repositories/
│   └── module-name-v1.repository.ts     # Data access layer
├── dtos/
│   ├── requests/                         # Input validation (Zod schemas)
│   └── responses/                        # Output transformation
├── templates/                            # Import/export templates (optional)
└── module-name.module.ts                 # NestJS module definition
```

### 3. Shared Layer (`src/shared/`)

Cross-cutting concerns used across modules:

```
shared/
├── constants/             # Application constants and messages
├── enums/                 # Shared enumerations
├── interfaces/            # Common interfaces and types
├── dtos/                  # Reusable DTOs (pagination, etc.)
├── utils/                 # Helper utilities
├── filters/               # Global exception handling
└── exceptions/            # Custom exception classes
```

## Key Architectural Patterns

### 🏗️ **Clean Architecture**

- **Controllers** → Handle HTTP requests/responses
- **Services** → Contain business logic and orchestration
- **Repositories** → Manage data access and queries
- **Entities** → Define database structure with TypeORM

### 🔐 **RBAC System**

- **Resources + Actions** → Generate granular permissions
- **Roles** → Group permissions for easy assignment
- **Users** → Assigned roles within organizations
- **Permission Guard** → Validates access on API endpoints

### 🏭 **Factory Pattern**

- **Storage Factory** → Switches between Local/MinIO/GCS
- **Queue Factory** → Manages different job types
- **Export/Import Factory** → Handles CSV/Excel/PDF processing

### 📝 **Repository Pattern**

```typescript
// Custom repositories extend TypeORM with business queries
@Injectable()
export class UserV1Repository extends Repository<IUser> {
    async findOneByIdWithRelations(id: string): Promise<IUser | null>;
    async paginate(
        request: UserPaginateV1Request,
    ): Promise<IPaginateData<IUser>>;
}
```

### 🎯 **API Versioning**

- All endpoints versioned (`/v1/users`)
- Controllers, services, repositories include `V1` suffix
- Future versions can coexist without breaking changes

## Naming Conventions

| Component         | Pattern                           | Example                     |
| ----------------- | --------------------------------- | --------------------------- |
| **Controllers**   | `{module}-v1.controller.ts`       | `user-v1.controller.ts`     |
| **Services**      | `{module}-v1.service.ts`          | `user-v1.service.ts`        |
| **Repositories**  | `{module}-v1.repository.ts`       | `user-v1.repository.ts`     |
| **Request DTOs**  | `{module}-{action}-v1.request.ts` | `user-create-v1.request.ts` |
| **Response DTOs** | `{module}-v1.response.ts`         | `user-v1.response.ts`       |
| **Entities**      | `{name}.entity.ts`                | `user.entity.ts`            |
| **Interfaces**    | `{name}.interface.ts`             | `user.interface.ts`         |

## Database Architecture

- **TypeORM** with PostgreSQL and snake_case naming
- **Soft Delete** implemented across all entities
- **Base Entity** provides common fields (id, timestamps, deleted_at)
- **Interface-First** approach for type safety
- **Seeding System** with dependency management

## Development Features

- ✅ **Hot Reload** development server
- ✅ **ESLint + Prettier** code formatting
- ✅ **Husky** pre-commit hooks
- ✅ **Docker Compose** local environment
- ✅ **Import/Export** system with templates
- ✅ **Background Jobs** with queue processing
- ✅ **Multi-Storage** support (Local/Cloud)
- ✅ **Email Templates** with Handlebars
- ✅ **Global Exception** handling
- ✅ **API Documentation** ready
