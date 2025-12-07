# 遊戲完成與新周目系統

## 功能概述

此更新為 Egypt Adventures 遊戲添加了完成畫面和新周目（New Game+）系統，讓玩家可以攜帶一件裝備進入下一周目重新開始遊戲。

## 新增功能

### 1. 完成畫面
- 當玩家擊敗最終地圖的 Boss 後，會顯示華麗的恭喜畫面
- 顯示完成統計：最終等級、累積金幣、完成地圖數、周目數
- 提供裝備選擇介面，讓玩家選擇一件裝備攜帶至下一周目

### 2. 裝備攜帶系統
- 玩家可以選擇攜帶以下任一裝備：
  - 已裝備的武器、護甲或護符
  - 背包中的任何裝備
  - 或選擇不攜帶任何裝備
- 選中的裝備會在新周目開始時出現在背包中

### 3. 新周目機制
- 周目數會自動累積並保存在 localStorage
- 每個周目會增加遊戲難度：
  - 敵人生命值和攻擊力增加 20%
  - 獎勵（金幣和經驗值）增加 30%
  - 地圖難度和步數需求隨周目增加

## 技術實現

### 新增文件
- `js/mixins/NewGamePlusMixin.js` - 包含所有新周目相關功能

### 修改的文件
1. `index.html` - 添加完成畫面的 HTML 結構
2. `style.css` - 添加完成畫面的樣式和動畫
3. `js/battle.js` - 在 Boss 戰勝利後觸發完成畫面
4. `main.js` - 整合 NewGamePlusMixin 並在遊戲開始時應用攜帶的裝備
5. `locales/zh-TW.json` - 添加繁體中文翻譯
6. `locales/en.json` - 添加英文翻譯

### 核心方法

#### NewGamePlusMixin.showVictoryScreen()
顯示完成畫面，包含：
- 統計資訊顯示
- 裝備選擇界面生成
- 事件處理器設置

#### NewGamePlusMixin.startNewGamePlus()
處理新周目開始：
- 保存選中的裝備到 localStorage
- 增加周目計數
- 重新載入遊戲

#### NewGamePlusMixin.applyCarryoverEquipment()
在遊戲開始時應用攜帶的裝備：
- 讀取保存的裝備資料
- 添加到玩家背包
- 清除一次性使用的資料

## 資料儲存

使用 localStorage 儲存以下資料：
- `egypt_playthroughs` - 完成的周目數（整數）
- `egypt_carryover_equipment` - 攜帶的裝備資料（JSON 字串，一次性使用）

## 測試

提供測試頁面：`test/victory_screen_test.html`

測試功能包括：
- 顯示完成畫面
- 重置周目數
- 添加測試裝備
- 查看當前狀態

## 使用方式

### 對玩家
1. 完成遊戲（擊敗最終 Boss）
2. 在完成畫面中查看統計資料
3. 選擇一件裝備攜帶（或選擇不攜帶）
4. 點擊「開始新周目」按鈕
5. 遊戲重新開始，選中的裝備會出現在背包中

### 對開發者
如需重置周目進度：
```javascript
localStorage.setItem('egypt_playthroughs', '0');
localStorage.removeItem('egypt_carryover_equipment');
```

## 國際化支援

新增的翻譯 key：
- `congratulations` - 恭喜通關標題
- `victoryDescription` - 完成描述
- `selectCarryOverEquipment` - 選擇裝備提示
- `startNewGamePlus` - 開始新周目按鈕
- `noEquipmentToCarry` - 無裝備提示
- `skipCarryOver` - 跳過攜帶選項
- `gameCompleteStats` - 統計標題
- `finalLevel` - 最終等級
- `totalGold` - 累積金幣
- `defeatedEnemies` - 擊敗敵人（預留）
- `completedMaps` - 完成地圖
- `playthroughCount` - 周目數

## UI/UX 特色

1. **流暢動畫**
   - 淡入動畫（0.5秒）
   - 背景遮罩淡入（0.3秒）
   - 按鈕懸停效果

2. **響應式設計**
   - 在小螢幕上自動調整尺寸
   - 觸控友好的選擇介面

3. **視覺反饋**
   - 選中的裝備有特殊樣式
   - 懸停時裝備項目會平移
   - 按鈕有縮放和陰影效果

## 未來擴展建議

1. 添加更多統計資料（如擊敗敵人數量、使用技能次數等）
2. 實現多件裝備攜帶（需要平衡性考量）
3. 添加成就系統
4. 周目獎勵差異化（如解鎖特殊職業或技能）
5. 排行榜系統（需要後端支援）

## 注意事項

- 攜帶的裝備只在新周目開始時添加一次
- 周目數會持續累積，不會自動重置
- 遊戲難度會隨周目增加，建議攜帶高品質裝備
- 完成畫面會播放勝利音樂（如果音樂系統可用）
