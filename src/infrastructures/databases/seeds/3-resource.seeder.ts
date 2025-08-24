/* eslint-disable no-console */
import { DataSource, In } from 'typeorm';
import { Seeder, SeederFactoryManager } from 'typeorm-extension';
import { RESOURCE } from '../../../shared/constants/permission.constant';
import { StringUtil } from '../../../shared/utils/string.util';
import { Resource } from '../entities/resource.entity';
import { IResource } from '../interfaces/resource.interface';

export default class ResourceSeeder implements Seeder {
    public async run(
        dataSource: DataSource,
        _: SeederFactoryManager,
    ): Promise<void> {
        const resourceRepository = dataSource.getRepository(Resource);

        const resourceCodes = Object.values(RESOURCE);
        
        // Existing Resources
        const existingResources = await resourceRepository.find({
            where: {
                code: In(resourceCodes),
            },
        });

        // Create Resources
        const resourcesToCreate: Partial<IResource>[] = [];
        const resourcesToUpdate: Resource[] = [];

        for (const resourceKey of resourceCodes) {
            const resourceName = StringUtil.slugToTitleCase(resourceKey);
            const resourceCode = resourceKey;

            const existingResource = existingResources.find(
                (resource) => resource.code === resourceCode,
            );

            if (!existingResource) {
                resourcesToCreate.push({
                    code: resourceCode,
                    name: resourceName,
                    isActive: true,
                });
            } else {
                // Update existing resource
                existingResource.name = resourceName;
                existingResource.isActive = true;
                resourcesToUpdate.push(existingResource);
            }
        }

        if (resourcesToUpdate.length > 0) {
            await resourceRepository.save(resourcesToUpdate);
            console.log(`Updated ${resourcesToUpdate.length} resources.`);
        }

        if (resourcesToCreate.length > 0) {
            await resourceRepository.save(resourcesToCreate);
            console.log(`Created ${resourcesToCreate.length} resources.`);
        } else {
            console.log('No new resources to create.');
        }
    }
}
