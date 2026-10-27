/* queue's published fixtures (K5217, interface-shell R7, R10, R82, R84, R103): what `op=queue` answers a member whose feed is
   empty and one whose feed holds one obligation, made by queue's own `queueFeed` over its test world each time the function
   runs and never stored. A user's test takes the answer from here and does not write it by hand. `fixtures.test.mjs` checks
   that each is the real answer. The member is `mai`, asked as herself (`member:mai`), the way the control plane stamps the
   call; the count is the number `count: true` answers over the same world. */
import { world } from "./world.mjs";

export const FIXTURE_MEMBER = "mai";
const ASK = { member: FIXTURE_MEMBER, viewer: `member:${FIXTURE_MEMBER}` };

/* A world with `mai` as a member and nothing else in it: her feed is empty. */
function emptyWorld() {
  const w = world();
  w.member(FIXTURE_MEMBER);
  return w;
}

/* The same world with one open task assigned to `mai` on a bundle she can see: her feed holds one OBLIGATION. */
function oneItemWorld() {
  const w = emptyWorld();
  w.bundle("INF-1");
  w.task("TASK-2026-0001-a", "INF-1", { assignee: FIXTURE_MEMBER });
  return w;
}

/** `op=queue` for a member with an empty feed: the list answer, `items` [] and the answer's own fields. */
export function emptyFeed() {
  return emptyWorld().q.queueFeed({ ...ASK });
}

/** `op=queue` for a member with one item: the list answer, `items` holding the one OBLIGATION. */
export function feedWithItem() {
  return oneItemWorld().q.queueFeed({ ...ASK });
}

/** `op=queue` with `count: true` for a member with an empty feed: the count alone. */
export function emptyCount() {
  return emptyWorld().q.queueFeed({ ...ASK, count: true });
}

/** `op=queue` with `count: true` for a member with one item: the count alone. */
export function countWithItem() {
  return oneItemWorld().q.queueFeed({ ...ASK, count: true });
}
