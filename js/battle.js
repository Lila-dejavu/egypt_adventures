// ===== Battle System Module =====
// Handles combat-related functionality: battle initiation, slot results, enemy AI, fleeing

/**
 * Battle mixin - methods to be attached to Game prototype
 * Dependencies: showMessage (global), MusicSystem (global), App (global),
 *               SYMBOLS, ITEMS, QUALITY_BONUS, PYRAMID_AFFIXES (from data.js),
 *               genEnemyName (from enemyNames.js)
 */
const BattleMixin = {
	/**
	 * Calculate scaled value with match count, triple bonus, and combo multiplier
	 * @private
	 */
	_calcScaledValue(base, matchCount, tripleBonus, comboMultiplier) {
		let value = base * matchCount;
		value = Math.round(value * tripleBonus);
		return Math.max(1, Math.round(value * comboMultiplier));
	},

	/**
	 * Get weapon attribute safely
	 * @private
	 */
	_getWeaponAttr(attr) {
		return this.player.equipment.weapon ? (this.player.equipment.weapon[attr] || 0) : 0;
	},

	/**
	 * Get armor attribute safely
	 * @private
	 */
	_getArmorAttr(attr) {
		return this.player.equipment.armor ? (this.player.equipment.armor[attr] || 0) : 0;
	},

	/**
	 * Calculate crit chance based on luck and weapon
	 * @private
	 */
	_calcCritChance() {
		const weaponCritRate = this._getWeaponAttr('crit_rate');
		return Math.min(0.75, 0.08 + 0.05 * this.player.luck_combat + weaponCritRate / 100);
	},

	/**
	 * Calculate dodge chance based on luck and armor
	 * @private
	 */
	_calcDodgeChance() {
		const armorDodge = this._getArmorAttr('dodge_rate');
		return Math.min(0.5, 0.03 + 0.02 * this.player.luck_combat + armorDodge / 100);
	},

	/**
	 * Add a debuff stack to a target (player or enemy).
	 * Supports converting legacy single-object debuffs into stack form.
	 * @param {Object} target - target object that contains `.debuffs`
	 * @param {string} name - debuff key
	 * @param {number} dmg - damage per turn for this stack
	 * @param {number} turns - remaining turns for this stack
	 * @param {string} source - origin label (e.g., 'bloodline' or 'boss')
	 * @param {number|null} maxStacks - maximum stacks allowed (null = unlimited)
	 */
	addDebuffStack(target, name, dmg, turns, source = 'unknown', maxStacks = null) {
		target.debuffs = target.debuffs || {};
		const cur = target.debuffs[name];
		// If there is no existing debuff, create a stacked container
		if (!cur) {
			target.debuffs[name] = { stacks: [{ dmg: dmg, turns: turns, source: source }], total: dmg };
			return;
		}
		// If legacy shape (single object with dmg/turns), convert to stack container
		if (!cur.stacks && (typeof cur.dmg === 'number')) {
			const existing = { dmg: cur.dmg, turns: cur.turns || turns, source: cur.source || 'legacy' };
			target.debuffs[name] = { stacks: [ existing ], total: existing.dmg };
		}
		const container = target.debuffs[name];
		// Enforce maxStacks if provided
		if (Array.isArray(container.stacks)) {
			if (maxStacks != null && container.stacks.length >= maxStacks) {
				// Do not add more stacks beyond the cap
				return;
			}
			container.stacks.push({ dmg: dmg, turns: turns, source: source });
			container.total = container.stacks.reduce((s, st) => s + (st.dmg || 0), 0);
		}
	},

	/**
	 * Initiate battle with enemy
	 * @param {string} type - Enemy type: 'monster', 'elite', or 'mini_boss'
	 */
	battle(type) {
		// Stop auto-spin and disable auto button when entering battle
		try { stopAutoSpinLoop(); } catch(e) {}
		showMessage(`${t('encounterEnemy')} ${type}，${t('enterBattle')}`);

		// If any shop/trading panels are open (caravan/trading post/black market), close them
		try {
			const tp = document.getElementById('trading-post-panel');
			if (tp && tp.parentNode) tp.parentNode.removeChild(tp);
			const bm = DOMRefs.blackmarketPanel;
			if (bm && bm.style) bm.style.display = 'none';
			this.inShop = false;

			// Close generic encounter/popup panels that might block battle UI
			const enc = document.getElementById('encounter-choice-panel');
			if (enc && enc.parentNode) enc.parentNode.removeChild(enc);
			const pyr = document.getElementById('pyramid-choice-panel');
			if (pyr && pyr.parentNode) pyr.parentNode.removeChild(pyr);
			const dbg = document.getElementById('debug-panel');
			if (dbg && dbg.parentNode) dbg.parentNode.removeChild(dbg);
		} catch(e) { /* non-fatal */ }

		// Set battle state and enemy attributes
		this.inBattle = true;

		// Switch to battle music
		if (typeof MusicSystem !== 'undefined') {
			MusicSystem.switchTrack('battle');
		}

		// Store enemy type (for displaying corresponding image)
		this.enemy.type = type;
		// Generate enemy name: use dedicated 'boss' name pool for true boss
		const nameType = (type === 'boss') ? 'boss' : type;
		this.enemy.name = genEnemyName(nameType);
		showMessage(`${t('encounterEnemyName')}${this.enemy.name}`);

		// Disable movement buttons during battle
		DOMRefs.disableMovement();

		// Get battle constants from Config
		const B = Config.BATTLE;

		// Adjust enemy HP and attack based on type
		// Pyramid enemies scale with map difficulty, non-pyramid use normal multipliers
		let hpMultiplier = this.inPyramid
			? (B.HP_MULT.pyramid + this.difficulty * B.HP_SCALE_PER_DIFF)
			: B.HP_MULT.normal;
		let atkMultiplier = this.inPyramid
			? (B.ATK_MULT.pyramid + this.difficulty * B.ATK_SCALE_PER_DIFF)
			: B.ATK_MULT.normal;
		let strengthBonus = this.inPyramid
			? (B.STRENGTH_MULT.pyramid + this.difficulty * B.STRENGTH_SCALE_PER_DIFF)
			: B.STRENGTH_MULT.normal;

		// Get enemy type base stats from Config (support boss)
		const stats = type === 'boss' ? B.BOSS
			: type === 'elite' ? B.ELITE
			: type === 'mini_boss' ? B.MINI_BOSS
			: B.MONSTER;

		if (type === 'mini_boss' && this.inPyramid) {
			// Pyramid mini-boss difficulty reduced
			hpMultiplier *= B.MINI_BOSS_PYRAMID_REDUCTION;
			atkMultiplier *= B.MINI_BOSS_PYRAMID_REDUCTION;
			strengthBonus *= B.MINI_BOSS_PYRAMID_REDUCTION;
		}

		this.enemy.max_hp = Math.floor((stats.hp + stats.hpPerDiff * this.difficulty) * hpMultiplier);
		this.enemy.baseAttack = Math.floor((stats.atk + stats.atkPerDiff * this.difficulty) * atkMultiplier);
		this.enemy.strength = stats.strength * strengthBonus;

		if (this.inPyramid) {
			this.enemy.name += ` (金字塔-地圖${this.difficulty})`;
			showMessage(`${t('pyramidEnemyStrong')}${hpMultiplier.toFixed(1)}、${t('attackX')}${atkMultiplier.toFixed(1)}、${t('strengthX')}${strengthBonus.toFixed(1)}`);
		}

		this.enemy.hp = this.enemy.max_hp;
		this.enemy.turnsToAttack = 3;
		this.consecutivePrimarySymbol = null;
		this.consecutivePrimaryCount = 0;
		this.updateStatus();

		// Bloodline: apply any on-battle-start flags (e.g., revivePercent, start_shield)
		try{
			const bl = this.player && this.player.bloodline;
			if(bl && bl.flags){
				if(bl.flags.onBattleStart_revivePercent && !this.player._bloodline_revive_used){
					const pct = bl.flags.onBattleStart_revivePercent;
					const heal = Math.max(1, Math.floor((this.player.max_hp || 0) * pct));
					this.player.hp = Math.min(this.player.max_hp, (this.player.hp || 0) + heal);
					this.player._bloodline_revive_used = true;
					if(typeof this.showMessage === 'function') this.showMessage(`🧩 血脈開場：立即回復 ${heal} HP`);
				}
				if(bl.modifiers && typeof bl.modifiers.start_shield !== 'undefined'){
					this.player.shield = (this.player.shield || 0) + bl.modifiers.start_shield;
					this.showMessage(`🔰 血脈效果：獲得 ${bl.modifiers.start_shield} 點護盾`);
				}
			}
		}catch(e){ console.warn('Battle start bloodline handling failed', e); }

		// Auto-start slot and stop after short delay (simulate auto-battle)
		startSpin();
		setTimeout(() => {
			stopSequentially();
			// Enable buttons after first spin completes
			setTimeout(() => {
				App.enableBattleButtons();
			}, 200);
		}, 900);
	},

	/**
	 * Attempt to flee from battle
	 */
	attemptFlee() {
		if (!this.inBattle) {
			showMessage(t('notInBattle'));
			return;
		}

		// Cancel auto-spin
		stopAutoSpinLoop();

		const B = Config.BATTLE;
		const fleeChance = Math.min(B.FLEE_MAX_CHANCE, B.FLEE_BASE_CHANCE + B.FLEE_LUCK_BONUS * this.player.luck_combat);
		if (Math.random() < fleeChance) {
			showMessage(t('fleeSuccess'));
			this.inBattle = false;

			// Switch back to exploration music
			if (typeof MusicSystem !== 'undefined') {
				MusicSystem.switchTrack('exploration');
			}

			DOMRefs.disableBattle();

			// Stop auto-spin and disable auto button
			try { stopAutoSpinLoop(); } catch(e) {}
			if (DOMRefs.autoSpinBtn) DOMRefs.autoSpinBtn.disabled = true;

			DOMRefs.enableMovement();
			this.enemy.hp = 0;
			this.updateStatus();
		} else {
			showMessage(t('fleeFailed'));
			setTimeout(() => {
				if (this.inBattle && this.enemy.hp > 0) this.enemyAutoAttack();
			}, 300);
		}
	},

	/**
	 * Enemy auto-attack when turn counter reaches 0
	 */
	enemyAutoAttack() {
		// Calculate base attack with combo counter-attack bonus
		const raw = this.enemy.baseAttack;
		const extra = Math.max(0, this.consecutivePrimaryCount - 1) * 0.3; // 30% counter per combo
		const dmg = Math.floor(raw * (1 + extra));

		if (Math.random() < this._calcDodgeChance()) {
			showMessage(t('dodgedAutoAttack', { luck: this.player.luck_combat }));
			// Consume some combat luck after successful dodge
			if (this.player.luck_combat > 0) {
				this.player.luck_combat = Math.max(0, this.player.luck_combat - 1);
				showMessage(t('luckConsumed', { remaining: this.player.luck_combat }));
			}
		} else {
			const consumedShield = Math.min(this.player.shield, dmg);
			const mitigated = Math.max(0, dmg - this.player.shield);
			this.player.shield -= consumedShield;
			this.player.hp -= mitigated;
			showMessage(t('enemyAutoAttackDamage', { damage: dmg, absorbed: consumedShield, actual: mitigated }));
		}

		// Reset attack countdown
		this.enemy.turnsToAttack = 3;
		this.updateStatus();

		// Boss special: 屍毒蔓延 - chance to infect player with corpse poison
		try {
			if (this.enemy.type === 'boss') {
				const chance = 0.28; // 28% chance on enemy auto-attack
					if (Math.random() < chance) {
						// 有機會被戰鬥幸運閃避（會消耗一點幸運）
						if (Math.random() < this._calcDodgeChance()) {
							showMessage('🎲 戰鬥幸運發揮，避免屍毒！');
							if (this.player.luck_combat > 0) {
								this.player.luck_combat = Math.max(0, this.player.luck_combat - 1);
								showMessage(t('luckConsumed', { remaining: this.player.luck_combat }));
							}
						} else {
							// 每回合失血隨難度提高：基礎 60，難度每級額外 +20
							const perTick = Math.floor(60 + this.difficulty * 20);
							// Use addDebuffStack helper to allow stacking (boss stacks are unlimited)
							try {
								this.addDebuffStack(this.player, 'corpse_poison', perTick, 3, 'boss', null);
							} catch (e) {
								// Fallback to legacy assignment
								this.player.debuffs = this.player.debuffs || {};
								this.player.debuffs.corpse_poison = { turns: 3, dmg: perTick };
							}
							showMessage(`💀 屍毒蔓延！每回合失血 ${perTick}（持續 3 回合）`);
							// Update status to show effect
							this.updateStatus();
						}
					}
			}
		} catch(e) { console.error('Failed to apply boss corpse poison', e); }
	},

	/**
	 * Process slot machine results and apply effects
	 * @param {string[]} results - Array of 3 symbols from slot machine
	 */
	applySlotResults(results) {
		// Check if battle has ended, if so don't process results
		if (!this.inBattle) {
			return;
		}

		// Apply any active debuffs on player at the start of their turn (e.g., 屍毒)
		try { this._processDebuffs(); } catch(e) { console.error('Debuff processing failed', e); }
		// Apply any active debuffs on enemy (e.g., burn from bloodline)
		try { this._processEnemyDebuffs(); } catch(e) { console.error('Enemy debuff processing failed', e); }

		// Use leftmost slot (results[0]) as primary symbol, only count consecutive same symbols from left
		const primary = results[0];
		let matchCount = 1; // At least the first slot
		if (results[1] === primary) {
			matchCount = 2;
			if (results[2] === primary) {
				matchCount = 3;
			}
		}

		// Triple match gives extra bonus (equivalent to multiplied 2-slot effect)
		const tripleBonus = matchCount === 3 ? Config.BATTLE.TRIPLE_BONUS : 1;

		// Calculate current combo (including current slot) and display
		const previousCombo = (this.inBattle && this.consecutivePrimarySymbol === primary) ? this.consecutivePrimaryCount : 0;
		const effectiveCombo = previousCombo + 1;
		// Combo effect is now linear multiplier: 2x for 2, 3x for 3, 4x for 4
		const comboMultiplier = effectiveCombo;

		// Brief prompt showing primary symbol, match count and current combo
		const bonusMsg = matchCount === 3 ? '【三連加成 x2.5】' : '';
		showMessage(t('primary_symbol_msg', { primary, matchCount, bonusMsg, effectiveCombo, comboMultiplier }));

		this._processSymbolEffect(primary, matchCount, tripleBonus, comboMultiplier, effectiveCombo);

		// Battle related: track consecutive primary symbols (combo)
		if (this.inBattle) {
			if (this.consecutivePrimarySymbol === primary) {
				this.consecutivePrimaryCount += 1;
			} else {
				this.consecutivePrimarySymbol = primary;
				this.consecutivePrimaryCount = 1;
			}
			showMessage(t('current_consecutive_primary', { symbol: this.consecutivePrimarySymbol, count: this.consecutivePrimaryCount }));

			// Update status and messages first
			this.updateStatus();

			// Enemy turn countdown (if enemy is still alive)
			this.enemy.turnsToAttack -= 1;
			if (this.enemy.turnsToAttack <= 0 && this.enemy.hp > 0) {
				// Delay enemy attack to let slot effects display first
				setTimeout(() => {
					if (this.inBattle && this.enemy.hp > 0) this.enemyAutoAttack();
				}, 300);
			}

			// If enemy is defeated, end battle (immediate processing)
			if (this.enemy.hp <= 0) {
				this._handleVictory();
			}
		}

		// Check player death
		this._checkPlayerDeath();

		this.updateStatus();

		// Check battle state again after updateStatus, ensure auto-spin stops correctly
		if (!this.inBattle && typeof stopAutoSpinLoop === 'function') {
			try {
				stopAutoSpinLoop();
				DOMRefs.disableBattle();
			} catch(e) {
				console.error('強制停止自動旋轉失敗:', e);
			}
		}
	},

	/**
	 * Process individual symbol effects
	 * @private
	 */
	_processSymbolEffect(primary, matchCount, tripleBonus, comboMultiplier, effectiveCombo) {
		switch (primary) {
			case '⚔️': {
				// Normal attack with crit chance
				let baseDmg = this._calcScaledValue(15, matchCount, tripleBonus, comboMultiplier);
				baseDmg += this._getWeaponAttr('atk');
				const isCrit = Math.random() < this._calcCritChance();
				const finalDmg = isCrit ? Math.floor(baseDmg * 2.0) : baseDmg;
				// Apply possible temporary attack buff from temp_buffs
				let modifiedDmg = finalDmg;
				try{
					if(this.player && this.player.temp_buffs && this.player.temp_buffs.attack){
						const pct = this.player.temp_buffs.attack.pct || 0;
						modifiedDmg = Math.floor(modifiedDmg * (1 + pct));
					}
				}catch(e){}
				this.enemy.hp -= modifiedDmg;
				showMessage(t('normalAttack', { count: matchCount, crit: isCrit ? t('critical') : '', damage: modifiedDmg }));

				// Bloodline: on-hit flags & modifiers
				try{
					const bl = this.player && this.player.bloodline;
					// flags that apply status on hit (legacy: onHit_applyStatus in flags)
					if(bl && bl.flags && bl.flags.onHit_applyStatus){
						const f = bl.flags.onHit_applyStatus;
						const per = f.dmgPerTurn || f.perTurnPct ? Math.max(1, Math.floor((f.dmgPerTurn || 0) || (this.enemy.max_hp * (f.perTurnPct||0)))) : 0;
						if(per > 0){
							this.addDebuffStack(this.enemy, f.name || 'bleed', per, f.duration || 3, 'bloodline', 5);
						}
					}
					// flags that apply generic debuff (e.g., armor_down)
					if(bl && bl.flags && bl.flags.onHit_applyDebuff){
						const d = bl.flags.onHit_applyDebuff;
						this.enemy.debuffs = this.enemy.debuffs || {};
						this.enemy.debuffs[d.name] = Object.assign(this.enemy.debuffs[d.name]||{}, { turns: d.duration || 2, value: d.value });
					}
					// modifiers applied to player on hit (defined in modifiers and copied to player by applyBloodlineModifiers)
					if(this.player && typeof this.player.onHit_restore_mana_pct === 'number' && this.player.max_mana){
						const add = Math.max(1, Math.floor(this.player.max_mana * this.player.onHit_restore_mana_pct));
						this.player.mana = Math.min(this.player.max_mana, (this.player.mana || 0) + add);
						this.showMessage(`🔋 命中回復魔力 ${add}`);
					}
					if(this.player && typeof this.player.onHit_temp_attack_pct === 'number'){
						this.player.temp_buffs = this.player.temp_buffs || {};
						this.player.temp_buffs.attack = { pct: this.player.onHit_temp_attack_pct, turns: 2 };
						this.showMessage(`⚔ 獲得暫時攻擊提升 ${(this.player.onHit_temp_attack_pct*100).toFixed(0)}%（2 回合）`);
					}
					if(this.player && typeof this.player.onHit_temp_penetration_pct === 'number'){
						this.player.temp_buffs = this.player.temp_buffs || {};
						this.player.temp_buffs.penetration = { pct: this.player.onHit_temp_penetration_pct, turns: 2 };
					}
				}catch(e){ console.warn('onHit bloodline handlers failed', e); }
				break;
			}
			case '⚡️': {
				// Skill attack — if player is a mage and has a selected mage skill, prefer consuming mana
				try {
					const isMageSkill = this.player && this.player.selectedClass === 'mage' && this.player.mage_selected_skill && window.MageSkills;
					if (isMageSkill) {
						const skillId = this.player.mage_selected_skill;
						// Determine proc chance: base scales with matchCount, plus any bloodline "cooldown_pct" interpreted as extra proc chance
						let baseProc = 0.3 * matchCount; // e.g., 0.3,0.6,0.9 for 1/2/3 matches
						let extra = 0;
						try{ if(this.player && this.player.cooldown_pct) extra = Math.max(0, -this.player.cooldown_pct); }catch(e){}
						const procChance = Math.min(1, baseProc + extra);
						const roll = Math.random();
						if(roll < procChance){
							const result = MageSkills.useSkill(this, skillId, matchCount, comboMultiplier);
							if (result) {
								const sname = (MageSkills.SKILLS[skillId] && MageSkills.SKILLS[skillId].name) || skillId;
								showMessage(`⚡ 使用法術：${sname}`);
							} else {
								// mana insufficient; fallback to stamina skill
								let baseDmg = this._calcScaledValue(25, matchCount, tripleBonus, comboMultiplier);
								baseDmg += this._getWeaponAttr('atk');
								const skillPower = this._getWeaponAttr('skill_power');
								baseDmg = Math.floor(baseDmg * (1 + skillPower / 100));
								const isCrit = Math.random() < this._calcCritChance();
								const finalDmg = isCrit ? Math.floor(baseDmg * 2.2) : baseDmg;
								this.enemy.hp -= finalDmg;
								const staminaCost = 5 * matchCount;
								this.player.stamina = Math.max(0, this.player.stamina - staminaCost);
								showMessage(t('skillAttack', { count: matchCount, crit: isCrit ? t('critical') : '', damage: finalDmg, stamina: staminaCost }));
							}
						} else {
							// Proc failed — treat as no-skill (stamina-based fallback)
							let baseDmg = this._calcScaledValue(25, matchCount, tripleBonus, comboMultiplier);
							baseDmg += this._getWeaponAttr('atk');
							const skillPower = this._getWeaponAttr('skill_power');
							baseDmg = Math.floor(baseDmg * (1 + skillPower / 100));
							const isCrit = Math.random() < this._calcCritChance();
							const finalDmg = isCrit ? Math.floor(baseDmg * 2.2) : baseDmg;
							this.enemy.hp -= finalDmg;
							const staminaCost = 5 * matchCount;
							this.player.stamina = Math.max(0, this.player.stamina - staminaCost);
							showMessage(t('skillAttack', { count: matchCount, crit: isCrit ? t('critical') : '', damage: finalDmg, stamina: staminaCost }));
						}
					} else {
						// Non-mage or no mage skill — default behavior (stamina-based skill)
						let baseDmg = this._calcScaledValue(25, matchCount, tripleBonus, comboMultiplier);
						baseDmg += this._getWeaponAttr('atk');
						const skillPower = this._getWeaponAttr('skill_power');
						baseDmg = Math.floor(baseDmg * (1 + skillPower / 100));
						const isCrit = Math.random() < this._calcCritChance();
						const finalDmg = isCrit ? Math.floor(baseDmg * 2.2) : baseDmg;
						this.enemy.hp -= finalDmg;
						const staminaCost = 5 * matchCount;
						this.player.stamina = Math.max(0, this.player.stamina - staminaCost);
						showMessage(t('skillAttack', { count: matchCount, crit: isCrit ? t('critical') : '', damage: finalDmg, stamina: staminaCost }));
					}
					// Bloodline: if player's bloodline defines an onLightningSkill effect, apply it now
					try {
						// Additional: handle generic onSpell flags (onSpell_applyStatus, onSpell_applyStatusChance) and modifiers like chance_shield_on_spell
						try{
							const bl = this.player && this.player.bloodline;
							if(bl && bl.flags){
								if(bl.flags.onSpell_applyStatus){
									const f = bl.flags.onSpell_applyStatus;
									const per = f.dmgPerTurn || f.perTurnPct ? Math.max(1, Math.floor((f.dmgPerTurn || 0) || (this.enemy.max_hp * (f.perTurnPct||0)))) : 0;
									if(per > 0){ this.addDebuffStack(this.enemy, f.name || 'burn', per, f.duration || 3, 'bloodline', 5); }
								}
								if(bl.flags.onSpell_applyStatusChance){
									const f = bl.flags.onSpell_applyStatusChance;
									if(Math.random() < (f.chance || 0)){
										const per = f.dmgPerTurn || f.perTurnPct ? Math.max(1, Math.floor((f.dmgPerTurn || 0) || (this.enemy.max_hp * (f.perTurnPct||0)))) : 0;
										if(per > 0) this.addDebuffStack(this.enemy, f.name || 'burn', per, f.duration || 3, 'bloodline', 5);
									}
								}
							}
							// chance_shield_on_spell modifier (restore small shield when casting)
							try{
								if(this.player && typeof this.player.chance_shield_on_spell === 'number'){
									if(Math.random() < this.player.chance_shield_on_spell){
										const sh = Math.max(5, Math.floor((this.player.max_mana || 20) * 0.15));
										this.player.shield = (this.player.shield || 0) + sh;
										this.showMessage(`🔰 血脈觸發：獲得 ${sh} 點護盾`);
									}
								}
							}catch(e){/*ignore*/}
						}catch(e){ console.warn('onSpell bloodline handlers failed', e); }
						if (typeof Bloodline !== 'undefined' && typeof Bloodline.applyOnLightningSkill === 'function') {
							Bloodline.applyOnLightningSkill(this);
						}
					} catch (e) {
						console.error('Bloodline application failed', e);
					}
				} catch(e){
					console.error('Skill handling failed', e);
				}
				break;
			}
			case '🛡️': {
				const shieldGain = this._calcScaledValue(10, matchCount, tripleBonus, comboMultiplier);
				this.player.shield += shieldGain;
				showMessage(t('shieldGain', { count: matchCount, combo: effectiveCombo, shield: shieldGain }));
				break;
			}
			case '🧪': {
				// Potion effect scales with map difficulty
				const baseHp = 90 + (this.difficulty * 10);
				const hpGain = this._calcScaledValue(baseHp, matchCount, tripleBonus, comboMultiplier);
				this.player.hp = Math.min(this.player.max_hp, this.player.hp + hpGain);
				const baseStamina = 30 + (this.difficulty * 8);
				const staminaGain = this._calcScaledValue(baseStamina, matchCount, tripleBonus, comboMultiplier);
				this.player.stamina = Math.min(this.player.max_stamina, this.player.stamina + staminaGain);
				showMessage(t('potionUse', { count: matchCount, combo: effectiveCombo, map: this.difficulty, hp: hpGain, stamina: staminaGain }));
				break;
			}
			case '⭐': {
				const luckGain = Math.round(matchCount * tripleBonus);
				this.player.luck_combat += luckGain;
				showMessage(t('luckGain', { luck: luckGain }));
				break;
			}
			case '💀': {
				// Calculate damage based on enemy auto-attack formula
                const baseAttack = this.enemy.baseAttack || 10; // Default base attack if undefined
                const comboBonus = Math.max(0, this.consecutivePrimaryCount - 1) * 0.3; // 30% per combo
                const adjustedDmg = Math.floor(baseAttack * (1 + comboBonus) * matchCount * tripleBonus);

                // Log calculation details for debugging
                console.log(`💀 Skull Symbol Damage: baseAttack=${baseAttack}, comboBonus=${comboBonus}, matchCount=${matchCount}, tripleBonus=${tripleBonus}, adjustedDmg=${adjustedDmg}`);

				if (Math.random() < this._calcDodgeChance()) {
					showMessage(t('dodgedSymbolAttack', { luck: this.player.luck_combat }));
					if (this.player.luck_combat > 0) {
						this.player.luck_combat = Math.max(0, this.player.luck_combat - 1);
						showMessage(t('luckConsumed', { remaining: this.player.luck_combat }));
					}
				} else {
					const consumedShield = Math.min(this.player.shield, adjustedDmg);
					const mitigated = Math.max(0, adjustedDmg - this.player.shield);
					this.player.shield -= consumedShield;
					this.player.hp -= mitigated;
					showMessage(t('enemySymbolAttack', { count: matchCount, raw: adjustedDmg, absorbed: consumedShield, actual: mitigated }));
				}
				break;
			}
			case '💰': {
				const got = this._calcScaledValue(20, matchCount, tripleBonus, comboMultiplier);
				this.player.gold += got;
				showMessage(t('goldGain', { gold: got, count: matchCount, combo: effectiveCombo }));
				break;
			}
			default: {
				showMessage(t('noSymbolEffect'));
				break;
			}
		}
	},

	/**
	 * Handle victory - rewards and battle end
	 * @private
	 */
	_handleVictory() {
		showMessage(t('victoryMessage'));

		// Play victory music
		if (typeof MusicSystem !== 'undefined') {
			MusicSystem.playVictory();
		}

		// Check for bandit loot
		if (this.player.banditsLoot) {
			const banditGold = this.player.banditsLoot;
			this.player.gold += banditGold;
			showMessage(t('banditLootRecovered', { gold: banditGold }));
			this.player.banditsLoot = 0;
		}

		// Pyramid multiplier from Config
		const pyramidMultiplier = this.inPyramid ? Config.BATTLE.PYRAMID_XP_MULTIPLIER : 1;

		// Enemy type reward multiplier (elite x2, mini-boss x3)
		let enemyTypeMultiplier = 1;
		// Boss has very large multiplier
		if (this.enemy.strength >= 3.6) { // boss
			enemyTypeMultiplier = 5;
		} else if (this.enemy.strength >= 2.4) { // mini_boss
			enemyTypeMultiplier = 3;
		} else if (this.enemy.strength >= 1.6) { // elite
			enemyTypeMultiplier = 2;
		}

		// Gold reward based on difficulty
		const baseReward = 20 * this.difficulty;
		const reward = baseReward * pyramidMultiplier * enemyTypeMultiplier;
		this.player.gold += reward;

		let rewardMsg = `獲得金幣 ${reward}`;
		if (this.inPyramid) {
			rewardMsg = `🔺 金字塔獎勵 x${pyramidMultiplier}！獲得金幣 ${reward} (基礎 ${baseReward} x${pyramidMultiplier}`;
			if (enemyTypeMultiplier > 1) {
				rewardMsg += ` x${enemyTypeMultiplier}`;
			}
			rewardMsg += ')';
		} else if (enemyTypeMultiplier > 1) {
			rewardMsg += ` (基礎 ${baseReward} x${enemyTypeMultiplier})`;
		}
		showMessage(rewardMsg);

		// XP calculation
		const mapMultiplier = Math.pow(2, this.difficulty - 1);
		const baseXP = Math.floor(15 * this.difficulty * (this.enemy.strength || 1));
		const xpGain = Math.floor(baseXP * mapMultiplier * pyramidMultiplier * enemyTypeMultiplier);
		if (this.inPyramid) {
			showMessage(`🔺 金字塔經驗值 x${pyramidMultiplier}！`);
		}
		this.addXP(xpGain);

		// Drop mechanism
		this._handleLootDrop(pyramidMultiplier, enemyTypeMultiplier);

		// End battle
		// Bloodline: onKill effects (e.g., heal on kill)
		try{
			const bl = this.player && this.player.bloodline;
			if(bl && bl.flags && typeof bl.flags.onKill_healPercent === 'number'){
				const pct = bl.flags.onKill_healPercent;
				const heal = Math.max(1, Math.floor((this.player.max_hp || 0) * pct));
				this.player.hp = Math.min(this.player.max_hp, (this.player.hp || 0) + heal);
				this.showMessage(`❤ 血脈效果：擊殺回復 ${heal} HP`);
			}
		}catch(e){ console.warn('onKill bloodline handling failed', e); }

		this._endBattle();
	},

	/**
	 * Process active debuffs on player (called at start of player's turn)
	 * Applies damage-over-time effects and decrements counters
	 * @private
	 */
	_processDebuffs() {
		if (!this.player || !this.player.debuffs) return;
		const d = this.player.debuffs;
		// Corpse poison (supports stacked and legacy formats)
		if (d.corpse_poison) {
			const info = d.corpse_poison;
			if (info.stacks && Array.isArray(info.stacks)) {
				let total = 0;
				let minTurns = Infinity;
				for (const st of info.stacks) {
					if (st.turns > 0) {
						total += st.dmg || 0;
						minTurns = Math.min(minTurns, st.turns || 0);
					}
				}
				if (total > 0) {
					this.player.hp = Math.max(0, this.player.hp - total);
					showMessage(`💀 屍毒：受到 ${total} 點傷害（${info.stacks.length} 層，最短 ${minTurns} 回合）`);
				}
				// decrement and cleanup
				for (let i = info.stacks.length - 1; i >= 0; i--) {
					info.stacks[i].turns -= 1;
					if (info.stacks[i].turns <= 0) {
						info.stacks.splice(i, 1);
					}
				}
				if (info.stacks.length === 0) {
					delete d.corpse_poison;
					showMessage('🟢 屍毒已消失');
				}
				this._checkPlayerDeath();
			} else if (info.turns > 0) {
				// legacy single-object format
				this.player.hp = Math.max(0, this.player.hp - info.dmg);
				showMessage(`💀 屍毒：受到 ${info.dmg} 點傷害（剩餘 ${info.turns} 回合）`);
				info.turns -= 1;
				if (info.turns <= 0) {
					delete d.corpse_poison;
					showMessage('🟢 屍毒已消失');
				}
				this._checkPlayerDeath();
			}
		}

		// Process temporary player buffs (decrement turns and remove)
		try{
			if(this.player && this.player.temp_buffs){
				for(const key of Object.keys(this.player.temp_buffs)){
					const info = this.player.temp_buffs[key];
					if(info.turns > 0){
						info.turns -= 1;
						if(info.turns <= 0){
							delete this.player.temp_buffs[key];
							this.showMessage(`🔻 暫時增益 ${key} 已消失`);
						}
					}
				}
			}
		}catch(e){ console.warn('Temp buffs processing failed', e); }
	},

	/**
	 * Process active debuffs on enemy (called at start of player's turn)
	 * Applies damage-over-time effects and decrements counters
	 * @private
	 */
	_processEnemyDebuffs() {
		if (!this.enemy || !this.enemy.debuffs) return;
		const d = this.enemy.debuffs;
		// iterate over debuffs (support stacked and legacy formats)
		for (const key of Object.keys(d)) {
			const info = d[key];
			if (info.stacks && Array.isArray(info.stacks)) {
				let total = 0;
				let minTurns = Infinity;
				for (const st of info.stacks) {
					if (st.turns > 0) {
						total += st.dmg || 0;
						minTurns = Math.min(minTurns, st.turns || 0);
					}
				}
				if (total > 0) {
					this.enemy.hp = Math.max(0, this.enemy.hp - total);
					showMessage(`🔥 敵人 ${key}：受到 ${total} 點傷害（${info.stacks.length} 層，最短 ${minTurns} 回合）`);
				}
				// decrement and cleanup
				for (let i = info.stacks.length - 1; i >= 0; i--) {
					info.stacks[i].turns -= 1;
					if (info.stacks[i].turns <= 0) info.stacks.splice(i, 1);
				}
				if (!info.stacks.length) {
					delete d[key];
					showMessage(`🟢 敵人 ${key} 效果消失`);
				}
			} else if (info.turns > 0) {
				// legacy single-object format
				this.enemy.hp = Math.max(0, this.enemy.hp - info.dmg);
				showMessage(`🔥 敵人 ${key}：受到 ${info.dmg} 點傷害（剩餘 ${info.turns} 回合）`);
				info.turns -= 1;
				if (info.turns <= 0) {
					delete d[key];
					showMessage(`🟢 敵人 ${key} 效果消失`);
				}
			}
		}
		// If enemy died from DoT, handle victory
		if (this.enemy.hp <= 0) {
			this._handleVictory();
		}
	},

	/**
	 * Handle loot drops after victory
	 * @private
	 */
	_handleLootDrop(pyramidMultiplier, enemyTypeMultiplier) {
		let dropped = null;

		if (this.inPyramid) {
			// Pyramid guarantees 1-2 rare/epic items
			const dropCount = 1 + Math.floor(Math.random() * 2);
			showMessage(`🔺 金字塔寶藏！掉落 ${dropCount} 件裝備`);
			for (let i = 0; i < dropCount; i++) {
				const rarityRoll = Math.random();
				let targetRarity = rarityRoll < 0.3 ? 'epic' : 'rare';
				const candidateItems = ITEMS.filter(it => it.slot);
				if (candidateItems.length > 0) {
					const baseItem = candidateItems[Math.floor(Math.random() * candidateItems.length)];
					dropped = cloneItem(baseItem, targetRarity, true);
					this.player.inventory.push(dropped);
					showMessage(`  ✨ 獲得 ${this.formatItem(dropped)}`);
				}
			}
		} else {
			// Normal map drops (uses pickWeightedRarity from EnemyGenerator.js)
			// Boss drops (very generous)
			if (enemyTypeMultiplier === 5) {
				const dropCount = 2 + Math.floor(Math.random() * 3); // 2-4 items
				showMessage(`👑 終極頭目掉落 ${dropCount} 件裝備！`);
				for (let i = 0; i < dropCount; i++) {
					// Favor high rarities
					const weights = [0,5,10,40,45];
					const rarity = Utils.pickWeightedRarity(weights);
					const baseItem = ITEMS[Math.floor(Math.random() * ITEMS.length)];
					dropped = cloneItem(baseItem, rarity);
					this.player.inventory.push(dropped);
					showMessage(`  獲得 ${this.formatItem(dropped)}`);
				}
				return;
			}
			if (enemyTypeMultiplier === 3) { // mini_boss
				const weights = [10,50,10,25,5];
				const dropCount = 1 + Math.floor(Math.random() * 2);
				showMessage(`💎 小頭目掉落 ${dropCount} 件裝備！`);
				for (let i = 0; i < dropCount; i++) {
					const rarity = Utils.pickWeightedRarity(weights);
					const baseItem = ITEMS[Math.floor(Math.random() * ITEMS.length)];
					dropped = cloneItem(baseItem, rarity);
					this.player.inventory.push(dropped);
					showMessage(`  獲得 ${this.formatItem(dropped)}`);
				}
			} else if (enemyTypeMultiplier === 2) { // elite
				const weights = [15,40,15,20,10];
				const dropCount = 1 + Math.floor(Math.random() * 2);
				const dropRoll = Math.random() * 100;
				const dropChance = 85;
				console.log(`Elite drop check: roll=${dropRoll}, chance=${dropChance}, count=${dropCount}`);
				if (dropRoll < dropChance) {
					showMessage(`⚔️ 精英掉落 ${dropCount} 件裝備！`);
					for (let i = 0; i < dropCount; i++) {
						const rarity = Utils.pickWeightedRarity(weights);
						const baseItem = ITEMS[Math.floor(Math.random() * ITEMS.length)];
						dropped = cloneItem(baseItem, rarity);
						this.player.inventory.push(dropped);
						console.log(`Elite dropped item ${i+1}:`, dropped.name, rarity);
						showMessage(`  獲得 ${this.formatItem(dropped)}`);
					}
				} else {
					console.log('Elite drop failed:', dropRoll, '>=', dropChance);
				}
			} else {
				// Normal enemy drops
				const weights = [70,20,6,3,1];
				const rollRarity = Utils.pickWeightedRarity(weights);
				if (rollRarity !== 'common') {
					const baseItem = ITEMS[Math.floor(Math.random()*ITEMS.length)];
					dropped = cloneItem(baseItem, rollRarity);
					this.player.inventory.push(dropped);
					showMessage(`敵人掉落：${this.formatItem(dropped)}`);
				}
			}
		}
	},

	/**
	 * End battle and restore UI state
	 * @private
	 */
	_endBattle() {
		// Stop auto-spin
		try { stopAutoSpinLoop(); } catch(e) {}

		this.inBattle = false;

		// Switch back to exploration music
		if (typeof MusicSystem !== 'undefined') {
			MusicSystem.switchTrack('exploration');
		}

		// Disable battle buttons
		DOMRefs.disableBattle();

		// Disable and reset auto-spin button
		if (DOMRefs.autoSpinBtn) {
			DOMRefs.autoSpinBtn.disabled = true;
			DOMRefs.autoSpinBtn.textContent = '自動旋轉';
			DOMRefs.autoSpinBtn.style.background = '';
		}

		// Enable movement buttons
		DOMRefs.enableMovement();

		this.enemy.turnsToAttack = 3;

		// Check if pyramid or map goal reached after battle ends
		if (this.inPyramid && this.pyramidSteps >= this.pyramidMaxSteps) {
			this.exitPyramid();
		} else if (!this.inPyramid && this.map_steps >= this.map_goal) {
			this.nextMap();
		} else {
			// Only generate direction hints if not leaving pyramid/map
			this.generateDirectionHints();
		}
	},

	/**
	 * Check if player died and handle resurrection or game over
	 * @private
	 */
	_checkPlayerDeath() {
		if (this.player.hp <= 0) {
			if (this.player.potions > 0) {
				this.player.potions -= 1;
				this.player.hp = this.player.max_hp;
				this.player.stamina = this.player.max_stamina;
				showMessage(`HP 歸零，消耗一瓶藥水自動復活並回滿 HP/體力。剩餘藥水：${this.player.potions}`);
			} else {
				showMessage('你倒下了，遊戲結束。沒有藥水可用。請重新整理頁面以重玩。');
				try { stopAutoSpinLoop(); } catch(e) {}
				this.inBattle = false;
				if (typeof MusicSystem !== 'undefined') {
					MusicSystem.switchTrack('exploration');
				}
				DOMRefs.disableBattle();
				if (DOMRefs.autoSpinBtn) {
					DOMRefs.autoSpinBtn.disabled = true;
					DOMRefs.autoSpinBtn.textContent = '自動旋轉';
					DOMRefs.autoSpinBtn.style.background = '';
				}
			}
		}
	}
};

// cloneItem and pickWeightedRarity are now in js/combat/EnemyGenerator.js
