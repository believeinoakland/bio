# Requirement-line draft: A2, a government's fiscal year (DEC-458)

**Decided (K5448, CONSISTENCY §1, §2.1; K5464 row 15; K5467; K5468):** the stated fiscal year is an entry of N1257's one team layer (id `team`, `origin: team`, `jurisdictions` R115), not a separate local-facts fact. There is exactly one team layer; no place team layers. K5468 decided: a `fiscal_year` entry may name a government at any level (federal, state, county, city) where no shipped layer states that government's year; the refusal order is at entry (R134, local-facts R31), R117's conflict only for a year that arrives later; `FACT_VALUE_REFUSED` replaces `FISCAL_YEAR_INVALID`; the fact path is `team/<level>:<place>/fiscal_year` (federal `team/federal/fiscal_year`). Numbers at writing: A2-R1 is now `N1257-a2` jurisdictions R134 (with R135 conditional), A2-R2 and A2-R3 are `N1257-a2` local-facts R31 and R32, all CAPABILITIES' (`N1257-requirements-a2.md`) and no longer drafted here; A2-R4 is civil-time R31; A2-R5 to A2-R7 are money R39-R41 (N1260 keeps R36-R38, rechecked at writing: its money R36-R38 are the highest N1260 takes, R39-R41 are free).

**Status** · READY for BOB (PLANNING #2, L6: K5456 folded; a line resting on a question still open with Bob is bracketed on it and stands as written if he answers as recommended); re-cut L7 (K5464 row 15); aligned L8 (K5468) · PLANNING L2, 2026-10-27. Drafted by a Sonnet reading worker from money, civil-time, local-facts and jurisdictions read whole; reviewed by PLANNING (layer order holds: money L5 #66 uses local-facts #60 and jurisdictions #3; civil-time #4 takes stated years as view entries, so it needs nothing later). Open points §6: 2 is Bob's (a disputed stated year: still known?), the rest BOB's.

Fixed for BOB #321's review (L4).

Ids here are draft ids `A2-R<n>`; BOB numbers at writing (K5448), as the Decided line says. A2-R1 to A2-R3 are no longer drafted here (K5468): they are `N1257-a2` jurisdictions R134 / local-facts R31 / local-facts R32, CAPABILITIES, in `N1257-requirements-a2.md`. Other N1257 ids are cited by their draft file: `N1257-jur Rn` (`N1257-requirements-jurisdictions.md`) and `N1257-mod local-facts Rn` (`N1257-requirements-modules.md`).

## 0. Placement and what BOB's review changed

"Places" is not a module. Under N1257 the place's records are layers (`N1257-jur` R99, R101): Civicsmith's shipped layers (read-only) and the one team layer (id `team`, jurisdictions R115). A government is not a place layer, so the stated year is an entry of the one team layer, tagged `origin: team` and carrying `government: {level, place}`. The governing view (`combine`) carries it beside the place's records; `civil-time.fiscalPeriod` and money read the view and need no second path. The team's stated year needs no `basis`, `status: researched` or second member's confirmation (Q-A2-1, decided by K5456: one member's statement with how they checked); that exception is stated in R134 and local-facts R31.

### Owed by N1257 (CAPABILITIES, via BOB)
- The amendments A2 relied on (the section, the records-first rule, the one-value-per-government conflict, the exception to `basis` and second confirmation, the `LAYER_ENTRY_IN_SHIPPED` meaning, the fact path, the L18 carve-out) are carried by CAPABILITIES' `N1257-requirements-a2.md` (jurisdictions R134, R135, local-facts R31, R32); nothing is owed here beyond that file.

**The refusal (review item 2).** DEC-458: "A government's fiscal year comes from the place's records; where they hold none, a member states it for that government with how they checked it". A statement for a government the records cover is outside what Bob allowed (K5468 (1): only where no shipped layer states that government's year). The refusal is local-facts R31's (`LAYER_ENTRY_IN_SHIPPED` for a different own entry, `FISCAL_YEAR_IN_RECORDS` for an equal one or a `*` cover); not drafted here.

**Existing lines touched:** jurisdictions R49 (`fiscal_year`; unchanged), R55 (one value per key), `N1257-jur` R115, R116, R117, `N1257-mod local-facts` R23, R24, R25 (as R134, R135, R31, R32 amend them); civil-time R21 (undetermined reason; amended by A2-R4); local-facts R1, R2, R3, R5, R6, R16 (words by key); money R29 (`MONEY_BAD_PERIOD`), R34 (its last sentence "Where a team states its fiscal year waits on Bob's ruling" is SUPERSEDED by A2-R5/R6), Uses ("local-facts ... in tests only" is widened by A2-R7). DEC-451's two sentences stand. Nothing else is contradicted.

**Highest ids (no retired above them):** civil-time R30; money R35 (N1260 takes R36-R38; A2 takes R39-R41, CONSISTENCY §1, rechecked). A2's own: civil-time R31. Jurisdictions R134, R135 and local-facts R31, R32 are CAPABILITIES'. BOB numbers.

## 3. Draft lines (outcomes only; how-statements are in the Suggestions)

### jurisdictions

**A2-R1** *(retired here, K5468)* Now `N1257-a2` jurisdictions R134 (and R135, conditional on Q-A2-2), CAPABILITIES. Test content: all carried by R134.

### local-facts

**A2-R2** *(retired here, K5468)* Now `N1257-a2` local-facts R31, CAPABILITIES. Test content: all carried by R31.

**A2-R3** *(retired here, K5468)* Now `N1257-a2` local-facts R32, CAPABILITIES. Test content: all carried by R32.

### civil-time

**A2-R4** (T53; N1257; DEC-458; K5468; amends civil-time R21) *(not yet met: T53)* **A fiscal key is mapped by the entry the view gives the government, and says whose entry it was.** The team's stated year is an entry of the one team layer (jurisdictions R115, `origin: team`; R134). `fiscalPeriod` maps a date exactly the same over a team-layer entry as over a Civicsmith layer's, and its answer carries where the entry came from (the layer's `profile` tag and its `origin`). The undetermined answers (no `fiscal_year` for the body; EDTF spanning two years) are `{key, vars}` reasons whose `vars` name the body the caller asked for and never hold `*`; when the caller names no body the reason says no government was named. No place is held in code (R27). Test: a view with a team `fiscal_year` entry `{body: "B", start: "07-01", named_by: "end"}` maps 2026-03-01 for B to the same label and span a Civicsmith entry would, the answer saying `origin: team`; a body with no entry is undetermined and `reasonText` of its reason holds the body and no `*`; with body `*` or none the reason says no government was named. Control: a Civicsmith entry's answer is unchanged.

### money

**A2-R5** (T53; N1257; DEC-458; amends money R29, R34; supersedes R34's last sentence) *(not yet met: T53)* **A fiscal key is mapped by the government's own year, from the place's records or a stated year.** A period `{fiscal, body}` is resolved over the governing view (R134, A2-R4): the place's records first, else the team's stated year, an entry of the one team layer (jurisdictions R115, origin team; local-facts R31). A stated year maps a key exactly as a record's does. The fact keeps the date range as today, not the year's origin. [depends on L3: as written if Bob says A (a disputed stated year still maps; the dispute is shown, A2-R7; local-facts R32); if Bob says B, a government whose only year is disputed is refused as a government with no year held, until the dispute is settled.] The refusals of R29/R34 stand and add: a government named with no year in the records and none stated is refused `MONEY_BAD_PERIOD` with a sentence that names the government and says that no fiscal year is held for it and none has been stated by a member (words by key, the design's; until the row exists the job REPORTs it, as R34); no fiscal refusal, detail, key or var ever holds `*` or any other stand-in for a government. The stated year of one government is never used for another; a period sent with no body is never resolved from a stated year (R34's refusal). Test: with no profile, `recordfact` with `{fiscal: "FY2026-27", body: "B"}` after a member stated B's year (start 07-01, named_by end) records the range a records entry would; before the statement it is refused `MONEY_BAD_PERIOD`, the sentence holds B and no `*`; B's stated year does not map a key for another government C (refused, naming C); a government a Civicsmith layer covers keeps the records' year (R134, R31). Control: the same fiscal key with `{from, to}` is accepted as before; a fiscal key with no body is refused as R34 states, no `*` in the sentence.

**A2-R6** (T53; N1257; DEC-458; amends money R34; supersedes R34's last sentence) *(not yet met: T53)* **The fiscal-year view is offered only for a government whose year is known, and says why where it is not.** DEC-458: Money "offers the fiscal-year view only for a government whose year is known, says why where it is not, and never prints '*'". Money answers the governments whose year is known, each with its year (`start`, `named_by`, `label`) and where it comes from (the place's records, or stated by a member with the member, date and `how`); a `*` entry in the records is answered once as every government, never as a government named `*`. A government whose year is not known is not in that list; asked of one government, money answers the sentence for the screen: it names the government, says that no fiscal year is held for it in the place's records and none has been stated, and that a member can state it. When no government's year is known the answer is an empty list with the sentence for that case (no government named). Reading writes nothing. Test: the test profile's governments are answered with their origin as the records; after a member states B's year it is answered as stated with the member, date and `how`; a government neither holds is not listed and its sentence holds its name and no `*`; with no layer and nothing stated the list is empty with the none-known sentence; a `*` entry is answered once as every government. Control: the reading writes nothing; nothing answered holds `*` as a government. DEC-451's two sentences are unchanged.

**A2-R7** (T53; N1257; DEC-458; amends money Uses, A2-R6) *(not yet met: T53)* [depends on L3: as written if Bob says A; if B, a disputed year is answered as not known and says it is disputed] **Money reads a stated year's standing.** Money takes a stated year's `status` (one entry of the team layer, R32) from `local-facts.factStatus` (the edge exists, money after local-facts; "in tests only" is widened; the fact path is `team/<level>:<place>/fiscal_year`, local-facts R32). A lapsed (`unconfirmed`) stated year is still known and still maps keys, and A2-R6's row says it is unconfirmed; a disputed one is still known and still maps, with the dispute named in the row. Test: a lapsed stated year answers known with `status: "unconfirmed"`; a disputed one answers known with `status: "disputed"`. Control: a year from the place's records carries no stated status.

## 3b. Fallback lines A2-R8 to A2-R10: retired by K5468
They were a fallback for N1257's team layer not being READY (a stated year as a local-facts fact beside the zone, folded into the view by a pure reader). K5464 row 15 and K5468 fix the one team layer and CAPABILITIES' R134/R135/R31/R32 carry the lines, so a fallback without that layer no longer makes sense: **A2-R8, A2-R9, A2-R10 retired, not reused.** `FISCAL_YEAR_IN_PROFILE` is gone; `FISCAL_YEAR_IN_RECORDS` and `LAYER_ENTRY_IN_SHIPPED` (R31) replace it.

## 4. Needs from earlier modules; placement doubt
- money and civil-time take nothing new beyond the view (`combine` with the one team layer, `N1257-jur` R101, R115); money <- `local-facts.factStatus` (A2-R7). local-facts <- the team layer (`N1257-mod local-facts` R24) and jurisdictions R116's section list; R31's act is local-facts' own, not R23's draft.
- Doubt: no module is "places"; the fact cannot live in jurisdictions (pure, R17), so local-facts holds the act and the team layer holds the entry.

## 5. What a screen needs (needs only)
- Money's fiscal-year field (`mf-fiscal` sends `period:{fiscal}` with no body today): the governments whose year is known and its origin, a government chosen not typed; offered only when one is known; for an unknown one the A2-R6 sentence and a way to state it; none known: field absent, one sentence. Never `*`.
- To state it (beside the zone, `screens-settings` R45; the places page of `N1257-modules` R82 draws the team layer's entries): government, start month-day, which calendar year names it, label form, `how`, all required; afterwards the governing year with "stated by <member>, <date>"; where the records hold the year, no form, and the view says so.
- Reading it: member, date, `how`, status, and confirm/dispute acts, as the zone's.
- Sentences (words by key, the design's): government named, no year known; no government named; none known at all. DEC-451's two stand.

## 6. Open points
1. Who may state it: DEC-458 says "a member"; local-facts R31 takes a stamped member, never a machine. Which members the screen offers it to is the design's.
2. A disputed stated year: L3 (QUESTIONS-L2 L2-3), Bob's; A2-R5 and A2-R7 are bracketed on it.
3. What a government is (technical, BOB's): the `body` string R49 and money's period already use; linking an entity to its body is later.
4. One year per government; keys already recorded keep their range (A2-R5 records the range, not the origin), so a correction cannot move an old fact.
5. A stated `*` (rejected alternative A) is refused (R134); a team states a year per government, at any level (K5468).

## Suggestions (how, for the implementing jobs; not requirements)

**jurisdictions, local-facts.** Suggestions for R134, R135, R31, R32 are CAPABILITIES' (`N1257-requirements-a2.md`). Horizon for a stated year's lapse is the zone's (183 days, R3). A listing op for stated years (`statedFiscalYears({viewer})`, name BOB's) returns `{body, path, value, status, by, at, how}`; not listed by `factStatus`/`factsDue` without a path, as R21's.

**civil-time.** The `from`/origin of an answer is the entry's `profile` tag and `origin`.

**money.** `#period` resolves through `civil-time.fiscalPeriod` over the governing view. The views are read ops, `moneyOps` arms declared in `DECLARED_OPS`: `fiscalYears({viewer})` and `fiscalYear({body, viewer})` (names BOB's), answering rows `{body, known: true, start, named_by, label, from, profile?, status?, by?, at?, how?}`, `every_government: {...}` for a `*` entry, `none_known: true`, and `says: localize(key, {body})`. The sentence rows are keyed words.

## Questions for Bob raised in L4

**Q-A2-1. Does a stated fiscal year need a held source and a second member's confirmation?** In words: the draft team layer (N1257) asks that every entry a team writes comes from a document the team holds and is confirmed by a second member, while your decision says "a member states it ... with how they checked it", as the time zone is. For a fiscal year (a date such as 1 July), which? **Decided (K5456): A, as recommended.**
- A: one member states it with how they checked it, and it governs at once (as the time zone is set today).
- B: as the team layer asks for every entry: a held document as source, and a second member confirms before it governs.
- Recommendation: **A.** It is your decision's wording, and the year is shown as "stated by <member>, <date>" with how it was checked, open to dispute; B would leave a government without a year until two members act. The lines are written for A and bracketed.

**Q-A2-2. If the place's records later gain a year for a government a team already stated, which governs?** In words: a team states B's fiscal year because the records had none; later, an update brings the records a different year for B.
- A: the records' year governs (your decision says the records come first); the team's statement is listed as set aside, and the screen says so. (On Bob's page this is L18; CAPABILITIES' conditional jurisdictions R135 is written for A and dropped under B.)
- B: the two disagree, the government's year is withheld as in the team-layer draft's conflict rule, and Money refuses B until a member settles it.
- Recommendation: **A.** It matches "the place's records first" and keeps Money working; the team keeps its statement on file. (This is the fiscal-year case of CAPABILITIES' conflict point C2.)
