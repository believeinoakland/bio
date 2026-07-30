#!/usr/bin/env node
/* Flatten docprofile/ into one script block for civicos-ui/app.html.
 *
 * The package is the canonical source and the plane imports it as modules. The UI
 * runtime is a single self-contained HTML file by design, so it carries a
 * flattened copy, and check-semantics.mjs refuses any difference between the two.
 * Concatenation rather than a bundler because the dependency graph is a straight
 * line and adding a build tool to a file that must open from disk is a cost with
 * no return. */
import fs from "fs";
export const ORDER = [
  "docprofile/index.mjs",
  "docprofile/monitoring.mjs",
  "docprofile/handlers/client-rendered.mjs",
  "docprofile/handlers/aspnet-webforms.mjs",
  "docprofile/handlers/wordpress.mjs",
  "docprofile/handlers/conservative.mjs",
  "docprofile/registry.mjs",
];
export function bundle(root) {
  const out = [];
  for (const rel of ORDER) {
    let src = fs.readFileSync(new URL(rel, root).pathname, "utf8");
    /* Imports go: every symbol is in one scope after flattening. Exports lose the
       keyword and keep the declaration. A default export becomes a named const
       derived from the file, which is what registry.mjs referred to it as. */
    const name = rel.split("/").pop().replace(/\.mjs$/, "").replace(/-([a-z])/g, (m, c) => c.toUpperCase());
    src = src.replace(/^import[\s\S]*?from\s+"[^"]*";\s*$/gm, "")
             .replace(/^export \* from "[^"]*";\s*$/gm, "")
             .replace(/^export \{[^}]*\};\s*$/gm, "")
             .replace(/^export default \{/m, `const ${name} = {`)
             .replace(/^export (const|function|async function|class)/gm, "$1");
    out.push(`/* ---- ${rel} ---- */\n` + src.trim());
  }
  const flat = out.join("\n\n");
  /* Flattening puts every module in one scope, so two files may declare the same
     top-level name and the module system will have hidden it. Caught this way once
     already: index.mjs and monitoring.mjs both declared RANK, which broke the
     entire runtime and every harness with it while each module tested green on its
     own. Cheaper to check here than to debug there. */
  const names = {};
  for (const m of flat.matchAll(/^(?:const|let|function|async function|class)\s+([A-Za-z_$][\w$]*)/gm)) {
    names[m[1]] = (names[m[1]] || 0) + 1;
  }
  const dup = Object.entries(names).filter(([, n]) => n > 1).map(([k]) => k);
  if (dup.length) throw new Error("docprofile: these top-level names are declared twice and would "
    + "collide once flattened into one scope: " + dup.join(", "));
  return flat;
}
if (import.meta.url === `file://${process.argv[1]}`) process.stdout.write(bundle(new URL("../", import.meta.url)));
