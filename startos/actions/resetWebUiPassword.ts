import { storeJson } from '../fileModels/store.json'
import { i18n } from '../i18n'
import { sdk } from '../sdk'
import { getDefaultPassword, uiUsername } from '../utils'
import { credentialsResult } from './common'

export const resetWebUiPassword = sdk.Action.withoutInput(
  'reset-web-ui-password',

  async () => ({
    name: i18n('Reset Admin Web Map Password'),
    description: i18n('Generate a new random admin password for the web map.'),
    warning: i18n('After resetting, sign in again with the new password.'),
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
