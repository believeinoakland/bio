# lines (T33)

**Status** · session_01UxA8Yv7kHqsFpTvQSvpR4k · depth 2 · WORKING · handled B1

## J1 · QUESTION

Seven readings; I am building on each now. Only (1) and (3) could change what I build.

1. **Party roles.** Terms say `party_to` takes a role from the profile's party-role vocabulary (`jurisdictions`); K1505 (10) says party roles are `lines`' closed kinds, and `jurisdictions` holds no such key. Reading: a closed list in `lines`: `plaintiff`, `defendant`, `petitioner`, `respondent`, `appellant`, `appellee`, `cross_complainant`, `cross_defendant`, `intervenor`, `real_party_in_interest`, `amicus`, `applicant`, `protestant`, `complainant`, `interested_party`, `other`. `jurisdictions` stays a use only for the default zone (R3).
2. **Uses.** `content` added: R1's passage refusals (`EXTENT_NOT_IN_CAPTURE`, as `events` R1) need `canonicalExtent`, `checkContentExtent`, `contentContextFor`. `promotion` dropped: no T33 requirement registers a step (EXTRACT proposals are T33-D3). Final uses: record-grammar, jurisdictions, civil-time, connection-grammar, record-core, membership, provenance, content, entities, events.
3. **Upstreams not yet built.** `entities`' T33 parts (`proceeding`, `identifiersOf`/`entityByIdentifier`) and all of `events` are being built beside me. Reading: `lines` takes `entities` and `events` as injected services coded to their requirements. My fixture uses the real `entities` for what it already serves (`has`, `readEntity`, `resolutionsFor`, `noSuchEntity`) and a contract stand-in for the T33-only parts and for `events` (R15 `onWhenChanged` with `{eventId, before, after}`, R26 `readEvent().when` as `{start, end, precision, zone}`). When each merges into `tranche/T33`, I merge and point the fixture at the real module before COMPLETE, unless you say otherwise.
4. **Basis shapes and grades.** A system rule is `{rule, source, ids?: {from: {scheme, id}, to: {scheme, id}}, system?, recorded_at?}`, where `source` is a capture sha (a register row) or `{profile, entry}`. Assertion: a capture's `provenance.captureGrade`; a profile entry `C` (curated, no capture behind it). Ends: `A` when `ids` resolve through `entities.entityByIdentifier` to the end; a passage end gets the strongest resolution of that entity in the cited capture, or `D` when it is not resolved there (the member's own link); testimony `D`.
5. **Sight (R19).** A testimony basis may name `project` (a project bundle) and is then fenced to it. A line citing a capture follows that capture's home bundle. Everything else is group-wide.
6. **R18 "no second holderAt".** Tested at the export surface: every `bio-plane/src/*/index.mjs` is imported, and none but `lines` exports `holderAt`.
7. **M-P2 staleness.** The plan entry says "with a staleness rule"; R5 and Suggestions Open (1) say label only. I build R5's label only.
