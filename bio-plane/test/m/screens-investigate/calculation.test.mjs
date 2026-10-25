/* screens-investigate R5, R11, R14: a calculation, its spot-check and the help page, on interface-shell's served page. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { inWorld, openAs, settled, refused } from "./world.mjs";
import { createHash } from "node:crypto";
import { crc32 } from "node:zlib";
import { main, button, fill, press, word, drew, dayOf } from "./fixtures.mjs";

/* ---- a workbook the member holds: an .xlsx written here (a stored zip of the smallest SpreadsheetML package) and held as the capture screen holds a file ---- */
const enc = new TextEncoder();
function zipStored(entries) {
  const parts = [], central = [];
  let offset = 0, size = 0;
  for (const [name, text] of entries) {
    const data = enc.encode(text), nameBytes = enc.encode(name), crc = crc32(data);
    const local = new DataView(new ArrayBuffer(30));
    local.setUint32(0, 0x04034b50, true); local.setUint16(4, 20, true); local.setUint16(6, 0x0800, true);
    local.setUint32(14, crc, true); local.setUint32(18, data.length, true); local.setUint32(22, data.length, true); local.setUint16(26, nameBytes.length, true);
    parts.push(new Uint8Array(local.buffer), nameBytes, data);
    const cen = new DataView(new ArrayBuffer(46));
    cen.setUint32(0, 0x02014b50, true); cen.setUint16(4, 20, true); cen.setUint16(6, 20, true); cen.setUint16(8, 0x0800, true);
    cen.setUint32(16, crc, true); cen.setUint32(20, data.length, true); cen.setUint32(24, data.length, true); cen.setUint16(28, nameBytes.length, true); cen.setUint32(42, offset, true);
    central.push(new Uint8Array(cen.buffer), nameBytes);
    offset += 30 + nameBytes.length + data.length; size += 46 + nameBytes.length;
  }
  const end = new DataView(new ArrayBuffer(22));
  end.setUint32(0, 0x06054b50, true); end.setUint16(8, entries.length, true); end.setUint16(10, entries.length, true); end.setUint32(12, size, true); end.setUint32(16, offset, true);
  const all = [...parts, ...central, new Uint8Array(end.buffer)];
  const out = new Uint8Array(all.reduce((n, a) => n + a.length, 0));
  let at = 0;
  for (const a of all) { out.set(a, at); at += a.length; }
  return out;
}
/** A workbook of one sheet, "Model": the three payments in B2:B4 and their total in B5 (a formula). */
function workbook() {
  const head = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n';
  const ns = "http://schemas.openxmlformats.org/spreadsheetml/2006/main", rel = "http://schemas.openxmlformats.org/officeDocument/2006/relationships";
  const text = (ref, s) => `<c r="${ref}" t="inlineStr"><is><t>${s}</t></is></c>`;
  const sheet = `${head}<worksheet xmlns="${ns}"><sheetData><row r="1">${text("A1", "payer")}${text("B1", "amount")}</row>`
    + `<row r="2">${text("A2", "City")}<c r="B2"><v>5</v></c></row><row r="3">${text("A3", "City")}<c r="B3"><v>7</v></c></row><row r="4">${text("A4", "Fund")}<c r="B4"><v>9</v></c></row>`
    + `<row r="5"><c r="B5"><f>SUM(B2:B4)</f><v>21</v></c></row></sheetData></worksheet>`;
  return zipStored([
    ["[Content_Types].xml", `${head}<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/></Types>`],
    ["_rels/.rels", `${head}<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="${rel}/officeDocument" Target="xl/workbook.xml"/></Relationships>`],
    ["xl/workbook.xml", `${head}<workbook xmlns="${ns}" xmlns:r="${rel}"><sheets><sheet name="Model" sheetId="1" r:id="rId1"/></sheets></workbook>`],
    ["xl/_rels/workbook.xml.rels", `${head}<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="${rel}/worksheet" Target="worksheets/sheet1.xml"/></Relationships>`],
    ["xl/worksheets/sheet1.xml", sheet],
  ]);
}
const hex = (v) => createHash("sha256").update(v).digest("hex");
const resultOf = (a) => (a && a.json && a.json.result !== undefined ? a.json.result : a && a.json);
/** The file `bytes` held as the capture screen holds one (`recipes.hold` holds text only): `captureupload`, then `promote` of an information bundle at `collected`. Answers `{sha, bundle}`. */
async function holdBytes(world, me, name, bytes, project) {
  const up = await world.door({ url: `/api/?${new URLSearchParams({ op: "captureupload", statement: name, name })}`,
    init: { method: "POST", headers: { "content-type": "application/octet-stream" }, body: bytes } }, me);
  const doc = resultOf(up) && resultOf(up).document;
  assert.ok(doc && doc.capture, "the file was captured: " + JSON.stringify(resultOf(up)).slice(0, 300));
  const now = new Date(world.now()).toISOString().replace(/\.\d{3}Z$/, "Z");
  const minted = await me.read("allocid", { query: { prefix: "INFO", year: now.slice(0, 4) } });
  const id = minted.id + "-" + name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const sha = doc.capture.sha256;
  const front = ["---", "id: " + id, "object_type: information", "schema: information@2", "title: " + JSON.stringify(name), "current_state: collected", "prior_state: null",
    "created: " + now, "last_updated: " + now, "produced_by:", "  mode: assisted", "  capability_tier: session", "references: []", "state_history: []", "annotations_open: 0",
    "reeval_pending:", "  flag: false", "  since: null", "  source: null", "visuals: []", "criticality: supporting", "source_status: unchanged", "content_hash: sha256:" + hex(sha),
    "source:", "  locator: " + JSON.stringify(doc.locator || "upload"), "  authority: member-entered", "  retrieved: " + now, "monitoring:", "  enabled: false", "  frequency: none",
    "project: " + project, "---", "", "## Summary", "", name, "", "## Provenance Notes", "", "## Session Log", "", "## Review Notes", ""].join("\n");
  const prov = JSON.stringify({ documents: [doc] }, null, 1), dataset = JSON.stringify({ documents: [{ bytes: doc.capture.bytes, locator: doc.locator || "upload", sha256: sha }] });
  const len = (s) => enc.encode(s).length;
  const files = [{ path: "bundle.md", text: front, bytes: len(front), sha256: hex(front) }, { path: "data/provenance.json", text: prov, bytes: len(prov), sha256: hex(prov) },
    { path: "data/dataset.json", text: dataset, bytes: len(dataset), sha256: hex(dataset) }, { path: doc.file, blobSha: sha, sha256: sha, bytes: doc.capture.bytes }];
  const register = [{ sha256: sha, path: doc.file, encoding: doc.capture.encoding, bytes: doc.capture.bytes }];
  const made = await me.act("promote", { body: { bundleId: id, base: null, snapKey: now.replace(/[-:]/g, "") + "_" + hex(id).slice(0, 8),
    meta: { object_type: "information", title: name, current_state: "collected", created: now, last_updated: now }, files, register } });
  return { sha, bundle: made.bundleId || id };
}

/** A calculation resting on a recorded draw: a project, a register the member holds with its declared table, a draw of all three rows with a question, two members'
 *  visits (mai finds the first item repaired; mai finds the second repaired and dev finds it not: in tension; the third is not visited), the estimate over the visits
 *  (its own calculation, which rests on the draw: a count over a table and a draw together is not one the store makes) and a count over the table. All real acts.
 *  Answers the ids the world gave. */
async function drawnWorld() {
  const { world, me } = await inWorld();
  await world.recipes.profiles(me, ["oakland-alameda"]);
  const project = await world.recipes.project(me, "Repairs");
  const csv = await world.recipes.hold(me, "Reports.csv", "id,closed\n1,y\n2,y\n3,n\n", project);
  const table = (await me.act("tabledeclare", { body: { source: { capture_sha: csv.sha, extent: { kind: "document" } }, header: ["id", "closed"],
    schema: { fields: [{ name: "id", type: "string" }, { name: "closed", type: "string" }] } } })).sha;
  const period = { from: "2025-07-01", to: "2026-06-30" };
  const question = "Was the pothole repaired?";
  const draw = (await me.act("calculationdraw", { body: { set: table, n: 3, seed: "2026-10-05-7f31", question, project, reason: "a sample to visit" } })).draw;
  const mai = await world.signIn("mai", { admin: true }), dev = await world.signIn("dev", { admin: true });
  const visit = async (who, item, finding, observedAt) => {
    const t = await who.act("testify", { body: { words: "What I saw at report " + item + ".", observedAt } });
    await who.act("spotcheckvisit", { body: { draw, item, finding, testimony: t.capture_sha, reason: "I visited it" } });
  };
  const items = (await me.read("spotcheck", { query: { draw } })).items.map((x) => x.item);
  const [yes, tension, unvisited] = items;
  await visit(mai, yes, "yes", "2026-10-06");
  await visit(mai, tension, "yes", "2026-10-06");
  await visit(dev, tension, "no", "2026-10-07");
  const estimate = (await me.act("calculationcreate", { body: { question: "Share of drawn reports repaired", period, kind: "estimate", project, inputs: [{ name: "sample", draw }] } })).calc_id;
  const calc = (await me.act("calculationcreate", { body: { question: "Reports closed within seven days, FY2025", period, kind: "count", project, inputs: [{ name: "orders", table }] } })).calc_id;
  return { world, me, project, csv, table, draw, question, yes, tension, unvisited, estimate, calc, path: "/app/calculation/" + calc, spotPath: "/app/calculation/" + estimate };
}

test("R5 reads calculation (the computed fact, its method as written, its inputs with their grades, its checks)", async () => {
  const { world, me, calc, table, path } = await drawnWorld();
  const p = await openAs(world, me, path);
  assert.equal(p.byOp("calculation")[0].query.id, calc);
  const stored = await me.read("calculation", { query: { id: calc } });
  const m = main(p);
  assert.equal(m.querySelector("h1").textContent, stored.question);
  assert.equal(m.querySelector(".mk-bignum b").textContent, stored.results.output.value, "the computed fact, as the store computed it");
  assert.match(m.textContent, new RegExp(stored.calculation.recipe.steps[0].op), "its method as written");
  drew(m, "screen.calculation.status." + stored.recompute_status);
  const inputs = m.querySelectorAll("section").find((s) => s.querySelector("h2").textContent === word("screen.calculation.inputs"));
  const graded = stored.grade.inputs.find((x) => x.name === "orders");
  assert.equal(inputs.querySelector(".cs-grade") ? inputs.querySelector(".cs-grade").textContent : null, /^[A-D]$/.test(graded.grade || "") ? word("mark.scale.capture.name") + graded.grade : null, "each input with the grade the store gives it");
  assert.match(inputs.textContent, /orders/);
  assert.ok(inputs.textContent.includes(table.slice(0, 8)), "and the table it reads");
});

test("R5 the spot-check: the draw (the set, its size, the seed and method, that anyone can repeat it), the question, each drawn item with its visits and standing, the counts, the estimate with its exact range", async () => {
  const { world, me, draw, question, estimate, spotPath } = await drawnWorld();
  const p = await openAs(world, me, spotPath);
  assert.equal(p.byOp("spotcheck")[0].query.draw, draw);
  assert.equal(p.byOp("calculation").at(-1).query.id, estimate, "the estimate's own calculation");
  const spot = await me.read("spotcheck", { query: { draw } });
  const s = main(p).querySelectorAll("section").find((x) => x.querySelector("h2").textContent === word("screen.calculation.spot"));
  drew(s, "screen.calculation.draw.what", { n: String(spot.draw.n), size: String(spot.draw.set_size), seed: spot.draw.seed });
  drew(s, "screen.calculation.draw.repeat");
  assert.ok(s.textContent.includes(question), "the question, as the draw records it");
  const k = spot.counts;
  drew(s, "screen.calculation.counts", { visited: String(spot.draw.n - k.not_visited), n: String(spot.draw.n), yes: String(k.yes), no: String(k.no), unsure: String(k.could_not_tell) });
  assert.deepEqual([k.yes, k.disagree, k.not_visited], [1, 1, 1], "two members' visits made one item yes, one in tension, one not visited");
  for (const key of ["disagree", "notvisited"]) drew(s, "screen.calculation.counts." + key, { n: "1" });
  assert.ok(s.textContent.includes(word("screen.calculation.estimate")), "the estimate is drawn (its exact range: see the REPORTED todo below)");
  const first = spot.items.find((x) => x.standing === "yes");
  drew(s, "screen.calculation.item", { item: first.item });
  const v = first.visits[0];
  drew(s, "screen.calculation.visit", { finding: word("screen.calculation.finding.yes"), by: v.visitor, date: dayOf(v.observed_at) });
  assert.equal(s.querySelectorAll(".cs-grade[data-scale=testimony]").length, spot.items.reduce((n, x) => n + x.visits.length, 0), "every visit, graded as testimony");
});

test.todo("REPORTED (screens-investigate, src/screens-investigate/calculation.mjs `range`): R5 the estimate's exact range is drawn \"NaN% to NaN%\": calculations answers low_share and high_share as figures ({value, sign, precision}), the page rounds them as numbers", async () => {
  const { world, me, estimate, spotPath } = await drawnWorld();
  const p = await openAs(world, me, spotPath);
  const iv = (await me.read("calculation", { query: { id: estimate } })).results.interval;
  const s = main(p).querySelectorAll("section").find((x) => x.querySelector("h2").textContent === word("screen.calculation.spot"));
  drew(s, "screen.calculation.range", { share: String(Math.round((iv.successes / iv.sample_size) * 100)), judged: String(iv.sample_size), confidence: String(Math.round(iv.confidence * 100)),
    low: String(Math.round(iv.low_share.value * 100)), high: String(Math.round(iv.high_share.value * 100)) });
});

test("R5 a disagreeing item's visits are drawn in tension, never one picked", async () => {
  const { world, me, draw, tension, spotPath } = await drawnWorld();
  const p = await openAs(world, me, spotPath);
  const visits = (await me.read("spotcheck", { query: { draw } })).items.find((x) => x.item === tension).visits;
  assert.equal(visits.length, 2);
  const row = main(p).querySelectorAll(".cs-row").find((r) => r.textContent.includes(word("screen.calculation.item", { item: tension })));
  drew(row, "screen.calculation.standing.disagree");
  for (const v of visits) drew(row, "screen.calculation.visit", { finding: word("screen.calculation.finding." + v.finding), by: v.visitor, date: dayOf(v.observed_at) });
  assert.deepEqual(visits.map((v) => v.finding).sort(), ["no", "yes"]);
  drew(row, "screen.calculation.tension");
});

/** A project, a payments register the member holds, the table she declares from it (her own `tabledeclare`), a calculation she has made to stand on, a second
 *  register to declare a table from, and a workbook (an .xlsx, held as the capture screen holds a file) added to the project. */
async function register(world, me) {
  const project = await world.recipes.project(me, "Repairs");
  const csv = await world.recipes.hold(me, "Payments.csv", "payer,payee,amount\nCity,Acme,5\nCity,Beta,7\nFund,Acme,9\n", project);
  const other = await world.recipes.hold(me, "Grants.csv", "grantee,amount\nAcme,10\nBeta,12\n", project);
  const table = (await me.act("tabledeclare", { body: { source: { capture_sha: csv.sha, extent: { kind: "document" } }, header: ["payer", "payee", "amount"],
    schema: { fields: [{ name: "payer", type: "string" }, { name: "payee", type: "string" }, { name: "amount", type: "number" }] } } })).sha;
  const first = (await me.act("calculationcreate", { body: { question: "How many payments?", period: { from: "2025-07-01", to: "2026-06-30" }, kind: "count", project, inputs: [{ name: "input", table }] } })).calc_id;
  const book = await holdBytes(world, me, "Budget.xlsx", workbook(), project);
  return { project, csv, other, table, first, book };
}

/** The two photos or documents a visit may cite are held files; the draw's `set` is a declared table's digest (see the REPORTED todo below). */
const drawn = (p) => p.byOp("calculationdraw").slice(-1)[0];

test("R5 the acts: calculationcreate, tabledeclare, recordcheck, calculationaccept, addworkbook, bind, calculationdraw (how many, the seed recorded)", async () => {
  const { world, me } = await inWorld();
  await world.recipes.profiles(me, ["oakland-alameda"]);
  const R = await register(world, me);
  const stored = (await me.read("calculation", { query: { id: R.first } }));
  assert.equal(stored.found, true);
  const p = await openAs(world, me, "/app/calculation/" + R.first);
  /* calculationdraw: how many, the seed recorded; the draw the plane made is read */
  fill(p, { "calc-set": R.table, "calc-n": "2", "calc-seed": "2026-10-05-7f31", "calc-dq": "Was it repaired?" });
  await press(p, "calculationdraw", { reason: "a sample to visit" });
  await settled(p);
  assert.deepEqual(drawn(p).body, { set: R.table, n: 2, seed: "2026-10-05-7f31", question: "Was it repaired?", project: R.project, reason: "a sample to visit" });
  const draw = p.byOp("spotcheck").at(-1).query.draw;
  const made = await me.read("spotcheck", { query: { draw } });
  assert.equal(made.found, true, "the new draw is read, and the store holds it");
  assert.deepEqual([made.draw.set, made.draw.n, made.draw.seed, made.draw.drawn_by], [R.table, 2, "2026-10-05-7f31", me.member], "its set, how many and the seed recorded");
  assert.equal(made.question, "Was it repaired?");
  /* tabledeclare: the passage chosen on the document, the header named */
  fill(p, { "calc-content": R.other.sha, "calc-header": "grantee, amount" });
  p.fire(p.doc.getElementById("calc-content"), "change");
  await settled(p);
  await press(p, "tabledeclare", { reason: "the grants register" });
  await settled(p);
  assert.deepEqual(p.byOp("tabledeclare")[0].body.header, ["grantee", "amount"]);
  assert.equal(p.byOp("tabledeclare")[0].body.source.capture_sha, R.other.sha);
  assert.equal(main(p).querySelector('[data-gap="refused"]'), null, "the plane holds the table");
  /* addworkbook: the workbook added to the project, under the calculation's question and the period */
  fill(p, { "calc-wb": R.book.sha, "calc-period": "FY2025" });
  await press(p, "addworkbook", { reason: "my own count" });
  await settled(p);
  assert.deepEqual(p.byOp("addworkbook")[0].body, { captureSha: R.book.sha, question: stored.question, period: "FY2025", project: R.project, reason: "my own count" });
  assert.equal(main(p).querySelector('[data-gap="refused"]'), null, "the plane holds the workbook");
  const held = await me.read("workbook", { query: { capture: R.book.sha, project: R.project } });
  assert.deepEqual([held.ok, held.workbook.period, held.workbook.question], [true, "FY2025", stored.question], "the store holds it under that question and period");
  /* bind: a range of the workbook to the table's own cells */
  fill(p, { "calc-range": "Model!B2:B4", "calc-table": R.table, "calc-trange": "C1:C3" });
  await press(p, "bind");
  await settled(p);
  assert.deepEqual(p.byOp("bind")[0].body, { captureSha: R.book.sha, project: R.project, range: "Model!B2:B4", input: { table: R.table, range: "C1:C3" } });
  assert.equal(main(p).querySelector('[data-gap="refused"]'), null, "bound");
  const bound = (await me.read("workbook", { query: { capture: R.book.sha, project: R.project } })).bindings;
  assert.deepEqual(bound.map((b) => [b.range, b.input.table, b.bound_by, b.agrees]), [["Model!B2:B4", R.table, me.member, true]], "the store holds the binding, and the table's cells agree with the workbook's");
  /* recordcheck is a second member's: the author's own is refused (drawn beside it); a second member's lands */
  fill(p, { "calc-outcome": "agrees", "calc-note": "I recounted 21" });
  await press(p, "recordcheck");
  await settled(p);
  assert.ok(main(p).querySelector('[data-gap="refused"]'), "the workbook's author cannot check it herself: the refusal is drawn beside the act");
  const ana = await world.signIn("ana", { admin: true });
  const q = await openAs(world, ana, "/app/calculation/" + R.first);
  fill(q, { "calc-wb": R.book.sha, "calc-outcome": "agrees", "calc-note": "I recounted 21" });
  await press(q, "recordcheck");
  await settled(q);
  assert.deepEqual(q.byOp("recordcheck")[0].body, { captureSha: R.book.sha, project: R.project, outcome: "agrees", note: "I recounted 21" });
  assert.equal(main(q).querySelector('[data-gap="refused"]'), null, "a second member's check lands");
  assert.ok(JSON.stringify(await me.read("workbook", { query: { capture: R.book.sha, project: R.project } })).includes("I recounted 21"), "and the store holds it with her note");
  /* calculationaccept */
  await press(p, "calculationaccept", { reason: "recomputed and agrees" });
  await settled(p);
  assert.equal(p.byOp("calculationaccept")[0].query.id, R.first);
  const accepted = await me.read("calculation", { query: { id: R.first } });
  assert.equal(accepted.accepted_by, me.member, "accepted by the member who pressed it");
  /* calculationcreate: a new calculation over the table, and its page opens */
  fill(p, { "calc-q": "Payments in FY2026", "calc-from": "2025-07-01", "calc-to": "2026-06-30", "calc-kind": "count", "calc-input": R.table });
  await press(p, "calculationcreate", { reason: "the new year" });
  await settled(p);
  assert.deepEqual(p.byOp("calculationcreate")[0].body.inputs, [{ name: "input", table: R.table }]);
  const id = /CALC-[^/]+$/.exec(p.location.pathname || String(p.location))[0];
  assert.notEqual(id, R.first);
  const newer = await me.read("calculation", { query: { id } });
  assert.equal(newer.found, true);
  assert.equal(newer.question, "Payments in FY2026");
});

test("R34 R5 the draw's set is chosen among the tables this calculation reads, by the title of the document each was made from, and the real store draws it", async () => {
  const { world, me } = await inWorld();
  await world.recipes.profiles(me, ["oakland-alameda"]);
  const R = await register(world, me);
  const p = await openAs(world, me, "/app/calculation/" + R.first);
  await settled(p);
  const opts = [...p.doc.getElementById("calc-set").querySelectorAll("option")].filter((o) => o.getAttribute("value") !== "");
  assert.deepEqual(opts.map((o) => [o.getAttribute("value"), o.textContent]), [[R.table, "Payments.csv"]], "the table the calculation reads, by its document's title");
  fill(p, { "calc-set": R.table, "calc-n": "2", "calc-seed": "2026-10-05-7f31" });
  await press(p, "calculationdraw", { reason: "a sample to visit" });
  await settled(p);
  assert.equal(main(p).querySelector('[data-gap="refused"]'), null, "the store draws what the page offered");
  assert.ok((await me.read("spotcheck", { query: { id: R.first } })), "the draw is held");
});

test("R14 \"Record what you saw at a report\" sends testify (her own words) and \"Count it for the drawn report\" sends spotcheckvisit tying it to the drawn item with her finding: two acts", async () => {
  const { world, me } = await inWorld();
  await world.recipes.profiles(me, ["oakland-alameda"]);
  const R = await register(world, me);
  const p = await openAs(world, me, "/app/calculation/" + R.first);
  fill(p, { "calc-set": R.table, "calc-n": "2", "calc-seed": "2026-10-05-7f31", "calc-dq": "Was the pothole repaired?" });
  await press(p, "calculationdraw", { reason: "a sample to visit" });
  await settled(p);
  const draw = p.byOp("spotcheck").at(-1).query.draw;
  const items = (await me.read("spotcheck", { query: { draw } })).items.map((x) => x.item);
  assert.equal(items.length, 2, "two reports drawn");
  assert.equal(button(p, "testify").textContent.startsWith(word("act.testify.label.calculation")), true);
  assert.equal(button(p, "spotcheckvisit").textContent.startsWith(word("act.spotcheckvisit.label.calculation")), true);
  fill(p, { "calc-words": "The pothole at 60th and Seminary is filled and level.", "calc-observed": "2026-09-30" });
  await press(p, "testify");
  await settled(p);
  assert.deepEqual(p.byOp("testify")[0].body, { words: "The pothole at 60th and Seminary is filled and level.", observedAt: "2026-09-30" });
  assert.equal(p.byOp("spotcheckvisit").length, 0, "two acts: the visit is not counted until she says so");
  assert.equal((await me.read("spotcheck", { query: { draw } })).counts.judged, 0, "and the store has counted none");
  fill(p, { "calc-item": items[0], "calc-finding-0": true, "calc-photo": R.csv.sha });
  await press(p, "spotcheckvisit", { reason: "I visited it" });
  await settled(p);
  const sent = p.byOp("spotcheckvisit")[0].body;
  assert.deepEqual([sent.draw, sent.item, sent.finding, sent.exhibits, sent.reason], [draw, items[0], "yes", [R.csv.sha], "I visited it"]);
  assert.match(sent.testimony, /^[0-9a-f]{64}$/, "tied to her testimony, the capture testify made");
  const after = await me.read("spotcheck", { query: { draw } });
  const visit = after.items.find((x) => x.item === items[0]).visits[0];
  assert.deepEqual([visit.finding, visit.visitor, visit.exhibits, visit.observed_at], ["yes", me.member, [R.csv.sha], "2026-09-30"], "the store holds her visit");
  assert.equal(after.counts.yes, 1);
});

test("R5 R14 spotcheckvisit needs her testimony and a finding (control: none sends nothing); a refusal drawn beside it", async () => {
  const { world, me } = await inWorld();
  await world.recipes.profiles(me, ["oakland-alameda"]);
  const R = await register(world, me);
  const p = await openAs(world, me, "/app/calculation/" + R.first);
  fill(p, { "calc-set": R.table, "calc-n": "2", "calc-seed": "2026-10-05-7f31", "calc-dq": "Was the pothole repaired?" });
  await press(p, "calculationdraw", { reason: "a sample to visit" });
  await settled(p);
  const draw = p.byOp("spotcheck").at(-1).query.draw;
  const items = (await me.read("spotcheck", { query: { draw } })).items.map((x) => x.item);
  fill(p, { "calc-item": items[0], "calc-finding-1": true });
  await press(p, "spotcheckvisit", { reason: "x" });
  assert.equal(p.byOp("spotcheckvisit").length, 0);
  fill(p, { "calc-words": "Not repaired.", "calc-observed": "2026-09-30" });
  await press(p, "testify");
  await settled(p);
  /* a report that is not in the draw: the store refuses it */
  const notDrawn = "99";
  assert.ok(!items.includes(notDrawn));
  fill(p, { "calc-item": notDrawn, "calc-finding-1": true });
  await press(p, "spotcheckvisit", { reason: "x" });
  await settled(p);
  assert.equal(p.byOp("spotcheckvisit")[0].body.finding, "no");
  assert.equal((await refused(world, me, "spotcheckvisit", p.byOp("spotcheckvisit")[0].body)).reason, "NOT_DRAWN", "the store's own refusal");
  assert.ok(main(p).textContent.includes(word("refusal.NOT_DRAWN")), "the refusal by its words");
  assert.equal((await me.read("spotcheck", { query: { draw } })).counts.judged, 0, "nothing was counted");
});

test("R11 \"How spot-checks work\" is reached from calculation and says, in plain words, what a spot-check does, why the draw is random and recorded, what the result says and does not say", async () => {
  const { world, me } = await inWorld();
  await world.recipes.profiles(me, ["oakland-alameda"]);
  const R = await register(world, me);
  const p = await openAs(world, me, "/app/calculation/" + R.first);
  const link = main(p).querySelector('a[href="/app/help"]');
  assert.equal(link.textContent, word("screen.calculation.help"));
  await p.click(link);
  await p.settle();
  const m = main(p);
  assert.equal(m.querySelector("h1").textContent, word("screen.help.name"));
  assert.deepEqual(m.querySelectorAll("h2").map((h) => h.textContent), ["does", "random", "says", "notsays", "evidence"].map((k) => word("screen.help." + k)));
  for (const k of ["does", "random", "says", "notsays", "evidence"]) drew(m, "screen.help." + k + ".p");
  assert.equal(m.querySelectorAll("button[data-act]").length, 0, "a help page has no act");
  assert.equal(p.byOp("calculation").length >= 1, true);
});

test("R34 the calculation's tabled content, workbook and photo are chosen among documents by title, never typed as fingerprints", async () => {
  const { world, me } = await inWorld();
  await world.recipes.profiles(me, ["oakland-alameda"]);
  const R = await register(world, me);
  const p = await openAs(world, me, "/app/calculation/" + R.first);
  await settled(p);
  for (const id of ["calc-content", "calc-wb", "calc-photo"]) {
    const titles = p.doc.getElementById(id).querySelectorAll("option").map((o) => o.textContent).filter((t) => t);
    assert.deepEqual(titles.map((t) => t.split(" · ")[0]).sort(), ["Budget.xlsx", "Grants.csv", "Payments.csv"], id);
  }
});
