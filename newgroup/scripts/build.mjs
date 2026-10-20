/* The installer's bundle (`npm run build`), as one function the freshness guard calls too (bio-plane/test/system/
   newgroup-bundle-fresh.test.mjs), so the guard cannot drift from the build.
 *
 * R72 (K3366): `setup-words`' list is 2.08 MB and the bundle carries only the rows the installer's own keys name. The
 * one difference from a plain esbuild bundle is a plugin that, when `setup-words/rows.mjs` is loaded, answers it with
 * exactly the rows whose key is in `src/words.mjs`'s KEYS (and the keys of the words-reads list for `setup-fleet.mjs`,
 * the plane leaf the installer imports); nothing else about the bundle changes. */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const NG = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const ROWS = path.resolve(NG, "../bio-plane/src/setup-words/rows.mjs");
const READS = path.resolve(NG, "../docs/development/ux-substrate/screens/words-reads.json");

/* Every module the bundle holds, by its file: one esbuild pass with the rows and the generated release stubbed out. */
async function bundledInputs() {
  const esbuild = await import("esbuild");
  const stub = { name: "stub-big-inputs", setup(build) {
    build.onLoad({ filter: /setup-words[\\/]rows\.mjs$/ }, () => ({ loader: "js", contents: "export const WORDS_COMMIT = ''; export const WORD_ROWS = [];" }));
    build.onLoad({ filter: /newgroup[\\/]src[\\/]release\.mjs$/ }, () => ({ loader: "js",
      contents: "export const RELEASE_PACKED = '', RELEASE_FACTS = null, RELEASE_VERSION = '', RELEASE_MANIFEST = null, RELEASE_CONTAINERS = [];" }));
  } };
  const built = await esbuild.build({ absWorkingDir: NG, entryPoints: ["src/index.mjs"], bundle: true, format: "esm", platform: "neutral",
    write: false, metafile: true, plugins: [stub], logLevel: "silent" });
  return Object.keys(built.metafile.inputs).map((f) => path.resolve(NG, f));
}

/* The keys the bundle's rows are cut to, sorted: the installer's own (src/words.mjs), what `setup-fleet.mjs` reads, and the keys any
   other module the bundle holds names in a `word("…")` call (a module such as record-grammar's `document.mjs` reads some when it is
   loaded, and a row the bundle lacks would stop the installer at load, R72). */
export async function bundledKeys() {
  const { KEYS } = await import(path.join(NG, "src/words.mjs"));
  const fleet = JSON.parse(readFileSync(READS, "utf8")).modules["setup-fleet.mjs"]?.reads ?? [];
  const named = [];
  for (const f of await bundledInputs()) if (/\.mjs$/.test(f)) for (const m of readFileSync(f, "utf8").matchAll(/\bword\(\s*(["'])([A-Za-z0-9_.-]+)\1/g)) named.push(m[2]);
  return [...new Set([...KEYS, ...fleet, ...named])].sort();
}

export async function bundleOptions() {
  const keep = new Set(await bundledKeys());
  const cutRows = {
    name: "cut-word-rows",
    setup(build) {
      build.onLoad({ filter: /setup-words[\\/]rows\.mjs$/ }, async () => {
        const mod = await import(ROWS);
        const rows = mod.WORD_ROWS.filter((r) => keep.has(r[0]));
        return { loader: "js", contents:
          `export const WORDS_COMMIT = ${JSON.stringify(mod.WORDS_COMMIT)};\n`
          + `export const WORD_ROWS = Object.freeze(${JSON.stringify(rows)}.map((r) => Object.freeze(r)));\n` };
      });
    },
  };
  return { absWorkingDir: NG, entryPoints: ["src/index.mjs"], bundle: true, format: "esm", platform: "neutral",
    outfile: "dist/newgroup.bundled.mjs", plugins: [cutRows], logLevel: "silent" };
}

/* The bundle's text, built in memory with the esbuild the caller holds. */
export async function bundleText(esbuild) {
  const built = await esbuild.build({ ...(await bundleOptions()), write: false });
  return built.outputFiles[0].text;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const esbuild = await import("esbuild");
  const { writeFileSync } = await import("node:fs");
  const text = await bundleText(esbuild);
  writeFileSync(path.join(NG, "dist/newgroup.bundled.mjs"), text);
  console.log(`built dist/newgroup.bundled.mjs (${text.length} bytes, ${(await bundledKeys()).length} words)`);
}
