# provenance — requirements

**Status** · APPROVED by Bob 2026-09-26 (a product module, P17; K67). DRAFT by BOB #41, 2026-09-26 (P18), from a drafting worker's reading of the code, reviewed by BOB (K47–K49). Layer 3. Code: `bio-plane/src/provenance/` (extracted from the legacy modules, since retired). `bio-plane/src/store.mjs`: the register write inside `promote` (~19905–19925) and `#testimonyFence` (22265–22376); `testify` with `testimonyBytes`, `observerRef` (21880–21930, 22377–22620); `chainFromEvidence`, `provenanceChainRebuild`, `routeFinding`, `provenanceRouteAssess`, `provenanceRoutesMarked` (16457–17196); `registerAudit`, `#partsNamedFor` (35485–35544); `homeCensus`, `registerHolds` (36562–36654); `recordCapturedLocator`, `capturedLocators` (40800–40995); `versionChain` (40995–41137). `bio-plane/src/index.mjs`: the handlers of `op=attest` (10169–10318) and `op=registeraudit` (7247–7311), and `partsHeld` (4560–4598). `schema.mjs`: `register` (85–107, K23), `captured_locators` (566–586), `provenance_route_marks` (2902–2984). The C-18 register arms run today in `bio-plane/checks/bio-checks.mjs` (`checkBundle`, at the gate). Not yet met: R24–R26 (D-177, D-693, D-709), R12 (D-580, this module's by K49), R21–R22 (REC-158), R29–R30 (REC-225), R47 (K49), R34 (Open for Bob). D-698 is `capture`'s (its R18). Old-plan rows naming `provenance`: D-580, D-693, D-709, REC-225, REC-158. N364 (Bob's ruling K509 (3): doorbell material is received, not fetched) folded by a worker for BOB #71, 2026-09-30 (T16 opening; W4 of `build/plan/draft-T16.md`): R51, and R15's writers gain `capture.pullKnock`; met in T16 (PROVENANCE #6, K538). T19 layer 3's wordings, by a worker for BOB #80 on `tranche/T19`, 2026-10-01, before layer 3 (rule 6 of `build/plan/current.md`; `build/extraction/legacy-store.md` §4.2 (1), (5), (6)): R28 re-worded and R52 (`onTestimony` and the testimony slot, run at the position `legacy-store`'s step holds today, K763) new; R55 (its count figures, record-core R63) new; R53 (`provenanceOps`, nine ops as `store.mjs` runs them) and R54 (the route-marker tally as record-core R68's `route` finding) new; R48 widened to `provenance_route_marks`' columns for `retrieval`'s `op=list` (its R63, layer 5). Each marked not yet met. T23, by a fold worker for BOB #94 at T23's opening, on `fold/T23-b` from `tranche/T23`, 2026-10-02: R56 (`instanceStatement`, `instanceSign`, `instanceKeys`, for `network-notices`; `build/plan/draft-network-notices.md`, DEC-111, K1031, K1100) added; R48 names `corpus-export` as the reader of `register.bytes` (N484, K1024; no change of meaning); both not yet met (T23 L3). N504 folded by a worker for BOB #98 at T24's opening, 2026-10-02: R57 (`instanceKeyBound`, whether an instance key is bound, asked without signing) new; not yet met (T24). N512 folded at T25's opening, by BOB from a worker's draft for BOB #100 (`build/plan/draft-T25-req/`; K1193; `build/plan/draft-T25-splits.md` P-1, P-2), with no change of meaning: the chain and the route marker split out to `provenance-routes` and co-attestation and the instance key to `attestation`, both layer 3 after this module (provenance, attestation, provenance-routes). R19–R23, R36 and R54 are retired as moved to `provenance-routes` R1–R7, and R31–R34, R39, R49, R56 and R57 as moved to `attestation` R1–R8, never reused; R37, R41, R48, R53 and R55 keep their other parts, wording only, their route or attestation parts moved (`provenance-routes` R8–R12); R40 is stated in both new modules too. R58 (the C-103 rows the new modules answer through) is added by BOB's ruling on the seam. The route side and the attestation side move whole in T25, each with its tables and every write to them (K1220, superseding the drafts' review's decision 1), so R53 (six ops) and R58 are marked not yet met (T25). Option B (BOB #100's review 1, as K1220 reads it) means only that this module's T25 job keeps pure copies of the names a later layer imports by name (`routeFinding`, `instanceStatement`, `ROUTE_MARK_CHECKS`, `ATTEST_CHECKS`) until each importer re-points; no stateful method and no table write is kept, and its T26 job deletes the copies (N516).

## Public

### Purpose

Holds the record's trust root: the register, which says which bundle is the one home of each captured byte sequence; the plane's own acquisition receipts, which say which bytes it fetched from which address, by which route and when; the capture grade a capture's route earns; and a member's firsthand observation, the one capture whose bytes are a person's own words. Each document's chain of hops and the route marker are `provenance-routes`'; trusted timestamps over capture hashes and the instance's key are `attestation`'s (N512). A hop attests bytes, address and time, never the credibility of the content.

### Provides

Terms. A **capture** is a byte sequence named by its lowercase hex SHA-256 (`captureSha`). A **home** is the bundle a register row assigns a capture to; a home counts only while that bundle exists. A **viewer** and **sight** are `membership`'s (R43, R44). Every refusal names a `reason`; a refusal with a catalogue row also carries its `check` id and `translation`.

**The register, written inside a promotion.** This module registers a check and a projection with `promotion.registerStep` (K31). A promotion's `register` list (`[{sha256, path, encoding, bytes}]`) and its `data/provenance.json` reach this module's tables only through them, inside the promotion's one transaction.
- **R1** The register holds one row per capture: `capture_sha` (the key), the home `bundle_id`, `path`, `encoding` (default `utf8`), `bytes`, `registered` (this module's clock at the write, never a caller's time), and `authored`, `author`, `observed_at`. A revision re-registering a capture under the same bundle updates path, encoding, bytes and registered, never clears `authored` once set, and keeps `author` and `observed_at` when the revision gives none.
- **R2** One capture, one home. A promotion that registers a capture already registered under a different bundle that still exists is refused `CAPTURE_HELD_BY_ANOTHER_BUNDLE` (C-53.13) before anything is written. The holder is named only when the promotion carries no caller identity or the caller's viewer may see the holder; otherwise `holder` is `null` and the words say "another record" (N458, K948). A home whose bundle is gone does not count: its capture registers afresh.
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
- **R12** The bundle's captures in the order the record first held them: `held_at` is the earliest of the row's `registered` and its earliest receipt's `first_retrieved`, both this instance's clock. A document's own stated date never orders them, and two clocks are never compared in one column.
- Errors: never throws.

**recordReceipt({address, addressNorm, captureSha, retrieved, via, retrievalLocator}) → `{recorded, address_norm, via, observation}`**
- **R13** The plane's own acquisition receipt: one row per (`addressNorm`, `captureSha`, `via`), `via` defaulting to `direct`. A new row starts at `observations` 1 with `first_retrieved` and `last_retrieved` both `retrieved`; a repeat widens the interval (the earlier first, the later last), adds 1 to `observations`, and keeps an existing `retrieval_locator` when none is given. `address` is kept as given beside its normalised form.
- **R14** `observation` is read from the record before the write, never from the caller: `new` when no row has this address and `via`, `unchanged` when one has these bytes, `changed` otherwise. With no `addressNorm` or `captureSha` it answers `{recorded: false}` and writes nothing.
- **R15** Only the plane's own acquisition writes receipts (`capture.acquire`, `capture.pullKnock` (its R65; N364), and monitoring's fetches); no op lets a caller write one.
- Errors: never throws.

**onReceipt(module, fn) → void** A later module's work on each receipt (K49; K31's pattern, promotion R39).
- **R47** A module registers `fn` once at start; a second registration by the same module is refused `LISTENER_DECLARED`. After each receipt write, every registered `fn` runs inside the same transaction, in the modules' total order, with `{address, address_norm, capture_sha, via, retrieval_locator, retrieved, observation}` (R14). A listener that refuses or throws does not undo the receipt; `recordReceipt`'s answer names each listener's outcome. This module calls no later module.
- Errors: never throws.

**receipts({addressNorm}) → `{address_norm, rows, observations}`**
- **R16** Every receipt for the address (all when none is given), ordered by `via`, and the sum of their `observations`.
- Errors: never throws.

**versionChain({addressNorm, at, limit, offset, viewer}) → `{ok, address_norm, documents, versions, count, total, limit, offset, truncated, at?, at_index?, predecessor?}` or refusal**
- **R17** The versions the record holds of one document address: one entry per capture that has both a receipt at the address and a register row whose home the viewer may see, with its receipts merged (earliest first seen, latest last seen, summed observations, the sorted set of `via`), ordered by `first_retrieved` then `capture_sha`. `limit` defaults to 200 and is clamped to 1..1000; `truncated` says whether versions lie past the page; `documents` is 1 when any version is held, else 0.
- **R18** With `at` (a capture sha): `at_index` is its position and `predecessor` the version before it, `null` for the oldest. Refusals: `VERSION_CHAIN_NO_ADDRESS` (C-24.1), `VERSION_CHAIN_BAD_ANCHOR` (C-24.3, not 64 hex), `VERSION_CHAIN_NO_SUCH_VERSION` (C-24.2, not held at this address or not visible).
- Errors: never throws.

**chainFromEvidence** (moved to `provenance-routes` by N512, K1193, T25; the ids are never reused)
- **R19** *(retired: moved to provenance-routes R1, N512, T25)*

**provenanceChainRebuild** (moved to `provenance-routes` by N512)
- **R20** *(retired: moved to provenance-routes R2, N512, T25)*
- **R21** *(retired: moved to provenance-routes R3, N512, T25)*

**provenanceRouteAssess, routeFinding, provenanceRoutesMarked** (moved to `provenance-routes` by N512)
- **R22** *(retired: moved to provenance-routes R4, N512, T25)*
- **R23** *(retired: moved to provenance-routes R5, N512, T25)*

**captureGrade(captureSha) → `{grade, route, determined, basis}`** The capture axis for one capture, from its route.
- **R24** A capture held by a direct receipt earns `EARNED_CAPTURE_CEILING` (B) as a measured value, `route: "direct"`.
- **R25** A capture whose only receipts are an archive replay (`via: "archive.org"`) earns `ARCHIVE_CAPTURE_GRADE`, the letter one rank below `EARNED_CAPTURE_CEILING` in `BASIS_GRADES` (C), as a measured value, `route: "archive"`. `ARCHIVE_CAPTURE_GRADE` has one definition, exported for every reader.
- **R26** A capture with no recorded route (no receipt; a document with no locator) answers `route: "unrecorded"`, `determined: false`: its grade is the member's authored letter under the ceiling, stated as authored, never as measured. A via no ruling names answers `CAPTURE_GRADE_VIA_UNRULED`, undetermined.
- **R27** A member's authored observation (R1 `authored`) earns no capture letter: `grade: null`, `determined: false`, `basis: "CAPTURE_AXIS_AUTHORED"`; its grade is `TESTIMONY_GRADE` (D) on the testimony axis, which nothing raises. No letter above `EARNED_CAPTURE_CEILING` is ever earned.
- **R51** (N364; K509 (3)) A capture whose receipt is route `doorbell` (`via: "doorbell"`, written by `capture` R65) answers `route: "doorbell"`, `determined: false`, `basis: "CAPTURE_RECEIVED_NOT_FETCHED"`: it earns no fetched letter; its grade is the member's authored letter under the ceiling, stated as authored, never as measured, and its existence at the pull's instant is proven by the receipt's timestamp (chain of custody from the knock's receipt).
- Errors: never throws.

**testify({words, observedAt, title, author, claimedAuthor}) → `{ok, bundle_id, bundle_sha, capture_sha, file, bytes, words_bytes, content_id, authored, origin, actor_class, author, observed_at, recorded_at, axes, says}` or refusal**
- **R28** Records a member's firsthand observation as a new information bundle at `collected`. `author` is the plane's stamp from the session. Refusals, in order: `TESTIMONY_NOT_A_MEMBER` (C-53.1: empty or machine author); `TESTIMONY_AUTHOR_SUPPLIED` (C-53.2: the request named an author); `TESTIMONY_NO_WORDS` (C-53.3); `TESTIMONY_WORDS_TOO_LONG` (C-53.4: over 128 KiB of UTF-8, never truncated); `TESTIMONY_OBSERVED_AT_INVALID` (C-53.5: not a real date or UTC instant, or later than the record's clock); the producing group's absence (no id spent); `TESTIMONY_WORDS_REGISTERED` (C-53.6: the canonical bytes are already registered). The id is `INFO-<year>-NNNN-observation`. The bytes are `bio-testimony/1\nid: <id>\nobserved_at: <observedAt>\n\n<words>`, so identical words from two members are two captures, and no author identity is ever in the bytes or the bundle's files, which name the observer only as `observer:<id>`. The register row is authored (R1, R3) with the stamped author and `observedAt`; the record's time of writing is kept apart from `observedAt`. The answer's `axes` state capture undetermined (`CAPTURE_AXIS_AUTHORED`), connection undetermined, and testimony `TESTIMONY_GRADE`. The words' later work is not this module's: it is R52's testimony slot (`content`'s extent check; `extraction`'s index, `content`'s mint, `observation-log`'s look), run inside the promotion's one transaction at the place control-plane's promotion step runs it (its R42, `src/control-plane/step.mjs`), and the answer's `content_id` is the one the slot names (`null` when none does).
- Errors: a promotion's refusal is returned as it came. Never throws for a well-formed call.

**onTestimony(module, {check?, project?}) → `{ok, module}` or refusal; testimonySlot() → `{check(c), project(c)}`** The testimony path's later work (`build/extraction/legacy-store.md` §4.2 (5); K31's pattern, as R47; a fixed slot in the step order, as `record-grammar` R28's slots, K763).
- **R52** A later module registers once at start a `check`, a `project`ion or both; a malformed registration, or a second by the same module, is refused through `membership`'s `listenerRefusal` (its R81: `LISTENER_MALFORMED`, `LISTENER_DECLARED`). This module does not run them in its own promotion step. It publishes them as one slot, `testimonySlot()`, whose `check(c)` and `project(c)` do nothing for a promotion without the testimony path (only R28's carries it) and otherwise run every registered `check`, then (after `commit`) every registered `project`, each once, in the modules' total order (`membership`'s `MODULE_ORDER`, R83: `extraction`, then `content`, then `observation-log`), with `{bundleId, captureSha, words, author, observedAt, recordedAt, earlier}`: the path's own fields as R28 wrote them, and `earlier` the answer of each projection run before it, by module. The first check that refuses refuses the promotion with its refusal as it came (promotion R2); a projection that throws is not caught, so the whole promotion rolls back and nothing of it is written (each registering module throws on its own refusal). The projections' answers are joined, in that order, into `project`'s answer as `testimony` (today `{indexed, content_id}`), present only on the testimony path (promotion R39). **The slot's position is today's** (P1, K763): the composition root runs it exactly where the legacy store's promotion step ran the testimony work (now control-plane's step, its R42), `check` at the end of that step's check (after its C-66.5 surfaced-by check, where the C-45 extent check stands) and `project` at the end of that step's projection (after the project-sight reindex, where `#testimonyWithin` stands), so every step's checks and projections, and the order of refusals, are those of today. Control-plane's composition root (layer 11) holds the slot at the same rank among the registered steps (after every step of layers 1–9, before `tasks`'), worded with its entry. With nothing registered the path writes the register row and the bundle only. This module calls no later module.
- Errors: never throws but as stated.

**declareOrigin({bundleId, system, by, viewer}) → record or refusal; originOf(bundleId) → `{system, by, at}` or null**
- **R29** A member's attributed declaration of the system a document came from, for a host that serves many offices ("a host is not an origin"): per document, dated, append-only, the latest standing. A machine identity is refused by name; a bundle the viewer may not see answers as absent.
- **R30** `originOf` answers the standing declaration, or `null`; a reader of a document's origin asks it before any host-derived system.

**attest** (moved to `attestation` by N512, K1193, T25; the ids are never reused)
- **R31** *(retired: moved to attestation R1, N512, T25)*
- **R32** *(retired: moved to attestation R2, N512, T25)*
- **R33** *(retired: moved to attestation R3, N512, T25)*
- **R34** *(retired: moved to attestation R4, N512, T25)*

**instanceStatement, instanceSign, instanceKeys, instanceKeyBound** (moved to `attestation` by N512)
- **R56** *(retired: moved to attestation R5, N512, T25)*
- **R57** *(retired: moved to attestation R6, N512, T25)*

**The register's read contract** (K72)
- **R48** The tables `register` (its `capture_sha`, `bundle_id`, `path`, `registered` and `authored` columns; `authored` 1 when a member authored the observation the entry holds, K182) and `captured_locators` (its `address_norm`, `address`, `retrieval_locator`, `capture_sha` and `first_retrieved` columns, the last as R13 states it; K243) are a stated read contract: a later module may join them in its own SQL, and this module changes none of those columns' names or meaning without a change to this requirement. `registered` is this module's clock at the register write (R1), an ISO instant, never a caller's time; `address_norm` is the document address as the acquisition that wrote the receipt normalised it (R13), the key a later module seeks a document address on. Every write to them stays this module's. *(widened by N111, K173)* The columns `register.bytes` (the registered capture's size in bytes, as the entry that registers it states it) and `register.author` (the member who authored an `authored` entry, stamped by this module, NULL on every other entry), and `captured_locators.via` (the receipt's source, R13, part of its key) and `last_retrieved` (R13's latest), are part of it too, on the same terms (N213, N484: `corpus-export` reads `register`'s `bundle_id`, `path`, `capture_sha` and `bytes` for the working-corpus export, its R1, moved from `publication` by K1024; N227, K276: `monitoring` R26 reads `via`). `first_retrieved` and `last_retrieved` are spelled whole-second UTC on every row, `YYYY-MM-DDTHH:MM:SSZ` (record-core R47's `"second"`), so a later module compares and brackets them as text in its own SQL (N133). The table `provenance_route_marks`' contract is `provenance-routes`' (its R8; N512).
**The ops map** (`build/extraction/legacy-store.md` §4.2 (6))
- **R53** The module publishes `provenanceOps(provenance, url, body, {observer})`, an object of route arms keyed by op name, each a function of no arguments that answers what the named service answers, reading its parameters from `url`'s query (the control plane's stamps among them, never the body's). It holds six ops, each with today's behaviour (`store.mjs`' explicit arms), no meaning changed: `testify`, `testify({words, observedAt, title, author, claimedAuthor})` (R28), `words`, `observedAt` and `title` from the body (null when absent), `author` the query's stamp, and `claimedAuthor` the first of the body's `author`, `observer`, `authoredBy`, `authored_by`, `by`, `member`, `memberId` that is neither undefined nor null (null when none, or no body); `versionchain`, `versionChain({addressNorm, at, limit, offset, viewer})` from `address` (already normalised by the control plane), `at`, `limit`, `offset`, `viewer` (R17, R18); `recordcapturedlocator`, `recordReceipt` (R13, R14, R47) over the body (`{}` when absent), its fields `authorityKind`, `authority`, `actorClass`, `actor`, `observe` (defaults null, null, `plane`, null, true) taken out as the listeners' `context` and the rest the receipt: an unrecorded receipt answers as `recordReceipt` does, a recorded one `{recorded: true, address_norm, via, observation, observation_written, observation_refused}`, the last two read from the outcome of the listener registered by the module the composition root names as `observer` (today `observation-log`; this module names no later module, R47): `observation_written` true exactly when that listener ran and answered `written: true`, `observation_refused` its answer when it refused, else null; `homecensus`, `homeCensus({limit})` (R10); `registerholds`, `registerHolds({sha, bundle})` from `sha256` and `bundle` (R5); `registeraudit`, `registerRows()`, the classification of every register row that the Worker's `op=registeraudit` finishes into R8's report (R8, R9). `viewer` and `author` are the control plane's stamps. Which credential reaches each op is `op-declarations`' and `control-plane`'s, never this map's. The legacy store's nine explicit arms were replaced by one spread of the map (K671); the store is retired. Its three route arms (`provenancechain`, `provenanceroute`, `provenanceroutes`) are `provenance-routes`' `provenanceRouteOps` (its R9; N512). *(not yet met: T25)*

**The route-marker tally on the audit** (moved to `provenance-routes` by N512)
- **R54** *(retired: moved to provenance-routes R6, N512, T25)*

**attestationsOf** (moved to `attestation` by N512)
- **R49** *(retired: moved to attestation R7, N512, T25)*

**A register entry's stated `bytes`** (N263)
- **R50** (N263) A promotion whose `register` list holds an entry whose `bytes` is absent, null, or not a whole number at least 0 is refused `REGISTER_BYTES_UNSTATED` (C-53.14, this module's row, its `where` naming the check's region), before anything is written. The refusal names the entry's `sha256` and `path`. An accepted entry's `bytes` is stored exactly as stated. This module does not compare it with the stored object's size (R7 and R8 read that).


**Its figures** (`build/extraction/legacy-store.md` §4.2 (2))
- **R55** This module's figure for `op=stats` and purge's proof, `register` (the `register` rows, keyed on `bundle_id`), registered once at start through `record-core`'s `registerCounts` (its R63), answering for `hid` (the bundles the caller may not see, or null for a whole count) the figure as `store.mjs`' `#counts` takes it today, no meaning changed: a figure keyed on a bundle column leaves out the rows whose column names a bundle in `hid`, a row whose column is null naming none and so counted; a figure with no such column counts every row. Synchronous, writes nothing. The legacy store's own lines for these figures were deleted with it (`build/extraction/legacy-store.md` §4.2 (2)). `routeMarks` is `provenance-routes`' (its R10; N512).

**The C-103 rows the split modules answer through** (N512; BOB's ruling on the seam, decision 6 of `build/plan/draft-T25.md`)
- **R58** This module exports `PROVENANCE_ACT_CHECKS` (C-103), each row `{check, where, translation}` with its code, number and translation unchanged, and `DOORBELL_ORIGIN` (R51's origin kind). `attestation` answers `RECEIPT_MALFORMED` (C-103.6) and `RECEIPT_NO_KEY` (C-103.7) through it (its R4, R5), and `provenance-routes` answers `NO_BUNDLE` (C-103.3) through it (its R2) and reads `DOORBELL_ORIGIN` (its R1); each row's `where` names the site that raises it, in whichever module that is. *(not yet met: T25)*

## Private

### Uses

- `legacy-checks`: `TESTIMONY_CHECKS` (C-53.1–C-53.9, C-53.13), `VERSION_CHAIN_CHECKS` (C-24); `EARNED_CAPTURE_CEILING`, `BASIS_GRADES`, `TESTIMONY_GRADE`, `isMachineIdentity`. *(the module named is stale: these are `record-grammar`'s and this module's own `checks.mjs` since T18/T19; left as it stands, no change of meaning)*
- `record-core`: `transact`, `readImage`, `bundleInfo`, `allocId` (the observation's id), `declarePurge` (`register`, `captured_locators`), and the evidence store (`head`, `get` by digest with integrity; K49) for R7–R9.
- `membership`: `viewerPredicate` and `sight` (R2's holder, R17, R29); the producing group (R28; not yet a named service in membership's Provides).
- `promotion`: `promote` (R28) and `registerStep` (R1–R3, R42–R46, R52).
- `membership`, also: `listenerRefusal` (its R81) and `MODULE_ORDER` (its R83) for R47 and R52.
- (`signatures`' names and `isPublicHttpsLocator` leave with `attestation`, and `getSetting`, `OBSERVATION_STATES`, `registerAuditFinding` and `ROUTE_MARK_CHECKS` with `provenance-routes` (N512); the pure copies this module keeps until T26 are named under Suggestions.)

### Invariants

- **R35** The register is the only thing that proves bytes: every answer about whether the record holds a capture reads the register or a receipt, never a caller's claim. A register row is written only inside a promotion (R1), a receipt only by the plane's own fetch (R15).
- **R36** *(retired: moved to provenance-routes R7, N512, T25)*
- **R37** Undetermined is stated, never rounded: an unreadable register, an unverified part and a first holder are each reported as undetermined with the reason, and never counted as sound, present or absent (R8, R9, R10). A route that cannot be shown is `provenance-routes`' (its R11; N512).
- **R38** A member's authored observation stays one: its flag is set only by R28 and never cleared, its origin and actor class stay `member`, and its words are never paraphrased or rewritten (C-53.7–C-53.9).
- **R39** *(retired: moved to attestation R8, N512, T25)*
- **R40** No place is named in this module's behaviour or outward text (`layers.md`, "No jurisdiction in the product").
- **R41** This module owns `register` and `captured_locators` (the acquisition receipts); no other module writes them (K49). `provenance_route_marks` is `provenance-routes`' (its R12), and `receipt_keys` and `signed_receipts` are `attestation`'s (its R10) (N512).

*The register's checks at the gate (C-18, K49).* Registered with `promotion.registerStep` as checks on the promoted package's `data/provenance.json`, for an information bundle whose register is present; each keeps its catalogue id and severity. At the write, a creation is refused on every error finding; a revision only on an error finding its held version's register does not already carry, so an inherited violation never blocks the correction that repairs it; a replay is exempt; a warning never refuses. The gate and the audit still report every finding (K121).
- **R42** C-18.1 (error): the register is `{documents: [...]}`; each document is an object naming `file` (present in the bundle), `locator` and `retrieved`; `authority`, or `authority_state` `undetermined`, with an `authority_basis` in both states; a `capture` block with `method`, a `grade` in `CAPTURE_GRADES` (none for an authored observation; none for a document received through the doorbell, which states R51's `grade_basis` instead) and a declared `actor_class`; an `origin.kind` in `ORIGIN_KINDS` (`sweep` with `matched_sweep` and `deeming_actor`; `member` for an authored observation; `doorbell` for a document capture R65's pull writes). A `collected → verified` transition is authored by a named member, never a machine identity, and a sweep-origin bundle reaches `verified` only through such a transition.
- **R43** C-18.3 (error): one capture appears once in a register: two documents with the same `capture.sha256`, or with the same determined evidentiary digest and different raw bytes, are refused as corroboration missed; an undetermined evidentiary digest is never compared.
- **R44** C-18.4 (warn): a `crucial` document whose entry carries neither `co_archive` nor `timestamp` is flagged for a member to verify co-attestation before release.
- **R45** C-18.6 (error): every registered capture's stored bytes (whole, or its parts streamed in order) hash to the recorded `capture.sha256`; bytes that cannot be decoded are refused with the reason.
- **R46** C-18.9 (error): a document at or past `verified` records a non-empty `provenance_chain` whose every hop names its attestor, and states its authority or, when undetermined, its `authority_basis`; no chain, a non-array chain and an empty chain are three distinct findings.

### Satisfies

- `docs/architecture/BIO_System_Design.md` §3, construct 2 (intake, capture and provenance: the trust root; the chain of hops with `provenance-routes`).
- `docs/architecture/BIO_Intake_Doctrine_v1_1.md` §2a (the doorbell: its material received, not fetched, K509 (3); R51), §1a (admission requires provenance), §2 (provenance per document), §3 (the capture-chain axis; co-attestation by trusted timestamp and co-archive with `attestation`), §3a (member-original records), §3b (SHA-256, plain JSON), §8 (one capture, one home; the census; what `existed` may claim; a capture held in parts).
- `docs/architecture/BIO_State_Rules_Consistency_v1_5.md` §4.1 (the intake provenance register and its daemon-era anatomy), §6 I-18.
- `docs/development/AUTHORITY-AND-TRUST.md`, RULED: transitive trust with disclosure (the chain, grade a function of the chain); an alternative source counts as a re-fetch (the `via` column); what publication requires (provenance authority).
- `docs/development/ARCHIVE-FALLBACK.md` §Shape on the capture, §Same document, two sources.
- `docs/development/MEMBER-KNOWLEDGE-DESIGN.md` §2, §3, §4.1.
- `docs/development/LINK-FIDELITY.md` §A re-capture of a document the record already holds is the NORMAL case.
- `docs/architecture/BIO_Content_Framework_v0_10.md` §8.3 (a declared origin, REC-225), §14.2 (the fetch-path grade table, D-693).
- Rulings: DEC-21 (the capture axis), D-179 and REC-190 (BOB #26, #31, #32), D-533, D-530, D-556 (BOB #33, #34), D-693 and D-709 (BOB #35). DEC-19 and DEC-56 (the route marker) are `provenance-routes`' (N512).

### Suggestions

- **Checks carried here.** C-53.1–C-53.9, C-53.13, C-53.14 (this module's own row, `REGISTER_ENTRY_CHECKS`; K324), C-24.1–C-24.3, C-103 (R58) and the C-18 register arms (R42–R46) move with this module. C-34.1–C-34.4 moved to `provenance-routes` and C-89.1 to `attestation` (N512). Of the rest of C-18, C-18.5 (`gathering.json`) goes to monitoring and C-18.7 stays with C-18.8 in promotion (K49). C-53.10–C-53.12 are publication's.
- **What stays out.** `testimonyReach`, `observationsNamingAuthor` and `attributeObservation` read inquiry basis and attribution tables (later modules); `attestText`, `transcriptionAttest` and `text_attestations` are extraction's; `projectLinks` writes `refs` (connections, K23).
- **Testify's later work.** Until T19's layers 4–5, the legacy store's promotion step indexed the words, minted the content row and logged the extraction look. They become the slot's registrations by `extraction` (its R65), `content` (its R49, the check and the mint) and `observation-log` (its R30) through R52, so this module calls none of them; the legacy store's `#testimonyWithin` and extent-check lines were replaced by the slot's two calls, and the store is retired.
- **The receipt's observation row.** Observation-log (layer 5) registers its OBSERVATION-LOG-DESIGN §4.1 writer through R47; `capture`'s reuse-verdict rows can use the same pattern.
- **The evidence store** (the R2 working bucket) is `record-core`'s, added to its requirements before T3 (K49); until then `registerAudit` and `partsHeld` take it through injected callbacks (`attest`, now `attestation`'s, too).
- **Testify is here** (K49): the authored flag's only writer and its fence live in one module.
- `homeCensus` walks every `files` and `history` row: an unbounded scan, admin-only today. Keep it admin-only or page it.
- D-177, D-693, D-698 and D-709 have built work on `land/worker/D-177`, `D-693`, `D-698`, `D-709` (snapshot branch), judged at the job.
- **Held over until T26 (option B, BOB #100's review 1, as K1220 reads it).** This module's T25 job deletes the moved code, and keeps only pure copies of the names a later layer imports by name, until that importer's T25 job re-points: `routeFinding` (retrieval, L5), `instanceStatement` (network-notices, L8). The checks constants `ROUTE_MARK_CHECKS` and `ATTEST_CHECKS` are not kept: their later readers import this module's `checks.mjs` as a namespace, so their removal fails no load, and a copy would hold C-34 and C-89 twice in the census (K1225). No stateful method and no table write is kept: `provenance_route_marks` is written only by `provenance-routes`, and `receipt_keys` and `signed_receipts` only by `attestation`, from their L3 merges, so no table has two writers (P7). The copies are deleted in this module's T26 job (N516).


## Open for Bob

None (R34's key ruled by Bob, K59).

