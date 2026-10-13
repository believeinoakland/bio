/* public-read — a copy's `label_key` is chosen by what its signed row states, never by the label's current words (R35;
   T47, N953; amends R3; `case-grammar` R31; `case-carriage` R22). A `/7` case edition's `materials:` rows state
   `obscured` (`case-grammar` R12) with, from T47, its stored marker `obscured_kind` (`case-grammar` R31), written by
   `case-grammar`'s own writer (`materialsLines`) from the `obscured` object it is handed. `publishedCase` is read as the
   store answers it and through the Worker's public route. Each claim has its negative control (K874). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, stubOf, bucket, V, NOW, sha, caseDoc } from "./fixture.mjs";
import { bindPublishedPlane, publishedRoutes } from "../../../src/publication/worker.mjs";
import { OBSCURED_LABEL, PUBLISHED_LABEL, COPY_CLEANED_LABEL } from "../../../src/case-carriage/index.mjs";

const json = (o, status = 200) => new Response(JSON.stringify(o), { status, headers: { "content-type": "application/json" } });
bindPublishedPlane({
  json, STORE_SILENT_REASON: "STORE_DID_NOT_ANSWER", STORE_SILENT_DETAIL: "silent", PUBLISHED_STORE: "bio",
  doAnswer: async (res) => { let out = null; try { out = await (await res).json(); } catch { out = null; }
                             return out && out.ok === true ? { answered: true, result: out.result } : { answered: false }; },
  storeSilent: (op) => json({ ok: false, reason: "STORE_DID_NOT_ANSWER", op }, 502),
  requiredArgument: (op, argument, shape, error) => ({ ok: false, reason: "REQUIRED_ARGUMENT_MISSING", op, argument, shape, error }),
});

const CASE = "CASE-2026-0001", F = "INQ-2026-0001";
/* The cleaned-copy label as worded when the marker was introduced (R35), written out here, not read from anywhere. */
const AT_MARKER = "Details of who made this file, and of its pictures, removed for publication; the group holds the original";
/* A re-wording the design stream might make of `COPY_CLEANED_LABEL` after T47. */
const REWORDED = "Who made this file, and the details of its pictures, were removed before publishing; the group keeps the original";

const row = (ref, extra = {}) => ({ ref, kind: "document", sha: null, text_sha: null, origin: null,
                                    archived_copy: null, included: true, rests_under: "load_bearing", ...extra });
/* A copy's row: `kind` is the marker handed to the writer (omitted for an edition signed before T47). */
const copy = (ref, label, { kind, marked } = {}) => row(ref, { included: false, obscured: {
  copy: sha(`copy of ${ref}`), label, ...(kind !== undefined ? { kind } : {}), ...(marked !== undefined ? { marked } : {}) } });

/* One edition over F whose materials are `rows`, published; answers the store's `publishedCase` and the Worker's. */
async function published(rows) {
  const w = world(), env = { PUBLISHED: bucket() };
  if (w.p.caseCarriage && typeof w.p.caseCarriage.marksLapsed === "function") w.p.caseCarriage.marksLapsed = () => [];
  for (const r of rows) w.doc(r.ref);
  const held = rows.map((r) => ({ ...r, sha: w.row(`SELECT capture_sha FROM register WHERE bundle_id=?`, r.ref).capture_sha }));
  w.member("olive");
  const proj = w.project("Parks", "olive");
  w.inquiry(F, { legs: rows.map((r) => ({ target: r.ref })) });
  const pin = w.head(F);
  const text = caseDoc(CASE, 1, { format: "bio-case-document/7", project: proj, roles: [{ target: F, version_sha: pin }],
    method: { grading: "bio-grading/1", checks: "1.57.0" }, attestations: [], materials: held });
  assert.equal(w.p.storeCaseDocument({ case: CASE, edition: 1, text, author: V("olive"), at: NOW }).ok, true);
  assert.equal(w.signCase(CASE, 1, { project: proj, roster: [{ bundle_id: F, version_sha: pin }] }).ok, true);
  assert.equal(w.signFinding(F).ok, true);
  env.PUBLISHED.m.set(`bio/published/${pin}`, new TextEncoder().encode(w.text(F)));
  const store = w.read("publishedcase", { id: CASE });
  assert.equal(store.ok, true, JSON.stringify(store).slice(0, 400));
  const url = new URL(`https://plane/?op=publishedcase&id=${CASE}`);
  const res = await publishedRoutes({ op: "publishedcase", url, env, stub: stubOf(w) });
  assert.equal(res.status, 200);
  return { store, worker: await res.json(), text };
}
const byRef = (c) => Object.fromEntries(c.materials.materials.map((r) => [r.ref, r]));
/* Each answer's keys and labels, store and Worker alike. */
async function keyed(rows) {
  const { store, worker, text } = await published(rows);
  const s = byRef(store), k = byRef(worker);
  for (const ref of Object.keys(s)) {
    assert.equal(k[ref].label_key, s[ref].label_key, `${ref}: the Worker relays the store's key`);
    assert.deepEqual(k[ref].obscured, s[ref].obscured, `${ref}: the Worker relays the signed obscured object`);
  }
  return { by: s, text };
}

test("R35 a row carried as its copy is keyed by the kind its signed row states: kind document keys document.cleaned.label whatever its label's words (today's, the words at the marker, a re-wording, none); kind photo keys by R3's marked rule, even under the cleaned-copy words; the signed label is answered as signed", async () => {
  const rows = [
    copy("INFO-2026-0050-today", COPY_CLEANED_LABEL, { kind: "document" }),
    copy("INFO-2026-0051-reworded", REWORDED, { kind: "document" }),
    copy("INFO-2026-0052-atmarker", AT_MARKER, { kind: "document" }),
    copy("INFO-2026-0053-street", OBSCURED_LABEL, { kind: "photo", marked: true }),
    copy("INFO-2026-0054-park", PUBLISHED_LABEL, { kind: "photo", marked: false }),
    copy("INFO-2026-0055-oddphoto", AT_MARKER, { kind: "photo", marked: true }),
    copy("INFO-2026-0056-oddphoto2", AT_MARKER, { kind: "photo", marked: false }),
  ];
  const { by, text } = await keyed(rows);
  /* the marker is in the signed bytes, one per copy row */
  assert.equal((text.match(/obscured_kind: document/g) || []).length, 3, "the writer states each document marker");
  assert.equal((text.match(/obscured_kind: photo/g) || []).length, 4, "the writer states each photo marker");
  assert.deepEqual(Object.fromEntries(rows.map((r) => [r.ref, by[r.ref].label_key])), {
    "INFO-2026-0050-today": "document.cleaned.label",
    "INFO-2026-0051-reworded": "document.cleaned.label",
    "INFO-2026-0052-atmarker": "document.cleaned.label",
    "INFO-2026-0053-street": "photo.obscured.label",
    "INFO-2026-0054-park": "photo.published.label",
    "INFO-2026-0055-oddphoto": "photo.obscured.label",
    "INFO-2026-0056-oddphoto2": "photo.published.label",
  });
  /* the signed label and kind, answered as signed, never replaced (R13) */
  for (const r of rows) {
    assert.equal(by[r.ref].obscured.label, r.obscured.label, r.ref);
    assert.equal(by[r.ref].obscured.kind, r.obscured.kind, r.ref);
  }
});

test("R35 a row stating no kind (an edition signed before T47) keys document.cleaned.label only under the cleaned-copy words as worded when the marker was introduced, word for word, else as a photo's copy by R3's rule; a re-wording keys a photo's, so re-wording the label re-keys no edition", async () => {
  /* today's COPY_CLEANED_LABEL is still those words; the arms below never depend on it */
  const rows = [
    copy("INFO-2026-0060-atmarker", AT_MARKER),
    copy("INFO-2026-0061-reworded", REWORDED),
    copy("INFO-2026-0062-short", AT_MARKER.slice(0, -1)),
    copy("INFO-2026-0063-case", AT_MARKER.toUpperCase()),
    copy("INFO-2026-0065-unmarked", AT_MARKER, { marked: false }),
    copy("INFO-2026-0066-photo", OBSCURED_LABEL),
    copy("INFO-2026-0067-plain", null),
  ];
  const { by, text } = await keyed(rows);
  assert.equal(/obscured_kind:/.test(text), false, "no row states a kind");
  assert.deepEqual(Object.fromEntries(rows.map((r) => [r.ref, by[r.ref].label_key])), {
    "INFO-2026-0060-atmarker": "document.cleaned.label",
    "INFO-2026-0061-reworded": "photo.obscured.label",
    "INFO-2026-0062-short": "photo.obscured.label",
    "INFO-2026-0063-case": "photo.obscured.label",
    /* the frozen words key a cleaned copy whatever the row's mark states */
    "INFO-2026-0065-unmarked": "document.cleaned.label",
    "INFO-2026-0066-photo": "photo.obscured.label",
    "INFO-2026-0067-plain": "photo.published.label",
  });
  for (const r of rows) assert.equal(by[r.ref].obscured.kind, null, `${r.ref}: no kind stated reads null`);
});

test("R35 controls: a kind other than the two is written null by the writer and keyed by the frozen words as a row stating none is; the same cleaned row keys alike with and without its marker; a material carried whole has no key", async () => {
  const rows = [
    copy("INFO-2026-0070-other", AT_MARKER, { kind: "scan" }),
    copy("INFO-2026-0071-other2", REWORDED, { kind: "scan" }),
    copy("INFO-2026-0072-marked", AT_MARKER, { kind: "document" }),
    copy("INFO-2026-0073-unmarked", AT_MARKER),
    row("INFO-2026-0001-minutes"),
  ];
  const { by } = await keyed(rows);
  assert.equal(by["INFO-2026-0070-other"].obscured.kind, null);
  assert.equal(by["INFO-2026-0070-other"].label_key, "document.cleaned.label");
  assert.equal(by["INFO-2026-0071-other2"].label_key, "photo.obscured.label");
  assert.equal(by["INFO-2026-0072-marked"].label_key, by["INFO-2026-0073-unmarked"].label_key);
  assert.equal(by["INFO-2026-0072-marked"].label_key, "document.cleaned.label");
  assert.equal(by["INFO-2026-0001-minutes"].obscured, null);
  assert.equal(Object.hasOwn(by["INFO-2026-0001-minutes"], "label_key"), false);
});
