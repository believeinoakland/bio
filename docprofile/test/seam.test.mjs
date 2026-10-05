/* docprofile — the registry seam (T33-12; K1513), at the module's interface: everything
 * through `docprofile/registry.mjs`. The registry is seeded with this module's own seven
 * types; `registerDoctype` is the `register` that `doctypes.registerDoctypes` is handed
 * (wired by `plane`). Types registered here are stubs, never `doctypes`' (a later
 * module). This file runs in its own process, so its registrations reach no other suite.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import * as dp from "../registry.mjs";

const { doctypeFor, doctypes, registerDoctype, readText, assess, NO_TYPE, CONFIDENCE, CONTRACT } = dp;
const enc = (s) => new TextEncoder().encode(s);
const sha256 = async (b) => createHash("sha256").update(b).digest("hex");
const SEEDED = ["meeting_calendar", "meeting_minutes", "meeting_agenda", "staff_report", "regulation",
                "staff_directory", "generic"];

/* A stub type: CERTAIN on its marker word, reading one entity per line naming it. */
const stub = (key, marker, extra) => ({
  key, label: `stub ${key}`, version: 1, contract: CONTRACT.SUBSTANCE,
  detect: (ctx) => (String(ctx.text || "").includes(marker)
    ? { match: true, confidence: CONFIDENCE.CERTAIN, signals: [marker] } : { match: false }),
  parse: () => ({ entities: [], facts: { read_by: key } }),
  assess: () => ({ meaningful: false, events: [], confirmed: null, why: "stub" }),
  ...(extra || {}),
});

test("R36 the seam: seeded with the seven types in their deciding order; registerDoctype replaces by key in place, appends a new key, refuses a malformed member", () => {
  assert.deepEqual(doctypes().map((t) => t.key), SEEDED);
  assert.equal(typeof registerDoctype, "function");
  // a refused member: stated, never thrown, registry unchanged
  for (const bad of [null, 3, {}, { key: "" }, { key: 7, detect() {} }, { key: "x" }, { key: "x", detect: 1 }]) {
    const r = registerDoctype(bad);
    assert.equal(r.ok, false);
    assert.match(r.why, /./);
  }
  assert.deepEqual(doctypes().map((t) => t.key), SEEDED);
  // a held key is replaced in its own slot: the order is unchanged and the new member answers
  const minutes = stub("meeting_minutes", "MINUTES-STUB");
  assert.deepEqual(registerDoctype(minutes), { ok: true, key: "meeting_minutes", replaced: true });
  assert.deepEqual(doctypes().map((t) => t.key), SEEDED);
  assert.equal(doctypes()[1], minutes);
  assert.equal(doctypeFor({ text: "MINUTES-STUB" }).type, minutes);
  // registering the same member again registers nothing new
  assert.deepEqual(registerDoctype(minutes), { ok: true, key: "meeting_minutes", replaced: true });
  assert.equal(doctypes().length, SEEDED.length);
  // a new key is appended, and recognised
  const extra = stub("stub_extra", "EXTRA-STUB");
  assert.deepEqual(registerDoctype(extra), { ok: true, key: "stub_extra", replaced: false });
  assert.deepEqual(doctypes().map((t) => t.key), [...SEEDED, "stub_extra"]);
  const d = doctypeFor({ text: "EXTRA-STUB" });
  assert.equal(d.type, extra);
  assert.equal(d.confidence, CONFIDENCE.CERTAIN);
  // a document both stubs recognise: the earlier slot wins (R4), and also names the other (R5)
  const both = doctypeFor({ text: "MINUTES-STUB EXTRA-STUB" });
  assert.equal(both.type.key, "meeting_minutes");
  assert.ok(both.also.some((x) => x.key === "stub_extra"));
  // readText reads with the registered member
  assert.deepEqual(readText("EXTRA-STUB", {}).parsed.facts, { read_by: "stub_extra" });
  // the seeded fallback still answers what nothing recognises
  assert.equal(doctypeFor({ text: "nothing at all" }).type.key, "generic");
});

test("R4 R13 R19 R35 with no fallback registered, doctypeFor answers the stated no-type answer, never throws, and readText and assess claim nothing", async () => {
  // replace the fallback with a type that is not one: no registered type is a fallback now
  assert.equal(registerDoctype(stub("generic", "GENERIC-STUB")).ok, true);
  assert.ok(!doctypes().some((t) => t.fallback === true));
  assert.ok(Object.isFrozen(NO_TYPE));
  assert.equal(NO_TYPE.fallback, true);
  assert.equal(NO_TYPE.contract, CONTRACT.SUBSTANCE);
  const r = doctypeFor({ text: "a letter about nothing in particular" });
  assert.equal(r.type, NO_TYPE);
  assert.equal(r.confidence, CONFIDENCE.NONE);
  assert.match(r.why, /no content type is registered/);
  assert.deepEqual(r.also, []);
  // a type that does recognise still wins (R4)
  assert.equal(doctypeFor({ text: "GENERIC-STUB" }).type.key, "generic");
  // readText: a determined reading with no reader, stated (R19)
  const t = readText("a letter about nothing in particular", {});
  assert.equal(t.determined, true);
  assert.equal(t.doctype.type, NO_TYPE);
  assert.equal(t.parsed, null);
  assert.match(t.parse_error, /unregistered content type declares no reader/);
  // assess: the substance differs and nothing is claimed about it (R13)
  const a = await assess(enc("<p>one</p>"), enc("<p>two</p>"), { sha256 });
  assert.equal(a.content_type, "unregistered");
  assert.equal(a.verdict, "changed");
  assert.equal(a.meaningful, null);
  assert.deepEqual(a.events, []);
  assert.match(a.why, /declares no reader/);
  assert.equal(a.stopped_at, "L5_meaning");
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
