# duties (T35)

**Status** · session_01TGUk8GSCkas5fYA7hBEf9q · depth 2 · COMPLETE · handled B5


## Completion

**Entries applied (T35-34; N644, N675; K1713, K1740, K1799, K1965, K1966, K1968).** On J1's five readings (B2, K1965), with B3's change to R28's citations (K1966) and B4's edge (K1968).
- R24: `OCCURRENCE_KEY_RE` stated in `vocab.mjs`, which imports nothing; `index.mjs` re-exports the same object (`===`). Inquiry-grammar R15 can now import it from `vocab.mjs` (T35-40).
- R27: `usesOfPower` reads `events.usesOf` page by page (`next`) in events' own order and keeps the uses linked by `provision` (the power's source standard, and its portion or a part of it) or by `member` (`linkUse`); `after`, `limit`, `truncated` and `placed_nowhere` as events answers them; `decider_is_obligor` `true`, `false` or `undetermined` with why (a person decider read through `lines.holderAt`), a fact about the record, never a judgment. `linkUse` / `unlinkUse` (member's acts; `DUTY_MEMBER_ACT_ONLY`, `NO_SUCH_DUTY`, `NOT_A_POWER` C-133.39, `NO_SUCH_EVENT` through events, `DUTY_NO_REASON`; a repeat `already`), held in a new append-only table `duty_use_links` (declared, gated). `readDuty`, `dutiesOf` and `powersOf` answer each power's `uses` count; R18's owner gains `used_in` ("used in", derived).
- R28: `proposeReview` proposes one duty of the owner ("review the policy", the policy as source, basis `commitment`, trigger `date`, or `recurrence` from a cited cycle). `reviewDue` and `cycle` are `{captureSha, extent}` (a found match passing as it is), refused `NO_SHA` (extraction's `noSha`), `CAPTURE_NOT_HELD`, `NO_EXTENT`, `EXTENT_NOT_IN_CAPTURE` (bare, as events R1), `REVIEW_EXTENT_NOT_HELD` (C-133.38), then minted through `content.mint` and read with `content.passageText`; `REVIEW_DATE_UNREAD` (C-133.37) unless the words state exactly one whole date; a cycle in years, months, weeks, or days that are whole weeks, else `BAD_RECURRENCE`. An adopted review past its date with no match keeps the state `overdue`, answered `label: "Noticed"` with R28's why and a question saying it is the body's own commitment.
- R29: a source standard issued by an organisation outside government (an entity issuer, `standards` R39) becomes a duty only for an obligor acting for a public body with an enforcer named; a government obligor only where `standards.bindsAt` answers `binds`; otherwise `NOT_ACTING_FOR_PUBLIC` / `NO_ENFORCER`, the detail saying the policy stays held as a standard (translations unchanged).
- R1 (reading 5): a source whose standard a public body issued counts as "a source naming the body" for an acting organisation.
- R19: ops `poweruses`, `uselink`, `useunlink`, `reviewpropose` (names provisional, as the module's other ops).

**Deferred.** None.

**Found in other modules (to BOB, in COMPLETE).**
- `control-plane` R53 (`t33`-family test, already red on `tranche/T35`) now also names the four new ops, which have no spec or `OP_STAMPS` entry: their specs are `op-declarations`' (T35-70) and their routing `control-plane`'s (T35-72).
- Generated artifact made stale: `bio-plane/dist/bio-plane.bundled.mjs` (duties' source changed), regenerated at the layer's close (§14).
- Rows C-133.37–.39 are new and await promotion's stamp (accepted red 2).

**Tests and checks run** (on this commit's parent, after merging `tranche/T35` @ bd314ba4d6):
- `node --test bio-plane/test/m/duties/`: tests 49, pass 49, fail 0.
- Every user of duties (16 modules): people 40/0, explore 27/0, retrieval 139/0, calculations 46/0, strength 143/0, answers 34/0, actions 96/0, action-plans 63/0, scheduler 95/0, notice-producers 45/0, `migrate-released` 1/0; inquiry-grammar 6, leg-earning 1, affordances 2, op-declarations 3, control-plane 3 and plane 6 fail, each the identical set on `tranche/T35` without this job's changes (accepted reds); only control-plane R53's message gains the four ops above.
- `format`: 130 modules, 129 requirements files; 0 failures. `architecture duties`: 11 product files, 48 relative imports; 0 failures. `coverage duties`: 29 of 29 live ids; 0 failures. `ownership duties tranche/T35`: 9 files; 0 failures.

Size (session_01TGUk8GSCkas5fYA7hBEf9q): test runs 12, module lines 1939

## J1 · QUESTION

Readings I am building on (T35-34); answer only where you differ.

1. R28 `reviewDue` and `cycle` are content ids of held passages of the standard's own text (the shape R4 already quotes), read through `content.passageText`; a content id content holds no row for, or one not among the standard's text passages, is refused with a new row C-133.38 `REVIEW_EXTENT_NOT_HELD`; `REVIEW_DATE_UNREAD` is C-133.37: the words must hold exactly one whole calendar date (ISO, "June 30, 2027", "30 June 2027"); none, a placeholder, a month only, or two different dates are refused. A cycle reads "every N years/months/weeks", "annually", "biennially", "triennially", "quarterly", "monthly"; a cycle in days not a whole number of weeks is `BAD_RECURRENCE` (civil-time has no DAILY).
2. R28's "Noticed": the occurrence keeps the closed state `overdue` (R13's transitions and notice-producers read the state) and is answered with `label: "Noticed"`, the why R28 states, and a question saying it is the body's own date, never a deadline the law sets. Only a review duty (the fields carry `review: {standard, review_due, cycle}`, set by `proposeReview`) is so labelled.
3. R27 `NOT_A_POWER` is a new row C-133.39. Uses are gathered by paging `events.usesOf` over all uses (no filter) and keeping those linked by provision or by a member, so the order, `after`, `limit` and `truncated` are events' own; the count R7/R15 answer is the full count for the viewer. Member links are a new append-only table `duty_use_links` (link and unlink rows). R18 gains kind `used_in` ("used in", derived).
4. R29: when the source standard's issuer is an entity of an organisation kind and a sector other than government, the duty is admitted only where the obligor is an organisation acting for a public body (a held `acts_for`/`contracts_with` line, or the source's own issuer being that public body: R1's "a source naming the body") and an enforcer is named. A government obligor resting on such a source is refused `NOT_ACTING_FOR_PUBLIC` unless `standards.bindsAt` answers `binds` for that obligor on the read's date (an adoption by reference, standards R40/R43). The R29 sentence goes in the refusal's `detail`; the translations are unchanged (no row moves).
5. R1 "a source naming the body" is met, for any organisation obligor, by a source whose standard's issuer is a public body entity (fixes a gap: today only lines count).

R27's tests need events' `usesOf` (T35-28); I build against R46's wording now and will merge the tranche branch after events merges, when you say so.

## J2 · QUESTION

Applying B3 (K1966). One edge needed: B3's `NO_SHA` is extraction's one answer (`noSha`, its R63), and duties does not use `extraction`, so the architecture check fails on `import { noSha } from "../extraction/index.mjs"`. My reading: add `extraction` to duties' `uses` in `modules.json` (layer 4, earlier; content and events already import `noSha` the same way). The other three codes (`CAPTURE_NOT_HELD`, `NO_EXTENT`, `EXTENT_NOT_IN_CAPTURE`) are answered bare, as events R1 answers them (no row in any family), and the extent is checked with content's `checkContentExtent` over `contentContextFor`. Until the edge is added, the architecture check reports this one failure.

## J3 · COMPLETE

T35-34 complete: R24, R27, R28, R29 met, per my record's Completion. duties 49/49; format, architecture, coverage (29/29), ownership 0 failures. Users' reds are the tranche's own set; control-plane R53 now also names my four new ops (poweruses, uselink, useunlink, reviewpropose): specs for op-declarations (T35-70), routing for control-plane (T35-72). Stale: the plane bundle. New rows C-133.37–.39 await stamp.
