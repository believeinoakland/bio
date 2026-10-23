# Diagnosis R7, G1 live findings (BOB #264; biosmoke8 at 6351c8fb14; probed 2026-10-23 ~12:35Z, read-only)

## Finding 1: "the cron does not fire" -- it DOES fire. The walker looked in the wrong places.
Root cause: a mis-keyed probe, plus a GraphQL dataset that is empty for every cron on the account.
- Telemetry, filter `$metadata.service`=biosmoke8 AND `$workers.eventType`=scheduled (or `$metadata.origin`=scheduled, or
  `$metadata.trigger`=`*/5 * * * *`): 13 events, all `outcome: ok`, wall 1.0-3.3 s, cpu 1 ms, `event.cron` "*/5 * * * *",
  entrypoint default. scheduledTime (UTC): 11:20:40 11:25 11:30 11:40 11:45 11:50 12:00 12:05 12:10 12:15 12:20 12:25 12:30:40.
  Events are `type: cf-worker-event`, so a filter for `fetch`-only or a `scheduled` event *type* never matches.
- First run came ~20 min after the schedule was created (11:00:42Z); slots 11:05-11:15, 11:35, 11:55 have no event. Unknown whether
  Cloudflare propagation or skipped/undelivered runs; the platform check below should watch for gaps.
- GraphQL `workersInvocationsScheduled` (fields are direct: scriptName cron status datetime; it has no `dimensions`) returns []
  for biosmoke8 AND for file-scanner, whose `*/10 * * * *` (schedules API, created 2026-10-22T05:42Z) has 178 scheduled events in
  the 48 h telemetry. So that dataset is not a witness here; do not use it as one. (`workersInvocationsAdaptive` has no `eventType`.)
- Deploy side is sound: `GET .../biosmoke8/schedules` = [*/5 * * * *], created=modified 11:00:42Z; deploy.mjs:283-321 PUTs and reads back
  the schedules after the upload; nothing reset it. Settings: usage_model standard, no placement, observability on (invocation_logs).
- The watchdog's effect (alarm re-armed, `watchdog_seen` advanced) is NOT shown by this; see finding 2: it cannot be seen via owedwork.
- (1) root cause: probe error, not a platform fault. (2) tests missed nothing here: no unit test can show the platform fires.
  (3) n/a. (4) platform check: after a deploy, query telemetry `$workers.eventType`=scheduled for the service, expect one
  `outcome: ok` per 5-minute slot within ~25 min of the schedule's created_on, and flag a gap > 10 min; record the filter key in the
  walk script so it is not rediscovered.

## Finding 2: administrator's `op=owedwork` carries none of the five fields. ROOT CAUSE FOUND.
- The composition is correct (store.mjs:807-809 hands `health` and `administers`). The failing link is `administers` against the
  viewer the door really stamps for the founder.
- admission/index.mjs:344-352 `resolveSession`: `viewer: r === "admin" ? "admin" : "member:<id>"` -- the founder's viewer is the BARE
  `admin` ("viewerPredicate's root-administrator spelling"). The door stamps `viewer` from it (control-plane/index.mjs:1355, 1413).
- store.mjs:809 `administers: (v) => v === "class:admin" || (v startsWith "member:" && membershipOf(ctx).isAdministrator(...))`.
  `"admin"` is neither, so false; pending.mjs:318-326 `stalled()` returns the bare answer: no fields, not even null. Exactly the walk.
  (The walker's session is the founder/admin session; a non-founder admin member, `member:<id>` with role admin, would pass.)
- (2) Why tests missed it: watchdog.test.mjs:144-197 asks with `viewer=class:admin` (machine/root credential) and `member:ada`
  (admin member) straight into the Store (`x.fetch("/owedwork?viewer=...")`), never the door-stamped founder `admin`; fix6-pending uses
  `member:ann`. No test goes door -> admission -> store with a session whose role is `admin`.
- (3) Test that catches it: through the real entry path (control-plane door default export, as t51-round6-seam.test.mjs does), sign in
  as the founder (role admin), call `op=owedwork` (with and without `sha`), assert `watchdog_seen`, `last_run`, `alarm_at`, `stale`,
  `oldest_overdue` are all own properties (null allowed); the same as an ordinary member asserts none present; as an admin member
  (`member:<id>`) and as `class:admin` token, present. Also a unit row: `administers("admin") === true` beside the other spellings.
- (4) Platform check: a founder session reads `op=owedwork` on the copy; expect the five keys, `watchdog_seen` within ~5 min of now
  (equals a scheduledTime above), `alarm_at` a future time. I did not sign in; that read would show these if fixed, nothing if not.
- Fix: owning module plane (bio-plane/src/plane/store.mjs:809, the `administers` lambda): also accept `v === "admin"` (the founder's
  session viewer), ideally by one shared predicate with membership/viewerPredicate's root spelling rather than another literal.
  pending.mjs doc comment (line ~310) should name the spellings. Secondary hardening: when `health`/`administers` are handed and the
  asker is an administrator but health fails, say so (a field `watchdog_seen: null` plus a reason), not silence (K4566 never silent).
