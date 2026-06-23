import { storeJson, User } from '../fileModels/store.json'
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
      visibility: Object.keys(users).length
        ? 'enabled'
        : { disabled: i18n('No MQTT users exist yet.') },
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
    const store = await storeJson.read().once()
    if (!store?.users[input.user]) return

    // Removal needs a full write(), not merge(): merge keeps record keys absent
    // from the patch, and passing `undefined` to delete one trips the users
    // `.catch({})` and wipes every account. Rebuild the map and overwrite.
    const users: Record<string, User> = {}
    for (const [name, user] of Object.entries(store.users)) {
      if (name === input.user) continue
      users[name] = {
        ...user,
        friends: user.friends.filter((f) => f !== input.user),
      }
    }
    await storeJson.write(effects, { ...store, users })
  },
)
