/* screens-publish R2 (the review copy) and R17 (the review copy, from outside), on interface-shell's served page: the
 * named readers and their acts, the reader's link shown once and kept nowhere, the comments and replies; and the outside
 * reader's page, its secret only in a request's body. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { open, main, text, ops, press, fill, last, ok, P, DR, C, GRANT_SECRET } from "./fixtures.mjs";

const PATH = `/app/review-copy/${P}`;
/* Each field the act's owner takes, as sent; a reason the shell adds by the act's weight (interface-shell R11) aside. */
const carries = (body, want) => { for (const [k, v] of Object.entries(want)) assert.deepEqual(body[k], v, k); };

test("R2 each named reader is a row with what they may read and until when (the end date in its line, the link until stopped, K3147), offering \"Stop sharing\"", async () => {
  const p = await open(PATH);
  assert.match(text(p), /Prof\. N\. Iyer · housing law · 2026-10-20.*can read Edition 2 until you stop sharing/);
  await press(p, "reviewrevoke");
  carries(last(p, "reviewrevoke").body, { grant: "GRT-1" });
});

test("R2 \"Share with a named reader\" takes a name, a role and an end date, is marked outward, and sends nothing without them (control)", async () => {
  const p = await open(PATH);
  const b = main(p).querySelector('button[data-act="reviewgrant"]');
  assert.match(b.getAttribute("data-tip"), /Outward/, "mark.outward.means");
  await press(p, "reviewgrant", { values: { "rc-name": "Prof. N. Iyer", "rc-role": "", "rc-until": "2026-10-20" } });
  assert.equal(p.byOp("reviewgrant").length, 0);
  await press(p, "reviewgrant", { values: { "rc-name": "Prof. N. Iyer", "rc-role": "housing law", "rc-until": "2026-10-20" } });
  assert.equal(last(p, "reviewgrant").body.draft, DR);
  assert.match(last(p, "reviewgrant").body.recipient, /^Prof\. N\. Iyer · housing law · 2026-10-20$/);
});

test("R2 R11 the grant's secret is shown once as the reader's link with \"Civicsmith sends no email\", and kept in no storage, address or later request", async () => {
  const p = await open(PATH, { plane: { reviewgrant: ok({ grantId: "GRT-2", draftId: DR, recipient: "Ana", secret: GRANT_SECRET, secretIsShownOnce: true }) } });
  await press(p, "reviewgrant", { values: { "rc-name": "Ana", "rc-role": "editor", "rc-until": "2026-10-30" } });
  const link = main(p).querySelector("[data-reader-link]");
  assert.ok(link);
  assert.match(link.textContent, new RegExp(`https://group\\.example/app/review#grant=${GRANT_SECRET}`));
  assert.match(link.textContent, /Civicsmith sends no email/);
  const before = p.requests.length;
  await press(p, "reviewrevoke");
  for (const r of p.requests.slice(before)) assert.ok(!JSON.stringify([r.url, r.body, r.headers]).includes(GRANT_SECRET), "no later request carries the secret");
  for (const v of [...p.store.values(), ...p.local.values()]) assert.ok(!String(v).includes(GRANT_SECRET), "no storage holds it");
  assert.ok(!p.location.pathname.includes(GRANT_SECRET) && !String(p.location.hash).includes(GRANT_SECRET), "no address holds it");
  await p.back("/app"); await p.back(PATH);
  assert.equal(main(p).querySelector("[data-reader-link]"), null, "once: gone when the member comes back");
});

test("R2 the readers' comments, each answered by \"Reply\" (reviewcomment with the draft and the member's words)", async () => {
  const p = await open(PATH);
  assert.equal(last(p, "reviewcomments").query.case, C);
  assert.match(text(p), /Finding 1 should say which schedule the council approved\..*Prof\. N\. Iyer, an outside reader/);
  await press(p, "reviewcomment", { values: { "rc-reply-0": "Thank you: it is schedule B." } });
  assert.equal(last(p, "reviewcomment").query.draft, DR);
  carries(last(p, "reviewcomment").body, { text: "Thank you: it is schedule B." });
});

test("R17 review-outside: the fragment's secret goes only in reviewcopy's body, the address loses it on load, no session is read", async () => {
  const p = await open("/app/review", { boot: { session: null, hash: "#grant=" + GRANT_SECRET } });
  assert.equal(p.location.hash, "", "the fragment removed on load");
  assert.equal(p.byOp("whoami").length, 0, "no session read");
  const r = last(p, "reviewcopy");
  assert.deepEqual(r.body, { secret: GRANT_SECRET });
  for (const q of p.requests) {
    assert.ok(!q.url.includes(GRANT_SECRET), "never in an address");
    assert.equal(q.headers.Authorization, undefined, "no credential");
  }
  assert.match(text(p), /A review copy of The Coliseum lease, Edition 2/);
  assert.match(text(p), /Rent adjustments under the Coliseum lease/);
});

test("R17 review-outside: the link's end date, and \"Send your comment\" with the secret in the body; with no link nothing is read (control)", async () => {
  const until = { reviewcopy: ok({ kind: "review-copy", reader: "recipient", draft: DR, case: { case_id: C, edition: 2, identity: "The Coliseum lease" },
    authored: { scope: "Rents." }, findings: [], grant: { recipient: "Ana", until: "2026-10-20" } }) };
  const p = await open("/app/review", { boot: { session: null, hash: "#grant=" + GRANT_SECRET }, plane: until });
  assert.match(text(p), /until 20 October 2026/);
  await press(p, "reviewcomment", { values: { "ro-comment": "Finding 1 needs the schedule." } });
  const r = last(p, "reviewcomment");
  assert.equal(r.query.draft, DR);
  carries(r.body, { text: "Finding 1 needs the schedule.", secret: GRANT_SECRET });
  assert.match(text(p), /Sent to the group/);
  const q = await open("/app/review", { boot: { session: null } });
  assert.equal(q.byOp("reviewcopy").length, 0);
  assert.match(text(q), /carries no review link/);
});
