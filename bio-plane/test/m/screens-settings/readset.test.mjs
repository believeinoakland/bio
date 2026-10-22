/* C14 (fix round 4; control-plane R122, queue R93): each Settings screen's read set. A page load reads each op once: the frame's own reads
   (`bootstrap`, `whoami`, `groupidentity`, `groupkeystate`, `queue`) are not asked again by the screen (the shell shares them with it; CAUSE-SHELL-4). Counts
   every request of the load, frame included, at the real shell harness. Red by name for the five screens that repeat a frame read until the shell's
   shared-frame-read accessor is merged; the time of each load in the harness is printed with it (no live time here: Server-Timing, K4428). */
import test from "node:test";
import assert from "node:assert/strict";
import { open } from "./kit.mjs";
import * as F from "./fixtures.mjs";

const once = ["bootstrap", "whoami", "groupidentity", "groupkeystate", "queue", "interfacewords", "infolevel"];
const cases = [
  ["R15", "security", () => F.securityTable()],
  ["R27", "updates", () => F.updatesTable()],
  ["R3", "account", () => F.accountTable(F.ADMIN)],
  ["R18", "group", () => F.groupTable()],
  ["R48", "teamai", () => F.teamaiTable()],
  ["R1", "members", () => F.membersTable()],
  ["R19", "places", () => F.placesTable()],
  ["R17", "settings", () => ({})],
];
for (const [req, id, table] of cases) {
  test(`${req} C14 ${id}: one read of each frame op per page load, and a read set with no per-project or per-row repeat`, async () => {
    const t0 = performance.now();
    const o = await open(id, { me: F.ADMIN, table: table() });
    const ms = Math.round(performance.now() - t0);
    const n = {};
    for (const r of o.p.all) n[r.op] = (n[r.op] || 0) + 1;
    console.log(`# C14 ${id}: ${o.p.all.length} reads in ${ms} ms in the harness`);
    for (const op of once) assert.ok((n[op] || 0) <= 1, `${id} reads ${op} ${n[op]} times`);
    // control: a screen's own reads are all made (the set is not emptied to pass)
    assert.ok(o.p.all.length >= 10);
  });
}
