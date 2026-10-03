/* case-checker — the standalone program's entry (requirements: `build/requirements/case-checker.md` R13, R16).
 *
 * Bundled with `checkCaseFile` and nothing else into one file (`./build-program.mjs`), it runs offline with nothing to
 * install: `node case-checker.mjs <part> [<part> ...] [--document <file> ...] [--keys <file>]`. It reads the files a
 * person names, runs the same `checkCaseFile` CivicOS runs, and prints each finding's result first, then the whole
 * answer as JSON. `--keys` names a file of the group's published keys, one OpenSSH public key per line. It makes no
 * network request. Its exit status is 0 when the check ran, whatever the results, and 2 when it could not read its
 * arguments. */

import { checkCaseFile, RESULT_WORDS } from "./check.mjs";

/** R13: the program, given its arguments and a way to read a file; answers the text it prints and its exit status. */
export async function runProgram(argv, readFile) {
  const parts = [], documents = [];
  let keys = null;
  const usage = "usage: node case-checker.mjs <part> [<part> ...] [--document <file> ...] [--keys <file>]";
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    try {
      if (a === "--document") documents.push(await readFile(argv[++i]));
      else if (a === "--keys") keys = new TextDecoder().decode(await readFile(argv[++i])).split(/\r?\n/).map((l) => l.trim()).filter((l) => l && !l.startsWith("#"));
      else if (a === "--help" || a === "-h") return { text: usage + "\n", status: 0 };
      else parts.push(await readFile(a));
    } catch (e) {
      return { text: `could not read ${argv[i] ?? "an argument"}: ${String(e && e.message ? e.message : e)}\n${usage}\n`, status: 2 };
    }
  }
  if (!parts.length) return { text: usage + "\n", status: 2 };
  const answer = await checkCaseFile({ parts, documents, ...(keys ? { keys } : {}) });
  const lines = answer.findings.map((f) => `${f.finding}: ${RESULT_WORDS[f.result] ?? f.result}`);
  return { text: [...lines, "", answer.statement, "", JSON.stringify(answer, null, 2), ""].join("\n"), status: 0 };
}

/* Run when this file is the program Node was started with (never in a Worker, and never when imported). */
const proc = globalThis.process;
if (proc && proc.versions && proc.versions.node && Array.isArray(proc.argv) && typeof proc.argv[1] === "string") {
  const { resolve } = await import("node:path");
  const { fileURLToPath } = await import("node:url");
  if (import.meta.url.startsWith("file:") && fileURLToPath(import.meta.url) === resolve(proc.argv[1])) {
    const fs = await import("node:fs/promises");
    const out = await runProgram(proc.argv.slice(2), (p) => fs.readFile(p).then((b) => new Uint8Array(b)));
    proc.stdout.write(out.text);
    proc.exitCode = out.status;
  }
}
