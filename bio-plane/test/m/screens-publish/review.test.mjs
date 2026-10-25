/* screens-publish R2 (the review copy) and R17 (the review copy, from outside), on interface-shell's served page: the
 * named readers and their acts, the reader's link shown once and kept nowhere, the comments and replies; and the outside
 * reader's page, its secret only in a request's body. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { open, main, text, tipOf, drew, drewIn, day, clock, word, ops, press, fill, last, ok, refused, refusedIn, plane, PREFLIGHT, COPY, P, DR, C, GRANT_SECRET, GRANT_UNTIL } from "./fixtures.mjs";
import { statementAck } from "../case-inputs/fixtures.mjs";

const PATH = `/app/review-copy/${P}`;
/* Each field the act's owner takes, as sent; a reason the shell adds by the act's weight (interface-shell R11) aside. */
const carries = (body, want) => { for (const [k, v] of Object.entries(want)) assert.deepEqual(body[k], v, k); };

const withGrants = (grants) => ({ reviewcopy: ok(COPY({ grants })) });
/* R27 (`review` R35): the zone the copy answer carries on each roster row; a zone of null is "none held". */
const zoned = (zone) => ({ reviewcopy: ok(COPY({ zone, grants: [{ grant_id: "GRT-1", recipient: "Prof. N. Iyer · housing law", until: GRANT_UNTIL, zone }] })) });
const PACIFIC = "Pacific Time, Los Angeles";
const share = (p, until, name = "Prof. N. Iyer") => press(p, "reviewgrant", { reason: "so the reader can comment before publication", values: { "rc-name": name, "rc-role": "housing law", "rc-until": until } });

test("R2 R18 each named reader is a row with what they may read and until when, drawn \"until <date>\" from the grant's own end in the group's zone (not the UTC day), offering \"Stop sharing\"", async () => {
  const p = await open(PATH);
  assert.equal(last(p, "reviewcopy").query.draft, DR);
  assert.ok(text(p).includes("Prof. N. Iyer · housing law") && drew(p, "screen.review-outside.until.zone", { date: day("2099-10-20"), time: clock("23:59"), zone: PACIFIC }));
  assert.ok(!text(p).includes(day("2099-10-21")), "the group's day, not the UTC day");
  assert.equal(p.byOp("publishpreflight").length, 0, "R27: the zone is the copy answer's, not a separate publishpreflight read");
  assert.equal(main(p).querySelector("[data-grant-until]").getAttribute("data-grant-until"), "until");
  await press(p, "reviewrevoke");
  carries(last(p, "reviewrevoke").body, { grant: "GRT-1" });
});

test("R18 a lapsed grant is drawn ended; a grant with no end date draws \"until you stop sharing\" (controls)", async () => {
  const lapsed = await open(PATH, { plane: withGrants([{ grant_id: "GRT-1", recipient: "Prof. N. Iyer · housing law", until: "2020-03-11T06:59:59Z", zone: "America/Los_Angeles" }]) });
  assert.equal(main(lapsed).querySelector("[data-grant-until]").getAttribute("data-grant-until"), "ended");
  assert.ok(drew(lapsed, "screen.review-copy.reads.ended", { edition: "2", until: day("2020-03-10") }));
  assert.ok(!drew(lapsed, "screen.review-outside.until.zone", { date: day("2020-03-10"), time: clock("23:59"), zone: PACIFIC }) && !drew(lapsed, "screen.review-copy.reads.stop", { edition: "2" }));
  const open_ = await open(PATH, { plane: withGrants([{ grant_id: "GRT-2", recipient: "Ana · editor" }]) });
  assert.ok(text(open_).includes("Ana · editor") && drew(open_, "screen.review-copy.reads.stop", { edition: "2" }));
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
    assert.equal(p.byOp("publishpreflight").length, 0, "R27: the zone read from the copy answer, not a preflight");
  }
});

test("R18 R27 with no time zone held, or a date that is no day, nothing is shared and the member is told why in the fold (controls)", async () => {
  const p = await open(PATH, { plane: zoned(null) });
  await share(p, "2099-10-20");
  assert.equal(p.byOp("reviewgrant").length, 0);
  assert.equal(p.byOp("publishpreflight").length, 0, "a row that says no zone is held is not asked again");
  const fold = main(p).querySelector('[data-fold="screen.review-copy.until.nozone.summary"]');
  assert.ok(fold && drewIn(fold, "screen.review-copy.until.nozone.summary") && fold.hasAttribute("open"), "drawn in its fold, open");
  assert.ok(drewIn(fold, "screen.review-copy.until.nozone.member") && !drewIn(fold, "screen.review-copy.until.nozone"), "a member is told to ask an administrator");
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
  assert.ok((slot().textContent + text(p)).includes(word("screen.review-copy.until.bad")));
  assert.equal(p.doc.getElementById("rc-name").value, "Prof. N. Iyer");
  assert.equal(p.doc.getElementById("rc-until").value, "2020-01-01");
  assert.equal(main(p).querySelector("[data-reader-link]"), null, "no link is shown");
});

test("R2 \"Share with a named reader\" takes a name, a role and an end date, is marked outward, and sends nothing without them (control)", async () => {
  const p = await open(PATH, { plane: zoned("America/Los_Angeles") });
  const b = main(p).querySelector('button[data-act="reviewgrant"]');
  assert.ok(tipOf(b).includes(word("mark.outward.means")), "mark.outward.means");
  await press(p, "reviewgrant", { reason: "so the reader can comment before publication", values: { "rc-name": "Prof. N. Iyer", "rc-role": "", "rc-until": "2099-10-20" } });
  assert.equal(p.byOp("reviewgrant").length, 0);
  await press(p, "reviewgrant", { reason: "so the reader can comment before publication", values: { "rc-name": "Prof. N. Iyer", "rc-role": "housing law", "rc-until": "" } });
  assert.equal(p.byOp("reviewgrant").length, 0, "no end date: nothing shared");
  await share(p, "2099-10-20");
  assert.equal(last(p, "reviewgrant").body.draft, DR);
});

test("R2 R11 the grant's secret is shown once as the reader's link with \"Civicsmith sends no email\", and kept in no storage, address or later request", async () => {
  const p = await open(PATH, { plane: { ...zoned("America/Los_Angeles"), reviewgrant: ok({ grantId: "GRT-2", draftId: DR, recipient: "Ana", secret: GRANT_SECRET, secretIsShownOnce: true }) } });
  await press(p, "reviewgrant", { reason: "so the reader can comment before publication", values: { "rc-name": "Ana", "rc-role": "editor", "rc-until": "2099-10-30" } });
  const link = main(p).querySelector("[data-reader-link]");
  assert.ok(link);
  assert.match(link.textContent, new RegExp(`https://group\\.example/app/review#grant=${GRANT_SECRET}`));
  assert.ok(link.textContent.includes(word("screen.review-copy.noemail")));
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
  assert.equal(p.byOp("reviewcomments").length, 0, "R62: the comments come from the copy answer, not a read keyed on the case");
  assert.ok(text(p).includes("Finding 1 should say which schedule the council approved.") && drew(p, "screen.review-copy.from.reader", { who: "Prof. N. Iyer" }));
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
  assert.ok(drew(p, "screen.review-outside.heading", { group: "River Town" }));
  assert.ok(drew(p, "screen.review-outside.draft", { case: "The Coliseum lease", edition: "2" }), "the draft's title names the case and edition");
  assert.ok(text(p).includes("Rent adjustments under the Coliseum lease"));
});

test("R17 review-outside: the link's end date, and \"Send your comment\" with the secret in the body; with no link nothing is read (control)", async () => {
  const until = { reviewcopy: ok({ kind: "review-copy", reader: "recipient", draft: DR, case: { case_id: C, edition: 2, identity: "The Coliseum lease" },
    authored: { scope: "Rents." }, findings: [], grant: { recipient: "Ana", until: "2026-10-20T06:59:59Z", zone: "America/Los_Angeles" } }) };
  const p = await open("/app/review", { boot: { session: null, hash: "#grant=" + GRANT_SECRET }, plane: until });
  assert.ok(drew(p, "screen.review-outside.until.zone", { date: day("2026-10-19"), time: clock("23:59"), zone: PACIFIC }), "R27: the end day in the team's zone, never UTC");
  assert.ok(!drew(p, "screen.review-outside.until", { date: day("2026-10-20"), time: clock("06:59") }), "the sentence that names UTC is not drawn");
  const none = await open("/app/review", { boot: { session: null, hash: "#grant=" + GRANT_SECRET }, plane: { reviewcopy: ok({ kind: "review-copy", reader: "recipient", draft: DR, case: { case_id: C, edition: 2, identity: "The Coliseum lease" },
    authored: { scope: "Rents." }, findings: [], grant: { recipient: "Ana" } }) } });
  assert.ok(drew(none, "screen.review-outside.untilstopped"), "R18: a grant with no end date");
  await press(p, "reviewcomment", { values: { "ro-comment": "Finding 1 needs the schedule." } });
  const r = last(p, "reviewcomment");
  assert.equal(r.query.draft, DR);
  carries(r.body, { text: "Finding 1 needs the schedule.", secret: GRANT_SECRET });
  assert.ok(drew(p, "screen.review-outside.sent"));
  const q = await open("/app/review", { boot: { session: null } });
  assert.equal(q.byOp("reviewcopy").length, 0);
  assert.ok(drew(q, "screen.review-outside.nolink"));
});

/* R23 (N1094; DEC-240 (C2); case-inputs R1, R5; review R15, R28): the reader's acknowledgement on review-outside. */
const OUTSIDE = { session: null, hash: "#grant=" + GRANT_SECRET };
const STATEMENT = "The case leaves out whether the rents were fair.";
const outsideCopy = (authored = { scope: "Rents.", statement: STATEMENT }) => ({ reviewcopy: ok({ kind: "review-copy", reader: "recipient", draft: DR,
  case: { case_id: C, edition: 2, identity: "The Coliseum lease" }, authored, findings: [], grant: { recipient: "Ana", until: "2026-10-20T06:59:59Z" } }) });
const NOTE = "I read it, and the gap is fairly stated.";

test("R23 review-outside draws \"What the case says it does not cover\" with the group's statement, the reader's note and \"Acknowledge it\"", async () => {
  const p = await open("/app/review", { boot: OUTSIDE, plane: outsideCopy() });
  const head = main(p).querySelectorAll("h2").find((h) => h.textContent === word("review.statement.title"));
  assert.ok(head, "the section");
  assert.ok(tipOf(head).includes(word("review.statement.help")), "explained by review.statement.help");
  const section = head.closest("section");
  assert.ok(section.textContent.includes(STATEMENT), "the team's statement");
  assert.ok(drewIn(section, "review.statement.note") && drewIn(section, "review.statement.note.help"), "the note and its help");
  assert.ok(p.doc.getElementById("ro-note"));
  assert.ok(section.querySelector('button[data-act="statementack"]').textContent.includes(word("review.statement.ack")), "Acknowledge it");
  assert.equal(p.byOp("whoami").length, 0, "no session read");
});

test("R23 \"Acknowledge it\" sends statementack with the draft, the note as the reason and the secret, the secret in the body only, never in an address", async () => {
  const p = await open("/app/review", { boot: OUTSIDE, plane: { ...outsideCopy(), statementack: ok(statementAck().ok) } });
  const n = p.requests.length;
  await press(p, "statementack", { values: { "ro-note": `  ${NOTE}  ` } });
  const r = last(p, "statementack");
  assert.deepEqual(r.query, { op: "statementack", draft: DR }, "the draft is the only thing in the address");
  assert.deepEqual(r.body, { reason: NOTE, secret: GRANT_SECRET });
  assert.equal(r.headers.Authorization, undefined, "no credential");
  for (const q of p.requests.slice(n)) assert.ok(!q.url.includes(GRANT_SECRET), `${q.op}: the secret in no address`);
  for (const v of [...p.store.values(), ...p.local.values()]) assert.ok(!String(v).includes(GRANT_SECRET), "nor in storage");
  assert.equal(p.byOp("whoami").length, 0);
  assert.ok(drew(p, "screen.review-outside.sent"), "said sent");
  assert.equal(p.doc.getElementById("ro-note").value, "", "the note is cleared once it is sent");
});

test("R23 an empty note is refused and nothing is sent (control); STATEMENT_ACK_NO_REASON and the dead answer are drawn by their words and the note is kept", async () => {
  const p = await open("/app/review", { boot: OUTSIDE, plane: { ...outsideCopy(), statementack: ok(statementAck().ok) } });
  const { slot } = await press(p, "statementack", { values: { "ro-note": "   " } }); // case-inputs' real acknowledgement
  assert.equal(p.byOp("statementack").length, 0, "an empty note sends nothing");
  assert.ok((slot().textContent + text(p)).includes(word("refusal.STATEMENT_ACK_NO_REASON")), "an empty note, in the code's own words");
  const q = await open("/app/review", { boot: OUTSIDE, plane: { ...outsideCopy(), statementack: refusedIn("STATEMENT_ACK_NO_REASON") } });
  const a = await press(q, "statementack", { values: { "ro-note": NOTE } });
  assert.equal(q.byOp("statementack").length, 1, "the plane is asked");
  assert.ok((a.slot().textContent + text(q)).includes(word("refusal.STATEMENT_ACK_NO_REASON")), "STATEMENT_ACK_NO_REASON by its words");
  assert.equal(q.doc.getElementById("ro-note").value, NOTE, "the note is kept");
  const dead = await open("/app/review", { boot: OUTSIDE, plane: { ...outsideCopy(), statementack: refused("NO_REVIEW_COPY", "There is no review copy here.", 404) } });
  const d = await press(dead, "statementack", { values: { "ro-note": NOTE } });
  assert.ok((d.slot().textContent + text(dead)).includes(word("refusal.NO_REVIEW_COPY")), "the dead answer by its words");
  assert.equal(dead.doc.getElementById("ro-note").value, NOTE, "the note is kept");
  assert.ok(!drew(dead, "screen.review-outside.sent"));
});

test("R23 a copy whose statement is absent draws no section and no acknowledgement (control); a statementack answered ok that carries a refusal is not sent (D29)", async () => {
  for (const authored of [{ scope: "Rents." }, { scope: "Rents.", statement: "" }, { scope: "Rents.", statement: null }]) {
    const p = await open("/app/review", { boot: OUTSIDE, plane: outsideCopy(authored) });
    assert.ok(!drew(p, "review.statement.title"), JSON.stringify(authored));
    assert.equal(main(p).querySelector('button[data-act="statementack"]'), null);
    assert.equal(p.doc.getElementById("ro-note"), null);
  }
  const SAID = "The plane's own words for a code the list does not hold.";
  // fixtures-generic: NO_WORDS_FOR_THIS_CODE (a made-up code with no word: the page draws the plane's canned translation)
  const p = await open("/app/review", { boot: OUTSIDE, plane: { ...outsideCopy(), statementack: ok({ started: false, code: "NO_WORDS_FOR_THIS_CODE", translation: SAID }) } });
  await press(p, "statementack", { values: { "ro-note": NOTE } });
  assert.ok(text(p).includes(SAID) && !drew(p, "screen.review-outside.sent"));
  assert.equal(p.doc.getElementById("ro-note").value, NOTE, "kept");
});
