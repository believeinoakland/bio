/* network-notices' published fixtures (K4990, K4993, K5044): the answers of this module's real code, for the modules that use
   it (`screens-inquiry` R1, R2a, R4 and its project notice). Made when a test runs, over the test world (`fixture.mjs`),
   never stored: a user takes the answer from here rather than building its own. */
import { seeded, world, prepare, post, NOW, DAY, day } from "./fixture.mjs";

/** The refusal `noticeprepare` answers for each code, each made by the real module on a world that breaks only that
 *  condition (R1's order: the earliest refusal of a world is the one it is built to show). */
const SCENARIOS = {
  /* a first revision while the project has an open notice, naming it */
  NOTICE_ALREADY_OPEN: async () => {
    const w = seeded();
    await post(w);
    return prepare(w, { wording: "another" });
  },
  /* a `since` before the project's creation (2026-01-05), which the answer names as project_created */
  NOTICE_SINCE_BEFORE_PROJECT: async () => prepare(seeded(), { since: "2026-01-04" }),
  /* no team slug recorded: there are no anonymous notices */
  NOTICE_NO_GROUP_SLUG: async () => {
    const w = world({ slug: null });
    w.member("alice");
    w.P = w.project("budget", "alice");
    return prepare(w);
  },
  /* no instance key bound to the copy */
  NOTICE_NO_INSTANCE_KEY: async () => {
    const w = world({ key: false });
    w.member("alice");
    w.P = w.project("budget", "alice");
    return prepare(w);
  },
  /* a closed project takes no new notice */
  NOTICE_PROJECT_CLOSED: async () => {
    const w = seeded();
    w.close(w.P);
    return prepare(w);
  },
  /* a `since` later than today */
  NOTICE_SINCE_IN_FUTURE: async () => prepare(seeded(), { since: day(NOW + DAY) }),
  /* a wording that is empty */
  NOTICE_WORDING_MALFORMED: async () => prepare(seeded(), { wording: "" }),
};

/** The codes `noticePrepareRefusal` answers, in R1's order. */
export const NOTICE_PREPARE_REFUSAL_CODES = Object.freeze(Object.keys(SCENARIOS));

/** The real refusal `noticeprepare` answers for `code`, with its row (`reason`, `code`, `check`, `translation`). A code the
 *  module does not refuse this way is an error, never an invented answer. */
export async function noticePrepareRefusal(code) {
  if (!Object.hasOwn(SCENARIOS, code)) throw new Error(`no noticeprepare refusal is published as ${code}`);
  const r = await SCENARIOS[code]();
  if (!r || r.ok !== false || r.reason !== code) throw new Error(`the real answer for ${code} is ${JSON.stringify(r).slice(0, 200)}`);
  return r;
}
