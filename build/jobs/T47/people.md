# people (T47)

**Status** · session_01RqNJSwaQHYSnZPXzUrGVfv · depth 2 · WORKING · handled B0

## J1 · QUESTION

R37, my readings of what the text leaves open; I am building on them now, and only an answer that changes one changes what I build.
1. **Questions.** A question names the entity when one of its resolutions (`entities` R35) has a `bundle_id` whose `object_type` is `inquiry` (record-core R37). Resolutions are keyed by a capture's bundle, so in practice this counts captures held in an inquiry bundle; a person fact's `question` (R9) is not counted.
2. **Projects.** A resolution's bundle names its project: `bundles.project` (record-core R34/R37), or the bundle itself when its `object_type` is `project`. A project counts only when the viewer sees it (`membership.inSight`); a hidden project is never counted or named.
3. **Sight of a mention.** A resolution counts only when `membership.hiddenBundles(viewer)` does not hold its `bundle_id` (R43/R88: one rule). Every resolution counts whatever its grade, `established` or reported defects (a name tied is a name tied).
4. **Newest added.** `newest_added` is the latest `register.registered` (provenance R48) among the visible captures naming the entity, or null when none is visible. `since` keeps rows whose `newest_added` is at or after now less 30, 90 or 365 days.
5. **Works on.** A project the viewer works on is one in which they are a participant in state `joined` (`membership.participation`, R74); invited, leaving or other states do not make `mine`.
6. **Today.** A person's `today` is each `holds` line (`lines`) valid on today's date, as `{line_id, title, capacity, office: {entity, label}, body: {entity, label} | null}`, `body` the office's `post_in` or `part_of` target. An organisation's is `{kind, sector, note}` (its registry note, "what it is"). `office` (the filter) is a body's entity id: a person is kept when one of those holds lines is to that body, or to an office whose `post_in`/`part_of` line goes to it. `q` matches, case-folded, a name or alias (`entities` aliases), or the label of an office or body in `today`.
7. **Cursor.** An opaque token encoding the last row's order key (`mine`, `newest_added`, entity id); the next page starts strictly after that key, so a page never skips or repeats a row.
No new `uses` edge: entities, lines, membership, provenance and record-core are already used.
