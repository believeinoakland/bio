/* capture R37 (C-2.7; K585 (3)): the information grammar, registered through record-core's grammar seam (its R67), at
   the module's interface: what `captureOf` registers, and that a bundle is judged identically with the registration
   and without it, through `checkBundle` given `record.grammars()` (what promotion's gate passes, its R27) and through
   record-core's audit (its R18). A fresh store per test; no network. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { storage, provenance } from "./fixture.mjs";
import { captureOf, MONITOR_FREQ, INFORMATION_GRAMMAR, checkInformationExtension } from "../../../src/capture/index.mjs";
import { recordOf } from "../../../src/record-core/index.mjs";
import { checkBundle, canonicalJson } from "../../../checks/bio-checks.mjs";

const hex = (v) => createHash("sha256").update(typeof v === "string" ? Buffer.from(v, "utf8") : Buffer.from(v)).digest("hex");
const T0 = "2026-07-01T00:00:00Z";

/* An information item's `bundle.md`: the core fields, then the information fields, each over-ridable (`undefined`
   drops a field), and the nested `source` and `monitoring` blocks unless a raw block is given. */
function infoDoc(id, over = {}) {
  const fields = { id, object_type: "information", schema: "information@1", title: "A report", current_state: "collected",
    prior_state: null, created: T0, last_updated: T0, group: "test-group", criticality: "supporting", source_status: "unchanged",
    ...over };
  const lines = ["---"];
  for (const [k, v] of Object.entries(fields)) {
    if (v === undefined || k === "source" || k === "monitoring") continue;
    lines.push(`${k}: ${v === null ? "null" : typeof v === "string" && /[:#"]/.test(v) ? JSON.stringify(v) : v}`);
  }
  const block = (name, dflt) => {
    const b = name in over ? over[name] : dflt;
    if (b === undefined) return;
    if (typeof b === "string") { lines.push(`${name}: ${b}`); return; }
    lines.push(`${name}:`);
    for (const [k, v] of Object.entries(b)) lines.push(`  ${k}: ${typeof v === "string" && /[:#"]/.test(v) ? JSON.stringify(v) : v}`);
  };
  block("source", { locator: "https://docs.example.org/report.pdf", authority: "publisher", retrieved: T0 });
  block("monitoring", { enabled: true, frequency: "weekly" });
  lines.push("---", "\n## Session Log\n");
  return lines.join("\n");
}

const dataset = JSON.stringify({ rows: [{ a: 1, b: "two" }] });
const goodHash = `sha256:${hex(canonicalJson(JSON.parse(dataset)))}`;
/* One bundle per arm of the grammar, and bundles it passes or does not judge. */
const CASES = {
  "INFO-2026-0001-clean": { "bundle.md": infoDoc("INFO-2026-0001-clean") },
  "INFO-2026-0002-enums": { "bundle.md": infoDoc("INFO-2026-0002-enums", { criticality: "vital", source_status: "gone" }) },
  "INFO-2026-0003-nosource": { "bundle.md": infoDoc("INFO-2026-0003-nosource", { source: undefined }) },
  "INFO-2026-0004-halfsource": { "bundle.md": infoDoc("INFO-2026-0004-halfsource", { source: { locator: "https://docs.example.org/r" } }) },
  "INFO-2026-0005-monitoring": { "bundle.md": infoDoc("INFO-2026-0005-monitoring", { monitoring: { enabled: "sometimes", frequency: "fortnightly" } }) },
  "INFO-2026-0006-nomonitoring": { "bundle.md": infoDoc("INFO-2026-0006-nomonitoring", { monitoring: undefined }) },
  "INFO-2026-0007-badhash": { "bundle.md": infoDoc("INFO-2026-0007-badhash", { content_hash: "md5:abc" }) },
  "INFO-2026-0008-mismatch": { "bundle.md": infoDoc("INFO-2026-0008-mismatch", { content_hash: `sha256:${"0".repeat(64)}` }),
                               "data/dataset.json": dataset },
  "INFO-2026-0009-hashok": { "bundle.md": infoDoc("INFO-2026-0009-hashok", { content_hash: goodHash }), "data/dataset.json": dataset },
  "INFO-2026-0010-verified": { "bundle.md": infoDoc("INFO-2026-0010-verified", { current_state: "verified", prior_state: "collected" }) },
  "INFO-2026-0011-changes": { "bundle.md": infoDoc("INFO-2026-0011-changes"),
                              "data/changes.json": JSON.stringify({ records: [{ detected: "yesterday", kind: "moved" }] }) },
  "INFO-2026-0012-changeshape": { "bundle.md": infoDoc("INFO-2026-0012-changeshape"), "data/changes.json": JSON.stringify([1, 2]) },
  "PROJ-2026-0001-notinfo": { "bundle.md": infoDoc("PROJ-2026-0001-notinfo", { object_type: "project", schema: "project@1",
                                                                               criticality: "vital", source: undefined }) },
};

const judge = async (id, image, opts) => {
  const files = new Map(Object.entries(image));
  const { findings } = await checkBundle({ folderName: id, files, elidedPaths: new Set(), sha256: async (v) => hex(v),
    sha512: async (b) => new Uint8Array(createHash("sha512").update(b).digest()), resolveTarget: (t) => t in CASES,
    releaseRegistry: null, publishedRegistry: null, publishedCaseRegistry: null, earnedRegistry: null }, opts);
  return findings;
};

function world() {
  const ctx = { storage: storage() };
  const record = recordOf(ctx);
  record.migrate();
  return { ctx, record };
}

test("R37 (C-2.7): captureOf registers the information grammar with record-core once per storage, claiming C-2.7 whole; MONITOR_FREQ is the grammar's cadence list", () => {
  const { ctx, record } = world();
  assert.deepEqual(record.grammars(), [], "nothing before capture is reached");
  const c = captureOf(ctx, { record, provenance: provenance(ctx.storage) });
  const g = record.grammars();
  assert.deepEqual(g.map((x) => [x.module, [...x.ids]]), [["capture", ["C-2.7"]]]);
  assert.equal(g[0].arm, checkInformationExtension, "the arm is this module's own");
  assert.deepEqual([[...INFORMATION_GRAMMAR.ids], INFORMATION_GRAMMAR.arm], [["C-2.7"], checkInformationExtension]);
  assert.equal(captureOf(ctx), c);
  assert.equal(record.grammars().length, 1, "reaching the instance again registers nothing more");
  assert.deepEqual([...MONITOR_FREQ], ["hourly", "daily", "weekly", "monthly", "per_meeting", "none"]);
  assert.ok(Object.isFrozen(MONITOR_FREQ));
  /* a record another module has already claimed C-2.7 on: the wiring's defect is loud, never a grammar silently unrun */
  const other = world();
  other.record.registerGrammar("elsewhere", { ids: ["C-2.7"], arm: () => {} });
  assert.throws(() => captureOf(other.ctx, { record: other.record, provenance: provenance(other.ctx.storage) }), /refused the information grammar: GRAMMAR_DECLARED/);
});

test("R37 (C-2.7): with the grammar registered, checkBundle given record.grammars() (the gate's list) judges every bundle exactly as the catalogue's own arm: the same findings, ids, severities, messages and order", async () => {
  const { ctx, record } = world();
  captureOf(ctx, { record, provenance: provenance(ctx.storage) });
  let judged = 0;
  for (const [id, image] of Object.entries(CASES)) {
    const builtIn = await judge(id, image);
    const registered = await judge(id, image, { grammars: record.grammars() });
    assert.deepEqual(registered, builtIn, id);
    if (builtIn.some((f) => f.check === "C-2.7")) judged++;
  }
  assert.ok(judged >= 10, `the cases exercise the grammar (${judged} bundles carry a C-2.7 finding)`);
  const clean = await judge("INFO-2026-0001-clean", CASES["INFO-2026-0001-clean"], { grammars: record.grammars() });
  assert.equal(clean.filter((f) => f.check === "C-2.7").length, 0, "a well-formed item raises no C-2.7");
  assert.equal((await judge("PROJ-2026-0001-notinfo", CASES["PROJ-2026-0001-notinfo"], { grammars: record.grammars() }))
    .filter((f) => f.check === "C-2.7").length, 0, "another type is not judged by it");
  /* the registered arm is the one that runs: a grammar standing in its place changes the findings */
  const decoy = [{ module: "decoy", ids: ["C-2.7"], arm: () => {} }];
  assert.equal((await judge("INFO-2026-0002-enums", CASES["INFO-2026-0002-enums"], { grammars: decoy })).some((f) => f.check === "C-2.7"), false);
});

test("R37 (C-2.7): record-core's audit over the same bundles answers the same report with capture's grammar registered as with the catalogue's arm", async () => {
  const report = async (register) => {
    const { ctx, record } = world();
    if (register) captureOf(ctx, { record, provenance: provenance(ctx.storage) });
    for (const [id, image] of Object.entries(CASES))
      record.transact(() => record.commit({ bundleId: id, type: id.startsWith("PROJ") ? "project" : "information", title: "t",
        snapKey: "k1", kind: "creation", author: "member:ann", state: "collected", group: "test-group", created: T0, lastUpdated: T0, at: T0,
        files: Object.entries(image).map(([path, text]) => ({ path, text, sha256: hex(text) })) }));
    assert.equal(record.grammars().length, register ? 1 : 0);
    return record.auditPass({ limit: 50 });
  };
  const withGrammar = await report(true), without = await report(false);
  assert.equal(withGrammar.checked, Object.keys(CASES).length);
  assert.ok(withGrammar.tally["C-2.7"] >= 10, JSON.stringify(withGrammar.tally));
  assert.deepEqual(withGrammar, without);
});
