import { setupManifest } from '@start9labs/start-sdk'
import { long, short } from './i18n'

export const manifest = setupManifest({
  id: 'owntracks-recorder',
  title: 'OwnTracks Recorder',
  license: 'GPL-2.0-or-later',
  packageRepo: 'https://github.com/Start9Labs/owntracks-recorder-startos',
  upstreamRepo: 'https://github.com/owntracks/recorder',
  marketingUrl: 'https://owntracks.org/',
  donationUrl: null,
  description: { short, long },
  volumes: ['main'],
  images: {
    mosquitto: {
      source: { dockerTag: 'eclipse-mosquitto:2.0.22' },
      arch: ['x86_64', 'aarch64'],
    },
    recorder: {
      source: { dockerTag: 'owntracks/recorder:1.0.1' },
      arch: ['x86_64', 'aarch64'],
    },
  },
  alerts: {
    install: null,
    update: null,
    uninstall: null,
    restore: null,
    start: null,
    stop: null,
  },
  dependencies: {},
})
