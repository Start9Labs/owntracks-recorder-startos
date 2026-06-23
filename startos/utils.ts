import { utils } from '@start9labs/start-sdk'
import { Store } from './fileModels/store.json'

export const recorderHttpPort = 8083
export const mqttPort = 1883
export const mqttsPort = 8883

export const defaultMqttUsername = 'owntracks'
export const recorderMqttUsername = 'recorder'

export const mosquittoConfigDir = '/mosquitto/config'
export const mosquittoPasswdFile = `${mosquittoConfigDir}/passwd`
export const mosquittoAclFile = `${mosquittoConfigDir}/acl`
export const mosquittoConfFile = `${mosquittoConfigDir}/mosquitto.conf`
export const mosquittoDataDir = '/mosquitto/data'

export const usernamePattern = '^[a-z0-9](?:[a-z0-9_-]*[a-z0-9])?$'

export function isValidUsername(name: string): boolean {
  return (
    name !== recorderMqttUsername && new RegExp(usernamePattern).test(name)
  )
}

export function getDefaultPassword(): string {
  return utils.getDefaultString({ charset: 'a-z,A-Z,0-9', len: 24 })
}

export function mosquittoConfig(): string {
  return `per_listener_settings false
listener ${mqttPort}
allow_anonymous false
password_file ${mosquittoPasswdFile}
acl_file ${mosquittoAclFile}
persistence true
persistence_location ${mosquittoDataDir}/
log_dest stdout
`
}

// One ACL stanza per user: read+write own topics, read each granted friend's.
// The recorder reads and writes everything so it can record and relay commands.
export function mosquittoAcl(users: Store['users']): string {
  const names = Object.keys(users)
  let acl = `user ${recorderMqttUsername}\ntopic readwrite owntracks/#\n\n`
  for (const name of names) {
    acl += `user ${name}\ntopic readwrite owntracks/${name}/#\n`
    for (const friend of users[name].friends) {
      if (friend !== name && users[friend]) {
        acl += `topic read owntracks/${friend}/#\n`
      }
    }
    acl += `\n`
  }
  return acl
}

// Newline-separated "user:password" pairs consumed by the setup-mosquitto
// oneshot to build the hashed password file. Generated passwords are
// alphanumeric, so ':' is a safe delimiter.
export function mosquittoCreds(
  users: Store['users'],
  recorderPassword: string,
): string {
  const lines = [`${recorderMqttUsername}:${recorderPassword}`]
  for (const [name, user] of Object.entries(users)) {
    lines.push(`${name}:${user.password}`)
  }
  return lines.join('\n')
}
