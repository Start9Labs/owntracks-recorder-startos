import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '1.0.4:0',
  releaseNotes: {
    en_US: `Updated OwnTracks Recorder to 1.0.4. GPX exports produced by \`ocat\` now place elevation before time, conforming to the GPX standard.

Full upstream release notes: https://github.com/owntracks/recorder/releases/tag/1.0.4`,
    es_ES: `OwnTracks Recorder actualizado a 1.0.4. Las exportaciones GPX generadas por \`ocat\` ahora colocan la elevación antes de la hora, conforme al estándar GPX.

Notas de la versión completas: https://github.com/owntracks/recorder/releases/tag/1.0.4`,
    de_DE: `OwnTracks Recorder auf 1.0.4 aktualisiert. Von \`ocat\` erzeugte GPX-Exporte geben die Höhe jetzt vor der Zeit aus und entsprechen damit dem GPX-Standard.

Vollständige Versionshinweise: https://github.com/owntracks/recorder/releases/tag/1.0.4`,
    pl_PL: `Zaktualizowano OwnTracks Recorder do wersji 1.0.4. Eksporty GPX generowane przez \`ocat\` umieszczają teraz wysokość przed czasem, zgodnie ze standardem GPX.

Pełne informacje o wydaniu: https://github.com/owntracks/recorder/releases/tag/1.0.4`,
    fr_FR: `OwnTracks Recorder mis à jour vers 1.0.4. Les exports GPX générés par \`ocat\` placent désormais l'altitude avant l'heure, conformément à la norme GPX.

Notes de version complètes : https://github.com/owntracks/recorder/releases/tag/1.0.4`,
  },
  migrations: {
    up: async ({ effects }) => {},
    down: IMPOSSIBLE,
  },
})
