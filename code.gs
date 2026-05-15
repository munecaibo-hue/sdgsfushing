/**
 * Google Apps Script for SDGs Scoreboard
 * 
 * 1. 建立一個 Google 試算表
 * 2. 點擊「擴充功能」 > 「Apps Script」
 * 3. 將此代碼貼上並儲存
 * 4. 點擊「部署」 > 「新部署」
 * 5. 選擇類型為「網頁應用程式」
 * 6. 「誰有權限存取」選擇「所有人 (Anyone)」
 * 7. 部署後取得網址，貼回到專案的 .env 檔案中
 */

function doGet(e) {
  // 強制同步
  SpreadsheetApp.flush();
  
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheets()[0]; // 永遠抓取第一張工作表，避免分頁切換問題
  const data = sheet.getDataRange().getValues();
  const result = [];
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][0]) {
      result.push({
        team: String(data[i][0]).trim(),
        score: Number(data[i][1]) || 0
      });
    }
  }
  
  return ContentService.createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000); // 縮短等待時間至 10 秒
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    const params = JSON.parse(e.postData.contents);
    
    if (params.action === 'update') {
      const data = sheet.getDataRange().getValues();
      let found = false;
      for (let i = 1; i < data.length; i++) {
        if (data[i][0] === params.team) {
          const currentScore = Number(data[i][1]) || 0;
          sheet.getRange(i + 1, 2).setValue(currentScore + Number(params.amount));
          found = true;
          break;
        }
      }
      if (!found) sheet.appendRow([params.team, params.amount]);
    } else if (params.action === 'reset') {
      const lastRow = sheet.getLastRow();
      if (lastRow > 1) sheet.getRange(2, 2, lastRow - 1, 1).setValue(0);
    }
    
    SpreadsheetApp.flush();
    return ContentService.createTextOutput("OK");
  } catch (error) {
    return ContentService.createTextOutput("Error");
  } finally {
    lock.releaseLock();
  }
}

/**
 * 初始化試算表（選用）
 * 可以在 Apps Script 編輯器中手動執行一次來建立標題
 */
function setupSheet() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  sheet.clear();
  sheet.getRange(1, 1, 1, 2).setValues([["隊伍名稱", "分數"]]);
  sheet.getRange(1, 1, 1, 2).setFontWeight("bold").setBackground("#f3f3f3");
  
  // 也可以預填隊伍，例如：
  // const initialTeams = [
  //   ["和班 第1小隊", 0],
  //   ["和班 第2小隊", 0],
  //   ...
  // ];
  // sheet.getRange(2, 1, initialTeams.length, 2).setValues(initialTeams);
}
