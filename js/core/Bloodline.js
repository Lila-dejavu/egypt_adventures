// ===== Bloodline.js =====
// Generator and helper functions for bloodline system
// Exposes a global `Bloodline` object with methods to generate and apply effects

(function(){
    // Load data from separate data file if available (window.BLOODLINE_DATA)
    const BLOODLINE_POOLS = (window.BLOODLINE_DATA && window.BLOODLINE_DATA.pools) ? window.BLOODLINE_DATA.pools : {};
    const TIER_PROB = (window.BLOODLINE_DATA && window.BLOODLINE_DATA.tierProb) ? window.BLOODLINE_DATA.tierProb : [
        {tier:'legendary', weight:5},
        {tier:'epic', weight:10},
        {tier:'rare', weight:25},
        {tier:'common', weight:60}
    ];

    function weightedPickTier(){
        const total = TIER_PROB.reduce((s,p)=>s+p.weight,0);
        let r = Math.random()*total;
        for(const p of TIER_PROB){
            if(r < p.weight) return p.tier;
            r -= p.weight;
        }
        return 'common';
    }

    function instantiate(template){
        const inst = JSON.parse(JSON.stringify(template));
        if(inst.flags && inst.flags.onLightningSkill_applyStatus && inst.flags.onLightningSkill_applyStatus.perTurnPctRange){
            const r = inst.flags.onLightningSkill_applyStatus.perTurnPctRange;
            const v = +( (r[0] + Math.random()*(r[1]-r[0])) ).toFixed(3);
            inst.flags.onLightningSkill_applyStatus.perTurnPct = v;
            delete inst.flags.onLightningSkill_applyStatus.perTurnPctRange;
        }
        return inst;
    }

    function generateOptionsForClass(cls){
        const pool = BLOODLINE_POOLS[cls] || [];
        const candidates = [];
        let attempts = 0;
        while(candidates.length < 3 && attempts < 30){
            attempts++;
            const tier = weightedPickTier();
            const poolTier = pool.filter(b=>b.tier === tier);
            const chosenPool = poolTier.length ? poolTier : pool;
            const pick = chosenPool[Math.floor(Math.random()*chosenPool.length)];
            if(!candidates.includes(pick)) candidates.push(pick);
        }
        return candidates.map(instantiate);
    }

    /**
     * Apply bloodline effects that trigger on Lightning Skill ('⚡️').
     * This function is called from Battle logic after skill damage is applied.
     * It may apply a debuff/status to the enemy (e.g., burn). The function
     * mutates the `game.enemy` object to store debuffs.
     *
     * @param {Object} game - game instance (this)
     */
    function applyOnLightningSkill(game){
        if(!game.player) return;
        const bl = game.player.bloodline || game.player.selectedBloodline;
        if(!bl || !bl.flags) return;
        const flag = bl.flags.onLightningSkill_applyStatus;
        if(!flag) return;

        // Prepare enemy.debuffs container
        game.enemy.debuffs = game.enemy.debuffs || {};

        // Example: apply burn or burn_strong
        const statusName = flag.name || 'burn';
        if(statusName === 'burn' || statusName === 'burn_strong'){
            const perTurn = flag.perTurnPct || flag.perTurnPctRange && ((flag.perTurnPctRange[0]+flag.perTurnPctRange[1])/2) || 0.06;
            const duration = flag.duration || 3;
            // Store as absolute hp-per-turn by converting percent of enemy.max_hp
            // Apply player's bloodline/spell modifiers and difficulty scaling so the effect feels meaningful
            let totalMultiplier = 1;
            try {
                // Player bloodline modifiers (e.g., burn_damage_pct, spell_damage_pct, fire_skill_damage_pct)
                const mods = (game.player && game.player.bloodline && game.player.bloodline.modifiers) ? game.player.bloodline.modifiers : {};
                const modSum = (mods.burn_damage_pct || 0) + (mods.spell_damage_pct || 0) + (mods.fire_skill_damage_pct || 0) + (mods.lightning_trigger_bonus_pct || 0);
                totalMultiplier += modSum;

                // Difficulty-based boost (10% per difficulty level)
                const diffBoost = (typeof game.difficulty === 'number') ? (0.10 * game.difficulty) : 0;
                totalMultiplier += diffBoost;

                // New Game+ / playthroughs gentle scaling
                const playthroughs = parseInt(localStorage.getItem('egypt_playthroughs') || '0', 10) || 0;
                if (playthroughs > 0) totalMultiplier += (0.05 * playthroughs);
            } catch (e) {
                totalMultiplier = 1;
            }

            let dmgPerTurn = Math.max(1, Math.floor(game.enemy.max_hp * perTurn * totalMultiplier));
            // Ensure a sensible minimum (not just 1) so percentages feel impactful on low-HP enemies
            const sensibleMin = 3;
            if (dmgPerTurn < sensibleMin) dmgPerTurn = sensibleMin;
            // Prefer engine helper if available (supports stacking). Bloodline stacks capped at 5 layers.
            if (typeof game.addDebuffStack === 'function') {
                try {
                    game.addDebuffStack(game.enemy, statusName, dmgPerTurn, duration, 'bloodline', 5);
                } catch (e) {
                    // fallback to legacy behavior
                    game.enemy.debuffs[statusName] = { turns: duration, dmg: dmgPerTurn };
                }
            } else {
                game.enemy.debuffs[statusName] = { turns: duration, dmg: dmgPerTurn };
            }
            if(typeof game.updateStatus === 'function'){
                game.updateStatus();
            }
            if(typeof game.showMessage === 'function'){
                game.showMessage(`🧨 血脈觸發：對敵人施加 ${statusName}，每回合失血 ${dmgPerTurn}（持續 ${duration} 回合）`);
            } else {
                // fallback
                showMessage(`🧨 血脈觸發：對敵人施加 ${statusName}，每回合失血 ${dmgPerTurn}（持續 ${duration} 回合）`);
            }
        }
    }

    // expose API
    window.Bloodline = {
        generateOptionsForClass,
        applyOnLightningSkill
    };
})();
