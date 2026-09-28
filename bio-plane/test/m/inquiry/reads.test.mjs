/* The reads over the projection: the basis and who rests on a target (R16), the live legs (R17), an inquiry's state
   history (R19), the exclusions naming a target (R18), each gated as R33 says; the recorded subject and member agent
   (R43, R44). */
import test from "node:test";
import assert from "node:assert/strict";
import { world, inquiryMd, V } from "./fixture.mjs";
import { INQUIRY_TABLES } from "../../../src/inquiry/index.mjs";

const A = "INFO-2026-0001-a", B = "INFO-2026-0002-b";

test("R16 basisFor answers the projected legs in order; restingOn every leg naming the target, confirmed or severed by the citer's record", () => {
  const w = world(); w.doc(A); w.doc(B);
  w.inquiry("INQ-2026-0001-q", { legs: [{ target: B }, { target: A, role: "cuts_against" }] });
  w.inquiry("INQ-2026-0002-r", { legs: [{ target: A }], refs: [{ target: A, rel: "cites", status: "severed" }] });
  assert.equal(w.k.basisFor(null).reason, "NO_ID");
  assert.deepEqual(w.k.basisFor("INQ-2026-0001-q").legs.map((l) => [l.ord, l.target_id, l.role]), [[0, B, "supports"], [1, A, "cuts_against"]]);
  assert.equal(w.k.restingOn(null).reason, "NO_ID");
  assert.deepEqual(w.k.restingOn(A).dependents.map((d) => [d.bundle_id, d.ord, d.status]),
    [["INQ-2026-0001-q", 1, "confirmed"], ["INQ-2026-0002-r", 0, "severed"]]);
});

test("R17 restsOnLive: a divided citer skipped, a severed one severed, a case member's frozen, the rest confirmed", () => {
  const caseMembers = new Set();
  const w = world({ caseMembers }); w.doc(A);
  const T = "INQ-2026-0009-t";
  w.inquiry(T);
  w.inquiry("INQ-2026-0001-q", { legs: [{ target: T }] });
  w.inquiry("INQ-2026-0002-r", { legs: [{ target: T }], refs: [{ target: T, rel: "cites", status: "severed" }] });
  w.inquiry("INQ-2026-0003-s", { legs: [{ target: T }] }); caseMembers.add("INQ-2026-0003-s");
  w.inquiry("INQ-2026-0004-d", { legs: [{ target: T }] });
  w.st.sql.exec(`UPDATE bundles SET current_state='divided' WHERE bundle_id='INQ-2026-0004-d'`);
  const r = w.k.restsOnLive(T);
  assert.deepEqual(r.confirmed.map((l) => l.bundle_id), ["INQ-2026-0001-q"]);
  assert.deepEqual(r.severed.map((l) => l.bundle_id), ["INQ-2026-0002-r"]);
  assert.deepEqual(r.frozen.map((l) => l.bundle_id), ["INQ-2026-0003-s"]);
  assert.deepEqual(r.all.map((l) => l.bundle_id), ["INQ-2026-0001-q", "INQ-2026-0003-s"]);
});

test("R18 R33 exclusionsNaming answers the exclusions a viewer may see, each with its inquiry, edition, description, reason, author and date", () => {
  const w = world(); w.member("alice"); w.member("bob"); w.doc(A);
  const excl = ["completeness:", '  statement: "s"', "  author: member:alice", '  at: "2026-09-27T00:00:00Z"',
                "completeness_excluded:", `  - target: ${A}`, '    description: "the memo"', '    reason: "out of scope"'];
  w.inquiry("INQ-2026-0001-q", { extra: [...excl, "edition: 2"] });
  const rows = w.k.exclusionsNaming(A, V("bob"));
  assert.deepEqual(rows.map((r) => [r.bundle_id, r.edition, r.description, r.reason, r.author, r.at]),
    [["INQ-2026-0001-q", 2, "the memo", "out of scope", "member:alice", "2026-09-27T00:00:00Z"]]);
  assert.deepEqual(w.k.exclusionsNaming(A, null), [], "an absent viewer fails closed");
  /* an inquiry inside a project the viewer is not in is withheld */
  const P = w.project("Closed", "alice");
  w.st.sql.exec(`UPDATE bundles SET project=? WHERE bundle_id='INQ-2026-0001-q'`, P);
  w.st.sql.exec(`UPDATE bundles SET object_type='project' WHERE bundle_id='INQ-2026-0001-q'`);
  assert.deepEqual(w.k.exclusionsNaming(A, V("bob")), [], "what the viewer may not see answers as nothing");
});

test("R18 every exclusion naming the target is answered, read a page at a time, at most 500 rows per statement", () => {
  const w = world(); w.doc(A);
  const excl = ["completeness:", '  statement: "s"', "  author: member:alice", '  at: "2026-09-27T00:00:00Z"',
                "completeness_excluded:", ...Array.from({ length: 600 }, (_, i) => [`  - target: ${A}`, `    description: "d${i}"`, '    reason: "r"']).flat()];
  w.inquiry("INQ-2026-0001-q", { extra: excl });
  w.inquiry("INQ-2026-0002-r", { extra: excl.slice(0, 5 + 3 * 450) });
  const seen = [];
  const sql = w.st.sql, exec = sql.exec;
  sql.exec = (q, ...a) => { const r = exec.call(sql, q, ...a); if (/FROM inquiry_exclusions x/.test(q)) seen.push(r.length); return r; };
  const rows = w.k.exclusionsNaming(A, "admin");
  sql.exec = exec;
  assert.equal(rows.length, 1050);
  assert.ok(seen.length >= 3 && seen.every((n) => n <= 500), `pages ${seen}`);
  assert.deepEqual(rows.slice(598, 602).map((r) => [r.bundle_id, r.ord]),
    [["INQ-2026-0001-q", 598], ["INQ-2026-0001-q", 599], ["INQ-2026-0002-r", 0], ["INQ-2026-0002-r", 1]]);
});

test("R19 stateHistory answers each transition with who took it and when, so a reopened finding can say who reopened it", async () => {
  const w = world(); w.member("alice");
  w.inquiry("INQ-2026-0001-q");
  w.select("h1", ["INQ-2026-0001-q"]);
  assert.equal(w.k.dispose({ handle: "h1", to: "deferred", reason: "later", viewer: "admin", author: V("alice") }).ok, true);
  const re = w.promotion.reopen({ target: "INQ-2026-0001-q", reason: "new facts", viewer: "admin", author: V("carol") });
  assert.equal(re.ok, true, JSON.stringify(re).slice(0, 300));
  const h = w.k.stateHistory("INQ-2026-0001-q");
  assert.deepEqual(h.transitions.map((t) => [t.from, t.to, t.by, t.reason]),
    [["open", "deferred", V("alice"), "later"], ["deferred", "open", V("carol"), "new facts"]]);
  assert.ok(h.transitions.every((t) => /^\d{4}-\d{2}-\d{2}T/.test(t.at)));
  assert.equal(w.k.stateHistory(null).reason, "NO_ID");
  assert.equal(w.k.stateHistory("INQ-2026-0099-x").reason, "NO_SUCH_BUNDLE");
});

test("R33 every read naming an inquiry or project the viewer may not see answers exactly as an absent one", () => {
  const w = world(); w.member("alice"); w.member("bob");
  const P = w.project("Closed", "alice");
  assert.deepEqual(w.k.stateHistory(P, V("bob")), w.k.stateHistory("INQ-2026-0099-x", V("bob")).reason === "NO_SUCH_BUNDLE"
    ? { ok: false, reason: "NO_SUCH_BUNDLE", target: P } : null);
});

test("R12 R43 R44 subjectEntityOf and memberUserAgent: what the inquiry records, or null, never a default", () => {
  const w = world(); w.entity("ENT-2026-0001");
  w.inquiry("INQ-2026-0001-q", { subject: "ENT-2026-0001", extra: ['member_user_agent: "  Mozilla/5.0 test  "'] });
  w.inquiry("INQ-2026-0002-r");
  assert.equal(w.k.subjectEntityOf("INQ-2026-0001-q"), "ENT-2026-0001");
  assert.equal(w.k.subjectEntityOf("INQ-2026-0002-r"), null);
  assert.equal(w.k.memberUserAgent("INQ-2026-0001-q"), "Mozilla/5.0 test");
  assert.equal(w.k.memberUserAgent("INQ-2026-0002-r"), null);
  assert.equal(w.k.memberUserAgent("INQ-2026-0099-x"), null);
});

test("R16 basisFor with a limit reads at most that many legs in SQL, the first by ord, and says it was cut", () => {
  const w = world(); w.doc(A);
  w.inquiry("INQ-2026-0001-q", { legs: Array.from({ length: 5 }, () => ({ target: A })) });
  const cut = w.k.basisFor("INQ-2026-0001-q", { limit: 3 });
  assert.deepEqual([cut.legs.map((l) => l.ord), cut.limit, cut.truncated], [[0, 1, 2], 3, true]);
  const whole = w.k.basisFor("INQ-2026-0001-q", { limit: 5 });
  assert.deepEqual([whole.legs.length, whole.truncated], [5, false]);
  assert.equal(w.k.basisFor("INQ-2026-0001-q").legs.length, 5);
  assert.equal(w.k.basisFor("INQ-2026-0001-q").truncated, undefined, "unbounded, the answer is unchanged");
});

test("R44 R36 the member-browser agent is recorded at the creation from the control plane's stamp, never by a revision; a division's children carry it", () => {
  const w = world(); w.doc(A); w.doc(B);
  const Q = "INQ-2026-0001-q";
  assert.equal(w.promote(Q, inquiryMd(Q, { legs: [{ target: A }, { target: B }] }), null,
    { memberUserAgent: "  Mozilla/5.0 (X11; Linux x86_64) Firefox/131.0  " }).ok, true);
  assert.equal(w.k.memberUserAgent(Q), "Mozilla/5.0 (X11; Linux x86_64) Firefox/131.0");
  /* a revision carrying another stamp, or a document line, never moves it */
  const rev = inquiryMd(Q, { legs: [{ target: A }, { target: B }], extra: ['member_user_agent: "Other/1.0"'] });
  assert.equal(w.promote(Q, rev, undefined, { memberUserAgent: "Changed/2.0" }).ok, true);
  assert.equal(w.k.memberUserAgent(Q), "Mozilla/5.0 (X11; Linux x86_64) Firefox/131.0");
  /* no stamp: the document's own line (an inquiry created before the stamp), else null */
  w.inquiry("INQ-2026-0002-r", { extra: ['member_user_agent: "Legacy/1.0"'] });
  assert.equal(w.k.memberUserAgent("INQ-2026-0002-r"), "Legacy/1.0");
  /* a stamp that is not an agent is not recorded */
  for (const [i, bad] of [["3", "   "], ["4", "x".repeat(513)], ["5", "a\nb"], ["6", 42]]) {
    const id = `INQ-2026-000${i}-z`;
    assert.equal(w.promote(id, inquiryMd(id), null, { memberUserAgent: bad }).ok, true);
    assert.equal(w.k.memberUserAgent(id), null, JSON.stringify(bad).slice(0, 20));
  }
  assert.equal(w.promote("INQ-2026-0007-m", inquiryMd("INQ-2026-0007-m"), null, { memberUserAgent: "x".repeat(512) }).ok, true);
  assert.equal(w.k.memberUserAgent("INQ-2026-0007-m"), "x".repeat(512));
  /* a division's children carry the parent's */
  const r = w.k.divide({ target: Q, reason: "two", viewer: "admin", author: V("alice"),
    children: [{ id: "INQ-2026-0008-a", question: "A?", legs: [0] }, { id: "INQ-2026-0009-b", question: "B?", legs: [1] }] });
  assert.equal(r.ok, true, JSON.stringify(r).slice(0, 300));
  assert.equal(w.k.memberUserAgent("INQ-2026-0008-a"), "Mozilla/5.0 (X11; Linux x86_64) Firefox/131.0");
  assert.equal(w.k.memberUserAgent("INQ-2026-0009-b"), "Mozilla/5.0 (X11; Linux x86_64) Firefox/131.0");
  /* R36: the table carries bundle_id and is declared to purge */
  assert.ok(w.rows(`PRAGMA table_info(inquiry_member_agents)`).some((c) => c.name === "bundle_id"));
  assert.ok(INQUIRY_TABLES.includes("inquiry_member_agents"));
  assert.equal(w.k.memberUserAgent(null), null); assert.equal(w.k.memberUserAgent({}), null);
});
