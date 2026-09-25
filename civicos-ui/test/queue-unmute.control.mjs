/* UI-97 — the negative control for `queue-unmute.test.mjs`. Run: `node civicos-ui/test/queue-unmute.control.mjs`.
 *
 * NOT a `.test.mjs`: it runs the suite once per arm, and `civicos-ui/test/run.mjs` discovers by filename.
 * IT NEVER EDITS `app.html`. Each arm is ONE splice applied to the EXTRACTED script, written into the session
 * scratchpad's own temp directory and handed to the suite through `UI97_APP_SRC`, so there is nothing to restore
 * and the worktree is never made dirty (BOB #32, 2026-09-24: a scratch file inside a worktree is not inert).
 * Each arm is armed ALONE with every other defence held open, and each splice is asserted to have matched
 * EXACTLY ONCE — an arm that did not arm is a finding, not a pass.
 *
 * DECLARED BEFORE ARMING:
 *
 *   baseline    — nothing armed. MUST be GREEN, 19/0. It is the row that tells four working arms from four
 *                 broken ones, and this file has one because a harness whose every arm reports the same thing
 *                 cannot be told from a harness that armed nothing (WORKER.md).
 *
 *   noflagitem  — THE ROW'S OWN ARM: `queueUnmuteItem` sends `{ item }` and omits `unmute: true`.
 *                 The plane's item form is an idempotent UPSERT, so the undo silently RE-MUTES.
 *                 MUST FAIL, by name: "ONE call for the undo, and its body is exactly { item, unmute:true }…",
 *                 "ACCEPTS: the unmuted item REACHES THE MEMBER AGAIN…", "READ BACK: the record agrees…" and
 *                 §3's "and exactly TWO of them carried `unmute`…".
 *                 MUST NOT FAIL: section 0, section 2 (the case form is untouched, and its item is a different
 *                 one), §3's four-calls arm, and the ben arms — nobody else's feed moves either way.
 *
 *   noflagcase  — `queueUnmuteCase` sends `{ case, kinds }` and omits `unmute: true`. The case form UNIONS on a
 *                 repeat, so the undo re-mutes exactly what it was meant to release.
 *                 MUST FAIL, by name: "ONE call for the case undo, body exactly { case, kinds, unmute:true }…",
 *                 "ACCEPTS: the kind reaches ann again…", "READ BACK: the record agrees — op=queue lists the
 *                 finding…" and §3's "exactly TWO of them carried `unmute`".
 *                 MUST NOT FAIL: section 1 in full.
 *
 *   noreport    — the REPORT draws no undo controls at all (`queueMuteReportHtml`'s undo block is skipped).
 *                 This is the control for the CONTROL: a member with no way back is the state this item found.
 *                 MUST FAIL, by name: "and the REPORT carries the undo…" and "and the report carries a per-case
 *                 undo naming the case AND the kinds it can see…".
 *                 MUST NOT FAIL: every arm that calls the act directly — the suite's DOM stub fires no clicks,
 *                 so the round trips still run. That is the blind spot this arm MEASURES rather than hides, and
 *                 it is why the WIRING of both attributes is asserted statically in `notifications.test.mjs` §2
 *                 and in `member-respect.test.mjs` ARM 4d.
 *
 *   overstrict  — OVER-STRICTNESS: the flag is written in a spelling no arm anticipated (`unmute: Boolean(1)` in
 *                 both acts), which is CORRECT work. MUST STAY GREEN — an arm that fails here would mean the
 *                 suite is pinning a spelling rather than the behaviour.
 *
 * MEASURED RESULT: written into this header by the session that runs it (see the run line below).
 * RUN 2026-09-24 (UI-97 worker), `node civicos-ui/test/queue-unmute.control.mjs`:
 *   baseline    exit 0 · 19 pass / 0 fail.
 *   noflagitem  exit 1 · 15/4 — the four declared arms, and no others.
 *   noflagcase  exit 1 · 15/4 — the four declared arms, and no others.
 *   noreport    exit 1 · 17/2 — the two declared arms, and no others.
 *   overstrict  exit 0 · 19/0 — GREEN, as declared.
 */
import "../../bio-plane/test/stdio.mjs";   /* D-282: a file that exits flushes its own tally */
import fs from "fs";
import os from "os";
import path from "path";
import { execFileSync } from "child_process";
import { appScript } from "./extract.mjs";
import { ANCHOR_DRY, anchorPatch, anchorEach } from "../../bio-plane/scripts/anchortable.mjs";

const SUITE = new URL("./queue-unmute.test.mjs", import.meta.url).pathname;
const BASE = appScript();
const ITEM_SEND = `    const res = await recPostR("queuemute", { item: itemId, unmute: true });`;
const CASE_SEND = `    const res = await recPostR("queuemute", { case: caseId, kinds: named, unmute: true });`;
function one(s, from, to){
  /* M0-197: read, never armed — the script is extracted from app.html, so the anchor is counted there. */
  if (ANCHOR_DRY) return (anchorPatch(new URL("../app.html", import.meta.url).pathname, from, to), s);
  const n = s.split(from).length - 1;
  if (n !== 1) throw new Error(`ARM DID NOT ARM: anchor occurs ${n} time(s): ${from.slice(0, 90)}`);
  return s.replace(from, to);
}
const ARMS = {
  baseline: (s) => s,
  noflagitem: (s) => one(s, ITEM_SEND,
    `    const res = await recPostR("queuemute", { item: itemId });`),
  noflagcase: (s) => one(s, CASE_SEND,
    `    const res = await recPostR("queuemute", { case: caseId, kinds: named });`),
  noreport: (s) => one(s, `  if(PLANE.me && PLANE.me.session){`, `  if(false){`),
  overstrict: (s) => one(one(s, ITEM_SEND,
    `    const res = await recPostR("queuemute", { item: itemId, unmute: Boolean(1) });`), CASE_SEND,
    `    const res = await recPostR("queuemute", { case: caseId, kinds: named, unmute: Boolean(1) });`),
};
anchorEach(ARMS, (arm) => arm(BASE));   /* M0-197: tools/anchordrift.mjs reads the arms' anchors; a no-op otherwise */
const only = process.argv[2];
/* The scratch pen is the session scratchpad's own temp root, NEVER the worktree. */
const dir = fs.mkdtempSync(path.join(os.tmpdir(), "ui97-ctl-"));
const results = [];
try {
  for (const [name, arm] of Object.entries(ARMS)) {
    if (only && only !== name) continue;
    const src = arm(BASE);
    if (name !== "baseline" && src === BASE) throw new Error(`ARM ${name} changed nothing`);
    const file = path.join(dir, `${name}.js`);
    fs.writeFileSync(file, src);
    let out = "", code = 0;
    try { out = execFileSync("node", [SUITE], { env: { ...process.env, UI97_APP_SRC: file },
      encoding: "utf8", stdio: ["ignore", "pipe", "pipe"], maxBuffer: 64 * 1024 * 1024 }); }
    catch (e) { out = String(e.stdout || ""); code = e.status ?? -1; }
    /* The SUITE'S OWN tally line, never the wrapper's exit: a run that ends without it did not finish,
       and is reported as -1 rather than 0 (WORKER.md). */
    const tally = (/queue-unmute: (\d+) pass, (\d+) fail/.exec(out) || [null, "-1", "-1"]).slice(1).map(Number);
    const fails = [...out.matchAll(/^\s*FAIL\s+(.*)$/gm)].map((m) => m[1].slice(0, 120));
    results.push({ name, code, tally, fails });
    console.log(`\n[${name}] exit ${code} · ${tally[0]} pass / ${tally[1]} fail`);
    for (const f of fails) console.log(`    FAIL ${f}`);
  }
} finally {
  fs.rmSync(dir, { recursive: true, force: true });
}
const base = results.find((r) => r.name === "baseline");
const GREEN = new Set(["baseline", "overstrict"]);
const bad = results.filter((r) => GREEN.has(r.name) !== (r.code === 0));
console.log(`\ncontrol: ${results.length} arm(s) run; ${bad.length ? "NOT AS DECLARED: " + bad.map((r) => r.name).join(", ")
  : "every arm as declared"}${base ? "" : " (no baseline in this run)"}`);
process.exit(bad.length ? 1 : 0);
