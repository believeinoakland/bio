# Baseline walk r6 of Civicsmith's assistant (B1 then B2), 2026-10-16, after release 0.85.0 fix round 6 (K3543)

Walk worker of ASSISTANT-HOSTING #1, branch `tranche/T49`. Instance `https://biosmoke8.believeinoakland.workers.dev` (note: `$BIO_INSTANCE` in this session reads `biosmoke7`, not a URL; I used the URL given in the task). Version reported by `bootstrap`: 0.85.0. Signed in as the administrator (handle `sparky`, member id `admin`). Own project: **ASSISTANT baseline 2026-10-16** (`PROJ-2026-2132-assistant-baseline-2026-10-16`). No product file edited, nothing committed, pushed or deployed. Numbers: [test] measured, [inf] inferred.

Method follows `walk-085-r5.md`: the same ops the screens call (`promote`, `captureupload type=text/plain`, `release`, `drawquestion`, `findin`, `cite`, `airunopen` with the dock's bounds, `airundispatch`), polled with `airun` + `airuns` every 30 s. Raw material beside this file in `walk-r6/` (run logs, tick lists, Containers instance states, per-minute metrics); no token or password in any of it.

## 0. What was refused or not possible (first)

- **No browser screenshots at all.** Chromium (Playwright, `--no-proxy-server`) still refuses the instance's certificate: `page.goto: net::ERR_CERT_AUTHORITY_INVALID at https://biosmoke8.believeinoakland.workers.dev/app`. Why [test]: even on the direct path the server presents a chain `*.believeinoakland.workers.dev` <- "Egress Gateway SDS Issuing CA (production)" <- "sandbox-egress-gateway-production Egress Gateway CA" (openssl with the system store verifies it: OK). Chromium's store (`~/.pki/nssdb`) holds only one authority, "CCR agent-proxy interception CA (production)". So K3530's trust applies to the agent-proxy CA, not to the egress-gateway CA that the direct path carries. I did not add trust, use `--ignore-certificate-errors` or go through the proxy (r5 had the same act refused as "TLS/Auth Weaken"). So the question page and the dock were **not seen at 1280 or 390** at start, mid-run or end. This also means the dock has no chat check by eye; from the code (`screens-inquiry/assistant.mjs`) the dock offers three acts only: `airunopen` ("Work on this"), `suggest`, `airunclose`. **No chat exists, so the B2 chat exchange does not apply.**
- Workers Observability query (`POST .../workers/observability/telemetry/query`, service `agent-runner`) refused again: `code 10000 "Authentication error"`. So no `conversation.runner` / `runner.egress` lines; per-conversation time is total ÷ calls [inf].
- My attempt to sign out a session token (see 9) was blocked by the permission check; I did not retry it.

## 1. B1 step 1: Containers before the run

| Read | `agent-runner-agentrunner` (id a0341573-...) |
|---|---|
| List endpoint `GET /containers/applications`, ~16:47Z [test] | version 3, vcpu **0.0625**, memory **256MiB**, updated_at 2026-10-16T02:34Z, 7 instances, max 10 |
| Single-app `GET /containers/applications/<id>`, 17:25Z [test] | version **4**, vcpu **0.5**, memory **4GiB** (disk 8 GB), updated_at **16:42:15Z** |
| Rollouts `GET .../rollouts` [test] | rollout "Progressive update" version 3 -> 4 (target vcpu 0.5, 4096 MiB), started 16:40:06Z, completed (step 2 of 2 at 100%) about 16:41-16:42Z |
| Workers | `agent-runner` deployed 16:39:59Z, `agent-worker` 16:41:46Z, `biosmoke8` 16:43:02Z; image unchanged `agent-runner:b0220ffa2336` |
| Instances before the run [test] | `member:admin` **inactive** (since 16:46:09Z), `admin` inactive (02:35Z), `member:bob-test` inactive (02:35Z): **no instance running**, so a cold start |

**standard-1 (vcpu 0.5, 4 GiB) is confirmed for the fresh run**: the rollout was complete 7 minutes before B1 opened, and the run's own container showed up to 491 MiB of memory [test], which a 256 MiB instance could not. Caveat: my pre-run list read showed the old v3/lite figures (the list endpoint lagged the single-app read); I only re-read the single app after B1. Run-window CPU, below, is consistent with 0.5 vcpu (peak 0.35 utilisation = 8.6 cpu-s in one minute).

## 2. B1: what was made

- Fresh `marlowe-minutes.txt` (373 bytes, invented minutes of the Eastlake council, 24 Sept; lights failed 3 September, repaired 21 September, "eighteen days later"), `type=text/plain`, vouched with `release`. Record `INFO-2026-0007-marlowe-minutes-txt` (short name, so no cut-hyphen id). Reads as text: `findin` kind `term` "crosswalk" over the project finds **one hit, ¶2, full text, not cut** (`captures_read: 1`).
- Question `INQ-2026-0004-how-many-days-passed-between-the-marlowe` "How many days passed between the Marlowe Street crosswalk lights failing and their repair?", drawn into the project (`drawquestion`), passage cited as a supporting leg (`cite`, role supports, ord 0).
- Run **RUN-1efe27ab71508a74**, mode check, skill `investigative-session@1+7b404bd9e7316499`. `airunopen` answered at **16:49:37Z** (445 ms, `started: true`, `expires` 16:59:37Z); `airundispatch` 16:49:39Z (2.0 s, `dispatched: true`). The runner container `member:admin` went `running` at 16:49:41Z (cold start).

## 3. B1: the run

Ticks, pass, step (from the 30 s polls; full list in `walk-r6/ticks-b1.txt`): tick 3 plan 16:50 -> 4 fanout 16:51:44 -> 9 compose 16:55:53 -> 10 dedup 16:56:57 -> 12-25 "adjust" 16:58-17:04 -> pass 1 plan 17:05 (tick 27) -> fanout -> 33 compose 17:10:32 -> **35 dedup 17:11:36, the last tick**. Then nothing for 10 minutes. The plane stopped it at **17:21:56Z** : status `stopped`, condition "lease: the run stopped heartbeating and its lease lapsed: it died rather than finished".

Why (run log entry 11, 17:11:17Z): "Resumption: the dispatch to agent-worker did not complete (**REFUSED: SKILL_VERSION_MISMATCH**). The run was woken and is still resumable by its own principal". The run recorded pack `...+7b404bd9e7316499` at open; at 17:24 the plane publishes `investigative-session@1+33edb5b26bf81250` (stable over four reads 5 s apart). No worker deploy happened in between (last at 16:43), so the published pack changed on its own during the run (the instance was being used by other lanes: my second document got `INFO-2026-0013`, the first `0007`) [inf]. The agent-worker holds a run to the pack it opened under (`agent-worker/src/index.mjs` R48), so this run cannot be continued as it stands.

Result for the member: **no answer and no proposal reached the question** (`basisversions` on the question: 0 versions; the question shows only its cited leg). Yet the run had the answer: the content sub-session report (log 2, 16:53:29Z) says both dates and "eighteen days later", and the composed candidate in the run state reads "18 days: from the failure of the Marlowe Street crosswalk lights on 3 Sept 2026 to their repair on 21 Sept 2026", legs ¶2. It sat in the run state at the dedup step and was never written. **Answer found by the assistant: yes (18 days, correct), delivered to the member: no.**

## 4. B1 numbers against r5

| Measure | r5 (0.85.0, round 5) | r6 (round 6) | Note |
|---|---|---|---|
| Container size | not measured (lite, per the K3535 finding) | standard-1: 0.5 vcpu, 4 GiB, rollout 16:42Z [test] | confirmed for the run (see 1) |
| Cold start | not known | yes: instance inactive before, `running` 16:49:41Z, 2 s after dispatch [test] | |
| Open -> first model call | 2 min 35 s (13:51:45 -> 13:54:20) | **1 min 56 s** (16:49:37 -> 16:51:33) [test] | cold, both |
| Open -> end | 29 min 33 s, `finished`/`completed` | **32 min 19 s recorded** (`stopped`, lease), but the last model call was 17:11:17Z = **21 min 40 s** after open | died at the 10-min lease, not finished |
| Ticks | 37 | 35 | |
| Passes | 3 | 1 complete, pass 2 reached the dedup step (17:11) | |
| Calls (conversations) | 83 | **88** | |
| Tokens | 1,698,344 | **1,965,222** (+16%) | |
| Cost | $1.482 | **$2.503** (+69%) | session.cost, `final: true` |
| Per call [inf] | 1,596 s / 83 = 19.2 s | 1,184 s / 88 = **13.5 s** (first to last call, 16:51:33-17:11:17) | no Observability |
| Budget consumed | subsessions 12, runtime 96, fetches 0, wallclock 1,766,762 of 1,800,000 ms (98%) | subsessions 8, runtime 106, fetches 0, wallclock 1,294,073 ms (72%) | |
| `expires` | open said +10 min; session expiry moved as the run ticked | open 16:59:37Z; ended record shows 17:21:17Z (about 10 min after the last update) | same behaviour |
| Answer (18 days) | none | **composed, correct, not written** | |
| Written to the member | one false "found nothing supportable" proposal | **nothing** (0 versions) | |

Containers metrics, `containersMetricsAdaptiveGroups`, agent-runner instance, per minute over 16:49-17:23Z (`walk-r6/metrics-b1.csv`) [test]:
- CPU: total **45.6 cpu-seconds in 34 minutes (about 2% of one core)**; busy minutes at 16:56 (8.6 cpu-s), 16:59 (4.6), 17:03-17:04 (6.1, 6.4), 17:07 (7.3); max utilisation 0.35 of the 0.5 vcpu; most minutes under 0.1. The model calls dominate; the container is idle in between.
- Memory: 160 MiB at start, 463-491 MiB while working, 372 MiB flat after the run died. **The instance stayed `running` after the run ended** (`member:admin`, still running at 17:36Z), so it holds about 372 MiB doing nothing [inf: until its sleep timeout].

## 5. B2: one fact in one passage

Same project. `library-hours.txt` ("Notice from the Eastlake branch library. The library's new opening hour is 9:30 am."), vouched, cited as supporting leg ¶1 of `INQ-2026-0006-what-time-does-the-library-now-open`. Run **RUN-057d97eb40cae620** opened **17:26:02Z**, dispatched 17:26:04Z. Warm instance (the B1 container was still running, so not a cold start). Pack constant `...+33edb5b26bf81250` through every poll.

| Measure | B2 [test] |
|---|---|
| Open -> first model call | 1 min 07 s (17:26:02 -> 17:27:09) |
| Open -> end | **6 min 58 s** (17:33:00Z), `finished`, condition `completed` |
| Ticks / passes | 12 / 1 (plan, fanout, compose, dedup, close) |
| Calls / tokens / cost | 35 / 701,476 / **$0.70** |
| Per call [inf] | 351 s / 35 = 10.0 s |
| Budget | subsessions 4, runtime 39, fetches 1, wallclock 415,758 ms |
| CPU (metrics-b2.csv) | 10.6 cpu-s in the window; max utilisation 0.38; memory 479 MiB while working |
| Answer | the content report (log 2) quotes "...opening hour is 9:30 am"; **no answer and no proposal written** (0 versions on the question); state at close: candidates `[]`, submission null |

So the floor of a run for one fact in one passage is about 7 minutes, 35 calls, 0.7 M tokens, $0.70, and the member gets nothing on the question. The run log has no line about the candidate "1 candidate(s) composed" ever being dropped or written (r5's D6, still present). Chat: not offered by the dock (see 0), not timed.

## 6. What the member sees (from ops only; no screen was seen)

- On the question after B1: its one cited leg; `airuns` lists the run as `stopped` with condition bound `lease`. The dock's R45 ending text would say the run ended "why: lease" [code reading, unverified on screen]. No proposal, no answer, no explanation that the run could have been resumed.
- On the question after B2: run `finished`/`completed`, nothing written; a member reads "completed" and finds no answer.
- Both runs: raw ids appear in the run's reports ("INFO-2026-0007-marlowe-minutes-txt ¶2") and in the run log; the log lines quote the model's long prose cut at 200 characters as a "condition" (see D-N5).

## 7. Defects (journey/screen, what the member sees, evidence, severity)

Status of r5's D1-D9:

| r5 | State in r6 | Evidence |
|---|---|---|
| D1 cut-hyphen id | **Fixed in code, not re-run with a long name.** `promoteDocument` now trims after the cut (`slug.slice(0,40).replace(/-$/,"")`, R28). A short name gave a clean id and `cite` succeeded. | `screens-intake/capture.mjs`, INFO-2026-0007 |
| D2 empty type unread | **Not checked** (I sent `type=text/plain`; no browser to test a `.md`/`.csv`). | |
| D3 passages cut off | **Fixed for B1**: `findin` returns the full ¶2, and the content sub-session quoted "eighteen days later". In B2 the meaning level still saw "passage text not shown (snippet null)" (log 1), harmless there. | log 2, found.json |
| D4 meaning level contradicts itself | **Not seen in B1** (log 1 and log 6 agree on one leg). New cross-level contradiction instead, see N3. | |
| D5 false absence proposal | **Not seen**: no `level-empty-*` proposal was written, but nothing at all was written. | basisversions: 0 |
| D6 log disagrees with the record | **Still present.** B2: log 4 "1 candidate composed", log 5 "the run ended", no word on whether it was written; the record holds nothing. B1: candidate and submission sit in the run state, never written, and the log says only "dispatch ... REFUSED". | runlog-b1/b2 |
| D7 cost and wallclock | **Changed, not fixed**: B1 cost $2.50 (r5 $1.48), ended by the lease, not the 30-min bound; B2 floor $0.70. | section 4-5 |
| D8 vouch first | **Not re-checked on screen**; I vouched before the run. | |
| D9 member exposure (wizards, update-ready, roster) | **Not checked** (no member walk, no browser). | |

New in r6:

- **N1. A run dies on a changed skill-pack version and takes its answer with it.** Dock "Work on this" on a question; member sees the run end as "stopped / lease" about 32 minutes after it began, no answer. Evidence: log 11 `SKILL_VERSION_MISMATCH` at 17:11:17Z, recorded pack `7b404bd9e7316499` vs published `33edb5b26bf81250` with no deploy between; lease lapse 17:21:56Z; correct candidate in the state, never written. The pack's digest covers published instance data (`skillpack.mjs` `packVersion` over a pack built from `published` catalogs/wizards), so any such change on the instance during a 20-30 minute run kills it, and a resume attempt would be refused the same way. **High.**
- **N2. The assistant works across projects.** Run in my one-document project: B1's meaning report cites `INFO-2026-0005`, `INFO-2026-0006` and `INQ-2026-0002` (records of "WALK-085 project", which I never touched), and the composed submission carried legs to 0005 and 0006; B2's document level reports "24 docs in scope, 13 captures", and its meaning level counts "5 other inquiries (potholes/Marlowe minutes)". A member sees a proposal resting on documents from another project. This is read-only here, but it mixes evidence and wastes the run (B1 spent pass 2 on those captures). (As administrator, so check as a plain member.) **Medium-high.**
- **N3. The levels disagree and the run says so only to itself.** B1 log 6 (meaning): 0005/0006 ¶2 hold the same dates; log 7 (content): 0005 and 0006 hold only a header paragraph. Pass 2 spent about 6 minutes on this. **Medium.**
- **N4. "Completed" with nothing to show (B2).** Condition `completed: the run finished its work`, no proposal, no answer; the fact (9:30 am) exists only in the run log. **High** for the member, since the floor case yields nothing.
- **N5. The model's prose is pushed into the "condition" field.** Log 4, log 9 and B2 log 4: `condition stated as "Pass 1 reports, read together. Meaning (partial): ...", which is not a word of the record's condition vocabulary`, and a PRESENT is recorded as LOOKED_INDETERMINATE. The words are cut at about 200 characters. It lowers findings and shows raw text in the log. **Medium.**
- **N6. The instance sits on after the run.** `member:admin` stays `running` with 372 MiB for at least 3 minutes after the last tick (still running at 17:36Z), and the run's CPU use was about 2% of a core. Relevant to the hosting study (cost of an idle container). Info.
- **N7. Browser cannot open the instance** (0, above), so (c), (d) and every screen check remain unverified, as in r5. **Blocker for visual checks.**
- **N8. Cloudflare list endpoint is stale after a rollout** (v3/lite read at ~16:47Z while the app was v4/standard-1 since 16:42Z). Not a product defect; read the single application for Containers facts.

## 8. Reading for the study

- standard-1 is in force; the run is still 20-30 minutes for one question with one passage (B1), and 7 minutes for a one-fact question (B2). The container used about 2% of a core: the time is the model calls (13.5 s per call [inf] in B1, 10.0 s in B2) and their number (88 and 35), not CPU. A bigger instance did not shorten the run (B1 per call was 19.2 s in r5, 13.5 s now, but with 6% more calls and 16% more tokens).
- The run's cost went up ($1.48 -> $2.50) while the answer was reached earlier (the content report with both dates was in at 16:53Z, 3.5 minutes after open, and a candidate was composed at 16:56Z; the 18-day text is in the state I read at the end) and then the run went on to a second pass over documents of other projects.

## 9. Things I did wrong, for the record

- `NODE_USE_ENV_PROXY=1` is set in this session, so my first four node scripts (three sign-ins and some reads; no writes) reached the instance **through the agent proxy**, not directly; the proxy dropped the Authorization header (401s), which is how I noticed. From then on node ran with the proxy variables unset (`run.sh`), curl used `--noproxy` for the instance, and every write and the whole run were direct.
- A debug script printed the **login answer including the administrator's session token** once into my terminal output (visible in this session's transcript only; it is in no file). Its expiry is 2026-11-15. My sign-out call was blocked by the permission check and not retried. Suggest a sign-out of the `sparky` sessions (Settings > sign out everywhere, or password change) by whoever can.
- Leftovers on the instance, all in my own project: `INFO-2026-0007-marlowe-minutes-txt`, `INFO-2026-0013-library-hours-txt`, `INQ-2026-0004-...marlowe`, `INQ-2026-0006-...library-now-open`, runs `RUN-1efe27ab71508a74` (stopped) and `RUN-057d97eb40cae620` (finished). Nothing deleted. The `member:admin` container is still running.
