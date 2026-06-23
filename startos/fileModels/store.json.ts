import { FileHelper, z } from '@start9labs/start-sdk'
import { sdk } from '../sdk'

const userSchema = z.object({
  password: z.string(),
  friends: z.array(z.string()).catch([]),
})

const shape = z.object({
  recorderPassword: z.string().catch(''),
  uiPassword: z.string().catch(''),
  users: z.record(z.string(), userSchema).catch({}),
})

export type User = z.infer<typeof userSchema>
export type Store = z.infer<typeof shape>

export const storeJson = FileHelper.json(
  { base: sdk.volumes.main, subpath: './store.json' },
  shape,
)
