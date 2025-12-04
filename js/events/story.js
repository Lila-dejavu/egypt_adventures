// Story Events - Narrative encounters with gods, strangers, and complex scenarios
// Called with Game instance as `this`
// Dependencies: Utils (from Utils.js)

const StoryEvents = {
    egyptian_god: {
        weight: 4,
        handler() {
            showMessage('遇到古埃及神祇，獲得祝福或詛咒（隨機）。');
            if (Math.random() < 0.5) {
                let g = 50;
                if (this.player.luck_gold > 0) {
                    const finalG = Math.floor(g * (1 + 0.1 * this.player.luck_gold));
                    this.player.gold += finalG;
                    showMessage(`獲得祝福：金幣 +${finalG}（含金幣幸運加成 x${this.player.luck_gold}）。`);
                    this.player.luck_gold = Math.max(0, this.player.luck_gold - 1);
                    showMessage(`金幣幸運 -1（剩餘 ${this.player.luck_gold}）。`);
                } else {
                    this.player.gold += g;
                    showMessage('獲得祝福：金幣 +50');
                }
            } else {
                this.player.hp = Math.max(1, this.player.hp - 15);
                showMessage('受到詛咒：HP -15');
            }
        }
    },

    mysterious_stranger: {
        weight: 4,
        handler() {
            showMessage('👤 一個神秘的陌生人從沙丘後出現...');
            const outcomes = [
                { type: 'gamble', weight: 30 },
                { type: 'gift', weight: 30 },
                { type: 'prophecy', weight: 25 },
                { type: 'curse', weight: 15 }
            ];
            const result = Utils.pickWeightedOutcome(outcomes);

            if (result.type === 'gamble') {
                if (this.player.gold >= 100) {
                    showMessage(t('strangerGamble'));
                    if (Math.random() < 0.5) {
                        this.player.gold -= 100;
                        showMessage(t('strangerGambleLost'));
                    } else {
                        this.player.gold += 100;
                        showMessage(t('strangerGambleWon'));
                    }
                } else {
                    showMessage(t('strangerNoGold'));
                    showMessage(t('strangerLeaves'));
                }
            } else if (result.type === 'gift') {
                const giftType = Math.random();
                if (giftType < 0.4) {
                    const gold = 80 + Math.floor(Math.random() * 120);
                    this.player.gold += gold;
                    showMessage(`${t('strangerGiftGold')} ${gold} ${t('strangerDisappear')}`);
                } else if (giftType < 0.7) {
                    this.player.potions += 2;
                    showMessage(t('strangerGiftPotions'));
                } else {
                    const item = ITEMS[Math.floor(Math.random() * ITEMS.length)];
                    const newItem = Object.assign({}, item, { rarity: 'rare' });
                    this.player.inventory.push(newItem);
                    showMessage(`${t('strangerGiftItem')} ${this.formatItem(newItem)} ${t('strangerSmoke')}`);
                }
            } else if (result.type === 'prophecy') {
                const mapMultiplier = Utils.getMapMultiplier(this.difficulty);
                showMessage(t('strangerProphecy'));
                const prophecies = [
                    { text: t('prophecyCombat'), buff: 'combat' },
                    { text: t('prophecyGold'), buff: 'gold' },
                    { text: t('prophecyDefense'), buff: 'defense' }
                ];
                const prophecy = prophecies[Math.floor(Math.random() * prophecies.length)];
                showMessage(prophecy.text);

                if (prophecy.buff === 'combat') {
                    const luckValue = Math.floor(3 * mapMultiplier);
                    this.player.luck_combat += luckValue;
                    showMessage(`${t('combatLuck')} +${luckValue}`);
                } else if (prophecy.buff === 'gold') {
                    const luckValue = Math.floor(3 * mapMultiplier);
                    this.player.luck_gold += luckValue;
                    showMessage(`${t('goldLuck')} +${luckValue}`);
                } else if (prophecy.buff === 'defense') {
                    const shieldValue = Math.floor(30 * mapMultiplier);
                    this.player.shield += shieldValue;
                    showMessage(`${t('gainShield')} +${shieldValue}`);
                }
            } else if (result.type === 'curse') {
                showMessage(t('strangerCurse'));
                const curseType = Math.random();
                if (curseType < 0.5) {
                    const goldLoss = Math.min(this.player.gold, 50 + Math.floor(Math.random() * 100));
                    this.player.gold -= goldLoss;
                    showMessage(`${t('curseGoldLoss')} -${goldLoss}！`);
                } else {
                    const damage = 20 + Math.floor(Math.random() * 20);
                    this.player.hp = Math.max(1, this.player.hp - damage);
                    showMessage(`${t('curseHpLoss')} -${damage} HP！`);
                }
            }
        }
    },

    lost_merchant: {
        weight: 4,
        handler() {
            showMessage('🐪 你遇到一支迷失的商隊！');
            showMessage('商隊領隊焦急地說：「我們在沙漠中迷路了，你能幫助我們找到出路嗎？」');

            const outcomes = [
                { type: 'help', weight: 60 },
                { type: 'trade', weight: 40 }
            ];
            const result = Utils.pickWeightedOutcome(outcomes);

            if (result.type === 'help') {
                showMessage('📍 你憑藉經驗，為商隊指出正確的方向！');
                showMessage('💡 提示：在沙漠中，向前方通常能找到更多機會...');

                const goldReward = Math.floor(150 * this.difficulty * (1 + Math.random() * 0.5));
                this.player.gold += goldReward;
                this.player.compassEffect = 3;

                showMessage(`✨ 商隊感激不盡！獲得 ${goldReward} 金幣`);
                showMessage('🧭 獲得「沙漠指南針」效果：接下來3次移動將顯示更詳細的方向資訊！');
            } else {
                showMessage('🛒 商隊願意與你進行特殊交易！');
                showMessage('💰 他們以優惠價格出售稀有物品...');

                const rareItem = generateItem('rare', this.difficulty);
                const price = Math.floor(120 * this.difficulty);

                showMessage(`商隊提供：${rareItem.name}（稀有品質）- 只需 ${price} 金幣！`);

                if (this.player.gold >= price) {
                    this.player.gold -= price;
                    this.player.inventory.push(rareItem);
                    showMessage(`✅ 購買成功！獲得 ${rareItem.name}`);
                } else {
                    showMessage('❌ 金幣不足，錯過了這次交易機會...');
                }
            }
        }
    },

    cursed_shrine: {
        weight: 4,
        handler() {
            showMessage('⚠️ 你發現一座散發著不祥氣息的神殿！');
            showMessage('神殿內部傳來陣陣低語...這裡可能藏著寶藏，也可能充滿危險。');

            const outcomes = [
                { type: 'treasure', weight: 35 },
                { type: 'battle', weight: 30 },
                { type: 'curse', weight: 20 },
                { type: 'blessing', weight: 15 }
            ];
            const result = Utils.pickWeightedOutcome(outcomes);

            if (result.type === 'treasure') {
                showMessage('💎 你小心翼翼地探索神殿，找到了一個寶箱！');
                const goldReward = Math.floor(200 * this.difficulty * (1 + Math.random()));
                this.player.gold += goldReward;

                if (Math.random() < 0.7) {
                    const quality = Math.random() < 0.3 ? 'epic' : 'rare';
                    const item = generateItem(quality, this.difficulty);
                    this.player.inventory.push(item);
                    showMessage(`✨ 獲得 ${goldReward} 金幣 和 ${item.name}（${item.rarity}）！`);
                } else {
                    showMessage(`✨ 獲得 ${goldReward} 金幣！`);
                }
            } else if (result.type === 'battle') {
                showMessage('⚔️ 神殿守護者甦醒了！準備戰鬥！');
                showMessage('💀 這是一個強大的精英敵人...');
                this.battle('elite');
            } else if (result.type === 'curse') {
                showMessage('🌑 你觸發了神殿的詛咒！');
                const curseEffects = [
                    { type: 'hp', desc: '生命力流失' },
                    { type: 'stamina', desc: '體力虛弱' },
                    { type: 'gold', desc: '財富流失' }
                ];
                const curse = curseEffects[Math.floor(Math.random() * curseEffects.length)];

                if (curse.type === 'hp') {
                    const hpLoss = Math.floor(this.player.max_hp * 0.2);
                    this.player.hp = Math.max(1, this.player.hp - hpLoss);
                    showMessage(`⚠️ ${curse.desc}！HP -${hpLoss}`);
                } else if (curse.type === 'stamina') {
                    const staminaLoss = Math.floor(this.player.max_stamina * 0.3);
                    this.player.stamina = Math.max(0, this.player.stamina - staminaLoss);
                    showMessage(`⚠️ ${curse.desc}！體力 -${staminaLoss}`);
                } else {
                    const goldLoss = Math.floor(this.player.gold * 0.15);
                    this.player.gold = Math.max(0, this.player.gold - goldLoss);
                    showMessage(`⚠️ ${curse.desc}！失去 ${goldLoss} 金幣`);
                }
                showMessage('💡 建議：前往綠洲或休息站恢復狀態...');
            } else {
                showMessage('✨ 神殿中傳來神秘的光芒...');
                showMessage('🌟 這是古老神祇的祝福！');

                const blessings = [
                    { type: 'stats', desc: '力量提升' },
                    { type: 'luck', desc: '幸運加持' },
                    { type: 'heal', desc: '完全治癒' }
                ];
                const blessing = blessings[Math.floor(Math.random() * blessings.length)];

                if (blessing.type === 'stats') {
                    this.player.base_atk += 3;
                    this.player.base_def += 2;
                    showMessage(`⚡ ${blessing.desc}！攻擊力 +3，防禦力 +2`);
                } else if (blessing.type === 'luck') {
                    this.player.luck_combat += 2;
                    this.player.luck_gold += 2;
                    showMessage(`🍀 ${blessing.desc}！戰鬥幸運 +2，金幣幸運 +2`);
                } else {
                    this.player.hp = this.player.max_hp;
                    this.player.stamina = this.player.max_stamina;
                    const hpBonus = Math.floor(30 * Utils.getMapMultiplier(this.difficulty));
                    this.player.max_hp += hpBonus;
                    this.player.hp = this.player.max_hp;
                    showMessage(`💚 ${blessing.desc}！HP和體力完全恢復，最大HP +${hpBonus}`);
                }
            }
        }
    },

    bandit_ambush: {
        weight: 6,
        handler() {
            showMessage('⚔️ 一群沙漠強盜突然出現，包圍了你！');
            showMessage('💰 強盜頭目：「識相的話，留下一半金幣，否則別想活著離開！」');

            const hasGold = this.player.gold >= 100 * this.difficulty;

            if (!hasGold) {
                showMessage('強盜們發現你身無分文，憤怒地發動攻擊！');
                this.battle('elite');
                return;
            }

            const outcomes = [
                { type: 'negotiate', weight: 25 },
                { type: 'fight', weight: 40 },
                { type: 'escape', weight: 20 },
                { type: 'intimidate', weight: 15 }
            ];
            const result = Utils.pickWeightedOutcome(outcomes);

            if (result.type === 'negotiate') {
                const payment = Math.floor(this.player.gold * 0.4);
                this.player.gold -= payment;
                showMessage(`💰 你決定支付 ${payment} 金幣作為「通行費」...`);
                showMessage('🤝 強盜們拿到錢後滿意地離開了。');
                showMessage('📍 臨走前，強盜頭目指向一個方向：「那邊有個好地方，算是給你的情報。」');
                this.player.banditInfo = 2;
                showMessage('🗺️ 獲得「強盜情報」：接下來2次移動有更高機率遇到好事件！');
            } else if (result.type === 'fight') {
                showMessage('⚔️ 你決定與強盜戰鬥！');
                showMessage('💡 戰鬥提示：擊敗強盜可獲得他們搶奪的財寶！');
                this.banditsLoot = Math.floor(300 * this.difficulty * (1 + Math.random()));
                this.battle('elite');
            } else if (result.type === 'escape') {
                showMessage('💨 你趁強盜不注意，成功逃脫了！');
                const goldLoss = Math.floor(this.player.gold * 0.15);
                this.player.gold -= goldLoss;
                showMessage(`⚠️ 逃跑時掉落了 ${goldLoss} 金幣...`);
                showMessage('💡 提示：繼續向前方探索，尋找安全的地方。');
            } else {
                showMessage('😎 你展示了你的實力和裝備...');
                showMessage('💪 強盜們被你的氣勢震懾，不敢輕舉妄動！');

                if (Math.random() < 0.6) {
                    showMessage('🏃 強盜們嚇得落荒而逃！');
                    const foundGold = Math.floor(150 * this.difficulty * (1 + Math.random() * 0.5));
                    this.player.gold += foundGold;
                    showMessage(`✨ 你在強盜營地找到 ${foundGold} 金幣！`);
                } else {
                    showMessage('⚔️ 強盜頭目不服，向你發起挑戰！');
                    this.battle('elite');
                }
            }
        }
    },

    ancient_puzzle: {
        weight: 5,
        handler() {
            showMessage('🧩 你發現了一座古老的石碑，上面刻滿了象形文字...');
            showMessage('這似乎是某種謎題，破解它可能會獲得獎勵。');

            const puzzles = [
                {
                    question: '「太陽從何處升起？」',
                    answers: ['東方', '西方', '南方', '北方'],
                    correct: 0,
                    hint: '（前方通常代表東方，是太陽升起的方向）'
                },
                {
                    question: '「三個神祇守護金字塔，何者掌管冥界？」',
                    answers: ['拉（Ra）', '阿努比斯（Anubis）', '荷魯斯（Horus）', '伊西斯（Isis）'],
                    correct: 1,
                    hint: '（阿努比斯是死神和木乃伊之神）'
                },
                {
                    question: '「沙漠中最珍貴的資源是什麼？」',
                    answers: ['黃金', '寶石', '水源', '武器'],
                    correct: 2,
                    hint: '（綠洲是沙漠旅者的救命之地）'
                }
            ];

            const puzzle = puzzles[Math.floor(Math.random() * puzzles.length)];
            showMessage(`📜 石碑上的問題：${puzzle.question}`);
            showMessage(`💡 提示：${puzzle.hint}`);

            const luckBonus = this.player.luck_gold * 0.05;
            const successChance = 0.6 + luckBonus;
            const success = Math.random() < successChance;

            if (success) {
                showMessage(`✅ 你憑藉智慧破解了謎題！答案是：${puzzle.answers[puzzle.correct]}`);
                showMessage('🌟 石碑發出金色光芒，地面出現一個寶箱！');

                const goldReward = Math.floor(250 * this.difficulty * (1 + Math.random()));
                this.player.gold += goldReward;

                const quality = Math.random() < 0.4 ? 'epic' : 'excellent';
                const item = generateItem(quality, this.difficulty);
                this.player.inventory.push(item);

                this.player.luck_combat += 1;
                this.player.luck_gold += 1;

                showMessage(`🎁 獲得：${goldReward} 金幣、${item.name}（${item.rarity}）`);
                showMessage('📚 智慧提升：戰鬥幸運 +1，金幣幸運 +1');
                showMessage('💡 解謎心得：保持探索精神，向不同方向前進會有不同發現！');
            } else {
                showMessage('❌ 謎題太過複雜，你無法解開...');
                showMessage('⚠️ 石碑發出紅光，觸發了防禦機制！');

                const trapDamage = Math.floor(20 + Math.random() * 20);
                this.player.hp = Math.max(1, this.player.hp - trapDamage);

                showMessage(`💥 陷阱造成 ${trapDamage} 點傷害！`);
                showMessage('💡 建議：提升幸運值可以增加解謎成功率。');
            }
        }
    },

    desert_oasis: {
        weight: 5,
        handler() {
            showMessage('🌴 你發現了一片隱藏的沙漠綠洲！');
            showMessage('清澈的泉水、茂密的棕櫚樹...這是沙漠中的奇蹟！');

            const outcomes = [
                { type: 'full_rest', weight: 40 },
                { type: 'explore', weight: 35 },
                { type: 'meditate', weight: 25 }
            ];
            const result = Utils.pickWeightedOutcome(outcomes);

            if (result.type === 'full_rest') {
                showMessage('😌 你決定在綠洲充分休息...');

                this.player.hp = this.player.max_hp;
                this.player.stamina = this.player.max_stamina;

                const hpBonus = Math.floor(25 * Utils.getMapMultiplier(this.difficulty));
                const staminaBonus = Math.floor(15 * Utils.getMapMultiplier(this.difficulty));
                this.player.max_hp += hpBonus;
                this.player.max_stamina += staminaBonus;
                this.player.hp = this.player.max_hp;
                this.player.stamina = this.player.max_stamina;

                this.player.oasisBlessing = 5;

                showMessage('💚 完全恢復！HP和體力全滿！');
                showMessage(`⬆️ 最大HP +${hpBonus}，最大體力 +${staminaBonus}`);
                showMessage('✨ 獲得「綠洲祝福」：接下來5次移動，每次自動恢復少量HP和體力！');
                showMessage('💡 探索提示：休息好後，可以大膽探索更危險的區域！');
            } else if (result.type === 'explore') {
                showMessage('🔍 你決定探索綠洲周圍...');
                showMessage('🌟 在棕櫚樹下，你發現了一個隱藏的寶藏！');

                const hpRecover = Math.floor(this.player.max_hp * 0.6);
                const staminaRecover = Math.floor(this.player.max_stamina * 0.6);
                this.player.hp = Math.min(this.player.max_hp, this.player.hp + hpRecover);
                this.player.stamina = Math.min(this.player.max_stamina, this.player.stamina + staminaRecover);

                const goldReward = Math.floor(200 * this.difficulty * (1 + Math.random()));
                this.player.gold += goldReward;

                const quality = Math.random() < 0.3 ? 'epic' : 'excellent';
                const item = generateItem(quality, this.difficulty);
                this.player.inventory.push(item);

                showMessage(`💚 恢復 ${hpRecover} HP 和 ${staminaRecover} 體力`);
                showMessage(`🎁 獲得：${goldReward} 金幣、${item.name}（${item.rarity}）`);
                showMessage('💡 綠洲守護者的話：「勇敢的冒險者，繼續向前吧！」');
            } else {
                showMessage('🧘 你在綠洲邊緣盤坐冥想...');
                showMessage('💫 沙漠的寧靜讓你的心靈得到昇華...');

                const hpRecover = Math.floor(this.player.max_hp * 0.5);
                const staminaRecover = Math.floor(this.player.max_stamina * 0.5);
                this.player.hp = Math.min(this.player.max_hp, this.player.hp + hpRecover);
                this.player.stamina = Math.min(this.player.max_stamina, this.player.stamina + staminaRecover);

                this.player.base_atk += 4;
                this.player.base_def += 3;
                this.player.luck_combat += 2;

                showMessage(`💚 恢復 ${hpRecover} HP 和 ${staminaRecover} 體力`);
                showMessage('⚡ 冥想收穫：攻擊力 +4，防禦力 +3，戰鬥幸運 +2');
                showMessage('🌟 你感受到內在力量的成長！');
                showMessage('💡 智者的教誨：「力量來自內心，而非外物。」');
            }

            showMessage('🗺️ 探索建議：綠洲周圍可能還有其他秘密，多探索不同方向！');
        }
    },

    cursed_tomb: {
        weight: 5,
        handler() {
            showMessage('⚰️ 你發現了一座被詛咒的古墓...');
            showMessage('💀 墓碑上寫著：「財富與死亡共存於此」');
            const choices = [
                { id: 'enter_tomb', label: '勇敢進入古墓', weight: 40 },
                { id: 'perform_ritual', label: '進行驅邪儀式（消耗藥水）', weight: 30 },
                { id: 'leave_offering', label: '留下供品後離開（50金幣）', weight: 30 }
            ];
            this.showChoicePanel(
                '被詛咒的古墓',
                choices,
                (choiceId) => {
                    if (choiceId === 'enter_tomb') {
                        showMessage('🚪 你推開沉重的石門...');
                        const tombRoll = Math.random();
                        if (tombRoll < 0.3) {
                            showMessage('💎 你找到了法老王的寶藏室！');
                            const gold = 300 + Math.floor(Math.random() * 300);
                            this.player.gold += gold;
                            showMessage(`💰 獲得巨額金幣：${gold}！`);
                            
                            const itemCount = 2 + Math.floor(Math.random() * 2);
                            for (let i = 0; i < itemCount; i++) {
                                const rarity = Math.random() < 0.4 ? 'epic' : 'excellent';
                                const item = generateItem(rarity, this.difficulty);
                                this.player.inventory.push(item);
                                showMessage(`⚔️ 獲得：${this.formatItem(item)}！`);
                            }
                            showMessage('✨ 你成功避開了所有陷阱！');
                        } else if (tombRoll < 0.6) {
                            showMessage('⚠️ 你觸發了古墓機關！');
                            const damage = 40 + Math.floor(Math.random() * 30);
                            this.player.hp = Math.max(1, this.player.hp - damage);
                            showMessage(`受到 ${damage} 點傷害！`);
                            
                            showMessage('但你還是找到了一些寶物...');
                            const gold = 150 + Math.floor(Math.random() * 200);
                            this.player.gold += gold;
                            showMessage(`💰 獲得 ${gold} 金幣。`);
                            
                            const item = generateItem('rare', this.difficulty);
                            this.player.inventory.push(item);
                            showMessage(`⚔️ 獲得：${this.formatItem(item)}`);
                        } else {
                            showMessage('👻 古墓守衛被喚醒了！');
                            showMessage('💀 不死生物向你襲來！');
                            this.battle('elite');
                            return;
                        }
                        this.updateStatus();
                        this.generateDirectionHints();
                    } else if (choiceId === 'perform_ritual') {
                        if (this.player.potions > 0) {
                            this.player.potions--;
                            showMessage('🕯️ 你使用藥水進行驅邪儀式...');
                            showMessage('✨ 儀式成功！詛咒被淨化了！');
                            
                            this.player.hp = Math.min(this.player.max_hp, this.player.hp + 50);
                            showMessage('💚 聖光治癒了你：HP +50！');
                            
                            showMessage('🚪 你安全地進入了古墓...');
                            const gold = 200 + Math.floor(Math.random() * 250);
                            this.player.gold += gold;
                            showMessage(`💰 獲得 ${gold} 金幣！`);
                            
                            const item = generateItem(Math.random() < 0.5 ? 'epic' : 'excellent', this.difficulty);
                            this.player.inventory.push(item);
                            showMessage(`⚔️ 獲得淨化後的聖物：${this.formatItem(item)}！`);
                            
                            this.player.holyBlessing = 5;
                            showMessage('✨ 聖光祝福：接下來 5 場戰鬥對不死生物傷害加倍！');
                        } else {
                            showMessage('💸 你沒有藥水進行儀式...');
                            showMessage('😰 只能硬著頭皮進入古墓！');
                            const damage = 30 + Math.floor(Math.random() * 25);
                            this.player.hp = Math.max(1, this.player.hp - damage);
                            showMessage(`受到詛咒傷害 ${damage} 點！`);
                            
                            const gold = 100 + Math.floor(Math.random() * 150);
                            this.player.gold += gold;
                            showMessage(`💰 勉強找到 ${gold} 金幣。`);
                        }
                        this.updateStatus();
                        this.generateDirectionHints();
                    } else if (choiceId === 'leave_offering') {
                        if (this.player.gold >= 50) {
                            this.player.gold -= 50;
                            showMessage('🙏 你留下供品以示敬意...');
                            showMessage('✨ 亡靈接受了你的供奉！');
                            
                            this.player.spiritProtection = 8;
                            showMessage('👻 亡靈的庇護：接下來 8 場戰鬥防禦力提升 20%！');
                            
                            const xp = 80 + Math.floor(Math.random() * 80);
                            this.addXP(xp);
                            showMessage(`📖 從墓碑銘文中學到了知識：經驗值 +${xp}！`);
                            
                            if (Math.random() < 0.5) {
                                const item = generateItem('rare', this.difficulty);
                                this.player.inventory.push(item);
                                showMessage(`🎁 亡靈感激地回贈：${this.formatItem(item)}`);
                            }
                        } else {
                            showMessage('💸 你沒有足夠的金幣...');
                            showMessage('😔 你只能默默離開。');
                            const xp = 30;
                            this.addXP(xp);
                            showMessage('至少獲得了一些經驗。');
                        }
                        this.updateStatus();
                        this.generateDirectionHints();
                    }
                }
            );
        }
    },

    mystical_well: {
        weight: 4,
        handler() {
            showMessage('🌊 你發現了一口神秘的古井...');
            showMessage('💫 井水泛著奇異的光芒...');
            const choices = [
                { id: 'drink_water', label: '直接飲用井水', weight: 35 },
                { id: 'throw_coin', label: '投入金幣許願（100金幣）', weight: 30 },
                { id: 'investigate', label: '仔細調查古井', weight: 35 }
            ];
            this.showChoicePanel(
                '神秘古井',
                choices,
                (choiceId) => {
                    if (choiceId === 'drink_water') {
                        showMessage('💧 你捧起井水飲用...');
                        const waterEffect = Math.random();
                        if (waterEffect < 0.35) {
                            showMessage('✨ 這是生命之泉！');
                            this.player.hp = this.player.max_hp;
                            this.player.mana = this.player.max_mana;
                            this.player.stamina = this.player.max_stamina;
                            showMessage('💚 完全恢復了所有HP、魔力和體力！');
                            
                            this.player.max_hp += 25;
                            this.player.max_mana += 15;
                            this.player.max_stamina += 15;
                            showMessage('🌟 永久能力提升：最大HP +25，最大MP/體力 +15！');
                            
                            this.player.wellBlessing = 10;
                            showMessage('💧 生命之泉祝福：接下來 10 場戰鬥每回合恢復 3% HP！');
                        } else if (waterEffect < 0.65) {
                            showMessage('🔮 這是魔力之泉！');
                            this.player.mana = this.player.max_mana;
                            this.player.max_mana += 30;
                            showMessage('✨ 魔力完全恢復並永久提升 30 點！');
                            
                            this.player.magicAmplify = 8;
                            showMessage('🌟 魔法增幅：接下來 8 場戰鬥魔法效果提升 30%！');
                            
                            this.player.shield += 40;
                            showMessage('🛡️ 魔力護盾：獲得 40 點護盾！');
                        } else {
                            showMessage('😰 這是詛咒之泉！');
                            const damage = 35 + Math.floor(Math.random() * 30);
                            this.player.hp = Math.max(1, this.player.hp - damage);
                            this.player.max_hp = Math.max(60, this.player.max_hp - 15);
                            showMessage(`💔 受到 ${damage} 點傷害，最大HP -15！`);
                            
                            showMessage('但你從痛苦中獲得了力量...');
                            this.player.base_atk += 8;
                            showMessage('⚔️ 攻擊力永久 +8！');
                        }
                        this.updateStatus();
                        this.generateDirectionHints();
                    } else if (choiceId === 'throw_coin') {
                        if (this.player.gold >= 100) {
                            this.player.gold -= 100;
                            showMessage('🪙 你投入金幣並許下心願...');
                            showMessage('✨ 古井回應了你的願望！');
                            
                            const wishResult = Math.random();
                            if (wishResult < 0.4) {
                                const goldReturn = 100 * (3 + Math.floor(Math.random() * 3));
                                this.player.gold += goldReturn;
                                showMessage(`💰 金幣如泉水般湧出：獲得 ${goldReturn} 金幣！`);
                                
                                this.player.luck_gold += 3;
                                showMessage('🍀 財運大增：金幣幸運 +3！');
                            } else if (wishResult < 0.7) {
                                showMessage('⚔️ 古井認可了你的誠意！');
                                const item = generateItem(Math.random() < 0.4 ? 'epic' : 'excellent', this.difficulty);
                                this.player.inventory.push(item);
                                showMessage(`從井底浮現了寶物：${this.formatItem(item)}！`);
                                
                                this.player.potions += 2;
                                showMessage('🧪 還獲得了 2 瓶神秘藥水！');
                            } else {
                                showMessage('🌟 古井賜予了全面的祝福！');
                                this.player.luck_combat += 2;
                                this.player.luck_gold += 2;
                                showMessage('🍀 幸運大幅提升：戰鬥/金幣幸運各 +2！');
                                
                                this.player.hp = Math.min(this.player.max_hp, this.player.hp + 60);
                                this.player.shield += 30;
                                showMessage('💚 恢復 60 HP 並獲得 30 點護盾！');
                            }
                        } else {
                            showMessage('💸 你沒有足夠的金幣...');
                            showMessage('但你虔誠的心意打動了古井。');
                            this.player.luck_gold += 1;
                            showMessage('🍀 金幣幸運 +1');
                        }
                        this.updateStatus();
                        this.generateDirectionHints();
                    } else if (choiceId === 'investigate') {
                        showMessage('🔍 你仔細調查古井的結構...');
                        const investigateRoll = Math.random();
                        if (investigateRoll < 0.4) {
                            showMessage('💡 你發現了古井的秘密機關！');
                            showMessage('🚪 一個隱藏的密室打開了！');
                            
                            const gold = 250 + Math.floor(Math.random() * 300);
                            this.player.gold += gold;
                            showMessage(`💰 密室中藏著大量金幣：${gold}！`);
                            
                            const itemCount = 2;
                            for (let i = 0; i < itemCount; i++) {
                                const item = generateItem(Math.random() < 0.3 ? 'epic' : 'excellent', this.difficulty);
                                this.player.inventory.push(item);
                                showMessage(`⚔️ 發現古代寶物：${this.formatItem(item)}！`);
                            }
                            
                            const xp = 120 + Math.floor(Math.random() * 100);
                            this.addXP(xp);
                            showMessage('📚 從密室銘文中學到了古代智慧！');
                        } else if (investigateRoll < 0.75) {
                            showMessage('📜 你在井邊發現了古老的卷軸...');
                            const xp = 100 + Math.floor(Math.random() * 100);
                            this.addXP(xp);
                            showMessage(`📖 從卷軸中學習：經驗值 +${xp}！`);
                            
                            this.player.ancientKnowledge = 7;
                            showMessage('🧙 古代知識：接下來 7 場戰鬥所有技能效果提升 15%！');
                            
                            const gold = 150 + Math.floor(Math.random() * 150);
                            this.player.gold += gold;
                            showMessage(`💰 卷軸中夾著 ${gold} 金幣。`);
                        } else {
                            showMessage('⚠️ 調查時驚動了井底的守護者！');
                            showMessage('🐉 水元素守衛現身！');
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

    traveling_merchant: {
        weight: 5,
        handler() {
            showMessage('🐪 一支商隊經過，商人向你招手...');
            showMessage('「旅人，想做筆交易嗎？」');
            const choices = [
                { id: 'buy_equipment', label: '購買裝備（價格隨機）', weight: 35 },
                { id: 'sell_items', label: '出售背包物品（高價收購）', weight: 30 },
                { id: 'trade_info', label: '用金幣換情報（150金幣）', weight: 35 }
            ];
            this.showChoicePanel(
                '旅行商人',
                choices,
                (choiceId) => {
                    if (choiceId === 'buy_equipment') {
                        showMessage('🛒 商人展示了他的商品...');
                        const itemQuality = Math.random();
                        let rarity, price;
                        if (itemQuality < 0.15) {
                            rarity = 'legendary';
                            price = 800 + Math.floor(Math.random() * 400);
                        } else if (itemQuality < 0.35) {
                            rarity = 'epic';
                            price = 400 + Math.floor(Math.random() * 300);
                        } else if (itemQuality < 0.65) {
                            rarity = 'excellent';
                            price = 200 + Math.floor(Math.random() * 200);
                        } else {
                            rarity = 'rare';
                            price = 100 + Math.floor(Math.random() * 150);
                        }
                        
                        const item = generateItem(rarity, this.difficulty);
                        showMessage(`⚔️ 商品：${this.formatItem(item)}`);
                        showMessage(`💰 價格：${price} 金幣`);
                        
                        if (this.player.gold >= price) {
                            showMessage('💸 你支付了金幣購買裝備。');
                            this.player.gold -= price;
                            this.player.inventory.push(item);
                            showMessage('✨ 交易完成！');
                            
                            if (Math.random() < 0.3) {
                                showMessage('🎁 商人還額外贈送了一瓶藥水！');
                                this.player.potions += 1;
                            }
                        } else {
                            showMessage('💸 你的金幣不足...');
                            showMessage('😔 商人失望地離開了。');
                            showMessage('不過他給了你一些旅行建議...');
                            this.player.luck_gold += 1;
                            showMessage('🍀 金幣幸運 +1');
                        }
                        this.updateStatus();
                        this.generateDirectionHints();
                    } else if (choiceId === 'sell_items') {
                        if (this.player.inventory.length > 0) {
                            showMessage('💼 商人檢查你的背包...');
                            const sellCount = Math.min(3, this.player.inventory.length);
                            let totalGold = 0;
                            
                            for (let i = 0; i < sellCount; i++) {
                                const item = this.player.inventory.shift();
                                const basePrice = 50;
                                const rarityMultiplier = item.rarity === 'legendary' ? 8 : 
                                                       item.rarity === 'epic' ? 5 :
                                                       item.rarity === 'excellent' ? 3 :
                                                       item.rarity === 'rare' ? 2 : 1;
                                const price = basePrice * rarityMultiplier * (1 + Math.random());
                                totalGold += Math.floor(price);
                                showMessage(`出售：${this.formatItem(item)} → ${Math.floor(price)} 金幣`);
                            }
                            
                            this.player.gold += totalGold;
                            showMessage(`💰 總計獲得：${totalGold} 金幣！`);
                            showMessage('「這是個公平的交易！」');
                            
                            if (Math.random() < 0.4) {
                                const bonus = Math.floor(totalGold * 0.2);
                                this.player.gold += bonus;
                                showMessage(`🎁 商人欣賞你的物品，額外支付 ${bonus} 金幣！`);
                            }
                        } else {
                            showMessage('💼 你的背包是空的...');
                            showMessage('商人笑了笑：「沒關係，這個給你。」');
                            this.player.potions += 1;
                            showMessage('🧪 獲得 1 瓶藥水！');
                        }
                        this.updateStatus();
                        this.generateDirectionHints();
                    } else if (choiceId === 'trade_info') {
                        if (this.player.gold >= 150) {
                            this.player.gold -= 150;
                            showMessage('💰 你支付了 150 金幣。');
                            showMessage('🗺️ 商人分享了寶貴的情報...');
                            
                            const infoType = Math.random();
                            if (infoType < 0.4) {
                                showMessage('「前方有一處隱藏的寶藏！」');
                                this.player.treasureHint = 5;
                                showMessage('🗺️ 尋寶提示：接下來 5 步內遇到寶箱機率大增！');
                                
                                this.player.luck_gold += 2;
                                showMessage('🍀 金幣幸運 +2！');
                            } else if (infoType < 0.7) {
                                showMessage('「我聽說附近有強大的敵人出沒...」');
                                showMessage('「不過我可以教你一些戰鬥技巧。」');
                                
                                const xp = 120 + Math.floor(Math.random() * 100);
                                this.addXP(xp);
                                showMessage(`📖 從商人的經驗中學習：經驗值 +${xp}！`);
                                
                                this.player.luck_combat += 2;
                                showMessage('🍀 戰鬥幸運 +2！');
                                
                                this.player.combatTips = 6;
                                showMessage('⚔️ 戰鬥技巧：接下來 6 場戰鬥暴擊率提升！');
                            } else {
                                showMessage('「這張地圖標記了安全路線和危險區域。」');
                                this.player.safetyMap = 8;
                                showMessage('🗺️ 安全地圖：接下來 8 步內降低遇敵機率！');
                                
                                this.player.hp = Math.min(this.player.max_hp, this.player.hp + 40);
                                this.player.potions += 2;
                                showMessage('💚 商人還給了你補給：恢復 40 HP，獲得 2 瓶藥水！');
                            }
                        } else {
                            showMessage('💸 你沒有足夠的金幣...');
                            showMessage('商人嘆了口氣：「那我免費告訴你一點。」');
                            showMessage('「在沙漠中，水和運氣同樣重要。」');
                            this.player.luck_gold += 1;
                            showMessage('🍀 金幣幸運 +1');
                        }
                        this.updateStatus();
                        this.generateDirectionHints();
                    }
                }
            );
        }
    },

    ancient_battlefield: {
        weight: 4,
        handler() {
            showMessage('⚔️ 你來到了一片古代戰場遺跡...');
            showMessage('💀 地上散落著無數武器和盔甲的碎片...');
            const choices = [
                { id: 'scavenge_weapons', label: '搜尋可用的武器', weight: 35 },
                { id: 'honor_fallen', label: '祭奠戰死的英靈', weight: 30 },
                { id: 'study_tactics', label: '研究戰場布局', weight: 35 }
            ];
            this.showChoicePanel(
                '古代戰場',
                choices,
                (choiceId) => {
                    if (choiceId === 'scavenge_weapons') {
                        showMessage('🔍 你在戰場遺跡中仔細搜尋...');
                        const findRoll = Math.random();
                        if (findRoll < 0.4) {
                            showMessage('⚔️ 你找到了一件保存完好的傳奇武器！');
                            const weapon = generateItem(Math.random() < 0.3 ? 'legendary' : 'epic', this.difficulty);
                            weapon.slot = 'weapon';
                            this.player.inventory.push(weapon);
                            showMessage(`獲得：${this.formatItem(weapon)}！`);
                            
                            showMessage('✨ 這把武器似乎蘊含著戰士的靈魂...');
                            this.player.warriorSpirit = 8;
                            showMessage('👻 戰士之魂：接下來 8 場戰鬥物理攻擊力提升 25%！');
                        } else if (findRoll < 0.75) {
                            showMessage('🛡️ 你找到了一些還能使用的裝備...');
                            const itemCount = 1 + Math.floor(Math.random() * 2);
                            for (let i = 0; i < itemCount; i++) {
                                const item = generateItem(Math.random() < 0.5 ? 'rare' : 'excellent', this.difficulty);
                                this.player.inventory.push(item);
                                showMessage(`獲得：${this.formatItem(item)}`);
                            }
                            
                            const gold = 100 + Math.floor(Math.random() * 150);
                            this.player.gold += gold;
                            showMessage(`💰 還找到了 ${gold} 金幣。`);
                        } else {
                            showMessage('⚠️ 你觸動了戰場上殘留的魔法！');
                            showMessage('👻 不死戰士被喚醒了！');
                            this.battle('elite');
                            return;
                        }
                        this.updateStatus();
                        this.generateDirectionHints();
                    } else if (choiceId === 'honor_fallen') {
                        showMessage('🙏 你為陣亡的戰士默哀...');
                        showMessage('✨ 英靈們感受到了你的敬意...');
                        
                        this.player.hp = Math.min(this.player.max_hp, this.player.hp + 50);
                        this.player.shield += 40;
                        showMessage('💚 英靈的祝福：恢復 50 HP，獲得 40 點護盾！');
                        
                        this.player.heroicBlessing = 10;
                        showMessage('⚔️ 英雄祝福：接下來 10 場戰鬥全屬性提升 15%！');
                        
                        const xp = 100 + Math.floor(Math.random() * 100);
                        this.addXP(xp);
                        showMessage(`📖 從英靈的記憶中學習：經驗值 +${xp}！`);
                        
                        if (Math.random() < 0.5) {
                            const item = generateItem(Math.random() < 0.4 ? 'epic' : 'excellent', this.difficulty);
                            this.player.inventory.push(item);
                            showMessage(`🎁 英靈贈予了遺物：${this.formatItem(item)}！`);
                        }
                        
                        showMessage('💫 你感到內心充滿了力量與勇氣。');
                        this.updateStatus();
                        this.generateDirectionHints();
                    } else if (choiceId === 'study_tactics') {
                        showMessage('📚 你仔細分析戰場的布局和戰術痕跡...');
                        showMessage('💡 從古代戰爭中學到了許多...');
                        
                        const xp = 150 + Math.floor(Math.random() * 150);
                        this.addXP(xp);
                        showMessage(`📖 戰術知識大增：經驗值 +${xp}！`);
                        
                        this.player.tacticalMind = 10;
                        showMessage('🧠 戰術大師：接下來 10 場戰鬥連擊機率提升！');
                        
                        this.player.luck_combat += 3;
                        showMessage('🍀 戰鬥幸運 +3！');
                        
                        this.player.base_atk += 5;
                        this.player.base_def += 5;
                        showMessage('⚔️🛡️ 永久提升：攻擊力 +5，防禦力 +5！');
                        
                        if (Math.random() < 0.6) {
                            const gold = 150 + Math.floor(Math.random() * 200);
                            this.player.gold += gold;
                            showMessage(`💰 在戰術圖中發現了藏寶位置：獲得 ${gold} 金幣！`);
                        }
                        
                        this.updateStatus();
                        this.generateDirectionHints();
                    }
                }
            );
        }
    },

    star_gazing: {
        weight: 4,
        handler() {
            showMessage('🌌 夜幕降臨，星空璀璨...');
            showMessage('✨ 你決定在這裡仰望星空...');
            const choices = [
                { id: 'meditate', label: '在星空下冥想', weight: 35 },
                { id: 'read_stars', label: '嘗試占星預言', weight: 30 },
                { id: 'rest', label: '在星空下安眠', weight: 35 }
            ];
            this.showChoicePanel(
                '星空之夜',
                choices,
                (choiceId) => {
                    if (choiceId === 'meditate') {
                        showMessage('🧘 你在星空下進入深度冥想...');
                        showMessage('💫 宇宙的奧秘在你心中流淌...');
                        
                        this.player.max_mana += 40;
                        this.player.max_hp += 30;
                        this.player.mana = this.player.max_mana;
                        showMessage('🌟 永久提升：最大HP +30，最大魔力 +40！');
                        
                        this.player.cosmicInsight = 12;
                        showMessage('🌌 宇宙洞察：接下來 12 場戰鬥技能冷卻減少 20%！');
                        
                        const xp = 120 + Math.floor(Math.random() * 120);
                        this.addXP(xp);
                        showMessage(`📖 頓悟！經驗值 +${xp}！`);
                        
                        showMessage('💭 你感到心靈無比寧靜，對世界有了新的理解。');
                        this.updateStatus();
                        this.generateDirectionHints();
                    } else if (choiceId === 'read_stars') {
                        showMessage('🔮 你嘗試從星象中預知未來...');
                        const prophecy = Math.random();
                        if (prophecy < 0.35) {
                            showMessage('✨ 你看到了吉兆！');
                            showMessage('🌟 星辰預示著巨大的好運！');
                            
                            this.player.luck_combat += 4;
                            this.player.luck_gold += 4;
                            showMessage('🍀 大幅幸運提升：戰鬥/金幣幸運各 +4！');
                            
                            this.player.starBlessing = 15;
                            showMessage('⭐ 星辰祝福：接下來 15 場戰鬥暴擊率和掉寶率大增！');
                            
                            const gold = 200 + Math.floor(Math.random() * 300);
                            this.player.gold += gold;
                            showMessage(`💰 流星雨帶來財富：獲得 ${gold} 金幣！`);
                        } else if (prophecy < 0.7) {
                            showMessage('💫 星象顯示未來將有挑戰...');
                            showMessage('但你已經做好了準備！');
                            
                            this.player.shield += 60;
                            showMessage('🛡️ 星光護盾：獲得 60 點護盾！');
                            
                            this.player.potions += 3;
                            showMessage('🧪 星辰指引你找到了 3 瓶藥水！');
                            
                            this.player.luck_combat += 2;
                            showMessage('🍀 戰鬥幸運 +2！');
                        } else {
                            showMessage('😰 你看到了不祥的凶兆...');
                            showMessage('恐懼侵蝕著你的心靈...');
                            
                            const damage = 30 + Math.floor(Math.random() * 25);
                            this.player.hp = Math.max(1, this.player.hp - damage);
                            showMessage(`💔 精神受創：受到 ${damage} 點傷害！`);
                            
                            showMessage('但知道危險反而能讓你更加警惕！');
                            this.player.dangerSense = 10;
                            showMessage('👁️ 危險感知：接下來 10 場戰鬥閃避率大幅提升！');
                        }
                        this.updateStatus();
                        this.generateDirectionHints();
                    } else if (choiceId === 'rest') {
                        showMessage('😴 你在星空下安然入睡...');
                        showMessage('💤 做了一個美好的夢...');
                        
                        this.player.hp = this.player.max_hp;
                        this.player.mana = this.player.max_mana;
                        this.player.stamina = this.player.max_stamina;
                        showMessage('💚 完全恢復了所有HP、魔力和體力！');
                        
                        showMessage('🌙 在夢中，你獲得了啟示...');
                        const dreamReward = Math.random();
                        if (dreamReward < 0.4) {
                            const xp = 150 + Math.floor(Math.random() * 150);
                            this.addXP(xp);
                            showMessage(`📖 夢境中的智慧：經驗值 +${xp}！`);
                            
                            this.player.dreamPower = 8;
                            showMessage('💭 夢境之力：接下來 8 場戰鬥所有技能效果提升 20%！');
                        } else if (dreamReward < 0.7) {
                            const gold = 150 + Math.floor(Math.random() * 200);
                            this.player.gold += gold;
                            showMessage(`💰 夢中預見了寶藏位置：獲得 ${gold} 金幣！`);
                            
                            const item = generateItem(Math.random() < 0.5 ? 'excellent' : 'rare', this.difficulty);
                            this.player.inventory.push(item);
                            showMessage(`⚔️ 醒來時發現身邊出現了：${this.formatItem(item)}！`);
                        } else {
                            this.player.max_hp += 40;
                            this.player.max_stamina += 30;
                            this.player.max_mana += 30;
                            showMessage('🌟 美夢讓你身心煥然一新：所有上限永久提升！');
                            showMessage('最大HP +40，最大體力/魔力 +30！');
                        }
                        
                        showMessage('☀️ 第二天清晨，你神清氣爽地繼續旅程。');
                        this.updateStatus();
                        this.generateDirectionHints();
                    }
                }
            );
        }
    }
};

// Register with EventRegistry
EventRegistry.register(StoryEvents);
