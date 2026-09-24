# The doorbell: anonymous material arriving at an instance (`op=knock`)

**Status** · as of 2026-09-24. Written by BOB #33 as the design home of the doorbell, which had none: SCHEDULER #18 found on 2026-09-24
that D-496 and D-508 could cite only `BIO_System_Design.md` §3 construct 14's row. **It describes what is BUILT, read from the code at
`origin/main` 68fecb8d, and folds one ruling** (BOB #32, 2026-09-24 04:28Z: a published limit is a BOUND). Complete for the knock and its
limiter; the member side of the inbox is stated at the level of its ops only.

**Place in the system** · A level-2 design serving construct 14, **Scheduler and operations**, of `docs/architecture/BIO_System_Design.md` §3,
beside `SCHEDULER.md` and `INBOX-GRAMMAR.md`. Construct 14 has **no level-1 document**, so there is no level-1 authority above this file to
fold a ruling into; that gap is stated rather than filled with an invented home. **Not to be confused with `INBOX-GRAMMAR.md`**: that is the
TASK inbox (the `tasks` table, work items for members); this is the DOORBELL inbox (the `inbox` table, material from anyone). The two share
the word and nothing else. `BIO_Membership_Architecture_v2.md` §1.2 names the doorbell as the route by which anonymous material arrives,
as distinct from hand-carried material whose source is attributed. What depends on it: D-496 (the limiter), D-508 (the member-facing
translations of `RATE_IP` / `RATE_GLOBAL`), `bio-plane/test/doorbell.test.mjs`.

**Incomplete sections** ·
- §3 — the member side (triage of a knock into the working corpus) is described only as its three ops. What `pulled` commits a member to,
  and whether a pulled knock carries the doorbell as its provenance into a capture, is not designed here.
- §4 — `RATE_IP` and `RATE_GLOBAL` have no DEC-49 translation yet; D-508 owns that.

**Contents**
- [1. What the doorbell is](#1-what-the-doorbell-is)
- [2. The knock](#2-the-knock)
- [3. The member side](#3-the-member-side)
- [4. The limiter — a published limit is a BOUND](#4-the-limiter-a-published-limit-is-a-bound)

---

## 1. What the doorbell is

The one door into an instance that needs no token, no session and no membership: anyone may hand the group material. It exists because a
group whose purpose is accountability must be reachable by people who will not, or cannot, join it. What arrives is **material, never an
act**: a knock writes one row and, with evidence storage configured, one object, and changes nothing else in the record. Its worst case is
by construction a full inbox.

## 2. The knock

`POST op=knock` with a JSON body carrying `contentB64` or `contentText`, and optionally `note` (kept to 2,000 characters) and `contact`
(kept to 300). Refused by name: a non-POST (405), no content (400, `requiredArgument`), invalid base64 (400), empty content (`EMPTY`), and
over the size cap (`TOO_LARGE`, 413, naming `maxBytes`). The cap is 8 MiB with evidence storage (R2) configured, where the bytes land under
`bio/inbox/<sha256>` in the working bucket and nowhere else, and 64 KiB without it, where the content is stored inline in the Durable
Object and the refusal says large material needs evidence storage. The knock is recorded with its SHA-256, byte count, the note and contact
as given, the time received, and status `new`, under an id `KNOCK-<date>-<8 hex>`. A store that does not answer is reported as silence
(REC-52), never as a rate refusal: a 429 tells a member of the public they knocked too often, which is a claim that needs a count behind it.

The rate accounting and the row land in ONE transaction, so a race cannot slip past the limits.

## 3. The member side

Nothing leaves the inbox except to a signed-in member: `op=inbox` lists knocks (optionally by status), `op=inboxget` reads one with its
content, and `op=inboxresolve` sets its status to `pulled`, `discarded` or back to `new`, recording when and by whom.

## 4. The limiter — a published limit is a BOUND

**RULED by BOB #32, 2026-09-24 04:28Z (D-496):** a limit the instance publishes is a BOUND it holds, not the name of a bucket. So the code
holds the stated number, or the text stops claiming it.

The limits are 12 knocks per source and 300 per instance, in any 10 minutes. The source is a fingerprint of the connecting IP, never the IP
itself. The count is a **two-bucket weighted sliding window**: `est = prev × (1 − elapsed/W) + cur`, refused at `est ≥ limit`, with the
previous bucket weighted by how much of it is still inside the trailing window, and the prune keeping the current and previous windows'
buckets. The fixed bucket it replaced let a caller send the limit just before a bucket edge and again just after it, twice the published
number inside a span shorter than one window, while the code did exactly what it said.

**The estimate is approximate in both directions**: it assumes the previous bucket's knocks were spread evenly, so a caller who front-loaded
it is charged for knocks already aged out, and one who back-loaded it for fewer than it really holds. So the instance publishes the bound
with its method, built from the same constants so words and numbers cannot drift: *"at most 12 knocks from one source in any 10 minutes,
estimated by a sliding window"*, and the instance-wide 300 likewise. The sentence travels as `stated` on the 429 beside the code
(`RATE_IP` or `RATE_GLOBAL`), which is the one moment a caller is held to it. Before D-496 the limit was stated to no caller.

An exact limiter (a log of every knock's time) would hold the bound to the knock. It is not built and not needed while the sentence says
"estimated"; if the sentence ever drops that word, the limiter must become exact in the same change.
