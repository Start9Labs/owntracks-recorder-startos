import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '1.0.3:0',
  releaseNotes: {
    en_US: `Updated OwnTracks Recorder to 1.0.3.

- New locations are now tagged with the timezone they were recorded in.
- The Recorder no longer fails when its timezone database is missing or unreadable.
- Maps send a referrer meta tag, and \`ocat --dump\` no longer exposes internal database names.

Full upstream release notes: https://github.com/owntracks/recorder/releases`,
    es_ES: `OwnTracks Recorder actualizado a 1.0.3.

- Las nuevas ubicaciones ahora se etiquetan con la zona horaria en la que se registraron.
- El Recorder ya no falla cuando su base de datos de zonas horarias falta o no se puede leer.
- Los mapas envían una etiqueta meta de referente y \`ocat --dump\` ya no expone los nombres internos de la base de datos.

Notas de la versión completas: https://github.com/owntracks/recorder/releases`,
    de_DE: `OwnTracks Recorder auf 1.0.3 aktualisiert.

- Neue Standorte werden jetzt mit der Zeitzone versehen, in der sie aufgezeichnet wurden.
- Der Recorder schlägt nicht mehr fehl, wenn seine Zeitzonendatenbank fehlt oder nicht lesbar ist.
- Karten senden ein Referrer-Meta-Tag, und \`ocat --dump\` gibt keine internen Datenbanknamen mehr preis.

Vollständige Versionshinweise: https://github.com/owntracks/recorder/releases`,
    pl_PL: `Zaktualizowano OwnTracks Recorder do wersji 1.0.3.

- Nowe lokalizacje są teraz oznaczane strefą czasową, w której zostały zarejestrowane.
- Recorder nie kończy się już błędem, gdy jego baza stref czasowych jest niedostępna lub nieczytelna.
- Mapy wysyłają znacznik meta referrer, a \`ocat --dump\` nie ujawnia już wewnętrznych nazw bazy danych.

Pełne informacje o wydaniu: https://github.com/owntracks/recorder/releases`,
    fr_FR: `OwnTracks Recorder mis à jour vers 1.0.3.

- Les nouvelles positions sont désormais associées au fuseau horaire dans lequel elles ont été enregistrées.
- Le Recorder n'échoue plus lorsque sa base de fuseaux horaires est absente ou illisible.
- Les cartes envoient une balise meta referrer, et \`ocat --dump\` n'expose plus les noms internes de la base de données.

Notes de version complètes : https://github.com/owntracks/recorder/releases`,
  },
  migrations: {
    up: async ({ effects }) => {},
    down: IMPOSSIBLE,
  },
})
