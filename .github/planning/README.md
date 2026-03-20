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
| 5 | Combined Actions (Sell, Self-Consume, Container Return) | ❌ Create issue → see [phase-05-combined-actions.md](phase-05-combined-actions.md) |
| 6 (backend) | Public Inventory Endpoint | ❌ Create issue → see [phase-06-public-inventory-and-website.md](phase-06-public-inventory-and-website.md) |

## website

| Phase | Title | GitHub Issue |
|-------|-------|-------------|
| 6 (website) | Jekyll Setup + GitHub Action Inventory Sync | ❌ Repo not yet accessible — see [phase-06-public-inventory-and-website.md](phase-06-public-inventory-and-website.md) Part B |

## HopLedger-Android

| Phase | Title | GitHub Issue |
|-------|-------|-------------|
| 7 | Android App Scaffolding | ❌ Repo not yet accessible — see [phases-07-to-10-android.md](phases-07-to-10-android.md) |
| 8 | Settings Screens | ❌ Repo not yet accessible — see [phases-07-to-10-android.md](phases-07-to-10-android.md) |
| 9 | Inventory Tab | ❌ Repo not yet accessible — see [phases-07-to-10-android.md](phases-07-to-10-android.md) |
| 10 | Accounting Tab | ❌ Repo not yet accessible — see [phases-07-to-10-android.md](phases-07-to-10-android.md) |

---

## Action Required

Once the `haertibraeu/HopLedger-Android` and `haertibraeu/website` repositories are accessible,
create the issues described in the planning documents above in each respective repository.

For HopLedger-Backend, issues for **Phase 5** and **Phase 6 (backend)** still need to be created
using the content in the planning markdown files.
