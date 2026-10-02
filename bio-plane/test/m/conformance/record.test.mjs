/* conformance: the comparison proposed (R12), the tables' append-only record and purge (R16), and the determination as a
   record object (R17). Every test drives `conformance` at its interface over the real modules it uses (./fixture.mjs). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { scene, V, MACHINE, F } from "./fixture.mjs";
import { CONFORMANCE_CHECKS, CONFORMANCE_TABLES, PROPOSAL_SAYS, FLAG_SAYS, SIGNIFICANCE_KEYS,
         LIMITS } from "../../../src/conformance/index.mjs";
import { proposalLabel } from "../../../src/record-grammar/index.mjs";
import { corpusExportOf } from "../../../src/corpus-export/index.mjs";

const refused = (r, code) => {
  assert.equal(r.ok, false, `expected ${code}, got ${JSON.stringify(r).slice(0, 300)}`);
  assert.equal(r.reason, code);
  if (CONFORMANCE_CHECKS[code]) assert.equal(r.check, CONFORMANCE_CHECKS[code].check);
};
const nothing = (w, fn) => { const before = w.snapshot(); const r = fn(); assert.deepEqual(w.snapshot(), before, "nothing written"); return r; };

test("R12: a comparison a machine prepared or a member suggested is stored apart, labelled with who made it and whether it is machine work, and answered with the sentence that it is not a determination", () => {
  const { w, proj, std, input } = scene();
  const body = { project: proj, act: input().act, standards: [std], rows: input().rows,
                 questions: [{ question: "Was notice given another way?" }] };
  const m = w.c.comparisonPropose({ ...body, proposer: MACHINE, viewer: MACHINE });
  assert.equal(m.ok, true, JSON.stringify(m).slice(0, 300));
  const p = m.proposal;
  assert.deepEqual([p.project, p.proposer, p.machine_work, p.says], [proj, MACHINE, true, PROPOSAL_SAYS]);
  assert.deepEqual(p.label, proposalLabel(MACHINE, "comparison"));
  assert.match(p.label.says, /never determine/);
  assert.deepEqual([p.standards, p.rows.length, p.questions], [[std], 1, [{ question: "Was notice given another way?", inquiry: null }]]);
  assert.equal("outcome" in p || "outcomes" in p, false);
  const mem = w.c.comparisonPropose({ ...body, proposer: V("pat"), viewer: V("pat") }).proposal;
  assert.deepEqual([mem.machine_work, mem.label.state], [false, "member_proposed"]);
  const none = w.c.comparisonPropose({ ...body, proposer: null, viewer: V("pat") }).proposal;
  assert.equal(none.label.state, "unstated");
  /* stored apart: never a determination, never listed as one */
  assert.equal(w.count("determinations"), 0);
  assert.deepEqual(w.c.determinationsFor({ viewer: V("pat") }).items, []);
  assert.equal(w.c.comparisonRead({ id: p.id, viewer: V("pat") }).proposal.id, p.id);
});

test("R12 R18: a proposal naming an outcome anywhere is refused PROPOSAL_CANNOT_DETERMINE; one carrying a significance is refused; the project is seen first", () => {
  const { w, proj, std, input } = scene();
  const base = { project: proj, standards: [std], rows: input().rows, proposer: MACHINE, viewer: MACHINE };
  for (const bad of [{ outcome: "noncompliant" }, { standards: [{ standard: std, outcome: "compliant" }] },
                     { rows: [{ ...input().rows[0], outcome: "noncompliant" }] }, { outcomes: {} }, { act: { verdict: "x" } }])
    refused(nothing(w, () => w.c.comparisonPropose({ ...base, ...bad })), "PROPOSAL_CANNOT_DETERMINE");
  for (const key of SIGNIFICANCE_KEYS)
    refused(nothing(w, () => w.c.comparisonPropose({ ...base, rows: [{ ...input().rows[0], [key]: 1 }] })),
            "SIGNIFICANCE_IS_A_MEMBERS_JUDGMENT");
  const hidden = w.project("Hidden", "olive");
  refused(w.c.comparisonPropose({ ...base, project: hidden, proposer: V("quinn"), viewer: V("quinn") }), "NO_SUCH_PROJECT");
  refused(w.c.comparisonPropose({ ...base, project: "PROJ-2026-9999-none" }), "NO_SUCH_PROJECT");
  /* R18: a comparison carries at most what a determination carries, each part named with its cap; at the bound, accepted */
  const over = { standards: Array(LIMITS.standards + 1).fill(std), rows: Array(LIMITS.rows + 1).fill(input().rows[0]),
                 questions: Array(LIMITS.questions + 1).fill({ question: "Q?" }),
                 act: { ...input().act, evidence: Array(LIMITS.evidence + 1).fill(input().act.evidence[0]) } };
  for (const [part, v] of Object.entries(over)) {
    const r = nothing(w, () => w.c.comparisonPropose({ ...base, [part]: v }));
    refused(r, "DETERMINATION_TOO_LARGE");
    const named = part === "act" ? "evidence" : part;
    assert.deepEqual([r.part, r.max, r.count], [named, LIMITS[named], LIMITS[named] + 1]);
  }
  const at = { standards: Array(LIMITS.standards).fill(std), rows: Array(LIMITS.rows).fill(input().rows[0]),
               questions: Array(LIMITS.questions).fill({ question: "Q?" }),
               act: { ...input().act, evidence: Array(LIMITS.evidence).fill(input().act.evidence[0]) } };
  assert.equal(w.c.comparisonPropose({ ...base, ...at }).ok, true);
});

test("R8 R12: no comparison answer carries a significance, severity, priority, urgency, rank or score, nor an outcome", () => {
  const { w, proj, std, input } = scene();
  const p = w.c.comparisonPropose({ project: proj, act: input().act, standards: [std], rows: input().rows,
                                    questions: [{ question: "Q?" }], proposer: MACHINE, viewer: MACHINE });
  const d = w.c.determine(input({ proposal: p.proposal.id }));
  const walk = (v) => Array.isArray(v) ? v.forEach(walk) : v && typeof v === "object"
    ? Object.entries(v).forEach(([k, x]) => {
      assert.equal(SIGNIFICANCE_KEYS.includes(k.toLowerCase()), false, k);
      assert.equal(["outcome", "outcomes", "verdict"].includes(k.toLowerCase()), false, k);
      walk(x);
    }) : null;
  walk(p);
  walk(w.c.comparisonRead({ id: p.proposal.id, viewer: V("pat") }));
  assert.equal(d.proposal, p.proposal.id);
});

test("R12 R18: a determination may name the proposal it drew on, and the proposal records that; a proposal absent or of another project is refused", () => {
  const { w, proj, std, input } = scene();
  const p = w.c.comparisonPropose({ project: proj, standards: [std], rows: input().rows, proposer: MACHINE, viewer: MACHINE }).proposal;
  const d = w.c.determine(input({ proposal: p.id }));
  assert.deepEqual([d.ok, d.proposal], [true, p.id]);
  const read = w.c.comparisonRead({ id: p.id, viewer: V("pat") });
  assert.deepEqual(read.proposal.drawn_on_by, [{ determination: d.id, at: d.at }]);
  assert.deepEqual([read.proposal.label, read.proposal.says], [proposalLabel(MACHINE, "comparison"), PROPOSAL_SAYS]);
  assert.match(w.text(d.id), new RegExp(`drew_on: ${p.id}`));
  refused(nothing(w, () => w.c.determine(input({ proposal: "CMP-2026-0099" }))), "NO_SUCH_COMPARISON");
  const libs = w.project("Libraries", "olive");
  const theirs = w.c.comparisonPropose({ project: libs, proposer: MACHINE, viewer: MACHINE }).proposal;
  refused(nothing(w, () => w.c.determine(input({ proposal: theirs.id }))), "NO_SUCH_COMPARISON");
  /* a proposal's read answers as its project's sight says */
  refused(w.c.comparisonRead({ id: p.id, viewer: V("quinn") }), "NO_SUCH_COMPARISON");
  refused(w.c.comparisonRead({ id: "CMP-2026-0099", viewer: V("pat") }), "NO_SUCH_COMPARISON");
  /* K380: the proposal code is intent's; this module's is NO_SUCH_COMPARISON, row C-113.20 */
  assert.deepEqual(["NO_SUCH_PROPOSAL" in CONFORMANCE_CHECKS, CONFORMANCE_CHECKS.NO_SUCH_COMPARISON.check], [false, "C-113.20"]);
});

test("R16: determinations, supersessions, flags and proposals are append-only (no act changes a row it wrote), and each table is declared to record-core's purge", () => {
  const { w, input } = scene();
  const tables = CONFORMANCE_TABLES.map((t) => t.name);
  const a = w.c.determine(input());
  w.c.comparisonPropose({ project: a.project, proposer: MACHINE, viewer: MACHINE });
  const snap1 = w.snapshot(tables);
  const b = w.c.determine(input({ supersedes: a.id, reason: "restated" }));
  w.c.basisChanged({ kind: "finding", subject: F, source: "reopened", since: "2026-09-28T03:00:00Z" });
  w.c.determine(input({ questions: [{ question: "Q?" }] }));
  const snap2 = w.snapshot(tables);
  /* every row present before is present after, byte for byte */
  for (const t of tables) {
    const before = JSON.parse(snap1[t]), after = JSON.parse(snap2[t]);
    for (const row of before) assert.ok(after.some((x) => JSON.stringify(x) === JSON.stringify(row)), `${t} keeps ${JSON.stringify(row)}`);
  }
  assert.equal(w.c.determinationRead({ id: a.id, viewer: V("olive") }).superseded_by, b.id);
  /* the purge: a single bundle's clears its rows; the whole-store form clears every table, each named */
  const one = w.record.purge({ bundleId: a.id });
  assert.equal(w.row(`SELECT COUNT(*) AS n FROM determinations WHERE determination_id=?`, a.id).n, 0);
  assert.equal(w.row(`SELECT COUNT(*) AS n FROM determination_standards WHERE determination_id=?`, a.id).n, 0);
  assert.ok(w.row(`SELECT COUNT(*) AS n FROM determinations`).n >= 2, "only that bundle's rows");
  assert.equal(one.scope, a.id);
  for (const t of tables) assert.equal(typeof one.removed[t], "number", `the purge report names ${t}`);
  const all = w.record.purge({});
  assert.equal(all.scope, "ALL");
  for (const t of tables) {
    assert.equal(typeof all.removed[t], "number", `the purge report names ${t}`);
    assert.equal(w.count(t), 0, t);
  }
});

test("R16: no place is named in this module's behaviour or outward text", () => {
  const { w, input } = scene();
  const d = w.c.determine(input());
  const p = w.c.comparisonPropose({ project: d.project, proposer: MACHINE, viewer: MACHINE }).proposal;
  const outward = [...Object.values(CONFORMANCE_CHECKS).map((r) => r.translation), PROPOSAL_SAYS, FLAG_SAYS, p.says,
                   p.label.says, w.text(d.id).replace(input().act.description, "").replace(/Parks|Director of Parks/g, "")];
  for (const s of outward)
    assert.doesNotMatch(s, /Oakland|California|Alameda|Berkeley|San Francisco|Sacramento|CPRA|Brown Act/, s.slice(0, 80));
});

test("R17: a determination is a record object of its own type, promoted through promotion, with history, audit and export like a finding; a correction is a new determination that supersedes it", async () => {
  const { w, input } = scene();
  const d = w.c.determine(input());
  const info = w.record.bundleInfo(d.id);
  assert.equal(info.type, "determination");
  assert.match(d.id, /^CONF-2026-\d{4}-determination$/);
  const head = w.record.head(d.id);
  assert.deepEqual([head.currentState, head.rowVersion], ["recorded", 1]);
  /* history: one manifest entry, by the member, at the act's time */
  const image = w.record.readImage(d.id);
  const manifest = Object.entries(image).find(([k]) => /manifest/i.test(k));
  assert.ok(manifest, "the image carries its manifest");
  assert.match(JSON.stringify(manifest[1]), /member:olive/);
  /* the document states every part */
  const text = w.text(d.id);
  for (const part of [d.act.id, d.act.description, "Director of Parks", "noncompliant", F, "CASE-2026-0001", "## Comparison"])
    assert.ok(text.includes(part), part);
  /* audit: the catalogue and every registered check find it clean */
  const audit = await w.record.auditPass({ after: "", limit: 500, visible: () => true });
  assert.equal(audit.offenders.some((o) => JSON.stringify(o).includes(d.id)), false, JSON.stringify(audit.offenders).slice(0, 400));
  /* export: it is in the working corpus with its promotion, through corpus-export's R1 on the host's one instance (the one
     publication created at its creation, so it sees what the fixture promoted) */
  const ex = corpusExportOf(w.host).exportManifest({ note: "test" });
  const row = (ex.bundles || []).find((b) => (b.bundle_id ?? b.id) === d.id);
  assert.ok(row, "exported");
  /* a correction is a new determination superseding it; the object itself never moves */
  const next = w.c.determine(input({ supersedes: d.id, reason: "a correction" }));
  assert.equal(next.ok, true);
  assert.deepEqual([w.record.head(d.id).rowVersion, w.record.bundleInfo(next.id).type], [1, "determination"]);
  const rev = w.promotion.promote({ bundleId: d.id, base: head.bundleSha, snapKey: "edit", author: V("olive"),
    files: [{ path: "bundle.md", text }], meta: { object_type: "determination" } });
  refused(rev, "DETERMINATION_ONLY_BY_ITS_ACT");
});
