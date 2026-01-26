# Phase 2: Fraud Prevention - Implementation Plan

## Overview

Phase 2 adds fraud prevention features to the sales system:

1. **Return Validation**: Time-based policies and quantity validation
2. **Check Bounce Handling**: Three-state check lifecycle with reversal logic

## Current State Analysis

### Return System (Current)

✅ **Already Implemented:**

- InvoiceItem.is_return (BOOLEAN) - Identifies return items
- InvoiceItem.return_reason (ENUM) - 'damaged', 'expired', 'excess', 'quality_issue', 'other'
- InvoiceItem.return_to_stock (BOOLEAN) - Whether to restore stock
- Negative quantity and amounts for returns
- Stock adjustment logic (adds back if return_to_stock=true)

❌ **Missing (Fraud Prevention):**

- Time limit validation (no checks on when returns allowed)
- Purchase history validation (can return without original purchase)
- Quantity validation (can return more than purchased)
- Original invoice reference tracking
- Admin override for out-of-policy returns
- Return policy configuration

### Check Payment System (Current)

✅ **Already Implemented:**

- SalesInvoice: check_number, check_date, clearance_date fields
- Payment model: check_number, check_date, clearance_date
- Payment method='check' supported

❌ **Missing (Bounce Handling):**

- Payment status beyond 'paid'/'unpaid'/'partial' (no 'pending'/'cleared'/'bounced')
- Bounce date, bounce fee, bounce reason tracking
- Reversal logic for bounced checks
- Outlet balance restoration on bounce
- Check state transitions (pending→cleared/bounced)

---

## Part 1: Return Validation (5 hours)

### 1.1 Model Updates (30 min)

#### InvoiceItem Model - Add Fields

```javascript
original_invoice_id: {
  type: DataTypes.INTEGER,
  allowNull: true,
  references: { model: 'sales_invoices', key: 'id' },
  comment: 'Reference to original purchase invoice for returns',
},
original_invoice_item_id: {
  type: DataTypes.INTEGER,
  allowNull: true,
  references: { model: 'invoice_items', key: 'id' },
  comment: 'Reference to original item being returned',
},
return_policy_override: {
  type: DataTypes.BOOLEAN,
  defaultValue: false,
  comment: 'Admin override for out-of-policy returns',
},
return_policy_override_reason: {
  type: DataTypes.TEXT,
  allowNull: true,
  comment: 'Reason for admin override',
},
return_policy_override_by: {
  type: DataTypes.INTEGER,
  allowNull: true,
  references: { model: 'users', key: 'id' },
  comment: 'Admin who approved the override',
},
```

#### Configuration (in-code constants for now)

```javascript
const RETURN_POLICY = {
  damaged: { days: 7, description: 'Damaged goods - 7 days' },
  expired: { days: 30, description: 'Expired products - 30 days' },
  excess: { days: 3, description: 'Excess quantity - 3 days' },
  quality_issue: { days: 7, description: 'Quality issues - 7 days' },
  other: { days: 3, description: 'Other reasons - 3 days' },
};
```

### 1.2 Backend Validation (2 hours)

#### salesController.createInvoice - Return Validation Block

Add validation before processing return items (around line 235):

```javascript
// PHASE 2: Return Validation
for (const item of items) {
  if (item.is_return) {
    // 1. Require original invoice reference
    if (!item.original_invoice_id) {
      await transaction.rollback();
      return errorResponse(res, 'Returns must reference an original purchase invoice', 400);
    }

    // 2. Fetch original invoice
    const originalInvoice = await SalesInvoice.findByPk(item.original_invoice_id, {
      include: [
        {
          model: InvoiceItem,
          as: 'items',
          where: { sku_id: item.sku_id, is_return: false },
        },
      ],
    });

    if (!originalInvoice) {
      await transaction.rollback();
      return errorResponse(res, 'Original purchase invoice not found', 404);
    }

    // 3. Time limit validation
    const returnReason = item.return_reason || 'other';
    const policy = RETURN_POLICY[returnReason];
    const daysSincePurchase = Math.floor(
      (new Date(invoice_date) - new Date(originalInvoice.invoice_date)) / (1000 * 60 * 60 * 24)
    );

    if (daysSincePurchase > policy.days) {
      // Check admin override
      if (req.user.role !== 'admin' || !item.return_policy_override) {
        await transaction.rollback();
        return errorResponse(
          res,
          `Return exceeds policy: ${policy.description} (${daysSincePurchase} days since purchase, limit ${policy.days} days)`,
          400
        );
      }

      // Admin override - require reason
      if (!item.return_policy_override_reason || item.return_policy_override_reason.trim() === '') {
        await transaction.rollback();
        return errorResponse(res, 'Admin override for out-of-policy return requires a reason', 400);
      }
    }

    // 4. Quantity validation
    const originalItem = originalInvoice.items.find(i => i.sku_id === item.sku_id);
    if (!originalItem) {
      await transaction.rollback();
      return errorResponse(
        res,
        `SKU ${item.sku_id} was not purchased in the original invoice`,
        404
      );
    }

    // Calculate total already returned for this original item
    const existingReturns = await InvoiceItem.findAll({
      where: {
        original_invoice_item_id: originalItem.id,
        is_return: true,
      },
    });

    const totalReturned = existingReturns.reduce((sum, ret) => sum + Math.abs(ret.quantity), 0);

    const originalQuantity = Math.abs(originalItem.quantity);
    const attemptedReturn = Math.abs(item.quantity);

    if (totalReturned + attemptedReturn > originalQuantity) {
      await transaction.rollback();
      return errorResponse(
        res,
        `Return quantity exceeds original purchase. Original: ${originalQuantity}, Already returned: ${totalReturned}, Attempted: ${attemptedReturn}`,
        400
      );
    }
  }
}
```

#### Update processedItems to include new fields:

```javascript
processedItems.push({
  // ... existing fields
  is_return: item.is_return || false,
  return_reason: item.return_reason || null,
  return_to_stock: item.return_to_stock || false,
  // PHASE 2: Return validation fields
  original_invoice_id: item.original_invoice_id || null,
  original_invoice_item_id: item.original_invoice_item_id || null,
  return_policy_override: item.return_policy_override || false,
  return_policy_override_reason: item.return_policy_override_reason || null,
  return_policy_override_by:
    item.return_policy_override && req.user.role === 'admin' ? req.user.id : null,
});
```

### 1.3 Frontend Updates (1.5 hours)

#### InvoiceForm.vue - Return Item Handling

Add to item editing dialog:

1. **Original Invoice Lookup** (when is_return is checked)

```javascript
const originalInvoice = ref(null);
const showOriginalInvoiceLookup = computed(() => currentItem.value?.is_return);

async function lookupOriginalInvoice(outlet_id, sku_id) {
  // API call to get purchase history for outlet+SKU
  const response = await salesService.getPurchaseHistory(outlet_id, sku_id);
  return response.data;
}
```

2. **Return Policy Warning**

```javascript
const returnPolicyWarning = computed(() => {
  if (!currentItem.value?.is_return || !originalInvoice.value) return null;

  const policies = {
    damaged: 7,
    expired: 30,
    excess: 3,
    quality_issue: 7,
    other: 3,
  };

  const daysSince = Math.floor(
    (new Date() - new Date(originalInvoice.value.invoice_date)) / (1000 * 60 * 60 * 24)
  );

  const limit = policies[currentItem.value.return_reason] || 3;

  if (daysSince > limit) {
    return {
      severity: 'error',
      message: `Return policy exceeded: ${limit} days limit for ${currentItem.value.return_reason}, purchase was ${daysSince} days ago`,
      requiresOverride: true,
    };
  }

  return null;
});
```

3. **Admin Override Dialog** (similar to credit limit)

#### New API Endpoint for Purchase History

```javascript
// In salesController.js
exports.getPurchaseHistory = async (req, res) => {
  try {
    const { outlet_id, sku_id } = req.query;

    const purchases = await SalesInvoice.findAll({
      where: { outlet_id, payment_status: 'paid' },
      include: [
        {
          model: InvoiceItem,
          as: 'items',
          where: { sku_id, is_return: false },
        },
      ],
      order: [['invoice_date', 'DESC']],
      limit: 10,
    });

    return successResponse(res, purchases);
  } catch (error) {
    return errorResponse(res, 'Failed to fetch purchase history', 500);
  }
};
```

### 1.4 Testing (1 hour)

- Test normal return within policy
- Test return exceeding time limit (should fail)
- Test admin override for out-of-policy return
- Test quantity validation (can't return more than purchased)
- Test return without original invoice (should fail)

---

## Part 2: Check Bounce Handling (7 hours)

### 2.1 Model Updates (1 hour)

#### Payment Model - Add Fields

```javascript
payment_status: {
  type: DataTypes.ENUM('pending', 'cleared', 'bounced'),
  defaultValue: 'pending',
  comment: 'Check payment status lifecycle',
},
bounce_date: {
  type: DataTypes.DATEONLY,
  allowNull: true,
  comment: 'Date when check bounced',
},
bounce_fee: {
  type: DataTypes.DECIMAL(10, 2),
  defaultValue: 0,
  comment: 'Fee charged for bounced check',
},
bounce_reason: {
  type: DataTypes.TEXT,
  allowNull: true,
  comment: 'Reason for check bounce',
},
reversed_by: {
  type: DataTypes.INTEGER,
  allowNull: true,
  references: { model: 'users', key: 'id' },
  comment: 'User who processed the bounce reversal',
},
```

#### SalesInvoice - Update check fields

```javascript
check_status: {
  type: DataTypes.ENUM('pending', 'cleared', 'bounced'),
  allowNull: true,
  comment: 'Status of check payment',
},
```

### 2.2 Backend Implementation (3 hours)

#### New Endpoint: Bounce Check Payment

```javascript
// paymentController.js
exports.bounceCheck = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const { payment_id } = req.params;
    const { bounce_reason, bounce_fee = 0 } = req.body;

    // Authorization check
    if (req.user.role !== 'admin') {
      return errorResponse(res, 'Only admins can process check bounces', 403);
    }

    // 1. Fetch payment
    const payment = await Payment.findByPk(payment_id, {
      include: [
        {
          model: PaymentAllocation,
          as: 'allocations',
          include: [{ model: SalesInvoice, as: 'invoice' }],
        },
      ],
    });

    if (!payment) {
      await transaction.rollback();
      return errorResponse(res, 'Payment not found', 404);
    }

    if (payment.payment_method !== 'check') {
      await transaction.rollback();
      return errorResponse(res, 'Only check payments can be bounced', 400);
    }

    if (payment.payment_status === 'bounced') {
      await transaction.rollback();
      return errorResponse(res, 'Payment already bounced', 400);
    }

    // 2. Reverse all payment allocations
    for (const allocation of payment.allocations) {
      const invoice = allocation.invoice;

      // Restore outlet balance (reverse the payment)
      const outlet = await Outlet.findByPk(invoice.outlet_id);
      outlet.balance += parseFloat(allocation.allocated_amount);
      await outlet.save({ transaction });

      // Update invoice payment status
      const paidAmount =
        (await PaymentAllocation.sum('allocated_amount', {
          where: { invoice_id: invoice.id },
          transaction,
        })) || 0;

      const paidAfterBounce = paidAmount - parseFloat(allocation.allocated_amount);

      if (paidAfterBounce <= 0) {
        invoice.payment_status = 'unpaid';
      } else if (paidAfterBounce < invoice.total_amount) {
        invoice.payment_status = 'partial';
      } else {
        invoice.payment_status = 'paid';
      }

      await invoice.save({ transaction });

      // Delete the allocation
      await allocation.destroy({ transaction });
    }

    // 3. Update payment status
    payment.payment_status = 'bounced';
    payment.bounce_date = new Date();
    payment.bounce_reason = bounce_reason;
    payment.bounce_fee = bounce_fee;
    payment.reversed_by = req.user.id;
    await payment.save({ transaction });

    // 4. If bounce fee, create a debit entry (increase outlet balance)
    if (bounce_fee > 0) {
      const outlet = await Outlet.findByPk(payment.outlet_id);
      outlet.balance += parseFloat(bounce_fee);
      await outlet.save({ transaction });
    }

    await transaction.commit();

    return successResponse(res, {
      message: 'Check bounced successfully',
      payment,
      reversedAllocations: payment.allocations.length,
      bounceFee: bounce_fee,
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Error bouncing check:', error);
    return errorResponse(res, 'Failed to bounce check', 500);
  }
};
```

#### Update createInvoice for check payments

```javascript
// When payment_method === 'check'
if (payment_method === 'check') {
  // Set check status to 'pending' initially
  invoice.check_status = 'pending';
  payment_status = 'unpaid'; // Check not cleared yet
}
```

#### New Endpoint: Clear Check

```javascript
exports.clearCheck = async (req, res) => {
  try {
    const { payment_id } = req.params;
    const { clearance_date } = req.body;

    const payment = await Payment.findByPk(payment_id);

    if (!payment) {
      return errorResponse(res, 'Payment not found', 404);
    }

    if (payment.payment_method !== 'check') {
      return errorResponse(res, 'Only check payments can be cleared', 400);
    }

    if (payment.payment_status === 'bounced') {
      return errorResponse(res, 'Bounced checks cannot be cleared', 400);
    }

    payment.payment_status = 'cleared';
    payment.clearance_date = clearance_date || new Date();
    await payment.save();

    return successResponse(res, payment);
  } catch (error) {
    console.error('Error clearing check:', error);
    return errorResponse(res, 'Failed to clear check', 500);
  }
};
```

### 2.3 Routes (30 min)

```javascript
// routes/paymentRoutes.js
router.post('/:payment_id/bounce', roleCheck(['admin']), paymentController.bounceCheck);
router.post('/:payment_id/clear', roleCheck(['admin', 'cashier']), paymentController.clearCheck);
```

### 2.4 Frontend Implementation (2 hours)

#### New View: PendingChecks.vue

- List all payments with payment_method='check' and payment_status='pending'
- Show check_number, check_date, amount, outlet
- Actions: Clear Check, Bounce Check
- Filter by outlet, date range

#### Bounce Check Dialog

```vue
<Dialog v-model:visible="showBounceDialog" header="Bounce Check" :modal="true">
  <div class="field">
    <label>Check Number: {{ selectedPayment?.check_number }}</label>
  </div>
  <div class="field">
    <label>Amount: Rs. {{ selectedPayment?.amount }}</label>
  </div>
  <div class="field">
    <label for="bounce_reason">Bounce Reason *</label>
    <Textarea id="bounce_reason" v-model="bounceReason" rows="3" required />
  </div>
  <div class="field">
    <label for="bounce_fee">Bounce Fee (Rs.)</label>
    <InputNumber id="bounce_fee" v-model="bounceFee" mode="currency" currency="LKR" />
  </div>
  <template #footer>
    <Button label="Cancel" severity="secondary" @click="showBounceDialog = false" />
    <Button label="Bounce Check" severity="danger" @click="confirmBounce" />
  </template>
</Dialog>
```

### 2.5 Testing (30 min)

- Create invoice with check payment (status=pending)
- Clear check (status=cleared)
- Create another check invoice
- Bounce check (verify allocations reversed, balance restored)
- Test bounce fee application
- Verify bounced check cannot be cleared

---

## Migration Scripts

### Migration: Add Return Validation Fields

```javascript
// migrations/YYYYMMDDHHMMSS-add-return-validation-fields.js
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('invoice_items', 'original_invoice_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: { model: 'sales_invoices', key: 'id' },
    });

    await queryInterface.addColumn('invoice_items', 'original_invoice_item_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: { model: 'invoice_items', key: 'id' },
    });

    await queryInterface.addColumn('invoice_items', 'return_policy_override', {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
    });

    await queryInterface.addColumn('invoice_items', 'return_policy_override_reason', {
      type: Sequelize.TEXT,
      allowNull: true,
    });

    await queryInterface.addColumn('invoice_items', 'return_policy_override_by', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: { model: 'users', key: 'id' },
    });
  },

  down: async queryInterface => {
    await queryInterface.removeColumn('invoice_items', 'original_invoice_id');
    await queryInterface.removeColumn('invoice_items', 'original_invoice_item_id');
    await queryInterface.removeColumn('invoice_items', 'return_policy_override');
    await queryInterface.removeColumn('invoice_items', 'return_policy_override_reason');
    await queryInterface.removeColumn('invoice_items', 'return_policy_override_by');
  },
};
```

### Migration: Add Check Bounce Fields

```javascript
// migrations/YYYYMMDDHHMMSS-add-check-bounce-fields.js
module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Update Payment status enum
    await queryInterface.changeColumn('payments', 'payment_status', {
      type: Sequelize.ENUM('pending', 'cleared', 'bounced'),
      defaultValue: 'pending',
    });

    await queryInterface.addColumn('payments', 'bounce_date', {
      type: Sequelize.DATEONLY,
      allowNull: true,
    });

    await queryInterface.addColumn('payments', 'bounce_fee', {
      type: Sequelize.DECIMAL(10, 2),
      defaultValue: 0,
    });

    await queryInterface.addColumn('payments', 'bounce_reason', {
      type: Sequelize.TEXT,
      allowNull: true,
    });

    await queryInterface.addColumn('payments', 'reversed_by', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: { model: 'users', key: 'id' },
    });

    await queryInterface.addColumn('sales_invoices', 'check_status', {
      type: Sequelize.ENUM('pending', 'cleared', 'bounced'),
      allowNull: true,
    });
  },

  down: async queryInterface => {
    await queryInterface.removeColumn('payments', 'bounce_date');
    await queryInterface.removeColumn('payments', 'bounce_fee');
    await queryInterface.removeColumn('payments', 'bounce_reason');
    await queryInterface.removeColumn('payments', 'reversed_by');
    await queryInterface.removeColumn('sales_invoices', 'check_status');
  },
};
```

---

## Testing Checklist

### Return Validation Tests

- [ ] Create return with original invoice reference (within policy)
- [ ] Attempt return without original invoice (should fail)
- [ ] Attempt return exceeding time limit (should fail for non-admin)
- [ ] Admin override for out-of-policy return (requires reason)
- [ ] Attempt to return more quantity than purchased (should fail)
- [ ] Multiple partial returns (total can't exceed original)
- [ ] Return for SKU not in original invoice (should fail)

### Check Bounce Tests

- [ ] Create check payment (status=pending)
- [ ] Clear check successfully
- [ ] Create another check, bounce it (verify reversal)
- [ ] Verify outlet balance restored after bounce
- [ ] Apply bounce fee
- [ ] Attempt to clear already-bounced check (should fail)
- [ ] Verify invoice payment status updated after bounce

---

## Summary

**Total Estimated Time: 12 hours**

**Phase 2.1 - Return Validation (5h):**

- Model updates: 30 min
- Backend validation: 2h
- Frontend UI: 1.5h
- Testing: 1h

**Phase 2.2 - Check Bounce Handling (7h):**

- Model updates: 1h
- Backend endpoints: 3h
- Routes: 30 min
- Frontend views: 2h
- Testing: 30 min

**Deliverables:**

1. ✅ Return time limit enforcement
2. ✅ Purchase history validation
3. ✅ Quantity validation
4. ✅ Admin override for returns
5. ✅ Three-state check lifecycle
6. ✅ Check bounce reversal logic
7. ✅ Bounce fee support
8. ✅ Frontend UI for checks management
9. ✅ Migration scripts
10. ✅ Comprehensive tests
