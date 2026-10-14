# installer (T47)

**Status** · session_01WbAX8BnhgQzuvLSYMgkYAv · depth 2 · WORKING · handled B0

## J1 · QUESTION

Three points where R50–R53 meet older ids; I carry on with each best reading and stop for none.

1. **R53 against R1 (where the faces are served).** `interface-assets`' `civicsmith.css` names its faces at `url("/app/assets/fonts/<f>")` (its R1, R2), so to "use its stylesheet and faces, carried in the bundle" the installer must answer those paths on its own origin. R1 says every path but `/`, `/update`, `/begin`, `/callback` is a 404. **Best reading:** the installer also answers `GET /app/assets/<name>` for exactly the names of `ASSET_FILES` (the stylesheet, the 15 faces, `icons.svg`, the three licences), byte for byte, with their type and an immutable cache header, storing nothing; every other path stays 404. R1 gains that clause (BOB's wording). Alternative, not taken: inline the stylesheet with the faces as `data:` URLs (about 1.1 MB on every page, the streamed progress page included).

2. **R52, "the version before".** `GET /update` runs before Cloudflare's permission, so the installer cannot know the group's address (the account's workers.dev prefix) or ask its `op=bootstrap`; reading `<address>/version` from the browser would be a load from another origin (R53, R35). **Best reading:** `GET /update` draws the release this update installs ("This update: release X, signed by Civicsmith") and says the release your group's Civicsmith runs now is read once Cloudflare lets the installer find it; the version before and after is then drawn as its own line on the progress page (R17's `op=bootstrap` read, already made) and on the finished panel ("from A to B"), as the design's two rows.

3. **The registry's "Run the checks again" (`selftest` act on `install`).** Not in R51. The installer holds nothing after the callback, and the browser cannot call the copy's `selftest` with the probe key (its OPTIONS answer allows no `authorization` header; and it would be another origin). **Best reading:** not drawn on the installer's finished panel; the checks are shown as run (R51), and the same checks are the copy's own to re-run after the hand-over. If BOB wants the button, it can only re-open the installer from the start.
