# queue-producers (T21)

**Status** · session_011U9suXK7S9HCghT354bnEM · depth 2 · WORKING · handled B1

## J1 · QUESTION

R21's recipients ("the members who created the actions that read it, else their projects' owners, else the administrators, as R15's") need each reading action's creator and project. `action-clocks.calendarFactsRead` (its R11, built: `bio-plane/src/action-clocks/index.mjs`:353) answers each path with `actions: [<id>]` only, and none of my Uses reads an action's creator or project (R15 gets both from `overdueClocks`, action-clocks R3, which computes them with its `#createdBy` and `#projectOf`).

My best reading, which I am building now: action-clocks R11 answers each reading action as R3 answers it, `actions: [{action, project, created_by}]` (a small change in action-clocks: the same two private helpers R3 uses), and queue-producers applies R15's rule to each action and takes the union (alice created ACT-1, a machine created ACT-2 in olga's PRJ-1: the item goes to alice and olga). Until that lands, an action answered as a bare id is read as `{action: <id>, project: null, created_by: null}`, so it goes to the administrators. My code reads both shapes, so nothing breaks either way.

If you would rather keep action-clocks closed: the alternative is that Uses gains `conformance.determinationRead` and a record-core manifest read, so this module derives the creator and the project itself. That duplicates action-clocks' rule, which is why I do not recommend it.

A second, smaller point, for queue: R21's key carries no status (`OBLIGATION::local-fact-due::<path>`), yet the item is "raised once per fact and status". I put the status on the subject and the basis (`subject.status`, `basis.status`). Whether a disposition taken while the fact was `unconfirmed` also covers it once `disputed` is for queue's mint to decide. No change is needed here unless you want the status in the key.
