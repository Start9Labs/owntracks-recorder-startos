# OwnTracks Recorder

## Documentation

- [OwnTracks Booklet](https://owntracks.org/booklet/) — the official guide to the OwnTracks apps, Recorder, and MQTT setup.
- [Recorder documentation](https://github.com/owntracks/recorder/blob/master/README.md) — reference for the Recorder backend.

## What you get on StartOS

A private place to record and view your own location history:

- A **Web UI** — the OwnTracks map and dashboard, showing every device that has reported in.
- An **MQTT broker** that your OwnTracks phone apps publish their location to.
- All location data stays on your server. Everyone who points an app at this server sees each other on the web map automatically.

## Getting set up

1. Open the **MQTT Credentials** action (you'll be prompted by a task right after install) and copy the **username** and **password**. These are what your phone apps use to log in to the broker.
2. Find your MQTT address: open the **Dashboard** tab and look at the **MQTT** interface. Copy its hostname — for use on the road, a custom domain or your LAN address is most practical.
3. Install the OwnTracks app ([iOS](https://apps.apple.com/app/owntracks/id692424691) / [Android](https://play.google.com/store/apps/details?id=org.owntracks.android)).
4. In the app, open **Settings → Connection** and set:
   - **Mode**: MQTT (private)
   - **Host**: the MQTT hostname from step 2, **Port**: `1883`
   - **Username** / **Password**: from step 1
   - **Device ID** / **Tracker ID**: a short name for this phone (e.g. `phone`, `JD`)
5. Save, then let the app report a location (move, or use the app's publish button).
6. Open the **Web UI** from the Dashboard — your device should appear on the map.

Repeat steps 3–6 on each phone, giving every person a distinct username so they show up separately. Everyone using this server sees everyone else on the map.

## Using OwnTracks

- **Web map** — open the **Web UI** interface to see live positions, history tracks, and heatmaps for all reporting devices.
- **Reset MQTT Password** — run this action to roll the broker password. After resetting, update the password in every phone app, or they won't reconnect.

## Limitations

- The MQTT broker is reached over a plain (unencrypted) TCP connection. Use it over your LAN or a VPN, or rely on a StartOS custom domain, rather than exposing it to the open internet.
- All apps share one MQTT account and are told apart by the username you set in each app; there are no separate per-user broker logins yet.
