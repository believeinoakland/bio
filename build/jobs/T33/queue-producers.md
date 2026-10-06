# queue-producers (T33)

**Status** · session_01Wn5K5a2uihWZxsspmLhjpn · depth 2 · WORKING · handled B2

## J1 · QUESTION

T33-81, R25 and R36: where this module reads each subject's zone, and one file of yours.

(1) `build/modules.json`: queue-producers' `uses` lacks `civil-time` (the requirements' Uses gained it, K1444); `checks/architecture.mjs` refuses my import until it is there. Please add it (it is layer 1, earlier in the order).

(2) No provider answers me a zone, and my Uses name no zone read. action-clocks R3 answers `local_day` but not the zone; R5 answers neither; action-plans R17, local-facts R4 and network-notices R22 answer days or instants with no zone. My best reading, which I am building now:
  (a) R15, R18 (the action's office's or venue's zone, "as actions R12 reads it"): the item's own `zone` when action-clocks carries it; else the zone `actions` R12 reads, `zoneOf(actions.place())` (actions' exports: the active profiles' combined view's `time_zone`). That is what actions' `actionFacts` reads today; action-clocks' `actionZone` additionally prefers a counterparty's own profile zone, so the two can differ for an office whose profile names another zone. If you want them identical, the clean fix is a CHANGE to action-clocks R3/R5: each item carries `zone` (the one it already computes for `local_day`); I read it first already.
  (b) R16 ("the instance profile's time_zone"), R21 (a fact's `lapses_on`/`due_from`, local days of its profile's zone, local-facts R3) and R27's lapse-near and closed windows (also days compared against now, at index.mjs :3118–3132, not among R36's five named sites but within "every day this module ... compares"): the same instance zone, `zoneOf(actions.place())`.
  (c) With no zone held, the day and the age are undetermined, stated (`reason: "zone_undetermined"`); `due` (R25) is then null for R16, whose day is an instant read in the zone; for R15 and R18 `due` stays the entry's date, already a local day by action-clocks' Terms.
  (d) civil-time services: `localDay`, `span` and also `dayRange` (R7: the first instant of a local day, for each `age.since`, which queue parses as an instant). The requirements' Uses (Private) would then read: `actions`: `place`, `zoneOf` (R25, R36); `civil-time`: `localDay`, `dayRange`, `span`.
Nothing waits on the answer except the source of the zone; I carry on.
