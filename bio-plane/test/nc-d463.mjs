/* D-463's negative control for `test/d463-confined-credential.test.mjs`. Each arm ALONE against a uniquely-named
 * pristine copy of `src/index.mjs`; restore by cp, verified by sha256 AND by byte comparison, byte count floored.
 * Every arm declares what MUST fail; the over-strictness arms are the ones that keep the fence from being tightened
 * past its rule, which `WORKER.md` names as an undeclared interface change wearing the costume of caution.
 *
 *   A  THE BRIEF'S ARM — the confinement removed entirely (the gate answers null always: the pre-D-463 plane).
 *      MUST FAIL at the ACCEPTS-WHEN (the confined write lands in `bio`) and at the bio witness.
 *   B  A PARTIAL FIX, and the arm that matters most — a NAMED `store=bio` is still refused, but the ABSENT case is
 *      no longer set to `scratch`. MUST FAIL at the ACCEPTS-WHEN and the witness, while section 5's refusal stays
 *      green: it separates the two halves of the confinement, which a suite driving only the refusal could not.
 *   C  OVER-STRICTNESS — the gate refuses ANY named `store=`, `scratch` included.  MUST FAIL where the credential
 *      names its OWN namespace (section 5) — a confinement that refuses the place it confines you to is not tighter.
 *   D  OVER-STRICTNESS — every `ai` credential is confined, whether its row says so or not.  MUST FAIL at section 4,
 *      where the UNCONFINED credential must still land in `bio`.
 *   E  THE DECLARATION IS READ — `aiConfinementDeclaration` accepts whatever it is handed.  MUST FAIL at section 2's
 *      refusals (a credential confined to `bio`, to a namespace that does not exist, to a case variant).
 *   F  OVER-STRICTNESS at the mint — the declaration refuses `scratch` too, so nothing can be confined at all.
 *      MUST FAIL at section 2's successful mint.
 *   G  THE GATE CAN BE REACHED AROUND — it is moved AFTER D-461's pin. MUST FAIL at section 7 (a confined credential
 *      files a knock in the REAL record's inbox) and at section 8's structural pin, which is the arm that proves the
 *      order is load-bearing rather than incidental.
 */
import { readFileSync, writeFileSync, copyFileSync, rmSync } from "node:fs";
import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const SRC = fileURLToPath(new URL("../src/index.mjs", import.meta.url));
const SUITE = fileURLToPath(new URL("./d463-confined-credential.test.mjs", import.meta.url));
const hash = (b) => createHash("sha256").update(b).digest("hex");
const PRISTINE = readFileSync(SRC);
if (PRISTINE.length < 100000) throw new Error(`pristine index.mjs is ${PRISTINE.length} bytes — refusing to arm`);
const H0 = hash(PRISTINE);

const GUARD = `  if (!cred || cred.confinedTo !== SCRATCH) return null;`;
const NAMED = `  if (url.searchParams.has("store") && url.searchParams.get("store") !== SCRATCH) {`;
const SET = `  url.searchParams.set("store", SCRATCH);\n  return null;\n}`;
const DECL_SILENT = `  if (confinedTo === null || confinedTo === undefined) return { confinedTo: null };\n  const asked = String(confinedTo);`;
const DECL_REFUSE = `  if (asked !== SCRATCH)`;
const GATE_CALL = `    const confinedNamespace = confinedNamespaceGate(url, presentedAi.cred);\n    if (confinedNamespace) return confinedNamespace;\n`;
const PIN_CALL = `    const pinnedNamespace = pinnedNamespaceGate(url, op, spec);\n    if (pinnedNamespace) return pinnedNamespace;`;

const ACCEPTS_FAIL = /FAIL  the write ANSWERS, the INNER ok is true, and the envelope says which namespace answered/;
const WITNESS_FAIL = /FAIL  WITNESS: bio's counters did not move at all across the confined write/;
const ARMS = [
  { id: "A", declared: "FAIL", must: [ACCEPTS_FAIL, WITNESS_FAIL],
    patch: [[GUARD, `  return null;`]] },
  { id: "B", declared: "FAIL", must: [ACCEPTS_FAIL, WITNESS_FAIL],
    patch: [[SET, `  return null;\n}`]] },
  { id: "C", declared: "FAIL", must: [/FAIL  op=whoami · store=scratch · confined credential -> answered from scratch/],
    patch: [[NAMED, `  if (url.searchParams.has("store")) {`]] },
  { id: "D", declared: "FAIL", must: [/FAIL  an UNCONFINED credential with no store= lands in bio/],
    patch: [[GUARD, `  if (!cred) return null;`]] },
  { id: "E", declared: "FAIL", must: [/FAIL  a mint confined to "bio" is refused 403 AI_CONFINEMENT_NOT_SCRATCH/],
    patch: [[DECL_REFUSE, `  if (false)`]] },
  { id: "F", declared: "FAIL", must: [/FAIL  a member mints a credential CONFINED to scratch, and the record says so/],
    patch: [[DECL_REFUSE, `  if (asked !== "no namespace at all")`]] },
  { id: "G", declared: "FAIL", must: [/FAIL  op=knock with NO store= from a confined credential -> 400 NAMESPACE_PINNED/,
                                      /FAIL  the confinement gate runs AFTER D-456's unknown-namespace gate/],
    patch: [[GATE_CALL, ``], [PIN_CALL, PIN_CALL + "\n" + GATE_CALL.replace(/\n$/, "")]] },
  /* THE BASELINE ROW, and this file has one because a harness whose first run reported `null` for every arm was told
     apart from six-arms-broken only by its baseline (WORKER.md's measured receipt). Nothing is patched. */
  { id: "0", declared: "GREEN", must: [], patch: [] },
];

const rows = [];
for (const arm of ARMS) {
  const aside = `${SRC}.nc-d463-${arm.id}.pristine`;
  copyFileSync(SRC, aside);
  let text = PRISTINE.toString("utf8"), armed = true;
  for (const [from, to] of arm.patch) {
    const n = text.split(from).length - 1;
    if (n !== 1) { armed = false; console.log(`  arm ${arm.id}: anchor matched ${n} times — NOT ARMED`); break; }
    text = text.replace(from, to);
  }
  if (armed && arm.patch.length && text === PRISTINE.toString("utf8")) {
    armed = false; console.log(`  arm ${arm.id}: the patch changed nothing — NOT ARMED`);
  }
  let exit = null, out = "";
  if (armed) {
    if (arm.patch.length) writeFileSync(SRC, text);
    const r = spawnSync(process.execPath, [SUITE], { encoding: "utf8", timeout: 900000 });
    exit = r.status; out = (r.stdout || "") + (r.stderr || "");
  }
  copyFileSync(aside, SRC); rmSync(aside);
  const back = readFileSync(SRC);
  const restored = hash(back) === H0 && Buffer.compare(back, PRISTINE) === 0;
  const foot = out.match(/d463-confined-credential: (\d+) passed, (\d+) failed/);
  const actual = !armed ? "NOT ARMED" : !foot ? "NO FOOT (-1)" : exit === 0 ? "GREEN" : "FAIL";
  const named = actual !== "FAIL" || (arm.must || []).every((re) => re.test(out));
  const asDeclared = actual === arm.declared && named;
  rows.push({ id: arm.id, declared: arm.declared, actual, named, asDeclared, restored,
              tally: foot ? `${foot[1]}/${Number(foot[1]) + Number(foot[2])}` : "-1" });
  if (!asDeclared) console.log(out.split("\n").filter((l) => /FAIL|Error/.test(l)).slice(0, 12).join("\n"));
}
for (const r of rows)
  console.log(`  arm ${r.id}: declared ${r.declared}, actual ${r.actual}${r.actual === "FAIL" ? ` (named assertions ${r.named ? "seen" : "NOT SEEN"})` : ""} · ${r.tally} · restore ${r.restored ? "sha256+cmp identical" : "MISMATCH"} · ${r.asDeclared ? "AS DECLARED" : "NOT AS DECLARED"}`);
const ok = rows.every((r) => r.asDeclared && r.restored) && hash(readFileSync(SRC)) === H0;
console.log(`nc-d463: ${rows.filter((r) => r.asDeclared).length}/${rows.length} arms as declared · index.mjs sha256 ${H0.slice(0, 12)} ${hash(readFileSync(SRC)) === H0 ? "restored" : "NOT RESTORED"} (${PRISTINE.length} bytes)`);
process.exitCode = ok ? 0 : 1;
