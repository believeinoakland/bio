/* citation: `sever` and `reinstate` (R4) and their fixed weight (R7), at the module's interface. */
import test from "node:test";
import assert from "node:assert/strict";
import { world, V, STAMP, projMd } from "./fixture.mjs";
import { CITE_CHECKS, CITE_LOG_SAMPLE, EDGE_NOTE_MAX, EDGE_REASON_MAX } from "../../../src/citation/index.mjs";
import { INLINE_MAX } from "../../../src/promotion/index.mjs";

const ANN = { viewer: V("ann"), owner: "o", author: "member:ann", identity: V("ann") };

async function setup() {
  const w = world();
  for (const n of [1, 2, 3]) w.info(`INFO-2026-000${n}`, { captured: false });
  w.inquiry("INQ-2026-0001");
  const p = w.project();
  const h = await w.select(["INFO-2026-0001", "INFO-2026-0002", "INQ-2026-0001"]);
  assert.equal(w.cit.cite({ project: p, handle: h, ...ANN, note: "first reason" }).ok, true);
  return { w, p, h };
}
const edge = (w, p, t) => w.fm(p).references.find((e) => e.target === t);

test("R4: sever moves only the status of each member's cites edge to severed, keeping target and rel, and appends the reason to the note with the act and time", async () => {
  const { w, p, h } = await setup();
  const r = w.cit.sever({ project: p, handle: h, ...ANN, reason: "the wrong edition" });
  assert.equal(r.ok, true, JSON.stringify(r).slice(0, 300));
  for (const t of ["INFO-2026-0001", "INFO-2026-0002", "INQ-2026-0001"])
    assert.deepEqual(edge(w, p, t), { rel: "cites", target: t, status: "severed",
                                       note: `first reason | Severed ${STAMP}: the wrong edition` });
  assert.deepEqual([r.severed, r.why, r.from, r.to, r.weight], [["INFO-2026-0001", "INFO-2026-0002", "INQ-2026-0001"],
    "the wrong edition", ["confirmed", "proposed"], "severed", "refuse"]);
  assert.equal("reason" in r, false, "the member's prose is `why`, never `reason`");
  const head = w.record.head(p);
  assert.deepEqual(Object.keys(r).sort(), ["bundleSha", "drift", "from", "gate", "handle", "moved", "ok", "project", "rowVersion",
    "severed", "to", "weight", "why"].sort());
  assert.deepEqual([r.bundleSha, r.rowVersion, r.moved], [head.bundleSha, head.rowVersion, false]);
  assert.equal(w.fm(p).last_updated, STAMP);
  assert.equal(w.md(p).split("## Session Log\n\n")[1].split("\n").slice(3, 6).join("\n") + "\n",
    `### Session ${STAMP} | Severed 3 citations | member:ann\nTrigger: selection ${h}\n`
    + `Changes: cites edges to INFO-2026-0001, INFO-2026-0002, INQ-2026-0001 moved to 'severed'. Reason: the wrong edition.\n`);
});

test("R4: reinstate moves severed edges back to confirmed with its own reason; a reinstate of a non-retired target passes", async () => {
  const { w, p, h } = await setup();
  w.cit.sever({ project: p, handle: h, ...ANN, reason: "cut" });
  const r = w.cit.reinstate({ project: p, handle: h, ...ANN, reason: "the edition was right" });
  assert.equal(r.ok, true);
  assert.deepEqual([r.reinstated, r.from, r.to, r.why], [["INFO-2026-0001", "INFO-2026-0002", "INQ-2026-0001"], ["severed"], "confirmed", "the edition was right"]);
  assert.deepEqual(edge(w, p, "INFO-2026-0001"), { rel: "cites", target: "INFO-2026-0001", status: "confirmed",
    note: `first reason | Severed ${STAMP}: cut | Reinstated ${STAMP}: the edition was right` });
  assert.match(w.md(p), /\| Reinstated 3 citations \| member:ann\n/);
});

test("R4: a proposed edge may be severed, an entry with no note line gains one, and the note is bounded at 480 characters, the oldest dropped", async () => {
  const w = world();
  w.info("INFO-2026-0001", { captured: false });
  w.info("INFO-2026-0002", { captured: false });
  const long = "o".repeat(470);
  const p = w.project("Held", "ann", { extra: [] });
  w.revise(p, w.md(p).replace("references: []", `references:\n  - rel: cites\n    target: INFO-2026-0001\n    status: proposed\n    note: "${long}"\n  - rel: cites\n    target: INFO-2026-0002\n    status: confirmed`));
  const h = await w.select(["INFO-2026-0001", "INFO-2026-0002"]);
  const r = w.cit.sever({ project: p, handle: h, ...ANN, reason: "no longer relied on" });
  assert.equal(r.ok, true, JSON.stringify(r).slice(0, 300));
  const full = `${long} | Severed ${STAMP}: no longer relied on`;
  assert.equal(EDGE_NOTE_MAX, 480);
  assert.equal(edge(w, p, "INFO-2026-0001").note, full.slice(full.length - EDGE_NOTE_MAX));
  assert.equal(edge(w, p, "INFO-2026-0001").status, "severed");
  assert.equal(edge(w, p, "INFO-2026-0002").note, `Severed ${STAMP}: no longer relied on`);
});

test("R4: the refusals in order — the selection, NO_SUCH_PROJECT (absent or unseen alike), NOT_A_PROJECT (an inquiry included), the actor joined, NO_REASON, BAD_REASON", async () => {
  const { w, p, h } = await setup();
  for (const act of ["sever", "reinstate"]) {
    assert.equal(w.cit[act]({ project: p, handle: "sel-000000000000000000000000", ...ANN, reason: "" }).reason, "NO_SUCH_SELECTION");
    const hv = await w.select(["INFO-2026-0001"], { viewer: V("vera"), owner: "v" });
    const unseen = w.cit[act]({ project: p, handle: hv, viewer: V("vera"), owner: "v", identity: V("vera"), reason: "" });
    const absent = w.cit[act]({ project: "PROJ-2026-0000-x", handle: hv, viewer: V("vera"), owner: "v", identity: V("vera"), reason: "" });
    assert.deepEqual([unseen.reason, { ...unseen, project: 0 }], ["NO_SUCH_PROJECT", { ...absent, project: 0 }]);
    const onQ = w.cit[act]({ project: "INQ-2026-0001", handle: h, ...ANN, reason: "" });
    assert.deepEqual([onQ.reason, onQ.got], ["NOT_A_PROJECT", "inquiry"]);
    const ha = await w.select(["INFO-2026-0001"], { viewer: V("adm"), owner: "a" });
    const adm = w.cit[act]({ project: p, handle: ha, viewer: V("adm"), owner: "a", identity: V("adm"), reason: "" });
    assert.deepEqual([adm.reason, adm.act], ["PROJECT_ACT_NOT_A_PARTICIPANT", act]);
    for (const reason of ["", "   ", null, undefined])
      assert.equal(w.cit[act]({ project: p, handle: h, ...ANN, reason }).reason, "NO_REASON");
    for (const reason of ["x".repeat(EDGE_REASON_MAX + 1), 'a"b', "a\\b", "a\nb"])
      assert.equal(w.cit[act]({ project: p, handle: h, ...ANN, reason }).reason, "BAD_REASON");
  }
  assert.equal(EDGE_REASON_MAX, 160);
  assert.equal(w.cit.sever({ project: p, handle: h, ...ANN, reason: "r".repeat(EDGE_REASON_MAX) }).ok, true);
});

test("R4: EMPTY_SELECTION, then NOT_INFORMATION for a member neither information nor an inquiry, the whole call refused", async () => {
  const { w, p } = await setup();
  /* An enumeration of ids that name nothing resolves to no members without moving (a purged member would move it,
     which weight refuse answers first, SET_MOVED). */
  const none = await w.select(["INFO-2026-9999"]);
  const e = w.cit.sever({ project: p, handle: none, ...ANN, reason: "x" });
  assert.deepEqual([e.reason, e.handle, e.project], ["EMPTY_SELECTION", none, p]);
  assert.equal(w.cit.reinstate({ project: p, handle: none, ...ANN, reason: "x" }).reason, "EMPTY_SELECTION");
  const p2 = w.project("Other");
  const mixed = await w.select(["INFO-2026-0001", p2]);
  const r = w.cit.sever({ project: p, handle: mixed, ...ANN, reason: "x" });
  assert.deepEqual([r.reason, r.offenders, r.citable], ["NOT_INFORMATION", [p2], ["information", "inquiry"]]);
  assert.equal(edge(w, p, "INFO-2026-0001").status, "confirmed");
});

test("R4, R5, R11: reinstating a member R5 answers true is RETIRED_NOT_CITABLE (C-33.39), naming every retired member; severing it is allowed", async () => {
  const { w, p, h } = await setup();
  assert.equal(w.cit.sever({ project: p, handle: h, ...ANN, reason: "cut" }).ok, true);
  w.revise("INFO-2026-0002", w.md("INFO-2026-0002").replace("current_state: collected", "current_state: verified"));
  w.revise("INFO-2026-0002", w.md("INFO-2026-0002").replace("current_state: verified", "current_state: retired"));
  assert.equal(w.cit.retiredNotCitable("INFO-2026-0002"), true);
  const h2 = await w.select(["INFO-2026-0001", "INFO-2026-0002", "INQ-2026-0001"]);
  const r = w.cit.reinstate({ project: p, handle: h2, ...ANN, reason: "back" });
  assert.deepEqual([r.ok, r.reason, r.code, r.check, r.translation, r.offenders],
    [false, "RETIRED_NOT_CITABLE", "RETIRED_NOT_CITABLE", "C-33.39", CITE_CHECKS.RETIRED_NOT_CITABLE.translation, ["INFO-2026-0002"]]);
  assert.equal(edge(w, p, "INFO-2026-0001").status, "severed", "the whole call refused");
  /* Withdrawing reliance on a retired item is the direction the rule wants: a confirmed edge to it is severed. */
  const p2 = w.project("Older case");
  w.revise(p2, w.md(p2).replace("references: []", "references:\n  - rel: cites\n    target: INFO-2026-0002\n    status: confirmed\n    note: \"\""));
  const only = await w.select(["INFO-2026-0002"]);
  assert.equal(w.cit.sever({ project: p2, handle: only, ...ANN, reason: "retired" }).ok, true);
  assert.equal(edge(w, p2, "INFO-2026-0002").status, "severed");
});

test("R4: every member's edge must be in the source state — NOT_CITED to sever, NOT_SEVERED to reinstate — naming the offenders, the whole call refused", async () => {
  const { w, p, h } = await setup();
  const withUncited = await w.select(["INFO-2026-0003", "INFO-2026-0001"]);
  const nc = w.cit.sever({ project: p, handle: withUncited, ...ANN, reason: "x" });
  assert.deepEqual([nc.reason, nc.offenders], ["NOT_CITED", ["INFO-2026-0003"]]);
  assert.equal(edge(w, p, "INFO-2026-0001").status, "confirmed");
  const ns = w.cit.reinstate({ project: p, handle: h, ...ANN, reason: "x" });
  assert.deepEqual([ns.reason, ns.offenders], ["NOT_SEVERED", ["INFO-2026-0001", "INFO-2026-0002", "INQ-2026-0001"]]);
  w.cit.sever({ project: p, handle: h, ...ANN, reason: "cut" });
  assert.deepEqual(w.cit.sever({ project: p, handle: h, ...ANN, reason: "again" }).offenders, ["INFO-2026-0001", "INFO-2026-0002", "INQ-2026-0001"]);
});

test("R4: NO_BUNDLE_MD, UNPARSEABLE_FRONTMATTER and UNSPLICEABLE_REFERENCES", async () => {
  const { w, p, h } = await setup();
  assert.equal(w.withDocument(p, null).sever({ project: p, handle: h, ...ANN, reason: "x" }).reason, "NO_BUNDLE_MD");
  assert.equal(w.withDocument(p, "not a document").sever({ project: p, handle: h, ...ANN, reason: "x" }).reason, "UNPARSEABLE_FRONTMATTER");
  /* A target the block carries twice: the splice would move two entries for one change, so it declines to guess. */
  const twice = w.md(p).replace("references:\n", "references:\n  - rel: cites\n    target: INFO-2026-0001\n    status: confirmed\n    note: \"\"\n");
  assert.equal(w.withDocument(p, twice).sever({ project: p, handle: h, ...ANN, reason: "x" }).reason, "UNSPLICEABLE_REFERENCES");
  assert.equal(w.fm(p).references.every((e) => e.status === "confirmed"), true);
});

test("R4: CITATION_TOO_LARGE when the appended reasons would pass 1 MiB, nothing written", async () => {
  const w = world();
  w.info("INFO-2026-0001", { captured: false });
  const base = projMd("Big").length;
  const p = w.project("Big", "ann", { body: "\n" + "z".repeat(INLINE_MAX - base - 400) + "\n" });
  const h = await w.select(["INFO-2026-0001"]);
  assert.equal(w.cit.cite({ project: p, handle: h, ...ANN }).ok, true);
  const before = w.md(p);
  const r = w.cit.sever({ project: p, handle: h, ...ANN, reason: "r".repeat(EDGE_REASON_MAX) });
  assert.deepEqual([r.ok, r.reason, r.limit], [false, "CITATION_TOO_LARGE", INLINE_MAX]);
  assert.ok(r.bytes > INLINE_MAX);
  assert.equal(w.md(p), before);
});

test("R4: the Session Log entry names at most 20 ids and counts the rest", async () => {
  const w = world();
  const ids = [];
  for (let i = 1; i <= 22; i++) { const id = `INFO-2026-${String(i).padStart(4, "0")}`; w.info(id, { captured: false }); ids.push(id); }
  const p = w.project();
  const h = await w.select(ids);
  w.cit.cite({ project: p, handle: h, ...ANN });
  w.cit.sever({ project: p, handle: h, ...ANN, reason: "all" });
  assert.match(w.md(p), new RegExp(`Changes: cites edges to ${ids.slice(0, CITE_LOG_SAMPLE).join(", ")}, and 2 more moved to 'severed'\\. Reason: all\\.\\n`));
});

test("R7: sever and reinstate are refuse whatever the caller sends: a moved selection is SET_MOVED and nothing moves", async () => {
  const { w, p, h } = await setup();
  w.revise("INFO-2026-0001", w.md("INFO-2026-0001").replace('title: "Document INFO-2026-0001"', 'title: "Moved"'));
  const r = w.cit.sever({ project: p, handle: h, ...ANN, reason: "x", weight: "report" });
  assert.deepEqual([r.ok, r.reason], [false, "SET_MOVED"]);
  assert.equal(edge(w, p, "INFO-2026-0001").status, "confirmed");
  const r2 = w.cit.reinstate({ project: p, handle: h, ...ANN, reason: "x", weight: "report" });
  assert.equal(r2.reason, "SET_MOVED");
});
