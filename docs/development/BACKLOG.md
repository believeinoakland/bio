# The backlog — everything still to do, in order

The middle file of the work pipeline (`docs/development/WORK-PIPELINE.md` §1–§2). `QUEUE.md` is the cache of the next
few items; this file holds every OTHER open item, in the order it will be processed — the top row is next.
What is done lives in the archive (`docs/archive/ledgers/QUEUE-closed*.md`).

- **Rows here use the queue's grammar** — a level-3 heading of an id, a middle dot and a state, then the row's fields
  (WORK-PIPELINE §1). A `blocked` row stays where the order put it, with what unblocks it.
- **Rows leave only by tool.** `node tools/ledger.mjs refill` moves the next runnable rows (state `queued`, every
  `depends-on` met) from the top of this file into the cache until the cache holds 8, deleting them here in the same
  act; a closed row leaves by `node tools/ledger.mjs archive <ID>`. Both refuse any move that does not conserve the id
  multiset of cache, backlog and archive, checked on the plan and again on what is read back from disk.
- **The order is SCHEDULER's** (`kickoffs/SCHEDULER.md`); new work is inserted at its place in the order.
- **Budget:** 150 KiB for the file, 2 KiB for a row (WORK-PIPELINE §2). A placement that puts this file over budget
  moves WHOLE rows from its foot to the head of `BACKLOG-LATER.md` — the same order's tail, looked up and never read
  whole — and a refill or any later write brings them back as room frees; no row is cut to fit (every `coord.mjs write`
  rebalances). `node tools/ledger.mjs invariants` prints the five pipeline invariants; `node tools/plancheck.mjs`
  enforces them.
- **Find any id** — here, in the tail, in the cache or in the archive — with `node tools/ledger.mjs find <ID>`.

Created EMPTY on 2026-09-18 by LED-6's tool half. The rows arrive with the migration (WORK-PIPELINE §5 steps 2–4),
performed by hand by the lane that owns the plan.

## Rows

### REC-187 · queued — **THE BIAS ACKNOWLEDGEMENT'S PIN AND ITS HASH MUST NAME ONE REVISION, THE ADOPTED ONE: promotion to `adopted` re-pins the adoption to the adopted bundle_sha, the case stamps that sha, and `op=biasmanifest` hashes THAT revision's statements.** Today a proposed sha can stand beside a later projection's hash — one quantity under two names (BOB.md rule 7). — owner RECORD.
order: FIRST in the backlog, by BOB #31's ruling of 2026-09-23 (*"Place ONE row FIRST in the backlog"*): a correction to just-landed work (D-84's stamp) outranks new work; it waits only on D-84's train (SCHEDULER #17, 2026-09-23)
milestone: M10
interface: I3 — the stamped sha and `op=biasmanifest`'s statements hash change meaning together; ONE IC, minted and classified by the integrator.
design: `docs/architecture/BIO_Declared_Bias_v0_1.md` §"The bias acknowledgement, authored at export" — BOB #31's ruling *"WHICH REVISION THE ACKNOWLEDGEMENT NAMES (D-84 / PL-12). The ADOPTED one."* (on `land/bob/message-driven` @ 58f6d4ed, riding the current train; a worker reads it there until it is on `main`).
depends-on: D-84 (its case stamp; `integrated` on c17-batch4, done when that train lands).
scope: re-pin at promotion to `adopted`; the case document stamps the adopted bundle_sha; `op=biasmanifest` computes `statements_sha` from exactly that revision's statements. Extend `bio-plane/test/d84-case-manifest.test.mjs` (or `bias.test.mjs`).
accepts-when: the stamped statements hash equals a hash recomputed from exactly the stamped sha's bytes, across a propose → adopt → later-propose sequence. How a liar passes it: hashing the latest projection, so the arm proposes a newer revision after adoption and recomputes from the stamped sha alone. NEGATIVE CONTROL: pin the proposed sha, and the equality arm fails by name.
added: 2026-09-23 · SCHEDULER #17 (BOB #31's ruling, 21:43Z/21:48Z; `node tools/mintid.mjs REC`).

### REC-188 · queued — **C-41 DOES NOT REQUIRE THE BIAS MANIFEST D-84 STAMPS: `checkCaseDocument` and the C-41 family never read `bias_manifest`, so a case document published without its lens still ratifies.** BOB #32 (22:26Z, G1) folds D-150's `completeness.acknowledged` and its list (possibly empty) into the SAME bump. — owner RECORD.
order: directly after REC-187: a correction to just-landed work (D-84, D-150); DEC-20's *disclosed* holds only if the gate refuses the absence (SCHEDULER #17, 2026-09-23)
milestone: M10
interface: I3 — the case document format becomes `bio-case-document/3` (additive, a newly REQUIRED key); /2 and /1 stay accepted; the integrator mints and classifies the IC.
design: `docs/architecture/BIO_Declared_Bias_v0_1.md` §"The bias acknowledgement, authored at export", with `docs/architecture/BIO_Publication_v0_1.md` §3 rules 11 and 12; the bump CONFIRMED by BOB #31 (22:03Z) and widened by BOB #32 (22:26Z): *ONE format bump carries both requirements.*
depends-on: D-84 (c17-batch4), D-150 (c17-batch7), both `integrated`.
scope: `op=publish` writes `bio-case-document/3`; a new C-41 check (mint its C-number) refuses a /3 document without the `bias_manifest` map or without `completeness.acknowledged` and its list; /2 and /1 keep ratifying as written. Extend `bio-plane/test/d84-case-manifest.test.mjs`.
accepts-when: a /3 document lacking `bias_manifest`, and one lacking the acknowledgement list, is each refused by the new C-41 check by name; a /2 document without it still ratifies; a published case reads /3. NEGATIVE CONTROL: drop the new check's push, and the "/3 without a manifest is refused" arm fails by name.
added: 2026-09-23 · SCHEDULER #17 (CONDUCT #17's finding; `node tools/mintid.mjs REC`).

### REC-193 · queued — **C-41.10's AUTHOR EXCLUSION READS THE DRAFT'S LAST EDITOR, NOT THE STATEMENT'S AUTHOR: D-150's worker used the last editor PROVISIONALLY, so a participant who edited another section could be refused acknowledging a statement they did not write, and its writer admitted.** BOB #32's ruling of 2026-09-23 22:26Z (cite it until folded into Publication §3): *the statement's author is the member who wrote the statement's CURRENT BYTES.* — owner RECORD.
order: after REC-188, the same completeness block: a correction to just-landed work (D-150) on who may attest (SCHEDULER #17, 2026-09-23)
milestone: M10
interface: I5 additive — a `statement_by` value recorded at the draft write; the integrator mints and classifies the IC.
design: `docs/architecture/BIO_Publication_v0_1.md` §3 rule 11, with BOB #32's ruling of 2026-09-23 22:26Z (cite it until folded into Publication §3).
depends-on: D-150 (`integrated` on c17-batch7).
scope: record `statement_by` (server-stamped) at every draft write that changes the statement text; C-41.10's author exclusion reads it. Extend D-150's suite (`bio-plane/test/d150*.test.mjs`).
accepts-when: B edits another section after A wrote the statement, and B may acknowledge while A is refused by name. NEGATIVE CONTROL: read the last editor again, and the "the statement's writer is refused" arm fails by name.
added: 2026-09-23 · SCHEDULER #17 (BOB #32's G2; `node tools/mintid.mjs REC`).

### REC-194 · queued — **AN ACKNOWLEDGEMENT MAY MATCH ANOTHER CASE WHOSE STATEMENT IS BYTE-IDENTICAL: D-150 binds it to the statement's bytes, not to ONE case identity.** BOB #32's ruling of 2026-09-23 22:26Z (cite it until folded into Publication §3): *an acknowledgement binds to ONE case identity; reading A's statement is not reading B's.* — owner RECORD.
order: directly after REC-193, the same block (SCHEDULER #17, 2026-09-23)
milestone: M10
interface: I3 — the `statementack` op's binding narrows to one case; the integrator mints and classifies the IC.
design: `docs/architecture/BIO_Publication_v0_1.md` §3 rule 11, with BOB #32's ruling of 2026-09-23 22:26Z (cite it until folded into Publication §3).
depends-on: D-150 (`integrated` on c17-batch7).
scope: an acknowledgement records and is matched by the case identity it was given for; a second case in the project with byte-identical statement text lists none of the first's. Extend D-150's suite.
accepts-when: two cases with identical statements, one acknowledged: the other's completeness block lists nobody. NEGATIVE CONTROL: match by statement hash alone, and the "the twin case lists nobody" arm fails by name.
added: 2026-09-23 · SCHEDULER #17 (BOB #32's G3; `node tools/mintid.mjs REC`).

### UI-89 · queued — **THE STATEMENT'S ACKNOWLEDGEMENTS HAVE A PLANE AND NO SURFACE: the `statementack` op and the signed `completeness.acknowledgements` (D-150, IC-227) are unreachable from any page.** The DELEGATION RECORD (D-150) -> UI of 2026-09-23 on coord `CLAIMS.md` names three surfaces. — owner UI.
order: after REC-194, the member half of the same block (SCHEDULER #17, 2026-09-23)
milestone: M10
interface: I3 consumer (IC-227).
design: `docs/architecture/BIO_Publication_v0_1.md` §3 rule 11 and §6A.4 (the review copy leads with the statement).
depends-on: D-150 (`integrated` on c17-batch7; verify `statementack` in `index.mjs` on `main` first).
scope: (1) the review copy leads with the exclusion statement and its acknowledgements; (2) an acknowledge act for recipients (by the grant's secret) and joined participants (by session), with DEC-49 translations for the five `STATEMENT_ACK_*` codes; (3) the published case page renders `[]` as "nobody but the author acknowledged the statement" and `null` as "the document says nothing about acknowledgements", never "nobody".
accepts-when: the three surfaces render against a live answer, and the empty and null cases read different sentences. NEGATIVE CONTROL: render `null` as `[]`, and the "null is not nobody" arm fails by name.
added: 2026-09-23 · SCHEDULER #17 (the D-150 delegation; `node tools/mintid.mjs UI`).

### UI-90 · queued — **NO SURFACE STATES THE LAWS THAT GOVERN A RECORDS REQUEST: D-149's act (`actionlaws`, registered in `ACTS_AWAITING_SURFACE`, owed to UI) has no page.** — owner UI.
order: after UI-89, the member half of D-149 (SCHEDULER #17, 2026-09-23; D-149's worker via CONDUCT #18)
milestone: M10
interface: I3 consumer (IC-230).
design: `docs/architecture/BIO_Case_Making_v0_1.md` §2 (*A RECORDS REQUEST NAMES EVERY LAW THAT GOVERNS IT*, Bob's ruling of 2026-09-22).
depends-on: D-149 (`integrated` on c17-batch7; verify the op on `main` first).
scope: the action page lists the governing laws, each with the level the plane publishes (`law_levels`), offers the member's act to set them with no default level, and shows the plane's undetermined sentence for an empty list; the act is struck from `ACTS_AWAITING_SURFACE`. Extend `civicos-ui/test/surface-registry.test.mjs` and the action page's suite.
accepts-when: an empty list reads the plane's undetermined sentence, and a member's list round-trips with its levels. NEGATIVE CONTROL: preselect a level, and the "no default level" arm fails by name.
added: 2026-09-23 · SCHEDULER #17 (`node tools/mintid.mjs UI`).

### REC-195 · queued — **THE GOVERNING-LAWS LIST HAS NO MACHINE PROPOSAL: D-149 built the member's act and the machine refusal; the design's labelled machine proposal (*if built*) is not.** — owner RECORD.
order: after UI-90, a feature below the corrections: the list is complete without it (SCHEDULER #17, 2026-09-23; D-149's worker via CONDUCT #18)
milestone: M10
interface: I3 additive — a proposal read labelled machine work; the integrator mints and classifies the IC.
design: `docs/architecture/BIO_Case_Making_v0_1.md` §2 (*A RECORDS REQUEST NAMES EVERY LAW THAT GOVERNS IT*): *a machine PROPOSAL, if built, is labelled machine work*.
depends-on: D-149 (`integrated` on c17-batch7).
scope: a proposal of citations and levels for an action, stored apart from the member's list and labelled machine work; it never sets the list, which only the member's act does.
accepts-when: a proposal is read labelled machine work, and the action's list is unchanged until the member acts. NEGATIVE CONTROL: let the proposal write the list, and the "the list is the member's" arm fails by name. New suite `bio-plane/test/rec195-laws-proposal.test.mjs`.
added: 2026-09-23 · SCHEDULER #17 (`node tools/mintid.mjs REC`).

### UI-92 · queued — **THE WORKSPACE CANNOT SHOW A PROJECT'S DRAFTS.** REC-198's list, rendered. — owner UI.
order: directly after REC-198 (SCHEDULER #17, 2026-09-23)
milestone: M10
interface: I3 consumer (REC-198's IC).
design: `docs/architecture/BIO_Publication_v0_1.md` §6A.4, with BOB #32's ruling of 2026-09-23 23:08Z (cite until folded).
depends-on: REC-198.
scope: the workspace lists the project's drafts from the plane's read; each opens.
accepts-when: every draft the plane lists appears and opens. NEGATIVE CONTROL: stub the list empty, and the listed-draft arm fails by name.
added: 2026-09-23 · SCHEDULER #17 (`node tools/mintid.mjs UI`).

### REC-199 · queued — **`op=reviewcopy` DOES NOT ANSWER `newCase`, SO AN EDIT THAT WRITES THE READ BACK LOSES IT.** BOB #32's ruling of 2026-09-23 23:08Z (cite until folded): *op=reviewcopy answers `newCase`.* — owner RECORD.
order: after UI-92 (SCHEDULER #17, 2026-09-23; UI-68's worker)
milestone: M10
interface: I3 additive — one field; the integrator mints and classifies the IC.
design: `docs/architecture/BIO_Publication_v0_1.md` §6A.4, with BOB #32's ruling of 2026-09-23 23:08Z (cite until folded).
depends-on: REC-148 (`integrated` on c17-batch7).
scope: the field in the answer. Extend the review-copy suite.
accepts-when: a read-then-write round trip keeps `newCase`. NEGATIVE CONTROL: drop the field, and the round-trip arm fails by name.
added: 2026-09-23 · SCHEDULER #17 (`node tools/mintid.mjs REC`).

### REC-200 · queued — **A REVIEW COPY'S DATE DOES NOT MOVE WHEN A COMMENT MOVES ITS HASH, AND ITS CONTAINER-SIDE STAMP IS UNRULED.** BOB #32's ruling of 2026-09-23 23:08Z (cite until folded): *the container side is stamped by `attestor.member` and `ratified_at`; the copy carries the date of its LAST change, so a comment that moves the hash moves the date.* — owner RECORD.
order: after REC-199 (SCHEDULER #17, 2026-09-23; REC-148's worker)
milestone: M10
interface: I3 — the copy's date; the integrator mints and classifies the IC.
design: `docs/architecture/BIO_Publication_v0_1.md` §6A.3, with BOB #32's ruling of 2026-09-23 23:08Z (cite until folded).
depends-on: REC-148 (`integrated` on c17-batch7).
scope: the date is the last change's; the container stamp as ruled. Extend the review-copy suite.
accepts-when: a comment moves both the hash and the date. NEGATIVE CONTROL: keep the old date, and that arm fails by name.
added: 2026-09-23 · SCHEDULER #17 (`node tools/mintid.mjs REC`).

### REC-189 · queued — **A MACHINE CREDENTIAL CAN SET `risk_tier` 1, 2 OR 3 — THE ONE FIELD THAT CARRIES LEGAL EXPOSURE — BECAUSE NOTHING AT PROMOTE ENFORCES *"only a member's authored act sets 1, 2 or 3"*.** `Store.promote`'s action block never reads `risk_tier` nor calls `isMachineIdentity`, and `op=promote` admits probe; the only machine fence on actions is `actionMove`'s. — owner RECORD.
order: after REC-188, ahead of the features: a correction to just-landed work (D-182) on the field BOB #21 ruled carries legal exposure; UI-85's chooser follows it so the fence and the member path arrive together (SCHEDULER #17, 2026-09-23, CONDUCT #17's 21:48Z finding (1), verified at c17-batch5 @ 74fc2e25)
milestone: M10
interface: I3 additive — a new refusal code, registered in `affordances.mjs`'s refusal table beside `actionmove`; the integrator mints and classifies the IC.
design: `docs/architecture/BIO_Case_Making_v0_1.md` §2, `risk_tier` RULED 2026-09-21 by BOB #21 (*"Only a member's authored act sets 1, 2 or 3"*); the MACHINE_CANNOT_* precedent at `actionMove`.
depends-on: D-182 (the undetermined tier; `integrated` on c17-batch5).
scope: in promote's action block (not on replay), refuse MACHINE_CANNOT_SET_RISK_TIER when the author is a machine identity and the new tier is 1, 2 or 3 and differs from the previous version's; an unchanged carry-forward passes. Inside a DEC-49 region; a bio-checks entry beside the actionmove one. Extend `bio-plane/test/machine-fences.test.mjs`.
accepts-when: a machine credential's promote changing a tier to 2 is refused by name; a member's promote setting 2 and a machine's unchanged carry-forward are accepted. How a liar passes it: refusing every machine promote of an action, so the carry-forward arm must pass. NEGATIVE CONTROL: drop the machine-identity clause, and the "a machine credential cannot set risk_tier" arm fails by name while the member arm stays green.
added: 2026-09-23 · SCHEDULER #17 (CONDUCT #17's finding; `node tools/mintid.mjs REC`).

### UI-85 · queued — **NO SURFACE LETS A MEMBER CHOOSE A RISK TIER: the action intake writes `risk_tier: undetermined` with no control, though the plane publishes the words (`op=affordances`, `vocabularies.risk_tiers`).** `civicos-ui/app.html` names `risk_tiers` only in a comment that says *"a chooser … is this page's to add"*; the design's front matter reads *"built except its member-facing chooser"*. — owner UI.
order: directly after REC-189, so the plane's fence and the member's only path to a tier land together; D-182's surface half (SCHEDULER #17, 2026-09-23, CONDUCT #17's 21:48Z finding (2), verified at c17-batch5 @ 74fc2e25)
milestone: M10
interface: I3 consumer (`op=affordances`'s `vocabularies.risk_tiers`); none new.
design: `docs/architecture/BIO_Case_Making_v0_1.md` §2, `risk_tier` RULED 2026-09-21 by BOB #21 (*"A surface publishes those words … invents none"*).
depends-on: D-182 (`integrated` on c17-batch5); REC-189 placed earlier.
scope: a chooser in the action intake reading the published map, `undetermined` preselected and no numeric default; `mdFor` writes `risk_tier: <n>` only when the member chose one. Extend `civicos-ui/test/add-surface.test.mjs`.
accepts-when: a member picks tier 2 and `op=projection` reads 2 with the published words; an untouched chooser writes undetermined; the page shows only words the plane published. How a liar passes it: hard-coding the three words, so an identity arm swaps the published map and the page must follow. NEGATIVE CONTROL: default the chooser to 1, and the "an untouched chooser writes undetermined" arm fails by name.
added: 2026-09-23 · SCHEDULER #17 (CONDUCT #17's finding; `node tools/mintid.mjs UI`).

### UI-86 · queued — **THE QUEUE OFFERS NO MUTE ON A FINDING, THOUGH THE PLANE NOW ACCEPTS ONE: `op=queuemute` takes FINDING kinds and the item form `{item}` (`PERSONALLY_MUTABLE_CLASSES` = CONDITION, FINDING), while `app.html`'s `queueMutableKinds` filters CONDITION only and sends only `{case, kinds}`.** Its copy (*"reaches condition kinds only"*) and `queueMuteReportHtml` are now false, and `civicos-ui/test/notifications.test.mjs` §2 still pins PL-15's superseded *"NO MUTE IS OFFERED ON A FINDING"*. — owner UI.
order: after UI-85: a correction to just-landed work (D-125's plane half), a surface that now tells a member something untrue (SCHEDULER #17, 2026-09-23, CONDUCT #17's 21:43Z finding (4), verified at c17-batch4 @ 65205437)
milestone: M8
interface: I3 consumer (`op=queuemute`'s item form); none new.
design: `docs/development/NOTIFICATIONS.md` §"MARKED AS HANDLED — and handling has a SCOPE, which differs by class" (BOB #26, 2026-09-22; D-170).
depends-on: D-125 (`integrated` on c17-batch4).
scope: FINDING kinds in the per-case control; a per-item mute sending `{item}`; the copy and the report cover item mutes and read `mute.items`; the superseded pin corrected in place with a comment saying why. Suites: `civicos-ui/test/notifications.test.mjs`, `queue.test.mjs`, `member-respect.test.mjs`.
accepts-when: a feed holding only a lead draws a mute that reaches `op=queuemute` as `{item}` and the suppression reads under `mute.items`. How a liar passes it: offering the control without sending the item form, so the arm reads the request body. NEGATIVE CONTROL: restore the CONDITION-only filter, and the "a FINDING is offered a mute" arm fails by name.
added: 2026-09-23 · SCHEDULER #17 (CONDUCT #17's finding; `node tools/mintid.mjs UI`).

### D-444 · queued — **THE PROJECT OFFERS `reinstate` THAT THE STORE WILL REFUSE: the reinstate affordance's PROJECT arm keys on the count `cites_out.severed`, so a project whose only severed edges point at RETIRED items is offered the act, and REC-183's `#edgeTransition` refuses it RETIRED_NOT_CITABLE.** The worker states it at `affordances.mjs` beside the rule (*"The PROJECT arm is not narrowed"*). — owner RECORD.
order: after UI-86: a correction to just-landed work (REC-183), an affordance that promises an act the record refuses; directly ahead of the census rows (SCHEDULER #17, 2026-09-23, REC-183's worker via CONDUCT #17, 22:09Z; verified at land/worker/REC-183 @ 27905f5d)
milestone: M8
interface: I3 additive — one new fact in `affordanceFacts`; the integrator mints and classifies the IC.
design: `docs/architecture/BIO_State_Rules_Consistency_v1_5.md` §4.1 (a retired item is not citable; BOB #30), with the affordance contract that an offered act is one the store accepts.
depends-on: REC-183 (finished, awaiting integration).
scope: `affordanceFacts` gains a fact counting severed out-edges whose target is NOT retired (e.g. `cites_out.severed_reinstatable`), read by the same predicate `#edgeTransition` runs; the PROJECT arm keys on it. Extend `bio-plane/test/affordances.test.mjs`.
accepts-when: a project whose only severed edge targets a retired item is not offered reinstate; one with a severed edge to a live item is, and the store accepts it. How a liar passes it: dropping reinstate from projects entirely, so the live-target arm must be offered. NEGATIVE CONTROL: key the arm back on `cites_out.severed`, and the retired-only arm fails by name.
added: 2026-09-23 · SCHEDULER #17 (`node tools/mintid.mjs D`; placed directly as a plan row, never a DEBT row — BOB #31, 2026-09-23 22:09Z).

### D-445 · queued — **D-443's CAP ON `publishedCaseRegistryFor` IS PINNED BY SHAPE ONLY: it binds one `json_each` value, and `frontier-chunk.test.mjs` D443-7 asserts that structurally; its own header says it was never driven past 100 ids.** D-443 is NARROWED to this one trace, not closed. — owner RECORD.
order: after D-444: a correction to just-landed work (D-443), a guarantee the suite does not yet exercise (SCHEDULER #17, 2026-09-23; D-443's worker via CONDUCT #18 22:27Z (4), verified at c17-batch7 @ f32fe714)
milestone: M0 (a behavioural arm over M4 code)
interface: none — a behavioural arm.
design: `docs/development/VERIFICATION.md` (test through the op), with D-36's bound on bound variables.
depends-on: D-443 (`integrated` on c17-batch6).
scope: arm D443-7b seeds 120 ratified published cases pinning one finding sha and gates that finding through the op that reaches `gateFacts`. In `bio-plane/test/frontier-chunk.test.mjs`.
accepts-when: D443-7b is green through the op. NEGATIVE CONTROL: the existing `casereg` arm of `frontier-chunk.control.mjs` fails D443-7b by name.
added: 2026-09-23 · SCHEDULER #17 (`node tools/mintid.mjs D`).

### D-448 · queued — **ELEVEN REVIEW-COPY REFUSAL CODES REACH A MEMBER WITH NO CANNED TRANSLATION: UI-68's surface now shows `REVIEW_NOT_PROJECT_OWNER`, `REVIEW_NO_PROJECT`, `REVIEW_DRAFT_CHANGES_PROJECT`, `REVIEW_NO_SUCH_CASE`, `REVIEW_DRAFT_TOO_LARGE`, `REVIEW_NO_RECIPIENT`, `REVIEW_NO_SECRET`, `REVIEW_NO_GRANT`, `REVIEW_NO_COMMENT_TEXT`, `REVIEW_UNKNOWN_ACT` and `NO_REVIEW_COPY`, and none has a DEC-49 row.** — owner RECORD.
order: after D-445: a correction to just-landed work (UI-68) that shows members untranslated codes (SCHEDULER #17, 2026-09-23; REC-149's and UI-68's workers via CONDUCT #18 22:47Z)
milestone: M10
interface: none — a check family and its translations.
design: `docs/architecture/BIO_Publication_v0_1.md` §6A.4 (the review copy), with DEC-49's translation rule.
depends-on: UI-68 (`integrated` on c17-batch7).
scope: a review-copy `*_CHECKS` family in `bio-checks.mjs` with DEC-49 regions and one canned sentence per code. Separately worth weighing: `check-refusal-codes.mjs` learning reach-by-op, since its R2 cannot see a code no surface names.
accepts-when: the refusal-code census reads every one of the eleven as translated. NEGATIVE CONTROL: drop one code's region, and the census arm names it.
added: 2026-09-23 · SCHEDULER #17 (`node tools/mintid.mjs D`).

### D-450 · queued — **A PROJECT WHOSE BAR DECLARES ONE AXIS CAN PUBLISH AND CAN NEVER BE SIGNED: `publishCase` admits it (*an unset axis gates nothing*), `#caseDocumentText` freezes the unset axis as null, and C-41.12 (`checkCaseDocument`'s `required_strength` arm) demands both axes A–D when the bar is declared, so `op=ratify` answers GATE_REFUSED.** Found by REC-148's worker; reported, not re-measured by SCHEDULER. — owner RECORD.
order: after D-448: a correction to just-landed work (REC-148) that strands a publishable case unsigned (SCHEDULER #17, 2026-09-23; via CONDUCT #18 22:48Z (3a))
milestone: M10
interface: none — a check's admitted values.
design: `docs/architecture/BIO_Publication_v0_1.md` §"the bar" (DEC-72) and §3 rule 12, with BOB #32's ruling of 2026-09-23 23:08Z (cite until folded): *C-41.12 ADMITS null for an unset axis; the pair stays a pair — both keys present, an unset axis null, stated in words "no bar set on the <axis> axis"; `op=strengthbar` keeps accepting a one-axis bar* (refusing it would pressure an invention, CLAUDE.md §4).
depends-on: REC-148 (`integrated` on c17-batch7).
scope: C-41.12 admits null for an unset axis; the case document states the unset axis in words, never defaults and never omits the key. Extend `bio-plane/test/caseproduction.test.mjs`.
accepts-when: a one-axis bar publishes, ratifies, and its document reads "no bar set on the <axis> axis" with the key present and null. NEGATIVE CONTROL: restore the both-axes demand, and the one-axis ratify arm fails by name.
added: 2026-09-23 · SCHEDULER #17 (`node tools/mintid.mjs D`).

### D-451 · queued — **A PROJECT RUN HAS NO TARGET A MEMBER CAN NAME: `op=airun` publishes only the run's context `{type, id}`, so FL-11's `runContextTarget` cannot seed a project run, and its level-empty candidates are refused SUGGEST_NO_TARGET.** — owner RECORD, then FLEET (one line).
order: after D-450: a correction to just-landed work (FL-11), the run's suggestions lost for every project run (SCHEDULER #17, 2026-09-23; FL-11/12's worker via CONDUCT #18 22:51Z)
milestone: M9
interface: I3 additive — `aiRunRead` publishes a project run's questions; the integrator mints and classifies the IC.
design: `docs/development/INVESTIGATIVE-SESSION.md` §11 (the RUN is an object) and §9 (what a SUGGESTION is).
depends-on: FL-11 (`integrated` on c17-batch7).
scope: for a project run, `aiRunRead` publishes the questions the project confirmed-cites (the set `#runContextProjects` uses); `runContextTarget` takes a single one or leaves several to the candidate. Extend `agent-worker/test/agent-worker.test.mjs` and the airun suite.
accepts-when: a project run citing one question seeds it as the target, and its level-empty candidates are filed. NEGATIVE CONTROL: drop the questions from the read, and the project-run arm reads SUGGEST_NO_TARGET by name.
added: 2026-09-23 · SCHEDULER #17 (`node tools/mintid.mjs D`).

### D-454 · queued — **ONE STRING READ ON SEVERAL PAGES IS ONE MENTION: `reading_refs` holds a single position per (capture_sha, ref), so a member choosing a connection's on-point mention (REC-122) cannot choose between that string's occurrences.** — owner CAPTURE / FRAMEWORK (the reading tables).
order: after D-452: a correction that REC-122's act exposes; the choice it built is only as fine as the positions it can name (SCHEDULER #17, 2026-09-23; REC-122's worker via CONDUCT #18 23:08Z)
milestone: M4
interface: I5 — `reading_refs` keyed by (capture_sha, ref, position); I3 — a resolution carries its occurrence. The integrator mints and classifies the ICs.
design: `docs/architecture/BIO_Content_Framework_v0_10.md` §14.5 (the connection pair) and §8 (the reading positions a connection rests on).
depends-on: REC-122 (`integrated` on c17-batch7).
scope: re-key `reading_refs` by position with a migration that keeps every existing row; each resolution names its occurrence; the connection's mentions list every occurrence.
accepts-when: a ref read on three pages yields three mentions, each choosable. NEGATIVE CONTROL: restore the two-column key, and the three-occurrences arm reads one by name. Extend the reading suite (`bio-plane/test/reading-position*.test.mjs`).
added: 2026-09-23 · SCHEDULER #17 (`node tools/mintid.mjs D`).

### UI-91 · queued — **A MEMBER CAN CHOOSE A CONNECTION'S ON-POINT MENTION ON THE PLANE, AND NO SURFACE OFFERS IT: REC-122's `connectionchoose` (IC-232, C-74) has no page; construct 6.on-point-ui is ABSENT.** The DELEGATION RECORD (REC-122) -> UI of 2026-09-23 is on coord `CLAIMS.md`. — owner UI.
order: after D-454, the member half of REC-122 (SCHEDULER #17, 2026-09-23; REC-122's worker via CONDUCT #18 23:08Z)
milestone: M4
interface: I3 consumer (IC-232).
design: `docs/architecture/BIO_Content_Framework_v0_10.md` §14.5 (the connection pair and what it is NOT), with D-161's act 3.
depends-on: REC-122 (`integrated` on c17-batch7; verify the op on `main` first).
scope: on the connection display, offer a signed-in member the choice among the mentions the C-49.4 entries name as bearing; show the chosen mention BESIDE the machine's pair, never replacing it; render a lapsed choice as the plane states it; replace 6.on-point-ui's `uinone` probe with `hit` probes.
accepts-when: a member's choice renders beside the machine's pair, and a lapsed one reads as the plane states it. NEGATIVE CONTROL: render the choice in place of the pair, and the "never replacing" arm fails by name.
added: 2026-09-23 · SCHEDULER #17 (`node tools/mintid.mjs UI`).

### D-242 · queued — **`mintid`'s EXCLUSIVE CREATE IS EXCLUSIVE AGAINST NOTHING NOW THAT EVERY WORKER IS ITS OWN CLOUD CLONE: the row's WATCH trigger (a worker running outside one Mac's worktrees) has fired, and only the floor read from `origin/coord` stands between two concurrent mints.** `ORCHESTRATION.md` §"TAKING AN ID" still describes the one-clone scope. — owner M0 (tools).
order: MOVED UP 2026-09-23 by SCHEDULER #17 to follow the corrections at the head: it now costs product cycles (3 IC-222s, IC-228, IC-224, C-68, 2 M-117s burned in one day across cloud workers), so it cuts integration time; M0-120, its audit half, follows later (SCHEDULER #17, 2026-09-23, LED-7 S17-2)
milestone: M0
interface: none
design: `docs/development/VERIFICATION.md` (an instrument states its scope), with `docs/development/ORCHESTRATION.md` §"TAKING AN ID" corrected in the same landing.
depends-on: none.
scope: move the take to one writer: a compare-and-swap push to `origin/coord` (a remote ref refuses a non-fast-forward) or the plane's `Store.allocId`.
accepts-when: two clones minting one namespace at once receive distinct ids. NEGATIVE CONTROL: bypass the single writer, and the "distinct ids" arm fails by name. Whether a collision has happened since the move is UNDETERMINED (not measured).
added: 2026-09-23 · SCHEDULER #17 (LED-7 S17-2; keeps its `D-` id).
note: 2026-09-23 by SCHEDULER #17 (D-148's and D-149's workers via CONDUCT #18): measured harm — the C floor reads `origin/main` only, so mintid handed out C-68..C-72 while live on `land/*` branches and both workers burned several. The single writer closes it; until then the C floor also reads every `land/*` tip.

### REC-192 · queued — **A STORED VERSION'S INDEPENDENCE CAN ONLY BE READ BESIDE ITS STRENGTH PAIR: `op=versionstrength` is the one read of it, so DEC-32 clause 5 (*the structure is authored before the strength is shown*) holds only because UI-74's page drops the pair it fetched.** BOB #31's ruling of 2026-09-23 22:22Z (cite it until folded): *a read returns `independence` on its own, so clause 5's separation is structural at the wire.* — owner RECORD.
order: after D-256: a correction to just-landed work (UI-74, REC-161) that moves a doctrine from a page's choice into the wire (SCHEDULER #17, 2026-09-23)
milestone: M9
interface: I3 additive — `partitionindependence` (REC-161) takes `version=<id>` and reads that stored version's legs through the same `#independenceOf`, returning no strength field; versionstrength's gate and viewer stamp kept. The integrator mints and classifies the IC.
design: `docs/development/INVESTIGATIVE-SESSION.md` §12 (Strength, clauses (a)–(c)) with DEC-32 clause 5, and BOB #31's ruling of 2026-09-23 22:22Z (cite it until folded).
depends-on: REC-161 (`integrated` on c17-batch5).
scope: the version arm on the independence read. Extend `bio-plane/test/partitionindependence.test.mjs`.
accepts-when: the version arm's answer carries no strength key and equals versionstrength's `independence` for the same version. NEGATIVE CONTROL: add a strength field to the version-arm answer, and the "no strength key" arm fails by name.
added: 2026-09-23 · SCHEDULER #17 (UI-74's worker finding via CONDUCT #17; `node tools/mintid.mjs REC`).

### UI-88 · queued — **THE ACCEPT CEREMONY FETCHES THE STRENGTH PAIR BEFORE THE MEMBER AFFIRMS, AND HIDES IT: `app.html` `acerOriginsRead` reads `op=versionstrength` and drops the pair client-side.** Once REC-192 lands it switches to the independence-only read. — owner UI.
order: directly after REC-192, which it consumes (SCHEDULER #17, 2026-09-23; BOB #31's ruling of 2026-09-23 22:22Z (cite it until folded))
milestone: M9
interface: I3 consumer (REC-192's IC).
design: `docs/development/INVESTIGATIVE-SESSION.md` §12 (Strength) with DEC-32 clause 5.
depends-on: REC-192, UI-74 (`integrated` on c17-batch5).
scope: `acerOriginsRead` reads the version arm of the independence read; no code path fetches a strength-bearing answer before the affirmation. Extend `civicos-ui/test/accept-ceremony.test.mjs`.
accepts-when: before the affirmation the ceremony's network log holds no strength-bearing answer. NEGATIVE CONTROL: point `acerOriginsRead` back at `op=versionstrength`, and the pre-affirmation fetch arm fails by name.
added: 2026-09-23 · SCHEDULER #17 (`node tools/mintid.mjs UI`).

### REC-190 · queued — **NOTHING CAN FIND A CAPTURE MOVED BETWEEN BUNDLES BEFORE D-179's FENCE: the old UPSERT moved the register row (`capture_sha` is its primary key) to the newcomer, leaving the original bundle's `files`/`history` rows naming a sha the register gives to another bundle, and `registerAudit` reads the moved row as live.** — owner RECORD; DIST runs it live.
order: after UI-86: the census that tells whether D-179's residue exists on a live record, before anything repairs it (SCHEDULER #17, 2026-09-23, CONDUCT #17's 21:43Z finding (6), verified at c17-batch4 @ 65205437)
milestone: M2
interface: I3 additive — one new admin/probe census op, `mutating:false`, REC-175's shape (proposed name homecensus); the integrator mints and classifies the IC.
design: `docs/architecture/BIO_Intake_Doctrine_v1_1.md` §8 (*"ONE CAPTURE, ONE HOME — the ORIGINAL's"*). REPAIR of what it finds, and the digest-level duplicate (the same content in different bytes, §8's Incomplete note), are NOT in scope, by BOB #31's ruling of 2026-09-23 22:03Z (cite it until folded): *the census's report STANDS ALONE*; which bundle held a capture first is UNDETERMINED and the report says so; the digest-level duplicate is named as out of reach.
depends-on: D-179 (the fence; `integrated` on c17-batch4).
scope: list every `files`/`history` row whose sha the register assigns to a DIFFERENT, still-existing bundle, with both bundles named; never write. New suite `bio-plane/test/homecensus.test.mjs`, seeding a moved row at the store.
accepts-when: a store seeded with one moved row lists that sha under both bundles; a clean store lists none; the record's counters read before and after the call are unchanged. How a liar passes it: listing every multi-bundle sha including legitimate shares, so the clean-store arm must read none. NEGATIVE CONTROL: remove the different-bundle predicate, and the "displaced row found" arm fails by name.
added: 2026-09-23 · SCHEDULER #17 (CONDUCT #17's finding; `node tools/mintid.mjs REC`).

### D-64 · queued — **A CLIENT-RENDERED PAGE IS RECOGNISED AS A SHELL AND STILL CANNOT BE CAPTURED AS EVIDENCE: only detection is built (`docprofile/handlers/client-rendered.mjs`; `airun.mjs` holds a shell at LOOKED_INDETERMINATE, never PRESENT); there is no Browser Rendering binding and no rendered capture.** — owner RECORD (the binding through DIST).
order: with the M2 capture rows, behind its substrate (BOB #31, 22:22Z: *place the capture row behind its substrate*) (SCHEDULER #17, 2026-09-23, LED-7 S17-2)
milestone: M2
interface: I3 — a render arm on capture producing the pair, and the `render` provenance block; the integrator mints and classifies the IC.
design: `docs/development/CLIENT-RENDERED.md` §"What must be recorded on a rendered capture"; scripts ALLOWED AND RECORDED (BOB #31, 22:22Z); and BOB #32's ruling of 2026-09-23 23:08Z (cite until folded): *method `rendered`; one capture holds BOTH artifacts with the RENDERED document PRIMARY and the shell beside it under its own digest; an unattended sweep MAY render within the daily render allowance and through the governor, recording DEFERRED (undetermined) when spent — never the shell as content.*
depends-on: 2.capture (BUILT); the Browser Rendering binding is NOT built and is this row's first act.
scope: the render arm writes one capture: the rendered document (method `rendered`, primary) and the shell (its method and digest), joined by `render.of`, with the `render.*` fields and `third_party_executed`; the sweep's deferral. New suite `bio-plane/test/rendered-capture.test.mjs`.
accepts-when: a rendered capture of a shell holds both artifacts and names every script origin executed, or says undetermined. NEGATIVE CONTROL: force `determined` on a page drawing data from a second origin, and that arm fails by name.
added: 2026-09-23 · SCHEDULER #17 (LED-7 S17-2; D-64's DEBT row of 2026-07-30; keeps its `D-` id).

### D-453 · blocked — awaiting Bob: egress from this cloud to Oakland's hosts (the proxy refused CONNECT to Legistar, data.oaklandca.gov, www.oaklandca.gov, opengov, Accela, acgov.org, oaklandauditor.com on 2026-09-23), an environment setting only Bob can change — **D-74's IDENTIFIER-SPACE MEASUREMENT IS HALF TAKEN: four cross-system joins were never measured, so construct 6.identifier-spaces stays ABSENT on evidence that stops at the corpus already held.** — owner CONTENT (a measurement).
order: after D-64, a measurement blocked on the environment; its results feed BOB's three recogniser designs (SCHEDULER #17, 2026-09-23; D-74's worker via CONDUCT #18 22:58Z)
milestone: M0 (a measurement for M4's identifier spaces)
interface: none — measurements.
design: `docs/development/VERIFICATION.md` (measure; do not recall), for M-119 and `tools/m119-idspace.py`.
depends-on: D-74 (`integrated` on c17-batch7); egress.
scope: (a) Legistar unfiltered, looking up the C.M.S. numbers the ACFRs and budget books cite; (b) the procurement host's contract and PO numbers against Legistar awards; (c) Assessor APNs against Legistar and Accela; (d) one 100xxxx project in both a budget book and a Legistar title, and whether a C-form to new-form crosswalk exists. Re-run `tools/m119-idspace.py` over the wider corpus.
accepts-when: each of (a)–(d) is recorded with date, instrument and counts, a refused host named as refused rather than read as absent. NEGATIVE CONTROL: feed the tool a corpus with one planted join, and it counts exactly one.
added: 2026-09-23 · SCHEDULER #17 (`node tools/mintid.mjs D`).

### REC-191 · queued — **MONITORING SCHEDULES A BUNDLE, NOT AN ADDRESS, AND ONLY BY ITS AUTHORED FREQUENCY: sixty captures of one document are sixty schedules, and a document with no authored frequency reads `unscheduled` though `op=monitor` answered it by its contract (D-65's worker finding (a)).** `Store#monitorCadencePlan` selects `bundles WHERE monitor_enabled=1`. — owner RECORD.
order: after REC-190, behind D-65 (running; same op and path); a gap, not an over-claim (SCHEDULER #17, 2026-09-23, CONDUCT #17 21:43Z (5) and #18 22:27Z (2), verified at the code)
milestone: M3
interface: I3 — `op=monitor`'s schedule and report become per address, naming every version grouped; the integrator mints and classifies the IC.
design: D-220's ruled intent (Bob 2026-08-06, *"Monitoring an ADDRESS is what a member means"*) with `docs/architecture/BIO_Content_Framework_v0_10.md` §6 (the contract sets the check frequency); BOB #31's 22:03Z ruling (cite until folded): *the ADDRESS's own setting governs; where none is set, the CURRENT version's; never the shortest; a disagreement is STATED.*
depends-on: D-65 (c17-batch6), D-220 (c17-batch4), both `integrated`.
scope: `#monitorCadencePlan` groups monitored bundles by `captured_locators.address_norm` through the version-chain join, checks the address once against its current version, reports the versions grouped and any frequency disagreement; persists each address's content type from the tick (in `purge`) and falls back to `CONTRACT_FREQUENCY` where nothing is authored. Renumber D-220's archived body to match its disposition. Extend `bio-plane/test/monitor-cadence.test.mjs`.
accepts-when: three captures of one address give one due entry; two addresses sharing a title give two.; a calendar with no authored frequency is due a day after one tick. NEGATIVE CONTROL: restore the per-bundle select, and the one-address arm fails by name, and dropping the fallback fails the calendar arm.
added: 2026-09-23 · SCHEDULER #17 (CONDUCT #17's finding; `node tools/mintid.mjs REC`).

### D-455 · queued — **A `changed` MONITOR TICK DISCARDS THE BYTES IT FETCHED: it points its result at the baseline because the new document is not captured, though the monitor already held those bytes to see the change.** BOB #32's ruling of 2026-09-23 23:08Z (cite until folded): *a `changed` tick CAPTURES the new bytes (a monitor capture with its own provenance, through the governor), and its result_ref points at the new capture's sha* — superseding `OBSERVATION-LOG-DESIGN.md` §4.1's reason. — owner RECORD.
order: after REC-191, the same monitor path; evidence in hand is being thrown away (SCHEDULER #17, 2026-09-23; D-65's worker finding (b))
milestone: M3
interface: I3/I5 — a monitor capture and the observation's reference; the integrator mints and classifies the IC.
design: `docs/development/OBSERVATION-LOG-DESIGN.md` §4.1, with BOB #32's ruling of 2026-09-23 23:08Z (cite until folded).
depends-on: D-65 (`integrated` on c17-batch6).
scope: on `changed` the tick captures the served bytes with monitor provenance through the governor and points the observation at that capture. Extend `bio-plane/test/monitor-assess.test.mjs`.
accepts-when: a changed tick leaves a capture whose sha the observation names, and that sha resolves in the register. NEGATIVE CONTROL: skip the capture, and the "result names a held capture" arm fails by name.
added: 2026-09-23 · SCHEDULER #17 (`node tools/mintid.mjs D`).

### D-338 · queued — **THE `unmonitorable` CONTRACT IS DECLARED AND UNTESTED: D-65 maps a shell to UNMONITORABLE (`CONTRACT_FREQUENCY.unmonitorable: null`, with its why), and no suite drives it; whether the monitor still reports a hash delta for such a document is UNDETERMINED.** — owner RECORD.
order: after D-455, the same monitor path (SCHEDULER #17, 2026-09-23, LED-7 S17-3; verified at the code on `02603e88`)
milestone: M3
interface: none — an arm.
design: `docs/architecture/BIO_Content_Framework_v0_10.md` §6.
depends-on: D-65 (`integrated` on c17-batch6).
scope: an unmonitorable arm in D-65's monitor suite (`bio-plane/test/monitor-assess.test.mjs`); fix any hash-delta report it exposes.
accepts-when: a shell-profiled document's answer states unmonitorable and grades no change. NEGATIVE CONTROL: map unmonitorable to weekly, and the arm fails by name.
added: 2026-09-23 · SCHEDULER #17 (LED-7 S17-3; keeps its `D-` id).

### REC-159 · blocked — awaiting Bob: an attended session or a permission rule — CONDUCT #17's spawn was refused [Permission Grant] 21:11Z (Bob approved the change ~21:08Z; no worker exists). REC-162 and REC-155 depend on it.
order: directly before REC-155, on the same `SESSION_OPS` sets and `d270-refusal-truth`'s ROLE literal: a false refusal shipping to a real administrator outranks a determination owed (SCHEDULER #7, 2026-09-21; REC-156's DELEGATION via CONDUCT #10)
milestone: M8
interface: I3 — four ops gain session reach and three a stamped `by`; the integrator mints and classifies the IC.
design: `docs/architecture/BIO_Membership_Architecture_v2.md` §4.9 (each act is EVERY administrator's) and … (whole text: the cut archive)
depends-on: none. D-136 and REC-156 are on `main`.
accepts-when: an enrolled administrator performs all four from their session, attributed to them; a member is refused by name. How a liar passes it: widening the class without the roster … (whole text: the cut archive)
scope-amended: + memberset/signeradd/signerset record the server-stamped actor in a new `by` column; existing rows read `not recorded` (BOB #31 21:08Z; attribution lives in the record). The accepts-when gains an arm per op through the op, and its NEGATIVE CONTROL drops one op's stamp.
added: 2026-09-21 · SCHEDULER #7 (REC-156's DELEGATION; `node tools/mintid.mjs REC`).

### REC-162 · queued — **A FOUNDER-ONLY OP'S REFUSAL CALLS AN ENROLLED ADMINISTRATOR A NON-ADMINISTRATOR.** Five ops sit in `SESSION_OPS.admin` and … (whole text: the cut archive)
order: back to back after REC-159, the same two suites (`d270-refusal-truth`'s ROLE literal, `adminvote` §8f), the second re-reading the first's pins; a false refusal sentence, CLAUDE.md §2's class (BOB #23's entry, 2026-09-21; SCHEDULER #7)
milestone: M8
interface: I3 — the refusal's sentence; the integrator classifies it in IC-55's family.
design: `docs/architecture/BIO_Membership_Architecture_v2.md` §4.9, *AND ADMINISTRATORS DO NOT RUN THE INSTANCE* (BOB #23, 2026-09-21).
depends-on: REC-159 (sequence: the same `SESSION_OPS` sets and ROLE literal; made a dependency 2026-09-23 by SCHEDULER #16 so no refill takes this row ahead of it).
accepts-when: an enrolled administrator and a member, each refused `governorconfig`, read the founder's-session sentence; the founder's session and the ADMIN_TOKEN bearer still set an … (whole text: the cut archive)
added: 2026-09-21 · SCHEDULER #7 (BOB #23's inbox entry, drained this commit; `node tools/mintid.mjs REC`).

### REC-155 · queued — **SEVEN VERBS WHOSE `OPS` ROW ADMITS A SESSION CLASS WERE REACHABLE BY NO SESSION, AND NOBODY HAD RULED WHY — NOW RULED** … (whole text: the cut archive)
order: where it stood, now with its design (BOB #20's entry): the plane is honest here — a determination was owed, not a defect shipping — and this landing refuses nobody (SCHEDULER #5, 2026-09-21; placed by SCHEDULER #3, 2026-09-19)
milestone: M8
interface: I3 — MINOR: sessions gain reach and no class list moves; the integrator mints the IC.
design: `docs/architecture/BIO_Membership_Architecture_v2.md` §4.10 (ruled by BOB #19, landed by BOB #20 at `d9cf3283`).
depends-on: REC-159 (sequence: the same `SESSION_OPS` sets and ROLE literal; made a dependency 2026-09-23 by SCHEDULER #16 so no refill takes this row ahead of it).
accepts-when: each of the five answers a member session and an administrator session with the op's own result; the two unattended ops answer every session `MACHINE_CREDENTIAL_REQUIRED` with … (whole text: the cut archive)
added: 2026-09-19 · SCHEDULER #3 (CONDUCT #7's item 1); designed 2026-09-21 by §4.10, BOB #20's entry drained by SCHEDULER #5.

### UI-83 · queued — **A MEMBER CANNOT REVISE A PROGRESSION FROM THE UI: D-128 made a revision require a basis statement and a citation (`NO_BASIS`, `NO_CITATION`), and `civicos-ui/app.html`'s progression form (`progDefineDraft` / `progDefineGo`) has neither field.** Declaring a new progression still works. Re-read on `land/conduct/c17-batch3` @ `419272eb`. — owner UI.
order: directly after D-443, first of the D-128 follow-ons: a surface that answers a member's act with a refusal it gives them no field to meet is a correction to just-landed work, which outranks new work (SCHEDULER #16, 2026-09-23; D-128's worker via CONDUCT #17)
milestone: M8
interface: I3 consumer (D-128's IC).
design: `docs/architecture/BIO_Content_Framework_v0_10.md` §8.2, "The declared flow, and its revisions" (BOB #27, 2026-09-22), the ruling D-128 built.
depends-on: D-128 (on `land/conduct/c17-batch3`).
scope: the progression form offers, when revising an existing progression, a basis-statement field and a citation field, and sends both; a refusal still reads through `refusalWords(r)`.
accepts-when: `civicos-ui/test/` gains a suite arm driving a revision through the form with both fields to a landed version, and one without either reading the canned refusal; the UI harness green. NEGATIVE CONTROL: drop the citation field, and the revision arm reads `NO_CITATION` and fails by name.
added: 2026-09-23 · SCHEDULER #16 (D-128's worker's finding via CONDUCT #17, verified on the batch; `node tools/mintid.mjs UI`).

### REC-184 · queued — **A PROPOSAL DISPOSITION DOES NOT RECORD THE DEFINITION VERSION IT WAS DECIDED AGAINST, SO ONE MADE UNDER VERSION 1 SILENTLY APPLIES UNDER VERSION 2.** `proposal_dispositions` is keyed `(progression_key, stage_key)` with no version (re-read on `land/conduct/c17-batch3` @ `419272eb`). Also, the stats counters beside `progressionDefs` / `progressionStages` (`store.mjs` ~26650) do not count D-128's version tables. — owner RECORD.
order: directly after UI-83, the same D-128 follow-on: a decision the record applies to a definition nobody judged is the record claiming more than it supports (CLAUDE.md §2) (SCHEDULER #16, 2026-09-23; D-128's worker via CONDUCT #17)
milestone: M4
interface: I5 — a `definition_version` column on `proposal_dispositions`; the integrator mints and classifies the IC.
design: `docs/architecture/BIO_Content_Framework_v0_10.md` §8.2, "The declared flow, and its revisions" (BOB #27), the ruling D-128 built.
depends-on: D-128 (on `land/conduct/c17-batch3`).
scope: `op=proposedispose` writes `definition_version`; a read against a later version does not treat an earlier-version disposition as current, stated; rows written before read `not recorded`; the stats counters count the version tables.
accepts-when: `bio-plane/test/proposedispose.test.mjs` gains an arm: a disposition under version 1 does not apply under version 2, and the column reads back. NEGATIVE CONTROL: stop writing the version, and that arm fails by name.
added: 2026-09-23 · SCHEDULER #16 (D-128's worker's finding via CONDUCT #17, verified on the batch; `node tools/mintid.mjs REC`).

### UI-84 · queued — **THE UI's MOCK REFUSALS FOR `verify` AND `unknown op` CARRY NO `translation`, WHILE THE LIVE WIRE NOW DOES (C-61.1, C-69.1, D-278), AND `refusalWords` RENDERS THE TRANSLATION FIRST — SO THE MOCKS ARE NARROWER THAN THE WIRE (the M-72 class).** Found in `civicos-ui/test/preauth-vocabulary.test.mjs` and sibling mocks; re-read on `land/conduct/c17-batch3` @ `d93d29c4`. — owner UI.
order: after REC-184, with the D-278 follow-ons: a suite that pins what a member reads against a mock narrower than the wire can pass while the member reads something else, a correction to just-landed work (SCHEDULER #16, 2026-09-23; D-278's worker via CONDUCT #17)
milestone: M8
interface: none (test mocks); the integrator classifies.
design: DEC-49 (`node tools/decided.mjs "DEC-49"`) as `docs/architecture/BIO_Assistant_and_AI_Roles_v0_1.md` rule 10 restates it: every condition has a named code and a canned translation.
depends-on: D-278 (on `land/conduct/c17-batch3`).
scope: every mock refusal for `verify` and `unknown op` carries `translation`, imported from `bio-checks.mjs` (never retyped); DEC-49's SUBJECT arm in `preauth-vocabulary.test.mjs` re-pinned with the movement stated (old and new figures and why).
accepts-when: `civicos-ui/test/preauth-vocabulary.test.mjs` and `refusal-translation-surface.test.mjs` green with the imported translations; the UI harness green. NEGATIVE CONTROL: drop `translation` from one mock, and the SUBJECT arm fails by name.
added: 2026-09-23 · SCHEDULER #16 (D-278's worker's finding via CONDUCT #17, verified on the batch; `node tools/mintid.mjs UI`).

### REC-185 · queued — **`op=purge`'s `purge requires confirm=<store>` (a 400 in `index.mjs`) IS STILL A BARE SENTENCE WITH NO CODE — the last of D-278's class the sweep could see.** Re-read on `land/conduct/c17-batch3` @ `d93d29c4`: `json({ ok: false, error: "purge requires confirm=<store>", … })`. UNDETERMINED, stated by the worker: its matcher sees only `json({ok:false…})` literals in `index.mjs`, not the 16 codes forwarded through a spread from the store, nor refusals built without `json()`. — owner RECORD.
order: directly after UI-84, the same D-278 class: a refusal with no code a member cannot be told in words (CLAUDE.md §2) (SCHEDULER #16, 2026-09-23; D-278's worker via CONDUCT #17)
milestone: M7
interface: I3 — `op=purge`'s refusal gains a code through `requiredArgument`; the integrator classifies the IC.
design: DEC-49, as `docs/architecture/BIO_Assistant_and_AI_Roles_v0_1.md` rule 10 restates it, with D-278's landed `requiredArgument` as the precedent.
depends-on: D-278 (on `land/conduct/c17-batch3`).
scope: the refusal is `requiredArgument("purge", "confirm", "<store name>", …)`; the sweep's two blind spots (spread-forwarded codes, refusals built without `json()`) are measured and each listed or coded.
accepts-when: `bio-plane/test/refusal-wire.test.mjs` gains an arm: `op=purge` without `confirm` answers the coded refusal with its canned translation, through the op. NEGATIVE CONTROL: restore the bare sentence, and that arm fails by name.
added: 2026-09-23 · SCHEDULER #16 (D-278's worker's finding via CONDUCT #17, verified on the batch; `node tools/mintid.mjs REC`).

### REC-186 · queued — **MEMBERSHIP §7's TWO UNRULED EDGES, RULED (BOB #31, 2026-09-23 21:37Z): (a) THE PROJECT'S ONLY OWNER CANNOT "ASK TO LEAVE" — `projectLeave` refuses the last owner by name ("transfer ownership first") and `op=affordances` does not offer it; a non-last owner may leave. (b) A JOINED PARTICIPANT IS NOT OFFERED "JOIN" — `projectJoin` stays idempotent, but an offer that does nothing is an overclaim.** Found by D-311's worker (`projectLeave` does not check the owner flag). — owner RECORD.
order: directly after REC-185, the D-311 follow-on: a project left ownerless and an affordance that changes nothing are both the record claiming more than it supports (CLAUDE.md §2) (SCHEDULER #16, 2026-09-23; BOB #31's ruling, via CONDUCT #17)
milestone: M8
interface: I3 — a new refusal on `op=projectleave` and a narrower `op=affordances`; the integrator mints and classifies the IC.
design: `docs/architecture/BIO_Membership_Architecture_v2.md` §7.4 and §7.6, with BOB #31's ruling of 2026-09-23 21:37Z (BOB folds it into §7 at his next doc landing).
depends-on: D-311 (on `land/conduct/c17-batch3`).
scope: (a) and (b) as ruled.
accepts-when: in a NEW suite `bio-plane/test/rec-186-leave-join.test.mjs`, through the ops: the last owner's leave is refused with the membership rows byte-identical after, a co-owner's leave lands; affordances offers no join to a joined participant and does offer it to an invited non-participant. NEGATIVE CONTROL (`rec-186-leave-join.control.mjs`): drop the owner check, and the refusal arm fails by name; offer join unconditionally, and the join arm fails by name.
added: 2026-09-23 · SCHEDULER #16 (BOB #31's ruling; `node tools/mintid.mjs REC`).

### DIST-7 · queued — **THE INSTALLER UPLOADS EVERY GROUP'S PLANE WITH NO `limits`, SO EACH INSTANCE RUNS AT CLOUDFLARE'S DEFAULT SUBREQUEST LIMIT WHATEVER THE SIGNED RELEASE CARRIES.** Re-read on `91bcea6b`: `newgroup/src/index.mjs` `uploadInstall` and `uploadUpdate` hard-code `main_module`, `compatibility_date` and `compatibility_flags` and send no `limits`. — owner DIST.
order: after D-443, the first installer row: a sovereign group's instance runs under a ceiling its own release does not set, so the project's measured subrequest figure does not reach a group (D-54's finding); product (M7), below the record-integrity rows (SCHEDULER #16, 2026-09-23; D-54's worker via CONDUCT #17)
milestone: M7
interface: I5 (the installer's upload metadata); the integrator classifies.
design: `docs/architecture/BIO_Distribution_v0_1.md` (the installer installs the signed release as released), with IC-82's carry of `compat` from the signed release as the precedent.
depends-on: D-54 (its `limits.subrequests` and `15.subrequest-limit` claim; on `land/conduct/c17-batch3`).
scope: `uploadInstall` and `uploadUpdate` carry `limits.subrequests` from the signed release, as `compat` is carried, never falling back to the default; at the next cut DIST reads `deploy.mjs`'s `limits.subrequests` read-back line (or its UNDETERMINED line) and moves `15.subrequest-limit` to match. UNDETERMINED: whether `/settings` reports `limits` once set; if not, the read-back uses the script-versions API.
accepts-when: `newgroup`'s wizard suite (`newgroup/test/`) asserts both uploads send the release's `limits.subrequests`, and a release without it is refused by name; `status.mjs --check` 0 drift. NEGATIVE CONTROL: drop `limits` from `uploadUpdate`, and that arm fails by name.
added: 2026-09-23 · SCHEDULER #16 (D-54's worker's finding via CONDUCT #17, verified at the code; `node tools/mintid.mjs DIST`).

### M0-106 · blocked — **RE-NARROWED 2026-09-23 by SCHEDULER #15 on BOB #30's ruling (`TREE-SHARING.md` §3a condition 3, "What the cut's run is", landed at `4355bfda`): a cut may rely on a GREEN FULL record for its EXACT tree only when that record's run REUSED NOTHING (M0-126 marks such a record a backstop); the `--since` arm is WITHDRAWN.** So `kickoffs/DIST.md` gate step 1 (landed `4f7efed0`) is corrected, and the witness moves to the first cut from a tree holding a backstop record. 0.73.0 and 0.74.0 held none and ran the battery, as the ruling requires. — owner DIST (its own kickoff).
order: near the head, ahead of the product rows because it CUTS GATE TIME (Bob, 2026-09-22, `CLAUDE.md` §2), DIST's own act and never a worker slot (SCHEDULER #11 on BOB #25's word, 2026-09-22); re-narrowed by SCHEDULER #15
milestone: M0
interface: none
design: `docs/development/TREE-SHARING.md` §3a condition 3 (BOB #30, 2026-09-23), with `docs/development/VERIFICATION.md` (admitted for M0 by name).
depends-on: M0-126 (the backstop mark); then DIST's first cut from a tree carrying a backstop record.
scope: DIST.md step 1 reads: `gates.mjs --full --no-reuse` on the exact tree, or a record for which pushguard's `isBackstop()` (M0-126) is true, NAMED in the cut commit, else the whole battery; `--since` removed (M0-126's worker found step 1 still naming it, via CONDUCT #15); the bumped tree's own gate stays.
accepts-when: a cut from a tree with a backstop record runs no battery and names it; a record whose run printed any REUSED unit, or a `--since`, never satisfies a cut and the battery runs.
added: 2026-09-22 · SCHEDULER #11 (BOB #25's inbox entry, item 1; `node tools/mintid.mjs M0`); re-narrowed 2026-09-23 by SCHEDULER #15 (BOB #30's ruling).

### REC-158 · queued — **THE PROVENANCE PAIR'S BEARER WRITE IS STAMPED `token:<class>` — NOBODY'S NAME — ON WHAT §4.10 CALLS A NAMED MEMBER'S** … (whole text: the cut archive)
order: directly after REC-155, which it waits on (BOB #20's entry): this landing REFUSES a caller, so it follows the session route DRIVEN, keeping D-200's chain-absent population a route to repair (SCHEDULER #5, 2026-09-21)
milestone: M8
interface: I3 — MAJOR, breaking for bearer writers of the pair; the integrator mints the IC.
design: `docs/architecture/BIO_Membership_Architecture_v2.md` §4.10, the provenance pair's bullet, with D-421 … (whole text: the cut archive)
depends-on: REC-155 — DRIVEN, not merely landed.
accepts-when: a bearer `apply=1` and a bearer `provenanceroute` are refused by name; a session's succeed and the author written is the session's member, never `token:<class>`; a bearer … (whole text: the cut archive)
added: 2026-09-21 · SCHEDULER #5 (BOB #20's inbox entry, drained this commit; `node tools/mintid.mjs REC`).
cut: cut to its fields by SCHEDULER #13 (2026-09-22, the backlog's 150 KiB budget); the row as it stood before this cut is VERBATIM under «REC-158» in `docs/archive/ledgers/QUEUE-cut-2026-09-22.md`. A worker READS IT before building.

### UI-75 · queued — **THE ELICITATION READ-BACK NAMES NO SHARED ORIGIN: a member affirming *"fails only if ALL of these fail"* is not told that two** … (whole text: the cut archive)
order: 2 of 2, after REC-161; with UI-74, whichever lands second reuses the first's rendering (BOB #22, 2026-09-21)
milestone: M9
interface: I3 consumer (REC-161's IC).
design: `docs/development/INVESTIGATIVE-SESSION.md` §12 clause (c), with DEC-69: inform once, at the act.
depends-on: REC-161.
accepts-when: two correlated reasons show their origin and the member's answers are written unchanged. How a liar passes it: blocking or reordering the answers on a shared origin, which turns an informing fact into a gate.
added: 2026-09-21 · SCHEDULER #7 (BOB #22's inbox entry, drained this commit; `node tools/mintid.mjs UI`).
cut: cut to its fields by SCHEDULER #12 (2026-09-22, the backlog's 150 KiB budget); the row as it stood before this cut is VERBATIM under «UI-75» in `docs/archive/ledgers/QUEUE-cut-2026-09-22.md`. A worker READS IT before building.
note: 2026-09-23 by SCHEDULER #17 (CONDUCT #17's 22:00Z finding (1), verified at c17-batch5): REC-161's `partitionindependence` op exists on c17-batch5 and `app.html` calls it nowhere; `elicFalsifier` is a pure string builder. The same commit re-grades `8.partition-independence` to BUILT and drops its `none` probe. Suite `civicos-ui/test/elicitation.test.mjs`; NEGATIVE CONTROL: stub the fetch to return `shared:[]`, and the correlated-fixture arm fails by name.

### UI-78 · queued — **THE PUBLIC HEADER CANNOT SHOW A GROUP'S DISPLAY NAME OR VERIFIED DOMAIN, AND MEMBERS CANNOT SEE A DOMAIN CLAIM'S VERDICT.** … (whole text: the cut archive)
order: directly after REC-164, which it consumes (BOB #24: *"UI (M7), after 2"*) (SCHEDULER #9, 2026-09-21)
milestone: M7
interface: I3 consumer (REC-164's IC).
design: `docs/architecture/BIO_Publication_v0_1.md` §7 (a display name shown WITH the slug, never instead of it; a … (whole text: the cut archive)
depends-on: REC-164, UI-77.
accepts-when: against the real plane, a group with a display name shows it beside the slug; an unverified or mismatched domain never appears on the public header, and members see its verdict. How a liar … (whole text: the cut archive)
added: 2026-09-21 · SCHEDULER #9 (BOB #24's inbox entry, item 3, drained this commit; `node tools/mintid.mjs UI`).
cut: cut to its fields by SCHEDULER #11 (2026-09-22, the backlog's 150 KiB budget); the row as it stood before this cut is VERBATIM under «UI-78» in `docs/archive/ledgers/QUEUE-cut-2026-09-22.md`. A worker READS IT before building.

### MK-7 · queued — **THE ATTRIBUTION ACT, AND THEN THE LIFT OF MK-1's FENCE** (MK-3's replacement (ii), `MEMBER-KNOWLEDGE-DESIGN.md` §4.2–§4.6): an … (whole text: the cut archive)
order: after MK-6, which it rests on, and above MK-5, which rests on it; replaces MK-3 (superseded 2026-09-21). Two points are provisionals carried to Bob, cheap to change until built: §4.4's narrow veto and §4.6's `name` = handle (SCHEDULER #4, 2026-09-21)
milestone: M3 — the member's own knowledge enters the record as what it is
interface: I3 — the builder names the op and, if a design names it first, registers it in `op-claims.mjs`' `PLANNED_OPS`.
design: `docs/development/MEMBER-KNOWLEDGE-DESIGN.md` §4.2–§4.6 and §8's row for replacement (ii).
depends-on: MK-6; REC-126 (the review copy, built).
accepts-when: through the ops, each level round-trips into the published projection exactly as chosen; nothing is prefilled; an unchosen reached observation refuses ratification BY NAME; `name` without a … (whole text: the cut archive)
added: 2026-09-21 · SCHEDULER #4 (BOB #19's inbox entry, drained this commit; `node tools/mintid.mjs MK`).
cut: cut to its fields by SCHEDULER #11 (2026-09-22, the backlog's 150 KiB budget); the row as it stood before this cut is VERBATIM under «MK-7» in `docs/archive/ledgers/QUEUE-cut-2026-09-22.md`. A worker READS IT before building.

### MK-5 · queued — **AN OPINION IS NOT EVIDENCE — a case element with attribution, refused as a basis leg.** — owner RECORD; surfaces are Program B's … (whole text: the cut archive)
order: rests on MK-7's attribution act — re-pointed from MK-3, superseded 2026-09-21 (`MEMBER-KNOWLEDGE-DESIGN.md` §8) (SCHEDULER, first order audit, 2026-09-18; SCHEDULER #4, 2026-09-21)
milestone: M3 — the member's own knowledge enters the record as what it is
interface: I3
design: `docs/development/MEMBER-KNOWLEDGE-DESIGN.md` §6 (an opinion is not evidence)
depends-on: MK-7 (it carries MK-7's attribution; §8 names MK-3's replacement (ii))
accepts-when: an opinion lands as a case element with its attribution and is refused as a leg, by name, through the ops; battery green by its COMPLETION LINE.
added: 2026-09-18 · CONDUCT #4 (from BOB #14's inbox; MEMBER-KNOWLEDGE-DESIGN.md §8, build-order items 3 and 6.)
cut: cut to its fields by SCHEDULER #11 (2026-09-22, the backlog's 150 KiB budget); the row as it stood before this cut is VERBATIM under «MK-5» in `docs/archive/ledgers/QUEUE-cut-2026-09-22.md`. A worker READS IT before building.

### REC-147 · blocked — **CONTRADICTION'S IDENTIFY, 3 of 3: THE JUDGEMENT AND THE CANDIDATE TABLE — §5's five labels as labelled machine work through** … (whole text: the cut archive)
order: blocked on M0-71's measured gate (SCHEDULER, 2026-09-19)
milestone: M9
interface: I3 and I5 (a table; ICs minted with `node tools/mintid.mjs IC`)
design: `docs/development/CONTRADICTION-IDENTIFY-DESIGN.md` §5 (the judgement and its vocabulary), §8 (where a candidate lives) and §9 item 3.
depends-on: M0-71, AND its measured gate met — a threshold missed is the finding, and this row then goes back to BOB.
accepts-when: M0-71's gate passes on the built judgement; a re-run over unchanged referents writes nothing new; every row names both referents and versions, the key, the run, the label and … (whole text: the cut archive)
added: 2026-09-19 · SCHEDULER (same entry, item 3).
cut: cut to its fields by SCHEDULER #10 (2026-09-21, the backlog's 150 KiB budget); the row as it stood before this cut is VERBATIM under «REC-147» in `docs/archive/ledgers/QUEUE-cut-2026-09-21.md`. A worker READS IT before building.
note: 2026-09-23 by SCHEDULER #17 (M0-71's worker, via CONDUCT #18): the contradiction gate cannot see a detector that ABSTAINS (recall 2/9 sits beside it); this row stays blocked until its machine judgement is measured on this gate WITH its recall reported. The measurement is M-118 (M-117 was burned by a collision).

### UI-69 · queued — **EXPORT OF A REVIEW COPY carrying the quartet in-band on every page, with §6A.3 point 2 said AT the act: what leaves cannot be revoked; the grant can.** — owner UI.
order: after UI-68 and REC-148: export only once the quartet travels with it (SCHEDULER, 2026-09-19)
milestone: M10
interface: I3 consumer (REC-148's IC)
design: `docs/architecture/BIO_Publication_v0_1.md` §6A.3 point 2.
depends-on: UI-68 and REC-148.
accepts-when: an exported copy carries the quartet on every page byte-equal to the plane's; the statement renders at the act and nowhere else. NEGATIVE CONTROL: drop the quartet from one … (whole text: the cut archive)
added: 2026-09-19 · SCHEDULER (same entry, item 8).
cut: cut to its fields by SCHEDULER #10 (2026-09-21, the backlog's 150 KiB budget); the row as it stood before this cut is VERBATIM under «UI-69» in `docs/archive/ledgers/QUEUE-cut-2026-09-21.md`. A worker READS IT before building.

### D-147 · queued — **A RECORDS REQUEST IS ONE ROUND TRIP: `awaiting_response` HIDES THE FEE ESTIMATE, THE WAIVER DECISION, A PARTIAL PRODUCTION AND** … (whole text: the cut archive)
order: directly after D-149, on D-148's entry grammar, which it extends (BOB #27: *"depends-on D-148"*), the M10 action path (SCHEDULER #14, 2026-09-22; BOB #27's inbox entry, item 2)
milestone: M10
interface: I3 and I5 — correspondence entry kinds, a closed outcome vocabulary and a stated due date; the … (whole text: the cut archive)
design: `docs/architecture/BIO_Case_Making_v0_1.md` §2, *THE RECORDS-REQUEST LIFECYCLE* (BOB #27, 2026-09-22), bound by D-149.
depends-on: D-148 (the entry grammar it extends); D-149 (a stated due date names one of the action's citations).
accepts-when: a request, a fee estimate, a waiver decision, a partial production and an appeal read back as one dated chain; an entry with no stated due date reads UNDETERMINED; a stated … (whole text: the cut archive)
added: 2026-09-22 · SCHEDULER #14 (BOB #27's inbox entry, item 2, drained this commit; D-147's DEBT row of 2026-08-01; keeps its `D-` id).
cut: cut to its fields by SCHEDULER #14 (2026-09-22, the backlog's 150 KiB budget); the row as it stood before this cut is VERBATIM under «D-147» in `docs/archive/ledgers/QUEUE-cut-2026-09-22.md`. A worker READS IT before building.

### REC-196 · queued — **A READ NAMING A DISCOVERABLE PROJECT'S OWN ID ANSWERS "DOES NOT EXIST" TO A MEMBER THE DIRECTORY HAS JUST SHOWN IT TO.** BOB #32's ruling of 2026-09-23 23:08Z (cite until folded): *POSITIONAL WINS for the PROJECT ITSELF: an uninvited member session naming a discoverable project's own id gets the positional refusal (not a participant; id and name only); anything INSIDE the project answers exactly as today; `viewerPredicate` unchanged.* — owner RECORD.
order: before REC-150, the §7.14 sequence (SCHEDULER #17, 2026-09-23; REC-149's worker)
milestone: M8
interface: I3 — the project-id read's refusal; the integrator mints and classifies the IC.
design: `docs/architecture/BIO_Membership_Architecture_v2.md` §7 (item 7.14), with BOB #32's ruling of 2026-09-23 23:08Z (cite until folded).
depends-on: REC-149.
scope: the project-itself read gives a discoverable project's positional refusal; contents keep the existence answer. Extend `bio-plane/test/project-sight.test.mjs`.
accepts-when: a discoverable project's id reads the positional refusal naming id and name; a bundle inside it still reads as absent. NEGATIVE CONTROL: answer "does not exist" for the project itself, and that arm fails by name.
added: 2026-09-23 · SCHEDULER #17 (`node tools/mintid.mjs REC`).

### REC-197 · queued — **CREATE AND FORK DO NOT CARRY THE DISCOVERABLE SETTING, AND A MACHINE CREDENTIAL'S OWNERLESS PROJECT HAS NO RULE.** BOB #32's ruling of 2026-09-23 23:08Z (cite until folded): *create and fork take one optional `visibility` (`discoverable` or `hidden`), absent means HIDDEN; a MACHINE credential never sets it (an ownerless project has no owner to choose): its creation is HIDDEN and `visibility=discoverable` from one is refused by name.* — owner RECORD.
order: directly after REC-196 (SCHEDULER #17, 2026-09-23)
milestone: M8
interface: I3 additive — the `visibility` field and one refusal; the integrator mints and classifies the IC.
design: `docs/architecture/BIO_Membership_Architecture_v2.md` §7 (item 7.14), with BOB #32's ruling of 2026-09-23 23:08Z (cite until folded).
depends-on: REC-149.
scope: the field on both acts, the fail-closed default, the machine refusal. Extend `bio-plane/test/project-sight.test.mjs`.
accepts-when: an absent field creates HIDDEN; a machine's `discoverable` is refused by name. NEGATIVE CONTROL: default to discoverable, and the fail-closed arm fails by name.
added: 2026-09-23 · SCHEDULER #17 (`node tools/mintid.mjs REC`).

### REC-150 · queued — **DISCOVERABLE OR HIDDEN, 2 of 4: THE REQUEST TO JOIN — ask (one open per member per project, optional comment), withdraw** … (whole text: the cut archive)
order: after REC-149, whose EXISTENCE level it needs (SCHEDULER, 2026-09-19)
milestone: M8
interface: I3 (an IC minted with `node tools/mintid.mjs IC`)
design: `docs/architecture/BIO_Membership_Architecture_v2.md` §7 item 7.14 and §7.4 (a grant is an invitation … (whole text: the cut archive)
depends-on: REC-149.
accepts-when: a grant leaves the requester `invited` and NOT `joined`; a lapsed requester reads their own request and nothing else about the project; an administrator's grant is refused. … (whole text: the cut archive)
added: 2026-09-19 · SCHEDULER (same entry, item 2).
cut: cut to its fields by SCHEDULER #10 (2026-09-21, the backlog's 150 KiB budget); the row as it stood before this cut is VERBATIM under «REC-150» in `docs/archive/ledgers/QUEUE-cut-2026-09-21.md`. A worker READS IT before building.

### UI-70 · queued — **DISCOVERABLE OR HIDDEN, 3 of 4: the create and fork forms ASK, with neither preselected, and cannot submit without the choice** … (whole text: the cut archive)
order: after REC-149, and after UI-66 on the same forms (SCHEDULER, 2026-09-19)
milestone: M8
interface: I3 consumer (REC-149's IC)
design: `docs/architecture/BIO_Membership_Architecture_v2.md` §7 item 7.14, with DEC-69 (forced, at the act).
depends-on: REC-149; and the create and fork forms as UI-66 leaves them (same forms — one worker at a time).
accepts-when: the harness cannot submit a create or fork without the choice, and nothing is preselected; the owner changes the setting and a non-owner sees it read-only. How a liar passes … (whole text: the cut archive)
added: 2026-09-19 · SCHEDULER (same entry, item 3).
cut: cut to its fields by SCHEDULER #10 (2026-09-21, the backlog's 150 KiB budget); the row as it stood before this cut is VERBATIM under «UI-70» in `docs/archive/ledgers/QUEUE-cut-2026-09-21.md`. A worker READS IT before building.

### UI-71 · queued — **DISCOVERABLE OR HIDDEN, 4 of 4: the directory; the request button and comment; the owner's queue of open requests with grant** … (whole text: the cut archive)
order: after REC-149 and REC-150 (SCHEDULER, 2026-09-19)
milestone: M8
interface: I3 consumer (REC-149's and REC-150's ICs)
design: `docs/architecture/BIO_Membership_Architecture_v2.md` §7 item 7.14.
depends-on: REC-149 and REC-150.
accepts-when: the harness requests, the owner grants, the requester sees `invited` and joins by the checkbox, all against the real plane; a hidden project never appears in the directory. … (whole text: the cut archive)
added: 2026-09-19 · SCHEDULER (same entry, item 4).
cut: cut to its fields by SCHEDULER #10 (2026-09-21, the backlog's 150 KiB budget); the row as it stood before this cut is VERBATIM under «UI-71» in `docs/archive/ledgers/QUEUE-cut-2026-09-21.md`. A worker READS IT before building.

### D-134 · queued — **NO SURFACE PERFORMS §4.9's CUSTODIAL ACTS: `memberadd`, `memberset`, `signeradd` and `signerset` have ZERO call sites in** … (whole text: the cut archive)
order: with the M8 features after D-126, a surface over built ops; BOB #17 ordered it behind D-136's fence (*"a member surface over an act whose voter the caller can name is a SECOND path to a forgeable vote"*), which is built, and BOB #18 discharged BOB's half; it rests on REC-159's session reach (SCHEDULER #13, 2026-09-22, LED-7 batch S13-1)
milestone: M8
interface: I3 consumer (the four ops, reachable from an enrolled administrator's session once REC-159 lands).
design: `docs/architecture/BIO_Membership_Architecture_v2.md` §4.9 (each custodial act is EVERY … (whole text: the cut archive)
depends-on: REC-159 (the four ops reach an enrolled administrator's session).
accepts-when: against the real plane, the founder's and an enrolled administrator's sessions each perform all four, attributed to them; a member's session renders none of the four. How a … (whole text: the cut archive)
added: 2026-09-22 · SCHEDULER #13 (LED-7 batch S13-1; D-134's DEBT row of 2026-08-01, BOB #17's order and BOB #18's discharge; keeps its `D-` id).
cut: cut to its fields by SCHEDULER #13 (2026-09-22, the backlog's 150 KiB budget); the row as it stood before this cut is VERBATIM under «D-134» in `docs/archive/ledgers/QUEUE-cut-2026-09-22.md`. A worker READS IT before building.

### UI-76 · queued — **NO SURFACE LETS A MEMBER DECLARE, TEST OR PLACE A THEME, OR SHOWS WHOSE LENS A THEME IS.** D-162's surface half, item 2 of BOB #23's entry. — owner UI.
order: directly after D-162, which it consumes (BOB #23: *"UI (M8), after 1"*) (SCHEDULER #9, 2026-09-21)
milestone: M8
interface: I3 consumer (D-162's IC).
design: `docs/architecture/BIO_Content_Framework_v0_10.md` §8.4, fences 1–3 (the cover on every reading; the … (whole text: the cut archive)
depends-on: D-162.
accepts-when: the harness declares, tests and places against the real plane, the cover shown on every theme it renders; a proposal renders as a hunch, never as membership. How a liar passes … (whole text: the cut archive)
added: 2026-09-21 · SCHEDULER #9 (BOB #23's inbox entry, item 2, drained this commit; `node tools/mintid.mjs UI`).
cut: cut to its fields by SCHEDULER #9 (2026-09-21, the backlog's 150 KiB budget); the row as it stood before this cut is VERBATIM under «UI-76» in `docs/archive/ledgers/QUEUE-cut-2026-09-21.md`. A worker READS IT before building.

### D-235 · queued — **`op=basisversions` DOES NOT PUBLISH A VERSION'S `kind`: `basisVersions` selects every column of `inquiry_basis_versions`, `kind` among them, and the answer carries no `kind` key, so the same version reads a kind from `op=suggest` and none from here.** — owner RECORD.
order: after D-241 (SCHEDULER #17, 2026-09-23, LED-7 S17-2)
milestone: M3
interface: I3 additive — one field; the integrator mints and classifies the IC.
design: `docs/development/INVESTIGATIVE-SESSION.md` §9 (what a SUGGESTION is).
depends-on: none.
scope: `kind` in each version of the answer. Extend `bio-plane/test/suggest.test.mjs`'s cross-op arm. The row's other half (the sweep's reach) is stated in `rec75-sweep.mjs`'s header and is not rowed.
accepts-when: a version with a kind reads the same kind from both ops. NEGATIVE CONTROL: drop the key, and the cross-op arm fails on `kind`.
added: 2026-09-23 · SCHEDULER #17 (LED-7 S17-2; keeps its `D-` id).

### D-191 · queued — **A CAPTURE ASSEMBLED FROM REUSED PARTS DOES NOT STATE ITS TEMPORAL SPREAD: `subresources.mjs` records each part's `reused_from_fetched_at`, and nothing computes the earliest and latest fetch instants of the composite.** — owner CAPTURE.
order: after D-235, with the product rows before the M0 group: the record holds the instants and does not say what they add up to (SCHEDULER #17, 2026-09-23, LED-7 S17-2; verified at the code on `02603e88`)
milestone: M2
interface: I5 additive — the manifest's spread; the integrator mints and classifies the IC.
design: `docs/development/CAPTURE-SCALING.md` §"Checking that a reused asset is still the same" and §"Re-fetch at ratification is mandatory".
depends-on: CAP-14 (`reused_from`, `integrated` on c17-batch5).
scope: the capture manifest (or its reading) states the earliest and latest part-fetch instants of a composite. Extend `bio-plane/test/subresources.test.mjs`.
accepts-when: a composite whose parts were fetched at two instants states both. NEGATIVE CONTROL: drop the spread, and the two-instant arm fails by name.
added: 2026-09-23 · SCHEDULER #17 (LED-7 S17-2; keeps its `D-` id).

### D-320 · queued — **THE PASS-THROUGH JPEG ROUTE CANNOT BE TRANSCRIBED IN-ISOLATE: `ocr-worker`'s `transcribe.mjs` refuses every non-PNG route (PIXELS_UNREADABLE), so 17 of CPDF-12's 24 image-only pages (DCT) go untranscribed; 8-bit rotation is not built either (`pagepixels.mjs`).** — owner CONTENT-PDF.
order: with the M2 extraction rows, after D-191: the route with the strongest provenance reads nothing (SCHEDULER #17, 2026-09-23, LED-7 S17-3; verified at the code on `02603e88`)
milestone: M2
interface: I6 — the member's pixel route; the integrator mints and classifies the IC.
design: `docs/development/EXTRACTION-BREADTH-DESIGN.md` §6 (which gains the gap's statement).
depends-on: none — CPDF-12's census answered the share.
scope: a baseline DCT decoder in the member, checked against Pillow digests as `pagepixels.test.mjs` does; after decoding apply `/Rotate` (3 of the 24 are /Rotate 270; from D-244); 8-bit rotation. Extend `pdf-worker/test/pagepixels.test.mjs` and `ocr-member-e2e.test.mjs`.
accepts-when: a DCT image-only page transcribes, rotated, and its pixel hash matches Pillow's. NEGATIVE CONTROL: a no-op decoder fails on the digest by name.
added: 2026-09-23 · SCHEDULER #17 (LED-7 S17-3; keeps its `D-` id).

### D-312 · queued — **`memoryUsageBytes` IS NOT A FRACTION OF THE 128 MB ISOLATE, AND LIVE SITES STILL SAY "of 128 MB": `agent-worker/src/index.mjs` (the shipped `BOUND_SOURCE`, and the segment bound sized on that reading), `fl1-cpu-probe.mjs`, `INTERFACES.md` §"The segment bound…", `pagepixels.mjs`.** The rule is stated in `INTERFACES.md` §"The memory bound, and how it is expressed". — owner FLEET, CONTENT-PDF.
order: after D-320, the M2 measurement corrections: a shipped bound rests on the misreading (SCHEDULER #17, 2026-09-23, LED-7 S17-3; verified at the code on `02603e88`)
milestone: M0 (measurement wording, and one shipped bound)
interface: none — wording, and a re-check of one bound.
design: `docs/development/VERIFICATION.md` (measure; do not recall), for the rule stated in `docs/development/INTERFACES.md` §"The memory bound, and how it is expressed".
depends-on: none.
scope: correct each live site; re-check the agent-worker segment bound against the rule and state the result.
accepts-when: no live site divides by 128 or says "of 128"; the bound's re-check is recorded. NEGATIVE CONTROL: a grep arm over the live sites fails by name on a planted "of 128 MB".
added: 2026-09-23 · SCHEDULER #17 (LED-7 S17-3; keeps its `D-` id).

### D-321 · queued — **NO REAL IMAGE-ONLY PAGE IN THE CORPUS CARRIES AGENDA-SHAPED TEXT, SO THE `reading_refs` JOIN OVER REAL OCR IS PROVED ONLY ON SYNTHETIC INK (`ocr-member-e2e.test.mjs`).** — owner CONTENT-PDF.
order: after D-320; the page must come from bytes already held (the cloud proxy refuses Legistar) (SCHEDULER #17, 2026-09-23, LED-7 S17-3; verified at the code on `02603e88`)
milestone: M2
interface: none — a fixture and an arm.
design: `docs/architecture/BIO_Content_Framework_v0_10.md` Part II §16.
depends-on: none — the page comes from bytes already held; D-313 (the image-only corpus) is a stated limitation.
scope: commit one real scanned-agenda page image to the OCR fixtures; drive the join over it.
accepts-when: a real page's OCR yields a `reading_refs` hit. NEGATIVE CONTROL: switch the recogniser off, and the join reads empty by name.
added: 2026-09-23 · SCHEDULER #17 (LED-7 S17-3; keeps its `D-` id).

### D-346 · queued — **THE THREE OPENDOCUMENT ENTRIES EMIT NO `core-properties` AND NO `intra` LINK: `odf.mjs` never reads `meta.xml` or the manifest and says so with `outside_content_xml_not_read` markers, while Content Framework §16 says the formats "preserve the same evidence".** — owner COFF.
order: after D-320 (SCHEDULER #17, 2026-09-23, LED-7 S17-3; verified at the code on `02603e88`)
milestone: M2
interface: I2 — the ODF part-map gains two item kinds; the integrator mints and classifies the IC.
design: `docs/development/OFFICE-FORMATS.md` §"What each part-map offers, and where it maps onto I2".
depends-on: none.
scope: read `meta.xml` into `core-properties`; walk the manifest for sha256 `intra` links; remove both markers. Extend `bio-plane/test/formats-odf.test.mjs`.
accepts-when: a planted creator appears as a `core-properties` item; a package without `meta.xml` still states the absence. NEGATIVE CONTROL: skip the `meta.xml` read, and the planted-creator arm fails by name.
added: 2026-09-23 · SCHEDULER #17 (LED-7 S17-3; keeps its `D-` id).

### D-375 · queued — **`OBSERVATION-LOG-DESIGN.md` §4.2's FOURTH OUTCOME HAS NO PRODUCER: the persisted reading carries no character count, so `contentObservationsFor` cannot write LOOKED_ABSENT for a scan read to nothing, and it reads PRESENT.** `counts.chars` exists at acquire and is dropped. — owner CAPTURE, then RECORD.
order: after D-346: a read that claims more than it holds, CLAUDE.md §2's worst class (SCHEDULER #17, 2026-09-23, LED-7 S17-3; verified at the code on `02603e88`)
milestone: M3
interface: I5 additive — the reading's count; the integrator mints and classifies the IC.
design: `docs/development/OBSERVATION-LOG-DESIGN.md` §4.2.
depends-on: none.
scope: persist `counts.chars` on the reading at `op=acquire`; add the LOOKED_ABSENT branch in `contentObservationsFor`. Extend `bio-plane/test/observation-content.test.mjs` beside B8.
accepts-when: a scan read to zero characters writes LOOKED_ABSENT. NEGATIVE CONTROL: drop the count, and that arm reads PRESENT and fails by name.
added: 2026-09-23 · SCHEDULER #17 (LED-7 S17-3; keeps its `D-` id).

### D-374 · queued — **A `pdf-page` EXTENT'S `rect` IS BOUNDED BY NOTHING: `checkContentExtent` asks only for four finite numbers, while `pagepixels.mjs` already computes each page's MediaBox and the plane never receives it.** — owner CONTENT-PDF, CAPTURE, RECORD.
order: after D-375: content minted on a region the page does not have (SCHEDULER #17, 2026-09-23, LED-7 S17-3; verified at the code on `02603e88`)
milestone: M4
interface: I5/I6 — per-page `{w,h}` on the reading (nullable); the integrator mints and classifies the IC.
design: `docs/development/CONTENT-EXTENT-DESIGN-SPACE.md` §6 (which gains the bound).
depends-on: none.
scope: carry per-page dimensions onto the reading; the extent check refuses a rect outside the MediaBox by name (the stricter mechanism; clip-and-state is the architect's alternative if preferred). Extend the extent suite.
accepts-when: `[0,0,999999,999999]` is refused by name; a rect inside mints. NEGATIVE CONTROL: drop the bound, and the oversize arm mints and fails by name.
added: 2026-09-23 · SCHEDULER #17 (LED-7 S17-3; keeps its `D-` id).

### D-415 · queued — **A WORKBOOK'S `sheet-range` UNITS ARE WHOLE SHEETS ONLY: `formats-xlsx.mjs` turns `definedNames` into anchor links and emits one `usedSheetRange` per sheet; table parts and ODF named ranges are not read.** — owner COFF.
order: after D-374 (SCHEDULER #17, 2026-09-23, LED-7 S17-3; verified at the code on `02603e88`)
milestone: M4
interface: I2 — finer sheet-range units; the integrator mints and classifies the IC.
design: `docs/development/EXTRACTION-BREADTH-DESIGN.md` §3.3 item 1.
depends-on: none.
scope: a defined name and a table part each emit a `sheet-range` unit; a multi-area name is skipped with a stated reason. Extend `bio-plane/test/fw19-extent-arms.test.mjs`.
accepts-when: a fixture's defined name emits its unit. NEGATIVE CONTROL: before the fix the defined-name arm emits none and fails by name.
added: 2026-09-23 · SCHEDULER #17 (LED-7 S17-3; keeps its `D-` id).

### D-416 · queued — **A READING POSITION CANNOT FALL INSIDE A `sheet-range` EXTENT: `readingPositionInExtent` (`textchain.mjs`) returns false whenever the reading's arm and the extent's differ, so a cell reading never earns the connection its range should.** The image-rect and `doc-table` halves wait on readings that carry rects and paragraph spans (D-352). — owner FRAMEWORK.
order: after D-415, which emits the units it reads (SCHEDULER #17, 2026-09-23, LED-7 S17-3; verified at the code on `02603e88`)
milestone: M4
interface: none — the containment predicate.
design: `docs/development/EXTRACTION-BREADTH-DESIGN.md` §3.2.
depends-on: D-415.
scope: the `sheet-range` half: a cell reading inside a range is contained. Extend the textchain suite.
accepts-when: a cell reading inside a sheet-range earns a connection. NEGATIVE CONTROL: restore the arm-mismatch false, and that arm fails by name.
added: 2026-09-23 · SCHEDULER #17 (LED-7 S17-3; keeps its `D-` id).

### D-419 · queued — **THE CROP OF A CITED PDF IMAGE EXISTS AND NOTHING CAN ASK FOR IT: `cropImage` lives only in `pdf-worker/src/imagecrop.mjs`, with no route and no plane op.** — owner CONTENT-PDF, then RECORD; a UI item renders it.
order: after D-416; display only, behind every over-claim (SCHEDULER #17, 2026-09-23, LED-7 S17-3; verified at the code on `02603e88`)
milestone: M4
interface: I6 — a `POST /crop` route; I3 — a read-only op; the integrator mints and classifies the ICs.
design: `docs/development/EXTRACTION-BREADTH-DESIGN.md` §3.4.
depends-on: none.
scope: the member route and a read-only plane op returning the crop for a cited image extent. Extend `pdf-worker/test/` and a plane suite.
accepts-when: a cited image extent returns its crop through the op. NEGATIVE CONTROL: route to the whole page, and the crop-dimensions arm fails by name.
added: 2026-09-23 · SCHEDULER #17 (LED-7 S17-3; keeps its `D-` id).

### D-340 · queued — **CHROME IS A PROPERTY OF THE SITE AND THE PLANE RECORDS IT NOWHERE: `site_chrome` exists only in `LINK-FIDELITY.md`, which RATIFIES it as a derived table regenerable by scan; no table and no per-host navigation-change read are built.** — owner CAPTURE, then RECORD.
order: after D-419, with the M4 extraction rows (SCHEDULER #17, 2026-09-23, LED-7 S17-3; verified at the code on `02603e88`)
milestone: M4
interface: I5 — a derived table (in `purge`); I3 — a per-host read; the integrator mints and classifies the ICs.
design: `docs/development/LINK-FIDELITY.md` §"Chrome: rendering and connection are different problems".
depends-on: none.
scope: derive `site_chrome` per host by scan, add it to `purge`, and a read naming links a host's navigation lost between captures.
accepts-when: two captures of one host whose nav lost a link make the read name that link. NEGATIVE CONTROL: derive per page instead of per host, and the arm fails by name.
added: 2026-09-23 · SCHEDULER #17 (LED-7 S17-3; keeps its `D-` id).

### D-177 · queued — **THE CAPTURE GRADE BELOW THE CEILING IS STILL AUTHORED: `store.mjs` says *"there is no per-document capture grade anywhere in this schema"*; `#legEarnedCapture` applies REC-88/105's CEILING, not a measured value, so a member-authored grade under it stands unmeasured.** — owner CAPTURE, then RECORD.
order: after D-191 (SCHEDULER #17, 2026-09-23, LED-7 S17-2; verified at the code on `02603e88`)
milestone: M9
interface: I3/I5 — a derived per-capture grade read by the strength walk; the integrator mints and classifies the ICs.
design: `docs/architecture/BIO_Content_Framework_v0_10.md` Part I (the chain rules), with DEC-4 and DEC-75 (*capture grade is about the fetch path*).
depends-on: none — the ceiling (REC-88, REC-105) is built.
scope: derive a per-capture grade from `captured_locators.via` plus authority state, read it in `#strengthWalk`. The letter for a non-direct `via` is UNDETERMINED by any ruling found; if none covers it, that part goes to BOB (REC-50's precedent) and the row builds the direct case first.
accepts-when: a member-authored C on a direct capture reads the earned grade, not the authored one. NEGATIVE CONTROL: read the authored grade again, and that arm fails by name. Extend the strength suite.
added: 2026-09-23 · SCHEDULER #17 (LED-7 S17-2; keeps its `D-` id).

### D-194 · queued — **A MEMBER'S LEAD HAS A PLANE AND NO SURFACE: `op=lead`, `leadlook`, `leadread` and `leadshare`, the `leads` table and the internet frontier's read of them are built (`status.mjs` 10.lead), and `app.html` makes no lead call.** — owner UI.
order: after D-177, a member surface on a built plane (SCHEDULER #17, 2026-09-23, LED-7 S17-2; verified at the code on `02603e88`)
milestone: M4
interface: I3 consumer.
design: `docs/development/MEMBER-KNOWLEDGE-DESIGN.md` §5 (the lead's surface).
depends-on: none — the plane half is built.
scope: a member writes a lead, records a look, and sees the frontier's LOOKED_ABSENT against it; the lead is shared only by the member's act. New harness in `civicos-ui/test/`.
accepts-when: a member writes a lead, records a look, and sees LOOKED_ABSENT against it. NEGATIVE CONTROL: stub `op=lead`, and the write-and-look arm fails by name.
added: 2026-09-23 · SCHEDULER #17 (LED-7 S17-2; the plane half closed; keeps its `D-` id).

### D-189 · queued — **NO SURFACE CAN SAY A PROJECT CARRIES ITS OWN BIAS: `op=biasmanifest` computes the effective set with project nullifications, `7.ui` is ABSENT, and `app.html` still says *"DECLARED BIAS is the HUNCH legs and nothing else"*.** — owner UI.
order: after D-194 (SCHEDULER #17, 2026-09-23, LED-7 S17-2; verified at the code on `02603e88`)
milestone: M8
interface: I3 consumer.
design: `docs/architecture/BIO_Declared_Bias_v0_1.md` §"Bias bundles and adoption" (DEC-46).
depends-on: none — the manifest read is built.
scope: the project and publication surfaces read the manifest at project scope and state that the project carries its own bias; the hunch-only sentence is corrected. New harness in `civicos-ui/test/`.
accepts-when: a project with an adopted set shows it; an empty manifest shows no indicator. NEGATIVE CONTROL: render the indicator on an empty manifest, and that arm fails by name.
added: 2026-09-23 · SCHEDULER #17 (LED-7 S17-2; keeps its `D-` id).

### REC-201 · queued — **A RECORDS REQUEST CAN ONLY BE A CALIFORNIA ONE: the action kind is `cpra_request`, and sovereign groups sit outside California.** BOB #32's ruling of 2026-09-23 23:08Z (cite until folded): *DESIGN DIRECTION ADOPTED — a law-neutral `records_request` kind carrying a `law` field; `cpra_request` stays readable as written.* — owner RECORD.
order: behind the current M9/M10 product rows, as ruled (SCHEDULER #17, 2026-09-23; D-149's builder)
milestone: M10
interface: I3/I5 — a new action kind; the integrator mints the IC.
design: `docs/architecture/BIO_Case_Making_v0_1.md` §2 (*A RECORDS REQUEST NAMES EVERY LAW THAT GOVERNS IT*), with BOB #32's ruling of 2026-09-23 23:08Z (cite until folded).
depends-on: D-149 (`integrated` on c17-batch7).
scope: the `records_request` kind with its `law` field alongside D-149's governing-laws list; existing `cpra_request` actions read unchanged. Extend D-149's suite.
accepts-when: a `records_request` under a non-California law files and reads its law; an old `cpra_request` reads byte-identically. NEGATIVE CONTROL: rewrite `cpra_request` on read, and the unchanged arm fails by name.
added: 2026-09-23 · SCHEDULER #17 (`node tools/mintid.mjs REC`).

### REC-202 · queued — **A MEMBER CANNOT TAKE UP OR SET ASIDE AT THE INQUIRY'S GRAIN: the code declares an `options_grain` gap (offered at document grain, missing at inquiry grain) in `store.mjs`'s findings producers, and no row carried it.** BOB #32's ruling of 2026-09-23 23:08Z (cite until folded): *row it — a missing member door.* — owner RECORD if an op is missing, UI otherwise; check at the code at spawn.
order: behind the current M9/M10 product rows, before the M0 group (SCHEDULER #17, 2026-09-23; D-213's residue)
milestone: M9
interface: I3 — possibly an act; the integrator mints and classifies the IC.
design: `docs/development/INVESTIGATIVE-SESSION.md` §8 (the inquiry's QUESTION is a first-class object), with BOB #32's ruling of 2026-09-23 23:08Z (cite until folded).
depends-on: none — PL-15's out-of-inquiry lead is built.
scope: offer "take this up" and "set aside" at the inquiry grain wherever the code declares the gap; close the declared `options_grain` entries.
accepts-when: a member takes up and sets aside a finding at the inquiry grain, and no declared `options_grain` gap remains. NEGATIVE CONTROL: withhold the inquiry-grain option, and that arm fails by name.
added: 2026-09-23 · SCHEDULER #17 (`node tools/mintid.mjs REC`).

### M0-139 · queued — **TWO ARMS OF `current.control.mjs` CANNOT FAIL: arm 8 refuses to arm (its anchor occurs twice in `store.mjs` since REC-124 added `#findingsConcludedElsewhere` with `#findingsStanceDiverged`'s guard), and arm 7's must-fail name survives in `current.test.mjs` only as a comment, and no suite asserts `no_project_scope`.** Predates D-125 (read on 91bcea6b, main and c17-batch4). — owner M0.
order: first of the M0 rows, ahead of process tooling: a negative control that cannot fail is a product suite (the queue's findings) left unverified, not a gate-time tool (SCHEDULER #17, 2026-09-23, CONDUCT #17's 21:43Z finding (3), verified by string count)
milestone: M0
interface: none — a control and one assertion.
design: `docs/development/VERIFICATION.md` (the negative control and its `NEGATIVE CONTROL:` line; CLAUDE.md §5's *"Run the negative control"*).
depends-on: none.
scope: split arm 8 into 8a and 8b, each anchored on its producer's signature line plus the guard; add a `current.test.mjs` assertion driving a finding filed under no project to `available:false, reason:"no_project_scope"` and point arm 7's must-fail at it.
accepts-when: `node bio-plane/test/current.control.mjs` reports every arm run and 0 NOT as declared; 8a and 8b each fail "PURGE THE SHARED QUESTION AND BOTH ITEMS GO QUIET", arm 7 fails the new no-scope assertion by name. NEGATIVE CONTROL: the control's own arms, each recorded on the suite's `NEGATIVE CONTROL:` line.
added: 2026-09-23 · SCHEDULER #17 (CONDUCT #17's finding; `node tools/mintid.mjs M0`).

### D-446 · queued — **`nc-m040.mjs` ARM 1 DECLARES FIVE FAILURES AND MEASURES ONE (derivation-bounds 71/1 on `main`), AND FIVE SUITES NAME INFORMATION FIXTURES `INF-…` WHERE `OBJECT_TYPES` HAS `INFO`.** The fixtures: `frontier-chunk` (D-390's), `d389-fullfetch`, `observation-content`, `observation-log`, `cap14-reused-from`. — owner M0.
order: after M0-139, among the control-hygiene rows; after c17-batch7 lands (SCHEDULER #17, 2026-09-23; via CONDUCT #18 22:27Z (4), measured by SCHEDULER #17's verifier)
milestone: M0
interface: none
design: `docs/development/VERIFICATION.md` (a control declares what it measures; correct superseded tests, never exempt them).
depends-on: D-443 (`integrated`; its branch moved ARM 1's anchor).
scope: rewrite ARM 1's declaration to the measured outcome with a comment saying why the old one was wrong; rename every `INF-` fixture id to `INFO-`.
accepts-when: `node bio-plane/test/nc-m040.mjs` reports every arm as declared, and no suite names an `INF-` id. NEGATIVE CONTROL: restore the five-failure declaration, and ARM 1 reads NOT as declared by name.
added: 2026-09-23 · SCHEDULER #17 (`node tools/mintid.mjs D`).

### D-449 · queued — **`project-sight.control.mjs`'s `promote-stamp-dropped` ARM CANNOT RUN: it throws SURFACE_NO_RUN (0/1), identically on `main` `02603e88`, because since REC-171 removing the stamp also breaks the harness's surfacing-run creation.** — owner M0.
order: after D-446, among the control-hygiene rows (SCHEDULER #17, 2026-09-23; REC-149's and UI-68's workers via CONDUCT #18 22:47Z)
milestone: M0
interface: none
design: `docs/development/VERIFICATION.md` (break only the thing: a control that moves a second variable refutes nothing).
depends-on: none.
scope: narrow the arm's patch to revisions, keeping the stamp when the base is null.
accepts-when: the arm runs and fails as declared. NEGATIVE CONTROL: the arm itself, recorded on the suite's `NEGATIVE CONTROL:` line.
added: 2026-09-23 · SCHEDULER #17 (`node tools/mintid.mjs D`).

### D-369 · queued — **FIVE IN-MEMORY `truncated` SHAPES ARE NEVER DRIVEN PAST THEIR CEILING: only `op=connect` has a live over-the-ceiling arm in `derivation-bounds.test.mjs`; `queueFeed`, `biasInhale`, `documentsNamingEntity` and `#backfillLegContent` are pinned by roster alone (now 10 names).** — owner RECORD.
order: with the M0 control rows: a verification instrument (SCHEDULER #17, 2026-09-23, LED-7 S17-3; verified at the code on `02603e88`)
milestone: M0
interface: none
design: `docs/development/VERIFICATION.md` (test through the op), with `INVESTIGATIVE-SESSION.md` §14c.
depends-on: none.
scope: a live driven arm per shape. In `bio-plane/test/derivation-bounds.test.mjs`.
accepts-when: each shape is driven past its ceiling and states `truncated`. NEGATIVE CONTROL: drop a paging LIMIT in `queueFeed`, and its live arm fails by name.
added: 2026-09-23 · SCHEDULER #17 (LED-7 S17-3; keeps its `D-` id).

### D-441 · queued — **`tools/decided.mjs` CANNOT SEE A RULING WHOSE MARKER OPENS A LINE IN TITLE CASE: `MARKER` is uppercase only, so `decided.mjs "severance"` misses Case Making's ruling and two Bob rulings read "No RULING".** — owner M0.
order: with the M0 instrument rows; M0-97, M0-99 and D-341, which it waited on, are done (SCHEDULER #17, 2026-09-23, LED-7 S17-3; verified at the code on `02603e88`)
milestone: M0
interface: none
design: `docs/development/VERIFICATION.md` §"WHAT COMPOSES THE INSTRUMENTS".
depends-on: none.
scope: the marker admits a title-case label arm; `**Settled by:**` stays unfiled. Extend `tools/decided.test.mjs`.
accepts-when: the three missed rulings are found. NEGATIVE CONTROL: remove the label arm, and those rulings go unfiled by name.
added: 2026-09-23 · SCHEDULER #17 (LED-7 S17-3; keeps its `D-` id).

### D-457 · queued — **CPDF-20's PER-PAGE TIER IS SHIPPED AND UNRECORDED: `mergeTier2Text` has emitted `text.pages[].tier` since `1240af81` with no IC on I2, and Framework §16's closing table and front matter still list "a per-page rule for tier-2 replacement" ABSENT, though it is built and was watched live (D-283, M-120).** — owner CONTENT-PDF.
order: with the M0 record-hygiene rows, after D-441: a record that says less than is built (SCHEDULER #17, 2026-09-23; CPDF-3's worker via CONDUCT #18 23:12Z)
milestone: M0 (the record of what is built)
interface: I2 additive MINOR — filed by CONTENT-PDF, resolved by CONDUCT.
design: `docs/development/VERIFICATION.md` (the construct record is checked against the code), for `docs/architecture/BIO_Content_Framework_v0_10.md` §16.
depends-on: none.
scope: file the I2 IC for `tier`; correct §16's table and front matter; add a construct-5 claim in `construct-status.json` probing `export function mergeTier2Text(` in `textchain.mjs`.
accepts-when: `node tools/status.mjs 5` reads the per-page rule BUILT by its probe, and I2 documents `tier`. NEGATIVE CONTROL: rename the probed function, and the status check fails naming the claim.
added: 2026-09-23 · SCHEDULER #17 (`node tools/mintid.mjs D`).

### UI-87 · queued — **THE ANALYST-VOCABULARY GATE FIRES ON PLAIN ENGLISH: `civicos-ui/test/analyst-vocabulary.mjs`'s `BANNED` connective rule `(AND|OR)\s+(of|…|set|sets)` carries `/i`, so "reason 1 and set 2" and "two or more sets" fail as analyst jargon.** Measured with node (CONDUCT #17, re-measured by SCHEDULER #17 on c17-batch5 @ 7c4f6b5f); the file's other connective rules are case-sensitive and its own header, finding (i), says a case-insensitive `AND` fires on correct English. — owner UI.
order: after M0-139, among the verification rows: a gate that refuses correct member copy pushes surface authors toward worse words, so it goes ahead of pure process tooling (SCHEDULER #17, 2026-09-23, CONDUCT #17's 22:00Z finding (4))
milestone: M0
interface: none — a test rule.
design: `docs/development/VERIFICATION.md` (a suite asserts what it claims), with DEC-32 clause 1 as the file itself states it.
depends-on: none.
scope: drop the `i` flag on that one rule; keep "the OR set" and "AND of the legs" caught. Extend `civicos-ui/test/analyst-vocabulary.test.mjs` with a must-pass fixture.
accepts-when: "reason 1 and set 2" passes and "the OR set" is still refused. NEGATIVE CONTROL: restore `/i`, and the plain-English must-pass arm fails by name.
added: 2026-09-23 · SCHEDULER #17 (CONDUCT #17's finding; `node tools/mintid.mjs UI`).

### D-272 · queued — **THE REFUSAL-CODE CENSUS IS STILL A FLOOR READ AS A TOTAL: `check-refusal-codes.mjs` arm F resolves codes held in constants (`STORE_SILENT_REASON` in `index.mjs`, `const REASON = {…}` in `store.mjs`) and prints them, but they never join the census union the floors are measured over.** — owner UI (the refusal-code guard).
order: after UI-87, first of the census rows: a member-facing refusal can go untranslated while the census reads complete (SCHEDULER #17, 2026-09-23, LED-7 batch S17-1)
milestone: M0 (the census instrument; the translations it surfaces are DEC-49 work)
interface: none — the census and its floors.
design: `docs/development/VERIFICATION.md` (a census states what it reads), with DEC-49 for the translation of any code it recovers.
depends-on: none.
scope: promote arm F's identifier resolution to a seventh matcher in the union; re-read the six `FLOOR` figures from one printed green run in the same turn; translate the recovered codes under DEC-49 (`STORE_DID_NOT_ANSWER` among them). Suite `civicos-ui/test/refusal-codes.test.mjs`, driver `refusal-codes.control.mjs`.
accepts-when: both recovered codes are in the union and the floors carry no slack. NEGATIVE CONTROL: remove the seventh matcher, and a named floor arm fails.
added: 2026-09-23 · SCHEDULER #17 (LED-7 S17-1; D-272's DEBT row of 2026-08-09, verified at the code on `02603e88`; keeps its `D-` id).

### D-273 · queued — **NINETY-THREE-PLUS REFUSAL CODES ARE WRITTEN INLINE AT SEVERAL SITES (`check-refusal-codes.mjs` F4 MULTI-SITE, last partition 103), SO NONE CAN TAKE ONE DEC-49 ROW.** — owner RECORD, with UI.
order: after D-272, the same census (SCHEDULER #17, 2026-09-23, LED-7 S17-3; verified at the code on `02603e88`)
milestone: M0 (the guard's shape)
interface: none
design: `docs/development/VERIFICATION.md` (the DEC-49 guard), following REC-79's single-helper shape for `NOT_CAPABLE` (`admission-gate.test.mjs`).
depends-on: none.
scope: consolidate each multi-site code behind one helper, one code per slice, starting with `NO_SUCH_BUNDLE` (15 sites); re-read the partition each slice.
accepts-when: the sliced code reads single-site and the F4 count falls by one. NEGATIVE CONTROL: restore one inline literal, and arm F fails by name.
added: 2026-09-23 · SCHEDULER #17 (LED-7 S17-3; keeps its `D-` id).

### D-344 · queued — **THE CONTROL REGISTER CANNOT SEE A QUALIFIED `NEGATIVE CONTROL` DECLARATION: `control-register.mjs` `markerPositions` counts the phrase only when a separator follows it directly, so `NEGATIVE CONTROL (…)` (over sixty suites) and `NEGATIVE CONTROL, …` (three in `corpuscheck.test.mjs`) are invisible, and `register-grammar.test.mjs` C5e works around the blind spot rather than fixing it.** — owner M0 (VERIFICATION).
order: after D-272: the register every suite's control is counted by under-reads, so coverage is claimed on less than it reads (SCHEDULER #17, 2026-09-23, LED-7 batch S17-1)
milestone: M0
interface: none
design: `docs/development/VERIFICATION.md` §"The negative-control register".
depends-on: none.
scope: `markerPositions` admits one parenthesised or comma qualifier before a separator on the same line; a bare phrase with no separator still does not count; C5e corrected in the same change.
accepts-when: `corpuscheck.test.mjs` reads five declarations and C5e's workaround falls, in `register-grammar.test.mjs`. NEGATIVE CONTROL: restore the strict separator check, and the "a qualified marker is a declaration" arm fails by name.
added: 2026-09-23 · SCHEDULER #17 (LED-7 S17-1; keeps its `D-` id).

### D-357 · queued — **THE DEC-49 GUARD'S REGION MATCHER ENDS IN A WORD BOUNDARY, SO A REGION NAMED `x-y` OPENS REGION `x` TOO: `civicos-ui/check-refusal-codes.mjs` `REGION_START`/`REGION_END`.** A live latent pair exists (`is-capture-request` in `store.mjs`, `is-capture-request-arm` in `index.mjs`), harmless only while they sit in different files. — owner UI.
order: after D-344 (SCHEDULER #17, 2026-09-23, LED-7 batch S17-1)
milestone: M0
interface: none
design: `docs/development/VERIFICATION.md` (the DEC-49 guard's section, *what a refusal is in principle*).
depends-on: none.
scope: end both patterns in a lookahead for whitespace, a comment close or end of line instead of the word boundary; a sibling-region fixture.
accepts-when: a file holding regions `x` and `x-y` passes with one opener each, and the `regionLines` floors do not move. NEGATIVE CONTROL: restore the word boundary, and the "one opener per name" arm fails naming two opening markers.
added: 2026-09-23 · SCHEDULER #17 (LED-7 S17-1; keeps its `D-` id).

### D-300 · queued — **A SUITE THAT READS THE WALL CLOCK CAN TURN RED UNTOUCHED, AND THE SWEEP THAT WOULD SAY SO IS RUN BY NOBODY: three suites of about three hundred bind `BIO_NOW_MS`; `clockadvance.control.mjs` exists and no tool, script or gate runs it.** — owner M0.
order: after D-357; the cheap half (run the sweep) first; threading the clock through every constructor is a later row if the sweep finds decay (SCHEDULER #17, 2026-09-23, LED-7 batch S17-1)
milestone: M0
interface: none
design: `docs/development/VERIFICATION.md`.
depends-on: none.
scope: `gates.mjs` (or the battery) runs the clock-advanced sweep at plus one year on the full class and prints its result line; each suite it turns red is named.
accepts-when: the sweep runs without anyone starting it and its line is printed on a full gate. NEGATIVE CONTROL: plant a fixture dated thirty days ahead, and the sweep arm fails naming the suite.
added: 2026-09-23 · SCHEDULER #17 (LED-7 S17-1; keeps its `D-` id).

### D-166 · queued — **THE TIER 1 COVERAGE PROBE STILL POINTS AT OAKLAND FINANCE URLS THAT NOW SERVE HTML: `bio-plane/test/tier1-coverage-probe.mjs` names `www.oaklandca.gov/files/assets/city/v/1/finance/documents`, unchanged since 2026-07-31.** Not re-measured live on 2026-09-23 (the session's proxy refused the host). — owner CONTENT-PDF.
order: after D-300, last of this batch: a measurement's corpus, not a product path (SCHEDULER #17, 2026-09-23, LED-7 batch S17-1)
milestone: M0 (a measurement instrument's corpus)
interface: none
design: `docs/development/VERIFICATION.md` (a measurement names its instrument and date), for the Tier 1 coverage entry in `docs/development/MEASUREMENTS.md`.
depends-on: none.
scope: find the documents' current locations, re-point the probe's Oakland half, keep the old URLs as history in the entry.
accepts-when: every URL the probe names returns bytes beginning `%PDF`, recorded with date and instrument. NEGATIVE CONTROL: point one entry back at an HTML page, and the probe names it as not a PDF.
added: 2026-09-23 · SCHEDULER #17 (LED-7 S17-1; keeps its `D-` id).

### M0-135 · queued — **A LANE'S OWN `gates.mjs` ON A TREE ALREADY RECORDED GREEN TAKES §2d's TREE-KEYED SHORTCUT AND RUNS NO NEVER-CACHED UNIT (with `BIO_GATE_RESULTS=off`), SO A HISTORY- OR REF-READING CHECK IS SKIPPED ON A LANE'S PUSH.** M0-131 closed this for the TRAIN (`gates.mjs --never-cached` on a reused tree, so `main` is covered); a lane's gate is not. M0-131's worker's finding, verified in its report (CONDUCT #16); RE-READ 2026-09-23 by SCHEDULER #16 on `0e7cc03e` (M0-131 landed): NARROWED — with the per-unit record on (the default) §2d does not take the shortcut and the never-cached units run; the bare shortcut stands only with `BIO_GATE_RESULTS=off` (or no `tools/gateresults.mjs`) and no `--with-never-cached`. — owner M0.
order: behind the product rows, first of the process block (moved 2026-09-23 by SCHEDULER #16): re-read at the code, the default path already runs the never-cached units, so this closes a non-default mode, neither cutting gate time nor unblocking product — Bob, 2026-09-22: *"The goal is BIO work; process is overhead"* (was: directly after REC-176, SCHEDULER #15)
milestone: M0
interface: none
design: `docs/development/TREE-SHARING.md` §3a condition 1 (never-cached units always run) and §2 (M0-122's reuse), with `docs/development/VERIFICATION.md` (admitted for M0 by name).
depends-on: M0-131 (its derived never-cached set and `--never-cached` run are reused).
scope: with the per-unit record off, §2d's shortcut on a recorded-GREEN tree behaves as `--with-never-cached`: it runs the derived never-cached set and records the tree GREEN only when they pass; the printed line says which units ran.
accepts-when: `gates.mjs` on a recorded-GREEN tree with a planted history defect reads RED naming the never-cached unit. NEGATIVE CONTROL: restore the bare shortcut, and the planted arm reads GREEN and fails by name.
added: 2026-09-23 · SCHEDULER #15 (M0-131's worker's finding via CONDUCT #16; `node tools/mintid.mjs M0`).

### M0-137 · queued — **SUITES PASS ABBREVIATED COMMIT IDS TO GIT, SO A FETCH THAT BRINGS A COLLIDING PREFIX TURNS A GREEN SUITE RED WITH NO CODE CHANGE.** Re-read on `origin/main` @ `38b49c50`: `bio-plane/test/ledger.test.mjs` `PRE_MIGRATION = "9ea2eb02"` and `STATE_PIN = "de40aa56"`; `bio-plane/test/mergecarry.test.mjs` passes `"e241672"` to `git cat-file`, `auditMerge`, `git show` and the `tools/mergecarry.mjs --commit` CLI. — owner M0.
order: first of the process block, directly after M0-135: a red on `main` from a git object, not the code, is TREE-SHARING §3's alarm to Bob, but no collision has happened, so it sits behind the product rows (SCHEDULER #16, 2026-09-23; M0-136's worker via CONDUCT #16)
milestone: M0
interface: none
design: `docs/development/TREE-SHARING.md` §3 (*"A GATE TEST DEPENDS ONLY ON THE CODE"*), with `docs/development/VERIFICATION.md` (admitted for M0 by name).
depends-on: M0-136 (touches the same history readers; on `land/conduct/c16-batch6`).
scope: every commit id a suite passes to git in CODE is the full 40-hex id (`9ea2eb022b5d6490c9e9e96b93037040193084d3`, `de40aa56f5d397666228502132d56756f51ff6b9`, `e2416725d2504485443ea24bb68a00009e886570`); a sweep of `bio-plane/test/` and `tools/` for other short ids passed to git, each lengthened or listed. Prose citations may stay short.
accepts-when: `ledger.test.mjs` and `mergecarry.test.mjs` green with only 40-hex ids in their git calls, and a hygiene arm in `mergecarry.test.mjs` that fails by name on a short id passed to git. NEGATIVE CONTROL: shorten one id back, and that arm fails by name.
added: 2026-09-23 · SCHEDULER #16 (M0-136's worker's finding via CONDUCT #16, verified at the code; `node tools/mintid.mjs M0`).

### M0-104 · queued — **A GATE RUN ON A DIRTY TREE RECORDS NOTHING, SO D-293's OWN SHAPE — A RED GATE, THEN `git add -A && git commit && git push`** … (whole text: the cut archive)
order: behind the product rows, the first process row after D-50 (Bob, 2026-09-22, `CLAUDE.md` §2: process is overhead; it neither cuts gate time nor unblocks product, as a commit-then-gate is recorded already); a correction to D-293 (SCHEDULER #11 on BOB #25's word)
milestone: M0
interface: none
design: `docs/development/VERIFICATION.md` (admitted for M0 by name), its push-guard section; the dirty-tree … (whole text: the cut archive)
depends-on: none — D-293 is on `main`.
accepts-when: a RED gate on a dirty tree, then `git add -A && git commit` and a push, is refused by name; a dirty run whose tree changes mid-run records nothing and says so; a GREEN dirty … (whole text: the cut archive)
added: 2026-09-22 · SCHEDULER #11 (BOB #25's inbox entry, item 1, drained this commit; `node tools/mintid.mjs M0`).
cut: cut to its fields by SCHEDULER #12 (2026-09-22, the backlog's 150 KiB budget); the row as it stood before this cut is VERBATIM under «M0-104» in `docs/archive/ledgers/QUEUE-cut-2026-09-22.md`. A worker READS IT before building.

### M0-105 · queued — **`docs/development/VERIFICATION.md` STANDS AT 24,572 OF ITS 24,576 B, SO A RULING ABOUT VERIFICATION CANNOT BE FOLDED INTO IT** … (whole text: the cut archive)
order: directly after M0-104, whose line it folds, behind the product rows (Bob, 2026-09-22, `CLAUDE.md` §2: process is overhead; SCHEDULER #11 on BOB #25's word); RETURNED here by SCHEDULER #14 after M0-107 folded its ruling within budget (`VERIFICATION.md` 24,319 B at `14f1b75e`)
milestone: M0
interface: none
design: `docs/development/VERIFICATION.md` (admitted for M0 by name), with CLAUDE.md §1's reading budget and … (whole text: the cut archive)
depends-on: M0-97 (on CONDUCT #12's batch), whose second specimen this cut folds (BOB #25, 2026-09-22).
accepts-when: the file is at most 22,528 B; every sentence the cut removes is in the archive file verbatim (moved, never lost); the register-grammar suite and its control pass. How a liar … (whole text: the cut archive)
added: 2026-09-22 · SCHEDULER #11 (BOB #25's inbox entry, item 2, drained this commit; `node tools/mintid.mjs M0`).
cut: cut to its fields by SCHEDULER #12 (2026-09-22, the backlog's 150 KiB budget); the row as it stood before this cut is VERBATIM under «M0-105» in `docs/archive/ledgers/QUEUE-cut-2026-09-22.md`. A worker READS IT before building.

### M0-84 · queued — **NOTHING NOTICES WHEN A RETIRED INSTANCE OF A LANE LANDS AFTER ITS SUCCESSOR.** BOB #17 landed `aa5cc98d` (00:48) after BOB #18 … (whole text: the cut archive)
order: behind the product rows, first of the session-hygiene instruments (Bob, 2026-09-22, `CLAUDE.md` §2: *process is overhead*: a detector neither cuts gate time nor unblocks product; SCHEDULER #12); after M0-81, which PREVENTS what this DETECTS (BOB #19, 2026-09-21): pure git, about a second (SCHEDULER #4, 2026-09-21)
milestone: M0
interface: none
design: `docs/development/VERIFICATION.md` (admitted for M0 by name), enacting `kickoffs/BOB.md` rules 4 and 12.
depends-on: none.
accepts-when: a fixture log with an older instance landing after a newer one WARNs naming both; the same log whose late commit touches only the `-NEXT` file does not. How a liar passes it … (whole text: the cut archive)
added: 2026-09-21 · SCHEDULER #4 (BOB #19's inbox entry, drained this commit).
cut: cut to its fields by SCHEDULER #12 (2026-09-22, the backlog's 150 KiB budget); the row as it stood before this cut is VERBATIM under «M0-84» in `docs/archive/ledgers/QUEUE-cut-2026-09-22.md`. A worker READS IT before building.

### M0-85 · blocked — **THE HEARTBEAT MEASURES A STALE TREE.** `conduct-heartbeat` STEP 3 greps `QUEUE.md` in the MAIN CHECKOUT's working tree and … (whole text: the cut archive)
order: behind the product rows with the session-hygiene instruments (Bob, 2026-09-22, `CLAUDE.md` §2: *process is overhead*; SCHEDULER #12), M0-81's class (BOB #19, 2026-09-21); `blocked` because no worker can take it — the definition is Bob's to approve and is never changed from here (SCHEDULER #4, 2026-09-21)
milestone: M0
interface: none
design: `docs/development/VERIFICATION.md` (admitted for M0 by name), with the heartbeat's own STEP 3 warning … (whole text: the cut archive)
depends-on: Bob's approval of the definition edit (BOB #19 took it to him, 2026-09-21).
accepts-when: a heartbeat run's `queued`/`running` counts equal those of `git show origin/main:docs/development/QUEUE.md` read at that run, and its sweep names the tip it judged.
added: 2026-09-21 · SCHEDULER #4 (BOB #19's inbox entry, drained this commit).
cut: cut to its fields by SCHEDULER #12 (2026-09-22, the backlog's 150 KiB budget); the row as it stood before this cut is VERBATIM under «M0-85» in `docs/archive/ledgers/QUEUE-cut-2026-09-22.md`. A worker READS IT before building.

### D-412 · queued — **THE ESTATE AUDITS EXPOSURE AND NOBODY AUDITS RESIDUE: a worktree that is registered, clean, merged and owned by no live session** … (whole text: the cut archive)
order: with the session-hygiene instruments, after M0-84: disk is CONDUCT's binding constraint (M-80 and M-81 each measure ~286 MiB per retired tree) and this names the residue nothing reclaims; below M0-81 and M0-84, which prevent and detect a lane fault rather than a cost (SCHEDULER #5, 2026-09-21)
milestone: M0
interface: none
design: `docs/development/VERIFICATION.md` (admitted for M0 by name), with D-398's three conditions asked of a TREE rather than a session.
depends-on: none. `tools/retirable.mjs` is the precedent: the JUDGEMENT in the repo where a suite drives it, the ACT in the harness.
accepts-when: a fixture tree registered, clean, merged and unowned is named RECLAIMABLE with its size; **one a live worker is using is NEVER named** — the over-strictness arm IS the item. … (whole text: the cut archive)
added: 2026-09-21 · SCHEDULER #5 (LED-7 batch 10; keeps its `D-` id).
cut: cut to its fields by SCHEDULER #12 (2026-09-22, the backlog's 150 KiB budget); the row as it stood before this cut is VERBATIM under «D-412» in `docs/archive/ledgers/QUEUE-cut-2026-09-22.md`. A worker READS IT before building.

### REC-154 · queued — **`kickoffs/RECORD.md` IS 36,709 B AGAINST THE 24,576 B READING BUDGET**, so the lane whose kickoff it is cannot read its own … (whole text: the cut archive)
order: behind the product rows, first of the reading-budget rows (Bob, 2026-09-22, `CLAUDE.md` §2: *process is overhead*: an over-budget kickoff costs every RECORD spawn context, not gate time, and blocks no product; SCHEDULER #12); not a defect in the product, cheap and mechanical (SCHEDULER #2, 2026-09-19)
milestone: M0
interface: none
design: `docs/development/VERIFICATION.md` with CLAUDE.md §1's reading budget — *a file is either READ WHOLE … (whole text: the cut archive)
depends-on: none.
accepts-when: `node tools/readbudget.mjs` no longer warns on RECORD.md; the archived text is byte-identical to what left the live file; no RECORD worker was live during the cut. How a liar … (whole text: the cut archive)
added: 2026-09-19 · SCHEDULER #2 (routed by CONDUCT #7; `node tools/mintid.mjs REC`).
cut: cut to its fields by SCHEDULER #12 (2026-09-22, the backlog's 150 KiB budget); the row as it stood before this cut is VERBATIM under «REC-154» in `docs/archive/ledgers/QUEUE-cut-2026-09-22.md`. A worker READS IT before building.

### CPDF-21 · queued — **`kickoffs/CONTENT-PDF.md` IS 25,863 B AGAINST THE 24,576 B READING BUDGET**, so the lane cannot read its own instructions … (whole text: the cut archive)
order: directly after REC-154, its class and its precedent: it breaks CLAUDE.md §1's reading budget for a build lane, every CONTENT-PDF worker pays it on every spawn, and it is cheap and mechanical (SCHEDULER #6, 2026-09-21; SCHEDULER #5's handoff)
milestone: M0
interface: none
design: `docs/development/VERIFICATION.md` (admitted for M0 by name) with CLAUDE.md §1's reading budget — *a … (whole text: the cut archive)
depends-on: none. **Same line as REC-154** (`CUT` in `tools/readbudget.mjs`): whichever lands second re-reads the first.
accepts-when: `node tools/readbudget.mjs` no longer warns on CONTENT-PDF.md and lists it in `CUT`; the archived text is byte-identical to what left the live file. How a liar passes it … (whole text: the cut archive)
added: 2026-09-21 · SCHEDULER #6 (`node tools/mintid.mjs CPDF`).
cut: cut to its fields by SCHEDULER #12 (2026-09-22, the backlog's 150 KiB budget); the row as it stood before this cut is VERBATIM under «CPDF-21» in `docs/archive/ledgers/QUEUE-cut-2026-09-22.md`. A worker READS IT before building.

### M0-82 · queued — **NARROWED TWICE ON 2026-09-21: WHAT IS LEFT IS THE OCCUPANCY RULE AT THE INTEGRATOR'S NO-BOB FALLBACK START.** The … (whole text: the cut archive)
order: beside REC-154, the reading-budget class, and after M0-81, which builds the occupancy judgement this rule points at (SCHEDULER #4, 2026-09-21, re-measured; placed by SCHEDULER #3, 2026-09-20)
milestone: M0
interface: none
design: `docs/development/VERIFICATION.md` (admitted for M0 by name) with CLAUDE.md §1's reading budget … (whole text: the cut archive)
depends-on: none. Sequence after M0-81.
accepts-when: `node tools/readbudget.mjs` reads CONDUCT.md under budget with 0 failing; the kickoff states the check at the fallback start and cites BOB.md; anything cut is byte-identical in the archive.
added: 2026-09-20 · SCHEDULER #3 (BOB #18's inbox entry); narrowed 2026-09-21 by BOB #19 and SCHEDULER #4 (BOB #19's inbox entry, drained this commit).
cut: cut to its fields by SCHEDULER #12 (2026-09-22, the backlog's 150 KiB budget); the row as it stood before this cut is VERBATIM under «M0-82» in `docs/archive/ledgers/QUEUE-cut-2026-09-22.md`. A worker READS IT before building.

### M0-120 · queued — **`mintid --audit --base` DIFFS `main` ONLY, SO AN ID ALLOCATED ON `coord` IS INVISIBLE TO THE INTEGRATION-SIDE CHECK.** `audit()` (`tools/mintid.mjs`) reads `git diff <base>...HEAD`; since M0-110's cutover every DEBT row, plan heading and ledger archive — the allocation sites — lands on `coord`. Found by M0-110's worker (CONDUCT #14). — owner M0.
order: first of the ledger tooling, before LED-8: an id collision check blind to where ids are now minted is the costs-nothing green, latent until two lanes mint the same id on `coord`; behind the product rows (Bob, 2026-09-22, `CLAUDE.md` §2) (SCHEDULER #14, 2026-09-23; M0-110's finding)
milestone: M0
interface: none
design: `docs/development/TREE-SHARING.md` §1 (the state moves to `coord`; every reader follows it), with `docs/development/VERIFICATION.md` (admitted for M0 by name).
depends-on: none — M0-110 is done.
scope: the audit also diffs the `origin/coord` range (the ids a branch's coord writes added since its base), reading through `tools/coord.mjs`, and says which side each allocation came from.
accepts-when: an id allocated twice, once on `main` and once on `coord`, is reported as a collision by name. NEGATIVE CONTROL: drop the coord range, and that arm fails by name.
added: 2026-09-23 · SCHEDULER #14 (M0-110's finding, via CONDUCT #14; `node tools/mintid.mjs M0`).

### M0-128 · queued — **`coord.mjs write` REBALANCES THE BACKLOG AFTER EVERY WRITE, A CLAIM OR A STATUS WORD INCLUDED, WHERE BOB #29 RULED THAT ONLY A WRITE CHANGING THE PLAN'S MEMBERSHIP OR SIZE MAY.** `write()` (`tools/coord.mjs`, re-read on `619dfa65`) runs `applyIntent(dir, { op: "rebalance", auto: true })` whenever its `rebalance` option is true, which is the default, whatever the intents; `WORK-PIPELINE.md` §2 names this *"the correction owed (M0)"*. Harmless today (a rebalance conserves every row verbatim), so it breaks M0-110's partition of writers only in principle: a lane's claim can move a plan row it never read. — owner M0.
order: with the ledger tooling, directly after M0-120 and before LED-8: a ruled correction to a landed tool, but WORK-PIPELINE §2 itself says a stray rebalance is harmless, so it neither cuts gate time nor unblocks product and sits behind the product rows (Bob, 2026-09-22, `CLAUDE.md` §2) (SCHEDULER #15, 2026-09-23; BOB #29's ruling of the same day)
milestone: M0
interface: none
design: `docs/development/WORK-PIPELINE.md` §2, *"WHICH WRITES REBALANCE — RULED 2026-09-23 by BOB #29"*, with `docs/development/VERIFICATION.md` (admitted for M0 by name).
depends-on: none — M0-119 is on `main`.
scope: `write()` adds its automatic rebalance only when an intent changes a plan file's membership or size: `insert`, `row`, `refill`, `archive`, or an `append`, `line` or `replace` whose file is `QUEUE.md`, `BACKLOG.md` or `BACKLOG-LATER.md`; a `status` word, a claim, a handoff or a DELEGATION does not. The explicit `rebalance` intent is unchanged; `coord.test.mjs` gains the arms.
accepts-when: a write of only a `CLAIMS.md` append or a `-NEXT.md` replace leaves both plan files byte-identical even when the backlog is over budget; an `insert` over budget still moves the tail. NEGATIVE CONTROL: rebalance on every write again, and the claim-only arm fails by name.
added: 2026-09-23 · SCHEDULER #15 (BOB #29's ruling in WORK-PIPELINE §2; `node tools/mintid.mjs M0`).

### LED-8 · queued — **SIX REGISTERED ID COLLISIONS: `ledger.mjs find` ANSWERS TWO DIFFERENT ROWS FOR ONE ID.** D-121 and D-124 each name two … (whole text: the cut archive)
order: behind the product rows, first of the ledger tooling (Bob, 2026-09-22: *process is overhead*; SCHEDULER #12): AMBIGUITY STATED, not the record over-claiming — the tools REFUSE loudly rather than corrupt (`archive D-121 --dry-run` prints both dispositions and stops), and LED-7 folds around the two rows (SCHEDULER #2 + BOB #17, 2026-09-19)
milestone: M0
interface: none
design: `docs/architecture/BIO_Membership_Architecture_v2.md` §7, the bullet "The legacy residue" … (whole text: the cut archive)
depends-on: none.
accepts-when: `find` returns BOTH rows for a collided id and SAYS it collided; `mintid --audit` still reads 0 breaks; every existing citation of the four still resolves. How a liar passes … (whole text: the cut archive)
added: 2026-09-19 · SCHEDULER #2 (batch 4; found by CONDUCT #7; no-renumber ruling by BOB #17).
cut: cut to its fields by SCHEDULER #12 (2026-09-22, the backlog's 150 KiB budget); the row as it stood before this cut is VERBATIM under «LED-8» in `docs/archive/ledgers/QUEUE-cut-2026-09-22.md`. A worker READS IT before building.

### LED-9 · queued — **A PIPELINE INVARIANT READS `status.mjs`, SO A DEPENDENT CANNOT BE SEQUENCED ABOVE UNBUILT SUBSTRATE.** P4 fails the plan when a … (whole text: the cut archive)
order: with LED-8, the ledger tooling: preventive, not a live defect — no row is mis-sequenced today, checked by hand. Earned by THREE catches in one day (D-60, D-115, D-116): a row read as done because the thing underneath it was (SCHEDULER #2 + BOB #17, 2026-09-19)
milestone: M0
interface: none
design: `docs/development/VERIFICATION.md`, the law this gate is an arm of, with `WORK-PIPELINE.md`'s P1–P5 … (whole text: the cut archive)
depends-on: none.
accepts-when: a row depending on a construct `status.mjs` reads ABSENT fails the plan NAMING both; one whose substrate is BUILT passes; **a row naming substrate only in prose is UNJUDGED** … (whole text: the cut archive)
added: 2026-09-19 · SCHEDULER #2 (D-404's fix, ruled by BOB #17).
cut: cut to its fields by SCHEDULER #12 (2026-09-22, the backlog's 150 KiB budget); the row as it stood before this cut is VERBATIM under «LED-9» in `docs/archive/ledgers/QUEUE-cut-2026-09-22.md`. A worker READS IT before building.

### M0-115 · queued — **`corpuscheck.test.mjs` §5 REQUIRES THE LINE `| D-388 |` IN THE LIVE `DEBT.md`, SO THE LED-7 BATCH THAT MOVES D-388, BY ANY** … (whole text: the cut archive)
order: behind the product rows, with the ledger tooling after LED-9 (Bob, 2026-09-22, `CLAUDE.md` §2: *process is overhead*): it unblocks one fold move, D-388's, a question with BOB, so nothing runnable waits on it; it MUST land before the batch that moves D-388 (SCHEDULER #13, 2026-09-22; M0-109's DELEGATION, item 1)
milestone: M0
interface: none
design: `docs/development/VERIFICATION.md` (admitted for M0 by name): a suite is evidence only where it can … (whole text: the cut archive)
depends-on: none.
accepts-when: the arm passes with D-388 open in DEBT and with D-388 moved to the backlog under its own id, and fails by name with D-388 archived closed while the UNDECIDED set is non-empty. … (whole text: the cut archive)
added: 2026-09-22 · SCHEDULER #13 (M0-109's DELEGATION to SCHEDULER, item 1; `node tools/mintid.mjs M0`).
cut: cut to its fields by SCHEDULER #13 (2026-09-22, the backlog's 150 KiB budget); the row as it stood before this cut is VERBATIM under «M0-115» in `docs/archive/ledgers/QUEUE-cut-2026-09-22.md`. A worker READS IT before building.

### D-107 · queued — **THE INSTALLER HAS NO SCRIPTED DEPLOY.** `newgroup/DEPLOY.md` documents a dashboard paste of the bundled module, which records … (whole text: the cut archive)
order: with the preventive instruments, after LED-9: DIST's law reads the installer back BY HAND at every cut (`kickoffs/DIST.md` step 9: the embedded version, and `bindings: []` still empty), so nothing ships unverified today; the script moves it from discipline to instrument (SCHEDULER #6, 2026-09-21, LED-7 batch 15)
milestone: M7
interface: I4 — the release artifact's deploy path; the integrator classifies it.
design: `docs/architecture/BIO_Distribution_v0_1.md` §6, the deploy-to-serve ladder — *every rung read back … (whole text: the cut archive)
depends-on: none.
accepts-when: a deploy whose read-back differs from the signed bytes, carries another version or shows any binding reports FAILURE by name; a clean one reports the hash it read. How a liar … (whole text: the cut archive)
added: 2026-09-21 · SCHEDULER #6 (LED-7 batch 15; keeps its `D-` id).
cut: cut to its fields by SCHEDULER #12 (2026-09-22, the backlog's 150 KiB budget); the row as it stood before this cut is VERBATIM under «D-107» in `docs/archive/ledgers/QUEUE-cut-2026-09-22.md`. A worker READS IT before building.

### D-211 · queued — **DIST's GATE STEP 8 SAYS `op=audit` CLEAN, AND ON A RECORD PAST 200 DOCUMENTS A CLEAN FIRST PAGE SATISFIES THAT WORDING.** `op=audit` answers one page (`checked` is the page size, `cursor` non-null means more; REC-57); `kickoffs/DIST.md` step 8 (re-read on `b5ce975a`) reads only *"`op=audit` clean."* Latent until an instance passes 200 documents. — owner DIST (its own kickoff).
order: behind the product rows with DIST's instruments, directly after D-107: preventive wording, latent today (biosmoke7 holds fewer than 200 documents), so it neither cuts gate time nor unblocks product (Bob, 2026-09-22, `CLAUDE.md` §2) (SCHEDULER #15, 2026-09-23, LED-7)
milestone: M0
interface: none
design: `docs/development/VERIFICATION.md` (admitted for M0 by name): verify by the positive artifact — a clean audit is every page clean, not the first.
depends-on: none — REC-57's `cursor` and `total` are on `main`.
scope: step 8 reads: `op=audit` walked to a null `cursor`, every page clean (D-200's known findings named), with the pages and `total` stated in the report. DIST's own act; CONDUCT routes it to DIST and briefs no worker.
accepts-when: DIST's next cut report states the audit's pages and `total` and a null final cursor.
added: 2026-09-23 · SCHEDULER #15 (LED-7; D-211's DEBT row of 2026-08-05; keeps its `D-` id).

### D-438 · queued — **THE DEC-49 GUARD'S REAL-TREE CONTROL HARNESS `civicos-ui/test/refusal-codes.control.mjs` IS RED: FOUR ARMS FAIL THAT ARE NOT** … (whole text: the cut archive)
order: behind the product rows, FIRST of the instrument cluster, which follows in its prior order (Bob, 2026-09-22, `CLAUDE.md` §2: *process is overhead*: no battery runs a `.control.mjs`, so repairing one cuts no gate time and unblocks no product; SCHEDULER #12); with M0-93: a control red on a green `main` measures nothing, D-355's class (SCHEDULER #7, 2026-09-21)
milestone: M0
interface: none
design: `docs/development/VERIFICATION.md` (admitted for M0 by name), the section … (whole text: the cut archive)
depends-on: none. D-254 corrected (n2) at `cac06ae7`.
accepts-when: the harness runs to its foot with every arm AS DECLARED, each re-declaration dated at its site. How a liar passes it: re-pinning (r2)/(r6) to whatever prints, so the two … (whole text: the cut archive)
added: 2026-09-21 · SCHEDULER #7 (LED-7; the D-254 worker's DEBT row; keeps its `D-` id).
cut: cut to its fields by SCHEDULER #12 (2026-09-22, the backlog's 150 KiB budget); the row as it stood before this cut is VERBATIM under «D-438» in `docs/archive/ledgers/QUEUE-cut-2026-09-22.md`. A worker READS IT before building.

### M0-102 · queued — **THREE INSTRUMENTS PASS WHERE THEY SHOULD FAIL.** (1) `bio-plane/scripts/coverage.mjs`: `REGISTER_FLOOR` and `FLEET_FLOOR` … (whole text: the cut archive)
order: directly after D-438, the DEC-49 guard's controls: (3) is a control measuring nothing, D-438's class; (1) and (2) are M0-79's doctrine one file over (SCHEDULER #8, 2026-09-21; CONDUCT #10's routes)
milestone: M0
interface: none
design: `docs/development/VERIFICATION.md` (admitted for M0 by name), with M0-79's `SLACK` table in the guard … (whole text: the cut archive)
depends-on: none — M0-79 is on `main`.
accepts-when: slack in a coverage floor exits non-zero naming it; an untracked file cannot hide a fall of `r3Fed`; `nc-rec64.mjs` runs every arm AS DECLARED. How a liar passes it: gating … (whole text: the cut archive)
added: 2026-09-21 · SCHEDULER #8 (verified at the code; `node tools/mintid.mjs M0`).
cut: cut to its fields by SCHEDULER #12 (2026-09-22, the backlog's 150 KiB budget); the row as it stood before this cut is VERBATIM under «M0-102» in `docs/archive/ledgers/QUEUE-cut-2026-09-22.md`. A worker READS IT before building.

### M0-93 · queued — **`bio-plane/test/delegations.control.mjs` IS RED ON `main`: ITS A1 AND A6 ASSUME ONE AFFIRMATION LINE PER DELEGATION BLOCK, AND** … (whole text: the cut archive)
order: with D-438, first of the instrument cluster: a control red on a green `main` (SCHEDULER #7, 2026-09-21; D-355's route via CONDUCT #10)
milestone: M0
interface: none
design: `docs/development/VERIFICATION.md` (admitted for M0 by name), with its M0-51 rule: *never rename a … (whole text: the cut archive)
depends-on: none.
accepts-when: the control reads every arm AS DECLARED on `main` with the two-line block in place, and leaves the tree byte-identical. How a liar passes it: deleting the older line, so the … (whole text: the cut archive)
added: 2026-09-21 · SCHEDULER #7 (`node tools/mintid.mjs M0`).
cut: cut to its fields by SCHEDULER #12 (2026-09-22, the backlog's 150 KiB budget); the row as it stood before this cut is VERBATIM under «M0-93» in `docs/archive/ledgers/QUEUE-cut-2026-09-22.md`. A worker READS IT before building.

### M0-123 · queued — **`pipeline-readers.control.mjs`'S PLANT ARMS WRITE INTO A POINTER, SO THEIR PLANTED ROWS ARE INVISIBLE AND THE CONTROL MEASURES NOTHING.** Since M0-110 `docs/development/BACKLOG.md` on `main` is a 219 B `COORD-POINTER:` line; the control appends ZZ-41..ZZ-45 to it (its 200 B floor passes), and `readState` follows any file that BEGINS with the tag (`isPointer`, `tools/coord.mjs`) to `origin/coord`, so no reader sees a plant (verified at the code on `c5c83dc4`; M0-119's worker's finding). — owner M0.
order: with the instrument cluster, directly after M0-93: a control that cannot fail, D-438's class; behind the product rows (Bob, 2026-09-22, `CLAUDE.md` §2) (SCHEDULER #14, 2026-09-23)
milestone: M0
interface: none
design: `docs/development/VERIFICATION.md` (admitted for M0 by name): a control is evidence only when it fails at a named assertion; with `TREE-SHARING.md` §1's reading layer (`BIO_COORD_REF` names a planted ref).
depends-on: none — M0-110 is done.
scope: the control plants through a local ref named by `BIO_COORD_REF` (as `coord.test.mjs` does), never the working tree's pointer, and asserts before arming that the file it plants into is not a pointer.
accepts-when: every PLANT arm reads AS DECLARED, each failing by name with its plant in place, and the tree is byte-identical after. NEGATIVE CONTROL: plant into the pointer again, and the new not-a-pointer assertion fails by name.
added: 2026-09-23 · SCHEDULER #14 (M0-119's worker's finding via CONDUCT #14, verified at the code; `node tools/mintid.mjs M0`).

### M0-124 · queued — **THREE CONTROL ARMS DIE ON THE BASE ITSELF SINCE REC-167: `case-edition-conclusion.control.mjs` (d) and (e) and `caselifecycle.control.mjs` (c).** C-65.1 (`CASE_CONCLUSION_MOVED`) now refuses each fixture's ratification before the arm's break is reached, so the arms fail for a reason unrelated to what they declare. D-442's worker's finding, fix named (CONDUCT #14). — owner M0.
order: with the instrument cluster, directly after M0-123: controls that fail on an unbroken subject measure nothing, D-438's class; behind the product rows (SCHEDULER #14, 2026-09-23)
milestone: M0
interface: none
design: `docs/development/VERIFICATION.md` (admitted for M0 by name): *break only the thing* — a control that moves a second variable refutes nothing.
depends-on: none — REC-167 is on `main`.
scope: re-aim each arm to break only `op=publish`'s use of the conclusion reader, with a fixture whose ratification C-65.1 admits.
accepts-when: each of the three arms reads AS DECLARED: green unbroken, failing by name when armed; the files byte-identical after. NEGATIVE CONTROL: arm each against the unbroken base, and it stays green.
added: 2026-09-23 · SCHEDULER #14 (D-442's worker's finding via CONDUCT #14; `node tools/mintid.mjs M0`).

### D-424 · queued — **`nc-mk4.mjs`'S `machinewide` ARM ANCHORS ON `gate.member == null) return false;`, WHICH NO LONGER EXISTS IN `src/`, SO BOB #14'S VISIBILITY RULING HAS NO LIVE CONTROL.** The rule moved into `Store#leadReach` at REC-129 and REC-132 (`#positionalMember`; `who == null` returns null); the arm's anchor (`bio-plane/test/nc-mk4.mjs`, re-read on `619dfa65`) matches 0 times in `bio-plane/src/`, so the arm cannot arm, and `lead.test.mjs`'s `NEGATIVE CONTROL:` line still records it as run AS DECLARED on 2026-09-18. — owner M0 with RECORD.
order: with the instrument cluster, directly after M0-124: a control that cannot arm measures nothing, D-438's class; behind the product rows (Bob, 2026-09-22, `CLAUDE.md` §2) (SCHEDULER #15, 2026-09-23, LED-7 batch S15-1)
milestone: M0
interface: none
design: `docs/development/VERIFICATION.md` (admitted for M0 by name): a control is evidence only when it fails at a named assertion; *break only the thing*.
depends-on: none — REC-129 and REC-132 are on `main`.
scope: re-point the arm at `#leadReach`'s rule (widen the machine read to unfiltered where `who == null`), assert each anchor matches exactly once before arming, re-run the arm, and re-date `lead.test.mjs`'s `NEGATIVE CONTROL:` line with the result.
accepts-when: the `machinewide` arm reads AS DECLARED, failing by name on the member-token and organisation-key arms; the tree is byte-identical after. NEGATIVE CONTROL: restore the stale anchor, and the match-once assertion fails by name.
added: 2026-09-23 · SCHEDULER #15 (LED-7 batch S15-1; D-424's DEBT row of 2026-09-18, verified at the code; keeps its `D-` id).

### M0-94 · queued — **`bio-plane/test/m025-arm-census.mjs` PRINTS AN `UNCLASSIFIED` DRIVER, ONE EXITING NON-ZERO WITH NO PHRASE ITS MATCHER KNOWS** … (whole text: the cut archive)
order: directly after M0-93 and D-438, the two drivers it would turn red on landing: a gate that reports where it should fail cannot fail, M0-79's doctrine on the census side (SCHEDULER #7, 2026-09-21; D-355's route via CONDUCT #10)
milestone: M0
interface: none
design: `docs/development/VERIFICATION.md` (admitted for M0 by name), with the census's own D-333 and M0-78 … (whole text: the cut archive)
depends-on: M0-93, D-438.
accepts-when: a fixture driver exiting 1 with an unknown phrase turns the census exit 1, naming it; the population is stated. How a liar passes it: teaching the matcher the fixture's phrase … (whole text: the cut archive)
added: 2026-09-21 · SCHEDULER #7 (`node tools/mintid.mjs M0`).
cut: cut to its fields by SCHEDULER #12 (2026-09-22, the backlog's 150 KiB budget); the row as it stood before this cut is VERBATIM under «M0-94» in `docs/archive/ledgers/QUEUE-cut-2026-09-22.md`. A worker READS IT before building.

### D-380 · queued — **ON A FRESH WORKTREE `ocr-worker`'S SUITE IS SILENTLY UNRUN WHILE THE BATTERY READS GREEN, AND ITS SKIP GIVES A REMEDY THAT** … (whole text: the cut archive)
order: with the instrument cluster, directly after M0-94: a gate reading green over a suite that did not run, M0-79's doctrine on the fleet side; below M0-94 because the `fleet:` line names the dark member on every run (SCHEDULER #10, 2026-09-21, LED-7)
milestone: M0
interface: none
design: `docs/development/VERIFICATION.md` (admitted for M0 by name), with `MEASUREMENTS.md` M-31 §6: the … (whole text: the cut archive)
depends-on: none.
accepts-when: with only `bio-plane/` installed, the battery runs every fleet suite and names no member dark; a member that truly cannot resolve is told a remedy that works for it. How a liar … (whole text: the cut archive)
added: 2026-09-21 · SCHEDULER #10 (LED-7; D-380's DEBT row of 2026-09-16, verified at the code; keeps its `D-` id).
cut: cut to its fields by SCHEDULER #12 (2026-09-22, the backlog's 150 KiB budget); the row as it stood before this cut is VERBATIM under «D-380» in `docs/archive/ledgers/QUEUE-cut-2026-09-22.md`. A worker READS IT before building.

### D-427 · queued — **THE UI HARNESS RUNNER JUDGES A SUITE BY ITS EXIT STATUS ALONE, SO A UI SUITE THAT PRINTS A FAILURE AND EXITS 0 READS `PASS`.** `civicos-ui/test/run.mjs` (re-read on `619dfa65`) prints `PASS` whenever `execFileSync` returns; M0-67's cross-check in `bio-plane/scripts/battery.mjs` (a printed failure with exit 0 is RED, `EXIT/TALLY DISAGREE`) never reached the UI estate. Latent (no UI suite is known to do it), but M0-126 will cache a unit's PASS, so a false one would stop re-running. — owner M0 with UI.
order: with the instrument cluster, directly after D-380: a gate reading green over a suite that failed, M0-79's doctrine on the UI side; below D-380 because no UI suite is known to print a failure and exit 0 (SCHEDULER #15, 2026-09-23, LED-7 batch S15-1)
milestone: M0
interface: none
design: `docs/development/VERIFICATION.md` (admitted for M0 by name): verify by the positive artifact, never the absence of an error.
depends-on: none — M0-67's cross-check is on `main`.
scope: `run.mjs` reads each suite's printed tally and fails a suite whose tally reports a failure while it exits 0, naming it `EXIT/TALLY DISAGREE` as `battery.mjs` does, through ONE shared reader rather than a copy.
accepts-when: a planted UI suite printing one failure and exiting 0 turns the harness red naming it; every real suite still reads as today. NEGATIVE CONTROL: drop the tally read, and the planted arm reads PASS and fails by name.
added: 2026-09-23 · SCHEDULER #15 (LED-7 batch S15-1; D-427's DEBT row of 2026-09-18, verified at the code; keeps its `D-` id).

### M0-129 · queued — **`civicos-ui/test/bound-sweep.test.mjs`'S METHOD-HEAD PATTERN SKIPS `async` METHODS, SO AN ASYNC OP'S BOUND IS NEVER SWEPT.** `methodBodies` matches `^ {2}(?:static\s+)?name(` (re-read on `cdfaea39`); an `async` method has no head, so its body is folded into the method above it. Found by D-85's worker (CONDUCT #15). — owner M0 with UI.
order: with the instrument cluster, directly after D-427: a sweep blind to a class of method, M0-79's doctrine; latent, since no swept op is known to be missed today (SCHEDULER #15, 2026-09-23)
milestone: M0
interface: none
design: `docs/development/VERIFICATION.md` (admitted for M0 by name): a check is evidence only where it can fail.
depends-on: none.
scope: admit `async\s+` (and `static async`) in the head pattern; state which ops, if any, newly enter the sweep and their verdicts.
accepts-when: a planted `async` method with an unbounded read is found and fails by name; every existing verdict unchanged or its move attributed. NEGATIVE CONTROL: drop the `async` alternative, and the planted arm reads clean and fails by name.
added: 2026-09-23 · SCHEDULER #15 (D-85's worker's finding via CONDUCT #15; `node tools/mintid.mjs M0`).

### M0-80 · queued — **FOUR REFUSAL CODES ARE PINNED GREEN BY ABSENCE RATHER THAN BY AGREEMENT** — the plane sends a canned `translation` for … (whole text: the cut archive)
order: with the instrument cluster and NOT beside UI-73, though they were routed together. A fixture narrower than the wire is a check that cannot fail — M0-78's doctrine exactly — whereas UI-73 is a surface correction. CLAUDE.md §5: an equality that costs nothing to produce is not evidence (SCHEDULER #3, 2026-09-19)
milestone: M0
interface: none
design: `docs/development/VERIFICATION.md` (admitted for M0 by name) — a suite is evidence only where it can … (whole text: the cut archive)
depends-on: none. Measured in `docs/development/MEASUREMENTS.md` M-72 (UI-72, 2026-09-19).
accepts-when: each of the four pins DISAGREES with the plane when the translation is wrong, proved by feeding a wrong one; the narrower-than-wire count is printed per suite and floored. How … (whole text: the cut archive)
added: 2026-09-19 · SCHEDULER #3 (CONDUCT #7's routed item 4; `node tools/mintid.mjs M0`).
cut: cut to its fields by SCHEDULER #12 (2026-09-22, the backlog's 150 KiB budget); the row as it stood before this cut is VERBATIM under «M0-80» in `docs/archive/ledgers/QUEUE-cut-2026-09-22.md`. A worker READS IT before building.

### M0-92 · queued — **`tools/rowdesign.mjs` PASSES A DESIGN POINTER TO A FILE THAT DOES NOT EXIST.** `citations()` drops a full `docs/…md` path … (whole text: the cut archive)
order: with the instrument cluster, after M0-80 and above M0-87: a check that PASSES where it should fail — CLAUDE.md §5's costs-nothing green — where M0-87 is a false WARN; latent today (0 dead paths across `QUEUE.md` and `BACKLOG.md`, measured 2026-09-21) (SCHEDULER #6, 2026-09-21; the D-339 worker's DELEGATION item 4)
milestone: M0
interface: none
design: `docs/development/VERIFICATION.md` (admitted for M0 by name), with the tool's own header: it cannot … (whole text: the cut archive)
depends-on: none.
accepts-when: a fixture row citing a wrong directory is reported dead by name; the right full path still passes; a bare unique basename still resolves. How a liar passes it: dropping the … (whole text: the cut archive)
added: 2026-09-21 · SCHEDULER #6 (`node tools/mintid.mjs M0`).
cut: cut to its fields by SCHEDULER #12 (2026-09-22, the backlog's 150 KiB budget); the row as it stood before this cut is VERBATIM under «M0-92» in `docs/archive/ledgers/QUEUE-cut-2026-09-22.md`. A worker READS IT before building.

### D-437 · queued — **REC-76's VERDICT READER SAYS IT READS EVERY BOOLEAN-PRODUCING OPERATOR, AND READS SIX: `<=`, `>=`, `instanceof` and `in` are** … (whole text: the cut archive)
order: with the instrument cluster, after M0-92: a reader blind to an operator class but latent, a `gap` as its row classifies it (D-378's precedent), so below the controls red today (SCHEDULER #7, 2026-09-21; the D-254 worker via CONDUCT #10)
milestone: M0
interface: none
design: `docs/development/VERIFICATION.md` (admitted for M0 by name), the section … (whole text: the cut archive)
depends-on: none. **Sequence after D-438**: the guard's harness reads the reader's figures.
accepts-when: each operator's reading passes; each moved figure is attributed to the print it came from. How a liar passes it: a floor nudged to fit, so every move cites its print. NEGATIVE … (whole text: the cut archive)
added: 2026-09-21 · SCHEDULER #7 (LED-7; the D-254 worker's DEBT row; keeps its `D-` id).
cut: cut to its fields by SCHEDULER #12 (2026-09-22, the backlog's 150 KiB budget); the row as it stood before this cut is VERBATIM under «D-437» in `docs/archive/ledgers/QUEUE-cut-2026-09-22.md`. A worker READS IT before building.

### M0-87 · queued — **`tools/rowsubstrate.mjs` SCORES A ROW WHOSE EVERY CITED ANCHOR IS UNRESOLVABLE AS UNCOVERED, so `plancheck` prints a false** … (whole text: the cut archive)
order: with the instrument cluster, after M0-80: an instrument claiming about what it cannot see, the class the cluster closed three of (CONDUCT #8's DELEGATION 2026-09-20 item 2); a WARN, and latent, so below the rows that hide a failure (SCHEDULER #4, 2026-09-21)
milestone: M0
interface: none
design: `docs/development/VERIFICATION.md` (admitted for M0 by name), with the tool's own header … (whole text: the cut archive)
depends-on: none.
accepts-when: a fixture row whose only anchor is a bold paragraph is UNJUDGED or judged at document level, never a finding; a row whose resolved section lacks every symbol still is one. How … (whole text: the cut archive)
added: 2026-09-21 · SCHEDULER #4 (`node tools/mintid.mjs M0`).
cut: cut to its fields by SCHEDULER #12 (2026-09-22, the backlog's 150 KiB budget); the row as it stood before this cut is VERBATIM under «M0-87» in `docs/archive/ledgers/QUEUE-cut-2026-09-22.md`. A worker READS IT before building.
