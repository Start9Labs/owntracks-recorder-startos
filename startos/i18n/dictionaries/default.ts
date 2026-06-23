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

  // actions
  'MQTT Credentials': 13,
  'Show the username and password your OwnTracks apps use to connect to the MQTT broker.': 14,
  'OwnTracks MQTT Credentials': 15,
  'Enter these in the OwnTracks app under Settings → Connection, along with your server address and port.': 16,
  Username: 17,
  Password: 18,
  'Reset MQTT Password': 19,
  'Generate a new random password for the MQTT account used by your OwnTracks apps. You must update the password in each app afterward.': 20,
  'Existing apps will be disconnected until you update them with the new password.': 21,

  // init
  'Save the MQTT username and password so your OwnTracks apps can connect.': 22,
} as const

/**
 * Plumbing. DO NOT EDIT.
 */
export type I18nKey = keyof typeof dict
export type LangDict = Record<(typeof dict)[I18nKey], string>
export default dict
