#!/usr/bin/env node
/* Build the PLANE into its committed one-part bundle, plus the manifest the
 * FL-9 gate reads — the plane's thin caller on agent-worker's pattern (FL-10).
 *
 * D-298 is why this exists: the committed `dist/bio-plane.bundled.mjs` was 114
 * commits stale against `src` and nothing could tell, because the battery
 * proves the artifact WORKS, never that it MATCHES. The recipe lives in
 * `scripts/fleet-bundle.mjs` — ONE expression, shared with both fleet members
 * and with the gate that verifies all three.
 *
 * `npm run build` runs `embed:sign` FIRST (package.json chains them), so the
 * generated `src/signpage.mjs` is fresh before the bundle is cut. This script
 * does not re-run it: a build step that silently regenerated a committed
 * source would hide exactly the staleness the gate exists to name.
 *
 * Run from bio-plane/: `npm run build`.
 */
import { planeMember, writeMember } from "./fleet-bundle.mjs";

const plane = planeMember();
const { built, manifest } = await writeMember(plane);
console.log(`bio-plane: built ${plane.bundle.outfile}`
  + ` — ${built.bytes.length} B, sha256 ${built.sha256}`);
console.log(`bio-plane: wrote ${plane.bundle.manifest}`
  + ` — ${manifest.inputs.length} first-party input(s), ${manifest.vendoredInputs.length} vendored`);
