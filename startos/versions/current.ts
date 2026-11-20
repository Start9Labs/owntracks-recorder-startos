import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '1.0.7:1',
  releaseNotes: {
    en_US:
      'The MQTT broker now clears out sessions left behind by earlier restarts of the service, and those of devices offline for more than a week.',
    es_ES:
      'El broker MQTT ahora elimina las sesiones que dejaron los reinicios anteriores del servicio y las de los dispositivos desconectados durante más de una semana.',
    de_DE:
      'Der MQTT-Broker entfernt jetzt Sitzungen, die frühere Neustarts des Dienstes hinterlassen haben, sowie die von Geräten, die länger als eine Woche offline sind.',
    pl_PL:
      'Broker MQTT usuwa teraz sesje pozostawione przez wcześniejsze restarty usługi oraz sesje urządzeń, które są offline dłużej niż tydzień.',
    fr_FR:
      "Le broker MQTT supprime désormais les sessions laissées par les redémarrages précédents du service, ainsi que celles des appareils hors ligne depuis plus d'une semaine.",
  },
  migrations: {
    up: async ({ effects }) => {},
    down: IMPOSSIBLE,
  },
})
