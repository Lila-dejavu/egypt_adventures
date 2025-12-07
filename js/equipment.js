// ===== Equipment Module =====
// Handles equipment-related functionality: equip, unequip, format, set bonuses

/**
 * Equipment mixin - methods to be attached to Game prototype
 * Dependencies: showMessage (global), t (global - i18n),
 *               SET_BONUSES (from data.js)
 */
const EquipmentMixin = {
	/**
	 * Check for active set bonus (requires weapon+armor+amulet with same affix and rarity)
	 * @returns {Object|null} Set bonus object or null if no set is active
	 */
	getActiveSetBonus() {
		const weapon = this.player.equipment.weapon;
		const armor = this.player.equipment.armor;
		const amulet = this.player.equipment.amulet;

		// Check if all slots have pyramid equipment
		if (!weapon || !armor || !amulet) return null;
		if (!weapon.isPyramid || !armor.isPyramid || !amulet.isPyramid) return null;

		// Check if affixes match
		if (weapon.affix !== armor.affix || weapon.affix !== amulet.affix) return null;

		// Check if rarities match (no mixing)
		if (weapon.rarity !== armor.rarity || weapon.rarity !== amulet.rarity) return null;

		// Return set bonus
		const setBonus = SET_BONUSES[weapon.affix];
		if (setBonus) {
			return { ...setBonus, affix: weapon.affix, affixName: weapon.affixName, rarity: weapon.rarity };
		}
		return null;
	},

	/**
	 * Get set bonus attribute value
	 * @param {string} attrName - Attribute name to check
	 * @returns {number} Bonus value or 0
	 */
	getSetBonusValue(attrName) {
		const setBonus = this.getActiveSetBonus();
		if (!setBonus || !setBonus.effects) return 0;
		return setBonus.effects[attrName] || 0;
	},

	/**
	 * Format item for display with rarity colors and attributes
	 * @param {Object} it - Item object
	 * @returns {string} Formatted HTML string
	 */
	formatItem(it) {
		if (!it) return '';

		const parts = [];
		if (it.atk) parts.push(`攻+${it.atk}`);
		if (it.def) parts.push(`防+${it.def}`);
		if (it.enhanceLevel) parts.unshift(`強化+${it.enhanceLevel}`);
		if (it.luck_gold) parts.push(`金運+${it.luck_gold}`);
		if (it.luck_combat) parts.push(`戰運+${it.luck_combat}`);
		if (it.max_hp_bonus) parts.push(`HP+${it.max_hp_bonus}`);
		if (it.stamina_bonus) parts.push(`體力+${it.stamina_bonus}`);
		if (it.mana_bonus) parts.push(`魔力+${it.mana_bonus}`);
		if (it.crit_rate) parts.push(`暴擊+${it.crit_rate}%`);
		if (it.combo_rate) parts.push(`連擊+${it.combo_rate}%`);
		if (it.skill_power) parts.push(`技能+${it.skill_power}%`);
		if (it.dodge_rate) parts.push(`閃避+${it.dodge_rate}%`);

		const attr = parts.length ? ` (${parts.join(' ')})` : '';

		// Set color based on rarity
		let color = '#333'; // common
		if (it.rarity === 'legendary') color = '#e67e22';
		else if (it.rarity === 'epic') color = '#9b59b6';
		else if (it.rarity === 'excellent') color = '#2ecc71';
		else if (it.rarity === 'rare') color = '#3498db';

		// Display affix for pyramid equipment
		let displayName = it.name;
		if (it.isPyramid && it.affixName) {
			displayName = `<span style="color: ${it.affixColor};">${it.affixName}</span>${it.name}`;
		}

		return `<span style="color: ${color}; font-weight: bold;">${displayName}</span>${attr}`;
	},

	/**
	 * Equip item from inventory
	 * @param {number} index - Inventory index
	 */
	equipItem(index) {
		const it = this.player.inventory[index];
		if (!it) return;

		if (it.slot && this.player.equipment.hasOwnProperty(it.slot)) {
			// Check if slot already has equipment, unequip first
			const oldEquipment = this.player.equipment[it.slot];
			if (oldEquipment) {
				// Remove old equipment bonuses
				if (oldEquipment.luck_gold) {
					this.player.luck_gold = Math.max(0, this.player.luck_gold - (oldEquipment.luck_gold || 0));
				}
				if (oldEquipment.max_hp_bonus) {
					this.player.max_hp = Math.max(1, this.player.max_hp - oldEquipment.max_hp_bonus);
					this.player.hp = Math.min(this.player.max_hp, this.player.hp);
				}
				if (oldEquipment.stamina_bonus) {
					this.player.max_stamina = Math.max(1, this.player.max_stamina - oldEquipment.stamina_bonus);
					this.player.stamina = Math.min(this.player.max_stamina, this.player.stamina);
				}
				if (oldEquipment.mana_bonus) {
					this.player.max_mana = Math.max(0, (this.player.max_mana || 0) - oldEquipment.mana_bonus);
					this.player.mana = Math.min(this.player.max_mana, this.player.mana || 0);
				}
				// Return old equipment to inventory
				this.player.inventory.push(oldEquipment);
				showMessage(`${t('unequipped')} ${oldEquipment.name}, ${t('addedToInventory')}.`);
			}

			// Equip new item
			this.player.equipment[it.slot] = it;
			showMessage(`${t('equipTo')} ${it.name} ${t('to')} ${it.slot}`);

			// Apply new equipment bonuses
			if (it.luck_gold) {
				this.player.luck_gold += it.luck_gold;
				showMessage(`${t('gainedGoldLuck')} +${it.luck_gold}`);
			}
			if (it.max_hp_bonus) {
				this.player.max_hp += it.max_hp_bonus;
				this.player.hp = Math.min(this.player.max_hp, this.player.hp + it.max_hp_bonus);
				showMessage(`${t('maxHpBonus')} +${it.max_hp_bonus}`);
			}
			if (it.stamina_bonus) {
				this.player.max_stamina += it.stamina_bonus;
				this.player.stamina = Math.min(this.player.max_stamina, this.player.stamina + it.stamina_bonus);
				showMessage(`${t('maxStaminaBonus')} +${it.stamina_bonus}`);
			}
			if (it.mana_bonus) {
				this.player.max_mana = (this.player.max_mana || 0) + it.mana_bonus;
				this.player.mana = Math.min(this.player.max_mana, (this.player.mana || 0) + it.mana_bonus);
				showMessage(`最大魔力 +${it.mana_bonus}`);
			}

			// Remove new item from inventory
			this.player.inventory.splice(index, 1);
			this.updateStatus();
		} else {
			showMessage(t('cannotEquip'));
		}
	},

	/**
	 * Unequip item from slot
	 * @param {string} slot - Equipment slot ('weapon'|'armor'|'amulet')
	 */
	unequipItem(slot) {
		if (!this.player.equipment || !this.player.equipment[slot]) {
			showMessage(t('noEquipmentInSlot'));
			return;
		}

		const it = this.player.equipment[slot];
		this.player.inventory.push(it);
		this.player.equipment[slot] = null;
		showMessage(`${t('unequipped')} ${it.name}, ${t('addedToInventory')}.`);

		// Remove equipment bonuses
		if (it.luck_gold) {
			this.player.luck_gold = Math.max(0, this.player.luck_gold - (it.luck_gold || 0));
			showMessage(`${t('goldLuckRemaining')} -${it.luck_gold}（${t('remaining')} ${this.player.luck_gold}）。`);
		}
		if (it.max_hp_bonus) {
			this.player.max_hp = Math.max(1, this.player.max_hp - it.max_hp_bonus);
			this.player.hp = Math.min(this.player.max_hp, this.player.hp);
			showMessage(`${t('maxHpBonus')} -${it.max_hp_bonus}`);
		}
		if (it.stamina_bonus) {
			this.player.max_stamina = Math.max(1, this.player.max_stamina - it.stamina_bonus);
			this.player.stamina = Math.min(this.player.max_stamina, this.player.stamina);
			showMessage(`${t('maxStaminaBonus')} -${it.stamina_bonus}`);
		}
		if (it.mana_bonus) {
			this.player.max_mana = Math.max(0, (this.player.max_mana || 0) - it.mana_bonus);
			this.player.mana = Math.min(this.player.max_mana, this.player.mana || 0);
			showMessage(`最大魔力 -${it.mana_bonus}`);
		}

		this.updateStatus();
	}
};
