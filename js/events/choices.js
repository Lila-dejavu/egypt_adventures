// Choice Events - Events with showChoicePanel UI for player decisions
// Called with Game instance as `this`

const ChoiceEvents = {
    sandstorm_shelter: {
        weight: 5,
        handler() {
            showMessage('🌪️ 巨大的沙塵暴即將來襲！你發現了一個避難所...');
            const choices = [
                { id: 'enter_cave', label: '進入洞穴避難（安全但可能遇到居民）', weight: 35 },
                { id: 'ruins_shelter', label: '躲進廢墟（可搜尋物資但不穩固）', weight: 35 },
                { id: 'brave_storm', label: '硬撐沙塵暴繼續前進（消耗體力但節省時間）', weight: 30 }
            ];
            this.showChoicePanel(
                '沙塵暴來襲！',
                choices,
                (choiceId) => {
                    let needsDirectionHints = false;

                    if (choiceId === 'enter_cave') {
                        const caveRoll = Math.random();
                        if (caveRoll < 0.5) {
                            showMessage('🏔️ 洞穴空無一人，你安全地度過了沙塵暴。');
                            this.player.hp = Math.min(this.player.max_hp, this.player.hp + 30);
                            this.player.stamina = Math.min(this.player.max_stamina, this.player.stamina + 20);
                            showMessage('💤 趁機休息，恢復 30 HP 和 20 體力。');
                            needsDirectionHints = true;
                        } else if (caveRoll < 0.8) {
                            showMessage('👴 洞穴中住著一位隱士，他分享了食物和故事。');
                            this.player.hp = this.player.max_hp;
                            const xp = 40 + Math.floor(Math.random() * 40);
                            this.addXP(xp);
                            showMessage('📖 你從隱士的故事中學到了很多！');
                            if (Math.random() < 0.4) {
                                const item = generateItem('common', this.difficulty);
                                this.player.inventory.push(item);
                                showMessage(`🎁 隱士送給你一件禮物：${this.formatItem(item)}`);
                            }
                            needsDirectionHints = true;
                        } else {
                            showMessage('🐺 洞穴是野獸的巢穴！你必須戰鬥！');
                            this.battle('elite');
                        }
                    } else if (choiceId === 'ruins_shelter') {
                        showMessage('🏛️ 你躲進了古老的廢墟中...');
                        const ruinsRoll = Math.random();
                        if (ruinsRoll < 0.4) {
                            const gold = 60 + Math.floor(Math.random() * 80);
                            this.player.gold += gold;
                            showMessage(`💰 在廢墟中搜尋時，你發現了 ${gold} 金幣！`);
                            if (Math.random() < 0.6) {
                                const item = generateItem(Math.random() < 0.3 ? 'rare' : 'common', this.difficulty);
                                this.player.inventory.push(item);
                                showMessage(`⚔️ 還找到了 ${this.formatItem(item)}！`);
                            }
                        } else if (ruinsRoll < 0.7) {
                            const damage = 15 + Math.floor(Math.random() * 15);
                            this.player.hp = Math.max(1, this.player.hp - damage);
                            showMessage(`💥 廢墟部分坍塌！你受到 ${damage} 點傷害。`);
                            showMessage('🏃 你趕緊逃出廢墟，沙塵暴已經過去。');
                        } else {
                            showMessage('🌪️ 廢墟很穩固，你安全地躲過了沙塵暴。');
                            showMessage('但廢墟中沒有找到任何有價值的東西。');
                        }
                        needsDirectionHints = true;
                    } else if (choiceId === 'brave_storm') {
                        showMessage('💪 你決定勇敢面對沙塵暴！');
                        const stormDamage = 20 + Math.floor(Math.random() * 20);
                        const staminaCost = 25 + Math.floor(Math.random() * 15);
                        this.player.hp = Math.max(1, this.player.hp - stormDamage);
                        this.player.stamina = Math.max(0, this.player.stamina - staminaCost);
                        showMessage(`🌪️ 沙塵暴很猛烈！你損失了 ${stormDamage} HP 和 ${staminaCost} 體力。`);
                        if (Math.random() < 0.6) {
                            this.player.luck_combat += 1;
                            showMessage('💎 在暴風中前行鍛鍊了你的意志，戰鬥幸運 +1！');
                        }
                        this.map_steps += 1;
                        showMessage(`🏃 你成功穿越了沙塵暴區域，地圖進度額外 +1（${this.map_steps}/${this.map_goal}）！`);
                        needsDirectionHints = true;
                    }

                    if (needsDirectionHints) {
                        this.updateStatus();
                        this.generateDirectionHints();
                    }
                }
            );
        }
    },

    wandering_alchemist: {
        weight: 5,
        handler() {
            showMessage('🧙 你遇到了一位流浪的煉金術師...');
            const choices = [
                { id: 'buy_potion', label: '購買藥水（80 金幣/瓶）', weight: 30 },
                { id: 'trade_gold', label: '用金幣換取特殊藥劑', weight: 35 },
                { id: 'learn_alchemy', label: '學習煉金知識（消耗時間但獲得永久效果）', weight: 35 }
            ];
            this.showChoicePanel(
                '煉金術師的提議',
                choices,
                (choiceId) => {
                    if (choiceId === 'buy_potion') {
                        const potionPrice = 80;
                        const maxPotions = Math.floor(this.player.gold / potionPrice);
                        if (maxPotions === 0) {
                            showMessage('💸 你的金幣不夠購買藥水。');
                            showMessage('🧙 煉金術師：「等你有錢了再來吧。」');
                        } else {
                            const buyCount = Math.min(3, maxPotions);
                            const totalCost = buyCount * potionPrice;
                            this.player.gold -= totalCost;
                            this.player.potions += buyCount;
                            showMessage(`🧪 你花費 ${totalCost} 金幣購買了 ${buyCount} 瓶高品質藥水！`);
                        }
                        this.updateStatus();
                        this.generateDirectionHints();
                    } else if (choiceId === 'trade_gold') {
                        const elixirCost = 150;
                        if (this.player.gold < elixirCost) {
                            showMessage('💸 你沒有足夠的金幣（需要 150 金幣）。');
                        } else {
                            this.player.gold -= elixirCost;
                            const elixirType = Math.random();
                            if (elixirType < 0.33) {
                                this.player.max_hp += 40;
                                this.player.hp = Math.min(this.player.max_hp, this.player.hp + 40);
                                showMessage('💪 你獲得了力量藥劑！最大HP永久 +40！');
                            } else if (elixirType < 0.66) {
                                this.player.max_stamina += 30;
                                this.player.stamina = Math.min(this.player.max_stamina, this.player.stamina + 30);
                                showMessage('🏃 你獲得了敏捷藥劑！最大體力永久 +30！');
                            } else {
                                this.player.luck_combat += 3;
                                this.player.luck_gold += 2;
                                showMessage('🍀 你獲得了幸運藥劑！戰鬥幸運 +3，金幣幸運 +2！');
                            }
                        }
                        this.updateStatus();
                        this.generateDirectionHints();
                    } else if (choiceId === 'learn_alchemy') {
                        showMessage('📚 煉金術師開始教導你煉金的奧秘...');
                        const xp = 70 + Math.floor(Math.random() * 50);
                        this.addXP(xp);
                        this.player.stamina = Math.max(0, this.player.stamina - 20);
                        showMessage('😓 學習很累人，消耗 20 體力。');
                        if (!this.player.alchemyKnowledge) {
                            this.player.alchemyKnowledge = true;
                            showMessage('✨ 你學會了基礎煉金術！');
                            showMessage('🧪 從現在開始，使用藥水時額外恢復 20% HP！');
                        } else {
                            this.player.potions += 2;
                            showMessage('📖 你的煉金知識更加精進，獲得 2 瓶藥水！');
                        }
                        this.updateStatus();
                        this.generateDirectionHints();
                    }
                }
            );
        }
    },

    ancient_tablet: {
        weight: 4,
        handler() {
            showMessage('📜 你發現了一塊刻有古老文字的石碑...');
            const choices = [
                { id: 'study', label: '仔細研讀（獲得大量經驗）', weight: 40 },
                { id: 'touch', label: '觸摸石碑（可能觸發魔法）', weight: 30 },
                { id: 'ignore', label: '無視石碑繼續前進', weight: 30 }
            ];
            this.showChoicePanel(
                '古代石碑',
                choices,
                (choiceId) => {
                    if (choiceId === 'study') {
                        showMessage('🔍 你努力解讀石碑上的文字...');
                        const studyRoll = Math.random();
                        if (studyRoll < 0.6) {
                            const xp = 80 + Math.floor(Math.random() * 70);
                            this.addXP(xp);
                            showMessage('💡 你成功解讀了古老的知識！');
                            const bonusType = Math.random();
                            if (bonusType < 0.4) {
                                this.player.max_hp += 25;
                                this.player.hp = Math.min(this.player.max_hp, this.player.hp + 25);
                                showMessage('📖 石碑記載了古老的體能訓練法，最大HP +25！');
                            } else if (bonusType < 0.7) {
                                this.player.luck_combat += 2;
                                showMessage('📖 石碑記載了戰鬥技巧，戰鬥幸運 +2！');
                            } else {
                                this.player.luck_gold += 2;
                                showMessage('📖 石碑記載了寶藏的位置線索，金幣幸運 +2！');
                            }
                        } else {
                            const xp = 30 + Math.floor(Math.random() * 30);
                            this.addXP(xp);
                            showMessage('😕 文字太古老了，你只能理解一小部分。');
                            showMessage('但你仍然學到了一些東西。');
                        }
                    } else if (choiceId === 'touch') {
                        showMessage('✋ 你的手觸碰到了石碑...');
                        const touchRoll = Math.random();
                        if (touchRoll < 0.35) {
                            showMessage('✨ 石碑散發出溫暖的光芒！');
                            this.player.hp = this.player.max_hp;
                            this.player.stamina = this.player.max_stamina;
                            this.player.shield += 30;
                            showMessage('💫 你的生命和體力完全恢復，並獲得 30 點護盾！');
                            const xp = 50;
                            this.addXP(xp);
                        } else if (touchRoll < 0.65) {
                            showMessage('🌀 石碑的魔法將你傳送到了另一個地方！');
                            this.map_steps += 2;
                            showMessage(`📍 地圖進度 +2（${this.map_steps}/${this.map_goal}）`);
                            const gold = 50 + Math.floor(Math.random() * 50);
                            this.player.gold += gold;
                            showMessage(`💰 你在新地點發現了 ${gold} 金幣！`);
                        } else {
                            showMessage('⚠️ 石碑是個陷阱！');
                            const damage = 25 + Math.floor(Math.random() * 20);
                            this.player.hp = Math.max(1, this.player.hp - damage);
                            showMessage(`💥 魔法能量爆發，你受到 ${damage} 點傷害！`);
                        }
                    } else if (choiceId === 'ignore') {
                        showMessage('🚶 你決定不理會石碑，繼續你的旅程。');
                        showMessage('安全第一總是沒錯的。');
                        this.player.stamina = Math.min(this.player.max_stamina, this.player.stamina + 10);
                        showMessage('體力恢復 10 點。');
                    }
                    this.updateStatus();
                    this.generateDirectionHints();
                }
            );
        }
    },

    beast_pack: {
        weight: 6,
        handler() {
            // use i18n keys so translations are applied
            showMessage(t('evt_js_events_choices_js_242'));
            const choices = [
                { id: 'fight', label: t('choice_beast_fight_label'), weight: 35 },
                { id: 'scare', label: t('choice_beast_scare_label'), weight: 30 },
                { id: 'negotiate', label: t('choice_beast_negotiate_label'), weight: 35 }
            ];
            this.showChoicePanel(
                t('choice_beast_title'),
                choices,
                (choiceId) => {
                    if (choiceId === 'fight') {
                        showMessage(t('evt_js_events_choices_js_253'));
                        this.enemy.isBeastPack = true;
                        this.enemy.beastPackRemaining = 2;
                        this.battle('monster');
                    } else if (choiceId === 'scare') {
                        const staminaCost = 30;
                        if (this.player.stamina < staminaCost) {
                            showMessage(t('evt_js_events_choices_js_260'));
                            showMessage(t('evt_js_events_choices_js_261'));
                            this.battle('elite');
                        } else {
                            const scareRoll = Math.random();
                            if (scareRoll < 0.7) {
                                this.player.stamina -= staminaCost;
                                // translation strings use ${staminaCost} placeholder in locales; replace it here
                                showMessage(t('evt_js_events_choices_js_267').replace('${staminaCost}', staminaCost));
                                if (Math.random() < 0.5) {
                                    const gold = 30 + Math.floor(Math.random() * 40);
                                    this.player.gold += gold;
                                    showMessage(t('evt_js_events_choices_js_271').replace('${gold}', gold));
                                }
                                this.updateStatus();
                                this.generateDirectionHints();
                            } else {
                                this.player.stamina -= staminaCost;
                                showMessage(t('evt_js_events_choices_js_277').replace('${staminaCost}', staminaCost));
                                this.battle('elite');
                            }

                        }
                    } else if (choiceId === 'negotiate') {
                        if (this.player.potions < 1) {
                            showMessage(t('evt_js_events_choices_js_279'));
                            showMessage(t('evt_js_events_choices_js_284'));
                            this.battle('monster');
                        } else {
                            this.player.potions -= 1;
                            showMessage(t('evt_js_events_choices_js_288'));
                            showMessage(t('evt_js_events_choices_js_289'));
                            const giftRoll = Math.random();
                            if (giftRoll < 0.4) {
                                const item = generateItem(Math.random() < 0.4 ? 'rare' : 'common', this.difficulty);
                                this.player.inventory.push(item);
                                showMessage(t('evt_js_events_choices_js_294').replace('${this.formatItem(item)}', this.formatItem(item)));
                            } else {
                                const gold = 40 + Math.floor(Math.random() * 60);
                                this.player.gold += gold;
                                showMessage(t('evt_js_events_choices_js_298').replace('${gold}', gold));
                            }
                            const xp = 40;
                            this.addXP(xp);
                            this.updateStatus();
                            this.generateDirectionHints();
                        }
                    }
                }
            );
        }
    },

    moonlight_altar: {
        weight: 4,
        handler() {
            showMessage('🌙 在月光下，你發現了一座神秘的祭壇...');
            const choices = [
                { id: 'pray', label: '虔誠祈禱（可能獲得祝福）', weight: 35 },
                { id: 'offer_gold', label: '獻上金幣（100 金幣）', weight: 30 },
                { id: 'take_treasure', label: '拿走祭壇上的寶物（冒險）', weight: 35 }
            ];
            this.showChoicePanel(
                '月光祭壇',
                choices,
                (choiceId) => {
                    if (choiceId === 'pray') {
                        showMessage('🙏 你跪在祭壇前虔誠祈禱...');
                        const prayRoll = Math.random();
                        if (prayRoll < 0.5) {
                            showMessage('✨ 月神回應了你的祈禱！');
                            this.player.moonBlessing = 5;
                            showMessage('🌙 你獲得月神祝福，接下來 5 場戰鬥暴擊率大幅提升！');
                            const xp = 60 + Math.floor(Math.random() * 40);
                            this.addXP(xp);
                        } else if (prayRoll < 0.8) {
                            showMessage('🌟 月光照耀著你。');
                            this.player.hp = Math.min(this.player.max_hp, this.player.hp + 40);
                            this.player.luck_combat += 1;
                            showMessage('恢復 40 HP，戰鬥幸運 +1。');
                        } else {
                            showMessage('...');
                            showMessage('月神似乎沒有回應，但祈禱讓你內心平靜。');
                            this.player.stamina = Math.min(this.player.max_stamina, this.player.stamina + 15);
                        }
                    } else if (choiceId === 'offer_gold') {
                        const offerCost = 100;
                        if (this.player.gold < offerCost) {
                            showMessage('💸 你沒有足夠的金幣獻祭。');
                            showMessage('🌙 但月神欣賞你的誠意。');
                            this.player.luck_gold += 1;
                            showMessage('金幣幸運 +1。');
                        } else {
                            this.player.gold -= offerCost;
                            showMessage(`💰 你獻上了 ${offerCost} 金幣。`);
                            showMessage('✨ 祭壇綻放出耀眼的光芒！');
                            const rewardType = Math.random();
                            if (rewardType < 0.4) {
                                const goldReturn = offerCost * 3;
                                this.player.gold += goldReturn;
                                showMessage(`💎 月神慷慨地回饋你 ${goldReturn} 金幣！`);
                            } else if (rewardType < 0.7) {
                                const item = generateItem(Math.random() < 0.5 ? 'epic' : 'rare', this.difficulty);
                                this.player.inventory.push(item);
                                showMessage(`⚔️ 月神賜予你一件珍貴的裝備：${this.formatItem(item)}！`);
                            } else {
                                this.player.max_hp += 35;
                                this.player.max_stamina += 25;
                                this.player.hp = Math.min(this.player.max_hp, this.player.hp + 35);
                                this.player.stamina = Math.min(this.player.max_stamina, this.player.stamina + 25);
                                showMessage('🌙 月神的力量強化了你的身體！最大HP +35，最大體力 +25！');
                            }
                        }
                    } else if (choiceId === 'take_treasure') {
                        showMessage('👁️ 你伸手去拿祭壇上的寶物...');
                        const takeRoll = Math.random();
                        if (takeRoll < 0.3) {
                            showMessage('🎉 沒有觸發任何機關！');
                            const item = generateItem(Math.random() < 0.6 ? 'rare' : 'epic', this.difficulty);
                            this.player.inventory.push(item);
                            const gold = 80 + Math.floor(Math.random() * 120);
                            this.player.gold += gold;
                            showMessage(`💰 你獲得了 ${gold} 金幣和 ${this.formatItem(item)}！`);
                            this.updateStatus();
                            this.generateDirectionHints();
                        } else if (takeRoll < 0.6) {
                            showMessage('⚠️ 祭壇的守護魔法觸發了！');
                            const item = generateItem('rare', this.difficulty);
                            this.player.inventory.push(item);
                            showMessage(`⚔️ 你拿到了 ${this.formatItem(item)}`);
                            const curse = 20 + Math.floor(Math.random() * 15);
                            this.player.hp = Math.max(1, this.player.hp - curse);
                            this.player.max_hp = Math.max(50, this.player.max_hp - 10);
                            showMessage(`😈 但受到詛咒！損失 ${curse} HP 和 10 最大HP！`);
                            this.updateStatus();
                            this.generateDirectionHints();
                        } else {
                            showMessage('👹 祭壇的守護者被喚醒了！');
                            this.battle('mini_boss');
                        }
                        return;
                    }
                    this.updateStatus();
                    this.generateDirectionHints();
                }
            );
        }
    },

    caravan_wreckage: {
        weight: 5,
        handler() {
            showMessage('🐪 你發現了一處商隊遺骸...');
            const choices = [
                { id: 'search_carefully', label: '仔細搜尋（耗時但安全）', weight: 35 },
                { id: 'quick_loot', label: '快速搜刮（可能遺漏物品）', weight: 30 },
                { id: 'check_survivors', label: '檢查是否有倖存者', weight: 35 }
            ];
            this.showChoicePanel(
                '商隊遺骸',
                choices,
                (choiceId) => {
                    if (choiceId === 'search_carefully') {
                        showMessage('🔍 你仔細搜索每一個角落...');
                        this.player.stamina = Math.max(0, this.player.stamina - 15);
                        showMessage('😓 仔細搜索消耗了 15 體力。');
                        const gold = 100 + Math.floor(Math.random() * 150);
                        this.player.gold += gold;
                        showMessage(`💰 你找到了 ${gold} 金幣！`);

                        const itemCount = 1 + (Math.random() < 0.5 ? 1 : 0);
                        for (let i = 0; i < itemCount; i++) {
                            const rarity = Math.random() < 0.3 ? 'rare' : 'common';
                            const item = generateItem(rarity, this.difficulty);
                            this.player.inventory.push(item);
                            showMessage(`⚔️ 找到了 ${this.formatItem(item)}！`);
                        }

                        if (Math.random() < 0.4) {
                            const potions = 1 + Math.floor(Math.random() * 2);
                            this.player.potions += potions;
                            showMessage(`🧪 還找到了 ${potions} 瓶藥水！`);
                        }
                        this.updateStatus();
                        this.generateDirectionHints();
                    } else if (choiceId === 'quick_loot') {
                        showMessage('💨 你快速搜刮了一遍...');
                        const quickRoll = Math.random();
                        if (quickRoll < 0.5) {
                            const gold = 50 + Math.floor(Math.random() * 80);
                            this.player.gold += gold;
                            showMessage(`💰 你找到了 ${gold} 金幣。`);
                            if (Math.random() < 0.4) {
                                const item = generateItem('common', this.difficulty);
                                this.player.inventory.push(item);
                                showMessage(`⚔️ 還找到了 ${this.formatItem(item)}。`);
                            }
                            this.updateStatus();
                            this.generateDirectionHints();
                        } else if (quickRoll < 0.8) {
                            showMessage('💥 你觸發了殘留的陷阱！');
                            const damage = 20 + Math.floor(Math.random() * 15);
                            this.player.hp = Math.max(1, this.player.hp - damage);
                            showMessage(`受到 ${damage} 點傷害。`);
                            const gold = 30 + Math.floor(Math.random() * 40);
                            this.player.gold += gold;
                            showMessage(`💰 匆忙中你還是撿到了 ${gold} 金幣。`);
                            this.updateStatus();
                            this.generateDirectionHints();
                        } else {
                            showMessage('⚠️ 其他掠奪者也盯上了這裡！');
                            this.battle('monster');
                        }
                    } else if (choiceId === 'check_survivors') {
                        showMessage('🔍 你檢查商隊成員的狀況...');
                        const survivorRoll = Math.random();
                        if (survivorRoll < 0.3) {
                            showMessage('😊 你找到了一位倖存者！');
                            const gold = 150;
                            this.player.gold += gold;
                            showMessage(`💰 倖存者感激地給了你 ${gold} 金幣作為酬謝。`);
                            const item = generateItem(Math.random() < 0.5 ? 'rare' : 'excellent', this.difficulty);
                            this.player.inventory.push(item);
                            showMessage(`🎁 還送給你一件珍貴物品：${this.formatItem(item)}！`);
                            const xp = 80 + Math.floor(Math.random() * 40);
                            this.addXP(xp);
                            showMessage('😌 救人一命讓你心情愉悅。');
                            this.updateStatus();
                            this.generateDirectionHints();
                        } else if (survivorRoll < 0.7) {
                            showMessage('😔 所有人都已經罹難了...');
                            showMessage('📖 你找到了商隊隊長的日記。');
                            const xp = 50 + Math.floor(Math.random() * 50);
                            this.addXP(xp);
                            showMessage('從日記中你學到了一些沙漠生存技巧。');
                            const gold = 60 + Math.floor(Math.random() * 60);
                            this.player.gold += gold;
                            showMessage(`💰 你找到了他們的共同基金 ${gold} 金幣。`);
                            this.updateStatus();
                            this.generateDirectionHints();
                        } else {
                            showMessage('😨 「倖存者」突然站起來攻擊你！');
                            showMessage('原來是盜賊的陷阱！');
                            this.battle('elite');
                        }
                    }
                }
            );
        }
    },

    pyramid: {
        weight: 6,
        handler() {
            showMessage('🔺 你發現了一座古老的金字塔！');
            showMessage('這裡充滿危險，但也蘊藏著巨大的寶藏...');
            showMessage('金字塔副本：8步探險，敵人強度極高（隨地圖提升），獎勵豐厚（15倍經驗/金幣），保證掉落優良以上裝備！');
            this.showPyramidChoice();
        }
    },

    sphinx_riddle: {
        weight: 5,
        handler() {
            showMessage('🦁 你遇到了傳說中的斯芬克斯！');
            showMessage('「旅人啊，回答我的謎題，或者接受挑戰...」');
            const choices = [
                { id: 'answer_riddle', label: '嘗試回答謎題（考驗智慧）', weight: 40 },
                { id: 'bargain', label: '請求用財富換取通行（需200金幣）', weight: 30 },
                { id: 'challenge', label: '拒絕並挑戰斯芬克斯', weight: 30 }
            ];
            this.showChoicePanel(
                '斯芬克斯的謎題',
                choices,
                (choiceId) => {
                    if (choiceId === 'answer_riddle') {
                        showMessage('🤔 斯芬克斯提出了謎題：「什麼東西早上四條腿，中午兩條腿，晚上三條腿？」');
                        const intelligence = Math.random();
                        if (intelligence < 0.4) {
                            showMessage('💡 「答案是...人！」');
                            showMessage('✨ 「正確！你的智慧令我欽佩。」');
                            showMessage('🎁 斯芬克斯賜予你珍貴的獎勵！');
                            
                            const gold = 200 + Math.floor(Math.random() * 200);
                            this.player.gold += gold;
                            showMessage(`💰 獲得 ${gold} 金幣！`);
                            
                            const item = generateItem(Math.random() < 0.5 ? 'epic' : 'excellent', this.difficulty);
                            this.player.inventory.push(item);
                            showMessage(`⚔️ 獲得史詩裝備：${this.formatItem(item)}！`);
                            
                            this.player.max_hp += 30;
                            this.player.max_mana += 20;
                            this.player.max_stamina += 20;
                            showMessage('🌟 智慧的力量永久提升你的能力：最大HP +30，最大魔力/體力 +20！');
                            
                            const xp = 150 + Math.floor(Math.random() * 100);
                            this.addXP(xp);
                        } else if (intelligence < 0.7) {
                            showMessage('😅 「答案是...四腳獸？」');
                            showMessage('「錯誤。不過我欣賞你的勇氣。」');
                            const gold = 50 + Math.floor(Math.random() * 100);
                            this.player.gold += gold;
                            showMessage(`💰 斯芬克斯給了你一些金幣作為安慰：${gold} 金幣。`);
                            const xp = 40;
                            this.addXP(xp);
                        } else {
                            showMessage('😰 你答錯了，斯芬克斯憤怒了！');
                            showMessage('「無知者不配通過此地！」');
                            const damage = 40 + Math.floor(Math.random() * 30);
                            this.player.hp = Math.max(1, this.player.hp - damage);
                            showMessage(`⚡ 魔法懲罰造成 ${damage} 點傷害！`);
                        }
                        this.updateStatus();
                        this.generateDirectionHints();
                    } else if (choiceId === 'bargain') {
                        if (this.player.gold >= 200) {
                            this.player.gold -= 200;
                            showMessage('💰 你獻上了 200 金幣。');
                            showMessage('「財富也是一種智慧...你可以通過。」');
                            const item = generateItem('rare', this.difficulty);
                            this.player.inventory.push(item);
                            showMessage(`🎁 斯芬克斯作為回禮給了你：${this.formatItem(item)}`);
                            this.player.luck_gold += 2;
                            showMessage('✨ 斯芬克斯的祝福：金幣幸運 +2！');
                        } else {
                            showMessage('💸 你沒有足夠的金幣...');
                            showMessage('「既無智慧也無財富，那就用力量證明自己吧！」');
                            this.battle('elite');
                            return;
                        }
                        this.updateStatus();
                        this.generateDirectionHints();
                    } else if (choiceId === 'challenge') {
                        showMessage('⚔️ 「愚蠢的凡人，敢挑戰我！」');
                        showMessage('💪 你將面對斯芬克斯的考驗！');
                        this.battle('mini_boss');
                    }
                }
            );
        }
    },

    desert_temple: {
        weight: 5,
        handler() {
            showMessage('🏛️ 你發現了一座被沙漠掩埋的古老神殿...');
            showMessage('神殿的門上刻著三個圖騰：太陽、月亮、星辰。');
            const choices = [
                { id: 'sun_path', label: '選擇太陽之路（力量與火焰）', weight: 33 },
                { id: 'moon_path', label: '選擇月亮之路（智慧與治療）', weight: 33 },
                { id: 'star_path', label: '選擇星辰之路（幸運與寶藏）', weight: 34 }
            ];
            this.showChoicePanel(
                '沙漠神殿',
                choices,
                (choiceId) => {
                    if (choiceId === 'sun_path') {
                        showMessage('☀️ 你推開了太陽之門...');
                        const sunTrial = Math.random();
                        if (sunTrial < 0.4) {
                            showMessage('🔥 神殿認可了你的力量！');
                            showMessage('✨ 太陽神賜予你火焰的祝福！');
                            this.player.fireBless = 8;
                            showMessage('🔥 接下來 8 場戰鬥，攻擊附帶火焰傷害！');
                            this.player.max_stamina += 30;
                            this.player.stamina = Math.min(this.player.max_stamina, this.player.stamina + 30);
                            showMessage('💪 力量湧入身體：最大體力 +30！');
                            const item = generateItem(Math.random() < 0.6 ? 'rare' : 'epic', this.difficulty);
                            if (item.slot === 'weapon') {
                                this.player.inventory.push(item);
                                showMessage(`⚔️ 獲得武器：${this.formatItem(item)}！`);
                            } else {
                                const weapon = generateItem('rare', this.difficulty);
                                weapon.slot = 'weapon';
                                this.player.inventory.push(weapon);
                                showMessage(`⚔️ 獲得武器：${this.formatItem(weapon)}！`);
                            }
                        } else if (sunTrial < 0.7) {
                            showMessage('🔥 試煉之火燃燒著你！');
                            const damage = 30 + Math.floor(Math.random() * 25);
                            this.player.hp = Math.max(1, this.player.hp - damage);
                            showMessage(`受到 ${damage} 點火焰傷害！`);
                            showMessage('但你在痛苦中成長...');
                            this.player.max_hp += 40;
                            showMessage('💓 最大HP永久 +40！');
                            const gold = 100 + Math.floor(Math.random() * 150);
                            this.player.gold += gold;
                            showMessage(`💰 從神殿中獲得 ${gold} 金幣。`);
                        } else {
                            showMessage('🔥 太陽試煉失敗！烈焰守衛現身！');
                            this.battle('elite');
                            return;
                        }
                        this.updateStatus();
                        this.generateDirectionHints();
                    } else if (choiceId === 'moon_path') {
                        showMessage('🌙 你推開了月亮之門...');
                        showMessage('💫 柔和的月光灑在身上，感到無比平靜...');
                        
                        this.player.hp = this.player.max_hp;
                        this.player.mana = this.player.max_mana;
                        this.player.stamina = this.player.max_stamina;
                        showMessage('✨ 完全恢復了HP、魔力和體力！');
                        
                        this.player.max_mana += 25;
                        this.player.max_hp += 35;
                        showMessage('🌟 月神的祝福：最大HP +35，最大魔力 +25！');
                        
                        this.player.potions += 3;
                        showMessage('🧪 獲得 3 瓶高級藥水！');
                        
                        const moonRoll = Math.random();
                        if (moonRoll < 0.5) {
                            const item = generateItem(Math.random() < 0.4 ? 'epic' : 'excellent', this.difficulty);
                            this.player.inventory.push(item);
                            showMessage(`🎁 月神贈予：${this.formatItem(item)}！`);
                        }
                        
                        this.player.shield += 40;
                        showMessage('🛡️ 月光護盾：獲得 40 點護盾！');
                        
                        const xp = 100 + Math.floor(Math.random() * 80);
                        this.addXP(xp);
                        
                        this.updateStatus();
                        this.generateDirectionHints();
                    } else if (choiceId === 'star_path') {
                        showMessage('⭐ 你推開了星辰之門...');
                        const starTrial = Math.random();
                        if (starTrial < 0.35) {
                            showMessage('🌟 滿天星辰為你降下祝福！');
                            showMessage('✨ 這是極大的幸運！');
                            
                            const gold = 300 + Math.floor(Math.random() * 300);
                            this.player.gold += gold;
                            showMessage(`💰💰💰 獲得巨額金幣：${gold}！`);
                            
                            const itemCount = 2 + Math.floor(Math.random() * 2);
                            for (let i = 0; i < itemCount; i++) {
                                const rarity = Math.random() < 0.3 ? 'epic' : (Math.random() < 0.6 ? 'excellent' : 'rare');
                                const item = generateItem(rarity, this.difficulty);
                                this.player.inventory.push(item);
                                showMessage(`⚔️ 獲得：${this.formatItem(item)}！`);
                            }
                            
                            this.player.luck_combat += 3;
                            this.player.luck_gold += 3;
                            showMessage('🍀 幸運大幅提升：戰鬥幸運 +3，金幣幸運 +3！');
                            
                            const xp = 120 + Math.floor(Math.random() * 100);
                            this.addXP(xp);
                        } else if (starTrial < 0.7) {
                            showMessage('✨ 星光照耀著寶物...');
                            const gold = 150 + Math.floor(Math.random() * 200);
                            this.player.gold += gold;
                            showMessage(`💰 獲得 ${gold} 金幣！`);
                            
                            const item = generateItem(Math.random() < 0.5 ? 'excellent' : 'rare', this.difficulty);
                            this.player.inventory.push(item);
                            showMessage(`⚔️ 獲得：${this.formatItem(item)}！`);
                            
                            this.player.luck_gold += 2;
                            showMessage('🍀 金幣幸運 +2！');
                        } else {
                            showMessage('💫 星光黯淡...你的運氣不佳。');
                            showMessage('🌠 但流星劃過，帶來了危險的守護者！');
                            this.battle('elite');
                            return;
                        }
                        this.updateStatus();
                        this.generateDirectionHints();
                    }
                }
            );
        }
    },

    time_rift: {
        weight: 4,
        handler() {
            showMessage('⏳ 空間出現扭曲...你發現了一個時空裂縫！');
            showMessage('💫 透過裂縫，你看到了三個不同的時間線...');
            const choices = [
                { id: 'past', label: '進入過去（重溫歷史）', weight: 33 },
                { id: 'present', label: '穩定現在（強化當下）', weight: 33 },
                { id: 'future', label: '窺探未來（獲得先知）', weight: 34 }
            ];
            this.showChoicePanel(
                '時空裂縫',
                choices,
                (choiceId) => {
                    if (choiceId === 'past') {
                        showMessage('🕰️ 你踏入了過去的時間線...');
                        const pastEvent = Math.random();
                        if (pastEvent < 0.4) {
                            showMessage('📜 你見證了古代法老王的寶庫！');
                            const gold = 250 + Math.floor(Math.random() * 250);
                            this.player.gold += gold;
                            showMessage(`💰 從過去帶回了 ${gold} 金幣！`);
                            
                            showMessage('📚 你學到了古代的戰鬥技巧！');
                            const xp = 150 + Math.floor(Math.random() * 150);
                            this.addXP(xp);
                            
                            const item = generateItem('epic', this.difficulty);
                            this.player.inventory.push(item);
                            showMessage(`⚔️ 獲得古代遺物：${this.formatItem(item)}！`);
                        } else if (pastEvent < 0.75) {
                            showMessage('👥 你遇到了年輕時的自己！');
                            showMessage('💭 對話中獲得了寶貴的人生經驗...');
                            this.player.max_hp += 25;
                            this.player.max_stamina += 20;
                            this.player.max_mana += 20;
                            showMessage('🌟 全能力上限提升：最大HP +25，最大體力/魔力 +20！');
                            
                            const gold = 100 + Math.floor(Math.random() * 150);
                            this.player.gold += gold;
                            showMessage(`💰 年輕的自己給了你 ${gold} 金幣。`);
                        } else {
                            showMessage('⚠️ 時間悖論！你被困在時間迴圈中！');
                            showMessage('😵 混亂的時空能量傷害了你！');
                            const damage = 35 + Math.floor(Math.random() * 30);
                            this.player.hp = Math.max(1, this.player.hp - damage);
                            showMessage(`受到 ${damage} 點時空傷害！`);
                            
                            showMessage('但你從混亂中得到了啟發...');
                            this.player.luck_combat += 2;
                            showMessage('戰鬥幸運 +2！');
                        }
                        this.updateStatus();
                        this.generateDirectionHints();
                    } else if (choiceId === 'present') {
                        showMessage('⚡ 你選擇穩定當下的時間線！');
                        showMessage('🌟 時間之力強化了你的存在！');
                        
                        this.player.hp = Math.min(this.player.max_hp, this.player.hp + 60);
                        this.player.mana = Math.min(this.player.max_mana, this.player.mana + 40);
                        this.player.stamina = Math.min(this.player.max_stamina, this.player.stamina + 40);
                        showMessage('✨ 恢復 60 HP、40 魔力和 40 體力！');
                        
                        this.player.shield += 50;
                        showMessage('🛡️ 時空護盾：獲得 50 點護盾！');
                        
                        this.player.timeBlessing = 5;
                        showMessage('⏰ 時間祝福：接下來 5 場戰鬥，所有屬性提升 20%！');
                        
                        const item = generateItem(Math.random() < 0.5 ? 'excellent' : 'rare', this.difficulty);
                        this.player.inventory.push(item);
                        showMessage(`⚔️ 獲得：${this.formatItem(item)}！`);
                        
                        const xp = 80 + Math.floor(Math.random() * 80);
                        this.addXP(xp);
                        
                        this.updateStatus();
                        this.generateDirectionHints();
                    } else if (choiceId === 'future') {
                        showMessage('🔮 你窺探了未來的時間線...');
                        const futureVision = Math.random();
                        if (futureVision < 0.35) {
                            showMessage('👁️ 你看到了自己輝煌的未來！');
                            showMessage('💫 預知讓你做好了完美準備！');
                            
                            this.player.luck_combat += 4;
                            this.player.luck_gold += 3;
                            showMessage('🍀 大幅幸運提升：戰鬥幸運 +4，金幣幸運 +3！');
                            
                            this.player.futureVision = 10;
                            showMessage('🔮 預知能力：接下來 10 場戰鬥閃避率大幅提升！');
                            
                            const gold = 180 + Math.floor(Math.random() * 220);
                            this.player.gold += gold;
                            showMessage(`💰 從「未來」預支了 ${gold} 金幣！`);
                            
                            const xp = 120 + Math.floor(Math.random() * 100);
                            this.addXP(xp);
                        } else if (futureVision < 0.7) {
                            showMessage('😰 你看到了一些不太樂觀的未來...');
                            showMessage('但知道就是力量！');
                            
                            this.player.luck_combat += 2;
                            showMessage('🍀 戰鬥幸運 +2！');
                            
                            this.player.potions += 2;
                            showMessage('🧪 你準備了 2 瓶藥水以備不時之需。');
                            
                            const gold = 100 + Math.floor(Math.random() * 100);
                            this.player.gold += gold;
                            showMessage(`💰 獲得 ${gold} 金幣。`);
                        } else {
                            showMessage('😱 你看到了可怕的未來！');
                            showMessage('❌ 知道太多反而是負擔...');
                            
                            this.player.max_hp = Math.max(50, this.player.max_hp - 15);
                            showMessage('💔 恐懼削弱了你：最大HP -15！');
                            
                            showMessage('但你下定決心要改變命運！');
                            this.player.determination = 5;
                            showMessage('💪 決心：接下來 5 場戰鬥傷害提升 25%！');
                        }
                        this.updateStatus();
                        this.generateDirectionHints();
                    }
                }
            );
        }
    },

    djinn_encounter: {
        weight: 5,
        handler() {
            showMessage('🧞 沙漠中突然冒出一縷青煙...一個精靈出現了！');
            showMessage('「我可以實現你的一個願望...但這是有代價的。」');
            const choices = [
                { id: 'wish_power', label: '許願獲得力量', weight: 35 },
                { id: 'wish_wealth', label: '許願獲得財富', weight: 35 },
                { id: 'wish_wisdom', label: '許願獲得智慧', weight: 30 }
            ];
            this.showChoicePanel(
                '精靈的願望',
                choices,
                (choiceId) => {
                    if (choiceId === 'wish_power') {
                        showMessage('💪 「你渴望力量...很好！」');
                        const powerRoll = Math.random();
                        if (powerRoll < 0.5) {
                            showMessage('✨ 精靈的魔法充滿了你的身體！');
                            this.player.max_hp += 50;
                            this.player.max_stamina += 35;
                            this.player.hp = this.player.max_hp;
                            this.player.stamina = this.player.max_stamina;
                            showMessage('💓 永久提升：最大HP +50，最大體力 +35！');
                            
                            this.player.djinnPower = 8;
                            showMessage('⚡ 精靈之力：接下來 8 場戰鬥攻擊力提升 30%！');
                            
                            const item = generateItem(Math.random() < 0.4 ? 'epic' : 'excellent', this.difficulty);
                            this.player.inventory.push(item);
                            showMessage(`⚔️ 精靈還贈予了一件寶物：${this.formatItem(item)}！`);
                        } else {
                            showMessage('💸 「代價是...你的部分財富！」');
                            const goldLoss = Math.floor(this.player.gold * 0.3);
                            this.player.gold -= goldLoss;
                            showMessage(`💰 失去了 ${goldLoss} 金幣（30%）！`);
                            
                            this.player.max_hp += 35;
                            this.player.max_stamina += 25;
                            showMessage('💪 但獲得了力量：最大HP +35，最大體力 +25！');
                            
                            this.player.djinnPower = 6;
                            showMessage('⚡ 精靈之力：接下來 6 場戰鬥攻擊力提升 25%！');
                        }
                        this.updateStatus();
                        this.generateDirectionHints();
                    } else if (choiceId === 'wish_wealth') {
                        showMessage('💰 「你渴望財富...貪婪的凡人！」');
                        const wealthRoll = Math.random();
                        if (wealthRoll < 0.5) {
                            showMessage('✨ 金幣從天而降！');
                            const gold = 400 + Math.floor(Math.random() * 400);
                            this.player.gold += gold;
                            showMessage(`💰💰💰 獲得巨額金幣：${gold}！`);
                            
                            this.player.luck_gold += 4;
                            showMessage('🍀 精靈的祝福：金幣幸運 +4！');
                            
                            const itemCount = 2;
                            for (let i = 0; i < itemCount; i++) {
                                const item = generateItem(Math.random() < 0.4 ? 'excellent' : 'rare', this.difficulty);
                                this.player.inventory.push(item);
                                showMessage(`⚔️ 獲得：${this.formatItem(item)}！`);
                            }
                        } else {
                            showMessage('😈 「代價是...你的部分生命力！」');
                            this.player.max_hp = Math.max(60, this.player.max_hp - 20);
                            const damage = 30;
                            this.player.hp = Math.max(1, this.player.hp - damage);
                            showMessage(`💔 最大HP -20，當前HP -${damage}！`);
                            
                            const gold = 300 + Math.floor(Math.random() * 300);
                            this.player.gold += gold;
                            showMessage(`💰 但獲得了大量金幣：${gold}！`);
                            
                            this.player.luck_gold += 3;
                            showMessage('🍀 金幣幸運 +3！');
                        }
                        this.updateStatus();
                        this.generateDirectionHints();
                    } else if (choiceId === 'wish_wisdom') {
                        showMessage('📚 「你渴望智慧...真正的智者！」');
                        showMessage('✨ 精靈對你的選擇感到滿意！');
                        
                        const xp = 200 + Math.floor(Math.random() * 200);
                        this.addXP(xp);
                        showMessage(`📖 獲得大量經驗值：${xp}！`);
                        
                        this.player.max_mana += 40;
                        this.player.mana = this.player.max_mana;
                        showMessage('🔮 智慧之力：最大魔力 +40！');
                        
                        this.player.luck_combat += 3;
                        this.player.luck_gold += 2;
                        showMessage('🍀 全面幸運提升：戰鬥幸運 +3，金幣幸運 +2！');
                        
                        this.player.potions += 3;
                        showMessage('🧪 獲得 3 瓶智慧藥水！');
                        
                        const wisdomRoll = Math.random();
                        if (wisdomRoll < 0.6) {
                            const item = generateItem(Math.random() < 0.3 ? 'epic' : 'excellent', this.difficulty);
                            this.player.inventory.push(item);
                            showMessage(`🎁 精靈額外贈予：${this.formatItem(item)}！`);
                        }
                        
                        showMessage('😊 「智慧的選擇不需要代價...你已經通過了考驗。」');
                        
                        this.updateStatus();
                        this.generateDirectionHints();
                    }
                }
            );
        }
    },

    ancient_library: {
        weight: 4,
        handler() {
            showMessage('📚 你發現了一座被沙漠吞沒的古代圖書館！');
            showMessage('🔍 三個區域保存完好：武術典籍、魔法卷軸、歷史檔案。');
            const choices = [
                { id: 'martial_arts', label: '研讀武術典籍（提升戰鬥能力）', weight: 35 },
                { id: 'magic_scrolls', label: '學習魔法卷軸（提升魔法能力）', weight: 35 },
                { id: 'history_archive', label: '閱讀歷史檔案（獲得寶藏線索）', weight: 30 }
            ];
            this.showChoicePanel(
                '古代圖書館',
                choices,
                (choiceId) => {
                    if (choiceId === 'martial_arts') {
                        showMessage('⚔️ 你專心研讀武術典籍...');
                        this.player.stamina = Math.max(0, this.player.stamina - 20);
                        showMessage('😓 專注學習消耗了 20 體力。');
                        
                        const xp = 120 + Math.floor(Math.random() * 100);
                        this.addXP(xp);
                        showMessage(`📖 從古代武術中獲得啟發：經驗值 +${xp}！`);
                        
                        this.player.max_stamina += 30;
                        this.player.max_hp += 40;
                        showMessage('💪 掌握了強化身體的秘訣：最大HP +40，最大體力 +30！');
                        
                        this.player.martialMastery = 10;
                        showMessage('🥋 武術精通：接下來 10 場戰鬥，物理傷害提升 20%！');
                        
                        if (Math.random() < 0.5) {
                            const weapon = generateItem(Math.random() < 0.4 ? 'epic' : 'excellent', this.difficulty);
                            weapon.slot = 'weapon';
                            this.player.inventory.push(weapon);
                            showMessage(`⚔️ 在典籍中找到了古代武器：${this.formatItem(weapon)}！`);
                        }
                        
                        this.updateStatus();
                        this.generateDirectionHints();
                    } else if (choiceId === 'magic_scrolls') {
                        showMessage('🔮 你仔細研究魔法卷軸...');
                        this.player.mana = Math.max(0, this.player.mana - 25);
                        showMessage('😓 施展魔法消耗了 25 魔力。');
                        
                        const xp = 140 + Math.floor(Math.random() * 120);
                        this.addXP(xp);
                        showMessage(`📜 從古代魔法中獲得頓悟：經驗值 +${xp}！`);
                        
                        this.player.max_mana += 50;
                        this.player.max_hp += 30;
                        showMessage('🔮 魔力大幅提升：最大HP +30，最大魔力 +50！');
                        
                        this.player.arcaneKnowledge = 10;
                        showMessage('✨ 奧術知識：接下來 10 場戰鬥，魔法傷害提升 25%！');
                        
                        this.player.shield += 40;
                        showMessage('🛡️ 學會了魔法護盾：獲得 40 點護盾！');
                        
                        if (Math.random() < 0.6) {
                            const item = generateItem(Math.random() < 0.3 ? 'epic' : 'excellent', this.difficulty);
                            this.player.inventory.push(item);
                            showMessage(`🎁 卷軸中藏著寶物：${this.formatItem(item)}！`);
                        }
                        
                        this.updateStatus();
                        this.generateDirectionHints();
                    } else if (choiceId === 'history_archive') {
                        showMessage('📖 你翻閱著古老的歷史檔案...');
                        showMessage('🗺️ 找到了數個寶藏的位置！');
                        
                        const treasureCount = 2 + Math.floor(Math.random() * 2);
                        let totalGold = 0;
                        for (let i = 0; i < treasureCount; i++) {
                            const gold = 80 + Math.floor(Math.random() * 120);
                            totalGold += gold;
                        }
                        this.player.gold += totalGold;
                        showMessage(`💰 根據線索找到了 ${treasureCount} 處寶藏，共獲得 ${totalGold} 金幣！`);
                        
                        this.player.luck_gold += 3;
                        showMessage('🍀 古代智慧提升了你的運氣：金幣幸運 +3！');
                        
                        const itemCount = 1 + Math.floor(Math.random() * 2);
                        for (let i = 0; i < itemCount; i++) {
                            const rarity = Math.random() < 0.3 ? 'epic' : (Math.random() < 0.6 ? 'excellent' : 'rare');
                            const item = generateItem(rarity, this.difficulty);
                            this.player.inventory.push(item);
                            showMessage(`⚔️ 尋獲古代遺物：${this.formatItem(item)}！`);
                        }
                        
                        const xp = 100 + Math.floor(Math.random() * 80);
                        this.addXP(xp);
                        showMessage(`📚 歷史知識讓你成長：經驗值 +${xp}！`);
                        
                        if (Math.random() < 0.4) {
                            showMessage('🗺️ 你還找到了一張藏寶圖！');
                            this.player.treasureMap = true;
                            showMessage('💎 下次遇到寶藏事件時會有額外獎勵！');
                        }
                        
                        this.updateStatus();
                        this.generateDirectionHints();
                    }
                }
            );
        }
    }
};

// Register with EventRegistry
EventRegistry.register(ChoiceEvents);
