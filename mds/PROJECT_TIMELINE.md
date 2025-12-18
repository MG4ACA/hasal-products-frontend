# Hasal Products - Project Timeline & Task Breakdown

**Project:** POS & Inventory Management System  
**Total Budget:** 300,000 LKR  
**Advance Payment:** 90,000 LKR (30%)  
**Balance Payment:** 210,000 LKR (upon completion)  
**Estimated Duration:** 10-12 weeks

---

## Phase 1: Project Setup & Foundation (Week 1-2)

### Week 1: Environment Setup

**Tasks:**

- [ ] Set up development environment (Node.js, Vue.js, MySQL)
- [ ] Initialize Git repository
- [ ] Create project structure (frontend/backend folders)
- [ ] Set up MySQL database server
- [ ] Configure Express.js backend with basic routing
- [ ] Set up Vue.js 3 with Composition API
- [ ] Install dependencies (Axios, Vue Router, Vuex/Pinia, etc.)
- [ ] Configure CORS and environment variables

**Deliverable:** Basic project skeleton with database connection

**Effort:** 15 hours  
**Cost:** 30,000 LKR

---

### Week 2: Database & Authentication

**Tasks:**

- [ ] Create database schema (all tables)
- [ ] Implement database migrations/seed scripts
- [ ] Build authentication API (login/logout)
- [ ] Implement JWT token-based auth
- [ ] Create user registration endpoint (admin only)
- [ ] Build login page (Vue.js)
- [ ] Implement auth middleware for protected routes
- [ ] Create basic dashboard layout with navigation

**Deliverable:** Working authentication system with role-based access

**Effort:** 20 hours  
**Cost:** 40,000 LKR

---

## Phase 2: Core Modules Development (Week 3-7)

### Week 3: Supplier & Raw Material Management

**Tasks:**

- [ ] Supplier CRUD APIs (create, read, update, delete)
- [ ] Raw material CRUD APIs
- [ ] Supplier management UI (list, add, edit, view)
- [ ] Raw material management UI
- [ ] Supplier search and filter functionality
- [ ] Basic validation and error handling

**Deliverable:** Supplier and raw material modules functional

**Effort:** 18 hours  
**Cost:** 36,000 LKR

---

### Week 4: Purchase Orders & Inventory Receipt

**Tasks:**

- [ ] Purchase Order CRUD APIs
- [ ] PO item management
- [ ] Batch tracking for raw materials
- [ ] PO creation UI (supplier selection, add items)
- [ ] PO listing and status management
- [ ] Receive PO functionality (record batches)
- [ ] Update inventory on PO receipt
- [ ] PO print/PDF generation (optional)

**Deliverable:** Complete purchase order workflow

**Effort:** 22 hours  
**Cost:** 44,000 LKR

---

### Week 5: Products, Recipes & Production

**Tasks:**

- [ ] Product and SKU CRUD APIs
- [ ] Recipe CRUD APIs with versioning
- [ ] Recipe item (BOM) management
- [ ] Production run APIs
- [ ] Product/SKU management UI
- [ ] Recipe builder UI (drag-drop or form-based)
- [ ] Production run entry UI
- [ ] Inventory updates for production (deduct raw, add finished)
- [ ] Recipe version history view

**Deliverable:** Production management module

**Effort:** 25 hours  
**Cost:** 50,000 LKR

---

### Week 6: Routes, Outlets, Employees & Vehicle Assignment

**Tasks:**

- [ ] Route CRUD APIs
- [ ] Outlet CRUD APIs
- [ ] Employee CRUD APIs (sales ref, driver, warehouse)
- [ ] Vehicle CRUD APIs
- [ ] Route-Vehicle assignment APIs
- [ ] Vehicle assignment history tracking
- [ ] Route management UI
- [ ] Outlet management UI (with route assignment)
- [ ] Employee management UI (code, name, type, route assignment)
- [ ] Vehicle management UI
- [ ] Vehicle-to-route assignment UI
- [ ] Vehicle assignment history view
- [ ] Outlet search by route

**Deliverable:** Route, outlet, employee, and vehicle modules with assignment tracking

**Effort:** 22 hours  
**Cost:** 44,000 LKR

---

### Week 7: Sales & Invoicing (with Returns)

**Tasks:**

- [ ] Sales invoice CRUD APIs
- [ ] Invoice item management
- [ ] Sales ref and route assignment in invoices
- [ ] Product returns handling (negative line items)
- [ ] Return disposition tracking (stock/dispose)
- [ ] Payment processing logic
- [ ] Invoice creation UI (outlet, sales ref, route selection, add items)
- [ ] Returns entry UI (mark items as return, select reason and disposition)
- [ ] Apply discount (default + custom)
- [ ] Calculate totals and taxes
- [ ] Payment method selection (cash/credit/check)
- [ ] Check payment fields (number, date, clearance)
- [ ] Update outlet balance for credit sales
- [ ] Process returns to inventory
- [ ] Invoice listing and search
- [ ] Invoice print template (PDF)

**Deliverable:** Sales, invoicing, and returns module

**Effort:** 28 hours  
**Cost:** 56,000 LKR

---

## Phase 3: Payments & Reporting (Week 8-9)

### Week 8: Payment Collection & Credit Management

**Tasks:**

- [ ] Payment recording APIs (outlet payments)
- [ ] Supplier payment APIs
- [ ] Check payment tracking (number, check date, clearance date)
- [ ] Payment allocation to invoices
- [ ] Payment collection UI
- [ ] Check payment entry UI (check details)
- [ ] Check clearance tracking UI
- [ ] Outlet balance and credit limit display
- [ ] Payment history view
- [ ] Receipt generation
- [ ] Supplier payment UI
- [ ] Pending checks report

**Deliverable:** Payment and receivables management with check tracking

**Effort:** 18 hours  
**Cost:** 36,000 LKR

---

### Week 9: Reports & Analytics

### Week 9: Reports & Analytics

**Tasks:**

- [ ] Sales by route report API
- [ ] Sales by outlet report API
- [ ] Sales by sales ref performance API
- [ ] Stock report APIs (raw + finished goods)
- [ ] Supplier ledger API
- [ ] Receivables aging report API
- [ ] Product returns report API
- [ ] Check payment status report API
- [ ] Vehicle assignment history report API
- [ ] Report UI pages with filters (date range, route, sales ref, etc.)
- [ ] Export to Excel/CSV functionality
- [ ] Dashboard widgets (sales summary, stock alerts, pending checks)
- [ ] Low stock alerts
- [ ] Returns analytics dashboard

**Deliverable:** Comprehensive reporting module with new analytics

**Effort:** 24 hours  
**Cost:** 48,000 LKR

---

## Phase 4: Testing & Deployment (Week 10-12)

### Week 10: Testing & Bug Fixes

**Tasks:**

- [ ] Unit testing for critical API endpoints
- [ ] Frontend component testing
- [ ] Integration testing (end-to-end workflows)
- [ ] User acceptance testing (UAT) with client
- [ ] Bug fixes based on testing feedback
- [ ] Performance optimization (query optimization, caching)
- [ ] Security review (SQL injection, XSS prevention)

**Deliverable:** Stable, tested application

**Effort:** 18 hours  
**Cost:** 36,000 LKR

---

### Week 11: Documentation & Training

**Tasks:**

- [ ] API documentation (Postman collection or Swagger)
- [ ] User manual (admin guide with screenshots)
- [ ] Database schema documentation (ER diagram)
- [ ] Deployment guide (server setup instructions)
- [ ] Training session for admin and cashier (2 hours)
- [ ] Create sample data for demo

**Deliverable:** Complete documentation package

**Effort:** 12 hours  
**Cost:** 24,000 LKR

---

### Week 12: Deployment & Handover

**Tasks:**

- [ ] Set up production server (client's hosting or cloud)
- [ ] Configure production database
- [ ] Deploy backend API
- [ ] Deploy frontend application
- [ ] Configure domain and SSL certificate (if applicable)
- [ ] Final smoke testing on production
- [ ] Handover session with client
- [ ] 30-day support period begins

**Deliverable:** Live production system

**Effort:** 10 hours  
**Cost:** 20,000 LKR

---

## Summary of Costs

| Phase     | Description                | Hours   | Cost (LKR)  |
| --------- | -------------------------- | ------- | ----------- |
| 1         | Project Setup & Foundation | 35      | 70,000      |
| 2         | Core Modules Development   | 115     | 230,000     |
| 3         | Payments & Reporting       | 42      | 84,000      |
| 4         | Testing & Deployment       | 40      | 80,000      |
| **Total** |                            | **232** | **464,000** |

**Discounted Project Cost:** 300,000 LKR (client budget)  
**Hourly Rate Equivalent:** ~1,293 LKR/hour

---

## Payment Schedule

| Milestone                 | Payment        | Amount (LKR) | Due Date          |
| ------------------------- | -------------- | ------------ | ----------------- |
| Project Kickoff           | Advance (30%)  | 90,000       | Upon agreement    |
| Phase 2 Complete (Week 7) | Progress (40%) | 120,000      | Week 7 completion |
| Deployment & Handover     | Final (30%)    | 90,000       | Upon go-live      |
| **Total**                 |                | **300,000**  |                   |

---

## Assumptions

1. Client provides server/hosting (or cloud hosting budget separate)
2. Client provides sample data (supplier list, product list, outlets) for initial setup
3. Client available for feedback during UAT (Week 10)
4. Single developer working on the project
5. Standard business hours support (no 24/7 requirement)
6. 30-day bug fix support included post-deployment
7. Future enhancements (mobile app, offline mode) are out of scope

---

## Risks & Mitigation

| Risk                   | Impact                 | Mitigation                              |
| ---------------------- | ---------------------- | --------------------------------------- |
| Scope creep            | Delays, budget overrun | Strict adherence to requirements doc    |
| Client feedback delays | Timeline extension     | Set fixed review dates                  |
| Server/hosting issues  | Deployment delays      | Test on staging environment first       |
| Data complexity        | Development delays     | Early database testing with sample data |

---

## Post-Deployment Support

**Included (30 days):**

- Bug fixes for issues found in production
- Minor tweaks to UI/UX
- Phone/email support for user questions

**Not Included (Paid Separately):**

- New feature development
- Server maintenance and hosting
- Data backup management
- Third-party integrations

---

**End of Project Timeline Document**
