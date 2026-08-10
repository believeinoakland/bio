/* NEGATIVE CONTROL: REC-55, RUN 2026-08-05 (rec55-agent). THREE ARMS, each broken ALONE against the FINAL files, each re-run against those final files so every count agrees with the file it names, and every file restored BYTE-IDENTICALLY with sha256 compared before and after: src/store.mjs 2d15d1df65cf79aa1add25fbac329d6664fb6615e08f8cc0f90005bbe72cc3eb (this file's own sha is not quoted, because a file cannot state its own). WHOLE = 61 pass, 0 fail.  (a) REVERT THE GATE TO `moved` ALONE — in src/store.mjs `selectionResolve`, `const stopped = Store.#answerChanged(drift, moved) && weight === "refuse";` back to `const stopped = moved && weight === "refuse";` -> **18 FAIL**, naming the constant-count swap that got through at the raw gate AND at BOTH real refuse-weight acts: the query selection resolves `ok:true` at weight=refuse with `reason: undefined` and hands over all three ids; `op=release` moves INFO-2026-0602/0603/0604-swapfixture from collected to VERIFIED over a set the operator never saw; `op=retire` retires over the swapped verified four; and the source walk reports the gate no longer asking the answer-changed question. THE ARM THEN STOPS BY DESIGN: reach arm (i)'s stripper THROWS rather than report a meaningless zero delta, because the text it removes no longer exists — REC-54's precedent, and the reason the remaining reach arms are unrun in this arm rather than silently green. **THIS ARM ALSO CHANGED THE SUITE RATHER THAN MERELY CONFIRMING IT**: the first draft read `ok.released.length` directly and DIED with a TypeError at the eleventh failure, hiding every arm behind it — D-93's class inside one suite, and REC-54 hit the same thing. The reads are defensive now and the arm reports its full tally.  (b) THE WRONG FIX, so that it is distinguishable from the right one — fold the digest into the formula instead (`const moved = drift.revised.length + drift.removed + drift.added > 0 || drift.digestChanged === true;`) and leave the gate reading `moved` -> **7 FAIL**, and WHICH SEVEN is the whole point. Every ACT still stops correctly: not one release, retire or gate-refusal assertion fires, so behaviour alone cannot tell the two fixes apart. What fires is what the wrong fix COSTS — the RELATION pin ("`digestChanged` is STILL NOT a term in it", the same relation civicos-ui/test/finder.test.mjs holds against this file from the other side), walk B, the walk's anchor, and FOUR published-value assertions at `op=selection` and `op=cite` that now report per-row movement over a set where no row moved. Then reach (i) throws, as in (a). **MEASURED CORRECTION TO THE BRIEF, reported rather than smoothed:** this arm was predicted to fail "naming an enumerated caller whose meaning moved". NO ENUMERATED CALLER MOVES UNDER IT, and cannot — `drift.digestChanged` is set only on the query arm, so on an enumeration the folded formula is byte-identical and block 3 stays entirely green. The wrong fix's whole cost is on the QUERY arm's published `moved`, and that is what this suite bites on.  (c) NEUTER THE SWEEP'S OWN WALKS — in THIS file make `bareMovedReads` and `refuseCallers` return `[]` and `gateAsksAnswerChanged` return `true` -> **57 pass, 4 FAIL**: all three REACH deltas plus the caller-naming walk. THE FINDING IS WHAT STAYED GREEN: the three DIRECT walk assertions — no bare `sel.moved`, the gate asks the answer-changed question, every refuse-weight caller returns on the gate — ALL PASSED AT ZERO COST over walks covering nothing. That is the eight-sighting failure mode reproduced at this item's own site, and it is why every walk here is asserted as a delta against the real guard stripped from the real source rather than against an absolute. */
/* REC-55 — THE REFUSE-WEIGHT GATE, and the class it belongs to.
 *
 * Negative-control detail: see the declaration above; three arms, all RUN.
 *
 * THE DEFECT, measured by UI-25 against store.mjs and routed here as a
 * delegation. `selectionResolve` computed
 *
 *     const moved   = drift.revised.length + drift.removed + drift.added > 0;
 *     const stopped = moved && weight === "refuse";
 *
 * and `digestChanged` is not a term in `moved`. A `kind:"query"` selection
 * stores the criterion rather than the rows, so its whole account of movement is
 * the digest — and a query whose membership SWAPS AT A CONSTANT COUNT has
 * `revised` empty, `added` 0 and `removed` 0. It reported `moved:false`, and a
 * refuse-weight act walked straight through the gate onto a set the operator
 * never saw. That is precisely "a state transition landing on a set the operator
 * did not see", which `selectionResolve`'s own comment says the refuse weight
 * exists to prevent.
 *
 * THE MECHANISM WAS DECIDED BY CONDUCT AND IS NOT RE-OPENED HERE. `moved` is NOT
 * folded: it correctly means per-row movement, six published surfaces read it
 * that way, and civicos-ui/test/finder.test.mjs pins that relation against this
 * very file. The GATE asks a different question — has this answer changed at
 * all — through one private predicate, `Store.#answerChanged`.
 *
 * THE SWEEP FOUND A SECOND SITE, and it is the one that was EXPOSED rather than
 * latent. `cite()` composes its Session Log entry with
 *
 *     Trigger: selection <handle>{ (the set had moved since it was made; ...) }
 *
 * and that clause was gated on `sel.moved` too. So a query selection whose
 * answer swapped at a constant count wrote into the APPEND-ONLY RECORD an entry
 * whose drift clause was simply absent — and in an entry that states the clause
 * whenever it applies, absence reads as "the set had not moved". The gate is
 * latent (no surface offers a refuse-weight act over a query lease yet); citing
 * is NOT — UI-25 gave `kind:"query"` its first surface and that surface offers
 * `cite`. Both sites now ask the one predicate.
 *
 * WHAT THIS SUITE HOLDS THE PLANE TO:
 *   - a query selection swapping AT A CONSTANT COUNT stops a refuse-weight act,
 *     asserted at the raw gate AND through op=release and op=retire, with the
 *     evidence being that no document moved state;
 *   - an UNCHANGED query selection still passes, or the fix has simply broken
 *     the act;
 *   - an ENUMERATED selection is unmoved at every existing caller, and the
 *     structural reason is asserted rather than assumed: `digestChanged` is
 *     never set on that arm, so the new term cannot reach it;
 *   - the published `moved` still means PER-ROW movement, which is what makes
 *     the right fix distinguishable from the wrong one;
 *   - and a SOURCE-LEVEL SWEEP over store.mjs for the class, with its own reach
 *     asserted as a DELTA against mechanically stripped copies of the real
 *     source — never against an absolute, because a walk that covers nothing
 *     passes everything.
 */
import "./stdio.mjs";                 /* D-282: a suite's own exit must not discard the suite's own output */
import "./sandbox.mjs"; /* D-186: owns $TMPDIR for this process and removes it on exit */
import { Miniflare } from "miniflare";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";

const SRC = (f) => fileURLToPath(new URL("../src/" + f, import.meta.url));
const sha = (s) => createHash("sha256").update(s).digest("hex");
let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${JSON.stringify(want)}\n         got  ${JSON.stringify(got)}`}`);
  ok ? pass++ : fail++;
};

const STORE_SRC = readFileSync(SRC("store.mjs"), "utf8");

const mf = new Miniflare({
  modules: true, script: STORE_SRC,
  modulesRoot: "/", scriptPath: SRC("store.mjs"),
  compatibilityDate: "2026-07-01",
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
});
const call = async (p, body) => (await (await mf.dispatchFetch("http://x" + p,
  body ? { method: "POST", body: JSON.stringify(body) } : {})).json()).result;

const OWNER = "class:member";
const STAMP = "viewer=class:member&owner=class:member";
const AUTHOR = "m-riley";
const ACK = encodeURIComponent("Batch of uniform public postings; bulk-release risks weighed.");
const MIT = encodeURIComponent("Sampled 12 of 40; checked sender domains and posting dates.");

/* ------------------------------------------------------------- fixtures */

const DATASET = JSON.stringify({ v: 1 });
const CAPTURE = "<html/>";
/* The two files verified state requires (C-2.7), carried by every document that
   this suite ever releases. Lifted from release.test.mjs deliberately: an
   entry-requirement refusal here would look exactly like a gate refusal and
   prove nothing. */
const FULL = [
  { path: "data/dataset.json", text: DATASET, bytes: DATASET.length, sha256: sha(DATASET) },
  { path: "snapshots/capture.html", text: CAPTURE, bytes: CAPTURE.length, sha256: sha(CAPTURE) },
];

const infoMd = (id, mark) => `---
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
content_hash: "sha256:${sha(DATASET)}"
source:
  locator: "https://example.org/${id}"
  authority: "Example Jobs Board"
  retrieved: "2026-07-01"
monitoring:
  enabled: false
  frequency: none
  last_checked: null
---

## Summary

A ${mark} posting.

## Provenance Notes

Grade B fetch, hashed at receipt.

## Session Log

### Session 2026-07-02T00:00:00Z | Formation | assisted
Trigger: intake
Changes: created.

## Review Notes
`;

const projMd = (id) => `---
id: ${id}
object_type: project
schema: project@1
title: "Project ${id}"
current_state: forming
prior_state: null
created: "2026-07-01T00:00:00Z"
last_updated: "2026-07-02T00:00:00Z"
produced_by:
  mode: interactive_agentic
  capability_tier: standard
group: believe-in-oakland
references: []
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

const mkInfo = async (id, mark) => {
  const text = infoMd(id, mark);
  return call("/promote", {
    bundleId: id, base: null, snapKey: `${id}-new`, author: "suite",
    files: [{ path: "bundle.md", text, bytes: text.length, sha256: sha(text) }, ...FULL],
    meta: { object_type: "information", group: "believe-in-oakland", title: `Info ${id}`,
            current_state: "collected", prior_state: null, created: "2026-07-01T00:00:00Z",
            last_updated: "2026-07-02T00:00:00Z", criticality: "supporting" },
  });
};
const mkProj = async (id) => {
  const text = projMd(id);
  return call("/promote", {
    bundleId: id, base: null, snapKey: `${id}-new`, author: "suite",
    files: [{ path: "bundle.md", text, bytes: text.length, sha256: sha(text) }],
    meta: { object_type: "project", group: "believe-in-oakland", title: `Project ${id}`,
            current_state: "forming", prior_state: null, created: "2026-07-01T00:00:00Z",
            last_updated: "2026-07-02T00:00:00Z" },
  });
};

const stateOf = async (id) => (await call(`/projection?id=${id}&viewer=class:member`)).current_state;
const docOf = async (id) => (await call(`/image?id=${id}&viewer=class:member`))["bundle.md"];
const selectQuery = async (q) => call(`/select?${STAMP}&q=${encodeURIComponent(q)}`);
const selectIds = async (ids) => call(`/select?${STAMP}&q=`, { ids });
const resolve = (h, weight) => call(`/selection?handle=${h}&${STAMP}${weight ? `&weight=${weight}` : ""}`);
const release = (h) =>
  call(`/release?handle=${h}&acknowledgment=${ACK}&mitigation=${MIT}&author=${AUTHOR}&${STAMP}`);
const retire = (h) =>
  call(`/retire?handle=${h}&reason=${encodeURIComponent("superseded by the consolidated record")}&author=${AUTHOR}&${STAMP}`);
const cite = (project, handle) => call(`/cite?${STAMP}&project=${project}&handle=${handle}&author=${AUTHOR}`, {});

/* ============================================================ block 1 ====
   THE CONSTANT-COUNT SWAP, at the raw gate.

   The swap is built rather than simulated: one member of the criterion's answer
   is purged and a fresh member of the same criterion is written, so the COUNT is
   identical on both sides and the MEMBERSHIP is not. That is the only shape in
   which this defect exists, and any drift the count could have shown would have
   been caught by the old gate. */
console.log("--- a query selection whose answer SWAPS at a constant count ---");
let swapHandle;
{
  for (const n of [1, 2, 3]) await mkInfo(`INFO-2026-060${n}-swapfixture`, "swapfixture");
  const s = await selectQuery("state:collected swapfixture");
  t("the criterion is held as a QUERY selection, storing no rows", s.kind, "query");
  t("and it answers three", s.n, 3);
  swapHandle = s.handle;

  /* THE OTHER DIRECTION FIRST, and it is not a formality: a gate that stopped
     everything would pass every assertion below and be useless. */
  const before = await resolve(swapHandle, "refuse");
  t("an UNCHANGED query selection passes a refuse-weight resolve", before.ok, true);
  t("reporting no movement, because there is none", before.moved, false);
  t("and no digest drift either", before.drift?.digestChanged, undefined);

  await call(`/purge?bundleId=INFO-2026-0601-swapfixture`);
  await mkInfo("INFO-2026-0604-swapfixture", "swapfixture");

  const rep = await resolve(swapHandle, "report");
  t("after the swap the criterion still answers THREE", rep.n, 3);
  t("nothing was added, on the count", rep.drift?.added, 0);
  t("and nothing was removed, on the count", rep.drift?.removed, 0);
  t("so PER-ROW movement is still honestly reported as none — `moved` did not change meaning",
    rep.moved, false);
  t("while the DIGEST says the answer is not the answer that was held", rep.drift?.digestChanged, true);
  t("and the record states what it cannot recover, rather than implying it can",
    /stores the criterion rather than the rows/.test(rep.drift?.detail || ""), true);
  t("a report-weight action still proceeds over it, because drift is survivable there", rep.ok, true);

  const heavy = await resolve(swapHandle, "refuse");
  t("THE GATE STOPS IT: a refuse-weight action is refused over the swapped set", heavy.ok, false);
  t("with the reason the operator is meant to read", heavy.reason, "SET_MOVED");
  t("and NOTHING handed over, so it cannot half-run", heavy.members, []);
  t("the drift is still reported, so the operator can see what to look at",
    heavy.drift?.digestChanged, true);
}

/* ============================================================ block 2 ====
   THE SAME SET, THROUGH A REAL REFUSE-WEIGHT ACT.

   The gate is only worth what it stops. `release` and `retire` are both
   refuse-weight and both take a selection handle, and the evidence that matters
   is not the refusal shape but that NO DOCUMENT MOVED STATE. */
console.log("\n--- op=release, refuse-weight, over the swapped set ---");
{
  const r = await release(swapHandle);
  t("op=release is refused over a set that swapped at a constant count", r.ok, false);
  t("by name", r.reason, "SET_MOVED");
  for (const id of ["INFO-2026-0602-swapfixture", "INFO-2026-0603-swapfixture", "INFO-2026-0604-swapfixture"])
    t(`${id} did not move: the whole point of the gate`, await stateOf(id), "collected");

  /* And the act is not broken: a selection made NOW, over the set as it stands,
     releases exactly as it always did. */
  const fresh = await selectQuery("state:collected swapfixture");
  const ok = await release(fresh.handle);
  t("a freshly-made selection over the SAME criterion releases normally", ok.ok, true);
  t("moving all three", (ok.released || []).length, 3);
  t("and the act still states its weight", ok.weight, "refuse");
}

console.log("\n--- op=retire, refuse-weight, over a swapped set one state up ---");
{
  for (const n of [1, 2, 3, 4, 5]) await mkInfo(`INFO-2026-061${n}-retirefixture`, "retirefixture");
  /* Four of the five are carried to `verified` through an unmoved enumeration,
     which is the only legal route into the state retire acts from. */
  const four = ["INFO-2026-0611-retirefixture", "INFO-2026-0612-retirefixture",
                "INFO-2026-0613-retirefixture", "INFO-2026-0614-retirefixture"];
  t("four are released into verified to give retire something to act on",
    ((await release((await selectIds(four)).handle)).released || []).length, 4);

  const s = await selectQuery("state:verified retirefixture");
  t("a query selection over the verified four", s.n, 4);

  /* The swap, again at a constant count: one leaves the answer, one joins it. */
  await call(`/purge?bundleId=INFO-2026-0611-retirefixture`);
  await release((await selectIds(["INFO-2026-0615-retirefixture"])).handle);

  const rep = await resolve(s.handle, "report");
  t("the criterion still answers four", rep.n, 4);
  t("with no per-row movement to report", [rep.moved, rep.drift?.added, rep.drift?.removed], [false, 0, 0]);
  t("and the digest saying otherwise", rep.drift?.digestChanged, true);

  const r = await retire(s.handle);
  t("op=retire is refused over the swapped set", r.ok, false);
  t("by name", r.reason, "SET_MOVED");
  for (const id of ["INFO-2026-0612-retirefixture", "INFO-2026-0615-retirefixture"])
    t(`${id} is still verified — retirement is terminal, so this is the one that matters`,
      await stateOf(id), "verified");

  const fresh = await selectQuery("state:verified retirefixture");
  t("and a freshly-made selection retires normally", (await retire(fresh.handle)).ok, true);
}

/* ============================================================ block 3 ====
   AN ENUMERATED SELECTION IS UNMOVED, and the structural reason is asserted
   rather than assumed. */
console.log("\n--- an enumerated selection's behaviour is unmoved at every caller ---");
{
  for (const n of [1, 2]) await mkInfo(`INFO-2026-062${n}-enumfixture`, "enumfixture");
  const ids = ["INFO-2026-0621-enumfixture", "INFO-2026-0622-enumfixture"];
  const s = await selectIds(ids);
  t("naming ids makes it an enumeration", s.kind, "enumerated");

  const clean = await resolve(s.handle, "refuse");
  t("an unmoved enumeration passes a refuse-weight resolve, exactly as before", clean.ok, true);
  t("reporting no movement", clean.moved, false);
  /* THIS is why the new term cannot reach this arm: the enumerated branch never
     sets a digest at all, so `#answerChanged` is exactly `moved` here. */
  t("and carrying NO digest fact, which is what makes the enumerated arm untouched",
    clean.drift?.digestChanged, undefined);
  t("op=release over it still works", ((await release(s.handle)).released || []).length, 2);

  /* And the refusing arm the enumeration always had still refuses, for the
     per-row reason it always did. */
  for (const n of [3, 4]) await mkInfo(`INFO-2026-062${n}-enumfixture`, "enumfixture");
  const ids2 = ["INFO-2026-0623-enumfixture", "INFO-2026-0624-enumfixture"];
  const s2 = await selectIds(ids2);
  await call(`/purge?bundleId=INFO-2026-0624-enumfixture`);
  const moved = await resolve(s2.handle, "refuse");
  t("an enumeration that lost a member is still refused, on the per-row count", moved.ok, false);
  t("by the same name", moved.reason, "SET_MOVED");
  t("and it is `moved` that says so here, not a digest",
    [moved.moved, moved.drift?.digestChanged], [true, undefined]);
}

/* ============================================================ block 4 ====
   THE SECOND SITE: what the APPEND-ONLY RECORD says about the set that was
   cited. `cite` is report-weight, so the set is not refused — the entry must
   SAY the answer had changed, or the record is silent about the only drift a
   query selection can have. */
console.log("\n--- cite's Session Log states the drift a query selection actually has ---");
{
  await mkProj("PROJ-2026-0700-quiet");
  for (const n of [1, 2]) await mkInfo(`INFO-2026-070${n}-citefixture`, "citefixture");
  const quiet = await selectQuery("state:collected citefixture");
  t("an unchanged query selection is cited", (await cite("PROJ-2026-0700-quiet", quiet.handle)).ok, true);
  const quietDoc = await docOf("PROJ-2026-0700-quiet");
  /* Polarity both ways: the clause must be ABSENT when nothing changed, or its
     presence in the moved case would say nothing at all. */
  t("and the entry carries NO drift clause, because nothing had moved",
    /the set had moved since it was made/.test(quietDoc), false);
  t("while the entry itself is there and names the selection",
    quietDoc.includes(`Trigger: selection ${quiet.handle}`), true);

  await mkProj("PROJ-2026-0701-swapped");
  for (const n of [3, 4]) await mkInfo(`INFO-2026-070${n}-swapcite`, "swapcite");
  const s = await selectQuery("state:collected swapcite");
  t("a query selection over two", s.n, 2);
  await call(`/purge?bundleId=INFO-2026-0703-swapcite`);
  await mkInfo("INFO-2026-0705-swapcite", "swapcite");
  const rep = await resolve(s.handle, "report");
  t("swapped at a constant count", [rep.n, rep.moved, rep.drift?.digestChanged], [2, false, true]);

  const c = await cite("PROJ-2026-0701-swapped", s.handle);
  t("citing proceeds, because report-weight survives drift", c.ok, true);
  t("and the PUBLISHED `moved` still reports per-row movement honestly — no row moved",
    c.moved, false);
  const doc = await docOf("PROJ-2026-0701-swapped");
  t("THE RECORD SAYS THE SET HAD MOVED — the entry is not silent over a set that changed",
    /Trigger: selection sel-\w+ \(the set had moved since it was made; citing is report-weight and proceeded\)/.test(doc),
    true);
}

/* ============================================================ block 5 ====
   THE SWEEP FOR THE CLASS, at source level, over the REAL store.mjs.

   The question is not this one predicate. It is every place the plane decides
   whether a selection is safe to act on, or states whether the answer changed.
   Three walks, and each one's REACH is proved as a DELTA against a copy of the
   real source with the real guard mechanically stripped out — never against an
   absolute, because a walk that covers nothing passes everything.

   BOUND STATED RATHER THAN IMPLIED: `codeLines` strips comments by tracking
   block state across lines. It is NOT string-aware, so a `/*` inside a string
   literal would desync it — and a desynced stripper swallows code and reports a
   clean file, which is the generous direction. Two things stop that being a
   convention holding an instrument up: an ANCHOR assertion below requires the
   walk to actually see the lines it exists to judge, and every reach arm is a
   delta against the real site. The first draft filtered on "the line starts with
   a comment marker", which is the shape this file's comments MOSTLY have; it
   read a continuation line of a real comment as code and reported a false
   violation on the fix's own explanatory note. Corrected here rather than by
   rewording the comment, because an instrument that only works on prose written
   to suit it is measuring the prose. */
console.log("\n--- the sweep: every place the plane reads a selection's movement ---");

const codeLines = (src) => {
  const out = [];
  let inBlock = false;
  src.split("\n").forEach((raw, i) => {
    let code = "", j = 0;
    while (j < raw.length) {
      if (inBlock) {
        const end = raw.indexOf("*/", j);
        if (end === -1) j = raw.length; else { inBlock = false; j = end + 2; }
      } else {
        const open = raw.indexOf("/*", j), slash = raw.indexOf("//", j);
        if (slash !== -1 && (open === -1 || slash < open)) { code += raw.slice(j, slash); j = raw.length; }
        else if (open !== -1) { code += raw.slice(j, open); inBlock = true; j = open + 2; }
        else { code += raw.slice(j); j = raw.length; }
      }
    }
    if (code.trim()) out.push({ line: code, n: i + 1 });
  });
  return out;
};

/* WALK A — a read of `sel.moved` that is not a PUBLISHED PASS-THROUGH. A caller
   that hands `moved` onward under its own name is publishing the per-row fact
   and is correct; a caller that BRANCHES on it is asking "has this answer
   changed at all" of a value that cannot answer, which is the defect. */
const bareMovedReads = (src) => codeLines(src)
  .filter(({ line }) => /\bsel\.moved\b/.test(line))
  .filter(({ line }) => !/moved:\s*sel\.moved\b/.test(line))
  .filter(({ line }) => !/#answerChanged\([^)]*sel\.moved\s*\)/.test(line))
  .map(({ n }) => `store.mjs:${n}`);

/* WALK B — the refuse gate itself must ask the answer-changed question. */
const gateAsksAnswerChanged = (src) =>
  /const stopped = Store\.#answerChanged\(drift, moved\) && weight === "refuse";/.test(src);

/* WALK C — the gate is only one function, so it protects a refuse-weight act
   only if that act RETURNS on it. Every in-store caller that hard-codes
   `weight: "refuse"` is walked, and the site is named by the method that
   encloses it, so this reports WHICH acts the one gate reaches. */
const refuseCallers = (src) => {
  const lines = src.split("\n");
  const out = [];
  for (let i = 0; i < lines.length; i++) {
    if (!/this\.selectionResolve\(\{[^}]*weight: "refuse" \}\)/.test(lines[i])) continue;
    let owner = "?";
    for (let j = i; j >= 0; j--) {
      const m = /^  (#?[A-Za-z]\w*)\(/.exec(lines[j]);
      if (m) { owner = m[1]; break; }
    }
    const next = (lines[i + 1] || "").trim();
    out.push({ owner, n: i + 1, guarded: next === "if (!sel.ok) return sel;" });
  }
  return out;
};

/* THE WALK'S OWN ANCHOR, and it comes first: a stripper that swallowed the file
   would report every walk below as clean. This requires it to be LOOKING at the
   three lines the sweep is about, and to have correctly discarded the prose that
   merely mentions them. */
const seen = codeLines(STORE_SRC);
t("the walk sees the gate, the formula and the record statement as CODE",
  ["const stopped = Store.#answerChanged(drift, moved)", "const moved = drift.revised.length",
   "const setMovedNote = Store.#answerChanged(sel.drift, sel.moved)"]
    .filter((frag) => !seen.some(({ line }) => line.includes(frag))), []);
t("and discards a comment that merely NAMES `sel.moved` in prose",
  seen.some(({ line }) => /It read `sel\.moved`/.test(line)), false);

const bareNow = bareMovedReads(STORE_SRC);
t("NO decision and NO record statement in the plane branches on a bare `sel.moved`",
  bareNow, []);
t("the refuse gate asks the answer-changed question", gateAsksAnswerChanged(STORE_SRC), true);

const callers = refuseCallers(STORE_SRC);
t("the refuse-weight callers the one gate protects are found, and named",
  callers.map((c) => c.owner).sort(), ["#edgeTransition", "dispose", "release", "retire"]);
t("and every one of them RETURNS on the gate rather than reading past it",
  callers.filter((c) => !c.guarded).map((c) => `store.mjs:${c.n} ${c.owner}`), []);

/* THE RELATION THE WHOLE FIX RESTS ON, PINNED — and pinning a relation asserts
   no value, so it rules nothing. The published `moved` is composed from the
   three PER-ROW figures and `digestChanged` is NOT a term in it. This is the
   same relation civicos-ui/test/finder.test.mjs holds against this file from the
   other side; it is asserted HERE too because the wrong fix (folding the digest
   into the formula) is one character away from the right one and would be
   invisible to every behavioural assertion on the enumerated arm. */
const MOVED_FORMULA = (/const moved = ([^;]+);/.exec(STORE_SRC) || [, ""])[1];
t("the published `moved` is still composed of the three per-row figures",
  /revised/.test(MOVED_FORMULA) && /removed/.test(MOVED_FORMULA) && /added/.test(MOVED_FORMULA), true);
t("and `digestChanged` is STILL NOT a term in it — the fix is at the gate, not in the formula",
  /digestChanged/.test(MOVED_FORMULA), false);

/* ---- REACH, as a DELTA, against the real guard mechanically removed ---- */

/* A stripper that matches nothing reports a delta of zero and looks like a
   guard doing its job. REC-54 hit this exactly, and its stripper now throws. */
const strip = (label, from, to) => {
  if (!STORE_SRC.includes(from))
    throw new Error(`REACH ARM "${label}" MATCHED NOTHING: the stripper is describing a file that no `
                  + `longer exists, so any delta it reports is meaningless. Re-derive it against store.mjs.`);
  return STORE_SRC.replace(from, to);
};

const strippedGate = strip("the gate",
  'const stopped = Store.#answerChanged(drift, moved) && weight === "refuse";',
  'const stopped = moved && weight === "refuse";');
t("REACH (i), as a delta: strip the gate's own predicate and walk B stops passing",
  [gateAsksAnswerChanged(STORE_SRC), gateAsksAnswerChanged(strippedGate)], [true, false]);

const strippedNote = strip("cite's Session Log clause",
  "const setMovedNote = Store.#answerChanged(sel.drift, sel.moved)",
  "const setMovedNote = sel.moved");
t("REACH (ii), as a delta: put the record statement back on `sel.moved` and walk A names it",
  [bareMovedReads(STORE_SRC).length, bareMovedReads(strippedNote).length > 0], [0, true]);

const strippedGuard = strip("a refuse-weight caller's return",
  `const sel = this.selectionResolve({ handle, viewer, owner, weight: "refuse" });
    if (!sel.ok) return sel;
    if (!sel.members.length)
      return { ok: false, reason: "EMPTY_SELECTION", handle, drift: sel.drift,
               detail: "this selection resolves to no members, so there is nothing to retire" };`,
  `const sel = this.selectionResolve({ handle, viewer, owner, weight: "refuse" });
    if (!sel.members.length)
      return { ok: false, reason: "EMPTY_SELECTION", handle, drift: sel.drift,
               detail: "this selection resolves to no members, so there is nothing to retire" };`);
t("REACH (iii), as a delta: let one act read past the gate and walk C names that act",
  [refuseCallers(STORE_SRC).filter((c) => !c.guarded).length,
   refuseCallers(strippedGuard).filter((c) => !c.guarded).map((c) => c.owner)],
  [0, ["retire"]]);

await mf.dispose();
console.log(`\nrefuse-gate: ${pass} pass, ${fail} fail`);
process.exit(fail ? 1 : 0);
