# 🏆 SDGs 機智問答記分板 (Fushing SDGs Scoreboard)

這是一個專為 **復興實中新加坡交流活動** 設計的即時機智問答記分系統。採用 1939 年美式漫畫風格 (Golden Age Comic Style)，結合現代化的 Web 技術與 Google Sheets 雲端後台。

![Comic Style](https://img.shields.io/badge/Style-1939%20Marvel%20Comic-red)
![React](https://img.shields.io/badge/Framework-React%2018-blue)
![Vite](https://img.shields.io/badge/Build%20Tool-Vite-646CFF)

## ✨ 專案特色

- **1939 漫畫視覺設計**：厚重黑邊框、復古網點背景 (Halftone)、毛玻璃透視效果。
- **即時數據同步**：前端 React 透過 Google Apps Script 與 Google Sheets 試算表即時通訊。
- **雙模式頁面**：
  - **主計分板 (Scoreboard)**：自動顯示積分最高的前四名小隊，具備金黃光優勝特效。
  - **GM 管理頁面 (GM Panel)**：專屬登入介面，支援和班與平班獨立評分。
- **安全機制**：
  - 班級登入密碼保護。
  - 獨立管理員重置密碼 (`0508`)。

## 🛠️ 技術棧

- **前端框架**: React (Vite)
- **樣式**: Vanilla CSS (Custom Design System)
- **圖標**: Lucide React
- **後端**: Google Sheets + Google Apps Script

## 🚀 快速開始

### 1. 本地環境設定

請確保您的電腦已安裝 [Node.js](https://nodejs.org/)。

```bash
# 1. 進入專案資料夾
cd sdgsfushing

# 2. 安裝依賴套件
npm install

# 3. 啟動開發伺服器
npm run dev
```

### 2. 資產配置 (Assets)
請將以下圖片檔案放置於 `public/` 資料夾中：
- `singapore_background.png` (主背景圖)
- `復興logo--去背.png` (校徽)

### 3. 環境變數 (.env)
在專案根目錄建立 `.env` 檔案，並填入您的 API 網址：
```env
VITE_GOOGLE_APP_SCRIPT_URL=你的_Google_Apps_Script_網址
```

## 📊 Google Sheets 後台設定

為了讓系統運作，您需要設定一個 Google 試算表作為資料庫：

1. **建立工作表**：名稱必須為 `計分`。
2. **設定欄位**：
   - A: `時間戳記`
   - B: `班級`
   - C: `小隊`
   - D: `分數`
3. **部署指令碼**：使用專案中提供的 Apps Script 程式碼部署為「網頁應用程式」，並將存取權限設為「所有人」。

## 🔑 預設密碼

- **和班 GM 登入**: `0001`
- **平班 GM 登入**: `0002`
- **分數重置密碼**: `0508`

## 🌐 部署到 GitHub Pages (自動化)

本專案已設定好 GitHub Actions，當您推送程式碼至 `main` 分支時，系統會自動進行編譯與部署。

### 部署步驟：

1. **設定 GitHub Secrets**：
   - 進入您的 GitHub 倉庫。
   - 點擊 `Settings` > `Secrets and variables` > `Actions`。
   - 點擊 `New repository secret`。
   - **Name**: `VITE_GOOGLE_APP_SCRIPT_URL`
   - **Value**: 貼上您的 Google Apps Script 部署網址。

2. **啟用 GitHub Pages**：
   - 進入 `Settings` > `Pages`。
   - 在 `Build and deployment` > `Source` 選擇 `GitHub Actions`。

3. **推送程式碼**：
   - 當您執行 `git push` 到 `main` 分支後，可以到 `Actions` 頁籤查看進度。
   - 部署完成後，您的記分板將會上線！

## 📜 授權

此專案僅供 **復興實中** 交流活動使用。
