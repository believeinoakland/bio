/* screens-publish, T51 fix round 3 (C40, C46, C47, C48, C49, C50, C51, C81, C94): the late timestamp the pre-flight now states and the
 * proof still missing, a finding in its title and its own words (and "not concluded yet"), the published page's evidence names, places
 * and falsifier, the prepared and published editions read from the record, the chosen draft heading the page, the Sign step's key file,
 * device key and progress line, a member named by handle, an act re-reading only what it changes, and the controls at 390 px.
 * A word the design has not written yet is drawn as its key (interface-shell R5) and asserted by that key; no test holds a sentence's
 * English (R24, K3810). Every request is compared with its owner's declaration by the harness (interface-shell R104). */
import { registerDeclared } from "../../declared-ops.mjs";
import { registerDeclaredOps } from "../../../src/op-declarations/index.mjs";
await registerDeclared(new URL("../../../../", import.meta.url).pathname, registerDeclaredOps);
import { test } from "node:test";
import assert from "node:assert/strict";
import { open, main, text, drew, day, ops, press, last, fill, tick, norm, until, keptKey, answerSign, ok, refusedIn, pending, word, hasWord, COPY, DOCUMENT, PREFLIGHT, FINDING, F1, B1, P, C, DR, SHA, publishedPlane, findingPath, signDialog } from "./fixtures.mjs";
import { measure } from "./phone.mjs";
import { gateRefusal } from "../case-disclosures/fixtures.mjs";

const PUBLIC = { session: null };
const CER = `/app/ceremony/${P}/${DR}`;
const EDITOR = `/app/case-editor/${P}/${DR}`;
const REVIEW = `/app/review-copy/${P}/${DR}`;
const OUTSIDE = { session: null, hash: "#grant=SECRET-1" };
const B64 = "b".repeat(64);
const F2 = "FND-2026-0032";
const R = "because";
/** A sentence by its key: its word where the list holds one, else the key itself, which is what the page draws until the design writes it. */
const said = (p, key, vars = {}) => (hasWord(key) ? drew(p, key, vars) : text(p).includes(key));
const STEP3 = (o = {}) => ({ step: 3, tensions: { candidates: [], count: 0 }, not_co_attested: [], self_attested: [], ...o });
const WITH = (step3, o = {}) => PREFLIGHT({ steps: [...PREFLIGHT().steps.slice(0, 5), step3, ...PREFLIGHT().steps.slice(5)], ...o });
const count = (p, op) => p.byOp(op).length;

/* ---------- C40: after "ask for the confirmation again", the page says which proof now exists and which is missing ---------- */

const ROW = (o = {}) => ({ capture: B64, by: "dev", findings: [F1], timestamp_at: null, co_archive: null, missing: ["timestamp", "co_archive"], late: false, timestamp_late: false, late_words: null, ...o });
const LATE = "It proves the bytes existed by then, not at capture.";
const HELD_BACK = gateRefusal().CO_ATTESTATION_UNACKNOWLEDGED;

test("R74 R51 C40 after reattest the pre-flight is read again and the document's row says the timestamp was made late and that the outside copy is still missing", async () => {
  let again = false;
  const pre = () => ok(WITH(STEP3({ not_co_attested: [again ? ROW({ timestamp_at: "2026-10-20T10:00:00Z", late: true, timestamp_late: true, late_words: LATE, missing: ["co_archive"] }) : ROW()] }),
    { ready: false, first: HELD_BACK, blockers: [] }));
  const p = await open(CER, { plane: { publishpreflight: pre, reattest: () => { again = true; return ok({ ok: true, captureSha: B64 }); }, captureaccounts: ok({ captureSha: B64, actors: [], accounts: [] }) } });
  assert.ok(drew(p, "screen.ceremony.conf.row.meta"), "before: neither proof exists");
  assert.ok(!text(p).includes(LATE));
  const before = count(p, "publishpreflight");
  await press(p, "reattest", { reason: R });
  assert.ok(count(p, "publishpreflight") > before, "the pre-flight is read again");
  assert.ok(text(p).includes(LATE), "the plane's own sentence about the late timestamp");
  assert.ok(said(p, "screen.ceremony.conf.row.missing.co_archive"), "the outside copy is the proof still missing");
  assert.ok(!drew(p, "screen.ceremony.conf.row.meta"), "no longer both missing");
  assert.ok(!said(p, "screen.ceremony.conf.row.missing.timestamp"), "the timestamp is not missing");
});

test("R74 R51 C40 a row missing only the timestamp says so; a row with both proofs present says it is done and draws no late sentence; an older row with no `missing` keeps the sentence for both (controls)", async () => {
  const page = (row) => open(CER, { plane: { publishpreflight: ok(WITH(STEP3({ not_co_attested: [row] }), { ready: false, first: HELD_BACK, blockers: [] })), captureaccounts: ok({ captureSha: B64, actors: [], accounts: [] }) } });
  const ts = await page(ROW({ co_archive: "2026-10-20T10:05:00Z", missing: ["timestamp"] }));
  assert.ok(said(ts, "screen.ceremony.conf.row.missing.timestamp") && !said(ts, "screen.ceremony.conf.row.missing.co_archive"));
  const done = await page(ROW({ timestamp_at: "2026-10-20T10:00:00Z", co_archive: "2026-10-20T10:05:00Z", missing: [] }));
  assert.ok(said(done, "screen.ceremony.conf.row.done"), "both present draws done");
  assert.ok(!drew(done, "screen.ceremony.conf.row.meta") && !said(done, "screen.ceremony.conf.row.missing.timestamp") && !said(done, "screen.ceremony.conf.row.missing.co_archive"));
  const old = await page({ capture: B64, by: "dev", findings: [F1] });
  assert.ok(drew(old, "screen.ceremony.conf.row.meta"), "an entry with no `missing` is as before");
});

/* ---------- C46: a finding by its title and its own words, never the file, never an id; "not concluded yet" ---------- */

const TEXT_FILE = "## Question\nWere the 2024 rent adjustments lawful?\n\n## Conclusion\n\n## Session Log\n- RVC-2026-0004 hash 9f2c";
const FINDINGS = [
  { target: F1, present: true, title: "Were the 2024 rent adjustments lawful?", statement: "The 2024 adjustments had no council vote.", falsifier: "A council vote in the January 2024 minutes.", concluded: true, not_concluded: null,
    text: "The 2024 adjustments had no council vote.", role: "load_bearing" },
  { target: F2, present: true, title: "Is the fee schedule posted?", statement: null, falsifier: null, concluded: false, not_concluded: "Not concluded yet, said by the plane.", text: TEXT_FILE, role: "supporting" },
];

test("R75 R1 R61 C46 the case editor draws each finding by its title, its statement and what would change it; a finding with no conclusion draws the plane's not-concluded sentence; no heading, file text or question id", async () => {
  const p = await open(EDITOR, { plane: { reviewcopy: ok(COPY({ findings: FINDINGS })) } });
  const t = text(p);
  assert.ok(t.includes("Were the 2024 rent adjustments lawful?") && t.includes("The 2024 adjustments had no council vote."), "title and statement");
  assert.ok(drew(p, "question.concluded.falsifier", { falsifier: "A council vote in the January 2024 minutes." }), "what would change it");
  assert.ok(t.includes("Is the fee schedule posted?") && t.includes("Not concluded yet, said by the plane."), "an empty conclusion draws the not-concluded state");
  assert.ok(!t.includes("## ") && !t.includes("Session Log") && !t.includes("RVC-2026"), "no heading, no log");
  assert.ok(!t.includes(F1) && !t.includes(F2), "no question or finding id");
  const only = await open(EDITOR, { plane: { reviewcopy: ok(COPY({ findings: [FINDINGS[0]] })) } });
  assert.ok(!text(only).includes("Not concluded yet, said by the plane."), "control: a concluded finding draws no not-concluded state");
});

test("R75 R3 C46 the ceremony names each finding by its title, never by its id, in the list of what the edition pins, the photo's reliance and the document's findings; a finding with no stated title is as before (control)", async () => {
  const steps = PREFLIGHT().steps.slice();
  steps[0] = { case: C, edition: 2, pinned: [{ target: F1, bundleSha: B1 }, { target: F2, bundleSha: B1 }] };
  steps[3] = { photos: [{ ref: "INFO-1", sha: "a".repeat(64), taken_by: "dev", relied_on_by: [{ target: F1, role: "relied" }], state: "unchecked", marks: [], copy: null, refused: false, words: "photo.refused.unchecked" }], unchecked: 1 };
  const withRow = [...steps.slice(0, 5), STEP3({ not_co_attested: [ROW({ findings: [F1] })] }), ...steps.slice(5)];
  const p = await open(CER, { plane: { reviewcopy: ok(COPY({ findings: [FINDINGS[0], { ...FINDINGS[1], title: null }] })), publishpreflight: ok(PREFLIGHT({ steps: withRow, ready: false, first: HELD_BACK, blockers: [] })), captureaccounts: ok({ captureSha: B64, actors: [], accounts: [] }) } });
  const t = text(p);
  assert.ok(t.includes("Were the 2024 rent adjustments lawful?"), "the title");
  assert.equal(t.split(F1).length - 1, 0, "the titled finding's id is drawn nowhere");
  assert.ok(drew(p, "screen.ceremony.conf.intro2", { finding: "Were the 2024 rent adjustments lawful?" }), "the document's findings");
  assert.ok(t.includes(F2), "control: a finding whose title is not stated is named as before");
});

test("R75 R17 R61 C46 the outside reader draws each finding by its title, statement and falsifier; a finding with no conclusion draws the not-concluded state; no heading, file text or id", async () => {
  const p = await open("/app/review", { boot: OUTSIDE, plane: { reviewcopy: ok({ ...COPY({ findings: FINDINGS }), reader: "recipient", grant: { recipient: "Ana", until: null } }) } });
  const t = text(p);
  assert.ok(t.includes("Were the 2024 rent adjustments lawful?") && t.includes("The 2024 adjustments had no council vote."));
  assert.ok(drew(p, "question.concluded.falsifier", { falsifier: "A council vote in the January 2024 minutes." }));
  assert.ok(t.includes("Not concluded yet, said by the plane."), "the empty conclusion");
  assert.ok(!t.includes("## ") && !t.includes("Session Log") && !t.includes(F1) && !t.includes(F2), "no heading, log or id");
  const bare = await open("/app/review", { boot: OUTSIDE, plane: { reviewcopy: ok({ ...COPY({ findings: [{ target: F1, present: true, text: "The words of the section.", statement: null, role: "load_bearing" }] }), reader: "recipient", grant: { recipient: "Ana", until: null } }) } });
  assert.ok(!text(bare).includes("The words of the section.") && text(bare).includes(F1), "control: an answer that states no `concluded` and no statement draws its target, never the file's text (R61)");
});

/* ---------- C47: the published page names each evidence entry, its place, and what would change each finding ---------- */

const DOC = (name, page) => ({ name, place: page === null ? null : { kind: "pdf-page", page } });
const LEGS = [
  { ...{ target: "INFO-1", role: "supports", grade: "B", grade_axis: "capture", served: false, cited_edition: null }, document: DOC("Council minutes, 12 January 2024", 1) },
  { ...{ target: "INFO-1", role: "supports", grade: "B", grade_axis: "capture", served: false, cited_edition: null }, document: DOC("Council minutes, 12 January 2024", 6) },
  { ...{ target: "INFO-2", role: "cuts_against", grade: "C", grade_axis: "capture", served: false, cited_edition: null }, document: DOC("A letter from the City Administrator", null) },
  { ...{ target: "WORK-1", role: "supports", grade: "C", grade_axis: "capture", served: false, cited_edition: null }, document: null },
];
const WITH_LEGS = (o = {}) => FINDING(F1, { basis: LEGS, falsifier: "A council vote in the January 2024 minutes.", ...o });

test("R76 R6 R19 C47 the published page draws each finding's evidence entries by their document's name and place, so two entries of one document are told apart, and what would change the finding", async () => {
  const p = await open(`/app/published/${C}`, { boot: PUBLIC, plane: publishedPlane([WITH_LEGS()]) });
  const t = text(p);
  assert.equal(t.split("Council minutes, 12 January 2024").length - 1, 2, "both entries are named");
  assert.ok(t.includes(norm(word("screen.document.passage.where", { page: "2" }))) && t.includes(norm(word("screen.document.passage.where", { page: "7" }))), "each at its own page");
  assert.ok(t.includes("A letter from the City Administrator"), "an entry on a whole document is named with no place");
  assert.ok(drew(p, "screen.published.what.would.overturn.it") && t.includes("A council vote in the January 2024 minutes."), "what would change it");
  const q = await open(findingPath(F1), { boot: PUBLIC, plane: publishedPlane([WITH_LEGS()], { asked: F1 }) });
  assert.equal(text(q).split("Council minutes, 12 January 2024").length - 1, 2, "the finding's own page names them too");
  assert.ok(text(q).includes(norm(word("screen.document.passage.where", { page: "7" }))));
});

test("R76 R6 R19 C47 a finding with no falsifier draws no empty heading on the case page; an entry resting on working material is named by nothing of it (controls)", async () => {
  const p = await open(`/app/published/${C}`, { boot: PUBLIC, plane: publishedPlane([FINDING(F1, { basis: LEGS, falsifier: null, body: { state: "published", from_sha: B1, conclusion: "The claim in words.", authored: { conclusion: "x", falsifier: "", falsifier_override: null } } })]) });
  assert.ok(!drew(p, "screen.published.what.would.overturn.it"), "no empty heading");
  assert.ok(!text(p).includes("WORK-1"), "a leg on working material draws no name and nothing of it");
  const none = await open(`/app/published/${C}`, { boot: PUBLIC, plane: publishedPlane([FINDING(F1, { basis: [] })]) });
  assert.ok(!text(none).includes("Council minutes"), "no entries, none drawn");
});

/* ---------- C48, C50: the prepared and the published edition are read from the record ---------- */

const NO_CASE = COPY({ case: { case_id: null, edition: null, identity: "", newCase: true } });
const DOC_AT = (edition) => (req) => (String(req.query.edition) === String(edition) ? ok(DOCUMENT()) : refusedIn("NO_CASE_DOCUMENT"));

test("R77 R70 C48 a reloaded draft that names no case, whose preparation the record holds, says the edition is prepared and offers the Sign step; the edition is read from the pre-flight's `editions`", async () => {
  const p = await open(CER, { boot: { idb: await keptKey() }, plane: { reviewcopy: ok(NO_CASE), publishpreflight: ok(PREFLIGHT({ editions: { prepared: 2, published: null } })), casedocument: DOC_AT(2) } });
  assert.ok(drew(p, "screen.ceremony.prepared", { edition: "2" }), "prepared again after a reload");
  assert.ok(ops(p).includes("caseratify"), "Sign is offered");
  assert.ok(!main(p).querySelector("[data-blockers]"), "no gates beside the prepared edition");
});

test("R77 R70 C48 the draft's own `editions` (casedrafts) say it is prepared before the pre-flight has answered; the record's edition number is the one read, not the identity's", async () => {
  const drafts = ok({ kind: "review-drafts", project: P, drafts: [{ draft_id: DR, case: { case_id: C, edition: 3, identity: "The Coliseum lease" }, created_by: "dev", updated_by: "dev", editions: { prepared: 2, published: null } }] });
  const p = await open(CER, { plane: { casedrafts: drafts, reviewcopy: ok(COPY({ case: { case_id: C, edition: 3, identity: "The Coliseum lease", newCase: false } })), publishpreflight: pending, casedocument: DOC_AT(2) } });
  assert.ok(drew(p, "screen.ceremony.prepared", { edition: "2" }));
  const never = await open(CER, { plane: { publishpreflight: ok(PREFLIGHT({ editions: { prepared: null, published: null } })), casedocument: refusedIn("NO_CASE_DOCUMENT") } });
  assert.ok(!drew(never, "screen.ceremony.prepared", { edition: "2" }) && !ops(never).includes("caseratify"), "control: a draft never prepared says neither");
  assert.equal(count(never, "casedocument"), 0, "and the record is not asked for a document it says does not exist");
});

test("R77 R71 C50 a draft whose edition the record says is published draws it with the address the record gives, offers nothing to prepare, and reads no public case for it; a draft never published draws no such line (control)", async () => {
  const published = { edition: 1, address: `/app/published/${C}/1` };
  const first = COPY({ case: { case_id: C, edition: 1, identity: "The Coliseum lease", newCase: false } });
  const p = await open(CER, { plane: { reviewcopy: ok(first), publishpreflight: ok(PREFLIGHT({ editions: { prepared: null, published } })), publishedcase: refusedIn("NOT_PUBLISHED") } });
  assert.ok(drew(p, "screen.ceremony.published.edition", { n: "1" }));
  const link = main(p).querySelector(`a[href="/app/published/${encodeURIComponent(C + "/1")}"]`);
  assert.ok(link && !main(p).querySelector(`a[href="${published.address}"]`), "the link is the case page's route as the shell opens it (K4450), never the record's bare-slash address");
  assert.ok(!ops(p).includes("publish") && !ops(p).includes("caseratify"), "no prepare for edition 1");
  const next = await open(CER, { plane: { publishpreflight: ok(PREFLIGHT({ editions: { prepared: null, published } })) } });
  assert.ok(drew(next, "screen.ceremony.published.edition", { n: "1" }) && ops(next).includes("publish"), "edition 2 is still offered as the new edition");
  const never = await open(CER, { plane: { reviewcopy: ok(first), publishpreflight: ok(PREFLIGHT({ editions: { prepared: null, published: null } })) } });
  assert.ok(!drew(never, "screen.ceremony.published.edition", { n: "1" }) && ops(never).includes("publish"), "control: never published");
});

/* ---------- C49: the chosen draft's scope and date head the page ---------- */

const OLD = "RVD-2026-0000";
const TWO = { casedrafts: ok({ kind: "review-drafts", project: P, drafts: [
  { draft_id: OLD, created_at: "2026-09-01T10:00:00Z", case: { case_id: C, edition: 1, identity: "The Coliseum lease" }, created_by: "dev", updated_by: "dev" },
  { draft_id: DR, created_at: "2026-10-01T10:00:00Z", case: { case_id: C, edition: 2, identity: "The Coliseum lease" }, created_by: "dev", updated_by: "dev" }] }),
  reviewcopy: (req) => ok(req.query.draft === OLD
    ? COPY({ draft: OLD, title: "Title of the earlier draft", case: { case_id: C, edition: 1, identity: "The Coliseum lease", newCase: false }, authored: { scope: "The scope of the earlier draft." } })
    : COPY({ draft: DR, title: "Title of the newest draft", authored: { scope: "The scope of the newest draft." } })) };

test("R73 C49 opened on the earlier draft, each screen's heading is that draft's and the chooser shows its scope and day chosen; the default draft's headings are unchanged (control)", async () => {
  for (const [id, path] of [["ceremony", `/app/ceremony/${P}/${OLD}`], ["review-copy", `/app/review-copy/${P}/${OLD}`], ["case-editor", `/app/case-editor/${P}/${OLD}`]]) {
    const p = await open(path, { plane: TWO });
    const head = main(p).querySelector("h1").textContent;
    if (id !== "case-editor") assert.equal(norm(head), "Title of the earlier draft", id);
    else assert.ok(norm(head).includes("The Coliseum lease") && norm(head).includes("1"), id);
    const sel = p.doc.getElementById("drafts-" + id);
    assert.ok(sel, id + ": the chooser is drawn");
    const chosen = [...sel.querySelectorAll("option")].find((o) => o.getAttribute("selected") !== null);
    assert.ok(chosen && String(chosen.value || chosen.getAttribute("value")) === OLD, id + ": the earlier draft is the one chosen");
    assert.ok(text(p, sel).includes("The scope of the earlier draft."), id + ": its scope");
  }
  const dflt = await open(`/app/ceremony/${P}`, { plane: TWO });
  assert.equal(norm(main(dflt).querySelector("h1").textContent), "Title of the newest draft", "control: the newest draft heads the default");
  assert.ok(text(dflt, dflt.doc.getElementById("drafts-ceremony")).includes("The scope of the newest draft."));
});

/* ---------- C51: the Sign step loads a key file, reuses the device's key, and shows progress while a key is registered ---------- */

const KEYFILE = ["BIOKEY-RAW1", "bio-ratify", Buffer.from(new Uint8Array(32).fill(7)).toString("base64")].join(".");
const chooseKey = (p, content) => { p.doc.getElementById("ce-keyfile").files = [{ name: "bio-signing-key.txt", size: content.length, text: async () => content }]; };
const sigStart = /^-----BEGIN SSH SIGNATURE-----/;
async function prepared(o = {}) {
  const p = await open(CER, o);
  tick(p, "ce-tie", "yes");
  await press(p, "publish", { reason: R });
  return p;
}

test("R78 R72 C51 a key file chosen at the Sign step is loaded for the sitting (the sign dialog is given its text) and signs; no key is made or registered", async () => {
  const p = await prepared();
  await until(p, () => p.doc.getElementById("ce-keyfile"));
  assert.ok(p.doc.getElementById("ce-keyfile"), "the Sign step offers the key file");
  chooseKey(p, KEYFILE);
  await press(p, "caseratify", { reason: R });
  await until(p, () => signDialog(p));
  assert.ok(!p.doc.getElementById("cs-key-file"), "the signer was handed the file's text, so the dialog asks for no key box (interface-shell R116)");
  await p.click('[data-shell="dialog-yes"]');
  await until(p, () => count(p, "caseratify") > 0);
  const b = last(p, "caseratify").body;
  assert.match(b.sig, sigStart);
  assert.ok(b.members.length > 0 && b.members.every((m) => sigStart.test(m.signature)));
  assert.equal(count(p, "signerregisterown"), 0, "no key registered at the signing");
});

test("R78 R72 C51 the key a file loaded is the one registered when the plane has none for the member", async () => {
  const p = await prepared({ plane: { caseratify: refusedIn("NO_ATTESTING_KEY") } });
  await until(p, () => p.doc.getElementById("ce-keyfile"));
  chooseKey(p, KEYFILE);
  await press(p, "caseratify", { reason: R });
  await until(p, () => signDialog(p));
  await p.click('[data-shell="dialog-yes"]');
  await until(p, () => p.doc.querySelector("[data-nokey]"));
  await press(p, "signerregisterown", { reason: R });
  await until(p, () => count(p, "signerregisterown") > 0);
  const line = last(p, "signerregisterown").body.keyB64;
  assert.ok(/^[A-Za-z0-9+/=]{60,}$/.test(line), "a public line was registered");
  assert.equal(count(p, "signerregisterown"), 1);
});

test("R78 R72 C51 with a key file chosen that is empty, the sitting refuses in the kit's word and signs nothing; with no file and no device key the step is as before and the dialog's text box is empty (controls)", async () => {
  const p = await prepared();
  await until(p, () => p.doc.getElementById("ce-keyfile"));
  chooseKey(p, "   ");
  await press(p, "caseratify", { reason: R });
  await p.settle();
  assert.equal(count(p, "caseratify"), 0);
  assert.ok(!signDialog(p), "nothing is asked of the device");
  assert.ok(text(p).includes("shell.keyfile.empty") || drew(p, "shell.keyfile.empty"), "refused in the kit's word");
  const q = await prepared();
  await until(q, () => q.doc.querySelector("[data-nokey]"));
  await press(q, "caseratify", { reason: R });
  await until(q, () => signDialog(q));
  assert.equal(q.doc.getElementById("cs-key-file").value, "", "control: no file chosen, the text box is as it was");
});

test("R78 R72 C51 a key this device holds signs without a key file or a registration, and the Sign step offers no key file then (control)", async () => {
  const idb = await keptKey();
  const p = await prepared({ boot: { idb } });
  await p.settle();
  assert.ok(!p.doc.getElementById("ce-keyfile"), "no key file asked for");
  assert.ok(!p.doc.querySelector("[data-nokey]"), "no making of a key offered");
  await press(p, "caseratify", { reason: R });
  await answerSign(p, true, "caseratify");
  assert.match(last(p, "caseratify").body.sig, sigStart);
  assert.equal(count(p, "signerregisterown"), 0);
});

test("R78 R15 R72 C51 a progress line is drawn while the key is made and registered, and gives way to the registered sentence; it times the key making", async () => {
  const p = await prepared({ boot: { idb: new Map() }, plane: { caseratify: refusedIn("NO_ATTESTING_KEY"), signerregisterown: pending } });
  await until(p, () => p.doc.querySelector("[data-nokey]"));
  tick(p, "ce-keep", "keep");
  await press(p, "signerregisterown", { reason: R });
  await until(p, () => count(p, "signerregisterown") > 0);
  assert.ok(said(p, "screen.ceremony.registering"), "the progress line is drawn while the request is out");
  const done = await prepared({ boot: { idb: new Map() }, plane: { caseratify: refusedIn("NO_ATTESTING_KEY"), signerregisterown: ok({ ok: true, key: "k" }) } });
  await until(done, () => done.doc.querySelector("[data-nokey]"));
  tick(done, "ce-keep", "keep");
  await press(done, "signerregisterown", { reason: R });
  await until(done, () => drew(done, "screen.ceremony.registered"));
  assert.ok(!said(done, "screen.ceremony.registering"), "control: once registered the progress line is gone");
});

/* ---------- C94: a member is named by handle, never by id ---------- */

const ROSTER = (members) => ({ memberlist: ok({ members }) });
const FROM_ADMIN = COPY({ comments: [{ comment_id: "RVC-2", author_kind: "member", author: "admin", text: "I will answer this one.", at: "2026-10-08T09:00:00Z" }],
  statement_acknowledgements: { acknowledgements: [{ by: "admin", reason: "Another project's.", at: "2026-10-05T10:00:00Z" }] } });

test("R79 R2 R62 C94 the review copy names a member's reply and a member's acknowledgement by handle; the founder's id is never drawn", async () => {
  const p = await open(REVIEW, { plane: { ...ROSTER([{ member_id: "admin", handle: "rosa" }]), reviewcopy: ok(FROM_ADMIN) } });
  assert.ok(drew(p, "screen.review-copy.from.member", { who: "rosa" }), "the reply's author");
  assert.ok(!/\badmin\b/.test(text(p)), "no member id text");
  const e = await open(EDITOR, { plane: { ...ROSTER([{ member_id: "admin", handle: "rosa" }]), reviewcopy: ok(FROM_ADMIN) } });
  assert.ok(drew(e, "screen.case-editor.ack.by", { who: "rosa" }) && !/\badmin\b/.test(text(e)), "the editor's acknowledgement");
});

test("R79 R2 R62 C94 with no handle known the founder is named by the fallback word, never the id (control); a plain handle is drawn as itself", async () => {
  const p = await open(REVIEW, { plane: { ...ROSTER([]), reviewcopy: ok(FROM_ADMIN) } });
  assert.ok(drew(p, "screen.review-copy.from.member", { who: word("member.founder.unnamed") }));
  assert.ok(!/\badmin\b/.test(text(p)));
  const h = await open(REVIEW, { plane: { ...ROSTER([]), reviewcopy: ok(COPY({ comments: [{ comment_id: "RVC-3", author_kind: "member", author: "dev", text: "Here.", at: "2026-10-08T09:00:00Z" }] })) } });
  assert.ok(drew(h, "screen.review-copy.from.member", { who: "dev" }), "the signed-in member's own handle");
});

test("R79 R7 R25 R43 C94 an imported case's importer and its stake's maker, and a docket mark's maker, are named by handle when only a member id is stated; the founder with no handle is the fallback word, never `admin` (controls)", async () => {
  const roster = ROSTER([{ member_id: "m-9", handle: "ana" }]);
  const edition = (o) => ({ edition: 2, imported_by: "m-9", imported_at: "2026-10-01T09:00:00Z", findings: [{ finding: "FND-W-1", title: "A finding", result: "recreated" }],
    group_fields: { name: "West Oakland Neighbors", matter_stake: { stake: "Our block.", set_by: "m-9", set_at: "2026-09-01T09:00:00Z" } }, ...o });
  const p = await open("/app/imported/IMP-2026-0001", { plane: { ...roster, importedcase: ok({ import: "IMP-2026-0001", group: "West Oakland Neighbors", case: "Port lease", edition: edition({}) }) } });
  assert.ok(drew(p, "screen.imported.from", { group: "West Oakland Neighbors", edition: "2", by: "ana", at: day("2026-10-01") }), "the importer");
  assert.ok(drew(p, "stake.set", { who: "ana", date: day("2026-09-01") }), "the stake's maker");
  assert.ok(!text(p).includes("m-9"));
  const founder = await open("/app/imported/IMP-2026-0001", { plane: { ...ROSTER([]), importedcase: ok({ import: "IMP-2026-0001", group: "West Oakland Neighbors", case: "Port lease", edition: edition({ imported_by: "admin" }) }) } });
  assert.ok(!/\badmin\b/.test(text(founder)) && text(founder).includes(word("member.founder.unnamed")), "control: the founder with no handle known");
  const mark = { kind: "legal", note: "A letter.", at: "2026-10-01T09:00:00Z", by: { member: "m-9" } };
  const d = await open(`/app/docket/${P}/${C}`, { plane: { ...roster, docket: ok({ case: C, project: P, entries: [{ shelf: "record", entry: 2, kind: "court-order", summary: "Order.", proposed: "public", state: "filed", filed_at: "2026-11-20T09:00:00Z", pressure: mark }], wrote: false }), holdsdue: ok({ items: [] }) } });
  assert.ok(drew(d, "screen.docket.pressure.mark", { member: "ana" }) && !text(d).includes("m-9"), "the mark's maker");
});

/* ---------- R113: an act re-reads only what it changes ---------- */

test("R79 R2 R51 C14 an act that changes only a later read re-reads that and not the screen's other reads; publishing re-reads the copy and the drafts", async () => {
  const pre = () => ok(WITH(STEP3({ not_co_attested: [ROW()] }), { ready: false, first: HELD_BACK, blockers: [] }));
  const p = await open(CER, { plane: { publishpreflight: pre, reattest: ok({ ok: true, captureSha: B64 }), captureaccounts: ok({ captureSha: B64, actors: [], accounts: [] }) } });
  const was = Object.fromEntries(["reviewcopy", "image", "casedrafts", "groupidentity", "publishpreflight"].map((o) => [o, count(p, o)]));
  await press(p, "reattest", { reason: R });
  for (const o of ["reviewcopy", "image", "casedrafts", "groupidentity"]) assert.equal(count(p, o), was[o], o + " is not read again");
  assert.ok(count(p, "publishpreflight") > was.publishpreflight, "the pre-flight is");
  const q = await open(CER);
  const before = { reviewcopy: count(q, "reviewcopy"), casedrafts: count(q, "casedrafts") };
  tick(q, "ce-tie", "yes");
  await press(q, "publish", { reason: R });
  assert.ok(count(q, "reviewcopy") > before.reviewcopy && count(q, "casedrafts") > before.casedrafts, "control: publishing changes the draft, so both are read again");
});

/* ---------- C81: at 390 px nothing is cut and every target is at least 44 px; the desktop layout is unchanged ---------- */

const PERSON_ROWS = { reviewcopy: ok(COPY()) };

test("R79 R2 R62 C81 at 390 px the review copy's Comment control and its reply box are inside the screen, at least 44 px, and the reply box is wide enough to type in", { timeout: 120000 }, async () => {
  const m = await measure(REVIEW, 390, { answers: PERSON_ROWS, inspect: (W) => {
    const b = document.querySelector('#cs-main button[data-act="reviewcomment"]'), f = document.querySelector("#cs-main textarea");
    const rb = b.getBoundingClientRect(), rf = f.getBoundingClientRect();
    return { main: document.getElementById("cs-main").scrollWidth, right: rb.right, h: rb.height, w: rb.width, fw: rf.width, over: [...document.querySelectorAll("#cs-main *")].filter((e) => e.getBoundingClientRect().right > W + 0.5 && e.getBoundingClientRect().width > 0).map((e) => e.localName + "." + e.className) };
  } });
  assert.ok(m.main <= 390, "the main area is no wider than the screen: " + m.main);
  assert.ok(m.right <= 390 && m.h >= 43.5 && m.w >= 43.5, "Comment is inside the screen and 44 px: " + JSON.stringify(m));
  assert.ok(m.fw >= 200, "the reply box is a box to type in: " + m.fw);
});

test("R79 R1 C81 at 390 px the case editor's people rows and links are inside the screen and every target is 44 px; the readiness ladder's numbers are clear of the words of the rung before", { timeout: 120000 }, async () => {
  const m = await measure(EDITOR, 390, { inspect: (W) => {
    const out = (function () { // the common measure, run in the page
      const seen = (e) => { const r = e.getBoundingClientRect(), s = getComputedStyle(e); return r.width > 0 && r.height > 0 && s.visibility !== "hidden" && s.display !== "none"; };
      const o = { mainScroll: document.getElementById("cs-main").scrollWidth, over: [], small: [] };
      for (const e of document.querySelectorAll("#cs-main *")) {
        if (!seen(e) || e.closest(".tw") || e.closest("[data-tip]") || e.matches(".w, .cs-pips, .cs-pips *")) continue;
        const r = e.getBoundingClientRect();
        if (r.right > W + 0.5 || r.left < -0.5) o.over.push(e.localName + "." + (e.className || "") + " " + (e.textContent || "").trim().slice(0, 24));
        if (e.matches("a, button, input, select, textarea, summary")) {
          const t = e.matches("input[type=checkbox], input[type=radio]") && e.closest("label") ? e.closest("label").getBoundingClientRect() : r;
          if (t.height < 43.5 || (t.width < 43.5 && !e.matches("input[type=checkbox], input[type=radio]"))) o.small.push(e.localName + " " + Math.round(t.width) + "x" + Math.round(t.height) + " " + (e.textContent || "").trim().slice(0, 24));
        }
      }
      return o;
    })();
    const ol = document.querySelector('[data-ladder="ready"]');
    out.rungs = [...ol.children].map((li) => { const s = getComputedStyle(li); return { pos: s.listStylePosition, type: s.listStyleType }; });
    return out;
  } });
  assert.ok(m.mainScroll <= 390, "the main area is no wider than the screen: " + m.mainScroll);
  assert.deepEqual(m.over, [], "nothing runs past the edge");
  assert.deepEqual(m.small, [], "every target is at least 44 px");
  assert.ok(m.rungs.every((r) => r.pos === "inside" || r.type === "none"), "each rung's number sits inside its own box, not over the rung before: " + JSON.stringify(m.rungs));
});

test("R79 R7 R8 R3 C81 at 390 px the docket's \"Post it, signed\" and the imported list's links are inside the screen and 44 px; the ceremony's controls stay so", { timeout: 180000 }, async () => {
  const body = () => { const o = (function () {
    const seen = (e) => { const r = e.getBoundingClientRect(), s = getComputedStyle(e); return r.width > 0 && r.height > 0 && s.visibility !== "hidden" && s.display !== "none"; };
    const out = { main: document.getElementById("cs-main").scrollWidth, over: [], small: [] };
    for (const e of document.querySelectorAll("#cs-main *")) {
      if (!seen(e) || e.closest(".tw") || e.closest("[data-tip]")) continue;
      const r = e.getBoundingClientRect();
      if (r.right > 390.5 || r.left < -0.5) out.over.push(e.localName + "." + (e.className || "") + " " + (e.textContent || "").trim().slice(0, 24));
      if (e.matches("a, button, select, textarea, summary")) { if (r.height < 43.5) out.small.push(e.localName + " " + Math.round(r.width) + "x" + Math.round(r.height) + " " + (e.textContent || "").trim().slice(0, 24)); }
    }
    return out;
  })(); return o; };
  for (const [path, id] of [[`/app/docket/${P}/${C}`, "docket"], ["/app/imported/IMP-2026-0001", "imported"], [CER, "ceremony"]]) {
    const m = await measure(path, 390, { waitFor: "#cs-main h1, #cs-main h2, #cs-main p", inspect: body });
    assert.ok(m.main <= 390, id + ": the main area is no wider than the screen: " + m.main);
    assert.deepEqual(m.over, [], id + ": nothing runs past the edge");
    assert.deepEqual(m.small.filter((x) => !/^select/.test(x)), [], id + ": every link and button is 44 px");
  }
});

test("R79 R1 R2 C81 control: at 1280 px the case editor and the review copy are the desktop layout (the ladder in one row, nothing wider than the screen)", { timeout: 120000 }, async () => {
  for (const path of [EDITOR, REVIEW]) {
    const m = await measure(path, 1280, { inspect: () => {
      const ol = document.querySelector('[data-ladder="ready"]');
      return { main: document.getElementById("cs-main").scrollWidth, row: ol ? new Set([...ol.children].map((li) => Math.round(li.getBoundingClientRect().top))).size : 1 };
    } });
    assert.ok(m.main <= 1280, path + " " + m.main);
    assert.equal(m.row, 1, path + ": the rungs stay in one row");
  }
});
