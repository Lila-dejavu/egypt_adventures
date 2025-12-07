# 新周目功能 - 快速啟動指南

## 🎉 新功能簡介

遊戲現在支援新周目（New Game+）系統！玩家完成遊戲後可以攜帶一件裝備重新開始，挑戰更高難度。

## 🚀 快速測試

### 方法 1：使用測試頁面（推薦）

1. 開啟瀏覽器
2. 訪問 `test/victory_screen_test.html`
3. 點擊「顯示完成畫面」按鈕
4. 選擇裝備並點擊「開始新周目」

### 方法 2：正常遊玩

1. 開啟遊戲 `index.html`
2. 完成所有地圖並擊敗最終 Boss
3. 自動顯示完成畫面
4. 選擇要攜帶的裝備
5. 開始新周目

## 🎮 功能亮點

- ✨ 華麗的完成畫面動畫
- 📊 詳細的完成統計
- 🎒 裝備攜帶系統
- 🔄 自動周目計數
- 🌍 完整的多語言支援（中文/英文）
- 📱 響應式設計，支援各種螢幕尺寸

## 🛠️ 開發者工具

### 重置周目進度
在瀏覽器控制台執行：
```javascript
localStorage.setItem('egypt_playthroughs', '0');
localStorage.removeItem('egypt_carryover_equipment');
location.reload();
```

### 快速設定高周目
```javascript
localStorage.setItem('egypt_playthroughs', '5');
location.reload();
```

### 查看當前周目
```javascript
console.log('當前周目:', localStorage.getItem('egypt_playthroughs'));
```

## 📝 新增文件清單

1. `js/mixins/NewGamePlusMixin.js` - 核心功能
2. `test/victory_screen_test.html` - 測試頁面
3. `NEW_GAME_PLUS_GUIDE.md` - 詳細文檔

## 🔧 修改文件清單

1. `index.html` - 添加完成畫面 UI
2. `style.css` - 添加樣式和動畫
3. `js/battle.js` - 整合完成檢測
4. `main.js` - 整合 mixin 和裝備載入
5. `locales/zh-TW.json` - 中文翻譯
6. `locales/en.json` - 英文翻譯

## ❓ 常見問題

**Q: 如何觸發完成畫面？**
A: 擊敗最終地圖的 Boss 即可自動觸發。

**Q: 可以攜帶多件裝備嗎？**
A: 目前版本只支援攜帶一件裝備，以保持遊戲平衡。

**Q: 周目數有上限嗎？**
A: 沒有上限，可以無限進行新周目。

**Q: 攜帶的裝備會消失嗎？**
A: 不會，攜帶的裝備會永久加入新周目的背包中。

**Q: 如何查看當前是第幾周目？**
A: 在完成畫面的統計中可以看到，或在遊戲開始時會顯示周目數。

## 🎯 下一步

詳細的技術文檔請參考 `NEW_GAME_PLUS_GUIDE.md`
