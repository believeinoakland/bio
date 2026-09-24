/* D-334 — A BOUND-BUT-REVOKED MONITORING CREDENTIAL MUST FALL BACK, AND THE
 * REPORT MUST STILL SAY THE CREDENTIAL IS DEAD.
 *
 * THE DEFECT, found by DIST-4 from READING (the 2026-09-14 DIST -> RECORD
 * delegation in CLAIMS.md), never from a live failure. `#monitorToken()` in
 * store.mjs selected on PRESENCE — `DAEMON_TOKEN || ADMIN_TOKEN` — while
 * `classify()` in index.mjs admits a class only when `liveToken()` passes. So an
 * instance whose daemon value had ever been committed to this repository
 * (tokens.mjs: publication IS revocation) selected the dead credential on every
 * tick, was refused on every tick, and NEVER REACHED THE FALLBACK: monitoring
 * armed, firing 401s forever. DIST-1 refused exactly that shape when it kept
 * ADMIN_TOKEN as the fallback; the denylist reintroduced it through a side door.
 *
 * THE ITEM IS TWO HALVES AND THIS SUITE DRIVES BOTH ON ONE INSTANCE, because
 * either half alone is a worse outcome than the defect:
 *   RUNS    — a denylisted DAEMON_TOKEN beside a live ADMIN_TOKEN yields a
 *             monitoring tick that actually FIRES the archive fallback, end to
 *             end through the real ops, producing the grade-C two-hop capture.
 *   NAMED   — the same instance's own `op=selftest` still reports
 *             `bindings.DAEMON_TOKEN: false`, `tools/fleet-posture.mjs` still
 *             reads that as `daemon-revoked` and counts it BROKEN, and
 *             `op=livefire` still fails naming the binding. Healing the symptom
 *             into silence is the D-106 class and is refused: the operator's
 *             daemon credential is dead and every report keeps saying so.
 *
 * THE CLASS, NOT THE REPORT. The rule implemented is not "skip a dead
 * DAEMON_TOKEN"; it is SPEND ONLY A CREDENTIAL THE GATE WOULD ADMIT. A
 * denylisted ADMIN_TOKEN on an instance with no daemon binding is the identical
 * defect one name over, and arm D drives the both-dead case: the tick refuses BY
 * NAME rather than spending a credential the gate will refuse — a stated absence,
 * never a 401 loop and never a silently empty tick.
 *
 * WHAT THE STRUCTURAL ARM CAN AND CANNOT SEE (arm E). It scans `src/**` for the
 * `||` spelling of presence-selection over a token binding and requires ZERO
 * matches, and it prints the corpus it scanned. It CANNOT see the same choice
 * written as an `if`/`else` or a ternary, and it cannot see a binding reached
 * through a computed property name (`env[n]`, which `livefire.mjs` legitimately
 * uses for its published-value audit). It is a FLOOR on the class, not a ceiling,
 * which is why the behavioural arms above carry the weight.
 *
 * NEGATIVE CONTROL: D-506 re-ran this suite as a SUBJECT of its own three arms on 2026-09-24 (the arms are
 * in `src/livefire.mjs`; the full record is on `test/installer.test.mjs`'s NEGATIVE CONTROL line). Arm 1
 * and arm 2 each took this suite to 45/1, failing ONLY the arm declared, and arm 3 left it 46/46. This
 * suite's own arm B gained an INSTANCE_NAME binding in that landing and the count moved 45+1 -> 46; see
 * the comment at the binding for why, and `CLAUDE.md` §5 on re-running a control after changing its
 * subject — the three arms below were NOT re-run by D-506 and their figures are 2026-09-14's.
 *
 * NEGATIVE CONTROL: RUN 2026-09-14, three arms, each armed ALONE, others held
 * open, on the real source with a uniquely-named per-arm pristine copy taken
 * first and the restore verified by sha256 AND `cmp` with a printed byte count
 * and a floor (the git-checkout trap is why cp-aside is the protocol). Baseline
 * row: 45/45 green before every arm and after every restore. Runner:
 * `test/d334-monitor-credential.control.sh`, committed beside this file so the
 * next session re-runs all three in ONE step rather than re-deriving how to
 * break the subject; declared BEFORE arming, measured after.
 *   (1) THE ARM THIS ITEM EXISTS FOR — `#monitorToken()` restored to
 *       presence-only (`DAEMON_TOKEN || ADMIN_TOKEN`). DECLARED: the RUNS arms
 *       (A and D) must FAIL and the NAMED arms (B) must NOT, because the report
 *       is independent of whether selection is healed. MEASURED: 35 pass / 10
 *       FAIL — the fallback never fires, the archived bytes never land, the
 *       tick's failure is the gate's `NOT_AUTHENTICATED` instead of our own
 *       named refusal, and the `||` sweep and the three structural pins all
 *       bite. Arm B: 0 failures, exactly as declared. Arm C: 0, as declared.
 *   (2) OVER-STRICTNESS, in the direction that costs a WORKING instance its
 *       monitoring — selection made to refuse a LIVE DAEMON_TOKEN and always
 *       take the fallback. DECLARED: arm C must FAIL, arms A/B/D must not.
 *       MEASURED: 42 pass / 3 FAIL, all three arm C's (its dead fallback cannot
 *       carry the tick, which is what makes the arm discriminating rather than
 *       decorative). A, B and D: 0 failures, as declared.
 *   (3) THE HONESTY ARM — the fix left in place and the SYMPTOM healed into
 *       silence: `op=selftest` made to report a bound-but-dead daemon binding as
 *       "not configured" (the D-106 class, and the shape a well-meaning "tidy
 *       the report" change takes). DECLARED: arm B must FAIL; A, C and D must
 *       NOT, because monitoring still runs — which is exactly why silent healing
 *       is dangerous rather than obvious. MEASURED: 41 pass / 4 FAIL, all four
 *       arm B's: selftest stops saying `false`, fleet-posture reads
 *       `admin-fallback`, and `brokenCount` drops to 0. A, C, D: 0, as declared.
 *
 * AND ONE ARM CAME BACK WRONG, RECORDED RATHER THAN SMOOTHED. Arm 1's first
 * firing left the assertion "no failure mentions a refusal or an unauthenticated
 * answer" GREEN over a fully broken subject: it was a hand-spelled
 * `/401|unauthenticated|refus/i`, and the gate's real answer is the DEC-49 code
 * `NOT_AUTHENTICATED` — which contains "AUTHENTICATED", not "UNAUTHENTICATED".
 * A matcher grading a guessed spelling read the defect as clean. Both such
 * assertions now ask `ADMISSION_CHECKS` which codes exist instead of guessing,
 * and arm 1 re-run against the corrected suite went from 8 failures to 10.
 */
/* NEGATIVE CONTROL: in src/store.mjs make `#monitorToken()` presence-only again (`return (this.env && (this.env.DAEMON_TOKEN || this.env.ADMIN_TOKEN)) || null;`, sync, with the three fire sites un-awaited) -> the denylisted daemon credential is selected and refused on every tick, `fired` is [] and `failed` carries the refusal; this suite FAILS the RUNS arms while the NAMED arms stay green — which is the whole shape. See the run figures in the report below. */
import "./stdio.mjs";                 /* D-282: a suite's own exit must not discard the suite's own output */
import "./sandbox.mjs";               /* D-186: owns $TMPDIR for this process and removes it on exit */
import { Miniflare } from "miniflare";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { liveToken, PUBLISHED_TOKEN_HASHES } from "../src/tokens.mjs";
import { ADMISSION_CHECKS } from "../checks/bio-checks.mjs";
import { fleetPosture } from "../../tools/fleet-posture.mjs";

const SRC = fileURLToPath(new URL("../src/index.mjs", import.meta.url));
const STORE_SRC_PATH = fileURLToPath(new URL("../src/store.mjs", import.meta.url));
const TOKENS_SRC_PATH = fileURLToPath(new URL("../src/tokens.mjs", import.meta.url));
const INDEX_SRC_PATH = fileURLToPath(new URL("../src/index.mjs", import.meta.url));
const LIVEFIRE_SRC_PATH = fileURLToPath(new URL("../src/livefire.mjs", import.meta.url));
const SECRETS_PATH = fileURLToPath(new URL("../dist/SECRETS.txt", import.meta.url));

/* The denylisted values are READ FROM THE FILE THAT PUT THEM ON THE DENYLIST,
   never typed here: a fabricated "published" value would test the test rather
   than the denylist (claudecascade.test.mjs's own reasoning, reused). Two
   DISTINCT published values are taken so arm D can bind a dead daemon and a
   dead admin without the two collapsing into one comparison. */
const secretLine = (name) => {
  const l = readFileSync(SECRETS_PATH, "utf8").split("\n").find((x) => x.startsWith(name + "="));
  if (!l) throw new Error(`dist/SECRETS.txt has no ${name} line — the fixture's source moved`);
  return l.split("=")[1].trim();
};
/* Bound as DAEMON_TOKEN on purpose even though the file calls it ADMIN_TOKEN:
   the denylist is keyed by VALUE, not by binding NAME (daemon-token.test.mjs
   asserts exactly that), and using it here drives the property rather than
   restating it. */
const DEAD_DAEMON = secretLine("ADMIN_TOKEN");
const DEAD_ADMIN = secretLine("MEMBER_TOKEN");

const LIVE_ADMIN = "adm-d334-live-admin-credential";
const LIVE_DAEMON = "dmn-d334-live-daemon-credential";
const LIVE_MEMBER = "mem-d334-live-member-credential";
const LIVE_PROBE = "prb-d334-live-probe-credential";

/* The document the source has stopped serving and the Archive still holds —
   the archive-monitoring suite's fixture, so the loop under test here is the
   real one and not a reduced imitation of it. */
const DOCADDR = "https://www.oaklandca.gov/agenda.pdf";
const ARCHIVED = new Uint8Array(6000).map((_, i) => (i * 17 + 3) % 256);
const ARCHIVED_SHA = createHash("sha256").update(ARCHIVED).digest("hex");
const TS = "20240115120000";
const CDX = JSON.stringify([
  ["urlkey", "timestamp", "original", "mimetype", "statuscode", "digest", "length"],
  ["gov,oaklandca)/agenda.pdf", TS, DOCADDR, "application/pdf", "200", "MFCJ5MFCJ5MFCJ5MFCJ5MFCJ5MFCJ5MF", "6255"],
]);

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  ok ? pass++ : fail++;
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}`);
  if (!ok) console.log(`        want ${JSON.stringify(want)}\n        got  ${JSON.stringify(got)}`);
};

/* One instance, built the archive-monitoring suite's way: the SELF binding loops
   back to this same Worker so the tick reaches op=acquire through the real gate,
   and web.archive.org is mocked at the egress. */
function instance(bindings) {
  let MF;
  const mf = new Miniflare({
    modules: true, modulesRoot: "/", scriptPath: SRC, script: readFileSync(SRC, "utf8"),
    compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
    durableObjects: { STORE: { className: "Store", useSQLite: true } },
    r2Buckets: ["CAPTURES", "PUBLISHED"],
    bindings: {
      MEMBER_TOKEN: LIVE_MEMBER, PROBE_TOKEN: LIVE_PROBE, VERSION: "test",
      GOVERNOR_APPETITE_PER_MIN: "600000", GOVERNOR_SUBRESOURCE_STAGGER_MS: "0",
      /* Pinned far out of the test window: only the hand-driven onAlarm ticks. */
      MONITOR_TICK_MS: "3600000",
      /* ADDED BY D-506, and found by it. This fixture bound no INSTANCE_NAME, so its store records no
         producing group and D-436 (IC-172) has it REFUSE the canary's creation by name (C-64.1) — so
         `op=livefire` here failed FOURTEEN assertions, thirteen of them that cascade and nothing to do
         with the credential this suite is about. Nothing said so, because `livefire`'s answer was a
         bare `ok:false` until D-506 gave it `failing`. Every install binds INSTANCE_NAME (D-102), so
         binding it is what makes this fixture an instance rather than a store no install produces, and
         it lets arm B pin the canary's failure as the EXACT set it claims to be about. */
      INSTANCE_NAME: "d334-fixture",
      ...bindings,
    },
    serviceBindings: { SELF: async (request) => MF.dispatchFetch(request) },
    outboundService(request) {
      const u = new URL(request.url);
      if (u.hostname === "web.archive.org" && u.pathname === "/cdx/search/cdx")
        return new Response(CDX, { headers: { "content-type": "application/json" } });
      if (u.hostname === "web.archive.org" && u.pathname.includes("id_/"))
        return new Response(ARCHIVED, { headers: { "content-type": "application/pdf" } });
      return new Response("unscripted", { status: 500 });
    },
  });
  MF = mf;
  return mf;
}

/* Push one document to fallback_eligible with three REAL source failures and
   return the tick that acts on them. Returns the WHOLE tick account so an arm
   can read `fired` AND `failed` — a tick that fired nothing and a tick that
   failed loudly are different answers and this suite must tell them apart. */
async function driveToTick(mf) {
  const ns = await mf.getDurableObjectNamespace("STORE");
  const obj = ns.get(ns.idFromName("bio"));
  const rec = async (b) => (await (await obj.fetch("http://x/recordsourceoutcome",
    { method: "POST", body: JSON.stringify(b) })).json()).result;
  await rec({ addressNorm: DOCADDR, outcome: "source_refused", status: 503 });
  await rec({ addressNorm: DOCADDR, outcome: "fetch_failed" });
  await rec({ addressNorm: DOCADDR, outcome: "source_refused", status: 404 });
  return (await obj.onAlarm(Date.now())).monitor;
}

console.log("\n=== D-334: a revoked monitoring credential falls back, and is still NAMED ===");

/* ---------------------------------------------------------------------------
 * ARM 0 — THE FIXTURES ARE REAL. Every arm below rests on these two facts, and
 * a fixture that quietly stopped being denylisted would make the whole suite
 * pass by testing nothing (the empty-corpus class this project has met three
 * times). So they are asserted first and directly.
 * ------------------------------------------------------------------------ */
console.log("\n--- arm 0: the fixture is not vacuous ---");
t("the denylist is non-empty, so 'denylisted' is a real condition here",
  PUBLISHED_TOKEN_HASHES.size > 0, true);
t("the value bound as the dead DAEMON_TOKEN is GENUINELY denylisted",
  await liveToken(DEAD_DAEMON), false);
t("the second published value, bound as the dead ADMIN_TOKEN in arm D, is too",
  await liveToken(DEAD_ADMIN), false);
t("the two dead values are DISTINCT, so arm D really binds two dead credentials",
  DEAD_DAEMON === DEAD_ADMIN, false);
t("and every live fixture really is live, so a green arm is not green by accident",
  [await liveToken(LIVE_ADMIN), await liveToken(LIVE_DAEMON),
   await liveToken(LIVE_MEMBER), await liveToken(LIVE_PROBE)],
  [true, true, true, true]);

/* ---------------------------------------------------------------------------
 * ARM A + ARM B — ONE INSTANCE, BOTH TRUTHS. This is the queue row's
 * accepts-when in full: monitoring RUNS while the posture/selftest still names
 * the dead daemon credential.
 * ------------------------------------------------------------------------ */
{
  const mf = instance({ DAEMON_TOKEN: DEAD_DAEMON, ADMIN_TOKEN: LIVE_ADMIN });
  try {
    console.log("\n--- arm A: a DENYLISTED DAEMON_TOKEN beside a LIVE ADMIN_TOKEN — monitoring RUNS ---");
    const tick = await driveToTick(mf);
    t("the consumer is configured: a dead daemon binding does not inert monitoring",
      tick.configured, true);
    t("the failing document is a candidate", tick.eligible, [DOCADDR]);
    /* THE ARM THIS ITEM EXISTS FOR. Before the fix this list was EMPTY and
       `failed` carried the gate's refusal, forever, on every tick. */
    t("EXACTLY ONE fallback FIRED — the ADMIN_TOKEN fallback carried the tick",
      tick.fired.map((f) => [f.address, f.grade, f.hops]), [[DOCADDR, "C", 2]]);
    t("and NOTHING failed: no refusal, no 401 loop", tick.failed, []);
    /* Stated in its own right rather than inferred from the emptiness above, so
       a shape change that renames the failure cannot pass this silently.
       INVERTED ONTO THE CATALOG, and the first draft is why. It began as a
       hand-spelled `/401|unauthenticated|refus/i`, and under negative-control
       arm 1 — with the defect fully restored and the tick refused on every
       fire — it PASSED, because the gate's real answer is the DEC-49 code
       `NOT_AUTHENTICATED`, which contains "AUTHENTICATED" and not
       "UNAUTHENTICATED". A matcher grading a guessed spelling read the broken
       subject as clean. It now asks the ADMISSION catalog which codes exist, so
       it cannot go stale when a code is renamed and it grows when one is added.
       Recorded rather than smoothed: a surprising green is a finding about the
       ARM (WORKER.md), and this one was. */
    const seen = JSON.stringify(tick);
    t("no admission-refusal code from the catalog appears anywhere in the tick account",
      Object.keys(ADMISSION_CHECKS).filter((code) => seen.includes(code)), []);
    t("and the catalog this rests on is non-empty, so that filter cannot pass vacuously",
      Object.keys(ADMISSION_CHECKS).length > 3, true);

    console.log("\n--- arm A (cont.): the bytes really landed, content-addressed ---");
    const back = await mf.dispatchFetch(`http://x/api/?op=capture&token=${LIVE_ADMIN}&sha256=${ARCHIVED_SHA}`);
    t("the archived capture reads back from the store", back.status, 200);
    t("byte-identical to what web.archive.org served",
      createHash("sha256").update(Buffer.from(await back.arrayBuffer())).digest("hex"), ARCHIVED_SHA);

    console.log("\n--- arm B (THE HONESTY HALF): the same instance still NAMES the dead credential ---");
    const st = await (await mf.dispatchFetch(`http://x/api/?op=selftest&token=${LIVE_PROBE}`)).json();
    /* THREE STATES, and the middle one is the whole point: `false` is
       bound-and-dead, "not configured" is never-bound, `true` is live. A fix
       that healed selection by making this read "not configured" would have
       erased the operator's problem instead of solving it. */
    t("op=selftest reports bindings.DAEMON_TOKEN FALSE — bound and dead, not absent",
      st.bindings.DAEMON_TOKEN, false);
    t("and the instance is otherwise healthy, so 'dead daemon' is not hidden behind a red selftest",
      [st.ok, st.bindingsAllPresent], [true, true]);
    t("the selftest answer never contains the credential value itself",
      JSON.stringify(st).includes(DEAD_DAEMON), false);

    /* Driven through the REAL report tool over this instance's own answer —
       not over a fixture that merely resembles it. */
    const report = await fleetPosture(
      [{ name: "d334-instance", base: "http://x", token: LIVE_PROBE }],
      { fetchImpl: (url) => mf.dispatchFetch(url) });
    const row = report.instances[0];
    t("fleet-posture reads this instance as daemon-revoked — never clean, never fallback",
      row.posture, "daemon-revoked");
    t("and counts it BROKEN", [report.brokenCount, report.fallbackCount], [1, 0]);
    t("the row still SAYS BROKEN in words an operator reads",
      row.detail?.includes("BROKEN") ?? "no detail", true);
    t("the report is COMPLETE, so the broken row is a measurement and not a hole",
      report.complete, true);
    t("no credential value reaches the report",
      JSON.stringify(report).includes(DEAD_DAEMON) || JSON.stringify(report).includes(LIVE_PROBE), false);

    console.log("\n--- arm B (cont.): the THIRD truth — livefire still fails on the binding by NAME ---");
    const lf = await (await mf.dispatchFetch(`http://x/api/?op=livefire&token=${LIVE_PROBE}`)).json();
    const a = lf.assertions.find((x) => x.name === "no configured token is a published repository value");
    /* CORRECTED BY D-506 (IC-265), never exempted: `lf.ok` was the canary's VERDICT and is now the op
       ANSWERING, so the old pin's `false` would have been testing that the op refused — which it never
       did. The truth this arm states is unchanged: the canary goes red on the published daemon binding
       AND says which assertion. `failing` is read here as well, because the finding this arm exists to
       carry is the NAME of the credential defect, not the colour. */
    t("livefire goes red on the published daemon binding", [lf.ok, lf.verdict, a.ok], [true, "fail", false]);
    t("and the verdict NAMES the token-hygiene assertion",
      lf.failing, ["no configured token is a published repository value"]);
    t("naming the BINDING, never the value", JSON.stringify(a.got), JSON.stringify(["DAEMON_TOKEN"]));
    t("and the livefire answer never contains the value",
      JSON.stringify(lf).includes(DEAD_DAEMON), false);
  } finally { await mf.dispose(); }
}

/* ---------------------------------------------------------------------------
 * ARM C — OVER-STRICTNESS. A LIVE DAEMON_TOKEN must still be selected over the
 * fallback, exactly as before this item. The proof is BEHAVIOURAL rather than a
 * restatement: the ADMIN_TOKEN in this instance is itself denylisted, so the
 * capture below is one the fallback could not possibly have made. A fix that
 * had become shy about the daemon class — or that had started preferring the
 * fallback — fires nothing here.
 * ------------------------------------------------------------------------ */
{
  const mf = instance({ DAEMON_TOKEN: LIVE_DAEMON, ADMIN_TOKEN: DEAD_ADMIN });
  try {
    console.log("\n--- arm C (over-strictness): a LIVE DAEMON_TOKEN is still preferred ---");
    const tick = await driveToTick(mf);
    t("the tick FIRED under the daemon credential — the dead fallback could not have done it",
      tick.fired.map((f) => [f.address, f.grade, f.hops]), [[DOCADDR, "C", 2]]);
    t("and nothing failed", tick.failed, []);
    const st = await (await mf.dispatchFetch(`http://x/api/?op=selftest&token=${LIVE_PROBE}`)).json();
    t("selftest reports the daemon binding LIVE", st.bindings.DAEMON_TOKEN, true);
    const report = await fleetPosture(
      [{ name: "d334-live-daemon", base: "http://x", token: LIVE_PROBE }],
      { fetchImpl: (url) => mf.dispatchFetch(url) });
    t("and the posture is the clean one — over-strictness would show up here as a false alarm",
      [report.instances[0].posture, report.brokenCount], ["daemon", 0]);
  } finally { await mf.dispose(); }
}

/* ---------------------------------------------------------------------------
 * ARM D — THE CLASS, NOT THE REPORT. Both bound credentials denylisted. There is
 * nothing live to fall back TO, so the honest answer is a STATED refusal naming
 * the condition — never a 401 loop, and never a tick that reports nothing and
 * lets an operator read it as "no work found".
 * ------------------------------------------------------------------------ */
{
  const mf = instance({ DAEMON_TOKEN: DEAD_DAEMON, ADMIN_TOKEN: DEAD_ADMIN });
  try {
    console.log("\n--- arm D (the class): BOTH credentials dead — refused BY NAME, not 401 forever ---");
    const tick = await driveToTick(mf);
    t("the document is still recognised as eligible — the defect is credential, not fence",
      tick.eligible, [DOCADDR]);
    t("nothing fired, because nothing could be honestly spent", tick.fired, []);
    t("and the failure is STATED, one per eligible document",
      tick.failed.map((f) => f.address), [DOCADDR]);
    t("naming the condition in words an operator can act on",
      [/no LIVE monitoring credential/.test(String(tick.failed[0]?.reason)),
       /denylisted|publication is revocation/i.test(String(tick.failed[0]?.reason))],
      [true, true]);
    /* Inverted onto the catalog for the reason arm A records: the refusal must
       be OURS, decided before the request, and not the GATE's answer to a
       request we should never have made. An admission code anywhere in this
       account means the fetch happened. */
    t("and NOT as the gate's answer to a request that was never worth making",
      Object.keys(ADMISSION_CHECKS).filter((code) => JSON.stringify(tick).includes(code)), []);
    t("the refusal never contains a credential value",
      JSON.stringify(tick).includes(DEAD_DAEMON) || JSON.stringify(tick).includes(DEAD_ADMIN), false);
  } finally { await mf.dispose(); }
}

/* ---------------------------------------------------------------------------
 * ARM E — THE CLASS SWEEP, over the plane's own source. The defect's KIND is
 * "a credential chosen by PRESENCE where the gate admits by LIVENESS", and its
 * recognisable-in-principle spelling is the `||` chain over token bindings.
 * The corpus is printed; the limits are stated in the header.
 * ------------------------------------------------------------------------ */
console.log("\n--- arm E (the class sweep): no presence-only credential selection in src/ ---");
{
  const files = [
    ["src/store.mjs", STORE_SRC_PATH], ["src/index.mjs", INDEX_SRC_PATH],
    ["src/tokens.mjs", TOKENS_SRC_PATH], ["src/livefire.mjs", LIVEFIRE_SRC_PATH],
  ];
  const BINDING = /\b(ADMIN|MEMBER|PROBE|DAEMON)_TOKEN\b/;
  const PRESENCE_OR = /\b(ADMIN|MEMBER|PROBE|DAEMON)_TOKEN\s*\|\|/;
  /* STRIP COMMENTS PROPERLY, with a block state machine rather than a
     per-line regex. THIS ARM'S FIRST FIRING CAUGHT ITS OWN CORRECTION: the
     rewritten `#monitorToken()` quotes the broken expression VERBATIM in the
     comment that explains why it is gone, and so does this file's header, so a
     line-local stripper scored the explanation as the defect. Recorded rather
     than smoothed — it is the trap WORKER.md names and it fired here. */
  const stripComments = (src) => {
    const out = [];
    let inBlock = false;
    for (const line of src.split("\n")) {
      let code = "", i = 0;
      while (i < line.length) {
        if (inBlock) {
          const end = line.indexOf("*/", i);
          if (end === -1) { i = line.length; } else { inBlock = false; i = end + 2; }
          continue;
        }
        const b = line.indexOf("/*", i), l = line.indexOf("//", i);
        if (l !== -1 && (b === -1 || l < b)) { code += line.slice(i, l); i = line.length; continue; }
        if (b !== -1) { code += line.slice(i, b); inBlock = true; i = b + 2; continue; }
        code += line.slice(i); i = line.length;
      }
      out.push(code);
    }
    return out;
  };
  let scannedLines = 0, readSites = 0;
  const offenders = [], arming = [];
  for (const [name, path] of files) {
    const code = stripComments(readFileSync(path, "utf8"));
    scannedLines += code.length;
    code.forEach((line, i) => {
      if (BINDING.test(line)) readSites++;
      if (!PRESENCE_OR.test(line)) return;
      /* THE DELIBERATE CLOSURE, distinguished rather than exempted. A presence
         `||` that is BOOLEAN-COERCED cannot hand its caller a credential — it
         answers "is monitoring WIRED", which is the question REC-1's sync
         scheduler seam asks and the one presence is the right test for. A
         presence `||` that is NOT coerced yields a VALUE, and a value is spent:
         that is the defect's shape and there must be none. */
      (/!!\(/.test(line) ? arming : offenders).push(`${name}:${i + 1}`);
    });
  }
  console.log(`        corpus: ${files.length} source file(s), ${scannedLines} lines, ${readSites} executable token-binding read(s)`);
  console.log(`        presence-|| sites: ${offenders.length} selecting (must be 0) · ${arming.length} boolean-coerced arming predicate(s): ${arming.join(", ") || "none"}`);
  t("the corpus is non-empty and really reaches the bindings — this arm cannot pass vacuously",
    [files.length === 4, scannedLines > 30000, readSites >= 10], [true, true, true]);
  t("NO executable line in the plane selects a credential VALUE by presence with `||`",
    offenders, []);
  t("the one presence-`||` that remains is the boolean arming predicate, and there is exactly one",
    arming.length, 1);
}

console.log("\n--- arm E (cont.): the arming predicate cannot leak a credential to a caller ---");
{
  const STORE_SRC = readFileSync(STORE_SRC_PATH, "utf8");
  /* The closure above is only safe while it stays boolean and stays unspent, so
     both properties are pinned instead of trusted. */
  t("#monitorTokenBound() returns a `!!`-coerced boolean, so it can never BE a token",
    /#monitorTokenBound\(\) \{\s*return !!\(this\.env && \(this\.env\.DAEMON_TOKEN \|\| this\.env\.ADMIN_TOKEN\)\);/
      .test(STORE_SRC), true);
  /* Its callers: the two "is this consumer wired" predicates and nothing else.
     A third caller would be a new place where presence stands in for liveness. */
  const callers = (STORE_SRC.match(/this\.#monitorTokenBound\(\)/g) || []).length;
  t("and it is consulted by exactly the two sync `*Configured()` predicates", callers, 2);
}

console.log("\n--- arm E (cont.): the fix is where it is claimed to be, structurally ---");
{
  const STORE_SRC = readFileSync(STORE_SRC_PATH, "utf8");
  /* A structural pin beside the behavioural arms, for the reason WORKER.md
     gives: a revert that happened to be behaviourally invisible in some future
     shape would still be caught here. */
  /* CORRECTED 2026-09-24 at integration by c19-unionfix: the pin read the import as `{ liveToken }` EXACTLY, and
     D-260 (c19-batch9) widened that same import to `{ liveToken, sha256hex, instanceAiCredential,
     instanceClaudeToken }` — the gate's own predicate is still imported from tokens.mjs, so the old spelling was
     pinning the SHAPE of the line rather than the property. It now asks that `liveToken` is a named import of
     `./tokens.mjs`, and still fails on a store that re-derives it or imports it from anywhere else. */
  t("store.mjs imports the GATE'S OWN predicate rather than re-deriving one",
    /import \{[^}]*\bliveToken\b[^}]*\} from "\.\/tokens\.mjs";/.test(STORE_SRC), true);
  t("#monitorToken() is ASYNC and asks liveToken before selecting the daemon credential",
    /async #monitorToken\(\)[\s\S]{0,400}?await liveToken\(env\.DAEMON_TOKEN\)/.test(STORE_SRC), true);
  t("and asks it of ADMIN_TOKEN too — the class, not the reported half",
    /async #monitorToken\(\)[\s\S]{0,700}?await liveToken\(env\.ADMIN_TOKEN\)/.test(STORE_SRC), true);
  t("the SYNC arming predicate stays presence-only, so REC-1's scheduler seam is unchanged",
    /#monitorConfigured\(\) \{[\s\S]{0,200}?this\.#monitorTokenBound\(\)/.test(STORE_SRC), true);
  t("and every fire site AWAITS the selection — an un-awaited Promise is a truthy token",
    (STORE_SRC.match(/const token = await this\.#monitorToken\(\);/g) || []).length, 3);
  t("with the no-live-credential refusal stated once and reused, never spelled three ways",
    (STORE_SRC.match(/Store\.MONITOR_NO_LIVE_CREDENTIAL/g) || []).length, 3);
}

console.log(`\nd334-monitor-credential: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
