// Renders one layer's requirements files into a single viewable HTML page (for Bob; the .md files stay the record).
// Usage: node docs/development/transition/render/render-requirements.mjs <layer> <out.html>
// The page is a fragment for an Artifact publish (no <html>/<head>); wrap it in a skeleton to open it locally.
// Transitional tool: it moves to the process repository at T7.
import fs from "node:fs"; import { execSync } from "node:child_process";
const [layer = "1", out = "requirements-layer.html"] = process.argv.slice(2);
const dir = new URL(".", import.meta.url).pathname;
const order = JSON.parse(fs.readFileSync("build/modules.json", "utf8")).modules
  .filter((m) => String(m.layer) === String(layer) && !m.legacy && fs.existsSync(`build/requirements/${m.id}.md`)).map((m) => m.id);
const docs = [{ id: "README", md: fs.readFileSync("build/requirements/README.md", "utf8") }].concat(order.map((id) => {
  const md = fs.readFileSync(`build/requirements/${id}.md`, "utf8");
  return { id, md, n: new Set(md.match(/\*\*R\d+\*\*/g)).size, unmet: (md.match(/^- \*\*R\d+\*\* \*\(not yet met/gm) || []).length };
}));
const json = JSON.stringify(docs).replace(/</g, "\\u003c");
const commit = execSync("git log -1 --format=%h -- build/requirements").toString().trim();
const page = fs.readFileSync(dir + "requirements-template.html", "utf8")
  .replace("__TITLE__", `Layer ${layer} Requirements`).replace("__COMMIT__", commit)
  .replace(/<script type="text\/markdown" id="src">[\s\S]*?<\/script>/, () => `<script type="application/json" id="src">${json}</script>`)
  .replace("Layer 1 · requirements", `Layer ${layer} · requirements`).replace("<span>· Layer 1</span>", `<span>· Layer ${layer}</span>`);
fs.writeFileSync(out, page);
console.log(`${out}: ${order.length} modules, commit ${commit}`);
