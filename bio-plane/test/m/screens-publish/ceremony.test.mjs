/* screens-publish R3–R5 and R12–R15 (the publication ceremony) on interface-shell's served page: the steps and their
 * reads, the Photos step, the Ties step that prepares the edition, and signing inside the ceremony: when it becomes
 * public, one sitting of the member's key over every statement listed, signed and waiting or published, and the three
 * states that stop it (no key here, a phone, a member who is not an owner). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { open, main, text, ops, press, fill, tick, last, ok, refusedIn, pending, signer, P, DR, C, SHA, B1, E1, PHOTO } from "./fixtures.mjs";

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
  assert.deepEqual(steps.map((s) => s.textContent), ["What", "Strength", "Leaves out", "People", "Photos", "Disclosures", "Bias", "Preview", "Ties", "Sign"]);
  assert.equal(main(p).querySelector('[aria-current="step"]').getAttribute("data-step"), "photos", "an unchecked photo holds the ceremony at Photos");
  assert.deepEqual(last(p, "publishpreflight").body, { draft: DR, project: P, targets: ["FND-2026-0031"], caseId: C });
  assert.deepEqual(last(p, "publishtensions").body, { project: P, targets: ["FND-2026-0031"] });
  assert.equal(last(p, "photomarks").query.capture, PHOTO);
  assert.equal(last(p, "publishschedule").query.case, C);
});

test("R3 every refusal that holds before signing is drawn by its words; \"Check again\" reads the checks again", async () => {
  const p = await open(PATH);
  const b = main(p).querySelector("[data-blockers]");
  assert.match(b.textContent, /Photo 1 is not yet checked\..*A contradiction is not yet disclosed\./);
  const n = p.byOp("publishpreflight").length;
  await press(p, "publishpreflight");
  assert.ok(p.byOp("publishpreflight").length > n);
  const q = await open(PATH, { plane: { publishpreflight: ok({ ready: true, first: null, blockers: [], steps: [{ pinned: [] }, {}, {}, { photos: [], unchecked: 0 }] }) } });
  assert.equal(main(q).querySelector("[data-blockers]"), null);
  assert.match(text(q), /Every check against the bar holds/);
  assert.equal(main(q).querySelector('[aria-current="step"]').getAttribute("data-step"), "ties");
});

test("R3 what will be disclosed, and \"See everything that will be disclosed\" draws the whole list", async () => {
  const all = { candidates: [1, 2, 3, 4, 5, 6, 7].map((i) => ({ says: "Tension " + i })), count: 7 };
  const p = await open(PATH, { plane: { publishtensions: ok(all) } });
  assert.match(text(p), /7 things will be disclosed/);
  assert.ok(!/Tension 6/.test(text(p)));
  await press(p, "publishtensions");
  assert.match(text(p), /Tension 6.*Tension 7/);
  assert.match(text(p), /timeline is frozen at signing/);
});

test("R4 each photo shown with its marks; an area marked as what it covers is sent as obscuremark's areas; staff need a reason (control)", async () => {
  const p = await open(PATH);
  const ph = main(p).querySelector(`[data-photo="${PHOTO}"]`);
  assert.ok(ph);
  assert.match(ph.textContent, /Not yet checked/);
  assert.match(text(p), /must be marked, or marked "nothing to obscure", before signing/);
  assert.match(text(p), /obscured and labelled, and goes out without its camera details/);
  await press(p, "obscuremark", { values: { "ce-kind-0": "plate", "ce-x-0": "10", "ce-y-0": "20", "ce-w-0": "30", "ce-h-0": "40" }, reason: R });
  assert.equal(last(p, "obscuremark").query.capture, PHOTO);
  assert.deepEqual(last(p, "obscuremark").body.areas, [{ rect: [10, 20, 40, 60], kind: "plate" }]);
  const n = p.byOp("obscuremark").length;
  await press(p, "obscuremark", { values: { "ce-kind-0": "staff", "ce-x-0": "1", "ce-y-0": "1", "ce-w-0": "5", "ce-h-0": "5", "ce-staff-0": "" }, reason: R });
  assert.equal(p.byOp("obscuremark").length, n, "a staff area with no reason sends nothing");
  await press(p, "obscuremark", { values: { "ce-staff-0": "Their face is beside a tenant's door number." }, reason: R });
  assert.deepEqual(last(p, "obscuremark").body.areas, [{ rect: [1, 1, 6, 6], kind: "staff", reason: "Their face is beside a tenant's door number." }]);
});

test("R4 \"Nothing to obscure\" sends areas []; a mark is withdrawn with a reason, never erased; a format that cannot be covered is named", async () => {
  const marked = { photomarks: ok({ capture: PHOTO, photo: true, state: "marked", marks: [
    { mark: 1, areas: [{ rect: [0, 0, 5, 5], kind: "person" }], by: "dev", at: "x", withdrawn: null },
    { mark: 2, areas: [{ rect: [0, 0, 5, 5], kind: "plate" }], by: "dev", at: "x", withdrawn: { by: "mai", at: "y", reason: "covers the finding" } }] }) };
  const p = await open(PATH, { plane: marked });
  await press(p, "obscuremark", { nth: 1, reason: R });
  carries(last(p, "obscuremark").body, { areas: [] });
  assert.match(text(p), /Mark 1: A person not part of a finding.*Mark 2, withdrawn: A number plate covers the finding/);
  assert.equal(main(p).querySelectorAll('button[data-act="obscuremarkwithdraw"]').length, 1, "a withdrawn mark offers nothing more");
  await press(p, "obscuremarkwithdraw", { values: { "ce-wd-0-1": "It covers what the finding shows." } });
  assert.deepEqual(last(p, "obscuremarkwithdraw").body, { mark: 1, reason: "It covers what the finding shows." });
  const pre = (await import("./fixtures.mjs")).PREFLIGHT();
  pre.steps[3].photos[0].refused = true;
  const q = await open(PATH, { plane: { publishpreflight: ok(pre) } });
  assert.match(text(q), /format whose areas can't be covered, so it stops the signing/);
});

test("R5 the Ties step's confirmation sends publish with tieAttested: true; no Sign is offered before it answers (control)", async () => {
  const p = await open(PATH, { boot: { signer: signer() } });
  assert.ok(!ops(p).includes("caseratify") && !ops(p).includes("publishat"), "no Sign before publish");
  await press(p, "publish", { reason: R });
  assert.equal(p.byOp("publish").length, 0, "nothing sent before the member's own confirmation is ticked");
  tick(p, "ce-tie", "yes");
  await press(p, "publish", { reason: R });
  const b = last(p, "publish").body;
  assert.equal(b.tieAttested, true);
  assert.equal(b.draft, DR);
  assert.equal(b.caseId, C);
  assert.ok(ops(p).includes("caseratify") && ops(p).includes("publishat"), "Sign offered once publish answered");
  const q = await open(PATH, { plane: { publish: pending } });
  tick(q, "ce-tie", "yes");
  await press(q, "publish", { reason: R });
  assert.ok(!ops(q).includes("caseratify"), "no Sign while publish has not answered");
});

test("R12 the Sign step: when it becomes public (now, or a date and time in the group's zone), the two buttons, and who signs", async () => {
  const p = await prepared({ boot: { signer: signer() } });
  assert.match(text(p), /You sign as dev, an owner of The Coliseum lease\. The public page will read “Published by River Town · signed by dev”/);
  assert.match(text(p), /When it becomes public.*America\/Los_Angeles/);
  assert.ok(p.doc.getElementById("ce-date") && p.doc.getElementById("ce-time"));
  assert.match(main(p).querySelector('button[data-act="caseratify"]').textContent, /Sign and publish now/);
  assert.match(main(p).querySelector('button[data-act="publishat"]').textContent, /Sign now and publish at a set time/);
});

test("R13 one sitting signs the case statement, each pinned finding and each piece of evidence, listed; sent as one caseratify with members", async () => {
  const s = signer();
  const p = await prepared({ boot: { signer: s } });
  const listed = main(p).querySelectorAll("[data-statement]").map((li) => li.getAttribute("data-statement"));
  assert.deepEqual(listed, ["case", "finding", "evidence"], "each statement listed before signing");
  await press(p, "caseratify", { reason: R });
  assert.equal(s.asked.length, 1, "one confirmation for the whole list");
  assert.deepEqual(s.asked[0].map((x) => [x.text, x.namespace]), [
    [`bio-ratify-case ${C} 2 ${SHA}\n`, "bio-ratify"], [`bio-ratify FND-2026-0031 ${B1}\n`, "bio-ratify"], [`bio-ratify INFO-2026-0004 ${E1}\n`, "bio-ratify"]]);
  const b = last(p, "caseratify").body;
  assert.deepEqual(b, { caseId: C, edition: 2, expectedSha: SHA, sig: "-----BEGIN SSH SIGNATURE-----SIG0",
    members: [{ id: "FND-2026-0031", sha: B1, signature: "-----BEGIN SSH SIGNATURE-----SIG1" }, { id: "INFO-2026-0004", sha: E1, signature: "-----BEGIN SSH SIGNATURE-----SIG2" }] });
  assert.equal(p.byOp("ratify").length, 0, "ratification R52's one act: no separate ratify");
});

test("R13 declined on the device, nothing is sent; nothing is drawn signed before its answer (R10)", async () => {
  const p = await prepared({ boot: { signer: signer({ decline: true }) } });
  const { slot } = await press(p, "caseratify", { reason: R });
  assert.equal(p.byOp("caseratify").length, 0);
  assert.match(slot().textContent, /Your device didn't confirm, so nothing was signed or published/);
  const q = await prepared({ boot: { signer: signer() }, plane: { caseratify: pending } });
  await press(q, "caseratify", { reason: R });
  assert.equal(q.byOp("caseratify").length, 1);
  assert.equal(main(q).querySelector("[data-signed]"), null, "not drawn signed while the act has not answered");
});

test("R14 signed and waiting draws signedat with \"Move the time\" and \"Cancel publishing\"; signed now draws signednow with the public page", async () => {
  const p = await prepared({ boot: { signer: signer() } });
  await press(p, "publishat", { values: { "ce-date": "2026-11-19", "ce-time": "06:00" }, reason: R });
  assert.deepEqual(last(p, "publishat").body.at, { date: "2026-11-19", time: "06:00" });
  assert.equal(last(p, "publishat").body.members.length, 2);
  assert.match(main(p).querySelector('[data-signed="at"]').textContent, /Signed\. Edition 2 becomes public on 19 November 2026 at 06:00 \(America\/Los_Angeles\)/);
  await press(p, "publishatmove", { values: { "ce-move-date": "2026-11-20", "ce-move-time": "07:30" }, reason: R });
  carries(last(p, "publishatmove").body, { case: C, edition: 2, at: { date: "2026-11-20", time: "07:30" } });
  const w = await open(PATH, { plane: { publishschedule: ok({ editions: [{ case: C, edition: 2, state: "waiting", at: { date: "2026-11-19", time: "06:00", zone: "Z" } }] }) } });
  await press(w, "publishatcancel", { reason: R });
  carries(last(w, "publishatcancel").body, { case: C, edition: 2 });
  const q = await prepared({ boot: { signer: signer() } });
  await press(q, "caseratify", { reason: R });
  assert.match(main(q).querySelector('[data-signed="now"]').textContent, /Signed and published\. Edition 2 is public now/);
  assert.ok(main(q).querySelector(`a[href="/app/published/${C}"]`));
});

test("R15 NO_ATTESTING_KEY draws nokey with the keep choice and \"Register a signing key in this browser\", returning to the step", async () => {
  const s = signer();
  const p = await prepared({ boot: { signer: s }, plane: { caseratify: refusedIn("NO_ATTESTING_KEY") } });
  await press(p, "caseratify", { reason: R });
  const box = main(p).querySelector("[data-nokey]");
  assert.match(box.textContent, /You have no signing key in this browser/);
  assert.match(box.textContent, /Keep this key on this device/);
  tick(p, "ce-keep", "keep");
  await press(p, "signerregisterown", { reason: R });
  assert.deepEqual(s.asked.at(-1), { register: { keep: true } });
  carries(last(p, "signerregisterown").body, { keyB64: "AAAAC3NzaC1lZDI1NTE5AAAAIKEY" });
  assert.equal(main(p).querySelector("[data-nokey]"), null);
  assert.ok(ops(p).includes("caseratify"), "back at the Sign step, nothing lost");
});

test("R15 at the phone width the Sign step draws signing.ceremony.phone and sends nothing; CASE_SIGNER_NOT_AN_OWNER offers \"Ask an owner to sign\"", async () => {
  const ph = await open(PATH, { boot: { signer: signer(), phone: true } });
  assert.match(text(ph), /Signing and publishing finish on a larger screen/);
  assert.equal(main(ph).querySelectorAll('button[data-act="caseratify"]').length, 0);
  const p = await prepared({ boot: { signer: signer() }, plane: { caseratify: refusedIn("CASE_SIGNER_NOT_AN_OWNER") } });
  await press(p, "caseratify", { reason: R });
  assert.match(main(p).querySelector("[data-notowner]").textContent, /Only an owner of The Coliseum lease signs its cases/);
  await press(p, "signrequest", { reason: R });
  carries(last(p, "signrequest").body, { case: C, edition: 2 });
  assert.match(text(p), /The owners are asked to sign/);
});
