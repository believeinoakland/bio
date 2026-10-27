# Where a team's record lives, and the split (draft)

**Status** · DRAFT, not READY: three points are Bob's (§4) and N1271's study decides the split. PLATFORM #1, 2026-10-27. Inputs: K4746 (2), K4747, K4635, N1271, N1273, `runtime-limits` R27-R28, `plane` R95, `installer` R83, `installer-steps` R41, PERFORMANCE P19, P22, P24.

## 1. What is in the alpha, and what is not

In (G83, K4747): a new team's room is created with Cloudflare's location hint from the founder's request (`wnam`, `enam`, `sam`, `weur`, `eeur`, `me`, `apac`, `afr`, `oc`; `installer-steps` R41 maps by continent and longitude only), through the one helper `storeStub`/`storeId` (`runtime-limits` R28), with a generation number so a room can be re-created (biosmoke8: `--store-location wnam --store-generation 2`). A room never moves after creation; a hint is best-effort placement, never a jurisdiction (R25, R28). Not in: the region shown on the install screen, the picker (N1273), and the split (N1271).

**Not yet confirmed by me:** that biosmoke8's room was re-created and that the hop fell (P23's "before" is 108-122 ms from the east coast, with the room in Frankfurt; a Californian hop was estimated 170-200 ms, unmeasured). The first measurement of the plan is that (`time-budgets-draft.md` §6).

## 2. The region picker (N1273) and what "legal requirement" needs

K4746 (2): "a team with a legal requirement can pick a region". A location hint does not give that. Cloudflare documents a separate mechanism for Durable Objects, a **jurisdiction** (for example `eu`, `fedramp`) that confines where the object runs and stores, chosen when the id is created (the namespace's `jurisdiction()` before `idFromName`), and R2 buckets have their own jurisdictions. A hint only places the object near a place, on a best-effort basis. *(Cloudflare's current pages are to be read again before this is relied on; P17's reading was 2026-10-23.)* So the picker has two honest meanings, and the install screen must not blur them:

- **Near me** (a hint): speed only; the words say "faster for people near here; not a guarantee about where data is kept".
- **Keep it in a region** (a jurisdiction): a guarantee, with its limits (the list is Cloudflare's, short, and some regions have none).

This is Bob's (policy: what a team may be told about where its data lives), §4 point 1.

**Requirement lines (draft)**

**runtime-limits** (layer 1)
- **PL30** `STORE_JURISDICTIONS` is the frozen list of Cloudflare's Durable Object jurisdictions a copy may ask for; `storeJurisdiction(env)` answers `env.STORE_JURISDICTION` when exactly one of them, else `null`; `storeStub` obtains the room from the jurisdiction's namespace when it is set and from the hint's otherwise; a jurisdiction and a hint never both apply (a jurisdiction wins; a hint inside one is refused). Test: each list value; a set jurisdiction used; hint and jurisdiction together refused; neither gives today's behaviour.
- **PL31** The generation suffix (R28) applies to a jurisdiction room as to a hinted one; `storeId` for a given (jurisdiction, name, generation) is stable across calls. Test: the same id twice; a generation change changes the id.

**installer / installer-steps / newgroup / plane** (with UX-DESIGN; needs, not designs)
- **PL32** The install shows the region the copy will use, as the hint `locationHintFor` chose, with "faster for people near here", and offers the picker; choosing one sets `STORE_LOCATION` (or `STORE_JURISDICTION`, per Bob's answer), restated in every upload as G83 does. *Screen needs:* the region line, the picker (near-me list; the jurisdiction list if Bob rules it in), a plain explanation of the difference, a confirmation that the choice cannot change after install. Test: an install with the founder's request carries its hint; a picked region overrides it; a missing `cf` installs as today (null).
- **PL33** A copy states its placement truthfully in Settings: the hint or jurisdiction in force and, for a hint, that it is not a guarantee. Test: each state's words key.

## 3. The split, as needs for N1271's study (the study is Bob's: options with the study)

The study measures; it does not yet choose. What the design of Levels 2 and 3 needs from the record:
- **A unit** other than the team: the candidate is the project (a room each), with bulk text and indexes in R2 (K4635, option B). Alternatives for the study to cost: by table inside a team (hot rows in one room, bulk in R2), or by member for private material.
- **A directory** that survives the split: the team's list of projects, members, roles and the cross-project views. Home, Queue and Projects read across every project (23-26 reads today); a per-project split turns each into a fan-out, which the 2 s bar punishes (hops multiply). Recommend the study cost *roll-ups held in the directory room* (counts, queue index, recent activity) refreshed when a project's room changes, so a cross-project screen is one call and a project screen is one call to its own room.
- **A routing rule** from a request to its room that adds no hop: the id of a project's room is derivable from the project id and the generation (the same helper, R28), never looked up.
- **An upgrade step** (PL24 of `service-levels-draft.md`) and a rollback.
- **Single-thread effect:** a room is one worker, so a split buys a line per project; the study states what one busy project and a large file's reading do to the others (P24: queued door windows 989-1,423 ms).
- **The four factors** (K4635): a paring aid for the record's size is a separate screen need (UX), not designed here.

**Needs from other lanes:** FILES (where bulk bytes live: R2 prefixes, direct-to-R2 uploads, the per-file bound); CAPABILITIES (which new capabilities hold cross-project views: registers, following, places).

## 4. For Bob (through BOB), each with options and a recommendation

1. **What the picker promises** (§2). (a) *Near me* only, a hint: speed, no guarantee. (b) *Near me* plus *Keep it in a region*, a jurisdiction for those teams that have a legal requirement, offered for the regions Cloudflare supports; the install screen says plainly which one it is. (c) Neither is shown; the founder's region is used silently. *Recommend (b), with the words honest; K4746 (2) says "a team with a legal requirement can pick a region", and only a jurisdiction can honor it. Note K4747: "adding support for more than one room will be non-trivial": the jurisdiction needs a different namespace, so the cost is not zero.*
2. **Whether the region may be changed after install.** A room cannot move. Options: (a) never (a new team is re-created by an export and import), (b) by the upgrade step to Level 2, which creates rooms anew and can choose a region. *Recommend (a) for Level 1, (b) as a property of Level 2's design, and the install screen says so.*
3. **Whether the split's unit is the project** (the candidate above) for the study to cost first; Bob's option to rule after the study (N1271).

## 5. What must be measured, and on what copy

The hop from each region to a room created in another (a throwaway object per region, scratch copy, never biosmoke8; P15 asked for the same); the cost of a cross-project screen as a fan-out and as a roll-up read, and the time for a roll-up to catch up after a write; a jurisdiction room's start-up and hop against a hinted one.
