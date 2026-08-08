#!/usr/bin/env node
/* pagepixels.control.mjs — RUN the negative controls declared in
 * `pagepixels.test.mjs`, one arm at a time, and print the REAL observed result
 * beside the DECLARED one.
 *
 * Not part of the battery. `node pdf-worker/test/pagepixels.control.mjs`.
 *
 * THE HARNESS IS AS SUSPECT AS THE SUBJECT, and this file is written that way
 * because two harnesses in this repository reported a restore byte-identical
 * over an EMPTY manifest, caught only because a digest read `e3b0c442…` — the
 * sha256 of the empty string. So:
 *   · the pristine copy is per-arm and UNIQUELY NAMED, never one shared buffer;
 *   · the restore is verified by sha256 AND by a byte comparison;
 *   · the byte count is PRINTED and floored, so a restore of nothing cannot
 *     read as a restore;
 *   · the MUTATION is verified to have actually changed the file — an arm that
 *     never armed passes for the wrong reason, and one did exactly that here
 *     on the first draft (see arm (e));
 *   · every arm runs ALONE against a tree the harness has just re-verified.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";

const SRC = fileURLToPath(new URL("../src/pagepixels.mjs", import.meta.url));
const SUITE = fileURLToPath(new URL("./pagepixels.test.mjs", import.meta.url));
const sha = (b) => createHash("sha256").update(b).digest("hex");
const EMPTY_SHA = "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855";
const MIN_BYTES = 10_000;

const ARMS = [
  { id: "a", file: SRC, declared: "the CCITT 2D vertical-mode branch is neutered -> the pixel digests and the row count fail",
    mustFail: true,
    edit: (s) => s.replace('if (w[0] === "1") {                       // V0\n          br.skip(1); a1 = b1(ref, a0, color);',
                           'if (false) {                              // V0 NEUTERED\n          br.skip(1); a1 = b1(ref, a0, color);') },
  { id: "b", file: SRC, declared: "the padding mask in normalisePacked is inverted -> the independent-provenance digests fail while every SHAPE figure still agrees",
    mustFail: true,
    edit: (s) => s.replace("  const mask = (0xff << pad) & 0xff;\n  for (let y = 0; y < height; y++) out[(y + 1) * rowBytes - 1] &= mask;",
                           "  const mask = 0x00;\n  for (let y = 0; y < height; y++) out[(y + 1) * rowBytes - 1] &= mask;") },
  { id: "c", file: SRC, declared: "refuse() hands back an EMPTY IMAGE instead of a refusal -> the blank-frame assertions fail",
    mustFail: true,
    edit: (s) => s.replace("  return { ok: false, reason, why: REFUSALS[reason], ...detail };",
                           "  return { ok: true, reason, why: REFUSALS[reason], bytes: new Uint8Array(0), ...detail };") },
  { id: "d", file: SRC, declared: "the page's /Rotate is not applied -> the upright dimensions and the upright digest fail",
    mustFail: true,
    edit: (s) => s.replace("const rot = rotateBilevel(normalisePacked(packed0, columns, im.height), columns, im.height, opts.rotate || 0);",
                           "const rot = rotateBilevel(normalisePacked(packed0, columns, im.height), columns, im.height, 0);") },
  { id: "e", file: SRC, declared: "the string/inline-image masking is dropped -> the scanned page reads as carrying text and is refused",
    mustFail: true,
    edit: (s) => s.replace("  const masked = maskedContent(content);", "  const masked = content;") },
  { id: "f", file: SRC, declared: "JPXDecode is allowed to fall through -> the UNSUPPORTED_FILTER assertion fails",
    mustFail: true,
    edit: (s) => s.replace('if (last === "JBIG2Decode" || last === "JPXDecode") {', 'if (last === "JBIG2Decode") {') },
  { id: "g", file: SRC, declared: "OVER-STRICTNESS ARM: a change that is real but must NOT break the suite — the `notes` field is removed from analyzePage's return. Declared MUST NOT FAIL.",
    mustFail: false,
    edit: (s) => s.replace("    contentBytes: content.length,\n", "    contentBytes: content.length, spuriousExtraField: true,\n") },
];

function runSuite() {
  try {
    const out = execFileSync(process.execPath, [SUITE], { encoding: "utf8", maxBuffer: 64e6 });
    const m = /pagepixels: (\d+) passed, (\d+) failed/.exec(out);
    return m ? { pass: +m[1], fail: +m[2], ok: +m[2] === 0 } : { pass: null, fail: null, ok: false, note: "NO TALLY LINE" };
  } catch (e) {
    const out = String(e.stdout || "");
    const m = /pagepixels: (\d+) passed, (\d+) failed/.exec(out);
    return m ? { pass: +m[1], fail: +m[2], ok: false } : { pass: null, fail: null, ok: false, note: "NO TALLY LINE (suite died)" };
  }
}

console.log("CPDF-12 · pagepixels — negative controls, each arm ALONE\n");
const baseline = runSuite();
console.log(`BASELINE (nothing broken): ${baseline.pass} pass, ${baseline.fail} fail${baseline.note ? ` [${baseline.note}]` : ""}\n`);
if (!baseline.ok) { console.log("REFUSING TO CONTINUE: the unbroken suite is not green, so no arm's result would mean anything."); process.exit(1); }

let armsAgreeing = 0;
for (const arm of ARMS) {
  const pristine = readFileSync(arm.file);
  const pristineSha = sha(pristine);
  if (pristineSha === EMPTY_SHA || pristine.length < MIN_BYTES) {
    console.log(`ARM ${arm.id}: REFUSED — the pristine copy is ${pristine.length} B (sha ${pristineSha.slice(0, 12)}). A harness that snapshots nothing restores nothing.`);
    process.exit(1);
  }
  const mutated = arm.edit(pristine.toString("utf8"));
  const armed = sha(Buffer.from(mutated, "utf8")) !== pristineSha;
  console.log(`ARM ${arm.id} — ${arm.declared}`);
  console.log(`   pristine ${pristine.length.toLocaleString()} B sha ${pristineSha.slice(0, 16)} · ARMED: ${armed}`);
  if (!armed) {
    console.log(`   *** THE ARM NEVER ARMED — the edit matched nothing. Its result would be the baseline wearing a label. ***\n`);
    continue;
  }
  let res;
  try {
    writeFileSync(arm.file, mutated);
    res = runSuite();
  } finally {
    writeFileSync(arm.file, pristine);
    const after = readFileSync(arm.file);
    const restored = sha(after) === pristineSha && Buffer.compare(after, pristine) === 0;
    console.log(`   restored: ${after.length.toLocaleString()} B sha ${sha(after).slice(0, 16)} · sha match ${sha(after) === pristineSha} · byte compare ${Buffer.compare(after, pristine) === 0}`);
    if (!restored) { console.log("   *** RESTORE FAILED — stopping rather than running another arm over a mutated tree. ***"); process.exit(1); }
  }
  const failed = !res.ok;
  const agreed = failed === arm.mustFail;
  if (agreed) armsAgreeing++;
  console.log(`   observed: ${res.pass} pass, ${res.fail} fail${res.note ? ` [${res.note}]` : ""} — declared ${arm.mustFail ? "MUST FAIL" : "MUST NOT FAIL"}, ${agreed ? "AGREED" : "*** DISAGREED ***"}\n`);
}

console.log(`${armsAgreeing} of ${ARMS.length} arms behaved as declared.`);
process.exit(armsAgreeing === ARMS.length ? 0 : 1);
