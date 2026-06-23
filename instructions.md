# OwnTracks Recorder

## Documentation

- [OwnTracks Booklet](https://owntracks.org/booklet/) — the official guide to the OwnTracks apps, Recorder, and MQTT setup.
- [Recorder documentation](https://github.com/owntracks/recorder/blob/master/README.md) — reference for the Recorder backend.

## What you get on StartOS

A private place to record and view your own (and your family's) location history:

- A **Web UI** — the OwnTracks map and dashboard, showing every device that has reported in.
- An **MQTT broker** with a **separate account for each person or device**, so everyone publishes under their own login.
- **Friends** — you decide, per person, whose locations show up in each person's phone app.

All data stays on your server.

## Getting set up

You create one MQTT account per person (or device), then point each phone at the server.

1. Open the **Add MQTT User** action (you'll be prompted by a task after install). Enter a short lowercase **username** (e.g. `jane`). A password is generated and shown once — copy it.
2. Repeat **Add MQTT User** for each person or device.
3. Find your MQTT address: open the **Dashboard** tab and look at the **MQTT** interface. Connections use **TLS on port 8883**. A custom domain or your LAN address is most practical for use on the road. If you use a LAN or Tor address, install your StartOS root CA on the phone first so it trusts the certificate (a custom domain uses a publicly-trusted cert and needs no extra setup).
4. On each phone, install the OwnTracks app ([iOS](https://apps.apple.com/app/owntracks/id692424691) / [Android](https://play.google.com/store/apps/details?id=org.owntracks.android)) and open **Settings → Connection**:
   - **Mode**: MQTT (private)
   - **Host**: the MQTT hostname from step 3, **Port**: `8883`
   - **TLS**: enabled
   - **Username** / **Password**: that person's account from step 1
   - **Device ID**: a short name for the phone (e.g. `phone`)
   - **Username (identification)**: **must match the MQTT username** above — the broker only lets each account publish under its own name.
5. Save and let the app publish a location. Open the **Web UI** — the device appears on the map.

## Choosing who sees whom (Friends)

By default a new user sees only their own location in their app. To let people see each other:

1. Open the **Manage Friends** action (available once you have two or more users).
2. For each user, check the other users whose locations should appear in that user's phone app.
3. Save. The broker restarts briefly to apply the change.

Friends are one-directional — if you want Jane and John to see each other, grant John to Jane *and* Jane to John. Everyone always appears on the server's **Web UI** map regardless of Friends.

## Managing accounts

- **User Credentials** — re-display a user's username and password.
- **Reset User Password** — issue a new password for a user (update their app afterward).
- **Remove MQTT User** — delete an account; they're also dropped from everyone's friends.

## Limitations

- MQTT uses TLS on port 8883. On a LAN or Tor address the certificate is signed by your StartOS root CA, so the phone must trust that CA (install it, or use a custom domain with a publicly-trusted certificate).
- Adding/removing users or changing friends restarts the broker, briefly disconnecting connected apps.
