# HopLedger — Implementation Plan & Issue Tracker

This directory contains planning documents for each implementation phase.
Phases that are tracked as GitHub issues in the correct repository are marked below.

---

## HopLedger-Backend

| Phase | Title | GitHub Issue |
|-------|-------|-------------|
| 1 | Backend Project Scaffolding (Express + Prisma + PostgreSQL) | [#4](https://github.com/haertibraeu/HopLedger-Backend/issues/4) ✅ |
| 2 | CRUD for Brewers, Beers, Locations, ContainerTypes | [#3](https://github.com/haertibraeu/HopLedger-Backend/issues/3) ✅ |
| 3 | Inventory/Container Management: CRUD + Actions | [#2](https://github.com/haertibraeu/HopLedger-Backend/issues/2) ✅ |
| 4 | Accounting Entries & Settlements (Split Bills) | [#1](https://github.com/haertibraeu/HopLedger-Backend/issues/1) ✅ |
| 5 | Combined Actions (Sell, Self-Consume, Container Return) | [#6](https://github.com/haertibraeu/HopLedger-Backend/issues/6) ✅ |
| 6 (backend) | Public Inventory Endpoint | [#7](https://github.com/haertibraeu/HopLedger-Backend/issues/7) ✅ |

## website

| Phase | Title | GitHub Issue |
|-------|-------|-------------|
| 6 (website) | Jekyll Setup + GitHub Action Inventory Sync | [#1](https://github.com/haertibraeu/website/issues/1) ✅ |

## HopLedger-Android

| Phase | Title | GitHub Issue |
|-------|-------|-------------|
| 7 | Android App Scaffolding | [#2](https://github.com/haertibraeu/HopLedger-Android/issues/2) ✅ |
| 8 | Settings Screens | [#1](https://github.com/haertibraeu/HopLedger-Android/issues/1) ✅ |
| 9 | Inventory Tab | [#3](https://github.com/haertibraeu/HopLedger-Android/issues/3) ✅ |
| 10 | Accounting Tab | [#4](https://github.com/haertibraeu/HopLedger-Android/issues/4) ✅ |

---

## Status

✅ All phases implemented and pushed. All issues auto-closed via commit messages.

- **Backend:** TypeScript + Express + Prisma v6 — complete REST API with CRUD, inventory actions, accounting, combined actions, public endpoint
- **Website:** Jekyll + GitHub Pages — inventory display with GitHub Action sync
- **Android:** Kotlin + Jetpack Compose — full app with 3 tabs (Inventory, Accounting, Settings)
