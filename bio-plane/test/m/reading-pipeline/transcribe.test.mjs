/* reading-pipeline R29 (T41-9; N820, D21; text-chain R104): the AI's reading of the pages Civicsmith's own text
 * recognition could not read, a transcription tier above tier 3, at a member's act on the account that pays for it,
 * within its limits (`use: "transcribe"`), never under a "no AI" material limit. Tested at the module's interface:
 * `read` with the `transcription` its caller hands in, and the pieces `tier4Pages` and `tier4Extend` (R23).
 *
 * THE ACCOUNT IS REAL (K874's negative controls): record-core, membership and credentials over one SQLite database
 * (node:sqlite, the engine a Durable Object runs), and the account is asked of `credentials.accountFor` (its R56) as
 * the caller hands it in. The limits (`ai-use.useCheck`) and the AI itself are the caller's and are scripted here. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { DatabaseSync } from "node:sqlite";
import { createHash } from "node:crypto";
import { recordOf, RECORD_SCHEMA } from "../../../src/record-core/index.mjs";
import { membershipOf } from "../../../src/membership/index.mjs";
import { credentialsOf } from "../../../src/credentials/index.mjs";
import { derivationCap, captureBound, checkChain, describeChain } from "../../../src/textchain.mjs";
import * as rp from "../../../src/reading-pipeline/index.mjs";
import { bucket, evidenceStore, hold, doc, withEntry, i2, noText, folio, member, ocrAnswer } from "./fixture.mjs";
import { registerDoctype } from "../../../../docprofile/registry.mjs";
import { registerDoctypes } from "../../../../doctypes/index.mjs";

registerDoctypes(registerDoctype);
const { tier4Pages, tier4Extend, TRANSCRIBE_USE, AI_READING_LABEL, AI_TRANSCRIPTION_SOURCE } = rp;

const SEAL = "test-seal-secret-0123456789";
const ANN_KEY = "sk-ann-own-key-never-shown";
const P1_KEY = "sk-project-one-key-never-shown";
const bind = (v) => (v === undefined ? null : typeof v === "boolean" ? (v ? 1 : 0) : v);

/* A group: the founder, a second administrator; `ann` holds her own API key; `dee` holds none and the group holds no
   key; project P1 (owned by ann, `bob` joined) holds its own key; P2 (owned by ann) holds none. */
async function group() {
  const db = new DatabaseSync(":memory:");
  const sql = { exec(q, ...args) { const st = db.prepare(q);
    return st.columns().length ? st.all(...args.map(bind)).map((r) => ({ ...r })) : (st.run(...args.map(bind)), []); } };
  let n = 0;
  const storage = { sql, transactionSync(fn) { const sp = `sp${n++}`; db.exec(`SAVEPOINT ${sp}`);
    try { const r = fn(); db.exec(`RELEASE ${sp}`); return r; } catch (e) { db.exec(`ROLLBACK TO ${sp}`); db.exec(`RELEASE ${sp}`); throw e; } } };
  for (const st of RECORD_SCHEMA.split("\n").filter((l) => !l.trim().startsWith("--")).join("\n").split(";")) if (st.trim()) db.exec(st);
  const ctx = { storage };
  const rc = recordOf(ctx); rc.migrate();
  const m = membershipOf(ctx); m.migrate();
  const c = credentialsOf(ctx, { sealSecret: SEAL }); c.migrate();
  await c.claim({ password: "founder-passphrase-1", tokenFp: "fp-1" });
  const enrol = async (id, role = "member") => {
    const a = await m.memberAdd({ memberId: id, cover: `cover of ${id}`, role, by: "admin" });
    await m.enroll({ invite: a.invite, handle: id, password: `${id}-passphrase-x` });
  };
  await enrol("second", "admin");
  for (const id of ["ann", "bob", "dee"]) await enrol(id);
  const bundle = (id) => rc.commit({ bundleId: id, type: "project", title: id, project: null, snapKey: `s-${id}`, state: "forming", group: "g",
    files: [{ path: "bundle.md", text: `# ${id}`, sha256: createHash("sha256").update(`# ${id}`).digest("hex") }] });
  for (const p of ["P1", "P2"]) { bundle(p); m.projectCreated({ projectId: p, ownerId: "ann", by: "ann" }); }
  m.projectInvite({ projectId: "P1", handle: "bob", by: "ann", viewer: "member:ann" });
  m.projectJoin({ projectId: "P1", by: "bob", viewer: "member:bob" });
  assert.equal((await c.accountReferenceSet({ member: "ann", kind: "apikey", secret: ANN_KEY, by: "ann" })).ok, true);
  assert.equal((await c.projectKeySet({ project: "P1", key: P1_KEY, by: "ann" })).ok, true);
  assert.equal(c.projectAccountSwitch({ project: "P1", on: true, by: "ann" }).ok, true, "a project's key is off when first set (R54)");
  return { c, m };
}

/* The caller's limits (`ai-use.useCheck`, its R3) and AI, scripted and recorded. */
function limits(answer = null) {
  const asked = [];
  return { asked, useCheck: async (q) => { asked.push(q); return typeof answer === "function" ? answer(q) : answer; } };
}
function ai(answer) {
  const calls = [];
  return { calls, transcribe: async (q) => { calls.push(q); return typeof answer === "function" ? answer(q) : answer; } };
}
const model = (pages, extra = {}) => ({ ok: true, engine: "vision-model", version: "3",
  pages: pages.map((p) => ({ page: p, text: `the AI read page ${p}` })), ...extra });

/* A scanned PDF as the pdf entry reads it: page 0 a text layer, page 1 a scan, page 2 an image filling the page with
   its folio "12". Tier 3 is not bound, so pages 1 and 2 stay unread. */
const PAGES = [{ page: 0, text: "Staff report on the capital plan" },
               { page: 1, text: "", undetermined: [noText(1)] },
               { page: 2, text: "12", undetermined: [folio(2)] }];
const scanEntry = (pages = PAGES) => ({ format: "pdf", structure: async () => ({ ok: true, text: i2(pages), pages: pages.length, notes: [] }) });
/* `read` called directly, as its caller does, with the `transcription` a member's act hands in. */
async function readWith({ transcription = null, env = {}, pages = PAGES } = {}) {
  const b = bucket();
  const d = await hold(b, `%PDF scan ${JSON.stringify(pages)}`);
  const document = doc({ digest: d, format: "pdf", ct: "application/pdf", locator: "https://records.example.gov/report.pdf" });
  return withEntry(scanEntry(pages), () => rp.read(document, { evidence: evidenceStore(b), env, storeName: "bio", transcription }));
}
const leaks = (out, ...secrets) => secrets.filter((s) => JSON.stringify(out).includes(s));

test("R29 R23: a member's act on her own account, within its limits: the pages Civicsmith's own text recognition could not read are the AI's reading, under pixels -> ai_transcription(<model>) at tier 4, uncapped and so undetermined; a folio page keeps its folio with the AI's reading appended; labelled the AI's reading; the key reaches the AI alone", async () => {
  const { c } = await group();
  const lim = limits(null);
  const a = ai((q) => model(q.pages));
  const out = await readWith({ transcription: { member: "ann", credentials: c, useCheck: lim.useCheck, transcribe: a.transcribe, at: "2026-10-09T12:00:00Z" } });
  const r = out.reading;
  /* asked once, for exactly the unread pages, with the account the cascade chose, the digest and the store */
  assert.equal(a.calls.length, 1);
  assert.deepEqual([a.calls[0].pages, a.calls[0].use, a.calls[0].store, a.calls[0].account.level, a.calls[0].account.key],
                   [[1, 2], TRANSCRIBE_USE, "bio", "member", ANN_KEY]);
  assert.match(a.calls[0].capture_sha, /^[0-9a-f]{64}$/);
  assert.deepEqual(lim.asked, [{ owner: "member:ann", member: "ann", use: "transcribe", at: "2026-10-09T12:00:00Z" }]);
  /* the reading: tier 4, the AI's pages merged by R6's rule */
  assert.deepEqual([r.read_from_text, r.text_tier, r.text_container], [true, 4, "pdf"]);
  assert.deepEqual(r.ai_transcription, { pages: [1, 2], engine: "vision-model", version: "3", label: AI_READING_LABEL });
  assert.deepEqual(out.text_units.map((u) => [u.extent.page, u.text]),
                   [[0, "Staff report on the capital plan"], [1, "the AI read page 1"], [2, "12\nthe AI read page 2"]]);
  /* the chain: the layer part (pages 0 and the folio page 2) and the AI's part (pages 1, 2), part-stamped (D-723) */
  const c0 = r.text_source;
  assert.equal(checkChain(c0), null);
  assert.deepEqual(c0.map((s) => [s.step, s.extent.pages, s.extent.part]),
                   [["layer", [0, 2], 0], ["pixels", [1, 2], 1], ["ai_transcription", [1, 2], 1]]);
  const step = c0[2];
  assert.deepEqual([step.engine, step.version, step.cap, step.measured_by, step.calibration],
                   ["vision-model", "3", null, AI_TRANSCRIPTION_SOURCE, null]);
  assert.equal(c0[1].cap, null, "the pixels the AI read are uncapped too");
  /* undetermined: no machine mints a grade (R20; text-chain R104) */
  assert.equal(derivationCap(c0), null);
  assert.equal(derivationCap(c0, { page: 1 }), null);
  assert.equal(captureBound(c0), null, "captureBound answers undetermined for text the AI produced");
  assert.doesNotMatch(JSON.stringify(out), /"grade"/);
  /* labelled: the basis says it, the chain's sentence says it */
  assert.match(r.basis, /pages 2-3 that Civicsmith's own text recognition could not read were transcribed by the AI \(vision-model 3\) at a member's request, on the account that pays for it: this text is the AI's reading, not yet determined/);
  assert.match(r.basis, /page 3 already held a little text of its own \(a folio\), which was kept, and the AI's reading was appended after it/);
  assert.match(describeChain(c0), /the AI's reading of the page \(vision-model 3\) \(pages 1-2\)/, "the chain's own sentence (text-chain's 0-based pages)");
  assert.doesNotMatch(r.basis, /\binstance\b|\bthe plane\b/i, "DEC-149's words");
  /* R18: pages the AI read are tier 4, named by the model; the folio page has both producers */
  const pg = Object.fromEntries(r.provenance.pages.map((p) => [p.page, p]));
  assert.deepEqual([pg[0].tier, pg[0].member, pg[1].tier, pg[1].member], [1, "plane", 4, null]);
  assert.deepEqual(pg[2].producers, [{ tier: 1, member: "plane" }, { tier: 4, member: null }]);
  assert.ok(r.provenance.producers.some((p) => p.tier === 4 && p.engine === "vision-model 3" && p.pages.join() === "1,2"));
  /* the key went to the AI only */
  assert.deepEqual(leaks(out, ANN_KEY, P1_KEY), []);
});

test("R29: on a project's account the act names the project: the project's key pays (owner `project:<id>` asked of the limits), once the member has read its notice", async () => {
  const { c } = await group();
  const seen = c.projectKeyNoticeSeen({ member: "bob", project: "P1", by: "bob" });
  assert.equal(seen.ok, true, JSON.stringify(seen));
  const lim = limits(null);
  const a = ai((q) => model(q.pages));
  const out = await readWith({ transcription: { member: "bob", project: "P1", credentials: c, useCheck: lim.useCheck, transcribe: a.transcribe } });
  assert.equal(a.calls.length, 1, out.reading.basis);
  assert.deepEqual([a.calls.length, a.calls[0].account.level, a.calls[0].account.key], [1, "project", P1_KEY]);
  assert.deepEqual(lim.asked.map((q) => [q.owner, q.member, q.use]), [["project:P1", "bob", "transcribe"]]);
  assert.equal(out.reading.text_tier, 4);
  assert.deepEqual(leaks(out, ANN_KEY, P1_KEY), []);
});

test("R29 (negative controls, K874): no account, the use switched off, the group's \"no AI\" limit, the project's, a limit reached, no limits checked, no member's act: nothing is sent to the AI, the reading is tiers 1-3's exactly, and its basis names why", async () => {
  const base = (await readWith()).reading;
  const same = (r, label) => {
    for (const k of ["text_source", "text_tier", "found", "entities", "provenance", "text_chars", "page_count"])
      assert.deepEqual(r[k], base[k], `${label}: ${k} is tiers 1-3's`);
    assert.equal(r.ai_transcription, undefined, `${label}: no AI reading`);
  };
  const cases = [
    ["no account", async (w) => ({ member: "dee" }), /NO_ACCOUNT/],
    ["switched off", async (w) => { assert.equal(w.c.accountUsesSet({ owner: "member:ann", switch: "transcribe", on: false, by: "ann" }).ok, true);
                                    return { member: "ann" }; }, /AI_USE_SWITCHED_OFF/],
    ["group keeps it away", async (w) => { assert.equal(w.c.aiKeepAwaySet({ on: true, uses: ["transcribe"], reason: "no AI on our records", by: "admin" }).ok, true);
                                           return { member: "ann" }; }, /AI_KEPT_AWAY/],
    ["project keeps it away", async (w) => { assert.equal(w.c.projectAiKeepAwaySet({ project: "P1", on: true, uses: ["transcribe"], reason: "not this matter", by: "ann" }).ok, true);
                                             return { member: "ann", project: "P1" }; }, /PROJECT_AI_KEPT_AWAY/],
    ["a project he cannot see", async (w) => ({ member: "dee", project: "P1" }), /NO_SUCH_PROJECT/],
    ["limit reached", async (w) => ({ member: "ann", useCheck: async () => ({ ok: false, code: "AI_LIMIT_REACHED", detail: "this month's use is spent" }) }), /AI_LIMIT_REACHED: this month's use is spent/],
    ["no limits checked", async (w) => ({ member: "ann", useCheck: null }), /limits of the account that would pay for it could not be checked/],
    ["no member's act", async (w) => ({ member: null }), /only at a member's own act/],
    ["no credentials handed in", async (w) => ({ member: "ann", credentials: null }), /could not be checked/],
  ];
  for (const [label, setup, says] of cases) {
    const w = await group();
    const lim = limits(null);
    const a = ai(() => { throw new Error("the AI must not be asked"); });
    const extra = await setup(w);
    const transcription = { credentials: w.c, useCheck: lim.useCheck, transcribe: a.transcribe, ...extra };
    const out = await readWith({ transcription });
    assert.equal(a.calls.length, 0, `${label}: nothing sent to the AI`);
    same(out.reading, label);
    assert.match(out.reading.basis, /the AI was not asked to transcribe pages 2-3: /, label);
    assert.match(out.reading.basis, says, label);
    assert.deepEqual(leaks(out, ANN_KEY, P1_KEY), [], `${label}: no key`);
  }
  /* beside them, the positive: a group limit on another use only leaves transcription on */
  const w = await group();
  w.c.aiKeepAwaySet({ on: true, uses: ["ask"], reason: "no questions", by: "admin" });
  const a = ai((q) => model(q.pages));
  const out = await readWith({ transcription: { member: "ann", credentials: w.c, useCheck: limits(null).useCheck, transcribe: a.transcribe } });
  assert.deepEqual([a.calls.length, out.reading.text_tier], [1, 4]);
});

test("R29 R21: without a member's act `read` is tiers 1-3's exactly (no key added); a document with no page the plane could not read asks nothing and reads no account; tier 3's filled pages are never sent", async () => {
  const w = await group();
  const without = await readWith();
  assert.equal(without.reading.ai_transcription, undefined);
  assert.doesNotMatch(without.reading.basis, /\bAI\b/);
  /* every page read by its layer: no account is read, the AI is not asked */
  let asked = 0;
  const counting = { accountFor: async (q) => { asked++; return w.c.accountFor(q); } };
  const a = ai(() => { throw new Error("must not be asked"); });
  const plain = await readWith({ pages: [{ page: 0, text: "all text" }], transcription: { member: "ann", credentials: counting, useCheck: limits(null).useCheck, transcribe: a.transcribe } });
  assert.deepEqual([asked, a.calls.length, plain.reading.text_tier], [0, 0, 1]);
  assert.match(plain.reading.basis, /no page was left that Civicsmith's own text recognition could not read/);
  /* tier 3 fills page 1; only the folio page OCR did not fill is the AI's */
  const ocr = member((body) => ocrAnswer(body.pages.filter((p) => p === 1)));
  const b = ai((q) => model(q.pages));
  const both = await readWith({ env: { OCR_WORKER: ocr }, transcription: { member: "ann", credentials: w.c, useCheck: limits(null).useCheck, transcribe: b.transcribe } });
  assert.deepEqual(b.calls.map((q) => q.pages), [[2]]);
  assert.deepEqual(both.reading.text_source.map((s) => [s.step, s.extent && s.extent.pages]),
                   [["layer", [0, 2]], ["pixels", [1]], ["ocr", [1]], ["pixels", [2]], ["ai_transcription", [2]]]);
  assert.equal(both.reading.text_tier, 4);
});

test("R29 R6 R9 R23: tier4Pages and tier4Extend: the pages selected are the unread ones (a scan marker still standing, or OCR read to no glyph), none when encrypted; an answer naming no model is refused; a page not asked, or one carrying text, is never merged and is named; a page the AI left out stays unread", async () => {
  const floored = { page: 3, text: "", undetermined: [{ page: 3, reason: "ocr_below_floor", count: 1 }] };
  assert.deepEqual(tier4Pages(i2([...PAGES, floored])), [1, 2, 3]);
  assert.deepEqual(tier4Pages(i2([...PAGES, { page: 4, text: "", undetermined: [{ page: null, reason: "encrypted", count: 1 }] }])), []);
  assert.deepEqual(tier4Pages(i2([{ page: 0, text: "x" }])), []);
  assert.deepEqual(tier4Pages(null), []);
  const { c } = await group();
  const go = (answer) => tier4Extend({ member: "ann", credentials: c, useCheck: async () => null, transcribe: async () => answer },
                                     { sha: "d", storeName: "bio", i2text: i2(PAGES), wiredTier: 1, chain: rp.layerChainFor(i2(PAGES), { tier: 1, container: "pdf" }) });
  const unnamed = await go({ ok: true, pages: [{ page: 1, text: "x" }] });
  assert.deepEqual([unnamed.filled, unnamed.wiredTier], [[], 1]);
  assert.match(unnamed.aiNote, /did not name the model/);
  const declined = await go({ ok: false, reason: "busy" });
  assert.match(declined.aiNote, /the AI declined \(busy\)/);
  const mixed = await go(model([0, 1, 7]));
  assert.deepEqual(mixed.filled, [1]);
  assert.match(mixed.aiNote, /page 3 the AI did not transcribe, and it stays unread/);
  assert.match(mixed.aiNote, /2 page\(s\) the AI returned were not merged: page 1 \(the AI was not asked for it\), page 8 \(the document has no such page\)/);
  assert.equal(mixed.i2text.pages[0].text, "Staff report on the capital plan", "a page with text is never replaced");
  const nothing = await go(model([]));
  assert.match(nothing.aiNote, /returned no text for any page/);
  const thrown = await tier4Extend({ member: "ann", credentials: c, useCheck: async () => null, transcribe: async () => { throw new Error("down"); } },
                                   { sha: "d", storeName: "bio", i2text: i2(PAGES), wiredTier: 1, chain: null });
  assert.match(thrown.aiNote, /the AI could not be reached/);
  assert.equal((await tier4Extend(null, { i2text: i2(PAGES) })).aiNote, null, "no act: nothing said, nothing done");
});

test("R18 R19 (R29): readingProvenance credits a page an ai_transcription step covers to tier 4, named by the model, never to tier 3's OCR member for the pixels before it; compareProvenance attributes a change to it", async () => {
  const PIX = { step: "pixels", cap: null, measured_by: AI_TRANSCRIPTION_SOURCE, calibration: null };
  const AIT = { step: "ai_transcription", engine: "vision-model", version: "3", cap: null, measured_by: AI_TRANSCRIPTION_SOURCE, calibration: null };
  const text = i2([{ page: 0, text: "the AI read this" }]);
  const p = await rp.readingProvenance({ text, chain: [PIX, AIT], tier: 4, container: "pdf", planeVersion: "v" });
  assert.deepEqual(p.pages.map((x) => [x.page, x.tier, x.member]), [[0, 4, null]]);
  assert.deepEqual(p.producers.map((x) => [x.tier, x.member, x.engine]), [[4, null, "vision-model 3"]]);
  /* beside it, an OCR part still reads tier 3 on ocr-worker */
  const ocr = await rp.readingProvenance({ text: i2([{ page: 0, text: "the OCR engine read this" }]), chain: [{ step: "pixels", cap: "C", measured_by: "M" }, { step: "ocr", engine: "tess", version: "5", cap: "C", measured_by: "M" }], tier: 3, container: "pdf" });
  assert.deepEqual(ocr.pages.map((x) => [x.tier, x.member]), [[3, "ocr-worker"]]);
  const c = rp.compareProvenance(ocr, p);
  assert.equal(c.state, "differs");
  assert.match(c.says, /page 1 was read by tier 3 on ocr-worker before and by tier 4 on an unnamed member now/);
});
