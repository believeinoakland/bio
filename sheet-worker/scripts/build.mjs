#!/usr/bin/env node
/* Build sheet-worker's bundle and manifest through bundler's one recipe (`bio-plane/scripts/fleet-bundle.mjs`),
 * which the fleet guard also builds with when it checks the committed artifact. The engine wasm is built separately
 * (`npm run build:engine`) and committed; this step hashes it into the manifest as an upload part.
 * Run from sheet-worker/: `npm run build`. */
import { discoverMembers, writeMember } from "../../bio-plane/scripts/fleet-bundle.mjs";

const member = discoverMembers().find((m) => m.name === "sheet-worker");
if (!member || !member.bundle) throw new Error("sheet-worker/fleet-member.json is missing or declares no bundle");
const { built, manifest } = await writeMember(member);
console.log(`sheet-worker: built ${member.bundle.outfile} — ${built.bytes.length} B, sha256 ${built.sha256}`);
console.log(`sheet-worker: wrote ${member.bundle.manifest} — ${manifest.inputs.length} first-party input(s), `
  + `${manifest.vendoredInputs.length} vendored, ${(manifest.assets || []).length} upload asset(s)`);
for (const a of manifest.assets || []) console.log(`            asset ${a.path} — ${a.bytes} B, sha256 ${a.sha256}`);
