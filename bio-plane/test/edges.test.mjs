/* Severing and reinstating a citation: the FIRST state-changing actions to refer
 * to a selection, and therefore the first callers of `selectionResolve`'s
 * REFUSING arm.
 *
 * 0.18.0 shipped `cite` at weight `report` and left the refusing arm with no
 * caller, deliberately. It also left a hole: edges could be created and never
 * withdrawn. A citation a group can make but never take back is not a record of
 * their reasoning, it is an accumulation, and the 0.18.0 suite had to hand-edit
 * frontmatter to produce a severed edge at all.
 *
 * What these two actions are held to, beyond working:
 *
 *   THEY REFUSE ON DRIFT AND WRITE NOTHING. That is the whole point of weight
 *   `refuse`: a state transition landing on a set the operator did not see is
 *   the accountability failure the record exists to prevent. Asserted by moving
 *   the set under a live selection and checking the document is byte-identical
 *   afterwards.
 *
 *   THEY REQUIRE A REASON. Doctrine says an edge is severed with a reason
 *   (C-6.1's remediation, State Rules 5.1). A severance with no reason is an
 *   unexplained deletion wearing a status field, so it is refused.
 *
 *   THEY PRESERVE WHAT WAS THERE. Severing does not delete the edge, it changes
 *   its status: the target, the rel, and the original citation note survive, and
 *   the reason is added rather than substituted. Reinstating does the same in
 *   reverse. Nothing in this pair ever removes a reference.
 *
 *   THE STATE MACHINE IS CLOSED. Severing something already severed, or
 *   reinstating something never severed, is refused by name rather than treated
 *   as a no-op, because both mean the operator is looking at a stale view.
 */
import { Miniflare } from "miniflare";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { parseFrontmatter, checkBundle } from "../checks/bio-checks.mjs";

const SRC = (f) => fileURLToPath(new URL("../src/" + f, import.meta.url));
const sha = (s) => createHash("sha256").update(s).digest("hex");
let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${JSON.stringify(want)}\n         got  ${JSON.stringify(got)}`}`);
  ok ? pass++ : fail++;
};

const mf = new Miniflare({
  modules: true, script: readFileSync(SRC("store.mjs"), "utf8"),
  modulesRoot: "/", scriptPath: SRC("store.mjs"),
  compatibilityDate: "2026-07-01",
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
});
const call = async (p, body) => (await (await mf.dispatchFetch("http://x" + p,
  body ? { method: "POST", body: JSON.stringify(body) } : {})).json()).result;

const STAMP = "viewer=class:member&owner=class:member";

const infoMd = (b) => `---
id: ${b.id}
object_type: information
schema: information@1
title: "${b.title}"
current_state: ${b.state || "collected"}
prior_state: null
created: "2026-07-01T00:00:00Z"
last_updated: "${b.updated || "2026-07-02T00:00:00Z"}"
produced_by:
  mode: assisted
  capability_tier: session
group: believe-in-oakland
references: []
state_history: []
annotations_open: 0
reeval_pending:
  flag: false
  since: null
  source: null
visuals: []
criticality: supporting
classification: fact
source_status: unchanged
source:
  locator: "https://example.org/${b.id}"
  authority: "portal"
  retrieved: "2026-07-01"
monitoring:
  enabled: false
  frequency: none
---

## Summary

${b.body || "Body."}

## Provenance Notes

Captured.

## Session Log

### Session 2026-07-02T00:00:00Z | Capture | assisted
Trigger: acquisition
Changes: collected.

## Review Notes

`;

const projMd = (p) => `---
id: ${p.id}
object_type: project
schema: project@1
title: "${p.title}"
current_state: forming
prior_state: null
created: "2026-07-01T00:00:00Z"
last_updated: "2026-07-02T00:00:00Z"
produced_by:
  mode: assisted
  capability_tier: session
group: believe-in-oakland
references: []
state_history: []
annotations_open: 0
reeval_pending:
  flag: false
  since: null
  source: null
visuals: []
objective: "Test the edge lifecycle."
workproduct_state: draft
evaluations: []
---

## Thesis Summary

Frame.

## Open Questions

1. Q.

## Ruled Out

Nothing.

## Session Log

### Session 2026-07-02T00:00:00Z | Formation | assisted
Trigger: elevation
Changes: created.

## Review Notes

`;

const promoteRaw = async (id, text, meta, base = null, extra = []) => call("/promote", {
  bundleId: id, base, snapKey: `${id}-${base ? Date.now() + Math.random() : "new"}`,
  author: "suite",
  files: [{ path: "bundle.md", text, bytes: text.length, sha256: sha(text) }, ...extra],
  meta,
});
const infoMeta = (b) => ({
  object_type: "information", group: "believe-in-oakland", title: b.title,
  current_state: b.state || "collected", prior_state: null,
  created: "2026-07-01T00:00:00Z", last_updated: b.updated || "2026-07-02T00:00:00Z",
  criticality: "supporting", classification: "fact",
});
const projMeta = (p) => ({
  object_type: "project", group: "believe-in-oakland", title: p.title,
  current_state: "forming", prior_state: null,
  created: "2026-07-01T00:00:00Z", last_updated: "2026-07-02T00:00:00Z",
});

const KEEP = JSON.stringify({ captures: [] });
const INFOS = [];
for (let i = 0; i < 4; i++) INFOS.push({
  id: `INFO-2026-${8000 + i}-${["alpha", "bravo", "charlie", "delta"][i]}`,
  title: `Evidence ${i}`, body: `Detail number ${i}.`,
});
/* Created but deliberately NEVER cited, so "exists but carries no edge" is a
   distinct case from "does not exist at all". */
const UNCITED = { id: "INFO-2026-8009-uncited", title: "Never cited", body: "Unused." };
const PROJ = { id: "PROJ-2026-0001-edges", title: "Edge lifecycle" };

for (const b of [...INFOS, UNCITED]) await promoteRaw(b.id, infoMd(b), infoMeta(b));
{
  const text = projMd(PROJ);
  await promoteRaw(PROJ.id, text, projMeta(PROJ), null,
    [{ path: "data/keep.json", text: KEEP, bytes: KEEP.length, sha256: sha(KEEP) }]);
}

const sel = async (ids) => (await call(`/select?${STAMP}`, { ids })).handle;
const cite = async (ids, note = "") =>
  call(`/cite?${STAMP}&project=${PROJ.id}&handle=${await sel(ids)}${note ? "&note=" + encodeURIComponent(note) : ""}`, {});
const sever = async (ids, reason, extra = "") =>
  call(`/sever?${STAMP}&project=${PROJ.id}&handle=${await sel(ids)}${reason !== null ? "&reason=" + encodeURIComponent(reason) : ""}${extra}`, {});
const reinstate = async (ids, reason, extra = "") =>
  call(`/reinstate?${STAMP}&project=${PROJ.id}&handle=${await sel(ids)}${reason !== null ? "&reason=" + encodeURIComponent(reason) : ""}${extra}`, {});

const doc = async () => (await call(`/file?id=${PROJ.id}&path=bundle.md`)).text;
const liveSha = async (id) => (await call(`/index`)).bundles.find((b) => b.id === id)?.sha256 ?? null;
const edge = async (target) =>
  (parseFrontmatter(await doc()).data.references || []).find((r) => r.target === target) || null;
const conformance = async () => {
  const img = await call(`/image?id=${PROJ.id}`);
  const files = new Map(), elided = new Set();
  for (const [p, v] of Object.entries(img)) {
    if (typeof v === "string") files.set(p, v); else elided.add(p);
  }
  const known = new Set((await call(`/index`)).bundles.map((b) => b.id));
  const { findings } = await checkBundle({
    folderName: PROJ.id, files, elidedPaths: elided, resolveTarget: (k) => known.has(k),
  });
  return findings.filter((f) => f.severity === "error").map((e) => `${e.check}: ${e.message}`);
};

/* ------------------------------------------------------------------ suite */

console.log("\n--- setup: cite four records, and start clean ---");
{
  const r = await cite(INFOS.map((b) => b.id), "original citation reason");
  t("four edges cited", r.cited.length, 4);
  t("the project is conformant to start with", await conformance(), []);
}

console.log("\n--- severing withdraws an edge without deleting it ---");
{
  const before = (parseFrontmatter(await doc()).data.references || []).length;
  const r = await sever([INFOS[1].id], "superseded by a better source");
  t("it succeeds", r.ok, true);
  t("it ran at the refusing weight", r.weight, "refuse");
  t("it names what it severed", r.severed, [INFOS[1].id]);

  const e = await edge(INFOS[1].id);
  t("the edge is still there", e !== null, true);
  t("with status severed", e.status, "severed");
  t("the target is unchanged", e.target, INFOS[1].id);
  t("the rel is unchanged", e.rel, "cites");
  t("the original citation note survives", e.note.includes("original citation reason"), true);
  t("and the severance reason is recorded on the edge", e.note.includes("superseded by a better source"), true);
  t("no reference was removed", (parseFrontmatter(await doc()).data.references || []).length, before);
  t("the bundle is still conformant", await conformance(), []);
}

console.log("\n--- the record accounts for it ---");
{
  const text = await doc();
  const log = text.slice(text.indexOf("## Session Log"));
  t("a Session Log entry names the severance", /### Session .*Severed/i.test(log), true);
  t("and carries the full reason", log.includes("superseded by a better source"), true);
  t("other files survived the whole-image write", (await call(`/file?id=${PROJ.id}&path=data%2Fkeep.json`)).text, KEEP);
}

console.log("\n--- a severance with no reason is refused ---");
{
  const before = await liveSha(PROJ.id);
  t("empty reason refused", (await sever([INFOS[2].id], "")).reason, "NO_REASON");
  t("absent reason refused", (await sever([INFOS[2].id], null)).reason, "NO_REASON");
  t("nothing was written", await liveSha(PROJ.id), before);
}

console.log("\n--- the edge state machine is closed, not forgiving ---");
{
  const before = await liveSha(PROJ.id);
  t("severing an already-severed edge is refused",
    (await sever([INFOS[1].id], "again")).reason, "NOT_CITED");
  /* An id that does not exist resolves to an EMPTY selection, which is refused
     as such: the first implementation reported success and promoted an
     unchanged document, which is a revision in an append-only history saying
     nothing happened. */
  t("a selection that resolves to nothing is refused",
    (await sever(["INFO-2026-9999-absent"], "why")).reason, "EMPTY_SELECTION");
  t("severing a record that exists but was never cited is refused",
    (await sever([UNCITED.id], "why")).reason, "NOT_CITED");
  t("reinstating an edge that was never severed is refused",
    (await reinstate([INFOS[2].id], "why")).reason, "NOT_SEVERED");
  t("nothing was written by any of them", await liveSha(PROJ.id), before);
}

console.log("\n--- REFUSING WEIGHT: drift stops the action and writes nothing ---");
{
  /* This is what 0.17.0 built the weight for and 0.18.0 could not exercise. */
  const h = await sel([INFOS[2].id]);
  const cur = await liveSha(INFOS[2].id);
  const b2 = { ...INFOS[2], body: "Revised after selection.", updated: "2026-07-11T00:00:00Z" };
  t("the record moved under the selection", (await promoteRaw(INFOS[2].id, infoMd(b2), infoMeta(b2), cur)).ok, true);

  const before = await liveSha(PROJ.id);
  const r = await call(`/sever?${STAMP}&project=${PROJ.id}&handle=${h}&reason=${encodeURIComponent("no longer relied upon")}`, {});
  t("the severance refuses", r.ok, false);
  t("naming the set as the reason", r.reason, "SET_MOVED");
  t("it reports the drift it saw", r.drift.revised.map((x) => x.bundleId), [INFOS[2].id]);
  t("it hands over no members", r.members, []);
  t("and the project is byte-identical", await liveSha(PROJ.id), before);

  /* Re-selecting after looking again is the whole point: the operator sees the
     current set and the action then proceeds. */
  const r2 = await sever([INFOS[2].id], "no longer relied upon");
  t("re-selecting lets it proceed", r2.ok, true);
  t("and it severed", r2.severed, [INFOS[2].id]);
}

console.log("\n--- reinstating restores a severed edge, with its own reason ---");
{
  const r = await reinstate([INFOS[1].id], "the objection was answered");
  t("it succeeds", r.ok, true);
  t("at the refusing weight", r.weight, "refuse");
  t("it names what it restored", r.reinstated, [INFOS[1].id]);

  const e = await edge(INFOS[1].id);
  t("the edge is confirmed again", e.status, "confirmed");
  t("the severance reason is still in the note", e.note.includes("superseded by a better source"), true);
  t("and the reinstatement reason is too", e.note.includes("the objection was answered"), true);
  t("the bundle is still conformant", await conformance(), []);
  const text = await doc();
  t("the Session Log names the reinstatement",
    /### Session .*Reinstated/i.test(text.slice(text.indexOf("## Session Log"))), true);
}

console.log("\n--- reinstating also refuses on drift, and needs a reason ---");
{
  const before = await liveSha(PROJ.id);
  t("no reason refused", (await reinstate([INFOS[2].id], "")).reason, "NO_REASON");
  const h = await sel([INFOS[2].id]);
  const cur = await liveSha(INFOS[2].id);
  const b3 = { ...INFOS[2], body: "Moved again.", updated: "2026-07-12T00:00:00Z" };
  await promoteRaw(INFOS[2].id, infoMd(b3), infoMeta(b3), cur);
  const r = await call(`/reinstate?${STAMP}&project=${PROJ.id}&handle=${h}&reason=${encodeURIComponent("x")}`, {});
  t("drift refuses the reinstatement too", r.reason, "SET_MOVED");
  t("nothing was written", await liveSha(PROJ.id), before);
}

console.log("\n--- the whole set moves together or not at all ---");
{
  /* One member in the wrong state refuses the batch, so a bulk severance cannot
     half-run. Same doctrine as citing refusing a mixed selection. */
  const before = await liveSha(PROJ.id);
  const r = await sever([INFOS[0].id, INFOS[1].id, INFOS[2].id], "batch");
  t("a batch with one already-severed member refuses", r.ok, false);
  t("with the offenders named", r.reason, "NOT_CITED");
  t("nothing was written", await liveSha(PROJ.id), before);

  const ok = await sever([INFOS[0].id, INFOS[3].id], "both withdrawn together");
  t("a clean batch severs both", ok.severed, [INFOS[0].id, INFOS[3].id]);
  t("and stays conformant", await conformance(), []);
}

console.log("\n--- negative controls ---");
{
  const files = new Map([["bundle.md", "not a bundle\n"]]);
  const { findings } = await checkBundle({
    folderName: PROJ.id, files, elidedPaths: new Set(), resolveTarget: () => true });
  t("the conformance check can still fail", findings.filter((f) => f.severity === "error").length > 0, true);
  const e = await edge(INFOS[1].id);
  t("and the edge reader can still find a confirmed edge", e.status, "confirmed");
}

await mf.dispose();
console.log(`\nedges: ${pass} pass, ${fail} fail`);
process.exit(fail ? 1 : 0);
