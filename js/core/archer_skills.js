// Archer skills module
// Defines a set of archer-only skills and a helper to apply them in battle
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
        // 精準射擊：高傷害單體攻擊
        precision_shot: {
            id: 'precision_shot',
            name: '精準射擊',
            description: '消耗體力進行精準的單體射擊（基礎傷害：32）',
            tags: ['single','physical'],
            staminaCost: 7,
            effect(game, matchCount, comboMultiplier){
                const mult = getTierMultiplier(game);
                const base = 32;
                const dmg = Math.floor(base * matchCount * Math.max(1, comboMultiplier) * mult);
                const weaponAtk = (game.player.equipment.weapon ? (game.player.equipment.weapon.atk || 0) : 0);
                const finalDmg = dmg + weaponAtk;
                game.enemy.hp = Math.max(0, game.enemy.hp - finalDmg);
                if(typeof game.showMessage === 'function') game.showMessage(`🏹 技能：${this.name} 造成 ${finalDmg} 傷害`);
                return { damage: finalDmg };
            }
        },

        // 多重射擊：連續多次攻擊
        multi_shot: {
            id: 'multi_shot',
            name: '多重射擊',
            description: '快速連續射出多支箭矢（基礎傷害：18×3支）',
            tags: ['multi','physical'],
            staminaCost: 10,
            effect(game, matchCount, comboMultiplier){
                const mult = getTierMultiplier(game);
                const base = 18;
                const shots = 3; // 射出3支箭
                const dmgPerShot = Math.floor(base * matchCount * Math.max(1, comboMultiplier) * mult);
                const weaponAtk = (game.player.equipment.weapon ? (game.player.equipment.weapon.atk || 0) : 0);
                const totalDmg = (dmgPerShot + Math.floor(weaponAtk * 0.6)) * shots;
                game.enemy.hp = Math.max(0, game.enemy.hp - totalDmg);
                if(typeof game.showMessage === 'function') game.showMessage(`🎯 技能：${this.name} 射出 ${shots} 支箭造成總計 ${totalDmg} 傷害`);
                return { damage: totalDmg };
            }
        },

        // 毒箭：造成中毒效果
        poison_arrow: {
            id: 'poison_arrow',
            name: '毒箭',
            description: '射出帶毒的箭矢造成持續中毒（基礎傷害：20，中毒5回合）',
            tags: ['single','poison'],
            staminaCost: 8,
            effect(game, matchCount, comboMultiplier){
                const mult = getTierMultiplier(game);
                const base = 20;
                const immediate = Math.floor(base * matchCount * Math.max(1, comboMultiplier) * mult);
                const weaponAtk = (game.player.equipment.weapon ? (game.player.equipment.weapon.atk || 0) : 0);
                const finalDmg = immediate + Math.floor(weaponAtk * 0.7);
                game.enemy.hp = Math.max(0, game.enemy.hp - finalDmg);
                try{
                    const perTurn = Math.max(2, Math.floor(finalDmg * 0.15));
                    game.addDebuffStack(game.enemy, 'poison_archer', perTurn, 5, 'archer', 5);
                }catch(e){
                    game.enemy.debuffs = game.enemy.debuffs || {};
                    game.enemy.debuffs.poison_archer = { turns: 5, dmg: Math.max(2, Math.floor(finalDmg*0.15)) };
                }
                if(typeof game.showMessage === 'function') game.showMessage(`🧪 技能：${this.name} 造成 ${finalDmg} 傷害並施加中毒`);
                return { damage: finalDmg };
            }
        },

        // 閃避射擊：提升閃避並攻擊
        evasive_shot: {
            id: 'evasive_shot',
            name: '閃避射擊',
            description: '靈活移動並射擊，提升閃避率（基礎傷害：22，閃避+20%）',
            tags: ['single','buff'],
            staminaCost: 7,
            effect(game, matchCount, comboMultiplier){
                const mult = getTierMultiplier(game);
                const base = 22;
                const dmg = Math.floor(base * matchCount * Math.max(1, comboMultiplier) * mult);
                const weaponAtk = (game.player.equipment.weapon ? (game.player.equipment.weapon.atk || 0) : 0);
                const finalDmg = dmg + Math.floor(weaponAtk * 0.8);
                game.enemy.hp = Math.max(0, game.enemy.hp - finalDmg);
                const duration = 2;
                const evasionBonus = +(0.20 * mult).toFixed(3); // 20% * mult
                try{
                    game.player.temp_buffs = game.player.temp_buffs || {};
                    game.player.temp_buffs.evasion = { pct: evasionBonus, turns: duration };
                }catch(e){}
                if(typeof game.showMessage === 'function') game.showMessage(`🌟 技能：${this.name} 造成 ${finalDmg} 傷害並提升閃避 ${Math.round(evasionBonus*100)}%（${duration} 回合）`);
                return { damage: finalDmg };
            }
        },

        // 爆裂箭：範圍爆炸傷害
        explosive_arrow: {
            id: 'explosive_arrow',
            name: '爆裂箭',
            description: '射出會爆炸的箭矢造成範圍傷害（基礎傷害：28+30%濘射）',
            tags: ['aoe','physical'],
            staminaCost: 11,
            effect(game, matchCount, comboMultiplier){
                const mult = getTierMultiplier(game);
                const base = 28;
                const dmg = Math.floor(base * matchCount * Math.max(1, comboMultiplier) * mult);
                const weaponAtk = (game.player.equipment.weapon ? (game.player.equipment.weapon.atk || 0) : 0);
                const finalDmg = dmg + Math.floor(weaponAtk * 0.9);
                game.enemy.hp = Math.max(0, game.enemy.hp - finalDmg);
                // 額外小範圍傷害
                const splashDmg = Math.floor(finalDmg * 0.3);
                if(typeof game.showMessage === 'function') game.showMessage(`💥 技能：${this.name} 造成 ${finalDmg} 主要傷害及 ${splashDmg} 濺射傷害`);
                return { damage: finalDmg + splashDmg };
            }
        },

        // 冰凍箭：減速敵人
        frost_arrow: {
            id: 'frost_arrow',
            name: '冰凍箭',
            description: '射出冰凍箭矢減緩敵人行動（基礎傷害：24，減速30%）',
            tags: ['single','slow'],
            staminaCost: 8,
            effect(game, matchCount, comboMultiplier){
                const mult = getTierMultiplier(game);
                const base = 24;
                const dmg = Math.floor(base * matchCount * Math.max(1, comboMultiplier) * mult);
                const weaponAtk = (game.player.equipment.weapon ? (game.player.equipment.weapon.atk || 0) : 0);
                const finalDmg = dmg + Math.floor(weaponAtk * 0.7);
                game.enemy.hp = Math.max(0, game.enemy.hp - finalDmg);
                const duration = 3;
                const slowPct = +(0.30 * mult).toFixed(3); // 減速30%
                try{
                    game.enemy.debuffs = game.enemy.debuffs || {};
                    game.enemy.debuffs.slow_archer = { turns: duration, attackSpeedPct: slowPct };
                }catch(e){}
                if(typeof game.showMessage === 'function') game.showMessage(`❄️ 技能：${this.name} 造成 ${finalDmg} 傷害並減速 ${Math.round(slowPct*100)}%（${duration} 回合）`);
                return { damage: finalDmg };
            }
        },

        // 穿透射擊：無視部分防禦
        piercing_shot: {
            id: 'piercing_shot',
            name: '穿透射擊',
            description: '強力穿透攻擊無視部分防禦（基礎傷害：30×1.2）',
            tags: ['single','pierce'],
            staminaCost: 9,
            effect(game, matchCount, comboMultiplier){
                const mult = getTierMultiplier(game);
                const base = 30;
                const dmg = Math.floor(base * matchCount * Math.max(1, comboMultiplier) * mult);
                const weaponAtk = (game.player.equipment.weapon ? (game.player.equipment.weapon.atk || 0) : 0);
                // 穿透射擊傷害更高，因為無視部分防禦
                const finalDmg = Math.floor((dmg + weaponAtk) * 1.2);
                game.enemy.hp = Math.max(0, game.enemy.hp - finalDmg);
                if(typeof game.showMessage === 'function') game.showMessage(`➡️ 技能：${this.name} 穿透造成 ${finalDmg} 傷害`);
                return { damage: finalDmg, pierce: true };
            }
        }
    };

    function getDefaultSkillId(){
        return 'precision_shot';
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

    window.ArcherSkills = {
        SKILLS,
        useSkill,
        getDefaultSkillId,
        getTierMultiplier
    };
})();
