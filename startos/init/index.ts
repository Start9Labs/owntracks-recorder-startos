import { actions } from '../actions'
import { restoreInit } from '../backups'
import { dependencies } from '../dependencies'
import { setInterfaces } from '../interfaces'
import { sdk } from '../sdk'
import { versionGraph } from '../versions'
import { seedFiles } from './seedFiles'
import { seedTasks } from './seedTasks'
import { watchWebUiPassword } from './watchWebUiPassword'

export const init = sdk.setupInit(
  restoreInit,
  versionGraph,
  seedFiles,
  setInterfaces,
  actions,
  dependencies,
  seedTasks,
  watchWebUiPassword,
)

export const uninit = sdk.setupUninit(versionGraph)
