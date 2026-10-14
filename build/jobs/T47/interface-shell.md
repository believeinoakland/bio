# interface-shell (T47)

**Status** · session_01Mqqp1PVr9KzRUa1bjw1eZa · depth 2 · WORKING · handled B1

## J1 · QUESTION

Three points; I carry on with my best reading of each and stop for none of them.

1. **R35's absence answers.** Your START lists none. My reading: a subject read refused `NOT_VISIBLE` or `NOT_A_PARTICIPANT` draws "You can't open this"; one refused `NOT_FOUND`, `NO_SUCH_*` or `*_NOT_FOUND`, or answered empty, draws "Nothing is here" (R9's existing rule); a subject read or `whoami` that gets no answer or a 5xx draws "can't be reached" and retries every 30 s in the background. Other reads keep R10's four states. Please name any other code you want in the "You can't open this" set.
2. **`modules.json` uses (yours).** R41's test verifies with `signatures.verifySshsig` (`bio-plane/src/sshsig.mjs`), so interface-shell needs `signatures` in `uses` (tests only; the browser code imports nothing). Until it is added I verify with `ssh-keygen -Y verify` and a node:crypto check of the SSHSIG blob, and add the `verifySshsig` arm once you add the edge. R32 makes `SESSION_STORE_KEY` this module's, so I stop importing `setup-page`; its edge can go whenever you like.
3. **Words before setup-words merges.** `WORD_ROWS` on `tranche/T47` is still 3f40899950's: it holds no `session.*`, `signing.ceremony.*` or `instance.test.notice`. I draw by those keys and carry the `words.json` rows (PR #33's head) as a fallback that applies only where `WORD_ROWS` lacks the key, so the shell is right both before and after setup-words merges. Once it merges I drop the fallback on your CHANGE.
