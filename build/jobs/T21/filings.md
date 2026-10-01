# filings (T21)

**Status** · session_01TvVyWHR59YbbaUAFjxHb9M · depth 2 · COMPLETE · handled B5

## J1 · QUESTION

My readings, on which I carry on; each changes only what I build, not a requirement's meaning. Upstream (local-facts, action-clocks, filing-templates) has not merged; I am doing the parts that do not read them (R8, R10, R17's packet arm, the retired rows, the fixtures re-keyed to R40's object) and will merge `tranche/T21` when filing-templates lands.

1. **The `filing_templates` table.** K927 adopted "R26's saved templates migrate as drafts", so filing-templates' migration reads my table. I delete `templateSave`'s keeping, `templatesFor`, the moved rows and their tests, but **keep the table's CREATE and its purge declaration** (R19) as the read contract filing-templates' migration reads, its rows written by nothing any more. If you would rather the table be dropped (by me, after filing-templates' migration has run), say so.
2. **R28's order.** After R1's refusals: `TEMPLATE_AND_TEXT` first (both given), then with `template` the `offeredVersion` refusals, `TEMPLATE_USE_BRIEF`, `TEMPLATE_KIND_MISMATCH`; with `text`, `TEXT_UNWRITABLE` then `TEMPLATE_BLANK_UNKNOWN`; with neither, the profile's `file` template, else `TEMPLATE_NOT_NAMED`. With `text`, `TEXT_UNWRITABLE` and `TEMPLATE_BLANK_UNKNOWN` are filing-templates' codes and rows (R2 there: `TEMPLATE_TEXT_REFUSED`, C-115.35 moved); R28 names `TEXT_UNWRITABLE` (C-115.12, mine, R6). I answer `TEXT_UNWRITABLE` from my own row (C-115.12, its `where` widened to filingPrepare) and pass `TEMPLATE_BLANK_UNKNOWN` through as filing-templates' (judged by its `blanksOf`).
3. **`TEMPLATE_NOT_NAMED`'s list** (at most 20 offered `file` templates for the kind) is read through `filing-templates.templatesFor` (its R14), which my Uses does not name (it names `templateRead`); I read it there.
4. **R29's statement** goes after R24's disclosure and R4's advisory, before the template's text: disclosure, advisory, "not written for", text. "Naming it" names the action kind's profile (its `profile` tag).
5. **R8 with no counsel** stores `counsel: null` and the head and export say no counsel is named; `NO_COUNSEL` at Tier 1 or 2 only for a counsel given without both name and organisation (or a field too long).
6. **R31's briefing** at Tier 3 with no counsel is refused `NO_COUNSEL` before R31's template refusals (R8's order).

## J2 · REPORT

For other modules (nothing changed outside my paths):
1. **Generated artifact staled:** the plane's bundle (`bio-plane/dist/bio-plane.bundled.mjs`, `.bundle.json`). `fleetbundles.test.mjs` names it STALE: action-clocks' sources already did that before my change, and my changes under `bio-plane/src/filings/` add to it. Regenerated nothing.
2. **affordances / op-declarations / plane (L11):** filings' op map no longer holds `templates`; it is filing-templates' op (its R14, `filingTemplatesOps`). As a result `test/m/affordances/catalogue.test.mjs` "R3 R7 R12: layer 9's 41 mutating ops … 21 reads …" is red: it expects `templates` in filings' map. `op-declarations/index.mjs`:1126 (`FILINGS_READS`) still lists `templates`. `templatesave` stays mine and now takes `{filing, template?, project?, name?, kind?, use?, profiles?, notes?}` in the body. `filingprepare` gains `text` in the body, with `template` as `{id, version?}` (or a bare id); `counselpacket` gains `template`. Every one of them belongs to the L11 jobs to re-point.
3. **Pre-existing reds on `tranche/T21`, not mine** (I checked them on a clean checkout of the tranche): `control-plane/families.test.mjs` R22 (`CHECK_FAMILIES` lacks local-facts' and filing-templates' families) and `control-plane/catalogue-end.test.mjs` R43 (the catalogue end's digest).
4. **escalation (and action-plans) read `filingsFor`:** each draft now carries `template` (R29: `{id, version, sha, origin}` with its state, approver and reviews and any `flags`, or null for the member's words; a draft stored before T21 shows its old record as stored), and each packet version carries `template` too (R31). The change only adds fields: nothing is removed or renamed. A packet below Tier 3 may have `counsel: null`. `availableActions` is unchanged. escalation 175/0 with filing-templates, action-plans, action-clocks and local-facts.
5. **action-clocks (an improvement):** `factAnswer` and `holidayFact` (`action-clocks/index.mjs`:610, :630) are private, so my `dates.mjs` `factReader` carries a ~20-line copy that turns a `factStatus` answer into the shape `computeDeadline`'s `factOf` takes. An exported `factReader(localFacts, viewer)` there would let me delete mine.

## J3 · COMPLETE

filings T21 on `job/T21/filings` @ 2dc5708732, with `tranche/T21` merged in (local-facts, action-clocks and filing-templates all on it). Changed: `bio-plane/src/filings/` `index.mjs`, `checks.mjs`, `schema.mjs`, `dates.mjs`, and `bio-plane/test/m/filings/`, where `templates.test.mjs` is new.

**Entries applied (B1, B2/K986, B3/K989, B4/K990, B5/K991).**
- (1) R26 retired. The library copies, `templateSave`'s keeping, `templatesFor`, `#templateRow`/`#templatesSeen`, `FILING_BLANKS`, `FILING_TEXT_MAX`, `TEMPLATE_NAME_MAX`, `TEMPLATES_FOR_MAX` and `op=templates` are all deleted. The blanks, the max and `blanksOf` are now imported from filing-templates and re-exported, with no copy held here. The `filing_templates` CREATE and its purge declaration are kept, written by nothing (K986 (1)).
- R32: `templateSave({filing, template?, project?, name?, kind?, use?, profiles?, notes?})` gives `NO_SUCH_FILING` then `TEMPLATE_FROM_UNAPPROVED`, then hands the approved text and `from: {filing, sha}` to `templateDraft` in-process and answers its answer, refusals included. For a new template, the defaults are: the project the draft drew on, the action's kind, `use: file`, and the profiles that give the kind (else `general`).
- (2) R28: `filingPrepare({template?: {id, version?} | id, text?})`. With `template`: `offeredVersion`, its refusals passed through, then `TEMPLATE_USE_BRIEF`, then `TEMPLATE_KIND_MISMATCH`. With `text`: `TEXT_UNWRITABLE` (C-115.12), then `TEMPLATE_BLANK_UNKNOWN` (filing-templates' row). With both: `TEMPLATE_AND_TEXT`. With neither: the latest approved version of the view's `use: file` template for the kind, else `TEMPLATE_NOT_NAMED`, listing at most 20 offered file templates (`templatesFor`, K986 (3)) with `truncated`.
- R29: every draft records `template: {id, version, sha, origin}` or null. The not-written-for sentence goes after the disclosure and the advisory (K986 (4)). `filingsFor` and `counselPacketRead` show the template's state, approver, reviews and `flags` (updated: "prepared from version n, since updated by version m"; retired, with its reason).
- R30: a packet's deadlines are counted by `computeDeadline` with the action's counterparty and kind and a `factOf` over `local-facts.factStatus`, each date carrying `calendar`. R7's `proposed` carries action-clocks' own statement.
- R31: `counselPacket({template})` takes a brief: `TEMPLATE_USE_FILE`, `TEMPLATE_KIND_MISMATCH` and `offeredVersion`'s refusals, after `NO_COUNSEL` and before `NO_DETERMINATION` (K986 (6)). The seventh section, `briefing`, is the filled text with its blanks as items, the marking and the template, and it is rendered in the export. A `template` column on `counsel_packets` holds the brief template, recorded as R29 records a draft's.
- (3) R1: `KIND_NO_TEMPLATE` retired. R3: the member's own text is filled as a template's text is. R8: a packet at every tier, `NOT_TIER3` retired, and `NO_COUNSEL` only at Tier 3 or an undetermined tier, or for a counsel given without a name and an organisation (K986 (5)). R10: "Prepared for the group's own review. Not legal advice. Not for filing." R17: the brief arm.
- (4) N460: no change. N469: I scanned my paths and they name no deleted runner or suite and no "the battery". The "legacy-store" notes are about the producing-group reader, still live until L10.

**`not yet met: T21` marks met (for you to strike):** R1 (R28's arm and `KIND_NO_TEMPLATE`'s retirement), R3 (the member's text), R8 (every tier, `NOT_TIER3`'s retirement), R10 (the marking without counsel), R17 (the brief arm), R28, R29, R30, R31, R32.

**Rows, each `awaiting stamp` (T22):**
- New: C-115.41 `TEMPLATE_USE_BRIEF`, C-115.42 `TEMPLATE_USE_FILE`, C-115.43 `TEMPLATE_AND_TEXT`.
- Re-worded: C-115.12 `TEXT_UNWRITABLE` (`where` is now `#unwritable > is-text-unwritable`, its translation reads "prepared or recorded as approved"), C-115.34 `TEMPLATE_FROM_UNAPPROVED` ("drafted"), C-115.39 `TEMPLATE_KIND_MISMATCH` (wording; `where` is now `#kindMismatch`), C-115.40 `TEMPLATE_NOT_NAMED` (re-worded per R28; `where` is now `is-template-not-named`).
- Re-sited: C-115.19 `NO_DETERMINATION` (`where` is now `is-counsel-packet-basis`).
- Retired, numbers never reused: C-115.6 `KIND_NO_TEMPLATE`, C-115.17 `NOT_TIER3`.
- Moved to filing-templates (now in its table): C-115.31–.33, .35–.38.

**Deferred.** Nothing.

**Found in other modules.** See J2: the plane bundle is stale; L11 must re-point `op=templates` (affordances' catalogue R3 test is red on it, and `op-declarations` `FILINGS_READS`); two control-plane reds were already red on the tranche; `filingsFor` gains `template` fields (escalation, action-plans); action-clocks could export `factReader`.

**Tests and checks.**
- `node --test bio-plane/test/m/filings/`: 58 pass, 0 fail (was 13/35 at start). That covers R1, R3, R8, R10, R17, R28–R32 on the test profile, and every refusal with a negative control.
- Upstream and readers (`test/m/filing-templates/`, `escalation/`, `action-plans/`, `action-clocks/`, `local-facts/`): 175 pass, 0 fail.
- `test/m` whole: 4,784 tests, 4,761 pass, 3 fail, 20 todo. The 3 failures: affordances catalogue R3 (`templates`, mine by B5, for L11) and control-plane families R22 and catalogue-end R43, both already red on `tranche/T21` before my change.
- `fleetbundles.test.mjs`: 1 fail, STALE BUNDLE for the plane, already stale from action-clocks before my change; regenerated nothing.
- No layer tests are named in the manifest.
- checks: format 0 failures; architecture 0; coverage 31 of 31 live ids; ownership 0 (5 files).

Size (session_01TvVyWHR59YbbaUAFjxHb9M): test runs 24, module lines 2018
