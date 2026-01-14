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
    
    $global:totalTests++
    if ($Passed) {
        Write-Host "✅ PASS: $TestName" -ForegroundColor Green
        $global:passedTests++
    } else {
        Write-Host "❌ FAIL: $TestName" -ForegroundColor Red
        if ($Message) { Write-Host "   Error: $Message" -ForegroundColor Yellow }
        $global:failedTests += @{Name = $TestName; Message = $Message}
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
