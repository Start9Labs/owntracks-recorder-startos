import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '1.0.4:1',
  releaseNotes: {
    en_US: `The admin web map now loads on a fresh install, before any location has been recorded.`,
    es_ES: `El mapa web de administración ahora carga en una instalación nueva, antes de que se haya registrado ninguna ubicación.`,
    de_DE: `Die Admin-Webkarte lädt jetzt auf einer frischen Installation, bevor ein Standort aufgezeichnet wurde.`,
    pl_PL: `Mapa administracyjna ładuje się teraz na świeżej instalacji, zanim zostanie zapisana jakakolwiek lokalizacja.`,
    fr_FR: `La carte web d'administration se charge désormais sur une installation neuve, avant qu'aucune position n'ait été enregistrée.`,
  },
  migrations: {
    up: async ({ effects }) => {},
    down: IMPOSSIBLE,
  },
})
