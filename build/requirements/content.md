# content — requirements

**Status** · DRAFT by a drafting worker for BOB #42, 2026-09-26 (P18), from a reading of the code; for Bob's approval (a product module, P17). Layer 4. Code today (measured on `tranche/T3` @ `bde7923`; `build/extraction/content.md` has the table): `bio-plane/src/store.mjs` 20836–20918 (the writer's header, `#captureForContent`), 21269–21699 (`#contentPlanFor`, `#contentRowFor`, `#contentLegRefusals`, `mintContent`, `contentMint`, the transcription helpers), 22476–22699 (`transcribe`, `transcriptionAttest`, `transcriptionRead`), 23909–24327 (`#contentStandings`, `#markContentStale`, `contentRow`, `#contentStanding`, `#contentEarned`), 24378–24479 (`contentRead`), 40324–40682 (the cross-version extent test, grade and per-passage notice), 45032–45067 (bounds), and the dispatch entries `content`, `contentmint`, `transcribe`, `transcriptionattest`, `transcription` (52332–52359, 52830–52846). `bio-plane/checks/bio-checks.mjs` 1966–2029 (mint states), 12963–13686 (the extent grammar, C-45, `extentRelation`), 13768–13850 (C-52), 14948–15004 (C-80), 15440–16009 (`checkContentExtent`, `mintUndetermined`), 16567–16591 (`contentIdFor`). `schema.mjs`: `content`, `transcriptions`, `transcription_attestations`. `from`: `legacy-store` and `legacy-checks` (K64's pattern); `index.mjs` holds only these ops' routing, gates and stamps, which stay with `control-plane` (K3). Not yet met: R9 (D-374), R10 (D-670), R11 (D-580, K49), R14 (D-686, D-710), R18 (D-675), R32 (D-419), R33 (REC-204; Open for Bob 2). Old-plan rows carried to `content`: REC-204, D-374, D-419, D-670, D-675, D-686, D-710, and D-714 (a fixture for REC-204's unit order, folded into R33's tests).

**Size (P6).** About 3,420 lines move (about 1,680 without comment-only lines): `store.mjs` 1,710, `bio-checks.mjs` 1,523, `schema.mjs` 183. Under the 4,000 at which BOB reports a module; one session can read it with the public parts of its uses. This assumes the parallel `extraction` draft's claims (its R30, R36–R38: the citation context readers and text attestation, 429 + 38 lines) and the question arm of the version notice going to `reevaluation` (134 lines, map §2); with both here it would be about 4,040.

## Public

### Purpose

Content is the unit the record points at: a reference to a part of a captured document, up to and including the whole. This module holds the extent grammar (which part of a document), the content address (`hash(capture, extent, chain)`), the content row minted over it and what it may claim on the transcription axis, and a member's typed transcription of a part, which a second member attests. It says, for one cited passage, whether a newer capture exists and whether the passage is carried into it, without moving anything. It never moves a reference: the record points where a member pointed.

### Provides

Terms. An **extent** is `{kind, …}`; its kinds are `document`, `pdf-page` `{page, rect?}`, `sheet-cell` `{sheet, cell}`, `slide-shape` `{slide, shape}`, `doc-para` `{para, run?}`, `sheet-range` `{sheet, range}`, `doc-table` `{table, cell?}` and `image` `{part}` or `{page, rect}`; pages, slides, shapes, paragraphs and tables are counted from 0 in the captured file. The **chain** is the capture's transcription chain (`text-chain`). A **row** is `{content_id, capture_sha, bundle_id, extent_kind, extent, ref, chain, derivation_cap, page_count, minted_by, at, stale, cited_as}`. A capture's **context** `{chain, pageCount, container}` is `extraction.contentContextFor`'s. Every refusal names a `reason` or `code`; one with a catalogue row carries its `check` and `translation`. A viewer is the control plane's stamp, read through `membership` (R37).

**The extent grammar: canonicalExtent(extent), describeExtent(extent), contentIdFor(captureSha, extent, chain), contentCitedAs(extent), citationExtent(citation), citationContentId(citation), extentRelation(outer, inner), checkContentExtent(extent, context), mintUndetermined(extent, context)** Pure; never throw.
- **R1** Only the eight kinds above are extents. `dom` (a region of a web page) is refused `CONTENT_EXTENT_NO_PRODUCER` (C-45.4) while nothing produces its addresses; any other kind, a missing field or a malformed value is `CONTENT_EXTENT_UNREADABLE` (C-45.3), never read as the whole document.
- **R2** `canonicalExtent` gives one form per extent: rectangle corners ordered, A1 cell and range `$` markers and case removed, an image part lowercased, fields in fixed order. `describeExtent` gives its human form (IC-1's required `ref`), keeping a caller's non-empty `ref`.
- **R3** `contentIdFor` is the SHA-256 over `{v: 1, capture_sha, canonical extent, canonical chain or null}`: one passage of one capture under one chain has exactly one id; a different chain is a different id.
- **R4** `contentCitedAs` is `bytes` for an `image` (the image cited as itself: chain and cap null by meaning, never undetermined) and `text` otherwise.
- **R5** `citationExtent` reads a citation that names no part as `document` (there is no `unstated` extent, Bob's 5.3); `citationContentId` answers a citation's 64-hex `content_id`, else null.
- **R6** `extentRelation` answers `same`, `narrower` (the inner lies inside the outer), `wider`, `disjoint`, or `unreadable` (a kind not in R1, or a coarse field missing on either side).
- **R7** `checkContentExtent` refuses, with the figure in `detail`: `CONTENT_EXTENT_OUT_OF_RANGE` (C-45.1) for a page at or past `pageCount`, a sheet not in the workbook, a cell past the format's grid capacity (never the used range: an empty cell exists), a paragraph past the count, a slide past the deck length, a shape past the slide's count, or a table or image part not listed; `CONTENT_EXTENT_NO_CHAIN` (C-45.2) for a text extent other than `document` over a capture with no chain; `CONTENT_EXTENT_NOT_A_CONTAINER` (C-45.11) for an image `part` on a capture that is not an office container; `CONTENT_EXTENT_NO_IMAGE_PAINTED` (C-45.12) for an image by page and rectangle where the held list says the page paints none. A bound the context does not hold is not a refusal (R8).
- **R8** An extent admitted without its bound held answers exactly one field, `undetermined: {level, why}`, naming what was not held (RULED 2026-09-23, CPDF-22).
- **R9** A `pdf-page` rectangle is bounded by the page's MediaBox as the reading holds it, refused C-45.1 naming the box when outside. *(not yet met: D-374)*
- **R10** A `pdf-page` or region rectangle states its coordinate space; an image-pixel rectangle (an OCR anchor) is converted to default user space or refused, never read as user space. *(not yet met: D-670)*

**captureFor(bundleId, authored?) → capture sha or null** The capture a citation of a document addresses.
- **R11** A non-empty `authored` capture held for the bundle wins; one not held answers null, never replaced by another. Otherwise the bundle's first-held capture by `provenance.capturesOf`, never the newest; none answers null. *(not yet met: D-580, K49 — orders `register.registered` against `readings.at`)*

**mint({bundleId, captureSha, extent, mintedBy, at, context?}) → `{ok, content_id, minted, undetermined?}` or refusal**
- **R12** Refuses as R7 against the capture's context. Otherwise the row is written with R3's id, `ref`, the capture's chain (null for `bytes`), `derivation_cap` (`text-chain.derivationCap` over the extent's page and rectangle, the whole chain otherwise; null is undetermined, stated), the `page_count` held at mint, `minted_by`, `at` and `cited_as`.
- **R13** Mint or find, never rewrite: a held id answers `minted: false` and keeps the first minter and instant.
- **R14** A row's `chain_kind` is how its extent was read: `text-chain.chainKindFor` over the pages it covers, `mixed` when covering steps differ; every reader that labels machine-read text treats `mixed` as containing it (DEC-4). *(not yet met: D-686, D-710 — it is the whole chain's last step)*

**contentMint({bundleId, extent, mintedBy, viewer, at}) → `{ok, minted, capture_sha, …row, undetermined?}` or refusal** (`op=contentmint`)
- **R15** Refusals in order: `NO_MINTER` (empty stamp), `NO_TARGET`, `NO_SUCH_BUNDLE` (absent or not visible, the same answer), `NOT_A_DOCUMENT`, `NO_BYTES_HELD` (R11 answers null), then R12's. No extent is `document`. `mintedBy` is the control plane's stamp; a body field is never read.
- **R16** Every read of a row carries its mint label `{by, state, machine_work, says}`: `member_marked`, `plane_minted` (`plane`), `machine_marked` (a machine identity) or `unstated`. A machine-marked row is machine work, never attested by a machine, and part of a finding only when a member cites it.

**contentRow(contentId) → row or null; contentRead({id, viewer, extras}) → answer or refusal** (`op=content`); **standings(contentIds) → `{id: standing}`**
- **R17** `contentRead` is fixed-key: any parameter but `id` and `viewer` is `FIXED_KEY_ONLY` naming them sorted; no id is `NO_ID`; an absent or invisible row is `NO_SUCH_CONTENT`, the same answer.
- **R18** The plane's own `store` parameter is accepted. *(not yet met: D-675)*
- **R19** The answer carries the row, its label (R16), `says` (stale or current), the transcription axis (R21), the attestations that bear on it (`covering`, `all`, `count`, `truncated?`, `why`), the capture axis stated as the document's (no per-portion capture grade), and the connection axis as not answered by a row read (`NO_SUBJECT_IN_THIS_READ`).
- **R20** `standings` answers at most 200 ids in one set-based read, each without a connection axis.
- **R21** The transcription axis: not applicable for `bytes`; undetermined, stated, for an extent kind whose coverage cannot be evaluated; otherwise `text-chain.gradeCeiling(chain, target, covering)`, where `covering` is the capture's text attestations (`extraction`) made against the row's chain, or, for a typed row, only the attestations of that typing by members other than the typist. A capture's attestations never raise a typing, nor a typing's the capture's text.

**markStale(captureSha, chain) → count** Registered on `extraction`'s reading-replaced notice (its R24; K31's pattern).
- **R22** Every row over the capture whose recorded chain differs from the new non-null chain, and is not a typing, becomes `stale`, one way; nothing is deleted or moved; a stale row still resolves and says it was cited under an earlier transcription. A null chain marks nothing.

**transcribe({bundleId, extent, text, transcriber, viewer, at}), transcriptionAttest({contentId, attestor, viewer, at, note}), transcriptionRead({id, viewer})** (`op=transcribe`, `op=transcriptionattest`, `op=transcription`)
- **R23** Refusals in order: C-52.1 (a machine or empty transcriber), C-52.2 (no, invisible or non-document target), C-52.3 (no capture), C-52.4 (no portion: null or `{}`), R7's against the typed chain, C-52.5 (a portion no attestation could scope: `bytes`, or not document, page or region), C-52.6 (empty text), C-52.7 (over 131,072 bytes, never truncated).
- **R24** Success mints a row whose chain is one `typed` step (the member, the text's SHA-256), minted by the typist, and keeps the text byte for byte; the same typing again is found, not rewritten. Its fidelity is undetermined until a different member attests it.
- **R25** `transcriptionAttest`: C-52.8 (no or invisible typing), then `text-chain.checkAttestation` (C-35.10, C-35.11), then C-52.9 (the typist); one attestation per (row, attestor), a repeat replacing it; the answer carries the ceiling before and after; the typing is unchanged.
- **R26** `transcriptionRead`: C-52.8; the text, digest, chain, cap, ceiling and attestations, each with `counts` false for the typist's own.

**citationRefusals(citations, label) → refusals; resolveCitation(citation) → `{content_id, minted, undetermined?}` or `{content_id: null, null_case, why}`** For the modules whose edges cite (inquiry, basis versions, cases, actions). A citation is `{target, extent?, extent_capture?, content_id?}`.
- **R27** A non-document target with a part or a content id is C-45.3; a named content id this record does not hold is `CONTENT_ROW_UNKNOWN` (C-45.5), one of another document is `CONTENT_ROW_NOT_THIS_TARGET` (C-45.6); a part of a document with no held capture is C-45.2; otherwise R7 against R11's capture. Every refusal is returned, one context per capture per call.
- **R28** `resolveCitation` uses a named content id as it is; otherwise mints (`plane`) R5's extent over R11's capture; a non-document target answers `INQUIRY_TARGET` and no capture `NO_BYTES_HELD`, each with `content_id: null` and the reason.

**passageNotice({contentId, viewer}) → notice or refusal** One cited passage against the newer captures of its document. Writes nothing.
- **R29** Whether a newer capture exists is asked of `provenance.versionChain` at each address the passage's capture was retrieved from (at most 20; past that the rest are not asked, and the answer says so). `no_newer_capture` only when every chain was read and holds nothing after it; `newer_capture_matched` when every newer capture's candidate matched; `newer_capture_undetermined` otherwise; `chain_unread` (`newer: null`) when the capture has no recorded address, an address was not asked, or a chain does not hold it for this viewer, never read as none. The answer states the chains are the ones this viewer sees. An absent or invisible passage is `VERSION_NOTICE_NO_CONTENT` (C-80.3).
- **R30** A candidate's extent holds only where the newer capture's context holds the bound tested and R7 passes; otherwise its reason says whether the extent lies outside the newer capture or the record has not read it. A row already minted at that extent of the newer capture is named; nothing is minted. A candidate is never the same passage.
- **R31** Each candidate's grade is read from the captures' text units (`extraction`), never from the extent test: `A` byte-identical at the extent, `B` identical text at another position (`found_at`), `C` word-multiset Dice at or above 0.7 (`similarity`), `NOT_FOUND` only where the newer capture's units are held whole, else `UNDETERMINED` with its reason (a partial or absent index, an extent no unit carries, `bytes`). `A` and `B` are unaffected, `C` and `NOT_FOUND` affected, `UNDETERMINED` undetermined; the notice's `affects` is affected if any candidate is, else undetermined if any is, else unaffected, null with no newer capture and undetermined when unread.

**cropOf({contentId, viewer}) → image bytes or refusal**
- **R32** The crop of an image cited by page and rectangle, through `pdf-pixels`, served as a derived rendition that says so; an absent or invisible row is `NO_SUCH_CONTENT`. *(not yet met: D-419)*

**The envelope**
- **R33** An office document's envelope items (tracked-change authors, comments, core properties, speaker notes) are citable as content through an `envelope` extent. *(not yet met: REC-204; Open for Bob 2)*

## Private

### Uses

- `legacy-checks`: the C-45, C-52 and C-80 rows until they move here (R38), `isMachineIdentity`, `canonicalJson`, `sha256HexSync`.
- `text-chain`: `checkChain`, `checkAttestation`, `derivationCap`, `gradeCeiling`, `extentCovers`, `describeChain`, `chainKindFor`. *(not declared in `modules.json` today)*
- `pdf-pixels` (K70; `pdf-worker` until T4 applies it): the crop (R32).
- `record-core`: `recordOf(ctx)`, `transact`, `bundleInfo` (a target's type), `declarePurge`.
- `membership`: `membershipOf(ctx)`, `viewerPredicate` (R37).
- `provenance`: `capturesOf` (R11), `versionChain` and the captured locators (R29).
- `extraction`: `contentContextFor` (R7, R12, R30), the text attestations over a set of captures (R19, R21), the text units and index state of a capture (R31), and `onReading` (R22).
- `capture`, `id-spaces`: nothing in this module's share calls them (map §5).

### Invariants

- **R34** A row is first-class: never rewritten, never deleted but by its bundle's purge, and the record never moves a reference's target without a member's act, even when the passage is byte-identical (Bob, 2026-09-14; 2026-09-25 rule 1).
- **R35** Two graded facts, never one: the capture grade is the document's (`provenance`) and the derivation cap is the row's; nothing here raises a capture grade, and a leg may claim no more than the weaker.
- **R36** A machine credential may mark a passage citable, labelled (R16), and never attests (C-35.10) or types (C-52.1); every authorship field is the control plane's stamp, never a body's.
- **R37** Every act and read naming a document or row answers one the viewer may not see exactly as an absent one.
- **R38** Each check moves here as an invariant with its test (K6): C-45.1–C-45.6, C-45.11, C-45.12, C-52.1–C-52.9, C-80.3.
- **R39** `content`, `transcriptions` and `transcription_attestations` carry `bundle_id` and are declared to record-core's purge (K23).
- **R40** No place is named in this module's behaviour or outward text.

### Satisfies

- `docs/architecture/BIO_System_Design.md` §3, construct 4.
- `docs/architecture/BIO_Content_Framework_v0_10.md` Part II §14 (DEC-23, DEC-24, DEC-4; §14.2 the two graded facts and the member's transcription; §14.4 who may do what, the leg's cap, never moving an edge, the six rulings of 2026-09-14), §15 (the forms; the one undetermined shape, CPDF-22), §18 piece 1, §18.1 (the notice, graded; the pinned reference, REC-220).
- `docs/development/CONTENT-EXTENT-DESIGN-SPACE.md` §6 and the doctrine it records (§5.1–§5.8).
- `docs/development/EXTRACTION-BREADTH-DESIGN.md` §3 (tables and images as content, `cited_as`).
- `docs/architecture/BIO_Membership_Architecture_v2.md` §7 (sight).
- `docs/architecture/BIO_Design_Requirements_v2.md`: machine work labelled, never presented as the publisher's.

### Suggestions

- **Factory.** `contentOf(ctx)` answers the one instance per Durable Object storage and reaches `record-core`, `membership`, `provenance` and `extraction` through theirs (K61). The op handlers move here (K3).
- **What stays out.** The leg-side acts and projection (`cite`, `promote`'s leg loops, `ensureLegContent`, `#backfillLegContent`, the carry-forward of a prior row) are `inquiry`'s and `basis-versions`', registered with promotion (K31) and calling R27–R28; C-45.7–C-45.10 (the cite act) go with them, `narrow` and C-50 to `basis-versions`. `op=versionnotice` and its question arm (`target=`, every leg of an inquiry; C-80.1, C-80.2) read `inquiry_basis` and go to `reevaluation` with REC-222 and REC-223, calling R29 per passage. `extractPropose` is `ai-runs`' (it reads `ai_runs`), minting through R12. `contentAxis` reads `observation_log` and is `observation-log`'s. `idMatch` is `entities'`. A portion's connection grade is `connections`'.
- **Standing text.** `#contentStanding` still says readings carry no position; the connection axis leaves this module (R20), so the sentence goes.
- Tests: each C-45, C-52 and C-80.3 refusal gets a negative control; R13, R22 and R34 get over-strictness arms (a re-promotion finds the same row byte for byte). Built work for D-374, D-419, D-670, D-675, D-686, D-710 and REC-204 is on their `land/worker/*` branches, judged at the job.

## Open for Bob

1. **Is a member told when a better reading of the same capture changes a passage they cite?** Your rule of 2026-09-25 notifies a member when an updated version of a document affects the referenced content. A re-read of the same bytes under a better engine (OCR improved, a reader fixed) can also change a cited passage's text: today the row is marked stale and says so when read (R22), and nobody is told. *Recommendation:* yes, as for a newer version: graded as in R31 (the old text against the new), notified only when affected or undetermined, the member choosing to keep or adopt; nothing moves by itself.
2. **Are an office document's envelope items citable?** Tracked-change authors, comments, core properties and speaker notes are read but cannot be searched or cited (REC-204, built on its branch). *Recommendation:* yes, as an `envelope` extent (R33), judged at the job: under DEC-5 they are part of what the document says, and a comment or a tracked change is often the finding.
