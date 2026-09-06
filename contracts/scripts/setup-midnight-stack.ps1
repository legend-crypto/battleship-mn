# Midnight Stack Automated Setup Script for Windows PowerShell
Write-Host "====================================================================" -ForegroundColor Cyan
Write-Host "MIDNIGHT NETWORK TESTNET STACK AND PROOF SERVER SETUP" -ForegroundColor Cyan
Write-Host "====================================================================" -ForegroundColor Cyan

# Find docker executable path
$dockerBin = "docker"
if (Get-Command docker -ErrorAction SilentlyContinue) {
    $dockerBin = "docker"
} elseif (Test-Path "$env:LOCALAPPDATA\Programs\DockerDesktop\resources\bin\docker.exe") {
    $dockerBin = "$env:LOCALAPPDATA\Programs\DockerDesktop\resources\bin\docker.exe"
}

Write-Host "Checking Docker installation at: $dockerBin" -ForegroundColor Cyan

# 1. Check Docker binary availability
try {
    $dockerVer = & $dockerBin --version 2>&1
    Write-Host "Docker binary found: $dockerVer" -ForegroundColor Green
} catch {
    Write-Host "Docker Desktop binary is not found." -ForegroundColor Yellow
    Write-Host "Please install Docker Desktop from https://www.docker.com/products/docker-desktop/" -ForegroundColor Yellow
    Exit 1
}

# 2. Check if Docker daemon is running
Write-Host "Connecting to Docker engine daemon..." -ForegroundColor Cyan
$isReady = $false
for ($i = 1; $i -le 10; $i++) {
    $info = & $dockerBin info 2>&1
    if ($LASTEXITCODE -eq 0) {
        $isReady = $true
        break
    }
    Write-Host "Waiting for Docker Desktop engine daemon to finish starting ($i/10)..." -ForegroundColor Yellow
    Start-Sleep -Seconds 3
}

if (-not $isReady) {
    Write-Host "====================================================================" -ForegroundColor Yellow
    Write-Host "Docker Desktop application was launched but engine is still initializing." -ForegroundColor Yellow
    Write-Host "Please check the Docker Desktop window on your screen to complete initial setup." -ForegroundColor Yellow
    Write-Host "Once Docker Desktop shows 'Engine Running', run:" -ForegroundColor Yellow
    Write-Host "  npm run setup:stack --workspace=contracts" -ForegroundColor Yellow
    Write-Host "====================================================================" -ForegroundColor Yellow
    Exit 1
}

Write-Host "Docker Engine Daemon is ONLINE and READY!" -ForegroundColor Green

# 3. Pull and launch Midnight Proof Server Docker container
Write-Host "Pulling Midnight Proof Server container image..." -ForegroundColor Cyan
& $dockerBin pull midnightnetwork/proof-server:latest

Write-Host "Starting Midnight Proof Server on port 6300..." -ForegroundColor Cyan
& $dockerBin rm -f midnight-proof-server 2>$null
& $dockerBin run -d --name midnight-proof-server -p 6300:6300 midnightnetwork/proof-server:latest

# 4. Pull Midnight Compact Compiler container
Write-Host "Pulling Midnight Compact Compiler image..." -ForegroundColor Cyan
& $dockerBin pull midnightnetwork/compactc:latest

Write-Host "====================================================================" -ForegroundColor Green
Write-Host "MIDNIGHT PROOF SERVER AND COMPILER SETUP COMPLETE" -ForegroundColor Green
Write-Host "====================================================================" -ForegroundColor Green
Write-Host " - Proof Server URL:    http://127.0.0.1:6300"
Write-Host " - Proof Server Health: http://127.0.0.1:6300/health"
Write-Host " - Compact Compiler:   docker run --rm -v ${PWD}:/code midnightnetwork/compactc:latest"
Write-Host "===================================================================="
