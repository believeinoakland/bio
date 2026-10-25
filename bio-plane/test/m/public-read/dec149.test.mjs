/* public-read — DEC-149's voice for a reader with no credential (T34-87; K1811, K1821): every public row this module
   answers says "this group's Civicsmith" where it said "this copy", "this copy of the record", "this plane" or "this
   instance". Each changed string is named here and met at the module's interface: the refusal rows through `rowOf` (R17)
   and at the sites that answer them, `publicRead`'s detail (R18), `publishedManifest`'s detail (R4), `publishedCase`'s
   `case_detail` (R3), and the Worker's `publishedbytes` and `publishedcase` sentences (R5). The container manifest's
   `verify` sentence (R6) is asserted beside its deliverer arm (`convert-deliverer.test.mjs`). Negative control: the
   pattern that finds the old voice finds it in the sentences as they were. */
import { word, localize } from "../../../src/setup-words/index.mjs";
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, stubOf, bucket } from "./fixture.mjs";
import { rowOf } from "../../../src/public-read/checks.mjs";
import { bindPublishedPlane, publishedRoutes, publishedObjectMissing } from "../../../src/publication/worker.mjs";

const json = (o, status = 200) => new Response(JSON.stringify(o), { status, headers: { "content-type": "application/json" } });
bindPublishedPlane({
  json, STORE_SILENT_REASON: "STORE_DID_NOT_ANSWER", STORE_SILENT_DETAIL: "silent", PUBLISHED_STORE: "bio",
  doAnswer: async (res) => { let out = null; try { out = await (await res).json(); } catch { out = null; }
                             return out && out.ok === true ? { answered: true, result: out.result } : { answered: false }; },
  storeSilent: (op) => json({ ok: false, reason: "STORE_DID_NOT_ANSWER", op }, 502),
  requiredArgument: (op, argument, shape, error) => ({ ok: false, reason: "REQUIRED_ARGUMENT_MISSING", op, argument, shape, error }),
});
const call = async (w, env, op, q) => {
  const url = new URL(`https://plane/?op=${op}`);
  for (const [k, v] of Object.entries(q)) url.searchParams.set(k, String(v));
  return publishedRoutes({ op, url, env, stub: stubOf(w) });
};

const OLD_VOICE = /this copy|this instance|the instance's|this plane/i;
const VOICE = "this team's Civicsmith";
/* the rows are read by key (plan rule 6): their voice is the design's, "team" never "group" in text people read */
const ROW_VOICE = "this team's Civicsmith";
const F = "INQ-2026-0001", CASE = "CASE-2026-0001";

/* CASE-2026-0001 edition 1 over F, ratified and published; F's bytes in the published bucket. */
function published() {
  const w = world();
  w.member("olive");
  const proj = w.project("Parks", "olive");
  w.inquiry(F);
  const pin = w.head(F);
  w.prepare(CASE, 1, { project: proj, roles: [{ target: F, version_sha: pin }] });
  w.signCase(CASE, 1, { project: proj, roster: [{ bundle_id: F, version_sha: pin }] });
  const text = w.text(F);
  w.signFinding(F, { shas: [{ sha256: pin, path: "bundle.md", kind: "bundle", bytes: Buffer.byteLength(text) }] });
  const env = { PUBLISHED: bucket() };
  env.PUBLISHED.m.set(`bio/published/${pin}`, new TextEncoder().encode(text));
  return { w, env, pin };
}

/* The rows DEC-149 re-worded (C-68.5, C-98.1, C-98.2, C-98.4, C-98.5, C-98.6, C-98.8, C-98.9, C-98.10), each whole as it
   now reads. */
const ROWS = Object.fromEntries(["NO_PUBLISHED_STORE", "NO_PUBLISHED_PART", "OBJECT_MISSING", "MANIFEST_UNREADABLE", "PART_MISSING", "DUPLICATE_PATH", "NOT_PUBLISHED", "CASE_DOCUMENT_UNSERVABLE", "PUBLIC_READ_NOT_REGISTERED"].map((c) => [c, word(`refusal.${c}`)]));

test("R17 (T34-87, DEC-149) C-68.5, C-98.1, C-98.2, C-98.4, C-98.5, C-98.6, C-98.8, C-98.9 and C-98.10 say \"this group's Civicsmith\", each sentence whole; no row of the table keeps the old voice (negative control: the pattern finds the old sentences)", () => {
  for (const [code, sentence] of Object.entries(ROWS)) {
    assert.equal(rowOf(code).translation, sentence, code);
    assert.ok(sentence.toLowerCase().includes(ROW_VOICE.toLowerCase()), code);
  }
  for (const code of [...Object.keys(ROWS), "FINDING_IN_SEVERAL_CASES", "NOT_A_CONTAINER", "CONTAINER_TOO_LARGE",
                      "WITHHELD_BY_COURT_ORDER"])
    assert.doesNotMatch(rowOf(code).translation, OLD_VOICE, code);
  for (const old of ["This copy of the record offers no public read by that name. Nothing was changed.",
                     "Whoever runs this copy can restore it.", "without this instance's cooperation", "never a verdict this plane reached"])
    assert.match(old, OLD_VOICE, old);
});

test("R17 R3 R5 R18 (T34-87, DEC-149) every refusal carrying a re-worded row answers it at its site: NOT_PUBLISHED at publishedcase, PUBLIC_READ_NOT_REGISTERED with its detail at publicread, NO_PUBLISHED_PART, OBJECT_MISSING and NO_PUBLISHED_STORE at publishedbytes, each detail in the new voice", async () => {
  const { w, env, pin } = published();
  const np = w.read("publishedcase", { id: "CASE-2099-0001" });
  assert.deepEqual([np.reason, np.translation], ["NOT_PUBLISHED", ROWS.NOT_PUBLISHED]);
  const nr = w.read("publicread", { name: "nosuchread" });
  assert.deepEqual([nr.reason, nr.translation], ["PUBLIC_READ_NOT_REGISTERED", ROWS.PUBLIC_READ_NOT_REGISTERED]);
  /* the unregistered read's own detail */
  assert.equal(nr.detail, localize("public-read.index.no_public_read_named_stringify", "no public read named {stringify} is registered on this team's Civicsmith, so there is nothing to serve under that name", { stringify: String(JSON.stringify("nosuchread")) }));
  const never = await (await call(w, env, "publishedbytes", { sha256: "e".repeat(64) })).json();
  assert.deepEqual([never.reason, never.translation], ["NO_PUBLISHED_PART", ROWS.NO_PUBLISHED_PART]);
  /* publishedbytes with no published store bound */
  const noStore = await call(w, {}, "publishedbytes", { sha256: pin });
  assert.equal(noStore.status, 503);
  const ns = await noStore.json();
  assert.deepEqual([ns.reason, ns.translation], ["NO_PUBLISHED_STORE", ROWS.NO_PUBLISHED_STORE]);
  assert.equal(ns.detail, localize("public-read.worker.this_teams_civicsmith_has_no", "this team's Civicsmith has no published object store configured, so its published bytes are not servable. The hash is genuine and this team's Civicsmith cannot hand over the bytes."));
  /* a store bound and no object at the hash */
  assert.equal(publishedObjectMissing().detail, localize("public-read.worker.that_hash_is_published_and", "that hash is published, and this team's Civicsmith holds no bytes for it in its published store, so they cannot be handed over. The hash is genuine."));
  env.PUBLISHED.m.delete(`bio/published/${pin}`);
  const om = await (await call(w, env, "publishedbytes", { sha256: pin })).json();
  assert.deepEqual([om.reason, om.translation, om.detail],
                   ["OBJECT_MISSING", ROWS.OBJECT_MISSING, publishedObjectMissing().detail]);
  for (const r of [np, nr, never, ns, om]) assert.doesNotMatch(JSON.stringify(r), OLD_VOICE);
});

test("R3 R4 R5 (T34-87, DEC-149) publishedManifest's detail, publishedCase's case_detail, an unavailable finding body and publishedcase's verification say \"this group's Civicsmith\"", async () => {
  const { w, env, pin } = published();
  /* the published manifest's detail */
  assert.equal(w.read("publishedmanifest", {}).detail, localize("public-read.index.every_hash_here_is_verifiable", "every hash here is verifiable by anyone with ssh-keygen and the doorbell, without the cooperation or continued existence of this team's Civicsmith. Nothing unpublished appears, by construction: this reads the published projection and never the working corpus."));
  /* the published case's case_detail */
  const c = w.read("publishedcase", { id: CASE });
  assert.equal(c.ok, true);
  assert.equal(c.case_detail, localize("public-read.index.a_published_case_is_a", "a published case is a CONTAINER over one or more FINDINGS (DEC-44). Each finding carries its OWN conclusion, falsifier, basis and its own frozen PAIR of strengths; the case carries the scope that brought them together, the completeness assertion, and the team's acknowledgement of the bias the case was produced under — the last of these is a DISCLOSURE the reader weighs, never a verdict this team's Civicsmith reached (DEC-20, DEC-46). There is deliberately no case-level strength: composing two findings' strengths into one letter is the substitution R2 forbids."));
  /* the Worker's verification sentence */
  const served = await (await call(w, env, "publishedcase", { id: CASE })).json();
  assert.equal(served.verification.detail, localize("public-read.worker.tamper_evident_not_tamper_proof", "tamper-EVIDENT, not tamper-proof: every part is named by sha256 in the manifest, the manifest answers by its own sha256, and EACH FINDING's signature covers that finding's own record sha. Nothing here prevents a modified copy; everything here makes one detectable by anyone holding it, without the cooperation of this team's Civicsmith."));
  /* a finding's body stated unavailable */
  env.PUBLISHED.m.delete(`bio/published/${pin}`);
  const body = (await (await call(w, env, "publishedcase", { id: CASE })).json()).findings[0].body;
  assert.equal(body.state, "unavailable");
  assert.equal(body.detail, localize("public-read.worker.this_teams_civicsmith_cannot_hand", "this team's Civicsmith cannot hand over the bytes of that edition, so its conclusion is not rendered here. It is NOT read from the working record instead: the frozen strength and the rendered body must come from the same bytes."));
  assert.equal(body.translation, ROWS.OBJECT_MISSING);
  for (const r of [w.read("publishedmanifest", {}).detail, c.case_detail, served.verification.detail, body.detail])
    assert.doesNotMatch(r, OLD_VOICE);
});

/* T47-29 (N954): DEC-149 over every sentence a reader meets, not the named ones only. */
import { everyAnswer, sentences } from "./served.mjs";
test("R17 R3 R4 R5 R6 R7 R18 R21 R30 (T47-29, DEC-149) every member-facing sentence this module serves, on every route and in every packaging, every refusal and every row, speaks of \"this group's Civicsmith\" and never of this copy, this instance or this plane (negative control: the walk finds the old voice planted in an answer)", async () => {
  const all = await everyAnswer();
  assert.ok(all.length > 50, "every route, packaging, refusal and row is gathered");
  let read = 0;
  for (const [where, answer] of all) for (const [path, s] of sentences(answer)) {
    read++;
    assert.doesNotMatch(s, OLD_VOICE, `${where} ${path}: ${s.slice(0, 160)}`);
  }
  assert.ok(read > 200, `the walk read the sentences (${read})`);
  /* the new voice is met where a sentence speaks of who serves */
  const voiced = all.flatMap(([, a]) => sentences(a)).filter(([, s]) => s.toLowerCase().includes(VOICE.toLowerCase()));
  assert.ok(voiced.length >= 10, "the new voice is spoken across the answers");
  /* negative control */
  // fixtures-own: input a literal the negative control plants for the voice rule, which reads any answer; no module answers it
  const planted = sentences({ ok: false, detail: "this instance holds no such thing" });
  assert.equal(planted.some(([, s]) => OLD_VOICE.test(s)), true);
  bindPublishedPlane({
    json, STORE_SILENT_REASON: "STORE_DID_NOT_ANSWER", STORE_SILENT_DETAIL: "silent", PUBLISHED_STORE: "bio",
    doAnswer: async (res) => { let out = null; try { out = await (await res).json(); } catch { out = null; }
                               return out && out.ok === true ? { answered: true, result: out.result } : { answered: false }; },
    storeSilent: (op) => json({ ok: false, reason: "STORE_DID_NOT_ANSWER", op }, 502),
    requiredArgument: (op, argument, shape, error) => ({ ok: false, reason: "REQUIRED_ARGUMENT_MISSING", op, argument, shape, error }),
  });
});
