# interface-assets (T48)

**Status** · session_01BCkWsN6RVzkFtiC7RpGiWd · depth 2 · COMPLETE · handled B2

## J1 · QUESTION

R7, read as written, breaks the phone layout through specificity. I am building it as written and carrying on with the rest of the job; your answer changes one line of the generator.

**The flaw.** The design's phone rules sit under `.mk-device[data-device="phone"]`, which adds (0,2,0) to their specificity. R7 removes that prefix inside the 760 px query, so each phone rule loses that weight. Meanwhile the general rules keep `.mk-page`, rewritten to `.cs-frame`. Two phone rules now lose on every phone:
- `.cs-frame .cs-tabs { display: none }` (0,2,0) beats the phone `.cs-tabs { display: grid }` (0,1,0), so the tab bar never shows.
- `.cs-frame.cs-shell > .cs-dock { grid-row: 3 }` (0,3,0) beats the phone `.cs-dock { grid-row: 4 }` (0,1,0), so the dock lands on the main column's row.

In the design they tie or win, and source order gives them the win. My `shell.css` emits every phone rule after the general ones, so order is right; only the weight is lost.

**My recommendation.** In the 760 px query, replace the prefix with `:root:root ` instead of removing it. That adds exactly the (0,2,0) the design had and matches every element, so each rule behaves as it does in the design's phone frame. The other option is to drop the general `.cs-frame .X` rules that the phone rules override. That takes a list kept by hand, so I don't recommend it.

**A second gap, same rule (a REPORT for you to place).** R7 carries a rule only when every selector names an `mk-` or `cs-` class. So these product rules are not carried, though carried `mk-` components draw them:
- the graph's edge classes `.e`, `.e-pos`, `.e-part`, `.e-money`, `.e-money-in`, `.e-ment`, `.e-lead`, `.e-same`, and the chips `.gchip`, `.gchip text`, `.gchip.subject …` (used inside `.mk-graph` and `.mk-glegend`);
- `.cell`, `.cell h4`, `.cell p`, `.cell li`, `.cell ul` (used by `.mk-areas .cell`);
- `.st` (the hide-by-default of the `.st-a`… states that `.mk-frontgrid.st-a` and similar show).

`.row`, under `.mk-page .row`, is carried as `.cs-frame .row`. Under `interface-shell` R56, a screen drawing `e-money` or `cell` would throw. Options: (a) R7 also carries the rules naming these classes, listed by name; (b) the screens' jobs map them to kit classes; (c) an ASK to UX-DESIGN to prefix them `mk-`. I recommend (a), as the cheapest that matches the design.

## J2 · REPORT

Two stale artifacts and one inherited red, for you to place (mechanics §14):
- **installer:** `newgroup/dist/newgroup.bundled.mjs`, installer's committed bundle, is stale against interface-assets' new `ASSET_FILES`: the R5 stylesheet, the new `shell.css` and the faces' new form. `newgroup/test/t47.test.mjs` R53 fails only on its "carried in the bundle" and serving checks (`civicsmith.css`). On my branch: newgroup 59 pass, 1 fail. Installer's job regenerates its bundle after this merges.
- **plane:** the plane bundle is regenerated likewise (L11 close). R6's effect: a fresh import of interface-assets holds about 171 KB of heap, down from about 1,133 KB. The faces are built only when read. Import time is about 7–11 ms either way, in node.
- **control-plane:** 2 reds, inherited. R32/R39/R46 (C-numbers on the wire) and R53 (OP_STAMPS) fail the same with and without my change: 255/2 with it, 254/3 on the tranche without it; the third, R81, passed in my run. They are not mine.
- **interface-shell:** 120 pass, 0 fail with the new assets.

## J3 · COMPLETE

T48-68 applied: R5, R6 and R7 met, R7 as K3295 rules it.

**Read, whole:** `build/requirements/interface-assets.md`; my T48 entries; `build/layers.md`'s layer 11 contract; my code (`generate.mjs`; `index.mjs` is generated, not part of the reading set); `assets.test.mjs`; for R6, `bundler` R31 and `plane` R43 and R54; for the pattern, `court-citations` R11's test and `case-checker`'s `program.mjs`; and `page.src.html`'s `<style>` and `civicsmith.css` at `4664e8efd4`.

**Applied:**
- **R5:** `ASSETS_COMMIT` is `4664e8efd4`. The visual language and page have not changed on `main` since, and START named no later commit. The stylesheet has no `cursor: help`, no cursor on `.cs-card`, and the three kind tokens light and dark.
- **R6:** each face's base64 is a literal inside its own function, read by the frozen entry's `body` getter. A fresh import holds about 171 KB of heap, down from 1,133 KB, and the faces are built only when read. The entries are byte-identical (R1). I took the "built on first read" form: an upload part would need the module to import a non-JS file, which R4 forbids, and a bundler entry in another module. This matches case-checker's form, as K3207 records.
- **R7:** `generate.mjs` exports `shellCss` (the test states the transform with it) and writes `shell.css`. Phone rules go inside `@media (max-width: 760px)` with the prefix `:root:root ` (K3295), after the general rules. `.mk-page` becomes `.cs-frame`. The listed product classes (`.e`, `.e-*`, `.gchip`, `.cell`, `.st`/`.st-a…`, `.row`) are carried. Strings and comments are parsed safely.
- **Fix in my own module:** `generate.mjs` now writes only when run directly, so its test can import it.

**Wording note:** R7's "How selectors are rewritten" sub-bullet still says "with that prefix removed", against its head sentence (K3295). I followed the head; the sub-bullet needs your fold.

**Deferred:** none.

**Other modules (also in J2):**
- `installer`'s committed `newgroup/dist/newgroup.bundled.mjs` is stale against the new `ASSET_FILES`. newgroup t47 R53 fails on it; installer's job regenerates it.
- The plane bundle is regenerated at L11's close.
- control-plane's 2 reds, R32/R39/R46 and R53, are inherited: they fail the same without my change.

**Tests:**
- interface-assets: 14 pass, 0 fail.
- interface-shell, with the new assets: 120 pass, 0 fail.
- control-plane: 255 pass, 2 fail (inherited).
- newgroup: 59 pass, 1 fail (the stale bundle, above).

**Checks:**
- format: 0 failures.
- architecture interface-assets: 0 failures.
- coverage interface-assets: 7 of 7 ids named; 0 failures.
- ownership: 4 files; 0 failures.
- `run.mjs`: architecture 0 failures; coverage 20 failures, all in other modules (screens-investigate, screens-publish, screens-settings, wizard-scripts and others), none mine.

Size (session_01BCkWsN6RVzkFtiC7RpGiWd): test runs 9, module lines 160
