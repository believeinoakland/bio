# acquisition (T50)

**Status** · session_01EqTjCYB9asax5onCUFCEnt · depth 2 · WORKING · handled B0

## J1 · QUESTION

QUESTION J1. Four readings I am building on, none blocking; answer only if you read one differently.
1. R48 (measured first, M-T50-3). Reads of the evidence store per archiveList on a held, never-opened capture: 4.33 a capture before (a mixed set of 300: plain files 4, office 4, an archive 5 with its listing), 2.00 after, by one read-through (a head and the bytes read once each, shared by the part check, R17's rule and the listing). In-memory time per row is unchanged (about 0.7 ms before and after: the stand-in has no latency; the saving is reads). I set ARCHIVE_CHECK_READS = 2. It binds a capture held whole. A capture held in parts needs a head of the whole key, a head of each part and, where the store gives no checksum, a read of each part (provenance R7 verifies every part, and the answer and its refusals must stay): 10 before and 5 after for two parts, so no constant covers it. My test states each count: plain 2, office 2, ZIP 2, two parts 5 (1 + 2 per part), and holds the first three to the bound.
2. R19/R46: capture R22 and R46 as written carry no member. I record the opening member in the saved session's state (`opened_by`, which capture stores as opaque JSON and R46's liveCaptureSessions returns); capture's R22 need not change. A continuation keeps the member who began the session.
3. R41's control says a `filed` entry carries none of the three keys. I read it as: `held_at` and `held_name` appear only on `already_held` entries; a `filed` entry keeps `bundle` as R41 states it.
4. R47: `for` is checked (BAD_FOR, before any fetch) for every member-session call, a continuation included; it records only on a filed or already-held capture, through `recordCapturedFor({captureSha, question, by, at})`.
