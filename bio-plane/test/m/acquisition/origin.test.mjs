/* acquisition R17 with N615 (K1683): intake's `doctypeFor` is handed the capture's origin, `"member"` exactly when the
   capture's `actor_class` is `member` and `"fetch"` otherwise, so a content type read only from a member's own capture
   (court-doctypes R2's `ecourt_roa`) can tell. Checked at the module's interface: through `acquire` (fixture.mjs `run`)
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

test("R17 (N615): a member session's capture hands doctypeFor the origin \"member\", every other caller's \"fetch\", matching R16's actor_class", async () => {
  const cases = [
    [{ cls: "member", member: true, sessMember: "m1" }, "member", "member"],
    [{ cls: "probe", member: false, sessMember: null }, "fetch", "session"],
    [{ cls: "admin", member: false, sessMember: null }, "fetch", "daemon"],
  ];
  for (const [opts, origin, actorClass] of cases) {
    seen.length = 0;
    const r = await run(world(), { [PROBE_AT]: served(html(`<p>${MARK}</p>`)) }, { locator: PROBE_AT }, opts);
    assert.equal(r.status, 200, JSON.stringify(opts));
    const d = r.body.document;
    assert.equal(d.capture.actor_class, actorClass);
    assert.equal(d.profile.content_type, "origin_probe");
    assert.ok(seen.length >= 1 && seen.every((o) => o === origin), `${JSON.stringify(opts)} → ${JSON.stringify(seen)}`);
    assert.deepEqual(d.profile.content_type_signals, [`origin ${JSON.stringify(origin)}`]);
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

test("R17 (N615): a type read only from a member's own capture matches a member session's capture and not a fetch of the same bytes", async () => {
  const profiled = async (opts) => {
    const r = await run(world(), { [ROA_AT]: served(ROA) }, { locator: ROA_AT }, opts);
    assert.equal(r.status, 200);
    return r.body.document.profile;
  };
  const mine = await profiled({ cls: "member", member: true, sessMember: "m1" });
  assert.equal(mine.content_type, "member_only_register");
  assert.deepEqual(mine.content_type_signals, ["a register of actions", "a member's own capture"]);
  for (const opts of [{ cls: "probe", member: false, sessMember: null }, { cls: "admin", member: false, sessMember: null }]) {
    const fetched = await profiled(opts);
    assert.notEqual(fetched.content_type, "member_only_register", JSON.stringify(opts));
  }
});
