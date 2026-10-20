/* screens-publish FR-30 (T51 fix round; K4165, K4168, K4192, K4194, K4197): R52 the docket starts the next edition. Each sentence is
 * asserted by its key (R24); every request is compared with its owner's declaration by the harness (interface-shell R104). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { open, main, drew, ops, press, last, fill, choose, until, keptKey, ok, word, hasWord, COPY, PREFLIGHT, P, C, DR } from "./fixtures.mjs";

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

const IMPORT = (acc) => ({ importedcase: { status: 200, json: { ok: true, result: { import: "IMP-2026-0001", group: "West Oakland Neighbors", case: "Port lease revenue",
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
  const withRef = await open("/app/doorbell", { boot: PUBLIC, plane: { knock: { status: 200, json: { ok: true, result: { ok: true, knockId: "KNOCK-1", reference: "REF-77" } } } } });
  choose(withRef, "db-file", new Uint8Array([104, 105]));
  await press(withRef, "knock");
  assert.ok(withRef.doc.querySelector("[data-received]"));
  assert.ok(drew(withRef, "screen.doorbell.after.head"));
  assert.ok(drew(withRef, "screen.doorbell.reference", { reference: "REF-77" }));
  const without = await open("/app/doorbell", { boot: PUBLIC });
  choose(without, "db-file", new Uint8Array([104, 105]));
  await press(without, "knock");
  assert.ok(without.doc.querySelector("[data-received]"));
  assert.ok(!drew(without, "screen.doorbell.after.head"));
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
