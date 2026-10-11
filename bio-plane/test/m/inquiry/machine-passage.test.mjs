/* R62 (T42; N834; run-productions R22, R25; K2496): `onMachinePassage(module, fn)`, the one read that says whether a
   member may cite as hers a passage a machine proposed. R11's check of a promotion of an inquiry by an author who is
   not a machine asks `fn({legs, author, viewer})` once, over each leg the revision adds or changes against the held
   document; a refusal from `fn` refuses the promotion unchanged and nothing is written; a `fn` that throws or answers
   anything else is refused MACHINE_PASSAGE_UNCHECKED (C-2.20), spelled by the pure `machinePassageUnchecked`. Driven
   through the real promotion, content and membership; the registered read is a stand-in the test controls, as
   run-productions' would be (its R25). */
import test from "node:test";
import assert from "node:assert/strict";
import { world, inquiryMd, V, MACHINE } from "./fixture.mjs";
import { machinePassageUnchecked, INQUIRY_PASSAGE_CHECKS, inquiryOf } from "../../../src/inquiry/index.mjs";

const ROW = INQUIRY_PASSAGE_CHECKS.MACHINE_PASSAGE_UNCHECKED;
const Q = "INQ-2026-6201-q";
const A = "INFO-2026-6201-a", B = "INFO-2026-6202-b", C = "INFO-2026-6203-c";

/* A stand-in for run-productions R25: a leg on `proposed` stands only once `accepted` holds (proposal, member). */
function setup() {
  const w = world();
  w.member("alice"); w.member("bob");
  const caps = Object.fromEntries([A, B, C].map((d) => [d, w.doc(d)[0]]));
  const calls = [];
  const proposed = new Set([B]);
  const accepted = new Set();
  const read = (args) => {
    calls.push(args);
    const bad = args.legs.filter((l) => proposed.has(l.target) && !accepted.has(`${l.target}|${args.author}`));
    return bad.length ? { ok: false, reason: "PROPOSAL_NOT_TAKEN_UP", code: "PROPOSAL_NOT_TAKEN_UP",
                          legs: bad.map((l) => ({ ord: l.ord, proposal: l.target })) } : null;
  };
  return { w, calls, proposed, accepted, read, caps };
}
const doc = (legs) => inquiryMd(Q, { legs: legs.map((t) => (typeof t === "string" ? { target: t } : t)) });
const legsHeld = (w) => w.rows(`SELECT target_id FROM inquiry_basis WHERE bundle_id=? ORDER BY ord`, Q).map((r) => r.target_id);

test("R62 the registration: one slot, a malformed registration LISTENER_MALFORMED, a second by any module LISTENER_DECLARED naming the holder", () => {
  const { w, read } = setup();
  for (const [m, fn] of [["", read], [null, read], ["run-productions", null], ["run-productions", "fn"]])
    assert.equal(w.k.onMachinePassage(m, fn).reason, "LISTENER_MALFORMED", String(m));
  assert.deepEqual(w.k.onMachinePassage("run-productions", read), { ok: true, module: "run-productions" });
  for (const m of ["run-productions", "basis-versions"]) {
    const r = w.k.onMachinePassage(m, read);
    assert.equal(r.reason, "LISTENER_DECLARED", m);
    assert.match(JSON.stringify(r), /run-productions/, "names the holder");
  }
});

test("R62 a member's leg on a machine-proposed passage she has not taken up is refused unchanged and nothing is written; after her own acceptance it lands", () => {
  const { w, calls, accepted, read } = setup();
  w.k.onMachinePassage("run-productions", read);
  const refused = w.promote(Q, doc([A, B]), null, { author: V("alice") });
  assert.deepEqual(refused, { ok: false, reason: "PROPOSAL_NOT_TAKEN_UP", code: "PROPOSAL_NOT_TAKEN_UP",
                              legs: [{ ord: 1, proposal: B }] }, "the refusal is answered unchanged");
  assert.equal(w.record.head(Q), null, "nothing was written");
  assert.equal(calls.length, 1, "asked once");
  assert.deepEqual(calls[0], { legs: [{ ord: 0, target: A }, { ord: 1, target: B }], author: V("alice"), viewer: V("alice") });
  /* another member's acceptance does not count */
  accepted.add(`${B}|${V("bob")}`);
  assert.equal(w.promote(Q, doc([A, B]), null, { author: V("alice") }).reason, "PROPOSAL_NOT_TAKEN_UP");
  /* negative control: her own acceptance, and the leg lands */
  accepted.add(`${B}|${V("alice")}`);
  const landed = w.promote(Q, doc([A, B]), null, { author: V("alice") });
  assert.equal(landed.ok, true, JSON.stringify(landed));
  assert.deepEqual(legsHeld(w), [A, B]);
});

test("R62 only the legs a revision adds or changes are asked; a held leg, moved or not, is never asked; a revision adding none asks nothing", () => {
  const { w, calls, proposed, read, caps } = setup();
  w.inquiry(Q, { legs: [{ target: A }, { target: B }] });    /* held before anything was registered */
  w.k.onMachinePassage("run-productions", read);
  /* B is held: reordered and with a changed role it is the same passage, never asked */
  const kept = w.promote(Q, doc([{ target: B, role: "cuts_against" }, A]));
  assert.equal(kept.ok, true, JSON.stringify(kept));
  assert.equal(calls.length, 0, "nothing added or changed: not asked");
  /* a revision adding C asks C alone, at its position */
  const added = w.promote(Q, doc([B, A, C]));
  assert.equal(added.ok, true);
  assert.deepEqual(calls.map((c) => c.legs), [[{ ord: 2, target: C }]]);
  /* a second leg on a held passage is an added leg (a multiset): asked, and refused while not taken up */
  const twice = w.promote(Q, doc([B, A, C, B]));
  assert.equal(twice.reason, "PROPOSAL_NOT_TAKEN_UP");
  assert.deepEqual(calls[1].legs, [{ ord: 3, target: B }]);
  /* a changed part of a held leg is a changed leg */
  proposed.add(A);
  const m = w.content.mint({ bundleId: A, captureSha: caps[A], extent: { kind: "document" }, mintedBy: V("alice") });
  assert.equal(m.ok, true, JSON.stringify(m));
  const part = w.promote(Q, doc([B, { target: A, content_id: m.content_id }, C]));
  assert.deepEqual(calls[2].legs, [{ ord: 1, target: A, content_id: m.content_id }]);
  assert.notEqual(part.ok, true);
  assert.deepEqual(legsHeld(w), [B, A, C], "nothing refused was written");
});

test("R62 fail closed: a fn that throws, or answers anything but null or a refusal, refuses MACHINE_PASSAGE_UNCHECKED (C-2.20) and nothing is written", async () => {
  for (const [why, fn] of [
    ["throws", () => { throw new Error("boom"); }],
    ["undefined", () => undefined],
    ["true", () => true],
    ["a promise", () => Promise.resolve(null)],
    ["an array", () => []],
    ["ok true", () => ({ ok: true })],
    ["a refusal with no reason", () => ({ ok: false })]]) {
    const w = world();
    w.member("alice"); w.doc(A);
    w.k.onMachinePassage("run-productions", fn);
    const r = w.promote(Q, doc([A]), null, { author: V("alice") });
    assert.deepEqual([r.ok, r.reason, r.code, r.check, r.translation, r.legs], [false, "MACHINE_PASSAGE_UNCHECKED",
      "MACHINE_PASSAGE_UNCHECKED", "C-2.20", ROW.translation, [0]], why);
    assert.equal(w.record.head(Q), null, `${why}: nothing was written`);
  }
});

test("R62 not asked: a machine's own promotion, a migration replay, and any promotion with nothing registered", () => {
  const { w, calls, read } = setup();
  /* nothing registered: the leg on a proposed passage lands */
  assert.equal(w.promote(Q, doc([B]), null, { author: V("alice") }).ok, true);
  w.k.onMachinePassage("run-productions", read);
  const M = "INQ-2026-6202-m";
  const mr = w.promote(M, inquiryMd(M, { legs: [{ target: B }] }), null, { author: MACHINE });
  assert.equal(mr.ok, true, JSON.stringify(mr));
  assert.equal(calls.length, 0, "a machine's promotion is not asked");
  const P = "INQ-2026-6204-p";
  const rp = w.promote(P, inquiryMd(P, { legs: [{ target: B }] }), null, { author: V("alice"), replay: true });
  assert.equal(rp.ok, true, JSON.stringify(rp).slice(0, 300));
  assert.equal(calls.length, 0, "a replay is not asked");
  /* negative control: the same document by a member is asked and refused */
  const N = "INQ-2026-6203-n";
  assert.equal(w.promote(N, inquiryMd(N, { legs: [{ target: B }] }), null, { author: V("alice") }).reason, "PROPOSAL_NOT_TAKEN_UP");
  assert.equal(calls.length, 1);
});

test("R62 machinePassageUnchecked is the one pure spelling: its row, its detail, the caller's extra fields never replacing them", () => {
  assert.equal(ROW.check, "C-2.20");
  const r = machinePassageUnchecked("the read failed", { version: 3, reason: "OTHER", check: "C-9.9" });
  assert.deepEqual(r, { version: 3, ok: false, reason: "MACHINE_PASSAGE_UNCHECKED", code: "MACHINE_PASSAGE_UNCHECKED",
                        check: "C-2.20", translation: ROW.translation, detail: "the read failed" });
  assert.match(machinePassageUnchecked().detail, /could not be read/);
  for (const a of [[], [null, null], [7, "x"]]) assert.doesNotThrow(() => machinePassageUnchecked(...a));
  assert.deepEqual(machinePassageUnchecked("d"), machinePassageUnchecked("d"), "pure");
  assert.equal(typeof inquiryOf, "function");
});

test("R62 (K2648) viewer is the author; an empty author is asked (only a machine's identity is not), failing closed", () => {
  const { w, calls, read } = setup();
  w.k.onMachinePassage("run-productions", read);
  const r = w.promote(Q, doc([B]), null, { author: "" });
  assert.equal(calls.length, 1, `asked: ${JSON.stringify(r).slice(0, 200)}`);
  assert.deepEqual([calls[0].author, calls[0].viewer], ["", ""], "the author as the promotion carries it, and as viewer");
  assert.equal(r.ok, false);
  assert.equal(w.record.head(Q), null);
});
