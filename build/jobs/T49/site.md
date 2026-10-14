# site (T49)

**Status** · session_01J8PEzpB2y4LnPqzdpgRfCn · depth 2 · WORKING · handled B4

## J1 · QUESTION

Three readings I am building on; one decides the committed pages.

1. **SITE_COMMIT.** R9 names `f498560a37` "or a later `main` commit named at START"; START names none. But the words R12 binds me to (`words.json` in the tree, DEC-257) are the design at `fa3c8b7e8e` (PR #39's head, merged into `tranche/T49` at U260), whose `SCR.site` differs from `f498560a37`'s: it adds state `d` (Groups at work with no group listed: `screen.site.groups.none`, R4's empty state), the listing-rule note (`site.groups.rule`, DEC-255), and `screen.site.steps.name` with `{places}` (R11). At `f498560a37` the drawing and the keys do not match. **My reading:** `SITE_COMMIT` = `fa3c8b7e8e` (on `main` once T49 closes). Say if you want `f498560a37`.

2. **Words at generation.** Per your note ("your page generator may call `word` at build"), `site/build.mjs` reads `SCR.site` at `SITE_COMMIT`, matches each drawn sentence to its key, and writes `site/src/pages.mjs` with `word(key, vars)`'s English in place; values set at deploy (address, counts, dates) stay as placeholders that the Worker fills. The Worker itself imports no word list (it stays small: pages + `ASSET_FILES`). `pages.mjs` is then a generated artifact (mechanics §14) owned by `site`: the manifest's table needs a row (BOB's file): regenerate with `node site/build.mjs` from the repository root, `--check` to verify; inputs `words.json` (through setup-words), `SCR.site` at `SITE_COMMIT`, `jurisdictions/profiles/`.

3. **Places ready now (R11).** Read as data from `jurisdictions/profiles/*.mjs` with `test: false`, each by its `name` (as installer R21 offers them): today "City of Oakland and Alameda County". The design's sentence also says "California"; no released profile covers the state, so it will not appear. Say if a state should come from somewhere else.

**Blocking, for the design lane (REPORT follows): sentences the design draws on these pages that no key in `words.json` holds.** Until they exist the generator refuses (it never writes inline English), so I cannot commit the pages. My proposed keys:
- menu: `screen.site.nav.home` "What Civicsmith is", `screen.site.nav.start` "Start a group", `screen.site.nav.groups` "Groups at work" (also the /groups heading);
- headings: `screen.site.onecase.head` "One group's work", `screen.site.questions.head` "Questions", `screen.site.need.head` "What you need", `screen.site.costs.head` "What it costs";
- `screen.site.create` "Create your group"; `screen.site.groups.visit` "Visit";
- `screen.site.uses.ask.example` "Did the city collect the rent its lease requires?" (fills `screen.site.uses.ask`'s `{example}`);
- `screen.site.questions.unset` "[the stewards' address, set up with civicsmith.org's email]" (R6's marked placeholder);
- R5's row: `screen.site.onecase.title` "{case}, Edition {edition}" and `screen.site.onecase.meta` "{group}, {place} · signed by {signer} · {date}" (R5 asks for the date; the drawing shows none);
- R4's rows beyond one case: `screen.site.groups.cases.many` "{cases} published cases, in {editions} editions, the latest {date}" and `screen.site.groups.case.many` "{cases} published cases";
- the 404 page (R1): `screen.site.notfound` "There is no such page on civicsmith.org." (its link reuses `screen.site.back`).
Also: `site.groups.rule` says "under the listing rule below", and no page draws a listing rule.

## Progress (SITE #1, 2026-10-14)

- **Built** (commit `268f122186`, tranche merged after B2): `site/src/index.mjs` (the Worker: R1's routes, 404/405, HEAD; the four deploy values checked, a malformed one answering 500; the headers of R6–R8 and R10; interface-assets' `ASSET_FILES` served at `/app/assets/…`), `site/build.mjs` (the generator: `SCR.site` at `fa3c8b7e8e` evaluated from git, mock controls removed, menu links real, samples replaced by slots, every sentence `word(key, vars)` for the keys in `KEYS`, places from released profiles as data), `site/test/site.test.mjs` (22 tests, R1–R12 each named, each refusal with a control), `site/test/browser.test.mjs` (R9's pairs at 1280 and 390 px, Chromium), `site/wrangler.jsonc` (no binding beyond the vars), `site/package.json` with its lock.
- **Measured** (BOB's step 1): `SCR.site` at `fa3c8b7e8e` has four states (a, b, c, and d, the empty Groups at work). The classes it draws are all covered by `civicsmith.css` and `shell.css` as served, except `mk-data` (a design marker with no rule), which the generator drops; the browser test finds no undefined class on any page. Generated `pages.mjs` about 15 KB; the bundled Worker 1.14 MB (0.80 MB gzip), nearly all interface-assets' faces.
- **Not committed:** `site/src/pages.mjs`. The generator refuses until the 16 keys of J1 are in `words.json` (B2: with the design lane). With those keys added locally (never committed) and the real setup-words: `node --test site/test/` 24 pass, 0 fail; the generated pages put beside the design's drawing at 1280 and 390 px match in structure and words.
- **Checks** (with `site/` and `site/test/` set in a local, uncommitted `modules.json`): format 0 failures; architecture 0 failures (8 product files); coverage 12 of 12 ids named. Without them (as committed), architecture lists `site/` as owned by no module, which BOB's `modules.json` edit clears.
- Plan rule 6: no member-facing English held (R12, above); no "labelled"; no `admin` reaches a reader; no hand-list of N1073's; D29 does not apply (the site reads no answer).
- Reading: requirements, entry, L11 contract, interface-assets' Purpose and Provides, setup-words' R10–R13, read whole; no code of mine existed to read.
- **Next:** on BOB's CHANGE with the keys: merge the tranche, `node site/build.mjs`, commit `site/src/pages.mjs`, run the tests and checks, COMPLETE.

## J2 · REPORT

Built and tested everything but the generated pages (record, Progress). My paths for modules.json: paths ["site/"], tests ["site/test/"]; set now, they clear architecture's 'owned by no module' for site/. site/src/pages.mjs waits on the 16 keys of J1: with them added locally, 24 tests pass under the real setup-words. The R9 browser test needs `npm ci` in site/ (playwright-core 1.56.1, as journey-check pins). On your CHANGE with the keys I generate, commit, check and post COMPLETE.

## Completion (SITE #1, after B3 and B4)

- **Entries applied:** T49-31 whole: R1–R12 met by `site/` (the Worker `site/src/index.mjs`, the generator `site/build.mjs`, the generated `site/src/pages.mjs`, `site/wrangler.jsonc`, `site/package.json` with its lock). Paths `site/`, tests `site/test/` (set by BOB, K3375).
- **SITE_COMMIT is `dc267da296`, not K3372's `fa3c8b7e8e`:** DEC-261 changed `site.groups.rule` (no longer "below") in both `words.json` and `SCR.site`, so at `fa3c8b7e8e` the drawing and the words no longer match and the generator (rightly) refuses. `dc267da296` is DEC-261's own commit, on `tranche/T49` (on `main` at T49's close), and the tree's `SCR.site` is unchanged since. Same reasoning as K3372 (1); BOB's to record or overturn.
- **Generated artifact:** `site/src/pages.mjs` (manifest row added by BOB, K3372): `node site/build.mjs` from the repository root, `--check` verifies. It is stale whenever `words.json`'s `screen.site.*` words or `SCR.site` change; R9's test fails then.
- **Deferred:** none. **Found in other modules:** none beyond J1's design gaps, now closed by DEC-261.
- **Tests:** `node --test site/test/` — 24 pass, 0 fail (22 interface tests, R9's browser pairs at 1280 and 390 px with its control; the pairs are written to `$SITE_PAIRS` or a temporary directory, path printed). The browser test needs `npm ci` in `site/` and Chromium (`CHROMIUM` or `/opt/pw-browsers/chromium`).
- **Checks** (process repository): `format` 0 failures; `architecture … site` 9 product files, 0 failures; `coverage … site` 12 of 12 live ids named, 0 failures; `ownership … site tranche/T49` 10 files, 0 failures. `checks/run.mjs`: format 0, architecture 0 failures (3370 files), channels 0; coverage 12 failures, none of them site's (other L11 modules' new ids, plan rule 5 (1) and (10)).
- Reading: my own code whole after each change; no other module's tests name a requirement this job changed.
- Size (session_01J8PEzpB2y4LnPqzdpgRfCn): test runs 9, module lines 423
