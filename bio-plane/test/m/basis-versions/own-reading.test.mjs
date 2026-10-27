/* basis-versions R51 (T50; N1109, N1173; DEC-254): a member's own reading is accepted and concluded on in one act.
   `conclude` takes `reading`, the member's own words, in place of `version`. Each test drives `conclude` and
   `basisVersions` at the interface, over the real record, promotion, content and membership. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, block, version, V, MACHINE } from "./fixture.mjs";
import { word } from "../../../src/setup-words/index.mjs";
import { parseFrontmatter } from "../../../src/record-grammar/index.mjs";
import { citationExtent } from "../../../src/content/index.mjs";

const DOC = "INFO-2026-0001-a", DOC2 = "INFO-2026-0002-b", Q = "INQ-2026-0001-q";
const NOW = "2026-09-28T01:00:00Z", ALICE = "member:alice";
const WORDS = "The council approved the transfer on the third reading.";

const GROUNDS = ["grounds:", `  - ground: "the minutes"`, `    asserted_by: "${ALICE}"`, `    at: "2026-09-27T00:00:00Z"`,
                 `  - ground: "the ledger"`, `    asserted_by: "${ALICE}"`, `    at: "2026-09-27T00:00:00Z"`];

function setup({ lines = null, legs = [DOC, DOC2], parts = false, extraWorld = {} } = {}) {
  const w = world(extraWorld);
  w.doc(DOC); w.doc(DOC2);
  w.member("alice"); w.member("bo");
  const basis = legs.map((t, i) => ({ target: t, role: "supports", ...(parts ? { ground: i === 0 ? "the minutes" : "the ledger" } : {}) }));
  const r = w.inquiry(Q, lines ?? [...block({ basis, refs: legs }), ...(parts ? GROUNDS : [])]);
  assert.equal(r.ok, true, JSON.stringify(r).slice(0, 400));
  return w;
}
const project = (w, owner = "alice") => w.project("Team", owner, [Q]);
const conclude = (w, o) => w.bv.conclude({ target: Q, author: ALICE, viewer: V("alice"), identity: ALICE, ...o });
const read = (w, o = {}) => w.bv.basisVersions({ id: Q, viewer: V("alice"), ...o });
const fmOf = (w, id) => parseFrontmatter(w.text(id)).data;

test("R51: a member's own words with a project write one accepted version authored by her carrying the question's two legs, make it the project's CURRENT, append one concluded row adopting her words, and change the question's bytes only by the version", () => {
  const w = setup();
  const p = project(w);
  const before = fmOf(w, Q);
  const r = conclude(w, { project: p, reading: WORDS, falsifier: "the minutes say otherwise" });
  assert.equal(r.ok, true, JSON.stringify(r).slice(0, 400));
  assert.deepEqual([r.own_reading, r.version, r.relationship, r.inquiry_moved, r.author, r.history_length],
    [true, "reading-1", "project", false, ALICE, 1]);
  assert.deepEqual(r.claim, { state: "adopted", text: WORDS, version: "reading-1" });
  const read1 = read(w, { project: p });
  assert.equal(read1.total, 1);
  const [v] = read1.versions;
  assert.deepEqual([v.name, v.state, v.author, v.kind, v.run, v.derived_from, v.claim, v.description, v.relationship, v.hidden],
    ["reading-1", "accepted", ALICE, null, null, null, WORDS, WORDS, "and", false]);
  assert.deepEqual(v.moved, { by: ALICE, at: NOW, reason: "" });
  assert.equal(v.affirmed, null, "one part: nothing is asked");
  assert.deepEqual(v.parts.length, 1);
  assert.deepEqual(v.legs.map((l) => l.target_id), [DOC, DOC2], "the question's live legs, in order");
  assert.deepEqual(read1.current, { project: p, version: "reading-1", at: NOW, by: ALICE }, "R15: the project's CURRENT");
  assert.equal(read1.conclusion.claim, WORDS);
  assert.deepEqual(read1.conclusion_history.map((h) => [h.act, h.version, h.claim, h.falsifier]),
    [["concluded", "reading-1", WORDS, "the minutes say otherwise"]]);
  const after = fmOf(w, Q);
  assert.equal(after.current_state, "open", "the question is not moved");
  assert.deepEqual(after.basis, before.basis, "its own legs are as they were");
  assert.equal(after.conclusion, undefined);
  assert.equal(after.basis_versions.length, 1);
  assert.equal(after.basis_versions[0].state_by, ALICE);
  assert.equal(w.count("inquiry_basis_versions"), 1);
  assert.match(w.text(p), /current_versions:\n  - inquiry: "INQ-2026-0001-q"\n    version: "reading-1"/);
  assert.match(w.text(p), /conclusions:\n  - inquiry: "INQ-2026-0001-q"\n    act: "concluded"\n    version: "reading-1"\n    claim: "The council/);
});

test("R51: the same act without a project writes the accepted version and moves the question to concluded on it (R19)", () => {
  const w = setup();
  const r = conclude(w, { reading: WORDS, falsifier: "the minutes say otherwise" });
  assert.equal(r.ok, true, JSON.stringify(r).slice(0, 400));
  assert.deepEqual([r.own_reading, r.relationship, r.from, r.to, r.version, r.conclusion, r.project],
    [true, "no_project", "open", "concluded", "reading-1", WORDS, null]);
  const f = fmOf(w, Q);
  assert.deepEqual([f.current_state, f.prior_state, f.conclusion_version, f.conclusion_claim, f.conclusion],
    ["concluded", "open", "reading-1", WORDS, WORDS]);
  assert.equal(read(w).versions[0].state, "accepted");
  assert.deepEqual(read(w).no_project_conclusion.claim, { state: "adopted", text: WORDS, version: "reading-1" });
  const w2 = setup();
  const r2 = conclude(w2, { reading: WORDS, conclusion: "A summary beside it", noFalsifier: "1" });
  assert.equal(r2.ok, true);
  assert.deepEqual([fmOf(w2, Q).conclusion, fmOf(w2, Q).conclusion_claim], ["A summary beside it", WORDS], "a conclusion text stays beside her words");
});

test("R51: reading is made frontmatter-safe as a claim is, and a repeat mints a new unique name", () => {
  const w = setup();
  const p = project(w);
  const a = conclude(w, { project: p, reading: '  Said "yes" \\ and\nmore  ', falsifier: "f" });
  assert.equal(a.ok, true, JSON.stringify(a).slice(0, 300));
  assert.equal(a.claim.text, "Said 'yes' ' and more");
  const b = conclude(w, { project: p, reading: "A second reading of it", falsifier: "f" });
  assert.deepEqual([b.ok, b.version, b.history_length], [true, "reading-2", 2]);
  assert.deepEqual(read(w).versions.map((v) => v.name), ["reading-1", "reading-2"]);
  assert.equal(read(w, { project: p }).current.version, "reading-2", "the later reading is what the project stands on");
  assert.equal(conclude(w, { reading: "x".repeat(500), falsifier: "f" }).ok, true, "500 characters land");
});

test("R51 control: every refusal of a conclusion stands and writes nothing (NO_FALSIFIER, FALSIFIER_AND_NONE_STATED, MACHINE_CANNOT_CONCLUDE, NO_BASIS, NO_CLAIM)", () => {
  const w = setup();
  const p = project(w);
  const state = () => [w.sha(Q), w.sha(p), w.count("inquiry_basis_versions")];
  const base = state();
  const nf = conclude(w, { project: p, reading: WORDS });
  assert.deepEqual([nf.ok, nf.reason, nf.code, nf.check], [false, "NO_FALSIFIER", "NO_FALSIFIER", "C-33.2"]);
  assert.equal(conclude(w, { project: p, reading: WORDS, falsifier: "f", noFalsifier: "1" }).reason, "FALSIFIER_AND_NONE_STATED");
  assert.equal(conclude(w, { author: MACHINE, project: p, reading: WORDS, falsifier: "f" }).reason, "MACHINE_CANNOT_CONCLUDE");
  assert.equal(conclude(w, { author: "", reading: WORDS, falsifier: "f" }).reason, "MACHINE_CANNOT_CONCLUDE");
  assert.deepEqual(state(), base, "nothing written by any of them");
  assert.equal(conclude(w, { project: p, reading: WORDS, noFalsifier: "1" }).ok, true, "control: the stated absence of a falsifier lands");
  assert.notDeepEqual(state(), base);
  /* NO_BASIS: a question with no live leg, through inquiry's one site (its R45) */
  const bare = setup({ legs: [] });
  const bp = project(bare);
  const bareBase = [bare.sha(Q), bare.sha(bp)];
  const nb = conclude(bare, { project: bp, reading: WORDS, falsifier: "f" });
  assert.deepEqual([nb.ok, nb.reason, nb.check], [false, "NO_BASIS", "C-33.40"]);
  assert.equal(conclude(bare, { reading: WORDS, falsifier: "f" }).reason, "NO_BASIS", "without a project too");
  assert.deepEqual([bare.sha(Q), bare.sha(bp), bare.count("inquiry_basis_versions")], [...bareBase, 0]);
  /* NO_CLAIM: a project that does not draw on the question, its words by key */
  const elsewhere = w.project("Elsewhere", "alice", []);
  const before = state();
  const nc = conclude(w, { project: elsewhere, reading: WORDS, falsifier: "f" });
  assert.deepEqual([nc.ok, nc.reason, nc.check, nc.translation], [false, "NO_CLAIM", "C-33.34", word("refusal.NO_CLAIM")]);
  assert.deepEqual(state(), before);
});

test("R51 control: BAD_READING — blank, 501 characters, beside a version, or beside commentary with no project; its words by key", () => {
  const w = setup();
  const p = project(w);
  const base = [w.sha(Q), w.sha(p)];
  const bad = (o) => conclude(w, { falsifier: "f", ...o });
  for (const [label, o] of [["blank", { project: p, reading: "   " }], ["empty", { project: p, reading: "" }],
                            ["501 characters", { project: p, reading: "x".repeat(501) }],
                            ["beside a version", { project: p, reading: WORDS, version: "first" }],
                            ["commentary with no project", { reading: WORDS, commentary: "more" }],
                            ["blank, no project", { reading: "" }]]) {
    const r = bad(o);
    assert.deepEqual([r.ok, r.reason, r.code, r.translation], [false, "BAD_READING", "BAD_READING", word("refusal.BAD_READING")], label);
  }
  assert.match(bad({ project: p, reading: WORDS, version: "first" }).detail, /reading[\s\S]*version/, "names both");
  assert.match(bad({ reading: WORDS, commentary: "more" }).detail, /reading[\s\S]*commentary/, "names both");
  assert.deepEqual([w.sha(Q), w.sha(p)], base, "nothing written");
  assert.equal(bad({ project: p, reading: WORDS, commentary: "beside her words" }).ok, true, "commentary with a project stays allowed");
});

test("R51: the floor is 12 characters — an 11-character reading is BAD_READING and writes nothing, 12 are accepted", () => {
  const w = setup();
  const p = project(w);
  const base = [w.sha(Q), w.sha(p), w.count("inquiry_basis_versions")];
  const r = conclude(w, { project: p, reading: "x".repeat(11), falsifier: "f" });
  assert.deepEqual([r.ok, r.reason], [false, "BAD_READING"]);
  assert.deepEqual([w.sha(Q), w.sha(p), w.count("inquiry_basis_versions")], base);
  assert.equal(conclude(w, { project: p, reading: "x".repeat(12), falsifier: "f" }).ok, true);
});

test("R51: preview answers the receipt with wrote: false and writes nothing; a refusal the act would give is the preview's", () => {
  const w = setup();
  const p = project(w);
  const base = [w.sha(Q), w.sha(p), w.count("inquiry_basis_versions")];
  const pv = conclude(w, { project: p, reading: WORDS, falsifier: "f", preview: "1" });
  assert.deepEqual([pv.ok, pv.preview, pv.wrote, pv.version, pv.own_reading], [true, true, false, "reading-1", true]);
  assert.deepEqual([w.sha(Q), w.sha(p), w.count("inquiry_basis_versions")], base);
  const npv = conclude(w, { reading: WORDS, falsifier: "f", preview: true });
  assert.deepEqual([npv.ok, npv.wrote, w.sha(Q)], [true, false, base[0]]);
  assert.equal(conclude(w, { project: p, reading: WORDS, preview: true }).reason, "NO_FALSIFIER");
  assert.equal(conclude(w, { project: p, reading: WORDS, falsifier: "f" }).ok, true, "the act then lands as the preview said");
});

test("R51: a reading of several parts needs each in affirmed (R12), the version carries them; the question's live legs only — a leg whose edge the question severed is left out", () => {
  const w = setup({ parts: true });
  const p = project(w);
  const incomplete = conclude(w, { project: p, reading: WORDS, falsifier: "f", affirmed: "the minutes" });
  assert.deepEqual([incomplete.ok, incomplete.reason, incomplete.check, incomplete.missing, incomplete.part],
    [false, "VERSION_AFFIRMATION_INCOMPLETE", "C-25.33", ["the ledger"], "the ledger"]);
  assert.equal(w.count("inquiry_basis_versions"), 0);
  const ok = conclude(w, { project: p, reading: WORDS, falsifier: "f", affirmed: "the minutes,the ledger" });
  assert.equal(ok.ok, true, JSON.stringify(ok).slice(0, 400));
  assert.deepEqual(ok.affirmed, ["the minutes", "the ledger"]);
  const [v] = read(w).versions;
  assert.deepEqual([v.relationship, v.affirmed, v.parts], ["or", ["the minutes", "the ledger"], ["the minutes", "the ledger"]]);
  assert.deepEqual(fmOf(w, Q).basis_version_grounds.map((g) => [g.ground, g.asserted_by]), [["the minutes", ALICE], ["the ledger", ALICE]],
    "the grounds as the document holds them");
  /* a severed leg is not live */
  const lines = block({ basis: [{ target: DOC, role: "supports" }, { target: DOC2, role: "supports" }] });
  lines.splice(0, 1, "references:", `  - rel: cites`, `    target: ${DOC}`, `    status: confirmed`, `    note: ""`,
    `  - rel: cites`, `    target: ${DOC2}`, `    status: severed`, `    note: ""`);
  const s = setup({ lines });
  const r = conclude(s, { reading: WORDS, falsifier: "f" });
  assert.equal(r.ok, true, JSON.stringify(r).slice(0, 400));
  assert.deepEqual(read(s).versions[0].legs.map((l) => l.target_id), [DOC]);
});

test("R51, R49: the machine-passage read is asked once over the legs the version copies, the acting member as author", () => {
  const w = setup();
  const p = project(w);
  const calls = [];
  w.bv.onMachinePassage("run-productions", (a) => { calls.push(a); return null; });
  const r = conclude(w, { project: p, reading: WORDS, falsifier: "f" });
  assert.equal(r.ok, true, JSON.stringify(r).slice(0, 300));
  assert.equal(calls.length, 1);
  assert.deepEqual([calls[0].author, calls[0].legs.map((l) => [l.version, l.target])], [ALICE, [["reading-1", DOC], ["reading-1", DOC2]]]);
  /* control: a refusal from the read refuses the act and writes nothing */
  const w2 = setup();
  const p2 = project(w2);
  w2.bv.onMachinePassage("run-productions", () => ({ ok: false, reason: "MACHINE_PASSAGE_NOT_TAKEN_UP" }));
  const base = [w2.sha(Q), w2.sha(p2)];
  const refused = conclude(w2, { project: p2, reading: WORDS, falsifier: "f" });
  assert.deepEqual([refused.ok, refused.reason], [false, "MACHINE_PASSAGE_NOT_TAKEN_UP"]);
  assert.deepEqual([w2.sha(Q), w2.sha(p2)], base);
  const pv = conclude(w2, { project: p2, reading: WORDS, falsifier: "f", preview: true });
  assert.equal(pv.reason, "MACHINE_PASSAGE_NOT_TAKEN_UP", "a preview asks the read directly");
});

test("R51: a project not joined by the actor, and a project the actor cannot see, are refused as a conclusion is; nothing is written", () => {
  const w = setup();
  const bos = w.project("Bo", "bo", [Q]);
  const base = [w.sha(Q), w.sha(bos)];
  assert.equal(conclude(w, { project: bos, reading: WORDS, falsifier: "f", viewer: "class:admin" }).reason, "PROJECT_ACT_NOT_A_PARTICIPANT");
  assert.equal(conclude(w, { project: "PROJ-2026-0404-none", reading: WORDS, falsifier: "f" }).reason, "NOT_A_PROJECT");
  assert.deepEqual([w.sha(Q), w.sha(bos)], base);
});

test("R51, R3: a question with a supporting leg in a part and a leg cutting against with no ground concludes on its own reading, the cutting leg carried and placed in no part", () => {
  const w = setup({ lines: [...block({ basis: [{ target: DOC, role: "supports", ground: "the minutes" }, { target: DOC2, role: "cuts_against" }],
                                       refs: [DOC, DOC2] }), ...GROUNDS.slice(0, 4)] });
  const r = conclude(w, { reading: WORDS, falsifier: "the minutes say otherwise" });
  assert.equal(r.ok, true, JSON.stringify(r).slice(0, 500));
  const [v] = read(w).versions;
  assert.deepEqual(v.legs.map((l) => [l.target_id, l.role, l.ground]), [[DOC, "supports", "the minutes"], [DOC2, "cuts_against", ""]]);
  assert.equal(v.parts.length, 1);
  assert.equal(fmOf(w, Q).current_state, "concluded");
});

test("R51, R3: a question whose legs carry no ground and one of them cuts against concludes on one part holding the supporting leg only", () => {
  const w = setup({ lines: block({ basis: [{ target: DOC, role: "supports" }, { target: DOC2, role: "cuts_against" }], refs: [DOC, DOC2] }) });
  const r = conclude(w, { reading: WORDS, falsifier: "the minutes say otherwise" });
  assert.equal(r.ok, true, JSON.stringify(r).slice(0, 500));
  const [v] = read(w).versions;
  assert.deepEqual(v.legs.map((l) => [l.target_id, l.role, l.ground]), [[DOC, "supports", "g1"], [DOC2, "cuts_against", ""]]);
});

/* R58 (fix round 10, cause 23; K5056): a version's leg keeps every extent field its citation carries. Each case is a leg
   of the question as a member cites it; the extent's own fields reach `basis_version_legs` and `basisVersions`. */
const BOOK = "INFO-2026-0003-book", TBL = "INFO-2026-0004-tbl", PRT = "INFO-2026-0005-part", IMG = "INFO-2026-0006-img";
const SHEET = "INFO-2026-0007-sheet", PNG = "a".repeat(64);
const R58_CASES = [
  ["sheet-range", { target: BOOK, extent_kind: "sheet-range", extent_sheet: "csv", extent_range: "A2:E2" }],
  ["doc-table", { target: TBL, extent_kind: "doc-table", extent_table: 0, extent_cell: "A1" }],
  ["doc-part", { target: PRT, extent_kind: "doc-part", extent_part: "word/footnotes.xml" }],
  ["cited_as", { target: IMG, extent_kind: "image", extent_part: PNG, extent_cited_as: "bytes" }],
];
function setup58(legs, { held = null } = {}) {
  const w = world();
  w.member("alice");
  const facts = { [BOOK]: { captureFormat: "xlsx", containerExtent: { container: "xlsx", levels: ["sheets"], images: [], sheets: [{ name: "csv", rows: 99, cols: 9 }] } },
                  [TBL]: { captureFormat: "docx", containerExtent: { container: "docx", levels: ["paragraphs", "tables"], paragraphs: 3, tables: [{ rows: 2, cols: 3 }], images: [] } },
                  [PRT]: { captureFormat: "docx", containerExtent: { container: "docx", levels: ["paragraphs"], paragraphs: 3, images: [] } },
                  [IMG]: { captureFormat: "docx", containerExtent: { container: "docx", levels: ["images"], images: [{ part: PNG, mime: "image/png" }] } },
                  [SHEET]: { captureFormat: "xlsx", containerExtent: { container: "xlsx", levels: ["sheets"], images: [], sheets: [{ name: "csv", rows: 99, cols: 9 }] } },
                  [DOC]: {} };
  for (const [id, f] of Object.entries(facts)) { const cap = w.doc(id); Object.assign(w.readings[cap], f); }
  const basis = legs.map((l) => ({ role: "supports", ...l }));
  const r = w.inquiry(Q, block(held ? { versions: held.versions, grounds: held.grounds, legs: held.legs, refs: held.legs.map((l) => l.target) }
                                    : { basis, refs: legs.map((l) => l.target) }));
  assert.equal(r.ok, true, JSON.stringify(r).slice(0, 400));
  return w;
}
const extentOf = (l) => Object.fromEntries(Object.entries(l).filter(([k]) => k.startsWith("extent_") && k !== "extent_capture"));

/* the document's version leg keeps each field; the answer's leg names its part by `content_id` (R38 has no extent
   columns), the row of exactly the extent the citation carries */
function keepsExtent(w, leg) {
  const held = fmOf(w, Q).basis_version_legs.find((l) => l.target === leg.target);
  for (const [k, val] of Object.entries(extentOf(leg))) assert.equal(String(held[k]), String(val), `${k} in basis_version_legs`);
  const [v] = read(w).versions;
  const got = v.legs.find((l) => l.target_id === leg.target);
  const row = w.content.contentRow(got.content_id).extent;
  for (const [k, val] of Object.entries(citationExtent(leg))) assert.equal(row[k], val, `${k} of the part the answer's leg names`);
}

for (const [kind, leg] of R58_CASES)
  test(`R58: a ${kind} leg of the question keeps every extent field its citation carries through conclude, in basis_version_legs and in the basisVersions answer`, () => {
    const w = setup58([leg, { target: DOC }]);
    const r = conclude(w, { reading: WORDS, falsifier: "the minutes say otherwise" });
    assert.equal(r.ok, true, JSON.stringify(r).slice(0, 600));
    keepsExtent(w, leg);
    assert.equal(w.count("inquiry_basis_version_legs"), 2);
  });

test("R58 control: a doc-para leg concludes as before and keeps its paragraph and run", () => {
  const leg = { target: DOC, extent_kind: "doc-para", extent_para: 1, extent_run: 0 };
  const w = setup58([leg]);
  const r = conclude(w, { reading: WORDS, falsifier: "the minutes say otherwise" });
  assert.equal(r.ok, true, JSON.stringify(r).slice(0, 600));
  keepsExtent(w, leg);
});

const R58_LEGS = R58_CASES.map(([, l]) => l);

test("R58: the same legs composed by appendVersion keep every extent field, in basis_version_legs and in the part each names", () => {
  const w = setup58(R58_LEGS);
  const r = w.bv.appendVersion({ target: Q, author: MACHINE, at: NOW,
    version: { name: "composed", description: "a machine run proposes this", relationship: "and", author: MACHINE },
    grounds: [{ ground: "main", asserted_by: ALICE, at: NOW }], legs: R58_LEGS.map((l) => ({ ...l, role: "supports", ground: "main" })) });
  assert.equal(r.ok, true, JSON.stringify(r).slice(0, 600));
  for (const leg of R58_LEGS) {
    const held = fmOf(w, Q).basis_version_legs.find((l) => l.version === "composed" && l.target === leg.target);
    for (const [k, val] of Object.entries(extentOf(leg))) assert.equal(String(held[k]), String(val), `${k} of ${leg.extent_kind}`);
    const got = read(w).versions.find((v) => v.name === "composed").legs.find((l) => l.target_id === leg.target);
    const row = w.content.contentRow(got.content_id).extent;
    for (const [k, val] of Object.entries(citationExtent(leg))) assert.equal(row[k], val, `${k} of the part ${leg.extent_kind} names`);
  }
});

test("R58: narrow copies every other leg with all of its extent fields and takes a sheet-range part as the narrowing", () => {
  const legs = [...R58_LEGS.map((l) => ({ version: "first", ...l, role: "supports", ground: "main" })),
                { version: "first", target: SHEET, role: "supports", ground: "main", extent_kind: "document" }];
  const v = version("first", []);
  const w = setup58(R58_LEGS, { held: { versions: v.versions, grounds: [{ version: "first", ground: "main", asserted_by: ALICE, at: "2026-09-27T00:00:00Z" }], legs } });
  const r = w.bv.narrow({ target: Q, version: "first", ord: 4, author: ALICE, viewer: V("alice"), name: "narrowed",
    description: "points at the one row, where the vote is recorded",
    extent: { extent_kind: "sheet-range", extent_sheet: "csv", extent_range: "A2:E2" } });
  assert.equal(r.ok, true, JSON.stringify(r).slice(0, 600));
  for (const leg of R58_LEGS) {
    const held = fmOf(w, Q).basis_version_legs.find((l) => l.version === "narrowed" && l.target === leg.target);
    for (const [k, val] of Object.entries(extentOf(leg))) assert.equal(String(held[k]), String(val), `${k} of ${leg.extent_kind} kept by narrow`);
  }
  const narrowedLeg = fmOf(w, Q).basis_version_legs.find((l) => l.version === "narrowed" && l.target === SHEET);
  assert.deepEqual([narrowedLeg.extent_kind, narrowedLeg.extent_sheet, narrowedLeg.extent_range], ["sheet-range", "csv", "A2:E2"]);
  assert.deepEqual(w.content.contentRow(r.narrowed.to.content_id).extent.range, "A2:E2");
});

test("R51, R3 (K5077): a question of one labelled ground and one unlabelled supporting leg concludes on its own reading — the unlabelled leg is a necessary leg of the version, copied as it stands, and no part is left incomplete", () => {
  const w = setup({ lines: [...block({ basis: [{ target: DOC, role: "supports", ground: "the minutes" }, { target: DOC2, role: "supports" }],
                                       refs: [DOC, DOC2] }), ...GROUNDS.slice(0, 4)] });
  const p = project(w);
  const r = conclude(w, { project: p, reading: WORDS, falsifier: "the minutes say otherwise" });
  assert.equal(r.ok, true, JSON.stringify(r).slice(0, 500));
  const [v] = read(w, { project: p }).versions;
  assert.deepEqual(v.legs.map((l) => [l.target_id, l.role, l.ground]), [[DOC, "supports", "the minutes"], [DOC2, "supports", ""]]);
  assert.deepEqual([v.state, v.parts, v.relationship], ["accepted", ["the minutes"], "and"]);
  assert.equal(w.count("inquiry_basis_version_legs"), 2);
});
