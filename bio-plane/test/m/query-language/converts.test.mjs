/* The shares of five old suites that this module proves at its own interface (T18's convert entries, K619):
   `meaningquery`, `search`, `content-arm` (their rows in `build/jobs/T17/legacy-tests.md`), and `meaningread`,
   `passage-arm` (no row: the share is what those suites assert of the compiled plan rather than of the op around
   it). Each test names the requirements it proves. Ground truth is computed from each fixture's own definition, never
   read back from the compiler, and every database refuses a compound SELECT wider than workerd's five terms. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, everyStatement, WORKERD_COMPOUND_SELECT } from "./fixture.mjs";
import { compile, meaningVocabulary, MEANING, CHAIN_DOES_NOT_APPLY, CAP_DOES_NOT_APPLY } from "../../../src/query.mjs";
import { normalizeType } from "../../../src/record-grammar/types.mjs";
import { CONTENT_MINTED_BY_PLANE } from "../../../src/content/index.mjs";
import { MACHINE_CLASS_PREFIX } from "../../../src/record-grammar/actors.mjs";

const V = "class:member";
const sorted = (a) => [...a].sort();
const uniq = (a) => [...new Set(a)];

/* ---- meaningquery ---- */

/* The corpus the old suite promoted, declared once: five inquiries and their legs, two documents, and a resolution. */
const LEGGED = [
  { id: "H1", legs: [{ target: "DA", role: "supports", grade: "B", grade_axis: "connection", grade_source: "hunch" },
                     { target: "DB", role: "supports" }] },
  { id: "H2", legs: [{ target: "DA", role: "cuts_against", grade: "C", grade_axis: "connection", grade_source: "hunch" }] },
  { id: "C1", legs: [{ target: "DA", role: "supports", ground: "charter" }, { target: "DB", role: "supports", ground: "code" }] },
  { id: "C2", legs: [{ target: "DB", role: "cuts_against", grade: "D", grade_axis: "connection", grade_source: "testimony" }] },
  { id: "L0", legs: [] },
];
function leggedWorld() {
  const w = world();
  w.bundle("DA", { body: "a memo about the sewer fund", current_state: "collected" });
  w.bundle("DB", { body: "a ledger naming the transfer", current_state: "collected" });
  for (const f of LEGGED) {
    w.bundle(f.id, { type: "inquiry", body: `what does ${f.id} rest on`, current_state: "open" });
    f.legs.forEach((l, ord) => w.insert("inquiry_basis", { bundle_id: f.id, ord, target_id: l.target, role: l.role,
      grade: l.grade ?? null, grade_axis: l.grade_axis ?? null, grade_source: l.grade_source ?? null, ground: l.ground ?? null }));
  }
  w.insert("resolutions", { bundle_id: "DA", capture_sha: "s", ref: "vendor:77", entity_id: "ENT-1", grade: "A" });
  w.insert("resolutions", { bundle_id: "DA", capture_sha: "s", ref: "office:x", entity_id: "ENT-2", grade: "C" });
  return w;
}
const withLeg = (pred) => sorted(LEGGED.filter((f) => f.legs.some(pred)).map((f) => f.id));
const INQUIRIES = sorted(LEGGED.map((f) => f.id));

test("R14 R5 (meaningquery) any number of meaning and metadata arms runs under workerd's five-term compound ceiling, and answers right", () => {
  assert.equal(WORKERD_COMPOUND_SELECT, 5);
  const w = leggedWorld();
  /* The ceiling is live in the fixture: a flat compound of six terms is refused by the engine itself. */
  assert.throws(() => w.db.prepare(Array.from({ length: 6 }, (_, i) => `SELECT ${i}`).join(" UNION ")).all(),
    /too many terms in compound SELECT/);
  const ids = (q) => sorted(w.ids({ q, viewer: V }));
  /* One to eight meaning arms of one kind: every shape runs, and a conjunction of distinct targets is empty. */
  for (let k = 1; k <= 8; k++) {
    const q = Array.from({ length: k }, (_, i) => `leg:target=T-${i}`).join(" ");
    for (const [shape, s] of everyStatement(compile({ q, viewer: V, rows: "leg" }))) assert.doesNotThrow(() => w.all(s), `${k} arms: ${shape}`);
    assert.deepEqual(ids(q), []);
  }
  /* The old suite's eight-arm query, whole: it runs, and its answer is the one inquiry every arm holds of. */
  const eight = "leg:hunch leg:role=supports leg:axis=connection leg:grade=B resolves:A resolves:C concerns:ENT-1 has:leg";
  for (const [shape, s] of everyStatement(compile({ q: eight, viewer: V, rows: "leg" }))) assert.doesNotThrow(() => w.all(s), shape);
  assert.deepEqual(ids("leg:hunch leg:role=supports leg:axis=connection leg:grade=B"), ["H1"]);
  assert.deepEqual(ids(eight), [], "no one bundle both carries a leg and holds the resolutions");
  assert.deepEqual(ids("resolves:A resolves:C concerns:ENT-1 concerns:ENT-2 -leg:* type:information state:collected"), ["DA"]);
  /* Mixed meaning and metadata arms, the case a filter sidebar reaches. */
  const mixed = "leg:hunch resolves:C concerns:ENT-1 state:open type:inquiry criticality:high";
  for (const [shape, s] of everyStatement(compile({ q: mixed, viewer: V }))) assert.doesNotThrow(() => w.all(s), shape);
  assert.deepEqual(ids("leg:hunch state:open type:inquiry"), withLeg((l) => l.grade_source === "hunch"));
  assert.deepEqual(ids("leg:hunch state:closed"), []);
});

test("R1 R5 R14 (meaningquery) has:leg, quoted and case-folded meaning values, one row per bundle, and OR and NOT between arms", () => {
  const w = leggedWorld();
  const ids = (q) => sorted(w.ids({ q, viewer: V }));
  const hunch = withLeg((l) => l.grade_source === "hunch");
  const testimony = withLeg((l) => l.grade_source === "testimony");
  const cuts = withLeg((l) => l.role === "cuts_against");
  /* R1: `has:leg` is every inquiry that rests on anything; the legless one is absent. */
  assert.deepEqual(ids("has:leg"), withLeg(() => true));
  assert.ok(!ids("has:leg").includes("L0"));
  assert.deepEqual(ids("legs:>2"), [], "`legs:` the projected count is a field, not the arm");
  /* R1/R5: a quoted value is the value; the arm's words and its name are case-folded; a qualified spelling is the
     bare one. Each pair compiles to the same statement and the same arm, and answers the same rows. */
  const same = [["leg:hunch", 'leg:"hunch"'], ["leg:hunch", "leg:HUNCH"], ["leg:hunch", "LEG:hunch"],
    ["leg:hunch", "leg:source=hunch"], ["resolves:C", "resolves:c"], ["resolves:C", "resolves:grade=C"],
    ["concerns:ENT-1", "concerns:entity=ENT-1"], ["concerns:ENT-1", 'concerns:"ENT-1"']];
  for (const [a, b] of same) {
    const x = compile({ q: a, viewer: V }), y = compile({ q: b, viewer: V });
    assert.deepEqual([y.statements.page(), y.meaningArms], [x.statements.page(), x.meaningArms], `${a} = ${b}`);
    assert.deepEqual(ids(b), ids(a), `${a} = ${b}`);
  }
  assert.deepEqual(ids('leg:"hunch"'), hunch);
  assert.ok(compile({ q: 'state:"open" leg:"hunch"', viewer: V }).statements.page().args
    .every((v) => typeof v !== "string" || !v.includes('"')), "no argument keeps a quote");
  /* R5/R14: a bundle with several matching meaning rows appears once, on every bundle-grain shape. */
  w.insert("inquiry_basis", { bundle_id: "H1", ord: 7, target_id: "DB", role: "supports", grade_source: "hunch" });
  const page = w.run({ q: "leg:hunch", viewer: V }).rows.map((r) => r.bundle_id);
  assert.deepEqual(sorted(page), hunch);
  assert.deepEqual(sorted(w.run({ q: "leg:hunch", viewer: V }, "ids").rows.map((r) => r.bundle_id)), hunch);
  assert.deepEqual(w.run({ q: "leg:hunch", viewer: V }, "count").rows, [{ n: hunch.length }]);
  /* OR and negation between two meaning arms, and the partition the negation makes. */
  assert.deepEqual(ids("leg:hunch OR leg:source=testimony"), sorted(uniq([...hunch, ...testimony])));
  assert.deepEqual(ids("(leg:hunch OR leg:source=testimony) -leg:cuts_against"),
    sorted(uniq([...hunch, ...testimony]).filter((id) => !cuts.includes(id))));
  const rest = ids("type:inquiry -leg:hunch");
  assert.deepEqual(rest, INQUIRIES.filter((id) => !hunch.includes(id)));
  assert.deepEqual(sorted([...ids("leg:hunch"), ...rest]), INQUIRIES, "hunch debt plus the rest is every inquiry, once");
  assert.deepEqual(ids("leg:ground=*"), withLeg((l) => !!l.ground));
  assert.deepEqual(ids("leg:grade=D"), withLeg((l) => l.grade === "D"));
  /* An arm composes with free text without collapsing into the MATCH. */
  assert.deepEqual(ids("leg:hunch rest"), hunch);
  assert.deepEqual(ids("resolves:grade=Z"), [], "a grade nothing resolved at finds nothing");
});

/* ---- search ---- */

test("R1 R14 (search) a quoted field value: a column phrase scoped to its column, word order kept, typed values matching, a negated quoted selector excluding", () => {
  const w = world();
  w.bundle("A", { title: "Sewer Service Fund transfer series", body: "transferred money to the general fund",
    current_state: "collected", annotations_open: 3, monitor_enabled: 1, schema_id: "information@2",
    locator: "https://records.example/opengov", fm: { monitoring: { frequency: "monthly" } } });
  w.bundle("B", { title: "Water billing anomaly", body: "anomalies appear in the auditor report",
    current_state: "reviewed", annotations_open: 0, schema_id: "information@2", fm: { monitoring: { frequency: "monthly" } } });
  w.bundle("C", { type: normalizeType("problem"), title: "Fund oversight is absent", body: "no committee reviews it",
    current_state: "surfaced", annotations_open: 1, schema_id: "problem@1", locator: "https://records.example/opengov",
    fm: { monitoring: { frequency: "monthly" } } });
  const ids = (q) => sorted(w.ids({ q, viewer: V }));
  /* The phrase is in no title: the honest answer is none, though the unquoted words (AND across columns) find A. */
  assert.deepEqual(ids('title:"Fund general"'), []);
  assert.deepEqual(ids("title:Fund general"), ["A"]);
  assert.deepEqual(ids('title:"Water billing"'), ["B"]);
  assert.deepEqual(ids('title:"billing Water"'), [], "word order inside a phrase matters");
  assert.deepEqual(ids("title:billing Water"), ["B"], "the unquoted spelling ignores order");
  assert.deepEqual(ids('locator:"opengov"'), ids("locator:opengov"));
  assert.deepEqual(ids('locator:"opengov"'), ["A", "C"]);
  /* Enumerations, booleans, numbers, the per-schema tail and punctuated values, quoted. */
  assert.deepEqual(ids('state:"collected"'), ["A"]);
  assert.deepEqual(ids('state:"collected"'), ids("state:collected"));
  assert.deepEqual(ids('type:"problem"'), ["C"]);
  assert.deepEqual(ids('monitored:"true"'), ["A"]);
  assert.deepEqual(ids('annotations:">0"'), ["A", "C"]);
  assert.deepEqual(ids('fm:monitoring.frequency="monthly"'), ["A", "B", "C"]);
  assert.deepEqual(ids('schema:"problem@1"'), ["C"]);
  /* Composition: with an unquoted value, under negation, with OR. */
  assert.deepEqual(ids('type:"information" state:collected'), ["A"]);
  assert.deepEqual(ids('-state:"collected"'), ["B", "C"], "a negated quoted selector excludes, never returns the corpus");
  assert.deepEqual(ids('(state:"collected" OR state:"surfaced")'), ["A", "C"]);
  assert.deepEqual(compile({ q: 'state:"collected"', viewer: V }).warnings, []);
  /* R14: seven metadata filters, and a seven-arm OR, run under the ceiling and answer. */
  assert.deepEqual(ids("type:information state:collected schema:information@2 monitored:true annotations:>0 "
    + "fm:monitoring.frequency=monthly locator:opengov"), ["A"]);
  assert.deepEqual(ids("state:collected OR state:reviewed OR state:surfaced OR state:retired OR state:a OR state:b OR state:c"),
    ["A", "B", "C"]);
});

/* ---- content-arm ---- */

function contentWorld() {
  const w = world();
  w.member("mina");
  for (const id of ["OCR", "LAYER", "BARE", "NONE", "VER", "IMG", "INQ"]) w.bundle(id, { type: id === "INQ" ? "inquiry" : "information" });
  const row = (content_id, bundle_id, o) => w.insert("content", { content_id, capture_sha: `s-${bundle_id}`, bundle_id,
    extent_kind: "document", extent: `{"c":"${content_id}"}`, ref: content_id, chain: '[{"step":"layer"}]',
    derivation_cap: null, minted_by: CONTENT_MINTED_BY_PLANE, stale: 0, cited_as: "text", chain_kind: "layer", at: "t", ...o });
  row("ocr-doc", "OCR", { chain: '[{"step":"ocr"}]', chain_kind: "ocr", derivation_cap: "C", stale: 1 });
  row("ocr-page", "OCR", { extent_kind: "pdf-page", chain: '[{"step":"ocr"}]', chain_kind: "ocr", derivation_cap: "C", stale: 1 });
  row("layer-doc", "LAYER", {});
  row("layer-machine", "LAYER", { extent_kind: "pdf-page", minted_by: `${MACHINE_CLASS_PREFIX}ai:extractor` });
  row("bare-member", "BARE", { chain: null, chain_kind: null, minted_by: "mina" });
  row("ver-doc", "VER", {});
  row("img", "IMG", { extent_kind: "image", chain: null, chain_kind: null, cited_as: "bytes" });
  /* Live legs cite three rows; a basis version's leg cites one no live leg names. */
  const cites = { "ocr-doc": 0, "ocr-page": 1, "layer-doc": 2 };
  for (const [content_id, ord] of Object.entries(cites))
    w.insert("inquiry_basis", { bundle_id: "INQ", ord, target_id: content_id.split("-")[0].toUpperCase(), role: "supports", content_id });
  w.insert("inquiry_basis", { bundle_id: "INQ", ord: 3, target_id: "BARE", role: "supports", content_id: null });
  w.insert("inquiry_basis_version_legs", { bundle_id: "INQ", version: 1, ord: 0, content_id: "ver-doc" });
  return { w, cited: new Set([...Object.keys(cites), "ver-doc"]) };
}

test("R6 R18 (content-arm) rows=content's `cited` and `chain_last` state what the row cannot, one definition with the filters", () => {
  const { w, cited } = contentWorld();
  const all = w.run({ q: "has:content", viewer: V, rows: "content" }, "meaning").rows;
  assert.equal(all.length, 7);
  /* R18: a row carries exactly the arm's published columns, and the chain blob is not among them. */
  for (const r of all)
    assert.deepEqual(Object.keys(r).filter((k) => k !== "bundle_id" && k !== "bundle_type").sort(),
      [...meaningVocabulary().content.rows.columns].sort());
  assert.ok(!("chain" in all[0]));
  /* `cited`: a live leg or a version leg names the row; both sides are present, and the version-only row is cited. */
  assert.deepEqual(all.filter((r) => !!r.cited !== cited.has(r.content_id)).map((r) => r.content_id), []);
  assert.ok(all.some((r) => r.cited) && all.some((r) => !r.cited));
  assert.equal(all.find((r) => r.content_id === "ver-doc").cited, 1, "cited only by a recorded version");
  /* ...and the column and the filter are one definition: the documents holding a cited row are `content:cited`'s. */
  const docsWith = (pred) => sorted(uniq(all.filter(pred).map((r) => r.bundle_id)));
  assert.deepEqual(sorted(w.ids({ q: "content:cited", viewer: V })), docsWith((r) => r.cited));
  assert.deepEqual(sorted(w.ids({ q: "content:uncited", viewer: V })), docsWith((r) => !r.cited));
  /* `chain_last`: the chain's last step off the column; a bytes row says does-not-apply; no chain is null. And the cap
     of a bytes row reads the same word, where a text row's cap is its column. */
  const by = Object.fromEntries(all.map((r) => [r.content_id, r]));
  assert.deepEqual(["ocr-doc", "layer-doc", "bare-member", "img"].map((id) => by[id].chain_last),
    ["ocr", "layer", null, CHAIN_DOES_NOT_APPLY]);
  assert.deepEqual(["ocr-doc", "layer-doc", "img"].map((id) => by[id].derivation_cap), ["C", null, CAP_DOES_NOT_APPLY]);
  for (const kind of ["layer", "ocr"])
    assert.deepEqual(w.run({ q: `content:${kind}`, viewer: V, rows: "content" }, "meaning").rows
      .filter((r) => docsWith((x) => x.chain_last === kind).includes(r.bundle_id) && r.chain_last !== kind)
      .map((r) => r.content_id), [], `content:${kind}: the rows of the documents it selects say ${kind} where they are`);
  assert.deepEqual(sorted(w.ids({ q: "content:chain=does-not-apply", viewer: V })), docsWith((r) => r.chain_last === CHAIN_DOES_NOT_APPLY));
  assert.deepEqual(sorted(w.ids({ q: "content:chain=undetermined", viewer: V })), docsWith((r) => r.chain_last === null));
});

test("R15 (content-arm) rows=content returns each selected document's whole content set, and rows=leg one row per leg with its content", () => {
  const { w } = contentWorld();
  /* A machine marked one passage of LAYER: the rows are every content row of LAYER, each carrying `minted_by`. */
  const m = w.run({ q: "content:machine", viewer: V, rows: "content" }, "meaning").rows;
  assert.deepEqual(sorted(m.map((r) => r.content_id)), ["layer-doc", "layer-machine"]);
  assert.ok(m.every((r) => "minted_by" in r));
  assert.deepEqual(w.run({ q: "content:machine", viewer: V, rows: "content" }, "meaning", { mode: "count" }).rows, [{ n: 2 }]);
  /* rows=leg: the content row's extent kind and ref ride on the leg, a leg with none reads null, and the join on the
     content row's key never multiplies a leg: the rows and the count are the legs. */
  const legs = w.run({ q: "has:leg", viewer: V, rows: "leg" }, "meaning").rows;
  assert.deepEqual(legs.map((r) => [r.ord, r.content_id, r.extent_kind, r.ref]),
    [[0, "ocr-doc", "document", "ocr-doc"], [1, "ocr-page", "pdf-page", "ocr-page"], [2, "layer-doc", "document", "layer-doc"],
     [3, null, null, null]]);
  assert.deepEqual(w.run({ q: "has:leg", viewer: V, rows: "leg" }, "meaning", { mode: "count" }).rows, [{ n: 4 }]);
});

/* ---- meaningread ---- */

test("R15 R12 (meaningread) the meaning grain: inert unless named, case-folded, composed with the bundle grain, the whole basis, paged exactly once", () => {
  const w = leggedWorld();
  /* Inert without a grain, and for a grain the registry does not hold. */
  assert.deepEqual([compile({ q: "leg:hunch", viewer: V }).statements.meaning(), compile({ q: "leg:hunch", viewer: V }).meaning], [null, null]);
  assert.equal(compile({ q: "", viewer: V, rows: "legs" }).statements.meaning(), null);
  /* `rows` is case-folded. */
  assert.deepEqual(compile({ q: "leg:hunch", viewer: V, rows: "LEG" }).statements.meaning(),
    compile({ q: "leg:hunch", viewer: V, rows: "leg" }).statements.meaning());
  /* One selection, two grains: the bundles answered at grain are exactly the selected bundles that carry a leg, an
     inquiry the bundle grain names once is named once per leg, and the basis comes whole. */
  const legsOf = Object.fromEntries(LEGGED.map((f) => [f.id, f.legs.length]));
  for (const q of ["leg:hunch", "has:leg", "leg:ground=*", "type:inquiry -leg:hunch", "(has:leg OR leg:hunch) type:inquiry"]) {
    const selected = sorted(w.ids({ q, viewer: V }));
    const rows = w.run({ q, viewer: V, rows: "leg" }, "meaning").rows;
    assert.deepEqual(sorted(uniq(rows.map((r) => r.bundle_id))), selected.filter((id) => (legsOf[id] ?? 0) > 0), q);
    for (const id of uniq(rows.map((r) => r.bundle_id))) assert.equal(rows.filter((r) => r.bundle_id === id).length, legsOf[id], `${q}: ${id}`);
  }
  assert.deepEqual(w.run({ q: "(has:leg OR leg:hunch) type:inquiry", viewer: V, rows: "leg" }, "meaning").rows,
    w.run({ q: "has:leg", viewer: V, rows: "leg" }, "meaning").rows, "an equally correct phrasing answers the same rows");
  /* `resolves` and `concerns` are two names over one table: at grain they answer the same rows. */
  assert.deepEqual(w.run({ q: "has:resolves", viewer: V, rows: "concerns" }, "meaning").rows,
    w.run({ q: "has:resolves", viewer: V, rows: "resolves" }, "meaning").rows);
  /* Paging by the grain's identity covers the set exactly once; the count is not paged. */
  const all = LEGGED.reduce((n, f) => n + f.legs.length, 0);
  const seen = [];
  for (let off = 0; off < all + 2; off += 2)
    seen.push(...w.run({ q: "has:leg", viewer: V, rows: "leg", rowLimit: 2, rowOffset: off }, "meaning").rows.map((r) => `${r.bundle_id}#${r.ord}`));
  assert.deepEqual([seen.length, new Set(seen).size], [all, all]);
  assert.deepEqual(w.run({ q: "has:leg", viewer: V, rows: "leg", rowLimit: 2 }, "meaning", { mode: "count" }).rows, [{ n: all }]);
  /* A parser warning reaches the plan the grain is answered from. */
  assert.ok(compile({ q: "leg:sorce=hunch", viewer: V, rows: "leg" }).warnings.some((x) => /leg: unknown sub-field "sorce"/.test(x)));
});

test("R15 R16 R8 (meaningread) a meaning row whose bundle the viewer may not see is withheld whole, and every count moves with the rows", () => {
  const w = world();
  w.member("carol"); w.member("dave");
  w.bundle("DOC", { type: "information" });
  w.bundle("PRJ", { type: "project" });
  w.participate("PRJ", "carol");
  for (const b of ["DOC", "PRJ"])
    w.insert("resolutions", { bundle_id: b, capture_sha: `s-${b}`, ref: "vendor:77", entity_id: "ENT-1", grade: "A" });
  const run = (viewer, mode) => w.run({ q: "has:resolves", viewer, rows: "concerns" }, "meaning", mode ? { mode } : undefined).rows;
  assert.deepEqual(uniq(run("member:carol").map((r) => r.bundle_id)), ["DOC", "PRJ"], "the participant sees the project's row");
  assert.deepEqual(uniq(run("member:dave").map((r) => r.bundle_id)), ["DOC"], "the uninvited member's answer does not hold it");
  assert.ok(run("member:dave").every((r) => typeof r.bundle_id === "string" && r.entity_id === "ENT-1" && r.grade === "A"),
    "withheld, not redacted: every row received is whole");
  assert.deepEqual([run("member:dave", "count"), run("member:carol", "count")], [[{ n: 1 }], [{ n: 2 }]]);
  assert.deepEqual([run("member:dave", "levels"), run("member:carol", "levels")],
    [[{ documents: 1, documents_with_rows: 1 }], [{ documents: 2, documents_with_rows: 2 }]]);
  for (const mode of [undefined, "count", "levels", "axis"]) assert.deepEqual(run("nobody", mode).filter((r) => r.n || r.documents || r.bundle_id || r.capture_sha), [], String(mode));
  /* D54 (membership R43): PRJ is hidden (the index holds no setting for it), so an administrator neither invited nor
     joined, the founder included in both spellings, is withheld its row and its count exactly as dave is. */
  w.member("erin", "admin"); w.member("fay", "admin");
  w.participate("PRJ", "fay", "invited");
  const withheld = ["admin", "member:admin", "member:erin"];
  for (const v of withheld) {
    assert.deepEqual(uniq(run(v).map((r) => r.bundle_id)), ["DOC"], `${v}: a hidden project's row is withheld`);
    assert.deepEqual([run(v, "count"), run(v, "levels")], [[{ n: 1 }], [{ documents: 1, documents_with_rows: 1 }]], v);
  }
  /* Controls: an administrator invited to it sees it whole; set discoverable, every administrator does, a member not. */
  assert.deepEqual(uniq(run("member:fay").map((r) => r.bundle_id)), ["DOC", "PRJ"], "an invited administrator");
  w.sight("PRJ", "hidden");
  assert.deepEqual(uniq(run("member:erin").map((r) => r.bundle_id)), ["DOC"], "hidden, as the index says");
  w.sight("PRJ", "discoverable");
  for (const v of withheld) {
    assert.deepEqual(uniq(run(v).map((r) => r.bundle_id)), ["DOC", "PRJ"], `${v}: a discoverable project at FULL`);
    assert.deepEqual([run(v, "count"), run(v, "levels")], [[{ n: 2 }], [{ documents: 2, documents_with_rows: 2 }]], v);
  }
  assert.deepEqual(uniq(run("member:dave").map((r) => r.bundle_id)), ["DOC"], "a member who is no administrator: unchanged");
});

/* ---- passage-arm ---- */

function passageWorld() {
  const w = world();
  w.bundle("PACKET", { title: "Info packet", body: "our notes on the packet" });
  w.bundle("BIG", { title: "Info oversize" });
  w.bundle("READ", { title: "scopeprobe read" });
  w.bundle("UNREAD", { title: "scopeprobe unread" });
  const unit = (bundle, sha, seq, text, truncated = 0) => w.insert("capture_text", { capture_sha: sha, bundle_id: bundle,
    extent_kind: "pdf-page", extent: `{"page":${seq}}`, ref: `page ${seq + 1}`, seq, text, truncated, chain_kind: "layer" });
  unit("PACKET", "s-packet", 0, "the layer read this page as quorum absent and hydrostatic pressure rising");
  unit("PACKET", "s-packet", 1, "and this page as appropriation of the reserve fund");
  unit("PACKET", "s-packet", 2, "a third page that mentions neither term at all");
  unit("BIG", "s-big", 0, "hydrostatic and a great deal more", 1);
  unit("BIG", "s-big", 1, "hydrostatic a short page", 0);
  unit("READ", "s-read", 0, "a page about culverts and drainage easements");
  for (const [b, s] of [["PACKET", "s-packet"], ["BIG", "s-big"], ["READ", "s-read"], ["UNREAD", "s-unread"]])
    w.insert("register", { capture_sha: s, bundle_id: b, registered: "t" });
  w.insert("content", { content_id: "cur", capture_sha: "s-big", bundle_id: "BIG", extent_kind: "pdf-page",
    extent: '{"page":1}', stale: 0, at: "2" });
  return w;
}

test("R6 R1 (passage-arm) passage: searches what the captures say and text: the group's notes; phrases, prefixes, presence and composition hold", () => {
  const w = passageWorld();
  const ids = (q) => sorted(w.ids({ q, viewer: V }));
  assert.deepEqual(ids("passage:hydrostatic"), ["BIG", "PACKET"]);
  assert.deepEqual(ids("text:hydrostatic"), [], "the term is in no note, title or frontmatter");
  assert.deepEqual(ids("text:notes"), ["PACKET"], "the converse: text: does find the notes");
  assert.deepEqual(ids("passage:*"), ["BIG", "PACKET", "READ"], "which documents are searchable at passage grain");
  assert.deepEqual(ids("passage:zzzznotaword"), []);
  assert.deepEqual(ids('passage:"quorum absent"'), ["PACKET"]);
  assert.deepEqual(ids('passage:"absent quorum"'), []);
  assert.deepEqual(ids("passage:hydrostat*"), ["BIG", "PACKET"]);
  assert.deepEqual(ids("passage:hydrostatic text:packet"), ["PACKET"], "two arms, two indexes, one answer");
  assert.deepEqual(ids("passage:hydrostatic -passage:quorum"), ["BIG"]);
});

test("R15 (passage-arm) rows=passage: only the units that matched, each an address with its snippet, ref, seq, chain and truncation", () => {
  const w = passageWorld();
  const hit = w.run({ q: "passage:hydrostatic", viewer: V, rows: "passage" }, "meaning");
  assert.equal(hit.plan.meaning.matched, true);
  assert.deepEqual(hit.rows.map((r) => [r.bundle_id, JSON.parse(r.extent).page, r.ref, r.seq, r.chain_kind, r.truncated, r.content_id]),
    [["BIG", 0, "page 1", 0, "layer", 1, null], ["BIG", 1, "page 2", 1, "layer", 0, "cur"], ["PACKET", 0, "page 1", 0, "layer", 0, null]],
    "one of the packet's three pages; both truncation values carried; a content id only where a current row exists");
  assert.ok(hit.rows.every((r) => r.snippet.includes("[hydrostatic]")), "the snippet centres on the term");
  assert.deepEqual(w.run({ q: "passage:hydrostatic", viewer: V, rows: "passage" }, "meaning", { mode: "count" }).rows, [{ n: 3 }]);
  const bare = w.run({ q: "id:PACKET", viewer: V, rows: "passage" }, "meaning");
  assert.equal(bare.plan.meaning.matched, false);
  assert.deepEqual(bare.rows.map((r) => [r.ref, r.snippet]), [["page 1", null], ["page 2", null], ["page 3", null]]);
});

test("R16 R8 (passage-arm) a miss is counted over the documents the other arms put in scope, the true zero survives, and a denied viewer sees nothing", () => {
  const w = passageWorld();
  const levels = (q, viewer = V) => w.run({ q, viewer, rows: "passage" }, "meaning", { mode: "levels" }).rows[0];
  const axis = (q, viewer = V) => w.run({ q, viewer, rows: "passage" }, "meaning", { mode: "axis" }).rows;
  const scope = sorted(w.ids({ q: "title:scopeprobe", viewer: V }));
  assert.deepEqual(scope, ["READ", "UNREAD"]);
  const miss = "passage:zzzznotaword title:scopeprobe";
  assert.deepEqual(w.run({ q: miss, viewer: V, rows: "passage" }, "meaning").rows, []);
  assert.deepEqual(levels(miss), { documents: scope.length, documents_with_rows: 1 });
  assert.deepEqual(axis(miss).map((r) => r.capture_sha), ["s-read", "s-unread"], "the axis counts the same scope's captures");
  assert.deepEqual(levels("passage:zzzznotaword title:nosuchword"), { documents: 0, documents_with_rows: null }, "the true zero survives");
  const hit = levels("passage:hydrostatic");
  assert.ok(hit.documents_with_rows < hit.documents, "documents_with_rows is a measurement, not the scope again");
  for (const q of ["passage:hydrostatic", miss]) {
    assert.deepEqual(w.run({ q, viewer: "nobody", rows: "passage" }, "meaning").rows, [], q);
    assert.deepEqual(axis(q, "nobody"), [], q);
    assert.deepEqual(levels(q, "nobody"), { documents: 0, documents_with_rows: null }, q);
  }
});
