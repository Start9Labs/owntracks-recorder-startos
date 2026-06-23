import { writeFile } from 'node:fs/promises'
import { storeJson } from './fileModels/store.json'
import { i18n } from './i18n'
import { sdk } from './sdk'
import {
  mosquittoAcl,
  mosquittoAclFile,
  mosquittoConfFile,
  mosquittoConfig,
  mosquittoCreds,
  mosquittoPasswdFile,
  mqttPort,
  recorderHttpPort,
  recorderMqttUsername,
} from './utils'

export const main = sdk.setupMain(async ({ effects }) => {
  console.info(i18n('Starting OwnTracks Recorder'))

  const store = await storeJson.read().const(effects)
  const users = store?.users || {}
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
  await writeFile(`${mosquittoSub.rootfs}${mosquittoAclFile}`, mosquittoAcl(users))

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

  return sdk.Daemons.of(effects)
    .addOneshot('setup-mosquitto', {
      subcontainer: mosquittoSub,
      exec: {
        command: [
          'sh',
          '-c',
          `rm -f ${mosquittoPasswdFile}\n` +
            `printf '%s\\n' "$CREDS" | while IFS=: read -r u p; do\n` +
            `  [ -z "$u" ] && continue\n` +
            `  if [ ! -f ${mosquittoPasswdFile} ]; then mosquitto_passwd -b -c ${mosquittoPasswdFile} "$u" "$p"; else mosquitto_passwd -b ${mosquittoPasswdFile} "$u" "$p"; fi\n` +
            `done\n` +
            `chown -R 1883:1883 /mosquitto && chmod 0600 ${mosquittoPasswdFile} ${mosquittoAclFile}`,
        ],
        user: 'root',
        env: { CREDS: mosquittoCreds(users, recorderPassword) },
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
})
