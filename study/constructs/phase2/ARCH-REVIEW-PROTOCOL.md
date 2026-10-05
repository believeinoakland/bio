# Architecture review protocol, phase 3 (R-3) of the second study (BOB #112, 2026-10-05; K1460)

You review the architecture as one system, after the three construct studies and the integration study are written. Bob: "The architecture should be load-bearing and based on best practices with all system requirements given proper consideration," and it must reflect "how the set of constructs fit together and will interact."

## Read first, whole (READING-PROTOCOL.md's method)
`constructs-brief.md`; `studies/INTEGRATION.md`; `studies/PEOPLE.md`, `studies/EVENTS.md`, `studies/MONEY.md`; `../synthesis/constructs.md` (the first study's architecture); `src/BIO_Design_Requirements_v2.txt`; `src/BIO_Technical_Architecture_Decisions_v10.txt`; `build/layers.md` and `build/modules.json` under /home/user/bio (read-only).

## Check, against cited best practice (search and cite: domain-driven design and bounded contexts, temporal and bitemporal data modelling, entity resolution, event and ledger modelling, provenance (W3C PROV), identifiers and linked data, the standards the studies adopt)
1. **One home per fact:** list every object and the construct and module that owns it; flag any fact with two homes or none.
2. **Interactions:** for each pair of constructs, the reads and writes between them; flag cycles against the total order (P4), and any interaction a study assumed but no module provides.
3. **Load-bearing:** walk three worked cases end to end through the proposed modules (the founding case's sewer-fund transfers over nine fiscal years; an official's career meeting a contract's award, change orders and payments, with a family tie; a court order's paragraphs tracked as duties through events and payments). Where does the design need rework to reach L5? At what volumes does it break (records per instance, Durable Object storage, request limits)?
4. **System requirements:** each of the fifteen Design Requirements, the mission's operational principles, the runtime and TAD constraints, everyday-path performance, security, privacy and safety, sovereignty, reproducibility, publication, module size and order, testability: met, strained (how contained), or broken.
5. **Simplicity:** anything that could be one module or one model instead of two; anything over-built for its rung.

## Write `reviews/R-3.md`
`## One home per fact`, `## Interactions`, `## Load-bearing (worked cases)`, `## System requirements`, `## Simplicity`, `## Best practice` (what the design follows and where it departs, cited), then `## Verdict`: sound / sound with the corrections listed / unsound, and the five corrections that matter most.

Checkpoint: save after each section; resume if the file exists. Read-only outside this study folder. Return a 15-line summary. If your file write is refused, return the full text instead.
