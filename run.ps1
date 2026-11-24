Write-Host "==================================================================" -ForegroundColor Cyan
Write-Host "🚀 Starting Smart Student Information & Academic Management System" -ForegroundColor Green
Write-Host "🤖 Agentic AI Platform (12 Specialized Agents + Orchestrator)" -ForegroundColor Yellow
Write-Host "==================================================================" -ForegroundColor Cyan

# Start Backend
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\backend'; Write-Host 'Starting Backend API on Port 5000...' -ForegroundColor Cyan; npm run dev"

# Start Frontend
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\frontend'; Write-Host 'Starting Frontend Vite Server on Port 5173...' -ForegroundColor Green; npm run dev"

Write-Host "`nServices started!" -ForegroundColor Green
Write-Host "Frontend: http://localhost:5173" -ForegroundColor White
Write-Host "Backend API: http://localhost:5000" -ForegroundColor White
Write-Host "`nSelect your role from the login page dropdown to sign in to any of the 8 role portals!" -ForegroundColor Yellow
