# interface-shell (T48)

**Status** · session_01MDeDZmkgwHShmUu5piZFAA · depth 2 · WAITING ON BOB (J2) · handled B3

## Work (T48-69), to be completed once the same-layer services merge

**Read, whole:** `roles/JOB.md`; `build/manifest.md`; `build/requirements/interface-shell.md`; my two T48-69 entries and BOB's START; `build/layers.md` (layer 11's contract); all of `bio-plane/src/interface-shell/` (`index.mjs`, `browser.mjs`, `words.mjs`). Of the modules I use, only what my entries touch: `interface-assets`' `ASSET_FILES` and its R5–R7; `op-grades`' R42 (`MARKS`) and the tables R11 reads; `wizard-scripts`' R37–R38 (the registry's `elsewhere`, `updates`); `control-plane` R95 (`testInstance`); `setup-words`' words for the band, the level and the new paths. The design inputs my entries cite: `page.src.html`'s `<style>`, `mock-shell.js`, `mock-kit.js`, `civicsmith.css`, `words.json` (at `4664e8efd4`, as on this branch), and `draft-T48-live-vs-design.md`'s C1–C9 rows. The tests naming a requirement my entries change: `page`, `frame`, `kit`, `acts`, `rows`, `words`, `sweep` tests and the harness, fixture and DOM stand-in.

**Entries applied (T48-69):**
- **R52** the shell's `STYLE` carries no `cursor` but `cs.areas`' `crosshair`; the `.cs-mast .cs-mark` hand copy (with its `cursor: help`) is gone (the design's rule is in `shell.css`).
- **R53, R58** the test band is no longer drawn inside a frame: `interfacePage(screens, {testInstance: true})` serves it in the page, above `#cs-root` (`#cs-testband`), so it spans the frame from first paint; `bootstrap` answering `test_instance: true` draws it when it was not served, an answer that is not true removes it, no answer keeps it; its words follow the member's.
- **R54** `PATHS.elsewhere` (Home › Where else to go), `PATHS.updates` (Settings › Updates); `updates` follows Security in the shell's settings list and is drawn only for a member who administers (`ADMIN_SCREENS`).
- **R55** `RE_POINTS`: `planask` on `plan`; `stepsource`, `stepsourcewithdraw` on `explore`.
- **R56** `civicsmith.css` then `shell.css` linked before the shell's `<style>`; `interfacePage` throws, naming the screen (or the guide, or the shell) and the class, for any class written in a `class` literal (or `setAttribute("class")`, `classList.add`) that no served stylesheet defines and `HOOK_CLASSES` does not list. The kit now draws the design's classes (`mk-crumbs`, `mk-table mk-rows`, `mk-r`, `mk-detail`, `mk-detailbox`, `mk-open`, `mk-pick(c)`, `mk-sort`, `mk-rowhold`, `mk-acts`, `mk-spark`, `mk-tile`, `mk-people`, `mk-next`, `mk-tl`, `mk-strip`, `cs-target`/`cs-target-label mk-ringlabel` for the ring, `mk-titlerow`, `mk-mastsearch`, `mk-avatar`, `mk-hide-phone`, `mk-note`); every hand copy of a design rule left `STYLE`. What stays in `STYLE` (no design class fits): the frame's fixed height and scrolling, `cs-menuwrap`, `cs-menu`, `cs-actwrap`, `cs-slot`, `cs-rowname`, `cs-testband`, `cs-overlay`, `cs-image`, `cs-areas-box`, `cs-area`, the avatar as a button, the group's name kept on one line, reduced motion. `HOOK_CLASSES`: `cs-crumbs`, `cs-rows`, `cs-r`, `cs-panel`.
- **R57** the frame fills `100dvh` (body a column, the frame filling it, its main column scrolling, the page never); masthead with `mk-mastsearch`, `mk-hide-phone` labels, `mk-avatar`; at the phone width icons only, each label its control's accessible name; tabs last in the frame; the band reads "Working · not public · seen by your group's members" (`shell.band.working`).
- **R59** the guide's marks are placed after the screen's heading inside its title row (`mk-titlerow`: the screen's own when it drew one, else one made around the first heading); with no heading, after the path; none drawn, nothing changes.
- **R60** no To-do count at zero; the group's display name, else `shell.group.unnamed` ("Your group"), never the slug (nor the page title); the level control names `level.<l>.name` alone (`shell.level` retired); the avatar never draws the member's record id (an icon when no handle is known).
- **R61** absence codes `NO_SUCH_*`, `*_NOT_FOUND`, `NOT_FOUND`, `NO_ENTITY`, `NO_CALC`, `NO_NODE` and a screen's own `absent` list; "Nothing is here" leads back to the screen's place (path and button); a subject screen opened with no subject draws it and reads nothing; a refusal's own words are drawn alone; a failure without words is `shell.unread` ("This could not be read.") with R39's reference, naming no code (acts too).
- **R62** `cs.field`'s label and help are separate blocks, help tied by `aria-describedby`; at the phone width `cs.rows` draws the name and its first value on one line, the rest labelled, no label for an empty cell, no column empty in every row.
- **R63** More, and the shell's settings list, are rail rows (`cs-row`: icon, the name as a reference, what it holds beneath); no bare `<ul>`.
- **R64** an act R11 draws with no weight carries `MARKS[op]`'s pips and name (`.w[data-mark]`) and its explanation; it still runs on press.

**Contract decisions (BOB's level, mine as the shell's owner; for BOB to record):** (1) a screen lists its own absence codes as `absent: [codes]` on the screen object (R61's "`ABSENT_CODES`"); `checkScreens` refuses a non-list. (2) R56's "class literal" is read from the screens' and guide's serialised functions and the shell's program; a class made at run time is not checked (a literal cut open, as `cs-tag-` + kind, is skipped).

**Tests and checks so far:** with local stand-ins (never committed) for the unmerged same-layer services (`interface-assets`' `shell.css`, `op-grades`' `MARKS`, `op-declarations`' `planask`/`stepsource`/`stepsourcewithdraw`, `wizard-scripts`' `elsewhere`/`updates` rows) and setup-words' finished re-take: `node --test test/m/interface-shell/*.test.mjs` 134 pass, 0 fail (new `design.test.mjs`, 14 tests, R52–R64 each with a control; amended tests renamed to the ids that amend them). `format` 0 failures; `architecture` 0; `coverage` interface-shell 62 of 62; `ownership` 0 failures (13 files).

## J1 · REPORT

T48-69's code and tests are pushed (R52–R64). The details are in my record. I hold COMPLETE until the services I build against have merged, because my module now imports them: `interface-assets` R7 (`ASSET_FILES["shell.css"]`), `op-grades` R42 (`MARKS`), `op-declarations`' `planask`, `stepsource` and `stepsourcewithdraw`, `wizard-scripts` R38 (`elsewhere`, `updates`), and `setup-words` R8 (`screen.elsewhere.name`). Against local stand-ins of these, never committed, my 134 tests pass. When they are on `tranche/T48`, send me a CHANGE. I will then merge the tranche, re-run, and post COMPLETE.

For you to place:
1. **Screen modules go red under R56, as planned.** `interfacePage` now refuses any class that no stylesheet defines. Until each screen job maps its classes, those modules' tests are red (this branch with the stand-ins: entry 6 failing, wizards 17, settings 77, intake 55, daily 59, inquiry 63, investigate 78, publish 52, action 46). `control-plane`'s page test is red for the same reason. The undefined classes, per module:
   - entry: cs-fronthead, cs-flogo, cs-sub, cs-actrow, cs-small, cs-frontgrid, cs-signin, cs-note, cs-codes, cs-steps, cs-list, cs-shown
   - wizards: cs-form, cs-list, cs-note, cs-label-untested, cs-actrow, cs-wizmarks
   - settings: cs-list, cs-note, cs-table, cs-form, cs-shown, cs-notice, cs-situation, cs-label-untested, cs-draft-label, cs-kv, cs-tag-machine
   - intake: cs-tab, cs-refusal, cs-untested, st, tw
   - daily: mk-count, mk-owner, mk-last, mk-actd, mk-sorts, sep, label, cs-untested
   - inquiry: cs-sub, cs-label, cs-meta, cs-refusal, cs-note, cs-rec, cs-strengthbox, cs-facts, cs-id, cs-passage, cs-machine, cs-form, cs-list, cs-table
   - investigate: cs-sub, cs-filters, cs-note, cs-meta, cs-refusal, cs-actrow, cs-chain, cs-hops, cs-gapblock, mk-lane, cs-visit, cs-current, cs-proposal
   - publish: cs-actrow, cs-note, cs-list
   - action: mk-form, mk-done, mk-grid, src

   The shell no longer styles `cs-actrow` and `cs-list`. They were copies of the design's `mk-acts` and `mk-list`, and the screens map to those.
2. **Other modules' tests that read the kit's old markup.** screens-wizards' `page.test` reads `cs-ring`; the ring is now the design's `cs-target`. screens-action's `contract.test` reads `nav.cs-crumbs li`; the path is now the design's `mk-crumbs`, with `a`, `i` and `b` and no list. screens-daily's `projects.test` reads `cs-spark` and `cs-people`, now `mk-spark` and `mk-people`. The hook classes `cs-crumbs`, `cs-rows`, `cs-r` and `cs-panel` are still drawn.
3. **Two contract decisions to record (BOB's level).** First: a screen lists its own absence codes as `absent: [codes]` on its screen object. That is R61's "ABSENT_CODES"; screens-investigate R26 builds to it. Second: R56 checks the classes written as literals in the functions and skips a class made at run time.
4. **R56's list and the ASK to UX-DESIGN.** These shell styles stay because no design class fits: `cs-menuwrap`, `cs-menu`, `cs-actwrap`, `cs-slot`, `cs-rowname`, `cs-testband`, `cs-overlay`, `cs-image`, `cs-areas-box`, `cs-area`. Also mine: the frame's fixed-height rules, the avatar drawn as a button, and the group's name kept on one line. `HOOK_CLASSES` lists `cs-crumbs`, `cs-rows`, `cs-r` and `cs-panel`.
5. **Words for the UX handoff.** New: `shell.band.working` (R57's interim), `shell.group.unnamed` ("Your group") and `shell.unread` ("This could not be read.", R61's "could not be read", which has no key). Retired: `shell.level`.
6. **interface-assets' J1.** I rely on `shell.css` carrying the design's phone rules under the 760 px query: `.mk-hide-phone` and `.mk-mastsearch span` hidden, the tabs as a grid in the fifth row, the `mk-rows` card rules. Their `:root:root` proposal suits me. The frame's height and scrolling are my own rules, keyed on `#cs-root`, so they do not depend on how `.mk-page` is rewritten.

## J2 · REPORT

B2 and B3 are done. The tranche is merged.
- B2: the kit no longer draws `cs-pickc`. Picks use the design's `mk-pickc` and `mk-pick`, as of my J1 push.
- B3: nothing in the shell restricted a screen's globals, so `Intl` already worked. A new test names the clause: a screen draws a language's name through `Intl.DisplayNames`.
- After the merge, the real `shell.css`, `MARKS`, registry and words are in. `MARKS` names weights capitalised ("Reasoned"), so the shell now reads them in lower case.

My tests: 135 pass, 0 fail, with one local stand-in left (never committed). That stand-in is op-declarations' `planask`, `stepsource` and `stepsourcewithdraw`, which `tranche/T48` does not yet hold. Without it, R55's test fails, because `checkScreens` finds those ops are not in `OPS`. Format, architecture, coverage (62 of 62) and ownership all show 0 failures. When op-declarations merges, send me a CHANGE. I will then merge, re-run and post COMPLETE. J1's other points stand.
