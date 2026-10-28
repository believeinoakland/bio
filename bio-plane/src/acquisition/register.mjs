/* acquisition — T53, N1259: A REGISTER PIECE IS FETCHED FROM ITS DEFINITION'S HOSTS, REDUCED AS IT ARRIVES, AND STORED AS NUMBERED SEGMENTS
 * (R125–R129, R132, R133; K4403, K1485, K1492, K5530 F4).
 *
 * A register's definition (`jurisdictions` R127: the host system it comes from, its pieces, its columns, its filter, its stated terms) is the
 * only thing that says what may be fetched and kept. `streamRegister` fetches one piece of it (a whole file, or one member of a zip read by
 * range) through the host governor under R9's agent, runs `register-readers`' reducer over the decompressed stream, and stores only the REDUCED
 * copy (R125): the original is never stored, in whole or in part, and what the reducer drops (the columns the definition does not keep, every
 * contact column, the rows the filter does not match) reaches no object, receipt or document. The reduced output is cut at row boundaries into
 * segments of at most `REGISTER_SEGMENT_MAX`, each its own capture numbered in order, the last marked `final` (R126). `probeRegister` states a
 * piece's size and change without fetching its body (R128) and `sourceChanged` says whether a refresh may be skipped (R129).
 *
 * Resuming (R127). A slice ends at a SEGMENT boundary, which is a row boundary the data alone decides, so an interrupted run and an
 * uninterrupted one cut the same segments and store the same digests. The `resume` token holds the segments already stored (their digests);
 * the next call reads the piece again from its start, checks each segment it regenerates against the token (a source that changed is
 * `RESUME_DIVERGED`, never a mixture) and stores nothing twice (the store is content-addressed). So the work repeated after a restart is the
 * reading of the stored prefix, never its storing, and a deflate member can only restart from its start (`checkpoint: "member_start"`): the
 * reducer's own carry (the unfinished row, the original's hash) is not a thing `register-readers` can hand back, which is why the checkpoint
 * is never an offset. (Found in `register-readers`, reported to BOB.)
 *
 * Every refusal is an answer `{ok: false, reason, ...}`, never a throw. Nothing here keeps a key: a register file is fetched under no key. */
import { createReducer, listMembers, streamZipMember, validateFilter, filterFingerprint } from "../register-readers/index.mjs";
import { createResumableSha256, createSha256, isPublicHttpsLocator, isMachineIdentity, EARNED_CAPTURE_CEILING } from "../record-grammar/index.mjs";
import { validateRegisterDefinition } from "../../../jurisdictions/index.mjs";
import { governedFetch as hostGovernedFetch } from "../host-governor/index.mjs";
import { isOwnHost } from "../capture-sources/own-hosts.mjs";
import { normalizeAddress } from "../subresources.mjs";
import { boundOf } from "../read-bounds.mjs";
import { localize } from "../setup-words/index.mjs";
import { partsWriter } from "./unpack.mjs";
import { profileOf, profileView, userAgent, CAPTURE_MAX } from "./index.mjs";
import { firstHopWho } from "./checks.mjs";

/* R9: the purpose the agent names for every request of this file */
export const REGISTER_PURPOSE = "register";
/* R132: the redirects one request follows by hand, each hop through the governor and held to the definition's hosts */
export const REGISTER_HOPS_MAX = 5;
/* R128: the range requests a zip's members are read through are this large */
const RANGE_READ = 1 << 20;
const RESUME_VERSION = 1;

/* R126: `READ_BOUNDS` holds the two figures once M-R7 is recorded (`runtime-limits` R47); until then there is no such row and the figure is null,
   which is a refusal and never an unbounded stream. `opts.bounds` supplies a figure only where the row does not exist. */
const rowBound = (name) => { try { return boundOf("register", name); } catch { return null; } };
export const REGISTER_STREAM_MAX = rowBound("stream_max");
export const REGISTER_SEGMENT_MAX = rowBound("segment_max");

const isObj = (x) => x !== null && typeof x === "object" && !Array.isArray(x);
const refuse = (reason, detail, extra = {}) => ({ ok: false, reason, ...extra, detail });
const hostOf = (u) => { try { return new URL(u).hostname.toLowerCase(); } catch { return null; } };
const nowOf = (store) => { const h = store && store.env ? store.env.BIO_NOW_MS : undefined; return h !== undefined && h !== null && h !== "" && Number.isFinite(Number(h)) ? Number(h) : Date.now(); };
const second = (ms) => new Date(ms).toISOString().replace(/\.\d+Z$/, "Z");
const cancel = (res) => { try { res?.body?.cancel?.()?.catch?.(() => {}); } catch { /* the source may already be gone */ } };
const b64url = (s) => btoa(String.fromCharCode(...new TextEncoder().encode(s))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
const unb64url = (s) => { try { const p = String(s).replace(/-/g, "+").replace(/_/g, "/"); const bin = atob(p + "=".repeat((4 - (p.length % 4)) % 4)); return new TextDecoder().decode(Uint8Array.from(bin, (c) => c.charCodeAt(0))); } catch { return null; } };

/* ---------------------------------------------------------------- the definition, its hosts, the bounds */

/** The hosts the definition's system states (`jurisdictions` R132), from the combined view. */
function systemHosts(view, definition) {
  const out = [];
  for (const s of view && Array.isArray(view.systems) ? view.systems : [])
    if (s && s.origin === definition.system && Array.isArray(s.hosts)) for (const h of s.hosts) if (typeof h === "string" && !out.includes(h.toLowerCase())) out.push(h.toLowerCase());
  return out;
}

/* a piece's address: the definition's locator with its named holes filled from the caller's (`{cycle}`, `{table}`), each a plain token */
function locatorOf(piece, holes) {
  const h = isObj(holes) ? holes : {};
  let bad = null;
  const out = String(piece.locator).replace(/\{([a-z_]+)\}/g, (m, name) => {
    const v = h[name];
    if (typeof v !== "string" || !/^[A-Za-z0-9_.-]{1,64}$/.test(v)) { bad = bad ?? name; return m; }
    return v;
  });
  return bad ? { ok: false, hole: bad } : { ok: true, locator: out };
}

/* The checks every act of this file makes before it sends anything: the definition (R128 of `jurisdictions`, one rule), the gate (K1449, K1492), the bounds,
   the piece, the address and the hosts (R132). */
function prepare(store, args, opts, { needBounds }) {
  const { definition, piece: pieceKey, holes } = args;
  if (!isObj(definition)) return { fail: refuse("REGISTER_DEFINITION_MISSING", localize("acquisition.register.no_definition", "there is no register definition to read; nothing was fetched")) };
  const view = isObj(args.view) ? args.view : profileView(store && store.core).view;
  const v = validateRegisterDefinition(definition, view);
  if (!v.ok) return { fail: refuse(v.code, localize("acquisition.register.definition_refused", "the register's definition is refused ({code}, {field}); nothing was fetched", { code: String(v.code), field: String(v.field ?? "") }), { field: v.field ?? null, key: v.key ?? definition.key ?? null }) };
  if (definition.gate !== "none")
    return { fail: refuse("member_act_required", localize("acquisition.register.member_act_required", "this register is behind an account or a fee, so a member brings the file in with their own account; your team's Civicsmith fetched nothing"), { gate: definition.gate }) };
  const pieceDef = Array.isArray(definition.pieces) ? definition.pieces.find((p) => p && p.key === pieceKey) : null;
  if (!pieceDef) return { fail: refuse("PIECE_UNKNOWN", localize("acquisition.register.piece_unknown", "the register has no piece of that name; nothing was fetched"), { piece: typeof pieceKey === "string" ? pieceKey.slice(0, 60) : null }) };
  const bounds = {
    stream_max: REGISTER_STREAM_MAX ?? (opts.bounds && Number.isFinite(opts.bounds.stream_max) ? opts.bounds.stream_max : null),
    segment_max: REGISTER_SEGMENT_MAX ?? (opts.bounds && Number.isFinite(opts.bounds.segment_max) ? opts.bounds.segment_max : null),
  };
  if (needBounds && (!Number.isFinite(bounds.stream_max) || !Number.isFinite(bounds.segment_max)))
    return { fail: refuse("REGISTER_LIMITS_NOT_RECORDED", localize("acquisition.register.limits_not_recorded", "the most a register piece may stream and the most one stored segment may hold are not recorded yet, so nothing is fetched until they are"), {}) };
  if (needBounds) bounds.segment_max = Math.min(bounds.segment_max, CAPTURE_MAX);
  const at = locatorOf(pieceDef, holes);
  if (!at.ok) return { fail: refuse("PIECE_LOCATOR_HOLE", localize("acquisition.register.locator_hole", "the piece's address needs a value for {hole}; nothing was fetched", { hole: String(at.hole) }), { hole: at.hole }) };
  const hosts = systemHosts(view, definition);
  const hostRefusal = (url) => {
    const host = hostOf(url);
    if (!isPublicHttpsLocator(url) || !host || !hosts.includes(host))
      return refuse("HOST_NOT_IN_DEFINITION", localize("acquisition.register.host_not_in_definition", "{host} is not a host the register's definition names, so nothing was fetched from it", { host: String(host ?? "") }), { host });
    const own = Array.isArray(opts.ownHosts) ? opts.ownHosts : store && Array.isArray(store.ownHosts) ? store.ownHosts : null;
    if (own && isOwnHost(host, own))
      return refuse("OWN_HOST_REFUSED", localize("acquisition.register.own_host", "{host} is one of your team's own hosts; nothing was fetched", { host: String(host) }), { host });
    return null;
  };
  const first = hostRefusal(at.locator);
  if (first) return { fail: first };
  return { ok: true, definition, view, pieceDef, locator: at.locator, hosts, bounds, hostRefusal };
}

/* ---------------------------------------------------------------- the one request, governed and held to the hosts */

/* A request through the host governor under R9's agent; a redirect is followed BY HAND, each hop governed and held to the definition's hosts (R132),
   so the request is never handed to a host the definition does not name. Answers `{res, url}` or `{refused}`. */
async function registerRequest(store, url, ctx, { method = "GET", headers = null } = {}) {
  let cur = url;
  for (let hop = 0; hop <= REGISTER_HOPS_MAX; hop++) {
    const stop = ctx.hostRefusal(cur);
    if (stop) return { refused: stop };
    let g;
    try {
      const gov = store && store.governor;
      g = await hostGovernedFetch(cur, { userAgent: userAgent(store && store.env, REGISTER_PURPOSE),
        governor: gov ? { admit: (q) => gov.governorAdmit(q), report: (q) => gov.governorReport(q) } : null,
        fetch: (u, init) => fetch(u, { ...init, method, redirect: "manual", headers: { ...(init.headers || {}), ...(headers || {}) } }) });
    } catch (e) {
      return { refused: refuse("FETCH_FAILED", localize("acquisition.register.fetch_failed", "the request to the register's source did not complete ({why})", { why: String(e && e.message || e).slice(0, 120) })) };
    }
    if (g.refusedByGovernor)
      return { refused: refuse("HOST_COOLING_OFF", localize("acquisition.register.host_cooling_off", "the governor is holding requests to {host} ({reason})", { host: String(hostOf(cur)), reason: String(g.reason) }), { retry_in_ms: g.retry_in_ms || 0 }) };
    const res = g.res;
    const loc = res.status >= 300 && res.status < 400 && res.status !== 304 ? res.headers.get("location") : null;
    if (!loc) return { res, url: cur };
    cancel(res);
    try { cur = new URL(loc, cur).href; } catch { return { refused: refuse("SOURCE_REFUSED", localize("acquisition.register.bad_redirect", "the source redirected to an address that cannot be read; nothing was fetched"), { status: res.status }) }; }
  }
  return { refused: refuse("SOURCE_REFUSED", localize("acquisition.register.too_many_redirects", "the source redirected more than {n} times; nothing was fetched", { n: String(REGISTER_HOPS_MAX) })) };
}

/* A source's statuses as R10 states them. */
function refusalOf(res) {
  return refuse("SOURCE_REFUSED", localize("acquisition.register.source_refused", "the source answered {status}", { status: String(res.status) }), { status: res.status });
}

/* ---------------------------------------------------------------- a piece's bytes, whole or one zip member by range */

async function* bodyChunks(res) {
  const reader = res.body && res.body.getReader ? res.body.getReader() : null;
  if (!reader) { yield { ok: false, why: "no_body" }; return; }
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      if (value && value.length) yield value;
    }
  } catch { yield { ok: false, why: "body_broke" }; return; }
  yield { ok: true };
}

/* a zip read by range over HTTP: the first request asks for one byte to learn the size and that the source honours ranges */
async function httpRange(store, url, ctx) {
  const probe = await registerRequest(store, url, ctx, { headers: { range: "bytes=0-0" } });
  if (probe.refused) return { refused: probe.refused };
  const { res } = probe;
  if (res.status !== 206) { cancel(res); return { refused: res.ok ? refuse("RANGE_UNSUPPORTED", localize("acquisition.register.range_unsupported", "the source does not serve a part of a file, so a member of its zip cannot be read; nothing was fetched")) : refusalOf(res) }; }
  const m = /\/(\d+)\s*$/.exec(res.headers.get("content-range") || "");
  cancel(res);
  const size = m ? Number(m[1]) : NaN;
  if (!Number.isSafeInteger(size) || size < 0) return { refused: refuse("RANGE_UNSUPPORTED", localize("acquisition.register.range_unsized", "the source did not say how large its file is, so a member of its zip cannot be read; nothing was fetched")) };
  const failure = { refusal: null };
  return { size, finalUrl: probe.url, failure, read: async (offset, length) => {
    const r = await registerRequest(store, probe.url, ctx, { headers: { range: `bytes=${offset}-${offset + length - 1}` } });
    if (r.refused) { failure.refusal = r.refused; return null; }
    if (r.res.status !== 206 && !(r.res.status === 200 && offset === 0 && length === size)) { failure.refusal = r.res.ok ? refuse("RANGE_UNSUPPORTED", localize("acquisition.register.range_unsupported", "the source does not serve a part of a file, so a member of its zip cannot be read; nothing was fetched")) : refusalOf(r.res); cancel(r.res); return null; }
    return new Uint8Array(await r.res.arrayBuffer());
  } };
}

/* Opens a piece: `{ok: true, covers, declared, chunks, finalUrl}`, `chunks` yielding the decompressed bytes and last an item `{ok, ...}` saying how it ended; or `{refused}`. */
async function openPiece(store, pieceDef, locator, ctx) {
  if (typeof pieceDef.member === "string" && pieceDef.member) {
    const range = await httpRange(store, locator, ctx);
    if (range.refused) return { refused: range.refused };
    const src = { size: range.size, read: (o, n) => range.read(o, n) };
    const listed = await listMembers(src);
    if (!listed.ok) return { refused: range.failure.refusal || refuse("ARCHIVE_UNREADABLE", localize("acquisition.register.zip_unreadable", "the zip could not be read ({why}); nothing was fetched", { why: String(listed.why) }), { why: listed.why }) };
    const hits = listed.members.filter((m) => m.name === pieceDef.member);
    if (hits.length !== 1) return { refused: refuse(hits.length ? "MEMBER_AMBIGUOUS" : "MEMBER_MISSING", localize("acquisition.register.member_missing", "the zip does not hold exactly one member named {name}; nothing was fetched", { name: String(pieceDef.member) })) };
    return { ok: true, covers: `member:${pieceDef.member}`, declared: hits[0].uncompressed, finalUrl: range.finalUrl,
             chunks: streamZipMember(src, pieceDef.member, { members: listed.members, readBytes: RANGE_READ }), failure: range.failure };
  }
  const r = await registerRequest(store, locator, ctx);
  if (r.refused) return { refused: r.refused };
  if (r.res.status === 204 || !r.res.ok) { const out = refusalOf(r.res); cancel(r.res); return { refused: out }; }
  const len = Number(r.res.headers.get("content-length"));
  return { ok: true, covers: "whole_file", declared: Number.isSafeInteger(len) && len >= 0 ? len : null, finalUrl: r.url, chunks: bodyChunks(r.res), res: r.res, failure: { refusal: null } };
}

const DELIM = Object.freeze({ comma: ",", tab: "\t", pipe: "|" });
/* The separate header file of `header_from` is written in its own piece's delimiter, and `register-readers` reads its bytes in the DATA piece's: the
   header's names are carried over to the data delimiter here (quotes honoured), so a comma header file serves a pipe-separated data file. */
function headerInDelimiter(bytes, headerDelim, dataDelim) {
  const text = new TextDecoder("utf-8", { fatal: false }).decode(bytes).replace(/^\uFEFF/, "");
  const from = DELIM[headerDelim] ?? ",", to = DELIM[dataDelim] ?? ",";
  if (from === to) return bytes;
  const names = [];
  let field = "", quoted = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quoted) { if (c === '"') { if (text[i + 1] === '"') { field += '"'; i++; } else quoted = false; } else field += c; }
    else if (c === '"' && field === "") quoted = true;
    else if (c === from) { names.push(field); field = ""; }
    else if (c === "\n" || c === "\r") { if (c === "\r" && text[i + 1] === "\n") i++; break; }
    else field += c;
  }
  names.push(field);
  const cell = (v) => (v.includes(to) || /["\r\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v);
  return new TextEncoder().encode(`${names.map(cell).join(to)}\n`);
}

/* a small piece read whole (the separate header file of `header_from`) */
async function readSmall(store, pieceDef, locator, ctx, max) {
  const o = await openPiece(store, pieceDef, locator, ctx);
  if (o.refused) return { refused: o.refused };
  const got = [];
  let n = 0, end = null;
  for await (const c of o.chunks) {
    if (c instanceof Uint8Array) { n += c.length; if (n > max) { cancel(o.res); return { refused: refuse("TOO_LARGE", localize("acquisition.register.header_too_large", "the header file is larger than a header can be; nothing was fetched")) }; } got.push(c); }
    else end = c;
  }
  if (!end || end.ok !== true) return { refused: o.failure.refusal || refuse("FETCH_FAILED", localize("acquisition.register.header_broke", "the header file could not be read to its end; nothing was fetched"), { why: end && end.why }) };
  const all = new Uint8Array(n);
  let at = 0;
  for (const c of got) { all.set(c, at); at += c.length; }
  return { bytes: all };
}

/* ---------------------------------------------------------------- the reduced output, cut into segments at row boundaries */

function hashOnly(parts) {
  const h = createSha256();
  let bytes = 0;
  return { async write(c) { h.update(c); bytes += c.length; }, async finish() { return { sha256: h.hex(), bytes, parts }; } };
}

/** R127: the resume token, opaque to its caller. */
const tokenOf = (t) => b64url(JSON.stringify(t));
function readToken(resume) {
  if (resume === null || resume === undefined) return { ok: true, token: null };
  const text = typeof resume === "string" ? unb64url(resume) : null;
  let t = null;
  try { t = text ? JSON.parse(text) : null; } catch { t = null; }
  if (!isObj(t) || t.v !== RESUME_VERSION || !Array.isArray(t.seg) || t.seg.some((s) => !isObj(s) || !/^[0-9a-f]{64}$/.test(s.sha256) || !Number.isSafeInteger(s.bytes) || (s.parts !== null && s.parts !== undefined && !Array.isArray(s.parts))))
    return { ok: false };
  return { ok: true, token: t };
}

/**
 * R125–R127, R129, R132, R133: `streamRegister(store, {definition, piece, filter, import, resume, budget_ms, budget_bytes, viewer, holes, view, refresh, force}, opts)`.
 * `definition` is a register definition (`jurisdictions` R127), `piece` the key of one of its pieces, `holes` the values of the piece's named holes (`cycle`,
 * `table`), `filter` a closed filter (`register-readers` R6), `import` the id of the import the capture is filed for. Answers, when the piece is read to its
 * end, `{ok: true, done: true, segments, documents, progress, reduced, original, filter_fingerprint}`; when a budget is spent first,
 * `{ok: true, done: false, resume, progress, checkpoint}`; else a refusal. `opts.bounds` states `stream_max` and `segment_max` where `READ_BOUNDS` has no row yet.
 */
export async function streamRegister(store, args = {}, opts = {}) {
  try { return await streamInner(store, isObj(args) ? args : {}, isObj(opts) ? opts : {}); }
  catch (e) { return refuse("REGISTER_UNREADABLE", localize("acquisition.register.unreadable", "the register piece could not be read ({why}); nothing was filed", { why: String(e && e.message || e).slice(0, 120) })); }
}

async function streamInner(store, args, opts) {
  const prep = prepare(store, args, opts, { needBounds: true });
  if (prep.fail) return prep.fail;
  const { definition, pieceDef, locator, bounds } = prep;
  const piece = pieceDef.key;
  const importId = typeof args.import === "string" && args.import.trim() ? args.import.trim().slice(0, 200) : null;
  const checked = validateFilter(isObj(args.filter) ? args.filter : {}, definition);
  if (!checked.ok) return refuse(checked.code, localize("acquisition.register.filter_refused", "the filter is refused ({code}, {field}); nothing was fetched", { code: String(checked.code), field: String(checked.field ?? "") }), { field: checked.field ?? null });
  const filterFp = filterFingerprint(checked.filter);
  const tok = readToken(args.resume);
  if (!tok.ok || (tok.token && (tok.token.piece !== piece || tok.token.import !== importId || tok.token.filter !== filterFp || tok.token.locator !== locator)))
    return refuse("RESUME_MISMATCH", localize("acquisition.register.resume_mismatch", "that resume token is not for this piece, import and filter; nothing was fetched"));
  const done0 = tok.token ? tok.token.seg : [];
  const ev = store && store.core && typeof store.core.evidenceStore === "function" ? store.core.evidenceStore() : null;
  if (!ev) return refuse("EVIDENCE_STORAGE_NOT_CONFIGURED", localize("acquisition.register.no_storage", "your team's Civicsmith has no evidence storage configured, so nothing was fetched"));

  /* R129: an unchanged source is not fetched again; the probe makes no body request */
  if (isObj(args.refresh) && !args.force) {
    const probe = await probeRegister(store, { definition, piece, filter: args.filter, holes: args.holes, view: prep.view }, opts);
    if (probe.ok && !sourceChanged(probe, args.refresh.probe, definition))
      return refuse("REFRESH_UNCHANGED", localize("acquisition.register.refresh_unchanged", "the source has not changed since the last look, so it was not fetched again"), { validators: probe.validators });
  }

  /* the separate header file, when the definition has one (`header_from`) */
  let header;
  if (typeof pieceDef.header_from === "string") {
    const hp = definition.pieces.find((p) => p && p.key === pieceDef.header_from);
    const hl = hp ? locatorOf(hp, args.holes) : null;
    if (!hp || !hl || !hl.ok) return refuse("PIECE_UNKNOWN", localize("acquisition.register.header_piece", "the piece's header file is not one the register names; nothing was fetched"));
    const small = await readSmall(store, hp, hl.locator, prep, 1 << 20);
    if (small.refused) return small.refused;
    header = headerInDelimiter(small.bytes, hp.delimiter ?? definition.delimiter, pieceDef.delimiter ?? definition.delimiter);
  }

  const opened = await openPiece(store, pieceDef, locator, prep);
  if (opened.refused) return opened.refused;
  const tooLarge = (size) => refuse("TOO_LARGE", localize("acquisition.register.too_large", "the piece is larger than the most a register piece may stream; nothing was stored"), { status: 413, size, bound: bounds.stream_max, key: "register.stream_max" });
  if (opened.declared !== null && opened.declared > bounds.stream_max) { cancel(opened.res); return tooLarge(opened.declared); }

  const reducer = createReducer({ definition, piece, filter: checked.filter, header, sha256: createResumableSha256, covers: opened.covers });
  const env = (store && store.env) || {};
  const retrievedMs = nowOf(store);
  const budgetMs = Number.isFinite(args.budget_ms) ? args.budget_ms : null, budgetBytes = Number.isFinite(args.budget_bytes) ? args.budget_bytes : null;

  /* the segments: cut at row boundaries, a row never split, a quoted line break never taken for a row's end */
  const segs = [];                  // finished segments: {n, sha256, bytes, parts, rows}
  let cur = null, headerBytes = null, inQuote = false, nextN = 0;
  let bytesIn = 0, newIn = 0, newOut = 0, t0 = null, stop = null;
  const startSegment = async () => {
    const replay = nextN < done0.length;
    if (!replay && t0 === null) t0 = Date.now();
    cur = { n: nextN++, replay, writer: replay ? hashOnly(done0[nextN - 1].parts ?? null) : partsWriter(ev), bytes: 0, rows: 0 };
    if (cur.n > 0 && headerBytes) { await cur.writer.write(headerBytes.slice()); cur.bytes += headerBytes.length; }
  };
  const closeSegment = async () => {
    const r = await cur.writer.finish();
    if (cur.replay && (done0[cur.n].sha256 !== r.sha256))
      return refuse("RESUME_DIVERGED", localize("acquisition.register.resume_diverged", "the source no longer gives the segments already stored, so the import cannot be continued; start it again"), { segment: cur.n });
    if (!cur.replay) newOut += r.bytes;
    segs.push({ n: cur.n, sha256: r.sha256, bytes: r.bytes, parts: r.parts, rows: cur.rows });
    cur = null;
    return null;
  };
  const budgetSpent = () => t0 !== null && ((budgetMs !== null && Date.now() - t0 >= budgetMs) || (budgetBytes !== null && newIn + newOut >= budgetBytes));
  const feed = async (b) => {
    if (!b || !b.length) return null;
    const ends = [];
    let rs = 0;
    for (let j = 0; j < b.length; j++) {
      const c = b[j];
      if (c === 0x22) inQuote = !inQuote;
      else if (c === 0x0a && !inQuote) { ends.push([rs, j + 1]); rs = j + 1; }
    }
    if (rs !== b.length) ends.push([rs, b.length]);   // a trailing partial row: the reducer writes whole rows, so this is only a defence
    let batch = 0;
    const flushTo = async (upto) => { if (cur && upto > batch) { const part = b.subarray(batch, upto); await cur.writer.write(part); cur.bytes += part.length; } batch = upto; };
    for (const [s, e] of ends) {
      const isHeader = headerBytes === null;
      if (isHeader) headerBytes = b.slice(s, e);
      else if (cur && cur.rows > 0 && cur.bytes + (s - batch) + (e - s) > bounds.segment_max) {
        await flushTo(s);
        const wasReplay = cur.replay;
        const bad = await closeSegment();
        if (bad) return bad;
        if (!wasReplay && budgetSpent()) { stop = true; return null; }
        batch = s;
      }
      if (!cur) { await startSegment(); batch = s; }
      if (!isHeader) cur.rows++;
    }
    await flushTo(b.length);
    return null;
  };

  let end = null;
  for await (const c of opened.chunks) {
    if (c instanceof Uint8Array) {
      bytesIn += c.length;
      if (bytesIn > bounds.stream_max) { cancel(opened.res); return tooLarge(bytesIn); }
      if (t0 !== null) newIn += c.length;
      const bad = await feed(reducer.write(c));
      if (bad) { cancel(opened.res); return bad; }
      if (stop) { cancel(opened.res); break; }
    } else end = c;
  }
  const sliceAnswer = () => ({ ok: true, done: false, checkpoint: "member_start",
    resume: tokenOf({ v: RESUME_VERSION, piece, import: importId, filter: filterFp, locator, seg: segs.map((s) => ({ sha256: s.sha256, bytes: s.bytes, parts: s.parts })) }),
    progress: { bytes_in: bytesIn, rows_in: null, rows_out: segs.reduce((n, s) => n + s.rows, 0), segments_stored: segs.length } });
  if (stop) return sliceAnswer();
  if (!end || end.ok !== true) return opened.failure.refusal || refuse("FETCH_FAILED", localize("acquisition.register.body_broke", "the piece could not be read to its end ({why}); nothing was filed", { why: String(end && end.why || "the body broke off") }), { why: end && end.why });
  const finished = reducer.end();
  if (!finished.ok) return refuse("REGISTER_NOT_READABLE", localize("acquisition.register.not_readable", "the piece cannot be read as this register's file ({why}); nothing was filed", { why: String(finished.why) }), { why: finished.why, column: finished.column ?? null });
  const bad = await feed(finished.bytes);
  if (bad) return bad;
  if (stop) return sliceAnswer();
  if (cur) { const b2 = await closeSegment(); if (b2) return b2; }
  if (!segs.length) return refuse("REGISTER_NOT_READABLE", localize("acquisition.register.not_readable", "the piece cannot be read as this register's file ({why}); nothing was filed", { why: "header_missing" }), { why: "header_missing" });
  if (done0.length > segs.length) return refuse("RESUME_DIVERGED", localize("acquisition.register.resume_diverged", "the source no longer gives the segments already stored, so the import cannot be continued; start it again"), {});

  /* R133: the receipts and documents, once the original's fingerprint is known (every segment names it) */
  const retrieved = second(retrievedMs);
  const p = store && store.provenance;
  const actor = typeof args.viewer === "string" && args.viewer.trim() && !isMachineIdentity(args.viewer) ? args.viewer.trim() : null;
  const documents = [], out = [], seen = new Map();
  for (const s of segs) {
    const final = s.n === segs.length - 1;
    const address = `${locator}${typeof pieceDef.member === "string" ? `!${pieceDef.member}` : ""}#segment:${s.n}`;
    let existed = false, duplicateOf = null;
    if (seen.has(s.sha256)) { existed = true; duplicateOf = seen.get(s.sha256); }
    else {
      seen.set(s.sha256, s.n);
      try { const h = p && typeof p.registerHolds === "function" ? p.registerHolds({ sha: s.sha256 }) : null; existed = !!(h && (h.registered === true || h.acquired === true)); } catch { existed = false; }
    }
    out.push({ n: s.n, final, sha256: s.sha256, bytes: s.bytes, rows: s.rows, existed, ...(duplicateOf !== null ? { duplicate_of: duplicateOf } : {}) });
    if (existed) continue;
    const receipt = { address, addressNorm: normalizeAddress(address), captureSha: s.sha256, retrieved, via: "direct", retrievalLocator: opened.finalUrl || locator };
    try { await p?.recordReceipt?.(receipt); } catch { /* an unwritten receipt is not a failed capture */ }
    const multipart = Array.isArray(s.parts) && s.parts.length > 1;
    const name = `register-${s.sha256.slice(0, 16)}`;
    const profile = await profileOf({ ev, sha: s.sha256, ct: "text/csv", total: s.bytes, multipart, headers: {}, locator: address, view: profileView(store && store.core), retrieved,
                                      origin: "fetch", name: `${name}.csv`, declaredType: "text/csv", parts: s.parts });
    documents.push({
      file: `snapshots/${name}`, locator: address, retrieved, profile,
      authority: importId, authority_state: importId ? "determined" : "undetermined",
      authority_basis: localize("acquisition.register.authority_basis", "the member's import {import} asked for this register piece, {retrieved}", { import: String(importId ?? ""), retrieved }),
      provenance_chain: [{
        who: firstHopWho(env.INSTANCE_NAME, env.VERSION),
        asserts: localize("acquisition.register.first_hop_asserts", "the source served bytes with this fingerprint for {locator} at {retrieved}; this file is their reduction under the stated definition and filter", { locator: String(address), retrieved }),
        evidence: localize("acquisition.register.first_hop_evidence", "first-party https fetch through the host governor, reduced as it arrived; the original's fingerprint is on this document, the original is not kept"),
        bound: false, via: "direct",
      }],
      capture: {
        method: localize("acquisition.register.method", "bio-plane streamRegister, https fetch, reduced as it arrived, hashed as written"),
        grade: EARNED_CAPTURE_CEILING,
        actor_class: actor ? "member" : "daemon", actor,
        sha256: s.sha256, encoding: "binary", bytes: s.bytes, content_type: "text/csv",
        reduced: {
          original: { sha256: finished.original.sha256, bytes: finished.original.bytes, covers: finished.original.covers },
          dropped_columns: finished.reduced.dropped_columns, filter_fingerprint: finished.filter_fingerprint,
          rows_in: finished.reduced.rows_in, rows_out: finished.reduced.rows_out, rows_undetermined: finished.reduced.rows_undetermined,
          withheld_cells: finished.reduced.withheld_cells, kept_columns: finished.reduced.kept_columns,
          reason: "reduced under K1485", terms_basis: definition.terms_basis,
          segment: { n: s.n, of: segs.length, final, rows: s.rows },
        },
      },
      ...(multipart ? { parts: s.parts.map((x, i) => ({ file: `snapshots/${name}.part${String(i).padStart(3, "0")}`, sha256: x.sha256, bytes: x.bytes })) } : {}),
      origin: { kind: "named_request", import: importId, piece, segment: s.n, final },
      attestation_attempts: [],
    });
  }
  return { ok: true, done: true, checkpoint: opened.covers.startsWith("member:") ? "member_start" : "piece_start", segments: out, documents,
           progress: { bytes_in: bytesIn, rows_in: finished.reduced.rows_in, rows_out: finished.reduced.rows_out, segments_stored: segs.length },
           original: finished.original, reduced: finished.reduced, filter_fingerprint: finished.filter_fingerprint };
}

/* ---------------------------------------------------------------- R128: size and change without a body */

const count1 = (text) => {
  const t = String(text).trim();
  if (/^\d+$/.test(t)) return Number(t);
  try {
    const j = JSON.parse(t);
    const v = Array.isArray(j) ? (j[0] && (j[0].count ?? j[0].COUNT ?? j[0].count_1)) : isObj(j) ? (j.count ?? j.total) : j;
    const n = Number(v);
    return Number.isSafeInteger(n) && n >= 0 ? n : null;
  } catch { return null; }
};

/* whether the source's count query can apply every criterion of the filter; the query asks for exactly those, as named parameters */
function countParams(filter, supports) {
  const sup = Array.isArray(supports) ? supports : [];
  const params = [];
  for (const [k, v] of Object.entries(isObj(filter) ? filter : {})) {
    if (Array.isArray(v)) { if (!sup.includes(k)) return null; params.push([k, v.join(",")]); }
    else if (isObj(v) && k !== "places") { for (const [sub, x] of Object.entries(v)) { if (!sup.includes(`${k}_${sub}`)) return null; params.push([`${k}_${sub}`, String(x)]); } }
    else return null;
  }
  return params;
}

/**
 * R128: `probeRegister(store, {definition, piece, filter, holes, budget_ms, view}, opts)` makes only governed requests: a HEAD (or, where the source will not answer one,
 * a one-byte range request) for `Content-Length`, `ETag`, `Last-Modified` and the range support, and, where the definition's `count` supports every criterion of the
 * filter, the source's own count query for it. Answers `{ok: true, bytes: {value, basis}, rows: {value, basis}, validators, source_date, reached, timed_out, ranges}`;
 * `basis` is `stated`, `counted` or `not_stated`, and a row count is `counted` only when the source counted it for that filter. It fetches no body and stores nothing.
 */
export async function probeRegister(store, args = {}, opts = {}) {
  try {
    const a = isObj(args) ? args : {};
    const prep = prepare(store, a, isObj(opts) ? opts : {}, { needBounds: false });
    if (prep.fail) return prep.fail;
    const { definition, pieceDef, locator } = prep;
    const deadline = Number.isFinite(a.budget_ms) ? Date.now() + a.budget_ms : null;
    const reached = [];
    let timedOut = false;
    const withinBudget = async (work) => {
      if (deadline === null) return work();
      const left = deadline - Date.now();
      if (left <= 0) { timedOut = true; return { timedOut: true }; }
      let timer;
      const late = new Promise((r) => { timer = setTimeout(() => r({ timedOut: true }), left); });
      try { const v = await Promise.race([work(), late]); if (v && v.timedOut === true) timedOut = true; return v; } finally { clearTimeout(timer); }
    };
    const validators = { etag: null, last_modified: null, content_length: null, count: null };
    let bytes = { value: null, basis: "not_stated" }, rows = { value: null, basis: "not_stated" }, ranges = null, source_date = null;
    const read = (res, total) => {
      validators.etag = res.headers.get("etag") || validators.etag;
      validators.last_modified = res.headers.get("last-modified") || validators.last_modified;
      const cl = res.headers.get("content-length");
      const len = total ?? (cl !== null && cl !== "" ? Number(cl) : NaN);
      if (Number.isSafeInteger(len) && len >= 0) { validators.content_length = String(len); bytes = { value: len, basis: "stated" }; }
      const ar = (res.headers.get("accept-ranges") || "").toLowerCase();
      if (ar) ranges = ar === "bytes";
      if (validators.last_modified) { const d = new Date(validators.last_modified); if (!Number.isNaN(d.getTime())) source_date = d.toISOString().slice(0, 10); }
    };
    let head = await withinBudget(() => registerRequest(store, locator, prep, { method: "HEAD" }));
    if (head && head.timedOut) return finish();
    if (head.refused) return head.refused;
    if (head.res.status === 405 || head.res.status === 501 || head.res.status === 403) {
      cancel(head.res);
      head = await withinBudget(() => registerRequest(store, locator, prep, { headers: { range: "bytes=0-0" } }));
      if (head && head.timedOut) return finish();
      if (head.refused) return head.refused;
      reached.push("range");
      if (head.res.status === 206) {
        const m = /\/(\d+)\s*$/.exec(head.res.headers.get("content-range") || "");
        read(head.res, m ? Number(m[1]) : undefined);
        ranges = true;
      } else if (head.res.ok) read(head.res);
      else { const out = refusalOf(head.res); cancel(head.res); return out; }
    } else if (head.res.ok) { reached.push("head"); read(head.res); }
    else { const out = refusalOf(head.res); cancel(head.res); return out; }
    cancel(head.res);
    /* the source's own count, only where it can apply every criterion of the filter */
    const c = definition.count;
    if (isObj(c) && c.kind === "source_count_query" && typeof c.template === "string") {
      const params = countParams(a.filter, c.supports);
      const at = params ? locatorOf({ locator: c.template }, a.holes) : null;
      if (params && at && at.ok) {
        const u = new URL(at.locator);
        for (const [k, v] of params) u.searchParams.set(k, v);
        const r = await withinBudget(() => registerRequest(store, u.href, prep, { headers: { accept: "application/json" } }));
        if (r && r.timedOut) return finish();
        if (!r.refused) {
          reached.push("count");
          if (r.res.ok) {
            const n = count1(await r.res.text());
            if (n !== null) { rows = { value: n, basis: "counted" }; validators.count = String(n); }
          } else cancel(r.res);
        }
      }
    }
    return finish();
    function finish() {
      return { ok: true, bytes, rows, validators, source_date, reached, timed_out: timedOut, ranges,
               refresh_validators: isObj(definition.refresh) && Array.isArray(definition.refresh.validators) ? [...definition.refresh.validators] : [] };
    }
  } catch (e) { return refuse("REGISTER_UNREADABLE", localize("acquisition.register.probe_unreadable", "the register could not be probed ({why}); nothing was stored", { why: String(e && e.message || e).slice(0, 120) })); }
}

/**
 * R129: `sourceChanged(probe, lastProbe, definition?)` is false when every validator the definition's `refresh.validators` names agrees between the two probes
 * (both stated, and equal), and true when any differs, is not stated, or when the definition names none. Pure; never throws.
 */
export function sourceChanged(probe, lastProbe, definition = null) {
  try {
    const names = isObj(definition) ? (isObj(definition.refresh) && Array.isArray(definition.refresh.validators) ? definition.refresh.validators : [])
      : isObj(probe) && Array.isArray(probe.refresh_validators) ? probe.refresh_validators : [];
    if (!names.length || !isObj(probe) || !isObj(lastProbe) || !isObj(probe.validators) || !isObj(lastProbe.validators)) return true;
    for (const n of names) {
      const a = probe.validators[n], b = lastProbe.validators[n];
      if (a === null || a === undefined || b === null || b === undefined || String(a) !== String(b)) return true;
    }
    return false;
  } catch { return true; }
}

