import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '1.0.7:0',
  releaseNotes: {
    en_US:
      'Updated OwnTracks Recorder to 1.0.7, a security release. It fixes a flaw that let a remote request crash the Recorder and one that could leak memory contents through the location-blocking endpoint. Support for obsolete Greenwich devices is removed. Full notes: https://github.com/owntracks/recorder/releases/tag/1.0.7',
    es_ES:
      'Actualizado OwnTracks Recorder a 1.0.7, una versión de seguridad. Corrige un fallo que permitía a una solicitud remota bloquear el Recorder y otro que podía filtrar contenido de memoria a través del endpoint de bloqueo de ubicaciones. Se elimina la compatibilidad con los dispositivos obsoletos Greenwich. Notas completas: https://github.com/owntracks/recorder/releases/tag/1.0.7',
    de_DE:
      'OwnTracks Recorder auf 1.0.7 aktualisiert, ein Sicherheitsrelease. Es behebt eine Schwachstelle, durch die eine entfernte Anfrage den Recorder zum Absturz bringen konnte, sowie eine, über die der Endpunkt zum Sperren von Standorten Speicherinhalte preisgeben konnte. Die Unterstützung veralteter Greenwich-Geräte entfällt. Vollständige Hinweise: https://github.com/owntracks/recorder/releases/tag/1.0.7',
    pl_PL:
      'Zaktualizowano OwnTracks Recorder do wersji 1.0.7 z poprawkami bezpieczeństwa. Naprawia błąd, przez który zdalne żądanie mogło spowodować awarię Recordera, oraz błąd, przez który punkt końcowy blokowania lokalizacji mógł ujawniać zawartość pamięci. Usunięto obsługę przestarzałych urządzeń Greenwich. Pełne informacje: https://github.com/owntracks/recorder/releases/tag/1.0.7',
    fr_FR:
      "Mise à jour d'OwnTracks Recorder vers 1.0.7, une version de sécurité. Elle corrige une faille permettant à une requête distante de faire planter le Recorder, ainsi qu'une autre pouvant divulguer le contenu de la mémoire via le point de terminaison de blocage des positions. La prise en charge des appareils Greenwich obsolètes est supprimée. Notes complètes : https://github.com/owntracks/recorder/releases/tag/1.0.7",
  },
  migrations: {
    up: async ({ effects }) => {},
    down: IMPOSSIBLE,
  },
})
