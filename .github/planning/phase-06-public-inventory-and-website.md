# Phase 6 — Public Inventory Endpoint + Website Setup

This phase spans **two repositories**: `haertibraeu/HopLedger-Backend` and `haertibraeu/website`.

---

## Part A — Backend: Public Inventory Endpoint

**Repository:** `haertibraeu/HopLedger-Backend`
**Depends on:** Phase 3 (Inventory/Container Management)

### Description

Expose a single, unauthenticated (or lightly authenticated) endpoint that returns the
currently available, non-reserved, filled inventory — grouped by beer and container type.
This feed is consumed by the website's scheduled data sync.

### Endpoint

```
GET /api/public/inventory
```

**Response shape:**
```json
{
  "last_updated": "2026-03-20T14:30:00Z",
  "show_locations": true,
  "beers": [
    {
      "name": "Brown Ale",
      "containers": [
        { "type": "0.5l Bottle", "count": 12, "location": "Brewery" },
        { "type": "2l Bottle",   "count": 3,  "location": "At Brewer A" }
      ]
    }
  ]
}
```

**Filtering rules:**
- Only containers where `is_empty = false` AND `is_reserved = false`
- Grouped by beer name → container type name
- `show_locations` is a backend-configurable flag (e.g., env var or DB setting); when `false`, omit the `location` field from each entry

### Acceptance Criteria

- [ ] `GET /api/public/inventory` returns HTTP 200 with valid JSON matching the schema above
- [ ] Reserved containers are excluded
- [ ] Empty containers are excluded
- [ ] `show_locations` flag controls whether location data is included in the response
- [ ] No authentication required (or a read-only public API key, configurable)
- [ ] Response is suitable for direct consumption by a GitHub Actions workflow (stable schema)
- [ ] Integration test verifies filtering logic (reserved/empty containers must not appear)

---

## Part B — Website: Jekyll Setup + GitHub Action Inventory Sync

**Repository:** `haertibraeu/website`  
**Note:** This repository is not yet set up. Create this issue there once the repo is initialised.

### Description

Set up a GitHub Pages / Jekyll static site that displays the public inventory feed from
the backend. A scheduled GitHub Action fetches the data and writes it as a Jekyll data
file, triggering a Pages rebuild.

### Tasks

- [ ] Initialise Jekyll site with a clean theme (e.g., Minima or custom)
- [ ] Create `_data/inventory.json` placeholder
- [ ] Create `inventory.html` page that reads `site.data.inventory` and renders beer/container cards
- [ ] Conditionally show location column based on `show_locations` flag in the data file
- [ ] Show "last updated" timestamp prominently
- [ ] Create `.github/workflows/sync-inventory.yml` GitHub Action:
  - Runs on a schedule (every 15 minutes) and on `workflow_dispatch`
  - Fetches `GET /api/public/inventory` from the backend (URL in `BACKEND_URL` secret)
  - Writes output to `_data/inventory.json`
  - Commits and pushes only if the file changed
- [ ] Add `BACKEND_URL` secret documentation to README

### Acceptance Criteria

- [ ] Site builds successfully on GitHub Pages with Jekyll
- [ ] Inventory page renders all available beers and container counts from `_data/inventory.json`
- [ ] GitHub Action runs on schedule and updates the data file when inventory changes
- [ ] Empty data file (no beers) renders a friendly "no inventory available" message
- [ ] Page is mobile-friendly

### Cross-Repo Notes

- **HopLedger-Backend:** Requires Phase 6 Part A (public endpoint) to be deployed before the sync action is useful
- **Backend URL** must be stored as a GitHub Actions secret in the `website` repository
