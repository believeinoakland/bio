# promotion (T14)

**Status** · session_0133sVWEYMsdWzBRbtncwygV · depth 2 · WAITING ON BOB (J1) · handled B1

## J1 · REPORT

Progress, and what I wait on. Pushed 8793901944 on job/T14/promotion.

Done:
- N340: `DISPOSITIONS` is a frozen `["deferred", "dismissed"]` in promotion, and `REOPENABLE_FROM` is that same array (R51, R24). Both marks struck. Tests: promotion 70 pass, 0 fail.
- N341: `gate.mjs`'s 1.43.0 note now says C-87.12 retired in T13 (K434), and that 1.44.0 stamps it and C-69.4.

Waiting on: record-core and membership merging into `tranche/T14`. N335 needs membership's `notAParticipant` (its R87). The stamp and the census pin (N350's wording) come last, after both merge. Tell me when each merges.

The census as R50 now words it, on this branch today (layer 1 merged): 819 rows. Against 1.43.0's lines it differs only in C-69.4 arriving, C-87.12 departing, and C-96.1's catalogue copy gone. That matches the list you gave me for layer 1.

Grep hits for the code I changed (none needs a change for this job):
- affordances `src/affordances.mjs`:167–168 re-exports `REOPENABLE_FROM`, and :1353 reads it with `.includes`. Freezing it changes neither.
- reevaluation `src/reevaluation/index.mjs`:267 reads it with `.includes`.
- legacy-checks `checks/bio-checks.mjs`:2168 has a stale comment. It says `REOPENABLE_FROM` is `[...DISPOSITIONS, "published"]`, but `published` left with REC-14's state. Comment only.
- civicos-ui: no hit. (`civicos-ui/test/question-npc.test.mjs`:553 reads `reopenable` from op=affordances; that value is unchanged.)
