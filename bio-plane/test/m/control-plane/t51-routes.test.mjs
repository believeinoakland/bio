/* control-plane R2, R26, R29 (fix round 3; K4364, K4371): the acts and reads the lower layers add in fix round 3 are routed through the
   door like every declared op: each is a route of its owner's own map, is declared by its owner (`op-declarations` R80), and reaches the
   store's route of its own name with each declared stamp set from the session and none taken from the caller, every machine credential an
   op's row refuses refused before any store request, and the owner's refusal answered as given. The ops are the five the START names
   (`officeconfirm`, `scanmirror`, `moneysets`, `captureseenin`, `remindersfor`); everything else about each is read from its owner's
   declaration (K3268), never typed here. A test that needs a declaration its owner has not merged yet is red by name. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { O } from "./harness.mjs";
import { routesForSessions } from "./door-routes.mjs";

const { OPS } = O;
const { entitiesOps } = await import("../../../src/entities/index.mjs");
const { fileSafetyOps } = await import("../../../src/file-safety/index.mjs");
const { captureOps } = await import("../../../src/capture/index.mjs");
const { actionClocksOps } = await import("../../../src/action-clocks/index.mjs");

const here = new URL("http://do/");
/* each op with the map its owner serves it from */
const OWNERS = {
  officeconfirm: ["entities R64", () => entitiesOps(null, here, null)],
  scanmirror: ["file-safety R49", () => fileSafetyOps(null, here, null, {})],
  /* money is no use of control-plane, so its map is not read here (reported to BOB); the declaration and the routing are checked */
  moneysets: ["money R28", null],
  captureseenin: ["capture R101", () => captureOps(null, here, null, {})],
  remindersfor: ["action-clocks R26", () => actionClocksOps(null, here, null)],
};
const refusesMachines = (op) => Array.isArray(OPS[op].machineClasses) && OPS[op].machineClasses.length === 0;

for (const [op, [owner, map]] of Object.entries(OWNERS)) {
  test(`R2, R26, R29 (K4364, K4371; ${owner}): \`${op}\` is a route of its owner's map, is declared, and is routed through the door with its declared stamps set from the session and none taken from the caller; the machine credentials its row refuses reach no store (control: a name the owner does not serve is no route)`, async () => {
    if (map) {
      assert.equal(typeof map()[op], "function", `${owner}: the owner's map serves ${op}`);
      assert.equal(Object.hasOwn(map(), `${op}-nonesuch`), false, "a name the owner does not serve is no route");
    }
    assert.ok(Object.hasOwn(OPS, op), `${op} is declared by its owner (${owner}) in the plane's op table`);
    await routesForSessions([op], () => ({}), { refuseMachines: () => refusesMachines(op) });
  });
}
