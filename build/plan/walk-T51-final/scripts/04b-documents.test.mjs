/* WALK-FINAL-04B #1: sitting 4b (Bring documents in, second sitting), offline, through the door (PHASE1-NOW.md). Each room is a Miniflare plane of its own
   (r8-kit); every input is made by the member's own acts through the real ops. The record is written row by row as each check is done. */
import "../../../../bio-plane/test/sandbox.mjs";
import test, { after } from "node:test";
import { makeKit, openRecord } from "./lib-04b.mjs";
import { r39 } from "./s-r39.mjs";
import { rate } from "./s-rate.mjs";

openRecord(`# Walk T51 final, sitting 4b (Bring documents in, second sitting): record of WALK-FINAL-04B #1

**Status** · written as the walk goes, offline (Miniflare, \`tranche/T51\` merged at \`8efbe1c055\`), script \`scripts/04b-documents.test.mjs\`. No width applies offline; screens are not drawn, so every row is the door's ops and the words the product publishes.

| row id | check | width | role | what I did | WORKS / BROKEN / NOT REACHED | what I saw (Server-Timing, wall) | screenshot |
| --- | --- | --- | --- | --- | --- | --- | --- |
`);
const ctx = {};
const room = makeKit({ tag: "w4b" });
after(() => room.mf.dispose());
test("R39 the doorbell and the Inbox", { timeout: 1800000 }, async () => { await r39(room, ctx); });
const rateRoom = makeKit({ tag: "w4brate" });
after(() => rateRoom.mf.dispose());
test("R39 the doorbell's limits", { timeout: 1800000 }, async () => { await rate(rateRoom, ctx); });
