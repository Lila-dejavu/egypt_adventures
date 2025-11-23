# 批量翻譯腳本 - 將 main.js 中的硬編碼中文替換為 t() 函數調用

$filePath = "c:\Users\Lila\Desktop\code\egypt_adventures\main.js"
$content = Get-Content -Path $filePath -Raw -Encoding UTF8

# 替換規則列表
$replacements = @(
    # 戰鬥系統
    @{Old='你閃避了敵人的自動普攻！\(戰鬥幸運'; New='`${t(''dodgedAttack'')} '},
    @{Old='敵人自動普攻，造成'; New='`${t(''enemyAutoAttack'')}'},
    @{Old='傷害（護盾吸收'; New='`${t(''damageText'')}（`${t(''shieldAbsorbed'')}'},
    @{Old='），玩家 HP -'; New='），`${t(''playerHp'')} -'},
    
    # 罹難旅人
    @{Old='⚔️ 你在遺體旁找到了'; New='`${t(''foundEquipmentOnBody'')}'},
    @{Old='💰 你找到了'; New='`${t(''foundGoldAndItem'')}'},
    @{Old='金幣和'; New='`${t(''goldCoinsText'')}'},
    @{Old='💰 你在遺體旁找到了'; New='`${t(''foundGoldOnly'')}'},
    @{Old='金幣。'; New='`${t(''goldCoinsEnd'')}'},
    @{Old='（小心離開時受到輕傷 -'; New='`${t(''minorInjury'')} -'},
    @{Old=' HP）'; New=' `${t(''hpLoss'')}'},
    
    # 神殿事件
    @{Old='✨ 神殿的祝福降臨！最大HP \+'; New='`${t(''templeBlessingMaxHp'')} +'},
    @{Old='✨ 神殿的祝福降臨！戰鬥幸運 \+'; New='`${t(''templeBlessingCombatLuck'')} +'},
    @{Old='✨ 神殿的祝福降臨！金幣幸運 \+'; New='`${t(''templeBlessingGoldLuck'')} +'},
    @{Old='💎 你在神殿中找到了古老的寶藏！獲得'; New='`${t(''templeTreasure'')}'},
    @{Old='受到詛咒傷害 -'; New='`${t(''curseDamage'')} -'},
    @{Old='陷阱造成'; New='`${t(''trapDamage'')}'},
    @{Old='點傷害！'; New='`${t(''pointDamage'')}'},
    
    # 商隊休息
    @{Old='💰 商隊隊長贈送你一些金幣（\+'; New='`${t(''caravanGiftGold'')}'},
    @{Old='）以答謝你的到來。'; New='`${t(''thankYou'')}'},
    
    # 遊牧民
    @{Old='🎁 遊牧民贈送你一件'; New='`${t(''nomadGiftItem'')}'},
    @{Old='（已加入背包）'; New='`${t(''addedToInventoryMsg'')}'},
    @{Old='獲得經驗值和'; New='`${t(''gainedExpAndGold'')}'},
    
    # 流沙/毒蠍
    @{Old='消耗體力 -'; New='`${t(''staminaConsumed'')} -'},
    @{Old='受到毒素傷害 -'; New='`${t(''poisonDamage'')} -'},
    @{Old='HP -'; New='`${t(''hpStaminaLoss'')} -'},
    @{Old='，體力 -'; New='，`${t(''staminaRestore'')} -'},
    @{Old='獲得'; New='`${t(''gainedGold'')}'},
    
    # 古代遺跡
    @{Old='⚱️ 你在遺跡中找到了古代神器'; New='`${t(''foundArtifact'')}'},
    @{Old='受到'; New='`${t(''receivedDamage'')}'},
    
    # 驛站
    @{Old='💰 賣出'; New='`${t(''soldItem'')}'},
    @{Old='，獲得'; New='，`${t(''obtainedGold'')}'},
    
    # 神祇
    @{Old='獲得祝福：金幣 \+'; New='`${t(''godBlessingGold'')} +'},
    @{Old='（含金幣幸運加成'; New='`${t(''goldLuckBonus2'')}'},
    @{Old='金幣幸運 -1（剩餘'; New='`${t(''goldLuckDecreased'')} -1（`${t(''remaining'')}'},
    
    # 金字塔
    @{Old='金字塔副本完成！探索了'; New='`${t(''pyramidComplete'')}'},
    @{Old='步。'; New='`${t(''stepCount'')}'},
    
    # 插槽戰鬥
    @{Old='主要符號：'; New='`${t(''slotResult'')}'},
    @{Old='，匹配數：'; New='`${t(''matchCount'')}'},
    @{Old='，連續 x'; New='`${t(''consecutive'')} x'},
    @{Old='（乘數'; New='`${t(''multiplier'')}'},
    @{Old='你發動普通攻擊'; New='`${t(''normalAttack'')}'},
    @{Old='你使用技能'; New='`${t(''skillAttack'')}'},
    @{Old='，對敵人造成'; New='`${t(''causingDamage'')}'},
    @{Old='你獲得防禦'; New='`${t(''defenseGain'')}'},
    @{Old='（連擊'; New='`${t(''combo'')}'},
    @{Old='），護盾 \+'; New='`${t(''shieldGain'')} +'},
    @{Old='使用紅色水瓶'; New='`${t(''potionUse'')}'},
    @{Old='，回復 HP'; New='`${t(''restoreHp'')}'},
    @{Old='獲得戰鬥幸運 \+'; New='`${t(''luckGain'')} +'},
    @{Old='，提高暴擊與閃避機率。'; New='`${t(''improveRate'')}'},
    @{Old='你閃避了敵人符號攻擊（戰鬥幸運'; New='`${t(''dodgedSymbolAttack'')} '},
    @{Old='（暴擊）'; New='`${t(''critText'')}'}
)

# 執行替換
foreach ($rep in $replacements) {
    $content = $content -replace $rep.Old, $rep.New
}

# 保存文件
$content | Set-Content -Path $filePath -Encoding UTF8 -NoNewline

Write-Host "批量翻譯完成！已處理 $($replacements.Count) 個替換規則。"
