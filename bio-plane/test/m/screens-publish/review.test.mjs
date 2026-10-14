/* screens-publish R2 (the review copy) and R17 (the review copy, from outside), on interface-shell's served page: the
 * named readers and their acts, the reader's link shown once and kept nowhere, the comments and replies; and the outside
 * reader's page, its secret only in a request's body. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { open, main, text, ops, press, fill, last, ok, refusedIn, plane, PREFLIGHT, COPY, P, DR, C, GRANT_SECRET, GRANT_UNTIL } from "./fixtures.mjs";

const PATH = `/app/review-copy/${P}`;
/* Each field the act's owner takes, as sent; a reason the shell adds by the act's weight (interface-shell R11) aside. */
const carries = (body, want) => { for (const [k, v] of Object.entries(want)) assert.deepEqual(body[k], v, k); };

const withGrants = (grants) => ({ reviewcopy: ok(COPY({ grants })) });
const zoned = (zone) => ({ publishpreflight: ok(PREFLIGHT({ steps: [{ signer: "dev", open_requests: [], publish_at: zone ? { offered: true, zone } : { offered: false, zone: null, reason: "PUBLISH_AT_NO_ZONE" } }] })) });
const share = (p, until, name = "Prof. N. Iyer") => press(p, "reviewgrant", { values: { "rc-name": name, "rc-role": "housing law", "rc-until": until } });

test("R2 R18 each named reader is a row with what they may read and until when, drawn \"until <date>\" from the grant's own end in the group's zone (not the UTC day), offering \"Stop sharing\"", async () => {
  const p = await open(PATH);
  assert.equal(last(p, "reviewcopy").query.draft, DR);
  assert.match(text(p), /Prof\. N\. Iyer · housing law.*can read Edition 2 until 20 October 2099/);
  assert.doesNotMatch(text(p), /21 October 2099/, "the group's day, not the UTC day");
  assert.equal(main(p).querySelector("[data-grant-until]").getAttribute("data-grant-until"), "until");
  await press(p, "reviewrevoke");
  carries(last(p, "reviewrevoke").body, { grant: "GRT-1" });
});

test("R18 a lapsed grant is drawn ended; a grant with no end date draws \"until you stop sharing\" (controls)", async () => {
  const lapsed = await open(PATH, { plane: withGrants([{ grant_id: "GRT-1", recipient: "Prof. N. Iyer · housing law", until: "2020-03-11T06:59:59Z" }]) });
  assert.equal(main(lapsed).querySelector("[data-grant-until]").getAttribute("data-grant-until"), "ended");
  assert.match(text(lapsed), /could read Edition 2 until 10 March 2020: ended/);
  assert.doesNotMatch(text(lapsed), /can read Edition 2/);
  const open_ = await open(PATH, { plane: withGrants([{ grant_id: "GRT-2", recipient: "Ana · editor" }]) });
  assert.match(text(open_), /Ana · editor.*can read Edition 2 until you stop sharing/);
  assert.equal(main(open_).querySelector("[data-grant-until]").getAttribute("data-grant-until"), "open");
});

test("R18 \"Share with a named reader\" sends `until` as the end of the chosen day in the group's zone, an instant in the stamp form (summer, winter and a zone east of Greenwich)", async () => {
  const cases = [["America/Los_Angeles", "2099-10-20", "2099-10-21T06:59:59Z"], ["America/Los_Angeles", "2099-12-20", "2099-12-21T07:59:59Z"],
    ["Asia/Tokyo", "2099-10-20", "2099-10-20T14:59:59Z"], ["UTC", "2099-10-20", "2099-10-20T23:59:59Z"]];
  for (const [zone, day, want] of cases) {
    const p = await open(PATH, { plane: zoned(zone) });
    await share(p, day);
    const sent = last(p, "reviewgrant").body;
    assert.equal(sent.until, want, `${zone} ${day}`);
    assert.match(sent.until, /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/, "the record's stamp form, never a bare date");
    assert.equal(sent.recipient, "Prof. N. Iyer · housing law", "the date is the grant's own field, not part of the reader's line");
    assert.equal(sent.draft, DR);
    assert.equal(last(p, "publishpreflight").body.draft, DR, "the zone read from the preflight of this draft");
  }
});

test("R18 with no time zone held, or a date that is no day, nothing is shared and the member is told why (controls)", async () => {
  const p = await open(PATH, { plane: zoned(null) });
  await share(p, "2099-10-20");
  assert.equal(p.byOp("reviewgrant").length, 0);
  assert.match(text(p), /time zone is not set/);
  const q = await open(PATH, { plane: zoned("America/Los_Angeles") });
  await share(q, "2099-02-31");
  assert.equal(q.byOp("reviewgrant").length, 0, "31 February is no day");
  const r = await open(PATH, { plane: zoned("Not/AZone") });
  await share(r, "2099-10-20");
  assert.equal(r.byOp("reviewgrant").length, 0, "an unknown zone ends nothing");
});

test("R18 REVIEW_BAD_UNTIL is drawn by its words, the form keeps what was typed, and nothing is shared (a past date)", async () => {
  const p = await open(PATH, { plane: { ...zoned("America/Los_Angeles"), reviewgrant: refusedIn("REVIEW_BAD_UNTIL", "The end date is not after now.") } });
  const { slot } = await share(p, "2020-01-01");
  assert.equal(p.byOp("reviewgrant").length, 1, "the plane is asked");
  assert.match(slot().textContent + text(p), /Choose a day that has not yet ended/);
  assert.equal(p.doc.getElementById("rc-name").value, "Prof. N. Iyer");
  assert.equal(p.doc.getElementById("rc-until").value, "2020-01-01");
  assert.equal(main(p).querySelector("[data-reader-link]"), null, "no link is shown");
});

test("R2 \"Share with a named reader\" takes a name, a role and an end date, is marked outward, and sends nothing without them (control)", async () => {
  const p = await open(PATH, { plane: zoned("America/Los_Angeles") });
  const b = main(p).querySelector('button[data-act="reviewgrant"]');
  assert.match(b.getAttribute("data-tip"), /Outward/, "mark.outward.means");
  await press(p, "reviewgrant", { values: { "rc-name": "Prof. N. Iyer", "rc-role": "", "rc-until": "2099-10-20" } });
  assert.equal(p.byOp("reviewgrant").length, 0);
  await press(p, "reviewgrant", { values: { "rc-name": "Prof. N. Iyer", "rc-role": "housing law", "rc-until": "" } });
  assert.equal(p.byOp("reviewgrant").length, 0, "no end date: nothing shared");
  await share(p, "2099-10-20");
  assert.equal(last(p, "reviewgrant").body.draft, DR);
});

test("R2 R11 the grant's secret is shown once as the reader's link with \"Civicsmith sends no email\", and kept in no storage, address or later request", async () => {
  const p = await open(PATH, { plane: { ...zoned("America/Los_Angeles"), reviewgrant: ok({ grantId: "GRT-2", draftId: DR, recipient: "Ana", secret: GRANT_SECRET, secretIsShownOnce: true }) } });
  await press(p, "reviewgrant", { values: { "rc-name": "Ana", "rc-role": "editor", "rc-until": "2099-10-30" } });
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
    authored: { scope: "Rents." }, findings: [], grant: { recipient: "Ana", until: "2026-10-20T06:59:59Z" } }) };
  const p = await open("/app/review", { boot: { session: null, hash: "#grant=" + GRANT_SECRET }, plane: until });
  assert.match(text(p), /until 20 October 2026 at 06:59 UTC/, "K3295: date and time with UTC named");
  const none = await open("/app/review", { boot: { session: null, hash: "#grant=" + GRANT_SECRET }, plane: { reviewcopy: ok({ kind: "review-copy", reader: "recipient", draft: DR, case: { case_id: C, edition: 2, identity: "The Coliseum lease" },
    authored: { scope: "Rents." }, findings: [], grant: { recipient: "Ana" } }) } });
  assert.match(text(none), /until the group stops sharing/, "R18: a grant with no end date");
  await press(p, "reviewcomment", { values: { "ro-comment": "Finding 1 needs the schedule." } });
  const r = last(p, "reviewcomment");
  assert.equal(r.query.draft, DR);
  carries(r.body, { text: "Finding 1 needs the schedule.", secret: GRANT_SECRET });
  assert.match(text(p), /Sent to the group/);
  const q = await open("/app/review", { boot: { session: null } });
  assert.equal(q.byOp("reviewcopy").length, 0);
  assert.match(text(q), /carries no review link/);
});
