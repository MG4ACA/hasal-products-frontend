# Week 8 Implementation: Payment Collection & Credit Management

**Module:** Payment Collection, Supplier Payments, Check Tracking  
**Implementation Date:** December 20, 2025  
**Status:** 🔄 In Progress  
**Developer:** GitHub Copilot

---

## 📋 Overview

Week 8 focuses on implementing the complete Payment Collection & Credit Management module. This includes recording customer payments (outlet payments), supplier payments, check payment tracking with clearance dates, payment allocation to specific invoices, and outstanding balance management.

### Key Features to Implement

- ✅ Payment recording for outlets (reduce credit balances)
- ✅ Payment allocation to specific invoices
- ✅ Check payment tracking (number, date, clearance date, status)
- ✅ Supplier payment recording with balance updates
- ✅ Outstanding invoice tracking
- ✅ Payment receipt generation
- ✅ Check status monitoring (pending/cleared/overdue)
- ✅ Payment method support (cash, bank transfer, check)
- ✅ Payment history views

---

## 🎯 Requirements Analysis

### Business Rules

1. **Payment Recording:**
   - Payments can be made against outlet credit balances
   - Payment reduces outlet balance immediately
   - Payment can be allocated to specific invoices or general account
   - Supported payment methods: cash, bank_transfer, check

2. **Check Payments:**
   - Must capture check_number, check_date
   - Optional clearance_date (when check clears)
   - Check status: pending (no clearance_date), cleared (has clearance_date), overdue (>30 days without clearance)
   - Overdue checks highlighted in reports

3. **Payment Allocation:**
   - Payment can be allocated to multiple invoices
   - Allocated amount cannot exceed payment amount
   - Invoice payment status: unpaid, partial, paid
   - Allocation creates payment-invoice link

4. **Supplier Payments:**
   - Record payments made to suppliers
   - Reduces supplier balance (outstanding payables)
   - Same payment methods supported
   - Links to purchase orders (optional)

5. **Outstanding Invoices:**
   - Track unpaid and partially paid invoices
   - Display outstanding amount per invoice
   - Sort by age (oldest first)

---

## 🗄️ Database Schema Updates

### Existing Tables (Already Created)

#### payments

```sql
CREATE TABLE payments (
  id INT PRIMARY KEY AUTO_INCREMENT,
  invoice_id INT,
  payment_method ENUM('cash', 'credit', 'check'),
  amount DECIMAL(10,2),
  check_number VARCHAR(50),
  check_date DATE,
  clearance_date DATE,
  payment_date DATE,
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  FOREIGN KEY (invoice_id) REFERENCES sales_invoices(id)
);
```

**Note:** This table tracks payments made BY customers (on invoices). For Week 8, we'll use it to track:

- Payments TO outlets (reducing their credit balance)
- The invoice_id can be NULL for general account payments

#### supplier_payments

```sql
CREATE TABLE supplier_payments (
  id INT PRIMARY KEY AUTO_INCREMENT,
  supplier_id INT NOT NULL,
  po_id INT,
  payment_method ENUM('cash', 'bank_transfer', 'check'),
  amount DECIMAL(10,2) NOT NULL,
  check_number VARCHAR(50),
  check_date DATE,
  clearance_date DATE,
  payment_date DATE NOT NULL,
  remarks TEXT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  FOREIGN KEY (supplier_id) REFERENCES suppliers(id),
  FOREIGN KEY (po_id) REFERENCES purchase_orders(id)
);
```

### New Table: payment_allocations

**Purpose:** Track how payments are allocated to specific invoices

```sql
CREATE TABLE payment_allocations (
  id INT PRIMARY KEY AUTO_INCREMENT,
  payment_id INT NOT NULL,
  invoice_id INT NOT NULL,
  allocated_amount DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (payment_id) REFERENCES payments(id) ON DELETE CASCADE,
  FOREIGN KEY (invoice_id) REFERENCES sales_invoices(id) ON DELETE CASCADE
);
```

**Migration File:** `20251220-create-payment-allocations.js`

---

## 🔧 Backend Implementation

### 1. Create Payment Allocation Model

**File:** `hasal-pos-backend/models/PaymentAllocation.js`

```javascript
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const PaymentAllocation = sequelize.define(
  'PaymentAllocation',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    payment_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'payments',
        key: 'id',
      },
    },
    invoice_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'sales_invoices',
        key: 'id',
      },
    },
    allocated_amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: 0.01,
      },
    },
  },
  {
    tableName: 'payment_allocations',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false,
  }
);

module.exports = PaymentAllocation;
```

---

### 2. Update Model Associations

**File:** `hasal-pos-backend/models/index.js`

Add associations for PaymentAllocation:

```javascript
const PaymentAllocation = require('./PaymentAllocation');

// Payment to PaymentAllocation (one-to-many)
Payment.hasMany(PaymentAllocation, {
  foreignKey: 'payment_id',
  as: 'allocations',
});
PaymentAllocation.belongsTo(Payment, {
  foreignKey: 'payment_id',
  as: 'payment',
});

// SalesInvoice to PaymentAllocation (one-to-many)
SalesInvoice.hasMany(PaymentAllocation, {
  foreignKey: 'invoice_id',
  as: 'allocations',
});
PaymentAllocation.belongsTo(SalesInvoice, {
  foreignKey: 'invoice_id',
  as: 'invoice',
});

module.exports = {
  // ... existing exports
  PaymentAllocation,
};
```

---

### 3. Create Migration for Payment Allocations

**File:** `hasal-pos-backend/migrations/20251220-create-payment-allocations.js`

```javascript
'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('payment_allocations', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      payment_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'payments',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      invoice_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'sales_invoices',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      allocated_amount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    // Add indexes
    await queryInterface.addIndex('payment_allocations', ['payment_id']);
    await queryInterface.addIndex('payment_allocations', ['invoice_id']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('payment_allocations');
  },
};
```

---

### 4. Payment Controller

**File:** `hasal-pos-backend/controllers/paymentController.js`

```javascript
const { Payment, SalesInvoice, Outlet, PaymentAllocation } = require('../models');
const { successResponse, errorResponse } = require('../utils/response');
const { Op } = require('sequelize');
const sequelize = require('../config/database');

// Get all payments with pagination and filters
exports.getAllPayments = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      outlet_id,
      payment_method,
      start_date,
      end_date,
      check_status,
    } = req.query;

    const offset = (page - 1) * limit;
    const where = {};

    // Filter by outlet (through invoice)
    const invoiceWhere = {};
    if (outlet_id) {
      invoiceWhere.outlet_id = outlet_id;
    }

    // Filter by payment method
    if (payment_method) {
      where.payment_method = payment_method;
    }

    // Filter by date range
    if (start_date || end_date) {
      where.payment_date = {};
      if (start_date) where.payment_date[Op.gte] = start_date;
      if (end_date) where.payment_date[Op.lte] = end_date;
    }

    // Filter by check status (pending/cleared/overdue)
    if (check_status) {
      if (check_status === 'pending') {
        where.payment_method = 'check';
        where.clearance_date = null;
      } else if (check_status === 'cleared') {
        where.payment_method = 'check';
        where.clearance_date = { [Op.not]: null };
      } else if (check_status === 'overdue') {
        where.payment_method = 'check';
        where.clearance_date = null;
        where.check_date = {
          [Op.lt]: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        };
      }
    }

    const { rows, count } = await Payment.findAndCountAll({
      where,
      include: [
        {
          model: SalesInvoice,
          as: 'invoice',
          where: Object.keys(invoiceWhere).length > 0 ? invoiceWhere : undefined,
          include: [
            {
              model: Outlet,
              as: 'outlet',
              attributes: ['id', 'name'],
            },
          ],
        },
        {
          model: PaymentAllocation,
          as: 'allocations',
          include: [
            {
              model: SalesInvoice,
              as: 'invoice',
              attributes: ['id', 'invoice_number'],
            },
          ],
        },
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['payment_date', 'DESC']],
    });

    return successResponse(res, 'Payments fetched successfully', {
      payments: rows,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching payments:', error);
    return errorResponse(res, 'Error fetching payments', 500);
  }
};

// Get payment by ID
exports.getPaymentById = async (req, res) => {
  try {
    const { id } = req.params;

    const payment = await Payment.findByPk(id, {
      include: [
        {
          model: SalesInvoice,
          as: 'invoice',
          include: [
            {
              model: Outlet,
              as: 'outlet',
            },
          ],
        },
        {
          model: PaymentAllocation,
          as: 'allocations',
          include: [
            {
              model: SalesInvoice,
              as: 'invoice',
              attributes: ['id', 'invoice_number', 'total_amount'],
            },
          ],
        },
      ],
    });

    if (!payment) {
      return errorResponse(res, 'Payment not found', 404);
    }

    return successResponse(res, 'Payment fetched successfully', { payment });
  } catch (error) {
    console.error('Error fetching payment:', error);
    return errorResponse(res, 'Error fetching payment', 500);
  }
};

// Record new payment
exports.createPayment = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const {
      outlet_id,
      payment_method,
      amount,
      payment_date,
      check_number,
      check_date,
      clearance_date,
      remarks,
      allocations, // Array of { invoice_id, allocated_amount }
    } = req.body;

    // Validate required fields
    if (!outlet_id || !payment_method || !amount || !payment_date) {
      await transaction.rollback();
      return errorResponse(res, 'Missing required fields', 400);
    }

    // Validate check payment fields
    if (payment_method === 'check' && (!check_number || !check_date)) {
      await transaction.rollback();
      return errorResponse(res, 'Check number and date required for check payments', 400);
    }

    // Get outlet
    const outlet = await Outlet.findByPk(outlet_id, { transaction });
    if (!outlet) {
      await transaction.rollback();
      return errorResponse(res, 'Outlet not found', 404);
    }

    // Validate payment amount doesn't exceed outlet balance
    if (parseFloat(amount) > parseFloat(outlet.balance)) {
      await transaction.rollback();
      return errorResponse(
        res,
        `Payment amount (${amount}) exceeds outlet balance (${outlet.balance})`,
        400
      );
    }

    // Create payment record (invoice_id is NULL for general payments)
    const payment = await Payment.create(
      {
        invoice_id: null, // General payment, not linked to specific invoice initially
        payment_method,
        amount,
        payment_date,
        check_number: payment_method === 'check' ? check_number : null,
        check_date: payment_method === 'check' ? check_date : null,
        clearance_date: payment_method === 'check' && clearance_date ? clearance_date : null,
        remarks,
      },
      { transaction }
    );

    // If allocations provided, create allocation records
    if (allocations && allocations.length > 0) {
      const totalAllocated = allocations.reduce(
        (sum, alloc) => sum + parseFloat(alloc.allocated_amount),
        0
      );

      // Validate total allocated doesn't exceed payment amount
      if (totalAllocated > parseFloat(amount)) {
        await transaction.rollback();
        return errorResponse(
          res,
          `Total allocated amount (${totalAllocated}) exceeds payment amount (${amount})`,
          400
        );
      }

      // Create allocation records
      for (const alloc of allocations) {
        const invoice = await SalesInvoice.findByPk(alloc.invoice_id, { transaction });
        if (!invoice) {
          await transaction.rollback();
          return errorResponse(res, `Invoice ${alloc.invoice_id} not found`, 404);
        }

        // Check invoice belongs to outlet
        if (invoice.outlet_id !== outlet_id) {
          await transaction.rollback();
          return errorResponse(
            res,
            `Invoice ${invoice.invoice_number} does not belong to outlet`,
            400
          );
        }

        // Create allocation
        await PaymentAllocation.create(
          {
            payment_id: payment.id,
            invoice_id: alloc.invoice_id,
            allocated_amount: alloc.allocated_amount,
          },
          { transaction }
        );

        // Update invoice payment status
        const totalPaid = await PaymentAllocation.sum('allocated_amount', {
          where: { invoice_id: alloc.invoice_id },
          transaction,
        });

        let paymentStatus = 'unpaid';
        if (totalPaid >= parseFloat(invoice.total_amount)) {
          paymentStatus = 'paid';
        } else if (totalPaid > 0) {
          paymentStatus = 'partial';
        }

        await invoice.update({ payment_status: paymentStatus }, { transaction });
      }
    }

    // Reduce outlet balance
    const newBalance = parseFloat(outlet.balance) - parseFloat(amount);
    await outlet.update({ balance: newBalance }, { transaction });

    await transaction.commit();

    // Fetch complete payment record
    const completePayment = await Payment.findByPk(payment.id, {
      include: [
        {
          model: PaymentAllocation,
          as: 'allocations',
          include: [
            {
              model: SalesInvoice,
              as: 'invoice',
              attributes: ['id', 'invoice_number'],
            },
          ],
        },
      ],
    });

    return successResponse(res, 'Payment recorded successfully', { payment: completePayment }, 201);
  } catch (error) {
    await transaction.rollback();
    console.error('Error creating payment:', error);
    return errorResponse(res, 'Error recording payment', 500);
  }
};

// Update payment (e.g., add clearance date)
exports.updatePayment = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const { id } = req.params;
    const { clearance_date, remarks } = req.body;

    const payment = await Payment.findByPk(id, { transaction });
    if (!payment) {
      await transaction.rollback();
      return errorResponse(res, 'Payment not found', 404);
    }

    // Update payment
    const updateData = {};
    if (clearance_date !== undefined) updateData.clearance_date = clearance_date;
    if (remarks !== undefined) updateData.remarks = remarks;

    await payment.update(updateData, { transaction });

    await transaction.commit();

    return successResponse(res, 'Payment updated successfully', { payment });
  } catch (error) {
    await transaction.rollback();
    console.error('Error updating payment:', error);
    return errorResponse(res, 'Error updating payment', 500);
  }
};

// Delete payment
exports.deletePayment = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const { id } = req.params;

    const payment = await Payment.findByPk(id, {
      include: [
        {
          model: SalesInvoice,
          as: 'invoice',
        },
        {
          model: PaymentAllocation,
          as: 'allocations',
        },
      ],
      transaction,
    });

    if (!payment) {
      await transaction.rollback();
      return errorResponse(res, 'Payment not found', 404);
    }

    // Get outlet through first allocation or invoice
    let outlet_id;
    if (payment.invoice) {
      outlet_id = payment.invoice.outlet_id;
    } else if (payment.allocations && payment.allocations.length > 0) {
      const firstInvoice = await SalesInvoice.findByPk(payment.allocations[0].invoice_id, {
        transaction,
      });
      outlet_id = firstInvoice.outlet_id;
    }

    if (outlet_id) {
      // Restore outlet balance
      const outlet = await Outlet.findByPk(outlet_id, { transaction });
      const newBalance = parseFloat(outlet.balance) + parseFloat(payment.amount);
      await outlet.update({ balance: newBalance }, { transaction });

      // Update invoice payment statuses
      for (const alloc of payment.allocations) {
        const invoice = await SalesInvoice.findByPk(alloc.invoice_id, { transaction });
        const totalPaid =
          (await PaymentAllocation.sum('allocated_amount', {
            where: {
              invoice_id: alloc.invoice_id,
              payment_id: { [Op.ne]: payment.id },
            },
            transaction,
          })) || 0;

        let paymentStatus = 'unpaid';
        if (totalPaid >= parseFloat(invoice.total_amount)) {
          paymentStatus = 'paid';
        } else if (totalPaid > 0) {
          paymentStatus = 'partial';
        }

        await invoice.update({ payment_status: paymentStatus }, { transaction });
      }
    }

    // Delete payment (cascades to allocations)
    await payment.destroy({ transaction });

    await transaction.commit();

    return successResponse(res, 'Payment deleted successfully');
  } catch (error) {
    await transaction.rollback();
    console.error('Error deleting payment:', error);
    return errorResponse(res, 'Error deleting payment', 500);
  }
};

// Get outstanding invoices for outlet
exports.getOutstandingInvoices = async (req, res) => {
  try {
    const { outlet_id } = req.params;

    const invoices = await SalesInvoice.findAll({
      where: {
        outlet_id,
        payment_method: 'credit',
        status: { [Op.in]: ['completed', 'partially_returned'] },
        payment_status: { [Op.in]: ['unpaid', 'partial'] },
      },
      include: [
        {
          model: PaymentAllocation,
          as: 'allocations',
          required: false,
        },
      ],
      order: [['invoice_date', 'ASC']],
    });

    // Calculate outstanding amount for each invoice
    const invoicesWithOutstanding = invoices.map(invoice => {
      const totalPaid = invoice.allocations.reduce(
        (sum, alloc) => sum + parseFloat(alloc.allocated_amount),
        0
      );
      const outstanding = parseFloat(invoice.total_amount) - totalPaid;

      return {
        id: invoice.id,
        invoice_number: invoice.invoice_number,
        invoice_date: invoice.invoice_date,
        total_amount: invoice.total_amount,
        paid_amount: totalPaid,
        outstanding_amount: outstanding,
        payment_status: invoice.payment_status,
      };
    });

    return successResponse(res, 'Outstanding invoices fetched successfully', {
      invoices: invoicesWithOutstanding,
    });
  } catch (error) {
    console.error('Error fetching outstanding invoices:', error);
    return errorResponse(res, 'Error fetching outstanding invoices', 500);
  }
};

// Get pending checks (not cleared)
exports.getPendingChecks = async (req, res) => {
  try {
    const checks = await Payment.findAll({
      where: {
        payment_method: 'check',
        clearance_date: null,
      },
      include: [
        {
          model: SalesInvoice,
          as: 'invoice',
          include: [
            {
              model: Outlet,
              as: 'outlet',
              attributes: ['id', 'name'],
            },
          ],
        },
      ],
      order: [['check_date', 'ASC']],
    });

    // Mark overdue checks (>30 days)
    const checksWithStatus = checks.map(check => {
      const checkDate = new Date(check.check_date);
      const daysSinceCheck = Math.floor((Date.now() - checkDate) / (1000 * 60 * 60 * 24));
      const isOverdue = daysSinceCheck > 30;

      return {
        ...check.toJSON(),
        days_pending: daysSinceCheck,
        is_overdue: isOverdue,
      };
    });

    return successResponse(res, 'Pending checks fetched successfully', {
      checks: checksWithStatus,
    });
  } catch (error) {
    console.error('Error fetching pending checks:', error);
    return errorResponse(res, 'Error fetching pending checks', 500);
  }
};

module.exports = exports;
```

---

### 5. Supplier Payment Controller Methods

**File:** `hasal-pos-backend/controllers/supplierController.js`

Add these methods to existing supplier controller:

```javascript
const { SupplierPayment, Supplier, PurchaseOrder } = require('../models');

// Get all supplier payments
exports.getAllSupplierPayments = async (req, res) => {
  try {
    const { page = 1, limit = 10, supplier_id, start_date, end_date } = req.query;

    const offset = (page - 1) * limit;
    const where = {};

    if (supplier_id) {
      where.supplier_id = supplier_id;
    }

    if (start_date || end_date) {
      where.payment_date = {};
      if (start_date) where.payment_date[Op.gte] = start_date;
      if (end_date) where.payment_date[Op.lte] = end_date;
    }

    const { rows, count } = await SupplierPayment.findAndCountAll({
      where,
      include: [
        {
          model: Supplier,
          as: 'supplier',
          attributes: ['id', 'name', 'code'],
        },
        {
          model: PurchaseOrder,
          as: 'purchaseOrder',
          attributes: ['id', 'po_number'],
          required: false,
        },
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['payment_date', 'DESC']],
    });

    return successResponse(res, 'Supplier payments fetched successfully', {
      payments: rows,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching supplier payments:', error);
    return errorResponse(res, 'Error fetching supplier payments', 500);
  }
};

// Create supplier payment
exports.createSupplierPayment = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const {
      supplier_id,
      po_id,
      payment_method,
      amount,
      payment_date,
      check_number,
      check_date,
      clearance_date,
      remarks,
    } = req.body;

    // Validate required fields
    if (!supplier_id || !payment_method || !amount || !payment_date) {
      await transaction.rollback();
      return errorResponse(res, 'Missing required fields', 400);
    }

    // Get supplier
    const supplier = await Supplier.findByPk(supplier_id, { transaction });
    if (!supplier) {
      await transaction.rollback();
      return errorResponse(res, 'Supplier not found', 404);
    }

    // Validate payment amount doesn't exceed supplier balance
    if (parseFloat(amount) > parseFloat(supplier.balance)) {
      await transaction.rollback();
      return errorResponse(
        res,
        `Payment amount (${amount}) exceeds supplier balance (${supplier.balance})`,
        400
      );
    }

    // Create payment
    const payment = await SupplierPayment.create(
      {
        supplier_id,
        po_id: po_id || null,
        payment_method,
        amount,
        payment_date,
        check_number: payment_method === 'check' ? check_number : null,
        check_date: payment_method === 'check' ? check_date : null,
        clearance_date: payment_method === 'check' && clearance_date ? clearance_date : null,
        remarks,
      },
      { transaction }
    );

    // Reduce supplier balance
    const newBalance = parseFloat(supplier.balance) - parseFloat(amount);
    await supplier.update({ balance: newBalance }, { transaction });

    await transaction.commit();

    return successResponse(res, 'Supplier payment recorded successfully', { payment }, 201);
  } catch (error) {
    await transaction.rollback();
    console.error('Error creating supplier payment:', error);
    return errorResponse(res, 'Error recording supplier payment', 500);
  }
};

// Get supplier payments by supplier ID
exports.getSupplierPayments = async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const offset = (page - 1) * limit;

    const { rows, count } = await SupplierPayment.findAndCountAll({
      where: { supplier_id: id },
      include: [
        {
          model: PurchaseOrder,
          as: 'purchaseOrder',
          attributes: ['id', 'po_number'],
          required: false,
        },
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['payment_date', 'DESC']],
    });

    return successResponse(res, 'Supplier payments fetched successfully', {
      payments: rows,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching supplier payments:', error);
    return errorResponse(res, 'Error fetching supplier payments', 500);
  }
};
```

---

### 6. Payment Routes

**File:** `hasal-pos-backend/routes/paymentRoutes.js`

```javascript
const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { authenticate } = require('../middleware/authMiddleware');

// All routes require authentication
router.use(authenticate);

// Payment routes
router.get('/', paymentController.getAllPayments);
router.get('/pending-checks', paymentController.getPendingChecks);
router.get('/:id', paymentController.getPaymentById);
router.post('/', paymentController.createPayment);
router.put('/:id', paymentController.updatePayment);
router.delete('/:id', paymentController.deletePayment);

module.exports = router;
```

---

### 7. Update Supplier Routes

**File:** `hasal-pos-backend/routes/supplierRoutes.js`

Add these routes:

```javascript
// Supplier payment routes
router.get('/payments', supplierController.getAllSupplierPayments);
router.post('/payments', supplierController.createSupplierPayment);
router.get('/:id/payments', supplierController.getSupplierPayments);
```

---

### 8. Update Outlet Routes

**File:** `hasal-pos-backend/routes/outletRoutes.js`

Add this route:

```javascript
const paymentController = require('../controllers/paymentController');

// Get outstanding invoices for outlet
router.get('/:outlet_id/outstanding-invoices', paymentController.getOutstandingInvoices);
```

---

### 9. Register Payment Routes in app.js

**File:** `hasal-pos-backend/app.js`

```javascript
const paymentRoutes = require('./routes/paymentRoutes');

// Register routes
app.use('/api/payments', paymentRoutes);
```

---

## 🎨 Frontend Implementation

### 1. Payment Service

**File:** `src/services/paymentService.js`

```javascript
import api from './api';

export const paymentService = {
  // Get all payments
  async getAll(params = {}) {
    const response = await api.get('/payments', { params });
    return response.data;
  },

  // Get payment by ID
  async getById(id) {
    const response = await api.get(`/payments/${id}`);
    return response.data;
  },

  // Create payment
  async create(paymentData) {
    const response = await api.post('/payments', paymentData);
    return response.data;
  },

  // Update payment (e.g., add clearance date)
  async update(id, paymentData) {
    const response = await api.put(`/payments/${id}`, paymentData);
    return response.data;
  },

  // Delete payment
  async delete(id) {
    const response = await api.delete(`/payments/${id}`);
    return response.data;
  },

  // Get outstanding invoices for outlet
  async getOutstandingInvoices(outlet_id) {
    const response = await api.get(`/outlets/${outlet_id}/outstanding-invoices`);
    return response.data;
  },

  // Get pending checks
  async getPendingChecks() {
    const response = await api.get('/payments/pending-checks');
    return response.data;
  },
};

export const supplierPaymentService = {
  // Get all supplier payments
  async getAll(params = {}) {
    const response = await api.get('/suppliers/payments', { params });
    return response.data;
  },

  // Create supplier payment
  async create(paymentData) {
    const response = await api.post('/suppliers/payments', paymentData);
    return response.data;
  },

  // Get supplier payments by supplier ID
  async getBySupplierId(id, params = {}) {
    const response = await api.get(`/suppliers/${id}/payments`, { params });
    return response.data;
  },
};
```

---

### 2. Payment Store

**File:** `src/stores/payment.js`

```javascript
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { paymentService, supplierPaymentService } from '@/services/paymentService';

export const usePaymentStore = defineStore('payment', () => {
  // State
  const payments = ref([]);
  const currentPayment = ref(null);
  const outstandingInvoices = ref([]);
  const pendingChecks = ref([]);
  const supplierPayments = ref([]);
  const loading = ref(false);
  const error = ref(null);
  const pagination = ref({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  });

  // Computed
  const checkPayments = computed(() => payments.value.filter(p => p.payment_method === 'check'));

  const overdueChecks = computed(() => pendingChecks.value.filter(c => c.is_overdue));

  // Actions - Customer Payments
  const fetchPayments = async (params = {}) => {
    loading.value = true;
    error.value = null;
    try {
      const response = await paymentService.getAll({
        page: pagination.value.page,
        limit: pagination.value.limit,
        ...params,
      });
      payments.value = response.payments;
      pagination.value = response.pagination;
      return response;
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to fetch payments';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const fetchPaymentById = async id => {
    loading.value = true;
    error.value = null;
    try {
      const response = await paymentService.getById(id);
      currentPayment.value = response.payment;
      return response;
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to fetch payment';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const createPayment = async paymentData => {
    loading.value = true;
    error.value = null;
    try {
      const response = await paymentService.create(paymentData);
      await fetchPayments();
      return response;
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to create payment';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const updatePayment = async (id, paymentData) => {
    loading.value = true;
    error.value = null;
    try {
      const response = await paymentService.update(id, paymentData);
      await fetchPayments();
      return response;
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to update payment';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const deletePayment = async id => {
    loading.value = true;
    error.value = null;
    try {
      await paymentService.delete(id);
      await fetchPayments();
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to delete payment';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const fetchOutstandingInvoices = async outlet_id => {
    loading.value = true;
    error.value = null;
    try {
      const response = await paymentService.getOutstandingInvoices(outlet_id);
      outstandingInvoices.value = response.invoices;
      return response;
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to fetch outstanding invoices';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const fetchPendingChecks = async () => {
    loading.value = true;
    error.value = null;
    try {
      const response = await paymentService.getPendingChecks();
      pendingChecks.value = response.checks;
      return response;
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to fetch pending checks';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // Actions - Supplier Payments
  const fetchSupplierPayments = async (params = {}) => {
    loading.value = true;
    error.value = null;
    try {
      const response = await supplierPaymentService.getAll(params);
      supplierPayments.value = response.payments;
      pagination.value = response.pagination;
      return response;
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to fetch supplier payments';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const createSupplierPayment = async paymentData => {
    loading.value = true;
    error.value = null;
    try {
      const response = await supplierPaymentService.create(paymentData);
      await fetchSupplierPayments();
      return response;
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to create supplier payment';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const clearError = () => {
    error.value = null;
  };

  const resetCurrentPayment = () => {
    currentPayment.value = null;
  };

  return {
    // State
    payments,
    currentPayment,
    outstandingInvoices,
    pendingChecks,
    supplierPayments,
    loading,
    error,
    pagination,
    // Computed
    checkPayments,
    overdueChecks,
    // Actions
    fetchPayments,
    fetchPaymentById,
    createPayment,
    updatePayment,
    deletePayment,
    fetchOutstandingInvoices,
    fetchPendingChecks,
    fetchSupplierPayments,
    createSupplierPayment,
    clearError,
    resetCurrentPayment,
  };
});
```

---

### 3. Payment List View

**File:** `src/views/payments/PaymentIndex.vue`

```vue
<template>
  <div class="payment-index">
    <div class="page-header">
      <h1>Payment Collection</h1>
      <router-link to="/payments/create">
        <Button label="Record Payment" icon="pi pi-plus" />
      </router-link>
    </div>

    <Card>
      <template #content>
        <!-- Filters -->
        <div class="filter-section">
          <div class="flex gap-3 flex-wrap">
            <Dropdown
              v-model="filters.outlet_id"
              :options="outlets"
              optionLabel="name"
              optionValue="id"
              placeholder="All Outlets"
              showClear
              class="w-full md:w-15rem"
              @change="applyFilters"
            />
            <Dropdown
              v-model="filters.payment_method"
              :options="paymentMethods"
              optionLabel="label"
              optionValue="value"
              placeholder="All Methods"
              showClear
              class="w-full md:w-15rem"
              @change="applyFilters"
            />
            <Dropdown
              v-model="filters.check_status"
              :options="checkStatuses"
              optionLabel="label"
              optionValue="value"
              placeholder="All Check Statuses"
              showClear
              class="w-full md:w-15rem"
              @change="applyFilters"
            />
            <Calendar
              v-model="filters.start_date"
              placeholder="Start Date"
              dateFormat="yy-mm-dd"
              showIcon
              @date-select="applyFilters"
            />
            <Calendar
              v-model="filters.end_date"
              placeholder="End Date"
              dateFormat="yy-mm-dd"
              showIcon
              @date-select="applyFilters"
            />
          </div>
        </div>

        <!-- DataTable -->
        <DataTable
          :value="payments"
          :loading="loading"
          :paginator="true"
          :rows="pagination.limit"
          :totalRecords="pagination.total"
          :lazy="true"
          @page="onPage"
          responsiveLayout="scroll"
        >
          <Column field="id" header="ID" :sortable="true" style="width: 80px" />
          <Column header="Outlet">
            <template #body="slotProps">
              {{ slotProps.data.invoice?.outlet?.name || 'N/A' }}
            </template>
          </Column>
          <Column field="payment_date" header="Payment Date" :sortable="true">
            <template #body="slotProps">
              {{ formatDate(slotProps.data.payment_date) }}
            </template>
          </Column>
          <Column field="amount" header="Amount" :sortable="true">
            <template #body="slotProps">
              {{ formatCurrency(slotProps.data.amount) }}
            </template>
          </Column>
          <Column field="payment_method" header="Method">
            <template #body="slotProps">
              <Tag
                :value="slotProps.data.payment_method"
                :severity="getMethodSeverity(slotProps.data.payment_method)"
              />
            </template>
          </Column>
          <Column header="Check Details" v-if="showCheckColumn">
            <template #body="slotProps">
              <div v-if="slotProps.data.payment_method === 'check'">
                <div>{{ slotProps.data.check_number }}</div>
                <div class="text-sm text-gray-500">{{ formatDate(slotProps.data.check_date) }}</div>
                <Tag
                  v-if="!slotProps.data.clearance_date"
                  value="Pending"
                  severity="warning"
                  class="mt-1"
                />
                <Tag v-else value="Cleared" severity="success" class="mt-1" />
              </div>
            </template>
          </Column>
          <Column header="Allocations">
            <template #body="slotProps">
              <span v-if="slotProps.data.allocations && slotProps.data.allocations.length > 0">
                {{ slotProps.data.allocations.length }} invoice(s)
              </span>
              <span v-else class="text-gray-400">Unallocated</span>
            </template>
          </Column>
          <Column header="Actions" style="width: 150px">
            <template #body="slotProps">
              <Button
                icon="pi pi-eye"
                class="p-button-sm p-button-text"
                @click="viewPayment(slotProps.data.id)"
              />
              <Button
                v-if="slotProps.data.payment_method === 'check' && !slotProps.data.clearance_date"
                icon="pi pi-check"
                class="p-button-sm p-button-text p-button-success"
                v-tooltip="'Mark Cleared'"
                @click="markCleared(slotProps.data)"
              />
              <Button
                icon="pi pi-trash"
                class="p-button-sm p-button-text p-button-danger"
                @click="confirmDelete(slotProps.data)"
              />
            </template>
          </Column>
        </DataTable>
      </template>
    </Card>

    <!-- Mark Cleared Dialog -->
    <Dialog
      v-model:visible="clearanceDialog"
      header="Mark Check as Cleared"
      :modal="true"
      style="width: 450px"
    >
      <div class="field">
        <label for="clearance_date">Clearance Date</label>
        <Calendar
          id="clearance_date"
          v-model="selectedPayment.clearance_date"
          dateFormat="yy-mm-dd"
          showIcon
          class="w-full"
        />
      </div>
      <template #footer>
        <Button
          label="Cancel"
          icon="pi pi-times"
          class="p-button-text"
          @click="clearanceDialog = false"
        />
        <Button label="Mark Cleared" icon="pi pi-check" @click="saveClearance" />
      </template>
    </Dialog>

    <!-- Delete Confirmation -->
    <Dialog
      v-model:visible="deleteDialog"
      header="Confirm Delete"
      :modal="true"
      style="width: 450px"
    >
      <div class="confirmation-content">
        <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem" />
        <span>Are you sure you want to delete this payment?</span>
      </div>
      <template #footer>
        <Button label="No" icon="pi pi-times" class="p-button-text" @click="deleteDialog = false" />
        <Button
          label="Yes"
          icon="pi pi-check"
          class="p-button-danger"
          @click="deletePaymentConfirm"
        />
      </template>
    </Dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { usePaymentStore } from '@/stores/payment';
import { useOutletStore } from '@/stores/outlet';
import { useToast } from 'primevue/usetoast';
import { formatDate, formatCurrency } from '@/utils/formatters';

const router = useRouter();
const paymentStore = usePaymentStore();
const outletStore = useOutletStore();
const toast = useToast();

const payments = computed(() => paymentStore.payments);
const loading = computed(() => paymentStore.loading);
const pagination = computed(() => paymentStore.pagination);
const outlets = computed(() => outletStore.outlets);

const filters = ref({
  outlet_id: null,
  payment_method: null,
  check_status: null,
  start_date: null,
  end_date: null,
});

const paymentMethods = [
  { label: 'Cash', value: 'cash' },
  { label: 'Bank Transfer', value: 'bank_transfer' },
  { label: 'Check', value: 'check' },
];

const checkStatuses = [
  { label: 'Pending', value: 'pending' },
  { label: 'Cleared', value: 'cleared' },
  { label: 'Overdue', value: 'overdue' },
];

const clearanceDialog = ref(false);
const deleteDialog = ref(false);
const selectedPayment = ref({});

const showCheckColumn = computed(() => {
  return filters.value.payment_method === 'check' || filters.value.check_status;
});

onMounted(async () => {
  await Promise.all([paymentStore.fetchPayments(), outletStore.fetchOutlets()]);
});

const applyFilters = () => {
  const filterParams = {};
  if (filters.value.outlet_id) filterParams.outlet_id = filters.value.outlet_id;
  if (filters.value.payment_method) filterParams.payment_method = filters.value.payment_method;
  if (filters.value.check_status) filterParams.check_status = filters.value.check_status;
  if (filters.value.start_date)
    filterParams.start_date = formatDate(filters.value.start_date, 'yyyy-MM-dd');
  if (filters.value.end_date)
    filterParams.end_date = formatDate(filters.value.end_date, 'yyyy-MM-dd');

  paymentStore.fetchPayments(filterParams);
};

const onPage = event => {
  paymentStore.pagination.page = event.page + 1;
  applyFilters();
};

const viewPayment = id => {
  router.push(`/payments/${id}`);
};

const markCleared = payment => {
  selectedPayment.value = { ...payment, clearance_date: new Date() };
  clearanceDialog.value = true;
};

const saveClearance = async () => {
  try {
    await paymentStore.updatePayment(selectedPayment.value.id, {
      clearance_date: formatDate(selectedPayment.value.clearance_date, 'yyyy-MM-dd'),
    });
    toast.add({
      severity: 'success',
      summary: 'Success',
      detail: 'Check marked as cleared',
      life: 3000,
    });
    clearanceDialog.value = false;
  } catch (error) {
    toast.add({ severity: 'error', summary: 'Error', detail: error.message, life: 3000 });
  }
};

const confirmDelete = payment => {
  selectedPayment.value = payment;
  deleteDialog.value = true;
};

const deletePaymentConfirm = async () => {
  try {
    await paymentStore.deletePayment(selectedPayment.value.id);
    toast.add({ severity: 'success', summary: 'Success', detail: 'Payment deleted', life: 3000 });
    deleteDialog.value = false;
  } catch (error) {
    toast.add({ severity: 'error', summary: 'Error', detail: error.message, life: 3000 });
  }
};

const getMethodSeverity = method => {
  const severities = {
    cash: 'success',
    bank_transfer: 'info',
    check: 'warning',
  };
  return severities[method] || 'secondary';
};
</script>

<style scoped>
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.filter-section {
  margin-bottom: 1.5rem;
}

.confirmation-content {
  display: flex;
  align-items: center;
}
</style>
```

---

### Implementation Checklist

#### Backend (Week 8 - Phase 1)

- [ ] Create PaymentAllocation model
- [ ] Update model associations
- [ ] Create payment allocations migration
- [ ] Run migration to create table
- [ ] Create Payment controller with all methods
- [ ] Add supplier payment methods to supplier controller
- [ ] Create payment routes
- [ ] Update supplier routes
- [ ] Update outlet routes
- [ ] Register payment routes in app.js
- [ ] Test all endpoints with Postman

#### Frontend (Week 8 - Phase 2)

- [ ] Create payment service
- [ ] Create supplier payment service
- [ ] Create payment store
- [ ] Create PaymentIndex view
- [ ] Create PaymentCreate view
- [ ] Create PaymentDetails view
- [ ] Create PendingChecks view
- [ ] Create SupplierPaymentForm component
- [ ] Add payment routes to router
- [ ] Test payment recording workflow
- [ ] Test check tracking
- [ ] Test payment allocation

---

## 📊 Testing Plan

Refer to `WEEK8_TESTING.md` (to be created) for detailed testing procedures.

---

## 📈 Progress Tracking

- **Start Date:** December 20, 2025
- **Target Completion:** December 21, 2025
- **Effort Estimate:** 18 hours
- **Current Status:** 🔄 In Progress (0% complete)

---

## 🎯 Success Criteria

- [ ] Payment recording works for outlets
- [ ] Outlet balance reduces correctly
- [ ] Payment allocation to invoices functional
- [ ] Invoice payment status updates correctly
- [ ] Check payment tracking working
- [ ] Clearance date functionality works
- [ ] Pending checks report displays correctly
- [ ] Supplier payment recording works
- [ ] Supplier balance updates correctly
- [ ] All API endpoints tested and working
- [ ] Frontend UI complete and functional
- [ ] Error handling implemented
- [ ] Validation working properly

---

**End of Week 8 Implementation Plan**
