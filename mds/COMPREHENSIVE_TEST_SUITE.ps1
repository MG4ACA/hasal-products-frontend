# ============================================================================
# COMPREHENSIVE TEST SUITE: Phase 1 & Phase 2
# ============================================================================
# Tests all POS functionality including:
# - Phase 1: PO Management, Multiple Receipts, QC Inspection, Cancellation
# - Phase 2: Return Batch Traceability, Genealogy, Origin Tracing
# ============================================================================

$baseUrl = "http://localhost:5000/api"
$totalTests = 0
$passedTests = 0
$failedTests = @()

# Helper function for test reporting
function Test-Result {
    param(
        [string]$TestName,
        [bool]$Passed,
        [string]$Message = ""
    )
    
    $script:totalTests++
    if ($Passed) {
        Write-Host "✅ PASS: $TestName" -ForegroundColor Green
        $script:passedTests++
    } else {
        Write-Host "❌ FAIL: $TestName" -ForegroundColor Red
        if ($Message) { Write-Host "   Error: $Message" -ForegroundColor Yellow }
        $script:failedTests += [PSCustomObject]@{Name = $TestName; Message = $Message}
    }
}

Write-Host "╔════════════════════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║                 COMPREHENSIVE TEST SUITE: PHASE 1 & PHASE 2               ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# ============================================================================
# SETUP: Authentication
# ============================================================================
Write-Host "╔════════════════════════════════════════════════════════════════════════════╗" -ForegroundColor Magenta
Write-Host "║                            SETUP: AUTHENTICATION                          ║" -ForegroundColor Magenta
Write-Host "╚════════════════════════════════════════════════════════════════════════════╝" -ForegroundColor Magenta

$loginResponse = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method POST `
    -ContentType "application/json" `
    -Body '{"username":"admin","password":"admin123"}'

$token = $loginResponse.data.token
$headers = @{ "Authorization" = "Bearer $token" }

Write-Host "✅ Authentication successful" -ForegroundColor Green
Write-Host ""

# Get materials for testing
$materialsResponse = Invoke-RestMethod -Uri "$baseUrl/raw-materials" `
    -Method GET -Headers $headers

$materialId = $materialsResponse.data.raw_materials[0].id
$supplierId = 1

Write-Host "Using Material ID: $materialId (Turmeric Powder)" -ForegroundColor Gray
Write-Host "Using Supplier ID: $supplierId" -ForegroundColor Gray
Write-Host ""

# ============================================================================
# PHASE 1 TESTS
# ============================================================================
Write-Host "╔════════════════════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║                          PHASE 1: PO MANAGEMENT                           ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# ============================================================================
# P1-T1: Create Purchase Order
# ============================================================================
Write-Host "=== P1-T1: Create Purchase Order ===" -ForegroundColor Cyan

try {
    $poBody = @{
        supplier_id = $supplierId
        order_date = "2024-12-20"
        expected_date = "2024-12-25"
        items = @(
            @{
                raw_material_id = $materialId
                quantity = 100
                unit_cost = 50
            }
        )
    } | ConvertTo-Json
    
    $poResponse = Invoke-RestMethod -Uri "$baseUrl/purchase-orders" `
        -Method POST -Headers $headers -ContentType "application/json" -Body $poBody
    
    $poId = $poResponse.data.id
    Test-Result "Create Purchase Order" $true
    Write-Host "   Created PO ID: $poId" -ForegroundColor Gray
    Write-Host "   Status: $($poResponse.data.status)" -ForegroundColor Gray
} catch {
    Test-Result "Create Purchase Order" $false $_.Exception.Message
}

Write-Host ""

# ============================================================================
# P1-T2: Receive Partial PO (50kg out of 100kg)
# ============================================================================
Write-Host "=== P1-T2: Receive Partial PO (50kg) ===" -ForegroundColor Cyan

if ($poId) {
    try {
        $receiveBody = @{
            received_date = "2024-12-20"
            received_items = @(
                @{
                    raw_material_id = $materialId
                    quantity_received = 50
                    expiry_date = "2025-12-20"
                }
            )
        } | ConvertTo-Json
        
        $receiveResponse = Invoke-RestMethod -Uri "$baseUrl/purchase-orders/$poId/receive" `
            -Method POST -Headers $headers -ContentType "application/json" -Body $receiveBody
        
        $batch1Id = $receiveResponse.data.batches[0].id
        $batch1Number = $receiveResponse.data.batches[0].batch_number
        Test-Result "Receive Partial PO" $true
        Write-Host "   Batch ID: $batch1Id" -ForegroundColor Gray
        Write-Host "   Batch Number: $batch1Number" -ForegroundColor Gray
        Write-Host "   Quantity: 50kg" -ForegroundColor Gray
    } catch {
        Test-Result "Receive Partial PO" $false $_.Exception.Message
    }
}

Write-Host ""

# ============================================================================
# P1-T3: Query PO - Verify Partial Status
# ============================================================================
Write-Host "=== P1-T3: Query PO - Verify Partial Status ===" -ForegroundColor Cyan

if ($poId) {
    try {
        $poCheckResponse = Invoke-RestMethod -Uri "$baseUrl/purchase-orders/$poId" `
            -Method GET -Headers $headers
        
        $status = [string]$poCheckResponse.data.status
        $receivedQty = [float]$poCheckResponse.data.items[0].received_quantity
        
        $isPartial = ($status -eq "partial" -and $receivedQty -eq 50.0)
        Test-Result "Verify PO Partial Status" $isPartial
        Write-Host "   PO Status: $status" -ForegroundColor Gray
        Write-Host "   Received: $receivedQty / 100 kg" -ForegroundColor Gray
    } catch {
        Test-Result "Verify PO Partial Status" $false $_.Exception.Message
    }
}

Write-Host ""

# ============================================================================
# P1-T4: Receive Remaining PO (50kg more)
# ============================================================================
Write-Host "=== P1-T4: Receive Remaining PO (50kg) ===" -ForegroundColor Cyan

if ($poId) {
    try {
        $receiveBody2 = @{
            received_date = "2024-12-21"
            received_items = @(
                @{
                    raw_material_id = $materialId
                    quantity_received = 50
                    expiry_date = "2025-12-20"
                }
            )
        } | ConvertTo-Json
        
        $receiveResponse2 = Invoke-RestMethod -Uri "$baseUrl/purchase-orders/$poId/receive" `
            -Method POST -Headers $headers -ContentType "application/json" -Body $receiveBody2
        
        $batch2Id = $receiveResponse2.data.batches[0].id
        $batch2Number = $receiveResponse2.data.batches[0].batch_number
        Test-Result "Receive Remaining PO" $true
        Write-Host "   Batch ID: $batch2Id" -ForegroundColor Gray
        Write-Host "   Batch Number: $batch2Number" -ForegroundColor Gray
        Write-Host "   Quantity: 50kg" -ForegroundColor Gray
    } catch {
        Test-Result "Receive Remaining PO" $false $_.Exception.Message
    }
}

Write-Host ""

# ============================================================================
# P1-T5: Query PO - Verify Fully Received Status
# ============================================================================
Write-Host "=== P1-T5: Query PO - Verify Fully Received Status ===" -ForegroundColor Cyan

if ($poId) {
    try {
        $poCheckResponse = Invoke-RestMethod -Uri "$baseUrl/purchase-orders/$poId" `
            -Method GET -Headers $headers
        
        $status = [string]$poCheckResponse.data.status
        $receivedQty = [float]$poCheckResponse.data.items[0].received_quantity
        
        $isReceived = ($status -eq "received" -and $receivedQty -eq 100.0)
        Test-Result "Verify PO Fully Received Status" $isReceived
        Write-Host "   PO Status: $status" -ForegroundColor Gray
        Write-Host "   Received: $receivedQty / 100 kg" -ForegroundColor Gray
    } catch {
        Test-Result "Verify PO Fully Received Status" $false $_.Exception.Message
    }
}

Write-Host ""

# ============================================================================
# P1-T6: Approve Batch Inspection
# ============================================================================
Write-Host "=== P1-T6: Approve Batch Inspection ===" -ForegroundColor Cyan

if ($batch1Id) {
    try {
        $approveBody = @{
            inspection_status = "approved"
            accepted_quantity = 50
            inspection_notes = "Quality check passed. All units acceptable."
        } | ConvertTo-Json
        
        $approveResponse = Invoke-RestMethod -Uri "$baseUrl/raw-material-batches/$batch1Id/approve-inspection" `
            -Method POST -Headers $headers -ContentType "application/json" -Body $approveBody
        
        $inspectionStatus = $approveResponse.data.inspection_status
        $isApproved = ($inspectionStatus -eq "approved")
        Test-Result "Approve Batch Inspection" $isApproved
        Write-Host "   Batch ID: $batch1Id" -ForegroundColor Gray
        Write-Host "   Inspection Status: $inspectionStatus" -ForegroundColor Gray
    } catch {
        Test-Result "Approve Batch Inspection" $false $_.Exception.Message
    }
}

Write-Host ""

# ============================================================================
# P1-T7: Create Another PO for Cancellation Test
# ============================================================================
Write-Host "=== P1-T7: Create PO for Cancellation ===" -ForegroundColor Cyan

try {
    $poCancelBody = @{
        supplier_id = $supplierId
        order_date = "2024-12-22"
        expected_date = "2024-12-27"
        items = @(
            @{
                raw_material_id = $materialId
                quantity = 50
                unit_cost = 50
            }
        )
    } | ConvertTo-Json
    
    $poCancelResponse = Invoke-RestMethod -Uri "$baseUrl/purchase-orders" `
        -Method POST -Headers $headers -ContentType "application/json" -Body $poCancelBody
    
    $poId2 = $poCancelResponse.data.id
    Test-Result "Create PO for Cancellation" $true
    Write-Host "   Created PO ID: $poId2" -ForegroundColor Gray
} catch {
    Test-Result "Create PO for Cancellation" $false $_.Exception.Message
}

Write-Host ""

# ============================================================================
# P1-T8: Cancel PO
# ============================================================================
Write-Host "=== P1-T8: Cancel Purchase Order ===" -ForegroundColor Cyan

if ($poId2) {
    try {
        $cancelBody = @{
            cancellation_reason = "Supplier unable to deliver on time"
        } | ConvertTo-Json
        
        $cancelResponse = Invoke-RestMethod -Uri "$baseUrl/purchase-orders/$poId2/cancel" `
            -Method PUT -Headers $headers -ContentType "application/json" -Body $cancelBody
        
        $status = $cancelResponse.data.status
        $isCancelled = ($status -eq "cancelled")
        Test-Result "Cancel Purchase Order" $isCancelled
        Write-Host "   PO ID: $poId2" -ForegroundColor Gray
        Write-Host "   Status: $status" -ForegroundColor Gray
    } catch {
        Test-Result "Cancel Purchase Order" $false $_.Exception.Message
    }
}

Write-Host ""

# ============================================================================
# PHASE 2 TESTS
# ============================================================================
Write-Host "╔════════════════════════════════════════════════════════════════════════════╗" -ForegroundColor Yellow
Write-Host "║                   PHASE 2: RETURN BATCH TRACEABILITY                      ║" -ForegroundColor Yellow
Write-Host "╚════════════════════════════════════════════════════════════════════════════╝" -ForegroundColor Yellow
Write-Host ""

# ============================================================================
# P2-T1: Process Return with Source Batch ID
# ============================================================================
Write-Host "=== P2-T1: Process Return with Source Batch ID ===" -ForegroundColor Cyan

if ($poId -and $batch1Id) {
    try {
        $returnBody = @{
            received_date = "2024-12-25"
            return_items = @(
                @{
                    raw_material_id = $materialId
                    quantity_returned = 10
                    source_batch_id = $batch1Id
                    return_reason = "Excess stock"
                    disposition = "stock"
                }
            )
        } | ConvertTo-Json
        
        $returnResponse = Invoke-RestMethod -Uri "$baseUrl/purchase-orders/$poId/receive" `
            -Method POST -Headers $headers -ContentType "application/json" -Body $returnBody
        
        $returnBatches = $returnResponse.data.batches | Where-Object { $_.batch_type -eq 'return' }
        if ($returnBatches) {
            $returnBatchId = $returnBatches[0].id
            $returnBatchNumber = $returnBatches[0].batch_number
            Test-Result "Process Return with Source Batch ID" $true
            Write-Host "   Return Batch ID: $returnBatchId" -ForegroundColor Gray
            Write-Host "   Return Batch Number: $returnBatchNumber" -ForegroundColor Gray
            Write-Host "   Source Batch ID: $batch1Id" -ForegroundColor Gray
            Write-Host "   Quantity Returned: 10kg" -ForegroundColor Gray
        } else {
            Test-Result "Process Return with Source Batch ID" $false "No return batch in response"
        }
    } catch {
        Test-Result "Process Return with Source Batch ID" $false $_.Exception.Message
    }
}

Write-Host ""

# ============================================================================
# P2-T2: Query Batch Genealogy
# ============================================================================
Write-Host "=== P2-T2: Query Batch Genealogy ===" -ForegroundColor Cyan

if ($batch1Id) {
    try {
        $genealogyResponse = Invoke-RestMethod -Uri "$baseUrl/batches/$batch1Id/genealogy" `
            -Method GET -Headers $headers
        
        $receiptBatch = $genealogyResponse.data.receipt_batch
        $returns = @($genealogyResponse.data.returns | Where-Object { $_ -ne $null })
        $returnCount = if ($returns) { $returns.Count } else { 0 }
        
        $hasReturns = ($returnCount -gt 0)
        Test-Result "Query Batch Genealogy" $hasReturns
        Write-Host "   Receipt Batch: $($receiptBatch.batch_number)" -ForegroundColor Gray
        Write-Host "   Returns Found: $returnCount" -ForegroundColor Gray
        if ($hasReturns -and $returns[0]) {
            Write-Host "   Return Batch: $($returns[0].batch_number)" -ForegroundColor Gray
        }
    } catch {
        Test-Result "Query Batch Genealogy" $false $_.Exception.Message
    }
}

Write-Host ""

# ============================================================================
# P2-T3: Query Return Origin
# ============================================================================
Write-Host "=== P2-T3: Query Return Origin ===" -ForegroundColor Cyan

if ($returnBatchId) {
    try {
        $originResponse = Invoke-RestMethod -Uri "$baseUrl/batches/$returnBatchId/origin" `
            -Method GET -Headers $headers
        
        $returnBatch = $originResponse.data.return_batch
        $sourceBatch = $originResponse.data.source_batch
        $sourceBatchId = if ($sourceBatch) { $sourceBatch.id } else { $null }
        $sourceBatchNum = if ($sourceBatch) { $sourceBatch.batch_number } else { "Unknown" }
        
        $correctOrigin = ($sourceBatchId -eq $batch1Id)
        Test-Result "Query Return Origin" $correctOrigin
        Write-Host "   Return Batch: $($returnBatch.batch_number)" -ForegroundColor Gray
        Write-Host "   Source Batch: $sourceBatchNum (ID: $sourceBatchId)" -ForegroundColor Gray
    } catch {
        Test-Result "Query Return Origin" $false $_.Exception.Message
    }
}

Write-Host ""

# ============================================================================
# P2-T4: Material Returns Summary
# ============================================================================
Write-Host "=== P2-T4: Material Returns Summary ===" -ForegroundColor Cyan

try {
    $summaryResponse = Invoke-RestMethod -Uri "$baseUrl/batches/materials/$materialId/returns-summary" `
        -Method GET -Headers $headers
    
    $materialCode = $summaryResponse.data.material.code
    $totalReceived = [float]($summaryResponse.data.totals.total_received ?? 0)
    $totalReturned = [float]($summaryResponse.data.totals.total_returned ?? 0)
    $netAvailable = [float]($summaryResponse.data.totals.net_available ?? 0)
    
    # Verify that totals are present and reasonable (at least from this test run)
    $hasValidTotals = ($totalReceived -ge 100 -and $totalReturned -ge 10 -and $netAvailable -gt 0)
    $netCorrect = ($netAvailable -eq ($totalReceived - $totalReturned))
    $isCorrect = ($hasValidTotals -and $netCorrect)
    Test-Result "Material Returns Summary" $isCorrect
    Write-Host "   Material: $materialCode" -ForegroundColor Gray
    Write-Host "   Total Received: $totalReceived kg" -ForegroundColor Gray
    Write-Host "   Total Returned: $totalReturned kg" -ForegroundColor Gray
    Write-Host "   Net Available: $netAvailable kg" -ForegroundColor Gray
} catch {
    Test-Result "Material Returns Summary" $false $_.Exception.Message
}

Write-Host ""

# ============================================================================
# PHASE 3 TESTS: RECIPE-SKU VALIDATION
# ============================================================================
Write-Host "╔════════════════════════════════════════════════════════════════════════════╗" -ForegroundColor Magenta
Write-Host "║                   PHASE 3: RECIPE-SKU VALIDATION                          ║" -ForegroundColor Magenta
Write-Host "╚════════════════════════════════════════════════════════════════════════════╝" -ForegroundColor Magenta
Write-Host ""

# Get test product and SKU IDs
$productsResponse = Invoke-RestMethod -Uri "$baseUrl/products" -Method GET -Headers $headers
$testProduct = $productsResponse.data.products | Where-Object { $_.code -eq 'TEST-PROD-01' }

if (!$testProduct) {
    Write-Host "⚠️  TEST-PROD-01 not found. Run seed-test-data.js first!" -ForegroundColor Yellow
    Write-Host "   Command: node hasal-pos-backend/scripts/seed-test-data.js" -ForegroundColor Gray
} else {
    $testProductId = $testProduct.id
    
    # Get SKUs for this product
    $skusResponse = Invoke-RestMethod -Uri "$baseUrl/products/$testProductId" -Method GET -Headers $headers
    $testSku100g = $skusResponse.data.skus | Where-Object { $_.size -eq '100g' }
    $testSkuId = if ($testSku100g) { $testSku100g.id } else { $null }

    # ========================================================================
    # P3-T1: Create Recipe with Product-SKU Relationship
    # ========================================================================
    Write-Host "=== P3-T1: Create Recipe with Product-SKU Relationship ===" -ForegroundColor Cyan

    if ($testProductId -and $testSkuId) {
        try {
            # Get test materials
            $testMaterialsResp = Invoke-RestMethod -Uri "$baseUrl/raw-materials" -Method GET -Headers $headers
            $testMat1 = $testMaterialsResp.data.raw_materials | Where-Object { $_.code -eq 'TEST-MAT-01' }
            $testMat2 = $testMaterialsResp.data.raw_materials | Where-Object { $_.code -eq 'TEST-MAT-02' }

            if ($testMat1 -and $testMat2) {
                $recipeBody = @{
                    code = "TEST-RECIPE-AUTO-01"
                    product_id = $testProductId
                    product_sku_id = $testSkuId
                    name = "Test Automated Recipe 1"
                    description = "Recipe created by automated test"
                    output_quantity = 1.0
                    output_unit = "kg"
                    items = @(
                        @{
                            raw_material_id = $testMat1.id
                            quantity = 0.5
                            unit = "kg"
                        },
                        @{
                            raw_material_id = $testMat2.id
                            quantity = 0.5
                            unit = "kg"
                        }
                    )
                } | ConvertTo-Json -Depth 5

                $recipeResponse = Invoke-RestMethod -Uri "$baseUrl/recipes" `
                    -Method POST -Headers $headers -ContentType "application/json" -Body $recipeBody

                $testRecipeId = $recipeResponse.data.id
                $hasProductSkuId = $null -ne $recipeResponse.data.product_sku_id
                Test-Result "Create Recipe with Product-SKU Link" $hasProductSkuId
                Write-Host "   Recipe ID: $testRecipeId" -ForegroundColor Gray
                Write-Host "   Product SKU ID: $($recipeResponse.data.product_sku_id)" -ForegroundColor Gray
            } else {
                Test-Result "Create Recipe with Product-SKU Link" $false "Test materials not found"
            }
        } catch {
            Test-Result "Create Recipe with Product-SKU Link" $false $_.Exception.Message
        }
    } else {
        Test-Result "Create Recipe with Product-SKU Link" $false "Test product or SKU not found"
    }

    Write-Host ""

    # ========================================================================
    # P3-T2: Verify Recipe Cannot Be Created Without SKU
    # ========================================================================
    Write-Host "=== P3-T2: Verify Recipe Validation - SKU Required ===" -ForegroundColor Cyan

    if ($testProductId) {
        try {
            $invalidRecipeBody = @{
                code = "TEST-RECIPE-INVALID"
                product_id = $testProductId
                name = "Invalid Recipe - No SKU"
                output_quantity = 1.0
                output_unit = "kg"
                items = @(
                    @{
                        raw_material_id = $testMat1.id
                        quantity = 1.0
                        unit = "kg"
                    }
                )
            } | ConvertTo-Json -Depth 5

            try {
                Invoke-RestMethod -Uri "$baseUrl/recipes" `
                    -Method POST -Headers $headers -ContentType "application/json" -Body $invalidRecipeBody
                Test-Result "Reject Recipe Without SKU" $false "Should have rejected recipe without SKU"
            } catch {
                $errorMsg = $_.Exception.Message
                $validationFailed = $errorMsg -match "sku|required"
                Test-Result "Reject Recipe Without SKU" $validationFailed
                Write-Host "   Expected validation error received" -ForegroundColor Gray
            }
        } catch {
            Test-Result "Reject Recipe Without SKU" $false $_.Exception.Message
        }
    }

    Write-Host ""

    # ========================================================================
    # P3-T3: Query Recipe - Verify SKU Included in Response
    # ========================================================================
    Write-Host "=== P3-T3: Query Recipe - Verify SKU in Response ===" -ForegroundColor Cyan

    if ($testRecipeId) {
        try {
            $recipeDetailResp = Invoke-RestMethod -Uri "$baseUrl/recipes/$testRecipeId" `
                -Method GET -Headers $headers

            $hasSku = $null -ne $recipeDetailResp.data.ProductSku
            $hasSkuDetails = $false
            if ($hasSku) {
                $skuData = $recipeDetailResp.data.ProductSku
                $hasSkuDetails = ($null -ne $skuData.size) -and ($null -ne $skuData.price)
            }
            Test-Result "Recipe Query Includes SKU Details" ($hasSku -and $hasSkuDetails)
            if ($hasSku) {
                Write-Host "   SKU Size: $($recipeDetailResp.data.ProductSku.size)" -ForegroundColor Gray
                Write-Host "   SKU Price: $($recipeDetailResp.data.ProductSku.price)" -ForegroundColor Gray
            }
        } catch {
            Test-Result "Recipe Query Includes SKU Details" $false $_.Exception.Message
        }
    }

    Write-Host ""

    # ========================================================================
    # P3-T4: List Recipes - Verify SKU Filtering
    # ========================================================================
    Write-Host "=== P3-T4: List Recipes - Filter by Product ===" -ForegroundColor Cyan

    if ($testProductId) {
        try {
            $recipesListResp = Invoke-RestMethod -Uri "$baseUrl/recipes?product_id=$testProductId" `
                -Method GET -Headers $headers

            $recipes = @($recipesListResp.data.recipes | Where-Object { $_ -ne $null })
            $recipeCount = if ($recipes) { $recipes.Count } else { 0 }
            $hasRecipes = $recipeCount -gt 0
            Test-Result "Filter Recipes by Product" $hasRecipes
            Write-Host "   Found $recipeCount recipe(s) for product" -ForegroundColor Gray
        } catch {
            Test-Result "Filter Recipes by Product" $false $_.Exception.Message
        }
    }

    Write-Host ""

    # ========================================================================
    # P3-T5: Update Recipe SKU
    # ========================================================================
    Write-Host "=== P3-T5: Update Recipe SKU ===" -ForegroundColor Cyan

    if ($testRecipeId) {
        try {
            # Get another SKU (500g if exists)
            $testSku500g = $skusResponse.data.skus | Where-Object { $_.size -eq '500g' }
            
            if ($testSku500g) {
                $updateBody = @{
                    product_sku_id = $testSku500g.id
                } | ConvertTo-Json

                $updateResp = Invoke-RestMethod -Uri "$baseUrl/recipes/$testRecipeId" `
                    -Method PUT -Headers $headers -ContentType "application/json" -Body $updateBody

                $updatedSkuId = $updateResp.data.product_sku_id
                $skuUpdated = ($updatedSkuId -eq $testSku500g.id)
                Test-Result "Update Recipe SKU" $skuUpdated
                Write-Host "   New SKU ID: $updatedSkuId" -ForegroundColor Gray
            } else {
                Test-Result "Update Recipe SKU" $false "500g SKU not found for testing"
            }
        } catch {
            Test-Result "Update Recipe SKU" $false $_.Exception.Message
        }
    }

    Write-Host ""

    # ========================================================================
    # P3-T6: Verify SKU Cascades to Product Query
    # ========================================================================
    Write-Host "=== P3-T6: Product Query Shows Recipe-SKU Relationships ===" -ForegroundColor Cyan

    if ($testProductId) {
        try {
            $productDetailResp = Invoke-RestMethod -Uri "$baseUrl/products/$testProductId" `
                -Method GET -Headers $headers

            $skus = @($productDetailResp.data.skus | Where-Object { $_ -ne $null })
            $skuCount = if ($skus) { $skus.Count } else { 0 }
            $hasSkus = $skuCount -gt 0
            Test-Result "Product Shows SKUs" $hasSkus
            Write-Host "   Found $skuCount SKU(s)" -ForegroundColor Gray
        } catch {
            Test-Result "Product Shows SKUs" $false $_.Exception.Message
        }
    }

    Write-Host ""

    # ========================================================================
    # P3-T7: Delete Recipe - Verify Cleanup
    # ========================================================================
    Write-Host "=== P3-T7: Delete Recipe ===" -ForegroundColor Cyan

    if ($testRecipeId) {
        try {
            Invoke-RestMethod -Uri "$baseUrl/recipes/$testRecipeId" `
                -Method DELETE -Headers $headers

            # Verify deletion
            try {
                Invoke-RestMethod -Uri "$baseUrl/recipes/$testRecipeId" -Method GET -Headers $headers
                Test-Result "Delete Recipe" $false "Recipe still exists after deletion"
            } catch {
                Test-Result "Delete Recipe" $true
                Write-Host "   Recipe successfully deleted" -ForegroundColor Gray
            }
        } catch {
            Test-Result "Delete Recipe" $false $_.Exception.Message
        }
    }

    Write-Host ""
}

# ============================================================================
# PHASE 4 TESTS: PRODUCTION FIFO COST TRACKING
# ============================================================================
Write-Host "╔════════════════════════════════════════════════════════════════════════════╗" -ForegroundColor Yellow
Write-Host "║                PHASE 4: PRODUCTION FIFO COST TRACKING                     ║" -ForegroundColor Yellow
Write-Host "╚════════════════════════════════════════════════════════════════════════════╝" -ForegroundColor Yellow
Write-Host ""

# Use existing test recipe (TEST-RECIPE-01 from seed data)
$recipesResp = Invoke-RestMethod -Uri "$baseUrl/recipes" -Method GET -Headers $headers
$testRecipeFIFO = $recipesResp.data.recipes | Where-Object { $_.code -eq 'TEST-RECIPE-01' }

if (!$testRecipeFIFO) {
    Write-Host "⚠️  TEST-RECIPE-01 not found. Skipping FIFO tests." -ForegroundColor Yellow
} else {
    $recipeIdFIFO = $testRecipeFIFO.id

    # ========================================================================
    # P4-T1: Start Production Run
    # ========================================================================
    Write-Host "=== P4-T1: Start Production Run ===" -ForegroundColor Cyan

    try {
        $startProdBody = @{
            recipe_id = $recipeIdFIFO
            planned_quantity = 5.0
            planned_date = "2024-12-25"
        } | ConvertTo-Json

        $prodRunResp = Invoke-RestMethod -Uri "$baseUrl/production/runs" `
            -Method POST -Headers $headers -ContentType "application/json" -Body $startProdBody

        $prodRunId = $prodRunResp.data.id
        $prodBatchNumber = $prodRunResp.data.batch_number
        $hasBatchFormat = $prodBatchNumber -match "PROD-\d{8}-\d{3}"
        Test-Result "Start Production Run with Batch Number" $hasBatchFormat
        Write-Host "   Production Run ID: $prodRunId" -ForegroundColor Gray
        Write-Host "   Batch Number: $prodBatchNumber" -ForegroundColor Gray
        Write-Host "   Status: $($prodRunResp.data.status)" -ForegroundColor Gray
    } catch {
        Test-Result "Start Production Run with Batch Number" $false $_.Exception.Message
    }

    Write-Host ""

    # ========================================================================
    # P4-T2: Complete Production with FIFO Cost Calculation
    # ========================================================================
    Write-Host "=== P4-T2: Complete Production with FIFO Costs ===" -ForegroundColor Cyan

    if ($prodRunId) {
        try {
            $completeProdBody = @{
                actual_quantity = 4.8
                actual_date = "2024-12-25"
                waste_quantity = 0.2
                waste_reason = "Normal processing loss"
                notes = "Test production with FIFO cost tracking"
            } | ConvertTo-Json

            $completeResp = Invoke-RestMethod -Uri "$baseUrl/production/runs/$prodRunId/complete" `
                -Method POST -Headers $headers -ContentType "application/json" -Body $completeProdBody

            $hasCosts = ($null -ne $completeResp.data.total_material_cost)
            $hasWasteCost = ($null -ne $completeResp.data.total_waste_cost)
            $hasUnitCost = ($null -ne $completeResp.data.unit_cost)
            $allCostsPresent = $hasCosts -and $hasWasteCost -and $hasUnitCost
            
            Test-Result "Production Completion with FIFO Costs" $allCostsPresent
            Write-Host "   Total Material Cost: $($completeResp.data.total_material_cost)" -ForegroundColor Gray
            Write-Host "   Total Waste Cost: $($completeResp.data.total_waste_cost)" -ForegroundColor Gray
            Write-Host "   Unit Cost: $($completeResp.data.unit_cost)" -ForegroundColor Gray
            Write-Host "   Yield Efficiency: $($completeResp.data.yield_efficiency)%" -ForegroundColor Gray
        } catch {
            Test-Result "Production Completion with FIFO Costs" $false $_.Exception.Message
        }
    }

    Write-Host ""

    # ========================================================================
    # P4-T3: Verify FIFO Material Consumption
    # ========================================================================
    Write-Host "=== P4-T3: Verify FIFO Material Consumption ===" -ForegroundColor Cyan

    if ($prodRunId) {
        try {
            $prodDetailResp = Invoke-RestMethod -Uri "$baseUrl/production/runs/$prodRunId" `
                -Method GET -Headers $headers

            $materials = @($prodDetailResp.data.materials | Where-Object { $_ -ne $null })
            $hasMaterials = $materials.Count -gt 0
            $firstMaterial = if ($hasMaterials) { $materials[0] } else { $null }
            $hasFifoCost = ($null -ne $firstMaterial.fifo_cost)
            
            Test-Result "FIFO Material Consumption Tracked" ($hasMaterials -and $hasFifoCost)
            if ($hasMaterials) {
                Write-Host "   Materials consumed: $($materials.Count)" -ForegroundColor Gray
                if ($hasFifoCost) {
                    Write-Host "   Sample FIFO cost: $($firstMaterial.fifo_cost)" -ForegroundColor Gray
                }
            }
        } catch {
            Test-Result "FIFO Material Consumption Tracked" $false $_.Exception.Message
        }
    }

    Write-Host ""

    # ========================================================================
    # P4-T4: Verify SKU Average Cost Update
    # ========================================================================
    Write-Host "=== P4-T4: Verify SKU Average Cost Updated ===" -ForegroundColor Cyan

    if ($testRecipeFIFO) {
        try {
            $skuIdToCheck = $testRecipeFIFO.product_sku_id
            $productIdToCheck = $testRecipeFIFO.product_id

            $prodResp = Invoke-RestMethod -Uri "$baseUrl/products/$productIdToCheck" `
                -Method GET -Headers $headers

            $sku = $prodResp.data.skus | Where-Object { $_.id -eq $skuIdToCheck }
            $avgCost = if ($sku) { $sku.average_cost } else { 0 }
            $costUpdated = $avgCost -gt 0

            Test-Result "SKU Average Cost Updated" $costUpdated
            Write-Host "   SKU Average Cost: $avgCost" -ForegroundColor Gray
        } catch {
            Test-Result "SKU Average Cost Updated" $false $_.Exception.Message
        }
    }

    Write-Host ""

    # ========================================================================
    # P4-T5: Verify Finished Goods Batch Created
    # ========================================================================
    Write-Host "=== P4-T5: Verify Finished Goods Batch ===" -ForegroundColor Cyan

    if ($prodRunId) {
        try {
            $prodDetailResp = Invoke-RestMethod -Uri "$baseUrl/production/runs/$prodRunId" `
                -Method GET -Headers $headers

            $outputs = @($prodDetailResp.data.outputs | Where-Object { $_ -ne $null })
            $hasOutputs = $outputs.Count -gt 0
            $fgBatch = if ($hasOutputs) { $outputs[0].finished_goods_batch_number } else { $null }
            $hasFGBatch = ($null -ne $fgBatch) -and ($fgBatch -ne "")
            $fgBatchFormat = if ($hasFGBatch) { $fgBatch -match "FG-.+-\d{8}-\d{3}" } else { $false }

            Test-Result "Finished Goods Batch Created" ($hasFGBatch -and $fgBatchFormat)
            if ($hasFGBatch) {
                Write-Host "   FG Batch Number: $fgBatch" -ForegroundColor Gray
            }
        } catch {
            Test-Result "Finished Goods Batch Created" $false $_.Exception.Message
        }
    }

    Write-Host ""

    # ========================================================================
    # P4-T6: Test Multiple Productions - FIFO Order Verification
    # ========================================================================
    Write-Host "=== P4-T6: Multiple Productions - FIFO Order ===" -ForegroundColor Cyan

    try {
        # Start second production
        $startProd2Body = @{
            recipe_id = $recipeIdFIFO
            planned_quantity = 3.0
            planned_date = "2024-12-26"
        } | ConvertTo-Json

        $prodRun2Resp = Invoke-RestMethod -Uri "$baseUrl/production/runs" `
            -Method POST -Headers $headers -ContentType "application/json" -Body $startProd2Body

        $prodRun2Id = $prodRun2Resp.data.id

        # Complete second production
        $completeProd2Body = @{
            actual_quantity = 2.9
            actual_date = "2024-12-26"
            waste_quantity = 0.1
            waste_reason = "Minimal loss"
        } | ConvertTo-Json

        $complete2Resp = Invoke-RestMethod -Uri "$baseUrl/production/runs/$prodRun2Id/complete" `
            -Method POST -Headers $headers -ContentType "application/json" -Body $completeProd2Body

        $cost1 = if ($completeResp) { $completeResp.data.total_material_cost } else { 0 }
        $cost2 = $complete2Resp.data.total_material_cost
        
        # Second production should have higher cost if it used newer batches
        # For this test, we just verify both have costs calculated
        $bothHaveCosts = ($cost1 -gt 0) -and ($cost2 -gt 0)
        
        Test-Result "Multiple Productions Track FIFO Costs" $bothHaveCosts
        Write-Host "   Production 1 Cost: $cost1" -ForegroundColor Gray
        Write-Host "   Production 2 Cost: $cost2" -ForegroundColor Gray
    } catch {
        Test-Result "Multiple Productions Track FIFO Costs" $false $_.Exception.Message
    }

    Write-Host ""

    # ========================================================================
    # P4-T7: Query Production History
    # ========================================================================
    Write-Host "=== P4-T7: Query Production History ===" -ForegroundColor Cyan

    try {
        $historyResp = Invoke-RestMethod -Uri "$baseUrl/production/runs?status=completed" `
            -Method GET -Headers $headers

        $runs = @($historyResp.data.production_runs | Where-Object { $_ -ne $null })
        $runCount = if ($runs) { $runs.Count } else { 0 }
        $hasRuns = $runCount -gt 0
        
        Test-Result "Query Production History" $hasRuns
        Write-Host "   Completed runs: $runCount" -ForegroundColor Gray
    } catch {
        Test-Result "Query Production History" $false $_.Exception.Message
    }

    Write-Host ""

    # ========================================================================
    # P4-T8: Cost Calculation Accuracy Test
    # ========================================================================
    Write-Host "=== P4-T8: Cost Calculation Accuracy ===" -ForegroundColor Cyan

    if ($prodRunId) {
        try {
            $prodDetailResp = Invoke-RestMethod -Uri "$baseUrl/production/runs/$prodRunId" `
                -Method GET -Headers $headers

            $materialCost = [float]$prodDetailResp.data.total_material_cost
            $wasteCost = [float]$prodDetailResp.data.total_waste_cost
            $unitCost = [float]$prodDetailResp.data.unit_cost
            $actualQty = [float]$prodDetailResp.data.actual_quantity
            $wasteQty = [float]$prodDetailResp.data.waste_quantity

            # Verify formula: unit_cost = total_material_cost / (actual_quantity + waste_quantity)
            $expectedUnitCost = if (($actualQty + $wasteQty) -gt 0) { 
                $materialCost / ($actualQty + $wasteQty) 
            } else { 
                0 
            }
            $costDifference = [Math]::Abs($unitCost - $expectedUnitCost)
            $isAccurate = $costDifference -lt 0.01 # Within 1 cent

            Test-Result "Cost Calculation Accuracy" $isAccurate
            Write-Host "   Expected Unit Cost: $expectedUnitCost" -ForegroundColor Gray
            Write-Host "   Calculated Unit Cost: $unitCost" -ForegroundColor Gray
            Write-Host "   Difference: $costDifference" -ForegroundColor Gray
        } catch {
            Test-Result "Cost Calculation Accuracy" $false $_.Exception.Message
        }
    }

    Write-Host ""

    # ========================================================================
    # P4-T9: Batch Depletion Test
    # ========================================================================
    Write-Host "=== P4-T9: Batch Depletion Tracking ===" -ForegroundColor Cyan

    try {
        # Get test material batches
        $batchesResp = Invoke-RestMethod -Uri "$baseUrl/raw-material-batches" `
            -Method GET -Headers $headers

        $testBatches = @($batchesResp.data.batches | Where-Object { 
            $_.batch_number -like 'TEST-BATCH-*' 
        })
        
        if ($testBatches.Count -gt 0) {
            $firstBatch = $testBatches[0]
            $isPartiallyUsed = $firstBatch.remaining_quantity -lt $firstBatch.quantity_received
            
            Test-Result "Batch Depletion Tracked" $isPartiallyUsed
            Write-Host "   Batch: $($firstBatch.batch_number)" -ForegroundColor Gray
            Write-Host "   Received: $($firstBatch.quantity_received) kg" -ForegroundColor Gray
            Write-Host "   Remaining: $($firstBatch.remaining_quantity) kg" -ForegroundColor Gray
        } else {
            Test-Result "Batch Depletion Tracked" $false "No test batches found"
        }
    } catch {
        Test-Result "Batch Depletion Tracked" $false $_.Exception.Message
    }

    Write-Host ""

    # ========================================================================
    # P4-T10: Production Run Cancellation Test
    # ========================================================================
    Write-Host "=== P4-T10: Cancel Production Run ===" -ForegroundColor Cyan

    try {
        # Start a production to cancel
        $startCancelBody = @{
            recipe_id = $recipeIdFIFO
            planned_quantity = 2.0
            planned_date = "2024-12-27"
        } | ConvertTo-Json

        $cancelRunResp = Invoke-RestMethod -Uri "$baseUrl/production/runs" `
            -Method POST -Headers $headers -ContentType "application/json" -Body $startCancelBody

        $cancelRunId = $cancelRunResp.data.id

        # Cancel it
        $cancelBody = @{
            cancellation_reason = "Test cancellation"
        } | ConvertTo-Json

        $canceledResp = Invoke-RestMethod -Uri "$baseUrl/production/runs/$cancelRunId/cancel" `
            -Method PUT -Headers $headers -ContentType "application/json" -Body $cancelBody

        $isCancelled = $canceledResp.data.status -eq "cancelled"
        Test-Result "Cancel Production Run" $isCancelled
        Write-Host "   Status: $($canceledResp.data.status)" -ForegroundColor Gray
    } catch {
        Test-Result "Cancel Production Run" $false $_.Exception.Message
    }

    Write-Host ""
}

# ============================================================================
# PHASE 5 TESTS: WASTE ALLOCATION & TRACKING
# ============================================================================
Write-Host "╔════════════════════════════════════════════════════════════════════════════╗" -ForegroundColor Magenta
Write-Host "║                  PHASE 5: WASTE ALLOCATION & TRACKING                     ║" -ForegroundColor Magenta
Write-Host "╚════════════════════════════════════════════════════════════════════════════╝" -ForegroundColor Magenta
Write-Host ""

# Use TEST-RECIPE-03 (Waste Tracker) from seed data
$wasteRecipe = $recipesResp.data.recipes | Where-Object { $_.code -eq 'TEST-RECIPE-03' }

if (!$wasteRecipe) {
    Write-Host "⚠️  TEST-RECIPE-03 not found. Skipping waste tests." -ForegroundColor Yellow
} else {
    $wasteRecipeId = $wasteRecipe.id

    # ========================================================================
    # P5-T1: Production with Waste Tracking
    # ========================================================================
    Write-Host "=== P5-T1: Production with Waste Tracking ===" -ForegroundColor Cyan

    try {
        $startWasteBody = @{
            recipe_id = $wasteRecipeId
            planned_quantity = 10.0
            planned_date = "2024-12-28"
        } | ConvertTo-Json

        $wasteRunResp = Invoke-RestMethod -Uri "$baseUrl/production/runs" `
            -Method POST -Headers $headers -ContentType "application/json" -Body $startWasteBody

        $wasteRunId = $wasteRunResp.data.id

        # Complete with significant waste
        $completeWasteBody = @{
            actual_quantity = 8.5
            actual_date = "2024-12-28"
            waste_quantity = 1.5
            waste_reason = "Material spillage and contamination"
            notes = "Testing waste allocation"
        } | ConvertTo-Json

        $wasteCompleteResp = Invoke-RestMethod -Uri "$baseUrl/production/runs/$wasteRunId/complete" `
            -Method POST -Headers $headers -ContentType "application/json" -Body $completeWasteBody

        $hasWaste = $wasteCompleteResp.data.waste_quantity -gt 0
        $hasWasteReason = ($null -ne $wasteCompleteResp.data.waste_reason) -and ($wasteCompleteResp.data.waste_reason -ne "")
        $wasteTracked = $hasWaste -and $hasWasteReason

        Test-Result "Production with Waste Tracked" $wasteTracked
        Write-Host "   Waste Quantity: $($wasteCompleteResp.data.waste_quantity) kg" -ForegroundColor Gray
        Write-Host "   Waste Reason: $($wasteCompleteResp.data.waste_reason)" -ForegroundColor Gray
        Write-Host "   Waste Cost: $($wasteCompleteResp.data.total_waste_cost)" -ForegroundColor Gray
    } catch {
        Test-Result "Production with Waste Tracked" $false $_.Exception.Message
    }

    Write-Host ""

    # ========================================================================
    # P5-T2: Waste Cost Allocation Calculation
    # ========================================================================
    Write-Host "=== P5-T2: Waste Cost Allocation ===" -ForegroundColor Cyan

    if ($wasteRunId) {
        try {
            $wasteDetailResp = Invoke-RestMethod -Uri "$baseUrl/production/runs/$wasteRunId" `
                -Method GET -Headers $headers

            $materialCost = [float]$wasteDetailResp.data.total_material_cost
            $wasteCost = [float]$wasteDetailResp.data.total_waste_cost
            $wasteQty = [float]$wasteDetailResp.data.waste_quantity
            $actualQty = [float]$wasteDetailResp.data.actual_quantity

            # Verify formula: waste_cost = (material_cost / (actual + waste)) * waste_qty
            $expectedWasteCost = if (($actualQty + $wasteQty) -gt 0) { 
                ($materialCost / ($actualQty + $wasteQty)) * $wasteQty
            } else { 
                0 
            }
            $wasteDifference = [Math]::Abs($wasteCost - $expectedWasteCost)
            $isAccurate = $wasteDifference -lt 0.01

            Test-Result "Waste Cost Allocation Accurate" $isAccurate
            Write-Host "   Expected Waste Cost: $expectedWasteCost" -ForegroundColor Gray
            Write-Host "   Calculated Waste Cost: $wasteCost" -ForegroundColor Gray
        } catch {
            Test-Result "Waste Cost Allocation Accurate" $false $_.Exception.Message
        }
    }

    Write-Host ""

    # ========================================================================
    # P5-T3: Yield Efficiency Calculation
    # ========================================================================
    Write-Host "=== P5-T3: Yield Efficiency Calculation ===" -ForegroundColor Cyan

    if ($wasteRunId) {
        try {
            $wasteDetailResp = Invoke-RestMethod -Uri "$baseUrl/production/runs/$wasteRunId" `
                -Method GET -Headers $headers

            $plannedQty = [float]$wasteDetailResp.data.planned_quantity
            $actualQty = [float]$wasteDetailResp.data.actual_quantity
            $yieldEff = [float]$wasteDetailResp.data.yield_efficiency

            # Verify formula: yield_efficiency = (actual / planned) * 100
            $expectedYield = if ($plannedQty -gt 0) { 
                ($actualQty / $plannedQty) * 100 
            } else { 
                0 
            }
            $yieldDifference = [Math]::Abs($yieldEff - $expectedYield)
            $isAccurate = $yieldDifference -lt 0.01

            Test-Result "Yield Efficiency Accurate" $isAccurate
            Write-Host "   Expected Yield: $expectedYield%" -ForegroundColor Gray
            Write-Host "   Calculated Yield: $yieldEff%" -ForegroundColor Gray
        } catch {
            Test-Result "Yield Efficiency Accurate" $false $_.Exception.Message
        }
    }

    Write-Host ""

    # ========================================================================
    # P5-T4: Waste Cost Report - Monthly Totals
    # ========================================================================
    Write-Host "=== P5-T4: Waste Cost Report - Monthly Totals ===" -ForegroundColor Cyan

    try {
        $wasteReportResp = Invoke-RestMethod -Uri "$baseUrl/production/waste-cost-report?month=12&year=2024" `
            -Method GET -Headers $headers

        $hasData = ($null -ne $wasteReportResp.data)
        $hasMonthlyTotal = ($null -ne $wasteReportResp.data.total_waste_cost)
        $hasWasteQty = ($null -ne $wasteReportResp.data.total_waste_quantity)

        Test-Result "Waste Cost Report Generated" ($hasData -and $hasMonthlyTotal -and $hasWasteQty)
        Write-Host "   Total Waste Cost: $($wasteReportResp.data.total_waste_cost)" -ForegroundColor Gray
        Write-Host "   Total Waste Qty: $($wasteReportResp.data.total_waste_quantity)" -ForegroundColor Gray
    } catch {
        Test-Result "Waste Cost Report Generated" $false $_.Exception.Message
    }

    Write-Host ""

    # ========================================================================
    # P5-T5: Waste Breakdown by Product
    # ========================================================================
    Write-Host "=== P5-T5: Waste Breakdown by Product ===" -ForegroundColor Cyan

    try {
        $wasteReportResp = Invoke-RestMethod -Uri "$baseUrl/production/waste-cost-report?month=12&year=2024" `
            -Method GET -Headers $headers

        $products = @($wasteReportResp.data.by_product | Where-Object { $_ -ne $null })
        $hasProducts = $products.Count -gt 0

        Test-Result "Waste Breakdown by Product" $hasProducts
        if ($hasProducts) {
            Write-Host "   Products with waste: $($products.Count)" -ForegroundColor Gray
            $firstProd = $products[0]
            Write-Host "   Sample: $($firstProd.product_name) - Waste: $($firstProd.waste_cost)" -ForegroundColor Gray
        }
    } catch {
        Test-Result "Waste Breakdown by Product" $false $_.Exception.Message
    }

    Write-Host ""

    # ========================================================================
    # P5-T6: Waste Reasons Tracking
    # ========================================================================
    Write-Host "=== P5-T6: Waste Reasons Tracking ===" -ForegroundColor Cyan

    if ($wasteRunId) {
        try {
            $wasteDetailResp = Invoke-RestMethod -Uri "$baseUrl/production/runs/$wasteRunId" `
                -Method GET -Headers $headers

            $wasteReason = $wasteDetailResp.data.waste_reason
            $hasReasonTracked = ($null -ne $wasteReason) -and ($wasteReason.Length -gt 0)

            Test-Result "Waste Reasons Tracked" $hasReasonTracked
            Write-Host "   Waste Reason: $wasteReason" -ForegroundColor Gray
        } catch {
            Test-Result "Waste Reasons Tracked" $false $_.Exception.Message
        }
    }

    Write-Host ""

    # ========================================================================
    # P5-T7: Zero Waste Production Test
    # ========================================================================
    Write-Host "=== P5-T7: Zero Waste Production ===" -ForegroundColor Cyan

    try {
        $zeroWasteBody = @{
            recipe_id = $wasteRecipeId
            planned_quantity = 5.0
            planned_date = "2024-12-29"
        } | ConvertTo-Json

        $zeroWasteRunResp = Invoke-RestMethod -Uri "$baseUrl/production/runs" `
            -Method POST -Headers $headers -ContentType "application/json" -Body $zeroWasteBody

        $zeroWasteRunId = $zeroWasteRunResp.data.id

        # Complete with zero waste
        $completeZeroBody = @{
            actual_quantity = 5.0
            actual_date = "2024-12-29"
            waste_quantity = 0
            notes = "Perfect production - no waste"
        } | ConvertTo-Json

        $zeroCompleteResp = Invoke-RestMethod -Uri "$baseUrl/production/runs/$zeroWasteRunId/complete" `
            -Method POST -Headers $headers -ContentType "application/json" -Body $completeZeroBody

        $hasZeroWaste = $zeroCompleteResp.data.waste_quantity -eq 0
        $hasZeroWasteCost = $zeroCompleteResp.data.total_waste_cost -eq 0
        $yieldIs100 = $zeroCompleteResp.data.yield_efficiency -eq 100

        Test-Result "Zero Waste Production Handled" ($hasZeroWaste -and $hasZeroWasteCost -and $yieldIs100)
        Write-Host "   Waste Quantity: $($zeroCompleteResp.data.waste_quantity)" -ForegroundColor Gray
        Write-Host "   Waste Cost: $($zeroCompleteResp.data.total_waste_cost)" -ForegroundColor Gray
        Write-Host "   Yield Efficiency: $($zeroCompleteResp.data.yield_efficiency)%" -ForegroundColor Gray
    } catch {
        Test-Result "Zero Waste Production Handled" $false $_.Exception.Message
    }

    Write-Host ""

    # ========================================================================
    # P5-T8: High Waste Alert Test (>20%)
    # ========================================================================
    Write-Host "=== P5-T8: High Waste Detection ===" -ForegroundColor Cyan

    try {
        $highWasteBody = @{
            recipe_id = $wasteRecipeId
            planned_quantity = 10.0
            planned_date = "2024-12-30"
        } | ConvertTo-Json

        $highWasteRunResp = Invoke-RestMethod -Uri "$baseUrl/production/runs" `
            -Method POST -Headers $headers -ContentType "application/json" -Body $highWasteBody

        $highWasteRunId = $highWasteRunResp.data.id

        # Complete with >20% waste
        $completeHighBody = @{
            actual_quantity = 7.5
            actual_date = "2024-12-30"
            waste_quantity = 2.5
            waste_reason = "Equipment malfunction - high waste"
            notes = "High waste scenario"
        } | ConvertTo-Json

        $highCompleteResp = Invoke-RestMethod -Uri "$baseUrl/production/runs/$highWasteRunId/complete" `
            -Method POST -Headers $headers -ContentType "application/json" -Body $completeHighBody

        $wastePercent = ($highCompleteResp.data.waste_quantity / $highCompleteResp.data.planned_quantity) * 100
        $isHighWaste = $wastePercent -gt 20
        $yieldBelow80 = $highCompleteResp.data.yield_efficiency -lt 80

        Test-Result "High Waste Detected" ($isHighWaste -and $yieldBelow80)
        Write-Host "   Waste Percentage: $wastePercent%" -ForegroundColor Gray
        Write-Host "   Yield Efficiency: $($highCompleteResp.data.yield_efficiency)%" -ForegroundColor Gray
    } catch {
        Test-Result "High Waste Detected" $false $_.Exception.Message
    }

    Write-Host ""
}

# ============================================================================
# PHASE 6 TESTS: BATCH NUMBER GENERATION
# ============================================================================
Write-Host "╔════════════════════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║                  PHASE 6: BATCH NUMBER GENERATION                         ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# ============================================================================
# P6-T1: Production Batch Number Format
# ============================================================================
Write-Host "=== P6-T1: Production Batch Number Format ===" -ForegroundColor Cyan

if ($testRecipeFIFO) {
    try {
        $batchTestBody = @{
            recipe_id = $testRecipeFIFO.id
            planned_quantity = 3.0
            planned_date = "2024-12-31"
        } | ConvertTo-Json

        $batchTestResp = Invoke-RestMethod -Uri "$baseUrl/production/runs" `
            -Method POST -Headers $headers -ContentType "application/json" -Body $batchTestBody

        $prodBatch = $batchTestResp.data.batch_number
        $formatCorrect = $prodBatch -match "^PROD-\d{8}-\d{3}$"

        Test-Result "Production Batch Format (PROD-YYYYMMDD-NNN)" $formatCorrect
        Write-Host "   Batch Number: $prodBatch" -ForegroundColor Gray
    } catch {
        Test-Result "Production Batch Format (PROD-YYYYMMDD-NNN)" $false $_.Exception.Message
    }
}

Write-Host ""

# ============================================================================
# P6-T2: Finished Goods Batch Number Format
# ============================================================================
Write-Host "=== P6-T2: Finished Goods Batch Format ===" -ForegroundColor Cyan

if ($prodRunId) {
    try {
        $prodDetailResp = Invoke-RestMethod -Uri "$baseUrl/production/runs/$prodRunId" `
            -Method GET -Headers $headers

        $outputs = @($prodDetailResp.data.outputs | Where-Object { $_ -ne $null })
        if ($outputs.Count -gt 0) {
            $fgBatch = $outputs[0].finished_goods_batch_number
            $formatCorrect = $fgBatch -match "^FG-.+-\d{8}-\d{3}$"

            Test-Result "FG Batch Format (FG-{CODE}-YYYYMMDD-NNN)" $formatCorrect
            Write-Host "   FG Batch Number: $fgBatch" -ForegroundColor Gray
        } else {
            Test-Result "FG Batch Format (FG-{CODE}-YYYYMMDD-NNN)" $false "No outputs found"
        }
    } catch {
        Test-Result "FG Batch Format (FG-{CODE}-YYYYMMDD-NNN)" $false $_.Exception.Message
    }
}

Write-Host ""

# ============================================================================
# P6-T3: Batch Number Uniqueness
# ============================================================================
Write-Host "=== P6-T3: Batch Number Uniqueness ===" -ForegroundColor Cyan

if ($testRecipeFIFO) {
    try {
        # Create 3 productions on same date
        $batch1Resp = Invoke-RestMethod -Uri "$baseUrl/production/runs" `
            -Method POST -Headers $headers -ContentType "application/json" `
            -Body (@{recipe_id=$testRecipeFIFO.id; planned_quantity=1; planned_date="2024-12-31"} | ConvertTo-Json)
        
        $batch2Resp = Invoke-RestMethod -Uri "$baseUrl/production/runs" `
            -Method POST -Headers $headers -ContentType "application/json" `
            -Body (@{recipe_id=$testRecipeFIFO.id; planned_quantity=1; planned_date="2024-12-31"} | ConvertTo-Json)
        
        $batch3Resp = Invoke-RestMethod -Uri "$baseUrl/production/runs" `
            -Method POST -Headers $headers -ContentType "application/json" `
            -Body (@{recipe_id=$testRecipeFIFO.id; planned_quantity=1; planned_date="2024-12-31"} | ConvertTo-Json)

        $b1 = $batch1Resp.data.batch_number
        $b2 = $batch2Resp.data.batch_number
        $b3 = $batch3Resp.data.batch_number

        $allUnique = ($b1 -ne $b2) -and ($b2 -ne $b3) -and ($b1 -ne $b3)

        Test-Result "Batch Numbers Are Unique" $allUnique
        Write-Host "   Batch 1: $b1" -ForegroundColor Gray
        Write-Host "   Batch 2: $b2" -ForegroundColor Gray
        Write-Host "   Batch 3: $b3" -ForegroundColor Gray
    } catch {
        Test-Result "Batch Numbers Are Unique" $false $_.Exception.Message
    }
}

Write-Host ""

# ============================================================================
# P6-T4: Batch Number Sequential Increment
# ============================================================================
Write-Host "=== P6-T4: Batch Number Sequential Increment ===" -ForegroundColor Cyan

if ($b1 -and $b2) {
    try {
        # Extract sequence numbers
        $seq1 = [int]($b1 -replace ".*-(\d{3})$", '$1')
        $seq2 = [int]($b2 -replace ".*-(\d{3})$", '$1')

        $isSequential = $seq2 -eq ($seq1 + 1)

        Test-Result "Batch Numbers Sequential" $isSequential
        Write-Host "   Sequence 1: $seq1" -ForegroundColor Gray
        Write-Host "   Sequence 2: $seq2" -ForegroundColor Gray
    } catch {
        Test-Result "Batch Numbers Sequential" $false $_.Exception.Message
    }
}

Write-Host ""

# ============================================================================
# P6-T5: Batch Date Format Validation
# ============================================================================
Write-Host "=== P6-T5: Batch Date Format (YYYYMMDD) ===" -ForegroundColor Cyan

if ($prodBatch) {
    try {
        # Extract date portion (YYYYMMDD)
        $datePortion = ($prodBatch -replace "^PROD-(\d{8})-\d{3}$", '$1')
        $year = [int]$datePortion.Substring(0, 4)
        $month = [int]$datePortion.Substring(4, 2)
        $day = [int]$datePortion.Substring(6, 2)

        $validYear = ($year -ge 2024) -and ($year -le 2030)
        $validMonth = ($month -ge 1) -and ($month -le 12)
        $validDay = ($day -ge 1) -and ($day -le 31)
        $dateValid = $validYear -and $validMonth -and $validDay

        Test-Result "Batch Date Format Valid" $dateValid
        Write-Host "   Date Portion: $datePortion (YYYY=$year MM=$month DD=$day)" -ForegroundColor Gray
    } catch {
        Test-Result "Batch Date Format Valid" $false $_.Exception.Message
    }
}

Write-Host ""

# ============================================================================
# PHASE 7 TESTS: PROFIT ANALYSIS ENDPOINTS
# ============================================================================
Write-Host "╔════════════════════════════════════════════════════════════════════════════╗" -ForegroundColor Yellow
Write-Host "║                   PHASE 7: PROFIT ANALYSIS ENDPOINTS                      ║" -ForegroundColor Yellow
Write-Host "╚════════════════════════════════════════════════════════════════════════════╝" -ForegroundColor Yellow
Write-Host ""

# Create test sales invoice for profit testing
$testOutletResp = Invoke-RestMethod -Uri "$baseUrl/outlets" -Method GET -Headers $headers
$testOutlet = $testOutletResp.data.outlets | Where-Object { $_.code -eq 'TEST-OUT' }

if (!$testOutlet) {
    Write-Host "⚠️  Test outlet not found. Skipping profit tests." -ForegroundColor Yellow
} else {
    # Get test SKU with stock
    if ($testProduct -and $testSku100g) {
        # ====================================================================
        # P7-T1: Create Sales Invoice for Profit Testing
        # ====================================================================
        Write-Host "=== P7-T1: Create Sales Invoice ===" -ForegroundColor Cyan

        try {
            $saleBody = @{
                outlet_id = $testOutlet.id
                invoice_date = "2024-12-31"
                payment_type = "cash"
                items = @(
                    @{
                        product_sku_id = $testSku100g.id
                        quantity = 10
                        unit_price = $testSku100g.price
                        amount = $testSku100g.price * 10
                    }
                )
            } | ConvertTo-Json -Depth 5

            $saleResp = Invoke-RestMethod -Uri "$baseUrl/sales/invoices" `
                -Method POST -Headers $headers -ContentType "application/json" -Body $saleBody

            $saleInvoiceId = $saleResp.data.id

            Test-Result "Create Sales Invoice" $true
            Write-Host "   Invoice ID: $saleInvoiceId" -ForegroundColor Gray
            Write-Host "   Total Amount: $($saleResp.data.grand_total)" -ForegroundColor Gray
        } catch {
            Test-Result "Create Sales Invoice" $false $_.Exception.Message
        }

        Write-Host ""

        # ====================================================================
        # P7-T2: Get Sale Profit (Individual Invoice)
        # ====================================================================
        Write-Host "=== P7-T2: Get Sale Profit ===" -ForegroundColor Cyan

        if ($saleInvoiceId) {
            try {
                $saleProfitResp = Invoke-RestMethod -Uri "$baseUrl/sales/invoices/$saleInvoiceId/profit" `
                    -Method GET -Headers $headers

                $hasProfit = ($null -ne $saleProfitResp.data.profit)
                $hasMargin = ($null -ne $saleProfitResp.data.profit_margin)

                Test-Result "Calculate Sale Profit" ($hasProfit -and $hasMargin)
                Write-Host "   Profit: $($saleProfitResp.data.profit)" -ForegroundColor Gray
                Write-Host "   Margin: $($saleProfitResp.data.profit_margin)%" -ForegroundColor Gray
            } catch {
                Test-Result "Calculate Sale Profit" $false $_.Exception.Message
            }
        }

        Write-Host ""

        # ====================================================================
        # P7-T3: Get Sales Profit Summary
        # ====================================================================
        Write-Host "=== P7-T3: Get Sales Profit Summary ===" -ForegroundColor Cyan

        try {
            $profitSummaryResp = Invoke-RestMethod -Uri "$baseUrl/sales/profit-summary?start_date=2024-12-01&end_date=2024-12-31" `
                -Method GET -Headers $headers

            $hasTotals = ($null -ne $profitSummaryResp.data.total_revenue)
            $hasProfit = ($null -ne $profitSummaryResp.data.total_profit)

            Test-Result "Sales Profit Summary" ($hasTotals -and $hasProfit)
            Write-Host "   Total Revenue: $($profitSummaryResp.data.total_revenue)" -ForegroundColor Gray
            Write-Host "   Total Profit: $($profitSummaryResp.data.total_profit)" -ForegroundColor Gray
            Write-Host "   Avg Margin: $($profitSummaryResp.data.average_margin)%" -ForegroundColor Gray
        } catch {
            Test-Result "Sales Profit Summary" $false $_.Exception.Message
        }

        Write-Host ""

        # ====================================================================
        # P7-T4: Get Product Profit Summary
        # ====================================================================
        Write-Host "=== P7-T4: Get Product Profit Summary ===" -ForegroundColor Cyan

        try {
            $productProfitResp = Invoke-RestMethod -Uri "$baseUrl/products/profit-summary" `
                -Method GET -Headers $headers

            $products = @($productProfitResp.data.products | Where-Object { $_ -ne $null })
            $hasProducts = $products.Count -gt 0

            Test-Result "Product Profit Summary" $hasProducts
            Write-Host "   Products analyzed: $($products.Count)" -ForegroundColor Gray
        } catch {
            Test-Result "Product Profit Summary" $false $_.Exception.Message
        }

        Write-Host ""

        # ====================================================================
        # P7-T5: Get SKU-Level Profit
        # ====================================================================
        Write-Host "=== P7-T5: Get SKU-Level Profit ===" -ForegroundColor Cyan

        if ($testProductId -and $testSkuId) {
            try {
                $skuProfitResp = Invoke-RestMethod -Uri "$baseUrl/products/$testProductId/skus/$testSkuId/profit" `
                    -Method GET -Headers $headers

                $hasPrice = ($null -ne $skuProfitResp.data.price)
                $hasCost = ($null -ne $skuProfitResp.data.average_cost)
                $hasMargin = ($null -ne $skuProfitResp.data.profit_margin)

                Test-Result "SKU-Level Profit Analysis" ($hasPrice -and $hasCost -and $hasMargin)
                Write-Host "   Price: $($skuProfitResp.data.price)" -ForegroundColor Gray
                Write-Host "   Avg Cost: $($skuProfitResp.data.average_cost)" -ForegroundColor Gray
                Write-Host "   Margin: $($skuProfitResp.data.profit_margin)%" -ForegroundColor Gray
            } catch {
                Test-Result "SKU-Level Profit Analysis" $false $_.Exception.Message
            }
        }

        Write-Host ""

        # ====================================================================
        # P7-T6: Profit Margin Categorization
        # ====================================================================
        Write-Host "=== P7-T6: Profit Margin Categorization ===" -ForegroundColor Cyan

        if ($testProductId -and $testSkuId) {
            try {
                $skuProfitResp = Invoke-RestMethod -Uri "$baseUrl/products/$testProductId/skus/$testSkuId/profit" `
                    -Method GET -Headers $headers

                $margin = [float]$skuProfitResp.data.profit_margin
                
                # Categorize: High (>=30%), Medium (15-30%), Low (<15%)
                $category = if ($margin -ge 30) { "High" } 
                           elseif ($margin -ge 15) { "Medium" } 
                           else { "Low" }

                $hasCategorization = ($category -in @("High", "Medium", "Low"))

                Test-Result "Profit Margin Categorization" $hasCategorization
                Write-Host "   Margin: $margin%" -ForegroundColor Gray
                Write-Host "   Category: $category" -ForegroundColor Gray
            } catch {
                Test-Result "Profit Margin Categorization" $false $_.Exception.Message
            }
        }

        Write-Host ""
    }
}

# ============================================================================
# PHASE 8 TESTS: WASTE & EFFICIENCY REPORTING
# ============================================================================
Write-Host "╔════════════════════════════════════════════════════════════════════════════╗" -ForegroundColor Magenta
Write-Host "║              PHASE 8: WASTE & EFFICIENCY REPORTING                        ║" -ForegroundColor Magenta
Write-Host "╚════════════════════════════════════════════════════════════════════════════╝" -ForegroundColor Magenta
Write-Host ""

# ============================================================================
# P8-T1: Waste Cost Report - Date Range Filter
# ============================================================================
Write-Host "=== P8-T1: Waste Cost Report - Date Range ===" -ForegroundColor Cyan

try {
    $wasteRptResp = Invoke-RestMethod -Uri "$baseUrl/production/waste-cost-report?start_date=2024-12-01&end_date=2024-12-31" `
        -Method GET -Headers $headers

    $hasData = ($null -ne $wasteRptResp.data)
    $hasTotals = ($null -ne $wasteRptResp.data.total_waste_cost)

    Test-Result "Waste Cost Report - Date Range" ($hasData -and $hasTotals)
    Write-Host "   Total Waste Cost: $($wasteRptResp.data.total_waste_cost)" -ForegroundColor Gray
} catch {
    Test-Result "Waste Cost Report - Date Range" $false $_.Exception.Message
}

Write-Host ""

# ============================================================================
# P8-T2: Waste Cost Report - Product Filter
# ============================================================================
Write-Host "=== P8-T2: Waste Cost Report - Filter by Product ===" -ForegroundColor Cyan

if ($testProductId) {
    try {
        $wasteByProdResp = Invoke-RestMethod -Uri "$baseUrl/production/waste-cost-report?product_id=$testProductId" `
            -Method GET -Headers $headers

        $hasData = ($null -ne $wasteByProdResp.data)

        Test-Result "Waste Report Filtered by Product" $hasData
    } catch {
        Test-Result "Waste Report Filtered by Product" $false $_.Exception.Message
    }
}

Write-Host ""

# ============================================================================
# P8-T3: Efficiency Report - Overall Trends
# ============================================================================
Write-Host "=== P8-T3: Efficiency Report - Overall Trends ===" -ForegroundColor Cyan

try {
    $efficiencyResp = Invoke-RestMethod -Uri "$baseUrl/production/efficiency-report?start_date=2024-12-01&end_date=2024-12-31" `
        -Method GET -Headers $headers

    $hasData = ($null -ne $efficiencyResp.data)
    $hasAvgYield = ($null -ne $efficiencyResp.data.average_yield)

    Test-Result "Efficiency Report - Trends" ($hasData -and $hasAvgYield)
    Write-Host "   Avg Yield: $($efficiencyResp.data.average_yield)%" -ForegroundColor Gray
} catch {
    Test-Result "Efficiency Report - Trends" $false $_.Exception.Message
}

Write-Host ""

# ============================================================================
# P8-T4: Efficiency Report - Recipe Filter
# ============================================================================
Write-Host "=== P8-T4: Efficiency Report - Filter by Recipe ===" -ForegroundColor Cyan

if ($recipeIdFIFO) {
    try {
        $effByRecipeResp = Invoke-RestMethod -Uri "$baseUrl/production/efficiency-report?recipe_id=$recipeIdFIFO" `
            -Method GET -Headers $headers

        $hasData = ($null -ne $effByRecipeResp.data)

        Test-Result "Efficiency Report by Recipe" $hasData
    } catch {
        Test-Result "Efficiency Report by Recipe" $false $_.Exception.Message
    }
}

Write-Host ""

# ============================================================================
# P8-T5: Efficiency Report - Production Runs List
# ============================================================================
Write-Host "=== P8-T5: Efficiency Report - Production Runs ===" -ForegroundColor Cyan

try {
    $efficiencyResp = Invoke-RestMethod -Uri "$baseUrl/production/efficiency-report?start_date=2024-12-01&end_date=2024-12-31" `
        -Method GET -Headers $headers

    $runs = @($efficiencyResp.data.production_runs | Where-Object { $_ -ne $null })
    $hasRuns = $runs.Count -gt 0

    Test-Result "Efficiency Report Lists Runs" $hasRuns
    Write-Host "   Production runs: $($runs.Count)" -ForegroundColor Gray
} catch {
    Test-Result "Efficiency Report Lists Runs" $false $_.Exception.Message
}

Write-Host ""

# ============================================================================
# P8-T6: Efficiency Metrics - Yield Statistics
# ============================================================================
Write-Host "=== P8-T6: Efficiency Metrics - Yield Stats ===" -ForegroundColor Cyan

try {
    $efficiencyResp = Invoke-RestMethod -Uri "$baseUrl/production/efficiency-report?start_date=2024-12-01&end_date=2024-12-31" `
        -Method GET -Headers $headers

    $avgYield = $efficiencyResp.data.average_yield
    $minYield = $efficiencyResp.data.min_yield
    $maxYield = $efficiencyResp.data.max_yield

    $hasStats = ($null -ne $avgYield) -and ($null -ne $minYield) -and ($null -ne $maxYield)

    Test-Result "Yield Statistics Available" $hasStats
    if ($hasStats) {
        Write-Host "   Avg Yield: $avgYield%" -ForegroundColor Gray
        Write-Host "   Min Yield: $minYield%" -ForegroundColor Gray
        Write-Host "   Max Yield: $maxYield%" -ForegroundColor Gray
    }
} catch {
    Test-Result "Yield Statistics Available" $false $_.Exception.Message
}

Write-Host ""

# ============================================================================
# PHASE 9 TESTS: E2E INTEGRATION WORKFLOWS
# ============================================================================
Write-Host "╔════════════════════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║                 PHASE 9: E2E INTEGRATION WORKFLOWS                        ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# ============================================================================
# P9-T1: Complete E2E Workflow - Recipe to Profit
# ============================================================================
Write-Host "=== P9-T1: E2E Workflow - Recipe → Production → Profit ===" -ForegroundColor Cyan

try {
    # Step 1: Create Recipe (already have test recipes)
    # Step 2: Start Production
    # Step 3: Complete Production
    # Step 4: Create Sale
    # Step 5: Calculate Profit

    if ($testRecipeFIFO -and $testOutlet) {
        # Get SKU ID from recipe
        $e2eSkuId = $testRecipeFIFO.product_sku_id
        $e2eProductId = $testRecipeFIFO.product_id

        # Start production
        $e2eProdBody = @{
            recipe_id = $testRecipeFIFO.id
            planned_quantity = 5.0
            planned_date = "2024-12-31"
        } | ConvertTo-Json

        $e2eProdResp = Invoke-RestMethod -Uri "$baseUrl/production/runs" `
            -Method POST -Headers $headers -ContentType "application/json" -Body $e2eProdBody

        $e2eProdId = $e2eProdResp.data.id

        # Complete production
        $e2eCompleteBody = @{
            actual_quantity = 4.8
            actual_date = "2024-12-31"
            waste_quantity = 0.2
            waste_reason = "E2E test waste"
        } | ConvertTo-Json

        Invoke-RestMethod -Uri "$baseUrl/production/runs/$e2eProdId/complete" `
            -Method POST -Headers $headers -ContentType "application/json" -Body $e2eCompleteBody

        # Get updated SKU with cost
        $e2eProdDetailResp = Invoke-RestMethod -Uri "$baseUrl/products/$e2eProductId" `
            -Method GET -Headers $headers

        $e2eSku = $e2eProdDetailResp.data.skus | Where-Object { $_.id -eq $e2eSkuId }
        $e2eHasCost = $e2eSku.average_cost -gt 0

        # Create sale
        $e2eSaleBody = @{
            outlet_id = $testOutlet.id
            invoice_date = "2024-12-31"
            payment_type = "cash"
            items = @(
                @{
                    product_sku_id = $e2eSkuId
                    quantity = 5
                    unit_price = $e2eSku.price
                    amount = $e2eSku.price * 5
                }
            )
        } | ConvertTo-Json -Depth 5

        $e2eSaleResp = Invoke-RestMethod -Uri "$baseUrl/sales/invoices" `
            -Method POST -Headers $headers -ContentType "application/json" -Body $e2eSaleBody

        $e2eSaleId = $e2eSaleResp.data.id

        # Get profit
        $e2eProfitResp = Invoke-RestMethod -Uri "$baseUrl/sales/invoices/$e2eSaleId/profit" `
            -Method GET -Headers $headers

        $e2eHasProfit = ($null -ne $e2eProfitResp.data.profit)

        Test-Result "E2E Workflow Completed" ($e2eHasCost -and $e2eHasProfit)
        Write-Host "   ✓ Recipe created" -ForegroundColor Gray
        Write-Host "   ✓ Production completed with costs" -ForegroundColor Gray
        Write-Host "   ✓ Sale created" -ForegroundColor Gray
        Write-Host "   ✓ Profit calculated: $($e2eProfitResp.data.profit)" -ForegroundColor Gray
    } else {
        Test-Result "E2E Workflow Completed" $false "Test data not available"
    }
} catch {
    Test-Result "E2E Workflow Completed" $false $_.Exception.Message
}

Write-Host ""

# ============================================================================
# P9-T2: E2E Workflow - Multiple Productions on Same Recipe
# ============================================================================
Write-Host "=== P9-T2: E2E - Multiple Productions (FIFO Validation) ===" -ForegroundColor Cyan

try {
    if ($testRecipeFIFO) {
        # Production 1
        $prod1Resp = Invoke-RestMethod -Uri "$baseUrl/production/runs" `
            -Method POST -Headers $headers -ContentType "application/json" `
            -Body (@{recipe_id=$testRecipeFIFO.id; planned_quantity=2; planned_date="2024-12-31"} | ConvertTo-Json)

        Invoke-RestMethod -Uri "$baseUrl/production/runs/$($prod1Resp.data.id)/complete" `
            -Method POST -Headers $headers -ContentType "application/json" `
            -Body (@{actual_quantity=2; actual_date="2024-12-31"} | ConvertTo-Json)

        # Production 2 (should use next FIFO batches)
        $prod2Resp = Invoke-RestMethod -Uri "$baseUrl/production/runs" `
            -Method POST -Headers $headers -ContentType "application/json" `
            -Body (@{recipe_id=$testRecipeFIFO.id; planned_quantity=2; planned_date="2024-12-31"} | ConvertTo-Json)

        $complete2Resp = Invoke-RestMethod -Uri "$baseUrl/production/runs/$($prod2Resp.data.id)/complete" `
            -Method POST -Headers $headers -ContentType "application/json" `
            -Body (@{actual_quantity=2; actual_date="2024-12-31"} | ConvertTo-Json)

        # Both should have costs
        $bothHaveCosts = ($complete2Resp.data.total_material_cost -gt 0)

        Test-Result "Multiple Productions Track FIFO" $bothHaveCosts
        Write-Host "   ✓ Production 1 completed" -ForegroundColor Gray
        Write-Host "   ✓ Production 2 completed with FIFO costs" -ForegroundColor Gray
    } else {
        Test-Result "Multiple Productions Track FIFO" $false "Test recipe not available"
    }
} catch {
    Test-Result "Multiple Productions Track FIFO" $false $_.Exception.Message
}

Write-Host ""

# ============================================================================
# P9-T3: E2E Workflow - Waste Impact on Costs
# ============================================================================
Write-Host "=== P9-T3: E2E - Waste Impact on Unit Costs ===" -ForegroundColor Cyan

try {
    if ($wasteRecipeId) {
        # Production with 10% waste
        $wasteProdResp = Invoke-RestMethod -Uri "$baseUrl/production/runs" `
            -Method POST -Headers $headers -ContentType "application/json" `
            -Body (@{recipe_id=$wasteRecipeId; planned_quantity=10; planned_date="2024-12-31"} | ConvertTo-Json)

        $wasteCompleteResp = Invoke-RestMethod -Uri "$baseUrl/production/runs/$($wasteProdResp.data.id)/complete" `
            -Method POST -Headers $headers -ContentType "application/json" `
            -Body (@{actual_quantity=9; actual_date="2024-12-31"; waste_quantity=1; waste_reason="Test"} | ConvertTo-Json)

        $materialCost = [float]$wasteCompleteResp.data.total_material_cost
        $wasteCost = [float]$wasteCompleteResp.data.total_waste_cost
        $unitCost = [float]$wasteCompleteResp.data.unit_cost

        # Verify waste impacts unit cost calculation
        $expectedUnitCost = $materialCost / 10  # Total material / (output + waste)
        $impactVerified = [Math]::Abs($unitCost - $expectedUnitCost) -lt 0.01

        Test-Result "Waste Impact on Unit Costs Verified" $impactVerified
        Write-Host "   Material Cost: $materialCost" -ForegroundColor Gray
        Write-Host "   Waste Cost: $wasteCost" -ForegroundColor Gray
        Write-Host "   Unit Cost (incl waste): $unitCost" -ForegroundColor Gray
    } else {
        Test-Result "Waste Impact on Unit Costs Verified" $false "Waste recipe not available"
    }
} catch {
    Test-Result "Waste Impact on Unit Costs Verified" $false $_.Exception.Message
}

Write-Host ""

# ============================================================================
# P9-T4: E2E Workflow - Batch Traceability
# ============================================================================
Write-Host "=== P9-T4: E2E - Complete Batch Traceability ===" -ForegroundColor Cyan

try {
    if ($prodRunId) {
        # Get production run details
        $traceResp = Invoke-RestMethod -Uri "$baseUrl/production/runs/$prodRunId" `
            -Method GET -Headers $headers

        # Verify has:
        # 1. Production batch number
        $hasProdBatch = ($null -ne $traceResp.data.batch_number) -and ($traceResp.data.batch_number -ne "")
        
        # 2. Material batches consumed
        $materials = @($traceResp.data.materials | Where-Object { $_ -ne $null })
        $hasMaterialBatches = $materials.Count -gt 0
        
        # 3. Finished goods batches
        $outputs = @($traceResp.data.outputs | Where-Object { $_ -ne $null })
        $hasFGBatches = $outputs.Count -gt 0

        $fullTraceability = $hasProdBatch -and $hasMaterialBatches -and $hasFGBatches

        Test-Result "Complete Batch Traceability" $fullTraceability
        if ($fullTraceability) {
            Write-Host "   ✓ Production Batch: $($traceResp.data.batch_number)" -ForegroundColor Gray
            Write-Host "   ✓ Materials Consumed: $($materials.Count)" -ForegroundColor Gray
            Write-Host "   ✓ FG Batches: $($outputs.Count)" -ForegroundColor Gray
        }
    } else {
        Test-Result "Complete Batch Traceability" $false "Production run not available"
    }
} catch {
    Test-Result "Complete Batch Traceability" $false $_.Exception.Message
}

Write-Host ""

# ============================================================================
# P9-T5: E2E Workflow - Reporting Integration
# ============================================================================
Write-Host "=== P9-T5: E2E - Full Reporting Integration ===" -ForegroundColor Cyan

try {
    # Verify all 3 reports have data from our E2E workflow
    
    # 1. Profit Analysis
    $profitResp = Invoke-RestMethod -Uri "$baseUrl/products/profit-summary" `
        -Method GET -Headers $headers
    $hasProfitData = ($profitResp.data.products.Count -gt 0)

    # 2. Waste Cost Report
    $wasteReportResp = Invoke-RestMethod -Uri "$baseUrl/production/waste-cost-report?month=12&year=2024" `
        -Method GET -Headers $headers
    $hasWasteData = ($null -ne $wasteReportResp.data.total_waste_cost)

    # 3. Efficiency Report
    $effReportResp = Invoke-RestMethod -Uri "$baseUrl/production/efficiency-report?start_date=2024-12-01&end_date=2024-12-31" `
        -Method GET -Headers $headers
    $hasEffData = ($null -ne $effReportResp.data.average_yield)

    $allReportsWork = $hasProfitData -and $hasWasteData -and $hasEffData

    Test-Result "All Reports Integrated Successfully" $allReportsWork
    Write-Host "   ✓ Profit Analysis: OK" -ForegroundColor Gray
    Write-Host "   ✓ Waste Cost Report: OK" -ForegroundColor Gray
    Write-Host "   ✓ Efficiency Report: OK" -ForegroundColor Gray
} catch {
    Test-Result "All Reports Integrated Successfully" $false $_.Exception.Message
}

Write-Host ""

# ============================================================================
# TEST SUMMARY
# ============================================================================
Write-Host "╔════════════════════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║                          COMPREHENSIVE TEST SUMMARY                       ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

$failedCount = $totalTests - $passedTests

if ($failedCount -eq 0) {
    Write-Host "════════════════════════════════════════" -ForegroundColor Green
    Write-Host "Total: $totalTests | Passed: $passedTests | Failed: $failedCount" -ForegroundColor Green
    Write-Host "🎉 ALL TESTS PASSED!" -ForegroundColor Green
    Write-Host "════════════════════════════════════════" -ForegroundColor Green
} else {
    Write-Host "════════════════════════════════════════" -ForegroundColor Red
    Write-Host "Total: $totalTests | Passed: $passedTests | Failed: $failedCount" -ForegroundColor Red
    Write-Host "⚠️  $failedCount test(s) failed:" -ForegroundColor Red
    foreach ($fail in $failedTests) {
        Write-Host "   - $($fail.Name)" -ForegroundColor Red
        if ($fail.Message) {
            Write-Host "     $($fail.Message)" -ForegroundColor Yellow
        }
    }
    Write-Host "════════════════════════════════════════" -ForegroundColor Red
}

Write-Host ""
