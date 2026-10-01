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

test("checkBundle: the structural arms give the catalogue's findings, identical in content, ids, severities and order", async () => {
  const all = fixtures();
  assert.deepEqual(Object.keys(all).sort(), Object.keys(EXPECTED).sort());
  for (const [name, b] of Object.entries(all)) assert.deepEqual(await run(b), EXPECTED[name], name);
  /* The fixtures reach every structural id the move carries. */
  const ids = new Set(Object.values(EXPECTED).flatMap((r) => r.findings.map((f) => f.check)));
  for (const id of ["C-1.1", "C-1.2", "C-1.3", "C-2.1", "C-2.2", "C-2.3", "C-2.4", "C-2.5", "C-2.6", "C-3.1", "C-4.1", "C-4.2",
    "C-5.1", "C-6.1", "C-6.2", "C-6.3", "C-12.1", "C-12.2", "C-13.1", "C-13.2", "C-14.1", "C-14.2", "C-14.3", "C-14.4",
    "C-16.1", "C-16.2", "C-16.3", "C-16.4", "C-16.5", "C-17.1"]) assert.ok(ids.has(id), id);
});

test("checkBundle: pass is false exactly when a finding is an error; the answer is {pass, findings}", async () => {
  for (const [name, b] of Object.entries(fixtures())) {
    const r = await run(b);
    assert.deepEqual(Object.keys(r).sort(), ["findings", "pass"], name);
    assert.equal(r.pass, !r.findings.some((f) => f.severity === "error"), name);
  }
});

test("R28 EXTENSION_ARMS: a frozen list of frozen {name, ids}, in run order, no id in two entries, no C-2.7 arm", () => {
  assert.ok(Object.isFrozen(EXTENSION_ARMS));
  assert.deepEqual(EXTENSION_ARMS.map((a) => [a.name, [...a.ids]]), [
    ["checkInfo2Contract", ["C-18.6", "C-18.7"]],
    ["checkSupersession", ["C-6.1"]],
    ["checkRecheckCoverage", ["C-15.1"]],
    ["checkInquiryExtension", ["C-2.8"]],
    ["checkProjectExtension", ["C-2.9", "C-9.1"]]]);
  for (const a of EXTENSION_ARMS) {
    assert.ok(Object.isFrozen(a) && Object.isFrozen(a.ids), a.name);
    assert.deepEqual(Object.keys(a), ["name", "ids"]);
  }
  const ids = EXTENSION_ARMS.flatMap((a) => a.ids);
  assert.equal(new Set(ids).size, ids.length);
  assert.ok(!ids.includes("C-2.7") && !EXTENSION_ARMS.some((a) => a.name === "checkInformationExtension"));
  assert.throws(() => { EXTENSION_ARMS.push({}); }, TypeError);
  assert.throws(() => { EXTENSION_ARMS[0].ids.push("C-1.1"); }, TypeError);
});

/* One bundle, each arm's grammar leaving its own marker, and `checkReferences` a finding of its own (C-6.1). */
const placed = () => fixtures()["type arms in their places"];
const mark = (module, ids, check = ids[0]) => ({ module, ids, arm: (ctx, f) => { f.push({ check, severity: "info", message: module }); } });
const ARMS = () => [mark("info2", ["C-18.7", "C-18.6"]), mark("sup", ["C-6.1"]), mark("recheck", ["C-15.1"]), mark("inq", ["C-2.8"]),
  mark("proj", ["C-9.1", "C-2.9"])];

test("R28 a grammar claiming an arm's whole id list runs in that arm's place, over the same context; unclaimed ones after", async () => {
  const late = mark("later", ["C-500.1"]);
  const r = await checkBundle(placed(), { grammars: [late, ...ARMS().reverse()] });
  assert.deepEqual(r.findings.map((f) => f.message), ["info2", "references[0].rel 'knows' is not in the closed vocabulary",
    "sup", "recheck", "inq", "proj", "later"].map((m, i) => (i === 1 ? r.findings[1].message : m)));
  assert.equal(r.findings[1].check, "C-6.1");
  assert.match(r.findings[1].message, /closed vocabulary/);
  /* Every arm sees the parsed document and the files: the one context. */
  const seen = [];
  const spy = (module, ids) => ({ module, ids, arm: (ctx) => { seen.push([module, ctx.fm.id, ctx.files.has("bundle.md"), typeof ctx.body]); } });
  await checkBundle(placed(), { grammars: EXTENSION_ARMS.map((a) => spy(a.name, [...a.ids])) });
  assert.deepEqual(seen, EXTENSION_ARMS.map((a) => [a.name, "INFO-2026-0001-a", true, "string"]));
});

test("R28 an arm no grammar claims runs nothing: no type grammar is built in", async () => {
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
  assert.deepEqual(r2.findings.filter((f) => f.severity === "info").map((f) => f.message), ["info2", "sup", "recheck", "inq", "proj"]);
});

test("R28 a malformed grammar list, a part claim, a two-arm claim or an id claimed twice throws before any arm runs", async () => {
  let ran = 0;
  const g = (module, ids) => ({ module, ids, arm: () => { ran++; } });
  const bad = [
    [{}, TypeError], ["x", TypeError], [[null], TypeError], [[{ ids: ["C-1.1"], arm() {} }], TypeError],
    [[{ module: " ", ids: ["C-1.1"], arm() {} }], TypeError], [[{ module: "m", ids: [], arm() {} }], TypeError],
    [[{ module: "m", ids: ["X-1"], arm() {} }], TypeError], [[{ module: "m", ids: ["C-1.1"] }], TypeError],
    [[g("m", ["C-18.6"])], RangeError], [[g("m", ["C-2.9"])], RangeError], [[g("m", ["C-2.8", "C-6.1"])], RangeError],
    [[g("a", ["C-500.1"]), g("b", ["C-500.1"])], RangeError], [[g("a", ["C-2.8"]), g("b", ["C-2.8"])], RangeError],
  ];
  for (const [grammars, E] of bad) await assert.rejects(checkBundle(placed(), { grammars }), E, JSON.stringify(grammars));
  assert.equal(ran, 0);
  /* Absent or null is no grammar at all. */
  for (const grammars of [undefined, null]) assert.equal((await checkBundle(placed(), { grammars })).pass, false);
});

test("checkBundle: the injected sha256 and nowMs are what it reads; files may be strings or bytes", async () => {
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
