# Why sessions ask Bob for approvals: occasions, causes, fixes

Read-only research for BOB #97, 2026-10-02. Sources: `bio/build/rulings.md` (K…), `bio/docs/development/TRANSITION.md` (TR:line), `bio/build/plan/archive/*.md`, `civicos-process/PROCESS-*.md`.

## 1. Every recorded approval or refusal

| # | Date | Session | Act refused or flagged | What it was doing | Bob | Standing list? |
|---|---|---|---|---|---|---|
| 1 | 09-26 | BOB #38 | Retire old push guard (hook removal) | T7 step "retire the old guards" (TR:85, :87) | approved | later yes: `rm .git/hooks/*` (K112) |
| 2 | 09-27 | BOB #44 | Edit mechanics §16 and `.claude/settings.json` | Writing the K111 revision | Bob wrote them himself on GitHub; "an approval of a page or list did not clear a refusal, one naming the act did" (K112) | n/a |
| 3 | 09-27 | BOB #47 | Fast-forward both repos' `main`; archive BOB #46 | Landing a certified revision (TR:116) | approved; archived #46 himself | no |
| 4 | 09-27 | LEGACY-INDEX #3 | Edit `bio-plane/scripts/coverage.mjs` | T6-13 entry (archive/T6.md:62; T6.md:15 lists "auto-mode refusals (K153; merge to `main`)") | carried forward | no |
| 5 | 09-28 | LEGACY-TESTS #4 / BOB #53 | Delete four retired suites | N53 | approved "the act itself; … not a standing-list act" (K215) | no |
| 6 | 09-28 | BOB #55 | Every act ("no verdict" fault) | Takeover | session replaced; "remedy is to replace the session, not to approve in it" (K273) | n/a |
| 7 | 09-29/30 | BOB #68, #69 | Archive BOB #67, #68 | Takeover archive (§2, K112(1)) | approved (K480 NEEDS BOB, K508) | **yes**, K511 `mcp__Claude_Code_Remote__archive_session` |
| 8 | 09-30 | BOB #69 | Move own WATCH; `get_session` on a job, "Self-Modification" | Backstop, "minutes after K511's settings edit" (K512) | NEEDS BOB | no |
| 9 | 09-30 | BOB #71 | Archive BOB #70; delete its backstop | Takeover; rule "did not match" because the tool is served under another server name (K526) | relayed; not needed at K550 | rule name stale |
| 10 | 09-30 | BOB #73 | Delete predecessor's backstop | Takeover (K564) | told, inert | no |
| 11 | 09-30 | LEGACY-TESTS #15, #16 | Push removing 305 test files | Legacy-tests retirement (K612); #16 started before the rule (K620) | approved as policy (K618) | **yes**, four `git rm -q --` rules |
| 12 | 09-30 | LEGACY-TESTS #17 | Edit DEC-49 guard floors | K619 (K622) | none; act dropped | no |
| 13 | 09-30 | BOB #75 | Merge PR #4 (UX branch) into `main` | Handoff carried "NEEDS BOB, PR #4 onto main" (commit 3bc4bffa53) | "Approve merging … (PR #4)" (K626) | **no**: "each time on Bob's word" |
| 14 | 09-30 | BOB #77 | Delete predecessor's routines (#76 mid-turn) | Takeover | "BOB's own act (P17), never Bob's" (K687) | no |
| 15 | 09-30 | CASE-AUTHORING #7 | Push (commit lost) | Layer 8 (K693) | stopped all sessions | no |
| 16 | 10-01 | LEGACY-INDEX #11 | `git rm` migrate/, probes | T18 L11 (archive/T19.md:132) | approved in session (K739) | no |
| 17 | 10-01 | BOB #87 | Delete predecessor's backstop | Takeover (K929) | inert | no |
| 18 | 10-01 | BOB #89 | Merge PR #6 into `main` (flagged after) | Handoff + K954 "PR #6 merged … right after T21's close" | "Keep PR #6 merged; approved" (K1014) | **not decided** (K1014 is silent on §16) |
| 19 | 10-02 | BOB #92 | Archive BOB #91 | Takeover (K1067) | approved (K1091) | no: "not a stable pattern" |
| 20 | 10-02 | BOB #93 | `node tools/mail.mjs xcheck --as BOB` | Channel read, §13.1 item 3 (K1095) | approved (K1110) | recommended, **not added** |
| 21 | 10-02 | BOB #94 | Delete predecessor's backstop | Takeover (K1113) | told | no |
| 22 | 10-02 | BOB #97 | Merge PR #7 into `main`; next command refused "Merge Without Review" | Handoff: "PR #7 is merged into `main` at T23's close, K1014's order" (TR:160) | "Keep PR #7 merged; approved. Fast-forward main…" (K1177) | open |

Not classifier refusals (true Bob-only acts, correctly handled): repo creation, GitHub 403 (TR C11); tags refused by proxy (TR:62).

## 2. Root causes

**(a) A process step orders an act the permission layer reviews — CONFIRMED, the largest group.**
- Takeover (§2, §5.1, K112(1)) orders archiving predecessors and deleting their routines: #3, 7, 9, 10, 14, 17, 19, 21 (8 of 22). §5.7 step 3 orders fast-forwarding `main` (#3; and K1177, where Bob also had to say "Fast-forward main").
- Legacy retirement entries order bulk deletions and guard edits: #4, 5, 11, 12, 16.
- §13.1 item 3 orders `xcheck` at every takeover and backstop: #20.
- The UX PR merge: #13, 18, 22.

**(b) A handoff carries a reviewed act as routine — CONFIRMED.** TR:160 "PR #7 is merged into `main` at T23's close, K1014's order: check it is on `main` first". It neither says the act needs Bob nor that it was flagged last time. Compare PR #4, where the handoff said "NEEDS BOB" and there was no confusion (#13).

**(c) Lessons in rulings never turned into a rule or a standing permission — CONFIRMED.**
- K1014 recorded Bob's approval but not the standing-list decision §16 requires ("When Bob has approved, BOB says whether the act should join the standing list"). So PR #7 recurred.
- K1110 recommended `xcheck` for the list; it is absent from both settings files.
- Deleting a predecessor's routines was refused 5 times (#10, 14, 17, 21, and #9). K687 calls it "BOB's own act" but never added a permission.
- K526's name mismatch was never fixed. The rule says `mcp__Claude_Code_Remote__archive_session`; this session's tool is `mcp__claude-code-remote__archive_session`. That may explain why archiving was refused again at #19 (K1091 read it as "not a stable pattern").

**(d) Stale or drifting instructions — CONFIRMED as drift, not crossing messages.** The merge authority hardened through each paraphrase:
- K626: "each time on Bob's word"
- K954: "BOB's recommendation, not countermanded"
- K1014: done "on the handoff's word", then confirmed
- K1134: "merged at T23's close, K1014's order"
- the handoff (TR:160)

K1014 records a one-off confirmation, not an order.

**(e) Other.**
- Approval locality: an approval clears only the refused session ("an approval typed in another session does not reach it", §16; K618). A rule added mid-tranche misses sessions already running (K620).
- Self-modification side effects: editing settings is refused (K112). Refusals of earlier-allowed acts followed a settings edit (K512).
- Session-specific classifier faults (K273): replace the session, never ask Bob.
- Approval of a page does not clear an act (K112).

## 3. Who lands the UX design stream's PR on `main`, and how

No text defines this unambiguously.
- **P12**: "Bob's UX design stream may land on `main` meanwhile; the tranche's close then merges `main` into the tranche branch." This is passive and names no actor.
- **§4**: the same wording. **§5.7 step 1**: "If `main` has moved (Bob's UX stream, §13.1), merge `main` into the tranche branch first." It assumes the stream has already landed and gives BOB no step to merge it.
- **§13.1 item 4**: "`MERGE` (asks the other side, or Bob, to merge a branch)". "The other side" can be read as BOB, which licenses BOB merging into `main`. That conflicts with item 1: "never merged into `main` (P12: this process never changes `main` while a tranche runs)".
- **Manifest "Parallel work"**: "`main` can move while a tranche runs when that stream lands." It is passive again, and the stream is "outside this process".
- **K592**: a design session "never merges its branch".
- **K945**: the process "merges a moved `main` into the tranche branch at close". Nothing says who lands the PR.
- **K626**: "reaches `main` only at a boundary, each time on Bob's word". This is the only explicit rule. The principles and mechanics never absorbed it.
- **K954, K1014, K1134**: see (d).

Result: the design session may not merge (K592), BOB is never told to, and the only explicit rule (K626) needs Bob's word each time. So under today's text the merge is always either an ask of Bob or a flagged act. Note also that P12 lets the stream land at any time, not only at a boundary, so K626's boundary rule is stricter than P12.

## 4. Standing list today

- **`bio/.claude/settings.json`**:
  - `defaultMode: bypassPermissions`.
  - Allow: `Read`, `Grep`, `Glob`, `Bash` (all), `Bash(rm .git/hooks/*)`, `Bash(rm -f .git/hooks/*)`, Edit/Write on `//home/user/civicos-process/**`, `mcp__Claude_Code_Remote__archive_session`, and four `Bash(git rm -q -- <bio-plane|civicos-ui|agent-worker|ocr-worker>/test/:*)`.
  - Deny: force-push variants, `git reset --hard`, `git clean -fdx`, `rm -rf`, `sudo`, `chmod 777`.
  - Ask: `.env` edits.
- **`civicos-process/.claude/settings.json`**: the hook removals, Edit/Write on civicos-process, and `mcp__Claude_Code_Remote__archive_session`.
- **Not on the list**: routine deletion, `xcheck`, merging the UX PR, fast-forwarding `main`.
- **Observation**: `Bash` and bypass are already allowed, yet the auto-mode classifier still refuses. The allow list does not reliably bind it. It was honoured at K515 and K550, and failed at K526 and K1067. Allow rules reduce refusals; they do not guarantee their absence.

## 5. Proposed changes, ranked (smallest first by effect)

Principle changes need Bob (P16). Mechanics revisions are BOB's to draft, certify (P3, §15) and report (K113). All of them need certification before use.

1. **Take BOB out of the UX merge.** Mechanics §4, §5.7 and §13.1 item 4, plus the manifest:
   - The stream lands its own PR, in its session, on Bob's word there. Bob is already present there, so this is his act, not a confused ask.
   - BOB never merges a branch it does not own into `main`. `MERGE` from BOB is addressed to UX-DESIGN only.
   - §5.7 step 1 stays: merge a moved `main` in.
   - K626's "only at a boundary" yields to P12's "may land … meanwhile".
   - Serves P2, P12, P17. This removes #13, #18 and #22.
2. **Handoff rule (§5.8):** a handoff never lists, as routine, an act that changes `main`, another party's branch, or a session or routine. It cites the step that orders it, and if the act was ever refused it names the K and says so. Supersede the K1134 and TR:160 wording "K1014's order". Serves P13, P15.
3. **Close §16's loop.** Every ruling that records a Bob approval states "standing list: joins (rule …) / not (reason)". The format check fails a §16 ruling without it. Serves P15, P16. This would have caught K1014 and K1110.
4. **Repair the standing list.** Bob approves it once as policy, and BOB writes the rules and rulings:
   - add `mcp__claude-code-remote__archive_session` (the current server name; keep the old one);
   - add `mcp__claude-code-remote__delete_trigger`;
   - add `Bash(node tools/mail.mjs xcheck:*)`.
   None of these loosens a safety rule. Serves P13, P17. This targets 11 of the 22 occasions.
5. **Design steps around reviewed acts.**
   - Takeover archives and deletes only after the predecessor is idle (K687 already says so; make it a numbered step).
   - A refused delete of a routine bound to an archived session is skipped, not reported (K929, K1113: "inert").
   - A session-wide fault means replacing the session, not asking Bob (K273).
   - Serves P13, P17.
6. **Legacy retirement entries** name their deletions in the standing-list form (`git rm -q -- <path>`), and a new path prefix goes to Bob with the plan, not mid-job. A permission rule reaches jobs only through branches that carry it (K620). Serves P10, P17.

Out of scope for the list, permanently: force-push, rewriting `main`, deleting `snapshot/pre-refactor-2026-09-25`. Fast-forwarding `main` (§5.7 step 3) is not a rewrite. Whether it joins the list is Bob's, and it would allow any fast-forward of `main`.
