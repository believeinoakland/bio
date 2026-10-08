# instance-setup (T37)

**Status** · session_01BJWkvPGgpsKkM8XcBPtB1a · depth 2 · WORKING · handled B2

## J1 · QUESTION

Four readings I am building on; each is mine unless you answer otherwise (none blocks the job).
1. R68 "sibling `.means` or `.does` entry": for a key k (not itself ending `.means`/`.does`), drop its last segment, then more, and take the first `<prefix>.means` or `<prefix>.does` held (prefix of at least 2 segments). So `weight.reversible.name` → `weight.reversible.means`, `act.publish.label.ceremony` → `act.publish.does`, `column.money.figure.name` → none (`.shows` is not named). 284 of 921 words get a `means`; a `.means`/`.does` word itself has `means: null`. No key in e08cd35ecb has both.
2. `translationdraftrecord`'s body (the door's hand-back, control-plane T37-33): `{direction, language, keys?|key, words, draft, not_drafted?}` with `by` stamped from the query; `draft` is agent-worker R70's `draft` as answered (`{words: [{key, text}]}` or `{key, english}`), `words` what `translationdraft` answered. The route re-runs `translationdraft`'s refusals before recording, so a stale hand-back records nothing. For `to_english` the SHA-256 recorded is that of `words[0].text` (the kept text the reading read).
3. R55: `assistantGate()` returns `credentials.aiKeptAway()` as given; if that provider throws (credentials says it never does), the gate answers `STORE_DID_NOT_ANSWER` (fail closed, no copy of AI_KEPT_AWAY). R65's second check (the door's `assistant.on === false` while the gate answers null, a keep-away lifted between the two reads) answers `ASSISTANT_DRAFT_UNAVAILABLE`, not a minted AI_KEPT_AWAY.
4. The new codes take C-64.11 onward in R67–R73's order (C-119.5 stays retired, unused).

## J2 · QUESTION

Replaces J1 (its four readings unchanged), adding a fifth that needs your act.
1. R68 "sibling `.means` or `.does` entry": for a key k (not itself ending `.means`/`.does`), drop its last segment, then more, and take the first `<prefix>.means` or `<prefix>.does` held (prefix of at least 2 segments). So `weight.reversible.name` → `weight.reversible.means`, `act.publish.label.ceremony` → `act.publish.does`, `column.money.figure.name` → none (`.shows` is not named). 284 of 921 words get a `means`; a `.means`/`.does` word itself has `means: null`. No key in e08cd35ecb has both.
2. `translationdraftrecord`'s body (the door's hand-back, control-plane T37-33): `{direction, language, keys?|key, words, draft, not_drafted?}` with `by` stamped from the query; `draft` is agent-worker R70's `draft` as answered (`{words: [{key, text}]}` or `{key, english}`), `words` what `translationdraft` answered. The route re-runs `translationdraft`'s refusals before recording, so a stale hand-back records nothing. For `to_english` the SHA-256 recorded is that of `words[0].text` (the kept text the reading read).
3. R55: `assistantGate()` returns `credentials.aiKeptAway()` as given; if that provider throws (credentials says it never does), the gate answers `STORE_DID_NOT_ANSWER` (fail closed, no copy of AI_KEPT_AWAY). R65's second check (the door's `assistant.on === false` while the gate answers null, a keep-away lifted between the two reads) answers `ASSISTANT_DRAFT_UNAVAILABLE`, not a minted AI_KEPT_AWAY.
4. The new codes take C-64.11 onward in R67–R73's order (C-119.5 stays retired, unused).
5. **Needs a `modules.json` edit (yours):** R68's word list, carried as generated data beside the code (your START), lives in a new file `bio-plane/src/setup-words.mjs` (about 165 KB, 921 entries, written by a small generator from `words.json` at e08cd35ecb, with a test that it equals the file). My `paths` are three files today (`setup.mjs`, `setup-fleet.mjs`, `livefire.mjs`), so ownership will refuse it: please add `bio-plane/src/setup-words.mjs` to instance-setup's `paths` on `tranche/T37`. I am writing it there now; if you would rather it live elsewhere, say where.

## Completion (INSTANCE-SETUP #16, T37-30)

**Reading.** BOB's measure: 721 KB with the `record-grammar` edge; my own count of what my entry changes plus my tests was already over 300 KB (requirements 55 KB, code 164 KB, tests 225 KB). So, as the START's (3): read whole myself: `build/requirements/instance-setup.md` (twice, and R67's K2238 addition at B2); layer 11's row of `build/layers.md`; T37-30 and the plan's rules at the opening (rules 2, 4, 6); DEC-127, DEC-157, DEC-179 whole; `words.json` at e08cd35ecb's header fields (its 921 entries read as R68 uses them); K231, K1793, K1804, K2101, K2130, K2162, K2175, K2200, K2201, K2216; all of `setup.mjs` (2,193 lines before), `setup-fleet.mjs`'s exports; the tests my entry changes (`fixture.mjs`, `assistant`, `draft`, `words`) and the two new files; the services: credentials R35 (`aiKeptAway`, its source and row C-29.31) and R52, record-grammar's Purpose, R38, R42, R50 and `proposalLabel`/`isMachineIdentity`, jurisdictions R37, R70–R73 and `combine`'s `local_names` code, membership R84 (`notAnAdmin`), R86, R64, R68 (`isAdministrator`, `memberFacts`); and, for the door's contract, store-door R10, control-plane R57 and R66, op-declarations R35 and R37, agent-worker R68–R70. A worker read the twelve other test files whole (`exports`, `group`, `identity`, `limits`, `page`, `places`, `profiles`, `recovery`, `relay`, `reports`, `seeds`, `worker-reports`) and wrote a summary of about 6 KB, every statement citing file and line. It found the two tests my change had to move (`exports`:81, the ops map's keys; `group`:137, the C-64 set), the R31 sweep over every translation (`profiles`:168), the positional reads of `INSTANCE_SETUP_TABLES` (`group`:100: new tables appended last), and that none of the twelve names `ASSISTANT_OFF`. Nothing it left out mattered: all twelve pass unchanged but those two. `livefire.mjs` is untouched and was not read.

**Entries applied (T37-30).**
- R55 (N765; K231, K2201): `assistantGate()` answers `credentials.aiKeptAway()` as given (its R35, the one site): `null`, or credentials' `AI_KEPT_AWAY` with its row (C-29.31) and `keep_away`. A provider that throws is `STORE_DID_NOT_ANSWER` (J2 reading 3). `ASSISTANT_OFF` and its row C-119.5 retired (all three sites), the number unused; R65's refusal is `AI_KEPT_AWAY` through the gate, and its door-resolved `assistant.on === false` with an open gate answers `ASSISTANT_DRAFT_UNAVAILABLE` (reading 3). `assistantState()` unchanged.
- R67: `translationDraft` (both directions), `translationDraftRefusal` (K2238, in-process, no gate read), and the record route `translationDraftRecord` (`op=translationdraftrecord`, the body of reading 2, the first refusals asked again). Past the refusals and the gate, `translationDraft` answers `ASSISTANT_DRAFT_UNAVAILABLE` carrying `direction`, `language`, `words` (and `offered_official` or `key`) (K2238). `to_language`: the first 100 missing in list order or the keys asked; a local name of the active profiles whose name is a word's English (term fold, exact) is offered and never sent. Drafts stored labelled `proposalLabel("class:ai", "translation")` with who asked and when; a draft with changed placeholders or not one line within 2,000 characters is named in `not_drafted`, never stored; a key not asked is never stored. `to_english`: administrators only, an awaiting word; the record route stores key, language, SHA-256 of the kept text read, the administrator and the instant, no text (K2216).
- R68: `INTERFACE_WORDS` (921, 345 protected), `INTERFACE_WORDS_COMMIT` from the generated `setup-words.mjs` (K2238 added it to my paths). `means` by reading 1 (284 words have one).
- R69 `translationGrant` and `translationGranted`; R70 `translationAdopt`; R71 `translationConfirm` (an administrator who holds a grant of the language and did not keep the word counts as the second granted speaker; any other administrator, the adopter included, needs their own reading of the current text); R72 `translationRevert` (one numbered act sequence per word: undo of an adoption returns to what it replaced with its state; undo of an undo returns to what it undid); R73 `translationMark` (open while the word's latest act is unchanged); R74 `translations` and `interfaceWords` (canonical tags, so `pt-br` is `pt-BR`); R75 seven append-only tables (`translation_grants`, `_drafts`, `_adoptions`, `_confirmations`, `_undos`, `_marks`, `_readings`), exempt from purge, export `never`, each name held by value (`*_name`) beside the id. Nine routes in `instanceSetupOps`, stamps from the query.
- Own flaw fixed: `SEED_CAPTURE_UNREADABLE` and `SEED_CAPTURE_NOT_LEGISTAR` (C-119.9, C-119.10) named `seatsSeed > is-seed-capture`, a region never marked; now marked. A new R30 test checks every row's `where` against the source, as conformance's T37-36 does.

**Rows (await T38's stamp).** Added, C-64.11–C-64.26: `TRANSLATION_DIRECTION_UNKNOWN`, `MACHINE_CANNOT_TRANSLATE`, `TRANSLATION_NOT_GRANTED`, `NO_SUCH_WORD`, `TRANSLATION_NOT_MISSING`, `TRANSLATION_KEYS_MALFORMED`, `TRANSLATION_NOTHING_TO_DRAFT`, `NO_SUCH_MEMBER`, `NO_SUCH_DRAFT`, `TRANSLATION_TEXT_REFUSED`, `TRANSLATION_NOT_AWAITING`, `TRANSLATION_CONFIRM_SELF`, `TRANSLATION_NOT_READ_BACK`, `TRANSLATION_NOTHING_TO_UNDO`, `TRANSLATION_NOT_SHOWN`, `TRANSLATION_NOTE_REFUSED`. Two are mine beyond the named ones (BOB's to confirm): `TRANSLATION_KEYS_MALFORMED` (`keys` not 1–100 distinct strings) and `TRANSLATION_NOTHING_TO_DRAFT` (every word asked is kept or an official name, so the door has nothing to send; agent-worker R68 refuses an empty list). Retired: `ASSISTANT_OFF` (C-119.5). `where`s re-pointed: C-119.9, C-119.10 now resolve.

**Deferred.** None.

**Found in other modules (the REPORT).**
- Reds my merge opens, against `tranche/T37` over the 16 files that read this module (baseline 106/2, mine 101/7; the 2 are answer-envelope `families.test.mjs`'s inherited reds): BOB's four named, `store-door` `routes.test.mjs`:121, `control-plane` `t34-routes.test.mjs`:211, `plane` `ask.test.mjs`:100 and :257 (BOB's ":264"); and one not named: `plane` `door.test.mjs`:111 (R1, R5: pins "twenty-four routes", now 33), for T37-48.
- The gate's answer is now credentials' envelope: `set_by` and `set_at` are no longer top-level keys (they are inside `keep_away`, as before). `store-door` R10 should read `keep_away` (its T37-32 already reads `aiKeptAway()` itself).
- `NO_SUCH_MEMBER` is R69's named code and now has a row here (C-64.18); membership, credentials, tasks and setup-page mint the same code without a row. If the census treats an unrowed code at several sites as one code, it is BOB's to settle (K231).
- Generated artifact made stale (§14): `bio-plane/dist/bio-plane.bundled.mjs` (`setup.mjs` and the new input `setup-words.mjs`), for L11's close.

**Tests and checks.**
- `node --test bio-plane/test/m/instance-setup/`: tests 129, pass 129, fail 0.
- Users' 16 files (listed above): 101/7 mine against 106/2 on the tranche, the five new reds named above.
- `checks/format.mjs`: 136 modules, 135 requirements files; 0 failures.
- `checks/architecture.mjs … instance-setup`: 23 product files, 85 relative imports; 0 failures.
- `checks/coverage.mjs … instance-setup`: 57 of 57 live requirement ids named by a test; 0 failures.
- `checks/ownership.mjs … instance-setup tranche/T37`: 11 files changed; 0 failures.
- No layer tests (manifest).

**P6.** 3,306 lines of code in my paths (`setup.mjs` 3,005, `setup-fleet.mjs` 52, `livefire.mjs` 249), was 2,494; the generated `setup-words.mjs`, 929 lines, counted apart. Under 4,000, with about 700 lines left.

**The word list's generator** (run from the repository root: `git show e08cd35ecb:docs/development/ux-substrate/screens/words.json > words.json; node gen-words.mjs words.json e08cd35ecb bio-plane/src/setup-words.mjs`):

```js
// Writes bio-plane/src/setup-words.mjs from words.json (argv[2]) at commit argv[3].
import { readFileSync, writeFileSync } from "node:fs";
const [, , file, commit, out] = process.argv;
const words = JSON.parse(readFileSync(file, "utf8")).words;
const K = new Map(words.map((w) => [w.key, w]));
const sib = (k) => {
  const s = k.split(".");
  if (/^(means|does)$/.test(s.at(-1))) return null;
  for (let n = s.length - 1; n >= 2; n--) for (const e of ["means", "does"]) {
    const c = `${s.slice(0, n).join(".")}.${e}`;
    if (c !== k && K.has(c)) return K.get(c).en;
  }
  return null;
};
const lines = words.map((w) => `  [${JSON.stringify(w.key)}, ${JSON.stringify(w.en)}, ${JSON.stringify(w.note ?? null)}, ${JSON.stringify(sib(w.key))}, ${w.protected === true}],`);
writeFileSync(out, `/* GENERATED: do not edit by hand. instance-setup R68 (DEC-179; K2200 (4)): the interface's word list,
   docs/development/ux-substrate/screens/words.json at ${commit} (${words.length} words, ${words.filter((w) => w.protected === true).length} protected), each
   [key, en, note, means, protected]: key, en, note (or null) and protected as the file gives them, means the en of the
   word's sibling .means or .does entry (the nearest dotted prefix of at least two segments holding one), or null.
   Written by the generator recorded in build/jobs/T37/instance-setup.md; words.test.mjs checks it word by word. */
export const WORDS_COMMIT = ${JSON.stringify(commit)};
export const WORD_ROWS = Object.freeze([
${lines.join("\n")}
]);
`);
```

Size (session_01BJWkvPGgpsKkM8XcBPtB1a): test runs 14, module lines 3306
