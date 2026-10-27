# Questions for Bob from the AI design lane (AI-DESIGN #3, 2026-10-27)

For BOB to put on `build/plan/beta/QUESTIONS.html` (K5426). Each is written so Bob can answer it without the lane's files. None re-asks anything he has already decided (the lane's `DECISIONS.md`, AD1–AD42). Each has options and the lane's recommendation, and the drafts follow the recommendation until he answers.

**Background in one paragraph.** The beta's assistant lets a team, a project or a member choose the AI it runs on, from a list Civicsmith keeps (the catalogue). Each AI on the list carries Civicsmith's evidence: the privacy checks the team set, and a test of whether the AI can do each part of the assistant's work (asking, drafting, reading documents, reading unclear pages, working through checks and plans, drafting a case's account). The questions below are the points the design reached where only Bob can decide.

---

**AQ1 · What lets the assistant reach members in the beta.** Today the rule is that an AI part reaches members only after it passes a set of real public matters with answers written by people. That set has never been written, so under today's rule no member could use the assistant in the beta at all.
- **A.** Keep the rule. Nothing reaches members until you supply or approve the real matters and each part passes them.
- **B. (recommended)** A part reaches members once the chosen AI has passed Civicsmith's own test for that part (invented cases, scored by code). You set the pass marks after the first measurements, as you already decided. The real matters, once written, become a standing accuracy check shown to teams, and a part that falls below its mark there is withdrawn.
- **C.** Let members use untested parts with an "untested" label, as test copies do today.

Why B: the beta gets a working assistant without waiting on a hand-written set, and every AI is still held to a measured bar. One thing B needs from you: a first measuring run on your sample accounts, after which you set the marks.

**AQ2 · Which parts the beta offers.** You asked for "full support for the assistant". Already built: asking, drafting, reading unclear pages, checks, and plans. Built but switched off behind accuracy bars you set: investigating, extracting, and exploring (at most 20% false alarms).
- **A. (recommended)** Offer every built part, plus three more: the intake interview, the case's account, and the "what's this charge / what does this rule require" answer. Investigating, extracting and exploring stay behind their bars and switch on for an AI as soon as it passes them.
- **B.** As A, and also turn on investigating, extracting and exploring now.

Why A: those three have bars you set for good reason. They open by themselves as AIs pass them, with no new decision.

**AQ3 · When a run moves to an account someone else pays for.** You allowed work to carry on down an ordered list of accounts when one hits its limit. Should the member be asked before it continues?
- **A. (recommended)** Ask only when the payer changes (another owner's account). A move to another account of the same owner goes ahead, is shown, and the member can stop it.
- **B.** Ask on every move.
- **C.** Never ask; only show it.

Why A: it protects whoever pays without interrupting every limit.

**AQ4 · If Cloudflare's own credits pay instead of the team's key.** A team's provider key can be held by Cloudflare's AI Gateway, so Civicsmith never holds it. Cloudflare has said that if the key is missing, some requests are charged to Cloudflare's own credits instead. Each call is checked afterwards against the gateway's log.
- **A. (recommended)** Keep that one answer, tell the team's administrators, and stop the account's further calls until an administrator clears it.
- **B.** As A, and also withhold the answer.
- **C.** Only tell the administrators.

Why A: withholding the answer does not undo the charge, and stopping further calls ends the wrong payer at once.

**AQ5 · Does the team's list of allowed AIs bind a member's personal subscription?** You decided that a member's personal subscription is theirs alone, and that the team's required privacy checks still bind it. The team also sets which AIs members may use.
- **A. (recommended)** Yes: a personal subscription must also be on the team's allowed list.
- **B.** No: only the privacy checks bind it.

Why A: it follows the same reasoning you used for the checks, which is that the team decides what its work may run on.

**AQ6 · Civicsmith's own spending on testing.** Keeping the list honest means Civicsmith re-tests listed AIs regularly on your sample accounts, to catch an AI that quietly gets worse. That spends your money continuously.
- **A. (recommended)** Re-test only the AIs teams actually use, each with a monthly cap you set.
- **B.** No regular re-tests until you ask for them.
- **C.** No cap.

**AQ7 · Taking an AI off the list quickly.** When a provider retires a model, or a re-test shows it has got worse, should Civicsmith be able to act before you look?
- **A.** Every change waits for you.
- **B. (recommended)** A standing rule lets Civicsmith mark an AI "watch", "lapsed" or "retired" when a stated trigger fires (the provider's shutdown date, a failed re-test, a different model answering), telling you each time. Adding an AI or bringing one back stays yours.

**AQ8 · Results that teams send in.** Teams can test an AI that isn't listed, inside Civicsmith's locked container, and send the sealed result to you.
- **(a) What the sending team sees.** *Recommended:* its own scored result at once, marked "reported by your team, not yet confirmed by Civicsmith". Nothing is published until Civicsmith repeats the test. The alternative is nothing until the AI is listed.
- **(b) What the shared results page shows about AIs that are not listed.** *Recommended:* only listed AIs. The alternative is also showing "tested, not listed" with their results.
- **(c) How long Civicsmith keeps a team's sealed test records** (needed to re-score them; they are never shown). *Recommended:* while the AI is listed, plus one year. The alternatives are scores only, or keeping them indefinitely.

**AQ9 · A copy that has lost touch with Civicsmith.** Each copy fetches the list of AIs daily. If it cannot reach Civicsmith for a long time:
- **A. (recommended)** Keep offering the last list it had, and say plainly that the list is old after two weeks.
- **B.** Stop offering AIs after a set time.

**AQ10 · Requirements the lane wrote that you have not ruled one by one.** You asked for proposals on these, and the drafts build them in:
1. how an AI that changes or is retired is caught and taken off the list;
2. costs shown before and after (and "not measurable in money" for subscriptions);
3. what happens when a provider is down (wait, switch, or continue without AI; nothing silently changes);
4. each provider's terms that bind the team's use shown at connection, including political and legal-advice limits and dates when terms change;
5. Civicsmith running one small service of its own that publishes the list and receives teams' sealed test results.

- **A. (recommended)** Adopt them as the beta's requirements. You revise any of them whenever you wish.
- **B.** Bring each one separately.

**AQ11 · Which projects may use a member's shared account** (added 2026-10-27; placed on Bob's page by BOB #322, K5471). A member can let "my projects" add her own AI account (one she pays for) to their lists.
- **A. (drafted)** Only projects she owns.
- **B.** Any project she has joined.

Why A: her money is spent only where she also decides what the project does. With B, another project's owner could put her account to work on that project.
