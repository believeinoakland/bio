/* acquisition R119 (T51 fix round 9, G138, S15; amends R108): WEB PICTURES KEPT AS BYTES ARE SAID TO BE UNREAD. A rendered page whose
   render loaded 40 pictures answers `supporting.pictures_unread {count, bytes}` (bytes the sum of the kept bodies) and the document's
   `capture.supporting` carries the same; a page with no picture carries no such key. Through the real `acquire` with `render` over the
   real driver (fake Browser binding), as seam-render does. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, run, HTML, page } from "./fixture.mjs";
import { fakeBinding, HOST } from "../capture-sources/fake-binding.mjs";

const asked = (p) => `https://${HOST}${p}`;
const SHELL = HTML("<div id=app></div>");
const PIC = 1.5 * 1024 * 1024;
const picture = (i, n) => Buffer.alloc(n, i % 251).toString("base64");

test("R119 (S15): a rendered page that loaded 40 pictures of 1.5 MiB states their count and summed size as kept and not read", async () => {
  const requests = Array.from({ length: 40 }, (_, i) => ({ url: `https://${HOST}/p${i}.png`, type: "Image", status: 200, end: "finished", bodyB64: picture(i, PIC) }));
  const w = world({ env: { BROWSER: fakeBinding({ "/pics": { requests } }) } });
  const r = await run(w, { [asked("/pics")]: () => page(SHELL) }, { locator: asked("/pics"), render: true }, { settle: false, cls: "member", member: true, sessMember: "m1" });
  assert.equal(r.status, 200);
  assert.deepEqual(r.body.supporting.pictures_unread, { count: 40, bytes: 40 * PIC });
  assert.deepEqual(r.body.document.capture.supporting.pictures_unread, { count: 40, bytes: 40 * PIC });
});

test("R119 (control): a rendered page that loaded no picture carries no `pictures_unread` key, and scripts are not counted as pictures", async () => {
  const requests = Array.from({ length: 3 }, (_, i) => ({ url: `https://${HOST}/s${i}.js`, type: "Script", status: 200, end: "finished", bodyText: `body ${i}` }));
  const w = world({ env: { BROWSER: fakeBinding({ "/nopics": { requests } }) } });
  const r = await run(w, { [asked("/nopics")]: () => page(SHELL) }, { locator: asked("/nopics"), render: true }, { settle: false, cls: "member", member: true, sessMember: "m1" });
  assert.equal(r.status, 200);
  assert.ok(r.body.supporting);
  assert.equal("pictures_unread" in r.body.supporting, false);
});
