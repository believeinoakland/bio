# JOURNEYS findings

**Status** · Walk begun 2026-10-16 on biosmoke8 (release 0.85.0, fix round 6). By HTTP only so far (W2: Chromium does not trust the egress CA). Entries `J-<n>`, in the form `PLAN.md` §6 sets.

## J-1 · An unknown address draws raw JSON · MISLEADS · STILL (walk-085 F8, in part)
Journey 28, signed out, HTTP. `GET /nonexistent-walk`, `/doorbell`, `/tour` → 400 `application/json` `{"ok":false,"error":"unknown op","reason":"UNKNOWN_OP","code":"UNKNOWN_OP","check":"C-69.1","translation":"This group's Civicsmith has no operation by that name…"}`. A person who mistypes an address or follows an old link sees a developer error, not a page. Design: screen `unavailable` ("Can't open this: an address that leads nowhere"). Note `/app/*` addresses (`/app`, `/app/join`, `/app/setup`, `/app/forgot`) answer 200 with the app; whether the app draws "Can't open this" for an unknown `/app/...` address needs the browser. Owner: probably admission or control-plane (to confirm). Fixed since walk-085: `/favicon.ico` now answers 204 (was 400).
