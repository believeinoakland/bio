# UX design session: handoff

Written 2026-10-01 by the UX design session `session_01EhPoUTrVCgAqw2ktRyKjCU` (Bob's primary account) for its successor; taken over the same day by `session_01TNeXM2Qvi7zMXT6BntbENE`, which ruled question 29 with Bob (DEC-111) and updated §3, §4 and §5. Read it whole, then `README.md` in this folder (especially "Working alongside the development process").

## 1. Who you are

You are the UX design session for CivicOS, working with Bob (the product owner) on his **primary account**. The development process (ROOT, BOB, module jobs, tranches) runs on his **secondary account**; you never start, message or steer its sessions. You meet it only in this repository, through the channel described in `README.md`.

- **Your branch:** `claude/gallant-brown-zg0wc1`. PR believeinoakland/bio#6 (DEC-96 to DEC-111) was merged into `main` at `994fd3f9ff` after T21 closed (K954; BOB's B3). Later work on the same branch, with `main` merged in, goes up as a new pull request, which BOB merges at a tranche's close. Keep it mergeable with `main`: merge `main` in, never rebase, never force-push.
- **Your outbox:** branch `mail/UX-DESIGN`, file `mail/UX-DESIGN.md` (append-only; never merges into `main`). Bob authorized pushing it. At takeover, rewrite its **Writer** line with your own session id ("since" = takeover date).
- **BOB's outbox:** branch `mail/BOB`, file `mail/BOB.md`. It opened on 2026-10-01 (B1 NOTICE of UX-relevant K-rulings, B2 DEFER of withdrawal to question 36, B3 ACK and the PR #6 merge); our Read cursor is in `mail/UX-DESIGN.md`. Read it at takeover and before every ruling.
- **The page you maintain:** `ux-substrate.html`, built by `build_ux2.py` from `ux-experience.json` and `ux-substrate-v2.json`, published at https://claude.ai/artifact/JsPZAftab91EL9Ut91qWGx with `views/*.html` beside it (publish with `files` mapping `views/<name>.html`).
- **Standing safety rules** (CLAUDE.md): never force-push; never rewrite `main`; never delete branch `snapshot/pre-refactor-2026-09-25`; never print a secret; Cloudflare account `20b533579290b9b93168345edd3b7f72` only. Push only to your branch and `mail/UX-DESIGN`. Never write `build/`, and BOB never writes this folder or `DECISIONS.md`.

## 2. Working with Bob

- Bob is a California energy public-policy strategist, active investor and independent analyst. He knows regulatory proceedings (the CPUC especially), evidence and public records; he is not a software engineer and does not read code or requirement files.
- He decides policy, doctrine, requirements, architecture and UX. Lower-level technical choices belong to BOB.
- He answers questions on the page tersely: "Q#24: as recommended", "Q#13: A", or a bulleted direction that modifies a recommendation. Quote his words verbatim in the DEC's `response:` (fix only an obvious typo, marked with brackets, e.g. "re[d]acted").
- Talk to him in plain words. No internal codes (DEC-, K-, R-, module names) in the explanation; put them only in sources. Show documents rendered (the published page), never Markdown source.
- When his message is direction rather than a pick among options, **explore with him before recording**: analyse, propose, offer a draft ruling, and record only when he confirms.

## 3. Recording a ruling: the checklist

1. `git fetch origin main mail/UX-DESIGN tranche/T<n>` (the current tranche). Read `mail/BOB.md` past your Read cursor if it exists. Grep the new K-rulings in `build/rulings.md` on `main` and the tranche branch for anything that settles or changes the question. If the development process already ruled, cite it; never record a second, conflicting ruling.
2. Append a DEC entry to `docs/development/DECISIONS.md` (copy DEC-110's shape: `raised:` with "the UX design session with Bob on his primary account (session_<yours>; the development process runs on his secondary account)", `for`, `question`, `why it is Bob's`, `provisional`, `alternative`, `recommendation`, `reversal cost`, `response` with his words, `decided`, `reasoning recorded in`, `owed`). **Next free number: DEC-120** (`main` has to DEC-116; this branch adds DEC-117 to DEC-119). Check both before using it.
3. Fold the ruling into the canon document it changes (`docs/architecture/*.md` or `docs/development/*.md`): a "RULED <date> by Bob (DEC-n)" passage, the document's Contents list and Status/"as of" line updated by hand (`tools/corpuscheck.mjs` was deleted on `main` in T19; there is no automatic check).
4. In `ux-experience.json`, give the question a `ruled` entry (the design as it now stands, plain words) and set `brief.stillOpen` to `false` (or `"partly"`, updating `alreadyDecidedPart`).
5. Build: `python3 docs/development/ux-substrate/build_ux2.py` from the repository root. Check it: `node <civicos-process clone>/checks/run.mjs /home/user/bio` (the format check must show 0 failures).
6. Commit (message `DEC-n: question N ruled (...)`) and push the branch. Update PR #6's description if its list of DECs changed.
7. Append a NOTICE to the outbox: copy the latest entry's shape (`## U<n> · NOTICE · <date> · <session> · primary`, one paragraph stating the ruling, then `Folded: <doc §>. On PR #6's branch. Owed (its owed: line): ...`). **Last entry is U28.** Push it without touching any other branch, by plumbing:
   ```
   git fetch origin mail/UX-DESIGN
   git show origin/mail/UX-DESIGN:mail/UX-DESIGN.md > /tmp/ux.md   # append your entry to this copy
   B=$(git hash-object -w /tmp/ux.md)
   T1=$(printf "100644 blob $B\tUX-DESIGN.md\n" | git mktree)
   T=$(printf "040000 tree $T1\tmail\n" | git mktree)
   C=$(git commit-tree $T -p origin/mail/UX-DESIGN -m "mail UX-DESIGN: U<n> NOTICE DEC-<n>")
   git push origin $C:refs/heads/mail/UX-DESIGN
   ```
   (`tools/mail.mjs` in civicos-process offers `xpost` and friends, but they need the branch checked out; the plumbing above is what has been used.) Check first that the mail branch's tree holds only `mail/UX-DESIGN.md`; if it holds more, rebuild the tree from it instead.
8. Republish the page to the artifact URL above, then tell Bob in plain words what was recorded and what is owed to BOB.

## 4. Where things stand (2026-10-01)

- `main` @ `615672a1a0` (T20 closing). T21 was in its last layer (layer 11) on `tranche/T21`; T22 is drafted. The page's inventory was refreshed to `main` @ `c1a27e41a5`.
- **Ruled:** every question, 1–36, 17 absorbed into 36 (the DECs from this stream are DEC-96 to DEC-116; K633, K899 (1), K899 (7), K903 (4) and K943 were ruled through the development process and are cited on the page).
- **Still open:** none. **The design phase (Bob, 2026-10-02, order as proposed):** (1) principles and standards, one page of every ruled principle with gaps marked; (2) brand architecture (DEC-118: the group leads) and voice; (3) journeys (reconcile 5 vs 20 audiences; the 11 journeys); (4) visual language (one system replacing the three conflicting looks: `civicos-ui/tokens.css`, the plan-page sketch, the measures map); (5) layouts and key screens, the assistant panel (DEC-90) among the first. Owed to us from BOB: the network-notice screens and wording (K1031 (5)).
- The briefs follow the schema in §6. When you rewrite one, edit `ux-experience.json` directly; do not regenerate the file wholesale (that would undo `ruled` entries and `stillOpen` flags).

## 5. Question 29: how the exploration went (RULED 2026-10-01, DEC-111)

Bob confirmed the final text on 2026-10-01; DEC-111 holds it whole, folded into Publication §5B, Roadmap §11 "Inter-group awareness" and Design Requirement 10. In the last rounds Bob added: a notice must come from a project defined as working on the issue, posted only by its owner; a "working on this since" date no earlier than the project's creation; an activity indicator computed and signed by the copy (five worded steps, over members' own work in the last 13 weeks); no anonymous notices (every group has its slug); "Interested in collaborating" as the only optional extra. Asked whether altered code could sign a fake, the answer recorded is: yes, and prevention would need a central host, so fakes are made attributable, impossible to backdate, and unable to rise past "Reported" without sealed weekly proof opened at publication. What follows is the history before those rounds.

**The brief.** "Does CivicOS connect to the network's directory, forum and 'working on' signals?" Options: A (they stay outside CivicOS; links out and a prefilled submission form, with a warning; recommended), B (CivicOS submits and shows directory status), C (a 'working on' act in CivicOS, with a full warning, optionally anonymous), D (out of scope).

**Canon it rests on.**
- Roadmap §11 "Inter-group awareness": groups discover each other "through the work, not through registration or coordination"; 'working on' signals are "Lightweight directory entries. Optional, anonymous-compatible, no ownership implied"; "No group owns an issue."
- Design Requirements v2: §3 groups form "without permission, registration, or announcement", and participation "is demonstrated by … published work, not by any formal affiliation"; §9 no single platform is essential; §10 believeinoakland.org as the directory (no pre-approval, a compliance status, community flags that stay visible, a downloadable mirror, and dead links "flagged as archived", never deleted); §13 designed for active opposition; §14 no single point of failure.
- Published cases are signed and readable at each group's own public, login-free index (Publication §3, §7).

**Bob's direction, verbatim.**
1. "I've registered believeincities.org, believeincities.com, believein.city. So every city could have a url redirect like believeincities.org/oakland or whatever. I think that we have to be careful in this decision to make sure that "catfish groups" don't pepper the local landscape with claims that they're working on this and that, and 10 other issues - thus discouraging other groups from taking up those causes. There needs to be some sort of feedback loop that creates clarity and fosters appropriate levels of collaboration, while not spooking other motivated groups."
2. "What if the CivicOS instance of a group claiming to be working on an issue got involved in the process of keeping a group honest? Maybe claims written by hand show as weaker than claims made by and communicated through a group's CivicOS instance provide more clarity about what's really going on."

**What the session proposed (Bob has not yet confirmed any of it).**
- **Domains.** The directory moves from believeinoakland.org to believeincities.org/<city> (believein.city as the short form): a change to Design Requirement 10 once he confirms.
- **The anti-catfish loop** (first reply): (1) claims expire unless renewed; (2) a follow-through record per group, computed from public facts ("14 claims, 3 led to published cases"); (3) every claim says "other groups are welcome", and claims on the same topic are shown side by side; (4) "Interested in coordinating? Knock" through the existing doorbell; (5) a cap on open claims tied to published work; (6) community flags, which stay visible; (7) anonymous claims are weaker and expire faster. Recommended core: 1–4; 5 and 7 if needed.
- **Three strengths of claim** (after Bob's second message): typed by hand → shown as "Stated", short expiry; kept current by the group's CivicOS, tied to a real project → "Active project · last activity this week", fades when the project goes quiet and is withdrawn or updated when it closes or publishes; backed by publication → part of the permanent record.
- **Refinement: the claim lives at the group's own address.** The group's copy publishes signed claims on its own public index; the directory *reads* them there. Freshness then checks itself, no single directory is essential (mirrors and rival directories can read claims too), and the format is open, so non-CivicOS groups can do the same. A hand-typed directory entry has no source to re-read, so it shows as "Stated".
- **Honest limits:** a signing copy proves origin and upkeep, not that the work is real (a catfish can run a copy with empty projects), so publication stays the strongest proof, backed by the record, the cap and flags; the subject of an investigation reads the directory too; a hand-typed claim is "stated", never "suspect" (CivicOS must not gatekeep legitimacy).
- **Open sub-questions put to Bob:**
  1. What a claim reveals: the group writes the topic wording (broad or exact; never filled in from the project's contents); the default activity shown is a bare heartbeat, with stage or counts only if the group opts in.
  2. Stopping: a claim never just disappears; it becomes "Lakeshore Tenants stopped working on this, 12 Nov", with an optional handoff note (the Roadmap's handoff pattern), and stops count in the record.
  3. Anonymous claims can earn credit later: signed with a key only the group can later prove is its own, and revealed after publication ("this claim, posted anonymously on 3 June, was ours").
  4. The catfish with its own copy: shows "Active", but the record, the cap and flags carry the weight.
  5. Two authorities: what CivicOS does is product policy (a DEC, folded into canon); how the directory displays and weighs claims is the network site's policy, which Bob sets as the domain holder, recorded separately as his direction to the network site, so a rival directory isn't bound by it.
- **The draft ruling offered:** "29: A, extended. A group's copy may publish 'working on' claims at its own public address, from a real project, after the outward-act warning. The directory reads them there. The group writes the topic wording, and the default activity shown is a heartbeat. A stopped claim says so and may carry a handoff note. Anonymous claims may be revealed by the group later. For the network site: claims kept current by a copy show their freshness, hand-typed claims show as 'Stated' and expire, each group's follow-through record is shown, and the directory lives at believeincities.org/<city>."
- **Also offered:** rewrite question 29's brief as "The network: believeincities.org, 'working on' signals, and keeping them honest", with these options and a worked example (a catfish group, "Oakland Forward", posting ten hand-typed claims; Lakeshore Tenants with one copy-kept claim on the Coliseum lease that becomes "Published a case on this" six weeks later; a third group that knocks on Lakeshore's doorbell to coordinate).
- **When recorded:** the CivicOS half folds into Roadmap §11 and the Publication document; the network-site half and the domain change into Design Requirement 10, or a passage in the Communications Platforms document, as direction to the network site. Owed to BOB: the "tell the network" act on a project, the claim feed in the public index, reading other groups' claims, and the stop and reveal acts.

## 6. The brief schema (for any brief you write or rewrite)

Each open question's `brief` in `ux-experience.json` has: `stillOpen` (true, "partly", false), `settledSince`, `title`, `inOneBreath`, `decision`, `alreadyDecidedPart`, `basics[]`, `today[]`, `problem[]`, `story{title, steps[]}`, `fixed[{point, why, src}]`, `options[{label, name, howItWorks, inTheStory, gains[], costs[], commitsYouTo}]`, `tradeoff`, `recommendation{choice, why[], risk}`, `howToAnswer[]`, `ifLeftOpen`, `related[{n, how}]`, `glossary[{term, plain}]`, `sources[]`, `size` (quick, short, session); optionally `absorbs`, `absorbNote`. Quality bar: each brief stands alone, defines every term, uses a concrete Oakland story with names and exact on-screen wording, gives 2–4 genuinely different options, keeps codes out of the prose (only in `fixed[].src` and `sources`), is honest about judgement and silence in the sources, and runs 1,000–1,800 words.
