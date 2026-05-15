@echo off
setlocal enabledelayedexpansion

echo ========================================
echo [0/3] Syncing with GitHub (Pull)...
for /f "tokens=*" %%i in ('git rev-parse --abbrev-ref HEAD') do set BRANCH=%%i
echo Detected branch: !BRANCH!

:: 嘗試同步，即使失敗也繼續，避免卡死
git pull origin !BRANCH! --rebase

echo [1/3] Adding changes...
git add .

echo [2/3] Committing changes...
:: 加入 allow-empty 以避免沒東西改時報錯
git commit -m "fix: cors and sync issues v1.2.1" --allow-empty

echo [3/3] Pushing to GitHub...
git push origin !BRANCH!

if %errorlevel% neq 0 (
    echo.
    echo ERROR: Push failed! 
    echo Please try running the .bat again or check your login.
    pause
    exit /b
)

echo.
echo ========================================
echo UPDATE SUCCESSFUL! 
echo Please check your GitHub Actions tab.
echo ========================================
pause 


