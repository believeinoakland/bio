/* actions' T17 entry at its interface: DEC-13's request for comment (N396, K573; R44 as proposed in ACTIONS #4 J1, with
   R1's refusal and R37's audit). Converted from `test/action-loop.test.mjs` section 8, and its non-response arm of
   section 5, over the same shapes: the write through promotion, the audit through `audit`, the read through
   `actionRead`, the precedent from this module's exports. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, V, actionMd, CP, NOW_MS } from "./fixture.mjs";
import * as actions from "../../../src/actions/index.mjs";

const M = V("alice");
const INQ = "INQ-2026-0001-transfer";
const INFO = "INFO-2026-0001-memo";
const RFC = "ACTN-2026-0001-rfc";
/* The response window: dated after the fixture's instance clock (2026-09-28), so no past-due finding enters. */
const WINDOW = ["clock:", '  - text: "Response due"', '    description: "The window the group gave for a reply."',
  "    date: 2026-10-15", '    basis: "The group\'s own decision"', "    status: pending"];
const leg = (target, kind) => [`  - target: ${target}`, `    kind: ${kind}`];
const rfcMd = (id, { legs = [], clock = WINDOW } = {}) =>
  actionMd(id, [...CP, "action_kind: request_for_comment", ...(legs.length ? ["action_basis:", ...legs.flat()] : []), ...clock]);

/* An inquiry and a document the legs can name, held as the record's own history (a replay: their shapes are their
   modules', not this one's). */
function ground() {
  const w = world();
  const inq = ["---", `id: ${INQ}`, "object_type: inquiry", `title: ${INQ}`, "current_state: concluded",
    'created: "2026-09-01T00:00:00Z"', 'last_updated: "2026-09-01T00:00:00Z"', "---", "", "A finding.", ""].join("\n");
  assert.equal(w.promote(INQ, inq, { extra: { replay: true } }).ok, true);
  w.doc(INFO);
  return w;
}
const audit = (w, text) => w.a.audit({ files: new Map([["bundle.md", text]]) });
const errors = (f) => f.filter((x) => x.severity === "error");

test("R44 R1 R37 a request for comment naming no inquiry is refused at the write and reported by the audit, by name", () => {
  const w = ground();
  const vague = rfcMd(RFC);
  const f = errors(audit(w, vague));
  assert.equal(f.length, 1, JSON.stringify(f));
  assert.equal(f[0].check, "C-2.10");
  assert.match(f[0].message, /request_for_comment names ZERO inquiries/);
  assert.match(f[0].message, /nothing to answer/, "it says why: without specifics there is nothing to answer");
  const r = w.promote(RFC, vague);
  assert.deepEqual([r.ok, r.reason], [false, "ACTION_BASIS_REFUSED"]);
  assert.deepEqual(r.findings.map((x) => [x.check, /ZERO inquiries/.test(x.detail)]), [["C-2.10", true]]);
  assert.equal(w.record.head(RFC), null, "nothing was written");
});

test("R44 only an advances leg onto an inquiry is a disclosed inquiry: a rests_on leg, or an advances leg onto a document, is not", () => {
  const w = ground();
  for (const legs of [[leg(INQ, "rests_on")], [leg(INFO, "advances")], [leg(INFO, "rests_on"), leg(INQ, "rests_on")]]) {
    const text = rfcMd(RFC, { legs });
    assert.ok(errors(audit(w, text)).some((x) => /ZERO inquiries/.test(x.message)), JSON.stringify(legs));
    assert.equal(w.promote(RFC, text).reason, "ACTION_BASIS_REFUSED", JSON.stringify(legs));
  }
  /* a finding the request is built on may sit beside the disclosed inquiry. */
  const both = rfcMd(RFC, { legs: [leg(INFO, "rests_on"), leg(INQ, "advances")] });
  assert.deepEqual(errors(audit(w, both)), []);
  assert.equal(w.promote(RFC, both).ok, true);
});

test("R44 R1 R29 a request for comment naming the inquiry it put, with its window, is accepted: the disclosed question is a row", () => {
  const w = ground();
  const named = rfcMd(RFC, { legs: [[...leg(INQ, "advances"), '    note: "put to the office as a specific claim"']] });
  assert.deepEqual(audit(w, named), [], "the audit finds nothing");
  const p = w.promote(RFC, named);
  assert.equal(p.ok, true, JSON.stringify(p).slice(0, 300));
  const a = w.a.actionRead({ id: RFC, viewer: M });
  assert.deepEqual(a.legs.map((l) => [l.target, l.kind, l.target_type]), [[INQ, "advances", "inquiry"]],
    "'we contacted them' and 'we put this claim to them' are different rows");
  assert.equal(a.kind, "request_for_comment");
  assert.equal(a.clock_next, "2026-10-15");
  /* a revision that drops the disclosed inquiry is refused as a creation would be. */
  const dropped = w.text(RFC).replace(/action_basis:\n  - target: INQ-2026-0001-transfer\n    kind: advances\n    note: "[^"]*"\n/, "");
  assert.notEqual(dropped, w.text(RFC));
  assert.equal(w.promote(RFC, dropped).reason, "ACTION_BASIS_REFUSED");
  assert.equal(w.a.actionRead({ id: RFC, viewer: M }).legs.length, 1, "the held version stands");
});

test("R44 R1 R37 a request for comment stating no response window is refused at the write and reported by the audit", () => {
  const w = ground();
  const noWindow = rfcMd(RFC, { legs: [leg(INQ, "advances")], clock: [] });
  const f = errors(audit(w, noWindow));
  assert.equal(f.length, 1, JSON.stringify(f));
  assert.equal(f[0].check, "C-2.10");
  assert.match(f[0].message, /states the response window it gave/);
  const r = w.promote(RFC, noWindow);
  assert.deepEqual([r.reason, r.findings.length], ["ACTION_BASIS_REFUSED", 1]);
  assert.match(r.findings[0].detail, /response window/);
  /* both missing: each part is named. */
  const neither = w.promote(RFC, rfcMd(RFC, { clock: [] }));
  assert.equal(neither.reason, "ACTION_BASIS_REFUSED");
  assert.deepEqual(neither.findings.map((x) => /ZERO inquiries/.test(x.detail) ? "inquiry" : /response window/.test(x.detail) ? "window" : "?"),
    ["inquiry", "window"]);
});

test("R44 the window's length is the group's: no range is enforced, and the GAO precedent is exported as a citation marked not enforced", () => {
  const w = ground();
  const at = (date, i) => {
    const id = `ACTN-2026-00${10 + i}-rfc`;
    const text = rfcMd(id, { legs: [leg(INQ, "advances")], clock: ["clock:", '  - text: "Response due"',
      '    description: "A window chosen by the group."', `    date: ${date}`, '    basis: "The group\'s own decision"',
      "    status: pending"] });
    return { audit: errors(audit(w, text)), write: w.promote(id, text).ok };
  };
  /* a day after the instance clock, the precedent's own bounds, and far outside them: all land, none reported. */
  for (const [i, date] of ["2026-09-29", "2026-10-05", "2026-10-28", "2026-12-01", "2027-09-28"].entries())
    assert.deepEqual(at(date, i), { audit: [], write: true }, date);
  const p = actions.RFC_RESPONSE_WINDOW_PRECEDENT;
  assert.deepEqual([p.min_days, p.max_days, p.enforced], [7, 30, false]);
  assert.match(p.source, /GAO/);
  assert.equal(Date.parse("2026-09-28T12:00:00Z"), NOW_MS, "the fixture's clock the dates above are read against");
});

test("R44 R10 another kind is not asked: a records request naming no inquiry and no window lands", () => {
  const w = ground();
  const rr = actionMd("ACTN-2026-0002-rr", [...CP, "action_kind: records_request"]);
  assert.deepEqual(errors(audit(w, rr)), []);
  assert.equal(w.promote("ACTN-2026-0002-rr", rr).ok, true);
  assert.ok(w.a.kinds().includes("request_for_comment"), "the product offers the kind on every instance");
  assert.ok(actions.actionKinds(null).includes("request_for_comment"));
});

test("R44 R15 R34 a non-response to a request for comment is recorded with its date, as a named member's account", () => {
  const w = ground();
  assert.equal(w.promote(RFC, rfcMd(RFC, { legs: [leg(INQ, "advances")] })).ok, true);
  const sent = w.a.actionCorrespond({ target: RFC, direction: "sent", at: "2026-09-28", account: "the request went to the office",
                                      viewer: M, author: M });
  assert.equal(sent.ok, true);
  const s = w.doc("INFO-2026-0002-letter");
  const bytes = w.a.actionCorrespond({ target: RFC, direction: "no_response", at: "2026-10-15", artifactSha: s, viewer: M, author: M });
  assert.equal(bytes.reason, "NO_RESPONSE_HAS_NO_BYTES", "nothing arrived, so there is nothing to hash");
  const none = w.a.actionCorrespond({ target: RFC, direction: "no_response", at: "2026-10-15", party: "Town Clerk",
    account: "The window closed with no response to the request.", viewer: M, author: M });
  assert.deepEqual([none.ok, none.direction, none.at, none.held_as, none.author], [true, "no_response", "2026-10-15", "testimony", M]);
  const ledger = w.a.actionRead({ id: RFC, viewer: M }).correspondence;
  assert.deepEqual(ledger.map((e) => [e.ord, e.direction, e.at, e.author]),
    [[0, "sent", "2026-09-28", M], [1, "no_response", "2026-10-15", M]]);
});
