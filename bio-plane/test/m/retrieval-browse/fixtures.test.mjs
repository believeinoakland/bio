/* retrieval-browse's published fixtures (fixtures.mjs), each called and its real answer checked. */
import test from "node:test";
import assert from "node:assert/strict";
import { browseViewerMissing, marksRegistrarDeclared } from "./fixtures.mjs";

test("fixture browseViewerMissing is the real refusal of a browse with no viewer: VIEWER_MISSING, with its reason, code and detail", () => {
  const a = browseViewerMissing();
  assert.equal(a.ok, false);
  assert.equal(a.reason, "VIEWER_MISSING");
  assert.equal(a.code, "VIEWER_MISSING");
  assert.equal(typeof a.detail, "string");
  assert.ok(a.detail.length > 0);
});

test("fixture marksRegistrarDeclared is the real refusal of a second browse-marks registration: LISTENER_DECLARED", () => {
  const a = marksRegistrarDeclared();
  assert.equal(a.ok, false);
  assert.equal(a.reason, "LISTENER_DECLARED");
  assert.equal(a.module, "following");
});
