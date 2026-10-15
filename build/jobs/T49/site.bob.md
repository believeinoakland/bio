# BOB to site (T49)

**Read** · handled J3

## B1 · START

Depth 2. Your entry: `build/plan/current.md` (T49), layer 11, site: **T49-31 · site**.
Your requirements: `build/requirements/site.md` (read whole; a new file), folded by K3339 (settled K3334); the whole file is marked not yet met (T49) in its Status, and its ids are yours to meet (R1–R11, R10 and R11 invariants, R12).
BOB's notes for this job:
Words (K3366, K3368; R12): you hold no member-facing English; every sentence is read through setup-words' `word(key, vars)` by the keys your requirements name (all in `docs/development/ux-substrate/screens/words.json`, merged at `fa3c8b7e8e`; DEC-258 lists none for you because you had no source). Your page generator may call `word` at build. Assert each key with `hasWord`; no test holds a sentence's English. `uses` now names `setup-words`. setup-words merges first in L11; until it does, build against its R11–R12 interface as written and merge the tranche branch when BOB's CHANGE says it has merged.
site (T49-31): civicsmith.org as the design draws it (`SCR.site`, DEC-206, DEC-223): R1 three pages joined by one menu (`/`, `/start`, `/groups`); R2 the front page; R3 Start a group, with "Create your group" linking `INSTALLER_ADDRESS`; R4 Groups at work from `LISTED_GROUPS`, its empty state never a sample group; R5 One group's work only while `FEATURED_CASE` names a real edition; R6 the stewards' address `STEWARDS_ADDRESS` (N923); R7 the installer hand-off, passing nothing about the visitor; R8 served from itself; R9 the text and the look at `SITE_COMMIT`, generated; R10 nothing about a visitor held; R11 no place in code, the places ready now read from the released `jurisdictions` profiles at generation. The text is the design's at a named commit, not read by key (fold (b) finding 8).
A new module: `modules.json` lists you with empty `paths` and `tests`; name your paths and tests in your COMPLETE so BOB fills them before the ownership check (K1043).
Your four deploy values' first settings: `INSTALLER_ADDRESS` unset until the release (a placeholder value in tests), `FEATURED_CASE` `null`, `LISTED_GROUPS` `[]`, `STEWARDS_ADDRESS` unset (Bob's, N923), so the site ships not public (R6: the marked placeholder and `X-Robots-Tag: noindex`).
Your look is served at interface-assets' `/app/assets/…` paths, so its stylesheet's font addresses resolve unchanged (R8, K3339); you read interface-assets' `ASSET_FILES` and carry no second copy of the faces (R9, K3334).
R11's ready places are read by your generation script from the released `jurisdictions` profile files as data, never by an import, so `uses` stays `interface-assets` only (architecture check; K3340).
1. Measure first: `SCR.site` at the named commit (three states, every class it draws, and whether `shell.css`' rules cover them). Measure the generated size.
2. Inherited reds: coverage on R1–R11 (rule 5 (1)); membership R145's `MODULE_ORDER` tolerates `site` as not yet built until this merge, with its `paths` (R140's form). No other rule 5 red is this module's.
Merge order in L11: merges when complete, after interface-assets (T49-19), whose files you serve, and after plane; before journey-check (T49-32).
Reading set (mechanics §17, K3271): you have no code yet, so your set is your requirements, the Purpose of earlier modules you may use and the Provides you will use (mechanics §3: interface-assets' `ASSET_FILES`), measured small (15 KB); read it whole.
Read your own code whole, and the tests that name a requirement your entries change; run your other tests without reading them (plan rule 2, K3271, mechanics §6 step 2). Say in your record that you did, and deal with any flaw you find in this job (P8).
Plan rule 6 applies to you: its first item, words by key (K3366, K3368; see Words above), N1068 ("labeled"), the `admin` grep (N1072), N1073 (your listed hand-lists), and D29 (no `ok: true` carrying a refusal treated as success).
Every new id needs an explicit test naming it (K874); every refusal a control.
Inherited reds: the plan's rule 5 as it stands at your START (its (10): membership R83's `MODULE_ORDER`, from setup-words' move, K3368); none is yours unless named here or in your entry.
Not part of any reading set: generated artifacts, vendored code and large data fixtures (K2053, K2083).
Run `node checks/run.mjs` from the process repository over the product before COMPLETE; architecture must show 0 failures for your files (K2950). Your Size line counts only your module's own code (K2513).

## B2 · ANSWER · re J1

K3372: (1) SITE_COMMIT = fa3c8b7e8e. (2) yes: site/build.mjs writes site/src/pages.mjs (manifest row added). (3) yes, released profiles only, no state. The missing keys go to the design lane now (channel); build everything else and test it; merge the tranche (setup-words has merged). When the keys land on a design branch I will merge it into the tranche and CHANGE you.

## B3 · CHANGE

K3374: the design's later words (DEC-259–DEC-261; 11,823 words) are merged into tranche/T49 and setup-words' rows.mjs regenerated. Merge the tranche branch. Placeholders changed in DEC-259 for archive.summary, calculation.counts, calculation.range, help-records.must.*, held.waiting, request.howsend.*: re-read any of these you draw and fill exactly their placeholders. SITE: civicsmith.org's keys (DEC-261) are now in words.json; site.groups.rule no longer says 'below'.

## B4 · ANSWER · re J2

K3375: your paths are set in modules.json. The 16 keys are on tranche/T49 (K3374, DEC-261): merge, generate, commit, COMPLETE.

## B5 · CHANGE

K3384: the design's DEC-270 is merged into tranche/T49 (af89fd5931; rows.mjs regenerated): Bob approved the listing rule (DEC-255, Publication §5E). Draw `site.groups.rule.head` ('The listing rule') and `site.groups.rule.text` (protected, Bob's approved text; never reworded) on civicsmith.org's groups page in both states (listed, none yet), as a details element beside `site.groups.rule`. Take `SITE_COMMIT` as af89fd5931 if `SCR.site` changed there, regenerate `site/src/pages.mjs`, test against the mock, COMPLETE again.
