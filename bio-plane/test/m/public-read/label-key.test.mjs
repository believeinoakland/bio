/* public-read — every published copy's label answered by key (R3; T41: N798, N811; DEC-179, DEC-185 (1), DEC-187). A `/7`
   case edition's `materials:` rows state `obscured` (`case-grammar` R12) for five copies: a marked photo signed with
   `case-carriage`'s `OBSCURED_LABEL`; an unmarked photo signed before T40 (no label); an unmarked photo signed from T40
   with `PUBLISHED_LABEL` and `obscured_marked: false`; a photo whose row states `obscured_marked: true`; and a member
   document's cleaned copy with `COPY_CLEANED_LABEL`. Beside them, a material carried whole. `obscured_marked` is written
   by `case-grammar`'s own writer (its R12, `materialsLines`), flat on the row after `obscured_label`. `publishedCase` is
   read as the store answers it and through the Worker's public route. Each claim has its negative control (K874). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, stubOf, bucket, V, NOW, sha, caseDoc } from "./fixture.mjs";
import { bindPublishedPlane, publishedRoutes } from "../../../src/publication/worker.mjs";
import { LABEL_KEY_MARKED, LABEL_KEY_UNMARKED, LABEL_KEY_CLEANED } from "../../../src/public-read/index.mjs";
import { OBSCURED_LABEL, PUBLISHED_LABEL, COPY_CLEANED_LABEL, CASE_CARRIAGE_WORDS } from "../../../src/case-carriage/index.mjs";

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

const CASE = "CASE-2026-0001", F = "INQ-2026-0001";
const MARKED = "INFO-2026-0040-street", OLD_PLAIN = "INFO-2026-0041-screen", PLAIN = "INFO-2026-0042-park",
      STATED = "INFO-2026-0043-plate", LETTER = "INFO-2026-0044-letter", WHOLE = "INFO-2026-0001-minutes";
/* `sha` is the original's: the capture the world holds for `ref`, filled in by `publish` */
const row = (ref, extra = {}) => ({ ref, kind: "document", sha: null, text_sha: null, origin: null,
                                    archived_copy: null, included: true, rests_under: "load_bearing", ...extra });
const copy = (ref, label) => row(ref, { included: false, obscured: { copy: sha(`copy of ${ref}`), label } });

/* One edition over F whose materials are `rows`; `marked` maps a ref to the `obscured_marked` its row states. */
function publish(rows, marked = {}) {
  const w = world(), env = { PUBLISHED: bucket() };
  /* a commit refusal from `case-carriage`'s lapsed marks (`publication` R57) is not this module's: none lapse here */
  if (w.p.caseCarriage && typeof w.p.caseCarriage.marksLapsed === "function") w.p.caseCarriage.marksLapsed = () => [];
  for (const r of rows) w.doc(r.ref);
  const held = rows.map((r) => ({ ...r, sha: w.row(`SELECT capture_sha FROM register WHERE bundle_id=?`, r.ref).capture_sha }));
  w.member("olive");
  const proj = w.project("Parks", "olive");
  w.inquiry(F, { legs: rows.map((r) => ({ target: r.ref })) });
  const pin = w.head(F);
  const text = caseDoc(CASE, 1, { format: "bio-case-document/7", project: proj, roles: [{ target: F, version_sha: pin }],
    method: { grading: "bio-grading/1", checks: "1.57.0" }, attestations: [],
    materials: held.map((r) => (r.ref in marked ? { ...r, obscured: { ...r.obscured, marked: marked[r.ref] } } : r)) });
  assert.equal((text.match(/obscured_marked:/g) || []).length, Object.keys(marked).length, "the writer states each mark");
  const stored = w.p.storeCaseDocument({ case: CASE, edition: 1, text, author: V("olive"), at: NOW });
  assert.equal(stored.ok, true, JSON.stringify(stored).slice(0, 400));
  const signed = w.signCase(CASE, 1, { project: proj, roster: [{ bundle_id: F, version_sha: pin }] });
  assert.equal(signed.ok, true, JSON.stringify(signed).slice(0, 400));
  assert.equal(w.signFinding(F).ok, true);
  env.PUBLISHED.m.set(`bio/published/${pin}`, new TextEncoder().encode(w.text(F)));
  return { w, env };
}
const ALL = [row(WHOLE), copy(MARKED, OBSCURED_LABEL), copy(OLD_PLAIN, null), copy(PLAIN, PUBLISHED_LABEL),
             copy(STATED, null), copy(LETTER, COPY_CLEANED_LABEL)];
const MARKS = { [PLAIN]: false, [STATED]: true };
const keysOf = (c) => Object.fromEntries(c.materials.materials.map((r) => [r.ref, r.label_key]));

test("R3 every published copy's label is answered by key beside the label as signed, word for word: photo.obscured.label for a photo's copy marked (its label not null, or its row stating obscured_marked), photo.published.label for one with nothing covered, document.cleaned.label for a member document's cleaned copy; a material carried whole has no key; the same through the Worker's public route", async () => {
  assert.equal(LABEL_KEY_MARKED, "photo.obscured.label");
  assert.equal(LABEL_KEY_UNMARKED, "photo.published.label");
  assert.equal(LABEL_KEY_CLEANED, "document.cleaned.label");
  const { w, env } = publish(ALL, MARKS);
  const c = w.read("publishedcase", { id: CASE });
  assert.equal(c.ok, true, JSON.stringify(c).slice(0, 400));
  assert.deepEqual(keysOf(c), {
    [WHOLE]: undefined,
    [MARKED]: "photo.obscured.label",
    [OLD_PLAIN]: "photo.published.label",
    [PLAIN]: "photo.published.label",
    [STATED]: "photo.obscured.label",
    [LETTER]: "document.cleaned.label",
  });
  /* the label beside its key, as signed, word for word, never replaced (R13) */
  const by = Object.fromEntries(c.materials.materials.map((r) => [r.ref, r]));
  assert.equal(by[MARKED].obscured.label, OBSCURED_LABEL);
  assert.equal(by[OLD_PLAIN].obscured.label, null, "an unmarked copy signed before T40 states no label, and none is filled");
  assert.equal(by[PLAIN].obscured.label, PUBLISHED_LABEL);
  assert.equal(by[STATED].obscured.label, null);
  assert.equal(by[LETTER].obscured.label, COPY_CLEANED_LABEL);
  for (const r of ALL.filter((x) => x.obscured)) assert.equal(by[r.ref].obscured.copy, r.obscured.copy, r.ref);
  /* each key names, in `case-carriage`'s words by key, exactly the label a copy signed now carries beside it */
  for (const ref of [MARKED, PLAIN, LETTER]) assert.equal(CASE_CARRIAGE_WORDS[by[ref].label_key], by[ref].obscured.label, ref);
  /* a row carried whole: obscured null, no key */
  assert.equal(by[WHOLE].obscured, null);
  assert.equal(Object.hasOwn(by[WHOLE], "label_key"), false);
  /* the Worker's public route relays the same keys */
  const r = await call(w, env, "publishedcase", { id: CASE });
  assert.equal(r.status, 200);
  const relayed = await r.json();
  assert.deepEqual(keysOf(relayed), keysOf(c));
});

test("R3 negative controls: a non-null label with obscured_marked false keys photo.published.label, and the same copy without obscured_marked keys photo.obscured.label; a label one character from COPY_CLEANED_LABEL is a photo's, never a cleaned document's; an edition no copy is stated in carries no key at all", () => {
  const one = (rows, marked) => keysOf(publish(rows, marked).w.read("publishedcase", { id: CASE }));
  /* obscured_marked decides where the row states it; the label decides only where it does not (every earlier edition) */
  assert.equal(one([copy(PLAIN, PUBLISHED_LABEL)], { [PLAIN]: false })[PLAIN], "photo.published.label");
  assert.equal(one([copy(PLAIN, PUBLISHED_LABEL)], {})[PLAIN], "photo.obscured.label");
  assert.equal(one([copy(MARKED, OBSCURED_LABEL)], { [MARKED]: false })[MARKED], "photo.published.label");
  /* only the cleaned copy's own words, whole, make it a member document's */
  assert.equal(one([copy(LETTER, COPY_CLEANED_LABEL)], {})[LETTER], "document.cleaned.label");
  assert.equal(one([copy(LETTER, COPY_CLEANED_LABEL.slice(0, -1))], {})[LETTER], "photo.obscured.label");
  /* no copy stated: nothing keyed */
  const plain = publish([row(WHOLE)]).w.read("publishedcase", { id: CASE });
  assert.equal(plain.materials.materials.some((r) => Object.hasOwn(r, "label_key")), false);
});
