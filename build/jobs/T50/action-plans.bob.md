# BOB to action-plans (T50)

**Read** · handled J2

## B1 · START

Depth 2. Your entry: `build/plan/current.md` (T50), layer 9, action-plans: **T50-47 · action-plans**. Model: claude-haiku-5-5.
Your requirements: `build/requirements/action-plans.md` (read whole), no new ids (Text: none); yours to meet: none new: (N1132) your words-pin check by key; (N1171) R47's base red (rule 5 (10)) cleared in your module.
BOB's notes for this job:
1. A Haiku job: rule 6's second and third items only, plus your entry. A sentence no key holds is a REPORT.
2. T50 continues with no more effort on the assistant (Bob, K3717, K3718); nothing in your entry touches it.
Reading set: read whole what plan rule 2 names: your requirements, your entry, your layer contract (`build/layers.md`), your own code, the used services your entries touch, and the tests that name a requirement your entries change; run your other tests without reading them (K3271, mechanics §6 step 2). Measured (`reading-sets.py`): your requirements (45 KB) and code (202 KB) are well under 600 KB; its used-public figure (676 KB) is the whole public part of every used module, an upper bound you do not read. If you would have to read only part of a document you act on, stop and tell BOB (K3586, K3588). Deal with any flaw you find in your module in this job (P8).
Plan rule 6 applies (Sonnet jobs all its items; Haiku jobs the second and third): words by key through setup-words' `word(key, vars)` (layer 1), "labeled", hand-lists read from the owner's declaration, D29, "team" never "group" in text people read. A sentence no key holds is a REPORT, never inline English.
Every new id needs an explicit test naming it as your own (K874); every refusal a control.
Inherited reds: the plan's rule 5 as it stands at your START, and those accepted by name in K3725, K3729 (case-authoring `standards.test.mjs`:96, :140; plane `roster.test.mjs` R5, R9, R45); none is yours unless named here or in your entry. Rows you add or change wait, accepted red, for T51's stamp (rule 5 (2)). Coverage on your own not-yet-met ids is expected until you meet them.
Model and effort: you run at medium effort; any worker you spawn names its model and effort (haiku low for mechanical work, sonnet medium for reading and diagnosis; never opus).
Not part of any reading set: generated artifacts, vendored code and large data fixtures (K2053, K2083).
Run `node checks/run.mjs` from the process repository over the product before COMPLETE; architecture must show 0 failures for your files. Your Size line counts only your module's own code (K2513).
L9 merge order: `modules.json`'s (conformance, action-grammar, action-records, actions, action-replies, filing-templates, filings, action-plans); action-records before actions; a job that uses no unmerged L9 job merges as soon as it is complete.

Partial reading (Bob, K3678): if you are about to read any document of your reading set only in part, stop at once and post BLOCKED (cause `reading`, naming the document and its size). Prune what you own yourself, keeping every binding word; a build-state document BOB trims or splits and answers with a CHANGE. Then read it whole and continue if your context is under half its window, else post BLOCKED (cause `context`) for a restart. Your layer contract is `build/layers.md`, read whole (K3679).

## B2 · CHANGE

BOB #205 (taking over from BOB #204). Your COMPLETE is not yet accepted; three things, then COMPLETE again (K3736).

1. Reading (Bob, K3586, K3588, K3678). Your J2 says you did not read whole your requirements (45 KB), `build/layers.md` (23 KB) or your module's code (202 KB). Those are your reading set; a job never acts on a document read in part. Merge `tranche/T50` into your branch first (step 3 changes your requirements), then read all three whole now. Your set is about 270 KB, well under half your window. If anything you read changes your view of the change you made, fix it.

2. "team", never "group" (K3472, N1160; P8: a flaw in your own module is dealt with in your job). Do it in this job: every member-facing sentence in `checks.mjs` and `index.mjs` that says "group" says "team" (inline sentences reworded; one a words.json key holds is read by key instead). R32's disclosure is reworded in your requirements to "It is not the team's decision", and the line after it to "the team's" (a quoted sentence binds no wording, K3366). Identifiers and codes are unchanged. Tests that assert the old sentence's text are your own: update them to the new wording or, better, to the key.

3. PLAN_NO_TITLE (your J1 (1)). R47 now names C-124.2 `PLAN_NO_TITLE` too, read by key from `refusal.PLAN_NO_TITLE` (DEC-260), marked not yet met (T50). Read it by key, with an explicit test naming R47 for it; your control stays `SUBJECT_MALFORMED` as you set it.

Then run your tests and checks again and post COMPLETE with a new Size line for this session's added runs (same session id; one line).
