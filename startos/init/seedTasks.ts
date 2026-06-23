import { addUser } from '../actions/addUser'
import { i18n } from '../i18n'
import { sdk } from '../sdk'

// Runs after the actions are registered so the task resolves to a real action.
export const seedTasks = sdk.setupOnInit(async (effects, kind) => {
  if (kind !== 'install') return

  await sdk.action.createOwnTask(effects, addUser, 'important', {
    reason: i18n(
      'Add an MQTT user account for each person or device that will track location.',
    ),
  })
})
