import { i18n } from './i18n'
import { sdk } from './sdk'
import { mqttPort, mqttsPort } from './utils'

export const setInterfaces = sdk.setupInterfaces(async ({ effects }) => {
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

  return [mqttReceipt]
})
