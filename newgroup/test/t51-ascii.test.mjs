/* T51 fix round 6, G39: the installer's bundle is pure ASCII (R82). The build's own function, `bundleText` (the one `npm run build` and
 * the freshness guard both call), is run with the esbuild the lockfile pins; the text it answers holds no byte above 0x7F, the bundle
 * still answers the installer's routes exactly as the source does, and its recipe is bundler's (R2): the options `asciiOptions()`
 * states, so the installer holds none of its own. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import * as esbuild from "esbuild";
import { bundleText, bundleOptions } from "../scripts/build.mjs";
import { asciiOptions } from "../../bio-plane/scripts/fleet-bundle.mjs";
import installer from "../src/index.mjs";

test("R82 the installer's bundle holds no byte over 0x7F, answers its routes as the source does, and is built with bundler's ASCII recipe", async () => {
  const text = await bundleText(esbuild);
  await esbuild.stop();
  let high = 0;
  for (let i = 0; i < text.length; i++) if (text.charCodeAt(i) > 0x7f) high++;
  assert.equal(high, 0, "no character above U+007F, so V8 holds the source one byte a character");
  /* The options are bundler's, spread whole, with nothing of the installer's own beside them. */
  const options = await bundleOptions();
  for (const [k, v] of Object.entries(asciiOptions())) assert.deepEqual(options[k], v, k);
  /* Behaviour unchanged: the pages the bundle serves are the source's, byte for byte. */
  const dir = mkdtempSync(join(tmpdir(), "ng-ascii-"));
  try {
    const file = join(dir, "newgroup.bundled.mjs");
    writeFileSync(file, text);
    const bundled = (await import(pathToFileURL(file).href)).default;
    for (const path of ["/", "/update", "/nowhere"]) {
      const a = await installer.fetch(new Request("https://installer.example" + path), {});
      const b = await bundled.fetch(new Request("https://installer.example" + path), {});
      assert.equal(b.status, a.status, path);
      assert.equal(await b.text(), await a.text(), path);
    }
  } finally { rmSync(dir, { recursive: true, force: true }); }
});
