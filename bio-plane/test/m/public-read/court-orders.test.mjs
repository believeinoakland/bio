/* public-read — a court order's stamp, served (T33-65; R28; K1480, K1493, K1522; `publication` R62, `docket` R25). An
   edition under a court-order stamp is served with the stamp and its docket entry linked; bytes a `remove` or `seal`
   withholds are not served, never deleted, and their withholding is stated where they would appear; an `unseal` ends a
   seal's withholding for its parts and never a removal's; a `redact` withholds nothing (past editions stand). Stamps are
   made by `publication.stampEdition` and read through its `stampsOf` (its R62), the order posted as `docket` posts it
   (the fixture's `stampsOn`). Driven at the interface: the store ops and the
   Worker's routes, with the case file assembled as the Worker assembles it. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { publishedSix, stubOf, caseDoc, V, NOW, SIG } from "./fixture.mjs";
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
/* publication's stamp records the entry's seq (its R62); the link names the entry and the docket's fixed address */
const LINK = { seq: 7, id: `${CASE}#7`, digest: null, docket: `op=docketpublic&case=${CASE}` };

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

/* R28 "wherever served" (T47-29; N954): every route that serves an edition's bytes, each asked for every item the order
   withholds. A zip part is read back, and each answer is checked for the withheld bytes themselves. */
const routeBytes = async (s, sha256, extra = {}) => {
  const r = await call(s.w, s.env, "publishedbytes", { sha256, ...extra });
  return { status: r.status, body: new Uint8Array(await r.arrayBuffer()) };
};
test("R28 a whole edition removed is withheld on every route that serves its bytes: each file its case file lists at publishedbytes, the manifest raw and as every part's zip, each finding's bytes, the signed document, and the Worker's and the store's publishedcase, the public index and the editions read; a hash no order names is served as before", async () => {
  const s = await assembled();
  const manifest = JSON.parse(new TextDecoder().decode((await routeBytes(s, s.manifest)).body));
  const files = manifest.files;
  assert.ok(files.length >= 8, "the case file lists its document, signature, findings, their facts and passages, and its complete edition");
  /* before: each is served */
  for (const f of files) assert.equal((await routeBytes(s, f.sha256)).status, 200, `${f.path} is served before the order`);
  /* bytes of each file, to look for in every withheld answer */
  const held = new Map();
  for (const f of files) held.set(f.sha256, (await routeBytes(s, f.sha256)).body);
  s.w.stamps.stamp({ case: CASE, editions: [1], entry: ENTRY, effect: "remove" });
  for (const f of files) {
    const r = await routeBytes(s, f.sha256);
    assert.equal(r.status, 451, `${f.path} (${f.kind}) at publishedbytes`);
    assert.deepEqual(Object.keys(JSON.parse(new TextDecoder().decode(r.body)).withheld), [f.sha256]);
  }
  assert.equal((await routeBytes(s, s.manifest)).status, 451, "the manifest raw");
  for (const p of manifest.parts)
    assert.equal((await routeBytes(s, s.manifest, { format: "zip", part: p.index })).status, 451, `part ${p.index}'s zip`);
  /* the Worker's publishedcase: no finding's body, no document text, no manifest, every file marked */
  const wc = await call(s.w, s.env, "publishedcase", { id: CASE });
  assert.equal(wc.status, 200);
  const wtext = await wc.text();
  const r = JSON.parse(wtext);
  assert.deepEqual(r.findings.map((f) => f.body.state), ["withheld", "withheld"]);
  assert.equal(r.manifest, null);
  assert.deepEqual(r.document, { withheld: true, doc_sha: s.doc, detail: WITHHELD_SENTENCE });
  assert.ok(r.files.length === files.length && r.files.every((f) => f.withheld === true), "every listed file is marked withheld");
  /* none of the withheld text reaches any answer that would carry it */
  const docText = new TextDecoder().decode(held.get(s.doc));
  const answers = { "Worker publishedcase": wtext, "store publishedcase": JSON.stringify(s.w.read("publishedcase", { id: CASE })),
    "by finding": JSON.stringify(s.w.read("publishedcase", { id: s.F, caseId: CASE })),
    "by hash": JSON.stringify(s.w.read("publishedcase", { sha256: s.pins[s.G] })),
    publishedmanifest: JSON.stringify(s.w.read("publishedmanifest")), publishedlist: JSON.stringify(s.w.read("publishedlist")),
    "publishededitions F": JSON.stringify(s.w.read("publishededitions", { id: s.F })) };
  const scope = docText.match(/## Scope\n\n([^\n]+)/)[1];
  for (const [where, text] of Object.entries(answers)) {
    assert.equal(text.includes(scope), false, `${where}: the withheld document's scope is not served`);
    for (const id of [s.F, s.G]) assert.equal(text.includes(`"title":"Finding ${id}"`), false, `${where}: ${id}'s frozen title is not served`);
  }
  const ed = s.w.read("publishededitions", { id: s.F }).editions[0];
  assert.deepEqual([ed.scope, ed.bias_acknowledgement, ed.completeness, ed.case_withheld.orders[0].effect], [null, null, null, "remove"]);
  /* control: a published hash no order names is still served */
  const other = publishedSix();
  assert.equal((await call(other.w, other.env, "publishedbytes", { sha256: other.pins[other.F] })).status, 200);
});

test("R28 a seal over one file of the case file withholds it on every route that serves it (its hash, the part's zip that carries it, its mark on the listing) and nothing at another hash; files sharing its hash are one object and are withheld with it (J1 (5)); the unseal serves it again on each", async () => {
  const s = await assembled();
  const manifest = JSON.parse(new TextDecoder().decode((await routeBytes(s, s.manifest)).body));
  let seq = 20;
  for (const f of manifest.files.filter((x) => x.kind !== "case_document")) {
    s.w.stamps.stamp({ case: CASE, editions: [1], entry: { seq: seq++ }, effect: "seal", parts: [f.path] });
    assert.equal((await routeBytes(s, f.sha256)).status, 451, `${f.path} sealed at its hash`);
    const zip = await routeBytes(s, s.manifest, { format: "zip", part: f.part });
    assert.equal(zip.status, 451, `${f.path}: its part's zip`);
    const twins = manifest.files.filter((x) => x.sha256 === f.sha256).map((x) => x.path);
    const listed = s.w.read("publishedcase", { id: CASE }).files;
    assert.deepEqual(listed.filter((x) => x.withheld).map((x) => x.path), twins, `${f.path}: only it and its hash's twins are marked`);
    for (const o of manifest.files.filter((x) => x.sha256 !== f.sha256 && x.kind !== "case_document"))
      assert.equal((await routeBytes(s, o.sha256)).status, 200, `${o.path} is served while ${f.path} is sealed`);
    s.w.stamps.stamp({ case: CASE, editions: [1], entry: { seq: seq++ }, effect: "unseal", parts: [f.path] });
    assert.equal((await routeBytes(s, f.sha256)).status, 200, `${f.path} unsealed`);
    assert.equal((await routeBytes(s, s.manifest, { format: "zip", part: f.part })).status, 200, `${f.path}: its part again`);
  }
});

/* R28 (K5148; WALK-FINAL-10B R96 (g)): a second case of the team with its own case file assembled. Both cases declare no
   criteria, so their `criteria.json` is the same bytes. `shared` pins the first case's findings; otherwise the second case
   pins a finding of its own. */
const CASE_B = "CASE-2026-0002", H = "INQ-2026-0003";
async function withSecondCase(s, { shared = false } = {}) {
  let targets = [s.F, s.G];
  if (!shared) {
    s.w.inquiry(H);
    s.pins[H] = s.w.head(H);
    assert.equal(s.w.signFinding(H, { sig: SIG(7) }).ok, true);
    s.env.PUBLISHED.m.set(`bio/published/${s.w.head(H)}`, new TextEncoder().encode(s.w.text(H)));
    targets = [H];
  }
  const text = caseDoc(CASE_B, 1, { format: "bio-case-document/6", project: s.proj,
    method: { grading: "bio-grading/1", checks: "1.57.0" }, materials: [], attestations: [],
    roles: targets.map((t) => ({ target: t, version_sha: s.pins[t], role: "load_bearing" })),
    strength: targets.flatMap((t) => [{ target: t, axis: "capture", grade: "A" }, { target: t, axis: "connection", grade: "B" }]) });
  assert.equal(s.w.p.storeCaseDocument({ case: CASE_B, edition: 1, text, author: V("olive"), at: NOW }).ok, true);
  const signed = s.w.signCase(CASE_B, 1, { project: s.proj, sig: SIG(8),
    roster: targets.map((t) => ({ bundle_id: t, version_sha: s.pins[t], role: "load_bearing" })) });
  assert.equal(signed.ok, true, JSON.stringify(signed).slice(0, 300));
  const out = await assembleCaseContainer({ env: s.env, stub: stubOf(s.w), storeName: "bio",
    cs: s.w.p.caseEditionState(CASE_B, 1, "parks-group"), via: "test" });
  assert.equal(typeof out.manifest_sha, "string", JSON.stringify(out).slice(0, 300));
  return out.manifest_sha;
}

test("R28 an order on one case does not withhold another case's zip for a file with no member material: two cases with the default criteria, `remove` on the first, the second's zip is served; the first's is refused; the byte-identical criteria.json is withheld only under the first's orders", async () => {
  const s = await assembled();
  const manifestB = await withSecondCase(s);
  const filesOf = async (sha) => JSON.parse(new TextDecoder().decode((await routeBytes(s, sha)).body)).files;
  const [fa, fb] = [await filesOf(s.manifest), await filesOf(manifestB)];
  const critA = fa.find((f) => f.kind === "criteria"), critB = fb.find((f) => f.kind === "criteria");
  assert.ok(critA && critB && critA.sha256 === critB.sha256, "the two cases' criteria.json are the same bytes");
  assert.equal(await bytesStatus(s, manifestB, { format: "zip" }), 200, "before the order");
  s.w.stamps.stamp({ case: CASE, editions: [1], entry: ENTRY, effect: "remove" });
  assert.equal(await bytesStatus(s, s.manifest, { format: "zip" }), 451, "the first case's own zip is refused");
  assert.equal(await bytesStatus(s, manifestB, { format: "zip" }), 200, "the second case's zip carries no material the order withholds");
});

test("R28 material an order of any case withholds is withheld in every case's zip: a finding both cases pin, sealed by an order of the first, refuses the second's zip naming it, and only it", async () => {
  const s = await assembled();
  const manifestB = await withSecondCase(s, { shared: true });
  s.w.stamps.stamp({ case: CASE, editions: [1], entry: ENTRY, effect: "seal", parts: [s.pins[s.G]] });
  const z = await call(s.w, s.env, "publishedbytes", { sha256: manifestB, format: "zip" });
  assert.equal(z.status, 451);
  assert.deepEqual(Object.keys((await z.json()).withheld), [s.pins[s.G]], "names the shared finding, not the criteria.json");
});

test("R28 a case's own order on its criteria.json refuses its own zip, and not another case's", async () => {
  const s = await assembled();
  const manifestB = await withSecondCase(s);
  const files = JSON.parse(new TextDecoder().decode((await routeBytes(s, s.manifest)).body)).files;
  const crit = files.find((f) => f.kind === "criteria");
  s.w.stamps.stamp({ case: CASE, editions: [1], entry: ENTRY, effect: "seal", parts: [crit.path] });
  assert.equal(await bytesStatus(s, s.manifest, { format: "zip" }), 451, "the case named by the order");
  assert.equal(await bytesStatus(s, manifestB, { format: "zip" }), 200, "another case");
});

test("R28 a withheld edition's finding rows carry no content of the case document: `case_excludes`, `strength`, `grounds` and `required` are null under a remove and under a seal naming the finding, identity facts stay, and no sentence of the signed document is served outside the orders", async () => {
  const s = await assembled();
  const before = s.w.read("publishedcase", { id: CASE });
  const keys = ["case_excludes", "strength", "grounds", "required"];
  assert.ok(before.findings.some((f) => f.case_excludes), "control: served before the order");
  s.w.stamps.stamp({ case: CASE, editions: [1], entry: { seq: 7 }, effect: "seal", parts: [s.pins[s.G]] });
  const sealed = s.w.read("publishedcase", { id: CASE });
  for (const f of sealed.findings) {
    if (f.bundle_id === s.G) for (const k of keys) assert.equal(f[k], null, `sealed ${f.bundle_id} ${k}`);
    else assert.ok(f.strength, "a finding no order names keeps its row");
  }
  s.w.stamps.stamp({ case: CASE, editions: [1], entry: { seq: 8 }, effect: "remove" });
  const c = s.w.read("publishedcase", { id: CASE });
  const exclusion = before.findings.find((f) => f.case_excludes).case_excludes;
  for (const f of c.findings) {
    for (const k of keys) assert.equal(f[k], null, `removed ${f.bundle_id} ${k}`);
    assert.equal(typeof f.bundle_sha, "string");
    assert.ok(f.attestor && f.sig_armored, "identity facts stay");
  }
  const { court_orders, withheld, ...rest } = c;
  assert.equal(JSON.stringify(rest).includes(exclusion), false, "the signed document's exclusion text is not served");
});

test("R28 a seal of the case document alone nulls `case_excludes`, `strength`, `grounds` and `required` of every finding row, identity facts kept, and the exclusion sentence is served nowhere outside the orders; control: with no order they are served", async () => {
  const s = await assembled();
  const before = s.w.read("publishedcase", { id: CASE });
  const exclusion = before.findings.find((f) => f.case_excludes).case_excludes;
  assert.ok(before.findings.every((f) => f.strength), "control: served with no order");
  s.w.stamps.stamp({ case: CASE, editions: [1], entry: ENTRY, effect: "seal", parts: [s.doc] });
  const c = s.w.read("publishedcase", { id: CASE });
  assert.equal(c.withheld.document, true);
  for (const f of c.findings) {
    for (const k of ["case_excludes", "strength", "grounds", "required"]) assert.equal(f[k], null, `${f.bundle_id} ${k}`);
    assert.ok(f.attestor && f.sig_armored && typeof f.bundle_sha === "string", "identity facts stay");
  }
  const { court_orders, withheld, ...rest } = c;
  assert.equal(JSON.stringify(rest).includes(exclusion), false);
});
