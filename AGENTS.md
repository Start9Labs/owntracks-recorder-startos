# AGENTS.md

This is a StartOS service-package repository — it builds a `.s9pk` for StartOS.

Develop it inside a StartOS packaging workspace created by `start-cli s9pk init-workspace`,
which provides the packaging guide and agent context one level up. If you're reading this in a
bare clone with no workspace, the full guide is at <https://docs.start9.com/packaging>.

Work this package's `TODO.md` from top to bottom. Keep `README.md` (architecture, for developers and LLMs) and `instructions.md` (end-user docs) in sync with your changes.

## This repo

- **Package id is `owntracks-recorder`.** It runs three subcontainers from three upstream images: `mosquitto-sub` (a private Mosquitto MQTT broker), `recorder-sub` (the OwnTracks Recorder that archives location history), and `frontend-sub` (the admin web map). See `UPDATING.md` for the per-image version-bump procedure.
- **Two interfaces** (defined inline in `startos/interfaces.ts`): `ui` — the admin web map, gated by a separate basic-auth admin password (set via the `set-web-ui-password` action, held in `store.json`), and `mqtt` — the broker endpoint the OwnTracks phone apps publish to. The `ui` interface deliberately leaves `username: null` so browsers don't strip the launch link's userinfo; the basic-auth prompt still asks for the fixed `admin` username.
- **MQTT accounts, the internal recorder↔broker password, and web-map password all live in `store.json`** (`startos/fileModels/store.json.ts`), managed by the actions. `main.ts` regenerates the Mosquitto `passwd`/`acl` files from it each run via the `setup-mosquitto` oneshot.

## Inspecting a running install

To run a command inside the service's container (read its generated config, grep app logs), use `start-cli package attach owntracks-recorder -n <name> -- <cmd>`. Select the subcontainer by **name** with `-n` — one of `mosquitto-sub`, `recorder-sub`, or `frontend-sub` (the names passed to `SubContainer.of` in `main.ts`) — or by image with `-i`. Note: `-s/--subcontainer` matches the internal **Guid**, not the name, so passing a name to `-s` fails with "no matching subcontainers".
