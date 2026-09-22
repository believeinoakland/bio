# BOB — resume here. Written 2026-09-22 by BOB #28 for BOB #29, in cloud Claude Code under Bob's second account.

Read `CLAUDE.md`, `kickoffs/BOB.md`, `docs/architecture/BIO_System_Design.md` whole, `kickoffs/NEW-MACHINE.md` §0 and
§0.1 (what this environment is, MEASURED), then this. Everything below is a POINTER measured at writing; re-measure.

## 0. YOUR FIRST ACTS

1. **Confirm BOB #28 is stopped**: `list_sessions`, and its self-wake gone — `list_triggers` shows none of its
   `send_later` one-shots pending (BOB #28 armed `trig_018ECUvUbRiSFdGwQTMNzGQ2` for 20:40Z and re-arms at each wake: delete from `list_triggers`, never by an id copied from here). Then archive it under D-398's three conditions.
2. **The SessionStart hook** gave you node 26, full history, the four packages, `ssh-keygen` and the id ledger's
   directory: confirm `node -v` and `git rev-parse --is-shallow-repository` before trusting any instrument. Then
   `node tools/plancheck.mjs` BEFORE ANY PUSH: it arms the push guard, which a fresh clone lacks.
3. **Your context is `get_session`'s `context_usage`**; refresh past 70%. Your self-wake is `send_later` (it survives the
   container; `CronCreate` is session-only, its survival UNMEASURED).
4. **If M0-110 has landed, every handoff lives on `origin/coord`**: read line 1 there.

## 1. THE ESTATE (measured 18:37Z)

| lane | handoff line 1 on `origin/main` | stood up |
| --- | --- | --- |
| SCHEDULER #14 | `ccfd7c35` | paste block given to Bob ~18:38Z (`docs/archive/lane-paste-blocks-2026-09-22.md`); whether he started it: `list_sessions` |
| CONDUCT #14 | `47f22c06` | the same |
| DIST #5 | `034ce1bc` | given; useful only once the network admits Cloudflare (§2) |
| FLEET #4 | `d6198bfe` | given; nothing owed to it (`owed.mjs FLEET`) |

The old account's sessions are invisible from here; BOB #27 (idle there, no wake) is Bob's to close.

## 2. WHAT BOB #28 DID — on `main`, each verified from the remote

- **The environment, measured** (M-99; NEW-MACHINE §0.1): node 22, a shallow clone, no packages, no `ssh-keygen`, no
  id-ledger directory — each broke an instrument; all five repaired by the committed hook (`.claude/hooks/session-start.sh`).
- **The network REFUSES every Cloudflare host and `*.workers.dev`**: DIST's deploys, every live read and `CLAUDE.md` §5's
  live verification are SUSPENDED. Bob was asked ONCE to change the environment's network setting (the single act only
  he can take). When it changes: `npx wrangler whoami` (with `NODE_USE_ENV_PROXY=1`) must name
  `20b533579290b9b93168345edd3b7f72`, then confirm the instance keys by one read-only scratch call, and lift the
  suspension in NEW-MACHINE §0.1.
- **The ten keys**: all environment variables; `GITHUB_TOKEN` and `BIO_RELEASE_SEED` confirmed by use; the rest wait on
  the network.
- **The full gate** (NEW-MACHINE §0.1, M-99): 1,082 s, RED only at the id-ledger arm on a clone that had never minted;
  then GREEN FULL on this landing's tree `9cc1ed7f`, 273/273 · 16,576, 1,135 s — the first GREEN FULL record in a cloud clone.
- **Six builder questions answered in their homes**: M0-110's four (`TREE-SHARING.md` §1), REC-165's
  (`INVESTIGATIVE-SESSION.md` §11 item 5, "Rule 1's target"), M0-107's (the BOB INBOX, written into `VERIFICATION.md`
  by M0-107's landing). Two defects routed with their fixes named (the `.env`-only live helpers; `mintid`'s probe).
- **`CLAUDE.md` §4, §6, §8** brought to the cloud, net-zero within its budget.

## 3. OWED — in this order

1. **The network**: lift the suspension the day Bob's setting changes (§2), and tell DIST (its 0.72.0 batch is owed no
   earlier than 2026-09-23 04:00Z).
2. **The contention fix stays the head of the plan** (Bob, ~15:40Z): M0-110, M0-111, M0-116; M0-114 now placeable.
   In the cloud the machine half of contention is gone (one container per session); re-measure M-97/M-98's git half after
   `coord` lands and tell Bob what it removed.
3. **With Bob, unanswered — do not re-ask:** Q3 (a case resting on a NO-PROJECT conclusion), D-53 (credibility).
   **Carried, not yet asked:** whether an unresolved objection to a case's exclusion statement travels with the published
   case (Publication §3 rule 11) — bring it when M10's ceremony is designed; where a member's or project's Claude key would
   live; MK-7's provisionals; M0-85.
4. `node tools/owed.mjs BOB` read 0 attributed at writing (12 open residues attributed to nobody).

## 4. HOW BOB #28 WAS WRONG — data points (rule 12(c))

- Installed `ssh-keygen` while a gate ran: the run measured a machine that changed under it, and was discarded (CLAUDE.md
  §6). Finish every environment change before the first gate.
- Read `wrangler`'s *"fetch failed"* as a proxy-configuration fault and retried with `NODE_USE_ENV_PROXY=1` before
  probing the host: `curl` named the proxy's 403 at once. Probe the host first; a client's generic error names no cause.
