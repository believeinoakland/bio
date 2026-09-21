#!/usr/bin/env node
/* nc-d355.mjs — D-355's NEGATIVE-CONTROL DRIVER, SEVEN ARMS PLUS A BASELINE.
 *
 *     node bio-plane/test/nc-d355.mjs            # every arm, in order
 *     node bio-plane/test/nc-d355.mjs 4          # the baseline, then one arm
 *
 * WHAT IT CONTROLS. D-355 changed three things and this file breaks each of them and watches a NAMED
 * outcome move: (a) the census (`m025-arm-census.mjs`) now reads an enumerated announcement by the
 * register's own grammar when its union reads nothing; (b) `civicos-ui/test/refusal-partition.control.mjs`
 * removes its pristine pen on EVERY exit, restoring an in-flight arm from memory first; (c) that driver
 * now validates every anchor before it arms anything (D-331). The drivers' re-aimed ARMS are proved by
 * the drivers themselves exiting 0 with every sub-check as declared, and by this file's baseline.
 *
 * THE RULES, which are this estate's and not this file's: each arm is armed ALONE from a pristine
 * tree; each DECLARES before arming what must happen and what must not; every restore is verified by
 * sha256 AND by content against a UNIQUELY-NAMED per-arm copy with the byte count printed and floored;
 * and the BASELINE IS AN ARM, because seven arms broken for one unrelated reason read exactly like
 * seven arms working. D-331 is honoured through `preflight`. This file removes ITS OWN pen by name on
 * every exit, for the reason it exists to prove about another.
 *
 * **THE LIMIT, STATED FIRST (M0-42): nothing here proves a control RAN.** The run of record is written
 * into `MEASUREMENTS.md` with its date and figures, and into each subject's head.
 */
import "./stdio.mjs";                 /* D-282: a writer's own exit must not discard the writer's own output */
import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";
import { execFileSync, spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { preflight } from "../scripts/armdecay.mjs";

const ROOT = fileURLToPath(new URL("..", import.meta.url));          /* bio-plane/ */
const REPO = fileURLToPath(new URL("../../", import.meta.url));
const ONLY = process.argv[2] || null;

const F = {
  census: path.join(ROOT, "test", "m025-arm-census.mjs"),
  gate:   path.join(ROOT, "test", "admission-gate.test.mjs"),
  index:  path.join(ROOT, "src", "index.mjs"),
};
/* refusal-partition's own subjects — what a kill mid-arm could leave patched. */
const RP_SUBJECTS = [path.join(ROOT, "checks", "bio-checks.mjs"), F.index,
  path.join(REPO, "civicos-ui", "app.html"), path.join(REPO, "civicos-ui", "check-refusal-codes.mjs")];
const RP = path.join(REPO, "civicos-ui", "test", "refusal-partition.control.mjs");
const RP_PEN = path.join(REPO, "civicos-ui", "test", ".rec79-control-pristine");
const REFSEL = "bio-plane/test/refselectivity.control.mjs";
const OPCLAIMS = "bio-plane/test/op-claims.control.mjs";
const LOGROOT = path.join(REPO, "_m025", "nc-d355");                  /* gitignored with `_m025/` */
const PEN = path.join(REPO, ".nc-d355-pen");                          /* this file's own pristine copies */

const sha = (b) => createHash("sha256").update(b).digest("hex");
const EMPTY = sha(Buffer.alloc(0));
const PRISTINE = new Map();          /* path -> { buf, digest }, taken ONCE before any arm */
for (const p of [...Object.values(F), ...RP_SUBJECTS]) {
  if (PRISTINE.has(p)) continue;
  const buf = fs.readFileSync(p);
  if (buf.length < 10000 || sha(buf) === EMPTY) { console.log(`** ${p} is implausibly small; refusing to arm over it`); process.exit(1); }
  PRISTINE.set(p, { buf, digest: sha(buf) });
}

/* ---------------------------------------------------------------- THIS FILE'S OWN PEN */
const WRITTEN = new Set();
function restoreEverything(why) {
  for (const [p, { buf, digest }] of PRISTINE) {
    if (sha(fs.readFileSync(p)) === digest) continue;
    fs.writeFileSync(p, buf);
    console.log(`    ${why}: ${path.relative(REPO, p)} restored from memory — sha256 ${sha(fs.readFileSync(p)) === digest ? "match" : "**mismatch**"}`);
  }
}
process.on("exit", (code) => {
  restoreEverything(`exit ${code}`);
  for (const p of WRITTEN) { try { fs.rmSync(p, { force: true }); } catch {} }
  try { if (fs.existsSync(PEN)) fs.rmdirSync(PEN); } catch {}
  console.log(`nc-d355 pen: ${fs.existsSync(PEN) ? `REMAINS at ${PEN}` : "absent"} · exit ${code}`);
});
/* Every child below is ASYNCHRONOUS, so this handler runs when the signal arrives rather than after the
   whole run (a handler on a synchronous driver is deferred to its end — measured for D-355). */
let CURRENT = null;
for (const sig of ["SIGINT", "SIGTERM", "SIGHUP"])
  process.on(sig, () => { if (CURRENT) { try { CURRENT.kill("SIGTERM"); } catch {} } process.exit(130); });

function stashAll(id) {
  fs.mkdirSync(PEN, { recursive: true });
  for (const [p] of PRISTINE) {
    const c = path.join(PEN, `arm${id}--${path.basename(p)}`);
    fs.copyFileSync(p, c);
    WRITTEN.add(c);
  }
}
function restoreAll(id) {
  for (const [p, { buf, digest }] of PRISTINE) {
    fs.writeFileSync(p, buf);
    const now = fs.readFileSync(p);
    const c = path.join(PEN, `arm${id}--${path.basename(p)}`);
    if (sha(now) !== digest) throw new Error(`RESTORE FAILED BY HASH: ${p} (arm ${id})`);
    execFileSync("cmp", ["-s", p, c]);
    if (now.length < 10000) throw new Error(`RESTORE BELOW FLOOR: ${p} (arm ${id})`);
    fs.rmSync(c, { force: true }); WRITTEN.delete(c);
  }
  console.log(`    every subject restored — ${PRISTINE.size} file(s), sha256 AND cmp against the arm's own copy, floored at 10000 B`);
}

/* ------------------------------------------------------------------ INSTRUMENTS */
function run(cmd, args, cwd) {
  return new Promise((resolve) => {
    const child = spawn(cmd, args, { cwd, stdio: ["ignore", "pipe", "pipe"] });
    CURRENT = child;
    const out = [];
    child.stdout.on("data", (d) => out.push(d));
    child.stderr.on("data", (d) => out.push(d));
    child.on("error", (e) => { CURRENT = null; resolve({ out: String(e && e.message), code: -1 }); });
    child.on("close", (code) => { CURRENT = null; resolve({ out: Buffer.concat(out).toString("utf8"), code: code ?? -1 }); });
  });
}
const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
/* The census, either RUNNING a driver or RE-READING a saved log. Its OWN printed lines are read. */
async function census(rel, logs, fromLogs = false) {
  const r = await run(process.execPath, [F.census, ...(fromLogs ? ["--from-logs"] : []), "--only", rel, "--logs", logs], REPO);
  const row = new RegExp(`${esc(rel)}\\s+(\\S+)\\s+exit=(\\S+)\\s+arms=(\\S+)\\s+decl=(\\S+)`).exec(r.out);
  const wrong = /tally NOT AS DECLARED : (\d+)/.exec(r.out);
  const blind = /tally unknown on one side: (\d+)/.exec(r.out);
  return { code: r.code, out: r.out, verdict: row ? row[1] : null, arms: row ? row[3] : null, decl: row ? row[4] : null,
           wrong: wrong ? +wrong[1] : null, blind: blind ? +blind[1] : null,
           named: new RegExp(`<<< ${esc(rel)}`).test(r.out) };
}
const logFile = (logs, rel) => path.join(logs, rel.replace(/[^\w.-]/g, "__") + ".log");
/* A saved census log, copied into an arm's own directory (optionally EDITED), with the run's summary
   beside it so `--from-logs` recovers the driver's exit code instead of assuming one. */
function seedLogs(armDir, rel, edit = (s) => s) {
  const logs = path.join(armDir, "logs");
  fs.mkdirSync(logs, { recursive: true });
  const src = fs.readFileSync(logFile(BASE_LOGS, rel), "utf8");
  const edited = edit(src);
  fs.writeFileSync(logFile(logs, rel), edited);
  fs.copyFileSync(path.join(BASE_LOGS, "..", "census-summary.txt"), path.join(armDir, "census-summary.txt"));
  return { logs, changed: edited !== src };
}
const penAbsent = () => !fs.existsSync(RP_PEN);
const treeIsPristine = () => [...PRISTINE].every(([p, { digest }]) => sha(fs.readFileSync(p)) === digest);

/* ------------------------------------------------------------------ THE ANCHORS */
const FALLBACK = "  const enumerated = leadTokens.length ? countEnumerations(leadTokens.join(\" \") + \" \") : 0;";
const FALLBACK_OFF = "  const enumerated = 0;   /* nc-d355: the D-355 fallback NEUTERED */";
const GATE_EXIT = "process.exit(fail ? 1 : 0);";
const STORE_NAME_LINE = "    const storeName = scope.name;";

const BASE_DIR = path.join(LOGROOT, "arm0");
const BASE_LOGS = path.join(BASE_DIR, "logs");

let armsRun = 0, armsWrong = 0;
const QUEUE = [];
const arm = (id, title, edits, check) => QUEUE.push({ id, title, edits, check });
function edit(p, from, to) {
  const src = fs.readFileSync(p, "utf8");
  const n = src.split(from).length - 1;
  if (n !== 1) throw new Error(`ARM REFUSED TO ARM BLIND: anchor occurs ${n} times in ${path.relative(REPO, p)}`);
  fs.writeFileSync(p, src.replace(from, to));
}

/* ===== (0) THE BASELINE. Nothing armed. Every subject GREEN, and refusal-partition's pen ABSENT after. */
arm("0", "THE BASELINE — nothing armed. DECLARED: the census reads refselectivity by the ENUMERATION fallback "
  + "as FOUR arms against its declared four, no tally finding and nothing unknown, exit 0; refusal-partition "
  + "exits 0 with every sub-check as declared and its pen ABSENT after; the tree untouched.",
  [],
  async () => {
    const c = await census(REFSEL, BASE_LOGS);
    const r = await run(process.execPath, [RP], REPO);
    return { ok: c.code === 0 && c.arms === "4(enum)" && c.decl === "4" && c.wrong === 0 && c.blind === 0
               && r.code === 0 && /Every arm behaved as declared/.test(r.out) && /as declared$/m.test(r.out) && penAbsent(),
      say: `census exit ${c.code} · refselectivity ${c.verdict} arms=${c.arms} decl=${c.decl} · tally wrong ${c.wrong}, unknown ${c.blind} · `
         + `refusal-partition exit ${r.code} · ${(/(\d+) arm\(s\), (\d+) disagreeing/.exec(r.out) || ["", "?", "?"]).slice(1).join(" sub-checks, ")} disagreeing · `
         + `pen ${penAbsent() ? "absent" : "**PRESENT**"}` };
  });

/* ===== (1) THE FALLBACK NEUTERED — the blindness D-355 closed, put back. */
arm("1", "THE CENSUS FALLBACK NEUTERED, the same saved log re-read. DECLARED: refselectivity reads `arms=?` "
  + "again and is listed as UNKNOWN on one side (1) — the exact state of every census run before D-355.",
  [[F.census, FALLBACK, FALLBACK_OFF]],
  async () => {
    const { logs } = seedLogs(path.join(LOGROOT, "arm1"), REFSEL);
    const c = await census(REFSEL, logs, true);
    return { ok: c.arms === "?" && c.blind === 1 && c.wrong === 0,
      say: `refselectivity arms=${c.arms} decl=${c.decl} · tally unknown ${c.blind} · tally wrong ${c.wrong} · census exit ${c.code}` };
  });

/* ===== (2) A DRIVER THAT SILENTLY LOST AN ARM, SEEN ONLY THROUGH THE FALLBACK. */
arm("2", "A DECAYED DRIVER — refselectivity's saved run with its `(d)` announcement removed, as if the arm had been "
  + "deleted. DECLARED: the census reads THREE against a declared four, names the driver under TALLY NOT AS "
  + "DECLARED, and EXITS 1. This is the finding that makes the fallback worth having.",
  [],
  async () => {
    const { logs, changed } = seedLogs(path.join(LOGROOT, "arm2"), REFSEL, (s) => s.replace(/^ {2}\(d\) .*$/m, "  [the (d) announcement removed by nc-d355 arm 2]"));
    const c = await census(REFSEL, logs, true);
    return { ok: changed && c.code === 1 && c.arms === "3(enum)" && c.wrong === 1 && c.named,
      say: `log edited: ${changed} · refselectivity arms=${c.arms} decl=${c.decl} · tally wrong ${c.wrong} · named: ${c.named} · census exit ${c.code}` };
  });

/* ===== (2b) THE SAME DECAY, WITH THE FALLBACK NEUTERED — and it passes unseen. */
arm("2b", "THE SAME DECAYED LOG, the fallback NEUTERED. DECLARED: `arms=?`, the decay UNSEEN, NO tally finding, "
  + "census EXIT 0 — arm 2 and this arm differ ONLY in the fallback, so the fallback is what saw it.",
  [[F.census, FALLBACK, FALLBACK_OFF]],
  async () => {
    const { logs, changed } = seedLogs(path.join(LOGROOT, "arm2b"), REFSEL, (s) => s.replace(/^ {2}\(d\) .*$/m, "  [the (d) announcement removed by nc-d355 arm 2b]"));
    const c = await census(REFSEL, logs, true);
    return { ok: changed && c.code === 0 && c.arms === "?" && c.wrong === 0,
      say: `log edited: ${changed} · refselectivity arms=${c.arms} · tally wrong ${c.wrong} · census exit ${c.code}` };
  });

/* ===== (3) OVER-STRICTNESS — a driver the UNION already reads keeps its count exactly. */
arm("3", "OVER-STRICTNESS — `op-claims.control.mjs`, RUN, which announces `ARM <id> —` AND prints an `(<id>)` summary "
  + "line per arm. DECLARED: the census count equals its ARM announcements, read by the UNION (no `(enum)`), NOT "
  + "doubled by the summary lines — and the summary lines exist, or this arm proves nothing.",
  [],
  async () => {
    const logs = path.join(LOGROOT, "arm3", "logs");
    const c = await census(OPCLAIMS, logs);
    const log = fs.existsSync(logFile(logs, OPCLAIMS)) ? fs.readFileSync(logFile(logs, OPCLAIMS), "utf8") : "";
    const announced = (log.match(/^ARM \S+ — /gm) || []).length;
    const summary = (log.match(/^ {2}\([A-Za-z0-9]+\) /gm) || []).length;
    return { ok: announced > 0 && summary > 0 && c.arms === String(announced),
      say: `op-claims.control ${c.verdict} arms=${c.arms} · ARM lines in its log ${announced} · (id) summary lines ${summary} · census exit ${c.code}` };
  });

/* ===== (4) THE PEN — refusal-partition KILLED mid-arm, which is what the census's timeout does. */
arm("4", "refusal-partition sent SIGTERM WHILE AN ARM IS ARMED (a subject differs from pristine and a copy is in "
  + "the pen). DECLARED: it exits 143, prints its EXIT-TIME RESTORE, every subject is back to pristine by sha256, "
  + "and the pen is ABSENT. MUST NOT: leave a patched file, which is the poisoned tree the census stops on.",
  [],
  async () => {
    const out = [];
    const child = spawn(process.execPath, [RP], { cwd: REPO, stdio: ["ignore", "pipe", "pipe"] });
    CURRENT = child;
    child.stdout.on("data", (d) => out.push(String(d))); child.stderr.on("data", (d) => out.push(String(d)));
    const done = new Promise((res) => child.on("exit", (code, signal) => res({ code, signal })));
    let armedSeen = false;
    const t0 = Date.now();
    while (Date.now() - t0 < 600000) {                       /* BOUNDED: ten minutes, then the arm is wrong */
      if (!penAbsent() && !treeIsPristine()) { armedSeen = true; break; }
      if (child.exitCode !== null) break;
      await new Promise((r) => setTimeout(r, 100));
    }
    if (armedSeen) child.kill("SIGTERM");
    const killBound = setTimeout(() => { try { child.kill("SIGKILL"); } catch {} }, 600000);
    const ex = await done;
    clearTimeout(killBound);
    const text = out.join("");
    return { ok: armedSeen && ex.code === 143 && /received SIGTERM/.test(text) && /EXIT-TIME RESTORE[^\n]*MATCH/.test(text)
               && treeIsPristine() && penAbsent(),
      say: `armed state seen: ${armedSeen} · exit ${ex.code}${ex.signal ? ` signal ${ex.signal}` : ""} · `
         + `EXIT-TIME RESTORE printed: ${/EXIT-TIME RESTORE/.test(text)} · tree pristine: ${treeIsPristine()} · pen ${penAbsent() ? "absent" : "**PRESENT**"}` };
  });

/* ===== (5) THE PEN — a NATURAL red exit, the case D-355's row describes. */
arm("5", "admission-gate made to exit 1 whatever it measures, so refusal-partition finishes RED by its own count. "
  + "DECLARED: it exits 1 with exactly arm 0's gate row and arm 10 DISAGREEING (the two rows that declared that suite "
  + "green), every other row as declared, and its pen ABSENT after — where before D-355 every exit left it.",
  [[F.gate, GATE_EXIT, "process.exit(1);   /* nc-d355 arm 5 */"]],
  async () => {
    const r = await run(process.execPath, [RP], REPO);
    const dis = [...r.out.matchAll(/^ {2}arm (\S+)\s+DISAGREE/gm)].map((m) => m[1]);
    const gateRow = /arm 0\s+DISAGREE\s+declared=0 actual=1\s+admission-gate/.test(r.out);
    return { ok: r.code === 1 && dis.length === 2 && dis.includes("0") && dis.includes("10") && gateRow && penAbsent(),
      say: `exit ${r.code} · disagreeing rows [${dis.join(", ")}] · the gate row among them: ${gateRow} · pen ${penAbsent() ? "absent" : "**PRESENT**"}` };
  });

/* ===== (6) D-331 — ONE AMBIGUOUS ANCHOR, AND THE WHOLE TABLE IS STILL PRINTED BEFORE ANYTHING ARMS. */
arm("6", "a SECOND copy of arm 9's anchor planted in `index.mjs` (inside a comment). DECLARED: refusal-partition "
  + "prints its WHOLE preflight table — every arm, 1 through 10 — marks arm 9, REFUSES TO ARM BLIND, exits non-zero, "
  + "and never announces ARM 0. MUST NOT: arm anything, or leave a pen.",
  [[F.index, STORE_NAME_LINE, `${STORE_NAME_LINE}\n    /* nc-d355 arm 6 — a second copy of the anchor:\n${STORE_NAME_LINE}\n    */`]],
  async () => {
    const r = await run(process.execPath, [RP], REPO);
    const ids = new Set([...r.out.matchAll(/^ {4}ARM PREFLIGHT (\S+)/gm)].map((m) => m[1]));
    const marked = /ARM PREFLIGHT 9\s+<<< /.test(r.out);
    return { ok: r.code !== 0 && ids.size === 10 && marked && /REFUSED TO ARM BLIND/.test(r.out)
               && !/^ARM 0 · /m.test(r.out) && penAbsent(),
      say: `exit ${r.code} · preflight rows cover ${ids.size} arm id(s) · arm 9 marked: ${marked} · ARM 0 announced: `
         + `${/^ARM 0 · /m.test(r.out)} · pen ${penAbsent() ? "absent" : "**PRESENT**"}` };
  });

/* ------------------------------------------------------------------- RUN */
preflight("nc-d355.mjs",
  QUEUE.map((q) => ({ id: q.id, anchors: q.edits.map(([p, from]) => ({ file: p, needle: from })) })),
  { fatalFor: QUEUE.filter((q) => !ONLY || q.id === "0" || q.id === ONLY).map((q) => q.id) });

console.log(`\nnc-d355 — the baseline first, so every arm is a DELTA. refusal-partition's pen before anything: `
  + `${penAbsent() ? "absent" : `**PRESENT** at ${RP_PEN} — an earlier run left it; this driver does not sweep it`}`);
for (const q of QUEUE) {
  if (ONLY && q.id !== "0" && q.id !== ONLY) continue;
  armsRun++;
  console.log(`\n=== (${q.id}) ${q.title}`);
  if (!penAbsent()) { console.log(`  ** NOT AS DECLARED — refusal-partition's pen is present BEFORE the arm, so its absence after would prove nothing`); armsWrong++; continue; }
  stashAll(q.id);
  try {
    for (const [p, from, to] of q.edits) edit(p, from, to);
    const r = await q.check();
    console.log(`  MEASURED: ${r.say}`);
    if (r.ok) console.log("  as declared.");
    else { console.log("  ** NOT AS DECLARED"); armsWrong++; }
  } catch (e) {
    console.log(`  ** NOT AS DECLARED — the arm itself threw: ${String(e.message).slice(0, 300)}`);
    armsWrong++;
  } finally { restoreAll(q.id); }
}

console.log(`\n==== ${armsRun} arm(s) run, ${armsWrong} NOT AS DECLARED.`);
process.exit(armsWrong ? 1 : 0);
