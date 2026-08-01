# BIO / CivicOS — standing instructions for every session

Loaded automatically. This is what EVERY session in this repository needs
regardless of which area it works in. Your area's own plan is in
`docs/development/kickoffs/<AREA>.md`; read it after this.

## Who you are working with, and what that means for you

Bob is the architect. He is fluent in software architecture, design patterns and
the engineering process, and he reviews at that level: consequences, tradeoffs,
doctrine, priority. He was once fluent in shells and editors and is deliberately
no longer, and that is a settled fact about how this project runs rather than a
gap to work around.

**So: never hand him a command to run or a diff to apply.** If something needs
doing on the machine, do it. If it needs doing repeatedly, script it. If it
cannot be done from where you are, say so plainly and name the single smallest
action only he can take — not a sequence of steps, and not a shell command
dressed up as a suggestion.

What to bring him instead:

- **Decisions that are actually his**, in the shape `kickoffs/README.md`
  defines: what is running provisionally, why it was ambiguous, the alternative,
  your recommendation, what reversing it costs. Nothing the repo already
  answers. Nothing you are better placed to decide.
- **Consequences, not implementation.** "Publishing would then be permitted for
  material we cannot attribute" is his call. "Should this be a Map or a Set" is
  not, and asking makes him do your job.
- **The correction when he is wrong**, with the evidence. He corrects course on
  evidence and expects the same back; agreeing with him when the measurement
  says otherwise is the least useful thing you can do.

He will often hand a determination back — "you decide what the proper metric
should be", "you do what you know to be right." That is delegation, not a
formality. Decide it, implement it, record the reasoning where the next session
will find it, and tell him what you chose and why. Do not return the question.

One consequence for tooling: a session that stops every few minutes for
permission to run a command is not usable at this level. `.claude/settings.json`
already pre-approves everything this project does routinely, so if you find
yourself prompting him for a command that recurs, ADD IT THERE rather than
asking twice. Reserve the interruptions for the three things that are actually
gated: pushing, deploying the plane, and deploying the installer.

## What this is

A civic accountability record. Groups capture what a public body published,
prove later that it said what they claim, and build cases on it. The whole
product is TRUSTWORTHINESS OF THE RECORD, so a defect that makes the record
claim more than it can support is worse than a missing feature, and much worse
than an ugly one.

The plane is a Cloudflare Worker plus a Durable Object with SQLite, R2 for
captured bytes. `newgroup` is the installer that puts a sovereign instance into
a group's own Cloudflare account — that is the distribution model, not a demo.

## The rules that are not negotiable

**Never force-push.** Fetch and rebase.

**THE REPOSITORY IS THE CHANNEL. A change is not made when it is written; it is
made when it is COMMITTED AND PUSHED.** Sessions do not share a working tree: an
area session works in a git worktree, and a worktree is a checkout of a COMMIT, so
an uncommitted file reaches nobody and an UNTRACKED one cannot even be found. On
2026-07-31 a session wrote the rule "an area may not be ACTIVE without a kickoff",
created the missing kickoff, and left it untracked while three workers were already
running — so both the rule and its fix reached no one. Verify from the REMOTE, not
from your own tree, the same way `deploy.mjs` reads the bytes back from the account
rather than trusting the upload.

Before you hand off, run it — this is not advisory:

    node tools/plancheck.mjs

It fails on an unpublished or unpushed planning surface, an ACTIVE area with no
kickoff, an item behind an unregistered interface, a milestone that does not exist,
and an open debt row with no disposition.

**Before making a change another session must know about, read
`docs/development/ORCHESTRATION.md`, "COMMUNICATING A CHANGE".** It is the skill this
ecosystem runs on: which channel carries what, the rules that make each work, and the
receipts for every way a correct change has failed to reach anybody.

**A mechanism that is not in the loop the reader actually runs is not a mechanism.**
Documenting it is necessary and never sufficient. If you add a step, add it to the
file whose owner must perform it — `kickoffs/CONDUCT.md` for CONDUCT, the area's
kickoff for an area — not only to the document that explains it.

**Measure, do not assume.** Numbers come from `docs/development/MEASUREMENTS.md`
and go into it with their date and instrument. A vendor's documentation is a
claim, not a measurement, and gets labelled as theirs. On 2026-07-31 three
claims the archive design rested on turned out to be wrong when finally
measured; every one had been in the design document for weeks.

**Run the negative control.** Break the thing you just tested and confirm the
suite fails. Neutering the inbox write-path grammar check left all 67 assertions
passing, because every input the code generated was well-formed by construction:
the suite was testing something else and nobody could have known without the
control. A suite that does not fail when you break its subject is not a suite.

**Correct superseded tests, never exempt them.** If a rule changed, change the
assertion and say in a comment why the old one was wrong. An exempted test is a
rule nobody is enforcing and nobody remembers deleting.

**Test through the op, and verify live.** A store-level test and a passing
battery are not evidence that a caller can reach the feature. `op=invitelook`
shipped with a ReferenceError while 1276 assertions passed.

**A deploy verified is not a build serving.** `deploy.mjs` proves the bytes
landed. Rollout is per-isolate and NOT atomic: seconds after a byte-identical
verification of 0.52.0, `/version` answered 0.51.0 and a probe answered by the
old build looked exactly like a security defect in the new one. `deploy.mjs` now
waits for the version to serve. Durable-Object-routed ops can still lag after
that. **If a live probe contradicts the suite, establish which build answered
before believing either.**

**An equality or an outcome that costs nothing to produce is not evidence.** Our
governor refusing is not the source failing. Two empty-body digests agreeing
agree on nothing. A provenance hop a caller can hand us is one a caller can
invent. All three are enforced structurally, not by convention.

**Undetermined is first-class and must be STATED.** Never invent an attribution
to get past a gate. A gate that pressures someone into inventing one is a bug in
the gate: that is why the publication fence moved off the content axis onto the
provenance chain.

**Do not create debt that can be avoided.** When you must, write it in
`DEBT.md` with what it costs and what closing it takes.

## Working in an area

Areas, claims, interfaces and the change protocol are in
`docs/development/PARALLELISM.md`. The short version:

- **Claim your area in `docs/development/CLAIMS.md` before editing**, and say
  which paths. A claim keeps other sessions out.
- **Do not edit another area's paths.** Append a DELEGATION entry saying what
  you need and continue with your own work.
- **Interfaces are stable by default.** To change one, use the protocol in
  `INTERFACE-CHANGES.md`. Do not change a shape another area builds against
  just because you can reach the file.
- **Use a worktree**: `claude --worktree <area>`. One session per worktree.

## Cutting a release

**Only the `DIST` area cuts plane releases**, and only from a green `main`. If
you are not DIST, do not bump a version, sign, tag or deploy the plane. Land
tested code and ask DIST. See `docs/development/kickoffs/DIST.md` for the gate.

## Verification discipline, in order

`docs/development/VERIFICATION.md` is the full process, the coverage floor and the
measured state. The short version:

1. `cd bio-plane && npm run test:battery` — EVERY suite, all of them reported. Not just
   the suite you touched. As of M0-4 `npm test` runs the same discovering runner (it no
   longer chains with `&&`, which stopped at the first failure and hid everything after
   it — D-93), so either entry point runs the whole battery; `test:battery` is the
   canonical name.
2. The negative control for whatever you just added — RUN, and recorded in the
   suite's own `NEGATIVE CONTROL:` line so the next session can re-run it in one step
   instead of re-deriving how to break the subject.
2a. `npm run test:coverage` — no NEW unreached op, and an op you added carries a
   control-plane assertion in the same turn. Coverage here is ops, checks and
   controls; line coverage is not measurable, because the plane runs inside workerd
   and not in the node harness.
3. Build, sign, deploy (DIST only), and wait for the rollout gate.
4. Live-verify **in your own instance's scratch namespace**, never the real
   record, and sweep it after.
5. `op=audit` clean before you call anything done.

## Where things are

| Path | What |
| --- | --- |
| `bio-plane/src/` | the plane: `index.mjs` control plane, `store.mjs` the DO, `schema.mjs`, `cdx.mjs`, `subresources.mjs` |
| `bio-plane/checks/bio-checks.mjs` | the check catalog. C-numbers. The gate runs it |
| `bio-plane/test/` | the battery. `hygiene.test.mjs` catches source-level hazards |
| `newgroup/` | the installer. Out of bounds without an explicit instruction |
| `docs/development/MILESTONES.md` | the capability ladder, and where every open piece of work sits |
| `docs/development/QUEUE.md` | what is RUNNABLE now. CONDUCT's, sole writer. `PLAN.md` is closed history |
| `docs/development/VERIFICATION.md` | what "tested" means here, the instruments, and the floor |
| `docs/development/` | DEBT, MEASUREMENTS, the designs, the kickoffs |
| `release/` | the signed artifact and RELEASE.json |

## Traps that have already cost time

- **New schema tables go BEFORE the `host_governor` block** in `schema.mjs`.
  `hygiene.test.mjs` asserts the literal ends on a `);`.
- **No backticks inside the schema or setup template literals.** A balanced
  stray pair still parses, so `node --check` will not save you.
- **A derived table must be added to `purge`** or a whole-store purge reports
  scope ALL and silently leaves rows (D-113).
- **`store.mjs` is ~4900 lines.** Grep before assuming a helper does not exist.

## Which Cloudflare account you are talking to

`wrangler` authenticates from an OAuth session stored on the MACHINE, and a
machine may well be logged in to a different account for unrelated work. On
2026-07-31 a fresh checkout was found authenticated to `neologic`, not to this
project's account, and a deploy would have SUCCEEDED — putting the installer
somewhere nobody was looking, with no error to notice.

Both `wrangler.jsonc` files now pin `account_id`, so the repository decides
where a Worker goes rather than the machine. Do not remove it, and do not add a
new Worker config without it.

`scripts/deploy.mjs` was never exposed: it takes the account from `CF_ACCT` and
talks to the REST API directly. The exposure was `wrangler deploy`, which the
installer uses. If a wrangler command ever reports an account other than
`20b533579290b9b93168345edd3b7f72`, stop and say so rather than proceeding.

## Credentials

Read from `.env`, never committed. `.env` is gitignored and carried into
worktrees by `.worktreeinclude`. `tokens.mjs` denylists any token value
published in the repo and treats it as NOT SET, so committing one revokes it.

**How a secret gets onto the machine, since the operator does not edit files by
hand and should not be typing tokens into a conversation:** he copies the value
to the macOS clipboard from wherever he keeps it, and you read it with
`pbpaste`. The value never appears in a prompt, a transcript, or a tool call
you print.

    printf 'CLOUDFLARE_API_TOKEN=%s\n' "$(pbpaste)" >> .env

NEVER echo, cat, or otherwise print a secret you have read this way, including
"just to confirm it landed". Confirm it by USING it: run the command that needs
it and report what the SERVICE said. `npx wrangler whoami` reporting the right
account is proof the token is correct; printing the token proves nothing and
puts it somewhere it was not before.

If a value is already visible in the conversation because it arrived there
before this rule existed, do not repeat it. Use it and move on.
