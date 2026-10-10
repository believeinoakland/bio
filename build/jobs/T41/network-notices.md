# network-notices (T41)

**Status** · session_01GXCqPTAxKrSAfPYRLzkwSn · depth 2 · COMPLETE · handled B1

## J1 · QUESTION

D54 and R25. Since T41-3, membership R44/R77 give an administrator (founder included) at a HIDDEN project's EXISTENCE a C-70.1 refusal carrying `owners` (the owners' handles). network-notices relays `existenceAct`'s refusal as it came (R1 for prepareNotice/postNotice, R22 for noticesOf), so an administrator who is neither invited nor joined, calling `op=noticeprepare`, `op=noticepost` or `op=notices` on a hidden project, now gets an answer naming members (handles), while R25 says "No answer of this module names a member". R1 and R22 also say only "a discoverable project `by` sees only at existence" is answered with existenceAct's refusal.

My best reading (built on it, nothing changed in code): the relayed refusal is membership's answer, minted only there (R77), and R25's list (revisions, attestations, keys, leaves, openings) is about this module's own outward material; D54 (Bob's) decides what an administrator learns at EXISTENCE. So I keep relaying it unchanged for both forms of EXISTENCE, as project-stage R1 does. If you agree, R1 and R22 might say "a project `by` sees only at existence (either form, membership R44)" and R25 might except a relayed membership refusal; that text is yours. If instead you want the handles stripped here, say so and I will strip `owners` from the relay.
