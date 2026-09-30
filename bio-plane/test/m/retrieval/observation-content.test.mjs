/* retrieval: what it answers about content-level observation rows (R24, R36–R39, R42), at the module's interface.
 *
 * Converted from the old battery's `test/observation-content.test.mjs` (REC-94, REC-109, REC-110). Its retrieval share:
 * `contentAxis` over a held capture nothing has extracted and over one extracted twice (§C5, §D2, §D2b), the content
 * frontier built and tallied (§E1, §E2), the re-extraction candidate list (§E4–§E4c) and a re-extraction's latest row
 * (§F), and D-385's truncation for a viewer the gate narrows, with the page and the viewers byte-identical (§G). The
 * rows are written as extraction's promote-time writer and index writer write them; the writing itself (§C1–§C4, §F1b),
 * the vocabulary's one spelling (§A) and the pure derivation (§B) are extraction's and observation-log's. */
import test from "node:test";
import assert from "node:assert/strict";
import { world, V, VOCAB } from "./fixture.mjs";
import { contentAxisFor } from "../../../src/observation-log/index.mjs";
import { FRONTIER_LIMIT_DEFAULT } from "../../../src/retrieval/index.mjs";

const FIRST = "2026-09-26T00:00:00Z";            /* the level's first row: before the fixture's clock (every registration) */
const NOT_EXTRACTED = Object.keys(VOCAB.CONTENT_AXIS_STATES)[3];

const ex = (w, c, state, extra = {}) => w.observe({ level: "content", subject_kind: "capture", subject: c.sha,
  authority_kind: "extract", authority: "INFO-1", state, result_kind: state === "PRESENT" || state === "partial" ? "reading" : null,
  result_ref: state === "PRESENT" || state === "partial" ? c.sha : null, ...extra });
const ix = (w, c, state, extra = {}) => w.observe({ level: "content", subject_kind: "capture", subject: c.sha,
  authority_kind: "derive", authority: "INFO-1", state, ...extra });

test("R24: a held capture nothing has extracted (no extract row, no reading, registered after the level's first row) answers the not-extracted member, determined, with missing_cause never_looked; an extracted one publishes its latest extract row whole, the actor who looked named, and no missing_cause", () => {
  const w = world();
  w.observe({ level: "content", subject_kind: "capture", subject: "0".repeat(64), authority_kind: "extract", state: "PRESENT", at: FIRST });
  const unread = w.cap("unread", "u"), read = w.cap("read", "r");
  w.doc("INFO-1", {}, { captures: [unread, read] });
  const a = w.retrieval.contentAxis({ captureSha: unread.sha, viewer: V("vera") });
  assert.deepEqual([a.found, a.capture_held, a.bundle_id, a.extraction, a.index, a.missing_cause],
    [true, true, "INFO-1", null, null, "never_looked"]);
  const rule = contentAxisFor({ observed: null, missingCause: "never_looked" });
  assert.deepEqual([a.indexed, a.determined, a.why], [rule.state, rule.determined, rule.why], "observation-log's rule");
  assert.deepEqual([a.indexed, a.determined], [NOT_EXTRACTED, true], "under cause (3) nobody looked is an answer");
  assert.deepEqual([a.missing_causes, a.vocabulary, a.undetermined_value],
    [VOCAB.MISSING_ROW_CAUSES, VOCAB.CONTENT_AXIS_STATES, VOCAB.CONTENT_AXIS_UNDETERMINED]);
  /* Extracted twice: first by a member, partial; then by a machine credential, whole. The latest extract row is
     published with every field, the actor class and the named actor included. */
  ex(w, read, "partial", { actor_class: "member", actor: V("ann"), condition: "tier3-pages", at: "2026-09-27T01:00:00Z" });
  const seq = ex(w, read, "PRESENT", { actor_class: "machine", actor: "credential:intake", detail: "re-extraction",
                                       at: "2026-09-27T02:00:00Z" });
  const b = w.retrieval.contentAxis({ captureSha: read.sha, viewer: V("vera") });
  assert.deepEqual(b.extraction, { state: "PRESENT", condition: null, detail: "re-extraction", authority_kind: "extract",
    authority: "INFO-1", actor_class: "machine", actor: "credential:intake", at: "2026-09-27T02:00:00Z", seq });
  assert.equal(b.missing_cause, null, "no absence to explain");
  assert.deepEqual([b.indexed, b.determined, b.index], [VOCAB.CONTENT_AXIS_UNDETERMINED, false, null],
    "extracted with no index observation: undetermined, never not-extracted");
  assert.notEqual(b.indexed, NOT_EXTRACTED);
});

test("R36, R39, R42: the content level is built — found, built, level, the default limit published, truncated, looked, never_looked, never_looked_count, tally and note; each entry the capture's latest extract row with its fields; a partial or no-text extraction is a recandidate (tier3, not drift) and a whole one is not; a re-extraction's latest row is the entry and leaves the list, while the tally still counts the earlier row", () => {
  const w = world();
  const whole = w.cap("whole", "w"), short = w.cap("short", "s"), notext = w.cap("notext", "n");
  w.doc("INFO-1", {}, { captures: [whole, short, notext] });
  ex(w, whole, "PRESENT", { at: "2026-09-27T01:00:00Z" }); ix(w, whole, "PRESENT");
  ex(w, short, "partial", { at: "2026-09-27T01:10:00Z", detail: "first extraction" });
  ex(w, notext, "LOOKED_INDETERMINATE", { condition: "text-undetermined", at: "2026-09-27T01:20:00Z" });
  const f = w.retrieval.frontier({ level: "content", viewer: V("vera") });
  for (const k of ["found", "built", "level", "limit", "truncated", "looked", "never_looked", "never_looked_count", "tally", "note"])
    assert.ok(Object.prototype.hasOwnProperty.call(f, k), k);
  assert.deepEqual([f.found, f.built, f.level, f.limit, f.truncated, f.never_looked, f.never_looked_count],
    [true, true, "content", FRONTIER_LIMIT_DEFAULT, false, [], 0]);
  assert.deepEqual(f.tally, { PRESENT: 2, partial: 1, LOOKED_INDETERMINATE: 1 }, "every row at the level, per state");
  assert.equal("NEVER_LOOKED" in f.tally, false);
  assert.deepEqual(f.looked.map((r) => r.subject), [notext.sha, short.sha, whole.sha], "newest first");
  const by = Object.fromEntries(f.looked.map((r) => [r.subject, r]));
  const s = by[short.sha];
  assert.deepEqual([s.state, s.authority_kind, s.authority, s.actor_class, s.result_kind, s.result_ref, s.detail, s.at, s.governed,
                    s.last_verified, s.unreachable_since],
    ["partial", "extract", "INFO-1", "plane", "reading", short.sha, "first extraction", "2026-09-27T01:10:00Z", false, null, null]);
  assert.deepEqual([by[notext.sha].state, by[notext.sha].condition], ["LOOKED_INDETERMINATE", "text-undetermined"]);
  /* The candidate list: the half-read and the unreadable, each with why, never the whole one. */
  assert.deepEqual([s.tier3_candidate, s.calibration_drifted, s.calibration_id, s.recandidate], [true, false, null, true]);
  assert.deepEqual([by[whole.sha].tier3_candidate, by[whole.sha].recandidate], [false, false]);
  assert.deepEqual(f.recandidates.map((r) => r.subject), [notext.sha, short.sha]);
  assert.deepEqual(f.recandidates.find((r) => r.subject === short.sha),
    { subject: short.sha, state: "partial", indexed: s.indexed, tier3_candidate: true, calibration_drifted: false,
      calibration_id: null, detail: "first extraction" });
  assert.equal(f.recandidate_count, 2);
  /* A re-extraction: the chain moved and the capture now reads whole. */
  ex(w, short, "PRESENT", { at: "2026-09-27T02:00:00Z", detail: "re-extraction" });
  const g = w.retrieval.frontier({ level: "content", viewer: V("vera") });
  const s2 = g.looked.find((r) => r.subject === short.sha);
  assert.deepEqual([g.looked.length, s2.state, s2.detail, s2.recandidate, s2.last_verified],
    [3, "PRESENT", "re-extraction", false, "2026-09-27T02:00:00Z"]);
  assert.deepEqual([g.recandidates.map((r) => r.subject), g.recandidate_count], [[notext.sha], 1]);
  assert.deepEqual(g.tally, { PRESENT: 3, partial: 1, LOOKED_INDETERMINATE: 1 }, "the earlier row is still counted");
});

test("R37, R38 (D-385): truncated describes the list the caller received — at a bound the supply exceeds but a narrowed viewer's own list does not, that viewer reads false and the entitled one true; the reverse bound reads true for both, a wide one false for both; no count of what was withheld; the page equals the unbounded read's head, and a narrowed viewer's rows are byte-identical to the entitled viewer's", () => {
  const w = world();
  const pub = [w.cap("p1", "1"), w.cap("p2", "2"), w.cap("p3", "3")];
  w.doc("INFO-1", {}, { captures: pub });
  const hid = w.cap("hid", "h");
  const proj = w.project("Private", "ann", { captures: [hid] });
  ex(w, pub[0], "PRESENT"); ex(w, hid, "PRESENT", { authority: proj }); ex(w, pub[1], "partial"); ex(w, pub[2], "LOOKED_INDETERMINATE");
  const fr = (viewer, limit) => w.retrieval.frontier({ level: "content", viewer, limit });
  const annAll = fr(V("ann"), 500), veraAll = fr(V("vera"), 500);
  /* The corpus, asserted: four captures with a row, three vera may see, the withheld one by name. */
  assert.deepEqual([annAll.looked.length, veraAll.looked.length, annAll.truncated, veraAll.truncated], [4, 3, false, false]);
  assert.ok(annAll.looked.some((r) => r.subject === hid.sha));
  assert.equal(JSON.stringify(veraAll).includes(hid.sha), false);
  /* Bound 3: the supply holds 4, vera's own list 3 — her whole entitlement, and false; ann's 4 is cut, and true. */
  const vera3 = fr(V("vera"), 3), ann3 = fr(V("ann"), 3);
  assert.deepEqual([vera3.looked.length, vera3.truncated, ann3.looked.length, ann3.truncated], [3, false, 3, true]);
  assert.deepEqual(vera3.looked.map((r) => r.subject).sort(), pub.map((c) => c.sha).sort());
  assert.equal(JSON.stringify(vera3).includes(hid.sha), false);
  /* Bound 2: vera's own list of 3 is cut, so true, as for ann; bound 4: nothing cut for either. */
  const vera2 = fr(V("vera"), 2), ann2 = fr(V("ann"), 2);
  assert.deepEqual([vera2.looked.length, vera2.truncated, ann2.looked.length, ann2.truncated], [2, true, 2, true]);
  assert.deepEqual([fr(V("vera"), 4).truncated, fr(V("ann"), 4).truncated], [false, false]);
  for (const a of [vera3, vera2, veraAll])
    assert.deepEqual(Object.keys(a).filter((k) => /withh|hidden|redact|suppress/i.test(k)), [], "no withheld count");
  /* The page is the unbounded read's head; the rows do not change with the reader, only whether they are published. */
  assert.equal(JSON.stringify(ann3.looked), JSON.stringify(annAll.looked.slice(0, 3)));
  assert.equal(JSON.stringify(vera2.looked), JSON.stringify(veraAll.looked.slice(0, 2)));
  assert.equal(JSON.stringify(veraAll.looked), JSON.stringify(annAll.looked.filter((r) => r.subject !== hid.sha)));
  assert.equal(JSON.stringify(veraAll.recandidates), JSON.stringify(annAll.recandidates.filter((r) => r.subject !== hid.sha)));
});
