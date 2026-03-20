# Phases 7–10 — Android App

**Repository:** `haertibraeu/HopLedger-Android`  
**Note:** The `HopLedger-Android` repository is not yet accessible. Create individual issues
there once the repo is initialised with an initial branch.

---

## Phase 7 — Android App Scaffolding

**Depends on:** Phases 1–5 (Backend fully operational)

### Description

Bootstrap the Android application with the correct architecture, dependency injection,
navigation, and networking layers so that all subsequent feature phases can be built on
a stable foundation.

### Tasks

- [ ] Create Android project (Kotlin + Jetpack Compose + Material 3)
- [ ] Set up Hilt for dependency injection
- [ ] Configure Retrofit + Kotlin Serialization for REST API calls
- [ ] Add Room for optional local caching (can be stubbed initially)
- [ ] Implement NavHost with bottom navigation: **Inventory | Accounting | Settings**
- [ ] Add a Settings screen entry for backend URL configuration (persisted in DataStore)
- [ ] Wire up basic health-check call (`GET /api/health`) to verify backend connectivity
- [ ] Set up project structure:
  ```
  app/src/main/java/com/haertibraeu/hopledger/
  ├── data/api/          # Retrofit interfaces
  ├── data/model/        # DTOs
  ├── data/repository/   # Repository implementations
  ├── domain/model/      # Domain entities
  ├── ui/inventory/      # Inventory screens & ViewModels
  ├── ui/accounting/     # Accounting screens & ViewModels
  ├── ui/settings/       # Config screens
  ├── ui/actions/        # Action dialogs (sell, self-consume, return)
  ├── ui/components/     # Shared composables
  ├── ui/navigation/     # NavHost setup
  └── di/                # Hilt modules
  ```

### Acceptance Criteria

- [ ] App compiles and runs on Android emulator/device
- [ ] Bottom navigation switches between the three main tabs
- [ ] Backend URL is configurable from the Settings tab and persisted across app restarts
- [ ] Health-check confirms connectivity to a running backend

---

## Phase 8 — Settings Screens

**Depends on:** Phase 7 (Scaffolding), Phase 2 (Backend CRUD)

### Description

Implement the Settings tab screens for managing all master-data entities: Brewers,
Container Types (with prices), Beers, and Locations.

### Tasks

- [ ] **Manage Brewers:** List, add, edit, delete brewers
- [ ] **Manage Container Types:** List, add, edit (name, icon, external price, internal price, deposit fee), delete
- [ ] **Manage Beers:** List, add, edit (name, style, batch ID), delete
- [ ] **Manage Locations:** List, add, edit (name, type, linked brewer), delete
- [ ] Show confirmation dialog before destructive deletes
- [ ] Handle and display API errors gracefully (network issues, 404, 409 conflicts)

### Acceptance Criteria

- [ ] All four entity types can be listed, created, edited, and deleted from the app
- [ ] Changes are immediately reflected in the list after a successful API call
- [ ] Delete operations that would violate referential integrity show a clear error message
- [ ] Forms validate required fields before submission

---

## Phase 9 — Inventory Tab

**Depends on:** Phase 7 (Scaffolding), Phase 8 (Settings / master data), Phase 5 (Combined Actions)

### Description

Implement the Inventory tab: a filterable container list, container detail view, and all
inventory actions (move, fill, destroy beer, reserve, batch fill, sell, self-consume,
container return).

### Tasks

- [ ] Container list screen with filter/search by: location, beer, container type, empty/filled, reserved
- [ ] FAB to add a new container
- [ ] Container detail screen showing all attributes
- [ ] Action sheet / dialogs for each action:
  - **Move** — select new location
  - **Fill** — select beer to fill with
  - **Destroy Beer** — confirm → marks empty
  - **Reserve** — enter customer name
  - **Unreserve** — confirm
  - **Sell** — select selling brewer + customer location
  - **Self-Consume** — select consuming brewer
  - **Container Return** — select receiving brewer + return location
  - **Delete Container** — confirmation dialog
- [ ] FAB on list screen for **Batch Fill** (select container type + location + beer → show list of matching empty containers with checkboxes → user selects subset or "select all" → confirm fills all selected containers)

### Acceptance Criteria

- [ ] Container list loads and filters correctly
- [ ] All actions complete successfully and refresh the displayed container state
- [ ] Sell/Self-Consume/Return actions show the price/deposit amounts for confirmation before executing
- [ ] Batch fill allows selecting individual containers (checkbox list) or "select all", and fills them in one request

---

## Phase 10 — Accounting Tab

**Depends on:** Phase 7 (Scaffolding), Phase 8 (Settings / master data), Phase 4 (Accounting Entries & Settlements)

### Description

Implement the Accounting tab: balances overview, full transaction history, manual entry
creation, and settlement suggestions.

### Tasks

- [ ] **Balances screen:** Show each brewer's current net balance; highlight who owes whom
- [ ] **Entry list:** All `ACCOUNT_ENTRY` records, filterable by brewer; show type, amount, description, date
- [ ] **Add manual entry dialog:** Select brewer, enter amount (positive = income, negative = expense), description, entry type
- [ ] **Settlements screen:** Show suggested transfers to break even (from/to/amount)

### Acceptance Criteria

- [ ] Balances screen reflects real-time data from `GET /api/accounting/balances`
- [ ] Entry list is paginated and filterable by brewer
- [ ] Manual entries can be created and immediately appear in the list
- [ ] Settlement suggestions list is clear and actionable
- [ ] Currency amounts are displayed with correct formatting (€ symbol, 2 decimal places)
