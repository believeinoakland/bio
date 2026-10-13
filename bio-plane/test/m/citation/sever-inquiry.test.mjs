/* citation: `sever` and `reinstate` acting on a question's own legs (R15, amending R4; T47-17, N977), at the module's
   interface: the status that moves is the question's `references[]` entry naming the leg's target, read back through
   the real `inquiry`'s `restsOnLive` (booted on the host), and the leg itself stays in `basis[]` unchanged. */
import test from "node:test";
import assert from "node:assert/strict";
import { world, V, STAMP, inqMd } from "./fixture.mjs";
import { CITE_CHECKS } from "../../../src/citation/index.mjs";
import { noSuchProject } from "../../../src/membership/index.mjs";

const ANN = { viewer: V("ann"), owner: "o", author: "member:ann", identity: V("ann") };
const VERA = { viewer: V("vera"), owner: "v", author: "member:vera", identity: V("vera") };
const DOC = "INFO-2026-0001-doc", DOC2 = "INFO-2026-0002-doc", Q = "INQ-2026-0001-q", Q2 = "INQ-2026-0002-q";

const blockOf = (md, key) => {
  const m = new RegExp(`\\n${key}:\\n((?:  .*\\n)+)`).exec(md);
  return m ? m[1] : null;
};
const entry = (w, q, t) => w.fm(q).references.find((e) => e.target === t);
/* Who rests on `target` through a live leg and who through a severed one, as the record's own read answers it. */
const rests = (w, target) => {
  const r = w.inquiryModule.restsOnLive(target);
  return { confirmed: r.confirmed.map((l) => l.bundle_id), severed: r.severed.map((l) => l.bundle_id) };
};

/* Two documents and two questions, the first question resting on both documents and on the second question. */
async function setup() {
  const w = world({ inquiry: true });
  w.info(DOC);
  w.info(DOC2);
  w.inquiry(Q);
  w.inquiry(Q2);
  const all = await w.select([DOC, DOC2, Q2]);
  const c = w.cit.cite({ project: Q, handle: all, ...ANN, role: "supports", note: "why it holds" });
  assert.equal(c.ok, true, JSON.stringify(c).slice(0, 300));
  return { w, all };
}

test("R15: sever on a question moves the references entry of each selected leg's target to severed, keeps the leg in basis[] byte for byte, and restsOnLive reads it severed; reinstate reads it confirmed", async () => {
  const { w } = await setup();
  const one = await w.select([DOC]);
  const basis = blockOf(w.md(Q), "basis");
  assert.deepEqual(rests(w, DOC), { confirmed: [Q], severed: [] }, "a control: the leg is live before");
  const s = w.cit.sever({ project: Q, handle: one, ...ANN, reason: "the wrong edition" });
  assert.equal(s.ok, true, JSON.stringify(s).slice(0, 300));
  assert.deepEqual(entry(w, Q, DOC), { rel: "cites", target: DOC, status: "severed",
                                       note: `why it holds | Severed ${STAMP}: the wrong edition` });
  assert.equal(blockOf(w.md(Q), "basis"), basis, "the leg is not deleted or rewritten");
  assert.deepEqual(rests(w, DOC), { confirmed: [], severed: [Q] });
  /* Only the selected leg moved. */
  assert.deepEqual([entry(w, Q, DOC2).status, entry(w, Q, Q2).status], ["confirmed", "confirmed"]);
  assert.deepEqual(rests(w, DOC2), { confirmed: [Q], severed: [] });
  const r = w.cit.reinstate({ project: Q, handle: one, ...ANN, reason: "the edition was right" });
  assert.equal(r.ok, true, JSON.stringify(r).slice(0, 300));
  assert.equal(entry(w, Q, DOC).status, "confirmed");
  assert.equal(entry(w, Q, DOC).note, `why it holds | Severed ${STAMP}: the wrong edition | Reinstated ${STAMP}: the edition was right`);
  assert.equal(blockOf(w.md(Q), "basis"), basis);
  assert.deepEqual(rests(w, DOC), { confirmed: [Q], severed: [] });
});

test("R15, R4: the answer is R4's, naming citingObjectType inquiry; the Session Log entry records the act, count, ids and reason; last_updated moves", async () => {
  const { w, all } = await setup();
  const s = w.cit.sever({ project: Q, handle: all, ...ANN, reason: "superseded" });
  const head = w.record.head(Q);
  assert.deepEqual(Object.keys(s).sort(), ["bundleSha", "citingObjectType", "drift", "from", "gate", "handle", "moved", "ok",
    "project", "rowVersion", "severed", "to", "weight", "why"].sort());
  assert.deepEqual([s.citingObjectType, s.severed, s.why, s.from, s.to, s.weight, s.bundleSha, s.rowVersion],
    ["inquiry", [DOC, DOC2, Q2], "superseded", ["confirmed", "proposed"], "severed", "refuse", head.bundleSha, head.rowVersion]);
  assert.equal("reason" in s, false);
  assert.equal(w.fm(Q).last_updated, STAMP);
  assert.match(w.md(Q), new RegExp(`### Session ${STAMP} \\| Severed 3 citations \\| member:ann\\nTrigger: selection ${all}\\n`
    + `Changes: basis legs on ${DOC}, ${DOC2}, ${Q2} moved to 'severed', each leg kept as it was\\. Reason: superseded\\.\\n`));
  const r = w.cit.reinstate({ project: Q, handle: all, ...ANN, reason: "back" });
  assert.deepEqual([r.ok, r.citingObjectType, r.reinstated, r.from, r.to], [true, "inquiry", [DOC, DOC2, Q2], ["severed"], "confirmed"]);
  assert.match(w.md(Q), /\| Reinstated 3 citations \| member:ann\n/);
  /* Control: the project arm's answer carries no citingObjectType. */
  const p = w.project();
  const h = await w.select([DOC]);
  w.cit.cite({ project: p, handle: h, ...ANN });
  const onP = w.cit.sever({ project: p, handle: h, ...ANN, reason: "x" });
  assert.deepEqual([onP.ok, "citingObjectType" in onP], [true, false]);
});

test("R15: the entry moved is the one naming the leg's target whatever its relation, and a proposed one may be severed", async () => {
  const w = world({ inquiry: true });
  w.info(DOC);
  w.info(DOC2);
  const cap = w.content.captureFor(DOC);
  w.put(Q, inqMd(Q, [
    `basis:\n  - target: ${DOC}\n    role: supports\n    extent_capture: "${cap}"\n  - target: ${DOC2}\n    role: cuts_against\n    extent_capture: "${w.content.captureFor(DOC2)}"`,
  ]).replace("references: []", `references:\n  - rel: mentions\n    target: ${DOC}\n    status: confirmed\n    note: ""\n  - rel: cites\n    target: ${DOC2}\n    status: proposed`));
  const both = await w.select([DOC, DOC2]);
  const s = w.cit.sever({ project: Q, handle: both, ...ANN, reason: "cut" });
  assert.equal(s.ok, true, JSON.stringify(s).slice(0, 300));
  assert.deepEqual(entry(w, Q, DOC), { rel: "mentions", target: DOC, status: "severed", note: `Severed ${STAMP}: cut` });
  assert.deepEqual(entry(w, Q, DOC2), { rel: "cites", target: DOC2, status: "severed", note: `Severed ${STAMP}: cut` });
  assert.deepEqual([rests(w, DOC).severed, rests(w, DOC2).severed], [[Q], [Q]]);
  assert.deepEqual(w.fm(Q).basis.map((l) => [l.target, l.role]), [[DOC, "supports"], [DOC2, "cuts_against"]]);
});

test("R15: a member that is not the target of a leg of the question's basis is NOT_CITED to sever, a leg not severed NOT_SEVERED to reinstate, each the whole call, naming the offenders", async () => {
  const { w } = await setup();
  w.info("INFO-2026-0003-doc");
  /* Referenced by the question, but no leg rests on it: a question may reference a document without resting on it. */
  w.revise(Q, w.md(Q).replace("references:\n", "references:\n  - rel: cites\n    target: INFO-2026-0003-doc\n    status: confirmed\n    note: \"\"\n"));
  const before = w.md(Q);
  const mixed = await w.select(["INFO-2026-0003-doc", DOC]);
  const nc = w.cit.sever({ project: Q, handle: mixed, ...ANN, reason: "x" });
  assert.deepEqual([nc.ok, nc.reason, nc.offenders], [false, "NOT_CITED", ["INFO-2026-0003-doc"]]);
  const one = await w.select([DOC]);
  const ns = w.cit.reinstate({ project: Q, handle: one, ...ANN, reason: "x" });
  assert.deepEqual([ns.ok, ns.reason, ns.offenders], [false, "NOT_SEVERED", [DOC]]);
  assert.equal(w.md(Q), before, "nothing written");
  /* Severed once, a second sever of it is NOT_CITED, as on a case. */
  assert.equal(w.cit.sever({ project: Q, handle: one, ...ANN, reason: "cut" }).ok, true);
  assert.deepEqual(w.cit.sever({ project: Q, handle: one, ...ANN, reason: "again" }).offenders, [DOC]);
});

test("R15: no actor-joined test on a question — a member in no project severs and reinstates its leg — while the case arm still asks it (control)", async () => {
  const { w } = await setup();
  const hv = await w.select([DOC], { viewer: V("vera"), owner: "v" });
  const s = w.cit.sever({ project: Q, handle: hv, ...VERA, reason: "vera's reason" });
  assert.equal(s.ok, true, JSON.stringify(s).slice(0, 300));
  assert.match(w.md(Q), /\| Severed 1 citation \| member:vera\n/);
  assert.equal(w.cit.reinstate({ project: Q, handle: hv, ...VERA, reason: "back" }).ok, true);
  /* Control: on a case vera has not joined (one she sees, set discoverable), position is asked. */
  const p = w.project("Open door", "ann", { visibility: "discoverable" });
  const ha = await w.select([DOC]);
  w.cit.cite({ project: p, handle: ha, ...ANN });
  const onP = w.cit.sever({ project: p, handle: hv, ...VERA, reason: "x" });
  assert.equal(onP.reason, "PROJECT_SEEN_NOT_A_PARTICIPANT");
});

test("R15, R9: a question the viewer may not see answers exactly as an absent one, NO_SUCH_PROJECT's answer, and moves nothing", async () => {
  const w = world({ inquiry: true });
  w.info(DOC);
  const p = w.project("Hidden case", "ann");
  /* A question belonging to ann's hidden project (record-core R34's `project`), so vera may not see it. */
  w.put(Q, inqMd(Q, [`project: ${p}`]));
  const h = await w.select([DOC]);
  assert.equal(w.cit.cite({ project: Q, handle: h, ...ANN, role: "supports" }).ok, true);
  const hv = await w.select([DOC], { viewer: V("vera"), owner: "v" });
  const snap = w.snapshot();
  for (const act of ["sever", "reinstate"]) {
    const hidden = w.cit[act]({ project: Q, handle: hv, ...VERA, reason: "x" });
    const absent = w.cit[act]({ project: "INQ-2026-9999-none", handle: hv, ...VERA, reason: "x" });
    assert.deepEqual(hidden, noSuchProject(Q), act);
    assert.deepEqual({ ...hidden, project: null }, { ...absent, project: null }, act);
  }
  assert.deepEqual(w.snapshot(), snap, "nothing written");
  /* Control: ann, who sees it, severs. */
  assert.equal(w.cit.sever({ project: Q, handle: h, ...ANN, reason: "x" }).ok, true);
});

test("R15, R4: on a question every other refusal is R4's — NO_REASON, BAD_REASON, EMPTY_SELECTION, NOT_INFORMATION, RETIRED_NOT_CITABLE for a reinstate, NO_BUNDLE_MD, UNPARSEABLE_FRONTMATTER, UNSPLICEABLE_REFERENCES", async () => {
  const { w, all } = await setup();
  for (const act of ["sever", "reinstate"]) {
    assert.equal(w.cit[act]({ project: Q, handle: all, ...ANN, reason: " " }).reason, "NO_REASON");
    assert.equal(w.cit[act]({ project: Q, handle: all, ...ANN, reason: 'a"b' }).reason, "BAD_REASON");
  }
  const none = await w.select(["INFO-2026-9999-none"]);
  assert.equal(w.cit.sever({ project: Q, handle: none, ...ANN, reason: "x" }).reason, "EMPTY_SELECTION");
  const p = w.project();
  const withCase = await w.select([DOC, p]);
  const ni = w.cit.sever({ project: Q, handle: withCase, ...ANN, reason: "x" });
  assert.deepEqual([ni.reason, ni.offenders], ["NOT_INFORMATION", [p]]);
  /* A document retired after its leg was severed cannot be reinstated; severing reliance on it is allowed. */
  const OLD = "INFO-2026-0003-old";
  w.info(OLD, { captured: false });
  const one = await w.select([OLD]);
  assert.equal(w.cit.cite({ project: Q, handle: one, ...ANN, role: "supports" }).ok, true);
  assert.equal(w.cit.sever({ project: Q, handle: one, ...ANN, reason: "cut" }).ok, true);
  w.revise(OLD, w.md(OLD).replace("current_state: collected", "current_state: verified"));
  w.revise(OLD, w.md(OLD).replace("current_state: verified", "current_state: retired"));
  const one2 = await w.select([OLD]);
  const ret = w.cit.reinstate({ project: Q, handle: one2, ...ANN, reason: "back" });
  assert.deepEqual([ret.reason, ret.check, ret.translation, ret.offenders],
                   ["RETIRED_NOT_CITABLE", "C-33.39", CITE_CHECKS.RETIRED_NOT_CITABLE.translation, [OLD]]);
  assert.equal(entry(w, Q, OLD).status, "severed");
  const h = await w.select([DOC]);
  assert.equal(w.withDocument(Q, null).sever({ project: Q, handle: h, ...ANN, reason: "x" }).reason, "NO_BUNDLE_MD");
  assert.equal(w.withDocument(Q, "no frontmatter").sever({ project: Q, handle: h, ...ANN, reason: "x" }).reason, "UNPARSEABLE_FRONTMATTER");
  /* The target's entry held twice: the splice declines to guess which one moves. */
  const twice = w.md(Q).replace("references:\n", `references:\n  - rel: mentions\n    target: ${DOC}\n    status: confirmed\n    note: ""\n`);
  assert.equal(w.withDocument(Q, twice).sever({ project: Q, handle: h, ...ANN, reason: "x" }).reason, "UNSPLICEABLE_REFERENCES");
  assert.equal(entry(w, Q, DOC).status, "confirmed");
});

test("R15, R7: on a question sever and reinstate are refuse weight: a moved selection is SET_MOVED and nothing moves", async () => {
  const { w, all } = await setup();
  w.revise(DOC, w.md(DOC).replace(`title: "Document ${DOC}"`, 'title: "Moved"'));
  const before = w.md(Q);
  for (const act of ["sever", "reinstate"])
    assert.equal(w.cit[act]({ project: Q, handle: all, ...ANN, reason: "x", weight: "report" }).reason, "SET_MOVED", act);
  assert.equal(w.md(Q), before);
});

test("R15: a refusal of the write (a question whose document cannot be revised, inquiry R11) is answered unchanged with the handle and drift, nothing written; the write refusing nothing, the leg is severed", async () => {
  const { w } = await setup();
  let refusal = null;
  w.promotion.registerStep("citation-test", { check: (c) => (c.bundleId === Q ? refusal : null) });
  const one = await w.select([DOC]);
  refusal = { ok: false, reason: "DIVIDED_CANNOT_RESTRUCTURE", code: "DIVIDED_CANNOT_RESTRUCTURE", detail: "refused" };
  const before = w.md(Q);
  const r = w.cit.sever({ project: Q, handle: one, ...ANN, reason: "x" });
  assert.deepEqual(r, { ...refusal, project: Q, handle: one, drift: r.drift });
  assert.equal(r.drift.kind, "enumerated");
  assert.equal(w.md(Q), before);
  refusal = null;
  assert.equal(w.cit.sever({ project: Q, handle: one, ...ANN, reason: "x" }).ok, true);
});

test("R15, R1: a leg severed on a question is not re-cited by cite (SEVERED_EDGE), and is restored only by reinstate", async () => {
  const { w } = await setup();
  const one = await w.select([DOC]);
  assert.equal(w.cit.sever({ project: Q, handle: one, ...ANN, reason: "cut" }).ok, true);
  const again = w.cit.cite({ project: Q, handle: one, ...ANN, role: "supports" });
  assert.deepEqual([again.reason, again.offenders], ["SEVERED_EDGE", [DOC]]);
  assert.equal(w.cit.reinstate({ project: Q, handle: one, ...ANN, reason: "back" }).ok, true);
  assert.deepEqual(w.cit.cite({ project: Q, handle: one, ...ANN, role: "supports" }).alreadyCited, [DOC]);
});
