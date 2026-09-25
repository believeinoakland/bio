/* REC-129's NEGATIVE CONTROL HARNESS. Declared in `test/frontier-internet.test.mjs`,
 * run from `bio-plane/` in one step:
 *
 *     node test/nc-rec129.mjs              # every arm, in order, baseline first
 *     node test/nc-rec129.mjs nofence      # one arm
 *
 * NOT a `.test.mjs` and NOT a fleet suite: it EDITS `src/store.mjs` while it runs.
 * `nc-mk4.mjs` is its shape, arm for arm: one arm at a time with every other
 * defence held open; a BASELINE that arms nothing; each arm declares what MUST
 * fail before it runs; each reports whether it ARMED (a match count other than
 * the one declared is a finding, never a retry); every restore is verified
 * against a uniquely-named per-arm pristine copy by sha256 AND by content —
 * never `git checkout --`. Pristine copies live in `$REC129_PEN` (default:
 * `controlPen("rec129")`, a fresh `mkdtemp` OUTSIDE the worktree — M0-182, BOB #32;
 * `mkdtemp` is what makes it isolated, which a fixed name under `/tmp` was not),
 * used by nothing else.
 *
 * TWO SUITES, one driver: the internet frontier's arms run
 * `frontier-internet.test.mjs`; the op=stats arms (`stats*`, `routeproof`, `purgethin`, `dbbytes*`,
 * `capacitycaller`, `keyboth` — IC-148's, REC-131, replacing IC-144's) run `stats-disclosure.test.mjs`.
 * Each arm names its suite.
 */
import { readFileSync, writeFileSync, copyFileSync, mkdirSync, statSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { controlPen } from "./pen.mjs";

const DIR = dirname(fileURLToPath(import.meta.url));
const PLANE = join(DIR, "..");
const REPO = join(PLANE, "..");
const SAFE = process.env.REC129_PEN || controlPen("rec129");
mkdirSync(SAFE, { recursive: true });
const STORE = join(PLANE, "src/store.mjs");
const INDEX = join(PLANE, "src/index.mjs");
const sha = (p) => createHash("sha256").update(readFileSync(p)).digest("hex");
const MIN_BYTES = 20000;

const runSuite = (suite = "frontier-internet") => {
  const r = spawnSync(process.execPath, [`test/${suite}.test.mjs`],
    { cwd: PLANE, encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
  const out = `${r.stdout || ""}${r.stderr || ""}`;
  const m = new RegExp(`\\n${suite}: (\\d+) pass, (\\d+) fail`).exec(out);
  return { pass: m ? +m[1] : -1, fail: m ? +m[2] : -1, exit: r.status,
           failing: out.split("\n").filter((l) => l.includes("FAIL  ")).map((l) => l.trim().slice(0, 300)) };
};
function arm(patches) {
  const byFile = new Map();
  for (const [file, find, replace, expect = 1] of patches) {
    const src = byFile.get(file) ?? readFileSync(file, "utf8");
    const n = src.split(find).length - 1;
    if (n !== expect) return { armed: false, matches: `${n} (expected ${expect}) for ${JSON.stringify(find.slice(0, 60))}` };
    byFile.set(file, src.split(find).join(replace));
  }
  for (const [f, s] of byFile) writeFileSync(f, s);
  return { armed: true, matches: patches.map((p) => p[3] ?? 1).join("+") };
}

const ARMS = {
  baseline: {
    files: [], why: "nothing armed — the row that distinguishes every-arm-broken from every-arm-working",
    mustFail: [], mustPass: "everything", patch: () => ({ armed: true, matches: 0 }),
  },
  nofence: {
    files: [STORE],
    why: "THE ROW'S CONTROL: the visibility filter removed from the frontier's internet arm — every lead's "
       + "looks and every unfollowed lead reach every member, the shared predicate left intact elsewhere",
    mustFail: ["C1: sam's WHOLE internet frontier", "C1: vera's WHOLE internet frontier",
               "C1: otto's WHOLE internet frontier", "C3: ruth's WHOLE frontier is byte-identical"],
    mustPass: "the no_member arms (a credential with no member still reaches nothing)",
    patch: () => arm([[STORE, "    const reach = this.#leadReach(viewer, identity);\n    const notRead = [", /* RE-ANCHORED 2026-09-18 by REC-132: #leadReach gained the positional identity */
      "    const reach0 = this.#leadReach(viewer, identity);\n    const reach = reach0 && { sql: \"(1=1 OR ? IS NULL OR ? IS NULL)\", args: reach0.args };\n    const notRead = ["]]),
  },
  grouplate: {
    files: [STORE],
    why: "the fence applied AFTER the latest-per-subject grouping instead of before it: a hidden look under "
       + "a lead with the same words becomes the subject's latest row and displaces what the viewer sees",
    mustFail: ["C3: ruth's WHOLE frontier is byte-identical"],
    mustPass: "every arm whose subject no hidden lead shares",
    patch: () => arm([[STORE, "        WHERE v.seq = (SELECT MAX(w.seq) FROM v w\n                        WHERE w.subject_kind",
      "        WHERE v.seq = (SELECT MAX(w.seq) FROM observation_log w\n                        WHERE w.level = 'internet' AND w.subject_kind"]]),
  },
  tallywide: {
    files: [STORE],
    why: "the tally counted over the WHOLE level (REC-110's ruling for the other three levels applied here) — "
       + "a lead outside the viewer's reach then moves a count",
    mustFail: ["C1: sam's WHOLE internet frontier", "C3: ruth's WHOLE frontier is byte-identical",
               "C4: sam sees ONLY his own look"],
    mustPass: "every list and every cause",
    patch: () => arm([[STORE, "      `${V} SELECT state, COUNT(*) AS n FROM v GROUP BY state`, ...reach.args))",
      "      `${V} SELECT state, COUNT(*) AS n FROM observation_log WHERE level = 'internet' GROUP BY state`, ...reach.args))"]]),
  },
  neverwide: {
    files: [STORE],
    why: "the never-followed list taken without the fence: every unfollowed lead in the instance is listed "
       + "to every member — the lead's words and id to people it was never shared with",
    mustFail: ["C1: sam's WHOLE internet frontier", "C1: vera's WHOLE internet frontier"],
    mustPass: "the looked rows (still fenced)",
    patch: () => arm([[STORE, "      `SELECT l.lead_id AS lead, l.words AS subject, l.at AS at FROM leads l\n        WHERE ${reach.sql}",
      "      `SELECT l.lead_id AS lead, l.words AS subject, l.at AS at FROM leads l\n        WHERE (1=1 OR ? IS NULL OR ? IS NULL)"]]),
  },
  nocause: {
    files: [STORE],
    why: "THE LIAR: an empty answer with no cause — a frontier that says nothing reads exactly like one "
       + "that looked and found nothing",
    mustFail: ["A1: the internet level is BUILT", "A3: the member TOKEN carries no member",
               "B1: two leads, neither followed"],
    mustPass: "every non-empty answer",
    patch: () => arm([[STORE, "    const empty = (cause) => ({ level: \"internet\", partition: \"description\", cause,",
      "    const empty = (cause) => null && ({ level: \"internet\", partition: \"description\", cause,"]]),
  },
  refleak: {
    files: [STORE],
    why: "a look's referent published whether or not the reader can read it: a capture sha from a project "
       + "the reader never joined, through a lead that was shared to them",
    mustFail: ["E1: ruth sees the referent"],
    mustPass: "every arm without a hidden referent",
    patch: () => arm([[STORE, "      const refSeen = !r.result_kind || this.#leadReferentVisible(r.result_kind, r.result_ref, viewer);",
      "      const refSeen = true;"]]),
  },
  overstrict: {
    files: [STORE],
    why: "THE OVER-STRICTNESS DIRECTION: the share arm dropped from the ONE lead-visibility predicate — "
       + "a joined participant of the project a lead was shared to no longer finds it",
    mustFail: ["D1: OVER-STRICTNESS"],
    mustPass: "every refused-viewer arm — refusing more cannot leak",
    patch: () => arm([[STORE, "      sql: `(l.author = ? OR EXISTS (SELECT 1 AS x FROM lead_shares s JOIN project_participants pp",
      "      sql: `(l.author = ? OR 0=1 AND EXISTS (SELECT 1 AS x FROM lead_shares s JOIN project_participants pp"]]),
  },
};
/* IC-148's arms (REC-131) — CORRECTED 2026-09-18, NEVER EXEMPTED. REC-129 wrote these arms for IC-144
   (`statsopen`, `statsdropall`, `statsstamp`, `selftestopen`), which broke an admin-CLASS stamp that
   BOB #15's corrected §5 ruling removed: no class receives `leads`, and every class receives the same
   log count, which excludes lead looks. `statsstamp` and `selftestopen` had no subject left and were
   replaced. RE-CORRECTED THE SAME DAY (REC-131 resumed): the wire's count is `observationsNonLead` (BOB.md
   rule 7 — purge's `observations` keeps the whole log), and `dbBytes` is the admin class's only, under a
   server-set `capacity` stamp — so the anchors below moved, and five arms were added for the two rulings. */
const STATS_NONLEAD = "        : { observationsNonLead: this.#one(`SELECT count(*) c FROM observation_log WHERE authority_kind <> 'lead'`).c }),";
/* CORRECTED 2026-09-24 BY D-464: the route passes the VIEWER stamp too (counts are taken through the caller's sight),
   so the anchor is the new line; the armed replacements below carry it, so each arm still moves only its own subject. */
const STATS_ROUTE = '        stats: () => this.stats({ capacity: url.searchParams.get("capacity") === "1", viewer: url.searchParams.get("viewer") }),';
const STATS_STAMP = '    if (op === "stats") inner.searchParams.set("capacity", cls === "admin" ? "1" : "0");\n';
const DB_GATE = "      ...((proof || capacity) ? { dbBytes: this.ctx.storage.sql.databaseSize } : {}),";
Object.assign(ARMS, {
  statsbaseline: {
    suite: "stats-disclosure", files: [], why: "nothing armed — the stats suite's own baseline row",
    mustFail: [], mustPass: "everything", patch: () => ({ armed: true, matches: 0 }),
  },
  statsleadrows: {
    suite: "stats-disclosure", files: [STORE],
    why: "THE ROW'S FIRST CONTROL: the lead rows put back into the wire's log count — a lead look then moves "
       + "every live-store caller's answer",
    mustFail: ["A1: the admin TOKEN's WHOLE", "A1: the member TOKEN's WHOLE", "A1: sam's member SESSION's WHOLE",
               "F1: the member TOKEN's WHOLE", "E2: and its proof carries"],
    mustPass: "A1/F1 for the probe TOKEN (it reads SCRATCH — NON-DISCRIMINATING, named), B (the key is still "
            + "present), C (it still moves on a non-lead row)",
    patch: () => arm([[STORE, STATS_NONLEAD,
      "        : { observationsNonLead: n(\"observation_log\") }),"]]),
  },
  statsadminleads: {
    suite: "stats-disclosure", files: [STORE],
    why: "THE ROW'S SECOND CONTROL: `leads` put back for the admin CLASS (honoured at the route off the "
       + "server's own capacity stamp, which only the admin class carries), everything else as it is",
    mustFail: ["FIXTURE:", "A1: the admin TOKEN's WHOLE", "B1: the admin TOKEN receives"],
    mustPass: "every member, session and probe arm — they never receive the key under this arm",
    patch: () => arm([[STORE, STATS_ROUTE,
      '        stats: () => url.searchParams.get("capacity") === "1" ? { ...this.stats({ capacity: true, viewer: url.searchParams.get("viewer") }), leads: this.#counts({ proof: true }).leads } : this.stats({ viewer: url.searchParams.get("viewer") }),']]),
  },
  statsdropall: {
    suite: "stats-disclosure", files: [STORE],
    why: "THE LIAR the row names: the log count dropped for EVERYONE — every A answer is then byte-identical "
       + "too, so A alone cannot tell it from the fix; the presence and MOVES arms must",
    mustFail: ["FIXTURE:", "B1: the admin TOKEN receives", "B1: the probe TOKEN receives", "C0:",
               "C1: the admin TOKEN's `observationsNonLead` MOVED", "C2:", "D2:", "D3:"],
    mustPass: "every A1 arm (the liar passes the headline — which is why C exists)",
    patch: () => arm([[STORE, STATS_NONLEAD, "        : {}),"]]),
  },
  routeproof: {
    suite: "stats-disclosure", files: [STORE],
    why: "the wire route wired to PURGE'S PROOF (the whole log, `leads`, `dbBytes`) — the regression the private "
       + "#counts exists to make unlikely: one short edit at the route re-opens every withheld key for every class",
    mustFail: ["FIXTURE:", "A1: the member TOKEN's WHOLE", "B1: the member TOKEN receives",
               "B1: sam's member SESSION receives", "F1: the member TOKEN's WHOLE"],
    mustPass: "C1a",
    patch: () => arm([[STORE, STATS_ROUTE, "        stats: () => this.#counts({ proof: true }),"]]),
  },
  purgethin: {
    suite: "stats-disclosure", files: [STORE],
    why: "THE OVER-STRICTNESS DIRECTION: purge's proof read from the WIRE's counts — it then cannot prove "
       + "it took the leads or their looks (D-113)",
    mustFail: ["E1: a whole-store purge", "E2: and its proof carries"],
    mustPass: "A, B, C, D, F — the wire is unchanged",
    patch: () => arm([
      [STORE, "    const before = this.#counts({ proof: true });", "    const before = this.stats();"],
      [STORE, "    const after = this.#counts({ proof: true });", "    const after = this.stats();"]]),
  },
  dbbytesmember: {
    suite: "stats-disclosure", files: [INDEX],
    why: "THE dbBytes CONTROL the resumed row names: `dbBytes` put back for the MEMBER class (the server stamp "
       + "widened to member) — a colleague's large lead then moves a member's answer",
    mustFail: ["F1: the member TOKEN's WHOLE", "F1: sam's member SESSION's WHOLE", "B1: the member TOKEN receives",
               "B1: sam's member SESSION receives"],
    mustPass: "every admin arm and every probe arm (the probe is not member class)",
    patch: () => arm([[INDEX, STATS_STAMP,
      '    if (op === "stats") inner.searchParams.set("capacity", (cls === "admin" || cls === "member") ? "1" : "0");\n']]),
  },
  dbbytesall: {
    suite: "stats-disclosure", files: [STORE],
    why: "the store ignoring its stamp — `dbBytes` for every class and every door (op=stats, selftest, livefire)",
    mustFail: ["B1: the member TOKEN receives", "B1: the probe TOKEN receives", "F1: the member TOKEN's WHOLE",
               "D2:", "D3:"],
    mustPass: "every admin arm (the admin keeps it either way)",
    patch: () => arm([[STORE, DB_GATE, "      ...(true ? { dbBytes: this.ctx.storage.sql.databaseSize } : {}),"]]),
  },
  dbbytesnone: {
    suite: "stats-disclosure", files: [STORE],
    why: "THE OVER-STRICTNESS DIRECTION: `dbBytes` dropped for the ADMIN too (and every door) — capacity is an "
       + "operator need the ruling keeps",
    mustFail: ["FIXTURE:", "B1: the admin TOKEN receives", "B3:", "D2:", "D4:", "F0: THE ARM IS ARMED"],
    mustPass: "every member, session and probe arm — refusing more cannot leak",
    patch: () => arm([[STORE, DB_GATE, "      ...(proof ? { dbBytes: this.ctx.storage.sql.databaseSize } : {}),"]]),
  },
  capacitycaller: {
    suite: "stats-disclosure", files: [INDEX],
    why: "the server's `capacity` stamp removed on op=stats: the caller's own `capacity=` is forwarded as copied, "
       + "so a member who asks is honoured and the admin who does not ask loses `dbBytes`",
    mustFail: ["B2: the member TOKEN sending", "B2: sam's member SESSION sending", "FIXTURE:", "B1: the admin TOKEN receives"],
    mustPass: "D (selftest and livefire stamp their own fetch) and every member arm that does not ask",
    patch: () => arm([[INDEX, STATS_STAMP, ""]]),
  },
  keyboth: {
    suite: "stats-disclosure", files: [STORE],
    why: "BOB.md rule 7's liar: the wire publishes the narrower count under BOTH names — `observations` "
       + "beside `observationsNonLead` — so one name carries two meanings across op=stats and op=purge",
    mustFail: ["FIXTURE:", "B1: the admin TOKEN receives", "B1: the member TOKEN receives", "D2:", "D3:"],
    mustPass: "A (the numbers do not move), C (they still move together), E",
    patch: () => arm([[STORE, STATS_NONLEAD,
      "        : { observations: this.#one(`SELECT count(*) c FROM observation_log WHERE authority_kind <> 'lead'`).c, observationsNonLead: this.#one(`SELECT count(*) c FROM observation_log WHERE authority_kind <> 'lead'`).c }),"]]),
  },
});
const want = process.argv[2] || null;
const names = want ? [want] : Object.keys(ARMS);
if (want && !ARMS[want]) { console.error(`unknown arm '${want}'. arms: ${Object.keys(ARMS).join(", ")}`); process.exit(2); }
let finding = 0;
for (const name of names) {
  const a = ARMS[name];
  console.log(`\n===== ARM ${name} =====`);
  console.log(`  WHY        ${a.why}`);
  console.log(`  MUST FAIL  ${a.mustFail.length ? a.mustFail.join(" | ") : "(nothing — baseline)"}`);
  console.log(`  MUST PASS  ${a.mustPass}`);
  const saved = a.files.map((f) => {
    const dest = join(SAFE, `${name}.${f.split("/").pop()}`);
    copyFileSync(f, dest);
    return { f, dest, sha: sha(f), bytes: statSync(f).size };
  });
  for (const s of saved) {
    console.log(`  PRISTINE   ${s.f.replace(REPO + "/", "")}  ${s.bytes} bytes  sha256 ${s.sha.slice(0, 12)}…`);
    if (s.bytes < MIN_BYTES) { console.log(`  FINDING    pristine copy is under ${MIN_BYTES} bytes — refusing to proceed`); process.exit(2); }
  }
  const armed = a.patch();
  console.log(`  ARMED      ${armed.armed ? "yes" : "NO"}  (patch matched ${armed.matches})`);
  if (!armed.armed && !/baseline$/.test(name)) {
    console.log(`  FINDING    the arm DID NOT ARM. An arm that did not arm is a finding, never a retry.`);
    finding++;
  }
  const r = runSuite(a.suite);
  console.log(`  RESULT     ${r.pass} pass, ${r.fail} fail, exit ${r.exit}`);
  for (const l of r.failing) console.log(`             ${l}`);
  for (const s of saved) {
    copyFileSync(s.dest, s.f);
    const back = sha(s.f);
    const sameBytes = readFileSync(s.f).equals(readFileSync(s.dest));
    console.log(`  RESTORED   ${s.f.replace(REPO + "/", "")}  byte-identically: ${back === s.sha && sameBytes ? "YES" : "NO"}  ${statSync(s.f).size} bytes  sha256 ${back.slice(0, 12)}…`);
    if (!(back === s.sha && sameBytes)) { console.log("  FINDING    restore FAILED — stopping before the next arm measures the wrong tree"); process.exit(2); }
  }
  if (name === "baseline" || name === "statsbaseline") {
    const ok = r.fail === 0 && r.pass > 0;
    console.log(`  VERDICT    ${ok ? "AS DECLARED — green" : "NOT AS DECLARED"}`);
    if (!ok) finding++;
    continue;
  }
  const hit = a.mustFail.map((w) => r.failing.some((l) => l.includes(w)));
  const ok = armed.armed && r.pass >= 0 && hit.every(Boolean);
  console.log(`  VERDICT    ${ok ? "AS DECLARED" : "NOT AS DECLARED"}${hit.every(Boolean) ? "" : ` — did not fail: ${a.mustFail.filter((_, i) => !hit[i]).join(" | ")}`}`);
  if (!ok) finding++;
}
console.log(`\nnc-rec129: ${finding} finding(s) across ${names.length} arm(s)`);
process.exit(finding ? 1 : 0);
