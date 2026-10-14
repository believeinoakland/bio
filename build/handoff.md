# Handoff

**Status** · Replaced whole at each handoff; holds only where things stand and what comes next. Written by BOB #177 (`session_01D5nWnUwh7sTvRjQeaMvvXb`, secondary account, depth 1), 2026-10-14 ~20:00 UTC, near 30% context, T49 open with L2 running and no step half done. Read `build/rulings-active.md` whole first; K3326–K3334 are this session's rulings.

## Where things stand

- **T49 is open** (K3327) on `tranche/T49`, cut from `main` @ f498560a37 (T48's close plus PR #37, design DEC-238 S23 and DEC-241–DEC-246, merged at the boundary, K3326). Plan `build/plan/current.md`: 32 jobs, its foot "Settled by BOB #177" and the fold notes govern. Opening act done (K3328: `op-capabilities`, `site` in `modules.json`; `site` uses `interface-assets`, K3334). `next.md` is T50's.
- **L2 running** (K3330), all on Sonnet: MEMBERSHIP #39 (`session_01195GX87EMHUXKVysBHVQkZ`) MERGED (K3336, after the handoff commit; CHANGE B3/B2 sent to project-roster and credentials to re-run against it); PROJECT-ROSTER #8 (`session_018CGBk9NjLEcazf7iqf4TiN`) COMPLETE (J3; K3332 applied), waiting for membership to merge first; CREDENTIALS #16 (`session_01C6HsrkoFjNZGt4BJNLj9Gm`) WORKING; PROMOTION #47 (`session_01HL5YBcopVZSndbgMuYa2TJ`) waiting (J1) for BOB's CHANGE once the other three merged, then stamps. BOB's cursors: membership J1, project-roster J3, promotion J1, credentials J0. Screen jobs' STARTs carry membership's `admin`-in-`by` list (K3336).
- **Folded:** L2 (K3329, with N945's credentials R77), L3–L10 (K3331), L11 (a) (K3333: op-capabilities.md, op-declarations, op-grades, admission, control-plane, rule 7's wording edits). **Not yet folded:** L11 (b), `build/plan/draft-T49-fold-L11-b.md` (78 KB, a worker's; its §0 findings and §15 settled in K3334, its body NOT yet reviewed whole).
- **Channel:** UX-DESIGN read through U244; B208 ACK, B209 QUESTION (the opening's asks: dock withheld keys, D30 words, invitation queue kind, D8's member reading, Accept affirmation, passed date, owed tags, carried keys), B210 QUESTION (site sections before any group is listed; place sentence with `{places}`). The Writer line on `mail/BOB` is still BOB #176's predecessor's (xwriter refuses `--account secondary` while `channels.md` lists BOB on primary, K3056): known, changed only at a close. Lanes unchanged (investigation H43, actions H31).
- **Timers:** backstop `trig_011Q49h9H465mm2vascLSsJN` (20:00Z, into BOB #177), WATCH #177 `trig_01UGkRTAsLM5v1AQsCRjqdTi` (into ROOT #6, 21:00Z). Delete both at takeover and arm your own.

## What comes next, in order

1. **Take over** (§5.1): Status line with `mail bob --tranche T49`; `mail check`; channel; arm backstop and WATCH; delete mine; archive BOB #177 and write its BOB-final row under T49 (`build/metrics/T49.csv`, create it with the header of T48's).
2. **L2 merges** (§5.5): project-roster and credentials once each records COMPLETE after its CHANGE, then CHANGE promotion to stamp and merge it last. Close L2 (§5.6: regenerate artifacts per the manifest, `checks/run.mjs`, archive the four sessions with their rows).
3. **L3–L10**: each START carries its "START must say" lines from `draft-T49-fold-L3-L10.md`, plus the common text of `build/plan/starts-T49/membership.txt`'s lower half; models per plan rule 3.
4. **Before L11's START:** review `draft-T49-fold-L11-b.md` whole (P20) and fold it with K3334's settlements; also fold the op-capabilities split per `build/extraction/op-declarations-split.md` (reviewed in `draft-T49-fold-L11-a.md` §0). Name in rule 5 the two new reds K3334 lists.
5. **At T49's close**: as `current.md` "BOB's acts (no job)" says: release cut, images (N780), biosmoke8 with the test mark as a secret (D10), biosmoke7 removed, journey-check R12 live, BOB's own live walk as administrator and member, then "ready" to Bob; the site to `workers.dev`.

## Acts on main or sessions (reviewed acts, §5.8)

- T49's close: PR `tranche/T49` → `main` with the GitHub merge tool, method merge (§5.7 (3), K2273); no refusal recorded.
- A design-stream PR on its MERGE, at T49's close (§13.1 item 5; K1177); none open now.
- Deploys and Cloudflare removals (biosmoke8, biosmoke7, the site's Worker): Bob's approval in session each time (K1715; never on the standing list).

## Open with Bob

- His weekly meter at T49's opening (asked; does not hold the tranche).
- Whether runs on a member's own API key are fine (K3324 (3), BOB's reading of K2892; T49-8 builds it): told, not yet answered.
- The stewards' contact address (N923); translations (N670's R88, K3190); civicsmith.org's DNS and email (K3060 D14, after the site is proven); the records-request template's reviewer (N858).
