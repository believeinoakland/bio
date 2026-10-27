/* PROTO-B (throwaway; never merged): a measurement of "bulk text and indexes out of the room". Behind env PROTO_B=1; with the flag unset
   nothing here runs and no behaviour differs. It COPIES units of up to N captures from `capture_text` into the CAPTURES bucket under
   `proto-b/` with a per-bundle inverted index, and times reading and a term search both ways. It never changes or deletes a room row, and writes
   nothing in R2 outside `proto-b/`.
   NOTE ON TIME: workerd freezes Date.now() during synchronous work (cpu.mjs), so a SQL phase can read 0 ms in here. Every number carries its
   work counts (rows read, bytes), and `scripts/protob-probe.mjs` times each phase from outside as whole requests, less a `noop` baseline. */
export const PROTO_B_PREFIX = "proto-b/";
const PUT_PARALLEL = 8;
const num = (v, d, lo, hi) => { const n = Number(v); return Number.isFinite(n) ? Math.min(hi, Math.max(lo, Math.floor(n))) : d; };
const tokens = (text) => [...new Set(String(text).toLowerCase().match(/[\p{L}\p{N}]{2,}/gu) || [])];
const bytesOf = (s) => new TextEncoder().encode(s).length;

async function inBatches(list, fn, size = PUT_PARALLEL) {
  const out = [];
  for (let i = 0; i < list.length; i += size) out.push(...await Promise.all(list.slice(i, i + size).map(fn)));
  return out;
}
async function timed(fn) {
  const t0 = Date.now(), p0 = typeof performance !== "undefined" ? performance.now() : 0;
  const value = await fn();
  const ms = Date.now() - t0;
  return { value, ms, ms_fine: typeof performance !== "undefined" ? Math.round((performance.now() - p0) * 100) / 100 : ms };
}
const rows = (sql, q, ...a) => { const c = sql.exec(q, ...a); const r = c.toArray(); return { r, read: c.rowsRead ?? null }; };

/** `sql`: the room's storage.sql; `bucket`: env.CAPTURES; `store`: the room's name; `args`: the query parameters as an object. */
export async function protobProbe({ sql, bucket, store, args = {} }) {
  const P = `${PROTO_B_PREFIX}${store}/`, key = { man: `${P}manifest`, idx: (b) => `${P}idx/${b}`, unit: (s, q) => `${P}u/${s}/${q}` };
  const n = num(args.n, 50, 1, 500), k = num(args.k, 100, 1, 2000), hits = num(args.hits, 20, 1, 200), maxUnits = num(args.maxunits, 400, 1, 5000);
  const phase = ["noop", "copy", "read", "read_room", "read_r2", "search", "search_room", "search_r2", "bytes", "all"].includes(args.phase) ? args.phase : "all";
  const out = { phase, n, k, hits, timing_note: "Date.now is frozen in synchronous work; see scripts/protob-probe.mjs for outside timings" };
  if (phase === "noop") return out;
  const readManifest = async () => { const o = await bucket.get(key.man); return o ? JSON.parse(await o.text()) : null; };

  let man = phase === "copy" || phase === "all" ? (args.copy === "1" ? null : await readManifest()) : await readManifest();
  if (!man && (phase === "copy" || phase === "all")) {
    const t = await timed(async () => {
      const caps = rows(sql, `SELECT capture_sha, bundle_id, count(*) c FROM capture_text GROUP BY capture_sha ORDER BY capture_sha LIMIT ?`, n).r;
      const units = [], perBundle = new Map(), capList = [];
      let left = maxUnits, putBytes = 0, puts = 0, roomRead = 0;
      for (const c of caps) {
        if (left <= 0) break;
        const q = rows(sql, `SELECT extent_kind, extent, ref, seq, text FROM capture_text WHERE capture_sha=? ORDER BY seq LIMIT ?`, c.capture_sha, left);
        roomRead += q.read || 0;
        left -= q.r.length;
        capList.push({ sha: c.capture_sha, bundle: c.bundle_id, units: q.r.length });
        const idx = perBundle.get(c.bundle_id) || perBundle.set(c.bundle_id, new Map()).get(c.bundle_id);
        for (const u of q.r) {
          const id = `${c.capture_sha}/${u.seq}`;
          units.push({ id, sha: c.capture_sha, seq: u.seq, body: JSON.stringify({ k: u.extent_kind, e: u.extent, ref: u.ref, seq: u.seq, text: u.text }) });
          for (const w of tokens(u.text)) (idx.get(w) || idx.set(w, []).get(w)).push(id);
        }
      }
      await inBatches(units, async (u) => { await bucket.put(key.unit(u.sha, u.seq), u.body); putBytes += bytesOf(u.body); puts++; });
      const idxBytes = {};
      await inBatches([...perBundle], async ([b, m]) => {
        const body = JSON.stringify(Object.fromEntries(m)); await bucket.put(key.idx(b), body); idxBytes[b] = bytesOf(body); puts++;
      });
      /* a sample term: a word of five or more letters that sits in the most units of the first bundle */
      let sample = null, best = 0;
      const first = perBundle.values().next().value;
      if (first) for (const [w, ids] of first) if (w.length >= 5 && ids.length > best && ids.length < units.length) { best = ids.length; sample = w; }
      const manifest = { at: new Date().toISOString(), captures: capList, units: units.map((u) => u.id), unitBytes: putBytes,
                         idxBytes, sampleTerm: sample, bundles: [...perBundle.keys()] };
      const mb = JSON.stringify(manifest); await bucket.put(key.man, mb); puts++;
      manifest.manifestBytes = bytesOf(mb);
      return { manifest, puts, room_rows_read: roomRead };
    });
    man = t.value.manifest;
    out.copy = { ms: t.ms, ms_fine: t.ms_fine, r2_puts: t.value.puts, units: man.units.length, captures: man.captures.length, bundles: man.bundles.length,
                 room_rows_read: t.value.room_rows_read, sample_term: man.sampleTerm };
  } else if (man) out.copy = { reused_manifest: true, units: man.units.length, captures: man.captures.length, bundles: man.bundles.length, sample_term: man.sampleTerm };
  if (phase === "copy") return out;
  const on = (g, side) => phase === "all" || phase === g || phase === `${g}_${side}`;
  if (!man) { out.error = "no proto-b manifest in R2: run phase=copy first"; return out; }

  const unitRefs = man.units.slice(0, k);
  if (on("read", "room") || on("read", "r2")) {
    const room = !on("read", "room") ? { value: null } : await timed(async () => {
      let rowsRead = 0, bytes = 0, got = 0;
      const bySha = new Map();
      for (const id of unitRefs) { const [s, q] = id.split("/"); (bySha.get(s) || bySha.set(s, []).get(s)).push(Number(q)); }
      for (const [s, qs] of bySha) {
        const q = rows(sql, `SELECT text FROM capture_text WHERE capture_sha=? AND seq>=? AND seq<=? ORDER BY seq`, s, Math.min(...qs), Math.max(...qs));
        rowsRead += q.read || 0; got += q.r.length; for (const x of q.r) bytes += bytesOf(x.text);
      }
      return { units: got, bytes, room_rows_read: rowsRead };
    });
    const r2 = !on("read", "r2") ? { value: null } : await timed(async () => {
      let bytes = 0, got = 0;
      await inBatches(unitRefs, async (id) => { const o = await bucket.get(`${P}u/${id}`); if (o) { const t = await o.text(); bytes += bytesOf(t); got++; } });
      return { units: got, bytes };
    });
    out.read = { k: unitRefs.length, ...(room.value ? { room: { ms: room.ms, ms_fine: room.ms_fine, ...room.value } } : {}), ...(r2.value ? { r2: { ms: r2.ms, ms_fine: r2.ms_fine, ...r2.value } } : {}) };
  }
  if (on("search", "room") || on("search", "r2")) {
    const term = tokens(args.term || man.sampleTerm || "")[0];
    if (!term) out.search = { error: "no term: pass term= or copy a manifest with a sample term" };
    else {
      const shas = man.captures.map((c) => c.sha);
      const room = !on("search", "room") ? { value: null } : await timed(async () => {
        let q;
        try {
          q = rows(sql, `SELECT ct.capture_sha, ct.seq FROM capture_text ct
                         WHERE ct.rowid IN (SELECT rowid FROM capture_text_fts WHERE capture_text_fts MATCH ?)
                           AND ct.capture_sha IN (SELECT value FROM json_each(?)) ORDER BY ct.capture_sha, ct.seq`, `"${term}"`, JSON.stringify(shas));
        } catch (e) { return { error: String(e && e.message || e).slice(0, 120) }; }
        let rowsRead = q.read || 0, bytes = 0;
        for (const h of q.r.slice(0, hits)) { const t = rows(sql, `SELECT text FROM capture_text WHERE capture_sha=? AND seq=?`, h.capture_sha, h.seq); rowsRead += t.read || 0; for (const x of t.r) bytes += bytesOf(x.text); }
        return { matches: q.r.length, text_fetched: Math.min(hits, q.r.length), bytes, room_rows_read: rowsRead };
      });
      const r2 = !on("search", "r2") ? { value: null } : await timed(async () => {
        const lists = await Promise.all(man.bundles.map(async (b) => { const o = await bucket.get(key.idx(b)); if (!o) return []; const m = JSON.parse(await o.text()); return m[term] || []; }));
        const ids = lists.flat();
        let bytes = 0;
        await inBatches(ids.slice(0, hits), async (id) => { const o = await bucket.get(`${P}u/${id}`); if (o) bytes += bytesOf(await o.text()); });
        return { matches: ids.length, index_gets: man.bundles.length, text_fetched: Math.min(hits, ids.length), unit_gets: Math.min(hits, ids.length), bytes };
      });
      out.search = { term, over_captures: shas.length, ...(room.value ? { room_fts: { ms: room.ms, ms_fine: room.ms_fine, ...room.value } } : {}), ...(r2.value ? { r2_index: { ms: r2.ms, ms_fine: r2.ms_fine, ...r2.value } } : {}) };
    }
  }
  if (phase === "bytes" || phase === "all") {
    const shas = JSON.stringify(man.captures.map((c) => c.sha));
    const t = rows(sql, `SELECT count(*) c, COALESCE(sum(length(CAST(text AS BLOB))), 0) b FROM capture_text WHERE capture_sha IN (SELECT value FROM json_each(?))`, shas).r[0];
    let dbstat = null;
    try { dbstat = Object.fromEntries(rows(sql, `SELECT name, sum(pgsize) b FROM dbstat WHERE name LIKE 'capture_text%' GROUP BY name`).r.map((x) => [x.name, x.b])); } catch { dbstat = null; }
    const r2b = (man.unitBytes || 0) + Object.values(man.idxBytes || {}).reduce((a, b) => a + b, 0) + (man.manifestBytes || 0);
    out.bytes = { room: { rows_for_these_captures: t.c, text_bytes_for_these_captures: t.b,
                          whole_table_dbstat_bytes: dbstat, note: "dbstat is per table for the whole room, not per capture; null if the room's SQLite lacks it. The FTS index adds to the room's side, not counted in text_bytes." },
                  r2: { unit_bytes: man.unitBytes, index_bytes: Object.values(man.idxBytes || {}).reduce((a, b) => a + b, 0), total_bytes: r2b,
                        objects: man.units.length + man.bundles.length + 1 } };
  }
  return out;
}

/** The door's arm of `op=protobprobe` (admin only, behind PROTO_B=1): asks the room's `/protobprobe` route and states the room's
 *  I/O time as `in-protobprobe` in `Server-Timing`, as the control plane states `in-<route>` for the routes it forwards. Null when the flag is unset. */
export async function protobProbeOp(url, env, stub, { cls, json, administer = false }) {
  if (!env || env.PROTO_B !== "1") return null;
  if (cls !== "admin" && !administer) return json({ ok: false, reason: "PROTO_B_ADMIN_ONLY" }, 403);
  if (!env.CAPTURES) return json({ ok: false, reason: "PROTO_B_NO_CAPTURES_BINDING" }, 503);
  const q = new URLSearchParams();
  for (const k of ["n", "k", "term", "hits", "phase", "copy", "maxunits"]) if (url.searchParams.has(k)) q.set(k, url.searchParams.get(k));
  const t0 = Date.now();
  const r = await stub.fetch(`http://x/protobprobe?${q}`);
  const total = Date.now() - t0;
  const body = await r.json();
  const m = /object;dur=(\d+)/.exec(r.headers.get("server-timing") || "");
  const res = json({ ...body, timing: { room_in_ms: m ? Number(m[1]) : null, hop_and_room_ms: total } }, r.status);
  try { res.headers.set("server-timing", `in-protobprobe;dur=${m ? m[1] : 0}`); } catch { /* immutable headers: the body carries it */ }
  return res;
}
