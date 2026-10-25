/* capture-sources' published fixtures (`fixtures.mjs`), each checked against the answer the driver really gives: a fixture that
 * drifted from the driver would fail here, not in the user's test. Each test names the requirement it checks in its title. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { renderFailure, renderRefusal } from "./fixtures.mjs";

test("R19, R69: renderFailure answers each failure as the driver does: a session with no id and a refused session and an open bound spent are named, each permanent or transient as R69 states, each with its whole time and its words", async () => {
  const want = {
    no_session: ["permanent", /acquired a session with no sessionId/],
    session_refused: ["transient", /refused a session: HTTP 503/],
    open_bound: ["transient", /gave no session within the 1000 ms navigation bound/],
  };
  for (const [cls, [failureClass, error]] of Object.entries(want)) {
    const a = await renderFailure({ class: cls });
    assert.equal(a.ok, false, cls);
    assert.equal(a.failure_class, failureClass, cls);
    assert.match(a.error, error, cls);
    assert.ok(Number.isInteger(a.elapsed_ms) && a.elapsed_ms >= 0, `${cls}: whole ms, got ${a.elapsed_ms}`);
    assert.ok(a.detail.length <= 200, `${cls}: detail is at most 200 characters`);
  }
  /* the open bound is spent by the clock, so its time is at least the bound it was asked for (R20, R69) */
  assert.ok((await renderFailure({ class: "open_bound" })).elapsed_ms >= 900);
  await assert.rejects(renderFailure({ class: "constructor" }), /no failure class/);
});

test("R19, R20, R69: renderRefusal answers the runner's four refusals: a refused connection and a page with no document are permanent, a refused session is transient, and a navigation past its bound fails by name within it", async () => {
  const want = {
    connection_refused: ["permanent", /could not navigate to .*ERR_CONNECTION_REFUSED/],
    session_refused: ["transient", /refused a session: HTTP 503/],
    not_html: ["permanent", /returned no serialised document after the render/],
    navigation_timeout: ["permanent", /did not answer within \d+ ms/],
  };
  for (const [kind, [failureClass, error]] of Object.entries(want)) {
    const a = await renderRefusal({ kind });
    assert.equal(a.ok, false, kind);
    assert.equal(a.failure_class, failureClass, kind);
    assert.match(a.error, error, kind);
    assert.ok(Number.isInteger(a.elapsed_ms) && a.elapsed_ms >= 0, `${kind}: whole ms, got ${a.elapsed_ms}`);
  }
  /* the navigation fails within the bound it was asked, not after it (R20) */
  const nav = await renderRefusal({ kind: "navigation_timeout" });
  assert.ok(nav.elapsed_ms >= 900 && nav.elapsed_ms < 5000, `navigation_timeout took ${nav.elapsed_ms} ms`);
  await assert.rejects(renderRefusal({ kind: "toString" }), /no refusal kind/);
});
