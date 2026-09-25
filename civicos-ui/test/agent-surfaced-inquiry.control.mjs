/* D-82 — THE NEGATIVE CONTROL FOR `agent-surfaced-inquiry.test.mjs`.
 *
 * NOT A SUITE. Deliberately not named `*.test.mjs`: `civicos-ui/test/run.mjs` DISCOVERS `.test.mjs` by filename and
 * would run this, count it into the UI baseline, and report a "suite" whose job is to make its subject go RED.
 *
 * Each arm is armed ALONE against the ONE pristine copy read at start (held in memory under this run's name), every
 * restore is verified by sha256 AND by content with a byte count and a minimum guard, and each patch must match
 * EXACTLY ONCE before it is applied — an arm that did not arm is a finding, not a pass. Each arm's result is DECLARED
 * before it runs (`must` / `mustNot`), and the driver fails when the run does not match, including when it fails MORE
 * than declared.
 *
 * ============================== THE ARMS ==============================
 * BASELINE — no mutation. DECLARED: 0 fail.
 *
 * (A) NEUTER THE HELPER — `surfacedByAgentHtml` returns "" for every value. THE ROW'S CONTROL.
 *   DECLARED: every AGENT arm fails BY NAME, on all seven surfaces; every MEMBER and CORPUS arm stays green.
 *
 * (B) THE LIAR WHO MARKS EVERY QUESTION — the helper stops asking the value.
 *   DECLARED: every MEMBER arm fails; every AGENT arm stays green (the split is the discrimination).
 *
 * (C) THE SET IGNORES THE STAMP — the list read asks `type:inquiry` without `fm:surfaced_by=agent`, so every question
 *   is "named". DECLARED: the five LIST surfaces' MEMBER arms fail, and so does "RECORD PAGE · MEMBER", whose page
 *   lists the member-opened BASE question among what it cites — the arm measures the list rows there, not the page's
 *   own seal. "QUESTION PAGE · MEMBER" STAYS GREEN: a question's own page reads its own front matter, not the set.
 *
 * (D) OVER-STRICTNESS — the question page reads the projection's value first and the bytes second (the other order of
 *   two readings of one record). Correct work in a spelling this suite did not author. DECLARED: 0 fail.
 *
 * (E) THE UNDETERMINED NOTE IS DROPPED — a failed set read then renders exactly like "nobody here was a machine".
 *   DECLARED: "UNDETERMINED · and SAYS so once" fails; nothing else.
 *
 * ---------------------------------------------------------------------------
 * RUN 2026-09-23 (D-82), results from this file's own run: app.html returned to its pristine sha256 after every arm,
 * content-compare clean, 1438468 bytes. SIX ARMS, ALL AS DECLARED, exit 0:
 * BASELINE 34/0 · A 27/7 · B 26/8 · C 24/10 · D 34/0 · E 33/1.
 * STATED, NOT SMOOTHED: arm D is a WEAK over-strictness arm. In this fixture the bytes and the projection agree, so
 * swapping the order of the two readings cannot change what renders; it proves the arm is not a fence on the spelling,
 * and nothing about a record where the two disagree (which the plane does not produce: fm_json is projected from the
 * same bytes at promotion).
 */
import "../../bio-plane/test/stdio.mjs";
import fs from "fs";
import { execFileSync } from "child_process";
import { createHash } from "crypto";
import { anchorTable } from "../../bio-plane/scripts/anchortable.mjs";

const APP = new URL("../app.html", import.meta.url);
const SUITE = new URL("./agent-surfaced-inquiry.test.mjs", import.meta.url).pathname;
const sha = (v) => createHash("sha256").update(v).digest("hex");
const PRISTINE = fs.readFileSync(APP, "utf8");
const PRISTINE_SHA = sha(PRISTINE);
const MIN_BYTES = 1_000_000;
if (Buffer.byteLength(PRISTINE) < MIN_BYTES)
  throw new Error(`app.html is ${Buffer.byteLength(PRISTINE)} bytes — below the ${MIN_BYTES} floor; a control over a truncated subject refutes nothing.`);
console.log(`pristine app.html: ${PRISTINE_SHA} · ${Buffer.byteLength(PRISTINE)} bytes\n`);

const AGENT_ARMS = ["RECORD LIST · AGENT", "FOCUS LIST · AGENT", "PROJECT · AGENT", "DOCUMENT PAGE · cited by · AGENT",
  "QUESTION PAGE · what relies on this · AGENT", "QUESTION PAGE · AGENT", "RECORD PAGE · AGENT"];
const LIST_MEMBER_ARMS = ["RECORD LIST · MEMBER", "FOCUS LIST · MEMBER", "PROJECT · MEMBER",
  "DOCUMENT PAGE · cited by · MEMBER", "QUESTION PAGE · what relies on this · MEMBER"];
const MEMBER_ARMS = [...LIST_MEMBER_ARMS, "QUESTION PAGE · MEMBER", "RECORD PAGE · MEMBER"];
const CORPUS_ARMS = ["RECORD LIST · CORPUS", "FOCUS LIST · CORPUS", "PROJECT · CORPUS"];

const ARMS = [
  { id: "BASELINE", what: "no mutation at all", must: [], mustNot: [], expectFail: 0 },
  { id: "A", what: "neuter the helper: surfacedByAgentHtml returns nothing",
    from: `function surfacedByAgentHtml(surfacedBy){\n  if(surfacedBy !== "agent") return "";`,
    to:   `function surfacedByAgentHtml(surfacedBy){\n  return "";`,
    must: AGENT_ARMS, mustNot: [...MEMBER_ARMS, ...CORPUS_ARMS] },
  { id: "B", what: "the liar who marks every question: the helper stops asking the value",
    from: `function surfacedByAgentHtml(surfacedBy){\n  if(surfacedBy !== "agent") return "";`,
    to:   `function surfacedByAgentHtml(surfacedBy){\n  if(false) return "";`,
    must: MEMBER_ARMS, mustNot: AGENT_ARMS },
  { id: "C", what: "the list read ignores the stamp: every question is named",
    from: "q:`${type} fm:surfaced_by=agent`",
    to:   "q:`${type}`",
    must: [...LIST_MEMBER_ARMS, "RECORD PAGE · MEMBER"], mustNot: [...AGENT_ARMS, "QUESTION PAGE · MEMBER"] },
  { id: "D", what: "OVER-STRICTNESS: the question page reads the projection's value before the bytes'",
    from: `</span>\${surfacedByAgentHtml(fm.surfaced_by || (fmj && fmj.surfaced_by))}</p>`,
    to:   `</span>\${surfacedByAgentHtml((fmj && fmj.surfaced_by) || fm.surfaced_by)}</p>`,
    must: [], mustNot: [], expectFail: 0 },
  { id: "E", what: "the undetermined note is dropped",
    from: `  if(!hasRows || AGENT_SURFACED.complete) return "";`,
    to:   `  return "";`,
    must: ["UNDETERMINED · and SAYS so once"], mustNot: [...AGENT_ARMS, ...MEMBER_ARMS], expectFail: 1 },
];

/* M0-197: the arms' anchors as data, for tools/anchordrift.mjs (a no-op outside its dry read). */
anchorTable(ARMS.map((a) => (a.from !== undefined ? { arm: a.id, file: APP.pathname, find: a.from, put: a.to } : { arm: a.id, none: "nothing armed" })));

let armsWrong = 0;
for (const arm of ARMS) {
  console.log(`=== ARM ${arm.id} — ${arm.what} ===`);
  let text = PRISTINE;
  if (arm.from !== undefined) {
    const hits = PRISTINE.split(arm.from).length - 1;
    if (hits !== 1) { console.log(`  ARM ${arm.id} DID NOT ARM: its anchor occurs ${hits} time(s), not exactly once.`); armsWrong++; continue; }
    text = PRISTINE.split(arm.from).join(arm.to);
    if (text === PRISTINE) { console.log(`  ARM ${arm.id} DID NOT ARM: the mutation changed nothing.`); armsWrong++; continue; }
    console.log(`  armed: ${Buffer.byteLength(PRISTINE)} -> ${Buffer.byteLength(text)} bytes`);
  } else console.log("  armed: nothing changed (baseline)");

  fs.writeFileSync(APP, text);
  let out = "";
  try { out = String(execFileSync("node", [SUITE], { stdio: "pipe", maxBuffer: 64 * 1024 * 1024 })); }
  catch (e) { out = String(e.stdout || "") + String(e.stderr || ""); }
  /* RESTORE FIRST, VERIFY SECOND, REPORT THIRD. */
  fs.writeFileSync(APP, PRISTINE);
  const back = fs.readFileSync(APP, "utf8");
  const restored = sha(back) === PRISTINE_SHA && back === PRISTINE && Buffer.byteLength(back) === Buffer.byteLength(PRISTINE);
  console.log(`  restored: sha256 ${sha(back)} · cmp ${back === PRISTINE ? "clean" : "DIFFERS"} · ${Buffer.byteLength(back)} bytes · ${restored ? "OK" : "RESTORE FAILED"}`);
  if (!restored) { console.log("  REFUSING TO CONTINUE: the tree was not restored."); process.exit(1); }

  const tally = /agent-surfaced-inquiry: (\d+) pass, (\d+) fail/.exec(out);
  const passN = tally ? Number(tally[1]) : -1, failN = tally ? Number(tally[2]) : -1;
  const failed = [...out.matchAll(/^ {2}FAIL {2}(.*)$/gm)].map((m) => m[1]);
  console.log(`  RESULT: ${passN}/${failN}${tally ? "" : "  (NO TALLY — the suite did not reach its own foot)"}`);
  for (const f of failed) console.log(`     FAILED: ${f.slice(0, 118)}`);
  const wrong = [];
  if (!tally) wrong.push("the suite produced no tally at all");
  if (arm.expectFail !== undefined && failN !== arm.expectFail) wrong.push(`declared ${arm.expectFail} failure(s), saw ${failN}`);
  if (arm.expectFail === undefined && failN < 1) wrong.push("declared failures, saw none");
  for (const m of arm.must) if (!failed.some((f) => f.startsWith(m))) wrong.push(`DECLARED TO FAIL and did not: "${m}"`);
  for (const m of arm.mustNot) if (failed.some((f) => f.startsWith(m))) wrong.push(`DECLARED TO SURVIVE and did not: "${m}"`);
  if (wrong.length) { armsWrong++; for (const w of wrong) console.log(`  ARM ${arm.id} NOT AS DECLARED: ${w}`); }
  else console.log(`  ARM ${arm.id}: AS DECLARED`);
  console.log("");
}
const final = fs.readFileSync(APP, "utf8");
console.log(`FINAL app.html: ${sha(final)} · ${Buffer.byteLength(final)} bytes · ${sha(final) === PRISTINE_SHA && final === PRISTINE ? "IDENTICAL to pristine" : "DIFFERS — FIX THE TREE"}`);
console.log(`agent-surfaced-inquiry.control: ${ARMS.length} arm(s), ${armsWrong} NOT as declared`);
if (armsWrong || sha(final) !== PRISTINE_SHA) process.exitCode = 1;
