param(
    [string]$test = "login"
)

$baseUrl = "http://localhost:5000/api"

if ($test -eq "login") {
    Write-Host "Testing login..." -ForegroundColor Cyan
    try {
        $response = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method POST `
            -ContentType "application/json" `
            -Body '{"username":"admin","password":"admin123"}'
        Write-Host "Response: $($response | ConvertTo-Json)" -ForegroundColor Green
    } catch {
        Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
        Write-Host "Response: $($_.Exception.Response | ConvertTo-Json)" -ForegroundColor Red
    }
}

elseif ($test -eq "materials") {
    Write-Host "Getting auth token..." -ForegroundColor Cyan
    $loginResponse = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method POST `
        -ContentType "application/json" `
        -Body '{"username":"admin","password":"admin123"}'
    
    $token = $loginResponse.data.token
    $headers = @{ "Authorization" = "Bearer $token" }
    
    Write-Host "Getting materials..." -ForegroundColor Cyan
    try {
        $response = Invoke-RestMethod -Uri "$baseUrl/raw-materials" `
            -Method GET -Headers $headers
        Write-Host "Found $($response.data.raw_materials.Count) materials" -ForegroundColor Green
        Write-Host ($response.data.raw_materials | Select-Object id, name | ConvertTo-Json) -ForegroundColor Green
    } catch {
        Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    }
}

elseif ($test -eq "suppliers") {
    Write-Host "Getting auth token..." -ForegroundColor Cyan
    $loginResponse = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method POST `
        -ContentType "application/json" `
        -Body '{"username":"admin","password":"admin123"}'
    
    $token = $loginResponse.data.token
    $headers = @{ "Authorization" = "Bearer $token" }
    
    Write-Host "Getting suppliers..." -ForegroundColor Cyan
    try {
        $response = Invoke-RestMethod -Uri "$baseUrl/suppliers" `
            -Method GET -Headers $headers
        Write-Host "Found $($response.data.Count) suppliers" -ForegroundColor Green
        Write-Host ($response.data | Select-Object id, name | ConvertTo-Json) -ForegroundColor Green
    } catch {
        Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    }
}

elseif ($test -eq "po") {
    Write-Host "Getting auth token..." -ForegroundColor Cyan
    $loginResponse = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method POST `
        -ContentType "application/json" `
        -Body '{"username":"admin","password":"admin123"}'
    
    $token = $loginResponse.data.token
    $headers = @{ "Authorization" = "Bearer $token" }
    
    # Get materials and suppliers first
    Write-Host "Getting materials and suppliers..." -ForegroundColor Cyan
    $materials = Invoke-RestMethod -Uri "$baseUrl/raw-materials" `
        -Method GET -Headers $headers
    
    $suppliers = Invoke-RestMethod -Uri "$baseUrl/suppliers" `
        -Method GET -Headers $headers
    
    $materialId = $materials.data.raw_materials[0].id
    $supplierId = $suppliers.data[0].id
    
    Write-Host "Using Material ID: $materialId, Supplier ID: $supplierId" -ForegroundColor Cyan
    
    Write-Host "Creating PO..." -ForegroundColor Cyan
    try {
        $poBody = @{
            supplier_id = $supplierId
            expected_delivery_date = "2024-12-25"
            items = @(
                @{
                    raw_material_id = $materialId
                    quantity = 100
                    unit_cost = 50
                }
            )
        } | ConvertTo-Json
        
        Write-Host "Request body: $poBody" -ForegroundColor Gray
        
        $response = Invoke-RestMethod -Uri "$baseUrl/purchase-orders" `
            -Method POST -Headers $headers -ContentType "application/json" -Body $poBody
        Write-Host "Success! PO ID: $($response.data.id)" -ForegroundColor Green
    } catch {
        Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
        Write-Host "Response body:" -ForegroundColor Red
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        Write-Host $reader.ReadToEnd() -ForegroundColor Red
    }
}
