/* plane R95 (fix round 7, G83; K4752 D1; review2 G6), T1, THE CENSUS: no product file under `bio-plane/src` calls `idFromName` on the team's namespace (`env.STORE`) outside
   `bio-plane/src/store-place.mjs` (runtime-limits R28), so no place can create the room without the location hint and the generation. It matches CODE only: comments and string
   literals are ignored (`store.mjs`, `ai-runs`, `watchdog.mjs` say the word in comments). `bio-plane/src/stewards/` would be another Worker's object (the `stewards` namespace),
   excluded by name; none sits under `bio-plane/src` today, so nothing is excluded in fact. A typeof check (`typeof env.STORE?.idFromName`) is not a call and is not matched.
   RED BY NAME until every owner has merged its re-point (ai-runs, admission, instance-setup, control-plane, plane); this module's sites are re-pointed. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const SRC = fileURLToPath(new URL("../../../src/", import.meta.url));
const HELPER = "store-place.mjs";
const EXCLUDED = ["stewards"];

/** `text` with comments and the insides of string, template (outside `${}`) and regex-free literals blanked, so a match is code. */
export function codeOnly(text) {
  let out = "", i = 0;
  const n = text.length;
  const stack = [];   /* template-literal nesting: each entry counts the open braces of a `${` */
  while (i < n) {
    const c = text[i], d = text[i + 1];
    if (c === "/" && d === "/") { while (i < n && text[i] !== "\n") i++; continue; }
    if (c === "/" && d === "*") { i += 2; while (i < n && !(text[i] === "*" && text[i + 1] === "/")) { if (text[i] === "\n") out += "\n"; i++; } i += 2; out += " "; continue; }
    if (c === "'" || c === '"') {
      i++; while (i < n && text[i] !== c) { if (text[i] === "\\") i++; i++; } i++; out += '""'; continue;
    }
    if (c === "`") {
      i++;
      for (;;) {
        while (i < n && text[i] !== "`" && !(text[i] === "$" && text[i + 1] === "{")) { if (text[i] === "\\") i++; else if (text[i] === "\n") out += "\n"; i++; }
        if (text[i] === "$") {   /* an expression inside the template is code */
          i += 2; let depth = 1; out += " ";
          while (i < n && depth > 0) { if (text[i] === "{") depth++; else if (text[i] === "}") depth--; if (depth > 0) out += text[i]; i++; }
          continue;
        }
        i++; break;
      }
      out += '""'; continue;
    }
    out += c; i++;
  }
  void stack;
  return out;
}
const sources = (dir) => readdirSync(dir).flatMap((f) => {
  const p = join(dir, f);
  if (statSync(p).isDirectory()) return f === "node_modules" || EXCLUDED.includes(f) ? [] : sources(p);
  return f.endsWith(".mjs") ? [p] : [];
});

test("R95 (G83) T1: the scanner reads code only: a call is found, the same words in a comment, a string or a typeof check are not", () => {
  const c = (t) => /\bidFromName\s*\(/.test(codeOnly(t));
  assert.equal(c("const a = env.STORE.get(env.STORE.idFromName(n));"), true);
  assert.equal(c("x // idFromName(\"bio\")\ny"), false);
  assert.equal(c("/* idFromName( */ y"), false);
  assert.equal(c('const s = "idFromName(";'), false);
  assert.equal(c("const s = `idFromName(`;"), false);
  assert.equal(c("const s = `${env.STORE.idFromName(n)}`;"), true);
  assert.equal(c("STORE: typeof env.STORE?.idFromName === \"function\","), false);
  assert.equal(c('fetch("http://do/x"); env.STORE.idFromName(n);'), true);
});
test("R95 (G83) T1: no file under bio-plane/src calls idFromName outside store-place.mjs (the census of the team's room); the helper's file does", () => {
  const files = sources(SRC);
  assert.ok(files.length > 100, "the walk found the product");
  const sites = files.flatMap((f) => codeOnly(readFileSync(f, "utf8")).split("\n").map((l, i) => /\bidFromName\s*\(/.test(l) ? `${relative(SRC, f)}:${i + 1}` : null).filter(Boolean));
  const helper = sites.filter((s) => s.startsWith(HELPER + ":"));
  assert.ok(helper.length >= 1, "control: the helper's file does call it");
  assert.deepEqual(sites.filter((s) => !s.startsWith(HELPER + ":")), [], "every site goes through storeId/storeStub");
});
