# capture (T42)

**Status** · session_01Kru2kyU9rCEgAQWN4QGh4o · depth 2 · WORKING · handled B1

## J1 · QUESTION

The nine moved rows' `where`s (C-85.1–.5, C-118.2, .3, .4, .7). Doorbell R21 says "Each row's `where` names the code in this module [doorbell] that raises it", but K2609 keeps the rows defined once, in capture's `checks.mjs`, which only this job may edit; the map §2 says each `where` is re-pointed (`src/doorbell/index.mjs …` for `#noSuchKnock`, `pullKnock`, `inboxResolve`, `#knockRateRefusal`; `src/doorbell/door.mjs …` for the three pre-store helpers and `knockerSecretWeak`), and plan rule 4 (2) already expects "doorbell's re-pointed `where`s" in the census.

My best reading: this job re-points those nine `where`s in capture's `checks.mjs` to doorbell's files, with the function and region names kept (the map's §2 targets), so the rows name the live raiser; the row's code, number and translation unchanged. I merge after doorbell, so its files exist at my merge. If doorbell's job names its functions or regions differently, I follow its code at merge. Carrying on meanwhile; this decides only the `where` strings.
