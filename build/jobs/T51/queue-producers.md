# queue-producers (T51)

**Status** · session_01LGxvuQMoQnNwSkNodRjiu5 · depth 2 · COMPLETE · handled B1

## J1 · REPORT

T51-102 queue-producers: what the word list lacks, and what I found beside my module. For BOB to carry to the design stream (K3944) and to the jobs named.

**1. Fills a source states as a bare code, or an unkeyed sentence, which the word list holds no key for (R43's control).** Each item is still raised; the fill is left empty, or the optional sentence left out; no English is written here, no field is added to `facts`.
- `queue.export-performed.summary` and `.detail` `{scope}`: corpus-export states the scope as the codes `working-corpus` and `rendering` and the list has no word for either. The summary reads "A full export was taken on …" (the blank closed up); the detail reads "An export of the left your team's Civicsmith …", which is broken until the design either supplies a word per scope code (suggested: a `corpus-export.scope.<code>` pair) or drops `{scope}` from `queue.export-performed.detail`.
- `queue.newer-capture-affects-reference.detail` `{grade}`: reevaluation states the grade as the codes `affected` or `undetermined`; no key. It reads "… was read as. Nothing about the reference has changed …". `.detail.affects` (`{affects}`): reevaluation states what it affects as a code or a short phrase; no key, so the sentence is left out.
- `queue.new-version-arrived-from-another-team.detail.state` `{state}`: basis-versions states a reading's state as the codes `suggested`, `accepted` and so on; no key, so the sentence is left out.
- `queue.docket-core-due.what.*`: only `response`, `statement`, `edition` and `tension` have a word; a kind docket might add later leaves `{what}` empty.
- `queue.source.untitled` `{date}`: read from provenance's register and receipts (the earliest `first_retrieved` of the bundle's captures); a document with no capture day readable leaves it empty ("A document with no title, captured has changed at its source").
- `queue.cited-docket-entry-refused.detail.*` `{checks}`: the failed checks' codes as case-import gives them (R43 asks for the codes); a refused entry whose check is named by no code leaves it empty.
- `queue.cited-docket-unreadable.detail.reason` `{reason}`: case-import states the reason it recorded (a code such as `not_json`, or a short phrase it was given); carried as recorded, since there is no key to read it through.
- `{statement}` (capture-requests) and `{says}` (intent) are the owners' own sentences, built there through `word`; neither module exposes the key and vars beside the text, so a screen cannot re-read them in another language. They are passed on as the owners state them.
- R45's feed ids: the word table holds a key for `sources` only (`queue.allclear.failed`). The ids with no key, so the screen's fill is empty: bias-debts, proposals, shared-inquiries, leads, exports, references, objectives, machinery, contradictions, signing-keys, action, attribution, docket, cited-cases, wizards, schedule, places, projects.

**2. Found beside my module.**
- queue: its 29 reds (`world.mjs` builds project-roster without `migrate()`, so `project_scopes` is absent) now pass, because R45 makes a feed whose provider throws a named feed in `facts.failed` rather than a throw of the whole read. The world is still broken and the `projects` feed is named failed in every one of those tests; queue's job should run the roster's `migrate()` as its entry says, and may want to assert `facts.failed` is empty.
- wizard-scripts: its fixture (`test/m/wizard-scripts/fixture.mjs`) still lacks `project_scopes` (T51-139). My two inherited reds (`wizard.test.mjs`:105, :139) are green for the same reason, with `projects` named failed in them, until T51-139 merges.
- plane: `test/m/plane/compose.test.mjs` "R11, R5: every op of local-facts' and filing-templates' maps …" fails on the tranche tip without my change (1 of 260).
- The requirement file still marks R43, R44 and R45 "not yet met: T51"; marking them met is BOB's. All three are named by tests.

**3. Low-level choices I made in my module.**
- A date or clock inside a sentence is read in the group's zone (`publish-schedule.groupZone`, civil-time `localDay` and `localClock`); with no zone held it is the UTC day, for the sentence only (R36's ages are unchanged), as notice-producers' `{date}` does. A set time is shown as set (`time.at`), never converted.
- A title the viewer may not see is not written into a sentence (R11): the lead's run question and a newer-capture notice's pinned document fall back to the id and to `.summary.untitled`.
- A member is named by handle (the signing key's registrant, a wizard's submitter); a case by its id.
- `facts.absent` names `places` (no read registered) and `attribution` (publication's case documents not migrated here). `facts.failed` carries a provider machinery-producers or action-producers names failed as `partial`.
- Items now come in feed order: R39's wizard-base items follow R32 and R33 (they used to follow the place item); queue sorts before it cuts.
