// ===== bloodline_data.js =====
// Centralized bloodline data (separate from generator logic)
// Exposes window.BLOODLINE_DATA with pools and tierProb

(function(){
    const pools = {
        mage: [
            { id:'mage_common_ember', name:'火光傳承', description:'提升法術傷害 +5%', tier:'common', modifiers:{spell_damage_pct:0.05}, flags:{} },
            { id:'mage_common_focus', name:'專注根脈', description:'起始耐力增加 10', tier:'common', modifiers:{max_stamina:10}, flags:{} },
            { id:'mage_common_scholar', name:'學者血脈', description:'每升一級獲得少量法術強度 (+2%)', tier:'common', modifiers:{spell_damage_pct_per_level:0.02}, flags:{} },
            { id:'mage_rare_embers', name:'神秘餘燼', description:'法術造成燃燒效果，敵人每回合損失 6% 最大 HP', tier:'rare', modifiers:{spell_damage_pct:0.08}, flags:{onLightningSkill_applyStatus:{name:'burn', perTurnPct:0.06,duration:3}} },
            { id:'mage_rare_conduit', name:'奧術導脈', description:'技能造成額外穿透傷害 (+8%)', tier:'rare', modifiers:{skill_penetration_pct:0.08}, flags:{} },
            { id:'mage_epic_phoenix', name:'鳳凰血脈', description:'開場獲得一次復甦效果（自動回復 30% HP）', tier:'epic', modifiers:{max_hp:20}, flags:{onBattleStart_revivePercent:0.3} },
            { id:'mage_legend_nirvana', name:'涅槃之裔', description:'涅槃技能：造成燃燒，敵人獲得焚身狀態，每回合減少 HP 10~15%', tier:'legendary', modifiers:{spell_damage_pct:0.15}, flags:{onLightningSkill_applyStatus:{name:'burn_strong', perTurnPctRange:[0.10,0.15],duration:4}} }
        ],
        warrior: [
            { id:'war_common_brawn', name:'壯健血統', description:'+10 最大 HP', tier:'common', modifiers:{max_hp:10}, flags:{} },
            { id:'war_common_ironwill', name:'鋼鐵意志', description:'受到致命傷害時有小機率保留 10% HP', tier:'common', modifiers:{resist_fatal_small:true}, flags:{} },
            { id:'war_common_roots', name:'穩固根源', description:'防禦提升 +3', tier:'common', modifiers:{defense:3}, flags:{} },
            { id:'war_rare_blood', name:'勇士之血', description:'擊殺回復 8% 最大 HP', tier:'rare', modifiers:{attack_pct:0.05}, flags:{onKill_healPercent:0.08} },
            { id:'war_rare_shielder', name:'守護之魂', description:'每場戰鬥開始時獲得小額護盾', tier:'rare', modifiers:{start_shield:12}, flags:{} },
            { id:'war_epic_blade', name:'刀鋒血脈', description:'普攻有機率造成流血（每回合扣除固定 HP）', tier:'epic', modifiers:{crit_chance:0.05}, flags:{onHit_applyStatus:{name:'bleed', dmgPerTurn:6,duration:3}} }
        ],
        archer: [
            { id:'arch_common_keen', name:'敏銳先祖', description:'射擊命中率提升，攻擊 +3', tier:'common', modifiers:{attack:3}, flags:{} },
            { id:'arch_common_fleet', name:'迅捷血統', description:'移動與回合內行動速度微幅提升', tier:'common', modifiers:{speed:1}, flags:{} },
            { id:'arch_common_hunter', name:'獵人之眼', description:'對弱勢敵人傷害小幅提升 (+5%)', tier:'common', modifiers:{vs_weakened_pct:0.05}, flags:{} },
            { id:'arch_rare_ranger', name:'林間守護', description:'箭矢有機率貫穿敵人，造成額外 8% 傷害', tier:'rare', modifiers:{attack_pct:0.08}, flags:{} },
            { id:'arch_rare_trickshot', name:'詭技射手', description:'暴擊率提升 +5%', tier:'rare', modifiers:{crit_chance:0.05}, flags:{} },
            { id:'arch_epic_eternal', name:'永恆弓血', description:'每回合小幅回復生命，並增加持久戰能力', tier:'epic', modifiers:{hpRegenPerTurn:4}, flags:{} }
        ]
    };

    const tierProb = [
        {tier:'legendary', weight:5},
        {tier:'epic', weight:10},
        {tier:'rare', weight:25},
        {tier:'common', weight:60}
    ];

    window.BLOODLINE_DATA = window.BLOODLINE_DATA || { pools: pools, tierProb: tierProb };
})();