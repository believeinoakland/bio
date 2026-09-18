/* REC-93 — THE FOLD'S MIGRATION, DRIVEN OVER A STORE THAT ACTUALLY HOLDS
 * PRE-ITEM `ai_run_log` ROWS. NOT a suite (no `.test.mjs`): it needs a persisted
 * store written by ONE build and then re-opened by ANOTHER, which no suite on an
 * arbitrary tree can arrange.
 *
 *     node test/rec93-migrate-probe.mjs /path/to/pristine/worktree
 *
 * WHY IT EXISTS. `rec93-fold-digest.mjs` proves the two builds ANSWER alike over
 * a fixture each writes for itself. It does NOT exercise `#migrate`'s copy at
 * all, because a store created by the new build never had an `ai_run_log` to
 * migrate. The one path neither that instrument nor the suite can reach is the
 * one a REAL instance will take on its next boot: rows written under the old
 * schema, read back through the new one. That is this probe.
 *
 * The persisted directory is written by the OLD build and re-opened by the NEW
 * build against the SAME bytes on disk, so the migration runs exactly as it will
 * in production.
 */
import "./stdio.mjs";
import "./sandbox.mjs";
import { Miniflare } from "miniflare";
import { readFileSync, mkdtempSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { tmpdir } from "node:os";
import { join } from "node:path";

const TOK = "mem-rec93";
const BUNDLE = "INQ-2026-0914-migrate";
const RUN = "RUN-2026-0914-migrate";
const SHA_A = "a".repeat(64);
const T0 = "2026-09-14T09:00:00Z";

const PERSIST = mkdtempSync(join(tmpdir(), "rec93-migrate-"));
console.log(`persist dir: ${PERSIST}`);

function planeAt(root) {
  const idx = join(root, "bio-plane/src/index.mjs");
  return new Miniflare({
    modules: true, modulesRoot: "/", scriptPath: idx, script: readFileSync(idx, "utf8"),
    compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
    durableObjects: { STORE: { className: "Store", useSQLite: true } },
    durableObjectsPersist: PERSIST,
    r2Buckets: ["CAPTURES", "PUBLISHED"],
    bindings: { ADMIN_TOKEN: "adm-rec93", MEMBER_TOKEN: TOK, PROBE_TOKEN: "prb-rec93",
                VERSION: "test", TASK_DRAIN_DELAY_MS: "600000" },
  });
}
const rP = (r) => (r && typeof r === "object" && "result" in r) ? r.result : r;
const call = (mf) => ({
  GET: async (q) => rP(await (await mf.dispatchFetch(`http://x/api/?${q}`)).json()),
  POST: async (q, b) => rP(await (await mf.dispatchFetch(`http://x/api/?${q}`,
    { method: "POST", body: JSON.stringify(b ?? {}) })).json()),
  TEXT: async (q) => (await mf.dispatchFetch(`http://x/api/?${q}`)).text(),
});

const LOG = [
  { level: "meaning", subject: "observation:migrate-a", state: "NEVER_LOOKED",
    detail: "nothing derived" },
  { level: "document", subject: "observation:migrate-b", state: "PRESENT",
    detail: "the store holds it" },
  { level: "internet", subject: null, state: "LOOKED_INDETERMINATE",
    governed: true, condition: "governor-holding-host",
    detail: "a row with NO SUBJECT AT ALL — the exact shape §3's NOT NULL would have refused" },
];

let fail = 0;
const t = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${JSON.stringify(want)}\n         got  ${JSON.stringify(got)}`}`);
  if (!ok) fail++;
};

const old = process.argv[2];
if (!old) { console.error("usage: node test/rec93-migrate-probe.mjs <pre-item-checkout>"); process.exit(2); }

/* ---- 1. THE OLD BUILD writes the store, with rows in `ai_run_log`. ---- */
let beforeText;
{
  const mf = planeAt(old);
  const { POST, TEXT } = call(mf);
  await POST(`op=promote&token=${TOK}`, {
    bundleId: BUNDLE, base: null, snapKey: "20260914T090000Z_inbox", author: "ruth",
    meta: { object_type: "inquiry", group: "believe-in-oakland", title: "Does the fold migrate?",
            current_state: "open", created: T0, last_updated: T0 },
    files: [{ path: "bundle.md", text: `---\nid: ${BUNDLE}\n---\n\n## Question\n\nDoes it?\n`,
              bytes: 60, sha256: SHA_A }],
    register: [],
  });
  const started = await POST(`op=airunopen&token=${TOK}`, {
    run: RUN, contextType: "inquiry", contextId: BUNDLE, label: "migration fixture", mode: "check",
    principalClaude: "project", principalClaudeRef: "believe-in-oakland/claude",
    skillVersion: "investigative-session@1", biasManifest: null,
    bounds: [{ bound: "fetches", allowed: 10, unit: "requests" }], leaseMs: 600000, at: T0 });
  if (started?.started !== true) throw new Error(`airunopen: ${JSON.stringify(started)}`);
  const ticked = await POST(`op=airuntick&token=${TOK}`, { run: RUN, leaseMs: 600000, log: LOG });
  if (ticked?.appended !== LOG.length)
    throw new Error(`the OLD build did not append all ${LOG.length}: ${JSON.stringify(ticked)}`);
  beforeText = await TEXT(`op=airunlog&token=${TOK}&run=${RUN}`);
  console.log(`\nOLD BUILD (${old})`);
  console.log(`  wrote ${LOG.length} ai_run_log rows; op=airunlog is ${Buffer.byteLength(beforeText)} bytes`);
  await mf.dispose();
}

/* ---- 2. THE NEW BUILD re-opens the SAME persisted bytes. #migrate runs. ---- */
{
  const mf = planeAt(fileURLToPath(new URL("../..", import.meta.url)));
  const { GET, TEXT } = call(mf);
  console.log(`\nNEW BUILD, re-opening the same persisted store — #migrate's fold runs here`);
  const afterText = await TEXT(`op=airunlog&token=${TOK}&run=${RUN}`);
  console.log(`  op=airunlog is ${Buffer.byteLength(afterText)} bytes`);

  /* CORRECTED 2026-09-17, REC-113 / IC-116 — THE COMPARISON IS UNCHANGED IN WHAT
     IT TESTS AND IS NARROWED TO KEEP TESTING IT.
     ==================================================================
     THIS PROBE'S SUBJECT IS `#migrate`: does the fold carry the OLD build's rows
     across into the new table with every value intact? That question is
     untouched by this item. What changed is that the NEW build's `op=airunlog`
     additionally PROJECTS `result_kind` / `result_ref` and STATES a per-row
     `coverage` (the READ half of D-366, accepted as additive on I3), so a raw
     text comparison against a build that predates the projection now fails for a
     reason that has nothing to do with migration.
     SO THE ADDED KEYS ARE STRIPPED — AND ONLY THEY. Stripping is not a weakening
     here: the remainder must still match BYTE FOR BYTE, which means every
     migrated value, every key and EVERY POSITION is still pinned. Exempting this
     probe, or deleting it, would have retired the only instrument that watches
     `#migrate` over a real old-build store — an exempted test is a rule nobody
     is enforcing and nobody remembers deleting.
     THE ARM THAT THE STRIP COULD HIDE IS ADDED BELOW rather than assumed away:
     the stripped text must be SHORTER than the raw one, so a strip that silently
     matched nothing is a finding instead of a free pass. */
  const ADDED_ENTRY_KEYS = ["result_kind", "result_ref", "coverage"];
  const ADDED_VOCAB_KEYS = ["coverage", "coverage_undetermined"];
  const WIRE = (v) => JSON.stringify(v, null, 1);   /* the plane's own indent */
  const strip = (text) => {
    const o = JSON.parse(text);
    const b = o.result || o;
    for (const e of b.entries || []) for (const k of ADDED_ENTRY_KEYS) delete e[k];
    for (const k of ADDED_VOCAB_KEYS) delete (b.vocabulary || {})[k];
    return WIRE(o);
  };
  const afterStripped = strip(afterText);
  t("the strip actually removed something — an arm that did not arm is a finding, and a "
  + "no-op strip would turn the pin below into a free pass",
    afterStripped.length < afterText.length, true);
  t("the migrated log answers BYTE-IDENTICALLY through op=airunlog, once REC-113's three "
  + "added keys are stripped — every MIGRATED value, key and position is unchanged",
    afterStripped === beforeText, true);

  const after = JSON.parse(afterText);
  const entries = (after.result || after).entries || [];
  t("all three rows migrated — a fold that silently dropped one would be a coverage record losing evidence",
    entries.length, LOG.length);
  t("…and the row with NO SUBJECT survived as NULL rather than being invented into something",
    entries.map((e) => e.subject),
    ["observation:migrate-a", "observation:migrate-b", null]);
  t("per-run seq is still 1,2,3 after the fold, not the store-wide rowid",
    entries.map((e) => e.seq), [1, 2, 3]);

  const stats = await GET(`op=stats&token=adm-rec93`);
  t("they are counted as folded RUN rows in the new table", stats.aiRunLog, LOG.length);
  /* CORRECTED 2026-09-18 BY REC-131 (IC-148), NEVER EXEMPTED: op=stats' log count is published as `observationsNonLead` (the log WITHOUT lead looks) and the wire carries no `observations` key — one key never carries two meanings (BOB.md rule 7), and purge's `observations` keeps the whole log. This suite writes no lead, so the figure it reads is unchanged; only the name moved. */
  t("…and `observationsNonLead` counts them too — one table, not two", stats.observationsNonLead >= LOG.length, true);

  /* THE OLD TABLE IS GONE. If it were still there, the store would be in the
     two-writers state §4.4 forbids and the next boot would migrate again. */
  const front = await GET(`op=frontier&token=adm-rec93&level=document`);
  t("the frontier answers over the migrated store without error", front.built, true);
  await mf.dispose();
}

/* ---- 3. RE-OPEN AGAIN. The migration must be idempotent — it must not run
          twice and must not duplicate a single row. ---- */
{
  const mf = planeAt(fileURLToPath(new URL("../..", import.meta.url)));
  const { GET, TEXT } = call(mf);
  const againText = await TEXT(`op=airunlog&token=${TOK}&run=${RUN}`);
  t("a SECOND boot on the new build changes nothing — the fold is not re-run and no row is duplicated",
    againText === beforeText, true);
  const stats = await GET(`op=stats&token=adm-rec93`);
  t("…and the counts did not double", stats.aiRunLog, LOG.length);
  await mf.dispose();
}

console.log(`\nrec93-migrate-probe: ${fail === 0 ? "every arm as declared" : `${fail} FAILING`}`);
process.exit(fail ? 1 : 0);
