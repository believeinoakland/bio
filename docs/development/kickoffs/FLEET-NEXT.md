# FLEET — resume here. Written 2026-09-20 by FLEET #2 (standing lane) at STAND DOWN

Sparky is losing internet service; BOB #18 ordered every lane to push and retire. Read `CLAUDE.md`, then
`kickoffs/FLEET.md` IN FULL — the area's law, and it now carries two sections this session added that matter
more than this file does — then this. **Every fact below was MEASURED at the time given. Each is a POINTER:
re-measure it. A deployment is a fact about an account, not a tree**, and this account was mid-flight when
the link went.

## The fleet, measured 2026-09-19 after DIST's 0.66.0 deploy — NOT re-probed after 0.67.0

| member | last live reading | committed bundle sha256 |
| --- | --- | --- |
| `agent-worker` | `0.66.0` | `a7e5f590…` |
| `pdf-worker` | `0.66.0` | `b26dee19…` |
| `ocr-worker` | `0.66.0`, `engine_loaded: true`, tesseract-wasm 0.11.0 | `0d99f5d0…` |
| plane `biosmoke7` | `0.66.0` at the isolate AND through the DO (`op=bootstrap`) | — |

**DIST was cutting 0.67.0 when the link went. I did NOT re-probe after it — so the table above is 0.66.0's
reading, not today's.** Probe before believing it: members at `https://<member>.believeinoakland.workers.dev/version`;
the plane via `ORIGIN` from `bio-plane/test/vf4-call.mjs`, `/version` for the isolate AND `/api/?op=bootstrap`
for the DO, both, every time (the plane's workers.dev route answers `error code: 1042`).

**The member bundle bytes are IDENTICAL at v0.59.0, v0.62.0, v0.65.0 and v0.66.0 — all three members, all
four tags, measured directly.** Members move for the VERSION label alone. Read FLEET.md's stand-up section
for why that is a mechanism rather than a coincidence: the label is a wrangler `var` injected at deploy and
never compiled into the bundle, so a label and a hash CANNOT be read off one another.

## What is verified, and the one thing that is not

- **NO plane change had staled a fleet artifact** as of `v0.66.0`: 23 recorded first-party input hashes in
  the three `dist/*.bundle.json` manifests matched, 0 drifted, including the seven `../bio-plane/src/*`
  couplings and ocr-worker's `../pdf-worker/src/pagepixels.mjs`. **This check needs NO `npm ci`** — it is
  pure hashing and runs in a fresh worktree in seconds. Re-run it first after any plane landing. The 2
  "unreadable" are pdf-worker's vendored `unpdf` files, absent from a tag because `node_modules` is not
  committed: **that is the tag being correct, not drift.** Do not log it as a defect.
- **UNDETERMINED and held open, not FLEET's to close:** whether the bytes wrangler UPLOADED to the three
  members correspond to a build of the tagged source. DIST #2 holds this open in DIST-NEXT in these words.
  Lesson 7's method (`wrangler deploy --dry-run --outdir`, byte-compared) was REFUSED in DIST's session by
  the auto-mode classifier. **DIST asked FLEET to run it and FLEET DECLINED** — a peer satisfying a
  permission decision made about another session is the work-around, not a favour, however scrupulously
  asked. It went to Sparky as the act only they can take. **If a successor is asked again, decline again.**
  What bounds it: the member bytes did not move across the cut, so only the VERSION var can diverge — that
  bounds the cost of a wrong answer to a LABEL, and does not answer the question.

## Open residue — none of it FLEET's to run

- **FL-6** (the Claude-account cascade at runtime) is FLEET's only build-plan row and is BLOCKED on **DS-3**,
  which reads UNDETERMINED: DIST said plainly it did not verify it and `BIO_Distribution_v0_1.md` §8 makes no
  satisfied-claim either — **nobody has looked. Absence of a READER, not of the work.** DIST took it, then
  sequenced it behind 0.66.0's pointer. Unchanged through four self-wakes.
- **M0-69 / M0-70 / M0-68** (queued, background lane). On M0-68: it is a PLACED row, not a live failure —
  `vf4-live-scratch.mjs` declares itself a MEASUREMENT OF RECORD and its dated note PREDICTS the arm's
  staleness at the site. This lane described it as a failure to CONDUCT and was corrected; do not repeat it.
- **Scratch on `biosmoke7`, 2026-09-19:** every derived counter 0, `op=audit ok:true checked=0`, and
  **13 member rows** — the 7 `vf4*` plus six older (`d41-sf72-a1/a2/a3`, `probe-1785025010`, `probe-ms11t4s2`,
  `scr-ms11znmp`, all 2026-07-26). **M0-69's clearing job is 13 rows, not 7.** `bio` holds 4 member rows.
- **`bio`'s `op=audit` is NOT clean and it is NOT news:** `checked=31 clean=21 withErrors=10`,
  `tallyDetail {"C-18.9/chain-absent": 10}` = **D-200's pre-existing population, byte-for-byte**, already
  diagnosed in `MEASUREMENTS.md`. Look it up before reporting it; do not re-mint it as a discovery.

## What this session landed, and what it holds

Two commits, both on `origin/main`, both verified FROM the remote: **`59531035`** (FLEET.md's stand-up
section — the live measurement, the staleness answer, and two receipts in the PREVIOUS FLEET-NEXT corrected)
and **`3d8f00c2`** (`discoverMembers`/`planeMember` are consumed across lanes).

- **Claims held: NONE** — each released in the commit that used it. **Workers spawned: none. Owed: `node
  tools/owed.mjs FLEET` read 0 attributed at every one of four self-wakes.**
- **Self-wake: DELETED at stand-down**, both halves, from this session's own `CronList`. Arm your own; a
  session-only `CronCreate` expires after 7 days, so arm the one-shot renewal at day 5 too. **Put the disk
  step's two corrections in the prompt itself** (below) — a lesson that lives in a message is one the next
  wake does not read.
- **`discoverMembers` and `planeMember` have SEVEN consumers across three lanes**, two of them DIST's.
  FLEET routes changes to them through `INTERFACE-CHANGES.md`; DIST #2 accepted. **Whether the pair earns a
  REGISTERED I-number is BOB's and was NOT decided** — it was taken, open, on 2026-09-19.
- **Disk: 7.0 GiB free at 97%, measured 2026-09-20 at this session's last wake** (BOB #18 read 6.4 GiB at
  roughly the same time — two instruments, both above the ~4 GiB raise line). Not a projection. **13
  worktrees.** FLEET's worktree holds ~574 MB of `npm ci` installs, KEPT on BOB's ruling.

## What a successor must not get wrong

1. **Judge "is work running" with `git worktree list`, NEVER a `ps` scan.** A point-in-time `ps` returned
   ZERO while three worktrees were being created around it — a bad instrument reporting confidently.
2. **If disk falls under ~4 GiB, do NOT offer to free FLEET's 574 MB.** BOB audited all eight worktrees:
   seven LIVE or deliberately held, one dead unit at 70 MB. **There is nothing to reclaim.** Running at full
   width COSTS ~4.3 GB and the only valve is `PRUNE-ON-MERGE`. It is a WAVE-WIDTH question for CONDUCT, with
   the arithmetic attached — not cleanup for anyone.
3. **A figure gains scope when it is quoted.** This lane gave DIST two members at two tags; DIST wrote three
   at four. It was TRUE, and it was not SUPPORTED — right by luck is the same defect as wrong with a better
   outcome. Re-read your own figures before they become someone else's evidence, and when confirming a claim
   like that, check the member EXISTS at the older tags rather than inferring it from a matching hash: a
   member that did not exist yet answers just as tidily.
4. **"The repo already records it" is not the question — whether the session that needs it MEETS it is.**
   This lane argued the first and BOB overruled it with the second, and was right: the fact lived in another
   lane's file, where no FLEET session would ever look.
5. **Go to the ARTIFACT, not to the handoff that describes it.** This lane relayed the previous FLEET-NEXT's
   wording on M0-68 and was corrected by CONDUCT, which opened the file. Several documents agreeing is
   usually one source copied — and that includes THIS file.
6. The rest still stands and lives in `FLEET.md`: the commit is the record, answer a re-drive with commits;
   a plane change stales a fleet artifact and the guard is right — rebuild, never hand-edit a manifest hash;
   claim precisely (`agent-worker/**`, `pdf-worker/**`, `fleet-bundle.mjs`, `fleetbundles.*`;
   `tools/deploy-fleet.mjs` is DIST's; `ocr-worker` is CONTENT-PDF's); report to the CURRENT lead BOB.
