/* citation: `cite`'s refusals, each with its negative control, and their order (R1, R11's rows as `cite` carries them),
   at the module's interface. */
import test from "node:test";
import assert from "node:assert/strict";
import { world, V, projMd, inqMd, biasMd, NOW } from "./fixture.mjs";
import { Citation, CITE_CHECKS, CITE_EXTENT_CHECKS, EXTENT_PARAMS } from "../../../src/citation/index.mjs";
import { INLINE_MAX } from "../../../src/promotion/index.mjs";

const ANN = { viewer: V("ann"), owner: "o", author: "member:ann", identity: V("ann") };

async function setup() {
  const w = world();
  w.info("INFO-2026-0001");
  w.info("INFO-2026-0002");
  w.info("INFO-2026-0003", { state: "retired" });
  w.inquiry("INQ-2026-0001");
  const p = w.project();
  return { w, p, q: "INQ-2026-0001" };
}

const carries = (r, family, code) => {
  assert.equal(r.ok, false);
  assert.equal(r.reason, code);
  assert.equal(r.check, family[code].check);
  assert.equal(r.translation, family[code].translation);
};

test("R1: the selection is asked first, at weight report (retrieval R19): an unknown handle is refused before any citing object is looked up", async () => {
  const { w } = await setup();
  const r = w.cit.cite({ project: "PROJ-2026-0000-nothing", handle: "sel-000000000000000000000000", ...ANN, note: "x\"y" });
  assert.equal(r.reason, "NO_SUCH_SELECTION");
  const h = await w.select(["INFO-2026-0001"], { owner: "someone-else" });
  assert.equal(w.cit.cite({ project: "nope", handle: h, ...ANN }).reason, "NOT_YOURS");
});

test("R1, R9: an absent citing object and a project the viewer may not see answer the same NO_SUCH_PROJECT; existence-only sight answers membership's C-70.1", async () => {
  const { w, p } = await setup();
  const hv = await w.select(["INFO-2026-0001"], { viewer: V("vera"), owner: "v" });
  const hidden = w.cit.cite({ project: p, handle: hv, viewer: V("vera"), owner: "v", author: "member:vera", identity: V("vera") });
  const absent = w.cit.cite({ project: "PROJ-2026-9999-none", handle: hv, viewer: V("vera"), owner: "v", author: "member:vera", identity: V("vera") });
  assert.equal(hidden.reason, "NO_SUCH_PROJECT");
  assert.deepEqual({ ...hidden, project: null }, { ...absent, project: null });
  assert.equal(hidden.project, p);
  /* A caller with no viewer sees no project (fail closed). */
  assert.equal(w.cit.cite({ project: p, handle: hv, viewer: null, owner: "v" }).reason, "NO_SUCH_PROJECT");
  const disc = w.project("Open door", "ann", { visibility: "discoverable" });
  const seen = w.cit.cite({ project: disc, handle: hv, viewer: V("vera"), owner: "v", author: "member:vera", identity: V("vera") });
  assert.deepEqual([seen.ok, seen.reason, seen.project], [false, "PROJECT_SEEN_NOT_A_PARTICIPANT", disc]);
  /* Control: the participant is not refused. */
  const ha = await w.select(["INFO-2026-0001"]);
  assert.equal(w.cit.cite({ project: disc, handle: ha, ...ANN }).ok, true);
});

test("R1: NOT_A_PROJECT for a citing object that is neither a project nor an inquiry, naming what it is; a legacy question spelling is the inquiry arm", async () => {
  const { w } = await setup();
  const h = await w.select(["INFO-2026-0002"]);
  const r = w.cit.cite({ project: "INFO-2026-0001", handle: h, ...ANN });
  assert.deepEqual([r.ok, r.reason, r.project, r.got], [false, "NOT_A_PROJECT", "INFO-2026-0001", "information"]);
  w.put("FOCUS-2026-0001", inqMd("FOCUS-2026-0001").replace("object_type: inquiry", "object_type: focus").replace("schema: inquiry@1", "schema: focus@1"));
  const f = w.cit.cite({ project: "FOCUS-2026-0001", handle: h, ...ANN, role: "supports" });
  assert.equal(f.ok, true, JSON.stringify(f).slice(0, 300));
  assert.equal(f.citingObjectType, "inquiry");
});

test("R1: a project needs the actor joined (membership.projectAuthority): an administrator who sees it is refused, a joined owner is not; the question arm asks no position", async () => {
  const { w, p, q } = await setup();
  const h = await w.select(["INFO-2026-0001"], { viewer: V("adm"), owner: "a" });
  const r = w.cit.cite({ project: p, handle: h, viewer: V("adm"), owner: "a", author: "member:adm", identity: V("adm") });
  assert.deepEqual([r.ok, r.reason, r.act], [false, "PROJECT_ACT_NOT_A_PARTICIPANT", "cite"]);
  const onQ = w.cit.cite({ project: q, handle: h, viewer: V("adm"), owner: "a", author: "member:adm", identity: V("adm"), role: "supports" });
  assert.equal(onQ.ok, true);
  const h2 = await w.select(["INFO-2026-0001"]);
  assert.equal(w.cit.cite({ project: p, handle: h2, ...ANN }).ok, true);
});

test("R1, R11: BAD_NOTE (C-33.15) over 200 characters or with a quote, backslash or newline, carrying its row; a 200-character plain note passes", async () => {
  const { w, p } = await setup();
  const h = await w.select(["INFO-2026-0001"]);
  for (const note of ["x".repeat(201), 'a"b', "a\\b", "a\nb", "a\rb"]) carries(w.cit.cite({ project: p, handle: h, ...ANN, note }), CITE_CHECKS, "BAD_NOTE");
  assert.equal(w.cit.cite({ project: p, handle: h, ...ANN, note: "y".repeat(200) }).ok, true);
});

test("R1, R11: on an inquiry NO_ROLE (C-33.16) and BAD_ROLE (C-33.17) carry the role vocabulary; on a project ROLE_NOT_APPLICABLE (C-33.18)", async () => {
  const { w, p, q } = await setup();
  const h = await w.select(["INFO-2026-0001"]);
  for (const role of [null, undefined, ""]) {
    const r = w.cit.cite({ project: q, handle: h, ...ANN, role });
    carries(r, CITE_CHECKS, "NO_ROLE");
    assert.deepEqual(r.roles, ["supports", "cuts_against"]);
  }
  const bad = w.cit.cite({ project: q, handle: h, ...ANN, role: "maybe" });
  carries(bad, CITE_CHECKS, "BAD_ROLE");
  assert.deepEqual([bad.got, bad.roles], ["maybe", ["supports", "cuts_against"]]);
  const na = w.cit.cite({ project: p, handle: h, ...ANN, role: "supports" });
  carries(na, CITE_CHECKS, "ROLE_NOT_APPLICABLE");
  assert.equal(na.got, "supports");
  assert.equal(w.cit.cite({ project: q, handle: h, ...ANN, role: "cuts_against" }).ok, true);
});

test("R1: without inquiry's services the question arm is refused INQUIRY_UNAVAILABLE and writes nothing; the case arm is unaffected", async () => {
  const { w, p, q } = await setup();
  const bare = new Citation({ record: w.record, membership: w.membership, promotion: w.promotion, content: w.content,
                              retrieval: w.retrieval, now: () => NOW });
  const h = await w.select(["INFO-2026-0001"]);
  const before = w.md(q);
  const r = bare.cite({ project: q, handle: h, ...ANN, role: "supports" });
  assert.deepEqual([r.ok, r.reason], [false, "INQUIRY_UNAVAILABLE"]);
  assert.equal(w.md(q), before);
  assert.equal(bare.cite({ project: p, handle: h, ...ANN }).ok, true);
});

test("R1: NOT_CITABLE (inquiry) and NOT_INFORMATION (project) name every member neither information nor an inquiry, sorted, with `citable`, and never narrow the call", async () => {
  const { w, p, q } = await setup();
  const p2 = w.project("Another case");
  const h = await w.select(["INFO-2026-0001", p2, "INQ-2026-0001", p]);
  const onP = w.cit.cite({ project: p, handle: h, ...ANN });
  assert.deepEqual([onP.reason, onP.offenders, onP.citable], ["NOT_INFORMATION", [p, p2].sort(), ["information", "inquiry"]]);
  const q2 = w.inquiry("INQ-2026-0002");
  const onQ = w.cit.cite({ project: q2, handle: h, ...ANN, role: "supports" });
  assert.deepEqual([onQ.reason, onQ.offenders, onQ.citable], ["NOT_CITABLE", [p, p2].sort(), ["information", "inquiry"]]);
  assert.doesNotMatch(w.md(p), /INFO-2026-0001/, "nothing of the citable rest was written");
  /* Over-strictness: information and a question are citable on both arms. */
  const ok = await w.select(["INFO-2026-0001", q]);
  assert.equal(w.cit.cite({ project: p, handle: ok, ...ANN }).ok, true);
  assert.equal(w.cit.cite({ project: q2, handle: ok, ...ANN, role: "supports" }).ok, true);
});

test("R1, R5, R11: RETIRED_NOT_CITABLE (C-33.39) names every retired member, on both arms, and is asked of a retired bias set too", async () => {
  const { w, p, q } = await setup();
  w.put("BIAS-2026-0001", biasMd("BIAS-2026-0001", "retired"));
  const h = await w.select(["INFO-2026-0003", "INFO-2026-0001", "BIAS-2026-0001"]);
  /* The bias set is refused as not citable before its retirement is asked (the type test comes first). */
  assert.equal(w.cit.cite({ project: p, handle: h, ...ANN }).reason, "NOT_INFORMATION");
  const h2 = await w.select(["INFO-2026-0003", "INFO-2026-0001"]);
  for (const r of [w.cit.cite({ project: p, handle: h2, ...ANN }), w.cit.cite({ project: q, handle: h2, ...ANN, role: "supports" })]) {
    carries(r, CITE_CHECKS, "RETIRED_NOT_CITABLE");
    assert.deepEqual(r.offenders, ["INFO-2026-0003"]);
    assert.equal(r.code, "RETIRED_NOT_CITABLE");
  }
  assert.doesNotMatch(w.md(p), /INFO-2026-0001/);
});

test("R1: an unreadable citing document is NO_BUNDLE_MD or UNPARSEABLE_FRONTMATTER", async () => {
  const { w, p } = await setup();
  const h = await w.select(["INFO-2026-0001"]);
  assert.deepEqual(w.withDocument(p, null).cite({ project: p, handle: h, ...ANN }), { ok: false, reason: "NO_BUNDLE_MD", project: p });
  const u = w.withDocument(p, "no frontmatter here").cite({ project: p, handle: h, ...ANN });
  assert.deepEqual([u.ok, u.reason, u.project], [false, "UNPARSEABLE_FRONTMATTER", p]);
});

test("R1, R11: SEVERED_EDGE (C-33.19) for a member the citing object holds a severed edge to, naming only those, the whole call refused", async () => {
  const { w, p } = await setup();
  const h = await w.select(["INFO-2026-0001"]);
  w.cit.cite({ project: p, handle: h, ...ANN });
  assert.equal(w.cit.sever({ project: p, handle: h, ...ANN, reason: "wrong document" }).ok, true);
  const both = await w.select(["INFO-2026-0002", "INFO-2026-0001"]);
  const r = w.cit.cite({ project: p, handle: both, ...ANN });
  carries(r, CITE_CHECKS, "SEVERED_EDGE");
  assert.deepEqual(r.offenders, ["INFO-2026-0001"]);
  assert.doesNotMatch(w.md(p), /INFO-2026-0002/);
});

test("R1, R11: the part — UNKNOWN_EXTENT_FIELD (C-45.7) listing the fields taken, EXTENT_NOT_APPLICABLE (C-45.8) on a project, EXTENT_ON_MANY (C-45.9) for more than one new member, BAD_EXTENT_VALUE (C-45.10)", async () => {
  const { w, p, q } = await setup();
  const one = await w.select(["INFO-2026-0001"]);
  const unk = w.cit.cite({ project: q, handle: one, ...ANN, role: "supports", extent: { extent_page: "1", extent_pgae: "2", zz: "" } });
  carries(unk, CITE_EXTENT_CHECKS, "UNKNOWN_EXTENT_FIELD");
  assert.deepEqual([unk.got, unk.fields], [["extent_pgae", "zz"], Object.keys(EXTENT_PARAMS)]);
  const na = w.cit.cite({ project: p, handle: one, ...ANN, extent: { extent_kind: "pdf-page", extent_page: "1" } });
  carries(na, CITE_EXTENT_CHECKS, "EXTENT_NOT_APPLICABLE");
  assert.deepEqual(na.got, ["extent_kind", "extent_page"]);
  /* An empty value is not an authored one: a project call carrying only empty part fields passes. */
  assert.equal(w.cit.cite({ project: p, handle: one, ...ANN, extent: { extent_kind: "", extent_page: " " } }).ok, true);
  const two = await w.select(["INFO-2026-0002", "INFO-2026-0001"]);
  const many = w.cit.cite({ project: q, handle: two, ...ANN, role: "supports", extent: { extent_kind: "pdf-page", extent_page: "1" } });
  carries(many, CITE_EXTENT_CHECKS, "EXTENT_ON_MANY");
  assert.deepEqual(many.offenders, ["INFO-2026-0001", "INFO-2026-0002"]);
  for (const v of ["x".repeat(201), 'a"b', "a\\b", "a\nb", "a#b"]) {
    const r = w.cit.cite({ project: q, handle: one, ...ANN, role: "supports", extent: { extent_kind: "pdf-page", extent_ref: v } });
    carries(r, CITE_EXTENT_CHECKS, "BAD_EXTENT_VALUE");
    assert.equal(r.field, "extent_ref");
  }
  /* A part on many members is fine once all but one are already cited (the count is of NEW members). */
  assert.equal(w.cit.cite({ project: q, handle: one, ...ANN, role: "supports" }).ok, true);
  assert.equal(w.cit.cite({ project: q, handle: two, ...ANN, role: "supports", extent: { extent_kind: "pdf-page", extent_page: "0" } }).ok, true);
});

test("R1: a part the leg grammar refuses (inquiry.checkLegExtentGrammar) is BASIS_REFUSED with each finding, before anything is written", async () => {
  const { w, q } = await setup();
  const h = await w.select(["INFO-2026-0001"]);
  const before = w.md(q);
  for (const extent of [{ extent_kind: "dom" }, { extent_kind: "pdf-page", extent_page: "x" }, { content_id: "not-hex" },
                        { extent_kind: "pdf-page", extent_page: "1", content_id: "a".repeat(64) }]) {
    const r = w.cit.cite({ project: q, handle: h, ...ANN, role: "supports", extent });
    assert.equal(r.reason, "BASIS_REFUSED", JSON.stringify(extent));
    assert.ok(r.findings.length >= 1 && r.findings.every((f) => f.check && typeof f.detail === "string" && Array.isArray(f.repairs)));
  }
  assert.equal(w.md(q), before);
});

test("R1: EMPTY_SELECTION when every member left the selection (purged), after the part is judged", async () => {
  const { w, p } = await setup();
  w.info("INFO-2026-0009");
  const h = await w.select(["INFO-2026-0009"]);
  w.record.purge({ bundleId: "INFO-2026-0009" });
  const r = w.cit.cite({ project: p, handle: h, ...ANN });
  assert.deepEqual([r.ok, r.reason, r.drift.purged], [false, "EMPTY_SELECTION", ["INFO-2026-0009"]]);
});

test("R1: UNSPLICEABLE_REFERENCES when the references block cannot be extended in place, UNSPLICEABLE_BASIS for the basis block", async () => {
  const { w, p, q } = await setup();
  const h = await w.select(["INFO-2026-0001"]);
  const oddRefs = w.md(p).replace("references: []", "references: somewhere");
  assert.equal(w.withDocument(p, oddRefs).cite({ project: p, handle: h, ...ANN }).reason, "UNSPLICEABLE_REFERENCES");
  const oddQRefs = w.md(q).replace("references: []", "references: somewhere");
  assert.equal(w.withDocument(q, oddQRefs).cite({ project: q, handle: h, ...ANN, role: "supports" }).reason, "UNSPLICEABLE_REFERENCES");
  const oddBasis = w.md(q).replace("references: []", "references: []\nbasis: somewhere");
  assert.equal(w.withDocument(q, oddBasis).cite({ project: q, handle: h, ...ANN, role: "supports" }).reason, "UNSPLICEABLE_BASIS");
});

test("R1: past 1 MiB, CITATION_TOO_LARGE with how many would fit, nothing written", async () => {
  const { w } = await setup();
  const base = projMd("Big case").length;
  const pad = "\n" + "z".repeat(INLINE_MAX - base - 120) + "\n";
  const p = w.project("Big case", "ann", { body: pad });
  const h = await w.select(["INFO-2026-0001", "INFO-2026-0002"]);
  const before = w.md(p);
  const r = w.cit.cite({ project: p, handle: h, ...ANN });
  assert.deepEqual([r.ok, r.reason, r.requested, r.limit], [false, "CITATION_TOO_LARGE", 2, INLINE_MAX]);
  assert.ok(r.bytes > INLINE_MAX);
  assert.ok(Number.isInteger(r.roomFor) && r.roomFor >= 0 && r.roomFor < 2);
  assert.equal(w.md(p), before);
});

test("R1: a refusal from the write (inquiry R11: BASIS_REFUSED, SELF_BASIS, BASIS_CYCLE) is answered unchanged, with the handle and drift", async () => {
  const { w, q } = await setup();
  const refusal = { ok: false, reason: "BASIS_CYCLE", path: [q, "INQ-2026-0002", q], detail: "closes a cycle" };
  w.promotion.registerStep("inquiry", { check: (c) => (c.bundleId === q ? refusal : null) });
  const h = await w.select(["INFO-2026-0001"]);
  const r = w.cit.cite({ project: q, handle: h, ...ANN, role: "supports" });
  assert.deepEqual(r, { ...refusal, project: q, handle: h, drift: r.drift });
  assert.equal(r.drift.kind, "enumerated");
});

test("R1: the refusals come in the stated order", async () => {
  const { w, p, q } = await setup();
  const p2 = w.project("Other");
  const bad = await w.select(["INFO-2026-0003", p2]);   // a retired member and a non-citable one
  const order = (args) => w.cit.cite({ project: q, handle: bad, ...ANN, ...args }).reason;
  /* note before role before citability before retirement */
  assert.equal(order({ note: 'q"', role: "maybe" }), "BAD_NOTE");
  assert.equal(order({ role: "maybe" }), "BAD_ROLE");
  assert.equal(order({ role: "supports" }), "NOT_CITABLE");
  const retired = await w.select(["INFO-2026-0003", "INFO-2026-0001"]);
  assert.equal(w.cit.cite({ project: q, handle: retired, ...ANN, role: "supports", extent: { nope: "1" } }).reason, "RETIRED_NOT_CITABLE");
  /* severed before the part */
  const h = await w.select(["INFO-2026-0001"]);
  w.cit.cite({ project: p, handle: h, ...ANN });
  w.cit.sever({ project: p, handle: h, ...ANN, reason: "no" });
  assert.equal(w.cit.cite({ project: p, handle: h, ...ANN, extent: { nope: "1" } }).reason, "SEVERED_EDGE");
  /* unknown field before not-applicable, not-applicable before many, many before bad value, bad value before the grammar */
  const two = await w.select(["INFO-2026-0001", "INFO-2026-0002"]);
  const p3 = w.project("Third");
  assert.equal(w.cit.cite({ project: p3, handle: two, ...ANN, extent: { nope: "1", extent_kind: "pdf-page" } }).reason, "UNKNOWN_EXTENT_FIELD");
  assert.equal(w.cit.cite({ project: p3, handle: two, ...ANN, extent: { extent_ref: 'a"' } }).reason, "EXTENT_NOT_APPLICABLE");
  assert.equal(w.cit.cite({ project: q, handle: two, ...ANN, role: "supports", extent: { extent_ref: 'a"' } }).reason, "EXTENT_ON_MANY");
  assert.equal(w.cit.cite({ project: q, handle: h, ...ANN, role: "supports", extent: { extent_kind: "dom", extent_ref: 'a"' } }).reason, "BAD_EXTENT_VALUE");
  /* sight and position before the note */
  const hv = await w.select(["INFO-2026-0001"], { viewer: V("vera"), owner: "v" });
  assert.equal(w.cit.cite({ project: p, handle: hv, viewer: V("vera"), owner: "v", identity: V("vera"), note: '"' }).reason, "NO_SUCH_PROJECT");
  const ha = await w.select(["INFO-2026-0001"], { viewer: V("adm"), owner: "a" });
  assert.equal(w.cit.cite({ project: p, handle: ha, viewer: V("adm"), owner: "a", identity: V("adm"), note: '"' }).reason, "PROJECT_ACT_NOT_A_PARTICIPANT");
});
