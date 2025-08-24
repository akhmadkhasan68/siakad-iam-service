/* eslint-disable no-console */
import { DataSource, IsNull } from 'typeorm';
import { Seeder, SeederFactoryManager } from 'typeorm-extension';
import { RoleEnum } from '../../../shared/enums/role.enum';
import { Permission } from '../entities/permission.entity';
import { Role } from '../entities/role.entity';

export default class RolePermissionSeeder implements Seeder {
    public async run(
        dataSource: DataSource,
        _: SeederFactoryManager,
    ): Promise<void> {
        const permissionRepository = dataSource.getRepository(Permission);
        const roleRepository = dataSource.getRepository(Role);

        // Find SuperAdmin role (global role with no organizationId)
        const superAdminRole = await roleRepository.findOne({
            where: {
                code: RoleEnum.SuperAdmin,
                organizationId: IsNull(),
            },
            relations: ['permissions'],
        });

        if (!superAdminRole) {
            console.log(
                'SuperAdmin role not found. Please run Role seeder first.',
            );
            return;
        }

        const permissions = await permissionRepository.find();

        if (permissions.length === 0) {
            console.log(
                'No permissions found. Please run Permission seeder first.',
            );
            return;
        }

        // Check if SuperAdmin already has all permissions
        const currentPermissionIds =
            superAdminRole.permissions?.map((p) => p.id) || [];

        const newPermissions = permissions.filter(
            (p) => !currentPermissionIds.includes(p.id),
        );

        if (newPermissions.length > 0) {
            // Add all permissions to SuperAdmin role
            superAdminRole.permissions = permissions;
            await roleRepository.save(superAdminRole);
            console.log(
                `Added ${newPermissions.length} permissions to SuperAdmin role.`,
            );
        } else {
            console.log('SuperAdmin role already has all permissions.');
        }

        // You can add logic here for other roles if needed
        // For example, Admin role might get a subset of permissions
    }
}
