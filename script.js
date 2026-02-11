'use strict';
console.clear();

// This is a prime example of what starts out as a simple project
// and snowballs way beyond its intended size. It's a little clunky
// reading/working on this single file, but here it is anyways :)

const IS_MOBILE = window.innerWidth <= 640;
const IS_DESKTOP = window.innerWidth > 800;
const IS_HEADER = IS_DESKTOP && window.innerHeight < 300;
// Detect high end devices. This will be a moving target.
const IS_HIGH_END_DEVICE = (() => {
	const hwConcurrency = navigator.hardwareConcurrency;
	if (!hwConcurrency) {
		return false;
	}
	// Large screens indicate a full size computer, which often have hyper threading these days.
	// So a quad core desktop machine has 8 cores. We'll place a higher min threshold there.
	const minCount = window.innerWidth <= 1024 ? 4 : 8;
	return hwConcurrency >= minCount;
})();
// Prevent canvases from getting too large on ridiculous screen sizes.
// 8K - can restrict this if needed
const MAX_WIDTH = 7680;
const MAX_HEIGHT = 4320;
const GRAVITY = 0.9; // Acceleration in px/s
let simSpeed = 1;


// ============================================
// Real-time Year & Localized Greeting System
// ============================================

// Compute the "New Year" year.
// Jan 1-31 → current year; otherwise → next year.
function getNewYearYear() {
	const now = new Date();
	return now.getMonth() === 0 ? now.getFullYear() : now.getFullYear() + 1;
}

// Greeting dictionary: country code → localized "Happy New Year"
const NEW_YEAR_GREETINGS = {
	// East & Southeast Asia
	VN: 'Chúc Mừng Năm Mới',
	CN: '新年快乐',
	TW: '新年快樂',
	HK: '新年快樂',
	JP: '明けましておめでとうございます',
	KR: '새해 복 많이 받으세요',
	TH: 'สวัสดีปีใหม่',
	ID: 'Selamat Tahun Baru',
	MY: 'Selamat Tahun Baru',
	PH: 'Maligayang Bagong Taon',
	KH: 'រីករាយឆ្នាំថ្មី',
	MM: 'နှစ်သစ်ကူးမင်္ဂလာပါ',
	LA: 'ສະບາຍດີປີໃໝ່',
	SG: 'Happy New Year',
	// South Asia
	IN: 'नया साल मुबारक हो',
	PK: 'نیا سال مبارک ہو',
	BD: 'শুভ নববর্ষ',
	LK: 'සුභ අලුත් අවුරුද්දක් වේවා',
	NP: 'नयाँ वर्षको शुभकामना',
	// Middle East & Central Asia
	SA: 'سنة جديدة سعيدة',
	AE: 'سنة جديدة سعيدة',
	EG: 'سنة جديدة سعيدة',
	IQ: 'سنة جديدة سعيدة',
	IR: 'سال نو مبارک',
	TR: 'Mutlu Yıllar',
	IL: 'שנה טובה',
	// Europe — Western
	US: 'Happy New Year',
	GB: 'Happy New Year',
	AU: 'Happy New Year',
	NZ: 'Happy New Year',
	CA: 'Happy New Year',
	IE: 'Happy New Year',
	FR: 'Bonne Année',
	BE: 'Bonne Année',
	CH: 'Frohes Neues Jahr',
	DE: 'Frohes Neues Jahr',
	AT: 'Frohes Neues Jahr',
	ES: 'Feliz Año Nuevo',
	MX: 'Feliz Año Nuevo',
	AR: 'Feliz Año Nuevo',
	CO: 'Feliz Año Nuevo',
	CL: 'Feliz Año Nuevo',
	PE: 'Feliz Año Nuevo',
	VE: 'Feliz Año Nuevo',
	PT: 'Feliz Ano Novo',
	BR: 'Feliz Ano Novo',
	IT: 'Buon Anno',
	NL: 'Gelukkig Nieuwjaar',
	// Europe — Northern
	SE: 'Gott Nytt År',
	NO: 'Godt Nytt År',
	DK: 'Godt Nytår',
	FI: 'Hyvää Uutta Vuotta',
	IS: 'Gleðilegt Nýtt Ár',
	// Europe — Eastern
	RU: 'С Новым Годом',
	UA: 'З Новим Роком',
	PL: 'Szczęśliwego Nowego Roku',
	CZ: 'Šťastný Nový Rok',
	SK: 'Šťastný Nový Rok',
	HU: 'Boldog Új Évet',
	RO: 'Un An Nou Fericit',
	BG: 'Честита Нова Година',
	HR: 'Sretna Nova Godina',
	RS: 'Срећна Нова Година',
	SI: 'Srečno Novo Leto',
	// Europe — Other
	GR: 'Ευτυχισμένο το Νέο Έτος',
	// Africa
	NG: 'Happy New Year',
	ZA: 'Happy New Year',
	KE: 'Happy New Year',
	ET: 'እንኳን አዲስ ዓመት አደረሳችሁ',
	MA: 'سنة جديدة سعيدة',
	DZ: 'سنة جديدة سعيدة',
	TN: 'سنة جديدة سعيدة',
};

const DEFAULT_GREETING = 'Happy New Year';

let currentGreeting = DEFAULT_GREETING;
let currentNewYearYear = getNewYearYear();

function updateGreetingDisplay() {
	const text = currentGreeting + ' ' + currentNewYearYear;
	document.title = currentGreeting;
	const creditsEl = document.querySelector('.credits');
	if (creditsEl) creditsEl.textContent = text;
}

// Detect country via IP geolocation and set localized greeting
function detectAndSetGreeting() {
	fetch('https://ipwho.is/')
		.then(function(res) { return res.json(); })
		.then(function(data) {
			if (data && data.success !== false && data.country_code) {
				const code = data.country_code.toUpperCase();
				currentGreeting = NEW_YEAR_GREETINGS[code] || DEFAULT_GREETING;
			}
			updateGreetingDisplay();
		})
		.catch(function() {
			// Fallback to English on error
			updateGreetingDisplay();
		});
}

// Set initial greeting immediately (English), then refine after geolocation
updateGreetingDisplay();
detectAndSetGreeting();

// Midnight watcher — check every second if the year has changed
setInterval(function() {
	const newYear = getNewYearYear();
	if (newYear !== currentNewYearYear) {
		currentNewYearYear = newYear;
		updateGreetingDisplay();
		// Trigger a celebratory burst if the app is running
		if (typeof isRunning === 'function' && isRunning()) {
			setTimeout(function() { seqSmallBarrage(); }, 500);
		}
	}
}, 1000);


function getDefaultScaleFactor() {
	if (IS_MOBILE) return 0.9;
	if (IS_HEADER) return 0.75;
	return 1;
}

// Width/height values that take scale into account.
// USE THESE FOR DRAWING POSITIONS
let stageW, stageH;

// All quality globals will be overwritten and updated via `configDidUpdate`.
let quality = 1;
let isLowQuality = false;
let isNormalQuality = true;
let isHighQuality = false;

const QUALITY_LOW = 1;
const QUALITY_NORMAL = 2;
const QUALITY_HIGH = 3;

const SKY_LIGHT_NONE = 0;
const SKY_LIGHT_DIM = 1;
const SKY_LIGHT_NORMAL = 2;

const COLOR = {
	Red: '#ff0043',
	Green: '#14fc56',
	Blue: '#1e7fff',
	Purple: '#e60aff',
	Gold: '#ffbf36',
	White: '#ffffff'
};

// Special invisible color (not rendered, and therefore not in COLOR map)
const INVISIBLE = '_INVISIBLE_';

const PI_2 = Math.PI * 2;
const PI_HALF = Math.PI * 0.5;

// Stage.disableHighDPI = true;
const trailsStage = new Stage('trails-canvas');
const mainStage = new Stage('main-canvas');
const stages = [
	trailsStage,
	mainStage
];



// Fullscreen helpers, using Fscreen for prefixes.
// iOS Safari does NOT support the Fullscreen API (fscreen.fullscreenEnabled === false).
// We detect iOS and use alternative approaches: standalone mode detection + scroll trick.
const IS_IOS = /iPhone|iPad|iPod/.test(navigator.userAgent);
const IS_STANDALONE = window.navigator.standalone === true || window.matchMedia('(display-mode: standalone)').matches;

function fullscreenEnabled() {
	return fscreen.fullscreenEnabled;
}

function isFullscreen() {
	if (fscreen.fullscreenEnabled) {
		return !!fscreen.fullscreenElement;
	}
	// On iOS standalone (Add to Home Screen), consider it fullscreen
	if (IS_IOS && IS_STANDALONE) {
		return true;
	}
	return false;
}

// Attempt to toggle fullscreen mode.
function toggleFullscreen() {
	if (fscreen.fullscreenEnabled) {
		if (fscreen.fullscreenElement) {
			fscreen.exitFullscreen();
		} else {
			fscreen.requestFullscreen(document.documentElement);
		}
	} else if (IS_IOS) {
		// iOS fallback: scroll to hide Safari address bar + minimize UI
		window.scrollTo(0, 1);
	}
}

// Sync fullscreen changes with store.
if (fscreen.fullscreenEnabled) {
	fscreen.addEventListener('fullscreenchange', () => {
		store.setState({ fullscreen: isFullscreen() });
	});
}

// Auto-fullscreen for ALL platforms.
// Browsers require a user gesture (click/tap/key) to allow requestFullscreen().
// We listen for the first interaction and enter fullscreen immediately.
// On iOS (no Fullscreen API), we use scroll trick + hide browser chrome as best we can.
function setupAutoFullscreen() {
	function enterFullscreen() {
		if (fscreen.fullscreenEnabled && !fscreen.fullscreenElement) {
			fscreen.requestFullscreen(document.documentElement);
		} else if (IS_IOS) {
			// iOS: scroll to minimize Safari chrome
			window.scrollTo(0, 1);
			// Also try to lock orientation on supported browsers
			if (screen.orientation && typeof screen.orientation.lock === 'function') {
				screen.orientation.lock('landscape').catch(() => {});
			}
		}
		// Remove listeners after first trigger
		document.removeEventListener('click', enterFullscreen, true);
		document.removeEventListener('touchend', enterFullscreen, true);
		document.removeEventListener('keydown', enterFullscreen, true);
	}

	// Listen for first user interaction (capture phase)
	document.addEventListener('click', enterFullscreen, true);
	document.addEventListener('touchend', enterFullscreen, true);
	document.addEventListener('keydown', enterFullscreen, true);
}

// Fix viewport height for iOS Safari.
// iOS Safari's bottom bar causes 100vh to be taller than the visible area.
// This sets a CSS custom property --vh with the actual visible viewport height.
function setupViewportHeightFix() {
	function updateVH() {
		const vh = window.innerHeight * 0.01;
		document.documentElement.style.setProperty('--vh', vh + 'px');
	}
	updateVH();
	window.addEventListener('resize', updateVH);
}




// Simple state container; the source of truth.
const store = {
	_listeners: new Set(),
	_dispatch(prevState) {
		this._listeners.forEach(listener => listener(this.state, prevState))
	},
	
	state: {
		// will be unpaused in init()
		paused: true,
		soundEnabled: true,
		menuOpen: false,
		openHelpTopic: null,
		fullscreen: isFullscreen(),
		// Note that config values used for <select>s must be strings, unless manually converting values to strings
		// at render time, and parsing on change.
		config: {
			quality: String(IS_HIGH_END_DEVICE ? QUALITY_HIGH : QUALITY_NORMAL), // will be mirrored to a global variable named `quality` in `configDidUpdate`, for perf.
			shell: 'Random',
			size: IS_DESKTOP
				? '3' // Desktop default
				: IS_HEADER 
					? '1.2' // Profile header default (doesn't need to be an int)
					: '2', // Mobile default
			autoLaunch: true,
			finale: false,
			skyLighting: SKY_LIGHT_NORMAL + '',
			hideControls: IS_HEADER,
			longExposure: false,
			scaleFactor: getDefaultScaleFactor()
		}
	},
	
	setState(nextState) {
		const prevState = this.state;
		this.state = Object.assign({}, this.state, nextState);
		this._dispatch(prevState);
		this.persist();
	},
	
	subscribe(listener) {
		this._listeners.add(listener);
		return () => this._listeners.remove(listener);
	},
	
	// Load / persist select state to localStorage
	// Mutates state because `store.load()` should only be called once immediately after store is created, before any subscriptions.
	load() {
		const serializedData = localStorage.getItem('cm_fireworks_data');
		if (serializedData) {
			const {
				schemaVersion,
				data
			} = JSON.parse(serializedData);
			
			const config = this.state.config;
			switch(schemaVersion) {
				case '1.1':
					config.quality = data.quality;
					config.size = data.size;
					config.skyLighting = data.skyLighting;
					break;
				case '1.2':
					config.quality = data.quality;
					config.size = data.size;
					config.skyLighting = data.skyLighting;
					config.scaleFactor = data.scaleFactor;
					break;
				default:
					throw new Error('version switch should be exhaustive');
			}
			console.log(`Loaded config (schema version ${schemaVersion})`);
		}
		// Deprecated data format. Checked with care (it's not namespaced).
		else if (localStorage.getItem('schemaVersion') === '1') {
			let size;
			// Attempt to parse data, ignoring if there is an error.
			try {
				const sizeRaw = localStorage.getItem('configSize');
				size = typeof sizeRaw === 'string' && JSON.parse(sizeRaw);
			}
			catch(e) {
				console.log('Recovered from error parsing saved config:');
				console.error(e);
				return;
			}
			// Only restore validated values
			const sizeInt = parseInt(size, 10);
			if (sizeInt >= 0 && sizeInt <= 4) {
				this.state.config.size = String(sizeInt);
			}
		}
	},
	
	persist() {
		const config = this.state.config;
		localStorage.setItem('cm_fireworks_data', JSON.stringify({
			schemaVersion: '1.2',
			data: {
				quality: config.quality,
				size: config.size,
				skyLighting: config.skyLighting,
				scaleFactor: config.scaleFactor
			}
		}));
	}
};


if (!IS_HEADER) {
	store.load();
}

// Actions
// ---------

function togglePause(toggle) {
	const paused = store.state.paused;
	let newValue;
	if (typeof toggle === 'boolean') {
		newValue = toggle;
	} else {
		newValue = !paused;
	}

	if (paused !== newValue) {
		store.setState({ paused: newValue });
	}
}

function toggleSound(toggle) {
	if (typeof toggle === 'boolean') {
		store.setState({ soundEnabled: toggle });
	} else {
		store.setState({ soundEnabled: !store.state.soundEnabled });
	}
}

function toggleMenu(toggle) {
	if (typeof toggle === 'boolean') {
		store.setState({ menuOpen: toggle });
	} else {
		store.setState({ menuOpen: !store.state.menuOpen });
	}
}

function updateConfig(nextConfig) {
	nextConfig = nextConfig || getConfigFromDOM();
	store.setState({
		config: Object.assign({}, store.state.config, nextConfig)
	});
	
	configDidUpdate();
}

// Map config to various properties & apply side effects
function configDidUpdate() {
	const config = store.state.config;
	
	quality = qualitySelector();
	isLowQuality = quality === QUALITY_LOW;
	isNormalQuality = quality === QUALITY_NORMAL;
	isHighQuality = quality === QUALITY_HIGH;
	
	if (skyLightingSelector() === SKY_LIGHT_NONE) {
		appNodes.canvasContainer.style.backgroundColor = '#000';
	}
	
	Spark.drawWidth = quality === QUALITY_HIGH ? 0.75 : 1;
}

// Selectors
// -----------

const isRunning = (state=store.state) => !state.paused && !state.menuOpen;
// Whether user has enabled sound.
const soundEnabledSelector = (state=store.state) => state.soundEnabled;
// Whether any sounds are allowed, taking into account multiple factors.
const canPlaySoundSelector = (state=store.state) => isRunning(state) && soundEnabledSelector(state);
// Convert quality to number.
const qualitySelector = () => +store.state.config.quality;
const shellNameSelector = () => store.state.config.shell;
// Convert shell size to number.
const shellSizeSelector = () => +store.state.config.size;
const finaleSelector = () => store.state.config.finale;
const skyLightingSelector = () => +store.state.config.skyLighting;
const scaleFactorSelector = () => store.state.config.scaleFactor;



// Help Content
const helpContent = {
	shellType: {
		header: 'Shell Type',
		body: 'The type of firework that will be launched. Select "Random" for a nice assortment!'
	},
	shellSize: {
		header: 'Shell Size',
		body: 'The size of the fireworks. Modeled after real firework shell sizes, larger shells have bigger bursts with more stars, and sometimes more complex effects. However, larger shells also require more processing power and may cause lag.'
	},
	quality: {
		header: 'Quality',
		body: 'Overall graphics quality. If the animation is not running smoothly, try lowering the quality. High quality greatly increases the amount of sparks rendered and may cause lag.'
	},
	skyLighting: {
		header: 'Sky Lighting',
		body: 'Illuminates the background as fireworks explode. If the background looks too bright on your screen, try setting it to "Dim" or "None".'
	},
	scaleFactor: {
		header: 'Scale',
		body: 'Allows scaling the size of all fireworks, essentially moving you closer or farther away. For larger shell sizes, it can be convenient to decrease the scale a bit, especially on phones or tablets.'
	},
	autoLaunch: {
		header: 'Auto Fire',
		body: 'Launches sequences of fireworks automatically. Sit back and enjoy the show, or disable to have full control.'
	},
	finaleMode: {
		header: 'Finale Mode',
		body: 'Launches intense bursts of fireworks. May cause lag. Requires "Auto Fire" to be enabled.'
	},
	hideControls: {
		header: 'Hide Controls',
		body: 'Hides the translucent controls along the top of the screen. Useful for screenshots, or just a more seamless experience. While hidden, you can still tap the top-right corner to re-open this menu.'
	},
	fullscreen: {
		header: 'Fullscreen',
		body: 'Toggles fullscreen mode.'
	},
	longExposure: {
		header: 'Open Shutter',
		body: 'Experimental effect that preserves long streaks of light, similar to leaving a camera shutter open.'
	}
};

const nodeKeyToHelpKey = {
	shellTypeLabel: 'shellType',
	shellSizeLabel: 'shellSize',
	qualityLabel: 'quality',
	skyLightingLabel: 'skyLighting',
	scaleFactorLabel: 'scaleFactor',
	autoLaunchLabel: 'autoLaunch',
	finaleModeLabel: 'finaleMode',
	hideControlsLabel: 'hideControls',
	fullscreenLabel: 'fullscreen',
	longExposureLabel: 'longExposure'
};


// Render app UI / keep in sync with state
const appNodes = {
	stageContainer: '.stage-container',
	canvasContainer: '.canvas-container',
	controls: '.controls',
	menu: '.menu',
	menuInnerWrap: '.menu__inner-wrap',
	pauseBtn: '.pause-btn',
	pauseBtnSVG: '.pause-btn use',
	soundBtn: '.sound-btn',
	soundBtnSVG: '.sound-btn use',
	shellType: '.shell-type',
	shellTypeLabel: '.shell-type-label',
	shellSize: '.shell-size',
	shellSizeLabel: '.shell-size-label',
	quality: '.quality-ui',
	qualityLabel: '.quality-ui-label',
	skyLighting: '.sky-lighting',
	skyLightingLabel: '.sky-lighting-label',
	scaleFactor: '.scaleFactor',
	scaleFactorLabel: '.scaleFactor-label',
	autoLaunch: '.auto-launch',
	autoLaunchLabel: '.auto-launch-label',
	finaleModeFormOption: '.form-option--finale-mode',
	finaleMode: '.finale-mode',
	finaleModeLabel: '.finale-mode-label',
	hideControls: '.hide-controls',
	hideControlsLabel: '.hide-controls-label',
	fullscreenFormOption: '.form-option--fullscreen',
	fullscreen: '.fullscreen',
	fullscreenLabel: '.fullscreen-label',
	longExposure: '.long-exposure',
	longExposureLabel: '.long-exposure-label',
	
	// Help UI
	helpModal: '.help-modal',
	helpModalOverlay: '.help-modal__overlay',
	helpModalHeader: '.help-modal__header',
	helpModalBody: '.help-modal__body',
	helpModalCloseBtn: '.help-modal__close-btn'
};

// Convert appNodes selectors to dom nodes
Object.keys(appNodes).forEach(key => {
	appNodes[key] = document.querySelector(appNodes[key]);
});

// Only hide fullscreen control on desktop browsers that don't support it.
// On mobile (especially iOS), keep it visible — we have fallback behavior.
if (!fullscreenEnabled() && !IS_IOS) {
	appNodes.fullscreenFormOption.classList.add('remove');
}

// First render is called in init()
function renderApp(state) {
	const pauseBtnIcon = `#icon-${state.paused ? 'play' : 'pause'}`;
	const soundBtnIcon = `#icon-sound-${soundEnabledSelector() ? 'on' : 'off'}`;
	appNodes.pauseBtnSVG.setAttribute('href', pauseBtnIcon);
	appNodes.pauseBtnSVG.setAttribute('xlink:href', pauseBtnIcon);
	appNodes.soundBtnSVG.setAttribute('href', soundBtnIcon);
	appNodes.soundBtnSVG.setAttribute('xlink:href', soundBtnIcon);
	appNodes.controls.classList.toggle('hide', state.menuOpen || state.config.hideControls);
	appNodes.canvasContainer.classList.toggle('blur', state.menuOpen);
	appNodes.menu.classList.toggle('hide', !state.menuOpen);
	appNodes.finaleModeFormOption.style.opacity = state.config.autoLaunch ? 1 : 0.32;
	
	appNodes.quality.value = state.config.quality;
	appNodes.shellType.value = state.config.shell;
	appNodes.shellSize.value = state.config.size;
	appNodes.autoLaunch.checked = state.config.autoLaunch;
	appNodes.finaleMode.checked = state.config.finale;
	appNodes.skyLighting.value = state.config.skyLighting;
	appNodes.hideControls.checked = state.config.hideControls;
	appNodes.fullscreen.checked = state.fullscreen;
	appNodes.longExposure.checked = state.config.longExposure;
	appNodes.scaleFactor.value = state.config.scaleFactor.toFixed(2);
	
	appNodes.menuInnerWrap.style.opacity = state.openHelpTopic ? 0.12 : 1;
	appNodes.helpModal.classList.toggle('active', !!state.openHelpTopic);
	if (state.openHelpTopic) {
		const { header, body } = helpContent[state.openHelpTopic];
		appNodes.helpModalHeader.textContent = header;
		appNodes.helpModalBody.textContent = body;
	}
}

store.subscribe(renderApp);

// Perform side effects on state changes
function handleStateChange(state, prevState) {
	const canPlaySound = canPlaySoundSelector(state);
	const canPlaySoundPrev = canPlaySoundSelector(prevState);
	
	if (canPlaySound !== canPlaySoundPrev) {
		if (canPlaySound) {
			soundManager.resumeAll();
		} else {
			soundManager.pauseAll();
		}
	}
}

store.subscribe(handleStateChange);


function getConfigFromDOM() {
	return {
		quality: appNodes.quality.value,
		shell: appNodes.shellType.value,
		size: appNodes.shellSize.value,
		autoLaunch: appNodes.autoLaunch.checked,
		finale: appNodes.finaleMode.checked,
		skyLighting: appNodes.skyLighting.value,
		longExposure: appNodes.longExposure.checked,
		hideControls: appNodes.hideControls.checked,
		// Store value as number.
		scaleFactor: parseFloat(appNodes.scaleFactor.value)
	};
};

const updateConfigNoEvent = () => updateConfig();
appNodes.quality.addEventListener('input', updateConfigNoEvent);
appNodes.shellType.addEventListener('input', updateConfigNoEvent);
appNodes.shellSize.addEventListener('input', updateConfigNoEvent);
appNodes.autoLaunch.addEventListener('click', () => setTimeout(updateConfig, 0));
appNodes.finaleMode.addEventListener('click', () => setTimeout(updateConfig, 0));
appNodes.skyLighting.addEventListener('input', updateConfigNoEvent);
appNodes.longExposure.addEventListener('click', () => setTimeout(updateConfig, 0));
appNodes.hideControls.addEventListener('click', () => setTimeout(updateConfig, 0));
appNodes.fullscreen.addEventListener('click', () => setTimeout(toggleFullscreen, 0));
// Changing scaleFactor requires triggering resize handling code as well.
appNodes.scaleFactor.addEventListener('input', () => {
	updateConfig();
	handleResize();
});

Object.keys(nodeKeyToHelpKey).forEach(nodeKey => {
	const helpKey = nodeKeyToHelpKey[nodeKey];
	appNodes[nodeKey].addEventListener('click', () => {
		store.setState({ openHelpTopic: helpKey });
	});
});

appNodes.helpModalCloseBtn.addEventListener('click', () => {
	store.setState({ openHelpTopic: null });
});

appNodes.helpModalOverlay.addEventListener('click', () => {
	store.setState({ openHelpTopic: null });
});



// Constant derivations
const COLOR_NAMES = Object.keys(COLOR);
const COLOR_CODES = COLOR_NAMES.map(colorName => COLOR[colorName]);
// Invisible stars need an indentifier, even through they won't be rendered - physics still apply.
const COLOR_CODES_W_INVIS = [...COLOR_CODES, INVISIBLE];
// Map of color codes to their index in the array. Useful for quickly determining if a color has already been updated in a loop.
const COLOR_CODE_INDEXES = COLOR_CODES_W_INVIS.reduce((obj, code, i) => {
	obj[code] = i;
	return obj;
}, {});
// Tuples is a map keys by color codes (hex) with values of { r, g, b } tuples (still just objects).
const COLOR_TUPLES = {};
COLOR_CODES.forEach(hex => {
	COLOR_TUPLES[hex] = {
		r: parseInt(hex.substr(1, 2), 16),
		g: parseInt(hex.substr(3, 2), 16),
		b: parseInt(hex.substr(5, 2), 16),
	};
});

// Get a random color.
function randomColorSimple() {
	return COLOR_CODES[Math.random() * COLOR_CODES.length | 0];
}

// Get a random color, with some customization options available.
let lastColor;
function randomColor(options) {
	const notSame = options && options.notSame;
	const notColor = options && options.notColor;
	const limitWhite = options && options.limitWhite;
	let color = randomColorSimple();
	
	// limit the amount of white chosen randomly
	if (limitWhite && color === COLOR.White && Math.random() < 0.6) {
		color = randomColorSimple();
	}
	
	if (notSame) {
		while (color === lastColor) {
			color = randomColorSimple();
		}
	}
	else if (notColor) {
		while (color === notColor) {
			color = randomColorSimple();
		}
	}
	
	lastColor = color;
	return color;
}

function whiteOrGold() {
	return Math.random() < 0.5 ? COLOR.Gold : COLOR.White;
}


// Shell helpers
function makePistilColor(shellColor) {
	return (shellColor === COLOR.White || shellColor === COLOR.Gold) ? randomColor({ notColor: shellColor }) : whiteOrGold();
}

// Unique shell types
const crysanthemumShell = (size=1) => {
	const glitter = Math.random() < 0.25;
	const singleColor = Math.random() < 0.72;
	const color = singleColor ? randomColor({ limitWhite: true }) : [randomColor(), randomColor({ notSame: true })];
	const pistil = singleColor && Math.random() < 0.42;
	const pistilColor = pistil && makePistilColor(color);
	const secondColor = singleColor && (Math.random() < 0.2 || color === COLOR.White) ? pistilColor || randomColor({ notColor: color, limitWhite: true }) : null;
	const streamers = !pistil && color !== COLOR.White && Math.random() < 0.42;
	let starDensity = glitter ? 1.1 : 1.25;
	if (isLowQuality) starDensity *= 0.8;
	if (isHighQuality) starDensity = 1.2;
	return {
		shellSize: size,
		spreadSize: 300 + size * 100,
		starLife: 900 + size * 200,
		starDensity,
		color,
		secondColor,
		glitter: glitter ? 'light' : '',
		glitterColor: whiteOrGold(),
		pistil,
		pistilColor,
		streamers
	};
};


const ghostShell = (size=1) => {
	// Extend crysanthemum shell
	const shell = crysanthemumShell(size);
	// Ghost effect can be fast, so extend star life
	shell.starLife *= 1.5;
	// Ensure we always have a single color other than white
	let ghostColor = randomColor({ notColor: COLOR.White });
	// Always use streamers, and sometimes a pistil
	shell.streamers = true;
	const pistil = Math.random() < 0.42;
	const pistilColor = pistil && makePistilColor(ghostColor);
	// Ghost effect - transition from invisible to chosen color
	shell.color = INVISIBLE;
	shell.secondColor = ghostColor;
	// We don't want glitter to be spewed by invisible stars, and we don't currently
	// have a way to transition glitter state. So we'll disable it.
	shell.glitter = '';
	
	return shell;
};


const strobeShell = (size=1) => {
	const color = randomColor({ limitWhite: true });
	return {
		shellSize: size,
		spreadSize: 280 + size * 92,
		starLife: 1100 + size * 200,
		starLifeVariation: 0.40,
		starDensity: 1.1,
		color,
		glitter: 'light',
		glitterColor: COLOR.White,
		strobe: true,
		strobeColor: Math.random() < 0.5 ? COLOR.White : null,
		pistil: Math.random() < 0.5,
		pistilColor: makePistilColor(color)
	};
};


const palmShell = (size=1) => {
	const color = randomColor();
	const thick = Math.random() < 0.5;
	return {
		shellSize: size,
		color,
		spreadSize: 250 + size * 75,
		starDensity: thick ? 0.15 : 0.4,
		starLife: 1800 + size * 200,
		glitter: thick ? 'thick' : 'heavy'
	};
};

const ringShell = (size=1) => {
	const color = randomColor();
	const pistil = Math.random() < 0.75;
	return {
		shellSize: size,
		ring: true,
		color,
		spreadSize: 300 + size * 100,
		starLife: 900 + size * 200,
		starCount: 2.2 * PI_2 * (size+1),
		pistil,
		pistilColor: makePistilColor(color),
		glitter: !pistil ? 'light' : '',
		glitterColor: color === COLOR.Gold ? COLOR.Gold : COLOR.White,
		streamers: Math.random() < 0.3
	};
	// return Object.assign({}, defaultShell, config);
};

const crossetteShell = (size=1) => {
	const color = randomColor({ limitWhite: true });
	return {
		shellSize: size,
		spreadSize: 300 + size * 100,
		starLife: 750 + size * 160,
		starLifeVariation: 0.4,
		starDensity: 0.85,
		color,
		crossette: true,
		pistil: Math.random() < 0.5,
		pistilColor: makePistilColor(color)
	};
};

const floralShell = (size=1) => ({
	shellSize: size,
	spreadSize: 300 + size * 120,
	starDensity: 0.12,
	starLife: 500 + size * 50,
	starLifeVariation: 0.5,
	color: Math.random() < 0.65 ? 'random' : (Math.random() < 0.15 ? randomColor() : [randomColor(), randomColor({ notSame: true })]),
	floral: true
});

const fallingLeavesShell = (size=1) => ({
	shellSize: size,
	color: INVISIBLE,
	spreadSize: 300 + size * 120,
	starDensity: 0.36,
	starLife: 500 + size * 50,
	starLifeVariation: 0.5,
	glitter: 'medium',
	glitterColor: COLOR.Gold,
	fallingLeaves: true
});

const willowShell = (size=1) => ({
	shellSize: size,
	spreadSize: 300 + size * 100,
	starDensity: 0.6,
	starLife: 3000 + size * 300,
	glitter: 'willow',
	glitterColor: COLOR.Gold,
	color: INVISIBLE
});

const crackleShell = (size=1) => {
	// favor gold
	const color = Math.random() < 0.75 ? COLOR.Gold : randomColor();
	return {
		shellSize: size,
		spreadSize: 380 + size * 75,
		starDensity: isLowQuality ? 0.65 : 1,
		starLife: 600 + size * 100,
		starLifeVariation: 0.32,
		glitter: 'light',
		glitterColor: COLOR.Gold,
		color,
		crackle: true,
		pistil: Math.random() < 0.65,
		pistilColor: makePistilColor(color)
	};
};

const horsetailShell = (size=1) => {
	const color = randomColor();
	return {
		shellSize: size,
		horsetail: true,
		color,
		spreadSize: 250 + size * 38,
		starDensity: 0.9,
		starLife: 2500 + size * 300,
		glitter: 'medium',
		glitterColor: Math.random() < 0.5 ? whiteOrGold() : color,
		// Add strobe effect to white horsetails, to make them more interesting
		strobe: color === COLOR.White
	};
};

// Peony — dense, clean spherical burst with vivid colors, minimal glitter (Ref: Image 2)
const peonyShell = (size=1) => {
	const singleColor = Math.random() < 0.6;
	const color = singleColor ? randomColor({ limitWhite: true }) : [randomColor(), randomColor({ notSame: true })];
	const pistil = singleColor && Math.random() < 0.6;
	const pistilColor = pistil && makePistilColor(color);
	let starDensity = 1.4;
	if (isLowQuality) starDensity = 1.0;
	if (isHighQuality) starDensity = 1.6;
	return {
		shellSize: size,
		spreadSize: 320 + size * 100,
		starLife: 1100 + size * 200,
		starDensity,
		color,
		pistil,
		pistilColor,
		glitter: '',
		streamers: !pistil && Math.random() < 0.3
	};
};

// Dahlia — very dense warm burst with layered depth (Ref: Image 1)
const dahliaShell = (size=1) => {
	const warmColors = [COLOR.Red, COLOR.Gold, COLOR.Purple];
	const color = warmColors[Math.random() * warmColors.length | 0];
	const secondColor = Math.random() < 0.5 ? COLOR.Gold : null;
	let starDensity = 1.35;
	if (isLowQuality) starDensity = 0.95;
	if (isHighQuality) starDensity = 1.5;
	return {
		shellSize: size,
		spreadSize: 340 + size * 110,
		starLife: 1000 + size * 200,
		starLifeVariation: 0.2,
		starDensity,
		color,
		secondColor,
		glitter: 'light',
		glitterColor: COLOR.Gold,
		pistil: true,
		pistilColor: whiteOrGold(),
		streamers: Math.random() < 0.45
	};
};

// Brocade — dense golden cascade with heavy trailing (Ref: Image 4)
const brocadeShell = (size=1) => ({
	shellSize: size,
	spreadSize: 320 + size * 90,
	starDensity: 1.1,
	starLife: 2400 + size * 350,
	color: COLOR.Gold,
	secondColor: Math.random() < 0.4 ? COLOR.White : null,
	glitter: 'thick',
	glitterColor: COLOR.Gold
});

// Waterfall — tall blue-to-white cascade streams (Ref: Image 3)
const waterfallShell = (size=1) => {
	const shell = horsetailShell(size);
	shell.horsetail = true;
	shell.color = COLOR.Blue;
	shell.secondColor = COLOR.White;
	shell.spreadSize = 280 + size * 50;
	shell.starLife = 4500 + size * 500;
	shell.starDensity = 1.6;
	shell.glitter = 'willow';
	shell.glitterColor = COLOR.White;
	shell.strobe = false;
	return shell;
};

// Fan — half-sphere burst with upward spread (Ref: Image 6)
const fanShell = (size=1) => {
	const color = randomColor({ limitWhite: true });
	return {
		shellSize: size,
		spreadSize: 280 + size * 80,
		starDensity: 1.1,
		starLife: 1200 + size * 200,
		color,
		fan: true,
		glitter: 'medium',
		glitterColor: whiteOrGold(),
		streamers: Math.random() < 0.35
	};
};


function randomShellName() {
	return Math.random() < 0.5 ? 'Crysanthemum' : shellNames[(Math.random() * (shellNames.length - 1) + 1) | 0 ];
}

function randomShell(size) {
	// Special selection for codepen header.
	if (IS_HEADER) return randomFastShell()(size);
	// Normal operation
	return shellTypes[randomShellName()](size);
}

function shellFromConfig(size) {
	return shellTypes[shellNameSelector()](size);
}

// Get a random shell, not including processing intensive varients
// Note this is only random when "Random" shell is selected in config.
// Also, this does not create the shell, only returns the factory function.
const fastShellBlacklist = ['Falling Leaves', 'Floral', 'Willow', 'Waterfall'];
function randomFastShell() {
	const isRandom = shellNameSelector() === 'Random';
	let shellName = isRandom ? randomShellName() : shellNameSelector();
	if (isRandom) {
		while (fastShellBlacklist.includes(shellName)) {
			shellName = randomShellName();
		}
	}
	return shellTypes[shellName];
}


// Bold bitmap font for text fireworks (7 wide x 9 tall, each row is a bitmask)
const TEXT_BITMAP = {
	H: [0b1100011,0b1100011,0b1100011,0b1111111,0b1111111,0b1100011,0b1100011,0b1100011,0b1100011],
	A: [0b0011100,0b0111110,0b1100011,0b1100011,0b1111111,0b1111111,0b1100011,0b1100011,0b1100011],
	P: [0b1111110,0b1111111,0b1100011,0b1100011,0b1111110,0b1111100,0b1100000,0b1100000,0b1100000],
	Y: [0b1100011,0b1100011,0b0110110,0b0011100,0b0001000,0b0001000,0b0001000,0b0001000,0b0001000],
	N: [0b1100011,0b1110011,0b1111011,0b1101111,0b1100111,0b1100011,0b1100011,0b1100011,0b1100011],
	E: [0b1111111,0b1111111,0b1100000,0b1111100,0b1111100,0b1100000,0b1100000,0b1111111,0b1111111],
	W: [0b1100011,0b1100011,0b1100011,0b1100011,0b1101011,0b1111111,0b0111110,0b0110110,0b0100010],
	R: [0b1111110,0b1111111,0b1100011,0b1100011,0b1111110,0b1111100,0b1100110,0b1100011,0b1100011],
};

function textFireworkShell(char, charScale) {
	return {
		shellSize: 1,
		spreadSize: 100,
		starLife: 2200,
		starDensity: 1,
		color: COLOR.Gold,
		textChar: char,
		charScale: charScale,
		glitter: '',
	};
}

const shellTypes = {
	'Random': randomShell,
	'Crackle': crackleShell,
	'Crossette': crossetteShell,
	'Crysanthemum': crysanthemumShell,
	'Falling Leaves': fallingLeavesShell,
	'Floral': floralShell,
	'Ghost': ghostShell,
	'Palm': palmShell,
	'Strobe': strobeShell,
	'Willow': willowShell,
	'Peony': peonyShell,
	'Dahlia': dahliaShell,
	'Brocade': brocadeShell,
	'Waterfall': waterfallShell
};

const shellNames = Object.keys(shellTypes);

function init() {
	// Remove loading state
	document.querySelector('.loading-init').remove();

	// Populate dropdowns
	function setOptionsForSelect(node, options) {
		node.innerHTML = options.reduce((acc, opt) => acc += `<option value="${opt.value}">${opt.label}</option>`, '');
	}

	// shell type
	let options = '';
	shellNames.forEach(opt => options += `<option value="${opt}">${opt}</option>`);
	appNodes.shellType.innerHTML = options;
	// shell size
	options = '';
	['3"', '4"', '6"', '8"', '12"', '16"'].forEach((opt, i) => options += `<option value="${i}">${opt}</option>`);
	appNodes.shellSize.innerHTML = options;

	setOptionsForSelect(appNodes.quality, [
		{ label: 'Low', value: QUALITY_LOW },
		{ label: 'Normal', value: QUALITY_NORMAL },
		{ label: 'High', value: QUALITY_HIGH }
	]);

	setOptionsForSelect(appNodes.skyLighting, [
		{ label: 'None', value: SKY_LIGHT_NONE },
		{ label: 'Dim', value: SKY_LIGHT_DIM },
		{ label: 'Normal', value: SKY_LIGHT_NORMAL }
	]);

	// 0.9 is mobile default
	setOptionsForSelect(
		appNodes.scaleFactor,
		[0.5, 0.62, 0.75, 0.9, 1.0, 1.5, 2.0]
		.map(value => ({ value: value.toFixed(2), label: `${value*100}%` }))
	);

	// initial render (paused state)
	renderApp(store.state);
	configDidUpdate();

	// Start countdown
	startCountdown();
}

function startCountdown() {
	const overlay = document.querySelector('.countdown-overlay');
	const numberEl = overlay.querySelector('.countdown-number');
	const hintEl = overlay.querySelector('.countdown-rotate-hint');
	overlay.classList.remove('remove');

	// Apply styles via JS to guarantee they override any CSS specificity issues
	overlay.style.cssText = 'position:fixed;top:0;left:0;width:100vw;height:100vh;margin:0;padding:0;display:flex;justify-content:center;align-items:center;background:radial-gradient(ellipse at center,#0a0a1a 0%,#000 70%);z-index:100;overflow:hidden;';
	numberEl.style.cssText = 'font-family:DSEG7-Classic,DSEG7 Classic,monospace;font-size:38vh;line-height:1;font-weight:bold;font-style:italic;color:#ff1e1e;-webkit-text-fill-color:#ff1e1e;text-shadow:0 0 20px rgba(255,30,30,0.9),0 0 50px rgba(255,30,30,0.6),0 0 100px rgba(255,60,0,0.4),0 0 150px rgba(200,0,0,0.3);opacity:0;z-index:1;position:relative;';

	// Mobile portrait detection — show rotate hint
	const isMobile = /Android|iPhone|iPad|iPod|webOS|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
	if (isMobile && hintEl) {
		const phoneSvg = '<svg width="36" height="36" viewBox="0 0 24 24" fill="rgba(255,255,255,0.5)"><path d="M17 1.01L7 1c-1.1 0-2 .9-2 2v18c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V3c0-1.1-.9-1.99-2-1.99zM17 19H7V5h10v14z"/></svg>';
		hintEl.innerHTML = phoneSvg + 'Xoay ngang để trải nghiệm tốt hơn';
		function checkOrientation() {
			if (window.innerWidth > window.innerHeight) {
				hintEl.classList.remove('visible');
			} else {
				hintEl.classList.add('visible');
			}
		}
		checkOrientation();
		window.addEventListener('resize', checkOrientation);
		// Clean up listener when countdown ends
		hintEl._cleanOrientation = () => window.removeEventListener('resize', checkOrientation);
	}

	let count = 5;

	function showNumber() {
		numberEl.classList.remove('cd-enter', 'cd-exit');
		void numberEl.offsetWidth;
		numberEl.textContent = count;
		numberEl.style.opacity = '0';
		numberEl.classList.add('cd-enter');
	}

	function exitNumber(callback) {
		numberEl.classList.remove('cd-enter');
		void numberEl.offsetWidth;
		numberEl.style.opacity = '1';
		numberEl.classList.add('cd-exit');
		setTimeout(callback, 500);
	}

	showNumber();

	const interval = setInterval(() => {
		exitNumber(() => {
			count--;
			if (count > 0) {
				showNumber();
			} else {
				clearInterval(interval);
				// Clean up orientation listener
				if (hintEl && hintEl._cleanOrientation) hintEl._cleanOrientation();
				overlay.style.transition = 'opacity 0.6s';
				overlay.style.opacity = '0';
				setTimeout(() => {
					overlay.classList.add('remove');
					appNodes.stageContainer.classList.remove('remove');
					togglePause(false);
					// Auto-fullscreen for all platforms on first user interaction
					setupAutoFullscreen();
				}, 600);
			}
		});
	}, 1000);
}


function fitShellPositionInBoundsH(position) {
	const edge = 0.18;
	return (1 - edge*2) * position + edge;
}

function fitShellPositionInBoundsV(position) {
	return position * 0.75;
}

function getRandomShellPositionH() {
	return fitShellPositionInBoundsH(Math.random());
}

function getRandomShellPositionV() {
	return fitShellPositionInBoundsV(Math.random());
}

function getRandomShellSize() {
	const baseSize = shellSizeSelector();
	const maxVariance = Math.min(2.5, baseSize);
	const variance = Math.random() * maxVariance;
	const size = baseSize - variance;
	const height = maxVariance === 0 ? Math.random() : 1 - (variance / maxVariance);
	const centerOffset = Math.random() * (1 - height * 0.65) * 0.5;
	const x = Math.random() < 0.5 ? 0.5 - centerOffset : 0.5 + centerOffset;
	return {
		size,
		x: fitShellPositionInBoundsH(x),
		height: fitShellPositionInBoundsV(height)
	};
}


// Launches a shell from a user pointer event, based on state.config
function launchShellFromConfig(event) {
	const shell = new Shell(shellFromConfig(shellSizeSelector()));
	const w = mainStage.width;
	const h = mainStage.height;
	
	shell.launch(
		event ? event.x / w : getRandomShellPositionH(),
		event ? 1 - event.y / h : getRandomShellPositionV()
	);
}


// Sequences
// -----------

function seqRandomShell() {
	const size = getRandomShellSize();
	const shell = new Shell(shellFromConfig(size.size));
	shell.launch(size.x, size.height);
	
	let extraDelay = shell.starLife;
	if (shell.fallingLeaves) {
		extraDelay = 4600;
	}
	
	return 900 + Math.random() * 600 + extraDelay;
}

function seqRandomFastShell() {
	const shellType = randomFastShell();
	const size = getRandomShellSize();
	const shell = new Shell(shellType(size.size));
	shell.launch(size.x, size.height);
	
	let extraDelay = shell.starLife;
	
	return 900 + Math.random() * 600 + extraDelay;
}

function seqTwoRandom() {
	const size1 = getRandomShellSize();
	const size2 = getRandomShellSize();
	const shell1 = new Shell(shellFromConfig(size1.size));
	const shell2 = new Shell(shellFromConfig(size2.size));
	const leftOffset = Math.random() * 0.2 - 0.1;
	const rightOffset = Math.random() * 0.2 - 0.1;
	shell1.launch(0.3 + leftOffset, size1.height);
	setTimeout(() => {
		shell2.launch(0.7 + rightOffset, size2.height);
	}, 100);
	
	let extraDelay = Math.max(shell1.starLife, shell2.starLife);
	if (shell1.fallingLeaves || shell2.fallingLeaves) {
		extraDelay = 4600;
	}
	
	return 900 + Math.random() * 600 + extraDelay;
}

function seqTriple() {
	const shellType = randomFastShell();
	const baseSize = shellSizeSelector();
	const smallSize = Math.max(0, baseSize - 1.25);
	
	const offset = Math.random() * 0.08 - 0.04;
	const shell1 = new Shell(shellType(baseSize));
	shell1.launch(0.5 + offset, 0.7);
	
	const leftDelay = 1000 + Math.random() * 400;
	const rightDelay = 1000 + Math.random() * 400;
	
	setTimeout(() => {
		const offset = Math.random() * 0.08 - 0.04;
		const shell2 = new Shell(shellType(smallSize));
		shell2.launch(0.2 + offset, 0.1);
	}, leftDelay);
	
	setTimeout(() => {
		const offset = Math.random() * 0.08 - 0.04;
		const shell3 = new Shell(shellType(smallSize));
		shell3.launch(0.8 + offset, 0.1);
	}, rightDelay);
	
	return 4000;
}

function seqPyramid() {
	const barrageCountHalf = IS_DESKTOP ? 7 : 4;
	const largeSize = shellSizeSelector();
	const smallSize = Math.max(0, largeSize - 3);
	const randomMainShell = Math.random() < 0.78 ? crysanthemumShell : peonyShell;
	const randomSpecialShell = randomShell;

	function launchShell(x, useSpecial) {
		const isRandom = shellNameSelector() === 'Random';
		let shellType = isRandom
			? useSpecial ? randomSpecialShell : randomMainShell
			: shellTypes[shellNameSelector()];
		const shell = new Shell(shellType(useSpecial ? largeSize : smallSize));
		const height = x <= 0.5 ? x / 0.5 : (1 - x) / 0.5;
		shell.launch(x, useSpecial ? 0.75 : height * 0.42);
	}
	
	let count = 0;
	let delay = 0;
	while(count <= barrageCountHalf) {
		if (count === barrageCountHalf) {
			setTimeout(() => {
				launchShell(0.5, true);
			}, delay);
		} else {
			const offset = count / barrageCountHalf * 0.5;
			const delayOffset = Math.random() * 30 + 30;
			setTimeout(() => {
				launchShell(offset, false);
			}, delay);
			setTimeout(() => {
				launchShell(1 - offset, false);
			}, delay + delayOffset);
		}
		
		count++;
		delay += 200;
	}
	
	return 3400 + barrageCountHalf * 250;
}

function seqSmallBarrage() {
	seqSmallBarrage.lastCalled = Date.now();
	const barrageCount = IS_DESKTOP ? 11 : 5;
	const specialIndex = IS_DESKTOP ? 3 : 1;
	const shellSize = Math.max(0, shellSizeSelector() - 2);
	const randomMainShell = Math.random() < 0.78 ? crysanthemumShell : peonyShell;
	const randomSpecialShell = randomFastShell();
	
	// (cos(x*5π+0.5π)+1)/2 is a custom wave bounded by 0 and 1 used to set varying launch heights
	function launchShell(x, useSpecial) {
		const isRandom = shellNameSelector() === 'Random';
		let shellType = isRandom
			? useSpecial ? randomSpecialShell : randomMainShell
			: shellTypes[shellNameSelector()];
		const shell = new Shell(shellType(shellSize));
		const height = (Math.cos(x*5*Math.PI + PI_HALF) + 1) / 2;
		shell.launch(x, height * 0.75);
	}
	
	let count = 0;
	let delay = 0;
	while(count < barrageCount) {
		if (count === 0) {
			launchShell(0.5, false)
			count += 1;
		}
		else {
			const offset = (count + 1) / barrageCount / 2;
			const delayOffset = Math.random() * 30 + 30;
			const useSpecial = count === specialIndex;
			setTimeout(() => {
				launchShell(0.5 + offset, useSpecial);
			}, delay);
			setTimeout(() => {
				launchShell(0.5 - offset, useSpecial);
			}, delay + delayOffset);
			count += 2;
		}
		delay += 200;
	}
	
	return 3400 + barrageCount * 120;
}
seqSmallBarrage.cooldown = 15000;
seqSmallBarrage.lastCalled = Date.now();


// Mixed volley — 5 different shell types fired simultaneously from different positions
function seqMixedVolley() {
	const count = IS_DESKTOP ? 5 : 3;
	const baseSize = shellSizeSelector();
	const smallSize = Math.max(0, baseSize - 1);
	const availableShells = shellNames.filter(n => n !== 'Random');

	const picks = [];
	while (picks.length < count) {
		const name = availableShells[Math.random() * availableShells.length | 0];
		if (!picks.includes(name)) picks.push(name);
	}

	let maxLife = 0;

	picks.forEach((name, i) => {
		const size = i === Math.floor(count / 2) ? baseSize : smallSize;
		const x = (i + 0.5) / count;
		const shell = new Shell(shellTypes[name](size));
		const delay = Math.random() * 200;
		setTimeout(() => {
			shell.launch(x + (Math.random() * 0.06 - 0.03), 0.35 + Math.random() * 0.35);
		}, delay);
		maxLife = Math.max(maxLife, shell.starLife);
	});

	return 800 + Math.random() * 400 + maxLife;
}

// Wide barrage — 8 shells of mixed types spread across the sky
function seqWideBarrage() {
	seqWideBarrage.lastCalled = Date.now();
	const count = IS_DESKTOP ? 8 : 5;
	const baseSize = Math.max(0, shellSizeSelector() - 1);
	const availableShells = shellNames.filter(n => n !== 'Random');
	let maxLife = 0;

	for (let i = 0; i < count; i++) {
		const name = availableShells[Math.random() * availableShells.length | 0];
		const shell = new Shell(shellTypes[name](baseSize));
		const x = (i + 0.5) / count;
		const height = 0.25 + Math.random() * 0.45;
		const delay = i * 90 + Math.random() * 60;
		setTimeout(() => {
			shell.launch(x, height);
		}, delay);
		maxLife = Math.max(maxLife, shell.starLife);
	}

	return 1000 + Math.random() * 500 + maxLife;
}
seqWideBarrage.cooldown = 12000;
seqWideBarrage.lastCalled = Date.now();

// Duo pair — 2 identical shell types launched side by side simultaneously
function seqDuoPair() {
	const size = shellSizeSelector();
	const shellName = shellNameSelector();
	const factory = shellName === 'Random' ? randomFastShell() : shellTypes[shellName];
	const shell1 = new Shell(factory(size));
	const shell2 = new Shell(factory(size));
	const centerOffset = Math.random() * 0.1 - 0.05;
	const spread = 0.06 + Math.random() * 0.04;
	const height = 0.4 + Math.random() * 0.3;

	shell1.launch(0.5 - spread / 2 + centerOffset, height);
	setTimeout(() => {
		shell2.launch(0.5 + spread / 2 + centerOffset, height + Math.random() * 0.02 - 0.01);
	}, 20 + Math.random() * 40);

	let extraDelay = Math.max(shell1.starLife, shell2.starLife);
	if (shell1.fallingLeaves || shell2.fallingLeaves) {
		extraDelay = 4600;
	}
	return 900 + Math.random() * 600 + extraDelay;
}


const sequences = [
	seqRandomShell,
	seqTwoRandom,
	seqTriple,
	seqPyramid,
	seqSmallBarrage,
	seqMixedVolley,
	seqWideBarrage,
	seqDuoPair
];


// Text firework message — launches characters one by one to spell "HAPPY NEW YEAR"
function seqTextMessage() {
	const charScale = Math.max(8, Math.min(16, stageW / 70));
	const charWidth = charScale * 8;
	const line1 = 'HAPPY';
	const line2 = 'NEW YEAR';

	const line1Y = stageH * 0.28;
	const line2Y = stageH * 0.52;

	const hpad = 60;
	const vpad = 50;
	const minHeight = stageH - stageH * 0.45;

	let delay = 0;

	function launchChar(char, targetX, targetY, d) {
		const position = Math.max(0.05, Math.min(0.95, (targetX - hpad) / (stageW - hpad * 2)));
		const launchHeight = Math.max(0.05, Math.min(0.95, (minHeight - targetY) / (minHeight - vpad)));
		const shell = new Shell(textFireworkShell(char, charScale));
		shell.textTargetX = targetX;
		shell.textTargetY = targetY;
		setTimeout(() => {
			shell.launch(position, launchHeight);
		}, d);
	}

	// Line 1: "HAPPY"
	const line1Width = line1.length * charWidth;
	const line1StartX = (stageW - line1Width) / 2;
	for (let i = 0; i < line1.length; i++) {
		const targetX = line1StartX + i * charWidth + charWidth / 2;
		launchChar(line1[i], targetX, line1Y, delay);
		delay += 60;
	}

	delay += 100;

	// Line 2: "NEW YEAR"
	const line2Width = line2.length * charWidth;
	const line2StartX = (stageW - line2Width) / 2;
	for (let i = 0; i < line2.length; i++) {
		if (line2[i] === ' ') continue;
		const targetX = line2StartX + i * charWidth + charWidth / 2;
		launchChar(line2[i], targetX, line2Y, delay);
		delay += 60;
	}

	return delay + 3500;
}

// Text firework timer
let textFireworkTimerInit = false;
function initTextFireworkTimer() {
	if (textFireworkTimerInit) return;
	textFireworkTimerInit = true;
	setTimeout(() => {
		if (isRunning()) seqTextMessage();
		setInterval(() => {
			if (isRunning()) seqTextMessage();
		}, 60000);
	}, 10000);
}


let isFirstSeq = true;
const finaleCount = 32;
let currentFinaleCount = 0;
function startSequence() {
	if (isFirstSeq) {
		isFirstSeq = false;
		if (IS_HEADER) {
			return seqTwoRandom();
		}
		else {
			const shell = new Shell(crysanthemumShell(shellSizeSelector()));
			shell.launch(0.5, 0.5);
			return 2400;
		}
	}
	
	if (finaleSelector()) {
		seqRandomFastShell();
		if (currentFinaleCount < finaleCount) {
			currentFinaleCount++;
			return 200;
		}
		else {
			currentFinaleCount = 0;
			return 6000;
		}
	}
	
	const rand = Math.random();

	if (rand < 0.10 && Date.now() - seqSmallBarrage.lastCalled > seqSmallBarrage.cooldown) {
		return seqSmallBarrage();
	}

	if (rand < 0.20 && Date.now() - seqWideBarrage.lastCalled > seqWideBarrage.cooldown) {
		return seqWideBarrage();
	}

	if (rand < 0.28) {
		return seqPyramid();
	}

	if (rand < 0.46) {
		return seqMixedVolley();
	}

	if (rand < 0.60) {
		return seqDuoPair();
	}

	if (rand < 0.70 && !IS_HEADER) {
		return seqRandomShell();
	}
	else if (rand < 0.85) {
		return seqTwoRandom();
	}
	else if (rand < 1) {
		return seqTriple();
	}
}


let activePointerCount = 0;
let isUpdatingSpeed = false;

function handlePointerStart(event) {
	activePointerCount++;
	const btnSize = 50;
	
	if (event.y < btnSize) {
		if (event.x < btnSize) {
			togglePause();
			return;
		}
		if (event.x > mainStage.width/2 - btnSize/2 && event.x < mainStage.width/2 + btnSize/2) {
			toggleSound();
			return;
		}
		if (event.x > mainStage.width - btnSize) {
			toggleMenu();
			return;
		}
	}
	
	if (!isRunning()) return;
	
	if (updateSpeedFromEvent(event)) {
		isUpdatingSpeed = true;
	}
	else if (event.onCanvas) {
		launchShellFromConfig(event);
	}
}

function handlePointerEnd(event) {
	activePointerCount--;
	isUpdatingSpeed = false;
}

function handlePointerMove(event) {
	if (!isRunning()) return;
	
	if (isUpdatingSpeed) {
		updateSpeedFromEvent(event);
	}
}

function handleKeydown(event) {
	// P
	if (event.keyCode === 80) {
		togglePause();
	}
	// O
	else if (event.keyCode === 79) {
		toggleMenu();
	}
	// Esc
	else if (event.keyCode === 27) {
		toggleMenu(false);
	}
}

mainStage.addEventListener('pointerstart', handlePointerStart);
mainStage.addEventListener('pointerend', handlePointerEnd);
mainStage.addEventListener('pointermove', handlePointerMove);
window.addEventListener('keydown', handleKeydown);


// Account for window resize and custom scale changes.
function handleResize() {
	const w = window.innerWidth;
	const h = window.innerHeight;
	// Try to adopt screen size, heeding maximum sizes specified
	const containerW = Math.min(w, MAX_WIDTH);
	// Use actual viewport height (window.innerHeight accounts for mobile browser bars)
	const containerH = Math.min(h, MAX_HEIGHT);
	appNodes.stageContainer.style.width = containerW + 'px';
	appNodes.stageContainer.style.height = containerH + 'px';
	stages.forEach(stage => stage.resize(containerW, containerH));
	// Account for scale
	const scaleFactor = scaleFactorSelector();
	stageW = containerW / scaleFactor;
	stageH = containerH / scaleFactor;
}

// Fix viewport height for iOS Safari bottom bar
setupViewportHeightFix();

// Compute initial dimensions
handleResize();

window.addEventListener('resize', handleResize);


// Dynamic globals
let currentFrame = 0;
let speedBarOpacity = 0;
let autoLaunchTime = 0;

function updateSpeedFromEvent(event) {
	if (isUpdatingSpeed || event.y >= mainStage.height - 44) {
		// On phones it's hard to hit the edge pixels in order to set speed at 0 or 1, so some padding is provided to make that easier.
		const edge = 16;
		const newSpeed = (event.x - edge) / (mainStage.width - edge * 2);
		simSpeed = Math.min(Math.max(newSpeed, 0), 1);
		// show speed bar after an update
		speedBarOpacity = 1;
		// If we updated the speed, return true
		return true;
	}
	// Return false if the speed wasn't updated
	return false;
}


// Extracted function to keep `update()` optimized
function updateGlobals(timeStep, lag) {
	currentFrame++;
	
	// Always try to fade out speed bar
	if (!isUpdatingSpeed) {
	speedBarOpacity -= lag / 30; // half a second
		if (speedBarOpacity < 0) {
			speedBarOpacity = 0;
		}
	}
	
	// auto launch shells
	if (store.state.config.autoLaunch) {
		autoLaunchTime -= timeStep;
		if (autoLaunchTime <= 0) {
			autoLaunchTime = startSequence() * 0.95;
		}
	}
}


function update(frameTime, lag) {
	if (!isRunning()) return;

	initTextFireworkTimer();

	const width = stageW;
	const height = stageH;
	const timeStep = frameTime * simSpeed;
	const speed = simSpeed * lag;
	
	updateGlobals(timeStep, lag);
	
	const starDrag = 1 - (1 - Star.airDrag) * speed;
	const starDragHeavy = 1 - (1 - Star.airDragHeavy) * speed;
	const sparkDrag = 1 - (1 - Spark.airDrag) * speed;
	const gAcc = timeStep / 1000 * GRAVITY;

	// Count total sparks to throttle generation when overloaded
	let totalSparks = 0;
	COLOR_CODES_W_INVIS.forEach(color => { totalSparks += Spark.active[color].length; });
	const sparkThrottle = totalSparks > 5000;

	COLOR_CODES_W_INVIS.forEach(color => {
		// Stars
		const stars = Star.active[color];
		for (let i=stars.length-1; i>=0; i=i-1) {
			const star = stars[i];
			// Only update each star once per frame. Since color can change, it's possible a star could update twice without this, leading to a "jump".
			if (star.updateFrame === currentFrame) {
				continue;
			}
			star.updateFrame = currentFrame;

			star.life -= timeStep;
			// Kill stars that fall far off-screen
			if (star.y > height * 2) {
				star.life = 0;
			}
			if (star.life <= 0) {
				// Swap with last element and pop — O(1) instead of splice O(n)
				stars[i] = stars[stars.length - 1];
				stars.pop();
				Star.returnInstance(star);
			} else {
				const burnRate = Math.pow(star.life / star.fullLife, 0.5);
				const burnRateInverse = 1 - burnRate;

				star.prevX = star.x;
				star.prevY = star.y;
				star.x += star.speedX * speed;
				star.y += star.speedY * speed;
				// Apply air drag if star isn't "heavy". The heavy property is used for the shell comets.
				if (!star.heavy) {
					star.speedX *= starDrag;
					star.speedY *= starDrag;
				}
				else {
					star.speedX *= starDragHeavy;
					star.speedY *= starDragHeavy;
				}
				star.speedY += gAcc;
				
				if (star.spinRadius) {
					star.spinAngle += star.spinSpeed * speed;
					star.x += Math.sin(star.spinAngle) * star.spinRadius * speed;
					// Zigzag style: only oscillate horizontally (no vertical wobble)
					if (!star.zigzag) {
						star.y += Math.cos(star.spinAngle) * star.spinRadius * speed;
					}
				}
				
				if (star.sparkFreq) {
					star.sparkTimer -= timeStep;
					while (star.sparkTimer < 0) {
						star.sparkTimer += star.sparkFreq * 0.75 + star.sparkFreq * burnRateInverse * 4;
						// Skip every other spark when overloaded
						if (sparkThrottle && Math.random() < 0.5) continue;
						Spark.add(
							star.x,
							star.y,
							star.sparkColor,
							Math.random() * PI_2,
							Math.random() * star.sparkSpeed * burnRate,
							star.sparkLife * 0.8 + Math.random() * star.sparkLifeVariation * star.sparkLife
						);
					}
				}
				
				// Handle star transitions
				if (star.life < star.transitionTime) {
					if (star.secondColor && !star.colorChanged) {
						star.colorChanged = true;
						star.color = star.secondColor;
						stars[i] = stars[stars.length - 1];
						stars.pop();
						Star.active[star.secondColor].push(star);
						if (star.secondColor === INVISIBLE) {
							star.sparkFreq = 0;
						}
					}
					
					if (star.strobe) {
						// Strobes in the following pattern: on:off:off:on:off:off in increments of `strobeFreq` ms.
						star.visible = Math.floor(star.life / star.strobeFreq) % 3 === 0;
					}
				}

				// Flicker effect for comet ascent trails
				if (star.flickerFreq) {
					star.visible = Math.random() > star.flickerFreq;
				}
			}
		}
											
		// Sparks
		const sparks = Spark.active[color];
		for (let i=sparks.length-1; i>=0; i=i-1) {
			const spark = sparks[i];
			spark.life -= timeStep;
			if (spark.y > height * 2) {
				spark.life = 0;
			}
			if (spark.life <= 0) {
				sparks[i] = sparks[sparks.length - 1];
				sparks.pop();
				Spark.returnInstance(spark);
			} else {
				spark.prevX = spark.x;
				spark.prevY = spark.y;
				spark.x += spark.speedX * speed;
				spark.y += spark.speedY * speed;
				spark.speedX *= sparkDrag;
				spark.speedY *= sparkDrag;
				spark.speedY += gAcc;
			}
		}
	});
	
	render(speed);
}

function render(speed) {
	const { dpr } = mainStage;
	const width = stageW;
	const height = stageH;
	const trailsCtx = trailsStage.ctx;
	const mainCtx = mainStage.ctx;
	
	if (skyLightingSelector() !== SKY_LIGHT_NONE) {
		colorSky(speed);
	}
	
	// Account for high DPI screens, and custom scale factor.
	const scaleFactor = scaleFactorSelector();
	trailsCtx.scale(dpr * scaleFactor, dpr * scaleFactor);
	mainCtx.scale(dpr * scaleFactor, dpr * scaleFactor);
	
	trailsCtx.globalCompositeOperation = 'source-over';
	trailsCtx.fillStyle = `rgba(0, 0, 0, ${store.state.config.longExposure ? 0.0025 : 0.175 * speed})`;
	trailsCtx.fillRect(0, 0, width, height);
	
	mainCtx.clearRect(0, 0, width, height);
	
	// Draw queued burst flashes
	// These must also be drawn using source-over due to Safari. Seems rendering the gradients using lighten draws large black boxes instead.
	// Thankfully, these burst flashes look pretty much the same either way.
	while (BurstFlash.active.length) {
		const bf = BurstFlash.active.pop();
		
		const burstGradient = trailsCtx.createRadialGradient(bf.x, bf.y, 0, bf.x, bf.y, bf.radius);
		burstGradient.addColorStop(0.024, 'rgba(255, 255, 255, 1)');
		burstGradient.addColorStop(0.125, 'rgba(255, 160, 20, 0.2)');
		burstGradient.addColorStop(0.32, 'rgba(255, 140, 20, 0.11)');
		burstGradient.addColorStop(1, 'rgba(255, 120, 20, 0)');
		trailsCtx.fillStyle = burstGradient;
		trailsCtx.fillRect(bf.x - bf.radius, bf.y - bf.radius, bf.radius * 2, bf.radius * 2);
		
		BurstFlash.returnInstance(bf);
	}
	
	// Remaining drawing on trails canvas will use 'lighten' blend mode
	trailsCtx.globalCompositeOperation = 'lighten';
	
	// Draw stars
	trailsCtx.lineWidth = Star.drawWidth;
	trailsCtx.lineCap = isLowQuality ? 'square' : 'round';
	mainCtx.strokeStyle = '#fff';
  mainCtx.lineWidth = 1;
	mainCtx.beginPath();
	COLOR_CODES.forEach(color => {
		const stars = Star.active[color];
		trailsCtx.strokeStyle = color;
		trailsCtx.beginPath();
		stars.forEach(star => {
			if (star.visible) {
				const s = star.drawScale || 1;
				// Scale trail length by drawScale for size variation
				const trailX = star.x + (star.prevX - star.x) * s;
				const trailY = star.y + (star.prevY - star.y) * s;
				trailsCtx.moveTo(star.x, star.y);
				trailsCtx.lineTo(trailX, trailY);
				mainCtx.moveTo(star.x, star.y);
				mainCtx.lineTo(star.x - star.speedX * 1.6 * s, star.y - star.speedY * 1.6 * s);
			}
		});
		trailsCtx.stroke();
	});
	mainCtx.stroke();

	// Draw sparks
	trailsCtx.lineWidth = Spark.drawWidth;
	trailsCtx.lineCap = 'butt';
	COLOR_CODES.forEach(color => {
		const sparks = Spark.active[color];
		trailsCtx.strokeStyle = color;
		trailsCtx.beginPath();
		sparks.forEach(spark => {
			const s = spark.drawScale || 1;
			const trailX = spark.x + (spark.prevX - spark.x) * s;
			const trailY = spark.y + (spark.prevY - spark.y) * s;
			trailsCtx.moveTo(spark.x, spark.y);
			trailsCtx.lineTo(trailX, trailY);
		});
		trailsCtx.stroke();
	});
	
	
	// Render speed bar if visible
	if (speedBarOpacity) {
		const speedBarHeight = 6;
		mainCtx.globalAlpha = speedBarOpacity;
		mainCtx.fillStyle = COLOR.Blue;
		mainCtx.fillRect(0, height - speedBarHeight, width * simSpeed, speedBarHeight);
		mainCtx.globalAlpha = 1;
	}
	
	
	trailsCtx.setTransform(1, 0, 0, 1, 0, 0);
	mainCtx.setTransform(1, 0, 0, 1, 0, 0);
}


// Draw colored overlay based on combined brightness of stars (light up the sky!)
// Note: this is applied to the canvas container's background-color, so it's behind the particles
const currentSkyColor = { r: 0, g: 0, b: 0 };
const targetSkyColor = { r: 0, g: 0, b: 0 };
function colorSky(speed) {
	// The maximum r, g, or b value that will be used (255 would represent no maximum)
	const maxSkySaturation = skyLightingSelector() * 15;
	// How many stars are required in total to reach maximum sky brightness
	const maxStarCount = 500;
	let totalStarCount = 0;
	// Initialize sky as black
	targetSkyColor.r = 0;
	targetSkyColor.g = 0;
	targetSkyColor.b = 0;
	// Add each known color to sky, multiplied by particle count of that color. This will put RGB values wildly out of bounds, but we'll scale them back later.
	// Also add up total star count.
	COLOR_CODES.forEach(color => {
		const tuple = COLOR_TUPLES[color];
		const count =  Star.active[color].length;
		totalStarCount += count;
		targetSkyColor.r += tuple.r * count;
		targetSkyColor.g += tuple.g * count;
		targetSkyColor.b += tuple.b * count;
	});
	
	// Clamp intensity at 1.0, and map to a custom non-linear curve. This allows few stars to perceivably light up the sky, while more stars continue to increase the brightness but at a lesser rate. This is more inline with humans' non-linear brightness perception.
	const intensity = Math.pow(Math.min(1, totalStarCount / maxStarCount), 0.3);
	// Figure out which color component has the highest value, so we can scale them without affecting the ratios.
	// Prevent 0 from being used, so we don't divide by zero in the next step.
	const maxColorComponent = Math.max(1, targetSkyColor.r, targetSkyColor.g, targetSkyColor.b);
	// Scale all color components to a max of `maxSkySaturation`, and apply intensity.
	targetSkyColor.r = targetSkyColor.r / maxColorComponent * maxSkySaturation * intensity;
	targetSkyColor.g = targetSkyColor.g / maxColorComponent * maxSkySaturation * intensity;
	targetSkyColor.b = targetSkyColor.b / maxColorComponent * maxSkySaturation * intensity;
	
	// Animate changes to color to smooth out transitions.
	const colorChange = 10;
	currentSkyColor.r += (targetSkyColor.r - currentSkyColor.r) / colorChange * speed;
	currentSkyColor.g += (targetSkyColor.g - currentSkyColor.g) / colorChange * speed;
	currentSkyColor.b += (targetSkyColor.b - currentSkyColor.b) / colorChange * speed;
	
	appNodes.canvasContainer.style.backgroundColor = `rgb(${currentSkyColor.r | 0}, ${currentSkyColor.g | 0}, ${currentSkyColor.b | 0})`;
}

mainStage.addEventListener('ticker', update);


// Helper used to semi-randomly spread particles over an arc
// Values are flexible - `start` and `arcLength` can be negative, and `randomness` is simply a multiplier for random addition.
function createParticleArc(start, arcLength, count, randomness, particleFactory) {
	const angleDelta = arcLength / count;
	// Sometimes there is an extra particle at the end, too close to the start. Subtracting half the angleDelta ensures that is skipped.
	// Would be nice to fix this a better way.
	const end = start + arcLength - (angleDelta * 0.5);
	
	if (end > start) {
		// Optimization: `angle=angle+angleDelta` vs. angle+=angleDelta
		// V8 deoptimises with let compound assignment
		for (let angle=start; angle<end; angle=angle+angleDelta) {
			particleFactory(angle + Math.random() * angleDelta * randomness);
		}
	} else {
		for (let angle=start; angle>end; angle=angle+angleDelta) {
			particleFactory(angle + Math.random() * angleDelta * randomness);
		}
	}
}


// Helper used to create a spherical burst of particles
function createBurst(count, particleFactory, startAngle=0, arcLength=PI_2) {
	// Assuming sphere with surface area of `count`, calculate various
	// properties of said sphere (unit is stars).
	// Radius
	const R = 0.5 * Math.sqrt(count/Math.PI);
	// Circumference
	const C = 2 * R * Math.PI;
	// Half Circumference
	const C_HALF = C / 2;
	
	// Make a series of rings, sizing them as if they were spaced evenly
	// along the curved surface of a sphere.
	for (let i=0; i<=C_HALF; i++) {
		const ringAngle = i / C_HALF * PI_HALF;
		const ringSize = Math.cos(ringAngle);
		const partsPerFullRing = C * ringSize;
		const partsPerArc = partsPerFullRing * (arcLength / PI_2);
		
		const angleInc = PI_2 / partsPerFullRing;
		const angleOffset = Math.random() * angleInc + startAngle;
		// Each particle needs a bit of randomness to improve appearance.
		const maxRandomAngleOffset = angleInc * 0.33;
		
		for (let i=0; i<partsPerArc; i++) {
			const randomAngleOffset = Math.random() * maxRandomAngleOffset;
			let angle = angleInc * i + angleOffset + randomAngleOffset;
			particleFactory(angle, ringSize);
		}
	}
}




// Various star effects.
// These are designed to be attached to a star's `onDeath` event.

// Crossette breaks star into four same-color pieces which branch in a cross-like shape.
function crossetteEffect(star) {
	const startAngle = Math.random() * PI_HALF;
	createParticleArc(startAngle, PI_2, 4, 0.5, (angle) => {
		Star.add(
			star.x,
			star.y,
			star.color,
			angle,
			Math.random() * 0.6 + 0.75,
			600
		);
	});
}

// Flower is like a mini shell
function floralEffect(star) {
	const count = 12 + 6 * quality;
	createBurst(count, (angle, speedMult) => {
		Star.add(
			star.x,
			star.y,
			star.color,
			angle,
			speedMult * 2.4,
			1000 + Math.random() * 300,
			star.speedX,
			star.speedY
		);
	});
	// Queue burst flash render
	BurstFlash.add(star.x, star.y, 46);
	soundManager.playSound('burstSmall');
} 

// Floral burst with willow stars
function fallingLeavesEffect(star) {
	createBurst(21, (angle, speedMult) => {
		const newStar = Star.add(
			star.x,
			star.y,
			INVISIBLE,
			angle,
			speedMult * 2.4,
			3600 + Math.random() * 1200,
			star.speedX,
			star.speedY
		);

		newStar.sparkColor = COLOR.Gold;
		newStar.sparkFreq = 120 / quality;
		newStar.sparkSpeed = 0.32;
		newStar.sparkLife = 900;
		newStar.sparkLifeVariation = 3.2;
	});
	// Queue burst flash render
	BurstFlash.add(star.x, star.y, 46);
	soundManager.playSound('burstSmall');
}

// Crackle pops into a small cloud of golden sparks.
function crackleEffect(star) {
	const count = isHighQuality ? 32 : 16;
	createParticleArc(0, PI_2, count, 1.8, (angle) => {
		Spark.add(
			star.x,
			star.y,
			COLOR.Gold,
			angle,
			// apply near cubic falloff to speed (places more particles towards outside)
			Math.pow(Math.random(), 0.45) * 2.4,
			300 + Math.random() * 200
		);
	});
}



/**
 * Shell can be constructed with options:
 *
 * spreadSize:      Size of the burst.
 * starCount: Number of stars to create. This is optional, and will be set to a reasonable quantity for size if omitted.
 * starLife:
 * starLifeVariation:
 * color:
 * glitterColor:
 * glitter: One of: 'light', 'medium', 'heavy', 'streamer', 'willow'
 * pistil:
 * pistilColor:
 * streamers:
 * crossette:
 * floral:
 * crackle:
 */
class Shell {
	constructor(options) {
		Object.assign(this, options);
		this.starLifeVariation = options.starLifeVariation || 0.125;
		this.color = options.color || randomColor();
		this.glitterColor = options.glitterColor || this.color;
				
		// Set default starCount if needed, will be based on shell size and scale exponentially, like a sphere's surface area.
		if (!this.starCount) {
			const density = options.starDensity || 1;
			const scaledSize = this.spreadSize / 54;
			this.starCount = Math.max(6, scaledSize * scaledSize * density);
		}
	}
	
	launch(position, launchHeight) {
		const width = stageW;
		const height = stageH;
		// Distance from sides of screen to keep shells.
		const hpad = 60;
		// Distance from top of screen to keep shell bursts.
		const vpad = 50;
		// Minimum burst height, as a percentage of stage height
		const minHeightPercent = 0.45;
		// Minimum burst height in px
		const minHeight = height - height * minHeightPercent;
		
		const launchX = position * (width - hpad * 2) + hpad;
		const launchY = height;
		const burstY = minHeight - (launchHeight * (minHeight - vpad));
		
		const launchDistance = launchY - burstY;
		// Using a custom power curve to approximate Vi needed to reach launchDistance under gravity and air drag.
		// Magic numbers came from testing.
		const launchVelocity = Math.pow(launchDistance * 0.04, 0.64);
		
		const comet = this.comet = Star.add(
			launchX,
			launchY,
			typeof this.color === 'string' && this.color !== 'random' ? this.color : COLOR.White,
			Math.PI,
			launchVelocity * (this.horsetail ? 1.2 : 1),
			// Hang time is derived linearly from Vi; exact number came from testing
			launchVelocity * (this.horsetail ? 100 : 400)
		);
		
		// making comet "heavy" limits air drag
		comet.heavy = true;
		// comet spark trail
		comet.spinRadius = MyMath.random(0.32, 0.85);
		comet.sparkFreq = 32 / quality;
		if (isHighQuality) comet.sparkFreq = 8;
		comet.sparkLife = 320;
		comet.sparkLifeVariation = 3;
		if (this.glitter === 'willow' || this.fallingLeaves) {
			comet.sparkFreq = 20 / quality;
			comet.sparkSpeed = 0.5;
			comet.sparkLife = 500;
		}
		if (this.color === INVISIBLE) {
			comet.sparkColor = COLOR.Gold;
		}
		
		// Randomly make comet "burn out" a bit early.
		// This is disabled for horsetail shells.
		if (Math.random() > 0.4 && !this.horsetail && !this.textChar) {
			comet.secondColor = INVISIBLE;
			comet.transitionTime = Math.pow(Math.random(), 1.5) * 700 + 500;
		}

		// Text shells get a bright golden comet trail
		if (this.textChar) {
			comet.sparkFreq = 14 / quality;
			if (isHighQuality) comet.sparkFreq = 5;
			comet.sparkLife = 500;
			comet.sparkSpeed = 0.35;
			comet.sparkColor = COLOR.Gold;
			comet.secondColor = null;
		}

		// === Launch trail variety ===
		// Skip for shell types with specially tuned ascent trails
		if (!this.horsetail && this.glitter !== 'willow' && !this.fallingLeaves && this.color !== INVISIBLE && !this.textChar) {
			const styleRand = Math.random();
			if (styleRand < 0.10) {
				// Golden comet — dense bright golden trail
				comet.sparkFreq = 12 / quality;
				if (isHighQuality) comet.sparkFreq = 4;
				comet.sparkLife = 600;
				comet.sparkSpeed = 0.4;
				comet.sparkColor = COLOR.Gold;
				comet.secondColor = null;
			} else if (styleRand < 0.20) {
				// Corkscrew — visible spiral ascent
				comet.spinRadius = MyMath.random(2.5, 4.0);
				comet.spinSpeed = MyMath.random(2.0, 3.0);
			} else if (styleRand < 0.27) {
				// Flicker — blinks randomly during ascent
				comet.flickerFreq = MyMath.random(0.25, 0.45);
				comet.sparkFreq = 20 / quality;
				if (isHighQuality) comet.sparkFreq = 6;
			} else if (styleRand < 0.37) {
				// Twin comet — two comets spiraling upward together
				const twin = Star.add(
					launchX, launchY, comet.color,
					Math.PI, launchVelocity, comet.life
				);
				twin.heavy = true;
				const twinSpin = MyMath.random(1.5, 2.5);
				const twinSpinSpeed = MyMath.random(1.5, 2.0);
				twin.spinRadius = twinSpin;
				twin.spinSpeed = twinSpinSpeed;
				twin.spinAngle = comet.spinAngle + Math.PI;
				twin.sparkFreq = comet.sparkFreq;
				twin.sparkLife = comet.sparkLife;
				twin.sparkLifeVariation = comet.sparkLifeVariation;
				twin.sparkSpeed = comet.sparkSpeed;
				twin.sparkColor = comet.sparkColor;
				if (comet.secondColor) {
					twin.secondColor = comet.secondColor;
					twin.transitionTime = comet.transitionTime;
				}
				comet.spinRadius = twinSpin;
				comet.spinSpeed = twinSpinSpeed;
			} else if (styleRand < 0.47) {
				// Sparkler — thick spray of fast sparks in all directions
				comet.sparkFreq = 8 / quality;
				if (isHighQuality) comet.sparkFreq = 3;
				comet.sparkSpeed = 2.0;
				comet.sparkLife = 200;
				comet.sparkLifeVariation = 0.5;
			} else if (styleRand < 0.57) {
				// Crackle rise — periodic bursts of fast short-lived sparks
				comet.sparkFreq = 14 / quality;
				if (isHighQuality) comet.sparkFreq = 5;
				comet.sparkSpeed = 3.0;
				comet.sparkLife = 80;
				comet.sparkLifeVariation = 0.3;
			} else if (styleRand < 0.70) {
				// Bright comet — extra thick long-lived trail, no burnout
				comet.sparkFreq = 10 / quality;
				if (isHighQuality) comet.sparkFreq = 4;
				comet.sparkLife = 800;
				comet.sparkSpeed = 0.3;
				comet.sparkColor = Math.random() < 0.5 ? COLOR.White : comet.color;
				comet.secondColor = null;
			}
			// else: default trail (~30% of launches)
		}

		comet.onDeath = comet => this.burst(comet.x, comet.y);

		soundManager.playSound('lift');
	}
	
	burst(x, y) {
		// Text firework — burst into letter shape
		if (this.textChar) {
			this.burstTextChar(x, y);
			return;
		}

		// Set burst speed so overall burst grows to set size. This specific formula was derived from testing, and is affected by simulated air drag.
		const speed = this.spreadSize / 96;

		let color, onDeath, sparkFreq, sparkSpeed, sparkLife;
		let sparkLifeVariation = 0.25;
		// Some death effects, like crackle, play a sound, but should only be played once.
		let playedDeathSound = false;
		
		if (this.crossette) onDeath = (star) => {
			if (!playedDeathSound) {
				soundManager.playSound('crackleSmall');
				playedDeathSound = true;
			}
			crossetteEffect(star);
		}
		if (this.crackle) onDeath = (star) => {
			if (!playedDeathSound) {
				soundManager.playSound('crackle');
				playedDeathSound = true;
			}
			crackleEffect(star);
		}
		if (this.floral) onDeath = floralEffect;
		if (this.fallingLeaves) onDeath = fallingLeavesEffect;
		
		if (this.glitter === 'light') {
			sparkFreq = 400;
			sparkSpeed = 0.3;
			sparkLife = 300;
			sparkLifeVariation = 2;
		}
		else if (this.glitter === 'medium') {
			sparkFreq = 200;
			sparkSpeed = 0.44;
			sparkLife = 700;
			sparkLifeVariation = 2;
		}
		else if (this.glitter === 'heavy') {
			sparkFreq = 80;
			sparkSpeed = 0.8;
			sparkLife = 1400;
			sparkLifeVariation = 2;
		}
		else if (this.glitter === 'thick') {
			sparkFreq = 16;
			sparkSpeed = isHighQuality ? 1.65 : 1.5;
			sparkLife = 1400;
			sparkLifeVariation = 3;
		}
		else if (this.glitter === 'streamer') {
			sparkFreq = 32;
			sparkSpeed = 1.05;
			sparkLife = 620;
			sparkLifeVariation = 2;
		}
		else if (this.glitter === 'willow') {
			sparkFreq = 120;
			sparkSpeed = 0.34;
			sparkLife = 1400;
			sparkLifeVariation = 3.8;
		}
		
		// Apply quality to spark count
		sparkFreq = sparkFreq / quality;
		
		// Star factory for primary burst, pistils, and streamers.
		let firstStar = true;
		const starFactory = (angle, speedMult) => {
			// For non-horsetail shells, compute an initial vertical speed to add to star burst.
			// The magic number comes from testing what looks best. The ideal is that all shell
			// bursts appear visually centered for the majority of the star life (excl. willows etc.)
			const standardInitialSpeed = this.spreadSize / 1800;
			
			const star = Star.add(
				x,
				y,
				color || randomColor(),
				angle,
				speedMult * speed,
				// add minor variation to star life
				this.starLife + Math.random() * this.starLife * this.starLifeVariation,
				this.horsetail ? this.comet && this.comet.speedX : 0,
				this.horsetail ? this.comet && this.comet.speedY : -standardInitialSpeed
			);
	
			if (this.secondColor) {
				star.transitionTime = this.starLife * (Math.random() * 0.05 + 0.32);
				star.secondColor = this.secondColor;
			}

			if (this.strobe) {
				star.transitionTime = this.starLife * (Math.random() * 0.08 + 0.46);
				star.strobe = true;
				// How many milliseconds between switch of strobe state "tick". Note that the strobe pattern
				// is on:off:off, so this is the "on" duration, while the "off" duration is twice as long.
				star.strobeFreq = Math.random() * 20 + 40;
				if (this.strobeColor) {
					star.secondColor = this.strobeColor;
				}
			}
			
			star.onDeath = onDeath;

			if (this.glitter) {
				star.sparkFreq = sparkFreq;
				star.sparkSpeed = sparkSpeed;
				star.sparkLife = sparkLife;
				star.sparkLifeVariation = sparkLifeVariation;
				star.sparkColor = this.glitterColor;
				star.sparkTimer = Math.random() * star.sparkFreq;
			}
		};


		if (typeof this.color === 'string') {
			if (this.color === 'random') {
				color = null; // falsey value creates random color in starFactory
			} else {
				color = this.color;
			}
			
			// Rings have positional randomness, but are rotated randomly
			if (this.ring) {
				const ringStartAngle = Math.random() * Math.PI;
				const ringSquash = Math.pow(Math.random(), 2) * 0.85 + 0.15;;
				
				createParticleArc(0, PI_2, this.starCount, 0, angle => {
					// Create a ring, squashed horizontally
					const initSpeedX = Math.sin(angle) * speed * ringSquash;
					const initSpeedY = Math.cos(angle) * speed;
					// Rotate ring
					const newSpeed = MyMath.pointDist(0, 0, initSpeedX, initSpeedY);
					const newAngle = MyMath.pointAngle(0, 0, initSpeedX, initSpeedY) + ringStartAngle;
					const star = Star.add(
						x,
						y,
						color,
						newAngle,
						// apply near cubic falloff to speed (places more particles towards outside)
						newSpeed,//speed,
						// add minor variation to star life
						this.starLife + Math.random() * this.starLife * this.starLifeVariation
					);
					
					if (this.glitter) {
						star.sparkFreq = sparkFreq;
						star.sparkSpeed = sparkSpeed;
						star.sparkLife = sparkLife;
						star.sparkLifeVariation = sparkLifeVariation;
						star.sparkColor = this.glitterColor;
						star.sparkTimer = Math.random() * star.sparkFreq;
					}
				});
			}
			// Fan burst — upper half-sphere only
			else if (this.fan) {
				// PI/2 to 3PI/2 covers the upward-facing hemisphere
				createBurst(this.starCount, starFactory, PI_HALF, Math.PI);
			}
			// Normal burst
			else {
				createBurst(this.starCount, starFactory);
			}
		}
		else if (Array.isArray(this.color)) {
			if (Math.random() < 0.5) {
				const start = Math.random() * Math.PI;
				const start2 = start + Math.PI;
				const arc = Math.PI;
				color = this.color[0];
				// Not creating a full arc automatically reduces star count.
				createBurst(this.starCount, starFactory, start, arc);
				color = this.color[1];
				createBurst(this.starCount, starFactory, start2, arc);
			} else {
				color = this.color[0];
				createBurst(this.starCount / 2, starFactory);
				color = this.color[1];
				createBurst(this.starCount / 2, starFactory);
			}
		}
		else {
			throw new Error('Invalid shell color. Expected string or array of strings, but got: ' + this.color);
		}
		
		if (this.pistil) {
			const innerShell = new Shell({
				spreadSize: this.spreadSize * 0.5,
				starLife: this.starLife * 0.6,
				starLifeVariation: this.starLifeVariation,
				starDensity: 1.4,
				color: this.pistilColor,
				glitter: 'light',
				glitterColor: this.pistilColor === COLOR.Gold ? COLOR.Gold : COLOR.White
			});
			innerShell.burst(x, y);
		}
		
		if (this.streamers) {
			const innerShell = new Shell({
				spreadSize: this.spreadSize * 0.9,
				starLife: this.starLife * 0.8,
				starLifeVariation: this.starLifeVariation,
				starCount: Math.floor(Math.max(6, this.spreadSize / 45)),
				color: COLOR.White,
				glitter: 'streamer'
			});
			innerShell.burst(x, y);
		}

		// Queue burst flash render
		BurstFlash.add(x, y, this.spreadSize / 4);

		// Play sound, but only for "original" shell, the one that was launched.
		// We don't want multiple sounds from pistil or streamer "sub-shells".
		// This can be detected by the presence of a comet.
		if (this.comet) {
			// Scale explosion sound based on current shell size and selected (max) shell size.
			// Shooting selected shell size will always sound the same no matter the selected size,
			// but when smaller shells are auto-fired, they will sound smaller. It doesn't sound great
			// when a value too small is given though, so instead of basing it on proportions, we just
			// look at the difference in size and map it to a range known to sound good.
			const maxDiff = 2;
			const sizeDifferenceFromMaxSize = Math.min(maxDiff, shellSizeSelector() - this.shellSize);
			const soundScale = (1 - sizeDifferenceFromMaxSize / maxDiff) * 0.3 + 0.7;
			soundManager.playSound('burst', soundScale);
		}
	}

	burstTextChar(x, y) {
		const bitmap = TEXT_BITMAP[this.textChar];
		if (!bitmap) return;

		const scale = this.charScale;
		const cols = 7;
		const rows = bitmap.length;

		// Use stored target position for precise text placement
		const cx = this.textTargetX !== undefined ? this.textTargetX : x;
		const cy = this.textTargetY !== undefined ? this.textTargetY : y;

		const startX = cx - (cols - 1) * scale / 2;
		const startY = cy - (rows - 1) * scale / 2;

		const colors = [COLOR.Gold, COLOR.White, COLOR.Red, COLOR.Purple, COLOR.Blue, COLOR.Green, COLOR.Gold, COLOR.White];
		const starsPerPixel = isLowQuality ? 5 : 10;

		for (let row = 0; row < rows; row++) {
			for (let col = 0; col < cols; col++) {
				if (bitmap[row] & (1 << (cols - 1 - col))) {
					const px = startX + col * scale;
					const py = startY + row * scale;

					for (let i = 0; i < starsPerPixel; i++) {
						const starColor = colors[Math.random() * colors.length | 0];
						const star = Star.add(
							px + (Math.random() - 0.5) * scale * 0.6,
							py + (Math.random() - 0.5) * scale * 0.6,
							starColor,
							Math.random() * PI_2,
							0.1 + Math.random() * 0.18,
							2800 + Math.random() * 1000
						);
						star.sparkFreq = 28;
						star.sparkSpeed = 0.55;
						star.sparkLife = 350;
						star.sparkColor = starColor;
						// 45% of stars twinkle for sparkly look
						if (Math.random() < 0.45) {
							star.strobe = true;
							star.strobeFreq = MyMath.random(25, 65);
							star.transitionTime = star.fullLife;
						} else {
							star.secondColor = INVISIBLE;
							star.transitionTime = star.fullLife * 0.25;
						}
					}
				}
			}
		}

		BurstFlash.add(cx, cy, 16);
		soundManager.playSound('burstSmall');
	}
}



const BurstFlash = {
	active: [],
	_pool: [],
	
	_new() {
		return {}
	},
	
	add(x, y, radius) {
		const instance = this._pool.pop() || this._new();
		
		instance.x = x;
		instance.y = y;
		instance.radius = radius;
		
		this.active.push(instance);
		return instance;
	},
	
	returnInstance(instance) {
		this._pool.push(instance);
	}
};



// Helper to generate objects for storing active particles.
// Particles are stored in arrays keyed by color (code, not name) for improved rendering performance.
function createParticleCollection() {
	const collection = {};
	COLOR_CODES_W_INVIS.forEach(color => {
		collection[color] = [];
	});
	return collection;
}


// Star properties (WIP)
// -----------------------
// transitionTime - how close to end of life that star transition happens

const Star = {
	// Visual properties
	drawWidth: 3,
	airDrag: 0.98,
	airDragHeavy: 0.992,
	
	// Star particles will be keyed by color
	active: createParticleCollection(),
	_pool: [],
	
	_new() {
		return {};
	},

	add(x, y, color, angle, speed, life, speedOffX, speedOffY) {
		const instance = this._pool.pop() || this._new();
		
		instance.visible = true;
		instance.heavy = false;
		instance.x = x;
		instance.y = y;
		instance.prevX = x;
		instance.prevY = y;
		instance.color = color;
		instance.speedX = Math.sin(angle) * speed + (speedOffX || 0);
		instance.speedY = Math.cos(angle) * speed + (speedOffY || 0);
		instance.life = life;
		instance.fullLife = life;
		instance.spinAngle = Math.random() * PI_2;
		instance.spinSpeed = 0.8;
		instance.spinRadius = 0;
		instance.sparkFreq = 0; // ms between spark emissions
		instance.sparkSpeed = 1;
		instance.sparkTimer = 0;
		instance.sparkColor = color;
		instance.sparkLife = 750;
		instance.sparkLifeVariation = 0.25;
		instance.strobe = false;
		instance.drawScale = 0.8 + Math.random() * 0.4; // ±20% size variation

		this.active[color].push(instance);
		return instance;
	},

	// Public method for cleaning up and returning an instance back to the pool.
	returnInstance(instance) {
		// Call onDeath handler if available (and pass it current star instance)
		instance.onDeath && instance.onDeath(instance);
		// Clean up
		instance.onDeath = null;
		instance.secondColor = null;
		instance.transitionTime = 0;
		instance.colorChanged = false;
		instance.flickerFreq = 0;
		instance.zigzag = false;
		// Add back to the pool.
		this._pool.push(instance);
	}
};


const Spark = {
	// Visual properties
	drawWidth: 0, // set in `configDidUpdate()`
	airDrag: 0.9,
	
	// Star particles will be keyed by color
	active: createParticleCollection(),
	_pool: [],
	
	_new() {
		return {};
	},

	add(x, y, color, angle, speed, life) {
		const instance = this._pool.pop() || this._new();
		
		instance.x = x;
		instance.y = y;
		instance.prevX = x;
		instance.prevY = y;
		instance.color = color;
		instance.speedX = Math.sin(angle) * speed;
		instance.speedY = Math.cos(angle) * speed;
		instance.life = life;
		instance.drawScale = 0.8 + Math.random() * 0.4;

		this.active[color].push(instance);
		return instance;
	},

	// Public method for cleaning up and returning an instance back to the pool.
	returnInstance(instance) {
		// Add back to the pool.
		this._pool.push(instance);
	}
};



const soundManager = {
	baseURL: 'https://s3-us-west-2.amazonaws.com/s.cdpn.io/329180/',
	ctx: new (window.AudioContext || window.webkitAudioContext),
	sources: {
		lift: {
			volume: 1,
			playbackRateMin: 0.85,
			playbackRateMax: 0.95,
			fileNames: [
				'lift1.mp3',
				'lift2.mp3',
				'lift3.mp3'
			]
		},
		burst: {
			volume: 1,
			playbackRateMin: 0.8,
			playbackRateMax: 0.9,
			fileNames: [
				'burst1.mp3',
				'burst2.mp3'
			]
		},
		burstSmall: {
			volume: 0.25,
			playbackRateMin: 0.8,
			playbackRateMax: 1,
			fileNames: [
				'burst-sm-1.mp3',
				'burst-sm-2.mp3'
			]
		},
		crackle: {
			volume: 0.2,
			playbackRateMin: 1,
			playbackRateMax: 1,
			fileNames: ['crackle1.mp3']
		},
		crackleSmall: {
			volume: 0.3,
			playbackRateMin: 1,
			playbackRateMax: 1,
			fileNames: ['crackle-sm-1.mp3']
		}
	},

	preload() {
		const allFilePromises = [];

		function checkStatus(response) {
			if (response.status >= 200 && response.status < 300) {
				return response;
			}
			const customError = new Error(response.statusText);
			customError.response = response;
			throw customError;
		}

		const types = Object.keys(this.sources);
		types.forEach(type => {
			const source = this.sources[type];
			const { fileNames } = source;
			const filePromises = [];
			fileNames.forEach(fileName => {
				const fileURL = this.baseURL + fileName;
				// Promise will resolve with decoded audio buffer.
				const promise = fetch(fileURL)
					.then(checkStatus)
					.then(response => response.arrayBuffer())
					.then(data => new Promise(resolve => {
						this.ctx.decodeAudioData(data, resolve);
					}));

				filePromises.push(promise);
				allFilePromises.push(promise);
			});

			Promise.all(filePromises)
				.then(buffers => {
					source.buffers = buffers;
				});
		});

		return Promise.all(allFilePromises);
	},
	
	pauseAll() {
		this.ctx.suspend();
	},

	resumeAll() {
		// Play a sound with no volume for iOS. This 'unlocks' the audio context when the user first enables sound.
		this.playSound('lift', 0);
		// Chrome mobile requires interaction before starting audio context.
		// The sound toggle button is triggered on 'touchstart', which doesn't seem to count as a full
		// interaction to Chrome. I guess it needs a click? At any rate if the first thing the user does
		// is enable audio, it doesn't work. Using a setTimeout allows the first interaction to be registered.
		// Perhaps a better solution is to track whether the user has interacted, and if not but they try enabling
		// sound, show a tooltip that they should tap again to enable sound.
		setTimeout(() => {
			this.ctx.resume();
		}, 250);
	},
	
	// Private property used to throttle small burst sounds.
	_lastSmallBurstTime: 0,

	/**
	 * Play a sound of `type`. Will randomly pick a file associated with type, and play it at the specified volume
	 * and play speed, with a bit of random variance in play speed. This is all based on `sources` config.
	 *
	 * @param  {string} type - The type of sound to play.
	 * @param  {?number} scale=1 - Value between 0 and 1 (values outside range will be clamped). Scales less than one
	 *                             descrease volume and increase playback speed. This is because large explosions are
	 *                             louder, deeper, and reverberate longer than small explosions.
	 *                             Note that a scale of 0 will mute the sound.
	 */
	playSound(type, scale=1) {
		// Ensure `scale` is within valid range.
		scale = MyMath.clamp(scale, 0, 1);

		// Disallow starting new sounds if sound is disabled, app is running in slow motion, or paused.
		// Slow motion check has some wiggle room in case user doesn't finish dragging the speed bar
		// *all* the way back.
		if (!canPlaySoundSelector() || simSpeed < 0.95) {
			return;
		}
		
		// Throttle small bursts, since floral/falling leaves shells have a lot of them.
		if (type === 'burstSmall') {
			const now = Date.now();
			if (now - this._lastSmallBurstTime < 20) {
				return;
			}
			this._lastSmallBurstTime = now;
		}
		
		const source = this.sources[type];

		if (!source) {
			throw new Error(`Sound of type "${type}" doesn't exist.`);
		}
		
		const initialVolume = source.volume;
		const initialPlaybackRate = MyMath.random(
			source.playbackRateMin,
			source.playbackRateMax
		);
		
		// Volume descreases with scale.
		const scaledVolume = initialVolume * scale;
		// Playback rate increases with scale. For this, we map the scale of 0-1 to a scale of 2-1.
		// So at a scale of 1, sound plays normally, but as scale approaches 0 speed approaches double.
		const scaledPlaybackRate = initialPlaybackRate * (2 - scale);
		
		const gainNode = this.ctx.createGain();
		gainNode.gain.value = scaledVolume;

		const buffer = MyMath.randomChoice(source.buffers);
		const bufferSource = this.ctx.createBufferSource();
		bufferSource.playbackRate.value = scaledPlaybackRate;
		bufferSource.buffer = buffer;
		bufferSource.connect(gainNode);
		gainNode.connect(this.ctx.destination);
		bufferSource.start(0);
	}
};




// Kick things off.

function setLoadingStatus(status) {
	document.querySelector('.loading-init__status').textContent = status;
}

// CodePen profile header doesn't need audio, just initialize.
if (IS_HEADER) {
	init();
} else {
	// Allow status to render, then preload assets and start app.
	setLoadingStatus('Lighting Fuses');
	setTimeout(() => {
		soundManager.preload()
		.then(
			init,
			reason => {
				// Codepen preview doesn't like to load the audio, so just init to fix the preview for now.
				init();
				// setLoadingStatus('Error Loading Audio');
				return Promise.reject(reason);
			}
		);
	}, 0);
}