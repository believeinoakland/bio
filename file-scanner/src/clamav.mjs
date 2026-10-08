/* The built-in scan (R1–R4) and the signature mirror (R6). The Worker reads every byte from the group's bucket and
 * hands the `FileScanner` image copies (container/scanner.mjs): the mirrored set when the image does not hold it, then
 * one request's targets, scanned by one run that loads the set once.
 *
 * The mirror lives under `clamav/`: `clamav/current.json` names the set in use (each file's key, version, build time
 * and signature count), `clamav/state.json` the last attempt and its error, and the files themselves sit under
 * `clamav/sets/<run>/`. A run stages what changed, has the image verify each file's digital signature, and only then
 * replaces `current.json`, so a failed run leaves the last good set. */
import { SCAN_BATCH_MAX, SIGNATURES_MAX_AGE_MS } from './limits.mjs';
import { normaliseTarget, knownStore, sizeTarget, targetStream, writeObject, deleteObject, readJson } from './store.mjs';

export const MIRROR_HOST = 'database.clamav.net';
export const DATABASES = Object.freeze(['main.cvd', 'daily.cvd', 'bytecode.cvd']);
export const CURRENT = 'clamav/current.json';
export const STATE = 'clamav/state.json';

const runId = (now) => `r${new Date(now).toISOString().replace(/[-:.TZ]/g, '')}${Math.random().toString(36).slice(2, 8)}`;
const reply = (status, body) => new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });

/** `{main, daily, bytecode, published}` as the set states them. */
export function signaturesOf(current) {
  if (!current) return null;
  const v = (db) => {
    const f = Object.entries(current.files).find(([n]) => n.split('.')[0] === db);
    return f && Number.isFinite(Number(f[1].version)) ? Number(f[1].version) : null;
  };
  return { main: v('main'), daily: v('daily'), bytecode: v('bytecode'), published: current.published };
}

/** A container answer as JSON, or null when the image could not be reached or answered otherwise. */
async function ask(container, path, init) {
  try {
    const r = await container(path, init);
    const body = await r.json().catch(() => null);
    return r.ok && body && body.ok ? body : null;
  } catch { return null; }
}

/** R4: the image holds `current`'s set, loaded from the bucket only when it does not. Answers the image's ClamAV
 *  version, or null when the set could not be loaded. */
async function ensureSet(deps, current) {
  const held = await ask(deps.scanner, '/sigs');
  if (!held) return null;
  const version = held.clamav_version || 'not reported';
  if (held.set === current.set) return version;
  for (const [name, f] of Object.entries(current.files)) {
    const obj = await deps.bucket.get(f.key);
    if (!obj) return null;
    const put = await ask(deps.scanner, `/sigs/${current.set}/${name}`, { method: 'PUT', body: obj.body, duplex: 'half' });
    if (!put) return null;
  }
  return (await ask(deps.scanner, `/sigs/${current.set}/load`, { method: 'POST' })) ? version : null;
}

/** POST /scan (R1–R4). */
export async function scan(deps, body) {
  const started = deps.now();
  if (!body || !knownStore(body.store)) return reply(400, { ok: false, code: 'NAMESPACE_UNKNOWN' });
  const targets = body.targets;
  if (!Array.isArray(targets) || targets.length < 1 || targets.length > SCAN_BATCH_MAX) return reply(400, { ok: false, code: 'BAD_BATCH' });
  if (!deps.bucket) return reply(503, { ok: false, code: 'R2_NOT_CONFIGURED' });
  const store = body.store;
  const current = await readJson(deps.bucket, CURRENT);
  const signatures = signaturesOf(current);
  let engineVersion = 'not reported';
  const verdict = (capture_sha, fields) => ({ capture_sha, tool: 'clamav', engine: 'clamav', engine_version: null,
    signatures, scanned_at: new Date(deps.now()).toISOString(), findings: [], latency_ms: Math.max(0, deps.now() - started), ...fields });
  const notScanned = (sha, reason) => verdict(typeof sha === 'string' ? sha : null, { result: 'not_scanned', reason });

  const shaOf = (t) => (t && typeof t === 'object' ? t.capture_sha : null);
  const out = new Array(targets.length);
  let setReason = null;
  if (!current) setReason = 'SIGNATURES_ABSENT';
  else if (!(Date.parse(current.published) >= deps.now() - SIGNATURES_MAX_AGE_MS)) setReason = 'SIGNATURES_STALE';
  else {
    const v = await ensureSet(deps, current);
    if (v) engineVersion = v; else setReason = 'SCANNER_UNAVAILABLE';
  }
  const job = runId(deps.now());
  const staged = [];
  for (let i = 0; i < targets.length; i++) {
    const t = normaliseTarget(targets[i]);
    if (!t) { out[i] = notScanned(shaOf(targets[i]), 'BAD_TARGET'); continue; }
    if (setReason) { out[i] = notScanned(t.capture_sha, setReason); continue; }
    const size = await sizeTarget(deps.bucket, store, t);
    if (!size.ok) { out[i] = notScanned(t.capture_sha, size.reason); continue; }
    const { stream, outcome } = targetStream(deps.bucket, store, t);
    const put = await ask(deps.scanner, `/job/${job}/${i}`, { method: 'PUT', body: stream, duplex: 'half' });
    // An image that answered before reading the copy whole took nothing to scan.
    const o = await Promise.race([outcome, new Promise((res) => setTimeout(() => res({ ok: true, unread: true }), 0))]);
    if (o.unread || !o.ok || !put) {
      await ask(deps.scanner, `/job/${job}/${i}`, { method: 'DELETE' });
      out[i] = notScanned(t.capture_sha, o.ok || o.unread ? 'SCANNER_UNAVAILABLE' : o.reason);
      continue;
    }
    staged.push([i, t.capture_sha]);
  }
  if (staged.length) {
    const r = await ask(deps.scanner, `/job/${job}/scan?set=${encodeURIComponent(current.set)}`, { method: 'POST' });
    if (r) engineVersion = r.engine_version || 'not reported';
    for (const [i, sha] of staged) {
      const v = r && r.results[i];
      out[i] = v ? verdict(sha, { result: v.result, findings: v.findings || [], ...(v.detail ? { detail: v.detail } : {}) })
        : notScanned(sha, 'SCANNER_UNAVAILABLE');
    }
  } else {
    await ask(deps.scanner, `/job/${job}`, { method: 'DELETE' });
  }
  for (const v of out) v.engine_version = engineVersion;
  return reply(200, { ok: true, verdicts: out });
}

// ── the mirror (R6)

async function putStream(bucket, key, response) {
  const len = Number(response.headers.get('content-length'));
  let body = response.body;
  if (typeof FixedLengthStream === 'function' && Number.isSafeInteger(len) && len > 0) {
    const fixed = new FixedLengthStream(len); // eslint-disable-line no-undef
    response.body.pipeTo(fixed.writable).catch(() => {});
    body = fixed.readable;
  } else if (typeof FixedLengthStream !== 'function') {
    body = new Uint8Array(await response.arrayBuffer());
  }
  return writeObject(bucket, key, body);
}

/** One mirror run: `{ok, versions, published, error?}`. Reaches only ClamAV's database host (R12). */
export async function runMirror(deps) {
  const now = deps.now();
  const previous = await readJson(deps.bucket, CURRENT);
  const run = runId(now);
  const staged = [];
  const files = {};
  let error = null;
  try {
    for (const db of DATABASES) {
      const prev = previous && previous.files[db];
      const headers = { 'user-agent': `file-scanner/${deps.version || 'unknown'} (signature mirror; as cvdupdate)` };
      if (prev && prev.last_modified) headers['if-modified-since'] = prev.last_modified;
      let r;
      try { r = await deps.fetch(`https://${MIRROR_HOST}/${db}`, { headers }); } catch { throw new Error(`UNREACHABLE:${db}`); }
      if (r.status === 304 && prev) { files[db] = prev; continue; }
      if (r.status !== 200 || !r.body) throw new Error(`REFUSED:${db}:${r.status}`);
      const key = `clamav/sets/${run}/${db}`;
      await putStream(deps.bucket, key, r);
      staged.push(key);
      files[db] = { key, last_modified: r.headers.get('last-modified') || null };
    }
    // Each new file's digital signature, verified by the image's sigtool before the set replaces the last good one.
    const fresh = Object.entries(files).filter(([, f]) => staged.includes(f.key));
    if (fresh.length) {
      for (const [db, f] of fresh) {
        const obj = await deps.bucket.get(f.key);
        if (!obj || !(await ask(deps.scanner, `/verify/${run}/${db}`, { method: 'PUT', body: obj.body, duplex: 'half' }))) {
          throw new Error(`VERIFIER_UNAVAILABLE:${db}`);
        }
      }
      const v = await ask(deps.scanner, `/verify/${run}`, { method: 'POST' });
      if (!v) throw new Error('VERIFIER_UNAVAILABLE');
      for (const [db, f] of fresh) {
        const s = v.files[db];
        if (!s || !s.verified) throw new Error(`SIGNATURE_INVALID:${db}`);
        Object.assign(f, { version: s.version, build_time: s.build_time, sigs: s.sigs });
      }
    }
    const published = Object.values(files).map((f) => Date.parse(f.build_time)).filter(Number.isFinite);
    if (!published.length) throw new Error('NO_BUILD_TIME');
    const current = { set: fresh.length ? run : previous.set, files, published: new Date(Math.max(...published)).toISOString(),
      mirrored_at: new Date(now).toISOString() };
    await writeObject(deps.bucket, CURRENT, JSON.stringify(current));
    // The previous set's files that the new one no longer names.
    const keep = new Set(Object.values(files).map((f) => f.key));
    for (const f of Object.values((previous && previous.files) || {})) if (!keep.has(f.key)) await deleteObject(deps.bucket, f.key);
    await writeObject(deps.bucket, STATE, JSON.stringify({ last_attempt: new Date(now).toISOString(), last_error: null }));
    return { ok: true, versions: signaturesOf(current), published: current.published };
  } catch (e) {
    error = String(e.message || e);
    for (const key of staged) await deleteObject(deps.bucket, key).catch(() => {});
    await writeObject(deps.bucket, STATE, JSON.stringify({ last_attempt: new Date(now).toISOString(), last_error: error }));
    const last = previous ? signaturesOf(previous) : null;
    return { ok: false, versions: last, published: previous ? previous.published : null, error };
  }
}

/** POST /mirror (R6). */
export async function mirror(deps) {
  if (!deps.bucket) return reply(503, { ok: false, code: 'R2_NOT_CONFIGURED' });
  return reply(200, await runMirror(deps));
}

/** /version's `signatures` (R8). */
export async function signatureState(bucket) {
  const current = bucket ? await readJson(bucket, CURRENT) : null;
  const state = bucket ? await readJson(bucket, STATE) : null;
  return { versions: signaturesOf(current), published: current ? current.published : null,
    mirrored_at: current ? current.mirrored_at : null, last_attempt: state ? state.last_attempt : null,
    last_error: state ? state.last_error : null };
}
