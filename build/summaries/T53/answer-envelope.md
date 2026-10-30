# Task summary · T53 · answer-envelope

Stands for: build/plan/current.md lines 448-452 (the module's plan block), build/plan/T53-R1/answer-envelope.md (its rows file: the plan-T53-draft, plan-T53-capabilities and plan-T53-tests-english rows), build/requirements/answer-envelope.md (R1-R19, Purpose, Provides, Uses, Invariants, Satisfies, Suggestions), build/layers.md (head, layer 11's row, "No jurisdiction in the product", "New modules and moves at T53"), and the Public Purpose of each used module listed below. Read in full: R6, R7, R19 whole; this summary compresses the rest and names where. Not supplied and needed by the job: `build/modules.json` (the order R7 and R19 pin), `src/mail-door/checks.mjs` and `mail-door`'s requirements (R13, its C-157 rows), and `registers`' check table (see Entries).

## Entries

- T53-365 (current.md:449; K4168, N824, N858; "CAPABILITIES rows"; rows file section plan-T53-capabilities, shared with op-grades, op-capabilities, op-declarations) names answer-envelope but its text binds other modules: op grades and budget classes, `mail-door`'s ops (`mailaddress`, `mailwaiting`, `mailread`, `mailbringin`, `maildelete`, grade and class `[owed]`), the N858 all-doors test, N1272/N1257 ops. Nothing in it changes R1-R18; the one answer-envelope effect is that a refusal of those ops carries its row (R2, R19).
- The same row: "`registers`' check table in the family list" (K4168, N1259-c R55, R4, R19). `registers` (layer 5, after workbooks) is a module with a check table that `CHECK_FAMILY_FILES` must list at its `modules.json` place, so R7's "total over `build/modules.json`" holds (R7, R2). R19 names only C-157 and no `registers` family file, code range or rows; they are not in this reading set. The job reads `registers`' requirements and `modules.json` for the file, the export name and the place, and registers it as R7 says; a code with no row fails loud (R19).
- T53-366 (current.md:450; K5565; "English in tests: its entry"; rows file plan-T53-tests-english, the entry "the same for every module below") convert the module's English-in-test sites to the word key and its values: each assertion reads the key the product reads (and its placeholders' values), never a copied sentence. Census row for layer 11 answer-envelope: literal A / B files 0 / 0; regex A / B / C sites (files) 0 / 1 / 4 (3). A B site (text only in the module's own source) first gets its key in the module (a words row, UX-DESIGN's wording where shown to a member); a C site (in neither) is test input or a dead assertion: kept as input data, or removed with its reason; every test touched for other entries is converted with it (the words check refuses English in a new or changed test). Sources: `tests-sweep/CENSUS.md`, `tests-sweep/CENSUS-RX.md` (this module's rows; not in the reading set, the job reads them). Test: the words check's baseline loses the module's files, and the module's suite is green. Job model: `sonnet-5-5` because a B site needs a key in the module (a source change) (R2, R7).
- T53-563 (current.md:451; K5692, mail-door (C-157); "`families.mjs` registers family C-157 (mail-door's codes C-157.1-.9) so its refusals carry their envelope") is R19: `CHECK_FAMILY_FILES` lists `src/mail-door/checks.mjs` (R19, R7, R12).
- Rows pointer (current.md:452): the rows file is `build/plan/T53-R1/answer-envelope.md`, followed no further.

## answer-envelope (own requirements)

### Public

- R1 (was control-plane R21) Every answer is JSON with `access-control-allow-origin: *`. A forwarded answer is the handler's, with `store` and `tokenClass` added and its HTTP status kept. Names: `json`, `doAnswer`, `storeRefusal`, `storeSilent`, `relayAnswer`, `STORE_SILENT_*`, `planeInternalError`. Suggestions: the `deprecated` key (control-plane R59) is set where this module composes the envelope (R1).
- R2 (was control-plane R22) A refusal (`ok: false`, at the top level or in `result`; only those two levels) whose `reason` or `code` has a row, in the catalogue or in a module's own table the door reads (`capture`'s among them, N347), gains `code`, `check` and `translation` where absent (R2).
- R3 (was control-plane R23) A store answer that is not JSON carrying a boolean `ok` means the store did not answer: refused 502 `STORE_DID_NOT_ANSWER` (C-69.2), naming the op, never read as an absence, a refusal or a success. JSON with `ok: false` is the store's own refusal, relayed with its status, code and sentence (`store-door` R1's `BAD_JSON` among them). Every handler relaying a store answer, in whichever module, answers so: the plane hands it `storeRefusal` with `doAnswer` and `storeSilent`; a `refused` answer is relayed through it, never as `STORE_DID_NOT_ANSWER` (N339); a reply that is no answer is `STORE_DID_NOT_ANSWER` carrying the correlation id `doAnswer` read from the store's internal error when it gave one (`store-door` R6; N349) (R3).
- R4 (was control-plane R24) A public op relaying the store's answer answers the store's own status, and answers R3 on a store failure, never 200 (R4).
- R5 (was control-plane R25, the Worker's half; the store's is `store-door` R6) An error thrown anywhere in the Worker's door is answered with the named code `PLANE_INTERNAL_ERROR` and a correlation id; never the stack, message, path or line; the stack is logged server-side under the correlation id (R5).
- R6 (was control-plane R51; DEC-122 (3); N528; F17, K1881; K3156; K4353, K4356, K4359, K4380) Page policy (`PAGE_POLICY`, `withPagePolicy`): read R6 whole. Binding points: every `text/html` response carries a policy loading no script, style, font, image or connection from another origin and sending nothing elsewhere; `img-src` is `'self' data: blob:` (`interface-shell` R49's `cs.image`); `script-src` is nonce-based: fresh per response, at least 128 bits from a CSPRNG, no two the same, `'nonce-<nonce>'` alone, no `'unsafe-inline'`, no `'unsafe-eval'`, no host; every inline `<script>` of the served page carries it (the interface page's `NONCE_SLOT`, `interface-shell` R2, R3). The interface page (`interface-shell` R1) carries no inline script: `script-src 'self'` plus the hash of the shell's versioned script (`'sha256-...'` as `interface-shell` exports it), no nonce. `withPagePolicy(res, {scriptHashes})` states `script-src 'self'` with each hash and no nonce, page bytes unchanged; a page with an inline script, no hashes or a malformed hash keeps the nonce. Tests: fetch each HTML route twice (a policy naming no other origin, no `'unsafe-inline'` in `script-src`, two different nonces, every script element carrying its response's nonce); the interface page's policy names the script's hash and no nonce, the script's bytes hash to it, no other origin, `'unsafe-inline'` or `'unsafe-eval'`; another HTML route keeps its nonce (R6).
- R16 (T47; N1002, N1001; amends R6) R6 binds `interfacePage` at `/` and `/app/*`; the setup page is no longer served; the door's row for `signintrace` off a test instance (`SIGNINTRACE_NOT_TEST`) joins `DISPATCH_CHECKS` and its order test (R16, R6).
- R7 (was control-plane R43; rule 1, K648; K1310, N526, K1331, N533) `CHECK_FAMILIES` (`CHECK_FAMILY_FILES`, `dec49Row`) is composed of the modules' own families, read in the order of `build/modules.json`, this module's own family last and alone, total over `build/modules.json` (every module with a check table has its entry). This module's last act ends the catalogue: no product module or test imports `checks/bio-checks.mjs`, the file and `test/m/legacy-checks/` are gone. R2 reads only those families; every code decorated before reads the same `code`, `check` and `translation` except: codes a ruling retired (`ADMINS_FIRST` C-96.5, `RESIGN_AT_TWO` C-96.10, DEC-134); translations an owner re-worded under a ruling, the pinned digest moving with it (C-124.32 `PHASE_MALFORMED` K1750; DEC-149 sweep rows C-102.11, C-102.12, C-55.1, C-96.11, `record-core`'s T35-13 rows; rows T35 adds join their owners' families); rows moved to another family keeping code and words under a new number (`PRESSURE_MARKED`, `PRESSURE_NO_ENTRY`: C-117.17, C-117.18 to C-149.6, C-149.7; K2845). Family placements named in R7: `file-safety` (`FILE_SAFETY_CHECKS`, C-140) directly after `capture`'s and before `sources`'; `case-carriage` (C-141) directly after `reevaluation`'s and before `case-tensions`'; `project-roster` directly after membership's (C-120.17 is `photo.refused.format`, C-120.19 `PHOTO_UNCHECKED` reads `photo.refused.unchecked`; case-carriage's machine refusal `MACHINE_CANNOT_MARK_PHOTO` is C-141.1); `ai-use` (`AI_USE_CHECKS`, C-143) directly after `run-rules`' and before `run-productions`'; `law-relations` (`LAW_RELATIONS_CHECKS`, nine C-112 rows) before `standards`'. Read R7 whole for the full pinned list (R7).
- R8 (was control-plane R32, rows held) The rows of control-plane R32's checks (C-69.1, C-69.2, the two internal-error rows, C-68.2-C-68.4, C-66.6), with C-69.5 (`store-door` R4) and C-61.1 (`requiredArgument`), are held in this module's check table, each code, check and translation unchanged, each row's `where` naming the file whose code raises it: this module's for C-61.1, C-69.2, C-69.3 (R3, R5); `src/store-door/dispatch.mjs` for C-69.4 and C-69.5 (`store-door` R6, R4); `control-plane/index.mjs` for C-69.1, C-68.2-C-68.4, C-66.6. Each check's invariant and test stay where its code is raised. `DISPATCH_CHECKS` answers the rows `store-door` mints (R8).
- R14 (T47; N992, N981; DEC-198 (3); K3030; amends R8) `DISPATCH_CHECKS` holds no row for `DISCLOSURE_DUE`: C-69.6 retires (number never reused) and the module-local `DOOR_WORDS` goes. The code's one row is `credentials`' C-29.40 (its R64), translation `words.json`'s `refusal.DISCLOSURE_DUE` read by key; R2 decorates a door-answered `DISCLOSURE_DUE` from that row in `credentials`' family (earlier in the order). Until control-plane answers through `credentials.disclosureDue` (R65, T47-65) the door's own refusal still carries the code. Control: a `DISCLOSURE_DUE` answered at a sign-in's `start` decorates with C-29.40's `check` and translation; no family holds C-69.6 (R14, R2).
- R15 (T47; N908 section 5; amends R7; `case-inputs` R12) `CHECK_FAMILY_FILES` reads `src/case-inputs/checks.mjs` (`STATEMENT_ACK_CHECKS`, `CARRIED_OUTCOME_CHECKS`; C-82.2-C-82.8 and C-136.3-C-136.8) directly before `src/case-authoring/checks.mjs`; the order test pins it. Moved rows decorate with R7's `code`, `check`, `translation` (C-136.5's as `case-inputs` R17 re-words it under DEC-199, digest moving). `action-records` holds no family (its rows are `action-grammar`'s). Control: every code R7 pins other than C-69.6 and C-136.5 decorates as before (R15, R7).
- R17 (T48; N996; K3101; `extraction/credentials-split.md` sections 2, 7; amends R7, R14) `CHECK_FAMILY_FILES` reads `src/ai-accounts/checks.mjs` (`AI_ACCOUNT_CHECKS`, the moved C-29 rows, code, number and translation unchanged) directly before `src/credentials/checks.mjs`; the order test pins it. Rows decorate with R7's values, now read from `ai-accounts` (C-29.40 among them, R14). Control: `credentials`' own rows (C-29.1-.5 among them) still decorate from its family (R17, R14, R7).
- R18 (T48; N1039; K3147, K3200; amends R7) `CHECK_FAMILIES` and every frozen table of this module are built on first read, not at import (the `court-citations` R11 form: plain bindings to lazily filled frozen values); importing adds nothing to the plane's global scope; every decoration answers as before. Test: R7's pinned rows unchanged; a fresh import builds no family until one is read (R18, R7).

### Private

- R9 (copy of control-plane R33) No place is named in this module's behaviour or outward text (R9; `layers.md` "No jurisdiction in the product" rules 1, 5: product code and outward text name no jurisdiction; local facts are profile data).
- R10 (T41-60; K2566; R2, R7) `CHECK_FAMILY_FILES` lists T41's families at their `modules.json` places: `src/steps/checks.mjs` after hypotheses', before citation's; `src/ai-use/checks.mjs` after run-rules', before run-productions'; `src/reading-guides/checks.mjs` after capture-requests', before `skilldoctrine.mjs`; `src/question-explorer/checks.mjs` after `skilldoctrine.mjs`, before answers'; `src/investigation/checks.mjs` after intent's, before reevaluation's; `src/publish-schedule/checks.mjs` (C-122.5, moved) directly after publication's, before docket's. Re-worded rows: C-35.13 (K2428), C-94.5 (K2553), C-70.1, C-22.9, C-22.14, C-104.2, .3, .4, .5, .8; retired: C-124.52 (K2554), C-106.1. Its last sentence (red-accepted `PROPOSAL_NO_RUN`, `NO_SUCH_PROPOSAL`) is struck by R11 (R10, R11).
- R11 (T42; N843; K238, K2566, K2651, K2656; R7, R10) Since `hypotheses` R22, `steps` R28 and `investigation` R12, R23 re-code their rows in place, every code decorates with its own family's row: `PROPOSAL_NO_RUN` (C-124.47) and `NO_SUCH_PROPOSAL` (C-111.22) read R7's pinned rows. The snapshot's `changed.note` (`rows-before-r43.json`) names N843's re-codings: C-134.22 `HYPOTHESIS_PROPOSAL_NO_RUN`, C-134.23 `NO_SUCH_HYPOTHESIS_PROPOSAL`, C-142.28 `NO_SUCH_STEP_PROPOSAL`, C-146.21 `NO_SUCH_PLANNING_PROPOSAL`, C-146.26 `INTERVIEW_NOT_A_LEG`. C-142.28, C-146.21, C-146.26 leave R10's rows (decorate with their own); C-142.3 and C-146.10 stay. Re-keyed rows stamped in T43 (R11, R10).
- R12 (T43; N851; K2609; R2, R7) `CHECK_FAMILY_FILES` lists `src/doorbell/checks.mjs` (`DOORBELL_CHECKS`, `KNOCK_CHECKS`; its R21) directly after `src/capture/checks.mjs` and before `src/file-safety/checks.mjs`. C-85.1-C-85.5 and C-118.2, .3, .4, .7 decorate with R7's `code`, `check`, `translation`, read from doorbell's family (R12).
- R13 (T46; DEC-194; N913; amends R7; K2953, K2959) Translations T46's owners re-word under DEC-194, read by key from `words.json`, are R7's re-wordings: C-124.30 `SCENARIO_OUT_OF_RANGE` is re-pinned to what `action-plans` R47 reads from `refusal.SCENARIO_OUT_OF_RANGE`; C-113.7 `FINDING_NOT_PUBLISHED` and C-116.27 `NOT_OPEN` keep present translations and pins. The snapshot's `changed.note` gains one sentence naming DEC-194's re-wordings (N913); no code, number, `check` or `where` changes; `CHECK_FAMILY_FILES` unchanged by R13. Control: every code R7 pins other than C-124.30 decorates as before (R13, R7).
- R19 (not yet met: T53; N824, K5692 (4); `mail-door` R13; amends R7, R17) `mail-door`'s check family C-157 is registered so its refusals carry their envelope. `CHECK_FAMILY_FILES` lists `src/mail-door/checks.mjs` (family C-157, codes C-157.1 to C-157.9: `MAIL_OFF`, `MAIL_NOT_SET_UP`, `MAIL_NO_SUCH_ADDRESS`, `MAIL_TOO_LARGE`, `MAIL_EMPTY`, `MAIL_ALREADY_IN`, `NO_SUCH_MAIL` and the two rate codes) at its place in `build/modules.json` (layer 3, after `doorbell`), read in that order like the others (R7); `families.mjs` decorates each refusal with `code`, `check`, `translation` as R2 states; a code with no row fails loud. The next new family is C-158. Test: every C-157 code answered through the door carries its `check` and `translation` (its word by key); `CHECK_FAMILY_FILES` order equals `modules.json`'s. Control: `MAIL_NO_STATEMENT` is C-118.12 (`capture`'s), not in C-157; `MAIL_WITHIN_FAILED` carries no row. Read R19 whole (R19, R7, R17).
- Uses (Private, Uses; R2, R7): the modules named below, each its check table in `CHECK_FAMILY_FILES` at its `modules.json` place (68 measured in C-1; 69 with case-carriage; 70 with project-roster). Further edges: `project-roster` (`PROJECT_ROSTER_CHECKS`, `PROJECT_JOIN_REQUEST_CHECKS`, `src/project-roster/checks.mjs`, after membership's); `case-account` (`CASE_ACCOUNT_CHECKS`, C-153, after case-disclosures'), `case-check` (C-148, after review's), `action-holds` (C-149, after action-grammar's), `action-replies` (C-150, after action-clocks'), `plan-work` (C-151, after action-plans'), each `src/<module>/checks.mjs`; `action-producers` holds no refusal family so no C-152 is minted (its edge declared for when one lands); `file-safety` (`FILE_SAFETY_CHECKS`, its R24); `ai-accounts` and `case-inputs` (new `modules.json` edges, R15, R17); `doorbell` (`DOORBELL_CHECKS`, `KNOCK_CHECKS`; edge added at T43); `steps`, `reading-guides`, `question-explorer`, `investigation`, `ai-use`, `publish-schedule` (R10); `law-relations` (`LAW_RELATIONS_CHECKS`, C-112, before `src/standards/checks.mjs`) (R2, R7, R10, R12, R15, R17).
- Used by: `control-plane` (R1-R8), `store-door` (`DISPATCH_CHECKS`, R3, R6; R8's rows), `plane` (`door.mjs`:24-25 and `index.mjs`:5-6: `json`, `doAnswer`, `storeSilent`, `storeRefusal`, `STORE_SILENT_*`, `requiredArgument`) (R1, R3, R8).
- Satisfies: `BIO_System_Design.md` section 2 and section 3 construct 12 (R3, R4); DEC-49, a refusal carries its row (R2, R8); DEC-122 (3) (R6); `layers.md` ruling 2 and rule 1, K648 (R7); F17, K1881 (R6); DEC-149, K1847 (R7); layer 11 and "No jurisdiction in the product" (R9).
- Suggestions (the copy, K624 (1)): `families.mjs` reads `checks.mjs` last as `OWN`; `where` strings of C-61.1, C-69.2, C-69.3 point to the new file, C-69.4 and C-69.5 to `src/store-door/dispatch.mjs`, C-69.1, C-68.2-.4, C-66.6 keep `control-plane/index.mjs`; each `where` change declared `awaiting stamp` (promotion R50; accepted red 2). Tests: `envelope.test.mjs`, `families.test.mjs`, `page-policy.test.mjs`; re-pointing in owners' jobs: `purge.test.mjs`:51, :69, `purge-hold.test.mjs`:13, `t34-routes.test.mjs`:16, `plane/split.test.mjs`:17, `harness.mjs`'s `M`. The nonce may be set by rewriting `<script>` elements (`HTMLRewriter`) or filling a page's `NONCE_SLOT` (`setup-page` R28) (R6, R8). Requirements citing control-plane R23 or R25 re-point to R3/R5 and docket's and record-grammar's R43 to R7, by BOB at the fold (R3, R5, R7).

## Uses: record-grammar

- Purpose: The record's shared grammar, below every module that reads or writes a document: the id and type vocabula... (R2, R7)

## Uses: text-chain

- Purpose: Holds the transcription provenance CHAIN: what a derivation step (a decode, an OCR pass, an AI clean-up,... (R2, R7)

## Uses: record-core

- Purpose: Owns the record's storage: id allocation, leases, the append-only history and manifest of every promotion... (R2, R7)

## Uses: membership

- Purpose: Owns who the members are and what each may do: the founder, administrators, invitations and enrolment, ca... (R2, R7)

## Uses: credentials

- Purpose: Holds the credentials a person or the instance acts by: the founder's password and claim, members' passwo... Its R64 mints C-29.40 `DISCLOSURE_DUE` (R14). (R2, R7)

## Uses: promotion

- Purpose: The one write path by which a bundle enters or changes in the record. (R2, R7)

## Uses: provenance

- Purpose: Holds the record's trust root: the register, which says which bundle is the one home of each captured byt... (R2, R7)

## Uses: attestation

- Purpose: Co-attestation and the instance's own key. It asks the timestamp authorities `signatures` names for a tru... (R2, R7)

## Uses: provenance-routes

- Purpose: Each document's chain of hops, reconstructed only from fields the record already holds. (R2, R7)

## Uses: capture-sources

- Purpose: The source-specific halves of capture that decide what a fetch from a particular kind of source is and wh... (R2, R7)

## Uses: acquisition

- Purpose: The acquisition act: fetches a document from its public address (directly, through a Google Drive export,... (R2, R7)

## Uses: capture

- Purpose: Brings material into the record with its provenance: fetches a document from its public address (directly... (R2, R7)

## Uses: sources

- Purpose: Holds each source, meaning the knocker, the person who handed material over, and later the person reveale... (R2, R7)

## Uses: calibration

- Purpose: Holds the calibrations of derivation engines: dated, identified fidelity measurements of a named engine a... (R2, R7)

## Uses: extraction

- Purpose: Makes readings from captured bytes. It has `reading-pipeline` produce a capture's text through the tier l... (R2, R7)

## Uses: content

- Purpose: Content is the unit the record points at: a reference to a part of a captured document, up to and includi... (R2, R7)

## Uses: entities

- Purpose: The entity axis and the bias doctrine's subject registry, one construct (Framework §13): the things a cas... (R2, R7)

## Uses: events

- Purpose: What happens in the world (a meeting held or cancelled, a vote, an adoption, a signing, an award, a payme... (R2, R7)

## Uses: local-facts

- Purpose: Members' confirmation of the profile's local calendar and offices on this instance. (R2, R7)

## Uses: connections

- Purpose: Holds the connections of the record, of two kinds. **Derived connections**: two captured documents that r... (R2, R7)

## Uses: observation-log

- Purpose: The observation log records looking: every time the record looked for something, at which of the four lev... (R2, R7)

## Uses: standards

- Purpose: A standard is what a government act is measured against: a statute, regulation, ordinance, court decision... (R2, R7)

## Uses: progressions

- Purpose: A progression is a group's declared flow for one kind of happening: its ordered stages, what each presupp... (R2, R7)

## Uses: money-checks

- Purpose: Checks over money facts that raise questions, never verdicts. (R2, R7)

## Uses: duties

- Purpose: The one obligation object: who owes what, to whom, by when, under which authority. (R2, R7)

## Uses: bias

- Purpose: Declared bias is how a group says, in the record and in public, the lens it reads evidence through, so a... (R2, R7)

## Uses: retrieval

- Purpose: Retrieval runs the query language over the record and says what it could not see. (R2, R7)

## Uses: inquiry-grammar

- Purpose: The grammar of an inquiry document as the record checks it: the entry requirements of each state and the... (R2, R7)

## Uses: accepted-work

- Purpose: A group's own finding may rest on a finding of another group's case that the group has accepted (DEC-112... (R2, R7)

## Uses: inquiry

- Purpose: An inquiry is the one recursive object of case-making: a question, which gathers evidence and other inqui... (R2, R7)

## Uses: hypotheses

- Purpose: A member's hunches and hypotheses, held as labelled rows of the working inquiry (K1467): never facts, nev... (R2, R7)

## Uses: citation

- Purpose: Citing is one act in the record's own terms, "this is why I think that": material, or a question, becomes... (R2, R7)

## Uses: basis-versions

- Purpose: An inquiry's basis holds several **versions**, each a complete, named, described alternative account of t... (R2, R7)

## Uses: strength

- Purpose: Strength is what a claim is worth, derived and never stated: a **pair** of independent measurements, the... (R2, R7)

## Uses: contradiction

- Purpose: Contradiction's IDENTIFY: the plane pairs assertions worth comparing, deterministically, for a viewer, an... (R2, R7)

## Uses: run-rules

- Purpose: The AI run's rules without a store: the bounds, endings and statuses a run can have, the checks a bound,... (R2, R7)

## Uses: run-productions

- Purpose: What an AI run produces, and the only way it produces it. (R2, R7)

## Uses: capture-requests

- Purpose: The AI does not capture: it requests, and the daemon captures with provenance preserved (INVESTIGATIVE-SE... (R2, R7)

## Uses: skills

- Purpose: The instructions an AI run works under: the doctrine pack. (R2, R7)

## Uses: answers

- Purpose: The plane's half of the assistant: what an ask may read, what an answer must look like, and the checks ev... (R2, R7)

## Uses: intent

- Purpose: Intent holds what the group is trying to achieve and turns it into checkable work (Content Framework §12)... (R2, R7)

## Uses: reevaluation

- Purpose: When something a finding rests on changes, this module says which findings are affected and how, and chan... (R2, R7)

## Uses: case-tensions

- Purpose: What a case says about the record after it is signed, and how a member's words are credited in it: which... (R2, R7)

## Uses: publication

- Purpose: Publication is the one irreversible act: what the group stands behind leaves the instance, content-addres... (R2, R7)

## Uses: docket

- Purpose: After a case is published, the world responds without changing the case. (R2, R7)

## Uses: public-read

- Purpose: The published record served to anybody without a credential, and its packaging: the public reads by hash,... (R2, R7)

## Uses: network-notices

- Purpose: This module lets a project's owner tell the network that the group is working on something, and it keeps... (R2, R7)

## Uses: ratification

- Purpose: Publication takes two signatures: an owner signs the case document, and each finding and the evidence it... (R2, R7)

## Uses: case-import

- Purpose: A Civicsmith copy imports another group's case file into a new, read-only project. (R2, R7)

## Uses: case-carriage

- Purpose: What a case edition carries at its commit, prepared for `publication`'s commit, which calls it inside its... Family C-141 (R7). (R2, R7)

## Uses: case-disclosures

- Purpose: What a case discloses about what it rests on, judged and written before anything is signed (Publication §... (R2, R7)

## Uses: case-authoring

- Purpose: Before anything is signed, the project's owner prepares a case: which concluded findings it rests on and... (R2, R7)

## Uses: review

- Purpose: The review copy (Publication §6A): a draft of a case a project's editors prepare, shown inside the instan... (R2, R7)

## Uses: conformance

- Purpose: A determination is a member's determination, resting on published findings, that a named government act i... (R2, R7)

## Uses: consequences

- Purpose: What a breach did, and to whom: for a noncompliant determination, who or what is affected (a class of peo... (R2, R7)

## Uses: action-grammar

- Purpose: The grammar of an action document as the record checks it: the action vocabularies (kinds, risk tiers, ba... (R2, R7)

## Uses: action-clocks

- Purpose: The deadlines on the group's actions, read across actions: which clock entries are pending and which have... (R2, R7)

## Uses: filing-templates

- Purpose: The group's governed library of filing templates: wording, with named blanks, that a group may file in it... (R2, R7)

## Uses: filings

- Purpose: What the group sends, prepared from the record. For an action whose governing tier is 1 or 2, a filing pr... (R2, R7)

## Uses: escalation

- Purpose: The escalation protocol (Design Requirement 7 as amended): the stages a group works through to bring a go... (R2, R7)

## Uses: action-plans

- Purpose: An action plan is a project's working material for deciding what to do about one or more matters: an inqu... (R2, R7)

## Uses: monitoring

- Purpose: The daemon's watch over what the group's standing intent names: it checks each monitored document at its... (R2, R7)

## Uses: following

- Purpose: The group's following of what happens at a body and in a register, on the scheduler's one alarm: a body a... (R2, R7)

## Uses: link-sweep

- Purpose: The link sweep: a ratified sweep is the group's named standing intent to watch a set of listing pages and... (R2, R7)

## Uses: wizard-scripts

- Purpose: The library of wizard scripts: the authored step lists a wizard walks a member through on the real screen... (R2, R7)

## Uses: tasks

- Purpose: The obligation inbox: tasks routed from captures whose authority is undetermined, drained from capture's... (R2, R7)

## Uses: queue

- Purpose: The member's one feed (QUEUE): things that want this member, each typed by class (an OBLIGATION a named p... (R2, R7)

## Uses: instance-setup

- Purpose: What a group's Civicsmith is and whose it is. It records once which group produces the record, and holds... (R2, R7)

## Uses: admission

- Purpose: Who may call an op of the instance, judged before the op runs: the namespace a request addresses, the cla... (R2, R7)

## Uses: law-relations

- Purpose: How one held standard bears on another, as members record it from the text: amendments, repeals, renumber... Family `LAW_RELATIONS_CHECKS`, C-112 (R7). (R2, R7)

## Uses: signatures

- Purpose: Builds and verifies the signed and timestamped statements the plane and the installer exchange: OpenSSH d... (R2, R7)

## Uses: file-safety

- Purpose: Keeps every captured file safe to open without touching its bytes, digest or grade: verdict notes beside... Family `FILE_SAFETY_CHECKS`, C-140 (R7). (R2, R7)

## Uses: project-roster

- Purpose: Owns the acts on a project's working group that follow its setup: the participants' roster and the remova... Families `PROJECT_ROSTER_CHECKS`, `PROJECT_JOIN_REQUEST_CHECKS` (R7). (R2, R7)

## Uses: steps

- Purpose: A step is work done by a member or the system in pursuit of an answer to a question, or to give members c... (R2, R7)

## Uses: ai-use

- Purpose: What each AI account has spent and may spend. It counts each use against the account that paid and the me... Family `AI_USE_CHECKS`, C-143 (R7). (R2, R7)

## Uses: reading-guides

- Purpose: Reading guides say what to look for in one kind of document (D8): by hand a checklist, for the AI what to... (R2, R7)

## Uses: question-explorer

- Purpose: The system exploring a question on its own where an account owner turned exploring on (D33, D39; N815): c... (R2, R7)

## Uses: investigation

- Purpose: A project's own working material over its steps and objective: milestones (D27), dated status reports dra... (R2, R7)

## Uses: publish-schedule

- Purpose: Publishing a signed case edition at a set time (DEC-147). Family `PUBLISH_SCHEDULE_CHECKS`, C-122.5 (R10). (R2, R7)

## Uses: doorbell

- Purpose: The doorbell: the public intake by which anyone, with no account, hands the group material (Intake Doctri... Families `DOORBELL_CHECKS`, `KNOCK_CHECKS` (R12). (R2, R7)

## Uses: case-account

- Purpose: A case's account (D56, D61): the written account of what the case's evidence shows, and the reviewers' co... Family `CASE_ACCOUNT_CHECKS`, C-153 (R7). (R2, R7)

## Uses: case-check

- Purpose: A case run through every check publication makes, and held unsigned by the project's choice, with no limi... (R2, R7)

## Uses: action-holds

- Purpose: The group's litigation holds and the pressure it receives: a member marks pressure on a received entry or... (R2, R7)

## Uses: action-replies

- Purpose: What a reply to the group's action did, and what it set off: a member lays out a reply to a request for c... (R2, R7)

## Uses: plan-work

- Purpose: The work of managing a plan as it goes and handing it over: what the group wants of each matter and how f... (R2, R7)

## Uses: action-producers

- Purpose: The feed's Action-layer to-dos: each derives, on read and writing nothing, the items an action's clocks,... (R2, R7)

## Uses: case-inputs

- Purpose: What other acts record about a case before its next edition is prepared, which `case-authoring`'s `op=pub... Families `STATEMENT_ACK_CHECKS`, `CARRIED_OUTCOME_CHECKS` (R15). (R2, R7)

## Uses: ai-accounts

- Purpose: Holds the AI accounts the assistant's use is paid by, sealed at rest, and chooses the one an act uses: a... Family `AI_ACCOUNT_CHECKS`, read directly before credentials' (R17). (R2, R7)

## Uses: translations

- Purpose: What the members of a group read the screens in, and who may put words into a language. (R2, R7)

## Uses: setup-words

- Purpose: The interface's word list as frozen data: each word the screens show, with its key, English, note, meanin... (R2, R7)

