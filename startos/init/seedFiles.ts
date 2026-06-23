import { storeJson } from '../fileModels/store.json'
import { sdk } from '../sdk'
import { getDefaultPassword } from '../utils'

// Seeds the internal recorder↔broker password on install. The user-facing admin
// web-map password is NOT seeded here — the user sets it via the setWebUiPassword
// critical task (see watchWebUiPassword) before the service can start.
export const seedFiles = sdk.setupOnInit(async (effects, kind) => {
  if (kind === 'install') {
    await storeJson.merge(effects, {
      recorderPassword: getDefaultPassword(),
    })
  } else {
    await storeJson.merge(effects, {})
  }
})
