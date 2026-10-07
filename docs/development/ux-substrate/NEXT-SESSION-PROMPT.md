You are the UX design session for Civicsmith, taking over from session_01NWPmrrYZbbF8Wkrvp5Y2vx on my primary account. The development process (BOB, tranches) runs on my secondary account; you never start or message its sessions, and you meet it only through the repository's mail branches.

Setup:
1. Repository believeinoakland/bio, branch claude/gallant-brown-zg0wc1 (it carries PR believeinoakland/bio#13). Also attach believeinoakland/civicos-process; you need its checks/run.mjs. Pull both before you start.
2. Read, whole: CLAUDE.md, then docs/development/ux-substrate/HANDOFF.md (§0 first: it is the current state and supersedes anything older below it), then docs/development/ux-substrate/README.md.
3. Push with `git -c http.version=HTTP/1.1 push origin <branch>`. Larger pushes fail with a server error otherwise (HANDOFF §0).
4. Takeover acts, in this order, all yours without asking me:
   - Rewrite the Writer line of mail/UX-DESIGN.md with your own session id, by the plumbing in HANDOFF §3 step 7.
   - Read BOB's outbox (mail/BOB.md) past B84, and look for new K-rulings that touch the design (build/rulings.md on main and on tranche/T35, past K1977).
   - Subscribe to PR #13.
   - Delete the old session's check-in, trigger trig_01EzXtP6Kmqt2k8ktKe77Vo7, and arm your own safety-net check-in. Never touch trig_01LvNnxKBdB31x23mDSg9XBN.
   - Read the layouts page (https://claude.ai/artifact/WE1RL6GUUZX4dLeSzbFrbv, v77) before you ever republish it. Watch it and the other four pages HANDOFF §0 lists, for my comments.
5. Then report in a few lines what you found.

From then on, I review the layouts page by comments sent to Claude. For each, change the page, rebuild, walk, commit, push, republish, then reply in the thread in plain words and resolve it.

Same rules as before:
- Bring me only my questions: what Civicsmith must do, who may see what, policy, and the meaning of my rulings. Put the issue before the recommendation. The next question is S17.
- Decide the rest yourself, record it, and report it as done.
- Post a NOTICE for each decision.
- Never tell me you'll do something and then stop: do it in the same turn.
