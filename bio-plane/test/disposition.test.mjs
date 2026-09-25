/* NEGATIVE CONTROL: (run 2026-07-31; refusal renamed NOT_PROBLEMS -> NOT_INQUIRIES by REC-10 2026-08-03) disable the whole-set refusal in dispose (guard `offenders.length` with `false`, so a selection carrying a non-inquiry is narrowed instead of refused whole) -> 4 assertions fail (NOT_INQUIRIES, offenders named, nothing-moved) then the suite throws on the partially-applied set; restored, 47 pass. D-169 (run 2026-09-23, each arm ALONE, restored by sha256 b2a77ccd… and cmp): arm 1, restore `#setScalar` for disposition_reason in dispose -> 4 fail, both intake inquiries by name at "the reason is IN THE BYTES" and at "passes C-2.8 after deferred/dismissed" (C-2.8: deferred/dismissed state requires a non-empty disposition_reason), while the member-created arm stays GREEN (over-strictness: the line already present still disposes); arm 2, delete the line then setOrAdd it (moves it to the fence) -> 2 fail, "key sequence is unchanged" and "between the same neighbours", intake arm green; restored, 64 pass. */
/* S-11 step 3: bulk disposition of Problems, `op=dispose`, weight `refuse`.
 *
 * Negative-control detail: disable the whole-set refusal in dispose (guard `offenders.length` with `false`, so a selection carrying a non-inquiry is narrowed instead of refused whole) -> 4 assertions fail (NOT_INQUIRIES, offenders named, nothing-moved) then the suite throws on the partially-applied set; restored, 47 pass.
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
import "./stdio.mjs";                 /* D-282: a suite's own exit must not discard the suite's own output */
import "./sandbox.mjs"; /* D-186: owns $TMPDIR for this process and removes it on exit */
import { Miniflare } from "miniflare";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { checkBundle } from "../checks/bio-checks.mjs";
/* CORRECTED 2026-09-25 (D-615, C-86.7), never exempted: this suite's promote labels named dates the documents they carried
   do not state (a fixed NOW/LATER over bytes the plane had re-stamped, or bytes written with other dates), and a label
   contradicting the document's `created`/`last_updated` is now refused by name. `datesOf` makes each label name the
   document's own dates, and the old value only where the bytes state none — what the label always meant to say. */
const datesOf = (md, created, lastUpdated) => {
  const fm = /^---\n([\s\S]*?)\n---/.exec(String(md ?? "")), get = (k) => fm && (new RegExp(`^${k}:[ \t]*"?([^"\n]*?)"?[ \t]*$`, "m").exec(fm[1]) || [])[1];
  return { created: get("created") || created, last_updated: get("last_updated") || lastUpdated };
};

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
  /* D-169: a recorded producing group, so a creation goes through the plane's REAL stamp (#stampGroup) the way
     an intake write does on an installed instance. Every hand-built fixture here already names this group, and
     a document already naming it comes back byte-identical, so the earlier blocks are unmoved by it. */
  bindings: { INSTANCE_NAME: "believe-in-oakland" },
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
source_status: unchanged
source:
  locator: "https://example.org"
  authority: "Example"
  retrieved: "2026-07-01"
monitoring:
  enabled: false
  frequency: none
  last_checked: null
---

## Summary

## Provenance Notes

## Session Log

### Session 2026-07-02T00:00:00Z | Formation | assisted
Trigger: intake
Changes: created.

## Review Notes
`;

const mk = (id, text, type) => call("/promote", {
  bundleId: id, base: null, snapKey: `${id}-new`, author: "suite",
  files: [{ path: "bundle.md", text, bytes: text.length, sha256: sha(text) }],
  meta: { object_type: type, group: "believe-in-oakland",
          current_state: type === "problem" ? "surfaced" : type === "inquiry" ? "open" : "collected",
          ...datesOf(text, "2026-07-01T00:00:00Z", "2026-07-02T00:00:00Z") } });

const IDS = ["PROB-2026-0001-a", "PROB-2026-0002-b", "PROB-2026-0003-c"];
for (const id of IDS) await mk(id, probMd(id), "problem");
await mk("INFO-2026-0001-x", infoMd("INFO-2026-0001-x"), "information");

const docOf = async (id) => (await call(`/image?id=${id}&viewer=class:member`))["bundle.md"];
/* checkBundle takes a files MAP and a folder name, and is async. Called the way
   cite.test.mjs calls it, so the two suites hold the catalog the same way. */
const errorsOf = async (id) => {
  const files = new Map([["bundle.md", await docOf(id)]]);
  const known = new Set((await call("/index?viewer=class:member")).bundles.map((b) => b.id));
  const { findings } = await checkBundle({ folderName: id, files, elidedPaths: new Set(),
    resolveTarget: (k) => known.has(k) });
  return findings.filter((f) => f.severity === "error").map((e) => `${e.check}: ${e.message}`);
};
/* Ask for the ONE bundle rather than scanning the projection: op=projection caps
   at 200 rows, so a scanning helper silently stops finding things exactly when
   the corpus gets big enough for the scale assertions to matter, and reports it
   as a crash rather than a miss. */
const stateOf = async (id) => (await call(`/projection?id=${id}&viewer=class:member`)).current_state;
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
  /* Superseded 2026-08-03 (REC-10): `elevated` is no longer a state in the
     machine dispose runs — the inquiry machine has open/deferred/dismissed
     (surfaced a legal alias of open), and elevation was the OLD Focus
     vocabulary's exit into a Project. The old expectation NOT_A_DISPOSITION
     was wrong once the state itself left the table: an unknown target is
     refused earlier, by name, as BAD_TARGET_STATE — same closed-machine
     property, one refusal sooner. */
  t("elevated is refused by name: not a state in the inquiry machine at all",
    (await call(`/dispose?handle=${h}&to=elevated&reason=x&${STAMP}`)).reason, "BAD_TARGET_STATE");
}

console.log("\n--- the whole set moves or none of it does (weight refuse) ---");
{
  const h = await select([...IDS, "INFO-2026-0001-x"]);
  const r = await call(`/dispose?handle=${h}&to=deferred&reason=${encodeURIComponent("waiting on the audit")}&${STAMP}`);
  /* Superseded 2026-08-03 (REC-10): the refusal is NOT_INQUIRIES now — the
     wire name stopped naming a construct that no longer exists (DATA-MODEL
     §2.7 change 13). The property asserted is unchanged: refused WHOLE. */
  t("a selection carrying a non-inquiry is refused whole", r.reason, "NOT_INQUIRIES");
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

console.log("\n--- D-169: an inquiry created through INTAKE disposes into bytes C-2.8 accepts ---");
/* D-169. The setup page's intake writer (mdFor) emits an inquiry with NO
   disposition_reason line, and dispose() wrote the reason with #setScalar, which
   returns the text UNCHANGED for an absent key: the state moved to deferred or
   dismissed and the record held a bundle its own catalogue rejects at C-2.8.
   Every fixture above carries the line already (probMd), so none of them could
   see it. HOW A LIAR PASSES: a hand-built fixture already carrying the line,
   which never meets mdFor — so this arm takes its bytes FROM mdFor, extracted
   from SETUP_HTML exactly as inquiry.test.mjs block 5 does, and pins that the
   line is absent before anything is disposed. */
{
  const { SETUP_HTML } = await import("../src/setup.mjs");
  const script = SETUP_HTML.slice(SETUP_HTML.lastIndexOf("<script>") + 8, SETUP_HTML.lastIndexOf("</script>"));
  const el = () => ({ addEventListener() {}, classList: { add() {}, remove() {} },
    textContent: "", innerHTML: "", value: "", style: {}, hidden: false, dataset: {} });
  const sandbox = {
    document: { querySelector: () => el(), querySelectorAll: () => [], getElementById: () => el(),
                addEventListener() {}, createElement: () => el(), body: { appendChild() {}, removeChild() {} } },
    location: { hash: "", pathname: "/", origin: "https://x" }, history: { replaceState() {} },
    sessionStorage: { getItem: () => null, setItem() {}, removeItem() {} },
    fetch: async () => ({ ok: true, status: 200, json: async () => ({ ok: true }) }),
    URLSearchParams, console, JSON, Date, RegExp, String, Number, Object, Array,
    setTimeout, TextEncoder, navigator: { clipboard: { writeText: async () => {} } },
  };
  sandbox.window = sandbox;
  const ui = new Function(...Object.keys(sandbox), script + "\n;return { mdFor, FIRST_STATE, deriveInquiryTitle };")(
    ...Object.values(sandbox));
  const Q = "Why did the transfer basis change between the two budget cycles?";
  const intake = ["INQ-2026-0169-defer", "INQ-2026-0169-dismiss"];
  for (const id of intake) {
    const text = ui.mdFor(id, "inquiry", ui.FIRST_STATE.inquiry, ui.deriveInquiryTitle(Q), Q,
      "2026-07-24T12:00:00Z", false, null);
    t(`${id}: the intake writer's bytes carry NO disposition_reason line (the fixture is the real shape)`,
      /^disposition_reason:/m.test(text), false);
    await mk(id, text, "inquiry");
    t(`${id} starts conformant`, await errorsOf(id), []);
  }
  for (const [id, to, why] of [[intake[0], "deferred", "after the audit lands"],
                               [intake[1], "dismissed", "answered elsewhere"]]) {
    const r = await call(`/dispose?handle=${await select([id])}&to=${to}&reason=${encodeURIComponent(why)}&${STAMP}`);
    t(`${id}: dispose to ${to} succeeds`, r.ok, true);
    t(`${id} is ${to}`, await stateOf(id), to);
    const doc = await docOf(id);
    t(`${id}: the reason is IN THE BYTES, once, inside the front matter`,
      [doc.split("\n---")[0].split("\n").filter((l) => l.startsWith("disposition_reason:")),
       doc.split("\n").filter((l) => l.startsWith("disposition_reason:")).length],
      [[`disposition_reason: "${why}"`], 1]);
    t(`${id} passes C-2.8 after ${to} (no finding at all, C-2.8 or other)`, await errorsOf(id), []);
  }
}

console.log("\n--- D-169: a member-created inquiry (line already present) disposes exactly as before ---");
/* The other half of the accepts-when: where the line exists, setOrAdd must
   rewrite it IN PLACE and add nothing. Pinned structurally: the front matter's
   top-level key sequence is identical before and after, and the reason sits
   between the same two keys it was authored between. */
{
  const id = "PROB-2026-0169-member";
  await mk(id, probMd(id), "problem");
  const keys = (d) => d.split("\n---")[0].split("\n").filter((l) => /^[a-z_]+:/.test(l)).map((l) => l.split(":")[0]);
  const nbr = (d) => { const k = keys(d), i = k.indexOf("disposition_reason"); return [k[i - 1], k[i + 1]]; };
  const before = await docOf(id);
  const r = await call(`/dispose?handle=${await select([id])}&to=deferred&reason=${encodeURIComponent("next cycle")}&${STAMP}`);
  t("the member-created one disposes", r.ok, true);
  const after = await docOf(id);
  t("its front-matter key sequence is unchanged: nothing added, nothing moved", keys(after), keys(before));
  /* Not a line INDEX: the state_history entry dispose appends sits above it and shifts every later line. What
     is pinned is that the key it follows and the key after it are the ones it was authored between. */
  t("the reason is rewritten in place, between the same neighbours, and appears once",
    [nbr(after), after.split("\n").filter((l) => l.startsWith("disposition_reason:"))],
    [nbr(before), ['disposition_reason: "next cycle"']]);
  t("and it is conformant", await errorsOf(id), []);
}

console.log("\n--- S-11 step 4: bulk RETIREMENT of Information, and why it is heavier ---");
/* Retirement differs from disposition in one structural way that decides the
   whole design: `retired` is TERMINAL in the catalog's table
   (collected -> verified -> retired, and retired -> nothing), where every
   Problem disposition is reversible. A wrong disposition is corrected by
   disposing again; a wrong retirement cannot be undone through the state
   machine at all. */
{
  const infoIds = ["INFO-2026-0010-a", "INFO-2026-0011-b"];
  for (const id of infoIds) await mk(id, infoMd(id), "information");
  /* Standing lesson 4 again: check BEFORE. The first version of this Information
     fixture was missing two required headings and the monitoring block, so the
     after-check would have reported the same findings and proved nothing about
     retirement. */
  for (const id of infoIds) t(`${id} starts conformant`, await errorsOf(id), []);

  /* collected -> retired is not an edge. Only verified -> retired is, so
     retiring something never verified skips the step where a human looked at
     it, which is exactly what the intake doctrine cares about. */
  {
    const h = await select(infoIds);
    const r = await call(`/retire?handle=${h}&reason=${encodeURIComponent("stale")}&${STAMP}`);
    t("collected Information cannot be retired: verification is not skippable",
      r.reason, "ILLEGAL_TRANSITION");
    t("with the offenders and where they actually are named",
      r.offenders.map((o) => o.from), ["collected", "collected"]);
  }

  /* Verify them the ordinary way, then retire. */
  for (const id of infoIds) {
    const doc = (await docOf(id)).replace("current_state: collected", "current_state: verified");
    await call("/promote", { bundleId: id, base: (await call(`/projection?id=${id}&viewer=class:member`)).bundle_sha,
      snapKey: `${id}-verify`, author: "suite",
      files: [{ path: "bundle.md", text: doc, bytes: doc.length, sha256: sha(doc) }],
      meta: { object_type: "information", group: "believe-in-oakland",
              current_state: "verified", ...datesOf(doc, "2026-07-01T00:00:00Z", "2026-07-03T00:00:00Z") } });
  }
  t("a reason is required, as it is for disposition",
    (await call(`/retire?handle=${await select(infoIds)}&${STAMP}`)).reason, "NO_REASON");

  /* THE LOAD-BEARING REFUSAL, and the reason this step is heavier than step 3.
     Nothing in the catalog stops Information being retired while a Project
     still cites it, and C-6.2's remediations for an unresolvable target are
     "restore from history", "re-point", or "sever with reason". A bulk
     retirement that silently stranded live citations would manufacture exactly
     the condition the catalog treats as an error, at whatever scale the
     operator selected. So a cited piece is refused and the citing Projects are
     named, because the operator needs to know who relies on it. */
  /* CORRECTED 2026-09-18 (REC-141, IC-158): a project's id is MINTED by the plane
     (Membership v2 §7) and a creation naming one is refused PROJECT_ID_SUPPLIED;
     the bytes carry no `id:` line, no bundleId is sent, and the id is read from
     the answer. */
  const pdoc = `---\nobject_type: project\ncurrent_state: forming\ncreated: "2026-07-01T00:00:00Z"\nlast_updated: "2026-07-01T00:00:00Z"\nreferences:\n  - rel: cites\n    target: ${infoIds[0]}\n    status: confirmed\n    note: ""\n---\n\n## Summary\n\nX.\n`;
  const created = await call("/promote", { base: null, snapKey: "PROJ-cites-new", author: "suite",
    files: [{ path: "bundle.md", text: pdoc, bytes: pdoc.length, sha256: sha(pdoc) }],
    /* D-563: kept — this project's document states no title, so the label is its name (C-86.3 refuses only a contradiction). */
    meta: { object_type: "project", group: "believe-in-oakland", title: "Citing Project",
            current_state: "forming", ...datesOf(pdoc, "2026-07-01T00:00:00Z", "2026-07-01T00:00:00Z") } });
  const proj = created.bundleId;
  t("the citing Project is created at a plane-minted id", /^PROJ-\d{4}-\d{4}-/.test(String(proj)), true);
  {
    const h = await select(infoIds);
    const r = await call(`/retire?handle=${h}&reason=${encodeURIComponent("superseded")}&${STAMP}`);
    t("Information a Project still CITES is refused", r.reason, "CITED");
    t("and the citing Project is named, because the operator needs to know who relies on it",
      r.offenders[0].citedBy, [proj]);
    t("the whole set is refused, not narrowed to the uncited members",
      await stateOf(infoIds[1]), "verified");
  }

  /* Severing the edge is the doctrinal route, and it is C-6.2's own remedy. */
  {
    const h = await select([infoIds[0]]);
    await call(`/sever?project=${proj}&handle=${h}&reason=${encodeURIComponent("no longer relied on")}&${STAMP}`);
    const h2 = await select(infoIds);
    const r = await call(`/retire?handle=${h2}&reason=${encodeURIComponent("superseded")}&${STAMP}`);
    t("once the citation is SEVERED, retirement proceeds", r.ok, true);
    t("both are retired", r.retired.sort(), infoIds);
    t("and it landed", await stateOf(infoIds[0]), "retired");
  }

  /* TERMINAL means terminal. */
  {
    const h = await select(infoIds);
    t("retired is terminal: it cannot be retired again",
      (await call(`/retire?handle=${h}&reason=x&${STAMP}`)).reason, "ILLEGAL_TRANSITION");
  }
  t("and the retired document is still conformant", await errorsOf(infoIds[0]), []);
}

await mf.dispose();
console.log(`\ndisposition: ${pass} pass, ${fail} fail`);
process.exit(fail ? 1 : 0);
