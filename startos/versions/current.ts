import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '1.0.1:0',
  releaseNotes: {
    en_US: 'Initial release of OwnTracks Recorder for StartOS.',
    es_ES: 'Versión inicial de OwnTracks Recorder para StartOS.',
    de_DE: 'Erste Veröffentlichung von OwnTracks Recorder für StartOS.',
    pl_PL: 'Pierwsze wydanie OwnTracks Recorder dla StartOS.',
    fr_FR: 'Première version de OwnTracks Recorder pour StartOS.',
  },
  migrations: {
    up: async ({ effects }) => {},
    down: IMPOSSIBLE,
  },
})
