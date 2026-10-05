# Review protocol, phase 3 (BOB #110, 2026-10-05)

You review two construct studies (`studies/<CONSTRUCT>.md`) adversarially, before BOB joins the six into one architecture for Bob. Your job is to find what is wrong, missing or unworkable. Do not edit the studies; write your findings.

## Read first, whole (READING-PROTOCOL.md's method: consecutive chunks, no scanning)
`constructs-brief.md` (including its corrections), `ANALYSIS-PROTOCOL.md`, then each of your two studies, and their working notes `studies/<CONSTRUCT>.md.work` if present.

## Check
1. **Every factual claim about the product** ("built", "not built", "reachable", "no op", "layer n", "R-id says …", "DEC-n rules …"): open the cited source (src/, src/req/, notes/, or the code under /home/user/bio, read-only) and confirm it. Check ALL claims a recommendation rests on, and a sample of at least ten others.
2. **Every external claim a recommendation rests on** (a standard, an API, a cost, a legal limit): open its URL or search again. Note anything outdated, misread or unsourced.
3. **Doctrine:** does any proposal break a rule (the machine never concludes; labelled drafts; grades and undetermined; private individuals; relations; jurisdiction-free product; total order; module size)? Cite the rule's actual home (the brief's corrections say where some live).
4. **Feasibility:** does it fit the runtime (Cloudflare Workers and Durable Objects, request limits, no cron beyond the one alarm, the AI credential situation)? Is stage 1 concrete enough to plan from: named modules, requirements, what it unlocks?
5. **Omissions:** a need in the digest (`digest/<CONSTRUCT>.md`) the study ignores; an interface with another construct it misses; an existing module that already does part of the job.
6. **P17:** are the "decisions for Bob" truly his (policy and doctrine, requirements' meaning, layers and product modules, UX)? Is anything put to him that is BOB's, or decided silently that is his?

## Write `reviews/R-<n>.md`
Per study: `## <CONSTRUCT>` then `### Errors` (claim → what the source says → correction, each cited), `### Omissions`, `### Doctrine`, `### Feasibility`, `### P17`, `### Kept` (what is sound and should stand). End with `## Verdict`: for each study, sound / sound with the corrections listed / unsound (and why), and the three corrections that matter most.

**Checkpoint:** save the file after each study's section; if it exists when you start, you are resuming: keep it and continue.
Read-only: never edit, commit or push in /home/user/bio or /home/user/civicos-process. Return a 15-line summary.
