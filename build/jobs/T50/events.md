# events (T50)

**Status** · session_011JmqU2tKmUjBgCV3phKJBQ · depth 2 · WORKING · handled B1

## J1 · QUESTION

Work is done and green in my module (events tests 81 pass, coverage 53 of 53, format and ownership 0 failures). Architecture shows 10 failures, all one cause: `build/modules.json` does not list `setup-words` in events' `uses` on `tranche/T50` (your START says it was added, K3632; it was not). Plan rule 6 has me read words through `setup-words`' `word()`, so events' source and tests now import it. modules.json is not mine to write.

Needed from BOB: add `"setup-words"` to events' `uses` in `build/modules.json` on `tranche/T50`, and its Private "Uses" line in `build/requirements/events.md` (setup-words: `word(key, vars)`). I will merge `tranche/T50` and re-run the checks. Until then I continue with the record.

Also for BOB (other modules, reported again in my record): (1) escalation `structure.test.mjs` lines 270 and 275 compare the real timeline's lane labels to "what we did"/"what they did"; the labels are now the words list's `screen.timeline.lane.ours`/`.world` ("What we did", "What they did"), so that test must read the key (escalation's own T50 job). (2) op-declarations: the `timeline` op needs the `captures` parameter declared (comma list in the url, or `captures` in the body for a long list, R53 allows 200 shas).
