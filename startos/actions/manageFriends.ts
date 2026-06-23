import { storeJson, User } from '../fileModels/store.json'
import { i18n } from '../i18n'
import { sdk } from '../sdk'

const { InputSpec, Value } = sdk

export const manageFriends = sdk.Action.withInput(
  'manage-friends',

  async ({ effects }) => {
    const users = (await storeJson.read((s) => s.users).const(effects)) || {}
    return {
      name: i18n('Manage Friends'),
      description: i18n(
        'For each user, choose which other users can be seen in their phone app.',
      ),
      warning: null,
      allowedStatuses: 'any',
      group: null,
      visibility: Object.keys(users).length > 1 ? 'enabled' : 'hidden',
    }
  },

  async ({ effects }) => {
    const users = (await storeJson.read((s) => s.users).once()) || {}
    const names = Object.keys(users)
    const spec: Record<string, ReturnType<typeof Value.multiselect>> = {}
    for (const name of names) {
      const others = names.filter((n) => n !== name)
      const values: Record<string, string> = Object.fromEntries(
        others.map((o) => [o, o]),
      )
      spec[name] = Value.multiselect({
        name,
        description: null,
        default: users[name].friends.filter((f) => others.includes(f)),
        values,
      })
    }
    return InputSpec.of(spec)
  },

  async () => undefined,

  async ({ effects, input }) => {
    const users = (await storeJson.read((s) => s.users).once()) || {}
    const next: Record<string, User> = {}
    for (const [name, user] of Object.entries(users)) {
      const chosen = (input as Record<string, string[]>)[name]
      next[name] = {
        ...user,
        friends: Array.isArray(chosen)
          ? chosen.filter((f) => f !== name && users[f])
          : user.friends,
      }
    }
    await storeJson.merge(effects, { users: next })
  },
)
