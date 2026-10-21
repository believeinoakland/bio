# Fix round 2 of T51: the plan

**Status** · Drafted 2026-10-21 by a planning worker for BOB #239; not in force until BOB reviews it. Bob's direction: find all the problems, fix them all in one round, redeploy, re-walk what changed. Source: `build/plan/walk-T51-build/CAUSES.md` (96 causes, read whole), `build/modules.json`, the cause-job rule (mechanics §6, §6a; P8) on `prep/cause-job-K4273`. The START bodies are `build/plan/starts-T51-F2/<job>.txt` (one per job).

## 1. The round in numbers

- 96 causes: **92 are in this round's jobs** (87 CODE of which the 8 BLOCKERs C1 to C8; 5 PERF), in **29 jobs** (module jobs and cause jobs): wave 1 has 20 (the limit is 20), wave 2 has 9. Models: 28 sonnet, 1 haiku (`screens-action-2`, wording-only), 0 opus (no new module; no new provided service of more than three ids). All at medium effort.
- Not in a job: C49, C55, C64 (DESIGN, section 5), C84 (DATA, section 6), 23 WORDS items (section 4). Nothing else is left out; two things are measured after the redeploy (C13's container cold start, C18 on real photographs) and are named in section 8.
- Causes that touch two or more jobs are marked `*` in the table: each job carries only its own part (named in its START). Every one of the 92 causes above is in at least one job; no module is held by two jobs at once (same-module jobs are in different waves).
- Requirement changes: 10 (section 3). One changes what a requirement means and is Bob's (RC-3, the reading of a web page); RC-4 (document names) is BOB's but Bob should be told; the default in C51 is Bob's if he wants it changed (open point 6).

## 2. The jobs

Cause jobs (hold several modules, one cause or one area each): `cause-conclude-t51` (C1: the version grammar and the version it builds), `cause-capture-t51` (C5: the multipart capture touches acquisition, capture and sources, and C12, C13, C14, C25, C26 sit in the same files), `cause-shell-t51` (C76 marks need op-grades and the shell together; C81 styles need interface-assets), `cause-action-t51` (C6, C65, C68 each need a plane module and the screen), `cause-ocr-t51` (C18: preparation then engine, BOB's boundary ruling L26), `cause-assistant-t51` (C92, C93). Every other job is one module's job carrying all its causes for that wave. `screens-inquiry` (24 causes) is two jobs in two waves (its own reading set would not fit one session); `screens-daily`, `screens-investigate` and `screens-action` have a second, small job in wave 2 because C94 (the member-name helper from the shell), C14 (the cheap picker read from capture), C21 and C72 can only be adopted after their providers merge, while their BLOCKERs (C4, C6/C7/C8) run in wave 1.

`*` = the cause has a part in another job. Merge order is within the wave (providers first: by the highest module index of the job).

| job | model | wave | merge | modules held | causes |
|---|---|---|---|---|---|
| cause-reading-t51 | sonnet | 1 | 1 | text-chain, reading-pipeline | C19 |
| cause-ocr-t51 | sonnet | 1 | 2 | pdf-pixels, ocr-worker | C18 |
| cause-capture-t51 | sonnet | 1 | 3 | acquisition, capture, sources | C5 C12* C13 C14* C25* C26* |
| retrieval | sonnet | 1 | 4 | retrieval | C21* |
| citation | sonnet | 1 | 5 | citation | C31* |
| cause-conclude-t51 | sonnet | 1 | 6 | basis-version-grammar, basis-versions | C1 C42* |
| strength | sonnet | 1 | 7 | strength | C38* |
| public-read | sonnet | 1 | 8 | public-read | C2* |
| case-disclosures | sonnet | 1 | 9 | case-disclosures | C39 C40* |
| case-authoring | sonnet | 1 | 10 | case-authoring | C3* C67* |
| review | sonnet | 1 | 11 | review | C46* C52* |
| monitoring | sonnet | 1 | 12 | monitoring | C26* |
| queue-producers | sonnet | 1 | 13 | queue-producers | C69 C94* |
| queue | sonnet | 1 | 14 | queue | C66* C72* |
| cause-assistant-t51 | sonnet | 1 | 15 | agent-runner, instance-setup | C92 C93 |
| cause-shell-t51 | sonnet | 1 | 16 | interface-assets, op-grades, interface-shell | C24 C76 C77 C78* C79* C80 C81 C94* C11* C15* |
| screens-daily | sonnet | 1 | 17 | screens-daily | C4 C22 C23* C35* C70 C71 C73 C74 C75 C79* C96 |
| screens-inquiry | sonnet | 1 | 18 | screens-inquiry | C16 C17 C20 C27 C30 C32 C34 C35* C36 C37 C41 C43 C44 C58 C62* C63* C90* |
| screens-investigate | sonnet | 1 | 19 | screens-investigate | C6* C7 C8 C54 C56 C57 C59 C60 C61 C62* |
| cause-action-t51 | sonnet | 1 | 20 | action-clocks, filing-templates, screens-action | C6* C53 C62* C63* C65 C66* C68 |
| screens-entry | sonnet | 2 | 1 | screens-entry | C82 C83* |
| screens-settings | sonnet | 2 | 2 | screens-settings | C14* C83* C85 C86 C87 C88 C89 C90* C91* C94* |
| screens-intake | sonnet | 2 | 3 | screens-intake | C9 C10 C11* C14* C23* C25* C28 C29 C45 C78* C90* C91* |
| screens-daily-2 | sonnet | 2 | 4 | screens-daily | C21* C72* C94* C14* |
| screens-inquiry-2 | sonnet | 2 | 5 | screens-inquiry | C31* C33 C38* C40* C42* C94* C95* |
| screens-investigate-2 | sonnet | 2 | 6 | screens-investigate | C14* C95* C94* |
| screens-publish | sonnet | 2 | 7 | screens-publish | C2* C3* C46* C47 C48 C50 C51 C52* C66* C67* |
| screens-action-2 | haiku | 2 | 8 | screens-action | C94* |
| control-plane | sonnet | 2 | 9 | control-plane | C15* C52* C12* |

**Wave 1** merge order: cause-ocr-t51 > cause-capture-t51 > cause-reading-t51 > retrieval > citation > cause-conclude-t51 > strength > public-read > case-disclosures > case-authoring > review > monitoring > queue-producers > queue > cause-assistant-t51 > cause-shell-t51 > screens-daily > screens-inquiry > screens-investigate > cause-action-t51.
**Wave 2** merge order: screens-entry > screens-settings > screens-intake > screens-daily-2 > screens-inquiry-2 > screens-investigate-2 > screens-publish > screens-action-2 > control-plane. Wave 2 starts when wave 1 is merged. Reserve: a wave 3 of follow-up jobs for halves a job finds in a module it does not hold (QUESTION, P9): the ones to watch are C5 (which of three modules), C8 (money's propose act), C54 (a read of a project's events), C38 (which module counts the severed leg), C42, C60, C93.

**BLOCKERs in wave 1.** C1 `cause-conclude-t51`; C2 `public-read` (the plane serves the claim; the screen's preference for the signed claim follows in `screens-publish`, wave 2, and the BLOCKER is met at the source in wave 1); C3 `case-authoring` (the pre-flight list; the ceremony draws Retry from it with no change, which `screens-publish` proves in wave 2); C4 `screens-daily`; C5 `cause-capture-t51`; C6 `cause-action-t51` (Matter's pickers) with `screens-investigate` (the event the picker offers); C7 and C8 `screens-investigate`.

**Impact.** Each job runs its own suites and then `build/plan/impact.mjs tranche/T51 HEAD` (its users). The biggest users are `plane`, `control-plane`, `op-declarations` and `answer-envelope`: BOB runs the whole suite once per wave on the merged tranche before the next wave opens.

## 3. Requirement changes (BOB writes them before the wave that needs them; jobs read them)

| id | module, line | proposed text (outcome) | what it is |
|---|---|---|---|
| RC-1 | acquisition R20 | The trusted timestamp and the co-archive are requested after the document is kept, never inside the bound that holds the fetch and the reading; each attempt is recorded in `attestation_attempts`, and a late or failed attempt never fails or un-keeps a capture. | wording (order of steps; R20 already says each attempt is recorded and a failure is no failed capture): BOB's |
| RC-2 | screens-intake R49 | Add: a visible document found is also recorded as captured for the question (`capture` R94 `recordCapturedFor`); when the bytes have another home the sentence names and links the holder. | wording, no document is written: BOB's (see open point 5) |
| RC-3 | reading-pipeline R32 (text-chain follows) | For an HTML page the reading is the page's evidentiary region: `<main>`/`<article>` when present, else the body without navigation, header, footer and complementary landmarks; script, style, template and head contents stay dropped. | **changes what a reading is: Bob's**, I recommend yes (open point 4); text-chain waits for the ruling |
| RC-4 | screens-intake, new | A document is named by its own title (`reading.title`), else its file name, else host and date; one rule for web page, PDF and upload. | detail of an existing naming requirement (I-03): BOB's; told to Bob because it is what he reads in every list |
| RC-5 | screens-inquiry, new lines | (a) a held copy offers "set aside" (`heldsetaside`, `capture` R79, reason required), `retire` answers its own ILLEGAL_TRANSITION and CITED sentences (R55); (b) R104: a finding concluded within a project is reopened by withdrawing the conclusion (`withdrawconclusion`, `basis-versions` R20); (c) R55: one act obtains the timestamp and the co-archive and says what is still missing; (d) a move of citations is offered only to a held or vouched copy with an extraction chain; (e) the cite act sends a body and marks the passage. | wording of acts the plane already serves: BOB's |
| RC-6 | screens-publish, new lines | (a) preparing an edition and signing it are separate steps; only signing says it cannot be taken back; (b) a reopened ceremony shows "Published: edition N" with its link; (c) the Sign step loads a key file and reuses a key the device holds. | wording/weight: BOB's. Not changed: the default of "keep this key" (open point 6) |
| RC-7 | screens-daily, new; interface-shell R21 | Queue and Home keep and show once the invitation `adminendorse` answers (as Settings does). Shell R21 now clears every password after any successful act: amend to "after an act that sent one". | wording: BOB's |
| RC-8 | interface-shell, new | A kit helper `memberName(id)` names a member by handle, the founder included; no screen draws a member id. | new helper, no meaning change: BOB's |
| RC-9 | screens-investigate R58 | An organisation's page draws only the acts the plane serves for an organisation; the facts form is for a person. | clarifies; if R53/R58 promise organisation facts the job asks (C7) |
| RC-10 | control-plane, new | `interfacewords` is served with a long cache header keyed by the release version, compressed. | wording: BOB's |

New member-facing sentences (C83's scanner state, C9's holder link, C71's reasons, C60, C7, C57, C28, C42, C40, C47, C48, C50, C17's "read N of M") are word rows the design stream writes first: each job lists the keys it needs and posts one QUESTION; BOB sends them to the design lane in one batch. Jobs do not wait for it.

## 4. WORDS: lines for `later-ux.md` (appended by BOB; I did not edit that file)

- Vouch rows · say "photo" for web pages and name a knock by raw id · setup-team S-04 · 2026-10-21
- Status row · "archive fallback may fetch a replay" · S-05 · 2026-10-21
- Stage needs · internal words ("held question", "leg in its basis", "ratified case edition"); Forming has none · S-08 · 2026-10-21
- Home · "Yours: sparky" does not say administrator · S-11 · 2026-10-21
- Join page · promises a guided start · S-14 · 2026-10-21
- Home, Queue · "held captures", "Inbox items" for a new member · S-16 · 2026-10-21
- Add an administrator · warning says a vote takes it back (impossible at two); long confirm route · S-22 · 2026-10-21
- Settings · "Read what is due" prints a prompt for an AI · S-28 · 2026-10-21
- Queue · raw word keys `screen.action.kind.records_petition` etc. in the kind list · S-31 · 2026-10-21
- Queue · "Mute a kind" mutes "this item only" · S-35 · 2026-10-21
- Security · ICAP, RFC 5424, Splunk HEC… on "Add another checker" · S-42 · 2026-10-21
- Capture, document · "upload:<hash>" source line; "Added by The team's founder" · FC-10 · 2026-10-21
- Find · "What this search covered" uses level words and code names · FC-16 · 2026-10-21
- Doorbell · small points · FC-21 · 2026-10-21
- Refusals · missing rows: C-2.8 grouping sentence; "no explanation… CITED" (C33's job writes against the key; the sentence is the design's) · FC-25, E49 · 2026-10-21
- Action, Plan · raw ids, "dependency", role said twice, "(from read)", "opt-1" · CA9, CA23, CA44, CA45, CA50, CA57, CA67, CA69 · 2026-10-21
- Sign step · raw strings ("bio-ratify-case…") and a "device window" that does not exist · CA35 · 2026-10-21
- Question · strength says "rests on nothing established" without what would make it count · E12 · 2026-10-21
- Question, Document · "The team's founder" for the acting member; "What would change it" twice · E14, E23 · 2026-10-21
- Timeline · "Undetermined, because its owner does not settle its validity" · E34 · 2026-10-21
- Plan · checks print "p1", "not_met" · E57 (C63 maps the codes; the sentences are the design's) · 2026-10-21
- Assistant · "a reason this panel has no words for yet": add the row for the 503 UNAVAILABLE refusal · E59 (C92 makes the panel reachable) · 2026-10-21
- Reader's copy · heading in capitals (internal words) · CA21 · 2026-10-21
- Capture · the 504 sentence "kept nothing" is untrue when the bytes were kept (`control-plane` draws what was kept, C12; the sentence is the design's) · FC-04 · 2026-10-21
- Timeline, Standard, Money · events without description/date/participants at creation; progressions typed as bar-separated lines (C55, DESIGN, the operation completes through "Add who took part" and "Record a dated fact") · E34, E35 · 2026-10-21
- Welcome wizard · six side-trip steps point at nothing · S-15; Close form · first large block on a new project · S-09; inactive member told "password does not match" (oracle or help: Bob's policy) · S-18 · 2026-10-21

No WORDS item stops a member completing an operation, so none is CODE (K4270). W8 ("Read what is due" prints an AI prompt) and W15 are MAJOR but only misleading.

## 5. DESIGN: one HANDOFF to the UX design lane (only where an operation cannot complete)

> **HANDOFF to the UX design lane from BOB #239 (T51 fix round 2).** The T51 build walk found operations a member cannot finish with the screens as drawn. Please draw them; BOB gives the code to a job when your drawing exists.
> 1. **A project's earlier drafts (C49; walk CA32, CA62, CA61).** The ceremony, the review copy and the case editor show only the newest draft. A reader who commented on an earlier draft, and that reader's live link, cannot be reached or stopped from the screen except by typing the address; the editor lists two drafts with identical titles. Needed: a chooser among the project's drafts (named by scope and date) on the ceremony, the review copy and the editor, and every live grant on any draft stoppable from the screen. Code ready: `casedraft` lists drafts; `reviewrevoke` stops a grant.
> 2. **A records request to a federal office (C64; CA51).** No office is known for a federal body and only an administrator can add one (Settings > Places), so a member cannot file. Needed: a member names the office (type and law) inside the request, or federal offices are seeded; the choice is Bob's policy (BOB brings it with options).
> 3. **Controls that do not exist (walk FC-07/E05, FC-23, FC-30, E41).** The project page draws no list of its documents; no control gives a stored login (DEC-381) or lists "Ask for a capture later" requests; none says a passage names a subject (C28 to C31); none flags two documents as contradicting by hand (UC-155).
>
> Not in this HANDOFF (the operation completes): C55 events and progressions forms, S-09, S-15, S-18 (in `later-ux.md`).

`screens-publish` (wave 2) leaves C49 until the lane answers; its START applies a drawing if one exists then. C64 and the others wait only for the design (named reason for P19).

## 6. DATA: the scanner (C84)

`git merge-base --is-ancestor bf97a18595 19e68f9103` is **true**: the freshclam change is in the deployed commit. It is **not** in the 0.86.0 cut (`1a17154149`: false). But the fix changed the scanner **image** (`container/scanner.mjs`, `Dockerfile.scanner`), and `file-scanner/fleet-member.json` names the same image digest (`sha256:293e2fce…`, `source_sha256` `99df90a8…`) at `e8dba79a04` (before the fix), at `bf97a18595` and at `19e68f9103`; the fix's own record says the digest is "bundler's concern at the cut (R36)", and `deploy-test.yml` states that a container member's image must already be published by `container-images.yml`. So the copy runs the **old image**, the new Worker's `/update` route has nothing to talk to, and the 403 stays. This is not a code cause; no job holds it. What follows (a deployment step outside the tranche, named under P19): (1) publish the scanner image from the tranche tip with `container-images.yml` and write its digest and `source_sha256` into the marker and `wrangler.jsonc` (bundler R36; R37 refuses a stale one); BOB checks mechanics §16 for whether that dispatch is Bob's to approve; (2) redeploy `file-scanner`; (3) call `POST /mirror` once and read `error` and `/version` `signatures.last_error`; (4) confirm the 48 to 82 waiting files scan on the next tick. If freshclam is still refused under its own identity, it is the signature service's decision (outside the product) and goes to Bob. C83 (the false "files are checked" sentence) is CODE in this round either way.

## 7. Open points: recommendations for BOB

1. **Is a wrong held capture retired?** No. A held (not yet vouched) copy is *set aside*: `heldsetaside` with a required reason (capture R79; `heldrestore` R81 undoes it; `heldActsOf` R84 is the history; DEC-141), and `retire` is for verified Information only (promotion R16 `CITED` fence; State Rules v1.5 §4.1). The plane already allows exactly that, so the document page's "Stop using this copy" draws "set aside" for a held copy, and a vouched, cited copy gets its own CITED sentence naming the citing questions. Meanwhile: C33 runs in `screens-inquiry-2` on this reading (RC-5a); no promotion change, no Bob decision.
2. **Is a published case's empty EVIDENCE list by design?** Yes for documents: the published page says a document "is not published with the case" (public-read R39; word rows `screen.published.leg.namedonly`, `screen.published.rests.on.the.council.minutes`; DEC-330 B306 A76/A77/A79, DEC-336 B318 4). The defects are the editor's label ("What it says" under "left out of this case") and the sign step's "0 pieces of evidence". Meanwhile: C47 fixes those two in `screens-publish`; publishing the cited documents with the case would be a new disclosure feature and Bob's.
3. **CA24 (the owner's Reply refused NO_REVIEW_COPY) needs a live read.** Recommend one read-only check on biosmoke8 by the walker, in parallel with wave 1: the owner's `reviewcomment` for each draft id of that project (the drafts from `casedraft`), noting which draft the comment belongs to. Rests on: `review/index.mjs:839-845` (member viewer accepted), `control-plane/index.mjs:857-897` (`caseReader` derives the viewer), `screens-publish/review-copy.mjs:179-185` (posts `draft` in the query), review R37 (a named draft). Meanwhile: `review` reproduces with two drafts and the owner; if the cause is the draft sent (CA62), `screens-publish` sends the comment's own draft id and C49's chooser remains the lane's.
4. **C19: is the reading of a web page its main content?** Recommend yes, as RC-3: the canon already says furniture is "not the document's claim about its own subject" (Content Framework v0.10 regions: evidentiary, presentational, mechanical) and `subresources` R8 already uses the same regions. It is Bob's because it changes which passages a member may cite. `text-chain` (wave 1) starts when the ruling is in `build/rulings.md`; the job checks that extents already cited still resolve.
5. **C9: should a capture of a document the group already holds also file it for the member's question?** Recommend: keep R49's "write no document", but record the capture as made for the question (`capture` R94, the record R22 already writes), name and link the holder; the project's own list of documents is the lane's (HANDOFF 3). RC-2.
6. **C51: default of "Keep this key on this device".** Four keys for one administrator is a real harm, but key custody is policy. Recommend: this round adds "load my key file" and reuse of a key the device holds (no change of default); Bob decides whether the default becomes on.
7. **C5's unconfirmed side.** One cause job holds acquisition, capture and sources so either half can be fixed; the first test is a three-part fixture (acquisition R10, R11). One live `op=capture` of the INFO-2026-0042 sha belongs in the re-walk, not before.

## 8. Could not place, or left out, and why

- C49, C55, C64: DESIGN, drawn by the lane (section 5). C84: deployment (section 6). WORDS: section 4.
- Measured after the redeploy (P19, outside the tranche): C13's container cold start against page time (the round moves the render out of the bound; the numbers come from the re-walk); C18's share of words on real photographs (jobs measure fixtures); C12/C14 wall times (jobs assert read counts and bounds).
- Halves I could not trace (the START says so; each job asks if the half is in a module it does not hold): C5, C8 (plane side), C13 (the container), C26 (plane line), C28 (put-back act), C38, C42, C52, C54 (project events read), C60 (lag or fault), C93.
- C81 is CSS-first in `cause-shell-t51`; a control still cut at 390 px afterwards is fixed by the screen's own job in wave 2 (they read the shell's tests).
- C70's plane variant (vouch to-dos in `op=queue`) is not taken: the screen counts and draws once; C72 is the queue's.

## 9. After the waves

BOB merges each wave in the order above, runs the whole suite on the merged tranche, redeploys biosmoke8 (with the scanner image step of section 6), then re-walks the findings of every cause above (the Findings lines of CAUSES.md name them), plus the live reads of open points 3 and 7.
