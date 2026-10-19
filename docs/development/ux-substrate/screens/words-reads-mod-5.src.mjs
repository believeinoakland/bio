/* words-reads-mod-5.src.mjs — DEC-329 (B303 (8), K3747): the reads of installer, instance-setup and translations, written
 * to words-reads-mod-5.json for words-reads.src.mjs to fold in. A module reads every string literal in its source that is a
 * key of words.json, every key a dotted head held in a name or before `+` joins to a string it holds (`S + "skipped"`),
 * and every key a template with placeholders fits where each filled part is a string it holds.
 *
 * Run, from this folder, after node build_words.mjs, on a fresh extract of the newest tranche (or main):
 *     git -C /home/user/bio archive origin/main bio-plane/src newgroup | tar -x -C <dir>
 *     node words-reads-mod-5.src.mjs <dir> */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = process.argv[2];
if (!ROOT) { console.error("usage: node words-reads-mod-5.src.mjs <extract dir holding bio-plane/src and newgroup>"); process.exit(2); }
const KEYS = new Set(JSON.parse(fs.readFileSync(path.join(HERE, "words.json"), "utf8")).words.map((w) => w.key));
const PATHS = { installer: ["newgroup", "bio-plane/public/newgroup"], "instance-setup": ["bio-plane/src/setup.mjs", "bio-plane/src/setup-fleet.mjs", "bio-plane/src/livefire.mjs"], translations: ["bio-plane/src/translations"], "installer-steps": ["newgroup/src/steps"] };
const walk = (p) => !fs.existsSync(p) ? [] : fs.statSync(p).isDirectory() ? fs.readdirSync(p).flatMap((e) => e === "test" || e === "node_modules" ? [] : walk(path.join(p, e))) : /\.(mjs|js|html)$/.test(p) ? [p] : [];
const esc = (x) => x.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const out = {}; let problems = 0;
for (const [m, ps] of Object.entries(PATHS)) {
  const files = ps.flatMap((p) => walk(path.join(ROOT, p)));
  if (!files.length) { console.error(`${m}: no source under ${ps.join(", ")}`); problems++; continue; }
  const reads = new Set(), heads = new Set(), tails = new Set(), pats = [];
  for (const f of files) {
    const t = fs.readFileSync(f, "utf8").replace(/\/\*[\s\S]*?\*\//g, " ").replace(/(^|[^:\\"'`])\/\/[^\n]*/g, "$1");
    for (const r of t.matchAll(/["'`]([\w-]+(?:\.[\w-]+)*)["'`]/g)) { tails.add(r[1]); if (KEYS.has(r[1])) reads.add(r[1]); }
    for (const r of t.matchAll(/\b([A-Za-z_]\w*)\s*:/g)) tails.add(r[1]);
    for (const r of t.matchAll(/["'`]([a-z][\w-]*(?:\.[\w-]+)*\.)["'`]\s*[+,;)]/g)) heads.add(r[1]);
    for (const r of t.matchAll(/`([a-z][\w-]*(?:\.[\w-]+)*\.?[\w-]*(?:\$\{[^}`]*\}[\w.-]*)+)`/g))
      pats.push(new RegExp("^" + r[1].split(/\$\{[^}`]*\}/).map(esc).join("([\\w-]+)") + "$"));
  }
  for (const h of heads) for (const tl of tails) if (KEYS.has(h + tl)) reads.add(h + tl);
  for (const re of pats) for (const k of KEYS) { const mm = re.exec(k); if (mm && mm.slice(1).every((x) => tails.has(x))) reads.add(k); }
  /* the keys DEC-329 minted for the module, read once its source carries them (B303 (2), (7), (11)) */
  const own = { installer: /^installer\./, "instance-setup": /^instance-setup\./, translations: /^translations\./, "installer-steps": /^$/ }[m];
  for (const k of KEYS) if (own.test(k)) reads.add(k);
  /* B323 (7): reads the installer's source on main does not yet show, and reads it no longer has. ui.mjs:71 reads the
     Irreversible weight's name (R41); screen.install.stopped.running (K3864) and installer.fact.unknown.older (DEC-331) are
     no longer read. Applied after the own-family rule above, which would list the second whether or not it is read. */
  if (m === "installer") { reads.add("weight.irreversible.name"); reads.delete("screen.install.stopped.running"); reads.delete("installer.fact.unknown.older"); }
  /* DEC-362 (B375 (4)): installer-steps reads exactly the keys its STEP_KEYS list holds (R36), and the list is its reads */
  if (m === "installer-steps") {
    const src = fs.readFileSync(path.join(ROOT, "newgroup/src/steps/words.mjs"), "utf8");
    const list = [...(src.match(/STEP_KEYS\s*=\s*Object\.freeze\(\[([\s\S]*?)\]\)/) || ["", ""])[1].matchAll(/["'`]([\w.-]+)["'`]/g)].map((x) => x[1]);
    reads.clear(); for (const k of list) { if (KEYS.has(k)) reads.add(k); else { console.error(`installer-steps: ${k} is no word`); problems++; } }
  }
  out[m] = { reads: [...reads].sort(), unkeyed: [], note: `DEC-329 (B303 (8)): read from ${ps.join(", ")}; its own ${own.source.slice(1)} keys listed whether or not its source names them yet` };
  console.log(m.padEnd(16), reads.size, "keys,", files.length, "files");
}
fs.writeFileSync(path.join(HERE, "words-reads-mod-5.json"), JSON.stringify(out, null, 1) + "\n");
process.exit(problems ? 1 : 0);
