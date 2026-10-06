# T33 measures: everyday response budgets, the "before" baseline on 0.79.0 (K1432, G9)

Taken **2026-10-06, 11:56:03Z–11:57:25Z UTC**, by a worker for BOB #122 on `tranche/T33`, against `biosmoke7` (`https://biosmoke7.believeinoakland.workers.dev`). `GET /version` answered **`0.79.0`** before and after the run. The "after" reading on 0.80.0 should repeat this file's op list, ids and method exactly.

## Method

- Client: `curl -sS -o /dev/null -w '%{time_total} %{http_code} %{size_download}'`, run from the cloud session through its egress proxy. Times are wall-clock at the client, so they include the proxy hop and the network as well as the Worker and the Durable Object.
- Each op was called **10 times in sequence**, with a 0.5 s pause between calls. The ops ran one after another in the order shown below. One connection was kept per call, and only the first call (`/version`) paid for the TLS handshake.
- Credential: the instance's member bearer (`token=<member token>`, class `member`, `session: false`). It is the same credential M-166, M-170 and M-174 used. Its value is not recorded anywhere. Every op except `/version` named `store=bio`.
- Statistics: the median is the mean of the 5th and 6th values. The p95 is nearest-rank, so with n = 10 **p95 equals the max**. A later run should take n ≥ 20 if it needs p95 to differ from the max.
- Read-only: every op is declared `mutating: false` in the 0.79.0 source (`bio-plane/src/index.mjs` at `9080f77855`, the 0.79.0 cut), and every call was a GET. No op that writes, runs AI, deploys or changes settings was called.

## The ops and why each is everyday

Each "everyday" reason is taken from what `civicos-ui/app.html` calls on a member's ordinary path, and the ids are real bundles on `biosmoke7`. URL shape: `/api/?<op params>&store=bio&token=<member token>`.

| # | Op (URL params) | Why everyday |
|---|---|---|
| 1 | `GET /version` (no op, no token) | Asked after every update; the cheapest call the Worker answers, which makes it the floor |
| 2 | `op=whoami` | Loaded by every session when the app opens (`recR("whoami")`) |
| 3 | `op=queue&limit=500` | The member's home queue (`QUEUE_LIMIT = 500`), "the one surface every member opens by habit" |
| 4 | `op=list` | The record list behind the app's case and question lists (31 bundles) |
| 5 | `op=image&id=PROB-2026-0001-sewer-franchise-diversion` | A question/case page: the inquiry as authored |
| 6 | `op=projection&id=PROJ-2026-0001-sewer-franchise-diversion` | A case (project) page header |
| 7 | `op=image&id=INFO-2026-0001-sewer-transfer-series` | A document read: the largest everyday answer here (≈187 KB) |
| 8 | `op=search&q=sewer&limit=500` | Search as the app sends it (24 hits) |
| 9 | `op=memberlist` | The people list |
| 10 | `op=affordances` | The act catalogue that the app loads once and every act control renders from |
| 11 | `op=tasks&status=resolved&limit=500` | The "resolutions" tab |
| 12 | `op=entitybyalias&alias=Oakland` | An organisation lookup. **The registry is empty on `biosmoke7`** (`op=stats`: entities 0), so this times the fixed cost of the path and not a populated read |

## Results (ms; n = 10 each)

| # | Op | Median | p95 (= max) | Min | HTTP | Bytes |
|---|---|---:|---:|---:|---|---:|
| 1 | `/version` | 118 | 706 | 109 | 200 ×10 | 7 |
| 2 | `whoami` | 123 | 142 | 105 | 200 ×10 | 472 |
| 3 | `queue` | 163 | 300 | 143 | 200 ×10 | 8,736 |
| 4 | `list` | 154 | 162 | 145 | 200 ×10 | 21,132 |
| 5 | `image` (question) | 162 | 381 | 142 | 200 ×10 | 14,155 |
| 6 | `projection` (case) | 152 | 160 | 137 | 200 ×10 | 2,697 |
| 7 | `image` (document) | 207 | 486 | 184 | 200 ×10 | 186,605 |
| 8 | `search` | 166 | 202 | 154 | 200 ×10 | 31,464 |
| 9 | `memberlist` | 167 | 301 | 141 | 200 ×10 | 1,412 |
| 10 | `affordances` | 127 | 139 | 114 | 200 ×10 | 17,799 |
| 11 | `tasks` (resolved) | 147 | 190 | 140 | 200 ×10 | 225 |
| 12 | `entitybyalias` | 161 | 184 | 140 | 200 ×10 | 168 |

All 120 calls answered HTTP 200, and every op returned the same number of bytes on all ten calls.

## Read with care

- **The warm floor is about 110–120 ms** (`/version`, `whoami`), and most of it is the proxy and the network. Store-backed reads add about 30–90 ms at the median. A budget should be set on the server's share of the time, or measured again from the same client.
- **Cold calls are slower.** `/version`'s 706 ms is its first call, which paid the TLS handshake. The first calls of the probe session before the timed run, a few minutes earlier, took 1,567 ms (`op=stats`) and 900 ms (`op=list`), so they probably included an isolate or Durable Object wake. Those are not in the table. The isolated spikes on single calls (`queue` 300, question `image` 381, document `image` 486, `memberlist` 301) are single outliers among ten.
- **What a bearer sees is not what a member sees.** The member bearer has no member behind it (`member: null`), so `queue` returned **0 items** and `tasks` 0. A signed-in member with a real queue would read more rows. The `queue` row times the full path but not a populated queue.
- **The instance is small:** 31 bundles visible, 142 files, 88 register rows, 0 text units, 0 entities and 0 tasks. These numbers are a baseline for this instance only and do not show how the reads scale.

## Not measured, and why

- **Organisations and people as registries** (`entity`, `concerns`, `connections`): `biosmoke7` holds no entities, so a read would only time an empty table. `entitybyalias` stands in for the path.
- **A document's bytes** (`op=capture` GET): its op spec is `mutating: true` because of its PUT/POST branch. It was left out under the "if unsure, leave it out" rule, even though earlier measures used its GET branch as a read.
- **A signed-in member's session** (`op=login` + session token): it needs a password, and signing in creates a session, which is a write. Not attempted.
