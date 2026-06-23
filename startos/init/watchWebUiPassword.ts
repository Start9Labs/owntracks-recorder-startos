import { setWebUiPassword } from '../actions/setWebUiPassword'
import { storeJson } from '../fileModels/store.json'
import { i18n } from '../i18n'
import { sdk } from '../sdk'

// Runs on every init and re-runs reactively when uiPassword changes. While no
// admin password is set, the web-map basic-auth gate stays locked (setInterfaces
// falls back to an empty password) and this critical task blocks the service
// from starting until the user runs it. Setting the password retracts the task.
export const watchWebUiPassword = sdk.setupOnInit(async (effects) => {
  const uiPassword = await storeJson.read((s) => s?.uiPassword).const(effects)
  if (!uiPassword) {
    await sdk.action.createOwnTask(effects, setWebUiPassword, 'critical', {
      reason: i18n(
        'Set the admin password for the web map before starting the service.',
      ),
    })
  }
})
