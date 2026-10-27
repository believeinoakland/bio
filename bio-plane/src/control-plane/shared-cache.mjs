/* PROTO C (throwaway; never merged). A Worker-side cache of the team-wide shared reads, answered at the one seam every call to the room
   passes (`phase-clock.mjs`' clocked stub) instead of entering the room's single thread. Off unless `env.PROTO_C` is "1" (the base set)
   or "2" (also the per-viewer lists `queue`, `inbox`, `capturerequests`); with it unset nothing here runs and no behavior changes.

   CORRECTNESS. The room states, on every answer it gives, `x-record-version: <instance>.<n>` (`plane/store.mjs`): record-core's write
   counter (R89, bookkeeping left out) read before the call, and `x-record-version-end` read after it. This isolate keeps the newest
   version it has seen per room. An entry is kept only when the two stamps agree (no write during the call) and is served only while
   (a) its version is still the newest this isolate has seen, and (b) it is younger than the TTL. The newest is refreshed by every
   un-cached call, and every request makes one first (admission's `session` lookup), so a write that finished before the request began
   is seen before a cached answer is judged. A write by another isolate in the window between that lookup and the cached read, and a
   change the counter cannot see (the clock: an invitation expiring), are bounded by the TTL (`PROTO_C_TTL_MS`, default 5000 ms). */

const TTL_DEFAULT = 5000;
const MAX_ENTRIES = 400;
const MAX_BODY = 256 * 1024;
const CALLER_STAMPS = ["viewer", "by", "author", "identity", "actor", "who", "origin", "administer", "aiCred", "member"];

/* route -> "team": the answer takes no part of the caller, so the caller's stamps leave the key; "viewer": the answer follows the
   caller's sight or language, so the whole query (the viewer stamp included) is the key. */
const BASE = Object.freeze({
  grouplanguages: "team", groupidentity: "team", groupidentitypublic: "team", instancegroup: "team", instancegrouppublic: "team",
  profiles: "team", bootstrap: "team",
  memberlist: "viewer", peopledirectory: "viewer", interfacewords: "viewer", wizardsat: "viewer", bootstrapfacts: "viewer",
});
const EXTRA = Object.freeze({ queue: "viewer", inbox: "viewer", capturerequests: "viewer" });

const versions = new Map();   /* room -> newest "<instance>.<n>" seen */
const entries = new Map();    /* key -> { version, at, body, status, type } */
const stats = { hits: 0, misses: 0, stored: 0, skipped: 0, evicted: 0, since: Date.now(), ops: {} };
const opStat = (route) => (stats.ops[route] ??= { hit: 0, miss: 0, hit_ms: 0, miss_ms: 0 });

const parts = (v) => { const m = /^(.*)\.(\d+)$/.exec(String(v ?? "")); return m ? { tag: m[1], n: Number(m[2]) } : null; };
export function noteVersion(room, res) {
  const v = res?.headers?.get?.("x-record-version-end");
  const now = parts(v);
  if (!now) return;
  const was = parts(versions.get(room));
  if (!was || was.tag !== now.tag || now.n > was.n) versions.set(room, v);
}

export const modeOf = (env) => (env && (env.PROTO_C === "1" || env.PROTO_C === "2") ? Number(env.PROTO_C) : 0);
const ttlOf = (env) => { const n = Number(env.PROTO_C_TTL_MS); return Number.isFinite(n) && n >= 0 ? n : TTL_DEFAULT; };
export const heldPagedOf = (env) => !!env && env.PROTO_C_HELD === "1";

/** The cache key for a call, or null when it is not cacheable (not a GET, a body, a grant, a route not listed, an effect on ask). */
export function keyOf(mode, input, init) {
  try {
    const req = typeof input === "string" || input instanceof URL ? null : input;
    const method = String(init?.method ?? req?.method ?? "GET").toUpperCase();
    if (method !== "GET" || init?.body) return null;
    const url = new URL(req ? req.url : String(input));
    const route = url.pathname.replace(/^\/+/, "");
    const scope = BASE[route] ?? (mode === 2 ? EXTRA[route] : undefined);
    if (!scope) return null;
    const h = new Headers(init?.headers ?? req?.headers ?? {});
    if (h.has("x-bio-grant")) return null;
    if (route === "bootstrapfacts" && url.searchParams.get("parts") === "1") return null;   /* that visit also asks the fleet */
    const q = [...url.searchParams.entries()].filter(([k]) => scope === "viewer" || !CALLER_STAMPS.includes(k)).sort((a, b) => (a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : a[1] < b[1] ? -1 : 1));
    return { route, key: route + "?" + q.map(([k, v]) => k + "=" + v).join("&") };
  } catch { return null; }
}

/** The kept answer, or null. */
export function lookup(room, env, k) {
  const e = entries.get(k.key);
  if (!e) return null;
  if (e.version !== versions.get(room) || Date.now() - e.at >= ttlOf(env)) { entries.delete(k.key); return null; }
  return e;
}

export function tell(k, hit, ms) {
  const s = opStat(k.route);
  if (hit) { stats.hits++; s.hit++; s.hit_ms += ms; } else { stats.misses++; s.miss++; s.miss_ms += ms; }
}

/** Keep an answer from the room when it is a plain success made with no write during it. Reads a clone; the caller's answer is untouched. */
export async function fill(room, k, res) {
  try {
    const start = res.headers.get("x-record-version"), end = res.headers.get("x-record-version-end");
    const type = res.headers.get("content-type") || "";
    if (res.status !== 200 || !start || start !== end || !/json/i.test(type)) { stats.skipped++; return; }
    const len = Number(res.headers.get("content-length"));
    if (Number.isFinite(len) && len > MAX_BODY) { stats.skipped++; return; }
    const body = await res.clone().text();
    if (body.length > MAX_BODY || !/^\s*\{\s*"ok"\s*:\s*true/.test(body)) { stats.skipped++; return; }
    if (entries.size >= MAX_ENTRIES) { entries.delete(entries.keys().next().value); stats.evicted++; }
    entries.set(k.key, { version: end, at: Date.now(), body, status: 200, type });
    stats.stored++;
  } catch { stats.skipped++; }
}

export const answerOf = (e) => new Response(e.body, { status: e.status, headers: { "content-type": e.type, "server-timing": "object;dur=0" } });

/** `protocprobe`: counts and per-op timings; no content of any answer, no key. */
export function probe(env) {
  const ops = {};
  for (const [r, s] of Object.entries(stats.ops))
    ops[r] = { hit: s.hit, miss: s.miss, mean_hit_ms: s.hit ? +(s.hit_ms / s.hit).toFixed(2) : null, mean_miss_ms: s.miss ? +(s.miss_ms / s.miss).toFixed(1) : null,
               saved_ms_est: s.hit && s.miss ? Math.round(s.hit * (s.miss_ms / s.miss - s.hit_ms / s.hit)) : null };
  return { mode: modeOf(env), held_paged: heldPagedOf(env), ttl_ms: ttlOf(env || {}), isolate_age_ms: Date.now() - stats.since,
           hits: stats.hits, misses: stats.misses, stored: stats.stored, skipped: stats.skipped, evicted: stats.evicted, kept: entries.size,
           rooms: versions.size, ops, note: "per isolate; a second isolate has its own counts" };
}

/** `heldcaptures` as a paged picker: the first 20 and the total, when the caller asked a picker page of more and named no cursor. */
export function pagedHeld(input) {
  try {
    if (!(input instanceof URL) && typeof input !== "string") return input;
    const url = new URL(String(input));
    if (url.pathname.replace(/^\/+/, "") !== "heldcaptures") return input;
    const q = url.searchParams;
    if (q.get("fields") !== "picker" || q.has("after") || q.has("bundle_ids") || q.has("bundle_id")) return input;
    if (!(Number(q.get("limit")) > 20)) return input;
    q.set("limit", "20"); q.set("total", "1");
    return url.href;
  } catch { return input; }
}
