/* WALK-FINAL-04B #1: sitting 4b (Bring documents in, second sitting), offline, through the door (PHASE1-NOW.md). Each room is a Miniflare plane of its own
   (r8-kit); every input is made by the member's own acts through the real ops. The record is written row by row as each check is done. */
import "../../../../bio-plane/test/sandbox.mjs";
import test, { after } from "node:test";
import { makeKit, openRecord } from "./lib-04b.mjs";
import { r39 } from "./s-r39.mjs";
import { rate } from "./s-rate.mjs";
import { r40 } from "./s-r40.mjs";
import { r41, watchNetwork } from "./s-r41.mjs";
import { r136 } from "./s-r136.mjs";
import { r100 } from "./s-r100.mjs";
import { rest } from "./s-rest.mjs";
import { overlay } from "./s-overlay.mjs";

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
const sourceRoom = makeKit({ tag: "w4bsrc" });
after(() => sourceRoom.mf.dispose());
test("R40 source protection", { timeout: 1800000 }, async () => { await r40(sourceRoom, ctx); });
const ref = { k: null }; const net = watchNetwork(ref);
const watchRoom = makeKit({ tag: "w4bwatch", outbound: net.outbound }); ref.k = watchRoom;
after(() => watchRoom.mf.dispose());
test("R41 watches, follows and leads; R136 R137 R138", { timeout: 1800000 }, async () => { await r41(watchRoom, ctx, net); await r136(watchRoom, ctx, net); await rest(watchRoom, ctx, net); await overlay(watchRoom, ctx, net); });
const actionRoom = makeKit({ tag: "w4bact" });
after(() => actionRoom.mf.dispose());
test("R100 the records request round trip", { timeout: 1800000 }, async () => { await r100(actionRoom, ctx); });
