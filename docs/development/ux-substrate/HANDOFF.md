# UX design session: handoff

§0 rewritten 2026-10-10 by `session_01SCHPX2mpSDpBNA9wprUm5H` (Bob's secondary account) at its pause. Before that: rewritten 2026-10-06 (evening) by the UX design session `session_01SEmEip2dMnNBFgsXF9Tids` (Bob's primary account) for its successor, at Bob's request when its context passed 65%. Predecessors: `session_011wdWGoa6RAbZiRU4Bn3Rng` (to 2026-10-06), `session_01EhPoUTrVCgAqw2ktRyKjCU` (to 2026-10-01), and earlier. Taken over 2026-10-06 (late evening) by `session_01NWPmrrYZbbF8Wkrvp5Y2vx` (archived 2026-10-07 18:00 UTC, after it went on answering comments past its handover: v75–v77, U110–U112). **Taken over 2026-10-07 (evening) by `session_01XZRZG4F5h3eL54heRZyusj`**, which handed over on 2026-10-07 at 19:45 UTC to `session_01SCHPX2mpSDpBNA9wprUm5H` on Bob's **secondary** account (§0; Writer line rewritten; the predecessor is not visible from this account to archive, and had already stopped watching and unsubscribed). **A successor archives its predecessor at takeover, once that session is idle, so only one session answers Bob's comments.** **Read §0 first: the state as handed over.**

## 0′. Takeover, 2026-10-11 (supersedes §0 where they differ)

`session_014uT5e8EjnRxmEeUDDg2cYa` (Bob's **primary** account; started by BOB #149, K2521) took over. The previous session was not visible from this account to archive. **Layouts page, new, from the primary account:** https://claude.ai/artifact/PjJoJCxMe1LHjt3wPq6rfa (watched; the secondary-account pages below are not reachable from here and are frozen; the other four pages get new links when they next change). **B123 answered, with B124 and B126, by DEC-189**; DEC-189 then. PR #21 merged at T41's close; the branch was fast-forwarded to `main` @ 65490c5e and carries DEC-189 in a new pull request (named by the outbox's latest MERGE). B128/B129 answered by DEC-190 (`pagetranscribe` on the Document screen); the next free DEC is **DEC-191**. B130 and B132: BOB merges PR #23 at T42's close, and folds DEC-189 (N856) and DEC-190 (N862) after. **Owed at T42's close, once `main` carries it (B131, K2651):** in `ux-substrate-v2.json`, re-code C-134.22 to `HYPOTHESIS_PROPOSAL_NO_RUN`, C-134.23 to `NO_SUCH_HYPOTHESIS_PROPOSAL`, C-142.28 to `NO_SUCH_STEP_PROPOSAL`, C-146.21 (and C-146.26) to `NO_SUCH_PLANNING_PROPOSAL`; and when `op=pagetranscribe` is served (T42-29, -30, K2654), re-point `owed:pagetranscribe K2611`. Read cursor: B132. S19 is still open with Bob; the next question is S20.


`session_01SCHPX2mpSDpBNA9wprUm5H` (Bob's secondary account, the design session since 2026-10-07 19:45 UTC, when it took over from `session_01XZRZG4F5h3eL54heRZyusj`) **pauses at Bob's request so that development continues on the other account** (Bob's primary). Everything is committed and pushed; nothing is half done. No check-in is armed, and this session has stopped watching the pages.

- **Your account, and what it changes.** The rules do not change: you never start, message or steer BOB's or its jobs' sessions, and you meet the development process only through the mail branches. **The five current pages were published from the secondary account.** From the other account they may read as another organization's (readable only if shared publicly, with no edit and no comments), as the primary-account pages did for this session. At takeover, `read` the layouts page (Artifact `read` with its URL). If the result says you are a writer, update it in place. If not, publish the built `layouts.html` as a new artifact from your account with its 15 supporting files (`visual-language/civicsmith.css`, the fonts under `visual-language/fonts/`, `icons.svg` and the rest; list them with the Artifact `list` action, scope `files`, on the current URL), watch it, and tell Bob the new link in one line. Do the same for another page only when it next changes. The layouts page's one comment thread (Bob's on the handle field) is resolved.
- **Branch and PR.** PR believeinoakland/bio#19 (DEC-188) **merged at T40's close** (`main` @ `8af83ac9`, "Merge PR #20: tranche T40"). Branch `claude/gallant-brown-zg0wc1` was fast-forwarded to that `main`; it carries only this handover beyond it, in the pull request named by the outbox's latest MERGE entry. Put later work on the same branch and pull request while it is open; once it merges, restart the branch from `main` (fast-forward only, never a force-push) and open a new pull request with a MERGE entry. **PR subscriptions failed for this session on every bio PR** (GitHub access itself was fine); read PRs directly in check-ins.
- **Outbox.** Writer line: still this session; **rewrite it with your own session id and account at takeover** (§3 step 7's plumbing). Read cursor **B122** (BOB's ACK of U142–U145: DEC-188 merged, its owed work planned into T41; membership built on S19's 1A and 2A). Last entry **U147** (U146 the pause, U147 the MERGE for PR believeinoakland/bio#21, this handover's pull request); the next is **U148**. Check the outbox for the last U number before posting.
- **First work: answer B123** (BOB #147, T41; four wording points, nothing changed on BOB's side meanwhile; each is read by key as it stands):
  1. `ai.refused.explorenotenabled` says exploring is off "or has no limit of its own yet", but ai-use R3 (Bob's A5, K2400) never refuses for a missing exploring limit; the overall limit judges it. Drop that half, and the same claim in `aiExplore`'s help in `screens/mock-screens.js` ("an exploring limit, which must be set first") and in DEC-188 (1). Record it as a DEC-189 amendment of DEC-188.
  2. `ai.label.explored` fills `{owner}` only for the paying account's owners (question-explorer R5, D64). Give the words other members see, for example "Machine work · found while exploring", without naming who enabled it.
  3. `words.json` still holds `act.accountswitchset.*`, `act.groupswitchset.*`, `act.aiceilingset.*` and `act.aicopyceilingset.*`, and has no `act.accountusesset.*` or `act.ailimitset.*`. T40 built the ops, so re-point the buttons from `owed:accountusesset DEC-188` and `owed:ailimitset DEC-188` (and the other DEC-188 owed acts T40 built; check `python3 screens/check_library.py` against `origin/main`) to the served op names. Rename their `ACT_HELP` and `WEIGHT` keys from `owed_<op>` to `<op>`, then rebuild `words.json`.
  4. Remove the retired `ACT_HELP` entries `aiceilingset`, `aicopyceilingset`, `accountswitchset` and `groupswitchset` from `screens/mock-acts.js` (and their `WEIGHT` entries in `mock-kit.js`).
  Then rebuild, walk, run the word list and the checks, commit, push, republish the layouts page, and post a NOTICE (and an ANSWER re B123).
- **Last DEC: DEC-188. Next free number: DEC-189** (check `main` and the branch first). DEC-188 (B119–B121): one AI account panel for the group's key (Members), a project's account (screen `projectai`, "AI for this project") and a member's own (The assistant); who pays; uses and exploring; limits; use summed naming no member; keeping material away from AI by use; the three queue items and the exploring label; `ai.*` words; the T39 `document.*` words adopted; `question.refused.drawnon`. DEC-187: the Photos gate covers every carried photo; any member who may see a photo may withdraw a mark, never the machine. DEC-186 (Bob, S18): a handle may be changed until the member's work first appears in a published case; members see "formerly". DEC-185: published photos' labels. DEC-184: the handle field says free, taken or not allowed. DEC-183: the Photos step is a gate. DEC-182: acts re-pointed to served ops. DEC-181: irreversible acts finish on a larger screen. DEC-180 (Bob, S17): people in a photo who are not its subject are obscured in the public copy. DEC-179: the word list, `screens/words.json`, built by `screens/build_words.mjs` (rerun it whenever screen words change; it fails on drift, duplicate keys and internal codes). DEC-178: a visit's photo is optional.
- **Bob is waiting on:** nothing. **Questions open with Bob:** **S19** (two details of DEC-186: may another member take a handle someone gave up, 1A reserved for good or 1B freed after a while; and does "work appears in a published case" mean the handle is shown in one, 2A, or any work carried, 2B; recommendation 1A and 2A; briefed in the layouts page's section 7, `screens/question.html`). BOB built membership on 1A and 2A; a different answer becomes an entry for BOB. The next number is **S20**. Still raised and unanswered from earlier (bring back at a natural moment, don't record): the two journalism practices and the requirement files' unmet items (§4).
- **Watching and check-ins.** This session holds no check-in and has stopped watching the five pages, so it will not answer Bob's comments beside you. At takeover: watch the pages (on whichever account holds them), arm your own safety-net check-in (§6) when a pull request is open. Never touch `trig_01LvNnxKBdB31x23mDSg9XBN` (not ours). **Archive this session (`session_01SCHPX2mpSDpBNA9wprUm5H`) at takeover** if it is still listed and you can reach it, so only one session answers Bob.
- **Pages (current: published 2026-10-07, 19:50 UTC, from the secondary account by `session_01SCHPX2mpSDpBNA9wprUm5H`, last republished 2026-10-09; the older primary-account pages below are frozen):** layouts https://claude.ai/artifact/4FjPjGmCVppDnMYfM7xkCw ("Civicsmith Screens", with its 15 fonts) · visual language https://claude.ai/artifact/Vd2L2KwMJzfq7qescEwipF (with its fonts) · journeys https://claude.ai/artifact/SbK4jAc8ZptpE9swYMkF1R · brand and voice https://claude.ai/artifact/89f5rt2BxDjawzWdqBkipe · measures map https://claude.ai/artifact/4xATEkTKekkLBPemWeehgy. Old pages (primary account, frozen, 45 resolved threads on the old layouts page): layouts https://claude.ai/artifact/WE1RL6GUUZX4dLeSzbFrbv (v84) · visual language https://claude.ai/artifact/QuvX7DzX7XbxS6SQG4MtT1 · journeys https://claude.ai/artifact/9hNPVCMcT8eyewWqKXfgSu · brand and voice https://claude.ai/artifact/EipzYKnNxe5LG3YwWnTkpv · measures map https://claude.ai/artifact/TfqcXNaJQ86SZzUA8Xn6Ni. Studies of 6 October, reference only: virus scanning https://claude.ai/artifact/RyKikoLNLsVZYMZaHpozKv, Cloudflare security https://claude.ai/artifact/GUXSZrDsJy4RuxG2bEFyaN, ZIP archives https://claude.ai/artifact/5UcQXtwmjvTCqADQsAMWN9.
- **Pushing:** pushes over about 100 KB fail with "remote: Internal Server Error" over HTTP/2. Always push with `git -c http.version=HTTP/1.1 push origin <branch>`.
- **The screens' machinery** (`screens/`): 48 screens (`projectai` added 9 October, DEC-188). `check_walk.mjs` also fails if any explaining element sits inside another (DEC-177; 8,084 checked).
  - `mock-acts.js` (`ACT_HELP`, one text per op, owed acts as `owed_<op>`): every new act needs an entry, or its button has no explanation.
  - `mock-kit.js`: `btn` (adds the `ACT_HELP` tip at level 2; `o.help` gives a contextual text), `sec` (`o.help` explains a heading), `field`, `writeHelp` (skips reason fields and acts of weight ≥4; DEC-153, K1841), `WEIGHT`, `WRITE_REFUSED`, `origin`.
  - `mock-screens.js`: SCR per screen; state switches are `main[data-st]` with `.st-a/.st-b/.st-c`; journeys pass `c = { ai, wizard, dockAssist, v, act }`.
  - `mock-shell.js` (`PATH`, `REFS`, `decorate`, `renderFrame`), `mock-refs.js` (`SCREEN_REFS`, `SCREEN_HELP`, `TITLE_HELP`, `RAIL_HELP`, `COL_HELP`), `mock-journeys.js`.
  - `registry.src.py` → `registry.json`; `library.src.py` → `library.json`.
  - `page.src.html` (the viewer; `untangle` (DEC-177), the row panels, picks and filter (DEC-176), table sorting; tips: `SHOW_MS` 500, `LONG_MS` 1500 for level-2 tips when `CS_LEVEL` is 1); `question.html` (the "For you" briefs).
  - Build `python3 build_page.py` (writes `../layouts.html`). Checks: `node check_walk.mjs` (Playwright), `python3 check_library.py` (default ref `origin/main` since 2026-10-09; `--ref` names another). The visual language: `visual-language/build.py`, `check_contrast.py`, `build_page.py`. `check_walk.mjs` also fails if any explaining element sits inside another (DEC-177). Then `node /home/user/civicos-process/checks/run.mjs /home/user/bio`: format, architecture and channels show 0 failures; coverage shows 10, the same as `main`'s own.
  - Pitfall: in Python edits of the JS, write `\'`, never `\\'`. A doubled escape breaks the page with "missing ) after argument list".
- **How Bob works:** he reviews the layouts page by comment, many in a row, each sent to Claude (it wakes the session). For each: change the page, build, walk, commit, push, republish, reply in the thread in plain words, resolve. He also gives direction in chat. A comment that would change a ruling of his is his: brief it on the page's "For you" section and in the thread (the issue first, an example, options A/B/C, the recommendation and its risk, "S<n>: A/B/C"), and record it only on his answer. **Never announce work and then stop**: do it in the same turn. What he asked for today, and what to keep doing: explanations that say what a thing does or means **in its context**, never only generic text; nothing found by scrolling elsewhere; no two explanations competing; numbers in examples computed, not invented.
- **Known mockup loose ends:** the queue's dates (due Friday vs a reply overdue since 9 October); the work orders' capture grade A on find and queue, B on the calculation; "Ben" appears once as a sixth member; the review-copy and ceremony dates fall after "today".

## 1. Who you are

You are the UX design session for Civicsmith (named CivicOS until DEC-124, 2026-10-03), working with Bob (the product owner) on his **primary account**. The development process (ROOT, BOB, module jobs, tranches) runs on his secondary account since K1891 (2026-10-07); you never start, message or steer its sessions. You meet it only in this repository, through the channel in `README.md`.

- **Your branch:** `claude/gallant-brown-zg0wc1`. Merged so far: PR #6 to PR #12. The open PR and the commit the branch holds are in §0. Keep it mergeable: merge `main` in, never rebase, never force-push. When a PR has merged and you push new work, restart the branch from `main` and open a new PR from it.
- **BOB merges a PR only after a MERGE entry from you** (U7, U29, U33 are the precedents), at a tranche close; Bob's standing direction (CLAUDE.md) lets BOB merge without his review. Post a MERGE entry for each new PR once it is ready.
- **Your outbox:** branch `mail/UX-DESIGN`, file `mail/UX-DESIGN.md` (append-only; never merges into `main`). At takeover, rewrite its **Writer** line with your own session id (since = takeover date). **Last entry and read cursor: see §0.** Check the outbox for the last U number before posting.
- **BOB's outbox:** branch `mail/BOB`, file `mail/BOB.md`. Read past your cursor at takeover, before every ruling, at each check-in, and whenever Bob says "check the channel".
- **The development process now:** T33 is running (K1507: BOB opens each tranche when its plan is ready, without asking Bob). It builds substrate only, no member screens (the timeline view, charts, the answer panel, the wizard library and the plan page are design work: T33-U1 to U4, C5); BOB's plan is `build/plan/current.md` on `tranche/T33`. BOB records Bob's answers given in its own session as K-rulings; some are design rulings (K1462, K1483–K1488, K1491, K1547). Fold them citing the K, never a second ruling.
- **Standing safety rules** (CLAUDE.md): never force-push; never rewrite `main`; never delete `snapshot/pre-refactor-2026-09-25`; never print a secret; Cloudflare account `20b533579290b9b93168345edd3b7f72` only. Push only to your branch and `mail/UX-DESIGN`. Never write `build/`; BOB never writes this folder or `DECISIONS.md` (K945).
- **Tools you need:** clone `believeinoakland/civicos-process` (attach it with `add_repo`) for `checks/run.mjs`.

## 2. Working with Bob

- Bob is a California energy public-policy strategist, active investor and independent analyst. He knows regulatory proceedings (the CPUC especially), evidence and public records; he does not read code or requirement files.
- He decides policy, doctrine, requirements, architecture and UX; lower-level technical choices are BOB's. Detail beneath his UX rulings ("Design's") is yours: decide it, record it, report it as done.
- **Bring Bob only what is his** (he asked, 2026-10-05: "How many of these journey questions really belong to me, as opposed to those that you can decide on?"). His: what Civicsmith must do (requirements), who may see what (doctrine), policy, and the meaning of his own rulings. Yours: detail beneath them (journey organisation, page housekeeping, member words he delegates, as DEC-131 and DEC-137). When you do bring him a question, **describe the issue first** (he said: "The remaining journey questions you want me to answer show your recommendation but don't describe the issue"): the issue, how it works today, a concrete example with names, two or three options with gains and costs, then the recommendation and its risk, and a one-word answer format. See J7–J13's briefs on the journeys page.
- He answers tersely ("Q#24: as recommended", "G1: A", "confirmed"). Quote his words verbatim in a DEC's `response:` (fix only an obvious typo, in brackets).
- Plain words to him; no internal codes in explanations (only in sources). Show documents rendered (published pages), never Markdown source.
- When his message is direction rather than a pick, **explore before recording**: analyse, propose, offer a draft ruling, record only when he confirms.
- **He comments on published pages.** Each page you publish is watched; a comment he sends to Claude wakes the session as a webhook. Read the thread (`ArtifactComments` read), make the change, republish, reply in the thread saying what changed, resolve it. Plain comments (not sent to Claude) do not wake you; read them when he asks.
- **He sometimes rules in BOB's session on design matters**, and the streams can drift: on 2026-10-02 he ruled anonymity one way through BOB (K1254, K1263) and reversed it with you the same day (DEC-119, BOB's K1275). Check BOB's outbox before every ruling, and if a ruling of his through BOB looks like a reversal of a DEC, raise it with him.

## 3. Recording a ruling: the checklist

1. `git fetch origin main mail/BOB mail/UX-DESIGN`; read `mail/BOB.md` past the cursor; grep new K-rulings in `build/rulings.md` on `main` for anything that settles or changes the question. If the development process already ruled, cite it; never record a second, conflicting ruling.
2. Append a DEC entry to `docs/development/DECISIONS.md` in DEC-110's shape (`raised:` names "the UX design session with Bob on his primary account (session_<yours>; the development process also runs on his primary account since K1428)", then `for`, `question`, `why it is Bob's`, `provisional`, `alternative`, `recommendation`, `reversal cost`, `response` with his words, `decided`, `reasoning recorded in`, `owed`). An amendment goes on an `amended:` line of the original entry, pointing to the new DEC. **Next free number: see §0** (check `main` and the branch first).
3. Fold it into the canon document it changes (`docs/architecture/*.md` or `docs/development/*.md`): a "RULED <date> by Bob (DEC-n)" passage; update the Contents list and Status/"as of" line by hand.
4. If it settles a question on the UX substrate page, give the question a `ruled` entry in `ux-experience.json` and set `brief.stillOpen` (edit the JSON in place: `json.load`, change, `json.dumps(indent=1, ensure_ascii=False)` round-trips the file exactly). If it changes the principles page or a design-phase page, edit that page.
5. Build and check: `python3 docs/development/ux-substrate/build_ux2.py`, then `node /home/user/civicos-process/checks/run.mjs /home/user/bio` (format must show 0 failures; any coverage failures should match `main`'s own).
6. Commit (`DEC-n: …`), push, update the open PR's description.
7. Append a NOTICE to the outbox (`## U<n> · NOTICE · <date> · <session> · primary`, the ruling in one paragraph, then `Folded: … Owed (its owed: line): …`), by plumbing, without touching any other branch:
   ```
   git fetch origin mail/UX-DESIGN
   git show origin/mail/UX-DESIGN:mail/UX-DESIGN.md > <scratch>/ux.md   # append, and move the Read cursor if you read new B entries
   B=$(git hash-object -w <scratch>/ux.md)
   T1=$(printf "100644 blob $B\tUX-DESIGN.md\n" | git mktree)
   T=$(printf "040000 tree $T1\tmail\n" | git mktree)
   C=$(git commit-tree $T -p origin/mail/UX-DESIGN -m "mail UX-DESIGN: U<n> …")
   git push origin $C:refs/heads/mail/UX-DESIGN
   ```
   Check first that the mail branch's tree holds only `mail/UX-DESIGN.md`.
8. Republish any page that changed (same file path, or `url` from a new session after a `read`), then tell Bob in plain words what was recorded and what is owed to BOB.

## 4. Where things stood on 2026-10-06 (history; §0 is current)

- `main` @ `a7fcb1063e`; T33 running. PR #11 open and ready (see §1). This stream's DECs are DEC-96 to DEC-137. **Next free DEC number: DEC-138.**
- **Recent DECs:**
  - DEC-128 (J1): audiences in three rings. Amended the same day: newsroom staff are a core audience in the members ring.
  - DEC-129 (J2): the wide path's eight rules.
  - DEC-130 (J5): every wizard is written in step 5.
  - DEC-131 (yours, delegated): the queue's third kind is "Status"; a machine signal (K1473) is a "hint".
  - DEC-132 (J7): who the group is.
  - DEC-133 (J8): the group's website key, and an optional reusable join link.
  - DEC-134 (J9): one administrator is enough. Design Requirement 1 is annotated.
  - DEC-135 (J13): asking for a check by expertise.
  - DEC-136 (J11): an administrator's option to tell members what a court can reach; members' own notes; principle 3.11, "Never claim more protection than there is".
  - DEC-137 (yours): J3, J4, J6 and J10, decided as design detail.
- **Bob's rulings through BOB, folded on 2026-10-05/06:**
  - K1483 to K1486: people named per Design Requirement 6 as amended; "never name an individual except in official role" now binds only Civicsmith's own voice and published surfaces; the words members see (connections, events and timeline, money words, people).
  - K1488: "claimed the same person, grade B, because …".
  - K1491: the machine's worth-a-look items as "Noticed", marked "Hint".
  - K1473: significance only as a labelled signal.
  - K1480 and K1493: the court-order path.
  - K1502 and K1547: each member connects their own API key or their own subscription token (`claude setup-token`), each serving only that member, or skips and uses Civicsmith without the assistant. The no-assistant path is yours to design (B44).
  - B41: Workers Paid is needed only for the subscription path and spreadsheet recomputation; on Workers Free only the API key works.
- **The design phase** (Bob, 2026-10-02; order approved):
  1. **Principles: DONE** (`design-principles.html`, 58 principles; 3.11 added by DEC-136).
  2. **Brand and voice: DONE** (`brand-and-voice.html`; §5 amended by K1483–K1488, K1491, DEC-131 and DEC-136).
  3. **Journeys: SETTLED 2026-10-06** (`journeys.html`):
     - twenty-seven journeys, re-checked against T33, each saying what is built and what is still to come;
     - seventeen wizard outlines;
     - the gaps to close (kept by DEC-137), including releasing a case when its story runs (to raise with Bob with the publication screens) and the subscription-token guide.
  4. **Visual language: NEXT.** One system replacing three conflicting looks: `civicos-ui/tokens.css` (its source `BIO_Design_Language_v0_2.md` is missing), the plan-page sketch, and the measures map. It covers:
     - type, colour, shape, motion, light and dark, icons;
     - the marks: grades, weights, origin, states, the queue's To do / Noticed / Status, the hint, the hold strip, and the wizard mark (not a gear).

     It builds on the plumb-bob mark (`marks/civicsmith-plumb-bob.svg`, DEC-126). Everything ships inside the group's Civicsmith, with no outside fonts (principle 9.6, DEC-122). It must meet WCAG 2.2 AA (DEC-99), and colour is never the only signal. The "Design System" artifact type is available (Artifact `quickstart`, intent "other").
  5. **Layouts and key screens.** In this order of work:
     - frames (working, published, imported), grid, phone and desktop;
     - rendered mockups walking the journeys, each also drawn without the assistant (K1547);
     - the assistant panel early;
     - all seventeen wizard scripts written and walked (DEC-130);
     - the bound sketches honoured (`views/start-and-send.html`, the filing panels of `views/surfaces.html`, the plan page).
- **Owed to BOB by you (design work):**
  - the rename's follow-ups as BOB asks (U36);
  - the reminder screen for an unsubmitted wizard draft (K1364);
  - the watch control and notice wording for an imported case (K1366);
  - drawings of the credit line and the case header (DEC-118);
  - the network-notice screens and the wordings of K1031 (5);
  - the product without the assistant (K1547);
  - the subscription-token guide in the connect wizard.
- **Owed to you by BOB:** nothing pending. U41 was answered by B38, U49 by B41 and B44. BOB's builds from your DECs: next.md N550 (DEC-131), N551 (DEC-132), N552 (DEC-133), N556 (DEC-134), N557 (DEC-135). DEC-136 and DEC-137 (U56) are not yet acknowledged.
- **Raised with Bob, not yet answered** (bring them back at a natural moment; don't record):
  - two practices from journalism: a case might say where an investigation began; and a rule against recording an anonymous person's characterisations of named individuals, even as leads;
  - whether some requirement files still list items unmet that job records say are met.
- **History:** DEC-96 to DEC-127 and the substrate page's questions 1–36 are all ruled; see `DECISIONS.md` and the UX substrate page.

## 5. Pages you maintain

| page | file (in this folder) | published at |
| --- | --- | --- |
| The UX substrate (all questions ruled) | `ux-substrate.html`, built by `build_ux2.py` from `ux-experience.json` and `ux-substrate-v2.json`, with `views/` | https://claude.ai/artifact/JsPZAftab91EL9Ut91qWGx |
| Design principles (approved) | `design-principles.html` | https://claude.ai/artifact/MvsMPnJnk3o32FBeqgdxT1 |
| Brand and voice (draft) | `brand-and-voice.html` | https://claude.ai/artifact/EipzYKnNxe5LG3YwWnTkpv |
| The new name (decided, DEC-124) | `new-name.html` | https://claude.ai/artifact/Fmr6rVd7GMifYDRaWcV7s8 |
| Journeys (step 3, draft, partly answered) | `journeys.html` (edit it directly) | https://claude.ai/artifact/9hNPVCMcT8eyewWqKXfgSu |
| Visual language (step 4, decided, DEC-138) | `visual-language.html`, built by `visual-language/build_page.py` | https://claude.ai/artifact/QuvX7DzX7XbxS6SQG4MtT1 |
| Screens (step 5, DEC-139; library approved DEC-148; questions S1–S16 all ruled, the last DEC-175) | `layouts.html`, built by `screens/build_page.py` | https://claude.ai/artifact/WE1RL6GUUZX4dLeSzbFrbv |
| Measures map (approved, DEC-82) | `measures-map.html` | https://claude.ai/artifact/TfqcXNaJQ86SZzUA8Xn6Ni |

From a new session, `read` a page (Artifact `read` with its `url`) before republishing to it, then publish with `url`; and watch each page you will receive comments on (`ArtifactComments` `watch` with its `url`). The design-phase pages share one look (the old design language's tokens: paper ground, Source Serif 4 for judgement, Source Sans 3 for plain speech, Source Code Pro for fact) as a reading format only; step 4 decides the product's look.

## 6. Pull requests and check-ins

After opening a PR, subscribe to its activity. While it only waits, keep one safety-net check-in (`send_later`): the first about 50 minutes after the last activity, later ones about 4 hours apart, re-armed silently when nothing changed; stop after three quiet check-ins in a row, when the PR merges or closes, or when Bob says stop, and cancel any pending one then. No CI runs on push in this repository (`regression.yml` is by hand only); run `node /home/user/civicos-process/checks/run.mjs /home/user/bio` before every push. **At takeover:** PR #13 is open (see §0); subscribe to it, delete the old session's check-in and arm your own.

## 7. The brief schema (for any brief you write or rewrite)

Each question's `brief` in `ux-experience.json` has: `stillOpen` (true, "partly", false), `settledSince`, `title`, `inOneBreath`, `decision`, `alreadyDecidedPart`, `basics[]`, `today[]`, `problem[]`, `story{title, steps[]}`, `fixed[{point, why, src}]`, `options[{label, name, howItWorks, inTheStory, gains[], costs[], commitsYouTo}]`, `tradeoff`, `recommendation{choice, why[], risk}`, `howToAnswer[]`, `ifLeftOpen`, `related[{n, how}]`, `glossary[{term, plain}]`, `sources[]`, `size` (quick, short, session); optionally `absorbs`, `absorbNote`. Quality bar: each brief stands alone, defines every term, uses a concrete story with names and exact on-screen wording, gives 2–4 genuinely different options, keeps codes out of the prose, is honest about judgement and silence in the sources, and runs 1,000–1,800 words. New questions from the design phase may live on the design-phase pages instead (as G1–G5 and V1–V4 do), each with options, a recommendation and an answer format.
