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
  return out.join("\n\n");
}
if (import.meta.url === `file://${process.argv[1]}`) process.stdout.write(bundle(new URL("../", import.meta.url)));
