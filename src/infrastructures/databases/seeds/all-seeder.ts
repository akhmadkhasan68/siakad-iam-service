import { runSeeders } from 'typeorm-extension';
import dataSource from '../config';

(async () => {
    try {
        await dataSource.initialize();

        console.log(
            'Running seeders in the correct order for new DBML schema...',
        );

        await runSeeders(dataSource, {
            seeds: [
                // Seeding order is crucial for the new multi-tenant schema
                'src/infrastructures/databases/seeds/1-organization.seeder.ts',
                'src/infrastructures/databases/seeds/2-action.seeder.ts',
                'src/infrastructures/databases/seeds/3-resource.seeder.ts',
                'src/infrastructures/databases/seeds/4-permission.seeder.ts',
                'src/infrastructures/databases/seeds/5-role.seeder.ts',
                'src/infrastructures/databases/seeds/6-role-permission.seeder.ts',
                'src/infrastructures/databases/seeds/6-user-superadmin.seeder.ts',
            ],
            factories: [
                'src/infrastructures/databases/factories/**/*{.factory.ts,.factory.js}',
            ],
        });

        console.log('All seeders completed successfully!');
        console.log('');
        console.log('Database has been seeded with:');
        console.log('- Organizations (DEFAULT, SIAKAD)');
        console.log('- Actions (view, create, update, delete, export, import)');
        console.log('- Resources (user, role, permission, log-activity)');
        console.log('- Permissions (resource + action combinations)');
        console.log('- Roles (SuperAdmin global, other organization-scoped)');
        console.log('- SuperAdmin users with complete profile');
    } catch (error) {
        console.error('Error running seeders:', error);
        process.exit(1);
    } finally {
        await dataSource.destroy();
    }
})();
