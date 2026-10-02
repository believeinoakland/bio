# Plan T27

**Status** · OPEN · BOB #103 · session_01BaZjVu3eHvWLLU4C5CdGA7 · depth 1

**Jobs** · signatures: SIGNATURES #6 session_01N3t7Hfj37rLM9MSN2KgSNZ; membership: MEMBERSHIP #20 session_013WoUArmhh78ngbjAEuCSMa; reevaluation: REEVALUATION #14 session_01KA6UG6rXYyJAWoe5sPuf8x; docket: DOCKET #1 session_01PJ5cMH43RbHxx4SXkb3E7X; publication: PUBLICATION #15 session_01PBj2Sb1NuqAgKWDSQUEqiZ; public-read: PUBLIC-READ #8 session_01RxP8D4FZ4YPUucNfhaQQx2; network-notices: NETWORK-NOTICES #4 session_01MRJKiiGZ1Mddztgdog1A5d; action-grammar: ACTION-GRAMMAR #5 session_01U9Fumb6uphtpXWNehTqT13

**Opened** 2026-10-02 ~22:30 UTC by BOB #103 from `main` @ 09fddd6535 (T26 closed, K1249; Bob's permission edits, K1261), from T26's `next.md` (K1262). **Bob's weekly meter** · 72% after T26's close (K1250); asked again at the opening.

## Legacy census (§5.2 (2))

| legacy module (`modules.json`) | in T27 | entry or hard reason |
|---|---|---|
| **legacy-ui** (`civicos-ui/`) | stays | Bob's: UX (K633; manifest "Parallel work"). Its shares (the hold strip, the release form, the hold form's project picker, the docket's screens) wait on the UX stream. |

No other module is marked `legacy`; no extraction is open.

## Rules at the opening

T26's rules hold (merge early; one file, one editor; marks struck at the merge; no layer closes red except by name; owners export, the plane composes; the UX stream's DECs cited, never minted; a job re-scans its own module for the N502/N508 kind and re-words what it finds). Requirements were folded at the opening (K1262): N518 (`prep/T27-n518`), N520's DEC-116 share (`prep/T27-n520`, and `plan/t27-dec116-shared.md` folded by BOB).

**Within a layer, a new or changed provided service is merged first** (§4): in L8, `docket` merges before `public-read` and `network-notices`, which then merge the tranche branch and build against it; in L9, `action-grammar` before `actions`; in L11, in the order `affordances`, `queue-producers`, `queue`, `op-declarations`, `control-plane`, `plane` (`plane` composes everything and merges last).

**Accepted reds, by name, at the opening:**
1. Coverage: every id marked `*(not yet met: T27)*` with no test yet (actions R57–R60, affordances R33, control-plane R46, docket R1–R22, op-declarations R13, queue-producers R29–R31, queue R50, signatures R39, R40), until its module's merge.
2. `bio-plane/test/system/row-census.test.mjs`: the catalogue rows T27's jobs add (C-117.23–.25, C-69.5, and `docket`'s, `public-read`'s and `signatures`' new rows) read `awaiting stamp` until T28's promotion stamp (S4, `next.md`), promotion's L2 job having run before they exist (P8, P10), as T25's red 6.
3. The UI's DEC-88 tests (N487, K1030): stay red, Bob's.
4. `bio-plane/test/m/control-plane/` R22: `CHECK_FAMILIES` does not reach `docket`'s `DOCKET_CHECKS` (found by PUBLIC-READ #8 at L8), until control-plane's L11 merge (K1280).

## Roster (by layer; 17 jobs)

**L1** · signatures: N520 (R1, R39, R40).
**L2** · membership: N520 (`MODULE_ORDER` re-pinned with `docket`, its R83).
**L7** · reevaluation: N520 (R8, R16, R30).
**L8** (merge order: docket first) · docket: N520 (new module, R1–R22; the job creates `bio-plane/src/docket/` and `bio-plane/test/m/docket/` and BOB adds them to its `paths` and `tests` at the merge). · publication: N520 (R40). · public-read: N520 (R10, R16, R20, R21). · network-notices: N520 (R21).
**L9** (merge order: action-grammar first) · action-grammar: N518 (R9: C-117.23–.25). · actions: N518 (R36, R52, R56–R60).
**L11** (merge order above) · affordances: N518 (R33), N520 (R34). · queue-producers: N518 (R8, R19, R29), N520 (R8, R30, R31). · queue: N518 (R1, R12), N520 (R1, R50). · op-declarations: N518 (R12), N520 (R13). · control-plane: N518 (R46, R47), N520 (R48). · plane: N518 (R14), N520 (R15).

## Entries

- N518 · 2026-10-02 · **DEC-113's server side** (K1251, K1134 Q4 decided by BOB): fold `plan/draft-T24-dec113-115.md` into the owning modules' requirements: the hold's project list, its release (`actionholdrelease`, rung `terminal`, K1134 (3)), the "is this project held?" answer, and the operator's wipe refused during a hold. The device side waits for a device-storage module, named when it is built (dependency not yet built); transcript retention is Bob's then (DEC-61). Q5 ruled by Bob (K1252): the hold also refuses every purge of held material, a single item included; an ordered removal goes through the hold's release. **Ready for T27.** **Folded** (K1262): actions R36, R52, R56–R60; action-grammar R9; control-plane R46, R47; plane R14; op-declarations R12; affordances R33; queue-producers R8, R19, R29; queue R1, R12.

- N520 · 2026-10-02 · **DEC-112 and DEC-116's new modules** (K1256): fold `plan/draft-T24-dec112.md` and `draft-T24-dec116.md` into requirements, with K1134 (1)–(6)'s readings, K1254 (DEC-112 (5)) and the new modules in `modules.json` and `layers.md`: `docket` (L8, directly after publication: DEC-116's signed docket, shelves, To-dos, outside responses, standing, withdrawal), `case-checker` (L8, directly after ratification: the standalone open checker, built from the same check code), `case-import` (L8, directly after case-checker: import into a read-only project, recreation, acceptance per DEC-96). DEC-116's share can open in T27; DEC-112's waits on K1254 (a), (b) (Bob's). **This tranche: DEC-116's share** (with DEC-100; answers N470 and N491; H5), folded (K1262): the new module `docket` (L8, after publication) R1–R22; signatures R1, R39, R40; membership R83 (re-pin); reevaluation R8, R16, R30; publication R40; public-read R10, R16, R20, R21; network-notices R21; queue R1, R50; plane R15; queue-producers R8, R30, R31; op-declarations R13; affordances R34; control-plane R48. DEC-112's share is left out (below).

## Watched for size (P6, K617)

No T27 job is expected to take a module past ~4,000 lines (the fold workers' estimates: docket new at ~1,600–2,400; public-read, reevaluation and queue-producers ~+150 each; the rest under +50). ratification 3,979 and inquiry 3,888 are untouched. Each job measures its module at completion.

## Left out of T27 (one hard reason each; carried to `next.md`)

- N519 (DEC-112 (5) as K1254 amends it) and N520's DEC-112 share (`case-checker`, `case-import`): Bob's, K1254 (a) and (b) unanswered, and what the published case carries decides both modules (P17).
- N518's device half (the transcript store's hold check): dependency not yet built (no device-storage module).

| row | item | hard reason | note |
|---|---|---|---|
| B1 | DIST-14 (office-readers) | deployment | CSV bound measured on a deployed plane |
| B2 | N75 (image-codecs) | deployment | 61.3 MB bound |
| B3 | N34 (pdf-worker) | deployment | JPX bound; JBIG2 fixture encoder; 4,277 lines (P6) |
| B11, C9 | N461 release share; N471's release copies | deployment | the next signed release, Bob's act |
| B16 | N473 (`filing_templates` table) | deployment | migration run at every instance |
| C1 | office-readers R28/R29 retired | deployment | migrations at every instance |
| C2 | `MODES.plan` deployed | deployment | K660 (5) |
| C3 | newgroup installer deployed, N336 | deployment | a signed release |
| C4, A11–A17 | contradiction R24, R27, R32, R33/R36 K5 arms, R34, R41, R57 | measurement | a measured recommender run (K488) |
| C8 | first profile's facts without a source | measurement | K925, K934, K941 |
| B4, B5 | N144, N232 | Bob's (UX) | K899 (2) |
| A54 | skills R10 | Bob's | N144 |
| B6–B10, B12, B18, B20, C6, C7, D2, I2 | legacy-ui shares, UI fixtures, the module | Bob's (UX) | K633, K1006 |
| N487 | legacy-ui DEC-88 reasons | Bob's (UX) | K633, K1030 |
| J7 | DEC-81's Grade A | Bob's | K1019: "nothing new" |
| H13 | DEC-105 audience guidance | Bob's | waits for its trigger |
| C5 | `PLN-` affordances, plan page, joint action | Bob's | K608 (4), K600 (c) |
| H3, H4, H9b, H11, H14, H16c, H18, H20, J6, J11 | DEC screens of the new interface | Bob's (UX) | K633, K899 (2) |
| N481 | DEC-112 published case in three forms | Bob's | on `main` (PR #7); K1134 Q2, Q3, Q6 unanswered |
| H1, H6b, J4 | DEC-96, DEC-101 (3), DEC-92 | dependency not yet built | nothing brings another group's edition into this copy |
| A8 | bias R26 | dependency not yet built | K102's trigger |
| A21 | inquiry R31 | dependency not yet built | no opinion element (MK-5) |
| A22, A23 | installer R13, R24 | dependency not yet built | the new member surfaces |
| A37 | progressions R32 | dependency not yet built | no amounts or funds as values |
| A41 | publication R30 | dependency not yet built | nothing publishes a rendering (D-246) |
| N493 (part) | member-facing translations of "noticed" (contradiction `checks.mjs`:136, :236; queue `checks.mjs`:63) | Bob's: UX (the design stream's DECs decide member-facing wording) | by BOB #93, K1099 |

