window.__ModuleLoader__.load({
	id: "dsh-background",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		let react = require("react");
		let store = require("@deepseek-ai/dsh-client-store");

		//#region stylesheet
		const css = ".cbg-layer{position:fixed;inset:0;z-index:-1;overflow:hidden;pointer-events:none;display:none}.dsh-chatbg-on .cbg-layer{display:block}body.dsh-chatbg-on{background:transparent}.cbg-layerImg{position:absolute;inset:0;width:100%;height:100%;object-fit:scale-down;will-change:transform;user-select:none;-webkit-user-drag:none}body.dsh-chatbg-on .cbg-layer{background-color:var(--dsw-static-neutral-bluish-00,#f8f9fa)}body.dsh-chatbg-on[data-ds-dark-theme] .cbg-layer{background-color:var(--dsw-static-neutral-bluish-950,#101418)}body.dsh-chatbg-on .cbg-layer.cbg-layerLight{background-color:var(--dsw-static-neutral-bluish-00,#f8f9fa)}body.dsh-chatbg-on .cbg-layer.cbg-layerDark{background-color:var(--dsw-static-neutral-bluish-950,#101418)}.cbg-layerScrim{position:absolute;inset:0}.cbg-btn{display:inline-flex;align-items:center;justify-content:center;width:28px;height:28px;box-sizing:border-box;padding:0;border:0;border-radius:8px;background:0 0;color:var(--dsw-alias-label-secondary);cursor:pointer}.cbg-btn:hover{color:var(--dsw-alias-label-primary);background:var(--dsw-alias-interactive-bg-hover)}.cbg-btn svg{flex:none}.cbg-modal{position:fixed;inset:0;z-index:90;background:var(--dsw-alias-bg-mask-3,rgba(0,0,0,.48));pointer-events:auto}.cbg-dialog{position:absolute;display:flex;flex-direction:column;max-width:94vw;max-height:92vh;overflow:hidden;box-sizing:border-box;padding:12px 16px 14px;border:1px solid var(--dsw-alias-border-l3);border-radius:14px;background:linear-gradient(var(--dsw-specific-menu,rgba(248,249,250,.97)),var(--dsw-specific-menu,rgba(248,249,250,.97))) var(--dsw-alias-bg-layer-1,#f8f9fa);color:var(--dsw-alias-label-primary);box-shadow:var(--dsw-elevation-prominent)}.cbg-body{flex:0 1 auto;min-height:0;overflow-y:auto;display:flex;flex-direction:column}.cbg-grip{position:absolute;z-index:3;touch-action:none}.cbg-gripE{top:8px;right:0;bottom:8px;width:6px;cursor:ew-resize}.cbg-gripS{left:8px;right:8px;bottom:0;height:6px;cursor:ns-resize}.cbg-gripSe{right:0;bottom:0;width:16px;height:16px;cursor:nwse-resize;border-bottom-right-radius:14px;background:repeating-linear-gradient(-45deg,transparent 0 4px,var(--dsw-alias-label-tertiary) 4px 5px);opacity:.45}.cbg-previewPanels{position:absolute;pointer-events:none}.cbg-previewFrame{position:absolute;pointer-events:none;box-sizing:border-box;border:1.5px dashed var(--dsw-alias-border-l4);box-shadow:0 0 0 100vmax rgba(0,0,0,.28)}.cbg-head{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;flex:none;cursor:move;user-select:none;touch-action:none}.cbg-title{margin:0;font-size:14px;font-weight:600;line-height:20px}.cbg-sub{margin:2px 0 0;font-size:12px;line-height:16px;color:var(--dsw-alias-label-tertiary)}.cbg-x{border:0;border-radius:8px;background:0 0;color:var(--dsw-alias-label-tertiary);cursor:pointer;font-size:16px;line-height:20px;padding:2px 8px}.cbg-x:hover{color:var(--dsw-alias-label-primary);background:var(--dsw-alias-interactive-bg-hover)}.cbg-preview{position:relative;flex:1 1 auto;min-height:140px;margin-top:12px;width:100%;box-sizing:border-box;border:1px solid var(--dsw-alias-border-l2);border-radius:10px;overflow:hidden;background:var(--dsw-alias-bg-layer-3,var(--dsw-alias-bg-layer-1,#f8f9fa));cursor:grab;touch-action:none;user-select:none}.cbg-previewGrabbing{cursor:grabbing}.cbg-previewStage{position:absolute;left:0;top:0;width:100vw;height:100vh;transform-origin:0 0;pointer-events:none}.cbg-previewImg{position:absolute;inset:0;width:100%;height:100%;object-fit:scale-down;pointer-events:none}.cbg-previewScrim{position:absolute;inset:0;pointer-events:none}.cbg-previewHint{position:absolute;left:8px;bottom:6px;right:8px;font-size:11px;line-height:14px;color:#fff;text-shadow:0 1px 3px rgba(0,0,0,.9);pointer-events:none}.cbg-rows{display:flex;flex-direction:column;gap:10px;margin-top:12px}.cbg-row{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap}.cbg-label{font-size:12px;line-height:18px;color:var(--dsw-alias-label-secondary);white-space:nowrap}.cbg-range{flex:1;min-width:120px;accent-color:var(--dsw-alias-brand-primary)}.cbg-value{font-size:12px;line-height:18px;color:var(--dsw-alias-label-tertiary);min-width:48px;text-align:right}.cbg-num{box-sizing:border-box;width:62px;padding:2px 6px;border:1px solid var(--dsw-alias-border-l3);border-radius:6px;background:var(--dsw-alias-bg-layer-1);color:var(--dsw-alias-label-primary);font-size:12px;line-height:18px;text-align:right;font-variant-numeric:tabular-nums}.cbg-num:focus{outline:2px solid var(--dsw-alias-border-l3);outline-offset:-1px}.cbg-hex{box-sizing:border-box;width:92px;padding:2px 6px;border:1px solid var(--dsw-alias-border-l3);border-radius:6px;background:var(--dsw-alias-bg-layer-1);color:var(--dsw-alias-label-primary);font-size:12px;line-height:18px;font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace}.cbg-hex:focus{outline:2px solid var(--dsw-alias-border-l3);outline-offset:-1px}.cbg-actions{display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-top:14px}.cbg-actions2{display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-top:8px}.cbg-button{border:1px solid var(--dsw-alias-border-l3);border-radius:8px;background:var(--dsw-alias-bg-layer-1);color:var(--dsw-alias-label-primary);font:inherit;font-size:12px;line-height:18px;padding:4px 10px;cursor:pointer}.cbg-button:hover{background:var(--dsw-alias-interactive-bg-hover)}.cbg-buttonPrimary{background:var(--dsw-alias-brand-primary);border-color:transparent;color:var(--dsw-alias-label-primary-foreground)}.cbg-color{width:36px;height:26px;padding:0;border:1px solid var(--dsw-alias-border-l3);border-radius:6px;background:0 0;cursor:pointer}.cbg-error{margin-top:10px;font-size:12px;line-height:16px;color:var(--dsw-alias-state-error-primary)}.cbg-card{display:flex;align-items:center;justify-content:space-between;gap:16px;flex-wrap:wrap;padding:12px;border:1px solid var(--dsw-alias-border-l3);border-radius:12px}.cbg-cardText{display:flex;flex-direction:column;gap:2px;min-width:0;flex:1}.cbg-cardTitle{margin:0;font-size:13px;font-weight:600;line-height:18px;color:var(--dsw-alias-label-primary)}.cbg-cardDesc{margin:0;font-size:12px;line-height:16px;color:var(--dsw-alias-label-tertiary)}.cbg-configNote{margin:0;font-size:12px;line-height:16px;color:var(--dsw-alias-label-secondary)}.cbg-cardControls{display:flex;align-items:center;gap:12px;flex-wrap:wrap;justify-content:flex-end}.cbg-segmented{display:inline-flex;align-items:stretch;border:1px solid var(--dsw-alias-border-l3);border-radius:8px;background:var(--dsw-alias-bg-layer-1);padding:2px;gap:2px}.cbg-seg{border:0;border-radius:6px;background:0 0;color:var(--dsw-alias-label-tertiary);font-size:11px;line-height:18px;padding:1px 8px;cursor:pointer}.cbg-seg:hover{color:var(--dsw-alias-label-primary)}.cbg-segActive{background:var(--dsw-alias-bg-layer-3);color:var(--dsw-alias-label-primary)}";
		const tagId = "dsh-background/background.css";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId) + "]") === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "dsh-background";
			tag.dataset.pluginCss = tagId;
			tag.textContent = css;
			document.head.appendChild(tag);
		}
		//#endregion
		//#region lib/types/client/locales.js
		/** English dictionary — the fallback terminus of every locale chain. */
		const en = {
			"button.title": "Chat background",
			"dialog.title": "This chat's background",
			"dialog.sub": "The photo is set per chat; without a photo the background stays system.",
			"dialog.pick": "Choose photo",
			"dialog.replace": "Replace photo",
			"dialog.remove": "Remove photo",
			"dialog.reset": "Reset frame",
			"dialog.close": "Close",
			"dialog.drag": "Drag the preview to shift the photo.",
			"dialog.noPhoto": "No photo yet — pick one below.",
			"dialog.zoom": "Zoom",
			"dialog.scrim": "Dim / lighten",
			"dialog.fontColor": "Font color",
			"dialog.fontSystem": "System",
			"error.uploadFailed": "Could not upload the photo.",
			"error.tooLarge": "The photo is larger than 40 MB.",
			"error.preset": "Could not read the preset file.",
			"dialog.savePreset": "Save preset",
			"dialog.loadPreset": "Load preset",
			"error.offline": "The plugin host routes are not reachable — reload the page or restart the web server once after installing.",
			"settings.description": "A header button opens per-chat background settings: photo, framing, dim, font color. The plugin switch lives on the Plugins page row.",
			"settings.transparency": "Panels over the photo",
			"settings.language": "Language",
			"settings.languageAuto": "Auto",
			"settings.loading": "Loading configuration…",
			"settings.unavailable": "Configuration is unavailable in this session.",
			"settings.retry": "Retry"
		};
		/** Russian dictionary, key-identical to the English source of truth. */
		const ru = {
			"button.title": "Фон чата",
			"dialog.title": "Фон этого чата",
			"dialog.sub": "Фото задаётся для каждого чата отдельно; без фото фон системный.",
			"dialog.pick": "Выбрать фото",
			"dialog.replace": "Заменить фото",
			"dialog.remove": "Убрать фото",
			"dialog.reset": "Сбросить кадр",
			"dialog.close": "Закрыть",
			"dialog.drag": "Перетаскивайте превью, чтобы сдвинуть фото.",
			"dialog.noPhoto": "Фото пока нет — выберите ниже.",
			"dialog.zoom": "Приближение",
			"dialog.scrim": "Затемнение / засветка",
			"dialog.fontColor": "Цвет шрифта",
			"dialog.fontSystem": "Системный",
			"error.uploadFailed": "Не удалось загрузить фото.",
			"error.tooLarge": "Фото больше 40 МБ.",
			"error.preset": "Не удалось прочитать файл пресета.",
			"dialog.savePreset": "Сохранить пресет",
			"dialog.loadPreset": "Загрузить пресет",
			"error.offline": "Маршруты плагина недоступны — перезагрузите страницу, а после установки один раз перезапустите web-сервер.",
			"settings.description": "Кнопка в шапке чата открывает настройки фона: фото, сдвиг кадра, затемнение, цвет шрифта. Выключатель плагина — на странице Плагины, в строке.",
			"settings.transparency": "Панели поверх фото",
			"settings.language": "Язык",
			"settings.languageAuto": "Авто",
			"settings.loading": "Загрузка конфигурации…",
			"settings.unavailable": "Конфигурация недоступна в этой сессии.",
			"settings.retry": "Повторить"
		};
		//#endregion
		//#region lib/types/client/model.js
		const API = "/chat-background";

		/** Identity selector for snapshot-store hooks. */
		function identity(value) {
			return value;
		}

		/** One chat's background config; imageId null means "system background". */
		const DEFAULT_CFG = { imageId: null, offsetX: 0, offsetY: 0, zoom: 1, scrim: 0, fontColor: null };

		function clampNum(value, fallback, min, max) {
			const n = typeof value === "string" ? Number(value) : value;
			if (typeof n !== "number" || !Number.isFinite(n)) return fallback;
			return Math.max(min, Math.min(max, n));
		}

		function normalizeCfg(raw) {
			if (raw === null || typeof raw !== "object") return { ...DEFAULT_CFG };
			const imageId = typeof raw.imageId === "string" && /^[a-f0-9]{20}\.[a-z]{3,4}$/.test(raw.imageId) ? raw.imageId : null;
			let fontColor = null;
			if (typeof raw.fontColor === "string" && /^#[0-9a-fA-F]{3}(?:[0-9a-fA-F]{3}){0,2}$/.test(raw.fontColor)) fontColor = raw.fontColor;
			return {
				imageId,
				offsetX: Math.round(clampNum(raw.offsetX, 0, -20000, 20000)),
				offsetY: Math.round(clampNum(raw.offsetY, 0, -20000, 20000)),
				zoom: clampNum(raw.zoom, 1, 1, 8),
				scrim: Math.round(clampNum(raw.scrim, 0, -100, 100)),
				fontColor
			};
		}

		const LANG_LIST = ["auto", "en", "ru"];

		function normalizeSection(value) {
			const panelTransparency = Math.round(clampNum(value ? value.panelTransparency : undefined, 30, 0, 85));
			const language = typeof (value ? value.language : undefined) === "string" && LANG_LIST.indexOf(value.language) >= 0 ? value.language : "auto";
			return { panelTransparency, language };
		}

		/** Pick a dictionary for an explicit language; falls back to English. */
		function makeT(lang) {
			const dict = lang === "ru" ? ru : en;
			return (key) => (dict[key] !== undefined ? dict[key] : en[key] !== undefined ? en[key] : key);
		}

		/** `auto` keeps the seat's page-locale translator; en/ru pin the card language. */
		function resolveT(reader, seatT) {
			if (reader !== null && typeof reader === "object" && reader.status === "ready") {
				const language = normalizeSection(reader.value).language;
				if (language === "ru" || language === "en") return makeT(language);
			}
			return typeof seatT === "function" ? seatT : makeT("en");
		}

		/** Per-chat configs: { status: 'loading'|'ready'|'error', sessions: {id: cfg} }. */
		const bgStore = store.createSnapshotStore({ status: "loading", sessions: {} });
		/** Dialog state shared between the header button and the overlay dialog. */
		const viewStore = store.createSnapshotStore({ open: false, sessionId: null, error: null });
		/**
		 * Drag-time override for the (global) panel transparency: the slider
		 * paints live through this store while the debounced settings write
		 * settles, so dragging feels as direct as the per-chat controls.
		 * `value: null` means "no override — take the settings mirror".
		 */
		const tpStore = store.createSnapshotStore({ value: null });

		/**
		 * rc.2: the viewed session is the row the main view retains
		 * (`retainedBy.mainView > 0` — the idiom DocumentTitle, the workspace
		 * browser and the settings root all use). A blank row is the
		 * New-session plate and counts as no session at all. Never throws.
		 * @param {{ byId?: Record<string, unknown> }} state - sessions snapshot.
		 * @returns {string | null} the viewed session id.
		 */
		function pickViewedSession(state) {
			try {
				if (state === null || typeof state !== "object" || state.byId === undefined || state.byId === null) return null;
				const rows = Object.values(state.byId);
				for (const row of rows) {
					if (row === null || typeof row !== "object") continue;
					if (row.blank === true) continue;
					const retained = row.retainedBy !== null && typeof row.retainedBy === "object" ? row.retainedBy : null;
					const mainView = retained !== null && retained.mainView !== undefined && retained.mainView !== null ? Number(retained.mainView) : 0;
					if (Number.isFinite(mainView) && mainView > 0) return typeof row.id === "string" ? row.id : null;
				}
				return null;
			} catch {
				return null;
			}
		}

		/**
		 * The UI shows coverage — "how much the panels sit over the photo",
		 * 0 = fully see-through … 100 = opaque system panels — while the
		 * painter's stored glass amount stays in its internal 0..85 units.
		 */
		function coverFromTransparency(transparency) {
			return Math.round((85 - clampNum(transparency, 30, 0, 85)) * 100 / 85);
		}
		function transparencyFromCover(cover, fallback) {
			return Math.round((100 - clampNum(cover, coverFromTransparency(fallback), 0, 100)) * 85 / 100);
		}

		function loadState() {
			fetch(API + "/state").then((response) => {
				if (!response.ok) throw new Error("state " + response.status);
				return response.json();
			}).then((data) => {
				const sessions = {};
				const raw = data && typeof data.sessions === "object" && data.sessions !== null ? data.sessions : {};
				for (const id of Object.keys(raw)) {
					if (typeof id !== "string" || id.length === 0 || id.length > 128) continue;
					sessions[id] = normalizeCfg(raw[id]);
				}
				bgStore.set({ status: "ready", sessions });
			}, () => {
				bgStore.set({ status: "error", sessions: {} });
			});
		}

		/** Write-through debounce: drag frames update the store live, the host sees the settle. */
		const persistTimers = new Map();
		function persistNow(sessionId) {
			const timer = persistTimers.get(sessionId);
			if (timer !== undefined) {
				clearTimeout(timer);
				persistTimers.delete(sessionId);
			}
			const snapshot = bgStore.getSnapshot();
			const cfg = snapshot.sessions[sessionId];
			void fetch(API + "/session", {
				method: "POST",
				headers: { "content-type": "application/json" },
				body: JSON.stringify({ sessionId, config: cfg === undefined ? null : cfg })
			}).catch(() => {
				/* the store keeps the edit; the next save retries */
			});
		}
		function schedulePersist(sessionId, delayMs) {
			const timer = persistTimers.get(sessionId);
			if (timer !== undefined) clearTimeout(timer);
			persistTimers.set(sessionId, setTimeout(() => persistNow(sessionId), delayMs === undefined ? 400 : delayMs));
		}

		function patchConfig(sessionId, partial) {
			bgStore.update((draft) => {
				const cur = draft.sessions[sessionId] !== undefined ? draft.sessions[sessionId] : { ...DEFAULT_CFG };
				for (const key of Object.keys(partial)) cur[key] = partial[key];
				draft.sessions[sessionId] = cur;
			});
		}

		// ─── theme token capture & glass overrides ─────────────────────────────
		/**
		 * Shell background tokens: with a photo active these are cleared
		 * completely (the photo replaces the system background, it does not sit
		 * behind a still-opaque shell).
		 */
		const CLEAR_TOKENS = ["--dsw-alias-bg-base", "--dsw-specific-sidebar-fill"];
		/** Card surfaces inside the shell: glassified by the panel-transparency slider. */
		const GLASS_DEFS = [
			{ name: "--dsw-specific-bubble", factor: 0.55, light: "rgb(237, 243, 254)", dark: "rgb(44, 44, 46)" },
			{ name: "--dsw-specific-bubble-highlight", factor: 0.55, light: "rgb(211, 226, 255)", dark: "rgb(67, 69, 74)" },
			{ name: "--dsw-specific-input-major", factor: 0.35, light: "rgb(255, 255, 255)", dark: "rgb(44, 44, 46)" }
		];

		/**
		 * Read the raw token texts from the palette stylesheet once (before any
		 * override). Raw `var(--dsw-static-…)` references keep the glass mix in
		 * sync with the palette and survive scheme switches (the theme service
		 * picks light/dark values from one layer at compose time).
		 */
		let rawTokens = null;
		function captureRawTokens() {
			if (rawTokens !== null) return rawTokens;
			const light = {};
			const dark = {};
			try {
				const sheets = document.styleSheets;
				for (let i = 0; i < sheets.length; i += 1) {
					let rules = null;
					try {
						rules = sheets[i].cssRules;
					} catch {
						continue;
					}
					if (rules === null) continue;
					for (let j = 0; j < rules.length; j += 1) {
						const rule = rules[j];
						const sel = rule !== null && typeof rule === "object" ? rule.selectorText : undefined;
						if (typeof sel !== "string" || typeof rule.style.getPropertyValue !== "function") continue;
						let target = null;
						if (sel === "body") target = light;
						else if (sel.replace(/\s+/g, "") === "body[data-ds-dark-theme]") target = dark;
						if (target === null) continue;
						for (let k = 0; k < rule.style.length; k += 1) {
							const name = rule.style.item(k);
							if (typeof name !== "string" || name.indexOf("--dsw-") !== 0) continue;
							const value = rule.style.getPropertyValue(name);
							if (typeof value === "string" && value.trim().length > 0) target[name] = value.trim();
						}
					}
				}
			} catch {
				/* partial capture: fallbacks fill every miss */
			}
			rawTokens = { light, dark };
			return rawTokens;
		}

		/** Positive value lightens (white veil), negative darkens (black veil). */
		function scrimCss(scrim) {
			if (scrim === 0) return "transparent";
			const amount = Math.abs(scrim) / 100;
			return scrim > 0
				? "rgba(255, 255, 255, " + (amount * 0.6).toFixed(3) + ")"
				: "rgba(0, 0, 0, " + (amount * 0.85).toFixed(3) + ")";
		}

		/** Rough sRGB luminance for #rgb / #rrggbb (8-digit hex reads as opaque). */
		function isLightColor(hex) {
			let h = hex.slice(1);
			if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
			if (h.length === 8) h = h.slice(0, 6);
			if (h.length !== 6) return false;
			const n = parseInt(h, 16);
			if (!Number.isFinite(n)) return false;
			const r = (n >> 16) & 255;
			const g = (n >> 8) & 255;
			const b = n & 255;
			return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.62;
		}

		// ─── the painted background layer ──────────────────────────────────────
		let layerEl = null;
		let tokenDisposer = null;
		/** The theme service, captured when the plugin applies. */
		let themeService = null;

		function ensureLayer() {
			if (layerEl !== null && document.contains(layerEl)) return layerEl;
			layerEl = document.createElement("div");
			layerEl.className = "cbg-layer";
			layerEl.setAttribute("aria-hidden", "true");
			// A real <img> so object-fit applies: the photo shows whole and is
			// never upscaled beyond its native resolution (scale-down fit).
			const img = document.createElement("img");
			img.className = "cbg-layerImg";
			img.alt = "";
			img.draggable = false;
			img.decoding = "async";
			const scrim = document.createElement("div");
			scrim.className = "cbg-layerScrim";
			layerEl.appendChild(img);
			layerEl.appendChild(scrim);
			document.body.appendChild(layerEl);
			return layerEl;
		}

		function clearTokens() {
			if (tokenDisposer !== null) {
				try {
					tokenDisposer();
				} catch {
					/* the layer is already gone */
				}
				tokenDisposer = null;
			}
		}

		/** Label tiers the custom font color repaints (primary text, flow rows, reasoning). */
		const LABEL_TIERS = ["--dsw-alias-label-primary", "--dsw-alias-label-secondary", "--dsw-alias-label-tertiary"];
		// Photo-facing surfaces that stay veiled instead of taking the flipped
		// palette's (opaque) values, so the photo keeps showing through. A light
		// font color flips the whole page to the dark scheme and these veils go
		// dark-but-not-black; a dark color flips to light and the veils lighten.
		const DARK_SURFACES = {
			baseRgb: "20, 24, 31", baseAlpha: 0.34,
			sideRgb: "24, 28, 36", sideAlpha: 0.28,
			bubbleRgb: "30, 36, 46", bubbleAlpha: 0.6,
			hiRgb: "44, 52, 70", hiAlpha: 0.66,
			inputRgb: "28, 34, 42", inputAlpha: 0.66
		};
		const LIGHT_SURFACES = {
			baseRgb: "255, 255, 255", baseAlpha: 0.34,
			sideRgb: "249, 250, 252", sideAlpha: 0.28,
			bubbleRgb: "255, 255, 255", bubbleAlpha: 0.66,
			hiRgb: "222, 234, 255", hiAlpha: 0.68,
			inputRgb: "255, 255, 255", inputAlpha: 0.74
		};
		function veil(alpha, rgb) {
			const v = "rgba(" + rgb + ", " + alpha.toFixed(3) + ")";
			return { light: v, dark: v };
		}

		function applyTokens(transparency, fontColor) {
			clearTokens();
			const raw = captureRawTokens();
			const map = {};
			if (typeof fontColor === "string" && fontColor.length > 0) {
				const lightText = isLightColor(fontColor);
				const surf = lightText ? DARK_SURFACES : LIGHT_SURFACES;
				// Whole-palette flip: every Appearance-aware element — the New
				// session plate, composer buttons, borders, chips, menus, icons —
				// takes the chosen scheme's values, regardless of the Appearance
				// setting itself (inline body declarations outrank the stylesheet).
				const side = lightText ? raw.dark : raw.light;
				for (const name in side) map[name] = { light: side[name], dark: side[name] };
				// Then the photo-facing surfaces get a mild contrasting veil so
				// the picture stays visible through them (slider scales it).
				const scale = 1 - Math.min(85, Math.max(0, transparency)) / 140;
				const veiled = (base) => Math.max(0.14, Math.min(0.94, base * scale));
				map["--dsw-alias-bg-base"] = veil(veiled(surf.baseAlpha), surf.baseRgb);
				map["--dsw-specific-sidebar-fill"] = veil(veiled(surf.sideAlpha), surf.sideRgb);
				map["--dsw-specific-bubble"] = veil(veiled(surf.bubbleAlpha), surf.bubbleRgb);
				map["--dsw-specific-bubble-highlight"] = veil(veiled(surf.hiAlpha), surf.hiRgb);
				map["--dsw-specific-input-major"] = veil(veiled(surf.inputAlpha), surf.inputRgb);
				for (const name of LABEL_TIERS) map[name] = { light: fontColor, dark: fontColor };
			} else {
				// No custom color: the system background is replaced fully and
				// only the card surfaces turn to palette-derived glass.
				for (const name of CLEAR_TOKENS) map[name] = { light: "transparent", dark: "transparent" };
				for (const def of GLASS_DEFS) {
					const seeThrough = Math.min(85, Math.round(transparency * def.factor));
					if (seeThrough < 5) continue;
					const opaque = 100 - seeThrough;
					const lightValue = raw.light[def.name] !== undefined ? raw.light[def.name] : def.light;
					const darkValue = raw.dark[def.name] !== undefined ? raw.dark[def.name] : def.dark;
					map[def.name] = {
						light: "color-mix(in srgb, " + lightValue + " " + opaque + "%, transparent)",
						dark: "color-mix(in srgb, " + darkValue + " " + opaque + "%, transparent)"
					};
				}
			}
			if (themeService === null) return;
			try {
				tokenDisposer = themeService.overrideTokens("dsh-background", map);
			} catch {
				tokenDisposer = null;
			}
		}

		function hideLayer() {
			if (layerEl !== null) {
				try {
					document.body.removeChild(layerEl);
				} catch {
					/* already detached */
				}
				layerEl = null;
			}
			document.body.classList.remove("dsh-chatbg-on");
			clearTokens();
		}

		function paintBackground(cfg, transparency) {
			if (cfg === null || cfg.imageId === null) {
				hideLayer();
				return;
			}
			const el = ensureLayer();
			document.body.classList.add("dsh-chatbg-on");
			const img = el.children[0];
			const src = API + "/image/" + cfg.imageId;
			if (img.getAttribute("src") !== src) img.setAttribute("src", src);
			img.style.transform = "translate(" + cfg.offsetX + "px, " + cfg.offsetY + "px) scale(" + cfg.zoom + ")";
			el.children[1].style.background = scrimCss(cfg.scrim);
			// The area around a scale-down photo reads the base color of the
			// palette side actually shown: the flipped scheme when a font color
			// forces it, otherwise the page's own Appearance scheme.
			el.classList.toggle("cbg-layerDark", cfg.fontColor !== null && isLightColor(cfg.fontColor));
			el.classList.toggle("cbg-layerLight", cfg.fontColor !== null && !isLightColor(cfg.fontColor));
			applyTokens(transparency, cfg.fontColor);
		}

		/** The last painted signature; identical re-renders must not thrash the DOM. */
		let lastPaint = "";
		function paintIfChanged(cfg, transparency) {
			const signature = cfg === null || cfg.imageId === null ? "off" : [cfg.imageId, cfg.offsetX, cfg.offsetY, cfg.zoom, cfg.scrim, cfg.fontColor || "", transparency].join("|");
			if (signature === lastPaint) return;
			lastPaint = signature;
			paintBackground(cfg, transparency);
		}

		function stopPainting() {
			lastPaint = "";
			hideLayer();
		}
		//#endregion
		//#region lib/types/client/panel-layout.js
		/** localStorage key carrying the settings window size (client chrome). */
		const LAYOUT_KEY = "chat-background.layout";
		const MIN_WIDTH = 500;
		const MIN_HEIGHT = 380;
		function clampBetween(value, min, max) {
			return Math.min(Math.max(value, min), Math.max(min, max));
		}
		function defaultLayout() {
			const width = Math.round(clampBetween(560, MIN_WIDTH, Math.max(MIN_WIDTH, window.innerWidth - 32)));
			const height = Math.round(clampBetween(620, MIN_HEIGHT, Math.max(MIN_HEIGHT, window.innerHeight - 32)));
			return {
				width,
				height,
				left: Math.max(8, Math.floor((window.innerWidth - width) / 2)),
				top: Math.max(8, Math.floor((window.innerHeight - height) / 2))
			};
		}
		function readLayout() {
			try {
				const raw = localStorage.getItem(LAYOUT_KEY);
				if (raw === null || raw === "") return defaultLayout();
				const parsed = JSON.parse(raw);
				if (parsed === null || typeof parsed !== "object") return defaultLayout();
				const width = Math.round(clampBetween(Number(parsed.width) || 0, MIN_WIDTH, Math.max(MIN_WIDTH, window.innerWidth - 24)));
				const height = Math.round(clampBetween(Number(parsed.height) || 0, MIN_HEIGHT, Math.max(MIN_HEIGHT, window.innerHeight - 24)));
				const leftRaw = Number(parsed.left);
				const topRaw = Number(parsed.top);
				return {
					width,
					height,
					left: Number.isFinite(leftRaw) ? Math.round(clampBetween(leftRaw, 120 - width, window.innerWidth - 120)) : Math.max(8, Math.floor((window.innerWidth - width) / 2)),
					top: Number.isFinite(topRaw) ? Math.round(clampBetween(topRaw, 0, Math.max(0, window.innerHeight - 40))) : Math.max(8, Math.floor((window.innerHeight - height) / 2))
				};
			} catch {
				return defaultLayout();
			}
		}
		function writeLayout(layout) {
			try {
				localStorage.setItem(LAYOUT_KEY, JSON.stringify(layout));
			} catch {
				/* private mode: sizing just will not persist */
			}
		}
		//#endregion
		//#region lib/types/client/presets.js
		/**
		 * Presets are STORE-only ZIP archives written here and read back:
		 * `chat-background.json` (framing + scrim + font config) plus
		 * `photo.<ext>` (the untouched original bytes). A tiny hand-rolled
		 * writer/reader avoids any bundling dependency; a recompressed file
		 * (deflate entries) reports as unreadable.
		 */
		let CRC_TABLE = null;
		function crc32(bytes) {
			if (CRC_TABLE === null) {
				CRC_TABLE = new Int32Array(256);
				for (let n = 0; n < 256; n += 1) {
					let c = n;
					for (let k = 0; k < 8; k += 1) c = (c & 1) !== 0 ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
					CRC_TABLE[n] = c;
				}
			}
			let crc = -1;
			for (let i = 0; i < bytes.length; i += 1) crc = (crc >>> 8) ^ CRC_TABLE[(crc ^ bytes[i]) & 0xFF];
			return (crc ^ -1) >>> 0;
		}
		function zipStore(entries) {
			const encoder = new TextEncoder();
			const parts = [];
			const centralParts = [];
			let offset = 0;
			for (const entry of entries) {
				const nameBytes = encoder.encode(entry.name);
				const bytes = entry.bytes;
				const crc = crc32(bytes);
				const local = new Uint8Array(30 + nameBytes.length);
				const lv = new DataView(local.buffer);
				lv.setUint32(0, 0x04034b50, true);
				lv.setUint16(4, 20, true);
				lv.setUint32(14, crc, true);
				lv.setUint32(18, bytes.length, true);
				lv.setUint32(22, bytes.length, true);
				lv.setUint16(26, nameBytes.length, true);
				local.set(nameBytes, 30);
				parts.push(local, bytes);
				const central = new Uint8Array(46 + nameBytes.length);
				const cv = new DataView(central.buffer);
				cv.setUint32(0, 0x02014b50, true);
				cv.setUint16(4, 20, true);
				cv.setUint16(6, 20, true);
				cv.setUint32(16, crc, true);
				cv.setUint32(20, bytes.length, true);
				cv.setUint32(24, bytes.length, true);
				cv.setUint16(28, nameBytes.length, true);
				cv.setUint32(42, offset, true);
				central.set(nameBytes, 46);
				centralParts.push(central);
				offset += local.length + bytes.length;
			}
			let centralSize = 0;
			for (const part of centralParts) centralSize += part.length;
			const eocd = new Uint8Array(22);
			const ev = new DataView(eocd.buffer);
			ev.setUint32(0, 0x06054b50, true);
			ev.setUint16(8, entries.length, true);
			ev.setUint16(10, entries.length, true);
			ev.setUint32(12, centralSize, true);
			ev.setUint32(16, offset, true);
			const all = parts.concat(centralParts, [eocd]);
			let total = 0;
			for (const part of all) total += part.length;
			const out = new Uint8Array(total);
			let at = 0;
			for (const part of all) {
				out.set(part, at);
				at += part.length;
			}
			return out;
		}
		function zipRead(bytes) {
			const dv = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
			let eocd = -1;
			const floor = Math.max(0, bytes.length - 66000);
			for (let i = bytes.length - 22; i >= floor; i -= 1) {
				if (dv.getUint32(i, true) === 0x06054b50) {
					eocd = i;
					break;
				}
			}
			if (eocd < 0) throw new Error("not a zip archive");
			const count = dv.getUint16(eocd + 10, true);
			let p = dv.getUint32(eocd + 16, true);
			const decoder = new TextDecoder();
			const out = {};
			for (let n = 0; n < count; n += 1) {
				if (p + 46 > bytes.length || dv.getUint32(p, true) !== 0x02014b50) break;
				const method = dv.getUint16(p + 10, true);
				const size = dv.getUint32(p + 20, true);
				const nameLen = dv.getUint16(p + 28, true);
				const extraLen = dv.getUint16(p + 30, true);
				const commentLen = dv.getUint16(p + 32, true);
				const localAt = dv.getUint32(p + 42, true);
				const name = decoder.decode(bytes.subarray(p + 46, p + 46 + nameLen));
				if (method !== 0) throw new Error("compressed entry: " + name);
				const localNameLen = dv.getUint16(localAt + 26, true);
				const localExtraLen = dv.getUint16(localAt + 28, true);
				const dataAt = localAt + 30 + localNameLen + localExtraLen;
				out[name] = bytes.subarray(dataAt, dataAt + size);
				p += 46 + nameLen + extraLen + commentLen;
			}
			return out;
		}
		const PRESET_MIME_BY_EXT = {
			png: "image/png",
			jpg: "image/jpeg",
			webp: "image/webp",
			gif: "image/gif",
			avif: "image/avif"
		};
		function blobToDataUrl(blob) {
			return new Promise((resolve, reject) => {
				const reader = new FileReader();
				reader.addEventListener("load", () => resolve(String(reader.result)));
				reader.addEventListener("error", () => reject(new Error("read failed")));
				reader.readAsDataURL(blob);
			});
		}
		function downloadBlob(blob, name) {
			const url = URL.createObjectURL(blob);
			const anchor = document.createElement("a");
			anchor.href = url;
			anchor.download = name;
			document.body.appendChild(anchor);
			anchor.click();
			anchor.remove();
			setTimeout(() => URL.revokeObjectURL(url), 4000);
		}
		/** Pack this chat's photo + framing/font config into a preset download. */
		async function savePreset(cfg) {
			if (cfg === null || cfg.imageId === null) return;
			const res = await fetch(API + "/image/" + cfg.imageId);
			if (!res.ok) throw new Error("photo fetch failed");
			const photo = new Uint8Array(await res.arrayBuffer());
			const dot = cfg.imageId.lastIndexOf(".");
			const ext = dot >= 0 ? cfg.imageId.slice(dot + 1) : "png";
			const manifest = new TextEncoder().encode(JSON.stringify({
				version: 1,
				photo: "photo." + ext,
				config: { offsetX: cfg.offsetX, offsetY: cfg.offsetY, zoom: cfg.zoom, scrim: cfg.scrim, fontColor: cfg.fontColor }
			}));
			const zip = zipStore([
				{ name: "chat-background.json", bytes: manifest },
				{ name: "photo." + ext, bytes: photo }
			]);
			downloadBlob(new Blob([zip], { type: "application/zip" }), "dsh-bg-preset-" + new Date().toISOString().slice(0, 10) + ".zip");
		}
		/** Apply a preset zip into the session: re-store the photo, overwrite the config. */
		async function loadPresetFile(file, sessionId) {
			const bytes = new Uint8Array(await file.arrayBuffer());
			const zip = zipRead(bytes);
			const metaRaw = zip["chat-background.json"];
			if (metaRaw === undefined) throw new Error("no manifest entry");
			const meta = JSON.parse(new TextDecoder().decode(metaRaw));
			if (meta === null || typeof meta !== "object" || typeof meta.photo !== "string") throw new Error("bad manifest");
			const photo = zip[meta.photo];
			if (photo === undefined) throw new Error("no photo entry");
			const dot = meta.photo.lastIndexOf(".");
			const ext = dot >= 0 ? meta.photo.slice(dot + 1).toLowerCase() : "";
			const mime = PRESET_MIME_BY_EXT[ext];
			if (mime === undefined) throw new Error("unsupported photo type");
			const dataUrl = await blobToDataUrl(new Blob([photo], { type: mime }));
			const res = await fetch(API + "/image", {
				method: "POST",
				headers: { "content-type": "application/json" },
				body: JSON.stringify({ dataUrl })
			});
			if (!res.ok) throw new Error("photo upload failed");
			const stored = await res.json();
			const cfg = meta.config !== null && typeof meta.config === "object" ? meta.config : {};
			patchConfig(sessionId, {
				imageId: typeof stored.imageId === "string" ? stored.imageId : null,
				offsetX: Math.round(clampNum(cfg.offsetX, 0, -20000, 20000)),
				offsetY: Math.round(clampNum(cfg.offsetY, 0, -20000, 20000)),
				zoom: clampNum(cfg.zoom, 1, 1, 8),
				scrim: Math.round(clampNum(cfg.scrim, 0, -100, 100)),
				fontColor: typeof cfg.fontColor === "string" && /^#[0-9a-fA-F]{3}(?:[0-9a-fA-F]{3}){0,2}$/.test(cfg.fontColor) ? cfg.fontColor : null
			});
			persistNow(sessionId);
		}
		//#endregion
		//#region lib/types/client/icons.js
		function FrameIcon() {
			return react.createElement("svg", {
				width: 16,
				height: 16,
				viewBox: "0 0 16 16",
				fill: "none",
				"aria-hidden": "true"
			},
				react.createElement("rect", { x: 1.5, y: 2.5, width: 13, height: 11, rx: 2, stroke: "currentColor", strokeWidth: "1.3" }),
				react.createElement("circle", { cx: 5.7, cy: 6.3, r: 1.4, fill: "currentColor" }),
				react.createElement("path", { d: "m2.4 12.6 3.4-3.6 2.2 2.2 2.4-2.8 3.2 3.8", stroke: "currentColor", strokeWidth: "1.3", strokeLinejoin: "round" })
			);
		}
		//#endregion
		//#region lib/types/client/painter.js
		/**
		 * Invisible overlay occupant: watches the current session and re-paints
		 * the page background (photo layer + glass token overrides) on change.
		 * All its side effects belong to the component lifecycle: on unmount the
		 * layer element and the token layer are removed — the system look returns.
		 */
		function BackgroundPainter(props) {
			// Every dispatch hook is type-checked: the shell may change the hook
			// roster between versions, and a missing one must degrade to "no
			// background", never to a crashed slot.
			const currentId = typeof props.useSessions === "function" ? props.useSessions(pickViewedSession) : null;
			const background = props.useBackground(identity);
			const config = typeof props.useConfig === "function" ? props.useConfig(identity) : null;
			const tp = props.useTp(identity);
			const cfg = background.status === "ready" && typeof currentId === "string" ? background.sessions[currentId] || null : null;
			const section = config !== null ? normalizeSection(config.value) : { panelTransparency: 30, language: "auto" };
			// Live drag value wins over the (debounced) settings mirror.
			const transparency = tp.value === null ? section.panelTransparency : clampNum(tp.value, section.panelTransparency, 0, 85);
			react.useEffect(() => {
				if (background.status !== "ready") {
					stopPainting();
					return;
				}
				paintIfChanged(cfg, transparency);
				return undefined;
			}, [transparency, background.status, currentId, cfg]);
			react.useEffect(() => () => stopPainting(), []);
			return null;
		}
		//#endregion
		//#region lib/types/client/header-button.js
		/** The utilities-row button that opens this chat's background dialog. */
		function BackgroundHeaderButton(props) {
			const config = typeof props.useConfig === "function" ? props.useConfig(identity) : null;
			const t = resolveT(config, props.t);
			return react.createElement("button", {
				type: "button",
				className: "cbg-btn",
				title: t("button.title"),
				"aria-label": t("button.title"),
				onClick: () => props.actions.openDialog(props.sessionId)
			}, react.createElement(FrameIcon));
		}
		//#endregion
		//#region lib/types/client/dialog.js
		/** The per-chat settings window: photo, framing, zoom, dim, font color. */
		function BackgroundDialog(props) {
			const view = props.useView(identity);
			const background = props.useBackground(identity);
			const sessions = typeof props.useSessions === "function" ? props.useSessions(identity) : null;
			const config = typeof props.useConfig === "function" ? props.useConfig(identity) : null;
			const tp = props.useTp(identity);
			const open = view.open === true && typeof view.sessionId === "string";
			const close = props.actions.closeDialog;
			react.useEffect(() => {
				if (!open) return undefined;
				const onKey = (event) => {
					if (event.key === "Escape") close();
				};
				window.addEventListener("keydown", onKey);
				return () => window.removeEventListener("keydown", onKey);
			}, [open, close]);
			const previewRef = react.useRef(null);
			const [box, setBox] = react.useState({ w: 0, h: 0 });
			const [grabbing, setGrabbing] = react.useState(false);
			// The photo box flexes with the panel; a ResizeObserver keeps the
			// replica ratio current while dragging the edge or the header.
			react.useLayoutEffect(() => {
				if (!open) return undefined;
				const update = () => {
					const el = previewRef.current;
					if (el !== null) setBox({ w: el.clientWidth, h: el.clientHeight });
				};
				update();
				let observer = null;
				if (typeof ResizeObserver === "function") {
					observer = new ResizeObserver(update);
					if (previewRef.current !== null) observer.observe(previewRef.current);
				} else {
					window.addEventListener("resize", update);
				}
				return () => {
					if (observer !== null) observer.disconnect();
					else window.removeEventListener("resize", update);
				};
			}, [open]);
			// Panel size: like the agents-board, edges and the corner drag; the
			// size survives dialogs and sessions via localStorage.
			const [panel, setPanel] = react.useState(readLayout);
			const gestureRef = react.useRef(null);
			const presetInputRef = react.useRef(null);
			// Local text drafts for the type-in fields so typing "80…" on the way
			// to 800 is not clamped mid-keystroke; commits happen on change and
			// the draft clears on blur (an invalid value visibly reverts).
			const [drafts, setDrafts] = react.useState({ zoom: null, scrim: null, hex: null, tp: null });
			const setDraft = (key, value) => setDrafts((d) => {
				const next = { zoom: d.zoom, scrim: d.scrim, hex: d.hex, tp: d.tp };
				next[key] = value;
				return next;
			});
			if (!open) return null;
			const t = resolveT(config, props.t);
			const sessionId = view.sessionId;
			const cfg = normalizeCfg(background.sessions[sessionId]);
			// Panel transparency is global (config mirror), not per-chat.
			const section = config !== null ? normalizeSection(config.value) : { panelTransparency: 30, language: "auto" };
			const tpDisabled = config === null || config.writable !== true;
			// The UI shows coverage — "how much the panels sit over the photo",
			// 0 = fully see-through … 100 = opaque system panels — while the
			// painter's stored glass amount stays in its internal 0..85 units.
			// A live drag (tpStore override) updates the row and the preview
			// immediately; the debounced settings commit makes it permanent.
			const transparencyLive = tp.value === null ? section.panelTransparency : clampNum(tp.value, section.panelTransparency, 0, 85);
			const tpCover = coverFromTransparency(transparencyLive);
			const coverToTransparency = (cover) => transparencyFromCover(cover, transparencyLive);
			// Scheme the preview veil stands on: the palette flip follows the
			// font tone; with no custom font the page attribute rules.
			const panelsDark = cfg.fontColor !== null ? isLightColor(cfg.fontColor) : document.body.hasAttribute("data-ds-dark-theme");
			const row = sessions !== null && typeof sessions === "object" && sessions.byId !== undefined ? sessions.byId[sessionId] : undefined;
			const chatTitle = row !== undefined ? (row.displayTitle || row.title || "") : "";
			const vw = window.innerWidth;
			const vh = window.innerHeight;
			const ratio = box.w > 0 && box.h > 0 && vw > 0 && vh > 0 ? Math.min(box.w / vw, box.h / vh) : 0.33;
			// Center the viewport replica inside the flexed photo box: the whole
			// "window" always fits the preview, whatever shape the panel has.
			const stageX = Math.round((box.w - vw * ratio) / 2);
			const stageY = Math.round((box.h - vh * ratio) / 2);
			const startDrag = (event) => {
				if (cfg.imageId === null || event.button !== 0) return;
				const pointerId = event.pointerId;
				const startX = event.clientX;
				const startY = event.clientY;
				const baseX = cfg.offsetX;
				const baseY = cfg.offsetY;
				const target = event.currentTarget;
				try {
					target.setPointerCapture(pointerId);
				} catch {
					/* synthetic events in tests */
				}
				setGrabbing(true);
				const move = (ev) => {
					if (ev.pointerId !== pointerId) return;
					patchConfig(sessionId, {
						offsetX: Math.round(clampNum(baseX + (ev.clientX - startX) / ratio, baseX, -20000, 20000)),
						offsetY: Math.round(clampNum(baseY + (ev.clientY - startY) / ratio, baseY, -20000, 20000))
					});
				};
				const up = (ev) => {
					if (ev !== undefined && ev.pointerId !== undefined && ev.pointerId !== pointerId) return;
					target.removeEventListener("pointermove", move);
					target.removeEventListener("pointerup", up);
					target.removeEventListener("pointercancel", up);
					setGrabbing(false);
					persistNow(sessionId);
				};
				target.addEventListener("pointermove", move);
				target.addEventListener("pointerup", up);
				target.addEventListener("pointercancel", up);
			};
			// Header drags the whole panel; right/bottom edges and the corner
			// change width/height (the panel is absolutely placed, so the
			// opposite edge stays exactly where it was).
			const beginGesture = (mode) => (event) => {
				if (event.button !== 0) return;
				if (mode === "move" && typeof event.target.closest === "function" && event.target.closest("button") !== null) return;
				event.preventDefault();
				gestureRef.current = { mode, startX: event.clientX, startY: event.clientY, start: panel };
				const onMove = (moveEvent) => {
					const active = gestureRef.current;
					if (active === null) return;
					setPanel((prev) => {
						const dx = moveEvent.clientX - active.startX;
						const dy = moveEvent.clientY - active.startY;
						const next = { width: prev.width, height: prev.height, left: prev.left, top: prev.top };
						if (active.mode === "move") {
							next.left = Math.round(clampBetween(active.start.left + dx, 120 - prev.width, window.innerWidth - 120));
							next.top = Math.round(clampBetween(active.start.top + dy, 0, Math.max(0, window.innerHeight - 40)));
						} else {
							if (active.mode === "resize-e" || active.mode === "resize-se") next.width = Math.round(clampBetween(active.start.width + dx, MIN_WIDTH, Math.max(MIN_WIDTH, window.innerWidth - active.start.left - 8)));
							if (active.mode === "resize-s" || active.mode === "resize-se") next.height = Math.round(clampBetween(active.start.height + dy, MIN_HEIGHT, Math.max(MIN_HEIGHT, window.innerHeight - active.start.top - 8)));
						}
						return next;
					});
				};
				const onUp = () => {
					gestureRef.current = null;
					window.removeEventListener("pointermove", onMove);
					window.removeEventListener("pointerup", onUp);
					setPanel((prev) => {
						writeLayout(prev);
						return prev;
					});
				};
				window.addEventListener("pointermove", onMove);
				window.addEventListener("pointerup", onUp);
			};
			const reportPresetError = () => viewStore.set({ ...viewStore.getSnapshot(), error: "preset" });
			const onSavePreset = () => {
				savePreset(cfg).then(null, reportPresetError);
			};
			const onPresetChosen = (event) => {
				const input = event.target;
				const file = input.files !== null && input.files.length > 0 ? input.files[0] : null;
				input.value = "";
				if (file === null) return;
				loadPresetFile(file, sessionId).then(null, reportPresetError);
			};
			return react.createElement("div", {
				className: "cbg-modal",
				onMouseDown: (event) => {
					if (event.target === event.currentTarget) close();
				}
			},
				react.createElement("input", {
					ref: presetInputRef,
					type: "file",
					accept: ".zip,application/zip",
					style: { display: "none" },
					onChange: onPresetChosen
				}),
				react.createElement("div", {
					className: "cbg-dialog",
					role: "dialog",
					"aria-label": t("dialog.title"),
					style: { width: panel.width + "px", height: panel.height + "px", left: panel.left + "px", top: panel.top + "px" }
				},
					react.createElement("div", { className: "cbg-head", onPointerDown: beginGesture("move") },
						react.createElement("div", null,
							react.createElement("h3", { className: "cbg-title" }, t("dialog.title") + (chatTitle.length > 0 ? " — " + chatTitle : "")),
							react.createElement("p", { className: "cbg-sub" }, t("dialog.sub"))
						),
						react.createElement("button", { type: "button", className: "cbg-x", title: t("dialog.close"), onClick: () => close() }, "✕")
					),
					react.createElement("div", {
						className: grabbing ? "cbg-preview cbg-previewGrabbing" : "cbg-preview",
						ref: (el) => {
							previewRef.current = el;
						},
						onPointerDown: startDrag
					},
						cfg.imageId !== null ? react.createElement("div", {
							className: "cbg-previewStage",
							style: { transform: "translate(" + stageX + "px, " + stageY + "px) scale(" + ratio.toFixed(4) + ")" }
						}, react.createElement("img", {
							className: "cbg-previewImg",
							src: API + "/image/" + cfg.imageId,
							alt: "",
							draggable: false,
							style: {
								transform: "translate(" + cfg.offsetX + "px, " + cfg.offsetY + "px) scale(" + cfg.zoom + ")"
							}
						})) : null,
						react.createElement("div", { className: "cbg-previewScrim", style: { background: scrimCss(cfg.scrim) } }),
						// Live preview of the panels-over-photo glass: a film lying
						// over the viewport rect exactly like the real shell does.
						cfg.imageId !== null ? react.createElement("div", {
							className: "cbg-previewPanels",
							style: {
								left: stageX + "px",
								top: stageY + "px",
								width: Math.round(vw * ratio) + "px",
								height: Math.round(vh * ratio) + "px",
								background: "rgba(" + (panelsDark ? DARK_SURFACES : LIGHT_SURFACES).baseRgb + ", " + (tpCover * 0.009).toFixed(3) + ")"
							}
						}) : null,
						// Dashed frame = the page viewport: the photo is visible only inside it.
						react.createElement("div", {
							className: "cbg-previewFrame",
							style: {
								left: stageX + "px",
								top: stageY + "px",
								width: Math.round(vw * ratio) + "px",
								height: Math.round(vh * ratio) + "px"
							}
						}),
						react.createElement("div", { className: "cbg-previewHint" }, cfg.imageId === null ? t("dialog.noPhoto") : t("dialog.drag"))
					),
					react.createElement("div", { className: "cbg-body" },
					react.createElement("div", { className: "cbg-rows" },
						react.createElement("div", { className: "cbg-row" },
							react.createElement("span", { className: "cbg-label" }, t("dialog.zoom")),
							react.createElement("input", {
								className: "cbg-range",
								type: "range",
								min: 100,
								max: 800,
								step: 5,
								value: Math.round(cfg.zoom * 100),
								onInput: (event) => {
									patchConfig(sessionId, { zoom: clampNum(Number(event.target.value) / 100, 1, 1, 8) });
									schedulePersist(sessionId);
								}
							}),
							react.createElement("input", {
								className: "cbg-num",
								type: "number",
								min: 100,
								max: 800,
								step: 5,
								value: drafts.zoom !== null ? drafts.zoom : Math.round(cfg.zoom * 100),
								title: t("dialog.zoom") + " 100–800%",
								onChange: (event) => {
									setDraft("zoom", event.target.value);
									const n = Number(event.target.value);
									if (Number.isFinite(n)) {
										patchConfig(sessionId, { zoom: clampNum(n / 100, 1, 1, 8) });
										schedulePersist(sessionId);
									}
								},
								onBlur: () => {
									setDraft("zoom", null);
									persistNow(sessionId);
								}
							})
						),
						react.createElement("div", { className: "cbg-row" },
							react.createElement("span", { className: "cbg-label" }, t("dialog.scrim")),
							react.createElement("input", {
								className: "cbg-range",
								type: "range",
								min: -100,
								max: 100,
								step: 1,
								value: cfg.scrim,
								onInput: (event) => {
									patchConfig(sessionId, { scrim: Math.round(clampNum(Number(event.target.value), 0, -100, 100)) });
									schedulePersist(sessionId);
								}
							}),
							react.createElement("input", {
								className: "cbg-num",
								type: "number",
								min: -100,
								max: 100,
								step: 1,
								value: drafts.scrim !== null ? drafts.scrim : cfg.scrim,
								title: t("dialog.scrim") + " −100…+100",
								onChange: (event) => {
									setDraft("scrim", event.target.value);
									const n = Number(event.target.value);
									if (Number.isFinite(n)) {
										patchConfig(sessionId, { scrim: Math.round(clampNum(n, 0, -100, 100)) });
										schedulePersist(sessionId);
									}
								},
								onBlur: () => {
									setDraft("scrim", null);
									persistNow(sessionId);
								}
							})
						),
						react.createElement("div", { className: "cbg-row" },
							react.createElement("span", { className: "cbg-label" }, t("settings.transparency")),
							react.createElement("input", {
								className: "cbg-range",
								type: "range",
								min: 0,
								max: 100,
								step: 5,
								value: tpCover,
								disabled: tpDisabled,
								title: t("settings.transparency") + " 0–100%",
								onInput: (event) => props.actions.setTransparencyLive(coverToTransparency(Number(event.target.value)))
							}),
							react.createElement("input", {
								className: "cbg-num",
								type: "number",
								min: 0,
								max: 100,
								step: 1,
								value: drafts.tp !== null ? drafts.tp : tpCover,
								disabled: tpDisabled,
								title: t("settings.transparency") + " 0–100%",
								onChange: (event) => {
									setDraft("tp", event.target.value);
									const n = Number(event.target.value);
									if (Number.isFinite(n)) props.actions.setTransparencyLive(coverToTransparency(n));
								},
								onBlur: () => {
									/* the debounced write from onChange already carries the last typed value */
									setDraft("tp", null);
								}
							})
						),
						react.createElement("div", { className: "cbg-row" },
							react.createElement("span", { className: "cbg-label" }, t("dialog.fontColor")),
							react.createElement("label", { className: "cbg-row", style: { gap: 8, flexWrap: "nowrap" } },
								react.createElement("input", {
									type: "checkbox",
									checked: cfg.fontColor !== null,
									onChange: (event) => {
										patchConfig(sessionId, { fontColor: event.target.checked ? "#ffffff" : null });
										persistNow(sessionId);
									}
								}),
								cfg.fontColor !== null ? react.createElement("input", {
									className: "cbg-color",
									type: "color",
									value: cfg.fontColor.length === 4 ? "#" + cfg.fontColor[1] + cfg.fontColor[1] + cfg.fontColor[2] + cfg.fontColor[2] + cfg.fontColor[3] + cfg.fontColor[3] : cfg.fontColor,
									onInput: (event) => {
										patchConfig(sessionId, { fontColor: event.target.value });
										schedulePersist(sessionId);
									}
								}) : null,
								cfg.fontColor !== null ? react.createElement("input", {
									className: "cbg-hex",
									type: "text",
									spellCheck: false,
									maxLength: 9,
									value: drafts.hex !== null ? drafts.hex : cfg.fontColor,
									title: "#rgb / #rrggbb / #rrggbbaa",
									onChange: (event) => {
										setDraft("hex", event.target.value);
										let v = event.target.value.trim().toLowerCase();
										if (v.length > 0 && v.charAt(0) !== "#") v = "#" + v;
										if (/^#[0-9a-f]{3}$/.test(v)) v = "#" + v[1] + v[1] + v[2] + v[2] + v[3] + v[3];
										if (/^#[0-9a-f]{6}$/.test(v) || /^#[0-9a-f]{8}$/.test(v)) {
											patchConfig(sessionId, { fontColor: v });
											schedulePersist(sessionId);
											setDraft("hex", null);
										}
									},
									onBlur: () => setDraft("hex", null)
								}) : react.createElement("span", { className: "cbg-value" }, t("dialog.fontSystem"))
							)
						)
					),
					view.error !== null ? react.createElement("div", { className: "cbg-error" }, t(view.error === "tooLarge" ? "error.tooLarge" : view.error === "preset" ? "error.preset" : "error.uploadFailed")) : null,
					react.createElement("div", { className: "cbg-actions" },
						react.createElement("button", {
							type: "button",
							className: cfg.imageId === null ? "cbg-button cbg-buttonPrimary" : "cbg-button",
							onClick: () => props.actions.pickImage(sessionId)
						}, t(cfg.imageId === null ? "dialog.pick" : "dialog.replace")),
						cfg.imageId !== null ? react.createElement("button", {
							type: "button",
							className: "cbg-button",
							onClick: () => {
								patchConfig(sessionId, { imageId: null });
								persistNow(sessionId);
							}
						}, t("dialog.remove")) : null,
						cfg.imageId !== null ? react.createElement("button", {
							type: "button",
							className: "cbg-button",
							onClick: () => {
								patchConfig(sessionId, { offsetX: 0, offsetY: 0, zoom: 1, scrim: 0 });
								persistNow(sessionId);
							}
						}, t("dialog.reset")) : null,
						react.createElement("button", { type: "button", className: "cbg-button", onClick: () => close() }, t("dialog.close"))
					),
					react.createElement("div", { className: "cbg-actions2" },
						react.createElement("button", {
							type: "button",
							className: "cbg-button",
							disabled: cfg.imageId === null,
							onClick: onSavePreset
						}, t("dialog.savePreset")),
						react.createElement("button", {
							type: "button",
							className: "cbg-button",
							onClick: () => {
								if (presetInputRef.current !== null) presetInputRef.current.click();
							}
						}, t("dialog.loadPreset"))
					)
					),
					react.createElement("span", { className: "cbg-grip cbg-gripE", onPointerDown: beginGesture("resize-e") }),
					react.createElement("span", { className: "cbg-grip cbg-gripS", onPointerDown: beginGesture("resize-s") }),
					react.createElement("span", { className: "cbg-grip cbg-gripSe", onPointerDown: beginGesture("resize-se") })
				)
			);
		}
		//#endregion
		//#region lib/types/client/bundle-config.js
		/**
		 * Plugins-page configuration (`plugins.bundle.config`, keyed by the
		 * package name `dsh-background`): the global settings. The enable
		 * switch is the Plugins row's own native switch in rc.2, so it is not
		 * repeated here. The config scope is the same reactive face the
		 * painter reads, so an edit here repaints immediately.
		 */
		function BackgroundBundleConfig(props) {
			// All hooks run unconditionally; branching starts afterwards.
			const config = typeof props.useConfig === "function" ? props.useConfig(identity) : null;
			const background = props.useBackground(identity);
			const tp = props.useTp(identity);
			const [tpDraft, setTpDraft] = react.useState(null);
			const t = resolveT(config, props.t);
			if (config !== null && config.status !== "ready") {
				// A schema-less install (no row config) reads as unavailable.
				return react.createElement("p", { className: "cbg-configNote" },
					config.status === "error" ? t("settings.unavailable") : t("settings.loading"));
			}
			if (props.view === "summary") {
				return react.createElement("span", { className: "cbg-configNote" }, t("settings.description"));
			}
			const section = config !== null ? normalizeSection(config.value) : { panelTransparency: 30, language: "auto" };
			const disabled = config === null || config.writable !== true;
			const transparencyLive = tp.value === null ? section.panelTransparency : clampNum(tp.value, section.panelTransparency, 0, 85);
			const tpCover = coverFromTransparency(transparencyLive);
			const coverToTransparency = (cover) => transparencyFromCover(cover, transparencyLive);
			return react.createElement("div", { className: "cbg-card" },
				react.createElement("div", { className: "cbg-cardText" },
					react.createElement("p", { className: "cbg-cardDesc" }, t("settings.description")),
					background.status === "error" ? react.createElement("p", { className: "cbg-cardDesc" }, t("error.offline")) : null
				),
				react.createElement("div", { className: "cbg-cardControls" },
					background.status === "error" ? react.createElement("button", {
						type: "button",
						className: "cbg-button",
						onClick: () => loadState()
					}, t("settings.retry")) : null,
					react.createElement("div", { className: "cbg-row", style: { gap: 8 }, role: "group", "aria-label": t("settings.language") },
						react.createElement("span", { className: "cbg-label" }, t("settings.language")),
						react.createElement("div", { className: "cbg-segmented" },
							["auto", "en", "ru"].map((code) => react.createElement("button", {
								key: code,
								type: "button",
								className: code === section.language ? "cbg-seg cbg-segActive" : "cbg-seg",
								disabled: disabled,
								"aria-pressed": code === section.language,
								onClick: () => props.actions.setLanguage(code)
							}, code === "auto" ? t("settings.languageAuto") : code.toUpperCase()))
						)
					),
					react.createElement("div", { className: "cbg-row", style: { gap: 8 } },
						react.createElement("span", { className: "cbg-label" }, t("settings.transparency")),
						react.createElement("input", {
							className: "cbg-range",
							type: "range",
							min: 0,
							max: 100,
							step: 5,
							value: tpCover,
							disabled: disabled,
							title: t("settings.transparency") + " 0–100%",
							onInput: (event) => props.actions.setTransparencyLive(coverToTransparency(Number(event.target.value)))
						}),
						react.createElement("input", {
							className: "cbg-num",
							type: "number",
							min: 0,
							max: 100,
							step: 1,
							value: tpDraft !== null ? tpDraft : tpCover,
							disabled: disabled,
							title: t("settings.transparency") + " 0–100%",
							onChange: (event) => {
								setTpDraft(event.target.value);
								const n = Number(event.target.value);
								if (Number.isFinite(n)) props.actions.setTransparencyLive(coverToTransparency(n));
							},
							onBlur: () => setTpDraft(null)
						})
					)
				)
			);
		}
		//#endregion
		//#region lib/types/client/index.js
		const NS = "chat-background";
		// rc.2 service roster: `sessions` feeds the viewed-session row scan,
		// `configForms` is the rc.2 settings face (settingsScope is gone),
		// `theme` carries overrideTokens for the live glass.
		const inject = ["sessions", "slots", "locale", "configForms", "theme"];
		/**
		 * Client plugin body: dictionaries, the settings scope, the background
		 * store, and four slot registrations sharing one inject face
		 * (scope + stores + actions).
		 * @param {object} ctx - client plugin context.
		 */
		/** One crashing slot registration must not take the others down. */
		function safeSlot(ctx, name, factory) {
			try {
				ctx.slots.inject(name, factory);
			} catch (error) {
				try {
					console.error("dsh-background: slot " + name + " failed to register:", error);
				} catch {
					/* console unavailable */
				}
			}
		}
		function applyPlugin(ctx) {
			// rc.2 keeps the theme service (token overrides drive the live
			// glass); a missing or reshaped service only disables the live
			// drag — the painter still paints with saved values.
			themeService = ctx.theme !== null && typeof ctx.theme === "object" && typeof ctx.theme.overrideTokens === "function" ? ctx.theme : null;
			try {
				ctx.effect(() => ctx.locale.register(NS, { en, ru }), "chat-background: dictionaries");
				ctx.effect(() => () => {
					themeService = null;
					stopPainting();
				}, "chat-background: theme handle");
			} catch (error) {
				try {
					console.error("dsh-background: dictionaries/theme failed:", error);
				} catch {
					/* console unavailable */
				}
			}
			// rc.2 settings face: the row's Config (host `Config` export)
			// mirrors reactively through configForms; the namespace is the
			// bundle row id. Without the service the plugin degrades to
			// defaults with controls disabled — it never blocks the page.
			const scope = typeof ctx.configForms !== "undefined" && ctx.configForms !== null && typeof ctx.configForms.get === "function"
				? ctx.configForms.get(NS)
				: { status: "ready", value: {}, writable: false, set: () => {} };
			loadState();
			let transparencyTimer = 0;
			// Dragging coalesces to one visual update per animation frame: the
			// token re-override never runs faster than the page can repaint.
			let tpRaf = 0;
			let tpPending = null;
			const actions = {
				setLanguage: (next) => {
					void scope.set("language", LANG_LIST.indexOf(next) >= 0 ? next : "auto");
				},
				setTransparencyLive: (next) => {
					const value = Math.round(clampNum(Number(next), 30, 0, 85));
					tpPending = value;
					if (tpRaf === 0) {
						if (typeof requestAnimationFrame === "function") {
							tpRaf = requestAnimationFrame(() => {
								tpRaf = 0;
								if (tpPending !== null) tpStore.set({ value: tpPending });
							});
						} else {
							tpStore.set({ value });
						}
					}
					if (transparencyTimer !== 0) clearTimeout(transparencyTimer);
					transparencyTimer = setTimeout(() => {
						transparencyTimer = 0;
						if (tpRaf !== 0 && typeof cancelAnimationFrame === "function") cancelAnimationFrame(tpRaf);
						tpRaf = 0;
						tpPending = null;
						void scope.set("panelTransparency", value);
						// Mirror is written first, so clearing the override below
						// never re-exposes a stale value.
						tpStore.set({ value: null });
					}, 300);
				},
				setTransparencySoon: (next, immediate) => {
					const value = Math.round(clampNum(Number(next), 30, 0, 85));
					if (transparencyTimer !== 0) clearTimeout(transparencyTimer);
					if (immediate === true) {
						transparencyTimer = 0;
						void scope.set("panelTransparency", value);
						tpStore.set({ value: null });
						return;
					}
					transparencyTimer = setTimeout(() => {
						transparencyTimer = 0;
						void scope.set("panelTransparency", value);
						tpStore.set({ value: null });
					}, 300);
				},
				openDialog: (sessionId) => {
					viewStore.set({ open: true, sessionId, error: null });
				},
				closeDialog: () => {
					viewStore.set({ open: false, sessionId: null, error: null });
				},
				persist: (sessionId) => persistNow(sessionId),
				patch: (sessionId, partial) => patchConfig(sessionId, partial),
				pickImage: (sessionId) => {
					const input = document.createElement("input");
					input.type = "file";
					input.accept = "image/png,image/jpeg,image/webp,image/gif,image/avif";
					input.style.display = "none";
					input.addEventListener("change", () => {
						const file = input.files !== null && input.files.length > 0 ? input.files[0] : null;
						if (input.parentNode !== null) input.parentNode.removeChild(input);
						if (file === null) return;
						if (file.size > 40 * 1024 * 1024) {
							viewStore.set({ ...viewStore.getSnapshot(), error: "tooLarge" });
							return;
						}
						const reader = new FileReader();
						reader.addEventListener("load", () => {
							fetch(API + "/image", {
								method: "POST",
								headers: { "content-type": "application/json" },
								body: JSON.stringify({ dataUrl: String(reader.result) })
							}).then((response) => {
								if (!response.ok) throw new Error("image " + response.status);
								return response.json();
							}).then((data) => {
								if (typeof data.imageId !== "string") throw new Error("bad image id");
								patchConfig(sessionId, { imageId: data.imageId });
								persistNow(sessionId);
							}, () => {
								viewStore.set({ ...viewStore.getSnapshot(), error: "uploadFailed" });
							});
						});
						reader.readAsDataURL(file);
					});
					document.body.appendChild(input);
					input.click();
				}
			};
			const face = () => ({
				hooks: { config: scope, background: bgStore, view: viewStore, tp: tpStore },
				actions
			});
			safeSlot(ctx, "shell.overlay", () => ctx.slots.register({
				name: "shell.overlay",
				id: "chat-background-painter",
				order: 5,
				locale: NS,
				inject: face
			}, BackgroundPainter));
			safeSlot(ctx, "shell.overlay", () => ctx.slots.register({
				name: "shell.overlay",
				id: "chat-background-dialog",
				order: 65,
				locale: NS,
				inject: face
			}, BackgroundDialog));
			safeSlot(ctx, "conversation.session.header.utilities", () => ctx.slots.register({
				name: "conversation.session.header.utilities",
				id: "chat-background-button",
				order: 20,
				locale: NS,
				inject: face
			}, BackgroundHeaderButton));
			// rc.2: the Plugins page hosts the bundle's own config directly on
			// the bundle page, keyed by the PACKAGE NAME (`view` is 'page'
			// there, 'summary' in the row summary). The row's enable switch is
			// the page's own native control.
			safeSlot(ctx, "plugins.bundle.config", () => ctx.slots.register({
				name: "plugins.bundle.config",
				key: "dsh-background",
				locale: NS,
				inject: face
			}, BackgroundBundleConfig));
			// Boot canary: counted in the host's /chat-background/stats so the
			// installed copy's own telemetry answers "did the page run this
			// bundle" without opening devtools.
			try {
				fetch(API + "/boot", { keepalive: true }).catch(() => {});
			} catch {
				/* no fetch in this context */
			}
		}
		/**
		 * Entry guard: the harness fails loud (a throwing apply can fail the
		 * whole page boot), so the isolation lives inside the plugin — any
		 * crash just leaves the backgrounds off and logs the exact reason.
		 */
		function apply(ctx) {
			try {
				applyPlugin(ctx);
			} catch (error) {
				try {
					console.error("dsh-background: apply failed, plugin disabled:", error);
				} catch {
					/* console unavailable */
				}
			}
		}
		//#endregion
		exports.apply = apply;
		exports.inject = inject;
		return module.exports;
	}
});
// republished 2.0.0 (rc.2 port: configForms face, plugins.bundle.config keyed by the package name,
// viewed session = the mainView-retained row of sessions.list, uiSession-era dispatch hooks guarded,
// dense-fill dialog over the translucent rc.2 surfaces, mask token for the modal backdrop)
