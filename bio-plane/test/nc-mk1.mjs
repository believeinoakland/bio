/* MK-1's NEGATIVE CONTROL HARNESS. Declared in `test/testify.test.mjs`, run from
 * `bio-plane/` in one step:
 *
 *     node test/nc-mk1.mjs              # every arm, in order, baseline first
 *     node test/nc-mk1.mjs unearned     # one arm
 *
 * NOT a `.test.mjs` and NOT a fleet suite, deliberately: it EDITS REAL SOURCES
 * while it runs, so neither the battery's discovery nor `coverage.mjs`'s fleet
 * walk may find it. `nc-rec87.mjs` is its shape, arm for arm.
 *
 * THE RULES IT OBEYS (WORKER.md): one arm at a time with every other defence
 * held open; a BASELINE row that arms nothing; every arm declares BEFORE it runs
 * what MUST fail and what MUST NOT; every arm reports whether it ARMED (a match
 * count other than the one declared is a finding, never a retry); every restore
 * is verified against a UNIQUELY-NAMED per-arm pristine copy by sha256 AND by
 * content, with a byte count printed and a minimum guarded — never
 * `git checkout --`; a surprising green is a finding about the ARM.
 *
 * The pristine copies live in `$MK1_PEN` (default /tmp/conduct4-mk1/pen), a
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
const SAFE = process.env.MK1_PEN || "/tmp/conduct4-mk1/pen";
mkdirSync(SAFE, { recursive: true });
const STORE = join(PLANE, "src/store.mjs");
const INDEX = join(PLANE, "src/index.mjs");
const CHECKS = join(PLANE, "checks/bio-checks.mjs");
const sha = (p) => createHash("sha256").update(readFileSync(p)).digest("hex");
const MIN_BYTES = 20000;

const runSuite = () => {
  const r = spawnSync(process.execPath, ["test/testify.test.mjs"],
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

const ARMS = {
  baseline: {
    files: [], why: "nothing armed — the row that distinguishes every-arm-broken from every-arm-working",
    mustFail: [], mustPass: "everything", patch: () => ({ armed: true, matches: 0 }),
  },
  unearned: {
    files: [STORE],
    why: "THE LIAR: the fence stops refusing a document that CLAIMS authored without the testimony path having written it — so any writer can set the flag",
    mustFail: ["THE LIAR: a promote claiming authored", "the flag in ANY truthy spelling is the claim"],
    mustPass: "the hijack, origin and dropped refusals (other arms of the same fence), and every op=testify assertion",
    patch: () => arm([[STORE, "      if (claims && !authored)\n", "      if (false && claims && !authored)\n"]]),
  },
  hijack: {
    files: [STORE],
    why: "the fence stops refusing a register entry that re-files an authored observation's bytes under ANOTHER bundle",
    mustFail: ["a DIFFERENT bundle registering an authored observation's bytes is REFUSED"],
    mustPass: "THE LIAR (a document claim is a different arm) and every other refusal",
    patch: () => arm([[STORE, "      if (elsewhere.has(c.sha256))\n", "      if (false && elsewhere.has(c.sha256))\n"]]),
  },
  origin: {
    files: [STORE],
    why: "§7's FIRST refusal removed: an authored bundle's revision may claim origin named_request or actor daemon",
    mustFail: ["now claims origin named_request is REFUSED", "and one whose actor class is now daemon"],
    mustPass: "the dropped and liar refusals; C-18.1's catalogue arm (a SEPARATE statement of the same rule, held open)",
    patch: () => arm([[STORE, "      if (origin !== \"member\" || actor !== \"member\")\n",
                              "      if (false && (origin !== \"member\" || actor !== \"member\"))\n"]]),
  },
  dropped: {
    files: [STORE],
    why: "an authored bundle's revision may stop saying authored — the flag removed, or the provenance document dropped",
    mustFail: ["stops saying authored is REFUSED", "drops data/provenance.json altogether"],
    mustPass: "the origin and liar refusals",
    patch: () => arm([[STORE, "      if (d.authored !== true)\n", "      if (false && d.authored !== true)\n"],
                      [STORE, "      if (!stated.has(s))\n", "      if (false && !stated.has(s))\n"]]),
  },
  stamp: {
    files: [INDEX],
    why: "THE AUTHOR STAMP REMOVED at the control plane: a caller's own ?author= reaches the store unoverwritten",
    mustFail: ["THE STAMP: a caller's own ?author=mallory is OVERWRITTEN"],
    mustPass: "the body-author refusal (C-53.2) — a different door, fenced at the store",
    patch: () => arm([[INDEX, "    if (op === \"testify\")\n      inner.searchParams.set(\"author\",",
                              "    if (false)\n      inner.searchParams.set(\"author\","]]),
  },
  supplied: {
    files: [STORE],
    why: "C-53.2 removed: a caller-supplied author in the BODY is no longer refused",
    mustFail: ["a caller-supplied author in the BODY is REFUSED BY NAME", "under a synonym too"],
    mustPass: "THE STAMP (the recorded author is still the session's, because the store reads the stamp)",
    patch: () => arm([[STORE, "    if (claimedAuthor !== null && claimedAuthor !== undefined)\n",
                              "    if (false)\n"]]),
  },
  machine: {
    files: [STORE],
    why: "C-53.1 removed: a machine credential's stamp is accepted as an observer",
    mustFail: ["a MACHINE credential (the member token, the admin token) is refused BY NAME"],
    mustPass: "every session-member assertion",
    patch: () => arm([[STORE, "    if (!who || isMachineIdentity(who))\n      return refusal(\"TESTIMONY_NOT_A_MEMBER\",",
                              "    if (!who)\n      return refusal(\"TESTIMONY_NOT_A_MEMBER\","]]),
  },
  axis: {
    files: [STORE],
    why: "the capture axis counts an authored observation as a capture again — captureBound(null) passes the fetch ceiling through",
    mustFail: ["the CAPTURE axis earns NO letter for the observation",
               "a leg citing the observation and claiming capture"],
    mustPass: "CONTRAST: the member-UPLOADED document earns the fetch ceiling",
    patch: () => arm([[STORE, "      if (r.authored === 1) { e.authored++; continue; }",
                              "      if (false) { e.authored++; continue; }"]]),
  },
  extractrow: {
    files: [STORE],
    why: "the authored capture's EXTRACTION observation is not written — so op=contentaxis explains the absence as one of section 5.1's causes, on a capture whose words ARE its text",
    mustFail: ["READER op=contentaxis"],
    mustPass: "every other reader (the index row is written by a different call and still reads PRESENT)",
    patch: () => arm([[STORE, "            const bad = this.#observe({\n              actorClass: \"member\", actor: who, authorityKind: \"extract\",",
                              "            const bad = false && this.#observe({\n              actorClass: \"member\", actor: who, authorityKind: \"extract\","]]),
  },
  header: {
    files: [STORE],
    why: "BOB #14's RULING UNDONE: the authored bytes are the words alone, no canonical header — so two members' identical words are one set of bytes again",
    mustFail: ["the capture IS the canonical bytes", "TWO MEMBERS, IDENTICAL WORDS, TWO TESTIMONIES"],
    mustPass: "every refusal of the fence at promote",
    patch: () => arm([[STORE, "    return `${Store.TESTIMONY_FORMAT}\\nid: ${id}\\nobserved_at: ${observedAt}\\n\\n${words}`;",
                              "    return `${words}`;"]]),
  },
  pubbundle: {
    files: [INDEX],
    why: "(A) the fence at op=ratify for the OBSERVATION ITSELF removed — its words, provenance document and the observer's handle cross into the published record",
    mustFail: ["op=ratify on the OBSERVATION ITSELF", "NOTHING of it is published"],
    mustPass: "the cited-finding and case refusals (separate arms of the fence)",
    patch: () => arm([[INDEX, "      if (facts.testimony && facts.testimony.self.length)\n",
                              "      if (false && facts.testimony && facts.testimony.self.length)\n"]]),
  },
  pubcited: {
    files: [INDEX],
    why: "(A) the fence at op=ratify for a FINDING RESTING ON an observation removed — the finding publishes",
    mustFail: ["op=ratify on a FINDING whose basis cites the observation", "THROUGH ANOTHER FINDING"],
    mustPass: "the observation's own refusal and the case refusal",
    patch: () => arm([[INDEX, "      if (facts.testimony && facts.testimony.via.length)\n",
                              "      if (false && facts.testimony && facts.testimony.via.length)\n"]]),
  },
  pubcase: {
    files: [INDEX],
    why: "(A) the fence at op=caseratify removed — a case over a finding resting on an observation publishes",
    mustFail: ["op=caseratify on a CASE whose finding rests on the observation"],
    mustPass: "both op=ratify refusals",
    patch: () => arm([[INDEX, "      if (facts.testimony && facts.testimony.via.concat(facts.testimony.self).length)\n",
                              "      if (false && facts.testimony && facts.testimony.via.concat(facts.testimony.self).length)\n"]]),
  },
  pubdirect: {
    files: [STORE],
    why: "(A) the walk made DIRECT-ONLY — a finding resting on the observation THROUGH another finding is no longer seen",
    mustFail: ["THROUGH ANOTHER FINDING"],
    mustPass: "the direct finding's refusal and the case refusal (both direct)",
    patch: () => arm([[STORE, "          WHERE r.depth < 64)", "          WHERE r.depth < 1)"]]),
  },
  pubover: {
    files: [INDEX],
    why: "(A) THE OVER-STRICTNESS DIRECTION: the fence refuses EVERY ratification — an ordinary document and its finding stop publishing",
    mustFail: ["OVER-STRICTNESS: a finding resting on an ORDINARY document"],
    mustPass: "\"op=ratify on the OBSERVATION ITSELF\" — the refusal the fence exists for still fires",
    patch: () => arm([[INDEX, "      if (facts.testimony && facts.testimony.self.length)\n",
                              "      if (true)\n"]]),
  },
  c181: {
    files: [CHECKS],
    why: "C-18.1's authored arm removed: the catalogue holds an authored document to the ordinary A/B/C grade rule",
    mustFail: ["THE WHOLE CATALOGUE over the bundle op=testify wrote", "an authored document carrying a capture grade is an error"],
    mustPass: "the origin half of C-18.1 (a separate statement) and every store fence",
    patch: () => arm([[CHECKS, "      if (d.authored === true) {\n        if (cap.grade !== undefined",
                               "      if (false) {\n        if (cap.grade !== undefined"]]),
  },
  overstrict: {
    files: [STORE],
    why: "THE OVER-STRICTNESS DIRECTION: the fence treats EVERY member-origin document as a claim to be authored — refusing the member-uploaded document the design says stays what it is today",
    mustFail: ["OVER-STRICTNESS: a member-UPLOADED document", "OVER-STRICTNESS: `authored: false`"],
    mustPass: "THE LIAR — the refusal the fence exists for still fires",
    patch: () => arm([[STORE, "      if (claims && !authored)\n",
                              "      if ((claims || (d.origin && d.origin.kind === \"member\")) && !authored)\n"]]),
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
