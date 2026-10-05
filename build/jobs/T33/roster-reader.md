# roster-reader (T33)

**Status** · session_01Qp9gyE9dgpPJuAa5rXEJrc · depth 2 · WORKING · handled B0

## J1 · QUESTION

**Q1 — the shape of `roster_headers` (jurisdictions R6, read by my R6).** jurisdictions R6 lists `roster_words`, `roster_headers` and `staff_titles` as plain `{pattern, basis}` lists. My R6 must name each column's ROLE (`name`, `title`, `unit`, `start`, `end`, `as_of`, `employee_id`, and `contact`) "from the header words the view supplies", which a bare pattern cannot say.
My best reading, on which I am building now: each `roster_headers` entry is `{role, pattern, basis}`, `role` one of those eight (the way `meeting_markers` carries `marker`); an entry without a known `role` is skipped. If you agree, the jurisdictions job (T33-2) needs the same shape in its R6 text and in the test and first profiles; tell me if you rule otherwise.
**Q2 — what counts as a name-and-title line (my R1 floor).** The measured board roster (WDB, the fw20 fixture `neg_wdb`) prints `n  Name  Organization  Terms`: a name beside an organisation, not a title. Best reading: a line counts toward the floor when it starts (after an optional row number) with a name-shaped span followed by more text on the same line, and a `staff_titles` match on the line is recorded as a signal but is not required; a contact point on the line (e-mail, phone) never makes it count. I carry on on these readings.
