# 強制執行 Git 推送
Write-Host "[1/3] Adding changes..." -ForegroundColor Cyan
git add .

Write-Host "[2/3] Committing changes..." -ForegroundColor Cyan
git commit -m "fix: emergency layout and sync fix v1.2.3" --allow-empty

Write-Host "[3/3] Pushing to GitHub..." -ForegroundColor Cyan
# 自動抓取目前分支
$branch = git rev-parse --abbrev-ref HEAD
git push origin $branch --force

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n========================================" -ForegroundColor Green
    Write-Host "   UPDATE SUCCESSFUL!網頁正在更新中..." -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
} else {
    Write-Host "`n!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!" -ForegroundColor Red
    Write-Host "   PUSH FAILED! 請檢查 GitHub 是否登入" -ForegroundColor Red
    Write-Host "!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!" -ForegroundColor Red
}

Read-Host -Prompt "請按 Enter 鍵關閉視窗"

Run with PowerShell
