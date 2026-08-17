# AGENTS.md

This is a StartOS service-package repository — it builds a `.s9pk` for StartOS.

Develop it inside a StartOS packaging workspace created by `start-cli s9pk init-workspace`,
which provides the packaging guide and agent context one level up. If you're reading this in a
bare clone with no workspace, the full guide is at <https://docs.start9.com/packaging>.

Work this package's `TODO.md` from top to bottom. Keep `README.md` (technical reference for an AI support or administering agent) and `instructions.md` (end-user docs) in sync with your changes.

## This repo

- **`store.json`'s `users` map is the source of truth for broker access.** Mosquitto's password file and ACL are rebuilt from it on every start, so a change is a write there plus a restart — never an edit to a broker file, which is regenerated into the container rootfs and cannot persist.
- **Don't set `username` on the web-map interface.** The SDK folds it into the address as `admin@<host>`, and Chromium-based browsers strip or refuse userinfo in a top-level navigation, breaking the launch link. The `addSsl.auth` gate still prompts for it.
- **MQTT passwords are stored recoverably on purpose** — the password file has to be rebuildable from them, and User Credentials re-shows them. Don't "improve" this to a hash.
- **Removing a user must also strip them from every other user's friends list**, or the ACL generator emits a grant for an account that no longer exists.
- **The recorder's HTTP port binds loopback and is not published.** Only the frontend reaches it; exposing it would bypass the basic-auth gate entirely.
