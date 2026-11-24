@echo off
echo ==================================================================
echo Starting Smart Student Information ^& Academic Management System
echo Agentic AI Platform (12 Specialized Agents + Orchestrator)
echo ==================================================================

start "Backend Server" cmd /k "cd backend && npm run dev"
start "Frontend Server" cmd /k "cd frontend && npm run dev"

echo.
echo Services launched!
echo Frontend: http://localhost:5173
echo Backend API: http://localhost:5000
echo.
pause
