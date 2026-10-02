/* monitoring — the link sweep (requirements: `build/requirements/monitoring.md`, R29, R31, R36, R53–R64; K1019, K1036,
 * K1044, K1094, K1122, K1129; Intake Doctrine §4, §6, §9).
 *
 * A ratified sweep is named standing intent: on its cadence the daemon reads its seed pages, follows one hop to the
 * links on them that its match admits, all within its scope and its budget, and files each document it brings in as
 * its own Information bundle at `collected`, never higher. Who may write a sweep is fenced at the write (R55); what
 * reaches members is derived on read (R61, R63). Everything here is reached through the one `Monitoring` instance,
 * which hands in the idempotence key, the rank and the landing it shares with the named requests (R21, R22, R28). */

import { stampInstant } from "../record-core/index.mjs";
import { isMachineIdentity, createSha256 } from "../record-grammar/index.mjs";
import { normalizeAddress } from "../subresources.mjs";
import { listFormats, detectFormat } from "../formats.mjs";
import { SWEEP_CHECKS, SWEEP_CADENCES } from "./checks.mjs";
import { compileTerm, inScope, isCut } from "./sweep-match.mjs";

/** R56: the most sweeps one tick runs; R61: the runs a read shows; R60's figures. */
export const SWEEP_TICK_BATCH = 5;
export const SWEEP_RUNS_SHOWN = 20;
export const ANOMALY_MIN_RUNS = 4, ANOMALY_WINDOW = 8, ANOMALY_FACTOR = 3, ANOMALY_FLOOR = 5, ANOMALY_DRY_MEDIAN = 2;
export const SILENT_RUNS = 4;
/** R57: the deeming actor a sweep's fetches name, and the purpose they state. */
export const SWEEP_ACTOR = "bio-monitor";
export const SWEEP_PURPOSE = "sweep";
/** R63: the five kinds of what reaches members. */
export const SWEEP_CONDITION_KINDS = Object.freeze(["sweep-held-backlog", "sweep-yield-anomaly", "sweep-seed-unreachable",
                                                    "sweep-redirect-out-of-scope", "sweep-silent"]);
const INTERVAL = Object.freeze({ daily: 86400000, weekly: 604800000, monthly: 2592000000 });
const GJ = "data/gathering.json";

const parse = (t) => { try { const g = typeof t === "string" ? JSON.parse(t) : null; return g && typeof g === "object" && !Array.isArray(g) ? g : null; } catch { return null; } };
const sweepsOf = (g) => (g && Array.isArray(g.sweeps) ? g.sweeps.filter((s) => s && typeof s === "object" && typeof s.id === "string") : []);
const canon = (v) => (Array.isArray(v) ? `[${v.map(canon).join(",")}]` : v && typeof v === "object"
  ? `{${Object.keys(v).sort().map((k) => `${JSON.stringify(k)}:${canon(v[k])}`).join(",")}}` : JSON.stringify(v ?? null));
const median = (xs) => { if (!xs.length) return null; const s = [...xs].sort((a, b) => a - b), h = s.length >> 1;
  return s.length % 2 ? s[h] : (s[h - 1] + s[h]) / 2; };
const runnable = (s) => Array.isArray(s.sources) && s.sources.length && Array.isArray(s.seeds) && SWEEP_CADENCES.includes(s.cadence)
  && s.budget && Number.isInteger(s.budget.per_run) && Number.isInteger(s.budget.backlog);
const ENTITY = { amp: "&", lt: "<", gt: ">", quot: "\"", apos: "'", nbsp: " " };
const decode = (t) => String(t).replace(/&(#x[0-9a-f]{1,6}|#\d{1,7}|[a-z]{2,6});/gi, (m, e) => {
  if (e[0] !== "#") return ENTITY[e.toLowerCase()] ?? m;
  const n = e[1] === "x" || e[1] === "X" ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10);
  try { return String.fromCodePoint(n); } catch { return m; }
});
const strip = (t) => decode(String(t).replace(/<[^>]*>/g, " ")).replace(/\s+/g, " ").trim();
const decodedAddress = (u) => { try { return decodeURI(u); } catch { return u; } };

/** R58: the links in one seed capture, read from its own bytes: HTML anchors with their text, feed items with their
 *  titles, sitemap entries (address only), each resolved against `base`, in document order. One pass with `indexOf`,
 *  each closing tag found at most once, so the read is linear in the page. */
export function linksOf(text, base) {
  const src = String(text || ""), low = src.toLowerCase(), out = [];
  const abs = (h) => { try { const u = new URL(decode(h.trim()), base); return u.protocol === "https:" || u.protocol === "http:" ? u.href : null; } catch { return null; } };
  const between = (open, close, from, limit) => {
    const a = low.indexOf(open, from);
    if (a < 0 || (limit >= 0 && a > limit)) return null;
    const s = low.indexOf(">", a);
    const b = s < 0 ? -1 : low.indexOf(close, s);
    return b < 0 ? null : { inner: src.slice(s + 1, b), tag: src.slice(a, s + 1), end: b + close.length };
  };
  const attr = (tag, name) => { const m = new RegExp(`\\s${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s>]+))`, "i").exec(tag); return m ? m[1] ?? m[2] ?? m[3] : null; };
  if (/<(urlset|sitemapindex)\b/.test(low)) {
    for (let p = 0, x; (x = between("<loc", "</loc>", p, -1)); p = x.end) { const a = abs(strip(x.inner)); if (a) out.push({ address: a, text: "" }); }
    return out;
  }
  if (/<(rss|feed|rdf:rdf)\b/.test(low)) {
    const item = low.includes("<item") ? ["<item", "</item>"] : ["<entry", "</entry>"];
    for (let p = 0, x; (x = between(item[0], item[1], p, -1)); p = x.end) {
      const body = x.inner, bl = body.toLowerCase();
      const t = /<title\b[^>]*>([\s\S]*?)<\/title>/i.exec(body.slice(0, 65536));
      let href = null;
      const l = bl.indexOf("<link");
      if (l >= 0) { const e = bl.indexOf(">", l); const tag = body.slice(l, e + 1); href = attr(tag, "href");
        if (!href) { const c = bl.indexOf("</link>", e); href = c > e ? strip(body.slice(e + 1, c)) : null; } }
      const a = href ? abs(href) : null;
      if (a) out.push({ address: a, text: t ? strip(t[1].replace(/^<!\[CDATA\[|\]\]>$/g, "")) : "" });
    }
    return out;
  }
  let close = -1;   // the next "</a" at or after the current tag, -2 once none remains
  for (let p = 0; ;) {
    const a = low.indexOf("<a", p);
    if (a < 0) break;
    const s = low.indexOf(">", a);
    if (s < 0) break;
    p = s + 1;
    if (!/[\s>]/.test(low[a + 2] || "")) continue;
    const href = attr(src.slice(a, s + 1), "href");
    const target = href ? abs(href) : null;
    if (!target) continue;
    if (close !== -2 && close < s) { close = low.indexOf("</a", s); if (close < 0) close = -2; }
    const next = low.indexOf("<a", s);
    let end = Math.min(close >= 0 ? close : src.length, s + 1 + 16384);
    if (next >= 0 && next < end) end = next;
    out.push({ address: target, text: strip(src.slice(s + 1, end)) });
  }
  return out;
}

export class Sweeps {
  #m; #k;
  /** `m` is the Monitoring instance (its record, membership, capture, observation log, promotion, clock, pause and
   *  dependencies); `k` its private helpers: `open`, `close`, `claim` (R21), `ranked` (R56's rank), `running` (R22),
   *  `land` (R28's landing, R59). */
  constructor(m, k) { this.#m = m; this.#k = k; }
  #rows(q, ...a) { return [...this.#m.sql.exec(q, ...a)]; }
  #one(q, ...a) { const r = this.#rows(q, ...a); return r.length ? r[0] : null; }

  /* ================================================================== *
   * The fence (R55) and the ratifier
   * ================================================================== */

  /** R55: a non-replay promotion carrying `data/gathering.json`, fenced against the file it replaces. A non-member who
   *  adds, removes or changes a sweep (other than setting `ratified` to `false`) is refused `SWEEP_NOT_A_MEMBER`; a
   *  non-owner of the bundle's project who sets `ratified` to `true` or changes a sweep ratified before or after is
   *  refused `SWEEP_RATIFY_NOT_AN_OWNER`. Null when admitted. */
  sweepFence(c, nextText) {
    const prev = parse((() => { const f = this.#m.record.readFile(c.bundleId, GJ); return f && f.text; })());
    const before = new Map(sweepsOf(prev).map((s) => [s.id, s])), after = new Map(sweepsOf(parse(nextText)).map((s) => [s.id, s]));
    const touched = [];
    for (const id of new Set([...before.keys(), ...after.keys()])) {
      const p = before.get(id), n = after.get(id);
      if (p && n && canon(p) === canon(n)) continue;
      /* stopping breadth is never refused: the only change is `ratified` true → false */
      if (p && n && p.ratified === true && n.ratified === false && canon({ ...p, ratified: false }) === canon(n)) continue;
      touched.push({ id, ratified: p?.ratified === true || n?.ratified === true });
    }
    if (!touched.length) return null;
    const author = typeof c.author === "string" ? c.author.trim() : "";
    const refuse = (code, detail, extra) => { const row = SWEEP_CHECKS[code];
      return { ok: false, reason: code, code, check: row.check, translation: row.translation, detail, ...extra }; };
    /* DEC-49 REGION is-sweep-member */
    if (!author || isMachineIdentity(author))
      return refuse("SWEEP_NOT_A_MEMBER", `${author || "an unnamed writer"} is not a member, and only a member adds, removes `
        + "or changes a sweep; any writer may unratify one. Nothing was written.", { sweeps: touched.map((t) => t.id) });
    /* END DEC-49 REGION is-sweep-member */
    const ratifying = touched.filter((t) => t.ratified);
    if (!ratifying.length) return null;
    const info = this.#m.record.bundleInfo(c.bundleId);
    const project = info ? info.project : (c.docFm && typeof c.docFm.project === "string" ? c.docFm.project : null);
    const member = author.startsWith("member:") ? author.slice(7) : author;
    let owns = false;
    try { owns = !!project && this.#m.membership.isProjectOwner(project, member) === true; } catch { owns = false; }
    /* DEC-49 REGION is-sweep-owner */
    if (!owns)
      return refuse("SWEEP_RATIFY_NOT_AN_OWNER", project
        ? `${member} is not an owner of ${project}, and only an owner ratifies a sweep or changes a ratified one. Nothing was written.`
        : "this list belongs to no project, so it has no owner who could ratify a sweep. Nothing was written.",
        { sweeps: ratifying.map((t) => t.id), project });
    /* END DEC-49 REGION is-sweep-owner */
    return null;
  }

  /** R55: who ratified sweep `id` of `bundle` and when: the promotion that last set `ratified` to `true` or changed the
   *  sweep while ratified, read from the bundle's history (record-core R15–R17's image). Null when it is not ratified. */
  ratifier(bundle, id) {
    const img = this.#m.record.readImage(bundle);
    if (!img) return null;
    let man = null;
    try { man = JSON.parse(img["_history/manifest.json"] || "null"); } catch { man = null; }
    const entries = (man && Array.isArray(man.entries) ? man.entries : []).slice().sort((a, b) => a.seq - b.seq);
    const at = (t) => sweepsOf(parse(t)).find((s) => s.id === id) || null;
    /* the file after each entry: a snapshot is the pre-image of the entry that took it */
    const after = new Array(entries.length);
    let cur = typeof img[GJ] === "string" ? img[GJ] : null;
    for (let i = entries.length - 1; i >= 0; i--) {
      after[i] = cur;
      const e = entries[i];
      if ((e.snapshotted || []).includes(GJ)) { const v = img[`_history/data/gathering_${e.key}.json`]; cur = typeof v === "string" ? v : null; }
      else if ((e.files || []).includes(GJ)) cur = null;
    }
    let found = null, prev = cur;
    for (let i = 0; i < entries.length; i++) {
      const p = at(prev), n = at(after[i]);
      if (n && n.ratified === true && (!p || p.ratified !== true || canon(p) !== canon(n)))
        found = { by: entries[i].author ?? null, at: entries[i].created ?? null };
      if (!n || n.ratified !== true) found = null;
      prev = after[i];
    }
    return found;
  }

  /* ================================================================== *
   * What is held and due (R56, R60)
   * ================================================================== */

  /** Every sweep in every `data/gathering.json` the record holds (read as the daemon, R36), or only those the viewer's
   *  gate admits; each `{name, bundle, sweep, daemon}`. */
  #all(gate = null) {
    const files = gate
      ? this.#rows(`SELECT f.bundle_id AS bundle_id, f.content AS content FROM files f JOIN bundles b ON b.bundle_id = f.bundle_id
                     WHERE f.path = '${GJ}' AND (${gate.sql}) ORDER BY f.bundle_id`, ...gate.args)
      : this.#rows(`SELECT bundle_id, content FROM files WHERE path = '${GJ}' ORDER BY bundle_id`);
    const out = [];
    for (const f of files) {
      const g = parse(f.content);
      const daemon = g && g.daemon && typeof g.daemon === "object" && !Array.isArray(g.daemon) ? g.daemon : {};
      for (const s of sweepsOf(g)) out.push({ name: `${f.bundle_id}#${s.id}`, bundle: f.bundle_id, sweep: s, daemon });
    }
    return out;
  }

  #runs(name, limit = SWEEP_RUNS_SHOWN) {
    return this.#rows(`SELECT * FROM sweep_runs WHERE sweep = ? ORDER BY seq DESC LIMIT ?`, name, limit).map((r) => {
      let d = {};
      try { d = JSON.parse(r.detail || "{}"); } catch { d = {}; }
      return { ...d, seq: Number(r.seq), at: r.at, filed: Number(r.filed), fetched: Number(r.fetched),
               anomaly: r.anomaly ? JSON.parse(r.anomaly) : null };
    });
  }

  /** R60: the backlog (capture R82) and whether it holds the sweep; null backlog (unreadable) holds it (K1129). */
  #held(x) {
    let n = null;
    try { n = this.#m.capture.heldCount({ sweep: x.name }); } catch { n = null; }
    const limit = x.sweep.budget && Number.isInteger(x.sweep.budget.backlog) ? x.sweep.budget.backlog : null;
    const held = n === null || n === undefined || !Number.isFinite(Number(n)) || (limit !== null && Number(n) >= limit);
    return { backlog: n === undefined ? null : n, limit, held };
  }

  /** R56: one sweep's standing: `due`, `next`, and when not due the reason. */
  #standing(x, nowMs, paused) {
    const s = x.sweep;
    const last = this.#one(`SELECT at FROM sweep_runs WHERE sweep = ? ORDER BY seq DESC LIMIT 1`, x.name);
    const lastMs = last ? Date.parse(last.at) : NaN;
    const iv = INTERVAL[s.cadence] ?? null;
    const dueAt = Number.isFinite(lastMs) && iv ? lastMs + iv : 0;
    const h = this.#held(x);
    const no = (why) => ({ due: false, why, due_at: dueAt, next: null, ...h });
    if (s.ratified !== true) return no("not ratified");
    if (!runnable(s)) return no("its definition is not one a run can read");
    if (paused) return no("the daemon is paused");
    if (x.daemon.enabled === false) return no("its bundle's daemon block says enabled: false");
    if (this.#closed(x.bundle)) return no("its project is closed");
    if (h.held) return no("held: backlog");
    return dueAt <= nowMs ? { due: true, due_at: dueAt, next: null, ...h } : { due: false, due_at: dueAt, next: dueAt, ...h };
  }

  #closed(bundle) {
    const info = this.#m.record.bundleInfo(bundle);
    if (!info || !info.project) return false;
    try { const st = this.#m.projectStage.projectStage({ project: info.project, viewer: "class:daemon" }); return !!st && st.stage === "closed"; }
    catch { return false; }
  }

  /** R56: the plan: due sweeps longest-overdue first then by full name, the earliest `next`, and whether some sweep is
   *  held or waiting on the pause (each re-read one archive interval on). */
  plan(nowMs) {
    const paused = this.#m.paused().paused;
    const due = [];
    let next = null, recheck = false;
    for (const x of this.#all()) {
      if (x.sweep.ratified !== true) continue;
      const st = this.#standing(x, nowMs, paused);
      if (st.due) due.push({ ...x, due_at: st.due_at });
      else if (st.next !== null) next = next === null ? st.next : Math.min(next, st.next);
      else if (st.why === "held: backlog" || st.why === "the daemon is paused") recheck = true;
    }
    due.sort((a, b) => a.due_at - b.due_at || (a.name < b.name ? -1 : a.name > b.name ? 1 : 0));
    return { due, next, recheck };
  }

  sweepDue(now) { this.#k.register(); return this.plan(now).due.length ? now : null; }
  sweepWake(now) {
    this.#k.register();
    const p = this.plan(now);
    if (p.due.length) return now + 1000;
    const re = p.recheck ? now + this.#k.recheckMs() : null;
    return p.next === null ? re : re === null ? p.next : Math.min(p.next, re);
  }

  /* ================================================================== *
   * The run (R56–R60, R62)
   * ================================================================== */

  /** R56: the tick: at most SWEEP_TICK_BATCH due sweeps (ten times that read when the scheduler ranks), each claimed
   *  under the consumer's epoch (R21), not re-entrant (R22). `daemon.sweep_budget` caps the fetches a bundle's sweeps
   *  make in this tick together. */
  async sweepTick(now, rank = null) {
    this.#k.register();
    const nowMs = Number.isFinite(now) ? now : this.#m.now();
    const at = stampInstant("second", nowMs);
    const pause = this.#m.paused();
    if (pause.paused) return { paused: pause, at, ran: [], skipped: [], failed: [] };
    if (this.#k.running.has("gathering-sweep")) return { busy: true, paused: pause, at, ran: [], skipped: [], failed: [] };
    this.#k.running.add("gathering-sweep");
    try {
      const plan = this.plan(nowMs);
      const read = typeof rank === "function" ? plan.due.slice(0, SWEEP_TICK_BATCH * 10) : plan.due;
      const batch = this.#k.ranked(read, (x) => ({ kind: "sweep", id: x.name, waitingSince: x.due_at > 0 ? x.due_at : null }),
                                   rank, nowMs).slice(0, SWEEP_TICK_BATCH);
      const epoch = this.#k.open("gathering-sweep", nowMs, INTERVAL.daily);
      const ran = [], skipped = [], failed = [], spentBy = new Map();
      for (const x of batch) {
        if (!this.#k.claim("gathering-sweep", x.name, epoch)) { skipped.push({ sweep: x.name, reason: "claimed by a tick that did not finish" }); continue; }
        const cap = Number.isInteger(x.daemon.sweep_budget) && x.daemon.sweep_budget >= 0 ? x.daemon.sweep_budget - (spentBy.get(x.bundle) || 0) : null;
        try {
          const r = await this.#run(x, nowMs, cap);
          spentBy.set(x.bundle, (spentBy.get(x.bundle) || 0) + r.fetched);
          ran.push({ sweep: x.name, seq: r.seq, fetched: r.fetched, filed: r.filed, ...(r.anomaly ? { anomaly: r.anomaly } : {}),
                     ...(r.note ? { note: r.note } : {}) });
        } catch (e) { failed.push({ sweep: x.name, reason: String(e && e.message || e).slice(0, 160) }); }
      }
      if (!failed.length && !skipped.length) this.#k.close("gathering-sweep", epoch);
      return { paused: pause, at, epoch, due: plan.due.length, ran, skipped, failed };
    } finally { this.#k.running.delete("gathering-sweep"); }
  }

  /** R64: requests capture-requests filed under this sweep since its last run, read from the captures' `matched_sweep`
   *  (the register documents' origin), not this module's own fetches. */
  #requestsSince(name, since) {
    try {
      const r = this.#one(`SELECT count(*) AS n FROM files f, json_each(CASE WHEN json_valid(f.content) THEN f.content ELSE '{}' END, '$.documents') d
                            WHERE f.path = 'data/provenance.json' AND d.type = 'object'
                              AND json_extract(d.value, '$.origin.matched_sweep') = ?
                              AND COALESCE(json_extract(d.value, '$.origin.deeming_actor'), '') <> ?
                              AND (? IS NULL OR json_extract(d.value, '$.retrieved') > ?)`, name, SWEEP_ACTOR, since, since);
      return Number(r && r.n) || 0;
    } catch { return 0; }
  }

  async #acquire(x, locator, heldSha = null) {
    const opts = { cls: "daemon", member: false, captureRequest: { locator, purpose: SWEEP_PURPOSE, agent: null, render: false,
      origin: { kind: "sweep", matched_sweep: x.name, deeming_actor: SWEEP_ACTOR }, scope: [...x.sweep.sources],
      ...(heldSha ? { heldSha } : {}) } };
    try { const r = await this.#m.capture.acquire({}, opts); return (r && r.body) || { ok: false, reason: "NO_ANSWER" }; }
    catch (e) { return { ok: false, reason: String(e && e.message || e).slice(0, 160) }; }
  }

  #look(x, address, row, at) {
    try {
      this.#m.observationLog.observe({ actorClass: "plane", actor: null, authorityKind: "sweep", authority: x.name, level: "document",
        subjectKind: "address", subject: normalizeAddress(address), state: row.state, governed: row.governed === true,
        condition: row.governed ? "source-unreachable-governed" : null, resultKind: row.ref ? "capture" : null,
        resultRef: row.ref || null, detail: String(row.detail).slice(0, 300) }, at);
    } catch { /* a look that could not be written does not undo the fetch */ }
  }

  async #bytes(sha) {
    const store = typeof this.#m.record.evidenceStore === "function" ? this.#m.record.evidenceStore() : null;
    if (!store || !/^[0-9a-f]{64}$/.test(String(sha))) return null;
    try { const o = await store.get(sha); return o ? new Uint8Array(await o.arrayBuffer()) : null; } catch { return null; }
  }

  /** One run of one sweep (R57–R60, R62), recorded as one `sweep_runs` row. `cap` is what is left of the bundle's
   *  `daemon.sweep_budget` in this tick (null: no cap). */
  async #run(x, nowMs, cap) {
    const s = x.sweep, at = stampInstant("second", nowMs);
    const prior = this.#runs(x.name, ANOMALY_WINDOW);
    const lastSeeds = new Map();
    for (const r of [...prior].reverse()) for (const sd of r.seeds || []) if (sd.sha) lastSeeds.set(sd.seed, sd.sha);
    const requests = this.#requestsSince(x.name, prior.length ? prior[0].at : null);
    let left = Math.max(0, s.budget.per_run - requests);
    if (cap !== null) left = Math.min(left, Math.max(0, cap));
    const note = cap !== null && cap <= 0 ? "its bundle's daemon sweep_budget allows no fetch in this tick, so the run made none" : null;
    const d = { seeds: [], candidates: 0, matched: 0, documents: [], skipped: { already_swept: 0, already_held: 0, budget_spent: 0 },
                excluded: [], failed: [], redirected: [], cut: 0, budget: { per_run: s.budget.per_run, requests }, ...(note ? { note } : {}) };
    let fetched = 0;
    const terms = (s.match && Array.isArray(s.match.terms) ? s.match.terms : []).map(compileTerm).filter((t) => t.ok);
    const paths = s.match && Array.isArray(s.match.paths) && s.match.paths.length ? s.match.paths : null;
    const formats = s.match && Array.isArray(s.match.formats) && s.match.formats.length ? s.match.formats : null;
    const lists = [];
    /* R57: the seeds */
    for (const seed of s.seeds) {
      if (left <= 0) { d.seeds.push({ seed, outcome: "budget_spent" }); continue; }
      const held = lastSeeds.get(seed) || null;
      const a = await this.#acquire(x, seed, held);
      if (a.reason === "HOST_COOLING_OFF") { d.seeds.push({ seed, outcome: "governed" }); this.#look(x, seed, { state: "LOOKED_INDETERMINATE", governed: true, detail: "governed; the per-host governor held the seed's fetch" }, at); continue; }
      left--; fetched++;
      const sha = a.ok ? (a.document?.capture?.sha256 || a.capture?.sha256 || null) : null;
      if (a.ok && sha) {
        const unchanged = a.unchanged === true || sha === held;
        const entry = { seed, outcome: unchanged ? "unchanged" : "captured", sha };
        if (!unchanged) { const f = await this.#fileSeed(x, a.document, at); entry.file = f.file; if (f.why) entry.why = f.why; }
        d.seeds.push(entry);
        this.#look(x, seed, { state: "PRESENT", ref: sha, detail: `seed ${entry.outcome} for the sweep ${x.name}` }, at);
        const bytes = await this.#bytes(sha);
        if (bytes) lists.push({ seed, sha, links: linksOf(new TextDecoder("utf-8", { fatal: false }).decode(bytes), a.document?.locator || seed) });
        else entry.unread = "the seed's bytes could not be read back from the capture store";
        continue;
      }
      const reason = a.code === "SWEEP_REDIRECT_OUT_OF_SCOPE" ? "out_of_scope_redirect" : a.reason || a.code || "failed";
      if (reason === "out_of_scope_redirect") { d.seeds.push({ seed, outcome: reason, target: a.target ?? null }); d.redirected.push({ address: seed, target: a.target ?? null }); }
      else {
        let reach = null;
        try { reach = this.#m.capture.sourceReachability({ addressNorm: normalizeAddress(seed), now: at }); } catch { reach = null; }
        d.seeds.push({ seed, outcome: "failed", reason, reachability: reach });
      }
      this.#look(x, seed, { state: "LOOKED_INDETERMINATE", detail: `seed ${reason}${a.target ? ` to ${a.target}` : ""}` }, at);
    }
    /* R58: the candidates, one hop, in seed order and then link order */
    const seen = new Set();
    for (const l of lists) for (const link of l.links) {
      let norm;
      try { norm = normalizeAddress(link.address); } catch { continue; }
      if (seen.has(norm)) continue;
      seen.add(norm);
      d.candidates++;
      if (!inScope(link.address, s.sources) || (paths && !inScope(link.address, paths))) continue;
      const addr = decodedAddress(link.address);
      if (isCut(link.text) || isCut(addr)) d.cut++;
      if (terms.length && !terms.some((t) => t.test(link.text) || t.test(addr))) continue;
      d.matched++;
      if (this.#one(`SELECT 1 AS x FROM sweep_filed WHERE sweep = ? AND address_norm = ?`, x.name, norm)) { d.skipped.already_swept++; continue; }
      if (this.#one(`SELECT 1 AS x FROM captured_locators cl JOIN register r ON r.capture_sha = cl.capture_sha WHERE cl.address_norm = ? LIMIT 1`, norm)) { d.skipped.already_held++; continue; }
      if (left <= 0) { d.skipped.budget_spent++; continue; }
      const a = await this.#acquire(x, link.address);
      if (a.reason === "HOST_COOLING_OFF") { this.#look(x, link.address, { state: "LOOKED_INDETERMINATE", governed: true, detail: "governed; the per-host governor held the fetch" }, at); continue; }
      left--; fetched++;
      if (a.code === "SWEEP_REDIRECT_OUT_OF_SCOPE") {
        d.redirected.push({ address: link.address, target: a.target ?? null });
        this.#look(x, link.address, { state: "LOOKED_INDETERMINATE", detail: `out_of_scope_redirect to ${a.target}` }, at);
        continue;
      }
      const doc = a.ok ? a.document : null, sha = doc?.capture?.sha256;
      if (!doc || !sha) { d.failed.push({ address: link.address, reason: a.reason || a.code || "failed" });
        this.#look(x, link.address, { state: "LOOKED_INDETERMINATE", detail: `failed; ${a.reason || a.code || "no answer"}` }, at); continue; }
      /* R59: the format, from the bytes */
      const bytes = formats ? await this.#bytes(sha) : null;
      const format = formats ? (bytes ? detectFormat(bytes, doc.capture.content_type ?? null).format : null) : null;
      if (formats && !formats.includes(format)) {
        d.excluded.push({ address: link.address, format: format ?? "undetermined" });
        this.#look(x, link.address, { state: "LOOKED_INDETERMINATE", detail: `format_excluded; ${format ?? "undetermined"}` }, at);
        continue;
      }
      this.#look(x, link.address, { state: "PRESENT", ref: sha, detail: `fetched for the sweep ${x.name}` }, at);
      if (a.existed === true) { d.skipped.already_held++; continue; }
      const landed = this.#k.land({ id: x.name, bundle: x.bundle, locators: [link.address], target: link.text || null }, { locator: link.address, doc }, at, {
        title: `Swept by ${x.name}: ${link.text || link.address}`,
        notes: `Brought in by the ratified sweep ${x.name}, one hop from the seed ${l.seed}, whose capture ${l.sha} listed it. `
             + `Collected ${at}. Filed at collected and never higher: verifying it is a named member's decision.`,
        trigger: `ratified sweep ${x.name}`, summary: `The document served at ${link.address}, brought in by the sweep ${x.name}.` });
      if (landed && landed.ok) {
        this.#m.sql.exec(`INSERT OR IGNORE INTO sweep_filed (sweep, address_norm, bundle_id, filed, at) VALUES (?, ?, ?, ?, ?)`,
                         x.name, norm, x.bundle, landed.bundle_id, at);
        d.documents.push({ address: link.address, bundle: landed.bundle_id });
      } else d.failed.push({ address: link.address, reason: landed?.reason || "NOT_FILED", detail: landed?.detail ?? null });
    }
    /* R60: the anomaly, against the last ANOMALY_WINDOW runs */
    const filed = d.documents.length;
    const med = median(prior.map((r) => r.filed));
    let anomaly = null;
    if (prior.length + 1 >= ANOMALY_MIN_RUNS) {
      if (filed > ANOMALY_FACTOR * med && filed > ANOMALY_FLOOR) anomaly = { kind: "surge", filed, median: med };
      else if (filed === 0 && med >= ANOMALY_DRY_MEDIAN) anomaly = { kind: "dry", filed, median: med };
    }
    const seq = (this.#one(`SELECT COALESCE(MAX(seq), 0) + 1 AS n FROM sweep_runs WHERE sweep = ?`, x.name) || { n: 1 }).n;
    this.#m.sql.exec(`INSERT INTO sweep_runs (sweep, seq, bundle_id, at, filed, fetched, detail, anomaly) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                     x.name, seq, x.bundle, at, filed, fetched, JSON.stringify(d), anomaly ? JSON.stringify(anomaly) : null);
    return { seq, fetched, filed, anomaly, note };
  }

  /** R57: a seed's new capture filed in the sweep's own bundle as a monitor snapshot with its register row, in the way
   *  R9 files a tick's bytes (a mechanical `sweep` promotion that changes no field). A refusal is kept as `why`. */
  async #fileSeed(x, doc, at) {
    const sha = doc.capture.sha256, bytes = doc.capture.bytes;
    const leaf = (String(doc.locator || "").split("?")[0].split("/").pop() || "seed").replace(/[^A-Za-z0-9._-]/g, "-").slice(0, 80) || "seed";
    const file = `snapshots/monitor-${sha.slice(0, 12)}-${leaf}`;
    const img = this.#m.record.readImage(x.bundle);
    if (!img || typeof img["bundle.md"] !== "string" || !Number.isSafeInteger(bytes)) return { file: null, why: "the sweep's bundle or the capture's size could not be read" };
    const hex = (t) => createSha256().update(new TextEncoder().encode(t)).hex();
    const files = [];
    let has = false;
    for (const [path, v] of Object.entries(img)) {
      if (path.startsWith("_history/")) continue;
      if (typeof v === "string") files.push({ path, text: v, bytes: new TextEncoder().encode(v).length, sha256: hex(v) });
      else { files.push({ path, blobSha: v.blobSha, sha256: v.sha256, bytes: v.bytes }); if (v.sha256 === sha) has = true; }
    }
    if (has) return { file: null, why: "the sweep's bundle already holds these bytes" };
    const fm = this.#m.record.head(x.bundle);
    const p = await this.#m.promotion.promote({ bundleId: x.bundle, base: hex(img["bundle.md"]), author: SWEEP_ACTOR,
      snapKey: `${at.replace(/[-:]/g, "")}_${[...crypto.getRandomValues(new Uint8Array(4))].map((b) => b.toString(16).padStart(2, "0")).join("")}`,
      writer: "mechanical", operation: "sweep", meta: { object_type: fm?.type, title: fm?.title, current_state: fm?.currentState },
      files: [...files, { path: file, blobSha: sha, sha256: sha, bytes }],
      register: [{ sha256: sha, path: file, encoding: "binary", bytes }] });
    return p && p.ok ? { file } : { file: null, why: `the promotion filing it was refused (${p?.reason || p?.code || "no reason given"})` };
  }

  /* ================================================================== *
   * Reads (R61, R63, R30) and the scope check (R64)
   * ================================================================== */

  /** R61: every sweep in a `gathering.json` the viewer may see. */
  sweeps({ viewer = null, now = null } = {}) {
    this.#k.register();
    const nowMs = Number.isFinite(Number(now)) && now !== null && now !== "" ? Number(now) : this.#m.now();
    const paused = this.#m.paused().paused;
    const items = this.#all(this.#k.gate(viewer)).map((x) => {
      const st = this.#standing(x, nowMs, paused);
      const runs = this.#runs(x.name);
      const r = x.sweep.ratified === true ? this.ratifier(x.bundle, x.sweep.id) : null;
      return { sweep: x.name, bundle: x.bundle, id: x.sweep.id, definition: JSON.stringify(x.sweep), ratified: x.sweep.ratified === true,
               ratified_by: r ? r.by : null, ratified_at: r ? r.at : null, due: st.due, ...(st.why ? { why: st.why } : {}),
               next: st.next !== null ? stampInstant("second", st.next) : null, held: st.held ? "backlog" : null,
               backlog: st.backlog, backlog_limit: st.limit, silent: this.#silent(runs, st.held), runs };
    });
    return { ok: true, as_of: stampInstant("second", nowMs), paused: this.#m.paused(), sweeps: items, formats: listFormats() };
  }

  #silent(runs, held) { return !held && runs.length >= SILENT_RUNS && runs.slice(0, SILENT_RUNS).every((r) => r.filed === 0); }

  /** R63: each sweep's conditions that need a member's look, derived on read and writing nothing. */
  sweepConditions({ viewer = null, now = null } = {}) {
    const out = [];
    for (const x of this.sweeps({ viewer, now }).sweeps) {
      if (!x.ratified) continue;
      const last = x.runs[0] || null;
      const push = (kind, since, detail) => out.push({ sweep: x.sweep, kind, since, detail });
      if (x.held) push("sweep-held-backlog", last ? last.at : null, { backlog: x.backlog, limit: x.backlog_limit });
      if (last && last.anomaly) push("sweep-yield-anomaly", last.at, { filed: last.anomaly.filed, median: last.anomaly.median });
      const failed = last ? (last.seeds || []).filter((s) => s.outcome === "failed") : [];
      if (failed.length) push("sweep-seed-unreachable", last.at, { seeds: failed.map((s) => ({ seed: s.seed, reachability: s.reachability ?? null })) });
      if (last && (last.redirected || []).length) push("sweep-redirect-out-of-scope", last.at, { redirects: last.redirected });
      if (x.silent) push("sweep-silent", x.runs[SILENT_RUNS - 1].at, { runs: SILENT_RUNS });
    }
    return { ok: true, conditions: out };
  }

  /** R30: the due sweeps, for the slate, each with its definition as quoted data. */
  dueForSlate(nowMs, sees) {
    return this.plan(nowMs).due.filter((x) => sees(x.bundle))
      .map((x) => ({ kind: "ratified-sweep", bundle: x.bundle, id: x.sweep.id, definition: x.sweep }));
  }

  /** R64: capture-requests R45's scope check: the sweep ratified and not held, and every locator in its scope. */
  scopeCheck({ sweep = null, locators = [] } = {}) {
    const x = this.#all().find((y) => y.name === sweep);
    if (!x) return { ok: false, reason: "unknown", detail: `no sweep is named ${String(sweep).slice(0, 80)}` };
    if (x.sweep.ratified !== true || !runnable(x.sweep)) return { ok: false, reason: "unratified" };
    if (this.#held(x).held) return { ok: false, reason: "held", detail: "the sweep's backlog is at or over its limit" };
    const out = (Array.isArray(locators) ? locators : []).filter((l) => !inScope(l, x.sweep.sources));
    if (!Array.isArray(locators) || !locators.length || out.length)
      return { ok: false, reason: "out-of-scope", detail: out.length ? `${String(out[0]).slice(0, 120)} is outside the sweep's sources` : "no locator was named" };
    return { ok: true, scope: [...x.sweep.sources] };
  }
}

