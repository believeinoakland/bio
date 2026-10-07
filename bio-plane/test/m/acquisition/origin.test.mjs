/* acquisition R17 with N615 (K1683, K1773): intake's `doctypeFor` is handed the capture's origin. Every arm of
   `acquire` is a fetch the copy makes, a member session's request included, so it hands `"fetch"`; `"member"` is only
   for bytes a member supplied by their own act (an upload), which a caller states through `profileOf`. So a
   content type read only from a member's own capture (court-doctypes R2's `ecourt_roa`) never matches a fetch. Checked at the module's interface: through `acquire` (fixture.mjs `run`)
   and the exported `profileOf`, over a probe content type that reports the origin it was handed and a member-only type
   that matches as court-doctypes R2 does (`ctx.origin` `"member"`, else refused with its why). Both are test-local,
   registered through docprofile's `registerDoctype`; this file is its own test process. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, run, sha } from "./fixture.mjs";
import { profileOf } from "../../../src/acquisition/index.mjs";
import { registerDoctype } from "../../../../docprofile/registry.mjs";

const MARK = "ORIGIN-PROBE-7f3a";
const seen = [];
registerDoctype({
  key: "origin_probe", label: "an origin probe", version: 1, contract: null,
  detect(ctx) {
    if (!String((ctx && ctx.text) || "").includes(MARK)) return { match: false, confidence: "none", signals: [] };
    seen.push(Object.prototype.hasOwnProperty.call(ctx, "origin") ? ctx.origin : "<absent>");
    return { match: true, confidence: "certain", signals: [`origin ${JSON.stringify(ctx.origin ?? null)}`] };
  },
});
const MEMBER_ONLY = "an account-gated register is read only from a member's own capture";
registerDoctype({
  key: "member_only_register", label: "a member-only register", version: 1, contract: null,
  detect(ctx) {
    if (!/Register of Actions/.test(String((ctx && ctx.text) || ""))) return { match: false, confidence: "none", signals: [] };
    if (ctx.origin !== "member") return { match: false, confidence: "none", signals: ["a register of actions"], why: MEMBER_ONLY };
    return { match: true, confidence: "certain", signals: ["a register of actions", "a member's own capture"] };
  },
});

const html = (body) => `<!doctype html><html><head><title>t</title></head><body>${body}</body></html>`;
const served = (body) => () => new Response(body, { headers: { "content-type": "text/html; charset=utf-8" } });
const PROBE_AT = "https://records.example/probe";

test("R17 (N615): every acquire hands doctypeFor the origin \"fetch\", a member session's request included, whatever R16's actor_class", async () => {
  const cases = [
    [{ cls: "member", member: true, sessMember: "m1" }, "member"],
    [{ cls: "probe", member: false, sessMember: null }, "session"],
    [{ cls: "admin", member: false, sessMember: null }, "daemon"],
  ];
  for (const [opts, actorClass] of cases) {
    seen.length = 0;
    const r = await run(world(), { [PROBE_AT]: served(html(`<p>${MARK}</p>`)) }, { locator: PROBE_AT }, opts);
    assert.equal(r.status, 200, JSON.stringify(opts));
    const d = r.body.document;
    assert.equal(d.capture.actor_class, actorClass);
    assert.equal(d.profile.content_type, "origin_probe");
    assert.ok(seen.length >= 1 && seen.every((o) => o === "fetch"), `${JSON.stringify(opts)} → ${JSON.stringify(seen)}`);
    assert.deepEqual(d.profile.content_type_signals, ['origin "fetch"']);
  }
});

test("R17 (N615): the capture-request arm's daemon capture is a fetch, never a member's own capture", async () => {
  seen.length = 0;
  const r = await run(world(), { [PROBE_AT]: served(html(`<p>${MARK}</p>`)) }, {},
    { cls: "daemon", member: false, sessMember: null,
      captureRequest: { locator: PROBE_AT, purpose: "investigate", agent: null, render: false } });
  assert.equal(r.status, 200);
  assert.equal(r.body.document.capture.actor_class, "daemon");
  assert.ok(seen.length >= 1 && seen.every((o) => o === "fetch"), JSON.stringify(seen));
});

test("R17 (N615): profileOf hands doctypeFor the origin it is given, and states none when it is given none", async () => {
  const bytes = Buffer.from(html(`<p>${MARK}</p>`));
  const ev = { get: async (k) => (k === sha(bytes) ? new Response(bytes) : null) };
  const at = "2026-10-06T12:00:00Z";
  for (const [origin, want] of [["member", "member"], ["fetch", "fetch"], [undefined, "<absent>"], [null, "<absent>"]]) {
    seen.length = 0;
    const p = await profileOf({ ev, sha: sha(bytes), ct: "text/html", total: bytes.length, locator: PROBE_AT, retrieved: at,
                                ...(origin !== undefined ? { origin } : {}) });
    assert.equal(p.content_type, "origin_probe");
    assert.ok(seen.length >= 1 && seen.every((o) => o === want), `${origin} → ${JSON.stringify(seen)}`);
  }
});

const ROA_AT = "https://court.example/case/MC-24-0123";
const ROA = html("<h2>Register of Actions</h2><table><tr><th>Date</th><th>Description</th></tr>"
  + "<tr><td>01/05/2024</td><td>Complaint filed</td></tr></table>");

test("R17 (N615): a type read only from a member's own capture never matches an acquire, a member session's included, and matches the same bytes profiled as member-supplied", async () => {
  for (const opts of [{ cls: "member", member: true, sessMember: "m1" }, { cls: "probe", member: false, sessMember: null },
                      { cls: "admin", member: false, sessMember: null }]) {
    const r = await run(world(), { [ROA_AT]: served(ROA) }, { locator: ROA_AT }, opts);
    assert.equal(r.status, 200);
    assert.notEqual(r.body.document.profile.content_type, "member_only_register", JSON.stringify(opts));
  }
  const bytes = Buffer.from(ROA);
  const ev = { get: async (k) => (k === sha(bytes) ? new Response(bytes) : null) };
  const supplied = await profileOf({ ev, sha: sha(bytes), ct: "text/html", total: bytes.length, locator: ROA_AT,
                                     retrieved: "2026-10-06T12:00:00Z", origin: "member" });
  assert.equal(supplied.content_type, "member_only_register");
  assert.deepEqual(supplied.content_type_signals, ["a register of actions", "a member's own capture"]);
});
