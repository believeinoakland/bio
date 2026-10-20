/* screens-intake R47 (T51 fix round; DEC-381 C20): "A source that asked for a login" on the capture screen. Each act sends the
 * fields its owner declares (the shell's guard accepts them); a secret is sent once and never drawn back. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { open as openPage, text, html, main, btn, fill, press, ok, refused, word, says, saysIn, DOCUMENT_STUB } from "./page.mjs";
import { SCREENS } from "../../../src/screens-intake/index.mjs";

const NOT_HELD = ok({ ok: true, held: false, copy: null, versions: 0, truncated: false, changed: { state: "undetermined", basis: "x", as_of: null, earlier_differs: false } });
const REQUESTS = ok({ ok: true, requests: [
  { request: "CR-1", host: "records.example-city.gov", address: "https://records.example-city.gov/a", state: "refused", source_reason: "login", requested_at: "2026-10-15T10:00:00Z", principal_plane: "member:mai" },
  { request: "CR-2", host: "paid.example.org", address: "https://paid.example.org/b", state: "refused", source_reason: "paywall", requested_at: "2026-10-15T10:00:00Z", principal_plane: "member:mai" },
  { request: "CR-3", host: "fine.example.org", address: "https://fine.example.org/c", state: "captured", source_reason: null, requested_at: "2026-10-15T10:00:00Z", principal_plane: "member:mai" }] });
const MEMBERS = ok({ members: [{ member_id: "rosa", handle: "Rosa-h", role: "member", status: "active" }, { member_id: "mai", handle: "Mai-h", role: "member", status: "active" }] });
const LOGIN = { credential: "CRED-1", kind: "login", host: "records.example-city.gov", scope: "group", project: null, supplied_by: "member:rosa", supplied_at: "2026-10-16T09:00:00Z", withdrawn_at: null, withdrawn_by: null };
const open = (o = {}) => openPage("/app/capture/address", { ...o, screens: [...SCREENS, DOCUMENT_STUB],
  plane: { heldat: NOT_HELD, memberlist: MEMBERS, capturerequests: REQUESTS, ...(o.plane || {}) } });
const SECRET = "p4ss-w0rd-X";

test("R47 a request turned away for a login is drawn with the login form; only a login-refused request, and only a refused one, offers it and the retry", async () => {
  const p = await open();
  assert.ok(says(p, "screen.capture.cred.head"));
  assert.ok(text(p).includes(word("screen.capture.cred.turned", { source: "records.example-city.gov" })));
  assert.equal(main(p).querySelectorAll('button[data-act="capturecredentialsupply"]').length, 1, "one row asked for a login");
  assert.equal(main(p).querySelectorAll('button[data-act="capturerequestretry"]').length, 1, "the retry only on that refused request");
  assert.ok(!text(p).includes("paid.example.org") && !text(p).includes("fine.example.org"), "control: a paywall refusal and an accepted request are not offered a login or a retry");
  assert.equal(p.doc.getElementById("cc-secret").getAttribute("type"), "password");
  assert.ok(says(p, "screen.capture.cred.sealed1") && says(p, "screen.capture.cred.sealed2"));
});

test("R47 giving a login sends the fields the owner declares once, then the request is tried again; the secret is never drawn or sent elsewhere", async () => {
  const p = await open({ plane: { capturecredentialsupply: ok({ ok: true, credential: "CRED-1" }), capturerequestretry: ok({ ok: true }), capturecredentiallist: ok({ ok: true, entries: [LOGIN] }) } });
  fill(p, { "cc-user": "mai", "cc-secret": SECRET });
  await press(p, "capturecredentialsupply", { reason: "The team needs this source." });
  const sent = p.byOp("capturecredentialsupply");
  assert.equal(sent.length, 1);
  const { reason, ...body } = sent[0].body;
  assert.deepEqual(body, { kind: "login", host: "records.example-city.gov", secret: `mai:${SECRET}`, scope: "group" });
  assert.deepEqual(p.byOp("capturerequestretry").map((r) => r.body), [{ request: "CR-1" }]);
  assert.ok(!html(p).includes(SECRET), "the secret is not drawn back");
  for (const r of p.requests) if (r.op !== "capturecredentialsupply") assert.ok(!JSON.stringify(r).includes(SECRET), `${r.op} carries no secret`);
});

test("R47 empty username or secret sends nothing and says which field is needed", async () => {
  const p = await open({ plane: { capturecredentialsupply: ok({ ok: true }) } });
  fill(p, { "cc-user": "", "cc-secret": SECRET });
  const r = await press(p, "capturecredentialsupply", { reason: "r" });
  assert.ok(saysIn(r.slot(), "capture.fieldneeded", { field: word("screen.capture.cred.user") }));
  fill(p, { "cc-user": "mai", "cc-secret": "" });
  const s = await press(p, "capturecredentialsupply", { reason: "r" });
  assert.ok(saysIn(s.slot(), "capture.fieldneeded", { field: word("screen.capture.cred.secret") }));
  assert.equal(p.byOp("capturecredentialsupply").length, 0);
});

test("R47 the retry by itself sends the request and nothing else", async () => {
  const p = await open({ plane: { capturerequestretry: ok({ ok: true }) } });
  await press(p, "capturerequestretry");
  assert.deepEqual(p.byOp("capturerequestretry").map((r) => r.body), [{ request: "CR-1" }]);
  assert.equal(p.byOp("capturecredentialsupply").length, 0);
});

test("R47 the stored logins are listed by source and who gave each; no secret, length or digest; a login is withdrawn and the list read again", async () => {
  let entries = [LOGIN];
  const p = await open({ plane: { capturecredentiallist: () => ok({ ok: true, entries, limit: 200, truncated: false }), capturecredentialwithdraw: () => { entries = []; return ok({ ok: true }); } } });
  assert.ok(!text(p).includes(word("screen.capture.cred.notshown")), "nothing stored is drawn before the list is asked");
  await press(p, "capturecredentiallist");
  assert.ok(text(p).includes(word("screen.capture.cred.stored", { source: "records.example-city.gov" })));
  assert.ok(says(p, "screen.capture.cred.notshown"));
  assert.ok(text(p).includes("Rosa-h"), "who gave it, by handle");
  assert.ok(says(p, "screen.capture.cred.listnote1") && says(p, "screen.capture.cred.listnote2"));
  assert.ok(!/secret|digest/i.test(JSON.stringify(entries)) , "the fixture itself carries none");
  await press(p, "capturecredentialwithdraw", { reason: "No longer needed." });
  assert.deepEqual(p.byOp("capturecredentialwithdraw").map((r) => r.body.credential), ["CRED-1"]);
  assert.ok(!says(p, "screen.capture.cred.notshown"), "the withdrawn login is gone from the list");
});

test("R47 each refusal is drawn by its words: a machine, the team's own Civicsmith, a request its source did not turn away", async () => {
  for (const [code, keys] of [["CAPTURE_CREDENTIAL_NOT_A_MEMBER", ["screen.capture.cred.ref.machine1", "screen.capture.cred.ref.machine2"]],
                              ["CAPTURE_CREDENTIAL_OWN_HOST", ["screen.capture.cred.ref.own1", "screen.capture.cred.ref.own2"]]]) {
    const p = await open({ plane: { capturecredentialsupply: refused(code, "builder detail") } });
    fill(p, { "cc-user": "mai", "cc-secret": SECRET });
    const r = await press(p, "capturecredentialsupply", { reason: "r" });
    for (const k of keys) assert.ok(saysIn(r.slot(), k), `${code}: ${k}`);
    assert.ok(!r.slot().textContent.includes("builder detail"));
  }
  const q = await open({ plane: { capturerequestretry: refused("CAPTURE_REQUEST_NOT_RETRYABLE", "builder detail") } });
  const r = await press(q, "capturerequestretry");
  assert.ok(saysIn(r.slot(), "screen.capture.cred.ref.notretry"));
});
