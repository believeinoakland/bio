/* action-holds' T51 requirements at their interface: R18 (N858 D8, D10; DEC-340, U366) `pressureFor` rows carry `by` and
   `hold`, and, called with an action, `facts`: the governing view's `threat_letter` legal facts for its kind; R19 (N858
   D10; DEC-340) `holdsDue` served as `op=holdsdue` and `holdsOf` taking `{docket_entry}`. Each with its control (K874). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, V, received } from "./fixture.mjs";
import * as holds from "../../../src/action-holds/index.mjs";
import { word } from "../../../src/setup-words/index.mjs";

const A = "ACTN-2026-0001-a", B = "ACTN-2026-0002-b", C = "ACTN-2026-0003-c";
const M = V("alice"), BOB = V("bob");
const view = (...legal_facts) => ({ ok: true, view: { legal_facts } });
const FACT = { key: "anti_slapp", trigger: "threat_letter", statement: "a statement", citation: "a citation", status: "researched",
               basis: "a basis", profile: "oakland-alameda" };
const asked = (f) => ({ key: f.key, statement: f.statement, citation: f.citation, status: f.status, basis: f.basis, profile: f.profile });

test("R18 pressureFor with an action states the governing view's threat_letter facts for its kind once, each with its source and the label, only when the action holds a legal mark; a retaliation mark alone states none", () => {
  const group = { key: "group_rule", trigger: "threat_letter", statement: "the team's rule", citation: "a rule", status: "researched",
                  basis: "2026-10-01 GR-1", profile: "group" };
  const facts = [
    FACT,
    { ...FACT, key: "anti_slapp", statement: "a second entry of the same key" },
    { ...FACT, key: "kind_fact", applies_to: ["records_request"] },
    { ...FACT, key: "other_kind", applies_to: ["bylaw_complaint"] },
    { ...FACT, key: "recording", trigger: "recording" },
    group];
  const w = world({ holds: { localFacts: { governingView: () => view(...facts) } } });
  w.action(A, received(2));
  w.action(B, received(1));
  w.mark(A, 0, "legal");
  w.mark(B, 0, "retaliation");
  const r = w.h.pressureFor({ action: A, viewer: M });
  assert.deepEqual(r.facts, [asked(FACT), asked({ ...FACT, key: "kind_fact" }), asked(group)], "the kind's facts and the group's, each once");
  assert.equal(r.label, word("guide.procedure.legalinfo"));
  assert.ok(!JSON.stringify(r.facts).includes("other_kind") && !JSON.stringify(r.facts).includes("recording"));
  /* control: a retaliation mark alone answers no fact */
  const none = w.h.pressureFor({ action: B, viewer: M });
  assert.deepEqual([none.ok, none.facts, "label" in none], [true, [], false]);
  /* control: without an action no fact is stated */
  assert.ok(!("facts" in w.h.pressureFor({ viewer: M })));
  /* a profile holding no threat_letter fact answers none for a legal mark */
  const w2 = world({ holds: { localFacts: { governingView: () => view({ ...FACT, trigger: "recording" }) } } });
  w2.action(A, received(1));
  w2.mark(A, 0, "legal");
  assert.deepEqual(w2.h.pressureFor({ action: A, viewer: M }).facts, []);
});

test("R18 a governingView that cannot be read answers facts null with why, never an empty list", () => {
  for (const governingView of [() => ({ ok: false, errors: [] }), () => { throw new Error("down"); }, () => null]) {
    const w = world({ holds: { localFacts: { governingView } } });
    w.action(A, received(1));
    w.mark(A, 0, "legal");
    const r = w.h.pressureFor({ action: A, viewer: M });
    assert.deepEqual([r.ok, r.facts, r.facts_why.reason], [true, null, "GOVERNING_VIEW_UNREADABLE"]);
    assert.equal(r.items.length, 1, "the marks are still answered");
  }
});

test("R18 pressureFor rows carry by and hold: the latest statement at a mark's entry or placed from it, and at a record placed from it; null while none", () => {
  const w = world({ holds: { localFacts: { governingView: () => view(FACT) } } });
  const P = w.project("alice");
  w.action(A, [`project: ${P}`, ...received(2)]);
  w.mark(A, 0, "legal");
  w.mark(A, 1, "other");
  const rec = w.h.pressureRecord({ project: P, pressure: { kind: "legal", note: "a letter" }, account: "post", at: "2026-09-20", viewer: M, author: M });
  assert.equal(rec.ok, true);
  const rows = () => w.h.pressureFor({ project: P, viewer: M }).items;
  assert.deepEqual(rows().map((x) => [x.by, x.hold]), [[M, null], [M, null], [M, null]]);
  assert.equal(w.h.actionHold({ target: A, ord: 0, hold: "in_place", reason: "keep", viewer: M, author: M }).ok, true);
  assert.deepEqual(rows().map((x) => x.hold), ["in_place", null, null], "a hold at the mark's entry");
  assert.equal(w.h.actionHold({ project: P, from: { pressure: rec.pressure }, hold: "in_place", reason: "keep", viewer: M, author: M }).ok, true);
  assert.deepEqual(rows().map((x) => x.hold), ["in_place", null, "in_place"], "a hold placed from the record");
  w.clock.ms += 1000;
  assert.equal(w.h.actionHoldRelease({ target: A, ord: 0, reason: "done", viewer: M, author: M }).ok, true);
  assert.deepEqual(rows().map((x) => x.hold), ["released", null, "in_place"], "the latest statement stands");
  assert.deepEqual(w.h.pressureFor({ action: A, viewer: M }).items.map((x) => x.hold), ["released", null]);
});

function docketOver(w, marks) {
  return {
    docketPressureMarks({ kind = null, after = null } = {}) {
      return { ok: true, marks: marks.filter((m) => m.mark > (Number(after) || 0) && (!kind || m.kind === kind)), cursor: null };
    },
    docketPressureOf({ entry = null, viewer = null } = {}) {
      const m = marks.find((x) => x.entry === entry);
      if (!m || w.membership.sight(m.project, viewer) !== "full")
        return { ok: false, reason: "NO_SUCH_DOCKET_ENTRY", detail: "no record entry you see answers by that id" };
      const { mark, ...rest } = m;
      return { ok: true, ...rest };
    },
  };
}

test("R19 holdsDue is served as op=holdsdue and answers exactly what holdsDue answers: a legal mark with no hold is in it; after a hold from it, it is not; an invisible action's mark is in no page", () => {
  const w = world();
  const P = w.project("alice");
  const marks = [{ mark: 1, entry: "DKT-2026-0001", case: "CASE-2026-0001", project: P, kind: "legal", note: "a letter", at: "2026-09-20T10:00:00Z" }];
  const h = holds.actionHoldsOf({ storage: w.st }, { record: w.record, membership: w.membership, docket: docketOver(w, marks),
                                                     doorbell: null, ratification: null, now: () => w.clock.ms });
  w.action(A, [`project: ${P}`, ...received(1)]);
  w.action(C, [`project: ${w.project("carol")}`, ...received(1)], { author: V("carol") });
  for (const [id, who] of [[A, M], [C, V("carol")]])
    assert.equal(h.actionPressure({ target: id, ord: 0, pressure: { kind: "legal", note: "a suit" }, viewer: who, author: who }).ok, true);
  const op = (q, viewer = M) => holds.actionHoldsOps(h, new URL(`https://x/?${q}&viewer=${viewer}`), null).holdsdue();
  assert.deepEqual(op(""), h.holdsDue({ viewer: M }));
  assert.deepEqual(op("limit=1"), h.holdsDue({ limit: 1, viewer: M }));
  const first = op("limit=1");
  assert.deepEqual(op(`limit=1&after=${encodeURIComponent(first.cursor)}`), h.holdsDue({ limit: 1, after: first.cursor, viewer: M }));
  const arrived = (r) => r.items.map((x) => x.arrived);
  assert.deepEqual(arrived(op("")), [{ action: A, ord: 0 }, { docket_entry: "DKT-2026-0001", case: "CASE-2026-0001" }]);
  for (const x of op("").items) assert.ok("note" in x && "marked_at" in x && "marked_by" in x && "project" in x);
  /* control: carol's action is in no page of alice's, and alice's items are in none of bob's */
  assert.ok(!JSON.stringify(op("")).includes(C));
  assert.deepEqual(op("", BOB).items, []);
  /* a hold placed from the mark takes it off */
  assert.equal(h.actionHold({ project: P, from: { docket_entry: "DKT-2026-0001" }, hold: "in_place", reason: "keep", viewer: M, author: M }).ok, true);
  assert.deepEqual(arrived(op("")), [{ action: A, ord: 0 }]);
});

test("R19 holdsOf takes {docket_entry}: the place of a docket legal mark is its case's project; an entry the viewer may not see, or marked otherwise, is no place; two places are refused", () => {
  const w = world();
  const P = w.project("alice");
  const marks = [
    { mark: 1, entry: "DKT-2026-0001", case: "CASE-2026-0001", project: P, kind: "legal", note: "a letter", at: "t" },
    { mark: 2, entry: "DKT-2026-0002", case: "CASE-2026-0001", project: P, kind: "retaliation", note: "cut", at: "t" }];
  const h = holds.actionHoldsOf({ storage: w.st }, { record: w.record, membership: w.membership, docket: docketOver(w, marks),
                                                     doorbell: null, ratification: null, now: () => w.clock.ms });
  const of = (x, viewer = M) => h.holdsOf({ viewer, ...x });
  assert.deepEqual(of({ docket_entry: "DKT-2026-0001" }), { ok: true, project: P, docket_entry: "DKT-2026-0001", holds: [], hold: null, notices: [] });
  assert.equal(h.actionHold({ project: P, from: { docket_entry: "DKT-2026-0001" }, hold: "in_place", reason: "keep", viewer: M, author: M }).ok, true);
  const after = of({ docket_entry: "DKT-2026-0001" });
  assert.deepEqual([after.hold, after.holds.length, after.holds[0].from], ["in_place", 1, { docket_entry: "DKT-2026-0001" }]);
  assert.deepEqual(after.holds, of({ project: P }).holds, "the project's place, read by the entry");
  /* controls */
  const unseen = of({ docket_entry: "DKT-2026-0001" }, BOB), absent = of({ docket_entry: "DKT-404" });
  assert.deepEqual([unseen.ok, unseen.reason], [false, "NO_SUCH_DOCKET_ENTRY"]);
  assert.deepEqual([unseen.reason, unseen.detail], [absent.reason, absent.detail], "invisible and absent alike");
  assert.deepEqual([of({ docket_entry: "DKT-2026-0002" }).reason], ["HOLD_PLACE_REFUSED"]);
  assert.equal(of({ docket_entry: "DKT-2026-0001", project: P }).reason, "HOLD_PLACE_REFUSED", "two places");
});
