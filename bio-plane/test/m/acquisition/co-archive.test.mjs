/* acquisition R43 and R20 (K1888; K60's default): whether a capture asks a public archive for a co-archive is the group's
   choice (a setting an active administrator sets, on until turned off), and a member may choose for one capture either
   way. A capture that does not ask records so, saying who decided, never as a failed attempt. At the module's
   interface: the instance's `coArchiveSet` and `coArchiveState`, and `acquire` over a scripted network (fixture.mjs),
   where the co-archive request is the attestation's save request (attestation R3). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, run, text } from "./fixture.mjs";
import { ARCHIVE_CHECKS, coArchiveStateOf, CO_ARCHIVE_SETTING } from "../../../src/acquisition/index.mjs";

const LOC = "https://pub.example/doc";
const saves = (r) => r.net.attest.filter((x) => /web\.archive\.org\/save\//.test(x.url)).length;
const notAsked = (doc) => doc.attestation_attempts.filter((a) => a.kind === "co_archive" && a.asked === false);
const capture = (w, body = {}, o = {}) => run(w, { [LOC]: text("doc") }, { locator: LOC, ...body }, o);

test("R43: coArchiveState answers on, never set, by default (K60); writes nothing and never throws", () => {
  const w = world();
  assert.deepEqual(w.acq.coArchiveState(), { on: true, set_by: null, set_at: null });
  assert.deepEqual(coArchiveStateOf(null), { on: true, set_by: null, set_at: null });
  assert.deepEqual(coArchiveStateOf({ getSetting() { throw new Error("x"); } }), { on: true, set_by: null, set_at: null });
  assert.equal(w.rows("SELECT COUNT(*) AS n FROM settings WHERE name=?", CO_ARCHIVE_SETTING)[0].n, 0);
});

test("R43: coArchiveSet is an active administrator's act: it records the setting with who and when; anyone else, a machine credential included, is refused NOT_AN_ADMIN; an `on` that is not a boolean is CO_ARCHIVE_SETTING_INVALID with its row; a refusal records nothing", () => {
  const w = world({ admins: ["boss"] });
  const settings = () => w.rows("SELECT COUNT(*) AS n FROM settings WHERE name=?", CO_ARCHIVE_SETTING)[0].n;
  for (const by of ["m1", "class:admin", "class:daemon", null, "", 7]) {
    const r = w.acq.coArchiveSet({ on: false, by });
    assert.deepEqual([r.ok, r.reason, r.code], [false, "NOT_AN_ADMIN", "NOT_AN_ADMIN"], String(by));
    assert.ok(r.check && r.translation, "membership's row (C-96.1)");
  }
  for (const on of ["false", 0, null, undefined, {}]) {
    const r = w.acq.coArchiveSet({ on, by: "boss" });
    const row = ARCHIVE_CHECKS.CO_ARCHIVE_SETTING_INVALID;
    assert.deepEqual([r.ok, r.reason, r.code, r.check, r.translation], [false, "CO_ARCHIVE_SETTING_INVALID", "CO_ARCHIVE_SETTING_INVALID", row.check, row.translation], String(on));
  }
  assert.equal(settings(), 0, "no refusal recorded anything");
  const set = w.acq.coArchiveSet({ on: false, by: "boss" });
  assert.deepEqual([set.ok, set.on, set.set_by], [true, false, "boss"]);
  assert.match(set.set_at, /^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\dZ$/);
  assert.deepEqual(w.acq.coArchiveState(), { on: false, set_by: "boss", set_at: set.set_at });
  assert.deepEqual(w.acq.coArchiveSet({ on: true, by: "member:boss" }).on, true, "the member stamp's spelling is the same administrator");
  assert.equal(w.acq.coArchiveState().on, true);
});

test("R20 R43: with the setting on (the default), a capture asks the co-archive; with it off, it asks none and records `{kind: \"co_archive\", asked: false, by: \"group\"}` in the C-18.1 shape, never as a failed attempt", async () => {
  const w = world();
  const on = await capture(w);
  assert.equal(saves(on), 1, "the co-archive was asked");
  assert.deepEqual(notAsked(on.body.document), []);
  w.acq.coArchiveSet({ on: false, by: "boss" });
  const off = await capture(w);
  assert.equal(saves(off), 0, "no co-archive was asked");
  const rec = notAsked(off.body.document);
  assert.equal(rec.length, 1);
  assert.deepEqual([rec[0].service, rec[0].attempted, rec[0].ok, rec[0].asked, rec[0].by], ["co_archive", false, false, false, "group"]);
  assert.ok(off.body.document.attestation_attempts.some((a) => a.attempted === true), "the timestamp is still requested at every capture");
  /* the archive arm never asks one (its locator is a replay), and records none as not asked */
});

test("R43 R20: a member may choose for one capture, either way, from a member session; the choice is recorded `by: \"member\"`; from any other caller, and when not a boolean, it is ignored", async () => {
  const w = world();
  const offByMember = await capture(w, { coArchive: false });
  assert.equal(saves(offByMember), 0);
  assert.deepEqual(notAsked(offByMember.body.document).map((a) => a.by), ["member"]);
  w.acq.coArchiveSet({ on: false, by: "boss" });
  const onByMember = await capture(w, { coArchive: true });
  assert.equal(saves(onByMember), 1, "a member's choice goes either way, past the group's off");
  assert.deepEqual(notAsked(onByMember.body.document), []);
  /* not a member session: ignored, the group's setting decides */
  const admin = await capture(w, { coArchive: true }, { cls: "admin", member: false, sessMember: null });
  assert.equal(saves(admin), 0);
  assert.deepEqual(notAsked(admin.body.document).map((a) => a.by), ["group"]);
  for (const bad of ["true", 1, null]) {
    const r = await capture(w, { coArchive: bad });
    assert.equal(saves(r), 0, String(bad));
    assert.deepEqual(notAsked(r.body.document).map((a) => a.by), ["group"], String(bad));
  }
});

test("R43: on the capture-request arm the member's choice rides `captureRequest.coArchive` (carried by capture-requests); the body's is ignored there", async () => {
  const w = world();
  w.acq.coArchiveSet({ on: false, by: "boss" });
  const cr = (coArchive) => run(w, { [LOC]: text("doc") }, { coArchive: false }, { cls: "daemon", member: false, captureRequest: { locator: LOC, coArchive } });
  const yes = await cr(true);
  assert.equal(saves(yes), 1);
  const no = await cr(false);
  assert.deepEqual([saves(no), notAsked(no.body.document).map((a) => a.by)], [0, ["member"]]);
  const unset = await cr(undefined);
  assert.deepEqual([saves(unset), notAsked(unset.body.document).map((a) => a.by)], [0, ["group"]]);
});
