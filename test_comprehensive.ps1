# Comprehensive API Test Script for MasterBangun
# Tests all major endpoints across all roles

$baseUrl = "http://localhost:3001/api"
$results = @()

function Test-Endpoint {
    param([string]$method, [string]$url, [string]$token, $body, [string]$label)
    try {
        $headers = @{}
        if ($token) { $headers["Authorization"] = "Bearer $token" }
        $params = @{
            Uri = "$baseUrl$url"
            Method = $method
            ContentType = "application/json"
            Headers = $headers
        }
        if ($body) { $params["Body"] = ($body | ConvertTo-Json -Depth 10) }
        $res = Invoke-RestMethod @params
        Write-Host "[PASS] $label" -ForegroundColor Green
        return @{status="PASS"; label=$label; data=$res}
    } catch {
        $code = $_.Exception.Response.StatusCode.value__
        $msg = $_.ErrorDetails.Message
        Write-Host "[FAIL] $label - $code - $msg" -ForegroundColor Red
        return @{status="FAIL"; label=$label; code=$code; msg=$msg}
    }
}

# ===== LOGIN ALL ROLES =====
Write-Host "`n=== LOGIN TESTS ===" -ForegroundColor Cyan

$saLogin = Test-Endpoint "POST" "/auth/login" $null @{email="superadmin@masterbangun.com"; password="admin123"} "Login SuperAdmin"
$saToken = $saLogin.data.access_token

$adminLogin = Test-Endpoint "POST" "/auth/login" $null @{email="admin@masterbangun.com"; password="admin123"} "Login Admin"
$adminToken = $adminLogin.data.access_token

$mgrLogin = Test-Endpoint "POST" "/auth/login" $null @{email="manager@masterbangun.com"; password="manager123"} "Login Manager"
$mgrToken = $mgrLogin.data.access_token

$pengLogin = Test-Endpoint "POST" "/auth/login" $null @{email="pengawas@masterbangun.com"; password="pengawas123"} "Login Pengawas"
$pengToken = $pengLogin.data.access_token

$mandorLogin = Test-Endpoint "POST" "/auth/login" $null @{email="mandor@masterbangun.com"; password="mandor123"} "Login Mandor"
$mandorToken = $mandorLogin.data.access_token

$konLogin = Test-Endpoint "POST" "/auth/login" $null @{email="konsumen@example.com"; password="konsumen123"} "Login Konsumen"
$konToken = $konLogin.data.access_token

# ===== PROJECTS =====
Write-Host "`n=== PROJECTS TESTS ===" -ForegroundColor Cyan

$projAll = Test-Endpoint "GET" "/projects" $adminToken $null "Admin: Get All Projects"
$projSA = Test-Endpoint "GET" "/projects" $saToken $null "SuperAdmin: Get All Projects"
$projMgr = Test-Endpoint "GET" "/projects" $mgrToken $null "Manager: Get All Projects"
$projPeng = Test-Endpoint "GET" "/projects" $pengToken $null "Pengawas: Get All Projects"
$projKon = Test-Endpoint "GET" "/projects" $konToken $null "Konsumen: Get All Projects"
$projArchived = Test-Endpoint "GET" "/projects?archived=true" $adminToken $null "Admin: Get Archived Projects"

# ===== USERS =====
Write-Host "`n=== USERS TESTS ===" -ForegroundColor Cyan

$usersAll = Test-Endpoint "GET" "/users" $adminToken $null "Admin: Get All Users"
$usersSA = Test-Endpoint "GET" "/users" $saToken $null "SuperAdmin: Get All Users"

# ===== TUKANG =====
Write-Host "`n=== TUKANG TESTS ===" -ForegroundColor Cyan

$tukangAll = Test-Endpoint "GET" "/tukang" $adminToken $null "Admin: Get All Tukang"
$tukangSA = Test-Endpoint "GET" "/tukang" $saToken $null "SuperAdmin: Get All Tukang"
$tukangArchived = Test-Endpoint "GET" "/tukang?archived=true" $adminToken $null "Admin: Get Archived Tukang"

# ===== DAILY REPORTS =====
Write-Host "`n=== DAILY REPORTS TESTS ===" -ForegroundColor Cyan

$reportsAll = Test-Endpoint "GET" "/daily-reports" $pengToken $null "Pengawas: Get All Reports"
$reportsMgr = Test-Endpoint "GET" "/daily-reports" $mgrToken $null "Manager: Get All Reports"
$reportsSA = Test-Endpoint "GET" "/daily-reports" $saToken $null "SuperAdmin: Get All Reports"

# ===== DOCUMENTS =====
Write-Host "`n=== DOCUMENTS TESTS ===" -ForegroundColor Cyan

# Get first project ID for document tests
if ($projAll.data -and $projAll.data.Count -gt 0) {
    $firstProjId = $projAll.data[0].id
    Write-Host "Using project ID: $firstProjId"
    
    $docsProj = Test-Endpoint "GET" "/documents/project/$firstProjId" $adminToken $null "Admin: Get Project Documents"
    $docsProjSA = Test-Endpoint "GET" "/documents/project/$firstProjId" $saToken $null "SuperAdmin: Get Project Documents"
    $docsConsumer = Test-Endpoint "GET" "/documents/consumer/$firstProjId" $konToken $null "Konsumen: Get Consumer Documents"
    
    # Test wrong route that was previously used
    $docsWrongRoute = Test-Endpoint "GET" "/documents/project/$firstProjId/consumer" $konToken $null "Konsumen: Wrong Route (should fail)"
}

# ===== NOTES =====
Write-Host "`n=== NOTES TESTS ===" -ForegroundColor Cyan

$notesAll = Test-Endpoint "GET" "/notes" $adminToken $null "Admin: Get All Notes"
$notesSA = Test-Endpoint "GET" "/notes" $saToken $null "SuperAdmin: Get All Notes"

# ===== MATERIALS =====
Write-Host "`n=== MATERIALS TESTS ===" -ForegroundColor Cyan

$materialsAll = Test-Endpoint "GET" "/materials" $mgrToken $null "Manager: Get All Materials"
$materialsPeng = Test-Endpoint "GET" "/materials" $pengToken $null "Pengawas: Get All Materials"

# ===== ATTENDANCE =====
Write-Host "`n=== ATTENDANCE TESTS ===" -ForegroundColor Cyan

$attendAll = Test-Endpoint "GET" "/attendance" $mgrToken $null "Manager: Get All Attendance"
$attendPeng = Test-Endpoint "GET" "/attendance" $pengToken $null "Pengawas: Get All Attendance"

# ===== UPLOAD =====
Write-Host "`n=== UPLOAD TEST ===" -ForegroundColor Cyan

$uploadCheck = Test-Endpoint "GET" "/upload" $adminToken $null "Admin: Check Upload Endpoint"

Write-Host "`n=== TEST COMPLETE ===" -ForegroundColor Cyan
