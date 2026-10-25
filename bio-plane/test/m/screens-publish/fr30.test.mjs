/* screens-publish FR-30 (T51 fix round; K4165, K4168, K4192, K4194, K4197): R52 the docket starts the next edition. Each sentence is
 * asserted by its key (R24); every request is compared with its owner's declaration by the harness (interface-shell R104). */
import { registerDeclared } from "../../declared-ops.mjs";
import { registerDeclaredOps } from "../../../src/op-declarations/index.mjs";
await registerDeclared(new URL("../../../../", import.meta.url).pathname, registerDeclaredOps);
import { test } from "node:test";
import assert from "node:assert/strict";
import { open, main, drew, drewIn, ops, press, last, fill, choose, until, keptKey, ok, word, hasWord, COPY, PREFLIGHT, GRANT_SECRET, P, C, DR } from "./fixtures.mjs";

const tick = (p, id, v) => { p.doc.getElementById(id).querySelectorAll("input").forEach((b) => { if (b.value === v) b.checked = true; }); };
const DOCKET = `/app/docket/${P}/${C}`;
const boxes = (p) => p.doc.getElementById("dk-next-findings").querySelectorAll("input");

test("R52 'Start the next edition' sends casedraft with the published case's caseId, the findings chosen and the scope, and opens the case editor on the new draft", async () => {
  const p = await open(DOCKET, { plane: { casedraft: { status: 200, json: { ok: true, result: { ok: true, draftId: DR, project: P, caseId: C } } } } });
  assert.ok(drew(p, "screen.docket.next.heading"));
  assert.ok(ops(p).includes("casedraft"));
  assert.equal(boxes(p).length, 1);
  boxes(p)[0].checked = true;
  fill(p, { "dk-next-scope": "Corrects the 2025 rent schedule." });
  await press(p, "casedraft");
  const body = last(p, "casedraft").body;
  assert.equal(body.caseId, C);
  assert.equal(body.project, P);
  assert.deepEqual(body.targets, ["FND-2026-0031"]);
  assert.equal(body.scope, "Corrects the 2025 rent schedule.");
  assert.equal(decodeURIComponent(p.location.pathname), `/app/case-editor/${P}/${DR}`, "the editor opens on the new draft");
});

test("R52 with no finding chosen, or no scope, nothing is sent and the refusal is in its fold (controls)", async () => {
  const p = await open(DOCKET);
  fill(p, { "dk-next-scope": "Corrects it." });
  await press(p, "casedraft");
  assert.equal(p.byOp("casedraft").length, 0);
  assert.ok(drew(p, "screen.docket.next.refused.nofinding"));
  boxes(p)[0].checked = true;
  fill(p, { "dk-next-scope": "" });
  await press(p, "casedraft");
  assert.equal(p.byOp("casedraft").length, 0);
  assert.ok(drew(p, "screen.docket.next.refused.noscope"));
  assert.ok(main(p));
});

const IMPORT = (acc) => ({ importedcase: { status: 200, json: { ok: true, result: { import: "IMP-2026-0001", group: "West Oakland Neighbors", case: "CASE-2026-3549", scope: "Port lease revenue",
  edition: { edition: 2, findings: [{ finding: "FND-W-1", title: "Port lease revenue fell short", result: "recreated", origin: acc ? { acceptance: { by: "ana", at: "2026-10-02T09:00:00Z", reason: "checked", checked: "x" } } : {} }] } } } } });

test("R55 an accepted import offers 'Withdraw this acceptance, with a reason' and the act sends the reason", async () => {
  const p = await open("/app/imported/IMP-2026-0001/2", { plane: IMPORT(true) });
  assert.ok(ops(p).includes("importacceptwithdraw"));
  await press(p, "importacceptwithdraw", { values: { "im-withdraw": "The schedule was later corrected." } });
  const body = last(p, "importacceptwithdraw").body;
  assert.equal(body.import, "IMP-2026-0001");
  assert.equal(body.edition, 2);
  assert.equal(body.reason, "The schedule was later corrected.");
});

test("R55 a non-accepted import offers no withdrawal, and a withdrawal with no reason sends nothing (controls)", async () => {
  const none = await open("/app/imported/IMP-2026-0001/2", { plane: IMPORT(false) });
  assert.ok(!ops(none).includes("importacceptwithdraw"));
  const p = await open("/app/imported/IMP-2026-0001/2", { plane: IMPORT(true) });
  await press(p, "importacceptwithdraw", { values: { "im-withdraw": "  " } });
  assert.equal(p.byOp("importacceptwithdraw").length, 0);
});

const PUBLIC = { session: null };

test("R56 the doorbell's consent form sends the declared fields, with no credential: the phrase, the detail, who may be told, and agree or take back", async () => {
  const p = await open("/app/doorbell", { boot: PUBLIC, plane: { knockerconsent: { status: 200, json: { ok: true, result: { ok: true } } } } });
  assert.ok(drew(p, "screen.doorbell.consent.heading"));
  assert.ok(ops(p).includes("knockerconsent"));
  await press(p, "knockerconsent", { values: { "dc-secret": "a-long-phrase-of-at-least-twenty", "dc-entry": "7", "dc-answer": "no" } });
  const r = last(p, "knockerconsent");
  assert.equal(r.headers.Authorization, undefined);
  assert.deepEqual(r.body, { knockerSecret: "a-long-phrase-of-at-least-twenty", entry: "7", audience: "member", withdraw: true });
  await press(p, "knockerconsent", { values: { "dc-secret": "a-long-phrase-of-at-least-twenty", "dc-entry": "7", "dc-answer": "yes" } });
  assert.equal(last(p, "knockerconsent").body.withdraw, false);
});

test("R56 with no answer chosen nothing is sent; a refusal is drawn by its words (controls)", async () => {
  const p = await open("/app/doorbell", { boot: PUBLIC, plane: { knockerconsent: { status: 200, json: { ok: true, result: { ok: false, code: "SECRET_NOT_RECOGNISED", reason: "SECRET_NOT_RECOGNISED" } } } } });
  await press(p, "knockerconsent", { values: { "dc-secret": "a-long-phrase-of-at-least-twenty", "dc-entry": "7" } });
  assert.equal(p.byOp("knockerconsent").length, 0);
  await press(p, "knockerconsent", { values: { "dc-secret": "a-long-phrase-of-at-least-twenty", "dc-entry": "7", "dc-answer": "yes" } });
  assert.ok(drew(p, "screen.doorbell.consent.refused.secret"));
});

test("R67 the receipt draws the knock's reference under the heading, by key; an answer without one draws the receipt as before (control)", async () => {
  const withRef = await open("/app/doorbell", { boot: PUBLIC, plane: { knock: { status: 200, json: { ok: true, result: { ok: true, knockId: "KNOCK-77" } } } } });
  choose(withRef, "db-file", new Uint8Array([104, 105]));
  await press(withRef, "knock");
  assert.ok(withRef.doc.querySelector("[data-received]"));
  assert.ok(drew(withRef, "screen.doorbell.after.head"));
  assert.ok(drew(withRef, "screen.doorbell.reference", { reference: "KNOCK-77" }), "the reference is the knockId the doorbell answers");
  const without = await open("/app/doorbell", { boot: PUBLIC, plane: { knock: { status: 200, json: { ok: true, result: { ok: true } } } } });
  choose(without, "db-file", new Uint8Array([104, 105]));
  await press(without, "knock");
  assert.ok(without.doc.querySelector("[data-received]"));
  assert.ok(!drew(without, "screen.doorbell.after.head"));
});

test("R49 the receipt draws the knock's fingerprint, size, pseudonym and a made phrase once each by key; the phrase is kept nowhere (B420 1)", async () => {
  const MADE = "SENTINEL-MADE-9QX7-4M2K-8TTR";
  const answer = { ok: true, knockId: "KNOCK-77", sha256: "ab12" + "0".repeat(56) + "ef90", bytes: 2100000, pseudonym: "PSEUD-K3", secret: MADE };
  const p = await open("/app/doorbell", { boot: PUBLIC, plane: { knock: { status: 200, json: { ok: true, result: answer } } } });
  choose(p, "db-file", new Uint8Array([104, 105]));
  await press(p, "knock");
  const r = p.doc.querySelector("[data-receipt]");
  assert.ok(r, "the receipt is drawn");
  assert.ok(drew(p, "screen.doorbell.receipt.fingerprint", { fingerprint: "ab120000…0000ef90" }));
  assert.ok(drew(p, "screen.doorbell.receipt.fingerprint.help"));
  assert.ok(drew(p, "screen.doorbell.receipt.size", { size: "2.1 MB" }));
  assert.ok(drew(p, "screen.doorbell.receipt.pseudonym", { pseudonym: "PSEUD-K3" }) && drew(p, "screen.doorbell.receipt.pseudonym.help"));
  assert.ok(drew(p, "screen.doorbell.receipt.secret", { secret: MADE }) && drew(p, "screen.doorbell.receipt.secret.note"));
  assert.equal(String(r.textContent).split(MADE).length - 1, 1, "the phrase is drawn once");
  assert.ok(!JSON.stringify(p.requests).includes(MADE), "the made phrase is in no later request");
  assert.ok(!String(p.location.href).includes(MADE), "nor in an address");
  assert.ok(!JSON.stringify(p.storage || {}).includes(MADE), "nor in storage");
});

test("R49 'Make one for me' sends generateSecret and no phrase, even with one typed; unticked it sends the typed phrase and not generateSecret (control)", async () => {
  const p = await open("/app/doorbell", { boot: PUBLIC });
  assert.ok(drew(p, "screen.doorbell.secret.make") && drew(p, "screen.doorbell.secret.make.help"));
  choose(p, "db-file", new Uint8Array([104, 105]));
  tick(p, "db-make", "make");
  fill(p, { "db-secret": "typed-and-then-ignored-by-the-tick" });
  await press(p, "knock");
  const b = last(p, "knock").body;
  assert.equal(b.generateSecret, true);
  assert.equal(b.knockerSecret, undefined);
  const q = await open("/app/doorbell", { boot: PUBLIC });
  choose(q, "db-file", new Uint8Array([104, 105]));
  await press(q, "knock", { values: { "db-secret": "a-long-enough-secret-phrase-of-mine" } });
  assert.equal(last(q, "knock").body.knockerSecret, "a-long-enough-secret-phrase-of-mine");
  assert.equal(last(q, "knock").body.generateSecret, undefined);
});

test("R49 an answer without the fingerprint, size, pseudonym or phrase draws none of them (control)", async () => {
  const p = await open("/app/doorbell", { boot: PUBLIC, plane: { knock: { status: 200, json: { ok: true, result: { ok: true, knockId: "KNOCK-1" } } } } });
  choose(p, "db-file", new Uint8Array([104, 105]));
  await press(p, "knock");
  assert.ok(p.doc.querySelector("[data-received]") && p.doc.querySelector("[data-receipt]"));
  for (const sel of ["[data-fingerprint]", "[data-size]", "[data-pseudonym]", "[data-secret]"]) assert.equal(p.doc.querySelector(sel), null, sel);
});

const CER = `/app/ceremony/${P}/${DR}`;

test("R66 a pre-flight refused for no finding draws the gate and the door to the case editor's findings; an action request refused NO_TARGET draws the old key (control)", async () => {
  const none = await open(CER, { plane: { reviewcopy: ok(COPY({ findings: [] })), publishpreflight: ok(PREFLIGHT({ first: { ok: false, code: "PUBLISH_NO_FINDING", reason: "PUBLISH_NO_FINDING" }, blockers: [] })) } });
  assert.ok(drew(none, "ceremony.gate.notargets"));
  const door = none.doc.querySelector("[data-addfinding]");
  assert.ok(door && drew(none, "screen.ceremony.gate.addfinding"));
  assert.ok(door.getAttribute("href").startsWith(`/app/case-editor/${encodeURIComponent(P + "/" + DR)}`) && door.getAttribute("href").endsWith("#what-goes-in"));
  assert.ok(word("refusal.PUBLISH_NO_FINDING") && hasWord("refusal.NO_TARGET"));
  const act = await open(CER, { plane: { publishpreflight: ok(PREFLIGHT({ first: { ok: false, code: "NO_TARGET" }, blockers: [] })) } });
  assert.ok(!act.doc.querySelector("[data-addfinding]"), "NO_TARGET stays the action request's; the gate does not take it for no finding");
});

test("R45 a browser that holds no signing key is offered one as soon as the Sign step is drawn, before any caseratify; with a key held neither is drawn (control)", async () => {
  const signStep = () => { const pre = PREFLIGHT(); return { publishpreflight: ok(pre) }; };
  const p = await open(CER, { plane: signStep() });
  tick(p, "ce-tie", "yes");
  await press(p, "publish", { reason: "x" });
  await until(p, () => p.doc.querySelector("[data-nokey]"));
  assert.ok(p.doc.querySelector("[data-nokey]"));
  assert.ok(ops(p).includes("signerregisterown"));
  assert.equal(p.byOp("caseratify").length, 0);
  const idb = await keptKey();
  const q = await open(CER, { plane: signStep(), boot: { idb } });
  tick(q, "ce-tie", "yes");
  await press(q, "publish", { reason: "x" });
  await until(q, () => ops(q).includes("caseratify"));
  await q.settle();
  assert.ok(!q.doc.querySelector("[data-nokey]"));
});

const NOCASE = (o = {}) => COPY({ case: { case_id: null, edition: null, identity: "A CASE THIS DRAFT DOES NOT NAME AND PUBLICATION DERIVES", newCase: true }, title: word("review.title.draft", { title: "Rents, 2024 to 2026" }), ...o });

const REVIEW = `/app/review-copy/${P}/${DR}`;
const OUTSIDE = { session: null, hash: "#grant=" + GRANT_SECRET };
const heading = (p) => p.doc.querySelector("h1").textContent;

test("R60 R63 the ceremony, the review copy and the reader's page are headed by the title review answers, by key; the identity sentence is body text; a draft naming a case draws its title (control)", async () => {
  for (const [path, boot] of [[`/app/ceremony/${P}/${DR}`, {}], [REVIEW, {}], ["/app/review", OUTSIDE]]) {
    const p = await open(path, { boot, plane: { reviewcopy: ok(NOCASE()) } });
    assert.equal(heading(p), word("review.title.draft", { title: "Rents, 2024 to 2026" }), path);
    assert.ok(drew(p, "review.body.nocase"), path);
    assert.ok(!heading(p).includes("DOES NOT NAME"), path);
    const un = await open(path, { boot, plane: { reviewcopy: ok(NOCASE({ title: word("review.title.untitled") })) } });
    assert.equal(heading(un), word("review.title.untitled"), path);
    const named = await open(path, { boot, plane: { reviewcopy: ok(COPY({ title: "Case The Coliseum lease, edition 2" })) } });
    assert.equal(heading(named), "Case The Coliseum lease, edition 2", path);
    assert.ok(!drew(named, "review.body.nocase"), path);
  }
});

test("R61 the reader's page draws each finding's statement and no file line; a finding with no statement draws its target (control)", async () => {
  const p = await open("/app/review", { boot: OUTSIDE, plane: { reviewcopy: ok(COPY({ findings: [{ target: "FND-1", present: true, text: "--- id: INQ-1\nobject_type: inquiry", statement: "The rents rose without a vote." }, { target: "FND-2", present: true, text: "--- id: INQ-2" }] })) } });
  const t = main(p).textContent;
  assert.ok(t.includes("The rents rose without a vote.") && !t.includes("---") && !t.includes("object_type"));
  assert.ok(t.includes("FND-2"));
});

test("R62 R65 a draft naming no case still draws the reader's comment and the acknowledgement by key, with no raw reader id; none draws neither (control)", async () => {
  const p = await open(REVIEW, { plane: { reviewcopy: ok(NOCASE({ statement_acknowledgements: { acknowledgements: [{ kind: "recipient", by: "RVG-2026-0007", recipient: "Prof. N. Iyer", at: "2026-10-08T09:00:00Z", reason: "ok" }] } })) } });
  assert.ok(drew(p, "screen.review-copy.comments"));
  assert.ok(main(p).textContent.includes("Finding 1 should say which schedule the council approved."));
  assert.ok(p.doc.querySelector("[data-acked]").textContent.includes(word("screen.review-copy.acked", { who: "Prof. N. Iyer", date: "" }).split(",")[0]), "named by what the grant states, by key");
  assert.ok(!main(p).textContent.includes("RVG-"));
  const none = await open(REVIEW, { plane: { reviewcopy: ok(NOCASE({ comments: [], statement_acknowledgements: null })) } });
  assert.ok(!drew(none, "screen.review-copy.comments") && !none.doc.querySelector("[data-acked]"));
});

test("R64 no draft draws the sentence and the door that makes one; with a draft there is none (control)", async () => {
  const p = await open(`/app/review-copy/${P}`, { plane: { casedrafts: ok({ drafts: [] }) } });
  assert.ok(drew(p, "screen.review-copy.nodraft") && drew(p, "screen.review-copy.nodraft.go"));
  assert.equal(p.doc.querySelector("[data-nodraft-go]").getAttribute("href"), `/app/case-editor/${P}`);
  const q = await open(REVIEW);
  assert.ok(!q.doc.querySelector("[data-nodraft-go]"));
});

const EDITOR = `/app/case-editor/${P}/${DR}`;
const rung = (p, r) => p.doc.querySelector(`[data-rung="${r}"]`);

test("R48 R64 R47 the external rung is not yet evaluated when the gates refused; the gates' first refusal is drawn as what is missing; the ladder is an ordered list; no not-met row where no check refused", async () => {
  const p = await open(EDITOR, { plane: { reviewcopy: ok(COPY({ gates: "refused", missing: [{ ok: false, code: "TENSION_NOT_DISCLOSED", reason: "TENSION_NOT_DISCLOSED" }] })) } });
  assert.ok(p.doc.querySelector("ol[data-ladder]") && rung(p, "external").tagName === "LI");
  assert.ok(drewIn(rung(p, "external"), "case.ladder.notyet") && !drewIn(rung(p, "external"), "screen.case-editor.rung.notmet"));
  assert.ok(p.doc.querySelector("[data-missing]") && drewIn(p.doc.querySelector("[data-missing]"), "refusal.TENSION_NOT_DISCLOSED", {}));
  assert.ok(rung(p, "internal").className.includes("on"), "check held: the internal rung is on");
  const none = await open(EDITOR, { plane: { reviewcopy: ok(COPY({ gates: "passed", missing: [] })) } });
  assert.ok(!none.doc.querySelector("[data-missing]"));
  const void_ = await open(EDITOR, { plane: { casecheck: ok({ state: "void", case: C, edition: 2 }) } });
  assert.ok(drewIn(rung(void_, "internal"), "screen.case-editor.rung.notmet"), "a refused check draws the not-met row");
  const nocase = await open(EDITOR, { plane: { reviewcopy: ok(COPY({ case: { case_id: null, edition: null, identity: "x", newCase: true }, gates: "refused", missing: [] })), casecheck: ok({ state: "held" }) } });
  assert.ok(!drew(nocase, "screen.case-editor.rung.notmet"), "a draft with no case and no refused check draws no not-met row");
});

test("R63 R65 a draft naming no case says so in the fold by review's sentence; the case screen links to the owner's comments with their number, or says there are none", async () => {
  const p = await open(EDITOR, { plane: { reviewcopy: ok(NOCASE()) } });
  assert.ok(p.doc.querySelector('[data-fold="screen.case-editor.nocase.summary"]') && drew(p, "review.body.nocase"));
  assert.ok(drew(p, "screen.case-editor.comments.go", { n: "1" }));
  assert.equal(p.doc.querySelector("[data-comments] a").getAttribute("href"), `/app/review-copy/${encodeURIComponent(P + "/" + DR)}`);
  const none = await open(EDITOR, { plane: { reviewcopy: ok(COPY({ comments: [] })) } });
  assert.ok(drew(none, "screen.case-editor.comments.none") && !none.doc.querySelector("[data-comments] a"));
  assert.ok(!none.doc.querySelector('[data-fold="screen.case-editor.nocase.summary"]'), "a draft naming a case draws no such fold");
});

test("R8 the assistant helps with the docket entry's summary only while it is reachable: it sends the summary for docketfile and fills the field with its draft (B17; B420 2); not reachable draws no help (control)", async () => {
  const reach = { assistantstate: ok({ on: true }), accountreference: ok({ held: true }) };
  const p = await open(DOCKET, { plane: { ...reach, writinghelp: ok({ ok: true, text: "The Administrator replied on 15 October.", untested: true }) } });
  const helps = p.root().querySelectorAll('button[data-act="writinghelp"]');
  assert.equal(helps.length, 1, "one help, on the summary");
  assert.equal(helps[0].getAttribute("data-field"), "summary");
  assert.equal(helps[0].getAttribute("data-forop"), "docketfile");
  assert.equal(helps[0].getAttribute("data-id"), "dk-summary");
  await press(p, "writinghelp", { values: { "dk-summary": "admin replied 15 oct" } });
  assert.deepEqual(last(p, "writinghelp").body, { op: "docketfile", field: "summary", told: "admin replied 15 oct" });
  assert.equal(p.doc.getElementById("dk-summary").value, "The Administrator replied on 15 October.");
  const off = await open(DOCKET);
  assert.equal(off.root().querySelectorAll('button[data-act="writinghelp"]').length, 0, "control: no assistant, no help");
});

test("R8 the summary's help sends nothing when nothing was typed (control)", async () => {
  const reach = { assistantstate: ok({ on: true }), accountreference: ok({ held: true }) };
  const p = await open(DOCKET, { plane: { ...reach, writinghelp: ok({ ok: true, text: "x" }) } });
  await press(p, "writinghelp", { values: { "dk-summary": "" } });
  assert.equal(p.byOp("writinghelp").length, 0);
});
