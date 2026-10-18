# DIAG-085 r6: the r5 walk's defects D1-D9 and item (e), checked in code (`tranche/R085`, the deployed cut; a read-only worker in BOB #192)

Read against `walk-085-r5.md` and `diag-085-slow.md` (T49) and the format of `diag-085-r5.md` (R085). All file:line are on R085. No product file was changed. Where code alone cannot settle a cause, it says so.

## Summary table

| # | Defect | Module (modules.json) | Requirement broken | Fix | Severity | Explains "no answer"? |
|---|---|---|---|---|---|---|
| D1 | upload id ends in a hyphen, cite refused | screens-intake | none states the id rule (R21 only says "under an id `allocid` mints") | 1 line | blocks (that file) | no |
| D2 | untyped upload stored unread | capture | none: capture R92 and control-plane R100 specify "without `type`, R86 unchanged" | about 8 lines | misleads (blocks for `.md`/`.csv`) | no |
| D3 | passage snippets are 12 tokens | query-language, retrieval, agent-worker (agent-model) | none: query-language R12 sets 12 | 3 lines (A); about 30 (B) | blocks the answer | **yes, the direct cause** |
| D4 | meaning level said "0 rows", then "one leg" | query-language (probable) | none covers bare words under `rows=leg` | about 15 lines | misleads | contributes |
| D5 | false "found nothing supportable" proposal | agent-harness, agent-worker | none: nothing checks a LOOKED_ABSENT report against the rows | about 6 lines | misleads | no, it is a result of D3/D4 |
| D6 | log says "dropped before any write", never says when it was written | agent-worker | R101 is met as worded; wording is the problem | about 8 lines | cosmetic | no |
| D7 | 29.5 min, 98% of wallclock | see diag-085-slow | none | see that file | misleads, near-blocks | no |
| D8 | held text needs a vouch | not found in code | none | open | misleads | no |
| D9 | member shown group-setup wizards | wizard-scripts (screens-daily draws them) | wizard-scripts R11/R23 read "every viewer" | about 10 lines | misleads | no |
| (e) | raw ids in proposal text | agent-harness | agent-harness R13 covers only the question's id | 1 to 3 lines | misleads | no |

## D3. Passages reach the assistant cut off (the prime suspect, confirmed)

**Where it is cut.** A passage row from `op=meaningrows` carries no unit text, by design: `query.mjs:894` `row: ["capture_sha","extent_kind","extent","ref","seq","truncated","chain_kind"]`, with the comment at `query.mjs:889-893` ("`text` is NOT projected: the whole unit can be 128 KB ... `snippet` is what a list wants"). What it does carry is `snippet`, built at `query.mjs:2804` by SQLite FTS5 `snippet(capture_text_fts, 0, '[', ']', '...', ?)`. The `?` is the budget in **tokens**, `snip` at `query.mjs:2389-2390`: `max(4, min(64, snippetChars or 12))`. The default is 12 tokens, which is about one clause. "[Marlowe] Street crosswalk lights failed on 3..." is exactly that.

**Who sets the limit.** Nobody on this path. The 12 is the compiler's default (query-language R12: "snippet length 4-64 tokens, 12 by default"), reached because every caller above it drops the parameter:
- `op=meaningrows` (`retrieval/index.mjs:1787`) forwards `q`, `rows`, `viewer`, `limit`, `offset`, `ids`, but not `snippet` (`op=search` at `:1785` does forward it); `meaningRows` (`:841-865`) calls `#compile({q, viewer, ids, rows, rowLimit, rowOffset})` with no `snippetChars`.
- `agent-worker` `meaningRead` (`index.mjs:948`) sends `{q, rows, limit}` and `ids`.
- the sub-session's `meaningrows` tool (`agent-model/src/model.mjs:439-451`) has no `snippet` property.

**Nothing else reads the unit.** A sub-session's tools are `meaningrows`, `report` and `read_facts` (`model.mjs:439-470`; the contract's `scope` is the only plane tool). The op that does return whole units, `op=reading` (`extraction/index.mjs:947-985`, `text_units` with full `text`), is not in any sub-session's scope. So the assistant can never see more than 12 tokens around a hit. The three passes repeated the same read and got the same 12 tokens, which is why pass 3's targets still asked for "the full text of INFO-2026-0006 paragraph 2".

**Does it alone explain "no answer composed"?** It is the direct cause. The answer ("eighteen days", "21 September") is later in the same 443-byte unit; the model said "I did not read the full date" and reported partial. D4/D5 do not stop an answer, they add a wrong one.

**Owning module and requirement.** query-language (budget and bounds, R12), retrieval (the op, R15 area), agent-worker (R96, which forwards `ids` but nothing else), agent-model R20 (the tool). No requirement says what a sub-session must be able to read of a cited passage. Wording that would: *agent-worker: "A sub-session can read the words of a passage its read has found, at least the unit's first N characters (N stated), and a passage snippet reaches it at the longest length query-language R12 allows."*

**Minimal fix (A), 3 lines in 3 modules.** `retrieval/index.mjs:1787` add `snippetChars: q.get("snippet")` to the `meaningRows` input and `:857` pass it to `#compile`; `agent-worker` `meaningRead` send `snippet: 64`. 64 tokens is about 300 characters, and the walk's whole unit is under 100 tokens, so this very case would very probably have been read. Not a guarantee for a longer unit.
**Real fix (B), about 30 lines.** Give the sub-session a bounded `readunit` tool: `{id or capture_sha, extent}` returning the unit's text cut at a stated limit (say 2,000 characters), through `op=reading`'s `unitsOf` under the same viewer gate, with the cut stated in the answer. This is a policy-adjacent change (what the assistant may read per call) and so BOB's, not Bob's. Do A now, B in the same round if wanted.
**Severity:** blocks the journey (a check cannot answer from a document longer than a clause around the hit).

## D1. A file name can make an uncitable record id

`screens-intake/capture.mjs:57`: `title.toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"").slice(0,40)`. The trim of a trailing hyphen runs before the cut; the cut at 40 can land just after a hyphen (`...-20261016135054-`, the walk's case: 14 digits make 40 characters include the last hyphen). The id is then `${mid.id}-${slug}` (`:58`), which `cite` refuses as not canonical.
**Module/requirement:** screens-intake R21 (the promotion under an `allocid` id) and capture-grammar's id rule; no requirement states the slug rule. Wording: *"The slug of a promoted upload's id is at most 40 characters, begins and ends with a letter or digit, and is empty when the name holds none."*
**Fix:** 1 line, `.slice(0,40).replace(/-+$/,"")` (swap the order; drop the now-unneeded `^-|-$` trim only if the leading trim is kept). Add a test with a 41-character name.
**Severity:** blocks the journey for that file (captured, cannot be cited), and the member sees a raw id and a refusal. Not the cause of "no answer".

## D2. A file the browser types as "" is stored unread

`capture/index.mjs:699`: text is read only `if (typeof type === "string" && type !== "" && profilesAsText(type, total, multipart))`. `profilesAsText` (`acquisition/index.mjs:111-114`) accepts only `text/*`, `application/xml`, `json`, xhtml and `+xml`. The screen sends `type` only when the browser has one (`screens-intake/capture.mjs:281`). Anything else (empty type, which browsers give `.md` and sometimes `.csv`/`.txt` on some systems; or `application/vnd.ms-excel` for `.csv` on Windows) is profiled "as R86 does without it", i.e. not as text, so `acquisition/index.mjs:140` says "not read as text (non-textual or too large)" and the reading is "failed or undetermined".
**Module/requirement:** capture R92 and control-plane R100 both **specify** this ("Without `type`, R86 unchanged", "controls: the same upload with no `type` stands, its reading failed or undetermined"). So the code meets its requirement; the requirement is the gap. Wording to add to capture R92: *"When the declared type is empty or not a text type, the bytes are still read as text if the file name's extension is a text extension (`.txt`, `.md`, `.csv`) and the bytes are valid UTF-8 holding no NUL."*
**Fix:** about 8 lines at `capture/index.mjs:699` (an extension test on `name`, which `uploadCapture` already receives) plus the requirement edit. `.docx` etc. are a separate path (format-registry) and need none.
**Severity:** misleads (file looks captured, no words); blocks for the file kinds above. Not the cause of the walk's failure (INFO-0006 was typed).

## D4. The meaning level contradicted itself (probable cause; not provable from code alone)

The two statements are the sub-session model's own prose (`summary` in two reports); nothing in the code checks a report against the rows it saw, and the tool results are not logged, so the exact call that returned 0 rows is not on record. The most probable cause in code: the tool tells the model "Bare words in q match only the records' own text" (`model.mjs:440`). Under `rows=leg` (and every arm but passage) a bare word is a `text` atom that narrows the scope to bundles whose own text holds **every** word, then `ids` intersects (`query.mjs:2330-2393`, as r5 item 1 found for passage). A model that put "crosswalk lights repaired" in `q` with `rows=leg` gets 0 rows because the question's own text lacks "repaired"; a later pass sent `q=""` or one word and got the leg. query-language R31 (R085-21) fixed this **only for `rows=passage`** (`query.mjs:2262`).
**Module/requirement:** query-language R15/R31; no requirement covers bare words under the other arms. Wording: *"Under `rows=<arm>` with an arm other than `passage`, a query holding only bare words reads them as filters on that arm's own selectors or ignores them with the warning `bare words ignored (rows=<arm>); use text: for the record's own text`, and the rows of the bundles in scope are answered."*
**Fix:** about 15 lines in `query.mjs` beside R31, or 1 sentence in `model.mjs:440` telling the model to leave `q` empty for `rows=leg` and use `ids` (0 code risk, less reliable). To confirm before building: have the next walk's run keep the tool inputs (the harness's `trace` already carries them in test; not logged to `airunlog`).
**Severity:** misleads (it caused D5's false absence); contributes to no answer because the leg never got read.

## D5. A false absence proposal is written to the member

`emptyLevelCandidates` (`agent-harness/src/harness.mjs:431-499`) turns **any** report with `state === "LOOKED_ABSENT"` into a `level-empty-<level>` candidate, deterministically (the point of its header: a judged emitter would miss the very run it is for). `agent-worker` `compose` (`index.mjs:1168`) adds it to the candidates, `submit` writes it (`:1263-1281`). The only check is on the observation-log address (PL-3 `SUGGEST_EMPTY_LEVEL_UNSTATED`). Nothing compares the claim with the plane: at the same step `compose` already reads `meaningRead(call,{q: state.q, rows: MEANING_ARM, limit: 50})` (`:1160`) and counts rows only for a note (`:1196`). So the meaning-level absence, produced by D4, was written even though the question held a leg.
**Requirement:** none. Wording: *"A level-empty candidate is composed for a level only when the plane's own read of that level at compose time also holds no row for the run's target; otherwise it is not composed and the log says the report was contradicted."*
**Fix:** about 6 lines in `agent-worker` `compose`: skip a `meaning` empty when `read.result.rows` holds any row whose bundle is the target (the content empty needs the same against a `rows=passage` count). Module agent-worker (compose) with a function parameter in agent-harness if kept pure.
**Severity:** misleads (a wrong "found nothing supportable" stays on a question whose cited passage holds the answer). It is a consequence, not a cause, of "no answer".

## (e) Raw record ids in the proposal's member-facing text

`harness.mjs:495-498`: the description appends `The sub-session reported: ${r.summary.trim()}`. `summary` is the sub-session model's free prose (bound 500 characters), written from `read_facts` which holds raw ids, so it quotes "INQ-2026-0002" and "INFO-2026-0006-council-minutes". R13 (R085-23) fixed only the question's id the table itself embeds (`:494`), not this tail.
**Requirement:** agent-harness R13 covers the table's own words only. Wording: *"No record id appears in a candidate's description: the sub-session's summary is not appended, or its ids are replaced by 'this question' / 'a document'."*
**Fix:** 1 line (delete the appended summary; the report and its words stay in the run log, `log:n`), or 3 lines to replace `/\b(INQ|INFO|PROJ|RUN|CAP)-[A-Za-z0-9-]+/g`. The first is safer (also avoids a model's instruction-like text reaching a member).
**Severity:** misleads / cosmetic (a member sees a raw id; the text is otherwise truthful about what the sub-session said).

## D6. The log disagrees with the record

`dedup` (`agent-worker/src/index.mjs:1202-1258`) logs, for a candidate whose name `basisversions` already holds, "dropped before any write: 'level-empty-meaning' already held on the question" (`:1253`), exactly as agent-worker R101 words it. In this run the held version was the run's **own** pass-1 write: `submit` (`:1280`) writes it and sets only `out.note` ("wrote 'name'"), never a log entry, so `airunlog` has the drop (pass 3, log:13) with no record of the write. "Already held" reads as "someone else's" and "before any write" as "nothing was written". R101 is met as worded.
**Module/requirement:** agent-worker R101 (and R92, the log). Wording to add: *"A candidate a run writes has a log entry naming it, the pass and the version; a dedup drop says whether the held version belongs to this run."*
**Fix:** about 8 lines: on `submit` success add `logEntries` for the candidate's level (as R101 does for a drop), and in `dedup` word the detail with "(written by this run, pass N)" when the version's run equals the run (needs `basisversions` rows to carry `run`; check that first, else say "held on the question, by this run or an earlier one").
**Severity:** cosmetic (it misleads only a reader of the log). Also: the same absence candidate is regenerated every pass (the report repeats), so passes 2 and 3 add a drop each; D5's fix removes that.

## D7. 29.5 minutes, 98% of the wallclock, expiry passed

Fully covered by `diag-085-slow.md`: by design (serial conversations, 3 passes), not a fixed tick; `expires` is a ten-minute lease renewed by every tick, shown as if it were an end time. Owners per that file: agent-harness (stop rule), agent-runner (size), ai-runs and screens-inquiry (honest words). Not repeated here. One addition from this walk: passes 2 and 3 are wasted largely because of D3 (they re-asked for text they could not read), so fixing D3 shortens real runs more than any scheduling change. **Severity:** misleads; near-blocks with a bound under 30 minutes.

## D8. Held text needs a vouch first (not found in code)

I found no state gate in code: `viewerPredicate`/`inSight` (`membership/index.mjs:1089`) is project and role based, not on `collected`. The text index is written by extraction R19/R20 at the promotion that carries a document with a `reading` object, and the screen's promotion stores the reading the upload answer carries (`screens-intake/capture.mjs:297`, control-plane R100). The walk drove `captureupload` then `promote` by ops, so whether it passed the answer's `reading` is the first thing to check; the screen path should store it at promote with no vouch. I cannot tell from code whether a real screen walk reproduces D8. Next step is a screen walk (or a Chromium that trusts the egress CA, K3527) comparing `op=reading` for the sha before and after `release`. **Severity:** unknown; if real, misleads.

## D9. What a plain member is shown that they should not be (from code)

- **Home "What happened?" doors (shown).** `wizard-scripts` `startFrom` (`wizard-scripts/index.mjs:1380`) lists library scripts through `#offeredScripts` (`:766-779`), whose only test is `#canSee` (`:542-546`): for a Civicsmith or widened script, any viewer not `DENY`. It does not ask whether the viewer may perform the script's acts. So "Say who your group is" (act `groupdescriptionset`), "Invite a member" (`memberadd`, `membercaps`, `websitekeycreate`), "Update your group's Civicsmith" and "Connect your Claude account" are door buttons on a member's Home (`screens-daily/home.mjs:140-176`). wizard-scripts R11 says they are "reached by every member's session", so this is as specified; the specification is the gap. Wording: *"A script is offered to a viewer only when the viewer may take its first act; a script whose acts are an administrator's is offered to administrators only."* Fix: about 10 lines in `startFrom` / `#offeredScripts`, reading the act's capability from the registry.
- **Home administration and members areas (not shown).** `home.mjs:249-267` draws them only for `admin`.
- **Queue "update-ready" (not shown).** `QUEUE_SECTIONS` (`queue/index.mjs:74`) is a constant carried in the op's answer; the section is drawn only for an item of that kind (`screens-daily/queue.mjs:196-199`), and a member had none.
- **Roster with `invited_by` (op answers it; screen: `/app/members`).** `screens-settings/members.mjs:16, 46` draws acts for `administer` only but reads `memberlist` for any session; the control plane stamps `administer` only to hide `cover` (`control-plane/index.mjs:1598`). Whether a plain member can reach `/app/members` and see handles, roles and `invited_by` is membership's policy (not read in full) and needs a screen walk; if the roster is meant to be members-only-to-admins, that is a requirement decision for Bob.
- `bootstrap` (version, `claimed`) answering a member is not a screen.
