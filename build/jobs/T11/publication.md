# publication (T11)

**Status** · session_0158G6qbdCv2B4LMZMJ1KrSU · depth 2 · COMPLETE · handled B3

## J1 · QUESTION

Three questions; I carry on with each best reading and stop for none of them.

(1) N210 needs `reevaluation` in publication's `uses`. R41/R43 are registered by this module through reevaluation's `registerCaseParts` (its R26), so publication's code must reach reevaluation (import `reevaluationOf`, or take it as a dep). `build/modules.json` lists no `reevaluation` in publication's uses, the requirements' Uses list none, and "Decided by BOB" 9 says reevaluation "is not called by this module's code"; `checks/architecture.mjs` fails an import of a module not declared. Reevaluation is layer 7, earlier, so the order allows it. Best reading: you add `reevaluation` to publication's `uses` in modules.json and a Uses line ("`reevaluation`: `registerCaseParts` (its R26), for R41 and R43"), and amend decision 9. I build `publicationOf` to register with `d.reevaluation || reevaluationOf(host)` at creation; until the uses line lands the architecture check reports that one import.

(2) R41: "a cited part is a case member at its pin". Case members are findings (inquiries); reevaluation's `#pinnedCapture` reads `content_hash` from the part's bundle.md at the pin, else the part's first-held capture (content R11). A finding holds no capture, so under this wording R14's case half would raise nothing for any real case. N163 (a)'s intent reads more like the captures the case's findings cite (the /4 document's `case_citations`, each target with the capture it was pinned to, or the evidence documents the members rest on, D-431(b)). Best reading: I build R41 exactly as worded (members at their pins), since reevaluation consumes that shape; if you mean the cited evidence instead, say which and I change `parts` (same shape `{bundle_id, bundle_sha}`, the evidence bundle at the sha the case pinned or the finding cited).

(3) R42's source rows (its note: confirm them before building). Best reading: "a capture a ratified finding's published basis rests on" = a register row (provenance's read contract) whose home bundle is the target of one of the finding's serve-class edges (D-431: what a finding rests on is exactly `publishedGraphEdges`' serve class): a `serve` row of `published_edges` from the finding, or N256's privately held reference (the same class, target not yet published). "Ratified finding" = a finding with a published edition that a ratified case edition's roster names (`published_case_members` joined to `published_cases`), its owning projects from `cases` (null for a pre-DEC-72 case). Paged by DISTINCT `capture_sha` after `after`, one SQL read per page; each capture answered with every such finding and its projects. Not `published_bundles` (it names no capture) and not the published basis files (a per-row parse, unpageable in capture order).

## J2 · QUESTION

Replaces nothing; the K363 condition holds. The edition's case citations pin a CAPTURE, never a bundle sha. The stored columns:

- No table column holds them. They live only in the signed case document's text, `case_documents.text` (the row with `ratified_at` set), front matter `case_citations:` (a `bio-case-document/4` only; /3 and older carry none, publication R1 states them undetermined).
- Each row is `{target, version, capture}` (case-authoring `#caseCitations`, `document.mjs` 211–217; ratification C-41.15 refuses any other shape): `target` the cited bundle id (a `cites` edge of the project's references; `version` is `no_bytes` for a target that is not an information bundle), `version` one of `pinned` (the edge's `extent_capture`), `only_capture` (the one capture the document holds), `undetermined`, `no_capture`, `no_bytes`; `capture` a 64-hex capture sha exactly for `pinned` and `only_capture`, else null.
- Nothing records the cited document's `bundle_sha` at the edition, and a capture names no bundle version (a document's bundle can move with the same capture; the register maps a capture to its home bundle only).

So R41's `{bundle_id, bundle_sha}` cannot be filled from what is signed, and reevaluation's `#pinnedCapture(part, pin)` (reads `content_hash` from the part's bundle.md at `pin`, else its first-held capture) would be handed no sha. Best reading, for your wording: a part is `{bundle_id: target, capture_sha: capture}`, one per citation row whose version names a capture (`pinned`, `only_capture`), in the document's order, deduplicated; a row naming no capture has nothing to grade and is not a part (or is listed with `capture_sha: null`, if you want reevaluation to say it was not graded). Reevaluation R26 would then grade `capture_sha` as the part's pinned capture directly (a change on its side: `#caseHalf` reading `p.capture_sha` before `#pinnedCapture`). Until you answer I build R41's edition choice, project, bound and the parse of the signed document's `case_citations`, and leave the part's shape as the one open line.

## J3 · COMPLETE

**Completion (T11, layer 8).** Branch `job/T11/publication`, tranche merged through B3 (K363, K365).

**Entries applied**
- **N210** (R41, R43; K359, K363, K365): `caseCitedParts({case, edition?})` answers the signed edition's `case_citations` rows whose version names a capture (`pinned`, `only_capture`) as `{bundle_id, capture_sha}`, in the document's order without repeats, latest ratified edition by default, `project` from `cases` (null pre-DEC-72), at most 1,000 with `truncated`; `NO_ID`, `NO_SUCH_CASE_EDITION`. `ratifiedCases({after, limit})` answers the case ids with a ratified edition in id order, 1–1,000 (default 1,000), `cursor` null exactly when no case follows. Both registered at creation as `reevaluation.registerCaseParts("publication", {parts, cases})`, reevaluation reached as `deps.reevaluation || reevaluationOf(host)`.
- **N230** (R42): `restingCapturesOf({after, limit})` over the source rows K363 confirmed: register rows (home bundle existing) whose bundle is the target of a ratified finding's `serve` edge or held reference; findings named by a committed case edition's roster and published; projects from `cases`. Paged by distinct `capture_sha` (one read per page, one for the page's findings), `cursor`, `truncated`; writes nothing.
- **N256** (R22, R35): a serve-class edge to an unpublished target is held privately in a new table `published_held_references` (never read by the public path; purged by either end, declared in `PUBLICATION_TABLES`), and becomes a `serve` edge of `published_edges` when the target is published (`commitEdition` answers `heldLinked`; the held row keeps `linked_at`). `publishEdges` answers `held` (`dropped` stays in the answer, always 0).
- **N237, N277** (R35): `#promoteNamedEdges` is one count and one set-wise UPDATE; linking held references is one count, one INSERT…SELECT and one UPDATE. Tested over 400 name edges and 400 held rows with every statement's returned rows measured (at most 2).
- **N260**: `checks.mjs`' header and the C-92 block now say C-44.1/.3–.5 are case-authoring's (`CASE_DERIVATION_CHECKS`) and C-92.10–.12 ratification's (`RATIFY_ATTRIBUTION_CHECKS`).
- **N297** (R13, C-98.1): `noPublishedPart` answers the refusal object and its one site wraps it (404), so the region holds the refusal: `check-refusal-codes` now reads `noPublishedPart > is-no-published-part 5L (1 judged, 1 code(s) checked)`.
- **K316, K313**: this module's tests run on a workerd-shaped storage (a cursor, LIKE/GLOB over 50 bytes refused) through `planeWorld`; `world()` keeps its array-shaped default, because filings' fixture builds on it and shapes the storage itself.
- Improvements in my own module: `#caseClaimInBytes` (asked on every promotion through the fact `caseMember`) now filters unsigned case documents by `instr` on the bundle's `- target:` line before parsing, instead of parsing every one; `exportManifest`, `recordCaseManifest` and `commitEdition` stamp with the module's clock (`now`) instead of the wall clock.

**Marks for BOB to strike** (my work meets them): R22's `(the private held reference: not yet met, N256)`; R35's `(not yet met: K102)` and `(not yet met: N237; …)`; R41's and R43's `(not yet met: N210)`; R42's `(not yet met: N230)`.

**Deferred:** none of my entries. Seen, not mine this tranche: R38's `ratifiedFindingsRestingOn` reads every pinned roster member's bytes on each call (bounded only by the cases ever ratified); R38 stays marked not yet met.

**Found elsewhere / reports**
- **ratification (blocks its suite on this branch):** its fixture builds `publicationOf` with no `reevaluation`, so publication's registration creates one on that host and its promotion steps fail on the missing `register` table: 42 of 65 red. One line fixes it (tried and reverted): add `reevaluation: { registerCaseParts: () => ({ ok: true }) }` to the `publicationOf(host, {...})` deps at `test/m/ratification/fixture.mjs:114` (65/0/1 again). Also its `test.todo` "R16, R5: a finding's reference to evidence not yet published …" can become a test: the held reference is built here.
- **reevaluation:** `#caseHalf` reads a part's `bundle_sha`; K365's shape is `{bundle_id, capture_sha}` (REEVALUATION #4). Until it merges, the case half grades no part (my registration test checks the registration, not grading).
- **legacy-store (note):** the registration holds once `publicationOf(ctx)` has run on the host; today every op dispatch builds it first, but a sweep reached without an op (an alarm) before any op would find `case_parts_absent`. Building `publicationOf(ctx)` in the constructor (after `reevaluationOf(ctx, {env})`) would close it.
- **legacy-tests:** the DEC-49 guard's floors move by N297 (one more refusal judged in `is-no-published-part`); re-pin on the merged tree.
- `bio-plane/dist/bio-plane.bundled.mjs` (`not_product`) is stale by this module's source; not rebuilt.
- No check row added or changed (nothing for promotion R34 to stamp).

**Tests and checks**
- `node --test bio-plane/test/m/publication/`: tests 63, pass 61, fail 0, todo 2 (R30, R32, unchanged). New: `cases.test.mjs` (R41 ×2, R41+R43 registration, R43, R42 ×2); `published.test.mjs` R22 (N256) and R35 over many edges; R31, R13 arms extended.
- Users of the changed services: reevaluation 49/0, case-authoring 38/0, review 29/0, conformance 29/0, filings 33/0; ratification 23/42/1 (the fixture line above; 65/0/1 with it).
- No layer tests named in `build/manifest.md`.
- `format`: 69 modules, 64 requirements files; 0 failures. `architecture publication`: 16 product files, 57 relative imports; 0 failures. `coverage publication`: 43 of 43 live ids named by a test; 0 failures. `ownership publication tranche/T11`: 14 files; legacy-store 0/0, legacy-checks 0/0, legacy-index 0/0; 0 failures.
- SQL: no LIKE/GLOB; every read through the cursor-iterating `#rows`/`#one`.

Size (session_0158G6qbdCv2B4LMZMJ1KrSU): test runs 24, module lines 5339
