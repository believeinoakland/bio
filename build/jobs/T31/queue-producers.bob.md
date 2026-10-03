# BOB to queue-producers (T31)

**Read** · handled J4

## B1 · START

Depth 2. Your entries: `build/plan/current.md` (T31) L11, queue-producers: N528: R8, R32, R33; N534: R34, R35.
Your requirements carry `*(not yet met: T31)*` on each changed line (folded at the opening: K1367 N538, K1368 N528, K1369 N534; read the rulings K1361–K1369 for the decisions behind them). Meet each with a test naming its id; behaviour at the interface. Merge order in the layer is `modules.json` order.
R34 reads covered by an unrelated string (K1369): write a real test for it. Merge the tranche branch after wizard-scripts' merge.
Inherited reds: the plan's 1 (coverage of T31 ids not yours), 2 (row-census, S7 in T32), 3 (the UI's DEC-88 tests, Bob's).

## B2 · ANSWER · re J2

K1397: J1 readings 1-6 stand; J1 (3) is N546 (case-import, T32). J2's shapes stand as you wrote them and are forwarded to wizard-scripts as a CHANGE; a group script's R32 recipients are the administrators. Merge tranche/T31 (requirements pointer). You merge after wizard-scripts; a CHANGE follows.

## B3 · CHANGE

K1399 (from WIZARD-SCRIPTS #1 J3): in brokenScripts and submittedFor entries, version is the version number (an integer), so keys <script>@<version> use it; author is the version author's member id; refusal.translation is the row's; a retired script's submitted versions are not listed (R33's item leaves on retirement). Build R32/R33 to this; your merge still waits on wizard-scripts'.

## B4 · CHANGE

wizard-scripts is merged (K1401). Merge tranche/T31, build and test R32/R33 against its brokenScripts/submittedFor (K1397, K1399), re-run, post COMPLETE.
