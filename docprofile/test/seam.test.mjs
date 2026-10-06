/* docprofile — the registry seam (T33-12; K1513; T34-8), at the module's interface:
 * everything through `docprofile/registry.mjs`. This module holds no content type (R36):
 * the registry starts empty, and `registerDoctype` is the `register` that
 * `doctypes.registerDoctypes` is handed (wired by `plane`). Types registered here are
 * stubs, never `doctypes`' (a later module). This file runs in its own process, so its
 * registrations reach no other suite, and its first test sees the registry as a process
 * that registered nothing does.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import * as dp from "../registry.mjs";

const { doctypeFor, doctypes, registerDoctype, readText, assess, NO_TYPE, CONFIDENCE, CONTRACT } = dp;
const enc = (s) => new TextEncoder().encode(s);
const sha256 = async (b) => createHash("sha256").update(b).digest("hex");

/* A stub type: `confidence` on its marker word (CERTAIN by default). */
const stub = (key, marker, extra, confidence = CONFIDENCE.CERTAIN) => ({
  key, label: `stub ${key}`, version: 1, contract: CONTRACT.SUBSTANCE,
  detect: (ctx) => (String(ctx.text || "").includes(marker)
    ? { match: true, confidence, signals: [marker] } : { match: false }),
  parse: () => ({ entities: [], facts: { read_by: key } }),
  assess: () => ({ meaningful: false, events: [], confirmed: null, why: "stub" }),
  ...(extra || {}),
});

test("R36 R4 R13 R19 R35 nothing is registered by default: doctypeFor answers the stated no-type answer, never throws, and readText and assess claim nothing", async () => {
  assert.deepEqual(doctypes(), [], "this module registers no content type of its own");
  assert.ok(Object.isFrozen(NO_TYPE));
  assert.deepEqual({ ...NO_TYPE }, { key: "unregistered", label: "no content type is registered", version: 0,
                                     fallback: true, contract: CONTRACT.SUBSTANCE });
  for (const ctx of [{ text: "a letter about nothing in particular" }, { text: "" }, {}]) {
    const r = doctypeFor(ctx);
    assert.equal(r.type, NO_TYPE);
    assert.deepEqual([r.confidence, r.signals, r.considered, r.also], [CONFIDENCE.NONE, [], [], []]);
    assert.match(r.why, /no content type is registered/);
  }
  // readText: a determined reading with no reader, stated (R19)
  const t = readText("a letter about nothing in particular", {});
  assert.deepEqual([t.determined, t.doctype.type, t.parsed], [true, NO_TYPE, null]);
  assert.match(t.parse_error, /unregistered content type declares no reader/);
  // assess: the substance differs and nothing is claimed about it (R13)
  const a = await assess(enc("<p>one</p>"), enc("<p>two</p>"), { sha256 });
  assert.deepEqual([a.content_type, a.verdict, a.meaningful, a.events, a.stopped_at],
                   ["unregistered", "changed", null, [], "L5_meaning"]);
  assert.match(a.why, /declares no reader/);
  // what does not reach L4 is unchanged by an empty registry
  assert.equal((await assess(enc("<p>one</p>"), enc("<p>one</p>"), { sha256 })).verdict, "identical");
});

test("R36 R4 R5 the seam: registerDoctype appends a new key, replaces a held key in its own slot, refuses a malformed member; the order decides", () => {
  assert.equal(typeof registerDoctype, "function");
  // a refused member: stated, never thrown, registry unchanged
  for (const bad of [null, 3, {}, { key: "" }, { key: 7, detect() {} }, { key: "x" }, { key: "x", detect: 1 }]) {
    const r = registerDoctype(bad);
    assert.equal(r.ok, false);
    assert.match(r.why, /./);
  }
  assert.deepEqual(doctypes(), []);
  // three new keys, appended in the order given; the fallback last, as a composer registers it
  const first = stub("stub_first", "FIRST");
  const second = stub("stub_second", "SECOND");
  const fallback = stub("stub_fallback", "\u0000never", { fallback: true });
  for (const t of [first, second, fallback]) assert.deepEqual(registerDoctype(t), { ok: true, key: t.key, replaced: false });
  assert.deepEqual(doctypes().map((t) => t.key), ["stub_first", "stub_second", "stub_fallback"]);
  // a held key is replaced in its own slot: the order is unchanged and the new member answers
  const first2 = stub("stub_first", "ONE");
  assert.deepEqual(registerDoctype(first2), { ok: true, key: "stub_first", replaced: true });
  assert.deepEqual(doctypes().map((t) => t.key), ["stub_first", "stub_second", "stub_fallback"]);
  assert.equal(doctypes()[0], first2);
  assert.equal(doctypeFor({ text: "ONE" }).type, first2);
  assert.equal(doctypeFor({ text: "FIRST" }).type, fallback, "the replaced member answers nothing now");
  // registering the same member again registers nothing new
  assert.deepEqual(registerDoctype(first2), { ok: true, key: "stub_first", replaced: true });
  assert.equal(doctypes().length, 3);
  // two CERTAIN: the earlier slot wins (R4), and also names the other (R5)
  const both = doctypeFor({ text: "SECOND ONE" });
  assert.deepEqual([both.type, both.confidence], [first2, CONFIDENCE.CERTAIN]);
  assert.deepEqual(both.also.map((x) => x.key), ["stub_second"]);
  // no CERTAIN: the highest-confidence match wins, wherever it is registered (R4)
  assert.equal(registerDoctype(stub("stub_possible", "MAYBE", null, CONFIDENCE.POSSIBLE)).ok, true);
  assert.equal(registerDoctype(stub("stub_likely", "MAYBE", null, CONFIDENCE.LIKELY)).ok, true);
  const best = doctypeFor({ text: "MAYBE" });
  assert.deepEqual([best.type.key, best.confidence], ["stub_likely", CONFIDENCE.LIKELY]);
  assert.deepEqual(best.considered.map((c) => c.key), ["stub_possible", "stub_likely"]);
  assert.deepEqual(best.also.map((x) => x.key), ["stub_possible"]);
  // readText reads with the registered member
  assert.deepEqual(readText("SECOND", {}).parsed.facts, { read_by: "stub_second" });
  // the registered fallback answers what nothing recognises
  const none = doctypeFor({ text: "nothing at all" });
  assert.deepEqual([none.type, none.confidence], [fallback, CONFIDENCE.NONE]);
  assert.match(none.why, /no registered content type recognised/);
});

test("R4 R13 R19 R35 with the fallback replaced by a type that is not one, doctypeFor answers the stated no-type answer again", async () => {
  assert.equal(registerDoctype(stub("stub_fallback", "GENERIC-STUB")).ok, true);
  assert.ok(!doctypes().some((t) => t.fallback === true));
  const r = doctypeFor({ text: "a letter about nothing in particular" });
  assert.deepEqual([r.type, r.confidence], [NO_TYPE, CONFIDENCE.NONE]);
  assert.match(r.why, /no content type is registered/);
  // a type that does recognise still wins (R4)
  assert.equal(doctypeFor({ text: "GENERIC-STUB" }).type.key, "stub_fallback");
  const a = await assess(enc("<p>one</p>"), enc("<p>two</p>"), { sha256 });
  assert.deepEqual([a.content_type, a.meaningful], ["unregistered", null]);
});

test("R37 readText hands the reader the supplied structure as ctx.supplied, unchanged: pages (an empty one included), markers, images, ocr, typed cells; null for a bare string", () => {
  let seen = null;
  assert.equal(registerDoctype(stub("stub_structure", "STRUCT-STUB", {
    parse: (ctx) => { seen = ctx; return { entities: [], facts: {} }; } })).ok, true);
  const supplied = {
    document: "STRUCT-STUB page one",
    pages: [{ page: 0, text: "STRUCT-STUB page one", undetermined: [] },
            { page: 1, text: "", undetermined: [{ reason: "no_text_layer", count: 1 }] }],
    undetermined: [{ reason: "no_text_layer", count: 1, page: 1 }],
    images: [{ page: 1, width: 1700, height: 2200 }],
    ocr: { pages: [{ page: 1, text: "Fund 1010 General Purpose" }], engine: "tesseract" },
    cells: [{ sheet: "Budget", ref: "B2", type: "n", value: "1250.00", formula: "SUM(B3:B9)", cached: "1250.00" }],
    counts: { chars: 20, undetermined: 1 },
  };
  const frozen = JSON.stringify(supplied);
  const r = readText(supplied, {});
  assert.equal(r.determined, true);
  assert.equal(r.doctype.type.key, "stub_structure");
  assert.equal(seen.supplied, supplied, "the very object the caller gave");
  assert.equal(JSON.stringify(seen.supplied), frozen, "unchanged");
  assert.equal(seen.supplied.pages[1].text, "", "the page with no text layer is there");
  for (const k of ["undetermined", "images", "ocr", "cells"]) assert.deepEqual(seen.supplied[k], JSON.parse(frozen)[k], k);
  assert.equal(seen.text, "STRUCT-STUB page one");
  assert.equal(typeof seen.locate, "function");
  // a caller's own ctx.supplied never stands in for the text's structure
  readText(supplied, { supplied: { forged: true } });
  assert.equal(seen.supplied, supplied);
  // a bare string carries no structure
  readText("STRUCT-STUB plain", { supplied: { forged: true } });
  assert.equal(seen.supplied, null);
  // a sheet's paragraphs-only shape too
  const sheet = { paragraphs: [{ para: 0, text: "STRUCT-STUB" }], cells: supplied.cells };
  readText(sheet, {});
  assert.equal(seen.supplied, sheet);
});

test("R36 R30 the shared helper practiceValue carries the unit a profile counts in, so no reader counts business days as calendar days", () => {
  const view = (fact) => ({ practice: { minutes_due_days: fact } });
  assert.deepEqual(dp.practiceValue({ view: view({ value: 10, count: "business", basis: "OMC 2.20.160" }) }, "minutes_due_days"),
                   { value: 10, basis: "OMC 2.20.160", count: "business" });
  assert.deepEqual(dp.practiceValue({ view: view({ value: 21, basis: "m" }) }, "minutes_due_days"),
                   { value: 21, basis: "m", count: null }, "no stated unit is stated as none, never assumed");
  for (const bad of [{ value: 0 }, { value: 2.5 }, { value: "10" }, null])
    assert.equal(dp.practiceValue({ view: view(bad) }, "minutes_due_days"), null);
  assert.equal(dp.practiceValue({ view: {} }, "minutes_due_days"), null);
});
