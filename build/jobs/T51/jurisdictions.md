# jurisdictions (T51)

**Status** · session_01AfTJJunnDTjUWKse11VPbW · depth 2 · COMPLETE · handled B6

## J1 · REPORT

The words check (`checks/words.mjs`, run through `checks/run.mjs`) reports 2815 findings across the repository, all outside `jurisdictions`. The bulk are in other modules' tests (for example `wizard-scripts` test copy lines), and more in their inline sentences. None is in `jurisdictions/`, so nothing here needs a decision from this job. Not fixed here: those modules are not mine (P9). BOB should route them to each module's own job. The `jurisdictions` findings are zero.

## J2 · COMPLETE

Entries applied: T51-170, the six words-check findings in `jurisdictions/index.mjs`, each now read through `localize` with a string-literal id and English text. Interpolated values pass as named variables. The "listed twice" holiday message is split into four whole sentences (no stitched fragments). The one flagged text that used a placeholder-shaped token (`{citation}`) is reworded, because `localize` would otherwise throw WORD_VAR_MISSING on it. Commit 318827cf6c on job/T51/jurisdictions.

New tests: `jurisdictions/test/t51.test.mjs` (5 tests), each naming its id, checking the refusal's code and path, the values its detail carries, and a well-formed control. No test holds a sentence's text.

Deferred: none. Found in another module: none in `jurisdictions`; the repo-wide words findings in other modules are in a separate REPORT.

Tests and checks:
- `node --test jurisdictions/test/`: 155 tests, 155 pass, 0 fail.
- `node checks/format.mjs /home/user/bio`: 174 modules, 173 requirements files; 0 failures.
- `node checks/architecture.mjs /home/user/bio jurisdictions`: 17 product files; 0 failures.
- `node checks/coverage.mjs /home/user/bio jurisdictions`: 94 of 94 live requirement ids named by a test; 0 failures.
- `node checks/ownership.mjs /home/user/bio jurisdictions tranche/T51 job/T51/jurisdictions`: 3 files changed; 0 failures.
- `node checks/run.mjs /home/user/bio`: words check shows no finding for `jurisdictions`. The repo-wide words check reports 2815 failures elsewhere (see the REPORT).

Size (session_01AZpJJo3TrPbwZo9jEzUze1): test runs 3, module lines 3731 (index.mjs 2202 + profiles 1529).

## J3 · REPORT

K3957 plain findings in jurisdictions/index.mjs: 113 listed. Eleven are now localized (commit 942a00744f): the conflict notes `combine` gives when profiles disagree, and the three "named" fragments in them. The remaining 102 are left as plain text, for the design's unkeyed list (K3944). Each is a diagnostic: the `detail` of an error that `validate` (R10) returns, or the detail of `combine`'s NOT_A_LIST error (line 1653). These go to the author of a place's profile data, who fixes the file and reruns the check, not to a member reading a page. Lines (current file): 286 291 293 294 299 322 328 359 364 367 371 372 382 389 399 404 410 423 454 498 513 521 541 584 636 660 729 743 758 770 771 780 781 786 803 812 821 822 836 837 856 859 863 864 866 869 874 876 879 880 885 887 949 950 966 967 977 985 988 989 1009 1011 1013 1017 1018 1038 1039 1046 1049 1050 1089 1090 1095 1096 1102 1122 1133 1134 1141 1173 1176 1194 1207 1244 1261 1270 1283 1284 1286 1292 1359 1380 1420 1426 1430 1434 1436 1450 1500 1537 1541 1653.

Two points for BOB to settle with the design stream:
1. Whether validate's details reach any installer or member surface. If they do, the 102 move to localize, with a test naming each id. I have not verified every consumer; I judged by R10, which names the author as reader.
2. Consistency: the six validate diagnostics I localized earlier (T51-170, first pass, K3949: lines 704, 847, 894, 897, 1143, 1317) are of the same kind as these 102. I left them localized, since BOB's first-pass instruction was to fix every one. If you rule the diagnostics unkeyed, those six can go back to inline text.

## J4 · COMPLETE

CHANGE B2 (K3957) processed: tranche/T51 merged into job/T51/jurisdictions; civicos-process at 27aa50e.

Entries applied: the 113 plain findings in build/plan/words-pass/jurisdictions.md, judged as the CHANGE asks.
- 11 localized (conflict notes from combine and their named fragments): ids jurisdictions.index.{minutes_due_conflict, locale_conflict, time_zone_conflict, records_help_conflict, weekend_conflict, instrument_key_conflict, family_dropped_from_view, who_issues_undetermined, receipt_on_closed_day, local_day_undetermined, named_identifiers, named_within, named_body_variants}. Each English text is unchanged. Commit 942a00744f.
- 102 reported (REPORT J3): validate's error details for a profile's author, and combine's NOT_A_LIST detail. The words check still shows them under the inline arm, as the CHANGE allows.
- The six earlier validate diagnostics (K3949) stay localized; see the REPORT for the consistency point.

New tests: jurisdictions/test/t51-conflicts.test.mjs (11 tests, one per conflict id; each drives a real disagreement through combine and checks the field and its note, with an identical-profile control).

Deferred: none. Found in another module: none new (the repo-wide words findings in other modules are as in J1).

Tests and checks (after commit 942a00744f):
- node --test jurisdictions/test/: 166 tests, 166 pass, 0 fail.
- checks/format.mjs /home/user/bio: 174 modules, 173 requirements files; 0 failures.
- checks/architecture.mjs /home/user/bio jurisdictions: 19 product files; 0 failures.
- checks/coverage.mjs /home/user/bio jurisdictions: 94 of 94 live requirement ids named by a test; 0 failures.
- checks/ownership.mjs /home/user/bio jurisdictions tranche/T51 job/T51/jurisdictions: 2 files changed; 0 failures.
- checks/run.mjs /home/user/bio: the words check shows no finding in jurisdictions except the 102 REPORTed in J3 (inline arm). Repo-wide: 4833 failures, all outside this module.

Size (session_01AZpJJo3TrPbwZo9jEzUze1): test runs 6, module lines 3731 (index.mjs 2202 + profiles 1529, before this CHANGE; this CHANGE adds about 22 lines to index.mjs).

## J5 · COMPLETE

Fix round 3, cause C64 (ENTITIES #18's finding (a); DEC-402; K4407): **jurisdictions R95 met.**

Entries applied: the first profile's federal Freedom of Information Act (`level: federal`, 5 U.S.C. § 552) was already a `records_laws` entry with eight stages and its requesters (T33-2, T45), but it rested on law.cornell.edu and `2026-10-05 time-law`, which is not the official text. I re-read § 552 live today on the official United States Code, 2024 Edition, as govinfo.gov prints it (uscode.house.gov answered "Page Not Found" for its section address today; sha256 b1fad0a2…23de in `jurisdictions/test/fixtures/foia-text.mjs`), checked every stage's citation and the requesters' citation against the subsections, and changed: the law's `basis` and the requesters' `basis` to `2026-10-21 foia-text` (status `researched`); the `appeal` stage's citation to `5 U.S.C. § 552(a)(6)(A)(i)` (the right to appeal to the agency head, not less than 90 days, is stated in clause (i)(III)(aa); clause (ii) is the appeal's own decision, which is the `appeal_decision` stage). Stages, labels and the other citations were found right and are unchanged. The test profile is unchanged (R36 needs nothing).

Tests: `jurisdictions/test/t51-foia.test.mjs` (2 tests), R95: the first test was seen failing first (basis was `2026-10-05 time-law`, expected `2026-10-21 foia-text`) and passes now; it checks the entry, its eight stages in order, requesters `researched`, the source is a govinfo.gov or uscode.house.gov address with a 64-hex capture hash, and every cited subsection is one the fixture's quotes hold. The second checks the first profile validates, a kind naming "Freedom of Information Act" is accepted, and the control: an unlisted law ("Freedom of Information Act (unlisted)") is refused with LAW_UNKNOWN at `action_kinds[0].laws[0]`. One existing line of `t45.test.mjs` (R85's loop over `records_laws` requesters) now expects the federal law's requesters basis to be `2026-10-21 foia-text`; it is a superseded measurement, not a weaker check.

Runs: `node --test --test-force-exit jurisdictions/test/`: 155 tests, 155 pass, 0 fail. Users of the profile: actions 148/148, action-clocks 86/86, filings 157/157, standards 110/110, instance-setup 217/217, all pass. `site/build.mjs --check`: `pages.mjs` is fresh. Checks: format 0 failures; architecture (jurisdictions) 0 failures; ownership 0 failures (5 files changed by jurisdictions); coverage: jurisdictions not among the 7 failing modules; words: 5 findings, none in jurisdictions (op-grades and screens-inquiry; red on the tranche tip, named, not fixed).

Deferred: none. Not mine, found: (1) the plane and fleet bundles are stale against the tranche tip (`fleetbundles.test.mjs` fails with STALE BUNDLE on `tranche/T51` itself, agent-worker among them); and they embed the first profile, so BOB's regeneration at the layer close picks this change up (manifest §14). (2) coverage reds on the tranche tip: agent-harness R17, agent-runner R37 R38 R40, control-plane R117 R118, installer-steps R26 R31, journey-check R19, op-grades R53, screens-publish R74 R75 R77 R78 R79. (3) `R95` of jurisdictions still reads "*(not yet met: T51)*" in `build/requirements/jurisdictions.md`; BOB removes it. Census ops: none owned. Proposed line for BOB: none further.

Size (session_0194frecaoH7BeRExWJzuGjv): test runs 9, module lines 3727

## J6 · QUESTION

STEP 0 for C64-template and C64-law (jurisdictions side). Read live on tranche/T51 merged into my branch. I need two requirement lines from you before I build; my best reading is in each.

**C64-template, root cause (the empty draft).** The first profile's `records_request` kind holds no `template` or `templates` (R45: none until approved, K921 Q1). With no named template and no profile template, `filings.filingPrepare` (bio-plane/src/filings/index.mjs, the `!named && !profileTpl` branch) answers `TEMPLATE_NOT_NAMED` ("the profile holds no file template for this kind"), so the box stays empty. `filing-templates.templatesFor({kind, use:"file"})` is by kind, never by law: no template anywhere is federal. Nothing in `jurisdictions` is wrong; the profile is silent by R45.
Options: (a) a federal profile template: R40 requires `authored_by` and `approved_by` (two different people), `reviews`, `approved_at` and a K-basis. That is an approval only you can give, and the schema picks templates by kind, not law (R81 would need `law`). (b) No profile template: the fix is screens-action's (it must send only the fills the typed text names, which also clears the "blank the text does not have" refusal, and say in words that no team template exists). **Recommend (b)**; no `jurisdictions` change for C64-template.

**C64-law, root cause (certain).** Three facts, two of them outside my module.
1. screens-action's law picker (`request.mjs`, `P.laws`) lists the profile's `deadlines` for `records_request`, not its `records_laws`. So the member picks "5 U.S.C. § 552(a)(6)(A)(i)" or "(A)(ii)" as if they were laws, and the walker's pick (A)(ii) is the *appeal* rule `foia_appeal_response`. The first-request window is (A)(i), `foia_response`. Your plan and R9 line say "(A)(ii)" for a first request. That conflates the two, so please confirm the target is (A)(i) for a first request.
2. `help-records` reads the CPRA by rule key (`d.rule === "records_response"`), and the first profile holds no `records_help` (R93: owed, N1201). So every law's help is California's.
3. A deadline has only a `rule` key and no words, so the due-date line draws `foia_appeal_response` raw.

**What I propose (new lines for you to write; I build them on your word):**
- **R96** (amends R7, R76) A `records_laws` entry may carry `response`: the `rule` of the `deadlines` entry that is the law's first-request window, which must exist and apply to `records_request`, else `VALUE_INVALID`. The first profile sets it: CPRA `records_response`, Sunshine Ordinance `immediate_disclosure`, FOIA `foia_response`. One value per key under the law's `name` (R15). A screen then draws a law's window from its own `response` row and never guesses.
- **R97** (amends R26) A `deadlines` entry may carry `label`: the rule's name in the profile's words (FOIA: "answer to a first request" for `foia_response`, "decision on an appeal" for `foia_appeal_response`, each read from the same statute text as R95). One value per key under `rule` and `applies_to` (R15). Absent, the screen has no words and says so (R27).
Tests: both validate and combine; the first profile's FOIA entry names `foia_response` whose citation is (A)(i); control: a `response` naming no deadline is refused.

**For screens-action (S), to put in its START:** list `records_laws`, not deadlines; take a law's window from `response`, the kind from `label`; show the help's `records_help` block only when `block.law` is the chosen law, and otherwise the first sentence from the law's `response` (days, citation) and no California text, no "the city". I cannot do these. They are in `bio-plane/src/screens-action/`.

Waiting for R96 and R97 (or your changes to them) and your choice of (a) or (b).

## Fix round 4 (START B4): C64-law, C64-template — jurisdictions' part

**C64-template.** (1) Root cause, reported at step 0 (J6) and released by BOB (B5, option b): the first profile's `records_request` holds no template (R45), so `filings.filingPrepare` answers `TEMPLATE_NOT_NAMED`; the refusal on typed text comes from screens-action sending fills the text does not name. No `jurisdictions` change; screens-action carries the cure (K4438). (2) Test gap and (3) failing-first test: screens-action's (S). (4) N.

**C64-law.** (1) Root cause: the law picker lists deadlines (not `records_laws`), help-records reads the CPRA by rule key, and a deadline has no words. BOB corrected the target to (A)(i) `foia_response` (B5). (2) Missed because no federal fixture existed; `t51-response.test.mjs` is it at this interface. (3) `jurisdictions/test/t51-response.test.mjs`, 3 tests naming R96 and R97, red first (stashing the module and profile changes: 0 pass, 3 fail), then green (3 pass); controls: a response naming no deadline, a non-records rule, a non-string and an empty label are refused; combine withholds a disagreeing label or window. (4) N.

Built: R96 `response` on a records law (validated against the profile's `records_request` deadlines; one value per law name in `combine`; set for the CPRA `records_response`, the Sunshine Ordinance `immediate_disclosure`, FOIA `foia_response`; test profile `records_answer`). R97 `label` on a deadline (FOIA "answer to a first request" / "decision on an appeal"; test profile one). One new word key `jurisdictions.index.response_is_the_rule_of_a_deadline`.

Deferred: none. Found in another module: none new; screens-action is told in its START.

Tests and checks: `node --test --test-force-exit jurisdictions/test/` 171 tests, 171 pass. Users (`impact.mjs origin/tranche/T51 HEAD`): screens-investigate 19/19, screens-publish 17/17, screens-action 24/24; control-plane 355 pass, 1 fail (R81 end to end), identical on the tranche tip; plane 41/43, installer 8/15 and journey-check 1/16 are missing `node_modules` (playwright-core), not this change. checks: format, architecture clean; coverage 97 of 97 ids named; words 0 findings for jurisdictions (4 remain in `op-grades`, not mine); ownership 5 files, 0 failures.

Questions: J6, answered B5 (none open). Requirement ids met: R96, R97 (and R95 still).

Size (session_018LcUE19WD2qKmGoB8yDoXA): test runs 14, module lines 3741

## J7 · COMPLETE

COMPLETE (fix round 4, wave 1 #9): C64-law provider half built and C64-template needs no jurisdictions change (J6/B5). R96 (response) and R97 (label) built; failing-first test jurisdictions/test/t51-response.test.mjs red 0/3, green 3/3. Suite 171/171; coverage 97/97; ownership 0 failures; words 0 for jurisdictions. Users: screens-action 24/24; control-plane has one failure identical on the tranche tip; plane, installer, journey-check lack node_modules. No open question. Record: build/jobs/T51/jurisdictions.md.

## J8 · COMPLETE

COMPLETE (fix round 4, C8, K4477): the first profile's `fiscal_year` (R49), data only.

Changed: `jurisdictions/profiles/oakland-alameda.mjs` (after `computation`): `fiscal_year` for Finance Department, Oakland City Council and Office Of The City Auditor (City of Oakland: start 07-01, named_by start, label `FY{start}-{end2}` = FY2025-26, basis `2026-10-22 oaklandca.gov-fy2025-27-budget`: its page says "New fiscal year 2025-2026 begins on July 1", cycle "July 1, 2025 through June 30, 2027", years written "FY 2025-26"), and for Alameda County Civil Grand Jury (the county's budget press release: "The new budget goes into effect from July 1, 2024, to June 30, 2025"; Board letter "Fiscal Year (FY) 2025-26 Final Budget"; read 2026-10-22). Left out, said so: the State Controller's Office (no page of its own read) and `*`; a figure recorded with no body on this profile still gets no year. Note: the profile has no county body except the Civil Grand Jury, so the county's entry sits on it.

Failing-first: `jurisdictions/test/t51-fiscal.test.mjs` (2 tests, R49) red before the data (`combine` view had no fiscal_year: 0/2), green after (2/2). Money's `MONEY_BAD_PERIOD` came from exactly this absence; money's own suite (92/92) and the fiscal mapping (`fiscalPeriod`, label FY2025-26 over 2025-07-01..2026-06-30) are unchanged.

Suite: jurisdictions 165/165; coverage 97/97; format, architecture, ownership 0 failures; words 0 for jurisdictions (the repo's one testcopy is screens-publish's). Users: money 92/92, calculations 62/62, following 100/100, screens-investigate 236/236. QUESTION open: none.
Size (session_018n2VPXYoQnwCMwqn3JaZHt): test runs 8, module lines 3760

## Fix round 10 (START B7, item 70): C1 no proceeding can be registered; C14 the records help contradicts itself

**C1 (R51, D1 BLOCKER).** (1) Root cause as diagnosed, re-read: `oakland-alameda.mjs` had no `proceeding_kinds`, `proceeding_flows` or `forums`; `entities` read `[]` and refused every kind. (2) Why the tests missed it: every test that registers a proceeding, and `t50.test.mjs`'s own first-profile test, used the test profile or tolerated an absent block (`for (const x of f.forums || [])`). (3) Failing-first: `jurisdictions/test/t51-proceedings.test.mjs` (5 tests, naming R51 and R93), red 0/5 on the old profile, green 5/5. Fix: four kinds (civil, writ, appeal, complaint; labels are DEC-301's words), a flow each, five forums (Superior Court of Alameda County; Court of Appeal, First Appellate District; Supreme Court of California; U.S. District Court, N.D. Cal.; Oakland Public Ethics Commission, the body a complaint goes to). Sources read 2026-10-25: Code Civ. Proc. §§ 411.10, 904.1, 1085, 1094.5 from the Legislature's own bulk download (K3658; leginfo's site is behind a bot challenge, not worked around); the Superior Court's civil page, the First District's About page (twelve counties, Alameda named), the Supreme Court's home page, N.D. Cal.'s jurisdiction map (Alameda named), and the Commission's complaint page. Stages are only those a source states: the Commission's page names no hearing, nor do the pages read for a civil action or an appeal, so those flows have `filed` and `decided`; a writ has `heard` (§ 1094.5(a)). `reached_by` uses events' kinds `filing`, `hearing`, `order`.

**C14 (R93, D15).** (1) Root cause as diagnosed: no `records_help` on the first profile. (2) Missed because screens-action's tests use the test profile's block, and the "none" case an empty view. (3) Test above. Fix: the block, read 2026-10-25 from the Legislature's text (Gov. Code §§ 7921.300, 7922.525, .530, .535 as amended by Stats. 2025 ch. 34 effective 2026-01-01 — six unusual circumstances, not four —, .540, .570, .575, .600), the City's portal as OPD's General Order M-9.1 on the City's PowerDMS names it (`https://oaklandca.nextrequest.com/`), and the Sunshine Ordinance's "three business days" (OMC 2.20.230(A)) from the 2026-10-11 read in `fixtures/actions-law.mjs` (municode and oaklandca.gov answer a bot challenge today; not worked around). The existing `jurisdictions.test.mjs` R22 test now lists `records_help` among the facts two profiles hold differently (R93/R84: withheld in `combine`) and asserts exactly that one conflict.

Deferred: none. Found in another module: none. For BOB: `screens-action`'s "notheld" sentence is now reachable only for a profile with no block; `controlplane`'s door case (item 1's through-the-door test) is BOB's to place (K5138).

Met ids: R51 and R93 (first-profile halves). Tests and checks: jurisdictions suite 178/178; users loading the first profile (28 files): 185 pass, 7 fail, all in `journey-check/pseudo.test.mjs`, identical without my change; format, architecture, coverage (97/97) and fixtures (0 failures, no new marker) clean; words: no failure names jurisdictions (the 16 are store-assembly's and plane's).
Size (session_01AfTJJunnDTjUWKse11VPbW): test runs 8, module lines 3815

## J9 · COMPLETE

COMPLETE (fix round 10, item 70): C1 and C14 built, data only. R51 met: oakland-alameda now holds proceeding_kinds (civil, writ, appeal, complaint), a flow each and five forums (Alameda Superior Court, First District Court of Appeal, Supreme Court, N.D. Cal., Public Ethics Commission), each sourced 2026-10-25. R93 met: records_help (CPRA from the Legislature's own text as amended eff. 2026-01-01, six unusual circumstances; City portal per OPD DGO M-9.1; OMC 2.20.230(A) window from the 2026-10-11 read). Failing-first jurisdictions/test/t51-proceedings.test.mjs red 0/5, green 5/5; suite 178/178; the existing R22 test now expects the records_help conflict between the two profiles (R93/R84). Checks: format, architecture, coverage 97/97, fixtures 0 failures, ownership 0; words none for jurisdictions. Consumers loading the first profile: 185 pass, 7 fail all in journey-check/pseudo.test.mjs, identical without my change. Why tests missed it: recorded. The door case (control-plane) is BOB's to place (K5138). Commit pushed on job/T51/jurisdictions. Size (session_01AfTJJunnDTjUWKse11VPbW): test runs 8, module lines 3815.
