// ===== bloodline_data.js =====
// Centralized bloodline data (separate from generator logic)
// Exposes window.BLOODLINE_DATA with pools and tierProb

(function(){
    const pools = {
        mage: [
            // Common (10) - 大幅強化基礎效果
            { id:'mage_common_ember', name:'火光傳承', description:'火焰類技能傷害 +25%', tier:'common', modifiers:{fire_skill_damage_pct:0.25}, flags:{} },
            { id:'mage_common_frost', name:'冰霜根源', description:'冰凍類技能持續時間 +2 回合', tier:'common', modifiers:{freeze_duration_bonus:2}, flags:{} },
            { id:'mage_common_scholar', name:'學者血脈', description:'魔力消耗降低 20%', tier:'common', modifiers:{mana_cost_pct:-0.20}, flags:{} },
            { id:'mage_common_aether', name:'以太微光', description:'施放技能後下次攻擊附帶 30% 魔法傷害', tier:'common', modifiers:{spell_echo_pct:0.30}, flags:{} },
            { id:'mage_common_mana', name:'魔力脈絡', description:'最大魔力增加 +50', tier:'common', modifiers:{max_mana:50}, flags:{} },
            { id:'mage_common_lightning', name:'閃電親和', description:'閃電圖示觸發血脈時額外傷害 +20%', tier:'common', modifiers:{lightning_trigger_bonus_pct:0.20}, flags:{} },
            { id:'mage_common_arcane', name:'奧術印記', description:'隨機技能有更高機率觸發稀有技能 +25%', tier:'common', modifiers:{rare_skill_chance_pct:0.25}, flags:{} },
            { id:'mage_common_wisdom', name:'智者血統', description:'每回合回復 8 點魔力', tier:'common', modifiers:{mana_regen_per_turn:8}, flags:{} },
            { id:'mage_common_barrier', name:'魔障遺澤', description:'施法時有 35% 機率獲得護盾', tier:'common', modifiers:{chance_shield_on_spell:0.35}, flags:{} },
            { id:'mage_common_versatile', name:'多才根源', description:'不同類型技能連續使用傷害遞增 +18%', tier:'common', modifiers:{diverse_skill_bonus_pct:0.18}, flags:{} },

            // Fine / 精良 (8) - 顯著強化
            { id:'mage_fine_concentration', name:'深度專注', description:'所有技能魔力消耗降低 35%', tier:'fine', modifiers:{mana_cost_pct:-0.35}, flags:{} },
            { id:'mage_fine_channel', name:'導能脈', description:'控制類技能（冰凍、詛咒）效果 +80%', tier:'fine', modifiers:{control_skill_bonus_pct:0.80}, flags:{} },
            { id:'mage_fine_pyro', name:'烈焰掌控', description:'火焰技能附加的灼燒傷害 +150%', tier:'fine', modifiers:{burn_damage_pct:1.50}, flags:{} },
            { id:'mage_fine_ward', name:'結界傳承', description:'魔力護盾技能額外生成 +25 點護盾', tier:'fine', modifiers:{shield_skill_bonus:25}, flags:{} },
            { id:'mage_fine_flux', name:'魔力湧動', description:'攻擊圖示觸發技能時魔力消耗降低 80%', tier:'fine', modifiers:{random_skill_mana_discount_pct:0.80}, flags:{} },
            { id:'mage_fine_resonance', name:'共鳴血脈', description:'連續使用相同類型技能傷害 +40%', tier:'fine', modifiers:{same_type_bonus_pct:0.40}, flags:{} },
            { id:'mage_fine_overload', name:'魔力過載', description:'魔力充足時技能傷害 +35%', tier:'fine', modifiers:{high_mana_damage_pct:0.35}, flags:{} },
            { id:'mage_fine_siphon', name:'汲能之裔', description:'擊殺敵人回復 60% 最大魔力', tier:'fine', modifiers:{onKill_restore_mana_pct:0.60}, flags:{} },

            // Rare / 優良 (6) - 極大強化效果與傷害
            { id:'mage_rare_inferno', name:'地獄烈焰', description:'火焰技能造成強力灼燒，每回合 18% 最大 HP，持續 6 回合', tier:'rare', modifiers:{fire_skill_damage_pct:0.45}, flags:{onFireSkill_applyStatus:{name:'burn', perTurnPct:0.18,duration:6}} },
            { id:'mage_rare_frostlord', name:'冰霜領主', description:'冰凍技能額外降低敵人 50% 攻擊速度與傷害', tier:'rare', modifiers:{freeze_skill_bonus_pct:0.50}, flags:{onFreezeSkill_slowAttack:0.50} },
            { id:'mage_rare_chain', name:'連鎖閃電', description:'閃電類技能有 60% 機率造成 150% 連鎖傷害', tier:'rare', modifiers:{lightning_skill_damage_pct:0.40, chain_chance:0.60}, flags:{} },
            { id:'mage_rare_arcane_mastery', name:'奧術精通', description:'所有技能傷害 +50%，魔力回復速度 +120%', tier:'rare', modifiers:{all_skill_damage_pct:0.50, mana_regen_pct:1.20}, flags:{} },
            { id:'mage_rare_versatile_master', name:'全能法師', description:'每場戰鬥使用不同技能種類越多，傷害遞增（每種 +25%）', tier:'rare', modifiers:{versatility_stacking:true, versatility_bonus_per_type:0.25}, flags:{} },
            { id:'mage_rare_mana_burst', name:'魔力爆發', description:'魔力耗盡時觸發爆發，恢復 100% 魔力並接下來 3 個技能免費', tier:'rare', modifiers:{mana_burst_trigger:true, burst_free_skills:3}, flags:{} },

            // Epic / 史詩 (4) - 戰鬥改變性效果
            { id:'mage_epic_phoenix', name:'鳳凰血脈', description:'開場獲得一次復甦效果（自動回復 60% HP）+ 最大HP +50', tier:'epic', modifiers:{max_hp:50}, flags:{onBattleStart_revivePercent:0.6} },
            { id:'mage_epic_arcana', name:'奧紋傳承', description:'法術強度極大提升 (+80%)，魔力消耗 -30%', tier:'epic', modifiers:{spell_damage_pct:0.80, mana_cost_pct:-0.30}, flags:{} },
            { id:'mage_epic_singularity', name:'奇點之裔', description:'終極技能造成 200% 額外範圍爆發效果', tier:'epic', modifiers:{ultimate_aoe_bonus:true, aoe_multiplier:2.0}, flags:{} },
            { id:'mage_epic_timelord', name:'時之血脈', description:'每場戰鬥 3 次回合加速（2x 傷害）或延緩敵人攻擊', tier:'epic', modifiers:{time_control_charges:3}, flags:{} },

            // Legendary / 傳說 (2) - 遊戲定義性效果
            { id:'mage_legend_nirvana', name:'涅槃之裔', description:'涅槃技能：造成焚身，敵人每回合減少 HP 20~30%，持續 8 回合', tier:'legendary', modifiers:{spell_damage_pct:0.60, all_skill_damage_pct:0.40}, flags:{onSpell_applyStatus:{name:'burn_strong', perTurnPctRange:[0.20,0.30],duration:8}} },
            { id:'mage_legend_archmage', name:'大法師裔', description:'所有法術傷害 +100%，魔力消耗 -50%，暴擊率 +25%', tier:'legendary', modifiers:{spell_damage_pct:1.00, cooldown_pct:-0.50, crit_chance:0.25}, flags:{} }
        ],
        warrior: [
            // Common (10)
            { id:'war_common_brawn', name:'壯健血統', description:'最大 HP +15，最大體力 +5', tier:'common', modifiers:{max_hp:15, max_stamina:5}, flags:{} },
            { id:'war_common_ironwill', name:'鋼鐵意志', description:'力劈斬技能傷害 +10%', tier:'common', modifiers:{power_slash_damage_pct:0.10}, flags:{} },
            { id:'war_common_whirlwind', name:'旋風之力', description:'旋風斬消耗體力降低 20%', tier:'common', modifiers:{whirlwind_cost_pct:-0.20}, flags:{} },
            { id:'war_common_shield_master', name:'盾牌精通', description:'鐵壁技能額外生成 +5 護盾', tier:'common', modifiers:{iron_defense_bonus:5}, flags:{} },
            { id:'war_common_bleeder', name:'流血專家', description:'裂傷斬的流血傷害 +30%', tier:'common', modifiers:{bleeding_strike_dot_pct:0.30}, flags:{} },
            { id:'war_common_breaker', name:'破甲之力', description:'破甲斬降低防禦效果 +5%', tier:'common', modifiers:{armor_break_bonus_pct:0.05}, flags:{} },
            { id:'war_common_stamina', name:'耐力之源', description:'每回合回復 3 點體力', tier:'common', modifiers:{stamina_regen_per_turn:3}, flags:{} },
            { id:'war_common_counter', name:'反擊專精', description:'反擊姿態持續時間 +1 回合', tier:'common', modifiers:{counter_stance_duration:1}, flags:{} },
            { id:'war_common_critical', name:'致命打擊', description:'致命一擊暴擊率額外 +10%', tier:'common', modifiers:{critical_strike_crit_bonus:0.10}, flags:{} },
            { id:'war_common_endurance', name:'持久戰士', description:'體力消耗降低 8%', tier:'common', modifiers:{stamina_cost_pct:-0.08}, flags:{} },

            // Fine / 精良 (8)
            { id:'war_fine_vigor', name:'活力血統', description:'最大 HP +25，所有技能傷害 +8%', tier:'fine', modifiers:{max_hp:25, all_skill_damage_pct:0.08}, flags:{} },
            { id:'war_fine_combo', name:'連擊大師', description:'攻擊圖示連續觸發相同技能傷害遞增 15%', tier:'fine', modifiers:{same_skill_combo_pct:0.15}, flags:{} },
            { id:'war_fine_shield', name:'堅盾傳承', description:'護盾類技能生成 +50% 護盾量', tier:'fine', modifiers:{shield_skill_bonus_pct:0.50}, flags:{} },
            { id:'war_fine_berserk', name:'狂戰血脈', description:'HP 低於 50% 時所有技能傷害 +20%', tier:'fine', modifiers:{low_hp_skill_damage_pct:0.20}, flags:{} },
            { id:'war_fine_bleed_master', name:'流血宗師', description:'所有造成流血的技能持續時間 +2 回合', tier:'fine', modifiers:{bleed_duration_bonus:2}, flags:{} },
            { id:'war_fine_rally', name:'戰吼激勵', description:'使用技能時有 15% 機率下次攻擊免費', tier:'fine', modifiers:{skill_free_next_chance:0.15}, flags:{} },
            { id:'war_fine_executioner', name:'處決者', description:'致命一擊對低血量敵人額外傷害 +25%', tier:'fine', modifiers:{execute_bonus_pct:0.25}, flags:{} },
            { id:'war_fine_versatile', name:'多技武士', description:'不同技能輪替使用傷害 +12%', tier:'fine', modifiers:{diverse_skill_bonus_pct:0.12}, flags:{} },

            // Rare / 優良 (6)
            { id:'war_rare_blood', name:'勇士之血', description:'擊殺回復 15% 最大 HP 和 20 體力', tier:'rare', modifiers:{}, flags:{onKill_healPercent:0.15, onKill_restoreStamina:20} },
            { id:'war_rare_berserker', name:'狂暴戰士', description:'連續使用攻擊技能時傷害累加 +10%/層（最多5層）', tier:'rare', modifiers:{attack_skill_stacking_pct:0.10, max_stacks:5}, flags:{} },
            { id:'war_rare_savage', name:'野蠻之力', description:'暴擊時額外造成流血（6 點/回合，3 回合）', tier:'rare', modifiers:{crit_chance:0.08}, flags:{onCrit_applyBleed:{dmgPerTurn:6, duration:3}} },
            { id:'war_rare_vanguard', name:'先鋒突擊', description:'首次使用技能傷害 +40%，體力消耗 -50%', tier:'rare', modifiers:{first_skill_bonus_pct:0.40, first_skill_cost_pct:-0.50}, flags:{} },
            { id:'war_rare_guardian', name:'守護鎧血', description:'反擊姿態反擊傷害 +50%，且反擊時回復 10 HP', tier:'rare', modifiers:{counter_damage_pct:0.50, counter_heal:10}, flags:{} },
            { id:'war_rare_stamina_mastery', name:'耐力精通', description:'體力高於 50% 時技能傷害 +18%', tier:'rare', modifiers:{high_stamina_damage_pct:0.18}, flags:{} },

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
            { id:'arch_common_precision', name:'精準射擊', description:'精準射擊技能傷害 +12%', tier:'common', modifiers:{precision_shot_damage_pct:0.12}, flags:{} },
            { id:'arch_common_multishot', name:'多重箭矢', description:'多重射擊額外增加一支箭', tier:'common', modifiers:{multi_shot_extra_arrow:1}, flags:{} },
            { id:'arch_common_poison', name:'毒素專精', description:'毒箭中毒傷害 +40%', tier:'common', modifiers:{poison_arrow_dot_pct:0.40}, flags:{} },
            { id:'arch_common_evasive', name:'靈活射手', description:'閃避射擊閃避加成 +5%', tier:'common', modifiers:{evasive_shot_evasion_bonus:0.05}, flags:{} },
            { id:'arch_common_explosive', name:'爆破箭矢', description:'爆裂箭範圍傷害 +15%', tier:'common', modifiers:{explosive_arrow_splash_pct:0.15}, flags:{} },
            { id:'arch_common_frost', name:'冰霜射手', description:'冰凍箭減速效果 +10%', tier:'common', modifiers:{frost_arrow_slow_bonus:0.10}, flags:{} },
            { id:'arch_common_pierce', name:'穿透大師', description:'穿透射擊額外無視 5% 防禦', tier:'common', modifiers:{piercing_shot_penetration:0.05}, flags:{} },
            { id:'arch_common_stamina', name:'射手耐力', description:'每回合回復 3 點體力', tier:'common', modifiers:{stamina_regen_per_turn:3}, flags:{} },
            { id:'arch_common_efficient', name:'高效射手', description:'所有技能體力消耗降低 10%', tier:'common', modifiers:{stamina_cost_pct:-0.10}, flags:{} },
            { id:'arch_common_versatile', name:'全能弓手', description:'不同技能輪替傷害 +8%', tier:'common', modifiers:{diverse_skill_bonus_pct:0.08}, flags:{} },

            // Fine / 精良 (8)
            { id:'arch_fine_ranger', name:'遊俠精通', description:'所有技能傷害 +10%，最大體力 +8', tier:'fine', modifiers:{all_skill_damage_pct:0.10, max_stamina:8}, flags:{} },
            { id:'arch_fine_trickshot', name:'詭技射手', description:'暴擊率 +8%，暴擊傷害 +20%', tier:'fine', modifiers:{crit_chance:0.08, crit_damage_pct:0.20}, flags:{} },
            { id:'arch_fine_aoe_master', name:'範圍射擊', description:'多重射擊和爆裂箭傷害 +18%', tier:'fine', modifiers:{aoe_skill_damage_pct:0.18}, flags:{} },
            { id:'arch_fine_dot_master', name:'持續傷害', description:'毒箭和冰凍箭持續效果時間 +2 回合', tier:'fine', modifiers:{dot_skill_duration:2}, flags:{} },
            { id:'arch_fine_combo', name:'連射大師', description:'連續使用相同技能傷害遞增 12%/層', tier:'fine', modifiers:{same_skill_combo_pct:0.12}, flags:{} },
            { id:'arch_fine_first_blood', name:'首發優勢', description:'每場戰鬥首次技能傷害 +35%，消耗 -40%', tier:'fine', modifiers:{first_skill_bonus_pct:0.35, first_skill_cost_pct:-0.40}, flags:{} },
            { id:'arch_fine_lethal', name:'致命射手', description:'對低血量敵人（<30%）技能傷害 +25%', tier:'fine', modifiers:{vs_low_hp_damage_pct:0.25}, flags:{} },
            { id:'arch_fine_quickdraw', name:'快速裝填', description:'體力消耗降低 15%，回復速度 +2/回合', tier:'fine', modifiers:{stamina_cost_pct:-0.15, stamina_regen_per_turn:2}, flags:{} },

            // Rare / 優良 (6)
            { id:'arch_rare_sniper', name:'狙擊精通', description:'精準射擊和穿透射擊傷害 +25%，消耗 -20%', tier:'rare', modifiers:{sniper_skill_damage_pct:0.25, sniper_skill_cost_pct:-0.20}, flags:{} },
            { id:'arch_rare_storm', name:'箭雨風暴', description:'多重射擊箭矢數 +2，爆裂箭範圍 +50%', tier:'rare', modifiers:{multi_shot_extra:2, explosive_radius_pct:0.50}, flags:{} },
            { id:'arch_rare_poison', name:'劇毒宗師', description:'毒箭中毒傷害 +80%，且疊加上限 +3 層', tier:'rare', modifiers:{poison_damage_pct:0.80, poison_max_stacks:3}, flags:{} },
            { id:'arch_rare_frostbite', name:'霜寒刺骨', description:'冰凍箭額外造成 20 傷害，減速 +15%', tier:'rare', modifiers:{frost_extra_damage:20, frost_slow_bonus:0.15}, flags:{} },
            { id:'arch_rare_critical', name:'致命箭術', description:'所有技能暴擊率 +12%，暴擊時回復 15 體力', tier:'rare', modifiers:{skill_crit_chance:0.12, onCrit_restoreStamina:15}, flags:{} },
            { id:'arch_rare_versatile', name:'百變射手', description:'每使用不同技能獲得 1 層增益（+8% 傷害），最多 6 層', tier:'rare', modifiers:{versatility_stacking:0.08, max_versatility_stacks:6}, flags:{} },

            // Epic / 史詩 (4)
            { id:'arch_epic_eternal', name:'永恆弓血', description:'每回合小幅回復生命，並增加持久戰能力', tier:'epic', modifiers:{hpRegenPerTurn:4}, flags:{} },
            { id:'arch_epic_sniper', name:'狙魂之裔', description:'單體遠距關鍵打擊造成巨大傷害', tier:'epic', modifiers:{single_target_bonus_pct:0.25}, flags:{} },
            { id:'arch_epic_multishot', name:'亂舞箭術', description:'攻擊有機率一次射出多支箭矢', tier:'epic', modifiers:{multishot_chance:0.15}, flags:{} },
            { id:'arch_epic_phantom', name:'幻影弓血', description:'迴避後的反擊附帶強力一擊', tier:'epic', modifiers:{parry_counter_pct:0.20}, flags:{} },

            // Legendary / 傳說 (2)
            { id:'arch_legend_everwind', name:'永風之裔', description:'箭矢化作風暴，穿透並持續造成傷害', tier:'legendary', modifiers:{windstorm_ability:true}, flags:{} },
            { id:'arch_legend_song', name:'弦歌傳承', description:'每次攻擊皆附帶強力元素效果並回復隊友', tier:'legendary', modifiers:{attack_heal_team_pct:0.05, elemental_on_hit:true}, flags:{} }
        ],
        desert_mage: [
            // Common (10)
            { id:'desert_common_sand', name:'沙之印記', description:'沙系技能傷害 +8%', tier:'common', modifiers:{sand_skill_damage_pct:0.08}, flags:{} },
            { id:'desert_common_sun', name:'日光親和', description:'日炎技能持續時間 +1 回合', tier:'common', modifiers:{solar_duration_bonus:1}, flags:{} },
            { id:'desert_common_nomad', name:'遊牧血統', description:'魔力消耗降低 5%', tier:'common', modifiers:{mana_cost_pct:-0.05}, flags:{} },
            { id:'desert_common_mirage', name:'幻象之力', description:'閃避技能效果 +10%', tier:'common', modifiers:{evasion_bonus_pct:0.10}, flags:{} },
            { id:'desert_common_oasis', name:'綠洲祝福', description:'最大魔力增加 +20', tier:'common', modifiers:{max_mana:20}, flags:{} },
            { id:'desert_common_storm', name:'風沙掌控', description:'沙暴技能額外傷害 +5%', tier:'common', modifiers:{sandstorm_bonus_pct:0.05}, flags:{} },
            { id:'desert_common_ancient', name:'古老智慧', description:'隨機技能有更高機率觸發控制技能', tier:'common', modifiers:{control_skill_chance_pct:0.08}, flags:{} },
            { id:'desert_common_wanderer', name:'流浪者血脈', description:'每回合回復 3 點魔力', tier:'common', modifiers:{mana_regen_per_turn:3}, flags:{} },
            { id:'desert_common_shield', name:'沙之護佑', description:'施法時有 10% 機率獲得護盾', tier:'common', modifiers:{chance_shield_on_spell:0.10}, flags:{} },
            { id:'desert_common_adapt', name:'適應血統', description:'不同類型技能連續使用傷害遞增', tier:'common', modifiers:{diverse_skill_bonus_pct:0.06}, flags:{} },

            // Fine / 精良 (8)
            { id:'desert_fine_focus', name:'沙漠冥想', description:'所有技能魔力消耗降低 12%', tier:'fine', modifiers:{mana_cost_pct:-0.12}, flags:{} },
            { id:'desert_fine_control', name:'元素掌控', description:'控制類技能（致盲、減速）效果 +30%', tier:'fine', modifiers:{control_skill_bonus_pct:0.30}, flags:{} },
            { id:'desert_fine_solar', name:'烈日之力', description:'日炎技能附加的灼燒傷害 +50%', tier:'fine', modifiers:{solar_burn_damage_pct:0.50}, flags:{} },
            { id:'desert_fine_barrier', name:'沙障精通', description:'沙之壁障額外生成 +8 點護盾', tier:'fine', modifiers:{barrier_skill_bonus:8}, flags:{} },
            { id:'desert_fine_efficiency', name:'魔力效率', description:'攻擊圖示觸發技能時魔力消耗降低 50%', tier:'fine', modifiers:{random_skill_mana_discount_pct:0.50}, flags:{} },
            { id:'desert_fine_combo', name:'連擊血脈', description:'連續使用相同類型技能傷害 +15%', tier:'fine', modifiers:{same_type_bonus_pct:0.15}, flags:{} },
            { id:'desert_fine_surge', name:'魔力湧現', description:'魔力充足時技能傷害 +10%', tier:'fine', modifiers:{high_mana_damage_pct:0.10}, flags:{} },
            { id:'desert_fine_harvest', name:'收割之力', description:'擊殺敵人回復 30% 最大魔力', tier:'fine', modifiers:{onKill_restore_mana_pct:0.30}, flags:{} },

            // Rare / 優良 (6)
            { id:'desert_rare_sandlord', name:'沙之領主', description:'沙暴技能造成強力致盲，降低 40% 命中率', tier:'rare', modifiers:{sandstorm_damage_pct:0.12}, flags:{onSandstorm_applyBlind:0.40} },
            { id:'desert_rare_sunking', name:'日炎君主', description:'日炎技能額外降低敵人 20% 防禦', tier:'rare', modifiers:{solar_skill_bonus_pct:0.15}, flags:{onSolar_reduceDefense:0.20} },
            { id:'desert_rare_mirage_master', name:'幻象大師', description:'幻影技能持續時間 +1 回合且閃避率提升至 70%', tier:'rare', modifiers:{mirage_duration:1, mirage_evasion:0.20}, flags:{} },
            { id:'desert_rare_sandstorm', name:'沙暴精通', description:'所有沙系技能傷害 +15%，魔力回復速度 +50%', tier:'rare', modifiers:{sand_skill_damage_pct:0.15, mana_regen_pct:0.50}, flags:{} },
            { id:'desert_rare_versatile', name:'沙漠全能', description:'每場戰鬥使用不同技能種類越多，傷害遞增', tier:'rare', modifiers:{versatility_stacking:true}, flags:{} },
            { id:'desert_rare_resilience', name:'沙之韌性', description:'護盾破裂時爆發沙塵，造成範圍傷害', tier:'rare', modifiers:{shield_break_damage:true}, flags:{} },

            // Epic / 史詩 (4)
            { id:'desert_epic_phoenix', name:'沙漠不死鳥', description:'開場獲得一次復甦效果（自動回復 30% HP）', tier:'epic', modifiers:{max_hp:20}, flags:{onBattleStart_revivePercent:0.3} },
            { id:'desert_epic_ancient_power', name:'古代力量', description:'法術強度大幅提升 (+15%)', tier:'epic', modifiers:{spell_damage_pct:0.15}, flags:{} },
            { id:'desert_epic_sandstorm_aoe', name:'沙暴君主', description:'沙暴技能造成額外範圍爆發效果', tier:'epic', modifiers:{sandstorm_aoe_bonus:true}, flags:{} },
            { id:'desert_epic_timekeeper', name:'時光守護者', description:'有限次數的回合加速/延緩控制能力', tier:'epic', modifiers:{time_control_charges:1}, flags:{} },

            // Legendary / 傳說 (2)
            { id:'desert_legend_apocalypse', name:'末日沙暴', description:'終極技能：召喚毀滅性沙暴，造成大量傷害並施加多重負面效果', tier:'legendary', modifiers:{spell_damage_pct:0.20}, flags:{ultimate_sandstorm:true} },
            { id:'desert_legend_immortal', name:'不朽沙王', description:'大幅提升所有沙系技能屬性與冷卻大幅縮短', tier:'legendary', modifiers:{sand_skill_damage_pct:0.25, cooldown_pct:-0.20}, flags:{} }
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