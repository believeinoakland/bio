# people.md: the ambiguities settled against the code (tranche)

Read whole: build/plan/trims/people.notes.md, build/requirements/people.md, bio-plane/src/people/index.mjs (1,895 lines),
bio-plane/test/m/people/declared-ops.test.mjs. Read in part, to settle one point each: op-declarations/index.mjs:94-109
(OP_ALIASES), test/m/people/directory.test.mjs:201-221, kinds.test.mjs:96-98, notice-producers/index.mjs:405-425,
record-core/index.mjs:1836-1875 (expunge), connection-grammar.md R6, R10, R20.
The notes list 7 ambiguities (the brief said 6); all 7 are answered. Every old text below was checked with `grep -cF`: 1.

## 1. R42's door names against the ops map's op names
Code: `DECLARED_OPS` (people/index.mjs:1880-1895) is keyed `identityclaim`, `withdrawidentityclaim`, `recordpersonfact`,
`personexpunge`, `declaretie`, `withdrawtie`, `sourcepersonlink`; `peopleOps` (index.mjs:1851-1869) serves the arms
`identitywithdraw`, `personfact`, `membertie`, `membertiewithdraw`. They are the same ops: `op-declarations`' `OP_ALIASES`
(op-declarations/index.mjs:96-97) maps `declaretie`->`membertie`, `withdrawtie`->`membertiewithdraw`,
`recordpersonfact`->`personfact`, `withdrawidentityclaim`->`identitywithdraw`, and the R42 test runs each door name through
that arm (declared-ops.test.mjs:53, 58, 68, 73).
Old: `for `identityclaim`, `withdrawidentityclaim`, `recordpersonfact`, `personexpunge`, `declaretie`, `withdrawtie`, `sourcepersonlink`.`
New: `for `identityclaim`, `withdrawidentityclaim`, `recordpersonfact`, `personexpunge`, `declaretie`, `withdrawtie`, `sourcepersonlink`; four are `op-declarations`' aliases of this module's arms (`withdrawidentityclaim` of `identitywithdraw`, `recordpersonfact` of `personfact`, `declaretie` of `membertie`, `withdrawtie` of `membertiewithdraw`), the same ops.`
No finding.

## 2. R42 under "Open for Bob", which says "None"
Code: R42 is met and is not open: `DECLARED_OPS` exported beside `peopleOps` (index.mjs:1878-1895), tested by
declared-ops.test.mjs. Its place contradicts the section's "None". Move it into Provides beside the ops map (R27), whose op
names it declares. Two edits (the id sequence then reads ... R27 R42 R36 ...; R42 moves, no id changes):
(a) Old: `Which credential reaches each op is `op-declarations'`.`
    New: `Which credential reaches each op is `op-declarations'`.` + newline + the R42 line, whole, with item 1's change.
(b) Old: the R42 line with the blank line before it, at the end of the file (it occurs once).
    New: nothing ("## Open for Bob" keeps its "None: ..." line alone).
No finding.

## 3. R38's `note_by` and `machine`: organisation rows only, but its test names an office
Code: `#directoryLook` (index.mjs:1331-1335) answers `today: {kind, sector, note, note_by, machine}` for every row whose
kind is not `person`: organisation kinds, and under R41 offices, ordinances, contracts, funds, sources alike (an office
also `holders`, :1335). Tests: directory.test.mjs:201-216 (bodies and an institution; every non-person row's `note_by`
equals `declared_by`), kinds.test.mjs:96-98 (a contract row's `note_by`, `machine`). No test uses an office for R38.
Old: `- **R38** (T48; N1050; K3177, K3178; amends R37) A row of an organisation kind answers, in `today`, beside `note`:`
New: `- **R38** (T48; N1050; K3177, K3178; amends R37) A row of any kind but `person` (an organisation kind, and every kind R41 adds) answers, in `today`, beside `kind`, `sector` and `note`:`
Old: `  A person row is unchanged. Test: a seeded office answers `machine: true`; control: an office a member registered answers her stamp and `machine: false`.`
New: `  A person row is unchanged. Test: a body setup seeded answers `machine: true`; control: a body a member registered answers her stamp and `machine: false`.`
No finding.

## 4. R9's self-citation "amends R9"
Code: nothing to settle; the trim already dropped it and the line now reads "(T51 fix round 2, C7; K4303;
screens-investigate R53)". No change. No finding.

## 5. Service headings and their op lists
Code, peopleOps (index.mjs:1851-1875):
- `memberties` is `tiesOf` only (:1868); `tiesConcerning` has no arm: an in-process read (callers case-disclosures/index.mjs:1068, ratification/index.mjs:815).
- `sourceLinksOf` IS served, as `sourcepersonlinks` (:1870; op-declarations/index.mjs:277), missing from R21's heading.
- `recordedBy` has no arm: "an in-process read, not an op" (index.mjs:908).
- `onChecksChanged` (:1592) is a registration, no arm; it is absent from the checks heading's signature list. `peopleDirectory` names its op in R37's text: no change.
Old: `tiesConcerning({entities, member, viewer})** (`op=membertie`, `op=membertiewithdraw`, `op=memberties`)`
New: `tiesConcerning({entities, member, viewer})** (`op=membertie`, `op=membertiewithdraw`, `op=memberties` (`tiesOf`); `tiesConcerning` in-process, no op)`
Old: `**The protected source link: linkSourceToPerson({source, person, evidence, sight, by}), sourceLinksOf({source | person, viewer})** (`op=sourcepersonlink`)`
New: `**The protected source link: linkSourceToPerson({source, person, evidence, sight, by}), sourceLinksOf({source | person, viewer})** (`op=sourcepersonlink`, `op=sourcepersonlinks`)`
Old: `**recordedBy({captureSha, extent?, limit?, viewer})** (T36; N715)`
New: `**recordedBy({captureSha, extent?, limit?, viewer})** (in-process, no op; T36; N715)`
Old: `recordCheckGate({check, version, goldSet, falseAlarmRate, by}), onCheckResult(module, fn)**`
New: `recordCheckGate({check, version, goldSet, falseAlarmRate, by}), onCheckResult(module, fn), onChecksChanged(module, fn)**`
FINDING F1: `listChecks({viewer})` (index.mjs:1772-1778) is a public method no requirement asks: it answers every
check version with its `condition`, `denominator`, `machine`, `by` and gate state to any viewer not denied, filtered by
project sight; no op, read in-process by notice-producers (notice-producers/index.mjs:417) and a scheduler test
(test/m/scheduler/t34.test.mjs:292). No wording proposed; BOB decides whether to require it or remove it.

## 6. R12: no order among its refusals
Code, `expunge` (index.mjs:827-843), in order: `notAnAdmin` (:829, a non-member or non-administrator `by`);
`EXPUNGE_GROUND_REFUSED` (:830-833, a ground outside the four, or `court_order` with no `order`); `DEMAND_KIND_UNLISTED`
(:834-839); `NO_REASON` (:840-841, a refusal R12 does not list; `reason` is in the signature); `PERSON_ITEM_NOT_HELD`
(:842-843). A source link is named by `{source, person}` (:886-888).
Old: `Other grounds are refused `EXPUNGE_GROUND_REFUSED`, naming the grounds and the correction act (R11); an unlisted demand kind `DEMAND_KIND_UNLISTED`; an id answering no person fact, claim, tie or link `PERSON_ITEM_NOT_HELD` (this module's code). Only an administrator expunges (`membership`'s `notAnAdmin`).`
New: `Refusals, in order: `membership`'s `notAnAdmin` (only an administrator expunges); `EXPUNGE_GROUND_REFUSED` (another ground, or `court_order` naming no order), naming the grounds and the correction act (R11); `DEMAND_KIND_UNLISTED`; `NO_REASON`; `PERSON_ITEM_NOT_HELD` (this module's code) for an id answering no person fact, claim or tie, or a `{source, person}` naming no link.`
No finding.

## 7. R40's "a hub answer (R26)": R26 says nothing of hubs
Code, `neighbours` (index.mjs:1827-1832): when the visible, unwithdrawn claims on `node` not `out` at `at` number more
than `BOUNDS.hub`, it answers `{items: [], hub: {set_size, why, why_key}}`; otherwise pages of `BOUNDS.fanout`, `next`
naming the next page. Tested why.test.mjs:129-143. Also: R40 cites the hub `why` as connection-grammar's "R20"; the hub
rule is its R6 (R20 is `unread`).
Old: `It passes `connection-grammar`'s owner-conformance battery.`
New: `More visible claims on `node` than `connection-grammar`'s hub bound answer `{items: [], hub: {set_size, why, why_key}}` (R40); fewer, pages of its fan-out bound, `next` naming the next. It passes `connection-grammar`'s owner-conformance battery.`
Old: `the hub answer's `why` (its R20)`
New: `the hub answer's `why` (its R6)`
FINDING F2: connection-grammar R6 answers `hub` for "a node whose set of one kind exceeds that kind's bound"
(`hub_by_kind`, R10). people counts the claims of all wanted kinds together against `BOUNDS.hub` (index.mjs:1809-1827),
not each kind against `hubBoundOf(kind)`: a node with 400 `same_as`, 400 `unsure` and 400 `not_same_as` claims is
answered a hub with no items where the contract pages all 1,200. The proposed R26 wording says "claims on `node`" as the
contract does and does not bless the all-kinds count.

## Summary
Changes: items 1, 2, 3, 5, 6, 7 (12 edits). No change: item 4. Findings: F1 (`listChecks` unrequired), F2 (hub counted
across kinds, against connection-grammar R6).

DONE people-settle 6 2
