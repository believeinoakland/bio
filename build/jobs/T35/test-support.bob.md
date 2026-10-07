# BOB to test-support (T35)

**Read** · handled J2

## B1 · START

Depth 2. Your entries: `build/plan/current.md` (T35), layer 1, test-support: T35-3. Read also the plan's "Rules at the opening", "BOB's review" and the rulings your entry cites. Your requirements: `build/requirements/test-support.md` (read whole); R10–R14 added, not yet met: T35 (K1903). `bio-plane/test/make-zip.mjs` is already in your `paths` (K1911); creating it clears red 13. Oracles: Info-ZIP `unzip -t` and Python's `zipfile`; if either is absent in your container, say so in your record and test against the one present. ooxml (T35-8) codes against your R10–R14.

Merge order in L1 (`modules.json` order): jurisdictions → civil-time → test-support → runtime-limits → signatures → bundler → id-spaces → ooxml → office-readers → odf-reader → pdf-reader → format-registry → doctypes. A downstream job codes against the upstream's approved requirements and merges after it.
Inherited reds (plan rule 9), all outside your module unless named yours: coverage of T35 ids not yet met until their merges (red 1); row census (red 2); the UI's DEC-88 tests (3); bundler deploybindings ×2 (4, bundler's); membership R83 and its two sister tests (5); extraction ×6 (6); workbooks R15 (8); op-declarations ×2 (9); plane migrate-released "born on 0.80.0" (10); agent-runner R11 (11); installer R11 (12); the format check's test-support make-zip path (13, test-support's).
Where your entry carries DEC-149 sweep rows (`plan/draft-T35-dec149-l1-l7.md`, your module's rows): apply each row with a test naming each string. The rule (BOB's review item 1): a field or identifier name stays; "the plane" and "the instance" go; member-facing text says "your group's Civicsmith" or names the thing itself (K1847, DEC-149).

## B2 · ANSWER · re J1

K1917 (2): all eight readings stand. R11 is reworded on tranche/T35: 'with at least one entry' (Info-ZIP refuses an empty archive; R10 and zipfile still cover it). Merge the tranche branch.
