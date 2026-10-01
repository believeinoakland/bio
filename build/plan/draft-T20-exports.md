# Draft: the owners' export clauses (K861) and the wording fixes they bring

DRAFT by a worker for BOB #85, 2026-10-01, on `tranche/T20` @ dc557383d1 (K873), for BOB to fold before each owner's layer (rule 1). Modelled on record-core R74 and membership R96 (K871). Every table, column and key below is read from `bio-plane/src/plane/held.mjs` (unchanged since 89bca287d9) and checked against the owner's own schema and code.

The shared reading in `held.mjs`: `hid` is null for a viewer never sent (a direct internal call, purge's proof), else membership's `hiddenBundles(viewer)` (:64); `nx`/`n` (:66–:72) add, per key column, `COALESCE(<key>, '') NOT IN <hid>` only when `hid` is given; a counter with no key column is never subtracted.

## 1. New clauses

### observation-log **R32** (max is R31) · insert after R31 (line 57), before `## Private`

> - **R32** (K861, plane R10) The module exports a figure source shaped as `record-core` R63's `counts(hid)`, with its key list, for `plane` to register under this module's name: `observations`, every row of `observation_log` (lead looks and run rows included), and `leads`, every row of `leads`; neither table has a column naming a bundle, so neither figure is subtracted by `hid` and every `hid`, null included, counts whole. Both are purge's proof only (`record-core` keeps them off `op=stats`' answer, its R64); `observationsNonLead` is not this module's figure and stays `plane`'s (K861 (2)). It answers exactly what plane's held copy answers today, and the module registers nothing itself while plane holds that copy. *(not yet met: T20 layer 5)*

Checked: `held.mjs`:117 `n("observation_log")`, :128 `n("leads")`, both under `proof` only, no keys; `observation-log/schema.mjs`:58, :107 (no bundle column on either); `record-core/index.mjs`:924 `#PROOF_ONLY` holds `leads` and `observations`, :976 strips them from `stats`.

### inquiry **R51** (max is R50) · insert after R14 (line 36), in the earned-registry group

> - **R51** (K861, plane R10) The module exports two shares of what `plane` holds, for `plane` to register under this module's name, and registers neither itself while plane holds its copy: (1) a figure source shaped as `record-core` R63's `counts(hid)`, with its key list: `inquiryMigrationReplays`, the rows of `inquiry_migration_replays` less the rows whose `bundle_id` is in `hid`, a NULL key naming no bundle (so never dropped by `hid`); a null `hid` counts whole; (2) the leg-grade resolver `retrieval`'s `registerLegGrades` takes (its R55), built over the instance: for a list of legs `{grade, target_id}` it asks R13's `earned` once, with no subject entity, over the list's distinct targets, and answers per leg, in order, R14's `legCapped` of the leg's grade against its target's earned capture ceiling (a target with no ceiling answers null); an empty list answers an empty list. Each answers exactly what plane's held copy answers today. *(not yet met: T20 layer 6)*

Checked: `held.mjs`:98 `n("inquiry_migration_replays", "bundle_id")`; :153–:159 `heldLegGrades` (`earned(null, [...new Set(target_ids)])?.earned?.capture || {}`, then `legCapped(l.grade, cap[l.target_id], l.target_id)`); `inquiry/schema.mjs`:190 (`bundle_id TEXT PRIMARY KEY`, no `NOT NULL`, so a NULL key is possible in SQLite and the COALESCE reading is load-bearing); `inquiry/index.mjs`:115 `legCapped` (`!earned` → null), :2259 `earned`; `retrieval/index.mjs`:225, :637–:638 (called only with a non-empty list).

### basis-versions **R44** (max is R43) · insert after R42 (line 66), before `## Private`

> - **R44** (K861, plane R10) The module exports a figure source shaped as `record-core` R63's `counts(hid)`, with its key list, for `plane` to register under this module's name: `basisVersions`, the rows of `inquiry_basis_versions` less the rows whose `bundle_id` is in `hid`, and `basisVersionLegs`, the rows of `inquiry_basis_version_legs` less the rows whose `bundle_id` or `target_id` is in `hid`, a NULL key naming no bundle (so never dropped by `hid`); a null `hid` counts whole. It answers exactly what plane's held copy answers today, and the module registers nothing itself while plane holds that copy. *(not yet met: T20 layer 6)*

Checked: `held.mjs`:134–:135; `basis-versions/schema.mjs`:13, :44 (both key columns `NOT NULL`; the NULL reading kept for parity with the held copy).

### run-productions **R20** (max is R19) · insert after R14 (line 35), before `## Private`

> - **R20** (K861, plane R10) The module exports its figure source, `counts(hid)` (shaped as `record-core` R63's), with its key list, for `plane` to register under this module's name: `proposedReadings`, the rows of `proposed_readings` less the rows whose `bundle_id` is in `hid`, and `suggestRefusals`, the rows of `suggest_refusals` less the rows whose `target` (the question refused) is in `hid`, a NULL key naming no bundle (so never dropped by `hid`); a null `hid` counts whole; it answers exactly the listed keys. It answers exactly what plane's held copy answers today, and the module registers nothing itself while plane holds that copy. *(not yet met: T20 layer 6)*

Checked: `run-productions/index.mjs`:824–:829 (`COALESCE(${k}, '') NOT IN`, keys `bundle_id` and `target`); `held.mjs`:76, :96, :140 read it by name; `run-productions/schema.mjs`:31 (`target`), :90 (`bundle_id`). Note the key column of `suggest_refusals` is `target`, not `bundle_id`.

## 2. START placeholders

All four STARTs carry the placeholder in the form BOB substituted in membership's and record-core's ("Your export is R96 (folded before L2, K871), marked not yet met: …"):
- `observation-log.txt`: "Your export is worded before L5 (rule 1), marked not yet met:" → "Your export is R32 (folded before L5, K…), marked not yet met:"
- `inquiry.txt`: "Your exports are worded before L6 (rule 1), marked not yet met: list each" → "Your exports are R51 (1) and (2) (folded before L6, K…), marked not yet met: list each"
- `basis-versions.txt`: "Your export is worded before L6 (rule 1)" → "Your export is R44 (folded before L6, K…)"
- `run-productions.txt`: "Your export is worded before L6 (rule 1)" → "Your export is R20 (folded before L6, K…)"

## 3. Lines that still name the retired files as present

Not listed: the **Status** and **Size** paragraphs of all six files (dated measurements, e.g. "Code today (measured on `tranche/T3` …)", and the provenance of a past move); they record history, not the present (`layers.md` rule 6's reading). Plane's Status also says `from: ["legacy-store", "legacy-index"]`, which `modules.json` no longer carries: optional, add "(dropped at T20's opening, rule 1)".

| file:line | names | proposed replacement |
|---|---|---|
| observation-log.md:55 | heading "Writers that `legacy-store` registers until this module does" | "**Writers registered in other modules' slots** (moved from `legacy-store`, `build/extraction/legacy-store.md` §4.2 (5), §4.3)" |
| observation-log.md:56 (R30) | "where `legacy-store`'s step runs it today" | drop the clause: "…run after `content`'s." (the slot now runs inside `plane`'s held step, control-plane R42) |
| inquiry.md:32 (R50) | "(C-66.5, REC-179; legacy-store's share, store §4.3)" | optional: "(C-66.5, REC-179; moved from legacy-store's share, store §4.3)" |
| inquiry.md:170 | "`legacy-store` registers both until those modules are extracted." | "`strength` registers `onGrounded` and `reevaluation` `onRaised`." (`strength/index.mjs`:138, `reevaluation/index.mjs`:1648) |
| basis-versions.md:64 (R40) | "`legacy-store` registers the `proposed_readings` reader until `run-productions` does." | "`run-productions` registers the `proposed_readings` reader (its R14)." (`run-productions/index.mjs`:853) |
| basis-versions.md:106 | "`legacy-store` registers until `ai-runs` is extracted." | "`run-productions` registers it (its R14)." (also wrong module: it is run-productions, not ai-runs) |
| plane.md:17 (R2) | "in the order `store.mjs`' constructor builds them today"; "the testimony slot held inside the `plane-held` step (R10) until `control-plane` holds it (its R42, T20; K846)" | "in the order `src/plane/store.mjs`' constructor builds them"; the slot phrase as `current.md` "Roster after K861" proposes ("the held promotion step (`control-plane` R42) at the held step's rank (R10)") |
| plane.md:18 (R3) | "(`store.mjs`' `#migrate`)" | "(`src/plane/store.mjs`' `#migrate`)" (:148) |
| plane.md:37 (Uses) | "today's composition root (`store.mjs`' constructor and `routes`, `src/index.mjs`, `dispatch.mjs`)" | "the composition root (`src/plane/store.mjs`' constructor and `routes`, `src/plane/index.mjs`)" (`dispatch.mjs` and the old `store.mjs` are gone) |
| plane.md:41 (R8) | "`src/index.mjs` is only a one-line re-export …"; "save the held code R10 names" | no fix now (true until plane's T20 job); BOB strikes at that merge |
| plane.md:43 (R10) | `held.mjs` as present; "Each owner's job registers its share under its own name … and deletes it here" | contradicts K861 (1): replace with `current.md`'s proposed R10 |
| plane.md:53 | "Order of the work": delete `store.mjs`, `schema.mjs`, `src/index.mjs` | prefix "Done at T19 (K852–K859), but `src/index.mjs`' re-export (R8, K846):" or retire the note |
| control-plane.md:66 (R42) | "`legacy-store`'s promotion step"; mark "until provenance's and control-plane's T20 jobs" | `current.md`'s proposed R42 (provenance has no T20 job, K861 (3)) |
| control-plane.md:85 (Uses, op-declarations) | "`ops.mjs` … is deleted once those arms leave `src/index.mjs` … (T19 layer 11)" | "(`ops.mjs` deleted at T19's layer 11)" |
| control-plane.md:91 (Uses, instance-setup) | "while `dispatch.mjs`' `Store` still wraps `legacy-store`'s class" | drop the clause: "…(N348; `plane` R1 since T19's layer-11 fold)." |
| control-plane.md:94 (Uses) | "`legacy-checks`: the rows of R32 … none after T19's layer 11." | delete the line (rule 1: every Uses line naming `legacy-checks` goes) |
| control-plane.md:96 (Uses) | "`legacy-store`: its store routes and class until …" | delete the line (`plane` holds the class, R1; R26 already says `plane` calls `dispatch`) |
| control-plane.md:138 (Notes) | "`from`: `legacy-index`, `legacy-store` … `legacy-checks`" | optional: "`from` (dropped at T20's opening, rule 1): …" |

None of observation-log, inquiry, basis-versions or run-productions has a Uses line naming a legacy module any more, and none names `held.mjs`.

## 4. Line numbers in the six STARTs

Every cited line was re-read on `tranche/T20` @ dc557383d1 and matches: `held.mjs` :25–:27, :29–:63, :64–:72, :65, :66–:70, :76, :78–:80, :85–:86, :96, :98, :116–:124, :117, :128, :134–:135, :140, :141–:143, :153–:159, :161–:202, :170–:172, :184, :189–:191, :200; `plane/store.mjs` :56, :61–:65, :79, :106, :129; `ai-runs/index.mjs` :121, :131; `record-core/index.mjs` :924, :976; `run-productions/index.mjs` :824; `held.test.mjs` :95, :115, :129–:135; `inquiry/grammar.mjs` :9, :20; `inquiry/grammar.test.mjs` :198; `promotion/index.mjs` :845–:846; `control-plane/families.mjs` :92–:94, :133; `families.test.mjs` :107; `control-plane/index.mjs` :11, :378–:386 (`installationRow` itself at :380), :417–:422; instance-setup tests :19, :158, :132, :17; `write-path.test.mjs` :18. `wrangler.jsonc`'s `main` already names `src/plane/index.mjs`.

Discrepancies found elsewhere, for BOB:
1. **retrieval R55** says the leg-grade resolver is "registered once at start by `strength` (K75 (2))"; the only registrant is `held.mjs`:150 (`plane-held`), and plane's START registers it as `inquiry`. R55 needs re-wording (to `inquiry`, through `plane`) before L11; retrieval has no T20 job.
2. **`held.mjs`' header** (:1–:5) still says each owner "registers its share under its own name … and deletes it here", superseded by K861 (1); plane's own job rewrites or deletes it.
3. `current.md` "Added at T19 layer 10's close" still gives observation-log `observationsNonLead` and owners registering their shares; superseded by "Roster after K861" (already says so; no fix needed if the section stays as history).
