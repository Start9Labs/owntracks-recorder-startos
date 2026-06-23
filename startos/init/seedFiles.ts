import { addUser } from '../actions/addUser'
import { storeJson } from '../fileModels/store.json'
import { i18n } from '../i18n'
import { sdk } from '../sdk'
import { getDefaultPassword } from '../utils'

export const seedFiles = sdk.setupOnInit(async (effects, kind) => {
  if (kind !== 'install') return

  await storeJson.merge(effects, {
    recorderPassword: getDefaultPassword(),
    users: {},
  })

  await sdk.action.createOwnTask(effects, addUser, 'important', {
    reason: i18n(
      'Add an MQTT user account for each person or device that will track location.',
    ),
  })
})
