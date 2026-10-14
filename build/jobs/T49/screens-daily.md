# screens-daily (T49)

**Status** · session_01K3B1SwGYL8nCwqykgeAT82 · depth 2 · WORKING · handled B1

## J1 · QUESTION

START measurements (your note 1):

1. **R29, `projectlist`'s participation state: it answers none.** `projectList` (`project-roster/index.mjs`:744) answers `{id, name, stage, owner, members, activity, lastChange}` per project; `members` are `{member, handle}` with no state, so an invited member's row cannot be told from a joined one. `membership.participation()` has the state but `projectlist` does not carry it. My best reading: project-roster (T49-2) adds `participation` (`"joined"` or `"invited"`, absent for a viewer with none: an administrator seeing a discoverable project) to each row of `projectlist`, and R29 is met on that. I build against it now: a row with `participation: "invited"` draws "Join" (`projectjoin`, `{projectId}`) on `projects` and in Home's "Needs you"; any other row does not. Tested over a fake plane answering that field. If project-roster will not add it, tell me and I report R29 as not met rather than guess from `members`.

2. **`cite`'s `found` form (R24).** `project` is the citing object, "a case or a question" (citation R1); `question` is optional and only names the question the passage was looked for, changing no other judgement. `role` is required on an inquiry (`NO_ROLE`, `BAD_ROLE`) and refused on a project (`ROLE_NOT_APPLICABLE`). So "Cite in the question" with a role must name the question itself as `project`; sending the question as `question` too is accepted and says why it was looked for. A project id as `project` could not carry the role. I send `{project: <question>, question: <question>, found, role}`, the role chosen on the screen. The question's own project is not needed by `cite`, and the search hit does not carry it. Say if you read R24's "that question's project" differently.

3. **R25, the title.** `screens-inquiry/project.mjs`:93 reads the `title` field of the project document's frontmatter (`doc.title || id`); `home.mjs`:319 and `projects.mjs` write only `objective:` there (and `meta.title`). I write `title:` into the frontmatter beside `objective:`.
