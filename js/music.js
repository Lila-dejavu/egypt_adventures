// ===== 音樂系統 =====
const MusicSystem = {
	audioContext: null,
	isPlaying: false,
	volume: 0.5,
	currentNote: null,
	isEnabled: false,
	currentTrack: 'exploration', // 'exploration' 或 'battle'

	// ABC 記譜 - 探索音樂
	explorationMusic: `
X:30
T:Egypt_Stage_Full_with_Pungi_32bars
M:4/4
L:1/8
Q:160
K:Aphr

V:Lead clef=treble
V:Harmony clef=treble
V:Pungi clef=treble
V:Bass clef=bass
V:Drums clef=perc

%%score (Lead Harmony Pungi Bass Drums)

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
% --- LEAD（原曲主旋律） ---
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
V:Lead
% Section A (1–8)
A4 C2 D2 | E4 F2 E2 | A4 G2 F2 | E4 C2 B,2 |
A4 C2 D2 | E4 F2 A2 | G4 F2 E2 | A6 z2 |
% Section B (9–16)
C'4 B2 A2 | G4 F2 E2 | F4 E2 D2 | C4 B,2 A,2 |
A4 C2 D2 | E4 F2 E2 | G4 F2 E2 | A6 z2 |
% Section C (17–24)
E4 F2 G2 | A4 G2 F2 | C'4 B2 A2 | G4 F2 E2 |
D4 C2 B,2 | A,4 B,2 C2 | D4 E2 F2 | G6 z2 |
% Section D (25–32)
A4 C2 D2 | E4 F2 E2 | A4 G2 F2 | E4 C2 B,2 |
A4 C2 E2 | F4 G2 A2 | G4 F2 E2 | A8 ||

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
% --- HARMONY（和聲＋第二旋律） ---
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
V:Harmony
% Section A
E2 A2 G2 A2 | F4 E2 D2 | E2 G2 A2 B2 | A4 G2 F2 |
A2 A2 F2 A2 | G4 F2 E2 | C'4 B2 A2 | G6 z2 |
% Section B
A2 G2 F2 E2 | D4 C2 B,2 | E2 G2 C'2 B2 | A4 G2 E2 |
C'2 B2 A2 G2 | F2 E2 D2 C2 | E2 F2 G2 A2 | C'6 z2 |
% Section C
A2 B2 C'2 D'2 | E'4 D'2 C'2 | C'2 B2 A2 G2 | F4 E2 D2 |
E2 A2 C'2 B2 | A4 G2 F2 | E2 G2 A2 B2 | C'4 B2 A2 |
% Section D
E2 A2 G2 A2 | F4 E2 D2 | E2 G2 A2 B2 | A4 G2 F2 |
A2 C'2 B2 A2 | G2 F2 E2 D2 | F2 E2 D2 C2 | A8 ||

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
% --- PUNGI（蛇魅笛） ---
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
V:Pungi
% Section A (1–8)
A2 ^B2 C'2 A2 | C'3 D' C'2 A2 | G2 A2 C'2 B2 | A4 G2 F2 |
A2 C'2 A2 C'2 | D'3 C' B2 A2 | G2 A2 F2 G2 | A8 |
% Section B (9–16)
C'4 B2 A2 | G2 A2 C'2 B2 | A4 G2 F2 | E4 F2 G2 |
A2 C'2 B2 A2 | C'4 D'2 C'2 | B2 C'2 D'2 E'2 | A8 |
% Section C (17–24)
E'2 D'2 C'2 B2 | A4 ^G2 A2 | C'2 B2 A2 G2 | F2 G2 A2 F2 |
E2 A2 C'2 B2 | A3 ^G A2 F2 | G2 A2 B2 C'2 | A8 |
% Section D (25–32)
A2 C'2 A2 C'2 | D'3 C' B2 A2 | G2 A2 C'2 B2 | A4 G2 F2 |
A2 C'2 B2 A2 | G2 F2 E2 D2 | F2 E2 D2 C2 | A8 ||

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
% --- BASS（16-bit Saw Bass） ---
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
V:Bass
% Section A
[A,2 A2] [A,2 A2] | [D2 D2] [C2 C2] |
[A,2 A2] [C2 C2] | [D2 D2] [E2 E2] |
[F2 F2] [E2 E2] | [A,2 A2] [G2 G2] |
[F2 F2] [E2 E2] | [A,4 A,4] |
% Section B
[A,2 A2] [A,2 A2] | [D2 D2] [C2 C2] |
[A,2 A2] [C2 C2] | [D2 D2] [E2 E2] |
[F2 F2] [E2 E2] | [A,2 A2] [G2 G2] |
[F2 F2] [E2 E2] | [A,4 A,4] |
% Section C
[A,2 A2] [A,2 A2] | [D2 D2] [C2 C2] |
[A,2 A2] [C2 C2] | [D2 D2] [E2 E2] |
[F2 F2] [E2 E2] | [A,2 A2] [G2 G2] |
[F2 F2] [E2 E2] | [A,4 A,4] |
% Section D
[A,2 A2] [A,2 A2] | [D2 D2] [C2 C2] |
[A,2 A2] [C2 C2] | [D2 D2] [E2 E2] |
[F2 F2] [E2 E2] | [A,2 A2] [G2 G2] |
[F2 F2] [E2 E2] | [A,4 A,4] ||

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
% --- DRUMS（SNES/Genesis 風節奏） ---
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
V:Drums
% Bass drum = C, Snare = X, Hi-hat = ^
[C2 ^z C2 ^z] | [X2 ^z X2 ^z] |
[C2 ^C ^C C] | [X2 ^z X2 ^z] |
[C2 ^z C2 ^z] | [X2 ^z X2 ^z] |
[C2 ^C ^C C] | [X2 ^z X2 ^z] |
% repeat for all 32 bars
[C2 ^z C2 ^z] | [X2 ^z X2 ^z] |
[C2 ^C ^C C] | [X2 ^z X2 ^z] |
[C2 ^z C2 ^z] | [X2 ^z X2 ^z] |
[C2 ^C ^C C] | [X2 ^z X2 ^z] ||
`,

	// ABC 記譜 - 戰鬥音樂（完整四聲部編制）
	battleMusic: `
X:102
T:Egypt_Stage_Battle
%%section BATTLE
M:4/4
L:1/8
Q:188
K:Aphr

V:Lead clef=treble
V:Harmony clef=treble
V:Bass clef=bass
V:Drums clef=perc
%%score (Lead Harmony Bass Drums)

% --- LEAD ---
V:Lead
A2 C2 A2 C2 | D4 C2 B,2 | A2 C2 D2 E2 | F4 E2 D2 |
C2 E2 C2 E2 | F4 E2 D2 | A4 G2 F2 | E6 z2 |
C'2 B2 A2 G2 | F4 E2 D2 | C2 E2 A2 G2 | F4 E2 C2 |
A2 C'2 A2 G2 | F2 E2 D2 C2 | B,2 C2 D2 E2 | A6 z2 |
E2 F2 G2 A2 | C'4 B2 A2 | A2 G2 F2 E2 | D4 C2 B,2 |
A2 C2 A2 C2 | D4 C2 B,2 | A2 C2 D2 E2 | F4 E2 D2 |
A4 C2 D2 | E4 F2 E2 | A4 G2 F2 | E4 C2 B,2 |
A4 C2 E2 | F4 G2 A2 | G4 F2 E2 | A8 ||

% --- HARMONY ---
V:Harmony
E2 A2 G2 A2 | F4 E2 D2 | E2 G2 A2 B2 | A4 G2 F2 |
A2 A2 F2 A2 | G4 F2 E2 | C'4 B2 A2 | G6 z2 |
A2 G2 F2 E2 | D4 C2 B,2 | E2 G2 C'2 B2 | A4 G2 E2 |
C'2 B2 A2 G2 | F2 E2 D2 C2 | E2 F2 G2 A2 | C'6 z2 |
A2 B2 C'2 D'2 | E'4 D'2 C'2 | C'2 B2 A2 G2 | F4 E2 D2 |
E2 A2 C'2 B2 | A4 G2 F2 | E2 G2 A2 B2 | C'4 B2 A2 |
E2 A2 G2 A2 | F4 E2 D2 | E2 G2 A2 B2 | A4 G2 F2 |
A2 C'2 B2 A2 | G2 F2 E2 D2 | F2 E2 D2 C2 | A8 ||

% --- BASS ---
V:Bass
[A,2 A2] [A,2 A2] | [D2 D2] [C2 C2] |
[A,2 A2] [C2 C2] | [D2 D2] [E2 E2] |
[F2 F2] [E2 E2] | [A,2 A2] [G2 G2] |
[F2 F2] [E2 E2] | [A,4 A,4] |
[A,2 A2] [A,2 A2] | [D2 D2] [C2 C2] |
[A,2 A2] [C2 C2] | [D2 D2] [E2 E2] |
[F2 F2] [E2 E2] | [A,2 A2] [G2 G2] |
[F2 F2] [E2 E2] | [A,4 A,4] ||

% --- DRUMS ---
V:Drums
[C2 ^z C2 ^z] | [X2 ^z X2 ^z] |
[C2 ^C ^C C] | [X2 ^z X2 ^z] |
[C2 ^z C2 ^z] | [X2 ^z X2 ^z] |
[C2 ^C ^C C] | [X2 ^z X2 ^z] |
[C2 ^z C2 ^z] | [X2 ^z X2 ^z] |
[C2 ^C ^C C] | [X2 ^z X2 ^z] |
[C2 ^z C2 ^z] | [X2 ^z X2 ^z] |
[C2 ^C ^C C] | [X2 ^z X2 ^z] ||
`,

	// ABC 記譜 - 勝利音樂（埃及風格勝利號角）
	victoryMusic: `
X:20
T:Egypt_Stage_Victory
M:4/4
L:1/8
Q:140
K:Aphr
% Voice: Lead (弦樂主旋律 - 高亢勝利號角)
V:1 clef=treble name="Lead"
"A"e4 ^d2 e2 | "^A"f4 e2 d2 | "A"c4 B2 A2 | "^A"A6 z2 |
% Voice: Harmony (豎笛副旋律 - 和聲支撐)
V:2 clef=treble name="Harmony"
"A"c4 B2 c2 | "^A"d4 c2 B2 | "A"A4 G2 F2 | "^A"E6 z2 |
% Voice: Pungi (印度蛇笛 - 埃及特色音色)
V:3 clef=treble name="Pungi"
"A"A2 c2 e2 c2 | "^A"A2 f2 e2 d2 | "A"c2 A2 G2 F2 | "^A"E4 z4 |
% Voice: Bass (低音銅管 - 厚重底層)
V:4 clef=bass name="Bass"
"A"A,4 A,2 A,2 | "^A"A,4 A,2 A,2 | "A"A,4 A,2 A,2 | "^A"A,6 z2 |
% Voice: Drums (勝利鼓點 - 慶祝節奏)
V:5 clef=percussion name="Drums"
[F,4C,4] [F,2C,2] [F,2C,2] | [F,4C,4] [F,2C,2] [F,2C,2] | [F,4C,4] [F,2C,2] [F,2C,2] | [F,6C,6] z2 ||
`,

	// 音符頻率對照表（基於 A Phrygian Dominant 音階）
	noteFrequencies: {
		// 低八度 (大寫 + 逗號)
		'A,': 110.00, 'B,': 123.47, 'C,': 65.41, 'D,': 73.42, 'E,': 82.41, 'F,': 87.31, 'G,': 98.00,
		// 中八度 (大寫字母)
		'A': 220.00, 'B': 246.94, 'C': 261.63, 'D': 293.66, 'E': 329.63, 'F': 349.23, 'G': 392.00,
		// 高八度 (小寫字母)
		'a': 440.00, 'b': 493.88, 'c': 523.25, 'd': 587.33, 'e': 659.25, 'f': 698.46, 'g': 783.99,
		// 更高八度 (小寫 + 撇號)
		"c'": 1046.50, "d'": 1174.66, "e'": 1318.51, "f'": 1396.91, "g'": 1567.98, "a'": 880.00, "b'": 987.77,
		// 休止符
		'z': 0
	},

	init() {
		// 初始化 Web Audio API
		if (!this.audioContext) {
			this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
		}

		// 從 localStorage 讀取設定
		const saved = localStorage.getItem('musicEnabled');
		const savedVolume = localStorage.getItem('musicVolume');
		this.isEnabled = saved === 'true';
		this.volume = savedVolume ? parseFloat(savedVolume) : 0.5;

		// 解析三種音樂
		this.parsedExploration = this.parseABC(this.explorationMusic);
		this.parsedBattle = this.parseABC(this.battleMusic);
		this.parsedVictory = this.parseABC(this.victoryMusic);
		this.parsedMusic = this.parsedExploration; // 預設使用探索音樂

		this.updateUI();
	},

	switchTrack(trackName) {
		if (trackName === this.currentTrack) return;

		const wasPlaying = this.isPlaying;

		// 停止當前音樂
		this.stop();

		// 切換音軌
		this.currentTrack = trackName;
		if (trackName === 'battle') {
			this.parsedMusic = this.parsedBattle;
			console.log('🎵 Switched to battle music');
		} else if (trackName === 'victory') {
			this.parsedMusic = this.parsedVictory;
			console.log('🎵 Switched to victory music');
		} else {
			this.parsedMusic = this.parsedExploration;
			console.log('🎵 Switched to exploration music');
		}

		// 如果之前在播放，繼續播放新音軌
		if (wasPlaying && this.isEnabled) {
			setTimeout(() => {
				this.play();
			}, 100);
		}
	},

	// 播放勝利音樂（單次播放，結束後切換回探索音樂）
	playVictory(callback) {
		if (!this.isEnabled) {
			if (callback) callback();
			return;
		}

		// 停止當前音樂
		this.stop();

		// 設定勝利音樂
		this.currentTrack = 'victory';
		this.parsedMusic = this.parsedVictory;
		this.isPlaying = true;
		this.currentNoteIndex = 0;

		console.log('🎵 Playing victory music');

		// 播放勝利音樂
		this.playNextNote();

		// 計算勝利音樂總時長
		const totalDuration = this.parsedVictory.notes.reduce((sum, note) => sum + note.duration, 0);

		// 音樂結束後切換回探索音樂
		setTimeout(() => {
			this.stop();
			this.switchTrack('exploration');
			if (callback) callback();
		}, totalDuration * 1000 + 500); // 多加0.5秒緩衝
	},

	parseABC(abc) {
		const lines = abc.split('\n').filter(line => !line.trim().startsWith('%') && line.trim().length > 0);
		const notes = [];
		let tempo = 120; // 預設速度
		let defaultLength = 8; // 預設八分音符

		// 解析標頭資訊
		for (const line of lines) {
			if (line.startsWith('Q:')) {
				const match = line.match(/Q:(\d+)/);
				if (match) tempo = parseInt(match[1]);
			}
			if (line.startsWith('L:')) {
				const match = line.match(/L:1\/(\d+)/);
				if (match) defaultLength = parseInt(match[1]);
			}
		}

		// 解析音符行
		for (const line of lines) {
			if (line.startsWith('X:') || line.startsWith('T:') || line.startsWith('M:') ||
			    line.startsWith('L:') || line.startsWith('Q:') || line.startsWith('K:') ||
			    line.startsWith('[V:') || line.includes('---')) {
				continue;
			}

			// 移除小節線和其他符號
			const cleanLine = line.replace(/\|/g, ' ').replace(/:/g, '').trim();
			if (!cleanLine) continue;

			// 解析音符（支援 ABC 記譜中的 C' 高音表示法）
			const tokens = cleanLine.match(/([A-Ga-g][',]*|z)(\d*)/g);
			if (!tokens) continue;

			for (const token of tokens) {
				const match = token.match(/([A-Ga-g][',]*|z)(\d*)/);
				if (match) {
					let noteName = match[1];
					let duration = match[2] ? parseInt(match[2]) : 1;

					// 計算實際持續時間（秒）
					const beatDuration = 60 / tempo; // 一拍的秒數
					const noteDuration = (beatDuration * 4 * duration) / defaultLength;

					const frequency = this.noteFrequencies[noteName] || 0;

					notes.push({
						note: noteName,
						duration: noteDuration,
						frequency: frequency
					});
				}
			}
		}

		return { notes, tempo };
	},

	toggle() {
		this.isEnabled = !this.isEnabled;
		localStorage.setItem('musicEnabled', this.isEnabled);

		if (this.isEnabled) {
			// 確保 AudioContext 已恢復（瀏覽器安全要求）
			if (this.audioContext.state === 'suspended') {
				this.audioContext.resume().then(() => {
					this.play();
				});
			} else {
				this.play();
			}
		} else {
			this.stop();
		}

		this.updateUI();
	},

	setVolume(value) {
		this.volume = value / 100;
		localStorage.setItem('musicVolume', this.volume);
		// 如果正在播放，更新音量（需考慮音軌類型的音量倍增器）
		if (this.currentNote && this.currentNote.gainNode) {
			const trackVolumeMultiplier = this.currentTrack === 'battle' ? 0.5 : 1.0;
			const finalVolume = this.volume * trackVolumeMultiplier;
			this.currentNote.gainNode.gain.value = finalVolume;
		}
	},

	play() {
		if (!this.isEnabled || this.isPlaying || !this.parsedMusic) return;
		this.isPlaying = true;
		this.currentNoteIndex = 0;
		this.playNextNote();
		console.log('Music playing... Total notes:', this.parsedMusic.notes.length);
	},

	playNextNote() {
		if (!this.isPlaying || !this.parsedMusic) return;

		const notes = this.parsedMusic.notes;
		if (this.currentNoteIndex >= notes.length) {
			// 樂曲結束，循環播放
			this.currentNoteIndex = 0;
		}

		const noteData = notes[this.currentNoteIndex];
		this.currentNoteIndex++;

		if (noteData.frequency > 0) {
			// 播放音符
			this.playTone(noteData.frequency, noteData.duration);
		}

		// 安排下一個音符
		this.nextNoteTimeout = setTimeout(() => {
			this.playNextNote();
		}, noteData.duration * 1000);
	},

	playTone(frequency, duration) {
		try {
			const oscillator = this.audioContext.createOscillator();
			const gainNode = this.audioContext.createGain();

			oscillator.connect(gainNode);
			gainNode.connect(this.audioContext.destination);

			// 根據音軌選擇音色
			if (this.currentTrack === 'battle') {
				// 戰鬥音樂：使用方波創造更尖銳、激烈的音色
				oscillator.type = 'square';
			} else {
				// 探索音樂：使用三角波創造較柔和的音色
				oscillator.type = 'triangle';
			}

			oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);

			// 設定音量包絡（ADSR）
			const now = this.audioContext.currentTime;
			const attackTime = this.currentTrack === 'battle' ? 0.01 : 0.02;
			const releaseTime = this.currentTrack === 'battle' ? 0.05 : 0.1;

			// 根據音軌類型調整音量
			const trackVolumeMultiplier = this.currentTrack === 'battle' ? 0.5 : 1.0;
			const finalVolume = this.volume * trackVolumeMultiplier;

			gainNode.gain.setValueAtTime(0, now);
			gainNode.gain.linearRampToValueAtTime(finalVolume, now + attackTime);
			gainNode.gain.setValueAtTime(finalVolume, now + duration - releaseTime);
			gainNode.gain.linearRampToValueAtTime(0, now + duration);

			oscillator.start(now);
			oscillator.stop(now + duration);

			this.currentNote = { oscillator, gainNode };
		} catch (e) {
			console.error('Error playing tone:', e);
		}
	},

	stop() {
		this.isPlaying = false;

		if (this.nextNoteTimeout) {
			clearTimeout(this.nextNoteTimeout);
			this.nextNoteTimeout = null;
		}

		if (this.currentNote) {
			try {
				if (this.currentNote.oscillator) {
					this.currentNote.oscillator.stop();
				}
			} catch (e) {
				// 音符可能已經停止
			}
			this.currentNote = null;
		}

		console.log('Music stopped');
	},

	updateUI() {
		const toggleBtn = document.getElementById('music-toggle');
		const volumeSlider = document.getElementById('volume-slider');
		const volumeDisplay = document.getElementById('volume-display');

		if (toggleBtn) {
			if (this.isEnabled) {
				toggleBtn.innerHTML = '🔊 <span data-i18n="musicOn">音樂：開啟</span>';
				toggleBtn.style.background = '#d4edda';
			} else {
				toggleBtn.innerHTML = '🔇 <span data-i18n="musicOff">音樂：關閉</span>';
				toggleBtn.style.background = '#f4e4c1';
			}
		}

		if (volumeSlider) {
			volumeSlider.value = this.volume * 100;
		}

		if (volumeDisplay) {
			volumeDisplay.textContent = Math.round(this.volume * 100) + '%';
		}
	}
};
