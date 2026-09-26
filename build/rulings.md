# Rulings

**Status** · Every ruling, one line each (PROCESS-MECHANICS §9; P15): `K<n> · date · module or layer · the ruling · why`. A ruling is changed only by a new line naming its evidence and the one it replaces. Where a ruling has a fuller home, the line names it. Started by BOB #38, 2026-09-26, from the rulings made during the transition.

- K1 · 2026-09-25 · all · No jurisdiction in the product: local facts are data in jurisdiction profiles held by `jurisdictions`; outward text names CivicOS and the group · Bob's concern that Oakland references tell other groups CivicOS is not for them (`layers.md`, "No jurisdiction in the product")
- K2 · 2026-09-25 · all · No module size limit; size is a watched metric, reported near 4,000 lines · Bob (`layers.md`, rulings on the draft, 1)
- K3 · 2026-09-25 · all · Ops move with their construct at extraction; `control-plane` keeps routing, authentication and the response envelope · Bob (ibid., 2)
- K4 · 2026-09-25 · all · Each module owns its tables; `schema.mjs` is divided at extraction · Bob (ibid., 3)
- K5 · 2026-09-25 · legacy-ui · The UI is a placeholder worked on elsewhere; no tranche plans work on it · Bob (ibid., 4)
- K6 · 2026-09-25 · all · Every check in `bio-checks.mjs` moves into one module as an invariant with its own id and test; none is dropped without a ruling · Bob ("very important to keep")
- K7 · 2026-09-25 · layer 7 · Understanding (intent, reevaluation) is a layer; Discovery is a candidate beyond MVP · Bob (`layers.md`, layer 7)
- K8 · 2026-09-25 · requirements · The conventions of `build/requirements/README.md` govern every requirements file · Bob delegated their organisation to BOB (BOB #37)
- K9 · 2026-09-25 · signatures · The signing page's source and generator move into `signatures` (entry N7) · BOB #37, so the module's tests can check the page it serves
- K10 · 2026-09-25 · promotion · Check C-18.8 moves to `promotion` and verifies through `signatures`; the duplicate verifier retires (N8) · BOB #37
- K11 · 2026-09-26 · layer 9 · The Action layer (standards, conformance, consequences, actions, filings, escalation) sits between Publication and Operations · Bob (`layers.md`, layer 9)
- K12 · 2026-09-26 · consequences · Consequences are computed from the record where possible, otherwise undetermined and settled by members from the record and their own assessment; significance is the members' judgment · Bob (ibid.)
- K13 · 2026-09-26 · filings · Tier 3 gets a counsel packet for named counsel, never published or fileable as it stands · Bob; amends Design Requirement 8
- K14 · 2026-09-26 · escalation · Stage 7, political accountability; policy advocacy and candidate support stay out; Operational Principle 1 stands · Bob; amends Design Requirement 7
- K15 · 2026-09-26 · jurisdictions · The profile carries the action sections (R23–R30), built with the module (N11) · Bob: no reason to defer
- K16 · 2026-09-26 · process · P17: Bob decides policy and doctrine, requirements, architecture and UX; every lower-level decision is BOB's, recorded and reported · Bob (`civicos-process/PROCESS-DESIGN.md`, P17)
- K17 · 2026-09-26 · all · Helper modules `test-support` and `bundler` (layer 1) and legacy module `legacy-tests` (last) added; the uses the code already had declared; `skills` follows `ai-runs` · BOB #38 under P17, from the architecture check's first run (`layers.md`, "Helper modules")
- K18 · 2026-09-26 · checks · Owner of a file is the module with the most specific matching path; a requirement id is defined where written in bold `**Rn**`; a relative import naming no tracked file is counted, not judged · BOB #38 (`civicos-process/checks/README.md`)
- K19 · 2026-09-26 · process · The full regression runs only by hand, at a release or when Bob asks; nothing runs on a push to `main` · P11; Bob asked that the old push-to-main gate go
- K20 · 2026-09-26 · requirements · Requirements of a helper or legacy module are technical detail and BOB's under P17; requirements of a product module are Bob's · BOB #38's reading of P17
- K21 · 2026-09-26 · process · Outside a tranche, BOB commits the build state to `main` directly; while a tranche runs, `main` does not change and BOB writes on the tranche branch · P12 and mechanics §4
