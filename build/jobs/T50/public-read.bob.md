# BOB to public-read (T50)

**Read** · handled J1

## B1 · START

Depth 2. Your entry: `build/plan/current.md` (T50), layer 8, public-read: **T50-71 · public-read**. Model: claude-sonnet-5-5.
Your requirements: `build/requirements/public-read.md` (read whole), folded by K3635 and K3698; yours to meet: R36 (`groupFields({project})` answers `matter_stake`), R37 (`corrections {count, last}`, `undetermined` when the docket cannot be read).
BOB's notes for this job:
1. R37 counts later `edition`, `withdrawal` and `court-order` entries (K3698's reading, BOB's).
2. T50 continues with no more effort on the assistant (Bob, K3717, K3718); nothing in your entry touches it.
Reading set: read whole what plan rule 2 names: your requirements, your entry, your layer contract (`build/layers.md`), your own code, the used services your entries touch, and the tests that name a requirement your entries change; run your other tests without reading them (K3271, mechanics §6 step 2). Measured (`reading-sets.py`): your requirements (38 KB) and code (257 KB) are well under 600 KB; its used-public figure (296 KB) is the whole public part of every used module, an upper bound you do not read. If you would have to read only part of a document you act on, stop and tell BOB (K3586, K3588). Deal with any flaw you find in your module in this job (P8).
Plan rule 6 applies (Sonnet jobs all its items; Haiku jobs the second and third): words by key through setup-words' `word(key, vars)` (layer 1), "labeled", hand-lists read from the owner's declaration, D29, "team" never "group" in text people read. A sentence no key holds is a REPORT, never inline English.
Every new id needs an explicit test naming it as your own (K874); every refusal a control.
Inherited reds: the plan's rule 5 as it stands at your START; none is yours unless named here or in your entry. Rows you add or change wait, accepted red, for T51's stamp (rule 5 (2)). Coverage on your own not-yet-met ids is expected until you meet them.
Model and effort: you run at medium effort; any worker you spawn names its model and effort (haiku low for mechanical work, sonnet medium for reading and diagnosis; never opus).
Not part of any reading set: generated artifacts, vendored code and large data fixtures (K2053, K2083).
Run `node checks/run.mjs` from the process repository over the product before COMPLETE; architecture must show 0 failures for your files. Your Size line counts only your module's own code (K2513).
L8 merge order: `modules.json`'s (publish-schedule, public-read, ratification, case-checker, case-import, case-account, review); a job that uses no unmerged L8 job merges as soon as it is complete.

Partial reading (Bob, K3678): if you are about to read any document of your reading set only in part, stop at once and post BLOCKED (cause `reading`, naming the document and its size). Prune what you own yourself, keeping every binding word; a build-state document BOB trims or splits and answers with a CHANGE. Then read it whole and continue if your context is under half its window, else post BLOCKED (cause `context`) for a restart. Your layer contract is `build/layers.md`, read whole (K3679).

## B2 · ANSWER · re J1

K3725: your alternative, with R37 reworded to match (merge tranche/T50 to read it). The publishedcase op's answer (R21) carries corrections, awaiting docket's public read (docketPublic, captures omitted) in publicReadOps; the synchronous publishedCase method does not carry it and keeps its callers unchanged. docket is unchanged (no T50 job). Everything else in R37 stands: count and last by (date, seq), undetermined: true when the docket cannot be read or throws, never count 0; the same bytes for every caller. Its test drives the op.
