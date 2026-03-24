# Releasing HopLedger Backend

Follow these steps every time you publish a new version.

## 1. Update version files

Edit `apps/hopledger-backend/config.json`:

| Field | Action |
|-------|--------|
| `"version"` | Set to the new semver (e.g. `"1.3.0"`) |
| `"tipi_version"` | Increment by **1** (e.g. `4` → `5`) — **required for Runtipi to detect and offer the update to existing installs** |
| `"updated_at"` | Set to current Unix timestamp in milliseconds (e.g. `Date.now()` in Node) |

Edit `package.json`:

| Field | Action |
|-------|--------|
| `"version"` | Set to the same semver as above |

## 2. Commit and tag

```bash
git add apps/hopledger-backend/config.json package.json
git commit -m "chore: release vX.Y.Z"
git tag vX.Y.Z
git push && git push --tags
```

## 3. CI takes over

The GitHub Actions workflow triggers on `v*.*.*` tags and:

1. Builds a multi-arch Docker image (`linux/amd64` + `linux/arm64`)
2. Publishes it to `ghcr.io/haertibraeu/hopledger-backend:latest` and `:vX.Y.Z`
3. Creates a GitHub Release

## 4. Runtipi users

Because `tipi_version` was incremented, Runtipi will show an **Update** button in the app panel. Users click it — Runtipi pulls the new image and restarts.

> ⚠️ If you forget to increment `tipi_version`, existing Runtipi installs will **not** be notified of the update even though the `:latest` image changed.
