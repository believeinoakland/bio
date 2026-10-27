/* screens-publish R40 and R41 (T51-121; DEC-330 A81; N1229): the review copy saved as a stamped file in the page, behind the warning that a
 * file cannot be recalled; and the first share reading the team's zone from the member door's copy, not from a preflight. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { open, main, text, drew, drewIn, day, word, ops, press, fill, last, ok, refusedIn, COPY, P, DR, C, GRANT_SECRET } from "./fixtures.mjs";
import { ADMIN } from "../interface-shell/harness.mjs";

const PATH = `/app/review-copy/${P}`;
const HASH = "9".repeat(63) + "a";
const STAMP = (o = {}) => ({ format: "bio-inband/1", hash: { sha256: HASH, bytes: 4096, over: "this answer exactly as served" }, date: "2026-10-07T09:00:00Z", author: "dev", floors: { capture: "B", connection: "C" }, ...o });
const stamped = (o = {}) => ({ reviewcopy: ok({ ...COPY(), inband: STAMP(o) }) });
const saveButton = (p) => main(p).querySelector("[data-export-ready] button");
const tickBox = async (p) => { const sel = p.doc.getElementById("rc-export-ack"); sel.value = "yes"; p.fire(sel, "change"); await p.settle(); };

test("R40 \"Save as a file\" opens the warning that a file cannot be recalled, what the file carries and the one box; \"Save the file\" is absent until the box is ticked", async () => {
  const p = await open(PATH, { plane: stamped() });
  assert.deepEqual(ops(p).filter((o) => o === "reviewexport"), ["reviewexport"], "beside \"Share with a named reader\"");
  assert.ok(main(p).querySelector('button[data-act="reviewgrant"]'));
  await press(p, "reviewexport");
  const warn = main(p).querySelector("[data-recall]");
  assert.ok(warn && drewIn(warn, "screen.review_copy.a.file.can.t.be") && drewIn(warn, "screen.review_copy.once.it.leaves.your.device") && drewIn(warn, "screen.review_copy.stopping.the.sharing.of.a") && drewIn(warn, "screen.review_copy.if.what.you.need.is"));
  assert.ok(drew(p, "screen.review_copy.save.this.copy.as.a") && drew(p, "screen.review_copy.what.the.file.carries"));
  assert.ok(drew(p, "screen.review_copy.a.code.that.names.exactly") && drew(p, "screen.review_copy.the.date.this.copy.last") && drew(p, "screen.review_copy.the.minimum.strengths.it.was"));
  assert.ok(drew(p, "screen.review_copy.the.file.does.not.say") && drew(p, "screen.review_copy.its.fingerprint.covers.them.so"));
  assert.ok(drew(p, "screen.review_copy.before.you.save.it") && drew(p, "screen.review_copy.i.understand.that.this.file"), "the one box");
  assert.deepEqual(ops(p).filter((o) => o === "reviewexport"), [], "unticked: no act to save");
  const n = p.byOp("reviewcopy").length;
  await tickBox(p);
  assert.deepEqual(ops(p).filter((o) => o === "reviewexport"), ["reviewexport"], "ticked: offered");
  assert.equal(main(p).querySelector('button[data-act="reviewexport"]').getAttribute("data-tone"), "primary");
  assert.equal(p.byOp("reviewcopy").length, n, "nothing is read until it is pressed");
});

test("R40 pressing it reads the copy once and makes one stamped file naming the fingerprint, the day, the author and the minimum strengths, and neither a reader's name, a comment nor a secret; nothing is written", async () => {
  const p = await open(PATH, { plane: { reviewcopy: ok({ ...COPY(), inband: STAMP(), comments: [{ reviewer: "Prof. N. Iyer", text: "A reader's private remark." }] }) } });
  await press(p, "reviewexport");
  await tickBox(p);
  const reads = p.byOp("reviewcopy").length, sent = p.requests.length;
  await press(p, "reviewexport");
  assert.equal(p.byOp("reviewcopy").length, reads + 1, "the copy is read once");
  assert.deepEqual(p.requests.slice(sent).map((r) => r.op), ["reviewcopy"], "nothing is sent but the one read");
  assert.deepEqual(last(p, "reviewcopy").query, { op: "reviewcopy", draft: DR }, "the member door, the draft's id");
  const save = saveButton(p);
  assert.ok(save, "the file handed over to save (cs.save)");
  await p.click(save);
  assert.equal(p.files.length, 1);
  assert.equal(p.files[0].name, `${C}-edition-2-${HASH.slice(0, 8)}.html`, "named by the case, its edition and the short fingerprint");
  const file = await p.files[0].blob.text();
  assert.ok(file.includes(HASH), "the fingerprint");
  assert.ok(file.includes(day("2026-10-07")), "the date it last changed");
  assert.ok(file.includes(">dev<") || file.includes("dev</p>"), "its author");
  assert.ok(file.includes("B") && file.includes("C"), "the minimum strengths it was read at");
  assert.ok(file.includes(word("screen.review_copy.the.minimum.strengths.it.was")) && file.includes(word("screen.review_copy.the.date.this.copy.last")), "the stamp's words are the list's");
  assert.ok(file.includes("The Coliseum lease") && file.includes("The 2024 adjustments had no council vote."), "the copy's case and findings, as the answer states them");
  assert.ok(file.includes('data-stamp') && /position:\s*fixed/.test(file), "the stamp is a header the file repeats on every printed page");
  for (const never of ["Prof. N. Iyer", "A reader's private remark.", GRANT_SECRET, "GRT-1"]) assert.ok(!file.includes(never), `the file holds no ${never}`);
  assert.ok(![...p.store.values(), ...p.local.values()].some((v) => String(v).includes(HASH)), "the file is stored nowhere");
});

test("R40 an answer with no stamp makes no file and draws the could-not-be-stamped fold; a browser that declines the file draws its fold; a refusal is drawn by its words (controls)", async () => {
  for (const missing of [{ hash: undefined }, { date: undefined }, { author: undefined }, { floors: undefined }]) {
    const p = await open(PATH, { plane: stamped(missing) });
    await press(p, "reviewexport"); await tickBox(p); await press(p, "reviewexport");
    const fold = main(p).querySelector('[data-fold="screen.review_copy.when.the.copy.can.t"]');
    assert.ok(fold && fold.hasAttribute("open") && drewIn(fold, "screen.review_copy.this.copy.could.not.be") && drewIn(fold, "screen.review_copy.no.file.was.made"), JSON.stringify(missing));
    assert.equal(saveButton(p), null, "no file is offered");
    assert.equal(p.files.length, 0);
  }
  const q = await open(PATH, { plane: stamped() });
  await press(q, "reviewexport"); await tickBox(q);
  const save = URL.createObjectURL;
  URL.createObjectURL = undefined;
  try { await press(q, "reviewexport"); } finally { URL.createObjectURL = save; }
  const fold = main(q).querySelector('[data-fold="screen.review_copy.when.this.browser.doesn.t"]');
  assert.ok(fold && drewIn(fold, "screen.review_copy.this.browser.did.not.accept") && drewIn(fold, "screen.review_copy.nothing.left.this.page"));
  assert.equal(q.files.length, 0);
  let refuse = false;
  const gone = await open(PATH, { plane: { reviewcopy: () => (refuse ? refusedIn("NO_REVIEW_COPY", "There is no review copy here.") : ok({ ...COPY(), inband: STAMP() })) } });
  await press(gone, "reviewexport"); await tickBox(gone);
  refuse = true;
  await press(gone, "reviewexport");
  assert.ok(text(gone).includes(word("refusal.NO_REVIEW_COPY")), "the refusal, by its words");
  assert.equal(saveButton(gone), null);
  assert.equal(gone.files.length, 0);
});

/* ---------- R41: the first share reads the zone from the copy ---------- */

const share = (p, until, name = "Ana") => press(p, "reviewgrant", { reason: "so the reader can comment before publication", values: { "rc-name": name, "rc-role": "editor", "rc-until": until } });

test("R41 a draft with no grant and a team zone shares with the end day counted in that zone, and publishpreflight is not sent", async () => {
  const first = { reviewcopy: ok(COPY({ zone: "Asia/Tokyo", grants: [] })) };
  const p = await open(PATH, { plane: first });
  await share(p, "2099-10-20");
  assert.equal(last(p, "reviewgrant").body.until, "2099-10-20T14:59:59Z", "the end of the day in Tokyo, from the copy's top-level zone");
  assert.equal(p.byOp("publishpreflight").length, 0, "counted at the fake plane: no preflight for the zone");
  const withGrant = await open(PATH, { plane: { reviewcopy: ok(COPY({ zone: "America/Los_Angeles" })) } });
  await share(withGrant, "2099-10-20");
  assert.equal(last(withGrant, "reviewgrant").body.until, "2099-10-21T06:59:59Z", "a draft with a grant reads the same zone as its rows carry");
});

test("R41 a top-level zone of null refuses the share in words for an administrator and for a member, and nothing is shared; no UTC is drawn in its place", async () => {
  const none = { reviewcopy: ok(COPY({ zone: null, grants: [] })) };
  const member = await open(PATH, { plane: none });
  await share(member, "2099-10-20");
  assert.equal(member.byOp("reviewgrant").length, 0);
  assert.equal(member.byOp("publishpreflight").length, 0);
  const fold = main(member).querySelector('[data-fold="screen.review-copy.until.nozone.summary"]');
  assert.ok(fold && drewIn(fold, "screen.review-copy.until.nozone.member") && !drewIn(fold, "screen.review-copy.until.nozone"));
  const admin = await open(PATH, { plane: { ...none, whoami: ok({ ...ADMIN, member: "rosa", handle: "rosa", capabilities: ["contribute", "create_projects", "publish"] }) } });
  await share(admin, "2099-10-20");
  assert.equal(admin.byOp("reviewgrant").length, 0);
  assert.ok(drewIn(main(admin).querySelector('[data-fold="screen.review-copy.until.nozone.summary"]'), "screen.review-copy.until.nozone"));
  assert.ok(!/UTC/.test(text(admin)) && !/UTC/.test(text(member)));
});
