/* UI-119 — the negative control for `ui119-records-law.test.mjs`.
 * Run: `node civicos-ui/test/ui119-records-law.control.mjs [arm]`.
 *
 * NOT a `.test.mjs`: it runs the suite once per arm. It NEVER edits `app.html` or `setup.mjs` — each arm is ONE
 * splice applied to the EXTRACTED script (the app's, or the setup page's as `SETUP_HTML` serves it), written to
 * a temp file OUTSIDE the worktree and handed to the suite through UI119_APP_SRC / UI119_SETUP_SRC, so there is
 * nothing to restore (UI-102's control is the precedent). Each arm is armed ALONE and its splice is asserted to
 * match EXACTLY ONCE: an arm that did not arm is a finding, not a pass.
 *
 * DECLARED BEFORE ARMING — what MUST fail, and what MUST NOT:
 *   baseline   nothing armed. MUST be GREEN, 37/0.
 *   dropvalue  THE ROW'S CONTROL — *drop the control's value from the act*: addGo stops passing `law`.
 *              MUST FAIL, BY NAME: "UI-119 STATED: op=projection reads the member's law VERBATIM, state
 *              stated" and "UI-119 STATED: …and the stored bytes carry it". MUST NOT FAIL: §2 (untouched
 *              reads undetermined either way), §3, §4 (the setup page is its own writer), §5.
 *   setupdrop  the setup page's writer drops the law line. MUST FAIL: "UI-119 SETUP STATED". MUST NOT FAIL:
 *              every app arm, and "SETUP OTHER KIND"/"SETUP UNTOUCHED" (they assert absence).
 *   prefill    DEC-69's liar: the app's law opens holding a California citation. MUST FAIL: "the law control
 *              is EMPTY when drawn", "…names no law of its own anywhere", "UI-119 UNTOUCHED". MUST NOT FAIL:
 *              §1 (the member's typing replaces it), §3, §4.
 *   otherkind  the app writes `law` on any kind. MUST FAIL: "UI-119 OTHER KIND: the law typed before the switch
 *              is NOT written". MUST NOT FAIL: "…the plane reads the cpra_request AS WRITTEN" — recordsLawOf
 *              answers `kind` for a cpra_request whatever its bytes carry, so that arm is BLIND to this break
 *              and is kept beside the one that sees it.
 *   setupwords the setup page's refusal goes back to "Refused: <code>". MUST FAIL: "UI-119 SETUP WORDS" and
 *              "…a refusal carrying a canned translation renders the translation". MUST NOT FAIL: the rest.
 *   spelling   OVER-STRICTNESS: a correct app control in a spelling the suite did not anticipate — attributes
 *              reordered, id last-but-one, an extra aria-label. MUST FAIL NOTHING. Declared limit of the
 *              matchers: they read DOUBLE-QUOTED attributes only (the app's own markup convention).
 */
import "../../bio-plane/test/stdio.mjs";
import fs from "fs";
import os from "os";
import path from "path";
import { execFileSync } from "child_process";
import { appScript } from "./extract.mjs";
import { SETUP_HTML } from "../../bio-plane/src/setup.mjs";

const SUITE = new URL("./ui119-records-law.test.mjs", import.meta.url).pathname;
const APP = appScript();
const SETUP = SETUP_HTML.slice(SETUP_HTML.lastIndexOf("<script>") + 8, SETUP_HTML.lastIndexOf("</script>"));

const LAW_INPUT = '<input class="txt" id="ac-law" style="max-width:520px" value="${esc(ADD_ACT.law)}" oninput="addActSync()">';
const ARMS = {
  baseline:   { expect: [] },
  dropvalue:  { app: ['? { kind: ADD_ACT.kind, risk_tier: ADD_ACT.tier, law: ADD_ACT.law,', '? { kind: ADD_ACT.kind, risk_tier: ADD_ACT.tier,'],
                expect: ["UI-119 STATED: op=projection reads the member's law VERBATIM, state stated",
                         "UI-119 STATED: …and the stored bytes carry it as one quoted line, the section sign intact"] },
  setupdrop:  { setup: ['if (lawText) fm.push("law: " + JSON.stringify(lawText));', 'if (false) fm.push("law: " + JSON.stringify(lawText));'],
                expect: ["UI-119 SETUP STATED: op=projection reads the setup page's law VERBATIM, kind records_request"] },
  prefill:    { app: ['tier:"undetermined", law:"",', 'tier:"undetermined", law:"Cal. Gov. Code § 7920.000",'],
                expect: ["the law control is EMPTY when drawn — no value",
                         "…and the pane names no law of its own anywhere (no CPRA, no FOIA, no ordinance)",
                         "UI-119 UNTOUCHED: no law line in the bytes, and op=projection reads the plane's own UNDETERMINED"] },
  otherkind:  { app: ['const lawText = a.kind === "records_request" ? String(a.law || "").trim() : "";', 'const lawText = String(a.law || "").trim();'],
                expect: ["UI-119 OTHER KIND: the law typed before the switch is NOT written — no law line on a cpra_request"] },
  setupwords: { setup: ['if (typeof x.translation === "string" && x.translation) return x.translation;\n  if (typeof x.detail === "string" && x.detail) return x.detail;',
                        'if (false) return x.translation;\n  if (false) return x.detail;'],
                /* the findings branch is ALSO disarmed, or the arm moves only half the rule */
                setup2: ['if (fs.length) return fs.join(" ");', 'if (false) return fs.join(" ");'],
                expect: ["UI-119 SETUP WORDS: the setup page renders that refusal in the PLANE's words, verbatim, and not its code",
                         "…and a refusal carrying a canned translation renders the translation, not the code"] },
  spelling:   { app: [LAW_INPUT, '<input oninput="addActSync()" value="${esc(ADD_ACT.law)}" aria-label="law" id="ac-law" class="txt" style="max-width:520px">'],
                expect: [] },
};

const splice = (src, pair, arm) => {
  if (!pair) return src;
  const n = src.split(pair[0]).length - 1;
  if (n !== 1) throw new Error(`arm ${arm}: anchor matched ${n} times, not once — the arm did not arm: ${pair[0].slice(0, 80)}`);
  return src.replace(pair[0], () => pair[1]);
};
const want = process.argv[2];
const dir = fs.mkdtempSync(path.join(os.tmpdir(), "ui119-control-"));
let asDeclared = 0, not = 0;
for (const [arm, a] of Object.entries(ARMS)) {
  if (want && arm !== want) continue;
  const appF = path.join(dir, `${arm}.app.js`), setF = path.join(dir, `${arm}.setup.js`);
  fs.writeFileSync(appF, splice(APP, a.app, arm));
  fs.writeFileSync(setF, splice(splice(SETUP, a.setup, arm), a.setup2, arm));
  let out = "", code = 0;
  try { out = execFileSync("node", [SUITE], { env: { ...process.env, UI119_APP_SRC: appF, UI119_SETUP_SRC: setF },
                                              stdio: "pipe", maxBuffer: 64 * 1024 * 1024 }).toString(); }
  catch (e) { code = e.status; out = String(e.stdout || "") + String(e.stderr || ""); }
  const failed = [...out.matchAll(/^  FAIL  (.*)$/gm)].map((m) => m[1]);
  const tally = (/ui119-records-law: (\d+) pass, (\d+) fail/.exec(out) || []).slice(1).join("/") || "NO TALLY";
  const missing = a.expect.filter((x) => !failed.includes(x));
  const extra = failed.filter((x) => !a.expect.includes(x));
  const good = tally !== "NO TALLY" && missing.length === 0 && extra.length === 0 && (a.expect.length ? code === 1 : code === 0);
  good ? asDeclared++ : not++;
  console.log(`${good ? "AS DECLARED" : "NOT AS DECLARED"}  ${arm}: exit ${code} · ${tally}`
    + (failed.length ? `\n    failed: ${failed.map((x) => JSON.stringify(x)).join("\n            ")}` : "")
    + (missing.length ? `\n    MISSING: ${JSON.stringify(missing)}` : "") + (extra.length ? `\n    EXTRA: ${JSON.stringify(extra)}` : ""));
}
fs.rmSync(dir, { recursive: true, force: true });
console.log(`\nui119-records-law.control: ${asDeclared + not} arms run, ${asDeclared} AS DECLARED, ${not} not`);
process.exit(not ? 1 : 0);
