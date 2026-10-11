# promotion (T45)

**Status** · session_01Bdm13v3k1joqVbrjhpKtUZ · depth 2 · RUNNING until 2026-10-11T19:24:01Z (npm test (bio-plane, every module)) · handled B4

## J1 · QUESTION

R57's terms, my best readings (I build on them unless you answer otherwise; none blocks the stamp):
1. A **leg** is each front-matter `basis[]` entry's `target`; a **citation / `cites` entry** is each `references[]` entry with `rel: cites` whose `status` is not `severed` (citation R1, R4: a case's citation is a `cites` edge; a question's leg also carries one). Other rels (`derived_from`, `responds_to`, `supersedes`, …) are not evidence and are not asked.
2. "A bundle committed with a project P": P is `record-core.bundleInfo(target).project` (R53); when the target is itself a project bundle (committed with no project), P is the target, so a counsel matter's own document is not citable from elsewhere either.
3. "The citing document's own project": its `project:` (R53); for a project's own bundle (a case), the project itself.
4. "A scope set after a document was promoted changes nothing already promoted" (and project-roster R21, "read at the act that would cite"): a revision is asked only about the targets it newly names, those the head's `bundle.md` did not already name as a leg or a live `cites` entry; a creation is asked about all. So a revision carrying an old citation forward is accepted, and reinstating a severed edge is a new citation.
5. A replay is not exempt (R57 names no exemption, as R15 says of itself).
6. Row: `C-86.16` in `PROMOTION_CHECKS`, region `#promote > is-counsel-matter-evidence`, asked after R16 and before the registered checks (R39). The refusal names the offending targets and no project or scope beyond the code itself.
7. `projectScope` is read through a lazily made `projectRosterOf(host)` (a test may pass `roster`); one that cannot be read abstains (R17), never passes or refuses on it.
