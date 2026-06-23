export const DEFAULT_LANG = 'en_US'

const dict = {
  // main.ts
  'Starting OwnTracks Recorder': 0,
  'MQTT Broker': 1,
  'The MQTT broker is ready': 2,
  'The MQTT broker is not ready': 3,
  Recorder: 4,
  'The recorder is ready': 5,
  'The recorder is not ready': 6,

  // interfaces.ts
  'The MQTT endpoint your OwnTracks apps publish location updates to': 7,

  // actions (shared)
  Username: 8,
  Password: 9,
  'OwnTracks MQTT Credentials': 10,
  'Enter these in the OwnTracks app under Settings → Connection, along with your server address and port.': 11,
  User: 12,

  // addUser
  'Add MQTT User': 13,
  'Create a new MQTT account for a person or device. A random password is generated and shown once.': 14,
  'A short, lowercase name for the person or device (letters, numbers, - and _).': 15,

  // removeUser
  'Remove MQTT User': 16,
  'Delete an MQTT account. The user can no longer connect and is removed from all friends lists.': 17,
  'The user account to remove.': 18,

  // userCredentials
  'User Credentials': 19,
  'Show the username and password for an existing MQTT account.': 20,
  'The user account to show.': 21,

  // resetUserPassword
  'Reset User Password': 22,
  'Generate a new random password for an existing MQTT account. The user must update their app afterward.': 23,
  'The user account to reset.': 24,
  'Existing apps for this user will be disconnected until updated with the new password.': 25,

  // manageFriends
  'Manage Friends': 26,
  'For each user, choose which other users can be seen in their phone app.': 27,

  // init
  'Add an MQTT user account for each person or device that will track location.': 28,

  // main.ts (frontend) + admin web map interface
  'Admin Web Map': 29,
  'Unpermissioned admin view showing every device on the server. Protected by a separate admin password, not the MQTT credentials.': 30,
  'The admin web map is ready': 31,
  'The admin web map is not ready': 32,

  // web UI actions
  'Admin Web Map Credentials': 33,
  'Show the admin username and password for the web map.': 34,
  'Reset Admin Web Map Password': 35,
  'Generate a new random admin password for the web map.': 36,
  'After resetting, sign in again with the new password.': 37,
  'Admin Web Map Login': 38,
  'Use these credentials to sign in to the admin web map. They are separate from your MQTT user accounts.': 39,
  'Save the admin password for the web map (separate from MQTT accounts).': 40,

  // disabled-action reasons
  'No MQTT users exist yet.': 41,
  'Add at least two users to manage friends.': 42,
} as const

/**
 * Plumbing. DO NOT EDIT.
 */
export type I18nKey = keyof typeof dict
export type LangDict = Record<(typeof dict)[I18nKey], string>
export default dict
