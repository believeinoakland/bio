/* control-plane (fix round 9; K4837, K4842; R-SEAM, R-ONE, R-CLOCK, R-NOLOAD): SEAM SECTIONS 14 AND 15 of `t51-round9-seam.test.mjs`, THROUGH THE REAL PLANE (the Worker, object, alarm and R2 under
   Miniflare, a member's own acts; `makeKit` of `r8-kit.mjs`). The lead's one seam file calls `sections(kit, counting)`.

   14  a ceiling's sentence, the upload peak, the archive limits, and THE ALL-MODULES GREP (G124a, G124b, G124g, G124; R132, R125, R131, R130, R72)
         a  a PDF one byte over `boundOf("pdf","bytes")` uploaded is stated at once with its size, the limit and the key of the alpha sentence, owing nothing (no job row); one at
            the ceiling is not stated, its `reading` row is held and the alarm reads it (PDF A3 / A2);
         b  a 24 MiB text upload through the real door lands (the capture whole, a job row, no inline read) and, handed the door's own byte ledger, peaks at the file and at most two
            parts beyond it and is back to nothing held (the ledger's wiring is `owner-ops.mjs`, R72);
         g  the archive limits: a file declared one byte over the uploaded bound is refused by name with its size, the limit and the key, the bound itself accepted; an archive whose
            directory declares one byte over the unpacked bound is refused by name with its size and limit, the bound itself accepted (the lazy ZIP writer: nothing is materialised);
         G124 THE ALL-MODULES GREP (K3268: no hand-listing of another module's constants): every module's own source, from `build/modules.json`, is read for the ceiling constants it
            declares as numbers; each that does not resolve to `READ_BOUNDS` through `boundOf`/`statement` is reported with its module, file:line and name; the set outside ACCEPTED
            (constants that are no reading ceiling, each with its reason) must be empty.
   15  the press, transcribe and the no-cursor door (G126e, G126h; R131, R125, R130, R123)
         the OCR press `pdfstructure&ocr=1` and `pagetranscribe` on a PDF over 2 MiB and on a scan: the object is not loaded in the request (the counting door's count of R2 gets of
            the whole object: 0) and no OCR call is made inside it; `owedwork` lists what is left;
         the no-cursor door read of a 2 MB sheet/CSV: no inline read, the row exists, the last row is found by `op=search` after the ticks.
   Counts, values and fields at the door; never a wall time, never a sentence a member reads (R-CLOCK, R-WORDS). Where a provider has not merged, the test keeps its real assertion and its
   title says "(red until <module> <job> merges)". */
import "../../sandbox.mjs";
import { test, after } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { join, dirname } from "node:path";
import { READ_BOUNDS, boundOf, statement } from "../../../src/read-bounds.mjs";
import { byteLedger, capFor } from "../../../src/byte-ledger.mjs";
import { zipChunks64, ZIP64_OVERHEAD } from "../../make-zip.mjs";
import { collect, generate } from "../../corpus.mjs";
import { makeKit } from "./r8-kit.mjs";
import { wrapScript, readCalls, doCalls } from "./wrap-entry.mjs";

const MiB = 1048576;
const ROOT = join(dirname(fileURLToPath(import.meta.url)), "../../../..");
const sha256 = (b) => createHash("sha256").update(b).digest("hex");
const te = (t) => new TextEncoder().encode(t);

/* ============================================================================================================================================================
   G124 · THE ALL-MODULES GREP
   ============================================================================================================================================================ */

/* A ceiling constant, as the grep sees one: a top-level `const NAME = <numbers>` whose name says it is a limit (a `_MAX`, `_MIN`, `_BOUND`, `_LIMIT`, `_CEILING`, `_CAP`, `_BYTES`,
   `_SIZE` or `_BUDGET` suffix, or a `MAX_`/`MIN_`/`LIMIT_` prefix) and whose value is written as a number or an arithmetic of numbers and the unit names (KiB, MiB, GiB, KB, MB, GB), at
   64 KiB or more: the byte/MiB scale of the table's rows. A constant read through `boundOf`/`statement`, or derived from another constant, is not a number and is not seen. */
export const CEILING_MIN = 65536;
const NAME = /(?:_MAX|_MIN|_BOUND|_BOUNDS|_LIMIT|_CEILING|_CAP|_BYTES|_SIZE|_BUDGET)$|^(?:MAX|MIN|LIMIT)_/;
const UNITS = Object.freeze({ KiB: 1024, MiB: 1048576, GiB: 1073741824, KB: 1024, MB: 1048576, GB: 1073741824 });
function arithmetic(src) {
  const toks = src.match(/[A-Za-z_][A-Za-z0-9_]*|\d[\d_]*|\*\*|<<|>>|[-+*/()]/g);
  if (!toks || toks.join("") !== src.replace(/\s+/g, "")) return null;
  let expr = "";
  for (const t of toks) {
    if (/^[A-Za-z_]/.test(t)) { if (!Object.hasOwn(UNITS, t)) return null; expr += UNITS[t]; } else expr += t.replace(/_/g, "");
  }
  try { const v = Function(`"use strict";return (${expr})`)(); return typeof v === "number" && Number.isFinite(v) ? v : null; } catch { return null; }
}
export function ceilingConstantsIn(text, { min = CEILING_MIN } = {}) {
  const out = [];
  String(text).split("\n").forEach((line, i) => {
    const m = /^(?:export\s+)?const\s+([A-Z][A-Z0-9_]*)\s*=\s*(.*?)\s*;?\s*(?:\/\/.*|\/\*.*)?$/.exec(line);
    if (!m || !NAME.test(m[1])) return;
    const rhs = m[2].replace(/;\s*$/, "");
    const value = arithmetic(rhs);
    if (value !== null && value >= min) out.push({ name: m[1], line: i + 1, rhs, value });
  });
  return out;
}

/* Every module's own source: `build/modules.json`'s `paths` (a directory, or a file), the tracked files under them that are code (`.mjs`, `.js`, `.cjs`), not a test, not a built
   bundle. `git ls-files` names them; a tree with no git is walked. */
function trackedFiles() {
  try { return execFileSync("git", ["ls-files", "-z"], { cwd: ROOT, maxBuffer: 1 << 28 }).toString().split("\0").filter(Boolean); } catch {
    const out = [];
    const walk = (dir) => { for (const e of readdirSync(join(ROOT, dir), { withFileTypes: true })) {
      if (e.name === "node_modules" || e.name === ".git") continue;
      const p = dir ? `${dir}/${e.name}` : e.name;
      if (e.isDirectory()) walk(p); else out.push(p);
    } };
    walk("");
    return out;
  }
}
export function moduleSources() {
  const modules = JSON.parse(readFileSync(join(ROOT, "build/modules.json"), "utf8")).modules;
  const files = trackedFiles().filter((f) => /\.(?:mjs|js|cjs)$/.test(f) && !/(?:^|\/)(?:test|dist|node_modules)\//.test(f));
  const owner = new Map();
  for (const m of modules) for (const f of files) {
    if (!owner.has(f) && (m.paths || []).some((p) => (p.endsWith("/") ? f.startsWith(p) : f === p))) owner.set(f, m.id);
  }
  return { modules, sources: [...owner].map(([file, module]) => ({ module, file })) };
}
export function ceilingConstantsOfModules() {
  const { modules, sources } = moduleSources();
  const found = [];
  for (const { module, file } of sources) {
    const path = join(ROOT, file);
    try { if (statSync(path).size > 8 * MiB) continue; } catch { continue; }
    for (const c of ceilingConstantsIn(readFileSync(path, "utf8"))) found.push({ module, file, ...c });
  }
  return { found, scanned: sources.length, modules: new Set(sources.map((s) => s.module)), declared: modules.length };
}
/* the digits of a bound a refusal states, whichever field a module names it by */
const sizeOf = (r) => r.size ?? r.declared ?? r.declared_total ?? r.bytes;
const limitOf = (r) => r.bound ?? r.limit ?? r.maxBytes;

/* THE ACCEPTED NAMES: a constant the grep finds that is no reading ceiling. Keyed `<file>::<NAME>` so a same-named constant elsewhere is not accepted by this one; each holds its one-line
   reason. A constant is accepted only when it bounds something other than the size a file may be for a reading to be made, stated or owed. None is accepted to make the grep green: a
   reading ceiling with no `READ_BOUNDS` row is reported (to BOB, who carries it to runtime-limits: K4842 (1)), and the grep stays red until its module quotes the table. */
export const ACCEPTED = Object.freeze({
  "sheet-worker/src/enginelib.mjs::MAX_SAFARI_DECODE_BYTES": "wasm-bindgen's generated TextDecoder guard for Safari, a platform quirk of the engine glue, no file bound",
  "sheet-worker/src/contract.mjs::WASM_BYTES": "the byte length of the vendored engine asset, an integrity pin, not a limit",
  "ocr-worker/src/tessengine.mjs::WASM_BYTES": "the byte length of the vendored engine asset, an integrity pin, not a limit",
  "ocr-worker/src/tessengine.mjs::MODEL_BYTES": "the byte length of the vendored language model, an integrity pin, not a limit",
  "ocr-worker/scripts/embed-tesslib.mjs::VENDOR_BYTES": "a build script's expected size of a vendored library, an integrity pin",
  "agent-model/src/model.mjs::DEFAULT_MAX_SEGMENT_BYTES": "how much agent transcript one re-serialising segment holds (a CPU pacing figure), no file's reading",
  "agent-runner/src/ws.mjs::MAX_MESSAGE": "the largest websocket frame the agent runner accepts, a transport bound",
  "agent-worker/src/ops.mjs::TRANSCRIBE_IMAGE_MAX_BYTES": "the AI provider's per-image request limit (5 MB), a provider fact about what is sent, not a reading ceiling",
  "bio-plane/src/plane/transcribe.mjs::TRANSCRIBE_IMAGE_MAX_BYTES": "the same provider per-image limit, held equal to agent-worker's by its test",
  "agent-worker/src/transcribe.mjs::PAGE_MAX": "the characters of one page of the AI's answer a transcription accepts, an answer bound",
  "agent-worker/src/action-drafts.mjs::RECORD_MAX": "the characters of JSON of a matter's record handed to a drafting task, a task input bound",
  "bio-plane/src/acquisition/unpack.mjs::UNPACK_CALL_BYTES": "one unpack call's share of declared bytes (work pacing: the next call resumes), never a refusal of a file",
  "bio-plane/src/acquisition/unpack.mjs::UNPACK_DAILY_BYTES": "the day's budget for AUTOMATIC unpacking (a quota of work; a member's own request is not counted)",
  "bio-plane/src/acquisition/keyed.mjs::KEYED_ANSWER_MAX": "the most of a keyed citation service's answer read, a service answer and no member's file",
  "bio-plane/src/acquisition/index.mjs::RENDER_ANSWER_MAX": "the JSON of a render's answer written back to the capture session, a stored-value bound",
  "bio-plane/src/subresources.mjs::SUBRESOURCE_MAX": "bytes fetched for one page asset of a captured page, a fetch budget of the capture and no reading",
  "bio-plane/src/subresources.mjs::SUBRESOURCE_BUDGET": "bytes fetched across a captured page's assets, a fetch budget of the capture and no reading",
  "bio-plane/src/capture/index.mjs::PARTED_PART_BYTES": "the CHOSEN size of each part of a file sent in parts (R2's part is at least 5 MiB), a size and not a limit on any file",
  "bio-plane/src/pdfstructure.mjs::INNER_CACHE_BYTES": "bytes of decoded object streams the PDF opener keeps for reuse, a cache size",
  "bio-plane/src/pdfstructure.mjs::INNER_CHECK_BYTES": "the compressed size from which an inflate is pre-checked, a policy threshold of the opener",
  "bio-plane/src/pdfstructure.mjs::LARGE_RAW_BYTES": "the compressed size from which a Flate stream is decoded by `inflateChecked` first, a policy threshold",
  "bio-plane/src/pdfstructure.mjs::SLICE_BYTES": "bytes scanned in one step of an opening before the thread is given back, work pacing",
  "bio-plane/src/ratification/casefile.mjs::CASEFILE_SWEEP_BYTES": "bytes one sweep of a case's published files reads, a sweep budget over published output",
  "bio-plane/src/public-read/casefile.mjs::CASEFILE_BLIND_PUT_MAX": "the size below which a published object is written without asking after it first, a write strategy",
  "bio-plane/src/container.mjs::CONTAINER_MAX_BYTES": "the size of a published case's container, an output bound on what is published and no reading of a member's file",
  "bio-plane/src/case-import/index.mjs::PART_MAX": "public-read's bound of one part of a case container (R5), the published form and no member's file",
  "bio-plane/src/publication/index.mjs::CASE_DOCUMENT_BYTES_MAX": "the UTF-8 bytes of an authored case document, a bound on what a member writes",
  "bio-plane/src/promotion/index.mjs::INLINE_MAX": "the inline bound of a file held as text in a bundle (1 MiB), a storage bound of the record's bundles",
  "bio-plane/src/extraction/index.mjs::READING_PAGE_BYTES": "what one answer of `op=reading` carries (about 1 MiB of unit text), an answer's size",
  "bio-plane/src/extraction/index.mjs::READING_ROW_MAX_BYTES": "the most a stored reading row may weigh (half the platform's single-value limit), a stored-value bound",
  "bio-plane/src/extraction/index.mjs::PRIOR_READING_COPY_MAX_BYTES": "the stored-value limit up to which a prior reading is copied into the history, a stored-value bound",
  "bio-plane/src/extraction/index.mjs::READING_KEY_BYTES": "the size over which a key of a stored reading is named and not carried in an answer, an answer's size",
  "bio-plane/src/reading-pipeline/index.mjs::INLINE_CELLS_MAX_BYTES": "the JSON of a sheet's cells kept inline in a reading row (else held in the file), a stored-value bound",
  "bio-plane/src/reading-pipeline/index.mjs::ACQUIRE_TEXT_UNITS_BUDGET": "how much unit text the acquire answer carries (half the promotion's inline bound), an answer's size",
  "bio-plane/src/reading-pipeline/index.mjs::CAPTURE_TEXT_UNIT_CAP": "the characters of one indexed unit (a unit's size, chunked beyond it), not a bound on a file",
  "bio-plane/src/reading-pipeline/index.mjs::PDF_RANGE_BYTES": "the byte sizing of a PDF piece (work pacing), not a bound on a file",
  "bio-plane/src/reading-pipeline/index.mjs::WINDOW_BYTES": "the window a text or CSV is read in (work pacing), not a bound on a file",
  "bio-plane/src/reading-pipeline/index.mjs::CSV_HEAD_BYTES": "the head a CSV's dialect is judged from, a read window",
  "bio-plane/src/reading-pipeline/index.mjs::CSV_SLACK_BYTES": "the read-ahead to the next record boundary when a chunk is cut, a read window",
  "bio-plane/src/reading-pipeline/html.mjs::PROSE_SCAN_MAX": "the characters of one block looked at to judge whether it holds prose (a scan window; past it the block is kept)",
  "bio-plane/src/csv-reader/index.mjs::CSV_WINDOW_BYTES": "the window a large CSV is decoded and walked in, work pacing",
  "bio-plane/src/csv-reader/index.mjs::HEAD_MAX_BYTES": "the head read to recognise a delimited file, a read window",
  "bio-plane/src/csv-reader/index.mjs::SHEET_WINDOW_MIN_BYTES": "the size from which a body is walked in windows with no record list kept, a policy threshold",
  "bio-plane/src/formats.mjs::HEAD_MAX": "the head read to recognise a format, a read window",
  "bio-plane/src/file-safety/formats.mjs::SAFE_VIEW_INLINE_CELLS_MAX_BYTES": "the JSON of a safe view's cells kept inline, a stored-value bound of the view",
  "bio-plane/src/file-safety/formats.mjs::SAFE_VIEW_TEXT_MAX": "the characters of a plain text a safe view SHOWS, a display bound (the preview's file bound is the `render.safe_view_bytes` row)",
  "bio-plane/src/calculations/index.mjs::INGEST_INLINE_MAX": "a value of an ingest's record kept inline in its row before it is chunked, a stored-value bound",
  "bio-plane/src/following/snapshot.mjs::PORTAL_ROWS_INLINE_MAX": "a portal snapshot's rows JSON kept inline before it is chunked, a stored-value bound",
  "bio-plane/src/provenance/index.mjs::TESTIMONY_MAX_BYTES": "the bytes of one testimony a member types, an authored text's bound",
  "bio-plane/src/content/index.mjs::TRANSCRIPTION_MAX_BYTES": "the bytes of one transcription a member types, an authored text's bound",
  "bio-plane/src/query.mjs::TEXT_CAP": "the characters of a text column the query index holds per bundle, an index bound",
  "bio-plane/src/investigation/index.mjs::WATCH_CAPTURES_MAX": "a count of captures a project's watch carries, no file size",
  "bio-plane/src/civil-time/zone.mjs::CACHE_LIMIT": "entries of a time-zone offset cache, no file size",
  "bio-plane/src/corpus-export/tables.mjs::PAGE_BYTES": "the page size of an export's rows, an output paging figure",
  "bio-plane/src/hypotheses/index.mjs::NOTE_MAX_BYTES": "the bytes of a note a member writes, an authored text's bound",
  "bio-plane/src/review/index.mjs::REVIEW_DRAFT_MAX": "the characters of a review draft, an authored text's bound",
  "bio-plane/src/filing-templates/blanks.mjs::FILING_TEXT_MAX": "the characters of a filing blank's text, an authored text's bound",
  "bio-plane/src/setup.mjs::RELEASE_NOTICE_MAX_BYTES": "the bytes of a release notice the instance shows, an authored text's bound",
  "bio-plane/src/setup.mjs::GROUP_LOGO_MAX_BYTES": "the bytes of the group's logo (200 KB), an upload of the setup screen and no reading",
  "bio-plane/src/run-rules/rules.mjs::AI_RUN_STATE_MAX_BYTES": "the bytes of an AI run's state row, a stored-value bound",
});
const acceptedKey = (c) => `${c.file}::${c.name}`;

/* ============================================================================================================================================================
   the sections
   ============================================================================================================================================================ */

export function sections(kit, counting) {
  void counting;
  const R = kit.R;
  const pdfExact = (words, n) => { const a = kit.pdfOf(words, n); return kit.pdfOf(words, n + (n - a.length)); };
  const upload = (auth, bytes, { type = "application/pdf", name = "n", statement: s = "a file the clerk handed me" } = {}) =>
    kit.plane(`/api/?${new URLSearchParams({ op: "captureupload", statement: s, name, type })}`, { method: "POST", headers: auth, body: bytes });
  const adminOwed = async (sha) => { const q = await kit.get(await kit.founder(), { op: "owedwork", sha }); return (R(q).owed ?? []); };

  /* ---------------------------------------------------------------------------------------------------------------------------------------------------- 14a */
  test("R9 seam §14a (G124a; R132, R125, R131, R130; PDF A3/A2): a PDF one byte over the alpha ceiling is STATED at once with its size, the limit and the key of the alpha sentence, owing nothing (no job row); one at the ceiling is not stated: its `reading` row is held and the alarm reads it", { timeout: 900000 }, async () => {
    const { auth } = await kit.ownerOf("r9lim-a");
    const ceiling = boundOf("pdf", "bytes");
    /* A3: ceiling + 1 */
    const over = pdfExact("R132 over the ceiling one byte", ceiling + 1);
    assert.equal(over.length, ceiling + 1);
    const res = await upload(auth, over);
    const body = await res.json();
    assert.equal(res.status, 200, JSON.stringify(body).slice(0, 300));
    const r = R(body);
    assert.equal(r.ok, true);
    assert.equal(r.capture.bytes, ceiling + 1, "the capture is held, whole");
    const reading = r.document.reading;
    assert.ok(reading, "the answer carries the statement as the document's reading");
    assert.deepEqual([reading.failure, reading.reason, reading.size, reading.bound, reading.key],
      ["final", "TOO_LARGE", ceiling + 1, ceiling, statement("pdf", "bytes", ceiling + 1).key], "the size, the limit and the key of the alpha sentence");
    assert.ok(String(reading.basis).includes(String(ceiling + 1)) && String(reading.basis).includes(String(ceiling)), "its sentence holds the file's size and the limit");
    assert.equal(r.reading_pending, undefined, "stated, never promised");
    assert.deepEqual(await adminOwed(sha256(over)), [], "nothing is owed: no job row of any kind");
    assert.equal(R(await kit.get(await kit.founder(), { op: "reading", sha256: sha256(over) })).job.state, null, "and the job state of the digest is none");
    /* A2: the ceiling itself is read: not stated, deferred as a row, the alarm reads it */
    const at = pdfExact("R132 at the ceiling exactly", ceiling);
    assert.equal(at.length, ceiling);
    const ok = R(await (await upload(auth, at)).json());
    assert.equal(ok.ok, true);
    assert.equal(ok.document.reading, undefined, "no statement at the ceiling");
    assert.equal(ok.reading_pending, true, "the reading follows by the job table (R131: over the inline ceiling, under the alpha ceiling)");
    const rows = await adminOwed(sha256(at));
    assert.ok(rows.some((x) => x.kind === "reading"), `a reading row is held for it: ${JSON.stringify(rows).slice(0, 300)}`);
    assert.ok(!rows.some((x) => x.state === "final"), "and none ended for a reason");
  });

  /* ---------------------------------------------------------------------------------------------------------------------------------------------------- 14b */
  test("R9 seam §14b (G124b; R72, R111, R130): a 24 MiB text uploaded through the real door lands whole and is not read inline; its job row is held", { timeout: 900000 }, async () => {
    const { auth } = await kit.ownerOf("r9lim-b");
    const size = 24 * MiB;
    const text = new Uint8Array(size).map((_, i) => (i % 61 === 60 ? 10 : 97 + ((i + 7) % 26)));
    text.set(te("R72 the clerk filed the twenty-four mebibyte notice "), 0);
    const res = await upload(auth, text, { type: "text/plain" });
    const body = await res.json();
    assert.equal(res.status, 200, JSON.stringify(body).slice(0, 300));
    const r = R(body);
    assert.equal(r.ok, true, JSON.stringify(r).slice(0, 300));
    assert.deepEqual([r.capture.bytes, r.capture.sha256], [size, sha256(text)], "held whole under its own digest");
    assert.equal(r.reading_pending, true, "text over the 3 MiB inline ceiling is owed, not read in the request");
    assert.equal(r.document.reading, undefined, "unread");
    assert.ok((await adminOwed(sha256(text))).some((x) => x.kind === "reading"), "its reading row is held");
  });

  test("R9 seam §14b (G124b; R72, R111): the door hands `uploadCapture` its own byte ledger and the request's declared length: a 24 MiB text peaks at the file and at most two parts beyond it, and nothing is held once it is answered", { timeout: 900000 }, async () => {
    const { controlPlaneOwnerOps } = await import("../../../src/control-plane/owner-ops.mjs");
    const { fresh, bucket } = await import("../capture/fixture.mjs");
    const { jobRegistrarStub } = await import("../../job-registrar-stub.mjs");
    const PART = 8 * MiB;
    const b = bucket();
    b.createMultipartUpload = async (key) => { const ps = []; return { uploadPart: async (n, bytes) => { ps[n - 1] = new Uint8Array(bytes); return { partNumber: n }; },
      complete: async () => { b.held.set(key, new Uint8Array(Buffer.concat(ps))); }, abort: async () => {} }; };
    const w = fresh({ evidence: b, env: { INSTANCE_NAME: "inst", VERSION: "9.9.9" } });
    w.c.evidenceKey = (d) => `bio/captures/${d}`;
    const j = jobRegistrarStub();
    w.c.registerJob = j.registerJob; w.c.armJobs = j.armJobs;
    const real = w.core.transact.bind(w.core);
    w.core.transact = (fn) => { try { return real(() => j.transact(() => { const out = fn(); if (out && typeof out === "object" && out.ok === false) throw Object.assign(new Error("refused"), { refused: out }); return out; })); } catch (e) { if (e && e.refused) return e.refused; throw e; } };
    /* the ledger the door builds is the one capture is handed: seen through a spy on the method the owner-ops map calls */
    let seen = null, declared = null;
    const of = { capture: () => ({ uploadCapture: (a) => { seen = a.ledger; declared = a.declared; return w.c.uploadCapture(a); } }) };
    const size = 24 * MiB;
    const text = new Uint8Array(size).map((_, i) => (i % 61 === 60 ? 10 : 97 + (i % 26)));
    let at = 0;
    const stream = new ReadableStream({ pull(c) { if (at >= size) c.close(); else { c.enqueue(text.subarray(at, Math.min(at + MiB, size))); at += MiB; } } }, { highWaterMark: 0 });
    const u = new URL("http://do/captureupload");
    for (const [k, v] of Object.entries({ by: "member:ann", statement: "a text the clerk handed me", type: "text/plain", declared: String(size) })) u.searchParams.set(k, v);
    const out = await controlPlaneOwnerOps(of, u, stream).captureupload();
    assert.equal(out.ok, true, JSON.stringify(out).slice(0, 300));
    assert.equal(declared, size, "the declared length reached capture as a number");
    assert.ok(seen && typeof seen.hold === "function" && typeof seen.peak === "function", "a byte ledger was handed to capture");
    assert.ok(seen.peak() >= size, `the ledger counted the bytes held (${seen.peak()})`);
    assert.ok(seen.peak() <= size + 2 * PART, `no more than the file and two parts beyond it (${seen.peak()})`);
    assert.ok(seen.peak() <= capFor(0) * MiB, "and under the isolate's memory less its idle figure (the one cap convention)");
    assert.equal(seen.held(), 0, "released once answered");
    /* control: a ledger the door was not handed (a direct call) counts nothing, and the ledger of another request is another ledger */
    const again = [];
    const of2 = { capture: () => ({ uploadCapture: (a) => { again.push(a.ledger); return { ok: true }; } }) };
    controlPlaneOwnerOps(of2, u, new ReadableStream()).captureupload();
    controlPlaneOwnerOps(of2, u, new ReadableStream()).captureupload();
    assert.notEqual(again[0], again[1], "one ledger a request");
  });

  /* ---------------------------------------------------------------------------------------------------------------------------------------------------- 14g */
  test("R9 seam §14g (G124g; R72, R111, capture R113): the archive limit as uploaded: a file declared one byte over `archive.uploaded_bytes` is refused by name with its size, the limit and the key, nothing written; the bound itself is accepted", { timeout: 900000 }, async () => {
    const { auth } = await kit.ownerOf("r9lim-g1");
    const bound = boundOf("archive", "uploaded_bytes");
    const begin = (bytes, sha) => kit.post(auth, "captureuploadbegin", { sha256: sha, bytes, statement: "an archive the clerk handed me", name: "a.zip", type: "application/zip" });
    const over = await begin(bound + 1, "c".repeat(64));
    assert.equal(over.status, 413, JSON.stringify(over.body).slice(0, 300));
    const o = R(over.body);
    assert.equal(o.ok, false);
    assert.equal(o.reason, "TOO_LARGE");
    assert.deepEqual([sizeOf(o), limitOf(o), o.key], [bound + 1, bound, statement("archive", "uploaded_bytes", bound + 1).key], "refused with its size, the limit and the key");
    const at = await begin(bound, "d".repeat(64));
    assert.equal(R(at.body).ok, true, `the bound itself is accepted: ${JSON.stringify(at.body).slice(0, 300)}`);
    assert.ok(R(at.body).upload, "an upload was begun");
    const ab = await kit.post(auth, "captureuploadabort", { upload: R(at.body).upload });
    assert.equal(R(ab.body).ok, true, "and aborted, nothing left held");
  });

  /* the archive with one member per `unpacked` byte declared: a lazy writer's directory states what the members unpack to, the real bytes are a few */
  async function archiveDeclaring(total) {
    const half = Math.floor(total / 2);
    const entries = [
      { name: "notes/a.txt", data: te("the first member of the archive"), method: 0, central: { uncompressedSize: half } },
      { name: "notes/b.txt", data: te("the second member of the archive"), method: 0, central: { uncompressedSize: total - half } },
    ];
    return collect(zipChunks64(entries));
  }
  test("R9 seam §14g (G124g; R134, R111, acquisition R38) (red until acquisition's refusal states the declared size): an archive whose directory declares one byte over `archive.unpacked_bytes` is refused by name with its size and limit; the bound itself is accepted", { timeout: 900000 }, async () => {
    const { auth } = await kit.ownerOf("r9lim-g2");
    const bound = boundOf("archive", "unpacked_bytes");
    const filed = async (total) => {
      const zip = await archiveDeclaring(total);
      const up = R(await (await upload(auth, zip, { type: "application/zip", name: `a${total}.zip` })).json());
      assert.equal(up.ok, true, JSON.stringify(up).slice(0, 300));
      return { sha: up.capture.sha256, unpack: await kit.post(auth, "unpack", { archiveSha: up.capture.sha256 }) };
    };
    const over = await filed(bound + 1);
    const o = R(over.unpack.body);
    assert.equal(o.ok, false, JSON.stringify(over.unpack.body).slice(0, 400));
    assert.equal(o.reason, "ARCHIVE_TOTAL_MAX", "refused by name");
    assert.equal(limitOf(o), bound, "with the limit");
    assert.equal(sizeOf(o), bound + 1, `and the size the directory declares (the refusal says ${JSON.stringify(o).slice(0, 300)})`);
    const at = await filed(bound);
    const a = R(at.unpack.body);
    assert.notEqual(a.reason, "ARCHIVE_TOTAL_MAX", `the bound itself is not refused for its total: ${JSON.stringify(at.unpack.body).slice(0, 400)}`);
  });

  /* ---------------------------------------------------------------------------------------------------------------------------------------------------- G124 */
  test("R9 seam §14 (G124, R132; K3268): THE ALL-MODULES GREP: no module declares a reading ceiling as a number that `READ_BOUNDS` does not hold: every ceiling constant of every module resolves to the table through boundOf/statement or is an accepted non-ceiling", () => {
    const { found, scanned, modules, declared } = ceilingConstantsOfModules();
    assert.ok(scanned > 500, `the walk read the modules' source (${scanned} files of ${modules.size} of ${declared} modules)`);
    const loose = found.filter((c) => !Object.hasOwn(ACCEPTED, acceptedKey(c)));
    const line = (c) => `${c.module} ${c.file}:${c.line} ${c.name} = ${c.rhs} (${c.value})`;
    assert.deepEqual(loose.map(line), [], `${loose.length} ceiling constant(s) written as numbers that resolve to no READ_BOUNDS row, by module, file:line and name:\n  ${loose.map(line).join("\n  ")}`);
  });

  test("R9 seam §14 (G124): every name in ACCEPTED is still declared as a number where it says (an accepted name that no longer exists is removed, not left to hide the next constant)", () => {
    const { found } = ceilingConstantsOfModules();
    const have = new Set(found.map(acceptedKey));
    const stale = Object.keys(ACCEPTED).filter((k) => !have.has(k));
    assert.deepEqual(stale, [], `accepted names the walk no longer finds: ${stale.join(", ")}`);
    for (const [k, why] of Object.entries(ACCEPTED)) assert.ok(typeof why === "string" && why.length > 10 && !/\n/.test(why), `${k} carries its one-line reason`);
  });

  test("R9 seam §14 (G124): every module's own `boundOf`/`statement` call that names a table row by two string literals names a row that exists (a quote of a row the table does not hold throws at load)", () => {
    const { sources } = moduleSources();
    const call = /\b(?:boundOf|statement|boundStatement)\(\s*["']([a-z_]+)["']\s*,\s*["']([a-z_]+)["']/g;
    const missing = [];
    let quoted = 0;
    for (const { module, file } of sources) {
      let text;
      try { text = readFileSync(join(ROOT, file), "utf8"); } catch { continue; }
      text.split("\n").forEach((l, i) => {
        if (/^\s*(?:\/\/|\/\*|\*)/.test(l)) return;
        for (const m of l.matchAll(call)) {
          quoted++;
          if (!(Object.hasOwn(READ_BOUNDS, m[1]) && Object.hasOwn(READ_BOUNDS[m[1]], m[2]))) missing.push(`${module} ${file}:${i + 1} ${m[1]}.${m[2]}`);
        }
      });
    }
    assert.ok(quoted > 40, `the walk found the modules' quotes (${quoted})`);
    assert.deepEqual(missing, [], "quotes of rows the table does not hold");
  });
}
