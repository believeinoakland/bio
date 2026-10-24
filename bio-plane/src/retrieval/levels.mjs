/* retrieval — the four-level statement of a meaning-grain answer (R13, R14), pure: the numbers and the vocabulary in,
 * the statement out, so every branch is testable without a corpus. Every sentence it answers is read by key from
 * setup-words (plan rule 6), the numbers filling the placeholders. */
import { say } from "./words.mjs";
import { localize } from "../setup-words/index.mjs";

/** REC-90 — WHICH LEVEL WAS EMPTY, SAID RATHER THAN LEFT TO BE INFERRED.
 *
 *  CLAUDE.md, and it is the rule this whole arm exists to serve: *sparse is the normal condition at every level.
 *  Absence at one level is not evidence of absence at the next: no meaning derived may mean nothing was extracted;
 *  nothing extracted may mean the document was never read; no document may mean nobody looked. Saying which of those is
 *  true is a first-class obligation, not a diagnostic detail.*
 *
 *  WHY IT GOES ON THE ANSWER AND NOT IN A GUIDE. A zero from `content:` over a corpus of five hundred captured agenda
 *  packets that nobody has cited is BYTE-IDENTICAL to a zero over a corpus where the passages exist and say nothing
 *  about the subject — and the first is the ordinary state of every new instance. Without this block a member reads
 *  the second. Part II §14.3 says those are different facts with different next moves, so the difference has to travel
 *  with the answer.
 *
 *  EVERY LEVEL IS NAMED, INCLUDING THE ONES THIS OP CANNOT SEE. A level omitted reads as a level with nothing in it;
 *  UNDETERMINED is first-class and must be STATED, so the two levels this read does not reach say so and NAME WHAT DOES
 *  reach them.
 *
 *  REC-92 — `level` alone no longer identifies the question: `content:` and `passage:` BOTH answer at the content level
 *  and their zeros mean opposite things. A `content:` zero is a fact about CITATION; a `passage:` zero is a fact about
 *  TEXT — these documents do not say this, OR nobody has read them yet, and only the axis tally can tell those apart.
 *  So the arm and the tally travel with the level.
 *
 *  `vocab` is observation-log's content-axis vocabulary: `{states, undetermined}` (`CONTENT_AXIS_STATES`, whose four
 *  keys are indexed full, partial, none and not extracted in that order, and `CONTENT_AXIS_UNDETERMINED`). */
export function meaningLevels(level, documents, withRows, total,
                              { arm = null, matched = false, axis = null, vocab = null } = {}) {
  const without = Math.max(0, documents - withRows);
  const K = axis && vocab ? Object.keys(vocab.states) : [];
  const U = axis && vocab ? vocab.undetermined : null;
  /* §4.4's tally, folded into `scope` rather than replacing it: §4.4 says the envelope carries
     `scope: { captures, <one key per content-axis state>, … }`, and REC-90 had already published
     `scope: { documents, documents_with_rows, documents_without_rows }` on every arm, so they are UNIONED — every
     field §4.4 names appears where §4.4 says it does, and nothing REC-90 published moves. */
  const axisScope = axis ? { captures_counted: axis.captures_counted,
                             captures_truncated: axis.truncated,
                             captures_bound: axis.bound,
                             ...Object.fromEntries(Object.entries(axis).filter(([k]) =>
                               !["captures_counted", "truncated", "bound",
                                 "vocabulary", "undetermined_value"].includes(k))) } : null;
  /* The observation log holds WHETHER ANYBODY EVER LOOKED, and this read does not reach it. Named, with the read that
     does. */
  const NOBODY_LOOKED = {
    state: "UNDETERMINED",
    why: say("retrieval.why.anybody_looked_all"),
  };
  /* R14 (K102): the passage arm's coverage, from the tally. `never` is ONLY the captures the missing-row rule says
     nobody has read (observation-log R11's `never_looked`); `unreadUndet` the captures with no extraction row whose
     cause the record cannot narrow (read before the log carried the content level, or purged); `indexUndet` the
     captures read whose index state is undetermined. Only `never` licenses "nobody has read". */
  const cov = axis ? (() => {
    const notRead = axis.not_read || { never_looked: 0, undetermined: 0 };
    const full = axis[K[0]] || 0, part = axis[K[1]] || 0, none = axis[K[2]] || 0;
    const never = notRead.never_looked || 0;
    const unreadUndet = notRead.undetermined || 0;
    const indexUndet = Math.max(0, (axis[U] || 0) - unreadUndet);
    return { full, part, none, never, unreadUndet, indexUndet, searchable: full + part,
             gap: never + unreadUndet + indexUndet };
  })() : null;
  const over = axis && axis.truncated ? ` ${say("retrieval.text.tally_covers_first", { bound: axis.bound })}` : "";
  const coverage = cov
    ? say("retrieval.text.capture_counted_scope", { captures_counted: axis.captures_counted, searchable: cov.searchable,
        full: cov.full, part: cov.part, none: cov.none, never: cov.never, unread_undet: cov.unreadUndet,
        index_undet: cov.indexUndet, over })
    : null;
  const at = (lvl) => level === lvl;
  const out = {
    level,
    scope: { documents, documents_with_rows: withRows, documents_without_rows: without,
             ...(axisScope || {}) },
    ...(axis ? { content_axis: { vocabulary: axis.vocabulary,
                                 undetermined_value: axis.undetermined_value } } : {}),
    levels: {
      internet: NOBODY_LOOKED,
      document: { state: "COUNTED", documents,
                  why: documents === 0
                    ? say("retrieval.why.document_scope_all")
                    : say("retrieval.why.document_scope_counted", { documents }) },
      content: at("content")
        ? (axis
          /* REC-92 — THE TEXT-INDEX READING OF THE CONTENT LEVEL: the sentence names WHICH absence is true out of the
             tally rather than letting one zero stand for four different facts. */
          ? { state: "COUNTED", documents_with_rows: withRows, rows_matched: total,
              matched,
              why: !matched
                ? say("retrieval.why.answer_lists_indexed", { coverage })
                : say("retrieval.why.matching_unit_over", { total, with_rows: withRows, documents, coverage }) }
          : { state: "COUNTED", documents_with_rows: withRows, rows_matched: total,
              why: withRows === 0 && documents > 0
                ? say("retrieval.why.document_scope_holds", { count: documents })
                : say("retrieval.why.document_scope_hold", { with_rows: withRows, documents, without }) })
        : { state: "UNDETERMINED",
            /* REC-92: TWO reads answer the content level, and they answer different halves of it. Naming only one
               would send a member asking "what do these documents say" to the arm that answers "what has anybody
               cited". */
            why: say("retrieval.why.arm_answers_meaning") },
      meaning: at("meaning")
        ? { state: "COUNTED", documents_with_rows: withRows, rows_matched: total,
            why: say("retrieval.why.document_scope_hold_rows", { with_rows: withRows, documents, without }) }
        : { state: "UNDETERMINED", why: say("retrieval.why.finding_rests_rows") },
    },
  };
  /* ONE SENTENCE a surface can render without composing it itself. The passage arm's own sentence LEADS WITH THE
     COVERAGE (R14): `withRows === 0` on a text index does NOT mean "these documents hold no passages"; it means not one
     document in scope has been read at passage grain, which is a statement about this record's coverage and never
     about the documents. */
  /* R97 (G135f, DEC-418): a capture in scope whose reading is not whole is searched only so far. The sentence states how far
     (the position and the extent of the read, summed over the partial readings when they all state one) and that nothing
     found is "not found so far", never "not in the document". A whole reading says nothing of the kind. */
  const soFar = () => {
    const n = axis && Number.isInteger(axis.partial) ? axis.partial : 0;
    if (n <= 0) return null;
    const listed = Array.isArray(axis.partial_reads) ? axis.partial_reads : [];
    const known = listed.length === n && listed.every((r) => Number.isFinite(r.through) && Number.isFinite(r.total));
    return known
      ? localize("retrieval.levels.searched_so_far", "Searched so far: {count} capture(s) in scope are read to {through} of {total}. Nothing found here is \"not found so far\", never \"not in the document\".",
          { count: n, through: listed.reduce((a, r) => a + r.through, 0), total: listed.reduce((a, r) => a + r.total, 0) })
      : localize("retrieval.levels.searched_so_far_unmeasured", "Searched so far: {count} capture(s) in scope are only partly read. Nothing found here is \"not found so far\", never \"not in the document\".", { count: n });
  };
  const axisSays = () => {
    if (documents === 0) return say("retrieval.text.matched_document_scope");
    const lead = `${say("retrieval.lead", { coverage })} `;
    const so = soFar();
    if (total > 0)
      return lead + say("retrieval.text.passage_matched_over", { passages: total, documents,
        rest: `, ${cov.gap > 0 ? say("retrieval.text.capture_scope_read", { gap: cov.gap }) : say("retrieval.text.over_scope_capture")}` })
        + (so ? ` ${so}` : "");
    if (so) return lead + so;
    if (cov.searchable === 0) return lead + say("retrieval.text.matched_scope_searchable");
    return lead + say("retrieval.text.matched_over_searchable", { count: cov.searchable,
      rest: `, ${cov.gap > 0 ? say("retrieval.text.further_capture_scope", { gap: cov.gap }) : say("retrieval.text.capture_scope_searched")}` });
  };
  out.says = axis ? axisSays()
    : total > 0
    ? say("retrieval.text.row_over_document", { total, documents })
    : documents === 0
      ? say("retrieval.text.matched_document_scope")
      : withRows === 0
        ? say("retrieval.text.matched_over_document", { documents })
        : say("retrieval.text.matched_over_document_scope", { documents, with_rows: withRows });
  return out;
}
