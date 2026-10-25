# Fix round 10 of T51: entries gathered while fix round 9's round end runs (K5036)

**Status** · Gathering. Bob (K5036): findings of the sessions still running at fix round 9's round end "can be added in th next round". Each entry is placed as a cause with its owning job when the round opens (K4426: root cause with evidence, why the tests missed it, a failing-first test, the platform check). Written by BOB.

## Sources still reporting
- LOAD-REDS #2 (`prep/load-reds-2`, §11: LOAD-RED 5 (1), why workerd closes the queued request; K5035).
- SUITE #2 (`prep/suite-2`, `build/plan/suite-T51-r9.md`; K5034).
- Re-walk 9, WALK-A #1 to WALK-E #1 (`prep/rewalk9-<a-e>`, `build/plan/walk-T51-rewalk9/<A-E>.md`; K5037).
- The fixtures check's 1,379 findings on bio (answer 841, stub 451, code 87; K5038): fix-round-9 §7 item 7 (a)-(h), moved here whole (K5036). Its audit (item 7 (a)) runs now: four workers (sonnet, medium), one slice each of the list in module order, writing `build/plan/fixtures-T51/part-<1-4>.md` (each finding classed FIX-E, FIX-L, FALSE, CODE; the providers' fixtures; the users' re-points), read whole by BOB (K5042).

## Entries found so far
1. **site (K5039):** `/start`'s "Create your team" drew no `href` because the deploy value `INSTALLER_ADDRESS` was unset (`site/src/index.mjs:59`, `:98`); a deploy from `site/` with `wrangler deploy` drops a value set only at deploy time. BOB set it at deploy (`--var`, version `97a23ece`). Owed: the site's deploy carries `INSTALLER_ADDRESS` wherever the site is deployed from (its config or the release's deploy step), and `/start` with no installer address draws the step without a dead link (a test at that shape).
2. **site (K5039, MINOR, against `SCR.site`):** `/start` lacks the design's fourth "What you need" bullet ("No Cloudflare account yet? The installer walks you through opening one..."); "Places ready now" reads "City of Oakland and Alameda County" where the design reads "Oakland, Alameda County and California" (from `jurisdictions/profiles/`: check whether a California profile is meant to be listed). **Placed (K5043):** the drawing at `SITE_COMMIT` has neither the bullet nor the block (only the design branch does), so the site matches it: next.md N1275 once the drawing is on `main`. "Oakland, Alameda County and California" is the design's gap table (`layouts.html:1233`), not the site's drawing; the site reads the places from `jurisdictions/profiles/` (one profile, `oakland-alameda`) as site R11 states: no defect.
3. **installer (K5039, MINOR):** the first screen lacks the design's "Questions people ask" block under the two buttons. **Placed (K5043):** as item 2, next.md N1275.
