/* capture, fix round 5 (K4530; E13; PERFORMANCE P10: Held 3.0-4.7 s against the 2 s bar, full rows about 150 ms each): the full
   `heldcaptures` read of a screen's worth of documents (27 rows, limit 500) asks the evidence store as little as it can and begins what it
   asks in lanes of `HELD_PAGE_LANES`. At the module's interface over this module's fixture and acquisition's real archive listing.
   R77 (the row's `whole`), R91 (the page's lanes and wait). The golden is the answer the unchanged code gave for the same store,
   recorded once (E13_WRITE_GOLDEN=1 on that code), never written by hand. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, writeFileSync } from "node:fs";
import { fresh, bucket, sha } from "./fixture.mjs";
import { provenance as acquisitionProvenance } from "../acquisition/fixture.mjs";
import { acquisitionOf, MULTIPART_KEEP_MAX } from "../../../src/acquisition/index.mjs";
import { PROVENANCE_SCHEMA } from "../../../src/provenance/schema.mjs";

const LANES = 8;   // R91: the lanes a page is read in
const ADMIN = "class:admin";
const NOW = "2026-03-12T00:00:00Z";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const ids = (r) => r.held.map((x) => x.bundle_id);
const GOLDEN = new URL("./e13-golden.json", import.meta.url);

/* The walker's screen: the copy holds `n` documents; the store answers after `latency` ms; `calls` counts the heads and the most in flight at once. */
function world({ latency = 0 } = {}) {
  const b = bucket();
  const calls = { head: 0, flight: 0, peak: 0, keys: [] };
  const head = b.head.bind(b);
  b.head = async (k) => {
    calls.head++; calls.keys.push(k);
    calls.flight++; calls.peak = Math.max(calls.peak, calls.flight);
    try { if (latency) await sleep(latency); return await head(k); } finally { calls.flight--; }
  };
  const f = fresh({ evidence: b, env: { INSTANCE_NAME: "inst", VERSION: "9.9.9" } });
  for (const t of PROVENANCE_SCHEMA.split("\n").filter((l) => !l.trim().startsWith("--")).join("\n").split(";")) if (t.trim()) f.s.db.exec(t);
  const registered = [];
  const prov = acquisitionProvenance({ sql: f.s.sql, registered });
  f.c.provenance = prov;
  f.c.acquisition = acquisitionOf({ storage: f.s }, { record: f.core, provenance: prov, membership: { isAdministrator: () => false } });
  return { ...f, b, prov, registered, calls };
}
/* One document: its bytes (held whole in the store unless `inStore` is false), and the size its register row records (`size`: a number, or
   null where the register recorded none; by default the bytes' own length, as keeping records it). */
function held(w, i, { size = undefined, inStore = true } = {}) {
  const bytes = new TextEncoder().encode(`<html>document ${i} ${"x".repeat(200 + i)}</html>`);
  const d = sha(bytes);
  if (inStore) w.b.held.set(`bio/captures/${d}`, bytes);
  const id = `INFO-${String(i).padStart(3, "0")}`;
  const created = `2026-01-${String(1 + (i % 28)).padStart(2, "0")}T00:00:00Z`;
  w.s.sql.exec(`INSERT INTO bundles (bundle_id, object_type, group_id, title, current_state, created, last_updated, bundle_sha, row_version)
                VALUES (?, 'information', 'g', ?, 'collected', ?, ?, 'x', 1)`, id, `title ${id}`, created, created);
  w.s.sql.exec(`INSERT INTO register (capture_sha, bundle_id, path, bytes) VALUES (?, ?, 'x', ?)`, d, id, size === undefined ? bytes.length : size);
  /* the register document profiles the capture as a page, so the archive grouping (R77) asks the store nothing of it */
  w.s.sql.exec(`INSERT INTO files (bundle_id, path, content, blob_sha, bytes, sha256) VALUES (?, 'data/provenance.json', ?, NULL, 1, 'x')`,
               id, JSON.stringify({ documents: [{ capture: { sha256: d }, profile: { format: { format: "html" } } }] }));
  w.prov.homes[d] = id;
  w.registered.push(d);
  return { id, d };
}
const fill = (w, n = 27, opts = {}) => Array.from({ length: n }, (_, i) => held(w, i, opts));
const keyOf = (d) => `bio/captures/${d}`;

test("R77 R91 E13 (P10): the full read of 27 documents whose register recorded the size they were kept at asks the evidence store for none of them, and answers `whole: true` for each, in the page's order", async () => {
  const w = world({ latency: 20 });
  const docs = fill(w, 27);
  const r = await w.c.heldCaptures({ viewer: ADMIN, limit: 500, now: NOW });
  assert.equal(r.held.length, 27);
  assert.equal(w.calls.head, 0, "27 documents, 27 distinct fingerprints, and the store was asked about none: the register's size says");
  assert.ok(r.held.every((x) => x.whole === true));
  assert.deepEqual(new Set(ids(r)), new Set(docs.map((d) => d.id)));
});

test("R77 R91 E13 (P10): a document whose register recorded no size, or one past what is kept whole, is asked of the store once, each fingerprint once, at most HELD_PAGE_LANES at a time and more than one at a time; a size the store keeps whole is not asked", async () => {
  const w = world({ latency: 30 });
  const small = fill(w, 6);                                   // sizes recorded, kept whole by size: not asked
  const unknown = Array.from({ length: 14 }, (_, k) => held(w, 100 + k, { size: null }));   // no size recorded: asked
  const past = Array.from({ length: 4 }, (_, k) => held(w, 200 + k, { size: MULTIPART_KEEP_MAX + 1 + k }));   // past the bound: asked
  const gone = held(w, 300, { size: MULTIPART_KEEP_MAX + 9, inStore: false });                    // past the bound, no whole object: asked, false
  const r = await w.c.heldCaptures({ viewer: ADMIN, limit: 500, now: NOW });
  assert.equal(r.held.length, 6 + 14 + 4 + 1);
  const asked = [...unknown, ...past, gone].map((x) => keyOf(x.d)).sort();
  assert.deepEqual([...w.calls.keys].sort(), asked, "exactly the unsized and the past-the-bound fingerprints, none twice, none of the sized small ones");
  assert.ok(w.calls.peak > 1, `the heads overlap (peak ${w.calls.peak})`);
  assert.ok(w.calls.peak <= LANES, `at most ${LANES} at once (peak ${w.calls.peak})`);
  const whole = new Map(r.held.map((x) => [x.bundle_id, x.whole]));
  assert.ok(small.every((x) => whole.get(x.id) === true));
  assert.ok(unknown.every((x) => whole.get(x.id) === true), "an unsized copy held whole reads whole");
  assert.ok(past.every((x) => whole.get(x.id) === true), "a copy past the bound with a whole object (keepPast, R103) reads whole: the size alone does not say false");
  assert.equal(whole.get(gone.id), false, "past the bound and no whole object: held in parts");
});

test("R77 E13 (P10): the full read's rows are the page's rows in the page's order whatever the order the store answers in", async () => {
  const w = world();
  fill(w, 12, { size: null });
  const heads = [];
  const head = w.b.head.bind(w.b);
  w.b.head = async (k) => { heads.push(k); await sleep(k.charCodeAt(k.length - 1) % 7); return head(k); };   // answers out of order
  const picker = await w.c.heldCaptures({ viewer: ADMIN, limit: 500, fields: "picker", now: NOW });
  const full = await w.c.heldCaptures({ viewer: ADMIN, limit: 500, now: NOW });
  assert.deepEqual(ids(full), ids(picker), "the page's order");
  assert.equal(heads.length, 12);
});

/* The answer is unchanged: for a store consistent with its register (the sizes kept are the sizes held, an unsized copy or one past the
   bound held whole or not), the full read answers byte for byte what the code before E13 answered (E13_WRITE_GOLDEN=1 on that code). */
function goldenWorld() {
  const w = world();
  const sized = fill(w, 12);
  const unsized = Array.from({ length: 6 }, (_, k) => held(w, 100 + k, { size: null }));
  const unsizedGone = held(w, 150, { size: null, inStore: false });
  const past = Array.from({ length: 3 }, (_, k) => held(w, 200 + k, { size: MULTIPART_KEEP_MAX + 1 + k }));
  const pastGone = held(w, 250, { size: MULTIPART_KEEP_MAX + 2, inStore: false });
  return { w, all: [...sized, ...unsized, unsizedGone, ...past, pastGone] };
}
test("R77 E13 (P10): the full read answers byte for byte what the code before E13 answered, for a store consistent with its register (a recorded answer, compared)", async () => {
  const { w } = goldenWorld();
  const got = await w.c.heldCaptures({ viewer: ADMIN, limit: 500, now: NOW });
  const text = JSON.stringify(got, null, 1);
  if (process.env.E13_WRITE_GOLDEN === "1") { writeFileSync(GOLDEN, text + "\n"); return; }
  assert.equal(text + "\n", readFileSync(GOLDEN, "utf8"));
  const wholes = got.held.map((x) => x.whole);
  assert.ok(wholes.includes(true) && wholes.includes(false), "the golden holds both answers");
});
