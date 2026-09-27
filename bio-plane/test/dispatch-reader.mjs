/* T4 (legacy-tests), 2026-09-27: THE DISPATCH READER, TAKEN INTO THE TEST DIRECTORY.
 *
 * `scripts/op-claims.mjs` was removed with the old process's tooling (legacy-index, N12). `rung-ladder.test.mjs` does
 * not test that tool: it borrowed its reader of the plane's dispatch table (the `OPS` rows and their `mutating` flag,
 * the `DO_PATH` aliases, the store's `const map = {` routes) to derive its op set rather than list it. As T3 did for
 * `jsonc.mjs` (LEGACY-TESTS #1, N14's borrowers), the reader comes here verbatim from the removed file at
 * `c086c0dbb6~1`: `tableBody`, `bodyAt`, `STORE_DISPATCH_ANCHOR`, `readDispatch`, `routeOf`, `PLANE`. Nothing of the
 * claim sweep, the ledger or the walks came with it. */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const HERE = dirname(fileURLToPath(import.meta.url));
export const PLANE = join(HERE, "..");
/* ------------------------------------------------------------- the authority */

/* The body of a `<name> = { ... }` object literal, brace-matched out of source so a
   table read this way cannot fall behind a hand-kept list (D-113/D-93). The same
   reader `coverage.mjs` uses on the same table, for the same reason. */
function tableBody(src, name) {
  const decl = new RegExp(`(?:const|let|var)\\s+${name}\\s*=\\s*\\{`);
  const m = decl.exec(src);
  if (!m) return null;
  const i = src.indexOf("{", m.index);
  let depth = 0;
  for (let p = i; p < src.length; p++) {
    if (src[p] === "{") depth++;
    else if (src[p] === "}") { depth--; if (depth === 0) return src.slice(i + 1, p); }
  }
  return null;
}

/* The object literal opening at an anchor. The store's dispatch is a bare
   `const map = {` inside `fetch()`, not a module-level declaration, so it is found
   by its anchor rather than by name. */
function bodyAt(src, anchor) {
  const i = src.indexOf(anchor);
  if (i < 0) return null;
  const open = src.indexOf("{", i);
  let depth = 0;
  for (let p = open; p < src.length; p++) {
    if (src[p] === "{") depth++;
    else if (src[p] === "}") { depth--; if (depth === 0) return src.slice(open + 1, p); }
  }
  return null;
}

export const STORE_DISPATCH_ANCHOR = "const map = {";

export function readDispatch(planeDir = PLANE) {
  const indexSrc = readFileSync(join(planeDir, "src/index.mjs"), "utf8");
  const storeSrc = readFileSync(join(planeDir, "src/store.mjs"), "utf8");

  const opsBody = tableBody(indexSrc, "OPS");
  if (opsBody == null) throw new Error("OPS table not found in src/index.mjs");
  const opRows = [...opsBody.matchAll(/^\s{2}([a-z][a-z0-9]*)\s*:\s*\{([^}]*)\}/gm)];
  const ops = new Set(opRows.map((m) => m[1]));

  /* FW-14: THE `mutating` FLAG OFF THE SAME ROWS, added here rather than in a
     second reader. The rung ladder's op set is "every op the dispatch table
     declares mutating", and `scripts/coverage.mjs` already reads this flag with
     this exact predicate — but coverage.mjs runs top-level and exits, so it
     cannot be imported. Growing THIS reader by one field is CPDF-9's rule
     applied: one mechanism for one job. Every existing field of the returned
     table is untouched, because `test/op-claims.test.mjs` pins them. */
  const mutating = new Set(opRows.filter((m) => /mutating:\s*true/.test(m[2])).map((m) => m[1]));

  /* The public-name -> DO-path alias map. THE ONE PLACE that difference lives, and
     the reason existence alone is not a sufficient check. */
  const doPathBody = tableBody(indexSrc, "DO_PATH");
  const doPath = new Map();
  if (doPathBody != null)
    for (const m of doPathBody.matchAll(/([a-z][a-z0-9]*)\s*:\s*"([a-z][a-z0-9]*)"/g))
      doPath.set(m[1], m[2]);

  /* DO path -> the function the table names. The two that route through a viewer
     guard name the guard; that is correct, because the claim being checked is which
     function the TABLE names, not what that function goes on to do. */
  const mapBody = bodyAt(storeSrc, STORE_DISPATCH_ANCHOR);
  if (mapBody == null) throw new Error("store dispatch map not found in src/store.mjs");
  const routes = new Map();
  for (const m of mapBody.matchAll(/^\s{8}([a-z][a-z0-9]*)\s*:\s*\(\)\s*=>\s*(?:this\.)?(#?[A-Za-z0-9_]+)/gm))
    routes.set(m[1], m[2]);

  return { ops, mutating, doPath, routes };
}

/* Where an op actually goes: the alias first, then the store's own table. */
export function routeOf(op, table) {
  const path = table.doPath.get(op) ?? op;
  return { doPath: path, method: table.routes.get(path) ?? null };
}

