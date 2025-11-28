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
        if(!game.player || !game.player.bloodline) return;
        const bl = game.player.bloodline;
        if(!bl.flags) return;
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
            const dmgPerTurn = Math.max(1, Math.floor(game.enemy.max_hp * perTurn));
            game.enemy.debuffs[statusName] = { turns: duration, dmg: dmgPerTurn };
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
