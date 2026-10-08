# Plan T37

**Status** · DRAFT (prepared during T36 by BOB #136, P18). Becomes `current.md` the moment T36 closes (PROCESS-MECHANICS §5.2); BOB re-reads it then against what T36's L6–L11 left.

**Sources** · `next.md` N748–N767 (every open entry); `current.md` (T36): its "Left out of T36" table (rows whose reason ends with T36: N708, K2134), its accepted reds (rule 5: 1, 4, 7, 15, 16, 18 still open at L6, K2138), "P6 notes"; `modules.json` (order, layers); `rulings-active.md`; rulings K2064, K2074, K2075, K2079, K2084, K2090, K2099, K2100, K2101, K2108, K2118, K2122, K2124–K2138; for N708 K1804, K1819, K2110, K2131, K2133–K2135; for N669 K1793, K1804, K1869, K1883; PR #14 (DEC-178, DEC-179 `screens/words.json`, read on GitHub at `58ab1a7f34`). PROCESS-MECHANICS §5.2, §12.2; PROCESS-DESIGN P10, P18, P19.

**At T37's opening (assumed):** every T36 entry is merged (T36-1 … T36-52; T36-50 not joined, K2131); T37 opens from `tranche/T36`'s tip whether or not `main` has moved yet (K2137); PR #14 (UX-DESIGN's MERGE U123: DEC-178, DEC-179's interface word list, 923 words, 345 protected) is merged to `main` at T36's close (§5.7 (1), K2100), so "the word list does not exist" is no hard reason in T37 and N669 enters. S17's DEC is not on PR #14 (its `DECISIONS.md` records DEC-178 and DEC-179 only), so N757 keeps its reason. Still hard reasons: the new screens' shell (N672), which nothing in T36 or T37 builds; every deployment or measurement no T37 entry takes.

## Legacy census (§5.2 (2))

`modules.json` marks exactly one module `legacy: true`.

| legacy module (`modules.json`) | in T37 | entry or hard reason |
|---|---|---|
| **legacy-ui** (`civicos-ui/`; `app.html` 26,551 lines, its `.mjs`/`.js` 13,444 lines incl. tests) | stays | No T37 entry retires or touches it. Hard reasons: Bob's (UX), K633 (it stays as it is until the new interface replaces it); and a dependency not yet built: the new member screens and their shell (N672, N559). N711's re-point (T36-38) was its last share. |

## Rules at the opening

1. T36's rules hold. Merge order within a layer is `modules.json` order, except where a layer's merge-order line says otherwise. An entry below for a module T36 changes after this draft (citation in L6; every L8–L11 module) reads T36's result: its START reads the module as T36 merged it, and its wording is checked against T36's requirement text at the opening.
2. **N669 enters (the word list is on `main`).** Its packaging is BOB's (P17; K1793, K1804: "home BOB's"), fixed and recorded at the opening before L1's START: this draft places it as below (record-grammar's draft state, jurisdictions' official names and translations, skills' draft run, instance-setup's workspace and grants, their declarations, grades, help texts, routes and the library's script). K1793's instance-setup R65–R70 drafts are stale (those ids were taken by DEC-152 and K1888): every N669 requirement is BOB's new wording from DEC-127 (2), (5), DEC-157 and DEC-179. No new module (it fits existing owners). Its screens (the translation workspace) are left out (the new screens).
3. **N708 enters (K2134).** agent-runner's own sign-in in the member's container and agent-worker's relay (L6), the `subscriptionsignin` spec (op-declarations R27, N701 part) and route (control-plane), and setup-page's interim "Sign in with Claude" in the members section (N766, K2135; as setup-page R30 placed DEC-169's step, K2130). M-Q2 is measured at N708's first live run after T37's release (Bob signs in himself; never a command or a pasted token, K2135), a container fault found then fixed in that tranche. credentials R22's `subscription` retirement stays out (the order). See For BOB 1 before setup-page's START.
4. **N761 and N765 change a provider's reading before its callers move (BOB's, P17).** N761: each owner's store map (credentials L2; ratification, case-authoring, review L8; filing-templates L9; store-door L11) reads a grant's `secretSha` from the internal request's body or a header only, never the query; control-plane (L11) moves its sends last. Nothing is released between (the plane ships as one bundle), so the grant tests that drive an owner through control-plane are accepted red by name from each owner's merge until T37-33. N765: readers (answers L6, wizard-scripts and store-door L11) read `credentials`' `AI_KEPT_AWAY` (the one condition, K231); instance-setup's R55 gate answers that row and `ASSISTANT_OFF` retires; the red between each reader's merge and instance-setup's is named at the reader's START.
5. **`modules.json` edges (BOB's, P17), at each START:** none expected beyond N669's (instance-setup and skills read record-grammar's `translation` proposal state; instance-setup reads jurisdictions' official names, if it does not already use it) and N708's (setup-page reads `credentials`' account reference, if it does not already use it). Each START confirms against `modules.json`.
6. **Accepted reds expected at the opening, by name (BOB confirms them):**
   1. Coverage: every id marked `*(not yet met: T37)*`, until its module's merge.
   2. Row census (T36's red 4): rows T36's L3–L11 jobs added or re-worded stay `awaiting stamp` until T37-7; rows T37's L3–L11 jobs add stay awaiting until T38's promotion job (P4).
   3. The UI's DEC-88 tests (Bob's), carried (T36's red 7).
   4. progressions `order.test.mjs`:15 (R41; T36's red 16), until T37-12 (N752).
   5. answer-envelope `catalogue-end.test.mjs`:17 (R7, R2; T36's red 18: credentials' `NO_REASON` C-29.32 shares progressions' C-100.18), until T37-6 (N755) and T37-7's stamp.
   6. agent-runner `surface.test.mjs`:121 (R11), on a release cut only (T36's red 15), until T37-16 (N750).
   7. Any red T36's L6–L11 jobs leave open at T36's close (K2138 lists 10–13, 17, 19, 20, 22–24 as open at L6, each owed by an L8–L11 job of T36), named at the opening, or none.
   8. Rule 4's interim reds (N761, N765), each named at its owner's START.
7. **BOB's acts (no module job):** at the opening, rule 2's N669 packaging and L1's N669 requirements (record-grammar, jurisdictions), and every L1 entry's requirement change (N753, N758, N764's wording); For BOB 1–3 brought to Bob rendered, with options and a recommendation; T37's release is BOB's (K1501): cut at T37's close because its deployment lets M-Q2 be measured (N708), its deploy to biosmoke7 Bob's approval in session (K1716), M-Q2 then taken at Bob's own sign-in.

## Entries

Each line is one job (P8): every T37 entry for that module. Fields: module · (N-ids) what · rulings · `req:` the requirement change BOB writes before the layer starts · depends.

### L1

- **T37-1 · record-grammar** · (N669, its share) `PROPOSAL_STATES` gains `translation` (after `wizard`): the three sentences saying, in its state, that the wording is a draft translation of an interface word, labelled "Draft" until a member who knows the language adopts it (DEC-127 (2), DEC-157); never in signed or published bytes (DEC-127 (4)) · K1793, K1804; DEC-127, DEC-157 · req: a new R (as R42–R45), BOB's wording · depends —.
- **T37-2 · jurisdictions** · (N669, its share; DEC-157) official local names and official translations held per jurisdiction (a name or a translation an office publishes, with its source), read by the translation workspace so an official form is offered before a draft · K1804; DEC-157 · req: new Rs, BOB's wording · depends —.
- **T37-3 · bundler** · (N767) `test/system/fleetbundles.test.mjs`:219's comment says agent-worker reads `op=agentpack` (since T36-24), not `op=affordances` (AGENT-WORKER #12 J1) · K2135 · req: none · depends —.
- **T37-4 · office-readers** · (N758, its share) each `.docx` table cell (R11) names the paragraph ordinals of its text, so retrieval R74 finds a table's paragraphs exactly (vertically merged cells reorder lines today) (RETRIEVAL #14 J1) · K2118 · req: R11 amended, BOB's wording · depends —. **P6:** 3,809 on `tranche/T36` @ `9c8cc5693c`; ordinals per cell are small; the job reports if it would pass about 4,000 (a split is BOB's first, K617).
- **T37-5 · file-scanner** · (N753) `/scan` reads a target in the derived area (`area: "derived"`, `${store}/derived/<sha>`), so file-safety R33's safe copy and R11's safe view are scanned by ClamAV (until then every safe copy is withheld, `SAFE_COPY_WITHHELD`, note `not_scanned`) (FILE-SAFETY #1 J2). (N764) its tool-call failure code `CREDENTIAL_IN_ADDRESS` (`providers/net.mjs`:67) renamed, e.g. `TOOL_ADDRESS_HAS_CREDENTIAL`, since admission's C-38.10 holds that code for another condition (K231) · K2099, K2129 · req: R1–R2 amended and the code's wording, BOB's · depends —. **P6:** 2,413.

**L1 merge order:** `modules.json` order: record-grammar → jurisdictions → bundler → office-readers → file-scanner.

### L2

- **T37-6 · credentials** · (N755) `aiKeepAwaySet`'s `NO_REASON` (C-29.32, R51) re-coded to a code of its own (e.g. `AI_KEEP_AWAY_NO_REASON`), so progressions' `NO_REASON` (C-100.18) reads its own row again, clearing red 5 with T37-7's stamp (PROVENANCE #18 J2). (N761, its share) its store map reads `aicredentialmint`'s `secretSha` (`index.mjs`:2030) from the body or a header, never the query (rule 4). (N765, its share) the `AI_KEPT_AWAY` row (R35) is the one row instance-setup R55's gate answers: credentials provides the helper (or the row's `where` names the second site), BOB's wording fixing which (K231) · K2101, K2129, K2130 · req: R51 re-worded, the store-map read, R35's helper, BOB's wording · depends —. **P6:** 2,689. Not here: N708's R22 `subscription` retirement (left out, the order).
- **T37-7 · promotion** · (T36's red 4) stamps every row awaiting stamp at T36's close (the rows T36's L3–L11 jobs added or re-worded, among them file-safety's C-140 family, standards' C-112.59–.62, case-authoring's `STANDARDS_USE_REFUSED` C-136 row, admission's C-38.10, C-38.11, instance-setup's and installer's new rows) and the rows T37's L1–L2 jobs add or re-code (T37-5's renamed code if a row carries it, T37-6's re-coded C-29.32). (N754) moves acquisition's archive rows C-137.1–.19 to C-139.1–.19 in `gate.mjs`:757–758 and stamps C-139.20 `NOT_AN_ARCHIVE` (ACQUISITION #13 J1). (N755, its share) stamps the re-code. So `test/system/row-census.test.mjs` is green; the catalogue version moves, any pinned digest moves in its owner's job · K1542, K1545, K1855, K2027, K2100, K2101 · req: none (a stamp) · depends T37-6. **P6:** 3,443 (its table grows by rows, not logic).

**L2 merge order:** credentials → promotion last (it stamps the layer's rows). Then T36 rule 7's regeneration order (`case-checker/program.mjs`, the plane bundle).

### L3

- **T37-8 · file-safety** · (N762, its share) offers its own due and wake for `scanBatch`, `renderBatch`, `deeperBatch`, `forwardSecurityCounts`; an arming notice when a check is queued; a reputation-list refresh service (`file-scanner` R26, with the tool's credentials); R15 `scanFindings` gains `since` (N741's shape) for notice-producers R14 (K2130). (N753, its user) a test that a safe copy whose derived-area scan answers `clean` is released (R33), now that T37-5 scans it · K2099, K2129, K2130 · req: new Rs, R15 amended, BOB's wording · depends T37-5 (L1). **P6:** 1,971.

### L4

- **T37-9 · reading-pipeline** · (N758, its share) R28 carries each `.docx` cell's paragraph ordinals as office-readers R11 emits them (T37-4); a test on a vertically merged table · K2092, K2118 · req: R28 amended, BOB's wording · depends T37-4 (L1).
- **T37-10 · content** · (N759) `extentRelation` (R6) relates sheet-range and doc-table extents by their cells: a cell inside a range answers `narrower`, two ranges compare, a doc-table cell inside its table `narrower`, so a fact recorded at one cell of a found column is named on that column's result (retrieval R73) (RETRIEVAL #14 J2 (a)) · K2122 · req: content R6 as stated (a flaw), tests · depends —. **P6:** 3,712; the cell relations add perhaps 100–200: the job reports if it would pass about 4,000.

**L4 merge order:** `modules.json` order: reading-pipeline → content.

### L5

- **T37-11 · events** · (N760) a hub's vote events read in pages, not node by node (its per-node read ~1.7 ms leaves explore R20's M-X1a at 8.1–8.5 s of 10 s through the real owner), with a test at the 4,000-vote shape (EXPLORE #3 J2) · K2119, K2127 · req: none (R35 and K2119's page rule hold; a Suggestion names the margin) · depends —.
- **T37-12 · progressions** (test only) · (N752) `test/m/progressions/order.test.mjs`:15 (R41) reads layer 5's order from `modules.json` (as membership's R83 test does), clearing red 4 (MEMBERSHIP #27 J2) · K2090 · req: none · depends —.
- **T37-13 · retrieval** · (N758, its user) R74 finds a `.docx` table's paragraphs by the cells' ordinals (T37-4, T37-9), not by matching cell lines in order; a test on a vertically merged table. (N759, its user) a test that a fact recorded at one cell of a found column is named on that column's R73 result through content's relation (T37-10) · K2118, K2122 · req: R74 amended, BOB's wording · depends T37-9, T37-10 (L4). **P6:** 3,484; the job reports if it would pass about 4,000.

**L5 merge order:** `modules.json` order: events → progressions → retrieval.

### L6

- **T37-14 · skills** · (N669, its share) the assistant drafts a missing interface word on the account serving that member (K1755), labelled "Draft" (T37-1), from DEC-179's word and its meaning note; never a protected word's final form (DEC-157 (4): a second granted speaker or an administrator's back-translation check); nothing while keep-away is on (credentials R35) · K1755, K1793; DEC-127, DEC-157, DEC-179 · req: new Rs, BOB's wording · depends T37-1 (L1). Reads T36-22's result.
- **T37-15 · answers** · (N765, its share) reads `credentials`' `AI_KEPT_AWAY` where it reads `ASSISTANT_OFF` today (rule 4) · K2130 · req: wording of its reads, BOB's · depends T37-6 (L2). Reads T36-23's result.
- **T37-16 · agent-runner** · (N708, its share; DEC-156) the hosted, unmodified Claude Code's own sign-in started for a member in that member's own container instance (AT-14), Anthropic's address handed to the member, the code from Anthropic's page delivered to that sign-in's prompt (AT-26), the result stored by the binary where it runs (AT-27), serving only that member (K1547, K1755), never read, copied or stored centrally (K1819); AT-14's Commercial Terms condition; U-7 (a)–(d) kept open. (N750) `surface.test.mjs`:121 (R11) judges the unpublished `wrangler.jsonc` form only where it holds (never on a release cut), clearing red 6 · K1804, K1819, K2074, K2134; DEC-156 · req: new Rs, BOB's wording (T35-49's N678 text) · depends —. M-Q2 at its first live run (rule 3).
- **T37-17 · agent-worker** · (N708, its share) relays the member's sign-in to their own runner instance (T35-50's N678 share) · K1819, K2134 · req: BOB's wording · depends T37-16. Reads T36-24's result.

**L6 merge order:** `modules.json` order: skills → answers → agent-runner → agent-worker.

### L8

- **T37-18 · publication** · (N763, its share; only if For BOB 2 finds it BOB's) R72 freezes each criteria row's `captures`, so case-checker R22 judges `COPYRIGHTED_TEXT_CARRIED` offline · K2129 · req: R72, BOB's wording · depends —. Reads T36-26's result. **P6:** 3,717 before T36-26 (which lowers it); the job reports its size.
- **T37-19 · ratification** · (N761, its share) its store map reads a grant's `secretSha` (`index.mjs`:1475) from the body or a header, never the query (rule 4) · K2129 · req: the store-map read, BOB's wording · depends T37-6 (L2, the pattern). **P6:** 3,530; net about zero.
- **T37-20 · case-checker** · (N763, its share; as T37-18) R22 judges `COPYRIGHTED_TEXT_CARRIED` offline over the frozen `captures`; `program.mjs` regenerated at the close · K2129 · req: R22, BOB's wording · depends T37-18. Reads T36-51's result.
- **T37-21 · case-authoring** · (N761, its share) its store map reads `secretSha` (`index.mjs`:2355) from the body or a header, never the query · K2129 · req: the store-map read, BOB's wording · depends —. Reads T36-28's result. **P6:** 3,365.
- **T37-22 · review** · (N761, its share) its store map reads `secretSha` (`index.mjs`:778–782) from the body or a header, never the query (its comment at :769 re-worded) · K2129 · req: the store-map read, BOB's wording · depends —.

**L8 merge order:** `modules.json` order: publication → ratification → case-checker → case-authoring → review. T37-18 and T37-20 drop together if For BOB 2 goes to Bob and he has not ruled by L8's START (then left out: a question that is Bob's).

### L9

- **T37-23 · filing-templates** · (N761, its share) `templateReviewGrant` and its door read `secretSha` from the body or a header, never the query · K2129 · req: the store-map read, BOB's wording · depends —.

### L10

- **T37-24 · scheduler** · (N762, its share) R24 reads `file-safety`'s own due and wake (T37-8) and the reputation-list refresh; its two carried intervals leave (R7, K2129 option B ends) · K2129, K2130 · req: R24, R7, BOB's wording · depends T37-8 (L3). Reads T36-29's result. If the plane's composition must hand scheduler something new, that is named at this START and joins as a plane share at L11 (K279), not counted below.

### L11

- **T37-25 · wizard-scripts** · (N765, its share) R24 reads `AI_KEPT_AWAY` where it reads `ASSISTANT_OFF` (rule 4). (N669, its share) the library's optional "Translate the interface" script, withheld until its ops exist (K1883), is offered once T37-30's ops are declared · K1869, K1883, K2130 · req: R24, BOB's wording · depends T37-6. Reads T36-52's result.
- **T37-26 · op-grades** · (N669) grades `translationgrant` (administrators), `translationdraft`, `translationadopt`, `translationconfirm`, `translationrevert` (a granted member; the protected set's confirm a second granted speaker or an administrator, DEC-157) · K1957; DEC-157 · req: BOB's wording · depends —. Reads T36-30's result. (`subscriptionsignin` is graded since T35-66.)
- **T37-27 · affordances** · (N669, N708) `ACT_HELP` (R48) gains the explanation of each new op where the design stream's `mock-acts.js` has it; one it lacks is named in op-declarations' test with why (T36-35's rule) · DEC-174 (3) · req: R48, BOB's wording · depends —. Reads T36-31's result.
- **T37-28 · notice-producers** · (N762, its share) R14 reads `scanFindings` with `since` (T37-8) · K2130 · req: R14, BOB's wording · depends T37-8 (L3). Reads T36-32's result.
- **T37-29 · setup-page** · (N708, its share; N766, K2135) the members section offers a member "Sign in with Claude", starting the own sign-in (T37-16, T37-17) through `subscriptionsignin`, until the new screens do (as R30 placed DEC-169's step) · K2134, K2135; DEC-156 · req: a new R, BOB's wording · depends T37-16, T37-17 (L6); For BOB 1 answered first. Reads T36-33's result.
- **T37-30 · instance-setup** · (N765) R55's gate answers `credentials`' `AI_KEPT_AWAY` row (T37-6); `ASSISTANT_OFF` and its row retire (K231). (N669, its share; DEC-127 (2), (5), DEC-157) the group's translation workspace over DEC-179's word list: per-language grants to named members (`translationgrant`, administrators); a draft (`translationdraft`, T37-14) or a typed word adopted (`translationadopt`); the protected set (DEC-179's 345) changed only with a second granted speaker or an administrator's back-translation check (`translationconfirm`); an adoption record with one-act undo (`translationrevert`); members' "looks wrong" marks; official names and translations from jurisdictions (T37-2) offered first; screens falling back word by word to English (R64). (N756, if T36-34 left it) `setup.mjs`:1272 reads `provenance.receiptsOfCapture` (R60) · K1793, K1804, K2101, K2130; DEC-127, DEC-157, DEC-179 · req: R55 and new Rs, BOB's wording · depends T37-1, T37-2 (L1), T37-6 (L2), T37-14 (L6). Reads T36-34's result. **P6:** 2,519 before T36-34; the workspace adds perhaps 500–800: the job reports if it would pass about 4,000.
- **T37-31 · op-declarations** · (N708; N701, its share) declares `subscriptionsignin` (the op behind `owed:subscriptionsignin`) and R27 lists it; (N669; N701, its share) declares the five translation ops and their reads, and R27 lists `translationconfirm` (R27's T36 sentence retired) · K1869, K2130; DEC-156, DEC-157 · req: R27, new Rs, BOB's wording · depends —. Reads T36-35's result. **P6:** 3,092 before T36-35 (which adds 26 declarations): the START measures it; past about 4,000 a split is BOB's first (K617).
- **T37-32 · store-door** · (N761, its share; R9) the door's grant reads take `secretSha` from the body or a header (rule 4). (N765, its share) R10 reads `AI_KEPT_AWAY` where it reads `ASSISTANT_OFF` · K2129, K2130 · req: R9, R10, BOB's wording · depends T37-30. Reads T36-48's result.
- **T37-33 · control-plane** · (N761) a review or template grant's `secretSha` reaches the store's internal request in its body or a header, never its query (`index.mjs`:209, :645), as a new R (F1's rule for digests; R60 is taken, K2130), clearing rule 4's N761 reds. (N762, its share) may `arm` file-safety after `deepercheck` and `safecopy`. (N708) routes `subscriptionsignin` to the member's own runner (agent-worker's relay). (N669) routes the translation ops to instance-setup · K1874, K2129, K2130, K2134 · req: a new R for N761, routes, BOB's wording · depends T37-30, T37-31, T37-32. Reads T36-37's result. **P6:** 3,025 before T36-37 (which adds the 23 file-safety routes and R60–R63): the START measures it; past about 4,000 a split is BOB's first (K617).

**L11 merge order:** `modules.json` order: wizard-scripts → op-grades → affordances → notice-producers → setup-page → instance-setup → op-declarations → store-door → control-plane (last: rule 4's callers move after their providers).

## Left out of T37 (one hard reason each)

| entry | item | hard reason |
|---|---|---|
| N748 (N592) | the investigation engine's requirements (stages 1–2; Bob's plan construct, K2075) | Bob's (P17): D1–D4, D6–D8, D12–D14, D16–D24 open with him (K2064); the INVESTIGATION-DESIGN lane maps K2075 first |
| N751 | doctypes R35's out-of-sample measure for coordinator, review_due, revision_cycle | a measurement: no fresh policies exist beyond the 74 read (K2079) |
| N757 | S17: the obscured, labelled copy of a visit's photo in a published case; the reminder when a photo is taken | a dependency not yet built: S17's DEC is not on `main` (PR #14 does not carry it); the reminder's surface is the new screens' (N672). See For BOB 3 |
| N708 (part) | credentials R22's `subscription` kind retired | the order (P4): its replacement is built in T37's L6 (T37-16, T37-17), after credentials' L2 |
| N708 (M-Q2) | M-Q2 on biosmoke7 (cold and warm container starts, egress) | a deployment and measurement: at N708's first live run after T37's release, Bob signing in himself (K2134, K2135) |
| N669 (screens) | the translation workspace's screens; the "looks wrong" mark's surface | a dependency not yet built: the new screens' shell (N672) |
| N670 | DEC-127 (3), (6): "read in my language" on notes, questions, findings and notices; offering a translation to Civicsmith's library | the order (P4): it reads translations held, which N669 builds in T37's L11 (T37-30), after the note, question and finding owners' layers |
| N551 (part) | the welcome and first-question wizards ordering what they offer by the self-description | a dependency not yet built: the wizard runner |
| N559 | DEC-138's stylesheet, fonts and icons for the member screens | a dependency not yet built: the new member screens (UX step 5) |
| N563 | money-checks M-C8 on a gold set of payments | a measurement: no gold set (K1506) |
| N572 | DEC-140's "Show me where" | a dependency not yet built: the wizard runner |
| N579 | contradiction's K6 prompt arm | a measurement (K1601 (3)) |
| N632 | jurisdictions' institution registry | a measurement: none measured |
| N641 | acquisition's NISO STS import (ST10) | a measurement: no NISO STS source for a standard Oakland adopts |
| N643 (part) | the vendor-model base with local changes (PO16) | a measurement: no vendor manual and update packet captured |
| N645 (part) | machine-raised "Noticed" disparities | a measurement: no gold set of discretion acts (K1491, K1504) |
| N647 | the Legal/Policy Lookup's policy and standard proposals (skills, answers) | a dependency not yet built: investigate mode (VF-4) and the member's account live (R-2 L-E5) |
| N650 | case-import's shared policy and standard sets | a dependency not yet built: LAW L5's pack path |
| N652 (part) | following whole policy portals and standards' new editions | a measurement: the sites' terms and fetch volume |
| N654 | membership's read of the website key's and join link's settings and history | a dependency not yet built: the key and link screens |
| N666 | a group's own place's rules | Bob's (DEC-151): after the first public release |
| N672, N673 | the path, tips, cards, links, explanation levels and `owed:infolevelset` (DEC-154, DEC-159–DEC-163); the rail's width (DEC-155) | a dependency not yet built: the new screens' shell |
| N683 | "Publish at…" in R34's step 5 | a dependency not yet built: its surface is the new screens' (N672) |
| N688 (part) | the archive screen (DEC-167; U96) | a dependency not yet built: the new screens |
| N698 (part) | the "Find in this" screen and its "Found by search" mark | a dependency not yet built: the new screens |
| N698 (part) | DEC-164 (8): the assistant's proposals search cannot match | a measurement: the capability ladders' extract rung |
| N703 (part) | the Settings › Security screen (DEC-165) | a dependency not yet built: the new screens |
| N703 (part) | Cloudflare's blocked-request counts | a deployment or measurement: a zone and a read token per group's plan (`study-cloudflare-security.md` §3) |
| N710, N714 (screens), DEC-169 | "Opening a file", Settings › Security › Security tools | a dependency not yet built: the new screens |
| N719 (part) | `personexpunge`'s dialog readable on a phone | a dependency not yet built: the new screens (N672) |
| N721 (part) | the Settings › The assistant screen (DEC-171) | a dependency not yet built: the new screens |
| N726 (part) | DEC-174's display and DEC-175 | a dependency not yet built: the new screens' shell (N672) and `infolevelset` (N673) |
| N728 (screens) | the money screens (U108–U115) | a dependency not yet built: the new screens' shell (N672) |
| N732 | DEC-176: a table's rows acted on in place | a dependency not yet built: the new screens |
| N734 | DEC-177: one visual element, one explanation | a dependency not yet built: the new screens |
| N735 (screens) | the Spot-check's screens and help pages (DEC-178's wording among them) | a dependency not yet built: the new screens' shell (N672) |
| N747 | a screen promoting an acquired document skips one marked `promoted` | Bob's: UX (the design stream; `legacy-ui` frozen, K633, K1849) |

**Carried from T36 and earlier** (`current.md`'s T36 table and the archived left-out tables): the measurement, real-group, Bob's UX, dependency, trigger and deployment rows keep their reasons unchanged; BOB re-reads them at the opening.

**Closed without a T37 entry:** N766 (superseded by K2134; its setup-page share is T37-29, M-Q2 the row above). N756 if T36-34 applied it (else in T37-30). F1's tail (in T36 under rule 7 (b), K2111).

## Entries carried from `next.md` (N748–N767) and T36's table

Wholly in T37: N750, N752, N753, N754, N755, N758, N759, N760, N761, N762, N764, N765, N767. In part: N708 (R22's retirement and M-Q2 out), N669 (screens out), N701 (its `subscriptionsignin` and `translationconfirm`, T37-31). Conditional: N763 (For BOB 2), N756 (if T36-34 left it). Left out: N748, N751, N757, N670. Superseded: N766.

## P6 notes

Measured on `tranche/T36` @ `9c8cc5693c` (L6 running; K1821's rule: own code in `paths`, tests excluded). Near about 4,000 if T37's jobs add as planned: **office-readers** 3,809 (+ ordinals), **content** 3,712 (+ cell relations), **publication** 3,717 (T36-26 lowers it; + R72's freeze if it joins), **ratification** 3,530 (net about zero), **retrieval** 3,484, **promotion** 3,443 (rows), **case-authoring** 3,365 (net about zero), **op-declarations** 3,092 and **control-plane** 3,025 before T36-35 and T36-37 add the file-safety package's 23 ops: both are re-measured at the opening, and either past about 3,800 then is split by BOB before its T37 job adds (K617). **instance-setup** 2,519 before T36-34 (+ N669's workspace). Each job reports if it would pass about 4,000.

## Summary

**Jobs per layer:** L1 5, L2 2, L3 1, L4 2, L5 3, L6 4, L7 0, L8 5, L9 1, L10 1, L11 9. **Total 33** (T37-18 and T37-20 conditional on For BOB 2; a plane share possible at L11 from T37-24, not counted).

## For BOB (meaning that might be Bob's; not decided here)

1. **N708 / N766: does a "Sign in with Claude" on the setup page meet Bob's bar?** Bob (K2135): "we'll wait until we have full, non-technical support for that before I sign into my account". N766 reads that as a clickable sign-in in the setup page's members section until the new screens. But DEC-156's flow (AT-26) has the member paste the code Anthropic's page shows into "The code from Anthropic's page", and K2134 says Bob does not paste a token. Whether that paste is "non-technical" enough, and whether an interim setup-page control is acceptable to him, is UX: Bob's. Building T37-16, T37-17 and T37-29 is safe either way; only M-Q2's timing turns on his answer. Recommendation: show him the step rendered (the page, the button, the code box) before L11's START.
2. **N763: the edition stating digests of captures it does not carry.** Freezing a criteria row's `captures` puts in a published edition the SHA-256 of each source a criterion relied on, including copyrighted captures the edition withholds. Anyone holding a document can then confirm the group held it. If that discloses only what the edition already cites, it is BOB's (wording); if it reveals material the group did not choose to publish, it is legal exposure or values: Bob's. BOB weighs first; if Bob's, T37-18 and T37-20 leave with that reason.
3. **N757 / S17: how faces and number plates are obscured.** Bob ruled the outcome (K2108); the DEC is not yet written. Whether obscuring is automatic (a vision model on the group's photos: an AI use on group material, with keep-away and cost) or members mark what to obscure is the design stream's to write and may carry money or keep-away questions that are Bob's. Nothing for BOB to decide; ask the design stream on the channel to record S17's DEC with that point stated.
4. **N748:** unchanged: D1–D4, D6–D8, D12–D14, D16–D24 and K2075's plan construct are open with Bob.

Not Bob's (BOB's, P17, settled at the opening and reported): N669's packaging (rule 2); N761's and N765's provider-first order and their interim reds (rule 4); T37's release cut for M-Q2 (rule 7).
