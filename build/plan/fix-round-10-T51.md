# Fix round 10 of T51: entries gathered while fix round 9's round end runs (K5036)

**Status** · Gathering. Bob (K5036): findings of the sessions still running at fix round 9's round end "can be added in th next round". Each entry is placed as a cause with its owning job when the round opens (K4426: root cause with evidence, why the tests missed it, a failing-first test, the platform check). Written by BOB.

## Sources still reporting
- LOAD-REDS #2 (`prep/load-reds-2`, §11: LOAD-RED 5 (1), why workerd closes the queued request; K5035).
- SUITE #2 (`prep/suite-2`, `build/plan/suite-T51-r9.md`; K5034).
- Re-walk 9, WALK-A #1 to WALK-E #1 (`prep/rewalk9-<a-e>`, `build/plan/walk-T51-rewalk9/<A-E>.md`; K5037).
- The fixtures check's 1,379 findings on bio (answer 841, stub 451, code 87; K5038): fix-round-9 §7 item 7 (a)-(h), moved here whole (K5036).

## Entries found so far
1. **site (K5039):** `/start`'s "Create your team" drew no `href` because the deploy value `INSTALLER_ADDRESS` was unset (`site/src/index.mjs:59`, `:98`); a deploy from `site/` with `wrangler deploy` drops a value set only at deploy time. BOB set it at deploy (`--var`, version `97a23ece`). Owed: the site's deploy carries `INSTALLER_ADDRESS` wherever the site is deployed from (its config or the release's deploy step), and `/start` with no installer address draws the step without a dead link (a test at that shape).
2. **site (K5039, MINOR, against `SCR.site`):** `/start` lacks the design's fourth "What you need" bullet ("No Cloudflare account yet? The installer walks you through opening one..."); "Places ready now" reads "City of Oakland and Alameda County" where the design reads "Oakland, Alameda County and California" (from `jurisdictions/profiles/`: check whether a California profile is meant to be listed). Placement: the site job if the drawing at `SITE_COMMIT` has them; else a HANDOFF to UX-DESIGN (K4269).
3. **installer (K5039, MINOR):** the first screen lacks the design's "Questions people ask" block under the two buttons. Placement as item 2.
