# Phase-wise Deliverables (Client View)

**Invoice Reference:** DEC-0001 (Lumicore Pvt Ltd → Hasal Products)  
**Project:** POS & Inventory Management System  
**Date:** December 19, 2025  
**Tech Stack:** Vue 3 + Express.js + MySQL

## Payment Schedule (per Invoice PDF)

- Payment 1: 30% advance on kickoff — LKR 80,000
- Payment 2: 40% on Phase 3 completion — LKR 110,000
- Payment 3: 30% on deployment & handover — LKR 70,000
- Invoice totals shown: Subtotal LKR 280,000; Discount LKR 20,000; Total LKR 260,000; Amount Paid LKR 80,000; Balance Due LKR 180,000

## Phase 1 — Foundation

**What you get:**

- Environment setup, project structure (frontend + backend)
- Database schema creation and migrations
- Authentication with JWT (Admin, Cashier) + role-based access
- Basic dashboard shell and navigation

## Phase 2 — Core Operations

**What you get:**

- Supplier management with balances and check details
- Raw material management with stock tracking and batches
  - Stock-level visibility across batches (FIFO consumption)
  - Batch number generation and expiry tracking
  - Batch genealogy (receipt → returns → disposals)
- Purchase orders with advanced receiving capabilities:
  - Create/update POs with multiple items
  - **Multiple partial receives** — receive items in multiple shipments
  - **Quantity validation** — prevents over-receiving, tracks cumulative quantities
  - **Already-received tracking** — shows what's been received vs what remains
  - **Selective item receiving** — choose which items to receive in each transaction
  - **Batch creation** on receipt with expiry tracking
  - **Returns handling** with batch traceability (source batch tracking)
  - Auto-calculated supplier balance updates
- Products & SKUs: multiple sizes, barcodes, stock per SKU
- Recipes with versioning; production runs that consume raw materials (FIFO) and add finished goods
- Routes, outlets, employees (sales ref/driver/warehouse), vehicles with assignment history
- Sales & invoicing: discounts, returns as negative lines, stock adjustments, outlet balance updates
- Payment collection (cash/credit/check), check tracking, and baseline reports/analytics

## Phase 3 — Testing, Docs, Deployment

**What you get:**

- System testing & bug fixes
- Documentation: requirements, database schema, user manual, API notes, deployment guide
- Training: 2 hours (admin + cashier walkthrough)
- Deployment & handover to client environment

## Included Extras

- 30 days of post-deployment bug-fix support
- Deployment assistance
- Source code handover (Git)

## Exclusions (same as invoice scope)

- Third-party integrations (SMS/WhatsApp/payment gateways)
- Mobile app or offline-first features
- Route planning/GPS, barcode hardware
- Data migration from legacy systems
- Ongoing maintenance after 30 days

## Notes & Assumptions

- UAT feedback is timely to keep dates
- Change requests beyond the listed scope will be quoted separately
