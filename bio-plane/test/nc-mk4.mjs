/* MK-4's NEGATIVE CONTROL HARNESS. Declared in `test/lead.test.mjs`, run from
 * `bio-plane/` in one step:
 *
 *     node test/nc-mk4.mjs              # every arm, in order, baseline first
 *     node test/nc-mk4.mjs legonly      # one arm
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
 * The pristine copies live in `$MK4_PEN` (default /tmp/conduct4-mk4/pen), a
 * directory only this item uses — not the shared scratchpad, and not the tree.
 */
import { readFileSync, writeFileSync, copyFileSync, mkdirSync, statSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { ANCHOR_DRY, anchorPatch, anchorEach } from "../scripts/anchortable.mjs";

const DIR = dirname(fileURLToPath(import.meta.url));
const PLANE = join(DIR, "..");
const REPO = join(PLANE, "..");
const SAFE = process.env.MK4_PEN || "/tmp/conduct4-mk4/pen";
const STORE = join(PLANE, "src/store.mjs");
const INDEX = join(PLANE, "src/index.mjs");
const CHECKS = join(PLANE, "checks/bio-checks.mjs");
const sha = (p) => createHash("sha256").update(readFileSync(p)).digest("hex");
const MIN_BYTES = 20000;

const runSuite = () => {
  const r = spawnSync(process.execPath, ["test/lead.test.mjs"],
    { cwd: PLANE, encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
  const out = `${r.stdout || ""}${r.stderr || ""}`;
  const m = /\nlead: (\d+) pass, (\d+) fail/.exec(out);
  /* A MISSING tally is -1, never 0 — a module that ended early reached no foot. */
  return { pass: m ? +m[1] : -1, fail: m ? +m[2] : -1, exit: r.status,
           failing: out.split("\n").filter((l) => l.includes("FAIL  ")).map((l) => l.trim().slice(0, 300)) };
};
/* Every patch in an arm must match EXACTLY the declared number of times, or the
   arm did not arm — and nothing is written. */
function arm(patches) {
  if (ANCHOR_DRY) return (patches.forEach(([f, find, rep, expect = 1]) => anchorPatch(f, find, rep, expect)), { armed: true, matches: "dry" });   /* M0-197 */
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

/* THE ROW'S REFUSAL: C-54.1 removed — `leadLegFindings` never pushes. */
const NO_LEG_REFUSAL = [CHECKS, "    if (v && LEAD_ID_RE.test(v)) {\n      findings.push(refusal(\"LEAD_NOT_EVIDENCE\",",
                                "    if (false) {\n      findings.push(refusal(\"LEAD_NOT_EVIDENCE\","];
/* THE LIAR: a lead that is merely an unlabelled observation — its id shape made
   CITABLE (a bundle-id prefix, typed as information). With C-54.1 also gone,
   nothing names it and nothing stops it: a lead lands as a basis leg. */
const LIAR_RE = [CHECKS, "export const BUNDLE_ID_RE = /^(INFO|PROB|FOCUS|INQ|PROJ|ACTN|BIAS)-",
                         "export const BUNDLE_ID_RE = /^(INFO|PROB|FOCUS|INQ|PROJ|ACTN|BIAS|LEAD)-"];
const LIAR_TYPE = [CHECKS, "PROJ: 'project', ACTN: 'action', BIAS: 'bias' };",
                           "PROJ: 'project', ACTN: 'action', BIAS: 'bias', LEAD: 'information' };"];

const ARMS = {
  baseline: {
    files: [], why: "nothing armed — the row that distinguishes every-arm-broken from every-arm-working",
    mustFail: [], mustPass: "everything", patch: () => ({ armed: true, matches: 0 }),
  },
  legonly: {
    files: [CHECKS],
    why: "THE ROW'S CONTROL: remove the lead-as-leg refusal (C-54.1) and nothing else. The lead is then "
       + "refused only by the generic target grammar — WRONG NAME — so every BY-NAME arm must fail; the "
       + "structural fence (a LEAD- id is not a bundle id) still keeps it out of the record",
    mustFail: ["REFUSES an inquiry whose basis[].target is a LEAD", "through basis[].content_id",
               "VERSION-LEG grammar", "ACTION-BASIS grammar"],
    mustPass: "\"the refused inquiry was not written\" — the id shape still refuses it, by the wrong name",
    patch: () => arm([NO_LEG_REFUSAL]),
  },
  liar: {
    files: [CHECKS],
    why: "THE LIAR: a lead that is merely an unlabelled observation — its id made citable AND C-54.1 "
       + "gone. The lead LANDS AS A BASIS LEG, and the arm must fail naming it",
    mustFail: ["REFUSES an inquiry whose basis[].target is a LEAD", "the refused inquiry was not written",
               "a lead id is NOT a bundle id"],
    mustPass: "the look, read and visibility arms — nothing about the log moved",
    patch: () => arm([NO_LEG_REFUSAL, LIAR_RE, LIAR_TYPE]),
  },
  stamp: {
    files: [INDEX],
    why: "§7's author rule: the control plane stops stamping the author, so a body `author` would be "
       + "the caller signing as somebody else",
    mustFail: ["the author is SERVER-STAMPED"],
    mustPass: "the look arms — `looker` is a separate stamp",
    patch: () => arm([[INDEX, "    if (op === \"lead\")\n      inner.searchParams.set(\"author\",",
                              "    if (op === \"lead\" && false)\n      inner.searchParams.set(\"author\","]]),
  },
  logatauthor: {
    files: [STORE],
    why: "authoring WRITES A LOOK (the literal reading of the accepts-when): an observation at op=lead "
       + "claims a look nobody made",
    mustFail: ["NOTHING is written to the log"],
    mustPass: "the look arms' own row counts (they are deltas taken after authoring)",
    patch: () => arm([[STORE, "                  leadId, who, typed, where, at);\n",
                              "                  leadId, who, typed, where, at);\n    this.#observe({ actorClass: \"member\", actor: who, authorityKind: \"lead\", authority: leadId, level: \"internet\", subjectKind: \"description\", subject: typed, state: \"LOOKED_INDETERMINATE\" });\n"]]),
  },
  rollup: {
    files: [STORE],
    why: "admit an `observation` referent on a member's look at BOTH lead fences (the kind check AND the "
       + "visibility resolution) — the rollup arm of C-22.10 becomes reachable through a lead and answers "
       + "under the LOG's code instead. CORRECTED 2026-09-18 after its first run came back GREEN: the kind "
       + "check alone was not the only fence — `#leadReferentVisible` resolves a non-capture kind as content "
       + "and refuses it by the same code, so the first arm never reached the log. A green arm is a finding "
       + "about the arm; protected twice, stated",
    mustFail: ["an OBSERVATION referent — a rollup's — is refused for a member's look (C-54.7)"],
    mustPass: "every other look arm",
    patch: () => arm([[STORE, "    if (rk && rk !== \"capture\" && rk !== \"content\")",
                              "    if (rk && rk !== \"capture\" && rk !== \"content\" && rk !== \"observation\")"],
                      [STORE, "    if (rk && !this.#leadReferentVisible(rk, rr, viewer))",
                              "    if (rk && rk !== \"observation\" && !this.#leadReferentVisible(rk, rr, viewer))"]]),
  },
  /* ===== BOB #14's VISIBILITY RULING (2026-09-18), added when MK-4 was corrected to it ===== */
  machinewide: {
    files: [STORE],
    why: "THE RULING'S CONTROL: widen the machine read back to UNFILTERED — MK-4's first provisional. A "
       + "machine credential nobody minted for the lead (the member token, an organisation-scoped ai key) "
       + "then reads it",
    mustFail: ["NO EXISTENCE LEAK: the member TOKEN", "NO EXISTENCE LEAK: an ORGANISATION-scoped ai key",
               "AFTER the share, the member TOKEN"],
    mustPass: "the member-scoped arms — ruth's own key still reads, sam's still does not",
    patch: () => arm([[STORE, "    if (gate.scope === \"DENY\" || gate.member == null) return false;",
                              "    if (gate.scope === \"DENY\") return false;\n    if (gate.member == null) return true;"]]),
  },
  aiscope: {
    files: [INDEX],
    why: "THE OVER-STRICTNESS CONTROL: stop an ai key carrying its minted principal — every ai key reads "
       + "as `class:ai`. A key whose minted scope DOES include the lead must then fail to read it",
    mustFail: ["OVER-STRICTNESS: ruth's member-scoped ai key reads ruth's lead",
               "and sam's member-scoped ai key reaches it too"],
    mustPass: "every refused-viewer arm — refusing more cannot leak",
    patch: () => arm([[INDEX, "        : cls === \"ai\" ? aiCred.principal\n        : `${MACHINE_CLASS_PREFIX}${cls}`);",
                              "        : cls === \"ai\" ? \"class:ai\"\n        : `${MACHINE_CLASS_PREFIX}${cls}`);"]]),
  },
  noshare: {
    files: [STORE],
    why: "the share reaches nobody: a joined participant of the project it was shared to cannot read it",
    mustFail: ["AFTER the share, sam (joined to P1) reads the lead"],
    mustPass: "every refusal arm",
    patch: () => arm([[STORE, "    if (gate.member === row.author) return true;\n    return !!this.#one(",
                              "    if (gate.member === row.author) return true;\n    return false && !!this.#one("]]),
  },
  sharewide: {
    files: [STORE],
    why: "the share reaches EVERY participant state, `invited` included — skeleton-only visibility "
       + "widened into a member's words",
    mustFail: ["AFTER the share, vera (invited, not joined) still answers EXACTLY"],
    mustPass: "otto, the tokens and the org key — they hold no position at all",
    patch: () => arm([[STORE, "        WHERE s.lead_id = ? AND pp.member_id = ? AND pp.state IN ('joined', 'leaving') LIMIT 1`,",
                              "        WHERE s.lead_id = ? AND pp.member_id = ? LIMIT 1`,"]]),
  },
  shareauthor: {
    files: [STORE],
    why: "a non-author who can READ a shared lead may re-share it",
    mustFail: ["only its author does (C-54.10)"],
    mustPass: "the author's own share",
    patch: () => arm([[STORE, "    if (who !== L.author)\n      return refusal(\"LEAD_SHARE_NOT_AUTHOR\",",
                              "    if (false)\n      return refusal(\"LEAD_SHARE_NOT_AUTHOR\","]]),
  },
  sharepart: {
    files: [STORE],
    why: "the author may share to a project she has not joined — or to one that does not exist",
    mustFail: ["ruth cannot share to a project she has not joined (C-54.9)"],
    mustPass: "the share to P1",
    patch: () => arm([[STORE, "    if (!joined)\n      return refusal(\"LEAD_SHARE_NOT_A_PARTICIPANT\",",
                              "    if (false)\n      return refusal(\"LEAD_SHARE_NOT_A_PARTICIPANT\","]]),
  },
  overstrict: {
    files: [CHECKS],
    why: "THE OVER-STRICTNESS DIRECTION: C-54.1 claims any value merely CONTAINING 'lead' — a fence "
       + "tighter than its rule refuses a document that happens to be about leads",
    /* CORRECTED 2026-09-18: first declared "an ordinary INFO leg still lands" as a MUST FAIL, and it
       stayed green — the fixture's document id does not contain "lead", so that arm cannot see this
       widening. The malformed `LEAD-notes` arm DOES, and is declared instead. */
    mustFail: ["a document whose id merely contains 'lead' is NOT refused",
               "a malformed LEAD- string is left to the target grammar"],
    mustPass: "every BY-NAME refusal still fires",
    patch: () => arm([[CHECKS, "    if (v && LEAD_ID_RE.test(v)) {", "    if (v && /lead/i.test(v)) {"]]),
  },
};
anchorEach(ARMS, (a) => a.patch());   /* M0-197: tools/anchordrift.mjs reads the arms' anchors; a no-op otherwise */
mkdirSync(SAFE, { recursive: true });   /* moved below the table (M0-197): nothing above uses the pen */
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
    continue;
  }
  const hit = a.mustFail.map((w) => r.failing.some((l) => l.includes(w)));
  const ok = armed.armed && r.pass >= 0 && hit.every(Boolean);
  console.log(`  VERDICT    ${ok ? "AS DECLARED" : "NOT AS DECLARED"}${hit.every(Boolean) ? "" : ` — did not fail: ${a.mustFail.filter((_, i) => !hit[i]).join(" | ")}`}`);
  if (!ok) finding++;
}
console.log(`\nnc-mk4: ${finding} finding(s) across ${names.length} arm(s)`);
process.exit(finding ? 1 : 0);
