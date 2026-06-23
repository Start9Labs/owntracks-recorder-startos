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
  'Web Interface': 7,
  'The web interface is ready': 8,
  'The web interface is not ready': 9,

  // interfaces.ts
  'Web UI': 10,
  'The OwnTracks web map and dashboard': 11,
  'The MQTT endpoint your OwnTracks apps publish location updates to': 12,

  // actions (shared)
  Username: 13,
  Password: 14,
  'OwnTracks MQTT Credentials': 15,
  'Enter these in the OwnTracks app under Settings → Connection, along with your server address and port.': 16,
  User: 17,

  // addUser
  'Add MQTT User': 18,
  'Create a new MQTT account for a person or device. A random password is generated and shown once.': 19,
  'A short, lowercase name for the person or device (letters, numbers, - and _).': 20,

  // removeUser
  'Remove MQTT User': 21,
  'Delete an MQTT account. The user can no longer connect and is removed from all friends lists.': 22,
  'The user account to remove.': 23,

  // userCredentials
  'User Credentials': 24,
  'Show the username and password for an existing MQTT account.': 25,
  'The user account to show.': 26,

  // resetUserPassword
  'Reset User Password': 27,
  'Generate a new random password for an existing MQTT account. The user must update their app afterward.': 28,
  'The user account to reset.': 29,
  'Existing apps for this user will be disconnected until updated with the new password.': 30,

  // manageFriends
  'Manage Friends': 31,
  'For each user, choose which other users can be seen in their phone app.': 32,

  // init
  'Add an MQTT user account for each person or device that will track location.': 33,
} as const

/**
 * Plumbing. DO NOT EDIT.
 */
export type I18nKey = keyof typeof dict
export type LangDict = Record<(typeof dict)[I18nKey], string>
export default dict
