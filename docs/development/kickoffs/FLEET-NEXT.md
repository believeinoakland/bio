# FLEET — resume here. Written 2026-09-21 by FLEET #3 (standing lane) as a CHECKPOINT while live

FLEET #3 is LIVE; this is a checkpoint written at 54% context, not a stand-down. If FLEET #3 still answers, it holds
the lane; if it does not, this is the state. Read `CLAUDE.md`, then `kickoffs/FLEET.md` IN FULL (its 2026-09-21
stand-up section carries today's corrections), then this. **Every fact below was MEASURED at the time given. Each is
a POINTER: re-measure it.**

## The fleet, measured 2026-09-21

| what | reading | when |
| --- | --- | --- |
| `agent-worker`, `pdf-worker`, `ocr-worker` at `/version` | `0.69.0` (ocr `engine_loaded: true`, tesseract-wasm 0.11.0), 3 samples each | 15:14:06Z |
| plane `biosmoke7` | `0.69.0` at `/version` AND at `op=bootstrap`. Both print the ROUTING ISOLATE's `env.VERSION`; bootstrap adds only that the DO answered | 15:14:06Z |
| staleness: every figure the three manifests record, plus each artifact, its `release/` copy and the release parts | 33 checked, 31 match, **0 drift**, 2 unreadable (pdf-worker's vendored `unpdf`: the absent install) | `36eaf651`, after D-158 |
| member bytes across tags | identical at all eleven tags v0.59.0 … v0.69.0: `a7e5f590…`, `b26dee19…`, `0d99f5d0…` | — |

The committed instrument for staleness is `bio-plane/test/fleetbundles.test.mjs` (87 pass in every gate today; its
input-hash arm needs no `npm ci`). The cross-tag and remote-blob checks FLEET #3 ran were scratchpad scripts and die
with the session. Their method is in FLEET.md's 2026-09-21 stand-up: 33 figures, and a control that reads the inputs
from an older rev must FAIL, naming the file.

## What landed today, on `origin/main`, each gated GREEN (class DOCS) and verified from the remote

- `790ad66a`: FLEET.md's stand-up; **`op=bootstrap` never read the DO's build** (the reading lesson corrected in
  place); FL-6's real blocker; a dated line under MEASUREMENTS' 0.57.0 table, its body untouched.
- `d660d29e`: **I10 registered** (`discoverMembers`, `planeMember`; BOB #19's ruling), and the 0.69.0 re-read.
- `86725fb8`: M-75 data point 8 (this session's pushes succeeded in the hour two lanes' were refused).
- `e99abfec`: **I10 1.1.0**, adding `writeMember`, `verifyFresh`, `freshBuildRunnable`, `sha256` and `REPO_ROOT` (BOB
  #20's ruling, carried by message while BOB's push was refused).
- `89ff4592`: BOB #21's two precisions folded into §I10's body.

Claims held: NONE, each released in the commit that used it. Workers spawned: none.

## Open threads, as they stood at 18:38Z

- **I10's Status line** reads STABLE for the pair (BOB #20, `dfff4c22`). BOB #21 confirmed the five STABLE by message
  and said it lands the Status line itself after its map-cut. **If that line still names only the pair, the act is
  BOB's. FLEET never writes the Status line.**
- **D-116** (owner DIST) is narrowed on FLEET's finding: the plane's own DO is a build-bearing part nothing reads
  back, and the fix is a DO-reported build under a DISTINCT field (never `version`, which the spread would replace).
  It is landed in `BACKLOG.md`; the row now opens "NOTHING READS BACK WHAT BUILD". Nothing is owed by FLEET.
- **FL-6** waits on **D-260** (the plane's caller does not exist), not on DS-3, whose config half landed at
  `2de6f25f`. QUEUE's tracked-elsewhere cells now say so. Nothing in FLEET is runnable until D-260 lands a caller.
- **A deploy dry-run for DIST**: not asked of this session. If DIST asks FLEET to run one, DECLINE: a peer satisfying
  a permission decision made about another session is the work-around, not a favour.
- **Owed**: `node tools/owed.mjs FLEET` read **0 attributed** at every reading today.

## This session and its worktree

- Worktree `.claude/worktrees/eloquent-goldstine-78dfbd`, clean, at `origin/main`. It holds 573 MB of `npm ci`
  installs (bio-plane, pdf-worker, ocr-worker); the byte-identity arm and the gates need them.
- Self-wake: recurring `e524a0a8` (`47 0,6,12,18 * * *` PDT) and renewal `08c1ed46` (2026-09-26 09:23 PDT). Both are
  session-only; a successor arms its own, with FLEET-NEXT 2026-09-20's two disk corrections in the prompt text.
- **Disk: 4.7 GiB free (98%) at 18:38Z**, down from 9.68 GiB after FLEET #2's worktree was removed (+650 MiB,
  archive then `git worktree remove`, D-398). Under ~4 GiB it is a WAVE-WIDTH question for CONDUCT with the
  arithmetic attached, never an offer to free FLEET's installs.
- Context: 54% at 18:37Z. Over 60%: rewrite this file at REFRESH and ask BOB for FLEET #4.

## What a successor must not get wrong, learned today

1. **`op=bootstrap`'s `version` is the routing isolate's.** No version FIELD reports the DO's build. The two readings
   that reach it are a DO-side wire code absent from the prior signed bundle (DIST's law), and
   `op=capturerequestdraining`'s `agent`, which needs a capture-request row.
2. **Count importers by PARSING, never by a one-line grep.** A multi-line `import { … }` is invisible to grep, and
   every one of the assembler's imports was multi-line.
3. **A tag range is a claim about every tag in it.** FLEET #3 sent "v0.59.0 through v0.68.0" after checking 6 of the
   10 tags, and had to correct it. Check every tag, or name the ones checked.
4. **When a suite's assertion count moves between gates, attribute it at a FIXED BASE** (a detached scratch worktree
   at the base, run with and without your change) before believing either. `planning-hygiene` fell 280 → 256 today,
   and at a fixed base this lane's change moved it by 0.
5. **Main moves every few minutes when lanes are live**, and remote-tracking refs are shared across worktrees. Rebase;
   keep BOTH sides of a CLAIMS.md append; regenerate DECIDED.md, never hand-merge it; check the FILES for markers;
   re-gate.
6. **No shell variable in an `rm` path or an `mv`/`cp` target** (Bob's rule via BOB #20, 2026-09-21). Write the
   literal absolute path, or skip the cleanup.
7. **Never push for a lane whose push was refused**, however clean its commit. The refusal belongs to that session's
   user.
