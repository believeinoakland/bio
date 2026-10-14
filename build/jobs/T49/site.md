# site (T49)

**Status** · session_01J8PEzpB2y4LnPqzdpgRfCn · depth 2 · WORKING · handled B0

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
