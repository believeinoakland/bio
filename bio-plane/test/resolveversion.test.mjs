/* DS-2 / D-116 — the version authority spans the fleet.
 *
 * TESTED AGAINST SYNTHETIC TREES, NOT ONLY THE REAL ONE, and that is a lesson
 * this repository already paid for: `waitquiet.test.mjs`'s first version
 * asserted a property of the MACHINE and was green alone and red inside the
 * battery. A suite that only asserts "the real tree agrees" passes for as long
 * as the tree happens to agree and proves nothing about the predicate. So the
 * arms below BUILD trees that disagree in each direction and require the exact
 * refusal. One live arm asserts the real tree, which is the ratchet.
 *
 * NEGATIVE CONTROL: RUN 2026-09-11, five arms, each a tree built to disagree in
 * one specific way — (a) a member left BEHIND the authority is refused, and both
 * of its declaring sites are named with the exact edit; (b) a member bumped
 * AHEAD of the authority is refused too, which is the direction a one-sided
 * check misses and the dangerous one, since it claims a version the plane has
 * never been built as; (c) the plane's own wrangler.jsonc disagreeing with its
 * own package.json is refused, so the authority is not exempt from the rule it
 * sets; (d) an authority declaring NO version refuses instead of electing
 * whatever a member happens to say; (e) THE ARM THAT PROVES THE OTHERS MEAN
 * SOMETHING — an agreeing tree is NOT reported as skewed, without which every
 * arm above would pass on a resolver that simply always refused.
 */
import "./stdio.mjs";
import "./sandbox.mjs";
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { resolveVersion, versionSites } from "../scripts/resolve-version.mjs";

let pass = 0, fail = 0;
const t = (name, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  ok ? pass++ : fail++;
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${name}`);
  if (!ok) console.log(`        got ${JSON.stringify(got)} want ${JSON.stringify(want)}`);
};

console.log("\n--- resolve-version: one version across the plane and every member ---");

/** A synthetic repo root: the plane plus named members, each at a given version. */
function tree(planeVersion, members) {
  const root = mkdtempSync(join(tmpdir(), "rv-"));
  const write = (dir, version, marker) => {
    mkdirSync(join(root, dir), { recursive: true });
    if (version !== undefined) {
      writeFileSync(join(root, dir, "package.json"),
        JSON.stringify(version === null ? { name: dir } : { name: dir, version }, null, 2));
    }
    writeFileSync(join(root, dir, "wrangler.jsonc"),
      `{ // a comment with a URL https://example.com/x\n  "name": "${dir}",\n  "vars": { "VERSION": "${version ?? "0.0.0"}" }\n}\n`);
    if (marker) writeFileSync(join(root, dir, "fleet-member.json"),
      JSON.stringify({ name: dir, entry: "src/index.mjs", bundle: {
        entry: "src/index.mjs", outfile: `dist/${dir}.bundled.mjs`,
        manifest: `dist/${dir}.bundle.json` } }));
  };
  write("bio-plane", planeVersion, false);
  for (const [name, v] of Object.entries(members)) write(name, v, true);
  return root;
}

const roots = [];
const mk = (...a) => { const r = tree(...a); roots.push(r); return r; };

try {
  /* ARM 1 — a tree that agrees resolves, and finds every site. */
  {
    const r = resolveVersion(mk("0.56.0", { "pdf-worker": "0.56.0", "agent-worker": "0.56.0" }));
    t("ARM 1: a fleet that agrees resolves to the authority's version",
      [r.ok, r.version, r.findings.length], [true, "0.56.0", 0]);
    t("ARM 1b: and it discovered all six declaring sites (2 per directory)",
      r.sites.length, 6);
  }

  /* ARM 2 — BEHIND. The ordinary staleness. */
  {
    const r = resolveVersion(mk("0.56.0", { "pdf-worker": "0.56.0", "agent-worker": "0.1.0" }));
    t("ARM 2 (BEHIND): a member left at an older version is refused", r.ok, false);
    t("ARM 2b: and BOTH of that member's sites are named, with the exact edit",
      [r.findings.length,
       r.findings.some((f) => f.includes("agent-worker/package.json") && f.includes('to "0.56.0"')),
       r.findings.some((f) => f.includes("agent-worker/wrangler.jsonc") && f.includes("vars.VERSION"))],
      [2, true, true]);
  }

  /* ARM 3 — AHEAD, the direction a one-sided check would miss and the dangerous
     one: a member claiming a version the plane has never been built as. */
  {
    const r = resolveVersion(mk("0.56.0", { "pdf-worker": "0.99.0", "agent-worker": "0.56.0" }));
    t("ARM 3 (AHEAD): a member bumped PAST the authority is refused too", r.ok, false);
    t("ARM 3b: naming the member that is ahead, not the authority",
      r.findings.every((f) => f.includes("pdf-worker")), true);
  }

  /* ARM 4 — the plane's own two files must agree with each other. */
  {
    const root = mk("0.56.0", { "pdf-worker": "0.56.0" });
    writeFileSync(join(root, "bio-plane", "wrangler.jsonc"),
      `{\n  "name": "bio-plane",\n  "vars": { "VERSION": "0.55.0" }\n}\n`);
    const r = resolveVersion(root);
    t("ARM 4: the plane's own wrangler.jsonc is checked against its package.json",
      [r.ok, r.findings.some((f) => f.includes("bio-plane/wrangler.jsonc"))], [false, true]);
  }

  /* ARM 5 — no authority at all. Refused rather than defaulted: a missing
     authority must not silently elect whatever a member happens to say. */
  {
    const r = resolveVersion(mk(null, { "pdf-worker": "0.1.0" }));
    t("ARM 5: an authority declaring no version refuses instead of defaulting",
      [r.ok, r.version, r.findings[0].includes("THE authority")], [false, null, true]);
  }

  /* ARM 6 — THE SUITE CAN FAIL. An agreeing tree must NOT be reported as
     skewed; without this, every arm above would pass on a resolver that simply
     always refused. */
  {
    const r = resolveVersion(mk("1.2.3", { "pdf-worker": "1.2.3" }));
    t("ARM 6 (proves the arms mean something): an agreeing tree is not refused",
      [r.ok, r.findings.length], [true, 0]);
  }

  /* ARM 7 — THE LIVE RATCHET. The real repository must agree, which is what
     makes this suite a floor rather than a description. */
  {
    const r = resolveVersion();
    t("ARM 7 (live): this repository's own fleet agrees on one version",
      r.ok, true);
    if (!r.ok) for (const f of r.findings) console.log("        " + f.split("\n")[0]);
    /* CORRECTED 2026-09-12 by CPDF-10, NEVER EXEMPTED. This read `6` — the plane
       and TWO members at two declaring sites each — and it was right the day it
       was written. The fleet gained a THIRD member (`ocr-worker`, the Tier-3 OCR
       path), so the true figure is 8 and the old assertion was superseded by a
       fact rather than wrong about one. **The `8` is the point of the arm and
       not incidental to it**: a new member that declared no version, or declared
       it in only one of its two sites, would leave this at 6 or 7 and the
       authority would then be silently unenforced for that member — which is the
       exact hole DS-2 built this suite to close, in the direction a per-member
       walk cannot see. Move it WITH the fleet, in the same turn. */
    t("ARM 7b: and the live tree declares the plane and all THREE members (8 sites)",
      versionSites().length, 8);
  }
} finally {
  for (const r of roots) rmSync(r, { recursive: true, force: true });
}

console.log(`\nresolve-version: ${pass} pass, ${fail} fail`);
process.exit(fail ? 1 : 0);
