# Phase 1 now, all sittings at once (Bob, 2026-10-25, K5122)

**Status** · In force; amends BRIEF.md's Phase 1 for this run only. Read whole, after BRIEF.md.

Bob: "Did the walkers fully explore all features, elements, and areas of the release so that they could identify and any defects of the release? Anything short of that is not exercising the urgency demanding of the development process by principal 19." So the offline pass runs **now**, while fix round 10 runs, so every defect it finds enters this round (P19), not after the redeploy.

1. **Code walked:** `tranche/T51` at `be71d70e3f` or later (merge the tranche's tip into your branch when you start; never a rebase). Fix round 10 is still changing it: before recording a defect, check `build/plan/fix-round-10-T51.md` §1 to §3 (read whole). A defect already placed there is recorded `KNOWN <its id>` with what you saw, and not diagnosed again.
2. **All thirteen sittings run at once**, each in its own Miniflare (BRIEF.md Phase 1's way). A sitting that needs what an earlier sitting makes (the claimed room, its people, a project, documents, a question) makes it first in its own script **by the real acts through the door** (the same ops a member uses; never a hand-written answer or a row written straight to storage), as briefly as the sitting needs, then walks its own rows. Area 1's walker walks area 1 fully; the others make only their prerequisites.
3. **Scope:** every row of your area's coverage file(s) and the overlay, as BRIEF.md says: each row's every main act, WORKS / BROKEN / NOT REACHED (with why). Nothing is sampled.
4. **Each defect** carries what you did, what you saw and the row; BOB places it with K4426's four fields. A red in your script is never "load" (K4787).
5. **Records and branch:** you work on your own branch `prep/final-<area>` (made for you from the tranche), writing only `build/plan/walk-T51-final/<area>.md`, `build/plan/walk-T51-final/shots/<area>/` and your journey script under `build/plan/walk-T51-final/scripts/<area>.test.mjs`; commit and push that branch after every ten rows and at the end. You change no product file, test, requirement or other record; you deploy nothing and contact no live deployment (Phase 2, live, stays after the redeploy).
6. **Model** claude-sonnet-5-5; workers haiku low or sonnet medium, never above your own model. An act a safety or permission check refuses is recorded and never worked around (K4696); an act on the code or your own branch cites K5120.
7. **End:** your counts by severity at the top of your record, the line `DONE`, a final push.
