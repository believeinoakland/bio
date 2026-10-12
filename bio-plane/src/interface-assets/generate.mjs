/* interface-assets' generator (R1; K1043): writes `index.mjs` beside it from the design stream's visual language as
   committed at ASSETS_COMMIT, read from git so the working copy never moves it. Kept beside the module and imported by
   nothing, so it is not bundled. Run from anywhere: node bio-plane/src/interface-assets/generate.mjs
   A later commit is carried only by a later requirement naming it (R1): change COMMIT here, rerun, and rerun the tests. */
import { execFileSync } from "node:child_process";
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const COMMIT = "3f40899950";
const DIR = "docs/development/ux-substrate/visual-language";
const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, "../../..");
const git = (args) => execFileSync("git", args, { cwd: ROOT, maxBuffer: 1 << 26 });
const show = (path) => git(["show", `${COMMIT}:${DIR}/${path}`]);

const faces = git(["ls-tree", "--name-only", `${COMMIT}`, `${DIR}/fonts/`]).toString("utf8").split("\n")
  .filter((p) => p.endsWith(".woff2")).map((p) => p.slice(`${DIR}/fonts/`.length)).sort();
if (faces.length !== 15) throw new Error(`expected 15 faces at ${COMMIT}, found ${faces.length}`);

const css = show("civicsmith.css").toString("utf8")
  + show("faces.css").toString("utf8").replace(/url\("fonts\/([^"]+)"\)/g, 'url("/app/assets/fonts/$1")');
const entries = [
  ["civicsmith.css", { type: "text/css", body: css }],
  ["icons.svg", { type: "image/svg+xml", body: show("icons.svg").toString("utf8") }],
  ...faces.map((f) => [`fonts/${f}`, { type: "font/woff2", encoding: "base64", body: show(`fonts/${f}`).toString("base64") }]),
  ...["source-serif-4", "source-sans-3", "source-code-pro"].map((n) =>
    [`fonts/OFL-${n}.txt`, { type: "text/plain", body: show(`fonts/OFL-${n}.txt`).toString("utf8") }]),
];

const field = (e) => Object.entries(e).map(([k, v]) => `${k}: ${JSON.stringify(v)}`).join(", ");
const out = `/* GENERATED: do not edit by hand. interface-assets R1–R4 (DEC-138; N897 (1); N559): the visual language's stylesheet,
   icons, ${faces.length} faces (base64) and their three licences, read from ${DIR}/ at ASSETS_COMMIT. civicsmith.css
   is civicsmith.css followed by faces.css with each url("fonts/<f>") rewritten to url("/app/assets/fonts/<f>") (R1, R2).
   The map and each entry are frozen (R3); the module imports nothing (R4). Written by generate.mjs beside this file;
   bio-plane/test/m/interface-assets/assets.test.mjs checks every entry byte for byte against git. */
export const ASSETS_COMMIT = ${JSON.stringify(COMMIT)};
export const ASSET_FILES = Object.freeze({
${entries.map(([name, e]) => `  ${JSON.stringify(name)}: Object.freeze({ ${field(e)} }),`).join("\n")}
});
`;
writeFileSync(join(HERE, "index.mjs"), out);
console.log(`interface-assets: ${entries.length} files at ${COMMIT}, ${out.length} bytes`);
