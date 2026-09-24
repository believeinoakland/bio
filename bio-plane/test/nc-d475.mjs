/* D-475's negative control for `test/d475-page-namespace.test.mjs`. Each arm ALONE against a uniquely-named pristine
 * copy of `src/index.mjs`; restore by cp, verified by sha256 AND by byte comparison, byte count floored. Run from
 * `bio-plane/`: `node test/nc-d475.mjs [arm]`.
 *
 * WHAT EACH ARM MUST FAIL IS DECLARED AS A COMPLETE SET, not as a list of names to look for: the driver reads every
 * `FAIL <label>:` the suite printed and reports BOTH the declared failures that passed and the undeclared ones that
 * failed. A must-list alone hides the second kind, and this driver's first draft did — arm C was written declaring
 * B1 and silently also broke B2, which is the same arm's consequence and is now declared.
 *
 *   A  THE ROW'S CONTROL — the `store=` parameter IGNORED at the page again (`pageStore` a constant `"bio"`, the read
 *      exactly as it stood before this row).  MUST FAIL A1 (`/?store=scratch` serves the scratch record's slug) and
 *      A3 (the two surfaces agree).  A2 MUST STAY GREEN, and that pairing is the arm's whole value: an arm that broke
 *      both halves could not tell this fix from one that simply points the page at scratch.
 *   B  A HALF FIX — the store passed through but D-456's gate not run at the route, so `/?store=nonsense` serves the
 *      record again.  MUST FAIL C1, C2, C3 and R4 (the span no longer calls the gate), and NOTHING in sections 1, 2
 *      or 4: the half fix really does fix the half it fixes.
 *   C  OVER-STRICTNESS — the page refuses ANY named `store=`, `bio` included.  MUST FAIL B1 and B2 (both drive
 *      `/?store=bio`, one for the page and one for its `no-store` header).
 *   D  OVER-STRICTNESS the other way — the page reads SCRATCH by default (the ternary inverted), which is this row's
 *      defect pointing outward: a copy's public front door naming a testing area's group.  MUST FAIL A2 and A3.
 *
 * WHAT THIS DRIVER CANNOT SEE, stated: it patches `src/index.mjs` only. A defect introduced in `src/setup.mjs`'s
 * renderer, or in the store's public reader, is `group-public.control.mjs`'s subject and not this one's.
 */
import { readFileSync, writeFileSync, copyFileSync, rmSync } from "node:fs";
import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const SRC = fileURLToPath(new URL("../src/index.mjs", import.meta.url));
const SUITE = fileURLToPath(new URL("./d475-page-namespace.test.mjs", import.meta.url));
const hash = (b) => createHash("sha256").update(b).digest("hex");
const PRISTINE = readFileSync(SRC);
if (PRISTINE.length < 100000) throw new Error(`pristine index.mjs is ${PRISTINE.length} bytes — refusing to arm`);
const H0 = hash(PRISTINE);

const STORE_LINE = `      const pageStore = url.searchParams.get("store") === SCRATCH ? SCRATCH : "bio";`;
const GATE_CALL = `      const pageNamespace = namespaceGate(url);\n      if (pageNamespace) return pageNamespace;\n`;

const ARMS = {
  A: { declared: "FAIL", mustFail: ["A1", "A3"],
       patch: [[STORE_LINE, `      const pageStore = "bio";`]] },
  B: { declared: "FAIL", mustFail: ["R4", "C1", "C2", "C3"],
       patch: [[GATE_CALL, ""]] },
  C: { declared: "FAIL", mustFail: ["B1", "B2"],
       patch: [[STORE_LINE, `      if (url.searchParams.has("store") && url.searchParams.get("store") !== SCRATCH)\n`
                          + `        return namespaceGate(new URL("http://x/?store=__nc_d475_refuse__"));\n${STORE_LINE}`]] },
  D: { declared: "FAIL", mustFail: ["A2", "A3"],
       patch: [[STORE_LINE, `      const pageStore = url.searchParams.get("store") === "bio" ? "bio" : SCRATCH;`]] },
};

const wanted = process.argv[2];
if (wanted && !ARMS[wanted]) { console.error(`unknown arm ${wanted}; arms: ${Object.keys(ARMS).join(", ")}`); process.exit(2); }
const names = wanted ? [wanted] : Object.keys(ARMS);

const rows = [];
for (const id of names) {
  const arm = ARMS[id];
  const aside = `${SRC}.nc-d475-${id}.pristine`;
  copyFileSync(SRC, aside);
  let text = PRISTINE.toString("utf8"), armed = true, why = "";
  for (const [from, to] of arm.patch) {
    const n = text.split(from).length - 1;
    if (n !== 1) { armed = false; why = `anchor matched ${n} times: ${from.slice(0, 60)}`; break; }
    text = text.replace(from, () => to);
  }
  let exit = null, out = "";
  if (armed) {
    writeFileSync(SRC, text);
    const r = spawnSync(process.execPath, [SUITE], { encoding: "utf8", timeout: 600000 });
    exit = r.status; out = (r.stdout || "") + (r.stderr || "");
  }
  copyFileSync(aside, SRC); rmSync(aside);
  const back = readFileSync(SRC);
  const restored = hash(back) === H0 && Buffer.compare(back, PRISTINE) === 0 && back.length === PRISTINE.length;
  const foot = out.match(/d475-page-namespace: (\d+) passed, (\d+) failed/);
  /* The suite prints one `  FAIL  <label>: …` line per failed assertion; the label is what a report cites. */
  const failed = [...out.matchAll(/^ {2}FAIL {2}([A-Z]\d[a-z]?):/gm)].map((m) => m[1]);
  const missing = arm.mustFail.filter((m) => !failed.includes(m));
  const unexpected = failed.filter((f) => !arm.mustFail.includes(f));
  const threw = /FAIL {2}the suite threw/.test(out);
  const actual = !armed ? "NOT ARMED" : !foot ? "NO FOOT (-1)" : exit === 0 ? "GREEN" : "FAIL";
  const asDeclared = actual === arm.declared && !threw && missing.length === 0 && unexpected.length === 0;
  rows.push({ id, declared: arm.declared, actual, why, missing, unexpected, threw, asDeclared, restored,
              tally: foot ? `${foot[1]}/${Number(foot[1]) + Number(foot[2])}` : "-1" });
}
let bad = 0;
for (const r of rows) {
  if (!r.asDeclared || !r.restored) bad++;
  console.log(`  arm ${r.id}: declared ${r.declared}, actual ${r.actual} · ${r.tally} · restore `
    + `${r.restored ? "sha256+cmp identical" : "MISMATCH"} · ${r.asDeclared ? "AS DECLARED" : "NOT AS DECLARED"}`
    + (r.why ? `\n      ${r.why}` : "")
    + (r.threw ? "\n      the suite THREW before its foot — the tally below it is not a measurement" : "")
    + (r.missing.length ? `\n      declared to fail but passed: ${JSON.stringify(r.missing)}` : "")
    + (r.unexpected.length ? `\n      failed but not declared: ${JSON.stringify(r.unexpected)}` : ""));
}
console.log(`\nnc-d475: ${rows.length - bad}/${rows.length} arms as declared · pristine src/index.mjs `
  + `${PRISTINE.length} B sha256 ${H0.slice(0, 12)}`);
process.exit(bad ? 1 : 0);
