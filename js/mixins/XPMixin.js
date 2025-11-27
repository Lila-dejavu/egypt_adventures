// ===== XP/Leveling Module =====
// Handles experience points and level progression

/**
 * XP mixin - methods to be attached to Game prototype
 * Dependencies: showMessage (global), t (global - i18n)
 */
const XPMixin = {
	/**
	 * Calculate XP required for next level
	 * @param {number} level - Current level (starting from 1)
	 * @returns {number} XP needed to reach level+1, or Infinity if max level
	 */
	xpForNext(level) {
		if (level >= 99) return Infinity;
		return Math.floor(100 * level * Math.pow(1.06, level - 1));
	},

	/**
	 * Add XP and handle level-up
	 * @param {number} amount - Amount of XP to add
	 */
	addXP(amount) {
		this.player.xp += amount;
		showMessage(`${t('gainedExp')} ${amount}。`);

		// Auto level-up loop (supports multi-level ups)
		while (this.player.level < 99 && this.player.xp >= this.xpForNext(this.player.level)) {
			const need = this.xpForNext(this.player.level);
			this.player.xp -= need;
			this.player.level += 1;

			// Level rewards: increase max HP and stamina, fully restore
			this.player.max_hp += 10;
			this.player.max_stamina += 5;
			this.player.hp = this.player.max_hp; // Full HP restore
			this.player.stamina = this.player.max_stamina; // Full stamina restore

			showMessage(`${t('levelUp')} ${this.player.level} ${t('hpStaminaRecovered')}`);
		}
	}
};
