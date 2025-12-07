// Warrior skills module
// Defines a set of warrior-only skills and a helper to apply them in battle
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
        // 強力斬擊：高傷害單體攻擊
        power_slash: {
            id: 'power_slash',
            name: '力劈斬',
            description: '消耗體力進行強力斬擊（基礎傷害：35）',
            tags: ['single','physical'],
            staminaCost: 8,
            effect(game, matchCount, comboMultiplier){
                const mult = getTierMultiplier(game);
                const base = 35; // 武士傷害較高
                const dmg = Math.floor(base * matchCount * Math.max(1, comboMultiplier) * mult);
                const weaponAtk = (game.player.equipment.weapon ? (game.player.equipment.weapon.atk || 0) : 0);
                const finalDmg = dmg + weaponAtk;
                game.enemy.hp = Math.max(0, game.enemy.hp - finalDmg);
                if(typeof game.showMessage === 'function') game.showMessage(`⚔️ 技能：${this.name} 造成 ${finalDmg} 傷害`);
                return { damage: finalDmg };
            }
        },

        // 旋風斬：範圍攻擊
        whirlwind: {
            id: 'whirlwind',
            name: '旋風斬',
            description: '旋轉攻擊造成範圍傷害（基礎傷害：28×0.85）',
            tags: ['aoe','physical'],
            staminaCost: 10,
            effect(game, matchCount, comboMultiplier){
                const mult = getTierMultiplier(game);
                const base = 28;
                const dmg = Math.floor(base * matchCount * Math.max(1, comboMultiplier) * mult);
                const weaponAtk = (game.player.equipment.weapon ? (game.player.equipment.weapon.atk || 0) : 0);
                const finalDmg = Math.floor((dmg + weaponAtk) * 0.85); // 範圍技能傷害稍低
                game.enemy.hp = Math.max(0, game.enemy.hp - finalDmg);
                if(typeof game.showMessage === 'function') game.showMessage(`🌪️ 技能：${this.name} 造成 ${finalDmg} 範圍傷害`);
                return { damage: finalDmg };
            }
        },

        // 鐵壁：提升護盾
        iron_defense: {
            id: 'iron_defense',
            name: '鐵壁',
            description: '消耗體力獲得大量護盾（基礎：15+匹配數×5）',
            tags: ['self','shield'],
            staminaCost: 7,
            effect(game, matchCount, comboMultiplier){
                const mult = getTierMultiplier(game);
                const shield = Math.floor((15 + matchCount * 5) * Math.max(1, comboMultiplier) * mult);
                game.player.shield = (game.player.shield || 0) + shield;
                if(typeof game.showMessage === 'function') game.showMessage(`🛡️ 技能：${this.name} 獲得 ${shield} 點護盾`);
                return { shield };
            }
        },

        // 流血斬：造成流血效果
        bleeding_strike: {
            id: 'bleeding_strike',
            name: '裂傷斬',
            description: '攻擊並造成持續流血（基礎傷害：22，流血4回合）',
            tags: ['single','bleed'],
            staminaCost: 9,
            effect(game, matchCount, comboMultiplier){
                const mult = getTierMultiplier(game);
                const base = 22;
                const immediate = Math.floor(base * matchCount * Math.max(1, comboMultiplier) * mult);
                const weaponAtk = (game.player.equipment.weapon ? (game.player.equipment.weapon.atk || 0) : 0);
                const finalDmg = immediate + Math.floor(weaponAtk * 0.7);
                game.enemy.hp = Math.max(0, game.enemy.hp - finalDmg);
                try{
                    const perTurn = Math.max(2, Math.floor(finalDmg * 0.12));
                    game.addDebuffStack(game.enemy, 'bleed_warrior', perTurn, 4, 'warrior', 5);
                }catch(e){
                    game.enemy.debuffs = game.enemy.debuffs || {};
                    game.enemy.debuffs.bleed_warrior = { turns: 4, dmg: Math.max(2, Math.floor(finalDmg*0.12)) };
                }
                if(typeof game.showMessage === 'function') game.showMessage(`🩸 技能：${this.name} 造成 ${finalDmg} 傷害並施加流血`);
                return { damage: finalDmg };
            }
        },

        // 破甲斬：降低敵人防禦
        armor_break: {
            id: 'armor_break',
            name: '破甲斬',
            description: '攻擊並降低敵人防禦（基礎傷害：25，降低防禦15%）',
            tags: ['single','debuff'],
            staminaCost: 8,
            effect(game, matchCount, comboMultiplier){
                const mult = getTierMultiplier(game);
                const base = 25;
                const dmg = Math.floor(base * matchCount * Math.max(1, comboMultiplier) * mult);
                const weaponAtk = (game.player.equipment.weapon ? (game.player.equipment.weapon.atk || 0) : 0);
                const finalDmg = dmg + Math.floor(weaponAtk * 0.8);
                game.enemy.hp = Math.max(0, game.enemy.hp - finalDmg);
                const duration = 3;
                const armorDebuff = +(0.15 * mult).toFixed(3); // 15% * mult
                try{
                    game.enemy.debuffs = game.enemy.debuffs || {};
                    game.enemy.debuffs.armor_break = { turns: duration, defensePct: armorDebuff };
                }catch(e){}
                if(typeof game.showMessage === 'function') game.showMessage(`🔨 技能：${this.name} 造成 ${finalDmg} 傷害並降低防禦 ${Math.round(armorDebuff*100)}%（${duration} 回合）`);
                return { damage: finalDmg };
            }
        },

        // 反擊姿態：下次受到攻擊時反擊
        counter_stance: {
            id: 'counter_stance',
            name: '反擊姿態',
            description: '進入反擊姿態，受到攻擊時反擊（基礎働傷：20，2回合）',
            tags: ['self','buff'],
            staminaCost: 6,
            effect(game, matchCount, comboMultiplier){
                const mult = getTierMultiplier(game);
                const duration = 2;
                const counterDmg = Math.floor(20 * mult);
                try{
                    game.player.temp_buffs = game.player.temp_buffs || {};
                    game.player.temp_buffs.counter = { damage: counterDmg, turns: duration };
                }catch(e){}
                if(typeof game.showMessage === 'function') game.showMessage(`⚡ 技能：${this.name} 進入反擊姿態（${duration} 回合）`);
                return { applied: 'counter', duration };
            }
        },

        // 致命一擊：高暴擊率攻擊
        critical_strike: {
            id: 'critical_strike',
            name: '致命一擊',
            description: '高機率暴擊的強力攻擊（基礎傷害：30，80%暴擊率×2.5倍）',
            tags: ['single','crit'],
            staminaCost: 11,
            effect(game, matchCount, comboMultiplier){
                const mult = getTierMultiplier(game);
                const base = 30;
                const dmg = Math.floor(base * matchCount * Math.max(1, comboMultiplier) * mult);
                const weaponAtk = (game.player.equipment.weapon ? (game.player.equipment.weapon.atk || 0) : 0);
                const baseDmg = dmg + weaponAtk;
                // 高暴擊機率 (80%)
                const isCrit = Math.random() < 0.8;
                const finalDmg = isCrit ? Math.floor(baseDmg * 2.5) : baseDmg;
                game.enemy.hp = Math.max(0, game.enemy.hp - finalDmg);
                if(typeof game.showMessage === 'function') game.showMessage(`💥 技能：${this.name} 造成 ${finalDmg} 傷害${isCrit ? ' (暴擊!)' : ''}`);
                return { damage: finalDmg, crit: isCrit };
            }
        }
    };

    function getDefaultSkillId(){
        return 'power_slash';
    }

    // Apply a skill in the context of a game instance
    function useSkill(game, skillId, matchCount, comboMultiplier){
        const s = SKILLS[skillId];
        if(!s) return null;
        const cost = (s.staminaCost || 0) * Math.max(1, matchCount);
        if(!game.player || typeof game.player.stamina !== 'number') return null;
        if(game.player.stamina < cost){
            if(typeof game.showMessage === 'function') game.showMessage('體力不足！');
            return null;
        }
        game.player.stamina = Math.max(0, game.player.stamina - cost);
        // 應用武器技能增幅
        const weaponSkillPower = (game.player.equipment.weapon && game.player.equipment.weapon.skill_power) || 0;
        if(weaponSkillPower > 0) {
            comboMultiplier = comboMultiplier * (1 + weaponSkillPower / 100);
        }
        return s.effect.call(s, game, matchCount, comboMultiplier);
    }

    window.WarriorSkills = {
        SKILLS,
        useSkill,
        getDefaultSkillId,
        getTierMultiplier
    };
})();
