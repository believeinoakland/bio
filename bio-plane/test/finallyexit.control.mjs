/* finallyexit.control.mjs — M0-134's negative control, deliberately NOT a `.test.mjs`: it EDITS REAL SUITES
 * while it runs and the battery must not discover it. Run: `node test/finallyexit.control.mjs [arm]`.
 *
 * ARMS (each armed ALONE, every restore verified by sha256 AND byte compare against a per-arm pristine copy
 * inside this worktree, byte count printed and floored):
 *   baseline       nothing armed -> hygiene exits 0.
 *   nocatch        severedhomes.test.mjs's catch removed -> hygiene exits 1 NAMING severedhomes.test.mjs
 *                  at "every finally-exit follows a catch that counts a failure".
 *   emptycatch     severedhomes.test.mjs's catch body emptied (`catch {}`, THE LIAR) -> hygiene exits 1 naming it.
 *   throw:<suite>  a throw planted at the foot of the suite's `try` -> the suite exits 1 and prints the throw.
 *                  One per suite in the census, so "a planted throw in any listed suite exits 1" is driven, not argued.
 *   before         severedhomes.test.mjs's catch removed AND a throw planted -> the suite exits 0 over the throw:
 *                  the PRE-FIX state, proved rather than described. Two edits on purpose: the claim is about the pair.
 *
 * The driver declares its tally at its head (ARMS below) and asserts it at its foot.
 */
import { readFileSync, writeFileSync, copyFileSync, mkdirSync, rmSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { anchorTable } from "../scripts/anchortable.mjs";

const TEST = fileURLToPath(new URL(".", import.meta.url));
const PLANE = join(TEST, "..");
const PRISTINE = join(PLANE, "..", ".m0134-control-pristine");   /* gitignored; removed on a clean run */
const sha = (b) => createHash("sha256").update(b).digest("hex");
const SUITES = ["capture-text-index.test.mjs", "rec119-version-legs-earned.test.mjs", "severedhomes.test.mjs",
  "strengthpair.test.mjs", "versions.test.mjs", "versionstate.test.mjs"];
const PLANT = `throw new Error("M0-134 PLANTED THROW");\n`;
const CATCH_AT = /\n\} catch \((?:e|err)\) \{\n/g;       // the catch that pairs with the suite's finally-exit
const SEV = "severedhomes.test.mjs";
const sevCatch = (src) => {                               // [start, end) of severedhomes' whole catch clause
  const a = src.indexOf("\n} catch (e) {\n  /* M0-134: A THROW");
  const b = src.indexOf("\n} finally {", a);
  return a < 0 || b < 0 ? null : [a, b];
};
const plantAt = (src) => { const m = [...src.matchAll(CATCH_AT)]; return m.length === 1 ? m[0].index + 1 : -1; };

const ARMS = {
  baseline: { file: SEV, edit: (s) => s, run: "hygiene.test.mjs", want: 0 },
  nocatch: { file: SEV, edit: (s) => { const r = sevCatch(s); return r && s.slice(0, r[0]) + s.slice(r[1]); },
             run: "hygiene.test.mjs", want: 1, names: /FAIL  every finally-exit follows a catch that counts a failure .*severedhomes\.test\.mjs:\d+ no-catch/ },
  emptycatch: { file: SEV, edit: (s) => { const r = sevCatch(s); return r && s.slice(0, r[0]) + "\n} catch {" + s.slice(r[1]); },   /* `} catch {` + the `\n} finally {` kept = `catch {}` */
                run: "hygiene.test.mjs", want: 1, names: /FAIL  every finally-exit follows a catch that counts a failure .*severedhomes\.test\.mjs:\d+ catch-does-not-count/ },
  before: { file: SEV, edit: (s) => { const r = sevCatch(s); if (!r) return null; const t = s.slice(0, r[0]) + s.slice(r[1]);
              const at = t.indexOf("\n} finally {") + 1; return t.slice(0, at) + PLANT + t.slice(at); },
            run: SEV, want: 0, names: /severedhomes: \d+ pass, 0 fail/ },
};
for (const f of SUITES) ARMS[`throw:${f}`] = { file: f, edit: (s) => { const at = plantAt(s); return at < 0 ? null : s.slice(0, at) + PLANT + s.slice(at); },
  run: f, want: 1, names: /M0-134 PLANTED THROW/ };
const DECLARED = 4 + SUITES.length;
/* M0-197: the anchors the arms' edit functions look for, as data for tools/anchordrift.mjs (a no-op otherwise). */
const SEV_AT = [{ file: join(TEST, SEV), find: "\n} catch (e) {\n  /* M0-134: A THROW" }, { file: join(TEST, SEV), find: "\n} finally {", sites: "any" }];
anchorTable([{ arm: "baseline", none: "nothing armed: the baseline edits no file" }, ...["nocatch", "emptycatch", "before"].flatMap((arm) => SEV_AT.map((r) => ({ arm, ...r }))),
  ...SUITES.map((f) => ({ arm: `throw:${f}`, file: join(TEST, f), find: CATCH_AT }))]);

const only = process.argv[2];
const chosen = Object.keys(ARMS).filter((k) => !only || k === only);
/* PREFLIGHT (D-331): every chosen arm's edit must ARM before anything is written. */
const table = chosen.map((k) => { const src = readFileSync(join(TEST, ARMS[k].file), "utf8");
  const out = ARMS[k].edit(src); return [k, out !== null && (k === "baseline" || out !== src)]; });
for (const [k, ok] of table) console.log(`  preflight ${k}: ${ok ? "arms" : "DOES NOT ARM"}`);
if (table.some(([, ok]) => !ok)) { console.log("REFUSED: an arm does not arm; nothing was written"); process.exit(2); }

mkdirSync(PRISTINE, { recursive: true });
let asDeclared = 0;
for (const k of chosen) {
  const arm = ARMS[k], target = join(TEST, arm.file), pristine = join(PRISTINE, `${k.replace(/[:/]/g, "_")}--${arm.file}`);
  const original = readFileSync(target);
  copyFileSync(target, pristine);
  let code = null, out = "";
  try {
    writeFileSync(target, arm.edit(original.toString("utf8")));
    const r = spawnSync(process.execPath, [join(TEST, arm.run)], { cwd: PLANE, encoding: "utf8", maxBuffer: 64 << 20 });
    code = r.status; out = (r.stdout || "") + (r.stderr || "");
  } finally {
    copyFileSync(pristine, target);
    const back = readFileSync(target);
    const same = back.length === original.length && back.equals(original) && sha(back) === sha(original);
    console.log(`  restore ${k}: ${back.length} B, sha256 ${sha(back).slice(0, 12)}…, byte-identical ${same ? "YES" : "NO"}`);
    if (!same || back.length < 10_000) { console.log(`  RESTORE FAILED for ${k} — repair from ${pristine}`); process.exit(3); }
  }
  const tally = (out.match(/\n[^\n]*?(\d+) pass(?:ed)?, (\d+) fail(?:ed)?\s*$/) || [])[0]?.trim() ?? "-1 (no tally)";
  const ok = code === arm.want && (!arm.names || arm.names.test(out));
  if (ok) asDeclared++;
  console.log(`  ARM ${k}: exit ${code} (declared ${arm.want})${arm.names ? `, names ${arm.names.test(out) ? "YES" : "NO"}` : ""} · ${tally} -> ${ok ? "AS DECLARED" : "NOT AS DECLARED"}`);
}
rmSync(PRISTINE, { recursive: true, force: true });        /* every restore verified above, so the pen is spent */
console.log(`\nfinallyexit.control:${asDeclared}/${chosen.length} arms as declared${only ? "" : ` (declared ${DECLARED})`}`);
process.exit(asDeclared === chosen.length && (only || chosen.length === DECLARED) ? 0 : 1);
