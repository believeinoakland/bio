# Handoff

**Status** · Replaced whole at each handoff; holds only where things stand and what comes next. Written by BOB #179 (`session_019snoQfPk8CGH9fPKHEn3Pj`, **primary** account, depth 1), 2026-10-14 ~22:30 UTC, at ~28% context, T49 open, **no layer running** (L11 held by Bob). Read `build/rulings-active.md` whole first; K3356–K3366 are this session's rulings.

## Where things stand

- **T49 is open** on `tranche/T49`. L2–L10 merged and closed (L8 K3355, L9 K3360, L10 K3364). **L11 is held by Bob (K3365):** "Hold off starting L11. The UX design lane is working on moving all text strings out of the source so that a tiny word change doesn't cause 50 jobs to run in subsequent tranches." No L11 session exists. Before the hold, `job/T49/op-capabilities` was pushed and its START B1 posted (no session): when L11 starts, post a CHANGE to op-capabilities superseding B1 with its revised START, or re-push its branch from the tranche tip.
- **The words move (K3366, U257, DEC-257 in progress):** the design lane keys every member-facing sentence of the 20 L11 modules in `words.json` on PR #39 (branch `claude/gallant-brown-zg0wc1`) with per-module key lists, and posts a **MERGE** (re U251) when ready, "tonight (UTC), a few hours". BOB's ruling on the mechanism (K3366): `words.json` generated into `setup-words` at build; `setup-words` exports `word(key, vars)`; modules hold keys only; tests assert key existence and reader use; `setup-words` moves first in L11 now (membership MODULE_ORDER entry, K657), to L1 in T50 (N1115). K3362's inline-English instruction is withdrawn.
- **Bob's aim stands (K3320):** a release he can install, sign into, with usable screens, create a project, connect an assistant by subscription (K3347, never API keys), and do a real investigation. He checked on it tonight; keep every L11 decision pointed at it.
- **Channel:** UX-DESIGN read through U257 (B218 ANSWER). DEC-253–DEC-256 owed as N1108, N1109, N1110, N1112 (T50). Lanes: investigation H43, actions H31, unchanged.
- **Accepted reds:** fleetbundles' bundler pin (K3353, N1107); plane R12 until N1113 (instance-setup, T50; K3363); coverage's 17 are L11 modules' ids.
- **Process fix (K3358, K3361):** `mail bob` now also writes BOB's Writer line; `xcheck` warns on a stale one. **Your takeover proves WL3** (`dryrun/CERTIFICATION.md`): `mail bob` should print "BOB's Writer line written"; record it in `dryrun/RUNS.md` (W2). If it warns, run the `xwriter` it names.
- **Timers:** WATCH #179 `trig_01DbQQjNqR7kBG9egtkW6Qqt` (into ROOT #6, 23:04Z); backstop `trig_01HCyXQfcpdHh2sMHL8eYuzp` (22:24Z, may have fired). Delete both at takeover; arm a WATCH; arm a backstop once a layer runs.

## What comes next, in order

1. **Take over** (§5.1); archive BOB #179 and write its BOB-final row under T49.
2. **Wait for UX-DESIGN's MERGE** (read the channel; it rings BOB). Meanwhile prepare: read `setup-words`' requirements and code and plan its rewrite (R1–R9 → generated list + `word`), and the manifest's generated-artifact row for it.
3. **On MERGE:** merge `origin/claude/gallant-brown-zg0wc1` into `tranche/T49` (never a rebase; keep the design's text in any conflict; never `main`, K3366 (5)); move `setup-words` first in L11 in `modules.json` with its membership entry; re-word the 20 L11 requirement files to name keys from the lane's lists (BOB's wording; workers may draft, BOB reviews); rewrite the 20 STARTs (keys only, no inline English; the K3362 paragraph removed from the six screen STARTs); then start all 20 (launch table: `build/plan/current.md` rule 3 for models; next session numbers: op-capabilities 1, op-grades 11, affordances 34, setup-words 6, op-declarations 24, admission 12, interface-assets 3, interface-shell 5, screens-entry 3, screens-settings 4, screens-intake 4, screens-daily 4, screens-inquiry 4, screens-investigate 3, screens-publish 3, screens-action 3, control-plane 34, plane 37, site 1, journey-check 4). Merge in the L11 order, setup-words now first.
4. **At T49's close** (`current.md` "BOB's acts"): PR #39 is already in the tranche, so the tranche PR carries it (PR #39 then shows merged); release cut, N780 images, biosmoke8 installed, biosmoke7 removed, journey-check R12 live **by subscription**, BOB's own live walk as administrator and member including the subscription sign-in, then "ready" to Bob; the site to `workers.dev`.

## Acts on main or sessions (reviewed acts, §5.8)

- T49's close: PR `tranche/T49` → `main` with the GitHub merge tool, method merge (§5.7 (3), K2273); no refusal recorded.
- PR #39's branch merged into `tranche/T49` (K3366 (5)), not `main`; no refusal recorded for merging a design branch into a tranche branch.
- Deploys and Cloudflare removals (biosmoke8, biosmoke7, the site's Worker): Bob's approval in session each time (K1715). The live subscription sign-in needs Bob to enter its code once.

## Open with Bob

- The stewards' published rule text (Publication §5E, DEC-255): Bob approves it through the design lane.
- The stewards' contact address (N923); translations (N670's R88); civicsmith.org's DNS and email (after the site is proven); the records-request template's reviewer (N858).
