// ===== bloodline_data.js =====
// Centralized bloodline data (separate from generator logic)
// Exposes window.BLOODLINE_DATA with pools and tierProb

(function(){
    const pools = {
        mage: [
            // Common (10)
            { id:'mage_common_ember', name:'火光傳承', description:'提升法術傷害 +5%', tier:'common', modifiers:{spell_damage_pct:0.05}, flags:{} },
            { id:'mage_common_focus', name:'專注根脈', description:'起始耐力增加 10', tier:'common', modifiers:{max_stamina:10}, flags:{} },
            { id:'mage_common_scholar', name:'學者血脈', description:'每升一級獲得少量法術強度 (+2%)', tier:'common', modifiers:{spell_damage_pct_per_level:0.02}, flags:{} },
            { id:'mage_common_aether', name:'以太微光', description:'法術暴擊率小幅增加 (+2%)', tier:'common', modifiers:{spell_crit_chance:0.02}, flags:{} },
            { id:'mage_common_mana', name:'魔力脈絡', description:'最大魔力增加 +15', tier:'common', modifiers:{max_mana:15}, flags:{} },
            { id:'mage_common_echo', name:'回聲脈', description:'技能冷卻縮短微幅 (+5%)', tier:'common', modifiers:{cooldown_pct:-0.05}, flags:{} },
            { id:'mage_common_shard', name:'晶片根源', description:'基礎法術穿透 +3%', tier:'common', modifiers:{spell_penetration_pct:0.03}, flags:{} },
            { id:'mage_common_wisdom', name:'智者血統', description:'每級獲得少量智力加成 (+1 智力/級)', tier:'common', modifiers:{int_per_level:1}, flags:{} },
            { id:'mage_common_barrier', name:'魔障遺澤', description:'受到法術傷害時有小機率生成護盾', tier:'common', modifiers:{chance_shield_on_spell:0.05}, flags:{} },
            { id:'mage_common_clarity', name:'清明之裔', description:'法術暴擊傷害提升少量 (+5%)', tier:'common', modifiers:{spell_crit_damage_pct:0.05}, flags:{} },

            // Fine / 精良 (8)
            { id:'mage_fine_concentration', name:'深度專注', description:'法術消耗降低 +8%', tier:'fine', modifiers:{mana_cost_pct:-0.08}, flags:{} },
            { id:'mage_fine_channel', name:'導能脈', description:'技能加成：法術強度 +6%', tier:'fine', modifiers:{spell_damage_pct:0.06}, flags:{} },
            { id:'mage_fine_rift', name:'裂隙之裔', description:'小幅增加元素傷害 (+7%)', tier:'fine', modifiers:{elemental_damage_pct:0.07}, flags:{} },
            { id:'mage_fine_ward', name:'結界傳承', description:'戰鬥開始獲得持續護盾', tier:'fine', modifiers:{start_shield:20}, flags:{} },
            { id:'mage_fine_flux', name:'漣漪格', description:'施法後下一次普攻附帶法術傷害', tier:'fine', modifiers:{weapon_spell_bonus_pct:0.05}, flags:{} },
            { id:'mage_fine_resonance', name:'共鳴血脈', description:'法術命中後短暫提高法術穿透', tier:'fine', modifiers:{onHit_temp_penetration_pct:0.06}, flags:{} },
            { id:'mage_fine_pulse', name:'脈動根源', description:'範圍法術範圍小幅增加', tier:'fine', modifiers:{aoe_radius_pct:0.10}, flags:{} },
            { id:'mage_fine_siphon', name:'汲能之裔', description:'命中時回復小量魔力 (5%)', tier:'fine', modifiers:{onHit_restore_mana_pct:0.05}, flags:{} },

            // Rare / 優良 (6)
            { id:'mage_rare_embers', name:'神秘餘燼', description:'法術造成燃燒效果，敵人每回合損失 6% 最大 HP', tier:'rare', modifiers:{spell_damage_pct:0.08}, flags:{onSpell_applyStatus:{name:'burn', perTurnPct:0.06,duration:3}} },
            { id:'mage_rare_conduit', name:'奧術導脈', description:'技能造成額外穿透傷害 (+8%)', tier:'rare', modifiers:{skill_penetration_pct:0.08}, flags:{} },
            { id:'mage_rare_wardbreaker', name:'破界者', description:'對護盾目標造成額外傷害 (+10%)', tier:'rare', modifiers:{vs_shield_pct:0.10}, flags:{} },
            { id:'mage_rare_tempest', name:'風暴血脈', description:'法術有機率造成震懾效果', tier:'rare', modifiers:{spell_damage_pct:0.10}, flags:{onSpell_applyStatusChance:{name:'stun',chance:0.08,duration:1}} },
            { id:'mage_rare_echoes', name:'回響之紋', description:'法術擊中時有機率產生小型殘響再造成傷害', tier:'rare', modifiers:{spell_damage_pct:0.09}, flags:{} },
            { id:'mage_rare_glimmer', name:'微光遺產', description:'法術暴擊時造成額外灼燒效果', tier:'rare', modifiers:{spell_crit_extra_burn_pct:0.08}, flags:{} },

            // Epic / 史詩 (4)
            { id:'mage_epic_phoenix', name:'鳳凰血脈', description:'開場獲得一次復甦效果（自動回復 30% HP）', tier:'epic', modifiers:{max_hp:20}, flags:{onBattleStart_revivePercent:0.3} },
            { id:'mage_epic_arcana', name:'奧紋傳承', description:'法術強度大幅提升 (+15%)', tier:'epic', modifiers:{spell_damage_pct:0.15}, flags:{} },
            { id:'mage_epic_singularity', name:'奇點之裔', description:'終極技能造成額外範圍爆發效果', tier:'epic', modifiers:{ultimate_aoe_bonus:true}, flags:{} },
            { id:'mage_epic_timelord', name:'時之血脈', description:'有限次數的回合加速/延緩控制能力', tier:'epic', modifiers:{time_control_charges:1}, flags:{} },

            // Legendary / 傳說 (2)
            { id:'mage_legend_nirvana', name:'涅槃之裔', description:'涅槃技能：造成燃燒，敵人獲得焚身狀態，每回合減少 HP 10~15%', tier:'legendary', modifiers:{spell_damage_pct:0.15}, flags:{onSpell_applyStatus:{name:'burn_strong', perTurnPctRange:[0.10,0.15],duration:4}} },
            { id:'mage_legend_archmage', name:'大法師裔', description:'大幅提升所有法術屬性與冷卻大幅縮短', tier:'legendary', modifiers:{spell_damage_pct:0.25, cooldown_pct:-0.20}, flags:{} }
        ],
        warrior: [
            // Common (10)
            { id:'war_common_brawn', name:'壯健血統', description:'+10 最大 HP', tier:'common', modifiers:{max_hp:10}, flags:{} },
            { id:'war_common_ironwill', name:'鋼鐵意志', description:'受到致命傷害時有小機率保留 10% HP', tier:'common', modifiers:{resist_fatal_small:true}, flags:{} },
            { id:'war_common_roots', name:'穩固根源', description:'防禦提升 +3', tier:'common', modifiers:{defense:3}, flags:{} },
            { id:'war_common_charge', name:'衝鋒血脈', description:'衝鋒時傷害小幅提升', tier:'common', modifiers:{charge_damage_pct:0.05}, flags:{} },
            { id:'war_common_endure', name:'堅忍根系', description:'對持續傷害減免小幅提升', tier:'common', modifiers:{dot_resistance_pct:0.05}, flags:{} },
            { id:'war_common_grit', name:'堅毅裔', description:'+2 全域防禦', tier:'common', modifiers:{defense:2}, flags:{} },
            { id:'war_common_stamina', name:'耐力之源', description:'每回合回復少量耐力', tier:'common', modifiers:{stamina_regen_per_turn:2}, flags:{} },
            { id:'war_common_hunger', name:'鬥志血脈', description:'擊中敵人獲得小量攻擊強化', tier:'common', modifiers:{onHit_temp_attack_pct:0.03}, flags:{} },
            { id:'war_common_shock', name:'震撼傳承', description:'近戰有小機率造成眩暈', tier:'common', modifiers:{melee_stun_chance:0.03}, flags:{} },
            { id:'war_common_stone', name:'磐石裔', description:'受到的非致命傷害略減', tier:'common', modifiers:{damage_taken_pct:-0.03}, flags:{} },

            // Fine / 精良 (8)
            { id:'war_fine_vigor', name:'活力血統', description:'最大 HP 提升 +20', tier:'fine', modifiers:{max_hp:20}, flags:{} },
            { id:'war_fine_puncture', name:'貫甲之裔', description:'攻擊時有機率降低敵人護甲', tier:'fine', modifiers:{attack_pct:0.06}, flags:{onHit_applyDebuff:{name:'armor_down',value:5,duration:2}} },
            { id:'war_fine_shield', name:'堅盾傳承', description:'格擋成功時回復少量 HP', tier:'fine', modifiers:{block_heal_pct:0.05}, flags:{} },
            { id:'war_fine_berserk', name:'狂戰血脈', description:'低血量時攻擊提升 (+10%)', tier:'fine', modifiers:{low_hp_attack_pct:0.10}, flags:{} },
            { id:'war_fine_tactician', name:'戰術根源', description:'使用技能後下一次傷害增加', tier:'fine', modifiers:{after_skill_next_attack_pct:0.08}, flags:{} },
            { id:'war_fine_rally', name:'號令血統', description:'每場戰鬥中有小次數提高全隊攻防', tier:'fine', modifiers:{team_buff_charges:1}, flags:{} },
            { id:'war_fine_resolve', name:'決意之裔', description:'受到控制效果持續時間縮短', tier:'fine', modifiers:{cc_duration_pct:-0.15}, flags:{} },
            { id:'war_fine_sunder', name:'破甲傳承', description:'重擊對裝甲類敵人造成額外傷害', tier:'fine', modifiers:{vs_armored_pct:0.10}, flags:{} },

            // Rare / 優良 (6)
            { id:'war_rare_blood', name:'勇士之血', description:'擊殺回復 8% 最大 HP', tier:'rare', modifiers:{attack_pct:0.05}, flags:{onKill_healPercent:0.08} },
            { id:'war_rare_shielder', name:'守護之魂', description:'每場戰鬥開始時獲得小額護盾', tier:'rare', modifiers:{start_shield:12}, flags:{} },
            { id:'war_rare_savage', name:'野蠻根源', description:'重擊暴擊率顯著增加', tier:'rare', modifiers:{crit_chance:0.10}, flags:{} },
            { id:'war_rare_vanguard', name:'前鋒之裔', description:'對前排敵人有額外威懾效果', tier:'rare', modifiers:{vs_frontline_pct:0.12}, flags:{} },
            { id:'war_rare_guardian', name:'守護鎧血', description:'受擊時有機率生成反擊狀態', tier:'rare', modifiers:{counter_on_hit_chance:0.08}, flags:{} },
            { id:'war_rare_lifeblood', name:'生命脈動', description:'戰鬥中每隔數回合回復大量 HP', tier:'rare', modifiers:{periodic_heal:0.06}, flags:{} },

            // Epic / 史詩 (4)
            { id:'war_epic_blade', name:'刀鋒血脈', description:'普攻有機率造成流血（每回合扣除固定 HP）', tier:'epic', modifiers:{crit_chance:0.05}, flags:{onHit_applyStatus:{name:'bleed', dmgPerTurn:6,duration:3}} },
            { id:'war_epic_colossus', name:'巨像之裔', description:'顯著提高傷害承受能力與脫困能力', tier:'epic', modifiers:{max_hp:40,damage_taken_pct:-0.08}, flags:{} },
            { id:'war_epic_warcry', name:'戰慄吶喊', description:'擁有一次全場免傷或增傷的大招', tier:'epic', modifiers:{one_time_burst:true}, flags:{} },
            { id:'war_epic_reckoning', name:'審判血脈', description:'重擊命中時對周圍敵人造成範圍傷害', tier:'epic', modifiers:{cleave_pct:0.12}, flags:{} },

            // Legendary / 傳說 (2)
            { id:'war_legend_immortal', name:'不朽之裔', description:'死亡時具有一次復活效果', tier:'legendary', modifiers:{onDeath_revive:true}, flags:{} },
            { id:'war_legend_titan', name:'泰坦血脈', description:'大幅提升所有防禦與攻擊屬性', tier:'legendary', modifiers:{attack_pct:0.20,damage_taken_pct:-0.15}, flags:{} }
        ],
        archer: [
            // Common (10)
            { id:'arch_common_keen', name:'敏銳先祖', description:'射擊命中率提升，攻擊 +3', tier:'common', modifiers:{attack:3}, flags:{} },
            { id:'arch_common_fleet', name:'迅捷血統', description:'移動與回合內行動速度微幅提升', tier:'common', modifiers:{speed:1}, flags:{} },
            { id:'arch_common_hunter', name:'獵人之眼', description:'對弱勢敵人傷害小幅提升 (+5%)', tier:'common', modifiers:{vs_weakened_pct:0.05}, flags:{} },
            { id:'arch_common_precision', name:'精準脈絡', description:'暴擊率微幅提升 (+2%)', tier:'common', modifiers:{crit_chance:0.02}, flags:{} },
            { id:'arch_common_quiver', name:'箭囊傳承', description:'攻擊帶有小量穿刺傷害', tier:'common', modifiers:{pierce_damage_pct:0.03}, flags:{} },
            { id:'arch_common_camouflage', name:'偽裝根源', description:'戰鬥開始時微幅提高閃避', tier:'common', modifiers:{evasion_pct:0.03}, flags:{} },
            { id:'arch_common_trapper', name:'陷阱之裔', description:'有小機率在地面製造陷阱', tier:'common', modifiers:{trap_chance:0.04}, flags:{} },
            { id:'arch_common_endurance', name:'耐久血統', description:'對遠程反傷的抵抗提高', tier:'common', modifiers:{reflect_resist_pct:0.05}, flags:{} },
            { id:'arch_common_focus', name:'射手專注', description:'命中後短暫提高攻速', tier:'common', modifiers:{onHit_temp_attack_speed_pct:0.05}, flags:{} },
            { id:'arch_common_keeneye', name:'銳眼裔', description:'對小型目標傷害提升', tier:'common', modifiers:{vs_small_pct:0.06}, flags:{} },

            // Fine / 精良 (8)
            { id:'arch_fine_ranger', name:'林行者', description:'遠程攻擊造成更高穿透', tier:'fine', modifiers:{attack_pct:0.07}, flags:{} },
            { id:'arch_fine_trickshot', name:'詭技射手', description:'暴擊率提升 +5%', tier:'fine', modifiers:{crit_chance:0.05}, flags:{} },
            { id:'arch_fine_hail', name:'箭雨傳承', description:'攻擊時有小機率造成範圍溅射', tier:'fine', modifiers:{splash_chance:0.06}, flags:{} },
            { id:'arch_fine_steady', name:'穩定根源', description:'持續攻擊時傷害逐步提升', tier:'fine', modifiers:{stacking_attack_pct:0.02}, flags:{} },
            { id:'arch_fine_tracking', name:'追蹤血脈', description:'目標移動時獲得額外命中率', tier:'fine', modifiers:{vs_moving_pct:0.08}, flags:{} },
            { id:'arch_fine_vortex', name:'渦流之箭', description:'箭矢可使敵人減速', tier:'fine', modifiers:{attack_slow_pct:0.10}, flags:{} },
            { id:'arch_fine_longshot', name:'遠距先祖', description:'增加攻擊射程與對遠距目標傷害', tier:'fine', modifiers:{range_pct:0.15, vs_far_pct:0.06}, flags:{} },
            { id:'arch_fine_quickdraw', name:'迅拔血統', description:'首回合攻擊優先且傷害小幅增加', tier:'fine', modifiers:{first_turn_attack_bonus_pct:0.08}, flags:{} },

            // Rare / 優良 (6)
            { id:'arch_rare_ranger', name:'林間守護', description:'箭矢有機率貫穿敵人，造成額外 8% 傷害', tier:'rare', modifiers:{attack_pct:0.08}, flags:{} },
            { id:'arch_rare_trickshot', name:'詭技神弩', description:'多種特殊射擊增加暴擊與控制', tier:'rare', modifiers:{crit_chance:0.07}, flags:{} },
            { id:'arch_rare_poison', name:'毒羽傳承', description:'箭矢有機率使敵人中毒，每回合損失 HP', tier:'rare', modifiers:{attack_pct:0.09}, flags:{onHit_applyStatus:{name:'poison', dmgPerTurn:4,duration:4}} },
            { id:'arch_rare_marker', name:'標記之裔', description:'標記目標後隊友對其造成額外傷害', tier:'rare', modifiers:{mark_bonus_team_pct:0.12}, flags:{} },
            { id:'arch_rare_hawkeye', name:'鷹眼血脈', description:'暴擊傷害顯著提升', tier:'rare', modifiers:{crit_damage_pct:0.15}, flags:{} },
            { id:'arch_rare_phase', name:'相位箭術', description:'攻擊穿透敵人並擊退', tier:'rare', modifiers:{pierce_and_knockback:true}, flags:{} },

            // Epic / 史詩 (4)
            { id:'arch_epic_eternal', name:'永恆弓血', description:'每回合小幅回復生命，並增加持久戰能力', tier:'epic', modifiers:{hpRegenPerTurn:4}, flags:{} },
            { id:'arch_epic_sniper', name:'狙魂之裔', description:'單體遠距關鍵打擊造成巨大傷害', tier:'epic', modifiers:{single_target_bonus_pct:0.25}, flags:{} },
            { id:'arch_epic_multishot', name:'亂舞箭術', description:'攻擊有機率一次射出多支箭矢', tier:'epic', modifiers:{multishot_chance:0.15}, flags:{} },
            { id:'arch_epic_phantom', name:'幻影弓血', description:'迴避後的反擊附帶強力一擊', tier:'epic', modifiers:{parry_counter_pct:0.20}, flags:{} },

            // Legendary / 傳說 (2)
            { id:'arch_legend_everwind', name:'永風之裔', description:'箭矢化作風暴，穿透並持續造成傷害', tier:'legendary', modifiers:{windstorm_ability:true}, flags:{} },
            { id:'arch_legend_song', name:'弦歌傳承', description:'每次攻擊皆附帶強力元素效果並回復隊友', tier:'legendary', modifiers:{attack_heal_team_pct:0.05, elemental_on_hit:true}, flags:{} }
        ]
    };

    const tierProb = [
        {tier:'legendary', weight:5},
        {tier:'epic', weight:10},
        {tier:'rare', weight:20},
        {tier:'fine', weight:25},
        {tier:'common', weight:40}
    ];

    window.BLOODLINE_DATA = window.BLOODLINE_DATA || { pools: pools, tierProb: tierProb };
})();