# events (T50)

**Status** · session_011JmqU2tKmUjBgCV3phKJBQ · depth 2 · COMPLETE · handled B2

## J1 · QUESTION

Work is done and green in my module (events tests 81 pass, coverage 53 of 53, format and ownership 0 failures). Architecture shows 10 failures, all one cause: `build/modules.json` does not list `setup-words` in events' `uses` on `tranche/T50` (your START says it was added, K3632; it was not). Plan rule 6 has me read words through `setup-words`' `word()`, so events' source and tests now import it. modules.json is not mine to write.

Needed from BOB: add `"setup-words"` to events' `uses` in `build/modules.json` on `tranche/T50`, and its Private "Uses" line in `build/requirements/events.md` (setup-words: `word(key, vars)`). I will merge `tranche/T50` and re-run the checks. Until then I continue with the record.

Also for BOB (other modules, reported again in my record): (1) escalation `structure.test.mjs` lines 270 and 275 compare the real timeline's lane labels to "what we did"/"what they did"; the labels are now the words list's `screen.timeline.lane.ours`/`.world` ("What we did", "What they did"), so that test must read the key (escalation's own T50 job). (2) op-declarations: the `timeline` op needs the `captures` parameter declared (comma list in the url, or `captures` in the body for a long list, R53 allows 200 shas).

## Completion

**Entries applied.** T50-60 (N1193; R53): `timeline` takes `captures` (sha256s, at most 200, `TOO_MANY_CAPTURES` after `AUDIENCE_UNKNOWN`); `NO_SET` only when both `set` and `captures` are empty; with `captures` and no `lanes` the answer gains `dated` = `{items, placed_nowhere, limit, truncated}`, each item a dated fact as `datedFactsFor` answers it plus `when` and `order` (R29's undetermined bands); sight R40 (hidden and unheld captures contribute alike); omitted under `audience: "public"` even when `lanes` names it. A set of no entity or event asks no registered source (a source reading an empty set might read it as everything). The op reads `captures` from the url or the body. Plan rule 6: member-facing sentences read through `setup-words`' `word(key, vars)` (59 keys, the `events` entry of `words-reads.json`); the timeline's lane labels are `screen.timeline.lane.world`/`.ours` ("What they did", "What we did").

**Deferred / not keyed (no key holds the sentence; REPORT to the design lane).** "stated reason: " (discretion, waiver), "found unmet: " (assessment), "conditions: ", "expires " (waiver), the waiver outcome words ("granted", "denied", "partly granted", "decided"), `OUTCOME_WORDS`, whoWasSent's "sent by"/"sent to"/"copied"/"present", the owner's role and link words other than the seven keyed (actor "acted in", "organised" ...), `grade_why` ("placed nowhere: no attestation you can see dates this event, so none governs its time"; "its time could not be read (cache stale), ..."), the relation source "the document <sha>…", `TOO_MANY_CAPTURES` and the other refusal `detail`s (unkeyed by DEC-258 (3)). `words-reads.json`' `events` entry is generated; BOB regenerates it.

**Found in other modules.** (1) escalation `structure.test.mjs` 270 and 275 compare the real lane labels to lower-case English; they must read the keys. (2) op-declarations: declare the `captures` parameter of op=timeline (url comma list; body `captures` for a long list). (3) screens-investigate (T50-33) reads `timeline.dated.title`/`.tip` itself: `dated` carries no label, as R53 states its shape. (4) Inherited reds seen, not mine: filings R51/R52, escalation R31/R33 (rule 5).

**Tests and checks.** events tests: 81 pass, 0 fail (6 new, `timelinedated.test.mjs`); dependents run: explore 48, docket 79, lines 34, case-authoring timeline + actions t45 37, all pass. format 0 failures; coverage 53 of 53 live ids named; ownership 0 failures; architecture 0 failures after B2 (setup-words in uses; merged tranche/T50); `checks/run.mjs`: events shows no failure (the 30 coverage failures are other modules' not-yet-met ids).

Size (session_011JmqU2tKmUjBgCV3phKJBQ): test runs 9, module lines 2727

## J2 · COMPLETE

R53 met; words keyed (rule 6). events tests 81 pass; architecture, format, coverage (53 of 53), ownership 0 failures after B2's merge. Record: build/jobs/T50/events.md. Other-module findings as placed in B2.
