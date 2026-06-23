import { storeJson } from '../fileModels/store.json'
import { i18n } from '../i18n'
import { sdk } from '../sdk'
import { getDefaultPassword, isValidUsername, usernamePattern } from '../utils'
import { credentialsResult } from './common'

const { InputSpec, Value } = sdk

const inputSpec = InputSpec.of({
  username: Value.text({
    name: i18n('Username'),
    description: i18n(
      'A short, lowercase name for the person or device (letters, numbers, - and _).',
    ),
    required: true,
    default: null,
    patterns: [
      {
        regex: usernamePattern,
        description: i18n(
          'A short, lowercase name for the person or device (letters, numbers, - and _).',
        ),
      },
    ],
  }),
})

export const addUser = sdk.Action.withInput(
  'add-user',

  async () => ({
    name: i18n('Add MQTT User'),
    description: i18n(
      'Create a new MQTT account for a person or device. A random password is generated and shown once.',
    ),
    warning: null,
    allowedStatuses: 'any',
    group: null,
    visibility: 'enabled',
  }),

  inputSpec,

  async () => undefined,

  async ({ effects, input }) => {
    const username = input.username.trim()
    if (!isValidUsername(username)) {
      throw new Error(`Invalid username: ${username}`)
    }

    const users = (await storeJson.read((s) => s.users).const(effects)) || {}
    if (users[username]) {
      throw new Error(`User already exists: ${username}`)
    }

    const password = getDefaultPassword()
    await storeJson.merge(effects, {
      users: { ...users, [username]: { password, friends: [] } },
    })
    await sdk.action.clearTask(effects, 'owntracks-recorder:add-user')

    return credentialsResult(username, password)
  },
)
