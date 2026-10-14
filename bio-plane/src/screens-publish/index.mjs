/* screens-publish (T47-63; N897 (1); N683, N757, N788; DEC-78, DEC-96, DEC-100, DEC-112, DEC-116, DEC-147, DEC-180,
 * DEC-181, DEC-183, DEC-201 (8), DEC-207, DEC-208, DEC-210): from a case's draft to its public page, and what comes in
 * from outside. The registry screens `case-editor`, `review-copy`, `ceremony`, `published`, `imported`, `docket`,
 * `doorbell` and `review-outside`, built to interface-shell R21's screen contract: each `{id, reads, render, acts,
 * words}`, every function self-contained, every read and act an op through the shell. Pure: this module reads no table
 * and writes nothing. Requirements: `build/requirements/screens-publish.md`. */
import { SCREEN_WORDS } from "./words.mjs";
import { CASE_EDITOR } from "./case-editor.mjs";
import { REVIEW_COPY } from "./review-copy.mjs";
import { CEREMONY } from "./ceremony.mjs";
import { PUBLISHED } from "./published.mjs";
import { IMPORTED } from "./imported.mjs";
import { DOCKET } from "./docket.mjs";
import { DOORBELL } from "./doorbell.mjs";
import { REVIEW_OUTSIDE } from "./review-outside.mjs";

export { SCREEN_WORDS };

// The `WORD_ROWS` keys (setup-words R7) each screen draws beside its own rows: the read states, the registry's name,
// purpose and act labels, each act's explanation, and the marks and signing words it uses.
const SHARED = ["state.loading", "state.empty", "state.failed"];
const ACTS = (id, ops) => ops.flatMap((op) => [`act.${op}.label.${id}`, `act.${op}.does`]);
const HEAD = (id) => [`screen.${id}.name`, `screen.${id}.purpose`];
const WORDS_FROM = {
  "case-editor": [...SHARED, ...HEAD("case-editor"), ...ACTS("case-editor", ["casedraft", "whatchangedpropose", "statementack", "attribute", "writinghelp"]),
    "mark.origin.machine.name", "mark.origin.machine.means", "ai.label.untested", "ai.label.untested.writinghelp"],
  "review-copy": [...SHARED, ...HEAD("review-copy"), ...ACTS("review-copy", ["reviewgrant", "reviewrevoke", "reviewcomment"]), "mark.outward.means"],
  ceremony: [...SHARED, ...HEAD("ceremony"), ...ACTS("ceremony", ["publishpreflight", "publishtensions", "caseratify", "publish", "publishat", "obscuremark",
    "obscuremarkwithdraw", "signerregisterown", "signrequest", "publishatmove", "publishatcancel"]),
    "signing.ceremony.who", "signing.ceremony.declined", "signing.ceremony.signedat", "signing.ceremony.signednow", "signing.ceremony.nokey",
    "signing.ceremony.keepkey", "signing.ceremony.notowner", "signing.ceremony.phone"],
  published: [...SHARED, ...HEAD("published"), ...ACTS("published", ["verify", "publishedcase"])],
  imported: [...SHARED, ...HEAD("imported"), ...ACTS("imported", ["caseimport", "importaccept", "importflag", "importwatch"]),
    "mark.origin.elsewhere.name", "mark.origin.elsewhere.means", "mark.origin.accepted.name", "mark.origin.accepted.means",
    "mark.origin.flagged.name", "mark.origin.flagged.means"],
  docket: [...SHARED, ...HEAD("docket"), ...ACTS("docket", ["docketfile", "docketpost"]), "signing.ceremony.declined"],
  doorbell: [...SHARED, ...HEAD("doorbell"), ...ACTS("doorbell", ["knock"])],
  "review-outside": [...SHARED, ...HEAD("review-outside"), ...ACTS("review-outside", ["reviewcomment"])],
};
const wordsOf = (id) => {
  const own = SCREEN_WORDS.filter((r) => r[0].startsWith(`screen.${id}.`));
  const ownKeys = new Set(own.map((r) => r[0]));
  return Object.freeze([...WORDS_FROM[id].filter((k) => !ownKeys.has(k)), ...own]);
};

/** interface-shell R21, R28: the eight screens, in the order a case travels (prepare, review, publish, read, import, the
 *  docket, and the two doors from outside). */
export const SCREENS = Object.freeze([CASE_EDITOR, REVIEW_COPY, CEREMONY, PUBLISHED, IMPORTED, DOCKET, DOORBELL, REVIEW_OUTSIDE]
  .map((s) => Object.freeze({ ...s, words: wordsOf(s.id) })));
