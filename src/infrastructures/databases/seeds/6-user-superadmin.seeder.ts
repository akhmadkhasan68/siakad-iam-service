/* eslint-disable no-console */
import * as fs from 'fs';
import { DataSource, In } from 'typeorm';
import { Seeder, SeederFactoryManager } from 'typeorm-extension';
import { UserTypeEnum } from '../../../shared/enums/user-type.enum';
import { Organization } from '../entities/organization.entity';
import { Role } from '../entities/role.entity';
import { UserCredentialPassword } from '../entities/user-credential-password.entity';
import { UserEmail } from '../entities/user-email.entity';
import { UserOrganization } from '../entities/user-organization.entity';
import { UserPhone } from '../entities/user-phone.entity';
import { UserRoles } from '../entities/user-roles.entity';
import { User } from '../entities/user.entity';

interface IUserSuperadmin {
    fullname: string;
    email: string;
    password: string;
    phone_number: string;
    organization_code: string;
}

export default class UserSuperadminSeeder implements Seeder {
    public async run(
        dataSource: DataSource,
        _: SeederFactoryManager,
    ): Promise<void> {
        const userRepository = dataSource.getRepository(User);
        const userEmailRepository = dataSource.getRepository(UserEmail);
        const userPhoneRepository = dataSource.getRepository(UserPhone);
        const credentialPasswordRepository = dataSource.getRepository(
            UserCredentialPassword,
        );
        const roleRepository = dataSource.getRepository(Role);
        const organizationRepository = dataSource.getRepository(Organization);
        const userOrganizationRepository =
            dataSource.getRepository(UserOrganization);
        const userRolesRepository = dataSource.getRepository(UserRoles);

        // Load user data
        const jsonData = fs.readFileSync(
            `${__dirname}/data/user-superadmin.json`,
            'utf-8',
        );
        const usersData = JSON.parse(jsonData) as IUserSuperadmin[];

        if (usersData.length === 0) {
            console.log('No users found in data file.');
            return;
        }

        // Load roles data
        const roles = await roleRepository.find();
        if (roles.length === 0) {
            console.log('No roles found. Please run Role seeder first.');
            return;
        }

        // Load Organizations
        const organizations = await organizationRepository.find();
        if (organizations.length === 0) {
            console.log(
                'No organizations found. Please run Organization seeder first.',
            );
            return;
        }

        // Check existing users by email
        const userEmails = usersData.map((user) => user.email);
        const existingEmails = await userEmailRepository.find({
            where: {
                email: In(userEmails),
            },
            relations: ['user'],
        });

        const existingEmailAddresses = existingEmails.map((e) => e.email);

        const queryRunner = dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            // Create Users
            const userToCreate: User[] = usersData
                .map((userData) => {
                    if (existingEmailAddresses.includes(userData.email)) {
                        console.log(
                            `User with email ${userData.email} already exists, skipping.`,
                        );
                        return null;
                    }

                    const user = userRepository.create({
                        email: userData.email,
                        fullName: userData.fullname,
                        type: UserTypeEnum.Operator,
                    });

                    return user;
                })
                .filter((user): user is User => user !== null);

            const createdUsers: User[] = [];
            if (userToCreate.length > 0) {
                createdUsers.push(
                    ...(await queryRunner.manager.save(userToCreate)),
                );
            }

            if (createdUsers.length === 0) {
                console.log('No new users created.');
                return;
            }

            // Create Users Emails
            const userEmailsToCreate: UserEmail[] = createdUsers
                .map((user) => {
                    const email = usersData.find(
                        (u) => u.email === user.email,
                    )!.email;

                    if (!email) {
                        return null;
                    }

                    return userEmailRepository.create({
                        email: email,
                        user,
                        isPrimary: true,
                    });
                })
                .filter((email): email is UserEmail => email !== null);

            if (userEmailsToCreate.length > 0) {
                await queryRunner.manager.save(userEmailsToCreate);
            }

            // Create Users Phone
            const userPhonesToCreate: UserPhone[] = createdUsers
                .map((user) => {
                    const phone = usersData.find(
                        (u) => u.email === user.email,
                    )!.phone_number;

                    if (!phone) {
                        return null;
                    }

                    return userPhoneRepository.create({
                        phoneE164: phone,
                        user,
                    });
                })
                .filter((phone): phone is UserPhone => phone !== null);

            if (userPhonesToCreate.length > 0) {
                await queryRunner.manager.save(userPhonesToCreate);
            }

            // Create Users Password
            const userPasswordsToCreate: UserCredentialPassword[] = createdUsers
                .map((user) => {
                    const password = usersData.find(
                        (u) => u.email === user.email,
                    )!.password;

                    if (!password) {
                        return null;
                    }

                    return credentialPasswordRepository.create({
                        password: password,
                        user,
                    });
                })
                .filter(
                    (password): password is UserCredentialPassword =>
                        password !== null,
                );

            if (userPasswordsToCreate.length > 0) {
                await queryRunner.manager.save(userPasswordsToCreate);
            }

            // Create User Organizations relationships
            const userOrganizationsToCreate: UserOrganization[] = createdUsers
                .map((user) => {
                    const userData = usersData.find(
                        (u) => u.email === user.email,
                    );
                    if (!userData?.organization_code) return null;

                    const userOrganization = organizations.find(
                        (o) => o.code === userData.organization_code,
                    );
                    if (!userOrganization) return null;

                    return userOrganizationRepository.create({
                        userId: user.id,
                        organizationId: userOrganization.id,
                        isDefault: true,
                    });
                })
                .filter(
                    (userOrg): userOrg is UserOrganization => userOrg !== null,
                );

            if (userOrganizationsToCreate.length > 0) {
                await queryRunner.manager.save(userOrganizationsToCreate);
            }

            // Create User Roles relationships
            const userRolesToCreate: UserRoles[] = [];
            for (const user of createdUsers) {
                const userData = usersData.find((u) => u.email === user.email);
                if (!userData) continue;

                const userOrganization = organizations.find(
                    (o) => o.code === userData.organization_code,
                );
                const isOrgUser = userOrganization != null;

                // Get appropriate roles
                const userRoles = isOrgUser
                    ? roles.filter((r) => r.organizationId != null)
                    : roles.filter((r) => r.organizationId == null);

                for (const role of userRoles) {
                    userRolesToCreate.push(
                        userRolesRepository.create({
                            userId: user.id,
                            roleId: role.id,
                            organizationId: userOrganization?.id,
                        }),
                    );
                }
            }

            if (userRolesToCreate.length > 0) {
                await queryRunner.manager.save(userRolesToCreate);
            }

            await queryRunner.commitTransaction();
        } catch (error) {
            await queryRunner.rollbackTransaction();
            console.error('Error creating superadmin users:', error);
            throw error;
        } finally {
            await queryRunner.release();
        }
    }
}
