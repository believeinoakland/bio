// @ts-check
/* record-grammar: the inquiry title rule (C-16). Moved from the check catalogue at T19 with its comment (draft-T19,
   BOB-4): promotion calls it at the write (layer 2), so it sits below promotion; the catalogue re-exports each name until
   its importers re-point (PROCESS-MECHANICS §12.2). */

/* C-16 (RECONCILED §2.2): an inquiry has ONE authored field, the question;
   a title is a RENDERING of it and is never separately authored. THE
   DERIVATION RULE, stated once so every writer and the projection produce
   the same bytes: the title is the FIRST NON-EMPTY LINE of the question,
   whitespace-collapsed; beyond 120 characters it is cut at the last word
   boundary before 120 and an ellipsis is appended, so a cut is visible as
   a cut rather than reading as a silently different sentence. The first
   line, because a question is authored as one line and elaboration under
   it must not retitle the record. Pure and closure-free on purpose: the
   setup page embeds this function's source verbatim, so the client and
   the store cannot drift. */
export const INQUIRY_TITLE_MAX = 120;
export const deriveInquiryTitle = (question) => {
  const line = String(question == null ? '' : question)
    .split('\n').map((s) => s.trim()).find((s) => s !== '') || '';
  const flat = line.replace(/\s+/g, ' ');
  if (flat === '') return null;
  if (flat.length <= 120) return flat;
  const cut = flat.slice(0, 120);
  const at = cut.lastIndexOf(' ');
  return (at > 0 ? cut.slice(0, at) : cut) + '…';
};
/* The `## Question` section of an inquiry's bundle.md, for the projection's
   use of the rule above. Returns '' when the document has no such section
   (every legacy focus/problem document), so callers fall back to the title
   the document already carries instead of inventing one. */
export const inquiryQuestionOf = (markdown) => {
  const m = /\n## Question[^\S\n]*\n([\s\S]*?)(?=\n## |$)/.exec('\n' + String(markdown == null ? '' : markdown));
  return m ? m[1] : '';
};
