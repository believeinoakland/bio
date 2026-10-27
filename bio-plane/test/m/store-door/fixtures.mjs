/* store-door's published fixtures (the fixtures check, bio K4990, K4995, K5044; fix round 10, Wave A batch 5). A user module's
   test takes an answer of this module from here instead of hand-building one. Each value is made by this module's real
   `dispatch` when a test runs; none is stored. Each is a function, so every caller gets a fresh value. */
import { D, quietly } from "./harness.mjs";

/* the store's answer when an op threw (R6): the real `dispatch(req, store)` over a route that throws, as the 500 body
   `{ok:false, error:"internal error", reason, code, check, translation, correlation}` (`correlation` a fresh UUID; the
   thrown text and stack are in no field). `overrides` set or replace fields, for a negative control (a wrong
   `correlation` or `reason`). The status is 500. */
export async function internalErrorAnswer(overrides = {}) {
  const store = { routes: () => ({ boom: () => { throw new Error("secret-value /srv/store.mjs:1"); } }) };
  const { value: res } = await quietly(() => D.dispatch(new Request("http://do/boom"), store));
  return { ...(await res.json()), ...overrides };
}
