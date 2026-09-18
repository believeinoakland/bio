# DIST — resume here. Rewritten 2026-09-18 by BOB #15, standing the lane up again.

The previous version of this file (2026-09-13) described 0.57.0 and is superseded; it is in git history. The only DIST
session since then (2026-09-16) confirmed `main` green and cuttable, asked *"standing by for your sequencing"* of a
window nobody was reading, and was swept idle. **DIST is now a STANDING LANE and decides WHEN to cut by rule**
(`kickoffs/DIST.md`, *WHEN DIST CUTS*). Read `CLAUDE.md`, then `kickoffs/DIST.md`, then this.

## Where things stand — POINTERS, measured by BOB #15 on 2026-09-18; re-measure every one before acting on it

- The latest signed release is **0.58.0**: `release/RELEASE.json` committed at `db7589b8` (2026-09-14); the tag `v0.58.0`
  points at `9ed18019`, which is OFF the mainline (measured: not an ancestor of `origin/main`). `origin/main` was
  **834 commits** past the manifest when this was written.
- **A CUT IS OWED NOW under the rule.** Six integrated fixes close security or disclosure defects that are in no signed
  release. This is a STARTING list from two sources that each missed something, so rebuild it from
  `git log db7589b8..origin/main` against the rows (`node tools/ledger.mjs find <ID>`) before you trust it:
  1. **REC-103** — the frontier's unread viewer was a leak. Merge `4263696a` (2026-09-16). CONDUCT's list omitted it; BOB found it in the log.
  2. **REC-123** — an `ai` credential could RATIFY and publish in a member's name. `85a5dd7a`, IC-132.
  3. **REC-125** — the operator's bearer tokens could ratify (D-421). `85ce9511`, IC-137.
  4. **MK-1** — an observation could be published with the observer's handle. `103c62c0`, IC-133 (I3), IC-134 (I5).
  5. **REC-130** — unsigned case documents were readable and enumerable by strangers, with a second leak through
     `op=caseratify`'s refusal details. `a32fda24`, IC-141, I3 MAJOR.
  6. **REC-129** — `op=stats`/`selftest`/`livefire` gave members and probes instance-wide lead and observation counts.
     `9d705bdb`, IC-144 MAJOR, **superseded in part by REC-131 (running when this was written)**. REC-129 alone
     discloses strictly less than 0.58.0 does, so **do NOT hold the cut for REC-131.** Cut with what has landed, and
     cut again when REC-131 lands, under the same rule.

  7. **REC-126** — the review copy: a NEW READ PATH FOR NON-MEMBERS (a grant's bearer secret reads one unratified case).
     Not a closing but security-relevant: it must be in a release only after its gate and its negative controls ran, and
     the release notes name it. Integrated by CONDUCT #5 after this list was first written — confirm from the log.

  **They must travel with:** REC-128 plus its fix-up (`dcb726fb`; IC-139, IC-140 on I5, IC-147). Without IC-147, a
  build carrying REC-130 refuses case ratification delivered by the founder. Also REC-100's constraint (`8bb422e4`,
  IC-130): the plane at I3 ≥ 24.0.0 and `agent-worker` deploy TOGETHER. I3 was 29.3.0 and I5 1.21.0 at `a6bdfcbb`.
- **Interfaces moved a long way** — I3 is at 29.x (IC-130 MAJOR at 24.0.0 requires `agent-worker` to ship WITH the plane:
  an old one silently drops model-judged steps). Read every IC since 0.58.0 in `INTERFACE-CHANGES.md` and state which
  fleet members move with the plane; FLEET builds a member if one needs building.
- **FIRST, before cutting: the embed hazard** (`kickoffs/DIST.md`, last paragraph) — verify whether `newgroup`'s
  `npm run embed` replaces the signed embed with an unsigned rebuild. It was reported 2026-09-16 and never recorded.
- Carried from the 2026-09-13 file and NOT re-verified: D-297 (the installer does not fetch, verify or upload fleet
  member bundles — a group installing receives the plane but not the fleet); five copies of the generated-embed
  recogniser across five suites; tags 0.56.0/0.57.0 never pushed and `v0.58.0` off-mainline.

## The one gated act

Cut, sign, tag and push are yours and need nobody. **Deploying the plane and the installer are gated** (`CLAUDE.md` §4):
send the request to the BOB session by `SendMessage` — version, what it closes, the members that move with it, the gate's
evidence — and continue. BOB carries it to Bob.
