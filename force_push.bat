@echo off
setlocal enabledelayedexpansion

echo ========================================
echo [1/4] Cleaning up Git state...
:: 取消所有可能卡住的 rebase 或 merge
git rebase --abort >nul 2>&1
git merge --abort >nul 2>&1

echo [2/4] Syncing with GitHub...
for /f "tokens=*" %%i in ('git rev-parse --abbrev-ref HEAD') do set BRANCH=%%i
echo Detected branch: !BRANCH!

:: 強制抓取並合併雲端版本
git pull origin !BRANCH! --no-rebase -X theirs --allow-unrelated-histories

echo [3/4] Committing your fixes...
git add .
git commit -m "fix: cors and connection v1.2.2" --allow-empty

echo [4/4] Pushing to GitHub...
git push origin !BRANCH!

if %errorlevel% neq 0 (
    echo.
    echo ERROR: Push failed! 
    echo Please check if you are logged in to GitHub.
    pause
    exit /b
)

echo.
echo ========================================
echo FORCE UPDATE SUCCESSFUL! 
echo Please check your GitHub Actions tab.
echo ========================================
pause
