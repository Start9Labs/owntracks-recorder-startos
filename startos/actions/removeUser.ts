import { storeJson } from '../fileModels/store.json'
import { i18n } from '../i18n'
import { sdk } from '../sdk'

const { InputSpec, Value } = sdk

export const removeUser = sdk.Action.withInput(
  'remove-user',

  async ({ effects }) => {
    const users = (await storeJson.read((s) => s.users).const(effects)) || {}
    return {
      name: i18n('Remove MQTT User'),
      description: i18n(
        'Delete an MQTT account. The user can no longer connect and is removed from all friends lists.',
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
        description: i18n('The user account to remove.'),
        default: names[0] ?? '',
        values,
      }),
    })
  },

  async () => undefined,

  async ({ effects, input }) => {
    const users = (await storeJson.read((s) => s.users).once()) || {}
    if (!users[input.user]) return

    const next = Object.fromEntries(
      Object.entries(users)
        .filter(([name]) => name !== input.user)
        .map(([name, user]) => [
          name,
          { ...user, friends: user.friends.filter((f) => f !== input.user) },
        ]),
    )
    await storeJson.merge(effects, { users: next })
  },
)
