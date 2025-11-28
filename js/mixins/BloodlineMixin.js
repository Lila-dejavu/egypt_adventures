// BloodlineMixin: applies bloodline modifiers to player state
(function(){
    const BloodlineMixin = {
        applyBloodlineModifiers(bloodline){
            try{
                if(!bloodline || !this.player) return;
                // store canonical bloodline on player (engine expects .bloodline)
                this.player.bloodline = bloodline;
                // compatibility for test harness which uses selectedBloodline
                this.player.selectedBloodline = bloodline;

                const m = bloodline.modifiers || {};

                if(typeof m.max_mana !== 'undefined'){
                    this.player.max_mana = (this.player.max_mana || 0) + m.max_mana;
                    this.player.mana = this.player.max_mana;
                }
                if(typeof m.max_stamina !== 'undefined'){
                    this.player.max_stamina = (this.player.max_stamina || 0) + m.max_stamina;
                    this.player.stamina = this.player.max_stamina;
                }
                if(typeof m.max_hp !== 'undefined'){
                    this.player.max_hp = (this.player.max_hp || 0) + m.max_hp;
                    this.player.hp = (this.player.hp || 0) + m.max_hp;
                }
                if(typeof m.start_shield !== 'undefined'){
                    this.player.shield = (this.player.shield || 0) + m.start_shield;
                }

                // Generic additive numeric modifiers commonly used in bloodline definitions
                const numericKeys = ['attack','attack_pct','spell_damage_pct','damage_taken_pct','crit_chance','hpRegenPerTurn','stacking_attack_pct','low_hp_attack_pct','after_skill_next_attack_pct','cooldown_pct'];
                numericKeys.forEach(k => {
                    if(typeof m[k] !== 'undefined'){
                        this.player[k] = (this.player[k] || 0) + m[k];
                    }
                });

                // Copy any other modifiers not explicitly listed (numbers add, booleans set)
                Object.keys(m).forEach(k => {
                    if(numericKeys.includes(k) || ['max_mana','max_stamina','max_hp','start_shield'].includes(k)) return;
                    const v = m[k];
                    if(typeof v === 'number'){
                        this.player[k] = (this.player[k] || 0) + v;
                    } else if(typeof v === 'boolean'){
                        this.player[k] = v;
                    }
                });

                // Persist flags for other systems to inspect (some systems read player.bloodline.flags)
                if(bloodline.flags) this.player.bloodline.flags = bloodline.flags;

                if(typeof this.updateStatus === 'function') this.updateStatus();
            }catch(e){ console.warn('applyBloodlineModifiers failed', e); }
        }
    };

    window.BloodlineMixin = BloodlineMixin;
})();
