# publish-schedule (T51)

**Status** · session_01S1FikQpxogSbRoKkJX9qgY · depth 2 · WORKING · handled B0

## J1 · REPORT

One words finding stays in `publish-schedule`, and I judge it developer text, not member text, so I have not converted it:

- `bio-plane/src/publish-schedule/index.mjs:82`, `PROVIDER_MALFORMED` detail: "the scheduled publisher gives the door publishScheduled".

Why: `registerScheduledPublisher` is called once at `ratification`'s start with a publisher object. The detail answers only when that object lacks the `publishScheduled` door, which is a wiring error in the calling module, not an act any member takes. No member sees it; the caller is the code.

The words check (`checks/words.mjs publish-schedule`) still counts it as the one `plain` failure. Per K3944 it needs your decision: add its text to the design's unkeyed list, or tell me to key it with `localize('publish-schedule.index.the_scheduled_publisher_gives_the_door', …)`. I have changed nothing for it.
