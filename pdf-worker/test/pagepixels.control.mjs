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
const DCT = fileURLToPath(new URL("../src/dctdecode.mjs", import.meta.url));
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
  /* (e) CORRECTED BY D-585, never exempted. It dropped the MASK (`const masked = content`); since D-585 the text
     question is the plane's `pageShowsText`, whose tokenizer never reads a string as an operator, so dropping the
     mask moves nothing the suite reads and the arm would arm at nothing. Its subject — an operator spelled inside
     a string must not read as text — is the same; it now breaks that directly. */
  { id: "e", file: SRC, declared: "a naive Tj scan of the UNMASKED content joins the text answer -> the string-carrying page reads as carrying text and is refused",
    mustFail: true,
    edit: (s) => s.replace("    hasTextOps: textShown === true,", "    hasTextOps: textShown === true || /(^|\\s)Tj(\\s|$)/.test(content),") },
  { id: "f", file: SRC, declared: "JPXDecode is allowed to fall through -> the UNSUPPORTED_FILTER assertion fails",
    mustFail: true,
    edit: (s) => s.replace('if (last === "JBIG2Decode" || last === "JPXDecode") {', 'if (last === "JBIG2Decode") {') },
  { id: "h", file: SRC, declared: "D-585: a bare BT counts as text again -> the empty-BT scan page is refused PAGE_HAS_TEXT_LAYER",
    mustFail: true,
    edit: (s) => s.replace("    hasTextOps: textShown === true,", "    hasTextOps: textShown === true || /(^|\\s)BT(\\s|$)/.test(masked),") },
  /* D-320's arms. Each names the assertions that MUST fail (`failsBy`) and those that MUST NOT (`spares`), so
     an arm is judged by WHICH assertion went red and not only by whether the tally moved. */
  { id: "i", file: DCT, declared: "D-320: a NO-OP decoder — the IDCT writes nothing, so every plane stays zero -> the Pillow digests fail BY NAME while every dimension still agrees",
    mustFail: true, failsBy: [/pixels match Pillow's/, /UPRIGHT pixels match Pillow's decode/, /UNROTATED pixels match Pillow's/, /workerd's DCT pixels match Pillow's/],
    spares: [/dimensions after/, /the page's \/Rotate 270 is applied/, /CCITT|UPRIGHT pixels match the independent decoder/, /refused BY NAME/],
    edit: (s) => s.replace("function idctIslow(coef, q, out, o, stride) {\n", "function idctIslow(coef, q, out, o, stride) {\n  return; // NO-OP ARM\n") },
  { id: "j", file: SRC, declared: "D-320: the decoded DCT route ignores the page's /Rotate -> the upright dimensions and digest fail, the UNROTATED digest does not",
    mustFail: true, failsBy: [/the page's \/Rotate 270 is applied/, /UPRIGHT pixels match Pillow's decode/, /\/Rotate 90 through the whole route/, /workerd DECODES the DCT page, upright/],
    spares: [/UNROTATED pixels match Pillow's too/, /rgb-420-rotate90: pixels match Pillow's/],
    edit: (s) => s.replace("if (opts.decodeDct) return decodeDct(doc, im, raw, opts.rotate || 0);", "if (opts.decodeDct) return decodeDct(doc, im, raw, 0);") },
  { id: "k", file: SRC, declared: "D-320: rotate8 turns 270 the wrong way -> the 8-bit rotation assertions against Pillow fail",
    mustFail: true, failsBy: [/rotate8 270 equals Pillow's turn/], spares: [/rotate8 180 equals/, /UPRIGHT pixels match Pillow's decode/],
    edit: (s) => s.replace("      else { sx = width - 1 - Y; sy = X; }\n      const o = (Y * w2 + X) * comps", "      else { sx = Y; sy = height - 1 - X; }\n      const o = (Y * w2 + X) * comps") },
  { id: "l", file: DCT, declared: "D-320: a PROGRESSIVE file is let through to the baseline path -> the refusal assertions fail by name",
    mustFail: true, failsBy: [/refuse-progressive: refused BY NAME/, /a PROGRESSIVE JPEG is refused by name/], spares: [/refuse-arithmetic/, /pixels match Pillow's/],
    edit: (s) => s.replace("const DECODED_SOF = new Set([0xc0, 0xc1]);", "const DECODED_SOF = new Set([0xc0, 0xc1, 0xc2]);") },
  { id: "g", file: SRC, declared: "OVER-STRICTNESS ARM: a change that is real but must NOT break the suite — the `notes` field is removed from analyzePage's return. Declared MUST NOT FAIL.",
    mustFail: false,
    edit: (s) => s.replace("    contentBytes: content.length,\n", "    contentBytes: content.length, spuriousExtraField: true,\n") },
];

const failsIn = (out) => [...out.matchAll(/^  FAIL  (.*)$/gm)].map((m) => m[1]);
function runSuite() {
  try {
    const out = execFileSync(process.execPath, [SUITE], { encoding: "utf8", maxBuffer: 64e6 });
    const m = /pagepixels: (\d+) passed, (\d+) failed/.exec(out);
    return m ? { pass: +m[1], fail: +m[2], ok: +m[2] === 0, fails: failsIn(out) } : { pass: null, fail: null, ok: false, note: "NO TALLY LINE", fails: [] };
  } catch (e) {
    const out = String(e.stdout || "");
    const m = /pagepixels: (\d+) passed, (\d+) failed/.exec(out);
    return m ? { pass: +m[1], fail: +m[2], ok: false, fails: failsIn(out) } : { pass: null, fail: null, ok: false, note: "NO TALLY LINE (suite died)", fails: [] };
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
  /* BY NAME (D-320's arms): every `failsBy` pattern must match a FAIL line and no `spares` pattern may. */
  const missing = (arm.failsBy || []).filter((re) => !res.fails.some((f) => re.test(f))).map(String);
  const spared = (arm.spares || []).filter((re) => res.fails.some((f) => re.test(f))).map(String);
  for (const f of res.fails) console.log(`   FAIL  ${f}`);
  if (missing.length) console.log(`   *** declared to fail BY NAME and did not: ${missing.join(", ")} ***`);
  if (spared.length) console.log(`   *** declared MUST NOT fail and did: ${spared.join(", ")} ***`);
  const agreed = failed === arm.mustFail && !missing.length && !spared.length;
  if (agreed) armsAgreeing++;
  console.log(`   observed: ${res.pass} pass, ${res.fail} fail${res.note ? ` [${res.note}]` : ""} — declared ${arm.mustFail ? "MUST FAIL" : "MUST NOT FAIL"}, ${agreed ? "AGREED" : "*** DISAGREED ***"}\n`);
}

console.log(`${armsAgreeing} of ${ARMS.length} arms behaved as declared.`);
process.exit(armsAgreeing === ARMS.length ? 0 : 1);
