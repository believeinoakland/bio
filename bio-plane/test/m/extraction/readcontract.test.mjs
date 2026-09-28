/* extraction: the read contract later modules join in their own SQL (R53) and the term fold its name terms are made
   by (R54), N108. Checked at the interface: what `writeReading` and `indexUnits` leave in the named columns, and what
   the two exported folds answer. Each test names the requirement ids it checks in its title. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { fresh, bundle } from "./fixture.mjs";
import { normAlias, labelTerms } from "../../../src/extraction/index.mjs";
import { readingSourceJson } from "../../../src/textchain.mjs";
import { canonicalExtent } from "../../../checks/bio-checks.mjs";

const S1 = "1".repeat(64), S2 = "2".repeat(64);
const layer = [{ step: "layer", tier: 1, container: "pdf", cap: null, measured_by: "unmeasured" }];
const reading = (entities = [], extra = {}) => ({ content_type: "agenda", reader_version: 1, read_from_text: true,
  found: entities.length > 0, entities, facts: {}, at: "2026-09-27T00:00:00Z", basis: "b", text_source: layer,
  text_tier: 1, text_container: "pdf", ...extra });
const E = (kind, key, label = null, source = null, occurrences = undefined) =>
  ({ kind, key, label, facts: {}, ref: `${kind}:${key}`, source, ...(occurrences ? { occurrences } : {}) });
const page = (p) => ({ kind: "pdf-page", ref: `p${p}`, page: p, rect: null });

const CONTRACT = {
  readings: ["capture_sha", "bundle_id", "content_type"],
  reading_refs: ["capture_sha", "bundle_id", "ref", "ref_kind", "ref_key", "label", "pos_kind", "pos", "pos_ref", "occurrence", "seq"],
  reading_ref_terms: ["capture_sha", "bundle_id", "ref", "src", "term"],
  capture_text_skipped: ["capture_sha", "bundle_id", "first_seq", "last_seq", "units", "first_extent", "first_ref",
                         "last_extent", "last_ref", "side"],
};

test("R53: the four tables carry every column the contract names", () => {
  const w = fresh();
  for (const [t, cols] of Object.entries(CONTRACT)) {
    const have = w.rows(`PRAGMA table_info(${t})`).map((c) => c.name);
    for (const c of cols) assert.ok(have.includes(c), `${t}.${c}`);
  }
});

test("R53 R45: readings: one row per capture read, a failed reading included; bundle_id the last writer's bundle; content_type the reader's key or null", () => {
  const w = fresh();
  bundle(w.s, "B-1"); bundle(w.s, "B-2");
  w.x.writeReading({ bundleId: "B-1", captureSha: S1, reading: reading([E("m", "1")]) });
  w.x.writeReading({ bundleId: "B-1", captureSha: S2, reading: reading([], { content_type: undefined, found: false, read_from_text: false }) });
  assert.deepEqual(w.rows(`SELECT capture_sha, bundle_id, content_type FROM readings ORDER BY capture_sha`).map((r) => ({ ...r })),
                   [{ capture_sha: S1, bundle_id: "B-1", content_type: "agenda" }, { capture_sha: S2, bundle_id: "B-1", content_type: null }]);
  w.x.writeReading({ bundleId: "B-2", captureSha: S1, reading: reading([E("m", "1")]) });
  assert.equal(w.one(`SELECT bundle_id FROM readings WHERE capture_sha=?`, S1).bundle_id, "B-2");
  assert.equal(w.rows(`SELECT * FROM readings WHERE capture_sha=?`, S1).length, 1);
});

test("R53 R46: reading_refs: ref raw kind:key; kind, key and label as emitted or null; the position all three or none; occurrence pos_kind:pos, empty for the one unplaced row; seq 0 the first read", () => {
  const w = fresh();
  bundle(w.s, "B-1");
  w.x.writeReading({ bundleId: "B-1", captureSha: S1, reading: reading([
    E("meeting", "2101", "Council", page(0), [page(3), page(0)]),
    E("person", "Ana", null, { kind: "bogus" }),
  ]) });
  const m = w.rows(`SELECT * FROM reading_refs WHERE capture_sha=? AND ref='meeting:2101' ORDER BY seq`, S1);
  assert.deepEqual(m.map((r) => [r.seq, r.pos_ref]), [[0, "p0"], [1, "p3"]], "one row per distinct place, source first");
  for (const r of m) {
    assert.deepEqual([r.bundle_id, r.ref_kind, r.ref_key, r.label], ["B-1", "meeting", "2101", "Council"]);
    assert.equal(r.occurrence, `${r.pos_kind}:${r.pos}`);
    assert.equal(r.pos, readingSourceJson(page(r.seq === 0 ? 0 : 3)));
  }
  const p = w.one(`SELECT * FROM reading_refs WHERE capture_sha=? AND ref='person:Ana'`, S1);
  assert.deepEqual([p.pos_kind, p.pos, p.pos_ref, p.occurrence, p.seq, p.label], [null, null, null, "", 0, null],
                   "a position that does not normalise is none, all three columns together");
  const every = w.rows(`SELECT pos_kind, pos, pos_ref FROM reading_refs`);
  assert.ok(every.every((r) => (r.pos_kind === null) === (r.pos === null) && (r.pos === null) === (r.pos_ref === null)));
});

test("R53 R54: reading_ref_terms: src is ref, key (only when the key folds to other than the reference) or label; each term is labelTerms of its source; a name is matched within one (capture_sha, ref, src) group, never across sources", () => {
  const w = fresh();
  bundle(w.s, "B-1");
  w.x.writeReading({ bundleId: "B-1", captureSha: S1, reading: reading([
    E("case", "Alpha-7", "Beta Report"),
    { kind: null, key: "SOLO", label: null, facts: {}, ref: "Solo", source: null },
  ]) });
  const terms = (ref) => w.rows(`SELECT src, term FROM reading_ref_terms WHERE capture_sha=? AND ref=? ORDER BY src, term`, S1, ref);
  const a = terms("case:Alpha-7");
  const by = (src) => a.filter((t) => t.src === src).map((t) => t.term);
  assert.deepEqual(by("ref"), labelTerms("case:Alpha-7").sort());
  assert.deepEqual(by("key"), labelTerms("Alpha-7").sort());
  assert.deepEqual(by("label"), labelTerms("Beta Report").sort());
  assert.ok(w.rows(`SELECT bundle_id FROM reading_ref_terms`).every((r) => r.bundle_id === "B-1"));
  /* a key that folds to the whole reference writes no key source */
  const s = terms("Solo");
  assert.deepEqual([...new Set(s.map((t) => t.src))].sort(), ["ref"]);
  /* the subset test within one group: "alpha beta" is in no single source, so a grouped lookup finds nothing */
  const q = (names) => w.rows(
    `SELECT capture_sha, ref, src FROM reading_ref_terms WHERE term IN (${names.map(() => "?").join(",")})
      GROUP BY capture_sha, ref, src HAVING COUNT(DISTINCT term) = ?`, ...names, names.length);
  assert.deepEqual(q(labelTerms("Alpha Beta")), []);
  assert.deepEqual(q(labelTerms("beta report")).map((r) => r.src), ["label"]);
});

test("R53 R22: capture_text_skipped: one row per run of consecutive skipped units, first and last named by extent, reference and seq, counted, with the side that skipped it", () => {
  const w = fresh();
  bundle(w.s, "B-1");
  const u = (p) => ({ extent: { kind: "pdf-page", page: p, rect: null }, text: `t${p}`, seq: p });
  const wireRun = { first: { kind: "pdf-page", page: 50, rect: null }, first_seq: 50,
                    last: { kind: "pdf-page", page: 52, rect: null }, last_seq: 52, units: 3 };
  w.x.indexUnits("B-1", S1, [u(0), u(1)], layer, { wireOverBound: 3, wireSkipped: [wireRun] });
  const rows = w.rows(`SELECT * FROM capture_text_skipped WHERE capture_sha=? ORDER BY first_seq`, S1).map((r) => ({ ...r }));
  assert.deepEqual(rows, [{ capture_sha: S1, bundle_id: "B-1", first_seq: 50, last_seq: 52, units: 3,
    first_extent: canonicalExtent(wireRun.first), first_ref: "page 51", last_extent: canonicalExtent(wireRun.last),
    last_ref: "page 53", side: "wire" }]);
  /* the store's own runs, and a rewrite replaces the capture's rows */
  const many = Array.from({ length: 4100 }, (_, i) => u(i));
  w.x.indexUnits("B-1", S1, many, layer);
  const st = w.rows(`SELECT first_seq, last_seq, units, side FROM capture_text_skipped WHERE capture_sha=?`, S1).map((r) => ({ ...r }));
  assert.deepEqual(st, [{ first_seq: 4096, last_seq: 4099, units: 4, side: "store" }]);
});

test("R54: normAlias trims, collapses whitespace, lower-cases and cuts to 200 characters, diacritics kept; labelTerms is its distinct terms split on non-letter non-digit runs, in order, at most 24", () => {
  assert.equal(normAlias("  José \t  DE   la\nCruz "), "josé de la cruz");
  assert.equal(normAlias(null), "");
  assert.equal(normAlias("A".repeat(250)).length, 200);
  assert.deepEqual(labelTerms("Contract, for JOSÉ-de la Cruz (2026) — José"), ["contract", "for", "josé", "de", "la", "cruz", "2026"]);
  assert.deepEqual(labelTerms("  ---  "), []);
  assert.deepEqual(labelTerms("Ünïcode ÄÖ 東京 x1"), ["ünïcode", "äö", "東京", "x1"]);
  const long = Array.from({ length: 30 }, (_, i) => `w${i}`).join(" ");
  assert.deepEqual(labelTerms(long), Array.from({ length: 24 }, (_, i) => `w${i}`));
});
