#!/usr/bin/env node
/* Build the Worker that answers reader-container's binding and hosts its container class (K5637) into one
 * self-contained module, committed, with the manifest beside it, by bundler's recipe, as every fleet member's bundle is
 * (bundler R24). `@cloudflare/containers` is a devDependency inlined here; the image does not install it.
 *
 * Run from reader-container/: `npm run build` (needs `npm ci` here and in bio-plane/, which holds esbuild).
 */
import { discoverMembers, writeMember } from "../../bio-plane/scripts/fleet-bundle.mjs";

const member = discoverMembers().find((m) => m.name === "reader-container");
if (!member) throw new Error("reader-container declares no fleet-member.json — it cannot be discovered");
if (!member.bundle) throw new Error("reader-container/fleet-member.json declares no `bundle` block");

const { built, manifest } = await writeMember(member);
console.log(`reader-container: built ${member.bundle.outfile} — ${built.bytes.length} B, sha256 ${built.sha256}`);
console.log(`reader-container: wrote ${member.bundle.manifest} — ${manifest.inputs.length} first-party input(s), `
  + `${manifest.vendoredInputs.length} vendored`);
