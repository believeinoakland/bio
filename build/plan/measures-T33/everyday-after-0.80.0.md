# Everyday response times on biosmoke7, after: 0.80.0 (K1707's method, 20 calls each)

Taken 2026-10-06 ~14:15 UTC by BOB #122, minutes after the deploy (K1716–K1717), same client, ops and ids as `everyday-baseline-0.79.0.md`, 0.5 s apart, member bearer with no member behind it. ms; p95 = the 19th of 20.

| # | op | before median (0.79.0) | after median | after p95 | after max | after bytes (before) |
|---|---|---:|---:|---:|---:|---:|
| 1 | `/version` | 118 | 132 | 158 | 1,317 (first call) | 7 (7) |
| 2 | `whoami` | 123 | 142 | 176 | 183 | 494 (472) |
| 3 | `queue&limit=500` | 163 | **226** | 375 | 381 | **58,361 (8,736)** |
| 4 | `list` | 154 | 172 | 218 | 253 | 21,132 (21,132) |
| 5 | `image` PROB-…-0001 | 162 | 170 | 200 | 394 | 14,193 (14,155) |
| 6 | `projection` PROJ-…-0001 | 152 | 164 | 194 | 1,198 | 2,697 (2,697) |
| 7 | `image` INFO-…-0001 | 207 | 206 | 253 | 269 | 214,867 (186,605) |
| 8 | `search&q=sewer` | 166 | 194 | 303 | 343 | 31,595 (31,464) |
| 9 | `memberlist` | 167 | 144 | 212 | 220 | 1,676 (1,412) |
| 10 | `affordances` | 127 | **219** | 271 | 429 | **232,614 (17,799)** |
| 11 | `tasks&status=resolved` | 147 | 156 | 178 | 198 | 226 (225) |
| 12 | `entitybyalias&alias=Oakland` | 161 | 154 | 379 | 450 | 168 (168) |

**Reading.** The floor (`/version`) moved +14 ms, network noise from this client; most reads moved within it. Two moved beyond it, each with its answer's size: `affordances` +92 ms (its catalogue grew 13×, T33's graded vocabularies, AFFORDANCES #20, K1686) and `queue` +63 ms (its answer grew 6.7×: the monitoring items now listed for this bearer). Both stay near a quarter of a second. K1432 sets no numeric budget yet, so nothing is judged here; the two growths are N630's.
