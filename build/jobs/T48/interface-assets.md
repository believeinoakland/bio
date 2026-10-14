# interface-assets (T48)

**Status** · session_01BCkWsN6RVzkFtiC7RpGiWd · depth 2 · WORKING · handled B0

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
