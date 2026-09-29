/* R50's row census (promotion R50, N319, K431), computed EXACTLY as R50 words it, so `row-census.test.mjs` can hold
   promotion's frozen `ROW_CENSUS` against the tree (P4: promotion cannot read a later module's table).

     files   every `.mjs`/`.js` in any module's `paths` (`build/modules.json`), as the commit at HEAD holds them (`git
             ls-files`, so an untracked file or an installed `node_modules` is never read), less tests (a `test/`
             directory, `*.test.mjs`, `*.control.mjs`) and scripts that run when imported (`bio-plane/scripts/`,
             `bio-plane/migrate/`, `civicos-ui/check-*.mjs`);
     table   an exported plain object;
     row     one of its values whose string `check` matches /^C-\d+/, its code the key, a missing `where` or
             `translation` null;
     once    one table object reached by two exports, or one row object in two tables, counts once; two distinct row
             objects with one check id count twice;
     digest  lines `JSON.stringify([check, code, where, translation])`, sorted by check then code in code-unit order,
             joined by "\n" with no trailing newline, SHA-256 over UTF-8, lowercase hex.

   SCRIPTS THAT RUN WHEN IMPORTED, R50's own class, are more than the three it names: the fleet members' `scripts/`
   (agent-worker's build writes its bundle when imported, measured) and `civicos-ui/deploy-ui.mjs` (it exits). They are
   left out as R50 leaves out `bio-plane/scripts/`, returned in `scripts`, and the suite fails by name if any of them
   holds a `check:` key, so leaving them out cannot move the census. Every other file is imported.
   A file node cannot import (it reaches `cloudflare:` or a browser global) is NOT skipped silently: it is returned in
   `unimportable`, and a file among them whose text holds a row literal (`check: 'C-…'`) is returned in `blind`, which
   the suite fails on by name — a census that could not read a table it was told to read is not a census. */
import { readFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

export const ROW_LITERAL = /\bcheck\s*:\s*["'`]C-\d/;
export const CHECK_KEY = /\bcheck\s*:/;
const SCRIPTS = [/^(agent-worker|pdf-worker|ocr-worker|newgroup|docprofile|jurisdictions|civicos-ui)\/scripts\//,
                 /^civicos-ui\/deploy-ui\.mjs$/];
const EXCLUDED = [/(^|\/)test\//, /\.test\.mjs$/, /\.control\.mjs$/, /^bio-plane\/scripts\//, /^bio-plane\/migrate\//,
                  /^civicos-ui\/check-[^/]*\.mjs$/];

/** The files R50 names, repository-relative and sorted, under `root` (a checkout of the repository). */
export function censusFiles(root) {
  const modules = JSON.parse(readFileSync(join(root, "build", "modules.json"), "utf8")).modules;
  const paths = [...new Set(modules.flatMap((m) => m.paths || []))];
  const tracked = execFileSync("git", ["-C", root, "ls-files", "-z", "--", ...paths], { encoding: "utf8", maxBuffer: 1 << 28 })
    .split("\0").filter(Boolean);
  return [...new Set(tracked)].filter((f) => /\.(mjs|js)$/.test(f) && !EXCLUDED.some((re) => re.test(f))).sort();
}
/** R50's files that are scripts running when imported, beyond the three it names (see the header). */
export const isScript = (f) => SCRIPTS.some((re) => re.test(f));

const plain = (v) => v !== null && typeof v === "object" && !Array.isArray(v)
  && (Object.getPrototypeOf(v) === Object.prototype || Object.getPrototypeOf(v) === null);

/** The rows, as `{check, code, where, translation, file, table}`, and the files that could not be read. */
export async function censusRows(root) {
  const files = censusFiles(root);
  const seenTables = new Set(), seenRows = new Set(), rows = [], unimportable = [], blind = [], scripts = [];
  for (const f of files) {
    if (isScript(f)) { scripts.push({ file: f, checkKey: CHECK_KEY.test(readFileSync(join(root, f), "utf8")) }); continue; }
    let mod;
    try { mod = await import(pathToFileURL(join(root, f)).href); }
    catch (e) {
      unimportable.push({ file: f, error: String(e && e.message || e).split("\n")[0].slice(0, 160) });
      if (ROW_LITERAL.test(readFileSync(join(root, f), "utf8"))) blind.push(f);
      continue;
    }
    for (const name of Object.keys(mod).sort()) {
      let table;
      try { table = mod[name]; } catch { continue; }
      if (!plain(table) || seenTables.has(table)) continue;
      seenTables.add(table);
      for (const code of Object.keys(table)) {
        const row = table[code];
        if (!row || typeof row !== "object" || typeof row.check !== "string" || !/^C-\d+/.test(row.check)) continue;
        if (seenRows.has(row)) continue;
        seenRows.add(row);
        rows.push({ check: row.check, code, where: row.where ?? null, translation: row.translation ?? null,
                    file: f, table: name });
      }
    }
  }
  return { files, rows, unimportable, blind, scripts };
}

export const lineOf = (r) => JSON.stringify([r.check, r.code, r.where, r.translation]);
const byCheckThenCode = (a, b) => (a.check < b.check ? -1 : a.check > b.check ? 1 : a.code < b.code ? -1 : a.code > b.code ? 1 : 0);

/** R50's `{rows, digest}` over a list of rows (any objects carrying check, code, where, translation). */
export function censusOf(rows) {
  const lines = [...rows].sort(byCheckThenCode).map(lineOf);
  return { rows: lines.length, digest: createHash("sha256").update(lines.join("\n"), "utf8").digest("hex"), lines };
}
