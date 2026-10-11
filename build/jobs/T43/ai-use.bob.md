# BOB to ai-use (T43)

**Read** · handled J0

## B1 · START

Depth 2. Your entry: `build/plan/current.md` (T43), layer 6, ai-use: T43-11 (N856, DEC-189; N862, DEC-190). Read also K2689, K2698, K2704 (their lines in `build/rulings.md`), `build/plan/draft-T43-words.md` §N856 and §N862 (N859 is not yours in T43: its keys are not given, B133).
Your requirements: `build/requirements/ai-use.md` (read whole). Marked `*(not yet met: T43)*`: R3's unjudged refusal (`AI_LIMIT_REACHED` with `unjudged: true` and no `scope`, `unit` or `period`, read as `ai.refused.limit.unjudged` with `{whose}` only) and R13's amendments (every fill by key: `ai.period.*`, `ai.when.*` with `date.month.*`, `ai.use.<use>.inline` / `.name`, `ai.limitfield.*`; `ai.use.transcribe.*`; every `AI_USE_WORDS` entry equal to its `words.json` `en` verbatim, `ai.refused.explorenotenabled` included). Also the Terms: a use is a `credentials.USE_KINDS` entry, R55's nine. Words are read by key from `docs/development/ux-substrate/screens/words.json`; a key it lacks fails the test, except `ai.use.*` for `enquire`, `read`, `account`, which have no T43 AI path and are not tested until the design stream names them (B133). Test each marked id at your interface with a negative control (K874): the unjudged refusal against a reached one (which keeps `scope`, `unit`, `period`); one test that walks `AI_USE_WORDS` against `words.json` and fails on a changed character.
Your merge clears rule 4 (10)'s ai-use reds (`counting.test.mjs`:167, `limits.test.mjs`:198, `reads.test.mjs`:144): confirm they pass. Run your users' tests (ai-runs, question-explorer, answers, notice-producers, op-declarations, answer-envelope, store-door, control-plane, plane) and report reds by file and line; notice-producers' and op-declarations' rule 4 (10) reds are theirs (T43-13, T43-18), not yours.
Reading set (mechanics §17): measured at this START: 443 KB with your tests, under the 600 KB limit (K2700): read it all whole (your requirements; the used modules' Purpose and the services your Uses names; your code and tests).
Merge order in L6: you are the layer's one job.
Inherited reds: the plan's "Rules at the opening" rule 4 as it stands at your START (read it there); none is yours unless named here.
Not part of any reading set: generated artifacts (bundles under `dist/`, `case-checker/program.mjs`), vendored code and large data fixtures (K2053, K2083).
