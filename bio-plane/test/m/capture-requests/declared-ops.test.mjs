/* capture-requests R57, R58, R59 (T51 fix round; K4189, K4202, K5182): each op this module declares in DECLARED_OPS is held true
   against the op as the door runs it (test-support R15): only its requires raise no refusal naming a declared field, a
   call without each required one is refused naming it, and a field outside accepts is dropped or refused naming it. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { declaredOpHolds } from "../../declared-ops.mjs";
import { DECLARED_OPS, captureRequestsOps } from "../../../src/capture-requests/index.mjs";
import { world, V } from "./fixture.mjs";

/* a refusal names a field by carrying it as null, the arm's own answer shape (`address: address || null`) */
const namesField = (answer, field) => answer?.ok === false && answer[field] === null;
/* two answers agree when they are the same verdict: the same success, or the same refusal code */
const sameVerdict = (x, y) => x?.ok === y?.ok && (x.code ?? x.reason) === (y.code ?? y.reason);
/* the op as the door runs it: its handler from the ops map, the stamps in the query and the fields as the body */
const door = (w, op, stamps) => (fields) => captureRequestsOps(w.cr, new URL("http://x/?" + new URLSearchParams(stamps)), fields)[op]();

test("R58 capturerequest declares its fields: its requires alone raise no refusal naming a declared field, a call without the address is refused naming it, and a field outside accepts is dropped", async () => {
  /* a member's own request (R56): no run and no target, so R49 is not asked and the address alone is required here; a
     run's request also requires its run and question, which a declaration cannot state (raised as a QUESTION to BOB) */
  const w = world();
  await declaredOpHolds({ op: "capturerequest", declaration: DECLARED_OPS.capturerequest,
    call: door(w, "capturerequest", { viewer: V("ann"), principal: "member:ann" }),
    values: { address: "https://example.org/a" }, refusedNaming: namesField, same: sameVerdict });
});

test("R57 capturerequestretry declares its fields: its requires alone raise no refusal naming a declared field, a call without the request is refused naming it, and a field outside accepts is dropped", async () => {
  const w = world().scene();
  const id = w.ask({}).request;
  /* each call finds the request as the source refused it, so the retry's own write does not change the next answer */
  const refuse = () => w.st.sql.exec(`UPDATE capture_requests SET state='refused', source_reason='login', code='CAPTURE_SOURCE_LOGIN' WHERE request=?`, id);
  const call = door(w, "capturerequestretry", { viewer: V("ann"), principal: "member:ann" });
  await declaredOpHolds({ op: "capturerequestretry", declaration: DECLARED_OPS.capturerequestretry,
    call: (fields) => { refuse(); return call(fields); },
    values: { request: id }, refusedNaming: namesField, same: sameVerdict });
});

/* R59: capturerequests reads its filters from the query string (the stamps too), so its fields go there, not in a body */
const queryDoor = (w, stamps) => (fields) => captureRequestsOps(w.cr, new URL("http://x/?" + new URLSearchParams({ ...stamps, ...fields })), {}).capturerequests();

test("R59 capturerequests declares its fields: no field is required, each query field it reads is accepted, and a field outside accepts is dropped", async () => {
  const w = world();
  const stamps = { viewer: V("ann"), principal: "member:ann" };
  const call = queryDoor(w, stamps);
  const values = { run: "RUN-1", target: "INQ-1", state: "requested", limit: "5" };
  await declaredOpHolds({ op: "capturerequests", declaration: DECLARED_OPS.capturerequests, call, values,
    refusedNaming: namesField, same: sameVerdict });
  /* each query field the arm reads is accepted: given with a sample value, no refusal names it */
  for (const field of DECLARED_OPS.capturerequests.fields.accepts) {
    assert.equal(namesField(await call({ [field]: values[field] }), field), false, `${field} is refused naming it`);
  }
});
