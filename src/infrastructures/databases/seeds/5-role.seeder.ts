/* eslint-disable no-console */
import * as fs from 'fs';
import { DataSource, IsNull } from 'typeorm';
import { Seeder, SeederFactoryManager } from 'typeorm-extension';
import { StringUtil } from '../../../shared/utils/string.util';
import { Organization } from '../entities/organization.entity';
import { Role } from '../entities/role.entity';
import { IRole } from '../interfaces/role.interface';

export default class RoleSeeder implements Seeder {
    public async run(
        dataSource: DataSource,
        _: SeederFactoryManager,
    ): Promise<void> {
        const roleRepository = dataSource.getRepository(Role);
        const organizationRepository = dataSource.getRepository(Organization);

        // Load role data
        const jsonData = fs.readFileSync(
            `${__dirname}/data/roles.json`,
            'utf-8',
        );
        const rolesData = JSON.parse(jsonData) as {
            code: string;
            name: string;
        }[];

        // Create global roles (no organization) and organization-scoped roles
        const rolesToCreate: Partial<IRole>[] = [];
        const rolesToUpdate: Role[] = [];

        // Process global roles
        for (const role of rolesData) {
            const existingRole = await roleRepository.findOne({
                where: {
                    code: role.code,
                    organizationId: IsNull(),
                },
            });

            const roleName = StringUtil.slugToTitleCase(role.code);
            const roleDescription = `${roleName} role (Global)`;

            if (!existingRole) {
                rolesToCreate.push({
                    code: role.code,
                    name: roleName,
                    description: roleDescription,
                    organizationId: null,
                });
            } else {
                existingRole.name = roleName;
                existingRole.description = roleDescription;
                rolesToUpdate.push(existingRole);
            }
        }

        // Process organization-scoped roles
        // Get Organizations
        const organizations = await organizationRepository.find();
        if (organizations.length > 0) {
            for (const org of organizations) {
                for (const role of rolesData) {
                    const existingRole = await roleRepository.findOne({
                        where: {
                            code: role.code,
                            organizationId: org.id,
                        },
                    });

                    const roleName = StringUtil.slugToTitleCase(
                        `${role.code} (${org.code})`,
                    );
                    const roleDescription = `${roleName} role for organization ${org.name}`;

                    if (!existingRole) {
                        rolesToCreate.push({
                            code: role.code,
                            name: roleName,
                            description: roleDescription,
                            organizationId: org.id,
                        });
                    } else {
                        existingRole.name = roleName;
                        existingRole.description = roleDescription;
                        rolesToUpdate.push(existingRole);
                    }
                }
            }
        }

        if (rolesToUpdate.length > 0) {
            await roleRepository.save(rolesToUpdate);
            console.log(`Updated ${rolesToUpdate.length} roles.`);
        }

        if (rolesToCreate.length > 0) {
            await roleRepository.save(rolesToCreate);
            console.log(`Created ${rolesToCreate.length} roles.`);
        } else {
            console.log('No new roles to create.');
        }
    }
}
