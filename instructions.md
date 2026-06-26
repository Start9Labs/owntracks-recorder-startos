# OwnTracks Recorder

## Documentation

- [OwnTracks Booklet](https://owntracks.org/booklet/) — the official guide to the OwnTracks apps, Recorder, and MQTT setup.
- [Recorder documentation](https://github.com/owntracks/recorder/blob/master/README.md) — reference for the Recorder backend.

## What you get on StartOS

A private location backbone for you and your household:

- A **private MQTT broker** with a **separate account for each person or device**, so everyone publishes under their own login.
- **Friends** — you decide, per person, whose locations show up in each person's phone app.
- The **Recorder** archives all location history on your server (included in your backups).
- An **Admin Web Map** — a map of every device on the server, for the server owner. It is protected by its own admin password and shows *everyone* (see [The Admin Web Map](#the-admin-web-map)).

All data stays on your server.

## Getting set up

After install, you'll be prompted to run the required **Set Admin Web Map Password** task — it generates the admin password (copy it; see [The Admin Web Map](#the-admin-web-map)) and unlocks the rest of the service.

Then create one MQTT account per person (or device) and point each phone at the server.

1. Open the **Add MQTT User** action. Enter a short lowercase **username** (e.g. `jane`). A password is generated and shown once — copy it.
2. Repeat **Add MQTT User** for each person or device.
3. Find your MQTT address: open the **Dashboard** tab and look at the **MQTT** interface. Connections use **TLS on port 8883**. A LAN IP or `.local` hostname works at home; for use on the road, expose the interface on a public domain — e.g. via **StartTunnel** — which provisions a publicly-trusted Let's Encrypt cert.

   On a LAN or Tor address the cert is signed by your StartOS root CA, so the phone must trust that CA first — download it from the StartOS UI and install it on the phone (the same CA your browser was asked to trust when you set up StartOS). A public domain via StartTunnel needs no CA install and works cleanly on iOS.
4. On each phone, install the OwnTracks app ([iOS](https://apps.apple.com/app/owntracks/id692424691) / [Android](https://play.google.com/store/apps/details?id=org.owntracks.android)) and open **Settings → Connection**:
   - **Mode**: MQTT (private)
   - **Host**: the MQTT hostname from step 3, **Port**: `8883`
   - **TLS**: enabled
   - **Username** / **Password**: that person's account from step 1
   - **Device ID**: a short name for the phone (e.g. `phone`)
   - **Username (identification)**: **must match the MQTT username** above — the broker only lets each account publish under its own name.
5. Save and let the app publish a location.

## Choosing who sees whom (Friends)

By default a new user sees only their own location in their app. To let people see each other:

1. Open the **Manage Friends** action (available once you have two or more users).
2. For each user, check the other users whose locations should appear in that user's phone app.
3. Save. The broker restarts briefly to apply the change.

Friends are one-directional — if you want Jane and John to see each other, grant John to Jane *and* Jane to John.

## Managing accounts

- **User Credentials** — re-display a user's username and password.
- **Reset User Password** — issue a new password for a user (update their app afterward).
- **Remove MQTT User** — delete an account; they're also dropped from everyone's friends.
- **Forget Device Tracks** — permanently delete one phone's recorded history. Pick the `user / device` pair to forget; it removes that device's stored history *and* clears the broker's retained location so the marker disappears for everyone (other phones may need a force-stop-and-reopen). Useful after a reinstall changes a phone's Device ID and leaves a stale marker behind. **Irreversible.**

## Viewing your data

- **On each phone:** the OwnTracks app shows that person's location plus any friends you've granted them.
- **Admin Web Map:** see [below](#the-admin-web-map).
- **History:** the Recorder archives full history, which travels with your StartOS **backups**.

## The Admin Web Map

The **Admin Web Map** interface shows **every device** on the server on one map — it is an owner/admin overview, **not** a per-user view. It does not honor the Friends settings: anyone who signs in sees everyone.

1. Run the **Set Admin Web Map Password** action (a required task before the service starts). It generates the password and shows it once — copy it. The username is always `admin`, and these credentials are **separate** from the MQTT accounts.
2. Open the **Admin Web Map** interface from the **Dashboard** tab and sign in with those credentials.
3. Re-run **Set Admin Web Map Password** any time to rotate it (you'll need to sign in again).

Because it exposes everyone's location, treat the admin password as owner-only and don't share it with household members — give them MQTT accounts instead, and use Friends to control what they see in their apps.

## Limitations

- The Admin Web Map shows all devices to anyone with the admin password; it cannot be scoped per-person. Keep that password to yourself.
- On a LAN or Tor address, the MQTT endpoint (8883) presents a certificate signed by your StartOS root CA, so the phone must trust that CA — install your StartOS root CA on the phone (download it from the StartOS UI). Exposing the interface on a public domain via StartTunnel gives a publicly-trusted Let's Encrypt certificate instead, with no CA install.
- On a LAN address, the MQTT endpoint is reachable over IPv4. For remote access, use a public domain (StartTunnel) — verified working on iOS.
- Adding/removing users or changing friends restarts the broker, briefly disconnecting connected apps.
