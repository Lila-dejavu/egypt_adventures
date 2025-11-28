// Single clean test harness for character selection & bloodlines
(function(){
    const PT_KEY = 'egypt_playthroughs';
    const SELECTED_CLASS_KEY = 'egypt_selected_class';
    const SELECTED_BLOODLINE_KEY = 'egypt_selected_bloodline';

    const EC = id => document.getElementById(id);
    const playthroughCountEl = EC('playthroughCount');
    const decBtn = EC('decBtn');
    const incBtn = EC('incBtn');
    const resetBtn = EC('resetBtn');
    const simulateFinishBtn = EC('simulateFinishBtn');
    const selectedClassEl = EC('selectedClass');
    const selectedBloodlineDescEl = EC('selectedBloodlineDesc');
    const messageEl = EC('message');
    const selectBtns = document.querySelectorAll('.selectBtn');
    const mageCard = EC('mageCard');
    const warriorCard = EC('warriorCard');
    const archerCard = EC('archerCard');
    const bloodlineModal = EC('bloodlineModal');
    const bloodlineOptionsEl = EC('bloodlineOptions');
    const closeModalBtn = EC('closeModalBtn');
    const useGameUiToggle = EC('useGameUiToggle');

    const UI_PREF_KEY = 'character_select_use_game_ui';
    const simulateLightningBtn = EC('simulateLightningBtn');

    // Preference helper for using game UI
    function prefUseGameUI(){
        const stored = localStorage.getItem(UI_PREF_KEY);
        if(stored !== null) return stored === '1';
        return typeof window.game !== 'undefined';
    }

    if(useGameUiToggle){
        try{
            useGameUiToggle.checked = prefUseGameUI();
            useGameUiToggle.addEventListener('change', ()=>{
                localStorage.setItem(UI_PREF_KEY, useGameUiToggle.checked ? '1' : '0');
                showMessage(`測試偏好：${useGameUiToggle.checked ? '使用遊戲 UI' : '使用測試 UI'}`);
            });
        }catch(e){ console.warn('useGameUiToggle init failed', e); }
    }

    function canUseGameUI(){
        return (useGameUiToggle ? useGameUiToggle.checked : prefUseGameUI()) && typeof window.game !== 'undefined' && typeof window.game.showBloodlineForClass === 'function';
    }

    // Prefer centralized BLOODLINE_DATA when available (includes the new 'fine' tier)
    const BLOODLINE_POOLS = (window.BLOODLINE_DATA && window.BLOODLINE_DATA.pools) ? window.BLOODLINE_DATA.pools : {
        mage: [
            { id:'mage_common_ember', name:'火光傳承', description:'提升法術傷害 +5%', tier:'common', modifiers:{spell_damage_pct:0.05}, flags:{} },
            { id:'mage_common_focus', name:'專注根脈', description:'起始法力/耐力增加 10', tier:'common', modifiers:{max_stamina:10}, flags:{} },
            { id:'mage_rare_embers', name:'神秘餘燼', description:'法術造成燃燒效果，敵人每回合損失 6% 最大 HP', tier:'rare', modifiers:{spell_damage_pct:0.08}, flags:{onLightningSkill_applyStatus:{name:'burn', perTurnPct:0.06,duration:3}} },
            { id:'mage_epic_phoenix', name:'鳳凰血脈', description:'開場獲得一次復甦效果（自動回復 30% HP）', tier:'epic', modifiers:{max_hp:20}, flags:{onBattleStart_revivePercent:0.3} },
            { id:'mage_legend_nirvana', name:'涅槃之裔', description:'涅槃：強力灼燒效果', tier:'legendary', modifiers:{spell_damage_pct:0.15}, flags:{onLightningSkill_applyStatus:{name:'burn_strong', perTurnPctRange:[0.10,0.15],duration:4}} }
        ],
        warrior: [
            { id:'war_common_brawn', name:'壯健血統', description:'+10 最大 HP', tier:'common', modifiers:{max_hp:10}, flags:{} },
            { id:'war_rare_blood', name:'勇士之血', description:'擊殺回復 8% 最大 HP', tier:'rare', modifiers:{attack_pct:0.05}, flags:{onKill_healPercent:0.08} },
            { id:'war_epic_blade', name:'刀鋒血脈', description:'普攻有機率造成流血', tier:'epic', modifiers:{crit_chance:0.05}, flags:{onHit_applyStatus:{name:'bleed', dmgPerTurn:6,duration:3}} }
        ],
        archer: [
            { id:'arch_common_keen', name:'敏銳先祖', description:'攻擊 +3', tier:'common', modifiers:{attack:3}, flags:{} },
            { id:'arch_rare_ranger', name:'林間守護', description:'箭矢有機率貫穿敵人', tier:'rare', modifiers:{attack_pct:0.08}, flags:{} },
            { id:'arch_epic_eternal', name:'永恆弓血', description:'每回合小幅回復生命', tier:'epic', modifiers:{hpRegenPerTurn:4}, flags:{} }
        ]
    };

    const TIER_PROB = (window.BLOODLINE_DATA && window.BLOODLINE_DATA.tierProb) ? window.BLOODLINE_DATA.tierProb : [
        {tier:'legendary', weight:5},
        {tier:'epic', weight:10},
        {tier:'rare', weight:25},
        {tier:'common', weight:60}
    ];

    function weightedPickTier(){
        const total = TIER_PROB.reduce((s,p)=>s+p.weight,0);
        let r = Math.random()*total;
        for(const p of TIER_PROB){ if(r < p.weight) return p.tier; r -= p.weight; }
    }
    function instantiateBloodline(template){
        const inst = JSON.parse(JSON.stringify(template));
        if(inst.flags && inst.flags.onLightningSkill_applyStatus && inst.flags.onLightningSkill_applyStatus.perTurnPctRange){
            const r = inst.flags.onLightningSkill_applyStatus.perTurnPctRange;
            const v = +( (r[0] + Math.random()*(r[1]-r[0])) ).toFixed(3);
            inst.flags.onLightningSkill_applyStatus.perTurnPct = v;
            delete inst.flags.onLightningSkill_applyStatus.perTurnPctRange;
        }
        return inst;
    }

    function generateBloodlineForClass(cls){
        const pool = BLOODLINE_POOLS[cls] || [];
        const candidates = [];
        let attempts = 0;
        while(candidates.length < 3 && attempts < 30){
            attempts++;
            const tier = weightedPickTier();
            const poolTier = pool.filter(b=>b.tier === tier);
            const chosenPool = poolTier.length ? poolTier : pool;
            const pick = chosenPool[Math.floor(Math.random()*chosenPool.length)];
            // ensure uniqueness by id (object references can be tricky after cloning)
            if(!candidates.some(c=>c.id === pick.id)) candidates.push(pick);
        }
        const insts = candidates.map(instantiateBloodline);
        console.log('[bloodline] generated for', cls, '->', insts.map(x=>x.id));
        return insts;
    }

    function readPlaythroughs(){ const v = parseInt(localStorage.getItem(PT_KEY) || '0', 10); return Number.isFinite(v) ? Math.max(0, v) : 0; }
    function writePlaythroughs(n){ localStorage.setItem(PT_KEY, String(n)); updateUI(); }
    function readSelectedClass(){ return localStorage.getItem(SELECTED_CLASS_KEY) || null; }
    function writeSelectedClass(cls){
        localStorage.setItem(SELECTED_CLASS_KEY, cls);
        // If the game is loaded, sync selection into runtime player state (helpful for live testing)
        try{
            if(window.game && window.game.player){
                window.game.player.selectedClass = cls;
                if(cls === 'mage'){
                    window.game.player.max_mana = window.game.player.max_mana || 30;
                    window.game.player.mana = window.game.player.max_mana;
                } else {
                    window.game.player.max_mana = window.game.player.max_mana || 0;
                    window.game.player.mana = window.game.player.mana || 0;
                }
                if(typeof window.game.applyClassBonuses === 'function'){
                    try{ window.game.applyClassBonuses(cls); }catch(e){ console.warn('applyClassBonuses failed', e); }
                }
            }
        }catch(e){ console.warn('writeSelectedClass: sync to game failed', e); }
        updateUI();
    }
    function readSelectedBloodline(){ const s = localStorage.getItem(SELECTED_BLOODLINE_KEY); return s ? JSON.parse(s) : null; }
    function writeSelectedBloodline(b){
        localStorage.setItem(SELECTED_BLOODLINE_KEY, JSON.stringify(b));
        // If the game is loaded, try to apply bloodline modifiers to runtime player state
        try{
            if(window.game && window.game.player){
                window.game.player.selectedBloodline = b;
                if(typeof window.game.applyBloodlineModifiers === 'function'){
                    try{ window.game.applyBloodlineModifiers(b); }catch(e){ console.warn('applyBloodlineModifiers failed', e); }
                } else if(b.modifiers){
                    const m = b.modifiers;
                    if(typeof m.max_mana !== 'undefined'){
                        window.game.player.max_mana = (window.game.player.max_mana || 0) + m.max_mana;
                        window.game.player.mana = window.game.player.max_mana;
                    }
                    if(typeof m.max_stamina !== 'undefined'){
                        window.game.player.max_stamina = (window.game.player.max_stamina || 0) + m.max_stamina;
                        window.game.player.stamina = window.game.player.max_stamina;
                    }
                    if(typeof m.max_hp !== 'undefined'){
                        window.game.player.max_hp = (window.game.player.max_hp || 0) + m.max_hp;
                        window.game.player.hp = Math.min(window.game.player.hp || window.game.player.max_hp, window.game.player.max_hp);
                    }
                }
            }
        }catch(e){ console.warn('writeSelectedBloodline: sync to game failed', e); }
        updateUI();
    }

    function updateUI(){
        const pts = readPlaythroughs();
        playthroughCountEl.textContent = pts;
        const selected = readSelectedClass();
        selectedClassEl.textContent = selected ? selected : '（尚未選擇）';
        const sb = readSelectedBloodline();
        selectedBloodlineDescEl.textContent = sb ? `${sb.name} — ${sb.tier.toUpperCase()}： ${sb.description}` : '';
        setCardState(mageCard, pts >= 1);
        setCardState(warriorCard, pts >= 2);
        setCardState(archerCard, pts >= 3);
    }

    function setCardState(cardEl, unlocked){ if(unlocked){ cardEl.classList.remove('locked'); cardEl.querySelector('button').disabled = false; } else { cardEl.classList.add('locked'); cardEl.querySelector('button').disabled = true; } }

    decBtn.addEventListener('click', ()=>{ const n = Math.max(0, readPlaythroughs() - 1); writePlaythroughs(n); showMessage('已將週目數減 1'); });
    incBtn.addEventListener('click', ()=>{ const n = readPlaythroughs() + 1; writePlaythroughs(n); showMessage('已將週目數加 1'); });
    resetBtn.addEventListener('click', ()=>{ writePlaythroughs(0); localStorage.removeItem(SELECTED_CLASS_KEY); localStorage.removeItem(SELECTED_BLOODLINE_KEY); showMessage('已重置週目與選角'); });
    simulateFinishBtn.addEventListener('click', ()=>{ const n = readPlaythroughs() + 1; writePlaythroughs(n); showMessage('模擬：完成一個周目，週目數 +1'); });

    // (preference handled via canUseGameUI)

    selectBtns.forEach(btn=>{
        btn.addEventListener('click', (ev)=>{
            const cls = ev.currentTarget.dataset.class;
            const pts = readPlaythroughs();
            const allowed = (cls === 'mage' && pts >=1) || (cls === 'warrior' && pts >=2) || (cls === 'archer' && pts >=3);
            if(!allowed){ showMessage('該職業尚未解鎖'); return; }

            if(canUseGameUI()) {
                // Use game's UI/logic for bloodline selection
                try {
                    window.game.showBloodlineForClass(cls, (chosen) => {
                        if (chosen) {
                            writeSelectedClass(cls);
                            writeSelectedBloodline(chosen);
                            showMessage(`已選擇血脈：${chosen.name}`);
                            updateUI();
                        } else {
                            showMessage('已取消血脈選擇');
                        }
                    });
                } catch (e) {
                    console.error('game.showBloodlineForClass failed', e);
                    // fallback to local modal
                    openBloodlineModal(cls);
                }
            } else {
                openBloodlineModal(cls);
            }
        });
    });

    function openBloodlineModal(cls){
        // If game's UI is available, delegate the modal display to the game logic
        if(canUseGameUI()) {
            try {
                window.game.showBloodlineForClass(cls, (chosen) => {
                    if (chosen) {
                        writeSelectedClass(cls);
                        writeSelectedBloodline(chosen);
                        showMessage(`已選擇血脈：${chosen.name}`);
                        updateUI();
                    }
                });
                return;
            } catch (e) {
                console.error('game.showBloodlineForClass failed', e);
                // fallthrough to local modal
            }
        }

        bloodlineOptionsEl.innerHTML = '';
        const candidates = generateBloodlineForClass(cls);
        const TIER_LABELS = { common: '普通', fine: '精良', rare: '優良', epic: '史詩', legendary: '傳說' };
        candidates.forEach(b=>{
            const card = document.createElement('div');
                // add tier class to card so CSS border-left accent applies
                card.className = 'bloodline-card tier-' + (b.tier || 'common');
                const tierText = TIER_LABELS[b.tier] || (b.tier ? b.tier.toUpperCase() : '');
                // header includes a star, name and a colored tier badge to the right
                card.innerHTML = `
                    <div class='bloodline-header'>
                        <span class='bloodline-star'>★</span>
                        <div class='bloodline-name'>${b.name}</div>
                        <div style='margin-left:auto'><span class='bloodline-tier tier-${b.tier}'>${tierText}</span></div>
                    </div>
                    <div class='small' style='margin:8px 0'>${b.description}</div>
                    <div style='text-align:center'><button class='button chooseBtn'>選擇</button></div>`;
            const choose = card.querySelector('.chooseBtn');
            choose.addEventListener('click', ()=>{ writeSelectedClass(cls); writeSelectedBloodline(b); closeModal(); showMessage(`已選擇血脈：${b.name}`); });
            bloodlineOptionsEl.appendChild(card);
        });
        bloodlineModal.style.display = 'flex';
    }

    function closeModal(){ bloodlineModal.style.display = 'none'; }
    closeModalBtn.addEventListener('click', closeModal);

    // Expose local modal opener so DebugSystem can call it as a fallback
    try { window.openLocalBloodlineModal = openBloodlineModal; } catch(e) { /* ignore in restricted envs */ }

    simulateLightningBtn.addEventListener('click', ()=>{
            // If game and Bloodline.applyOnLightningSkill exist, call it so effect is applied to game.enemy
            if (typeof window.game !== 'undefined' && typeof Bloodline !== 'undefined' && typeof Bloodline.applyOnLightningSkill === 'function') {
                try {
                    Bloodline.applyOnLightningSkill(window.game);
                    return;
                } catch (e) {
                    console.error('Bloodline.applyOnLightningSkill failed', e);
                }
            }

            const sb = readSelectedBloodline();
            if(!sb){ showMessage('尚未選擇血脈'); return; }
            const flag = sb.flags && sb.flags.onLightningSkill_applyStatus;
            if(!flag){ showMessage('你的血脈在閃電技能時沒有特殊效果'); return; }
            if(flag.perTurnPct){ const pct = flag.perTurnPct; showMessage(`觸發血脈效果：使敵人獲得 ${Math.round(pct*100)}% 每回合灼燒（持續 ${flag.duration} 回合）`); }
            else if(flag.perTurnPctRange && flag.perTurnPctRange.length){ showMessage('觸發血脈效果（範圍數值），顯示值會在生成時鎖定'); }
            else if(flag.name){ showMessage(`觸發血脈效果：${flag.name}（更多細節見描述）`); }
            else { showMessage('觸發血脈效果（已偵測到 flag）'); }
    });

    function showMessage(msg){ messageEl.textContent = msg; setTimeout(()=>{ messageEl.textContent = ''; }, 3500); }

    updateUI();

})();
