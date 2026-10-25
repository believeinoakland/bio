/* screens-publish R3–R5 and R12–R15 (the publication ceremony) on interface-shell's served page: the steps and their
 * reads, the Photos step, the Ties step that prepares the edition, and signing inside the ceremony: when it becomes
 * public, one sitting of the member's key over every statement listed, signed and waiting or published, and the three
 * states that stop it (no key here, a phone, a member who is not an owner). */
import { registerDeclared } from "../../declared-ops.mjs";
import { registerDeclaredOps } from "../../../src/op-declarations/index.mjs";
await registerDeclared(new URL("../../../../", import.meta.url).pathname, registerDeclaredOps);
import { test } from "node:test";
import assert from "node:assert/strict";
import { open, main, text, drew, drewIn, day, clock, word, ops, press, fill, tick, last, ok, refusedIn, pending, keptKey, answerSign, until, PREFLIGHT, P, DR, C, SHA, B1, E1, PHOTO } from "./fixtures.mjs";
import { gateRefusal } from "../case-disclosures/fixtures.mjs";

const PATH = `/app/ceremony/${P}/${DR}`;
const R = "because";
/* Each field the act's owner takes, as sent; a reason the shell adds by the act's weight (interface-shell R11) aside. */
const carries = (body, want) => { for (const [k, v] of Object.entries(want)) assert.deepEqual(body[k], v, k); };
/** The ceremony with its Ties step confirmed: the edition prepared, the Sign step offered. */
async function prepared(o = {}) {
  const p = await open(PATH, o);
  tick(p, "ce-tie", "yes");
  await press(p, "publish", { reason: R });
  return p;
}

test("R3 the steps in order, the current one marked; the reads: checks, disclosures, each photo's marks, the waiting edition", async () => {
  const p = await open(PATH);
  const steps = main(p).querySelectorAll("[data-step]");
  assert.deepEqual(steps.map((s) => s.textContent), ["what", "strength", "leavesout", "people", "photos", "disclosures", "bias", "preview", "ties", "sign"].map((k) => word(`screen.ceremony.step.${k}`)));
  assert.equal(main(p).querySelector('[aria-current="step"]').getAttribute("data-step"), "photos", "an unchecked photo holds the ceremony at Photos");
  assert.deepEqual(last(p, "publishpreflight").body, { draft: DR, project: P }, "R50: the draft and the project alone");
  assert.deepEqual(last(p, "publishtensions").body, { project: P, draft: DR });
  assert.equal(last(p, "photomarks").query.capture, PHOTO);
  assert.equal(last(p, "publishschedule").query.case, C);
});

test("R3 every refusal that holds before signing is drawn by its words; \"Check again\" reads the checks again", async () => {
  const p = await open(PATH);
  const b = main(p).querySelector("[data-blockers]");
  const lines = b.querySelectorAll("li").map((l) => l.textContent);
  assert.equal(lines.length, 2);
  assert.ok(lines[0].includes(PREFLIGHT().first.translation), "a code the list holds no word for is drawn by the plane's translation");
  assert.ok(lines[1].includes(word("refusal.TENSION_NOT_DISCLOSED").replace(/[.\s]+$/, "")), "a code the list holds is drawn by its word, not the translation");
  const n = p.byOp("publishpreflight").length;
  await press(p, "publishpreflight");
  assert.ok(p.byOp("publishpreflight").length > n);
  const q = await open(PATH, { plane: { publishpreflight: ok({ ready: true, first: null, blockers: [], steps: [{ pinned: [] }, {}, {}, { photos: [], unchecked: 0 }] }) } });
  assert.equal(main(q).querySelector("[data-blockers]"), null);
  assert.ok(drew(q, "screen.ceremony.ready"));
  assert.equal(main(q).querySelector('[aria-current="step"]').getAttribute("data-step"), "ties");
});

test("R3 what will be disclosed, and \"See everything that will be disclosed\" draws the whole list", async () => {
  const all = { candidates: [1, 2, 3, 4, 5, 6, 7].map((i) => ({ says: "Tension " + i })), count: 7 };
  const p = await open(PATH, { plane: { publishtensions: ok(all) } });
  assert.ok(drew(p, "screen.ceremony.disclosed.count", { n: "7" }));
  assert.ok(!/Tension 6/.test(text(p)));
  await press(p, "publishtensions");
  assert.match(text(p), /Tension 6.*Tension 7/);
  assert.ok(drew(p, "screen.ceremony.timeline.frozen"));
});

/** Draws a rectangle on photo `i` with the pointer, from (x0, y0) to (x1, y1) in its pixels (interface-shell R49's
 *  `cs.areas`; the stand-in image drawn at its own size, 1000 by 500). */
async function drawArea(p, i, [x0, y0, x1, y1]) {
  const box = () => p.root().querySelector(`[data-shell="areas-box"][data-areas="ce-areas-${i}"]`);
  const size = () => { const img = box().querySelector("img"); img.naturalWidth = 1000; img.naturalHeight = 500; box().getBoundingClientRect = () => ({ left: 0, top: 0, width: 1000, height: 500 }); };
  size();
  p.fire(box(), "pointerdown", { clientX: x0, clientY: y0 });
  for (const f of p.win.listeners.pointermove || []) f({ clientX: x1, clientY: y1 });
  for (const f of [...(p.win.listeners.pointerup || [])]) f({ clientX: x1, clientY: y1 });
  await p.settle();
  size();
}

test("R4 each photo shown with its marks; areas drawn on the photo and named by what they cover are sent as obscuremark's areas; staff need a reason (control)", async () => {
  const p = await open(PATH);
  const ph = main(p).querySelector(`[data-photo="${PHOTO}"]`);
  assert.ok(ph);
  assert.ok(ph.textContent.includes(word("screen.ceremony.photo.state.unchecked")));
  assert.equal(last(p, "openoriginal").query.capture, PHOTO, "the photo is read as open-file reads it (K3150)");
  assert.ok(ph.querySelector("img.mk-image") && ph.querySelector('[data-shell="areas-box"]'), "drawn on the photo itself");
  assert.ok(drew(p, "screen.ceremony.photos.gate"));
  assert.ok(drew(p, "screen.ceremony.photos.copy"));
  await press(p, "obscuremark", { reason: R });
  assert.equal(p.byOp("obscuremark").length, 0, "nothing drawn, nothing sent");
  await drawArea(p, 0, [10, 20, 40, 60]);
  await press(p, "obscuremark", { values: { "ce-kind-0": "plate" }, reason: R });
  assert.equal(last(p, "obscuremark").query.capture, PHOTO);
  assert.deepEqual(last(p, "obscuremark").body.areas, [{ rect: [10, 20, 40, 60], kind: "plate" }]);
  const n = p.byOp("obscuremark").length;
  await press(p, "obscuremark", { values: { "ce-kind-0": "staff", "ce-staff-0": "" }, reason: R });
  assert.equal(p.byOp("obscuremark").length, n, "a staff area with no reason sends nothing");
  await press(p, "obscuremark", { values: { "ce-kind-0": "staff", "ce-staff-0": "Their face is beside a tenant's door number." }, reason: R });
  assert.deepEqual(last(p, "obscuremark").body.areas, [{ rect: [10, 20, 40, 60], kind: "staff", reason: "Their face is beside a tenant's door number." }]);
});

test("R4 \"Nothing to obscure\" sends areas []; a mark is withdrawn with a reason, never erased; a format that cannot be covered is named", async () => {
  const marked = { photomarks: ok({ capture: PHOTO, photo: true, state: "marked", marks: [
    { mark: 1, areas: [{ rect: [0, 0, 5, 5], kind: "person" }], by: "dev", at: "x", withdrawn: null },
    { mark: 2, areas: [{ rect: [0, 0, 5, 5], kind: "plate" }], by: "dev", at: "x", withdrawn: { by: "mai", at: "y", reason: "covers the finding" } }] }) };
  const p = await open(PATH, { plane: marked });
  await press(p, "obscuremark", { nth: 1, reason: R });
  carries(last(p, "obscuremark").body, { areas: [] });
  assert.ok(drew(p, "screen.ceremony.mark.standing", { n: "1", areas: word("screen.ceremony.area.person") }));
  assert.ok(drew(p, "screen.ceremony.mark.withdrawn", { n: "2", areas: word("screen.ceremony.area.plate") }) && text(p).includes("covers the finding"));
  assert.equal(main(p).querySelectorAll('button[data-act="obscuremarkwithdraw"]').length, 1, "a withdrawn mark offers nothing more");
  await press(p, "obscuremarkwithdraw", { values: { "ce-wd-0-1": "It covers what the finding shows." } });
  carries(last(p, "obscuremarkwithdraw").body, { mark: 1, reason: "It covers what the finding shows." });
  const pre = PREFLIGHT();
  pre.steps[3].photos[0].refused = true;
  const q = await open(PATH, { plane: { publishpreflight: ok(pre) } });
  assert.ok(drew(q, "screen.ceremony.photo.format"));
});

test("R5 the Ties step's confirmation sends publish with tieAttested: true; no Sign is offered before it answers (control)", async () => {
  const p = await open(PATH);
  assert.ok(!ops(p).includes("caseratify") && !ops(p).includes("publishat"), "no Sign before publish");
  await press(p, "publish", { reason: R });
  assert.equal(p.byOp("publish").length, 0, "nothing sent before the member's own confirmation is ticked");
  tick(p, "ce-tie", "yes");
  await press(p, "publish", { reason: R });
  const b = last(p, "publish").body;
  assert.equal(b.tieAttested, true);
  assert.equal(b.draft, DR);
  assert.deepEqual(Object.keys(b).sort(), ["draft", "project", "tieAttested"], "R50: only what was attested here; the findings, the case and the words are the draft's");
  assert.ok(ops(p).includes("caseratify"), "Sign offered once publish answered");
  const q = await open(PATH, { plane: { publish: pending } });
  tick(q, "ce-tie", "yes");
  await press(q, "publish", { reason: R });
  assert.ok(!ops(q).includes("caseratify") && !ops(q).includes("publishat"), "no Sign while publish has not answered");
});

test("R12 the Sign step: when it becomes public (now, or a date and time in the group's zone), one button following the choice, and who signs", async () => {
  const p = await prepared();
  assert.ok(drew(p, "signing.ceremony.who", { signer: "dev", project: "The Coliseum lease", group: "River Town" }));
  assert.ok(drew(p, "screen.ceremony.when") && drew(p, "screen.ceremony.when.help", { zone: "America/Los_Angeles" }));
  assert.ok(p.doc.getElementById("ce-date") && p.doc.getElementById("ce-time"));
  assert.deepEqual(ops(p).filter((o) => o === "caseratify" || o === "publishat"), ["caseratify"], "one button: now");
  assert.ok(main(p).querySelector('button[data-act="caseratify"]').textContent.includes(word("act.caseratify.label.ceremony")));
  const when = p.doc.getElementById("ce-when");
  when.value = "at";
  p.fire(when, "change");
  await p.settle();
  assert.deepEqual(ops(p).filter((o) => o === "caseratify" || o === "publishat"), ["publishat"], "one button: at a set time");
  assert.ok(main(p).querySelector('button[data-act="publishat"]').textContent.includes(word("act.publishat.label.ceremony")));
});

test("R13 one sitting signs the case statement, each pinned finding and each piece of evidence, listed; sent as one caseratify with members", async () => {
  const p = await prepared({ boot: { idb: await keptKey() } });
  const listed = main(p).querySelectorAll("[data-statement]").map((li) => li.getAttribute("data-statement"));
  assert.deepEqual(listed, ["case", "finding", "evidence"], "each statement listed before signing");
  await press(p, "caseratify", { reason: R });
  assert.equal(p.root().querySelectorAll('[data-shell="dialog-yes"]').length, 1, "one confirmation for the whole list");
  const lines = await answerSign(p, true, "caseratify");
  for (const st of [`bio-ratify-case ${C} 2 ${SHA}`, `bio-ratify FND-2026-0031 ${B1}`, `bio-ratify INFO-2026-0004 ${E1}`]) assert.ok(lines.includes(st), st);
  const b = last(p, "caseratify").body;
  assert.equal(b.caseId, C);
  assert.equal(b.edition, 2);
  assert.equal(b.expectedSha, SHA);
  assert.match(b.sig, /^-----BEGIN SSH SIGNATURE-----/);
  assert.deepEqual(b.members.map((m) => [m.id, m.sha]), [["FND-2026-0031", B1], ["INFO-2026-0004", E1]]);
  for (const m of b.members) assert.match(m.signature, /^-----BEGIN SSH SIGNATURE-----/);
  assert.equal(new Set([b.sig, ...b.members.map((m) => m.signature)]).size, 3, "each statement its own signature");
  assert.equal(p.byOp("ratify").length, 0, "ratification R52's one act: no separate ratify");
});

test("R13 declined on the device, nothing is sent; nothing is drawn signed before its answer (R10)", async () => {
  const p = await prepared({ boot: { idb: await keptKey() } });
  const { slot } = await press(p, "caseratify", { reason: R });
  await answerSign(p, false);
  assert.equal(p.byOp("caseratify").length, 0);
  assert.ok(slot().textContent.includes(word("signing.ceremony.declined")));
  const q = await prepared({ boot: { idb: await keptKey() }, plane: { caseratify: pending } });
  await press(q, "caseratify", { reason: R });
  await answerSign(q, true, "caseratify");
  assert.equal(q.byOp("caseratify").length, 1);
  assert.equal(main(q).querySelector("[data-signed]"), null, "not drawn signed while the act has not answered");
});

test("R14 signed and waiting draws signedat with \"Move the time\" and \"Cancel publishing\"; signed now draws signednow with the public page", async () => {
  const p = await prepared({ boot: { idb: await keptKey() } });
  const when = p.doc.getElementById("ce-when");
  when.value = "at";
  p.fire(when, "change");
  await p.settle();
  await press(p, "publishat", { values: { "ce-date": "2026-11-19", "ce-time": "06:00" }, reason: R });
  await answerSign(p, true, "publishat");
  await until(p, () => main(p).querySelector('[data-signed="at"]'));
  assert.deepEqual(last(p, "publishat").body.at, { date: "2026-11-19", time: "06:00" });
  assert.equal(last(p, "publishat").body.members.length, 2);
  assert.ok(drewIn(main(p).querySelector('[data-signed="at"]'), "signing.ceremony.signedat", { edition: "2", date: day("2026-11-19"), time: clock("06:00"), zone: "America/Los_Angeles" }));
  await press(p, "publishatmove", { values: { "ce-move-date": "2026-11-20", "ce-move-time": "07:30" }, reason: R });
  carries(last(p, "publishatmove").body, { case: C, edition: 2, at: { date: "2026-11-20", time: "07:30" } });
  const w = await open(PATH, { plane: { publishschedule: ok({ editions: [{ case: C, edition: 2, state: "waiting", at: { date: "2026-11-19", time: "06:00", zone: "Z" } }] }) } });
  await press(w, "publishatcancel", { reason: R });
  carries(last(w, "publishatcancel").body, { case: C, edition: 2 });
  const q = await prepared({ boot: { idb: await keptKey() } });
  await press(q, "caseratify", { reason: R });
  await answerSign(q, true, "caseratify");
  await until(q, () => main(q).querySelector('[data-signed="now"]'));
  assert.ok(drewIn(main(q).querySelector('[data-signed="now"]'), "signing.ceremony.signednow", { edition: "2" }));
  assert.ok(main(q).querySelector(`a[href="/app/published/${C}"]`));
});

test("R15 NO_ATTESTING_KEY draws nokey with the keep choice and \"Register a signing key in this browser\", returning to the step", async () => {
  const idb = await keptKey();
  const p = await prepared({ boot: { idb }, plane: { caseratify: refusedIn("NO_ATTESTING_KEY") } });
  await press(p, "caseratify", { reason: R });
  await answerSign(p, true, "caseratify");
  await until(p, () => main(p).querySelector("[data-nokey]"));
  const box = main(p).querySelector("[data-nokey]");
  assert.ok(drewIn(box, "signing.ceremony.nokey") && drewIn(box, "signing.ceremony.keepkey"));
  tick(p, "ce-keep", "keep");
  await press(p, "signerregisterown", { reason: R });
  await until(p, () => p.byOp("signerregisterown").length > 0);
  assert.match(last(p, "signerregisterown").body.keyB64, /^AAAAC3NzaC1lZDI1NTE5AAAAI[A-Za-z0-9+/=]+$/, "the key made on this device, its public half sent");
  assert.equal(idb.get("civicsmith-signer").get("keys").get("own").priv.extractable, false, "kept by the member's choice, not exportable");
  await until(p, () => !main(p).querySelector("[data-nokey]"));
  assert.ok(ops(p).includes("caseratify"), "back at the Sign step, nothing lost");
});

test("R15 at the phone width the Sign step draws signing.ceremony.phone and sends nothing; CASE_SIGNER_NOT_AN_OWNER offers \"Ask an owner to sign\"", async () => {
  const ph = await open(PATH, { boot: { phone: true } });
  assert.ok(drew(ph, "signing.ceremony.phone", { project: "The Coliseum lease" }));
  assert.equal(main(ph).querySelectorAll('button[data-act="caseratify"]').length, 0);
  const p = await prepared({ boot: { idb: await keptKey() }, plane: { caseratify: refusedIn("CASE_SIGNER_NOT_AN_OWNER") } });
  await press(p, "caseratify", { reason: R });
  await answerSign(p, true, "caseratify");
  await until(p, () => main(p).querySelector("[data-notowner]"));
  assert.ok(drewIn(main(p).querySelector("[data-notowner]"), "signing.ceremony.notowner", { project: "The Coliseum lease", owners: "" }));
  await press(p, "signrequest", { reason: R });
  carries(last(p, "signrequest").body, { case: C, edition: 2 });
  assert.ok(drew(p, "screen.ceremony.asked"));
});

test("R4 R30 a photo's facts: taken by and relied on, with the local day when `photosOf` answers `dated` and without it when it does not (R33 of case-disclosures)", async () => {
  const p = await open(PATH);
  const ph = main(p).querySelector(`[data-photo="${PHOTO}"]`);
  assert.ok(drewIn(ph, "screen.ceremony.photo.facts", { by: "dev", findings: "FND-2026-0031" }), "no day: the sentence without one");
  const pre = PREFLIGHT();
  pre.steps[3].photos[0].dated = "2026-03-02";
  const q = await open(PATH, { plane: { publishpreflight: ok(pre) } });
  assert.ok(drewIn(main(q).querySelector(`[data-photo="${PHOTO}"]`), "screen.ceremony.photo.facts.dated", { by: "dev", date: day("2026-03-02"), findings: "FND-2026-0031" }));
  assert.deepEqual(q.root().innerHTML.match(/\{[a-z]\w*\}/g) || [], []);
  pre.steps[3].photos[0].dated = null;
  const none = await open(PATH, { plane: { publishpreflight: ok(pre) } });
  assert.ok(drewIn(main(none).querySelector(`[data-photo="${PHOTO}"]`), "screen.ceremony.photo.facts", { by: "dev", findings: "FND-2026-0031" }), "control: a null day is the undated sentence");
});

test("R3 R50 (fix round 6, G10) a refusal's placeholder is filled from the refusal's own field: the real canned text names the document, no raw {document}", async () => {
  const canned = word("document.refused.pending", { document: "{document}" }); // what case-disclosures' check answers as `translation`
  assert.ok(canned.includes("{document}"), "the answer's text carries the placeholder");
  const gate = gateRefusal(); // case-disclosures' own refusals, raised by worlds that hold them
  assert.ok(gate.DOCUMENT_COPY_PENDING.translation.includes("{document}"), "the real answer's text carries the placeholder");
  const pre = PREFLIGHT({ first: gate.DOCUMENT_COPY_PENDING, blockers: [gate.PHOTO_UNCHECKED] });
  const p = await open(PATH, { plane: { publishpreflight: ok(pre) } });
  const lines = main(p).querySelector("[data-blockers]").querySelectorAll("li").map((l) => l.textContent);
  assert.equal(lines.length, 2);
  assert.ok(lines[0].includes(gate.held.document), "the document is named");
  assert.ok(lines[1].includes(gate.held.photo), "the photo is named");
  assert.ok(!lines.some((l) => /[{}]/.test(l)), "no raw placeholder is drawn");
  // control: a refusal that names no field draws no brace either
  // fixtures-generic: DOCUMENT_COPY_UNWORDED (a code no module gives, so the page falls back to the plane's canned text (R-fallback control))
  const q = await open(PATH, { plane: { publishpreflight: ok(PREFLIGHT({ first: { ok: false, code: "DOCUMENT_COPY_UNWORDED", translation: canned }, blockers: [] })) } });
  assert.ok(!/[{}]/.test(main(q).querySelector("[data-blockers]").textContent), "control: a missing field leaves no brace");
});

test("R12 R15 (fix round 6, G11) a team with no time zone is offered no publishing time: no empty brackets, no second button, the held refusal says why; with a zone the Sign step is as before", async () => {
  const none = PREFLIGHT();
  none.steps[7] = { signer: "dev", open_requests: [], publish_at: { offered: false, zone: null, reason: "PUBLISH_AT_NO_ZONE" } };
  const p = await prepared({ plane: { publishpreflight: ok(none) } });
  assert.ok(drew(p, "refusal.PUBLISH_AT_NO_ZONE"), "the held refusal is said");
  assert.ok(!/\(\s*\)/.test(text(p)), "no empty brackets");
  assert.equal(p.doc.getElementById("ce-date"), null);
  assert.equal(p.doc.getElementById("ce-time"), null);
  assert.deepEqual(ops(p).filter((o) => o === "caseratify" || o === "publishat"), ["caseratify"], "only Sign and publish now");
  const zoned = PREFLIGHT();
  zoned.steps[7] = { signer: "dev", open_requests: [], publish_at: { offered: true, zone: "America/Los_Angeles" } };
  const q = await prepared({ plane: { publishpreflight: ok(zoned) } });
  assert.ok(drew(q, "screen.ceremony.when.help", { zone: "America/Los_Angeles" }) && q.doc.getElementById("ce-date"));
  assert.ok(!drew(q, "refusal.PUBLISH_AT_NO_ZONE"));
});
