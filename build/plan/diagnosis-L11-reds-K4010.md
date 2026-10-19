# L11 reds on tranche/T51 (read-only diagnosis; no tracked file touched)
Runs: notice-producers 107 pass / 18 fail; answer-envelope 37 / 4; op-declarations 209 / 9.
Classes: (a) test copies/pins old text, fix in the tested module's own job; (b) L11 module must follow a provider's changed contract; (c) provider wrong.

## 1. notice-producers (18) -- ONE cause: date word order
Cause: DEC-333 (59dd3f6220, "dates in American order (October 8, 2026)"; reached the tranche in merge 1953c5cf2d "K3820") re-worded date.daymonth "{day} {month}" -> "{month} {day}" and date.daymonthyear "{day} {month} {year}" -> "{month} {day}, {year}" in docs/development/ux-substrate/screens/words.json and bio-plane/src/setup-words/rows.mjs:188-189. The module (src/notice-producers/words.mjs:27-37 dayInSentence -> wordsOf) is right: it reads the key. The tests build the day as `${d} ${month}` / regex "9 October" / literal "9 October" -- a hand-copied word order. All (a).
Want -> got, per test (file:line of assertion; test name abbreviated):
- accounts.test.mjs:55  R16 use's limit reached: "...asking on 9 October. It pauses..." -> "...on October 9. ..." (expected built as `9 ${say(date.month.october)}` at :52 and literal at :56)
- accounts.test.mjs:85  R16 overall/per-member limit: "...limit on 9 October." -> "on October 9."
- accounts.test.mjs:104 R16 month limit on own account: "...for asking on 9 October. ...until November 1" -> "on October 9." ("November 1" already matches; ai.until.month unchanged)
- accounts.test.mjs:131 R16 limit {date} local day: /on 9 October\./ -> "on October 9."
- accounts.test.mjs:238 R16 (T44) {date}: / on 7 October\. / -> "on October 7." (also :237 builds the day with say("date.daymonth") which is right; :238 regex and :241+ year forms hand-ordered)
- duties.test.mjs:365   R20 R5 overdue occurrence: "Nothing recorded by 12 February: ..." -> "by February 12: ..." (literal, :365-366 detail too)
- duties.test.mjs:396   R20 R5 due last year: fills.date "12 February" -> "February 12" (and next-year form "12 February 2027" -> "February 12, 2027")
- files.test.mjs:331    R14 R20 {date} note local day: ["31 December 2025" x2] -> ["December 31, 2025" x2] (:332 "1 January" control would fail next)
- investigation.test.mjs:30 (via words(), called :67) R17 step-later-found: helper day() at :27 builds `${d} ${month}`; detail "...looked for this on 9 October" -> "on October 9"
- investigation.test.mjs:30 (called :87) R17 step-date-due/step-reminder: "You set 8 October" -> "You set October 8" (same helper day())
- investigation.test.mjs:30 (called :166) R17 milestone-overdue/reminder: "due on 1 November" -> "due on November 1" (same helper)
- investigation.test.mjs:287 R17 step-later-found {date} looked_at: "on 9 October" -> "on October 9" (day() helper)
- investigation.test.mjs:323 R17 (T44) each {date}: /due on 1 October\./ -> "due on October 1." (:322 uses date("8","october") helper, same order)
- policy.test.mjs:84    R13 R20 policy-changed-noticed: "copy captured on 30 September / 7 October / 14 October" -> "September 30 / October 7 / October 14" (literal sentences, :84-86)
- waits.test.mjs:57     R6 R20 inquiry-recheck-due: /by 10 October\./ -> "by October 10."
- waits.test.mjs:132    R20 R6 wait due last year (control): fills.date "10 October" -> "October 10"
- watched.test.mjs:58   R24 watched document changed: word(queue.watched-changed.detail,{date:`5 ${month}`}) -> actual "...changed on October 5." (`5 ${word("date.month.october")}` at :58 is a hand-ordered fill)
- words.test.mjs:50     R16 R17 (T44) dayInSentence: "9 October" -> "October 9" (:50, :51 `9 ${october}`, :52, :54 `3 March 2027`, :55, :61 `1 ${november}` all hand-ordered; :49,:53 use word(...) and pass)
Classification: all 18 (a). Fix = compare with word("date.daymonth"/"date.daymonthyear", {day, month, year}) built from the key (as words.test.mjs:49,:53 and accounts.test.mjs:237 already do), never `${d} ${month}`, regex or literal order; the literals in duties/policy become say(...) of the keys. Producer code untouched. No provider fault (the word table change is a ruling, DEC-333).
Side finding (c, not in these reds): bio-plane/src/action-producers/words.mjs:39-40 keeps a hand-copied table "date.daymonth": "{day} {month}" -- stale vs words.json; its tests would pass only by copying the same old order; belongs to action-producers' job.

## 2. answer-envelope (4) -- ONE cause: C-112.14 pin digest
Tests (all fail on the same row, STANDARD_PROPOSER_UNNAMED, pin ["C-112.14","b037fb193ecd187e"] vs now ["C-112.14","f949b28d7eef8c30"]):
- catalogue-end.test.mjs:17  R7,R2,R10,R13 every code decorated before the catalogue's end: diff list [] -> ['STANDARD_PROPOSER_UNNAMED ... b037... -> f949...']
- catalogue-end.test.mjs:80  R13 (T46) C-124.30 re-pin: deepEqual fails on STANDARD_PROPOSER_UNNAMED (same digest pair)
- catalogue-end.test.mjs:124 R7 N1128 pinned-by-key: "STANDARD_PROPOSER_UNNAMED is pinned by its key", digest b037 -> f949
- families.test.mjs:686 R15,R7,R2 (T47) CHECK_FAMILY_FILES: STANDARD_PROPOSER_UNNAMED, same digest pair
Cause: standards commit 4c43e67e3f (2026-10-19, "read the words the check found through the word table") changed bio-plane/src/standards/checks.mjs:77 translation from the inline "...A proposal is labelled with who made it..." to word('refusal.STANDARD_PROPOSER_UNNAMED'), whose sentence (words.json, since DEC-260/51f2bcde40) reads "labeled". Verified: sha256[:16] of the "labelled" sentence = b037fb193ecd187e (the pin in test/m/answer-envelope/rows-before-r43.json:767), of "labeled" = f949b28d7eef8c30. The commit message says "wording ... otherwise unchanged": false by one letter (British -> American spelling).
Class: (a) -- the pin file (rows-before-r43.json) pins a sentence that a row now reads by key; answer-envelope's own job re-pins it exactly as T50-25 did (commits 78c1108ed8, 5de3bac5e0, N1128: "a row that reads a key is pinned by the key's sentence"): set C-112.14's digest to f949b28d7eef8c30. Not (c): the new text is the table's, the module's check code is unchanged. Note for standards' job: the reword was unannounced (sentence change in a "no wording change" commit).

## 3. op-declarations (9) -- two causes
### 3A. Registry now owes 7 browser-only acts (6 tests) -- (b)/(a) in op-declarations' job (R76 "not yet met: T51", build/requirements/op-declarations.md:299, T51-119/-121)
Cause: docs/development/ux-substrate/screens/registry.json, commit 75aeae5a1c (2026-10-18, "DEC-330 (in progress): B306's published-case, review-copy, members and project drawings") adds owed acts hashcopy, linkopen, revisioncompare (document screen), pubfloorset, pubfloorclear, pubprint (published), reviewexport (review-copy), each "owed:<op> DEC-330". They are browser-only acts with no plane op: R76 says op-declarations must export BROWSER_ACTS naming them and amend R21/R27 so they are neither owed-without-spec nor aliases. Not built yet; the tests' owed lists predate them.
Want -> got (extra 'hashcopy','linkopen','pubfloorclear','pubfloorset','pubprint','reviewexport','revisioncompare' in the registry's owed set; each assertion is a deepEqual of the owed set to a pinned list):
- t34.test.mjs:220  R21,R27 owed acts: expected 15 names (STILL_OWED+OWED_T47..T50+INSTALLER_ROUTES) -> 22 (+7 above)
- t37.test.mjs:200  R21 (T37): owed.filter(not in OPS) expected 4 LEFT_OUT (installalongside/remove/removeconfirm/update) -> 11 (+7)
- t38.test.mjs:89   R21 (T38): same LEFT_OUT check -> 11 (+7)
- t46.test.mjs:331  R52: owed set 15 -> 22 (+7)
- t47.test.mjs:308  R54,R60: owed set 15 -> 22 (+7)
- t48.test.mjs:206  R65,R21: owed set 15 -> 22 (+7)
Class: fix lives in op-declarations' job (R76: BROWSER_ACTS; the six tests then subtract it, or assert owed == listed + BROWSER_ACTS keys). The provider (the design registry) is not wrong: DEC-330 deliberately owes them; op-declarations' code (src/op-declarations/index.mjs) simply has no BROWSER_ACTS yet -> (b), with the tests' pinned lists to update (a) in the same job.
### 3B. Provider ops with no spec (3 tests) -- (b)
Each asserts every op a provider's map serves to a caller has Object.hasOwn(OPS, op); new T51 provider ops are not declared yet:
- t33.test.mjs:294  R19,R6 each module's ops map: "entities: entityidonly has no spec" (entities R57 onlyByIdentifier, op=entityidonly, bio-plane/src/entities/index.mjs:2061; commit cb0e8a67f2, 2026-10-18)
- t45.test.mjs:221  R49,R6: "project-roster: projectinvitations has no spec" (project-roster R35, src/project-roster/index.mjs:1292; commit fccb55f1cb; job note build/jobs/T51/project-roster.md:14 already says op-declarations needs this spec, and projectlist's new `after` parameter)
- t46.test.mjs:251  R51,R6: "membership: adminremovalsopen has no spec" (served by membership via member-roster, src/member-roster/index.mjs:1972, membership/index.mjs:1349 R154; commits 8954fd830c member-roster new module, 44dc54a2c9 CR-4 membership delegates; job note build/jobs/T51/member-roster.md:20,39 says op-declarations (T51-107) must declare exactly `adminremovalsopen`, `by` stamped by the control plane, administrators only)
Class: (b) -- op-declarations' job (T51-107) must add specs for entityidonly, projectinvitations (+ projectlist `after`), adminremovalsopen. Providers are right and have flagged the need.

## Summary per module
- notice-producers: all 18 are (a): DEC-333 (59dd3f6220, merged by 1953c5cf2d) flipped date.daymonth/daymonthyear to month-first; tests hand-order day then month in builders/regexes/literals. Fix in notice-producers' job: build every expected day from word("date.daymonth"/"date.daymonthyear", ...) (say() of the key), including the literals in duties/policy/watched/waits/files. Module code is correct.
- answer-envelope: all 4 are (a) from one pin: C-112.14 STANDARD_PROPOSER_UNNAMED digest b037fb193ecd187e (labelled) -> f949b28d7eef8c30 (labeled) after standards 4c43e67e3f began reading word('refusal.STANDARD_PROPOSER_UNNAMED'). Fix in answer-envelope's job: re-pin that row in rows-before-r43.json (like T50-25). Not (c); standards' "wording unchanged" claim was off by one letter.
- op-declarations: 6 owed-set tests = DEC-330's seven browser-only owed acts (registry commit 75aeae5a1c) unmet by R76 BROWSER_ACTS: (b) with the tests' pinned lists updated in the same job; 3 tests = new provider ops entityidonly / projectinvitations / adminremovalsopen needing specs: (b). No provider is wrong (c).
