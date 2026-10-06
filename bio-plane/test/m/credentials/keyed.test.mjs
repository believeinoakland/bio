/* The group's keyed outside services (R29; K1449, D201), at the interface: an administrator's key, sealed and never
   shown, off by default and off while no key is held, answered to its in-plane caller only while on. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world } from "./fixture.mjs";
import { KEYED_SERVICE_CHECKS, KEYED_SERVICES, ACCOUNT_CHECKS } from "../../../src/credentials/index.mjs";
import { notAnAdmin } from "../../../src/membership/index.mjs";

const KEY = "cl-SENTINEL-key-41";
const shape = (r) => ({ ok: r.ok, reason: r.reason, code: r.code, check: r.check, translation: r.translation });
const row = (table, code) => ({ ok: false, reason: code, code, check: table[code].check, translation: table[code].translation });

test("R29 keyedServiceSet and keyedServiceSwitch: active administrators only (NOT_AN_ADMIN); an unknown service; an empty key; each writing nothing", async () => {
  const w = await world().group("ann", "dee");
  w.m.memberSet({ memberId: "dee", status: "revoked", by: "admin" });
  assert.deepEqual(KEYED_SERVICES, ["courtlistener"]);
  const before = w.snapshot();
  for (const by of ["ann", "dee", "nobody", "class:admin", "class:ai", null])
    assert.deepEqual(await w.c.keyedServiceSet({ service: "courtlistener", key: KEY, by }),
      notAnAdmin(by, "setting the group's key for an outside service"), String(by));
  for (const by of ["ann", "class:admin", null])
    assert.deepEqual(w.c.keyedServiceSwitch({ service: "courtlistener", on: true, by }),
      notAnAdmin(by, "switching the group's key for an outside service"), String(by));
  for (const service of [null, "", "lexis", "CourtListener"]) {
    assert.deepEqual(shape(await w.c.keyedServiceSet({ service, key: KEY, by: "second" })), row(KEYED_SERVICE_CHECKS, "UNKNOWN_KEYED_SERVICE"));
    assert.deepEqual(shape(w.c.keyedServiceSwitch({ service, on: true, by: "second" })), row(KEYED_SERVICE_CHECKS, "UNKNOWN_KEYED_SERVICE"));
  }
  for (const key of [null, "", "  "])
    assert.deepEqual(shape(await w.c.keyedServiceSet({ service: "courtlistener", key, by: "admin" })), row(KEYED_SERVICE_CHECKS, "KEYED_SERVICE_NO_KEY"));
  assert.equal(w.snapshot(), before, "no refusal writes");
  const nosecret = await world({ sealSecret: null }).group();
  assert.deepEqual(shape(await nosecret.c.keyedServiceSet({ service: "courtlistener", key: KEY, by: "admin" })),
    row(ACCOUNT_CHECKS, "ACCOUNT_SEAL_UNAVAILABLE"));
});

test("R29 off by default and off while no key is held; keyedServiceFor answers the key only while on, else KEYED_SERVICE_OFF; keyedServices never a key; the key sealed", async () => {
  const w = await world().group();
  const off = row(KEYED_SERVICE_CHECKS, "KEYED_SERVICE_OFF");
  assert.deepEqual(w.c.keyedServices(), { services: [{ service: "courtlistener", held: false, on: false, set_by: null, set_at: null }] });
  assert.deepEqual(shape(await w.c.keyedServiceFor({ service: "courtlistener" })), off, "off by default");
  /* switched on with no key: still off */
  assert.deepEqual(w.c.keyedServiceSwitch({ service: "courtlistener", on: true, by: "admin" }),
    { ok: true, service: "courtlistener", held: false, on: false, set_by: null, set_at: null });
  assert.deepEqual(shape(await w.c.keyedServiceFor({ service: "courtlistener" })), off, "off while no key is held");
  const s = await w.c.keyedServiceSet({ service: "courtlistener", key: KEY, by: "second" });
  assert.deepEqual({ ...s, set_at: null }, { ok: true, service: "courtlistener", held: true, set_at: null });
  assert.deepEqual(await w.c.keyedServiceFor({ service: "courtlistener" }), { ok: true, service: "courtlistener", key: KEY },
    "switched on earlier and now holding a key");
  w.c.keyedServiceSwitch({ service: "courtlistener", on: false, by: "member:second" });
  assert.deepEqual(shape(await w.c.keyedServiceFor({ service: "courtlistener" })), off);
  const listed = w.c.keyedServices().services[0];
  assert.deepEqual({ ...listed, set_at: null }, { service: "courtlistener", held: true, on: false, set_by: "second", set_at: null });
  assert.deepEqual(shape(await w.c.keyedServiceFor({ service: "nope" })), row(KEYED_SERVICE_CHECKS, "UNKNOWN_KEYED_SERVICE"));
  /* sealed and never shown: in no table, list or route answer */
  assert.ok(!w.snapshot().includes(KEY));
  const routes = w.ops("by=second");
  const said = JSON.stringify([w.c.keyedServices(), routes.keyedservices(), await routes.keyedserviceswitch()]);
  assert.ok(!said.includes(KEY));
  assert.equal(w.core.declared.get("keyed_services").classes.export, "never");
  /* a new key replaces the old; the switch stays as it was */
  w.c.keyedServiceSwitch({ service: "courtlistener", on: true, by: "admin" });
  await w.c.keyedServiceSet({ service: "courtlistener", key: "cl-2", by: "admin" });
  assert.deepEqual((await w.c.keyedServiceFor({ service: "courtlistener" })).key, "cl-2");
});
