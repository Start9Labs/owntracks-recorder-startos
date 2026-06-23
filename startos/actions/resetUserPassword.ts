import { storeJson } from '../fileModels/store.json'
import { i18n } from '../i18n'
import { sdk } from '../sdk'
import { getDefaultPassword } from '../utils'
import { credentialsResult } from './common'

const { InputSpec, Value } = sdk

export const resetUserPassword = sdk.Action.withInput(
  'reset-user-password',

  async ({ effects }) => {
    const users = (await storeJson.read((s) => s.users).const(effects)) || {}
    return {
      name: i18n('Reset User Password'),
      description: i18n(
        'Generate a new random password for an existing MQTT account. The user must update their app afterward.',
      ),
      warning: i18n(
        'Existing apps for this user will be disconnected until updated with the new password.',
      ),
      allowedStatuses: 'any',
      group: null,
      visibility: Object.keys(users).length ? 'enabled' : 'hidden',
    }
  },

  async ({ effects }) => {
    const users = (await storeJson.read((s) => s.users).once()) || {}
    const names = Object.keys(users)
    const values: Record<string, string> = Object.fromEntries(
      names.map((n) => [n, n]),
    )
    return InputSpec.of({
      user: Value.select({
        name: i18n('User'),
        description: i18n('The user account to reset.'),
        default: names[0] ?? '',
        values,
      }),
    })
  },

  async () => undefined,

  async ({ effects, input }) => {
    const users = (await storeJson.read((s) => s.users).once()) || {}
    const user = users[input.user]
    if (!user) throw new Error(`No such user: ${input.user}`)

    const password = getDefaultPassword()
    await storeJson.merge(effects, {
      users: { ...users, [input.user]: { ...user, password } },
    })
    return credentialsResult(
      i18n('OwnTracks MQTT Credentials'),
      i18n(
        'Enter these in the OwnTracks app under Settings → Connection, along with your server address and port.',
      ),
      input.user,
      password,
    )
  },
)
