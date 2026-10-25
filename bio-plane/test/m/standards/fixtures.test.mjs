/* standards' published fixtures (fixtures.mjs) checked against the module's real answers, and the contract run for the
   refusals law-relations' host hands it (fix-round 10, K4990, K4993, K5044). */
import { test } from "node:test";
import assert from "node:assert/strict";
import * as F from "./fixtures.mjs";
import { seeded, V, REASON } from "./fixture.mjs";

const CHECKS = ["ok", "reason", "code", "check", "translation", "detail"];
const rest = (r) => Object.fromEntries(Object.entries(r).filter(([k]) => !CHECKS.includes(k)));

test("R43 fixture bindsAt: the real answer for a body that issued the standard in force, binds, and for another body, which it does not", () => {
  const f = F.bindsAt();
  assert.equal(f.binds.ok, true);
  assert.deepEqual([f.binds.standard, f.binds.body, f.binds.date, f.binds.state], [f.standard, f.body, f.date, "binds"]);
  assert.ok(f.binds.rests_on.some((x) => x.issuer === f.body), "names the issuer it rests on");
  assert.equal(f.other.body, f.elsewhere);
  assert.notEqual(f.other.state, "binds", "a law binds only the body that issued it, one adopted it or one imposes it");
  /* the same answer the module gives asked directly */
  const w = seeded();
  assert.equal(w.s.bindsAt({ standard: "STD-2026-9999-x", body: f.body, date: f.date, viewer: F.MEMBER }).reason, "NO_SUCH_STANDARD");
});

test("R5 R17 fixture standardRead: a held policy read with its fields, and NO_SUCH_STANDARD for an absent id and for a viewer naming no member", () => {
  const f = F.standardRead();
  const r = f.read;
  assert.equal(r.ok, true);
  assert.equal(r.id, f.id);
  assert.deepEqual([r.designation, r.edition, r.access, r.issuer, r.kind], ["AI 9.1", "2023", "free", "Public Works", "policy"]);
  assert.deepEqual(r.text, [f.contentId]);
  assert.deepEqual(r.texts.map((t) => t.content_id), [f.contentId]);
  assert.deepEqual(r.requires_quoted.map((t) => t.content_id), [f.contentId]);
  for (const a of [f.absent, f.unseen]) {
    assert.deepEqual([a.ok, a.reason, a.code], [false, "NO_SUCH_STANDARD", "NO_SUCH_STANDARD"]);
  }
  assert.equal(f.absent.standard, f.absentId);
  assert.equal(f.unseen.standard, f.id);
  assert.deepEqual(Object.keys(rest(f.unseen)).sort(), Object.keys(rest(f.absent)).sort(), "one answer to one condition");
});

test("R5 R17 fixture standardReadWorld: the real instance reads the policies a test declares, for a member and for a stranger", () => {
  const f = F.standardReadWorld();
  const p = f.policy({ cite: "Franchise Agreement" });
  const got = f.standardRead({ id: p.id, viewer: f.member });
  assert.equal(got.ok, true);
  assert.equal(got.cite, "Franchise Agreement");
  assert.equal(f.standardRead({ id: p.id, viewer: f.stranger }).reason, "NO_SUCH_STANDARD");
  assert.equal(f.standardRead({ id: "STD-2026-9999-policy", viewer: f.member }).reason, "NO_SUCH_STANDARD");
  assert.equal(f.standards.standardRead({ id: p.id, viewer: f.member }).ok, true, "the instance itself is the real one");
  assert.equal(f.declare({ cite: "Another Code § 1" }).ok, true);
});

test("R5 R8 fixture standardRow: one held standard's row (cite, kind, issuer, texts, period) and the standards list holding it", () => {
  const f = F.standardRow();
  assert.deepEqual([f.row.ok, f.row.id, f.row.cite, f.row.kind, f.row.issuer], [true, f.std, "Administrative Instruction 9.1, §2", "policy", "Public Works"]);
  assert.deepEqual(f.row.text, [f.cnt]);
  assert.deepEqual(f.row.texts.map((t) => [t.content_id, t.standing]), [[f.cnt, f.row.texts[0].standing]]);
  assert.deepEqual(f.row.period, { from: "2023-01-01", to: null });
  assert.equal(f.standards.ok, true);
  assert.deepEqual(f.standards.items.map((i) => i.id), [f.std, f.ordinance].sort());
  assert.deepEqual([f.standards.count, f.standards.truncated], [2, false]);
  assert.match(f.std, /^STD-\d{4}-\d{4}-policy$/);
});

test("R32 fixture standardsEmptyReads: standardsAt, standardsWithPortion and addressesOf over a record holding no standard", () => {
  const f = F.standardsEmptyReads();
  assert.deepEqual(f.standardsAt, { ok: true, items: [], truncated: false });
  assert.deepEqual(f.standardsWithPortion, { ok: true, items: [], truncated: false });
  assert.equal(f.addressesOf.ok, true);
  assert.deepEqual(f.addressesOf.addresses, []);
  assert.equal(f.addressesOf.truncated, false);
});

test("R8 fixture standardsIn: the real list over a record holding no standard", () => {
  const f = F.standardsIn();
  assert.equal(f.ok, true);
  assert.deepEqual(f.items, []);
  assert.deepEqual([f.count, f.truncated, f.cursor], [0, false, null]);
});

/* The refusals law-relations' host (the standards instance) hands it, each stated as data: the code and the fields it
   carries beyond the row's own (`check`, `translation`, `detail`). Each is run against the real code through the law
   ops the host serves. law-relations' hand-built refusals must equal these; the real answer has no `host` field. */
// fixtures-run: law-relations host-refusals
test("R10 R17 R23 host-refusals: the ten refusals standards gives law-relations, each with its code and its own fields, from the real code", () => {
  const w = seeded();
  const a = w.declare({ cite: "PEBL § 70" }), b = w.declare({ cite: "PEBL § 71", text: [w.passage().contentId] });
  const rel = { type: "refers_to", from: a.id, to: b.id, citation: a.text[0], reason: REASON, author: V("bob") };
  const proposed = w.s.lawPropose({ what: "relation", type: "refers_to", from: a.id, to: b.id, proposer: V("bob"), why: "because" });
  assert.equal(proposed.ok, true);
  const proposal = proposed.proposal.id;
  const adopted = w.s.lawRelate({ ...rel, proposal });
  assert.equal(adopted.ok, true);
  const rows = [
    ["STANDARD_NO_ID", w.s.lawRelationsOf({}), { op: "lawrelations" }],
    ["STANDARD_DATE_INVALID", w.s.stillStanding({ decision: a.id, date: "not-a-day" }), { date: "not-a-day" }],
    ["STANDARD_FIELD_UNKNOWN", w.s.lawRelate({ ...rel, bogus: 1 }),
     { rejected: ["bogus"], accepted: ["type", "from", "to", "citation", "effective", "edition", "reason", "author", "viewer", "proposal"] }],
    ["STANDARD_NO_REASON", w.s.lawRelate({ ...rel, reason: "" }), { max_chars: 2000 }],
    ["STANDARD_NO_SUCH_PROPOSAL", w.s.lawRelate({ ...rel, proposal: "lprop-none" }), { proposal: "lprop-none" }],
    ["STANDARD_PROPOSAL_ADOPTED", w.s.lawRelate({ ...rel, proposal }), { proposal, adopted_as: adopted.relation.id }],
    ["STANDARD_PROPOSER_UNNAMED", w.s.lawPropose({ what: "relation", why: "w" }), {}],
    ["STANDARD_WHY_INVALID", w.s.lawPropose({ what: "relation", proposer: V("bob"), why: "" }), { max: 240 }],
    ["NO_SUCH_STANDARD", w.s.lawRelate({ ...rel, from: "STD-2026-9999-x" }), { standard: "STD-2026-9999-x", id: "STD-2026-9999-x", end: "from" }],
    ["PORTION_UNKNOWN", w.s.lawRelate({ ...rel, to: { standard: b.id, portion: "9" } }), { end: "to", standard: b.id, portion: "9" }],
  ];
  for (const [code, got, fields] of rows) {
    assert.equal(got.ok, false, code);
    assert.deepEqual([got.reason, got.code], [code, code], code);
    assert.equal(typeof got.detail, "string", `${code} says what it refused`);
    assert.ok(got.detail.length > 0, code);
    assert.equal(got.host, undefined, `${code}: the real answer has no host field`);
    assert.deepEqual(rest(got), fields, code);
  }
});
