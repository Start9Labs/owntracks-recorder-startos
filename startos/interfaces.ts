import { storeJson } from './fileModels/store.json'
import { i18n } from './i18n'
import { sdk } from './sdk'
import { mqttPort, mqttsPort, uiPort, uiUsername } from './utils'

export const setInterfaces = sdk.setupInterfaces(async ({ effects }) => {
  const uiPassword =
    (await storeJson.read((s) => s.uiPassword).const(effects)) || ''

  const uiMulti = sdk.MultiHost.of(effects, 'ui-multi')
  const uiMultiOrigin = await uiMulti.bindPort(uiPort, {
    protocol: 'http',
    addSsl: {
      auth: {
        type: 'basic',
        credentials: [{ username: uiUsername, password: uiPassword }],
        realm: null,
      },
    },
  })
  const ui = sdk.createInterface(effects, {
    name: i18n('Admin Web Map'),
    id: 'ui',
    description: i18n(
      'Unpermissioned admin view showing every device on the server. Protected by a separate admin password, not the MQTT credentials.',
    ),
    type: 'ui',
    masked: false,
    schemeOverride: null,
    username: uiUsername,
    path: '',
    query: {},
  })
  const uiReceipt = await uiMultiOrigin.export([ui])

  const mqttMulti = sdk.MultiHost.of(effects, 'mqtt-multi')
  const mqttMultiOrigin = await mqttMulti.bindPort(mqttPort, {
    protocol: null,
    preferredExternalPort: mqttPort,
    addSsl: {
      preferredExternalPort: mqttsPort,
      addXForwardedHeaders: false,
      alpn: null,
      auth: null,
    },
    secure: null,
  })
  const mqtt = sdk.createInterface(effects, {
    name: i18n('MQTT Broker'),
    id: 'mqtt',
    description: i18n(
      'The MQTT endpoint your OwnTracks apps publish location updates to',
    ),
    type: 'api',
    masked: false,
    schemeOverride: { ssl: 'mqtts', noSsl: 'mqtt' },
    username: null,
    path: '',
    query: {},
  })
  const mqttReceipt = await mqttMultiOrigin.export([mqtt])

  return [uiReceipt, mqttReceipt]
})
