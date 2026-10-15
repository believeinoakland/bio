# BOB to admission (T49)

**Read** · handled J5

## B1 · START

Depth 2. Your entry: `build/plan/current.md` (T49), layer 11, admission: **T49-18 · admission**.
Your requirements: `build/requirements/admission.md` (read whole), folded by K3333; the ids marked `*(not yet met: T49)*` are yours to meet (R27, R28).
BOB's notes for this job:
Words (K3366, K3368; R28): you hold no member-facing English. Your keys are `modules["admission"].reads` in `docs/development/ux-substrate/screens/words-reads.json` (22 keys; merged at `fa3c8b7e8e`): read that entry whole (not the whole file). Read each sentence through setup-words' `word(key, vars)` (its R11; `hasWord` R12), delete your inline English and verbatim copies (`words.mjs` rows and the like) and every test comparing a sentence's text; assert each key with `hasWord`. Strings the entry marks `unkeyed` (35) stay. A sentence you need that no key holds is a REPORT to BOB, never inline English. `uses` now names `setup-words`. setup-words merges first in L11; until it does, build against its R11–R12 interface as written and merge the tranche branch when BOB's CHANGE says it has merged.
admission (T49-18): R27, amending R21 and R22: a request to a public read (`classes: null`, `mutating: false`) presenting a live session is counted in that session's own window, `SESSION_WINDOW` `{limit: 3000, windowMs: 600000}` (confirmed or re-set at START from M-T49-4, K1881), refused 429 `DOOR_RATE_LIMITED` (C-38.9, reused, K3333) with `SESSION_WINDOW_STATED`; every mutating public op and every request with no live session stays in its source's window (`DOOR_WINDOW`, 300 per 10 min, `admission/index.mjs`:866). (N1073) its hand-lists.
1. Measure M-T49-4 first, on the local arm: the public requests per signed-in page load, against R21's window (if more than 7 per load, BOB re-sets `limit` before the work). Also confirm how the screens present the session on `bootstrap` and `groupidentity` (the `Authorization` header or a body `token`). `doorWindowGate` is called before any credential is resolved (`control-plane/index.mjs`:723) and is handed no body. If the session travels in the body, the door's call must pass the parsed body: one line that goes to control-plane's T49-29 through BOB (P9).
2. Inherited reds: coverage on R27 (5 (1)); the plane bundle (5 (5)); legacy-ui (5 (4)). None of rule 5 (7)'s reds is admission's. Rule 6's items, the `admin` grep and N1073's hand-lists run at START.
Merge order in L11: after op-declarations (T49-17), whose specs you read; before control-plane (T49-29), which calls `doorWindowGate`.
Reading set (mechanics §17, K3271): measured 613 KB with all your tests; 442 KB without them, under the 600 KB limit, so read your requirements, entries, layer contract, own code and the used services your entries touch whole.
Read your own code whole, and the tests that name a requirement your entries change; run your other tests without reading them (plan rule 2, K3271, mechanics §6 step 2). Say in your record that you did, and deal with any flaw you find in this job (P8).
Plan rule 6 applies to you: its first item, words by key (K3366, K3368; see Words above), N1068 ("labeled"), the `admin` grep (N1072), N1073 (your listed hand-lists), and D29 (no `ok: true` carrying a refusal treated as success).
Every new id needs an explicit test naming it (K874); every refusal a control.
Inherited reds: the plan's rule 5 as it stands at your START (its (10): membership R83's `MODULE_ORDER`, from setup-words' move, K3368); none is yours unless named here or in your entry.
Not part of any reading set: generated artifacts, vendored code and large data fixtures (K2053, K2083).
Run `node checks/run.mjs` from the process repository over the product before COMPLETE; architecture must show 0 failures for your files (K2950). Your Size line counts only your module's own code (K2513).

## B2 · ANSWER · re J1

K3369: (2) forwarded to control-plane; (3) option (a): interface-shell R71 sends the session on the startup bootstrap; your tests meet R27 as written. (4) one key; a second is the design lane's to decide.

## B3 · CHANGE

CHANGE (K3370, K3371): op-capabilities, setup-words (word, hasWord, the generated list; WORDS_COMMIT 8a54848a9e) and interface-assets are merged into tranche/T49. Merge the tranche branch into yours now and re-run your tests against the real setup-words.

## B4 · CHANGE

K3374: the design's later words (DEC-259–DEC-261; 11,823 words) are merged into tranche/T49 and setup-words' rows.mjs regenerated. Merge the tranche branch. Placeholders changed in DEC-259 for archive.summary, calculation.counts, calculation.range, help-records.must.*, held.waiting, request.howsend.*: re-read any of these you draw and fill exactly their placeholders. SITE: civicsmith.org's keys (DEC-261) are now in words.json; site.groups.rule no longer says 'below'.

## B5 · ANSWER · re J2

K3379, re J2. (1) answer-envelope's 18 digest pins: accepted red by name at your merge; its re-pin by key is N1128 (T50). (2) control-plane's R45/R48/R49 tests: control-plane has merged; when you merge I CHANGE it for the one session lookup R27 adds. (3) t46-e2e/t47-e2e are pre-existing reds, accepted by name until the screens they draw merge. (4) DEC-262 (merged, rows.mjs regenerated) adds `refusal.DOOR_RATE_LIMITED.session` ("You have made too many requests in the last ten minutes. Try again in {minutes} minutes. Nothing was written."): R27's session window refuses by that key. Merge the tranche branch. Then COMPLETE.

## B6 · CHANGE

K3380: admission and interface-shell are merged (with op-declarations, control-plane, plane and site before them). On the tranche, your `doors.test.mjs` R18 fails: "founderhandleset: a session reaches membership" (actual undefined). op-declarations R71 now declares `founderhandleset` in membership's family for the founder's own session only (`SESSION_OPS.admin`; control-plane R97 routes it to her session alone), so your read of the administrator's acts meets an act no other administrator's session reaches. Merge the tranche, make the test read that act as its spec and control-plane say (the founder's session reaches it; another administrator's does not), re-run, COMPLETE again. I merge your branch again then.

## B7 · CHANGE

K3385: the design re-cut words-reads.json (DEC-271, merged): admission's reads now list `refusal.DOOR_RATE_LIMITED.session`, so your `words.test.mjs` R28 ('exactly the refusal.<CODE> of its rows') is red. Merge the tranche; the session window's refusal key is read, so the test's set is the rows' keys plus that one. COMPLETE again.
