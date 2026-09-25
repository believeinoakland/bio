/* NEGATIVE CONTROL: DECLARED HERE, RUN BY `test/rec171-surface-token.control.mjs` — deliberately NOT a `.test.mjs`, because it patches COPIES of `src/` while it runs and the battery must not discover it. Re-run in one step from `bio-plane/`: `node test/rec171-surface-token.control.mjs [arm]`. RESULTS, RUN 2026-09-23 by the REC-171 worker (CONDUCT #15's, cloud) on 4355bfda + this item (real src/index.mjs 716,061 B sha256 3119ced5f34e…, src/store.mjs 2,834,918 B a619167632fa…, src/airun.mjs 139,535 B fdef7964b6f0…, checks/bio-checks.mjs 825,591 B 4e4487b043e0…, untouched: YES), ALL NINE ARMS AS DECLARED AT THE FIRST RUN: baseline -> 28/0 · **ai-only — THE ROW'S CONTROL, D-85's `cls === "ai"` condition restored on the stamp -> 9/19: every ADMIN, MEMBER and PROBE arm but <C>3c BY NAME (ARM ADMIN1, MEMBER1, PROBE1 — the outside-a-run arms — first), with H2 (the admin run's bound never spent)** · forget-admin (a fence that forgets ONE class) -> 21/7: the ADMIN arms and H2 only · forget-member -> 22/6: the MEMBER arms only · forget-probe -> 22/6: the PROBE arms only · **gate-by-claimed-label — THE LIAR, the stamp keyed on the caller's own `surfaced_by: human` -> 15/13: ARM ADMIN2, MEMBER2, PROBE2 BY NAME (the relabelled creation lands outside any run), with 2b, 3, 3b and H2** · restamp-human (the alternative BOB #30 refused: D-78 stamps a deploy token's creation `human`, the rule kept for `ai`) -> 6/22: every deploy arm and ARM <C>3c (NEVER A PERSON) by name · wrong-prefix (the stamp spelled `token:<cls>`, the `author` form, not the run verbs' `class:<cls>`) -> 18/10: every landing refused AI_RUN_NOT_PRINCIPAL · listed-classes (over-strictness: the same rule as an explicit list of every class that reaches the line) -> 28/0. BEFORE THIS ITEM (the `ai-only` arm IS `4355bfda`'s stamp): 9 pass, 19 fail — each deploy token's question naming no run, and its relabelled `human` twin, LANDED stamped `agent` with no run, no row and no bound.
 * =========================================================================
 * REC-171 — RULE 2 BINDS EVERY CREATION THE RECORD CALLS AN ASSISTANT'S, NOT THE `ai` CLASS ALONE.
 *
 * `INVESTIGATIVE-SESSION.md` §11 item 5, "Rule 2's reach" (BOB #30, 2026-09-23). D-85 built rule 2 for an `ai`
 * credential. The admin, member and probe classes are instance DEPLOY TOKENS with no member behind them, and D-78
 * stamps every creation of theirs `surfaced_by: agent` at the trust boundary (`index.mjs`, the D-78 restamp) — so an
 * `agent` question created by one outside any run is a record claiming a machine surfaced it under conditions it
 * never recorded. The ruling: a creation stamped `agent` names a RUNNING run whose PRINCIPAL is the caller, by the
 * stamp the run verbs already use (`class:<cls>` for a deploy token, compared by `runPrincipalGate` unchanged), under
 * the same `surfaces` bound, sight check, codes (C-66.1–.4) and `inquiry_run_surfacings` row. Restamping such a
 * creation `human` would invent a person, and is refused.
 *
 * WHAT WAS WRONG, measured on the unedited tree (`4355bfda`): `index.mjs` set the `assistantPrincipal` stamp only when
 * `cls === "ai"`, so an admin, member or probe token's inquiry creation naming no run landed `ok: true`, stamped
 * `surfaced_by: agent`, with no run, no lens and no bound.
 *
 * HOW A LIAR PASSES THE OBVIOUS TEST, stated before what this checks: (1) fence ONE deploy class — every arm is driven
 * from EACH of admin, member and probe, and each class's arm carries its class in its name, so a fence that forgets
 * one fails by that class's name; (2) key the fence on the LABEL the caller wrote rather than on the credential — a
 * deploy token that writes `surfaced_by: human` into its own bytes (ARM <C>2, THE LIAR) must be refused exactly as one
 * that writes `agent`, and its question must never land; (3) "fix" it by restamping a deploy token's creation
 * `human` — ARM <C>3 reads the LANDED bytes and demands `surfaced_by: agent`; (4) confuse the classes — ARM <C>4 opens
 * a question under ANOTHER deploy class's running run and must be told the run is not its own.
 *
 * WHAT THIS SUITE CANNOT SEE: (i) one isolate, one store per namespace; (ii) no surface — it asserts what the plane
 * SENDS; (iii) the `ai` class — `d85-surface-run.test.mjs` owns it and is unchanged; (iv) the daemon class, which holds
 * no `promote` (its op table is two verbs), so no arm can drive it — the stamp's condition is `!viaSession` and names
 * no class, so a class that later gains `promote` is asked, and that is read from the code, not driven here;
 * (v) store-internal creations of an inquiry (`op=inquirydivide`, grounding) do not pass the D-78 restamp and are out
 * of the ruling's reach.
 * ========================================================================= */
import { statedJSON } from "./stated.mjs";
import "./stdio.mjs";                 /* D-282: a suite's own exit must not discard the suite's own output */
import "./sandbox.mjs";               /* D-186: owns $TMPDIR for this process and removes it on exit */
import { Miniflare } from "miniflare";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { join } from "node:path";

/* The control driver points this at an armed COPY of the sources. */
const SRC_DIR = process.env.REC171_SRC || fileURLToPath(new URL("../src", import.meta.url));
const IDX = join(SRC_DIR, "index.mjs");
const { AI_RUN_CHECKS, SURFACE_CHECKS } = await import(join(SRC_DIR, "..", "checks", "bio-checks.mjs"));

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = statedJSON(got) === statedJSON(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${statedJSON(want)}\n         got  ${statedJSON(got)}`}`);
  ok ? pass++ : fail++;
};

const ADM = "adm-rec171", MEM = "mem-rec171", PRB = "prb-rec171";
const mf = new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: IDX, script: readFileSync(IDX, "utf8"),
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
  r2Buckets: ["CAPTURES", "PUBLISHED"],
  bindings: { ADMIN_TOKEN: ADM, MEMBER_TOKEN: MEM, PROBE_TOKEN: PRB, VERSION: "test" },
});

try {

const sha = (v) => createHash("sha256").update(v).digest("hex");
const rP = (r) => (r && typeof r === "object" && "result" in r) ? r.result : r;
const RAW = async (q, body) => {
  const res = await mf.dispatchFetch(`http://x/api/?${q}`,
    body === undefined ? {} : { method: "POST", body: JSON.stringify(body) });
  return { status: res.status, body: await res.text() };
};
const parse = (r) => { try { return rP(JSON.parse(r.body)); } catch { return null; } };
const POST = async (q, body) => parse(await RAW(q, body ?? {}));
const GET = async (q) => parse(await RAW(q));
const E = encodeURIComponent;

/* THE THREE DEPLOY CLASSES, each with the namespace it lives in. Every call NAMES its store (CLAUDE.md §5): the probe
   class is confined to scratch; admin and member are driven in `bio`, which in this isolate is a throwaway store. */
const CLASSES = [
  { cls: "admin",  tok: `token=${ADM}`, store: "bio" },
  { cls: "member", tok: `token=${MEM}`, store: "bio" },
  { cls: "probe",  tok: `token=${PRB}`, store: "scratch" },
];
const at = (c) => `${c.tok}&store=${c.store}`;

const member = async (id, caps, role = "member") => {
  const add = await POST(`op=memberadd&token=${ADM}`, { memberId: id, cover: `cover for ${id}`, role, capabilities: caps });
  if (!add?.invite) throw new Error(`memberadd ${id}: ${JSON.stringify(add)}`);
  const en = await POST("op=enroll", { invite: add.invite, handle: id, password: `${id}-passphrase-1` });
  if (!en?.ok) throw new Error(`enroll ${id}: ${JSON.stringify(en)}`);
  const lg = await POST("op=login", { role: `member:${id}`, password: `${id}-passphrase-1` });
  if (!lg?.token) throw new Error(`login ${id}: ${JSON.stringify(lg)}`);
  return "token=" + lg.token;
};
const RUTH = await member("ruth", ["contribute", "publish", "create_projects"], "admin");
await member("gus", ["contribute"], "admin");

const NOW = "2026-09-23T00:00:00Z", LATER = "2026-09-23T01:00:00Z";
const inquiryMd = (id, surfacedBy) => ["---",
  `id: ${id}`, "object_type: inquiry", "schema: inquiry@1",
  `title: "Question ${id}"`, "current_state: open", "prior_state: null",
  `created: "${NOW}"`, `last_updated: "${LATER}"`,
  "produced_by:", "  mode: agent", "  capability_tier: high",
  "group: believe-in-oakland", "references: []", "state_history: []",
  "annotations_open: 0",
  "reeval_pending:", "  flag: false", "  since: null", "  source: null",
  "visuals: []", `surfaced_by: ${surfacedBy}`, 'disposition_reason: ""',
  "---", "", "## Question", "", `Did ${id} happen?`, "", "## What It Rests On", "",
  "## Conclusion", "", "## What Would Falsify This", "", "## Session Log", "",
  "## Review Notes", ""].join("\n");
let seq = 0;
const bundle = (id, surfacedBy, extra = {}) => {
  const md = inquiryMd(id, surfacedBy);
  return {
    bundleId: id, base: null,
    snapKey: `20260923T1500${String(++seq).padStart(2, "0")}Z_rec171aa`,
    meta: { object_type: "inquiry", group: "believe-in-oakland",
            current_state: "open", created: NOW, last_updated: LATER },
    files: [{ path: "bundle.md", text: md, bytes: md.length, sha256: sha(md) }],
    register: [], ...extra,
  };
};
let inqSeq = 0;
const freshId = () => `INQ-2026-9171-surfaced-${++inqSeq}`;
/* THE ONE CREATOR. */
const create = (who, run, { surfacedBy = "agent", id = freshId(), extra = {} } = {}) =>
  POST(`op=promote&${who}`, bundle(id, surfacedBy, { ...(run === undefined ? {} : { run }), ...extra }));
const projection = (id, store) => GET(`op=projection&${RUTH}&store=${store}&id=${E(id)}`);
const exists = async (id, store) => !!(await projection(id, store))?.bundle_id;
const bytesOf = async (id, store) => {
  const md = parse(await RAW(`op=file&${RUTH}&store=${store}&id=${E(id)}&path=bundle.md`));
  return typeof md === "string" ? md : (md?.text ?? md?.content ?? "");
};
const links = async (store) => (await GET(`op=stats&token=${ADM}&store=${store}`))?.inquiryRunSurfacings;
const readRun = async (run, store) =>
  parse(await RAW(`op=airun&token=${ADM}&store=${store}&run=${E(run)}`))?.session ?? null;
const surfacesOf = async (run, store) => {
  const b = ((await readRun(run, store))?.budget ?? []).find((x) => x.bound === "surfaces");
  return b ? [b.allowed, b.consumed] : null;
};

/* THE CONTEXT every run is over: one question a MEMBER's session created, in each namespace. */
const Q = "INQ-2026-9171-context-question";
console.log("\n--- FIXTURE: a member's question in each namespace, and one running run per deploy class ---");
{
  const qb = await create(`${RUTH}&store=bio`, undefined, { surfacedBy: "human", id: Q });
  const qs = await create(`${RUTH}&store=scratch`, undefined, { surfacedBy: "human", id: Q });
  t("FIXTURE: ruth's session creates the context question in `bio` and in `scratch`", [qb?.ok, qs?.ok], [true, true]);
}
let runSeq = 0;
const openAs = async (c, { surfaces = 3 } = {}) => {
  const run = `RUN-2026-0923-rec171-${c.cls}-${++runSeq}`;
  const bounds = [{ bound: "fetches", allowed: 50, unit: "requests" }];
  if (surfaces != null) bounds.push({ bound: "surfaces", allowed: surfaces, unit: "questions" });
  const r = await POST(`op=airunopen&${at(c)}`, {
    run, contextType: "inquiry", contextId: Q, label: "REC-171 run", mode: "check",
    principalClaude: "instance", principalClaudeRef: "believe-in-oakland/claude",
    skillVersion: "investigative-session@1", bounds, leaseMs: 600000 });
  return { run, r };
};
const RUNS = {};
for (const c of CLASSES) RUNS[c.cls] = await openAs(c);
t("REACH: each deploy class OPENS a run of its own and the plane stamps its principal `class:<cls>` — every refusal "
  + "below would pass vacuously over a run that never started",
  CLASSES.map((c) => [RUNS[c.cls].r?.started ?? RUNS[c.cls].r]),
  CLASSES.map(() => [true]));
/* ANOTHER deploy class's running run IN EACH CLASS's OWN namespace: admin and member hold each other's in `bio`; the
   probe's is an admin run opened in `scratch`, so every class is refused BY POSITION and never by absence. */
const adminScratch = { cls: "admin", ...(await openAs({ cls: "admin", tok: `token=${ADM}`, store: "scratch" })) };
const OTHER = { admin: { cls: "member", ...RUNS.member }, member: { cls: "admin", ...RUNS.admin }, probe: adminScratch };
t("REACH: the admin run in `scratch` (the probe's other-class run) is running too", adminScratch.r?.started, true);
t("REACH: and the run reads back running, principal `class:<cls>`, with room for three questions",
  await Promise.all(CLASSES.map(async (c) => {
    const s = await readRun(RUNS[c.cls].run, c.store);
    return [s?.status, s?.principal?.plane, await surfacesOf(RUNS[c.cls].run, c.store)];
  })),
  CLASSES.map((c) => ["running", `class:${c.cls}`, [3, 0]]));

const S = SURFACE_CHECKS, NP = AI_RUN_CHECKS.AI_RUN_NOT_PRINCIPAL;
const refusedAs = (a) => [a?.ok, a?.code, a?.check, a?.translation];
const WANT = (code) => { const row = code === "AI_RUN_NOT_PRINCIPAL" ? NP : S[code];
                         return [false, code, row?.check, row?.translation]; };

/* ONE BLOCK PER DEPLOY CLASS. The arm names carry the class, so a fence that forgets one fails BY THAT NAME. */
for (const c of CLASSES) {
  const K = c.cls.toUpperCase();
  console.log(`\n--- ${K} DEPLOY TOKEN ---`);
  const before = await links(c.store);

  const id1 = freshId();
  const x1 = await create(at(c), undefined, { id: id1 });
  t(`ARM ${K}1 (OUTSIDE A RUN): the ${c.cls} token's creation of a question naming no run is refused SURFACE_NO_RUN, `
    + "C-66.1, with the catalogue's translation", refusedAs(x1), WANT("SURFACE_NO_RUN"));

  const id2 = freshId();
  const x2 = await create(at(c), undefined, { id: id2, surfacedBy: "human" });
  t(`ARM ${K}2 (THE LIAR): the ${c.cls} token that writes \`surfaced_by: human\` into its own bytes to escape the run `
    + "check is refused SURFACE_NO_RUN by name — the label is the SERVER's (D-78), never the caller's",
    refusedAs(x2), WANT("SURFACE_NO_RUN"));
  t(`ARM ${K}2b (NOTHING LANDED): neither question exists and no link was written`,
    [await exists(id1, c.store), await exists(id2, c.store), await links(c.store)], [false, false, before]);

  const id3 = freshId();
  const x3 = await create(at(c), RUNS[c.cls].run, { id: id3, surfacedBy: "human" });
  const p3 = await projection(id3, c.store);
  const md3 = await bytesOf(id3, c.store);
  t(`ARM ${K}3 (INSIDE ITS OWN RUN): the ${c.cls} token's question under its own running run lands, names the run `
    + "and spends one `surfaces`", [x3?.ok, x3?.surfaced_in?.run, x3?.surfaced_in?.bound],
    [true, RUNS[c.cls].run, { bound: "surfaces", allowed: 3, consumed: 1 }]);
  t(`ARM ${K}3b (THE ROW): the link row is written and read back — the run, BY \`class:${c.cls}\`, and the run's lens `
    + "block", [await links(c.store) - before, p3?.surfaced_in?.recorded, p3?.surfaced_in?.run, p3?.surfaced_in?.by,
                typeof p3?.surfaced_in?.lens],
    [1, true, RUNS[c.cls].run, `class:${c.cls}`, "object"]);
  t(`ARM ${K}3c (NEVER A PERSON): the landed bytes say \`surfaced_by: agent\` though the ${c.cls} token wrote \`human\` `
    + "— no person is invented — and name no run", [/\nsurfaced_by: agent\n/.test(md3), md3.includes(RUNS[c.cls].run)],
    [true, false]);

  const id4 = freshId();
  const x4 = await create(at(c), OTHER[c.cls].run, { id: id4 });
  t(`ARM ${K}4 (ANOTHER CLASS's RUN): the ${c.cls} token under the ${OTHER[c.cls].cls} token's running run in its own `
    + "namespace is refused AI_RUN_NOT_PRINCIPAL — the principal is the CLASS — and nothing landed",
    [...refusedAs(x4), await exists(id4, c.store)], [...WANT("AI_RUN_NOT_PRINCIPAL"), false]);
}

console.log("\n--- ARM H · A MEMBER's SESSION creation is UNCHANGED ---");
{
  const before = await links("bio");
  const ids = [freshId(), freshId(), freshId()];
  const h = [
    await create(`${RUTH}&store=bio`, undefined, { id: ids[0], surfacedBy: "human" }),      // no run
    await create(`${RUTH}&store=bio`, undefined, { id: ids[1], surfacedBy: "agent" }),      // claims agent
    await create(`${RUTH}&store=bio`, RUNS.admin.run, { id: ids[2], surfacedBy: "human" }), // names a deploy run
  ];
  t("ARM H1: ruth's session creates a question in each of three shapes and every one lands, as before",
    h.map((x) => [x?.ok, x?.code ?? null]), ids.map(() => [true, null]));
  t("ARM H2: none carries `surfaced_in`, no link was written, and no deploy run's bound moved",
    [h.map((x) => "surfaced_in" in (x ?? {})), await links("bio") - before, await surfacesOf(RUNS.admin.run, "bio")],
    [[false, false, false], 0, [3, 1]]);
  const md = await bytesOf(ids[1], "bio");
  t("ARM H3 (D-78 UNCHANGED): the session's question that claimed `agent` is restamped `human`",
    /\nsurfaced_by: human\n/.test(md), true);
}

} catch (e) {
  console.log(`  FAIL  the suite threw before its foot: ${e && e.stack ? e.stack.slice(0, 900) : e}`);
  fail += 1;
} finally {
  await mf.dispose();   /* hygiene.test.mjs asserts every Miniflare instance is disposed */
}

/* THE FOOT: a TypeError inside an assertion ends the module while the tally reads clean (WORKER.md). */
console.log(`\nrec171-surface-token: ${pass} pass, ${fail} fail`);
process.exit(fail ? 1 : 0);
