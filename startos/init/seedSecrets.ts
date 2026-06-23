import { storeJson } from '../fileModels/store.json'
import { sdk } from '../sdk'
import { getDefaultPassword } from '../utils'

// Must run before setInterfaces so the admin web-map gate binds with a real
// password on first install (setInterfaces reads uiPassword reactively).
export const seedSecrets = sdk.setupOnInit(async (effects, kind) => {
  if (kind !== 'install') return

  await storeJson.merge(effects, {
    recorderPassword: getDefaultPassword(),
    uiPassword: getDefaultPassword(),
    users: {},
  })
})
