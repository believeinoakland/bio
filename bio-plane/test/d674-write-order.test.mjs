/* NEGATIVE CONTROL: RUN 2026-09-25 (D-674 worker) by `node test/d674-write-order.control.mjs`, each arm ALONE, restored from a per-arm pristine copy in the item's pen (controlPen, outside the worktree) and verified by sha256 AND byte compare (src/store.mjs 3,471,945 B sha256 5d27fefa1c2f…); baseline 13 pass / 0 fail. REPRODUCED FIRST on origin/main 5e8a65a8 (the defect): 8 pass / 5 fail, exactly §1..§5.
   (export) `ORDER BY rowid` -> `ORDER BY created, rowid`. DECLARED §1 fails, the rest hold. RESULT 12/1 AS DECLARED — "§1 op=export lists an amendment dated before the move…".
   (gate) the same at gateFacts. DECLARED §2. RESULT 12/1 AS DECLARED — "§2 the gate's facts list…".
   (revision) #revisionKind back to `created DESC, rowid DESC`. DECLARED §3. RESULT 12/1 AS DECLARED — "§3 op=selection classifies the revision…".
   (latest) the unattended condition's latest, the same. DECLARED §4. RESULT 12/1 AS DECLARED — "§4 op=queue raises no capture-completed-unattended…".
   (started) its started back to `created, rowid`. DECLARED §5. RESULT 12/1 AS DECLARED — "§5 op=queue names as started_by…".
   (clock) THE OTHER FIX, the plane's clock into manifest.created at both INSERTs. DECLARED §6 fails, §1..§5 hold. RESULT 9/4 AS DECLARED — §6 plus the THREE FIXTURE rows that say created order differs from write order: with the clock in `created` the premise itself is gone, which is the fixture reporting its own disarming, not a leak.
   (spelling) OVER-STRICTNESS: export's `ORDER BY rowid` as `ORDER BY _rowid_`. DECLARED nothing fails. RESULT 13/0 AS DECLARED. */
/* =========================================================================
 * D-674 — THE RECORD'S ORDER IS WRITE ORDER, NEVER THE WRITER'S DATE.
 * State Rules & Consistency v1.5 §6, I-20 ("the immediately prior recorded
 * snapshot", REC-182's tie rule) and §4.7 (D-546: a move is DATED by its
 * writer's `created`, and counted in write order).
 *
 * THE DEFECT: `manifest.created` is the WRITER's `meta.last_updated` — kept so
 * on purpose, because C-12.1 compares a document's live last_updated against
 * earlier entries' created and a signed ratification backdates last_updated to
 * the transition instant. But five readers ORDERED the manifest by it, so any
 * caller could steer a promotion out of write order by dating it earlier:
 *   exportManifest's `promotions`          (op=export)
 *   gateFacts' `manifest`                  (do/gatefacts, the hop op=ratify makes)
 *   #revisionKind's "latest"               (op=selection's drift.revised[].class)
 *   #conditionsCaptureUnattended's latest  (op=queue's capture-completed-unattended)
 *   #conditionsCaptureUnattended's started (the same condition's started_by)
 * D-674 orders all five by `rowid`, the store's write order, and leaves
 * `created` what it always was: the writer's date, published beside the order.
 *
 * WHAT THIS SUITE HOLDS THE PLANE TO — every date below is chosen so that
 * `created` order and write order DIFFER (the FIXTURE assertions say they do):
 *   §1 op=export lists an amendment dated BEFORE the move it follows AFTER it.
 *   §2 the gate's facts do the same (read at do/gatefacts; no op serves them).
 *   §3 op=selection classifies a revision by the promotion WRITTEN last: an
 *      authored amendment backdated under a mechanical revision reads authored.
 *   §4 op=queue raises no capture-completed-unattended when a PERSON wrote last,
 *      whatever date that person gave the revision.
 *   §5 op=queue names as started_by the person who wrote FIRST, not the one
 *      who dated their revision earliest.
 *   §6 `created` still carries the writer's date, unchanged (C-12.1 rests on it).
 *
 * HOW A LIAR PASSES, and which arm catches it:
 *   (1) any reader ordering by `created` again — §1..§5 by name (the control).
 *   (2) the plane's clock stamped into `created` — §6.
 *   (3) a fixture whose dates run WITH write order — the FIXTURE assertions.
 * ========================================================================= */
import { withSurfacingRun } from "./surfacing-run.mjs";   /* REC-171: a deploy token's questions are surfaced inside a run it holds */
import "./stdio.mjs";                 /* D-282: a suite's own exit must not discard the suite's own output */
import "./sandbox.mjs";               /* D-186: owns $TMPDIR for this process and removes it on exit */
import { Miniflare } from "miniflare";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";

/* D-620 (stated-null sweep, corrected at the c23-batch30 union): a stated null is told from a dropped key. */
import { statedJSON } from "./stated.mjs";
const IDX = fileURLToPath(new URL("../src/index.mjs", import.meta.url));
const ADM = "adm-d674", MACHINE = "mem-d674";
const mf = withSurfacingRun(new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: IDX, script: readFileSync(IDX, "utf8"),
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
  r2Buckets: ["CAPTURES", "PUBLISHED"],
  bindings: { ADMIN_TOKEN: ADM, MEMBER_TOKEN: MACHINE, VERSION: "test", TASK_DRAIN_DELAY_MS: "600000" },
}));

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = statedJSON(got) === statedJSON(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${statedJSON(want)}\n         got  ${statedJSON(got)}`}`);
  ok ? pass++ : fail++;
};
const sha = (v) => createHash("sha256").update(v).digest("hex");
const rP = (r) => (r && typeof r === "object" && "result" in r) ? r.result : r;
const POST = async (q, body) => rP(await (await mf.dispatchFetch(`http://x/api/?${q}`,
  { method: "POST", body: JSON.stringify(body ?? {}) })).json());
const GET = async (q) => rP(await (await mf.dispatchFetch(`http://x/api/?${q}`)).json());
const DOGET = async (path) => {
  const ns = await mf.getDurableObjectNamespace("STORE");
  return rP(await (await ns.get(ns.idFromName("bio")).fetch(`http://do/${path}`)).json());
};
const E = encodeURIComponent;
const must = (label, r) => { if (!r || r.ok === false) throw new Error(`${label}: ${JSON.stringify(r).slice(0, 900)}`); return r; };

/* The dates. CREATED < BACKDATED < MOVED: every amendment below is WRITTEN after the move and DATED before it. */
const CREATED = "2026-07-01T00:00:00Z", BACKDATED = "2026-07-02T00:00:00Z", MOVED = "2026-07-03T00:00:00Z";

const infoMd = (id, state, updated, summary) => ["---",
  `id: ${id}`, "object_type: information", "schema: information@1",
  `title: "Info ${id}"`, `current_state: ${state}`, "prior_state: null",
  `created: "${CREATED}"`, `last_updated: "${updated}"`,
  "produced_by:", "  mode: agent", "  capability_tier: high",
  "group: believe-in-oakland", "references: []", "state_history: []",
  "annotations_open: 0",
  "reeval_pending:", "  flag: false", "  since: null", "  source: null",
  "visuals: []", "source_status: unchanged",
  "---", "", "## Summary", "", summary, "",
  "## Provenance Notes", "", "## Session Log", "", "## Review Notes", ""].join("\n");
const promote = async (tok, id, { state = "collected", updated, summary, base, snapKey, extra = {} }) => {
  const text = infoMd(id, state, updated, summary);
  return POST(`op=promote&token=${tok}`, {
    bundleId: id, base, snapKey, ...extra,
    files: [{ path: "bundle.md", text, bytes: text.length, sha256: sha(text) }],
    register: base === null
      ? [{ path: "snapshots/doc.bin", sha256: sha(`capture-of-${id}`), encoding: "binary", bytes: 10 }] : [],
    meta: { object_type: "information", group: "believe-in-oakland", title: `Info ${id}`,
            current_state: state, created: CREATED, last_updated: updated } });
};
const shaOf = async (id) => ((await GET(`op=list&token=${ADM}&limit=1000`)) || {}).bundles
  ?.find((b) => b.bundle_id === id)?.bundle_sha ?? null;
/* Keys run WITH write order, so neither a key tiebreak nor a key sort can pass for write order here. */
const WRITTEN = ["d674-1", "d674-2", "d674-3"];
const byCreated = (rows) => [...rows].sort((a, b) => (a.created < b.created ? -1 : a.created > b.created ? 1 : 0));

try {

/* ====================================================== FIXTURE: a move, then a backdated amendment */
const MOVE = "INFO-2026-6740-backdated";
must("create", await promote(ADM, MOVE, { updated: CREATED, summary: "A captured document.", base: null, snapKey: WRITTEN[0] }));
must("move", await promote(ADM, MOVE, { state: "verified", updated: MOVED, summary: "A captured document, verified.",
                                         base: await shaOf(MOVE), snapKey: WRITTEN[1] }));
must("amend (backdated)", await promote(ADM, MOVE, { state: "verified", updated: BACKDATED,
                                         summary: "A captured document, verified, then amended.",
                                         base: await shaOf(MOVE), snapKey: WRITTEN[2] }));

/* =========================================== §1 op=export: the amendment reads AFTER the move */
const exported = (await POST(`op=export&token=${ADM}`))?.bundles?.find((b) => b.bundle_id === MOVE)?.promotions ?? [];
console.log(`  corpus: ${MOVE}, written ${WRITTEN.join(" -> ")}, dated ${exported.map((p) => p.created).join(" / ")}`);
t("FIXTURE: op=export answers three promotions, and ordering them by created would NOT be write order",
  [exported.length, byCreated(exported).map((p) => p.snap_key).join() !== WRITTEN.join()], [3, true]);
t("§1 op=export lists an amendment dated before the move it follows AFTER that move (write order)",
  exported.map((p) => p.snap_key), WRITTEN);

/* ===================================== §2 the gate's facts: the amendment reads AFTER the move */
const gated = (await DOGET(`gatefacts?id=${E(MOVE)}`))?.manifest ?? [];
t("FIXTURE: the gate's facts answer three manifest rows", gated.length, 3);
t("§2 the gate's facts list an amendment dated before the move it follows AFTER that move (write order)",
  gated.map((m) => m.snap_key), WRITTEN);

/* ============================================ §6 created is still the WRITER's date, unchanged */
t("§6 created is still the writer's own last_updated on every promotion (C-12.1 compares against it)",
  WRITTEN.map((k) => exported.find((p) => p.snap_key === k)?.created ?? null), [CREATED, MOVED, BACKDATED]);

/* =============== the roster: two people and the machine credential (MEMBER_TOKEN, author token:member) */
const member = async (id, role = "member") => {
  const add = await POST(`op=memberadd&token=${ADM}`,
    { memberId: id, cover: `cover for ${id}`, role, capabilities: ["contribute"] });
  if (!add?.invite) throw new Error(`memberadd ${id}: ${JSON.stringify(add)}`);
  must(`enroll ${id}`, await POST("op=enroll", { invite: add.invite, handle: id, password: `${id}-passphrase-1` }));
  const lg = await POST("op=login", { role: `member:${id}`, password: `${id}-passphrase-1` });
  if (!lg?.token) throw new Error(`login ${id}: ${JSON.stringify(lg)}`);
  return lg.token;
};
await member("ruth", "admin");           /* ADMINS_FIRST: two administrators before an ordinary member */
await member("gus", "admin");
const carol = await member("carol");
const dave = await member("dave");

/* ======== §3 + §4: a person's document, a mechanical revision, then the person back with a backdated date */
const BACK = "INFO-2026-6741-person-back";
must("carol creates", await promote(carol, BACK, { updated: CREATED, summary: "Carol's document.", base: null, snapKey: WRITTEN[0] }));
const handle = must("select", await POST(`op=select&token=${ADM}&kind=enumerated`, { ids: [BACK] })).handle;
must("the machine revises", await promote(MACHINE, BACK, { updated: MOVED, summary: "Carol's document, ticked.",
  base: await shaOf(BACK), snapKey: WRITTEN[1], extra: { writer: "mechanical", operation: "monitor-tick" } }));
must("carol comes back (backdated)", await promote(carol, BACK, { updated: BACKDATED, summary: "Carol's document, finished by Carol.",
  base: await shaOf(BACK), snapKey: WRITTEN[2] }));
const backRows = (await POST(`op=export&token=${ADM}`))?.bundles?.find((b) => b.bundle_id === BACK)?.promotions ?? [];
t("FIXTURE: carol wrote first and last, the machine between; by created the machine would read last",
  [WRITTEN.map((k) => backRows.find((p) => p.snap_key === k)?.author ?? null), byCreated(backRows).at(-1)?.author],
  [["carol", "token:member", "carol"], "token:member"]);

const sel = await GET(`op=selection&token=${ADM}&handle=${E(handle)}`);
t("FIXTURE: op=selection reports the one revised member", (sel?.drift?.revised ?? []).map((r) => r.bundleId), [BACK]);
t("§3 op=selection classifies the revision by the promotion WRITTEN last — authored, not the backdated-over mechanical one",
  sel?.drift?.revised?.[0]?.class ?? null, "authored");

const UNATT = (id) => `CONDITION::capture-completed-unattended::${id}`;
const queue = async (tok) => (await GET(`op=queue&token=${tok}`))?.items ?? null;
const qBack = await queue(carol);
t("FIXTURE: op=queue answers carol a feed", Array.isArray(qBack), true);
t("§4 op=queue raises no capture-completed-unattended when a person wrote LAST, whatever date she gave it",
  (qBack ?? []).some((i) => i.id === UNATT(BACK)), false);

/* =============== §5: two people, the SECOND backdating under the first, then the machine last */
const START = "INFO-2026-6742-who-started";
must("carol creates", await promote(carol, START, { updated: MOVED, summary: "Carol's document.", base: null, snapKey: WRITTEN[0] }));
must("dave amends (backdated)", await promote(dave, START, { updated: CREATED, summary: "Carol's document, with Dave's note.",
  base: await shaOf(START), snapKey: WRITTEN[1] }));
must("the machine finishes it", await promote(MACHINE, START, { updated: "2026-07-04T00:00:00Z", summary: "Carol's document, completed.",
  base: await shaOf(START), snapKey: WRITTEN[2], extra: { writer: "mechanical", operation: "monitor-tick" } }));
const startRows = (await POST(`op=export&token=${ADM}`))?.bundles?.find((b) => b.bundle_id === START)?.promotions ?? [];
t("FIXTURE: carol wrote first; by created dave would read first",
  [startRows.find((p) => p.snap_key === WRITTEN[0])?.author ?? null, byCreated(startRows)[0]?.author], ["carol", "dave"]);
const unatt = (await queue(carol) ?? []).find((i) => i.id === UNATT(START));
t("FIXTURE: op=queue raises capture-completed-unattended for the machine-finished document", !!unatt, true);
t("§5 op=queue names as started_by the person who WROTE first, not the one who dated a revision earliest",
  [unatt?.basis?.started_by ?? null, unatt?.basis?.started_snap_key ?? null], ["carol", WRITTEN[0]]);

} catch (e) {
  console.log(`  FAIL  the suite threw before its foot: ${e && e.stack ? e.stack : e}`);
  fail++;
}
await mf.dispose();
console.log(`\nd674-write-order: ${pass} pass, ${fail} fail`);
process.exit(fail ? 1 : 0);
