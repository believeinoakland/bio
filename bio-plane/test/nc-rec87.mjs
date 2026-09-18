/* REC-87's NEGATIVE CONTROL HARNESS. Declared in `test/transcribe.test.mjs`, run
 * from `bio-plane/` in one step:
 *
 *     node test/nc-rec87.mjs              # every arm, in order, baseline first
 *     node test/nc-rec87.mjs selfboth     # one arm
 *
 * NOT a `.test.mjs` and NOT a fleet suite, deliberately: it EDITS REAL SOURCES
 * while it runs, so neither the battery's discovery nor `coverage.mjs`'s fleet
 * walk may find it. `nc-rec86.mjs` is its shape, arm for arm.
 *
 * THE RULES IT OBEYS (WORKER.md): one arm at a time with every other defence
 * held open; a BASELINE row that arms nothing; every arm declares BEFORE it runs
 * what MUST fail and what MUST NOT; every arm reports whether it ARMED (a match
 * count other than the one declared is a finding, never a retry); every restore
 * is verified against a UNIQUELY-NAMED per-arm pristine copy by sha256 AND by
 * content, with a byte count printed and a minimum guarded — never
 * `git checkout --`; a surprising green is a finding about the ARM.
 *
 * The pristine copies live in `$REC87_PEN` (default /tmp/conduct4-rec87/pen), a
 * directory only this item uses — not the shared scratchpad, and not the tree.
 */
import { readFileSync, writeFileSync, copyFileSync, mkdirSync, statSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const DIR = dirname(fileURLToPath(import.meta.url));
const PLANE = join(DIR, "..");
const REPO = join(PLANE, "..");
const SAFE = process.env.REC87_PEN || "/tmp/conduct4-rec87/pen";
mkdirSync(SAFE, { recursive: true });
const STORE = join(PLANE, "src/store.mjs");
const CHAIN = join(PLANE, "src/textchain.mjs");
const sha = (p) => createHash("sha256").update(readFileSync(p)).digest("hex");
const MIN_BYTES = 20000;

const runSuite = () => {
  const r = spawnSync(process.execPath, ["test/transcribe.test.mjs"],
    { cwd: PLANE, encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
  const out = `${r.stdout || ""}${r.stderr || ""}`;
  const m = /\n(\d+) pass, (\d+) fail/.exec(out);
  /* A MISSING tally is -1, never 0 — a module that ended early reached no foot. */
  return { pass: m ? +m[1] : -1, fail: m ? +m[2] : -1, exit: r.status,
           failing: out.split("\n").filter((l) => l.includes("FAIL  ")).map((l) => l.trim().slice(0, 300)) };
};
/* Every patch in an arm must match EXACTLY the declared number of times, or the
   arm did not arm — and nothing is written. */
function arm(patches) {
  const byFile = new Map();
  for (const [file, find, replace, expect = 1] of patches) {
    const src = byFile.get(file) ?? readFileSync(file, "utf8");
    const n = src.split(find).length - 1;
    if (n !== expect) return { armed: false, matches: `${n} (expected ${expect}) for ${JSON.stringify(find.slice(0, 60))}` };
    byFile.set(file, src.split(find).join(replace));
  }
  for (const [f, s] of byFile) writeFileSync(f, s);
  return { armed: true, matches: patches.map((p) => p[3] ?? 1).join("+") };
}

const SELF_ACT = [STORE, "    if (who === t.transcriber)\n      return refusal(\"TRANSCRIPTION_SELF_ATTEST\",",
                         "    if (false)\n      return refusal(\"TRANSCRIPTION_SELF_ATTEST\","];
const SELF_READ = [STORE, "      .filter((a) => a.attestor !== tx.transcriber)", "      .filter((a) => true)"];
const SELF_READ2 = [STORE, "                          && !(tx && a.attestor === tx.transcriber));", "                          );"];

const ARMS = {
  baseline: {
    files: [], why: "nothing armed — the row that distinguishes every-arm-broken from every-arm-working",
    mustFail: [], mustPass: "everything", patch: () => ({ armed: true, matches: 0 }),
  },
  selfact: {
    files: [STORE],
    why: "neuter the refusal AT THE ACT only — the typist's own attestation is recorded. The READ still excludes it (the second fence), so the ceiling must NOT move",
    mustFail: ["REFUSED BY NAME: TRANSCRIPTION_SELF_ATTEST"],
    mustPass: "\"the ceiling DID NOT MOVE on one member's word\" — the read-side exclusion holds on its own",
    patch: () => arm([SELF_ACT]),
  },
  selfboth: {
    files: [STORE],
    why: "THE ROW'S ARM: neuter BOTH self-attestation fences, so the ceiling rises on ONE member's word",
    mustFail: ["REFUSED BY NAME: TRANSCRIPTION_SELF_ATTEST",
               "and the ceiling DID NOT MOVE on one member's word"],
    mustPass: "the machine-attestor refusal, the transcribe refusals, the grammar arms and the over-strictness pins",
    patch: () => arm([SELF_ACT, SELF_READ, SELF_READ2]),
  },
  portion: {
    files: [STORE],
    why: "neuter the NO-PORTION refusal: a transcription with no portion selected must still not land, and must say WHY by its own name",
    mustFail: ["NO PORTION SELECTED (the extent absent) — refused, C-52.4",
               "an EMPTY extent is no portion either — refused, C-52.4"],
    mustPass: "every other arm — a typing WITH a portion is untouched",
    patch: () => arm([[STORE, "    if (bare)\n      return refusal(\"TRANSCRIBE_NO_PORTION\",",
                              "    if (false)\n      return refusal(\"TRANSCRIBE_NO_PORTION\","]]),
  },
  machine: {
    files: [STORE],
    why: "neuter the member fence on the typist: a MACHINE credential types a page in its own name",
    mustFail: ["a machine credential typing is refused BY NAME (C-52.1)",
               "the ADMIN token is a machine too (C-52.1)"],
    mustPass: "every member path",
    patch: () => arm([[STORE, "    if (!who || isMachineIdentity(who))\n      return refusal(\"TRANSCRIBE_NOT_A_MEMBER\",",
                              "    if (!who)\n      return refusal(\"TRANSCRIBE_NOT_A_MEMBER\","]]),
  },
  routing: {
    files: [STORE],
    why: "stop routing a typing to its OWN attestations: the capture's attestation of the OCR (which covers the typed region) raises the member's typing",
    /* DECLARATION CORRECTED AFTER THE FIRST RUN, and the first run is the finding: it
       declared the page-2 routing assertion, which STAYED GREEN under this arm — that
       capture's chain is recorded, so the old chain-inequality filter already kept its
       attestation off the typing and the route was never exercised. The suite gained
       a CHAINLESS capture, and building that fixture found a real defect (C-45.2
       refused a typing of a chainless capture — see the `chainless` arm). */
    mustFail: ["THE ROUTING ARM, WHERE IT BITES"],
    mustPass: "the grammar arms, the refusals, and the pins",
    patch: () => arm([[STORE, "    const tx = txs && txs.by ? txs.by.get(r.content_id) : null;",
                              "    const tx = null;"]]),
  },
  chainless: {
    files: [STORE],
    why: "ask the extent grammar under the CAPTURE's chain instead of the typing's: a document no machine could read (no chain) cannot be transcribed at all — Bob's own case refused C-45.2",
    mustFail: ["THE ROUTING ARM, WHERE IT BITES"],
    mustPass: "every typing of a capture that HAS a chain",
    patch: () => arm([[STORE, "      ? extent : null, ctx);\n    if (bad) return bad;\n    const kind = extent.kind;",
                              "      ? extent : null, { ...ctx, chain: this.contentContextFor(sha).chain });\n    if (bad) return bad;\n    const kind = extent.kind;"]]),
  },
  swallow: {
    files: [CHAIN],
    why: "drop `unmeasured: \"undetermined\"` from the typed kind: an OCR letter measured on OTHER text bounds what a person typed (the swallow CAP-10 found)",
    mustFail: ["THE SWALLOW CAP-10 FOUND",
               "STEP_KINDS.typed is a DERIVATION"],
    mustPass: "every op-level arm — a one-step member chain is undetermined either way, which is WHY the grammar arm exists",
    patch: () => arm([[CHAIN, "tier: null, names: [\"member\"], unmeasured: \"undetermined\", letter: \"never\" },",
                              "tier: null, names: [\"member\"], letter: \"never\" },"]]),
  },
  stale: {
    files: [STORE],
    why: "remove the typing exclusion from the stale pass: a machine re-read marks the member's typing stale",
    mustFail: ["the member's typing does NOT"],
    mustPass: "the machine row still goes stale",
    patch: () => arm([[STORE, "NOT IN (SELECT content_id FROM transcriptions WHERE capture_sha=?)",
                              "NOT IN (SELECT content_id FROM transcriptions WHERE capture_sha=? AND 0)", 2]]),
  },
  pin: {
    files: [STORE],
    why: "CONTROL ON THE OVER-STRICTNESS PIN ITSELF: change one word of `op=attesttext`'s answer; the pin must SEE it",
    mustFail: ["OVER-STRICTNESS: op=attesttext answers BYTE-IDENTICALLY"],
    mustPass: "everything else — the word is in no other answer",
    patch: () => arm([[STORE, "      return { ok: true, capture_sha: sha, attestor: att.member, at: att.at, extent: e,",
                              "      return { ok: true, armed: 1, capture_sha: sha, attestor: att.member, at: att.at, extent: e,"]]),
  },
  overstrict: {
    files: [STORE],
    why: "THE OVER-STRICTNESS DIRECTION: the self-attestation fence refuses EVERY attestor — a fence tighter than its rule refuses the one act the ruling licenses",
    mustFail: ["op=transcriptionattest lands for a DIFFERENT member",
               "THE CEILING MOVES AS RULED"],
    mustPass: "\"REFUSED BY NAME: TRANSCRIPTION_SELF_ATTEST\" — the refusal the fence exists for still fires",
    patch: () => arm([[STORE, "    if (who === t.transcriber)\n      return refusal(\"TRANSCRIPTION_SELF_ATTEST\",",
                              "    if (who === t.transcriber || true)\n      return refusal(\"TRANSCRIPTION_SELF_ATTEST\","]]),
  },
};

const want = process.argv[2] || null;
const names = want ? [want] : Object.keys(ARMS);
if (want && !ARMS[want]) { console.error(`unknown arm '${want}'. arms: ${Object.keys(ARMS).join(", ")}`); process.exit(2); }
let finding = 0;
for (const name of names) {
  const a = ARMS[name];
  console.log(`\n===== ARM ${name} =====`);
  console.log(`  WHY        ${a.why}`);
  console.log(`  MUST FAIL  ${a.mustFail.length ? a.mustFail.join(" | ") : "(nothing — baseline)"}`);
  console.log(`  MUST PASS  ${a.mustPass}`);
  const saved = a.files.map((f) => {
    const dest = join(SAFE, `${name}.${f.split("/").pop()}`);
    copyFileSync(f, dest);
    return { f, dest, sha: sha(f), bytes: statSync(f).size };
  });
  for (const s of saved) {
    console.log(`  PRISTINE   ${s.f.replace(REPO + "/", "")}  ${s.bytes} bytes  sha256 ${s.sha.slice(0, 12)}…`);
    if (s.bytes < MIN_BYTES) { console.log(`  FINDING    pristine copy is under ${MIN_BYTES} bytes — refusing to proceed`); process.exit(2); }
  }
  const armed = a.patch();
  console.log(`  ARMED      ${armed.armed ? "yes" : "NO"}  (patch matched ${armed.matches})`);
  if (!armed.armed && name !== "baseline") {
    console.log(`  FINDING    the arm DID NOT ARM. An arm that did not arm is a finding, never a retry.`);
    finding++;
  }
  const r = runSuite();
  console.log(`  RESULT     ${r.pass} pass, ${r.fail} fail, exit ${r.exit}`);
  for (const l of r.failing) console.log(`             ${l}`);
  for (const s of saved) {
    copyFileSync(s.dest, s.f);
    const back = sha(s.f);
    const sameBytes = readFileSync(s.f).equals(readFileSync(s.dest));
    console.log(`  RESTORED   ${s.f.replace(REPO + "/", "")}  byte-identically: ${back === s.sha && sameBytes ? "YES" : "NO"}  ${statSync(s.f).size} bytes  sha256 ${back.slice(0, 12)}…`);
    if (!(back === s.sha && sameBytes)) { console.log("  FINDING    restore FAILED — stopping before the next arm measures the wrong tree"); process.exit(2); }
  }
  if (name === "baseline") {
    const ok = r.fail === 0 && r.pass > 0;
    console.log(`  VERDICT    ${ok ? "AS DECLARED — green" : "NOT AS DECLARED"}`);
    if (!ok) finding++;
  } else {
    const hit = a.mustFail.filter((m) => r.failing.some((l) => l.includes(m)));
    const ok = r.fail > 0 && hit.length === a.mustFail.length;
    console.log(`  VERDICT    ${ok ? "AS DECLARED" : "NOT AS DECLARED"} — ${hit.length}/${a.mustFail.length} declared failure(s) present, ${r.fail} total failing`);
    if (!ok) finding++;
  }
}
console.log(`\n${finding === 0 ? "every arm AS DECLARED" : `${finding} arm(s) NOT AS DECLARED — a surprising result is a finding about the ARM, recorded rather than smoothed`}`);
process.exit(0);
