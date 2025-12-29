# Hasal POS API Testing Guide

This guide provides comprehensive API testing resources for the Hasal Products Point of Sale System.

## 📋 Files Included

1. **`Hasal_POS_API_Collection.postman_collection.json`** - Complete Postman collection
2. **`Hasal_POS_Environment.postman_environment.json`** - Postman environment configuration
3. **`Hasal_POS_API_Swagger.json`** - OpenAPI/Swagger specification

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

### Option 2: Using Swagger UI

1. **Install Swagger UI** or use an online viewer
2. **Open the Swagger file** in your preferred Swagger viewer
3. **Set server URL** to `http://localhost:3000`
4. **Authorize** with JWT token after login
5. **Test endpoints** directly from the interface

## 🔐 Authentication

All API endpoints (except `/health`, `/api`, and `/api/auth/*`) require authentication:

- **Method:** Bearer Token (JWT)
- **Header:** `Authorization: Bearer <your-jwt-token>`
- **Login Endpoint:** `POST /api/auth/login`

### Default Test Credentials

- **Admin:** `admin` / `admin123`
- **Cashier:** `cashier` / `cashier123`

## 📊 API Endpoints Overview

### Core Modules

| Module | Base Path | Key Endpoints |
|--------|-----------|---------------|
| **Authentication** | `/api/auth` | login, register, me, logout |
| **Suppliers** | `/api/suppliers` | CRUD + payments, balance |
| **Raw Materials** | `/api/raw-materials` | CRUD + batches, stock |
| **Products** | `/api/products` | CRUD + SKUs, stock |
| **Purchase Orders** | `/api/purchase-orders` | CRUD + receive items |
| **Sales Invoices** | `/api/sales-invoices` | CRUD + items |
| **Payments** | `/api/payments` | CRUD + pending checks |
| **Production** | `/api/production-runs` | CRUD + complete runs |
| **Recipes** | `/api/recipes` | CRUD + ingredients |
| **Routes** | `/api/routes` | CRUD operations |
| **Outlets** | `/api/outlets` | CRUD operations |
| **Employees** | `/api/employees` | CRUD operations |
| **Vehicles** | `/api/vehicles` | CRUD operations |

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

## 📞 Support

If you encounter issues:
1. Check the backend server logs
2. Verify database connection
3. Test with simpler requests first
4. Check the DATABASE_SCHEMA.md for table structures
5. Review controller implementations for expected behavior

## 🎯 Next Steps

After completing Week 3 testing:
- Move to Week 4 (Purchase Orders & Receiving)
- Test integration between Suppliers and Purchase Orders
- Verify balance calculations and stock updates
- Test payment processing workflows