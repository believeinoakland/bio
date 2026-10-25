/* public-read — the sampling tests deepened (T46-22; N906, K2832, K2949): each of R13, R15, R19, R22, R27, R29 and R30
   tested over every case its text names, never a sample (P7). Each arm reads through this module's interface: the store's
   ops (`publicReadOps`), the Worker's public routes (`publishedRoutes`), the door (`publicReadDoorOp`) and the case file a
   stranger downloads (`assembleCaseContainer`, read back part by part). Every claim has its negative control. The older
   arms (`published.test`, `project-reference.test`, `standing.test`, `timeline.test`, `dates.test`, `credit.test`) stand;
   these cover the cases they left out (the T45 job's record, K2832). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, publishedSix, stubOf, bucket, caseDoc, V, NOW } from "./fixture.mjs";
import { PublicRead, DECLARED_STAKE_SETTING } from "../../../src/public-read/index.mjs";
import { bindPublishedPlane, publishedRoutes, assembleCaseContainer } from "../../../src/publication/worker.mjs";
import { publicReadDoorOp } from "../../../src/public-read/door.mjs";
import { CIVICSMITH_DESCRIPTION, CIVICSMITH_WHO } from "../../../src/public-read/credit.mjs";
import { workingOnLines, standingOf, timelineLines, CITATIONS_UNDETERMINED_SENTENCE } from "../../../src/case-grammar/index.mjs";
import { readContainer, readPart } from "../../../src/ooxml.mjs";

const json = (o, status = 200) => new Response(JSON.stringify(o), { status, headers: { "content-type": "application/json" } });
const HELPERS = {
  json, STORE_SILENT_REASON: "STORE_DID_NOT_ANSWER", STORE_SILENT_DETAIL: "silent", PUBLISHED_STORE: "bio",
  doAnswer: async (res) => {
    let out = null;
    try { out = await (await res).json(); } catch { out = null; }
    if (out && out.ok === true) return { answered: true, result: out.result };
    return out && out.ok === false && out.status && out.status < 500
      ? { answered: false, refused: true, reply: { body: out, status: out.status } } : { answered: false };
  },
  storeSilent: (op) => json({ ok: false, reason: "STORE_DID_NOT_ANSWER", op }, 502),
  storeRefusal: (out) => json(out.reply.body, out.reply.status),
  // fixtures-contract: answer-envelope door-helpers
  requiredArgument: (op, argument, shape, error) => ({ ok: false, reason: "REQUIRED_ARGUMENT_MISSING", op, argument, shape, error }),
};
bindPublishedPlane(HELPERS);

const CASE = "CASE-2026-0001", F = "INQ-2026-0001", G = "INQ-2026-0002";
const FORMATS = [1, 2, 3, 4, 5, 6, 7].map((n) => `bio-case-document/${n}`);
const SIX_UP = (f) => f.endsWith("/6") || f.endsWith("/7");
const METHOD = { grading: "bio-grading/1", checks: "1.57.0" };
const NOTICE = "NOTICE-2026-0003";

/* The fixture's document at `format` with `lines` before its closing fence (`opts` reach `caseDoc`). */
function docWith(edition, opts, format, lines = []) {
  const text = caseDoc(CASE, edition, { ...(SIX_UP(format) ? { method: METHOD, materials: [], attestations: [] } : {}),
                                        ...opts, format });
  const all = text.split("\n");
  const close = all.indexOf("---", 1);
  return [...all.slice(0, close), ...lines, ...all.slice(close)].join("\n");
}
/* CASE edition 1 over F (load-bearing) and G (supporting), signed and published, its document at `format`. */
function caseAt(format, { lines = [], citations = [], completeness, bar = null, strength } = {}) {
  const w = world();
  w.member("olive");
  const proj = w.project("Parks", "olive");
  w.inquiry(F);
  w.inquiry(G);
  const pins = { [F]: w.head(F), [G]: w.head(G) };
  const text = docWith(1, { project: proj, citations,
    roles: [{ target: F, version_sha: pins[F], role: "load_bearing" }, { target: G, version_sha: pins[G], role: "supporting" }],
    strength: strength ?? [{ target: F, axis: "capture", grade: "A" }, { target: F, axis: "connection", grade: "D" },
                           { target: G, axis: "capture", grade: "E" }, { target: G, axis: "connection", grade: "E" }] },
    format, lines);
  const stored = w.p.storeCaseDocument({ case: CASE, edition: 1, text, author: V("olive"), at: NOW });
  assert.equal(stored.ok, true, `${format}: ${JSON.stringify(stored)}`);
  const signed = w.signCase(CASE, 1, { project: proj, bar, ...(completeness !== undefined ? { completeness } : {}),
    roster: [{ bundle_id: F, version_sha: pins[F], role: "load_bearing" }, { bundle_id: G, version_sha: pins[G], role: "supporting" }] });
  assert.equal(signed.ok, true, `${format}: ${JSON.stringify(signed).slice(0, 300)}`);
  assert.equal(w.signFinding(F).ok, true);
  assert.equal(w.signFinding(G).ok, true);
  const env = { PUBLISHED: bucket() };
  for (const id of [F, G]) env.PUBLISHED.m.set(`bio/published/${w.head(id)}`, new TextEncoder().encode(w.text(id)));
  return { w, env, pins, proj, text };
}
const worker = async (w, env, op, q) => {
  const url = new URL(`https://plane/?op=${op}`);
  for (const [k, v] of Object.entries(q)) url.searchParams.set(k, String(v));
  return publishedRoutes({ op, url, env, stub: stubOf(w) });
};
const workerCase = async (w, env, q = { id: CASE }) => (await worker(w, env, "publishedcase", q)).json();
const memberOf = (c, id) => c.findings.find((f) => f.bundle_id === id);
const barLines = (bar) => ["required_strength:", `  declared: ${bar.declared}`, "  source: project", "  project: PROJ-1",
  `  capture: ${bar.capture ?? "null"}`, `  connection: ${bar.connection ?? "null"}`, '  detail: "the bar"'];

/* ------------------------------------------------------------------------------------------------ R13 */

test("R13 (T46) a citation's version in a document older than /4 is stated undetermined and never filled, at every format: /1–/3 answer no rows with the sentence though the document carries case_citations; /4–/7 answer the rows as signed; by the store and through the Worker", async () => {
  const CITES = [{ target: F, version: "a".repeat(64), capture: "b".repeat(64) }];
  for (const format of FORMATS) {
    const { w, env } = caseAt(format, { citations: CITES });
    const store = w.read("publishedcase", { id: CASE });
    const relayed = await workerCase(w, env);
    for (const [where, c] of [["store", store], ["worker", relayed]]) {
      assert.equal(c.ok, true, `${format} ${where}`);
      const cit = c.document.citations;
      if (["1", "2", "3"].includes(format.slice(-1))) {
        assert.deepEqual(cit, { state: "undetermined", rows: null, stated: CITATIONS_UNDETERMINED_SENTENCE },
                         `${format} ${where}: undetermined, stated, never filled from the rows the document carries`);
      } else {
        assert.equal(cit.state, "signed", `${format} ${where}`);
        assert.deepEqual(cit.rows.map((r) => [r.target, r.version]), [[F, "a".repeat(64)]], `${format} ${where}: as signed`);
      }
    }
  }
});

test("R13 (T46) an acknowledgement list is answered as recorded: null (a document silent about it) stays null, never [], [] stays [], a list stays the list; by publishedCase, publishedEditions and the Worker", async () => {
  const ACK = [{ by: V("olive"), at: NOW, text: "acknowledged" }];
  for (const [label, acks] of [["silent", null], ["none", []], ["a list", ACK]]) {
    const { w, env } = caseAt("bio-case-document/2", {
      completeness: { writer: V("olive"), publisher: V("olive"), acknowledgements: acks, at: NOW } });
    const c = w.read("publishedcase", { id: CASE });
    assert.equal(c.ok, true, label);
    /* R41 (3): `publishedCase` and the Worker name the member who read it by her handle (the fixture's `h_<id>`); the shape is
       as recorded, and `publishedEditions` likewise */
    const named = acks && acks.map((a) => ({ ...a, by: "h_olive" }));
    assert.deepEqual(c.completeness.acknowledgements, named, `${label}: publishedCase`);
    assert.deepEqual(w.read("publishededitions", { id: F }).editions[0].completeness.acknowledgements, named, `${label}: publishedEditions`);
    assert.deepEqual((await workerCase(w, env)).completeness.acknowledgements, named, `${label}: the Worker`);
  }
});

test("R13 (T46) a deliverer not recorded is undetermined on every surface that serves it, store and Worker, never copied from the signer; a recorded one answers as recorded (control)", async () => {
  for (const recorded of [false, true]) {
    const { w, env } = caseAt("bio-case-document/6");
    if (!recorded) w.st.sql.exec(`UPDATE published_bundles SET delivered_by=NULL`);
    const rows = [w.read("publishedlist", {}).bundles.find((b) => b.bundle_id === F),
                  w.read("publishededitions", { id: F }).editions[0],
                  memberOf(w.read("publishedcase", { id: CASE }), F),
                  memberOf(await workerCase(w, env), F)];
    for (const r of rows) {
      if (recorded) assert.notEqual(r.delivered_by.kind, "undetermined", "control: a recorded deliverer");
      else assert.deepEqual([r.delivered_by.kind, r.delivered_by.member], ["undetermined", null]);
    }
  }
});

/* ------------------------------------------------------------------------------------------------ R19 */

test("R19 (T46) project_reference at every format: /5, /6 and /7 documents answer the notice working_on names; /1–/4 documents carrying the same line answer null; a document naming none or a malformed value answers null; store and Worker alike", async () => {
  for (const format of FORMATS) {
    const carries = !["1", "2", "3", "4"].includes(format.slice(-1));
    for (const [lines, want] of [[workingOnLines(NOTICE), carries ? NOTICE : null], [[], null], [["working_on: \"not a notice\""], null]]) {
      const { w, env } = caseAt(format, { lines });
      const s = w.read("publishedcase", { id: CASE });
      assert.equal(s.ok, true, format);
      assert.ok(Object.hasOwn(s, "project_reference"), `${format}: the key is always answered`);
      assert.equal(s.project_reference, want, `${format} ${JSON.stringify(lines)}: store`);
      assert.equal((await workerCase(w, env)).project_reference, want, `${format}: Worker`);
    }
  }
});

test("R19 (T46) project_reference is read from the signed document only: a published row or a live notice changed after signing changes nothing", () => {
  const { w } = caseAt("bio-case-document/6", { lines: workingOnLines(NOTICE) });
  const before = w.read("publishedcase", { id: CASE }).project_reference;
  w.st.sql.exec(`UPDATE published_cases SET scope='rewritten', bar=NULL`);
  w.st.sql.exec(`UPDATE cases SET project_id='PROJ-OTHER'`);
  assert.equal(w.read("publishedcase", { id: CASE }).project_reference, before);
  /* negative control: the document is what is read; another edition naming another notice answers that one */
  const { w: w2 } = caseAt("bio-case-document/6", { lines: workingOnLines("NOTICE-2026-0009") });
  assert.equal(w2.read("publishedcase", { id: CASE }).project_reference, "NOTICE-2026-0009");
});

/* ------------------------------------------------------------------------------------------------ R22 */

test("R22 (T46) each member's standing at every format that states member blocks (/2–/7) is standingOf over its role, the document's bar and its frozen pair; /1 answers null; store and Worker alike; no case-level standing", async () => {
  const bar = { declared: true, capture: "B", connection: "C" };
  for (const format of FORMATS) {
    const { w, env } = caseAt(format, { lines: barLines(bar) });
    for (const [where, c] of [["store", w.read("publishedcase", { id: CASE })], ["worker", await workerCase(w, env)]]) {
      assert.equal(c.ok, true, `${format} ${where}`);
      if (format.endsWith("/1")) {
        assert.deepEqual([memberOf(c, F).standing, memberOf(c, G).standing], [null, null], `${format} ${where}`);
        continue;
      }
      assert.deepEqual(memberOf(c, F).standing,
        standingOf({ role: "load_bearing", bar: { capture: "B", connection: "C" }, pair: { capture: "A", connection: "D" } }),
        `${format} ${where}: F`);
      assert.deepEqual(memberOf(c, G).standing,
        standingOf({ role: "supporting", bar: { capture: "B", connection: "C" }, pair: { capture: "E", connection: "E" } }),
        `${format} ${where}: G`);
      assert.equal(memberOf(c, F).standing.meets === true, false, "F falls short on connection");
      for (const k of ["standing", "strength"]) assert.equal(Object.hasOwn(c, k), false, `${format}: no case-level ${k}`);
    }
  }
});

test("R22 (T46) every bar and pair the text names: a bar with one axis declared, no bar declared, a member missing an axis of its pair, a member meeting the bar", () => {
  const cases = [
    ["one axis", { declared: true, capture: "B", connection: null }, { capture: "B", connection: null }, null],
    ["no bar", { declared: false, capture: null, connection: null }, null, null],
    ["meets", { declared: true, capture: "E", connection: "E" }, { capture: "E", connection: "E" }, null],
    ["missing axis", { declared: true, capture: "B", connection: "C" }, { capture: "B", connection: "C" },
     [{ target: F, axis: "capture", grade: "A" }, { target: G, axis: "capture", grade: "E" }, { target: G, axis: "connection", grade: "E" }]],
  ];
  for (const [label, docBar, readBar, strength] of cases) {
    const { w } = caseAt("bio-case-document/6", { lines: barLines(docBar), ...(strength ? { strength } : {}) });
    const c = w.read("publishedcase", { id: CASE });
    const fPair = strength ? { capture: "A" } : { capture: "A", connection: "D" };
    assert.deepEqual(memberOf(c, F).standing, standingOf({ role: "load_bearing", bar: readBar, pair: fPair }), `${label}: F`);
    assert.deepEqual(memberOf(c, G).standing, standingOf({ role: "supporting", bar: readBar, pair: { capture: "E", connection: "E" } }),
                     `${label}: G`);
  }
});

test("R22 (T46) standing is read from the signed document only: the published roster's role, the live bar and the member's published pair changed after signing change nothing; the answer moves only with another signed document (control)", () => {
  const bar = { declared: true, capture: "B", connection: "C" };
  const { w } = caseAt("bio-case-document/6", { lines: barLines(bar) });
  const before = w.read("publishedcase", { id: CASE }).findings.map((f) => f.standing);
  w.st.sql.exec(`UPDATE published_case_members SET role='supporting'`);
  w.st.sql.exec(`UPDATE published_cases SET bar=?`, JSON.stringify({ declared: true, capture: "E", connection: "E" }));
  w.st.sql.exec(`UPDATE published_bundles SET strength=?`, JSON.stringify({ capture: "E", connection: "E" }));
  assert.deepEqual(w.read("publishedcase", { id: CASE }).findings.map((f) => f.standing), before);
  /* control: a document with another bar answers another standing */
  const { w: w2 } = caseAt("bio-case-document/6", { lines: barLines({ declared: true, capture: "E", connection: "E" }) });
  assert.notDeepEqual(w2.read("publishedcase", { id: CASE }).findings.map((f) => f.standing), before);
});

/* ------------------------------------------------------------------------------------------------ R27 */

const TL = [
  { lane: "they_did", ord: 2, when: "nowhere", label: "A memo, undated", ref: "EVT-2026-0003", source: { capture: "c".repeat(64) } },
  { lane: "they_did", ord: 0, when: { date: "2026-03", precision: "month" }, label: "The council approved the contract",
    ref: "EVT-2026-0001", source: { capture: "a".repeat(64) } },
  { lane: "they_did", ord: 1, when: { undetermined: true, after: "2026-03-04", before: "2026-04-01" },
    label: "The first payment was made", ref: "EVT-2026-0002", source: { capture: "b".repeat(64) } },
  { lane: "we_did", ord: 3, when: "nowhere", label: "We noted a call, undated", ref: "CASE-2026-0001#4", source: { entry: "CASE-2026-0001#4" } },
  { lane: "we_did", ord: 1, when: { undetermined: true, after: "2026-05-01" }, label: "We asked again",
    ref: "CASE-2026-0001#3", source: { entry: "CASE-2026-0001#3" } },
  { lane: "we_did", ord: 0, when: { date: "2026", precision: "year" }, label: "We filed a records request",
    ref: "CASE-2026-0001#2", source: { entry: "CASE-2026-0001#2" } }];
const pick = (i) => [i.ord, i.when, i.label, i.ref, i.source];
const laneWant = (lane, nowhere) => TL.filter((i) => i.lane === lane && (i.when === "nowhere") === nowhere)
  .sort((a, b) => a.ord - b.ord).map(pick);

test("R27 (T46) every case the text names, in both lanes: a dated item at each precision, an undetermined order shown so with its bounds, an item placed nowhere listed apart, each with its source, each lane in its own order whatever order the rows were written in; store and Worker alike", async () => {
  const { w, env } = publishedSix({ extra: timelineLines(TL) });
  for (const [where, c] of [["store", w.read("publishedcase", { id: CASE })], ["worker", await workerCase(w, env)]]) {
    assert.equal(c.ok, true, where);
    for (const lane of ["they_did", "we_did"]) {
      assert.deepEqual(c.timeline[lane].map(pick), laneWant(lane, false), `${where} ${lane}: placed, in order, as held`);
      assert.deepEqual(c.timeline.placed_nowhere[lane].map(pick), laneWant(lane, true), `${where} ${lane}: placed nowhere, apart`);
    }
    const all = [...c.timeline.they_did, ...c.timeline.we_did, ...c.timeline.placed_nowhere.they_did, ...c.timeline.placed_nowhere.we_did];
    assert.equal(all.length, TL.length, `${where}: every item, once`);
    assert.ok(c.timeline.they_did.every((i) => i.ref.startsWith("EVT-")) && c.timeline.we_did.every((i) => i.ref.startsWith("CASE-")),
              `${where}: never interleaved`);
  }
});

test("R27 (T46) nothing is read from events or any live record: the reader asks publication only for the signed edition, and a timeline row or events table changed after signing changes nothing; a document without the block, and a record in no case, answer both lanes empty", () => {
  const { w } = publishedSix({ extra: timelineLines(TL) });
  const asked = [];
  const spy = new Proxy(w.p, { get(t, k) { const v = t[k]; return typeof v === "function"
    ? (...a) => { asked.push(String(k)); return v.apply(t, a); } : v; } });
  const pr = new PublicRead({ storage: w.st, publication: spy, docket: w.docket, record: w.record });
  const before = pr.publishedCase({ id: CASE }).timeline;
  assert.deepEqual(before, w.read("publishedcase", { id: CASE }).timeline);
  assert.equal(asked.some((m) => /event|timeline/i.test(m)), false, `asked only ${[...new Set(asked)]}`);
  for (const t of [...w.st.sql.exec(`SELECT name FROM sqlite_master WHERE type='table' AND name LIKE '%event%'`)])
    w.st.sql.exec(`DELETE FROM ${t.name}`);
  assert.deepEqual(pr.publishedCase({ id: CASE }).timeline, before);
  /* a document without the block, at every format; a record in no case */
  for (const format of FORMATS) {
    const { w: x } = caseAt(format);
    const t = x.read("publishedcase", { id: CASE }).timeline;
    assert.deepEqual([t.they_did, t.we_did, t.placed_nowhere], [[], [], { they_did: [], we_did: [] }], format);
  }
  const loose = world();
  loose.member("olive");
  loose.doc("INFO-2026-0009");
  loose.signFinding("INFO-2026-0009");
  const l = loose.read("publishedcase", { id: "INFO-2026-0009" });
  assert.equal(l.ok, true, JSON.stringify(l).slice(0, 200));
  assert.deepEqual([l.caseId, l.timeline.they_did, l.timeline.we_did], [null, [], []]);
});

/* ------------------------------------------------------------------------------------------------ R29 */

const SIGNED = "2031-02-03T04:05:06Z", PUBLISHED = "2032-07-08T09:10:11Z";
const hold = (w, ed, signed, pub) =>
  w.st.sql.exec(`UPDATE published_cases SET signed_at=?, published_at=? WHERE case_id=? AND edition=?`, signed, pub, CASE, ed);
/* Every file of every part of the case file a stranger downloads, as text. */
async function caseFileText(w, env, ed) {
  const out = await assembleCaseContainer({ env, stub: stubOf(w), storeName: "bio", cs: w.p.caseEditionState(CASE, ed, "parks-group"), via: "test" });
  assert.equal(typeof out.manifest_sha, "string", JSON.stringify(out).slice(0, 300));
  const mRes = await worker(w, env, "publishedbytes", { sha256: out.manifest_sha });
  const manifest = new TextDecoder().decode(new Uint8Array(await mRes.arrayBuffer()));
  const m = JSON.parse(manifest);
  const texts = [manifest];
  for (const p of (m.parts && m.parts.length && m.parts[0].index ? m.parts.map((x) => x.index) : [null])) {
    const zr = await worker(w, env, "publishedbytes", { sha256: out.manifest_sha, format: "zip", ...(p ? { part: p } : {}) });
    assert.equal(zr.status, 200);
    const zip = new Uint8Array(await zr.arrayBuffer());
    const zc = readContainer(zip);
    assert.equal(zc.ok, true);
    for (const e of zc.entries) texts.push(new TextDecoder().decode((await readPart(zip, zc, e.name)).bytes));
  }
  return { texts, out, manifest: m };
}

test("R29 (T46) signed_at and published_at are never written into the case file's bytes: no file of any part, nor the manifest, carries either instant, for a /6 case file and a container from before T28; the public answers carry both (control)", async () => {
  for (const kind of ["six", "five"]) {
    const { w, env } = kind === "six" ? publishedSix() : caseAt("bio-case-document/5");
    hold(w, 1, SIGNED, PUBLISHED);
    const { texts } = await caseFileText(w, env, 1);
    assert.ok(texts.length > 2, `${kind}: files were read`);
    for (const t of texts) for (const instant of [SIGNED, PUBLISHED, "2031-02-03", "2032-07-08"])
      assert.equal(t.includes(instant), false, `${kind}: a case file's bytes carry ${instant}`);
    /* control: the instants are answered by the public reads */
    assert.deepEqual(dates(w.read("publishedcase", { id: CASE })), [SIGNED, PUBLISHED]);
  }
});

const dates = (o) => [o.signed_at, o.published_at];

test("R29 (T46) every surface the text names answers each edition's own two instants exactly as publication holds them: publishedCase's edition and each edition_index entry, publishedList's case rows and publishedEditions, store and Worker; two editions with four distinct instants are never swapped or shared; a finding's own rows carry neither", async () => {
  const { w, env } = publishedSix({ edition: 2 });
  const D = { 1: ["2031-01-01T00:00:01Z", "2031-01-02T00:00:02Z"], 2: ["2031-03-03T00:00:03Z", "2031-04-04T00:00:04Z"] };
  for (const ed of [1, 2]) hold(w, ed, ...D[ed]);
  for (const ed of [1, 2]) {
    for (const c of [w.read("publishedcase", { id: CASE, edition: ed }), await workerCase(w, env, { id: CASE, edition: ed })]) {
      assert.deepEqual(dates(c), D[ed], `edition ${ed}`);
      assert.deepEqual(c.edition_index.map((e) => [e.edition, ...dates(e)]), [[1, ...D[1]], [2, ...D[2]]]);
    }
  }
  const list = w.read("publishedlist", {});
  assert.deepEqual(list.cases.map((c) => [c.edition, ...dates(c)]), [[1, ...D[1]], [2, ...D[2]]]);
  for (const b of list.bundles) assert.equal(Object.hasOwn(b, "signed_at") || Object.hasOwn(b, "published_at"), false, "a finding's row");
  /* publishedEditions: a finding the newest edition pins answers that edition's instants (both editions pin it, so the sole
     case edition is named per row) */
  let named = 0;
  for (const r of w.read("publishededitions", { id: F }).editions)
    if (r.case_edition != null) { assert.deepEqual(dates(r), D[r.case_edition]); named++; }
  assert.ok(named > 0, "a row names its case edition, so its instants are checked");
  /* control: swapping the row's instants swaps the answer */
  hold(w, 1, D[1][1], D[1][0]);
  assert.deepEqual(dates(w.read("publishedcase", { id: CASE, edition: 1 })), [D[1][1], D[1][0]]);
});

/* ------------------------------------------------------------------------------------------------ R30 */

const creditOf = async (w, q = {}) => {
  const url = new URL("https://plane/?op=credit");
  for (const [k, v] of Object.entries(q)) url.searchParams.set(k, v);
  const r = await publicReadDoorOp("credit", url, {}, stubOf(w), HELPERS);
  return { status: r.status, text: await r.text() };
};

test("R30 (T46) the credit page is the same bytes for every group's Civicsmith and every caller: groups with different slugs, identities, declared stakes and published cases, and callers with and without a token, all get one answer", async () => {
  const worlds = [world({ group: "parks-group" }), world({ group: "harbour-watch" }), publishedSix().w];
  worlds[0].member("olive");
  worlds[0].record.setSetting(DECLARED_STAKE_SETTING, "We run a park.", "olive");
  worlds[0].pr.registerGroupIdentity({ identity: () => ({ group: "parks-group", display_name: "Friends of the Parks" }) });
  worlds[1].member("pat");
  worlds[1].pr.registerGroupIdentity({ identity: () => ({ group: "harbour-watch", display_name: "Harbour Watch" }) });
  const bodies = new Set();
  for (const w of worlds) for (const q of [{}, { token: "t" }, { viewer: "olive" }, { case: CASE }]) {
    const r = await creditOf(w, q);
    assert.equal(r.status, 200);
    bodies.add(r.text);
  }
  assert.equal(bodies.size, 1, "one answer, byte for byte");
  assert.deepEqual(JSON.parse([...bodies][0]), { ok: true, name: "Civicsmith", description: CIVICSMITH_DESCRIPTION, who: CIVICSMITH_WHO });
  /* control: the groups do differ where the group is answered */
  assert.notDeepEqual(worlds[0].pr.groupFields(), worlds[1].pr.groupFields());
});

/* Everything this module serves on the public path for one rich published case, as text: the store's ops, the Worker's
   routes (answers and refusals), the door's own ops, every file of the case file, and the module's exported sentences. */
async function publicText() {
  const { w, env } = publishedSix({ extra: [...timelineLines(TL), ...workingOnLines(NOTICE),
                                            ...barLines({ declared: true, capture: "B", connection: "C" })] });
  w.record.setSetting(DECLARED_STAKE_SETTING, "We maintain the park.", "olive");
  const out = [];
  for (const [op, q] of [["publishedcase", { id: CASE }], ["publishedmanifest", {}], ["publishedlist", {}],
                         ["publishededitions", { id: F }], ["publishededitions", {}], ["verify", { sha256: w.head(F) }],
                         ["verify", { sha256: "0".repeat(64) }], ["publishedcase", { id: "NOPE-2026-0001" }],
                         ["publicread", { name: "nothing" }]])
    out.push(JSON.stringify(w.read(op, q)));
  out.push(JSON.stringify(await w.read("docketpublic", { case: "NOPE-2026-0001" })));
  for (const q of [{ id: CASE }, {}, { id: "NOPE-2026-0001" }])
    out.push(await (await worker(w, env, "publishedcase", q)).text());
  for (const q of [{ sha256: w.head(F) }, { sha256: "bad" }, { sha256: "0".repeat(64) }, { sha256: w.head(F), format: "zip" }]) {
    const r = await worker(w, env, "publishedbytes", q);
    out.push(await r.text(), JSON.stringify([...r.headers]));
  }
  out.push(await (await worker(w, {}, "publishedbytes", { sha256: w.head(F) })).text());
  const emptyEnv = { PUBLISHED: bucket() };
  out.push(await (await worker(w, emptyEnv, "publishedbytes", { sha256: w.head(F) })).text());
  for (const [op, q] of [["credit", {}], ["verify", { sha256: "x" }], ["publishedmanifest", {}], ["publicread", { name: "Bad Name" }],
                         ["docketpublic", {}], ["docketfeed", { case: "NOPE-2026-0001" }]]) {
    const url = new URL(`https://plane/?op=${op}`);
    for (const [k, v] of Object.entries(q)) url.searchParams.set(k, v);
    out.push(await (await publicReadDoorOp(op, url, env, stubOf(w), HELPERS)).text());
  }
  out.push(...(await caseFileText(w, env, 1)).texts);
  for (const mod of ["index", "checks", "courtorders", "casefile", "credit", "reads", "door"]) {
    const m = await import(`../../../src/public-read/${mod}.mjs`);
    out.push(JSON.stringify(Object.values(m).filter((v) => typeof v === "string" || (v && typeof v === "object"))));
  }
  return out.join("\n");
}

test("R30 (T46) no other line describing Civicsmith is served on the public path: across every store answer, Worker answer and refusal, door answer and every file of the case file, DEC-146's description is served only by the credit page, and no narrower or wider wording appears", async () => {
  const text = await publicText();
  for (const s of ["civic groups", "and other organisations", "and other organizations", "Civicsmith is "])
    assert.equal(text.toLowerCase().includes(s.toLowerCase()), false, `serves "${s}"`);
  const description = text.split(CIVICSMITH_DESCRIPTION).length - 1;
  const who = text.split(CIVICSMITH_WHO).length - 1;
  /* the door's credit answer, and the module's own exported constants (credit.mjs), each once */
  assert.deepEqual([description, who], [2, 2], "the description and its second line only where the credit page holds them");
  /* control: the counter sees a description served elsewhere */
  assert.equal(`${text}\n${CIVICSMITH_DESCRIPTION}`.split(CIVICSMITH_DESCRIPTION).length - 1, 3);
});

/* ------------------------------------------------------------------------------------------------ R15 */

const STATES = ["Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", "Connecticut", "Delaware", "Florida",
  "Georgia", "Hawaii", "Idaho", "Illinois", "Indiana", "Iowa", "Kansas", "Kentucky", "Louisiana", "Maine", "Maryland",
  "Massachusetts", "Michigan", "Minnesota", "Mississippi", "Missouri", "Montana", "Nebraska", "Nevada", "New Hampshire",
  "New Jersey", "New Mexico", "New York", "North Carolina", "North Dakota", "Ohio", "Oklahoma", "Oregon", "Pennsylvania",
  "Rhode Island", "South Carolina", "South Dakota", "Tennessee", "Texas", "Utah", "Vermont", "Virginia", "Washington",
  "West Virginia", "Wisconsin", "Wyoming"];
const PLACES = [...STATES, "Oakland", "Alameda", "Berkeley", "San Francisco", "Sacramento", "Los Angeles", "San Diego",
  "San Jose", "Chicago", "Bay Area", "Brown Act", "CPRA", "Public Records Act", "United States", "U.S.", "USA", "Canada",
  "Ontario", "London"];
/* Place-shaped words, matched as a name is written (capitalised), so "a state of the record" is not one. */
const PLACE_SHAPED = ["City of", "County of", "State of", "City Council", "Board of Supervisors"];
/* A stylesheet names fonts, not places ("Georgia, serif" in case-grammar's complete edition), so it is not read. */
const prose = (text) => text.replace(/<style[^>]*>[\s\S]*?<\/style>/g, "");
const placeIn = (text) => [
  ...PLACES.filter((p) => new RegExp(`(^|[^A-Za-z])${p.replace(/[.]/g, "\\.")}($|[^A-Za-z])`, "i").test(prose(text))),
  ...PLACE_SHAPED.filter((p) => new RegExp(`(^|[^A-Za-z])${p}($|[^A-Za-z])`).test(prose(text)))];

test("R15 (T46) no place is named in anything this module serves or says: every store answer, Worker answer, refusal and header, door answer, every file of the case file, and every sentence and row the module exports, checked against every US state, the places its record has been used in, and the place-shaped words", async () => {
  const text = await publicText();
  assert.deepEqual(placeIn(text), []);
  /* control: the matcher finds a place, whole-word and in any case */
  assert.deepEqual(placeIn("served in oakland, and in the State of maine"), ["Maine", "Oakland", "State of"]);
  assert.deepEqual(placeIn("domain maintained, a state of the record, <style>b{font:Georgia}</style>"), []);
  assert.deepEqual(placeIn("<p>Georgia</p>"), ["Georgia"]);
});

test("R15 (T46) no place in behaviour: a group's settings naming its jurisdictions change none of the public reads, byte for byte; the setting is held (control)", () => {
  const { w } = publishedSix();
  const read = () => ["publishedcase", "publishedmanifest", "publishedlist", "publishededitions"]
    .map((op) => JSON.stringify(w.read(op, op === "publishededitions" ? { id: F } : { id: CASE })));
  const before = read();
  for (const profile of [["us-ca-oakland"], ["us-ny-nyc"], []]) {
    w.record.setSetting("jurisdiction_profiles", profile, "olive");
    assert.deepEqual(w.record.getSetting("jurisdiction_profiles"), profile, "control: the setting is held");
    assert.deepEqual(read(), before, JSON.stringify(profile));
  }
});
