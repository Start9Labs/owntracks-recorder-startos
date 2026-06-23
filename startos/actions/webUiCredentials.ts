import { storeJson } from '../fileModels/store.json'
import { i18n } from '../i18n'
import { sdk } from '../sdk'
import { uiUsername } from '../utils'
import { credentialsResult } from './common'

export const webUiCredentials = sdk.Action.withoutInput(
  'web-ui-credentials',

  async () => ({
    name: i18n('Admin Web Map Credentials'),
    description: i18n('Show the admin username and password for the web map.'),
    warning: null,
    allowedStatuses: 'any',
    group: null,
    visibility: 'enabled',
  }),

  async ({ effects }) => {
    await sdk.action.clearTask(effects, 'owntracks-recorder:web-ui-credentials')
    const password =
      (await storeJson.read((s) => s.uiPassword).const(effects)) || ''
    return credentialsResult(
      i18n('Admin Web Map Login'),
      i18n(
        'Use these credentials to sign in to the admin web map. They are separate from your MQTT user accounts.',
      ),
      uiUsername,
      password,
    )
  },
)
