# screens-daily (T48)

**Status** · session_01FKF8W1LZTJpRsMsyXEBorV · depth 2 · COMPLETE · handled B3

## J1 · QUESTION

My best readings, on which I carry on; correct any of them.

1. **R17's readings "named at START".** B1 names none beyond R17's own list. I draw only those: `queue` (the strip, Needs you, Needs the group, each area's "to do"), `projectlist`/`projectquestions` (Investigation, and the projects), `memberlist` (Members, to an administrator), and, to an administrator, `bootstrap`'s `version`, `profiles`, `grouplanguages` and `aiuseovertime` `{owner: "group"}` (Administration). Action is drawn from the queue's own items (its clocks are queue kinds); every other DEC-218 reading is a T49 row, listed in my record.
2. **Words not in `words.json` at `4664e8efd4`.** R22 and R23 name keys words.json does not hold: `queue.source-modified.one`/`.many`, `queue.source-removed.one`/`.many`, `queue.source.detail`, `queue.source.untitled`, `home.first.name`. I hold them as this module's own `SCREEN_WORDS` rows under exactly those keys, with R22/R23's English (removed: "{title} is gone from its source" / "{n} documents are gone from their source"; untitled: "A document with no title"), each for UX-DESIGN. Home's new block headings ("Needs you", "Needs the group", "Each area at a glance", "Since you last looked", the four area names, "their move"/"our move") are not keyed either: own `screen.home.*` rows, as T46's were. `shell.group.unnamed` is the shell's (its R60): I draw it by key and hold no copy.
3. **Unmerged same-layer changes I build on.** `wizard-scripts` R38 (the registry's `elsewhere`, the queue's `owed:updatelater`), `op-declarations` (`updatelater`, `lookedsince`, `aiuseovertime` in `OPS`), `interface-shell` R56/R60/R61/R62 (the class check, `shell.group.unnamed`, R61's "Nothing is here"), `setup-words` R8 (`elsewhere.*`, `queue.update.*`, `home.update.*`). I put `elsewhere` and `updatelater` in `SCREENS` now, so on today's tranche `interfacePage` refuses the module until wizard-scripts and op-declarations merge; meanwhile I test each screen against the shell with a stand-in registry and `OPS` (the fake-plane pattern) and my own R21 class check over `civicsmith.css` and `page.src.html`'s `<style>` at `4664e8efd4`. I post COMPLETE once my tests pass on a tranche holding those merges (a CHANGE to merge it), or sooner if you prefer I hold `elsewhere`/`updatelater` back.
4. **R18.** "Mute a kind" sends `{case, kinds: [kind]}` for an item whose nearest home case is a project or question; with no case, the existing item mute `{item}`. An OBLIGATION offers neither (queue R31).

## J2 · COMPLETE

T48-72 applied: R14–R23 met, on BOB's B2 (all four J1 readings) and B3 (`tranche/T48` merged at `ac7253060c`, real registry and `OPS`).

**Read, whole:** `build/requirements/screens-daily.md`; my entries in `build/plan/current.md` (T48-72, both lines); layer 11's contract (`build/layers.md`); all my code (index, home, projects, project-rows, queue, finder, find-in, answers, words); the services my entries touch: `interface-shell` R5, R8–R14, R19–R21, R31, R52–R64 and its kit (`browser.mjs` `kit`, `readAll`, `unavailableHtml`; `index.mjs` `checkScreens`, `REF_SCREENS`, `wordsOf`), `wizard-scripts` R37, R38 and `startFrom`'s answer (`routes`, `pointer`), `jurisdictions` R89 (the pointer's shape), `membership` R17, R143, `queue` R8 (items' `assignee`), R19, R20, R31, R54, `queue-producers` R40, `machinery-producers` R11, `instance-setup` R17, R85, R86, R90, `ai-use` R14, `setup-words` R8; `words.json`, `registry.json`, `mock-screens.js` (home, elsewhere, projects, the strip, area blocks) and `page.src.html`'s `<style>` at `4664e8efd4`; my tests naming changed ids (contract, home, projects, queue, find-in).

**Applied:**
- **R17** Home in arrangement C: the strip (`cs.strip`, none at zero); "Needs you" (items assigned to the member, with Home's registered item acts `taskresolve`, `adoptversion`, `keepversion`, else "Open"); "Needs the group" (whose move: an administrator's, a member's, anyone's); the four areas (Investigation: projects, questions, last change; Action: the queue's action-family items; Members and Administration to an administrator: `memberlist`; `bootstrap.version`, `profiles`, `grouplanguages` by language name, `aiuseovertime` group month); the projects (R10's rows); "Since you last looked" (`lookedsince` once per visit, never re-read by an act; projects changed since); "What happened?". First visit (`since: null`): no Needs you, no Since. New group: ready, first steps, doors only. Every failed read drawn failed in its block. `projectdirectory` ("could join") dropped (R17 amends R1).
- **R14, R23 doors:** each door an `mk-door` card (`<details>`, opening its scripts in place; no script name in the card); the sixth door last, a link to `elsewhere` (no script, no act); words field and "Start a project" (a disclosure in the act's words) beside them.
- **R15, R16** new screen `elsewhere` (no acts; only read `startfrom`): kinds in DEC-227's order, each pointer's name, does, contacts (`web` an outside link only for a web address), source and date read; both none states with the danger line; `null` pointer or failed read drawn failed; data escaped.
- **R18** case-form mute `{case, kinds}` on the nearest home case; item mute with no case; none on a to-do.
- **R19** queue section "Your group's Civicsmith" with `queue.update.ready`, the security mark, "See what changes", Not now (`updatelater`); on Home `home.update.ready`.
- **R20** Projects' "Imported cases" link to `imported`. **R23** Projects' title field opened on press; the definition said once (removed from the field help and empty state). Heading: name or "Your group", never the slug; "Name your group" first for an administrator while unnamed.
- **R21** every class defined by a served stylesheet (`mk-actd`→`mk-details`, `mk-sorts`→`mk-sortrow`, `mk-count`/`mk-owner`/`mk-last`/`label`/`sep`/`cs-untested` replaced); find-in's hand-made fields replaced (`cs.choice`); no zero counts (projects, find-in sections, frontier); no empty hold tray; find-in with no scope draws "Nothing is here" with the way back.
- **R22** source notices folded per kind into one item with its count (`source-items.mjs`, a part shared by Home and the queue), opening the list of its documents with their own options.

**Words:** own rows for R22's and R23's interim keys (`queue.source-*`, `home.first.name`, for UX-DESIGN per B2) and Home's new `screen.home.*` sentences.

**Deferred / for BOB:**
- `shell.group.unnamed` is interface-shell R60's word, not yet on its branch: the one red below goes green when interface-shell merges (before me in L11's order). I hold no copy.
- R20: `imported` takes a subject (one case); "Imported cases" opens `/app/imported` with none, which interface-shell R61 draws as "Nothing is here" until a list of imported cases exists. A requirement question for BOB/UX, not fixed here.
- R17's other DEC-218 readings (documents, cases, people followed, clocks running, expertise on hand, security level, edition drafts) are T49 rows: no provider read is named for them.
- Home's registry also lists `release` and `filingapprove`; their items draw "Open" (their screens own those acts).
- A section's `data-tip` holds the word escaped twice (the kit's `sec` help through `tipAttr`): interface-shell's, reported here, not changed.

**Tests and checks** (on `job/T48/screens-daily` after merging `tranche/T48`):
- `node --test bio-plane/test/m/screens-daily/`: 87 tests, 86 pass, 1 fail (R23 "Your group": `shell.group.unnamed` awaits interface-shell R60). With a stand-in shell word, 87 pass.
- `format`: 0 failures. `architecture … screens-daily`: 0 failures. `coverage … screens-daily`: 23 of 23 live ids named; 0 failures. `ownership … tranche/T48`: 19 files; 0 failures. `checks/run.mjs`: architecture 0 failures; coverage reds are other modules' only.

Size (session_01FKF8W1LZTJpRsMsyXEBorV): test runs 24, module lines 1802
