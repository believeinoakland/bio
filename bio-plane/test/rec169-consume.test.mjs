/* NEGATIVE CONTROL: DECLARED HERE, RUN BY `test/rec169-consume.control.mjs` — deliberately NOT a `.test.mjs`, because it patches COPIES of `src/` while it runs and the battery must not discover it. Re-run in one step from `bio-plane/`: `node test/rec169-consume.control.mjs [arm]`. RESULTS, RUN 2026-09-23 by the REC-169 worker (CONDUCT #15's, cloud) on b5ce975a + this item (real src/store.mjs 2,833,892 B sha256 e3f5c610a3de, src/airun.mjs 142,589 B 7a1aba3a8662, src/index.mjs 711,476 B 3e29b9eabc5e, checks/bio-checks.mjs 827,501 B 5b70a1c0a110, untouched: YES), ALL NINE ARMS AS DECLARED (three declarations corrected at the first run, the ARMS right — see each at its arm in the driver): baseline 38/0 · **drop-check — THE ROW'S CONTROL, the tick's check disarmed -> 18/20: ARM D1 (THE REFUND, BY NAME), D2, D3, N1-N12, M1, M2, P1-P3** · clamp (THE LIAR: refuse nothing, clamp to a non-negative integer) -> 18/20: D1 D2 N1-N12 M1 M2 P1-P3 by name, and D3 because the accepted tick ENDED the run · open-seed-dropped -> 35/3: S1 S2 S3 · no-negative -> 30/8: D1 (reads C-22.14 — a plane-counted refund is closed twice), N1 N9 N11 N12 M1 M2 S1 · no-integer -> 33/5: N2 N10 N11 N12 S2 · no-plane-counted -> 34/4: P1 P2 P3 S3 · census (the list forgets `surfaces`) -> 34/4: C2 P1 P3 S3 · overstrict (the same rule respelt) -> 38/0. BEFORE THIS ITEM (this suite against b5ce975a's src/): 13 pass, 25 fail — ARM D1 `ticked: true` over `consume: { surfaces: -1 }`, D2 the bound read `consumed: 0` after `1` (ticks 1 -> 2, lease extended), D3 the second question LANDED under a run allowed one.
 * =========================================================================
 * REC-169 — A RUN'S PRINCIPAL CANNOT REFUND WHAT IT SPENT: `op=airuntick`'s `consume` takes a NON-NEGATIVE INTEGER per
 * bound, and never a bound the PLANE counts.
 *
 * `INVESTIGATIVE-SESSION.md` §14b item 6 (A RUN IS BOUNDED, AND THE BOUND IS RECORDED) and §11 item 5 rule 2 (the
 * `surfaces` bound, built by D-85, IC-181). A bound is an allowance a MEMBER declares at the open and the run spends;
 * `ai_run_bounds.consumed` is declared INTEGER and counts things — fetches, sub-sessions, milliseconds, ceilings,
 * passages minted, questions surfaced. A count only goes up, and it goes up by a whole number.
 *
 * WHAT WAS WRONG, measured on the unedited tree (`b5ce975a`): `Store#aiRunTick` upserted `consumed = consumed + ?` with
 * `Number(v) || 0` for every RUN_BOUNDS key the caller sent. So the run's own principal — the `ai` credential a bound
 * exists to hold — could send `consume: { surfaces: -1 }` after spending its last question and open another: the
 * refund. The same for `mints` (plane-counted by `extractPropose`), and for every caller-counted bound (`fetches -3`
 * reads as three fetches never made). A fraction and a non-number were written as-is or silently as 0. And
 * `aiRunOpen`'s `bounds[].consumed` seed took the same `Number(x) || 0`, so a run could OPEN pre-refunded.
 *
 * HOW A LIAR PASSES THE OBVIOUS TEST, stated before what this checks: CLAMP the delta to 0 instead of refusing it. The
 * bound then never goes down — every "the bound did not move" assertion is GREEN — and the tick answers `ticked:
 * true`, so the caller believes it SPENT something it did not (or that its log landed under a tick the record says
 * was fine). This suite asserts the REFUSAL BY NAME at every malformed arm, and ARM M asserts that a tick carrying one
 * good and one bad delta spends NEITHER and appends nothing: a clamp spends the good one.
 *
 * WHAT THIS SUITE CANNOT SEE: (i) one isolate, one store; (ii) no surface — it asserts what the plane SENDS; (iii) the
 * reaper and `extractPropose` write `consumed` from plane-computed figures and are not driven here (`mints`'s plane
 * writer is `extractrun.test.mjs`'s); ARM C pins, off the store's SOURCE, that the plane-counted set this door refuses
 * is exactly the set of bounds the store writes by a literal name — a new plane-counted bound fails it until it is
 * added; (iv) a `consume` KEY that names no bound — CORRECTED 2026-09-23 by REC-172: this read "is still skipped as
 * it always was (a finding, reported, not fixed)", and it was true on the day; REC-172 refuses it by name
 * (C-22.15), with an array `consume`, an invalid allowance and `lease`, and `rec172-bounds.test.mjs` asserts it.
 * ========================================================================= */
import "./stdio.mjs";                 /* D-282: a suite's own exit must not discard the suite's own output */
import "./sandbox.mjs";               /* D-186: owns $TMPDIR for this process and removes it on exit */
import { Miniflare } from "miniflare";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { join } from "node:path";

/* The control driver points this at an armed COPY of the sources. */
const SRC_DIR = process.env.REC169_SRC || fileURLToPath(new URL("../src", import.meta.url));
const IDX = join(SRC_DIR, "index.mjs");
const { AI_RUN_CHECKS } = await import(join(SRC_DIR, "..", "checks", "bio-checks.mjs"));
const AIRUN = await import(join(SRC_DIR, "airun.mjs"));

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${JSON.stringify(want)}\n         got  ${JSON.stringify(got)}`}`);
  ok ? pass++ : fail++;
};

const ADM = "adm-rec169", MEM = "mem-rec169";
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
/* `text` is sent VERBATIM when it is a string, so an arm can put `1e309` on the wire (JSON.parse reads Infinity). */
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
const inquiryMd = (id) => ["---",
  `id: ${id}`, "object_type: inquiry", "schema: inquiry@1",
  `title: "Question ${id}"`, "current_state: open", "prior_state: null",
  `created: "${NOW}"`, `last_updated: "${LATER}"`,
  "produced_by:", "  mode: agent", "  capability_tier: high",
  "group: believe-in-oakland", "references: []", "state_history: []",
  "annotations_open: 0",
  "reeval_pending:", "  flag: false", "  since: null", "  source: null",
  "visuals: []", "surfaced_by: agent", 'disposition_reason: ""',
  "---", "", "## Question", "", `Did ${id} happen?`, "", "## What It Rests On", "",
  "## Conclusion", "", "## What Would Falsify This", "", "## Session Log", "",
  "## Review Notes", ""].join("\n");
let seq = 0;
const bundle = (id, extra = {}) => {
  const md = inquiryMd(id);
  return { bundleId: id, base: null,
    snapKey: `20260923T1400${String(++seq).padStart(2, "0")}Z_ec169aa1`,
    meta: { object_type: "inquiry", group: "believe-in-oakland",
            current_state: "open", created: NOW, last_updated: LATER },
    files: [{ path: "bundle.md", text: md, bytes: md.length, sha256: sha(md) }],
    register: [], ...extra };
};

const Q = "INQ-2026-9169-question";
console.log("\n--- FIXTURE: one readable question, two members, alice's `ai` credential ---");
t("FIXTURE: the question is promoted", (await POST(`op=promote&${RUTH}`, bundle(Q)))?.ok, true);
const mint = async (tok, tokenId) => POST(`op=aicredentialmint&${tok}`,
  { tokenId, principalKind: "member", taskScope: "investigative",
    writes: ["airunopen", "airuntick", "airunclose", "promote"],
    note: "REC-169: spends its member's run's bounds" });
const ak = await mint(ALICE, "alice-agent"), ck = await mint(CORA, "cora-agent");
const AK = ak?.token ? `token=${ak.token}` : null, CK = ck?.token ? `token=${ck.token}` : null;
t("FIXTURE: alice and cora each mint an `ai` credential whose principal is themselves",
  [ak?.credential?.principal, ck?.credential?.principal, !!AK, !!CK], ["member:alice", "member:cora", true, true]);

let runSeq = 0;
const openAs = async (tok, bounds) => {
  const run = `RUN-2026-0923-rec169-${++runSeq}`;
  const r = await POST(`op=airunopen&${tok}`, {
    run, contextType: "inquiry", contextId: Q, label: "REC-169 run", mode: "check",
    principalClaude: "member", principalClaudeRef: "believe-in-oakland/claude",
    skillVersion: "investigative-session@1", bounds, leaseMs: 600000 });
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
const tick = (tok, body) => RAW(`op=airuntick&${tok}`, body);
const ENTRY = { level: "meaning", subject: "observation:rec169", state: "NEVER_LOOKED",
                detail: "nothing has been derived here, which may only mean nothing was extracted" };

const C = AI_RUN_CHECKS;
const refusedAs = (a) => [a?.ticked, a?.code, a?.check, a?.translation];
const WANT = (code) => [false, code, C[code]?.check, C[code]?.translation];
let qSeq = 0;
const freshId = () => `INQ-2026-9169-surfaced-${++qSeq}`;
const create = (tok, run, id = freshId()) => RAW(`op=promote&${tok}`, bundle(id, { run }));
const exists = async (id) => !!(await GET(`op=projection&${RUTH}&id=${E(id)}`))?.bundle_id;

const BRUN = await openAs(AK, [{ bound: "surfaces", allowed: 1, unit: "questions" }]);
/* ONE RUN PER ARM GROUP, so an arm the control breaks cannot move the next group's bounds (a control that moves a
   second variable refutes nothing). */
const fresh = () => openAs(ALICE, [{ bound: "fetches", allowed: 5, unit: "requests" },
                                   { bound: "subsessions", allowed: 4, unit: "sessions" },
                                   { bound: "surfaces", allowed: 2, unit: "questions" }]);
const NRUN = await fresh(), MRUN = await fresh(), PRUN = await fresh(), P0RUN = await fresh(), FRUN = await fresh();
t("REACH: every run is really running under alice — every refusal below would pass vacuously over a run that "
  + "never started", [BRUN.r?.started, ...[NRUN, MRUN, PRUN, P0RUN, FRUN].map((r) => r.r?.started),
   await boundOf(BRUN.run, "surfaces"), await boundOf(FRUN.run, "fetches")],
  [true, true, true, true, true, true, [1, 0], [5, 0]]);

console.log("\n--- ARM D · THE REFUND: a principal that spent its last question cannot tick it back and open another ---");
{
  const idA = freshId(), idB = freshId();
  const first = parse(await create(AK, BRUN.run, idA));
  t("ARM D0 (REACH): alice's credential opens ONE question under a run allowed one, and the bound is spent",
    [first?.ok, await boundOf(BRUN.run, "surfaces")], [true, [1, 1]]);
  const before = await witness(BRUN.run);
  const refund = parse(await tick(AK, { run: BRUN.run, consume: { surfaces: -1 } }));
  t("ARM D1 (THE REFUND, BY NAME): `consume: { surfaces: -1 }` is refused AI_RUN_CONSUME_INVALID, C-22.13, with the "
    + "catalogue's translation", refusedAs(refund), WANT("AI_RUN_CONSUME_INVALID"));
  t("ARM D2 (NOTHING WRITTEN): the run's bound rows, ticks, lease and log are byte-identical after",
    await witness(BRUN.run), before);
  const second = parse(await create(AK, BRUN.run, idB));
  t("ARM D3 (THE BOUND HOLDS): a second question under the run is refused SURFACE_BOUND_REACHED and does not exist",
    [second?.code, await exists(idB), await boundOf(BRUN.run, "surfaces")], ["SURFACE_BOUND_REACHED", false, [1, 1]]);
}

console.log("\n--- ARM N · A NEGATIVE, A FRACTIONAL, A NON-NUMERIC DELTA: each refused by name, nothing written ---");
{
  const cases = [
    ["ARM N1 (NEGATIVE, a caller-counted bound)", '{"fetches":-3}'],
    ["ARM N2 (FRACTIONAL)", '{"fetches":1.5}'],
    ["ARM N3 (A NUMERIC STRING — a string is not a count)", '{"fetches":"3"}'],
    ["ARM N4 (NON-NUMERIC STRING)", '{"fetches":"abc"}'],
    ["ARM N5 (NON-FINITE: 1e309 parses to Infinity)", '{"fetches":1e309}'],
    ["ARM N6 (NULL)", '{"fetches":null}'],
    ["ARM N7 (BOOLEAN)", '{"subsessions":true}'],
    ["ARM N8 (AN OBJECT)", '{"subsessions":{"n":1}}'],
    ["ARM N9 (NEGATIVE, huge)", '{"fetches":-9007199254740991}'],
    ["ARM N10 (UNSAFE INTEGER)", '{"fetches":9007199254740993}'],
  ];
  const before = await witness(NRUN.run);
  for (const [label, consume] of cases) {
    const r = parse(await tick(ALICE, `{"run":${JSON.stringify(NRUN.run)},"consume":${consume},"log":[${JSON.stringify(ENTRY)}]}`));
    t(`${label}: \`consume: ${consume}\` is refused AI_RUN_CONSUME_INVALID`, refusedAs(r), WANT("AI_RUN_CONSUME_INVALID"));
  }
  t("ARM N11 (NOTHING WRITTEN): after all ten, the bound rows, ticks, lease, status and log are byte-identical",
    await witness(NRUN.run), before);
  const detail = parse(await tick(ALICE, { run: NRUN.run, consume: { fetches: -3 } }))?.detail ?? "";
  t("ARM N12: the detail names the bound and the value refused", [/'fetches'/.test(detail), /-3/.test(detail)],
    [true, true]);
}

console.log("\n--- ARM M · ONE GOOD AND ONE BAD DELTA: the tick is refused WHOLE, so the good one is not spent either ---");
{
  const before = await witness(MRUN.run);
  const m1 = parse(await tick(ALICE, { run: MRUN.run, consume: { fetches: 2, subsessions: -1 }, log: [ENTRY] }));
  t("ARM M1 (THE CLAMP'S TELL): `{ fetches: 2, subsessions: -1 }` is refused AI_RUN_CONSUME_INVALID",
    refusedAs(m1), WANT("AI_RUN_CONSUME_INVALID"));
  t("ARM M2 (NOTHING SPENT, NOTHING APPENDED): the fetches bound did not move and the log did not grow",
    await witness(MRUN.run), before);
}

console.log("\n--- ARM P · A BOUND THE PLANE COUNTS is not the caller's to spend, in either direction ---");
{
  const before = await witness(PRUN.run);
  const p1 = parse(await tick(ALICE, { run: PRUN.run, consume: { surfaces: 1 } }));
  const p2 = parse(await tick(AK, { run: PRUN.run, consume: { mints: 2 } }));
  t("ARM P1: `consume: { surfaces: 1 }` is refused AI_RUN_BOUND_PLANE_COUNTED, C-22.14 — the plane counts a question when it "
    + "lands, and a caller's figure would make the bound say questions were opened that were not",
    refusedAs(p1), WANT("AI_RUN_BOUND_PLANE_COUNTED"));
  t("ARM P2: `consume: { mints: 2 }` from the credential is refused the same way", refusedAs(p2),
    WANT("AI_RUN_BOUND_PLANE_COUNTED"));
  t("ARM P3 (NOTHING WRITTEN)", await witness(PRUN.run), before);
  const p4 = parse(await tick(ALICE, { run: P0RUN.run, consume: { surfaces: 0 } }));
  t("ARM P4 (OVER-STRICTNESS): a zero on a plane-counted bound claims nothing and is a tick like any other",
    [p4?.ticked, p4?.code ?? null, await boundOf(P0RUN.run, "surfaces")], [true, null, [2, 0]]);
}

console.log("\n--- ARM L · A POSITIVE INTEGER DELTA STILL LANDS, and a spent bound still ends the run ---");
{
  const l1 = parse(await tick(AK, { run: FRUN.run, consume: { fetches: 2, subsessions: 1 }, log: [ENTRY] }));
  t("ARM L1: `{ fetches: 2, subsessions: 1 }` lands, spends both and appends the entry",
    [l1?.ticked, l1?.appended, await boundOf(FRUN.run, "fetches"), await boundOf(FRUN.run, "subsessions")],
    [true, 1, [5, 2], [4, 1]]);
  const l2 = parse(await tick(ALICE, { run: FRUN.run, consume: { fetches: 0 } }));
  const l3 = parse(await tick(ALICE, { run: FRUN.run, consume: {} }));
  const l3b = parse(await tick(ALICE, `{"run":${JSON.stringify(FRUN.run)},"consume":{"fetches":-0}}`));
  t("ARM L2 (OVER-STRICTNESS): a zero, an empty consume and a JSON `-0` are ticks that spend nothing",
    [l2?.ticked, l3?.ticked, l3b?.ticked, await boundOf(FRUN.run, "fetches")], [true, true, true, [5, 2]]);
  const l4 = parse(await tick(ALICE, { run: FRUN.run, consume: { fetches: 3 } }));
  const after = (await readRun(FRUN.run))?.session;
  t("ARM L3: spending the last three fetches ends the run, naming the bound",
    [l4?.ticked, after?.status, after?.condition?.bound, await boundOf(FRUN.run, "fetches")],
    [true, "stopped", "fetches", [5, 5]]);
}

console.log("\n--- ARM O · ORDER: position and status are asked before the delta's shape ---");
{
  const ORUN = await openAs(ALICE, [{ bound: "fetches", allowed: 5, unit: "requests" }]);
  const before = await witness(ORUN.run);
  const o1 = parse(await tick(CK, { run: ORUN.run, consume: { fetches: -1 } }));
  t("ARM O1: cora's credential ticking alice's run with a negative delta is told the run is not hers",
    o1?.code, "AI_RUN_NOT_PRINCIPAL");
  const closed = parse(await RAW(`op=airunclose&${ALICE}`, { run: ORUN.run, bound: "completed" }));
  const ended = await witness(ORUN.run);
  const o2 = parse(await tick(ALICE, { run: ORUN.run, consume: { fetches: -1 } }));
  t("ARM O2: a negative delta to an ENDED run is the stated no-op for an ended run, never a new refusal",
    [closed?.terminated, o2?.ticked, o2?.code ?? null, o2?.status], [true, false, null, "finished"]);
  t("ARM O3 (NOTHING WRITTEN)", [before !== ended, await witness(ORUN.run)], [true, ended]);
}

console.log("\n--- ARM S · THE OPEN'S SEED is the same writer, and it is held to the same rule ---");
{
  const s1 = await openAs(ALICE, [{ bound: "fetches", allowed: 3, consumed: -10, unit: "requests" }]);
  t("ARM S1 (A PRE-REFUNDED OPEN): a run declaring `fetches` already consumed -10 is refused "
    + "AI_RUN_CONSUME_INVALID and does not exist",
    [s1.r?.started, s1.r?.code, s1.r?.check, s1.r?.translation, (await readRun(s1.run))?.found],
    [false, "AI_RUN_CONSUME_INVALID", C.AI_RUN_CONSUME_INVALID?.check, C.AI_RUN_CONSUME_INVALID?.translation, false]);
  const s2 = await openAs(ALICE, [{ bound: "fetches", allowed: 3, consumed: 0.5 }]);
  const s3 = await openAs(ALICE, [{ bound: "fetches", allowed: 3, consumed: "2" }]);
  t("ARM S2: a fractional seed and a string seed are refused the same way",
    [s2.r?.code, s3.r?.code, (await readRun(s2.run))?.found, (await readRun(s3.run))?.found],
    ["AI_RUN_CONSUME_INVALID", "AI_RUN_CONSUME_INVALID", false, false]);
  const s4 = await openAs(ALICE, [{ bound: "surfaces", allowed: 3, consumed: 1 }]);
  t("ARM S3: seeding a plane-counted bound as already spent is refused AI_RUN_BOUND_PLANE_COUNTED",
    [s4.r?.started, s4.r?.code, (await readRun(s4.run))?.found], [false, "AI_RUN_BOUND_PLANE_COUNTED", false]);
  const s5 = await openAs(ALICE, [{ bound: "fetches", allowed: 7, consumed: 1, unit: "requests" },
                                  { bound: "surfaces", allowed: 2, consumed: 0 },
                                  { bound: "subsessions", allowed: 2 }]);
  t("ARM S4 (OVER-STRICTNESS): a caller-counted seed of 1, a plane-counted seed of 0 and an absent seed all open",
    [s5.r?.started, await boundOf(s5.run, "fetches"), await boundOf(s5.run, "surfaces"),
     await boundOf(s5.run, "subsessions")], [true, [7, 1], [2, 0], [2, 0]]);
}

console.log("\n--- ARM C · THE PLANE-COUNTED SET IS THE STORE'S OWN, read off its source ---");
{
  const store = readFileSync(join(SRC_DIR, "store.mjs"), "latin1");
  const written = [...store.matchAll(/INSERT INTO ai_run_bounds \([^)]*\) VALUES \(\?, '([a-z_]+)'/g)].map((m) => m[1]);
  t("ARM C1 (REACH): the census finds the store's literal-named bound writers", written.length >= 2, true);
  t("ARM C2: the bounds the store writes BY NAME are exactly the set the door refuses (a new plane-counted bound "
    + "fails here until the door refuses it)", [...new Set(written)].sort(),
    [...(AIRUN.PLANE_COUNTED_BOUNDS ?? [])].sort());
  t("ARM C3: every plane-counted bound is a RUN_BOUNDS row", (AIRUN.PLANE_COUNTED_BOUNDS ?? [null])
    .every((b) => Object.prototype.hasOwnProperty.call(AIRUN.RUN_BOUNDS, b)), true);
}

} catch (e) {
  console.log(`  FAIL  the suite threw before its foot: ${e && e.stack ? e.stack.slice(0, 900) : e}`);
  fail += 1;
} finally {
  await mf.dispose();   /* hygiene.test.mjs asserts every Miniflare instance is disposed */
}

/* THE FOOT: a TypeError inside an assertion ends the module while the tally reads clean, so this line
   existing at all is part of what the count means (WORKER.md). */
console.log(`\nrec169-consume: ${pass} pass, ${fail} fail`);
process.exit(fail ? 1 : 0);
