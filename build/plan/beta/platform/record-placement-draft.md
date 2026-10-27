# Where a team's record lives, and the split (draft)

**Status** · DRAFT, READY for PLANNING for placement and the picker (P2, P3 answered); the split waits on N1271's study. PLATFORM #1, 2026-10-27 (P-3). Inputs: K4746 (2), K4747, K5440 (P2) and K5441 (P3) as BOB relayed them, K4635, N1271, N1273, `runtime-limits` R27-R28, `plane` R95, `installer` R83, `installer-steps` R41, PERFORMANCE P19, P22, P24, and Cloudflare's pages re-read today (§2).

## 1. What is in the alpha, and what is not

In (G83, K4747): a new team's room is created with Cloudflare's location hint from the founder's request (`installer-steps` R41 maps by continent and longitude only), through the one helper `storeStub`/`storeId` (`runtime-limits` R28), with a generation number so a room can be re-created. A room never moves after creation. Not in: the region shown on the install screen, the picker (N1273), jurisdictions, and the split (N1271).

**Not confirmed by me:** that biosmoke8's room was re-created and the hop fell (BOB takes the re-time as his act; P23's "before" is 108-122 ms from the east coast with the room in Frankfurt).

## 2. What Cloudflare says today (read 2026-10-27; quote, page, date)

**Durable Objects, "Data location"** (developers.cloudflare.com/durable-objects/reference/data-location/, page last updated 2026-06-26):
- Hints: "wnam, enam, sam, weur, eeur, apac, apac-ne, apac-se, oc, afr, me"; "sam, afr, and me are not spawn locations; objects go to a nearby supported location instead." "Hints are a best effort and not a guarantee." "Only the first call to `get()` for a particular Object will respect the hint." "Durable Objects do not currently change locations after they are created" (the page adds that dynamic relocation is planned).
- Jurisdictions: `eu`, `us`, `fedramp` (FedRAMP-Moderate data centers). They create objects "that only run and store data within a region." "The jurisdiction constraint only controls where the Durable Object itself runs and persists data." **"Workers may still access Durable Objects constrained to a jurisdiction from anywhere in the world."** Use: "first create a namespace restricted to a jurisdiction", `env.NS.jurisdiction("eu")`, then `idFromName` on it; the same name can be a different id in a different jurisdiction; a mismatch of the namespace's and the id's jurisdiction is an error. "A `DurableObjectId` will be logged outside of the specified jurisdiction for billing and debugging purposes." The page does not say whether a hint and a jurisdiction can be combined.

**R2, "Data location"** (developers.cloudflare.com/r2/reference/data-location/, page last updated 2026-08-19):
- Hints (bucket creation only): `wnam`, `enam`, `weur`, `eeur`, `apac`, `oc`; "best effort and not a guarantee"; "only honored the first time a bucket with a given name is created."
- Jurisdictions: `eu`, `us`, `fedramp`. "Jurisdictional Restrictions guarantee objects in a bucket are stored within a specific jurisdiction." "Once an R2 bucket is created, the jurisdiction cannot be changed." Access is through the jurisdiction's own endpoint (`<ACCOUNT_ID>.<JURISDICTION>.r2.cloudflarestorage.com`); "Cloudflare Enterprise customers may contact their account team or Cloudflare Support to get access to the FedRAMP jurisdiction."

**What this means for the words a team reads.** "Keep my data in this region" can honestly promise only this: the room's records and the stored files stay in that jurisdiction. It cannot promise that requests, the Worker, the visitor-view browser, the file scanner, the reading containers or the assistant's provider calls run there, because Cloudflare says Workers can reach the room from anywhere and names no region for the rest. The promise is therefore *storage* in the region, with what runs elsewhere stated beside it. The jurisdictions are three (EU, US, FedRAMP); FedRAMP needs an Enterprise relationship for R2. The room's hint list has no jurisdiction meaning, and R2's hint list is shorter than the room's.

## 3. What the picker offers (P2, K5440: "as recommended"; P3, K5441)

Bob's rulings: offer "near me" and "keep my data in this region", worded honestly (P2); the region is fixed at Level 1, a move is export and import, said before the region is chosen (P3).

**Requirement lines (draft)**

**runtime-limits** (layer 1)
- **PL30** `STORE_JURISDICTIONS` is the frozen list `eu`, `us`, `fedramp`; `storeJurisdiction(env)` answers `env.STORE_JURISDICTION` when exactly one of them, else `null`; `storeStub`/`storeId` take the room from `env.STORE.jurisdiction(j)` when it is set and from the hint's otherwise; a jurisdiction and a hint never both apply (the jurisdiction wins; setting both is refused, since Cloudflare's page does not say they combine). Test: each value; hint and jurisdiction together refused; neither gives today's behaviour; the same name gives a different id in each jurisdiction.
- **PL31** The generation suffix (R28) applies to a jurisdiction room as to a hinted one; `storeId` for (jurisdiction, name, generation) is stable across calls. Test: the same id twice; a changed generation changes it.
- **PL34** A copy with a jurisdiction keeps *every* byte store in it: the team's R2 bucket is created in the same jurisdiction at install and read through the jurisdiction's endpoint, and an install that cannot create it in that jurisdiction fails before the room is created, saying why. (R2's bucket jurisdiction cannot be changed afterwards.) Test: an install with a jurisdiction creates the bucket with it; a failure creates no room.

**installer / installer-steps / newgroup / plane** (with UX-DESIGN; needs, not designs)
- **PL32** The install screen shows the region the copy will use and offers two choices: **near me** (a hint; `locationHintFor` chooses by default, a list to pick another) and **keep my data in this region** (EU, US, and FedRAMP only where the account has it). Before the choice it states: the choice cannot be changed later; moving later is an export and an import (K5441); what "near me" is (faster for people near the place; not a guarantee where the data is) and what "keep in this region" is (stored there; the stored files too; it does not make everything that runs on the copy run there). Choosing sets `STORE_LOCATION` or `STORE_JURISDICTION`, restated in every upload as G83 does. *Screen needs:* the two-way choice, the lists, the pre-choice statement. Test: an install carries its default hint; a picked region overrides it; a jurisdiction sets the jurisdiction and no hint; a missing `cf` installs as today (no hint).
- **PL33** Settings states the copy's placement truthfully: the hint or the jurisdiction in force; for a hint, "not a guarantee"; for a jurisdiction, what is and is not covered (PL32's words). Test: each state's words key.
- **PL35** An export and an import of a whole team record (K5441's move) exists as the one way to change region; written in `whole-record-move-draft.md` as lines for `corpus-export` (PL50-PL53, extended to the whole record) and the installer's import into a new copy (PL54-PL57), as BOB ruled (K5443). Test: there.

## 4. The split, as needs for N1271's study (the study is Bob's: options with the study)

- **S0 revised this (`study/s0-options-for-the-split.md`):** a room per project is a re-architecture of whole-store `transact`, not a routing change; the first candidates are bulk and indexes out (K4635 option B) and cached shared reads, with a room per project only as a paper costing. What follows was written before S0 and is kept for the case S1 shows B and C fall short.
- **A unit** other than the team; the candidate was the project (a room each), bulk text and indexes in R2 (K4635, option B). Alternatives to cost: by table inside a team; by member for private material. A split team's rooms all live in the team's one region (jurisdiction included): a project's room is created in the team's jurisdiction or hint, never elsewhere (P3 makes the region a team property).
- **A directory** that survives the split: projects, members, roles and the cross-project views. Home, Queue and Projects read across every project (23-26 reads today); a per-project split makes each a fan-out, which the 2 s bar punishes. Recommend the study cost **roll-ups held in the directory room** (counts, queue index, recent activity), refreshed when a project's room changes, so a cross-project screen is one call and a project screen one call to its own room.
- **A routing rule** from a request to its room that adds no hop: the room's id derivable from the project id and the generation (the same helper, R28), never looked up.
- **An upgrade step** with a rollback (`service-levels-draft.md` PL24).
- **Single-thread effect:** a split buys a line per project; the study states what one busy project and a large file's reading do to the others (P24: door windows queued 989-1,423 ms).
- **The four factors** (K4635): a paring aid is a screen need (UX), not designed here.

**Needs from other lanes:** FILES (where bulk bytes live: R2 prefixes, direct-to-R2 uploads, bounds; whether a jurisdiction R2 bucket changes the direct-to-R2 route); CAPABILITIES (which new capabilities hold cross-project views, and the whole-record export of PL35).

## 5. For Bob (through BOB)

Only what Bob has not ruled: **P4** (which levels' figures teams see; in `service-levels-draft.md` §5) and, when N1271's study is in, the split's unit. No new question from this draft. Decided (K5443): biosmoke8 and rehearsal installs stay unjurisdictioned, and one rehearsal on the throwaway account installs with `eu` to prove the path (`load-test-draft.md` §2).

## 6. What must be measured, and on what copy

The hop from each region to a room created in another (a throwaway object per region, scratch copy, never biosmoke8); a jurisdiction room's start-up and hop against a hinted one (the page says Workers reach it from anywhere, so the hop from a far member is the whole distance); R2 reads from a jurisdiction endpoint against the default; the cost of a cross-project screen as a fan-out and as a roll-up read, and how long a roll-up lags a write.
