/* eslint-disable no-console */
import * as fs from 'fs';
import { DataSource, In } from 'typeorm';
import { Seeder, SeederFactoryManager } from 'typeorm-extension';
import { Organization } from '../entities/organization.entity';
import { IOrganization } from '../interfaces/organization.interface';

export default class OrganizationSeeder implements Seeder {
    public async run(
        dataSource: DataSource,
        _: SeederFactoryManager,
    ): Promise<void> {
        const organizationRepository = dataSource.getRepository(Organization);

        // Load organization data
        const jsonData = fs.readFileSync(
            `${__dirname}/data/organizations.json`,
            'utf-8',
        );
        const organizationsData = JSON.parse(jsonData) as IOrganization[];
        const organizationCodes = organizationsData.map((org) => org.code);

        // Check existing organizations
        const existingOrganizations = await organizationRepository.find({
            where: {
                code: In(organizationCodes),
            },
        });

        const organizationsToCreate: Partial<IOrganization>[] = [];
        const organizationsToUpdate: Organization[] = [];

        if (existingOrganizations.length > 0) {
            const existingCodes = existingOrganizations.map((org) => org.code);

            // Update existing organizations
            const existingToUpdate = existingOrganizations.map((org) => {
                const defaultOrg = organizationsData.find(
                    (d) => d.code === org.code,
                );
                if (defaultOrg) {
                    org.name = defaultOrg.name;
                    org.status = defaultOrg.status;
                }
                return org;
            });
            organizationsToUpdate.push(...existingToUpdate);

            // Find new organizations to create
            const newOrganizations = organizationsData.filter(
                (org) => !existingCodes.includes(org.code),
            );
            organizationsToCreate.push(...newOrganizations);
        } else {
            organizationsToCreate.push(...organizationsData);
        }

        if (organizationsToUpdate.length > 0) {
            await organizationRepository.save(organizationsToUpdate);
            console.log(
                `Updated ${organizationsToUpdate.length} organizations.`,
            );
        }

        if (organizationsToCreate.length > 0) {
            await organizationRepository.save(organizationsToCreate);
            console.log(
                `Created ${organizationsToCreate.length} organizations.`,
            );
        } else {
            console.log('No new organizations to create.');
        }
    }
}
