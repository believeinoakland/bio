# BOB to doctypes (T35)

**Read** · handled J2

## B1 · START

Depth 2. Your entries: `build/plan/current.md` (T35), layer 1, doctypes: T35-12. Read also the plan's "Rules at the opening", "BOB's review" and the rulings your entry cites. Your requirements: `build/requirements/doctypes.md` (read whole); R1–R3 amended, R25–R36 added, not yet met: T35 (K1902). The header labels are profile vocabulary (jurisdictions R69, `vocabulary.policy_headers`). R35 first: capture the 50 public OPD and City policies as fixtures (`plan/study-policies/`), measure; build R25–R34 only if the header block's fields are read correctly for at least 90% of them, else they wait as a measurement (K1862 (1), K1902 (5)) and you complete the rest. Depends on jurisdictions (T35-1).

Merge order in L1 (`modules.json` order): jurisdictions → civil-time → test-support → runtime-limits → signatures → bundler → id-spaces → ooxml → office-readers → odf-reader → pdf-reader → format-registry → doctypes. A downstream job codes against the upstream's approved requirements and merges after it.
Inherited reds (plan rule 9), all outside your module unless named yours: coverage of T35 ids not yet met until their merges (red 1); row census (red 2); the UI's DEC-88 tests (3); bundler deploybindings ×2 (4, bundler's); membership R83 and its two sister tests (5); extraction ×6 (6); workbooks R15 (8); op-declarations ×2 (9); plane migrate-released "born on 0.80.0" (10); agent-runner R11 (11); installer R11 (12); the format check's test-support make-zip path (13, test-support's).
Where your entry carries DEC-149 sweep rows (`plan/draft-T35-dec149-l1-l7.md`, your module's rows): apply each row with a test naming each string. The rule (BOB's review item 1): a field or identifier name stays; "the plane" and "the instance" go; member-facing text says "your group's Civicsmith" or names the thing itself (K1847, DEC-149).

## B2 · ANSWER · re J1

K1918 (3): do not load by absolute file URL. doctypes now uses pdf-reader and text-chain (both earlier in L1; modules.json on tranche/T35): import them by relative path in capture-policies.mjs, and import unpdf by package name at pdf-worker's pinned version (a package, not a module). Keep the 3 scans counted as not read. Merge the tranche branch.

## B3 · ANSWER · re J2

K1924: yes, the plane's Tier 3 counts: 46/50 = 92%, so build R25–R34 (this replaces B2's 'count the scans as not read'). Booting ocr-worker's committed bundle as files under miniflare stands. Record the in-sample caveat and the per-field figures in your record; an out-of-sample re-measure under jurisdictions' held profile is N709 in next.md.

## B4 · CHANGE

K1926: jurisdictions (T35-1) is merged into tranche/T35 (R63–R69, vocabulary.policy_headers). Merge the tranche branch and run against its held profile.
