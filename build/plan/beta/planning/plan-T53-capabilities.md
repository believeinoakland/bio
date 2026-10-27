# T53's CAPABILITIES entries by owning module (PLANNING L23)

**Status** · DRAFT for BOB; §F all decided as recommended and §G sorted by K5530 (BOB #323: F7 the probe upload only where no read can answer, K5449 (1) for the card line; F10 supersedes K5528 T3; mail-door BOB's packaging; N1110 B2 T1, B3 closed; N824 B4, the R119 ceiling, the gold-set reviewer and DEC-340's facts on Bob's page as C31-C34; N858's per-text people Bob's acts when each text is made; N1259-d R36 (case-disclosures R41) asked of BOB in plain words) · PLANNING #3, 2026-10-27. CAPABILITIES' READY scope (C29: N1259 a-f/b2, N824, N1110, N1265, N858, N1269-N1272, N1257 layer-names and record-core) read whole by five Sonnet reading workers and set out one entry per module by layer. Pointers `capabilities/<file>` are on `lane/capabilities` (merged into tranche/T53 by BOB). Ids are draft ids; renumbering per §D is applied in the entries. N1260 and N1257's earlier files are in `plan-T53-draft.md` itself.

## Keys

- Entry form: `- T53 · <source> · <what> · <pointer> <marks>`. Marks as the plan: `[owed: X]`, `[waits: X]`, `first: X`, `after X`.
- Files (all under `capabilities/`): N1259-a = `N1259-a-readers-and-sources.md`; N1259-c = `N1259-c-watching-alerts-queue.md`; N1259-d = `N1259-d-publication-and-guardrails.md`; N1259-e = `N1259-e-needs-and-points.md`; N1259-f = `N1259-f-events-line.md`; N1259-b, N1259-b2 = the registers module's drafts; N824 = `N824-email-capture.md` (mail-door, provenance, capture, doc-clean, instance-setup, op lines), `N824-container-member-job.md` (member job, doorbell, scheduler, store-assembly); N1110 = `N1110-directory-listing-decline.md`; N1265 = `N1265-get-ready-and-check-account.md`; N858 = `N858-templates-and-guides-texts.md`; N1269-N1272 = `N1269-N1272-requirements.md`; N1257 layer-names = `N1257-requirements-layer-names.md`; N1257 modules, jurisdictions, record-core = `N1257-requirements-<name>.md`.
- All drafts READY (C29), every line with a Test and a Control. N1259-b's header still says "DRAFT, not READY" (stale); N824's status line says all points settled, but B4 (and N1110's B2, B3) are not.
- Modules new to `modules.json`/`layers.md`: register-readers, registers, mail-door (and mail-reader, FILES', settled, K5448). See §B.

---

## A. Entries by layer and module (`build/layers.md` order)

### Layer 1

**setup-words**
- T53 · N1265 (DEC-416, DEC-430) · keyed words for the check: the card line's derived sentences, "Cloudflare will ask once more", `CHECK_NOT_PASSED`, "could not tell", the note under the name line, the step buttons (26 `screen.install.check.*` and `refused.rare` already held) · N1265 R20 `[waits: UX-DESIGN's rows]`
- T53 · N858 (K5510, K5512, K5508) · `text.reviewedby`, `text.sourcechanged`, `text.lastchecked`, `guide.procedure.notreviewed` (and "Not offered yet" for a guide) · N858 §6 `[waits: UX-DESIGN's rows]`

**jurisdictions** (one job with the N1257, A2 and N858 lines; `SECTIONS` gains `registers`, `use_limits` beside the others)
- T53 · N1257 (K5458, K5462) · `nameResolve({section,name,layer?,asking?,at?})`, the one resolver: `NAME_UNKNOWN`/`NAME_AMBIGUOUS` with layers; a record with no layer resolves over the layers active at its own date. It is pure: callers pass the active layer set, each calling record-core `getSettingAt('jurisdiction_profiles', at)` and expanding; no edge from layer 1 to 2. Replaces the plan's `[owed: K5458's lines ...]` · N1257 layer-names R121 (R122 withdrawn into record-core R92)
- T53 · A2 (DEC-458; K5456) · a layer states the fiscal year of the one government it stands for; a member states a government's year with `how`; the plan's A2 line cites only R134/R135 · N1257 jurisdictions R123, R124
- T53 · N1259 (K4403 (2), (3), (5), (6); K1485, K1492; 11 CFR 104.15) · profile sections `registers`, `use_limits`, system `rate_limits`, `gated`, `terms`, `volatile`; `validateRegisterDefinition` (no contact column kept, terms stated, no people-search); listing figures each with basis; identifier schemes and number-only query templates; the first profile lists only what was measured (M-R1), the rest `not_measured`, officers `phase: beta`; the test profile supplies every shape · N1259-a R127-R133 (draft ids) `[waits: its register-readers job]`
- T53 · N858 (K5509) · a profile template of a court-filed kind (`venue.how` "court", field found, `lines-K5527` §4) refused at load `TEMPLATE_COURT_PETITION`, no certification route; the five kinds stay data · N858 R136 (its UNVERIFIED field is answered)
- T53 · N858 (K5510, K5512) · the display half of R137: "reviewed by {name}, {organisation}, {date}"; a changed source flags its text, which stays offered with "a source changed on {date}; re-review pending"; a text over 12 months since review shows its date and "last checked" (hash part is R40/R126) · N858 R137 `[owed: K5529 (link-check flag stays offered; last checked = date the link check last found sources unchanged); recommended an optional `address` per source in jurisdictions and the flag/date written as profile data at each release; N1265 R40 amended to read those addresses]`
- T53 · N858 (K5510, K5512; K5528 T5) · `reviewed_by` is read as K5528's profile key `reviewed`; a machine reviewer is not counted (R126), not refused at load (no `MACHINE_CANNOT_REVIEW_TEMPLATE`); `isMachineIdentity` and `sha256HexSync` imported directly (record-grammar is already in jurisdictions' uses) · N858 R136-R138 with PLANNING's R40/R125/R126/R138
- T53 · N858 (K5508-K5512) · the beta's profile texts as data (template and guide for the records request, civil grand jury complaint, Controller referral, public comment, media outreach; none for a court petition), entered with attribution and Bob's K ruling as `basis` · N858 §2-§3 `[waits: Bob's per-kind writer, reviewer, approval]`. Replaces the Layer 3 `[owed: N858 ...]` bullet and the Layer 1 mark `[owed: CAPABILITIES' N858 READY]` (met).
- (R125, R126, R138 are PLANNING's. R125/R126 cite `reading-guides` R18 as the judge; R18 is now layer-names', N858's are R19/R20: fix at numbering.)

**test-support**
- T53 · N824 · `jobRegistrarStub` takes job kind `member` · N824-container-member-job R29 (first of the member-job chain)

**runtime-limits**
- T53 · N824 (K5527 (2)) · `mail` rows (message 25 MiB, 20 an hour a member, 200 a day a team, 14 days waiting, nesting 3) and `doorbell.discard_days` 7; the 25 MiB quoted once for `mail-door` and `mail-reader` (ML12 states it too) · N824 R37 `[owed: PLATFORM per-level figures]`. Number at write time: runtime-limits also gets N1267, PL1 and PL30-34 lines.
- T53 · N1259 · rows `REGISTER_STREAM_MAX`, `REGISTER_SEGMENT_MAX` · N1259-a acquisition R126 `[waits: M-R7]`

**mail-reader** (FILES', layer 1, place at 14-17: after `ooxml` 13, `structured-text-reader` just before, ahead of `format-registry` 18 and `doc-clean` 30; BOB's)
- Replaces the plan's pointer `ML1-ML6` with `ML1-ML12` (K5466 already put CAPABILITIES' additions A1-A5 into ML7-ML11 and the size split into ML12). Nothing is owed to FILES. N824 adds no parser: `mail-door` and `capture` read headers (`received[]`, `authentication_results`), the four automatic-mail facts, `nesting_depth` and the attachment listing from ML7-ML11; ML12, ML10 and CC5 close the draft's S1-S4. Residual: ML11 returns `{ok:false, reason}` where N824 R10 wrote `refusals[]`: align N824.

**court-doctypes**
- T53 · N1259 (K4403 (7), M-R5) · fourth type `courtlistener_api` (`provisional` until a real answer replaces the assumed fixture); `assess` over a JSON and an HTML reading of one docket · N1259-c R18-R20 `[waits: M-R9]`

**register-readers** (new, §B)
- T53 · N1259 (K4403 (2), (5); K1484, K1485, DEC-408) · streams delimited files to rows under a definition, zip by directory and member (ZIP64), drops contact columns before any other code sees a row (street lines only, K5499), withholds phone and address shapes in free text, the closed filter (`validateFilter`, `matches`, `autoWatchable`), the reducer with the original's fingerprint, estimates; pure, no AI · N1259-a register-readers R1-R11

**doc-clean**
- T53 · N824 (K2334 (2), K1485) · a captured message's published copy is body and attachments only; no header but the date and an official's name; reads format-registry's detection, not judging bytes again · N824 R13 (K5534, C31: visible headers From, To, Cc, Date, Subject; never MIME or routing headers or any address; a recipient's name only where the author marks it material; CAPABILITIES applied it)

### Layer 2

**record-core** (beside, not instead of, the N1271 placeholder)
- T53 · N1257 (K5458, C10, K5462) · `getSettingAt(name, at)`: the setting as of an instant from the rows already kept, `SETTING_UNDETERMINED` before the first set, `SETTING_AT_INVALID` (C-102.40), no new table or row; `settings` stays purge-exempt and expunge-none · N1257 record-core R92 `[PLATFORM's load line; first: the job's two read-only checks, §C]`

**credentials**
- T53 · N1259 (K4403 (7); K1449; K5513) · no new key service; `KEYED_SERVICES` stays `courtlistener`, no `openfec`; tests only. `KEYED_PURPOSES` sits in acquisition (credentials, layer 2, cannot read acquisition) · N1259-a credentials R84 (builds nothing new: BOB may fold it into acquisition's job)

### Layer 3

**provenance**
- T53 · N824 (K2425) · a message by email graded as an upload, `origin.kind` `email`, the `message` block; an attachment earns its message's grade; an `email` or `email-attachment` capture is not `handed_in` (say so in A3-R1's test) · N824 R82-R84
- The receipt builder for `email-attachment` sits here or in acquisition, never capture (as R39's does for ZIP).

**acquisition** (N1259-a R125-R133, c's R134, N1269 R135, N824 R136; no collision, BOB numbers in plan order; replaces the plan's Layer 3 `[owed: N1259 registers ...]` for these)
- T53 · N1259 (K4403 (2), (5), (7); K1485, K1492; K5498, K5513) · `streamRegister` stores only the reduced copy, in segments, input bounded by its own ceiling, resumable slices; `probeRegister` (size and change without a body); `sourceChanged`; the docket poll on the alarm for a followed case only (the same words as acquisition R36), the stated call limits counted in a durable ledger; fetch only from the definition's hosts; one capture per segment, `existed` on a repeat; segments' `origin` kind `named_request` (C-18.1 admits no new kind), capture grade stays R18's rule · N1259-a R125-R133 `[R126 waits: M-R7]`
- T53 · PLANNING (K5513) · acquisition R36 (`planning/lines-K5513-daily-follow.md`) uses N1259-c R41's purpose names (`docket-entries`, `standing`); with the key off `keyedFetch` answers `KEYED_SERVICE_OFF` and the follow falls back to re-reading the public page (c R41) · R36 and N1259-c R41 `[owed: a line filing a keyed answer as a capture attributed to the follow]`
- T53 · N1259 (K5498, K5513; G7) · keyed services off by default, key in no answer, daily alarm read for a followed case only · N1259-d R134 (test) (acquisition R137, `N1259-a2-additions.md`, C31, K5532)
- T53 · N1269 (K5446) · `limitsByKind` quoting `READ_BOUNDS` through `boundOf`; reads KIND-TABLE's plain names and limits (format-registry) so there is one source; `how_long` derived from the budget classes (PL1), not cited from `HELD_AT_CHECK_MAX` · N1269-N1272 R135
- T53 · N824 (C9 (2), CC5, ML4) · `fileMember`: job kind `member` serves a ZIP's entries and a message's attachments; amends R38; N824's receipt builder for `email-attachment` here (or provenance), writing the message receipt and the document of capture R117's rows; test (f) (R136) moved to store-assembly R102 · N824-container-member-job R136 `first: settle problem 1` (the builder placement above)

**capture**
- T53 · N824 (K5506, K5527 (1)) · `emailCapture`: whole message, headers kept as source, her statement required (`MAIL_NO_STATEMENT` = C-118.12), attachments as `member` rows (capture only registers rows), ceiling the lower of mail bound and `CAPTURE_MAX`; uses `mail-reader`. Replaces the N824 part of the plan's `[owed: ... N824 ...]` mark in acquisition/capture; the N1110 part is met by the lines below; N858's stays · N824 R116-R118

**doorbell**
- T53 · N824 (DEC-108 (5)) · discarded knocks cleared 7 days after receipt, never under a hold · N824-container-member-job R29

**mail-door** (new, §B) (K5530: BOB's packaging; layer 3 after doorbell, `member-roster` in its uses)
- T53 · N824 (K5504-K5506, K5527) · a private address per member (digest only; no member email stored), mail waits 14 days privately, filed only with her statement, rate bounds, count-only tally, never AI, off by default; relays `mail-reader` ML10's nesting refusal (no `MAIL_TOO_NESTED`); runs `mail-reader` before accepting (R3, R10) · N824 R1-R14 `[waits: M1, R12 only]`
- T53 · N824 · R7, what of a message is published (K5534, C31: visible headers From, To, Cc, Date, Subject; never MIME or routing headers or any address; a recipient's name only where the author marks it material; CAPABILITIES applied it)
- T53 · N824 (R6) · the removal of a member's unconfirmed mail: `mail-clear` returns counts (cannot call layer 11) and a notice-producers line reads them (N824 R6 amended, C31)
- T53 · N824 · declares `mailaddress`, `mailwaiting`, `mailread`, `mailbringin`, `maildelete` in its own `DECLARED_OPS`, see op-declarations.

### Layer 4

**reading-pipeline**
- T53 · N1272 · `interpretUnits` of one part's units only, `partsOf` (K5496: whole-document names stay reading); `partsOf` is reading-pipeline R65 · N1269-N1272 R64, R65

**extraction** (replaces the plan's `[owed: CAPABILITIES N1269-N1272 READY]`; uses project-roster (38) and civil-time (3) for R114)
- T53 · N1272 (K4636, K5445, K5496) · `interpretPart` as the one recorded act, `cellsOf` as a caller, `interpretationOf`, acceptance basis, withdrawal (nothing erased), storage bounded by marks not file size · N1269-N1272 R114-R118 and R119 `[R119 waits: Bob: a member-visible limit on interpreted parts?; PLATFORM's bound per level]`
- T53 · N1259 (K4403 (2), (5)) · a register segment is not read: reading state `held_as_register`, never indexed as text · N1259-a R113

**content**
- T53 · N1259 (K4403 (4)) · `registerRowContext`: a register row minted as a `sheet-range` extent, no machine-reading grade, the row remembers its reduction; adds a column (`migrateContent`: check no test pins it) · N1259-a content R63-R65, **numbered R65-R67** (A8 keeps R63-R64). Both amend content R21 (the transcription axis): one job reconciles ("not applicable" for a register row beside A8's typed grade).

### Layer 5

**entities**
- T53 · N1257 (K5458) · an office's law stores `law_layer` (R69); two offices of one name in two layers are two offices, never matched by `held[0]` (R70) · N1257 layer-names R69, R70 (beside the plan's R68 line). Job-START test the drafter could not run: the `held[0]` office match.
- `[owed: entities line]` · a read of a project's subjects (registers R8 needs them; no `entities` service lists them, UNVERIFIED)

**events**
- T53 · N1259 (C13 (5)) · one entry of a followed register is one event however many readings state it (key: system, proceeding, entry id); a second reading adds an attestation; a disagreement told, never fatal; old keys re-keyed · N1259-f R58, R59 `[waits: M-R9; first: f's check 5]`

**local-facts** (extend the plan's N1257 line R23-R27)
- T53 · N1257 (K5458) · R28 (a team rule stores its `layer`; closure names `<layer>:<name>`), R29 (a fact act's path begins with the layer holding it; the team layer by government), R30 (`team_layers` declared to record-core, handed to `combine`; sight group) · N1257 modules R30, layer-names R28-R29 `[R30: PLATFORM]`

**duties**
- T53 · N1257 (K5458) · a duty from a rule keeps `time.layer`; `NAME_AMBIGUOUS` with layers (R35) · N1257 layer-names R35

**registers** (new, §B; after `workbooks`; replaces the plan's Layer 5 `[owed: CAPABILITIES N1259 (people, money groundwork, registers)]` for registers only)
- T53 · N1259 (K4403 (1)-(7), K4405 (1)-(6)) · the listing with each figure's basis; an import planned (prefilled filter, delta, estimate), queued, run as resumable slices on the scheduler's alarm, stored once per row version behind one port (S2 behind the port; M-R3 moves a register later), never in the way of screens · N1259-b R1-R23
- T53 · N1259 · search of held rows (absence says where it looked; never logged), use-limit notice and caps, cite a row as a labelled extract, compare two imports, a tombstone removal that never comes back, a project's stated interest and the refresh a watch asks for, the count-only change read for the queue; no judgment, no name matching, ops declared · N1259-b R24-R45; with b2's decision that store-assembly replaces `plane` and `journey-check` in the omitted-edge list
- T53 · N1259 (guardrails) · N1259-d R61-R72: module-local halves in the registers job; cross-module scenarios (R61, R63, R64, R67, R69, R70, G11) as `storeWorld()` tests in store-assembly's job · N1259-d R61-R72 (R46-R60 should be part c's)
- T53 · K5498 · officers (California's own API on the team's key, read when a member asks; the state's bulk file brought in) (met by registers R46 and R3 amended, C31, K5532: N1259 R84 allows exactly this one keyed service inside registers; the bulk-file stream's route to `streamRegister` the job verifies; PLANNING's jurisdictions R130, R133 and guardrail R73 in `planning/lines-K5532-officers-guardrail-listing.md`) (R3 holds `PRODUCT_PHASE` alpha, no pieces, `gate: account`; the line sets `PRODUCT_PHASE`)
- Ops (N1259-e §1; * admin; ms): read: registerlist 500, registerfilter 1000, registerimportstatus 500, registerrow 500, registerproposals* 500; Explore class (2.0 s, stops and says so): registerdelta 2000, registersearch 1500, registercompare 1500. reversible: registerpropose 500, registerfileimport 1000, registerpreread* 1000, registerimportset 500, registerrowcite 1000, registerinterest 500, registerrefresh 1000, registerwatch 1000, registerwatchstop 500. reasoned: registerdefine 1000, rowexpunge* 1000 (irreversible; adds `ROW_EXPUNGE_NO_REASON` to `JUSTIFICATION_REFUSALS`). credential: alertconnect* 1000 (already `credential`).

### Layer 6

**citation**
- T53 · N1259 (K4403 (4)) · a register row cited like any content, an interest line may cite it; test only; a removed leg: REPORT (UNVERIFIED, recommended) · N1259-d R26, **numbered R28** (A8 holds R26-R27)

**reading-guides**
- T53 · N1257 · add R18 (a group guide drafted from a layer's guide records `layer`) to the plan's R17 line · N1257 layer-names R18
- T53 · N858 (K5508-K5512; B1) · a profile guide offered only when `attributionLacks` answers none, else `not_offered: [{kind, lacks}]`; "reviewed by", flag and 12-month lines as for templates; `reviewed_by` read as K5528's `reviewed` · N858 R19 (key `reviewed`, §3 point 1)
- T53 · N858 (K5508) · `guideOptOut`: a sole member of a team opts out of review and the separate approver for the team's own guide, recorded `review_opt_out {member, at}`; `OPT_OUT_NOT_SOLE_MEMBER`, `MACHINE_CANNOT_OPT_OUT`; the guide says "not reviewed"; an opted-out guide answers `not_reviewed` and no `reviewed` key (no `reviewed: false`) · N858 R20 (with PLANNING's R20 delta)

### Layer 7

**investigation** (new Layer 7 heading in the plan; uses reading-pipeline (53) and retrieval (73), both earlier)
- T53 · N1272 (K5445 B, C; K5496) · `markForInterpretation` (R26), `proposeParts` mechanical and unscored (R27), `acceptProposals` in DEC-77's acceptance shape (R28), `proposalRates` and `PROPOSALS_MEASURED` (R29), `interpretedFor` (R30), what a later investigation is told (R31), no assistant proposals (R32) · N1269-N1272 R26-R32 `[R29: kind by kind only after M-N1272; Q1 C is "built if it tests well"]`

### Layer 8

**case-grammar**
- T53 · N1259 (K4403 (3), (4)) · a cited row travels as flat `extract_*` fields, the limit's three; the file does not. `bio-case-document/10`: one format; N1259-d's extract fields are optional rows in the `/10` A5/A8 declare · N1259-d R35, R36, **numbered R38, R39**. R36 `[waits: Bob's: a member's authored observation exempt from "relied-on documents travel whole" (DEC-100), if read as doctrine (K1483)]`

**corpus-export**
- T53 · N1259 (K1493) · descriptors and tombstones, never rows; a limited register's rows in no form · N1259-d R16 `[owed: where segments' bundle lives]` (segments' exemption UNVERIFIED, recommended)

**public-read**
- T53 · N1259 · extract labels and notice by key, no phone or address shape; extracts inside the signed document, no segment · N1259-d R46, R47, **numbered R50, R51**

**network-notices**
- T53 · N1110 (K5507) · `listingRequest`: an administrator's prefilled request to be listed on civicsmith.org, public items only, sends nothing; `place` omitted if no field holds it; uses `member-roster` · N1110 R32 `[owed: where a group's "place" is held; display name passed in by the layer 11 door]` · the optional `contact` field (K5532, K5530 B2): `planning/lines-K5532-officers-guardrail-listing.md`

**case-checker**
- T53 · N1259 · checks each extract and the notice; says the source file is not in the package; program rebuilt · N1259-d R29-R32

**case-disclosures** (uses register-readers)
- T53 · N1259 (K1483, K1493, K5503, DEC-408) · each person in a cited row has a recorded basis, a seventh reason `named_in_cited_filing`; a phone or street address in the group's words refused unless a public-office basis; `on_publish` `warn` acknowledged; `EXTRACT_ROWS_MAX` (500); extract fields optional rows in `bio-case-document/10` · N1259-d R35-R38, **numbered R40-R43**; G11 scenario R39, **numbered R44**

### Layer 9 (extend the plan's layer-9 line)

- **actions** · T53 · N1257 (K5458) · R113 (law stores `layer`), R114 (`law_layer`), R115 (office `layer`) · N1257 layer-names
- **action-records** R21 · **action-grammar** R31 · **action-clocks** R28, R29 (proposal and entry keep `layer`; a date never recomputed by a later layer) · **filing-templates** R37 · **filings** R71 · all N1257 layer-names. filings R29 is amended, no new id.
- **filing-templates** · T53 · K5528 T3/T4 · R15's private `#lacks` replaced by `jurisdictions`' `attributionLacks` (both import `record-grammar`'s functions directly, K5530 F10), one word `second_approval` · `lines-K5527` §3 `[owed: no filing-templates line exists; BOB writes it]`

### Layer 10

**monitoring** (replaces `[owed: N1259's pause line]`)
- T53 · K4403 (2), (7) · pause also stops register slices and docket polls; a member's act under a pause is queued, `citationLookup` runs (UNVERIFIED, recommended) · N1259-c R81

**following** (replaces `[owed: N1259 watches and alerts]`)
- T53 · N1259 (K1484, K4403 (7)) · watch a number (`registerwatch`, `registerwatchstop`) never a name (`QUERY_NOT_NAMED`); a change recorded once; a project's interest watched by itself; `follows` shows each; `registerChanges`; no machine watch · N1259-c R37-R40, R43-R46
- T53 · N1259 (K5498, K5513) · a followed CourtListener docket checked daily on the team's key (a day, K5513, governs over e's "once an hour"), 80% of the day limit, rest `rate_held`; key off, page re-read; ends at last unfollow · N1259-c R41, R42 `[waits: M-R9]`

**scheduler** (one job: `register-import` first in the one `SCHEDULER_ORDER`, then N824's two; uses `doorbell`, `mail-door`)
- T53 · K4403 (2) · consumer `register-import` in slices · N1259-c R34
- T53 · N824 · consumers `discard-clear` and `mail-clear` after `register-import` · N824-container-member-job R35

### Layer 11

**op-grades**, **op-capabilities**, **answer-envelope**, **op-declarations**
- T53 · K4168 · grades from owners' declarations; `rowexpunge` reasoned and irreversible; machine refused on every register write; `needsRows()` unchanged; `registers`' check table in the family list; the twelve registers ops above; registerdelta, registersearch, registercompare take the Explore budget class (2.0 s), not Read act (PL2 forbids upward override) · N1259-c R55, R4, R19 (c R19 compare key, date, filer, `sealing`: UNVERIFIED, recommended; c R55 `rowexpunge` tables UNVERIFIED)
- T53 · N824 · `mailaddress`, `mailwaiting`, `mailread`, `mailbringin`, `maildelete`, declared by `mail-door`'s own `DECLARED_OPS`; grade and budget class not stated `[owed: grades, classes]` (recommended: `mailbringin` like `captureupload`, the reads in the lightest read class; PLATFORM gives the `email()` entry a class)
- T53 · N858 · the all-doors test: five profiles (four each lacking writer, sources, professional review, second approver; one complete) through `templatesFor`, `templateRead`, `offeredVersion`, `templateByHandle`, `unofferedFor`, `templatesForAction`, `procedureGuidesFor`; an unclassified op in the three owners' declarations fails; plus the K5508-K5512 fixtures · N858 R84
- T53 · N1272 · ops `interpretmark` (named), `proposeParts`, `acceptProposals`, `interpretationOf`, `interpretedFor`, `interpretationWithdraw`, `limitsByKind`: grades and budget classes unstated (recommended: read grade; the 5,000-page reads take PLATFORM's long class); N1257 modules adds `layerentrydraft`, `layerentryconfirm`, `layerentrywithdraw`, `layerreport`, `layerreports`, `layerreportcarry`, `layersset`, `federaloffices`. `guideOptOut`: recommended an ordinary member write.

**instance-setup** (numbers by BOB at writing in plan order: N1257 R107-R113, AI-DESIGN's R107-R110 and N824 R114; cite by draft id; N824's R107/R109/R110 numbering clash is not this file's)
- T53 · N824 (K5504) · the team's mail domain and switch; "receiving" only after an accepted test message; uses `mail-door` · N824 R114
- T53 · N1257 (K5458) · add R112 (seeding finds what a package seeded; layer id in `profile`), R113 (package layers are not arrivals) to the plan's R107-R111 · N1257 layer-names R112, R113. Job-START tests the drafter could not run: `#seedLine` (R112), package layers as arrivals (R113).

**notice-producers**
- T53 · K4403 (7) · a change told once to the watch's owner with counts; an import done, stopped, failed told to its starter; no name in any item · N1259-c R30-R32
- (N824 R6 amended, C31) · the private notice that a member's unconfirmed mail was removed (N824 R6); reads `mail-clear`'s counts; kind UNVERIFIED; no line drafted

**action-producers** R27 (a fact due names its layer) · **queue-producers** R59 (arrival item keyed by layer) · N1257 layer-names

**queue**
- T53 · N1259 · the four register kinds catalogued as FINDINGs; disposition `watched-changed` (UNVERIFIED, recommended) · N1259-c R97, **numbered R98** (A6 keeps R97)

**store-assembly** (job also holds the cross-module registers scenarios, registers entry)
- T53 · N1259 · assembly composes `registers` and its registrations · N1259-c R101 (b2 decision 1 replaces `plane`/`journey-check` of e §5 item 14)
- T53 · N824 · job kind `member`; every pinned kind list and test in one commit; takes R136's test (f) (edits `r9-jobs.test.mjs:41`) · N824-container-member-job R102 `after: acquisition R136, test-support R29`

**screens-settings** (A6 holds R82)
- T53 · N1257 (modules) · R82, R83 **numbered R83, R84**; layer-names R84 (layer drawn on `places`, `grouprules`) **numbered R85** · N1257 modules, layer-names

**screens-intake** (N1272 keeps R72-R74; A3's lines cited as A3-R3, A3-R4)
- T53 · N1272 (K5445, K5496) · replaces the plan's N1269 line: the add screen's limits first (R72), the over-limit refusal with size and limit, "Nothing was added or read" (R73), the two ways in (R74: register by filter `[waits: N1259 registerList/registerFilter]`, else the member's own part) · N1269-N1272 R72-R74

**screens-daily**
- T53 · N1260 · A6 keeps R108-R109; N1260's R108 **numbered R110** · N1260
- T53 · N1272 (K5495, K5496) · the Finder's "not interpreted for {investigation}" mark; draft R109 **numbered R111** (CONSISTENCY) · N1269-N1272 R111; drawn by DEC-476 (merged, ec02fce0bc): a hit whose document is not interpreted for the current investigation adds "not interpreted for {investigation}", from `interpretedFor` (DEC-476 names the draft's old "R109" pointer wrong: it is this R111)

**screens-inquiry** (these rows go to `screens-document` after the split, plan Before R1 (9))
- T53 · N1272 (K5495, K5496) · the Document page's "Interpreted" row, the offer (op `interpretmark`), the chooser, the proposals list and its absent state, the in-place sentence, the margin bars · N1269-N1272 R141-R147; drawn by DEC-476 and DEC-478 (merged, ec02fce0bc): R141 becomes the Interpreted row's keys (`screen.document.interp.for`, `.group` by member and day from `interpretationOf`'s `by`, `.notyet` from `not_interpreted`, `.all` when empty; `.other` dropped), R142's act `interpretmark` and its chooser (parts named by `part.*`: pages, sheet rows, paragraphs, slides, sections), the margin bars from `for_this`/`for_others`, the line on opening or citing a part under the text's legend; the spreadsheet fold keeps only `screen.document.sheet.read`. R118's withdrawal has no screen: recommended a UX need in the chooser, else op only.

**screens-investigate** (and the registers screen)
- T53 · N1257 · R71 (`due-date` rules with layer) · N1257 layer-names R71
- T53 · N1259 · the registers screen (module: screens-investigate, recommended, BOB's; mock `SCR.registers`): 15 needs (import progress, counted or estimated, listing figures with basis, filter, auto versus asked watching, admin-only acts, own-register second step, compare, a row, queue items, scope, removal, words, published page, "Follow from here") · N1259-e §2 `[owed: UX-DESIGN's rows via BOB]`

**screens-action**
- T53 · N1257 · R61 (layer on the screen) · N1257 layer-names R61
- T53 · N858 · draws a guide's `not_offered`, "reviewed by", "not reviewed", the flag lines and "No profile text for this yet"; the opt-out offered to a sole member only · N858 §6 `[owed: UX-DESIGN's rows; no screens-action line exists, BOB writes it]`

**control-plane**, **plane**
- T53 · N1259 · the door answers the ops from declarations (test) · N1259-c R139
- T53 · N824 · member acts routed; the plane's `email()` entry calls `receiveMail` · N824 R12 `[waits: M1]`

**installer** (new ids R86-R93 are N1265's; N1257 takes R94; AI-DESIGN's installer lines R95 and on)
- T53 · N1265 (K5449) · "Check my account": `mode: check` on `/begin`, a run that takes no lock, registers no prefix, makes no bucket; its only write is the plan probe, deleted (confirm, recommended yes); R2's "exactly the five scopes" and its stale "not yet met: T51" become "exactly the scopes registered on the client" · N1265 R86
- T53 · N1265 (DEC-416) · `CHECK_LINES` (plan, containers, limits, name, card), all at once, each ready / not_ready / unknown; the name-free test extracted from the install's `fresh` step so both call one function · R87
- T53 · N1265 (K5449 B1) · the card line derived from reads only, no probe · R88 (replaces carried T52-92's "payment-method probe")
- T53 · N1265 · "Check again" keeps choices; a lasting 429 reads `unknown`, never not_ready · R89
- T53 · N1265 (K5449 B2) · the gate: "Install now" only on a passed check (cookie `chk`, slug and instant, 30 min); `CHECK_NOT_PASSED`; R84's checks stay as the second line; "Cloudflare will ask once more"; the fixture's `begin` sends `chk` (about 62 call sites) · R90 `first: the fixture change`
- T53 · N1265 · "Get ready" is R85's four-step guide with a Cloudflare button per step; the first page begins a check (shares it with carried T52-95) · R91 (replaces carried T52-94's "five plain steps")
- T53 · N1265 · every Cloudflare address in two frozen tables (`GET_READY_LINKS`, `FIX_LINKS`); `ui.mjs:217` moves in · R92; words by key · R93 `[waits: setup-words]`
- T53 · N1257 · layer-names/modules lines for the installer · N1257 modules, **numbered R94**
- T53 · installer R2 · ONE amended line: N1265 R86's scopes, K5471 (5)'s Logs read, AI-DESIGN's R107/R108 gateway permissions (two AI Gateway permissions; `missingScopes` leaves them out of `needed`; the check must not fail a line for them) `[owed: BOB settles the scope count]` (K5471 (5) says seven, N1265 says six, against the client; K3819 registered `account-logs.read` yet Logpush read is refused)
- Job order: extract the name test; R86-R89; fixture and gate (R90); R91-R93.
- (Stale: `N1257-places-in-layers.md:45` names installer R86 for N1257.)

**stewards**
- T53 · N1110 (DEC-255, DEC-270) · a listing withdrawal carries `rule_part` 1-4 and the rule text's date; reinstatement records why; the steward's page gives the sentence to send by hand; the service tells no group · N1110 R24-R26 (K5530: B2 the stewards' own mail, never public, K5507's D1; B3 `RULE_PARTS` 1-4 closed, the rule text's date stored) (opens when Bob names the address and keys; R24-R26 build and test while closed)

**site**
- T53 · N1110 · listed groups omit a standing withdrawal and say nothing of it; item is the group's `address`; a malformed register should fail the deploy check, not 500 every request (draft follows the module's rule until BOB rules) · N1110 R17 `after: stewards R24`

**journey-check** (numbers: N1260-b R32-R34, N1259-c R35-R38, N1265 R39-R41: none collide)
- T53 · N1259 (K4354, DEC-407/408) · registers journey (writes: local or scratch), sentinel scan, 2 s a step, act count · N1259-c R35-R38 `[first: K line for registers-target.json]`
- T53 · N1265 · the local arm walks the gate both ways (ready account, free-plan account), `JOURNEY_29_ORDER` unchanged · R39 (replaces the walk half of carried T52-98)
- T53 · N1265 (DEC-415) · `npm run linkcheck` over the installer's two tables and the sources' addresses, report file, exit status; link-check schedule recommended L1 plus L2 (a weekly CI run exists), L3 if the runners cannot reach Cloudflare · R40 `[owed: the schedule, BOB's L1-L3; amended to read jurisdictions' source addresses]`
- T53 · N1265 (K4942) · a live call first asserts the account id (`20b5...7f72`, or `CS_TEST_CF_ACCOUNT_ID` for the rehearsal alone), token from the environment never printed · R41

---

## B. New modules and omitted edges

- **register-readers** · layer 1, after `court-doctypes` (position 25); uses record-grammar, civil-time, id-spaces, ooxml, csv-reader, runtime-limits, setup-words, test-support (all earlier). Capability ruled by K4403 (1): not a new Bob decision. Zip by range: its own directory reader, since `ooxml` refuses members over 256 MiB (ooxml unchanged, recommended). `csv-reader`'s `createRecordWalk` (`walkRecords`) is exported, not Provides: promote it. `READ_BOUNDS` is not applied to `streamRegister`.
- **registers** · layer 5, after `workbooks` (75); uses the nineteen modules in its Uses (all earlier; entities is 56). K4403 (1). Size 2,500-3,500 lines; relief: split the runner (R11-R20) from search (R24-R29). Needs `modules.json` and `layers.md`; `MODULE_ORDER` is read from the file (no re-pin).
- **mail-door** · layer 3, after `doorbell` (49); uses as drafted plus `member-roster` (missing; `contribute`) and `doorbell` if it reuses its keyed digest. Product capability: **Bob's** (layers.md ruling 5); K5504-K5506 settle the feature, not the module. Recommend yes. Needs `modules.json`, `layers.md` and `member-roster/order.mjs`.
- **Omitted edges, all legal (down)**: acquisition to register-readers; case-disclosures to register-readers; registers to the nineteen; scheduler, following, notice-producers, corpus-export, case-disclosures, store-assembly, control-plane, op-declarations, answer-envelope to registers; capture to mail-reader; scheduler to doorbell, mail-door; instance-setup to mail-door; network-notices to member-roster; mail-door to member-roster; investigation to reading-pipeline and retrieval; extraction to project-roster and civil-time; journey-check to jurisdictions (R40). No upward edge anywhere in these drafts after: nameResolve pure (A, jurisdictions), N824's builder in acquisition or provenance (A), R136 test (f) in store-assembly (A), `KEYED_PURPOSES` in acquisition (A).
- No new module for N1265 (`installer-steps` R46-R49 withdrawn; `ready.mjs` stays in the installer), N858, N1110 (K5507) or N1269-N1272.

---

## C. Measurements and BOB's acts

**Before R1 (BOB's acts)**
- **M1, the `email()` probe** (K5529): account `20b533579290b9b93168345edd3b7f72` only (account check first, one throwaway Worker, before/after lists, removed even on failure, no secret printed); BOB or a worker BOB names runs it; result in `build/plan/measure-N824-email-export.md`. It decides whether the plane's upload carries `email()`: if yes, R12 and the plane's export stand; if no, the fallback (a small separate Email Worker handing the message to the plane; a 25 MiB service binding UNVERIFIED) adds entries to `bundler`, `installer-steps`, `plane` and rewrites R12. P1 and P2 gate. **P3** (delivery, 25 MiB, `setReject`, SPF/DKIM reaching the handler, log retention) needs a domain with Email Routing on that account, which is Bob's N1159 act; else record "not measured" and run P3 once the plane merges, on a scratch copy deployed from the tranche (the plan's Measurements, K5567), with CPU and memory for 25 MiB (PLATFORM). Add: whether the installer needs a new OAuth scope for mail (UNVERIFIED).
- **M-R9**: one call by a member with their own free CourtListener token by `request_credential` (entries, OPTIONS, rate headers), never printed; the answer replaces the assumed fixture. Read-only on sources: M-R2, M-R4, M-R8; N1259-f check 5 (old-key events on biosmoke8, read only).
- **record-core's two read-only checks** on biosmoke8 (K5462, C11): (1) no `settings` rows lost before R25; (2) no restore path rewrites `set_at`. A read, BOB's act, not an R2 run (STRUCTURE Q1 bars biosmoke8 for R2 deploys).
- **N1265 rehearsal shapes** on the `CS_TEST_CF_ACCOUNT_ID` account, in the new-team rehearsal alone (K4942); any other account: stop. One ready-account read plus the probe upload and delete on `20b5...7f72`. `CS_TEST_CF_TOKEN` from the environment (BOB's act; never printed). On the rehearsal, before the screen is worded: is the Allow page shown twice (B2), is a card needed (B1), does an unverified email block Workers Paid (B3). Sign-in pages are behind bot protection: Bob's walk (K4942).

**On a scratch copy (K5120); when each runs is the plan's "Measurements" (K5567: M-R3, M-R4, M-R7, M-R8, M-R10-M-R12 and the preparations at once, alongside R1; the rest after the code it measures)**
- M-R3: index storage at 73,043 / 1M / 5M rows (R23's 1,500 ms). M-R7: streaming throughput, CPU and subrequest limits per slice, deflate decoder state kept or not (2.17 GiB zip), then `REGISTER_STREAM_MAX`, `SLICE_MEMORY_MB`, `THROUGHPUT_DEFAULT`, `SLICE_TX_MS` (100 ms, with PLATFORM). M-R8: count queries. M-R10: `contactShape` false hits on real free-text columns (counts only). M-R4: identifier forms. M-R11: volatile text (counts only). M-R12: extract sizes (500 extracts). The federal zips are 5.46 GiB per cycle: BOB's download on the scratch copy. M-R2 remainder and M-R9 shape the poll. The registers journey. No deploy; the team's key is a member's act, never printed.
- **M-N1272**, on the N1268 acceptance corpus: per file kind, precision, recall, list size, 2 s time, stability. Before the run BOB records corpus, pinned questions, blind gold set and the bar in `MEASUREMENTS.md`; the draft's 95%/80%/one-tenth are proposals. The result writes `PROPOSALS_MEASURED`.
- Interpretation time checks (K4354): `interpretationOf`, `proposeParts`, `partsOf` at 5,000 pages and 1 million rows; PLATFORM's per-level bound (R119).
- N824 P3 if not done before R1; the door's CPU at 25 MiB (it runs `mail-reader` before accepting).

**Bob's acts**
- N858: find the writer and reviewer per kind; approve each text with a K ruling; name who owns re-reviews; DEC-340's two `researched` facts offered marked "researched, not reviewed" (K5538, C34).
- N1110: steward address, `STEWARD_KEYS`, `SOURCE_KEY`, N1159's Email Routing test, the civicsmith.org domain (K3296), a site deploy per listing change (K1715).
- N1159: the Email Routing domain (M1 P3).
- M-N1272 (K5537): Bob marks the gold set blind, on files and pinned questions BOB prepares and gives him before the run.

---

## D. Id collisions, as applied

| Module | Draft ids | Applied |
|---|---|---|
| content | N1259-a R63-R65 (A8 holds R63-R64) | R65-R67 |
| citation | N1259-d R26 (A8 holds R26-R27) | R28 |
| queue | N1259-c R97 (A6 keeps) | R98 |
| case-grammar | N1259-d R35, R36 | R38, R39 |
| case-disclosures | N1259-d R35-R38; G11 R39 | R40-R43; R44 |
| public-read | N1259-d R46, R47 | R50, R51 |
| screens-daily | A6 R108-R109; N1260 R108; N1272 R109 | R110; R111 |
| screens-settings | A6 R82; N1257 modules R82, R83; layer-names R84 | R83, R84; R85 |
| installer | N1265 R86-R93; N1257 | R94 (AI-DESIGN R95 on) |
| screens-intake | N1272 R72-R74 | kept; A3's lines cited A3-R3, A3-R4 |
| instance-setup | N1257 R107-R113; AI-DESIGN R107-R110; N824 R114 | BOB numbers at writing in plan order; cite by draft id |
| acquisition | N1259-a R125-R133; c R134; N1269 R135; N824 R136 | no collision (R134 was reserved for c; K5513's R36 amends the sentence R130 words) |
| jurisdictions | N1257 R121/R123/R124; N1259-a R127-R133; A2 R134-R135; N858 R136-R138 | no collision (CONSISTENCY §1's census "R99-R105" is stale) |
| journey-check, scheduler, store-assembly, setup-words, reading-guides, op-declarations, filings | N1260-b R32-R34, N1259-c R35-R38, N1265 R39-R41; scheduler c R34 and N824 R35; store-assembly c R101 and N824 R102; setup-words R20; reading-guides R19-R20 (R18 layer-names); op-declarations R84 | no collision (CONSISTENCY's N1265 journey-check census R32-R34 is stale) |

Conflicts with PLANNING resolved as in §A (`/10`, acquisition R36); none with jurisdictions R40/R125/R126/R138, filings R29, reading-guides R20, network-notices R23.

---

## E. Left out of T53 (P19), each with its hard reason

- Company officers: now registers R46 (K5498, K5532): a keyed lookup on a member's ask or the state's bulk file brought in by a member; what stays out is any background or name search (R73).
- `registerask`, `registermatch`, `registerwatchpropose` (the assisted part): K4403, not built; Bob's, after the alpha (AI-DESIGN's hand-off, e §4). Assistant proposals (N1272 R32): Bob, K5445, only with N1220's assistant.
- OpenCorporates (Bob: never, K5498, K1492), paid or account-gated sources and any people-search; webhooks (paid organisation feature, K5498); OpenFEC (bulk files need no key).
- Form 700, licence files, the state's company bulk file, NetFile as an importable register: not measured (listed `not_measured`); a team defines its own (N1259-a R7).
- A refuse-or-allow rule for citing a federal row ships `warn`; counsel's answer sets it later (K5500). California's donor rule and publishing a federal donor: counsel before the first beta (K5500); a data change only.
- N824 E2, shared or allow-listed inbox, T2/T3: Bob's (K5504-K5506). Any AI on mail: Bob's (B7). MBOX through the door: outside the door (FILES' upload, ML3).
- N1110 listing desk (R-D2a-d, no Test) and the believeincities.org pages: Bob's (K5507).
- Payment-method probe `paymentProbe`: Bob's (K5449 B1). A "verify the email" line and a further scope: Bob's (K5449 B3, B4). DEC-416's five-step page and a "turn Containers on" step: retired by DEC-430; Cloudflare has no such switch (`ready.mjs:70-72`). The weekly link run (L2/L3): outside the product, BOB's.
- N858: Texts for the Brown Act demand and other Tier 2 kinds: Bob's (K5509). Court-petition templates: Bob's, never. `MACHINE_DRAFT_UNDECLARED`: dropped (K5528 T1).
- N1272: Q1 D, interpret everything up to a size (K5445: never built). Q2 option B, a standing list on the investigation (K5495 chose A). Q4 B, read only the first part (K5447; waits for proposals): already in the plan.
- K5458 "found, not changed": action `kind` names, identifier `scheme` names, `response_statuses` words. Hard reason: not in K5458's list.

---

## F. For BOB (lower-level; each with recommendation)

1. N1259-a R130: maps `committee`, `company` to `institution` and `licence`, `filer` to `person` ("BOB confirms"). Recommend confirm; id-spaces has no such spaces.
2. Capture grade for a reduction: stays R18's rule; a lower grade would be Bob's reading of evidence strength: ask, recommend none.
3. N1259-c's UNVERIFIED marks, recommended as written: c R19 compare key, date, filer, `sealing`; c R81 a member's act under a pause is queued, `citationLookup` runs; c R97 disposition `watched-changed`; d R26 a removed leg: REPORT; d R16 segments' exemption; c R55 `rowexpunge` tables.
4. Names BOB's: extract fields, `EXTRACT_ROWS_MAX` 500, `MAX_ACTIVE_IMPORTS` 2, `SLICE_*`. FILES asks: `walkRecords` into csv-reader; `READ_BOUNDS` not on `streamRegister`. PLATFORM: where rows live per level. Storage S1-S4 waits on M-R3 (at once alongside R1, scratch; K5567); recommend S2 behind the port in R1 (e).
5. N824: rate and size figures keep (changeable `runtime-limits` rows). site R17 malformed-register rule. `sources`/A3: say `email` is not `handed_in` in A3-R1's test. Align N824 R10's `refusals[]` with ML11's `{ok:false, reason}`.
6. N858 §3 step 3 and Bob's approval step: add the listed-group check (PLANNING R138 (b) says they state it; they do not, it is only in §2 item 3 and R138). `guideOptOut`: ordinary member write; still unverified there: whether a team's own tier rule governs its review, and whether `checkGuide` runs on a profile guide.
7. N1265 R86 writes one probe upload though K5449 says "reads only": confirm that is meant (recommend yes, deleted at once).
8. N1269-N1272: ops and classes per A (op-declarations); R118 withdrawal UX; `limitsByKind` reads KIND-TABLE through `boundOf`.
9. Stale CONSISTENCY §1 census to correct (jurisdictions, installer, journey-check).
10. K5528 T3 rested on `jurisdictions` gaining no edge, but `modules.json` already lists `record-grammar` in its uses: recommend R126 import `isMachineIdentity` and `sha256HexSync` directly (same layers, no argument passing).

## G. Bob's (flagged, not decided)

- **N824 B4**: answered, K5534 (C31): visible headers without addresses; names marked material by the author.
- **mail-door as a capability module** (layers.md ruling 5): recommend yes.
- **N1110 B2** (how a declined group learns part and reason): recommend the steward's own mail, never public. **B3** (four parts as a closed list with the text's date): recommend yes; R24 is written so. Also the steward address and keys.
- **N1272 R119**: answered, K5535 (C32): a ceiling per service level, shown when reached; PLATFORM sets the figure from measurements.
- **M-N1272 gold-set reviewer**: answered, K5537 (C33 A): Bob marks the gold set blind; BOB prepares the files and pinned questions and gives them to him before the run.
- **N1259-d R36 (case-disclosures R41)**: decided by BOB, K5531: a member's own written observation is the group's words, checked before signing and refused if it holds a home address or phone (DEC-408); refusing alters nothing, so R26 stands. Not Bob's.
- **N858**: per-text writer, reviewer and any payment; the opt-out screen as an experience; the K ruling for each text (Bob's acts when each is made, K5530). DEC-340's two `researched` facts: answered, K5538 (C34): offered marked "researched, not reviewed".
