# Plan: next (T28)

**Status** · Entries for the tranche after T27, written as T27 runs (P18). Started at T27's opening by BOB #103, 2026-10-02 (K1262).

## Entries

- S4 · 2026-10-02 · **promotion**: stamp the catalogue rows T27's L8–L11 jobs add (C-117.23–.25, C-69.5, and `docket`'s, `public-read`'s and `signatures`' new rows, as their T27 records name them); `CATALOG_VERSION` MINOR; `ROW_CENSUS` re-pinned (R50). **Why next:** promotion is L2, before the rows exist (P8, P10). Clears T27's red 2.

- N519 · 2026-10-02 · **DEC-112 (5) as K1254 amends it** (Bob): fold into the case's requirements (case-authoring's `publishCase`, case-grammar's `materials:` block, publication): no load-bearing member may rest on material whose only attestation is an off-the-record (anonymous) source; publishing such a case is refused, naming the member; off-the-record material never travels in the published case (it stays in the project as a lead); `draft-T24-dec112.md` R45's "the project's and the group's" attestations are dropped (K1134 Q6 withdrawn). **Ready for T28** (K1263: Bob ruled K1254 (a) and (b) as recommended; drafted in `plan/draft-T28-dec112.md`). Was: two follow-ups Bob's (K1254 (a), (b)), and the DEC-112 fold also waits on K1134 Q1–Q3 (P17).

- N520 (DEC-112 share) · 2026-10-02 · **`case-checker` and `case-import`** (K1256): fold `plan/draft-T24-dec112.md` with K1134's readings and K1254 into requirements; add both modules to `modules.json` and `layers.md` (L8: case-checker directly after ratification, case-import directly after it). **Ready for T28** (K1263; drafted in `plan/draft-T28-dec112.md`). DEC-116's share is in T27.

- N521 · 2026-10-02 · **DEC-113's device half** (N518's remainder): the device transcript store's check for a hold before either scheduled deletion, failing closed, reading `actions` R58; the time limit (DEC-61's TTL) is Bob's then. **Hard reason:** dependency not yet built (no device-storage module).

## Carried from T27

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
| A54 | skills R10 | Bob's (UX): ruled, waits on the new interface | K899 (2), with N144 |
| B6–B10, B12, B18, B20, C6, C7, D2, I2 | legacy-ui shares, UI fixtures, the module | Bob's (UX) | K633, K1006 |
| N487 | legacy-ui DEC-88 reasons | Bob's (UX) | K633, K1030 |
| J7 | DEC-81's Grade A (and its three decisions) | trigger: DEC-81 (4) defers Grade A until a case is challenged on authenticity, a group needs legal-grade evidence, "self-attested only" becomes material, or Bob asks | nothing to ask Bob (K1267) |
| H13 | DEC-105 audience guidance | trigger (a group asks, or a case is challenged) | DEC-105 defers it; nothing to ask Bob (K1266) |
| C5 | `PLN-` affordances, plan page, joint action | Bob's (UX) for the plan page (approved, K608 (4)); trigger for joint action (a coalition asks, K600 (c)) | nothing to ask Bob (K1266) |
| H3, H4, H9b, H11, H14, H16c, H18, H20, J6, J11 | DEC screens of the new interface | Bob's (UX) | K633, K899 (2) |
| H1, H6b, J4 | DEC-96, DEC-101 (3), DEC-92 | dependency not yet built | nothing brings another group's edition into this copy |
| A8 | bias R26 | dependency not yet built | K102's trigger |
| A21 | inquiry R31 | dependency not yet built | no opinion element (MK-5) |
| A22, A23 | installer R13, R24 | dependency not yet built | the new member surfaces |
| A37 | progressions R32 | dependency not yet built | no amounts or funds as values |
| A41 | publication R30 | dependency not yet built | nothing publishes a rendering (D-246) |
| N493 (part) | member-facing translations of "noticed" (contradiction `checks.mjs`:136, :236; queue `checks.mjs`:63) | Bob's: UX (the design stream's DECs decide member-facing wording) | by BOB #93, K1099 |

| T27-1 | a docket-signing step in the member interface (signatures J1: the signer page signs docket entries; `civicos-ui` signs nothing) | Bob's (UX) | K633; legacy-ui |
