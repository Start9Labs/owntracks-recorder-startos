import { storeJson } from '../fileModels/store.json'
import { i18n } from '../i18n'
import { sdk } from '../sdk'
import { defaultMqttUsername } from '../utils'

export const mqttCredentials = sdk.Action.withoutInput(
  'mqtt-credentials',

  async () => ({
    name: i18n('MQTT Credentials'),
    description: i18n(
      'Show the username and password your OwnTracks apps use to connect to the MQTT broker.',
    ),
    warning: null,
    allowedStatuses: 'any',
    group: null,
    visibility: 'enabled',
  }),

  async ({ effects }) => {
    await sdk.action.clearTask(effects, 'owntracks-recorder:mqtt-credentials')

    const store = await storeJson.read().const(effects)
    const username = store?.mqttUsername || defaultMqttUsername
    const password = store?.mqttPassword || ''

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
            value: password,
            masked: true,
            copyable: true,
            qr: false,
          },
        ],
      },
    }
  },
)
