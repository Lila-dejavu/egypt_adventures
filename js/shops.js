// ===== Shops Module =====
// Handles shop-related functionality: black market, trading post

/**
 * Shops mixin - methods to be attached to Game prototype
 * Dependencies: showMessage (global), t (global - i18n),
 *               ITEMS, QUALITY_BONUS, PYRAMID_AFFIXES (from data.js),
 *               cloneItem (from battle.js or global)
 */
const ShopsMixin = {
	/**
	 * Black market shop - gambling-style equipment purchases
	 */
	blackMarket() {
		this.inShop = true;
		showMessage('遇到黑市商人：能在黑市中獲得普通到史詩級裝備，此為賭博交易，最多購買兩件。');

		const panel = document.getElementById('blackmarket-panel');
		const itemsDiv = document.getElementById('blackmarket-items');
		if (!panel || !itemsDiv) {
			showMessage('（系統錯誤：黑市介面未載入）');
			return;
		}

		// Generate 3 random offerings (common to epic)
		const rarityWeights = [
			{r:'common',w:40},
			{r:'rare',w:30},
			{r:'excellent',w:20},
			{r:'epic',w:8},
			{r:'legendary',w:2}
		];

		function pickRarity() {
			let total = rarityWeights.reduce((s,i)=>s+i.w,0);
			let r = Math.random()*total;
			let acc = 0;
			for (const rw of rarityWeights) {
				acc += rw.w;
				if (r < acc) return rw.r;
			}
			return 'common';
		}

		const offers = [];
		for (let i = 0; i < 3; i++) {
			const base = ITEMS[Math.floor(Math.random()*ITEMS.length)];
			const r = pickRarity();
			const o = cloneItem(base, r);
			// Randomize price: completely random, doesn't reveal quality
			o.price = 149 + Math.floor(Math.random() * 880); // 149..1028 random amount
			offers.push(o);
		}

		// Display panel
		itemsDiv.innerHTML = '';
		panel._purchased = 0;

		const game = this;

		offers.forEach((it, idx) => {
			const el = document.createElement('div');
			const goldText = currentLanguage === 'zh-TW' ? '金幣' : currentLanguage === 'fr' ? 'd\'or' : 'gold';
			el.innerHTML = `<div style="margin-bottom:6px;"><strong>${it.name}</strong> (?) <br/>`+
				`${t('price')}: ${it.price} ${goldText} <button class="bm-buy" data-idx="${idx}">${t('buy')}</button></div>`;
			itemsDiv.appendChild(el);
		});

		panel.style.display = 'block';

		// Bind purchase buttons
		Array.from(itemsDiv.querySelectorAll('.bm-buy')).forEach(b => {
			b.addEventListener('click', () => {
				const idx = parseInt(b.getAttribute('data-idx'));
				if (panel._purchased >= 2) {
					showMessage(t('blackMarketLimit'));
					return;
				}
				const offer = offers[idx];
				if (!offer) return;
				if (game.player.gold < offer.price) {
					showMessage(t('notEnoughGold'));
					return;
				}

				// Deduct gold and add to inventory
				game.player.gold -= offer.price;
				game.player.inventory.push(Object.assign({}, offer));

				const goldText = currentLanguage === 'zh-TW' ? '金幣' : currentLanguage === 'fr' ? 'd\'or' : 'gold';
				showMessage(`${t('blackMarketBought')}: ${offer.name} (${offer.rarity}), ${t('spent')} ${offer.price} ${goldText}.`);

				// Reveal attributes
				let attrs = [];
				const atkLabel = currentLanguage === 'zh-TW' ? '攻' : currentLanguage === 'fr' ? 'ATT' : 'ATK';
				const defLabel = currentLanguage === 'zh-TW' ? '防' : currentLanguage === 'fr' ? 'DÉF' : 'DEF';
				const luckLabel = currentLanguage === 'zh-TW' ? '金運' : currentLanguage === 'fr' ? 'Chance Or' : 'Gold Luck';
				if (offer.atk) attrs.push(`${atkLabel}+${offer.atk}`);
				if (offer.def) attrs.push(`${defLabel}+${offer.def}`);
				if (offer.luck_gold) attrs.push(`${luckLabel}+${offer.luck_gold}`);
				if (attrs.length === 0) attrs.push(t('noSpecialAttributes'));
				showMessage(`${t('revealAttributes')}: ${attrs.join('  ')}`);

				panel._purchased += 1;
				b.textContent = t('purchased');
				b.disabled = true;
				game.updateStatus();

				if (panel._purchased >= 2) {
					showMessage(`${t('blackMarketLimit')} ${t('blackMarketEnd')}`);
					Array.from(itemsDiv.querySelectorAll('.bm-buy')).forEach(bb => { bb.disabled = true; });
				}
			});
		});

		// Close button
		const close = document.getElementById('close-blackmarket');
		if (close && !close._bmBound) {
			close._bmBound = true;
			close.addEventListener('click', () => {
				panel.style.display = 'none';
				game.inShop = false;
				showMessage(t('leaveBlackMarket'));
				// Re-enable movement buttons
				const mf = document.getElementById('move-front'); if (mf) mf.disabled = false;
				const ml = document.getElementById('move-left'); if (ml) ml.disabled = false;
				const mr = document.getElementById('move-right'); if (mr) mr.disabled = false;
				// Generate direction hints after leaving black market
				game.generateDirectionHints();
			});
		}

		// Disable movement to prevent context switching
		const mf = document.getElementById('move-front'); if (mf) mf.disabled = true;
		const ml = document.getElementById('move-left'); if (ml) ml.disabled = true;
		const mr = document.getElementById('move-right'); if (mr) mr.disabled = true;
		this.updateStatus();
	},

	/**
	 * Trading post - buy supplies and sell equipment
	 */
	tradingPost() {
		showMessage('🏪 你發現了一個沙漠驛站！');
		showMessage('這裡可以補給物資，也可以出售你不需要的裝備。');

		// Disable movement buttons
		const mf = document.getElementById('move-front'); if (mf) mf.disabled = true;
		const ml = document.getElementById('move-left'); if (ml) ml.disabled = true;
		const mr = document.getElementById('move-right'); if (mr) mr.disabled = true;

		const game = this;

		// Create trading post panel
		const panel = document.createElement('div');
		panel.id = 'trading-post-panel';
		panel.style.cssText = `
			position: fixed;
			top: 50%;
			left: 50%;
			transform: translate(-50%, -50%);
			background: linear-gradient(180deg, #fff9e6, #ffe4b3);
			border: 3px solid #d4a855;
			border-radius: 8px;
			padding: 12px;
			box-shadow: 0 8px 24px rgba(0,0,0,0.3);
			z-index: 100;
			width: 90vw;
			max-width: 450px;
			max-height: 85vh;
			overflow-y: auto;
		`;

		panel.innerHTML = `
			<h2 style="color: #8b4513; margin: 0 0 12px 0; text-align: center; font-size: 1.3em;">🏪 沙漠驛站</h2>

			<div style="background: #fff; padding: 8px; border-radius: 6px; margin-bottom: 10px;">
				<h3 style="margin: 0; color: #d4a855; font-size: 1em;">💰 你的金幣: <span id="tp-gold">${this.player.gold}</span></h3>
			</div>

			<div style="background: #fff; padding: 8px; border-radius: 6px; margin-bottom: 10px;">
				<h3 style="margin: 0 0 8px 0; color: #2ecc71; font-size: 1em;">🛒 補給物資</h3>
				<div style="display: flex; flex-direction: column; gap: 6px;">
					<div style="display: flex; justify-content: space-between; align-items: center; padding: 6px; background: #f8f8f8; border-radius: 4px; font-size: 0.9em;">
						<span>🧪 藥水 x1</span>
						<button class="tp-buy-btn" data-item="potion" data-price="200" style="padding: 5px 10px; background: #2ecc71; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 0.9em; white-space: nowrap;">200金幣</button>
					</div>
					<div style="display: flex; justify-content: space-between; align-items: center; padding: 6px; background: #f8f8f8; border-radius: 4px; font-size: 0.85em;">
						<span>🍖 食物（恢復30HP+15體力）</span>
						<button class="tp-buy-btn" data-item="food" data-price="40" style="padding: 5px 10px; background: #2ecc71; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 0.9em; white-space: nowrap;">40金幣</button>
					</div>
					<div style="display: flex; justify-content: space-between; align-items: center; padding: 6px; background: #f8f8f8; border-radius: 4px; font-size: 0.85em;">
						<span>💊 完全恢復（HP+體力全滿）</span>
						<button class="tp-buy-btn" data-item="fullheal" data-price="80" style="padding: 5px 10px; background: #2ecc71; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 0.9em; white-space: nowrap;">80金幣</button>
					</div>
				</div>
			</div>

			<div style="background: #fff; padding: 8px; border-radius: 6px; margin-bottom: 10px;">
				<h3 style="margin: 0 0 8px 0; color: #e74c3c; font-size: 1em;">💼 裝備管理</h3>
				<div id="tp-inventory" style="max-height: 180px; overflow-y: auto;">
					<!-- Equipment list will be dynamically generated -->
				</div>
			</div>

			<div style="text-align: center; margin-top: 10px;">
				<button id="tp-close" style="padding: 8px 20px; background: #95a5a6; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 1em;">離開驛站</button>
			</div>
		`;

		document.body.appendChild(panel);

		// Generate inventory list
		const updateInventory = () => {
			const invDiv = document.getElementById('tp-inventory');
			if (!invDiv) return;

			// Build complete list including equipped and inventory items
			const equippedSlots = ['weapon', 'armor', 'amulet'];
			const equippedItems = [];
			equippedSlots.forEach(slot => {
				if (game.player.equipment[slot]) {
					equippedItems.push({ item: game.player.equipment[slot], slot: slot, isEquipped: true });
				}
			});

			const inventoryItems = game.player.inventory.map((item, idx) => ({ item, idx, isEquipped: false }));
			const allItems = [...equippedItems, ...inventoryItems];

			if (allItems.length === 0) {
				invDiv.innerHTML = `<div style="text-align: center; color: #999; padding: 20px;">${t('inventoryEmpty')}</div>`;
				return;
			}

			let html = '';
			allItems.forEach((entry) => {
				const item = entry.item;
				const isEquipped = entry.isEquipped;

				// Calculate sell price based on rarity
				let basePrice = 20;
				if (item.rarity === 'rare') basePrice = 80;
				else if (item.rarity === 'excellent') basePrice = 130;
				else if (item.rarity === 'epic') basePrice = 200;
				else if (item.rarity === 'legendary') basePrice = 500;

				// Adjust price based on attributes
				if (item.atk) basePrice += item.atk * 5;
				if (item.def) basePrice += item.def * 5;
				if (item.max_hp_bonus) basePrice += item.max_hp_bonus * 2;

				const rarityColor = item.rarity === 'legendary' ? '#e67e22' :
					(item.rarity === 'epic' ? '#9b59b6' :
					(item.rarity === 'excellent' ? '#2ecc71' :
					(item.rarity === 'rare' ? '#3498db' : '#95a5a6')));

				// Equipped indicator
				const equippedBadge = isEquipped ?
					`<span style="background: #27ae60; color: white; padding: 1px 5px; border-radius: 3px; font-size: 0.7em; margin-left: 5px;">${t('equipped')}</span>` : '';

				// Data attribute: use slot for equipped, idx for inventory
				const dataAttr = isEquipped ? `data-slot="${entry.slot}"` : `data-idx="${entry.idx}"`;

				html += `
					<div style="display: flex; justify-content: space-between; align-items: center; padding: 6px; background: ${isEquipped ? '#e8f6e8' : '#f8f8f8'}; border-radius: 4px; margin-bottom: 5px; border-left: 3px solid ${rarityColor};">
						<div style="flex: 1; min-width: 0;">
							<div style="font-weight: bold; font-size: 0.9em; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${item.name}${item.enhanceLevel ? ' +' + item.enhanceLevel : ''}${equippedBadge}</div>
							<div style="font-size: 0.75em; color: #666;">${item.rarity}${item.isPyramid ? ' 🔺' : ''}</div>
						</div>
						<div style="display:flex; gap:6px; align-items:center;">
							<button class="tp-enhance-btn" ${dataAttr} style="padding: 5px 10px; background: #f39c12; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 0.85em; white-space: nowrap;">強化</button>
							${isEquipped ? '' : `<button class="tp-sell-btn" data-idx="${entry.idx}" data-price="${basePrice}" style="padding: 5px 10px; background: #e74c3c; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 0.85em; white-space: nowrap;">賣出 ${basePrice}金</button>`}
						</div>
					</div>
				`;
			});
			invDiv.innerHTML = html;

			// Bind sell buttons
			Array.from(invDiv.querySelectorAll('.tp-sell-btn')).forEach(btn => {
				btn.addEventListener('click', () => {
					const idx = parseInt(btn.getAttribute('data-idx'));
					const price = parseInt(btn.getAttribute('data-price'));
					const item = game.player.inventory[idx];

					if (item) {
						game.player.inventory.splice(idx, 1);
						game.player.gold += price;
						showMessage(`💰 賣出 ${item.name}，獲得 ${price} 金幣。`);
						document.getElementById('tp-gold').textContent = game.player.gold;
						updateInventory();
						game.updateStatus();
					}
				});
			});

			// Bind enhance buttons
			Array.from(invDiv.querySelectorAll('.tp-enhance-btn')).forEach(btn => {
				btn.addEventListener('click', () => {
					const slot = btn.getAttribute('data-slot');
					const idx = btn.getAttribute('data-idx');
					let item;
					if (slot) {
						item = game.player.equipment[slot];
					} else {
						item = game.player.inventory[parseInt(idx)];
					}
					if (!item) return;

					// Set base attributes for enhancement calculation
					if (typeof item._enhance_base_atk === 'undefined') item._enhance_base_atk = item.atk || 0;
					if (typeof item._enhance_base_def === 'undefined') item._enhance_base_def = item.def || 0;

					const currentLevel = item.enhanceLevel || 0;
					const targetLevel = currentLevel + 1;

					// Calculate cost (grows with level)
					const cost = Math.floor(100 * Math.pow(1.6, currentLevel));
					if (game.player.gold < cost) {
						showMessage('❌ 金幣不足，無法強化。');
						return;
					}

					game.player.gold -= cost;
					document.getElementById('tp-gold').textContent = game.player.gold;

					// Success rate: 1-3 guaranteed; 4-12 decreasing (min 5%)
					let success = false;
					if (targetLevel <= 3) {
						success = true;
					} else {
						const prob = Math.max(0.05, 1 - (targetLevel - 3) * 0.12);
						success = Math.random() < prob;
					}

					const atkPer = 2;
					const defPer = 1;

					if (success) {
						item.enhanceLevel = targetLevel;
						item.atk = (item._enhance_base_atk || 0) + item.enhanceLevel * atkPer;
						item.def = (item._enhance_base_def || 0) + item.enhanceLevel * defPer;
						showMessage(`✨ 強化成功！${item.name} 強化等級 +1（目前 +${item.enhanceLevel}）`);
					} else {
						item.enhanceLevel = Math.max(0, currentLevel - 1);
						item.atk = (item._enhance_base_atk || 0) + item.enhanceLevel * atkPer;
						item.def = (item._enhance_base_def || 0) + item.enhanceLevel * defPer;
						showMessage(`💥 強化失敗，${item.name} 強化等級 -1（目前 +${item.enhanceLevel}）`);
					}

					updateInventory();
					game.updateStatus();
				});
			});
		};

		updateInventory();

		// Bind purchase buttons
		Array.from(panel.querySelectorAll('.tp-buy-btn')).forEach(btn => {
			btn.addEventListener('click', () => {
				const item = btn.getAttribute('data-item');
				const price = parseInt(btn.getAttribute('data-price'));

				if (game.player.gold >= price) {
					game.player.gold -= price;

					if (item === 'potion') {
						game.player.potions += 1;
						showMessage('🧪 購買藥水 x1');
					} else if (item === 'food') {
						const mapMultiplier = Math.pow(2, game.difficulty - 1);
						const hpGain = Math.floor(30 * mapMultiplier);
						const staminaGain = Math.floor(15 * mapMultiplier);
						game.player.hp = Math.min(game.player.max_hp, game.player.hp + hpGain);
						game.player.stamina = Math.min(game.player.max_stamina, game.player.stamina + staminaGain);
						showMessage(`🍖 購買食物，HP +${hpGain}，體力 +${staminaGain}`);
					} else if (item === 'fullheal') {
						game.player.hp = game.player.max_hp;
						game.player.stamina = game.player.max_stamina;
						showMessage('💊 完全恢復！HP和體力全滿！');
					}

					document.getElementById('tp-gold').textContent = game.player.gold;
					game.updateStatus();
				} else {
					showMessage('❌ 金幣不足！');
				}
			});
		});

		// Close button
		const closeBtn = document.getElementById('tp-close');
		if (closeBtn) {
			closeBtn.addEventListener('click', () => {
				document.body.removeChild(panel);
				showMessage('你離開了驛站，繼續踏上旅程。');
				// Re-enable movement buttons
				if (mf) mf.disabled = false;
				if (ml) ml.disabled = false;
				if (mr) mr.disabled = false;
				// Generate direction hints
				game.generateDirectionHints();
			});
		}
	}
};
