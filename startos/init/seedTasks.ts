import { addUser } from '../actions/addUser'
import { webUiCredentials } from '../actions/webUiCredentials'
import { i18n } from '../i18n'
import { sdk } from '../sdk'

// Runs after the actions are registered so the tasks resolve to real actions.
export const seedTasks = sdk.setupOnInit(async (effects, kind) => {
  if (kind !== 'install') return

  await sdk.action.createOwnTask(effects, addUser, 'important', {
    reason: i18n(
      'Add an MQTT user account for each person or device that will track location.',
    ),
  })

  await sdk.action.createOwnTask(effects, webUiCredentials, 'important', {
    reason: i18n(
      'Save the admin password for the web map (separate from MQTT accounts).',
    ),
  })
})
