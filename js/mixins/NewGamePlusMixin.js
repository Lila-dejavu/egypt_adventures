// ===== New Game Plus Module =====
// Handles game completion, victory screen, equipment carry-over, and new game+ initialization

/**
 * NewGamePlus mixin - methods to be attached to Game prototype
 * Dependencies: showMessage (global), t (global - i18n), DOMRefs (global),
 *               GameState (from GameState.js)
 */
const NewGamePlusMixin = {
	/**
	 * Show victory screen when game is completed (boss defeated on final map)
	 */
	showVictoryScreen() {
		// Play victory music
		if (typeof MusicSystem !== 'undefined') {
			MusicSystem.playVictory();
		}

		const victoryPanel = document.getElementById('victory-panel');
		const victoryOverlay = document.getElementById('victory-overlay');
		
		if (!victoryPanel || !victoryOverlay) {
			console.error('Victory panel elements not found');
			return;
		}

		// Get current playthrough count
		const playthroughs = parseInt(localStorage.getItem('egypt_playthroughs') || '0', 10);
		const newPlaythrough = playthroughs + 1;

		// Display victory stats
		const statsDiv = document.getElementById('victory-stats');
		if (statsDiv) {
			statsDiv.innerHTML = `
				<h3 style="color:#8b4513; margin:0 0 10px 0; text-align:center;" data-i18n="gameCompleteStats">${t('gameCompleteStats')}</h3>
				<div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; font-size:16px; color:#654321;">
					<div><strong data-i18n="finalLevel">${t('finalLevel')}:</strong></div>
					<div style="text-align:right;">${this.player.level}</div>
					<div><strong data-i18n="totalGold">${t('totalGold')}:</strong></div>
					<div style="text-align:right;">${this.player.gold}</div>
					<div><strong data-i18n="completedMaps">${t('completedMaps')}:</strong></div>
					<div style="text-align:right;">${this.difficulty}</div>
					<div><strong data-i18n="playthroughCount">${t('playthroughCount')}:</strong></div>
					<div style="text-align:right;">${newPlaythrough}</div>
				</div>
			`;
		}

		// Populate equipment selection
		const equipmentSelection = document.getElementById('equipment-selection');
		if (equipmentSelection) {
			equipmentSelection.innerHTML = '';

			// Collect all equipment (equipped + inventory)
			const allEquipment = [];
			
			// Add equipped items
			if (this.player.equipment.weapon) {
				allEquipment.push({ item: this.player.equipment.weapon, source: 'equipped', slot: 'weapon' });
			}
			if (this.player.equipment.armor) {
				allEquipment.push({ item: this.player.equipment.armor, source: 'equipped', slot: 'armor' });
			}
			if (this.player.equipment.amulet) {
				allEquipment.push({ item: this.player.equipment.amulet, source: 'equipped', slot: 'amulet' });
			}

			// Add inventory items
			this.player.inventory.forEach((item, index) => {
				if (item.slot) { // Only equipment items
					allEquipment.push({ item: item, source: 'inventory', index: index });
				}
			});

			if (allEquipment.length === 0) {
				equipmentSelection.innerHTML = `<p style="text-align:center; color:#654321; padding:20px;" data-i18n="noEquipmentToCarry">${t('noEquipmentToCarry')}</p>`;
			} else {
				// Add "skip" option
				const skipDiv = document.createElement('div');
				skipDiv.className = 'equipment-item-selection';
				skipDiv.innerHTML = `
					<input type="radio" name="carryover-equipment" id="carryover-none" value="none" checked>
					<label for="carryover-none" data-i18n="skipCarryOver">${t('skipCarryOver')}</label>
				`;
				equipmentSelection.appendChild(skipDiv);

				// Add click handler to skip option
				skipDiv.addEventListener('click', () => {
					document.getElementById('carryover-none').checked = true;
					document.querySelectorAll('.equipment-item-selection').forEach(el => el.classList.remove('selected'));
					skipDiv.classList.add('selected');
				});

				// Add each equipment item
				allEquipment.forEach((eq, idx) => {
					const itemDiv = document.createElement('div');
					itemDiv.className = 'equipment-item-selection';
					const itemHtml = this.formatItem(eq.item);
					const radioId = `carryover-${idx}`;
					
					itemDiv.innerHTML = `
						<input type="radio" name="carryover-equipment" id="${radioId}" value="${idx}">
						<label for="${radioId}">${itemHtml}</label>
					`;
					
					equipmentSelection.appendChild(itemDiv);

					// Add click handler
					itemDiv.addEventListener('click', () => {
						document.getElementById(radioId).checked = true;
						document.querySelectorAll('.equipment-item-selection').forEach(el => el.classList.remove('selected'));
						itemDiv.classList.add('selected');
					});
				});

				// Store equipment data for later retrieval
				this._carryoverEquipmentData = allEquipment;
			}
		}

		// Show the panels
		victoryOverlay.style.display = 'block';
		victoryPanel.style.display = 'block';

		// Setup button handler
		const startButton = document.getElementById('start-new-game-plus');
		if (startButton) {
			startButton.onclick = () => {
				this.startNewGamePlus();
			};
		}

		// Update UI language
		if (typeof updateUILanguage === 'function') {
			updateUILanguage();
		}
	},

	/**
	 * Start new game+ with selected equipment
	 */
	startNewGamePlus() {
		// Get selected equipment
		const selectedRadio = document.querySelector('input[name="carryover-equipment"]:checked');
		let carryoverItem = null;

		if (selectedRadio && selectedRadio.value !== 'none') {
			const index = parseInt(selectedRadio.value, 10);
			if (this._carryoverEquipmentData && this._carryoverEquipmentData[index]) {
				// Clone the item to avoid reference issues
				const originalItem = this._carryoverEquipmentData[index].item;
				carryoverItem = JSON.parse(JSON.stringify(originalItem));
			}
		}

		// Save carryover equipment to localStorage
		if (carryoverItem) {
			localStorage.setItem('egypt_carryover_equipment', JSON.stringify(carryoverItem));
			showMessage(`✨ ${t('selectCarryOverEquipment')} ${this.formatItem(carryoverItem)}`);
		} else {
			localStorage.removeItem('egypt_carryover_equipment');
		}

		// Increment playthrough count
		const playthroughs = parseInt(localStorage.getItem('egypt_playthroughs') || '0', 10);
		localStorage.setItem('egypt_playthroughs', (playthroughs + 1).toString());

		// Hide victory panels
		const victoryPanel = document.getElementById('victory-panel');
		const victoryOverlay = document.getElementById('victory-overlay');
		if (victoryPanel) victoryPanel.style.display = 'none';
		if (victoryOverlay) victoryOverlay.style.display = 'none';

		// Show restart message
		showMessage('🔄 準備開始新周目...');
		
		// Reload page to start fresh
		setTimeout(() => {
			window.location.reload();
		}, 500);
	},

	/**
	 * Apply carryover equipment at game start (called during Game initialization)
	 */
	applyCarryoverEquipment() {
		const carryoverData = localStorage.getItem('egypt_carryover_equipment');
		if (!carryoverData) return;

		try {
			const item = JSON.parse(carryoverData);
			
			// Add to inventory
			this.player.inventory.push(item);
			
			showMessage(`🎁 新周目獎勵：你攜帶了 ${this.formatItem(item)} 進入新周目！`);
			
			// Clear the carryover data (one-time use)
			localStorage.removeItem('egypt_carryover_equipment');
			
			// Auto-save immediately after applying carryover equipment
			// This ensures the equipment is persisted in the save file
			if (typeof this.saveGame === 'function') {
				setTimeout(() => {
					this.saveGame();
					showMessage('💾 攜帶裝備已自動保存');
				}, 100);
			}
		} catch (e) {
			console.error('Failed to apply carryover equipment:', e);
			localStorage.removeItem('egypt_carryover_equipment');
		}
	}
};

// Expose globally
window.NewGamePlusMixin = NewGamePlusMixin;
