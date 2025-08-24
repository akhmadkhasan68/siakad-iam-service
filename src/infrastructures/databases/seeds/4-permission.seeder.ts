/* eslint-disable no-console */
import { DataSource } from 'typeorm';
import { Seeder, SeederFactoryManager } from 'typeorm-extension';
import { PERMISSION_RESOURCE_OPERATION } from '../../../shared/constants/permission.constant';
import { Action } from '../entities/action.entity';
import { Permission } from '../entities/permission.entity';
import { Resource } from '../entities/resource.entity';
import { IPermission } from '../interfaces/permission.interface';

export default class PermissionSeeder implements Seeder {
    public async run(
        dataSource: DataSource,
        _: SeederFactoryManager,
    ): Promise<void> {
        const permissionRepository = dataSource.getRepository(Permission);
        const actionRepository = dataSource.getRepository(Action);
        const resourceRepository = dataSource.getRepository(Resource);

        // Get all existing permissions
        const existingPermissions = await permissionRepository.find({
            relations: ['resource', 'action'],
        });

        // Get all actions and resources
        const existingActions = await actionRepository.find();
        const existingResources = await resourceRepository.find();

        if (existingActions.length === 0) {
            console.log('No actions found. Please run Action seeder first.');
            return;
        }

        if (existingResources.length === 0) {
            console.log('No resources found. Please run Resource seeder first.');
            return;
        }

        const permissionsToCreate: Partial<IPermission>[] = [];
        const permissionsToUpdate: Permission[] = [];

        // Create permissions based on PERMISSION_RESOURCE_OPERATION mapping
        for (const [resourceCode, operations] of Object.entries(PERMISSION_RESOURCE_OPERATION)) {
            const resource = existingResources.find(r => r.code === resourceCode);
            
            if (!resource) {
                console.log(`Resource not found: ${resourceCode}`);
                continue;
            }

            for (const operationCode of operations) {
                const action = existingActions.find(a => a.code === operationCode);
                
                if (!action) {
                    console.log(`Action not found: ${operationCode}`);
                    continue;
                }

                // Check if permission already exists
                const existingPermission = existingPermissions.find(p => 
                    p.resourceId === resource.id && p.actionId === action.id
                );

                if (!existingPermission) {
                    // Create new permission
                    const description = `${action.name} permission for ${resource.name}`;
                    
                    permissionsToCreate.push({
                        resourceId: resource.id,
                        actionId: action.id,
                        description: description,
                    });
                } else {
                    // Update existing permission description
                    const description = `${action.name} permission for ${resource.name}`;
                    existingPermission.description = description;
                    permissionsToUpdate.push(existingPermission);
                }
            }
        }

        if (permissionsToUpdate.length > 0) {
            await permissionRepository.save(permissionsToUpdate);
            console.log(`Updated ${permissionsToUpdate.length} permissions.`);
        }

        if (permissionsToCreate.length > 0) {
            await permissionRepository.save(permissionsToCreate);
            console.log(`Created ${permissionsToCreate.length} permissions.`);
        } else {
            console.log('No new permissions to create.');
        }
    }
}
