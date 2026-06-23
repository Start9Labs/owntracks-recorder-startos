import { mqttCredentials } from '../actions/mqttCredentials'
import { storeJson } from '../fileModels/store.json'
import { i18n } from '../i18n'
import { sdk } from '../sdk'
import { defaultMqttUsername, getDefaultPassword } from '../utils'

export const seedFiles = sdk.setupOnInit(async (effects, kind) => {
  if (kind !== 'install') return

  await storeJson.merge(effects, {
    mqttUsername: defaultMqttUsername,
    mqttPassword: getDefaultPassword(),
    recorderPassword: getDefaultPassword(),
  })

  await sdk.action.createOwnTask(effects, mqttCredentials, 'important', {
    reason: i18n(
      'Save the MQTT username and password so your OwnTracks apps can connect.',
    ),
  })
})
