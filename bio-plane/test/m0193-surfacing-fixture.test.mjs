/* NEGATIVE CONTROL: DECLARED HERE, RUN BY `test/m0193-surfacing-fixture.control.mjs` (not a `.test.mjs`: it runs this suite against ARMED COPIES of `test/surfacing-run.mjs`). Re-run from `bio-plane/`: `node test/m0193-surfacing-fixture.control.mjs [arm]`. RESULTS, RUN 2026-09-25 by the M0-193 worker (SCHEDULER #21's, cloud) on origin/main 964da679 + this item (real test/surfacing-run.mjs 12,489 B sha256 7bfb0687545a, untouched: YES), ALL EIGHT ARMS AS DECLARED: baseline -> 13/0 · **no-nth — THE ROW'S CONTROL, F2 half: `nth` dropped from the snap key -> 12/1, `ARM 1 (F2)` ALONE** · **clear-on-attempt — THE ROW'S CONTROL, F3 half: `runs.clear()` on every whole-store purge attempt -> 10/3, the three `ARM 2 (...) (F3)` lines ALONE (no confirm, wrong confirm, member class)** · as-it-stood (BOTH halves restored: the REPRODUCTION of the shipped defects, the tree before this item) -> 9/4, ARM 1 (F2) and the three ARM 2 (F3) · never-clear (a liar: no purge clears) -> 12/1, `ARM 4:` alone · consume-body (a liar: the wrapper reads the purge answer without cloning it) -> 9/4, the three ARM 3 lines and ARM 4 FIXTURE — the caller can no longer read its own answer · key-by-uuid (OVER-STRICTNESS: a unique key in a spelling this item did not write) -> 13/0 · clear-on-status (OVER-STRICTNESS: the cache follows the HTTP status and a non-false `ok`) -> 13/0. FINDINGS ABOUT THE INSTRUMENT, not the subject, fixed before this record: the first run had ARM 4 and the ARM 2 witness counting ABSOLUTELY, so clear-on-attempt cascaded into both (now counted relative to the fixture's own promotes and opens); a consumed body ended the module with SUITE ERROR and no by-name failure (now reported as an UNREADABLE answer); and consume-body was first DECLARED to fail `ARM 4:`, which passed — correctly, the wrapper still read `ok:true` and cleared: the declaration was wrong.
 * =========================================================================
 * M0-193 — THE SHARED SURFACING FIXTURE'S TWO LATENT DEFECTS, EACH DRIVEN BY A PLANTED ARM BEFORE ITS FIX.
 *
 * THE SUBJECT is `test/surfacing-run.mjs` (REC-171's fixture; M0-187's suite covers its run-per-token half). The
 * design authority is `docs/development/VERIFICATION.md`: a fixture's state follows what the plane ANSWERED, never
 * what was asked.
 *
 * F2 — the fixture project's snap key was the whole SECOND alone (`<stamp>_5171f1a0`), so two runs opened in one
 * second promoted their projects under ONE key. Harmless today: a snap key is unique per BUNDLE (`SNAP_KEY_TAKEN`
 * reads `WHERE bundle_id=? AND snap_key=?`) and every fixture project is a bundle of its own — which is exactly why no
 * suite ever showed it, and why this arm reads the key the fixture SENT rather than anything the plane refused.
 * PLANTED: the process clock is frozen while two tokens open their runs, so "one second" is a fact, not a race.
 *
 * F3 — the wrapper cleared its run cache on ANY whole-store `op=purge` ATTEMPT, a refused one included. Harmless
 * today: a refused purge leaves the runs held, so the cleared cache only opened a spare run and project. PLANTED: a
 * purge refused for a missing `confirm`, one for a wrong `confirm`, and one refused for the member's class; after
 * each, the admin's next question must land in the SAME run and no new `airunopen` may be sent.
 *
 * HOW A LIAR PASSES THE OBVIOUS TEST, stated before what this checks: (1) never clear at all — ARM 4 purges FOR REAL
 * and demands a fresh run (the stale one would be refused by the plane); (2) clear on the HTTP status rather than the
 * answer — the arms read the plane's own `ok`; (3) consume the purge's body to read it and hand the caller an empty
 * one — ARMS 3 and 4 read the refusal and the result THROUGH the wrapper; (4) make the key unique by a different
 * spelling — the control's over-strictness arm must stay green.
 *
 * WHAT THIS SUITE CANNOT SEE: two PROCESSES sharing one persisted store (the counter is module-scoped); a purge answer
 * the plane does not give today (an `ok:true` that removed nothing would clear the cache, and cost only a spare run).
 * ========================================================================= */
import "./stdio.mjs";                 /* D-282: a suite's own exit must not discard the suite's own output */
import "./sandbox.mjs";               /* D-186: owns $TMPDIR for this process and removes it on exit */
import { Miniflare } from "miniflare";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";

/* The control driver points this at an armed COPY of the fixture module. */
const IDX = fileURLToPath(new URL("../src/index.mjs", import.meta.url));
const FIXTURE = process.env.M0193_FIXTURE || fileURLToPath(new URL("./surfacing-run.mjs", import.meta.url));
const { withSurfacingRun } = await import(FIXTURE);
let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${JSON.stringify(want)}\n         got  ${JSON.stringify(got)}`}`);
  ok ? pass++ : fail++;
};

const ADM = "adm-m0193", MEM = "mem-m0193", PRB = "prb-m0193";
const base = new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: IDX, script: readFileSync(IDX, "utf8"),
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
  r2Buckets: ["CAPTURES", "PUBLISHED"],
  bindings: { ADMIN_TOKEN: ADM, MEMBER_TOKEN: MEM, PROBE_TOKEN: PRB, VERSION: "test" },
});

/* THE WITNESS: every request the FIXTURE sends on its own account (its project's promote, its `airunopen`) is seen
   here, because the fixture binds `dispatchFetch` from the object it is handed. */
const sent = [];
const seen = new Proxy(base, {
  get(target, prop) {
    if (prop === "dispatchFetch") return async (input, init) => {
      const u = new URL(String(input));
      let body = null;
      try { body = init && typeof init.body === "string" ? JSON.parse(init.body) : null; } catch { body = null; }
      sent.push({ op: u.searchParams.get("op"), token: u.searchParams.get("token"), body });
      return target.dispatchFetch(input, init);
    };
    const v = Reflect.get(target, prop, target);
    return typeof v === "function" ? v.bind(target) : v;
  },
});
const mf = withSurfacingRun(seen, [ADM, MEM, PRB]);

try {

const sha = (v) => createHash("sha256").update(v).digest("hex");
const E = encodeURIComponent;
const call = async (q, body) => {
  const res = await mf.dispatchFetch(`http://x/api/?${q}`,
    body === undefined ? {} : { method: "POST", body: JSON.stringify(body) });
  /* A body the wrapper CONSUMED cannot be read again: that is reported as an answer ARM 3 and ARM 4 fail on BY NAME,
     never left to end the module (WORKER.md: a suite that dies reports no tally). */
  let text;
  try { text = await res.text(); } catch (e) { return { ok: "UNREADABLE", error: String((e && e.message) || e) }; }
  try { return JSON.parse(text); } catch { return { ok: false, reason: "UNPARSEABLE", body: text.slice(0, 200) }; }
};
const NOW = "2026-09-25T00:00:00Z";
let seq = 0;
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
const question = async (token) => {
  const id = `INQ-2026-9193-fixture-${++seq}`;
  const md = inquiryMd(id);
  let r = null, threw = null;
  try {
    r = await call(`op=promote&token=${E(token)}`, {
      bundleId: id, base: null, snapKey: `20260925T0000${String(seq).padStart(2, "0")}Z_m0193aa`,
      /* CORRECTED at the c22-batch29 union (CONDUCT #22), never exempted: M0-193 was cut before D-563, whose C-86.3
         refuses an envelope title the held document contradicts ("title for …" against "Question …"), so every
         fixture promote read ENVELOPE_TITLE_DISAGREES. The envelope's title is dropped as D-563 dropped it in its own
         fixtures; promote derives it from the document. */
      meta: { object_type: "inquiry", group: "believe-in-oakland",
              current_state: "open", created: NOW, last_updated: NOW },
      files: [{ path: "bundle.md", text: md, bytes: Buffer.byteLength(md), sha256: sha(md) }], register: [] });
  } catch (e) { threw = String((e && e.message) || e); }
  const res = r && r.result && typeof r.result === "object" ? r.result : r;
  const run = (res && res.surfaced_in && res.surfaced_in.run) || null;
  return { landed: Boolean(res && res.ok), run, why: threw ? `THREW ${threw.slice(0, 80)}` : (res && res.ok ? null : (res && res.reason) || "NO ANSWER") };
};
const opens = () => sent.filter((s) => s.op === "airunopen").length;
const fixtureKeys = () => sent.filter((s) => s.op === "promote" && s.body && s.body.meta
  && s.body.meta.object_type === "project").map((s) => s.body.snapKey);
const bundles = async () => {
  const s = await base.dispatchFetch(`http://x/api/?op=stats&token=${E(ADM)}`);
  const j = await s.json();
  return (j && j.result && j.result.bundles) ?? null;
};

/* ------------------------------------------------------------------------------------------------------------ F2 */
console.log("\n--- ARM 1 (F2): two runs opened in ONE SECOND get DISTINCT snap keys ---");
{
  /* THE PLANT: freeze the process clock at one instant while two tokens each open a run. `Date` is replaced only
     for this block, and the plane (workerd, another process) never sees it. */
  const RealDate = globalThis.Date;
  const FROZEN = RealDate.parse("2026-09-25T03:04:05.678Z");
  class FrozenDate extends RealDate {
    constructor(...a) { if (a.length) super(...a); else super(FROZEN); }
    static now() { return FROZEN; }
  }
  globalThis.Date = FrozenDate;
  let a, b;
  try { a = await question(ADM); b = await question(MEM); } finally { globalThis.Date = RealDate; }
  const keys = fixtureKeys();
  const created = sent.filter((s) => s.op === "promote" && s.body && s.body.meta
    && s.body.meta.object_type === "project").map((s) => s.body.meta.created);
  t("ARM 1 FIXTURE: both questions landed, each inside a run of its own", [a.landed, b.landed, a.why, b.why,
    Boolean(a.run) && Boolean(b.run) && a.run !== b.run], [true, true, null, null, true]);
  t("ARM 1 PLANT: the fixture opened TWO runs, over two projects stamped in the SAME second",
    [opens(), created.length, new Set(created).size, created[0]], [2, 2, 1, "2026-09-25T03:04:05Z"]);
  t("ARM 1 (F2): the two fixture projects were promoted under DISTINCT snap keys — before M0-193 both read "
    + "`20260925T030405Z_5171f1a0`", [keys.length, new Set(keys).size], [2, 2]);
}

/* ------------------------------------------------------------------------------------------------------------ F3 */
console.log("\n--- ARMS 2-3 (F3): a REFUSED whole-store purge leaves the run cache ---");
const first = await question(ADM);
const opensBefore = opens();
const heldBefore = await bundles();
const keysBefore = fixtureKeys().length;
t("ARM 2 FIXTURE: the admin's question lands in the run ARM 1 opened, and no new run is opened for it",
  [first.landed, first.why, opens()], [true, null, 2]);
{
  const refusals = [
    ["no confirm", `op=purge&token=${E(ADM)}`, "purge requires confirm=<store>"],
    ["wrong confirm", `op=purge&token=${E(ADM)}&confirm=scratch`, "purge requires confirm=<store>"],
    ["member class", `op=purge&token=${E(MEM)}&confirm=bio`, "forbidden for token class"],
  ];
  for (const [name, q, error] of refusals) {
    const p = await call(q, {});
    /* ARM 3: the wrapper read the answer, and the CALLER still reads it whole. */
    t(`ARM 3 (${name}): the purge is REFUSED, and the caller reads the plane's refusal THROUGH the wrapper`,
      [p.ok, String(p.error || "").includes(error)], [false, true]);
    const next = await question(ADM);
    t(`ARM 2 (${name}) (F3): after the refused purge the admin's next question lands in the SAME run, and the fixture `
      + `opens NO new one — before M0-193 the cache was cleared and a spare run opened`,
      [next.landed, next.why, next.run === first.run, opens()], [true, null, true, opensBefore]);
  }
  /* Counted RELATIVE to what the fixture itself promoted in this block, so the witness says only "nothing was
     removed" and does not fail again for a spare run ARM 2 already names. */
  t("ARM 2 WITNESS: the refused purges removed nothing — the store holds what it held, plus the three questions and "
    + "any project the fixture promoted meanwhile",
    await bundles(), heldBefore === null ? null : heldBefore + 3 + (fixtureKeys().length - keysBefore));
}

console.log("\n--- ARM 4 (OVER-STRICTNESS): a purge that HAPPENED still clears the cache ---");
{
  const o = opens();
  const p = await call(`op=purge&token=${E(ADM)}&confirm=bio`, {});
  t("ARM 4 FIXTURE: the whole-store purge happened, and the caller reads its result through the wrapper",
    [p.ok, p.result && p.result.after && p.result.after.bundles], [true, 0]);
  const after = await question(ADM);
  t("ARM 4: the next question opens a FRESH run — a cache that never cleared would name a run the store no longer "
    + "holds", [after.landed, after.why, after.run !== first.run, opens()], [true, null, true, o + 1]);
}

} catch (e) {
  console.error("SUITE ERROR", e && e.stack || e);
  fail++;
} finally {
  await base.dispose();
}
/* THE FOOT: a TypeError inside an assertion ends the module while the tally reads clean (WORKER.md). */
console.log(`\nm0193-surfacing-fixture: ${pass} pass, ${fail} fail`);
process.exit(fail ? 1 : 0);
