import { sdk } from '../sdk'
import { addUser } from './addUser'
import { manageFriends } from './manageFriends'
import { removeUser } from './removeUser'
import { resetUserPassword } from './resetUserPassword'
import { userCredentials } from './userCredentials'

export const actions = sdk.Actions.of()
  .addAction(addUser)
  .addAction(userCredentials)
  .addAction(manageFriends)
  .addAction(resetUserPassword)
  .addAction(removeUser)
