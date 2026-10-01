# Triage: every open entry against T20 (P19, K889)

**Status** · Written by a worker for BOB #85, 2026-10-01, on `tranche/T20` @ 83e6c57a4f (K889; layers 1–3 closed, layer 4 running: EXTRACTION #10, K888; layers 5–11 not started). Read: `current.md` whole, `next.md` whole (59 entries), rulings K740–K889, `modules.json`, `archive/T19.md` ("next.md: every entry", "The final sweep", "Close"), `build/jobs/T19/*`, `build/jobs/T20/*`, `starts-T20/*` (33 STARTs), `draft-T21.md`. Line references were checked at HEAD.

Verdicts: **A** met or applied (move to `archive/next-applied.md`) · **B** placed in T20 (START cited) · **C** can join T20 now (layer 5–11) · **D** cannot, for one hard reason. An entry with shares gets one verdict, for its share that is still open. Its other shares are listed beside it.

## next.md: the 59 entries

| # | id | module(s) | verdict | evidence |
|---|---|---|---|---|
| 1 | N22 | test-support | **A** | TEST-SUPPORT #2, R2 mark struck (K750), merged (K753) |
| 2 | N26 | office-readers, extraction | **A** | office-readers' fix and R28 merged (K755). The migration and re-read ran in T19 (K800, merged K801). K863: nothing of N26 is left for T20 |
| 3 | N31 | bundler, legacy-tests | **B** | bundler's share was met in T19 (K762: the remedy is one constant). legacy-tests' share (fleetbundles arm (j), owed-controls, the old controls) is in `starts-T20/legacy-tests.txt` (2) and (3) |
| 4 | N34 | pdf-worker (image-codecs) | **D** order | pdf-worker and image-codecs are layer 1, which closed in T20 (K870). Also deploy (the bound is measured on a deployed plane) and size (pdf-worker has 4,075 lines, P6, ⚑BOB-5) |
| 5 | DIST-14 | office-readers | **D** deploy | the CSV bound is measured on a deployed plane. Layer 1 is also closed. OFFICE-READERS #4 kept it open (`jobs/T20/office-readers.md`:15) |
| 6 | "Local facts" line (`cpra_request`, `governingLawsOf`) | action-grammar, actions | **D** Bob's (Q1) | the `governingLawsOf` sentence share is met: its outward text names no law (K768, actions R41). The `cpra_request` kind (`action-grammar/grammar.mjs`:51) is a stored interface value, and renaming it needs a migration that waits on Bob's N71 answer |
| 7 | California records-law line (REC-201) | action-grammar | **D** Bob's (Q1) | the outward share is met (K768). The identifier is the same as row 6 |
| 8 | N57 | legacy-tests | **B** | `legacy-tests.txt` (1), (3) (K879) |
| 9 | N68 | legacy-tests (legacy-index, legacy-ui) | **B** | the legacy-index and legacy-tests shares are in `legacy-tests.txt` (3). The rec-186 catalogue arm is moot (catalogue deleted, K855). The legacy-ui share (`app.html`'s docprofile copy) is D, Bob's UX (K633) |
| 10 | N70 | several | **B** | Met: legacy-checks, promotion and membership (`promotion.md`:89, `membership.md`:68), legacy-store (K783). Placed: the legacy-tests, legacy-index and affordances (N45, d311) shares, in `legacy-tests.txt` (3). **The skills share is A, and the table's reason for it is stale.** Bob answered skills' questions in K102 (`requirements/skills.md`: "Open for Bob: None"). R21 is met: `test/m/skills/doctrine.test.mjs`:229, skills 39/0 at HEAD. Only the old suite `bio-plane/test/skillpack.test.mjs` is red (0/1), and legacy-tests deletes it. The legacy-ui share is D, Bob's UX (K633) |
| 11 | N71 | canon, all | **D** Bob's (Q1) | which word member-facing text uses instead of "bundle" (K106) |
| 12 | N75 | image-codecs | **D** deploy | the code was done in T9 (K281). The bound is measured on a deployed plane. Layer 1 is also closed |
| 13 | N136 | inquiry, query-language, legacy-store | **A** | INQUIRY #8 stage one (K815, `jobs/T19/inquiry.md`:17), the contradiction re-point (`contradiction.md`:15), merged K820 |
| 14 | N144 | affordances, legacy-ui | **D** Bob's (Q2) | where the surface registry lives and when the plane publishes it: architecture and UX (P17), tied to the new interface (K633) |
| 15 | N155 | run-productions | **A** | RUN-PRODUCTIONS #4 (K814). `SUGGEST_CHECKS` is in `run-productions/checks.mjs`. The catalogue copy went with the file (K855) |
| 16 | N221 | ratification, legacy-checks | **A** | "N221 confirmed" (K792). The catalogue copy was deleted (K855) |
| 17 | N232 | affordances, legacy-ui, skills | **D** Bob's (Q2) | goes with N144 |
| 18 | N241 | legacy-ui | **D** Bob's: UX | K633: legacy-ui stays untouched until the new interface replaces it. No new question |
| 19 | N248 | legacy-tests | **B** | `legacy-tests.txt` (3) |
| 20 | N279 | legacy-tests | **B** | `legacy-tests.txt` (3) |
| 21 | N317 | promotion, intent | **D** Bob's (Q3) | whether promotion refuses a hand-written project state, and whether C-2.9's arms retire, are requirement meaning. promotion's own share is also order (L2 closed). intent's share (C-2.9 is intent R29, L7) could join T20 L7 if Bob rules before L7 starts |
| 22 | N320 | conformance, consequences, escalation, filings | **D** Bob's (Q4) | doctrine (DEC-36 over hidden dependents; N303's rest). The placeholders are at HEAD: `conformance/index.mjs`:90 (`UNSEEN`), `consequences/index.mjs`:561, :590, `escalation/index.mjs`:383. All four modules are L9, so they join T20 if Bob answers before L9 |
| 23 | N371 | legacy-ui | **D** Bob's: UX | K633 (as N241) |
| 24 | N404 | docprofile | **A** | DOCPROFILE #3 (K758) |
| 25 | N416 | text-chain | **A** | R99–R103 adopted (K747), merged (K752) |
| 26 | N420 | instance-setup, agent-worker | **A** | instance-setup R12 and R16 marks struck (K851). agent-worker's share was done in T18 (`archive/T19.md` sweep). `MODES.plan` deployed stays D, deploy (table) |
| 27 | N421 | agent-worker | **A** | `jobs/T19/agent-worker.md`:7, :17 (K816, K820) |
| 28 | N422 | inquiry, record-core | **A** | record-core (K783), inquiry R42 (K815, K820) |
| 29 | N423 | review | **A** | `jobs/T19/review.md`:8, edge struck (K832) |
| 30 | N424 | case-authoring | **A** | `jobs/T19/case-authoring.md`:18, :35 (K832) |
| 31 | N425 | promotion | **A** | promotion R52 (K757), marks struck (K792) |
| 32 | N426 | promotion, membership, record-core | **A** | promotion R53, membership R43 (K776, K791, K792) |
| 33 | N427 | actions, action-clocks, action-plans | **A** | K836, K837, K839 |
| 34 | N428 | actions | **A** | K837 |
| 35 | N429 | monitoring | **A** | R50 (K841) |
| 36 | N430 | skills | **A** | met by showing its reader (K766, `jobs/T19/skills.md`:25). C-33.41's `where` was re-pointed (K765) and stamped |
| 37 | N431 | legacy-tests | **B** | `legacy-tests.txt` (3) |
| 38 | N432 | action-plans | **A** | R11, R31 struck (K839) |
| 39 | N433 | intent, conformance, escalation, promotion | **A** | own codes (K823, K839), stamped 1.50.0 (`jobs/T20/promotion.md`:8, K884) |
| 40 | N434 | legacy-tests | **B** | `legacy-tests.txt` (3) |
| 41 | N435 | case-authoring | **A** | R34 (K832; `case-authoring.md`:21, :29) |
| 42 | N436 | legacy-tests | **B** | `legacy-tests.txt` (3) |
| 43 | N437 | agent-worker, control-plane (others met) | **C** | Met: ocr-worker (K753), legacy-checks and legacy-index (gone), pdf-worker (K866, `jobs/T20/pdf-worker.md`:40), record-grammar (K868). `wrangler.jsonc`:9 no longer names it. **Missed by T19, still live at HEAD:** `agent-worker/fleet-member.json`:13 names `scripts/coverage.mjs` as live. `control-plane/checks.mjs`:104 and `index.mjs`:2044, :2076 name `migrate.mjs` as the live "honest sender" of `replay: true` (CONTROL-PLANE #10 re-worded other comments only, `jobs/T19/control-plane.md`:24). The texts to append are below. The `app.html` share is D, Bob's UX (K633) |
| 44 | N438 | legacy-tests | **B** | `legacy-tests.txt` (3) |
| 45 | N439 | office-readers, extraction | **B** | office-readers' half is met (K870). extraction's migration is `starts-T20/extraction.txt` (R68, K876), running (K888) |
| 46 | N441 | legacy-tests | **B** | `legacy-tests.txt` (2) |
| 47 | N442 | legacy-tests | **B** | `legacy-tests.txt` (2) |
| 48 | N443 | installer, signatures | **B** | signatures' half is met (K866). installer is in `starts-T20/installer.txt` (L11) |
| 49 | N444 | legacy-tests (the file moved from legacy-ui) | **C** | `civicos-ui/check-refusal-codes.mjs` is now a legacy-tests path (`modules.json`) and fails at load (`:139` imports the deleted `scripts/walkfloor.mjs`, run at HEAD). It is not legacy-ui's UX, so the table's legacy-ui row should not hold it. Append to legacy-tests' START (below) |
| 50 | N445 | membership | **A** | MEMBERSHIP #14 (K881, `jobs/T20/membership.md`:20). Its remaining two copies are N453 |
| 51 | N446 | text-chain | **A** | K869 |
| 52 | N447 | actions | **B** | `starts-T20/actions.txt` (L9) |
| 53 | N448 | promotion, legacy-tests | **B** | promotion's share is moot (K795 (3); `tools/` deleted). legacy-tests' share is in `legacy-tests.txt` (3) |
| 54 | N449 | record-grammar | **A** | K868 (`jobs/T20/record-grammar.md`:34) |
| 55 | N450 | legacy-tests | **C** | `bio-plane/test/capturerequests.control.mjs`:49 and `test/system/fence-e2e.control.mjs`:54 anchor on the deleted `src/capture/acquire.mjs`. They are not named in `legacy-tests.txt` (3). Append (below) |
| 56 | N455 | pdf-pixels | **D** order | pdf-pixels is L1, closed in T20, and has no T20 job (K882) |
| 57 | N451 | bundler | **A** | folded at K882 (bf085bee0f, `requirements/bundler.md` deploy paragraph) |
| 58 | N452 | inquiry-grammar (skills, inquiry, control-plane) | **D** order | The re-points are placed: `skills.txt`, `inquiry.txt` (L6) and `control-plane.txt` (2) (L11). The alias deletion cannot be in T20: `control-plane/families.mjs`:94 reads `INQUIRY_GRAMMAR.INQUIRY_GRAMMAR_ROWS` until control-plane's L11 job, after inquiry-grammar's L6 job (P4, K882) |
| 59 | N453 | membership | **D** order | ratification's `preflight.test.mjs` is re-pointed in L8 (`ratification.txt`), but membership's layer (L2) is closed (K875, K882) |

## "Deferred beyond T20": the table rows (13 rows; the table's footer says 14)

| row | verdict | evidence |
|---|---|---|
| rows changed at T20's layers 3–11 | **D** P8, or Bob's (Q5) | promotion's one job was L2 (K884). Known so far: acquisition's C-68.1 `where` (K887, "the closing sweep if Bob approves it, else T21"), with control-plane's half in L11. K889 left the P10 closing sweep proposed |
| office-readers R28, R29 retired | **D** deploy | each migration must run at every instance first. Office-readers' layer (L1) is also closed |
| the release (old battery, instruments, DEC-49 guard floors, `system` suites; N31's rest, N57, N68, N70's three shares, N248, N279, N431, N434, N436, N438, N441, N442, N448) | **B** | K879 ("Delete the old suites."), `legacy-tests.txt` (L11, last). Add N444 and N450 and fleetbundles' K641 arm (C, below). The release's deployment stays D, deploy. ⚑Bob-2 is answered, so this row leaves the table |
| legacy-ui, N70/N68 legacy-ui shares, N241, N371, N389, N-A13, N437's `app.html`, N444 | **D** Bob's: UX (K633) | Bob's standing ruling, so no new question. **N444 moves to B/C** (row 49) |
| `cpra_request`, N71 | **D** Bob's (Q1) | |
| N303's rest, N317, N320, N144, N232 | **D** Bob's (Q2, Q3, Q4) | |
| N70's skills share | **A** | its reason is stale (row 10) |
| N-A14 | **D** Bob's (Q6) and deploy | the templates are legal text. Holidays and offices need a source or a measurement |
| N-A19 | **D** Bob's (Q7) | DEC-61's hold has no act that clears it, so queue R12 cannot hold a door for it (`action-fold/deltas/queue-producers.md`:3) |
| `PLN-` affordances, plan-page surface, joint action | **D** Bob's | the plan-page surface belongs to the new interface (K608 (4), K633). Joint action was ruled "deferred until a coalition asks" (K600 (c)): no question is open |
| `MODES.plan` deployed | **D** deploy | K660 (5) |
| newgroup installer deployed with N336 | **D** deploy | a signed release, Bob's act (K723, K724) |
| contradiction R41, K5 arms, DIST-14, N75, N34 | **D** deploy | the bounds are measured on a deployed plane. N34 also needs a split first (P6) and its layer is closed |
| N21 (was conditional) | **A** | Bob: "Keep the fallback" (K880). Strike it wherever it is still listed |

## C: the texts to append to existing T20 STARTs

**control-plane (L11), append to `starts-T20/control-plane.txt`:**
> Also (N437's control-plane share, K739, K582; missed in T19): `src/control-plane/checks.mjs`:104 (C-66.6's note) and `src/control-plane/index.mjs`:2044, :2076 name `migrate.mjs` as the live "one honest sender" of `replay: true`. The migrate tool was retired in K739. Re-word each to what holds now. A provenance note may stay (`layers.md` rule 6). Comments only: C-66.6's behaviour, row and `where` are unchanged, so nothing awaits a stamp. Re-scan `src/control-plane/` for other live references to `migrate.mjs`, `coverage.mjs` or `declared-source.mjs`. In your REPORT, say whether any product caller still sends `replay: true` (a finding for BOB, not a change).

**agent-worker (L6), append to `starts-T20/agent-worker.txt`:**
> Also (N437's agent-worker share, K739; missed in T19): `agent-worker/fleet-member.json`:13's top-level `note` names `scripts/coverage.mjs` (D-117, retired in K739) as the instrument that discovers this member and holds its surface. Re-word it to what reads this file now (`bio-plane/scripts/fleet-bundle.mjs`; your suites hold the surface, R34), as ocr-worker's and pdf-worker's notes do. The text only: no key changes. Say whether the change stales your bundle manifest.

**legacy-tests (L11), append to `starts-T20/legacy-tests.txt`:**
> Also, for (1)–(3): **N444** (K781): `civicos-ui/check-refusal-codes.mjs` (your path) fails at load (`:139` imports the deleted `scripts/walkfloor.mjs`). The DEC-49 totality it guarded is control-plane's `families.test.mjs` R22. Delete it unless a proof of its has no module test, and name that proof. **N450** (CAPTURE #11 J2): `test/capturerequests.control.mjs`:49 and `test/system/fence-e2e.control.mjs`:54 anchor on the deleted `src/capture/acquire.mjs`. Re-anchor at `src/acquisition/index.mjs` or delete with their suites. **K641:** `test/system/fleetbundles.test.mjs`:198's pinned 153 agent-worker inputs, accepted red since T18. Re-pin it from the committed manifest so the suite is 0 fail. List all three in your COMPLETE with (3)'s entries.

## Found while checking (not in `next.md`)

- **`battery.mjs` named after legacy-tests' L11 job (order, so T21).** If legacy-tests deletes `bio-plane/scripts/battery.mjs` (it loads today), these will name a deleted file: `ocr-worker/fleet-member.json`:14, `pdf-worker/fleet-member.json`:13 and `bio-plane/scripts/fleet-bundle.mjs`:68, :109, :134, :183. All three modules are L1, which is closed. Recommended: legacy-tests' COMPLETE lists them, and BOB writes a `next.md` entry for T21. (agent-worker's note is covered by its append above.)
- **`next.md` housekeeping:** the 25 A entries, N21, and the release row's entries met by legacy-tests' job move to `archive/next-applied.md` (K424) at the next opening. Also: the table's "14 rows" is 13; N70's skills reason is stale; N444's row is wrong.

## Counts

- **next.md (59):** A 25 · B 16 · C 3 · D 15 (order 4: N34, N452, N453, N455 · deploy 2: DIST-14, N75 · Bob's 9: the two `cpra_request` lines, N71, N144, N232, N241, N317, N320, N371).
- **C list:** N437 → control-plane (L11) and agent-worker (L6). N444 and N450 → legacy-tests (L11). Each is an append to an existing START. No new job.
- **Table (13 rows):** A 1 (N70 skills; N21 also struck by K880) · B 1 (the release, K879) · D 11.

## Bob's questions

- **Q1 · The word "bundle" and the `cpra_request` kind (N71, REC-201).** What word does text that members read use instead of "bundle"? May the stored identifiers (`bundle_id`, the `bundles` table, the action kind `cpra_request`) stay as internal names that members never see? *Recommended:* "record" in all member-facing text. Keep the identifiers: renaming them needs a data migration on every instance and changes nothing a member sees, and the law's name already comes from the profile (K768).
- **Q2 · Surfaces and recipes (N144, N232).** Should the plane publish the surface registry and the recipes (`op=affordances`) now, or wait until the new interface replaces legacy-ui? *Recommended:* wait, and design both with the new interface: one registry, published by the plane (DEC-8).
- **Q3 · Hand-written project state (N317).** Should promotion refuse a hand-written project `current_state` other than `closed`? Should the never-read fields `workproduct_state` and `evaluations`, and C-2.9's legacy arms, retire? *Recommended:* yes to both. The stage is derived by `projectStage`, so these fields only mislead, and stored values stay readable. intent's share could still join T20 L7; promotion's share is T21.
- **Q4 · What a reader may not see (N320, N303's rest).** Does DEC-36 ("no id, no title, no state, no count") also govern hidden dependents and backlinks, and the "an object you may not see" placeholders in conformance, consequences, escalation and filings? *Recommended:* yes, in the form strength R6 already uses: withhold the item whole and state only `out_of_view: true`. If Bob answers before layer 5 starts, connections (L5), reevaluation (L7) and the four L9 modules join T20.
- **Q5 · The closing stamp (K887, K889).** Do you approve the proposed P10 closing sweep: one promotion stamp at the tranche's close for rows changed in layers 3–11 (acquisition's C-68.1 `where` now, control-plane's half in L11)? *Recommended:* approve. Without it these rows wait for T21's layer 2.
- **Q6 · The first profile's filings (N-A14).** Who supplies or approves the Tier 1–2 filing templates (legal text), and what is the source for the profile's holidays and offices? *Recommended:* name one approver and one source. Until then the profile prepares no filing (`KIND_NO_TEMPLATE`), as today.
- **Q7 · Litigation hold (N-A19, DEC-61).** What act clears a litigation-hold reminder? *Recommended:* an attributed member act on the action's `legal` pressure mark ("hold in place" or "hold released", with a reason). That act becomes the reminder's door, and queue-producers can then build it.
