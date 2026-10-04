/**
 * Host-half port simulation: apply() with volatile config references, route
 * registration through webServer.register, the /stats diagnostics response,
 * and the Config export shape.
 * Run: node tools/host-sim.mjs
 */
import { pathToFileURL } from "node:url";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const host = await import(pathToFileURL(join(root, "host.mjs")).href);

const assert = (cond, label) => {
  if (!cond) throw new Error("FAIL: " + label);
  console.log("ok   " + label);
};

assert(host.name === "chat-background", "export name = chat-background");
assert(JSON.stringify(host.inject) === '["webServer"]', "inject = webServer (hard dep)");
assert(typeof host.Config === "function" || (host.Config !== null && typeof host.Config === "object"), "Config schema exported (schemastery loaded)");

const registered = [];
let effects = 0;
const ctx = {
  effect(fn, label) {
    effects++;
    fn();
  },
  webServer: {
    register(def) {
      registered.push(def);
    },
  },
  get() {
    return undefined;
  },
  logger: { debug() {}, warn() {}, error() {} },
};

// Volatile fields arrive as live references; plain values as values. Try both.
host.apply(ctx, { panelTransparency: { get: () => 42 }, language: { get: () => "ru" } });
assert(registered.length === 1 && registered[0].kind === "prefix" && registered[0].path === "/chat-background", "routes registered as a /chat-background prefix");
const state = host.readChatBackgroundState();
assert(state.panelTransparency === 42 && state.language === "ru", "volatile config references are read (42, ru)");

host.apply(ctx, { panelTransparency: 7, language: "auto" });
assert(host.readChatBackgroundState().panelTransparency === 7, "plain config values are read too");
assert(host.readChatBackgroundState().language === "auto", "plain config language read");

host.apply(ctx, undefined);
assert(host.readChatBackgroundState().panelTransparency === 30 && host.readChatBackgroundState().language === "auto", "absent config falls back to defaults");

host.apply(ctx, { panelTransparency: { get: () => 999 }, language: { get: () => "de" } });
const weird = host.readChatBackgroundState();
assert(weird.panelTransparency === 999 || typeof weird.panelTransparency === "number", "out-of-range volatile read never crashes apply");

// ── exercise the diagnostics route ───────────────────────────────────────────
const handler = registered[0].handler;
class FakeRes {
  constructor() {
    this.chunks = [];
    this.headers = null;
    this.code = 0;
  }
  writeHead(code, headers) {
    this.code = code;
    this.headers = headers;
  }
  end(body) {
    this.chunks.push(body);
  }
}
const res = new FakeRes();
handler({ url: "/chat-background/stats", method: "GET", on() {}, destroy() {} }, res);
const body = JSON.parse(res.chunks.join(""));
assert(res.code === 200 && typeof body.hits === "object", "GET /stats answers 200 JSON");
assert(typeof body.panelTransparency === "number" && typeof body.language === "string", "stats reports live config");

const res404 = new FakeRes();
handler({ url: "/chat-background/nope", method: "GET", on() {}, destroy() {} }, res404);
assert(res404.code === 404, "unknown sub-path answers 404");

console.log("\nAll host-sim assertions passed.");
