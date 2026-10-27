/* case-check R1: checkAndHold, the pre-flight deciding, the preparation stored and the check recorded in one
   transaction; its repeat; its op. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { standard, args, V, P, F1, F2, NOW } from "./fixture.mjs";
import { caseCheckOps, CHECK_PREFIX } from "../../../src/case-check/index.mjs";
import { preflightAnswer } from "../case-authoring/fixtures.mjs";

/* case-authoring's real pre-flight answers (R34), taken from its published fixtures */
const real = preflightAnswer();

test("R1: a ready pre-flight stores the preparation (case-authoring R14) and records the check {check, case, edition, doc_sha, members, checked_at, by}, answering {ok, held, check, caseDocument}", () => {
  const w = standard();
  const r = w.c.checkAndHold(args([F1, F2]));
  assert.equal(r.ok, true, JSON.stringify(r));
  assert.equal(r.held, true);
  assert.equal(r.existed, undefined);
  assert.match(r.check, new RegExp(`^${CHECK_PREFIX}-2026-\\d{4}$`), "minted opaque, R1's prefix");
  const doc = w.row(`SELECT doc_sha FROM case_documents WHERE case_id=? AND edition=1`, "CASE-2026-0001");
  assert.ok(doc, "the preparation is stored");
  assert.deepEqual(r.caseDocument.doc_sha, doc.doc_sha);
  assert.deepEqual([r.case, r.edition, r.project, r.doc_sha, r.checked_at, r.by],
                   ["CASE-2026-0001", 1, P, doc.doc_sha, NOW, "ann"]);
  assert.deepEqual(r.members, [{ bundle_id: F1, version_sha: w.head(F1), role: "load_bearing" },
                               { bundle_id: F2, version_sha: w.head(F2), role: "supporting" }], "the pins R13 made");
  assert.equal(w.count("case_checks"), 1);
  /* the pre-flight was asked first, over the act's own inputs, and the act ran with the stamp */
  assert.equal(w.calls.preflight.length, 1);
  assert.deepEqual(w.calls.preflight[0].args, args([F1, F2]));
  assert.equal(w.c.caseCheckOf({ case: r.case }).state, "held");
});

test("R1: a pre-flight with one blocker answers R34's {ready: false, first, blockers} and writes nothing: no preparation, no check (control: the same act ready writes both)", () => {
  const w = standard();
  w.ca.pre = real.blocked;
  const before = w.snapshot();
  const r = w.c.checkAndHold(args([F1]));
  assert.deepEqual([r.ok, r.ready, r.held, r.first, r.blockers, r.reason],
                   [false, false, false, real.blocked.first, real.blocked.blockers, real.blocked.first.reason]);
  assert.deepEqual(w.snapshot(), before, "nothing written");
  assert.equal(w.calls.publish.length, 0, "publishCase is never run");
  w.ca.pre = { ok: true, wrote: false, ready: true, first: null, blockers: [], steps: [] };
  assert.equal(w.c.checkAndHold(args([F1])).ok, true);
  assert.deepEqual([w.count("case_documents"), w.count("case_checks")], [1, 1], "control: a ready one stores both");
});

test("R1: every refusal is the pre-flight's, in its order; MACHINE_CANNOT_PUBLISH and the owner-only authority come first, unchanged", () => {
  const w = standard();
  for (const key of ["machine", "notOwner"]) {
    const pre = real[key], first = pre.first;
    w.ca.pre = pre;
    const r = w.c.checkAndHold(args([F1], { author: "ed" }));
    assert.deepEqual([r.reason, r.code, r.check, r.translation, r.detail], [first.reason, first.code, first.check, first.translation, first.detail], "unchanged");
    assert.deepEqual([r.first, r.blockers], [first, pre.blockers]);
  }
  assert.deepEqual([w.count("case_documents"), w.count("case_checks")], [0, 0]);
});

test("R1: a refusal or a throw of the act after the pre-flight rolls everything back: a rolled-back R1 leaves no row", () => {
  const w = standard();
  w.ca.gate = () => ({ ok: false, reason: "ALREADY_A_CASE_MEMBER" });
  const before = w.snapshot();
  assert.equal(w.c.checkAndHold(args([F1])).reason, "ALREADY_A_CASE_MEMBER");
  assert.deepEqual(w.snapshot(), before);
  w.ca.gate = (a) => ({ caseId: "CASE-2026-0001", edition: 1 });
  w.ca.throws = new Error("boom");
  assert.throws(() => w.c.checkAndHold(args([F1])), /boom/);
  assert.deepEqual(w.snapshot(), before, "neither the preparation nor any check");
});

test("R1: a repeat while the latest check of that edition reads held answers that check with existed: true, writing nothing; once void, a repeat makes a new check (control)", () => {
  const w = standard();
  const first = w.c.checkAndHold(args([F1]));
  const before = w.snapshot();
  const again = w.c.checkAndHold(args([F1]));
  assert.deepEqual([again.ok, again.held, again.existed, again.check, again.doc_sha],
                   [true, true, true, first.check, first.doc_sha]);
  assert.deepEqual(w.snapshot(), before, "no second preparation, no second check");
  w.move(F1);
  assert.equal(w.c.caseCheckOf({ case: first.case }).state, "void");
  const fresh = w.c.checkAndHold(args([F1]));
  assert.deepEqual([fresh.ok, fresh.existed], [true, undefined]);
  assert.notEqual(fresh.check, first.check);
  assert.equal(w.count("case_checks"), 2);
  assert.equal(w.c.caseCheckOf({ case: first.case }).check, fresh.check, "the latest is the new one");
});

test("R1: only the same act is a repeat: an edited statement over the same members prepares again and records a new check, voiding the first (document_replaced); another owner's act is their own check", () => {
  const w = standard();
  const first = w.c.checkAndHold(args([F1]));
  const edited = w.c.checkAndHold(args([F1], { statement: "It does not cover the appeal." }));
  assert.deepEqual([edited.ok, edited.existed, edited.case, edited.edition], [true, undefined, first.case, first.edition]);
  assert.notEqual(edited.check, first.check);
  assert.deepEqual(w.c.caseCheckOf({ check: first.check }).why, ["document_replaced"]);
  assert.equal(w.c.checkAndHold(args([F1], { statement: "It does not cover the appeal." })).existed, true, "control");
  assert.equal(w.c.checkAndHold(args([F1], { statement: "It does not cover the appeal.", author: "ed" })).existed, undefined);
});

test("R1: a check has no expiry: years later, nothing else done, it still reads held", () => {
  const w = standard();
  const r = w.c.checkAndHold(args([F1]));
  w.clock.now = "2031-01-01T00:00:00Z";
  assert.deepEqual([w.c.caseCheckOf({ case: r.case }).state, w.c.caseCheckOf({ check: r.check }).checked_at], ["held", NOW]);
});

test("R1: op=publishcheck takes author and viewer from the query after the body, gathers case-authoring R56's facts first and hands them to the pre-flight and the act", async () => {
  const w = standard();
  const url = new URL(`http://do/publishcheck?author=ann&viewer=${encodeURIComponent(V("ann"))}&project=${P}`);
  const body = { ...args([F1]), author: "ed", viewer: V("ed") };
  const r = await caseCheckOps(w.c, url, body).publishcheck();
  assert.equal(r.ok, true, JSON.stringify(r));
  assert.equal(r.by, "ann", "the stamp, never the body's");
  assert.deepEqual([w.calls.preflight[0].args.author, w.calls.preflight[0].args.viewer], ["ann", V("ann")]);
  assert.equal(w.calls.gathered.length, 1);
  assert.equal(w.calls.preflight[0].facts.marker, "facts");
  assert.ok(w.calls.publish.every((p) => p.facts && p.facts.marker === "facts"));
  /* an agent's stamp is carried whole to the pre-flight and the act is asked as the stamp */
  const agent = new URL(`${url}&aiCred=${encodeURIComponent(JSON.stringify({ tokenId: "AIC-1" }))}`);
  w.ca.pre = real.blocked;
  await caseCheckOps(w.c, agent, body).publishcheck();
  assert.deepEqual(w.calls.preflight.at(-1).args.viewer, { stamp: V("ann"), aiCred: { tokenId: "AIC-1" } });
});
