# Fix round 3 of T51: the plan (seed)

**Status** · Seeded by BOB #241 (K4350) while the targeted re-walk runs (`walk-T51-rewalk/A.md`, `B.md`, K4348). The round is planned whole once the re-walk ends (K4297 (3)): every STILL and NEW finding grouped by cause, one job per cause or module, one redeploy. Entries placed before then:

## Placed

- **C64, federal offices (DEC-401, DEC-402; K4350):** design @ 43379a1a44 merged into the tranche. Owed:
  - `entities`: `entitycreate` admits an office to a member when sent from `request`, saved for the team with the "Named by a member" mark (`screen.request.nameoffice.mark`) until an administrator confirms it; an administrator's confirm of a member-named office (a provided service: requirement change BOB writes first, §7).
  - `op-grades`: the grade of `entitycreate` from a member on `request` (if its marks require it).
  - `screens-action` (`request.mjs`): "Name the office yourself" drawn as DEC-402 draws it, `entitycreate` in request's acts, the reworded `screen.request.nooffice.admin`.
  - `screens-settings` (`places.mjs`): the administrator's confirm of a member-named office under Places and offices.
  - `wizard-scripts`: the registry re-taken at 43379a1a44 (request's acts gain `entitycreate`).
- **Small, from K4320, K4230, K4332, K4334:** the inbox list routed `inboxlist` but hand-declared `inbox` (the route's alias, plane R71); wizard-scripts' `wizards` declares `state` though its arm reads it from the query; case-authoring R77's not-reached minutes shape; `impact.mjs` lists `plane/r42-entry.mjs` as a test (BOB's tooling).
