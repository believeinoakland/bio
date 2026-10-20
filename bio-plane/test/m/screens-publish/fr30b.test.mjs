/* screens-publish FR-30, second part (K4165, K4168, K4192, K4194, K4197; DEC-374 to DEC-378, DEC-382, DEC-384): R44, R46, R51, R53, R57
 * on the case editor and the ceremony; R47, R54 on the published page; R58, R59 on the imported page. Each sentence is asserted by its
 * key (R24); every request is compared with its owner's declaration by the harness (interface-shell R104). */
import "./register.mjs";
import { test } from "node:test";
import assert from "node:assert/strict";
import { open, main, drew, drewIn, ops, press, last, fill, tick, until, keptKey, answerSign, ok, refusedIn, word, hasWord, COPY, PREFLIGHT, P, C, DR } from "./fixtures.mjs";

const EDITOR = `/app/case-editor/${P}/${DR}`;
const CER = `/app/ceremony/${P}/${DR}`;
const TWO = [{ target: "FND-2026-0031", present: true, text: "The 2024 adjustments had no council vote.", statement: "The 2024 adjustments had no council vote.", role: "load_bearing" },
  { target: "FND-2026-0032", present: true, text: "A second adjustment followed in 2025.", statement: "A second adjustment followed in 2025.", role: "supporting" }];
/** Chooses `v` in a radio group, as the browser does: the others are cleared. */
const pick = (p, id, v) => p.doc.getElementById(id).querySelectorAll("input").forEach((i) => { i.checked = i.value === v; });
const checked = (p, id) => p.doc.getElementById(id).querySelectorAll("input").filter((i) => i.checked).map((i) => i.value);

test("R44 position, reasoning, one left-out row and each finding's role, then Save, send casedraft with those fields and no targets; a Save that changed one field sends that field alone (control)", async () => {
  const p = await open(EDITOR, { plane: { reviewcopy: ok(COPY({ findings: TWO })) } });
  assert.deepEqual(checked(p, "ce-role-0"), ["load_bearing"], "the role the draft holds is the one drawn");
  assert.deepEqual(checked(p, "ce-role-1"), ["supporting"]);
  pick(p, "ce-role-1", "load_bearing");
  pick(p, "ce-pos", "sought_no_answer");
  fill(p, { "ce-posjust": "We wrote on September 22 and had no reply by October 6.", "ce-exwhat": "The 2019 negotiation", "ce-exwhy": "The record we hold begins in 2024." });
  await press(p, "casedraft", { reason: "edit" });
  const b = last(p, "casedraft").body;
  assert.equal(b.draft, DR);
  assert.equal(b.subjectPosition, "sought_no_answer");
  assert.equal(b.subjectJustification, "We wrote on September 22 and had no reply by October 6.");
  assert.deepEqual(b.excluded, [{ target: "INFO-9", description: "Whether the rents are fair", reason: "outside the lease's terms" }, { description: "The 2019 negotiation", reason: "The record we hold begins in 2024." }]);
  assert.deepEqual(b.roles, { "FND-2026-0031": "load_bearing", "FND-2026-0032": "load_bearing" }, "one choice for every finding");
  assert.ok(!("targets" in b) && !("target" in b), "a Save names no findings: the draft keeps its own");
  const q = await open(EDITOR, { plane: { reviewcopy: ok(COPY({ findings: TWO })) } });
  fill(q, { "ce-posjust": "Because they did not answer." });
  await press(q, "casedraft", { reason: "edit" });
  assert.deepEqual(Object.keys(last(q, "casedraft").body).sort(), ["draft", "subjectJustification"], "control: one changed field, that field alone");
});

test("R44 a left-out row needs its reason, and 'nothing material left out' sends an empty list; silence sends none; the second member's Acknowledge is drawn once something is left out", async () => {
  const none = await open(EDITOR, { plane: { reviewcopy: ok(COPY({ authored: { scope: "S", statement: "x", excluded: null }, statement_acknowledgements: null })) } });
  assert.ok(!ops(none).includes("statementack"), "nothing is left out: nothing to acknowledge");
  await press(none, "casedraft", { reason: "edit" });
  assert.ok(!("excluded" in last(none, "casedraft").body), "silence sends none");
  fill(none, { "ce-exwhat": "Rents elsewhere", "ce-exwhy": "" });
  await press(none, "casedraft", { reason: "edit" });
  assert.equal(none.byOp("casedraft").length, 1, "a row with no reason is refused in place and nothing is sent");
  assert.ok(drew(none, "screen.case-editor.say_what_is_left_out_and"));
  fill(none, { "ce-exwhat": "", "ce-exwhy": "" });
  pick(none, "ce-exnone", "none");
  await press(none, "casedraft", { reason: "edit" });
  assert.deepEqual(last(none, "casedraft").body.excluded, [], "an empty list is a claim");
  const some = await open(EDITOR);
  assert.ok(ops(some).includes("statementack"), "something is left out: the second member's Acknowledge is drawn");
});

const B64 = "b".repeat(64);
const STEP3 = (o = {}) => ({ step: 3, tensions: { candidates: [], count: 0 }, not_co_attested: [], self_attested: [], ...o });
const WITH = (step3) => PREFLIGHT({ steps: [...PREFLIGHT().steps.slice(0, 5), step3, ...PREFLIGHT().steps.slice(5)] });
const pre = (p) => last(p, "publishpreflight").body;

test("R46 each candidate the Disclosures step lists has a tick and a field for the owner's words; the pre-flight and publish send the ticked ones as tensionsDisclosed; none ticked sends none", async () => {
  const p = await open(CER);
  assert.ok(drew(p, "screen.ceremony.disc.list.legend") && drew(p, "screen.ceremony.disc.words.label"));
  await press(p, "publishpreflight");
  assert.ok(!("tensionsDisclosed" in pre(p)), "none ticked sends none");
  tick(p, "ce-disc", "CAND-1");
  fill(p, { "ce-dw-0": "The two dates are being checked against the postmark." });
  await press(p, "publishpreflight");
  assert.deepEqual(pre(p).tensionsDisclosed, [{ candidate: "CAND-1", words: "The two dates are being checked against the postmark." }]);
  assert.deepEqual(checked(p, "ce-disc"), ["CAND-1"], "the tick is kept after the answer");
  tick(p, "ce-tie", "yes");
  await press(p, "publish", { reason: "x" });
  assert.deepEqual(last(p, "publish").body.tensionsDisclosed, [{ candidate: "CAND-1", words: "The two dates are being checked against the postmark." }]);
  assert.equal(last(p, "publish").body.tieAttested, true);
});

test("R46 a refusal is drawn by its key and the ticks are kept (control)", async () => {
  const p = await open(CER, { plane: { publishpreflight: ok(PREFLIGHT({ first: { ok: false, code: "TENSION_NOT_DISCLOSED", reason: "TENSION_NOT_DISCLOSED" }, blockers: [] })) } });
  tick(p, "ce-disc", "CAND-1");
  await press(p, "publishpreflight");
  assert.ok(drew(p, "refusal.TENSION_NOT_DISCLOSED"));
  assert.deepEqual(checked(p, "ce-disc"), ["CAND-1"]);
});

test("R44 the Bias step holds the member's own words and the pre-flight and the publish send them as biasAcknowledgement; none typed sends none", async () => {
  const none = await open(CER);
  await press(none, "publishpreflight");
  assert.ok(!("biasAcknowledgement" in pre(none)));
  const p = await open(CER);
  fill(p, { "ce-bias": "We read the Department's own reports closely." });
  await press(p, "publishpreflight");
  assert.equal(pre(p).biasAcknowledgement, "We read the Department's own reports closely.");
  tick(p, "ce-tie", "yes");
  await press(p, "publish", { reason: "x" });
  assert.equal(last(p, "publish").body.biasAcknowledgement, "We read the Department's own reports closely.");
  const held = await open(CER, { plane: { reviewcopy: ok(COPY({ authored: { scope: "S", biasAcknowledgement: "Held words." } })) } });
  assert.equal(held.doc.getElementById("ce-bias").value || held.doc.getElementById("ce-bias").textContent, "Held words.", "the draft's own words are shown");
});

test("R50 the ceremony's three requests name the draft and the project and carry nothing else of the case: no findings, no words (the guard accepts them)", async () => {
  const p = await open(CER);
  await press(p, "publishpreflight");
  await press(p, "publishtensions");
  tick(p, "ce-tie", "yes");
  await press(p, "publish", { reason: "x" });
  for (const op of ["publishpreflight", "publishtensions", "publish"]) {
    const body = last(p, op).body;
    assert.equal(body.project, P, op);
    for (const k of Object.keys(body)) assert.ok(["project", "draft", "tieAttested", "tensionsDisclosed", "selfAttested", "biasAcknowledgement"].includes(k), `${op}: ${k}`);
    for (const k of ["targets", "target", "statement", "scope", "excluded", "roles", "account"]) assert.ok(!(k in body), `${op}: no ${k}`);
  }
});

const DOCS = { publishpreflight: ok(WITH(STEP3({ not_co_attested: [B64] }))), captureaccounts: ok({ captureSha: B64, actors: [{ actor: "dev", at: "2026-10-01T09:00:00Z" }], accounts: [] }) };

test("R51 a document without a second confirmation offers the confirmation again, self-attestation with a required reason, and the capturing member's signed account; each sends its request", async () => {
  const p = await open(CER, { boot: { idb: await keptKey() }, plane: { ...DOCS, reattest: ok({ ok: true }), captureaccount: ok({ ok: true, captureSha: B64, seq: 1 }) } });
  assert.ok(drew(p, "screen.ceremony.conf.heading") && ops(p).includes("reattest") && ops(p).includes("captureaccount"));
  await press(p, "reattest");
  assert.deepEqual(last(p, "reattest").body, { captureSha: B64 });
  fill(p, { "ce-cap-0": "I saved the page on October 1 from the city's site." });
  await press(p, "captureaccount", { reason: "x" });
  const lines = await answerSign(p, true, "captureaccount");
  assert.ok(lines.includes(`bio-capture-account ${B64}`), "the account's statement is what the key signs");
  const a = last(p, "captureaccount").body;
  assert.equal(a.captureSha, B64);
  assert.equal(a.text, "I saved the page on October 1 from the city's site.");
  assert.match(a.signature, /SSH SIGNATURE/);
  tick(p, "ce-sa", B64);
  fill(p, { "ce-sar-0": "No archive held a copy; the original is with the team." });
  await press(p, "publishpreflight");
  assert.deepEqual(pre(p).selfAttested, [{ capture: B64, reason: "No archive held a copy; the original is with the team." }]);
  tick(p, "ce-tie", "yes");
  await press(p, "publish", { reason: "x" });
  assert.deepEqual(last(p, "publish").body.selfAttested, [{ capture: B64, reason: "No archive held a copy; the original is with the team." }]);
});

test("R51 self-attestation without a reason is refused in place and nothing is sent; a member who did not capture it is offered no signed account (controls)", async () => {
  const p = await open(CER, { plane: { ...DOCS, captureaccounts: ok({ captureSha: B64, actors: [{ actor: "mai" }], accounts: [] }) } });
  tick(p, "ce-sa", B64);
  await press(p, "publishpreflight");
  assert.equal(p.byOp("publishpreflight").length, 1, "only the page's own read was sent");
  assert.ok(drew(p, "screen.ceremony.conf.refused.noreason1"));
  assert.ok(!ops(p).includes("captureaccount"), "only the member who captured it adds an account");
});

const md = (refs) => ["---", `id: ${P}`, "object_type: project", "title: \"The Coliseum lease\"", "references:",
  ...refs.flatMap(([t, st, note]) => [`  - target: ${t}`, "    rel: cites", `    status: ${st}`, ...(note ? [`    note: "${note}"`] : [])]), "---", ""].join("\n");

test("R53 'Remove' and 'Reinstate' send the project, the handle and the reason the shell asks; a reinstated citation is listed again", async () => {
  let refs = [["INFO-2026-0004", "confirmed"], ["INFO-2026-0005", "severed", "Severed 2026-10-07T09:00:00Z: the wrong year"]];
  const p = await open(EDITOR, { plane: { image: () => ok({ "bundle.md": md(refs) }), sever: () => { refs = [["INFO-2026-0004", "severed", "gone"], refs[1]]; return ok({ ok: true, severed: "INFO-2026-0004" }); },
    reinstate: () => { refs = [refs[0], ["INFO-2026-0005", "confirmed"]]; return ok({ ok: true, reinstated: "INFO-2026-0005" }); } } });
  assert.ok(drew(p, "screen.case-editor.the_passages_this_case_cites"));
  assert.equal(p.doc.querySelectorAll('button[data-act="sever"]').length, 1);
  assert.equal(p.doc.querySelectorAll('button[data-act="reinstate"]').length, 1);
  await press(p, "sever", { reason: "The schedule was superseded." });
  assert.deepEqual(last(p, "sever").body, { project: P, handle: "INFO-2026-0004", reason: "The schedule was superseded." });
  await p.settle();
  assert.equal(p.doc.querySelectorAll('button[data-act="reinstate"]').length, 2, "the removed citation is listed with its way back");
  await press(p, "reinstate", { nth: 1, reason: "It still stands." });
  assert.deepEqual(last(p, "reinstate").body, { project: P, handle: "INFO-2026-0005", reason: "It still stands." });
  await p.settle();
  assert.equal(p.doc.querySelectorAll('button[data-act="reinstate"]').length, 1, "reinstated: it is live again");
});

test("R53 with no reason the shell asks and nothing is sent (control); a project citing nothing draws no section", async () => {
  const p = await open(EDITOR, { plane: { image: ok({ "bundle.md": md([["INFO-2026-0004", "confirmed"]]) }) } });
  await press(p, "sever");
  assert.equal(p.byOp("sever").length, 0);
  const none = await open(EDITOR);
  assert.ok(!none.doc.querySelector('[data-cited]') && !drew(none, "screen.case-editor.the_passages_this_case_cites"));
});
