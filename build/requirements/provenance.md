# provenance — requirements

**Status** · APPROVED by Bob 2026-09-26 (a product module, P17; K67). DRAFT by BOB #41, 2026-09-26 (P18), from a drafting worker's reading of the code, reviewed by BOB (K47–K49). Layer 3. Code today: inside the legacy modules. `bio-plane/src/store.mjs`: the register write inside `promote` (~19905–19925) and `#testimonyFence` (22265–22376); `testify` with `testimonyBytes`, `observerRef` (21880–21930, 22377–22620); `chainFromEvidence`, `provenanceChainRebuild`, `routeFinding`, `provenanceRouteAssess`, `provenanceRoutesMarked` (16457–17196); `registerAudit`, `#partsNamedFor` (35485–35544); `homeCensus`, `registerHolds` (36562–36654); `recordCapturedLocator`, `capturedLocators` (40800–40995); `versionChain` (40995–41137). `bio-plane/src/index.mjs`: the handlers of `op=attest` (10169–10318) and `op=registeraudit` (7247–7311), and `partsHeld` (4560–4598). `schema.mjs`: `register` (85–107, K23), `captured_locators` (566–586), `provenance_route_marks` (2902–2984). The C-18 register arms run today in `bio-plane/checks/bio-checks.mjs` (`checkBundle`, at the gate). Not yet met: R24–R26 (D-177, D-693, D-709), R12 (D-580, this module's by K49), R21–R22 (REC-158), R29–R30 (REC-225), R47 (K49), R34 (Open for Bob). D-698 is `capture`'s (its R18). Old-plan rows naming `provenance`: D-580, D-693, D-709, REC-225, REC-158.

## Public

### Purpose

Holds the record's trust root: the register, which says which bundle is the one home of each captured byte sequence; the plane's own acquisition receipts, which say which bytes it fetched from which address, by which route and when; each document's chain of hops and the capture grade its route earns; trusted timestamps over capture hashes; and a member's firsthand observation, the one capture whose bytes are a person's own words. A hop attests bytes, address and time, never the credibility of the content.

### Provides

Terms. A **capture** is a byte sequence named by its lowercase hex SHA-256 (`captureSha`). A **home** is the bundle a register row assigns a capture to; a home counts only while that bundle exists. A **viewer** and **sight** are `membership`'s (R43, R44). Every refusal names a `reason`; a refusal with a catalogue row also carries its `check` id and `translation`.

**The register, written inside a promotion.** This module registers a check and a projection with `promotion.registerStep` (K31). A promotion's `register` list (`[{sha256, path, encoding, bytes}]`) and its `data/provenance.json` reach this module's tables only through them, inside the promotion's one transaction.
- **R1** The register holds one row per capture: `capture_sha` (the key), the home `bundle_id`, `path`, `encoding` (default `utf8`), `bytes`, `registered` (this module's clock at the write, never a caller's time), and `authored`, `author`, `observed_at`. A revision re-registering a capture under the same bundle updates path, encoding, bytes and registered, never clears `authored` once set, and keeps `author` and `observed_at` when the revision gives none.
- **R2** One capture, one home. A promotion that registers a capture already registered under a different bundle that still exists is refused `CAPTURE_HELD_BY_ANOTHER_BUNDLE` (C-53.13) before anything is written. The holder is named only when the promotion carries no caller identity or the caller's viewer may see the holder; otherwise `holder` is `null` and the words say "another bundle". A home whose bundle is gone does not count: its capture registers afresh.
- **R3** `authored` is 1 only for the capture `testify` (R28) writes; nothing a caller sends can set or clear it. The promotion is refused `TESTIMONY_AUTHORED_UNEARNED` (C-53.8) when it registers a capture that is another bundle's authored observation, or when a `data/provenance.json` document claims `authored` for a capture that is not this bundle's authored observation; `TESTIMONY_AUTHORED_DROPPED` (C-53.9) when this bundle holds an authored observation and the new `data/provenance.json` no longer states `authored: true` for it, or cannot be parsed; `TESTIMONY_ORIGIN_NOT_MEMBER` (C-53.7) when an authored document's `origin.kind` or `capture.actor_class` is not `member`. These are asked before R2's refusal.
- Errors: every refusal refuses the whole promotion (promotion R2). Never throws for a well-formed package.

**homeOf(captureSha) → `{bundleId, path, encoding, bytes, registered, authored}` or null**
- **R4** Answers the capture's home from the register, or `null` when no row names it or its bundle no longer exists. The author of an authored row is never in this answer.
- Errors: never throws.

**registerHolds({sha, bundle}) → `{ok, sha, asked, registered, acquired, parts?}`**
- **R5** `registered` is true exactly when a register row names `sha` under a bundle that exists; `acquired` is true exactly when an acquisition receipt (R13) names `sha`. With `bundle`, `parts` is `partsNamed(bundle, sha)` (R6). A `sha:` prefix and case are ignored. With no `sha`, answers `asked: false` and `null` for both.
- Errors: never throws.

**partsNamed(bundleId, sha) → `{state: "none"}` | `{state: "named", parts: [{file, sha256, bytes}]}` | `{state: "unreadable", why}`**
- **R6** Reads the parts the holding bundle's `data/provenance.json` names for `sha` (the document whose `capture.sha256` is `sha` and that carries `parts`). `unreadable`, with the reason, when the file is held as a blob, does not parse, or names parts without a 64-hex digest and a non-negative integer size for each; `none` when the file or such a document is absent.
- Errors: never throws.

**partsHeld(bucket, keyOf, parts) → `{missing, disagree, unverified}`** `bucket` is the evidence store (`head`, `get`); `keyOf(sha)` its key for a digest.
- **R7** The one rule for a capture held in parts, used by the register audit, the ratify gate and publication's destination check (Intake Doctrine §8, D-556). A part is `missing` when no object is held under its digest; in `disagree` when its stored size differs from the record's, or its digest (the stored SHA-256 checksum, or for a part stored without one and no larger than 8 MiB, the digest of its bytes read back) differs; `unverified` when it has no stored checksum and is larger than 8 MiB. A part is never counted verified on its size alone.
- Errors: rejects only when the bucket rejects. *(An unreachable bucket is the caller's to report; see R9.)*

**registerAudit({head}) → report**
- **R8** Classifies every register row: `live` (the home's live file at `path` has this digest), `historical` (a history row of the home has it), `superseded` (the path now holds other bytes), `orphan` (the home is gone), else unresolved. Each unresolved row is probed in the evidence store: `captured` (held whole, size agrees), `mismatched` (size or a part's digest disagrees), `held_in_parts` (every part R6 names is held and verified by R7, and the parts' sizes sum to the row's), `unbacked` (not held, a part missing, or the home gone, each with its reason and any `missing_parts`), `undetermined` (R6 `unreadable`, or a part unverified).
- **R9** `sound` is true exactly when no row is `unbacked` or `mismatched`; `undetermined` rows are counted beside it, never inside it. Whether the parts reassemble to the whole's digest is not asked here (C-18.6). With no evidence store, every unresolved row is `unbacked` with that reason and `probed` is false. The answer carries at most 40 sample rows.
- Errors: never throws.

**homeCensus({limit}) → report**
- **R10** Read-only. Lists every capture the register assigns to one existing bundle while live files or history rows of a different existing bundle carry the same digest, as `{capture_sha, home, held_by: [{table, bundle_id, path, snap_key?}]}`, at most `limit` (default 50, at most 500) of them, with row counts per table and the count of register rows whose home is gone. `first_holder` is always `"UNDETERMINED"` and `rewritten` is always 0: nothing is repaired, and a digest the register assigns to no home is not listed.
- Errors: never throws.

**registeredFor(bundleId) → `[{capture_sha, path, bytes, encoding, registered, authored}]`**
- **R11** Every register row whose home is `bundleId`, in `capture_sha` order.
- Errors: never throws.

**capturesOf(bundleId) → `[{capture_sha, held_at}]`**
- **R12** The bundle's captures in the order the record first held them: `held_at` is the earliest of the row's `registered` and its earliest receipt's `first_retrieved`, both this instance's clock. A document's own stated date never orders them, and two clocks are never compared in one column. *(not yet met: D-580, K49 — `#captureForContent` orders `register.registered` against `readings.at`; content reads this order once fixed)*
- Errors: never throws.

**recordReceipt({address, addressNorm, captureSha, retrieved, via, retrievalLocator}) → `{recorded, address_norm, via, observation}`**
- **R13** The plane's own acquisition receipt: one row per (`addressNorm`, `captureSha`, `via`), `via` defaulting to `direct`. A new row starts at `observations` 1 with `first_retrieved` and `last_retrieved` both `retrieved`; a repeat widens the interval (the earlier first, the later last), adds 1 to `observations`, and keeps an existing `retrieval_locator` when none is given. `address` is kept as given beside its normalised form.
- **R14** `observation` is read from the record before the write, never from the caller: `new` when no row has this address and `via`, `unchanged` when one has these bytes, `changed` otherwise. With no `addressNorm` or `captureSha` it answers `{recorded: false}` and writes nothing.
- **R15** Only the plane's own acquisition writes receipts (`capture.acquire`, and monitoring's fetches); no op lets a caller write one.
- Errors: never throws.

**onReceipt(module, fn) → void** A later module's work on each receipt (K49; K31's pattern, promotion R39).
- **R47** A module registers `fn` once at start; a second registration by the same module is refused `LISTENER_DECLARED`. After each receipt write, every registered `fn` runs inside the same transaction, in the modules' total order, with `{address, address_norm, capture_sha, via, retrieval_locator, retrieved, observation}` (R14). A listener that refuses or throws does not undo the receipt; `recordReceipt`'s answer names each listener's outcome. This module calls no later module. *(not yet met: K49 — `recordCapturedLocator` writes the observation-log row itself)*
- Errors: never throws.

**receipts({addressNorm}) → `{address_norm, rows, observations}`**
- **R16** Every receipt for the address (all when none is given), ordered by `via`, and the sum of their `observations`.
- Errors: never throws.

**versionChain({addressNorm, at, limit, offset, viewer}) → `{ok, address_norm, documents, versions, count, total, limit, offset, truncated, at?, at_index?, predecessor?}` or refusal**
- **R17** The versions the record holds of one document address: one entry per capture that has both a receipt at the address and a register row whose home the viewer may see, with its receipts merged (earliest first seen, latest last seen, summed observations, the sorted set of `via`), ordered by `first_retrieved` then `capture_sha`. `limit` defaults to 200 and is clamped to 1..1000; `truncated` says whether versions lie past the page; `documents` is 1 when any version is held, else 0.
- **R18** With `at` (a capture sha): `at_index` is its position and `predecessor` the version before it, `null` for the oldest. Refusals: `VERSION_CHAIN_NO_ADDRESS` (C-24.1), `VERSION_CHAIN_BAD_ANCHOR` (C-24.3, not 64 hex), `VERSION_CHAIN_NO_SUCH_VERSION` (C-24.2, not held at this address or not visible).
- Errors: never throws.

**chainFromEvidence(doc, {instanceName, at}) → `{ok: true, hops}` | `{ok: false, missing}`**
- **R19** Pure. Reconstructs a provenance document's chain from fields it already holds, never from anything else: a fetched route (non-empty `locator` other than `in hand`, `retrieved`, `capture.method`) gives one hop by this instance, asserting "these bytes were served for <locator> at <retrieved>", `via: "direct"`; otherwise a named custodian (`custody.holder`, `custody.obtained`) gives one hop by that member, `via: "member"`. Every hop is `bound: false` and carries `reconstructed: {at, by, basis, from}` naming the fields it was read from. A recorded RFC 3161 timestamp is cited as evidence for the bytes and the instant, never as binding the address. Otherwise `missing` lists each absent field.
- Errors: never throws.

**provenanceChainRebuild({bundleId, apply, author, viewer}) → report or refusal**
- **R20** For a bundle the viewer may see, reports per register document `already_recorded`, `reconstructed` (R19) or `undetermined` with what is missing. With any `undetermined` document it writes nothing and answers `EVIDENCE_INSUFFICIENT` with the bundle's route finding (R22). With `apply` and at least one reconstruction, it promotes the bundle once with only `data/provenance.json` changed (every other file carried byte for byte, the bundle's type, group, state, dates and criticality unchanged, a document's own stated values never relabelled from the row) and answers `applied: true`. Refusals: `NO_AUTHOR`, `NO_BUNDLE`, `NO_SUCH_BUNDLE` (absent and unseen answer alike), `NO_REGISTER`, `UNPARSABLE_REGISTER`, `NO_DOCUMENTS`; a promotion's refusal is returned as it came.
- **R21** Reconstructing a chain is a named member's act: an author that is a machine identity (`isMachineIdentity`) is refused by name before anything is read. *(not yet met: REC-158 — any non-empty author, including a `token:<class>` stamp, is accepted, here and in R22)*
- Errors: never throws.

**provenanceRouteAssess({bundleId, author, viewer}) → `{ok, bundleId, appended, route, documents, detail}` or refusal; routeFinding(objectType, mark) → finding; provenanceRoutesMarked({after, limit, viewer}) → page**
- **R22** A member's assessment of whether an information bundle's route can be shown. Refusals: `ROUTE_MARK_NO_AUTHOR` (C-34.1; REC-158 as R21), `ROUTE_MARK_NO_BUNDLE` (C-34.2), `ROUTE_MARK_NO_SUCH_BUNDLE` (C-34.3, absent and unseen alike), `ROUTE_MARK_NOT_A_DOCUMENT` (C-34.4). The register's state (`readable`, `absent`, `unparsable`, `no_documents`, `empty`) is recorded, never refused. Each document is `recorded`, `derivable` (R19) or `undetermined`; the finding is `LOOKED_INDETERMINATE` when the register is not readable or any document is undetermined, else `PRESENT`. A mark is appended (next `seq`, by, at, the bundle's state at that moment) only when it differs from the latest; the bundle's state and bytes never move. *(not yet met: REC-158, as R21)*
- **R23** `routeFinding` reads the latest mark: `NEVER_LOOKED` when there is none, stated as the question never asked, never as a finding; not applicable to a bundle that is not information. `provenanceRoutesMarked` pages the bundles whose standing mark is `LOOKED_INDETERMINATE`, in id order after `after`, `limit` default 50, at most 200, `truncated` from reading one past the page, `cursor` the last id read; bundles the viewer may not see are withheld and counted nowhere. It adds a census over the visible information bundles (`documents_visible`, `assessed`, `never_assessed`, `standing` by finding, `marked`), `complete` exactly when none is never assessed, and when the page is empty a `cause` of `no_documents_visible`, `never_assessed`, `none_standing` or `page_exhausted`.
- Errors: never throws.

**captureGrade(captureSha) → `{grade, route, determined, basis}`** The capture axis for one capture, from its route.
- **R24** A capture held by a direct receipt earns `EARNED_CAPTURE_CEILING` (B) as a measured value, `route: "direct"`. *(not yet met: D-177 — no per-capture grade exists; the ceiling is applied, and a member-authored letter under it stands unmeasured)*
- **R25** A capture whose only receipts are an archive replay (`via: "archive.org"`) earns `ARCHIVE_CAPTURE_GRADE`, the letter one rank below `EARNED_CAPTURE_CEILING` in `BASIS_GRADES` (C), as a measured value, `route: "archive"`. `ARCHIVE_CAPTURE_GRADE` has one definition, exported for every reader. *(not yet met: D-693)*
- **R26** A capture with no recorded route (no receipt; a document with no locator) answers `route: "unrecorded"`, `determined: false`: its grade is the member's authored letter under the ceiling, stated as authored, never as measured. A via no ruling names answers `CAPTURE_GRADE_VIA_UNRULED`, undetermined. *(not yet met: D-709)*
- **R27** A member's authored observation (R1 `authored`) earns no capture letter: `grade: null`, `determined: false`, `basis: "CAPTURE_AXIS_AUTHORED"`; its grade is `TESTIMONY_GRADE` (D) on the testimony axis, which nothing raises. No letter above `EARNED_CAPTURE_CEILING` is ever earned.
- Errors: never throws.

**testify({words, observedAt, title, author, claimedAuthor}) → `{ok, bundle_id, bundle_sha, capture_sha, file, bytes, words_bytes, content_id, authored, origin, actor_class, author, observed_at, recorded_at, axes, says}` or refusal**
- **R28** Records a member's firsthand observation as a new information bundle at `collected`. `author` is the plane's stamp from the session. Refusals, in order: `TESTIMONY_NOT_A_MEMBER` (C-53.1: empty or machine author); `TESTIMONY_AUTHOR_SUPPLIED` (C-53.2: the request named an author); `TESTIMONY_NO_WORDS` (C-53.3); `TESTIMONY_WORDS_TOO_LONG` (C-53.4: over 128 KiB of UTF-8, never truncated); `TESTIMONY_OBSERVED_AT_INVALID` (C-53.5: not a real date or UTC instant, or later than the record's clock); the producing group's absence (no id spent); `TESTIMONY_WORDS_REGISTERED` (C-53.6: the canonical bytes are already registered). The id is `INFO-<year>-NNNN-observation`. The bytes are `bio-testimony/1\nid: <id>\nobserved_at: <observedAt>\n\n<words>`, so identical words from two members are two captures, and no author identity is ever in the bytes or the bundle's files, which name the observer only as `observer:<id>`. The register row is authored (R1, R3) with the stamped author and `observedAt`; the record's time of writing is kept apart from `observedAt`. The answer's `axes` state capture undetermined (`CAPTURE_AXIS_AUTHORED`), connection undetermined, and testimony `TESTIMONY_GRADE`.
- Errors: a promotion's refusal is returned as it came. Never throws for a well-formed call.

**declareOrigin({bundleId, system, by, viewer}) → record or refusal; originOf(bundleId) → `{system, by, at}` or null**
- **R29** A member's attributed declaration of the system a document came from, for a host that serves many offices ("a host is not an origin"): per document, dated, append-only, the latest standing. A machine identity is refused by name; a bundle the viewer may not see answers as absent. *(not yet met: REC-225)*
- **R30** `originOf` answers the standing declaration, or `null`; a reader of a document's origin asks it before any host-derived system. *(not yet met: REC-225)*

**attest({sha256, archive, locator}, {head, put, fetch}) → `{ok, attempts, archive?, attestation?, held?, note}` or refusal**
- **R31** `sha256` must be 64 hex (`BAD_SHA`). When no object is held under it: an acquisition receipt naming it lets the attestation proceed, answering `held: {form: "parts", on: "acquisition_receipt"}`; a register row alone is refused `CAPTURE_HELD_IN_PARTS` (C-89.1), which does not call the bytes missing; neither is `NO_SUCH_CAPTURE`, saying what was asked, and whether the store could be asked.
- **R32** Asks the timestamp authorities in `signatures.TSA_ENDPOINTS` order, each with a fresh RFC 3161 request over the digest, and stops at the first response `parseTimestampResponse` accepts as bound to it. The token is stored in the evidence store under its own SHA-256 and named `snapshots/timestamp-<first 12 hex>.tsr`, `kind: "rfc3161"`, `over` the capture. Every attempt, failed or not, is in `attempts` with its service, instant and outcome. No token answers `ok: false`, `reason: "NO_ATTESTATION"`. The token's signature is not verified here, and the answer says so.
- **R33** With `archive: true` and a public https `locator`, also asks the co-archive (`signatures.ARCHIVE_SAVE_BASE`) and records the archived locator from `archiveLocatorFrom`, or the failed attempt. Without it, no archive is asked.
- **R34** When this instance files an archive-sourced capture, it signs its own receipt: that on this date it fetched these bytes from this retrieval locator and they hashed to this value. The signing key is the instance's own, one per instance, held as a secret and replaceable by the operator; a receipt signed before a replacement stays verifiable against the public key it was signed with (Bob, K59). *(not yet met: ARCHIVE-FALLBACK §Shape on the capture; the plane holds no key today)*
- Errors: never throws for a well-formed call; an authority or archive failure is an attempt, never a throw.

**The register's read contract** (K72)
- **R48** The tables `register` (its capture digest, `bundle_id` and path columns) and `captured_locators` (its locator and capture digest columns) are a stated read contract: a later module may join them in its own SQL, and this module changes none of those columns' names or meaning without a change to this requirement. Every write to them stays this module's.

## Private

### Uses

- `legacy-checks`: `TESTIMONY_CHECKS` (C-53.1–C-53.9, C-53.13), `ROUTE_MARK_CHECKS` (C-34), `VERSION_CHAIN_CHECKS` (C-24), `ATTEST_CHECKS` (C-89.1); `EARNED_CAPTURE_CEILING`, `BASIS_GRADES`, `TESTIMONY_GRADE`, `isMachineIdentity`, `isPublicHttpsLocator`, `OBSERVATION_STATES`.
- `signatures`: `timestampRequest`, `parseTimestampResponse`, `TSA_ENDPOINTS`, `TSA_CONTENT_TYPE`, `TSA_ACCEPT`, `ARCHIVE_SAVE_BASE`, `ARCHIVE_SERVICE`, `archiveLocatorFrom`.
- `record-core`: `transact`, `readImage`, `bundleInfo`, `allocId` (the observation's id), `getSetting` (the instance name), `declarePurge` (`register`, `captured_locators`, `provenance_route_marks`), and the evidence store (`head`, `get`, `put` by digest with integrity; K49) for R7–R9 and R31–R32.
- `membership`: `viewerPredicate` and `sight` (R2's holder, R17, R20, R22, R23, R29); the producing group (R28; not yet a named service in membership's Provides).
- `promotion`: `promote` (R20, R28) and `registerStep` (R1–R3, R42–R46).

### Invariants

- **R35** The register is the only thing that proves bytes: every answer about whether the record holds a capture reads the register or a receipt, never a caller's claim. A register row is written only inside a promotion (R1), a receipt only by the plane's own fetch (R15).
- **R36** A hop a caller can hand in is a hop a caller can invent: every hop this module writes is derived from fields the record already held (R19) or from a fetch this instance made; none is read from a request.
- **R37** Undetermined is stated, never rounded: an unreadable register, an unverified part, a route that cannot be shown and a first holder are each reported as undetermined with the reason, and never counted as sound, present or absent (R8, R9, R10, R22).
- **R38** A member's authored observation stays one: its flag is set only by R28 and never cleared, its origin and actor class stay `member`, and its words are never paraphrased or rewritten (C-53.7–C-53.9).
- **R39** Network calls are made only by `attest`, only to the compiled endpoints `signatures` names.
- **R40** No place is named in this module's behaviour or outward text (`layers.md`, "No jurisdiction in the product").
- **R41** This module owns `register`, `captured_locators` (the acquisition receipts) and `provenance_route_marks`; no other module writes them (K49).

*The register's checks at the gate (C-18, K49).* Registered with `promotion.registerStep` as checks on the promoted package's `data/provenance.json`, for an information bundle whose register is present; each keeps its catalogue id and severity.
- **R42** C-18.1 (error): the register is `{documents: [...]}`; each document is an object naming `file` (present in the bundle), `locator` and `retrieved`; `authority`, or `authority_state` `undetermined`, with an `authority_basis` in both states; a `capture` block with `method`, a `grade` in `CAPTURE_GRADES` (none for an authored observation) and a declared `actor_class`; an `origin.kind` in `ORIGIN_KINDS` (`sweep` with `matched_sweep` and `deeming_actor`; `member` for an authored observation). A `collected → verified` transition is authored by a named member, never a machine identity, and a sweep-origin bundle reaches `verified` only through such a transition.
- **R43** C-18.3 (error): one capture appears once in a register: two documents with the same `capture.sha256`, or with the same determined evidentiary digest and different raw bytes, are refused as corroboration missed; an undetermined evidentiary digest is never compared.
- **R44** C-18.4 (warn): a `crucial` document whose entry carries neither `co_archive` nor `timestamp` is flagged for a member to verify co-attestation before release.
- **R45** C-18.6 (error): every registered capture's stored bytes (whole, or its parts streamed in order) hash to the recorded `capture.sha256`; bytes that cannot be decoded are refused with the reason.
- **R46** C-18.9 (error): a document at or past `verified` records a non-empty `provenance_chain` whose every hop names its attestor, and states its authority or, when undetermined, its `authority_basis`; no chain, a non-array chain and an empty chain are three distinct findings.

### Satisfies

- `docs/architecture/BIO_System_Design.md` §3, construct 2 (intake, capture and provenance: the trust root, the chain of hops).
- `docs/architecture/BIO_Intake_Doctrine_v1_1.md` §1a (admission requires provenance), §2 (provenance per document), §3 (the capture-chain axis, co-attestation by trusted timestamp and co-archive), §3a (member-original records), §3b (SHA-256, RFC 3161, plain JSON), §8 (one capture, one home; the census; what `existed` and attest may claim; a capture held in parts).
- `docs/architecture/BIO_State_Rules_Consistency_v1_5.md` §4.1 (the intake provenance register and its daemon-era anatomy), §6 I-18.
- `docs/development/AUTHORITY-AND-TRUST.md`, RULED: transitive trust with disclosure (the chain, grade a function of the chain); an alternative source counts as a re-fetch (the `via` column); what publication requires (provenance authority).
- `docs/development/ARCHIVE-FALLBACK.md` §Shape on the capture, §Same document, two sources.
- `docs/development/MEMBER-KNOWLEDGE-DESIGN.md` §2, §3, §4.1.
- `docs/development/LINK-FIDELITY.md` §A re-capture of a document the record already holds is the NORMAL case.
- `docs/architecture/BIO_Content_Framework_v0_10.md` §8.3 (a declared origin, REC-225), §14.2 (the fetch-path grade table, D-693).
- Rulings: DEC-19, DEC-56 (the route marker), DEC-21 (the capture axis), D-179 and REC-190 (BOB #26, #31, #32), D-533, D-530, D-556 (BOB #33, #34), D-693 and D-709 (BOB #35).

### Suggestions

- **Checks carried here.** C-53.1–C-53.9, C-53.13, C-34.1–C-34.4, C-24.1–C-24.3, C-89.1 and the C-18 register arms (R42–R46) move with this module. Of the rest of C-18, C-18.5 (`gathering.json`) goes to monitoring and C-18.7 stays with C-18.8 in promotion (K49). C-53.10–C-53.12 are publication's.
- **What stays out.** `testimonyReach`, `observationsNamingAuthor` and `attributeObservation` read inquiry basis and attribution tables (later modules); `attestText`, `transcriptionAttest` and `text_attestations` are extraction's; `projectLinks` writes `refs` (connections, K23).
- **Testify's later work.** Today `testify` hands `promote` a hook that indexes the words, mints the content row and logs an extraction observation. Under K31 those become projections `extraction`, `content` and `observation-log` register for an authored register row, so this module calls none of them.
- **The receipt's observation row.** Observation-log (layer 5) registers its OBSERVATION-LOG-DESIGN §4.1 writer through R47; `capture`'s reuse-verdict rows can use the same pattern.
- **The evidence store** (the R2 working bucket) is `record-core`'s, added to its requirements before T3 (K49); until then `attest`, `registerAudit` and `partsHeld` take it through injected callbacks.
- **Testify is here** (K49): the authored flag's only writer and its fence live in one module.
- `homeCensus` walks every `files` and `history` row: an unbounded scan, admin-only today. Keep it admin-only or page it.
- Tests: each *(not yet met)* id gets a negative control reproducing its row. D-177, D-693, D-698 and D-709 have built work on `land/worker/D-177`, `D-693`, `D-698`, `D-709` (snapshot branch), judged at the job.


## Open for Bob

None (R34's key ruled by Bob, K59).

