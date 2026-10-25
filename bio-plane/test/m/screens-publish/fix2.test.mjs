/* screens-publish, T51 fix round 2 (C2, C3, C46, C47, C48, C50, C51, C52, C66, C67): the published words of a claim and its
 * falsifier, the pre-flight's unconfirmed documents, a finding in its own words, the editor's label and the sign step's count,
 * preparing and signing as separate steps, a reopened ceremony, the signing key, the owner's reply, the review copy for a member
 * and the minutes line. Each sentence is asserted by its key (R24); every request is compared with its owner's declaration by
 * the harness (interface-shell R104). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { webcrypto } from "node:crypto";
import { open, main, text, drew, drewIn, ops, press, last, fill, tick, norm, until, keptKey, answerSign, button, ok, refusedIn, word, COPY, DOCUMENT, PREFLIGHT, FINDING, F1, B1, E1, P, C, DR, SHA, publishedPlane, findingPath, signDialog } from "./fixtures.mjs";
import { MEMBER } from "../interface-shell/harness.mjs";
import { gateRefusal } from "../case-disclosures/fixtures.mjs";

const PUBLIC = { session: null };
const CER = `/app/ceremony/${P}/${DR}`;
const EDITOR = `/app/case-editor/${P}/${DR}`;
const REVIEW = `/app/review-copy/${P}/${DR}`;
const B64 = "b".repeat(64);
const STEP3 = (o = {}) => ({ step: 3, tensions: { candidates: [], count: 0 }, not_co_attested: [], self_attested: [], ...o });
const WITH = (step3, o = {}) => PREFLIGHT({ steps: [...PREFLIGHT().steps.slice(0, 5), step3, ...PREFLIGHT().steps.slice(5)], ...o });
const body = (o = {}) => ({ state: "published", from_sha: B1, question: "Were the 2024 rent adjustments lawful?", conclusion: "The claim in words.", falsifies: "The falsifier in words.",
  authored: { conclusion: "The authored claim.", falsifier: "The authored falsifier.", falsifier_override: null }, ...o });

/* ---------- C2: the words of the claim and the falsifier, never a heading ---------- */

test("R6 R37 C2 the finding's page draws the signed claim and falsifier as words; a body that is only a heading draws the authored words, never the heading; empty only when there are none", async () => {
  const signed = await open(findingPath(F1), { boot: PUBLIC, plane: publishedPlane([FINDING(F1, { body: body({ authored: { conclusion: "", falsifier: "", falsifier_override: null } }) })], { asked: F1 }) });
  assert.ok(text(signed).includes("The claim in words.") && text(signed).includes("The falsifier in words."), "the signed words, though the authored fields are empty");
  const heading = await open(findingPath(F1), { boot: PUBLIC, plane: publishedPlane([FINDING(F1, { body: body({ conclusion: "## Conclusion", falsifies: "## Falsifier" }) })], { asked: F1 }) });
  assert.ok(text(heading).includes("The authored claim.") && text(heading).includes("The authored falsifier."), "the authored words next");
  assert.ok(!text(heading).includes("## "), "never a heading");
  const mixed = await open(findingPath(F1), { boot: PUBLIC, plane: publishedPlane([FINDING(F1, { body: body({ conclusion: "## Conclusion\n\nThe words under the heading.", falsifies: "" }) })], { asked: F1 }) });
  assert.ok(text(mixed).includes("The words under the heading.") && !text(mixed).includes("## Conclusion"), "control: a section's words are drawn without the heading");
  const none = await open(findingPath(F1), { boot: PUBLIC, plane: publishedPlane([FINDING(F1, { body: body({ conclusion: null, falsifies: null, authored: { conclusion: "", falsifier: "", falsifier_override: null } }) })], { asked: F1 }) });
  assert.ok(!text(none).includes("The claim in words."), "control: nothing is invented where there are none");
});

test("R6 C2 the case page draws each finding's signed claim, else its authored words, never the heading or the question in their place", async () => {
  const f = (o) => FINDING(F1, { body: body(o) });
  const page = (o) => open(`/app/published/${C}`, { boot: PUBLIC, plane: publishedPlane([f(o)]) });
  assert.ok(text(await page({})).includes("The claim in words."), "control: the signed claim");
  const legacy = await page({ conclusion: "## Conclusion" });
  assert.ok(text(legacy).includes("The authored claim.") && !text(legacy).includes("## Conclusion"), "the heading alone draws the authored words");
  assert.ok(!text(legacy).includes("Were the 2024 rent adjustments lawful?"), "the question is not the claim");
  const under = await page({ conclusion: "## Conclusion\n\nThe words under the heading." });
  assert.ok(text(under).includes("The words under the heading.") && !text(under).includes("## Conclusion"));
});

/* ---------- C3: the unconfirmed documents the pre-flight lists, whether or not publish refused ---------- */

test("R51 C3 a pre-flight whose publish was refused CO_ATTESTATION_UNACKNOWLEDGED, listing the unacknowledged captures in step three, draws Retry and the reason box; a ready one lists none (control)", async () => {
  const refusal = gateRefusal().CO_ATTESTATION_UNACKNOWLEDGED;
  const pre = WITH(STEP3({ not_co_attested: [{ capture: B64, by: "dev", findings: [F1] }] }), { ready: false, first: refusal, blockers: [] });
  const p = await open(CER, { plane: { publishpreflight: ok(pre), captureaccounts: ok({ captureSha: B64, actors: [], accounts: [] }) } });
  assert.ok(drew(p, "screen.ceremony.conf.heading"));
  assert.ok(p.doc.querySelector(`[data-unconfirmed="${B64}"]`), "the capture is listed");
  assert.ok(ops(p).includes("reattest"), "Retry");
  assert.ok(p.doc.getElementById("ce-sar-0") && p.doc.getElementById("ce-sa"), "the reason box and the self-attestation tick");
  const ready = await open(CER, { plane: { publishpreflight: ok(WITH(STEP3(), { ready: true, first: null, blockers: [] })) } });
  assert.ok(!drew(ready, "screen.ceremony.conf.heading") && !ops(ready).includes("reattest") && !ready.doc.getElementById("ce-sar-0"));
});

/* ---------- C46: a finding in its own words, never as the file ---------- */

const LOG = "## Session Log\n- RVC-2026-0004 hash 9f2c because the member said so";
const WORDS = [{ target: F1, present: true, text: "The 2024 adjustments had no council vote.\n\n" + LOG, statement: "The 2024 adjustments had no council vote.", role: "load_bearing" }];

test("R1 R61 C46 the case editor and the reader's page draw a finding by its own words and nothing of the session log; a finding with no statement draws its section text (control)", async () => {
  const copy = COPY({ findings: WORDS });
  const e = await open(EDITOR, { plane: { reviewcopy: ok(copy) } });
  assert.ok(main(e).textContent.includes("The 2024 adjustments had no council vote."));
  assert.ok(!main(e).textContent.includes("Session Log") && !main(e).textContent.includes("RVC-2026"), "no log in the editor");
  const r = await open("/app/review", { boot: { session: null, hash: "#grant=SECRET-1" }, plane: { reviewcopy: ok({ ...copy, reader: "recipient", grant: { recipient: "Ana", until: null } }) } });
  assert.ok(main(r).textContent.includes("The 2024 adjustments had no council vote."));
  assert.ok(!main(r).textContent.includes("Session Log") && !main(r).textContent.includes("RVC-2026"), "no log at the reader's door");
  const bare = [{ target: F1, present: true, text: "The words of the section.", statement: null, role: "load_bearing" }];
  const c = await open(EDITOR, { plane: { reviewcopy: ok(COPY({ findings: bare })) } });
  assert.ok(main(c).textContent.includes("The words of the section."), "control");
});

/* ---------- C47: the editor's label and the sign step's count ---------- */

const R = "because";
const sectionOf = (p, key) => main(p).querySelectorAll("h2").find((h) => h.textContent === word(key))?.closest("section") ?? null;
/** The ceremony with its Ties step confirmed: the edition prepared, the Sign step offered. */
async function prepared(o = {}) {
  const p = await open(CER, o);
  tick(p, "ce-tie", "yes");
  await press(p, "publish", { reason: R });
  return p;
}

test("R1 R13 C47 the editor's box for what the case leaves out is labelled for it; the sign step counts what is published and says how many documents the case rests on that are not published with it", async () => {
  const e = await open(EDITOR);
  const label = e.doc.querySelector('label[for="ce-statement"]');
  assert.ok(label && norm(label.textContent) === norm(word("review.statement.title")), "the box is labelled by the key of what it holds");
  assert.notEqual(norm(label.textContent), norm(word("screen.case-editor.statement.label")), "not \"what it says\"");
  const two = DOCUMENT({ citations: { state: "signed", rows: [{ target: "INFO-2026-0004", version: "undetermined" }, { target: "INFO-2026-0005", version: "undetermined" }, { target: "FND-2026-0031", version: "no_bytes" }] } });
  const p = await prepared({ plane: { casedocument: ok(two) } });
  assert.ok(drew(p, "screen.published.rests.on.the.council.minutes", { count: "2" }), "two documents not published with the case");
  assert.ok(!drew(p, "screen.ceremony.signs.count", { n: "2", findings: "1", evidence: "0" }), "\"0 pieces of evidence\" is not the whole truth");
  const q = await prepared();
  assert.ok(drew(q, "screen.ceremony.signs.count", { n: "3", findings: "1", evidence: "1" }), "control: published evidence is counted and listed");
  assert.deepEqual(main(q).querySelectorAll("[data-statement]").map((li) => li.getAttribute("data-statement")), ["case", "finding", "evidence"]);
  assert.ok(!drew(q, "screen.published.rests.on.the.council.minutes.one") && !main(q).querySelector("[data-unsignable]"), "control: every document signs with the edition, so none is said not to");
  const solo = await prepared({ plane: { casedocument: ok(DOCUMENT({ citations: { state: "signed", rows: [{ target: "INFO-2026-0004", version: "only_capture", capture: "c".repeat(64), bundle_sha: E1 }, { target: "INFO-2026-0005", version: "undetermined", capture: null }, { target: "FND-2026-0031", version: "no_bytes", capture: null }] } })) } });
  assert.ok(drew(solo, "screen.published.rests.on.the.council.minutes.one"), "the one document not signed with it");
  const none = await prepared({ plane: { casedocument: ok(DOCUMENT({ citations: { state: "signed", rows: [{ target: "FND-2026-0031", version: "no_bytes", capture: null }] } })) } });
  assert.ok(!drew(none, "screen.published.rests.on.the.council.minutes", { count: "0" }) && !drew(none, "screen.published.rests.on.the.council.minutes.one"), "control: a case resting on no document says none");
});

/* ---------- C48: preparing and signing are separate steps ---------- */

test("R70 C48 the confirmation of \"Confirm, and prepare Edition n\" does not say publishing cannot be taken back; the Sign step does and keeps its weight", async () => {
  const p = await open(CER);
  tick(p, "ce-tie", "yes");
  const b = button(p, "publish");
  await p.click(b);
  await p.settle();
  const dialog = norm(p.root().querySelector(`[data-slot="${b.getAttribute("data-ai")}"]`).textContent);
  assert.ok(dialog.length > 0, "the confirmation is drawn");
  assert.ok(!dialog.includes(norm(word("act.publish.does"))), "the sentence that publishing can never be unpublished is not the prepare confirmation's");
  assert.ok(dialog.includes(norm(word("act.publish.here.ceremony"))), "the confirmation says what preparing does and that it publishes nothing");
  const q = await prepared();
  const sign = button(q, "caseratify");
  assert.ok(sign.getAttribute("data-weighed"), "control: sign keeps its weight");
  assert.ok(drew(q, "signing.ceremony.who", { signer: "dev", project: "The Coliseum lease", group: "River Town" }), "only the Sign step says it cannot be taken back");
});

test("R70 C48 once the edition is prepared the page draws one state: the prepared edition and no list of reasons that stop the signing; before preparing the gates are listed (control)", async () => {
  const p = await open(CER);
  assert.ok(main(p).querySelector("[data-blockers]"), "control: before preparing, the gates are listed");
  tick(p, "ce-tie", "yes");
  await press(p, "publish", { reason: R });
  assert.ok(drew(p, "screen.ceremony.prepared", { edition: "2" }));
  assert.ok(!main(p).querySelector("[data-blockers]"), "no gates beside the prepared edition");
  assert.ok(!drew(p, "ceremony.gate.heading"));
});

test("R70 C48 a reload draws the prepared edition again, read from the record; a draft whose edition was never prepared draws no Sign (control)", async () => {
  const p = await open(CER, { boot: { idb: await keptKey() }, plane: { casedocument: ok(DOCUMENT()) } });
  assert.ok(drew(p, "screen.ceremony.prepared", { edition: "2" }), "the record holds the prepared edition");
  assert.ok(ops(p).includes("caseratify"), "Sign is offered on the reloaded page");
  assert.ok(!main(p).querySelector("[data-blockers]"));
  assert.equal(last(p, "casedocument").query.edition, "2");
  await press(p, "caseratify", { reason: R });
  await answerSign(p, true, "caseratify");
  const b = last(p, "caseratify").body;
  assert.deepEqual([b.caseId, b.edition, b.expectedSha], [C, 2, SHA], "the reloaded page signs the edition the record holds");
  assert.deepEqual(b.members.map((m) => [m.id, m.sha]), [["FND-2026-0031", B1], ["INFO-2026-0004", E1]], "its findings pinned from the record");
  const never = await open(CER, { plane: { casedocument: refusedIn("NO_CASE_DOCUMENT") } });
  assert.ok(!drew(never, "screen.ceremony.prepared", { edition: "2" }) && !ops(never).includes("caseratify"));
  assert.ok(main(never).querySelector("[data-blockers]"));
});

/* ---------- C50: a reopened ceremony shows what is already published ---------- */

const PUBLISHED_ONCE = (n = 1) => ({ publishedcase: (req) => (req.query && req.query.id ? ok({ caseId: C, edition: n, editions: [n], findings: [] }) : ok({ caseId: C, edition: n, latest_edition: n, editions: [n],
  edition_index: [{ edition: n, ratified_at: "2026-07-02T10:00:00Z", published_at: "2026-07-02T14:00:00Z" }], findings: [] })) });
const FIRST_EDITION = COPY({ case: { case_id: C, edition: 1, identity: "The Coliseum lease", newCase: false } });

test("R71 C50 a draft whose edition is published draws that edition and its link and offers no prepare for it; a draft never published draws no such line (control)", async () => {
  const p = await open(CER, { plane: { reviewcopy: ok(FIRST_EDITION), ...PUBLISHED_ONCE(1) } });
  assert.ok(drew(p, "screen.ceremony.published.edition", { n: "1" }), "edition 1 is public");
  const link = main(p).querySelector(`a[href="/app/published/${encodeURIComponent(C + "/1")}"]`);
  assert.ok(link && drewIn(link, "screen.ceremony.publicpage"), "its link");
  assert.ok(!ops(p).includes("publish") && !ops(p).includes("caseratify"), "no prepare for edition 1");
  const q = await open(CER, { plane: { reviewcopy: ok(FIRST_EDITION), publishedcase: refusedIn("NOT_PUBLISHED") } });
  assert.ok(!drew(q, "screen.ceremony.published.edition", { n: "1" }) && !main(q).querySelector(`a[href="/app/published/${encodeURIComponent(C + "/1")}"]`));
  assert.ok(ops(q).includes("publish"), "control: an unpublished draft is unchanged");
});

test("R71 C50 an earlier edition is published and the draft stands at the next: the earlier one is named with its link and the next edition is offered as such (control)", async () => {
  const p = await open(CER, { plane: PUBLISHED_ONCE(1) });
  assert.ok(drew(p, "screen.ceremony.published.edition", { n: "1" }) && main(p).querySelector(`a[href="/app/published/${encodeURIComponent(C + "/1")}"]`));
  assert.ok(ops(p).includes("publish"), "edition 2 is still prepared as the new edition");
  assert.ok(drew(p, "screen.ceremony.heading", { case: "The Coliseum lease", edition: "2" }));
});

/* ---------- C51: the signing key ---------- */

const u32 = (n) => Buffer.from([(n >>> 24) & 255, (n >>> 16) & 255, (n >>> 8) & 255, n & 255]);
/** The public line of a kept key as the plane registers it: the SSH wire form of its 32 bytes, base64. */
const wire = (raw32) => Buffer.concat([u32(11), Buffer.from("ssh-ed25519"), u32(32), Buffer.from(raw32)]).toString("base64");
const sig = /^-----BEGIN SSH SIGNATURE-----/;

test("R72 C51 a key file made earlier is loaded at the Sign step and signs; no key is made or registered at the signing", async () => {
  const file = ["BIOKEY-RAW1", "bio-ratify", Buffer.from(webcrypto.getRandomValues(new Uint8Array(32))).toString("base64")].join(".");
  const p = await prepared();
  await until(p, () => p.doc.querySelector("[data-nokey]"));
  await press(p, "caseratify", { reason: R });
  await until(p, () => signDialog(p));
  assert.ok(signDialog(p).textContent.includes(word("shell.signer.load")), "the sitting offers the key file");
  p.doc.getElementById("cs-key-file").value = file;
  await p.click('[data-shell="dialog-yes"]');
  await until(p, () => p.byOp("caseratify").length > 0);
  const b = last(p, "caseratify").body;
  assert.match(b.sig, sig);
  assert.ok(b.members.length > 0 && b.members.every((m) => sig.test(m.signature)), "every statement signed with the loaded key");
  assert.equal(p.byOp("signerregisterown").length, 0, "no key registered at the signing");
});

test("R72 C51 a key this device already holds is registered as it is when the plane has none for the member, never made anew; with none held the making of one is drawn and made (control)", async () => {
  const idb = await keptKey();
  const held = idb.get("civicsmith-signer").get("keys").get("own");
  const p = await prepared({ boot: { idb }, plane: { caseratify: refusedIn("NO_ATTESTING_KEY") } });
  await press(p, "caseratify", { reason: R });
  await answerSign(p, true, "caseratify");
  await until(p, () => p.doc.querySelector("[data-nokey]"));
  await press(p, "signerregisterown", { reason: R });
  await until(p, () => p.byOp("signerregisterown").length > 0);
  assert.equal(last(p, "signerregisterown").body.keyB64, wire(new Uint8Array(held.raw32)), "the held key's public line");
  assert.equal(idb.get("civicsmith-signer").get("keys").get("own"), held, "the held key is untouched");
  const none = new Map();
  const q = await prepared({ boot: { idb: none } });
  await until(q, () => q.doc.querySelector("[data-nokey]"));
  tick(q, "ce-keep", "keep");
  await press(q, "signerregisterown", { reason: R });
  await until(q, () => q.byOp("signerregisterown").length > 0);
  assert.notEqual(last(q, "signerregisterown").body.keyB64, wire(new Uint8Array(held.raw32)), "control: a device holding none makes one");
  assert.ok(none.get("civicsmith-signer").get("keys").get("own"), "and keeps it by the member's choice");
});

/* ---------- C52: the owner's reply, two drafts ---------- */

const OLD = "RVD-2026-0000";
const TWO_DRAFTS = { casedrafts: ok({ kind: "review-drafts", project: P, drafts: [
  { draft_id: OLD, case: { case_id: C, edition: 1, identity: "The Coliseum lease" }, created_by: "dev", updated_by: "dev" },
  { draft_id: DR, case: { case_id: C, edition: 2, identity: "The Coliseum lease" }, created_by: "dev", updated_by: "dev" }] }),
  reviewcopy: (req) => ok(COPY({ draft: req.query.draft, comments: [{ comment_id: "RVC-" + req.query.draft, author_kind: "recipient", author: "Prof. N. Iyer", recipient: "Prof. N. Iyer", text: "On " + req.query.draft + ": which schedule?", at: "2026-10-07T09:00:00Z" }] })) };

test("R2 R62 C52 the owner's reply is sent for the draft its comment belongs to, each of two drafts, with the text in the body; a stranger's refusal NO_REVIEW_COPY is drawn by its words (control)", async () => {
  for (const [path, draft] of [[`/app/review-copy/${P}/${OLD}`, OLD], [`/app/review-copy/${P}/${DR}`, DR], [`/app/review-copy/${P}`, DR]]) {
    const p = await open(path, { plane: { ...TWO_DRAFTS, reviewcomment: ok({ ok: true, comment: "RVC-9" }) } });
    assert.ok(main(p).textContent.includes("On " + draft + ": which schedule?"), path);
    await press(p, "reviewcomment", { values: { "rc-reply-0": "The council approved the March schedule." } });
    const r = last(p, "reviewcomment");
    assert.deepEqual([r.query.draft, r.body], [draft, { text: "The council approved the March schedule." }], path);
  }
  const q = await open(REVIEW, { plane: { ...TWO_DRAFTS, reviewcomment: refusedIn("NO_REVIEW_COPY") } });
  await press(q, "reviewcomment", { values: { "rc-reply-0": "Thank you." } });
  assert.ok(drew(q, "refusal.NO_REVIEW_COPY"), "control: refused in its own words");
});

/* ---------- C66: the review copy for a member ---------- */

test("R2 C66 the review copy for a member who may not share draws no share boxes without a button; a member who may draws them (control)", async () => {
  const no = await open(REVIEW, { plane: { whoami: ok({ ...MEMBER, member: "dev", handle: "dev", capabilities: [] }) } });
  assert.ok(!ops(no).includes("reviewgrant"), "no share act for this member");
  for (const id of ["rc-name", "rc-role", "rc-until"]) assert.ok(!no.doc.getElementById(id), `${id}: no box without its button`);
  assert.ok(!drew(no, "screen.review-copy.share"), "nor the heading that offers it");
  const yes = await open(REVIEW);
  assert.ok(ops(yes).includes("reviewgrant") && yes.doc.getElementById("rc-name") && drew(yes, "screen.review-copy.share"));
});

/* ---------- C67: the minutes line ---------- */

const withSign = (o) => { const pre = PREFLIGHT(); Object.assign(pre.steps[7], o); return { publishpreflight: ok(pre) }; };

test("R42 C67 a sign step that was not reached draws no minutes line; one that was reached and could not read its minutes still does (control)", async () => {
  const unreached = await open(CER, { plane: withSign({ open_requests: { read: false, stated: "not reached" }, minutes: { undetermined: true } }) });
  assert.ok(!sectionOf(unreached, "screen.ceremony.minutes.heading"), "a case that was never read relies on no minutes we can name");
  assert.ok(!drew(unreached, "signing.minutes.unread"));
  const reached = await open(CER, { plane: withSign({ open_requests: { read: true, lines: [] }, minutes: { undetermined: true } }) });
  assert.ok(drewIn(sectionOf(reached, "screen.ceremony.minutes.heading"), "signing.minutes.unread"), "control: a read that failed is still drawn");
});

test("R13 G29 a document row signs at the row's own `bundle_sha` and never at its capture or its classification; a row without one is named as not signable and no line is drawn for it", async () => {
  const cap = "c".repeat(64), head = "9".repeat(64);
  const doc = DOCUMENT({ citations: { state: "signed", rows: [
    { target: "INFO-2026-0004", version: "only_capture", capture: cap, bundle_sha: head },
    { target: "INFO-2026-0005", version: "pinned", capture: cap },
    { target: "INFO-2026-0006", version: "undetermined", capture: null },
    { target: "FND-2026-0031", version: "no_bytes", capture: null }] } });
  const p = await prepared({ plane: { casedocument: ok(doc) } });
  const lines = main(p).querySelectorAll("[data-statement=evidence]").map((li) => li.textContent);
  assert.equal(lines.length, 1);
  assert.ok(lines[0].includes(`bio-ratify INFO-2026-0004 ${head}`) && !lines[0].includes(cap), "signed at the head");
  const named = main(p).querySelector("[data-unsignable]");
  assert.ok(named && named.textContent.includes("INFO-2026-0005") && named.textContent.includes("INFO-2026-0006") && !named.textContent.includes("INFO-2026-0004"), "the two with no head are named");
  assert.ok(drew(p, "screen.published.rests.on.the.council.minutes", { count: "2" }));
  const q = await prepared();
  assert.equal(main(q).querySelector("[data-unsignable]"), null, "control: every document has its head, none is named");
});
