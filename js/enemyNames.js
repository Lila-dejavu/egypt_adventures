// ===== 怪物名稱生成系統 =====

function genEnemyName(type, lang = typeof currentLanguage !== 'undefined' ? currentLanguage : 'zh-TW') {
	// 支援多語系與怪物類型分類的敵人名稱生成器
	// 依 type (monster/elite/mini_boss) 使用不同名稱庫以增加變化
	const pools = {
		'zh-TW': {
			monster: {
				prefixes: ['古夫','阿努','賽特','卡夫','諾姆','塔魯','哈姆','賽努','納菲','索拉','克普','莫特','賽克','巴克','圖恩'],
				suffixes: ['守衛','戰士','祭司','哨兵','弓手','游俠','傭兵','盜賊','掘墓者','巡邏兵','斥候','劍士','槍兵','刀客','拳士'],
				adjectives: ['沙塵','血眼','影之','石裔','夜行','盲目','沉默','荒野','蒼白','破爛','枯骨','迷途','殘破','低語','徘徊'],
				epithets: ['流浪者','哨兵','遊魂','追獵者','守夜者','拾荒者','迷失者','遺民']
			},
			elite: {
				prefixes: ['拉','荷魯斯','賽特','阿蒙','梅特','伊西斯','涅夫特','巴斯','克特','賽莉','索貝克','穆特','塞赫邁特','貝斯','凱布利'],
				suffixes: ['執行者','審判者','守護者','掠奪者','術士','牧師','裁決者','統領','征服者','復仇者','劊子手','督軍','血衛','影刃','鐵衛'],
				adjectives: ['狂怒','金甲','烈焰','寒霜','焚燒','骨語','古老','血月','幽冥','鋼鐵','猩紅','暗影','毀滅','雷霆','狂風'],
				epithets: ['征服','復仇','毀滅','屠戮','審判','制裁','暴怒','殲滅']
			},
			mini_boss: {
				prefixes: ['奧西里斯','阿努比斯','托特','拉','荷魯斯','賽特','普塔','阿頓','蓋布','努特','舒','泰芙努特','阿佩普','索貝克','塞赫邁特'],
				suffixes: ['霸主','領主','大君','王者','暴君','魔王','督主','宗主','戰神','裁決者','毀滅者','屠夫','魔將','血王','暗主'],
				adjectives: ['不朽','永恆','至高','無上','毀滅','末日','深淵','煉獄','天罰','滅世','弒神','破天','裂地','魔化','墮落'],
				epithets: ['不死者','永生者','吞噬者','覺醒者','統治者','終結者','君王','暴君']
			},
			boss: {
				prefixes: ['Amon-Ra','Set-Null','Osirion','Khamet','Pharok','Neferu','Tutmar','Ramesh','Khent','Apophis'],
				suffixes: ['Le Destructeur','Le Souverain','Le Jugement','LAnnihilateur','Le Tyran','Le Seigneur','Le Faucheur','Le Dominant','Le Roy','Le Maître'],
				adjectives: ['Sans-Fin','Tout-Puissant','Apocalyptique','Terminal','Absolu','Éternel','Fléau','Ténébreux','Ardent','Abyssal'],
				epithets: ['Annihilation','Jugement','Domination','Destruction','Colère','Arrivée','Immortel','Silence']
			},
			boss: {
				prefixes: ['Amon-Ra','Set-Null','Osirion','Khamet','Pharok','Neferu','Tutmar','Ramesh','Khent','Apophis'],
				suffixes: ['The Destroyer','The Sovereign','The Judicator','The Annihilator','The Tyrant','The Lord','The Reaper','The Dominant','The King','The Master'],
				adjectives: ['Endless','Almighty','Apocalyptic','Terminal','Absolute','Eternal','Harbinger','Silent','Blazing','Abyssal'],
				epithets: ['Annihilation','Judgement','Domination','Destruction','Wrath','Arrival','Immortal','Silence']
			},
			boss: {
				prefixes: ['阿蒙拉','塞特拉克','歐賽里','卡門','賽孚克斯','帕肯','努特卡','阿蒙特','赫利烏斯','泰拉克'],
				suffixes: ['終焉者','主宰','審判者','滅世者','最終之王','巨靈','死神','暴君之主','王之怒','支配者'],
				adjectives: ['無盡','全能','破滅之','終末','絕對','永劫','天啟','寂滅','炙焰','深淵'],
				epithets: ['終焉','審判','統御','破壞','狂怒','降臨','不朽','寂滅']
			},
			title: { monster: '敵人', elite: '精英', mini_boss: '小頭目', boss: '頭目' }
		},
		'en': {
			monster: {
				prefixes: ['Khufu','Anu','Set','Kaf','Nomu','Taru','Ham','Senu','Nafi','Sora','Kep','Mot','Sek','Bak','Tun'],
				suffixes: ['Guard','Warrior','Priest','Sentinel','Archer','Ranger','Mercenary','Rogue','Gravedigger','Patrol','Scout','Swordsman','Spearman','Blade','Fist'],
				adjectives: ['Dust','Blood-eye','Shade','Stoneborn','Nightwalker','Blind','Silent','Wilderness','Pale','Tattered','Bone','Lost','Broken','Whisper','Wandering'],
				epithets: ['Wanderer','Sentinel','Wraith','Hunter','Watcher','Scavenger','Forsaken','Remnant']
			},
			elite: {
				prefixes: ['Ra','Horus','Set','Amon','Met','Isis','Nephthys','Bast','Khet','Seli','Sobek','Mut','Sekhmet','Bes','Khepri'],
				suffixes: ['Enforcer','Inquisitor','Warden','Plunderer','Warlock','Cleric','Justiciar','Commander','Conqueror','Avenger','Executioner','Warlord','Blood Guard','Shadow Blade','Iron Guard'],
				adjectives: ['Rage','Gold-plate','Flame','Frost','Burning','Bone-whisper','Ancient','Blood Moon','Nether','Steel','Crimson','Shadow','Doom','Thunder','Storm'],
				epithets: ['Conqueror','Avenger','Destroyer','Slayer','Judge','Punisher','Fury','Annihilator']
			},
			mini_boss: {
				prefixes: ['Osiris','Anubis','Thoth','Ra','Horus','Set','Ptah','Aten','Geb','Nut','Shu','Tefnut','Apophis','Sobek','Sekhmet'],
				suffixes: ['Overlord','Lord','Emperor','Sovereign','Tyrant','Demon King','High Lord','Grandmaster','War God','Arbiter','Annihilator','Butcher','Archfiend','Blood King','Dark Lord'],
				adjectives: ['Immortal','Eternal','Supreme','Ultimate','Doom','Apocalypse','Abyssal','Infernal','Divine Wrath','World-ender','Godslayer','Heaven-breaker','Earth-shatterer','Corrupted','Fallen'],
				epithets: ['Undying','Everlasting','Devourer','Awakened','Sovereign','Ender','Monarch','Despot']
			},
			title: { monster: 'Enemy', elite: 'Elite', mini_boss: 'Mini-Boss', boss: 'Boss' }
		},
		'fr': {
			monster: {
				prefixes: ['Khufu','Anu','Set','Kaf','Nomu','Taru','Ham','Senu','Nafi','Sora','Kep','Mot','Sek','Bak','Tun'],
				suffixes: ['Garde','Guerrier','Prêtre','Sentinelle','Archer','Rôdeur','Mercenaire','Voleur','Fossoyeur','Patrouille','Éclaireur','Épéiste','Lancier','Lame','Poing'],
				adjectives: ['Poussière','Œil-sang','Ombre','Pierre-né','Marcheur-nuit','Aveugle','Silencieux','Sauvage','Pâle','Délabré','Os','Perdu','Brisé','Murmure','Errant'],
				epithets: ['Vagabond','Sentinelle','Spectre','Chasseur','Veilleur','Charognard','Abandonné','Vestige']
			},
			elite: {
				prefixes: ['Ra','Horus','Set','Amon','Met','Isis','Nephthys','Bast','Khet','Seli','Sobek','Mut','Sekhmet','Bes','Khepri'],
				suffixes: ['Exécuteur','Inquisiteur','Gardien','Pilleur','Sorcier','Clerc','Justicier','Commandant','Conquérant','Vengeur','Bourreau','Seigneur','Garde-sang','Lame-ombre','Garde-fer'],
				adjectives: ['Rage','Plaqué-or','Flamme','Givre','Brûlant','Murmure-os','Ancien','Lune-sang','Néant','Acier','Cramoisi','Ombre','Fléau','Tonnerre','Tempête'],
				epithets: ['Conquérant','Vengeur','Destructeur','Tueur','Juge','Punisseur','Furie','Annihilateur']
			},
			mini_boss: {
				prefixes: ['Osiris','Anubis','Thoth','Ra','Horus','Set','Ptah','Aten','Geb','Nout','Shou','Tefnout','Apophis','Sobek','Sekhmet'],
				suffixes: ['Suzerain','Seigneur','Empereur','Souverain','Tyran','Roi-démon','Haut-seigneur','Grand-maître','Dieu-guerre','Arbitre','Annihilateur','Boucher','Archidémon','Roi-sang','Seigneur-noir'],
				adjectives: ['Immortel','Éternel','Suprême','Ultime','Fléau','Apocalypse','Abyssal','Infernal','Colère-divine','Fin-monde','Tueur-dieu','Briseur-ciel','Fracasseur-terre','Corrompu','Déchu'],
				epithets: ['Immortel','Éternel','Dévoreur','Éveillé','Souverain','Finisseur','Monarque','Despote']
			},
			title: { monster: 'Ennemi', elite: 'Élite', mini_boss: 'Mini-boss', boss: 'Boss' }
		}
	};

	const langPool = pools[lang] || pools['zh-TW'];
	const typePool = langPool[type] || langPool.monster;

	// 隨機抽取
	const p = typePool.prefixes[Math.floor(Math.random() * typePool.prefixes.length)];
	const s = typePool.suffixes[Math.floor(Math.random() * typePool.suffixes.length)];
	const a = typePool.adjectives[Math.floor(Math.random() * typePool.adjectives.length)];
	const e = typePool.epithets[Math.floor(Math.random() * typePool.epithets.length)];

	const title = langPool.title[type] || langPool.title.monster;

	// 多樣化命名樣式，根據語言使用不同標點與格式
	const patterns = (lang === 'en' || lang === 'fr') ? [
		() => `${p} ${s} ${title}`,
		() => `${a} ${p} ${s}`,
		() => `${p} ${s} the ${e}`,
		() => `${p} ${s}, ${a}`,
		() => `${p} ${s} (${e})`
	] : [
		() => `${p}${s} ${title}`,
		() => `${a}${p}${s}`,
		() => `${p}${s}·${e}`,
		() => `${p}${s}，${a}之名`,
		() => `${p}${s} ${title}（${e}）`
	];

	// 提高精英/頭目產生更霸氣名稱的機率
	let choiceIndex = Math.floor(Math.random() * patterns.length);
	if (type === 'elite' && Math.random() < 0.6) {
		choiceIndex = 2 + Math.floor(Math.random() * (patterns.length - 2));
	} else if (type === 'mini_boss' && Math.random() < 0.7) {
		choiceIndex = Math.max(0, patterns.length - 2) + Math.floor(Math.random() * 2);
	}

	return patterns[choiceIndex]();
}
