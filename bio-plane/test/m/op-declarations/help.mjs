/* R34 (affordances R48, R62, R64): an op is EXPLAINED when affordances' `ACT_HELP` holds its text. K4070 (BOB's CHANGE B3):
   `affordances` holds `act.<op>.does` for six ops (its R62's reads list: `counselpacket`, `holdnoticeprepare`, `noticeprepare`,
   `noticepost`, `signeradd`, `versionnotice`) and reads them into `ACT_HELP` when it merges. Until `ACT_HELP` holds them the
   word is the text, so the partition tests (an op is explained or named in `ACT_HELP_ABSENT`, never both, never neither) hold
   before and after that merge. The fallback names only these six: other ops' words (an alias's, say) are not their text. */
import { ACT_HELP } from "../../../src/affordances.mjs";
import { hasWord } from "../../../src/setup-words/index.mjs";

const WORD_IS_THE_TEXT = ["counselpacket", "holdnoticeprepare", "noticeprepare", "noticepost", "signeradd", "versionnotice"];
export const explained = (op) =>
  (Object.hasOwn(ACT_HELP, op) && typeof ACT_HELP[op] === "string" && ACT_HELP[op].length > 0)
  || (WORD_IS_THE_TEXT.includes(op) && hasWord(`act.${op}.does`));
