/* eslint-disable no-console */
import { DataSource, In } from 'typeorm';
import { Seeder, SeederFactoryManager } from 'typeorm-extension';
import { ACTION } from '../../../shared/constants/permission.constant';
import { StringUtil } from '../../../shared/utils/string.util';
import { Action } from '../entities/action.entity';
import { IAction } from '../interfaces/action.interface';

export default class ActionSeeder implements Seeder {
    public async run(
        dataSource: DataSource,
        _: SeederFactoryManager,
    ): Promise<void> {
        const actionRepository = dataSource.getRepository(Action);

        const actionCodes = Object.values(ACTION);

        // Existing actions
        const existingActions = await actionRepository.find({
            where: {
                code: In(actionCodes),
            },
        });

        // Create Actions
        const actionsToCreate: Partial<IAction>[] = [];
        const actionsToUpdate: Action[] = [];

        for (const actionKey of actionCodes) {
            const name = StringUtil.slugToTitleCase(actionKey);
            const code = actionKey;

            const existingAction = existingActions.find(
                (action) => action.code === code,
            );

            if (!existingAction) {
                actionsToCreate.push({
                    code: code,
                    name: name,
                    isActive: true,
                });
            } else {
                // Update existing action
                existingAction.name = name;
                existingAction.isActive = true;
                actionsToUpdate.push(existingAction);
            }
        }

        if (actionsToUpdate.length > 0) {
            await actionRepository.save(actionsToUpdate);
            console.log(`Updated ${actionsToUpdate.length} actions.`);
        }

        if (actionsToCreate.length > 0) {
            await actionRepository.save(actionsToCreate);
            console.log(`Created ${actionsToCreate.length} actions.`);
        } else {
            console.log('No new actions to create.');
        }
    }
}
