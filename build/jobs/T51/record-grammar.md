# record-grammar (T51)

**Status** · session_013Br3vEBV5reudfaJtbrbAV · depth 2 · WORKING · handled B8

## J1 · COMPLETE

T51-1 · record-grammar: done.

**Entries applied.** T51-1 (stale comments):
- `bio-plane/src/record-grammar/labels.mjs`:290–292: the reference to `civicos-ui/app.html` (deleted in T51-126) is now "a surface that renders `Asserted by ${…}` verbatim is one field over from it"; the word TODAY is gone.
- `bio-plane/src/record-grammar/titles.mjs`:12–14: "the setup page embeds this function's source verbatim" (the setup page was deleted at T47-74) is now "its source text, evaluated alone, gives the same answers, so a client that embeds it cannot drift from the store (R30)".
- A sweep of the module's code and tests for `civicos-ui`, "setup page", `app.html` and TODAY found nothing else. No behaviour change.

**Deferred.** Nothing.

**Found in other modules.** Coverage, not this module's: `checks/coverage.mjs` names three live ids with no test: agent-harness R17, agent-runner R36, R37, R38, R40, journey-check R19. Those belong to their own jobs; I changed none of them. The Requirements file of record-grammar still says "instance-setup embeds it verbatim" in R30. It is a requirement, so I left it for BOB: the sentence describes a present embedder that the code no longer has (no caller embeds it today).

**Tests and checks.**
- `node --test bio-plane/test/m/record-grammar/`: 101 pass, 0 fail.
- `node checks/run.mjs /home/user/bio`: format 0 failures; architecture 0 failures; coverage 3 failures, all in other modules (above); channels 0 failures.
- `node checks/ownership.mjs /home/user/bio record-grammar tranche/T51 job/T51/record-grammar`: 1 file changed by record-grammar, 0 failures.

Size (session_01MURMfVW6xakigf2Z7K2GRE): test runs 1, module lines 2618

## J2 · COMPLETE

T51-171 · record-grammar: done (commit ef5ec79af7 on job/T51/record-grammar).

**Entries applied.** T51-171, the words pass: the nine findings of `checks/words.mjs` (`build/plan/words-pass/record-grammar.md`), each fixed by the words rule.
- `bio-plane/src/record-grammar/bundle.mjs`:194 (inline): the C-2.5 refusal "schema stamp … is not of the form <type>@<n>" was a template string. It is now `localize('record-grammar.bundle.schema_stamp_form', …)` with `{schema}` filled. The English is unchanged; the list wins once BOB regenerates the rows.
- `bio-plane/test/m/record-grammar/labels.test.mjs`:284–291 (eight testcopy findings): the copied sentences `NO_BASIS_T` and `NO_CITATION_T` are removed. The R29 test now compares each `translation` of `SHARED_ACT_CHECKS` with `word('refusal.NO_BASIS')` and `word('refusal.NO_CITATION')`, both rows present in `words.json`. The test imports `word` from setup-words.
- `bio-plane/test/m/record-grammar/bundle.test.mjs` (appended): a test naming `record-grammar.bundle.schema_stamp_form`. A malformed stamp (`information1`) raises exactly one C-2.5 that names it; a well-formed `information@1` raises none.

**Choices I made.** The new id is a code-origin row, so it will appear in `words-unreviewed.json` at the next regeneration for the design stream's review. No string was judged as one no member reads, so nothing is listed for a REPORT.

**Deferred.** Nothing.

**Found in other modules.** Nothing new in this module's code. On the whole-tree run, the words check reports failures in other modules (wizard-scripts test copies and similar; 2,812 in all) and coverage reports 33 failures; none is in record-grammar. Not this job's, and not touched.

**Tests and checks** (run from `civicos-process` against `/home/user/bio`):
- `node --test bio-plane/test/m/record-grammar/`: 102 pass, 0 fail.
- `node checks/words.mjs /home/user/bio record-grammar`: 0 failures (was 9).
- `node checks/format.mjs /home/user/bio`: 0 failures.
- `node checks/architecture.mjs /home/user/bio record-grammar`: 0 failures.
- `node checks/coverage.mjs /home/user/bio record-grammar`: 61 of 61 live ids named by a test, 0 failures.
- `node checks/ownership.mjs /home/user/bio record-grammar tranche/T51 job/T51/record-grammar`: 4 files changed by record-grammar (the three code files and this record), 0 failures.
- `node checks/run.mjs /home/user/bio` (whole tree): format 0, architecture 0, channels 0; words and coverage failures only in other modules (above).

Size (session_011VXhNRgAkPtLh1zWD7xHc3): test runs 2, module lines 4595

## J3 · COMPLETE

T51-171 · record-grammar, CHANGE B3 (plain findings): done (commit 0c38d307a3 on job/T51/record-grammar; tranche/T51 merged; civicos-process at 27aa50e).

**Entries applied.** The 75 plain findings in `build/plan/words-pass/record-grammar.md`, each judged by the words rule.
- `labels.mjs`: all 45 sentence literals in the proposal and mint tables now read through `word()` on their design rows (`record-grammar.proposal.<subject>.<state>`, `record-grammar.mint.<state>`). All 55 rows exist in `words.json`. Thirty-seven rows match the code exactly. The other eighteen are `machine_proposed` sentences, where the rows spell "labeled" and the code spelled "labelled"; by the list-wins rule the row now shows.
- `bundle.mjs` (31 sites, 27 distinct sentences) and `frontmatter.mjs` (2): the repair hints and finding messages the plain arm flagged now read through `localize` under `record-grammar.bundle.*` and `record-grammar.frontmatter.*` ids. I judged these member-read, matching this module's existing practice of localizing its finding messages (see the question below).
- Tests: `labels.test.mjs` wording fragments say "labeled" (five regexes). The four table digests (R50, R54, R60, R61) are re-pinned: each reproduces its old value exactly when the one spelling is reversed, so only the spelling moved. `bundle.test.mjs` gains a test that names all 29 new ids and checks each is a well-formed id.

**Decisions for BOB (lower-level, recorded here).**
1. Spelling. The design rows spell "labeled as machine work"; `reading-guides`' test already expects that spelling. I followed the list-wins rule and did not add rows. Consequence in another module: `action-grammar` R2 (`bio-plane/test/m/action-grammar/grammar.test.mjs:40`) now fails, because `action-grammar`'s `lawProposalLabel` answers its own "labelled" wording, not record-grammar's `proposalLabel`. I changed nothing in `action-grammar`. The fix belongs to its job: its `lawProposalLabel` should delegate to `proposalLabel`. Your call whether to route it there.
2. Question for BOB: B2's note says members read refusal codes, never English. If the repair hints and finding messages are developer-only, the 33 `bundle`/`frontmatter` sentences belong on the unkeyed list instead of `localize`. Tell me and I will move them; nothing else depends on it.

**Deferred.** Nothing.

**Found in other modules.** The `action-grammar` R2 failure above. Whole-tree run: coverage shows 33 failures and the words check's `plain` arm reports failures in other modules (2,062 plain, 4,769 in all); none names record-grammar. Not touched.

**Tests and checks** (from `civicos-process`, against `/home/user/bio`):
- `node --test bio-plane/test/m/record-grammar/`: 103 pass, 0 fail.
- `node checks/words.mjs /home/user/bio record-grammar`: 0 failures (inline 0, plain 0, testcopy 0, marker 0); no finding in this module remains.
- `node checks/format.mjs /home/user/bio`: 0 failures.
- `node checks/architecture.mjs /home/user/bio record-grammar`: 0 failures.
- `node checks/coverage.mjs /home/user/bio record-grammar`: 61 of 61 live ids named by a test, 0 failures.
- `node checks/ownership.mjs /home/user/bio record-grammar tranche/T51 job/T51/record-grammar`: 0 failures.
- `node checks/run.mjs /home/user/bio`: format 0, architecture 0, channels 0; words and coverage failures only in other modules, none naming record-grammar.

Size (session_011VXhNRgAkPtLh1zWD7xHc3): test runs 8, module lines 4537

## J4 · COMPLETE

T51-171 · record-grammar, CHANGE B5 (test copies of code sentences): done (commit adcf338b1d on job/T51/record-grammar; tranche/T51 merged; civicos-process at ea6cd83).

**Entries applied.** The three test copies in `build/plan/words-pass/record-grammar.md`, and the regex copies the same section asked me to convert.
- `bundle.test.mjs:45`: the C-13.2 message compares with `localize("record-grammar.bundle.record_has_been_updated_but_carries", en)`.
- `bundle.test.mjs:246`: the C-1.1 folder-name message compares with `localize("record-grammar.bundle.folder_name_foldername_does_not", en, { folderName, id })`.
- `bundle.test.mjs`: the unknown-schema check (a regex on the C-2.5 message) compares each message with `localize("record-grammar.bundle.schema_version_schema_is_not", en, { schema })`, the stamp passed in.
- `frontmatter.test.mjs`: the six C-2.1 regex checks compare each message with its `localize(id, en, vars)`, the vars being the fixture's own values (key, indent, line numbers).
- `acceptance.test.mjs`: the two regex checks on the accept row compare with `word("refusal.ACCEPT_MUST_REAUTHOR")`.
- `labels.test.mjs`: the table tests compare each sentence with its design row (`row(subject, state)` → `word("record-grammar.proposal.<subject>.<state>")`). The fragment regexes are gone; the property checks (frozen, key order, `proposalLabel`, no "machine" in member or unstated sentences) stay.
- Found while converting: a backspace byte had replaced a `\b` escape in the R61 `doesNotMatch` regex since before this job. Restored. The check now asserts what it was written to.

**Report for BOB: one finding remains, and it is not in a sentence.** `invariants.test.mjs:78` holds the export name `UNREACHABLE_CAPTURE_GRADE` in the module's key-set check (`Object.keys(RG)` must equal the provided names). The whole-tree words run flags it as a `code` testcopy: the name is a 25-character substring of `leg-earning`'s localize sentence `Grade {UNREACHABLE_CAPTURE_GRADE} is not reachable…`, where it is a placeholder name, filled before anyone reads it. No member reads the name, and I cannot remove it without dropping the key-set check. The fix belongs either in `leg-earning` (rename that placeholder) or in the check (do not count identifier-shaped substrings). I changed nothing in another module. The module's own words check (`node checks/words.mjs /home/user/bio record-grammar`) is at 0 failures; the one finding is visible only on the whole-tree run.

**Deferred.** Nothing.

**Found in other modules.** The `leg-earning` placeholder above. Whole-tree run: coverage 32 failures and the words check's arms in other modules; none names record-grammar except the one report above.

**Tests and checks** (from `civicos-process`, against `/home/user/bio`):
- `node --test bio-plane/test/m/record-grammar/`: 103 pass, 0 fail.
- `node checks/words.mjs /home/user/bio record-grammar`: 0 failures (inline 0, plain 0, testcopy 0, marker 0).
- `node bio-plane/src/setup-words/build.mjs --check` (read-only): exit 0. Its one note is about another module's formatted argument, not this one.
- `node checks/format.mjs /home/user/bio`: 0 failures.
- `node checks/architecture.mjs /home/user/bio record-grammar`: 0 failures.
- `node checks/coverage.mjs /home/user/bio record-grammar`: 61 of 61 live ids named by a test, 0 failures.
- `node checks/ownership.mjs /home/user/bio record-grammar tranche/T51 job/T51/record-grammar`: 0 failures.
- `node checks/run.mjs /home/user/bio`: format 0, architecture 0, channels 0; the one record-grammar line is the report above.

Size (session_011VXhNRgAkPtLh1zWD7xHc3): test runs 12, module lines 4478

## J5 · QUESTION

G59 · fix is done and green; one placement question (QUESTION, replaces nothing).

**Code (bio-plane/src/record-grammar/bundle.mjs, commit b3a087a5a8 + follow-up):** new `snapshotCopyPath(name, key)` derives a copy's path exactly as `RecordCore.snapPath` (cut at the last `/` first, then the last dot of the name; no dot puts the key at the end); used at the C-12.2 snapshot lookup (was :589-590). The reverse mapping (was :651) now accepts the key before the extension's dot OR at the end of the path: `(?:\.|$)`.

**Failing-first, seen RED then green:** `test/m/record-grammar/bundle.test.mjs`, "R40 G59 C-12.2 ..." with names `bundle.md`, `data/x.json`, `snapshots/upload-<64 hex>`, `a/b/c`, `a.b/c`, `a.b/c.d` stored at their record-core paths. RED before the fix: the walker's message exactly (`snapshot '_history/snapshots/upload-<sha minus last char>_<key>f' ... is missing`) plus `history file '...' maps to no manifest entry` for the dotless, subfolder and dotted-directory copies; GREEN after, zero C-12.2, and each copy removed in turn names exactly its own missing path (through `localize`, not a copied sentence).

**QUESTION (the smallest thing I need).** The entry's (a2) parity test (`checkBundle` finds every copy at `RecordCore.snapPath`'s path) cannot be placed by me: in `test/m/ratification/` the ownership check refuses it ("outside record-grammar's paths"), and in `test/m/record-grammar/` the architecture check refuses it (record-core is not earlier than layer 1). I did not work around either. My best reading: have the ratification job (or whichever job BOB names) add it as `bio-plane/test/m/ratification/r7-snappath-parity.test.mjs`; its full text is below and it passes today against my branch (1 pass; red without my fix). Alternatively tell me a placement I own. COMPLETE waits for your answer (R-NOTMET).

Test text:

```js
/* G59 (fix round 7): the history checker (record-grammar's C-12.2) and the writer (record-core's `RecordCore.snapPath`) must
   derive a snapshot copy's path one way. record-grammar is layer 1 and cannot import record-core, so this is the test in a
   module above both: a copy stored at `RecordCore.snapPath`'s path is found by `checkBundle`, whatever the name's shape. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { checkBundle, createSha256 } from "../../../src/record-grammar/index.mjs";
import { localize } from "../../../src/setup-words/index.mjs";
import { RecordCore } from "../../../src/record-core/index.mjs";

const KEY = "20260101T000000Z_aaaaaaaa";
const UPLOAD = `snapshots/upload-${"0123456789abcdef".repeat(4)}`;
const NAMES = ["bundle.md", "data/changes.json", UPLOAD, "a/b/c", "a.b/c", "a.b/c.d", "x.tar.gz", "snapshots/.hidden"];
const CLEAN = [
  "---", "id: INFO-2026-0001-a", "object_type: information", "schema: information@1", "title: T", "current_state: collected",
  "prior_state: null", "created: 2026-01-01T00:00:00Z", "last_updated: 2026-01-01T00:00:00Z", "produced_by:", "  mode: manual",
  "  capability_tier: t1", "group: g", "references: []", "state_history: []", "annotations_open: 0", "reeval_pending: false",
  "visuals: []", "---", "## Summary", "", "## Provenance Notes", "", "## Session Log", "", "## Review Notes", ""].join("\n");

test("R40 G59 the history checker finds every copy at RecordCore.snapPath's path: dotted, dotless, subfolder and dotted-directory names", async () => {
  const files = new Map([["bundle.md", CLEAN], ["_history/manifest.json", JSON.stringify({ entries: [
    { key: KEY, kind: "edit", created: "2026-01-01T00:00:00Z", files: [], snapshotted: NAMES }] })]]);
  for (const n of NAMES) {
    const p = RecordCore.snapPath(n, KEY);
    assert.ok(p.startsWith("_history/"), p);
    files.set(p, "x");
  }
  const r = await checkBundle({ folderName: "INFO-2026-0001-a", files, sha256: async (v) => createSha256().update(typeof v === "string" ? new TextEncoder().encode(v) : v).hex() }, {});
  assert.deepEqual(r.findings.filter((f) => f.check === "C-12.2"), []);
  /* One copy short: the checker names the path the writer would have stored, not another. */
  for (const n of NAMES) {
    const short = new Map(files); short.delete(RecordCore.snapPath(n, KEY));
    const found = (await checkBundle({ folderName: "INFO-2026-0001-a", files: short, sha256: async () => "" }, {})).findings.filter((f) => f.check === "C-12.2");
    assert.deepEqual(found.map((f) => f.message), [localize("record-grammar.bundle.snapshot_snappath_recorded_in_manifest", "snapshot '{snapPath}' recorded in manifest entry '{key}' is missing", { snapPath: RecordCore.snapPath(n, KEY), key: KEY })], n);
  }
});
```

## J6 · COMPLETE

G59 · COMPLETE (code commit b3a087a5a8; parity test placement settled by B7).

**Changed.** `bio-plane/src/record-grammar/bundle.mjs`: new `snapshotCopyPath(name, key)` (above `checkHistoryCoherence`) derives a copy's path exactly as `RecordCore.snapPath` does (cut at the last `/`, then the name's last dot; no dot puts the key at the end); used at the C-12.2 snapshot lookup (was :589-590). The reverse mapping (was :653) accepts the key before the extension's dot or at the end of the path: `(?:\.|$)`.

**Failing-first, RED then GREEN.** `test/m/record-grammar/bundle.test.mjs` "R40 G59 C-12.2 ...": names `bundle.md`, `data/x.json`, `snapshots/upload-<64 hex>`, `a/b/c`, `a.b/c`, `a.b/c.d` at their stored copies. RED before the fix: the walker's message (`snapshot '_history/snapshots/upload-<sha minus last char>_<key>f' ... is missing`) plus `history file ... maps to no manifest entry` for the dotless, subfolder and dotted-directory copies. GREEN after: zero C-12.2; removing any one copy names exactly its own path (read through `localize`). The expected.json fixtures (extension-bearing names) are unchanged and still identical.

**(a2) parity test** is ratification's (RATIFICATION #33, its J13), per B7; I added nothing outside my paths. Before B7 I verified the same test against my branch: red without the fix, green with it.

**Platform check:** N for the logic; P at the re-walk (BOB's).

**Tests and checks.** `node --test test/m/record-grammar/`: 104 pass, 0 fail. Users: ratification 304 pass, record-core 160 pass, control-plane 447 pass (0 fail each). format 0; architecture 0 (record-grammar 0); coverage record-grammar 61 of 61 (the whole-tree failures are other modules'); words record-grammar 0 (whole tree unchanged: the 11 failures are other modules'); ownership 3 files, 0 failures.

**Requirement lines proposed (BOB writes them).** Under R40: "`checkHistoryCoherence` (C-12.2) finds a snapshot's copy at the path record-core's `snapPath` stores it: `_history/<dir><name>_<key><ext>`, the key before the last dot of the name after the last `/`, or at the end of a name with no dot; and maps a history file back to its manifest entry whether the key is followed by the extension's dot or ends the name."

**Census ops:** none. **Rows owed to UX-DESIGN:** none. **Deferred / found elsewhere:** none. `case-checker/program.mjs` embeds this code: BOB regenerates it.

Size (session_01W5LgYyUoKbwf29MJrEqkHm): test runs 14, module lines 2562
