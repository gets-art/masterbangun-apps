$ErrorActionPreference = "Stop"
$BaseUrl = "http://localhost:3000/api"

function Invoke-Api {
    param ($Method, $Endpoint, $Body, $Token)
    $Params = @{
        Uri = "$BaseUrl$Endpoint"
        Method = $Method
        ContentType = "application/json"
    }
    if ($Body) { $Params.Body = ($Body | ConvertTo-Json -Depth 10) }
    if ($Token) { $Params.Headers = @{ Authorization = "Bearer $Token" } }
    
    try {
        $Res = Invoke-RestMethod @Params
        return $Res
    } catch {
        $Stream = $_.Exception.Response.GetResponseStream()
        $Reader = New-Object System.IO.StreamReader($Stream)
        $ErrMsg = $Reader.ReadToEnd()
        Write-Host "ERROR on $Method $Endpoint : $ErrMsg" -ForegroundColor Red
        return $null
    }
}

Write-Host "--- LOGIN TO ALL ROLES ---" -ForegroundColor Cyan
$Admin = Invoke-Api "POST" "/auth/login" @{email="superadmin@masterbangun.com"; password="admin123"}
$Manager = Invoke-Api "POST" "/auth/login" @{email="manager@masterbangun.com"; password="manager123"}
$Pengawas = Invoke-Api "POST" "/auth/login" @{email="pengawas@masterbangun.com"; password="pengawas123"}
$Mandor = Invoke-Api "POST" "/auth/login" @{email="mandor@masterbangun.com"; password="mandor123"}
$Konsumen = Invoke-Api "POST" "/auth/login" @{email="konsumen@example.com"; password="konsumen123"}

if (-not $Admin) { Write-Host "Login failed"; exit }

Write-Host "`n--- ADMIN ACTIONS ---" -ForegroundColor Cyan
# 1. Create Project
$Project = Invoke-Api "POST" "/projects" @{name="Test Project API"; address="Test Address"; startDate="2026-06-11T00:00:00.000Z"; estimatedEndDate="2026-12-31T00:00:00.000Z"} $Admin.access_token
if ($Project) { Write-Host "Project created: $($Project.id)" }

# 2. Assign Users to Project
if ($Project) {
    Invoke-Api "POST" "/projects/$($Project.id)/assign-user" @{userId=$Pengawas.user.id} $Admin.access_token | Out-Null
    Invoke-Api "POST" "/projects/$($Project.id)/assign-user" @{userId=$Mandor.user.id} $Admin.access_token | Out-Null
    Invoke-Api "POST" "/projects/$($Project.id)/assign-user" @{userId=$Konsumen.user.id} $Admin.access_token | Out-Null
    Write-Host "Users assigned to project"
}

# 3. Create Tukang
$Tukang = Invoke-Api "POST" "/tukang" @{name="Tukang Test API"; phone="08123456789"; skill="Testing"} $Admin.access_token
if ($Tukang -and $Project) {
    Invoke-Api "POST" "/projects/$($Project.id)/assign-tukang" @{tukangId=$Tukang.id} $Admin.access_token | Out-Null
    Write-Host "Tukang created and assigned: $($Tukang.id)"
}

Write-Host "`n--- MANDOR ACTIONS ---" -ForegroundColor Cyan
if ($Project -and $Tukang) {
    # 1. Clock In Tukang
    $Attendance = Invoke-Api "POST" "/attendance/clock-in" @{projectId=$Project.id; tukangId=$Tukang.id} $Mandor.access_token
    if ($Attendance) { Write-Host "Tukang Clocked In" }

    # 2. Clock Out Tukang with Overtime
    if ($Attendance) {
        $ClockOut = Invoke-Api "POST" "/attendance/clock-out" @{attendanceId=$Attendance.id; overtimeHours=2} $Mandor.access_token
        if ($ClockOut) { Write-Host "Tukang Clocked Out with 2 hours overtime" }
    }

    # 3. Create Material Request
    $Material = Invoke-Api "POST" "/materials" @{projectId=$Project.id; materialName="Paku API"; quantity=5; unit="kg"; urgency="TINGGI"} $Mandor.access_token
    if ($Material) { Write-Host "Material Requested: $($Material.id)" }
}

Write-Host "`n--- PENGAWAS ACTIONS ---" -ForegroundColor Cyan
if ($Project) {
    # 1. Approve Overtime
    if ($Attendance) {
        $OvApprove = Invoke-Api "PATCH" "/attendance/overtime/$($Attendance.id)/approve" @{} $Pengawas.access_token
        if ($OvApprove) { Write-Host "Overtime Approved" }
    }

    # 2. Approve Material
    if ($Material) {
        $MatApprove = Invoke-Api "PATCH" "/materials/$($Material.id)/approve" @{} $Pengawas.access_token
        if ($MatApprove) { Write-Host "Material Approved" }
    }

    # 3. Create Daily Report
    $Report = Invoke-Api "POST" "/daily-reports" @{projectId=$Project.id; reportDate="2026-06-12"; weather="MENDUNG"; description="Test API report"; progressPercentage=5; photoUrls=@("http://localhost:3000/uploads/test.jpg")} $Pengawas.access_token
    if ($Report) { Write-Host "Daily Report Created: $($Report.id)" }
}

Write-Host "`n--- MANAGER ACTIONS ---" -ForegroundColor Cyan
if ($Report) {
    # 1. Approve Daily Report
    $RepApprove = Invoke-Api "PATCH" "/daily-reports/$($Report.id)/approve" @{} $Manager.access_token
    if ($RepApprove) { Write-Host "Daily Report Approved" }

    # 2. Share Photo
    if ($Report.photos.Count -gt 0) {
        $PhotoShare = Invoke-Api "PATCH" "/photos/$($Report.photos[0].id)/share" @{} $Manager.access_token
        if ($PhotoShare) { Write-Host "Photo Shared to Consumer" }
    }
}

Write-Host "`n--- KONSUMEN ACTIONS ---" -ForegroundColor Cyan
if ($Project) {
    $Photos = Invoke-Api "GET" "/photos/consumer/$($Project.id)" $null $Konsumen.access_token
    Write-Host "Konsumen can see $($Photos.Count) photos"
}

Write-Host "`nTESTING COMPLETE" -ForegroundColor Green
