/* The reads over the projection: the basis and who rests on a target (R16), the live legs (R17), the exclusions naming
   a target (R18), an inquiry's state history (R19), each gated as R33 says. */
import test from "node:test";
import assert from "node:assert/strict";
import { world, inquiryMd, V } from "./fixture.mjs";

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

test("R12 subjectEntityOf and memberUserAgent (proposed R43, R44): what the inquiry records, or null, never a default", () => {
  const w = world(); w.entity("ENT-2026-0001");
  w.inquiry("INQ-2026-0001-q", { subject: "ENT-2026-0001", extra: ['member_user_agent: "  Mozilla/5.0 test  "'] });
  w.inquiry("INQ-2026-0002-r");
  assert.equal(w.k.subjectEntityOf("INQ-2026-0001-q"), "ENT-2026-0001");
  assert.equal(w.k.subjectEntityOf("INQ-2026-0002-r"), null);
  assert.equal(w.k.memberUserAgent("INQ-2026-0001-q"), "Mozilla/5.0 test");
  assert.equal(w.k.memberUserAgent("INQ-2026-0002-r"), null);
  assert.equal(w.k.memberUserAgent("INQ-2026-0099-x"), null);
});
