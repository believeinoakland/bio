#!/usr/bin/env node
/* debt-floor.control.mjs — the NEGATIVE-CONTROL DRIVER for the two NON-VACUITY floors over the live DEBT.md.
 *
 *     node bio-plane/test/debt-floor.control.mjs            # from the repo root: the baseline, then every arm
 *     node bio-plane/test/debt-floor.control.mjs TL AL      # the baseline, then the named arms
 *
 * RE-POINTED 2026-09-22 BY M0-110, AND WHY. M0-109 (the same day) built this driver with eight arms over two battery
 * floors: `ledger.test.mjs` §3's "the real DEBT.md has rows" and `planning-hygiene.test.mjs` §1's "DEBT.md has debt
 * rows to check", each floor judging the LIVE ledger. Its run of record (62 pass, 0 fail, 8 of 8 arms as declared) is
 * kept in both suites' `NEGATIVE CONTROL:` blocks and in M0-109's CLAIMS block. M0-110 then moved `DEBT.md` to the branch
 * `coord`, and BOB #28's ruling 2 took every arm that judges the LIVE rows out of the battery: both floors are now
 * arms of `tools/coord.mjs`' ledger checks (LC-debt-agreement and LC-debt-token), which every coord write runs before
 * its push. The anchors this driver quoted left both suites with them, so an unchanged driver would arm nothing — and
 * `m025-arm-anchor-witness` A4 would name its dead anchors. So the SUBJECT is now `tools/coord.mjs`, the SUITE is
 * `coord.test.mjs` §8 — which drives both floors on PLANTED ledgers in both directions (empty FAILS by name; one row
 * and a hundred PASS) — and the arms are M0-109's, recast onto the floors' new site:
 *
 * DECLARED BEFORE ARMING:
 *   TL  THE LIAR — LC-debt-token's floor DELETED        -> "§8 an EMPTY DEBT.md FAILS LC-debt-token by name" FAILS,
 *                                                          and nothing else does
 *   TC  THE INCIDENT — a SIZE floor (`>= 20` rows) put back on LC-debt-token
 *                                                       -> "§8 ONE row passes LC-debt-token (over-strictness: the
 *                                                          fold's last row)" FAILS (the fixture ledgers of §1–§7 are small
 *                                                          too, so they redden with it — which IS M0-109's finding: a size
 *                                                          floor fails small honest ledgers)
 *   AL  THE LIAR — LC-debt-agreement's floor DELETED    -> "§8 an EMPTY DEBT.md FAILS LC-debt-agreement by name" FAILS,
 *                                                          and nothing else does
 *   AC  THE INCIDENT — a SIZE floor (`> 100` rows) put back on LC-debt-agreement
 *                                                       -> "§8 ONE row passes LC-debt-agreement (over-strictness: the
 *                                                          fold's last row)" AND "§8 a hundred rows pass both — the SIZE
 *                                                          floor M0-109 removed would fail here" FAIL (collateral as TC)
 * What MUST NOT fail: the baseline and the closing run, and every restore. The live DEBT.md is never read or written.
 *
 * THE RULES are this estate's and `coord.control.mjs`': anchors counted before anything arms (`preflight`, D-331);
 * each arm patches the pristine file and is restored before the next arms, verified by sha256 AND `cmp` against its own
 * uniquely-named copy, byte count floored; an `exit` hook restores from memory. The pen `.m0109-harness/` ignores
 * itself. THE LIMIT: nothing here proves a control RAN; the run of record goes on `coord.test.mjs`' result line.
 */
import "./stdio.mjs";
import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";
import { spawn, execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { preflight } from "../scripts/armdecay.mjs";

const REPO = fileURLToPath(new URL("../../", import.meta.url));
const SUITE = path.join(REPO, "bio-plane", "test", "coord.test.mjs");
const COORD = path.join(REPO, "tools", "coord.mjs");
const PEN = path.join(REPO, ".m0109-harness");
const PEN_IGNORE = path.join(PEN, ".gitignore");
const ONLY = process.argv.slice(2);
const DECLARED_ARMS = 4;

const sha = (b) => createHash("sha256").update(b).digest("hex");
const EMPTY_SHA = sha(Buffer.alloc(0));
const SUBJECT = { name: "coord.mjs", floorBytes: 30000 };
SUBJECT.pristine = fs.readFileSync(COORD);
SUBJECT.digest = sha(SUBJECT.pristine);
if (SUBJECT.pristine.length < SUBJECT.floorBytes || SUBJECT.digest === EMPTY_SHA) {
  console.log(`** coord.mjs is implausibly small (${SUBJECT.pristine.length} B); refusing to arm over it`);
  process.exit(1);
}
console.log(`pristine coord.mjs: ${SUBJECT.pristine.length} bytes, sha256 ${SUBJECT.digest.slice(0, 12)}…`);

let pass = 0, fail = 0;
const t = (label, ok) => { console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}`); ok ? pass++ : fail++; };
const WRITTEN = new Set();
process.on("exit", (code) => {
  if (sha(fs.readFileSync(COORD)) !== SUBJECT.digest) {
    fs.writeFileSync(COORD, SUBJECT.pristine);
    console.log(`  exit ${code}: coord.mjs restored from memory — sha256 ${sha(fs.readFileSync(COORD)) === SUBJECT.digest ? "match" : "**MISMATCH**"}`);
  }
  if (sha(fs.readFileSync(COORD)) === SUBJECT.digest) for (const p of WRITTEN) { try { fs.rmSync(p, { force: true }); WRITTEN.delete(p); } catch {} }
  if (!WRITTEN.size) { try { fs.rmSync(PEN_IGNORE, { force: true }); if (fs.existsSync(PEN)) fs.rmdirSync(PEN); } catch {} }
  console.log(`debt-floor.control pen: ${fs.existsSync(PEN) ? `REMAINS at ${PEN}` : "absent"} · exit ${code}`);
});
let CURRENT = null;
for (const sig of ["SIGINT", "SIGTERM", "SIGHUP"])
  process.on(sig, () => { if (CURRENT) { try { CURRENT.kill("SIGTERM"); } catch {} } process.exit(130); });

function runSuite() {
  return new Promise((resolve) => {
    const child = spawn(process.execPath, [SUITE], { cwd: path.join(REPO, "bio-plane"), stdio: ["ignore", "pipe", "pipe"] });
    CURRENT = child;
    const out = [];
    child.stdout.on("data", (d) => out.push(d));
    child.stderr.on("data", (d) => out.push(d));
    child.on("close", (code) => {
      CURRENT = null;
      const text = Buffer.concat(out).toString("utf8");
      const tally = /^coord: (\d+) pass, (\d+) fail$/m.exec(text);
      resolve({ code, text, pass: tally ? +tally[1] : -1, fail: tally ? +tally[2] : -1, foot: !!tally,
                judged: [...text.matchAll(/LC-debt-token judged (\d+) row\(s\)/g)].map((m) => +m[1]),
                failed: [...text.matchAll(/^ {2}FAIL {2}(.+)$/gm)].map((m) => m[1]) });
    });
  });
}

/* ---------------------------------------------------------------- the arms (each anchor occurs exactly ONCE) */
const anchorTokenFloor = `    return { fails: [...(a.rows ? [] : ["DEBT.md has NO debt rows — a token check over nothing passes for free"]),`;
const anchorAgreementFloor = `    if (!rows.length) return { fails: ["DEBT.md has NO rows — the agreement is vacuous (M0-109's non-vacuity floor, moved here)"] };`;
const E_TOKEN = "§8 an EMPTY DEBT.md FAILS LC-debt-token by name";
const O_TOKEN = "§8 ONE row passes LC-debt-token (over-strictness: the fold's last row)";
const E_AGREE = "§8 an EMPTY DEBT.md FAILS LC-debt-agreement by name";
const O_AGREE = "§8 ONE row passes LC-debt-agreement (over-strictness: the fold's last row)";
const H_BOTH = "§8 a hundred rows pass both — the SIZE floor M0-109 removed would fail here";
const ARMS = [
  { id: "TL", title: "THE LIAR: LC-debt-token's non-vacuity floor DELETED", must: [E_TOKEN], only: true,
    from: anchorTokenFloor, to: "    return { fails: [" },
  { id: "TC", title: "THE INCIDENT: a SIZE floor (>= 20 rows) on LC-debt-token", must: [O_TOKEN], only: false,
    from: anchorTokenFloor, to: anchorTokenFloor.replace("a.rows ? []", "a.rows >= 20 ? []") },
  { id: "AL", title: "THE LIAR: LC-debt-agreement's non-vacuity floor DELETED", must: [E_AGREE], only: true,
    from: anchorAgreementFloor, to: "    /* the floor, DELETED by arm AL */" },
  { id: "AC", title: "THE INCIDENT: a SIZE floor (> 100 rows) on LC-debt-agreement", must: [O_AGREE, H_BOTH], only: false,
    from: anchorAgreementFloor, to: anchorAgreementFloor.replace("if (!rows.length)", "if (rows.length <= 100)") },
];
if (ARMS.length !== DECLARED_ARMS) { console.log(`** ${ARMS.length} arms against ${DECLARED_ARMS} declared`); process.exit(1); }
const selected = ARMS.filter((a) => !ONLY.length || ONLY.includes(a.id));
if (!selected.length || ONLY.some((id) => !ARMS.some((a) => a.id === id))) { console.log(`** no arm ${ONLY.join(", ")}`); process.exit(1); }
const rows = preflight("debt-floor.control", ARMS.map((a) => ({ id: a.id, anchors: [{ file: COORD, needle: a.from }] })), { fatalFor: selected.map((a) => a.id) });
if (rows.some((r) => r.n !== r.want && selected.some((a) => a.id === r.id))) { console.log("** an anchor of a selected arm is not live — REFUSED TO ARM BLIND"); process.exit(1); }

console.log("\n--- ARM BASELINE · nothing armed ---");
{
  const s = await runSuite();
  t(`baseline · coord.test reached its foot and is GREEN (${s.pass} pass, ${s.fail} fail, exit ${s.code})`, s.foot && s.fail === 0 && s.code === 0);
  t(`baseline · §8 judged planted ledgers of ${s.judged.join(", ")} row(s) — 0, 1 and 100`, JSON.stringify(s.judged) === "[0,1,100]");
  for (const m of [E_TOKEN, O_TOKEN, E_AGREE, O_AGREE, H_BOTH]) t(`baseline · PASSES BY NAME: "${m}"`, s.text.includes(`PASS  ${m}`));
}
let armsRun = 0;
for (const a of selected) {
  console.log(`\n--- ARM ${a.id} · ${a.title} (armed ALONE) ---`);
  console.log(`    DECLARED: RED, failing ${a.must.map((m) => `"${m}"`).join(" and ")}${a.only ? ", and NOTHING ELSE" : " (collateral stated at the head)"}`);
  fs.mkdirSync(PEN, { recursive: true });
  if (!fs.existsSync(PEN_IGNORE)) fs.writeFileSync(PEN_IGNORE, "*\n");
  const copy = path.join(PEN, `arm${a.id}--coord.mjs`);
  fs.writeFileSync(copy, SUBJECT.pristine); WRITTEN.add(copy);
  const src = SUBJECT.pristine.toString("utf8");
  const n = src.split(a.from).length - 1;
  t(`arm ${a.id} · ARMED (the anchor matched exactly once; it matched ${n})`, n === 1);
  if (n === 1) {
    fs.writeFileSync(COORD, src.replace(a.from, () => a.to));
    const s = await runSuite();
    armsRun++;
    t(`arm ${a.id} · the suite reached its foot (${s.pass} pass, ${s.fail} fail, exit ${s.code})`, s.foot);
    t(`arm ${a.id} · the suite went RED`, s.fail > 0 && s.code !== 0);
    for (const m of a.must) t(`arm ${a.id} · FAILS BY NAME: "${m}"`, s.failed.includes(m));
    if (a.only) t(`arm ${a.id} · ...and NOTHING ELSE fails — the red is the floor's, not collateral`, s.failed.length === a.must.length);
    console.log(`    ACTUAL: ${s.pass} pass, ${s.fail} fail; failing: ${s.failed.map((l) => l.slice(0, 80)).join(" | ") || "none"}`);
  }
  fs.writeFileSync(COORD, SUBJECT.pristine);
  let cmp = true;
  try { execFileSync("cmp", ["-s", COORD, copy]); } catch { cmp = false; }
  const ok = sha(fs.readFileSync(COORD)) === SUBJECT.digest && cmp;
  t(`arm ${a.id} · RESTORED coord.mjs byte-identically (sha256 ${ok ? "match" : "**MISMATCH**"}, cmp ${cmp ? "identical" : "DIFFERS"})`, ok);
  if (!ok) { console.log("** a restore did not verify; stopping"); process.exit(1); }
  fs.rmSync(copy, { force: true }); WRITTEN.delete(copy);
}
console.log("\n--- CLOSING ---");
{
  const s = await runSuite();
  t(`closing · coord.test is GREEN again (${s.pass} pass, ${s.fail} fail, exit ${s.code})`, s.foot && s.fail === 0 && s.code === 0);
}
t(`closing · coord.mjs is the pristine file (sha256 ${SUBJECT.digest.slice(0, 12)}…)`, sha(fs.readFileSync(COORD)) === SUBJECT.digest);
t(`the arm tally held: ${armsRun} run of ${selected.length} selected`, armsRun === selected.length);
console.log(`\ndebt-floor.control: ${pass} pass, ${fail} fail  (${armsRun} arm(s) run of ${DECLARED_ARMS} declared, plus a baseline)`);
process.exit(fail ? 1 : 0);
