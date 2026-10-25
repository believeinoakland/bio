/* WALK-FINAL-04B #1: the journey's shared helpers. Rows are appended to the record the moment each check is done. */
import { appendFileSync, existsSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { makeKit } from "../../../../bio-plane/test/m/control-plane/r8-kit.mjs";

const RECORD = fileURLToPath(new URL("../04b-documents.md", import.meta.url));
export function openRecord(header) { if (!existsSync(RECORD)) writeFileSync(RECORD, header); }
const clip = (s, n = 900) => String(s).replace(/\|/g, "\\|").replace(/\s+/g, " ").slice(0, n);
export function row(id, check, role, did, verdict, saw) {
  appendFileSync(RECORD, `| ${id} | ${clip(check, 300)} | offline (no screen width) | ${role} | ${clip(did)} | ${verdict} | ${clip(saw)} | none (offline) |\n`);
}
/* one check: its body returns the text of what was seen, or throws; a throw is BROKEN with the message */
export async function check(id, name, role, did, fn) {
  const t = Date.now();
  try {
    const r = await fn();
    const [verdict, saw] = Array.isArray(r) ? r : ["WORKS", r];
    row(id, name, role, did, verdict, `${saw} (wall ${Date.now() - t} ms)`);
    return verdict;
  } catch (e) {
    row(id, name, role, did, "BROKEN", `${e && e.message ? e.message : e} (wall ${Date.now() - t} ms)`);
    return "BROKEN";
  }
}
export { makeKit };
