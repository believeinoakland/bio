/* filing-templates, fix round 4 of T51 (C64-template; BOB's answer K4438): a kind whose profile holds no template, the shape the
   real profile's `records_request` has (Tier 1, no template; K921 Q1), answers a stated absence at this module's interface and never
   an empty offer, so `screens-action` has a real case to draw "no template is offered" from. At the interface, under
   `test-harbour`, the test profile with its kinds' templates removed (fixture.mjs), and the test profile as control. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { seeded, V, TEST, HARBOUR, twoProfiles, reviewedOf } from "./fixture.mjs";
import * as ft from "../../../src/filing-templates/index.mjs";

const A = V("alice");
const bare = () => seeded({ profiles: [HARBOUR], jur: twoProfiles });

test("R34 R35 R14 R26 (C64-template): a kind whose profile holds no template answers NO_SUCH_TEMPLATE for its handle, an empty list of offered templates and none withheld; nothing is written; control: the test profile's template is offered", () => {
  const w = bare();
  const before = w.snapshot();
  for (const r of [w.ft.templateByHandle({ name: "@records-request", viewer: A }), w.ft.offeredVersion({ name: "@records-request", viewer: A })]) {
    assert.deepEqual([r.ok, r.reason, r.code, "text" in r, r.template], [false, "NO_SUCH_TEMPLATE", "NO_SUCH_TEMPLATE", false, null]);
    assert.equal(r.translation, ft.FILING_TEMPLATE_CHECKS.NO_SUCH_TEMPLATE.translation);
  }
  const offered = w.ft.templatesFor({ kind: "records_request", use: "file", viewer: A });
  assert.deepEqual([offered.ok, offered.templates], [true, []], "a stated absence: ok, and no template, not a template with no text");
  assert.deepEqual(w.ft.unofferedFor({ kind: "records_request", viewer: A }), [], "none withheld either: there is none");
  assert.deepEqual(w.snapshot(), before, "reads write nothing");
  // control: the same kind under the test profile holds a template, and it is offered once its attribution is whole
  const t = seeded({ jur: reviewedOf() });
  const k = t.ft.templatesFor({ kind: "records_request", use: "file", viewer: A });
  assert.equal(k.ok, true);
  assert.ok(k.templates.length > 0 && k.templates.every((x) => x.versions.some((v) => v.default === true && v.state === "approved")), "an offered template has a default approved version");
});
