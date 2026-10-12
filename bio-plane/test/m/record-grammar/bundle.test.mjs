/* record-grammar at its interface: `checkBundle` with its structural arms, and the grammars seam its type arms are
   filled through (R28; draft-T19 rule 2). The structural arms are compared with the check catalogue's own `checkBundle`
   as it stood before the move: `fixtures/expected.json` holds its findings over `fixtures/bundles.mjs`, every type arm
   claimed by the same stub grammars, so content, ids, severities and order must be identical. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { checkBundle, EXTENSION_ARMS, idDisagrees } from "../../../src/record-grammar/index.mjs";
import { fixtures, STUBS, sha256, NOW } from "./fixtures/bundles.mjs";

const EXPECTED = JSON.parse(readFileSync(new URL("./fixtures/expected.json", import.meta.url), "utf8"));
const run = (b, grammars = STUBS) => checkBundle(b, { grammars, ...(b.knownSchemas ? { knownSchemas: b.knownSchemas } : {}) });

test("R40 checkBundle: the structural arms give the catalogue's findings, identical in content, ids, severities and order", async () => {
  const all = fixtures();
  assert.deepEqual(Object.keys(all).sort(), Object.keys(EXPECTED).sort());
  for (const [name, b] of Object.entries(all)) assert.deepEqual(await run(b), EXPECTED[name], name);
  /* The fixtures reach every structural id the move carries. */
  const ids = new Set(Object.values(EXPECTED).flatMap((r) => r.findings.map((f) => f.check)));
  for (const id of ["C-1.1", "C-1.2", "C-1.3", "C-2.1", "C-2.2", "C-2.3", "C-2.4", "C-2.5", "C-2.6", "C-3.1", "C-4.1", "C-4.2",
    "C-5.1", "C-6.1", "C-6.2", "C-12.1", "C-12.2", "C-13.1", "C-13.2", "C-14.1", "C-14.2", "C-14.3", "C-14.4",
    "C-16.1", "C-16.2", "C-16.3", "C-16.4", "C-16.5", "C-17.1"]) assert.ok(ids.has(id), id);
});

test("R40 C-6.3's workproduct_state arm is retired: a distributed project with no distributions is no finding (K904, N456)", async () => {
  for (const [name, b] of Object.entries(fixtures())) assert.ok(!(await run(b)).findings.some((f) => f.check === "C-6.3"), name);
  const r = await run(fixtures()["C-6.3 retired: a distributed project with no distributions is no finding"]);
  assert.equal(r.pass, true);
  assert.deepEqual(r.findings.filter((f) => f.severity !== "info"), []);
});

test("R35 R40 the project machine at checkBundle: forming and closed legal, investigating and matured read as legal, any other state C-4.1", async () => {
  const F = fixtures();
  for (const name of ["clean project", "clean closed project", "C-4.1 project legacy states are readable", "C-4.1 project matured is readable"])
    assert.ok(!(await run(F[name])).findings.some((f) => f.check === "C-4.1"), name);
  const r = await run(F["C-4.1 project state outside its machine"]);
  assert.deepEqual(r.findings.filter((f) => f.check === "C-4.1").map((f) => f.message),
    ["current_state 'published' is not legal for project (legal: forming, closed)"]);
});

test("R40 N458: C-13.2's and C-16.1's messages say record, not bundle", async () => {
  const F = fixtures();
  const msgs = [...(await run(F["C-13.2 updated without a session entry"])).findings, ...(await run(F["C-16 package checks"])).findings]
    .filter((f) => f.check === "C-13.2" || f.check === "C-16.1").map((f) => f.message);
  assert.ok(msgs.includes("record has been updated but carries no Session Log entry"));
  assert.ok(msgs.includes("manifest target 'INFO-2026-0003-c' does not match record 'INFO-2026-0001-a'"));
  for (const m of msgs) assert.doesNotMatch(m, /\bbundle\b(?!\.md)/, m);
});

test("R39 R40 checkBundle: pass is false exactly when a finding is an error; the answer is {pass, findings}", async () => {
  for (const [name, b] of Object.entries(fixtures())) {
    const r = await run(b);
    assert.deepEqual(Object.keys(r).sort(), ["findings", "pass"], name);
    assert.equal(r.pass, !r.findings.some((f) => f.severity === "error"), name);
  }
});

test("R28 EXTENSION_ARMS: a frozen list of frozen {name, ids}, in checkBundle's order, no id in two entries", () => {
  assert.ok(Object.isFrozen(EXTENSION_ARMS));
  assert.deepEqual(EXTENSION_ARMS.map((a) => [a.name, [...a.ids]]), [
    ["checkInformationExtension", ["C-2.7"]],
    ["checkInfo2Contract", ["C-18.6", "C-18.7"]],
    ["checkSupersession", ["C-6.1"]],
    ["checkRecheckCoverage", ["C-15.1"]],
    ["checkInquiryExtension", ["C-2.8"]],
    ["checkProjectExtension", ["C-2.9"]]]);
  for (const a of EXTENSION_ARMS) {
    assert.ok(Object.isFrozen(a) && Object.isFrozen(a.ids), a.name);
    assert.deepEqual(Object.keys(a), ["name", "ids"]);
  }
  const ids = EXTENSION_ARMS.flatMap((a) => a.ids);
  assert.equal(new Set(ids).size, ids.length);
  assert.throws(() => { EXTENSION_ARMS.push({}); }, TypeError);
  assert.throws(() => { EXTENSION_ARMS[0].ids.push("C-1.1"); }, TypeError);
});

/* One bundle, each arm's grammar leaving its own marker, and `checkReferences` a finding of its own (C-6.1). */
const placed = () => fixtures()["type arms in their places"];
const mark = (module, ids, check = ids[0]) => ({ module, ids, arm: (ctx, f) => { f.push({ check, severity: "info", message: module }); } });
const ARMS = () => [mark("information", ["C-2.7"]), mark("info2", ["C-18.7", "C-18.6"]), mark("sup", ["C-6.1"]), mark("recheck", ["C-15.1"]), mark("inq", ["C-2.8"]),
  mark("proj", ["C-2.9"])];

test("R28 R39 R40 a grammar claiming an arm's whole id list runs in that arm's place, over the same context; unclaimed ones after", async () => {
  const late = mark("later", ["C-500.1"]);
  const r = await checkBundle(placed(), { grammars: [late, ...ARMS().reverse()] });
  assert.deepEqual(r.findings.map((f) => f.message), ["information", "info2", r.findings[2].message, "sup", "recheck", "inq",
    "proj", "later"]);
  assert.equal(r.findings[2].check, "C-6.1");
  assert.match(r.findings[2].message, /closed vocabulary/);
  /* Every arm sees the parsed document and the files: the one context. */
  const seen = [];
  const spy = (module, ids) => ({ module, ids, arm: (ctx) => { seen.push([module, ctx.fm.id, ctx.files.has("bundle.md"), typeof ctx.body]); } });
  await checkBundle(placed(), { grammars: EXTENSION_ARMS.map((a) => spy(a.name, [...a.ids])) });
  assert.deepEqual(seen, EXTENSION_ARMS.map((a) => [a.name, "INFO-2026-0001-a", true, "string"]));
  /* A grammar claiming C-9.1 beside C-2.9 (intent's claim until its L7 job) still fills the project slot whole, in its place. */
  const r2 = await checkBundle(placed(), { grammars: [late, ...ARMS().slice(0, 5), mark("proj", ["C-9.1", "C-2.9"])] });
  assert.deepEqual(r2.findings.map((f) => f.message).slice(-2), ["proj", "later"]);
});

test("R28 R39 an arm no grammar claims runs nothing: no type grammar is built in", async () => {
  /* An inquiry concluded on nothing, a supersedes edge with no reason, no recheck trigger, a project ladder: each is a type
     arm's finding, and none is raised without its grammar. */
  const fm = fixtures()["clean inquiry"];
  const text = fm.files.get("bundle.md").replace("current_state: open", "current_state: concluded")
    .replace(/recheck_triggers:\n  - text: t\n    description: d\n/, "")
    .replace("references:\n", "references:\n  - rel: supersedes\n    target: INQ-2026-0009-z\n    status: confirmed\n");
  const b = { ...fm, files: new Map([...fm.files, ["bundle.md", text]]) };
  const r = await checkBundle(b);
  assert.deepEqual(r.findings.filter((f) => ["C-2.8", "C-6.1", "C-15.1", "C-2.9", "C-9.1", "C-18.6", "C-18.7", "C-2.7"].includes(f.check)), []);
  /* With the arms claimed, they are what runs. */
  const r2 = await checkBundle(b, { grammars: ARMS() });
  assert.deepEqual(r2.findings.filter((f) => f.severity === "info").map((f) => f.message), ["information", "info2", "sup", "recheck",
    "inq", "proj"]);
});

test("R28 R39 a malformed grammar list, a part claim, a two-arm claim or an id claimed twice throws before any arm runs", async () => {
  let ran = 0;
  const g = (module, ids) => ({ module, ids, arm: () => { ran++; } });
  const bad = [
    [{}, TypeError], ["x", TypeError], [[null], TypeError], [[{ ids: ["C-1.1"], arm() {} }], TypeError],
    [[{ module: " ", ids: ["C-1.1"], arm() {} }], TypeError], [[{ module: "m", ids: [], arm() {} }], TypeError],
    [[{ module: "m", ids: ["X-1"], arm() {} }], TypeError], [[{ module: "m", ids: ["C-1.1"] }], TypeError],
    [[g("m", ["C-18.6"])], RangeError], [[g("m", ["C-2.9", "C-15.1"])], RangeError], [[g("m", ["C-2.8", "C-6.1"])], RangeError], [[g("m", ["C-2.7", "C-18.6", "C-18.7"])], RangeError],
    [[g("a", ["C-500.1"]), g("b", ["C-500.1"])], RangeError], [[g("a", ["C-2.8"]), g("b", ["C-2.8"])], RangeError],
  ];
  for (const [grammars, E] of bad) await assert.rejects(checkBundle(placed(), { grammars }), E, JSON.stringify(grammars));
  assert.equal(ran, 0);
  /* Absent or null is no grammar at all. */
  for (const grammars of [undefined, null]) assert.equal((await checkBundle(placed(), { grammars })).pass, false);
});

test("R39 checkBundle: the injected sha256, nowMs and package age are what it reads; files may be strings or bytes", async () => {
  const b = fixtures()["C-17.1 fast-forward"];
  const bytes = new Map([...b.files].map(([k, v]) => [k, new TextEncoder().encode(v)]));
  assert.deepEqual(await run({ ...b, files: bytes }), EXPECTED["C-17.1 fast-forward"]);
  let calls = 0;
  const counted = async (v) => { calls++; return sha256(v); };
  await run({ ...b, sha256: counted });
  assert.ok(calls >= 2);
  /* A package one day inside the policy at NOW is old fourteen days later. */
  const young = fixtures()["C-17.1 divergence"];
  assert.ok(!(await run(young)).findings.some((f) => f.check === "C-16.3"));
  assert.ok((await run({ ...young, nowMs: NOW + 15 * 86400000 })).findings.some((f) => f.check === "C-16.3"));
  assert.ok((await run({ ...young, maxPackageAgeDays: 1 })).findings.some((f) => f.check === "C-16.3"));
});

test("R39 R62 the default knownSchemas are the sixteen stamps, success_record@1 among them; a passed list replaces them; elidedPaths as a Set or a list", async () => {
  const STAMPS = ["information@1", "information@2", "inquiry@1", "focus@1", "problem@1", "project@1", "action@1", "bias@1",
    "standard@1", "determination@1", "consequence@1", "escalation@1", "aspiration@1", "goal@1", "action_plan@1", "success_record@1"];
  assert.equal(STAMPS.length, 16);
  const base = fixtures()["clean information"];
  const at = (schema, opts) => {
    const type = schema.split("@")[0];
    const text = base.files.get("bundle.md").replace("object_type: information", `object_type: ${type}`)
      .replace("schema: information@1", `schema: ${schema}`).replace("id: INFO-", `id: ${prefix(type)}-`);
    return checkBundle({ ...base, folderName: `${prefix(type)}-2026-0001-a`, files: new Map([["bundle.md", text]]) }, opts);
  };
  const prefix = (t) => ({ information: "INFO", inquiry: "INQ", focus: "FOCUS", problem: "PROB", project: "PROJ", action: "ACTN",
    bias: "BIAS", standard: "STD", determination: "CONF", consequence: "CONS", escalation: "ESC", aspiration: "ASP", goal: "GOAL",
    action_plan: "PLN", success_record: "SUC" })[t];
  const unknown = (r) => r.findings.some((f) => f.check === "C-2.5" && /not known to this check catalog/.test(f.message));
  for (const s of STAMPS) assert.equal(unknown(await at(s)), false, s);
  for (const s of ["information@3", "inquiry@2", "action_plan@2", "success_record@2", "success_record@0"]) assert.equal(unknown(await at(s)), true, s);
  /* A passed list without the stamp refuses it, so the default is what admits it. */
  assert.equal(unknown(await at("success_record@1", { knownSchemas: STAMPS.slice(0, 15) })), true);
  assert.equal(unknown(await at("information@1", { knownSchemas: ["information@2"] })), true);
  assert.equal(unknown(await at("information@2", { knownSchemas: ["information@2"] })), false);
  const e = fixtures()["C-12.2 elided snapshots count as present"];
  assert.deepEqual(await run({ ...e, elidedPaths: new Set(e.elidedPaths) }), EXPECTED["C-12.2 elided snapshots count as present"]);
  assert.ok((await run({ ...e, elidedPaths: undefined })).findings.some((f) => f.check === "C-12.2"));
});

test("R39 with no bundle.md, one C-13.1 error and no document arm; format hygiene and the queue still run", async () => {
  const r = await checkBundle({ folderName: "INFO-2026-0001-a", files: new Map([["bad name.txt", "x"]]), sha256, nowMs: NOW },
    { grammars: ARMS() });
  assert.deepEqual(r.findings.map((f) => f.check), ["C-13.1", "C-14.2"]);
  assert.equal(r.findings[0].message, "bundle.md is missing");
  assert.equal(r.pass, false);
});

/* T40 (N809, K2390): an `object_type` that names no type of R3 by its own key is an unknown type, an inherited name of
   `Object.prototype` included, and `checkBundle` answers it as it answers `memo`: never a throw. */
test("R39 an object_type naming no type by its own key (toString, constructor, __proto__, every Object.prototype name) is an unknown type, answered as memo is; checkBundle never throws for it", async () => {
  const base = fixtures()["clean information"];
  const withType = (type, prefix = "INFO") => {
    const text = base.files.get("bundle.md").replace("object_type: information", `object_type: ${type}`)
      .replace("id: INFO-", `id: ${prefix}-`);
    return run({ ...base, folderName: `${prefix}-2026-0001-a`, files: new Map([["bundle.md", text]]) });
  };
  /* The answer to an unknown type with the bytes held otherwise equal: `memo` is the model, its message the only change. */
  const memo = await withType("memo");
  assert.deepEqual(memo.findings.filter((f) => f.check === "C-2.5").map((f) => f.message), ["object_type 'memo' is not a known type"]);
  assert.equal(memo.pass, false);
  const like = (r, t) => ({ ...r, findings: r.findings.map((f) => (f.check === "C-2.5" ? { ...f, message: f.message.replace(`'${t}'`, "'memo'") } : f)) });
  const NAMES = ["toString", "constructor", "__proto__", ...Object.getOwnPropertyNames(Object.prototype)];
  for (const t of NAMES) {
    const r = await withType(t);
    assert.deepEqual(like(r, t), memo, t);
    assert.deepEqual(r.findings.filter((f) => f.check === "C-2.5").map((f) => f.message), [`object_type '${t}' is not a known type`], t);
    /* No heading arm and no state arm runs for it, as for any unknown type. */
    assert.ok(!r.findings.some((f) => ["C-3.1", "C-4.1", "C-4.2"].includes(f.check)), t);
  }
  /* Under every bundle prefix, too: the id's implied type is never an inherited value. */
  for (const p of ["PROB", "INQ", "PROJ", "BIAS", "PLN"]) for (const t of ["toString", "constructor", "__proto__"]) {
    const r = await withType(t, p);
    assert.deepEqual(r.findings.filter((f) => f.check === "C-2.5").map((f) => f.message), [`object_type '${t}' is not a known type`], `${p} ${t}`);
  }
  /* Negative control: a known type still checks, its heading and state arms running (and a legacy spelling read through
     its own table). */
  const known = await withType("information");
  assert.deepEqual(known, EXPECTED["clean information"]);
  const project = fixtures()["C-4.1 project state outside its machine"];
  assert.ok((await run(project)).findings.some((f) => f.check === "C-4.1"));
  const missing = await run(fixtures()["C-3.1 missing and extra headings"]);
  assert.ok(missing.findings.some((f) => f.check === "C-3.1"));
  const legacy = await run(fixtures()["legacy problem spelling"]);
  assert.deepEqual(legacy, EXPECTED["legacy problem spelling"]);
  assert.ok(legacy.findings.some((f) => f.message === "required heading '## Statement' is missing"), "judged by focus's headings");
  assert.ok(!legacy.findings.some((f) => ["C-2.5", "C-4.1"].includes(f.check)));
});

/* T43 (N854; K231, K2625): `idDisagrees` is the one C-1.1 judgment, which `checkBundle` and the write door (promotion R38)
   both run: a string id not equal, byte for byte, to the folder name. */
test("R56 idDisagrees(fm, folderName): true exactly when fm.id is a string not equal byte for byte to folderName; checkBundle's C-1.1 is that answer", async () => {
  const ID = "INFO-2026-0001-a";
  /* Negative control: an exact id is not refused. */
  assert.equal(idDisagrees({ id: ID }, ID), false);
  /* A padded id is refused: no trimming, on either side, of any white space. */
  for (const pad of [` ${ID}`, `${ID} `, `\t${ID}`, `${ID}\n`, ` ${ID}`, `${ID}\r`]) assert.equal(idDisagrees({ id: pad }, ID), true, JSON.stringify(pad));
  assert.equal(idDisagrees({ id: ID }, ` ${ID}`), true);
  /* Any other byte difference: case, another id, the empty string, a lookalike letter. */
  for (const other of [ID.toUpperCase(), "INFO-2026-0002-a", "", "INFO-2026-0001-a-b", "INFO-2026-0001-а"]) assert.equal(idDisagrees({ id: other }, ID), true, other);
  /* A non-string id is not this arm's (C-1.2 refuses it), nor is an absent id or front matter. */
  for (const id of [undefined, null, 20260001, true, [ID], { toString: () => ID }, new String(ID)]) assert.equal(idDisagrees({ id }, ID), false, String(id));
  for (const fm of [undefined, null, {}, { title: ID }]) assert.equal(idDisagrees(fm, ID), false, JSON.stringify(fm));
  /* checkBundle raises C-1.1 exactly when idDisagrees answers true, over the same bytes. */
  const base = fixtures()["clean information"];
  const cases = [[ID, ID], [` ${ID}`, ID], [`${ID} `, ID], [ID, ` ${ID}`], ["INFO-2026-0002-a", ID], [ID.toUpperCase(), ID]];
  let refused = 0;
  for (const [id, folderName] of cases) {
    const text = base.files.get("bundle.md").replace(`id: ${ID}`, `id: "${id}"`);
    assert.notEqual(text, base.files.get("bundle.md"));
    const r = await run({ ...base, folderName, files: new Map([...base.files, ["bundle.md", text]]) });
    const c11 = r.findings.filter((f) => f.check === "C-1.1");
    assert.equal(c11.length, idDisagrees({ id }, folderName) ? 1 : 0, JSON.stringify([id, folderName]));
    if (c11.length) { refused++; assert.equal(c11[0].message, `folder name '${folderName}' does not equal frontmatter id '${id}'`); }
  }
  assert.equal(refused, cases.length - 1);
  /* A non-string id draws C-1.2 and no C-1.1. */
  const num = base.files.get("bundle.md").replace(`id: ${ID}`, "id: 20260001");
  const rn = await run({ ...base, files: new Map([...base.files, ["bundle.md", num]]) });
  assert.ok(rn.findings.some((f) => f.check === "C-1.2"));
  assert.ok(!rn.findings.some((f) => f.check === "C-1.1"));
});

/* T47 (R62; N958, K3028): a success record's document, as `consequences` writes it (R24's `successDoc`, with the `group:`
   line promotion adds): a bare `SUC` id, `object_type: success_record`, `schema: success_record@1`, state `recorded`, and
   headings of its own. */
const SUC_NOW = Date.parse("2026-10-12T00:00:00Z");
const successDoc = ({ id = "SUC-2026-0001", type = "success_record", schema = `${type}@1`, state = "recorded", body } = {}) => [
  "---", `id: ${id}`, `object_type: ${type}`, `schema: ${schema}`, 'title: "success: the fee was refunded"',
  `current_state: ${state}`, "prior_state: null", 'created: "2026-10-01T00:00:00Z"', 'last_updated: "2026-10-01T00:00:00Z"',
  'project: "PROJ-2026-0001-a"', "supersedes: null", 'author: "alice"', "machine_work: false", "group: g",
  "produced_by:", "  mode: human", "  capability_tier: session", "references: []", "state_history: []", "annotations_open: 0",
  "reeval_pending:", "  flag: false", "  since: null", "  source: null", "visuals: []", "---", "",
  ...(body ?? ["## Success Record", "", "```json", '{"statement": "the fee was refunded"}', "```", "",
    "## Why It Was Revised", "", "a figure was wrong", "", "## Session Log", "", "### Session 2026-10-01T00:00:00Z | Recorded | alice",
    "Changes: success record recorded.", ""]),
].join("\n");
const checkSuccess = (o = {}, opts = {}) => checkBundle({ folderName: o.folderName ?? o.id ?? "SUC-2026-0001",
  files: new Map([["bundle.md", successDoc(o)]]), sha256, nowMs: SUC_NOW }, opts);
const checks = (r) => r.findings.map((f) => f.check);

test("R62 checkBundle admits a success_record document: a bare SUC id core under object_type success_record with success_record@1 raises no C-1.2 or C-2.5, no heading finding, its state judged by STATES; it passes", async () => {
  /* The document consequences writes passes whole: no finding at all. */
  const r = await checkSuccess();
  assert.deepEqual(r, { pass: true, findings: [] });
  /* Every SUC core consequences mints, the 10,000th and later included (R59), is admitted. */
  for (const id of ["SUC-2026-0000", "SUC-2026-0417", "SUC-2026-9999", "SUC-2026-10000", "SUC-1999-123456"])
    assert.deepEqual(checks(await checkSuccess({ id })), [], id);
  /* No required headings (R32): any body, an empty one or one carrying another type's headings, draws no C-3.1. */
  for (const body of [[], ["## Summary", "x"], ["## Anything At All", "", "## Session Log", "### Session 1"]])
    assert.ok(!checks(await checkSuccess({ body })).includes("C-3.1"), JSON.stringify(body));
  /* Its state is judged by its STATES entry (R59): recorded alone is legal. */
  for (const state of ["open", "published", "closed", "superseded"]) {
    const s = await checkSuccess({ state });
    assert.deepEqual(s.findings.filter((f) => f.check === "C-4.1").map((f) => f.message),
      [`current_state '${state}' is not legal for success_record (legal: recorded)`], state);
    assert.equal(s.pass, false);
  }
  /* The type is known to C-2.5 and the SUC prefix implies it: no C-2.5 for the document, and the default stamp admits it. */
  assert.ok(!checks(r).includes("C-2.5"));
  /* R1 is unchanged: SUC is no bundle prefix, so neither a reference target nor an annotation id takes a SUC id. */
  const { BUNDLE_ID_RE, ANN_ID_RE, HEADINGS } = await import("../../../src/record-grammar/index.mjs");
  for (const id of ["SUC-2026-0001", "SUC-2026-0001-a"]) assert.ok(!BUNDLE_ID_RE.test(id) && !ANN_ID_RE.test(`${id}.ann-20261001T000000Z-a`), id);
  assert.ok(!Object.hasOwn(HEADINGS, "success_record"));
});

test("R62 negative controls: a SUC id with a slug draws C-1.2; a SUC id under another object_type, success_record under another prefix, a SUC id of the wrong form, or another schema stamp is refused as before (C-1.2, C-2.5)", async () => {
  const only = async (o, want) => {
    const r = await checkSuccess(o);
    assert.deepEqual(checks(r).filter((c) => c === "C-1.2" || c === "C-2.5"), want, JSON.stringify(o));
    assert.equal(r.pass, false, JSON.stringify(o));
    return r;
  };
  /* The control R62 names: the same document with a slug after its id draws C-1.2, and nothing else of these. */
  const slug = await only({ id: "SUC-2026-0001-a" }, ["C-1.2"]);
  assert.equal(slug.findings[0].message, "frontmatter id 'SUC-2026-0001-a' does not match the canonical ID grammar");
  for (const id of ["SUC-2026-0001-success", "SUC-2026-10000-a-b"]) await only({ id }, ["C-1.2"]);
  /* A SUC id of any other form: too short a counter, an opaque tail, a short year, lower case, padding. */
  for (const id of ["SUC-2026-999", "SUC-2026-a1b2c3d4e5f6g7h8", "SUC-26-0001", "suc-2026-0001", "SUCC-2026-0001"])
    assert.ok(checks(await checkSuccess({ id })).includes("C-1.2"), id);
  /* A SUC id under another object_type: the id is not admitted (C-1.2) and the prefix implies success_record (C-2.5). */
  for (const type of ["consequence", "information", "standard", "action_plan"]) {
    const r = await only({ type }, ["C-1.2", "C-2.5"]);
    assert.ok(r.findings.some((f) => f.message === `id prefix 'SUC' implies 'success_record' but object_type is '${type}'`), type);
  }
  /* success_record under a bundle id of another prefix: that prefix implies its own type (C-2.5); under a bare core of
     another prefix, the id is not admitted either (C-1.2). */
  for (const [id, implied] of [["INFO-2026-0001-a", "information"], ["CONS-2026-0001-a", "consequence"], ["PLN-2026-0001-a", "action_plan"]]) {
    const r = await only({ id }, ["C-2.5"]);
    assert.ok(r.findings.some((f) => f.message === `id prefix '${id.split("-")[0]}' implies '${implied}' but object_type is 'success_record'`), id);
  }
  for (const id of ["CONS-2026-0001", "STD-2026-0001"]) await only({ id }, ["C-1.2", "C-2.5"]);
  /* A row prefix that is no bundle type's implies none, so the id alone is refused. */
  for (const id of ["HYP-2026-0001", "EVT-2026-a1b2c3d4e5f6g7h8"]) await only({ id }, ["C-1.2"]);
  /* Another stamp: the next version, or another type's. */
  for (const schema of ["success_record@2", "consequence@1", "success_record"]) await only({ schema }, ["C-2.5"]);
  /* A narrowed knownSchemas without the stamp refuses it, so the default list is what admits it (R39). */
  const narrowed = await checkSuccess({}, { knownSchemas: ["consequence@1"] });
  assert.deepEqual(narrowed.findings.map((f) => f.message), ["schema version 'success_record@1' is not known to this check catalog"]);
});
