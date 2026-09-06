# Enable Windows Virtualization Platform for Docker Desktop
Write-Host "====================================================================" -ForegroundColor Cyan
Write-Host "ENABLING WINDOWS VIRTUALIZATION FOR MIDNIGHT PROOF SERVER" -ForegroundColor Cyan
Write-Host "====================================================================" -ForegroundColor Cyan

try {
    Write-Host "Activating VirtualMachinePlatform feature..." -ForegroundColor Yellow
    Enable-WindowsOptionalFeature -Online -FeatureName VirtualMachinePlatform -All
    Write-Host "====================================================================" -ForegroundColor Green
    Write-Host "SUCCESS: VirtualMachinePlatform enabled!" -ForegroundColor Green
    Write-Host "Please restart your PC to complete installation." -ForegroundColor Green
    Write-Host "====================================================================" -ForegroundColor Green
} catch {
    Write-Host "Error enabling feature. Please ensure PowerShell is run as Administrator." -ForegroundColor Red
}
