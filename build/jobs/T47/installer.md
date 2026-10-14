# installer (T47)

**Status** · session_01WbAX8BnhgQzuvLSYMgkYAv · depth 2 · WORKING · handled B2

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
