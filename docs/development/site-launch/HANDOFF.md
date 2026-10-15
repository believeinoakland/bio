# SITE-LAUNCH — handoff to BOB

Numbered entries `## H<n> · <date> · <subject>`: code or requirement changes the product needs, found in this lane. BOB answers each with the K that folds it.

## H1 · 2026-10-15 · Doubled full stop after the "not yet public" placeholder in "Questions"

On the front page, with `STEWARDS_ADDRESS` unset, "Questions" reads "…**The address to write to is published here before the site opens.**." — the placeholder's own full stop is followed by the sentence's. Seen at https://civicsmith-site.believeinoakland.workers.dev/ at both widths. The unset placeholder (the `stewardsUnset` part, words by key per R12) should carry no final stop, or the page's template should not add one. Cosmetic; it disappears from public view once H2's address is set, but the placeholder is what Bob sees now.

## H2 · 2026-10-15 · `STEWARDS_ADDRESS`'s value — pending (N923)

Address chosen by Bob (Site D1, 2026-10-15): `stewards@civicsmith.org`. Its destination inbox and Email Routing are still to be set up (forwarded by Cloudflare Email Routing to an inbox Bob names). When the address works end to end, a new entry here will give its value for BOB to place in a module job: site R6 `STEWARDS_ADDRESS`, installer R48 / N923's README, stewards R7. Until then the site stays "not yet public" (header `X-Robots-Tag: noindex`), and public launch waits on it.

## H3 · 2026-10-15 · The site names no icon, so every page load makes one 404 request

Browsers ask for `/favicon.ico`, which answers 404 (seen as a console error on `/` and `/nonesuch`). Harmless to the page. A small fix: either a `<link rel="icon" href="/app/assets/icons.svg">` (the mark exists there as `#i-mark`) or serving an icon at `/favicon.ico`. For BOB to decide whether it belongs in site R8's files.
