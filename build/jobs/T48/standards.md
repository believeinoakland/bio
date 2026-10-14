# standards (T48)

**Status** · session_01FxBAaAreHEtJGAEtvdRFhL · depth 2 · COMPLETE · handled B2

## Completion (STANDARDS #14)

**Entry applied:** T48-21 (N1029, K3145). R56: `standardPropose` takes an optional `project`, checked first (sight before any other check; the proposer's viewer is `viewer`, else `proposer`): full sight lands; existence answers membership's `existenceAct` (`PROJECT_SEEN_NOT_A_PARTICIPANT`); none, an id naming no project or a bundle that is not a project answer `membership.noSuchProject`; nothing written. A nullable `project` column on `standard_proposals` (added by ALTER where the table predates it, with an index), never inferred; R9's answer and R54's (`standardProposalRead`, now `{id, kind, project, adoption}`) carry it, R54 naming it only to a viewer with full sight (J1 (1), K3243). R57: `proposalsFor({project, state, after, limit, viewer})` and `op=standardproposals` in `standardsOps`: newest first (`proposed_at`, then id), states `open` (default) / `adopted` / `all`, an unknown state or an `after` naming no proposal of the project refused `REQUIRED_ARGUMENT_MISSING` (capture's store-side C-61 shape) naming the argument, nothing read; a viewer below full sight answered as R56 refuses; an adoption whose standard the viewer may not read is unanswered and the proposal counted only as open (J1 (2), (3), K3243); limit default 50, clamped 1-200, `truncated` by reading one past, `cursor`; every item carries R9's sentence and `standard: false`. Writes nothing, never throws.

**Reading set (mechanics §17):** I read the requirements, all five code files and `fixture.mjs` and `proposals.test.mjs` whole, plus membership's `sight`, `existenceAct`, `noSuchProject` and its R44, R77, R78. A helper read the other 13 test files and `words.mjs` in full and wrote me a digest citing each test. It flagged t45's two exact-shape assertions on R54, which I amended to add `project: null` (the R54 title now names `project`, R56).

**Own code read whole (P20):** I found no flaw needing a fix in this job. One choice is deliberate and not deferred. `standard_proposals` stays declared with `keys: []`, so purging one project does not clear the proposals made for it, and a whole-store purge does. Proposals are instance-wide rows, and R14's declaration is unchanged.

**Other modules:** `op-declarations` must declare `standardproposals` and `control-plane` must route it, at their L11 jobs. `screens-investigate` (T48-74) draws the proposals section from it. None of these is stale yet: the plan already lists them as theirs. No generated artifact was touched.

**Tests and checks:**
- `node --test test/m/standards/`: 95 pass, 0 fail (new: `t48.test.mjs`, 6 tests naming R56, R57).
- `test/m/duties/`: 65 pass, 0 fail. `duties` reads R54.
- `test/m/affordances/backing.test.mjs`: 22 pass, 0 fail. It calls `standardPropose`.
- `format`: 0 failures. `architecture standards`: 0 failures.
- `coverage standards`: 48 of 48 live ids, 0 failures. `ownership standards tranche/T48`: 0 failures.
- `checks/run.mjs`: architecture 0 failures. Its coverage reds are other modules' not-yet-met ids, none of them standards'.

Size (session_01FxBAaAreHEtJGAEtvdRFhL): test runs 5, module lines 3571

## J1 · QUESTION

Three readings I am building on; answer only if any is wrong.
(1) R56 "answered with it (R9, R54)": `standardProposalRead` (R54, which reads the viewer's predicate only) answers `project` as the id only to a viewer whose `membership.sight` of that project is full; to any other viewer it answers `project: null`, so R54 never names a project hidden from its reader. R9's own answer (the proposer's, who was just checked at full sight) names it.
(2) R57 "an adoption whose standard the viewer may not read (R37) is answered as R54 answers it, and that proposal counted only as open": the item is listed under `open` (and `all`) with `adoption: null`, and is neither listed nor counted under `adopted`.
(3) R57 `after`: a proposal id that names no proposal made for `project` is refused as the required-argument refusal naming `after` (as an unknown `state` is), nothing read; R57 states no answer for it.
Also: `project` is checked first in `standardPropose`, before any other refusal (membership's terms: sight before any other check); the proposer's viewer is `viewer`, else `proposer`.

## J2 · COMPLETE

T48-21 done: R56, R57 met (K3243's readings). standards 95/95, duties 65/65, affordances backing 22/22; format, architecture, coverage (48/48), ownership 0 failures. Record: build/jobs/T48/standards.md on job/T48/standards.
