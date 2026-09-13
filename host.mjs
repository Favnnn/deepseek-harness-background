/**
 * dsh-background, Host half.
 *
 * A function plugin importing only Node builtins (bare package imports cannot
 * resolve here: the installed copy lives outside any pnpm tree, while `node:`
 * specifiers always resolve).
 *
 * Three responsibilities:
 * 1) The `chat-background` settings section — a hand-rolled, schemastery-
 *    compatible node whose `toJSON()` yields the `{ uid, refs }` envelope the
 *    settings provider serializes to the wire (Settings -> Plugins switch
 *    plus the global panel-transparency preference).
 * 2) `/chat-background/*` HTTP routes: per-session background configs stored
 *    in %DSH_HOME%\plugin-data\dsh-background\state.json, uploaded photos
 *    kept as content-addressed files under images\, and the image bytes
 *    served back to the page.
 * 3) Image garbage collection: an image referenced by no surviving session
 *    is deleted when the state that orphaned it is saved.
 */

import { createHash } from 'node:crypto'
import { createReadStream, existsSync, mkdirSync, readFileSync, readdirSync, renameSync, statSync, unlinkSync, writeFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { join } from 'node:path'

export const name = 'chat-background'

// ─── settings ────────────────────────────────────────────────────────────────

/** Panel transparency bounds (percent of see-through on shell surfaces). */
const TRANSPARENCY_MIN = 0
const TRANSPARENCY_MAX = 85

/** Allowed card languages; `auto` follows the page locale. */
const LANGUAGES = ['auto', 'en', 'ru']

/**
 * Validate and normalize one merged settings candidate. Never throws: the
 * section must not be able to block a harness boot, so an invalid field
 * normalizes to its default instead.
 * @param {unknown} candidate - merged base + user section.
 * @returns {{ enabled: boolean, panelTransparency: number, language: string }} the normalized section.
 */
function resolveChatBackgroundSection(candidate) {
  if (candidate === undefined || candidate === null || typeof candidate !== 'object' || Array.isArray(candidate)) {
    return { enabled: true, panelTransparency: 30, language: 'auto' }
  }
  const enabled = typeof candidate.enabled === 'boolean' ? candidate.enabled : true
  const raw = typeof candidate.panelTransparency === 'string' ? Number(candidate.panelTransparency) : candidate.panelTransparency
  let panelTransparency = typeof raw === 'number' && Number.isFinite(raw) ? Math.round(raw) : 30
  if (panelTransparency < TRANSPARENCY_MIN) panelTransparency = TRANSPARENCY_MIN
  if (panelTransparency > TRANSPARENCY_MAX) panelTransparency = TRANSPARENCY_MAX
  const language = typeof candidate.language === 'string' && LANGUAGES.includes(candidate.language) ? candidate.language : 'auto'
  return { ...candidate, enabled, panelTransparency, language }
}

/**
 * Build the schemastery-compatible node for `{ enabled, panelTransparency, language }`.
 * @returns {object} callable schema with a wire `toJSON()` envelope.
 */
function createChatBackgroundSchema() {
  const envelope = {
    uid: 0,
    refs: {
      0: { type: 'object', meta: {}, dict: { enabled: 1, panelTransparency: 2, language: 3 } },
      1: { type: 'boolean', meta: { default: true } },
      2: { type: 'number', meta: { default: 30 } },
      3: { type: 'string', meta: { default: 'auto' } },
    },
  }
  const schema = (candidate) => resolveChatBackgroundSection(candidate)
  schema.type = 'object'
  schema.meta = envelope.refs[0].meta
  schema.dict = { enabled: envelope.refs[1], panelTransparency: envelope.refs[2], language: envelope.refs[3] }
  schema.toJSON = () => ({ uid: 0, refs: envelope.refs })
  return schema
}

/** Resolved plugin configuration for diagnostics and fallback reads. */
const pluginState = { enabled: true, panelTransparency: 30, language: 'auto' }

// ─── storage ─────────────────────────────────────────────────────────────────

function dshHome() {
  // Guarded read: the plugin realm always has node:os, but `process` is only
  // consulted defensively (typeof never throws, even in a confined realm).
  try {
    if (typeof process !== 'undefined' && process !== null && typeof process.env === 'object' && process.env !== null) {
      const env = process.env.DSH_HOME
      if (typeof env === 'string' && env.length > 0) return env
    }
  } catch {
    /* confined realm: fall through to the default location */
  }
  return join(homedir(), '.dsh')
}

const DATA_DIR = join(dshHome(), 'plugin-data', 'dsh-background')
const STATE_FILE = join(DATA_DIR, 'state.json')
const IMAGES_DIR = join(DATA_DIR, 'images')

/** Session ids are opaque tokens; keep the accepted shape tight (no path chars). */
const SESSION_ID_RE = /^[A-Za-z0-9_.:-]{1,128}$/
/** Image ids are content hashes: 20 hex chars + a short lowercase extension. */
const IMAGE_ID_RE = /^[a-f0-9]{20}\.[a-z]{3,4}$/

/** Upload cap: decoded bytes. ~40 MB covers every reasonable wallpaper photo. */
const MAX_IMAGE_BYTES = 40 * 1024 * 1024

/** Accepted image media types -> file extension. */
const IMAGE_EXT_BY_MIME = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/webp': 'webp',
  'image/gif': 'gif',
  'image/avif': 'avif',
}

const IMAGE_TYPE_BY_EXT = { png: 'image/png', jpg: 'image/jpeg', webp: 'image/webp', gif: 'image/gif', avif: 'image/avif' }

/** In-memory fold of state.json; the file mirrors it after every mutation. */
let sessions = loadSessions()

/**
 * Normalize one per-session background config. Unknown/garbage fields fall
 * back to defaults so a hand-edited state.json can never break the page.
 * @param {unknown} raw - stored or posted config candidate.
 * @returns {{ imageId: string | null, offsetX: number, offsetY: number, zoom: number, scrim: number, fontColor: string | null }}
 */
function normalizeChatConfig(raw) {
  if (raw === null || typeof raw !== 'object' || Array.isArray(raw)) raw = {}
  const cfg = raw
  const imageId = typeof cfg.imageId === 'string' && IMAGE_ID_RE.test(cfg.imageId) ? cfg.imageId : null
  const num = (value, fallback, min, max) => {
    const n = typeof value === 'string' ? Number(value) : value
    if (typeof n !== 'number' || !Number.isFinite(n)) return fallback
    return Math.max(min, Math.min(max, n))
  }
  let fontColor = null
  if (typeof cfg.fontColor === 'string' && /^#[0-9a-fA-F]{3}(?:[0-9a-fA-F]{3}){0,2}$/.test(cfg.fontColor)) fontColor = cfg.fontColor
  return {
    imageId,
    offsetX: Math.round(num(cfg.offsetX, 0, -20000, 20000)),
    offsetY: Math.round(num(cfg.offsetY, 0, -20000, 20000)),
    zoom: num(cfg.zoom, 1, 1, 8),
    scrim: Math.round(num(cfg.scrim, 0, -100, 100)),
    fontColor,
  }
}

function loadSessions() {
  /** @type {Record<string, ReturnType<typeof normalizeChatConfig>>} */
  const out = {}
  try {
    const parsed = JSON.parse(readFileSync(STATE_FILE, 'utf8'))
    const stored = parsed && typeof parsed.sessions === 'object' && parsed.sessions !== null ? parsed.sessions : {}
    for (const id of Object.keys(stored)) {
      if (typeof id !== 'string' || !SESSION_ID_RE.test(id)) continue
      out[id] = normalizeChatConfig(stored[id])
    }
  } catch {
    // Missing or damaged state: start clean; the next save rewrites the file.
  }
  return out
}

function saveSessions() {
  try {
    mkdirSync(DATA_DIR, { recursive: true })
    const tmp = STATE_FILE + '.tmp-' + Date.now().toString(36)
    writeFileSync(tmp, JSON.stringify({ version: 1, sessions }), 'utf8')
    renameSync(tmp, STATE_FILE)
    return true
  } catch {
    return false
  }
}

/**
 * Delete every image file no surviving session references. The images folder
 * is plugin-owned, so the sweep only ever touches our own hashed files.
 */
function collectGarbage() {
  const referenced = new Set()
  for (const id of Object.keys(sessions)) {
    const imageId = sessions[id].imageId
    if (imageId !== null) referenced.add(imageId)
  }
  let names = []
  try {
    names = readdirSync(IMAGES_DIR)
  } catch {
    return
  }
  for (const name of names) {
    if (referenced.has(name)) continue
    if (!IMAGE_ID_RE.test(name)) continue
    try {
      unlinkSync(join(IMAGES_DIR, name))
    } catch {
      // Busy or gone: the next save retries.
    }
  }
}

// ─── routes ──────────────────────────────────────────────────────────────────

function respond(res, code, contentType, body) {
  res.writeHead(code, { 'content-type': contentType, 'cache-control': 'no-store' })
  res.end(body)
}

/** Route hit counters for the field diagnostic channel (GET /chat-background/stats). */
const routeHits = { boot: 0, state: 0, session: 0, image: 0, imageGet: 0, other: 0, errors: 0 }
const bootedAt = Date.now()

/** Read a whole request body with a hard byte cap. */
function readBody(req, limitBytes) {
  return new Promise((resolve, reject) => {
    let raw = ''
    let bytes = 0
    let settled = false
    req.on('data', (chunk) => {
      if (settled) return
      bytes += chunk.length
      if (bytes > limitBytes) {
        settled = true
        reject(new Error('payload too large'))
        try {
          req.destroy()
        } catch {
          /* gone */
        }
        return
      }
      raw += chunk
    })
    req.on('error', () => {
      if (!settled) {
        settled = true
        reject(new Error('request stream error'))
      }
    })
    req.on('end', () => {
      if (!settled) {
        settled = true
        resolve(raw)
      }
    })
  })
}

/** POST /session {sessionId, config|null} - merge-patch or remove one chat's config. */
async function handleSessionPost(req, res) {
  routeHits.session += 1
  let params
  try {
    params = JSON.parse((await readBody(req, 1024 * 1024)) || '{}')
  } catch (error) {
    return void respond(res, 400, 'text/plain; charset=utf-8', 'chat-background: ' + (error && error.message ? error.message : String(error)))
  }
  const sessionId = typeof params.sessionId === 'string' ? params.sessionId : ''
  if (!SESSION_ID_RE.test(sessionId)) return void respond(res, 400, 'text/plain', 'bad sessionId')
  if (params.config === null) delete sessions[sessionId]
  else sessions[sessionId] = normalizeChatConfig(params.config)
  if (!saveSessions()) return void respond(res, 500, 'text/plain', 'chat-background: state write failed')
  collectGarbage()
  respond(res, 200, 'application/json; charset=utf-8', JSON.stringify({ ok: true, sessionId }))
}

/**
 * POST /image {dataUrl} - store an uploaded photo content-addressed.
 * @returns the JSON response body string.
 */
async function handleImagePost(req, res) {
  routeHits.image += 1
  let params
  try {
    params = JSON.parse((await readBody(req, Math.ceil(MAX_IMAGE_BYTES * 1.4) + 4096)) || '{}')
  } catch (error) {
    return void respond(res, 400, 'text/plain; charset=utf-8', 'chat-background: ' + (error && error.message ? error.message : String(error)))
  }
  const dataUrl = typeof params.dataUrl === 'string' ? params.dataUrl : ''
  const match = /^data:(image\/(?:png|jpeg|webp|gif|avif));base64,([A-Za-z0-9+/=\s]+)$/.exec(dataUrl)
  if (match === null) return void respond(res, 400, 'text/plain', 'expected png/jpeg/webp/gif/avif data url')
  let bytes
  try {
    bytes = Buffer.from(match[2], 'base64')
  } catch {
    return void respond(res, 400, 'text/plain', 'bad base64')
  }
  if (bytes.length === 0 || bytes.length > MAX_IMAGE_BYTES) {
    return void respond(res, 413, 'text/plain', 'image exceeds ' + String(MAX_IMAGE_BYTES) + ' bytes')
  }
  const imageId = createHash('sha1').update(bytes).digest('hex').slice(0, 20) + '.' + IMAGE_EXT_BY_MIME[match[1]]
  const path = join(IMAGES_DIR, imageId)
  if (!existsSync(path)) {
    try {
      mkdirSync(IMAGES_DIR, { recursive: true })
      const tmp = path + '.tmp-' + Date.now().toString(36)
      writeFileSync(tmp, bytes)
      renameSync(tmp, path)
    } catch (error) {
      routeHits.errors += 1
      return void respond(res, 500, 'text/plain; charset=utf-8', 'chat-background: ' + (error && error.message ? error.message : String(error)))
    }
  }
  respond(res, 200, 'application/json; charset=utf-8', JSON.stringify({ imageId, bytes: bytes.length }))
}

/** GET /image/<id> - serve one stored photo (immutable; the id is the content hash). */
function serveImage(res, id) {
  routeHits.imageGet += 1
  if (!IMAGE_ID_RE.test(id)) return void respond(res, 400, 'text/plain', 'bad image id')
  const path = join(IMAGES_DIR, id)
  let size = 0
  try {
    size = statSync(path).size
  } catch {
    return void respond(res, 404, 'text/plain', 'no such image')
  }
  res.writeHead(200, {
    'content-type': IMAGE_TYPE_BY_EXT[id.slice(id.indexOf('.') + 1)] || 'application/octet-stream',
    'content-length': String(size),
    'cache-control': 'public, max-age=31536000, immutable',
  })
  const stream = createReadStream(path)
  stream.on('error', () => {
    routeHits.errors += 1
    try {
      res.destroy()
    } catch {
      /* gone */
    }
  })
  stream.pipe(res)
}

function handleRequest(req, res) {
  let url
  try {
    url = new URL(req.url ?? '/', 'http://chat-background.local')
  } catch {
    routeHits.errors += 1
    return void respond(res, 400, 'text/plain', 'bad url')
  }
  // Tolerate both routing conventions: full path, or prefix already stripped.
  let path = url.pathname
  if (path.startsWith('/chat-background')) path = path.slice('/chat-background'.length)
  if (path === '' || !path.startsWith('/')) path = '/'
  try {
    if (req.method === 'POST' && path === '/session') return void handleSessionPost(req, res).catch(() => {
      routeHits.errors += 1
    })
    if (req.method === 'POST' && path === '/image') return void handleImagePost(req, res).catch(() => {
      routeHits.errors += 1
    })
    if (req.method !== 'GET' && req.method !== 'HEAD') return void respond(res, 405, 'text/plain', 'GET/POST only')
    if (path === '/boot') {
      routeHits.boot += 1
      return void respond(res, 200, 'text/plain', 'ok')
    }
    if (path === '/stats') {
      return void respond(res, 200, 'application/json; charset=utf-8', JSON.stringify({
        up: Date.now() - bootedAt,
        hits: routeHits,
        sessions: Object.keys(sessions).length,
        enabled: pluginState.enabled,
        panelTransparency: pluginState.panelTransparency,
      }))
    }
    if (path === '/state') {
      routeHits.state += 1
      return void respond(res, 200, 'application/json; charset=utf-8', JSON.stringify({ version: 1, sessions }))
    }
    if (path.startsWith('/image/')) {
      return void serveImage(res, decodeURIComponent(path.slice('/image/'.length)))
    }
    routeHits.other += 1
    return void respond(res, 404, 'text/plain', 'unknown chat-background route')
  } catch (error) {
    routeHits.errors += 1
    try {
      respond(res, 500, 'text/plain; charset=utf-8', 'chat-background: ' + (error && error.message ? error.message : String(error)))
    } catch {
      /* socket gone */
    }
  }
}

// ─── plugin ──────────────────────────────────────────────────────────────────

/**
 * Plugin body: register the `chat-background` settings section and the
 * `/chat-background` state/image routes on the web server.
 * @param {import('@deepseek-ai/cordis').Context} ctx - host plugin context.
 * @param {{ enabled?: boolean, panelTransparency?: number } | undefined} config - patch row `config`.
 */
export function apply(ctx, config) {
  const resolved = resolveChatBackgroundSection(config ?? {})
  Object.assign(pluginState, resolved)

  // The settings service may mount after this row (file:// inserts run early
  // in the layer); wait for it reactively, same lesson as the sibling plugins.
  const registerSection = (settingsCtx) => {
    settingsCtx.settings.installSection(settingsCtx, 'chat-background', createChatBackgroundSchema(), {
      enabled: pluginState.enabled,
      panelTransparency: pluginState.panelTransparency,
      language: pluginState.language,
    }, {
      setSource: (current) => {
        Object.assign(pluginState, resolveChatBackgroundSection(current))
      },
      onChange: () => {
        ctx.logger?.debug?.('chat-background: enabled=%s panelTransparency=%s language=%s', pluginState.enabled, pluginState.panelTransparency, pluginState.language)
      },
    })
  }
  if (ctx.get('settings') !== undefined) registerSection(ctx)
  else ctx.inject(['settings'], registerSection)

  const registerRoutes = (webCtx) => {
    webCtx.effect(
      () => webCtx.webServer.register({ kind: 'prefix', path: '/chat-background', handler: handleRequest }),
      'chat-background: state and image routes',
    )
  }
  if (ctx.get('webServer') === undefined) ctx.inject(['webServer'], registerRoutes)
  else registerRoutes(ctx)
}

/** Current resolved plugin state (host-side fallback when settings are absent). */
export function readChatBackgroundState() {
  return { ...pluginState }
}
