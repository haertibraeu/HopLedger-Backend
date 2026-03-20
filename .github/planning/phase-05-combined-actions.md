# Phase 5 — Backend: Combined Actions (Sell, Self-Consume, Container Return)

**Repository:** `haertibraeu/HopLedger-Backend`
**Depends on:** Phase 3 (Inventory/Container Management), Phase 4 (Accounting Entries & Settlements)

## Description

Implement the three combined actions that touch both the inventory and accounting layers
simultaneously. Each action must atomically update container state *and* create the
corresponding accounting entry for the responsible brewer in a single database transaction.

### Sell (`POST /api/actions/sell`)

Brewer A sells a filled container to a customer.

| Step | What happens |
|------|--------------|
| Inventory | Container moves from current location → `At Customer` location |
| Accounting | `+external_price + deposit_fee` credited to selling brewer's account |
| State | `is_reserved` cleared if set; container keeps its beer / `is_empty = false` |

**Request body:**
```json
{
  "container_id": "uuid",
  "brewer_id": "uuid",
  "customer_location_id": "uuid"
}
```

---

### Self-Consume (`POST /api/actions/self-consume`)

A brewer consumes a container themselves.

| Step | What happens |
|------|--------------|
| Inventory | Container marked empty (`beer_id = null`, `is_empty = true`, `is_reserved = false`) |
| Accounting | `-internal_price` debited from brewer's account |

**Request body:**
```json
{
  "container_id": "uuid",
  "brewer_id": "uuid"
}
```

---

### Container Return (`POST /api/actions/container-return`)

A customer returns an empty container to a brewer.

| Step | What happens |
|------|--------------|
| Inventory | Container moved → `return_location_id`; marked empty (`beer_id = null`, `is_empty = true`) |
| Accounting | `-deposit_fee` debited from brewer's account |

**Request body:**
```json
{
  "container_id": "uuid",
  "brewer_id": "uuid",
  "return_location_id": "uuid"
}
```

---

## Acceptance Criteria

- [ ] `POST /api/actions/sell` moves container + creates account entry in one transaction; returns 422 if container is empty
- [ ] `POST /api/actions/self-consume` empties container + creates account entry in one transaction; returns 422 if container is already empty
- [ ] `POST /api/actions/container-return` moves and empties container + creates account entry in one transaction; returns 422 if container is not `At Customer` location type
- [ ] All three endpoints validate that the referenced `brewer_id`, `container_id`, and `location_id` exist; return 404 otherwise
- [ ] Prices used are taken from the container's `ContainerType` at the time of the action (no price overrides at action level)
- [ ] All three actions are wrapped in a database transaction — a failure in either inventory or accounting rolls back both
- [ ] Integration tests cover success path, validation errors, and rollback behaviour

## Dependencies

- **Phase 3:** Container CRUD + inventory actions must be implemented first (fill, move, empty)
- **Phase 4:** Accounting entries endpoint must be implemented first

## Cross-Repo Notes

- **HopLedger-Android:** The Inventory tab detail screen should expose "Sell", "Self-Consume", and "Container Return" action buttons (see Phase 9 — Inventory Tab)
- **HopLedger-Android:** Each action dialog must let the user pick the responsible brewer and (for Sell/Return) the destination/return location
