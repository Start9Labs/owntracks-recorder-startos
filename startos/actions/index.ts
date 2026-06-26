import { sdk } from '../sdk'
import { addUser } from './addUser'
import { forgetTracks } from './forgetTracks'
import { manageFriends } from './manageFriends'
import { removeUser } from './removeUser'
import { resetUserPassword } from './resetUserPassword'
import { setWebUiPassword } from './setWebUiPassword'
import { userCredentials } from './userCredentials'

export const actions = sdk.Actions.of()
  .addAction(addUser)
  .addAction(userCredentials)
  .addAction(manageFriends)
  .addAction(resetUserPassword)
  .addAction(removeUser)
  .addAction(setWebUiPassword)
  .addAction(forgetTracks)
