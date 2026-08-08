/* NEGATIVE CONTROL: STRUCTURAL, the item's own (REC-19) — add an op to NEEDS in src/index.mjs (e.g. `frobnicate: "contribute",`) WITHOUT adding it to the affordances derivation -> the totality assertion here fails NAMING `frobnicate` as the unpublished op; restored -> green. Recorded as run below in the suite header. */
/* NEGATIVE CONTROL (REC-35, the vocabulary drift guard), three arms, all RUN 2026-08-04 and both source files restored byte-identical (sha256 verified): (a) in src/affordances.mjs replace `entity_kinds: ENTITY_KINDS` in VOCABULARIES with a literal copy of the same ten words -> "the three intent vocabularies … ARE the arrays" FAILS (45/46), and NOTE WHAT DOES NOT: the wire and the through-the-op assertions all PASS, because an identical copy agrees at zero cost — the identity pin is the whole of that control; (b) in src/store.mjs restore `static #ENTITY_KINDS = new Set([...ten literal words])` -> the no-literal-copy pin FAILS (45/46) and nothing else does, for the same reason; (c) the same literal PLUS one extra kind ("widget") -> the no-literal-copy pin AND "op=entitycreate REFUSES against exactly the published entity_kinds" both FAIL (44/46), naming the published list against the enforced one, and civicos-ui/test/intent-write.test.mjs fails with it (1 of 106) — the drift is caught from both ends. Restored -> 46/46. */
/* NEGATIVE CONTROL (REC-38, the attest metadata + the two action-loop vocabularies), FOUR arms, all RUN 2026-08-05 and both source files restored BYTE-IDENTICAL (sha256 compared before and after: src/index.mjs 4232a3cf…, src/affordances.mjs 2bef3364…):
   (c) THE ATTEST LABEL AS A LITERAL COPY — in src/index.mjs replace the catalogue arm's `capture_acts: CAPTURE_ACTS.map(decorate)` with an inline `[{ id:"attest", label:"Co-attest this capture", weight:null, needs:"contribute", mode:"session", rung:"attested", prompt:null }, ...]` (the surface-authored label moved one layer down, which is the failure this item exists to end) -> "index.mjs composes the block through the SAME decorateAct and keeps no literal label of its own" FAILS (62/63), and NOTE WHAT DOES NOT: every wire assertion PASSES, because an identical copy agrees at zero cost — the structural pin is the whole of that control, REC-35's finding restated on a LABEL instead of an array;
   (d) ONE VOCABULARY AS A LITERAL COPY — in src/affordances.mjs replace `action_basis_kinds: ACTION_BASIS_KINDS` with `["rests_on","advances"]` -> the identity pin FAILS (62/63) and nothing else does, for the same zero-cost reason;
   (d2) THE SAME LITERAL PLUS ONE EXTRA KIND ("widget") -> THREE FAIL (60/63) and they name both lists: the identity pin, the over-the-wire pin, and "the write path REFUSES a basis leg against exactly the published action_basis_kinds" — the publication is caught as a SUPERSET of what the store will accept, which is the DEC-8 disagreement in the shape that costs a member a control that does not work;
   (e) THE CAPTURE-DIRECTED TOTALITY — delete the `monitor` entry from CAPTURE_ACTS, leaving its NON_ACTS reason untouched -> "every capture-directed NON_ACT has published metadata … both directions" FAILS naming ["monitor"], which is the guard that makes `attest`'s six-item history (correct, sourced, unreachable since REC-19) unable to repeat for a third op.
   Restored -> 63/63. */
/* NEGATIVE CONTROL (REC-39, the four RESOLUTIONS — the LAST action-loop set to get a published home), FOUR arms, all RUN 2026-08-05, every file restored BYTE-IDENTICAL (sha256 compared before and after each: src/affordances.mjs 753aa75b…, src/store.mjs 84801ad6…, checks/bio-checks.mjs eaa05176…):
   (e) THE PUBLICATION AS A LITERAL COPY — in src/affordances.mjs replace `resolutions: RESOLUTIONS` with `["complied","denied","escalated","withdrawn"]` -> the identity pin FAILS (68/69) and NOTHING ELSE DOES: the wire pin, both op=actionmove pins and the C-2.10 pin all PASS, because an identical copy agrees at zero cost. REC-35's finding, third restatement, and the identity pin is the whole of this control;
   (e2) THE SAME LITERAL PLUS ONE EXTRA WORD ("widget") -> FIVE FAIL (64/69) and they name both lists in four different instruments: the identity pin, the over-the-wire pin, `op=actionmove` refusing against a set that no longer matches what it publishes as `legal`, the not-a-superset arm (the published word the act will NOT accept — the shape that costs UI-19's chooser an option that does not work), and C-2.10's own sentence on the document that landed;
   (e3) RESTORE THE STORE'S LOCAL COPY — splice `const RESOLUTIONS = ["complied","denied","escalated","withdrawn"];` back into `actionMove()` above `const res = …`, which is the exact state REC-39 found -> the no-literal-copy pin FAILS (68/69) and nothing else does, because a shadowing copy of the same four words behaves identically until the day the catalogue changes. That is why the pin is structural and not behavioural;
   (e4) RESTORE THE CATALOGUE'S INLINE COPY — put `['complied','denied','escalated','withdrawn']` and its hand-written sentence back into checkActionExtension -> the same no-literal-copy pin FAILS (68/69), from the other enforcement site. Both copies are pinned dead BY NAME so the found state cannot be re-entered from either end.
   Restored -> 69/69. */
/* NEGATIVE CONTROL (REC-43 / DEC-39, the co-attestation fence's drift guard), THREE arms, all RUN 2026-08-04, both files restored BYTE-IDENTICAL (sha256 compared before and after: src/affordances.mjs 9a894add…, checks/bio-checks.mjs 7d63a552…):
   (a) THE ITEM'S OWN — PUBLISH THE FENCE AS A LITERAL COPY. Replace `export const ATTEST_FENCE = attestFence(EARNED_CAPTURE_CEILING, UNREACHABLE_CAPTURE_GRADE);` in src/affordances.mjs with the same sentence hand-typed as a string literal ("… a Grade B capture … never reaches Grade A …") -> "affordances.mjs SPELLS no grade letter in the fence" FAILS (77/78) and NOTHING ELSE DOES: the over-the-wire pin, the DEC-39 verbatim pin, the equals-the-enforcement pin and both letter pins all PASS, because an identical copy agrees at zero cost. REC-35's finding restated a fourth time and the first on a SENTENCE rather than an array — the structural pin is the whole of this control;
   (b) THE SAME LITERAL, AND THEN MOVE THE RULE — keep the literal and set `EARNED_CAPTURE_CEILING = 'C'` in checks/bio-checks.mjs -> THREE FAIL (75/78) and they name the drift in both directions: the publication no longer equals the enforcement's own value, and the two letters the fence states are no longer the rule's. THIS IS WHAT THE COPY COSTS: a member co-attesting is told the capture is strengthened toward evidentiary weight at Grade B while the gate refuses any leg above C — the record overclaiming on a doctrine sentence, which is the failure CLAUDE.md ranks worse than a missing feature;
   (c) THE COMPOSED FENCE UNDER THE SAME MOVED RULE — restore the composition, leave the ceiling at C -> TWO FAIL (76/78) and they are the RIGHT two: "the published fence IS Bob's sentence" (the publication has moved off the ruling, which is precisely what must stop a turn), and the counterfactual, which goes degenerate because attestFence("C","B") is now the published string. What does NOT happen in this arm is the thing arm (b) does: no member is told a grade the gate will not accept, because the sentence followed the rule. That difference between (b) and (c) is the item.
   Restored -> 78/78. */
/* op=affordances (REC-19, standing doctrine DEC-8): the plane publishes what may
 * be DONE to an object, so an act surface renders options it RECEIVED and never
 * computes one. whoami publishes capabilities, searchfields publishes the query
 * language; this extends the pattern to the act construct and mints no new one.
 *
 * What this suite holds the op to:
 *
 *   EXACTLY THE ACTS THE PLANE WOULD PERMIT. Every published act is then
 *   PERFORMED through the very op it names, and every unpublished act is
 *   ATTEMPTED and refused by the store — so the publication and the refusal are
 *   held together in both directions, on the same objects, in the same run:
 *     - a `collected` information bundle publishes {cite, release} — release is
 *       then actually run (by a named member) and succeeds; retire is attempted
 *       and refused ILLEGAL_TRANSITION;
 *     - a `verified` bundle carrying a LIVE cites edge does NOT publish retire —
 *       and retire, attempted anyway, is refused CITED naming the citing
 *       project (the accepts-when headline);
 *     - severing the edge makes retire appear, and retire then succeeds — a
 *       severed edge is a recorded decision, not a live dependency;
 *     - an `elevated` focus and an `action` bundle publish an EMPTY act list,
 *       and the empty list is proven honest by the store's own refusal.
 *
 *   NOTHING DRIFTS. Every op in NEEDS is either a published act or named in
 *   NON_ACTS with its reason — the totality assertion parses NEEDS out of the
 *   index.mjs source (the capability suite's own technique) and fails NAMING
 *   the op, which is the negative control above. The disposition vocabulary is
 *   the ONE array: store.mjs imports it (REC-11's folded chore — the old pin
 *   of two identical literals is superseded, corrected below), and the
 *   action_kind vocabulary is identical to the array C-2.10 enforces.
 *
 *   DECLARED, NOT GUESSED. rung is null for every op no document assigns one
 *   (cite above all); the seven sourced rungs are the only ones RUNGS carries.
 *   weight is cross-checked against what the acting ops themselves report.
 *
 * NEGATIVE CONTROL RUN 2026-08-03 (rec19-agent): added `frobnicate: "contribute",`
 * to NEEDS in src/index.mjs, ran this suite -> the totality assertion FAILED with
 * got ["frobnicate"] (the unpublished op named); removed the line -> suite green.
 */
import "./sandbox.mjs"; /* D-186: owns $TMPDIR for this process and removes it on exit */
import { Miniflare } from "miniflare";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { ACTS, ACT_IDS, NON_ACTS, RUNGS, VOCABULARIES, DISPOSITIONS, DIVIDE_PROMPT, GROUND_PROMPT, deriveActs,
         ENTITY_KINDS, RELATION_KINDS, STAGE_REQUIREDNESS, CAPTURE_ACTS,
         ATTEST_FENCE, attestFence }
  from "../src/affordances.mjs";
import { ACTION_KINDS, ACTION_BASIS_KINDS, CORRESPONDENCE_DIRECTIONS,
         RESOLUTIONS, BASIS_GRADES,
         EARNED_CAPTURE_CEILING, UNREACHABLE_CAPTURE_GRADE } from "../checks/bio-checks.mjs";

const IDX = fileURLToPath(new URL("../src/index.mjs", import.meta.url));
const STORE_SRC = fileURLToPath(new URL("../src/store.mjs", import.meta.url));
const mf = new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: IDX, script: readFileSync(IDX, "utf8"),
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
  r2Buckets: ["CAPTURES", "PUBLISHED"],
  bindings: { ADMIN_TOKEN: "adm-rec19", MEMBER_TOKEN: "mem-rec19", PROBE_TOKEN: "prb-rec19", VERSION: "test" },
});

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${JSON.stringify(want)}\n         got  ${JSON.stringify(got)}`}`);
  ok ? pass++ : fail++;
};
const sha = (v) => createHash("sha256").update(v).digest("hex");
const rP = (r) => (r && typeof r === "object" && "result" in r) ? r.result : r;
const GET = async (q) => (await mf.dispatchFetch(`http://x/api/?${q}`)).json();
const POST = async (q, body) => (await mf.dispatchFetch(`http://x/api/?${q}`,
  { method: "POST", body: JSON.stringify(body ?? {}) })).json();
/* THE op under test, through the control plane (a real caller's only route),
   the literal `op=affordances` uninterpolated so coverage credits it there. */
const affordances = async (target, tok = "mem-rec19") =>
  await GET(`op=affordances&token=${tok}${target ? `&target=${encodeURIComponent(target)}` : ""}`);
const actIds = (r) => (r.result?.acts ?? []).map((a) => a.id).sort();

/* ------------------------------------------------------------- structural */
/* NEEDS and OPS are read out of the SOURCE, the capability suite's technique,
   so an op added later cannot pass by not being mentioned. */
const stripComments = (s) => s.replace(/\/\*[\s\S]*?\*\//g, "");
function tableKeys(src, name) {
  const m = new RegExp(`(?:const|let|var)\\s+${name}\\s*=\\s*\\{`).exec(src);
  if (!m) throw new Error(`${name} table not found`);
  let i = src.indexOf("{", m.index), depth = 0, end = -1;
  for (let p = i; p < src.length; p++) {
    if (src[p] === "{") depth++;
    else if (src[p] === "}") { depth--; if (depth === 0) { end = p; break; } }
  }
  const body = stripComments(src.slice(i + 1, end));
  return [...body.matchAll(/^\s{2}([a-z][a-zA-Z0-9_]*)\s*:/gm)].map((x) => x[1]);
}
const indexSrc = readFileSync(IDX, "utf8");
const storeSrc = readFileSync(STORE_SRC, "utf8");
const needsKeys = tableKeys(indexSrc, "NEEDS");
const opsKeys = tableKeys(indexSrc, "OPS");

console.log("\n--- structural: the derivation is TOTAL over NEEDS (the drift guard) ---");
t("every op in NEEDS is a published act or a named NON_ACT — an op in neither is UNPUBLISHED and fails here by name",
  needsKeys.filter((k) => !ACT_IDS.has(k) && !(k in NON_ACTS)), []);
t("NON_ACTS names only ops that exist in NEEDS (the registry cannot hold ghosts)",
  Object.keys(NON_ACTS).filter((k) => !needsKeys.includes(k)), []);
t("no op is both an act and a NON_ACT",
  [...ACT_IDS].filter((k) => k in NON_ACTS), []);
t("every published act is a real op in the OPS table",
  [...ACT_IDS].filter((k) => !opsKeys.includes(k)), []);
/* Corrected 2026-08-04 (REC-31): "all seven" became all EIGHT with `reopen`.
   The count in the label is not decoration — it is the thing a reader checks
   against the catalogue assertion below. Corrected again 2026-08-04 (REC-16):
   TEN, which is `reopen` and `publish` from the REC-31/REC-14 wave — this label
   was left at eight when the catalogue assertion moved to nine, which is the
   drift the label exists to prevent — plus `inquirydivide`. */
t("every published act carries a NEEDS entry (all ten are mutating session acts)",
  [...ACT_IDS].filter((k) => !needsKeys.includes(k)), []);

console.log("\n--- structural: vocabularies and rungs are the enforcing tables, not copies ---");
/* Superseded 2026-08-03 (REC-11's folded chore): the old assertion pinned
   dispose()'s LITERAL copy of the disposition set identical to the published
   one — right while two arrays existed, wrong once REC-11 flipped the
   direction and made store.mjs IMPORT the published set. The pin's subject
   (a second array that could drift) no longer exists by design, so the
   corrected assertion is structural: the import is present and no literal
   copy survives anywhere in the write path for it to drift against. */
/* Corrected 2026-08-03 (REC-20): the regex pinned the WHOLE import clause
   (`{ DISPOSITIONS }`), so it failed the moment store.mjs took a SECOND named
   binding from the same module — REC-20 imports deriveActs from here so
   op=queue's options[] are this file's derivation and not a copy of it. The
   old form measured the clause; the rule is about the BINDING and the absence
   of a literal, so it now matches DISPOSITIONS wherever it sits in the list. */
t("dispose() enforces the PUBLISHED set: store.mjs imports DISPOSITIONS from affordances.mjs and keeps no literal copy",
  /import \{[^}]*\bDISPOSITIONS\b[^}]*\} from "\.\/affordances\.mjs"/.test(storeSrc)
    && !/const DISPOSITIONS = \[/.test(storeSrc), true);
t("the published action_kind vocabulary IS the array C-2.10 enforces (one import, no copy)",
  VOCABULARIES.action_kind, ACTION_KINDS);
/* CORRECTED 2026-08-05 (REC-24), never exempted. The old assertion pinned SEVEN
   values and was right until DEC-13 ruled that a case put to its subject for
   comment is a KIND of action rather than a note on one — so the suite gains
   `request_for_comment` and this assertion states eight. The pin itself is the
   point and is unchanged: the published vocabulary is the array C-2.10
   enforces, so a kind added in one place cannot go unpublished in the other. */
t("action_kind is the eight-value suite (DEC-13 adds request_for_comment)",
  ACTION_KINDS, ["cpra_request", "grand_jury", "controller_referral", "public_comment", "media", "litigation_support", "request_for_comment", "other"]);

/* REC-35 — THE INTENT LAYER'S THREE VOCABULARIES, and this pair of assertions is
   the drift guard itself rather than a description of it.

   IDENTITY, not equality. `VOCABULARIES.entity_kinds === ENTITY_KINDS` asks
   whether the published value IS the array, not whether it happens to have the
   same words in it today. A literal copy pasted into VOCABULARIES would satisfy
   any deep comparison on the day it was written and drift silently the day the
   set changed — which is the entire failure this item exists to make
   impossible, and is this suite's NEGATIVE CONTROL (a).

   THE STORE SIDE, structurally: the enforcement must DERIVE from the same
   import, so the pin is that the binding is imported and that no literal array
   survives in the private statics for it to drift against. This is the
   DISPOSITIONS pin above, applied to three more sets — and the behavioural half
   (the store's own refusal, read through the op, listing exactly what is
   published) is asserted further down where a live plane is available. */
t("the three intent vocabularies published by op=affordances ARE the arrays, not copies of them",
  [VOCABULARIES.entity_kinds === ENTITY_KINDS,
   VOCABULARIES.relation_kinds === RELATION_KINDS,
   VOCABULARIES.stage_requiredness === STAGE_REQUIREDNESS], [true, true, true]);
t("the store ENFORCES the published arrays: store.mjs imports all three from affordances.mjs and keeps no literal copy",
  [/import \{[^}]*\bENTITY_KINDS\b[^}]*\} from "\.\/affordances\.mjs"/s.test(storeSrc),
   /import \{[^}]*\bRELATION_KINDS\b[^}]*\} from "\.\/affordances\.mjs"/s.test(storeSrc),
   /import \{[^}]*\bSTAGE_REQUIREDNESS\b[^}]*\} from "\.\/affordances\.mjs"/s.test(storeSrc),
   /static\s+#ENTITY_KINDS\s*=\s*new Set\(\[/.test(storeSrc),
   /static\s+#RELATION_KINDS\s*=\s*new Set\(\[/.test(storeSrc),
   /static\s+#REQUIREDNESS\s*=\s*new Set\(\[/.test(storeSrc)],
  [true, true, true, false, false, false]);
/* CORRECTED 2026-08-08 BY FW-14, never exempted. This assertion read "RUNGS
   carries EXACTLY the seven documented assignments — nothing invented (FW-14
   assigns the rest)" and pinned the seven by value. It was RIGHT FOR REC-19,
   whose rule was that a rung comes from a DOCUMENT and whose refusal to invent
   fifty more is what routed the question to FW-14. FW-14's rule is that a rung
   comes from what the code ENFORCES, so the seven are no longer the whole set.
   WHAT THIS PIN NOW HOLDS is the half that did not change: the seven sourced
   assignments are still exactly what their documents say, so a later item cannot
   quietly re-grade one of them while adding others. TOTALITY over the whole
   mutating set — and the absence half — is `rung-ladder.test.mjs`, which owns it
   and is where the classification is asserted in both directions. */
t("the seven DOCUMENT-SOURCED rungs still read exactly as their sources assign them",
  [["attest", "attested"], ["dispose", "reasoned"], ["ratify", "attested"], ["reinstate", "reasoned"],
   ["release", "reasoned"], ["retire", "terminal"], ["sever", "reasoned"]]
    .map(([op]) => [op, RUNGS[op] ?? null]),
  [["attest", "attested"], ["dispose", "reasoned"], ["ratify", "attested"], ["reinstate", "reasoned"],
   ["release", "reasoned"], ["retire", "terminal"], ["sever", "reasoned"]]);
t("and FW-14 has assigned beyond them, so `rung` is no longer null wherever no "
+ "document speaks — the top rung exists and exactly one op carries it (DEC-19)",
  [Object.keys(RUNGS).length > 7,
   Object.entries(RUNGS).filter(([, r]) => r === "irreversible").map(([o]) => o)],
  [true, ["publish"]]);

/* REC-38 — UI-19's TWO MEASURED-ABSENT VOCABULARIES, the REC-35 pin applied to
   the action loop's pair. IDENTITY and not equality, for REC-35's reason
   restated once because it is the whole control: a literal copy of
   ["rests_on","advances"] satisfies every deep comparison the day it is written
   and drifts silently the day DEC-14 gains a third kind. This is NEGATIVE
   CONTROL (d) below. */
t("the two action-loop vocabularies published by op=affordances ARE the catalog's own arrays, not copies",
  [VOCABULARIES.action_basis_kinds === ACTION_BASIS_KINDS,
   VOCABULARIES.correspondence_directions === CORRESPONDENCE_DIRECTIONS], [true, true]);

/* REC-39 — THE FOUR RESOLUTIONS, the LAST of the action loop's closed sets to
   get a published home, and the pin is the REC-35 one for the REC-35 reason.
   Identity and not equality: a literal copy of ["complied","denied",
   "escalated","withdrawn"] satisfies every deep comparison the day it is
   written, which is this suite's NEGATIVE CONTROL (e).

   THE STRUCTURAL HALF IS WIDER HERE THAN FOR ANY SET ABOVE, because this
   vocabulary was written out TWICE and published nowhere: an inline literal in
   `bio-checks.mjs`'s C-2.10 arm, and a local `const RESOLUTIONS` inside
   `store.mjs actionMove()`. Both copies are pinned dead by name — a regex over
   each source for the four words appearing as an array literal — so the state
   REC-39 found cannot be re-entered from either side. The three readers are the
   catalogue's finding, the act's refusal and the publication; the behavioural
   half (each enforcement site's own sentence, read through the op, listing
   exactly what is published) is asserted further down where a plane is live. */
t("the four RESOLUTIONS published by op=affordances ARE the catalog's own array, not a copy",
  VOCABULARIES.resolutions === RESOLUTIONS, true);
t("neither enforcement site keeps a literal copy of the four resolutions any more",
  [/import \{[^}]*\bRESOLUTIONS\b[^}]*\} from "\.\.\/checks\/bio-checks\.mjs"/s.test(storeSrc),
   /\[\s*["']complied["']\s*,\s*["']denied["']\s*,\s*["']escalated["']\s*,\s*["']withdrawn["']\s*\]/
     .test(storeSrc.replace(/\/\*[\s\S]*?\*\//g, "")),
   /\[\s*["']complied["']\s*,\s*["']denied["']\s*,\s*["']escalated["']\s*,\s*["']withdrawn["']\s*\]/g
     .exec(readFileSync(new URL("../checks/bio-checks.mjs", import.meta.url), "utf8")
       .replace(/\/\*[\s\S]*?\*\//g, "").replace(/export const RESOLUTIONS[^;]+;/, "")) !== null],
  [true, false, false]);

/* REC-38 — THE CAPTURE-DIRECTED ACTS' METADATA (UI-22's delegation), and these
   four assertions are the shape decision made structural.

   THE SECOND TOTALITY. The suite has always held that every op in NEEDS is an
   act or a named NON_ACT. That guard cannot see the new failure: an op could be
   correctly classified capture-directed and still ship with no member-facing
   label, which is exactly the state `attest` was in from REC-19 until this item
   — RUNGS.attest correct, sourced and UNREACHABLE, because decorateAct ran over
   ACTS alone. So the NON_ACTS reason prefix `capture-directed:` is now
   load-bearing: it is what makes an op a member of the published block, and the
   two lists are held equal in BOTH directions so a third capture-directed op
   can be neither unpublished nor invented.

   AND THE BLOCK DECLARES NOTHING IT DOES NOT OWN. `needs`, `mode` and `rung`
   have homes — NEEDS, SESSION_OPS, RUNGS — so CAPTURE_ACTS carries id and LABEL
   and nothing else, and the control plane composes the rest through the SAME
   decorateAct every act in ACTS goes through. The label is the one new fact and
   `src/index.mjs` must hold no copy of it: that is the DISPOSITIONS pin's shape,
   and it is NEGATIVE CONTROL (c). */
const captureDirected = Object.entries(NON_ACTS)
  .filter(([, reason]) => /^capture-directed:/.test(reason)).map(([k]) => k).sort();
t("every capture-directed NON_ACT has published metadata, and the block names no op that is not one — both directions",
  [captureDirected.filter((k) => !CAPTURE_ACTS.some((a) => a.id === k)),
   CAPTURE_ACTS.map((a) => a.id).filter((k) => !captureDirected.includes(k))], [[], []]);
t("the capture acts stay NON_ACTS: publishing metadata for one does not make it an act on a bundle",
  CAPTURE_ACTS.filter((a) => ACT_IDS.has(a.id)).map((a) => a.id), []);
/* CORRECTED 2026-08-04 (REC-43 / DEC-39), and SUPERSEDED rather than wrong: the
   set was {id, label} because those were the only facts the block owned. A
   PROMPT is a third, and it has no other home — `prompt` is declared on the act
   in ACTS too (DEC-29(b), REC-16's field), because a sentence attached to a
   control is not composable from NEEDS, SESSION_OPS or RUNGS. So the allowed set
   gains `prompt` and the assertion is NOT loosened: it is still an exact set, so
   `needs`, `mode`, `rung` or any fourth invented key still fails here by name. */
t("CAPTURE_ACTS declares ONLY id, label and prompt — needs/mode/rung have homes and are never copied here",
  [...new Set(CAPTURE_ACTS.flatMap((a) => Object.keys(a)))].sort(), ["id", "label", "prompt"]);
t("index.mjs composes the block through the SAME decorateAct and keeps no literal label of its own",
  [/capture_acts: CAPTURE_ACTS\.map\(decorate\)/.test(indexSrc),
   /import \{[^}]*\bCAPTURE_ACTS\b[^}]*\} from "\.\/affordances\.mjs"/.test(indexSrc),
   CAPTURE_ACTS.some((a) => stripComments(indexSrc).includes(a.label))],
  [true, true, false]);

/* ------------------------------------------------------------- fixtures */
const NOW = "2026-07-01T00:00:00Z";
const infoMd = (id, state, contentHash) => [
  "---", `id: ${id}`, "object_type: information", "schema: information@2",
  `title: "Info ${id}"`, `current_state: ${state}`, "prior_state: null",
  `created: "${NOW}"`, `last_updated: "${NOW}"`,
  ...(contentHash ? [`content_hash: "${contentHash}"`] : []),
  "produced_by:", "  mode: assisted", "  capability_tier: session",
  "group: believe-in-oakland", "references: []", "state_history: []",
  "criticality: supporting",
  "source:", `  locator: "https://oaklandca.opengov.com/${id}"`,
  '  authority: "Oakland OpenGov portal"', '  retrieved: "2026-07-01"',
  "---", "", "## Summary", "", "Record body.", "", "## Provenance Notes", "",
  "## Session Log", "", "## Review Notes", "",
].join("\n");
const projMd = (id) => [
  "---", `id: ${id}`, "object_type: project", "schema: project@1",
  `title: "Project ${id}"`, "current_state: forming", "prior_state: null",
  `created: "${NOW}"`, `last_updated: "${NOW}"`,
  "produced_by:", "  mode: assisted", "  capability_tier: session",
  "group: believe-in-oakland", "references: []", "state_history: []",
  "---", "", "## Thesis Summary", "", "X.", "", "## Open Questions", "",
  "## Ruled Out", "", "## Session Log", "", "## Review Notes", "",
].join("\n");
const focusMd = (id, state) => [
  "---", `id: ${id}`, "object_type: focus", "schema: focus@1",
  `title: "Focus ${id}"`, `current_state: ${state}`, "prior_state: null",
  `created: "${NOW}"`, `last_updated: "${NOW}"`,
  "produced_by:", "  mode: assisted", "  capability_tier: session",
  "group: believe-in-oakland", "references: []", "state_history: []",
  "surfaced_by: human", 'disposition_reason: ""',
  "---", "", "## Statement", "", "S.", "", "## Why It Matters", "",
  "## Open Questions", "", "## Session Log", "", "## Review Notes", "",
].join("\n");
const actnMd = (id) => [
  "---", `id: ${id}`, "object_type: action", "schema: action@1",
  `title: "Action ${id}"`, "current_state: planned", "prior_state: null",
  `created: "${NOW}"`, `last_updated: "${NOW}"`,
  "produced_by:", "  mode: assisted", "  capability_tier: session",
  "group: believe-in-oakland", "references: []", "state_history: []",
  /* Superseded 2026-08-04 (REC-23/D-130): `counterparty: City Clerk` was a
     legal flat string until C-2.10 made the field three-valued. The FACT this
     fixture asserts is unchanged — this action is addressed to the City Clerk —
     so it is corrected into the block that states it, not exempted. */
  "action_kind: cpra_request", "risk_tier: 1",
  "counterparty:", "  state: named", "  name: City Clerk",
  "---", "", "## Plan", "", "P.", "", "## Status", "", "## Correspondence", "",
  "## Session Log", "", "## Review Notes", "",
].join("\n");

const promote = async (id, md, type, state, extraFiles = [], tok = "mem-rec19") => {
  const r = rP(await POST(`op=promote&token=${tok}`, {
    bundleId: id, base: null, snapKey: "20260701T000000Z_aaaa1111", author: "seed",
    meta: { object_type: type, group: "believe-in-oakland", title: `t ${id}`,
            current_state: state, created: NOW, last_updated: NOW },
    files: [{ path: "bundle.md", text: md, bytes: md.length, sha256: sha(md) }, ...extraFiles],
    register: [],
  }));
  if (r.ok === false) throw new Error(`promote ${id}: ${JSON.stringify(r)}`);
  return r;
};
const selectIds = async (ids, tok = "mem-rec19") => {
  const r = rP(await POST(`op=select&token=${tok}&kind=enumerated`, { ids }));
  if (!r.handle) throw new Error(`select: ${JSON.stringify(r)}`);
  return r.handle;
};

/* A NAMED member, because release is a member's decision (MACHINE_CANNOT_RELEASE)
   and "exactly the acts the plane would permit" is proven by performing them. */
const add = rP(await POST("op=memberadd&token=adm-rec19",
  { memberId: "ruth", cover: "cover for ruth", role: "admin", capabilities: ["contribute"] }));
const en = rP(await POST("op=enroll", { invite: add.invite, handle: "ruth", password: "ruth-passphrase-1" }));
if (!en.ok) throw new Error("enroll: " + JSON.stringify(en));
const lg = rP(await POST("op=login", { role: "member:ruth", password: "ruth-passphrase-1" }));
const RUTH = lg.token;

/* ------------------------------------------------------- catalogue + gates */
console.log("\n--- the catalogue call: the full act table and the vocabularies, once ---");
const cat = await affordances(null);
/* Superseded 2026-08-03 (REC-13): six acts became SEVEN when `conclude` was
   published. The old count was not wrong when written — it was the whole
   catalogue then — and correcting it rather than loosening it is the point:
   this assertion exists so a published act cannot appear or vanish without a
   turn saying so, and a `>= 6` would have made it stop doing that. */
/* Superseded again 2026-08-04, by TWO items in the same run, and the count is
   corrected once for both rather than loosened — which is exactly what the
   REC-13 note above says this assertion is for. REC-31 published `reopen` (the
   deferred|dismissed -> open edges the catalog has carried since REC-10 with
   no op writing them), and REC-14 published `publish` (the concluded ->
   published edge, DEC-12's editions). Seven became NINE. */
/* Superseded a third time 2026-08-04 by REC-16, and CORRECTED rather than
   loosened for the reason the two notes above give: this assertion exists so a
   published act cannot appear or vanish without a turn saying so. NINE became
   TEN with `inquirydivide` (DEC-28's `divided` state getting its act), and the
   shape gained `prompt` — DEC-29(b)'s ruling that the divide surface's wording
   must STATE the disclosure the division will make, published on the act
   because a surface renders what it received (DEC-8) and must not compose a
   prompt of its own. */
/* CORRECTED 2026-08-05 (REC-24): TWELVE. The count is the totality check's
   companion — every op in NEEDS is an act here or a NON_ACT with a reason — so
   it moves whenever an object-directed op is added, and REC-24 added two. */
/* CORRECTED 2026-08-04 (REC-45): THIRTEEN, with `inquiryground` — the act that
   AUTHORS the grounds partition REC-42 built and left with no producer. The
   count is corrected and not loosened, for the reason every note above gives:
   this assertion exists so a published act cannot appear or vanish without a
   turn saying so, and a `>=` would have made it stop doing that. */
/* CORRECTED 2026-08-08 (PL-2 / IS-2): NINETEEN, with the six member ops of the
   SIXTH state machine — accept, reject, consider, revert, current and hide over
   an inquiry's basis versions. The count is CORRECTED and not loosened, for the
   reason every note above gives: this assertion exists so a published act cannot
   appear or vanish without a turn saying so, and a `>=` would have made it stop
   doing that. It moved by exactly the number of object-directed ops PL-2 added,
   which is the totality check's companion working. */
t("no target -> the whole catalogue: nineteen acts, each with id/label/weight/needs/mode/rung/prompt",
  [cat.ok, cat.result.catalog.length,
   cat.result.catalog.every((a) => ["id", "label", "weight", "needs", "mode", "rung", "prompt"].every((k) => k in a))],
  [true, 19, true]);
/* DEC-29(b) AS AN ACCEPTANCE CLAUSE, asserted here as a string. The prompt is
   null for every act no ruling attaches one to, and where a ruling does attach
   one it is the PUBLISHED constant — so a surface that has the control
   necessarily has the sentence that must accompany it. The clause-by-clause
   assertions live in divide.test.mjs and inquiryground.test.mjs; what this one
   holds is that the catalogue publishes each prompt from the module that owns
   it and invents one nowhere else. */
/* CORRECTED 2026-08-04 (REC-45), and the old assertion was SUPERSEDED rather
   than wrong: "exactly ONE act carries a prompt" was true when REC-16 wrote it
   and was doing real work — it caught a prompt appearing on an act no ruling
   had attached one to. REC-45 attaches a second, on DEC-29(b)'s own mechanism
   and for the hazard one notch sharper than division's (OR takes the MAXIMUM,
   so grouping is the one act that raises a grade with no new evidence). The
   fix is NOT to loosen this to "at least one": the assertion is rewritten to
   name EVERY act that carries a prompt and pin each to its own published
   constant, so an unattached prompt still fails and a prompt drifting from the
   module that owns it fails too. */
t("every act that carries a PROMPT carries its own published wording, and no other act invents one (DEC-29(b))",
  cat.result.catalog.filter((a) => a.prompt !== null).map((a) => a.id).sort(),
  ["inquirydivide", "inquiryground"]);
t("and each is the constant from the module that owns it, never a copy",
  [cat.result.catalog.find((a) => a.id === "inquirydivide").prompt === DIVIDE_PROMPT,
   cat.result.catalog.find((a) => a.id === "inquiryground").prompt === GROUND_PROMPT],
  [true, true]);
/* CORRECTED 2026-08-05 (REC-24): eight kinds, for the reason stated at the
   ACTION_KINDS pin above. */
t("the catalogue publishes the object vocabularies (searchfields' pattern): dispositions and the eight action kinds",
  [cat.result.vocabularies.dispositions, cat.result.vocabularies.action_kind.length],
  [["deferred", "dismissed"], 8]);

/* REC-35 — THE INTENT LAYER'S THREE VOCABULARIES OVER THE WIRE, and then held
   against WHAT THE STORE ACTUALLY REFUSES.

   The identity pin above proves the publication is the array. It cannot prove
   the enforcement reads that array, because a private static is not visible
   from here — so the second instrument asks the ENFORCING OPS THEMSELVES. Each
   of the three writes its own refusal from the set it validates against, in the
   "… one of a, b, c" shape every closed-vocabulary refusal in store.mjs takes,
   and each is asked with the field that trips exactly that check. If the
   publication and the enforcement ever hold different words, these three
   assertions say so and name both lists — which is NEGATIVE CONTROL (b).

   This is UI-13's own probe, kept and INVERTED: it was the surface's source of
   options and is now a cross-check on the publication that replaced it. */
const oneOf = (detail) => {
  const m = /\bone of ([^.(]+)/.exec(String(detail || ""));
  return m ? m[1].trim().split(/\s*,\s*/) : null;
};
const vocabRefusal = async (op, body) => rP(await POST(`op=${op}&token=mem-rec19`, body));
const noKind    = await vocabRefusal("entitycreate", {});
const badRel    = await vocabRefusal("relationdeclare", { relation: "__not_a_relation__" });
const badReq    = await vocabRefusal("progressiondefine",
  { progressionKey: "rec35-probe", label: "rec35 probe",
    stages: [{ key: "s1", cardinality: "1", required: "__not_a_requiredness__" }] });
t("the vocabularies reach a caller OVER THE WIRE, exactly as published",
  [cat.result.vocabularies.entity_kinds, cat.result.vocabularies.relation_kinds,
   cat.result.vocabularies.stage_requiredness],
  [ENTITY_KINDS, RELATION_KINDS, STAGE_REQUIREDNESS]);
t("op=entitycreate REFUSES against exactly the published entity_kinds (the store's own sentence, not a copy)",
  [noKind.reason, oneOf(noKind.detail)], ["NO_KIND", cat.result.vocabularies.entity_kinds]);
t("op=relationdeclare REFUSES against exactly the published relation_kinds",
  [badRel.reason, oneOf(badRel.detail)], ["UNKNOWN_RELATION", cat.result.vocabularies.relation_kinds]);
t("op=progressiondefine REFUSES against exactly the published stage_requiredness",
  [badReq.reason, oneOf(badReq.detail)], ["BAD_REQUIRED", cat.result.vocabularies.stage_requiredness]);
/* And the other direction, so the publication cannot be a SUPERSET the store
   would then refuse (DEC-8's disagreement, in the shape that costs a member a
   control that does not work): every published kind is ACCEPTED by the op. */
const kindAccepted = [];
for (const k of cat.result.vocabularies.entity_kinds) {
  const r = rP(await POST(`op=entitycreate&token=mem-rec19`, { kind: k, label: `rec35 ${k}` }));
  kindAccepted.push(r.ok === true);
}
t("every PUBLISHED entity kind is one op=entitycreate actually accepts — the publication is not a superset",
  kindAccepted, cat.result.vocabularies.entity_kinds.map(() => true));

/* REC-38 — THE CAPTURE ACTS OVER THE WIRE, and what makes RUNGS.attest reachable.

   The block answers in the SAME producer shape every act does, because it goes
   through the same decorateAct: a surface that can render an act can render
   these without learning a second shape. What it proves here is the thing
   UI-22's delegation was actually about — `attest` arrives with a LABEL the
   plane wrote, the capability the gate will really ask for, and the `attested`
   rung Constructs:275 assigned and nobody could read. `monitor` arrives beside
   it with rung null, which is the honest answer and not an omission.

   The label's DRIFT guard is the structural pin above (index.mjs holds no copy);
   what this asserts is that what the module declares is what a caller receives. */
t("op=affordances publishes the capture-directed acts, each in the producer's own act shape",
  [cat.result.capture_acts.map((a) => a.id),
   cat.result.capture_acts.every((a) => ["id", "label", "weight", "needs", "mode", "rung", "prompt"]
     .every((k) => k in a))],
  [CAPTURE_ACTS.map((a) => a.id), true]);
t("the LABEL a surface renders is the plane's own — UI-22's residue, and the last surface-authored act wording",
  cat.result.capture_acts.map((a) => [a.id, a.label]), CAPTURE_ACTS.map((a) => [a.id, a.label]));
/* CORRECTED 2026-08-04 (REC-43 / DEC-39), and SUPERSEDED rather than wrong:
   `prompt: null` was the honest answer while no ruling attached a sentence to
   this act — REC-38 refused to invent one and routed the question, which is why
   there is a ruling to enact. DEC-39 attaches it, so the pin is corrected to the
   PUBLISHED constant rather than loosened: a null prompt on attest now fails
   here, and so does a prompt that is not `ATTEST_FENCE`. */
t("RUNGS.attest is REACHABLE at last: attest publishes its sourced `attested` rung, the capability NEEDS names, and session mode",
  cat.result.capture_acts.find((a) => a.id === "attest"),
  { id: "attest", label: CAPTURE_ACTS.find((a) => a.id === "attest").label,
    weight: null, needs: "contribute", mode: "session", rung: RUNGS.attest,
    /* FW-14 adds `rung_absence` to every decorated act. It is null here because
       attest CARRIES a rung; the pin stays exact rather than being loosened to a
       subset match, because an exact object is what catches a key arriving. */
    rung_absence: null, prompt: ATTEST_FENCE });
/* CORRECTED BY FW-14. This read "monitor publishes rung null — no document
   assigns it one, and a capture act guesses no more than a bundle act does".
   The rung is still null and monitor is still absent from RUNGS, so the
   MEASUREMENT is unchanged; what changed is that a null rung is no longer the
   absence of a classification. Monitor is named in RUNG_ABSENT on the ground
   `observational`, and the assertion now requires that ground to reach the
   caller — because "null because nobody looked" and "null because the act
   records an observation" are different answers and used to look identical. */
t("monitor publishes rung null WITH ITS STATED GROUND — a capture act's absence is stated, not blank",
  [cat.result.capture_acts.find((a) => a.id === "monitor").rung,
   cat.result.capture_acts.find((a) => a.id === "monitor").rung_absence,
   "monitor" in RUNGS], [null, "observational", false]);

/* REC-43 / DEC-39 — THE CO-ATTESTATION HONESTY FENCE, published with the act.
 *
 * DEC-39's ruling has two halves and both are asserted here. THE WORDING IS
 * BOB'S: it is taken verbatim from the DEC-39 entry, and the first assertion
 * below reads the entry's own blockquote and compares it, so a session that
 * paraphrased or "improved" the sentence would fail against the ruling itself
 * rather than against a copy of it. THE LETTERS ARE THE RULE'S: `Grade B` and
 * `Grade A` are composed from `EARNED_CAPTURE_CEILING` and the rank above it in
 * `BASIS_GRADES`, imported from where `checkEarnedLeg` refuses a leg claiming
 * more than the ceiling — so the sentence a member reads and the grade the gate
 * will accept move together or the suite fails.
 *
 * THE DRIFT GUARD IS STRUCTURAL AS WELL AS BEHAVIOURAL, and REC-35's finding is
 * exactly why: a hand-typed literal saying "Grade B … Grade A" would satisfy
 * every wire assertion here, because an identical copy agrees at zero cost. So
 * the pin below reads the SOURCE and fails if the fence's grade letters are
 * spelled in `affordances.mjs` instead of composed, and if `store.mjs` keeps a
 * ceiling of its own. That is this item's negative control. */
const DEC_FENCE = (() => {
  const lines = readFileSync(new URL("../../docs/development/DECISIONS.md", import.meta.url), "utf8")
    .split("\n");
  const at = lines.findIndex((l) => l.startsWith("### DEC-39"));
  if (at < 0) return null;
  const quoted = lines.slice(at, at + 80).filter((l) => /^\s*>\s/.test(l))
    .map((l) => l.replace(/^\s*>\s?/, ""));
  if (!quoted.length) return null;
  /* The `**`/`*` markers and the blockquote's line breaks are DECISIONS.md's
     RENDERING, not part of the sentence; every word, its order and `TRUE`'s
     capitalisation are compared unchanged. */
  return quoted.join(" ").replace(/\*/g, "").replace(/\s+/g, " ").trim();
})();
t("the published fence IS Bob's sentence: byte-identical to the DEC-39 entry's own wording, not a paraphrase of it",
  [DEC_FENCE !== null, DEC_FENCE === ATTEST_FENCE], [true, true]);
t("attest publishes it over the wire, from the module that owns it — never a copy (DEC-29(b)'s mechanism, REC-16's field)",
  [cat.result.capture_acts.find((a) => a.id === "attest").prompt === ATTEST_FENCE,
   cat.result.capture_acts.filter((a) => a.prompt !== null).map((a) => a.id)],
  [true, ["attest"]]);
t("and the publication EQUALS the enforcement's own value: the fence composed from the ceiling the gate enforces",
  ATTEST_FENCE === attestFence(EARNED_CAPTURE_CEILING, UNREACHABLE_CAPTURE_GRADE), true);
t("the two letters it states are the RULE's: the ceiling checkEarnedLeg enforces, and the rank immediately above it",
  [ATTEST_FENCE.includes(`Grade ${EARNED_CAPTURE_CEILING} capture toward evidentiary weight`),
   ATTEST_FENCE.includes(`never reaches Grade ${UNREACHABLE_CAPTURE_GRADE}`),
   UNREACHABLE_CAPTURE_GRADE === BASIS_GRADES[BASIS_GRADES.indexOf(EARNED_CAPTURE_CEILING) - 1]],
  [true, true, true]);
/* THE WORDING IS A FUNCTION OF THE RULE, driven rather than reasoned: compose
   the same sentence under a DIFFERENT ceiling and it says the different letters.
   A literal copy cannot do this, which is what makes it evidence. */
t("move the rule and the sentence moves with it — the fence is composed, not stored",
  [attestFence("C", "B") === ATTEST_FENCE,
   attestFence("C", "B").includes("Grade C capture toward evidentiary weight"),
   attestFence("C", "B").includes("never reaches Grade B")],
  [false, true, true]);
/* AND IT REFUSES TO COMPOSE A SENTENCE IT CANNOT MAKE TRUE: with no grade above
   the ceiling there is nothing the fence can honestly say is unreachable. */
t("with no grade above the ceiling the fence THROWS rather than publishing 'never reaches Grade null'",
  (() => { try { attestFence("A", null); return "composed"; } catch { return "threw"; } })(), "threw");
/* THE STRUCTURAL PIN — the negative control's subject. The grade letters must be
   COMPOSED in affordances.mjs and not spelled there, and the ceiling must have
   exactly one home: store.mjs imports it and keeps no `static
   EARNED_CAPTURE_CEILING` of its own. */
const affSrcNoComments = readFileSync(new URL("../src/affordances.mjs", import.meta.url), "utf8")
  .replace(/\/\*[\s\S]*?\*\//g, "");
t("affordances.mjs SPELLS no grade letter in the fence — it interpolates the enforced ceiling and the rank above it",
  [/Grade\s+[ABCD]\b/.test(affSrcNoComments),
   /\$\{ceiling\}/.test(affSrcNoComments) && /\$\{unreachable\}/.test(affSrcNoComments),
   /import \{[\s\S]*?\bEARNED_CAPTURE_CEILING\b[\s\S]*?\} from "\.\.\/checks\/bio-checks\.mjs"/
     .test(affSrcNoComments)],
  [false, true, true]);
t("and store.mjs keeps no ceiling of its own any more — one value, three readers (the registry, the refusal, the fence)",
  [/static\s+EARNED_CAPTURE_CEILING/.test(storeSrc.replace(/\/\*[\s\S]*?\*\//g, "")),
   /import \{[\s\S]*?\bEARNED_CAPTURE_CEILING\b[\s\S]*?\} from "\.\.\/checks\/bio-checks\.mjs"/
     .test(storeSrc)],
  [false, true]);
/* WEIGHT IS null AND THE null IS STATED. `weight` is the SET-APPLICATION weight
   an act's op hard-codes, and a capture act has no set: op=attest takes one sha
   and op=monitor one bundle id, neither through a selection handle. Publishing
   `single` here would be inventing a doctrine to fill a field; dropping the key
   would let a surface read `undefined` and guess. Every act in ACTS still
   carries a real one, which is the other half of this assertion. */
t("a capture act publishes weight null — no selection, no set-application weight — while every bundle act still carries a real one",
  [cat.result.capture_acts.map((a) => a.weight),
   cat.result.catalog.every((a) => typeof a.weight === "string")],
  [cat.result.capture_acts.map(() => null), true]);
/* THE ONE SOURCED RUNG STILL UNREACHABLE, named rather than left to be
   rediscovered: `ratify` is the publication act, its pre-flight is the deferred
   op=publishpreflight (REC-15), and until that lands nothing publishes it. This
   assertion FAILS if a later item makes ratify reachable and does not say so,
   and fails if a sourced rung quietly stops being published. */
const publishedRungIds = new Set([...ACT_IDS, ...CAPTURE_ACTS.map((a) => a.id)]);
/* CORRECTED BY FW-14, never exempted, and the correction makes the assertion
   say what it always meant. It read "every sourced rung now reaches a member
   EXCEPT ratify" and computed `Object.keys(RUNGS)` — which was the SEVEN
   sourced ones and is now the twenty-four assigned ones, most of which are
   deliberately not object-directed acts (op=adminremove is a roster act; there
   is no strip beside a bundle for it to appear on). Testing all of them here
   would assert that op=affordances publishes NON_ACTS, which is the opposite of
   what this file exists for. The clause that mattered is kept exactly: the
   SOURCED seven all reach a member except ratify, whose pre-flight is REC-15's
   deferred op — so this still fails if a later item makes ratify reachable and
   does not say so, and if a sourced rung quietly stops being published. */
const SOURCED_RUNG_IDS = ["attest", "dispose", "ratify", "reinstate", "release", "retire", "sever"];
t("every sourced rung still reaches a member EXCEPT ratify, whose pre-flight is REC-15's deferred op",
  SOURCED_RUNG_IDS.filter((k) => !publishedRungIds.has(k)), ["ratify"]);
t("the two action-loop vocabularies reach a caller OVER THE WIRE, exactly as published",
  [cat.result.vocabularies.action_basis_kinds, cat.result.vocabularies.correspondence_directions],
  [ACTION_BASIS_KINDS, CORRESPONDENCE_DIRECTIONS]);
t("the four resolutions reach a caller OVER THE WIRE, exactly as the catalogue holds them (REC-39)",
  cat.result.vocabularies.resolutions, RESOLUTIONS);
/* CORRECTED 2026-08-04 (REC-14), never exempted. The old assertion said every
   act needs `contribute`, which was true while every act was a corpus-shaping
   one. `publish` is not: concluding says what the record shows, publishing puts
   the group's name on it and states in the group's voice what it does not cover
   and whether it was put to its subject — that is the PUBLICATION surface, the
   same capability op=ratify carries, and a member who may not publish may not
   author the case either. Still composed rather than hand-listed: `mode` comes
   from SESSION_OPS for every act, and exactly one act names the other
   capability. */
t("every act is session-reachable, and each carries the capability its own NEEDS entry names — publish rides the publication surface, not the contribute one",
  cat.result.catalog.map((a) => [a.needs, a.mode]),
  cat.result.catalog.map((a) => [a.id === "publish" ? "publish" : "contribute", "session"]));
/* CORRECTED BY FW-14, never exempted, and this is the pin the item MOVED rather
   than merely reworded. It read "rung is DECLARED: cite is null (no document
   assigns one — FW-14's, not ours), retire is terminal" and pinned cite's rung
   at null. UI-20 recorded WHY at the time: "cite publishes rung null — C-7
   derives reversible but FW-14 assigns". FW-14 has assigned it, and the
   derivation agrees with C-7 — `cite` writes `status: "confirmed"` and
   `sever`'s from-set accepts exactly that, so the plane publishes an act that
   takes a citation back. The old value was not wrong when written; it was the
   honest refusal to guess, and it is superseded by the assignment it was
   waiting for. `retire` is unchanged. */
t("rung is DECLARED: cite is `reversible` (C-7's answer, assigned by FW-14), retire is terminal",
  [cat.result.catalog.find((a) => a.id === "cite").rung,
   cat.result.catalog.find((a) => a.id === "retire").rung], ["reversible", "terminal"]);
t("and neither carries a stated absence, because both carry a rung",
  [cat.result.catalog.find((a) => a.id === "cite").rung_absence,
   cat.result.catalog.find((a) => a.id === "retire").rung_absence], [null, null]);
const unauth = await (await mf.dispatchFetch("http://x/api/?op=affordances")).json();
t("unauthenticated is refused: the act surface reads the working corpus", unauth.ok, false);
const missing = await affordances("INFO-2026-9999-ghost");
t("an unknown target is NO_SUCH_BUNDLE, not an empty act list",
  [missing.ok, missing.reason], [false, "NO_SUCH_BUNDLE"]);

/* -------------------------------------------- collected information bundle */
console.log("\n--- a COLLECTED information bundle: exactly {cite, release}, then PROVEN ---");
const A = "INFO-2026-0001-rec19";
const ds = JSON.stringify({ rows: [] });
const snap = "<html>snapshot</html>";
await promote(A, infoMd(A, "collected", `sha256:${sha("body A")}`), "information", "collected", [
  { path: "data/dataset.json", text: ds, bytes: ds.length, sha256: sha(ds) },
  { path: "snapshots/page.html", text: snap, bytes: snap.length, sha256: sha(snap) },
]);
const affA0 = await affordances(A);
t("collected information publishes EXACTLY the acts the plane would permit: cite and release",
  actIds(affA0), ["cite", "release"]);
t("each act carries its needs (the capability the gate will actually ask for)",
  affA0.result.acts.map((a) => a.needs), ["contribute", "contribute"]);
/* CORRECTED BY FW-14: cite's rung moved from null to `reversible`. The property
   this assertion is FOR — that rung and weight are published DISTINCTLY (C-6) —
   is unchanged and is now asserted against two non-null values, which is a
   stronger form of it than a null ever was. */
t("release's rung is its sourced `reasoned` and cite's is `reversible` — published distinctly from weight (C-6)",
  affA0.result.acts.map((a) => [a.id, a.rung, a.weight]).sort(),
  [["cite", "reversible", "report"], ["release", "reasoned", "refuse"]].sort());
/* REC-38. The capture block is DELIBERATELY NOT narrowed by the target, and
   this is the honest half of the shape decision rather than a convenience.
   Whether a capture can be attested turns on the BYTES BEING IN THE STORE
   (op=attest answers NO_SUCH_CAPTURE otherwise) — a fact affordanceFacts does
   not carry and this handler must not guess at. So the same block answers on
   every shape, as metadata a surface renders beside a capture it already holds;
   deriving one against a bundle's state would be the publication disagreeing
   with the refusal it fronts, which is the whole reason attest is not in ACTS. */
t("the target-shaped answer carries the SAME capture_acts block — metadata, never a derivation about this object",
  affA0.result.capture_acts, cat.result.capture_acts);

/* retire is UNPUBLISHED for a collected bundle — and the store agrees by name. */
const hA1 = await selectIds([A], RUTH);
const retA = rP(await GET(`op=retire&token=${RUTH}&handle=${hA1}&reason=too+early`));
t("retire, attempted on the collected bundle anyway, is refused ILLEGAL_TRANSITION — the unpublished act is the refused act",
  [retA.ok, retA.reason], [false, "ILLEGAL_TRANSITION"]);

/* release, the PUBLISHED act, performed by a named member: it succeeds, and its
   reported weight is the published one. */
const hA2 = await selectIds([A], RUTH);
const rel = rP(await GET(`op=release&token=${RUTH}&handle=${hA2}`
  + `&acknowledgment=${encodeURIComponent("homogeneous batch of one, risks weighed")}`
  + `&mitigation=${encodeURIComponent("sender domain verified by hand")}`));
t("release — the published act — succeeds for the named member, at the published weight",
  [rel.ok, rel.released, rel.weight],
  [true, [A], cat.result.catalog.find((a) => a.id === "release").weight]);
const affA1 = await affordances(A);
t("now verified and uncited: retire appears, release leaves — the state machine drives the list",
  actIds(affA1), ["cite", "retire"]);

/* --------------------------- verified bundle carrying a LIVE cites edge */
console.log("\n--- a VERIFIED bundle with a LIVE cites edge: retire is NOT published (DEC-8's headline) ---");
const B = "INFO-2026-0002-rec19";
const P = "PROJ-2026-0001-rec19";
await promote(B, infoMd(B, "verified", `sha256:${sha("body B")}`), "information", "verified");
await promote(P, projMd(P), "project", "forming");
const hB1 = await selectIds([B]);
const cited = rP(await GET(`op=cite&token=mem-rec19&project=${P}&handle=${hB1}&note=basis`));
t("cite — published for any information bundle — succeeds at the published report weight",
  [cited.ok, cited.cited, cited.weight],
  [true, [B], cat.result.catalog.find((a) => a.id === "cite").weight]);
const affB0 = await affordances(B);
t("the LIVE-cited verified bundle does NOT publish retire — and sever appears, because the edge exists",
  actIds(affB0), ["cite", "sever"]);
t("retire absent is the derivation, not luck: the state machine ALLOWS verified->retired here",
  affB0.result.current_state, "verified");
const hB2 = await selectIds([B]);
const retB = rP(await GET(`op=retire&token=mem-rec19&handle=${hB2}&reason=obsolete`));
t("retire, attempted anyway, is refused CITED naming the citing project — publication and refusal agree",
  [retB.ok, retB.reason, retB.offenders.map((o) => o.citedBy).flat()], [false, "CITED", [P]]);
const affP0 = await affordances(P);
t("the citing project publishes {cite, sever}: its own live edge is what sever would move",
  actIds(affP0), ["cite", "sever"]);

/* severing clears the block: a severed edge is a recorded decision, not a live
   dependency, so retire APPEARS and then SUCCEEDS. */
const hB3 = await selectIds([B]);
const sev = rP(await GET(`op=sever&token=mem-rec19&project=${P}&handle=${hB3}&reason=superseded+by+later+capture`));
t("sever succeeds with its reason", [sev.ok, sev.severed], [true, [B]]);
const affB1 = await affordances(B);
t("after severing: retire appears (the severed edge no longer blocks) and reinstate appears (the edge is recorded)",
  actIds(affB1), ["cite", "reinstate", "retire"]);
const affP1 = await affordances(P);
t("the project now publishes {cite, reinstate}: nothing live to sever, one severed edge to reinstate",
  actIds(affP1), ["cite", "reinstate"]);
const hB4 = await selectIds([B]);
const retB2 = rP(await GET(`op=retire&token=mem-rec19&handle=${hB4}&reason=superseded`));
t("retire — now published — succeeds at the published refuse weight",
  [retB2.ok, retB2.retired, retB2.weight],
  [true, [B], cat.result.catalog.find((a) => a.id === "retire").weight]);
const affB2 = await affordances(B);
t("retired is terminal: only cite (the store checks type, not state — published honestly) and reinstate remain",
  actIds(affB2), ["cite", "reinstate"]);

/* --------------------------------------------------------------- focus */
console.log("\n--- a focus: dispose while an edge exists, EMPTY when elevated — and the empty list is honest ---");
const F = "FOCUS-2026-0001-rec19";
const F2 = "FOCUS-2026-0002-rec19";
await promote(F, focusMd(F, "surfaced"), "focus", "surfaced");
await promote(F2, focusMd(F2, "elevated"), "focus", "elevated");
/* This list became LOAD-BEARING at REC-13. `conclude` is published for an
   inquiry offering the `concluded` edge, and a legacy focus document's row
   says `inquiry` (promote projects the NORMALIZED type) while its own machine
   has no `concluded` in it — so the derivation only answers `{dispose}` here
   because it consults vocabFor over the DECLARED spelling. Conclude's own
   suite proves the store refuses the same document by name. */
/* CORRECTED 2026-08-04 (REC-37), and the OLD EXPECTATION WAS WRONG rather than
   superseded by taste. Both assertions below read `[]`/`["dispose"]` because
   `cite` was published for information and project only — which was itself the
   measured GAP UI-20 found: a question could neither cite nor be cited, so the
   one act by which a record becomes a case did not exist. REC-37 widens
   `op=cite` to accept a question as the citing object, so `cite` is now
   published on every inquiry-typed row (a legacy `FOCUS-` document's row says
   `inquiry`, the normalized type, so it lands here too) — and it is published
   at EVERY state, because the store's guard is type-only on this arm and
   deriving a narrower answer here than the op gives is what this file must
   never do. The second assertion keeps its whole point: an elevated focus still
   publishes no STATE-MACHINE act, which is what "elevated has no legal edge"
   was asserting; `cite` is not one and its presence is the store's type rule
   showing through, exactly as it already does on a RETIRED information bundle
   two blocks above. */
t("a surfaced focus publishes {cite, dispose}; the disposition TARGETS come from the vocabulary, not a UI copy",
  actIds(await affordances(F)), ["cite", "dispose"]);
const affF2 = await affordances(F2);
t("an elevated focus publishes NO state-machine act: elevated has no legal edge and elevation is not a bulk flip (cite is type-only and says nothing about state)",
  actIds(affF2), ["cite"]);
const hF2 = await selectIds([F2]);
const dispF2 = rP(await GET(`op=dispose&token=mem-rec19&handle=${hF2}&to=deferred&reason=not+now`));
t("the empty list is honest: disposing the elevated focus is refused ILLEGAL_TRANSITION by the store",
  [dispF2.ok, dispF2.reason], [false, "ILLEGAL_TRANSITION"]);

/* --------------------------------------------------------------- action */
/* CORRECTED 2026-08-05 (REC-24), never exempted, and the old assertion was
   RIGHT when it was written rather than superseded by taste. It held that an
   action publishes an EMPTY act list, because nothing in this plane operated an
   action and inventing a control for an op that did not exist would have been
   the forbidden surface-side map moved one layer down. REC-24 built the two
   ops, so the empty list stopped being the honest answer and became a lie of
   omission: a member looking at an action would see no way to move it while
   `op=actionmove` sat in the ops table refusing nobody.
   What the corrected assertion holds is the SAME property in the new state —
   the published set is exactly what the store will accept — which is why the
   two acts are then ATTEMPTED below and the refusals checked. */
console.log("\n--- an action bundle: the two acts REC-24 built, and the refusals behind them ---");
const ACTN = "ACTN-2026-0001-rec19";
await promote(ACTN, actnMd(ACTN), "action", "planned");
const affActn = await affordances(ACTN);
t("an action publishes the two acts that operate it (REC-24)",
  [affActn.ok, actIds(affActn)], [true, ["actioncorrespond", "actionmove"]]);
/* DEC-8 both ways, in the same run and on the same object: what is published is
   what the store accepts, and what the store refuses is refused for a reason a
   surface renders rather than computes. A machine credential REACHES both and
   is refused by shape, which is the fail-closed direction. */
const mvNoReason = rP(await GET(`op=actionmove&token=mem-rec19&target=${encodeURIComponent(ACTN)}&to=active`));
t("op=actionmove is reachable and refuses a machine credential BY NAME (not by absence)",
  mvNoReason.reason, "MACHINE_CANNOT_MOVE_ACTION");
const corr = rP(await GET(`op=actioncorrespond&token=mem-rec19&target=${encodeURIComponent(ACTN)}&direction=sent&at=2026-07-01&account=x`));
t("op=actioncorrespond is reachable and refuses a machine credential BY NAME",
  corr.reason, "MACHINE_CANNOT_CORRESPOND");

/* REC-38 — THE TWO VOCABULARIES HELD AGAINST WHAT THE PLANE ACTUALLY REFUSES,
   which is REC-35's second instrument and exists because the identity pin
   cannot do this job. The pin proves the PUBLICATION is the catalog's array; it
   cannot prove the two ENFORCEMENT sites read that same array, because one is a
   check-catalogue function and the other a store guard, and a private reading
   is invisible from here. So each is asked with the field that trips exactly
   its check, and the refusal's own sentence — written from the set it validates
   against — is compared to what was published. If publication and enforcement
   ever hold different words, these two say so and name both lists.

   The two sites are deliberately DIFFERENT LAYERS, because that is where REC-24
   put them: a basis leg's kind is judged AT THE WRITE (store.mjs's action arm
   runs the catalogue's own `actionBasisFindings` before anything lands, so the
   store's view and C-2.10's view are one rule and a malformed action neither
   lands nor audits clean), and a correspondence direction is an OP-TIME refusal
   in actionCorrespond. Both refusals are asked for here rather than the check
   catalogue being called in-process, because a function this harness imports
   proves nothing about what a caller meets. */
const oneOfColon = (s) => {
  const m = /\bone of:?\s*([^.(]+)/.exec(String(s || ""));
  return m ? m[1].trim().split(/\s*,\s*/) : null;
};
const BADACT = "ACTN-2026-0002-rec19";
const badBasisMd = actnMd(BADACT).replace("  name: City Clerk\n---",
  `  name: City Clerk\naction_basis:\n  - target: ${A}\n    kind: __not_a_basis_kind__\n---`);
const badBasis = rP(await POST(`op=promote&token=mem-rec19`, {
  bundleId: BADACT, base: null, snapKey: "20260701T000000Z_aaaa1111", author: "seed",
  meta: { object_type: "action", group: "believe-in-oakland", title: `t ${BADACT}`,
          current_state: "planned", created: NOW, last_updated: NOW },
  files: [{ path: "bundle.md", text: badBasisMd, bytes: badBasisMd.length, sha256: sha(badBasisMd) }],
  register: [],
}));
const kindFinding = (badBasis.findings || []).find((f) => /is not one of/.test(f.detail || ""));
t("the write path REFUSES a basis leg against exactly the published action_basis_kinds (the catalogue's own sentence, not a copy)",
  [badBasis.reason, kindFinding?.check, oneOfColon(kindFinding?.detail)],
  ["ACTION_BASIS_REFUSED", "C-2.10", cat.result.vocabularies.action_basis_kinds]);
const badDir = rP(await GET(
  `op=actioncorrespond&token=${RUTH}&target=${encodeURIComponent(ACTN)}&direction=__not_a_direction__&at=2026-07-01&account=x`));
t("op=actioncorrespond REFUSES against exactly the published correspondence_directions, and publishes the legal set with it",
  [badDir.reason, badDir.legal, oneOfColon(badDir.detail)],
  ["BAD_DIRECTION", cat.result.vocabularies.correspondence_directions,
   cat.result.vocabularies.correspondence_directions]);

/* REC-39 — THE FOUR RESOLUTIONS HELD AGAINST BOTH ENFORCEMENT SITES, the REC-38
   instrument above applied to the set that had no publication at all until this
   item. The identity pin proves the PUBLICATION is the catalogue's array; it
   cannot see whether the two enforcers read that same array, and here there
   were two of them holding two hand-written copies. So each is asked with the
   input that trips exactly its check and its OWN sentence is compared against
   what was published.

   THE TWO SITES ARE DIFFERENT LAYERS, deliberately, and both matter to a
   member. `op=actionmove` refuses NO_RESOLUTION at OP TIME and publishes
   `legal:` with it — that list is what UI-19's chooser renders, so a drift there
   costs the member a control offering words the plane will not take. C-2.10
   judges the DOCUMENT that lands, so a drift there lets a bundle audit dirty
   forever over a word the act happily accepted. One array is the only thing
   that keeps those two answers the same. */
const ACTV = "ACTN-2026-0003-rec39";
await promote(ACTV, actnMd(ACTV).replace("current_state: planned", "current_state: active"),
              "action", "active");
const noRes = rP(await GET(`op=actionmove&token=${RUTH}&target=${encodeURIComponent(ACTV)}`
  + `&to=resolved&reason=${encodeURIComponent("the clerk answered in full")}`));
t("op=actionmove REFUSES against exactly the published resolutions, and publishes the legal set with it",
  [noRes.reason, noRes.legal, oneOfColon(noRes.detail)],
  ["NO_RESOLUTION", cat.result.vocabularies.resolutions, cat.result.vocabularies.resolutions]);
/* And the other direction, because a set published as a SUPERSET of what the
   act accepts is the failure that costs a member a control that does not work:
   every published word is one the act actually takes. Each move is made on its
   own action so no move is judged from a state a previous one left behind. */
const resolutionAccepted = [];
for (const r of cat.result.vocabularies.resolutions) {
  const id = `ACTN-2026-0004-rec39${r.slice(0, 3)}`;
  await promote(id, actnMd(id).replace("current_state: planned", "current_state: active"),
                "action", "active");
  const mv = rP(await GET(`op=actionmove&token=${RUTH}&target=${encodeURIComponent(id)}`
    + `&to=resolved&resolution=${r}&reason=${encodeURIComponent("the clerk answered in full")}`));
  resolutionAccepted.push(mv.ok === true && mv.resolution === r);
}
t("every published resolution is one op=actionmove ACCEPTS (the publication is not a superset)",
  resolutionAccepted, cat.result.vocabularies.resolutions.map(() => true));
/* C-2.10's own sentence, the second enforcement site, read off a document that
   LANDED carrying a resolution the catalogue does not know. The finding is the
   catalogue's and its list is derived from the same array — before this item the
   sentence transcribed the four words a second time inside the statement that
   tested them. */
const BADRES = "ACTN-2026-0005-rec39";
const badResMd = actnMd(BADRES)
  .replace("current_state: planned", "current_state: resolved")
  .replace("action_kind: cpra_request", "action_kind: cpra_request\nresolution: __not_a_resolution__");
await promote(BADRES, badResMd, "action", "resolved");
/* Read through op=audit, which is the sweep that runs the catalogue over what
   LANDED — the "audit clean before you call anything done" gate — rather than by
   calling checkBundle in this process, for the reason stated above the
   correspondence assertion: a function this harness imports proves nothing about
   what a caller meets. `after` is set one character short of this bundle's id so
   the single-row page is this document and no other. */
const badResAudit = rP(await GET(
  `op=audit&token=mem-rec19&after=${encodeURIComponent("ACTN-2026-0005-rec3")}&limit=1`));
const resFinding = (badResAudit.offenders?.[0]?.errors || [])
  .find((e) => /requires resolution in/.test(e.detail || ""));
t("C-2.10 REFUSES against exactly the published resolutions, in the catalogue's own sentence",
  [badResAudit.offenders?.[0]?.bundleId, resFinding?.check,
   (/\bin:\s*([^.(]+)/.exec(resFinding?.detail || "")?.[1] || "").trim().split(/\s*,\s*/)],
  [BADRES, "C-2.10", cat.result.vocabularies.resolutions]);

/* ----------------------------------------- rung honesty across everything */
/* CORRECTED BY FW-14. The heading read "rung honesty: null wherever no document
   assigns one" and the assertion allowed only [null, reasoned, terminal,
   attested] while requiring cite to be ALWAYS null. Both halves are superseded
   by the assignment: the ladder now has five rungs with `irreversible` at the
   top (DEC-19 as amended) and cite carries `reversible`. THE HONESTY PROPERTY
   THIS BLOCK EXISTS FOR IS STRENGTHENED RATHER THAN DROPPED — instead of
   allowing null anywhere, it now requires that a null rung ALWAYS arrive with a
   stated ground, which is the shape "honest absence" actually has. */
console.log("\n--- rung honesty: a rung from the published ladder, or a STATED absence ---");
const everyAct = [affA0, affA1, affB0, affB1, affB2, affP0, affP1].flatMap((r) => r.result.acts);
t("across every response: rung is a member of the published ladder or null, and cite is ALWAYS `reversible`",
  [everyAct.every((a) => a.rung === null || cat.result.vocabularies.rung_ladder.includes(a.rung)),
   everyAct.filter((a) => a.id === "cite").every((a) => a.rung === "reversible")], [true, true]);
t("and a null rung NEVER arrives bare: every act without one names the ground it "
+ "has none on, so 'nobody classified this' is no longer a reachable answer",
  everyAct.filter((a) => a.rung === null && a.rung_absence === null).map((a) => a.id), []);
t("the derivation module agrees with the wire (no second copy in the handler)",
  /* REC-72 added `cited_by_case` — how many of the citers are CASES, which is
     what `sever`/`reinstate` are derived over, because `op=sever` refuses a
     citing object that is not a project. Stated here rather than left to the
     rule's `?? 0` default, so this fixture exercises the SHAPE the store
     actually returns and not the fallback. */
  deriveActs({ object_type: "information", current_state: "collected",
               cites_in: { confirmed: [], severed: [] }, cites_out: { confirmed: 0, severed: 0 },
               cited_by_case: { confirmed: 0, severed: 0 } })
    .map((a) => a.id).sort(), ["cite", "release"]);

/* probe class reaches it, confined to scratch as everywhere. */
const prb = await affordances(null, "prb-rec19");
t("probe class reaches the catalogue (the surface is exercisable against scratch)", prb.ok, true);

await mf.dispose();
console.log(`\naffordances: ${pass} pass, ${fail} fail`);
process.exit(fail ? 1 : 0);
