# standards (T33)

**Status** · session_01K6bPyjeg2L6kvnBumSsfb9 · depth 2 · COMPLETE · handled B3

## J1 · QUESTION

Three points; I carry on with each on the reading stated.

(1) **`uses` in `modules.json`.** standards' row still lists record-grammar, jurisdictions, record-core, membership, promotion, content. T33-31 imports civil-time (`validAt`), connection-grammar (`registerOwner`, `derivedId`, `BOUNDS`, `ownerConformance`), extraction (the `reading_refs` read contract, R58), acquisition (`citationLookup`) and id-spaces (`recogniseCitations`). My reading: the architecture check stays red on those edges until you set the row; I name the final list in COMPLETE (K1505 (7)). `entities` is not needed by any requirement I build (R18's issuer-as-entity is optional and nothing in R18–R30 states a read of it), so I do not add it; `events` see (2). Please set the row when convenient (or say you set it at merge).

(2) **`events` is not built yet** (EVENTS #1 just started). R19/R20/R28 read an event's `when`. A static import of `../events/index.mjs` would break standards' load until events merges. My reading: standards takes events as a provider, `deps.events` with `readEvent({eventId, viewer})` (events R26, `when` per R9/R10), and `standardsOf` reaches `eventsOf(host)` lazily only when the plane passes nothing; until a provider is present an event bound or an event node answers `undetermined` ("the events module is not wired here"), never a default. My tests drive a provider the test controls, as content's tests drive extraction. If you prefer the static import at merge (after events), send a CHANGE and I wire it then.

(3) **BOB's details I am taking unless you say otherwise** (P17, for `build/rulings.md`):
- Law-relation, court-link and treatment rows are not record documents and get no `ID_TABLE` prefix: each id is `lrel-`/`clink-`/`ctreat-` + 24 hex of a SHA-256 over the row's fields and instant (no new prefix needed in record-grammar, P8).
- Connection kinds (KIND_TAKEN, K1521): `law_amends`, `law_repeals`, `law_renumbers`, `law_recodifies`, `law_refers_to`, `law_defines`, `law_excepts`, `law_implements`, `court_interprets`, `court_applies`, `court_holds_invalid` (evidentiary), `in_force_at_event` (derived). A relation's `valid` is its `from` standard's period, its start replaced by the relation's effective date when given; the derived item's `valid` is the event's `when` (its day range), `as_of` that day, `method` naming R20.
- Grades of an evidentiary item: `assertion` the cited passage's transcription ceiling (`content.standings`), else D with why; each end the weakest ceiling over that standard's text, else D. Sight: an item is returned only when the viewer may see its citation's document (the fence the battery needs); standards themselves stay group-wide.
- New refusal rows C-112.21 onward for R18–R27's codes, `awaiting stamp` (promotion's stamp is T34's).

## J2 · REPORT

Status: every T33-31 entry is built and tested (47/47 standards tests; format, architecture, coverage 30/30, ownership 0 failures). Waiting only on EVENTS #1's merge to re-point R19/R20/R28 at `eventsOf(host)` (B2 (2)), then COMPLETE.

Found in other modules, for routing (none is mine to change):
1. **affordances** (L11): standards' op map gains 11 ops for T33-31 (acts `lawrelate`, `lawwithdraw`, `lawpropose`, `courtlink`, `courttreat`; reads `inforceat`, `standardsfor`, `lawrelations`, `lawaddresses`, `stillstanding`, `citationresolve`). `test/m/affordances/catalogue.test.mjs` "R3 R7 R12: layer 9's 41 mutating ops … the op maps hold exactly those 62 ops" now fails (it holds standards' map to its pre-T33 set). Red on my branch only; it clears when affordances' T33 job grades the new ops (its R40) and op-declarations (T33-88) declares them. Please name it an accepted red at standards' merge, or tell me to hold the ops back.
2. **plane** (`src/plane/store.mjs`): `standardsOf(ctx)` should be given `events` (once events merges I default to `eventsOf(host)` myself, B2) and `keyedStore` (the `{credentials, env, governor}` store `acquisition.citationLookup` reads the group's key through, R25); without `keyedStore` the lookup answers that it is off, never fails.
3. **generated artifact**: `bio-plane/dist/bio-plane.bundled.mjs` (and `.bundle.json`) is stale against standards' source (manifest §14; BOB regenerates at the layer close).
4. **record-grammar**: `PROPOSAL_STATES` has no subject for a law relation, court link or treatment; `lawPropose` labels with `proposalLabel(proposer, "standard")` (its by, state and machine_work) and states its own sentence. A `law_relation` subject would be record-grammar's next job's (not needed for T33).
5. **row census** (promotion R50): C-112.21–C-112.32 are new rows, awaiting stamp (T34).

One reading departs from J1 (3), BOB's detail: the derived "in force at an event's date" item's `valid` is the standard's period (relation- and event-bounded), not the event's day range, because `connection-grammar` R6 filters every item by `validAt(valid, at)`; with the event's day as `valid`, a walk at any other date would drop it and an undetermined in-force answer could not be marked. `as_of` is the event's day and `in_force` carries R20's state and why at that day. Also `lawPropose` ids are `lprop-` + 24 hex, as the other rows.
