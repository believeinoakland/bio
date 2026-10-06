/* public-read — a court order's stamp, served (T33-65; R28; K1480, K1493, K1522; `publication` R62, `docket` R25). An
   edition under a court-order stamp is served with the stamp and its docket entry linked; bytes a `remove` or `seal`
   withholds are not served, never deleted, and their withholding is stated where they would appear; an `unseal` ends a
   seal's withholding for its parts and never a removal's; a `redact` withholds nothing (past editions stand). Stamps come
   from `publication.stampsOf` (its R62), here the fixture's `stampsOn` on that interface until publication's T33-63
   merges and these tests re-point at its `stampEdition` (K1563 (1)). Driven at the interface: the store ops and the
   Worker's routes, with the case file assembled as the Worker assembles it. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { publishedSix, stubOf } from "./fixture.mjs";
import { bindPublishedPlane, publishedRoutes, assembleCaseContainer } from "../../../src/publication/worker.mjs";
import { WITHHELD_SENTENCE } from "../../../src/public-read/courtorders.mjs";
import { rowOf } from "../../../src/public-read/checks.mjs";

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
const CASE = "CASE-2026-0001";
const ENTRY = { seq: 7, digest: "d".repeat(64) };
const LINK = { seq: 7, id: `${CASE}#7`, digest: "d".repeat(64), docket: `op=docketpublic&case=${CASE}` };

/* A published /6 edition with its case file assembled; `doc` its case document's hash, `manifest` its manifest's. */
async function assembled(opts = {}) {
  const s = publishedSix(opts);
  const out = await assembleCaseContainer({ env: s.env, stub: stubOf(s.w), storeName: "bio",
    cs: s.w.p.caseEditionState(CASE, 1, "parks-group"), via: "test" });
  assert.equal(typeof out.manifest_sha, "string", JSON.stringify(out).slice(0, 400));
  const doc = s.w.row(`SELECT doc_sha FROM case_documents WHERE case_id=? AND edition=1`, CASE).doc_sha;
  return { ...s, out, doc, manifest: out.manifest_sha };
}
const bytesStatus = async (s, sha256, extra = {}) => (await call(s.w, s.env, "publishedbytes", { sha256, ...extra })).status;

test("R28 an edition with no stamp answers `court_orders: []` and `withheld: null`, and every byte is served as before", async () => {
  const s = await assembled();
  const c = s.w.read("publishedcase", { id: CASE });
  assert.deepEqual([c.court_orders, c.withheld], [[], null]);
  for (const sha256 of [s.pins[s.F], s.doc, s.manifest]) assert.equal(await bytesStatus(s, sha256), 200);
  assert.equal(await bytesStatus(s, s.manifest, { format: "zip" }), 200);
});

test("R28 a `remove` of the whole edition: served with its stamp and the docket entry that names the order; the document, the findings' bytes, the manifest and every file withheld from serving and stated so where they would appear; nothing deleted", async () => {
  const s = await assembled();
  const held = s.w.count("published_bundles");
  s.w.stamps.stamp({ case: CASE, editions: [1], entry: ENTRY, effect: "remove" });
  const c = s.w.read("publishedcase", { id: CASE });
  assert.equal(c.ok, true);
  assert.deepEqual(c.court_orders.map((o) => [o.effect, o.parts, o.entry]), [["remove", null, LINK]]);
  assert.deepEqual([c.withheld.whole, c.withheld.document, c.withheld.manifest, c.withheld.detail],
                   [true, true, true, WITHHELD_SENTENCE]);
  assert.deepEqual(c.document, { withheld: true, doc_sha: s.doc, detail: WITHHELD_SENTENCE }, "the document's place states it");
  assert.equal(c.manifest, null);
  assert.ok(c.files.length > 0 && c.files.every((f) => f.withheld === true), "every file is marked withheld");
  for (const f of c.findings) {
    assert.deepEqual([f.title, f.withheld.detail, f.withheld.orders[0].effect], [null, WITHHELD_SENTENCE, "remove"], f.bundle_id);
    assert.equal(typeof f.bundle_sha, "string", "its hash, a public fact, stays");
  }
  for (const k of ["scope", "completeness", "bias_acknowledgement", "lens", "tensions", "captures", "sources",
                   "calculations", "timeline", "what_changed", "project_reference", "method", "materials"])
    assert.equal(c[k], null, `${k}: read from the withheld document, so not served`);
  assert.equal(c.lens_detail, WITHHELD_SENTENCE);
  /* the Worker: each finding's body states the withholding and nothing is fetched; every byte is 451 */
  const r = await (await call(s.w, s.env, "publishedcase", { id: CASE })).json();
  assert.deepEqual(r.findings.map((f) => f.body.state), ["withheld", "withheld"]);
  assert.deepEqual(r.findings.map((f) => f.basis), [[], []]);
  for (const sha256 of [s.pins[s.F], s.pins[s.G], s.doc, s.manifest]) {
    const res = await call(s.w, s.env, "publishedbytes", { sha256 });
    assert.equal(res.status, 451, sha256);
    const b = await res.json();
    assert.deepEqual([b.reason, b.code, b.check, b.translation], ["WITHHELD_BY_COURT_ORDER", ...Object.values(rowOf("WITHHELD_BY_COURT_ORDER"))]);
    assert.deepEqual(b.withheld[sha256].map((o) => [o.case, o.edition, o.effect, o.entry]), [[CASE, 1, "remove", LINK]]);
  }
  assert.equal(await bytesStatus(s, s.manifest, { format: "zip" }), 451);
  /* nothing deleted: the hashes still verify, the bytes are still held, the rows unchanged */
  for (const sha256 of [s.pins[s.F], s.doc, s.manifest]) assert.equal(s.w.read("verify", { sha256 }).published, true);
  assert.ok(s.env.PUBLISHED.m.has(`bio/published/${s.pins[s.F]}`));
  assert.equal(s.w.count("published_bundles"), held);
});

test("R28 a `seal` withholds only the parts it names, the zip that would carry them refused naming them; an `unseal` ends it for its parts; a `remove` of parts is never ended by an unseal", async () => {
  const s = await assembled();
  const c0 = s.w.read("publishedcase", { id: CASE });
  const gPath = c0.files.find((f) => f.kind === "finding" && f.path.includes(s.G)).path;
  s.w.stamps.stamp({ case: CASE, editions: [1], entry: ENTRY, effect: "seal", parts: [gPath] });
  const c = s.w.read("publishedcase", { id: CASE });
  assert.deepEqual([c.withheld.whole, c.withheld.document, c.withheld.findings, c.withheld.files],
                   [false, false, [s.G], [gPath]]);
  assert.equal(c.findings.find((f) => f.bundle_id === s.F).withheld, undefined, "F is served");
  assert.equal(typeof c.document.text, "string", "the document is served");
  assert.equal(await bytesStatus(s, s.pins[s.G]), 451);
  assert.equal(await bytesStatus(s, s.pins[s.F]), 200);
  const zip = await call(s.w, s.env, "publishedbytes", { sha256: s.manifest, format: "zip" });
  assert.equal(zip.status, 451);
  assert.deepEqual(Object.keys((await zip.json()).withheld), [s.pins[s.G]], "names the withheld file, and only it");
  /* unsealed: served again */
  s.w.stamps.stamp({ case: CASE, editions: [1], entry: { seq: 8 }, effect: "unseal", parts: [gPath] });
  const u = s.w.read("publishedcase", { id: CASE });
  assert.equal(u.withheld, null);
  assert.deepEqual(u.court_orders.map((o) => [o.effect, o.entry.id]), [["seal", `${CASE}#7`], ["unseal", `${CASE}#8`]],
    "both stamps are served, in order");
  assert.equal(await bytesStatus(s, s.pins[s.G]), 200);
  /* a removal by part, then an unseal naming it: still withheld */
  s.w.stamps.stamp({ case: CASE, editions: [1], entry: { seq: 9 }, effect: "remove", parts: [s.pins[s.F]] });
  s.w.stamps.stamp({ case: CASE, editions: [1], entry: { seq: 10 }, effect: "unseal", parts: [s.pins[s.F]] });
  assert.equal(await bytesStatus(s, s.pins[s.F]), 451, "matched by its hash; an unseal never ends a removal");
});

test("R28 a `redact` withholds nothing: the edition stands as it was, served with the stamp beside it (K1493)", async () => {
  const s = await assembled();
  s.w.stamps.stamp({ case: CASE, editions: [1], entry: ENTRY, effect: "redact", parts: [s.pins[s.F]] });
  const c = s.w.read("publishedcase", { id: CASE });
  assert.deepEqual(c.court_orders.map((o) => [o.effect, o.parts, o.entry]), [["redact", [s.pins[s.F]], LINK]]);
  assert.equal(c.withheld, null);
  for (const sha256 of [s.pins[s.F], s.doc, s.manifest]) assert.equal(await bytesStatus(s, sha256), 200);
});

test("R28 the same bytes are withheld wherever they would be served: a finding another case also pins, the public index's rows, and a successor's statement quoted from a withheld edition", async () => {
  const s = await assembled({ edition: 2 });
  /* a second case pinning F at the same hash */
  s.w.prepare("CASE-2026-0002", 1, { project: s.proj, roles: [{ target: s.F, version_sha: s.pins[s.F] }] });
  s.w.signCase("CASE-2026-0002", 1, { project: s.proj, roster: [{ bundle_id: s.F, version_sha: s.pins[s.F] }] });
  s.w.stamps.stamp({ case: CASE, editions: [2], entry: ENTRY, effect: "remove" });
  const other = s.w.read("publishedcase", { id: "CASE-2026-0002" });
  assert.equal(other.findings[0].withheld.orders[0].case, CASE, "withheld under the order that names its bytes");
  assert.deepEqual(other.court_orders, [], "the other case carries no stamp of its own");
  const one = s.w.read("publishedcase", { id: CASE, edition: 1 });
  assert.deepEqual(one.court_orders, [], "edition 1 is not named by the order");
  assert.equal(typeof one.document.text, "string", "and its own document is served");
  assert.deepEqual([one.successor.edition, one.successor.statement, one.successor.withheld], [2, null, true],
    "the pointer to edition 2 stays; its withheld statement is not quoted");
  const m = s.w.read("publishedmanifest");
  const row2 = m.cases.find((c) => c.case_id === CASE && c.edition === 2);
  assert.deepEqual([row2.scope, row2.bias_acknowledgement, row2.manifest, row2.withheld.whole, row2.court_orders[0].entry],
                   [null, null, null, true, LINK]);
  const row1 = m.cases.find((c) => c.case_id === CASE && c.edition === 1);
  assert.equal(Object.hasOwn(row1, "court_orders"), false, "an unstamped edition's row is unchanged");
  const fRow = m.published.find((p) => p.bundle_id === s.F);
  assert.deepEqual([fRow.title, fRow.withheld.orders[0].effect], [null, "remove"]);
  const list = s.w.read("publishedlist");
  assert.equal(list.bundles.find((b) => b.bundle_id === s.F).title, null);
  assert.equal(list.cases.find((c) => c.case_id === CASE && c.edition === 2).withheld.whole, true);
  const eds = s.w.read("publishededitions", { id: s.F });
  assert.equal(eds.editions[0].withheld.orders[0].effect, "remove");
  /* withheldOf answers only what is withheld, and nothing for a hash no order names */
  assert.deepEqual(Object.keys(s.w.read("withheld", { sha256: `${s.pins[s.F]},${"0".repeat(64)}` }).withheld), [s.pins[s.F]]);
  assert.deepEqual(s.w.read("withheld", { sha256: "" }).withheld, {});
});
