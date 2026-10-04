/**
 * Port simulation for the dsh-background v2 bundle (check 2).
 * Loads client.js the way window.__ModuleLoader__ would, applies it with a
 * stub rc.2 context (configForms/slots/locale/theme), then drives every
 * registered component against stub dispatch props, including the
 * rc.2 viewed-session selection (retainedBy.mainView, blank rows).
 * Run: node tools/port-sim.mjs
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const root = dirname(here);

let captured = null;
globalThis.window = {
  __ModuleLoader__: {
    load(def) {
      captured = def;
    },
  },
};
globalThis.localStorage = { getItem: () => null, setItem: () => {}, removeItem: () => {} };
// Minimal document stub: the dialog only reads body attributes while rendering.
globalThis.document = {
  body: { hasAttribute: () => false, getAttribute: () => null },
  getElementById: () => null,
  querySelector: () => null,
  querySelectorAll: () => [],
  createElement: () => ({ style: {}, dataset: {}, setAttribute() {}, appendChild() {} }),
  head: { appendChild() {} },
  styleSheets: [],
};

const factoryLog = [];
const react = {
  createElement(tag, props, ...children) {
    return { tag, props: props || {}, children: children.filter((c) => c !== null && c !== undefined) };
  },
  Fragment: "#fragment",
  useState(initial) {
    return [typeof initial === "function" ? initial() : initial, () => {}];
  },
  useRef(initial) {
    return { current: initial === undefined ? null : initial };
  },
  useEffect() {},
  useLayoutEffect() {},
};
const miniStore = {
  createSnapshotStore(value) {
    let current = value;
    const listeners = new Set();
    return {
      getSnapshot: () => current,
      set(next) {
        current = next;
      },
      subscribe(fn) {
        listeners.add(fn);
        return () => listeners.delete(fn);
      },
    };
  },
};
function fakeRequire(name) {
  if (name === "react") return react;
  if (name === "@deepseek-ai/dsh-client-store") return miniStore;
  return {}; // optional deps (primitives probes) degrade to empty
}

const source = readFileSync(join(root, "client.js"), "utf8");
new Function("window", "require", "console", source)(globalThis.window, fakeRequire, console);
if (captured === null) throw new Error("client.js never called window.__ModuleLoader__.load");
const exports = captured.factory(fakeRequire);
factoryLog.push(`module id: ${captured.id}`);

const assert = (cond, label) => {
  if (!cond) throw new Error("FAIL: " + label);
  console.log("ok   " + label);
};

assert(captured.id === "dsh-background", "ModuleLoader id is dsh-background");
assert(Array.isArray(exports.inject) && exports.inject.join(",") === ["sessions", "slots", "locale", "configForms", "theme"].join(","), "inject list = sessions,slots,locale,configForms,theme");

const registered = [];
const scope = { status: "ready", value: { language: "auto", panelTransparency: 30 }, writable: true, set(key, value) { scope.value = { ...scope.value, [key]: value }; } };
const ctx = {
  effect(fn) {
    fn();
  },
  locale: { register() {} },
  configForms: {
    get(ns) {
      assert(ns === "chat-background", "configForms.get(chat-background)");
      return scope;
    },
  },
  slots: {
    inject(slotName, maker) {
      try {
        maker();
      } catch (error) {
        throw new Error(`slot ${slotName} registration crashed: ${error && error.message}`);
      }
    },
    register(desc, component) {
      registered.push({ desc, component });
      return { desc, component };
    },
  },
  theme: { overrideTokens() { return () => {}; } },
};
exports.apply(ctx);

const byId = (desc) => desc.id;
assert(registered.map((r) => r.desc.name).join("|") === "shell.overlay|shell.overlay|conversation.session.header.utilities|plugins.bundle.config", "four slot registrations on the rc.2 slots");
assert(registered[3].desc.key === "dsh-background", "plugins.bundle.config keyed by the package name");
assert(registered.every((r) => r.desc.inject instanceof Function), "every registration shares the inject face");

const face = registered[0].desc.inject();
assert(face.hooks.config === scope, "face exposes the configForms scope as hooks.config");
assert(typeof face.actions.setLanguage === "function" && typeof face.actions.setTransparencyLive === "function", "face actions present");
assert(face.actions.setEnabled === undefined, "removed the dead enabled action");

// ── viewed-session selection through the painter's useSessions selector ──────
const painter = registered.find((r) => byId(r.desc) === "chat-background-painter").component;
const dialog = registered.find((r) => byId(r.desc) === "chat-background-dialog").component;
const bundleConfig = registered.find((r) => byId(r.desc) === undefined || r.desc.name === "plugins.bundle.config").component;
const headerButton = registered.find((r) => byId(r.desc) === "chat-background-button").component;

const seen = [];
const bg = { status: "ready", sessions: {} };
const tp = { value: null };
const hookProps = (sessionsState, viewState) => ({
  useSessions: (sel) => {
    const value = sel(sessionsState);
    seen.push(value);
    return value;
  },
  useBackground: () => bg,
  useConfig: () => scope,
  useView: () => viewState,
  useTp: () => tp,
  t: (key) => key,
  actions: face.actions,
  sessionId: "s1",
  view: "page",
});

const mainRow = { ids: ["s1"], byId: { s1: { id: "s1", blank: false, retainedBy: { mainView: 1 } } } };
painter(hookProps(mainRow, { open: false, sessionId: null }));
assert(seen.pop() === "s1", "painter picks the mainView-retained row as the current chat");

const blankRow = { ids: ["b"], byId: { b: { id: "b", blank: true, retainedBy: { mainView: 1 } } } };
painter(hookProps(blankRow, { open: false, sessionId: null }));
assert(seen.pop() === null, "painter treats the blank New-session row as no session");

const noRetention = { ids: ["x"], byId: { x: { id: "x", blank: false, retainedBy: {} } } };
painter(hookProps(noRetention, { open: false, sessionId: null }));
assert(seen.pop() === null, "painter finds nothing when no row is mainView-retained");

const degraded = hookProps(mainRow, { open: false, sessionId: null });
degraded.useConfig = undefined;
degraded.useSessions = undefined;
painter(degraded);
assert(seen.length === 0, "missing dispatch hooks degrade to no-background, not a crash");

assert(painter(hookProps(mainRow, { open: false, sessionId: null })) === null, "painter renders null");

// dialog closed renders null; header button renders a button element
assert(dialog(hookProps(mainRow, { open: false, sessionId: null })) === null, "closed dialog renders null");
const btn = headerButton(hookProps(mainRow, { open: false, sessionId: null }));
assert(btn.tag === "button", "header button renders a button");

// dialog open with a photo-less chat renders the tree without /state round-trip
const openView = { open: true, sessionId: "s1", error: null };
const opened = dialog(hookProps(mainRow, openView));
assert(opened !== null && opened.tag !== null, "open dialog renders the panel tree");

// bundle config page: summary, page, loading
const cfgProps = hookProps(mainRow, { open: false, sessionId: null });
const summary = bundleConfig({ ...cfgProps, view: "summary" });
assert(summary.tag === "span" && String(summary.children[0]).length > 0, "summary view renders a one-liner");
const page = bundleConfig({ ...cfgProps, view: "page" });
assert(page.tag === "div", "page view renders the settings card");
const loadingScope = { ...scope, status: "loading" };
const loading = bundleConfig({ ...cfgProps, view: "page", useConfig: () => loadingScope });
assert(typeof loading.tag === "string", "loading scope renders a note, not a crash");
const readonlyScope = { ...scope, writable: false };
const readonlyPage = bundleConfig({ ...cfgProps, view: "page", useConfig: () => readonlyScope });
assert(readonlyPage.tag === "div", "read-only scope still renders (controls disabled)");

// config round-trip: the page writes through the same scope the painter reads
face.actions.setLanguage("ru");
assert(scope.value.language === "ru", "setLanguage writes language through the configForms scope");
face.actions.setTransparencyLive(55);
face.actions.setTransparencySoon(55, true);
assert(scope.value.panelTransparency === 55, "transparency commits through the configForms scope");

console.log("\nAll port-sim assertions passed.");
