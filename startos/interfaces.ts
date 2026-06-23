import { storeJson } from './fileModels/store.json'
import { i18n } from './i18n'
import { sdk } from './sdk'
import { defaultMqttUsername, mqttPort, uiPort } from './utils'

export const setInterfaces = sdk.setupInterfaces(async ({ effects }) => {
  const uiMulti = sdk.MultiHost.of(effects, 'ui-multi')
  const uiMultiOrigin = await uiMulti.bindPort(uiPort, { protocol: 'http' })
  const ui = sdk.createInterface(effects, {
    name: i18n('Web UI'),
    id: 'ui',
    description: i18n('The OwnTracks web map and dashboard'),
    type: 'ui',
    masked: false,
    schemeOverride: null,
    username: null,
    path: '',
    query: {},
  })
  const uiReceipt = await uiMultiOrigin.export([ui])

  const mqttUsername =
    (await storeJson.read((s) => s.mqttUsername).const(effects)) ||
    defaultMqttUsername

  const mqttMulti = sdk.MultiHost.of(effects, 'mqtt-multi')
  const mqttMultiOrigin = await mqttMulti.bindPort(mqttPort, {
    protocol: null,
    addSsl: null,
    preferredExternalPort: mqttPort,
    secure: { ssl: false },
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
    username: mqttUsername,
    path: '',
    query: {},
  })
  const mqttReceipt = await mqttMultiOrigin.export([mqtt])

  return [uiReceipt, mqttReceipt]
})
