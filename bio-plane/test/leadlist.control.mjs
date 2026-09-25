/* D-681 — THE NEGATIVE CONTROL for `leadlist.test.mjs`, re-runnable in one step from `bio-plane/`:
 *
 *     node test/leadlist.control.mjs        baseline, then each arm ALONE
 *
 * Deliberately NOT a `.test.mjs`: it EDITS src/store.mjs while it runs, so the battery must not discover it.
 *
 * ARMS, each DECLARED before it runs:
 *   bysubject   THE ROW'S OWN — the list GROUPED BY SUBJECT again: a lead is dropped when another readable lead in
 *               the same words was looked at later, which is `#frontierInternet`'s `looked` grouping.
 *               MUST FAIL "SAME WORDS, TWO LEADS". MUST HOLD "a lead nobody followed", "NO EXISTENCE LEAK",
 *               "an over-ask is answered at the ceiling".
 *   wide        the fence dropped: every lead listed to any member. MUST FAIL "NO EXISTENCE LEAK",
 *               "vera (invited, never joined) still lists nothing". MUST HOLD "SAME WORDS, TWO LEADS".
 *   noshare     the share arm of the fence dropped (author only). MUST FAIL "AFTER the share, sam (joined)".
 *               MUST HOLD "SAME WORDS, TWO LEADS", "NO EXISTENCE LEAK".
 *   uncapped    the page cut removed (every row returned, `truncated` never set). MUST FAIL "a page of 1 over
 *               three". MUST HOLD "SAME WORDS, TWO LEADS".
 *   respelled   OVER-STRICTNESS: the latest state spelled through `MAX(seq)` instead of `ORDER BY seq DESC
 *               LIMIT 1` — correct work in a spelling the suite did not anticipate. MUST PASS whole.
 *
 * Every restore is verified by sha256 AND a byte compare against a uniquely-named per-arm pristine copy, the
 * copy's size printed and floored. The pen is `controlPen("d681")` (M0-182), outside the worktree.
 */
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync, rmSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { controlPen } from "./pen.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const PLANE = join(HERE, "..");
const STORE = join(PLANE, "src/store.mjs");
const SUITE = join(HERE, "leadlist.test.mjs");
const SNAP = controlPen("d681");
const sha = (b) => createHash("sha256").update(b).digest("hex");

const WHERE = "         FROM leads l\n        WHERE ${reach.sql}\n        ORDER BY l.at DESC, l.rowid DESC\n        LIMIT ?`, ...reach.args, cap + 1);";
const SAME = "SAME WORDS, TWO LEADS", NEVER = "a lead nobody followed", LEAK = "NO EXISTENCE LEAK";
const OVER = "an over-ask is answered at the ceiling", VERA = "vera (invited, never joined) still lists nothing";
const SHARE = "AFTER the share, sam (joined)", PAGE = "a page of 1 over three";

const ARMS = {
  bysubject: { from: WHERE,
    to: WHERE.replace("        ORDER BY",
      "          AND NOT EXISTS (SELECT 1 FROM leads l2 JOIN observation_log o2\n"
      + "                ON o2.authority_kind = 'lead' AND o2.authority = l2.lead_id\n"
      + "               WHERE l2.words = l.words AND l2.lead_id <> l.lead_id\n"
      + "                 AND o2.seq > COALESCE((SELECT MAX(o3.seq) FROM observation_log o3\n"
      + "                   WHERE o3.authority_kind = 'lead' AND o3.authority = l.lead_id), 0))\n"
      + "        ORDER BY"),
    mustFail: [SAME], mustHold: [NEVER, LEAK, OVER] },
  wide: { from: "        WHERE ${reach.sql}\n        ORDER BY l.at DESC, l.rowid DESC",
    to: "        WHERE (1 = 1 OR ${reach.sql})\n        ORDER BY l.at DESC, l.rowid DESC",
    mustFail: [LEAK, VERA], mustHold: [SAME] },
  noshare: { from: "        WHERE ${reach.sql}\n        ORDER BY l.at DESC, l.rowid DESC",
    to: "        WHERE l.author = ? AND ? IS NOT NULL\n        ORDER BY l.at DESC, l.rowid DESC",
    mustFail: [SHARE], mustHold: [SAME, LEAK] },
  uncapped: { from: "        LIMIT ?`, ...reach.args, cap + 1);\n    const leads = rows.slice(0, cap)",
    to: "        LIMIT ?`, ...reach.args, -1);\n    const leads = rows",
    mustFail: [PAGE], mustHold: [SAME] },
  respelled: { from: "              (SELECT o.state FROM observation_log o WHERE o.authority_kind = 'lead' AND o.authority = l.lead_id\n"
                   + "                ORDER BY o.seq DESC LIMIT 1) AS latest_state,",
    to: "              (SELECT o.state FROM observation_log o WHERE o.seq = (SELECT MAX(o9.seq) FROM observation_log o9\n"
      + "                WHERE o9.authority_kind = 'lead' AND o9.authority = l.lead_id)) AS latest_state,",
    mustFail: [], mustHold: [SAME, NEVER, LEAK, SHARE, PAGE, OVER, VERA] },
};

function runSuite() {
  let out = "", code = 0;
  try { out = execFileSync(process.execPath, [SUITE], { cwd: PLANE, encoding: "utf8", maxBuffer: 64 * 1024 * 1024 }); }
  catch (e) { out = (e.stdout || "") + (e.stderr || ""); code = e.status ?? 1; }
  const foot = /leadlist: (\d+) pass, (\d+) fail/.exec(out);
  const failed = [...out.matchAll(/^ {2}FAIL {2}(.*)$/gm)].map((m) => m[1]);
  return { code, foot: foot ? { pass: +foot[1], fail: +foot[2] } : null, failed };
}

let bad = 0;
const base = runSuite();
console.log(`baseline: exit ${base.code} · ${base.foot ? `${base.foot.pass} pass / ${base.foot.fail} fail` : "UNREACHED-FOOT (-1)"}`);
if (base.code !== 0 || !base.foot || base.foot.fail || base.foot.pass < 20) {
  console.log("baseline is not green at >= 20 pass; no arm can mean anything"); process.exit(2);
}
for (const [arm, a] of Object.entries(ARMS)) {
  const bytes = readFileSync(STORE);
  if (bytes.length < 1_000_000) { console.log(`REFUSING: src/store.mjs is ${bytes.length} bytes`); process.exit(2); }
  const dest = join(SNAP, `${arm}--src_store.mjs.pristine`);
  writeFileSync(dest, bytes);
  console.log(`\narm ${arm}: pristine src/store.mjs ${bytes.length} bytes, sha256 ${sha(bytes).slice(0, 12)}…`);
  const text = bytes.toString("latin1");
  const n = text.split(a.from).length - 1;
  if (n !== 1) { console.log(`  ARM DID NOT ARM: anchor matched ${n} times`); bad++; continue; }
  writeFileSync(STORE, Buffer.from(text.replace(a.from, () => a.to), "latin1"));
  let r;
  try { r = runSuite(); }
  finally {
    writeFileSync(STORE, bytes);
    const now = readFileSync(STORE), pristine = readFileSync(dest);
    const eq = sha(now) === sha(pristine) && now.equals(pristine);
    console.log(`  restored: sha256 ${eq ? "EQUAL" : "**DIFFERENT**"} ${sha(now).slice(0, 12)}… · byte compare ${now.equals(pristine) ? "IDENTICAL" : "**DIFFERS**"} · ${now.length} B`);
    if (!eq) { console.log(`  pristine kept at ${dest}`); process.exit(2); }
  }
  console.log(`  result: exit ${r.code} · ${r.foot ? `${r.foot.pass} pass / ${r.foot.fail} fail` : "UNREACHED-FOOT (-1)"}`);
  for (const f of r.failed) console.log(`    failed: ${f.split("\n")[0].slice(0, 120)}`);
  const hit = (p) => r.failed.some((f) => f.includes(p));
  const missing = a.mustFail.filter((p) => !hit(p)), leaked = a.mustHold.filter(hit);
  const greenOk = a.mustFail.length ? r.code !== 0 : r.code === 0;
  const ok = r.foot && greenOk && !missing.length && !leaked.length;
  console.log(`  verdict: ${ok ? "AS DECLARED" : "NOT AS DECLARED"}${missing.length ? ` · did not fail: ${missing.join(" | ")}` : ""}`
    + `${leaked.length ? ` · failed but must hold: ${leaked.join(" | ")}` : ""}`);
  if (!ok) bad++;
}
rmSync(SNAP, { recursive: true, force: true });
console.log(`\nd681 control: ${bad ? `${bad} arm(s) NOT as declared` : `every arm AS DECLARED (${Object.keys(ARMS).length})`}`);
process.exit(bad ? 1 : 0);
