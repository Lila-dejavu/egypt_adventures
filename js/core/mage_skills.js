// Mage skills module
// Defines a set of mage-only skills and a helper to apply them in battle
(function(){
    const TIER_MULT = {
        common: 0.8,
        fine: 0.92,
        rare: 1.0,
        epic: 1.18,
        legendary: 1.35
    };

    function getTierMultiplier(game){
        try{
            const tier = (game.player && game.player.selectedBloodline && game.player.selectedBloodline.tier) || 'rare';
            return TIER_MULT[tier] || 1;
        }catch(e){ return 1; }
    }

    const SKILLS = {
        // 對單一目標造成瞬間傷害並附帶灼燒
        firebolt: {
            id: 'firebolt',
            name: '火焰箭',
            description: '消耗魔力攻擊單一目標並造成灼燒',
            tags: ['single','burn'],
            manaCost: 8,
            effect(game, matchCount, comboMultiplier){
                const mult = getTierMultiplier(game);
                const base = 28; // base damage per match unit
                const dmg = Math.floor(base * matchCount * Math.max(1, comboMultiplier) * mult);
                game.enemy.hp = Math.max(0, game.enemy.hp - dmg);
                // apply small burn DoT using addDebuffStack
                try{
                    const perTurn = Math.max(1, Math.floor(dmg * 0.06));
                    game.addDebuffStack(game.enemy, 'burn_mage', perTurn, 3, 'mage', 5);
                }catch(e){
                    game.enemy.debuffs = game.enemy.debuffs || {};
                    game.enemy.debuffs.burn_mage = { turns: 3, dmg: Math.max(1, Math.floor(dmg*0.06)) };
                }
                if(typeof game.showMessage === 'function') game.showMessage(`✨ 法術：${this.name} 造成 ${dmg} 傷害並施加灼燒`);
                return { damage: dmg };
            }
        },

        // 強化型灼燒（範圍、較長持續）
        flame_wave: {
            id: 'flame_wave',
            name: '烈焰波',
            description: '消耗較多魔力對敵人施加範圍灼燒（強化 DoT）',
            tags: ['aoe','burn'],
            manaCost: 12,
            effect(game, matchCount, comboMultiplier){
                const mult = getTierMultiplier(game);
                const base = 18;
                const dmg = Math.floor(base * matchCount * Math.max(1, comboMultiplier) * mult);
                // apply stronger burn
                try{
                    const perTurn = Math.max(2, Math.floor(dmg * 0.12));
                    game.addDebuffStack(game.enemy, 'burn_mage_strong', perTurn, 4, 'mage', 5);
                }catch(e){
                    game.enemy.debuffs = game.enemy.debuffs || {};
                    game.enemy.debuffs.burn_mage_strong = { turns: 4, dmg: Math.max(2, Math.floor(dmg*0.12)) };
                }
                if(typeof game.showMessage === 'function') game.showMessage(`🔥 法術：${this.name} 造成範圍灼燒（每回合 ${Math.max(2, Math.floor(dmg*0.12))}）`);
                return { damage: 0 };
            }
        },

        // 魔力轉護盾
        mana_shield: {
            id: 'mana_shield',
            name: '魔力護盾',
            description: '消耗魔力轉化為護盾',
            tags: ['self','shield'],
            manaCost: 6,
            effect(game, matchCount, comboMultiplier){
                const mult = getTierMultiplier(game);
                // Shield scales with mana cost and match count
                const shield = Math.floor((6 + matchCount * 3) * Math.max(1, comboMultiplier) * mult);
                game.player.shield = (game.player.shield || 0) + shield;
                if(typeof game.showMessage === 'function') game.showMessage(`🛡️ 法術：${this.name} 生成 ${shield} 點護盾`);
                return { shield };
            }
        },

        // 冰凍：使敵人無法攻擊若干回合（控制型）
        freeze: {
            id: 'freeze',
            name: '冰凍',
            description: '使敵人在數回合內無法攻擊',
            tags: ['single','control','stun'],
            manaCost: 10,
            effect(game, matchCount, comboMultiplier){
                const mult = getTierMultiplier(game);
                const duration = 3; // 固定回合
                try{
                    // perTurn = 0 used to register non-damage debuff
                    game.addDebuffStack(game.enemy, 'frozen', 0, duration, 'mage', 1);
                }catch(e){
                    game.enemy.debuffs = game.enemy.debuffs || {};
                    game.enemy.debuffs.frozen = { turns: duration, type: 'stun' };
                }
                if(typeof game.showMessage === 'function') game.showMessage(`❄️ 法術：${this.name} 使敵人冰凍 ${duration} 回合`);
                return { applied: 'frozen', duration };
            }
        },

        // 專注灼燒（單體強化 DoT）
        scorch: {
            id: 'scorch',
            name: '灼燒',
            description: '強化單體灼燒，造成持續流失生命',
            tags: ['single','burn'],
            manaCost: 9,
            effect(game, matchCount, comboMultiplier){
                const mult = getTierMultiplier(game);
                const base = 12;
                const immediate = Math.floor(base * matchCount * Math.max(1, comboMultiplier) * mult);
                game.enemy.hp = Math.max(0, game.enemy.hp - immediate);
                try{
                    const perTurn = Math.max(1, Math.floor(immediate * 0.10));
                    game.addDebuffStack(game.enemy, 'scorch_mage', perTurn, 4, 'mage', 5);
                }catch(e){
                    game.enemy.debuffs = game.enemy.debuffs || {};
                    game.enemy.debuffs.scorch_mage = { turns: 4, dmg: Math.max(1, Math.floor(immediate*0.10)) };
                }
                if(typeof game.showMessage === 'function') game.showMessage(`🔥 法術：${this.name} 造成 ${immediate} 直接傷害並施加灼燒`);
                return { damage: immediate };
            }
        },

        // 閃電連鎖：造成多次小傷害並附帶短暫震盪效果
        lightning_chain: {
            id: 'lightning_chain',
            name: '閃電連鎖',
            description: '對敵人造成連續多次攻擊',
            tags: ['single','chain','shock'],
            manaCost: 11,
            effect(game, matchCount, comboMultiplier){
                const mult = getTierMultiplier(game);
                const base = 20;
                const dmg = Math.floor(base * matchCount * Math.max(1, comboMultiplier) * mult);
                // Simulate chain by dealing damage and a small shock DoT
                game.enemy.hp = Math.max(0, game.enemy.hp - dmg);
                try{
                    const perTurn = Math.max(1, Math.floor(dmg * 0.04));
                    game.addDebuffStack(game.enemy, 'shock_mage', perTurn, 2, 'mage', 3);
                }catch(e){
                    game.enemy.debuffs = game.enemy.debuffs || {};
                    game.enemy.debuffs.shock_mage = { turns: 2, dmg: Math.max(1, Math.floor(dmg*0.04)) };
                }
                if(typeof game.showMessage === 'function') game.showMessage(`⚡️ 法術：${this.name} 造成 ${dmg} 傷害並使敵人短暫受到震盪`);
                return { damage: dmg };
            }
        },

        // 詛咒：降低敵人攻擊與迴避（Debuff）
        curse: {
            id: 'curse',
            name: '詛咒',
            description: '降低敵人攻擊與閃避率',
            tags: ['single','debuff'],
            manaCost: 7,
            effect(game, matchCount, comboMultiplier){
                const mult = getTierMultiplier(game);
                const duration = 3;
                const attackDebuff = +(0.08 * mult).toFixed(3); // 8% * mult
                const evadeDebuff = +(0.06 * mult).toFixed(3);
                try{
                    game.addDebuffStack(game.enemy, 'curse_mage', 0, duration, 'mage', 1);
                    // store specifics on enemy object for use by damage calculation
                    game.enemy.debuffs = game.enemy.debuffs || {};
                    game.enemy.debuffs.curse_mage = Object.assign(game.enemy.debuffs.curse_mage || {}, { turns: duration, attackPct: attackDebuff, evadePct: evadeDebuff });
                }catch(e){
                    game.enemy.debuffs = game.enemy.debuffs || {};
                    game.enemy.debuffs.curse_mage = { turns: duration, attackPct: attackDebuff, evadePct: evadeDebuff };
                }
                if(typeof game.showMessage === 'function') game.showMessage(`🔮 法術：${this.name} 降低敵人攻擊 ${Math.round(attackDebuff*100)}% 與迴避 ${Math.round(evadeDebuff*100)}%（${duration} 回合）`);
                return { applied: 'curse', duration };
            }
        }
    };

    function getDefaultSkillId(){
        return 'firebolt';
    }

    // Apply a skill in the context of a game instance
    function useSkill(game, skillId, matchCount, comboMultiplier){
        const s = SKILLS[skillId];
        if(!s) return null;
        const cost = (s.manaCost || 0) * Math.max(1, matchCount);
        if(!game.player || typeof game.player.mana !== 'number') return null;
        if(game.player.mana < cost){
            if(typeof game.showMessage === 'function') game.showMessage(t('err_not_enough_mana'));
            return null;
        }
        game.player.mana = Math.max(0, game.player.mana - cost);
        return s.effect(game, matchCount, comboMultiplier);
    }

    window.MageSkills = {
        SKILLS,
        useSkill,
        getDefaultSkillId,
        getTierMultiplier
    };
})();
