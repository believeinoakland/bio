# standards (T33)

**Status** · session_01K6bPyjeg2L6kvnBumSsfb9 · depth 2 · WORKING · handled B2

## J1 · QUESTION

Three points; I carry on with each on the reading stated.

(1) **`uses` in `modules.json`.** standards' row still lists record-grammar, jurisdictions, record-core, membership, promotion, content. T33-31 imports civil-time (`validAt`), connection-grammar (`registerOwner`, `derivedId`, `BOUNDS`, `ownerConformance`), extraction (the `reading_refs` read contract, R58), acquisition (`citationLookup`) and id-spaces (`recogniseCitations`). My reading: the architecture check stays red on those edges until you set the row; I name the final list in COMPLETE (K1505 (7)). `entities` is not needed by any requirement I build (R18's issuer-as-entity is optional and nothing in R18–R30 states a read of it), so I do not add it; `events` see (2). Please set the row when convenient (or say you set it at merge).

(2) **`events` is not built yet** (EVENTS #1 just started). R19/R20/R28 read an event's `when`. A static import of `../events/index.mjs` would break standards' load until events merges. My reading: standards takes events as a provider, `deps.events` with `readEvent({eventId, viewer})` (events R26, `when` per R9/R10), and `standardsOf` reaches `eventsOf(host)` lazily only when the plane passes nothing; until a provider is present an event bound or an event node answers `undetermined` ("the events module is not wired here"), never a default. My tests drive a provider the test controls, as content's tests drive extraction. If you prefer the static import at merge (after events), send a CHANGE and I wire it then.

(3) **BOB's details I am taking unless you say otherwise** (P17, for `build/rulings.md`):
- Law-relation, court-link and treatment rows are not record documents and get no `ID_TABLE` prefix: each id is `lrel-`/`clink-`/`ctreat-` + 24 hex of a SHA-256 over the row's fields and instant (no new prefix needed in record-grammar, P8).
- Connection kinds (KIND_TAKEN, K1521): `law_amends`, `law_repeals`, `law_renumbers`, `law_recodifies`, `law_refers_to`, `law_defines`, `law_excepts`, `law_implements`, `court_interprets`, `court_applies`, `court_holds_invalid` (evidentiary), `in_force_at_event` (derived). A relation's `valid` is its `from` standard's period, its start replaced by the relation's effective date when given; the derived item's `valid` is the event's `when` (its day range), `as_of` that day, `method` naming R20.
- Grades of an evidentiary item: `assertion` the cited passage's transcription ceiling (`content.standings`), else D with why; each end the weakest ceiling over that standard's text, else D. Sight: an item is returned only when the viewer may see its citation's document (the fence the battery needs); standards themselves stay group-wide.
- New refusal rows C-112.21 onward for R18–R27's codes, `awaiting stamp` (promotion's stamp is T34's).
