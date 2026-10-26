/* The assembled store as plane's Store class was driven by plane's copied tests, with the class's three scheduler calls and the
   delivery it is constructed with: `alarm()`, `onAlarm(now)` and `watchdog(at)` are `scheduler`'s own `alarm`, `onAlarm` and `watch`
   (the class forwards to them, minus the retired-room check, which stays in plane). `deliver` is the test's own, else none:
   control-plane's `deliverOwedRender`, which the class hands the ledger, is a later module's (P4), and the seam with it is
   plane's and control-plane's tests'. Nothing else is added to `fixture.mjs`' store. */
import { store as assembled } from "./fixture.mjs";
import { schedulerOf } from "../../../src/scheduler/index.mjs";

export async function store({ deliver = null, ...rest } = {}) {
  const x = await assembled({ ...rest, deliver });
  x.s.alarm = () => schedulerOf(x.ctx, x.env).alarm();
  x.s.onAlarm = (now) => schedulerOf(x.ctx, x.env).onAlarm(now);
  x.s.watchdog = (at) => schedulerOf(x.ctx, x.env).watch(at);
  return x;
}
