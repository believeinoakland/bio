# review — extraction map

**Status** · Measured 2026-09-26 on `tranche/T3` @ `35ea098` (after promotion's merge) by a drafting worker for BOB #42 (P18). Line ranges are `grep -n`-verified in `bio-plane/src/store.mjs` (49,817 lines), `schema.mjs` (3,964), `checks/bio-checks.mjs` (15,682) and `index.mjs` (13,438); the extraction job confirms them. A method's range runs from its signature to its closing brace; the comment block above it goes with it. The contract is `build/requirements/review.md` (R1–R25); K6, K23, K31, K61 and K64 apply. The module exports `reviewOf(ctx)`, reaching its uses through their factories on the same `ctx` (K61); `legacy-store` delegates to it. `from` should read `["legacy-store", "legacy-checks"]`. Where the module sits in the order is Open for Bob 1; this map is written for either answer. **Re-cited** on `tranche/T7` @ `fd7e691a17` by a worker for BOB #53 (K214), from `build/extraction/T8-recheck.md` re-measured after T7's layers 7 and 11: `store.mjs` (18,726 lines), `schema.mjs` (1,176) and `bio-checks.mjs` (13,732) lines are current there; `index.mjs` cites are pending T7's close (legacy-index is still changing it) and are marked so. K102 placed the module in layer 8 after `case-authoring` (§5.1).

## 1. What moves to `review`

| what | where today | lines | moves |
| --- | --- | --- | --- |
| REC-126 header, `REVIEW_DRAFT_FIELDS`, the caps, `REVIEW_MARKING`, `#reviewRefusal`, `#noReviewCopy`, `reviewAct`, `#REVIEW_AUTHORITY`, `#notReviewOwner`, `#draftIdentity`, `#statedEdition`, `#draftLinkOf`, `#caseIdentitySentence`, `#caseDraft`, `#ROLLBACK`, `#reviewGates`, `#draftPublisher`, `#liveReviewGrant`, `#grantAdmitsCaseEdition`, `#draftForMember`, `#seesProjectDrafts`, `#reviewGrant`, `#reviewRevoke`, `#reviewLastChange`, `reviewCopy`, `reviewComment` | store.mjs | 6587–7362 (`reviewAct` 6683, `#caseDraft` 6796–6877, `#reviewGates` 6890, `#grantAdmitsCaseEdition` 6949, `#reviewGrant` 6978, `#reviewLastChange` 7073, `reviewCopy` 7131–7335, `reviewComment` 7337–7362) | yes (R1–R18); the five predicates become services (R8, R9) |
| REC-198 header, `caseDraftList`, the END marker | store.mjs | `caseDraftList` 8133–8160 with its header and marker (REC-198's draft-fence header is at 6962) | yes (R19) |
| migration `case_drafts.statement_by` with its comment | store.mjs | 957 | yes, with the table |
| dispatch `casedraft`, `reviewgrant`, `reviewrevoke`, `reviewcopy`, `reviewcomment`; `casedrafts` | store.mjs | 18681–18701 | yes (K3) |
| `REVIEW_COPY_CHECKS` (C-87.1–C-87.11) with its header | bio-checks.mjs | 12475–12550 | yes (R23) |
| the `MACHINE_CANNOT_REVIEW` row (C-32.16) | bio-checks.mjs | 8095 | yes, split from `MACHINE_FENCE_CHECKS` by number, unchanged |
| `case_drafts`, `review_grants`, `review_comments` with their header and indexes | schema.mjs | `case_drafts` 965, `review_grants` 993, `review_comments` 1010 | yes (K4); their whole-store purge entries (store.mjs 654–655) move to the module's `declarePurge` (R24) |

**Measured size:** store.mjs 845 (464 code), bio-checks.mjs 126 (84), schema.mjs 70 (35): about 1,040 lines, about 580 of code.

## 2. What stays, or goes elsewhere, and why

| what | where today | lines | goes to | why |
| --- | --- | --- | --- | --- |
| D-150's statement acknowledgements: `STATEMENT_ACK_MAX`, `#statementSha`, `acknowledgeStatement`, `#ackFrontmatterLines` … `#reauthorAcknowledgements`, `#statementWriter`, `#statementAcknowledgements`; dispatch `statementack`; `STATEMENT_ACK_CHECKS` (C-82.2–C-82.7); `statement_acknowledgements` | store.mjs 7396–8121, 18695; bio-checks.mjs 12367–12431; schema.mjs 1031 | about 850 | `case-authoring` (K97; §5.2) | Publication §3 rule 11: they are listed in and spliced into the case document; they use the review copy's doors (R8–R10) |
| `reviewAnswer` (DEC-31's in-band quartet, the 404) | index.mjs 3678–3709 (index.mjs: re-cite at T7's close) | 32 | `control-plane` | runs in the Worker and hashes the answer with `publication`'s `inbandQuartet` (`inband.mjs`, layer 8) |
| the ungated door: the recipient's secret hashed, the member's reader resolved | index.mjs 6400–6445 (index.mjs: re-cite at T7's close) | 46 | `control-plane` | authentication (K3) |
| the grant's secret, generated and returned once | index.mjs 13401–13428 (index.mjs: re-cite at T7's close) | 28 | `control-plane` | the Durable Object never holds the value (R21) |
| classes, capabilities, author stamps for these ops | index.mjs 1115–1153, 2196, 2239, 2552–2557, 12158–12160, 13343–13346, 13429–13432 (index.mjs: re-cite at T7's close) | — | `control-plane` | K3 |
| `publishCase`'s draft binding (`draftNamed`, `PUBLISH_DRAFT_*`) | store.mjs 5043–5064 (inside `publishCase`) | — | `case-authoring` (K97) | the act of publishing; calls R8/R9 |
| `caseDocumentFacts`' grant door | store.mjs 6393 | — | `publication` | calls `grantAdmitsCaseEdition` |
| `projectBar` | `strength/index.mjs` 683; `reviewCopy` calls it at 7333 | — | `strength` (R14) | moved; read through strength R14 |
| `testimonyReach` | `basis-versions/index.mjs` 526; store delegate 9664, called by `reviewCopy` at 7306 | — | `basis-versions` (R39; K202) | moved; read through basis-versions R39 |
| `#attributionInForce` | store.mjs 9704 | — | `publication` (observation-log map §5.1) | called |
| the id-prefix census rows `DRAFT` and `RVG` | store.mjs 13138–13139 (`record-core/index.mjs` 218, 223 also names the prefixes) | — | `record-core` (`mintOpaqueId`'s census) | the census names every prefix's table; it reads the moved tables by a stated read contract or asks this module |

## 3. Callers to rewire

- `#draftForMember`, `#draftIdentity`: `publishCase` (5046, 5058; `case-authoring`), `acknowledgeStatement` (7435, 7447–7449; `case-authoring`).
- `#liveReviewGrant`: `acknowledgeStatement` (7432); `#grantAdmitsCaseEdition`: `caseDocumentFacts` (6393; `publication`).
- `#noReviewCopy`: `acknowledgeStatement` (7433, 7444, 7448, 7465).
- Direct SQL on `case_drafts`: `#statementWriter` (8066), `case-authoring`'s (K97); it asks this module for the drafts of a project at a case identity, or reads by a stated read contract.
- `#caseIdentitySentence`: `publishCase` (5064; `case-authoring`).

## 4. Old-battery tests that anchor on the moved source

Source-reading suites and controls that re-anchor with the move (`legacy-tests` entries, K53): `reviewcopy.control.mjs`, `reviewcopy-inband.control.mjs`, `conclude-project.control.mjs`, `project-sight.control.mjs`, `machine-fences.test.mjs` (the C-32.16 region), `d448-review-copy-translation.test.mjs`, `d470-catalog-census.test.mjs`, `derivation-bounds.test.mjs` (`#draftPublisher`'s roster), `gate-reads.test.mjs`, `mint-ledger.test.mjs`, `opaque-ids.test.mjs`, `bounds.test.mjs`, `provenance-marker.test.mjs`, and `civicos-ui/test/review-copy*.mjs` (they read the plane's answer). Suites that drive the behaviour and follow the module as its tests: `reviewcopy.test.mjs`, `reviewcopy-inband.test.mjs` (with control-plane), `rec213-reviewcopy-writer.test.mjs`, `rec217-draft-binding.test.mjs` (with publication), `d543-instant-precision.test.mjs`, `d573-lastchange-tie.test.mjs`, `project-discoverable.test.mjs`, `fence-e2e.test.mjs`, `aicredential.test.mjs` (the machine fence). `d150-statement-acknowledgement.test.mjs`, `d507-statement-ack-translation.test.mjs`, `rec212-statement-writer.test.mjs` and `mk7-attribution.test.mjs` follow `publication`.

## 5. Undetermined, conflicts, and code others could claim

1. **The order (Open for Bob 1).** `#reviewGates` calls `publishCase` (layer 8) in a rolled-back transaction; `#draftIdentity` reads `published_cases`, `#caseDraft` reads `cases`, `#draftLinkOf` reads `case_documents`; `reviewCopy` calls `#statementAcknowledgements` and `#attributionInForce`. `publication` calls R8, R9 and R5 back. With `review` in layer 6, publication registers the dry run, the edition reader, the acknowledgement list and the attribution reader here (K31); with `review` after `publication` (recommended), publication offers the draft, grant and acknowledgement doors as registrations `review` fills.
2. **The acknowledgements go to `publication`.** They take the review copy's doors but are the case document's: listed in it, spliced into an unsigned one, keyed by the statement's hash. This draft leaves them out (about 850 lines); if BOB places them here, R-numbers follow for C-82. *Closed: they are `case-authoring`'s (K97).*
3. **Uses.** `modules.json` gives `legacy-checks`, `record-core`, `membership`, `inquiry`, `basis-versions`, `strength`. The moved code also calls `provenance` and `publication`, and calls neither `inquiry` nor `basis-versions` (findings are read as bundles). Proposed: add `provenance`; `publication` per item 1; drop `inquiry` and `basis-versions` unless the job finds a call. *Superseded: `modules.json` has `legacy-checks`, `record-core`, `membership`, `basis-versions` (for `testimonyReach`, R39), `strength`, `publication`, `case-authoring` (K202), and the requirements' Uses agree (K206).*
4. **Declared uses of `review`.** `publication`, `affordances` and `queue` declare one. If `review` moves after `publication`, publication's use is replaced by the registrations of item 1 and `review` gains a use of `publication`; `affordances` and `queue` (layer 11) keep theirs.
5. **Other claimants.** `publication`: the whole construct by canon (Publication §6A), the acknowledgements (item 2), `required_strength`'s freezing rule. `strength`: `#projectBar`. `control-plane`: the in-band quartet and the secret's mint (§2).
6. **Registrations legacy-store fills in this module's name** (K206): none today. If `publication` is extracted first, legacy-store fills publication's review provider (its R23) from these helpers until this job, which then removes that fill and registers its own (the registration rule, `draft-T8.md`).
