/* THE TREE A MUTATION CONTROL BREAKS (K5245). A `*.control.mjs` here breaks a source file and runs a suite against it.
 * It used to break the TRACKED file in place and restore it in a `finally`; a run killed, cut by a timeout or
 * overlapping another left the source broken in that container, and two jobs committed such files. Now every control
 * imports `TREE_TEST_DIR` from here and derives all its paths from it: the directories its suites import are copied
 * once into a temporary directory (`os.tmpdir()`), the control mutates and runs THERE, and the directory is deleted at
 * exit. The tracked tree is never written. A control killed with SIGKILL leaves only a `bio-mutation-` directory in
 * the temporary directory, and `git status` clean.
 *
 * What is copied: every member directory but `LEFT_OUT`, without `.git` and `node_modules`; each `node_modules` is linked
 * to the real one (third-party code only,
 * never mutated).
 */
import { cpSync, existsSync, mkdtempSync, readdirSync, rmSync, symlinkSync } from "node:fs";
import { tmpdir } from "node:os";
import { basename, dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const REAL_TEST_DIR = dirname(fileURLToPath(import.meta.url));
const REAL_REPO = join(REAL_TEST_DIR, "..", "..");
/* Every member directory but the ones no suite a control runs reads: the build record, the documents, the releases and
   the installer. (A closure of static imports missed what miniflare reads, so the rule is by exclusion.) */
const LEFT_OUT = new Set(["build", "docs", "release", "newgroup", "site"]);
const MEMBERS = readdirSync(REAL_REPO, { withFileTypes: true })
  .filter((e) => e.isDirectory() && !e.name.startsWith(".") && !LEFT_OUT.has(e.name)).map((e) => e.name);
const SKIP = new Set([".git", "node_modules"]);

export const TREE = mkdtempSync(join(tmpdir(), "bio-mutation-"));
const dispose = () => { try { rmSync(TREE, { recursive: true, force: true }); } catch { /* the temporary directory's own */ } };
process.on("exit", dispose);
for (const sig of ["SIGINT", "SIGTERM", "SIGHUP"]) process.on(sig, () => { dispose(); process.exit(1); });

for (const m of MEMBERS) {
  if (!existsSync(join(REAL_REPO, m))) continue;
  cpSync(join(REAL_REPO, m), join(TREE, m), { recursive: true, filter: (src) => !SKIP.has(basename(src)) });
  if (existsSync(join(REAL_REPO, m, "node_modules"))) symlinkSync(join(REAL_REPO, m, "node_modules"), join(TREE, m, "node_modules"), "dir");
}

/* The copy of `agent-worker/test`: the control's `HERE`/`DIR`. */
export const TREE_TEST_DIR = join(TREE, "agent-worker", "test");
