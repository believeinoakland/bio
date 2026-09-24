/* NEGATIVE CONTROL: DECLARED HERE, RUN BY `test/m0187-surfacing-fixture.control.mjs` — deliberately NOT a `.test.mjs`, because it runs this suite against ARMED COPIES of `test/surfacing-run.mjs` and of `src/` while it runs, and the battery must not discover it. Re-run in one step from `bio-plane/`: `node test/m0187-surfacing-fixture.control.mjs [arm]`. RESULTS, RUN 2026-09-24 by the M0-187 worker (CONDUCT #20's, cloud), RE-RUN WHOLE after the rebase onto origin/main @ 1a7f0bcc0 (c20-batch24c) and recorded from THAT run, because the base moved under it and a control is a claim about the tree it ran on — the seven figures are identical to the run on e9b21be6 (real test/surfacing-run.mjs 11,814 B sha256 6e60cddd33f0…, src/index.mjs 809,434 B 8250f19e5a6d…, src/airun.mjs 160,488 B 5e26be852190…, checks/bio-checks.mjs 950,581 B cd2002b7bd44…, untouched: YES), ALL SEVEN ARMS AS DECLARED AT THE FIRST RUN: baseline -> 15/0 · **shared-title — THE ROW'S CONTROL, the fixture project's title back to the constant it was -> 10/5: ARM 2 (the second token in one store), ARM 4 (the same token in a second store) and ARM 5's three readings BY NAME, and each failing line SAYS `THREW NAME_TAKEN` — the cause the tree as it stood never printed** · swallow (the `.catch(() => null)` restored, titles still unique) -> 13/2: ARM 6's two lines ALONE, nothing else moved · **as-it-stood (BOTH halves restored — not a control arm but the REPRODUCTION of the shipped defect) -> 8/7: ARM 2, 4, 5 and 6, ARM 2 reading `SURFACE_NO_RUN`, and NAME_TAKEN nowhere in the run** · unique-by-uuid (OVER-STRICTNESS: the same uniqueness in a spelling this item did not write, `crypto.randomUUID()`) -> 15/0 · no-machinery (THE ONE TOLERATED CONDITION, driven at the plane: `surfaces` gone from the run's bound table, so `airunopen` refuses AI_RUN_BOUND_UNKNOWN) -> 4/11: every landing arm and ARM 7a, each reading the plane's own `SURFACE_NO_RUN` and NOTHING thrown — the creation went through byte-unchanged — while ARM 6 stayed GREEN, so the tolerance does not disarm the by-name raise · no-machinery-strict (the same plane with the tolerated set EMPTIED) -> 4/11: the same arms, now reading `THREW AI_RUN_BOUND_UNKNOWN`, which is what shows the pass-through is the tolerance's doing and not an accident. BEFORE THIS ITEM the suite read 8 pass, 7 fail — identical to the `as-it-stood` arm, measured on the unedited `bio-plane/test/surfacing-run.mjs` before either half was changed.
 * =========================================================================
 * M0-187 — THE SHARED SURFACING FIXTURE CAN SUPPLY A RUN FOR EVERY DEPLOY TOKEN IN A STORE, AND NAMES WHAT IT CANNOT.
 *
 * THE SUBJECT IS `test/surfacing-run.mjs`, which eighty suites import and which nothing tested. It wraps a plane so a
 * deploy token's inquiry creation is sent inside a surfacing run that token holds (REC-171, `INVESTIGATIVE-SESSION.md`
 * §11 item 5, rule 2). Its design authority for THIS item is `docs/development/VERIFICATION.md`: a refusal is reported
 * by name, never swallowed.
 *
 * WHAT WAS WRONG, measured on the unedited tree (`e9b21be6`): the run is opened over a fixture project the token
 * creates, and that project's title was the CONSTANT `REC-171 fixture project`. A project name is unique across an
 * instance, so the SECOND deploy token needing a run in one store was refused NAME_TAKEN; the wrapper's
 * `.catch(() => null)` discarded that, the creation went on un-run, and the suite read `SURFACE_NO_RUN` — a refusal
 * about the question, naming nothing about the fixture. Driven here before the fix: ARM 1 (admin) landed inside its
 * run, ARM 2 (member, same store) read `SURFACE_NO_RUN`, and the word NAME_TAKEN appeared nowhere in the run.
 *
 * HOW A LIAR PASSES THE OBVIOUS TEST, stated before what this checks: (1) hand the second token the FIRST token's run —
 * ARM 2 demands a run that is not ARM 1's, and ARM 5 reads every run's PRINCIPAL back from the plane; (2) make the
 * title unique per TOKEN and forget that one token needs a run in each STORE — ARM 4 drives the same token in a second
 * namespace; (3) "fix" the naming by raising on everything, which would break the one plane this fixture must tolerate
 * (older sources that know no `surfaces` bound) — the control's `no-machinery` arm drives that plane and demands the
 * creation go through UNCHANGED, and `no-machinery-strict` shows the tolerance is what does it; (4) reach further than
 * the fixture's contract — ARM 7a names another token's running run and must be refused AI_RUN_NOT_PRINCIPAL rather
 * than quietly re-pointed, and ARM 7b creates a NON-inquiry, which must not be wrapped at all.
 *
 * WHAT THIS SUITE CANNOT SEE: (i) one isolate, and one store per namespace — nothing here says whether two PROCESSES
 * sharing a persisted store collide, and the module-level counter is what that would rest on; (ii) it asserts what the
 * plane ANSWERS, not what a surface renders; (iii) the eighty suites that import the fixture are not driven here — the
 * battery is what says whether the change moved any of them; (iv) the `ai` credential's own surfacing rule, which is
 * `d85-surface-run.test.mjs`'s and is untouched.
 * ========================================================================= */
import "./stdio.mjs";                 /* D-282: a suite's own exit must not discard the suite's own output */
import "./sandbox.mjs";               /* D-186: owns $TMPDIR for this process and removes it on exit */
import { Miniflare } from "miniflare";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { join } from "node:path";

/* The control driver points these at an armed COPY of the fixture module and of `src/`. */
const SRC_DIR = process.env.M0187_SRC || fileURLToPath(new URL("../src", import.meta.url));
const IDX = join(SRC_DIR, "index.mjs");
const FIXTURE = process.env.M0187_FIXTURE || fileURLToPath(new URL("./surfacing-run.mjs", import.meta.url));
const { withSurfacingRun, SURFACING_RUN_LABEL } = await import(FIXTURE);
let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${JSON.stringify(want)}\n         got  ${JSON.stringify(got)}`}`);
  ok ? pass++ : fail++;
};

const ADM = "adm-m0187", MEM = "mem-m0187", PRB = "prb-m0187";
const base = new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: IDX, script: readFileSync(IDX, "utf8"),
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
  r2Buckets: ["CAPTURES", "PUBLISHED"],
  bindings: { ADMIN_TOKEN: ADM, MEMBER_TOKEN: MEM, PROBE_TOKEN: PRB, VERSION: "test" },
});
/* THE SUBJECT, over the three deploy tokens this isolate binds. `base` is the SAME plane UNWRAPPED — the witness
   that every landing below is the fixture's doing and not a plane that stopped asking for a run. */
const mf = withSurfacingRun(base, [ADM, MEM, PRB]);

try {

const sha = (v) => createHash("sha256").update(v).digest("hex");
const rP = (r) => (r && typeof r === "object" && "result" in r) ? r.result : r;
const on = (plane) => async (q, body) => {
  const res = await plane.dispatchFetch(`http://x/api/?${q}`,
    body === undefined ? {} : { method: "POST", body: JSON.stringify(body) });
  const text = await res.text();
  try { return rP(JSON.parse(text)); } catch { return { ok: false, reason: "UNPARSEABLE", body: text.slice(0, 200) }; }
};
const CALL = on(mf), RAW = on(base);
const E = encodeURIComponent;

const NOW = "2026-09-24T00:00:00Z";
let seq = 0, idSeq = 0;
const inquiryMd = (id) => ["---",
  `id: ${id}`, "object_type: inquiry", "schema: inquiry@1",
  `title: "Question ${id}"`, "current_state: open", "prior_state: null",
  `created: "${NOW}"`, `last_updated: "${NOW}"`,
  "produced_by:", "  mode: agent", "  capability_tier: high",
  "group: believe-in-oakland", "references: []", "state_history: []", "annotations_open: 0",
  "reeval_pending:", "  flag: false", "  since: null", "  source: null",
  "visuals: []", "surfaced_by: agent", 'disposition_reason: ""',
  "---", "", "## Question", "", `Did ${id} happen?`, "", "## What It Rests On", "",
  "## Conclusion", "", "## What Would Falsify This", "", "## Session Log", "", "## Review Notes", ""].join("\n");
const informationMd = (id) => ["---",
  `id: ${id}`, "object_type: information", "schema: information@1",
  `title: "Note ${id}"`, "current_state: collected", "prior_state: null",
  `created: "${NOW}"`, `last_updated: "${NOW}"`,
  "produced_by:", "  mode: agent", "  capability_tier: high",
  "group: believe-in-oakland", "references: []", "state_history: []",
  "---", "", "## Summary", "", "A note.", "", "## Session Log", ""].join("\n");
const pkg = (id, md, type, state) => ({
  bundleId: id, base: null, snapKey: `20260924T1700${String(++seq).padStart(2, "0")}Z_m0187aa`,
  meta: { object_type: type, group: "believe-in-oakland", title: `title for ${id}`,
          current_state: state, created: NOW, last_updated: NOW },
  files: [{ path: "bundle.md", text: md, bytes: Buffer.byteLength(md), sha256: sha(md) }],
  register: [],
});

/* WHY EVERY ARM CARRIES A `why`. The whole item is that a CAUSE reaches the reader. So a creation is reported as
   [landed, has a run, why] where `why` is the plane's refusal name, or `THREW <name>` when the fixture raised its
   own — and an arm that goes wrong PRINTS the name in its own FAIL line. Under the control that restores the shared
   title, ARM 2's line reads `THREW NAME_TAKEN`; on the tree as it stood it read `SURFACE_NO_RUN`, a refusal about
   the question that says nothing about the fixture. A throw is CAUGHT here rather than left to end the module,
   because a suite that dies at its first throw reports no tally at all (WORKER.md: a missing tally is -1). */
const causeOf = (message) => (/\(([A-Z_]+[A-Z_0-9]*)\)/.exec(String(message)) || [])[1] || String(message).slice(0, 80);
const question = async (plane, token, store, extra = {}) => {
  const id = `INQ-2026-9187-fixture-${++idSeq}`;
  let r = null, threw = null;
  try {
    r = await on(plane)(`op=promote&token=${E(token)}&store=${E(store)}`,
      { ...pkg(id, inquiryMd(id), "inquiry", "open"), ...extra });
  } catch (e) { threw = String((e && e.message) || e); }
  const why = threw !== null ? `THREW ${causeOf(threw)}` : (r && r.ok ? null : (r && r.reason) || "NO ANSWER");
  const run = (r && r.surfaced_in && r.surfaced_in.run) || null;
  return { id, r, threw, why, run, landed: Boolean(r && r.ok), hasRun: typeof run === "string" && run.length > 0 };
};
const readRun = async (token, store, run) =>
  (await RAW(`op=airun&token=${E(token)}&store=${E(store)}&run=${E(run)}`)) ?? null;
const got = (a) => [a.landed, a.hasRun, a.why];
const LANDED_IN_A_RUN = [true, true, null];

/* --------------------------------------------------------------------------------------------------------------
   WITNESSES */
console.log("\n--- WITNESS: the plane in this isolate DOES ask a deploy token's question for a run ---");
{
  const w = await question(base, ADM, "bio");
  t("WITNESS W1: UNWRAPPED, the admin token's question naming no run is refused SURFACE_NO_RUN by name (C-66.1) — "
    + "so every landing below is the fixture supplying a run, not a plane that asks for none",
    [w.landed, w.r && w.r.reason, w.r && w.r.check], [false, "SURFACE_NO_RUN", "C-66.1"]);
}

/* --------------------------------------------------------------------------------------------------------------
   THE ROW */
console.log("\n--- ARMS 1-2: two deploy tokens, ONE store (M0-187) ---");
const a1 = await question(mf, ADM, "bio");
t("ARM 1 (FIRST TOKEN): the admin token's question LANDS inside a run the fixture opened", got(a1), LANDED_IN_A_RUN);
const a2 = await question(mf, MEM, "bio");
t("ARM 2 (SECOND TOKEN, SAME STORE — THE ROW): the member token's question LANDS inside a run of ITS OWN. Before "
  + "M0-187 the fixture project's title was a constant, so this creation was refused NAME_TAKEN and the caller read "
  + "SURFACE_NO_RUN", got(a2), LANDED_IN_A_RUN);
t("ARM 2: and it is NOT the first token's run — a fixture that handed the second token the first's run would record "
  + "a surfacing under a principal that did not make it", a2.run !== a1.run, true);

console.log("\n--- ARMS 3-4: a third token, and the SAME token in a SECOND store ---");
const a3 = await question(mf, PRB, "scratch");
t("ARM 3 (THIRD TOKEN): the probe token's question LANDS inside a run of its own, in the namespace it is confined to",
  [...got(a3), a3.run !== a1.run && a3.run !== a2.run], [...LANDED_IN_A_RUN, true]);
const a4 = await question(mf, ADM, "scratch");
t("ARM 4 (THE STORE DIMENSION): the SAME token in a SECOND store gets a run of its own — the fixture's key is "
  + "(token, store), and a run lives in one namespace", [...got(a4), a4.run !== a1.run], [...LANDED_IN_A_RUN, true]);

console.log("\n--- ARM 5: each run is the one ITS OWN token holds, over a project of its own ---");
{
  const reads = [[ADM, "bio", a1, "class:admin"], [MEM, "bio", a2, "class:member"],
                 [PRB, "scratch", a3, "class:probe"], [ADM, "scratch", a4, "class:admin"]];
  const seen = [], ctx = [];
  for (const [tok, store, arm] of reads) {
    const rd = arm.hasRun ? await readRun(tok, store, arm.run) : null;
    const s = rd && rd.session;
    seen.push([Boolean(rd && rd.found), s && s.status, s && s.label, s && s.principal && s.principal.plane]);
    ctx.push(s && s.context && s.context.id);
  }
  t("ARM 5: all four runs read back RUNNING, labelled as the fixture's, each with the PRINCIPAL of the token whose "
    + "question it surfaced", seen, reads.map(([, , , cls]) => [true, "running", SURFACING_RUN_LABEL, cls]));
  t("ARM 5: the four runs are pairwise DISTINCT", new Set([a1.run, a2.run, a3.run, a4.run]).size, 4);
  t("ARM 5: and each stands over a fixture project of ITS OWN — the four distinct project names are exactly what "
    + "NAME_TAKEN was refusing", [new Set(ctx).size, ctx.every((x) => typeof x === "string" && x.startsWith("PROJ-"))],
    [4, true]);
}

console.log("\n--- ARM 6: a refusal the fixture cannot absorb is raised BY NAME, never swallowed ---");
{
  /* A token the plane will not authenticate, handed to the fixture AS a deploy token: the fixture's own attempt to
     build the run fails. That failure is the FIXTURE's to report — it is not an answer to the caller's question. */
  const impostor = withSurfacingRun(base, ["m0187-no-such-token"]);
  const a = await question(impostor, "m0187-no-such-token", "bio");
  t("ARM 6: the fixture THROWS rather than passing the creation through un-run", a.threw !== null, true);
  t("ARM 6: and the throw names the FIXTURE and the plane's OWN refusal, so the reader is not sent to diagnose the "
    + "question instead", [String(a.threw).includes("REC-171 fixture"), a.why], [true, "THREW NOT_AUTHENTICATED"]);
}

console.log("\n--- ARM 7 (OVER-STRICTNESS): what the fixture must NOT touch ---");
{
  /* Built on the RAW plane, so this arm stands whatever the arms above did. */
  const pmd = ["---", "object_type: project", "current_state: forming", `created: "${NOW}"`,
    `last_updated: "${NOW}"`, "references: []", "---", "", "## Summary", "",
    "M0-187 arm 7a: a project the MEMBER token opens a run of its own over.", "", "## Session Log", ""].join("\n");
  const proj = await RAW(`op=promote&token=${E(MEM)}&store=bio`, {
    base: null, snapKey: "20260924T170099Z_m0187a7",
    meta: { object_type: "project", title: "M0-187 arm 7a project", current_state: "forming",
            group: "believe-in-oakland", created: NOW, last_updated: NOW },
    files: [{ path: "bundle.md", text: pmd, bytes: Buffer.byteLength(pmd), sha256: sha(pmd) }], register: [] });
  const MRUN = "RUN-2026-0924-m0187-arm7a";
  const opened = await RAW(`op=airunopen&token=${E(MEM)}&store=bio`, {
    run: MRUN, contextType: "project", contextId: proj && proj.bundleId, label: "M0-187 arm 7a: the member's own run",
    mode: "check", principalClaude: "instance", principalClaudeRef: "fixture/claude",
    skillVersion: "investigative-session@1", bounds: [{ bound: "surfaces", allowed: 10, unit: "questions" }],
    leaseMs: 86_400_000 });
  t("ARM 7a (FIXTURE): the member's own run is open on the raw plane, so this arm rests on no arm above",
    [Boolean(proj && proj.ok), Boolean(opened && opened.started)], [true, true]);
  /* THE SHARPEST FORM: name ANOTHER token's RUNNING run. A fixture that re-pointed a named run at the caller's own
     would LAND this. An UNKNOWN run would not discriminate — it is refused SURFACE_NO_RUN, the same name an un-run
     creation gets. */
  const a = await question(mf, ADM, "bio", { run: MRUN });
  t("ARM 7a: a creation that ALREADY names a run is passed through untouched — naming the MEMBER token's running "
    + "run is refused AI_RUN_NOT_PRINCIPAL, never re-pointed at the admin's own", got(a),
    [false, false, "AI_RUN_NOT_PRINCIPAL"]);
  const id = `INFO-2026-9187-fixture-${++idSeq}`;
  const md = informationMd(id);
  const r = await CALL(`op=promote&token=${E(ADM)}&store=bio`, pkg(id, md, "information", "collected"));
  t("ARM 7b: a deploy token's creation that is NOT an inquiry is not wrapped at all — it lands with no surfacing run",
    [Boolean(r && r.ok), r && r.surfaced_in === undefined], [true, true]);
}

console.log("\n--- ARM 8: a whole-store purge takes the fixture's project and run with it ---");
{
  const p = await CALL(`op=purge&token=${E(ADM)}&store=scratch&confirm=scratch`, {});
  const after = await question(mf, PRB, "scratch");
  t("ARM 8: after a whole-store purge the next question in that namespace opens a FRESH run rather than naming one "
    + "the store no longer holds", [Boolean(p && p.ok), ...got(after), after.run !== a3.run],
    [true, ...LANDED_IN_A_RUN, true]);
}

} catch (e) {
  console.error("SUITE ERROR", e && e.stack || e);
  fail++;
} finally {
  await base.dispose();
}
/* THE FOOT: a TypeError inside an assertion ends the module while the tally reads clean (WORKER.md). */
console.log(`\nm0187-surfacing-fixture: ${pass} pass, ${fail} fail`);
process.exit(fail ? 1 : 0);
