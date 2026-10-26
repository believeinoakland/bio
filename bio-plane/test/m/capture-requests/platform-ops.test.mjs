/* capture-requests: the platform-mark ops reach their methods (R46; K5151, plan item 71 (1)). A member marks a host a
   login-gated platform, withdraws the mark, and lists the marks through `captureRequestsOps`, the way the control plane
   calls it: the viewer from the query string, the host from the body. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, V } from "./fixture.mjs";
import { CAPTURE_REQUEST_CHECKS, captureRequestsOps } from "../../../src/capture-requests/index.mjs";

const at = (op, viewer) => new URL(`http://x/${op}${viewer === undefined ? "" : `?viewer=${encodeURIComponent(viewer)}`}`);
const hostsOf = (w, viewer) => captureRequestsOps(w.cr, at("capturerequestplatformhosts", viewer), {})
  .capturerequestplatformhosts().marks.map((m) => m.host);

test("R46 a member's mark, repeated mark, withdrawal and repeated withdrawal reach the module through the ops map, each answering as its method does; the hosts op lists the standing marks and no other host; a mark by no member is refused CAPTURE_PLATFORM_MARK_REFUSED and writes nothing", () => {
  const w = world().scene();
  /* the viewer is passed explicitly: `undefined` is the absent stamp under test, never a default member */
  const mark = (host, viewer) =>
    captureRequestsOps(w.cr, at("capturerequestplatformmark", viewer), { host }).capturerequestplatformmark();
  const unmark = (host, viewer) =>
    captureRequestsOps(w.cr, at("capturerequestplatformunmark", viewer), { host }).capturerequestplatformunmark();

  const a = mark("Social.Example.COM", V("ann"));
  assert.deepEqual([a.ok, a.already, a.mark.host, a.mark.marked_by, a.mark.withdrawn_at], [true, false, "social.example.com", "ann", null]);
  const again = mark("social.example.com", V("bob"));
  assert.deepEqual([again.ok, again.already, again.mark.mark], [true, true, a.mark.mark]);

  /* control: a host nobody marked is not listed */
  assert.deepEqual(hostsOf(w, V("ann")), ["social.example.com"]);
  assert.equal(hostsOf(w, V("ann")).includes("portal.example.gov"), false);

  const u = unmark("SOCIAL.example.com", V("bob"));
  assert.deepEqual([u.ok, u.already, u.mark.withdrawn_by, u.mark.mark], [true, false, "bob", a.mark.mark]);
  assert.deepEqual(unmark("social.example.com", V("ann")), { ok: true, already: true, host: "social.example.com" });
  assert.deepEqual(hostsOf(w, V("ann")), ["social.example.com"], "the withdrawn mark stays on the list, stamped");

  /* a mark by no member, nor the administrator, is refused through the op, as through the method */
  for (const viewer of [undefined, "", "class:ai", "class:member", "token:x"]) {
    const no = mark("refused.example.net", viewer);
    /* the refusal writes nothing: the same host is not listed afterwards */
    assert.deepEqual([no.ok, no.code, no.check, no.translation],
      [false, "CAPTURE_PLATFORM_MARK_REFUSED", "C-28.22", CAPTURE_REQUEST_CHECKS.CAPTURE_PLATFORM_MARK_REFUSED.translation], String(viewer));
    assert.deepEqual(hostsOf(w, V("ann")), ["social.example.com"], String(viewer));
  }
  assert.deepEqual(hostsOf(w, undefined), [], "an absent viewer sees no marks");
});
