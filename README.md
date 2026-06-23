<p align="center">
  <img src="icon.svg" alt="OwnTracks Logo" width="21%">
</p>

# OwnTracks Recorder on StartOS

> **Upstream repo:** <https://github.com/owntracks/recorder>

[OwnTracks](https://owntracks.org/) lets you keep track of your own location. The OwnTracks mobile apps (iOS/Android) publish location updates to your own server; the **Recorder** stores that history. This package runs a private MQTT broker for the apps to publish to, plus the Recorder to archive everything — a self-hosted location backbone for you and your household.

This package bundles two containers:

- **Mosquitto** — an MQTT broker the phone apps publish to, with one account per person/device and per-user ACLs (Friends).
- **Recorder** (`ot-recorder`) — subscribes to the broker and archives location data to disk.

## No web UI — by design

Earlier iterations bundled the OwnTracks web map (`owntracks/frontend`). It was removed deliberately: the Recorder's HTTP API has **no per-user authorization** — it serves every user's location data to any caller. A shared web login would therefore expose everyone's location to anyone who could open it, defeating the whole point of the per-user MQTT ACLs. Rather than ship a privacy hole, viewing happens **in the OwnTracks phone apps** (which honor the friend ACLs), and the Recorder quietly archives history (recoverable via backup).

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
phone apps ──MQTTS(8883)──▶ [StartOS TLS] ──▶ Mosquitto ──▶ Recorder
                            terminate         (broker :1883)  (ot-recorder, archives to /store)
```

Both containers share the pod's loopback, so the Recorder reaches Mosquitto on `127.0.0.1:1883`. Only the **MQTT broker** is exposed as a StartOS interface — as **MQTTS on 8883** (StartOS terminates TLS at the edge via `addSsl` and forwards plaintext to mosquitto's internal `1883`, so the broker needs no TLS config of its own). The Recorder's HTTP API stays bound to `127.0.0.1` and is **not** exposed.

---

## Image and Container Runtime

| Container | Image                      | Command                                              |
| --------- | -------------------------- | --------------------------------------------------- |
| mosquitto | `eclipse-mosquitto:2.0.22` | entrypoint with generated `mosquitto.conf`           |
| recorder  | `owntracks/recorder:1.0.1` | entrypoint `--http-host 127.0.0.1 --http-port 8083`   |

Architectures: x86_64, aarch64.

---

## Volume and Data Layout

A single `main` volume holds everything (one backup target):

| Subpath      | Mount Point       | Purpose                                            |
| ------------ | ----------------- | ------------------------------------------------- |
| `store.json` | —                 | MQTT users (per-user password + friends) + recorder password |
| `mosquitto`  | `/mosquitto/data` | Broker persistence (retained messages)            |
| `recorder`   | `/store`          | Recorder location history (`rec/`, `last/`, `ghash/`) |

`mosquitto.conf`, the `acl` file, and the broker `passwd` file are generated into the mosquitto container's rootfs on every start from `store.json` — they are not persisted.

`store.json` shape: `{ recorderPassword, users: { [username]: { password, friends: string[] } } }`. Any change to it triggers `setupMain` to re-run (daemons read it via `.const(effects)`), regenerating `passwd`/`acl` and restarting the broker — so adding a user or editing friends applies on the automatic restart.

---

## Installation and First-Run Flow

1. On install, the package generates the internal Recorder↔broker password (`recorderPassword`) and starts with **no** user accounts (`users: {}`).
2. An **important task** prompts the user to run the **Add MQTT User** action to create an account for each person/device.
3. On every start, the `setup-mosquitto` oneshot rebuilds the Mosquitto `passwd` file (hashed via `mosquitto_passwd`, one entry per user plus `recorder`) and fixes ownership before the broker launches; `main.ts` writes the `acl` file from each user's friends list.

---

## Configuration Management

There are no free-form config forms. User-managed state is the set of MQTT users and their friend allow-lists, all handled through actions. `mosquitto.conf` is generated in code (`startos/utils.ts → mosquittoConfig()`): one authenticated listener on 1883, `allow_anonymous false`, `acl_file` enabled, persistence on.

### Accounts and ACLs (Friends)

- Each user is an MQTT account with its own password. The ACL grants `readwrite owntracks/<user>/#` — so a user can **only publish as themselves** (anti-spoofing).
- "Friends" is per-user read access: for each friend `F` granted, the user's stanza gets `read owntracks/<F>/#`, so their phone app receives `F`'s locations. Friends are **not** symmetric unless granted both ways.
- The `recorder` account has `readwrite owntracks/#` so it records everything.

---

## Network Access and Interfaces

| Interface | External Port | Protocol          | Type | Purpose                                   |
| --------- | ------------- | ----------------- | ---- | ----------------------------------------- |
| MQTT      | 8883          | MQTTS (TLS by OS) | api  | Endpoint the phone apps publish to (auth) |

The MQTT bind is raw TCP internally (mosquitto on `1883`); StartOS adds TLS via `addSsl` (`secure: null`, so no plaintext endpoint is published), exposing only MQTTS on `8883`. Apps connect with TLS and validate the StartOS-issued certificate.

**Access methods:** LAN IP, `<hostname>.local`, Tor `.onion`, custom domains. Per-user MQTT credentials are a second factor on top of StartOS network access control and the TLS layer.

---

## Actions (StartOS UI)

| Action               | Input                        | Purpose                                                      |
| -------------------- | ---------------------------- | ----------------------------------------------------------- |
| Add MQTT User        | username                     | Create a new MQTT account; generates + shows its password   |
| User Credentials     | select user                  | Show an existing account's username and password            |
| Manage Friends       | per-user friend multiselects | Set, for each user, which other users they can see          |
| Reset User Password  | select user                  | Generate a new password for an account (app must be updated) |
| Remove MQTT User     | select user                  | Delete an account and drop it from everyone's friends       |

Actions that select an existing user are `visibility: 'hidden'` until at least one user exists (Manage Friends until at least two).

---

## Backups and Restore

**Included in backup:** the `main` volume (users/credentials + broker persistence + all recorded location history). Restore repopulates the volume before the service starts; credentials and history come back with it. With no web UI, backup/restore (or a future export action) is how recorded history is retrieved off the device.

---

## Health Checks

| Check       | Method                | Daemon    |
| ----------- | --------------------- | --------- |
| MQTT Broker | Port listening (1883) | mosquitto |
| Recorder    | Port listening (8083) | recorder  |

Startup order is enforced via `requires`: `setup-mosquitto` → `mosquitto` → `recorder`. The recorder check uses its localhost HTTP listener purely as a liveness signal; the API is not exposed.

---

## Dependencies

None.

---

## Limitations and Differences

1. **No web map.** Removed on purpose — the Recorder API can't enforce per-user visibility, so a shared web view would leak everyone's location. View live positions in the OwnTracks phone apps (which honor Friends); retrieve history via backup.
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
architectures: [x86_64, aarch64]
volumes:
  main:
    mosquitto: /mosquitto/data
    recorder: /store
ports:
  mqtt_internal: 1883  # mosquitto (plaintext within pod)
  mqtt_external: 8883  # MQTTS, TLS terminated by StartOS via addSsl (only exposed port)
  recorder_http: 8083  # localhost only, NOT exposed (liveness check / future export)
web_ui: none  # removed: recorder API has no per-user authz; would leak all locations
dependencies: none
actions: [add-user, user-credentials, manage-friends, reset-user-password, remove-user]
store_shape: { recorderPassword, users: { [username]: { password, friends: [username] } } }
mqtt_model: per-user accounts; acl readwrite owntracks/<user>/#, read owntracks/<friend>/# per granted friend
```
