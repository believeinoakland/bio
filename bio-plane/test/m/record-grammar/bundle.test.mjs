/* record-grammar at its interface: `checkBundle` with its structural arms, and the grammars seam its type arms are
   filled through (R28; draft-T19 rule 2). The structural arms are compared with the check catalogue's own `checkBundle`
   as it stood before the move: `fixtures/expected.json` holds its findings over `fixtures/bundles.mjs`, every type arm
   claimed by the same stub grammars, so content, ids, severities and order must be identical. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { checkBundle, EXTENSION_ARMS } from "../../../src/record-grammar/index.mjs";
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

test("R39 the default knownSchemas are the fifteen stamps; a passed list replaces them; elidedPaths as a Set or a list", async () => {
  const STAMPS = ["information@1", "information@2", "inquiry@1", "focus@1", "problem@1", "project@1", "action@1", "bias@1",
    "standard@1", "determination@1", "consequence@1", "escalation@1", "aspiration@1", "goal@1", "action_plan@1"];
  const base = fixtures()["clean information"];
  const at = (schema, opts) => {
    const type = schema.split("@")[0];
    const text = base.files.get("bundle.md").replace("object_type: information", `object_type: ${type}`)
      .replace("schema: information@1", `schema: ${schema}`).replace("id: INFO-", `id: ${prefix(type)}-`);
    return checkBundle({ ...base, folderName: `${prefix(type)}-2026-0001-a`, files: new Map([["bundle.md", text]]) }, opts);
  };
  const prefix = (t) => ({ information: "INFO", inquiry: "INQ", focus: "FOCUS", problem: "PROB", project: "PROJ", action: "ACTN",
    bias: "BIAS", standard: "STD", determination: "CONF", consequence: "CONS", escalation: "ESC", aspiration: "ASP", goal: "GOAL",
    action_plan: "PLN" })[t];
  const unknown = (r) => r.findings.some((f) => f.check === "C-2.5" && /not known to this check catalog/.test(f.message));
  for (const s of STAMPS) assert.equal(unknown(await at(s)), false, s);
  for (const s of ["information@3", "inquiry@2", "action_plan@2"]) assert.equal(unknown(await at(s)), true, s);
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
