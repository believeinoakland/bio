/* capture, fix round 4 (K4429; P10 of the performance lane, `heldcaptures` for a screen that lists documents and draws a few): the
   page is read as picker rows first, and the heavy fields only for the documents on screen, named by `bundle_ids`; the evidence
   store's reads and the archive groupings of one page overlap, and no document is read twice. At the module's interface over this
   module's fixture, acquisition's real archive listing, the evidence store's round trip and an examination's cost stated. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { fresh, bucket, network, sha } from "./fixture.mjs";
import { makeZip } from "../../make-zip.mjs";
import { provenance as acquisitionProvenance } from "../acquisition/fixture.mjs";
import { captureOps, HELD_IDS_MAX } from "../../../src/capture/index.mjs";
import { acquisitionOf } from "../../../src/acquisition/index.mjs";
import { PROVENANCE_SCHEMA } from "../../../src/provenance/schema.mjs";

const ADMIN = "class:admin";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const spin = (ms) => { const end = performance.now() + ms; while (performance.now() < end); };
const ids = (r) => r.held.map((x) => x.bundle_id);

/* The walker's case: the copy holds 27 documents; the evidence store answers in `latency` ms; the examination costs `exam` ms of the
   thread. `calls` counts what the page asked of each. */
function world({ latency = 0, exam = 0 } = {}) {
  const b = bucket();
  const calls = { head: 0, get: 0, exam: new Map(), touched: new Set() };
  for (const k of ["head", "get"]) { const f = b[k].bind(b); b[k] = async (...a) => { calls[k]++; calls.touched.add(a[0]); if (latency) await sleep(latency); return f(...a); }; }
  const f = fresh({ evidence: b, env: { INSTANCE_NAME: "inst", VERSION: "9.9.9" } });
  for (const t of PROVENANCE_SCHEMA.split("\n").filter((l) => !l.trim().startsWith("--")).join("\n").split(";")) if (t.trim()) f.s.db.exec(t);
  const registered = [];
  const prov = acquisitionProvenance({ sql: f.s.sql, registered });
  f.c.provenance = prov;
  f.c.acquisition = acquisitionOf({ storage: f.s }, { record: f.core, provenance: prov, membership: { isAdministrator: () => false } });
  f.c.registerReader("batch-examination", "ratification", (id) => { calls.exam.set(id, (calls.exam.get(id) || 0) + 1); spin(exam); return { eligible: true }; });
  return { ...f, b, prov, registered, calls };
}
function held(w, i, { state = "collected" } = {}) {
  const bytes = new TextEncoder().encode(`<html>document ${i} ${"x".repeat(2000)}</html>`);
  const d = sha(bytes);
  w.b.held.set(`bio/captures/${d}`, bytes);
  const id = `INFO-${String(i).padStart(3, "0")}`;
  const created = `2026-01-${String(1 + (i % 28)).padStart(2, "0")}T00:00:00Z`;
  w.s.sql.exec(`INSERT INTO bundles (bundle_id, object_type, group_id, title, current_state, created, last_updated, bundle_sha, row_version)
                VALUES (?, 'information', 'g', ?, ?, ?, ?, 'x', 1)`, id, `title ${id}`, state, created, created);
  w.s.sql.exec(`INSERT INTO register (capture_sha, bundle_id, path) VALUES (?, ?, 'x')`, d, id);
  w.prov.homes[d] = id;
  w.registered.push(d);
  return id;
}
const fill = (w, n = 27) => Array.from({ length: n }, (_, i) => held(w, i));
const fresh0 = (w) => { w.calls.head = 0; w.calls.get = 0; w.calls.exam.clear(); w.calls.touched.clear(); };
const digestOf = (w, id) => w.s.sql.exec("SELECT capture_sha FROM register WHERE bundle_id = ?", id)[0].capture_sha;
const keyOf = (d) => `bio/captures/${d}`;
/* the call as the door runs it */
const door = (w, query) => captureOps(w.c, new URL(`http://x/?op=heldcaptures&viewer=${ADMIN}&${query}`), {}, w.c.env).heldcaptures();

test("R77 R91 R102 (P10): a screen of 27 documents reads the page as picker rows, which ask the evidence store and the examination nothing, and the heavy fields of the 10 on screen, asking each of those once; the whole read asks all 27 (control)", async () => {
  const w = world({ latency: 40, exam: 15 });
  const all = fill(w);
  const began = performance.now();
  const picker = await w.c.heldCaptures({ viewer: ADMIN, limit: 500, fields: "picker" });
  assert.equal(picker.held.length, 27);
  assert.deepEqual([w.calls.head, w.calls.get, w.calls.exam.size], [0, 0, 0], "the picker asks neither the store nor the examination");
  const shown = ids(picker).slice(0, 10);
  const detail = await w.c.heldCaptures({ viewer: ADMIN, limit: 500, bundle_ids: shown });
  const took = performance.now() - began;
  assert.deepEqual(ids(detail), shown, "the 10 on screen, in the page's order");
  assert.equal(w.calls.exam.size, 10, "the examination was asked of the 10 on screen only");
  assert.ok([...w.calls.exam.values()].every((n) => n === 1), "and each once");
  assert.deepEqual([...w.calls.touched].sort(), shown.map((id) => keyOf(digestOf(w, id))).sort(), "the evidence store was asked about the captures of the 10 on screen and no other");
  assert.ok(detail.held.every((r) => r.eligible === true && r.whole === true && r.capture && "grade" in r.capture && "captured_for" in r && "age_days" in r),
    "they carry R77's full fields");
  if (process.env.P10_NUMBERS) console.log("P10 picker+10 full:", Math.round(took), "ms");
  assert.ok(took < 1000, `the two reads took ${Math.round(took)} ms with a 40 ms store and a 15 ms examination, under the second the walker's row asks`);
  /* control: the same screen read whole asks every document, which is what the fix avoids */
  fresh0(w);
  const whole = await w.c.heldCaptures({ viewer: ADMIN, limit: 500 });
  assert.equal(whole.held.length, 27);
  assert.equal(w.calls.exam.size, 27);
  assert.equal(w.calls.touched.size, 27, "every capture of the page was read");
  assert.deepEqual(ids(whole), ids(picker), "same rows, same order");
  assert.deepEqual(all.slice().sort(), ids(whole).slice().sort());
});

test("R77 R102 (P10): `bundle_ids` selects which rows are answered, not which documents are in the list: a row is the page's row for a viewer who may see it, one the list does not hold is no row, and the order, `limit`, `truncated` and `next` are the page's", async () => {
  const w = world();
  const all = fill(w, 12);
  held(w, 90, { state: "verified" });
  const base = await w.c.heldCaptures({ viewer: ADMIN, limit: 500, fields: "picker" });
  const [a, b, c] = ids(base).slice(3, 6);
  const pick = await w.c.heldCaptures({ viewer: ADMIN, bundle_ids: [c, "INFO-NONE", a, "INFO-090", b] });
  assert.deepEqual(ids(pick), ids(base).filter((x) => [a, b, c].includes(x)), "only the listed documents the list holds, in the page's order");
  const paged = await w.c.heldCaptures({ viewer: ADMIN, bundle_ids: [a, b, c], limit: 2 });
  assert.equal(paged.held.length, 2);
  assert.equal(paged.truncated, true);
  const rest = await w.c.heldCaptures({ viewer: ADMIN, bundle_ids: [a, b, c], limit: 2, after: paged.next });
  assert.deepEqual([...ids(paged), ...ids(rest)], ids(pick), "`next` continues the same selection");
  assert.deepEqual((await w.c.heldCaptures({ viewer: ADMIN, bundle_ids: [], fields: "picker" })).held.length, all.length, "an empty list selects nothing: the whole list");
  assert.deepEqual((await w.c.heldCaptures({ viewer: "", bundle_ids: [a] })).held, [], "a viewer who may not see the document gets no row for it");
  /* with the picker too, and the route's comma list */
  assert.deepEqual(ids(await w.c.heldCaptures({ viewer: ADMIN, fields: "picker", bundle_ids: [b, a] })), ids(base).filter((x) => [a, b].includes(x)));
  assert.deepEqual(ids(await door(w, `bundle_ids=${c},${a}`)), ids(base).filter((x) => [a, c].includes(x)), "op=heldcaptures takes the ids as a comma list");
  /* beside `bundle_id`, which keeps its meaning (the one document's read), both apply */
  assert.deepEqual(ids(await w.c.heldCaptures({ viewer: ADMIN, bundle_id: a, bundle_ids: [a, b] })), [a]);
  assert.deepEqual(ids(await w.c.heldCaptures({ viewer: ADMIN, bundle_id: a, bundle_ids: [b] })), []);
});

test("R77 R102 (P10): an archive's row asked by `bundle_ids` still groups its files beside it; a file asked alone, whose archive is a row of the list, is no row of its own", async () => {
  const w = world();
  fill(w, 2);
  const z = makeZip([{ name: "a.txt", data: "ay" }, { name: "b.txt", data: "bee" }]);
  const net = network({ "https://files.example/set.zip": () => new Response(z, { headers: { "content-type": "application/zip" } }) });
  let r;
  try { r = await w.c.acquire({ locator: "https://files.example/set.zip" }, { cls: "member", member: true, sessMember: "m1", storeName: "bio" }); }
  finally { net.restore(); }
  assert.equal(r.body.ok, true);
  const promote = (id, digest) => {
    w.s.sql.exec(`INSERT INTO bundles (bundle_id, object_type, group_id, title, current_state, created, last_updated, bundle_sha, row_version)
                  VALUES (?, 'information', 'g', ?, 'collected', '2026-03-01T00:00:00Z', '2026-03-01T00:00:00Z', 'x', 1)`, id, `title ${id}`);
    w.s.sql.exec(`INSERT INTO register (capture_sha, bundle_id, path) VALUES (?, ?, 'x')`, digest, id);
    w.prov.homes[digest] = id;
  };
  promote("INFO-ZIP", sha(z));
  const files = (r.body.unpack.documents || []).map((d) => { promote(`INFO-ZIP-${d.container.index}`, d.capture.sha256); return `INFO-ZIP-${d.container.index}`; });
  assert.equal(files.length, 2);
  const asked = await w.c.heldCaptures({ viewer: ADMIN, bundle_ids: ["INFO-ZIP"] });
  assert.deepEqual(ids(asked), ["INFO-ZIP"]);
  assert.deepEqual(asked.held[0].files.map((f) => f.document), files, "the files beside their archive, though they were not named");
  assert.deepEqual(ids(await w.c.heldCaptures({ viewer: ADMIN, bundle_ids: [files[0]] })), [], "beside its archive, a file is not a row of its own");
});

test("R77 R102 (P10): a `bundle_ids` that is not a list of document ids, or names more than HELD_IDS_MAX, is the required-argument refusal naming it, nothing read", async () => {
  const w = world();
  fill(w, 3);
  for (const bad of [{ a: 1 }, 7, [1, 2], ["", "x"], [{}], Array.from({ length: HELD_IDS_MAX + 1 }, (_, i) => `INFO-${i}`)]) {
    const r = await w.c.heldCaptures({ viewer: ADMIN, bundle_ids: bad });
    assert.equal(r.ok, false, JSON.stringify(bad).slice(0, 40));
    assert.equal(r.reason, "REQUIRED_ARGUMENT_MISSING");
    assert.equal(r.argument, "bundle_ids");
  }
  assert.equal(w.calls.exam.size, 0, "nothing was asked of the examination");
  const exactly = await w.c.heldCaptures({ viewer: ADMIN, bundle_ids: Array.from({ length: HELD_IDS_MAX }, (_, i) => `INFO-${String(i).padStart(3, "0")}`) });
  assert.equal(exactly.ok, true, "control: HELD_IDS_MAX ids are accepted");
});

test("R77 R91 R102 (P10): the page's reads of the evidence store and its archive groupings overlap: the first grouping is asked before any of the store's heads for the page has answered, not after they all end", async () => {
  const w = world({ latency: 30 });
  fill(w, 6);
  let headsDone = 0, doneAtFirstProbe = null;
  const head = w.b.head.bind(w.b);
  w.b.head = async (k) => { const r = await head(k); headsDone++; return r; };
  const list = w.c.archiveList.bind(w.c);
  w.c.archiveList = (args) => { if (doneAtFirstProbe === null) doneAtFirstProbe = headsDone; return list(args); };
  const r = await w.c.heldCaptures({ viewer: ADMIN, limit: 500 });
  assert.equal(r.held.length, 6);
  assert.ok(r.held.every((row) => row.whole === true), "every head answered");
  assert.equal(doneAtFirstProbe, 0, "no head had answered when the first grouping was asked");
});
