# Hasal POS API Testing Guide

This guide provides comprehensive API testing resources for the Hasal Products Point of Sale System with integrated purchase order management and batch traceability.

**Version:** 2.1.0

## 📋 Files Included

1. **`Hasal_POS_API_Collection.postman_collection.json`** - Postman collection with Purchase Orders and Batch Traceability endpoints
2. **`Hasal_POS_Environment.postman_environment.json`** - Postman environment with collection variables
3. **`Hasal_POS_API_Swagger.json`** - OpenAPI/Swagger specification
4. **`PHASE_2_TRACEABILITY_API.md`** - Detailed Phase 2 API documentation

## 🚀 Quick Start

### Option 1: Using Postman (Recommended)

1. **Install Postman** (if not already installed)
2. **Import the Collection:**
   - Open Postman
   - Click "Import" button
   - Select "File" tab
   - Choose `Hasal_POS_API_Collection.postman_collection.json`
3. **Import the Environment:**
   - Click "Import" again
   - Select `Hasal_POS_Environment.postman_environment.json`
4. **Select Environment:**
   - Click the environment dropdown (top-right)
   - Select "Hasal POS Environment"
5. **Start Testing:**
   - Run the "Login" request first to get authentication token
   - All other requests will automatically use the token
   - Follow sequences in collection order

### Option 2: Using Swagger UI

1. **Install Swagger UI** or use an online viewer
2. **Open the Swagger file** in your preferred Swagger viewer
3. **Set server URL** to `http://localhost:3000`
4. **Authorize** with JWT token after login
5. **Test endpoints** directly from the interface

## 📚 Environment Variables Setup

The Postman environment includes these collection variables (auto-populated during test runs):

| Variable          | Purpose                  | Auto-Populated                    |
| ----------------- | ------------------------ | --------------------------------- |
| `base_url`        | API server URL           | ❌ (Set to http://localhost:3000) |
| `token`           | JWT authentication token | ✅ (Set by Login request)         |
| `supplier_id`     | Test supplier ID         | Manual (default: 1)               |
| `material_id`     | Test material ID         | Manual (default: 1)               |
| `po_id`           | Created PO ID            | ✅ (Set by Create PO request)     |
| `batch_id`        | Created receipt batch ID | ✅ (Set by Receive request)       |
| `return_batch_id` | Created return batch ID  | ✅ (Set by Return request)        |

**How to set them:**

1. In Postman, click "Manage Environments"
2. Select "Hasal POS Environment"
3. Edit values as needed
4. Save

## 🔐 Authentication

All API endpoints (except `/health`, `/api`, and `/api/auth/*`) require authentication:

- **Method:** Bearer Token (JWT)
- **Header:** `Authorization: Bearer <your-jwt-token>`
- **Login Endpoint:** `POST /api/auth/login`

### Default Test Credentials

- **Admin:** `admin` / `admin123`
- **Cashier:** `cashier` / `cashier123`

## 📊 API Endpoints

### Purchase Order Management

| Endpoint                                 | Method | Purpose                                    |
| ---------------------------------------- | ------ | ------------------------------------------ |
| `/api/purchase-orders`                   | POST   | Create purchase order                      |
| `/api/purchase-orders/{id}`              | GET    | Get PO details with status                 |
| `/api/purchase-orders/{id}/receive`      | POST   | Receive items (partial, complete, returns) |
| `/api/purchase-orders/{id}/cancel`       | PATCH  | Cancel pending PO                          |
| `/api/raw-material-batches/{id}/inspect` | PATCH  | QC inspection approval                     |

### Batch Traceability Queries

| Endpoint                                              | Method | Purpose                          |
| ----------------------------------------------------- | ------ | -------------------------------- |
| `/api/batches/{id}/genealogy`                         | GET    | Get batch genealogy with returns |
| `/api/batches/{id}/origin`                            | GET    | Trace return to source batch     |
| `/api/batches/materials/{materialId}/returns-summary` | GET    | Material returns aggregation     |

**Typical PO Workflow:**

1. Create PO → Receive items (partial or complete) → Inspect quality → Mark approved
2. If returns needed → Process return with source_batch_id link
3. Query genealogy to see all returns from a receipt batch
4. Trace return origin to find source batch
5. Get material summary for inventory reporting

## 📋 API Endpoints Overview

### Core Modules

| Module                 | Base Path              | Key Endpoints                                             |
| ---------------------- | ---------------------- | --------------------------------------------------------- |
| **Authentication**     | `/api/auth`            | login, register, me, logout                               |
| **Suppliers**          | `/api/suppliers`       | CRUD + payments, balance                                  |
| **Raw Materials**      | `/api/raw-materials`   | CRUD + batches, stock                                     |
| **Products**           | `/api/products`        | CRUD + SKUs, stock                                        |
| **Purchase Orders**    | `/api/purchase-orders` | ✅ **Updated:** CRUD + receive + cancel + Phase 2 returns |
| **Batch Traceability** | `/api/batches`         | ✅ **NEW:** genealogy + origin + summary                  |
| **Sales Invoices**     | `/api/sales-invoices`  | CRUD + items                                              |
| **Payments**           | `/api/payments`        | CRUD + pending checks                                     |
| **Production**         | `/api/production-runs` | CRUD + complete runs                                      |
| **Recipes**            | `/api/recipes`         | CRUD + ingredients                                        |
| **Routes**             | `/api/routes`          | CRUD operations                                           |
| **Outlets**            | `/api/outlets`         | CRUD operations                                           |
| **Employees**          | `/api/employees`       | CRUD operations                                           |
| **Vehicles**           | `/api/vehicles`        | CRUD operations                                           |

## 🧪 Test Collection Structure

```
Hasal POS API Collection
├── Authentication
│   └── Login (saves token to environment)
│
├── Purchase Orders
│   ├── Create Purchase Order (saves po_id)
│   ├── Get Purchase Order
│   ├── Receive - Partial Receipt (saves batch_id)
│   ├── Receive - Complete Receipt
│   ├── Process Return (saves return_batch_id)
│   ├── Approve Batch Inspection
│   └── Cancel Purchase Order
│
├── Batch Traceability Queries
│   ├── Get Batch Genealogy
│   ├── Trace Return Origin
│   └── Get Material Returns Summary
│
└── Reference Data
    ├── List Suppliers
    └── List Raw Materials
```

## ✅ Test Execution Examples

### Scenario 1: Complete Purchase Order Lifecycle

```
1. Login → Get token
2. Create PO → Get po_id
3. Receive Partial (50kg) → Get batch_id
4. Get PO → Verify status = "partial"
5. Receive Remaining (50kg)
6. Get PO → Verify status = "received"
7. Approve Batch Inspection → Verify inspection_status = "approved"
```

### Scenario 2: Purchase Order with Returns and Traceability

```
1. Login → Get token
2. Create PO → Get po_id
3. Receive Full (100kg) → Get batch_id
4. Process Return (10kg) with source_batch_id → Get return_batch_id
5. Get Batch Genealogy (batch_id) → See 1 return linked
6. Trace Return Origin (return_batch_id) → Confirm source = batch_id
7. Get Material Returns Summary (material_id) → Verify 100kg in, 10kg out, 90kg net
```

## 🧪 Week 3 Testing Focus

For Week 3 testing (Suppliers & Raw Materials), focus on these endpoints:

### Supplier Testing

- `GET /api/suppliers` - List with pagination/search
- `POST /api/suppliers` - Create new supplier
- `GET /api/suppliers/{id}` - Get supplier details
- `PUT /api/suppliers/{id}` - Update supplier
- `DELETE /api/suppliers/{id}` - Delete supplier
- `GET /api/suppliers/{id}/balance` - Check balance

### Raw Material Testing

- `GET /api/raw-materials` - List with pagination/search
- `POST /api/raw-materials` - Create new material
- `GET /api/raw-materials/{id}` - Get material details
- `GET /api/raw-materials/{id}/batches` - Get material batches
- `GET /api/raw-materials/{id}/stock` - Get stock level
- `PUT /api/raw-materials/{id}` - Update material
- `DELETE /api/raw-materials/{id}` - Delete material

## 🔧 Environment Setup

### Backend Server

```bash
cd hasal-pos-backend
npm install
npm run dev
# Server runs on http://localhost:3000
```

### Database

- Ensure MySQL is running
- Database should be seeded with initial data
- Check `hasal-pos-backend/config/database.js` for connection details

### Frontend (Optional)

```bash
cd spices-pos
npm install
npm run dev
# Frontend runs on http://localhost:5173
```

## 📝 Testing Checklist

### Pre-Testing

- [ ] Backend server running on port 3000
- [ ] Database connected and seeded
- [ ] Postman collection imported
- [ ] Environment variables configured
- [ ] Authentication working (login successful)

### Supplier Module Testing

- [ ] List suppliers with pagination
- [ ] Search suppliers by name/contact
- [ ] Create new supplier with validation
- [ ] Update existing supplier
- [ ] Delete supplier
- [ ] Check supplier balance
- [ ] Handle non-existent supplier (404)

### Raw Material Module Testing

- [ ] List raw materials with pagination
- [ ] Search materials by name/code
- [ ] Create new material with validation
- [ ] Update existing material
- [ ] Delete material
- [ ] Get material batches
- [ ] Check stock levels
- [ ] Handle non-existent material (404)

## 🐛 Common Issues

### Authentication Issues

- **Token expired:** Re-run login request
- **Wrong credentials:** Check username/password
- **Missing token:** Ensure login was successful first

### Database Issues

- **Connection failed:** Check MySQL service is running
- **No data:** Run seeders to populate database
- **Foreign key errors:** Ensure related records exist

### Request Issues

- **400 Bad Request:** Check required fields and data types
- **404 Not Found:** Verify endpoint URL and ID parameters
- **403 Forbidden:** Check user role permissions

## � Phase 2: Return Batch Traceability API

New documentation added for Phase 2 features:

**File:** `PHASE_2_TRACEABILITY_API.md`

**New Endpoints:**

- `GET /api/batches/:id/genealogy` - Get batch genealogy with returns
- `GET /api/batches/:id/origin` - Trace return to source batch
- `GET /api/batches/materials/:materialId/returns-summary` - Material returns summary

**Enhanced Endpoints:**

- `POST /api/purchase-orders/:id/receive` - Now supports return items with source_batch_id tracking

**Key Features:**

- Source batch ID tracking for all returns
- Self-referential batch relationships
- Aggregated inventory reporting
- Comprehensive error handling and validation

See `PHASE_2_TRACEABILITY_API.md` for complete documentation.

## 📞 Support

If you encounter issues:

1. Check the backend server logs
2. Verify database connection
3. Test with simpler requests first
4. Check the DATABASE_SCHEMA.md for table structures
5. Review controller implementations for expected behavior
6. Refer to PHASE_2_TRACEABILITY_API.md for new endpoints

## 🎯 Production Deployment

**Comprehensive Test Suite:** `COMPREHENSIVE_TEST_SUITE.ps1`

- 12/12 tests covering all PO management and traceability workflows
- All critical paths validated
- Data integrity verified

**Deployment Checklist:** `PRODUCTION_READINESS_CHECKLIST.md`

- Complete code review
- Security & authentication
- Database & indexes
- Performance considerations
- Return batch traceability validation

**Status:** ✅ PRODUCTION READY
