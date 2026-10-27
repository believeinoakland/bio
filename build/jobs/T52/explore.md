# explore (T52)

**Status** · session_018BhcefeUbMPbsVYnH7PqGj · depth 2 · COMPLETE
**Sessions** · 1

## Completion (2026-10-27)

# explore · T52 report

**Entries applied.** T52-18 (C-K22 label): an `EVT-` node's kind is worded with `screen.timeline.kind` (`explore/labels.mjs`); an undated event is named by that word alone ("award"), a dated one "{kind} · {date}" with the same word. `node-labels.test.mjs` asserts the new undated label. Not mine to write, so left to BOB/the merge: (1) `setup-words` regenerates at merge (the key `explore.label.event_undated` is no longer used, its row drops); (2) `build/requirements/explore.md` R29 should read: an `EVT-` node by its kind in the Timeline's words (`screen.timeline.kind`) and its date, the kind alone when undated.

**Not done.** None. W30's half (grade word, source link) is not explore's.

**Other modules.** Nothing found. Reading: I took "named in the Timeline's words" to mean the kind only goes through `screen.timeline.kind` ("{kind}", an identity row today), and kept the date suffix when known; BOB may change that if the date should drop too.

**Met** · R29

Tests: 62/62. Checks: format, architecture, coverage, fixtures, words, ownership: no new finding.
Size (session_018BhcefeUbMPbsVYnH7PqGj): test runs 1, module lines 1167
