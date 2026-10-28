/* PROTO-PACKED (throwaway; never merged): the PACKED layout of prototype B, measured. Behind env PROTO_PACKED=1; with the flag unset nothing
   here runs and no behaviour differs. COPIES units of up to N captures from `capture_text` into the CAPTURES bucket under
   `proto-packed/<store>/` ONLY, never changes or deletes a room row.
   Layout: one units object per BUNDLE (`u/<bundle>`: newline-delimited JSON, one unit a line, captures in sha order, units in seq order);
   one compact index object per bundle (`idx/<bundle>`: term -> delta-coded unit POSITIONS in that bundle's units object, integers);
   one manifest (`manifest`) with, per bundle, the offsets table (parallel arrays q = unit seq, o = byte offset, l = byte length, and the
   captures' start positions). Reading k contiguous units = one range get; a window from anywhere = one range get per run of adjacent units.
   NOTE ON TIME: workerd freezes Date.now() in synchronous work; scripts/protopacked-probe.mjs times each phase from OUTSIDE. */
export const PROTO_PACKED_PREFIX = "proto-packed/";
const PUT_PARALLEL = 8;
const num = (v, d, lo, hi) => { const n = Number(v); return Number.isFinite(n) ? Math.min(hi, Math.max(lo, Math.floor(n))) : d; };
export const tokens = (text) => [...new Set(String(text).toLowerCase().match(/[\p{L}\p{N}]{2,}/gu) || [])];
const enc = new TextEncoder();
const bytesOf = (s) => enc.encode(s).length;
const bkey = (b) => encodeURIComponent(String(b ?? "")) || "_";
const NUM_BYTES = 8;   /* what one array number is counted as in the memory proxy */

/** The memory proxy: the bytes of strings and arrays the probe holds at once (lengths summed as built; numbers count 8). */
export const heldMeter = () => { let cur = 0, peak = 0; return { add(n) { cur += n; if (cur > peak) peak = cur; }, sub(n) { cur -= n; }, get cur() { return cur; }, get peak() { return peak; } }; };
export const processMem = () => (typeof process !== "undefined" && process && typeof process.memoryUsage === "function") ? (() => { try { const m = process.memoryUsage(); return { rss: m.rss, heapUsed: m.heapUsed }; } catch { return null; } })() : null;

/* ---- pure helpers (tested) ---- */
/** Pack rows [{k,e,ref,seq,text}] into NDJSON; returns the body, and per unit its byte offset and length (the newline is in the length). */
export function packLines(rows, base = 0) {
  const lines = [], o = [], l = [], q = [];
  let off = base;
  for (const r of rows) {
    const line = JSON.stringify({ k: r.k, e: r.e, ref: r.ref, seq: r.seq, text: r.text }) + "\n";
    const n = bytesOf(line);
    lines.push(line); q.push(r.seq); o.push(off); l.push(n); off += n;
  }
  return { lines, q, o, l, end: off };
}
export const deltaEncode = (xs) => { const out = []; let p = 0; for (const x of xs) { out.push(x - p); p = x; } return out; };
export const deltaDecode = (ds) => { const out = []; let p = 0; for (const d of ds) { p += d; out.push(p); } return out; };
/** Group ascending positions into runs of adjacent ones: [[from, toExclusive], ...]. */
export function runsOf(positions) {
  const runs = [];
  for (const p of positions) { const last = runs[runs.length - 1]; if (last && last[1] === p) last[1] = p + 1; else runs.push([p, p + 1]); }
  return runs;
}
/** The byte range of units [from, to) of a bundle entry of the manifest. */
export const rangeOf = (b, from, to) => ({ offset: b.o[from], length: b.o[to - 1] + b.l[to - 1] - b.o[from] });
/** The first k units of the copy in its order (bundle by bundle, position by position) as runs: [{bi, from, to}]. */
export function firstKRuns(man, k) {
  const out = []; let left = k;
  man.bundles.forEach((b, bi) => { if (left > 0 && b.o.length) { const n = Math.min(left, b.o.length); out.push({ bi, from: 0, to: n }); left -= n; } });
  return out;
}
/** Build a compact index from texts in position order: Map term -> positions (ascending). */
export function indexAdd(texts, idx, base = 0) {
  let added = 0;
  texts.forEach((t, i) => { for (const w of tokens(t)) { (idx.get(w) || idx.set(w, []).get(w)).push(base + i); added++; } });
  return added;
}
export const buildIndex = (texts, idx = new Map(), base = 0) => { indexAdd(texts, idx, base); return idx; };
export const indexBody = (idx) => JSON.stringify(Object.fromEntries([...idx].map(([w, ps]) => [w, deltaEncode(ps)])));
/** Which captures (sha, seq range) a run of a bundle covers, for the room side of the comparison. */
export function capsOfRun(b, from, to) {
  const out = [];
  b.caps.forEach((c, i) => { const a = Math.max(from, c.from), z = Math.min(to, c.from + c.n); if (a < z) out.push({ sha: c.sha, seqLo: b.q[a], seqHi: b.q[z - 1], n: z - a }); });
  return out;
}

async function inBatches(list, fn, size = PUT_PARALLEL) {
  const out = [];
  for (let i = 0; i < list.length; i += size) out.push(...await Promise.all(list.slice(i, i + size).map(fn)));
  return out;
}
async function timed(fn) {
  const t0 = Date.now(), p0 = typeof performance !== "undefined" ? performance.now() : 0;
  const value = await fn();
  return { value, ms: Date.now() - t0, ms_fine: typeof performance !== "undefined" ? Math.round((performance.now() - p0) * 100) / 100 : 0 };
}
const rows = (sql, q, ...a) => { const c = sql.exec(q, ...a); const r = c.toArray(); return { r, read: c.rowsRead ?? null }; };
const safeCount = (sql, t) => { try { return rows(sql, `SELECT count(*) c FROM ${t}`).r[0].c; } catch { return null; } };

/** `sql`: the room's storage.sql; `bucket`: env.CAPTURES; `store`: the room's name; `args`: the query parameters as an object. */
export async function protoPackedProbe({ sql, bucket, store, args = {} }) {
  const P = `${PROTO_PACKED_PREFIX}${store}/`, key = { man: `${P}manifest`, idx: (b) => `${P}idx/${bkey(b)}`, unit: (b) => `${P}u/${bkey(b)}` };
  const n = num(args.n, 50, 1, 500), k = num(args.k, 100, 1, 20000), hits = num(args.hits, 20, 1, 200), maxUnits = num(args.maxunits, 400, 1, 20000);
  const phase = ["noop", "copy", "read", "read_room", "read_r2", "search", "search_room", "search_r2", "bytes", "all"].includes(args.phase) ? args.phase : "all";
  const out = { phase, n, k, hits, timing_note: "Date.now is frozen in synchronous work; see scripts/protopacked-probe.mjs for outside timings" };
  if (phase === "noop") return out;
  const readManifest = async () => { const o = await bucket.get(key.man); return o ? JSON.parse(await o.text()) : null; };
  const doCopy = phase === "copy" || phase === "all";
  let man = doCopy && args.copy === "1" ? null : await readManifest();

  if (!man && doCopy) {
    const pm0 = processMem(), held = heldMeter();
    const t = await timed(async () => {
      const caps = rows(sql, `SELECT capture_sha, bundle_id, count(*) c FROM capture_text GROUP BY capture_sha ORDER BY bundle_id, capture_sha LIMIT ?`, n).r;
      const bundles = [], w = { puts: 0, units_b: 0, idx_b: 0, roomRead: 0, textBytes: 0 };
      let left = maxUnits, sample = null, cur = null;
      held.add(caps.length * 64);
      const flush = async () => {
        if (!cur) return;
        let tc = 0; for (const t2 of cur.index.keys()) tc += t2.length; held.add(tc); cur.heldNow += tc;   /* the index's terms */
        const body = cur.lines.join(""); held.add(body.length);
        const ib = indexBody(cur.index); held.add(ib.length);
        const b = cur.entry; b.bytes = cur.end; b.idxBytes = bytesOf(ib);
        await bucket.put(b.obj, body); await bucket.put(b.idx, ib); w.puts += 2; w.units_b += b.bytes; w.idx_b += b.idxBytes;
        if (!sample && !bundles.length) { let best = 0; for (const [t2, ps] of cur.index) if (t2.length >= 5 && ps.length > best && ps.length < cur.lines.length) { best = ps.length; sample = t2; } }
        bundles.push(b);
        held.add(NUM_BYTES * 3 * b.o.length);   /* the manifest's table stays */
        held.sub(body.length + ib.length + cur.heldNow); cur = null;
      };
      for (const c of caps) {
        if (left <= 0) break;
        if (!cur || cur.id !== c.bundle_id) {
          await flush();
          cur = { id: c.bundle_id, lines: [], index: new Map(), end: 0, heldNow: 0, entry: { id: String(c.bundle_id ?? ""), obj: key.unit(c.bundle_id), idx: key.idx(c.bundle_id), caps: [], q: [], o: [], l: [] } };
        }
        const q = rows(sql, `SELECT extent_kind, extent, ref, seq, text FROM capture_text WHERE capture_sha=? ORDER BY seq LIMIT ?`, c.capture_sha, left);
        w.roomRead += q.read || 0; left -= q.r.length;
        const rowChars = q.r.reduce((a, r) => a + String(r.text).length, 0); held.add(rowChars);
        const from = cur.entry.o.length;
        const pk = packLines(q.r.map((r) => ({ k: r.extent_kind, e: r.extent, ref: r.ref, seq: r.seq, text: r.text })), cur.end);
        const lineChars = pk.lines.reduce((a, s) => a + s.length, 0); held.add(lineChars);
        cur.lines.push(...pk.lines); cur.end = pk.end;
        cur.entry.q.push(...pk.q); cur.entry.o.push(...pk.o); cur.entry.l.push(...pk.l);
        cur.entry.caps.push({ sha: c.capture_sha, n: q.r.length, from });
        w.textBytes += q.r.reduce((a, r) => a + bytesOf(String(r.text)), 0);
        const added = indexAdd(q.r.map((r) => r.text), cur.index, from);
        cur.heldNow += lineChars + added * NUM_BYTES; held.add(added * NUM_BYTES);
        held.sub(rowChars);   /* the SQL rows go once their lines and tokens are made */
      }
      await flush();
      const units = bundles.reduce((a, b) => a + b.o.length, 0);
      const manifest = { v: 1, at: new Date().toISOString(), store, bundles, units, textBytes: w.textBytes, sampleTerm: sample,
                         copiedShas: bundles.flatMap((b) => b.caps.map((c) => c.sha)) };
      const mb = JSON.stringify(manifest); held.add(mb.length);
      await bucket.put(key.man, mb); w.puts++;
      manifest.manifestBytes = bytesOf(mb);
      return { manifest, w, manifestBytes: manifest.manifestBytes };
    });
    man = t.value.manifest; const w = t.value.w;
    man.unitsObjectBytes = w.units_b; man.indexObjectBytes = w.idx_b;
    out.copy = { ms: t.ms, ms_fine: t.ms_fine, objects_written: w.puts, bytes_written: { units_objects: w.units_b, index_objects: w.idx_b, manifest: t.value.manifestBytes, total: w.units_b + w.idx_b + t.value.manifestBytes },
                 units: man.units, captures: man.copiedShas.length, bundles: man.bundles.length, room_rows_read: w.roomRead, sample_term: man.sampleTerm,
                 js_held_peak_bytes: held.peak, js_held_note: "sum of lengths of the big strings and arrays held at once (numbers counted as 8); not a heap measure",
                 process_memory: { before: pm0, after: processMem() } };
  } else if (man) out.copy = { reused_manifest: true, units: man.units, captures: man.copiedShas.length, bundles: man.bundles.length, sample_term: man.sampleTerm };
  if (phase === "copy") return out;
  const on = (g, side) => phase === "all" || phase === g || phase === `${g}_${side}`;
  if (!man) { out.error = "no proto-packed manifest in R2: run phase=copy first"; return out; }

  if (on("read", "room") || on("read", "r2")) {
    const runs = firstKRuns(man, k), got = runs.reduce((a, r) => a + r.to - r.from, 0);
    const room = !on("read", "room") ? { value: null } : await timed(async () => {
      let rowsRead = 0, bytes = 0, units = 0; const held = heldMeter(); const pm0 = processMem();
      for (const r of runs) for (const c of capsOfRun(man.bundles[r.bi], r.from, r.to)) {
        const q = rows(sql, `SELECT text FROM capture_text WHERE capture_sha=? AND seq>=? AND seq<=? ORDER BY seq`, c.sha, c.seqLo, c.seqHi);
        rowsRead += q.read || 0; units += q.r.length; let ch = 0; for (const x of q.r) { bytes += bytesOf(x.text); ch += String(x.text).length; }
        held.add(ch); held.sub(ch);
      }
      return { units, bytes, room_rows_read: rowsRead, js_held_peak_bytes: held.peak, process_memory: { before: pm0, after: processMem() } };
    });
    const r2 = !on("read", "r2") ? { value: null } : await timed(async () => {
      let bytes = 0, units = 0, gets = 0; const held = heldMeter(); const pm0 = processMem();
      const jobs = []; for (const r of runs) jobs.push(r);
      await inBatches(jobs, async (r) => {
        const b = man.bundles[r.bi], rg = rangeOf(b, r.from, r.to);
        const o = await bucket.get(b.obj, { range: rg }); gets++;
        if (!o) return; const t = await o.text(); held.add(t.length);
        bytes += rg.length; units += t.split("\n").filter(Boolean).map((s) => JSON.parse(s)).length;
      });
      return { units, bytes_fetched: bytes, r2_gets: gets, room_rows_read: 0, js_held_peak_bytes: held.peak, process_memory: { before: pm0, after: processMem() } };
    });
    out.read = { k: got, ...(room.value ? { room: { ms: room.ms, ms_fine: room.ms_fine, ...room.value } } : {}), ...(r2.value ? { r2: { ms: r2.ms, ms_fine: r2.ms_fine, ...r2.value } } : {}) };
  }
  if (on("search", "room") || on("search", "r2")) {
    const term = tokens(args.term || man.sampleTerm || "")[0];
    if (!term) out.search = { error: "no term: pass term= or copy a manifest with a sample term" };
    else {
      const shas = man.copiedShas;
      const room = !on("search", "room") ? { value: null } : await timed(async () => {
        let q; const pm0 = processMem();
        try {
          q = rows(sql, `SELECT ct.capture_sha, ct.seq FROM capture_text ct
                         WHERE ct.rowid IN (SELECT rowid FROM capture_text_fts WHERE capture_text_fts MATCH ?)
                           AND ct.capture_sha IN (SELECT value FROM json_each(?)) ORDER BY ct.capture_sha, ct.seq`, `"${term}"`, JSON.stringify(shas));
        } catch (e) { return { error: String(e && e.message || e).slice(0, 120) }; }
        let rowsRead = q.read || 0, bytes = 0, ch = 0;
        for (const h of q.r.slice(0, hits)) { const t = rows(sql, `SELECT text FROM capture_text WHERE capture_sha=? AND seq=?`, h.capture_sha, h.seq); rowsRead += t.read || 0; for (const x of t.r) { bytes += bytesOf(x.text); ch += String(x.text).length; } }
        return { matches: q.r.length, text_fetched: Math.min(hits, q.r.length), bytes, room_rows_read: rowsRead, js_held_peak_bytes: q.r.length * 2 * NUM_BYTES + ch, process_memory: { before: pm0, after: processMem() } };
      });
      const r2 = !on("search", "r2") ? { value: null } : await timed(async () => {
        const held = heldMeter(), pm0 = processMem(); let gets = 0, idxBytes = 0, fetched = 0;
        const lists = await Promise.all(man.bundles.map(async (b) => {
          const o = await bucket.get(b.idx); gets++; if (!o) return [];
          const t = await o.text(); idxBytes += bytesOf(t); held.add(t.length);
          const m = JSON.parse(t); let pc = 0; for (const [w, ps] of Object.entries(m)) pc += w.length + ps.length * NUM_BYTES; held.add(pc);
          const ps = m[term] ? deltaDecode(m[term]) : []; held.add(ps.length * NUM_BYTES);
          return ps;
        }));
        const matches = lists.reduce((a, l) => a + l.length, 0);
        let left = hits, textUnits = 0, runsN = 0;
        const jobs = [];
        lists.forEach((ps, bi) => { if (left <= 0) return; const take = ps.slice(0, left); left -= take.length; for (const [from, to] of runsOf(take)) jobs.push({ bi, from, to }); });
        await inBatches(jobs, async (r) => {
          const b = man.bundles[r.bi], rg = rangeOf(b, r.from, r.to);
          const o = await bucket.get(b.obj, { range: rg }); gets++; runsN++;
          if (!o) return; const t = await o.text(); held.add(t.length); fetched += rg.length; textUnits += t.split("\n").filter(Boolean).length;
        });
        return { matches, index_gets: man.bundles.length, index_bytes_fetched: idxBytes, text_fetched: textUnits, unit_range_gets: runsN, r2_gets: gets, bytes_fetched: idxBytes + fetched, unit_bytes_fetched: fetched,
                 js_held_peak_bytes: held.peak, process_memory: { before: pm0, after: processMem() } };
      });
      out.search = { term, over_captures: shas.length, ...(room.value ? { room_fts: { ms: room.ms, ms_fine: room.ms_fine, ...room.value } } : {}), ...(r2.value ? { r2_packed: { ms: r2.ms, ms_fine: r2.ms_fine, ...r2.value } } : {}) };
    }
  }
  if (phase === "bytes" || phase === "all") {
    const shas = JSON.stringify(man.copiedShas);
    const t = rows(sql, `SELECT count(*) c, COALESCE(sum(length(CAST(text AS BLOB))), 0) b FROM capture_text WHERE capture_sha IN (SELECT value FROM json_each(?))`, shas).r[0];
    const total = safeCount(sql, "capture_text");
    const shadow = {}, ests = {};
    for (const s of ["capture_text_fts", "capture_text_fts_docsize", "capture_text_fts_data", "capture_text_fts_idx"]) {
      shadow[s] = safeCount(sql, s);
      ests[s] = shadow[s] != null && total ? Math.round(shadow[s] / total * t.c) : null;
    }
    const estTotal = Object.values(ests).every((x) => x != null) ? Object.values(ests).reduce((a, b) => a + b, 0) : null;
    out.bytes = {
      room_rows_this_layout_would_save: { capture_text_rows_exact: t.c, text_bytes_exact: t.b,
        fts_shadow_rows_ESTIMATE: ests, fts_shadow_rows_estimate_total: estTotal,
        basis: { capture_text_total_rows: total, table_total_rows: shadow, rule: "table total rows / capture_text total rows * copied units; fts tables are external-content, their rows are not per capture" } },
      r2: { units_objects: man.unitsObjectBytes ?? man.bundles.reduce((a, b) => a + b.bytes, 0), index_objects: man.indexObjectBytes ?? man.bundles.reduce((a, b) => a + b.idxBytes, 0), manifest: man.manifestBytes,
            objects: man.bundles.length * 2 + 1, total_bytes: (man.unitsObjectBytes ?? man.bundles.reduce((a, b) => a + b.bytes, 0)) + (man.indexObjectBytes ?? man.bundles.reduce((a, b) => a + b.idxBytes, 0)) + (man.manifestBytes || 0),
            ratio_to_text: t.b ? Math.round(((man.unitsObjectBytes ?? 0) + (man.indexObjectBytes ?? 0) + (man.manifestBytes || 0)) / t.b * 100) / 100 : null } };
  }
  return out;
}

/** The door's arm of `op=protopackedprobe` (admin only, behind PROTO_PACKED=1), as protobProbeOp. Null when the flag is unset. */
export async function protoPackedProbeOp(url, env, stub, { cls, json, administer = false }) {
  if (!env || env.PROTO_PACKED !== "1") return null;
  if (cls !== "admin" && !administer) return json({ ok: false, reason: "PROTO_PACKED_ADMIN_ONLY" }, 403);
  if (!env.CAPTURES) return json({ ok: false, reason: "PROTO_PACKED_NO_CAPTURES_BINDING" }, 503);
  const q = new URLSearchParams();
  for (const k of ["n", "k", "term", "hits", "phase", "copy", "maxunits"]) if (url.searchParams.has(k)) q.set(k, url.searchParams.get(k));
  const t0 = Date.now();
  const r = await stub.fetch(`http://x/protopackedprobe?${q}`);
  const total = Date.now() - t0;
  const body = await r.json();
  const m = /object;dur=(\d+)/.exec(r.headers.get("server-timing") || "");
  const res = json({ ...body, timing: { room_in_ms: m ? Number(m[1]) : null, hop_and_room_ms: total } }, r.status);
  try { res.headers.set("server-timing", `in-protopackedprobe;dur=${m ? m[1] : 0}`); } catch { /* immutable headers */ }
  return res;
}
