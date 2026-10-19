/* membership's words (R151; N1116; K3366, K3368; DEC-257, DEC-258; `setup-words` R11–R13). This module holds no
   member-facing English: every sentence it answers is read through `setup-words`' `word(key, vars)` and what is held
   here is keys. A row's key is `refusal.<CODE>` (`member-roster`'s `rowKey`, `rowWord`, which read a code's key); the other
   sentences this module answers are named below. A sentence an earlier requirement here quotes means the key whose English
   it is (R151). The strings `docs/development/ux-substrate/screens/words-reads.json` marks `unkeyed` (a refusal's
   `detail`, beside its code, which the shell never draws) stay in source. The member keys are `member-roster`'s. */
export { rowKey, rowWord } from "../member-roster/words.mjs";

/* Every key this module reads, other than the rows' own: the owner arithmetic's reasons and the rescue's remedy. */
export const SENTENCE_KEYS = Object.freeze([
  "membership.remedy.active_administrator_group",
  "membership.why.both_owners_agree", "membership.why.majority_all_owners", "membership.why.owner_floor_last",
]);
