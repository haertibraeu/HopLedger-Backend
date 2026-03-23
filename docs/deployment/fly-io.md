# Deployment: Fly.io

[Fly.io](https://fly.io) runs Docker containers close to your users across a global network of edge regions. It's well-suited for a low-traffic API that needs a public HTTPS endpoint.

## Prerequisites

- A Fly.io account ([fly.io](https://fly.io))
- `flyctl` CLI installed: `curl -L https://fly.io/install.sh | sh`
- Logged in: `fly auth login`

## Steps

### 1. Create a `fly.toml`

In the repository root, create `fly.toml`:

```toml
app = "hopledger-backend"
primary_region = "fra"   # change to the region closest to you

[build]
  image = "ghcr.io/haertibraeu/hopledger-backend:latest"

[env]
  PORT = "3000"
  SHOW_LOCATIONS = "true"

[http_service]
  internal_port = 3000
  force_https = true
  auto_stop_machines = true
  auto_start_machines = true
  min_machines_running = 0

[[vm]]
  memory = "256mb"
  cpu_kind = "shared"
  cpus = 1
```

### 2. Provision a PostgreSQL database

```bash
fly postgres create --name hopledger-db --region fra
fly postgres attach hopledger-db --app hopledger-backend
```

`fly postgres attach` automatically sets the `DATABASE_URL` secret on your app.

### 3. Set secrets

```bash
fly secrets set API_KEY="$(openssl rand -hex 32)"
```

### 4. Deploy

```bash
fly deploy
```

Fly builds (or pulls) the image and starts the container in the selected region.

### 5. Verify

```bash
fly status
curl https://hopledger-backend.fly.dev/api/health
```

## Seed Default Categories

```bash
fly ssh console -a hopledger-backend
# Inside the container:
npx tsx prisma/seed.ts
```

## Auto-deploy via GitHub Actions

Add the following step to your existing `.github/workflows` file after the image push:

```yaml
- name: Deploy to Fly.io
  uses: superfly/flyctl-actions/setup-flyctl@master
- run: fly deploy --remote-only
  env:
    FLY_API_TOKEN: ${{ secrets.FLY_API_TOKEN }}
```

Store your Fly API token as a GitHub secret: `fly tokens create deploy`.

## Cost

Fly.io has a free allowance (3 shared VMs + 3 GB persistent storage). A single-machine deployment for a low-traffic API typically stays within the free tier.
