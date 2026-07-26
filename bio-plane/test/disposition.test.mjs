/* S-11 step 3: bulk disposition of Problems, `op=dispose`, weight `refuse`.
 *
 * The first selection-backed action to move an OBJECT's state rather than an
 * edge's. Steps 1 and 2 edited the `references` block of a Project; this edits
 * `current_state` on each selected Problem, which is a different and heavier
 * thing: an edge is a claim about a relationship, and a state is a claim about
 * where the group's thinking has got to.
 *
 * WEIGHT `refuse`, hard-coded, like severing. The whole set moves or none of it
 * does, because a half-run bulk state change leaves the operator with no way to
 * know which half ran.
 *
 * C-2.8 REQUIRES A NON-EMPTY disposition_reason for `deferred` and `dismissed`,
 * so the reason is not politeness here: a disposition without one produces a
 * bundle the catalog rejects. The suite conformance-checks each Problem BEFORE
 * and after, because an after-check alone measures nothing (standing lesson 4).
 */
import { Miniflare } from "miniflare";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { checkBundle } from "../checks/bio-checks.mjs";

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

const probMd = (id, state = "surfaced", reason = "") => `---
id: ${id}
object_type: problem
schema: problem@1
title: "Problem ${id}"
current_state: ${state}
prior_state: null
created: "2026-07-01T00:00:00Z"
last_updated: "2026-07-02T00:00:00Z"
produced_by:
  mode: agent
  capability_tier: high
group: believe-in-oakland
references: []
state_history: []
annotations_open: 0
reeval_pending:
  flag: false
  since: null
  source: null
visuals: []
surfaced_by: agent
disposition_reason: "${reason}"
recheck_triggers:
  - text: Revisit after the next budget cycle
    description: The adopted budget may restate the transfer basis.
---

## Statement

## Why It Matters

## Open Questions

## Session Log

### Session 2026-07-02T00:00:00Z | Formation | agent
Trigger: surfacing
Changes: created.

## Review Notes
`;

const infoMd = (id) => `---
id: ${id}
object_type: information
schema: information@1
title: "Info ${id}"
current_state: collected
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
criticality: supporting
classification: fact
source:
  locator: "https://example.org"
  authority: "Example"
  retrieved: "2026-07-01"
  status: unchanged
monitor:
  enabled: false
  frequency: never
  last_checked: null
---

## Summary

## Session Log
`;

const mk = (id, text, type) => call("/promote", {
  bundleId: id, base: null, snapKey: `${id}-new`, author: "suite",
  files: [{ path: "bundle.md", text, bytes: text.length, sha256: sha(text) }],
  meta: { object_type: type, group: "believe-in-oakland", title: `t ${id}`,
          current_state: type === "problem" ? "surfaced" : "collected",
          created: "2026-07-01T00:00:00Z", last_updated: "2026-07-02T00:00:00Z" } });

const IDS = ["PROB-2026-0001-a", "PROB-2026-0002-b", "PROB-2026-0003-c"];
for (const id of IDS) await mk(id, probMd(id), "problem");
await mk("INFO-2026-0001-x", infoMd("INFO-2026-0001-x"), "information");

const docOf = async (id) => (await call(`/image?id=${id}`))["bundle.md"];
/* checkBundle takes a files MAP and a folder name, and is async. Called the way
   cite.test.mjs calls it, so the two suites hold the catalog the same way. */
const errorsOf = async (id) => {
  const files = new Map([["bundle.md", await docOf(id)]]);
  const known = new Set((await call("/index")).bundles.map((b) => b.id));
  const { findings } = await checkBundle({ folderName: id, files, elidedPaths: new Set(),
    resolveTarget: (k) => known.has(k) });
  return findings.filter((f) => f.severity === "error").map((e) => `${e.check}: ${e.message}`);
};
/* Ask for the ONE bundle rather than scanning the projection: op=projection caps
   at 200 rows, so a scanning helper silently stops finding things exactly when
   the corpus gets big enough for the scale assertions to matter, and reports it
   as a crash rather than a miss. */
const stateOf = async (id) => (await call(`/projection?id=${id}`)).current_state;
const select = async (ids) => (await call(`/select?${STAMP}`, { ids })).handle;

/* Standing lesson 4: the BEFORE check is what makes the after-check mean
   anything. If the fixture were already non-conformant, an after-check would
   report the same findings and prove nothing about the action. */
console.log("\n--- the fixture is conformant BEFORE anything is disposed ---");
for (const id of IDS) t(`${id} starts clean`, await errorsOf(id), []);

console.log("\n--- a disposition records WHY, because C-2.8 requires it ---");
{
  const h = await select(IDS);
  t("no reason is refused",
    (await call(`/dispose?handle=${h}&to=deferred&${STAMP}`)).reason, "NO_REASON");
  t("and nothing moved", await stateOf(IDS[0]), "surfaced");
}

console.log("\n--- the target state is closed, and elevation is not this action ---");
{
  const h = await select(IDS);
  t("an unknown state is refused",
    (await call(`/dispose?handle=${h}&to=archived&reason=x&${STAMP}`)).reason, "BAD_TARGET_STATE");
  /* `elevated` is a legal Problem state and is deliberately NOT dispositionable
     here. Elevating a Problem into a Project creates an `elevated_into` edge and
     a Project bundle; doing it as a bulk state flip would produce Problems
     claiming to be elevated into nothing. */
  t("elevated is refused by name, because elevation is not a state flip",
    (await call(`/dispose?handle=${h}&to=elevated&reason=x&${STAMP}`)).reason, "NOT_A_DISPOSITION");
}

console.log("\n--- the whole set moves or none of it does (weight refuse) ---");
{
  const h = await select([...IDS, "INFO-2026-0001-x"]);
  const r = await call(`/dispose?handle=${h}&to=deferred&reason=${encodeURIComponent("waiting on the audit")}&${STAMP}`);
  t("a selection carrying a non-Problem is refused whole", r.reason, "NOT_PROBLEMS");
  t("with the offenders named", r.offenders, ["INFO-2026-0001-x"]);
  t("and NOTHING moved, not even the valid members", await stateOf(IDS[0]), "surfaced");
}

console.log("\n--- disposing the set ---");
{
  const h = await select(IDS);
  const r = await call(`/dispose?handle=${h}&to=deferred&reason=${encodeURIComponent("waiting on the audit")}&${STAMP}`);
  t("the action reports what it moved", r.ok, true);
  t("all three", r.disposed.sort(), IDS);
  for (const id of IDS) t(`${id} is deferred`, await stateOf(id), "deferred");
  t("the reason landed in the document, which is what C-2.8 checks",
    /disposition_reason: "waiting on the audit"/.test(await docOf(IDS[0])), true);
  t("prior_state records where it came from",
    /prior_state: surfaced/.test(await docOf(IDS[0])), true);
}

console.log("\n--- C-4.2: prior_state obliges a RECORDED transition, not just a pointer ---");
{
  const doc = await docOf(IDS[0]);
  t("state_history carries the transition", /from_state: surfaced/.test(doc), true);
  t("with where it went", /to_state: deferred/.test(doc), true);
  t("the reason as its blurb", /blurb: "waiting on the audit"/.test(doc), true);
  t("and an author", /author: member/.test(doc), true);
  /* The Session Log entry is the other half: C-13.2 requires one whenever
     last_updated moves, because a state change with no account of it is an
     unaccountable change. */
  t("and the Session Log accounts for the act", /\| Deferred \|/.test(doc), true);
}

console.log("\n--- and the result is still conformant to the catalog ---");
for (const id of IDS) t(`${id} is clean after`, await errorsOf(id), []);

console.log("\n--- the state machine is closed, so a stale view is refused ---");
{
  const h = await select(IDS);
  /* deferred to deferred is not a legal transition in the catalog's table, and
     it means the operator is looking at a view taken before someone else's
     disposition. Refused by name rather than treated as a no-op. */
  t("re-disposing to the same state is refused",
    (await call(`/dispose?handle=${h}&to=deferred&reason=x&${STAMP}`)).reason, "ILLEGAL_TRANSITION");
  t("but a legal onward move is allowed",
    (await call(`/dispose?handle=${h}&to=dismissed&reason=${encodeURIComponent("not our fight")}&${STAMP}`)).ok, true);
  t("and it landed", await stateOf(IDS[0]), "dismissed");
}

console.log("\n--- a second disposition APPENDS to the history rather than replacing it ---");
{
  const doc = await docOf(IDS[0]);
  const froms = [...doc.matchAll(/from_state: (\w+)/g)].map((m) => m[1]);
  t("both transitions are recorded, in order", froms, ["surfaced", "deferred"]);
}

console.log("\n--- an empty selection is refused, not a successful no-op ---");
{
  const h = await select(["PROB-2026-9999-nope"]);
  const r = await call(`/dispose?handle=${h}&to=deferred&reason=x&${STAMP}`);
  t("refused by name", r.reason, "EMPTY_SELECTION");
}

console.log("\n--- scale: a pass on three Problems is not a pass ---");
/* Probed to 4,000 in one call out of tree: linear at about 1ms per Problem, no
   ceiling found. Standing lesson 1 says a probe that never saw a failure found
   the top of its range and not a limit, so what is asserted here is the SHAPE
   that would break first if one existed, at a size the battery can afford.
   dispose issues one promote per member rather than one statement over all of
   them, which is why the D-36 variable and compound-term ceilings do not apply
   to it: there is no IN (...) list to chunk. */
{
  const many = [];
  for (let i = 0; i < 200; i++) {
    const id = `PROB-2026-1${String(i).padStart(3, "0")}-bulk`;
    await mk(id, probMd(id), "problem");
    many.push(id);
  }
  const h = await select(many);
  const r = await call(`/dispose?handle=${h}&to=dismissed&reason=${encodeURIComponent("bulk close")}&${STAMP}`);
  t("200 Problems dispose in one call", r.ok, true);
  t("every one of them moved", r.disposed.length, 200);
  t("and the last one really did", await stateOf(many[199]), "dismissed");
  /* The conformance check is what makes the scale claim mean something: moving
     200 states is worthless if they are 200 documents the catalog rejects. */
  t("a sampled one is still conformant", await errorsOf(many[199]), []);
}

await mf.dispose();
console.log(`\ndisposition: ${pass} pass, ${fail} fail`);
process.exit(fail ? 1 : 0);
