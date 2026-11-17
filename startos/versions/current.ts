import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '1.0.5:0',
  releaseNotes: {
    en_US:
      'Updated OwnTracks Recorder to 1.0.5. Fixes location-history responses from the web map and API cut off at 8 KB, and CSV exports whose columns shifted when some points lacked fields such as Wi-Fi details. Requires StartOS 0.4.2 or newer. Full notes: https://github.com/owntracks/recorder/releases/tag/1.0.5',
    es_ES:
      'Actualizado OwnTracks Recorder a 1.0.5. Corrige respuestas del historial de ubicaciones del mapa web y de la API cortadas a 8 KB, y exportaciones CSV cuyas columnas se desplazaban cuando algunos puntos carecían de campos como los datos de Wi-Fi. Requiere StartOS 0.4.2 o posterior. Notas completas: https://github.com/owntracks/recorder/releases/tag/1.0.5',
    de_DE:
      'OwnTracks Recorder auf 1.0.5 aktualisiert. Behebt bei 8 KB abgeschnittene Antworten des Standortverlaufs in Webkarte und API sowie CSV-Exporte, deren Spalten sich verschoben, wenn einzelnen Punkten Felder wie WLAN-Angaben fehlten. Erfordert StartOS 0.4.2 oder neuer. Vollständige Hinweise: https://github.com/owntracks/recorder/releases/tag/1.0.5',
    pl_PL:
      'Zaktualizowano OwnTracks Recorder do wersji 1.0.5. Naprawia odpowiedzi historii lokalizacji w mapie webowej i API ucinane na 8 KB oraz eksporty CSV, w których kolumny przesuwały się, gdy niektórym punktom brakowało pól, takich jak dane Wi-Fi. Wymaga StartOS 0.4.2 lub nowszego. Pełne informacje: https://github.com/owntracks/recorder/releases/tag/1.0.5',
    fr_FR:
      "Mise à jour d'OwnTracks Recorder vers 1.0.5. Corrige les réponses de l'historique de localisation de la carte web et de l'API tronquées à 8 Ko, ainsi que les exports CSV dont les colonnes se décalaient lorsque certains points n'avaient pas de champs comme les informations Wi-Fi. Nécessite StartOS 0.4.2 ou plus récent. Notes complètes : https://github.com/owntracks/recorder/releases/tag/1.0.5",
  },
  migrations: {
    up: async ({ effects }) => {},
    down: IMPOSSIBLE,
  },
})
