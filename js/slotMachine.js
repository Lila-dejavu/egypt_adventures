// ===== Slot Machine Module =====
// Handles slot machine functionality: spinning, stopping, reel management

/**
 * Slot Machine Manager
 * Dependencies: SYMBOLS (from data.js), Utils (from Utils.js), showMessage (global)
 */

// Module state
let _reels = [];
let _reelState = [];
let _spinBtn = null;
let _stopBtn = null;
let _game = null;

/**
 * Initialize the slot machine with DOM elements
 * @param {HTMLElement[]} reels - Array of reel elements
 * @param {HTMLElement} spinBtn - Spin button element
 * @param {HTMLElement} stopBtn - Stop button element
 * @param {Object} game - Game instance reference
 */
function initSlotMachine(reels, spinBtn, stopBtn, game) {
	_reels = reels;
	_spinBtn = spinBtn;
	_stopBtn = stopBtn;
	_game = game;
	_reelState = reels.map(() => ({ interval: null, spinning: false }));
}

/**
 * Populate reels with symbol strips
 */
function populateReels() {
	for (let r = 0; r < _reels.length; r++) {
		const strip = document.createElement('div');
		strip.className = 'strip';

		// Repeat SYMBOLS for smooth scrolling
		const repeats = 8;
		for (let i = 0; i < repeats; i++) {
			for (const s of SYMBOLS) {
				const el = document.createElement('div');
				el.className = 'symbol';
				el.textContent = s;
				strip.appendChild(el);
			}
		}

		_reels[r].innerHTML = '';
		_reels[r].appendChild(strip);

		// Initial position: start from middle group
		const symbolHeight = Utils.getSymbolHeight();
		const initialOffset = symbolHeight * SYMBOLS.length * 2;
		strip.style.transform = `translateY(-${initialOffset}px)`;
		strip.style.webkitTransform = `translateY(-${initialOffset}px)`;
	}
}

/**
 * Start spinning all reels
 */
function startSpin() {
	const symbolHeight = Utils.getSymbolHeight();

	for (let i = 0; i < _reels.length; i++) {
		const strip = _reels[i].querySelector('.strip');
		if (!strip) continue;

		_reelState[i].spinning = true;

		// Use requestAnimationFrame loop to change position
		let speed = 30 + Math.random() * 20; // px per frame-ish
		_reelState[i].anim = {
			pos: parseFloat(strip.style.transform.replace(/[^-0-9.]/g, '')) || 0,
			speed
		};

		const loop = () => {
			if (!_reelState[i].spinning) return;

			_reelState[i].anim.pos += _reelState[i].anim.speed;

			// When pos exceeds one full cycle, wrap around
			const totalHeight = SYMBOLS.length * symbolHeight * 8; // repeats
			if (_reelState[i].anim.pos >= totalHeight) {
				_reelState[i].anim.pos -= totalHeight;
			}

			strip.style.transform = `translateY(-${_reelState[i].anim.pos}px)`;
			strip.style.webkitTransform = `translateY(-${_reelState[i].anim.pos}px)`;
			_reelState[i].raf = requestAnimationFrame(loop);
		};

		_reelState[i].raf = requestAnimationFrame(loop);
	}
}

/**
 * Stop reels sequentially and return results
 */
function stopSequentially() {
	// Disable stop button, stop each reel in sequence
	if (_stopBtn) _stopBtn.disabled = true;

	const results = [];
	const targetSymbols = [];

	// Unified stop function ensuring precise symbol alignment
	const stopReel = (index, withAnimation = true) => {
		return new Promise((resolve) => {
			// Randomly select target symbol
			const targetSymbol = Utils.pickWeightedSymbol();
			targetSymbols[index] = targetSymbol;
			const strip = _reels[index].querySelector('.strip');

			// Stop spinning loop
			_reelState[index].spinning = false;
			if (_reelState[index].raf) cancelAnimationFrame(_reelState[index].raf);

			// Find target symbol index in SYMBOLS array
			const symbolIndex = SYMBOLS.indexOf(targetSymbol);
			if (symbolIndex === -1) {
				console.error(`Symbol ${targetSymbol} not found in SYMBOLS array`);
				resolve();
				return;
			}

			// Calculate target position (dynamic for different screen sizes)
			const symbolHeight = Utils.getSymbolHeight();
			const highlightTop = Utils.getHighlightTop();
			const singleBlock = SYMBOLS.length * symbolHeight;
			const targetCycle = 3; // Use 3rd cycle

			// Target position: align symbol top to highlight box top
			const targetPos = targetCycle * singleBlock + symbolIndex * symbolHeight - highlightTop;

			// Detect screen info
			const screenWidth = window.innerWidth;
			const isMobile = screenWidth <= 600;
			const isTinyScreen = screenWidth <= 400;

			console.log(`Reel ${index}: Target=${targetSymbol}, symbolIndex=${symbolIndex}, targetPos=${targetPos}px, symbolHeight=${symbolHeight}px, highlightTop=${highlightTop}px, mobile=${isMobile}, tiny=${isTinyScreen}, screenWidth=${screenWidth}`);

			if (withAnimation) {
				// First reel: with animation
				const currentPos = _reelState[index].anim ? _reelState[index].anim.pos : 0;
				const duration = 1000 + Math.random() * 500;
				const start = performance.now();

				const animate = (now) => {
					const t = Math.min(1, (now - start) / duration);
					const ease = 1 - Math.pow(1 - t, 3); // easeOutCubic
					const pos = currentPos + (targetPos - currentPos) * ease;
					strip.style.transform = `translateY(-${pos}px)`;
					strip.style.webkitTransform = `translateY(-${pos}px)`;

					if (t < 1) {
						requestAnimationFrame(animate);
					} else {
						// Animation complete, set precise position
						strip.style.transform = `translateY(-${targetPos}px)`;
						strip.style.webkitTransform = `translateY(-${targetPos}px)`;
						results[index] = targetSymbol;
						console.log(`Reel ${index}: Animation complete, final position=${targetPos}px, symbol=${targetSymbol}`);
						setTimeout(resolve, 50);
					}
				};
				requestAnimationFrame(animate);
			} else {
				// Second, third reels: quick stop
				strip.style.transition = 'transform 0.3s ease-out';
				strip.style.webkitTransition = '-webkit-transform 0.3s ease-out';
				strip.style.transform = `translateY(-${targetPos}px)`;
				strip.style.webkitTransform = `translateY(-${targetPos}px)`;

				setTimeout(() => {
					strip.style.transition = '';
					strip.style.webkitTransition = '';
					strip.style.transform = `translateY(-${targetPos}px)`;
					strip.style.webkitTransform = `translateY(-${targetPos}px)`;
					results[index] = targetSymbol;
					console.log(`Reel ${index}: Quick stop complete, final position=${targetPos}px, symbol=${targetSymbol}`);
					resolve();
				}, 350);
			}
		});
	};

	// Stop three reels sequentially
	stopReel(0, true).then(() => {
		return Promise.all([
			stopReel(1, false),
			stopReel(2, false)
		]);
	}).then(() => {
		// Wait for DOM to fully update
		return new Promise(resolve => setTimeout(resolve, 100));
	}).then(() => {
		// Verify results and display position info
		console.log('=== Final verification ===');
		let positionInfo = '';

		for (let i = 0; i < 3; i++) {
			const strip = _reels[i].querySelector('.strip');
			if (strip) {
				// Get actual computed transform value
				const comp = window.getComputedStyle(strip).transform || strip.style.transform || '';
				let currentPos = 0;

				if (comp.startsWith('matrix3d')) {
					const nums = comp.match(/matrix3d\(([^)]+)\)/);
					if (nums && nums[1]) {
						const vals = nums[1].split(',').map(s => parseFloat(s.trim()));
						if (vals.length >= 14 && !isNaN(vals[13])) currentPos = Math.round(Math.abs(vals[13]));
					}
				} else if (comp.startsWith('matrix')) {
					const nums = comp.match(/matrix\(([^)]+)\)/);
					if (nums && nums[1]) {
						const vals = nums[1].split(',').map(s => parseFloat(s.trim()));
						if (vals.length >= 6 && !isNaN(vals[5])) currentPos = Math.round(Math.abs(vals[5]));
					}
				} else {
					const m = comp.match(/-?[\d.]+/g);
					if (m && m.length > 0) {
						currentPos = parseFloat(m[m.length - 1]);
						currentPos = Math.abs(currentPos);
					} else {
						currentPos = 0;
					}
				}

				const symbolHeight = Utils.getSymbolHeight();
				const highlightTop = Utils.getHighlightTop();
				const symbolIndexInView = (Math.round((currentPos + highlightTop) / symbolHeight) % SYMBOLS.length + SYMBOLS.length) % SYMBOLS.length;
				const expectedSymbol = SYMBOLS[symbolIndexInView];

				console.log(`Reel ${i}: pos=${currentPos}px, symbolHeight=${symbolHeight}px, highlightTop=${highlightTop}px, symbolIndex=${symbolIndexInView}, expected=${expectedSymbol}, actual=${results[i]}`);
				positionInfo += `\n輪${i+1}: ${currentPos}px (H:${symbolHeight}) → ${results[i]}`;

				// Check alignment
				const alignedPos = Math.round((currentPos + highlightTop) / symbolHeight) * symbolHeight - highlightTop;
				if (Math.abs(currentPos - alignedPos) > 3) {
					console.warn(`Reel ${i}: Misaligned! Current=${currentPos}, should be=${alignedPos}, symbolHeight=${symbolHeight}`);
				}
			}
		}

		// Ensure results array is complete
		console.log('Final results array:', results);
		if (results.length !== 3 || results.some(r => !r)) {
			console.error('Results array is incomplete:', results);
			for (let i = 0; i < 3; i++) {
				if (!results[i]) results[i] = targetSymbols[i] || '⚔️';
			}
		}

		showMessage(`插槽結果： ${results.join(' | ')}`);

		// Pass results to game logic for processing
		try {
			if (_game) _game.applySlotResults(results);
		} catch (e) {
			console.error(e);
		}

		// Check if battle has ended, stop auto-spin
		if (_game && !_game.inBattle) {
			try { stopAutoSpinLoop(); } catch(e) {}
		}

		// Enable spin button (if still in battle)
		if (_game && _game.inBattle && _spinBtn) {
			_spinBtn.disabled = false;
		}
		if (_stopBtn) _stopBtn.disabled = true;
	});
}

// ===== Auto-spin control =====
let autoSpin = false;
let autoSpinTimer = null;
let autoSpinTimer2 = null;
let autoSpinActive = false;

/**
 * Stop auto-spin loop
 */
function stopAutoSpinLoop() {
	autoSpin = false;
	if (autoSpinTimer) { clearTimeout(autoSpinTimer); autoSpinTimer = null; }
	if (autoSpinTimer2) { clearTimeout(autoSpinTimer2); autoSpinTimer2 = null; }
	autoSpinActive = false;

	const btn = document.getElementById('auto-spin-btn');
	if (btn) {
		btn.textContent = '自動旋轉';
		btn.style.background = '';
		btn.classList.remove('active');
	}
}

/**
 * Run one auto-spin cycle
 */
function runAutoCycle() {
	// Check battle state and autoSpin flag before each execution
	if (!autoSpin || !_game || !_game.inBattle) {
		autoSpinActive = false;
		stopAutoSpinLoop();
		return;
	}

	if (_stopBtn && !_stopBtn.disabled) {
		// Currently stopping; schedule next attempt
		autoSpinTimer = setTimeout(runAutoCycle, 300);
		return;
	}

	if (_spinBtn && !_spinBtn.disabled && _game.inBattle) {
		// Start manual click flow (recheck battle state)
		_spinBtn.click();
		const delay = 800 + Math.floor(Math.random() * 600);

		autoSpinTimer = setTimeout(() => {
			// Recheck if should stop
			if (!autoSpin || !_game.inBattle) {
				stopAutoSpinLoop();
				return;
			}
			// Ensure still in battle before clicking stop
			if (_stopBtn && !_stopBtn.disabled && _game.inBattle) _stopBtn.click();

			// Schedule next cycle after pause
			autoSpinTimer2 = setTimeout(() => {
				// Third check
				if (!autoSpin || !_game.inBattle) {
					stopAutoSpinLoop();
					return;
				}
				runAutoCycle();
			}, 400);
		}, delay);
	} else {
		// Cannot spin or not in battle, stop auto-spin
		if (!_game.inBattle) {
			stopAutoSpinLoop();
		} else {
			// Retry later
			autoSpinTimer = setTimeout(runAutoCycle, 500);
		}
	}
}

/**
 * Start auto-spin loop
 */
function startAutoSpinLoop() {
	if (autoSpinActive) return;
	autoSpinActive = true;
	runAutoCycle();
}

/**
 * Toggle auto-spin state
 * @returns {boolean} New auto-spin state
 */
function toggleAutoSpin() {
	autoSpin = !autoSpin;
	if (autoSpin) {
		startAutoSpinLoop();
	} else {
		stopAutoSpinLoop();
	}
	return autoSpin;
}

/**
 * Get current auto-spin state
 * @returns {boolean} Current auto-spin state
 */
function isAutoSpinning() {
	return autoSpin;
}

// Expose functions globally for compatibility
window.initSlotMachine = initSlotMachine;
window.populateReels = populateReels;
window.startSpin = startSpin;
window.stopSequentially = stopSequentially;
window.stopAutoSpinLoop = stopAutoSpinLoop;
window.startAutoSpinLoop = startAutoSpinLoop;
window.toggleAutoSpin = toggleAutoSpin;
window.isAutoSpinning = isAutoSpinning;
