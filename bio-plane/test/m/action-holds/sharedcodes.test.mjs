/* action-holds R17 at its interface: the three capture-or-account codes this module's acts refuse are answered through
   `action-records` R16's one site (T48; N1024, K231, K3207). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, V } from "./fixture.mjs";
import * as records from "../../../src/action-records/index.mjs";
import { ACTION_HOLDS_CHECKS } from "../../../src/action-holds/index.mjs";

const A = "ACTN-2026-0001-a", I = "INFO-2026-0001-d";
const ALICE = V("alice");

test("R17 shared codes: CAPTURE_AND_TESTIMONY, NEITHER_CAPTURE_NOR_TESTIMONY and UNREGISTERED_ARTIFACT equal action-records' answer from holdNoticeSent and pressureRecord; a well-formed act is not refused", () => {
  const w = world();
  const s = w.doc(I);
  w.action(A);
  const P = w.project("alice", "discoverable");
  assert.equal(w.h.actionHold({ project: P, hold: "in_place", reason: "r", viewer: ALICE, author: ALICE }).ok, true);
  const N = (x) => w.h.holdNoticeSent({ place: { project: P }, at: "2026-09-29", viewer: ALICE, author: ALICE, ...x });
  const R = (x) => w.h.pressureRecord({ project: P, pressure: { kind: "other", note: "a call" }, at: "2026-09-21", viewer: ALICE,
    author: ALICE, ...x });
  const missing = "f".repeat(64);
  const site = {
    CAPTURE_AND_TESTIMONY: records.correspondEntryRefusal({ at: "2026-09-29", artifactSha: s, account: "a" }),
    NEITHER_CAPTURE_NOR_TESTIMONY: records.correspondEntryRefusal({ at: "2026-09-29" }),
    UNREGISTERED_ARTIFACT: records.actionRecordsOf(w.host).unregisteredArtifact(missing),
    BAD_DATE: records.correspondEntryRefusal({ at: "2026-02-30", account: "a" }),
  };
  const same = (got, want) => {
    for (const k of ["ok", "reason", "code", "check", "translation"]) assert.deepEqual(got[k], want[k], k);
  };
  for (const act of [N, R]) {
    same(act({ artifactSha: s, account: "a" }), site.CAPTURE_AND_TESTIMONY);
    same(act({ account: undefined }), site.NEITHER_CAPTURE_NOR_TESTIMONY);
    same(act({ artifactSha: missing }), site.UNREGISTERED_ARTIFACT);
    assert.equal(act({ artifactSha: missing }).artifact_sha, missing);
    same(act({ account: "a", at: "2026-02-30" }), site.BAD_DATE);
  }
  /* the codes' rows are the site's, not this module's */
  for (const c of ["CAPTURE_AND_TESTIMONY", "NEITHER_CAPTURE_NOR_TESTIMONY", "UNREGISTERED_ARTIFACT"])
    assert.equal(c in ACTION_HOLDS_CHECKS, false);
  /* control: a well-formed act, by account and by registered capture, is not refused */
  assert.equal(N({ account: "told them" }).ok, true);
  assert.equal(N({ artifactSha: s }).ok, true);
  assert.equal(R({ account: "a call" }).ok, true);
  assert.equal(R({ artifactSha: s }).ok, true);
});

