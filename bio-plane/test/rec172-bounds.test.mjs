/* NEGATIVE CONTROL: DECLARED HERE, RUN BY `test/rec172-bounds.control.mjs` — deliberately NOT a `.test.mjs`, because it patches COPIES of `src/` (and of `test/vf4-live-scratch.mjs`) while it runs and the battery must not discover it. Re-run in one step from `bio-plane/`: `node test/rec172-bounds.control.mjs [arm]`. RESULTS, RUN 2026-09-23 by the REC-172 worker (CONDUCT #15's, cloud) on 91913d6b + this item (real src/store.mjs 2,842,811 B sha256 34f33c573468, src/airun.mjs 148,602 B e73cb1d08777, src/index.mjs 715,196 B 631fdbf09c26, checks/bio-checks.mjs 829,476 B 89f470e81317, test/vf4-live-scratch.mjs 57,439 B 16072bc2aee2, untouched: YES), ALL EIGHT ARMS AS DECLARED at the first run of the final sources: baseline -> 36/0 · **restore-continue — THE ROW'S CONTROL, the `continue` on an unknown key restored -> 29/7: ARM K1 (C-22.15, BY NAME), K1b, K2 (the good key SPENT beside the unknown one), K3, K4, U1, U4**; ARM A stays green, declared — the array is the map check's door · liar-ignore-array (THE LIAR: a non-map `consume` silently IGNORED, the tick answering `ticked: true`) -> 29/7: A1-A7 by name · lease-spendable -> 31/5: L1-L5 · allowance-coerced (the check dropped AND `Number(b.allowed) || 0` restored) -> 29/7: W1-W7 · bounds-map-ignored -> 35/1: U2 · vf4-array (vf4's array restored in a copy) -> 35/1: V1, V0's reach green · overstrict (membership respelt `Object.keys(...).includes`) -> 36/0. REC-169's own control re-run on the same sources: all nine arms as declared (38/0 baseline). BEFORE THIS ITEM (this suite against 91913d6b's src/ and vf4): 7 pass, 29 fail — ARM A1 `ticked: true` over vf4's own array, K1 `ticked: true` over `{ fetchs: 1 }`, L1 `lease` written, W1 a `-1` allowance opened a run, U1 a misspelt bound opened a run with no fetch ceiling, V1 vf4's tick left `fetches` at 0. RE-RUN 2026-09-23 by the REC-177 worker after it CORRECTED ARM G2 (a zero and an absent allowance no longer open, C-22.16) and moved the allowance-coerced arm's store anchor to the site's new spelling: all eight AS DECLARED, the same tallies (baseline 36/0, allowance-coerced 29/7).
 * =========================================================================
 * REC-172 — A RUN'S BUDGET IS SPENT ONLY ON A BOUND IT NAMES, BY A MAP; A MEMBER'S ALLOWANCE IS A WHOLE NUMBER; AND
 * `lease` IS NOT A CONSUMABLE AT ALL.
 *
 * `INVESTIGATIVE-SESSION.md` §14b item 6 (A RUN IS BOUNDED, AND THE BOUND IS RECORDED). REC-169 (IC-184) held the
 * FIGURES a caller writes into a bound to a non-negative whole number and closed the plane-counted bounds to the
 * caller. It left three doors, each measured on `91913d6b` before this item:
 *
 *   (1) `op=airuntick` SKIPPED, SILENTLY, a `consume` key naming no bound (`{ fetchs: 1 }` -> `ticked: true`, nothing
 *       spent) and a `consume` sent as an ARRAY (its keys are positions, `"0"`, which name no bound). The caller is
 *       told its tick succeeded while the budget it believes it spent did not move — and `vf4-live-scratch.mjs`, the
 *       live instrument, has sent exactly that array since it was written, so none of its fetches was ever counted.
 *   (2) `op=airunopen` wrote `allowed` as `Number(x) || 0`: a NEGATIVE, FRACTIONAL or STRING allowance was stored as
 *       the member's declaration. The member's allowance is the other half of every bound; a `-1` or `"3"` there is a
 *       figure nobody declared.
 *   (3) `lease` is a RUN_BOUNDS row, so `consume: { lease: 1 }` was written — but the lease is the heartbeat whose
 *       LAPSE the plane decides (`finishedBound`'s `expired`, the reaper): a caller's figure for it could only make the
 *       record say a run's lease was spent that nobody measured. Refused under C-22.14's rationale — the plane
 *       decides it.
 *
 * HOW A LIAR PASSES THE OBVIOUS TEST, stated before what this checks: IGNORE the unknown key or the array rather than
 * refuse it. The budget then never moves — every "the bound did not move" assertion is GREEN — and the caller is told
 * `ticked: true`. So every arm here asks for the REFUSAL BY NAME and for the WITNESS (bound rows, ticks, lease, log)
 * byte-identical, and ARM K2 sends ONE good key beside one unknown key: an ignoring door spends the good one.
 *
 * WHAT THIS SUITE CANNOT SEE: (i) one isolate, one store; (ii) no surface — it asserts what the plane SENDS; (iii) the
 * reaper's lease decision is not driven here (`airun.test.mjs` owns it); (iv) ARM V reads vf4's tick body OFF ITS
 * SOURCE and sends it through the op here — it does not run vf4, which is a live instrument against a deployed plane;
 * (v) an absent `allowed` still opens a bound at 0, which `finishedBound` reads as no ceiling — stated, not decided.
 *     [CLOSED 2026-09-23 by REC-177: BOB #30 ruled it (§14b item 6) and an absent or zero `allowed` is refused at the
 *     open, C-22.16 AI_RUN_BOUND_NO_ALLOWANCE; `rec177-allowance.test.mjs` owns it, and ARM G2 below was corrected.]
 * ========================================================================= */
import { statedJSON } from "./stated.mjs";
import "./stdio.mjs";                 /* D-282: a suite's own exit must not discard the suite's own output */
import "./sandbox.mjs";               /* D-186: owns $TMPDIR for this process and removes it on exit */
import { Miniflare } from "miniflare";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { join } from "node:path";

/* The control driver points these at an armed COPY. */
const SRC_DIR = process.env.REC172_SRC || fileURLToPath(new URL("../src", import.meta.url));
const VF4 = process.env.REC172_VF4 || fileURLToPath(new URL("./vf4-live-scratch.mjs", import.meta.url));
const IDX = join(SRC_DIR, "index.mjs");
const { AI_RUN_CHECKS } = await import(join(SRC_DIR, "..", "checks", "bio-checks.mjs"));

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = statedJSON(got) === statedJSON(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${statedJSON(want)}\n         got  ${statedJSON(got)}`}`);
  ok ? pass++ : fail++;
};

const ADM = "adm-rec172", MEM = "mem-rec172";
const mf = new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: IDX, script: readFileSync(IDX, "utf8"),
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
  r2Buckets: ["CAPTURES", "PUBLISHED"],
  bindings: { ADMIN_TOKEN: ADM, MEMBER_TOKEN: MEM, VERSION: "test" },
});

try {

const sha = (v) => createHash("sha256").update(v).digest("hex");
const rP = (r) => (r && typeof r === "object" && "result" in r) ? r.result : r;
/* `body` is sent VERBATIM when it is a string. */
const RAW = async (q, body) => {
  const res = await mf.dispatchFetch(`http://x/api/?${q}`, body === undefined ? {} : {
    method: "POST", body: typeof body === "string" ? body : JSON.stringify(body) });
  return { status: res.status, body: await res.text() };
};
const parse = (r) => { try { return rP(JSON.parse(r.body)); } catch { return null; } };
const POST = async (q, body) => parse(await RAW(q, body ?? {}));
const GET = async (q) => parse(await RAW(q));
const E = encodeURIComponent;

const member = async (id, caps, role = "member") => {
  const add = await POST(`op=memberadd&token=${ADM}`, { memberId: id, cover: `cover for ${id}`, role, capabilities: caps });
  if (!add?.invite) throw new Error(`memberadd ${id}: ${JSON.stringify(add)}`);
  const en = await POST("op=enroll", { invite: add.invite, handle: id, password: `${id}-passphrase-1` });
  if (!en?.ok) throw new Error(`enroll ${id}: ${JSON.stringify(en)}`);
  const lg = await POST("op=login", { role: `member:${id}`, password: `${id}-passphrase-1` });
  if (!lg?.token) throw new Error(`login ${id}: ${JSON.stringify(lg)}`);
  return "token=" + lg.token;
};

/* 4.2/4.3: two administrators before any member. ALICE opens every run: she is the PRINCIPAL. CORA is not. */
const RUTH = await member("ruth", ["contribute", "publish", "create_projects"], "admin");
await member("gus", ["contribute"], "admin");
const ALICE = await member("alice", ["contribute"]);
const CORA  = await member("cora", ["contribute"]);

const NOW = "2026-09-23T00:00:00Z", LATER = "2026-09-23T01:00:00Z";
const Q = "INQ-2026-9172-question";
const md = ["---",
  `id: ${Q}`, "object_type: inquiry", "schema: inquiry@1",
  `title: "Question ${Q}"`, "current_state: open", "prior_state: null",
  `created: "${NOW}"`, `last_updated: "${LATER}"`,
  "produced_by:", "  mode: human", "  capability_tier: high",
  "group: believe-in-oakland", "references: []", "state_history: []",
  "annotations_open: 0",
  "reeval_pending:", "  flag: false", "  since: null", "  source: null",
  "visuals: []", 'disposition_reason: ""',
  "---", "", "## Question", "", `Did ${Q} happen?`, "", "## What It Rests On", "",
  "## Conclusion", "", "## What Would Falsify This", "", "## Session Log", "",
  "## Review Notes", ""].join("\n");
console.log("\n--- FIXTURE: one readable question, two members ---");
t("FIXTURE: the question is promoted", (await POST(`op=promote&${RUTH}`, {
  bundleId: Q, base: null, snapKey: "20260923T150000Z_ec172aa1",
  meta: { object_type: "inquiry", group: "believe-in-oakland",
          current_state: "open", created: NOW, last_updated: LATER },
  files: [{ path: "bundle.md", text: md, bytes: md.length, sha256: sha(md) }], register: [] }))?.ok, true);

let runSeq = 0;
const openAs = async (tok, bounds, raw = false) => {
  const run = `RUN-2026-0923-rec172-${++runSeq}`;
  const body = { run, contextType: "inquiry", contextId: Q, label: "REC-172 run", mode: "check",
    principalClaude: "member", principalClaudeRef: "believe-in-oakland/claude",
    skillVersion: "investigative-session@1", leaseMs: 600000 };
  /* `raw`: `bounds` is a JSON TEXT spliced in verbatim, so an arm can put `1e309` on the wire. */
  const r = raw
    ? await POST(`op=airunopen&${tok}`, JSON.stringify(body).replace(/}$/, `,"bounds":${bounds}}`))
    : await POST(`op=airunopen&${tok}`, { ...body, bounds });
  return { run, r };
};
const readRun = async (run) => parse(await RAW(`op=airun&token=${ADM}&run=${E(run)}`));
const logOf = async (run) => (await GET(`op=airunlog&token=${ADM}&run=${E(run)}`))?.entries?.length ?? null;
/* THE WITNESS: everything a tick writes — every bound row, the tick count, the lease, the status, the log. */
const witness = async (run) => {
  const s = (await readRun(run))?.session;
  return JSON.stringify({ budget: s?.budget, ticks: s?.ticks, updated: s?.updated, expires: s?.expires,
                          status: s?.status, log: await logOf(run) });
};
const boundOf = async (run, b) => {
  const x = ((await readRun(run))?.session?.budget ?? []).find((r) => r.bound === b);
  return x ? [x.allowed, x.consumed] : null;
};
const tick = async (tok, run, consumeJson) => parse(await RAW(`op=airuntick&${tok}`,
  `{"run":${JSON.stringify(run)},"consume":${consumeJson},"log":[${JSON.stringify(ENTRY)}]}`));
const ENTRY = { level: "meaning", subject: "observation:rec172", state: "NEVER_LOOKED",
                detail: "nothing has been derived here, which may only mean nothing was extracted" };

const C = AI_RUN_CHECKS;
const refusedAs = (a) => [a?.ticked, a?.code, a?.check, a?.translation];
const WANT = (code) => [false, code, C[code]?.check, C[code]?.translation];
const openRefused = (o) => [o.r?.started, o.r?.code, o.r?.check, o.r?.translation];
const OPEN_WANT = (code) => [false, code, C[code]?.check, C[code]?.translation];

const B3 = [{ bound: "fetches", allowed: 5, unit: "requests" }, { bound: "subsessions", allowed: 4, unit: "sessions" }];
const ARUN = await openAs(ALICE, B3), KRUN = await openAs(ALICE, B3), LRUN = await openAs(ALICE, B3),
      VRUN = await openAs(ALICE, B3), GRUN = await openAs(ALICE, B3);
t("REACH: every run is really running under alice with its bounds declared — every refusal below would pass "
  + "vacuously over a run that never started",
  [...[ARUN, KRUN, LRUN, VRUN, GRUN].map((r) => r.r?.started), await boundOf(ARUN.run, "fetches"),
   await boundOf(GRUN.run, "subsessions")],
  [true, true, true, true, true, [5, 0], [4, 0]]);

console.log("\n--- ARM A · A `consume` THAT IS NOT A MAP OF BOUNDS: refused by name, nothing written ---");
{
  const before = await witness(ARUN.run);
  const cases = [
    ["ARM A1 (VF-4'S OWN ARRAY — its keys are positions, which name no bound)", '[{"bound":"fetches","amount":1}]'],
    ["ARM A2 (AN EMPTY ARRAY)", "[]"],
    ["ARM A3 (A STRING)", '"fetches"'],
    ["ARM A4 (A NUMBER)", "3"],
    ["ARM A5 (A BOOLEAN)", "true"],
  ];
  for (const [label, consume] of cases)
    t(`${label}: \`consume: ${consume}\` is refused AI_RUN_BOUND_UNKNOWN, with the catalogue's translation`,
      refusedAs(await tick(ALICE, ARUN.run, consume)), WANT("AI_RUN_BOUND_UNKNOWN"));
  t("ARM A6 (NOTHING WRITTEN): after all five, the bound rows, ticks, lease, status and log are byte-identical",
    await witness(ARUN.run), before);
  const d = (await tick(ALICE, ARUN.run, '[{"bound":"fetches","amount":1}]'))?.detail ?? "";
  t("ARM A7: the detail says what was sent and what a consume is", [/array/.test(d), /fetches/.test(d)], [true, true]);
}

console.log("\n--- ARM K · A KEY THAT NAMES NO BOUND: refused by name, and the tick is refused WHOLE ---");
{
  const before = await witness(KRUN.run);
  const k1 = await tick(ALICE, KRUN.run, '{"fetchs":1}');
  t("ARM K1 (THE MISSPELLING): `consume: { fetchs: 1 }` is refused AI_RUN_BOUND_UNKNOWN, C-22.15", refusedAs(k1),
    WANT("AI_RUN_BOUND_UNKNOWN"));
  t("ARM K1b: the refusal names the key", [k1?.bound, /'fetchs'/.test(k1?.detail ?? "")], ["fetchs", true]);
  const k2 = await tick(ALICE, KRUN.run, '{"fetches":2,"fetchs":1}');
  t("ARM K2 (THE IGNORER'S TELL): one good key beside an unknown one is refused AI_RUN_BOUND_UNKNOWN",
    refusedAs(k2), WANT("AI_RUN_BOUND_UNKNOWN"));
  const k3 = await tick(ALICE, KRUN.run, '{"__proto__":1}');
  const k4 = await tick(ALICE, KRUN.run, '{"constructor":1}');
  t("ARM K3: an inherited name (`__proto__`, `constructor`) is not a bound either", [k3?.code, k4?.code],
    ["AI_RUN_BOUND_UNKNOWN", "AI_RUN_BOUND_UNKNOWN"]);
  t("ARM K4 (NOTHING WRITTEN): the fetches bound did not move, no tick counted, the log did not grow",
    await witness(KRUN.run), before);
}

console.log("\n--- ARM L · `lease` IS THE PLANE'S: a caller's figure for it is refused by name, at the tick and the open ---");
{
  const before = await witness(LRUN.run);
  const l1 = await tick(ALICE, LRUN.run, '{"lease":1}');
  t("ARM L1: `consume: { lease: 1 }` is refused AI_RUN_BOUND_PLANE_COUNTED, C-22.14 — the plane decides the lease",
    refusedAs(l1), WANT("AI_RUN_BOUND_PLANE_COUNTED"));
  const l2 = await tick(ALICE, LRUN.run, '{"lease":0}');
  t("ARM L2: even a zero — the lease is not a count, so no figure for it claims nothing",
    refusedAs(l2), WANT("AI_RUN_BOUND_PLANE_COUNTED"));
  t("ARM L3: the refusal names `lease` and says the plane decides it",
    [l1?.bound, /lease/.test(l1?.detail ?? ""), /plane/.test(l1?.detail ?? "")], ["lease", true, true]);
  t("ARM L4 (NOTHING WRITTEN)", await witness(LRUN.run), before);
  const l5 = await openAs(ALICE, [{ bound: "fetches", allowed: 5 }, { bound: "lease", allowed: 3 }]);
  t("ARM L5: a run DECLARING a `lease` allowance is refused AI_RUN_BOUND_PLANE_COUNTED and does not exist",
    [...openRefused(l5), (await readRun(l5.run))?.found], [...OPEN_WANT("AI_RUN_BOUND_PLANE_COUNTED"), false]);
}

console.log("\n--- ARM W · THE MEMBER'S ALLOWANCE is a whole number of zero or more, or the run does not open ---");
{
  const cases = [
    ["ARM W1 (NEGATIVE)", '[{"bound":"fetches","allowed":-1}]'],
    ["ARM W2 (FRACTIONAL)", '[{"bound":"fetches","allowed":1.5}]'],
    ["ARM W3 (A NUMERIC STRING)", '[{"bound":"fetches","allowed":"3"}]'],
    ["ARM W4 (NON-FINITE: 1e309 parses to Infinity)", '[{"bound":"fetches","allowed":1e309}]'],
    ["ARM W5 (A BOOLEAN)", '[{"bound":"subsessions","allowed":true}]'],
    ["ARM W6 (NEGATIVE, on a plane-counted bound — the member's allowance, not the caller's spend)",
     '[{"bound":"surfaces","allowed":-2}]'],
  ];
  for (const [label, bounds] of cases) {
    const o = await openAs(ALICE, bounds, true);
    t(`${label}: \`bounds: ${bounds}\` is refused AI_RUN_CONSUME_INVALID and the run does not exist`,
      [...openRefused(o), (await readRun(o.run))?.found], [...OPEN_WANT("AI_RUN_CONSUME_INVALID"), false]);
  }
  const d = (await openAs(ALICE, [{ bound: "fetches", allowed: -1 }])).r?.note ?? "";
  t("ARM W7: the note names the bound and the allowance", [/'fetches'/.test(d), /allow/.test(d)], [true, true]);
}

console.log("\n--- ARM U · THE OPEN'S DECLARATION names bounds, in a list, or the run does not open ---");
{
  const cases = [
    ["ARM U1 (A MISSPELT BOUND — the member meant a ceiling and would have got none)",
     [{ bound: "fetchs", allowed: 3 }]],
    ["ARM U2 (A MAP, not a list)", { fetches: 3 }],
    ["ARM U3 (A LIST ENTRY THAT IS NOT AN OBJECT)", ["fetches"]],
    ["ARM U4 (AN ENTRY NAMING NO BOUND AT ALL)", [{ allowed: 3 }]],
  ];
  for (const [label, bounds] of cases) {
    const o = await openAs(ALICE, bounds);
    t(`${label}: \`bounds: ${JSON.stringify(bounds)}\` is refused AI_RUN_BOUND_UNKNOWN and the run does not exist`,
      [...openRefused(o), (await readRun(o.run))?.found], [...OPEN_WANT("AI_RUN_BOUND_UNKNOWN"), false]);
  }
}

console.log("\n--- ARM V · VF-4'S TICK, AS ITS SOURCE WRITES IT, IS COUNTED ---");
{
  const src = readFileSync(VF4, "utf8");
  const m = /op\("airuntick",[\s\S]{0,200}?consume:\s*(\{[^}]*\}|\[[^\]]*\])/.exec(src);
  t("ARM V0 (REACH): vf4-live-scratch.mjs has exactly one `op=airuntick` call and its `consume` literal is found",
    [(src.match(/op\("airuntick"/g) || []).length, !!m], [1, true]);
  /* The literal is JavaScript, not JSON — quote its bare keys so it can go on the wire as vf4 would send it. */
  const wire = m ? m[1].replace(/([{,]\s*)([A-Za-z_$][\w$]*)\s*:/g, '$1"$2":') : "null";
  const v = await tick(ALICE, VRUN.run, wire);
  t("ARM V1: vf4's `consume` ticks and SPENDS one fetch (it sent an array until 2026-09-23, and not one of its fetches "
    + "was ever counted)", [v?.ticked, v?.code ?? null, await boundOf(VRUN.run, "fetches")], [true, null, [5, 1]]);
}

console.log("\n--- ARM G · OVER-STRICTNESS: well-formed ticks and opens are unchanged ---");
{
  const g1 = await tick(ALICE, GRUN.run, '{"fetches":2,"subsessions":1,"wallclock":1000,"runtime":1}');
  const g2 = await tick(ALICE, GRUN.run, "{}");
  const g3 = await tick(ALICE, GRUN.run, "null");
  t("ARM G1: every caller-counted bound lands; an empty map and a null consume are ticks that spend nothing",
    [g1?.ticked, g2?.ticked, g3?.ticked, await boundOf(GRUN.run, "fetches"), await boundOf(GRUN.run, "wallclock")],
    [true, true, true, [5, 2], [0, 1000]]);
  /* CORRECTED 2026-09-23 BY REC-177 (§14b item 6, BOB #30): this arm asserted that a ZERO allowance and an ABSENT one
     OPEN, at 0 — and 0 is what `finishedBound` reads as NO CEILING, so the run recorded a bound it did not have. The old
     assertion was this suite's caveat (v) written as a pass; BOB #30 ruled both are refused (C-22.16), and
     `rec177-allowance.test.mjs` drives them. What stays over-strictness here is a positive allowance, a plane-counted
     allowance and a zero SEED — `consumed: 0` is none spent yet, a different field from the ceiling. */
  const g4 = await openAs(ALICE, [{ bound: "fetches", allowed: 1 }, { bound: "surfaces", allowed: 2 },
                                  { bound: "mints", allowed: 9, consumed: 0 }]);
  t("ARM G2: a one allowance, a plane-counted allowance and a zero seed all open",
    [g4.r?.started, await boundOf(g4.run, "fetches"), await boundOf(g4.run, "surfaces"),
     await boundOf(g4.run, "mints")], [true, [1, 0], [2, 0], [9, 0]]);
  const g5 = await openAs(ALICE, []), g6 = await openAs(ALICE, null);
  t("ARM G3: an empty list and a null declaration open a run with no bounds, as they always have",
    [g5.r?.started, g6.r?.started], [true, true]);
}

console.log("\n--- ARM O · ORDER: position is asked before the consume's shape ---");
{
  const ORUN = await openAs(ALICE, B3);
  const before = await witness(ORUN.run);
  const o1 = await tick(CORA, ORUN.run, '[{"bound":"fetches","amount":1}]');
  t("ARM O1: cora ticking alice's run with an array is told the run is not hers, and nothing moves",
    [o1?.code, await witness(ORUN.run)], ["AI_RUN_NOT_PRINCIPAL", before]);
}

} catch (e) {
  console.log(`  FAIL  the suite threw before its foot: ${e && e.stack ? e.stack.slice(0, 900) : e}`);
  fail += 1;
} finally {
  await mf.dispose();   /* hygiene.test.mjs asserts every Miniflare instance is disposed */
}

/* THE FOOT: a TypeError inside an assertion ends the module while the tally reads clean, so this line
   existing at all is part of what the count means (WORKER.md). */
console.log(`\nrec172-bounds: ${pass} pass, ${fail} fail`);
process.exit(fail ? 1 : 0);
