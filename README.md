<p align="center">
  <img src="icon.svg" alt="OwnTracks Logo" width="21%">
</p>

# OwnTracks Recorder on StartOS

> **Upstream repo:** <https://github.com/owntracks/recorder>

[OwnTracks](https://owntracks.org/) lets you keep track of your own location. The OwnTracks mobile apps (iOS/Android) publish location updates to your own server; the **Recorder** stores and serves that data, and the **frontend** renders it on a map. This package wraps all of that into a private, self-hosted location-tracking service for StartOS.

This package bundles three containers:

- **Mosquitto** — an MQTT broker the phone apps publish to.
- **Recorder** (`ot-recorder`) — subscribes to the broker, stores location data in flat files, and exposes an HTTP API + WebSocket.
- **Frontend** — an nginx-served map UI that proxies to the Recorder's API.

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
phone apps ──MQTTS(8883)──▶ [StartOS TLS] ──▶ Mosquitto ──▶ Recorder ──HTTP(8083)──▶ Frontend (nginx :80) ──▶ Web UI
                            terminate        (broker :1883)  (ot-recorder)            /api, /ws proxied to recorder
```

All three containers share the pod's loopback, so the Recorder reaches Mosquitto on `127.0.0.1:1883` and the frontend proxies to the Recorder on `127.0.0.1:8083`. Only the **Web UI** (port 80) and the **MQTT broker** are exposed as StartOS interfaces; the Recorder HTTP API is internal. The MQTT interface is exposed as **MQTTS on 8883** — StartOS terminates TLS at the edge and forwards plaintext to mosquitto's internal `1883` (set via `addSsl` on the raw-TCP bind), so the broker needs no TLS config of its own.

---

## Image and Container Runtime

| Container | Image                       | Command                                                     |
| --------- | --------------------------- | ---------------------------------------------------------- |
| mosquitto | `eclipse-mosquitto:2.0.22`  | entrypoint with generated `mosquitto.conf`                  |
| recorder  | `owntracks/recorder:1.0.1`  | entrypoint `--http-host 127.0.0.1 --http-port 8083`         |
| frontend  | `owntracks/frontend:2.15.3` | entrypoint (`SERVER_HOST=127.0.0.1`, `SERVER_PORT=8083`)    |

Architectures: x86_64, aarch64.

---

## Volume and Data Layout

A single `main` volume holds everything (one backup target):

| Subpath          | Mount Point        | Purpose                                  |
| ---------------- | ------------------ | ---------------------------------------- |
| `store.json`     | —                  | MQTT users (per-user password + friends) + recorder password |
| `mosquitto`      | `/mosquitto/data`  | Broker persistence (retained messages)   |
| `recorder`       | `/store`           | Recorder location data (`rec/`, `last/`, `ghash/`) |

`mosquitto.conf`, the `acl` file, and the broker `passwd` file are generated into the mosquitto container's rootfs on every start from `store.json` — they are not persisted.

`store.json` shape: `{ recorderPassword, users: { [username]: { password, friends: string[] } } }`. Any change to it triggers `setupMain` to re-run (the daemons read it via `.const(effects)`), which regenerates `passwd`/`acl` and restarts the broker — so adding a user or editing friends applies on the automatic restart.

---

## Installation and First-Run Flow

1. On install, the package generates the internal Recorder↔broker password (`recorderPassword`) and starts with **no** user accounts (`users: {}`).
2. An **important task** prompts the user to run the **Add MQTT User** action to create an account for each person/device.
3. On every start, the `setup-mosquitto` oneshot rebuilds the Mosquitto `passwd` file (hashed via `mosquitto_passwd`, one entry per user plus `recorder`) and fixes ownership before the broker launches; `main.ts` writes the `acl` file from each user's friends list.

---

## Configuration Management

There are no free-form config forms. User-managed state is the set of MQTT users and their friend allow-lists, all handled through actions. `mosquitto.conf` is generated in code (`startos/utils.ts → mosquittoConfig()`): one authenticated listener on 1883, `allow_anonymous false`, `acl_file` enabled, persistence on.

### Accounts and ACLs (Friends)

- Each user is an MQTT account with its own password. The ACL grants `readwrite owntracks/<user>/#` — so a user can **only publish as themselves** (anti-spoofing) and read their own data.
- "Friends" is per-user read access: for each friend `F` granted, the user's stanza gets `read owntracks/<F>/#`, so their phone app receives `F`'s locations. Friends are **not** symmetric unless granted both ways.
- The `recorder` account has `readwrite owntracks/#` so it records everything and can relay remote commands.

---

## Network Access and Interfaces

| Interface | External Port | Protocol            | Type | Purpose                                   |
| --------- | ------------- | ------------------- | ---- | ----------------------------------------- |
| Web UI    | 80            | HTTP (TLS by OS)    | ui   | OwnTracks map and dashboard               |
| MQTT      | 8883          | MQTTS (TLS by OS)   | api  | Endpoint the phone apps publish to (auth) |

The MQTT bind is raw TCP internally (mosquitto on `1883`); StartOS adds TLS via `addSsl`, exposing MQTTS on `8883`. Apps connect with TLS and validate the StartOS-issued certificate.

**Access methods:** LAN IP, `<hostname>.local`, Tor `.onion`, custom domains. Per-user MQTT credentials are a second factor on top of StartOS network access control and the TLS layer.

---

## Actions (StartOS UI)

| Action               | Input                          | Purpose                                                       |
| -------------------- | ------------------------------ | ------------------------------------------------------------ |
| Add MQTT User        | username                       | Create a new MQTT account; generates + shows its password    |
| User Credentials     | select user                    | Show an existing account's username and password             |
| Manage Friends       | per-user friend multiselects   | Set, for each user, which other users they can see           |
| Reset User Password  | select user                    | Generate a new password for an account (app must be updated) |
| Remove MQTT User     | select user                    | Delete an account and drop it from everyone's friends        |

Actions that select an existing user are `visibility: 'hidden'` until at least one user exists (Manage Friends until at least two).

---

## Backups and Restore

**Included in backup:** the `main` volume (credentials + broker persistence + all recorded location data). Restore repopulates the volume before the service starts; credentials come back with it.

---

## Health Checks

| Check         | Method                | Daemon    |
| ------------- | --------------------- | --------- |
| MQTT Broker   | Port listening (1883) | mosquitto |
| Recorder      | Port listening (8083) | recorder  |
| Web Interface | Port listening (80)   | frontend  |

Startup order is enforced via `requires`: `setup-mosquitto` → `mosquitto` → `recorder` → `frontend`.

---

## Dependencies

None.

---

## Limitations and Differences

1. **HTTP-from-app mode is not used** — phone apps connect over **MQTT** to the bundled broker. This gives real-time "Friends" via the broker, with per-user ACLs controlling who sees whom.
2. **The app username must equal the MQTT username.** The ACL only lets an account publish to `owntracks/<its-username>/#`, so the OwnTracks "username" and the MQTT username must match or publishes are denied.
3. **MQTTS requires trusting the StartOS certificate.** TLS is terminated by StartOS on 8883; on a LAN/Tor address the cert is signed by your StartOS root CA, so the phone must trust that CA (install it, or use a custom domain with a publicly-trusted cert).
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
  ui: 80               # frontend (web map), TLS by StartOS
  mqtt_internal: 1883  # mosquitto (plaintext within pod)
  mqtt_external: 8883  # MQTTS, TLS terminated by StartOS via addSsl
  recorder_http: 8083  # internal only, proxied by frontend
dependencies: none
actions: [add-user, user-credentials, manage-friends, reset-user-password, remove-user]
store_shape: { recorderPassword, users: { [username]: { password, friends: [username] } } }
mqtt_model: per-user accounts; acl readwrite owntracks/<user>/#, read owntracks/<friend>/# per granted friend
```
