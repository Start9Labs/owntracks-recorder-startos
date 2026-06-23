import { utils } from '@start9labs/start-sdk'

export const uiPort = 80
export const recorderHttpPort = 8083
export const mqttPort = 1883

export const defaultMqttUsername = 'owntracks'
export const recorderMqttUsername = 'recorder'

export const mosquittoConfigDir = '/mosquitto/config'
export const mosquittoPasswdFile = `${mosquittoConfigDir}/passwd`
export const mosquittoConfFile = `${mosquittoConfigDir}/mosquitto.conf`
export const mosquittoDataDir = '/mosquitto/data'

export function getDefaultPassword(): string {
  return utils.getDefaultString({ charset: 'a-z,A-Z,0-9', len: 24 })
}

export function mosquittoConfig(): string {
  return `per_listener_settings false
listener ${mqttPort}
allow_anonymous false
password_file ${mosquittoPasswdFile}
persistence true
persistence_location ${mosquittoDataDir}/
log_dest stdout
`
}
