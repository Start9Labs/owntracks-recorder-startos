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
phone apps ──MQTT(1883)──▶ Mosquitto ──▶ Recorder ──HTTP(8083)──▶ Frontend (nginx :80) ──▶ Web UI
                            (broker)      (ot-recorder)             /api, /ws proxied to recorder
```

All three containers share the pod's loopback, so the Recorder reaches Mosquitto on `127.0.0.1:1883` and the frontend proxies to the Recorder on `127.0.0.1:8083`. Only the **Web UI** (port 80) and the **MQTT broker** (port 1883) are exposed as StartOS interfaces; the Recorder HTTP API is internal.

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
| `store.json`     | —                  | MQTT credentials (managed by this package) |
| `mosquitto`      | `/mosquitto/data`  | Broker persistence (retained messages)   |
| `recorder`       | `/store`           | Recorder location data (`rec/`, `last/`, `ghash/`) |

`mosquitto.conf` and the broker `passwd` file are generated into the mosquitto container's rootfs on every start from `store.json` — they are not persisted.

---

## Installation and First-Run Flow

1. On install, the package generates a random password for the user-facing MQTT account (username `owntracks`) and a separate internal password for the Recorder's broker connection, storing both in `store.json`.
2. An **important task** prompts the user to open the **MQTT Credentials** action and save the username/password for entry into the phone apps.
3. On every start, a oneshot rebuilds the Mosquitto `passwd` file (hashed via `mosquitto_passwd`) and fixes ownership before the broker launches.

---

## Configuration Management

There are no free-form config forms. The only user-managed state is the MQTT password, handled through actions. `mosquitto.conf` is generated in code (`startos/utils.ts → mosquittoConfig()`): one authenticated listener on 1883, `allow_anonymous false`, persistence on.

---

## Network Access and Interfaces

| Interface | Port | Protocol | Type | Purpose                                    |
| --------- | ---- | -------- | ---- | ------------------------------------------ |
| Web UI    | 80   | HTTP     | ui   | OwnTracks map and dashboard                |
| MQTT      | 1883 | raw TCP  | api  | Endpoint the phone apps publish to (auth)  |

**Access methods:** LAN IP, `<hostname>.local`, Tor `.onion`, custom domains. MQTT auth (username/password) is a second factor on top of StartOS network access control.

---

## Actions (StartOS UI)

| Action               | Input | Purpose                                                            |
| -------------------- | ----- | ----------------------------------------------------------------- |
| MQTT Credentials     | none  | Display the MQTT username and password for app setup              |
| Reset MQTT Password  | none  | Generate a new random MQTT password (apps must be updated)        |

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

1. **HTTP-from-app mode is not used** — phone apps connect over **MQTT** to the bundled broker. This gives automatic, real-time "Friends" (each app sees the others) without manual allow-list configuration.
2. **Single shared MQTT account** — all phone apps authenticate with the one `owntracks` MQTT account and distinguish themselves by the username/device set in the app. Per-user MQTT accounts and ACLs are not yet exposed.
3. **MQTT is served as plaintext TCP** on 1883. Use it over LAN/VPN, or rely on StartOS network access control (Tor/custom domain). TLS for MQTT is not yet wired up.

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
  ui: 80          # frontend (web map)
  mqtt: 1883      # mosquitto (phone apps publish here)
  recorder_http: 8083  # internal only, proxied by frontend
dependencies: none
actions: [mqtt-credentials, reset-mqtt-password]
mqtt_user: owntracks
```
