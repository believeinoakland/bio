# FLEET — resume here. Written 2026-09-22 by FLEET #4 (standing lane, cloud, Bob's second account) at stand-up; FLEET #3's refresh text below is kept and re-measured

Bob, 2026-09-22 (relayed by BOB #27): the estate moves TODAY to cloud-based Claude Code under a second Max account.
This file assumes its reader has NO memory, NO `.env`, and perhaps no `list_sessions`, no `SendMessage` replies and
no scheduled tasks. Everything needed is below, or named by the command that answers it. **Every fact is a POINTER,
measured at the time given: re-measure it.**

## Open in this order

1. `CLAUDE.md` IN FULL, from `origin/main` (never a copy you remember). Since 2026-09-19 it has gained: refresh past
   **70%** context (§4); **never queue a gate behind another lane's**, with `node tools/gates.mjs --since <sha>`
   re-checking a rebase (§6); and no shell variable in an `rm`/`rmdir` path (§7).
2. `docs/development/kickoffs/FLEET.md` IN FULL, the area's law. Its 2026-09-21 stand-up section holds this lane's
   corrections; read that before believing any older sentence in the file.
3. This file, then the open rows of `docs/development/QUEUE.md`.
4. `node tools/owed.mjs FLEET`. It read 0 attributed at every reading from 2026-09-21 to 2026-09-22T20:07Z (FLEET #4).

## The fleet, measured (FLEET #4, 2026-09-22 ~20:10Z, cloud container, `origin/main` `17c0cab1`)

| what | reading | instrument |
| --- | --- | --- |
| members' `/version` | **`0.71.0`, all three** (ocr `engine_loaded: true`, tesseract-wasm 0.11.0), three samples each, 2026-09-23T01:27Z, after Bob admitted Cloudflare (BOB #29). From 20:10Z to 01:24Z the proxy refused `*.workers.dev` and these read UNDETERMINED | `curl` |
| plane `biosmoke7` | **`0.71.0`** at `/version` (three samples) and at `op=bootstrap&store=scratch`, 01:27Z. Both are the ROUTING ISOLATE's `env.VERSION`; bootstrap proves only that the DO answered | `curl` |
| main's labels | `release/RELEASE.json` reads `0.71.0`; latest tag `v0.71.0` | `git` |
| staleness | **23 checked, 0 drift, 0 unreadable**: the SessionStart hook's install makes pdf-worker's vendored `unpdf` readable here | the one-liner below |
| committed guard | `fleetbundles.test.mjs`: **87 pass, 0 fail, 0 skipped**, exit 0 read unpiped, byte-identity arm run for all three members and the plane | `node --test` |
| member bytes | `dist/` artifact = manifest = `release/` copy = `RELEASE.json`: `a7e5f590…`, `b26dee19…`, `0d99f5d0…` | `sha256sum` |

## Commands that answer the questions; none needs a secret

- **Staleness, with no install**: every recorded input, vendored-input and asset hash against the checkout.
  ```
  node -e 'const fs=require("fs"),c=require("crypto"),p=require("path");let d=0,n=0;for(const m of ["agent-worker","pdf-worker","ocr-worker"]){const j=JSON.parse(fs.readFileSync(`${m}/dist/${m}.bundle.json`));for(const i of [...j.inputs,...(j.vendoredInputs||[]),...(j.assets||[])]){const f=p.join(m,i.path);let b;try{b=fs.readFileSync(f)}catch{console.log("UNREADABLE",f);continue}n++;if(c.createHash("sha256").update(b).digest("hex")!==i.sha256){d++;console.log("DRIFT",f)}}}console.log("checked",n,"drift",d)'
  ```
  The committed guard is `bio-plane/test/fleetbundles.test.mjs`. It imports esbuild, so it needs `npm ci` in
  `bio-plane/` (and in `pdf-worker/` and `ocr-worker/` for its byte-identity arm).
- **Did a release move member bytes?** Compare each `fleet[].sha256` in `git show <tag>:release/RELEASE.json` across
  tags. Confirm each member's `dist/<m>.bundle.json` EXISTS at the older tag before calling its bytes "unchanged".
- **What serves live** (no token needed; if the cloud blocks egress, report UNDETERMINED, never "down"):
  `curl -s https://agent-worker.believeinoakland.workers.dev/version` (and `pdf-worker`, `ocr-worker`),
  `curl -s https://biosmoke7.believeinoakland.workers.dev/version`, and
  `curl -s "https://biosmoke7.believeinoakland.workers.dev/api/?op=bootstrap&store=scratch"`.
- **The rest:** `node tools/status.mjs 15` · `node tools/decided.mjs "<subject>"` · `node tools/ledger.mjs find <ID>`.
  For gates: `npm ci` in the three directories, then `node tools/gates.mjs`.

## Open threads, as they stood at this refresh (2026-09-22 ~14:35Z)

- **I10 is STABLE for all seven exports**: the pair by BOB #20, and the five 1.1.0 exports by BOB #21 at `b6a14392`
  (§I10's Status line on `origin/main`). A change to any of them is an IC against I10. Nothing is owed.
- **FL-6** waits on **D-260**, now a placed row (`BACKLOG.md`, "### D-260 · queued"): FL-4's wake dispatches a woken
  run to agent-worker with the instance's organisation credential, RECORD with FLEET. FLEET's share arrives as that
  row; nothing in FLEET is runnable before it.
- **D-116** (owner DIST) carries FLEET's DO-side narrowing. Nothing is owed by FLEET.
- **A deploy dry-run for DIST**: if asked, DECLINE. A peer satisfying a permission decision made about another session
  is the work-around, not a favour.

## FLEET #3, and what it leaves on the old account

- Session `local_1bea09c9-6351-4a98-9e18-8bd76a6fdeff` ("FLEET #3") on Sparky-Air; worktree
  `.claude/worktrees/eloquent-goldstine-78dfbd`, clean, **nothing unpushed**, no unmerged branch. Its self-wake jobs
  (`c75ea441`, with renewal `cf77adbf`) die with it. **A successor in the new account cannot archive it**: that is the
  operator's act, or the old account's BOB's, under D-398's three conditions.
- Disk and the ~4 GiB rule are facts about Sparky-Air. In the cloud, measure the environment you actually have.
- Everything FLEET #3 landed is on `origin/main`: `790ad66a`, `d660d29e`, `86725fb8`, `e99abfec`, `89ff4592`,
  `1f59f394`, `7a8b81d6`, and this refresh.

## FLEET #4, cloud session `session_01YB9VgJtjiXwQ5vtx4fLvRB`

- Opened 2026-09-22T20:05Z; kickoff gate passed on FLEET #3's header; `node -v` v26.10.0; context measured with
  `get_session` well under 70%.
- Nothing owed, nothing of FLEET's in the cache: D-260 is `queued` in `BACKLOG.md`, outside `QUEUE.md`'s cache.
- Self-wake: one `send_later`, trigger `trig_01XwSgb6C3S5376zGgWDAfqL`, fires 2026-09-23T10:00Z (after DIST's 0.72.0
  cut can first land). Each firing re-arms the next one; a successor finds it with `list_triggers`.
- Lands by pushing `HEAD:main` (NEW-MACHINE §0.1 measured it accepted), mirrored to its session branch.

## The one open FLEET defect, diagnosed by FLEET #4 (2026-09-23 ~00:05Z, `origin/main` `df9eb9f9`), routed to SCHEDULER #14

CONDUCT #14 relayed it from REC-165. Checked at the code, not from the relay:
- **agent-worker never sets `state.target`.** The run state built at `agent-worker/src/index.mjs` (`let state = {…}`)
  has no `target`. Yet the `dedup` step reads `op=basisversions` with `id: state.target || ""`, and the
  `search`-close step calls `emptyLevelCandidates(state, state.target ?? null)`. So dedup always asks about the empty id,
  and §9's empty-level candidates always carry a null target.
- **`submit` sends whatever target the model wrote**: `call("suggest", null, { ...candidate, run: runId })`. Since
  BOB #28's target rule (`store.mjs`, `SUGGEST_OUTSIDE_RUN_CONTEXT`), the plane refuses a target outside the run's
  context. That is the fence working; the member is what is wrong.
- **The mock `agent-worker/test/plane-suggest.mjs` models neither the run's context nor its principal**, so the
  fleet suites cannot see either refusal.
- **The fix, named:** at run open, seed `state.target` from `op=airun`'s `session.context.id`. That field exists:
  `aiRunRead` returns `context: { type, id }`. For a run over a PROJECT, the target is a question the project
  confirmed-cites, not the project id. The table must then pick among those and must not trust a model-written id.
  `submit` defaults a candidate's `target` to `state.target`. The mock gains the context rule and
  `SUGGEST_OUTSIDE_RUN_CONTEXT`, plus a control arm: drop the seeding and the harness suite fails by name.
  FLEET's ground (`agent-worker/**`). It rebuilds the committed bundle (the guard will demand it) and moves member
  bytes for the next release. Inert until D-260 dispatches runs, so it orders with D-260 or before it.

**PLACED as FL-11** (owner FLEET, M9) in `BACKLOG.md` on `coord`, directly before D-260 (SCHEDULER #14, coord
`c3980219`, verified on `origin/coord`). Build it when it reaches the cache. `owed.mjs FLEET` does not list it and is right
not to: it counts BLOCKED plan rows and ledger dispositions, never a `queued` row in build order.

## Carried from the old account's memory, which will not travel

- A background task's exit code is its WRAPPER's. Read the tool's own completion line (`N/N suites green · …`).
- In a ledger conflict, carry BOTH sides' hunks (CLAIMS.md appends especially). Regenerate `docs/DECIDED.md`; never
  merge it.
- A name is not an address, and an unattended session cannot be messaged. What a lane must know goes on its ROW.
- A QUEUE/BACKLOG row's size budget is the whole block, heading and trailing blank line included.

## What a successor must not get wrong

1. `op=bootstrap`'s version is the routing isolate's. No version FIELD reports the DO's build (FLEET.md, 2026-09-21).
2. Count importers by PARSING imports, never with a one-line grep: a multi-line `import { … }` is invisible to grep.
3. A tag range is a claim about every tag in it. Check each one, or name the ones checked.
4. When a suite's count moves between gates, attribute it at a FIXED BASE (a scratch worktree, with and without the
   change).
5. Never write an all-caps ruling marker (the words `decided.mjs` indexes) into a handoff file; it would index a
   ruling in that file (D-367). Point at the ruling's home instead.
6. Never push for a lane whose push was refused.
7. The `CLAUDE.md` in a long session's context can be older than `origin/main`'s. Re-read it when a peer cites a rule.
8. A line read through `cut -c` is a truncated VIEW, not the line. FLEET #3 told BOB #27 that I10's Status line lacked
   the five; the line was 1,193 characters long and carried them past the cut (`b6a14392`). Read the whole line.
