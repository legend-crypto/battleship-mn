# Midnight Stack Automated Setup Script for Windows PowerShell
Write-Host "====================================================================" -ForegroundColor Cyan
Write-Host "MIDNIGHT NETWORK STACK AND PROOF SERVER SETUP" -ForegroundColor Cyan
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
    Write-Host "Docker Desktop engine is not running yet. Start Docker Desktop and re-run." -ForegroundColor Yellow
    Exit 1
}

Write-Host "Docker Engine Daemon is ONLINE and READY!" -ForegroundColor Green

# 3. Pull and launch Midnight Proof Server Docker container
Write-Host "Pulling Midnight Proof Server (midnightntwrk/proof-server:9.0.2)..." -ForegroundColor Cyan
& $dockerBin pull midnightntwrk/proof-server:9.0.2

Write-Host "Starting Midnight Proof Server on port 6300..." -ForegroundColor Cyan
& $dockerBin rm -f midnight-proof-server horizon-proof-server 2>$null
& $dockerBin run -d --name midnight-proof-server -p 6300:6300 midnightntwrk/proof-server:9.0.2

# 4. Pre-warm Alpine + Compact toolchain v0.36.1 cache volume
Write-Host "Caching Compact compiler toolchain v0.36.1 in Docker volume midnight_compact_cache..." -ForegroundColor Cyan
& $dockerBin pull alpine:latest
& $dockerBin run --rm -v midnight_compact_cache:/root/.compact alpine:latest sh -c "apk add --no-cache bash curl xz ca-certificates gcompat libstdc++ >/dev/null && curl -fsSL https://github.com/midnightntwrk/compact/releases/download/compact-v0.5.3/compact-x86_64-unknown-linux-musl.tar.xz | tar -xJ -C /usr/local/bin --strip-components=1 && compact update 0.36.1 && compact compile --version"

Write-Host "====================================================================" -ForegroundColor Green
Write-Host "MIDNIGHT PROOF SERVER AND COMPACT v0.36.1 SETUP COMPLETE" -ForegroundColor Green
Write-Host "====================================================================" -ForegroundColor Green
Write-Host " - Proof Server URL:    http://127.0.0.1:6300"
Write-Host " - Proof Server Health: http://127.0.0.1:6300/health"
Write-Host " - Compile Contract:    npm run compile:compact --workspace=contracts"
Write-Host "===================================================================="
