# ratification (T34)

**Status** · session_01EQL9vA1G3VmWTpzuXvQNzy · depth 2 · COMPLETE · handled B3

## Completion (T34-85, with its T34-87 rows; K1824's deletion)

**Entries applied.**
- **K1824 (the split).** I merged `tranche/T34` once case-catalogue had merged (K1829) and deleted my copy of the moved catalogue. `checks.mjs` now holds the refusal rows and `export * from "../case-catalogue/checks.mjs"` (the pure file, K1317), so no importer changes. Both registrations with promotion are unchanged (R8, R9). From `checks.test.mjs` I deleted the pure arms the seam read §5 lists (case-catalogue's job holds them, re-labelled). In their place is a test that every name case-catalogue exports is the same binding from this module's `checks.mjs` and `index.mjs`.
- **T34-85 (DEC-147).**
  - `op=publishat` (R40). The Worker half shares `op=caseratify`'s handler up to the commit, so every refusal is byte-identical and in R2's order; `MALFORMED` also covers an absent `at`. The store half `publishAt` runs R3's refusals before its commit, through `#casePlan`, which `op=caseratify`'s commit now shares. It then makes publication's commit and rolls it back (a nested `transact` answering a sentinel refusal), so a refusal is the commit's own (R51, R58, R59 and any later one) and nothing is written. Then comes `SCHEDULE_UNCHECKABLE` (C-58.6) when R41 cannot be read. Otherwise it calls `publication.scheduleEdition` (R66) and relays its answer. When the edition already waits, R66 is called again with the waiting entry's own `checked`, so the same signature and `at` get R66's `existed`.
  - R41's `checked` (`schedule.mjs` `checkedOf`). Four parts, each in canonical JSON with ordered lists:
    - `sources`: each `sources:` row with whether it still stands, by `case-carriage.sourcesLapsed`; and each `accepted_work:` row's acceptance and undisclosed flags, by `acceptedWorkLapsed`, read as the signer.
    - `ties`: the signer's declared ties (`people.tiesConcerning`) to the `people:` rows' persons, the `member_ties:` tie entities, and the payers and payees (`money.readFact`) of the money facts the `people:` places name, as BOB agreed in J1 (3).
    - `holds`: actions R69's answer for the case's project, and `stampsOf` for every ratified edition of the case.
    - `signer_key`: `SHA256:` and the unpadded base64 of the key blob's SHA-256.
    A read that throws or answers nothing is named as unreadable, never treated as a clear reading.
  - The scheduled publisher (R42, `publishScheduled`, async, as K1832 agreed). It checks the held signature against the signers active now, then re-runs `#casePlan` (caseAuthority with the recorded deliverer, C-65.1, `CASE_PRODUCTION_DIVERGED`), C-53.12, C-92.10, C-92.11, C-58.5 and the case gate at this run's version. It reads R41 again and compares (`checkedDiffers`). Stops are one entry per cause: C-58.7, C-58.8 or C-58.9 naming what changed, and C-58.10 carrying the refusal (or `UNREADABLE` with what could not be read) as its cause. Otherwise it commits through the same `#commitPlan` as R3, with R3's discharge and R36 in the transaction and R37 after it, and answers `{published: true, published_at}`. It never throws. R39's copy and R6's container run when it has a `worker: {env, stub, storeName}`. Without one they are named as not done, and a re-sent `op=caseratify` with the same signature converges them: its `existed` answer now carries `completedCase`, so the Worker assembles a complete edition that has no container (J1 (2), K1832).
  - R43: registered once at start with `publication.registerScheduledPublisher`. The call is guarded by `typeof` only until publication's R67 is on the tranche.
  - R44: the pre-flight answers `publish_at`, from the active profiles' `time_zone` through `jurisdictions.combine`.
  - R45: `registerHoldReader`; a second registration is `HOLD_READER_DECLARED`.
  - R46: rows C-58.6 to C-58.10.
  - R3: an edition that waits is refused `PUBLISH_AT_ALREADY_SET`, naming its time, before the commit.
  - R32: the `publishat` arm. `ratificationOp` routes `publishat`.
- **T34-87 / R47 (DEC-149).** C-32.14 and C-32.15 now say "for your group's Civicsmith". A test names both and checks that no row of this module says "this copy", "this instance" or "this plane". The CASE_UNSIGNED detail (`index.mjs`, was :729) stays, as BOB ruled (K1821 (3)).
- Rows C-32.14, C-32.15 and C-58.6 to C-58.10 await T35's stamp (accepted red 4). `CATALOG_VERSION` is promotion's, so it is not moved here.

**Deferred.** None of mine. `publication` R66, R67, R69 and R62 are not on the tranche yet (PUBLICATION #21 merges before me). My tests use stand-ins for them, shaped as the requirements word them; the commit is publication's real one. Once publication merges, I'll merge the tranche and re-run on a `CHANGE`.

**Found elsewhere (red on `tranche/T34` before my change, not mine).**
- `plane` `store.test.mjs` R2/R10: "case-catalogue is in the step order", since case-catalogue's merge.
- `affordances`: R19 (two arms) and "R40 R12: each new module's op map…".
- `case-checker` `program.test.mjs` R13: accepted red 6, from my merge until T34-47's.
- `plane` (T34-76, L11) owes passing `worker: {env, stub, storeName}` to `ratificationOf` (K1832; not a REPORT).

**Tests and checks** (on `job/T34/ratification`, tranche/T34 merged at 2f9b1f682e):
- `node --test bio-plane/test/m/ratification/`: tests 212, pass 212, fail 0. The new `schedule.test.mjs` has 19 tests.
- Modules that use ratification: case-authoring 137/137; affordances 189 pass, 3 fail (the same 3 on the tranche); plane 109 pass, 1 fail (the same on the tranche); case-checker 33 pass, 1 fail (R13, accepted red 6).
- `format`: 127 modules, 126 requirements files; 0 failures.
- `architecture ratification`: 26 product files, 133 relative imports; 0 failures.
- `coverage ratification`: 47 of 47 live requirement ids named by a test; 0 failures.
- `ownership ratification tranche/T34`: 12 files; 0 failures.

Size (session_01EQL9vA1G3VmWTpzuXvQNzy): test runs 14, module lines 3522 (src; tests 5401)

## J1 · QUESTION

Three seams for T34-85. I'm carrying on with my best reading of each and won't stop for the answer.

1. **The publisher is async (R42, publication R67).** R42 checks the signature again at `now` with `verifySshsig`, which uses WebCrypto and is async. So `publishScheduled(entry, now)` returns a Promise, and publication's `publishDue` has to `await` it. R66's waiting entry also has to give the publisher the signature it holds beside the document. The shape R66 lists doesn't name it, so I read `entry.signature` (falling back to `entry.sig_armored`), plus `doc_sha`, `signer`, `delivered_by`, `checked` and `set_by`. Please pass both points to PUBLICATION #21: await the publisher, and put the held signature on the entry.

2. **The steps after commit, run inside the Durable Object (R42 → R6, R39).** Copying materials into the published bucket (R39) and assembling the container (R6) need the Worker's `env` (CAPTURES, PUBLISHED) and a stub that reaches the plane's own ops. `plane/store.mjs:237` builds `ratificationOf(ctx)` with neither. My choice, per the Suggestion: `ratificationOf` takes an optional `worker: {env, stub}`. When it has one, R42 copies and assembles in-process. Without one, R42's answer names both steps as not done, and a re-sent `op=caseratify` with the same signature converges them: its `existed` answer now also copies the materials and assembles a complete case that has no container yet. R37's `openSeals` runs in-process either way. Plane (L11) needs to pass `worker` for this to work in a deployed copy. I'll file that as a REPORT unless you rule otherwise.

3. **Which entities R41's `ties` asks about.** My reading of K1816: the `people:` rows' `person`; the `member_ties:` rows' `entity`; and the payer and payee (`money.readFact`, read as the signer) of every money fact the `people:` rows' `places` name as `money <MNY-id>`. The signed bytes name no other money fact; the calculations block carries input hashes, not fact ids. The ties are read as `people.tiesConcerning({entities, member, viewer: member:<signer>})`, one signer (the verified signature's member). Each tie is recorded as `{tie_id, entity, withdrawn: false}` in `tie_id` order, because `tiesConcerning` answers only ties not withdrawn.
