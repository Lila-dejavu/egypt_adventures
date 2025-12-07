// Desert Mage skills module
// Defines a set of desert mage-only skills themed around sand, sun, and desert magic
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
        // 沙暴：造成範圍傷害並降低敵人命中率
        sandstorm: {
            id: 'sandstorm',
            name: '沙暴',
            description: '召喚沙暴造成傷害並降低敵人命中率',
            tags: ['aoe','debuff'],
            manaCost: 10,
            effect(game, matchCount, comboMultiplier){
                const mult = getTierMultiplier(game);
                const base = 22;
                const dmg = Math.floor(base * matchCount * Math.max(1, comboMultiplier) * mult);
                game.enemy.hp = Math.max(0, game.enemy.hp - dmg);
                // Apply blind debuff (reduces enemy accuracy)
                try{
                    game.addDebuffStack(game.enemy, 'blind', 0, 3, 'desert_mage', 1);
                }catch(e){
                    game.enemy.debuffs = game.enemy.debuffs || {};
                    game.enemy.debuffs.blind = { turns: 3, accuracyReduction: 0.3 };
                }
                if(typeof game.showMessage === 'function') game.showMessage(`🌪️ 法術：${this.name} 造成 ${dmg} 傷害並致盲敵人`);
                return { damage: dmg };
            }
        },

        // 日炎：持續型高傷害技能
        solar_flare: {
            id: 'solar_flare',
            name: '日炎',
            description: '引導太陽之力造成強力灼燒',
            tags: ['single','burn'],
            manaCost: 12,
            effect(game, matchCount, comboMultiplier){
                const mult = getTierMultiplier(game);
                const base = 20;
                const dmg = Math.floor(base * matchCount * Math.max(1, comboMultiplier) * mult);
                game.enemy.hp = Math.max(0, game.enemy.hp - dmg);
                // Apply solar burn (stronger than normal burn)
                try{
                    const perTurn = Math.max(3, Math.floor(dmg * 0.15));
                    game.addDebuffStack(game.enemy, 'solar_burn', perTurn, 4, 'desert_mage', 5);
                }catch(e){
                    game.enemy.debuffs = game.enemy.debuffs || {};
                    game.enemy.debuffs.solar_burn = { turns: 4, dmg: Math.max(3, Math.floor(dmg*0.15)) };
                }
                if(typeof game.showMessage === 'function') game.showMessage(`☀️ 法術：${this.name} 造成 ${dmg} 傷害並施加日炎灼燒`);
                return { damage: dmg };
            }
        },

        // 沙牆：生成護盾並反彈傷害
        sand_barrier: {
            id: 'sand_barrier',
            name: '沙之壁障',
            description: '形成沙之護盾，可反彈部分傷害',
            tags: ['self','shield','reflect'],
            manaCost: 8,
            effect(game, matchCount, comboMultiplier){
                const mult = getTierMultiplier(game);
                const shield = Math.floor((8 + matchCount * 4) * Math.max(1, comboMultiplier) * mult);
                game.player.shield = (game.player.shield || 0) + shield;
                // Add reflect buff
                game.player.buffs = game.player.buffs || {};
                game.player.buffs.sand_reflect = { turns: 2, reflectPercent: 0.2 };
                if(typeof game.showMessage === 'function') game.showMessage(`🛡️ 法術：${this.name} 生成 ${shield} 點護盾並反彈 20% 傷害`);
                return { shield };
            }
        },

        // 流沙：使敵人陷入流沙減速
        quicksand: {
            id: 'quicksand',
            name: '流沙陷阱',
            description: '使敵人陷入流沙，大幅降低其攻擊速度',
            tags: ['single','control','slow'],
            manaCost: 9,
            effect(game, matchCount, comboMultiplier){
                const mult = getTierMultiplier(game);
                const base = 15;
                const dmg = Math.floor(base * matchCount * Math.max(1, comboMultiplier) * mult);
                game.enemy.hp = Math.max(0, game.enemy.hp - dmg);
                // Apply slow debuff
                try{
                    game.addDebuffStack(game.enemy, 'quicksand_slow', 0, 3, 'desert_mage', 1);
                }catch(e){
                    game.enemy.debuffs = game.enemy.debuffs || {};
                    game.enemy.debuffs.quicksand_slow = { turns: 3, speedReduction: 0.4 };
                }
                if(typeof game.showMessage === 'function') game.showMessage(`⏳ 法術：${this.name} 造成 ${dmg} 傷害並使敵人陷入流沙`);
                return { damage: dmg };
            }
        },

        // 沙之幻影：召喚分身吸收傷害
        mirage: {
            id: 'mirage',
            name: '海市蜃樓',
            description: '創造幻影分身，下次攻擊有機率完全閃避',
            tags: ['self','buff','evasion'],
            manaCost: 7,
            effect(game, matchCount, comboMultiplier){
                const mult = getTierMultiplier(game);
                // Grant evasion buff
                game.player.buffs = game.player.buffs || {};
                game.player.buffs.mirage = { turns: 2, evasionChance: 0.5 };
                if(typeof game.showMessage === 'function') game.showMessage(`✨ 法術：${this.name} 創造幻影，獲得 50% 閃避率 2 回合`);
                return { evasion: 0.5 };
            }
        },

        // 沙之刃：快速物理魔法混合攻擊
        sand_blade: {
            id: 'sand_blade',
            name: '沙之刃',
            description: '凝聚沙粒成利刃，造成快速切割傷害',
            tags: ['single','physical'],
            manaCost: 6,
            effect(game, matchCount, comboMultiplier){
                const mult = getTierMultiplier(game);
                const base = 25;
                const dmg = Math.floor(base * matchCount * Math.max(1, comboMultiplier) * mult);
                game.enemy.hp = Math.max(0, game.enemy.hp - dmg);
                // Small chance to apply bleeding
                if(Math.random() < 0.3){
                    try{
                        const perTurn = Math.floor(dmg * 0.08);
                        game.addDebuffStack(game.enemy, 'bleed', perTurn, 3, 'desert_mage', 3);
                    }catch(e){
                        game.enemy.debuffs = game.enemy.debuffs || {};
                        game.enemy.debuffs.bleed = { turns: 3, dmg: Math.floor(dmg*0.08) };
                    }
                    if(typeof game.showMessage === 'function') game.showMessage(`⚔️ 法術：${this.name} 造成 ${dmg} 傷害並引發流血`);
                } else {
                    if(typeof game.showMessage === 'function') game.showMessage(`⚔️ 法術：${this.name} 造成 ${dmg} 傷害`);
                }
                return { damage: dmg };
            }
        },

        // 終極技能：沙漠神罰
        desert_wrath: {
            id: 'desert_wrath',
            name: '沙漠神罰',
            description: '召喚沙漠之怒，造成大量傷害並施加多重負面效果',
            tags: ['ultimate','aoe','burn','debuff'],
            manaCost: 20,
            effect(game, matchCount, comboMultiplier){
                const mult = getTierMultiplier(game);
                const base = 45;
                const dmg = Math.floor(base * matchCount * Math.max(1, comboMultiplier) * mult);
                game.enemy.hp = Math.max(0, game.enemy.hp - dmg);
                // Apply multiple debuffs
                try{
                    const burnDmg = Math.floor(dmg * 0.2);
                    game.addDebuffStack(game.enemy, 'desert_wrath_burn', burnDmg, 5, 'desert_mage', 5);
                    game.addDebuffStack(game.enemy, 'blind', 0, 3, 'desert_mage', 1);
                    game.addDebuffStack(game.enemy, 'quicksand_slow', 0, 3, 'desert_mage', 1);
                }catch(e){
                    game.enemy.debuffs = game.enemy.debuffs || {};
                    game.enemy.debuffs.desert_wrath_burn = { turns: 5, dmg: Math.floor(dmg*0.2) };
                    game.enemy.debuffs.blind = { turns: 3 };
                    game.enemy.debuffs.quicksand_slow = { turns: 3 };
                }
                if(typeof game.showMessage === 'function') game.showMessage(`⚡ 終極法術：${this.name} 造成 ${dmg} 傷害並施加灼燒、致盲、減速！`);
                return { damage: dmg };
            }
        }
    };

    // === Public API ===
    window.DesertMageSkills = {
        list: Object.values(SKILLS),
        get(id) { return SKILLS[id]; },
        getRandomSkill() {
            const arr = this.list;
            // Filter out ultimate for normal random triggers
            const normal = arr.filter(s => !s.tags.includes('ultimate'));
            return normal[Math.floor(Math.random() * normal.length)];
        },
        applySkill(game, skillId, matchCount = 1, comboMultiplier = 1.0){
            const skill = SKILLS[skillId];
            if(!skill) {
                console.warn('[DesertMageSkills] Unknown skill:', skillId);
                return null;
            }
            // Check mana
            const cost = skill.manaCost || 0;
            if(game.player.mana < cost){
                if(typeof game.showMessage === 'function') game.showMessage(`⚠️ 魔力不足！需要 ${cost} 魔力`);
                return null;
            }
            game.player.mana -= cost;
            // 應用武器技能增幅
            const weaponSkillPower = (game.player.equipment.weapon && game.player.equipment.weapon.skill_power) || 0;
            if(weaponSkillPower > 0) {
                comboMultiplier = comboMultiplier * (1 + weaponSkillPower / 100);
            }
            return skill.effect.call(skill, game, matchCount, comboMultiplier);
        }
    };

    console.log('[DesertMageSkills] Loaded', Object.keys(SKILLS).length, 'skills');
})();
