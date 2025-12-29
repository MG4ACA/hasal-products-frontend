# Hasal Products - POS System Project Documentation

**Project:** Point of Sale & Inventory Management System  
**Client:** Hasal_Products  
**Version:** 1.1 (Updated December 18, 2025)  
**Status:** Proposal & Requirements Stage

---

> **Version 1.1 Updates (Dec 18, 2025):**
> - Added employee management (sales refs, drivers, warehouse)
> - Replaced vehicle stock tracking with vehicle-route assignment history
> - Added system-generated batch numbers for raw materials
> - Added product returns handling with disposition tracking
> - Added check payment method with clearance tracking
> - Added barcode field to products
> - Updated all 7 documentation files to reflect client feedback

---

## 📋 Project Overview

This repository contains comprehensive documentation for the development of a custom web-based POS and inventory management system for Hasal_Products, a spices delivery company operating in Sri Lanka.

### Business Context

Hasal_Products purchases raw materials from suppliers, produces various spice products using recipes, packages them in multiple sizes, and sells them to retail outlets (shops) via delivery vehicles. The system will manage the entire workflow from procurement to sales, including credit management and route-based outlet tracking.

---

## 📁 Documentation Files

### 1. **PROJECT_REQUIREMENTS.md** ⭐

Complete functional and non-functional requirements specification including:

- Business overview and stakeholders
- Detailed functional requirements for all modules
- User roles and permissions
- Data model overview
- User workflows
- Acceptance criteria
- Future enhancements

**👉 Start here** to understand what the system will do.

---

### 2. **DATABASE_SCHEMA.md** 🗄️

Comprehensive database design documentation:

- Complete table definitions with SQL CREATE statements
- Entity relationships and foreign keys
- Indexes and performance optimization
- Sample queries for common operations
- 20+ tables covering all business entities

**👉 Review this** for technical architecture and data structure.

---

### 3. **PROJECT_TIMELINE.md** 📅

Project execution plan and cost breakdown:

- 4 development phases over 10-12 weeks
- Week-by-week task breakdown
- Effort estimation (218 hours total)
- Cost allocation per phase
- Payment schedule (30% advance, 40% progress, 30% final)
- Risk assessment and mitigation

**👉 Check this** for project schedule and milestones.

---

### 4. **UI_MOCKUPS.md** 🎨

User interface design and page structures:

- Design principles and color scheme
- Layout wireframes for all major pages
- Page-by-page mockup descriptions
- Navigation structure
- Form designs
- Invoice print template
- Responsive design notes

**👉 Use this** to visualize the user experience.

---

### 5. **INVOICE.md** 💰

Client proposal and billing document:

- Project cost: **300,000 LKR**
- Detailed cost breakdown by phase
- Payment schedule (3 milestones)
- Terms and conditions
- Scope inclusions and exclusions
- Acceptance signatures section

**👉 Send this** to client for approval and payment.

---

## 🎯 Key Features

### Core Modules

✅ Supplier Management (with check payment tracking)  
✅ Purchase  & SKU Management (multiple sizes, barcodes)  
✅ Recipe Management with Versioning  
✅ Production Runs  
✅ Route & Outlet (Customer) Management  
✅ Employee Management (sales refs, drivers, warehouse)  
✅ Vehicle-Route Assignment with History  
✅ Sales Invoicing with Discounts & Returns  
✅ Credit Sales & Receivables  Orders & Raw Material Inventory (with returns)  
✅ Product
✅ Payment Collection (cash/credit/check tracking)  
✅ Comprehensive Reporting (sales, inventory, returns, checks)

### Technical Stack

- **Frontend:** Vue.js 3 (Composition API)
- **Backend:** Express.js (Node.js)
- **Database:** MySQL
- **Architecture:** RESTful API
- **Auth:** JWT-based authentication

---

## 💼 Project Budget

| Item                   | Amount (LKR) |
| ---------------------- | ------------ |
| **Total Project Cost** | 300,000      |
| Advance Payment (30%)  | 90,000       |
| Progress Payment (40%) | 120,000      |
| Final Payment (30%)    | 90,000       |

**Estimated Hours:** 232 hours  
**Timeline:** 10-12 weeks  
**Delivery:** March 2026

---

## 📊 System Capabilities

### Inventory Management

- System-generated batch tracking for raw materials
- Multiple SKUs per product (100g, 500g, 1kg, etc.) with barcode support
- Stock adjustments and valuation
- Low stock alerts
- Production tracking (raw → finished goods)
- Returns handling with disposition tracking (stock/dispose)

### Sales & Distribution

- Route-based outlet organization
- Employee tracking (sales refs, drivers) for accountability
- Vehicle-to-route dynamic assignment with history
- Credit limit management
- Discount management (default 20% + custom)
- Invoice generation with returns handling
- Invoice printing
- Multiple payment methods (cash, credit, check with clearance tracking)

### Financial Tracking

- Credit sales tracking
- Payment allocation to invoices
- Check payment tracking (number, date, clearance status)
- Receivables aging analysis
- Supplier payment tracking (including checks)
- Cash register reconciliation

### Reporting

- Sales by route/outlet/product/sales ref
- Product returns summary with disposition
- Check payment status tracking
- Stock levels and valuation
- Supplier ledger
- Receivables aging
- Production history
- Employee performance (sales refs)

---

## 🚀 Next Steps

### For Client (Hasal_Products)

1. ✅ Review all documentation files
2. ✅ Provide feedback or request clarifications
3. ✅ Sign the INVOICE.md agreement
4. ✅ Make advance payment (90,000 LKR)
5. ✅ Provide sample data (suppliers, products, outlets)
6. ✅ Provide company logo and branding materials

### For Developer

1. ✅ Set up development environment upon advance payment
2. ✅ Create Git repository
3. ✅ Initialize Vue.js + Express.js project structure
4. ✅ Set up MySQL database
5. ✅ Begin Phase 1 development

---

## 📞 Contact Information

**Client:**  
Hasal_Products  
[Contact Person]  
[Email]  
[Phone]

**Developer:**  
[Your Name/Company]  
[Your Email]  
[Your Phone]

---

## ⚠️ Important Notes

### Included in Project

✅ All features in PROJECT_REQUIREMENTS.md  
✅ Web application (responsive)  
✅ Database setup  
✅ User training (2 hours)  
✅ Documentation  
✅ 30-day bug fix support

### NOT Included

❌ Server hosting fees  
❌ Domain & SSL certificate  
❌ Mobile app development  
❌ Third-party integrations (SMS, payment gateways)  
❌ Barcode scanning hardware  
❌ Ongoing maintenance after 30 days

---

## 📝 Version History

| Version | Date         | Changes                       |
| ------- | ------------ | ----------------------------- |
| 1.0     | Dec 16, 2025 | Initial documentation package |

---

## 🔐 Confidentiality

This documentation is confidential and intended solely for Hasal_Products and the development team. Unauthorized distribution or use is prohibited.

---

**Ready to proceed?** Review the documents, sign the invoice, and let's build your POS system! 🚀

---

## 📚 Document Reading Order

**For quick overview:**

1. This README (you are here)
2. PROJECT_REQUIREMENTS.md (sections 1-3)
3. INVOICE.md (cost and payment terms)

**For detailed review:**

1. PROJECT_REQUIREMENTS.md (complete)
2. DATABASE_SCHEMA.md (data structure)
3. UI_MOCKUPS.md (user interface)
4. PROJECT_TIMELINE.md (schedule)
5. INVOICE.md (contract)

**For technical team:**

1. DATABASE_SCHEMA.md
2. PROJECT_REQUIREMENTS.md (section 3-6)
3. UI_MOCKUPS.md
4. PROJECT_TIMELINE.md (task breakdown)

---

**Last Updated:** December 16, 2025  
**Document Owner:** [Your Name]  
**Project Status:** Awaiting Client Approval
