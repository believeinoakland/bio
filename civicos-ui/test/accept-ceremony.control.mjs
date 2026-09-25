/* UI-74 — THE NEGATIVE-CONTROL DRIVER FOR `accept-ceremony.test.mjs`.
 *
 * Each arm breaks ONE thing in the real `civicos-ui/app.html`, runs the suite
 * against the real plane, and restores the file — verified by sha256 AND `cmp`
 * against a per-arm, uniquely named pristine copy, with a byte floor. A BASELINE
 * row runs first and the arms are refused if it is not green. Every arm DECLARES
 * what must fail and what must NOT; a surprising green is a finding about the arm.
 * An arm whose anchor does not occur exactly once DID NOT ARM and is reported so.
 *
 * The row's two named arms: DROP THE AFFIRMATION (A at the page's gate, B at the
 * wire) and HIDE THE FIELD (C at the render, D at the read). E is the ordering
 * rule's structural pin; F the opposite defect (a fence wider than its rule);
 * G the over-strictness arm, which MUST PASS. H is UI-88's named arm: the origins
 * read pointed back at `op=versionstrength`, verbatim as it stood before UI-88.
 *
 * Run from the repo root: `node civicos-ui/test/accept-ceremony.control.mjs`.
 */
import "../../bio-plane/test/stdio.mjs";   /* D-282 / M0-36: this driver exits on a refused
   baseline, and a writer's own exit must not discard its own output. */
import { readFileSync, writeFileSync, copyFileSync, unlinkSync, existsSync } from "node:fs";
import { createHash } from "node:crypto";
import { execFileSync, spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { anchorTable } from "../../bio-plane/scripts/anchortable.mjs";

const APP = fileURLToPath(new URL("../app.html", import.meta.url));
const SUITE = fileURLToPath(new URL("./accept-ceremony.test.mjs", import.meta.url));
const sha = (p) => createHash("sha256").update(readFileSync(p)).digest("hex");

const ARMS = [
  {
    id: "A-affirmation-dropped-at-the-gate",
    what: "DROP THE AFFIRMATION, AT THE PAGE: `acerAffirmedAll` answers true unconditionally, so the send control is offered before any set is affirmed and `acerSend` no longer refuses.",
    mustFail: ["THE KEYSTONE: THE SEND CONTROL IS ABSENT", "THE KEYSTONE, SECOND DEFENCE"],
    mustPass: ["D-195 SHARED: the shared origin is SHOWN", "D-195 INDEPENDENT SHOWS NONE", "THE ACCEPT LANDS"],
    from: "  if(!acerNeedsAffirmation(v, act)) return true;\n  const done = (ACER && ACER.affirmed) ? ACER.affirmed : {};\n",
    to:   "  return true;\n  const done = (ACER && ACER.affirmed) ? ACER.affirmed : {};\n",
  },
  {
    id: "B-affirmation-dropped-on-the-wire",
    what: "DROP THE AFFIRMATION, ON THE WIRE: every control is right and `affirmed=` never leaves the page, so the plane is never told what the member said and refuses the accept.",
    mustFail: ["BEAT 2: the plane was asked with preview=1 and CARRYING the affirmation", "THE ACCEPT LANDS",
               "AND THE AFFIRMATION IS IN THE RECORD", "D-195 SHARED, NEVER REFUSES: the member's accept"],
    mustPass: ["THE KEYSTONE: THE SEND CONTROL IS ABSENT", "D-195 SHARED: the shared origin is SHOWN",
               "OVER-STRICTNESS: the one-set accept lands"],
    from: "           ...(said.length ? { affirmed: said.join(\",\") } : {}),\n",
    to:   "",
  },
  {
    id: "C-field-hidden-at-the-render",
    what: "HIDE THE FIELD, AT THE RENDER: `acerOriginsHtml` draws nothing, so the plane's derivation reaches the page and no member reads it.",
    mustFail: ["D-195 SHARED: the shared origin is SHOWN", "D-195 SHARED: it names BOTH sets",
               "D-195 SHARED: and it is shown BEFORE the affirmation", "D-195 INDEPENDENT: and the page says the record TRACED"],
    mustPass: ["THE KEYSTONE: THE SEND CONTROL IS ABSENT", "THE ACCEPT LANDS", "D-195 INDEPENDENT SHOWS NONE"],
    from: "function acerOriginsHtml(v){\n  if(acerSetKeys(v).length < 2) return \"\";\n",
    to:   "function acerOriginsHtml(v){\n  return \"\";\n",
  },
  {
    id: "D-field-hidden-at-the-read",
    what: "HIDE THE FIELD, AT THE READ: `acerOriginsRead` drops `independence`, so the page says it was not told — the honest rendering of a read that did not arrive, and still the defect.",
    mustFail: ["D-195 SHARED: the shared origin is SHOWN", "D-195 INDEPENDENT: and the page says the record TRACED"],
    mustPass: ["D-195 INDEPENDENT SHOWS NONE", "THE KEYSTONE: THE SEND CONTROL IS ABSENT", "THE ACCEPT LANDS"],
    from: "  const ind = a.accepted && a.result && typeof a.result === \"object\" ? a.result.independence : null;\n",
    to:   "  const ind = null;\n",
  },
  {
    id: "E-pair-kept-before-the-affirmation",
    /* RE-LABELLED 2026-09-25 by UI-88: since the origins read became the independence-only
       read there is no pair in its answer to keep; the arm now stores that answer in the
       strength slot, and the NOT-HELD arms (renamed with it) must still catch it. */
    what: "THE ORDERING RULE'S STRUCTURAL PIN: the origins read's whole answer is kept in the page's strength slot — drawn nowhere yet, and reachable by any code path that would.",
    mustFail: ["ORDERING: nothing strength-bearing is HELD", "ORDERING: on arrival at the shared reading, nothing strength-bearing is held here either"],
    mustPass: ["ORDERING: and nothing of what the reading comes to is drawn", "D-195 SHARED: the shared origin is SHOWN"],
    from: "  const ind = a.accepted && a.result && typeof a.result === \"object\" ? a.result.independence : null;\n",
    to:   "  const ind = a.accepted && a.result && typeof a.result === \"object\" ? a.result.independence : null;\n  if(a.accepted) ACER.strength = a.result;\n",
  },
  {
    id: "F-origin-always-shared",
    what: "THE OPPOSITE DEFECT: the page reports a shared origin whenever there are two sets, ignoring what the plane derived. Independent work is then shown as sharing.",
    mustFail: ["D-195 INDEPENDENT SHOWS NONE", "D-195 INDEPENDENT: and the page says the record TRACED"],
    mustPass: ["D-195 SHARED: the shared origin is SHOWN", "THE ACCEPT LANDS"],
    from: "  const shared = Array.isArray(ind.shared) ? ind.shared.filter(p => p && typeof p === \"object\") : [];\n",
    to:   "  const shared = [{ a: acerSetKeys(v)[0], b: acerSetKeys(v)[1], through: [\"bundle:x\"] }];\n",
  },
  {
    id: "G-over-strictness-indexed-loop",
    what: "OVER-STRICTNESS: `acerAffirmedAll` rewritten as an indexed loop — the same rule in a spelling the suite did not anticipate. MUST PASS.",
    mustFail: [],
    mustPass: ["THE KEYSTONE", "THE ACCEPT LANDS", "D-195", "ORDERING", "OVER-STRICTNESS", "PRE-AFFIRMATION FETCH"],
    from: "  return acerSetKeys(v).every((_, i) => done[i] === true);\n",
    to:   "  const n = acerSetKeys(v).length;\n  for(let i = 0; i < n; i++){ if(done[i] !== true) return false; }\n  return true;\n",
  },
  {
    id: "H-origins-read-back-at-versionstrength",
    what: "UI-88'S NAMED ARM: `acerOriginsRead` pointed back at `op=versionstrength`, exactly as it stood before UI-88 — the pair crosses the wire and is dropped client-side. The page's STATE stays clean (the NOT-HELD arm must stay green); only the network log can see it.",
    mustFail: ["PRE-AFFIRMATION FETCH: before the affirmation the ceremony's network log",
               "PRE-AFFIRMATION FETCH: before the affirmation the network log",
               "ORDERING: the origins read is the independence-only read",
               "ORDERING: and the arithmetic is not asked before any act",
               "ORDERING, SECOND HALF"],
    mustPass: ["ORDERING: nothing strength-bearing is HELD", "D-195 SHARED: the shared origin is SHOWN",
               "D-195 INDEPENDENT: and the page says the record TRACED", "THE ACCEPT LANDS", "THE KEYSTONE"],
    from: "  const a = await actAsk(\"partitionindependence\", { id: ACER.inquiry, version: String(v.name) });\n",
    to:   "  const st = String((v && v.state) || \"\").trim();\n  const a = await actAsk(\"versionstrength\",\n    { id: ACER.inquiry, version: String(v.name), ...(st ? { states: st } : {}) });\n",
  },
];

/* M0-197: the arms' anchors as data, for tools/anchordrift.mjs (a no-op outside its dry read). */
anchorTable(ARMS.map((a) => ({ arm: a.id, file: APP, find: a.from, put: a.to })));

function runSuite() {
  const r = spawnSync(process.execPath, [SUITE], { encoding: "utf8", timeout: 600000, maxBuffer: 64 * 1024 * 1024 });
  const out = (r.stdout || "") + (r.stderr || "");
  const m = /accept-ceremony: (\d+) pass, (\d+) fail/.exec(out);
  const failed = [...out.matchAll(/^ {2}FAIL {2}(.*)$/gm)].map((x) => x[1]);
  /* A run with no completion line did not finish: -1, never 0. */
  return { pass: m ? +m[1] : -1, fail: m ? +m[2] : -1, failed, code: r.status, out };
}

const results = [];
console.log("UI-74 / UI-88 NEGATIVE CONTROL — each arm ALONE, restored and verified by sha256 AND cmp\n");
const PRISTINE0 = APP + ".ui74-baseline.pristine";
copyFileSync(APP, PRISTINE0);
const SHA0 = sha(APP);
const BYTES0 = readFileSync(APP).length;
console.log(`BASELINE app.html  sha256 ${SHA0}  ${BYTES0} bytes`);
if (BYTES0 < 500000) { console.error(`REFUSING TO RUN: app.html is ${BYTES0} bytes, below the floor.`); unlinkSync(PRISTINE0); process.exit(2); }

const base = runSuite();
console.log(`  BASELINE RUN: ${base.pass} pass, ${base.fail} fail  (exit ${base.code})`);
if (base.fail !== 0 || base.pass <= 0) {
  console.error("REFUSING TO RUN THE ARMS: the baseline is not green.");
  console.error(base.out.slice(-3000));
  unlinkSync(PRISTINE0);
  process.exit(2);
}

for (const arm of ARMS) {
  const PRISTINE = `${APP}.ui74-${arm.id}.pristine`;
  copyFileSync(APP, PRISTINE);
  const before = sha(APP);
  const src = readFileSync(APP, "utf8");
  const hits = src.split(arm.from).length - 1;
  if (hits !== 1) {
    console.log(`\n--- ${arm.id} --- ARM DID NOT ARM: its anchor occurs ${hits} time(s), not once. NOT SCORED.`);
    results.push({ arm, armed: false, hits });
    unlinkSync(PRISTINE);
    continue;
  }
  writeFileSync(APP, src.replace(arm.from, arm.to));
  if (sha(APP) === before) {
    console.log(`\n--- ${arm.id} --- ARM DID NOT ARM: the file is byte-identical after the patch. NOT SCORED.`);
    results.push({ arm, armed: false, hits });
    copyFileSync(PRISTINE, APP); unlinkSync(PRISTINE);
    continue;
  }
  console.log(`\n--- ${arm.id} ---`);
  console.log(`  ${arm.what}`);
  const r = runSuite();
  console.log(`  RUN: ${r.pass} pass, ${r.fail} fail  (exit ${r.code})`);
  for (const f of r.failed) console.log(`      FAILED: ${f}`);

  copyFileSync(PRISTINE, APP);
  const after = sha(APP);
  const bytes = readFileSync(APP).length;
  let cmpOk = true;
  try { execFileSync("cmp", ["-s", APP, PRISTINE]); } catch (_) { cmpOk = false; }
  const restored = after === before && cmpOk && bytes === BYTES0;
  console.log(`  restored byte-identically: ${restored ? "YES" : "NO"}  (sha256 ${after}, cmp ${cmpOk ? "same" : "DIFFERS"}, ${bytes} bytes)`);
  unlinkSync(PRISTINE);

  const declaredFails = arm.mustFail.filter((n) => r.failed.some((f) => f.includes(n)));
  const brokePass = arm.mustPass.filter((n) => r.failed.some((f) => f.includes(n)));
  const finished = r.pass >= 0;
  const mustFailOk = finished && declaredFails.length === arm.mustFail.length && (arm.mustFail.length > 0 || r.fail === 0);
  const mustPassOk = finished && brokePass.length === 0;
  console.log(`  DECLARED must-FAIL: ${declaredFails.length}/${arm.mustFail.length} ${mustFailOk ? "as declared" : `— MISSING ${JSON.stringify(arm.mustFail.filter((n) => !declaredFails.includes(n)))}`}`);
  console.log(`  DECLARED must-PASS: ${mustPassOk ? "held" : `BROKEN — ${JSON.stringify(brokePass)}`}`);
  results.push({ arm, armed: true, r, restored, mustFailOk, mustPassOk });
}

copyFileSync(PRISTINE0, APP);
const finalSha = sha(APP);
let finalCmp = true;
try { execFileSync("cmp", ["-s", APP, PRISTINE0]); } catch (_) { finalCmp = false; }
unlinkSync(PRISTINE0);
if (existsSync(PRISTINE0)) console.error("  WARNING: the baseline pristine copy is still on disk");

console.log("\n==================== SUMMARY ====================");
console.log(`baseline: ${base.pass} pass, ${base.fail} fail`);
for (const x of results) {
  if (!x.armed) { console.log(`  ${x.arm.id}: ARM DID NOT ARM (${x.hits} anchor hit(s)) — a finding, not a pass`); continue; }
  console.log(`  ${x.arm.id}: ${x.r.pass} pass, ${x.r.fail} fail · must-fail ${x.mustFailOk ? "ok" : "MISSED"} · must-pass ${x.mustPassOk ? "ok" : "BROKEN"} · restored ${x.restored ? "YES" : "NO"}`);
}
console.log(`final app.html sha256 ${finalSha} — ${finalSha === SHA0 && finalCmp ? "IDENTICAL to the baseline" : "*** NOT RESTORED ***"}`);
const bad = results.filter((x) => !x.armed || !x.restored || !x.mustFailOk || !x.mustPassOk);
if (bad.length || finalSha !== SHA0 || !finalCmp) {
  console.log(`\nCONTROL NOT CLEAN: ${bad.length} arm(s) did not behave as declared.`);
  process.exitCode = 1;
} else {
  console.log(`\nCONTROL CLEAN: ${results.length} arms, each broken alone, each failing exactly where declared and nowhere it was declared not to, each restored byte-identically.`);
}
