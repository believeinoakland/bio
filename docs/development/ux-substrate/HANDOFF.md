# UX design session: handoff

Rewritten 2026-10-06 by the UX design session `session_011wdWGoa6RAbZiRU4Bn3Rng` (Bob's primary account) for its successor, at Bob's request after step 3 (journeys) settled. Its predecessors: `session_01EhPoUTrVCgAqw2ktRyKjCU` (to 2026-10-01), `session_01TNeXM2Qvi7zMXT6BntbENE` (to 2026-10-03), `session_01JZtUsAKpStQoiwF6rzqsyJ` (to 2026-10-05). Read this whole, then `README.md` in this folder (especially "Working alongside the development process"), then CLAUDE.md.

## 1. Who you are

You are the UX design session for Civicsmith (named CivicOS until DEC-124, 2026-10-03), working with Bob (the product owner) on his **primary account**. The development process (ROOT, BOB, module jobs, tranches) also runs on his primary account since K1428 (2026-10-05); you never start, message or steer its sessions. You meet it only in this repository, through the channel in `README.md`.

- **Your branch:** `claude/gallant-brown-zg0wc1`. Merged so far: PR #6 to PR #9, and PR #10 (DEC-125 to DEC-127, merged at the T32/T33 boundary, K1508). **Open: PR believeinoakland/bio#11** (DEC-128 to DEC-137 and the folds of Bob's rulings K1471–K1547), marked ready, U50 MERGE posted; BOB said it merges it at T33's close with whatever is on the branch then (B42). The branch holds `main` @ `a7fcb1063e`. Keep it mergeable: merge `main` in, never rebase, never force-push. When a PR has merged and you push new work, open a new PR from the same branch.
- **BOB merges a PR only after a MERGE entry from you** (U7, U29, U33 are the precedents), at a tranche close; Bob's standing direction (CLAUDE.md) lets BOB merge without his review. Post a MERGE entry for each new PR once it is ready.
- **Your outbox:** branch `mail/UX-DESIGN`, file `mail/UX-DESIGN.md` (append-only; never merges into `main`). At takeover, rewrite its **Writer** line with your own session id (since = takeover date). **Last entry: U57 (HANDOFF). Read cursor: BOB B44.** Check the outbox for the last U number before posting.
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
2. Append a DEC entry to `docs/development/DECISIONS.md` in DEC-110's shape (`raised:` names "the UX design session with Bob on his primary account (session_<yours>; the development process also runs on his primary account since K1428)", then `for`, `question`, `why it is Bob's`, `provisional`, `alternative`, `recommendation`, `reversal cost`, `response` with his words, `decided`, `reasoning recorded in`, `owed`). An amendment goes on an `amended:` line of the original entry, pointing to the new DEC. **Next free number: DEC-138** (check `main` and the branch first).
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

## 4. Where things stand (2026-10-06)

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

     It builds on the plumb-bob mark (`marks/civicsmith-plumb-bob.svg`, DEC-126). Everything ships inside the group's copy, with no outside fonts (principle 9.6, DEC-122). It must meet WCAG 2.2 AA (DEC-99), and colour is never the only signal. The "Design System" artifact type is available (Artifact `quickstart`, intent "other").
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
| Measures map (approved, DEC-82) | `measures-map.html` | https://claude.ai/artifact/TfqcXNaJQ86SZzUA8Xn6Ni |

From a new session, `read` a page (Artifact `read` with its `url`) before republishing to it, then publish with `url`; and watch each page you will receive comments on (`ArtifactComments` `watch` with its `url`). The design-phase pages share one look (the old design language's tokens: paper ground, Source Serif 4 for judgement, Source Sans 3 for plain speech, Source Code Pro for fact) as a reading format only; step 4 decides the product's look.

## 6. Pull requests and check-ins

After opening a PR, subscribe to its activity. While it only waits, keep one safety-net check-in (`send_later`): the first about 50 minutes after the last activity, later ones about 4 hours apart, re-armed silently when nothing changed; stop after three quiet check-ins in a row, when the PR merges or closes, or when Bob says stop, and cancel any pending one then. No CI runs on push in this repository (`regression.yml` is by hand only); run `node /home/user/civicos-process/checks/run.mjs /home/user/bio` before every push. **At takeover:** PR #11 is open and ready; the previous session cancelled its check-in and unsubscribed at handoff, so subscribe to PR #11 and arm one.

## 7. The brief schema (for any brief you write or rewrite)

Each question's `brief` in `ux-experience.json` has: `stillOpen` (true, "partly", false), `settledSince`, `title`, `inOneBreath`, `decision`, `alreadyDecidedPart`, `basics[]`, `today[]`, `problem[]`, `story{title, steps[]}`, `fixed[{point, why, src}]`, `options[{label, name, howItWorks, inTheStory, gains[], costs[], commitsYouTo}]`, `tradeoff`, `recommendation{choice, why[], risk}`, `howToAnswer[]`, `ifLeftOpen`, `related[{n, how}]`, `glossary[{term, plain}]`, `sources[]`, `size` (quick, short, session); optionally `absorbs`, `absorbNote`. Quality bar: each brief stands alone, defines every term, uses a concrete story with names and exact on-screen wording, gives 2–4 genuinely different options, keeps codes out of the prose, is honest about judgement and silence in the sources, and runs 1,000–1,800 words. New questions from the design phase may live on the design-phase pages instead (as G1–G5 and V1–V4 do), each with options, a recommendation and an answer format.
