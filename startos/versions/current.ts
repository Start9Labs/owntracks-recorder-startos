import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '1.0.6:0',
  releaseNotes: {
    en_US:
      'Updated OwnTracks Recorder to 1.0.6. The Recorder no longer accepts location reports sent as Traccar (OsmAnd) GET requests; OwnTracks apps are unaffected. Also updates the bundled Mosquitto MQTT broker to 2.0.23, which includes security and stability fixes. Full notes: https://github.com/owntracks/recorder/releases/tag/1.0.6',
    es_ES:
      'Actualizado OwnTracks Recorder a 1.0.6. El Recorder ya no acepta informes de ubicación enviados como solicitudes GET de Traccar (OsmAnd); las aplicaciones de OwnTracks no se ven afectadas. También actualiza el broker MQTT Mosquitto incluido a 2.0.23, con correcciones de seguridad y estabilidad. Notas completas: https://github.com/owntracks/recorder/releases/tag/1.0.6',
    de_DE:
      'OwnTracks Recorder auf 1.0.6 aktualisiert. Der Recorder nimmt keine Standortmeldungen mehr an, die als Traccar-(OsmAnd-)GET-Anfragen gesendet werden; OwnTracks-Apps sind nicht betroffen. Außerdem wird der mitgelieferte Mosquitto-MQTT-Broker auf 2.0.23 aktualisiert, mit Sicherheits- und Stabilitätskorrekturen. Vollständige Hinweise: https://github.com/owntracks/recorder/releases/tag/1.0.6',
    pl_PL:
      'Zaktualizowano OwnTracks Recorder do wersji 1.0.6. Recorder nie przyjmuje już raportów lokalizacji wysyłanych jako żądania GET Traccar (OsmAnd); aplikacje OwnTracks nie są objęte zmianą. Aktualizuje także dołączony broker MQTT Mosquitto do wersji 2.0.23 z poprawkami bezpieczeństwa i stabilności. Pełne informacje: https://github.com/owntracks/recorder/releases/tag/1.0.6',
    fr_FR:
      "Mise à jour d'OwnTracks Recorder vers 1.0.6. Le Recorder n'accepte plus les rapports de position envoyés sous forme de requêtes GET Traccar (OsmAnd) ; les applications OwnTracks ne sont pas concernées. Met également à jour le broker MQTT Mosquitto intégré vers 2.0.23, avec des correctifs de sécurité et de stabilité. Notes complètes : https://github.com/owntracks/recorder/releases/tag/1.0.6",
  },
  migrations: {
    up: async ({ effects }) => {},
    down: IMPOSSIBLE,
  },
})
