@echo off
setlocal enabledelayedexpansion

echo ========================================
echo [1/3] Adding changes...
git add .
if %errorlevel% neq 0 (
    echo ERROR: Failed to add files.
    pause
    exit /b
)

echo [2/3] Committing changes...
git commit -m "fix: sync connectivity and styling v1.2"
if %errorlevel% neq 0 (
    echo NOTE: Nothing new to commit or commit failed.
)

echo [3/3] Pushing to GitHub...
:: 自動偵測目前分支並推送
for /f "tokens=*" %%i in ('git rev-parse --abbrev-ref HEAD') do set BRANCH=%%i
echo Detected branch: !BRANCH!
git push origin !BRANCH!

if %errorlevel% neq 0 (
    echo.
    echo ERROR: Push failed! 
    echo Please check your internet or GitHub login status.
    pause
    exit /b
)

echo.
echo ========================================
echo UPDATE SUCCESSFUL! 
echo Please check your GitHub Actions tab.
echo ========================================
pause
