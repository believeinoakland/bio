# Review protocol, phase 3 of the second study (BOB #112, 2026-10-05; adapted from BOB #110's)

You review two studies (`studies/<NAME>.md`) adversarially, before the synthesis joins them for Bob. Find what is wrong, missing or unworkable. Do not edit the studies; write your findings. Bob requires full knowledge, never a scan (K1459).

## Read first, whole (READING-PROTOCOL.md's method: consecutive chunks, no scanning)
`constructs-brief.md`, `ANALYSIS-PROTOCOL.md`, then each of your two studies, and their working notes `studies/<NAME>.md.work` if present.

## Check
1. **Every factual claim about the product** ("built", "not built", "reachable", "no op", "layer n", "R-id says …", "DEC-n rules …"): open the cited source (src/, src/req/, notes/, ../ for the first study, or the code under /home/user/bio, read-only) and confirm it. Check ALL claims a recommendation rests on, and a sample of at least ten others.
2. **Every external claim a recommendation rests on** (a standard, an API, a cost, a legal limit): open its URL or search again. Note anything outdated, misread or unsourced.
3. **Doctrine:** does any proposal break a rule in the brief (the machine never concludes; labelled drafts; grades and undetermined; four-level absence; relations; cause, DEC-77 (10); jurisdiction-free product; total order; module size)? Cite the rule's actual home. Does it respect Bob's rulings K1432, K1452, K1455, K1457, and the first study's rulings K1438–K1451?
4. **Feasibility:** does it fit the runtime (Workers and Durable Objects, request limits, one alarm, the AI credential)? Is stage 1 concrete enough to plan from?
5. **Omissions:** a need in the digest the study ignores; an interface it misses; an existing module, or a first-study module, that already does part of the job; a real-world standard or source it should have used.
6. **Fit with the first study:** does it duplicate, contradict or silently change something the first study or the capability ladders settled? Does it rely on BOB #112's provisional §5A–§5C as evidence (it must not)?
7. **P17:** are the "decisions for Bob" truly his (policy and doctrine, requirements' meaning, UX; layers and modules are delegated to BOB, K1437)?

## Write `reviews/R-<n>.md`
Per study: `## <NAME>` then `### Errors` (claim → what the source says → correction, each cited), `### Omissions`, `### Doctrine`, `### Feasibility`, `### Fit with the first study`, `### P17`, `### Kept`. End with `## Verdict`: for each study, sound / sound with the corrections listed / unsound (and why), and the three corrections that matter most.

**Checkpoint:** save the file after each study's section; if it exists when you start, you are resuming: keep it and continue.
Read-only: never edit, commit or push in /home/user/bio or /home/user/civicos-process. Return a 15-line summary. If your file write is refused, return the full text instead.
