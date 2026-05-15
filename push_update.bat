@echo off
echo [1/3] Adding changes...
git add .
echo [2/3] Committing changes...
git commit -m "fix: sync connectivity and styling v1.2"
echo [3/3] Pushing to GitHub...
git push
echo.
echo ========================================
echo UPDATE COMPLETE! 
echo Please wait 1 minute for GitHub to build.
echo ========================================
pause
