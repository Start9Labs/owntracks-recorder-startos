import { storeJson } from '../fileModels/store.json'
import { i18n } from '../i18n'
import { sdk } from '../sdk'
import { defaultMqttUsername, getDefaultPassword } from '../utils'

export const resetMqttPassword = sdk.Action.withoutInput(
  'reset-mqtt-password',

  async () => ({
    name: i18n('Reset MQTT Password'),
    description: i18n(
      'Generate a new random password for the MQTT account used by your OwnTracks apps. You must update the password in each app afterward.',
    ),
    warning: i18n(
      'Existing apps will be disconnected until you update them with the new password.',
    ),
    allowedStatuses: 'any',
    group: null,
    visibility: 'enabled',
  }),

  async ({ effects }) => {
    const mqttPassword = getDefaultPassword()
    await storeJson.merge(effects, { mqttPassword })

    const store = await storeJson.read().const(effects)
    const username = store?.mqttUsername || defaultMqttUsername

    return {
      version: '1',
      title: i18n('OwnTracks MQTT Credentials'),
      message: i18n(
        'Enter these in the OwnTracks app under Settings → Connection, along with your server address and port.',
      ),
      result: {
        type: 'group',
        value: [
          {
            type: 'single',
            name: i18n('Username'),
            description: null,
            value: username,
            masked: false,
            copyable: true,
            qr: false,
          },
          {
            type: 'single',
            name: i18n('Password'),
            description: null,
            value: mqttPassword,
            masked: true,
            copyable: true,
            qr: false,
          },
        ],
      },
    }
  },
)
