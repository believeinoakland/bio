# screens-entry (T49)

**Status** · session_01H73fxUtMGo1PPXKWMHzAzS · depth 2 · COMPLETE · handled B7

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

## J4 · COMPLETE

**Complete** (T49-21), on `job/T49/screens-entry` with `tranche/T49` merged through B7 (`a94ac704cf`).

**Read whole** (plan rule 2): my requirements, entry T49-21 and plan rules 1–7, layer 11's contract, my code (all 8 files), setup-words R10–R13, the interface-shell kit and gate parts my entries touch (`checkScreens`, `wordsOf`/`pageWords`, `signedIn`, `run`, `call`), credentials' `claim`/`login`/`recoveryCodesState`, membership's `sessionRights`/`founderHandleSet`, control-plane's `whoami`, and every test of mine (all name R2, R4, R6, R9 or R12–R15, which my entries change). Measured first: a pre-T49 founder's whoami is `member: "admin"`, `handle: null`, `rootOfTrust: true`; after a claim with a handle, `handle` is hers (J1).

**Entries applied:**
- R21 words by key: no English held; `SCREEN_WORDS` empty; `words.mjs` holds the keys each screen reads (words-reads.json's 231 with every key a requirement names); `HOSTING_CONTROL`/`FORGOT_HELP` by their keys (the `setup-fleet` import gone); retired `screen.forgot.handle.help`, `screen.setup.taken`, `signin.founderhint` read by none. Tests assert keys with `hasWord`, sample drawings against `word(key, vars)`, and hold no English.
- R16: `signin.handle.help` and `forgot.handle.help`; no `admin` drawn on front or forgot in any state.
- R17: the claim asks the handle between the one-time password and the password, sends `claim` with it, signs in by the handle the claim answers (never `admin`), draws `screen.setup.claimed` with `{group}`, `{handle}`; its four refusals by key, the handle kept and passwords cleared; no handle typed is refused locally (K3369 (3)).
- R18: front's sign-in reads whoami first; a founder with `rootOfTrust` and no handle is taken to setup's step (`founderhandleset`, "Later" a link to Home); done draws `founder.handle.done` with "Go to Home" (K3369 (1)).
- R19: a member or a non-founder administrator on setup reads nothing and sees `setup.member.*` with Home; "Show my recovery codes" only to the founder while `recoverycodesstate` answers `held: false` (K3369 (2)).
- R20: the codes under `setup.codes.once` with `setup.codes.copy`/`save`; state c (`setup.claimed.heading`, `.sub`, `refusal.ALREADY_CLAIMED`, "Sign in") for a refused claim and a visit to a claimed instance.
- R2, R4, R6 re-worded: met as above. R9's registry red cleared (an owed act read by its op). N1073: `common:80` reads the screens' own acts and bodied reads; `setup:88` reads the registry's acts for setup. D29: a nested `ok: false` is a refusal (the kit mirrors the shell); tested on the claim. N1068: no English held, so nothing to re-spell. `admin` grep: `setup.mjs`'s `login`/`signin` as `admin` and the two words removed; `role: "admin"` in `memberadd` is a role, not the founder's id.
- Flaw fixed in passing: a refused claim no longer leaves the password in the page's memory (every claim refusal clears `ui.pending`).

**Deferred:** none.

**Other modules (reported):** J1 interface-shell's `RE_POINTS.setup` (done, K3369/R71); J3 `screen.setup.claimed.nosignin`'s English names `admin` (design lane, K3375).

**Tests:** `node --test bio-plane/test/m/screens-entry/` on the real shell, op-declarations and setup-words: 73 pass, 0 fail. Importers: interface-shell, control-plane `t46-app`, plane `t47`, instance-setup `page`: pass; membership `module-order` 5 fail (rule 5 (10), accepted); journey-check 21 fail (`playwright-core` not installed in this container; same with and without my change).

**Checks:** format 0 failures; architecture 16 files, 0 failures; coverage 21 of 21, 0 failures; ownership 12 files, 0 failures. `checks/run.mjs`: format, architecture, channels 0; coverage 7 failures, none screens-entry's (other modules' rule 5 (1) reds).

Size (session_01H73fxUtMGo1PPXKWMHzAzS): test runs 20, module lines 940
