/* Suite hygiene: the guard against a battery that wastes hours.
 *
 * Miniflare runs a real workerd child process. A suite that builds one and
 * never disposes it finishes its assertions in about a second, prints its
 * result, and then hangs until something kills it. Nothing fails, nothing
 * is reported, and the only symptom is that the battery takes minutes
 * instead of seconds. That defect shipped in three suites written on July
 * 24, 2026 and cost roughly 150 seconds per suite per run before anyone
 * measured it rather than assuming.
 *
 * The rules below are the two that make a hang impossible:
 *   1. Every Miniflare a suite constructs, it disposes.
 *   2. Every suite ends by exiting on its own result, so a lingering
 *      handle can never turn a green run into a hang.
 *
 * This suite reads its siblings as text on purpose. It is cheap, it needs
 * no runtime, and it catches the mistake at the moment it is made rather
 * than the next time somebody wonders why the battery is slow.
 */
import { readdirSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join } from "node:path";

const DIR = fileURLToPath(new URL(".", import.meta.url));
let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${JSON.stringify(want)}\n         got  ${JSON.stringify(got)}`}`);
  ok ? pass++ : fail++;
};

const suites = readdirSync(DIR).filter((f) => f.endsWith(".test.mjs") && f !== "hygiene.test.mjs");
t("there are suites to check", suites.length > 0, true);

console.log("\n--- every workerd instance is shut down ---");
for (const f of suites) {
  const src = readFileSync(join(DIR, f), "utf8");
  const built = (src.match(/new Miniflare\(/g) || []).length;
  if (!built) continue;
  const disposed = (src.match(/\.dispose\(\)/g) || []).length;
  t(`${f} disposes all ${built} of its Miniflare instances`, disposed >= built, true);
}

console.log("\n--- every suite ends on its own result ---");
for (const f of suites) {
  const src = readFileSync(join(DIR, f), "utf8");
  const tail = src.slice(-400);
  t(`${f} exits deterministically`, /process\.exit\((?!1\))/.test(tail) || /process\.exit\(fail/.test(tail), true);
}


/* ---- the generated page cannot be broken by its own comments ----
 * setup.mjs is one enormous template literal. An unescaped backtick inside it
 * TERMINATES the literal, and a ${ starts an interpolation, so a comment
 * written in ordinary prose can silently destroy the module or the served
 * script. This has now happened twice: the 0.3.8 hang, where escapes were eaten
 * and the browser received a dead script, and again on 2026-07-24, where a
 * comment quoting two field names in backticks made the module unparseable.
 *
 * Both were found by accident. This finds them on purpose.
 */
console.log("\n--- the served page template is intact ---");
{
  const src = readFileSync(join(DIR, "..", "src", "setup.mjs"), "utf8");
  const open = src.indexOf("export const SETUP_HTML = `");
  t("setup.mjs still exports one template literal", open > -1, true);
  const body = src.slice(open + "export const SETUP_HTML = `".length, src.lastIndexOf("`;"));
  let ticks = 0, interps = 0, i = 0;
  while (i < body.length) {
    if (body[i] === "\\") { i += 2; continue; }
    if (body[i] === "`") ticks++;
    if (body[i] === "$" && body[i + 1] === "{") interps++;
    i += 1;
  }
  t("no unescaped backtick inside it", ticks, 0);
  /* Interpolations are legitimate: the page injects the catalog's tables. They
     are counted so a surprising jump is visible in a diff rather than silent. */
  t("interpolations are few and deliberate", interps <= 4, true);

  /* The strongest check available without a browser: the module loads, and the
     script it serves parses as JavaScript. */
  let loaded = null;
  try { loaded = (await import("../src/setup.mjs")).SETUP_HTML; } catch (e) {
    console.log("    load error:", e.message);
  }
  t("the module loads", typeof loaded, "string");
  if (typeof loaded === "string") {
    const script = loaded.slice(loaded.lastIndexOf("<script>") + 8, loaded.lastIndexOf("</script>"));
    let parses = true;
    try { new Function(script); } catch (e) { parses = false; console.log("    parse error:", e.message); }
    t("the script it serves parses", parses, true);
  }
}

console.log(`\nhygiene: ${pass} pass, ${fail} fail`);
process.exit(fail ? 1 : 0);
