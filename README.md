<p align="center">
  <img src="icon.svg" alt="OwnTracks Recorder Logo" width="21%">
</p>

# OwnTracks Recorder on StartOS

> Everything not listed in this document should behave the same as upstream
> OwnTracks Recorder. If a feature, setting, or behavior is not mentioned here,
> the upstream documentation is accurate and fully applicable — see the
> Documentation section of `instructions.md` for links.

[OwnTracks Recorder](https://github.com/owntracks/recorder) stores and displays the location history your OwnTracks phone apps publish. This package bundles the MQTT broker those apps talk to, generates every credential, and derives the broker's access rules from the users you create — so one person's phone can never read another's location unless you say so.

- **Upstream repo:** <https://github.com/owntracks/recorder>
- **Wrapper repo:** <https://github.com/Start9Labs/owntracks-recorder-startos>

---

## Table of Contents

- [Image and Container Runtime](#image-and-container-runtime)
- [Volume and Data Layout](#volume-and-data-layout)
- [File Models](#file-models)
- [Dependencies](#dependencies)
- [Network Access and Interfaces](#network-access-and-interfaces)
- [Installation and First-Run Flow](#installation-and-first-run-flow)
- [Actions](#actions)
- [Tasks](#tasks)
- [Health Checks](#health-checks)
- [Backups and Restore](#backups-and-restore)
- [Limitations and Differences](#limitations-and-differences)
- [Quick Reference for AI Consumers](#quick-reference-for-ai-consumers)

---

## Image and Container Runtime

Three upstream images, unmodified, run as three daemons in a fixed chain.

| Property      | Value                                                           |
| ------------- | --------------------------------------------------------------- |
| Images        | `eclipse-mosquitto`, `owntracks/recorder`, `owntracks/frontend` |
| Architectures | x86_64, aarch64                                                 |

| Subcontainer    | Daemon      | Starts after | Purpose                                        |
| --------------- | ----------- | ------------ | ---------------------------------------------- |
| `mosquitto-sub` | `mosquitto` | —            | The MQTT broker the phone apps publish to      |
| `recorder-sub`  | `recorder`  | `mosquitto`  | Subscribes to the broker and stores the tracks |
| `frontend-sub`  | `frontend`  | `recorder`   | The web map, proxying the recorder             |

**Mosquitto's configuration is generated, not stored.** The broker's `mosquitto.conf` and its ACL file are written into the container's root filesystem on every start, derived from the users in the package's store — so they cannot drift, and they cannot be edited to outlive a restart.

A oneshot, `setup-mosquitto`, then builds the hashed password file from those same users before the broker starts, and locks both files down to the broker's own uid.

**Only the web map's port is published.** The recorder binds loopback inside the service, and the frontend reaches it there.

## Volume and Data Layout

One volume, mounted into two containers at different subpaths.

| Volume | Mount Point                           | Purpose                                      |
| ------ | ------------------------------------- | -------------------------------------------- |
| `main` | its `mosquitto/` at `/mosquitto/data` | The broker's persistence                     |
| `main` | its `recorder/` at `/store`           | Every recorded location, per user and device |
| `main` | — (host side)                         | `store.json`                                 |

The recorder's store is the location history itself, and it is the thing worth protecting: it is a continuous record of where the tracked people have been.

## File Models

One model. Nothing else on disk is configuration — the broker's files are regenerated each start, and the recorder is configured entirely by environment.

| File         | Format | Modelled                | Written by                    |
| ------------ | ------ | ----------------------- | ----------------------------- |
| `store.json` | JSON   | Yes — `FileHelper.json` | Install, and the user actions |

| Key                | Set by                     | Notes                                                            |
| ------------------ | -------------------------- | ---------------------------------------------------------------- |
| `recorderPassword` | Install                    | The recorder's own broker credential; internal, never shown      |
| `uiPassword`       | Set Admin Web Map Password | Empty until you set it, which is what the `critical` task is for |
| `users`            | The user actions           | Each user's MQTT password and their friends list                 |

**The `users` map is the source of truth for the broker's access control.** Both the password file and the ACL are rebuilt from it at every start, so adding a user, changing a password, or granting a friendship is a write here and a restart — never an edit to a broker file.

The ACL that gets generated gives each user read and write on their own topics only, plus read on each friend they have been granted. The recorder itself gets read and write across everything, since it has to record all of it and relay commands back.

## Dependencies

None. The broker, the recorder, and the map are all bundled.

## Network Access and Interfaces

Two interfaces, and they are secured in completely different ways.

| Interface     | Id     | Type | Port | Description                                       |
| ------------- | ------ | ---- | ---- | ------------------------------------------------- |
| Admin Web Map | `ui`   | ui   | 80   | The admin view of every device on the server      |
| MQTT Broker   | `mqtt` | api  | 1883 | Where the OwnTracks apps publish location updates |

**The web map has no permission model at all** — it shows every device on the server. Its protection is HTTP basic auth applied at the StartOS reverse proxy, with the username `admin` and the password you set. That is entirely separate from the MQTT credentials, and it is why the service will not start until the password exists.

The address deliberately carries no `admin@` prefix. Folding the username into the URL is what the SDK would do by default, and Chromium-based browsers strip or refuse userinfo in a top-level navigation — so the launch link would simply break. The basic-auth prompt asks for the username instead; it is always `admin`.

**The MQTT binding offers both plaintext and TLS**, and advertises itself with `mqtt://` or `mqtts://` rather than an HTTP scheme, so the address copies straight into a phone app. Per-user authentication and the topic ACL are the broker's, not the proxy's.

## Installation and First-Run Flow

Install generates the recorder's internal broker credential and raises two tasks. **The service does not usefully start until the first one is done.**

1. **Set Admin Web Map Password** (`critical`). Until it is set, the basic-auth gate falls back to an empty password and the map is locked. This task is checked on every start, not just at install.
2. **Add MQTT User** (`important`), once per person or device that will be tracked. Each gets a generated password, shown once.

Then configure each OwnTracks app with the MQTT address, that user's username and password, and — if people should see each other on their phones — grant the friendships.

## Actions

Seven actions, all available whether or not the service is running, and all applied by the restart they trigger. Four of them **only appear once at least one user exists**, so a fresh install shows a short list.

### Add MQTT User

Creates an account for a person or a device.

- **What it changes:** a new entry in `users`; through it the broker's password file and ACL on the next start.
- **Cost:** seconds, then a restart.
- **Repeat safety:** each run adds one user. The name is validated, and `recorder` is reserved — that account is the recorder's own.
- **Outputs:** the username and generated password, shown once.

### User Credentials

Shows an existing account's username and password.

- **Cost:** seconds. Changes nothing.
- **This is why passwords are recoverable here** — they are stored so they can be re-shown and so the broker's password file can be rebuilt from them.

### Manage Friends

For each user, chooses which other users their phone app can see.

- **What it changes:** the `friends` lists; through them the ACL's read grants.
- **Cost:** seconds, then a restart.
- **Repeat safety:** idempotent; the form is pre-filled.
- **Friendship is directional as configured.** Granting A sight of B does not grant B sight of A unless you set both.

### Reset User Password

Generates a new password for an existing account.

- **Cost:** seconds, then a restart.
- **Repeat safety:** safe to re-run.
- **That user's apps stop working until updated.** They are disconnected the moment the broker restarts with the new password.

### Remove MQTT User

Deletes an account.

- **What it changes:** removes the user from `users` **and from every other user's friends list**, so no dangling grant is left behind.
- **Cost:** seconds, then a restart.
- **Their recorded history is not deleted** — use Forget Device Tracks for that.

### Set Admin Web Map Password

Generates a new admin password for the web map.

- **What it changes:** `uiPassword`; through it the basic-auth credential on the interface.
- **Cost:** seconds, then a restart.
- **Repeat safety:** safe to re-run; each run generates a fresh password and invalidates the old one.

### Forget Device Tracks

Wipes one device's location history and its last-known position from the map.

- **What it changes:** the recorder's store, for one user-and-device pair.
- **Cost:** seconds.
- **This is not reversible.** The history is gone from the map and from disk; only a backup has it.
- **It is per device, not per user.** A person tracking from two phones has two device histories.

## Tasks

Two tasks, and one of them can come back.

| Task                       | Severity    | Raised when                       | Cleared when    |
| -------------------------- | ----------- | --------------------------------- | --------------- |
| Set Admin Web Map Password | `critical`  | Whenever no admin password is set | The action runs |
| Add MQTT User              | `important` | At install                        | The action runs |

The password task is checked on every init and re-raises if the password is cleared. `critical` because the web map shows every tracked person's location and its only protection is that password.

The user task is `important`: the service runs fine without any MQTT accounts, it just has nothing publishing to it.

## Health Checks

Three checks, one per daemon, and the chain is the useful part.

| Check       | Displayed       | Method                                    |
| ----------- | --------------- | ----------------------------------------- |
| `mosquitto` | "MQTT Broker"   | Port 1883 is listening                    |
| `recorder`  | "Recorder"      | The recorder's loopback port is listening |
| `frontend`  | "Admin Web Map" | Port 80 is listening                      |

Each waits on the one before it, so a service stuck starting is waiting further down than the check you are looking at. A `mosquitto` failure is usually the generated password or ACL file — the oneshot that builds them runs first, and its output is in the service logs.

Every check green while a phone app cannot connect points at credentials or the ACL rather than the service: the broker rejects anonymous connections outright, and a user can only publish under their own topic.

## Backups and Restore

The `main` volume is copied wholesale — `sdk.Backups.ofVolumes('main')`. No dump step and nothing excluded.

- **Included:** every recorded location for every user and device, the broker's persistence, and `store.json` with the admin password, the recorder's credential, and every user's MQTT password in the clear.
- **This backup is a complete location history.** Treat it with the same care as the service itself.
- **Restore:** complete, and no task is raised — the admin password and every account come back. Phone apps keep working, since their credentials are unchanged.

## Limitations and Differences

1. **The web map has no per-user view.** It shows every device on the server, and basic auth is all that stands in front of it.
2. **MQTT passwords are stored recoverably**, which is what lets them be re-shown and the broker's password file be rebuilt.
3. **Mosquitto's config and ACL are regenerated every start** from the package's store; hand edits do not survive.
4. **The recorder's HTTP port is not published** — only the frontend reaches it.
5. **Removing a user does not delete their location history.**
6. **Forgetting a device's tracks is irreversible.**
7. **Four actions are hidden until a user exists**, so the action list changes shape after the first one is added.
8. **No riscv64 build.** x86_64 and aarch64 only.

---

## Quick Reference for AI Consumers

```yaml
package_id: owntracks-recorder
image: owntracks/recorder # plus eclipse-mosquitto and owntracks/frontend
architectures:
  - x86_64
  - aarch64
subcontainers:
  - mosquitto-sub # the MQTT broker; also runs the setup-mosquitto oneshot
  - recorder-sub # subscribes and stores tracks
  - frontend-sub # the web map, proxies the recorder
volumes:
  main: its mosquitto/ at /mosquitto/data, its recorder/ at /store; store.json host side
file_models:
  - store.json
startos_managed_env_vars:
  - OTR_HOST # recorder-sub
  - OTR_PORT # recorder-sub
  - OTR_USER # recorder-sub
  - OTR_PASS # recorder-sub
  - LISTEN_PORT # frontend-sub
  - SERVER_HOST # frontend-sub
  - SERVER_PORT # frontend-sub
dependencies: []
interfaces:
  ui: { type: ui, port: 80 } # basic auth at the StartOS proxy, user "admin"
  mqtt: { type: api, port: 1883 } # plus TLS; advertised as mqtt:// / mqtts://
actions:
  - add-user
  - user-credentials # hidden until a user exists
  - manage-friends # hidden until a user exists
  - reset-user-password # hidden until a user exists
  - remove-user # hidden until a user exists
  - set-web-ui-password
  - forget-tracks
tasks:
  - { action: set-web-ui-password, severity: critical } # re-raises whenever unset
  - { action: add-user, severity: important }
health_checks:
  - mosquitto # displayed "MQTT Broker"
  - recorder # displayed "Recorder"
  - frontend # displayed "Admin Web Map"
```
