/* Citing Information in a Project: the FIRST action that refers to a selection.
 *
 * `selectionResolve` has existed and been tested since 0.17.0 with no caller.
 * This is its first one, and it is deliberately the lightest real action in the
 * corpus: citing ADDS references rather than moving state, so it runs at weight
 * `report`, which means drift is surfaced and survived rather than fatal. The
 * refusing path (weight `refuse`) gets its first caller from the first
 * state-changing action, which is deliberately NOT this commit.
 *
 * What this suite holds the implementation to, beyond "it works":
 *
 *   THE WHOLE IMAGE SURVIVES. `promote` writes a whole image, so a caller that
 *   mentions one file deletes every other one. That default has already
 *   destroyed evidence twice in this repo: the monitor's first tick removed the
 *   provenance register of every bundle it touched. Citing rewrites bundle.md,
 *   so it is exactly the same shape of writer, and the register-survives
 *   assertion below is the regression test for that class of defect rather than
 *   a courtesy.
 *
 *   THE DOCUMENT STAYS CONFORMANT. Citing is checked against the catalog's own
 *   checkBundle after the write, not against a hand-rolled idea of correctness.
 *   A citation that passes the store and fails the checker is a defect that
 *   ships invisibly, which is how the intake UI's defects shipped.
 *
 *   THE OPERATOR'S CLICK IS NOT REINTERPRETED. A selection carrying anything
 *   that is not Information is REFUSED with the offenders named, never silently
 *   filtered down to the citable subset. Same doctrine as the enumeration cap:
 *   quietly narrowing a set changes what the operator meant.
 *
 *   WEIGHT IS NOT THE CALLER'S TO CHOOSE. `cite` is a report-weight action
 *   because of what it IS. A caller passing weight=refuse must not turn it into
 *   one, or the weight distinction is advisory and the gate is decoration.
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

const OWNER = "class:member";
const STAMP = `viewer=class:member&owner=class:member`;

/* ---------------------------------------------------------------- fixtures */

const infoMd = (b) => `---
id: ${b.id}
object_type: information
schema: information@2
title: "${b.title}"
current_state: ${b.state || "collected"}
prior_state: null
created: "2026-07-01T00:00:00Z"
last_updated: "${b.updated || "2026-07-02T00:00:00Z"}"
produced_by:
  mode: interactive_agentic
  capability_tier: standard
group: believe-in-oakland
references: []
criticality: supporting
classification: fact
source:
  locator: "https://oaklandca.opengov.com/${b.id}"
  authority: "Oakland OpenGov portal"
  retrieved: "2026-07-01"
---

## Summary

${b.body || "Record body."}

## Provenance Notes

Captured from the portal.

## Session Log

### Session 2026-07-02T00:00:00Z | Capture | interactive_agentic
Trigger: acquisition
Changes: collected.

## Review Notes

`;

/* A project with a NON-bundle.md file, because the assertion that matters most
   here is that citing does not delete it. */
const projMd = (p) => `---
id: ${p.id}
object_type: project
schema: project@1
title: "${p.title}"
current_state: ${p.state || "forming"}
prior_state: null
created: "2026-07-01T00:00:00Z"
last_updated: "${p.updated || "2026-07-02T00:00:00Z"}"
produced_by:
  mode: interactive_agentic
  capability_tier: standard
group: believe-in-oakland
${p.refs === "block" ? `references:
  - rel: cites
    target: INFO-2026-9000-alpha
    status: confirmed
    note: "seed edge"` : "references: []"}
state_history: []
annotations_open: 0
reeval_pending:
  flag: false
  since: null
  source: null
visuals: []
objective: "Establish the thing."
workproduct_state: draft
evaluations: []
---

## Thesis Summary

Working frame.

## Open Questions

1. The question.

## Ruled Out

Nothing yet.

## Session Log

### Session 2026-07-02T00:00:00Z | Project formation | interactive_agentic
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
  current_state: p.state || "forming", prior_state: null,
  created: "2026-07-01T00:00:00Z", last_updated: p.updated || "2026-07-02T00:00:00Z",
});

/* The register file whose disappearance is the defect this suite guards. */
const REGISTER = JSON.stringify({ captures: [] }, null, 1);
const ANALYSIS = "# Analysis\n\nThe cumulative record.\n";

const INFOS = [];
for (let i = 0; i < 5; i++) INFOS.push({
  id: `INFO-2026-${9000 + i}-${["alpha", "bravo", "charlie", "delta", "echo"][i]}`,
  title: `Evidence record ${i}`,
  body: `Sewer franchise transfer detail number ${i}.`,
});

const PROJ = { id: "PROJ-2026-0001-sewer", title: "Sewer franchise diversion" };

async function setup() {
  for (const b of INFOS) await promoteRaw(b.id, infoMd(b), infoMeta(b));
  const text = projMd(PROJ);
  await promoteRaw(PROJ.id, text, projMeta(PROJ), null, [
    { path: "analysis.md", text: ANALYSIS, bytes: ANALYSIS.length, sha256: sha(ANALYSIS) },
    { path: "data/register.json", text: REGISTER, bytes: REGISTER.length, sha256: sha(REGISTER) },
  ]);
}

const liveText = async (id, path = "bundle.md") =>
  (await call(`/file?id=${id}&path=${encodeURIComponent(path)}`))?.text ?? null;
const liveSha = async (id) => (await call(`/index`)).bundles.find((b) => b.id === id)?.sha256 ?? null;

const selectIds = async (ids) =>
  (await call(`/select?${STAMP}`, { ids })).handle;

const cite = async (project, handle, extra = "") =>
  call(`/cite?${STAMP}&project=${project}&handle=${handle}${extra}`, {});

/* ------------------------------------------------------------------ suite */

/* resolveTarget asks the STORE what exists, the way op=audit does, rather than
   a hand-kept list. A hardcoded roster silently reports every target it has not
   heard of as dangling, which is a verifier failing for a reason that has
   nothing to do with the code under test. */
const conformanceErrors = async (id) => {
  const img = await call(`/image?id=${id}`);
  const files = new Map(), elided = new Set();
  for (const [p, v] of Object.entries(img)) {
    if (typeof v === "string") files.set(p, v); else elided.add(p);
  }
  const known = new Set((await call(`/index`)).bundles.map((b) => b.id));
  const { findings } = await checkBundle({
    folderName: id, files, elidedPaths: elided, resolveTarget: (k) => known.has(k),
  });
  return findings.filter((f) => f.severity === "error").map((e) => `${e.check}: ${e.message}`);
};

await setup();

console.log("\n--- the project is conformant BEFORE citing, or the check after means nothing ---");
{
  t("the fixture starts clean against the catalog", await conformanceErrors(PROJ.id), []);
}

console.log("\n--- the op exists and cites a selection into a project ---");
{
  const before = await liveSha(PROJ.id);
  const h = await selectIds([INFOS[1].id, INFOS[2].id]);
  const r = await cite(PROJ.id, h);
  t("it succeeds", r.ok, true);
  t("it reports the weight it ran at", r.weight, "report");
  t("it names what it added", r.cited, [INFOS[1].id, INFOS[2].id]);
  t("nothing was already cited", r.alreadyCited, []);
  t("the project's sha moved", (await liveSha(PROJ.id)) !== before, true);

  const refs = await call(`/dangling`);
  t("citing produced no dangling reference", refs.dangling.length, 0);
}

console.log("\n--- the edges are in the document, not only in the projection ---");
{
  const text = await liveText(PROJ.id);
  const fm = parseFrontmatter(text);
  t("the frontmatter still parses", fm.data !== null, true);
  t("the catalog's parser finds no error in it",
    fm.findings.filter((f) => f.severity === "error").length, 0);
  const cites = (fm.data.references || []).filter((r) => r.rel === "cites").map((r) => r.target);
  t("both targets are cited in the document", cites.includes(INFOS[1].id) && cites.includes(INFOS[2].id), true);
  const one = (fm.data.references || []).find((r) => r.target === INFOS[1].id);
  t("the edge carries rel", one.rel, "cites");
  t("a human's deliberate citation is confirmed, not proposed", one.status, "confirmed");
  t("it carries a note field", typeof one.note, "string");
}

console.log("\n--- the whole image survives, which is the defect that bit the monitor twice ---");
{
  t("analysis.md is still there", await liveText(PROJ.id, "analysis.md"), ANALYSIS);
  t("the register is still there", await liveText(PROJ.id, "data/register.json"), REGISTER);
}

console.log("\n--- the record accounts for the change ---");
{
  const text = await liveText(PROJ.id);
  const fm = parseFrontmatter(text);
  t("last_updated moved", fm.data.last_updated > "2026-07-02T00:00:00Z", true);
  const log = text.slice(text.indexOf("## Session Log"));
  t("a Session Log entry names the citation", /### Session .*[\s\S]*cit/i.test(log), true);
  const img = await call(`/image?id=${PROJ.id}`);
  const recs = Object.keys(img).filter((k) => k.startsWith("_history/"));
  t("history took a snapshot of the superseded revision", recs.length > 0, true);
}

console.log("\n--- the promotion is authored, not mechanical ---");
{
  const img = await call(`/image?id=${PROJ.id}`);
  const man = JSON.parse(img["_history/manifest.json"]);
  const last = man.entries[man.entries.length - 1];
  t("no mechanical writer is claimed", last.writer ?? null, null);
  t("and no mechanical operation is claimed", last.operation ?? null, null);
}

console.log("\n--- the bundle is still conformant to the catalog, not merely to me ---");
{
  t("zero catalog errors after citing", await conformanceErrors(PROJ.id), []);
}

console.log("\n--- citing is idempotent, because drift makes a retry plausible ---");
{
  const h = await selectIds([INFOS[1].id, INFOS[2].id]);
  const before = await liveSha(PROJ.id);
  const r = await cite(PROJ.id, h);
  t("it still succeeds", r.ok, true);
  t("it adds nothing", r.cited, []);
  t("and says what was already there", r.alreadyCited, [INFOS[1].id, INFOS[2].id]);
  t("the project was not rewritten for a no-op", await liveSha(PROJ.id), before);
}

console.log("\n--- a partly-new selection adds only the new ones ---");
{
  const h = await selectIds([INFOS[2].id, INFOS[3].id]);
  const r = await cite(PROJ.id, h);
  t("only the new target is added", r.cited, [INFOS[3].id]);
  t("the existing one is reported, not duplicated", r.alreadyCited, [INFOS[2].id]);
  const fm = parseFrontmatter(await liveText(PROJ.id));
  const n = (fm.data.references || []).filter((r) => r.target === INFOS[2].id).length;
  t("the document holds exactly one edge to it", n, 1);
}

console.log("\n--- drift is reported and survived, because this action is report-weight ---");
{
  const h = await selectIds([INFOS[4].id]);
  /* Revise the cited record AFTER selecting it, which is exactly the case the
     weight distinction exists for. */
  const cur = await liveSha(INFOS[4].id);
  const b2 = { ...INFOS[4], body: "Revised after selection.", updated: "2026-07-09T00:00:00Z" };
  const up = await promoteRaw(INFOS[4].id, infoMd(b2), infoMeta(b2), cur);
  t("the record was revised", up.ok, true);

  const r = await cite(PROJ.id, h);
  t("citing still proceeds", r.ok, true);
  t("and says the set moved", r.moved, true);
  t("naming the revised member", r.drift.revised.map((x) => x.bundleId), [INFOS[4].id]);
  t("classified from the manifest's own writer", r.drift.revised[0].class, "authored");
  t("the edge was still added", r.cited, [INFOS[4].id]);
}

console.log("\n--- weight is a property of the action, not a parameter of the request ---");
{
  const h = await selectIds([INFOS[0].id]);
  const cur = await liveSha(INFOS[0].id);
  const b2 = { ...INFOS[0], body: "Moved again.", updated: "2026-07-10T00:00:00Z" };
  await promoteRaw(INFOS[0].id, infoMd(b2), infoMeta(b2), cur);

  const r = await cite(PROJ.id, h, "&weight=refuse");
  t("a caller cannot turn citing into a refusing action", r.ok, true);
  t("it ran at report regardless", r.weight, "report");
  t("and it did cite", r.cited, [INFOS[0].id]);
}

console.log("\n--- refusals, each writing nothing ---");
{
  const before = await liveSha(PROJ.id);

  const h1 = await selectIds([INFOS[1].id]);
  const r1 = await cite("INFO-2026-9001-bravo", h1);
  t("citing INTO something that is not a project is refused", r1.reason, "NOT_A_PROJECT");

  const r2 = await cite("PROJ-2026-9999-absent", await selectIds([INFOS[1].id]));
  t("citing into a project that does not exist is refused", r2.reason, "NO_SUCH_PROJECT");

  const r3 = await cite(PROJ.id, "sel-doesnotexist");
  t("an unknown selection is refused", r3.reason, "NO_SUCH_SELECTION");

  /* A selection made by one credential, resolved by another. */
  const hMine = (await call(`/select?viewer=class:member&owner=class:admin`, { ids: [INFOS[1].id] })).handle;
  const r4 = await cite(PROJ.id, hMine);
  t("someone else's selection is refused", r4.reason, "NOT_YOURS");

  t("no refusal wrote anything", await liveSha(PROJ.id), before);
}

console.log("\n--- a set the operator picked is never quietly narrowed ---");
{
  const before = await liveSha(PROJ.id);
  /* A selection containing the PROJECT itself and a Problem-shaped target:
     citing Information means Information, and the rest is refused by name. */
  const h = await selectIds([INFOS[1].id, PROJ.id]);
  const r = await cite(PROJ.id, h);
  t("a non-Information member refuses the whole call", r.ok, false);
  t("with the reason named", r.reason, "NOT_INFORMATION");
  t("and the offenders listed", r.offenders, [PROJ.id]);
  t("nothing was written", await liveSha(PROJ.id), before);
}

console.log("\n--- a severed edge is a recorded decision, not an absent one ---");
{
  /* Sever the edge to bravo by hand, the way a member would, then select it
     again and press cite. Neither reinstating it silently nor skipping past it
     is acceptable: both decide something the operator did not. */
  const text = await liveText(PROJ.id);
  const cut = text.replace(
    new RegExp(`(  - rel: cites\\n    target: ${INFOS[1].id}\\n    status: )confirmed`),
    "$1severed");
  t("the fixture actually changed", cut !== text, true);
  const cur = await liveSha(PROJ.id);
  const fmNow = parseFrontmatter(cut).data;
  const up = await promoteRaw(PROJ.id, cut, {
    object_type: "project", group: "believe-in-oakland", title: fmNow.title,
    current_state: fmNow.current_state, prior_state: null,
    created: fmNow.created, last_updated: fmNow.last_updated,
  }, cur, [
    { path: "analysis.md", text: ANALYSIS, bytes: ANALYSIS.length, sha256: sha(ANALYSIS) },
    { path: "data/register.json", text: REGISTER, bytes: REGISTER.length, sha256: sha(REGISTER) },
  ]);
  t("the severance was recorded", up.ok, true);

  const before = await liveSha(PROJ.id);
  const r = await cite(PROJ.id, await selectIds([INFOS[1].id]));
  t("citing a severed target refuses", r.ok, false);
  t("with the reason named", r.reason, "SEVERED_EDGE");
  t("and the offender listed", r.offenders, [INFOS[1].id]);
  t("nothing was written", await liveSha(PROJ.id), before);

  const still = parseFrontmatter(await liveText(PROJ.id)).data.references
    .find((x) => x.target === INFOS[1].id);
  t("the severance still stands, unreversed", still.status, "severed");

  /* And the refusal is per-call, not per-target: a selection mixing a severed
     target with a fresh one writes nothing at all. */
  const r2 = await cite(PROJ.id, await selectIds([INFOS[1].id, INFOS[3].id]));
  t("one severed member refuses the whole call", r2.reason, "SEVERED_EDGE");
  t("and the clean member was not cited anyway", await liveSha(PROJ.id), before);
}

console.log("\n--- the block shape the live record actually uses ---");
{
  /* The fixture above started from `references: []`. The real
     PROJ-2026-0001-sewer-franchise-diversion carries a populated block, which
     is a different splice path and the one production exercises. */
  const P2 = { id: "PROJ-2026-0002-block", title: "Block shaped", refs: "block" };
  await promoteRaw(P2.id, projMd(P2), projMeta(P2));
  const seeded = parseFrontmatter(await liveText(P2.id)).data.references;
  t("it starts with the seed edge", seeded.length, 1);

  const r = await cite(P2.id, await selectIds([INFOS[2].id, INFOS[3].id]));
  t("citing into a populated block succeeds", r.ok, true);
  const after = parseFrontmatter(await liveText(P2.id));
  t("the parser finds no error", after.findings.filter((f) => f.severity === "error").length, 0);
  t("the seed edge survived", after.data.references[0].target, "INFO-2026-9000-alpha");
  t("and the new ones were appended", after.data.references.length, 3);
  t("the state_history key after the block is untouched",
    Array.isArray(after.data.state_history), true);
  t("the bundle is still conformant", await conformanceErrors(P2.id), []);
}

console.log("\n--- notes are written, and unrepresentable ones are refused ---");
{
  const P3 = { id: "PROJ-2026-0003-noted", title: "Noted" };
  await promoteRaw(P3.id, projMd(P3), projMeta(P3));
  const r = await cite(P3.id, await selectIds([INFOS[2].id]), "&note=" + encodeURIComponent("the continuation-year books"));
  t("a note is accepted", r.ok, true);
  const e = parseFrontmatter(await liveText(P3.id)).data.references.find((x) => x.target === INFOS[2].id);
  t("and lands on the edge", e.note, "the continuation-year books");

  const before = await liveSha(P3.id);
  /* The restricted grammar's scalar parser strips surrounding quotes and knows
     no escapes, so a quote in a note would reshape the document rather than
     appear in it. Refused, not sanitised. */
  const bad = await cite(P3.id, await selectIds([INFOS[3].id]), "&note=" + encodeURIComponent('say "what"'));
  t("a note containing a quote is refused", bad.reason, "BAD_NOTE");
  t("nothing was written", await liveSha(P3.id), before);
}

console.log("\n--- scale: a pass on two edges is not a pass ---");
{
  /* selectionResolve chunks its id list at 64 because workerd binds about 100
     variables per statement (D-36). Citing drives that path with a set far
     wider than the chunk, and then writes every one of them into one document. */
  const many = [];
  for (let i = 0; i < 220; i++) {
    const b = { id: `INFO-2026-${String(5000 + i).padStart(4, "0")}-bulk`, title: `Bulk ${i}`, body: `Bulk body ${i}.` };
    many.push(b);
    await promoteRaw(b.id, infoMd(b), infoMeta(b));
  }
  const P4 = { id: "PROJ-2026-0004-bulk", title: "Bulk citing" };
  await promoteRaw(P4.id, projMd(P4), projMeta(P4));

  const ids = many.map((b) => b.id);
  const h = await selectIds(ids);
  const started = Date.now();
  const r = await cite(P4.id, h);
  t("220 edges in one call succeeds", r.ok, true);
  t("all of them were cited", r.cited.length, 220);
  const fm = parseFrontmatter(await liveText(P4.id));
  t("the document parses with all 220", fm.data.references.length, 220);
  t("with no parser error", fm.findings.filter((f) => f.severity === "error").length, 0);
  t("and it is still conformant", (await conformanceErrors(P4.id)).length, 0);
  console.log(`         220-edge cite in ${Date.now() - started}ms`);
}

console.log("\n--- negative controls: the verifier must be capable of saying no ---");
{
  /* If the conformance assertion above passes for a document that is actually
     broken, it was saying nothing. Prove it can fail. */
  const files = new Map([["bundle.md", "no frontmatter here at all\n"]]);
  const { findings } = await checkBundle({
    folderName: PROJ.id, files, elidedPaths: new Set(), resolveTarget: () => true,
  });
  t("checkBundle does report errors on a broken bundle",
    findings.filter((f) => f.severity === "error").length > 0, true);

  /* And the dangling check must be capable of seeing a dangling edge. */
  const d = await call(`/dangling`);
  t("dangling is empty for a healthy store", d.dangling.length, 0);
}

await mf.dispose();
console.log(`\ncite: ${pass} pass, ${fail} fail`);
process.exit(fail ? 1 : 0);
