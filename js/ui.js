// ===== UI Module =====
// Handles UI-related functionality: status display, panels, dialogs

/**
 * UI mixin - methods to be attached to Game prototype
 * Dependencies: showMessage (global), t (global - i18n),
 *               SET_BONUSES, ENEMY_IMAGE_MAP (from data.js),
 *               DOMRefs (from DOMRefs.js)
 */
const UIMixin = {
	/**
	 * Update player and enemy status panels
	 */
	updateStatus() {
		const playerStatusEl = DOMRefs.playerStatus;
		const enemyStatusEl = DOMRefs.enemyStatus;

		if (playerStatusEl) {
			// Calculate combo display text (during battle)
			let comboText = t('none');
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

			// Bloodline display (show below XP if present)
			let bloodlineHtml = '';
			try {
				if (this.player && this.player.bloodline) {
					const bn = this.player.bloodline.name || this.player.bloodline.id || '';
					bloodlineHtml = `<div class="combo-row bloodline-row">已覺醒 ${bn} 血脈</div>`;
				}
			} catch (e) { bloodlineHtml = ''; }

			// Check set bonus
			const setBonus = this.getActiveSetBonus();
			let setBonusHtml = '';
			if (setBonus) {
				const rarityText = this._getRarityText(setBonus.rarity);
				setBonusHtml = `<div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 4px 8px; border-radius: 4px; color: white; font-size: 11px; margin: 4px 0;">⚡ ${setBonus.name} (${rarityText})</div>`;
			}
			
			// Show active debuffs (e.g., 屍毒)
			let debuffHtml = '';
			if (this.player.debuffs && this.player.debuffs.corpse_poison) {
				const cp = this.player.debuffs.corpse_poison;
				if (cp.stacks && Array.isArray(cp.stacks)) {
					const total = cp.stacks.reduce((s, st) => s + (st.dmg || 0), 0);
					const minTurns = cp.stacks.reduce((m, st) => Math.min(m, st.turns || Infinity), Infinity) || 0;
					debuffHtml = `<div style="margin-top:6px;color:#b03030;font-weight:bold;">💀 屍毒：${cp.stacks.length} 層（每回合 -${total} HP，最短 ${minTurns} 回合）</div>`;
				} else {
					const cpLegacy = cp;
					debuffHtml = `<div style="margin-top:6px;color:#b03030;font-weight:bold;">💀 屍毒：剩餘 ${cpLegacy.turns} 回合（每回合 -${cpLegacy.dmg} HP）</div>`;
				}
			}

			playerStatusEl.innerHTML = `
				<div class="stat-label">${t('player')} Lv.${this.player.level}</div>
				<div class="hp-row">${t('hp')}: <span class="hp-text">${this.player.hp}/${this.player.max_hp}</span></div>
				<div class="hp-bar"><div class="hp-inner" style="width:${playerPct}%"></div></div>
				<div class="xp-row">${t('xp')}: <span class="xp-text">${this.player.xp}/${xpNeeded === Infinity ? 'MAX' : xpNeeded}</span></div>
				<div class="xp-bar"><div class="xp-inner" style="width:${xpPct}%"></div></div>
				${bloodlineHtml}
				<div class="stats-row">
					<div>${t('stamina')}: ${this.player.stamina}/${this.player.max_stamina}</div>
						<div>${t('mana') || '魔力'}: ${this.player.mana || 0}/${this.player.max_mana || 0}</div>
						${this.player.selectedClass === 'mage' ? `<div id='mage-skill-row'>法術：${this.player.mage_selected_skill ? (window.MageSkills && MageSkills.SKILLS && MageSkills.SKILLS[this.player.mage_selected_skill] ? MageSkills.SKILLS[this.player.mage_selected_skill].name : this.player.mage_selected_skill) : '（未設定）'} <button id='change-skill-btn' class='small'>切換</button></div>` : ''}
					<div>${t('shield')}: ${this.player.shield}</div>
					<div>${t('potions')}: ${this.player.potions}</div>
					<div>${t('gold')}: ${this.player.gold}</div>
					<div>${t('luckCombat')}: ${this.player.luck_combat}</div>
					<div>${t('luckGoldShort')}: ${this.player.luck_gold}</div>
				</div>
				${setBonusHtml}
				${debuffHtml}
				${playerBuffHtml || ''}
				<div class="combo-row ${(this.inBattle && (this.consecutivePrimaryCount||0) > 1) ? 'combo-active' : ''}">Combo: ${comboText}</div>
				<div class="equip-row">
					<span class="equip-label">${t('weapon')}: ${this.player.equipment.weapon ? this.formatItem(this.player.equipment.weapon) : t('none')}</span>
					<div class="equip-buttons">
						<button class="open-equip-btn" data-slot="weapon">${t('equip')}</button>
						<button class="unequip-btn" data-slot="weapon">${t('unequip')}</button>
					</div>
				</div>
				<div class="equip-row">
					<span class="equip-label">${t('armor')}: ${this.player.equipment.armor ? this.formatItem(this.player.equipment.armor) : t('none')}</span>
					<div class="equip-buttons">
						<button class="open-equip-btn" data-slot="armor">${t('equip')}</button>
						<button class="unequip-btn" data-slot="armor">${t('unequip')}</button>
					</div>
				</div>
				<div class="equip-row">
					<span class="equip-label">${t('amulet')}: ${this.player.equipment.amulet ? this.formatItem(this.player.equipment.amulet) : t('none')}</span>
					<div class="equip-buttons">
						<button class="open-equip-btn" data-slot="amulet">${t('equip')}</button>
						<button class="unequip-btn" data-slot="amulet">${t('unequip')}</button>
					</div>
				</div>
			`;

			// Attach handler for change-skill button (since innerHTML was replaced)
			if(this.player.selectedClass === 'mage'){
				const btn = playerStatusEl.querySelector('#change-skill-btn');
				if(btn){ btn.addEventListener('click', ()=>{ try{ this.showMageSkillSelector(); }catch(e){ console.warn('showMageSkillSelector failed', e); } }); }
			}
		}

		// Build player temporary buffs display (shown inside player status)
		let playerBuffHtml = '';
		try {
			if (this.player && this.player.temp_buffs) {
				const LABELS = { attack: '攻擊', penetration: '穿透', shield: '護盾', regen: '回復', stamina: '體力', mana: '魔力' };
				const parts = [];
				for (const key in this.player.temp_buffs) {
					if (!Object.prototype.hasOwnProperty.call(this.player.temp_buffs, key)) continue;
					const b = this.player.temp_buffs[key];
					if (!b) continue;
					const label = LABELS[key] || key;
					// Support stacked-like or single object shapes
					if (Array.isArray(b.stacks)) {
						const stacks = b.stacks.length;
						const minTurns = b.stacks.reduce((m, s) => Math.min(m, s.turns || Infinity), Infinity) || 0;
						parts.push(`<div class='combo-row buff-row'>${label} ${stacks} 層（最短 ${minTurns} 回合）</div>`);
						continue;
					}
					const turns = (typeof b.turns === 'number') ? b.turns : (typeof b.duration === 'number' ? b.duration : null);
					const val = (typeof b.value !== 'undefined') ? b.value : (typeof b.pct !== 'undefined' ? (Math.round(b.pct*100)+'%') : '');
					if (turns !== null) {
						parts.push(`<div class='combo-row buff-row'>${label} ${val ? ('+'+val+' ') : ''}${turns} 回合</div>`);
					} else if (val) {
						parts.push(`<div class='combo-row buff-row'>${label} +${val}</div>`);
					} else {
						parts.push(`<div class='combo-row buff-row'>${label}</div>`);
					}
				}
				playerBuffHtml = parts.join('');
			}
		} catch (e) { console.warn('player buff render failed', e); }

		// Update enemy status to right panel
		if (enemyStatusEl) {
			const enemyPct = this.enemy && this.enemy.max_hp ? Math.max(0, Math.min(100, Math.floor((this.enemy.hp / this.enemy.max_hp) * 100))) : 0;

			// Select enemy image based on type
			let enemyImage = '';
			if (this.inBattle && this.enemy.type) {
				const imagePath = ENEMY_IMAGE_MAP[this.enemy.type] || ENEMY_IMAGE_MAP.default;
				// Use larger width for boss images
				// For boss, render as a blended background container so the art fuses with panel
				if (this.enemy.type === 'boss') {
					// Use background-image with overlay and blend to integrate into UI theme
					enemyImage = `
						<div style="display:flex;justify-content:center;align-items:center;margin-top:6px;">
							<div style="width:100%;max-width:320px;height:220px;position:relative;border-radius:8px;overflow:hidden;box-shadow:0 8px 20px rgba(0,0,0,0.15);background-color:rgba(217,180,120,0.85);background-image: url('${imagePath}');background-size: cover;background-position:center;background-repeat:no-repeat;mix-blend-mode:multiply;">
								<!-- subtle overlay to keep text readable -->
								<div style=\"position:absolute;inset:0;background:linear-gradient(180deg, rgba(255,255,255,0.0) 0%, rgba(0,0,0,0.15) 100%);mix-blend-mode:overlay;\"></div>
								<!-- foreground miniature art for clarity -->
								<img src="${imagePath}" alt="${this.enemy.name || ''}" style="position:absolute;right:12px;bottom:8px;width:125px;height:auto;opacity:0.98;filter:drop-shadow(0 6px 12px rgba(0,0,0,0.35));">
							</div>
						</div>`;
				} else {
					const imageWidth = 120;
					enemyImage = `<div style="text-align: center; margin-top: 5px;"><img src="${imagePath}" alt="${this.enemy.name || ''}" style="max-width: 100%; width: ${imageWidth}px; height: auto; opacity: 0.9;"></div>`;
				}
			}

			// Build enemy debuff display (show each debuff like a combo box)
			let enemyDebuffHtml = '';
			try {
				if (this.inBattle && this.enemy && this.enemy.debuffs) {
					const STATUS_LABELS = { burn: '灼燒', burn_mage: '灼燒', burn_strong: '焚身', bleed: '流血', poison: '中毒', frozen: '冰凍', shock_mage: '震懾', curse_mage: '詛咒' };
					const parts = [];
					for (const key in this.enemy.debuffs) {
						if (!Object.prototype.hasOwnProperty.call(this.enemy.debuffs, key)) continue;
						const d = this.enemy.debuffs[key];
						if (!d) continue;
						const label = STATUS_LABELS[key] || (d.name || key);
						// Stacked form
						if (Array.isArray(d.stacks)) {
							const stacks = d.stacks.length;
							// find shortest remaining turns among stacks for display
							const minTurns = d.stacks.reduce((m, s) => Math.min(m, s.turns || Infinity), Infinity) || 0;
							parts.push(`<div class='combo-row debuff-row'>${label} ${stacks} 層（最短 ${minTurns} 回合）</div>`);
							continue;
						}
						// Legacy single-object shape: { turns, dmg }
						const turns = (typeof d.turns === 'number') ? d.turns : (typeof d.duration === 'number' ? d.duration : null);
						if (turns !== null) {
							parts.push(`<div class='combo-row debuff-row'>${label} ${turns} 回合</div>`);
						} else if (typeof d.total === 'number' || typeof d.dmg === 'number') {
							// No explicit turns, show damage per turn if available
							const dmg = d.total || d.dmg || 0;
							parts.push(`<div class='combo-row debuff-row'>${label}：每回合 ${dmg} 傷害</div>`);
						} else {
							parts.push(`<div class='combo-row debuff-row'>${label}</div>`);
						}
					}
					enemyDebuffHtml = parts.join('');
				}
			} catch (e) { console.warn('enemy debuff render failed', e); }

			enemyStatusEl.innerHTML = `
				<div class="stat-label">${t('enemy')}</div>
				${this.inBattle ? `
					<div class="hp-row">${this.enemy.name || t('enemy')}  ${t('hp')}: <span class="hp-text">${this.enemy.hp}/${this.enemy.max_hp}</span></div>
					<div class="hp-bar"><div class="hp-inner enemy-hp" style="width:${enemyPct}%"></div></div>
					${enemyImage}
					<div class="stats-row"><div>${t('attackIn')}: ${this.enemy.turnsToAttack}</div><div>${t('strengthX').replace(' x', '')}: x${(this.enemy.strength||1).toFixed(2)}</div></div>
					${enemyDebuffHtml || ''}
				` : `
					<div class="hp-row">${t('none')}</div>
					<div class="hp-bar"><div class="hp-inner enemy-hp" style="width:0%"></div></div>
				`}
			`;
		}

		// Sync brief status summary to sidebar (as backup display)
		const summary = DOMRefs.statusSummary;
		if (summary) {
			summary.textContent = `HP:${this.player.hp}/${this.player.max_hp}  ${t('stamina')}:${this.player.stamina}/${this.player.max_stamina}  ${t('gold')}:${this.player.gold}  ${t('luckCombat')}:${this.player.luck_combat} ${t('goldLuck')}:${this.player.luck_gold}`;
		}

		// Update map steps display
		const mapEl = DOMRefs.mapSteps;
		if (mapEl) {
			if (this.inPyramid) {
				mapEl.textContent = `🔺 ${this.pyramidSteps}/${this.pyramidMaxSteps}`;
			} else {
				mapEl.textContent = Math.max(0, this.map_goal - this.map_steps);
			}
		}
	},

	/**
	 * Show a modal to pick mage skill (if MageSkills available)
	 */
	showMageSkillSelector(){
		if(!window.MageSkills || !MageSkills.SKILLS) return;
		const skills = MageSkills.SKILLS;
		// helper: determine whether current enemy context includes grouped enemies
		function enemySupportsGroups(game){
			if(!game) return false;
			if(!game.inBattle || !game.enemy) return false;
			// common signals: explicit count, group flag, or type indicating swarm
			if(typeof game.enemy.count === 'number' && game.enemy.count > 1) return true;
			if(game.enemy.isGroup || game.enemy.multiple || game.enemy.group) return true;
			// fallback: certain enemy types may indicate multiple attackers (e.g., 'swarm')
			if(game.enemy.type && String(game.enemy.type).toLowerCase().includes('swarm')) return true;
			return false;
		}
		const panel = document.createElement('div');
		panel.style.cssText = 'position:fixed;inset:0;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,0.6);z-index:10000;';
		let html = `<div style="background:#fff;padding:16px;border-radius:8px;min-width:360px;max-width:90%"><h3>選擇法術</h3><div style='display:flex;flex-wrap:wrap;gap:8px;'>`;
		const supportsGroups = enemySupportsGroups(this);
		Object.values(skills).forEach(s => {
			let dispDesc = s.description || '';
			// If current context doesn't support grouped enemies, remove sentences that specifically mention 範圍/群體/全體 or 單體/單一
			if(!supportsGroups){
				// split into sentences by comma, fullwidth comma, or punctuation, then filter
				const parts = dispDesc.split(/[。！？\n]+/).map(p=>p.trim()).filter(Boolean);
				const filtered = parts.filter(p => {
					// if sentence mentions area keywords, drop it; also drop explicit single-target phrasing
					const lower = p.toLowerCase();
					if(/範圍|群體|全體|群攻|範圍法術|對敵人施加範圍|群體出現/.test(p)) return false;
					if(/單一|單體|單目標|單個目標/.test(p)) return false;
					return true;
				});
				dispDesc = filtered.join('。');
				if(dispDesc && !dispDesc.endsWith('。')) dispDesc += '';
			}
				// Add bloodline-trigger note when relevant
				try {
					const bl = (this.player && (this.player.bloodline || this.player.selectedBloodline)) || null;
					if (bl && bl.flags) {
						const blName = bl.name || (bl.id || '血脈');
						let note = '';
						// helper: detect if skill implies burn/doT by keywords or id
						const skillKeywords = (dispDesc + ' ' + (s.id||'')).toLowerCase();
						const isBurnSkill = /灼|灼燒|burn|scorch|flame|烈焰/.test(skillKeywords);
						if (bl.flags.onSpell_applyStatus && isBurnSkill) {
							const f = bl.flags.onSpell_applyStatus;
							const statusName = f.name || 'burn';
							note = `（${blName} 血脈：在施放法術時會觸發 ${statusName}）`;
						} else if (bl.flags.onLightningSkill_applyStatus && isBurnSkill) {
							const f = bl.flags.onLightningSkill_applyStatus;
							const statusName = f.name || 'burn';
							note = `（${blName} 血脈：在閃電符號觸發時會施加 ${statusName}）`;
						} else if (bl.flags.onSpell_applyStatus) {
							// generic note when bloodline has spell-on flags but skill may not be burn
							note = `（${blName} 血脈：會在施放法術時觸發血脈效果）`;
						} else if (bl.flags.onLightningSkill_applyStatus) {
							note = `（${blName} 血脈：會在閃電符號觸發時發動）`;
						}
						if (note) dispDesc = dispDesc + '\n' + note;
					}
				} catch (e) { /* ignore */ }
				html += `<div style='border:1px solid #ddd;padding:8px;border-radius:6px;width:160px;'><div style='font-weight:700'>${s.name}</div><div class='small' style='margin:6px 0'>${dispDesc}</div><div style='text-align:center'><button class='pick-skill' data-skill='${s.id}'>選擇</button></div></div>`;
		});
		html += `</div><div style='text-align:center;margin-top:12px'><button id='close-skill-modal'>取消</button></div></div>`;
		panel.innerHTML = html;
		document.body.appendChild(panel);
		panel.querySelectorAll('.pick-skill').forEach(b => {
			b.addEventListener('click', (ev) => {
				const id = ev.currentTarget.getAttribute('data-skill');
				this.player.mage_selected_skill = id;
				if(typeof this.saveGame === 'function') this.saveGame();
				this.updateStatus();
				document.body.removeChild(panel);
			});
		});
		const close = panel.querySelector('#close-skill-modal');
		if(close) close.addEventListener('click', ()=>{ document.body.removeChild(panel); });
	},

	/**
	 * Helper to get localized rarity text
	 * @param {string} rarity - Rarity key
	 * @returns {string} Localized rarity name
	 */
	_getRarityText(rarity) {
		const rarityKeys = {
			'rare': { 'zh-TW': '稀有', 'en': 'Rare', 'fr': 'Rare' },
			'excellent': { 'zh-TW': '精良', 'en': 'Excellent', 'fr': 'Excellent' },
			'epic': { 'zh-TW': '史詩', 'en': 'Epic', 'fr': 'Épique' },
			'legendary': { 'zh-TW': '傳說', 'en': 'Legendary', 'fr': 'Légendaire' }
		};
		return rarityKeys[rarity]?.[currentLanguage] || rarityKeys[rarity]?.['en'] || rarity;
	},

	/**
	 * Show equipment panel with optional slot filter
	 * @param {string|null} filterSlot - Filter by slot type ('weapon'|'armor'|'amulet') or null for all
	 */
	showEquipmentPanel(filterSlot = null) {
		const panel = DOMRefs.equipmentPanel;
		const content = DOMRefs.equipContent;
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
			if (setBonus.effects.atk) setParts.push(`${t('atkShort')}+${setBonus.effects.atk}`);
			if (setBonus.effects.def) setParts.push(`${t('defShort')}+${setBonus.effects.def}`);
			if (setBonus.effects.max_hp_bonus) setParts.push(`${t('hp')}+${setBonus.effects.max_hp_bonus}`);
			if (setBonus.effects.stamina_bonus) setParts.push(`${t('stamina')}+${setBonus.effects.stamina_bonus}`);
			if (setBonus.effects.luck_combat) setParts.push(`${t('combatLuck')}+${setBonus.effects.luck_combat}`);
			if (setBonus.effects.luck_gold) setParts.push(`${t('goldLuck')}+${setBonus.effects.luck_gold}`);
			if (setBonus.effects.crit_rate) setParts.push(`Crit+${setBonus.effects.crit_rate}%`);
			if (setBonus.effects.combo_rate) setParts.push(`Combo+${setBonus.effects.combo_rate}%`);
			if (setBonus.effects.skill_power) setParts.push(`${t('skill')}+${setBonus.effects.skill_power}%`);
			if (setBonus.effects.dodge_rate) setParts.push(`Dodge+${setBonus.effects.dodge_rate}%`);

			const rarityText = this._getRarityText(setBonus.rarity);
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
		DOMRefs.disableMovement();

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
				DOMRefs.enableMovement();
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
		DOMRefs.disableMovement();

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
			<h2 style="color: #8b4513; margin-top: 0;">${t('pyramidExploration')}</h2>
			<p style="font-size: 1.1em; line-height: 1.6;">
				${t('pyramidDanger')}
			</p>
			<div style="background: #fff; padding: 12px; border-radius: 6px; margin: 12px 0; border: 1px solid #ddd;">
				<strong>${t('pyramidInfo').split(':')[0]}:</strong><br>
				✦ 8 ${t('steps')}<br>
				✦ ${t('hp')} x${(3 + this.difficulty * 0.5).toFixed(1)}, ${t('atkShort')} x${(2.5 + this.difficulty * 0.3).toFixed(1)}<br>
				✦ ${t('xp')} x15<br>
				✦ ${t('gold')} x15<br>
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
				">⚔️ ${t('enterPyramid').replace('⚡ ', '')}</button>
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
				">🚶 ${t('close')}</button>
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
				showMessage(t('declinePyramid'));
				document.body.removeChild(panel);
				DOMRefs.enableMovement();
			});
		}
	},

	/**
	 * Show class / bloodline selection at game start
	 * @param {Array} avail - array of available class ids (e.g., ['mage','warrior'])
	 * @param {Function} callback - optional callback ({class, bloodline})
	 */
	showBloodlineStart(avail, callback) {
		const pts = parseInt(localStorage.getItem('egypt_playthroughs') || '0', 10) || 0;
		// Basic class definitions - extend as needed
		const CLASS_DEFS = {
			mage: { id: 'mage', name: '法師', desc: '法術傷害高，耐久較低', unlock: 'normal', ngBonus: '起始魔力/耐力 +10' },
			warrior: { id: 'warrior', name: '戰士', desc: '高生命值與近戰輸出', unlock: 'normal', ngBonus: '起始護盾 +20' },
			archer: { id: 'archer', name: '弓手', desc: '遠程攻擊，擅長單體輸出', unlock: 'normal', ngBonus: '起始箭矢 x10' },
			// Example NG+ only class
			special_mage: { id: 'special_mage', name: '沙塵巫師', desc: '周目+ 專屬，擅長灼燒與控制', unlock: 'ngplus', ngBonus: '起始金幣 +200，特殊技能「沙塵護盾」' }
		};

		// Build modal
		const panel = document.createElement('div');
		panel.id = 'bloodline-start-panel';
		panel.style.cssText = `position:fixed;inset:0;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,0.6);z-index:1000;`;

		const modeToggle = (pts > 0) ? `
			<div style="display:flex;gap:12px;margin-bottom:12px;align-items:center;justify-content:center;">
				<label><input type="radio" name="ngmode" value="normal" checked> 普通遊戲</label>
				<label><input type="radio" name="ngmode" value="ngplus"> 第${pts+1}周目（新遊戲+）</label>
			</div>
		` : '';

		panel.innerHTML = `
			<div style="background:#fff;padding:18px;border-radius:10px;min-width:360px;max-width:90vw;box-shadow:0 8px 30px rgba(0,0,0,0.3);">
				<h2 style="margin-top:0">🔰 選擇職業</h2>
				${pts > 0 ? `<div class="small" style="margin-bottom:8px;color:#666;">偵測到你已完成 ${pts} 次周目；選擇「周目+」以啟用額外職業與起始加成。</div>` : ''}
				${modeToggle}
				<div id="class-grid" style="display:grid;grid-template-columns:repeat(3,150px);gap:12px;justify-content:center;align-items:start;"></div>
				<div style="text-align:center;margin-top:12px;"><button id="bloodline-start-close" style="padding:8px 16px">取消</button></div>
			</div>
		`;

		document.body.appendChild(panel);

		const grid = panel.querySelector('#class-grid');
		function renderGrid(mode){
			grid.innerHTML = '';
			// Determine visible classes
			const modeIsNG = (mode === 'ngplus');
			// Always include core classes (mage/warrior/archer) so they display side-by-side
			const unlockReq = { mage: 1, warrior: 2, archer: 3 };
			const all = Object.values(CLASS_DEFS);
			const candidates = all.filter(c => {
				// NG+ classes only visible when NG+ mode selected
				if (c.unlock === 'ngplus' && !modeIsNG) return false;
				// Include core classes regardless of 'avail' so they appear in the grid
				if (c.id === 'mage' || c.id === 'warrior' || c.id === 'archer') return true;
				// For any other classes, follow avail (or NG+ mode)
				if (!modeIsNG && !avail.includes(c.id)) return false;
				return true;
			});
			candidates.forEach(c => {
				const card = document.createElement('div');
				card.style.cssText = 'width:150px;padding:12px;border-radius:8px;border:1px solid #ddd;background:#fff;';
				const badges = [];
				if (c.unlock === 'ngplus') badges.push('<span class="badge">解鎖於周目+</span>');

				// Determine if this class is allowed in current mode (based on playthroughs)
				const allowed = modeIsNG || (pts >= (unlockReq[c.id] || 0));

				card.innerHTML = `
					<div style="font-weight:700">${c.name}</div>
					<div class="small" style="margin:8px 0;color:#444">${c.desc}</div>
					<div style="font-size:12px;color:#666">${c.ngBonus || ''}</div>
					<div style="text-align:center;margin-top:8px"><button class="choose-class" data-class="${c.id}"${allowed ? '' : ' disabled'}>選擇</button></div>
				`;

				if (!allowed) {
					// visual locked marker
					const lockBadge = document.createElement('div');
					lockBadge.style.cssText = 'position:relative;margin-top:-92px;text-align:center;pointer-events:none;';
					lockBadge.innerHTML = '<div style="display:inline-block;background:rgba(0,0,0,0.6);color:white;padding:4px 8px;border-radius:6px;font-size:12px;">未解鎖</div>';
					card.appendChild(lockBadge);
				}
				grid.appendChild(card);
			});
		};

		// Initial render
		renderGrid('normal');

		// Mode toggle listener
		if (pts > 0) {
			panel.querySelectorAll('input[name="ngmode"]').forEach(r => {
				r.addEventListener('change', (e) => {
					renderGrid(e.target.value);
				});
			});
		}

		// Choose handler
		panel.addEventListener('click', (ev) => {
			const btn = ev.target.closest('.choose-class');
			if (btn) {
				const cls = btn.getAttribute('data-class');
				// delegate to showBloodlineForClass which will open bloodline modal
				document.body.removeChild(panel);
				if (typeof this.showBloodlineForClass === 'function') {
					this.showBloodlineForClass(cls, (chosen) => {
						if (callback) callback(chosen);
					});
				} else {
					// Fallback: persist simple selection
					this.player.selectedClass = cls;
					if (typeof this.saveGame === 'function') this.saveGame();
					if (callback) callback({ class: cls });
				}
			}
		});

		// Close button
		const closeBtn = document.getElementById('bloodline-start-close');
		if (closeBtn) closeBtn.addEventListener('click', () => { document.body.removeChild(panel); DOMRefs.enableMovement(); });
	},

	/**
	 * Show bloodline selection for a chosen class
	 * Delegates to Bloodline.generateOptionsForClass if available
	 */
	showBloodlineForClass(cls, callback) {
		if (typeof Bloodline !== 'undefined' && typeof Bloodline.generateOptionsForClass === 'function') {
			const opts = Bloodline.generateOptionsForClass(cls);
			// reuse existing bloodline modal if available
			try {
				if (window.openLocalBloodlineModal) {
					window.openLocalBloodlineModal(cls);
					// openLocalBloodlineModal will call into save handlers in test harness
					if (callback) callback({ class: cls });
					return;
				}
			} catch (e) { /* ignore */ }
			// Otherwise show a minimal modal
			const panel = document.createElement('div');
			panel.style.cssText = 'position:fixed;inset:0;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,0.6);z-index:1000;';
			panel.innerHTML = `<div style="background:#fff;padding:16px;border-radius:8px;min-width:320px;">` +
				`<h3 style="margin:0 0 8px 0">選擇血脈 — ${cls}</h3><div id="bloodline-opts" style="display:flex;gap:10px;flex-wrap:wrap;"></div><div style="text-align:center;margin-top:12px"><button id="bloodline-cancel">取消</button></div></div>`;
			document.body.appendChild(panel);
			const optsEl = panel.querySelector('#bloodline-opts');
			const TIER_LABELS = { common: '普通', fine: '精良', rare: '優良', epic: '史詩', legendary: '傳說' };
			opts.forEach(o => {
				const card = document.createElement('div');
				// apply tier class so CSS accent (border-left) and badge color show
				card.className = 'bloodline-card tier-' + (o.tier || 'common');
				card.style.cssText = 'width:160px;padding:10px;border-radius:6px;background:#fff;';
				const tierText = TIER_LABELS[o.tier] || (o.tier ? o.tier.toUpperCase() : '');
				card.innerHTML = `
					<div class='bloodline-header'>
						<span class='bloodline-star'>★</span>
						<div class='bloodline-name'>${o.name}</div>
						<div style='margin-left:auto'><span class='bloodline-tier tier-${o.tier}'>${tierText}</span></div>
					</div>
					<div class="small" style='margin:8px 0'>${o.description}</div>
					<div style="text-align:center;margin-top:8px"><button class="choose-bl">選擇</button></div>`;
				card.querySelector('.choose-bl').addEventListener('click', () => {
					try { 
						this.player.selectedClass = cls;
						this.player.bloodline = o;
						if (typeof this.applyBloodlineModifiers === 'function') this.applyBloodlineModifiers(o);
						// apply class bonuses (e.g., mage mana pool)
						if (typeof this.applyClassBonuses === 'function') this.applyClassBonuses(cls);
						if (typeof this.saveGame === 'function') this.saveGame(); 
					} catch (e) {}
					document.body.removeChild(panel);
					if (callback) callback({ class: cls, bloodline: o });
				});
				optsEl.appendChild(card);
			});
			const cancel = panel.querySelector('#bloodline-cancel');
			if (cancel) cancel.addEventListener('click', () => { document.body.removeChild(panel); if (callback) callback(null); });
			return;
		}
		// Fallback: if no Bloodline generator, try test harness fallback
		if (typeof window.openLocalBloodlineModal === 'function') {
			try { window.openLocalBloodlineModal(cls); if (callback) callback({ class: cls }); return; } catch (e) { /* ignore */ }
		}
		// Final fallback: accept class immediately
		this.player.selectedClass = cls;
		if (typeof this.applyClassBonuses === 'function') this.applyClassBonuses(cls);
		if (typeof this.saveGame === 'function') this.saveGame();
		if (callback) callback({ class: cls });
	},

	/**
	 * Apply class-level bonuses when a class is selected
	 * e.g., set up mana pool for mage and default selected skill
	 */
	applyClassBonuses(cls){
		try{
			if(!this.player) return;
			if(cls === 'mage'){
				// initialize mage mana if not already set
				if(!this.player.max_mana || this.player.max_mana === 0){
					this.player.max_mana = 50;
					this.player.mana = this.player.max_mana;
				}
				// set default mage skill if none
				if(!this.player.mage_selected_skill && window.MageSkills){
					this.player.mage_selected_skill = MageSkills.getDefaultSkillId();
				}
			} else {
				// non-mage: leave mana at 0
				if(!this.player.max_mana) this.player.max_mana = 0;
				if(!this.player.mana) this.player.mana = 0;
			}
			this.updateStatus();
		}catch(e){ console.error('applyClassBonuses failed', e); }
	}
};
