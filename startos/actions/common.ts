import { i18n } from '../i18n'

export function credentialsResult(
  title: string,
  message: string,
  username: string,
  password: string,
) {
  return {
    version: '1' as const,
    title,
    message,
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
