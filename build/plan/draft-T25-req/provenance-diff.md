# provenance.md — the edits for N512

> **DRAFT by a worker for BOB #100, not reviewed.** 2026-10-02, on `tranche/T24` (P18), for T25's opening fold 1. Each edit gives the line numbers of `build/requirements/provenance.md` as it stands at `tranche/T24`, the lines before, and the lines after. Lines not named are unchanged. Applied by BOB at the opening; nothing here is applied yet.

Summary. Retired as moved: R19→provenance-routes R1, R20→R2, R21→R3, R22→R4, R23→R5, R54→R6, R36→R7; R31→attestation R1, R32→R2, R33→R3, R34→R4, R56→R5, R57→R6, R49→R7, R39→R8. Split, wording only (their moved part is the new module's): R48 (last sentence → provenance-routes R8), R53 (three arms → provenance-routes R9; six ops, marked not yet met T26 under option B), R55 (`routeMarks` → provenance-routes R10), R37 (route clause → provenance-routes R11), R41 (`provenance_route_marks` → provenance-routes R12). Copied: R40 (→ provenance-routes R13, attestation R9). New seam: R58. Re-worded: Status, Purpose, Uses, Satisfies, Suggestions. Ids never reused; no requirement that stays changes meaning.

## 1. Status: a sentence appended (the split; wording only)

Line 3, before:

```text
**Status** · APPROVED by Bob 2026-09-26 (a product module, P17; K67). DRAFT by BOB #41, 2026-09-26 (P18), from a drafting worker's reading of the code, reviewed by BOB (K47–K49). Layer 3. Code: `bio-plane/src/provenance/` (extracted from the legacy modules, since retired). `bio-plane/src/store.mjs`: the register write inside `promote` (~19905–19925) and `#testimonyFence` (22265–22376); `testify` with `testimonyBytes`, `observerRef` (21880–21930, 22377–22620); `chainFromEvidence`, `provenanceChainRebuild`, `routeFinding`, `provenanceRouteAssess`, `provenanceRoutesMarked` (16457–17196); `registerAudit`, `#partsNamedFor` (35485–35544); `homeCensus`, `registerHolds` (36562–36654); `recordCapturedLocator`, `capturedLocators` (40800–40995); `versionChain` (40995–41137). `bio-plane/src/index.mjs`: the handlers of `op=attest` (10169–10318) and `op=registeraudit` (7247–7311), and `partsHeld` (4560–4598). `schema.mjs`: `register` (85–107, K23), `captured_locators` (566–586), `provenance_route_marks` (2902–2984). The C-18 register arms run today in `bio-plane/checks/bio-checks.mjs` (`checkBundle`, at the gate). Not yet met: R24–R26 (D-177, D-693, D-709), R12 (D-580, this module's by K49), R21–R22 (REC-158), R29–R30 (REC-225), R47 (K49), R34 (Open for Bob). D-698 is `capture`'s (its R18). Old-plan rows naming `provenance`: D-580, D-693, D-709, REC-225, REC-158. N364 (Bob's ruling K509 (3): doorbell material is received, not fetched) folded by a worker for BOB #71, 2026-09-30 (T16 opening; W4 of `build/plan/draft-T16.md`): R51, and R15's writers gain `capture.pullKnock`; met in T16 (PROVENANCE #6, K538). T19 layer 3's wordings, by a worker for BOB #80 on `tranche/T19`, 2026-10-01, before layer 3 (rule 6 of `build/plan/current.md`; `build/extraction/legacy-store.md` §4.2 (1), (5), (6)): R28 re-worded and R52 (`onTestimony` and the testimony slot, run at the position `legacy-store`'s step holds today, K763) new; R55 (its count figures, record-core R63) new; R53 (`provenanceOps`, nine ops as `store.mjs` runs them) and R54 (the route-marker tally as record-core R68's `route` finding) new; R48 widened to `provenance_route_marks`' columns for `retrieval`'s `op=list` (its R63, layer 5). Each marked not yet met. T23, by a fold worker for BOB #94 at T23's opening, on `fold/T23-b` from `tranche/T23`, 2026-10-02: R56 (`instanceStatement`, `instanceSign`, `instanceKeys`, for `network-notices`; `build/plan/draft-network-notices.md`, DEC-111, K1031, K1100) added; R48 names `corpus-export` as the reader of `register.bytes` (N484, K1024; no change of meaning); both not yet met (T23 L3). N504 folded by a worker for BOB #98 at T24's opening, 2026-10-02: R57 (`instanceKeyBound`, whether an instance key is bound, asked without signing) new; not yet met (T24).
```

After:

```text
**Status** · APPROVED by Bob 2026-09-26 (a product module, P17; K67). DRAFT by BOB #41, 2026-09-26 (P18), from a drafting worker's reading of the code, reviewed by BOB (K47–K49). Layer 3. Code: `bio-plane/src/provenance/` (extracted from the legacy modules, since retired). `bio-plane/src/store.mjs`: the register write inside `promote` (~19905–19925) and `#testimonyFence` (22265–22376); `testify` with `testimonyBytes`, `observerRef` (21880–21930, 22377–22620); `chainFromEvidence`, `provenanceChainRebuild`, `routeFinding`, `provenanceRouteAssess`, `provenanceRoutesMarked` (16457–17196); `registerAudit`, `#partsNamedFor` (35485–35544); `homeCensus`, `registerHolds` (36562–36654); `recordCapturedLocator`, `capturedLocators` (40800–40995); `versionChain` (40995–41137). `bio-plane/src/index.mjs`: the handlers of `op=attest` (10169–10318) and `op=registeraudit` (7247–7311), and `partsHeld` (4560–4598). `schema.mjs`: `register` (85–107, K23), `captured_locators` (566–586), `provenance_route_marks` (2902–2984). The C-18 register arms run today in `bio-plane/checks/bio-checks.mjs` (`checkBundle`, at the gate). Not yet met: R24–R26 (D-177, D-693, D-709), R12 (D-580, this module's by K49), R21–R22 (REC-158), R29–R30 (REC-225), R47 (K49), R34 (Open for Bob). D-698 is `capture`'s (its R18). Old-plan rows naming `provenance`: D-580, D-693, D-709, REC-225, REC-158. N364 (Bob's ruling K509 (3): doorbell material is received, not fetched) folded by a worker for BOB #71, 2026-09-30 (T16 opening; W4 of `build/plan/draft-T16.md`): R51, and R15's writers gain `capture.pullKnock`; met in T16 (PROVENANCE #6, K538). T19 layer 3's wordings, by a worker for BOB #80 on `tranche/T19`, 2026-10-01, before layer 3 (rule 6 of `build/plan/current.md`; `build/extraction/legacy-store.md` §4.2 (1), (5), (6)): R28 re-worded and R52 (`onTestimony` and the testimony slot, run at the position `legacy-store`'s step holds today, K763) new; R55 (its count figures, record-core R63) new; R53 (`provenanceOps`, nine ops as `store.mjs` runs them) and R54 (the route-marker tally as record-core R68's `route` finding) new; R48 widened to `provenance_route_marks`' columns for `retrieval`'s `op=list` (its R63, layer 5). Each marked not yet met. T23, by a fold worker for BOB #94 at T23's opening, on `fold/T23-b` from `tranche/T23`, 2026-10-02: R56 (`instanceStatement`, `instanceSign`, `instanceKeys`, for `network-notices`; `build/plan/draft-network-notices.md`, DEC-111, K1031, K1100) added; R48 names `corpus-export` as the reader of `register.bytes` (N484, K1024; no change of meaning); both not yet met (T23 L3). N504 folded by a worker for BOB #98 at T24's opening, 2026-10-02: R57 (`instanceKeyBound`, whether an instance key is bound, asked without signing) new; not yet met (T24). N512 folded at T25's opening, by BOB from a worker's draft for BOB #100 (`build/plan/draft-T25-req/`; K1193; `build/plan/draft-T25-splits.md` P-1, P-2), with no change of meaning: the chain and the route marker split out to `provenance-routes` and co-attestation and the instance key to `attestation`, both layer 3 after this module (provenance, attestation, provenance-routes). R19–R23, R36 and R54 are retired as moved to `provenance-routes` R1–R7, and R31–R34, R39, R49, R56 and R57 as moved to `attestation` R1–R8, never reused; R37, R41, R48, R53 and R55 keep their other parts, wording only, their route or attestation parts moved (`provenance-routes` R8–R12); R40 is stated in both new modules too. R58 (the C-103 rows the new modules answer through) is added by BOB's ruling on the seam. Under option B (BOB #100's review 1) this module's T25 job keeps the names later layers import (`routeFinding`, `instanceStatement`, `attestOp`, `provenanceOps`' route arms, `ROUTE_MARK_CHECKS`, `ATTEST_CHECKS`) until each importer re-points; its T26 job deletes them, so R53 is marked not yet met (T26).
```

## 2. Purpose (wording only: the moved shares named where they now live)

Line 9, before:

```text
Holds the record's trust root: the register, which says which bundle is the one home of each captured byte sequence; the plane's own acquisition receipts, which say which bytes it fetched from which address, by which route and when; each document's chain of hops and the capture grade its route earns; trusted timestamps over capture hashes; and a member's firsthand observation, the one capture whose bytes are a person's own words. A hop attests bytes, address and time, never the credibility of the content.
```

After:

```text
Holds the record's trust root: the register, which says which bundle is the one home of each captured byte sequence; the plane's own acquisition receipts, which say which bytes it fetched from which address, by which route and when; the capture grade a capture's route earns; and a member's firsthand observation, the one capture whose bytes are a person's own words. Each document's chain of hops and the route marker are `provenance-routes`'; trusted timestamps over capture hashes and the instance's key are `attestation`'s (N512). A hop attests bytes, address and time, never the credibility of the content.
```

## 3. R19 (its service heading, the requirement and its Errors line) retired

Lines 73–75, before:

```text
**chainFromEvidence(doc, {instanceName, at}) → `{ok: true, hops}` | `{ok: false, missing}`**
- **R19** Pure. Reconstructs a provenance document's chain from fields it already holds, never from anything else: a document received through the doorbell (`origin.kind` `doorbell`, R51) is never a fetched route; its one hop, when its chain is missing, is read from the knock's receipt it states (`source.receipt`: "these bytes were received for knock:<knock_id> at <received>", `via: "doorbell"`), else it is `undetermined` with `source.receipt` missing. Otherwise a fetched route (non-empty `locator` other than `in hand`, `retrieved`, `capture.method`) gives one hop by this instance, asserting "these bytes were served for <locator> at <retrieved>", `via: "direct"`; otherwise a named custodian (`custody.holder`, `custody.obtained`) gives one hop by that member, `via: "member"`. Every hop is `bound: false` and carries `reconstructed: {at, by, basis, from}` naming the fields it was read from. A recorded RFC 3161 timestamp is cited as evidence for the bytes and the instant, never as binding the address. Otherwise `missing` lists each absent field.
- Errors: never throws.
```

After:

```text
**chainFromEvidence** (moved to `provenance-routes` by N512, K1193, T25; the ids are never reused)
- **R19** *(retired: moved to provenance-routes R1, N512, T25)*
```

## 4. R20, R21 retired

Lines 77–80, before:

```text
**provenanceChainRebuild({bundleId, apply, author, viewer}) → report or refusal**
- **R20** For a bundle the viewer may see, reports per register document `already_recorded`, `reconstructed` (R19) or `undetermined` with what is missing. With any `undetermined` document it writes nothing and answers `EVIDENCE_INSUFFICIENT` with the bundle's route finding (R22). With `apply` and at least one reconstruction, it promotes the bundle once with only `data/provenance.json` changed (every other file carried byte for byte, the bundle's type, group, state, dates and criticality unchanged, a document's own stated values never relabelled from the row) and answers `applied: true`. Refusals: `NO_AUTHOR`, `NO_BUNDLE`, `NO_SUCH_BUNDLE` (absent and unseen answer alike), `NO_REGISTER`, `UNPARSABLE_REGISTER`, `NO_DOCUMENTS`; a promotion's refusal is returned as it came.
- **R21** Reconstructing a chain is a named member's act: an author that is a machine identity (`isMachineIdentity`) is refused by name before anything is read.
- Errors: never throws.
```

After:

```text
**provenanceChainRebuild** (moved to `provenance-routes` by N512)
- **R20** *(retired: moved to provenance-routes R2, N512, T25)*
- **R21** *(retired: moved to provenance-routes R3, N512, T25)*
```

## 5. R22, R23 retired

Lines 82–85, before:

```text
**provenanceRouteAssess({bundleId, author, viewer}) → `{ok, bundleId, appended, route, documents, detail}` or refusal; routeFinding(objectType, mark) → finding; provenanceRoutesMarked({after, limit, viewer}) → page**
- **R22** A member's assessment of whether an information bundle's route can be shown. Refusals: `ROUTE_MARK_NO_AUTHOR` (C-34.1; REC-158 as R21), `ROUTE_MARK_NO_BUNDLE` (C-34.2), `ROUTE_MARK_NO_SUCH_BUNDLE` (C-34.3, absent and unseen alike), `ROUTE_MARK_NOT_A_DOCUMENT` (C-34.4). The register's state (`readable`, `absent`, `unparsable`, `no_documents`, `empty`) is recorded, never refused. Each document is `recorded`, `derivable` (R19) or `undetermined`; the finding is `LOOKED_INDETERMINATE` when the register is not readable or any document is undetermined, else `PRESENT`. A mark is appended (next `seq`, by, at, the bundle's state at that moment) only when it differs from the latest; the bundle's state and bytes never move.
- **R23** `routeFinding` reads the latest mark: `NEVER_LOOKED` when there is none, stated as the question never asked, never as a finding; not applicable to a bundle that is not information. `provenanceRoutesMarked` pages the bundles whose standing mark is `LOOKED_INDETERMINATE`, in id order after `after`, `limit` default 50, at most 200, `truncated` from reading one past the page, `cursor` the last id read; bundles the viewer may not see are withheld and counted nowhere. It adds a census over the visible information bundles (`documents_visible`, `assessed`, `never_assessed`, `standing` by finding, `marked`), `complete` exactly when none is never assessed, and when the page is empty a `cause` of `no_documents_visible`, `never_assessed`, `none_standing` or `page_exhausted`.
- Errors: never throws.
```

After:

```text
**provenanceRouteAssess, routeFinding, provenanceRoutesMarked** (moved to `provenance-routes` by N512)
- **R22** *(retired: moved to provenance-routes R4, N512, T25)*
- **R23** *(retired: moved to provenance-routes R5, N512, T25)*
```

## 6. R31–R34 retired

Lines 107–112, before:

```text
**attest({sha256, archive, locator}, {head, put, fetch}) → `{ok, attempts, archive?, attestation?, held?, note}` or refusal**
- **R31** `sha256` must be 64 hex (`BAD_SHA`). When no object is held under it: an acquisition receipt naming it lets the attestation proceed, answering `held: {form: "parts", on: "acquisition_receipt"}`; a register row alone is refused `CAPTURE_HELD_IN_PARTS` (C-89.1), which does not call the bytes missing; neither is `NO_SUCH_CAPTURE`, saying what was asked, and whether the store could be asked.
- **R32** Asks the timestamp authorities in `signatures.TSA_ENDPOINTS` order, each with a fresh RFC 3161 request over the digest, and stops at the first response `parseTimestampResponse` accepts as bound to it. The token is stored in the evidence store under its own SHA-256 and named `snapshots/timestamp-<first 12 hex>.tsr`, `kind: "rfc3161"`, `over` the capture. Every attempt, failed or not, is in `attempts` with its service, instant and outcome. No token answers `ok: false`, `reason: "NO_ATTESTATION"`. The token's signature is not verified here, and the answer says so.
- **R33** With `archive: true` and a public https `locator`, also asks the co-archive (`signatures.ARCHIVE_SAVE_BASE`) and records the archived locator from `archiveLocatorFrom`, or the failed attempt. Without it, no archive is asked.
- **R34** When this instance files an archive-sourced capture, it signs its own receipt: that on this date it fetched these bytes from this retrieval locator and they hashed to this value. The signing key is the instance's own, one per instance, held as a secret and replaceable by the operator; a receipt signed before a replacement stays verifiable against the public key it was signed with (Bob, K59).
- Errors: never throws for a well-formed call; an authority or archive failure is an attempt, never a throw.
```

After:

```text
**attest** (moved to `attestation` by N512, K1193, T25; the ids are never reused)
- **R31** *(retired: moved to attestation R1, N512, T25)*
- **R32** *(retired: moved to attestation R2, N512, T25)*
- **R33** *(retired: moved to attestation R3, N512, T25)*
- **R34** *(retired: moved to attestation R4, N512, T25)*
```

## 7. R56, R57 retired

Lines 114–119, before:

```text
**instanceStatement(kind, sha), instanceSign(statement), instanceKeys(), instanceKeyBound()** (the instance key of R34, for later modules: `network-notices` R1, R13, R21)
- **R56** (DEC-111, K1031 (2)) The instance key of R34 also signs statements for later modules.
  - `instanceStatement(kind, sha)` returns exactly `` `${kind}\nsha256: ${sha}\n` ``. It throws when `kind` is `bio-receipt/1`, or is not of the form `^[a-z][a-z0-9-]*/[0-9]+$`, so no statement can be read as a receipt.
  - `instanceSign(statement)` answers `{ok, signature, key_id, public_key}`, or `RECEIPT_NO_KEY` when no key is bound. It records the key in `receipt_keys`.
  - `instanceKeys()` answers every key that has signed anything, each with its `first_used`, never the private part.
- **R57** (N504) `instanceKeyBound()` answers `true` when an instance key is bound (so `instanceSign` would sign), and `false` otherwise, a key that cannot be read included. It signs nothing and writes nothing: `receipt_keys`, and every key's `first_used`, are unchanged by it. Never throws.
```

After:

```text
**instanceStatement, instanceSign, instanceKeys, instanceKeyBound** (moved to `attestation` by N512)
- **R56** *(retired: moved to attestation R5, N512, T25)*
- **R57** *(retired: moved to attestation R6, N512, T25)*
```

## 8. R48: its last sentence moves to provenance-routes R8 (the rest unchanged)

Line 122, before:

```text
- **R48** The tables `register` (its `capture_sha`, `bundle_id`, `path`, `registered` and `authored` columns; `authored` 1 when a member authored the observation the entry holds, K182) and `captured_locators` (its `address_norm`, `address`, `retrieval_locator`, `capture_sha` and `first_retrieved` columns, the last as R13 states it; K243) are a stated read contract: a later module may join them in its own SQL, and this module changes none of those columns' names or meaning without a change to this requirement. `registered` is this module's clock at the register write (R1), an ISO instant, never a caller's time; `address_norm` is the document address as the acquisition that wrote the receipt normalised it (R13), the key a later module seeks a document address on. Every write to them stays this module's. *(widened by N111, K173)* The columns `register.bytes` (the registered capture's size in bytes, as the entry that registers it states it) and `register.author` (the member who authored an `authored` entry, stamped by this module, NULL on every other entry), and `captured_locators.via` (the receipt's source, R13, part of its key) and `last_retrieved` (R13's latest), are part of it too, on the same terms (N213, N484: `corpus-export` reads `register`'s `bundle_id`, `path`, `capture_sha` and `bytes` for the working-corpus export, its R1, moved from `publication` by K1024; N227, K276: `monitoring` R26 reads `via`). `first_retrieved` and `last_retrieved` are spelled whole-second UTC on every row, `YYYY-MM-DDTHH:MM:SSZ` (record-core R47's `"second"`), so a later module compares and brackets them as text in its own SQL (N133). The table `provenance_route_marks` (its `bundle_id`, `seq`, `at`, `by`, `finding`, `state_at`, `register_state`, `undetermined` and `documents_n` columns; per bundle the row with the highest `seq` is the standing mark, R22, R23) is part of it on the same terms, for `retrieval`'s `op=list` (its R63), which joins the standing mark in its own statement and reads it through `routeFinding` (R23).
```

After:

```text
- **R48** The tables `register` (its `capture_sha`, `bundle_id`, `path`, `registered` and `authored` columns; `authored` 1 when a member authored the observation the entry holds, K182) and `captured_locators` (its `address_norm`, `address`, `retrieval_locator`, `capture_sha` and `first_retrieved` columns, the last as R13 states it; K243) are a stated read contract: a later module may join them in its own SQL, and this module changes none of those columns' names or meaning without a change to this requirement. `registered` is this module's clock at the register write (R1), an ISO instant, never a caller's time; `address_norm` is the document address as the acquisition that wrote the receipt normalised it (R13), the key a later module seeks a document address on. Every write to them stays this module's. *(widened by N111, K173)* The columns `register.bytes` (the registered capture's size in bytes, as the entry that registers it states it) and `register.author` (the member who authored an `authored` entry, stamped by this module, NULL on every other entry), and `captured_locators.via` (the receipt's source, R13, part of its key) and `last_retrieved` (R13's latest), are part of it too, on the same terms (N213, N484: `corpus-export` reads `register`'s `bundle_id`, `path`, `capture_sha` and `bytes` for the working-corpus export, its R1, moved from `publication` by K1024; N227, K276: `monitoring` R26 reads `via`). `first_retrieved` and `last_retrieved` are spelled whole-second UTC on every row, `YYYY-MM-DDTHH:MM:SSZ` (record-core R47's `"second"`), so a later module compares and brackets them as text in its own SQL (N133). The table `provenance_route_marks`' contract is `provenance-routes`' (its R8; N512).
```

## 9. R53: six ops (the three route arms moved to provenance-routes R9)

Line 124, before:

```text
- **R53** The module publishes `provenanceOps(provenance, url, body, {observer})`, an object of route arms keyed by op name, each a function of no arguments that answers what the named service answers, reading its parameters from `url`'s query (the control plane's stamps among them, never the body's). It holds nine ops, each with today's behaviour (`store.mjs`' explicit arms), no meaning changed: `testify`, `testify({words, observedAt, title, author, claimedAuthor})` (R28), `words`, `observedAt` and `title` from the body (null when absent), `author` the query's stamp, and `claimedAuthor` the first of the body's `author`, `observer`, `authoredBy`, `authored_by`, `by`, `member`, `memberId` that is neither undefined nor null (null when none, or no body); `versionchain`, `versionChain({addressNorm, at, limit, offset, viewer})` from `address` (already normalised by the control plane), `at`, `limit`, `offset`, `viewer` (R17, R18); `recordcapturedlocator`, `recordReceipt` (R13, R14, R47) over the body (`{}` when absent), its fields `authorityKind`, `authority`, `actorClass`, `actor`, `observe` (defaults null, null, `plane`, null, true) taken out as the listeners' `context` and the rest the receipt: an unrecorded receipt answers as `recordReceipt` does, a recorded one `{recorded: true, address_norm, via, observation, observation_written, observation_refused}`, the last two read from the outcome of the listener registered by the module the composition root names as `observer` (today `observation-log`; this module names no later module, R47): `observation_written` true exactly when that listener ran and answered `written: true`, `observation_refused` its answer when it refused, else null; `homecensus`, `homeCensus({limit})` (R10); `registerholds`, `registerHolds({sha, bundle})` from `sha256` and `bundle` (R5); `registeraudit`, `registerRows()`, the classification of every register row that the Worker's `op=registeraudit` finishes into R8's report (R8, R9); `provenancechain`, `provenanceChainRebuild({bundleId, apply, viewer, author})`, `apply` true exactly when the query's `apply` is `1` (R20, R21); `provenanceroute`, `provenanceRouteAssess({bundleId, viewer, author})` (R22); `provenanceroutes`, `provenanceRoutesMarked({after, limit, viewer})` (R23). `viewer` and `author` are the control plane's stamps. Which credential reaches each op is `op-declarations`' and `control-plane`'s, never this map's. The legacy store's nine explicit arms were replaced by one spread of the map (K671); the store is retired.
```

After:

```text
- **R53** The module publishes `provenanceOps(provenance, url, body, {observer})`, an object of route arms keyed by op name, each a function of no arguments that answers what the named service answers, reading its parameters from `url`'s query (the control plane's stamps among them, never the body's). It holds six ops, each with today's behaviour (`store.mjs`' explicit arms), no meaning changed: `testify`, `testify({words, observedAt, title, author, claimedAuthor})` (R28), `words`, `observedAt` and `title` from the body (null when absent), `author` the query's stamp, and `claimedAuthor` the first of the body's `author`, `observer`, `authoredBy`, `authored_by`, `by`, `member`, `memberId` that is neither undefined nor null (null when none, or no body); `versionchain`, `versionChain({addressNorm, at, limit, offset, viewer})` from `address` (already normalised by the control plane), `at`, `limit`, `offset`, `viewer` (R17, R18); `recordcapturedlocator`, `recordReceipt` (R13, R14, R47) over the body (`{}` when absent), its fields `authorityKind`, `authority`, `actorClass`, `actor`, `observe` (defaults null, null, `plane`, null, true) taken out as the listeners' `context` and the rest the receipt: an unrecorded receipt answers as `recordReceipt` does, a recorded one `{recorded: true, address_norm, via, observation, observation_written, observation_refused}`, the last two read from the outcome of the listener registered by the module the composition root names as `observer` (today `observation-log`; this module names no later module, R47): `observation_written` true exactly when that listener ran and answered `written: true`, `observation_refused` its answer when it refused, else null; `homecensus`, `homeCensus({limit})` (R10); `registerholds`, `registerHolds({sha, bundle})` from `sha256` and `bundle` (R5); `registeraudit`, `registerRows()`, the classification of every register row that the Worker's `op=registeraudit` finishes into R8's report (R8, R9). `viewer` and `author` are the control plane's stamps. Which credential reaches each op is `op-declarations`' and `control-plane`'s, never this map's. The legacy store's nine explicit arms were replaced by one spread of the map (K671); the store is retired. Its three route arms (`provenancechain`, `provenanceroute`, `provenanceroutes`) are `provenance-routes`' `provenanceRouteOps` (its R9; N512). *(not yet met: T26; option B, BOB #100's review 1: the three arms stay in this map until `plane`'s and `control-plane`'s T25 L11 merges re-point to `provenanceRouteOps`, and this module's T26 job deletes them)*
```

## 10. R54 retired (its heading kept as a pointer)

Lines 126–127, before:

```text
**The route-marker tally on the audit** (`build/extraction/legacy-store.md` §4.2 (1); record-core R68)
- **R54** This module registers, once at start, record-core's audit finding (its R68) under the key `route`. For each audit page it reads the standing mark (R23) of each bundle the page names, over the page's own id range (after its `after`, up to its last id) and kept only for the page's ids, so no other bundle's mark rides on the answer and the read never scans every mark; and answers `{tally, marked, markedTotal, markedShown, means, note}`: `tally` counts the page's bundles by `routeFinding` (R23) as `{LOOKED_INDETERMINATE, PRESENT, NEVER_LOOKED, notApplicable}` (`notApplicable` for a bundle the marker does not apply to), always present with every key, `NEVER_LOOKED` included; `marked` the first 20 marked bundles in page order, each `{bundleId, state, ...routeFinding}`, `markedTotal` how many the page holds and `markedShown` how many `marked` lists; `means` `OBSERVATION_STATES`; `note` the fixed sentence that these are stated doubts, not conformance errors, counted in neither `tally` nor `withErrors`, each naming a document whose route cannot be shown, and that `NEVER_LOOKED` means no assessment has run. The finding never moves `ok`, `clean`, `withErrors`, `tally` or `offenders` (record-core R68; DEC-56).
```

After:

```text
**The route-marker tally on the audit** (moved to `provenance-routes` by N512)
- **R54** *(retired: moved to provenance-routes R6, N512, T25)*
```

## 11. R49 retired

Lines 129–130, before:

```text
**attestationsOf(captureSha) → `{sha256, registered, attestations: [{kind, service?, locator?, at?, file?, token_sha?, bundle, path}], undetermined?, note}` or refusal**
- **R49** Answers every attestation recorded for the capture, from each document entry that registers it (the register, R48), in the entry's order: its `timestamp` (daemon era), each `attestations[]` entry of kind `rfc3161` (R32's token, as `op=attest`'s answer is recorded: `kind: "rfc3161"`, its service, the token's file and SHA-256), and its `co_archive` (R33's archived locator, a string or `{service, locator}`, `kind: "co_archive"`), as the entry states them (C-18), each naming the bundle and path it is recorded in; `at` is the matching attempt's instant where one is recorded. The answer also states `registered`, and `undetermined` with why when no register row names the capture under an existing bundle (a capture registered only by its parts) or the home's register cannot be read; `attestations: []` alone means none is recorded. A read over what `attest` and promotion already write: it asks no authority and verifies no token's signature, and its `note` says so. `BAD_SHA` for a digest not 64 hex. It is the read `filings` R9's exhibits use.
```

After:

```text
**attestationsOf** (moved to `attestation` by N512)
- **R49** *(retired: moved to attestation R7, N512, T25)*
```

## 12. R55: `routeMarks` moves to provenance-routes R10 (`register` stays)

Line 137, before:

```text
- **R55** This module's figures for `op=stats` and purge's proof, `register` (the `register` rows, keyed on `bundle_id`) and `routeMarks` (the `provenance_route_marks` rows, keyed on `bundle_id`), registered once at start through `record-core`'s `registerCounts` (its R63), answering for `hid` (the bundles the caller may not see, or null for a whole count) each figure as `store.mjs`' `#counts` takes it today, no meaning changed: a figure keyed on a bundle column leaves out the rows whose column names a bundle in `hid`, a row whose column is null naming none and so counted; a figure with no such column counts every row. Synchronous, writes nothing. The legacy store's own lines for these figures were deleted with it (`build/extraction/legacy-store.md` §4.2 (2)).
```

After:

```text
- **R55** This module's figure for `op=stats` and purge's proof, `register` (the `register` rows, keyed on `bundle_id`), registered once at start through `record-core`'s `registerCounts` (its R63), answering for `hid` (the bundles the caller may not see, or null for a whole count) the figure as `store.mjs`' `#counts` takes it today, no meaning changed: a figure keyed on a bundle column leaves out the rows whose column names a bundle in `hid`, a row whose column is null naming none and so counted; a figure with no such column counts every row. Synchronous, writes nothing. The legacy store's own lines for these figures were deleted with it (`build/extraction/legacy-store.md` §4.2 (2)). `routeMarks` is `provenance-routes`' (its R10; N512).
```

## 13. New R58 (the seam: the C-103 rows the new modules answer through), inserted after R55 (line 137), before `## Private`

Before: nothing (an insertion).

After:

```text

**The C-103 rows the split modules answer through** (N512; BOB's ruling on the seam, decision 6 of `build/plan/draft-T25.md`)
- **R58** This module exports `PROVENANCE_ACT_CHECKS` (C-103), each row `{check, where, translation}` with its code, number and translation unchanged, and `DOORBELL_ORIGIN` (R51's origin kind). `attestation` answers `RECEIPT_MALFORMED` (C-103.6) and `RECEIPT_NO_KEY` (C-103.7) through it (its R4, R5), and `provenance-routes` answers `NO_BUNDLE` (C-103.3) through it (its R2) and reads `DOORBELL_ORIGIN` (its R1); each row's `where` names the site that raises it, in whichever module that is. *(not yet met: T25)*
```

## 14. Uses: the moved names leave (wording only)

Lines 143–148, before:

```text
- `legacy-checks`: `TESTIMONY_CHECKS` (C-53.1–C-53.9, C-53.13), `ROUTE_MARK_CHECKS` (C-34), `VERSION_CHAIN_CHECKS` (C-24), `ATTEST_CHECKS` (C-89.1); `EARNED_CAPTURE_CEILING`, `BASIS_GRADES`, `TESTIMONY_GRADE`, `isMachineIdentity`, `isPublicHttpsLocator`, `OBSERVATION_STATES`.
- `signatures`: `timestampRequest`, `parseTimestampResponse`, `TSA_ENDPOINTS`, `TSA_CONTENT_TYPE`, `TSA_ACCEPT`, `ARCHIVE_SAVE_BASE`, `ARCHIVE_SERVICE`, `archiveLocatorFrom`.
- `record-core`: `transact`, `readImage`, `bundleInfo`, `allocId` (the observation's id), `getSetting` (the instance name), `declarePurge` (`register`, `captured_locators`, `provenance_route_marks`), and the evidence store (`head`, `get`, `put` by digest with integrity; K49) for R7–R9 and R31–R32.
- `membership`: `viewerPredicate` and `sight` (R2's holder, R17, R20, R22, R23, R29); the producing group (R28; not yet a named service in membership's Provides).
- `promotion`: `promote` (R20, R28) and `registerStep` (R1–R3, R42–R46, R52).
- `record-core`, also: `registerAuditFinding` (its R68) for R54. `membership`, also: `listenerRefusal` (its R81) and `MODULE_ORDER` (its R83) for R47 and R52.
```

After:

```text
- `legacy-checks`: `TESTIMONY_CHECKS` (C-53.1–C-53.9, C-53.13), `VERSION_CHAIN_CHECKS` (C-24); `EARNED_CAPTURE_CEILING`, `BASIS_GRADES`, `TESTIMONY_GRADE`, `isMachineIdentity`. *(the module named is stale: these are `record-grammar`'s and this module's own `checks.mjs` since T18/T19; left as it stands, no change of meaning)*
- `record-core`: `transact`, `readImage`, `bundleInfo`, `allocId` (the observation's id), `declarePurge` (`register`, `captured_locators`), and the evidence store (`head`, `get` by digest with integrity; K49) for R7–R9.
- `membership`: `viewerPredicate` and `sight` (R2's holder, R17, R29); the producing group (R28; not yet a named service in membership's Provides).
- `promotion`: `promote` (R28) and `registerStep` (R1–R3, R42–R46, R52).
- `membership`, also: `listenerRefusal` (its R81) and `MODULE_ORDER` (its R83) for R47 and R52.
- (Until this module's T26 job, option B: `signatures`' `timestampRequest`, `parseTimestampResponse`, `TSA_ENDPOINTS`, `TSA_CONTENT_TYPE`, `TSA_ACCEPT`, `ARCHIVE_SAVE_BASE`, `ARCHIVE_SERVICE`, `archiveLocatorFrom` and `isPublicHttpsLocator`, for the kept copy of `attest` behind `attestOp`; `getSetting` and `OBSERVATION_STATES` leave with `provenance-routes`.)
```

## 15. Invariants: R36 retired; R37 keeps its other clauses

Lines 153–154, before:

```text
- **R36** A hop a caller can hand in is a hop a caller can invent: every hop this module writes is derived from fields the record already held (R19) or from a fetch this instance made; none is read from a request.
- **R37** Undetermined is stated, never rounded: an unreadable register, an unverified part, a route that cannot be shown and a first holder are each reported as undetermined with the reason, and never counted as sound, present or absent (R8, R9, R10, R22).
```

After:

```text
- **R36** *(retired: moved to provenance-routes R7, N512, T25)*
- **R37** Undetermined is stated, never rounded: an unreadable register, an unverified part and a first holder are each reported as undetermined with the reason, and never counted as sound, present or absent (R8, R9, R10). A route that cannot be shown is `provenance-routes`' (its R11; N512).
```

## 16. Invariants: R39 retired

Line 156, before:

```text
- **R39** Network calls are made only by `attest`, only to the compiled endpoints `signatures` names.
```

After:

```text
- **R39** *(retired: moved to attestation R8, N512, T25)*
```

## 17. Invariants: R41 keeps its own tables

Line 158, before:

```text
- **R41** This module owns `register`, `captured_locators` (the acquisition receipts) and `provenance_route_marks`; no other module writes them (K49).
```

After:

```text
- **R41** This module owns `register` and `captured_locators` (the acquisition receipts); no other module writes them (K49). `provenance_route_marks` is `provenance-routes`' (its R12), and `receipt_keys` and `signed_receipts` are `attestation`'s (its R10) (N512).
```

## 18. Satisfies: the moved shares named (wording only)

Lines 169–170, before:

```text
- `docs/architecture/BIO_System_Design.md` §3, construct 2 (intake, capture and provenance: the trust root, the chain of hops).
- `docs/architecture/BIO_Intake_Doctrine_v1_1.md` §2a (the doorbell: its material received, not fetched, K509 (3); R51), §1a (admission requires provenance), §2 (provenance per document), §3 (the capture-chain axis, co-attestation by trusted timestamp and co-archive), §3a (member-original records), §3b (SHA-256, RFC 3161, plain JSON), §8 (one capture, one home; the census; what `existed` and attest may claim; a capture held in parts).
```

After:

```text
- `docs/architecture/BIO_System_Design.md` §3, construct 2 (intake, capture and provenance: the trust root; the chain of hops with `provenance-routes`).
- `docs/architecture/BIO_Intake_Doctrine_v1_1.md` §2a (the doorbell: its material received, not fetched, K509 (3); R51), §1a (admission requires provenance), §2 (provenance per document), §3 (the capture-chain axis; co-attestation by trusted timestamp and co-archive with `attestation`), §3a (member-original records), §3b (SHA-256, plain JSON), §8 (one capture, one home; the census; what `existed` may claim; a capture held in parts).
```

## 19. Satisfies: the rulings line

Line 177, before:

```text
- Rulings: DEC-19, DEC-56 (the route marker), DEC-21 (the capture axis), D-179 and REC-190 (BOB #26, #31, #32), D-533, D-530, D-556 (BOB #33, #34), D-693 and D-709 (BOB #35).
```

After:

```text
- Rulings: DEC-21 (the capture axis), D-179 and REC-190 (BOB #26, #31, #32), D-533, D-530, D-556 (BOB #33, #34), D-693 and D-709 (BOB #35). DEC-19 and DEC-56 (the route marker) are `provenance-routes`' (N512).
```

## 20. Suggestions: checks carried here

Line 181, before:

```text
- **Checks carried here.** C-53.1–C-53.9, C-53.13, C-53.14 (this module's own row, `REGISTER_ENTRY_CHECKS`; K324), C-34.1–C-34.4, C-24.1–C-24.3, C-89.1 and the C-18 register arms (R42–R46) move with this module. Of the rest of C-18, C-18.5 (`gathering.json`) goes to monitoring and C-18.7 stays with C-18.8 in promotion (K49). C-53.10–C-53.12 are publication's.
```

After:

```text
- **Checks carried here.** C-53.1–C-53.9, C-53.13, C-53.14 (this module's own row, `REGISTER_ENTRY_CHECKS`; K324), C-24.1–C-24.3, C-103 (R58) and the C-18 register arms (R42–R46) move with this module. C-34.1–C-34.4 moved to `provenance-routes` and C-89.1 to `attestation` (N512). Of the rest of C-18, C-18.5 (`gathering.json`) goes to monitoring and C-18.7 stays with C-18.8 in promotion (K49). C-53.10–C-53.12 are publication's.
```

## 21. Suggestions: the evidence store

Line 185, before:

```text
- **The evidence store** (the R2 working bucket) is `record-core`'s, added to its requirements before T3 (K49); until then `attest`, `registerAudit` and `partsHeld` take it through injected callbacks.
```

After:

```text
- **The evidence store** (the R2 working bucket) is `record-core`'s, added to its requirements before T3 (K49); until then `registerAudit` and `partsHeld` take it through injected callbacks (`attest`, now `attestation`'s, too).
```

## 22. Suggestions: a new bullet after line 188 (option B's holdovers)

Before: nothing (an insertion).

After:

```text
- **Held over until T26 (option B, BOB #100's review 1).** This module's T25 job deletes the moved code but keeps the names a later layer imports, until that importer's T25 job re-points: `routeFinding` (retrieval, L5), `instanceStatement` (network-notices, L8), `attestOp` with `attest` (plane, L11), `provenanceOps`' three route arms (plane, control-plane, L11; R53's mark) and `ROUTE_MARK_CHECKS`, `ATTEST_CHECKS` (control-plane, affordances, L11). Each is deleted in this module's T26 job. A stateful service writing a moved table is never kept, so no table has two writers.
```
