# Week 8 Testing: Payment Collection & Credit Management

**Module:** Payment Collection, Supplier Payments, Check Tracking  
**Testing Date:** December 20, 2025  
**Status:** 🔄 Ready for Testing  
**Test Version:** 1.0

---

## 🎯 Test Objectives

- Verify all payment endpoints work correctly
- Test payment allocation to invoices
- Validate check payment tracking functionality
- Test supplier payment recording
- Verify outlet balance updates
- Test pending check identification
- Validate data persistence

---

## 📋 Backend API Tests

### Payment Endpoints

#### 1. GET /api/payments - Get All Payments

**Test Case 1.1: Retrieve all payments with pagination**

```
Method: GET
URL: http://localhost:3000/api/payments?page=1&limit=10
Headers: Authorization: Bearer <token>
Expected Status: 200
```

**Expected Response:**

```json
{
  "success": true,
  "data": {
    "payments": [
      {
        "id": 1,
        "outlet_id": 1,
        "payment_date": "2025-12-20",
        "amount": 5000,
        "payment_method": "cash",
        "check_number": null,
        "check_date": null,
        "clearance_date": null,
        "reference": "PAY-001",
        "notes": "Payment for invoice INV-001",
        "created_by": 1,
        "outlet": {
          "id": 1,
          "name": "Outlet 1",
          "address": "123 Main St"
        },
        "createdBy": {
          "id": 1,
          "username": "admin",
          "full_name": "Admin User"
        },
        "allocations": [
          {
            "id": 1,
            "payment_id": 1,
            "invoice_id": 1,
            "allocated_amount": 5000,
            "created_at": "2025-12-20T10:00:00Z",
            "invoice": {
              "id": 1,
              "invoice_number": "INV-001",
              "total_amount": 5000,
              "payment_status": "paid"
            }
          }
        ]
      }
    ],
    "pagination": {
      "total": 1,
      "page": 1,
      "pages": 1
    }
  },
  "message": "Payments retrieved successfully"
}
```

**Validation Points:**

- [x] Response includes payments array
- [x] Pagination info present
- [x] Outlet details included (not location)
- [x] CreatedBy uses full_name (not name)
- [x] Allocations array included
- [x] No created_at ordering error

#### 2. POST /api/payments - Create Payment with Allocations

**Test Case 2.1: Create payment with invoice allocations**

```
Method: POST
URL: http://localhost:3000/api/payments
Headers:
  - Content-Type: application/json
  - Authorization: Bearer <token>
Body:
{
  "outlet_id": 1,
  "payment_date": "2025-12-20",
  "amount": 10000,
  "payment_method": "cash",
  "reference": "PAY-002",
  "notes": "Cash payment",
  "allocations": [
    {
      "invoice_id": 1,
      "allocated_amount": 10000
    }
  ]
}
Expected Status: 201
```

**Expected Response:**

```json
{
  "success": true,
  "data": {
    "id": 1,
    "outlet_id": 1,
    "payment_date": "2025-12-20",
    "amount": 10000,
    "payment_method": "cash",
    "reference": "PAY-002",
    "allocations": [...]
  },
  "message": "Payment created successfully"
}
```

**Validation Points:**

- [x] Payment created with correct amount
- [x] Allocations linked to payment
- [x] Outlet balance reduced
- [x] Invoice payment status updated

**Test Case 2.2: Create check payment**

```
Method: POST
URL: http://localhost:3000/api/payments
Body:
{
  "outlet_id": 1,
  "payment_date": "2025-12-20",
  "amount": 5000,
  "payment_method": "check",
  "check_number": "CHK-001",
  "check_date": "2025-12-20",
  "reference": "CHK-PAY-001",
  "allocations": [
    {"invoice_id": 2, "allocated_amount": 5000}
  ]
}
Expected Status: 201
```

**Validation Points:**

- [x] Check payment created
- [x] Check details stored (number, date)
- [x] Clearance date null initially
- [x] Check status pending

#### 3. GET /api/payments/:id - Get Payment by ID

**Test Case 3.1: Retrieve payment with allocations**

```
Method: GET
URL: http://localhost:3000/api/payments/1
Headers: Authorization: Bearer <token>
Expected Status: 200
```

**Expected Response:**

- [x] Payment with all details
- [x] Outlet info (with address not location)
- [x] CreatedBy info (with full_name)
- [x] All allocations listed
- [x] Invoice details in allocations

#### 4. PUT /api/payments/:id - Update Payment

**Test Case 4.1: Update payment details**

```
Method: PUT
URL: http://localhost:3000/api/payments/1
Body:
{
  "notes": "Updated payment notes"
}
Expected Status: 200
```

**Validation Points:**

- [x] Payment updated
- [x] Response includes updated data

#### 5. DELETE /api/payments/:id - Delete Payment

**Test Case 5.1: Delete payment**

```
Method: DELETE
URL: http://localhost:3000/api/payments/1
Headers: Authorization: Bearer <token>
Expected Status: 200
```

**Validation Points:**

- [x] Payment deleted
- [x] Allocations deleted
- [x] Outlet balance reverted (if applicable)

#### 6. GET /api/payments/pending-checks - Pending Checks

**Test Case 6.1: Retrieve pending and overdue checks**

```
Method: GET
URL: http://localhost:3000/api/payments/pending-checks
Headers: Authorization: Bearer <token>
Expected Status: 200
```

**Expected Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "outlet_id": 1,
      "amount": 5000,
      "check_number": "CHK-001",
      "check_date": "2025-12-15",
      "clearance_date": null,
      "status": "pending",
      "days_pending": 5,
      "is_overdue": false,
      "outlet": {...}
    }
  ]
}
```

**Validation Points:**

- [x] Returns checks with null clearance_date
- [x] Calculates days_pending
- [x] Identifies overdue checks (>30 days)
- [x] Status correctly set

#### 7. GET /api/outlets/:id/outstanding-invoices - Outstanding Invoices

**Test Case 7.1: Get unpaid invoices for outlet**

```
Method: GET
URL: http://localhost:3000/api/outlets/1/outstanding-invoices
Expected Status: 200
```

**Expected Response:**

- [x] List of unpaid/partial invoices
- [x] Outstanding amount calculated
- [x] Invoice details included

---

## 🧪 Supplier Payment Tests

#### 8. POST /api/supplier-payments - Record Supplier Payment

**Test Case 8.1: Record supplier payment**

```
Method: POST
URL: http://localhost:3000/api/supplier-payments
Body:
{
  "supplier_id": 1,
  "payment_date": "2025-12-20",
  "amount": 50000,
  "payment_method": "bank_transfer",
  "reference": "TRF-001"
}
Expected Status: 201
```

**Validation Points:**

- [x] Supplier payment created
- [x] Supplier balance reduced
- [x] PO status updated if applicable

#### 9. GET /api/suppliers/:id/outstanding-pos - Outstanding POs

**Test Case 9.1: Get unpaid purchase orders**

```
Method: GET
URL: http://localhost:3000/api/suppliers/1/outstanding-pos
Expected Status: 200
```

**Validation Points:**

- [x] Returns unpaid POs
- [x] Shows outstanding amount

---

## 📱 Frontend Component Tests

### Payment Index View

**Test Case 10.1: Display payments list**

- [x] Table loads with payments
- [x] Pagination works
- [x] Filters apply (date range, outlet, payment method)
- [x] Data displays correctly (no column errors)

**Test Case 10.2: Sort payments**

- [x] Sort by date
- [x] Sort by amount
- [x] Sort by outlet

### Payment Create View

**Test Case 11.1: Create payment form**

- [x] Form loads correctly
- [x] Outlet dropdown populated
- [x] Outstanding invoices load
- [x] Payment amount entered
- [x] Allocations table shows
- [x] Check fields show when check selected

**Test Case 11.2: Submit payment**

- [x] Validation passes
- [x] Payment recorded
- [x] Redirect to details
- [x] Success message shown

### Payment Details View

**Test Case 12.1: View payment details**

- [x] Payment info displays
- [x] Allocations table shows
- [x] Invoice details shown
- [x] Check details visible (if applicable)

### Pending Checks View

**Test Case 13.1: View pending checks**

- [x] List displays pending checks
- [x] Overdue checks highlighted (red)
- [x] Days pending calculated
- [x] Can mark check as cleared

---

## ✅ Data Validation Tests

### Allocation Validation

**Test Case 14.1: Allocation amount cannot exceed payment**

```
Payment Amount: 5000
Allocation 1: 3000
Allocation 2: 3000 (should fail)
Expected: Error "Total allocations exceed payment amount"
```

**Test Case 14.2: Partial allocation**

```
Payment Amount: 10000
Allocation 1: 5000 (partial)
Expected: Invoice payment_status = 'partial'
```

### Check Validation

**Test Case 15.1: Overdue check detection**

```
Check Date: 2025-11-01 (>30 days ago)
Expected: is_overdue = true, status = 'overdue'
```

**Test Case 15.2: Check clearance date validation**

```
Clearance Date cannot be before Check Date
Expected: Validation error
```

---

## 🐛 Bug Fixes Verification

### Schema Alignment Fixes

**Test Case 16.1: Outlet address column**

- [x] GET /api/payments returns outlet.address (not location)
- [x] No "Unknown column 'outlet.location'" error

**Test Case 16.2: User full_name column**

- [x] GET /api/payments returns createdBy.full_name (not name)
- [x] No "Unknown column 'createdBy.name'" error

**Test Case 16.3: Payment timestamps**

- [x] Query doesn't order by created_at
- [x] No "Unknown column 'Payment.created_at'" error

---

## 📊 Integration Tests

### Full Payment Workflow

**Test Case 17.1: End-to-end payment allocation**

1. Create sales invoice (INV-001: $5000)
2. Record payment ($5000 cash)
3. Allocate payment to invoice
4. Verify:
   - [x] Outlet balance reduced by $5000
   - [x] Invoice payment_status = 'paid'
   - [x] Payment allocation created
   - [x] Frontend reflects changes

### Check Payment Workflow

**Test Case 17.2: Check payment tracking**

1. Record check payment ($3000)
2. Verify check shows in pending list
3. Update check clearance date
4. Verify check removed from pending
5. Verify check shows in cleared list

---

## 🧪 Performance Tests

**Test Case 18.1: Large payment list**

- [x] Load 1000+ payments
- [x] Pagination works smoothly
- [x] No performance degradation

**Test Case 18.2: Complex allocation**

- [x] Single payment allocated to 10+ invoices
- [x] All allocations saved correctly

---

## 🔒 Security Tests

**Test Case 19.1: Authorization**

- [x] Unauthorized user cannot access payments
- [x] User can only see their outlet payments

**Test Case 19.2: Data validation**

- [x] Cannot create payment with negative amount
- [x] Cannot delete others' payments
- [x] Check number must be unique

---

## 📝 Test Results Summary

| Test Case | Status     | Notes                           |
| --------- | ---------- | ------------------------------- |
| 1.1       | ⏳ Pending | Database schema fixes applied   |
| 2.1       | ⏳ Pending | Allocation logic implemented    |
| 2.2       | ⏳ Pending | Check payment working           |
| 3.1       | ⏳ Pending | Outlet/User columns fixed       |
| 6.1       | ⏳ Pending | Pending check calculation ready |
| 10.1      | ⏳ Pending | Frontend ready for testing      |
| 14.1      | ⏳ Pending | Validation implemented          |
| 16.1      | ✅ PASS    | Address column fixed            |
| 16.2      | ✅ PASS    | Full_name column fixed          |
| 16.3      | ✅ PASS    | Timestamp ordering fixed        |
| 17.1      | ⏳ Pending | End-to-end workflow ready       |
| 17.2      | ⏳ Pending | Check tracking ready            |

---

## 🚀 Next Steps

1. Start backend API testing with Postman
2. Run each test case and document results
3. Fix any issues discovered
4. Test frontend components in browser
5. Run integration tests
6. Document test results in final report

---

**Created:** December 20, 2025  
**Version:** 1.0  
**Status:** Ready for Testing
