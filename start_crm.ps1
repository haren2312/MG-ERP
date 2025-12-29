# Start CRM Services (Backend + Frontend)
Write-Host "Starting CRM Services..." -ForegroundColor Green

# Check if Docker is running
$dockerRunning = docker info 2>&1 | Select-String "Server Version"
if (-not $dockerRunning) {
    Write-Host "Docker is not running. Please start Docker Desktop first." -ForegroundColor Red
    exit 1
}

# Start only CRM services
docker-compose up -d crm-backend crm-frontend

Write-Host ""
Write-Host "CRM Services started successfully!" -ForegroundColor Green
Write-Host "CRM Backend: http://localhost:8006" -ForegroundColor Cyan
Write-Host "CRM Frontend: http://localhost:3006" -ForegroundColor Cyan
Write-Host "Health Check: http://localhost:8006/health" -ForegroundColor Yellow
Write-Host ""
Write-Host "View logs: docker-compose logs -f crm-backend crm-frontend" -ForegroundColor Gray
