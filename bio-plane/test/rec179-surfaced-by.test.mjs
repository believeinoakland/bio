/* NEGATIVE CONTROL: DECLARED HERE, RUN BY `test/rec179-surfaced-by.control.mjs` — deliberately NOT a `.test.mjs`, because it patches a COPY of `src/` while it runs and the battery must not discover it. Re-run in one step from `bio-plane/`: `node test/rec179-surfaced-by.control.mjs [arm]`. RESULTS, RUN 2026-09-23 by the REC-179 worker (CONDUCT #16's, cloud) on 0e7cc03e + this item (real src/index.mjs 721,147 B sha256 ad0a07edbfbd…, src/store.mjs 2,858,881 B 3d0a1bdee0d5… (re-run after the catch was removed, same seven results), checks/bio-checks.mjs 832,450 B 7daa5d4eb83e…, untouched: YES), ALL SEVEN ARMS AS DECLARED AT THE FIRST RUN: baseline -> 22/0 · **drop-comparison — THE ROW'S CONTROL, `if (was !== now)` made `if (false)` -> 7/15: every flip arm BY NAME (ARM F1, F2, F2b, F3, F4, F5, F6 — each flip LANDS and its byte-identity fails beside it), every KEEP, fixture and witness arm green** · one-direction (refuse only agent -> human) -> 15/7: ARM F2, F2b and F5 by name · line-scan (the first `surfaced_by:` line's raw text instead of the catalog's parser) -> 18/4: ARM F3 (the second-line flip lands) AND ARM K2 (the quoted respelling is refused), with F1's value-naming line · exempt-replay (`&& !pkg.replay`) -> 20/2: ARM F4 by name · allow-drop (absent is not a value) -> 19/3: ARM F5 by name · same-rule-respelt (over-strictness, `![was].includes(now)`) -> 22/0.
 * =========================================================================
 * REC-179 — A REVISION CARRIES `surfaced_by` FORWARD (C-66.5, SURFACED_BY_REWRITTEN).
 *
 * `INVESTIGATIVE-SESSION.md` §11 item 5, "Rule 2's reach" (BOB #30, 2026-09-23): `surfaced_by` records the SURFACING
 * ACT, decided at the trust boundary — D-78's restamp in `index.mjs` `op=promote`, whose own comment states that "a
 * revision carries the document's value forward, so the origin fact is not rewritten by whoever later edits it".
 *
 * WHAT WAS WRONG, measured on the unedited tree (`0e7cc03e`): the restamp runs only when `base === null`, and nothing
 * compared a revision's value with the current version's (`store.mjs` and C-2.8 check only that it is `agent` or
 * `human`), so a revision relabelled an assistant's question `human`, or a member's `agent`, and landed `ok: true` —
 * and REC-171's surfacing row then contradicted the bundle it describes.
 *
 * HOW A LIAR PASSES THE OBVIOUS TEST, stated before what this checks: (1) refuse only agent -> human — ARM F1 and F2
 * drive BOTH directions, each by its own name; (2) compare by a LINE SCAN of `surfaced_by:` a caller can step around —
 * ARM F3 keeps the first line and adds a second the catalog's parser reads (the parser takes the LAST key), and ARM K2
 * RESPELLS the same value in quotes and must LAND (over-strictness); (3) exempt a revision that says `replay: true` —
 * a caller's assertion on a revision, which the control plane verifies only for a creation (REC-173) — ARM F4;
 * (4) let a revision DROP the field and a later one supply it — ARM F5; (5) refuse AFTER a write — every refused arm
 * reads the whole op=image digest (live files, history, manifest), bundle.md's SHA-256 and the head before and after, and demands them
 * unchanged; (6) a fence tighter than the rule — ARM K1 keeps the value under a real edit and must land, from both a
 * session and a deploy token, for an `agent` question and a `human` one.
 *
 * WHAT THIS SUITE CANNOT SEE: (i) one isolate, one store per namespace; (ii) no surface — it asserts what the plane
 * SENDS; (iii) the CREATION: D-78's restamp and REC-173's replay decide the creation's value and are other suites'
 * (`rec171-surface-token`, `rec173-migration-replay`); (iv) a migration REVISION whose Drive-era history changes the
 * value between revisions is refused by this rule too — whether the Drive corpus holds any such history is not
 * measured here (the corpus is not in the tree), and REC-173 verifies only a creation as a replay.
 * ========================================================================= */
import "./stdio.mjs";                 /* D-282: a suite's own exit must not discard the suite's own output */
import "./sandbox.mjs";               /* D-186: owns $TMPDIR for this process and removes it on exit */
import { Miniflare } from "miniflare";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { join } from "node:path";
import { withSurfacingRun } from "./surfacing-run.mjs";

/* The control driver points this at an armed COPY of the sources. */
const SRC_DIR = process.env.REC179_SRC || fileURLToPath(new URL("../src", import.meta.url));
const IDX = join(SRC_DIR, "index.mjs");
const { SURFACE_CHECKS } = await import(join(SRC_DIR, "..", "checks", "bio-checks.mjs"));

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${JSON.stringify(want)}\n         got  ${JSON.stringify(got)}`}`);
  ok ? pass++ : fail++;
};

const ADM = "adm-rec179", MEM = "mem-rec179", PRB = "prb-rec179";
const mf = withSurfacingRun(new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: IDX, script: readFileSync(IDX, "utf8"),
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
  r2Buckets: ["CAPTURES", "PUBLISHED"],
  bindings: { ADMIN_TOKEN: ADM, MEMBER_TOKEN: MEM, PROBE_TOKEN: PRB, VERSION: "test" },
}));

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

/* Every call NAMES its store (CLAUDE.md §5). This isolate's `bio` is a throwaway store. */
const S = "store=bio";
const ADMIN = `token=${ADM}&${S}`;

const member = async (id, caps, role = "member") => {
  const add = await POST(`op=memberadd&token=${ADM}`, { memberId: id, cover: `cover for ${id}`, role, capabilities: caps });
  if (!add?.invite) throw new Error(`memberadd ${id}: ${JSON.stringify(add)}`);
  const en = await POST("op=enroll", { invite: add.invite, handle: id, password: `${id}-passphrase-1` });
  if (!en?.ok) throw new Error(`enroll ${id}: ${JSON.stringify(en)}`);
  const lg = await POST("op=login", { role: `member:${id}`, password: `${id}-passphrase-1` });
  if (!lg?.token) throw new Error(`login ${id}: ${JSON.stringify(lg)}`);
  return `token=${lg.token}&${S}`;
};
const RUTH = await member("ruth", ["contribute", "publish", "create_projects"], "admin");

const NOW = "2026-09-23T00:00:00Z";
const inquiryMd = (id, surfacedLines, note = "") => ["---",
  `id: ${id}`, "object_type: inquiry", "schema: inquiry@1",
  `title: "Question ${id}"`, "current_state: open", "prior_state: null",
  `created: "${NOW}"`, `last_updated: "${NOW}"`,
  "produced_by:", "  mode: agent", "  capability_tier: high",
  "group: believe-in-oakland", "references: []", "state_history: []",
  "annotations_open: 0",
  "reeval_pending:", "  flag: false", "  since: null", "  source: null",
  "visuals: []", ...surfacedLines, 'disposition_reason: ""',
  "---", "", "## Question", "", `Did ${id} happen?`, "", "## What It Rests On", "",
  "## Conclusion", "", "## What Would Falsify This", "", "## Session Log", "", note,
  "## Review Notes", ""].join("\n");
let seq = 0;
const pkg = (id, base, md) => ({
  bundleId: id, base,
  snapKey: `20260923T1700${String(++seq).padStart(2, "0")}Z_rec179aa`,
  meta: { object_type: "inquiry", group: "believe-in-oakland", title: `title for ${id}`,
          current_state: "open", created: NOW, last_updated: NOW },
  files: [{ path: "bundle.md", text: md, bytes: Buffer.byteLength(md), sha256: sha(md) }],
  register: [],
});
let idSeq = 0;
const freshId = () => `INQ-2026-9179-surfaced-${++idSeq}`;

/* THE WITNESS: the WHOLE image op=image serves (live files, every history snapshot and the manifest the store
   derives), digested, beside the projection's head — so a refusal that wrote a snapshot or a manifest row before
   returning moves the digest even when the live bundle.md did not move. */
const image = async (id) => (await GET(`op=image&${ADMIN}&id=${E(id)}`)) ?? null;
const held = async (id) => { const img = await image(id); const md = img && img["bundle.md"]; return typeof md === "string" ? md : ""; };
const head = async (id) => (await GET(`op=projection&${ADMIN}&id=${E(id)}`))?.bundle_sha ?? null;
const witness = async (id) => {
  const img = await image(id);
  const md = img && typeof img["bundle.md"] === "string" ? img["bundle.md"] : "";
  return { image_sha: sha(JSON.stringify(img)), image_paths: img ? Object.keys(img).length : -1, md_sha: sha(md),
           head: await head(id), surfaced: /\nsurfaced_by: (\S+)\n/.exec(md)?.[1] ?? null };
};

/* A question created by `who` (a session or a deploy token), whose landed bytes carry what D-78 decided. */
const create = async (who, wrote = "human") => {
  const id = freshId();
  const r = await POST(`op=promote&${who}`, pkg(id, null, inquiryMd(id, [`surfaced_by: ${wrote}`])));
  if (!r?.ok) throw new Error(`create ${id}: ${JSON.stringify(r).slice(0, 400)}`);
  return { id, md: await held(id), sha: await head(id) };
};
/* A REAL edit (a session-log line) plus whatever `surfaced_by` lines the arm writes. */
const revise = (who, q, surfacedLines, extra = {}) =>
  POST(`op=promote&${who}`, { ...pkg(q.id, q.sha, inquiryMd(q.id, surfacedLines, `- revised by REC-179 arm ${seq}`)), ...extra });

const C = SURFACE_CHECKS.SURFACED_BY_REWRITTEN;
const refusedByName = (r) => [r?.ok, r?.reason, r?.code, r?.check, r?.translation === C?.translation && typeof C?.translation === "string"];
const REFUSED = [false, "SURFACED_BY_REWRITTEN", "SURFACED_BY_REWRITTEN", "C-66.5", true];

/* EVERY ARM ON ITS OWN QUESTION, so a control that lets one flip land cannot move a later arm's base (CAS_STALE) and
   fail it for a second cause. An assistant's question: a deploy token writing `human`, restamped `agent` by D-78
   (inside the fixture's run, `surfacing-run.mjs`). A member's: a session writing `agent`, restamped `human`. */
const agentQuestion = () => create(ADMIN, "human");
const humanQuestion = () => create(RUTH, "agent");

console.log("\n--- FIXTURE: the server decided each creation's value ---");
{
  const a = await agentQuestion(), h = await humanQuestion();
  t("FIXTURE: D-78 decided each creation — the deploy token's question landed `agent`, the session's `human` — so every "
    + "arm below starts from a value the SERVER wrote",
    [(await witness(a.id)).surfaced, (await witness(h.id)).surfaced], ["agent", "human"]);
  t("FIXTURE: the catalog row exists and carries a canned translation (DEC-49)",
    [C?.check, typeof C?.translation === "string" && C.translation.length > 40], ["C-66.5", true]);
}

console.log("\n--- FLIPS: each direction refused by name, the record unchanged ---");
{
  const q = await agentQuestion(), before = await witness(q.id);
  t("WITNESS REACH: the image a refusal is compared over is not empty — it holds bundle.md and a head",
    [before.image_paths > 0, before.md_sha !== sha(""), typeof before.head === "string"], [true, true, true]);
  const r = await revise(RUTH, q, ["surfaced_by: human"]);
  t("ARM F1 (AGENT -> HUMAN): a member's session revising an assistant's question to `surfaced_by: human` is refused "
    + "SURFACED_BY_REWRITTEN (C-66.5) with its canned translation", refusedByName(r), REFUSED);
  t("ARM F1: it names both values", [r?.current, r?.revision], ['"agent"', '"human"']);
  t("ARM F1: the bundle is BYTE-IDENTICAL after — whole image, bundle.md and head unchanged", await witness(q.id), before);
}
{
  const q = await humanQuestion(), before = await witness(q.id);
  const r = await revise(ADMIN, q, ["surfaced_by: agent"]);
  t("ARM F2 (HUMAN -> AGENT): a deploy token revising a member's question to `surfaced_by: agent` is refused "
    + "SURFACED_BY_REWRITTEN (C-66.5) with its canned translation", refusedByName(r), REFUSED);
  t("ARM F2: the bundle is BYTE-IDENTICAL after", await witness(q.id), before);
}
{
  const q = await humanQuestion(), before = await witness(q.id);
  const r = await revise(RUTH, q, ["surfaced_by: agent"]);
  t("ARM F2b (HUMAN -> AGENT, by a session): refused by name too — the rule is the value, not the caller",
    refusedByName(r), REFUSED);
  t("ARM F2b: the bundle is BYTE-IDENTICAL after", await witness(q.id), before);
}
{
  const q = await agentQuestion(), before = await witness(q.id);
  const r = await revise(RUTH, q, ["surfaced_by: agent", "surfaced_by: human"]);
  t("ARM F3 (THE LINE-SCAN LIAR): a revision keeping the first `surfaced_by: agent` line and adding a second "
    + "`surfaced_by: human` — which the catalog's parser reads — is refused by name", refusedByName(r), REFUSED);
  t("ARM F3: the bundle is BYTE-IDENTICAL after", await witness(q.id), before);
}
{
  const q = await agentQuestion(), before = await witness(q.id);
  const r = await revise(ADMIN, q, ["surfaced_by: human"], { replay: true });
  t("ARM F4 (THE REPLAY LIAR): a revision saying `replay: true` is refused by name — on a revision that is the "
    + "caller's word, never a verified replay", refusedByName(r), REFUSED);
  t("ARM F4: the bundle is BYTE-IDENTICAL after", await witness(q.id), before);
}
{
  const q = await agentQuestion(), before = await witness(q.id);
  const r = await revise(RUTH, q, []);
  t("ARM F5 (DROP): a revision that omits `surfaced_by` is refused by name — dropping the origin would let a later "
    + "revision supply a different one", refusedByName(r), REFUSED);
  t("ARM F5: it names the absence", r?.revision, "absent");
  t("ARM F5: the bundle is BYTE-IDENTICAL after", await witness(q.id), before);
}

console.log("\n--- KEEPS: a revision that carries the value forward lands ---");
{
  const q = await agentQuestion(), before = await witness(q.id);
  const r = await revise(RUTH, q, ["surfaced_by: agent"]);
  const after = await witness(q.id);
  t("ARM K1 (KEEP, agent, by a session): a real edit keeping `surfaced_by: agent` LANDS, and the held bytes still "
    + "say `agent`", [r?.ok, after.surfaced], [true, "agent"]);
  t("WITNESS SENSITIVITY: the same witness MOVES on a landed revision — image digest, image paths (a history "
    + "snapshot) and head — so its stillness after a refusal is a measurement, not an instrument that cannot move",
    [after.image_sha !== before.image_sha, after.image_paths > before.image_paths, after.head !== before.head],
    [true, true, true]);
  q.sha = after.head;
  const r2 = await revise(RUTH, q, ["surfaced_by: human"]);
  t("ARM F6 (FLIP AFTER A LANDED REVISION): the value carried forward is the one compared — refused by name",
    refusedByName(r2), REFUSED);
}
{
  const q = await humanQuestion();
  const r = await revise(ADMIN, q, ["surfaced_by: human"]);
  const after = await witness(q.id);
  t("ARM K1b (KEEP, human, by a deploy token): a real edit keeping `surfaced_by: human` LANDS",
    [r?.ok, after.surfaced, after.head !== q.sha], [true, "human", true]);
}
{
  const q = await humanQuestion();
  const r = await revise(RUTH, q, ['surfaced_by: "human"']);
  t("ARM K2 (OVER-STRICTNESS — a respelling of the same value): `surfaced_by: \"human\"` in quotes is the same value "
    + "to the catalog's parser, and LANDS", r?.ok, true);
}

} catch (e) {
  console.error("SUITE ERROR", e && e.stack || e);
  fail++;
} finally {
  await mf.dispose();
}
/* THE FOOT: a TypeError inside an assertion ends the module while the tally reads clean (WORKER.md). */
console.log(`\nrec179-surfaced-by: ${pass} pass, ${fail} fail`);
process.exit(fail ? 1 : 0);
