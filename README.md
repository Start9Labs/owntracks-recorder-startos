<p align="center">
  <img src="icon.svg" alt="OwnTracks Logo" width="21%">
</p>

# OwnTracks Recorder on StartOS

> **Upstream repo:** <https://github.com/owntracks/recorder>

[OwnTracks](https://owntracks.org/) lets you keep track of your own location. The OwnTracks mobile apps (iOS/Android) publish location updates to your own server; the **Recorder** stores that history and serves it to a map. This package runs a private MQTT broker for the apps to publish to, the Recorder to archive everything, and an **admin-only** web map — a self-hosted location backbone for you and your household.

This package bundles three containers:

- **Mosquitto** — an MQTT broker the phone apps publish to, with one account per person/device and per-user ACLs (Friends).
- **Recorder** (`ot-recorder`) — subscribes to the broker, archives location data, and serves the map's HTTP API.
- **Frontend** — the OwnTracks web map (nginx), exposed as an **admin-only** interface.

## The web map is admin-only (unpermissioned)

The Recorder's HTTP API has **no per-user authorization** — it serves every user's location to any caller. The web map therefore cannot honor the per-user MQTT ACLs: anyone who can open it sees everyone. Rather than pretend otherwise, the map is exposed as an explicit **admin god-view**, gated by its **own admin password** (separate from the MQTT user accounts) and named "Admin Web Map" so its scope is unambiguous. Per-user privacy lives on the phone-app/MQTT side (Friends); the web map is the server owner's oversight tool.

---

## Table of Contents

- [Architecture](#architecture)
- [Image and Container Runtime](#image-and-container-runtime)
- [Volume and Data Layout](#volume-and-data-layout)
- [Installation and First-Run Flow](#installation-and-first-run-flow)
- [Configuration Management](#configuration-management)
- [Network Access and Interfaces](#network-access-and-interfaces)
- [Actions (StartOS UI)](#actions-startos-ui)
- [Backups and Restore](#backups-and-restore)
- [Health Checks](#health-checks)
- [Dependencies](#dependencies)
- [Limitations and Differences](#limitations-and-differences)
- [Quick Reference for AI Consumers](#quick-reference-for-ai-consumers)

---

## Architecture

```
phone apps ──MQTTS(8883)──▶ [StartOS TLS] ──▶ Mosquitto ──▶ Recorder ──HTTP(8083)──▶ Frontend (nginx :80) ──▶ Admin Web Map
                            terminate         (broker :1883)  (ot-recorder)           /api,/ws proxied         (basic-auth gate)
```

All three containers share the pod's loopback, so the Recorder reaches Mosquitto on `127.0.0.1:1883` and the frontend proxies to the Recorder on `127.0.0.1:8083`. Two interfaces are exposed: the **MQTT broker** as MQTTS on 8883 (StartOS terminates TLS via `addSsl`, forwarding plaintext to mosquitto's internal 1883), and the **Admin Web Map** on 80 (HTTP, TLS by StartOS), gated by a StartOS-proxy basic-auth password. The Recorder's HTTP API is never exposed directly — only via the gated frontend.

---

## Image and Container Runtime

| Container | Image                       | Command                                                   |
| --------- | --------------------------- | -------------------------------------------------------- |
| mosquitto | `eclipse-mosquitto:2.0.22`  | entrypoint with generated `mosquitto.conf`                |
| recorder  | `owntracks/recorder:1.0.1`  | entrypoint `--http-host 127.0.0.1 --http-port 8083`       |
| frontend  | `owntracks/frontend:2.15.3` | entrypoint (`SERVER_HOST=127.0.0.1`, `SERVER_PORT=8083`)  |

Architectures: x86_64, aarch64.

---

## Volume and Data Layout

A single `main` volume holds everything (one backup target):

| Subpath      | Mount Point       | Purpose                                            |
| ------------ | ----------------- | ------------------------------------------------- |
| `store.json` | —                 | MQTT users (password + friends), `recorderPassword`, `uiPassword` (admin) |
| `mosquitto`  | `/mosquitto/data` | Broker persistence (retained messages)            |
| `recorder`   | `/store`          | Recorder location history (`rec/`, `last/`, `ghash/`) |

`mosquitto.conf`, the `acl` file, and the broker `passwd` file are generated into the mosquitto container's rootfs on every start from `store.json` — they are not persisted.

`store.json` shape: `{ recorderPassword, uiPassword, users: { [username]: { password, friends: string[] } } }`. Any change to it triggers `setupMain`/`setupInterfaces` to re-run (read via `.const(effects)`), so a new MQTT user, a friend edit, or an admin-password reset applies automatically (broker regenerates `passwd`/`acl`; the proxy picks up the new admin credential).

---

## Installation and First-Run Flow

1. On install, the package generates the internal Recorder↔broker password (`recorderPassword`) and the **admin web-map password** (`uiPassword`), and starts with **no** MQTT user accounts.
2. Two **important tasks** prompt the user to run **Add MQTT User** (one account per person/device) and **Admin Web Map Credentials** (save the admin password).
3. On every start, the `setup-mosquitto` oneshot rebuilds the Mosquitto `passwd` file (one entry per user plus `recorder`) and `acl` file, then the broker, recorder, and frontend start in order.

---

## Configuration Management

There are no free-form config forms. User-managed state is the MQTT users + their friend allow-lists, and the admin web-map password — all via actions. `mosquitto.conf` is generated in code (`startos/utils.ts → mosquittoConfig()`): one authenticated listener on 1883, `allow_anonymous false`, `acl_file` enabled, persistence on.

### Accounts and ACLs (Friends)

- Each user is an MQTT account with its own password. The ACL grants `readwrite owntracks/<user>/#` — so a user can **only publish as themselves** (anti-spoofing).
- "Friends" is per-user read access: for each friend `F` granted, the user's stanza gets `read owntracks/<F>/#`. Friends are **not** symmetric unless granted both ways.
- The `recorder` account has `readwrite owntracks/#`.

### Admin web map

The frontend is gated by StartOS-proxy HTTP basic auth (`addSsl.auth`), username `admin`, password = `uiPassword` from `store.json` (generated on install, rotated by an action). This is **distinct** from the MQTT user credentials. The gate protects the whole origin, including the proxied `/api` and `/ws` — the Recorder API is never reachable un-gated.

---

## Network Access and Interfaces

| Interface     | External Port | Protocol          | Type | Purpose                                                  |
| ------------- | ------------- | ----------------- | ---- | ------------------------------------------------------- |
| Admin Web Map | 80            | HTTP (TLS by OS)  | ui   | Unpermissioned admin view of all devices (basic-auth)   |
| MQTT          | 8883          | MQTTS (TLS by OS) | api  | Endpoint the phone apps publish to (per-user auth)      |

The MQTT bind is raw TCP internally (mosquitto on `1883`); StartOS adds TLS via `addSsl` (`secure: null`, so no plaintext endpoint is published), exposing only MQTTS on `8883`.

**Access methods:** LAN IP, `<hostname>.local`, Tor `.onion`, custom domains.

---

## Actions (StartOS UI)

| Action                       | Input                        | Purpose                                                     |
| ---------------------------- | ---------------------------- | ---------------------------------------------------------- |
| Add MQTT User                | username                     | Create a new MQTT account; generates + shows its password  |
| User Credentials             | select user                  | Show an existing account's username and password           |
| Manage Friends               | per-user friend multiselects | Set, for each user, which other users they can see         |
| Reset User Password          | select user                  | Generate a new password for an account                     |
| Remove MQTT User             | select user                  | Delete an account and drop it from everyone's friends      |
| Admin Web Map Credentials    | none                         | Show the admin username/password for the web map           |
| Reset Admin Web Map Password | none                         | Generate a new admin password for the web map              |

MQTT actions that select an existing user are `visibility: 'hidden'` until at least one user exists (Manage Friends until at least two).

---

## Backups and Restore

**Included in backup:** the `main` volume (all credentials + broker persistence + recorded location history). Restore repopulates the volume before the service starts; credentials and history come back with it.

---

## Health Checks

| Check         | Method                | Daemon    |
| ------------- | --------------------- | --------- |
| MQTT Broker   | Port listening (1883) | mosquitto |
| Recorder      | Port listening (8083) | recorder  |
| Admin Web Map | Port listening (80)   | frontend  |

Startup order is enforced via `requires`: `setup-mosquitto` → `mosquitto` → `recorder` → `frontend`.

---

## Dependencies

None.

---

## Limitations and Differences

1. **The web map is an unpermissioned admin god-view.** It shows every device on the server to whoever holds the admin password — it does **not** honor the per-user Friend ACLs (the Recorder API can't). Treat the admin password as owner-only. Per-user privacy applies to the phone apps.
2. **The app username must equal the MQTT username.** The ACL only lets an account publish to `owntracks/<its-username>/#`, so the OwnTracks "username" and the MQTT username must match or publishes are denied.
3. **MQTTS requires trusting the StartOS certificate.** On a LAN/Tor address the cert is signed by your StartOS root CA, so the phone must trust that CA (install it, or use a custom domain with a publicly-trusted cert).
4. **Applying account/friend changes restarts the broker.** Because the daemons read `store.json` reactively, any user/friend edit briefly disconnects all apps while the broker reloads.

---

## Quick Reference for AI Consumers

```yaml
package_id: owntracks-recorder
images:
  mosquitto: eclipse-mosquitto:2.0.22
  recorder: owntracks/recorder:1.0.1
  frontend: owntracks/frontend:2.15.3
architectures: [x86_64, aarch64]
volumes:
  main:
    mosquitto: /mosquitto/data
    recorder: /store
ports:
  ui: 80               # Admin Web Map (frontend), TLS by StartOS, basic-auth gated
  mqtt_internal: 1883  # mosquitto (plaintext within pod)
  mqtt_external: 8883  # MQTTS, TLS terminated by StartOS via addSsl (only mqtt port published)
  recorder_http: 8083  # internal only, proxied by the gated frontend
web_ui: admin-only  # basic-auth (uiPassword, user 'admin'); shows ALL users (recorder API has no per-user authz)
dependencies: none
actions: [add-user, user-credentials, manage-friends, reset-user-password, remove-user, web-ui-credentials, reset-web-ui-password]
store_shape: { recorderPassword, uiPassword, users: { [username]: { password, friends: [username] } } }
mqtt_model: per-user accounts; acl readwrite owntracks/<user>/#, read owntracks/<friend>/# per granted friend
```
