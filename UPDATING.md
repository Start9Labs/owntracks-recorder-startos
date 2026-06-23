# Updating the upstream versions

This package wraps three upstream images, each pinned in `startos/manifest/index.ts` under `images`:

| Image key   | Pin                         | Upstream                                              |
| ----------- | --------------------------- | ---------------------------------------------------- |
| `recorder`  | `owntracks/recorder:<ver>`  | [owntracks/recorder](https://github.com/owntracks/recorder) |
| `frontend`  | `owntracks/frontend:<ver>`  | [owntracks/frontend](https://github.com/owntracks/frontend) |
| `mosquitto` | `eclipse-mosquitto:<ver>`   | [eclipse-mosquitto/mosquitto](https://github.com/eclipse-mosquitto/mosquitto) |

The Recorder is the primary upstream and drives the package `version` in `startos/versions/current.ts`.

## Determining the latest versions

```sh
gh release view -R owntracks/recorder --json tagName -q .tagName
gh release view -R owntracks/frontend --json tagName -q .tagName
# Mosquitto: stick to the latest 2.0.x tag on Docker Hub (library/eclipse-mosquitto)
```

Confirm each tag is published and multi-arch (x86_64 + aarch64) before pinning it.

## Applying a bump

1. Update the relevant `dockerTag`(s) in `startos/manifest/index.ts`.
2. If the Recorder version changed, update `version` in `startos/versions/current.ts` (format `<recorder-version>:<packaging-revision>`).
3. Update `releaseNotes`, then `make` to verify the build.
