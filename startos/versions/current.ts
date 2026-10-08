import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '1.0.4:2',
  releaseNotes: {
    en_US: `The admin web map now loads on a fresh install, before any location has been recorded.

- Set Admin Web Map Password asks for confirmation before it replaces an existing password.
- Remove MQTT User, Reset User Password and Forget Device Tracks start with no user or device selected.
- Remove MQTT User points out that the account's recorded location history is kept.`,
    es_ES: `El mapa web de administración ahora carga en una instalación nueva, antes de que se haya registrado ninguna ubicación.

- Establecer la contraseña del mapa web de administrador pide confirmación antes de reemplazar una contraseña existente.
- Eliminar usuario MQTT, Restablecer contraseña de usuario y Olvidar rastros del dispositivo empiezan sin ningún usuario o dispositivo seleccionado.
- Eliminar usuario MQTT indica que el historial de ubicaciones registrado de la cuenta se conserva.`,
    de_DE: `Die Admin-Webkarte lädt jetzt auf einer frischen Installation, bevor ein Standort aufgezeichnet wurde.

- Admin-Passwort der Webkarte festlegen fragt nach einer Bestätigung, bevor es ein bestehendes Passwort ersetzt.
- MQTT-Benutzer entfernen, Benutzerpasswort zurücksetzen und Geräte-Spuren vergessen starten ohne vorausgewählten Benutzer oder Gerät.
- MQTT-Benutzer entfernen weist darauf hin, dass der aufgezeichnete Standortverlauf des Kontos erhalten bleibt.`,
    pl_PL: `Mapa administracyjna ładuje się teraz na świeżej instalacji, zanim zostanie zapisana jakakolwiek lokalizacja.

- Ustaw hasło administratora mapy webowej prosi o potwierdzenie przed zastąpieniem istniejącego hasła.
- Usuń użytkownika MQTT, Zresetuj hasło użytkownika i Zapomnij ślady urządzenia zaczynają bez wybranego użytkownika ani urządzenia.
- Usuń użytkownika MQTT informuje, że zapisana historia lokalizacji konta zostaje zachowana.`,
    fr_FR: `La carte web d'administration se charge désormais sur une installation neuve, avant qu'aucune position n'ait été enregistrée.

- Définir le mot de passe admin de la carte web demande une confirmation avant de remplacer un mot de passe existant.
- Supprimer un utilisateur MQTT, Réinitialiser le mot de passe utilisateur et Oublier les traces de l’appareil s’ouvrent sans utilisateur ni appareil sélectionné.
- Supprimer un utilisateur MQTT précise que l’historique de localisation enregistré du compte est conservé.`,
  },
  migrations: {
    up: async ({ effects }) => {},
    down: IMPOSSIBLE,
  },
})
