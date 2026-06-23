import { storeJson } from '../fileModels/store.json'
import { i18n } from '../i18n'
import { sdk } from '../sdk'
import { credentialsResult } from './common'

const { InputSpec, Value } = sdk

export const userCredentials = sdk.Action.withInput(
  'user-credentials',

  async ({ effects }) => {
    const users = (await storeJson.read((s) => s.users).const(effects)) || {}
    return {
      name: i18n('User Credentials'),
      description: i18n(
        'Show the username and password for an existing MQTT account.',
      ),
      warning: null,
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
        description: i18n('The user account to show.'),
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
    return credentialsResult(input.user, user.password)
  },
)
