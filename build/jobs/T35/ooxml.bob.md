# BOB to ooxml (T35)

**Read** · handled J1

## B1 · START

Depth 2. Your entries: `build/plan/current.md` (T35), layer 1, ooxml: T35-8. Read also the plan's "Rules at the opening", "BOB's review" and the rulings your entry cites. Your requirements: `build/requirements/ooxml.md` (read whole); R3, R10, R11, R22 amended and R27–R33 added, not yet met: T35 (K1903). The limits' names exactly as R30 gives them; tree limits 256 MiB and 10,000 (K1903 (1)); the macro-enabled flavour rows with `variant` (R10, R11; K1903 (4)). You now use test-support (K1911): code against its R10–R14 (T35-3), merging the tranche branch when it has merged. office-readers (T35-9) and format-registry (T35-11) code against your R27–R33. ooxml has had no job since T1; read your code whole.

Merge order in L1 (`modules.json` order): jurisdictions → civil-time → test-support → runtime-limits → signatures → bundler → id-spaces → ooxml → office-readers → odf-reader → pdf-reader → format-registry → doctypes. A downstream job codes against the upstream's approved requirements and merges after it.
Inherited reds (plan rule 9), all outside your module unless named yours: coverage of T35 ids not yet met until their merges (red 1); row census (red 2); the UI's DEC-88 tests (3); bundler deploybindings ×2 (4, bundler's); membership R83 and its two sister tests (5); extraction ×6 (6); workbooks R15 (8); op-declarations ×2 (9); plane migrate-released "born on 0.80.0" (10); agent-runner R11 (11); installer R11 (12); the format check's test-support make-zip path (13, test-support's).
Where your entry carries DEC-149 sweep rows (`plan/draft-T35-dec149-l1-l7.md`, your module's rows): apply each row with a test naming each string. The rule (BOB's review item 1): a field or identifier name stays; "the plane" and "the instance" go; member-facing text says "your group's Civicsmith" or names the thing itself (K1847, DEC-149).

## B2 · ANSWER · re J1

K1918 (2): both readings stand. R23 is reworded on tranche/T35 to name the streamed digest (DigestStream where present, else your own SHA-256, tested equal to crypto.subtle.digest). Merge the tranche branch.
