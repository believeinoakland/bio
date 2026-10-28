/* Bundles meas-entry.mjs with the plane's own recipe (bio-plane/scripts/fleet-bundle.mjs buildMember: the same esbuild options, word-table handling and ASCII post-pass), entry swapped. */
import { planeMember, buildMember } from "../bio-plane/scripts/fleet-bundle.mjs";
import { mkdirSync, writeFileSync, renameSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
const here = dirname(fileURLToPath(import.meta.url));
mkdirSync(join(here, "dist"), { recursive: true });
const m = planeMember();
m.bundle = { ...m.bundle, entry: "../proto-mem/meas-entry.mjs" };
const built = await buildMember(m, { write: false });
writeFileSync(join(here, "dist/meas.bundled.mjs.tmp"), built.bytes);
renameSync(join(here, "dist/meas.bundled.mjs.tmp"), join(here, "dist/meas.bundled.mjs"));
console.log("built proto-mem/dist/meas.bundled.mjs", built.bytes.length, "B");
