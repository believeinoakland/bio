# T53's JOURNEYS entries: the alpha's defects by owning module (PLANNING L11)

**Status** · DRAFT for BOB · PLANNING #2, 2026-10-27 (K5471 (6), K5473 (3)). JOURNEYS W6-W7's register (130 defects, 6 BLOCKS) and READY requirement drafts (`lane-journeys/DRAFT-requirements-1..3.md`, about 109 lines) on `lane/journeys`, read whole by a Sonnet reading worker and set out one entry per defect under its owning module. The plan (`plan-T53-draft.md`) points here per module; this file is the detail a job reads at START (K5434 (4)). Lane overlaps marked (inferred) rest on a keyword match only and are checked when each job's reading set is drawn. Section B's 19 points are Bob's (going to him through BOB, K5473 (3)); a line waiting on one is bracketed in the draft.

## Keys

- Pointer form: `REG/REG2/REG3 R-n` = `lane-journeys/REGISTER.md / REGISTER-2.md / REGISTER-3.md` row; `D1/D2/D3 <module> R?k` = `lane-journeys/DRAFT-requirements-1/2/3.md`, that module's section, provisional line `R?k`. `Qn(Dp)` = Bob's "Not decided" point n of draft part p (section B).
- **BLOCKS** = the register's six: R-1, R-65, R-66, R-67, R-68, R-94.
- **MERGE T52-nn** = the defect is wholly a carried entry (no new entry; the T52 entry takes the pointer). **+T52-nn** = a carried entry covers part; the rest is new and merges into that entry (the register's "part the entry does not cover"). No mark = no T52 entry (97 rows).
- **LANE** = covered or touched by another lane's draft, as found by me (from the drafts' own "Needs from other lanes" and a keyword check of `build/plan/beta/*`; "(inferred)" where only a keyword match).
- W ids: carried entries are written `Wnn/T52-nn` where the carried file gives the W id; new defects use the register id.
- Lines whose cause the register did not trace say "not traced". A line "(owner half)" is a second line for the same defect in the owner module.
- Where a draft line sits under a module different from the register's owner I name both.

---

## A. Plan entries per owning module (by layer, `build/layers.md` order)

### Layer 1

**jurisdictions**
- T53 · R-66 · BLOCKS · a team with no jurisdiction profile has `proceeding_kinds: []`, so "Register the proceeding" offers only "Nothing here" · REG2 R-66 · D2 jurisdictions/affordances R?1 (waits Q2(D2)). LANE: PLANNING A (jurisdictions) and CAPABILITIES N1257 jurisdictions also change this module (see OUT collisions; not read by me).

### Layer 2

**promotion**
- T53 · R-73 · "Open a question from this chain" promotes with no project and a raw-id title · REG2 R-73 · D2 explore/promotion R?1 (waits Q5(D2)).

### Layer 3

**provenance**
- T53 · R-1 · BLOCKS · testimony filer makes a bundle without `data/dataset.json`, so ratification refuses it · REG R-1 · D1 screens-intake R?1. MERGE T52-44 (pull filer, store-door) and T52-85 (archive filer, control-plane); testimony filer FIXED IN CODE (T52-9, R81) but failed on deployed 0.87.0: redeploy and re-walk (PLATFORM). LANE: PLATFORM (deploy).
- T53 · R-24 · testimony filer does not carry the route's project (Held says "No project yet") · REG R-24 · D1 provenance R?1 (owner half), screens-intake R?5. Register: SAME AS B-K14, no T52 entry.

**capture**
- T53 · R-21 (owner half) · a member's own testimony lacks the author stamp, so it is not in "Mine" · REG R-21 · D1 capture R?1. +T52-59 (B-K17: order and search only).
- T53 · R-22 · Held shows an archive's files "Refused", Archive says "filed and held for review" · REG R-22 · D1 screens-intake R?3 (screens; owner capture not traced).
- T53 · R-23 · `#heldActRefusal` refuses set-aside when the stamped author is an administrator or machine · REG R-23 · D1 screens-intake R?4 (waits Q3(D1)); owner capture, control-plane (stamp).

**file-safety**
- T53 · R-28 · "Open the original" saves under the digest, not the file name · REG R-28 · D1 screens-intake R?6 (register owner file-safety). LANE: FILES (named in D1 Needs).
- T53 · R-64 · safe view draws a comma-bearing text note as a sheet (type by sniffing); breadcrumb has no link back · REG R-64 · D1 screens-intake R?10 (module file-safety). LANE: FILES (named in D1 Needs; safe view by sniffed type).

### Layer 5

**entities**
- T53 · R-39 (owner half) · duplicate office entities (same folded name, same body) are all kept · REG R-39 · D1 entities R?1 (waits Q5(D1)). Register: SAME AS E-N9, no T52 entry. LANE: CAPABILITIES N1257 layer-names matches "duplicate office|folded name" (inferred; check).
- T53 · R-69 (owner half) · the note given at follow time is not kept/returned for a person · REG2 R-69 · D2 entities R?2.
- T53 · R-70 (owner half) · first alias has no `declared_by`, so the screen cannot tell hand-typed from roster · REG2 R-70 · D2 entities R?1.
- T53 · R-67 · BLOCKS · a team's only office-like body is a court via Proceeding; People has no body kind · REG2 R-67 · D2 screens-action request R?1 (waits Q3(D2) between request add, People body kind, or both).

**events**
- T53 · R-84 · `timeline` with `captures=` answers 502 on every standard-page load · REG2 R-84 · D2 events R?1 (owner half), screens-investigate R?17 (screen half). Register: SAME AS E-K4; the plane fix is NOT in carried-T52-R1.md (T52-74 covers only the screen sentence after W7). LANE: PLATFORM (D2 Needs: which limit the 502 hits).
- T53 · R-83 (owner half) · an event row has no edit/withdraw/"date this" control · REG2 R-83 · D2 events R?2 (owner to confirm which act exists; if none, Bob's decision; unresolved).
- T53 · R-68 (dating half) · BLOCKS · an event stays UNDATED; a dated fact is a separate list · REG2 R-68 · MERGE T52-74 (W30; C-K11+E-K1); D2 adds only the journey 11/22 steps 4 and 8 walk test (TESTS-SWEEP).

**money**
- T53 · R-76 (owner half) · comparison answer lists every dimension, not the differing ones · REG2 R-76 · D2 money R?1.

**explore**
- T53 · R-74 (owner half) · preset answers kinds but not a name the screen can draw; render never reads `view.ui.preset` · REG2 R-74 · D2 explore R?2.
- T53 · R-86 · Connections map with one included figure holds only the trail's box · REG2 R-86 · D2 screens-investigate R?18 (owner money, explore). Register: SAME AS C-K7, no T52 entry.

**calculations**
- T53 · R-65 · BLOCKS · Count refused "made by another member": `selectionResolve` compared to the viewer, not the creator · REG2 R-65 · D2 calculations R?1 (which side holds the other identity is unproven). retrieval R19 `SELECTION_NOT_YOURS` unchanged.

### Layer 8

**publication**
- T53 · R-96 (owner half) · publishing an edition files no edition entry on the docket · REG3 R-96 · D3 publication R?1 (waits Q2(D3)).

**docket**
- T53 · R-94 (owner half) · BLOCKS · entry kinds the screen offers are not the kinds the act accepts for the viewer; correction/withdrawal/court order not fileable; Outcome fields missing · REG3 R-94 · D3 docket R?1 (waits Q1(D3)).

**public-read**
- T53 · R-108 (owner half) · case-level evidence entries carry no name/locator/fingerprint · REG3 R-108 · D3 public-read R?1.
- T53 · R-122 (owner half) · `groupidentity` not readable by a signed-out reader · REG3 R-122 · D3 public-read R?1.

**case-import**
- T53 · R-111 · text file as case file: "each way it departs … is named" names nothing; cause not traced · REG3 R-111 · D3 screens-publish R?16 (register owner case-import; no owner-module line).

**case-authoring**
- T53 · R-100 (owner half) · unchanged-statement refusal does not tell the screen which box (`field`) · REG3 R-100 · D3 case-authoring R?1.
- T53 · R-103 (owner part) · heading counts the ratified draft as the next edition · REG3 R-103 · +T52-78 (D-K9 screen half); owner half has no line (D3 puts it in screens-publish R?8 only).

**review**
- T53 · R-98 (owner half) · a reader grant's acknowledgement is stored with no reader name · REG3 R-98 · D3 review R?1.
- T53 · R-99 · owner's "Acknowledge what it leaves out" reaches the reviewer route, 404 `NO_REVIEW_COPY` · REG3 R-99 · MERGE T52-26 (W13, case-inputs), still open on 0.87.0; no draft line.
- T53 · R-107 (owner part) · acknowledge/comment both answer "Sent to the team." · REG3 R-107 · D3 screens-publish R?12 (waits Q5(D3)); register owner review.

### Layer 9

**actions**
- T53 · R-117 (owner half) · move to `resolved` with no resolution defaults to "complied" · REG3 R-117 · D3 actions R?1.
- T53 · R-119 · "No reply came by the date" accepted ahead of the due date; replies listed in recorded order · REG3 R-119 · MERGE T52-30 (U25, write half). +T52-30 for the order of replies: D3 screens-action R?7 (waits Q3(D3)).
- T53 · R-120 · new action's named addressee ("Public Works Director") stored as state audience, never drawn · REG3 R-120 · D3 screens-action R?8 (owner actions).
- T53 · R-118 · reply stage after the request refused; "If it follows" omits position 0 · REG3 R-118 · D3 screens-action R?6 (owner action-replies, actions, action-grammar R5).
- T53 · R-115 · proposed law has no control to choose it · REG3 R-115 · MERGE T52-81 (E-K6); no draft line.
- T53 · R-116 · risk line reads "the tier option opt-1 of plan PLN-…" · REG3 R-116 · MERGE T52-32 (W18); no draft line.
- T53 · R-113 · "Take this up" is forgotten on reload; queue effect not traced · REG3 R-113 · D3 screens-action R?13 (owner plan-work R5, R11; queue-producers to settle).
- T53 · R-125 · options table omits office and tier; "Assumed:" unexplained · REG3 R-125 · D3 screens-action R?11 (owner action-plans). Register: SAME AS walk-T51b-live/C.md Plan 2, 5; no T52 entry.
- T53 · R-126 · "Checks · 3" runs together, unexplained · REG3 R-126 · MERGE T52-33 (U19; the repair is the screen's); no draft line.
- T53 · R-112 · checkpoint draws no test and no "if met / if not met" · REG3 R-112 · D3 screens-action R?12 (owner action-plans data held).
- T53 · R-78 · hold screen: notice link vanishes after the hold; encoded JSON in link; "Release" offered with no hold · REG2 R-78 · D3 screens-action R?3 (owner action-holds).
- T53 · R-79 · typed date shown as "CONFIRMED"; "Remind me" silent; no-law work-out dead-ends · REG2 R-79 · D2 screens-investigate R?11 (owner action-clocks).
- T53 · R-68 (matter half) · BLOCKS · Matter shows no "Open an escalation"/"Decline to escalate" after a dated event + determination · REG2 R-68 (S4 rated BLOCKS) · D3 screens-action R?1 (owner escalation, op-declarations). T52-74 covers the timeline half.

### Layer 11

**affordances**
- T53 · R-66 (read half) · BLOCKS · `proceeding_kinds: []` returned when no profile (`affordances/facts.mjs:470-487`) · REG2 R-66 · D2 jurisdictions/affordances R?1.

**interface-shell**
- T53 · R-2 · phone row rule never applies to published-case rows (`front` cs-row; auto minmax grid), text column 8 px · REG R-2 · D1 interface-shell R?1.
- T53 · R-10 · no screen says the assistant is not ready (Team's assistant, Ask, dock, Plan tray) · REG R-10 · D1 interface-shell R?9 (waits Q6(D1)); LANE: AI-DESIGN (`assistantreadiness` op, `draft-instance-setup.md` R109, `draft-assistant-screens.md`), D1 Needs names the readiness fact. No T52 entry.
- T53 · R-31 · a press shows no word for 150-250 ms and acts take 2.6-4.6 s on a shared copy · REG R-31 · D1 interface-shell R?4. Register: SAME AS B-K20; no T52 entry. LANE: PLATFORM time budgets (draft `time-budgets-draft.md`) for the act times.
- T53 · R-33 · tooltip opens over the text it explains; headings/spans are tab stops · REG R-33 · D1 interface-shell R?2 (waits Q7(D1)). Register: SAME AS B-20; no T52 entry.
- T53 · R-34 · no skip link, 14-22 Tab stops before the first control, unnamed stops · REG R-34 · D1 interface-shell R?3 (waits Q7(D1)).
- T53 · R-46 · ~350 px empty space above the heading on short public pages at 390 · REG R-46 · D1 interface-shell R?6 (threshold 422 px provisional, UX-DESIGN to confirm).
- T53 · R-51 · "The places the tabs below do not hold" with no tabs; `more` has no `data-screen` · REG R-51 · D1 interface-shell R?8. Register: SAME AS LA-17(d); no T52 entry.
- T53 · R-53 · "Asks for a reason" mark on buttons that ask nothing; stale lines · REG R-53 · D1 interface-shell R?7. +T52-74 (C-K18) and T52-81 (C-K20) carry the walked buttons; the sweep is new.
- T53 · R-101 · weight popover's Confirm/Cancel below the viewport, not scrolled to · REG3 R-101 · D1 interface-shell R?5.
- T53 · R-127 · empty required field opens the reason box before naming the missing field · REG3 R-127 · D3 screens-action R?14 (changes interface-shell R119; the draft heads it under screens-action: owner is interface-shell).
- T53 · R-130 · console errors on normal acts (403 on first `caseratify`, 404 `statementack`, 404 `reviewcopy`) · REG3 R-130 · NO DRAFT LINE; waits Q4(D3); D3 Measure "Console"; LANE: PLATFORM (D3 Needs: step-up 403).
- T53 · R-41 · signed-out deep link/unknown address shows the sign-in front with no word · REG R-41 · MERGE T52-49 (W23, A-K12); no draft line.
- T53 · R-54 · queue shows three numbers (4/6/10) · REG R-54 · MERGE T52-49 (W23, A-K11) and T52-62 (Queue half); U4 CANNOT TELL; D1 Measure only; no draft line.
- T53 · R-52 · cold loads 2.1-11.8 s over the 2 s bar (K4354) · REG R-52 · no draft line; owner not placed (control-plane, plane named by S4). LANE: PLATFORM time budgets, T52-42/T52-43 CHANGED BY THE BETA (D1/D2/D3 Measure and Needs).

**screens-entry**
- T53 · R-3 · signed-in member sees the sign-in form on `/app/front` and after the tour · REG R-3 · D1 screens-entry R?1 (waits Q8(D1)).
- T53 · R-45 · `forgot` fields 1232 px wide at 1280 · REG R-45 · D1 screens-entry R?2.

**screens-wizards**
- T53 · R-36 · every wizard filter shows the library tooltip; empty lists say "listed to … administrators" · REG R-36 · D1 screens-settings R?13 (module screens-wizards).
- T53 · R-37 · shipped wizards read "Approved by BOB" · REG R-37 · MERGE T52-35 (W19, A-K16, waits the approver's word); no draft line.

**screens-settings**
- T53 · R-4 · Appearance and On/Off are bare green words, no selected state, no label · REG R-4 · D1 screens-settings R?1.
- T53 · R-5 · 22 identical "Revoke your signing key" buttons; one click, no word after · REG R-5 · D1 screens-settings R?2 (waits Q1(D1)); list layout is T52-58 (A-K13). LANE: PLANNING A5/A6 (per-key signing items in queue: `lines-A5-A6-signing.md`, `lines-A6-queue-acts.md`) touches the same acts on the queue, not this screen (inferred).
- T53 · R-6 · "Take a copy of the record" stays "Working…"; the list of copies draws nothing · REG R-6 · D1 screens-settings R?3 (waits Q1(D1)).
- T53 · R-7 · missing date reported as "Dates in the wrong order" · REG R-7 · D1 screens-settings R?4. Register: SAME AS B-35; no T52 entry.
- T53 · R-8 · Security says "stayed near your team's usual" above a table showing 9 against usual 0 · REG R-8 · D1 screens-settings R?5 (waits Q2(D1)); owner also credentials (counts).
- T53 · R-9 · assistant sentence ends "exploring is no." · REG R-9 · D1 screens-settings R?6.
- T53 · R-11 · note "Turn it into" asks for record ids · REG R-11 · D1 screens-settings R?7 (owner also hypotheses).
- T53 · R-12 · "Delete your note" is one press, no word after · REG R-12 · D1 screens-settings R?8 (waits Q1(D1)).
- T53 · R-13 · tie preview fills the kind where the party goes · REG R-13 · D1 screens-settings R?9 (module not traced: screens-settings or screens-investigate). Register: SAME AS B-10; no T52 entry.
- T53 · R-35 · language list has one option, sentence appears twice · REG R-35 · D1 screens-settings R?10.
- T53 · R-38 · "No place is chosen" above a list naming two places · REG R-38 · D1 screens-settings R?11.
- T53 · R-39 (screens) · same office listed twice in office lists · REG R-39 · D1 screens-settings R?12 (waits Q5(D1)); also matter, request.
- T53 · R-47 · one admin's PROJECTS cell is 22 names in a run · REG R-47 · MERGE T52-58 (A-K13).
- T53 · R-48 · "Not joined yet" rows show no handle and no "n of m endorsed" · REG R-48 · MERGE T52-58 (A-K6, screen half; owner half FIXED IN CODE).
- T53 · R-49 · "In the last October 20, 2026 to October 27, 2026" · REG R-49 · MERGE T52-58 (A-K15).
- T53 · R-50 · website check names the old `civicos-group.json` · REG R-50 · MERGE T52-41 (W21, instance-setup).

**installer-steps**
- T53 · R-14 · "Running its containers: …" is a fragment; the site's list omits it · REG R-14 · D1 setup-words/installer-steps/site R?1.

**site**
- T53 · R-44 · `/start`'s "Create your team" is a 130x23 px inline link · REG R-44 · D1 site R?2.
- T53 · R-42 · civicsmith.org "address … published here before the site opens" · REG R-42 · no line (deliberate placeholder until the stewards' address is named).
- T53 · R-43 · console error: Cloudflare beacon blocked by the site's CSP · REG R-43 · no line (account setting, not code); D1 asks PLATFORM to say switch off or allow. LANE: PLATFORM.

**screens-intake**
- T53 · R-1 · BLOCKS · testimony, archive members and pulled knocks cannot be vouched, read or cited · REG R-1 · D1 screens-intake R?1 (see provenance for merges T52-44, T52-85, T52-9).
- T53 · R-21 · Held captures: 50 a page, no project filter, no link from the confirmation, testimony missing from Mine · REG R-21 · D1 screens-intake R?2. +T52-59 (B-K17: order and search); the project filter, confirmation link and Mine are new.
- T53 · R-22 · see capture (D1 screens-intake R?3).
- T53 · R-23 · see capture (D1 screens-intake R?4).
- T53 · R-24 · see provenance (D1 screens-intake R?5).
- T53 · R-29 · a member told another's record is missing or damaged; own project's document "Nothing is here" · REG R-29 · D1 screens-intake R?7 (waits Q4(D1)); owner capture.
- T53 · R-56 · stage word breaks at 390 ("Investigatin/g"); Held row has an empty square; small targets · REG R-56 · D1 screens-intake R?8; 44 px part is T52-52 (CANNOT TELL, N1263).
- T53 · R-57 · every inbox row reads "less than 1 KB handed in"; no link after "Move into the record" · REG R-57 · D1 screens-intake R?9. Register: SAME AS B-K19 for the link (T52-59, T52-66 only wait on it); titles and legend new.
- T53 · R-58 · doorbell receipt above the form at 390; phrase label twice; chooser keeps the file · REG R-58 · D1 screens-intake R?11 (the doorbell lines are screens-entry/screens-intake per the draft's own note).
- T53 · R-90 · `/app/registers` draws "Nothing is here" · REG2 R-90 · no line (owed work, K4403, DEC-406/409). LANE: CAPABILITIES N1259-b registers module (inferred).

**screens-daily**
- T53 · R-15 · "Vouch for photos" on PDFs, web pages, zips · REG R-15 · D1 screens-daily R?1 (registry labels `act.release.label.home`, `…dash-project`; UX-DESIGN).
- T53 · R-16 · Find/Ask show raw markdown, ISO times, 64-hex address, "Passage -" · REG R-16 · D1 screens-daily R?2. +T52-62 (B-K5 display half) and T52-104 (red `browse.test.mjs:212`); the 64-hex archive address and "Passage -" tail are new.
- T53 · R-27 · "N documents could not be read for this" with no reason, though the reading holds "$61,500" · REG R-27 · D1 screens-daily R?3 (owner also retrieval, reading-pipeline).
- T53 · R-63 · help ends with no way on; records help names no law · REG R-63 · D1 screens-daily R?4 (help half) and D3 screens-action R?16 (records-help half).

**screens-inquiry**
- T53 · R-17 · strength stays "Unrated" after citing both sides; no "What this passage earns" fold · REG R-17 · MERGE T52-66 (C-K1+D-K2; C-K2 waits UX-DESIGN B541); no draft line.
- T53 · R-18 · developer sentences and 64-hex fingerprint on the document page · REG R-18 · D2 screens-inquiry R?1. +T52-66 (B-K7+C-K16: ISO instant); B-K6 sentences have no entry. LANE: FILES (D2 Needs: how a reading is described).
- T53 · R-19 · "Shared origin" names two passages of one file · REG R-19 · MERGE T52-66 (C-K4+D-K11); no draft line.
- T53 · R-20 · READINGS shows "reading-1" · REG R-20 · MERGE T52-66 (D-K12); no draft line.
- T53 · R-25 · new project's dashboard: "Still loading" then vanishes · REG R-25 · D2 screens-inquiry R?2.
- T53 · R-30 · document page says "Set to the question…" over "Choose a question"; no supports/cuts word after citing · REG R-30 · D2 screens-inquiry R?3.
- T53 · R-32 · findable project: member gets "hidden project" refusal, no "Ask to join" · REG R-32 · D2 screens-inquiry R?4.
- T53 · R-40 · "Nothing is here" with no button on project/document/question/person · REG R-40 · D2 screens-inquiry R?5.
- T53 · R-55 · breadcrumb "Projects > Project" for an unjoined project · REG R-55 · MERGE T52-66 (D-K10); no draft line.
- T53 · R-59 · empty Conclude gives a plane sentence about "taking the place of a named reading" · REG R-59 · D2 screens-inquiry R?6.
- T53 · R-60 · "1 questions - 1 resting…"; "Unrated Unrated" · REG R-60 · D2 screens-inquiry R?7.
- T53 · R-61 · pickers/lists show every team document, other projects' questions, standards, findings · REG R-61 · D2 screens-inquiry R?9 (waits Q1(D2)); standards list D2 screens-investigate R?16. +T52-76 (U23, documents). LANE: PLANNING A7 (DEC-463, document picker's two scopes: `lines-A1-A7-subject-pickers.md`) covers the document picker and the three screens modules; its Bob point A7 §7.1 matches Q1(D2).
- T53 · R-62 · non-member dashboard asks `casedrafts` and gets 400 · REG R-62 · D2 screens-inquiry R?8 (policy on handled 4xx: Q4(D3)).
- T53 · R-110 · signed case: "Capture/Connection Not graded yet", long "NO BAR IS RECORDED" · REG3 R-110 · D3 screens-publish R?15 (waits Q6(D3)); register owners acquisition, attestation, screens-publish. Register: SAME AS walk-T51b-live/C.md MAJOR 1; no T52 entry of its own.

**screens-investigate**
- T53 · R-69 · note given when following a person is shown nowhere · REG2 R-69 · D2 screens-investigate R?1 (+ entities R?2 owner half).
- T53 · R-70 · every first alias reads "the name on the city roster" · REG2 R-70 · D2 screens-investigate R?2 (+ entities R?1).
- T53 · R-71 · People filters change nothing until Search; empty sentence wrong · REG2 R-71 · D2 screens-investigate R?3.
- T53 · R-72 · section titled career/credentials/memberships/interests but only six fact kinds offered · REG2 R-72 · D2 screens-investigate R?4 (owner people; waits Q4(D2)).
- T53 · R-80 · strong bases of "Say another record is this person" give no place for evidence · REG2 R-80 · D2 screens-investigate R?5 (owner people, identity grammar; not traced). F9 follow-on.
- T53 · R-81 · progression steps typed as bar-separated lines with machine words · REG2 R-81 · D2 screens-investigate R?6 (owner progressions).
- T53 · R-83 · hunch form's "Beside which question" empty with no pointer · REG2 R-83 · D2 screens-investigate R?7 (event controls: events R?2).
- T53 · R-85 · raw ISO times and INFO ids in citations and picker titles · REG2 R-85 · D2 screens-investigate R?8 (owner also capture titles). Scope part is R-61.
- T53 · R-75 · "Committed against paid" has no contract choice drawn · REG2 R-75 · D2 screens-investigate R?9 (owner also money).
- T53 · R-76 · Compare lists MNY ids; "differ in" lists all dimensions · REG2 R-76 · D2 screens-investigate R?10 (+ money R?1).
- T53 · R-74 · "Use a preset" draws the same graph and says nothing · REG2 R-74 · D2 screens-investigate R?12 (+ explore R?2).
- T53 · R-91 · map wider than the phone and clipped; nodes focus with no ring · REG2 R-91 · D2 screens-investigate R?13.
- T53 · R-92 · small words (nine strings) in people, explore, request, timeline, hold · REG2 R-92 · D2 screens-investigate R?14 (+ screens-action request R?2; hold's "legal / retaliation" in D3 screens-action R?3).
- T53 · R-93 · "Attach a source to a declared step" draws an 18,000-character document as the chooser · REG2 R-93 · D2 screens-investigate R?15.
- T53 · R-89 · standard: "Kind of copy not known"; "Who set it" chooser and text box; other projects' standards · REG2 R-89 · D2 screens-investigate R?16 (question 1 for the list). Register: SAME AS C-K17, E-N9; no T52 entry.
- T53 · R-84 · see events (screen half: D2 screens-investigate R?17).
- T53 · R-86 · see explore (D2 screens-investigate R?18).
- T53 · R-82 · "Link events" accepted, no link drawn · REG2 R-82 · MERGE T52-74 (C-K10 draw half; plane half FIXED, events R57); no draft line.
- T53 · R-87 · Connections read "award - undated", a lone grade letter · REG2 R-87 · MERGE T52-74 (C-K22 draw half); no draft line.
- T53 · R-88 · "-19400.00 USD", "a adopted figure" · REG2 R-88 · MERGE T52-74 (C-K17); no draft line.
- T53 · R-79 · see action-clocks (D2 screens-investigate R?11).

**screens-publish**
- T53 · R-94 · BLOCKS · docket form's four kinds all refuse; no correction, withdrawal or court order · REG3 R-94 · D3 screens-publish R?1 (waits Q1(D3)); + docket R?1.
- T53 · R-95 · project page's "Docket" link opens "Nothing is here" · REG3 R-95 · D3 screens-publish R?2 (module also screens-inquiry project.mjs:431 link). T52-78 (D-K18) is the nearby entry for the raw project id.
- T53 · R-96 · after edition 2 the public docket and case page show no change · REG3 R-96 · D3 screens-publish R?3 (waits Q2(D3)).
- T53 · R-97 · refused Reaction listed as "drafted, not yet posted"; "Post it" gives no cause · REG3 R-97 · D3 screens-publish R?4.
- T53 · R-98 · owner's page: "Acknowledged by A member of your team" for Lee Outsider · REG3 R-98 · D3 screens-publish R?5 (+ review R?1).
- T53 · R-100 · edition 2 refused without naming the unchanged box; ceremony does not link to the editor · REG3 R-100 · D3 screens-publish R?6 (+ case-authoring R?1).
- T53 · R-102 · member sees the whole ceremony, no "Confirm your ties"/"Ask an owner to sign" · REG3 R-102 · D3 screens-publish R?7 (owner ratification owner rule).
- T53 · R-103 · editor reads "next edition (3)" / "CASE-… - 3" after edition 2 · REG3 R-103 · D3 screens-publish R?8. +T52-78 (D-K9 screen half, "Draft:" heading); the "(3)" and raw id are new.
- T53 · R-104 · status lines are appended and not replaced by the next act · REG3 R-104 · D3 screens-publish R?9. +T52-78 (D-K6, D-K7 for the case editor); stale refusals on docket/outside page are new.
- T53 · R-105 · two "Stop sharing Ends something" buttons; press gives no word · REG3 R-105 · D3 screens-publish R?10. +T52-78 (D-K14, "ended" word); same-name duplicate buttons new.
- T53 · R-106 · outside page heading "A DRAFT THAT DOES NOT NAME A CASE YET…"; never says who shared it · REG3 R-106 · MERGE T52-78 (D-K15; the walker called it NEW). D3 screens-publish R?11 adds only "who shared it" as a new part.
- T53 · R-107 · "Acknowledge it" and "Send your comment" both answer "Sent to the team." · REG3 R-107 · D3 screens-publish R?12 (waits Q5(D3)).
- T53 · R-108 · case-level EVIDENCE draws an empty row · REG3 R-108 · D3 screens-publish R?13 (+ public-read R?1).
- T53 · R-109 · "Read the case", "Check it" (short paste), "Print the case" show nothing · REG3 R-109 · D3 screens-publish R?14 (owner also public-read).
- T53 · R-111 · see case-import (D3 screens-publish R?16).
- T53 · R-122 · public pages carry no group name at head, no "Made with Civicsmith", tab "Your team" · REG3 R-122 · D3 screens-publish R?19 (+ public-read R?1).
- T53 · R-123 · doubled "When it becomes public", "the other button", 12-hex case name · REG3 R-123 · D3 screens-publish R?17. +T52-78 (D-K3, D-K17: singular nouns, ISO instant); doubled label and "other button" new.
- T53 · R-124 · "it is needed to capture."; stray full stop; "Which draft" twice · REG3 R-124 · D3 screens-publish R?18.

**screens-action**
- T53 · R-26 · dash-action: "WHOSE MOVE", "THE CLOCK", "NEXT" blank for most; no "needs you" tier · REG R-26 · D3 screens-action R?17. +T52-81 (E-K14 blanks); the "needs you" tier is new.
- T53 · R-67 · BLOCKS · see entities (request add; D2 screens-action request R?1, R?2 for the sentence; waits Q3(D2)).
- T53 · R-77 · hold notice carries `PROJ-` id, ISO instant, doubled full stop; "Record that I sent it" says nothing · REG2 R-77 · D3 screens-action R?2 (owner filings; setup-words `filings.hold_place`).
- T53 · R-63 · see screens-daily (records-help half: D3 screens-action R?16).
- T53 · R-114 · "Propose another law" with an empty citation does nothing · REG3 R-114 · D3 screens-action R?4.
- T53 · R-117 · "Move it to: resolved" records "the office complied" by default · REG3 R-117 · D3 screens-action R?5 (+ actions R?1).
- T53 · R-121 · `actionnew` "Choose the office" appears only after a question is picked · REG3 R-121 · D3 screens-action R?9 (owner also actions; uses the request add).
- T53 · R-128 · "Show the routes" leaves "No route is known…" with no cause · REG3 R-128 · D3 screens-action R?15 (owner reading-guides, agent-steps). Register: SAME AS E-part2 D12; no T52 entry (T52-84 covers U20-U24 only). LANE: AI-DESIGN if routes are an assistant result (D3 Needs).
- T53 · R-129 · `actionnew` refusals in developer words · REG3 R-129 · D3 screens-action R?10 (owner action-grammar, setup-words).

### Layer 11 modules named by the register that have no draft line of their own

- **control-plane**: R-1 (archive filer T52-85), R-23 (stamp), R-52 (cold start) as above; no control-plane line is drafted.
- **op-declarations**: R-53 (declared weight) and R-68 appear as owners in the register; no op-declarations line in D1-D3.
- **people, hypotheses, filings, action-clocks, action-holds, action-replies, action-plans, plan-work, reading-guides, agent-steps, progressions, retrieval, reading-pipeline, credentials, ai-accounts, acquisition, attestation, instance-setup, setup-words, stewards**: named as co-owners in the register; the drafts write the line in the screen module and, only where the table above shows "(owner half)", in the owner module. The job for each reads the screen-module line's "owner" clause.

---

## B. The 19 "Not decided" points (Bob's)

**Sorted by K5474 (BOB #322):** seven are Bob's, J1-J7 on QUESTIONS.html (draft 1 #3, #4; draft 2 #2, #4; draft 3 #1, #2, #5); eight are UX detail sent to UX-DESIGN (B558: draft 1 #1, #2, #6, #7, #8; draft 2 #1, #3; draft 3 #6); four decided by BOB as the lane recommends: R-39 (a duplicate office's add answers the existing office; lists draw one entry), R-73 (a question opened from a chain belongs to the explore page's project, else the member chooses), R-119 (an action's replies list by arrival day, then recorded order), R-130 with R-62, R-105 (a journey fails on a failed response the app itself asks for; the step-up 403 accepted). Their lines are unbracketed at writing.

Part 1 (`DRAFT-requirements-1.md`), 8 points:

| id | the point | module · lines that wait on it |
| --- | --- | --- |
| Q1(D1) | do one-click acts that cannot be undone ask first (revoke key, delete note, take copy)? rec: (c) key asks; note and copy say what they did | screens-settings R?2 (R-5), R?3 (R-6), R?8 (R-12) |
| Q2(D1) | Security when usual is 0 and count above 0; rec: (c) plain counts, name the floor | screens-settings R?5 (R-8) |
| Q3(D1) | may an administrator's own session set held material aside; rec: (a) if a human member, else (c) | screens-intake R?4 (R-23) |
| Q4(D1) | what a member sees for a record that exists but is not hers; rec: (c) shell's "You can't open this" | screens-intake R?7 (R-29) |
| Q5(D1) | duplicate office stopped or listed once; rec: (a) add answers existing | screens-settings R?12, entities R?1 (R-39) |
| Q6(D1) | where the assistant says it is not ready; rec: (b) banner plus per-screen sentence | interface-shell R?9 (R-10) |
| Q7(D1) | if headings stop being tab stops, how a keyboard reader reaches an explanation; rec: (a) explanation control | interface-shell R?3 (R-34), R?2 (R-33) |
| Q8(D1) | where a signed-in member lands from front/tour; rec: (a) Home for "Stop here"/"Back", (b) for `/app/front` | screens-entry R?1 (R-3) |

Part 2 (`DRAFT-requirements-2.md`), 5 points:

| id | the point | module · lines that wait on it |
| --- | --- | --- |
| Q1(D2) | what a picker lists; rec: (b) this project first, rest after widening | screens-inquiry R?9 (R-61); screens-investigate R?16 (R-89 list). Overlaps PLANNING A7 §7.1 |
| Q2(D2) | what a team with no profile can register as a proceeding; rec: (c) then (a) | jurisdictions/affordances R?1 (R-66, BLOCKS) |
| Q3(D2) | how an office comes to exist on a new team; rec: (c) both | screens-action request R?1 (R-67, BLOCKS); R?2 |
| Q4(D2) | what a person's page can record; rec: (a) add membership and credential | screens-investigate R?4 (R-72) |
| Q5(D2) | which project a question opened from a chain belongs to; rec: (a), (b) when no project | explore/promotion R?1 (R-73) |

Part 3 (`DRAFT-requirements-3.md`), 6 points:

| id | the point | module · lines that wait on it |
| --- | --- | --- |
| Q1(D3) | who files correction, withdrawal, court order and from where; rec: (a) owner from the docket page | screens-publish R?1, docket R?1 (R-94, BLOCKS) |
| Q2(D3) | is the docket edition entry made when an edition is published; rec: (a) automatic with "what changed" | screens-publish R?3, publication R?1 (R-96) |
| Q3(D3) | order of an action's replies; rec: (a) day arrived, then recorded | screens-action R?7 (R-119) |
| Q4(D3) | is a handled 4xx in the console a defect; rec: (b) only app-requested ones | no line is blocked in the draft; R-130 has no line; bears on R-62 (screens-inquiry R?8), R-105 and the console Measure |
| Q5(D3) | outside reader's acknowledgement public by name; rec: (b) only if she ticks | screens-publish R?12 (R-107); review R?1 related |
| Q6(D3) | where a signed case says what is ungraded; rec: (b) short line, fold | screens-publish R?15 (R-110) |

Open but not in the 19: events R?2 (R-83) "owner to confirm which act exists; if neither, Bob's decision"; the cause of R-65 (which side holds the other identity); the 422 px number (R?6 of the shell) for UX-DESIGN; the number of Tab stops from the Measure.

---

## C. Defects with no draft line and/or no owning module

No draft line (the module is named; all of these are carried or deliberate):
- Carried-only, no new line needed: R-17, R-19, R-20, R-55 (T52-66); R-37 (T52-35); R-41, R-54 (T52-49; R-54 also T52-62); R-47, R-48, R-49 (T52-58); R-50 (T52-41); R-82, R-87, R-88 (T52-74); R-99 (T52-26); R-115 (T52-81); R-116 (T52-32); R-126 (T52-33); R-106 (T52-78; only "who shared it" is new).
- Deliberate or not code: R-42 (marked placeholder, site); R-43 (Cloudflare account setting; PLATFORM to say beacon off or allow); R-90 (owed work K4403; screen `registers` undrawn).
- Open, no line yet: R-130 (console errors: waits Q4(D3); step-up 403 to PLATFORM; owner interface-shell, review); R-84 plane half (`events` line exists in D2, but no T52 entry carries the plane fix); R-83 owner half (events R?2 unresolved: whether an edit/withdraw act exists).

No owning module placed by the register: R-52 (cold loads: "not placed (control-plane, plane named by S4)"; covered by PLATFORM's time budgets and T52-42/43 CHANGED BY THE BETA, not a JOURNEYS line); R-31 (register: "not placed (interface-shell candidate)"; the draft then writes interface-shell R?4); R-51 (register: interface-shell (not placed); draft writes interface-shell R?8).

Module of the line uncertain in the draft: R-13 ("module not traced"; screens-settings or screens-investigate); R-127 (headed under screens-action but changes interface-shell R119).

Counts check: rows listed in A cover R-1..R-130 (R-5, R-39, R-67, R-68, R-69, R-70, R-76, R-83, R-84, R-94, R-96, R-98, R-100, R-103, R-108, R-117, R-122 appear in more than one module as owner halves; each is one defect).

## D. Placements (decided, K5476, BOB #322)

- R-127: interface-shell owns it (R119); screens-action draws it.
- R-13: screens-investigate (`ties.mjs` draws the preview).
- R-84: a new entry under events, with the plane's route (PLATFORM on the route).
- R-83: events gains `withdrawEvent({eventId, reason, by})` in withdrawRelation R20's form (`NO_REASON`, `NO_SUCH_EVENT`, a repeat answers `already: true`, the event stays shown withdrawn, nothing deleted); dating through the existing `attest` and `recordDatedFact`; screens-investigate draws the controls.
- R-65 (a BLOCK): calculations' line as drafted, the job finding the cause; retrieval R18, R19 as its control.
- interface-shell R?6's 422 px and the Tab-stop count: set at their jobs' START.
