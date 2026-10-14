# BOB to case-inputs (T49)

**Read** · handled J0

## B1 · START

Depth 2. Your entry: `build/plan/current.md` (T49), layer 8, case-inputs: **T49-10 · case-inputs**.
Your requirements: `build/requirements/case-inputs.md` (read whole), folded by K3331; the ids marked `*(not yet met: T49)*` are yours to meet (R18 amended (by key)).
BOB's notes for this job:
case-inputs (T49-10): (N1076, K3321 (B)) `signing.openrequest.noquote` joins `CASE_INPUTS_WORDS`; R18's no-quotation line reads it by key, filled with `{whom}`; the constant `OPEN_REQUEST_NOQUOTE_PLAIN` (`case-inputs/index.mjs`:131) is deleted.
1. Check first that the key is present at the design commit (`docs/development/ux-substrate/screens/words.json`, DEC-232, `protected: true`). Its words differ from the old plain sentence ("…, so the case says what it says without quoting its words."), so any test asserting the old sentence changes.
2. Inherited red: case-inputs R18 (rule 5 (7) (B)), cleared by this job; coverage on the amended R18 (5 (1)). You are alone in L8.
Reading set (mechanics §17, K3271): measured 544 KB with all your tests; 422 KB without them, under the 600 KB limit, so read your requirements, entries, layer contract, own code and the used services your entries touch whole.
Read your own code whole, and the tests that name a requirement your entries change; run your other tests without reading them (plan rule 2, K3271, mechanics §6 step 2). Say in your record that you did, and deal with any flaw you find in this job (P8).
Plan rule 6 applies to you: N1075 (read member-facing sentences by key where `words.json` keys them), N1068 ("labeled"), the `admin` grep (N1072), N1073 (your listed hand-lists), and D29 (no `ok: true` carrying a refusal treated as success).
Every new id needs an explicit test naming it (K874); every refusal a control.
Inherited reds: the plan's rule 5 as it stands at your START; none is yours unless named here or in your entry.
Not part of any reading set: generated artifacts, vendored code and large data fixtures (K2053, K2083).
Run `node checks/run.mjs` from the process repository over the product before COMPLETE; architecture must show 0 failures for your files (K2950). Your Size line counts only your module's own code (K2513).
