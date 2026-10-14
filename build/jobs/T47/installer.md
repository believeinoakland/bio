# installer (T47)

**Status** · session_01WbAX8BnhgQzuvLSYMgkYAv · depth 2 · COMPLETE · handled B5

## J1 · QUESTION

Three points where R50–R53 meet older ids; I carry on with each best reading and stop for none.

1. **R53 against R1 (where the faces are served).** `interface-assets`' `civicsmith.css` names its faces at `url("/app/assets/fonts/<f>")` (its R1, R2), so to "use its stylesheet and faces, carried in the bundle" the installer must answer those paths on its own origin. R1 says every path but `/`, `/update`, `/begin`, `/callback` is a 404. **Best reading:** the installer also answers `GET /app/assets/<name>` for exactly the names of `ASSET_FILES` (the stylesheet, the 15 faces, `icons.svg`, the three licences), byte for byte, with their type and an immutable cache header, storing nothing; every other path stays 404. R1 gains that clause (BOB's wording). Alternative, not taken: inline the stylesheet with the faces as `data:` URLs (about 1.1 MB on every page, the streamed progress page included).

2. **R52, "the version before".** `GET /update` runs before Cloudflare's permission, so the installer cannot know the group's address (the account's workers.dev prefix) or ask its `op=bootstrap`; reading `<address>/version` from the browser would be a load from another origin (R53, R35). **Best reading:** `GET /update` draws the release this update installs ("This update: release X, signed by Civicsmith") and says the release your group's Civicsmith runs now is read once Cloudflare lets the installer find it; the version before and after is then drawn as its own line on the progress page (R17's `op=bootstrap` read, already made) and on the finished panel ("from A to B"), as the design's two rows.

3. **The registry's "Run the checks again" (`selftest` act on `install`).** Not in R51. The installer holds nothing after the callback, and the browser cannot call the copy's `selftest` with the probe key (its OPTIONS answer allows no `authorization` header; and it would be another origin). **Best reading:** not drawn on the installer's finished panel; the checks are shown as run (R51), and the same checks are the copy's own to re-run after the hand-over. If BOB wants the button, it can only re-open the installer from the start.

## J2 · QUESTION

Adds to J1 (does not replace it): two more meetings of R50 with older ids, and one Uses line. I carry on with each best reading.

4. **R50 against R41 (what sends `/begin`).** R41: "only the founder's confirming act in the dialog sends `/begin`"; R50: after the two choices comes "Before Cloudflare", and "Continue to Cloudflare" sends `POST /begin`. **Best reading:** the first page's act that chooses the short name ("Continue", Irreversible weight, R41) opens R41's permanence dialog; its confirming act ("Continue with this short name") draws "Before Cloudflare" and sends nothing; "Continue to Cloudflare" there sends `/begin` with the name the dialog showed. Closing the dialog, "Choose another name" and "Back" send nothing. R41's sentence then reads "Nothing sends `/begin` before the founder's confirming act in the dialog; it is sent by R50's 'Continue to Cloudflare'". The R41 test follows that flow.

5. **R50's "asks only" against R45, R37, R23.** R45 puts an optional Workers VPC field on the install page; R37 and R23 (T36) put the assistant's and the Containers permission's paragraphs there. **Best reading:** the first page asks only the short name and the places, with R23's prerequisites (Workers Paid, a payment method, the Containers permission and what it installs, R23 T46's per-member notice) in its one "What you need" block. "Before Cloudflare" says in plain words what Cloudflare will be asked to allow, then R34's words; below them, folded and closed by default, "About the assistant" (R37's words) and "For an organization with its own security tools (most groups skip this)" (R45's words and its optional VPC field). Nothing preselected; R45's field is still on the install page, only not one of its asks.

6. **Uses (not mine to write).** The installer reads `instance-setup`'s `HOSTING_CONTROL` block (`hostingControlBlock`, R34; instance-setup R83 already says so), but `installer.md`'s Uses names only `GROUP_SLUG_RE` and `FLEET_BINDINGS` from it. Asking BOB to add `HOSTING_CONTROL` (R34, R50) to that line.

Also, without asking: every installer page declares `<link rel="icon" href="data:,">`, so a browser's own `/favicon.ico` request (R1's 404) is never made; `journey-check` R2 fails a walk on any 4xx.

## J3 · COMPLETE

**T47-87 · installer: complete** at `365b02ceee` on `job/T47/installer` (tranche merged at B2).

**How the reading set was read (mechanics §17, K2032).** I read whole my requirements, every source file (`newgroup/src/index.mjs`, `ui.mjs`, `images.mjs`, `signers.mjs`, `scripts/embed-release.mjs`, `package.json`, `wrangler.jsonc`, `DEPLOY.md`, `bio-plane/public/newgroup/index.html`), the services my Uses names (`setup-fleet.mjs`; `interface-assets`' Purpose and Provides, and the stylesheet itself), the fold's §B and doubts, and the design's `install`/`update` drawings, registry entries and words. Two helpers read the rest in full and wrote digests citing each section: (1) the whole test battery (`newgroup/test/*`, `newgroup-bundle-fresh.test.mjs`); (2) the later L11 users (`plane`, `journey-check`) and the parts of `interface-shell` and `screens-entry` that are about `/app/setup#boot=`. Generated `release.mjs` and the bundle were not read (K2053).

**Entries applied** (R50–R54; K3144):
- **R53.** Every page links `interface-assets`' `civicsmith.css`, carried in the bundle. The installer serves all of `ASSET_FILES` itself at `/app/assets/<name>` (R54's exception to R1), byte for byte, with an immutable cache header. `PAGE_CSS` is now only layout, in the stylesheet's tokens, with no colour or face of its own. Chromium shows the faces loading from the installer's own origin, with no other-origin request, no 4xx and no script error, in light and dark, at 390 and 900 px.
- **R50.** The first page has the one "What you need" block (R23 and R23 T46), the short name with R41's Irreversible weight and dialog, and the places. The dialog's confirming act draws "Before Cloudflare": one plain line for each of R2's five scopes, then R34's words from `HOSTING_CONTROL`. Below them, folded and closed, are R37's words and R45's optional VPC field. "Continue to Cloudflare" sends `/begin`, and only after a confirmation.
- **R51.**
  - Progress: one `cs-row` line per step, with its state as a word beside it (Now, Done, Not done).
  - Stops: each names the step it stopped at (`fail`'s fourth argument; an explicit step where later lines were already drawn, such as `addr`) and says what to do ("To continue: …"). Every stop before `install` says "Nothing was created".
  - Finished panel: the checks as four lines (address answers; builds; read-back; no log); the one-time password and the address, once; the probe key in a closed `<details>`, "(most groups never need it)"; the hand-over to `<address>/app/setup#boot=<password>`, with the password read from `out-boot` at the click.
- **R52.** `GET /update` draws the release it installs and "Continue to Cloudflare to update". The progress line and the last screen draw before and after (unread is said as unread). Every update stop ends "If a step stops, your group's Civicsmith keeps running as it was."
- **R54.** Its own test (the asset exception and its controls; R41 as amended; the update versions; no "Run the checks again").

**Flaws fixed in my module (P8).**
- `.cs-dialog{display:grid}` would have shown the closed dialog on load. The layout now hides it, and a test pins this.
- "Continue to Cloudflare" could send before any confirmation. It is now guarded, with a test.
- Wording that still named the retired setup page now says "settings, under Places and offices".
- The invitation page said "about five minutes"; it now says twenty, as the design does.
- `DEPLOY.md`'s verification steps now match the new flow.
- I moved the test helper `pageWorld` into `fixture.mjs`.

**Deferred.**
- R48: the stewards' address is Bob's to name (N923).
- R13 and R24: MULTI-INSTANCE-ISOLATION.
- R43's shipped-key todo.

All three are unchanged and outside my entry.

**Found in other modules (REPORT).**
1. My R34 test imports `setupPage` from `bio-plane/src/setup.mjs`, which instance-setup R83 removes. When that merge lands, I adapt the test to compare against `HOSTING_CONTROL` alone (a CHANGE to me).
2. For journey-check R1(a), the fake Cloudflare account is my test code (`newgroup/test/fixture.mjs`, in-process `fetch` stub, `run()` drives begin and callback itself). A browser walk needs a long-lived world served over HTTP. If journey-check needs it, I can add an exported helper; that is BOB's call on the edge.
3. `installer.md`'s Size line is stale. Source is now about 2,880 lines (without `release.mjs`), and tests about 4,350.
4. The generated `newgroup/dist/newgroup.bundled.mjs` is mine and is rebuilt and committed. It is 17.8 MB, now carrying about 1.1 MB of faces.

**Tests and checks.**
- `newgroup` `npm test`: `embed: 23 passed, 0 failed`; `wizard: 209 passed, 0 failed`; `requirements` and `t47`: `ℹ pass 58, ℹ fail 0, ℹ todo 4`.
- `bio-plane/test/system/newgroup-bundle-fresh.test.mjs`: `pass 1, fail 0`.
- `format: 168 modules, 167 requirements files; 0 failures`.
- `architecture` (installer): `19 product files, 46 relative imports; 0 failures`.
- `coverage` (installer): `54 of 54 live requirement ids named by a test; 0 failures`.
- `ownership` (installer, tranche/T47): `9 files changed; 0 failures`.
- `checks/run.mjs`: architecture `3130 product files; 0 failures`. Coverage shows 23 failures, all other L11 modules' unbuilt ids, none of them installer's.
- No service I provide changed, so no user's tests are owed (P11).

Size (session_01WbAX8BnhgQzuvLSYMgkYAv): test runs 18, module lines 2878

## J4 · COMPLETE

**B3 and B4 (K3149) processed:** I merged `tranche/T47` (instance-setup, setup-words, wizard-scripts and op-grades) into `job/T47/installer`; it is now at `35845c8422`.

- **B4.** `requirements.test.mjs` no longer imports `setupPage`. Nothing in `newgroup/` names `setupPage` or `SETUP_HTML`.
- **R34's test.** It used to compare against the retired claim page. It now checks `instance-setup`'s one holder directly: `hostingControlBlock` with a guide address links "Replace the one-time password". Without the link it is byte-identical to the block the installer's last screen shows. The rest of R34's test is unchanged.
- **Bundle.** It is unchanged by the merge. The bundle-fresh test passes.

**Tests and checks after the merge.**
- `embed: 23 passed, 0 failed`; `wizard: 209 passed, 0 failed`.
- `requirements` and `t47`: `ℹ pass 58, ℹ fail 0, ℹ todo 4`.
- `newgroup-bundle-fresh`: `pass 1, fail 0`.
- `format`: `0 failures`.
- `architecture` (installer): `19 product files, 45 relative imports; 0 failures`.
- `coverage`: `54 of 54; 0 failures`.
- `ownership`: `11 files changed; 0 failures`.

J3's REPORT items stand, except item 1, which this change settles.

Size (session_01WbAX8BnhgQzuvLSYMgkYAv): test runs 20, module lines 2878
