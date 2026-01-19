# Product-Recipe-Production Workflow Improvements

## Implementation Recommendations & Action Plan

**Date:** January 20, 2026  
**Status:** Ready for Implementation  
**Priority:** High

---

## 📊 Executive Summary

Based on your requirements, here are the **5 priority improvements** to implement:

| Priority  | Improvement                         | Impact | Complexity | Time Estimate |
| --------- | ----------------------------------- | ------ | ---------- | ------------- |
| 🔴 **P1** | Fix Recipe→SKU Relationship         | High   | Medium     | 2-3 days      |
| 🔴 **P2** | Add Finished Goods Batch Tracking   | High   | Medium     | 2 days        |
| 🟡 **P3** | Add Actual Cost & Profit Tracking   | High   | Low        | 1.5 days      |
| 🟡 **P4** | Auto Batch Number Generation        | Medium | Low        | 0.5 day       |
| 🟢 **P5** | Add Yield Variance & Waste Tracking | Medium | Low        | 1 day         |

**Total Estimated Time:** 7-8 days

**Future Enhancements (P6+):**

- **P6:** Sales-to-Batch Linking & Batch-Specific Profit (when needed high accuracy)
- **P7:** Multi-SKU Production Output (when splitting batches into multiple sizes)
- **P8:** Non-Material Cost Tracking (labor, overhead, packaging)
- **P9:** Recipe Versioning Archive System (when storage becomes issue)
- **P10:** Production Planning UI improvements
- **P11:** Advanced Profit Analytics & Trends Dashboard

---

## 🎯 Priority 1: Fix Recipe→SKU Relationship

### Current Problem:

- Frontend shows `product_id` and `product_sku_id` fields
- Backend Recipe model doesn't have these columns
- No enforcement of which SKU a recipe produces
- Production can output any random SKU

### Solution:

Make recipes **explicitly tied to a Product SKU** they produce.

### Database Migration:

```javascript
// migrations/20260120000001-add-recipe-sku-relationship.js

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('recipes', 'product_id', {
      type: Sequelize.INTEGER,
      allowNull: true, // Nullable for existing recipes
      references: {
        model: 'products',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });

    await queryInterface.addColumn('recipes', 'product_sku_id', {
      type: Sequelize.INTEGER,
      allowNull: true, // Nullable for existing recipes
      references: {
        model: 'product_skus',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });

    // Add index for performance
    await queryInterface.addIndex('recipes', ['product_sku_id']);
    await queryInterface.addIndex('recipes', ['product_id']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('recipes', 'product_sku_id');
    await queryInterface.removeColumn('recipes', 'product_id');
  },
};
```

### Model Update:

```javascript
// models/Recipe.js

module.exports = (sequelize, DataTypes) => {
  const Recipe = sequelize.define(
    'Recipe',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      code: {
        type: DataTypes.STRING(20),
        allowNull: false,
      },
      name: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      // ADD THESE FIELDS
      product_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'products',
          key: 'id',
        },
      },
      product_sku_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'product_skus',
          key: 'id',
        },
      },
      version: {
        type: DataTypes.INTEGER,
        defaultValue: 1,
      },
      expected_yield: {
        type: DataTypes.DECIMAL(10, 2),
      },
      yield_unit: {
        type: DataTypes.STRING(20),
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      notes: {
        type: DataTypes.TEXT,
      },
    },
    {
      tableName: 'recipes',
      timestamps: true,
      updatedAt: 'updated_at',
      createdAt: 'created_at',
      indexes: [
        { fields: ['code'] },
        { fields: ['is_active'] },
        { fields: ['code', 'version'], unique: true },
        { fields: ['product_id'] }, // NEW
        { fields: ['product_sku_id'] }, // NEW
      ],
    }
  );

  return Recipe;
};
```

### Association Update:

```javascript
// models/index.js

// Add to existing associations:

// Recipe associations (ADD THESE)
db.Recipe.belongsTo(db.Product, { foreignKey: 'product_id', as: 'product' });
db.Recipe.belongsTo(db.ProductSku, { foreignKey: 'product_sku_id', as: 'productSku' });

// Product associations (ADD THIS)
db.Product.hasMany(db.Recipe, { foreignKey: 'product_id', as: 'recipes' });

// ProductSku associations (ADD THIS)
db.ProductSku.hasMany(db.Recipe, { foreignKey: 'product_sku_id', as: 'recipes' });
```

### Controller Validation:

```javascript
// controllers/recipeController.js

exports.createRecipe = async (req, res) => {
  const transaction = await db.sequelize.transaction();

  try {
    const {
      code,
      name,
      expected_yield,
      yield_unit,
      notes = '',
      items = [],
      product_id, // NEW
      product_sku_id, // NEW
    } = req.body;

    // Validation
    if (!code) {
      await transaction.rollback();
      return errorResponse(res, 'Recipe code is required', 400);
    }

    if (!name) {
      await transaction.rollback();
      return errorResponse(res, 'Recipe name is required', 400);
    }

    // NEW: Validate product and SKU
    if (!product_id) {
      await transaction.rollback();
      return errorResponse(res, 'Product is required', 400);
    }

    if (!product_sku_id) {
      await transaction.rollback();
      return errorResponse(res, 'Product SKU is required', 400);
    }

    // NEW: Verify product exists
    const product = await Product.findByPk(product_id);
    if (!product) {
      await transaction.rollback();
      return errorResponse(res, 'Product not found', 404);
    }

    // NEW: Verify SKU exists and belongs to product
    const sku = await ProductSku.findOne({
      where: { id: product_sku_id, product_id: product_id },
    });
    if (!sku) {
      await transaction.rollback();
      return errorResponse(
        res,
        'Product SKU not found or does not belong to selected product',
        404
      );
    }

    if (!expected_yield || expected_yield <= 0) {
      await transaction.rollback();
      return errorResponse(res, 'Valid expected yield is required', 400);
    }

    if (!yield_unit) {
      await transaction.rollback();
      return errorResponse(res, 'Yield unit is required', 400);
    }

    // Check if recipe code already exists
    const existingRecipe = await Recipe.findOne({
      where: { code },
    });

    if (existingRecipe) {
      await transaction.rollback();
      return errorResponse(res, 'Recipe code already exists', 400);
    }

    // Create recipe with version 1
    const recipe = await Recipe.create(
      {
        code,
        name,
        product_id, // NEW
        product_sku_id, // NEW
        version: 1,
        expected_yield,
        yield_unit,
        is_active: true,
        notes,
      },
      { transaction }
    );

    // ... rest of the code (create recipe items, etc.)

    await transaction.commit();

    // Fetch created recipe with items AND product info
    const createdRecipe = await Recipe.findByPk(recipe.id, {
      include: [
        {
          model: RecipeItem,
          as: 'items',
          include: [
            {
              model: RawMaterial,
              as: 'material',
              attributes: ['id', 'code', 'name', 'unit'],
            },
          ],
        },
        // NEW: Include product and SKU
        {
          model: Product,
          as: 'product',
          attributes: ['id', 'code', 'name'],
        },
        {
          model: ProductSku,
          as: 'productSku',
          attributes: ['id', 'size', 'unit', 'price'],
        },
      ],
    });

    return successResponse(res, createdRecipe, 201);
  } catch (error) {
    await transaction.rollback();
    console.error('Error creating recipe:', error);
    return errorResponse(res, 'Failed to create recipe', 500);
  }
};
```

### Production Validation:

```javascript
// controllers/productionController.js

exports.completeProductionRun = async (req, res) => {
  const transaction = await db.sequelize.transaction();

  try {
    const { id } = req.params;
    const { quantity_produced, waste_quantity = 0, waste_reason = '', outputs = [] } = req.body;

    // ... existing validations ...

    const productionRun = await ProductionRun.findByPk(id, {
      include: [
        {
          model: Recipe,
          as: 'recipe',
          include: [
            {
              model: RecipeItem,
              as: 'items',
              include: [{ model: RawMaterial, as: 'material' }],
            },
            // NEW: Include recipe's target SKU
            {
              model: ProductSku,
              as: 'productSku',
              attributes: ['id', 'product_id', 'size', 'unit'],
            },
          ],
        },
      ],
    });

    if (!productionRun) {
      await transaction.rollback();
      return errorResponse(res, 'Production run not found', 404);
    }

    // NEW: Validate output SKU matches recipe
    if (outputs && outputs.length > 0) {
      for (const output of outputs) {
        if (
          productionRun.recipe.product_sku_id &&
          output.sku_id !== productionRun.recipe.product_sku_id
        ) {
          await transaction.rollback();
          return errorResponse(
            res,
            `Output SKU (${output.sku_id}) does not match recipe's target SKU (${productionRun.recipe.product_sku_id})`,
            400
          );
        }
      }
    }

    // ... rest of FIFO logic ...

    await transaction.commit();
    return successResponse(res, completedRun);
  } catch (error) {
    await transaction.rollback();
    console.error('Error completing production run:', error);
    return errorResponse(res, 'Failed to complete production run', 500);
  }
};
```

### Benefits:

✅ Clear relationship: Recipe → produces specific SKU  
✅ Prevents accidental wrong SKU production  
✅ Better inventory forecasting  
✅ Easier to find which recipes produce which products  
✅ Foundation for future enhancements (multi-SKU can use this as default/primary SKU)

---

## 🎯 Priority 2: Add Finished Goods Batch Tracking

### Current Problem:

- Production creates finished goods but no batch number on the finished goods
- Can't trace which production run a sold item came from (customer → production)
- Missing critical traceability link

### Solution:

Add batch tracking to finished goods in `production_output` table.

### Database Migration:

```javascript
// migrations/20260120000002-add-finished-goods-batch.js

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Add batch_number to production_output
    await queryInterface.addColumn('production_output', 'batch_number', {
      type: Sequelize.STRING(50),
      allowNull: true, // Nullable for existing records
      comment: 'Batch number for finished goods traceability',
    });

    // Add production_date for easier batch identification
    await queryInterface.addColumn('production_output', 'production_date', {
      type: Sequelize.DATEONLY,
      allowNull: true,
      comment: 'Production date from parent production run',
    });

    // Add unit_cost for cost tracking
    await queryInterface.addColumn('production_output', 'unit_cost', {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: true,
      defaultValue: 0,
      comment: 'Actual cost per unit for this batch',
    });

    // Add total_cost for easy reporting
    await queryInterface.addColumn('production_output', 'total_cost', {
      type: Sequelize.DECIMAL(15, 2),
      allowNull: true,
      defaultValue: 0,
      comment: 'Total cost for this batch (sum of material costs)',
    });

    // Add waste_cost for separate waste tracking
    await queryInterface.addColumn('production_output', 'waste_cost', {
      type: Sequelize.DECIMAL(15, 2),
      allowNull: true,
      defaultValue: 0,
      comment: 'Cost of wasted materials (separate from finished goods cost)',
    });

    // Add index for batch lookup
    await queryInterface.addIndex('production_output', ['batch_number']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('production_output', 'batch_number');
    await queryInterface.removeColumn('production_output', 'production_date');
    await queryInterface.removeColumn('production_output', 'unit_cost');
    await queryInterface.removeColumn('production_output', 'total_cost');
    await queryInterface.removeColumn('production_output', 'waste_cost');
  },
};
```

### Model Update:

```javascript
// models/ProductionOutput.js

module.exports = (sequelize, DataTypes) => {
  const ProductionOutput = sequelize.define(
    'ProductionOutput',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      production_run_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'production_runs',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      sku_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'product_skus',
          key: 'id',
        },
      },
      quantity_produced: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      // NEW FIELDS
      batch_number: {
        type: DataTypes.STRING(50),
        allowNull: true,
        comment: 'Finished goods batch number for traceability',
      },
      production_date: {
        type: DataTypes.DATEONLY,
        allowNull: true,
        comment: 'Production date from parent run',
      },
      unit_cost: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        defaultValue: 0,
        comment: 'Actual cost per unit',
      },
      total_cost: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: true,
        defaultValue: 0,
        comment: 'Total material cost for this batch',
      },
      waste_cost: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: true,
        defaultValue: 0,
        comment: 'Cost of wasted materials (separate allocation)',
      },
    },
    {
      tableName: 'production_output',
      timestamps: false,
      indexes: [
        { fields: ['production_run_id'] },
        { fields: ['batch_number'] }, // NEW
      ],
    }
  );

  return ProductionOutput;
};
```

### Controller Implementation:

```javascript
// controllers/productionController.js

// Helper function to generate finished goods batch number
const generateFinishedGoodsBatchNumber = async (skuId, productionDate) => {
  // Get SKU code
  const sku = await ProductSku.findByPk(skuId, {
    include: [{ model: Product, as: 'product', attributes: ['code'] }],
  });

  if (!sku) {
    throw new Error('SKU not found');
  }

  const productCode = sku.product.code; // e.g., PROD001
  const dateStr = productionDate.toISOString().slice(0, 10).replace(/-/g, ''); // YYYYMMDD

  // Find last batch number for this SKU on this date
  const lastOutput = await ProductionOutput.findOne({
    where: {
      sku_id: skuId,
      production_date: productionDate,
      batch_number: {
        [Op.like]: `FG-${productCode}-%`,
      },
    },
    order: [['batch_number', 'DESC']],
  });

  let sequence = 1;
  if (lastOutput && lastOutput.batch_number) {
    // Extract sequence from batch number like FG-PROD001-20260120-003
    const parts = lastOutput.batch_number.split('-');
    if (parts.length === 4) {
      sequence = parseInt(parts[3]) + 1;
    }
  }

  // Format: FG-PROD001-20260120-001
  return `FG-${productCode}-${dateStr}-${String(sequence).padStart(3, '0')}`;
};

// In completeProductionRun function:
exports.completeProductionRun = async (req, res) => {
  const transaction = await db.sequelize.transaction();

  try {
    // ... existing code ...

    // Calculate total material cost
    let totalMaterialCost = 0;

    // Process each recipe item with FIFO logic
    for (const item of productionRun.recipe.items) {
      const requiredQuantity = parseFloat(item.quantity) * scaleFactor;

      // Get available batches (FIFO)
      const batches = await RawMaterialBatch.findAll({
        where: {
          material_id: item.material_id,
          current_quantity: { [Op.gt]: 0 },
          type: 'receipt',
          expiry_date: { [Op.or]: [null, { [Op.gt]: new Date() }] },
        },
        order: [['created_at', 'ASC']], // FIFO
        transaction,
      });

      let remainingQuantity = requiredQuantity;
      const materialsUsed = [];

      // FIFO deduction with cost tracking
      for (const batch of batches) {
        if (remainingQuantity <= 0) break;

        const availableInBatch = parseFloat(batch.current_quantity);
        const quantityToDeduct = Math.min(remainingQuantity, availableInBatch);

        // Calculate cost for this deduction
        const costFromBatch = parseFloat(batch.unit_cost) * quantityToDeduct;
        totalMaterialCost += costFromBatch;

        // Update batch quantity
        await batch.update(
          {
            current_quantity: parseFloat(batch.current_quantity) - quantityToDeduct,
          },
          { transaction }
        );

        // Record material usage
        materialsUsed.push({
          production_run_id: id,
          batch_id: batch.id,
          quantity_used: quantityToDeduct,
        });

        remainingQuantity -= quantityToDeduct;
      }

      // Check if sufficient
      if (remainingQuantity > 0) {
        await transaction.rollback();
        return errorResponse(
          res,
          `Insufficient stock for ${item.material.name}. Required: ${requiredQuantity}, Available: ${requiredQuantity - remainingQuantity}`,
          400
        );
      }

      // Bulk create production materials
      if (materialsUsed.length > 0) {
        await ProductionMaterial.bulkCreate(materialsUsed, { transaction });
      }
    }

    // Calculate waste cost separately (Approach 2: Separate Waste Allocation)
    const wasteQty = parseFloat(waste_quantity || 0);
    const totalExpectedQuantity = parseFloat(quantity_produced) + wasteQty;

    // Base unit cost (materials divided by expected total output)
    const baseUnitCost = totalExpectedQuantity > 0 ? totalMaterialCost / totalExpectedQuantity : 0;

    // Allocate costs
    const finishedGoodsCost = baseUnitCost * parseFloat(quantity_produced);
    const wasteCost = baseUnitCost * wasteQty;

    // Generate finished goods batch number
    const finishedGoodsBatchNumber = await generateFinishedGoodsBatchNumber(
      outputs[0]?.sku_id || productionRun.recipe.product_sku_id,
      productionRun.production_date
    );

    // Update product SKU stock
    const targetSkuId = outputs[0]?.sku_id || productionRun.recipe.product_sku_id;
    const targetSku = await ProductSku.findByPk(targetSkuId);

    await targetSku.update(
      {
        current_stock: parseFloat(targetSku.current_stock || 0) + parseFloat(quantity_produced),
      },
      { transaction }
    );

    // Create production output with batch number and cost
    await ProductionOutput.create(
      {
        production_run_id: id,
        sku_id: targetSkuId,
        quantity_produced,
        batch_number: finishedGoodsBatchNumber,
        production_date: productionRun.production_date,
        unit_cost: baseUnitCost.toFixed(2), // Base cost per unit
        total_cost: finishedGoodsCost.toFixed(2), // Cost for finished goods only
        waste_cost: wasteCost.toFixed(2), // Waste cost tracked separately
      },
      { transaction }
    );

    // Update production run status
    await productionRun.update(
      {
        status: 'completed',
      },
      { transaction }
    );

    await transaction.commit();

    // Fetch completed production run
    const completedRun = await ProductionRun.findByPk(id, {
      include: [
        {
          model: Recipe,
          as: 'recipe',
          attributes: ['id', 'name', 'version'],
        },
        {
          model: db.User,
          as: 'producedBy',
          attributes: ['id', 'username'],
        },
        {
          model: ProductionMaterial,
          as: 'materials',
          include: [
            {
              model: RawMaterialBatch,
              as: 'batch',
              attributes: ['id', 'batch_number', 'expiry_date', 'unit_cost'],
            },
          ],
        },
        {
          model: ProductionOutput,
          as: 'outputs',
          include: [
            {
              model: ProductSku,
              as: 'sku',
              attributes: ['id', 'size', 'unit', 'price'],
            },
          ],
        },
      ],
    });

    return successResponse(res, completedRun);
  } catch (error) {
    await transaction.rollback();
    console.error('Error completing production run:', error);
    return errorResponse(res, 'Failed to complete production run', 500);
  }
};
```

### Traceability Query Examples:

```javascript
// Find which production run(s) created a specific finished goods batch
const findProductionByBatch = async batchNumber => {
  const output = await ProductionOutput.findOne({
    where: { batch_number: batchNumber },
    include: [
      {
        model: ProductionRun,
        as: 'productionRun',
        include: [
          { model: Recipe, as: 'recipe' },
          {
            model: ProductionMaterial,
            as: 'materials',
            include: [{ model: RawMaterialBatch, as: 'batch' }],
          },
        ],
      },
      {
        model: ProductSku,
        as: 'sku',
        include: [{ model: Product, as: 'product' }],
      },
    ],
  });

  return output;
};

// Find all finished goods batches from a specific raw material batch
const findFinishedGoodsFromRawBatch = async rawBatchNumber => {
  const finishedBatches = await ProductionOutput.findAll({
    include: [
      {
        model: ProductionRun,
        as: 'productionRun',
        include: [
          {
            model: ProductionMaterial,
            as: 'materials',
            include: [
              {
                model: RawMaterialBatch,
                as: 'batch',
                where: { batch_number: rawBatchNumber },
              },
            ],
          },
        ],
      },
    ],
  });

  return finishedBatches;
};
```

### Benefits:

✅ Complete forward traceability (raw material → finished goods → sales)  
✅ Complete backward traceability (sales → finished goods → raw materials)  
✅ Food safety compliance (recall management)  
✅ Batch-level cost tracking  
✅ Quality control by batch

---

## 🎯 Priority 3: Add Actual Cost & Profit Tracking

### Current Problem:

- Recipe shows estimated cost (based on average_cost)
- Production doesn't record actual cost
- Can't calculate profit margin per product/batch
- No waste cost reporting (can't see monthly waste expense)
- No profit per sale tracking
- No daily/monthly profit summaries

### Solution:

Extend P2 implementation with:

1. **Separate waste cost allocation** (waste cost tracked separately from finished goods)
2. **Profit calculation endpoints** (per SKU, per sale)
3. **Waste cost reporting** (monthly waste expense tracking)
4. **Profit summaries** (daily/monthly profit reports)

### Additional Model Field (Optional):

```javascript
// models/ProductSku.js - ADD this field if you want to track average production cost

module.exports = (sequelize, DataTypes) => {
  const ProductSku = sequelize.define(
    'ProductSku',
    {
      // ... existing fields ...
      price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      // NEW: Track average production cost
      average_cost: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        defaultValue: 0,
        comment: 'Average production cost per unit (updated after each production)',
      },
      current_stock: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0,
      },
      // ... rest of fields ...
    },
    {
      // ... config ...
    }
  );

  return ProductSku;
};
```

### Migration (Optional):

```javascript
// migrations/20260120000003-add-sku-average-cost.js

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('product_skus', 'average_cost', {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: true,
      defaultValue: 0,
      comment: 'Average production cost per unit',
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('product_skus', 'average_cost');
  },
};
```

### Update Average Cost After Production:

```javascript
// controllers/productionController.js

// Add to completeProductionRun after creating ProductionOutput:

// Update SKU average cost (weighted average)
const currentStock = parseFloat(targetSku.current_stock || 0);
const currentAvgCost = parseFloat(targetSku.average_cost || 0);
const newQuantity = parseFloat(quantity_produced);
const newUnitCost = baseUnitCost; // Use base cost (not inflated by waste)

const totalValue = currentStock * currentAvgCost + newQuantity * newUnitCost;
const totalQuantity = currentStock + newQuantity;
const newAvgCost = totalQuantity > 0 ? totalValue / totalQuantity : newUnitCost;

await targetSku.update(
  {
    current_stock: totalQuantity,
    average_cost: newAvgCost.toFixed(2), // NEW
  },
  { transaction }
);
```

### API Endpoint for Profit Analysis:

```javascript
// controllers/productController.js

/**
 * Get profit analysis for SKU
 * GET /api/products/:productId/skus/:skuId/profit
 */
exports.getSkuProfit = async (req, res) => {
  try {
    const { productId, skuId } = req.params;

    const sku = await ProductSku.findOne({
      where: { id: skuId, product_id: productId },
      include: [
        {
          model: Product,
          as: 'product',
          attributes: ['id', 'code', 'name'],
        },
      ],
    });

    if (!sku) {
      return errorResponse(res, 'SKU not found', 404);
    }

    const sellingPrice = parseFloat(sku.price || 0);
    const avgCost = parseFloat(sku.average_cost || 0);
    const profit = sellingPrice - avgCost;
    const profitMargin = sellingPrice > 0 ? (profit / sellingPrice) * 100 : 0;

    const profitData = {
      product: {
        id: sku.product.id,
        code: sku.product.code,
        name: sku.product.name,
      },
      sku: {
        id: sku.id,
        size: sku.size,
        unit: sku.unit,
      },
      pricing: {
        selling_price: sellingPrice.toFixed(2),
        average_cost: avgCost.toFixed(2),
        profit_per_unit: profit.toFixed(2),
        profit_margin_percentage: profitMargin.toFixed(2),
      },
      inventory: {
        current_stock: parseFloat(sku.current_stock || 0),
        total_inventory_value: (parseFloat(sku.current_stock || 0) * avgCost).toFixed(2),
        total_potential_revenue: (parseFloat(sku.current_stock || 0) * sellingPrice).toFixed(2),
        total_potential_profit: (parseFloat(sku.current_stock || 0) * profit).toFixed(2),
      },
    };

    return successResponse(res, profitData);
  } catch (error) {
    console.error('Error calculating profit:', error);
    return errorResponse(res, 'Failed to calculate profit', 500);
  }
};

/**
 * Get profit summary for all products
 * GET /api/products/profit-summary
 */
exports.getProfitSummary = async (req, res) => {
  try {
    const products = await Product.findAll({
      where: { status: 'active' },
      include: [
        {
          model: ProductSku,
          as: 'skus',
          where: { status: 'active' },
          required: false,
        },
      ],
    });

    const profitSummary = products.map(product => {
      const skuAnalysis = product.skus.map(sku => {
        const sellingPrice = parseFloat(sku.price || 0);
        const avgCost = parseFloat(sku.average_cost || 0);
        const profit = sellingPrice - avgCost;
        const profitMargin = sellingPrice > 0 ? (profit / sellingPrice) * 100 : 0;
        const stock = parseFloat(sku.current_stock || 0);

        return {
          sku_id: sku.id,
          size: sku.size,
          selling_price: sellingPrice.toFixed(2),
          cost: avgCost.toFixed(2),
          profit: profit.toFixed(2),
          margin: profitMargin.toFixed(2),
          stock: stock,
          total_value: (stock * avgCost).toFixed(2),
          total_profit: (stock * profit).toFixed(2),
        };
      });

      const totalProfit = skuAnalysis.reduce((sum, sku) => sum + parseFloat(sku.total_profit), 0);
      const totalValue = skuAnalysis.reduce((sum, sku) => sum + parseFloat(sku.total_value), 0);

      return {
        product_id: product.id,
        product_code: product.code,
        product_name: product.name,
        skus: skuAnalysis,
        total_inventory_value: totalValue.toFixed(2),
        total_potential_profit: totalProfit.toFixed(2),
      };
    });

    return successResponse(res, profitSummary);
  } catch (error) {
    console.error('Error calculating profit summary:', error);
    return errorResponse(res, 'Failed to calculate profit summary', 500);
  }
};
```

/\*\*

- Get waste cost report
- GET /api/production-runs/waste-cost-report
  \*/
  exports.getWasteCostReport = async (req, res) => {
  try {
  const { date_from, date_to } = req.query;

      const where = {};

      if (date_from) {
        where.production_date = {
          ...where.production_date,
          [Op.gte]: new Date(date_from),
        };
      }
      if (date_to) {
        where.production_date = {
          ...where.production_date,
          [Op.lte]: new Date(date_to),
        };
      }

      const outputs = await ProductionOutput.findAll({
        where,
        include: [
          {
            model: ProductionRun,
            as: 'productionRun',
            attributes: ['id', 'batch_number', 'production_date', 'waste_quantity', 'waste_reason'],
          },
          {
            model: ProductSku,
            as: 'sku',
            include: [
              {
                model: Product,
                as: 'product',
                attributes: ['code', 'name'],
              },
            ],
          },
        ],
        order: [['production_date', 'DESC']],
      });

      const wasteDetails = outputs
        .filter(output => parseFloat(output.waste_cost || 0) > 0)
        .map(output => ({
          date: output.production_date,
          batch_number: output.productionRun.batch_number,
          product: output.sku.product.name,
          waste_quantity: parseFloat(output.productionRun.waste_quantity || 0),
          waste_cost: parseFloat(output.waste_cost || 0),
          waste_reason: output.productionRun.waste_reason || 'Not specified',
        }));

      const totalWasteCost = wasteDetails.reduce((sum, item) => sum + item.waste_cost, 0);

      return successResponse(res, {
        summary: {
          total_waste_cost: totalWasteCost.toFixed(2),
          total_incidents: wasteDetails.length,
          period: {
            from: date_from || 'All time',
            to: date_to || 'Now',
          },
        },
        details: wasteDetails,
      });

  } catch (error) {
  console.error('Error generating waste cost report:', error);
  return errorResponse(res, 'Failed to generate waste cost report', 500);
  }
  };

/\*\*

- Get profit per sale (from sales invoices)
- GET /api/sales/invoices/:invoiceId/profit
  \*/
  exports.getSaleProfit = async (req, res) => {
  try {
  const { invoiceId } = req.params;

      const invoice = await SalesInvoice.findByPk(invoiceId, {
        include: [
          {
            model: InvoiceItem,
            as: 'items',
            include: [
              {
                model: ProductSku,
                as: 'sku',
                attributes: ['id', 'size', 'unit', 'average_cost'],
                include: [
                  {
                    model: Product,
                    as: 'product',
                    attributes: ['code', 'name'],
                  },
                ],
              },
            ],
          },
        ],
      });

      if (!invoice) {
        return errorResponse(res, 'Invoice not found', 404);
      }

      const itemProfits = invoice.items.map(item => {
        const unitPrice = parseFloat(item.price || 0);
        const unitCost = parseFloat(item.sku.average_cost || 0);
        const quantity = parseFloat(item.quantity || 0);

        const revenue = unitPrice * quantity;
        const cost = unitCost * quantity;
        const profit = revenue - cost;
        const margin = revenue > 0 ? (profit / revenue) * 100 : 0;

        return {
          product: item.sku.product.name,
          sku: `${item.sku.size} ${item.sku.unit}`,
          quantity: quantity,
          unit_price: unitPrice.toFixed(2),
          unit_cost: unitCost.toFixed(2),
          revenue: revenue.toFixed(2),
          cost: cost.toFixed(2),
          profit: profit.toFixed(2),
          margin: margin.toFixed(2),
        };
      });

      const totalRevenue = itemProfits.reduce((sum, item) => sum + parseFloat(item.revenue), 0);
      const totalCost = itemProfits.reduce((sum, item) => sum + parseFloat(item.cost), 0);
      const totalProfit = totalRevenue - totalCost;
      const overallMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;

      return successResponse(res, {
        invoice_number: invoice.invoice_number,
        invoice_date: invoice.invoice_date,
        summary: {
          total_revenue: totalRevenue.toFixed(2),
          total_cost: totalCost.toFixed(2),
          total_profit: totalProfit.toFixed(2),
          profit_margin: overallMargin.toFixed(2),
        },
        items: itemProfits,
      });

  } catch (error) {
  console.error('Error calculating sale profit:', error);
  return errorResponse(res, 'Failed to calculate sale profit', 500);
  }
  };

/\*\*

- Get daily/monthly profit summary
- GET /api/sales/profit-summary?period=daily&date_from=2026-01-01&date_to=2026-01-31
  \*/
  exports.getDailyMonthlyProfitSummary = async (req, res) => {
  try {
  const { period = 'daily', date_from, date_to } = req.query;

      const where = {};

      if (date_from) {
        where.invoice_date = {
          ...where.invoice_date,
          [Op.gte]: new Date(date_from),
        };
      }
      if (date_to) {
        where.invoice_date = {
          ...where.invoice_date,
          [Op.lte]: new Date(date_to),
        };
      }

      const invoices = await SalesInvoice.findAll({
        where,
        include: [
          {
            model: InvoiceItem,
            as: 'items',
            include: [
              {
                model: ProductSku,
                as: 'sku',
                attributes: ['average_cost'],
              },
            ],
          },
        ],
        order: [['invoice_date', 'ASC']],
      });

      // Group by period
      const profitByPeriod = {};

      invoices.forEach(invoice => {
        const date = new Date(invoice.invoice_date);
        let periodKey;

        if (period === 'daily') {
          periodKey = date.toISOString().slice(0, 10); // YYYY-MM-DD
        } else {
          periodKey = date.toISOString().slice(0, 7); // YYYY-MM
        }

        if (!profitByPeriod[periodKey]) {
          profitByPeriod[periodKey] = {
            revenue: 0,
            cost: 0,
            profit: 0,
            invoice_count: 0,
          };
        }

        let invoiceRevenue = 0;
        let invoiceCost = 0;

        invoice.items.forEach(item => {
          const quantity = parseFloat(item.quantity || 0);
          const price = parseFloat(item.price || 0);
          const cost = parseFloat(item.sku.average_cost || 0);

          invoiceRevenue += quantity * price;
          invoiceCost += quantity * cost;
        });

        profitByPeriod[periodKey].revenue += invoiceRevenue;
        profitByPeriod[periodKey].cost += invoiceCost;
        profitByPeriod[periodKey].profit += invoiceRevenue - invoiceCost;
        profitByPeriod[periodKey].invoice_count += 1;
      });

      // Format results
      const summary = Object.keys(profitByPeriod)
        .sort()
        .map(periodKey => {
          const data = profitByPeriod[periodKey];
          const margin = data.revenue > 0 ? (data.profit / data.revenue) * 100 : 0;

          return {
            period: periodKey,
            revenue: data.revenue.toFixed(2),
            cost: data.cost.toFixed(2),
            profit: data.profit.toFixed(2),
            margin: margin.toFixed(2),
            invoice_count: data.invoice_count,
          };
        });

      const totals = summary.reduce(
        (acc, item) => ({
          revenue: acc.revenue + parseFloat(item.revenue),
          cost: acc.cost + parseFloat(item.cost),
          profit: acc.profit + parseFloat(item.profit),
          invoices: acc.invoices + item.invoice_count,
        }),
        { revenue: 0, cost: 0, profit: 0, invoices: 0 }
      );

      const overallMargin = totals.revenue > 0 ? (totals.profit / totals.revenue) * 100 : 0;

      return successResponse(res, {
        period_type: period,
        totals: {
          total_revenue: totals.revenue.toFixed(2),
          total_cost: totals.cost.toFixed(2),
          total_profit: totals.profit.toFixed(2),
          overall_margin: overallMargin.toFixed(2),
          total_invoices: totals.invoices,
        },
        breakdown: summary,
      });

  } catch (error) {
  console.error('Error generating profit summary:', error);
  return errorResponse(res, 'Failed to generate profit summary', 500);
  }
  };

````

### Add Routes:

```javascript
// routes/productRoutes.js
router.get('/profit-summary', productController.getProfitSummary);
router.get('/:productId/skus/:skuId/profit', productController.getSkuProfit);

// routes/productionRoutes.js
router.get('/waste-cost-report', productionController.getWasteCostReport);

// routes/salesRoutes.js
router.get('/invoices/:invoiceId/profit', salesController.getSaleProfit);
router.get('/profit-summary', salesController.getDailyMonthlyProfitSummary);
````

### Benefits:

✅ Track actual production cost per batch  
✅ Separate waste cost tracking (see where money is wasted)  
✅ Monthly waste cost reporting ("This month waste = Rs. 25,000")  
✅ Calculate profit margin per SKU (average cost method)  
✅ Profit per sale calculation (individual invoice profitability)  
✅ Daily/monthly profit summaries (trend analysis)  
✅ Inventory valuation at cost (more accurate with lower waste impact)  
✅ Better pricing decisions (cost not inflated by waste)  
✅ Foundation for future batch-specific profit tracking

---

## 🎯 Priority 4: Auto Batch Number Generation

### Current Problem:

- Batch numbers manually entered or unclear generation
- Risk of duplicates
- No consistent format

### Solution:

Centralized batch number generation utility.

### Create Utility File:

```javascript
// utils/batchNumberGenerator.js

const { ProductionRun, ProductionOutput, ProductSku, Product } = require('../models');
const { Op } = require('sequelize');

/**
 * Generate production run batch number
 * Format: PROD-YYYYMMDD-NNN
 * Example: PROD-20260120-001
 */
const generateProductionBatchNumber = async productionDate => {
  const date = new Date(productionDate);
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, ''); // YYYYMMDD

  // Find last batch number for this date
  const lastRun = await ProductionRun.findOne({
    where: {
      production_date: date,
      batch_number: {
        [Op.like]: `PROD-${dateStr}-%`,
      },
    },
    order: [['batch_number', 'DESC']],
  });

  let sequence = 1;
  if (lastRun && lastRun.batch_number) {
    // Extract sequence from batch number like PROD-20260120-003
    const parts = lastRun.batch_number.split('-');
    if (parts.length === 3) {
      sequence = parseInt(parts[2]) + 1;
    }
  }

  return `PROD-${dateStr}-${String(sequence).padStart(3, '0')}`;
};

/**
 * Generate finished goods batch number
 * Format: FG-{PRODUCT_CODE}-YYYYMMDD-NNN
 * Example: FG-PROD001-20260120-001
 */
const generateFinishedGoodsBatchNumber = async (skuId, productionDate) => {
  const date = new Date(productionDate);
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, ''); // YYYYMMDD

  // Get SKU with product code
  const sku = await ProductSku.findByPk(skuId, {
    include: [
      {
        model: Product,
        as: 'product',
        attributes: ['code'],
      },
    ],
  });

  if (!sku) {
    throw new Error('SKU not found');
  }

  const productCode = sku.product.code; // e.g., PROD001

  // Find last batch number for this SKU on this date
  const lastOutput = await ProductionOutput.findOne({
    where: {
      sku_id: skuId,
      production_date: date,
      batch_number: {
        [Op.like]: `FG-${productCode}-${dateStr}-%`,
      },
    },
    order: [['batch_number', 'DESC']],
  });

  let sequence = 1;
  if (lastOutput && lastOutput.batch_number) {
    // Extract sequence from batch number like FG-PROD001-20260120-003
    const parts = lastOutput.batch_number.split('-');
    if (parts.length === 4) {
      sequence = parseInt(parts[3]) + 1;
    }
  }

  return `FG-${productCode}-${dateStr}-${String(sequence).padStart(3, '0')}`;
};

/**
 * Validate batch number uniqueness
 */
const validateBatchNumberUnique = async (batchNumber, type = 'production') => {
  if (type === 'production') {
    const existing = await ProductionRun.findOne({
      where: { batch_number: batchNumber },
    });
    return !existing;
  } else if (type === 'finished_goods') {
    const existing = await ProductionOutput.findOne({
      where: { batch_number: batchNumber },
    });
    return !existing;
  }
  return false;
};

module.exports = {
  generateProductionBatchNumber,
  generateFinishedGoodsBatchNumber,
  validateBatchNumberUnique,
};
```

### Update Production Controller:

```javascript
// controllers/productionController.js

const {
  generateProductionBatchNumber,
  generateFinishedGoodsBatchNumber,
  validateBatchNumberUnique,
} = require('../utils/batchNumberGenerator');

exports.createProductionRun = async (req, res) => {
  try {
    const {
      recipe_id,
      production_date,
      batch_number, // Optional, will auto-generate if not provided
      produced_by,
      notes,
      status = 'completed',
    } = req.body;

    // Validation
    if (!recipe_id || !produced_by) {
      return errorResponse(res, 'Recipe ID and produced_by user are required', 400);
    }

    // Verify recipe exists
    const recipe = await Recipe.findByPk(recipe_id);
    if (!recipe) {
      return errorResponse(res, 'Recipe not found', 404);
    }

    // Auto-generate batch number if not provided
    let finalBatchNumber = batch_number;
    if (!finalBatchNumber) {
      finalBatchNumber = await generateProductionBatchNumber(production_date || new Date());
    } else {
      // Validate uniqueness if provided
      const isUnique = await validateBatchNumberUnique(finalBatchNumber, 'production');
      if (!isUnique) {
        return errorResponse(res, 'Batch number already exists', 400);
      }
    }

    // Create production run
    const productionRun = await ProductionRun.create({
      recipe_id,
      production_date: production_date || new Date(),
      batch_number: finalBatchNumber,
      produced_by,
      notes,
      status,
    });

    // Fetch created production run with relations
    const createdRun = await ProductionRun.findByPk(productionRun.id, {
      include: [
        {
          model: Recipe,
          as: 'recipe',
          attributes: ['id', 'name', 'version'],
        },
        {
          model: db.User,
          as: 'producedBy',
          attributes: ['id', 'username'],
        },
      ],
    });

    return successResponse(res, createdRun, 201);
  } catch (error) {
    console.error('Error creating production run:', error);
    return errorResponse(res, 'Failed to create production run', 500);
  }
};
```

### Benefits:

✅ Consistent batch number format  
✅ No duplicate batch numbers  
✅ Automatic generation (less user error)  
✅ Date-based organization  
✅ Product-specific finished goods batches

---

## 🎯 Priority 5: Add Yield Variance & Waste Tracking

### Current Problem:

- Can't track difference between expected and actual yield
- No waste recording
- Missing production efficiency metrics

### Solution:

Add yield tracking fields to production runs.

### Database Migration:

```javascript
// migrations/20260120000004-add-yield-tracking.js

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Add expected quantity (from recipe scaled)
    await queryInterface.addColumn('production_runs', 'expected_quantity', {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: true,
      comment: 'Expected output quantity based on recipe',
    });

    // Add actual quantity produced
    await queryInterface.addColumn('production_runs', 'actual_quantity', {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: true,
      comment: 'Actual output quantity produced',
    });

    // Add waste quantity
    await queryInterface.addColumn('production_runs', 'waste_quantity', {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: true,
      defaultValue: 0,
      comment: 'Waste/loss quantity',
    });

    // Add waste reason
    await queryInterface.addColumn('production_runs', 'waste_reason', {
      type: Sequelize.STRING(200),
      allowNull: true,
      comment: 'Reason for waste/loss',
    });

    // Add yield efficiency percentage
    await queryInterface.addColumn('production_runs', 'yield_efficiency', {
      type: Sequelize.DECIMAL(5, 2),
      allowNull: true,
      comment: 'Yield efficiency % (actual/expected * 100)',
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('production_runs', 'expected_quantity');
    await queryInterface.removeColumn('production_runs', 'actual_quantity');
    await queryInterface.removeColumn('production_runs', 'waste_quantity');
    await queryInterface.removeColumn('production_runs', 'waste_reason');
    await queryInterface.removeColumn('production_runs', 'yield_efficiency');
  },
};
```

### Model Update:

```javascript
// models/ProductionRun.js

module.exports = (sequelize, DataTypes) => {
  const ProductionRun = sequelize.define(
    'ProductionRun',
    {
      // ... existing fields ...

      // NEW FIELDS
      expected_quantity: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        comment: 'Expected output quantity based on recipe',
      },
      actual_quantity: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        comment: 'Actual output quantity produced',
      },
      waste_quantity: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        defaultValue: 0,
        comment: 'Waste/loss quantity',
      },
      waste_reason: {
        type: DataTypes.STRING(200),
        allowNull: true,
        comment: 'Reason for waste/loss',
      },
      yield_efficiency: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: true,
        comment: 'Yield efficiency % (actual/expected * 100)',
      },
    },
    {
      tableName: 'production_runs',
      timestamps: false,
      createdAt: 'created_at',
      // ... rest of config ...
    }
  );

  return ProductionRun;
};
```

### Controller Implementation:

```javascript
// controllers/productionController.js

exports.completeProductionRun = async (req, res) => {
  const transaction = await db.sequelize.transaction();

  try {
    const { id } = req.params;
    const { quantity_produced, waste_quantity = 0, waste_reason = '', outputs = [] } = req.body;

    if (!quantity_produced || quantity_produced <= 0) {
      await transaction.rollback();
      return errorResponse(res, 'Valid quantity produced is required', 400);
    }

    const productionRun = await ProductionRun.findByPk(id, {
      include: [
        {
          model: Recipe,
          as: 'recipe',
          include: [
            {
              model: RecipeItem,
              as: 'items',
              include: [{ model: RawMaterial, as: 'material' }],
            },
          ],
        },
      ],
    });

    if (!productionRun) {
      await transaction.rollback();
      return errorResponse(res, 'Production run not found', 404);
    }

    if (productionRun.status === 'completed') {
      await transaction.rollback();
      return errorResponse(res, 'Production run already completed', 400);
    }

    // Calculate scale factor and expected quantity
    const scaleFactor = quantity_produced / productionRun.recipe.expected_yield;
    const expectedQuantity = productionRun.recipe.expected_yield * scaleFactor;

    // ... FIFO logic and material deduction ...
    // ... (keep existing code) ...

    // Calculate yield efficiency
    const actualQuantity = parseFloat(quantity_produced);
    const wasteQty = parseFloat(waste_quantity || 0);
    const yieldEfficiency = expectedQuantity > 0 ? (actualQuantity / expectedQuantity) * 100 : 0;

    // Update production run with yield tracking
    await productionRun.update(
      {
        status: 'completed',
        expected_quantity: expectedQuantity.toFixed(2),
        actual_quantity: actualQuantity.toFixed(2),
        waste_quantity: wasteQty.toFixed(2),
        waste_reason: waste_reason || null,
        yield_efficiency: yieldEfficiency.toFixed(2),
      },
      { transaction }
    );

    await transaction.commit();

    // Fetch completed production run
    const completedRun = await ProductionRun.findByPk(id, {
      include: [
        {
          model: Recipe,
          as: 'recipe',
          attributes: ['id', 'name', 'version', 'expected_yield'],
        },
        {
          model: db.User,
          as: 'producedBy',
          attributes: ['id', 'username'],
        },
        {
          model: ProductionMaterial,
          as: 'materials',
          include: [
            {
              model: RawMaterialBatch,
              as: 'batch',
              attributes: ['id', 'batch_number', 'expiry_date', 'unit_cost'],
            },
          ],
        },
        {
          model: ProductionOutput,
          as: 'outputs',
          include: [
            {
              model: ProductSku,
              as: 'sku',
              attributes: ['id', 'size', 'unit', 'price'],
            },
          ],
        },
      ],
    });

    return successResponse(res, completedRun);
  } catch (error) {
    await transaction.rollback();
    console.error('Error completing production run:', error);
    return errorResponse(res, 'Failed to complete production run', 500);
  }
};
```

### Reporting Endpoint:

```javascript
// controllers/productionController.js

/**
 * Get production efficiency report
 * GET /api/production-runs/efficiency-report
 */
exports.getEfficiencyReport = async (req, res) => {
  try {
    const { date_from, date_to, recipe_id } = req.query;

    const where = { status: 'completed' };

    if (date_from) {
      where.production_date = {
        ...where.production_date,
        [Op.gte]: new Date(date_from),
      };
    }
    if (date_to) {
      where.production_date = {
        ...where.production_date,
        [Op.lte]: new Date(date_to),
      };
    }
    if (recipe_id) {
      where.recipe_id = recipe_id;
    }

    const runs = await ProductionRun.findAll({
      where,
      include: [
        {
          model: Recipe,
          as: 'recipe',
          attributes: ['id', 'name', 'code', 'version'],
        },
      ],
      order: [['production_date', 'DESC']],
    });

    const report = runs.map(run => ({
      production_run_id: run.id,
      batch_number: run.batch_number,
      production_date: run.production_date,
      recipe: {
        id: run.recipe.id,
        code: run.recipe.code,
        name: run.recipe.name,
        version: run.recipe.version,
      },
      expected_quantity: parseFloat(run.expected_quantity || 0),
      actual_quantity: parseFloat(run.actual_quantity || 0),
      waste_quantity: parseFloat(run.waste_quantity || 0),
      waste_reason: run.waste_reason,
      yield_efficiency: parseFloat(run.yield_efficiency || 0),
      variance: (
        parseFloat(run.actual_quantity || 0) - parseFloat(run.expected_quantity || 0)
      ).toFixed(2),
    }));

    // Calculate summary
    const summary = {
      total_runs: report.length,
      total_expected: report.reduce((sum, r) => sum + r.expected_quantity, 0).toFixed(2),
      total_actual: report.reduce((sum, r) => sum + r.actual_quantity, 0).toFixed(2),
      total_waste: report.reduce((sum, r) => sum + r.waste_quantity, 0).toFixed(2),
      average_efficiency:
        report.length > 0
          ? (report.reduce((sum, r) => sum + r.yield_efficiency, 0) / report.length).toFixed(2)
          : '0.00',
    };

    return successResponse(res, {
      summary,
      details: report,
    });
  } catch (error) {
    console.error('Error generating efficiency report:', error);
    return errorResponse(res, 'Failed to generate efficiency report', 500);
  }
};
```

### Add Route:

```javascript
// routes/productionRoutes.js

router.get('/efficiency-report', productionController.getEfficiencyReport);
```

### Benefits:

✅ Track production efficiency over time  
✅ Identify problematic recipes or processes  
✅ Waste analysis and reduction  
✅ Better planning and forecasting  
✅ Quality control insights

---

## 📋 Implementation Checklist

### Phase 1: Database & Models ✅ COMPLETED

- [x] Run migration 1: Recipe-SKU relationship
- [x] Run migration 2: Finished goods batch tracking
- [x] Run migration 3: SKU average cost
- [x] Run migration 4: Yield tracking
- [x] Update all models (Recipe, ProductionOutput, ProductSku, ProductionRun)
- [x] Update model associations in `models/index.js`
- [x] Test database changes (all migrations executed successfully)

### Phase 2: Backend Logic ✅ COMPLETED

- [x] Create batch number generator utility (`utils/batchNumberGenerator.js`)
- [x] Update recipe controller (validation, product/SKU checks)
- [x] Update production controller (FIFO with cost tracking, waste allocation)
- [x] Add finished goods batch generation (FG-{PRODUCT_CODE}-YYYYMMDD-NNN)
- [x] Add yield variance calculation (yield_efficiency percentage)
- [x] Add SKU average cost update (weighted average method)
- [x] Add profit calculation endpoints (getSkuProfit, getProfitSummary)
- [x] Add waste cost reporting endpoint (getWasteCostReport)
- [x] Add efficiency report endpoint (getEfficiencyReport)
- [x] Add sales profit endpoints (getSaleProfit, getDailyMonthlyProfitSummary)
- [x] Add all routes (productRoutes, productionRoutes, salesRoutes)
- [x] Test server startup (no runtime errors)

### Phase 3: Frontend Updates ✅ COMPLETED

- [x] Add profit reporting endpoints to product service
- [x] Add waste/efficiency reporting endpoints to production service
- [x] Add profit reporting endpoints to sales service
- [x] Create Profit Analysis view (ProfitAnalysis.vue)
- [x] Create Waste Cost Report view (WasteCostReport.vue)
- [x] Create Efficiency Report view (EfficiencyReport.vue)
- [x] Create Complete Production Dialog (CompleteProductionDialog.vue)
- [x] Add report routes to router (profit-analysis, waste-cost, efficiency)
- [x] Update RecipeForm (already has product/SKU fields properly bound)
- [x] Update ProductionRunForm (already shows batch numbers)
- [x] Add cost display in ProductionView (material cost, waste cost, batch number, yield tracking)
- [x] Add profit margin display in ProductView (avg cost, profit/unit, margin %, stock value)
- [x] Update navigation menu with Reports section (Profit Analysis, Waste Cost, Efficiency)
- [x] All forms and views updated

### Phase 4: Testing & Validation ⏳ IN PROGRESS

#### Backend API Testing

- [x] Test server startup
- [ ] Test recipe creation with product/SKU validation
  - [ ] Verify product_id required validation
  - [ ] Verify product_sku_id required validation
  - [ ] Verify SKU belongs to product validation
- [ ] Test production completion flow
  - [ ] Verify FIFO cost tracking (oldest batches consumed first)
  - [ ] Verify waste cost calculated separately
  - [ ] Verify batch number auto-generation
  - [ ] Verify SKU average cost updated (weighted average)
  - [ ] Verify yield efficiency calculated
- [ ] Test profit endpoints
  - [ ] GET /api/products/profit-summary (all products)
  - [ ] GET /api/products/:productId/skus/:skuId/profit (specific SKU)
- [ ] Test waste/efficiency endpoints
  - [ ] GET /api/production-runs/waste-cost-report (monthly waste totals)
  - [ ] GET /api/production-runs/efficiency-report (yield trends)
- [ ] Test sales profit endpoints
  - [ ] GET /api/sales/invoices/:invoiceId/profit (invoice profitability)
  - [ ] GET /api/sales/profit-summary (daily/monthly trends)

#### End-to-End Workflow Testing

- [ ] Test complete workflow: Raw Materials → Recipe → Production → Finished Goods → Sales
- [ ] Test traceability: Raw batch → Production run → Finished goods batch → Sale
- [ ] Verify cost accuracy: FIFO → Waste allocation → SKU average → Profit
- [ ] Test batch number uniqueness
- [ ] Performance testing (<500ms production completion)

#### Data Validation

- [ ] Verify all cost calculations match expected formulas
- [ ] Verify waste cost reports show accurate monthly totals
- [ ] Verify profit margins calculated correctly (selling_price - average_cost)
- [ ] Verify yield efficiency percentages accurate
- [ ] User acceptance testing

---

## 🎯 Implementation Status Summary

**Completed:** P1-P5 (All Core Priorities) ✅

- ✅ Recipe→SKU Relationship (P1)
- ✅ Finished Goods Batch Tracking (P2)
- ✅ Actual Cost & Profit Tracking (P3)
- ✅ Auto Batch Number Generation (P4)
- ✅ Yield Variance & Waste Tracking (P5)

**Files Created/Modified:**

- ✅ 4 migrations executed successfully
- ✅ 4 models updated (Recipe, ProductionOutput, ProductSku, ProductionRun)
- ✅ 1 utility created (batchNumberGenerator.js)
- ✅ 3 controllers enhanced (recipeController, productionController, productController)
- ✅ 2 controllers with new endpoints (salesController, productionController)
- ✅ 3 route files updated (productRoutes, productionRoutes, salesRoutes)
- ✅ 3 service files updated (productService, productionService, salesService)
- ✅ 4 report views created (ProfitAnalysis, WasteCostReport, EfficiencyReport, CompleteProductionDialog)
- ✅ 3 views enhanced (ProductionView, ProductView, Sidebar navigation)
- ✅ Router updated with 3 report routes

**Total Implementation:**

- **Backend:** 100% Complete (14 files modified/created)
- **Frontend:** 100% Complete (11 files modified/created)
- **Documentation:** 3 comprehensive guides (Phase 3 Summary, Testing Guide, Implementation Recommendations)

**Remaining Work:**

- ⏳ **Phase 4: Testing & Validation** (Ready to start - See TESTING_GUIDE_PHASE_4.md)
  - End-to-end workflow testing
  - Cost calculation verification
  - UI/UX validation
  - Performance testing
- 📋 **Future enhancements** (P6-P12 as needed)

---

## 🔮 Future Enhancements (Post-Implementation)

### P6: Sales-to-Batch Linking & Batch-Specific Profit

**When to implement:** When you need exact profit per sale using actual batch costs (instead of average)  
**Complexity:** Medium  
**Time:** 2-3 days

**What it adds:**

- Link each sale line item to specific finished goods batch consumed
- FIFO for finished goods sales (like raw materials)
- Exact profit calculation using actual batch cost vs average cost
- Traceability: "This sale used batch FG-CURRY-20260120-001"

**Database Changes:**

```javascript
// Add to invoice_items table
finished_goods_batch_id: INTEGER; // Links to production_output.id
```

**Benefits:**

- ✅ More accurate profit per sale (uses actual batch cost, not average)
- ✅ Better for high cost variation between batches
- ✅ Complete traceability from sale → production → raw materials

**Trade-off:** More complexity, but only ~5-10% more accurate than average cost for most businesses

---

### P7: Multi-SKU Production Output

**When to implement:** When you frequently split batches into multiple sizes  
**Complexity:** Medium  
**Time:** 2-3 days

**What it adds:**

- Ability to output multiple SKUs from single production run
- Example: Produce 50kg curry powder → split into 40×1kg + 10×500g packs
- Cost allocation across multiple output SKUs

---

### P8: Non-Material Cost Tracking (Separate Approach)

**When to implement:** When you need complete cost picture including labor/overhead  
**Complexity:** Low-Medium  
**Time:** 2 days

**Recommended Approach:** **Separate Overhead Tracking with Periodic Allocation**

Instead of tracking labor/overhead per production run (complex), track them separately and allocate periodically (monthly). This is simpler and standard for SMEs.

---

#### **How It Works:**

**Step 1: Track Monthly Overhead Expenses Separately**

```javascript
// New table: overhead_expenses
{
  id: INTEGER,
  month: DATE,              // 2026-01-01
  category: STRING,         // 'labor', 'electricity', 'rent', 'packaging', 'maintenance'
  description: STRING,      // 'Factory worker salaries'
  amount: DECIMAL(15,2),    // Rs. 150,000
  created_at: TIMESTAMP
}
```

**Examples:**

- Labor: Factory worker salaries - Rs. 150,000/month
- Electricity: Factory power bill - Rs. 25,000/month
- Rent: Factory rent - Rs. 50,000/month
- Packaging: Boxes, labels, tape - Rs. 30,000/month
- Maintenance: Equipment repairs - Rs. 10,000/month

**Total Monthly Overhead = Rs. 265,000**

---

**Step 2: Calculate Overhead Rate (End of Month)**

```javascript
// At month end:
Total Overhead This Month = Rs. 265,000
Total Production Quantity This Month = 5,000 kg (all products combined)

Overhead Rate per kg = 265,000 / 5,000 = Rs. 53 per kg
```

**OR allocate by production hours:**

```javascript
Total Production Hours This Month = 200 hours
Overhead Rate per hour = 265,000 / 200 = Rs. 1,325 per hour
```

---

**Step 3: Apply Overhead to Product Costs (Monthly Adjustment)**

```javascript
// Update ProductSku average_cost with overhead at month-end

// Example: Curry Powder 1kg
Current average_cost (materials only) = Rs. 441.67
Overhead allocation per kg = Rs. 53.00
New average_cost (fully loaded) = Rs. 494.67

// Update SKU
await ProductSku.update({
  material_cost: 441.67,           // NEW: Track material cost separately
  overhead_cost: 53.00,            // NEW: Allocated overhead
  average_cost: 494.67,            // Total cost (material + overhead)
  cost_last_updated: '2026-01-31'
}, {
  where: { id: skuId }
});
```

---

#### **Database Changes:**

```javascript
// migrations/add-overhead-tracking.js

// 1. Create overhead_expenses table
CREATE TABLE overhead_expenses (
  id INT PRIMARY KEY AUTO_INCREMENT,
  month DATE NOT NULL,
  category ENUM('labor', 'electricity', 'rent', 'packaging', 'maintenance', 'other'),
  description VARCHAR(200),
  amount DECIMAL(15,2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX(month),
  INDEX(category)
);

// 2. Add overhead tracking to product_skus
ALTER TABLE product_skus
  ADD COLUMN material_cost DECIMAL(10,2) DEFAULT 0 COMMENT 'Material cost only',
  ADD COLUMN overhead_cost DECIMAL(10,2) DEFAULT 0 COMMENT 'Allocated overhead per unit',
  ADD COLUMN cost_last_updated DATE COMMENT 'Last overhead allocation date';

// Note: average_cost = material_cost + overhead_cost
```

---

#### **API Endpoints:**

```javascript
// 1. Track overhead expenses
POST /api/overhead/expenses
{
  "month": "2026-01",
  "category": "labor",
  "description": "Factory worker salaries",
  "amount": 150000
}

// 2. Get monthly overhead summary
GET /api/overhead/summary?month=2026-01
Response:
{
  "month": "2026-01",
  "categories": [
    { "category": "labor", "amount": 150000 },
    { "category": "electricity", "amount": 25000 },
    { "category": "rent", "amount": 50000 },
    { "category": "packaging", "amount": 30000 }
  ],
  "total_overhead": 265000,
  "total_production_kg": 5000,
  "overhead_rate_per_kg": 53.00
}

// 3. Allocate overhead to products (month-end process)
POST /api/overhead/allocate
{
  "month": "2026-01",
  "allocation_basis": "production_quantity" // or "production_hours"
}
Response:
{
  "total_overhead": 265000,
  "total_production": 5000,
  "rate_per_kg": 53.00,
  "products_updated": 15,
  "allocation_date": "2026-01-31"
}
```

---

#### **Monthly Workflow:**

**During the month:**

1. ✅ Record production with material costs (normal workflow)
2. ✅ Record overhead expenses as they occur (salaries, bills, etc.)

**At month-end (1st of next month):**

1. ✅ Run overhead summary report
2. ✅ Calculate overhead rate (total overhead ÷ total production)
3. ✅ Run allocation API to update all SKU costs
4. ✅ Updated costs automatically used in new sales profit calculations

---

#### **Example: Complete Cost Picture**

**January 2026 Production:**

```
Curry Powder 1kg:
  Material cost: Rs. 441.67 (from production FIFO)
  Overhead allocation: Rs. 53.00 (from monthly overhead)
  Total cost: Rs. 494.67
  Selling price: Rs. 750.00
  Profit: Rs. 255.33 (34%)
```

**Without overhead tracking:**

```
  Material cost: Rs. 441.67
  Selling price: Rs. 750.00
  Profit: Rs. 308.33 (41%) ← WRONG! Overestimated by Rs. 53
```

---

#### **Benefits:**

✅ **Simple to use** - No complex tracking per production run  
✅ **Accurate profitability** - True cost includes all expenses  
✅ **Better pricing** - Know your real break-even point  
✅ **Monthly overhead visibility** - See where money goes  
✅ **Flexible allocation** - Can allocate by quantity, hours, or revenue  
✅ **Standard accounting practice** - Matches how accountants do it  
✅ **Historical tracking** - Compare overhead costs month-over-month  
✅ **Easy to implement** - Just record expenses and run allocation monthly

---

#### **When NOT to use this:**

❌ If you only have 1-2 products (overhead barely matters)  
❌ If overhead is very small (<5% of material cost)  
❌ If you don't pay regular bills (no factory, work from home)

**In those cases, you can skip P8 entirely.**

---

### P9: Recipe Versioning Archive

**When to implement:** When database size becomes concern (100+ recipe versions)  
**Complexity:** Low  
**Time:** 1 day

### P10: Production Planning UI

**When to implement:** To improve UX and reduce errors  
**Complexity:** Medium  
**Time:** 2-3 days  
**Features:**

- Material availability check before starting production
- Visual stock indicators
- Suggested production quantities based on low stock
- Production schedule/queue

### P11: Advanced Profit Analytics & Trends

**When to implement:** For deeper business insights  
**Complexity:** Medium  
**Time:** 2-3 days  
**Features:**

- Profit trends over time (charts/graphs)
- Comparison: budgeted vs actual profit
- Product profitability ranking
- Cost variance analysis (estimated vs actual)
- Material price impact on profit margins
- Supplier cost comparison
- Seasonal profit patterns

### P12: Quality Control Checkpoints

**When to implement:** For compliance or quality issues  
**Complexity:** High  
**Time:** 5-7 days  
**Features:**

- QC approval steps in production
- Batch inspection status
- Defect tracking
- Quality metrics dashboard

---

## 📊 Risk Assessment

| Risk                    | Probability | Impact | Mitigation                                         |
| ----------------------- | ----------- | ------ | -------------------------------------------------- |
| Data migration issues   | Low         | High   | Backup database before migrations, test on staging |
| FIFO logic breaks       | Low         | High   | Comprehensive testing, transaction rollbacks       |
| Performance degradation | Low         | Medium | Add indexes, monitor query performance             |
| User confusion          | Medium      | Low    | Training, documentation, clear UI labels           |
| Cost calculation errors | Low         | High   | Unit tests, validation checks, manual verification |

---

## 💡 Additional Recommendations

### 1. Add Data Validation Layer

Consider adding a validation library like `Joi` or `Yup` for consistent request validation.

### 2. Add Logging

Implement structured logging for production operations:

```javascript
logger.info('Production completed', {
  productionRunId: id,
  batchNumber: finalBatchNumber,
  actualQuantity: quantity_produced,
  totalCost: totalMaterialCost,
  yieldEfficiency: yieldEfficiency,
});
```

### 3. Add Audit Trail

Track who made changes and when:

```javascript
// Add to all critical tables
created_by: userId,
updated_by: userId,
created_at: timestamp,
updated_at: timestamp
```

### 4. Performance Indexes

Ensure these indexes exist:

- `recipes(product_id, product_sku_id, is_active)`
- `production_output(batch_number, production_date)`
- `production_runs(production_date, status)`
- `raw_material_batches(material_id, current_quantity, created_at)`

### 5. Frontend State Management

Consider optimizing Pinia stores with:

- Caching for frequently accessed data
- Optimistic updates for better UX
- Error state handling

---

## ✅ Success Criteria

The implementation will be considered successful when:

1. ✅ Every recipe is tied to a specific Product SKU
2. ✅ Production automatically generates batch numbers
3. ✅ Finished goods batches are traceable to raw material batches
4. ✅ Actual production costs are recorded and visible
5. ✅ Profit margins are calculable per SKU
6. ✅ Yield variance is tracked and reported
7. ✅ Waste is recorded with reasons
8. ✅ All existing production runs continue to work (backward compatibility)
9. ✅ No data loss during migration
10. ✅ Performance remains acceptable (<500ms for production completion)

---

## 📞 Next Steps

1. **Review this plan** - Any questions or concerns?
2. **Backup database** - Critical before migrations
3. **Create feature branch** - `feature/production-improvements`
4. **Start with P1** - Recipe-SKU relationship (highest impact)
5. **Test incrementally** - After each priority
6. **Deploy to staging** - Test full workflow before production

---

## 📚 Questions?

Before starting implementation, please confirm:

1. Are these priorities correct for your business needs?
2. Is the estimated timeline acceptable?
3. Do you need help with any specific implementation?
4. Should we adjust scope or priorities?

**Ready to start coding when you are!** 🚀
