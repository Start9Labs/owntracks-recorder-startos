import { writeFile } from 'node:fs/promises'
import { storeJson } from './fileModels/store.json'
import { i18n } from './i18n'
import { sdk } from './sdk'
import {
  defaultMqttUsername,
  mosquittoConfFile,
  mosquittoConfig,
  mosquittoPasswdFile,
  mqttPort,
  recorderHttpPort,
  recorderMqttUsername,
  uiPort,
} from './utils'

export const main = sdk.setupMain(async ({ effects }) => {
  console.info(i18n('Starting OwnTracks Recorder'))

  const store = await storeJson.read().const(effects)
  const mqttUsername = store?.mqttUsername || defaultMqttUsername
  const mqttPassword = store?.mqttPassword || ''
  const recorderPassword = store?.recorderPassword || ''

  const mosquittoSub = await sdk.SubContainer.of(
    effects,
    { imageId: 'mosquitto' },
    sdk.Mounts.of().mountVolume({
      volumeId: 'main',
      subpath: 'mosquitto',
      mountpoint: '/mosquitto/data',
      readonly: false,
    }),
    'mosquitto-sub',
  )
  await writeFile(`${mosquittoSub.rootfs}${mosquittoConfFile}`, mosquittoConfig())

  const recorderSub = await sdk.SubContainer.of(
    effects,
    { imageId: 'recorder' },
    sdk.Mounts.of().mountVolume({
      volumeId: 'main',
      subpath: 'recorder',
      mountpoint: '/store',
      readonly: false,
    }),
    'recorder-sub',
  )

  const frontendSub = await sdk.SubContainer.of(
    effects,
    { imageId: 'frontend' },
    sdk.Mounts.of(),
    'frontend-sub',
  )

  return sdk.Daemons.of(effects)
    .addOneshot('setup-mosquitto', {
      subcontainer: mosquittoSub,
      exec: {
        command: [
          'sh',
          '-c',
          `mosquitto_passwd -b -c ${mosquittoPasswdFile} "$MQTT_USER" "$MQTT_PASS" && ` +
            `mosquitto_passwd -b ${mosquittoPasswdFile} "$REC_USER" "$REC_PASS" && ` +
            `chown -R 1883:1883 /mosquitto && chmod 0600 ${mosquittoPasswdFile}`,
        ],
        user: 'root',
        env: {
          MQTT_USER: mqttUsername,
          MQTT_PASS: mqttPassword,
          REC_USER: recorderMqttUsername,
          REC_PASS: recorderPassword,
        },
      },
      requires: [],
    })
    .addDaemon('mosquitto', {
      subcontainer: mosquittoSub,
      exec: { command: sdk.useEntrypoint() },
      ready: {
        display: i18n('MQTT Broker'),
        fn: () =>
          sdk.healthCheck.checkPortListening(effects, mqttPort, {
            successMessage: i18n('The MQTT broker is ready'),
            errorMessage: i18n('The MQTT broker is not ready'),
          }),
      },
      requires: ['setup-mosquitto'],
    })
    .addDaemon('recorder', {
      subcontainer: recorderSub,
      exec: {
        command: sdk.useEntrypoint([
          '--http-host',
          '127.0.0.1',
          '--http-port',
          `${recorderHttpPort}`,
        ]),
        env: {
          OTR_HOST: '127.0.0.1',
          OTR_PORT: `${mqttPort}`,
          OTR_USER: recorderMqttUsername,
          OTR_PASS: recorderPassword,
        },
      },
      ready: {
        display: i18n('Recorder'),
        fn: () =>
          sdk.healthCheck.checkPortListening(effects, recorderHttpPort, {
            successMessage: i18n('The recorder is ready'),
            errorMessage: i18n('The recorder is not ready'),
          }),
      },
      requires: ['mosquitto'],
    })
    .addDaemon('frontend', {
      subcontainer: frontendSub,
      exec: {
        command: sdk.useEntrypoint(),
        env: {
          LISTEN_PORT: `${uiPort}`,
          SERVER_HOST: '127.0.0.1',
          SERVER_PORT: `${recorderHttpPort}`,
        },
      },
      ready: {
        display: i18n('Web Interface'),
        fn: () =>
          sdk.healthCheck.checkPortListening(effects, uiPort, {
            successMessage: i18n('The web interface is ready'),
            errorMessage: i18n('The web interface is not ready'),
          }),
      },
      requires: ['recorder'],
    })
})
