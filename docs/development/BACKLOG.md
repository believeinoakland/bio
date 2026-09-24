# The backlog — everything still to do, in order

The middle file of the work pipeline (`docs/development/WORK-PIPELINE.md` §1–§2). `QUEUE.md` is the cache of the next
few items; this file holds every OTHER open item, in the order it will be processed — the top row is next.
What is done lives in the archive (`docs/archive/ledgers/QUEUE-closed*.md`).

- **Rows here use the queue's grammar** — a level-3 heading of an id, a middle dot and a state, then the row's fields
  (WORK-PIPELINE §1). A `blocked` row stays where the order put it, with what unblocks it.
- **Rows leave only by tool.** `node tools/ledger.mjs refill` moves the next runnable rows (state `queued`, every
  `depends-on` met) from the top of this file into the cache until the cache holds 8, deleting them here in the same
  act; a closed row leaves by `node tools/ledger.mjs archive <ID>`. Both refuse any move that does not conserve the id
  multiset of cache, backlog and archive, checked on the plan and again on what is read back from disk.
- **The order is SCHEDULER's** (`kickoffs/SCHEDULER.md`); new work is inserted at its place in the order.
- **Budget:** 150 KiB for the file, 2 KiB for a row (WORK-PIPELINE §2). A placement that puts this file over budget
  moves WHOLE rows from its foot to the head of `BACKLOG-LATER.md` — the same order's tail, looked up and never read
  whole — and a refill or any later write brings them back as room frees; no row is cut to fit (every `coord.mjs write`
  rebalances). `node tools/ledger.mjs invariants` prints the five pipeline invariants; `node tools/plancheck.mjs`
  enforces them.
- **Find any id** — here, in the tail, in the cache or in the archive — with `node tools/ledger.mjs find <ID>`.

Created EMPTY on 2026-09-18 by LED-6's tool half. The rows arrive with the migration (WORK-PIPELINE §5 steps 2–4),
performed by hand by the lane that owns the plan.

## Rows

### D-480 · queued — **A HIDDEN PROJECT CAN CROWD A VISIBLE ONE OUT OF THE SHARED-QUESTION CANDIDATES: `#queueSharedInquiryCandidates` groups over UNGATED refs capped at 64, so past 64 shared questions a hidden project's citations take a candidate slot and flip the served `inquiries_truncated` — a count-shaped side channel, D-447's and D-464's class.** Found by D-464's worker. — owner RECORD.
order: at the head with the disclosure rows (SCHEDULER #17, 2026-09-24; via CONDUCT #19)
milestone: M8
interface: none — the candidate selection; the answer's shape is unchanged.
design: `docs/architecture/BIO_Membership_Architecture_v2.md` §7 (item 7.9: a project the caller cannot see answers exactly as one that does not exist).
depends-on: D-464 (finished; rides the train after c19-batch9).
scope: count DISTINCT VISIBLE citers in the HAVING clause (a gate join), or apply the cap after the gate.
accepts-when: with more than 64 shared questions, adding hidden-project citations changes neither the candidates nor `inquiries_truncated`. NEGATIVE CONTROL: group over ungated refs again, and the hidden-crowding arm fails by name.
added: 2026-09-24 · SCHEDULER #17 (`node tools/mintid.mjs D`).

### D-486 · queued — **A HIDDEN PROJECT'S RUNS MOVE COUNTS SERVED OUTSIDE ITS SIGHT: `#counts`, the frontier readers, and the run side of proposedReadings, inquiryRunSurfacings and captureRequests tally rows whose `authority_kind='run'` came from a run over a hidden project, so the tally discloses that the project exists.** Found by D-464's worker (finding 1). — owner RECORD.
order: after D-480, the same disclosure class at the head (BOB #32, 02:30Z: *"Row it as disclosure-class, beside D-480 at the head"*; SCHEDULER #18, 2026-09-24)
milestone: M8
interface: I3 — the served counts subtract; shapes unchanged.
design: `docs/architecture/BIO_Membership_Architecture_v2.md` §7 (item 7.9), with BOB #32's ruling of 2026-09-24 02:30Z (cite until folded): a hidden project's run output is the PROJECT'S THINKING until something outside uses it; the bytes stay shared, only the run's attribution is withheld. `OBSERVATION-LOG-DESIGN.md` §6 ties the readers.
depends-on: none.
scope: one predicate excluding run rows whose context is a hidden project from every tally a caller outside its sight reads, all five readers together.
accepts-when: a run over a hidden project leaves each reader's answer to an outsider unchanged. NEGATIVE CONTROL: drop the predicate from one reader and its arm fails by name.
added: 2026-09-24 · SCHEDULER #18 (`node tools/mintid.mjs D`).

### D-470 · queued — **THE RATIFICATION STAMP CANNOT TELL WHICH CATALOG JUDGED A CASE: `gate.mjs` `CATALOG_VERSION` still reads "1.20.0" after dozens of added checks, so `plane-gate/1.0 (bio-checks 1.20.0)` names the same catalog for documents judged by different rules.** Read at the code on `main`. — owner RECORD.
order: after D-469, at the head: a signed record that claims more precision than it holds (SCHEDULER #17, 2026-09-24; REC-188's worker via CONDUCT #19)
milestone: M10
interface: I3 — the stamp's version moves; the integrator mints and classifies the IC.
design: `docs/architecture/BIO_Publication_v0_1.md` §3 (the case document's gate stamp), following REC-14's version-bump precedent.
depends-on: none.
scope: bump `CATALOG_VERSION` MINOR now; add a suite pinning the version to the catalog's check census, so an added check fails until the version moves.
accepts-when: the stamp reads the new version, and adding one check without a bump fails the pin by name. NEGATIVE CONTROL: add a check without moving the version, and the census-pin arm fails by name.
added: 2026-09-24 · SCHEDULER #17 (`node tools/mintid.mjs D`).

### D-472 · queued — **MONITORING A DRIVE-LINKED DOCUMENT CRIES WOLF ON EVERY TICK: `op=monitor` fetches the bundle's `source.locator` itself (`const locator = fm.source?.locator` → the governed fetch), which is Google's app shell, not the export address, so the comparison runs raw and reads `modified` every time.** Read at the code on `main`. — owner CAPTURE.
order: after D-469, with the head corrections: a monitor that reports change where none happened misleads members every tick (SCHEDULER #17, 2026-09-24; D-351's worker via CONDUCT #19; renumbered from its clone's colliding "D-467")
milestone: M3
interface: none — the monitor's fetch path.
design: `docs/architecture/BIO_Content_Framework_v0_10.md` §6 (the monitoring contract), with D-351's Drive export arm.
depends-on: D-351 (finished; rides the train after c19-batch9).
scope: in `op=monitor`, route the locator through `readDriveAddress`, fetch `exportAddress` under the governor, and apply acquire's shell refusal (C-48.5, C-48.7). Extend `bio-plane/test/monitor-assess.test.mjs`.
accepts-when: an unchanged Drive document reads `unchanged` across two ticks. NEGATIVE CONTROL: fetch the raw locator again, and the two-tick arm reads `modified` and fails by name.
added: 2026-09-24 · SCHEDULER #17 (`node tools/mintid.mjs D`, the id CONDUCT #19 named).

### D-476 · queued — **A MULTI-PART CAPTURE ALWAYS ANSWERS `existed: false`, EVEN ON A RE-FETCH OF BYTES THE RECORD HOLDS: the per-part write guard cannot see the whole document.** It under-claims (never over-claims), so it follows D-469. — owner CAPTURE.
order: after D-472, with the acquire corrections (SCHEDULER #17, 2026-09-24; D-469's worker via CONDUCT #19)
milestone: M2
interface: I3 — `existed` becomes `null` (stated undetermined) or a whole-document lookup; the integrator mints and classifies the IC.
design: `docs/architecture/BIO_Intake_Doctrine_v1_1.md` §8 (one capture, one home).
depends-on: D-469 (finished; rides the train after c19-batch9).
scope: report `existed: null` with its sentence for a multi-part capture, or compute it by a whole-document register lookup by sha before any write (prefer the lookup where it costs one read).
accepts-when: a re-fetched multi-part capture reads true or null-with-reason, never a false that claims the bytes are new. NEGATIVE CONTROL: restore the per-part answer, and the re-fetch arm reads false and fails by name. Extend `bio-plane/test/acquire.test.mjs`.
added: 2026-09-24 · SCHEDULER #17 (`node tools/mintid.mjs D`).

### D-479 · queued — **REC-149's PROJECT DIRECTORY LISTS EVERY PROJECT UNPAGED, READING SIGHT AND TITLE PER ROW, AND PUBLISHES NO BOUND: a large instance's directory is unbounded work, and nothing says the list could be cut.** Found by c19-unionfix. — owner RECORD.
order: after D-476, with the corrections to just-landed work: an unbounded read on a member-facing list (SCHEDULER #17, 2026-09-24; via CONDUCT #19)
milestone: M8
interface: I3 additive — `limit` and `truncated` on the directory; the integrator mints and classifies the IC.
design: `docs/architecture/BIO_Membership_Architecture_v2.md` §7 (item 7.14, the directory), with D-36's bound rule.
depends-on: REC-149 (`integrated`, riding c19-batch9).
scope: page the directory at LIMIT cap+1 with `limit` and `truncated`; the cap is a named constant declared below the method. Add a `bounds.test.mjs` drive that bites.
accepts-when: a directory over the cap answers `truncated: true` with exactly the cap. NEGATIVE CONTROL: drop the LIMIT, and the bounds drive fails by name.
added: 2026-09-24 · SCHEDULER #17 (`node tools/mintid.mjs D`).

### D-481 · queued — **A PDF THAT PLACES EACH GLYPH WITH ITS OWN OPERATOR READS ONE GLYPH PER LINE: `pdfstructure.mjs` `extractPageText` pushes a newline on EVERY Td/TD/Tm/T\*, so Budget-Basics-FY21-23 yields 18,551 characters and fewer than 60 words — 43 of 332 plane-read documents (4.3%).** Found by D-66's worker. — owner CONTENT-PDF.
order: after D-479, with the corrections: a reading that says far less than the document holds, across 4% of the corpus (SCHEDULER #17, 2026-09-24; via CONDUCT #19; renumbered from a colliding D-480)
milestone: M2
interface: none — the text is truer; its shape is unchanged.
design: `docs/architecture/BIO_Content_Framework_v0_10.md` §16 (how content is extracted today).
depends-on: none.
scope: break only when the baseline moves — Td/TD with ty=0 and a Tm at the current line's y add nothing (a space past a word-gap advance); T\*, ', " and any y change still break. Extend the pdfstructure suite.
accepts-when: Budget-Basics-FY21-23's bytes read at least 60 words per page. NEGATIVE CONTROL: revert the fix, and that arm reads glyph-per-line and fails by name.
added: 2026-09-24 · SCHEDULER #17 (`node tools/mintid.mjs D`).

### D-484 · queued — **`NO_BASIS` AND `NO_CITATION` HAVE NO DEC-49 TRANSLATION: neither code has a row in any `*_CHECKS` family, so a member reads the store's raw `detail`.** `NO_CITATION` is minted at 3 sites in `store.mjs` (relationdeclare, the progression revision, discharge), `NO_BASIS` at 4; `NO_CITATION` has reached two member surfaces untranslated since UI-13. Found by UI-83's worker. — owner RECORD.
order: after D-481, with the corrections: a refusal a member cannot read (SCHEDULER #18, 2026-09-24; via CONDUCT #19 02:30Z)
milestone: M2
interface: I3 additive — two catalogued codes gain translations.
design: DEC-49, as `docs/architecture/BIO_Assistant_and_AI_Roles_v0_1.md` rule 10 restates it, following REC-79's single-helper shape.
depends-on: none.
scope: route each code's sites through ONE governed helper inside a DEC-49 REGION; a row for each in ACT_SHAPE_CHECKS (C-numbers by mintid); move the check-refusal-codes floors.
accepts-when: each site's refusal carries its translation. NEGATIVE CONTROL: mint one site's code outside the helper and the DEC-49 guard fails by name.
added: 2026-09-24 · SCHEDULER #18 (`node tools/mintid.mjs D`).

### D-482 · queued — **REC-59's HELPER-ARM MATCHER IN `bounds.test.mjs` IS OVER-STRICT: `callSites`' id pattern `(?:^|[?&,{\s])id[=:}]` does not see an id arm spelled `"id=" + x`, so correct work reads RED.** Found by UI-85's worker. — owner M0.
order: after D-481: an instrument that fails correct work costs every lane gate time (SCHEDULER #18, 2026-09-24; via CONDUCT #19 02:24Z)
milestone: M0
interface: none.
design: `docs/development/VERIFICATION.md` "The negative-control register".
depends-on: none.
scope: add `"` and `'` to the class in `callSites`; add an over-strictness arm reading a quoted `"id=" + x` site as `id`.
accepts-when: the new arm passes. NEGATIVE CONTROL: drop the quotes from the class and that arm fails by name.
added: 2026-09-24 · SCHEDULER #18 (`node tools/mintid.mjs D`).

### FW-22 · queued — **AUDITED FINANCIAL STATEMENTS ARE NOT BUDGETS: BOB #32 ruled (2026-09-24 02:30Z) that an ACFR/CAFR or an agency's audited statements are a separate type, FINANCIAL REPORT, counted apart. D-66's budget sample is recounted with them excluded, and the new class is counted.** — owner FRAMEWORK.
order: directly after D-66: §2's rule that a count comes before any reader; the financial-report reader follows the budget reader and is its own row once these counts justify it (SCHEDULER #18, 2026-09-24)
milestone: M2
interface: none — a census class and a recount.
design: `docs/development/EXTRACTION-BREADTH-DESIGN.md` §2, row 5, with BOB #32's ruling of 2026-09-24 02:30Z (cite until folded).
depends-on: D-66.
scope: the census instrument gains FINANCIAL REPORT, judged from bodies; D-66's class and read sample are re-run excluding it, stating stratum and seed.
accepts-when: `MEASUREMENTS.md` carries both counts with intervals, dated with the instrument. NEGATIVE CONTROL: fold the class back into budget and the recount arm fails by name.
added: 2026-09-24 · SCHEDULER #18 (`node tools/mintid.mjs FW`).

### FW-23 · queued — **CSV HAS NO FORMAT-REGISTRY ENTRY, so the corpus's CSV files are held and never read.** BOB #32 DESIGNED it (2026-09-24 02:30Z): delimiter and encoding found by signature and RECORDED on the reading, undetermined when they cannot be told; one sheet; row 1 is row 1, a header being a reading, never assumed; cells addressed sheet-cell/sheet-range, 1-based; the capture's grade. Legacy `.xls` (50 keys) stays waiting under OFFICE-FORMATS's legacy ruling. — owner FRAMEWORK.
order: behind D-66, per BOB #32's ruling (SCHEDULER #18, 2026-09-24)
milestone: M2
interface: I2 additive — a `csv` format entry.
design: `docs/development/OFFICE-FORMATS.md` "The architectural answer: a FORMAT axis", with BOB #32's CSV design of 2026-09-24 02:30Z (cite until folded).
depends-on: D-66.
scope: the `csv` entry and its reader on the format axis; extend the office-format suites.
accepts-when: a CSV reads as addressed cells with delimiter and encoding recorded. NEGATIVE CONTROL: guess a delimiter where none is determined and the undetermined arm fails by name.
added: 2026-09-24 · SCHEDULER #18 (`node tools/mintid.mjs FW`).

### UI-84 · queued — **THE UI's MOCK REFUSALS FOR `verify` AND `unknown op` CARRY NO `translation`, WHILE THE LIVE WIRE NOW DOES (C-61.1, C-69.1, D-278), AND `refusalWords` RENDERS THE TRANSLATION FIRST — SO THE MOCKS ARE NARROWER THAN THE WIRE (the M-72 class).** Found in `civicos-ui/test/preauth-vocabulary.test.mjs` and sibling mocks; re-read on `land/conduct/c17-batch3` @ `d93d29c4`. — owner UI.
order: after REC-184, with the D-278 follow-ons: a suite that pins what a member reads against a mock narrower than the wire can pass while the member reads something else, a correction to just-landed work (SCHEDULER #16, 2026-09-23; D-278's worker via CONDUCT #17)
milestone: M8
interface: none (test mocks); the integrator classifies.
design: DEC-49 (`node tools/decided.mjs "DEC-49"`) as `docs/architecture/BIO_Assistant_and_AI_Roles_v0_1.md` rule 10 restates it: every condition has a named code and a canned translation.
depends-on: D-278 (on `land/conduct/c17-batch3`).
scope: every mock refusal for `verify` and `unknown op` carries `translation`, imported from `bio-checks.mjs` (never retyped); DEC-49's SUBJECT arm in `preauth-vocabulary.test.mjs` re-pinned with the movement stated (old and new figures and why).
accepts-when: `civicos-ui/test/preauth-vocabulary.test.mjs` and `refusal-translation-surface.test.mjs` green with the imported translations; the UI harness green. NEGATIVE CONTROL: drop `translation` from one mock, and the SUBJECT arm fails by name.
added: 2026-09-23 · SCHEDULER #16 (D-278's worker's finding via CONDUCT #17, verified on the batch; `node tools/mintid.mjs UI`).

## TRACKED ELSEWHERE — open plan rows whose ids another file allocates

`docs/archive/IS-BUILD-PLAN.md` ALLOCATES these ids as track-table rows, so a `### <ID> ·` heading here would allocate them a second time (`plancheck` fails that). Their status is tracked here until each is rowed under an id this file may open, or closed. DS-1/DS-2 are DIST-5's subject; DS-3 and FL-6 are routed to DIST and FLEET.

| who | row | what | blocked on |
| --- | --- | --- | --- |
| RECORD | PL-16 | the published case (IS-8, M10) — **RESHAPED BY DEC-72, not merely blocked.** Its finding-side stamping and its NO-case-level-bar assumption are both overtaken; `CASE-AS-PRODUCTION.md` and the CASE-1..CASE-6 rows are the live decomposition | **Bob** (DEC-33's ceremony deferral) **AND now DEC-72's redesign.** Read the design doc before touching it — supersession is never silent, so the row keeps its id and names what overtook it |
| **DIST** | DS-1 | D-115 — the installer installs the FLEET | **DONE 2026-09-19 — THIS TABLE WAS THE RECORD THAT WAS WRONG, corrected here with the reason (DIST-5's own act).** Landed at `8decf468` ("D-297: the installer installs the FLEET — verified, templated, degrading per member, on install AND update"). DIST #2 confirmed at its touch; VERIFIED INDEPENDENTLY BY SCHEDULER #2 AT THE CODE, not from either row: `8decf468` is an ancestor of `origin/main`, and `newgroup/src/index.mjs` carries a section headed "the fleet (IC-82/D-297)" and names `fleet` **27 times** — D-297's own opening measurement was that this file mentioned it **zero** times, which is the evidence from D-297 itself that DIST-5's accepts-when demanded |
| **DIST** | DS-2 | D-116 — version authority spans the fleet | **DONE 2026-09-19**, landed at `da3d4f17` ("DS-2: the version authority spans the fleet — and five of six sites disagreed with it"). VERIFIED BY SCHEDULER #2 AT THE CODE: ancestor of `origin/main`; `bio-plane/scripts/resolve-version.mjs` CONSUMES FLEET's own `discoverMembers` rather than re-implementing it, so the set checked cannot drift from the set built, and takes `bio-plane/package.json` as THE authority; `tools/release-assemble.mjs` refuses `VERSION_SKEW` and `VERSION_DISAGREES`; `resolveversion.test.mjs` arms BEHIND (ARM 2) and AHEAD (ARM 3) — the direction a one-sided check misses |
| **DIST** | DS-3 | the account cascade config (instance-level token; minting is a MEMBER act) | **D-260, PLACED 2026-09-21 in `BACKLOG.md` on BOB #22's ruling (its item 2 is DIST's deploy half).** Before that: **D-260 — NARROWED, and no longer blocked on DS-1 or unread** (DIST #3, then FLEET #3, 2026-09-21; verified at the code by SCHEDULER #4): its CONFIG half LANDED at `2de6f25f` (2026-09-12 — `instanceClaudeStatus`/`instanceClaudeToken` in `tokens.mjs`, the deploy sending and keeping the secret, the denylist's revocation-by-publication). Its acceptance — a configured instance token resolving at FL-6's third level — cannot be met by ANY configuration until the plane's calling side exists: `AGENT_WORKER` and `claude_accounts` occur 0 times in `bio-plane/src`, and `instanceClaudeToken` has no non-test caller. The dispatch fix is named on D-260. The member and project token surfaces are ABSENT, a design question DIST #3 sent to BOB |

### D-463 · queued — **NO CREDENTIAL IS CONFINED TO SCRATCH FOR LIFE: the namespace binds per CALL, so an instrument that omits `store=scratch` addresses the real record (CLAUDE.md §5's stated residue: *a sticky confinement is RECORD's and is NOT built*).** — owner RECORD.
order: after D-462, the last of the namespace guards (SCHEDULER #17, 2026-09-23; D-456's and D-447's workers via CONDUCT #18 00:05Z)
milestone: M0 (a guard)
interface: I3/I5 — a per-credential confinement; the integrator mints and classifies the IC.
design: `docs/development/VERIFICATION.md` (CLAUDE.md §5, D-325's residue).
depends-on: D-456, D-461.
scope: a credential may be minted confined to `scratch`; every call it makes resolves to scratch whatever it names, and a `store=bio` from it is refused by name.
accepts-when: a confined credential writing without `store=` lands in scratch, and `bio`'s counters are unchanged. NEGATIVE CONTROL: drop the confinement, and that arm moves `bio` and fails by name.
added: 2026-09-23 · SCHEDULER #17 (`node tools/mintid.mjs D`).

### D-475 · queued — **THE `/` SETUP PAGE READS `bio`'s GROUP SLUG WHATEVER `store=` SAYS: it is an HTML route, not an op, so D-461's refusal on the bio-pinned ops does not reach it.** Read-only and public, so low priority. Found by D-461's worker. — owner RECORD.
order: behind the namespace guards (D-462, D-463), low: read-only, public, and names no member (SCHEDULER #17, 2026-09-24; via CONDUCT #19)
milestone: M0 (the namespace guard's last door)
interface: none — the page's read.
design: `docs/development/VERIFICATION.md` (CLAUDE.md §5, D-325).
depends-on: D-461 (finished; rides the train after c19-batch9).
scope: pass the store through `publicInstanceGroup`, or refuse `store=scratch` on `/` by name.
accepts-when: `/?store=scratch` reads scratch's slug or is refused by name. NEGATIVE CONTROL: ignore the parameter again, and that arm reads `bio`'s slug and fails by name.
added: 2026-09-24 · SCHEDULER #17 (`node tools/mintid.mjs D`).

### D-478 · queued — **`pdf-worker` AND `ocr-worker` ACCEPT ANY `store` TOKEN AND ANSWER AN UNKNOWN NAMESPACE WITH NOT_FOUND: nothing is written (IC-237 measured it), but "not found" reads as the capture's ABSENCE when the truth is that the namespace does not exist.** Found by D-462's worker. — owner CONTENT-PDF.
order: last of the namespace guards, low: read-only, no write; placed because *not found* is not *absent* (CLAUDE.md §1) (SCHEDULER #17, 2026-09-24; via CONDUCT #19)
milestone: M0 (the members' side of the guard)
interface: I6 — a named refusal on the members' routes; the integrator mints and classifies the IC.
design: `docs/development/VERIFICATION.md` (CLAUDE.md §5, D-325).
depends-on: D-462 (finished; rides the train after c19-batch9).
scope: the same NAMESPACES set and a NAMESPACE_UNKNOWN refusal in `pdf-worker/src` and `ocr-worker/src`.
accepts-when: `store=biosmoke` is refused NAMESPACE_UNKNOWN by name by both members. NEGATIVE CONTROL: accept the token again, and the arm reads NOT_FOUND and fails by name.
added: 2026-09-24 · SCHEDULER #17 (`node tools/mintid.mjs D`).

### D-483 · queued — **THE PLANE'S SETUP PAGE OFFERS NO RISK-TIER CHOOSER, so every action it files is `risk_tier: undetermined` (`setup.mjs`, D-182) and a member there cannot state 1, 2 or 3.** Found by UI-85's worker, optional residue. — owner RECORD (DIST reviews the installer page).
order: after D-478, low: truthful today (it writes undetermined, never an invented tier); a missing affordance, not an overclaim (SCHEDULER #18, 2026-09-24)
milestone: M2
interface: none — consumes `vocabularies.risk_tiers` as published.
design: `docs/architecture/BIO_Case_Making_v0_1.md` §2 (`risk_tier`, RULED by BOB #21: only a member's authored act sets 1, 2 or 3).
depends-on: none.
scope: a radio group over `vocabularies.risk_tiers` in SETUP_HTML's action arm, unset by default; unset still writes undetermined.
accepts-when: a chosen tier is written; none chosen writes undetermined. NEGATIVE CONTROL: default the group to 1 and the unset arm fails by name.
added: 2026-09-24 · SCHEDULER #18 (`node tools/mintid.mjs D`).

### REC-193 · queued — **C-41.10's AUTHOR EXCLUSION READS THE DRAFT'S LAST EDITOR, NOT THE STATEMENT'S AUTHOR: D-150's worker used the last editor PROVISIONALLY, so a participant who edited another section could be refused acknowledging a statement they did not write, and its writer admitted.** BOB #32's ruling of 2026-09-23 22:26Z (cite it until folded into Publication §3): *the statement's author is the member who wrote the statement's CURRENT BYTES.* — owner RECORD.
order: after REC-188, the same completeness block: a correction to just-landed work (D-150) on who may attest (SCHEDULER #17, 2026-09-23)
milestone: M10
interface: I5 additive — a `statement_by` value recorded at the draft write; the integrator mints and classifies the IC.
design: `docs/architecture/BIO_Publication_v0_1.md` §3 rule 11, with BOB #32's ruling of 2026-09-23 22:26Z (cite it until folded into Publication §3).
depends-on: D-150 (`integrated` on c17-batch7).
scope: record `statement_by` (server-stamped) at every draft write that changes the statement text; C-41.10's author exclusion reads it. Extend D-150's suite (`bio-plane/test/d150*.test.mjs`).
accepts-when: B edits another section after A wrote the statement, and B may acknowledge while A is refused by name. NEGATIVE CONTROL: read the last editor again, and the "the statement's writer is refused" arm fails by name.
added: 2026-09-23 · SCHEDULER #17 (BOB #32's G2; `node tools/mintid.mjs REC`).

### REC-194 · queued — **AN ACKNOWLEDGEMENT MAY MATCH ANOTHER CASE WHOSE STATEMENT IS BYTE-IDENTICAL: D-150 binds it to the statement's bytes, not to ONE case identity.** BOB #32's ruling of 2026-09-23 22:26Z (cite it until folded into Publication §3): *an acknowledgement binds to ONE case identity; reading A's statement is not reading B's.* — owner RECORD.
order: directly after REC-193, the same block (SCHEDULER #17, 2026-09-23)
milestone: M10
interface: I3 — the `statementack` op's binding narrows to one case; the integrator mints and classifies the IC.
design: `docs/architecture/BIO_Publication_v0_1.md` §3 rule 11, with BOB #32's ruling of 2026-09-23 22:26Z (cite it until folded into Publication §3).
depends-on: D-150 (`integrated` on c17-batch7).
scope: an acknowledgement records and is matched by the case identity it was given for; a second case in the project with byte-identical statement text lists none of the first's. Extend D-150's suite.
accepts-when: two cases with identical statements, one acknowledged: the other's completeness block lists nobody. NEGATIVE CONTROL: match by statement hash alone, and the "the twin case lists nobody" arm fails by name.
added: 2026-09-23 · SCHEDULER #17 (BOB #32's G3; `node tools/mintid.mjs REC`).

### UI-89 · queued — **THE STATEMENT'S ACKNOWLEDGEMENTS HAVE A PLANE AND NO SURFACE: the `statementack` op and the signed `completeness.acknowledgements` (D-150, IC-227) are unreachable from any page.** The DELEGATION RECORD (D-150) -> UI of 2026-09-23 on coord `CLAIMS.md` names three surfaces. — owner UI.
order: after REC-194, the member half of the same block (SCHEDULER #17, 2026-09-23)
milestone: M10
interface: I3 consumer (IC-227).
design: `docs/architecture/BIO_Publication_v0_1.md` §3 rule 11 and §6A.4 (the review copy leads with the statement).
depends-on: D-150 (`integrated` on c17-batch7; verify `statementack` in `index.mjs` on `main` first).
scope: (1) the review copy leads with the exclusion statement and its acknowledgements; (2) an acknowledge act for recipients (by the grant's secret) and joined participants (by session), with DEC-49 translations for the five `STATEMENT_ACK_*` codes; (3) the published case page renders `[]` as "nobody but the author acknowledged the statement" and `null` as "the document says nothing about acknowledgements", never "nobody".
accepts-when: the three surfaces render against a live answer, and the empty and null cases read different sentences. NEGATIVE CONTROL: render `null` as `[]`, and the "null is not nobody" arm fails by name.
added: 2026-09-23 · SCHEDULER #17 (the D-150 delegation; `node tools/mintid.mjs UI`).

### UI-90 · queued — **NO SURFACE STATES THE LAWS THAT GOVERN A RECORDS REQUEST: D-149's act (`actionlaws`, registered in `ACTS_AWAITING_SURFACE`, owed to UI) has no page.** — owner UI.
order: after UI-89, the member half of D-149 (SCHEDULER #17, 2026-09-23; D-149's worker via CONDUCT #18)
milestone: M10
interface: I3 consumer (IC-230).
design: `docs/architecture/BIO_Case_Making_v0_1.md` §2 (*A RECORDS REQUEST NAMES EVERY LAW THAT GOVERNS IT*, Bob's ruling of 2026-09-22).
depends-on: D-149 (`integrated` on c17-batch7; verify the op on `main` first).
scope: the action page lists the governing laws, each with the level the plane publishes (`law_levels`), offers the member's act to set them with no default level, and shows the plane's undetermined sentence for an empty list; the act is struck from `ACTS_AWAITING_SURFACE`. Extend `civicos-ui/test/surface-registry.test.mjs` and the action page's suite.
accepts-when: an empty list reads the plane's undetermined sentence, and a member's list round-trips with its levels. NEGATIVE CONTROL: preselect a level, and the "no default level" arm fails by name.
added: 2026-09-23 · SCHEDULER #17 (`node tools/mintid.mjs UI`).

### REC-195 · queued — **THE GOVERNING-LAWS LIST HAS NO MACHINE PROPOSAL: D-149 built the member's act and the machine refusal; the design's labelled machine proposal (*if built*) is not.** — owner RECORD.
order: after UI-90, a feature below the corrections: the list is complete without it (SCHEDULER #17, 2026-09-23; D-149's worker via CONDUCT #18)
milestone: M10
interface: I3 additive — a proposal read labelled machine work; the integrator mints and classifies the IC.
design: `docs/architecture/BIO_Case_Making_v0_1.md` §2 (*A RECORDS REQUEST NAMES EVERY LAW THAT GOVERNS IT*): *a machine PROPOSAL, if built, is labelled machine work*.
depends-on: D-149 (`integrated` on c17-batch7).
scope: a proposal of citations and levels for an action, stored apart from the member's list and labelled machine work; it never sets the list, which only the member's act does.
accepts-when: a proposal is read labelled machine work, and the action's list is unchanged until the member acts. NEGATIVE CONTROL: let the proposal write the list, and the "the list is the member's" arm fails by name. New suite `bio-plane/test/rec195-laws-proposal.test.mjs`.
added: 2026-09-23 · SCHEDULER #17 (`node tools/mintid.mjs REC`).

### UI-92 · queued — **THE WORKSPACE CANNOT SHOW A PROJECT'S DRAFTS.** REC-198's list, rendered. — owner UI.
order: directly after REC-198 (SCHEDULER #17, 2026-09-23)
milestone: M10
interface: I3 consumer (REC-198's IC).
design: `docs/architecture/BIO_Publication_v0_1.md` §6A.4, with BOB #32's ruling of 2026-09-23 23:08Z (cite until folded).
depends-on: REC-198.
scope: the workspace lists the project's drafts from the plane's read; each opens.
accepts-when: every draft the plane lists appears and opens. NEGATIVE CONTROL: stub the list empty, and the listed-draft arm fails by name.
added: 2026-09-23 · SCHEDULER #17 (`node tools/mintid.mjs UI`).

### REC-199 · queued — **`op=reviewcopy` DOES NOT ANSWER `newCase`, SO AN EDIT THAT WRITES THE READ BACK LOSES IT.** BOB #32's ruling of 2026-09-23 23:08Z (cite until folded): *op=reviewcopy answers `newCase`.* — owner RECORD.
order: after UI-92 (SCHEDULER #17, 2026-09-23; UI-68's worker)
milestone: M10
interface: I3 additive — one field; the integrator mints and classifies the IC.
design: `docs/architecture/BIO_Publication_v0_1.md` §6A.4, with BOB #32's ruling of 2026-09-23 23:08Z (cite until folded).
depends-on: REC-148 (`integrated` on c17-batch7).
scope: the field in the answer. Extend the review-copy suite.
accepts-when: a read-then-write round trip keeps `newCase`. NEGATIVE CONTROL: drop the field, and the round-trip arm fails by name.
added: 2026-09-23 · SCHEDULER #17 (`node tools/mintid.mjs REC`).

### REC-200 · queued — **A REVIEW COPY'S DATE DOES NOT MOVE WHEN A COMMENT MOVES ITS HASH, AND ITS CONTAINER-SIDE STAMP IS UNRULED.** BOB #32's ruling of 2026-09-23 23:08Z (cite until folded): *the container side is stamped by `attestor.member` and `ratified_at`; the copy carries the date of its LAST change, so a comment that moves the hash moves the date.* — owner RECORD.
order: after REC-199 (SCHEDULER #17, 2026-09-23; REC-148's worker)
milestone: M10
interface: I3 — the copy's date; the integrator mints and classifies the IC.
design: `docs/architecture/BIO_Publication_v0_1.md` §6A.3, with BOB #32's ruling of 2026-09-23 23:08Z (cite until folded).
depends-on: REC-148 (`integrated` on c17-batch7).
scope: the date is the last change's; the container stamp as ruled. Extend the review-copy suite.
accepts-when: a comment moves both the hash and the date. NEGATIVE CONTROL: keep the old date, and that arm fails by name.
added: 2026-09-23 · SCHEDULER #17 (`node tools/mintid.mjs REC`).

### UI-93 · queued — **A BIAS-DEBT OBLIGATION NAMES A RUN AND THE QUEUE RENDERS NO RUN: D-86 raises an OBLIGATION whose subject is of kind `run`, and `app.html` `queueSubjectHtml` returns "" for it, so the item never says WHICH run.** The DELEGATION RECORD (D-86) -> UI of 2026-09-23 is on coord `CLAIMS.md`. — owner UI.
order: after UI-86, the same queue surface; a correction that D-86's landing exposes (SCHEDULER #17, 2026-09-23; via CONDUCT #18 23:35Z)
milestone: M8
interface: I3 consumer (IC-234).
design: `docs/development/NOTIFICATIONS.md` §"MARKED AS HANDLED — and handling has a SCOPE, which differs by class", with `docs/architecture/BIO_Declared_Bias_v0_1.md` (bias debt).
depends-on: D-86 (`integrated` on c17-batch7; verify `#obligationsBiasDebt` on `main` first).
scope: one `queueSubjectHtml` branch naming the run and its context, read from the item and never invented; the item's `recipients` note where the plane states nobody could be named. Extend `civicos-ui/test/notifications.test.mjs`.
accepts-when: a bias-debt item names its run and context. NEGATIVE CONTROL: return "" for `run` again, and the named-run arm fails by name.
added: 2026-09-23 · SCHEDULER #17 (`node tools/mintid.mjs UI`).

### UI-97 · queued — **A MEMBER CANNOT UNDO A MUTE FROM THE APP: `op=queuemute` takes `unmute:true` for `{item}` and for `{case, kinds}`, and no client sends it.** Found by UI-86's worker. — owner UI.
order: after UI-86's row, the same queue control: a member door the plane already opens (SCHEDULER #17, 2026-09-24; via CONDUCT #19)
milestone: M8
interface: I3 consumer.
design: `docs/development/NOTIFICATIONS.md` §"MARKED AS HANDLED — and handling has a SCOPE, which differs by class".
depends-on: UI-86.
scope: in `queueMuteReportHtml`, a per-muted-item "Let this reach me again" sending `{item, unmute:true}`, and a per-case "Unmute" sending `{case, kinds, unmute:true}`; register the repeated control in `member-respect` SETS. Extend `civicos-ui/test/notifications.test.mjs`.
accepts-when: a muted item unmuted from the report reaches the member again. NEGATIVE CONTROL: omit `unmute:true`, and the round-trip arm fails by name.
added: 2026-09-24 · SCHEDULER #17 (`node tools/mintid.mjs UI`).

### REC-207 · queued — **NOTHING SETTLES A BIAS-DEBT OBLIGATION BUT THE LENS MOVING BACK: a re-run under the current lens is not recognised, and `op=taskresolve` addresses tasks, not runs.** BOB #32's ruling of 2026-09-23 23:42Z (cite until folded into Declared Bias "Bias debt, and HUNCH DEBT" and NOTIFICATIONS): *BOTH acts settle it, each RECORDED, never cleared silently — (1) a re-run under the CURRENT lens discharges the debt of the run it re-runs, closed with the discharging run's id and lens pins (any other lens discharges nothing); (2) a member's resolve with a REQUIRED stated reason, authored, attributed, dated, append-only, riding the task-resolve path or its equivalent.* — owner RECORD.
order: behind D-86's train, as ruled; with the M4 bias rows (SCHEDULER #17, 2026-09-23)
milestone: M4
interface: I3 — the discharge on the obligation and the resolve act; the integrator mints and classifies the IC.
design: `docs/architecture/BIO_Declared_Bias_v0_1.md` (bias debt), with BOB #32's ruling of 2026-09-23 23:42Z (cite until folded into Declared Bias "Bias debt, and HUNCH DEBT" and NOTIFICATIONS); DEC-24 (derived informs, authored binds) and DEC-69 (a member is never forced).
depends-on: D-86 (`integrated` on c17-batch7).
scope: the re-run discharge recording the discharging run's id and lens pins; the member's resolve with a required reason; the lens moving back stays a third discharge.
accepts-when: a re-run under the current lens closes the obligation naming that run; one under another lens leaves it open; a resolve without a reason is refused by name. NEGATIVE CONTROL: discharge on any re-run, and the other-lens arm fails by name.
added: 2026-09-23 · SCHEDULER #17 (`node tools/mintid.mjs REC`).

### D-468 · queued — **A BIAS SET ACCEPTS `adopted` → `proposed`: promote does not enforce the STATES edges against the head, so a revision can move backwards.** Found by REC-187's worker (F4). — owner RECORD.
order: after REC-207, with the bias rows: a correction to a built state machine (SCHEDULER #17, 2026-09-24; REC-187's worker via CONDUCT #19)
milestone: M4
interface: I3 — one refusal; the integrator mints and classifies the IC.
design: `docs/architecture/BIO_Declared_Bias_v0_1.md` §"Bias bundles and adoption".
depends-on: REC-187 (`integrated` on c19-batch9).
scope: promote checks each bias-set transition against the declared STATES edges from the current head and refuses any other by name.
accepts-when: `adopted` → `proposed` is refused by name; every declared edge still passes. NEGATIVE CONTROL: drop the edge check, and the backwards arm fails by name.
added: 2026-09-24 · SCHEDULER #17 (`node tools/mintid.mjs D`).

### REC-210 · queued — **ADOPTING A PROPOSED BIAS REVISION DOES NOT SAY SO: REC-187 re-pins the adoption to the adopted sha, but an adoption that pins a proposed, not-yet-accepted revision reads like any other.** BOB #32's ruling of 2026-09-24 00:42Z (relayed by CONDUCT #19; cite until folded into Declared Bias): *adopting a PROPOSED revision is a REPLACEMENT; the adoption must SAY it pins a proposed revision, and `op=biasadopt`'s answer and the adoption's read state that marker.* — owner RECORD.
order: after D-468, with the bias rows (SCHEDULER #17, 2026-09-24; REC-187's worker F1)
milestone: M4
interface: I3 additive — a marker on the adoption's answer and read; the integrator mints and classifies the IC.
design: `docs/architecture/BIO_Declared_Bias_v0_1.md` §"Bias bundles and adoption", with BOB #32's ruling of 2026-09-24 00:42Z (relayed by CONDUCT #19; cite until folded into Declared Bias).
depends-on: REC-187 (`integrated` on c19-batch9).
scope: record and publish the marker when the adopted revision is still proposed; the re-pin itself is built.
accepts-when: adopting a proposed revision answers and reads the marker; adopting an accepted one does not. NEGATIVE CONTROL: drop the marker, and the proposed-adoption arm fails by name.
added: 2026-09-24 · SCHEDULER #17 (`node tools/mintid.mjs REC`).

### UI-94 · queued — **THE QUEUE CANNOT FORWARD A SELECTION: D-126 lets the plane take the set, and the member picker is per item.** — owner UI.
order: after D-176 (SCHEDULER #17, 2026-09-23; D-126's worker via CONDUCT #18 23:47Z)
milestone: M8
interface: I3 consumer (IC-235).
design: `docs/development/NOTIFICATIONS.md` (its Incomplete section names it), with D-126's per-item weight.
depends-on: D-126 (`integrated` on c17-batch7).
scope: a bulk forward over the queue's selection, sent as the set.
accepts-when: a selection of three forwards in one act. NEGATIVE CONTROL: loop per item, and the one-act arm fails by name.
added: 2026-09-23 · SCHEDULER #17 (`node tools/mintid.mjs UI`).

### REC-205 · queued — **A PROJECT-SCOPED FINDING CANNOT JOIN A QUEUE SELECTION: its act names a project per item, so D-126's set has no way to carry one.** — owner RECORD, then UI.
order: after UI-94 (SCHEDULER #17, 2026-09-23; D-126's worker)
milestone: M8
interface: I3 — the set act carries each item's project; the integrator mints and classifies the IC.
design: `docs/development/NOTIFICATIONS.md` §"MARKED AS HANDLED — and handling has a SCOPE, which differs by class".
depends-on: D-126 (`integrated` on c17-batch7).
scope: the set act admits project-scoped items, each resolved against its own project.
accepts-when: a selection mixing a project-scoped finding and a condition is handled in one act. NEGATIVE CONTROL: drop the per-item project, and the mixed-selection arm fails by name.
added: 2026-09-23 · SCHEDULER #17 (`node tools/mintid.mjs REC`).

### D-444 · queued — **THE PROJECT OFFERS `reinstate` THAT THE STORE WILL REFUSE: the reinstate affordance's PROJECT arm keys on the count `cites_out.severed`, so a project whose only severed edges point at RETIRED items is offered the act, and REC-183's `#edgeTransition` refuses it RETIRED_NOT_CITABLE.** The worker states it at `affordances.mjs` beside the rule (*"The PROJECT arm is not narrowed"*). — owner RECORD.
order: after UI-86: a correction to just-landed work (REC-183), an affordance that promises an act the record refuses; directly ahead of the census rows (SCHEDULER #17, 2026-09-23, REC-183's worker via CONDUCT #17, 22:09Z; verified at land/worker/REC-183 @ 27905f5d)
milestone: M8
interface: I3 additive — one new fact in `affordanceFacts`; the integrator mints and classifies the IC.
design: `docs/architecture/BIO_State_Rules_Consistency_v1_5.md` §4.1 (a retired item is not citable; BOB #30), with the affordance contract that an offered act is one the store accepts.
depends-on: REC-183 (finished, awaiting integration).
scope: `affordanceFacts` gains a fact counting severed out-edges whose target is NOT retired (e.g. `cites_out.severed_reinstatable`), read by the same predicate `#edgeTransition` runs; the PROJECT arm keys on it. Extend `bio-plane/test/affordances.test.mjs`.
accepts-when: a project whose only severed edge targets a retired item is not offered reinstate; one with a severed edge to a live item is, and the store accepts it. How a liar passes it: dropping reinstate from projects entirely, so the live-target arm must be offered. NEGATIVE CONTROL: key the arm back on `cites_out.severed`, and the retired-only arm fails by name.
added: 2026-09-23 · SCHEDULER #17 (`node tools/mintid.mjs D`; placed directly as a plan row, never a DEBT row — BOB #31, 2026-09-23 22:09Z).

### D-445 · queued — **D-443's CAP ON `publishedCaseRegistryFor` IS PINNED BY SHAPE ONLY: it binds one `json_each` value, and `frontier-chunk.test.mjs` D443-7 asserts that structurally; its own header says it was never driven past 100 ids.** D-443 is NARROWED to this one trace, not closed. — owner RECORD.
order: after D-444: a correction to just-landed work (D-443), a guarantee the suite does not yet exercise (SCHEDULER #17, 2026-09-23; D-443's worker via CONDUCT #18 22:27Z (4), verified at c17-batch7 @ f32fe714)
milestone: M0 (a behavioural arm over M4 code)
interface: none — a behavioural arm.
design: `docs/development/VERIFICATION.md` (test through the op), with D-36's bound on bound variables.
depends-on: D-443 (`integrated` on c17-batch6).
scope: arm D443-7b seeds 120 ratified published cases pinning one finding sha and gates that finding through the op that reaches `gateFacts`. In `bio-plane/test/frontier-chunk.test.mjs`.
accepts-when: D443-7b is green through the op. NEGATIVE CONTROL: the existing `casereg` arm of `frontier-chunk.control.mjs` fails D443-7b by name.
added: 2026-09-23 · SCHEDULER #17 (`node tools/mintid.mjs D`).

### D-448 · queued — **ELEVEN REVIEW-COPY REFUSAL CODES REACH A MEMBER WITH NO CANNED TRANSLATION: UI-68's surface now shows `REVIEW_NOT_PROJECT_OWNER`, `REVIEW_NO_PROJECT`, `REVIEW_DRAFT_CHANGES_PROJECT`, `REVIEW_NO_SUCH_CASE`, `REVIEW_DRAFT_TOO_LARGE`, `REVIEW_NO_RECIPIENT`, `REVIEW_NO_SECRET`, `REVIEW_NO_GRANT`, `REVIEW_NO_COMMENT_TEXT`, `REVIEW_UNKNOWN_ACT` and `NO_REVIEW_COPY`, and none has a DEC-49 row.** — owner RECORD.
order: after D-445: a correction to just-landed work (UI-68) that shows members untranslated codes (SCHEDULER #17, 2026-09-23; REC-149's and UI-68's workers via CONDUCT #18 22:47Z)
milestone: M10
interface: none — a check family and its translations.
design: `docs/architecture/BIO_Publication_v0_1.md` §6A.4 (the review copy), with DEC-49's translation rule.
depends-on: UI-68 (`integrated` on c17-batch7).
scope: a review-copy `*_CHECKS` family in `bio-checks.mjs` with DEC-49 regions and one canned sentence per code. Separately worth weighing: `check-refusal-codes.mjs` learning reach-by-op, since its R2 cannot see a code no surface names.
accepts-when: the refusal-code census reads every one of the eleven as translated. NEGATIVE CONTROL: drop one code's region, and the census arm names it.
added: 2026-09-23 · SCHEDULER #17 (`node tools/mintid.mjs D`).

### D-450 · queued — **A PROJECT WHOSE BAR DECLARES ONE AXIS CAN PUBLISH AND CAN NEVER BE SIGNED: `publishCase` admits it (*an unset axis gates nothing*), `#caseDocumentText` freezes the unset axis as null, and C-41.12 (`checkCaseDocument`'s `required_strength` arm) demands both axes A–D when the bar is declared, so `op=ratify` answers GATE_REFUSED.** Found by REC-148's worker; reported, not re-measured by SCHEDULER. — owner RECORD.
order: after D-448: a correction to just-landed work (REC-148) that strands a publishable case unsigned (SCHEDULER #17, 2026-09-23; via CONDUCT #18 22:48Z (3a))
milestone: M10
interface: none — a check's admitted values.
design: `docs/architecture/BIO_Publication_v0_1.md` §"the bar" (DEC-72) and §3 rule 12, with BOB #32's ruling of 2026-09-23 23:08Z (cite until folded): *C-41.12 ADMITS null for an unset axis; the pair stays a pair — both keys present, an unset axis null, stated in words "no bar set on the <axis> axis"; `op=strengthbar` keeps accepting a one-axis bar* (refusing it would pressure an invention, CLAUDE.md §4).
depends-on: REC-148 (`integrated` on c17-batch7).
scope: C-41.12 admits null for an unset axis; the case document states the unset axis in words, never defaults and never omits the key. Extend `bio-plane/test/caseproduction.test.mjs`.
accepts-when: a one-axis bar publishes, ratifies, and its document reads "no bar set on the <axis> axis" with the key present and null. NEGATIVE CONTROL: restore the both-axes demand, and the one-axis ratify arm fails by name.
added: 2026-09-23 · SCHEDULER #17 (`node tools/mintid.mjs D`).

### D-451 · queued — **A PROJECT RUN HAS NO TARGET A MEMBER CAN NAME: `op=airun` publishes only the run's context `{type, id}`, so FL-11's `runContextTarget` cannot seed a project run, and its level-empty candidates are refused SUGGEST_NO_TARGET.** — owner RECORD, then FLEET (one line).
order: after D-450: a correction to just-landed work (FL-11), the run's suggestions lost for every project run (SCHEDULER #17, 2026-09-23; FL-11/12's worker via CONDUCT #18 22:51Z)
milestone: M9
interface: I3 additive — `aiRunRead` publishes a project run's questions; the integrator mints and classifies the IC.
design: `docs/development/INVESTIGATIVE-SESSION.md` §11 (the RUN is an object) and §9 (what a SUGGESTION is).
depends-on: FL-11 (`integrated` on c17-batch7).
scope: for a project run, `aiRunRead` publishes the questions the project confirmed-cites (the set `#runContextProjects` uses); `runContextTarget` takes a single one or leaves several to the candidate. Extend `agent-worker/test/agent-worker.test.mjs` and the airun suite.
accepts-when: a project run citing one question seeds it as the target, and its level-empty candidates are filed. NEGATIVE CONTROL: drop the questions from the read, and the project-run arm reads SUGGEST_NO_TARGET by name.
added: 2026-09-23 · SCHEDULER #17 (`node tools/mintid.mjs D`).

### D-454 · queued — **ONE STRING READ ON SEVERAL PAGES IS ONE MENTION: `reading_refs` holds a single position per (capture_sha, ref), so a member choosing a connection's on-point mention (REC-122) cannot choose between that string's occurrences.** — owner CAPTURE / FRAMEWORK (the reading tables).
order: after D-452: a correction that REC-122's act exposes; the choice it built is only as fine as the positions it can name (SCHEDULER #17, 2026-09-23; REC-122's worker via CONDUCT #18 23:08Z)
milestone: M4
interface: I5 — `reading_refs` keyed by (capture_sha, ref, position); I3 — a resolution carries its occurrence. The integrator mints and classifies the ICs.
design: `docs/architecture/BIO_Content_Framework_v0_10.md` §14.5 (the connection pair) and §8 (the reading positions a connection rests on).
depends-on: REC-122 (`integrated` on c17-batch7).
scope: re-key `reading_refs` by position with a migration that keeps every existing row; each resolution names its occurrence; the connection's mentions list every occurrence.
accepts-when: a ref read on three pages yields three mentions, each choosable. NEGATIVE CONTROL: restore the two-column key, and the three-occurrences arm reads one by name. Extend the reading suite (`bio-plane/test/reading-position*.test.mjs`).
added: 2026-09-23 · SCHEDULER #17 (`node tools/mintid.mjs D`).

### UI-91 · queued — **A MEMBER CAN CHOOSE A CONNECTION'S ON-POINT MENTION ON THE PLANE, AND NO SURFACE OFFERS IT: REC-122's `connectionchoose` (IC-232, C-74) has no page; construct 6.on-point-ui is ABSENT.** The DELEGATION RECORD (REC-122) -> UI of 2026-09-23 is on coord `CLAIMS.md`. — owner UI.
order: after D-454, the member half of REC-122 (SCHEDULER #17, 2026-09-23; REC-122's worker via CONDUCT #18 23:08Z)
milestone: M4
interface: I3 consumer (IC-232).
design: `docs/architecture/BIO_Content_Framework_v0_10.md` §14.5 (the connection pair and what it is NOT), with D-161's act 3.
depends-on: REC-122 (`integrated` on c17-batch7; verify the op on `main` first).
scope: on the connection display, offer a signed-in member the choice among the mentions the C-49.4 entries name as bearing; show the chosen mention BESIDE the machine's pair, never replacing it; render a lapsed choice as the plane states it; replace 6.on-point-ui's `uinone` probe with `hit` probes.
accepts-when: a member's choice renders beside the machine's pair, and a lapsed one reads as the plane states it. NEGATIVE CONTROL: render the choice in place of the pair, and the "never replacing" arm fails by name.
added: 2026-09-23 · SCHEDULER #17 (`node tools/mintid.mjs UI`).

### UI-95 · queued — **A MEMBER SEES A CUT SET OF CONNECTIONS AS THE WHOLE SET: D-241 publishes the entity arm's `derivation`, and `app.html`'s subject view (`connectionsBoundHtml`) never renders `derivation.says`.** — owner UI.
order: after UI-91, the connection display: a surface that claims more than the record holds (SCHEDULER #17, 2026-09-23; D-241's worker via CONDUCT #18 00:15Z)
milestone: M3
interface: I3 consumer (IC-236).
design: `docs/development/CONTENT-SEARCH-DESIGN.md` §4.3 (the cap, and truncation stated).
depends-on: D-241 (`integrated` on c18-batch8).
scope: render `derivation.says` whenever `derivation.cut` is true or the state is not `derived`, beside the connection list. Extend the subject-view harness in `civicos-ui/test/`.
accepts-when: a cut derivation shows its sentence; a whole one shows none. NEGATIVE CONTROL: drop the render, and the cut-set arm fails by name.
added: 2026-09-23 · SCHEDULER #17 (`node tools/mintid.mjs UI`).

### UI-96 · queued — **A MEMBER WHOSE CASE RESTS ON A PASSAGE IS STILL NEVER TOLD A NEWER VERSION EXISTS: D-394 built the plane's cross-version notice (`versionnotice`, C-80; construct 4.cross-version BUILT), and 4.cross-version-ui is ABSENT: no surface shows it where a member meets a citation.** — owner UI.
order: after UI-95: the plane half's member surface (SCHEDULER #17, 2026-09-23; D-394's worker via CONDUCT #18)
milestone: M4
interface: I3 consumer (IC-239).
design: `docs/architecture/BIO_Content_Framework_v0_10.md` §18.1.
depends-on: D-394 (`integrated` on c18-batch8).
scope: where a citation is shown, render the notice's state as the plane states it, including "the chain could not be read"; replace 4.cross-version-ui's probe.
accepts-when: a citation to a superseded passage shows the notice; an unread newer capture reads as not read, never as unchanged. NEGATIVE CONTROL: collapse "not read" into "unchanged", and that arm fails by name.
added: 2026-09-23 · SCHEDULER #17 (`node tools/mintid.mjs UI`).
note: 2026-09-24 — RE-SCOPED by Bob's ruling (Framework §18.1, option D; folds-0924b): the proactive notice reaches a published case's OWNERS only (delivery is REC-209); the surface shows it to owners, and anyone may still ASK at a citation.

### REC-209 · queued — **A PUBLISHED CASE'S OWNERS ARE NEVER TOLD ITS CITED DOCUMENT HAS A NEWER VERSION: D-394's notice answers only when asked.** Re-scoped 2026-09-24 to OWNERS by Bob's ruling (option D), replacing BOB #32's 00:05Z "members". — owner RECORD.
order: after UI-96, the notice's delivery (SCHEDULER #17, 2026-09-24)
milestone: M10
interface: I3 — one queue item per published case and newer version, to its owners; the integrator mints and classifies the IC.
design: `docs/architecture/BIO_Content_Framework_v0_10.md` §18.1 — RULED by Bob (2026-09-24, option D; folded on land/bob/folds-0924b @ bde7644d): *a published case's OWNERS alone are told ONCE when a cited document has a newer version; other members and the public are not told; the case is never altered; a new edition stays the owners' choice.*
depends-on: D-394 (`integrated` on c18-batch8).
scope: when a published case's cited document gains a newer version, raise one queue item to the case's OWNERS only, recorded so it is never raised twice for that pair; nothing to other members, the public surface, or the published case.
accepts-when: a newer version raises exactly one item to the owners and none to a non-owner member; a second tick raises none; the published bytes are unchanged. NEGATIVE CONTROL: address the item to every member, and the non-owner arm fails by name.
added: 2026-09-24 · SCHEDULER #17 (`node tools/mintid.mjs REC`); re-scoped to owners the same day.

### UI-88 · queued — **THE ACCEPT CEREMONY FETCHES THE STRENGTH PAIR BEFORE THE MEMBER AFFIRMS, AND HIDES IT: `app.html` `acerOriginsRead` reads `op=versionstrength` and drops the pair client-side.** Once REC-192 lands it switches to the independence-only read. — owner UI.
order: directly after REC-192, which it consumes (SCHEDULER #17, 2026-09-23; BOB #31's ruling of 2026-09-23 22:22Z (cite it until folded))
milestone: M9
interface: I3 consumer (REC-192's IC).
design: `docs/development/INVESTIGATIVE-SESSION.md` §12 (Strength) with DEC-32 clause 5.
depends-on: REC-192, UI-74 (`integrated` on c17-batch5).
scope: `acerOriginsRead` reads the version arm of the independence read; no code path fetches a strength-bearing answer before the affirmation. Extend `civicos-ui/test/accept-ceremony.test.mjs`.
accepts-when: before the affirmation the ceremony's network log holds no strength-bearing answer. NEGATIVE CONTROL: point `acerOriginsRead` back at `op=versionstrength`, and the pre-affirmation fetch arm fails by name.
added: 2026-09-23 · SCHEDULER #17 (`node tools/mintid.mjs UI`).

### D-453 · blocked — awaiting Bob: egress from this cloud to Oakland's hosts (the proxy refused CONNECT to Legistar, data.oaklandca.gov, www.oaklandca.gov, opengov, Accela, acgov.org, oaklandauditor.com on 2026-09-23), an environment setting only Bob can change — **D-74's IDENTIFIER-SPACE MEASUREMENT IS HALF TAKEN: four cross-system joins were never measured, so construct 6.identifier-spaces stays ABSENT on evidence that stops at the corpus already held.** — owner CONTENT (a measurement).
order: after D-64, a measurement blocked on the environment; its results feed BOB's three recogniser designs (SCHEDULER #17, 2026-09-23; D-74's worker via CONDUCT #18 22:58Z)
milestone: M0 (a measurement for M4's identifier spaces)
interface: none — measurements.
design: `docs/development/VERIFICATION.md` (measure; do not recall), for M-119 and `tools/m119-idspace.py`.
depends-on: D-74 (`integrated` on c17-batch7); egress.
scope: (a) Legistar unfiltered, looking up the C.M.S. numbers the ACFRs and budget books cite; (b) the procurement host's contract and PO numbers against Legistar awards; (c) Assessor APNs against Legistar and Accela; (d) one 100xxxx project in both a budget book and a Legistar title, and whether a C-form to new-form crosswalk exists. Re-run `tools/m119-idspace.py` over the wider corpus.
accepts-when: each of (a)–(d) is recorded with date, instrument and counts, a refused host named as refused rather than read as absent. NEGATIVE CONTROL: feed the tool a corpus with one planted join, and it counts exactly one.
added: 2026-09-23 · SCHEDULER #17 (`node tools/mintid.mjs D`).

### REC-203 · blocked — awaiting egress to Oakland's hosts (D-453; Bob's environment setting) — **OAKLAND'S THREE SHARED IDENTIFIER SPACES ARE DESIGNED AND NOT BUILT: the project number (budget line to Legistar award, the grade C→B lever), the C.M.S. number (any citing document to the Legistar matter by MatterEnactmentNumber), and the fund code (counted only when the fund NAME agrees).** — owner RECORD.
order: behind D-453, whose measurements it rests on, as BOB #32 ruled (*Row them RECORD, blocked behind D-453's egress*) (SCHEDULER #17, 2026-09-23)
milestone: M4
interface: I3/I5 — three recognisers and their eras; the integrator mints and classifies the ICs.
design: `docs/architecture/BIO_Content_Framework_v0_10.md` §8.3 "WHAT MAKES A SHARED IDENTIFIER COUNT" (on `land/bob/rulings-0923b` @ fd93bf1d, riding the next train): a match counts when the REFERENT agrees in two INDEPENDENT systems; two publications of one source are one system; a space whose format changes is one space with dated ERAS, joined across eras only through a captured crosswalk.
depends-on: D-453 (egress), D-74 (`integrated`).
scope: a recogniser per space under §8.3's counting rule, eras for the project-number format change (C###### → 100xxxx).
accepts-when: a budget line and its Legistar award join by project number only when the referent agrees; a fund code alone never counts. NEGATIVE CONTROL: count two publications of one source as two systems, and the independence arm fails by name.
added: 2026-09-23 · SCHEDULER #17 (`node tools/mintid.mjs REC`).

### REC-191 · queued — **MONITORING SCHEDULES A BUNDLE, NOT AN ADDRESS, AND ONLY BY ITS AUTHORED FREQUENCY: sixty captures of one document are sixty schedules, and a document with no authored frequency reads `unscheduled` though `op=monitor` answered it by its contract (D-65's worker finding (a)).** `Store#monitorCadencePlan` selects `bundles WHERE monitor_enabled=1`. — owner RECORD.
order: after REC-190, behind D-65 (running; same op and path); a gap, not an over-claim (SCHEDULER #17, 2026-09-23, CONDUCT #17 21:43Z (5) and #18 22:27Z (2), verified at the code)
milestone: M3
interface: I3 — `op=monitor`'s schedule and report become per address, naming every version grouped; the integrator mints and classifies the IC.
design: D-220's ruled intent (Bob 2026-08-06, *"Monitoring an ADDRESS is what a member means"*) with `docs/architecture/BIO_Content_Framework_v0_10.md` §6 (the contract sets the check frequency); BOB #31's 22:03Z ruling (cite until folded): *the ADDRESS's own setting governs; where none is set, the CURRENT version's; never the shortest; a disagreement is STATED.*
depends-on: D-65 (c17-batch6), D-220 (c17-batch4), both `integrated`.
scope: `#monitorCadencePlan` groups monitored bundles by `captured_locators.address_norm` through the version-chain join, checks the address once against its current version, reports the versions grouped and any frequency disagreement; persists each address's content type from the tick (in `purge`) and falls back to `CONTRACT_FREQUENCY` where nothing is authored. Renumber D-220's archived body to match its disposition. Extend `bio-plane/test/monitor-cadence.test.mjs`.
accepts-when: three captures of one address give one due entry; two addresses sharing a title give two.; a calendar with no authored frequency is due a day after one tick. NEGATIVE CONTROL: restore the per-bundle select, and the one-address arm fails by name, and dropping the fallback fails the calendar arm.
added: 2026-09-23 · SCHEDULER #17 (CONDUCT #17's finding; `node tools/mintid.mjs REC`).

### D-455 · queued — **A `changed` MONITOR TICK DISCARDS THE BYTES IT FETCHED: it points its result at the baseline because the new document is not captured, though the monitor already held those bytes to see the change.** BOB #32's ruling of 2026-09-23 23:08Z (cite until folded): *a `changed` tick CAPTURES the new bytes (a monitor capture with its own provenance, through the governor), and its result_ref points at the new capture's sha* — superseding `OBSERVATION-LOG-DESIGN.md` §4.1's reason. — owner RECORD.
order: after REC-191, the same monitor path; evidence in hand is being thrown away (SCHEDULER #17, 2026-09-23; D-65's worker finding (b))
milestone: M3
interface: I3/I5 — a monitor capture and the observation's reference; the integrator mints and classifies the IC.
design: `docs/development/OBSERVATION-LOG-DESIGN.md` §4.1, with BOB #32's ruling of 2026-09-23 23:08Z (cite until folded).
depends-on: D-65 (`integrated` on c17-batch6).
scope: on `changed` the tick captures the served bytes with monitor provenance through the governor and points the observation at that capture. Extend `bio-plane/test/monitor-assess.test.mjs`.
accepts-when: a changed tick leaves a capture whose sha the observation names, and that sha resolves in the register. NEGATIVE CONTROL: skip the capture, and the "result names a held capture" arm fails by name.
added: 2026-09-23 · SCHEDULER #17 (`node tools/mintid.mjs D`).

### D-338 · queued — **THE `unmonitorable` CONTRACT IS DECLARED AND UNTESTED: D-65 maps a shell to UNMONITORABLE (`CONTRACT_FREQUENCY.unmonitorable: null`, with its why), and no suite drives it; whether the monitor still reports a hash delta for such a document is UNDETERMINED.** — owner RECORD.
order: after D-455, the same monitor path (SCHEDULER #17, 2026-09-23, LED-7 S17-3; verified at the code on `02603e88`)
milestone: M3
interface: none — an arm.
design: `docs/architecture/BIO_Content_Framework_v0_10.md` §6.
depends-on: D-65 (`integrated` on c17-batch6).
scope: an unmonitorable arm in D-65's monitor suite (`bio-plane/test/monitor-assess.test.mjs`); fix any hash-delta report it exposes.
accepts-when: a shell-profiled document's answer states unmonitorable and grades no change. NEGATIVE CONTROL: map unmonitorable to weekly, and the arm fails by name.
added: 2026-09-23 · SCHEDULER #17 (LED-7 S17-3; keeps its `D-` id).

### REC-162 · queued — **A FOUNDER-ONLY OP'S REFUSAL CALLS AN ENROLLED ADMINISTRATOR A NON-ADMINISTRATOR.** Five ops sit in `SESSION_OPS.admin` and … (whole text: the cut archive)
order: back to back after REC-159, the same two suites (`d270-refusal-truth`'s ROLE literal, `adminvote` §8f), the second re-reading the first's pins; a false refusal sentence, CLAUDE.md §2's class (BOB #23's entry, 2026-09-21; SCHEDULER #7)
milestone: M8
interface: I3 — the refusal's sentence; the integrator classifies it in IC-55's family.
design: `docs/architecture/BIO_Membership_Architecture_v2.md` §4.9, *AND ADMINISTRATORS DO NOT RUN THE INSTANCE* (BOB #23, 2026-09-21).
depends-on: REC-159 (sequence: the same `SESSION_OPS` sets and ROLE literal; made a dependency 2026-09-23 by SCHEDULER #16 so no refill takes this row ahead of it).
accepts-when: an enrolled administrator and a member, each refused `governorconfig`, read the founder's-session sentence; the founder's session and the ADMIN_TOKEN bearer still set an … (whole text: the cut archive)
added: 2026-09-21 · SCHEDULER #7 (BOB #23's inbox entry, drained this commit; `node tools/mintid.mjs REC`).
scope-add: 2026-09-24 by SCHEDULER #17, BOB #32's ruling (00:00Z): correct `AI_SCOPE_BEYOND_MEMBER_REACH`'s detail ("not reachable by a member"), now loosely false for REC-159's four custodial acts, in the same `SESSION_OPS` sets this row touches; no new row. The founder's NOT_AN_ADMIN on an unclaimed store (scratch) STANDS: a live verification claims an administrator in scratch first.

### REC-155 · queued — **SEVEN VERBS WHOSE `OPS` ROW ADMITS A SESSION CLASS WERE REACHABLE BY NO SESSION, AND NOBODY HAD RULED WHY — NOW RULED** … (whole text: the cut archive)
order: where it stood, now with its design (BOB #20's entry): the plane is honest here — a determination was owed, not a defect shipping — and this landing refuses nobody (SCHEDULER #5, 2026-09-21; placed by SCHEDULER #3, 2026-09-19)
milestone: M8
interface: I3 — MINOR: sessions gain reach and no class list moves; the integrator mints the IC.
design: `docs/architecture/BIO_Membership_Architecture_v2.md` §4.10 (ruled by BOB #19, landed by BOB #20 at `d9cf3283`).
depends-on: REC-159 (sequence: the same `SESSION_OPS` sets and ROLE literal; made a dependency 2026-09-23 by SCHEDULER #16 so no refill takes this row ahead of it).
accepts-when: each of the five answers a member session and an administrator session with the op's own result; the two unattended ops answer every session `MACHINE_CREDENTIAL_REQUIRED` with … (whole text: the cut archive)
added: 2026-09-19 · SCHEDULER #3 (CONDUCT #7's item 1); designed 2026-09-21 by §4.10, BOB #20's entry drained by SCHEDULER #5.

### REC-185 · queued — **`op=purge`'s `purge requires confirm=<store>` (a 400 in `index.mjs`) IS STILL A BARE SENTENCE WITH NO CODE — the last of D-278's class the sweep could see.** Re-read on `land/conduct/c17-batch3` @ `d93d29c4`: `json({ ok: false, error: "purge requires confirm=<store>", … })`. UNDETERMINED, stated by the worker: its matcher sees only `json({ok:false…})` literals in `index.mjs`, not the 16 codes forwarded through a spread from the store, nor refusals built without `json()`. — owner RECORD.
order: directly after UI-84, the same D-278 class: a refusal with no code a member cannot be told in words (CLAUDE.md §2) (SCHEDULER #16, 2026-09-23; D-278's worker via CONDUCT #17)
milestone: M7
interface: I3 — `op=purge`'s refusal gains a code through `requiredArgument`; the integrator classifies the IC.
design: DEC-49, as `docs/architecture/BIO_Assistant_and_AI_Roles_v0_1.md` rule 10 restates it, with D-278's landed `requiredArgument` as the precedent.
depends-on: D-278 (on `land/conduct/c17-batch3`).
scope: the refusal is `requiredArgument("purge", "confirm", "<store name>", …)`; the sweep's two blind spots (spread-forwarded codes, refusals built without `json()`) are measured and each listed or coded.
accepts-when: `bio-plane/test/refusal-wire.test.mjs` gains an arm: `op=purge` without `confirm` answers the coded refusal with its canned translation, through the op. NEGATIVE CONTROL: restore the bare sentence, and that arm fails by name.
added: 2026-09-23 · SCHEDULER #16 (D-278's worker's finding via CONDUCT #17, verified on the batch; `node tools/mintid.mjs REC`).

### REC-186 · queued — **MEMBERSHIP §7's TWO UNRULED EDGES, RULED (BOB #31, 2026-09-23 21:37Z): (a) THE PROJECT'S ONLY OWNER CANNOT "ASK TO LEAVE" — `projectLeave` refuses the last owner by name ("transfer ownership first") and `op=affordances` does not offer it; a non-last owner may leave. (b) A JOINED PARTICIPANT IS NOT OFFERED "JOIN" — `projectJoin` stays idempotent, but an offer that does nothing is an overclaim.** Found by D-311's worker (`projectLeave` does not check the owner flag). — owner RECORD.
order: directly after REC-185, the D-311 follow-on: a project left ownerless and an affordance that changes nothing are both the record claiming more than it supports (CLAUDE.md §2) (SCHEDULER #16, 2026-09-23; BOB #31's ruling, via CONDUCT #17)
milestone: M8
interface: I3 — a new refusal on `op=projectleave` and a narrower `op=affordances`; the integrator mints and classifies the IC.
design: `docs/architecture/BIO_Membership_Architecture_v2.md` §7.4 and §7.6, with BOB #31's ruling of 2026-09-23 21:37Z (BOB folds it into §7 at his next doc landing).
depends-on: D-311 (on `land/conduct/c17-batch3`).
scope: (a) and (b) as ruled.
accepts-when: in a NEW suite `bio-plane/test/rec-186-leave-join.test.mjs`, through the ops: the last owner's leave is refused with the membership rows byte-identical after, a co-owner's leave lands; affordances offers no join to a joined participant and does offer it to an invited non-participant. NEGATIVE CONTROL (`rec-186-leave-join.control.mjs`): drop the owner check, and the refusal arm fails by name; offer join unconditionally, and the join arm fails by name.
added: 2026-09-23 · SCHEDULER #16 (BOB #31's ruling; `node tools/mintid.mjs REC`).

### DIST-7 · queued — **THE INSTALLER UPLOADS EVERY GROUP'S PLANE WITH NO `limits`, SO EACH INSTANCE RUNS AT CLOUDFLARE'S DEFAULT SUBREQUEST LIMIT WHATEVER THE SIGNED RELEASE CARRIES.** Re-read on `91bcea6b`: `newgroup/src/index.mjs` `uploadInstall` and `uploadUpdate` hard-code `main_module`, `compatibility_date` and `compatibility_flags` and send no `limits`. — owner DIST.
order: after D-443, the first installer row: a sovereign group's instance runs under a ceiling its own release does not set, so the project's measured subrequest figure does not reach a group (D-54's finding); product (M7), below the record-integrity rows (SCHEDULER #16, 2026-09-23; D-54's worker via CONDUCT #17)
milestone: M7
interface: I5 (the installer's upload metadata); the integrator classifies.
design: `docs/architecture/BIO_Distribution_v0_1.md` (the installer installs the signed release as released), with IC-82's carry of `compat` from the signed release as the precedent.
depends-on: D-54 (its `limits.subrequests` and `15.subrequest-limit` claim; on `land/conduct/c17-batch3`).
scope: `uploadInstall` and `uploadUpdate` carry `limits.subrequests` from the signed release, as `compat` is carried, never falling back to the default; at the next cut DIST reads `deploy.mjs`'s `limits.subrequests` read-back line (or its UNDETERMINED line) and moves `15.subrequest-limit` to match. UNDETERMINED: whether `/settings` reports `limits` once set; if not, the read-back uses the script-versions API.
accepts-when: `newgroup`'s wizard suite (`newgroup/test/`) asserts both uploads send the release's `limits.subrequests`, and a release without it is refused by name; `status.mjs --check` 0 drift. NEGATIVE CONTROL: drop `limits` from `uploadUpdate`, and that arm fails by name.
added: 2026-09-23 · SCHEDULER #16 (D-54's worker's finding via CONDUCT #17, verified at the code; `node tools/mintid.mjs DIST`).

### DIST-8 · queued — **SCRATCH ON THE LIVE INSTANCE HOLDS OTHER, GONE SESSIONS' RESIDUE (CPDF-3 counted 17 bundles, 11 aiRuns and more).** BOB #32's ruling of 2026-09-23 23:30Z (cite until folded): *scratch hygiene belongs to the session that wrote it; residue left by sessions that are gone is DIST's, swept at each cut's live verification.* — owner DIST.
order: with DIST's rows; one sweep now, then at each cut (SCHEDULER #17, 2026-09-23, LED-7 S17-4)
milestone: M0 (live-instance hygiene)
interface: none
design: `docs/development/VERIFICATION.md` (CLAUDE.md §5: verify live in scratch, swept after), with BOB #32's ruling of 2026-09-23 23:30Z (cite until folded).
depends-on: none.
scope: sweep today's residue from scratch with `store=scratch` named on every call, the record's counters read before and after; add the sweep to DIST's cut verification.
accepts-when: scratch reads empty after the sweep and `bio`'s counters are unchanged. NEGATIVE CONTROL: a sweep call without `store=scratch` is refused (D-456) or moves `bio`'s counters, and the witness arm fails by name.
added: 2026-09-23 · SCHEDULER #17 (`node tools/mintid.mjs DIST`).

### M0-140 · queued — **DEBT.md LEAVES THE PROCESS: with its last rows closed (D-313, D-391, D-388 on folds-0924b's landing), Bob's 22:09Z ruling removes it — CLAUDE.md §1/§4, `tools/owed.mjs`, plancheck's DEBT arms, `tools/ledger.mjs`'s DEBT handling, `coord.mjs`'s `LC-debt-*` and `LC-undecided-route` arms, `corpuscheck.test.mjs` §5's D-388 pin, and the kickoffs.** — owner M0 (tools), with BOB for CLAUDE.md and the kickoffs.
order: at the head of the M0 group: it removes checks that would otherwise fail on an empty ledger, and a gate that reads a retired file is a gate that lies (SCHEDULER #17, 2026-09-24; BOB #32 02:05Z)
milestone: M0
interface: none — process tooling.
design: `docs/development/WORK-PIPELINE.md` §3 (LED-7's end state: DEBT.md at 0, then archived), with `docs/development/VERIFICATION.md`.
depends-on: land/bob/folds-0924b on `main`; D-313, D-391, D-388 closed.
scope: archive DEBT.md whole into `docs/archive/ledgers/`; remove or re-point every reader named above; a defect is minted `D-` and placed as a plan row (the rule already in force).
accepts-when: `node tools/plancheck.mjs` and the coord ledger checks pass with no DEBT.md, and no live tool reads it. NEGATIVE CONTROL: restore one reader, and its arm fails naming the missing file.
added: 2026-09-24 · SCHEDULER #17 (`node tools/mintid.mjs M0`).
note: 2026-09-24 — CONDUCT #19 (02:14Z): the folds carrier landing now is fb24040e WITHOUT §6's classification; the §6 change rides WITH this row, so this row's first act is to retire `LC-undecided-route`'s D-388 clause and correct `corpuscheck.test.mjs` §5's pin together with BOB's §6 fold (prove `node tools/coord.mjs checks` passes on that tree). D-388 closes then.

### D-485 · queued — **THE DEC-49 GUARD CANNOT SEE REACH THROUGH THE REAL PLANE: under D-433 its R3 counts only codes a MOCK feeds a surface, so "every code a surface can receive carries a canned translation" was false of `NO_CITATION` for months.** Found by UI-83's worker. D-484 closes the instance; this closes the class. — owner the plane estate.
order: after M0-140, with the M0 instruments: it catches a class of defects that reach members (SCHEDULER #18, 2026-09-24; via CONDUCT #19 02:30Z)
milestone: M0
interface: none.
design: `docs/development/VERIFICATION.md` (the DEC-49 guard).
depends-on: D-484 (else the new arm reads RED on its first run).
scope: a real-plane reach arm in `civicos-ui/check-refusal-codes.mjs`: a code a real-plane UI suite observes in a surface pane counts toward reach.
accepts-when: the arm lists reached codes and all carry translations. NEGATIVE CONTROL: strip `NO_CITATION`'s translation and the arm fails by name.
added: 2026-09-24 · SCHEDULER #18 (`node tools/mintid.mjs D`).

### M0-106 · blocked — **RE-NARROWED 2026-09-23 by SCHEDULER #15 on BOB #30's ruling (`TREE-SHARING.md` §3a condition 3, "What the cut's run is", landed at `4355bfda`): a cut may rely on a GREEN FULL record for its EXACT tree only when that record's run REUSED NOTHING (M0-126 marks such a record a backstop); the `--since` arm is WITHDRAWN.** So `kickoffs/DIST.md` gate step 1 (landed `4f7efed0`) is corrected, and the witness moves to the first cut from a tree holding a backstop record. 0.73.0 and 0.74.0 held none and ran the battery, as the ruling requires. — owner DIST (its own kickoff).
order: near the head, ahead of the product rows because it CUTS GATE TIME (Bob, 2026-09-22, `CLAUDE.md` §2), DIST's own act and never a worker slot (SCHEDULER #11 on BOB #25's word, 2026-09-22); re-narrowed by SCHEDULER #15
milestone: M0
interface: none
design: `docs/development/TREE-SHARING.md` §3a condition 3 (BOB #30, 2026-09-23), with `docs/development/VERIFICATION.md` (admitted for M0 by name).
depends-on: M0-126 (the backstop mark); then DIST's first cut from a tree carrying a backstop record.
scope: DIST.md step 1 reads: `gates.mjs --full --no-reuse` on the exact tree, or a record for which pushguard's `isBackstop()` (M0-126) is true, NAMED in the cut commit, else the whole battery; `--since` removed (M0-126's worker found step 1 still naming it, via CONDUCT #15); the bumped tree's own gate stays.
accepts-when: a cut from a tree with a backstop record runs no battery and names it; a record whose run printed any REUSED unit, or a `--since`, never satisfies a cut and the battery runs.
added: 2026-09-22 · SCHEDULER #11 (BOB #25's inbox entry, item 1; `node tools/mintid.mjs M0`); re-narrowed 2026-09-23 by SCHEDULER #15 (BOB #30's ruling).

### REC-158 · queued — **THE PROVENANCE PAIR'S BEARER WRITE IS STAMPED `token:<class>` — NOBODY'S NAME — ON WHAT §4.10 CALLS A NAMED MEMBER'S** … (whole text: the cut archive)
order: directly after REC-155, which it waits on (BOB #20's entry): this landing REFUSES a caller, so it follows the session route DRIVEN, keeping D-200's chain-absent population a route to repair (SCHEDULER #5, 2026-09-21)
milestone: M8
interface: I3 — MAJOR, breaking for bearer writers of the pair; the integrator mints the IC.
design: `docs/architecture/BIO_Membership_Architecture_v2.md` §4.10, the provenance pair's bullet, with D-421 … (whole text: the cut archive)
depends-on: REC-155 — DRIVEN, not merely landed.
accepts-when: a bearer `apply=1` and a bearer `provenanceroute` are refused by name; a session's succeed and the author written is the session's member, never `token:<class>`; a bearer … (whole text: the cut archive)
added: 2026-09-21 · SCHEDULER #5 (BOB #20's inbox entry, drained this commit; `node tools/mintid.mjs REC`).
cut: cut to its fields by SCHEDULER #13 (2026-09-22, the backlog's 150 KiB budget); the row as it stood before this cut is VERBATIM under «REC-158» in `docs/archive/ledgers/QUEUE-cut-2026-09-22.md`. A worker READS IT before building.

### UI-75 · queued — **THE ELICITATION READ-BACK NAMES NO SHARED ORIGIN: a member affirming *"fails only if ALL of these fail"* is not told that two** … (whole text: the cut archive)
order: 2 of 2, after REC-161; with UI-74, whichever lands second reuses the first's rendering (BOB #22, 2026-09-21)
milestone: M9
interface: I3 consumer (REC-161's IC).
design: `docs/development/INVESTIGATIVE-SESSION.md` §12 clause (c), with DEC-69: inform once, at the act.
depends-on: REC-161.
accepts-when: two correlated reasons show their origin and the member's answers are written unchanged. How a liar passes it: blocking or reordering the answers on a shared origin, which turns an informing fact into a gate.
added: 2026-09-21 · SCHEDULER #7 (BOB #22's inbox entry, drained this commit; `node tools/mintid.mjs UI`).
cut: cut to its fields by SCHEDULER #12 (2026-09-22, the backlog's 150 KiB budget); the row as it stood before this cut is VERBATIM under «UI-75» in `docs/archive/ledgers/QUEUE-cut-2026-09-22.md`. A worker READS IT before building.
note: 2026-09-23 by SCHEDULER #17 (CONDUCT #17's 22:00Z finding (1), verified at c17-batch5): REC-161's `partitionindependence` op exists on c17-batch5 and `app.html` calls it nowhere; `elicFalsifier` is a pure string builder. The same commit re-grades `8.partition-independence` to BUILT and drops its `none` probe. Suite `civicos-ui/test/elicitation.test.mjs`; NEGATIVE CONTROL: stub the fetch to return `shared:[]`, and the correlated-fixture arm fails by name.

### UI-78 · queued — **THE PUBLIC HEADER CANNOT SHOW A GROUP'S DISPLAY NAME OR VERIFIED DOMAIN, AND MEMBERS CANNOT SEE A DOMAIN CLAIM'S VERDICT.** … (whole text: the cut archive)
order: directly after REC-164, which it consumes (BOB #24: *"UI (M7), after 2"*) (SCHEDULER #9, 2026-09-21)
milestone: M7
interface: I3 consumer (REC-164's IC).
design: `docs/architecture/BIO_Publication_v0_1.md` §7 (a display name shown WITH the slug, never instead of it; a … (whole text: the cut archive)
depends-on: REC-164, UI-77.
accepts-when: against the real plane, a group with a display name shows it beside the slug; an unverified or mismatched domain never appears on the public header, and members see its verdict. How a liar … (whole text: the cut archive)
added: 2026-09-21 · SCHEDULER #9 (BOB #24's inbox entry, item 3, drained this commit; `node tools/mintid.mjs UI`).
cut: cut to its fields by SCHEDULER #11 (2026-09-22, the backlog's 150 KiB budget); the row as it stood before this cut is VERBATIM under «UI-78» in `docs/archive/ledgers/QUEUE-cut-2026-09-22.md`. A worker READS IT before building.

### MK-7 · queued — **THE ATTRIBUTION ACT, AND THEN THE LIFT OF MK-1's FENCE** (MK-3's replacement (ii), `MEMBER-KNOWLEDGE-DESIGN.md` §4.2–§4.6): an … (whole text: the cut archive)
order: after MK-6, which it rests on, and above MK-5, which rests on it; replaces MK-3 (superseded 2026-09-21). Two points are provisionals carried to Bob, cheap to change until built: §4.4's narrow veto and §4.6's `name` = handle (SCHEDULER #4, 2026-09-21)
milestone: M3 — the member's own knowledge enters the record as what it is
interface: I3 — the builder names the op and, if a design names it first, registers it in `op-claims.mjs`' `PLANNED_OPS`.
design: `docs/development/MEMBER-KNOWLEDGE-DESIGN.md` §4.2–§4.6 and §8's row for replacement (ii).
depends-on: MK-6; REC-126 (the review copy, built).
accepts-when: through the ops, each level round-trips into the published projection exactly as chosen; nothing is prefilled; an unchosen reached observation refuses ratification BY NAME; `name` without a … (whole text: the cut archive)
added: 2026-09-21 · SCHEDULER #4 (BOB #19's inbox entry, drained this commit; `node tools/mintid.mjs MK`).
cut: cut to its fields by SCHEDULER #11 (2026-09-22, the backlog's 150 KiB budget); the row as it stood before this cut is VERBATIM under «MK-7» in `docs/archive/ledgers/QUEUE-cut-2026-09-22.md`. A worker READS IT before building.

### MK-5 · queued — **AN OPINION IS NOT EVIDENCE — a case element with attribution, refused as a basis leg.** — owner RECORD; surfaces are Program B's … (whole text: the cut archive)
order: rests on MK-7's attribution act — re-pointed from MK-3, superseded 2026-09-21 (`MEMBER-KNOWLEDGE-DESIGN.md` §8) (SCHEDULER, first order audit, 2026-09-18; SCHEDULER #4, 2026-09-21)
milestone: M3 — the member's own knowledge enters the record as what it is
interface: I3
design: `docs/development/MEMBER-KNOWLEDGE-DESIGN.md` §6 (an opinion is not evidence)
depends-on: MK-7 (it carries MK-7's attribution; §8 names MK-3's replacement (ii))
accepts-when: an opinion lands as a case element with its attribution and is refused as a leg, by name, through the ops; battery green by its COMPLETION LINE.
added: 2026-09-18 · CONDUCT #4 (from BOB #14's inbox; MEMBER-KNOWLEDGE-DESIGN.md §8, build-order items 3 and 6.)
cut: cut to its fields by SCHEDULER #11 (2026-09-22, the backlog's 150 KiB budget); the row as it stood before this cut is VERBATIM under «MK-5» in `docs/archive/ledgers/QUEUE-cut-2026-09-22.md`. A worker READS IT before building.

### REC-147 · blocked — **CONTRADICTION'S IDENTIFY, 3 of 3: THE JUDGEMENT AND THE CANDIDATE TABLE — §5's five labels as labelled machine work through** … (whole text: the cut archive)
order: blocked on M0-71's measured gate (SCHEDULER, 2026-09-19)
milestone: M9
interface: I3 and I5 (a table; ICs minted with `node tools/mintid.mjs IC`)
design: `docs/development/CONTRADICTION-IDENTIFY-DESIGN.md` §5 (the judgement and its vocabulary), §8 (where a candidate lives) and §9 item 3.
depends-on: M0-71, AND its measured gate met — a threshold missed is the finding, and this row then goes back to BOB.
accepts-when: M0-71's gate passes on the built judgement; a re-run over unchanged referents writes nothing new; every row names both referents and versions, the key, the run, the label and … (whole text: the cut archive)
added: 2026-09-19 · SCHEDULER (same entry, item 3).
cut: cut to its fields by SCHEDULER #10 (2026-09-21, the backlog's 150 KiB budget); the row as it stood before this cut is VERBATIM under «REC-147» in `docs/archive/ledgers/QUEUE-cut-2026-09-21.md`. A worker READS IT before building.
note: 2026-09-23 by SCHEDULER #17 (M0-71's worker, via CONDUCT #18): the contradiction gate cannot see a detector that ABSTAINS (recall 2/9 sits beside it); this row stays blocked until its machine judgement is measured on this gate WITH its recall reported. The measurement is M-118 (M-117 was burned by a collision).

### UI-69 · queued — **EXPORT OF A REVIEW COPY carrying the quartet in-band on every page, with §6A.3 point 2 said AT the act: what leaves cannot be revoked; the grant can.** — owner UI.
order: after UI-68 and REC-148: export only once the quartet travels with it (SCHEDULER, 2026-09-19)
milestone: M10
interface: I3 consumer (REC-148's IC)
design: `docs/architecture/BIO_Publication_v0_1.md` §6A.3 point 2.
depends-on: UI-68 and REC-148.
accepts-when: an exported copy carries the quartet on every page byte-equal to the plane's; the statement renders at the act and nowhere else. NEGATIVE CONTROL: drop the quartet from one … (whole text: the cut archive)
added: 2026-09-19 · SCHEDULER (same entry, item 8).
cut: cut to its fields by SCHEDULER #10 (2026-09-21, the backlog's 150 KiB budget); the row as it stood before this cut is VERBATIM under «UI-69» in `docs/archive/ledgers/QUEUE-cut-2026-09-21.md`. A worker READS IT before building.

### D-147 · queued — **A RECORDS REQUEST IS ONE ROUND TRIP: `awaiting_response` HIDES THE FEE ESTIMATE, THE WAIVER DECISION, A PARTIAL PRODUCTION AND** … (whole text: the cut archive)
order: directly after D-149, on D-148's entry grammar, which it extends (BOB #27: *"depends-on D-148"*), the M10 action path (SCHEDULER #14, 2026-09-22; BOB #27's inbox entry, item 2)
milestone: M10
interface: I3 and I5 — correspondence entry kinds, a closed outcome vocabulary and a stated due date; the … (whole text: the cut archive)
design: `docs/architecture/BIO_Case_Making_v0_1.md` §2, *THE RECORDS-REQUEST LIFECYCLE* (BOB #27, 2026-09-22), bound by D-149.
depends-on: D-148 (the entry grammar it extends); D-149 (a stated due date names one of the action's citations).
accepts-when: a request, a fee estimate, a waiver decision, a partial production and an appeal read back as one dated chain; an entry with no stated due date reads UNDETERMINED; a stated … (whole text: the cut archive)
added: 2026-09-22 · SCHEDULER #14 (BOB #27's inbox entry, item 2, drained this commit; D-147's DEBT row of 2026-08-01; keeps its `D-` id).
cut: cut to its fields by SCHEDULER #14 (2026-09-22, the backlog's 150 KiB budget); the row as it stood before this cut is VERBATIM under «D-147» in `docs/archive/ledgers/QUEUE-cut-2026-09-22.md`. A worker READS IT before building.

### REC-196 · queued — **A READ NAMING A DISCOVERABLE PROJECT'S OWN ID ANSWERS "DOES NOT EXIST" TO A MEMBER THE DIRECTORY HAS JUST SHOWN IT TO.** BOB #32's ruling of 2026-09-23 23:08Z (cite until folded): *POSITIONAL WINS for the PROJECT ITSELF: an uninvited member session naming a discoverable project's own id gets the positional refusal (not a participant; id and name only); anything INSIDE the project answers exactly as today; `viewerPredicate` unchanged.* — owner RECORD.
order: before REC-150, the §7.14 sequence (SCHEDULER #17, 2026-09-23; REC-149's worker)
milestone: M8
interface: I3 — the project-id read's refusal; the integrator mints and classifies the IC.
design: `docs/architecture/BIO_Membership_Architecture_v2.md` §7 (item 7.14), with BOB #32's ruling of 2026-09-23 23:08Z (cite until folded).
depends-on: REC-149.
scope: the project-itself read gives a discoverable project's positional refusal; contents keep the existence answer. Extend `bio-plane/test/project-sight.test.mjs`.
accepts-when: a discoverable project's id reads the positional refusal naming id and name; a bundle inside it still reads as absent. NEGATIVE CONTROL: answer "does not exist" for the project itself, and that arm fails by name.
added: 2026-09-23 · SCHEDULER #17 (`node tools/mintid.mjs REC`).

### REC-197 · queued — **CREATE AND FORK DO NOT CARRY THE DISCOVERABLE SETTING, AND A MACHINE CREDENTIAL'S OWNERLESS PROJECT HAS NO RULE.** BOB #32's ruling of 2026-09-23 23:08Z (cite until folded): *create and fork take one optional `visibility` (`discoverable` or `hidden`), absent means HIDDEN; a MACHINE credential never sets it (an ownerless project has no owner to choose): its creation is HIDDEN and `visibility=discoverable` from one is refused by name.* — owner RECORD.
order: directly after REC-196 (SCHEDULER #17, 2026-09-23)
milestone: M8
interface: I3 additive — the `visibility` field and one refusal; the integrator mints and classifies the IC.
design: `docs/architecture/BIO_Membership_Architecture_v2.md` §7 (item 7.14), with BOB #32's ruling of 2026-09-23 23:08Z (cite until folded).
depends-on: REC-149.
scope: the field on both acts, the fail-closed default, the machine refusal. Extend `bio-plane/test/project-sight.test.mjs`.
accepts-when: an absent field creates HIDDEN; a machine's `discoverable` is refused by name. NEGATIVE CONTROL: default to discoverable, and the fail-closed arm fails by name.
added: 2026-09-23 · SCHEDULER #17 (`node tools/mintid.mjs REC`).

### REC-150 · queued — **DISCOVERABLE OR HIDDEN, 2 of 4: THE REQUEST TO JOIN — ask (one open per member per project, optional comment), withdraw** … (whole text: the cut archive)
order: after REC-149, whose EXISTENCE level it needs (SCHEDULER, 2026-09-19)
milestone: M8
interface: I3 (an IC minted with `node tools/mintid.mjs IC`)
design: `docs/architecture/BIO_Membership_Architecture_v2.md` §7 item 7.14 and §7.4 (a grant is an invitation … (whole text: the cut archive)
depends-on: REC-149.
accepts-when: a grant leaves the requester `invited` and NOT `joined`; a lapsed requester reads their own request and nothing else about the project; an administrator's grant is refused. … (whole text: the cut archive)
added: 2026-09-19 · SCHEDULER (same entry, item 2).
cut: cut to its fields by SCHEDULER #10 (2026-09-21, the backlog's 150 KiB budget); the row as it stood before this cut is VERBATIM under «REC-150» in `docs/archive/ledgers/QUEUE-cut-2026-09-21.md`. A worker READS IT before building.

### UI-70 · queued — **DISCOVERABLE OR HIDDEN, 3 of 4: the create and fork forms ASK, with neither preselected, and cannot submit without the choice** … (whole text: the cut archive)
order: after REC-149, and after UI-66 on the same forms (SCHEDULER, 2026-09-19)
milestone: M8
interface: I3 consumer (REC-149's IC)
design: `docs/architecture/BIO_Membership_Architecture_v2.md` §7 item 7.14, with DEC-69 (forced, at the act).
depends-on: REC-149; and the create and fork forms as UI-66 leaves them (same forms — one worker at a time).
accepts-when: the harness cannot submit a create or fork without the choice, and nothing is preselected; the owner changes the setting and a non-owner sees it read-only. How a liar passes … (whole text: the cut archive)
added: 2026-09-19 · SCHEDULER (same entry, item 3).
cut: cut to its fields by SCHEDULER #10 (2026-09-21, the backlog's 150 KiB budget); the row as it stood before this cut is VERBATIM under «UI-70» in `docs/archive/ledgers/QUEUE-cut-2026-09-21.md`. A worker READS IT before building.

### UI-71 · queued — **DISCOVERABLE OR HIDDEN, 4 of 4: the directory; the request button and comment; the owner's queue of open requests with grant** … (whole text: the cut archive)
order: after REC-149 and REC-150 (SCHEDULER, 2026-09-19)
milestone: M8
interface: I3 consumer (REC-149's and REC-150's ICs)
design: `docs/architecture/BIO_Membership_Architecture_v2.md` §7 item 7.14.
depends-on: REC-149 and REC-150.
accepts-when: the harness requests, the owner grants, the requester sees `invited` and joins by the checkbox, all against the real plane; a hidden project never appears in the directory. … (whole text: the cut archive)
added: 2026-09-19 · SCHEDULER (same entry, item 4).
cut: cut to its fields by SCHEDULER #10 (2026-09-21, the backlog's 150 KiB budget); the row as it stood before this cut is VERBATIM under «UI-71» in `docs/archive/ledgers/QUEUE-cut-2026-09-21.md`. A worker READS IT before building.

### D-134 · queued — **NO SURFACE PERFORMS §4.9's CUSTODIAL ACTS: `memberadd`, `memberset`, `signeradd` and `signerset` have ZERO call sites in** … (whole text: the cut archive)
order: with the M8 features after D-126, a surface over built ops; BOB #17 ordered it behind D-136's fence (*"a member surface over an act whose voter the caller can name is a SECOND path to a forgeable vote"*), which is built, and BOB #18 discharged BOB's half; it rests on REC-159's session reach (SCHEDULER #13, 2026-09-22, LED-7 batch S13-1)
milestone: M8
interface: I3 consumer (the four ops, reachable from an enrolled administrator's session once REC-159 lands).
design: `docs/architecture/BIO_Membership_Architecture_v2.md` §4.9 (each custodial act is EVERY … (whole text: the cut archive)
depends-on: REC-159 (the four ops reach an enrolled administrator's session).
accepts-when: against the real plane, the founder's and an enrolled administrator's sessions each perform all four, attributed to them; a member's session renders none of the four. How a … (whole text: the cut archive)
added: 2026-09-22 · SCHEDULER #13 (LED-7 batch S13-1; D-134's DEBT row of 2026-08-01, BOB #17's order and BOB #18's discharge; keeps its `D-` id).
cut: cut to its fields by SCHEDULER #13 (2026-09-22, the backlog's 150 KiB budget); the row as it stood before this cut is VERBATIM under «D-134» in `docs/archive/ledgers/QUEUE-cut-2026-09-22.md`. A worker READS IT before building.

### UI-76 · queued — **NO SURFACE LETS A MEMBER DECLARE, TEST OR PLACE A THEME, OR SHOWS WHOSE LENS A THEME IS.** D-162's surface half, item 2 of BOB #23's entry. — owner UI.
order: directly after D-162, which it consumes (BOB #23: *"UI (M8), after 1"*) (SCHEDULER #9, 2026-09-21)
milestone: M8
interface: I3 consumer (D-162's IC).
design: `docs/architecture/BIO_Content_Framework_v0_10.md` §8.4, fences 1–3 (the cover on every reading; the … (whole text: the cut archive)
depends-on: D-162.
accepts-when: the harness declares, tests and places against the real plane, the cover shown on every theme it renders; a proposal renders as a hunch, never as membership. How a liar passes … (whole text: the cut archive)
added: 2026-09-21 · SCHEDULER #9 (BOB #23's inbox entry, item 2, drained this commit; `node tools/mintid.mjs UI`).
cut: cut to its fields by SCHEDULER #9 (2026-09-21, the backlog's 150 KiB budget); the row as it stood before this cut is VERBATIM under «UI-76» in `docs/archive/ledgers/QUEUE-cut-2026-09-21.md`. A worker READS IT before building.

### D-235 · queued — **`op=basisversions` DOES NOT PUBLISH A VERSION'S `kind`: `basisVersions` selects every column of `inquiry_basis_versions`, `kind` among them, and the answer carries no `kind` key, so the same version reads a kind from `op=suggest` and none from here.** — owner RECORD.
order: after D-241 (SCHEDULER #17, 2026-09-23, LED-7 S17-2)
milestone: M3
interface: I3 additive — one field; the integrator mints and classifies the IC.
design: `docs/development/INVESTIGATIVE-SESSION.md` §9 (what a SUGGESTION is).
depends-on: none.
scope: `kind` in each version of the answer. Extend `bio-plane/test/suggest.test.mjs`'s cross-op arm. The row's other half (the sweep's reach) is stated in `rec75-sweep.mjs`'s header and is not rowed.
accepts-when: a version with a kind reads the same kind from both ops. NEGATIVE CONTROL: drop the key, and the cross-op arm fails on `kind`.
added: 2026-09-23 · SCHEDULER #17 (LED-7 S17-2; keeps its `D-` id).

### D-191 · queued — **A CAPTURE ASSEMBLED FROM REUSED PARTS DOES NOT STATE ITS TEMPORAL SPREAD: `subresources.mjs` records each part's `reused_from_fetched_at`, and nothing computes the earliest and latest fetch instants of the composite.** — owner CAPTURE.
order: after D-235, with the product rows before the M0 group: the record holds the instants and does not say what they add up to (SCHEDULER #17, 2026-09-23, LED-7 S17-2; verified at the code on `02603e88`)
milestone: M2
interface: I5 additive — the manifest's spread; the integrator mints and classifies the IC.
design: `docs/development/CAPTURE-SCALING.md` §"Checking that a reused asset is still the same" and §"Re-fetch at ratification is mandatory".
depends-on: CAP-14 (`reused_from`, `integrated` on c17-batch5).
scope: the capture manifest (or its reading) states the earliest and latest part-fetch instants of a composite. Extend `bio-plane/test/subresources.test.mjs`.
accepts-when: a composite whose parts were fetched at two instants states both. NEGATIVE CONTROL: drop the spread, and the two-instant arm fails by name.
added: 2026-09-23 · SCHEDULER #17 (LED-7 S17-2; keeps its `D-` id).

### D-320 · queued — **THE PASS-THROUGH JPEG ROUTE CANNOT BE TRANSCRIBED IN-ISOLATE: `ocr-worker`'s `transcribe.mjs` refuses every non-PNG route (PIXELS_UNREADABLE), so 17 of CPDF-12's 24 image-only pages (DCT) go untranscribed; 8-bit rotation is not built either (`pagepixels.mjs`).** — owner CONTENT-PDF.
order: with the M2 extraction rows, after D-191: the route with the strongest provenance reads nothing (SCHEDULER #17, 2026-09-23, LED-7 S17-3; verified at the code on `02603e88`)
milestone: M2
interface: I6 — the member's pixel route; the integrator mints and classifies the IC.
design: `docs/development/EXTRACTION-BREADTH-DESIGN.md` §6 (which gains the gap's statement).
depends-on: none — CPDF-12's census answered the share.
scope: a baseline DCT decoder in the member, checked against Pillow digests as `pagepixels.test.mjs` does; after decoding apply `/Rotate` (3 of the 24 are /Rotate 270; from D-244); 8-bit rotation. Extend `pdf-worker/test/pagepixels.test.mjs` and `ocr-member-e2e.test.mjs`.
accepts-when: a DCT image-only page transcribes, rotated, and its pixel hash matches Pillow's. NEGATIVE CONTROL: a no-op decoder fails on the digest by name.
added: 2026-09-23 · SCHEDULER #17 (LED-7 S17-3; keeps its `D-` id).

### D-312 · queued — **`memoryUsageBytes` IS NOT A FRACTION OF THE 128 MB ISOLATE, AND LIVE SITES STILL SAY "of 128 MB": `agent-worker/src/index.mjs` (the shipped `BOUND_SOURCE`, and the segment bound sized on that reading), `fl1-cpu-probe.mjs`, `INTERFACES.md` §"The segment bound…", `pagepixels.mjs`.** The rule is stated in `INTERFACES.md` §"The memory bound, and how it is expressed". — owner FLEET, CONTENT-PDF.
order: after D-320, the M2 measurement corrections: a shipped bound rests on the misreading (SCHEDULER #17, 2026-09-23, LED-7 S17-3; verified at the code on `02603e88`)
milestone: M0 (measurement wording, and one shipped bound)
interface: none — wording, and a re-check of one bound.
design: `docs/development/VERIFICATION.md` (measure; do not recall), for the rule stated in `docs/development/INTERFACES.md` §"The memory bound, and how it is expressed".
depends-on: none.
scope: correct each live site; re-check the agent-worker segment bound against the rule and state the result.
accepts-when: no live site divides by 128 or says "of 128"; the bound's re-check is recorded. NEGATIVE CONTROL: a grep arm over the live sites fails by name on a planted "of 128 MB".
added: 2026-09-23 · SCHEDULER #17 (LED-7 S17-3; keeps its `D-` id).

### D-460 · queued — **DIAGNOSIS: SOME TIER-3 AGENDAS AND MINUTES READ AS GENERIC, AND NOBODY KNOWS WHY.** FW-20 observed it on its walk (M-121, on c18-batch8) without diagnosing it; one suspected cause is that the OCR member transcribes one page per invocation and the plane reads only the first. Its finder's session is archived and no CONTENT-PDF lane is live, so the diagnosis is rowed. — owner CONTENT-PDF.
order: after D-312, with the M2 extraction measurements: a possible silent under-read of scanned civic records, the class CLAUDE.md §2 ranks worst if confirmed (SCHEDULER #17, 2026-09-23; CONDUCT #18 23:51Z)
milestone: M0 (a diagnosis — a measurement)
interface: none until the fix is named.
design: `docs/development/VERIFICATION.md` (measure; do not recall), for FW-20's M-121 walk.
depends-on: FW-20 (`integrated` on c18-batch8; M-121 lists the walk).
scope: take the tier-3 walk documents M-121 names as agendas or minutes that read generic; establish whether the member transcribes one page per invocation and the plane keeps only the first; name the fix, or show the documents are generic.
accepts-when: the named fix (then placed as its own row) or the refutation, recorded with date and instrument. NEGATIVE CONTROL: a two-page scanned fixture whose second page alone carries the agenda heading reads generic before the fix, or the refutation shows it read whole.
added: 2026-09-23 · SCHEDULER #17 (`node tools/mintid.mjs D`).

### D-465 · queued — **D-447's FIX COSTS SEARCH TIME: over 2,000 visible documents `q=culvert` takes 210 ms against 74 ms on `main`, because `highlight()` re-tokenises.** Measured by D-447's worker; its size at a real instance is UNDETERMINED. — owner RECORD.
order: with the M0 measurements, behind the product rows: fix only if it matters at real size (SCHEDULER #17, 2026-09-23; D-456's and D-447's workers via CONDUCT #18 00:05Z)
milestone: M0 (a measurement, then a fix if owed)
interface: none unless the fix is built.
design: `docs/development/VERIFICATION.md` (measure; do not recall).
depends-on: D-447 (`integrated` on c18-d456).
scope: measure the query time at a real instance's size; if it matters, compute per-term tf from an `fts5vocab` instance table instead.
accepts-when: the figure is recorded with date, instrument and size, and either the fix brings it back or the record states why none is owed. NEGATIVE CONTROL: the measurement at 2,000 documents reproduces the 210 ms figure within tolerance.
added: 2026-09-23 · SCHEDULER #17 (`node tools/mintid.mjs D`).

### D-473 · queued — **`.odt` AND `.odp` EXPORTS STAY UNDETERMINED FOR BYTE STABILITY: D-351's `.odt` normalisation (strip `xml:id` on `text:list`) was never re-measured over the population, because the worker's pull of CAP-11's scratch captures was refused (PII) and it did not route around the refusal.** — owner CAPTURE.
order: with the M0 measurements, after D-465: widening to `.odt` is a measurement first (SCHEDULER #17, 2026-09-24; D-351's worker via CONDUCT #19)
milestone: M0 (a measurement)
interface: none until widened.
design: `docs/development/VERIFICATION.md` (measure; do not recall), for D-351's normalisation.
depends-on: D-351 (finished; rides the train after c19-batch9).
scope: re-measure the `.odt` and `.odp` normalisation over a population the lane may read (never by routing around a refusal); widen only on the figure.
accepts-when: the stability figure is recorded with date, instrument and population, and the formats are widened or stated undetermined on it. NEGATIVE CONTROL: skip the `xml:id` strip, and the re-fetch pair reads unstable by name.
added: 2026-09-24 · SCHEDULER #17 (`node tools/mintid.mjs D`).

### D-321 · queued — **NO REAL IMAGE-ONLY PAGE IN THE CORPUS CARRIES AGENDA-SHAPED TEXT, SO THE `reading_refs` JOIN OVER REAL OCR IS PROVED ONLY ON SYNTHETIC INK (`ocr-member-e2e.test.mjs`).** — owner CONTENT-PDF.
order: after D-320; the page must come from bytes already held (the cloud proxy refuses Legistar) (SCHEDULER #17, 2026-09-23, LED-7 S17-3; verified at the code on `02603e88`)
milestone: M2
interface: none — a fixture and an arm.
design: `docs/architecture/BIO_Content_Framework_v0_10.md` Part II §16.
depends-on: none — the page comes from bytes already held; D-313 (the image-only corpus) is a stated limitation.
scope: commit one real scanned-agenda page image to the OCR fixtures; drive the join over it.
accepts-when: a real page's OCR yields a `reading_refs` hit. NEGATIVE CONTROL: switch the recogniser off, and the join reads empty by name.
added: 2026-09-23 · SCHEDULER #17 (LED-7 S17-3; keeps its `D-` id).

### D-346 · queued — **THE THREE OPENDOCUMENT ENTRIES EMIT NO `core-properties` AND NO `intra` LINK: `odf.mjs` never reads `meta.xml` or the manifest and says so with `outside_content_xml_not_read` markers, while Content Framework §16 says the formats "preserve the same evidence".** — owner COFF.
order: after D-320 (SCHEDULER #17, 2026-09-23, LED-7 S17-3; verified at the code on `02603e88`)
milestone: M2
interface: I2 — the ODF part-map gains two item kinds; the integrator mints and classifies the IC.
design: `docs/development/OFFICE-FORMATS.md` §"What each part-map offers, and where it maps onto I2".
depends-on: none.
scope: read `meta.xml` into `core-properties`; walk the manifest for sha256 `intra` links; remove both markers. Extend `bio-plane/test/formats-odf.test.mjs`.
accepts-when: a planted creator appears as a `core-properties` item; a package without `meta.xml` still states the absence. NEGATIVE CONTROL: skip the `meta.xml` read, and the planted-creator arm fails by name.
added: 2026-09-23 · SCHEDULER #17 (LED-7 S17-3; keeps its `D-` id).

### REC-204 · queued — **AN OFFICE DOCUMENT'S ENVELOPE IS EXTRACTED AND NEVER CONTENT: tracked-change authors, comments, core properties and speaker notes are emitted by the format parsers and never projected, indexed or searchable (`textUnitsFor`: *"SPEAKER NOTES ARE NOT INDEXED"*).** Under DEC-5, surface it all. — owner RECORD.
order: with the M2 extraction rows, after D-346 (SCHEDULER #17, 2026-09-23; D-124's first row, placed under a new id because D-124 names two rows)
milestone: M2
interface: I2/I5 — a NINTH extent kind, `envelope`, with an item-kind field; the integrator mints the IC for the extent census.
design: `docs/development/OFFICE-FORMATS.md` "THE ENVELOPE AS CONTENT" (on `land/bob/rulings-0923b` @ fd93bf1d, riding the next train): the extent carries the capture's grade, `cited_as` distinguishes it, and it is indexed LABELLED as envelope.
depends-on: none.
scope: the `envelope` extent and its projection; index each item labelled as its kind. Extend `bio-plane/test/search.test.mjs`.
accepts-when: a passage search finds a tracked-change author and speaker-note text, each labelled as envelope. NEGATIVE CONTROL: drop the envelope arm, and the tracked-change-author search returns 0 by name.
added: 2026-09-23 · SCHEDULER #17 (`node tools/mintid.mjs REC`).

### D-375 · queued — **`OBSERVATION-LOG-DESIGN.md` §4.2's FOURTH OUTCOME HAS NO PRODUCER: the persisted reading carries no character count, so `contentObservationsFor` cannot write LOOKED_ABSENT for a scan read to nothing, and it reads PRESENT.** `counts.chars` exists at acquire and is dropped. — owner CAPTURE, then RECORD.
order: after D-346: a read that claims more than it holds, CLAUDE.md §2's worst class (SCHEDULER #17, 2026-09-23, LED-7 S17-3; verified at the code on `02603e88`)
milestone: M3
interface: I5 additive — the reading's count; the integrator mints and classifies the IC.
design: `docs/development/OBSERVATION-LOG-DESIGN.md` §4.2.
depends-on: none.
scope: persist `counts.chars` on the reading at `op=acquire`; add the LOOKED_ABSENT branch in `contentObservationsFor`. Extend `bio-plane/test/observation-content.test.mjs` beside B8.
accepts-when: a scan read to zero characters writes LOOKED_ABSENT. NEGATIVE CONTROL: drop the count, and that arm reads PRESENT and fails by name.
added: 2026-09-23 · SCHEDULER #17 (LED-7 S17-3; keeps its `D-` id).

### D-374 · queued — **A `pdf-page` EXTENT'S `rect` IS BOUNDED BY NOTHING: `checkContentExtent` asks only for four finite numbers, while `pagepixels.mjs` already computes each page's MediaBox and the plane never receives it.** — owner CONTENT-PDF, CAPTURE, RECORD.
order: after D-375: content minted on a region the page does not have (SCHEDULER #17, 2026-09-23, LED-7 S17-3; verified at the code on `02603e88`)
milestone: M4
interface: I5/I6 — per-page `{w,h}` on the reading (nullable); the integrator mints and classifies the IC.
design: `docs/development/CONTENT-EXTENT-DESIGN-SPACE.md` §6 (which gains the bound).
depends-on: none.
scope: carry per-page dimensions onto the reading; the extent check refuses a rect outside the MediaBox by name (the stricter mechanism; clip-and-state is the architect's alternative if preferred). Extend the extent suite.
accepts-when: `[0,0,999999,999999]` is refused by name; a rect inside mints. NEGATIVE CONTROL: drop the bound, and the oversize arm mints and fails by name.
added: 2026-09-23 · SCHEDULER #17 (LED-7 S17-3; keeps its `D-` id).

### D-415 · queued — **A WORKBOOK'S `sheet-range` UNITS ARE WHOLE SHEETS ONLY: `formats-xlsx.mjs` turns `definedNames` into anchor links and emits one `usedSheetRange` per sheet; table parts and ODF named ranges are not read.** — owner COFF.
order: after D-374 (SCHEDULER #17, 2026-09-23, LED-7 S17-3; verified at the code on `02603e88`)
milestone: M4
interface: I2 — finer sheet-range units; the integrator mints and classifies the IC.
design: `docs/development/EXTRACTION-BREADTH-DESIGN.md` §3.3 item 1.
depends-on: none.
scope: a defined name and a table part each emit a `sheet-range` unit; a multi-area name is skipped with a stated reason. Extend `bio-plane/test/fw19-extent-arms.test.mjs`.
accepts-when: a fixture's defined name emits its unit. NEGATIVE CONTROL: before the fix the defined-name arm emits none and fails by name.
added: 2026-09-23 · SCHEDULER #17 (LED-7 S17-3; keeps its `D-` id).

### D-416 · queued — **A READING POSITION CANNOT FALL INSIDE A `sheet-range` EXTENT: `readingPositionInExtent` (`textchain.mjs`) returns false whenever the reading's arm and the extent's differ, so a cell reading never earns the connection its range should.** The image-rect and `doc-table` halves wait on readings that carry rects and paragraph spans (D-352). — owner FRAMEWORK.
order: after D-415, which emits the units it reads (SCHEDULER #17, 2026-09-23, LED-7 S17-3; verified at the code on `02603e88`)
milestone: M4
interface: none — the containment predicate.
design: `docs/development/EXTRACTION-BREADTH-DESIGN.md` §3.2.
depends-on: D-415.
scope: the `sheet-range` half: a cell reading inside a range is contained. Extend the textchain suite.
accepts-when: a cell reading inside a sheet-range earns a connection. NEGATIVE CONTROL: restore the arm-mismatch false, and that arm fails by name.
added: 2026-09-23 · SCHEDULER #17 (LED-7 S17-3; keeps its `D-` id).

### D-419 · queued — **THE CROP OF A CITED PDF IMAGE EXISTS AND NOTHING CAN ASK FOR IT: `cropImage` lives only in `pdf-worker/src/imagecrop.mjs`, with no route and no plane op.** — owner CONTENT-PDF, then RECORD; a UI item renders it.
order: after D-416; display only, behind every over-claim (SCHEDULER #17, 2026-09-23, LED-7 S17-3; verified at the code on `02603e88`)
milestone: M4
interface: I6 — a `POST /crop` route; I3 — a read-only op; the integrator mints and classifies the ICs.
design: `docs/development/EXTRACTION-BREADTH-DESIGN.md` §3.4.
depends-on: none.
scope: the member route and a read-only plane op returning the crop for a cited image extent. Extend `pdf-worker/test/` and a plane suite.
accepts-when: a cited image extent returns its crop through the op. NEGATIVE CONTROL: route to the whole page, and the crop-dimensions arm fails by name.
added: 2026-09-23 · SCHEDULER #17 (LED-7 S17-3; keeps its `D-` id).

### D-246 · queued — **A RENDERING'S FILE HASH IS RUNTIME-DEPENDENT, AND DEC-41 ASKS FOR A HASH ANY COPY CAN CHECK.** BOB #32's ruling of 2026-09-23 23:30Z (cite until folded): *BOTH, LABELLED: `published_shas` carries the PIXEL hash (`pixels_sha256`, identical across node, workerd and Pillow) as the verifying value; the file hash is recorded beside it as "this file's bytes", for information only.* — owner CONTENT-PDF, then RECORD.
order: with the M2 extraction rows, after D-419 (SCHEDULER #17, 2026-09-23, LED-7 S17-4)
milestone: M2
interface: I3/I5 — `published_shas` for renderings; the integrator mints and classifies the IC.
design: `docs/development/EXTRACTION-BREADTH-DESIGN.md` §3.4 (the crop), with DEC-41 and BOB #32's ruling of 2026-09-23 23:30Z (cite until folded).
depends-on: D-419 (renderings reach the plane).
scope: when renderings join `published_shas`, the verifying value is `pixels_sha256`, the file hash beside it labelled; `imagecrop.mjs` already emits both.
accepts-when: a rendering published from workerd verifies against a Pillow-computed pixel hash. NEGATIVE CONTROL: verify by the file hash, and the cross-runtime arm fails by name.
added: 2026-09-23 · SCHEDULER #17 (LED-7 S17-4; keeps its `D-` id).

### REC-206 · queued — **AN AGENDA ITEM'S MEMBERSHIP IN A FILE EXISTS ONLY AS RECT CO-LOCATION AN INSTRUMENT INFERS: tier-1 text units carry no position and a LinkRecord carries no anchor text.** BOB #32's ruling of 2026-09-23 23:30Z (cite until folded): *DESIGN IT — I2 gains position on tier-1 text units (page and rect) and anchor text plus a rect on LinkRecord; membership is DERIVED from containment, labelled machine work and graded inferred, never presented as the publisher's link.* — owner CONTENT-PDF, then RECORD.
order: with the M2 extraction rows, after D-246; I2 PROVISIONAL, RECORD after PDF, as ruled (SCHEDULER #17, 2026-09-23, LED-7 S17-4; CPDF-3's worker)
milestone: M2
interface: I2 PROVISIONAL — positions and anchors; I3 — the derived membership; the integrator mints and classifies the ICs.
design: `docs/architecture/BIO_Content_Framework_v0_10.md` §16 (BOB folds it), with BOB #32's ruling of 2026-09-23 23:30Z (cite until folded).
depends-on: CPDF-3 (`integrated`).
scope: the PDF member emits page and rect per tier-1 unit and anchor text plus rect per link; the plane derives item-to-file membership by containment, labelled and graded inferred.
accepts-when: an agenda's item-to-file membership reads derived, labelled machine work, graded inferred. NEGATIVE CONTROL: present it as a publisher link, and the labelling arm fails by name.
added: 2026-09-23 · SCHEDULER #17 (`node tools/mintid.mjs REC`).

### D-340 · queued — **CHROME IS A PROPERTY OF THE SITE AND THE PLANE RECORDS IT NOWHERE: `site_chrome` exists only in `LINK-FIDELITY.md`, which RATIFIES it as a derived table regenerable by scan; no table and no per-host navigation-change read are built.** — owner CAPTURE, then RECORD.
order: after D-419, with the M4 extraction rows (SCHEDULER #17, 2026-09-23, LED-7 S17-3; verified at the code on `02603e88`)
milestone: M4
interface: I5 — a derived table (in `purge`); I3 — a per-host read; the integrator mints and classifies the ICs.
design: `docs/development/LINK-FIDELITY.md` §"Chrome: rendering and connection are different problems".
depends-on: none.
scope: derive `site_chrome` per host by scan, add it to `purge`, and a read naming links a host's navigation lost between captures.
accepts-when: two captures of one host whose nav lost a link make the read name that link. NEGATIVE CONTROL: derive per page instead of per host, and the arm fails by name.
added: 2026-09-23 · SCHEDULER #17 (LED-7 S17-3; keeps its `D-` id).

### D-177 · queued — **THE CAPTURE GRADE BELOW THE CEILING IS STILL AUTHORED: `store.mjs` says *"there is no per-document capture grade anywhere in this schema"*; `#legEarnedCapture` applies REC-88/105's CEILING, not a measured value, so a member-authored grade under it stands unmeasured.** — owner CAPTURE, then RECORD.
order: after D-191 (SCHEDULER #17, 2026-09-23, LED-7 S17-2; verified at the code on `02603e88`)
milestone: M9
interface: I3/I5 — a derived per-capture grade read by the strength walk; the integrator mints and classifies the ICs.
design: `docs/architecture/BIO_Content_Framework_v0_10.md` Part I (the chain rules), with DEC-4 and DEC-75 (*capture grade is about the fetch path*).
depends-on: none — the ceiling (REC-88, REC-105) is built.
scope: derive a per-capture grade from `captured_locators.via` plus authority state, read it in `#strengthWalk`. The letter for a non-direct `via` is UNDETERMINED by any ruling found; if none covers it, that part goes to BOB (REC-50's precedent) and the row builds the direct case first.
accepts-when: a member-authored C on a direct capture reads the earned grade, not the authored one. NEGATIVE CONTROL: read the authored grade again, and that arm fails by name. Extend the strength suite.
added: 2026-09-23 · SCHEDULER #17 (LED-7 S17-2; keeps its `D-` id).

### D-194 · queued — **A MEMBER'S LEAD HAS A PLANE AND NO SURFACE: `op=lead`, `leadlook`, `leadread` and `leadshare`, the `leads` table and the internet frontier's read of them are built (`status.mjs` 10.lead), and `app.html` makes no lead call.** — owner UI.
order: after D-177, a member surface on a built plane (SCHEDULER #17, 2026-09-23, LED-7 S17-2; verified at the code on `02603e88`)
milestone: M4
interface: I3 consumer.
design: `docs/development/MEMBER-KNOWLEDGE-DESIGN.md` §5 (the lead's surface).
depends-on: none — the plane half is built.
scope: a member writes a lead, records a look, and sees the frontier's LOOKED_ABSENT against it; the lead is shared only by the member's act. New harness in `civicos-ui/test/`.
accepts-when: a member writes a lead, records a look, and sees LOOKED_ABSENT against it. NEGATIVE CONTROL: stub `op=lead`, and the write-and-look arm fails by name.
added: 2026-09-23 · SCHEDULER #17 (LED-7 S17-2; the plane half closed; keeps its `D-` id).

### D-189 · queued — **NO SURFACE CAN SAY A PROJECT CARRIES ITS OWN BIAS: `op=biasmanifest` computes the effective set with project nullifications, `7.ui` is ABSENT, and `app.html` still says *"DECLARED BIAS is the HUNCH legs and nothing else"*.** — owner UI.
order: after D-194 (SCHEDULER #17, 2026-09-23, LED-7 S17-2; verified at the code on `02603e88`)
milestone: M8
interface: I3 consumer.
design: `docs/architecture/BIO_Declared_Bias_v0_1.md` §"Bias bundles and adoption" (DEC-46).
depends-on: none — the manifest read is built.
scope: the project and publication surfaces read the manifest at project scope and state that the project carries its own bias; the hunch-only sentence is corrected. New harness in `civicos-ui/test/`.
accepts-when: a project with an adopted set shows it; an empty manifest shows no indicator. NEGATIVE CONTROL: render the indicator on an empty manifest, and that arm fails by name.
added: 2026-09-23 · SCHEDULER #17 (LED-7 S17-2; keeps its `D-` id).

### REC-201 · queued — **A RECORDS REQUEST CAN ONLY BE A CALIFORNIA ONE: the action kind is `cpra_request`, and sovereign groups sit outside California.** BOB #32's ruling of 2026-09-23 23:08Z (cite until folded): *DESIGN DIRECTION ADOPTED — a law-neutral `records_request` kind carrying a `law` field; `cpra_request` stays readable as written.* — owner RECORD.
order: behind the current M9/M10 product rows, as ruled (SCHEDULER #17, 2026-09-23; D-149's builder)
milestone: M10
interface: I3/I5 — a new action kind; the integrator mints the IC.
design: `docs/architecture/BIO_Case_Making_v0_1.md` §2 (*A RECORDS REQUEST NAMES EVERY LAW THAT GOVERNS IT*), with BOB #32's ruling of 2026-09-23 23:08Z (cite until folded).
depends-on: D-149 (`integrated` on c17-batch7).
scope: the `records_request` kind with its `law` field alongside D-149's governing-laws list; existing `cpra_request` actions read unchanged. Extend D-149's suite.
accepts-when: a `records_request` under a non-California law files and reads its law; an old `cpra_request` reads byte-identically. NEGATIVE CONTROL: rewrite `cpra_request` on read, and the unchanged arm fails by name.
added: 2026-09-23 · SCHEDULER #17 (`node tools/mintid.mjs REC`).

### REC-202 · queued — **A MEMBER CANNOT TAKE UP OR SET ASIDE AT THE INQUIRY'S GRAIN: the code declares an `options_grain` gap (offered at document grain, missing at inquiry grain) in `store.mjs`'s findings producers, and no row carried it.** BOB #32's ruling of 2026-09-23 23:08Z (cite until folded): *row it — a missing member door.* — owner RECORD if an op is missing, UI otherwise; check at the code at spawn.
order: behind the current M9/M10 product rows, before the M0 group (SCHEDULER #17, 2026-09-23; D-213's residue)
milestone: M9
interface: I3 — possibly an act; the integrator mints and classifies the IC.
design: `docs/development/INVESTIGATIVE-SESSION.md` §8 (the inquiry's QUESTION is a first-class object), with BOB #32's ruling of 2026-09-23 23:08Z (cite until folded).
depends-on: none — PL-15's out-of-inquiry lead is built.
scope: offer "take this up" and "set aside" at the inquiry grain wherever the code declares the gap; close the declared `options_grain` entries.
accepts-when: a member takes up and sets aside a finding at the inquiry grain, and no declared `options_grain` gap remains. NEGATIVE CONTROL: withhold the inquiry-grain option, and that arm fails by name.
added: 2026-09-23 · SCHEDULER #17 (`node tools/mintid.mjs REC`).

### M0-139 · queued — **TWO ARMS OF `current.control.mjs` CANNOT FAIL: arm 8 refuses to arm (its anchor occurs twice in `store.mjs` since REC-124 added `#findingsConcludedElsewhere` with `#findingsStanceDiverged`'s guard), and arm 7's must-fail name survives in `current.test.mjs` only as a comment, and no suite asserts `no_project_scope`.** Predates D-125 (read on 91bcea6b, main and c17-batch4). — owner M0.
order: first of the M0 rows, ahead of process tooling: a negative control that cannot fail is a product suite (the queue's findings) left unverified, not a gate-time tool (SCHEDULER #17, 2026-09-23, CONDUCT #17's 21:43Z finding (3), verified by string count)
milestone: M0
interface: none — a control and one assertion.
design: `docs/development/VERIFICATION.md` (the negative control and its `NEGATIVE CONTROL:` line; CLAUDE.md §5's *"Run the negative control"*).
depends-on: none.
scope: split arm 8 into 8a and 8b, each anchored on its producer's signature line plus the guard; add a `current.test.mjs` assertion driving a finding filed under no project to `available:false, reason:"no_project_scope"` and point arm 7's must-fail at it.
accepts-when: `node bio-plane/test/current.control.mjs` reports every arm run and 0 NOT as declared; 8a and 8b each fail "PURGE THE SHARED QUESTION AND BOTH ITEMS GO QUIET", arm 7 fails the new no-scope assertion by name. NEGATIVE CONTROL: the control's own arms, each recorded on the suite's `NEGATIVE CONTROL:` line.
added: 2026-09-23 · SCHEDULER #17 (CONDUCT #17's finding; `node tools/mintid.mjs M0`).

### D-446 · queued — **`nc-m040.mjs` ARM 1 DECLARES FIVE FAILURES AND MEASURES ONE (derivation-bounds 71/1 on `main`), AND FIVE SUITES NAME INFORMATION FIXTURES `INF-…` WHERE `OBJECT_TYPES` HAS `INFO`.** The fixtures: `frontier-chunk` (D-390's), `d389-fullfetch`, `observation-content`, `observation-log`, `cap14-reused-from`. — owner M0.
order: after M0-139, among the control-hygiene rows; after c17-batch7 lands (SCHEDULER #17, 2026-09-23; via CONDUCT #18 22:27Z (4), measured by SCHEDULER #17's verifier)
milestone: M0
interface: none
design: `docs/development/VERIFICATION.md` (a control declares what it measures; correct superseded tests, never exempt them).
depends-on: D-443 (`integrated`; its branch moved ARM 1's anchor).
scope: rewrite ARM 1's declaration to the measured outcome with a comment saying why the old one was wrong; rename every `INF-` fixture id to `INFO-`.
accepts-when: `node bio-plane/test/nc-m040.mjs` reports every arm as declared, and no suite names an `INF-` id. NEGATIVE CONTROL: restore the five-failure declaration, and ARM 1 reads NOT as declared by name.
added: 2026-09-23 · SCHEDULER #17 (`node tools/mintid.mjs D`).

### D-449 · queued — **`project-sight.control.mjs`'s `promote-stamp-dropped` ARM CANNOT RUN: it throws SURFACE_NO_RUN (0/1), identically on `main` `02603e88`, because since REC-171 removing the stamp also breaks the harness's surfacing-run creation.** — owner M0.
order: after D-446, among the control-hygiene rows (SCHEDULER #17, 2026-09-23; REC-149's and UI-68's workers via CONDUCT #18 22:47Z)
milestone: M0
interface: none
design: `docs/development/VERIFICATION.md` (break only the thing: a control that moves a second variable refutes nothing).
depends-on: none.
scope: narrow the arm's patch to revisions, keeping the stamp when the base is null.
accepts-when: the arm runs and fails as declared. NEGATIVE CONTROL: the arm itself, recorded on the suite's `NEGATIVE CONTROL:` line.
added: 2026-09-23 · SCHEDULER #17 (`node tools/mintid.mjs D`).

### D-369 · queued — **FIVE IN-MEMORY `truncated` SHAPES ARE NEVER DRIVEN PAST THEIR CEILING: only `op=connect` has a live over-the-ceiling arm in `derivation-bounds.test.mjs`; `queueFeed`, `biasInhale`, `documentsNamingEntity` and `#backfillLegContent` are pinned by roster alone (now 10 names).** — owner RECORD.
order: with the M0 control rows: a verification instrument (SCHEDULER #17, 2026-09-23, LED-7 S17-3; verified at the code on `02603e88`)
milestone: M0
interface: none
design: `docs/development/VERIFICATION.md` (test through the op), with `INVESTIGATIVE-SESSION.md` §14c.
depends-on: none.
scope: a live driven arm per shape. In `bio-plane/test/derivation-bounds.test.mjs`.
accepts-when: each shape is driven past its ceiling and states `truncated`. NEGATIVE CONTROL: drop a paging LIMIT in `queueFeed`, and its live arm fails by name.
added: 2026-09-23 · SCHEDULER #17 (LED-7 S17-3; keeps its `D-` id).

### D-441 · queued — **`tools/decided.mjs` CANNOT SEE A RULING WHOSE MARKER OPENS A LINE IN TITLE CASE: `MARKER` is uppercase only, so `decided.mjs "severance"` misses Case Making's ruling and two Bob rulings read "No RULING".** — owner M0.
order: with the M0 instrument rows; M0-97, M0-99 and D-341, which it waited on, are done (SCHEDULER #17, 2026-09-23, LED-7 S17-3; verified at the code on `02603e88`)
milestone: M0
interface: none
design: `docs/development/VERIFICATION.md` §"WHAT COMPOSES THE INSTRUMENTS".
depends-on: none.
scope: the marker admits a title-case label arm; `**Settled by:**` stays unfiled. Extend `tools/decided.test.mjs`.
accepts-when: the three missed rulings are found. NEGATIVE CONTROL: remove the label arm, and those rulings go unfiled by name.
added: 2026-09-23 · SCHEDULER #17 (LED-7 S17-3; keeps its `D-` id).

### D-304 · queued — **`walkfloor.mjs`'s HEADER STATES HALF ITS LEXICAL-SCOPE BLIND SPOT: it names same-named locals in different blocks, and omits a `let` reassigned in a branch and a site reading GUARDED off a neighbour's `*Repro` key.** — owner M0 (walkfloor's owner).
order: with the M0 instrument rows (SCHEDULER #17, 2026-09-23, LED-7 S17-4)
milestone: M0
interface: none
design: `docs/development/VERIFICATION.md` (an instrument states its limits), with BOB #32's ruling of 2026-09-23 23:30Z (cite until folded): *the missing statements belong in walkfloor.mjs's own HEADER; VERIFICATION.md gets no line (no budget).*
depends-on: none.
scope: add the two items to the header's CANNOT SEE list.
accepts-when: the header names both. NEGATIVE CONTROL: a grep arm over the header fails by name if either is missing.
added: 2026-09-23 · SCHEDULER #17 (LED-7 S17-4; keeps its `D-` id).

### D-342 · queued — **A CLAIMS.md RELEASE HAS FOUR SPELLINGS AND NO TOOL READS ANY OF THEM: a `### RELEASED` heading, a `released:` line at the file end, a dated release, and the one grammar.** BOB #32's ruling of 2026-09-23 23:30Z (cite until folded): *the one release grammar is a `released: <date> …` line INSIDE the claim's block; the three historical forms are read as released and brought to it; the planning-hygiene pin is a row.* — owner M0.
order: with the M0 instrument rows (SCHEDULER #17, 2026-09-23, LED-7 S17-4)
milestone: M0
interface: none
design: `docs/development/VERIFICATION.md` (a pin over a ledger), for `docs/development/PARALLELISM.md` §"Claiming an area" (BOB folds the grammar), with BOB #32's ruling of 2026-09-23 23:30Z (cite until folded).
depends-on: none.
scope: bring the three historical forms to the grammar; a `planning-hygiene` arm pins it.
accepts-when: every released block carries the in-block line. NEGATIVE CONTROL: plant a `### RELEASED` heading, and the pin fails by name.
added: 2026-09-23 · SCHEDULER #17 (LED-7 S17-4; keeps its `D-` id).

### D-459 · queued — **`case-opened.test.mjs` IS UNCLASSIFIED IN THE COVERAGE REGISTER, AND WAS BEFORE D-241.** — owner M0.
order: with the M0 instrument rows, after D-342 (SCHEDULER #17, 2026-09-23; D-241's worker via CONDUCT #18 00:15Z)
milestone: M0
interface: none
design: `docs/development/VERIFICATION.md` (the negative-control register).
depends-on: none.
scope: classify the suite in `coverage.mjs`'s register, with its control or its stated reason for none.
accepts-when: `coverage --strict` names no unclassified suite. NEGATIVE CONTROL: remove the classification, and `--strict` names the suite.
added: 2026-09-23 · SCHEDULER #17 (`node tools/mintid.mjs D`).

### D-466 · queued — **D-394's OFFICE EXTENT ARMS ARE UNDRIVEN BY ITS SUITE: the worker states it — the cross-version notice's office-format arms have no fixture reaching them.** — owner RECORD.
order: with the M0 control rows, after D-459 (SCHEDULER #17, 2026-09-23; D-394's worker via CONDUCT #18)
milestone: M0
interface: none
design: `docs/development/VERIFICATION.md` (test through the op).
depends-on: D-394 (`integrated` on c18-batch8).
scope: office fixtures (docx, xlsx) driving each office extent arm of the notice.
accepts-when: each office arm is driven and asserted. NEGATIVE CONTROL: break one office arm's extent match, and its fixture arm fails by name.
added: 2026-09-23 · SCHEDULER #17 (`node tools/mintid.mjs D`).

### D-467 · queued — **`nc-m038.mjs` ARM (15) DOES NOT ARM ON `main`: its anchor no longer occurs, so the arm cannot fail.** Found by REC-187's worker (F2). — owner M0.
order: with the M0 control rows, after D-466 (SCHEDULER #17, 2026-09-24; REC-187's worker via CONDUCT #19)
milestone: M0
interface: none
design: `docs/development/VERIFICATION.md` (a control that cannot fail refutes nothing).
depends-on: none.
scope: re-anchor arm (15) on frontier's `(n) => this.#frontierLatest(level, …)` closure.
accepts-when: `node bio-plane/test/nc-m038.mjs` reports arm (15) run and failing as declared. NEGATIVE CONTROL: the arm itself, recorded on the suite's `NEGATIVE CONTROL:` line.
added: 2026-09-24 · SCHEDULER #17 (`node tools/mintid.mjs D`).

### D-471 · queued — **`status.test` §6's UI_HELPERS CENSUS MISSES `queueApplySet` AND `queueSelFor`.** — owner M0 (`tools/status.mjs`).
order: with the M0 instrument rows, after D-467 (SCHEDULER #17, 2026-09-24; REC-188's worker via CONDUCT #19)
milestone: M0
interface: none
design: `docs/development/VERIFICATION.md` (a census states what it reads).
depends-on: none.
scope: add both to `UI_HELPERS` in `tools/status.mjs`.
accepts-when: the census names both. NEGATIVE CONTROL: remove one, and the §6 arm fails by name.
added: 2026-09-24 · SCHEDULER #17 (`node tools/mintid.mjs D`).

### D-474 · queued — **`machine-fences.control.mjs` STILL DECLARES FIGURES FOR 12 OR 13 FENCES, AND THERE ARE NOW 14 (REC-189 added MACHINE_CANNOT_SET_RISK_TIER); the driver is REC-73's and is not in the battery.** — owner RECORD.
order: with the M0 control rows, after D-471 (SCHEDULER #17, 2026-09-24; REC-189's worker F3 via CONDUCT #19)
milestone: M0
interface: none
design: `docs/development/VERIFICATION.md` (a control declares what it measures).
depends-on: REC-189 (finished; rides the train after c19-batch9).
scope: re-run the driver and move its declared figures to 14 fences.
accepts-when: `node bio-plane/test/machine-fences.control.mjs` reports every arm as declared at 14. NEGATIVE CONTROL: the driver's own arms, recorded on its `NEGATIVE CONTROL:` line.
added: 2026-09-24 · SCHEDULER #17 (`node tools/mintid.mjs D`).

### D-477 · queued — **`existed`-STYLE ANSWERS COMPUTED FROM THE DURABLE OBJECT'S SQLITE (`INSERT OR IGNORE` then `changes()`) IN `store.mjs` WERE NEVER SWEPT FOR D-469's CLASS: an answer read after the write that decides it.** — owner RECORD.
order: with the M0 sweeps, after D-474: D-469's class may recur where no suite looks (SCHEDULER #17, 2026-09-24; D-469's worker via CONDUCT #19)
milestone: M0 (a class sweep)
interface: none unless a site is wrong.
design: `docs/development/VERIFICATION.md` (a class is swept, not one site).
depends-on: none.
scope: enumerate every `existed`/`created`/`new` answer in `store.mjs` derived after its own write; for each, show it is read before the write or fix it; name each site in the sweep's verdict list.
accepts-when: the verdict list names every site with its evidence, and any wrong site is fixed with a first-call arm. NEGATIVE CONTROL: for a fixed site, move the read after the write again, and its first-call arm fails by name.
added: 2026-09-24 · SCHEDULER #17 (`node tools/mintid.mjs D`).

### D-457 · queued — **CPDF-20's PER-PAGE TIER IS SHIPPED AND UNRECORDED: `mergeTier2Text` has emitted `text.pages[].tier` since `1240af81` with no IC on I2, and Framework §16's closing table and front matter still list "a per-page rule for tier-2 replacement" ABSENT, though it is built and was watched live (D-283, M-120).** — owner CONTENT-PDF.
order: with the M0 record-hygiene rows, after D-441: a record that says less than is built (SCHEDULER #17, 2026-09-23; CPDF-3's worker via CONDUCT #18 23:12Z)
milestone: M0 (the record of what is built)
interface: I2 additive MINOR — filed by CONTENT-PDF, resolved by CONDUCT.
design: `docs/development/VERIFICATION.md` (the construct record is checked against the code), for `docs/architecture/BIO_Content_Framework_v0_10.md` §16.
depends-on: none.
scope: file the I2 IC for `tier`; correct §16's table and front matter; add a construct-5 claim in `construct-status.json` probing `export function mergeTier2Text(` in `textchain.mjs`.
accepts-when: `node tools/status.mjs 5` reads the per-page rule BUILT by its probe, and I2 documents `tier`. NEGATIVE CONTROL: rename the probed function, and the status check fails naming the claim.
added: 2026-09-23 · SCHEDULER #17 (`node tools/mintid.mjs D`).

### D-458 · queued — **C-77 EXISTS AND NOTHING RUNS IT OVER A RECORD: Membership §11 item 9's live recheck of project-name uniqueness has a check (D-50) and no op hands the store's project bundles to `checkProjectNameUniqueness`.** — owner RECORD.
order: after D-457, with the record-hygiene rows (SCHEDULER #17, 2026-09-23; D-50's worker via CONDUCT #18 23:55Z)
milestone: M7
interface: I3 additive — one admin/probe read; the integrator mints and classifies the IC.
design: `docs/architecture/BIO_Membership_Architecture_v2.md` §7 (item 7.1) and §11 item 9.
depends-on: D-50 (`integrated` on c18-batch8).
scope: a read-only op running C-77 over the instance's project bundles and naming each collision.
accepts-when: two projects with one name are named; a clean record reads none; counters unchanged. NEGATIVE CONTROL: feed the check one bundle, and the collision arm fails by name.
added: 2026-09-23 · SCHEDULER #17 (`node tools/mintid.mjs D`).

### REC-208 · queued — **TWO PROJECT TITLES A MEMBER CANNOT TELL APART ON SCREEN CAN BE TWO NAMES: the project-name key does not fold Unicode-equivalent forms (NFC and NFD), so a lookalike project could claim a name that is taken.** BOB #32's ruling of 2026-09-23 23:44Z (cite until folded into Membership §7.1): *Unicode-equivalent titles are ONE name; the key normalises to NFC before §7.1's existing comparison; existing titles stay as written, and a pair that collides after normalising is STATED by the census, never renamed.* — owner RECORD.
order: after D-458, the same name check (SCHEDULER #17, 2026-09-23; D-50's worker)
milestone: M7
interface: I3 — the name refusal widens; the integrator mints and classifies the IC.
design: `docs/architecture/BIO_Membership_Architecture_v2.md` §7 (item 7.1), with BOB #32's ruling of 2026-09-23 23:44Z (cite until folded into Membership §7.1).
depends-on: D-50 (`integrated` on c18-batch8).
scope: NFC normalisation in the name key at the write and in C-77; D-458's census states any post-normalisation pair.
accepts-when: an NFD title equivalent to a taken NFC title is refused by name; existing titles read byte-unchanged. NEGATIVE CONTROL: drop the normalisation, and the NFD-lookalike arm fails by name.
added: 2026-09-23 · SCHEDULER #17 (`node tools/mintid.mjs REC`).

### UI-87 · queued — **THE ANALYST-VOCABULARY GATE FIRES ON PLAIN ENGLISH: `civicos-ui/test/analyst-vocabulary.mjs`'s `BANNED` connective rule `(AND|OR)\s+(of|…|set|sets)` carries `/i`, so "reason 1 and set 2" and "two or more sets" fail as analyst jargon.** Measured with node (CONDUCT #17, re-measured by SCHEDULER #17 on c17-batch5 @ 7c4f6b5f); the file's other connective rules are case-sensitive and its own header, finding (i), says a case-insensitive `AND` fires on correct English. — owner UI.
order: after M0-139, among the verification rows: a gate that refuses correct member copy pushes surface authors toward worse words, so it goes ahead of pure process tooling (SCHEDULER #17, 2026-09-23, CONDUCT #17's 22:00Z finding (4))
milestone: M0
interface: none — a test rule.
design: `docs/development/VERIFICATION.md` (a suite asserts what it claims), with DEC-32 clause 1 as the file itself states it.
depends-on: none.
scope: drop the `i` flag on that one rule; keep "the OR set" and "AND of the legs" caught. Extend `civicos-ui/test/analyst-vocabulary.test.mjs` with a must-pass fixture.
accepts-when: "reason 1 and set 2" passes and "the OR set" is still refused. NEGATIVE CONTROL: restore `/i`, and the plain-English must-pass arm fails by name.
added: 2026-09-23 · SCHEDULER #17 (CONDUCT #17's finding; `node tools/mintid.mjs UI`).

### D-272 · queued — **THE REFUSAL-CODE CENSUS IS STILL A FLOOR READ AS A TOTAL: `check-refusal-codes.mjs` arm F resolves codes held in constants (`STORE_SILENT_REASON` in `index.mjs`, `const REASON = {…}` in `store.mjs`) and prints them, but they never join the census union the floors are measured over.** — owner UI (the refusal-code guard).
order: after UI-87, first of the census rows: a member-facing refusal can go untranslated while the census reads complete (SCHEDULER #17, 2026-09-23, LED-7 batch S17-1)
milestone: M0 (the census instrument; the translations it surfaces are DEC-49 work)
interface: none — the census and its floors.
design: `docs/development/VERIFICATION.md` (a census states what it reads), with DEC-49 for the translation of any code it recovers.
depends-on: none.
scope: promote arm F's identifier resolution to a seventh matcher in the union; re-read the six `FLOOR` figures from one printed green run in the same turn; translate the recovered codes under DEC-49 (`STORE_DID_NOT_ANSWER` among them). Suite `civicos-ui/test/refusal-codes.test.mjs`, driver `refusal-codes.control.mjs`.
accepts-when: both recovered codes are in the union and the floors carry no slack. NEGATIVE CONTROL: remove the seventh matcher, and a named floor arm fails.
added: 2026-09-23 · SCHEDULER #17 (LED-7 S17-1; D-272's DEBT row of 2026-08-09, verified at the code on `02603e88`; keeps its `D-` id).

### D-273 · queued — **NINETY-THREE-PLUS REFUSAL CODES ARE WRITTEN INLINE AT SEVERAL SITES (`check-refusal-codes.mjs` F4 MULTI-SITE, last partition 103), SO NONE CAN TAKE ONE DEC-49 ROW.** — owner RECORD, with UI.
order: after D-272, the same census (SCHEDULER #17, 2026-09-23, LED-7 S17-3; verified at the code on `02603e88`)
milestone: M0 (the guard's shape)
interface: none
design: `docs/development/VERIFICATION.md` (the DEC-49 guard), following REC-79's single-helper shape for `NOT_CAPABLE` (`admission-gate.test.mjs`).
depends-on: none.
scope: consolidate each multi-site code behind one helper, one code per slice, starting with `NO_SUCH_BUNDLE` (15 sites); re-read the partition each slice.
accepts-when: the sliced code reads single-site and the F4 count falls by one. NEGATIVE CONTROL: restore one inline literal, and arm F fails by name.
added: 2026-09-23 · SCHEDULER #17 (LED-7 S17-3; keeps its `D-` id).

### D-344 · queued — **THE CONTROL REGISTER CANNOT SEE A QUALIFIED `NEGATIVE CONTROL` DECLARATION: `control-register.mjs` `markerPositions` counts the phrase only when a separator follows it directly, so `NEGATIVE CONTROL (…)` (over sixty suites) and `NEGATIVE CONTROL, …` (three in `corpuscheck.test.mjs`) are invisible, and `register-grammar.test.mjs` C5e works around the blind spot rather than fixing it.** — owner M0 (VERIFICATION).
order: after D-272: the register every suite's control is counted by under-reads, so coverage is claimed on less than it reads (SCHEDULER #17, 2026-09-23, LED-7 batch S17-1)
milestone: M0
interface: none
design: `docs/development/VERIFICATION.md` §"The negative-control register".
depends-on: none.
scope: `markerPositions` admits one parenthesised or comma qualifier before a separator on the same line; a bare phrase with no separator still does not count; C5e corrected in the same change.
accepts-when: `corpuscheck.test.mjs` reads five declarations and C5e's workaround falls, in `register-grammar.test.mjs`. NEGATIVE CONTROL: restore the strict separator check, and the "a qualified marker is a declaration" arm fails by name.
added: 2026-09-23 · SCHEDULER #17 (LED-7 S17-1; keeps its `D-` id).

### D-357 · queued — **THE DEC-49 GUARD'S REGION MATCHER ENDS IN A WORD BOUNDARY, SO A REGION NAMED `x-y` OPENS REGION `x` TOO: `civicos-ui/check-refusal-codes.mjs` `REGION_START`/`REGION_END`.** A live latent pair exists (`is-capture-request` in `store.mjs`, `is-capture-request-arm` in `index.mjs`), harmless only while they sit in different files. — owner UI.
order: after D-344 (SCHEDULER #17, 2026-09-23, LED-7 batch S17-1)
milestone: M0
interface: none
design: `docs/development/VERIFICATION.md` (the DEC-49 guard's section, *what a refusal is in principle*).
depends-on: none.
scope: end both patterns in a lookahead for whitespace, a comment close or end of line instead of the word boundary; a sibling-region fixture.
accepts-when: a file holding regions `x` and `x-y` passes with one opener each, and the `regionLines` floors do not move. NEGATIVE CONTROL: restore the word boundary, and the "one opener per name" arm fails naming two opening markers.
added: 2026-09-23 · SCHEDULER #17 (LED-7 S17-1; keeps its `D-` id).

### D-300 · queued — **A SUITE THAT READS THE WALL CLOCK CAN TURN RED UNTOUCHED, AND THE SWEEP THAT WOULD SAY SO IS RUN BY NOBODY: three suites of about three hundred bind `BIO_NOW_MS`; `clockadvance.control.mjs` exists and no tool, script or gate runs it.** — owner M0.
order: after D-357; the cheap half (run the sweep) first; threading the clock through every constructor is a later row if the sweep finds decay (SCHEDULER #17, 2026-09-23, LED-7 batch S17-1)
milestone: M0
interface: none
design: `docs/development/VERIFICATION.md`.
depends-on: none.
scope: `gates.mjs` (or the battery) runs the clock-advanced sweep at plus one year on the full class and prints its result line; each suite it turns red is named.
accepts-when: the sweep runs without anyone starting it and its line is printed on a full gate. NEGATIVE CONTROL: plant a fixture dated thirty days ahead, and the sweep arm fails naming the suite.
added: 2026-09-23 · SCHEDULER #17 (LED-7 S17-1; keeps its `D-` id).

### D-166 · queued — **THE TIER 1 COVERAGE PROBE STILL POINTS AT OAKLAND FINANCE URLS THAT NOW SERVE HTML: `bio-plane/test/tier1-coverage-probe.mjs` names `www.oaklandca.gov/files/assets/city/v/1/finance/documents`, unchanged since 2026-07-31.** Not re-measured live on 2026-09-23 (the session's proxy refused the host). — owner CONTENT-PDF.
order: after D-300, last of this batch: a measurement's corpus, not a product path (SCHEDULER #17, 2026-09-23, LED-7 batch S17-1)
milestone: M0 (a measurement instrument's corpus)
interface: none
design: `docs/development/VERIFICATION.md` (a measurement names its instrument and date), for the Tier 1 coverage entry in `docs/development/MEASUREMENTS.md`.
depends-on: none.
scope: find the documents' current locations, re-point the probe's Oakland half, keep the old URLs as history in the entry.
accepts-when: every URL the probe names returns bytes beginning `%PDF`, recorded with date and instrument. NEGATIVE CONTROL: point one entry back at an HTML page, and the probe names it as not a PDF.
added: 2026-09-23 · SCHEDULER #17 (LED-7 S17-1; keeps its `D-` id).

### M0-135 · queued — **A LANE'S OWN `gates.mjs` ON A TREE ALREADY RECORDED GREEN TAKES §2d's TREE-KEYED SHORTCUT AND RUNS NO NEVER-CACHED UNIT (with `BIO_GATE_RESULTS=off`), SO A HISTORY- OR REF-READING CHECK IS SKIPPED ON A LANE'S PUSH.** M0-131 closed this for the TRAIN (`gates.mjs --never-cached` on a reused tree, so `main` is covered); a lane's gate is not. M0-131's worker's finding, verified in its report (CONDUCT #16); RE-READ 2026-09-23 by SCHEDULER #16 on `0e7cc03e` (M0-131 landed): NARROWED — with the per-unit record on (the default) §2d does not take the shortcut and the never-cached units run; the bare shortcut stands only with `BIO_GATE_RESULTS=off` (or no `tools/gateresults.mjs`) and no `--with-never-cached`. — owner M0.
order: behind the product rows, first of the process block (moved 2026-09-23 by SCHEDULER #16): re-read at the code, the default path already runs the never-cached units, so this closes a non-default mode, neither cutting gate time nor unblocking product — Bob, 2026-09-22: *"The goal is BIO work; process is overhead"* (was: directly after REC-176, SCHEDULER #15)
milestone: M0
interface: none
design: `docs/development/TREE-SHARING.md` §3a condition 1 (never-cached units always run) and §2 (M0-122's reuse), with `docs/development/VERIFICATION.md` (admitted for M0 by name).
depends-on: M0-131 (its derived never-cached set and `--never-cached` run are reused).
scope: with the per-unit record off, §2d's shortcut on a recorded-GREEN tree behaves as `--with-never-cached`: it runs the derived never-cached set and records the tree GREEN only when they pass; the printed line says which units ran.
accepts-when: `gates.mjs` on a recorded-GREEN tree with a planted history defect reads RED naming the never-cached unit. NEGATIVE CONTROL: restore the bare shortcut, and the planted arm reads GREEN and fails by name.
added: 2026-09-23 · SCHEDULER #15 (M0-131's worker's finding via CONDUCT #16; `node tools/mintid.mjs M0`).

### M0-137 · queued — **SUITES PASS ABBREVIATED COMMIT IDS TO GIT, SO A FETCH THAT BRINGS A COLLIDING PREFIX TURNS A GREEN SUITE RED WITH NO CODE CHANGE.** Re-read on `origin/main` @ `38b49c50`: `bio-plane/test/ledger.test.mjs` `PRE_MIGRATION = "9ea2eb02"` and `STATE_PIN = "de40aa56"`; `bio-plane/test/mergecarry.test.mjs` passes `"e241672"` to `git cat-file`, `auditMerge`, `git show` and the `tools/mergecarry.mjs --commit` CLI. — owner M0.
order: first of the process block, directly after M0-135: a red on `main` from a git object, not the code, is TREE-SHARING §3's alarm to Bob, but no collision has happened, so it sits behind the product rows (SCHEDULER #16, 2026-09-23; M0-136's worker via CONDUCT #16)
milestone: M0
interface: none
design: `docs/development/TREE-SHARING.md` §3 (*"A GATE TEST DEPENDS ONLY ON THE CODE"*), with `docs/development/VERIFICATION.md` (admitted for M0 by name).
depends-on: M0-136 (touches the same history readers; on `land/conduct/c16-batch6`).
scope: every commit id a suite passes to git in CODE is the full 40-hex id (`9ea2eb022b5d6490c9e9e96b93037040193084d3`, `de40aa56f5d397666228502132d56756f51ff6b9`, `e2416725d2504485443ea24bb68a00009e886570`); a sweep of `bio-plane/test/` and `tools/` for other short ids passed to git, each lengthened or listed. Prose citations may stay short.
accepts-when: `ledger.test.mjs` and `mergecarry.test.mjs` green with only 40-hex ids in their git calls, and a hygiene arm in `mergecarry.test.mjs` that fails by name on a short id passed to git. NEGATIVE CONTROL: shorten one id back, and that arm fails by name.
added: 2026-09-23 · SCHEDULER #16 (M0-136's worker's finding via CONDUCT #16, verified at the code; `node tools/mintid.mjs M0`).

### M0-104 · queued — **A GATE RUN ON A DIRTY TREE RECORDS NOTHING, SO D-293's OWN SHAPE — A RED GATE, THEN `git add -A && git commit && git push`** … (whole text: the cut archive)
order: behind the product rows, the first process row after D-50 (Bob, 2026-09-22, `CLAUDE.md` §2: process is overhead; it neither cuts gate time nor unblocks product, as a commit-then-gate is recorded already); a correction to D-293 (SCHEDULER #11 on BOB #25's word)
milestone: M0
interface: none
design: `docs/development/VERIFICATION.md` (admitted for M0 by name), its push-guard section; the dirty-tree … (whole text: the cut archive)
depends-on: none — D-293 is on `main`.
accepts-when: a RED gate on a dirty tree, then `git add -A && git commit` and a push, is refused by name; a dirty run whose tree changes mid-run records nothing and says so; a GREEN dirty … (whole text: the cut archive)
added: 2026-09-22 · SCHEDULER #11 (BOB #25's inbox entry, item 1, drained this commit; `node tools/mintid.mjs M0`).
cut: cut to its fields by SCHEDULER #12 (2026-09-22, the backlog's 150 KiB budget); the row as it stood before this cut is VERBATIM under «M0-104» in `docs/archive/ledgers/QUEUE-cut-2026-09-22.md`. A worker READS IT before building.

### M0-105 · queued — **`docs/development/VERIFICATION.md` STANDS AT 24,572 OF ITS 24,576 B, SO A RULING ABOUT VERIFICATION CANNOT BE FOLDED INTO IT** … (whole text: the cut archive)
order: directly after M0-104, whose line it folds, behind the product rows (Bob, 2026-09-22, `CLAUDE.md` §2: process is overhead; SCHEDULER #11 on BOB #25's word); RETURNED here by SCHEDULER #14 after M0-107 folded its ruling within budget (`VERIFICATION.md` 24,319 B at `14f1b75e`)
milestone: M0
interface: none
design: `docs/development/VERIFICATION.md` (admitted for M0 by name), with CLAUDE.md §1's reading budget and … (whole text: the cut archive)
depends-on: M0-97 (on CONDUCT #12's batch), whose second specimen this cut folds (BOB #25, 2026-09-22).
accepts-when: the file is at most 22,528 B; every sentence the cut removes is in the archive file verbatim (moved, never lost); the register-grammar suite and its control pass. How a liar … (whole text: the cut archive)
added: 2026-09-22 · SCHEDULER #11 (BOB #25's inbox entry, item 2, drained this commit; `node tools/mintid.mjs M0`).
cut: cut to its fields by SCHEDULER #12 (2026-09-22, the backlog's 150 KiB budget); the row as it stood before this cut is VERBATIM under «M0-105» in `docs/archive/ledgers/QUEUE-cut-2026-09-22.md`. A worker READS IT before building.

### M0-84 · queued — **NOTHING NOTICES WHEN A RETIRED INSTANCE OF A LANE LANDS AFTER ITS SUCCESSOR.** BOB #17 landed `aa5cc98d` (00:48) after BOB #18 … (whole text: the cut archive)
order: behind the product rows, first of the session-hygiene instruments (Bob, 2026-09-22, `CLAUDE.md` §2: *process is overhead*: a detector neither cuts gate time nor unblocks product; SCHEDULER #12); after M0-81, which PREVENTS what this DETECTS (BOB #19, 2026-09-21): pure git, about a second (SCHEDULER #4, 2026-09-21)
milestone: M0
interface: none
design: `docs/development/VERIFICATION.md` (admitted for M0 by name), enacting `kickoffs/BOB.md` rules 4 and 12.
depends-on: none.
accepts-when: a fixture log with an older instance landing after a newer one WARNs naming both; the same log whose late commit touches only the `-NEXT` file does not. How a liar passes it … (whole text: the cut archive)
added: 2026-09-21 · SCHEDULER #4 (BOB #19's inbox entry, drained this commit).
cut: cut to its fields by SCHEDULER #12 (2026-09-22, the backlog's 150 KiB budget); the row as it stood before this cut is VERBATIM under «M0-84» in `docs/archive/ledgers/QUEUE-cut-2026-09-22.md`. A worker READS IT before building.

### M0-85 · blocked — **THE HEARTBEAT MEASURES A STALE TREE.** `conduct-heartbeat` STEP 3 greps `QUEUE.md` in the MAIN CHECKOUT's working tree and … (whole text: the cut archive)
order: behind the product rows with the session-hygiene instruments (Bob, 2026-09-22, `CLAUDE.md` §2: *process is overhead*; SCHEDULER #12), M0-81's class (BOB #19, 2026-09-21); `blocked` because no worker can take it — the definition is Bob's to approve and is never changed from here (SCHEDULER #4, 2026-09-21)
milestone: M0
interface: none
design: `docs/development/VERIFICATION.md` (admitted for M0 by name), with the heartbeat's own STEP 3 warning … (whole text: the cut archive)
depends-on: Bob's approval of the definition edit (BOB #19 took it to him, 2026-09-21).
accepts-when: a heartbeat run's `queued`/`running` counts equal those of `git show origin/main:docs/development/QUEUE.md` read at that run, and its sweep names the tip it judged.
added: 2026-09-21 · SCHEDULER #4 (BOB #19's inbox entry, drained this commit).
cut: cut to its fields by SCHEDULER #12 (2026-09-22, the backlog's 150 KiB budget); the row as it stood before this cut is VERBATIM under «M0-85» in `docs/archive/ledgers/QUEUE-cut-2026-09-22.md`. A worker READS IT before building.
