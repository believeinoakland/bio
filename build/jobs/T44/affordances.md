# affordances (T44)

**Status** · session_01YGf42ow4aj8kGUoEYJo7zP · depth 2 · COMPLETE · handled B0

## J1 · COMPLETE

**T44-9 applied on `job/T44/affordances` (c3f43231f8, c3c922ae26).** One code change of behaviour, R15's (below); read it before plane's T44-13.

**Read whole by me (P20; K2730):** `build/requirements/affordances.md`; `src/affordances.mjs`, `src/affordances/{facts,door,words,act-help}.mjs`; all 21 test files under `test/m/affordances/`; T44-9 and rule 4 in the plan; K2726, K2730, K2732, K2736; my T43 record. The used modules' public parts (1,422 KB, all 66) were read in full by four helper agents in this session, split by size, each given my entries and what follows them (T44-11, T44-13), each writing a digest citing sections (mechanics §17 (3)). A fifth helper read op-grades' tests whole to map N877's duplicates. Nothing in the digests disagrees with the reading below: no public part treats `class:ai/<tokenId>` otherwise than as a machine stamp (record-grammar R13–R15: prefix `class:`; connections' Terms, action-plans R11 name the form).

**Entries applied**
- **N878 (R48).** `mock-acts.js` and `words.json` on `main` key the text `pagetranscribe` / `act.pagetranscribe.does`; `ACT_HELP` already held it under `pagetranscribe`, byte for byte (all 213 texts equal the design's, the 27 alias keys under their ops). So no table text changed: `act-help.mjs`'s header names PR #25's registry. `t36.test.mjs` re-pinned (the design's `owed_` keys are three; R48's test reads `act.pagetranscribe.does`, and that `owed_pagetranscribe` is gone from both files). Clears rule 4 (6)'s affordances reds (`t36`:54, 93).
- **N874 (R15, R18).** Checked before plane's change: `#roster(id, by)` (and the EXISTENCE facts' roster) answered `class:ai/<tokenId>` exactly as `class:ai` — no participation row names either, `isAdministrator` is false for both, no act offered. **But both answered a roster object** (`owner: false, state: null, other_owner_committed: true, …`), where R15 says a positional fact is null "for a caller with no roster position" and the file's own header said a `class:*` credential reads null. Fixed in this job (P8): `by` that is a control-plane stamp (`isMachineStamp`, prefix `class:`/`token:`, never a member's handle nor the founder's bare `admin`) reads `roster: null`. The acts offered are unchanged (every roster act asks a stated `true`). New test `plane.test.mjs` "R15 R18 (N874)": five stamps (`class:ai`, two `class:ai/<tokenId>`, `class:member`, `token:member`) on PA, PB, PC and at hidden PR's EXISTENCE answer identical facts with `roster: null` and no roster act; members still read a roster; the rescue a stamp is withheld is refused it NOT_AN_ADMIN. The old code fails it.
- **N877.** Test titles in `catalogue`, `t31`, `t33`, `t34` (and the same in `backing`, `sources`, `t33-backing`, `plane`) no longer name retired ids. An assertion was dropped only where op-grades' own tests pin the same content (each mapped to its op-grades file:line by the helper; I spot-checked). Four tests dropped whole (cat:210, 404, 587, 874); three folded. Live R1/R4/R12/R19/R20/R24/R36 checks kept and re-titled. 234 → 226 tests; coverage 34 of 34.

**Also fixed (my module)**
- `door.mjs`: with no viewer stamped, the screens read sent `viewer=` (""); it now leaves it off, as the facts query does (R15). `door.test.mjs` pins it; the old code fails it.

**Deferred:** nothing.

**Found in other modules**
- **op-grades (its R1–R31; for its next job):** pins its own tests do not hold, kept in mine and marked `op-grades' content its own tests do not yet pin (N877; reported to BOB)`: RUNGS as a closed partition; the closed terminal set; the closed `undetermined` set, its count and the 78 = 21 + 57 tally; counselpacketexport `substrate` and layer 9's NON_ACTS/read rows; NON_ACTS.actionhold's sentence; provenancechain/provenanceroute `substrate` with `document-directed:`; templategrantrevoke = reviewrevoke, templatesave's `draft-directed:` and /filings R32/, the grant-door converse; inboxresolve's three phrases and ratify's no-"deferred"; contradictionpairs /five named keys/; filingapprove /approved once/ and every consequence statement's keys and length; actionholdrelease's fuller wording; T33's merged-table identity; the JUSTIFICATION_REFUSALS exclusion lists (templates, docket, wizard, notes); "writes nothing" and no grade on the owners' reads. Once op-grades pins them, my copies can go.
- **plane (T44-13):** after my merge a credential's `by` reads `roster: null` in `op=affordancefacts`; plane's change of the stamp to `class:ai/<tokenId>` needs nothing from affordances.
- **wizard-scripts (wording):** its R13 calls `machineRefused` "`affordances`' `MACHINE_REFUSALS` keys" where its R24 says op-grades' (R5) — stale since K1974 (helper's digest).

**Tests**
- affordances: 226 pass, 0 fail.
- My users: op-declarations 132/1 — `t34.test.mjs`:148, rule 4 (6) until T44-11; control-plane 223/0; tasks 106/0; queue 136/0; store-door 44/0; plane (with `migrate-released`) 191/0.

**Checks** (from civicos-process)
- format: 147 modules, 146 requirements files; 0 failures.
- architecture . affordances: 25 product files, 266 relative imports; 0 failures.
- coverage . affordances: 34 of 34 live requirement ids named by a test; 0 failures.
- ownership . affordances tranche/T44: 15 files changed; 0 failures.

Size (session_01YGf42ow4aj8kGUoEYJo7zP): test runs 14, module lines 2351
