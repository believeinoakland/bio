/* retrieval — the four-level statement of a meaning-grain answer (R13, R14), pure: the numbers and the vocabulary in,
 * the statement out, so every branch is testable without a corpus. */

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
    why: "whether anybody has looked at all is recorded in the observation log, which this read does "
       + "not reach. An answer here cannot tell 'we looked and found nothing' from 'nobody has looked "
       + "yet', and it says so rather than letting the zero speak for both",
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
  const over = axis && axis.truncated
    ? ` (the tally covers the first ${axis.bound} capture(s) in scope and says so rather than presenting a sample `
    + `as a census)` : "";
  const coverage = cov
    ? `of the ${axis.captures_counted} capture(s) counted in scope, ${cov.searchable} can be searched at passage grain `
    + `(${cov.full} fully indexed, ${cov.part} partly); ${cov.none} hold nothing indexable; ${cov.never} never `
    + `extracted — nobody has read them; ${cov.unreadUndet} have no extraction this record can account for — read before the log carried the `
    + `content level, or purged — so it cannot say that nobody read them; and ${cov.indexUndet} were read but their `
    + `index state is undetermined${over}`
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
                    ? "no document is in scope at all — the other arms of this query selected none that "
                    + "this viewer may see, so every level below is empty for want of a document rather "
                    + "than for want of content"
                    : `${documents} document(s) in scope, counted through the same gate as the rows` },
      content: at("content")
        ? (axis
          /* REC-92 — THE TEXT-INDEX READING OF THE CONTENT LEVEL: the sentence names WHICH absence is true out of the
             tally rather than letting one zero stand for four different facts. */
          ? { state: "COUNTED", documents_with_rows: withRows, rows_matched: total,
              matched,
              why: !matched
                ? `this answer lists every indexed unit of the document(s) in scope rather than `
                + `units that matched a term, because the query carried no \`passage:\` selector `
                + `— so \`snippet\` is null on every row for want of a term to centre it on, and `
                + `not for want of a passage. Coverage: ${coverage}`
                : `${total} matching unit(s) over ${withRows} of ${documents} document(s) in scope `
                + `that hold any indexed text. THE ABSENCE OF A HIT IS NOT EVIDENCE OF ABSENCE `
                + `UNTIL THE COVERAGE IS READ: ${coverage}` }
          : { state: "COUNTED", documents_with_rows: withRows, rows_matched: total,
              why: withRows === 0 && documents > 0
                ? `none of the ${documents} document(s) in scope holds a single content row. Nothing in them `
                + `has been cited or marked citable, so this answer is a fact about CITATION and never `
                + `evidence about what those documents say — the text of a document nobody has cited is `
                + `not searched by this arm at all. \`passage:\` with \`rows=passage\` is the arm that `
                + `searches what those documents SAY`
                : `${withRows} of ${documents} document(s) in scope hold content rows; ${without} hold none` })
        : { state: "UNDETERMINED",
            /* REC-92: TWO reads answer the content level, and they answer different halves of it. Naming only one
               would send a member asking "what do these documents say" to the arm that answers "what has anybody
               cited". */
            why: "this arm answers at the meaning level. What has been extracted from the documents in "
               + "scope is the content level, and TWO reads answer it: `content:` with `rows=content` "
               + "for the extents somebody has cited or marked citable, and `passage:` with "
               + "`rows=passage` for what the documents actually SAY. A corpus nobody has cited holds "
               + "no content rows and may hold every passage you are looking for" },
      meaning: at("meaning")
        ? { state: "COUNTED", documents_with_rows: withRows, rows_matched: total,
            why: `${withRows} of ${documents} document(s) in scope hold rows of this kind; ${without} hold none` }
        : { state: "UNDETERMINED",
            why: "whether any finding RESTS ON these rows is the meaning level. `content:cited` and "
               + "`content:uncited` answer it over this same set, and the `cited` column on each row "
               + "says it per row" },
    },
  };
  /* ONE SENTENCE a surface can render without composing it itself. The passage arm's own sentence LEADS WITH THE
     COVERAGE (R14): `withRows === 0` on a text index does NOT mean "these documents hold no passages"; it means not one
     document in scope has been read at passage grain, which is a statement about this record's coverage and never
     about the documents. */
  const axisSays = () => {
    if (documents === 0)
      return "nothing matched, and no document was in scope to match in — this is an empty DOCUMENT "
           + "level, not an empty record";
    const lead = `Coverage: ${coverage}. `;
    if (total > 0)
      return lead + `${total} passage(s) matched over ${documents} document(s) in scope`
           + (cov.gap > 0
             ? `, and ${cov.gap} capture(s) in that scope have not been read at passage grain as far as this record `
             + `can say — so this is what the searched part of the record says, not all of it`
             : `, over a scope every capture of which can be searched at passage grain`);
    if (cov.searchable === 0)
      return lead + `Nothing matched, and NOTHING IN SCOPE WAS SEARCHABLE. This says nothing whatever about what `
           + `those documents contain. The next move is to read them, not to conclude they are silent`;
    return lead + `Nothing matched over ${cov.searchable} searchable capture(s) in scope`
         + (cov.gap > 0
           ? `, but ${cov.gap} further capture(s) in scope have not been read at passage grain as far as this `
           + `record can say, so this absence covers only the part of the record that has been read`
           : `, and every capture in scope can be searched at passage grain — this absence is about the `
           + `documents and not about our coverage of them`);
  };
  out.says = axis ? axisSays()
    : total > 0
    ? `${total} row(s) over ${documents} document(s) in scope`
    : documents === 0
      ? "nothing matched, and no document was in scope to match in — this is an empty DOCUMENT level, "
      + "not an empty record"
      : withRows === 0
        ? `nothing matched over ${documents} document(s) in scope, none of which holds a row of this kind `
        + `at all. That is absence at THIS level and says nothing about the level below it`
        : `nothing matched over ${documents} document(s) in scope, ${withRows} of which hold rows of this `
        + `kind that this query's filters excluded`;
  return out;
}
