$file = "main.js"
$content = Get-Content $file -Raw -Encoding UTF8

# 找到並替換updateStatus函數中的關鍵部分
$oldCode = @'
			// 左右並列顯示玩家與敵人資訊，含即時血條
			const playerPct = Math.max(0, Math.min(100, Math.floor((this.player.hp / this.player.max_hp) * 100)));
			const enemyPct = this.enemy && this.enemy.max_hp ? Math.max(0, Math.min(100, Math.floor((this.enemy.hp / this.enemy.max_hp) * 100))) : 0;
			statusEl.innerHTML = `
				<div class="status-box player-box">
					<div class="stat-label">玩家</div>
					<div class="hp-row">HP: <span class="hp-text">${this.player.hp}/${this.player.max_hp}</span></div>
					<div class="hp-bar"><div class="hp-inner" style="width:${playerPct}%"></div></div>
                        <div class="stats-row">
                        	<div>體力: ${this.player.stamina}/${this.player.max_stamina}</div>
                        	<div>護盾: ${this.player.shield}</div>
                        	<div>藥水: ${this.player.potions}</div>
                        	<div>金幣: ${this.player.gold}</div>
                        	<div>幸運(戰鬥): ${this.player.luck_combat}  幸運(金幣): ${this.player.luck_gold}</div>
                    	</div>
						<div class="combo-row ${ (this.inBattle && (this.consecutivePrimaryCount||0) > 1) ? 'combo-active' : '' }">Combo: ${comboText}</div>
							<div class="equip-row">
								<div>武器: ${this.player.equipment.weapon ? this.formatItem(this.player.equipment.weapon) : '無'} <button class="open-equip-btn" data-slot="weapon">裝備</button> <button class="unequip-btn" data-slot="weapon">卸下</button></div>
								<div>防具: ${this.player.equipment.armor ? this.formatItem(this.player.equipment.armor) : '無'} <button class="open-equip-btn" data-slot="armor">裝備</button> <button class="unequip-btn" data-slot="armor">卸下</button></div>
								<div>護符: ${this.player.equipment.amulet ? this.formatItem(this.player.equipment.amulet) : '無'} <button class="open-equip-btn" data-slot="amulet">裝備</button> <button class="unequip-btn" data-slot="amulet">卸下</button></div>
							</div>
				</div>
				<div class="status-box enemy-box">
					<div class="stat-label">敵人</div>
					${this.inBattle ? `
						<div class="hp-row">${this.enemy.name || '敵人'}  HP: <span class="hp-text">${this.enemy.hp}/${this.enemy.max_hp}</span></div>
						<div class="hp-bar"><div class="hp-inner enemy-hp" style="width:${enemyPct}%"></div></div>
						<div class="stats-row"><div>普攻倒數: ${this.enemy.turnsToAttack}</div><div>強度: x${(this.enemy.strength||1).toFixed(2)}</div></div>
					` : `
						<div class="hp-row">無</div>
						<div class="hp-bar"><div class="hp-inner enemy-hp" style="width:0%"></div></div>
					`}
				</div>
			`;
		}
'@

$newCode = @'
			// 更新左側玩家狀態
			const playerStatusEl = document.getElementById('player-status');
			if (playerStatusEl) {
				const playerPct = Math.max(0, Math.min(100, Math.floor((this.player.hp / this.player.max_hp) * 100)));
				playerStatusEl.innerHTML = `
					<div class="stat-label">玩家</div>
					<div class="hp-row">HP: ${this.player.hp}/${this.player.max_hp}</div>
					<div class="hp-bar"><div class="hp-inner" style="width:${playerPct}%"></div></div>
					<div style="font-size:0.9em; margin-top:8px;">
						<div>體力: ${this.player.stamina}/${this.player.max_stamina}</div>
						<div>護盾: ${this.player.shield}</div>
						<div>藥水: ${this.player.potions}</div>
						<div>金幣: ${this.player.gold}</div>
					</div>
					<div class="combo-row ${ (this.inBattle && (this.consecutivePrimaryCount||0) > 1) ? 'combo-active' : '' }" style="font-size:0.85em; margin-top:8px;">Combo: ${comboText}</div>
				`;
			}
			
			// 更新右側敵人狀態
			const enemyStatusEl = document.getElementById('enemy-status');
			if (enemyStatusEl) {
				if (this.inBattle && this.enemy) {
					const enemyPct = Math.max(0, Math.min(100, Math.floor((this.enemy.hp / this.enemy.max_hp) * 100)));
					enemyStatusEl.innerHTML = `
						<div class="stat-label">${this.enemy.name || '敵人'}</div>
						<div class="hp-row">HP: ${this.enemy.hp}/${this.enemy.max_hp}</div>
						<div class="hp-bar"><div class="hp-inner enemy-hp" style="width:${enemyPct}%"></div></div>
						<div style="font-size:0.9em; margin-top:8px;">
							<div>普攻倒數: ${this.enemy.turnsToAttack}</div>
							<div>強度: x${(this.enemy.strength||1).toFixed(2)}</div>
						</div>
					`;
				} else {
					enemyStatusEl.innerHTML = `
						<div class="stat-label">敵人</div>
						<div class="hp-row">無</div>
						<div class="hp-bar"><div class="hp-inner enemy-hp" style="width:0%"></div></div>
					`;
				}
			}
			
			// 保留原狀態面板（隱藏但保持相容性）
			const playerPct = Math.max(0, Math.min(100, Math.floor((this.player.hp / this.player.max_hp) * 100)));
			const enemyPct = this.enemy && this.enemy.max_hp ? Math.max(0, Math.min(100, Math.floor((this.enemy.hp / this.enemy.max_hp) * 100))) : 0;
			statusEl.innerHTML = `
				<div class="status-box player-box">
					<div class="stat-label">玩家</div>
					<div class="hp-row">HP: <span class="hp-text">${this.player.hp}/${this.player.max_hp}</span></div>
					<div class="hp-bar"><div class="hp-inner" style="width:${playerPct}%"></div></div>
                        <div class="stats-row">
                        	<div>體力: ${this.player.stamina}/${this.player.max_stamina}</div>
                        	<div>護盾: ${this.player.shield}</div>
                        	<div>藥水: ${this.player.potions}</div>
                        	<div>金幣: ${this.player.gold}</div>
                        	<div>幸運(戰鬥): ${this.player.luck_combat}  幸運(金幣): ${this.player.luck_gold}</div>
                    	</div>
						<div class="combo-row ${ (this.inBattle && (this.consecutivePrimaryCount||0) > 1) ? 'combo-active' : '' }">Combo: ${comboText}</div>
							<div class="equip-row">
								<div>武器: ${this.player.equipment.weapon ? this.formatItem(this.player.equipment.weapon) : '無'} <button class="open-equip-btn" data-slot="weapon">裝備</button> <button class="unequip-btn" data-slot="weapon">卸下</button></div>
								<div>防具: ${this.player.equipment.armor ? this.formatItem(this.player.equipment.armor) : '無'} <button class="open-equip-btn" data-slot="armor">裝備</button> <button class="unequip-btn" data-slot="armor">卸下</button></div>
								<div>護符: ${this.player.equipment.amulet ? this.formatItem(this.player.equipment.amulet) : '無'} <button class="open-equip-btn" data-slot="amulet">裝備</button> <button class="unequip-btn" data-slot="amulet">卸下</button></div>
							</div>
				</div>
				<div class="status-box enemy-box">
					<div class="stat-label">敵人</div>
					${this.inBattle ? `
						<div class="hp-row">${this.enemy.name || '敵人'}  HP: <span class="hp-text">${this.enemy.hp}/${this.enemy.max_hp}</span></div>
						<div class="hp-bar"><div class="hp-inner enemy-hp" style="width:${enemyPct}%"></div></div>
						<div class="stats-row"><div>普攻倒數: ${this.enemy.turnsToAttack}</div><div>強度: x${(this.enemy.strength||1).toFixed(2)}</div></div>
					` : `
						<div class="hp-row">無</div>
						<div class="hp-bar"><div class="hp-inner enemy-hp" style="width:0%"></div></div>
					`}
				</div>
			`;
		}
'@

$newContent = $content.Replace($oldCode, $newCode)

if ($newContent -ne $content) {
    $newContent | Set-Content $file -Encoding UTF8 -NoNewline
    Write-Host "Successfully updated main.js"
} else {
    Write-Host "No changes made - pattern not found"
}
