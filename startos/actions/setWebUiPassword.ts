import { storeJson } from '../fileModels/store.json'
import { i18n } from '../i18n'
import { sdk } from '../sdk'
import { getDefaultPassword, uiUsername } from '../utils'
import { credentialsResult } from './common'

export const setWebUiPassword = sdk.Action.withoutInput(
  'set-web-ui-password',

  async ({ effects }) => ({
    name: i18n('Set Admin Web Map Password'),
    description: i18n(
      'Generate a new admin password for the web map. The username is always "admin".',
    ),
    warning: (await storeJson.read((s) => s.uiPassword).const(effects))
      ? i18n(
          'This replaces the current admin web map password. The old password stops working.',
        )
      : null,
    allowedStatuses: 'any',
    group: null,
    visibility: 'enabled',
  }),

  async ({ effects }) => {
    const password = getDefaultPassword()
    await storeJson.merge(effects, { uiPassword: password })
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
