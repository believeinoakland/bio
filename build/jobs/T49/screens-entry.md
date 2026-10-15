# screens-entry (T49)

**Status** · session_01H73fxUtMGo1PPXKWMHzAzS · depth 2 · WAITING ON BOB (J3) · handled B7

## J1 · REPORT

Two things outside screens-entry that R18 and R21 need (found at reading, before any code).

1. **interface-shell: `founderhandleset` is not admitted as an act on `setup`.** R18's "Choose this handle" is an act of `setup` sending `founderhandleset`. `checkScreens` (interface-shell `index.mjs`:149) admits an act only if it is in the screen's `SCREEN_REGISTRY` acts or owed list, `RE_POINTS[id]`, or `ANY_SCREEN_OPS`. wizard-scripts' `SCREEN_REGISTRY` is generated at `4664e8efd4` and lists no `founderhandleset` for `setup` (owed `[]`); `registry.json` in the tree spells it `owed:founderhandleset K3265`, which no reader turns into the op. So once op-declarations R71 (T49-17) puts `founderhandleset` in `OPS`, `interfacePage(SCREENS)` (and control-plane's composition) still throws for my `setup`. Smallest fix, by the pattern of `front: ["unlock"]`: interface-shell's `RE_POINTS` gains `setup: ["founderhandleset"]` (T49-20, running now), until the registry lists it. Until then my module's tests that compose the real page (`page.test.mjs`, design R12's `interfacePage`) are red on this alone, and so would be any module composing `ENTRY_SCREENS`; I will not merge-break them: I will hold `COMPLETE` until the re-point is on the tranche branch, or you say otherwise.

2. **words-reads.json's `screens-entry` entry lacks keys my requirements name** (R21 admits them: "with any key a requirement here names"): `signin.handle.help`, `forgot.handle.help`, `screen.setup.handle`, `screen.setup.handle.help`, `refusal.NO_HANDLE`, `refusal.BAD_HANDLE`, `refusal.HANDLE_TAKEN`, `refusal.HANDLE_FIXED`, `refusal.ALREADY_CLAIMED`, `founder.handle.*` (6), `setup.codes.once|copy|save`, `setup.claimed.heading|sub`. And R19's keys, which `words.json` notes as "screens-entry R19" but no requirement names: `setup.member.heading`, `setup.member.sub`, `setup.member.home` (I read these as R19's words). All exist in `words.json` on `tranche/T49`. For the design lane's list, no action of mine.

Measure first (B1 item 1): `whoami` for a pre-T49 founder answers `member: "admin"`, `handle: null`, `rootOfTrust: true` (membership `sessionRights`, `index.mjs`:781; control-plane `index.mjs`:958); after a claim with a handle, `handle` is the chosen one (credentials `claim` answers `handle`, `index.mjs`:326). `admin` reaching a reader in my module: `setup.mjs`:4 and :189–196 (`login` as `admin`, `handle: "admin"` to the shell), `words.mjs` `screen.forgot.handle.help` and `screen.setup.claimed`; all go in this job.

## J2 · QUESTION

Three readings I am building on; each is carried on as stated unless you answer otherwise.

1. **R18 "draws `founder.handle.done` with {handle} and opens Home".** A page cannot both show a sentence and leave for Home at once. My reading: on success the step draws `founder.handle.done` with a "Go to Home" link (`setup.member.home`), and nothing opens by itself. (Alternative: open Home at once and lose the sentence; or a timed open.)
2. **R19 "Show my recovery codes … only before she has seen her codes".** My reading: the founder is offered `recoverycodesissue` on `setup` only while `recoverycodesstate` answers `held: false` (no unspent code), read on `setup` for the founder only; members and other administrators never read or see it. (credentials' state cannot tell "never issued" from "all spent"; both offer it.)
3. **R17 with no handle typed.** The plane's `claim` with no handle sets the password and holds none (credentials K3337), which would leave a fresh founder without a handle. My reading: `setup` refuses locally with `refusal.NO_HANDLE`'s words and sends nothing, as it does for passwords that differ.

## J3 · REPORT

Work done and pushed (`182f5c9b4e` on `job/T49/screens-entry`, the tranche merged at B4); holding `COMPLETE` as K3369 directs.

**What still holds it.** 12 of my 73 tests are red on one cause only: `founderhandleset` is not yet an act `setup` may carry. It needs both op-declarations R71 (T49-17: `founderhandleset` in `OPS` and `SESSION_OPS.admin`) and interface-shell R71 (T49-20: `RE_POINTS.setup`). With both stood in locally (not committed), all 73 pass; without them, `interfacePage(SCREENS)` throws, which reds my page and R12 tests and R9's contract test. When both are on `tranche/T49`, send a CHANGE: I merge, re-run, and post `COMPLETE`.

**A word for the design lane (REPORT, not mine to change).** `screen.setup.claimed.nosignin`'s English still names the founder's old id: "Claimed. Sign in on your group's page with the handle admin and the password you just chose." It is drawn only when a claim succeeds and the sign-in after it fails. Under R17 (no drawn word in the flow holds `admin` as a handle) it should say the handle she chose, e.g. with a `{handle}` placeholder. I draw it by its key (R21: the quotation binds no wording), so a re-worded `words.json` needs no code here.

Checks on my module: format 0, architecture 0, coverage 21 of 21, ownership 0 (12 files). `checks/run.mjs` over the product: format, architecture and channels 0; coverage's 14 failures are other modules' rule 5 (1) reds, none screens-entry's. The tests of the modules that compose my screens (control-plane `t46-app`, plane `t47`, interface-shell, journey-check) fail the same 23 tests with and without my change (journey-check's browser walks and two shell tests); I add none.
