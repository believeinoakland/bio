# DIAG-085 round 4: why the check run's sub-sessions could not see the question's document

Read-only. Code: `tranche/R085` @ 35e2ef2df4 (/home/user/bio). Live: biosmoke8, signed in as administrator (op=login), reads only:
`airun`, `airunlog`, `airunspawn`, `meaningrows`, `search`, `versionchain`, `contentaxis`, `image`, `basisversions`, `queue`, `agentpack`.
Nothing was written. The session token is kept only in the scratchpad file `tok` (mode 600) and was never printed.

## What the run did (live)

RUN-56442ec609fca066: mode check, 37 ticks, 3 passes, `completed`. `session.cost`: 89 calls, 1,768,601 tokens, **$1.49**
(K3498's ~124 calls/$3.0 was an estimate from the account total). Budget: wallclock allowed 1,800,000 ms, consumed **0**;
subsessions allowed 0, consumed 12.
The run log holds 12 entries: sub-session reports, segment ends, compose and the close. **It does not record the tool
calls the sub-sessions made.** Their queries below are inferred from the report text and reproduced live.

| pass | level | report (log seq) | live reproduction of the matching read |
|---|---|---|---|
| 1 | meaning | "leg arm, q 'pothole reports closed': 0 rows, no documents in scope", LOOKED_ABSENT (1) | at the time, the question's text had "close" and never "closed" (checked in its 01:05 `_history` snapshot), so the scope was empty |
| 1 | document | "used passage arm, q 'pothole reports closed'… zero documents in scope", LOOKED_ABSENT (2) | same scope, now empty |
| 2 | content | "2 documents in scope, 0 captures counted… nobody extracted text" (5) | `rows=content&q=pothole` gives a scope of 2 documents, INQ-0001 and PROJ-5304; neither holds a capture |
| 2 | document | `rows=document` refused MEANING_ROWS_UNKNOWN_ARM (6) | same refusal, live |
| 3 | content | "content arm… 1 document in scope, no content rows" (8) | `rows=content&q=pothole reports closed` gives a scope of 1 document (INQ-0001) |
| 3 | document | "1 document in scope, no captures, no extracted text; passage query 0 rows" (9) | `rows=passage&q=pothole reports closed` gives a scope of 1 document (INQ-0001) with 0 captures |

The two LOOKED_ABSENT reports from pass 1 became the two `level-empty` proposals, written into the question at 02:48:33
(`basisversions`). The reads that do reach the document work, live:
- `rows=passage&q=passage:pothole`: 1 row, INFO-2026-0003 ¶1, with a snippet.
- `rows=passage&q=id:INFO-2026-0003-rewalk-sample-txt`: 1 unit.
- `rows=leg&q=`: the question's one leg, which targets INFO-0003 ¶1.

## Root causes (primary)

**C1. The sub-session's only tool is `meaningrows`, and nothing tells it how to reach a document's text. (Gap: agent-model, agent-harness.)**
- `agent-harness/src/subsession.mjs:187` sets `SUBSESSION_OPS = ["meaningrows"]`, and `:281` sets the contract's `scope` to that list. agent-worker R17 requires this.
- `agent-model/src/model.mjs:403-409`: the system prompt says only "Search with the meaningrows tool".
- `model.mjs:428-432`: the tool schema is `{q, rows ("the meaning arm, e.g. leg"), limit}`. It does not list the five arms (leg, resolves, concerns, content, passage). It does not say that bare words search only the records' own text (title, body and frontmatter in `bundles_fts`, `retrieval/schema.mjs:71-72`, tokenizer unicode61, no stemming, implicit AND). It does not say that a document's words are reached only by `passage:` (retrieval R15, deliberate) or that `id:` scopes the read to one document.
- The live pack (`agentpack`, investigative-session@1+7b40…) also never mentions `meaningrows`, `rows=` or `passage:`.
- The model therefore guessed: bare words, and in one pass `rows=document`.
- No requirement says what a sub-session must be told about the read's grammar. agent-model R17 covers only the `report` tool's bounds.

**C2. The bare-word scope selects records whose own text matches, never the document; the counts moved because the run rewrote the question. (Bug-shaped consequence of C1; retrieval behaves as specified.)**
- In `meaningRows` (`retrieval/index.mjs:830-905`) and `query.mjs:2625-2631` (`levels`) / `:2660ff` (`axis`), the documents "in scope" are those that the query's other arms (the bare words) select, out of record text. INFO-0003's record text ("rewalk-sample.txt") has none of the words, so it was never in scope.
- The pass-to-pass changes come from three things:
  - The model chose a different `q` in each pass.
  - unicode61 does no stemming: "closed" did not match the title's "close".
  - **Pass 1's own proposals put the words "pothole reports closed" into the question's bundle.md** (seen in the live `image`). From then on the same `q` found 1 document, the question itself, which holds no captures.
- So "1 document, no captures" in pass 3 is the question, not INFO-0003.

**C3. The spawn contract carries no subject: not the question's legs, not its cited or filed documents, and not the coordinator's plan `targets`. (Gap: ai-runs R23, agent-harness R7 / agent-worker R17.)**
- `spawnContract` (`subsession.mjs:227-300`, keys at `:221`) holds only `level, run, context, mode, skill, standard_pair, standard, scope, returns`.
- `airunspawn` (ai-runs R23) carries only the context, mode, skill, bar and budget. This was checked live: the payload has no basis.
- The coordinator's pass-3 targets ("INFO-2026-0003…: look at it directly by its identifier") never reach a sub-session. `state.targets` is read only for internet fetches (`agent-worker/src/index.mjs:1003`). `runSubsessions` (`:1438-1466`) briefs each level from the contract alone.
- The tool call passes only `{q, rows, limit}` (`index.mjs:1463`). `ids` is dropped, although `meaningRead` (`:927-929`) and the plane both accept it.

**C4. No document-level read exists. (Gap: retrieval, agent-harness.)**
- `MEANING` (`query.mjs:458ff`) has no `document` arm. `retrieval/index.mjs:854` refuses `MEANING_ROWS_UNKNOWN_ARM`, which is correct as specified (C-23.2).
- The `document` level ("documents the store holds") has no read in the sub-session's scope. `search` (bundle grain), `frontier level=document` and `versionchain` are all outside it.

**C5. The coverage tally says the read document "holds nothing indexable". (Bug: observation-log R7.)**
- `observation-log/index.mjs:57`: `CAPTURE_TEXT_UNIT_CONTAINERS` lacks `text` (and `html`).
- At `:348-355`, therefore, a capture read as text gets a `derive` row LOOKED_INDETERMINATE, "a text has no indexing unit arm".
- But reading-pipeline R32 (`reading-pipeline/index.mjs:862ff`) does write `doc-para` units for it. INFO-0003 ¶1 is indexed and found by `passage:`.
- Live `contentaxis` for capture ea1a5a20… reports `indexed_none`. So every `rows=passage` answer says "0 can be searched… 1 hold nothing indexable" while returning the passage, which feeds the "nobody extracted their text" readings.
- R7 says PRESENT "when every unit was stored".

**C6. The parent's holdings count the cited document as zero. (Gap: agent-harness R5 / agent-worker collect.)**
- The report contract's citation is an `address` with no defined form. The sub-session cited "INFO-2026-0003-rewalk-sample-txt ¶1".
- collect (`index.mjs:1086-1098`) looks that up as `id:"…¶1"`, which finds no bundle, then reads `versionchain("INFO… ¶1")`, which returns 0.
- The result is `holdings.documents: 0` and "the record holds no captured version at this address", although `versionchain("upload:ea1a…")` holds it (live).

### Minimal fixes, by owning module

| module | requirement (new or amended) |
|---|---|
| agent-model (new R, extends R17) | The sub-session's `meaningrows` tool describes each arm and its grain (from the plane's `searchfields.meaning`, or a constant pinned to it) and the query forms: bare words search the records' own text only; `passage:<words>` searches what documents say; `id:<record>` scopes to one record. The tool takes `ids`. Test: the tool description names every arm and `passage:`. |
| agent-harness R7, R5 (amend) | (a) The contract carries `subjects`: the question's leg targets and the documents filed for it, as read from the plane, plus the coordinator's `targets` for that level. (b) A citation `address` is a record id, optionally followed by " ¶n" / an extent ref, or a source locator. collect strips the extent before resolving it. |
| ai-runs R23 (amend) | The search half carries the context question's basis, meaning its leg targets with extents and its held/filed captures (ids only), so the brief names what to look at. |
| agent-worker (amend R17 / runSubsessions) | Pass `ids` and the level's `targets` into the sub-session, and forward `ids` from the tool call. |
| agent-harness (new) / retrieval | The document level gets a read in the sub-session's scope. Either `search` (bundle grain) is added to `SUBSESSION_OPS`, or a `rows=document` arm is added in query-language with a retrieval R (one row per document in scope: id, title, captures, coverage). The first is smaller. |
| observation-log R7 (bug) | Arm the index row from the units actually stored (`indexed.written > 0`), or add `text`/`html` to the set to match reading-pipeline R32. Test: an uploaded .txt has its derive row PRESENT. |
| optional | Stop the run's own level-empty proposals feeding later passes' scope. A level-empty from a read whose `says` is "empty DOCUMENT level, not an empty record" (documents 0) should be refused as a false absence (run-rules / agent-harness emptyLevelCandidates). |

## Secondary

**(F4) Find snippets. (Gap: query-language R14 / retrieval R6 and screens-daily.)**
- The bundle-grain page computes its snippet only from `bundles_fts` with column -1 (best column) (`bio-plane/src/query.mjs:2428-2429`).
- So a hit reached only through `passage:` (INFO-0003) gets `snippet: null`. This was checked live.
- The question's and project's hits get the flattened frontmatter ("id … object_type inquiry schema …") or the Session Log, also live.
- `screens-daily/finder.mjs:61-62` draws the snippet raw.
- Fix: retrieval/query-language. A hit matched by `passage:` carries the best-matching unit's snippet and `ref`, and the bundle snippet is cut from `title`/`body` only, never `meta`. screens-daily: a question's or project's row shows its title, kind and state in words.

**(b) Queue item "A document with no title … A capture finished". (Gap, too-broad requirement: machinery-producers R2, plus screens-daily.)**
- `#conditionsCaptureUnattended` (`machinery-producers/index.mjs:509-547`) fires for any bundle whose latest manifest entry is machine-authored and whose earlier one is a person's.
- The run's `suggest` promoted level-empty versions into INQ-0001 as `token:ai`. The live item is `CONDITION::capture-completed-unattended::INQ-2026-0001…`.
- The item has no `subject.title`, so `screens-daily/item-words.mjs:41-47` falls back to `queue.source.untitled`.
- Fix: R2 limits the kind to captured documents (information/source bundles with a register row), excluding an assistant's proposals on a question. The item also carries `subject.title`.

**(F6c) "Opened by The group's founder". (Bug: screens-inquiry R40.)**
- `screens-inquiry/question.mjs:70-78` takes the first promotion's `author` ("admin").
- `screens-inquiry/common.mjs:83-84` maps the string "admin" to `member.founder.unnamed` with no handle lookup. R40's control says "with a handle, the handle".
- Fix: resolve the root administrator to the founder's handle, from a read that answers `{member, handle}` (e.g. `projectparticipants` or whoami), before the unnamed word.

**(d) No per-run cost shown. (Gap: screens-inquiry.)**
- `op=airun` already answers `session.cost` (ai-runs R76: calls, tokens, usd; here $1.49), to the paying account's owners.
- No screen reads it: the dock `screens-inquiry/assistant.mjs:157-188` draws only status and productions.
- Fix: new screens-inquiry R. The dock and the question page show a finished run's cost, and a running run's cost so far, from `airun`'s `cost`.

**(e) Wallclock reads 0. (Gap: unmetered.)**
- Each tick's consumption is `{subsessions, fetches, runtime}` only (`agent-worker/src/index.mjs:637, 984, 1027`). Nothing adds elapsed time.
- ai-runs Terms define the bound ("wall time across resumptions, ms") and agent-harness R3 stops on it, but no requirement says who meters it. The 30-minute allowance is therefore never enforced.
- Fix: agent-worker new R. Each tick's `consume` carries `wallclock`, the segment's elapsed ms since its last tick.

**(f) Model and effort per call. (Small bug plus gap.)**
- ai-runs R72's tick `usage` entries already carry `{mode, model, usage, calls}`, so the place exists.
- But `agent-worker/src/index.mjs:1548` records `model: MODEL_FOR_MODE[mode]`, which is Opus for every conversation, while sub-sessions actually run Sonnet at effort `low` (`agent-model/src/model.mjs:199-201`, R19).
- The cost itself is right, because `priced()` uses the real model.
- Fix:
  - agent-model R19: `converse` returns `{model, effort}`.
  - agent-worker R26: pass both.
  - ai-runs R72/R19: store them and answer them per conversation in the run log, or in `session.cost.by_model`.

**Also seen.** `standard.basis` reads "context-has-no-project" for a question inside PROJ-2026-5304. In `ai-runs/index.mjs:2534-2535`, an inquiry context is never checked for its project. This is a bug against DEC-17's wording: the answer should be `none-recorded`, and the stated sentence is false.
