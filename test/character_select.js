// Single clean test harness for character selection & bloodlines
(function(){
    const PT_KEY = 'egypt_playthroughs';
    // Single clean test harness for character selection & bloodlines
    (function(){
        const PT_KEY = 'egypt_playthroughs';
        const SELECTED_CLASS_KEY = 'egypt_selected_class';
        const SELECTED_BLOODLINE_KEY = 'egypt_selected_bloodline';

        const EC = (id)=>document.getElementById(id);
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
        const simulateLightningBtn = EC('simulateLightningBtn');

        const BLOODLINE_POOLS = {
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

        const TIER_PROB = [
            {tier:'legendary', weight:5},
            {tier:'epic', weight:10},
            {tier:'rare', weight:25},
            {tier:'common', weight:60}
        ];

        function weightedPickTier(){
            const total = TIER_PROB.reduce((s,p)=>s+p.weight,0);
            let r = Math.random()*total;
            for(const p of TIER_PROB){ if(r < p.weight) return p.tier; r -= p.weight; }
            return 'common';
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
                if(!candidates.includes(pick)) candidates.push(pick);
            }
            return candidates.map(instantiateBloodline);
        }

        function readPlaythroughs(){ const v = parseInt(localStorage.getItem(PT_KEY) || '0', 10); return Number.isFinite(v) ? Math.max(0, v) : 0; }
        function writePlaythroughs(n){ localStorage.setItem(PT_KEY, String(n)); updateUI(); }
        function readSelectedClass(){ return localStorage.getItem(SELECTED_CLASS_KEY) || null; }
        function writeSelectedClass(cls){ localStorage.setItem(SELECTED_CLASS_KEY, cls); updateUI(); }
        function readSelectedBloodline(){ const s = localStorage.getItem(SELECTED_BLOODLINE_KEY); return s ? JSON.parse(s) : null; }
        function writeSelectedBloodline(b){ localStorage.setItem(SELECTED_BLOODLINE_KEY, JSON.stringify(b)); updateUI(); }

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

        selectBtns.forEach(btn=>{
            btn.addEventListener('click', (ev)=>{
                const cls = ev.currentTarget.dataset.class;
                const pts = readPlaythroughs();
                const allowed = (cls === 'mage' && pts >=1) || (cls === 'warrior' && pts >=2) || (cls === 'archer' && pts >=3);
                if(!allowed){ showMessage('該職業尚未解鎖'); return; }
                openBloodlineModal(cls);
            });
        });

        function openBloodlineModal(cls){
            bloodlineOptionsEl.innerHTML = '';
            const candidates = generateBloodlineForClass(cls);
            candidates.forEach(b=>{
                const card = document.createElement('div');
                card.className = 'bloodline-card';
                card.innerHTML = `<div class='bloodline-tier'>${b.tier.toUpperCase()}</div><div style='font-weight:600'>${b.name}</div><div class='small' style='margin:8px 0'>${b.description}</div><div style='text-align:center'><button class='button chooseBtn'>選擇</button></div>`;
                const choose = card.querySelector('.chooseBtn');
                choose.addEventListener('click', ()=>{ writeSelectedClass(cls); writeSelectedBloodline(b); closeModal(); showMessage(`已選擇血脈：${b.name}`); });
                bloodlineOptionsEl.appendChild(card);
            });
            bloodlineModal.style.display = 'flex';
        }

        function closeModal(){ bloodlineModal.style.display = 'none'; }
        closeModalBtn.addEventListener('click', closeModal);

        simulateLightningBtn.addEventListener('click', ()=>{
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
                        ]
                    };

                    const TIER_PROB = [
                        {tier:'legendary', weight:5},
                        {tier:'epic', weight:10},
                        {tier:'rare', weight:25},
                        {tier:'common', weight:60}
                    ];

                    function weightedPickTier(){
                        const total = TIER_PROB.reduce((s,p)=>s+p.weight,0);
                        let r = Math.random()*total;
                        for(const p of TIER_PROB){ if(r < p.weight) return p.tier; r -= p.weight; }
                        return 'common';
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
                            if(!candidates.includes(pick)) candidates.push(pick);
                        }
                        return candidates.map(instantiateBloodline);
                    }

                    function readPlaythroughs(){ const v = parseInt(localStorage.getItem(PT_KEY) || '0', 10); return Number.isFinite(v) ? Math.max(0, v) : 0; }
                    function writePlaythroughs(n){ localStorage.setItem(PT_KEY, String(n)); updateUI(); }
                    function readSelectedClass(){ return localStorage.getItem(SELECTED_CLASS_KEY) || null; }
                    function writeSelectedClass(cls){ localStorage.setItem(SELECTED_CLASS_KEY, cls); updateUI(); }
                    function readSelectedBloodline(){ const s = localStorage.getItem(SELECTED_BLOODLINE_KEY); return s ? JSON.parse(s) : null; }
                    function writeSelectedBloodline(b){ localStorage.setItem(SELECTED_BLOODLINE_KEY, JSON.stringify(b)); updateUI(); }

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

                    selectBtns.forEach(btn=>{
                        btn.addEventListener('click', (ev)=>{
                            const cls = ev.currentTarget.dataset.class;
                            const pts = readPlaythroughs();
                            const allowed = (cls === 'mage' && pts >=1) || (cls === 'warrior' && pts >=2) || (cls === 'archer' && pts >=3);
                            if(!allowed){ showMessage('該職業尚未解鎖'); return; }
                            openBloodlineModal(cls);
                        });
                    });

                    function openBloodlineModal(cls){
                        bloodlineOptionsEl.innerHTML = '';
                        const candidates = generateBloodlineForClass(cls);
                        candidates.forEach(b=>{
                            const card = document.createElement('div');
                            card.className = 'bloodline-card';
                            card.innerHTML = `<div class='bloodline-tier'>${b.tier.toUpperCase()}</div><div style='font-weight:600'>${b.name}</div><div class='small' style='margin:8px 0'>${b.description}</div><div style='text-align:center'><button class='button chooseBtn'>選擇</button></div>`;
                            const choose = card.querySelector('.chooseBtn');
                            choose.addEventListener('click', ()=>{ writeSelectedClass(cls); writeSelectedBloodline(b); closeModal(); showMessage(`已選擇血脈：${b.name}`); });
                            bloodlineOptionsEl.appendChild(card);
                        });
                        bloodlineModal.style.display = 'flex';
                    }

                    function closeModal(){ bloodlineModal.style.display = 'none'; }
                    closeModalBtn.addEventListener('click', closeModal);

                    simulateLightningBtn.addEventListener('click', ()=>{
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
