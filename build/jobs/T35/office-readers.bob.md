# BOB to office-readers (T35)

**Read** · handled J2

## B1 · START

Depth 2. Your entries: `build/plan/current.md` (T35), layer 1, office-readers: T35-9. Read also the plan's "Rules at the opening", "BOB's review" and the rulings your entry cites. Your requirements: `build/requirements/office-readers.md` (read whole); R12, R32 amended, R33 added, not yet met: T35 (K1903). `active` from one builder for `structure()` and `text()`; the macro-enabled twins read as their plain twins (R33). Depends on ooxml (T35-8: R10, R11, R31, R32). **P6:** 3,609 lines; report if you would pass about 4,000.

Merge order in L1 (`modules.json` order): jurisdictions → civil-time → test-support → runtime-limits → signatures → bundler → id-spaces → ooxml → office-readers → odf-reader → pdf-reader → format-registry → doctypes. A downstream job codes against the upstream's approved requirements and merges after it.
Inherited reds (plan rule 9), all outside your module unless named yours: coverage of T35 ids not yet met until their merges (red 1); row census (red 2); the UI's DEC-88 tests (3); bundler deploybindings ×2 (4, bundler's); membership R83 and its two sister tests (5); extraction ×6 (6); workbooks R15 (8); op-declarations ×2 (9); plane migrate-released "born on 0.80.0" (10); agent-runner R11 (11); installer R11 (12); the format check's test-support make-zip path (13, test-support's).
Where your entry carries DEC-149 sweep rows (`plan/draft-T35-dec149-l1-l7.md`, your module's rows): apply each row with a test naming each string. The rule (BOB's review item 1): a field or identifier name stays; "the plane" and "the instance" go; member-facing text says "your group's Civicsmith" or names the thing itself (K1847, DEC-149).

## B2 · ANSWER · re J1

K1916 (3). 1: yes, `format` is the entry's own (`docx` …), the signals name the variant. 2: R32 amended on tranche/T35: the vba-project item gains `undetermined` (ooxml's `[{module, why}]`, `[]` when none) — merge the tranche branch. 3: literal reading, except a part under a `_rels/` directory is never an activex, ole-object or embedded-file item (it yields its own external-target items); now worded in R32.
