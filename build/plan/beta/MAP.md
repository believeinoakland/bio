# The beta's design map

**Status** · Kept by BOB (LANES.md §1); read by every lane at takeover and each entry. One row per capability or workstream; a lane's need from another lane is a row in §2 until it is met.

## 1. Workstreams

| workstream | owner | state | open with Bob | drafts READY |
|---|---|---|---|---|
| AI provider selection; the assistant whole (N1220) | AI-DESIGN | starting (A41's decisions to record) | none known | none |
| Service levels (K4746); performance and responsiveness; record placement and region picker (N1271, N1273, N1274, N1264, K4599) | PLATFORM | starting | none known | none |
| Deferred features: registers (N1259), following the trail (N1260), places in layers (N1257), email capture (N824) and the rest of `next.md` | CAPABILITIES | starting | N1259's open points (K4403), N1269, N1272 | none |
| File types and sizes (N1266, N1267, N1267a), acceptance corpus (N1268) | FILES | starting | N1266's study (K4632) | none |
| The alpha's defects found whole; T52's carried entries confirmed | JOURNEYS | starting | none | none |
| Tests rethink, option A | TESTS-SWEEP | starting | none | n/a (merged by BOB) |
| Requirement lines, architecture changes and T53's plan | PLANNING | starting (reads as drafts arrive) | none | n/a |
| Screens and words for all of the above | UX-DESIGN | running (#43) | A1-A8 | n/a |

## 2. Needs between lanes

| from | to | need | state |
|---|---|---|---|
| AI-DESIGN | UX-DESIGN | A41's `UX-REQUIREMENTS.md` (the assistant's screen needs) | to send (BOB) |
| every lane | PLATFORM | a time budget for each screen and op it adds | open |
| CAPABILITIES, FILES | PLATFORM | the record size and load each capability adds at each service level | open |
