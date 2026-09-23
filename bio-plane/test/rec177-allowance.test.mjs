/* NEGATIVE CONTROL: DECLARED HERE, RUN BY `test/rec177-allowance.control.mjs` — deliberately NOT a `.test.mjs`, because it patches COPIES of `src/` while it runs and the battery must not discover it. Re-run in one step from `bio-plane/`: `node test/rec177-allowance.control.mjs [arm]`. RESULTS, RUN 2026-09-23 by the REC-177 worker (CONDUCT #16's, cloud) on 0e7cc03e + this item (real src/store.mjs 2,856,113 B sha256 88299fd576e2, src/airun.mjs 149,643 B 765ee33b75b7, src/index.mjs 721,147 B ad0a07edbfbd, checks/bio-checks.mjs 832,075 B e878d751569e, untouched: YES), ALL FIVE ARMS AS DECLARED at the first run: baseline 22/0 · **drop-check — THE ROW'S CONTROL, the check dropped and the store's `absent is 0` default restored (the pre-item plane) -> 9/13: ARM A1-A6 (C-22.16 BY NAME, the absent allowance) and Z1-Z5 (the zero), M1, M2** · liar-absent-only (THE LIAR: refuse an absent allowance, admit 0) -> 16/6: Z1-Z5, M2 · too-wide (every non-positive-number allowance under THIS code) -> 21/1: P1-P4, a numeric string and a negative mis-told they stated none · overstrict (the rule respelt) -> 22/0. REC-172's and REC-169's controls re-run on the same sources: all eight and all nine arms as declared (36/0 and 38/0 baselines).
 * =========================================================================
 * REC-177 — A DECLARED BOUND STATES ITS ALLOWANCE (`INVESTIGATIVE-SESSION.md` §14b item 6, BOB #30, 2026-09-23).
 *
 * THE DEFECT, measured on `0e7cc03e` before this item: `op=airunopen` accepted `bounds: [{ bound: "fetches" }]` and
 * `bounds: [{ bound: "fetches", allowed: 0 }]`, and opened each bound at `allowed: 0`. `finishedBound` fires only on a
 * row with `allowed > 0` — so 0 is NO CEILING, and the run recorded a bound it did not have: the one thing a declared
 * bound exists to prevent (a record claiming more than it holds). BOB #30 ruled: such a bound is REFUSED AT THE OPEN,
 * by a stated code, and nothing is written; a bound the run does not want is simply not declared; 0 stays the
 * internal "no ceiling" reading only for a bound NOT declared.
 *
 * THE CODE: `AI_RUN_BOUND_NO_ALLOWANCE`, C-22.16 — its own, not C-22.13's. C-22.13 refuses a figure of the wrong FORM
 * (a string, a fraction, a negative) and its words say so; 0 is a perfectly good whole number, and an absent figure is
 * no figure at all. The remedy differs too: state an allowance, or leave the bound out.
 *
 * HOW A LIAR PASSES THE OBVIOUS TEST, stated before what this checks: (1) refuse only an ABSENT `allowed` and admit 0
 * — ARM Z asks for `allowed: 0` refused BY NAME; (2) refuse at the TICK rather than the open — every refusal arm here
 * asks that the OPEN answer `started: false` with the code and that the run DOES NOT EXIST afterwards, so a run that
 * opened and is refused later fails at the witness; (3) over-reach — refuse a run that declares no such bound at all,
 * or a zero SEED (`consumed: 0`, a different field): ARM G asks that both still open exactly as before and that an
 * undeclared bound's tick still lands at `allowed: 0` without ending the run.
 *
 * WHAT THIS SUITE CANNOT SEE: (i) one isolate, one store; (ii) no surface — it asserts what the plane SENDS;
 * (iii) the tick's own internal `allowed: 0` rows (an undeclared bound's spend, and the plane's `mints`/`surfaces`
 * counters) are unchanged by this item and asserted only for `fetches` (ARM G3); (iv) a caller other than the op —
 * nothing else writes a declared bound, measured by grep at `store.mjs aiRunOpen`'s insert, the only INSERT naming
 * `unit`.
 * ========================================================================= */
import "./stdio.mjs";                 /* D-282: a suite's own exit must not discard the suite's own output */
import "./sandbox.mjs";               /* D-186: owns $TMPDIR for this process and removes it on exit */
import { Miniflare } from "miniflare";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { join } from "node:path";

/* The control driver points this at an armed COPY. */
const SRC_DIR = process.env.REC177_SRC || fileURLToPath(new URL("../src", import.meta.url));
const IDX = join(SRC_DIR, "index.mjs");
const { AI_RUN_CHECKS } = await import(join(SRC_DIR, "..", "checks", "bio-checks.mjs"));

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${JSON.stringify(want)}\n         got  ${JSON.stringify(got)}`}`);
  ok ? pass++ : fail++;
};

const ADM = "adm-rec177", MEM = "mem-rec177";
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

/* 4.2/4.3: two administrators before any member. ALICE opens every run: she is the PRINCIPAL. */
const RUTH = await member("ruth", ["contribute", "publish", "create_projects"], "admin");
await member("gus", ["contribute"], "admin");
const ALICE = await member("alice", ["contribute"]);

const NOW = "2026-09-23T00:00:00Z", LATER = "2026-09-23T01:00:00Z";
const Q = "INQ-2026-9177-question";
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
console.log("\n--- FIXTURE: one readable question, one member ---");
t("FIXTURE: the question is promoted", (await POST(`op=promote&${RUTH}`, {
  bundleId: Q, base: null, snapKey: "20260923T160000Z_ec177aa1",
  meta: { object_type: "inquiry", group: "believe-in-oakland", title: `title for ${Q}`,
          current_state: "open", created: NOW, last_updated: LATER },
  files: [{ path: "bundle.md", text: md, bytes: md.length, sha256: sha(md) }], register: [] }))?.ok, true);

let runSeq = 0;
/* `raw`: `bounds` is a JSON TEXT spliced in verbatim, so an arm can put `null` or `-0` on the wire exactly. */
const openAs = async (tok, bounds, raw = false) => {
  const run = `RUN-2026-0923-rec177-${++runSeq}`;
  const body = { run, contextType: "inquiry", contextId: Q, label: "REC-177 run", mode: "check",
    principalClaude: "member", principalClaudeRef: "believe-in-oakland/claude",
    skillVersion: "investigative-session@1", leaseMs: 600000 };
  const r = raw
    ? await POST(`op=airunopen&${tok}`, JSON.stringify(body).replace(/}$/, `,"bounds":${bounds}}`))
    : await POST(`op=airunopen&${tok}`, { ...body, ...(bounds === undefined ? {} : { bounds }) });
  return { run, r };
};
const readRun = async (run) => parse(await RAW(`op=airun&token=${ADM}&run=${E(run)}`));
const boundOf = async (run, b) => {
  const x = ((await readRun(run))?.session?.budget ?? []).find((r) => r.bound === b);
  return x ? [x.allowed, x.consumed] : null;
};
const tick = async (tok, run, consume) => POST(`op=airuntick&${tok}`, { run, consume });

const C = AI_RUN_CHECKS;
const openRefused = (o) => [o.r?.started, o.r?.code, o.r?.check, o.r?.translation];
const OPEN_WANT = (code) => [false, code, C[code]?.check, C[code]?.translation];

t("REACH: the code is a C-22 row with a canned translation — every refusal arm below compares against it, and an "
  + "absent row would make `OPEN_WANT` compare undefined with undefined",
  [C.AI_RUN_BOUND_NO_ALLOWANCE?.check, typeof C.AI_RUN_BOUND_NO_ALLOWANCE?.translation,
   (C.AI_RUN_BOUND_NO_ALLOWANCE?.translation ?? "").length > 40], ["C-22.16", "string", true]);

console.log("\n--- ARM A · AN ABSENT ALLOWANCE: refused at the open by name, and the run does not exist ---");
{
  const cases = [
    ["ARM A1 (THE ROW'S OWN SHAPE: `{ bound: \"fetches\" }`)", '[{"bound":"fetches"}]'],
    ["ARM A2 (`allowed: null`)", '[{"bound":"fetches","allowed":null}]'],
    ["ARM A3 (absent, with a unit — the unit is not an allowance)", '[{"bound":"fetches","unit":"requests"}]'],
    ["ARM A4 (absent, with a zero seed — `consumed` is not an allowance)", '[{"bound":"subsessions","consumed":0}]'],
    ["ARM A5 (absent, on a plane-counted bound — the member sets its ceiling)", '[{"bound":"surfaces"}]'],
  ];
  for (const [label, bounds] of cases) {
    const o = await openAs(ALICE, bounds, true);
    t(`${label}: \`bounds: ${bounds}\` is refused AI_RUN_BOUND_NO_ALLOWANCE, C-22.16, and the run does not exist`,
      [...openRefused(o), (await readRun(o.run))?.found], [...OPEN_WANT("AI_RUN_BOUND_NO_ALLOWANCE"), false]);
  }
  const n = (await openAs(ALICE, [{ bound: "fetches" }])).r ?? {};
  t("ARM A6: the refusal names the bound and says no allowance was stated",
    [/'fetches'/.test(n.note ?? ""), /no `allowed`/.test(n.note ?? "")], [true, true]);
}

console.log("\n--- ARM Z · A ZERO ALLOWANCE: refused at the open by name — zero would read as NO CEILING ---");
{
  const cases = [
    ["ARM Z1 (THE ROW'S OWN SHAPE: `{ bound: \"fetches\", allowed: 0 }`)", '[{"bound":"fetches","allowed":0}]'],
    ["ARM Z2 (a JSON `-0`, which parses to a zero)", '[{"bound":"fetches","allowed":-0}]'],
    ["ARM Z3 (zero on a plane-counted bound)", '[{"bound":"mints","allowed":0}]'],
    ["ARM Z4 (zero on wallclock)", '[{"bound":"wallclock","allowed":0,"unit":"ms"}]'],
  ];
  for (const [label, bounds] of cases) {
    const o = await openAs(ALICE, bounds, true);
    t(`${label}: \`bounds: ${bounds}\` is refused AI_RUN_BOUND_NO_ALLOWANCE, C-22.16, and the run does not exist`,
      [...openRefused(o), (await readRun(o.run))?.found], [...OPEN_WANT("AI_RUN_BOUND_NO_ALLOWANCE"), false]);
  }
  const n = (await openAs(ALICE, [{ bound: "fetches", allowed: 0 }])).r ?? {};
  t("ARM Z5: the refusal names the bound and `allowed: 0`", [/'fetches'/.test(n.note ?? ""), /allowed: 0/.test(n.note ?? "")],
    [true, true]);
}

console.log("\n--- ARM M · ONE UNSTATED ENTRY REFUSES THE WHOLE OPEN: no half-declared run is written ---");
{
  const m1 = await openAs(ALICE, [{ bound: "fetches", allowed: 3 }, { bound: "subsessions" }]);
  t("ARM M1: a good entry beside an absent one — the open is refused by name and NEITHER bound exists",
    [...openRefused(m1), (await readRun(m1.run))?.found, await boundOf(m1.run, "fetches")],
    [...OPEN_WANT("AI_RUN_BOUND_NO_ALLOWANCE"), false, null]);
  const m2 = await openAs(ALICE, [{ bound: "subsessions", allowed: 0 }, { bound: "fetches", allowed: 3 }]);
  t("ARM M2: a zero entry BEFORE a good one — refused by name, nothing written",
    [...openRefused(m2), (await readRun(m2.run))?.found], [...OPEN_WANT("AI_RUN_BOUND_NO_ALLOWANCE"), false]);
}

console.log("\n--- ARM P · PRECEDENCE: the older refusals still say what they said ---");
{
  const p1 = await openAs(ALICE, [{ bound: "fetchs" }]);
  const p2 = await openAs(ALICE, [{ bound: "lease" }]);
  const p3 = await openAs(ALICE, '[{"bound":"fetches","allowed":"3"}]', true);
  const p4 = await openAs(ALICE, '[{"bound":"fetches","allowed":-1}]', true);
  t("ARM P1-P4: a misspelt bound is still C-22.15, `lease` still C-22.14, a numeric string and a negative still "
    + "C-22.13 — an allowance of the wrong FORM is not an unstated one",
    [p1.r?.code, p2.r?.code, p3.r?.code, p4.r?.code],
    ["AI_RUN_BOUND_UNKNOWN", "AI_RUN_BOUND_PLANE_COUNTED", "AI_RUN_CONSUME_INVALID", "AI_RUN_CONSUME_INVALID"]);
}

console.log("\n--- ARM G · OVER-STRICTNESS: a stated allowance opens with its ceiling; an undeclared bound is unchanged ---");
{
  const g1 = await openAs(ALICE, [{ bound: "fetches", allowed: 3, unit: "requests" }]);
  t("ARM G1: `{ bound: \"fetches\", allowed: 3 }` opens with a ceiling of 3",
    [g1.r?.started, g1.r?.code ?? null, await boundOf(g1.run, "fetches")], [true, null, [3, 0]]);
  const g1t = await tick(ALICE, g1.run, { fetches: 3 });
  const s1 = (await readRun(g1.run))?.session;
  t("ARM G1b: the ceiling is REAL — spending the three ends the run, naming `fetches`",
    [g1t?.ticked, s1?.status, s1?.condition?.bound, await boundOf(g1.run, "fetches")],
    [true, "stopped", "fetches", [3, 3]]);
  const g2 = await openAs(ALICE, [{ bound: "subsessions", allowed: 1, consumed: 0 }, { bound: "mints", allowed: 9 }]);
  t("ARM G2: an allowance of one, a zero SEED and a plane-counted allowance all open",
    [g2.r?.started, await boundOf(g2.run, "subsessions"), await boundOf(g2.run, "mints")], [true, [1, 0], [9, 0]]);
  const g3 = await openAs(ALICE, [{ bound: "subsessions", allowed: 4 }]);
  t("ARM G3 (THE UNDECLARED BOUND): a run declaring no `fetches` bound opens, and has no `fetches` row",
    [g3.r?.started, await boundOf(g3.run, "fetches")], [true, null]);
  const g3t = await tick(ALICE, g3.run, { fetches: 5 });
  const s3 = (await readRun(g3.run))?.session;
  t("ARM G3b: its fetches still land at the internal `allowed: 0` — no ceiling, so the run keeps running, as before",
    [g3t?.ticked, g3t?.code ?? null, await boundOf(g3.run, "fetches"), s3?.status], [true, null, [0, 5], "running"]);
  const g4 = await openAs(ALICE, []), g5 = await openAs(ALICE, null), g6 = await openAs(ALICE, undefined);
  t("ARM G4: an empty list, a null declaration and no `bounds` at all open a run with no bounds, as they always have",
    [g4.r?.started, g5.r?.started, g6.r?.started, ((await readRun(g6.run))?.session?.budget ?? []).length],
    [true, true, true, 0]);
}

} catch (e) {
  console.log(`  FAIL  the suite threw before its foot: ${e && e.stack ? e.stack.slice(0, 900) : e}`);
  fail += 1;
} finally {
  await mf.dispose();   /* hygiene.test.mjs asserts every Miniflare instance is disposed */
}

/* THE FOOT: a TypeError inside an assertion ends the module while the tally reads clean, so this line
   existing at all is part of what the count means (WORKER.md). */
console.log(`\nrec177-allowance: ${pass} pass, ${fail} fail`);
process.exit(fail ? 1 : 0);
