# wizard-scripts (T33)

**Status** · session_01VHaQRnU4iXXj7mFCXhSWZB · depth 2 · WORKING · handled B2

## J1 · QUESTION

R21 (`wizardRegistry`), my readings; I am building on them now, nothing waits on the answer.
(1) "answers exactly what R11 would answer screen by screen": R11 answers the offered scripts plus the viewer's own drafts marked `draft: true`. I read R21 as including those own drafts too, each marked `draft: true`, so the registry and `wizardsAt` never disagree and the author can be walked through their own draft.
(2) "a step's `draft` named by its kind only": the step carries `draft: "text" | "template" | "machine"` (the source's name, a string), and no key when the step has no draft; never the text, the template's id or content, or the machine op's name.
(3) Each screen answers `{id, acts, scripts}` (`acts` as `registeredScreens` gives them); the answer is `{ok: true, registered: true, screens}`, or `{ok: true, registered: false, screens: []}` before registration; in-process only, no op.
Also, by plan Rules (6), this job moves the module's tables from `declarePurge` to `declareTable` with explicit classes (purge clear, expunge none, export admin-only, sight bundle for the project-keyed tables and group for grants and tallies, derive stored, version_chain true for wiz_versions and wiz_revisions); purge behaviour unchanged.
