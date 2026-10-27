# The beta's design map

**Status** · Kept by BOB (LANES.md §1); read by every lane at takeover and each entry. One row per capability or workstream; a lane's need from another lane is a row in §2 until it is met.

## 1. Workstreams

| workstream | owner | state | open with Bob | drafts READY |
|---|---|---|---|---|
| AI provider selection; the assistant whole (N1220) | AI-DESIGN | drafting module requirements (A42's lines recorded, K5428-K5433) | none | none |
| Service levels (K4746); performance and responsiveness; record placement and region picker (N1271, N1273, N1274, N1264, K4599) | PLATFORM | drafting (P-1) | P1-P4 on QUESTIONS.html | time budgets, combined read and fold, load test |
| Deferred features: registers (N1259), following the trail (N1260), places in layers (N1257), email capture (N824) and the rest of `next.md` | CAPABILITIES | READY (C35; every question answered, K5543 closed a2 R135) | N1259's open points (K4403), N1269, N1272: to come | none |
| File types and sizes (N1266, N1267, N1267a), acceptance corpus (N1268) | FILES | finalizing the type table (F1-F3 answered, K5435-K5437; text 100 MB, K5427) | none | none |
| The alpha's defects found whole; T52's carried entries confirmed | JOURNEYS | walking 91 screens (W5: 77 of 96 carried defects stand) | none | none |
| Tests rethink, option A | TESTS-SWEEP | census done (S2); converting class A | none | n/a (merged by BOB) |
| Requirement lines, architecture changes and T53's plan | PLANNING | STRUCTURE.md (L1; its Q1-Q4 answered, K5434) | none | n/a |
| Screens and words for all of the above | UX-DESIGN | running (#43); A1-A8 answered (DEC-457 to DEC-464) | none | n/a |

## 2. Needs between lanes

| from | to | need | state |
|---|---|---|---|
| AI-DESIGN | UX-DESIGN | A41's `UX-REQUIREMENTS.md` (the assistant's screen needs) | sent, B554 |
| every lane | PLATFORM | a time budget for each screen and op it adds | open |
| CAPABILITIES, FILES | PLATFORM | the record size and load each capability adds at each service level | open |
| PLATFORM | FILES | per-image time of DEC-460's photo redraw; per-type load of Tier 2 (K5435) and held types (K5436) | open |
| FILES | UX-DESIGN | the held-and-named sentence, "macros not run", the type list before upload | open (via BOB) |
