import { FileHelper, z } from '@start9labs/start-sdk'
import { sdk } from '../sdk'
import { defaultMqttUsername } from '../utils'

const shape = z.object({
  mqttUsername: z.string().catch(defaultMqttUsername),
  mqttPassword: z.string().catch(''),
  recorderPassword: z.string().catch(''),
})

export type Store = z.infer<typeof shape>

export const storeJson = FileHelper.json(
  { base: sdk.volumes.main, subpath: './store.json' },
  shape,
)
