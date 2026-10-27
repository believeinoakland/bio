/* contradiction R61 (T51 fix round 2; UC-155; DEC-394 (3e)): a member flags two documents as contradicting by hand.
   `contradictionflag` takes two passages (each a capture and an extent the viewer may see, of two different documents) and
   a reason, and records one candidate between them that the contradiction screen then settles as any candidate; the
   candidate names the member who flagged it. Driven through the ops map as the door calls it, over a real fixture of the
   neighbours; the controls show the refusals write nothing. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { MACHINE } from "./fixture.mjs";
import { flagWorld, unmintedWorld, M1, M2, DOC, HIDDEN, P, CID, WHY, HERE, OTHER } from "./flag-seed.mjs";
import { refusedWith, RUN } from "./seed.mjs";
import { contradictionOps, CONTRADICTION_CANDIDATE_CHECKS as ROWS, TEXT_CAPS } from "../../../src/contradiction/index.mjs";

/* the op as the door runs it: the stamps in the address, the fields in the body */
const flag = (w, fields = {}, stamps = { viewer: M1, author: M1 }) => {
  const body = { here: HERE, other: OTHER, reason: WHY, ...fields };
  return contradictionOps(w.c, new URL(`http://x/?${new URLSearchParams({ op: "contradictionflag", ...stamps })}`), body).contradictionflag();
};
const rowsWritten = (w) => ({ candidates: w.count("contradiction_candidates"), acts: w.count("contradiction_acts") });
const listed = (w, viewer = M1, on = { content: CID.notice3 }) => w.c.candidatesFor({ on, viewer });

test("R61 a member's flag of two passages of two documents with a reason records one candidate, listed for settling and settled as any candidate, naming who flagged it", () => {
  const w = flagWorld();
  const r = flag(w);
  assert.equal(r.ok, true, JSON.stringify(r));
  assert.equal(r.wrote, true);
  assert.equal(r.state, "open");
  assert.deepEqual(rowsWritten(w), { candidates: 1, acts: 0 });

  const got = listed(w).candidates;
  assert.equal(got.length, 1);
  const c = got[0];
  assert.equal(c.candidate, r.candidate);
  assert.equal(c.state, "open");
  assert.equal(c.weight, "lead", "two sources that disagree are a lead: a member's flag creates no duty of its own");
  assert.deepEqual(c.flagged_by, { member: M1, at: c.flagged_by.at, reason: WHY });
  assert.equal(typeof c.flagged_by.at, "string");
  assert.equal(c.machine, null, "a member's flag is never labelled machine work");
  /* both sides verbatim with their source and capture, whichever side the plane ordered first */
  assert.deepEqual([c.a.ref, c.b.ref].sort(), ["page 1 of the lease amendment", "page 3 of the rent notice"]);
  assert.deepEqual([c.a.capture_sha, c.b.capture_sha].sort(), ["capL", "capN"]);
  assert.deepEqual([c.a.doctype, c.b.doctype].sort(), ["lease", "notice"]);

  /* listed from the other passage too, and to another member who may see both sides */
  assert.equal(listed(w, M1, { content: CID.lease1 }).candidates[0].candidate, r.candidate);
  assert.equal(listed(w, M2).candidates[0].candidate, r.candidate);

  /* settled as any candidate: a lead is taken up as a question, which reads back as taken up */
  const up = w.c.takeUp({ candidate: r.candidate, question: "Which date does the rent adjustment take effect on?", frame: "a",
                          viewer: M1, author: M1 });
  assert.equal(up.ok, true, JSON.stringify(up));
  const after = listed(w).candidates[0];
  assert.equal(after.state, "taken_up");
  assert.equal(after.inquiry, up.inquiry);
  assert.equal(after.flagged_by.member, M1);
});

test("R61 a member's flag may also be dismissed with a stated reason, as any lead", () => {
  const w = flagWorld();
  const r = flag(w);
  const d = w.c.dismiss({ candidate: r.candidate, reason: "not_same_matter", viewer: M1, author: M2 });
  assert.equal(d.ok, true, JSON.stringify(d));
  assert.equal(listed(w).candidates[0].state, "dismissed");
});

test("R61 control: the flag is the member's, in either order of passages, and it never edits a document", () => {
  const w = flagWorld();
  const before = w.count("bundles");
  const ab = flag(w);
  const w2 = flagWorld();
  const ba = flag(w2, { here: OTHER, other: HERE });
  assert.equal(ab.ok && ba.ok, true);
  assert.equal(ab.candidate, ba.candidate, "one candidate however the two passages are named");
  assert.equal(w.count("bundles"), before);
  assert.equal(w.count("content"), 4);
});

test("R61 control: a flag repeating an open candidate for the same two passages answers that candidate and writes nothing", () => {
  const w = flagWorld();
  const first = flag(w);
  const snapshot = rowsWritten(w);
  const again = flag(w, { here: OTHER, other: HERE, reason: "A different reason, from another member." }, { viewer: M2, author: M2 });
  assert.equal(again.ok, true, JSON.stringify(again));
  assert.equal(again.already, true);
  assert.equal(again.wrote, false);
  assert.equal(again.candidate, first.candidate);
  assert.equal(again.state, "open");
  assert.deepEqual(rowsWritten(w), snapshot);
  assert.equal(listed(w).candidates[0].flagged_by.reason, WHY, "the first flag stands as it was made");
});

test("R61 control: a candidate any key already holds over the same two passages is answered, whoever made it, and a flag writes nothing", () => {
  const w = flagWorld();
  w.runs.set(RUN, { status: "running", principal: M1 });
  w.inquiry("INQ-2026-0001-cites"); w.leg("INQ-2026-0001-cites", 0, "supports", { content: CID.notice3, target: DOC.notice });
  w.leg("INQ-2026-0001-cites", 1, "supports", { content: CID.lease1, target: DOC.lease });
  w.resolution("capN", DOC.notice, "E1"); w.resolution("capL", DOC.lease, "E1");
  const pair = w.c.pairs({ key: "K4", viewer: MACHINE }).pairs
    .find((q) => [q.a.content_id, q.b.content_id].sort().join() === [CID.notice3, CID.lease1].sort().join());
  assert.ok(pair, "the pairing forms the two passages");
  const made = w.c.propose({ run: RUN, proposedBy: "class:ai/tok1", viewer: MACHINE, caller: M1,
                             proposals: [{ key: "K4", a: pair.a, b: pair.b, label: "world", reason: "the machine's reason" }] });
  assert.equal(made.ok, true, JSON.stringify(made));
  const before = rowsWritten(w);
  const r = flag(w);
  assert.equal(r.ok, true, JSON.stringify(r));
  assert.equal(r.already, true);
  assert.equal(r.wrote, false);
  assert.equal(r.candidate, made.candidates[0].candidate);
  assert.deepEqual(rowsWritten(w), before);
  assert.equal(listed(w).candidates[0].flagged_by, undefined, "the machine's candidate stays the machine's");
});

test("R61 control: an empty reason is refused, writing nothing (FLAG_NO_REASON)", () => {
  const w = flagWorld();
  for (const reason of [undefined, "", "   ", null, 7]) {
    const r = flag(w, { reason });
    refusedWith(assert, ROWS, r, "FLAG_NO_REASON");
    assert.match(String(r.detail), /reason/);
  }
  assert.deepEqual(rowsWritten(w), { candidates: 0, acts: 0 });
});

test("R61 control: a reason over its cap is refused naming the field, writing nothing (WORDS_MALFORMED)", () => {
  const w = flagWorld();
  const r = flag(w, { reason: "x".repeat(TEXT_CAPS.reason + 1) });
  refusedWith(assert, ROWS, r, "WORDS_MALFORMED");
  assert.equal(r.field, "reason");
  assert.equal(flag(w, { reason: "x".repeat(TEXT_CAPS.reason) }).ok, true, "at the cap it is held");
  assert.equal(w.count("contradiction_candidates"), 1);
});

test("R61 control: the same document twice is refused, writing nothing (FLAG_SAME_DOCUMENT)", () => {
  const w = flagWorld();
  const r = flag(w, { other: { capture: "capN", extent: P.notice4 } });
  refusedWith(assert, ROWS, r, "FLAG_SAME_DOCUMENT");
  /* the very same passage twice is the same document too */
  refusedWith(assert, ROWS, flag(w, { other: HERE }), "FLAG_SAME_DOCUMENT");
  assert.deepEqual(rowsWritten(w), { candidates: 0, acts: 0 });
});

test("R61 control: a passage that is missing, unheld or not visible to the member is refused, the three alike, writing nothing (FLAG_NO_PASSAGE)", () => {
  const w = flagWorld();
  const unheld = { capture: "capN", extent: { kind: "pdf-page", page: 99 } };
  const hidden = { capture: "capS", extent: P.lease1 };
  const answers = [
    flag(w, { here: undefined }), flag(w, { other: undefined }), flag(w, { here: null }), flag(w, { here: "capN" }),
    flag(w, { here: { capture: "capN" } }), flag(w, { other: { extent: P.lease1 } }),
    flag(w, { other: unheld }), flag(w, { here: { capture: "capZ", extent: P.notice3 } }),
    flag(w, { other: hidden }),
  ];
  for (const r of answers) refusedWith(assert, ROWS, r, "FLAG_NO_PASSAGE");
  /* a hidden passage is answered exactly as one that does not exist: nothing of it is told */
  assert.deepEqual(answers[8], flag(w, { other: unheld }));
  assert.equal(JSON.stringify(answers[8]).includes("capS"), false);
  assert.equal(JSON.stringify(answers[8]).includes(HIDDEN), false);
  assert.deepEqual(rowsWritten(w), { candidates: 0, acts: 0 });
  /* the member who may see it may flag it */
  assert.equal(flag(w, { other: hidden }, { viewer: M2, author: M2 }).ok, true);
});

test("R61 control: a machine credential cannot flag, an empty author is the same refusal, writing nothing (MACHINE_CANNOT_ACT_ON_CANDIDATE)", () => {
  const w = flagWorld();
  refusedWith(assert, ROWS, flag(w, {}, { viewer: MACHINE, author: "class:ai/tok1" }), "MACHINE_CANNOT_ACT_ON_CANDIDATE");
  refusedWith(assert, ROWS, flag(w, {}, { viewer: M1, author: "" }), "MACHINE_CANNOT_ACT_ON_CANDIDATE");
  assert.deepEqual(rowsWritten(w), { candidates: 0, acts: 0 });
});

test("R61, R58: a member's flag is a connection \"in tension with\" between the two documents, labelled the member's and never machine work", () => {
  const w = flagWorld();
  const r = flag(w);
  const got = w.c.neighbours({ node: DOC.notice, viewer: M1 });
  assert.equal(got.items.length, 1, JSON.stringify(got));
  const item = got.items[0];
  assert.equal(item.candidate, r.candidate);
  assert.equal(item.machine_work, false);
  assert.equal(item.judgement.origin, "member");
  assert.equal(item.judgement.proposed_by, M1);
  assert.equal(item.judgement.reason, WHY);
  assert.deepEqual([item.from, item.to].sort(), [DOC.lease, DOC.notice].sort());
});

test("R61, R19: a flag's candidate is no pairing: R5 knows no key for it, and a machine's candidate is still labelled machine work", () => {
  const w = flagWorld();
  flag(w);
  const r = w.c.pairs({ key: "FLAG", viewer: MACHINE });
  assert.equal(r.ok, false);
  assert.equal(r.code, "CONTRADICTION_KEY_UNKNOWN");
  assert.equal(r.keys.includes("FLAG"), false);
});

test("R61 a passage of a reading the viewer may see that no content row holds is made citable by the flagging member, then flagged; a page not in the reading, a hidden bundle's passage and an unread capture are refused, nothing written", () => {
  const w = unmintedWorld();
  assert.equal(w.count("content"), 0);
  /* controls first: each refused, and nothing minted or written */
  const answers = [
    flag(w, { other: { capture: "capL", extent: { kind: "pdf-page", page: 99 } } }),
    flag(w, { here: { capture: "capN", extent: { kind: "pdf-page", page: 2 } } }),
    flag(w, { here: { capture: "capS", extent: P.lease1 } }),
    flag(w, { other: { capture: "capZ", extent: P.lease1 } }),
  ];
  for (const r of answers) refusedWith(assert, ROWS, r, "FLAG_NO_PASSAGE");
  assert.deepEqual(rowsWritten(w), { candidates: 0, acts: 0 });
  assert.equal(w.count("content"), 0, "a refusal mints nothing");
  /* a refusal later in the order (no reason) mints nothing either */
  refusedWith(assert, ROWS, flag(w, { reason: "" }), "FLAG_NO_REASON");
  assert.equal(w.count("content"), 0);
  /* the act itself */
  const r = flag(w);
  assert.equal(r.ok, true, JSON.stringify(r));
  assert.equal(r.wrote, true);
  assert.deepEqual(rowsWritten(w), { candidates: 1, acts: 0 });
  const rows = w.rows(`SELECT capture_sha, bundle_id, minted_by FROM content ORDER BY capture_sha`);
  assert.deepEqual(rows.map((x) => [x.capture_sha, x.bundle_id, x.minted_by]), [["capL", DOC.lease, M1], ["capN", DOC.notice, M1]]);
  /* flagged again, the same pair is answered and nothing more is written */
  const again = flag(w);
  assert.equal(again.already, true);
  assert.equal(w.count("content"), 2);
  assert.equal(w.count("contradiction_candidates"), 1);
  /* the member who may see the hidden bundle may flag its passage */
  assert.equal(flag(w, { here: { capture: "capS", extent: P.lease1 } }, { viewer: M2, author: M2 }).ok, true);
});
