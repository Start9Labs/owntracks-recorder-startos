import { i18n } from '../i18n'

export function credentialsResult(username: string, password: string) {
  return {
    version: '1' as const,
    title: i18n('OwnTracks MQTT Credentials'),
    message: i18n(
      'Enter these in the OwnTracks app under Settings → Connection, along with your server address and port.',
    ),
    result: {
      type: 'group' as const,
      value: [
        {
          type: 'single' as const,
          name: i18n('Username'),
          description: null,
          value: username,
          masked: false,
          copyable: true,
          qr: false,
        },
        {
          type: 'single' as const,
          name: i18n('Password'),
          description: null,
          value: password,
          masked: true,
          copyable: true,
          qr: false,
        },
      ],
    },
  }
}
