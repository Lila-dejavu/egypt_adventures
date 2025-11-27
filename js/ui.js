// ===== UI Module =====
// Handles UI-related functionality: status display, panels, dialogs

/**
 * UI mixin - methods to be attached to Game prototype
 * Dependencies: showMessage (global), t (global - i18n), currentLanguage (global),
 *               SET_BONUSES, ENEMY_IMAGE_MAP (from data.js)
 */
const UIMixin = {
	/**
	 * Update player and enemy status panels
	 */
	updateStatus() {
		const playerStatusEl = document.getElementById('player-status');
		const enemyStatusEl = document.getElementById('enemy-status');

		if (playerStatusEl) {
			// Calculate combo display text (during battle)
			let comboText = '無';
			if (this.inBattle) {
				const sym = this.consecutivePrimarySymbol || '-';
				const count = this.consecutivePrimaryCount || 0;
				const mult = Math.max(1, count);
				comboText = `${sym} x${count} (x${mult})`;
			}

			const playerPct = Math.max(0, Math.min(100, Math.floor((this.player.hp / this.player.max_hp) * 100)));

			// Calculate XP progress
			const xpNeeded = this.xpForNext(this.player.level);
			const xpPct = this.player.level >= 99 ? 100 : Math.max(0, Math.min(100, Math.floor((this.player.xp / xpNeeded) * 100)));

			// Check set bonus
			const setBonus = this.getActiveSetBonus();
			let setBonusHtml = '';
			if (setBonus) {
				let rarityText = '';
				if (setBonus.rarity === 'rare') rarityText = '稀有';
				else if (setBonus.rarity === 'excellent') rarityText = '精良';
				else if (setBonus.rarity === 'epic') rarityText = '史詩';
				else if (setBonus.rarity === 'legendary') rarityText = '傳說';
				setBonusHtml = `<div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 4px 8px; border-radius: 4px; color: white; font-size: 11px; margin: 4px 0;">⚡ ${setBonus.name} (${rarityText})</div>`;
			}

			playerStatusEl.innerHTML = `
				<div class="stat-label">${currentLanguage === 'zh-TW' ? '玩家' : currentLanguage === 'fr' ? 'Joueur' : 'Player'} Lv.${this.player.level}</div>
				<div class="hp-row">${t('hp')}: <span class="hp-text">${this.player.hp}/${this.player.max_hp}</span></div>
				<div class="hp-bar"><div class="hp-inner" style="width:${playerPct}%"></div></div>
				<div class="xp-row">${currentLanguage === 'zh-TW' ? '經驗' : currentLanguage === 'fr' ? 'XP' : 'XP'}: <span class="xp-text">${this.player.xp}/${xpNeeded === Infinity ? 'MAX' : xpNeeded}</span></div>
				<div class="xp-bar"><div class="xp-inner" style="width:${xpPct}%"></div></div>
				<div class="stats-row">
					<div>${t('stamina')}: ${this.player.stamina}/${this.player.max_stamina}</div>
					<div>${currentLanguage === 'zh-TW' ? '護盾' : currentLanguage === 'fr' ? 'Bouclier' : 'Shield'}: ${this.player.shield}</div>
					<div>${currentLanguage === 'zh-TW' ? '藥水' : currentLanguage === 'fr' ? 'Potions' : 'Potions'}: ${this.player.potions}</div>
					<div>${currentLanguage === 'zh-TW' ? '金幣' : currentLanguage === 'fr' ? 'Or' : 'Gold'}: ${this.player.gold}</div>
					<div>${currentLanguage === 'zh-TW' ? '幸運(戰)' : currentLanguage === 'fr' ? 'Chance(C)' : 'Luck(C)'}: ${this.player.luck_combat}</div>
					<div>${currentLanguage === 'zh-TW' ? '幸運(金)' : currentLanguage === 'fr' ? 'Chance(O)' : 'Luck(G)'}: ${this.player.luck_gold}</div>
				</div>
				${setBonusHtml}
				<div class="combo-row ${(this.inBattle && (this.consecutivePrimaryCount||0) > 1) ? 'combo-active' : ''}">Combo: ${comboText}</div>
				<div class="equip-row">
					<span class="equip-label">${currentLanguage === 'zh-TW' ? '武器' : currentLanguage === 'fr' ? 'Arme' : 'Weapon'}: ${this.player.equipment.weapon ? this.formatItem(this.player.equipment.weapon) : (currentLanguage === 'zh-TW' ? '無' : currentLanguage === 'fr' ? 'Aucun' : 'None')}</span>
					<div class="equip-buttons">
						<button class="open-equip-btn" data-slot="weapon">${currentLanguage === 'zh-TW' ? '裝備' : currentLanguage === 'fr' ? 'Équiper' : 'Equip'}</button>
						<button class="unequip-btn" data-slot="weapon">${currentLanguage === 'zh-TW' ? '卸下' : currentLanguage === 'fr' ? 'Enlever' : 'Unequip'}</button>
					</div>
				</div>
				<div class="equip-row">
					<span class="equip-label">${currentLanguage === 'zh-TW' ? '防具' : currentLanguage === 'fr' ? 'Armure' : 'Armor'}: ${this.player.equipment.armor ? this.formatItem(this.player.equipment.armor) : (currentLanguage === 'zh-TW' ? '無' : currentLanguage === 'fr' ? 'Aucun' : 'None')}</span>
					<div class="equip-buttons">
						<button class="open-equip-btn" data-slot="armor">${currentLanguage === 'zh-TW' ? '裝備' : currentLanguage === 'fr' ? 'Équiper' : 'Equip'}</button>
						<button class="unequip-btn" data-slot="armor">${currentLanguage === 'zh-TW' ? '卸下' : currentLanguage === 'fr' ? 'Enlever' : 'Unequip'}</button>
					</div>
				</div>
				<div class="equip-row">
					<span class="equip-label">${currentLanguage === 'zh-TW' ? '護符' : currentLanguage === 'fr' ? 'Amulette' : 'Amulet'}: ${this.player.equipment.amulet ? this.formatItem(this.player.equipment.amulet) : (currentLanguage === 'zh-TW' ? '無' : currentLanguage === 'fr' ? 'Aucun' : 'None')}</span>
					<div class="equip-buttons">
						<button class="open-equip-btn" data-slot="amulet">${currentLanguage === 'zh-TW' ? '裝備' : currentLanguage === 'fr' ? 'Équiper' : 'Equip'}</button>
						<button class="unequip-btn" data-slot="amulet">${currentLanguage === 'zh-TW' ? '卸下' : currentLanguage === 'fr' ? 'Enlever' : 'Unequip'}</button>
					</div>
				</div>
			`;
		}

		// Update enemy status to right panel
		if (enemyStatusEl) {
			const enemyPct = this.enemy && this.enemy.max_hp ? Math.max(0, Math.min(100, Math.floor((this.enemy.hp / this.enemy.max_hp) * 100))) : 0;
			const enemyLabel = currentLanguage === 'zh-TW' ? '敵人' : currentLanguage === 'fr' ? 'Ennemi' : 'Enemy';
			const noneLabel = currentLanguage === 'zh-TW' ? '無' : currentLanguage === 'fr' ? 'Aucun' : 'None';
			const attackCountdown = currentLanguage === 'zh-TW' ? '攻擊倒數' : currentLanguage === 'fr' ? 'Attaque dans' : 'Attack in';
			const strength = currentLanguage === 'zh-TW' ? '強度' : currentLanguage === 'fr' ? 'Force' : 'Strength';

			// Select enemy image based on type
			let enemyImage = '';
			if (this.inBattle && this.enemy.type) {
				const imagePath = ENEMY_IMAGE_MAP[this.enemy.type] || ENEMY_IMAGE_MAP.default;
				enemyImage = `<div style="text-align: center; margin-top: 5px;"><img src="${imagePath}" alt="${this.enemy.name || ''}" style="max-width: 100%; width: 120px; height: auto; opacity: 0.9; mix-blend-mode: multiply;"></div>`;
			}

			enemyStatusEl.innerHTML = `
				<div class="stat-label">${enemyLabel}</div>
				${this.inBattle ? `
					<div class="hp-row">${this.enemy.name || enemyLabel}  ${t('hp')}: <span class="hp-text">${this.enemy.hp}/${this.enemy.max_hp}</span></div>
					<div class="hp-bar"><div class="hp-inner enemy-hp" style="width:${enemyPct}%"></div></div>
					${enemyImage}
					<div class="stats-row"><div>${attackCountdown}: ${this.enemy.turnsToAttack}</div><div>${strength}: x${(this.enemy.strength||1).toFixed(2)}</div></div>
				` : `
					<div class="hp-row">${noneLabel}</div>
					<div class="hp-bar"><div class="hp-inner enemy-hp" style="width:0%"></div></div>
				`}
			`;
		}

		// Sync brief status summary to sidebar (as backup display)
		const summary = document.getElementById('status-summary');
		if (summary) {
			summary.textContent = `HP:${this.player.hp}/${this.player.max_hp}  體力:${this.player.stamina}/${this.player.max_stamina}  金幣:${this.player.gold}  幸運(戰鬥):${this.player.luck_combat} 金幣幸運:${this.player.luck_gold}`;
		}

		// Update map steps display
		const mapEl = document.getElementById('map-steps');
		if (mapEl) {
			if (this.inPyramid) {
				mapEl.textContent = `🔺 ${this.pyramidSteps}/${this.pyramidMaxSteps}`;
			} else {
				mapEl.textContent = Math.max(0, this.map_goal - this.map_steps);
			}
		}
	},

	/**
	 * Show equipment panel with optional slot filter
	 * @param {string|null} filterSlot - Filter by slot type ('weapon'|'armor'|'amulet') or null for all
	 */
	showEquipmentPanel(filterSlot = null) {
		const panel = document.getElementById('equipment-panel');
		const content = document.getElementById('equip-content');
		if (!panel || !content) return;

		// List current equipment and inventory
		let html = `<div><strong>${t('equipped')}</strong></div>`;
		const noneText = t('none');
		const weapText = this.player.equipment.weapon ? this.formatItem(this.player.equipment.weapon) : noneText;
		const armText = this.player.equipment.armor ? this.formatItem(this.player.equipment.armor) : noneText;
		const amuText = this.player.equipment.amulet ? this.formatItem(this.player.equipment.amulet) : noneText;

		html += `<div>${t('weapon')}: ${weapText} <button class="unequip-inline" data-slot="weapon">${t('unequip')}</button> <button class="open-equip-inline" data-slot="weapon">${t('equip')}</button></div>`;
		html += `<div>${t('armor')}: ${armText} <button class="unequip-inline" data-slot="armor">${t('unequip')}</button> <button class="open-equip-inline" data-slot="armor">${t('equip')}</button></div>`;
		html += `<div>${t('amulet')}: ${amuText} <button class="unequip-inline" data-slot="amulet">${t('unequip')}</button> <button class="open-equip-inline" data-slot="amulet">${t('equip')}</button></div>`;

		// Show set bonus
		const setBonus = this.getActiveSetBonus();
		if (setBonus) {
			const setParts = [];
			const atkLabel = currentLanguage === 'zh-TW' ? '攻' : currentLanguage === 'fr' ? 'ATT' : 'ATK';
			const defLabel = currentLanguage === 'zh-TW' ? '防' : currentLanguage === 'fr' ? 'DÉF' : 'DEF';
			const staminaLabel = currentLanguage === 'zh-TW' ? '體力' : currentLanguage === 'fr' ? 'End' : 'Stam';
			const combatLuckLabel = currentLanguage === 'zh-TW' ? '戰運' : currentLanguage === 'fr' ? 'Chance C' : 'Luck C';
			const goldLuckLabel = currentLanguage === 'zh-TW' ? '金運' : currentLanguage === 'fr' ? 'Chance O' : 'Luck G';
			const critLabel = currentLanguage === 'zh-TW' ? '暴擊' : currentLanguage === 'fr' ? 'Crit' : 'Crit';
			const comboLabel = currentLanguage === 'zh-TW' ? '連擊' : currentLanguage === 'fr' ? 'Combo' : 'Combo';
			const skillLabel = currentLanguage === 'zh-TW' ? '技能' : currentLanguage === 'fr' ? 'Comp' : 'Skill';
			const dodgeLabel = currentLanguage === 'zh-TW' ? '閃避' : currentLanguage === 'fr' ? 'Évit' : 'Dodge';

			if (setBonus.effects.atk) setParts.push(`${atkLabel}+${setBonus.effects.atk}`);
			if (setBonus.effects.def) setParts.push(`${defLabel}+${setBonus.effects.def}`);
			if (setBonus.effects.max_hp_bonus) setParts.push(`${t('hp')}+${setBonus.effects.max_hp_bonus}`);
			if (setBonus.effects.stamina_bonus) setParts.push(`${staminaLabel}+${setBonus.effects.stamina_bonus}`);
			if (setBonus.effects.luck_combat) setParts.push(`${combatLuckLabel}+${setBonus.effects.luck_combat}`);
			if (setBonus.effects.luck_gold) setParts.push(`${goldLuckLabel}+${setBonus.effects.luck_gold}`);
			if (setBonus.effects.crit_rate) setParts.push(`${critLabel}+${setBonus.effects.crit_rate}%`);
			if (setBonus.effects.combo_rate) setParts.push(`${comboLabel}+${setBonus.effects.combo_rate}%`);
			if (setBonus.effects.skill_power) setParts.push(`${skillLabel}+${setBonus.effects.skill_power}%`);
			if (setBonus.effects.dodge_rate) setParts.push(`${dodgeLabel}+${setBonus.effects.dodge_rate}%`);

			let rarityText = '';
			if (setBonus.rarity === 'rare') rarityText = currentLanguage === 'zh-TW' ? '稀有' : currentLanguage === 'fr' ? 'Rare' : 'Rare';
			else if (setBonus.rarity === 'excellent') rarityText = currentLanguage === 'zh-TW' ? '精良' : currentLanguage === 'fr' ? 'Excellent' : 'Excellent';
			else if (setBonus.rarity === 'epic') rarityText = currentLanguage === 'zh-TW' ? '史詩' : currentLanguage === 'fr' ? 'Épique' : 'Epic';
			else if (setBonus.rarity === 'legendary') rarityText = currentLanguage === 'zh-TW' ? '傳說' : currentLanguage === 'fr' ? 'Légendaire' : 'Legendary';

			html += `<hr/><div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 10px; border-radius: 6px; color: white; margin: 8px 0;"><strong>⚡ ${t('setBonus')}: ${setBonus.name} (${rarityText})</strong><br/>${setParts.join(' ')}</div>`;
		}

		html += `<hr/><div><strong>${t('inventory')}</strong></div>`;
		const inv = this.player.inventory;
		let shown = 0;

		for (let i = 0; i < inv.length; i++) {
			const it = inv[i];
			if (filterSlot && it.slot !== filterSlot) continue;
			shown++;
			const disp = this.formatItem(it) || `${it.name}`;
			html += `<div>${i+1}. ${disp} (${it.rarity}) <button data-idx="${i}" class="equip-now">${t('equip')}</button></div>`;
		}

		if (shown === 0) html += `<div>${t('noMatchingItems')}</div>`;
		content.innerHTML = html;
		panel.style.display = 'block';

		const game = this;

		// Bind equip buttons
		setTimeout(() => {
			Array.from(content.querySelectorAll('.equip-now')).forEach(b => {
				b.addEventListener('click', () => {
					const idx = parseInt(b.getAttribute('data-idx'));
					game.equipItem(idx);
					game.showEquipmentPanel(filterSlot);
				});
			});

			// Inline unequip/equip buttons
			Array.from(content.querySelectorAll('.unequip-inline')).forEach(b => {
				b.addEventListener('click', () => {
					const slot = b.getAttribute('data-slot');
					game.unequipItem(slot);
					game.showEquipmentPanel(filterSlot);
				});
			});

			Array.from(content.querySelectorAll('.open-equip-inline')).forEach(b => {
				b.addEventListener('click', () => {
					const slot = b.getAttribute('data-slot');
					game.showEquipmentPanel(slot);
				});
			});
		}, 50);
	},

	/**
	 * Show generic choice dialog panel
	 * @param {string} title - Dialog title
	 * @param {Array} choices - Array of {id, label} choice objects
	 * @param {Function} callback - Callback function receiving chosen id
	 */
	showChoicePanel(title, choices, callback) {
		// Disable movement buttons
		const mf = document.getElementById('move-front'); if (mf) mf.disabled = true;
		const ml = document.getElementById('move-left'); if (ml) ml.disabled = true;
		const mr = document.getElementById('move-right'); if (mr) mr.disabled = true;

		// Create choice dialog
		const panel = document.createElement('div');
		panel.id = 'encounter-choice-panel';
		panel.style.cssText = `
			position: fixed;
			top: 50%;
			left: 50%;
			transform: translate(-50%, -50%);
			background: linear-gradient(180deg, #fff9e6, #ffe4b3);
			border: 3px solid #d4a855;
			border-radius: 12px;
			padding: 24px;
			box-shadow: 0 8px 24px rgba(0,0,0,0.3);
			z-index: 100;
			min-width: 320px;
			max-width: 90vw;
			text-align: center;
		`;

		// Generate choice buttons HTML
		const choicesHtml = choices.map(choice => `
			<button class="choice-btn" data-choice-id="${choice.id}" style="
				display: block;
				width: 100%;
				padding: 12px 16px;
				margin: 8px 0;
				font-size: 1em;
				background: linear-gradient(180deg, #f5f5f5, #e0e0e0);
				color: #333;
				border: 2px solid #d4a855;
				border-radius: 6px;
				cursor: pointer;
				transition: all 0.2s;
			">${choice.label}</button>
		`).join('');

		panel.innerHTML = `
			<h2 style="color: #8b4513; margin-top: 0; margin-bottom: 16px;">🏜️ ${title}</h2>
			<div style="text-align: left;">
				${choicesHtml}
			</div>
		`;

		document.body.appendChild(panel);

		// Bind choice button events
		const choiceBtns = panel.querySelectorAll('.choice-btn');
		choiceBtns.forEach(btn => {
			btn.addEventListener('mouseenter', () => {
				btn.style.background = 'linear-gradient(180deg, #e8b44c, #d4a02e)';
				btn.style.color = 'white';
			});
			btn.addEventListener('mouseleave', () => {
				btn.style.background = 'linear-gradient(180deg, #f5f5f5, #e0e0e0)';
				btn.style.color = '#333';
			});
			btn.addEventListener('click', () => {
				const choiceId = btn.getAttribute('data-choice-id');
				// Remove panel
				if (panel.parentNode) {
					panel.parentNode.removeChild(panel);
				}
				// Re-enable movement buttons
				if (mf) mf.disabled = false;
				if (ml) ml.disabled = false;
				if (mr) mr.disabled = false;
				// Execute callback
				if (callback) {
					callback(choiceId);
				}
			});
		});
	},

	/**
	 * Show pyramid entrance choice dialog
	 */
	showPyramidChoice() {
		// Disable movement buttons
		const mf = document.getElementById('move-front'); if (mf) mf.disabled = true;
		const ml = document.getElementById('move-left'); if (ml) ml.disabled = true;
		const mr = document.getElementById('move-right'); if (mr) mr.disabled = true;

		const game = this;

		// Create choice dialog
		const panel = document.createElement('div');
		panel.id = 'pyramid-choice-panel';
		panel.style.cssText = `
			position: fixed;
			top: 50%;
			left: 50%;
			transform: translate(-50%, -50%);
			background: linear-gradient(180deg, #fff9e6, #ffe4b3);
			border: 3px solid #d4a855;
			border-radius: 12px;
			padding: 24px;
			box-shadow: 0 8px 24px rgba(0,0,0,0.3);
			z-index: 100;
			min-width: 350px;
			text-align: center;
		`;

		panel.innerHTML = `
			<h2 style="color: #8b4513; margin-top: 0;">🔺 金字塔副本</h2>
			<p style="font-size: 1.1em; line-height: 1.6;">
				是否進入金字塔探險？
			</p>
			<div style="background: #fff; padding: 12px; border-radius: 6px; margin: 12px 0; border: 1px solid #ddd;">
				<strong>副本特性（地圖${this.difficulty}）：</strong><br>
				✦ 8步探險旅程<br>
				✦ 敵人強度極高（HP x${(3 + this.difficulty * 0.5).toFixed(1)}, ATK x${(2.5 + this.difficulty * 0.3).toFixed(1)}）<br>
				✦ 經驗值 x15 倍<br>
				✦ 金幣 x15 倍<br>
				✦ 保證掉落優良以上裝備<br>
			</div>
			<div style="display: flex; gap: 12px; justify-content: center; margin-top: 20px;">
				<button id="pyramid-enter-btn" style="
					padding: 12px 24px;
					font-size: 1.1em;
					background: linear-gradient(180deg, #e8b44c, #d4a02e);
					color: white;
					border: none;
					border-radius: 6px;
					cursor: pointer;
					font-weight: bold;
					box-shadow: 0 2px 6px rgba(0,0,0,0.2);
				">⚔️ 進入探險</button>
				<button id="pyramid-decline-btn" style="
					padding: 12px 24px;
					font-size: 1.1em;
					background: linear-gradient(180deg, #999, #777);
					color: white;
					border: none;
					border-radius: 6px;
					cursor: pointer;
					font-weight: bold;
					box-shadow: 0 2px 6px rgba(0,0,0,0.2);
				">🚶 離開</button>
			</div>
		`;

		document.body.appendChild(panel);

		// Bind button events
		const enterBtn = document.getElementById('pyramid-enter-btn');
		if (enterBtn) {
			enterBtn.addEventListener('click', () => {
				game.enterPyramid();
				document.body.removeChild(panel);
			});
		}

		const declineBtn = document.getElementById('pyramid-decline-btn');
		if (declineBtn) {
			declineBtn.addEventListener('click', () => {
				showMessage('你決定不進入金字塔，繼續前行。');
				document.body.removeChild(panel);
				// Re-enable movement buttons
				if (mf) mf.disabled = false;
				if (ml) ml.disabled = false;
				if (mr) mr.disabled = false;
			});
		}
	}
};
