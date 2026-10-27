# N1269 and N1272: what is read, what is interpreted, and what members are told (questions for Bob)

**Status** · DRAFT by CAPABILITIES #1 (C2), for BOB to place on QUESTIONS.html. Written to stand alone: it needs none of the lane's files. Nothing is decided here; each question carries options and a recommendation. Requirement lines follow once Bob answers (they belong to `extraction`, `reading-pipeline`, `screens-inquiry` and the investigation modules, with the FILES lane's size rules).

## What is already settled (Bob, K4628, K4632, K4636)

- Every document a member adds or captures is **held whole and its text read whole**: every line searchable and citable (K4571). That stays.
- **Interpreting** is a different, selective act: turning parts of a document into structured facts (a sheet's typed cells and figures, names and entities, dates). Bob: "Understanding what to import from a document and what to not import is itself an investigation of a different kind," decided "with awareness of what could be of value of the investigation at hand," and a later investigation may find "data important to this additional investigation that's in the document though not yet cited."
- Today a sheet's cells are interpreted for a range a member opens or cites, and the document page says so. Nothing else chooses.
- The beta's file sizes (N1267) are set; very large files (the "stretch goal": any file of realistic value, however large) are what N1269 studies.

## Q1 (N1272). Who chooses which parts of a document are interpreted for an investigation?

Plain picture: a 400-page budget PDF or a 600,000-row register is held and searchable. For *this* investigation only a few pages or rows matter. Someone has to say which, and the product has to remember that the rest was deliberately not interpreted.

- **A. Only when a member opens or cites a part (today's rule, extended to all kinds).** Simple, predictable, never interprets anything unasked. Cost: a member must know where to look; a later investigation gets nothing without doing the same.
- **B. A member marks parts to interpret for a named investigation** ("interpret these pages / this sheet / these rows for the Sewer fund"). Adds a deliberate act and a record of why. Cost: more effort per document.
- **C. The product proposes parts, without AI, from the investigation's own words** (headings, search hits, named people and amounts matching the investigation's questions), shown as a list the member accepts or edits. The assistant may propose too, after the assistant is built (N1220). Cost: proposals can be wrong, so each is labelled a proposal and nothing is interpreted until a member accepts.
- **D. Interpret everything up to a size, and use B or C above it.** Easiest for small files. Cost: interpretation work and storage grow with every document, which Bob's rule was written to avoid.

**Recommendation: A for all kinds now, B as the member's deliberate act, C for the beta once its proposals are tested on real documents; the assistant's proposals only with N1220. Not D.**

## Q2 (N1272). How is it shown, and how does a later investigation find what was not interpreted?

**ANSWERED, K5495 (C2): option A**, "but perhaps also a visual indicator in the view of the document (a thin margin color, shading, or some other indicator) that shows what's been interpreted." The document view marks interpreted parts visibly (requirement R147; UX-DESIGN draws it).

**C21 (what "interpretation" means for non-sheet files): ANSWERED, K5496, option A.** Finding names, organisations and dates across a whole document to make it searchable is reading, not interpretation.

- On the document page, one plain line: "Read in full and searchable. Interpreted for {investigation}: pages 3 to 9. Not interpreted: the rest." Never silent (K4571).
- When another investigation opens a document already held, the page offers "Interpret parts of this for {this investigation}" and says what it was interpreted for before, by whom and when. Search still finds every line.
- Options: **A (recommended)** the above, shown on the document page and in search results as a small "not interpreted for this investigation" mark; **B** the same, plus a standing list on the investigation of "held documents not yet interpreted for it that matched its search" (more helpful, more screen).

**Recommendation: A in the beta; B if members ask for it.**

## Q3 (N1269). What limits do members see, and when?

Bob: "we may need to communicate some limits to members - like a maximum file size for each type."

- **A (recommended).** Before a member adds a file, the add screen states, per kind, the largest file read whole (the N1267 sizes: documents up to 100 MB or 5,000 pages; spreadsheets up to 50 MB or about 1 million rows; images 50 MB; archives 500 MB), and a file over its limit is refused in plain words with its size and the limit, never half-read.
- **B.** State limits only when a file is refused. Less to read, but a member learns after the wait.
- **C.** State a smaller "comfortable" size and a larger "possible, slower" size. More honest about time, harder to explain.

**Recommendation: A, with the times K4354 allows (large files read in the background and the member told when done).**

## Q4 (N1269). For a file larger than the limit that still matters

The stretch goal: reading any file of realistic value. A 5 GB register is not read whole.

- **A (recommended).** Refuse it, and say so; offer the register route (N1259: import a register in part by a filter) where the file is a register, or "bring in the part you need" (a member cuts it first) otherwise.
- **B.** Accept it held but read only the first part and the parts a member asks for, stating exactly what was read. Risks a member believing it was all searched; Bob's "never silent" rule means the page must state the unread part in the same breath.
- **C.** Defer: not in the beta; study after real members hit the limit.

**Recommendation: A for the beta, C for anything beyond; B only after Q1's proposals work well, because it is the one that can mislead.**

## What this needs from other lanes

- FILES: the per-type sizes and the "refused with its size" wording belong to their N1267 lines; this lane only adds that the add screen shows them first (Q3).
- UX-DESIGN (through BOB): the document page's line, the "interpret parts" act, the proposals list, the add screen's limits (as needs, never designs).
- PLATFORM: interpretation storage per team is bounded by what members mark (A/B/C), not by file size; confirm at each service level.
- AI-DESIGN: Q1's assistant proposals depend on N1220; nothing here builds them.
