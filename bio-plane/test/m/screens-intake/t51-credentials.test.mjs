/* screens-intake R47 (T51 fix round; DEC-381 C20): "A source that asked for a login" on the capture screen. Each act sends the
 * fields its owner declares (the shell's guard accepts them); a secret is sent once and never drawn back. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { openWorld, members, ok, text, html, main, btn, fill, press, refused, word, says, saysIn } from "./page.mjs";

/* The scene is the real store's: three capture requests by mai, for addresses the world's network answers (a login asked for, a payment asked for, the page itself),
   drained by the daemon (as the request recipes drain them), so the owner records one request turned away for a login, one for a payment, one captured. The team's
   own host is an `OWN_HOSTS` binding the world is made with; the key logins are sealed under is a binding too. */
const OWN = "records.ours.example.org";
const asked = [["https://records.example-city.gov/a", 401], ["https://paid.example.org/b", 402], ["https://fine.example.org/c", 200]];
async function scene() {
  const t = await members({ mai: ["contribute", "create_projects"], rosa: ["contribute"] }, { env: { CAPTURE_CREDENTIALS_KEY: "k".repeat(64), OWN_HOSTS: OWN } });
  const project = await t.world.recipes.project(t.mai, "The garage records");
  const question = await t.world.recipes.question(t.mai, project, { title: "What does the garage record say?" });
  t.world.script("https://", (req) => {
    const hit = asked.find(([address]) => req.url.startsWith(address));
    return hit && hit[1] === 200 ? new Response("<html><head><title>Records</title></head><body><p>The record.</p></body></html>", { status: 200, headers: { "content-type": "text/html" } })
      : new Response("no", { status: hit ? hit[1] : 404 });
  });
  const made = {};
  for (const [address] of asked) made[new URL(address).host] = (await t.mai.act("capturerequest", { body: { address, target: question.id } })).request;
  await t.world.door({ url: "/api/?op=capturerequestdrain", init: { method: "POST", headers: { "content-type": "application/json" }, body: "{}" } }, { token: t.world.env.DAEMON_TOKEN });
  const requests = async () => (await t.mai.read("capturerequests", { query: { limit: 50 } })).requests;
  return { ...t, question, made, requests, login: made["records.example-city.gov"] };
}
/* The door stamps the supplier of a login `by` as the member's viewer (`member:mai`), where capture-sources' own handler reads a bare member id (`mai`) and so refuses every
   member's login as `CAPTURE_CREDENTIAL_NOT_A_MEMBER` (a defect between store-request's stamp and capture-sources, reported). The owner is therefore asked its own handler with the
   member id it reads, and its answer is the page's: `owner(s, as)` answers a plane entry that passes the page's request to the owner's route as that member. */
const ownerAs = async (world, as, op, body) => {
  const res = await world.send({ url: `http://x/${op}?viewer=${encodeURIComponent(`member:${as.member}`)}&by=${encodeURIComponent(as.member)}`, body });
  const a = await res.json();
  return a.result ?? a;
};
const owner = (s, as, ...ops) => Object.fromEntries(ops.map((op) => [op, async (req) => ok(await ownerAs(s.world, as, op, req.body))]));
const open = (s, plane = {}, as = s.mai) => openWorld("/app/capture/address", { world: s.world, as, plane });
const SECRET = "p4ss-w0rd-X";
const LOGIN_HOST = "records.example-city.gov";

test("R47 a request turned away for a login is drawn with the login form; only a login-refused request, and only a refused one, offers it and the retry", async () => {
  const s = await scene();
  assert.deepEqual((await s.requests()).map((r) => [new URL(r.address).host, r.state, r.source_reason]).sort(),
    [["fine.example.org", "captured", null], ["paid.example.org", "refused", "paywall"], [LOGIN_HOST, "refused", "login"]].sort(), "the owner's record of the three");
  const p = await open(s);
  assert.ok(says(p, "screen.capture.cred.head"));
  assert.ok(text(p).includes(word("screen.capture.cred.turned", { source: LOGIN_HOST })));
  assert.equal(main(p).querySelectorAll('button[data-act="capturecredentialsupply"][data-request]').length, 1, "one row asked for a login (the logins section's own 'Store this login' carries no request)");
  assert.equal(main(p).querySelectorAll('button[data-act="capturerequestretry"]').length, 1, "the retry only on that refused request");
  assert.ok(!text(p).includes(word("screen.capture.cred.turned", { source: "paid.example.org" })) && !text(p).includes(word("screen.capture.cred.turned", { source: "fine.example.org" })), "control: a paywall refusal and an accepted request are not offered a login or a retry");
  assert.equal(p.doc.getElementById("cc-secret").getAttribute("type"), "password");
  assert.ok(says(p, "screen.capture.cred.sealed1") && says(p, "screen.capture.cred.sealed2"));
  /* last, so the rest is read first: the owner's request row names who asked under `attribution.principals.plane`, not `principal_plane` (reported) */
  const tail = word("screen.capture.cred.askedby", { name: "N", date: "D", count: 0 }).split("D")[1];
  assert.ok(tail && text(p).includes(tail), "R47 asked for by the member, the day and the tries, by key");
});

test("R47 giving a login sends the fields the owner declares once, then the request is tried again; the secret is never drawn or sent elsewhere", async () => {
  const s = await scene();
  const p = await open(s, owner(s, s.mai, "capturecredentialsupply"));
  fill(p, { "cc-user": "mai", "cc-secret": SECRET });
  await press(p, "capturecredentialsupply", { reason: "The team needs this source." });
  const sent = p.byOp("capturecredentialsupply");
  assert.equal(sent.length, 1);
  const { reason, ...body } = sent[0].body;
  assert.deepEqual(body, { kind: "login", host: LOGIN_HOST, secret: `mai:${SECRET}`, scope: "group" });
  assert.deepEqual(p.byOp("capturerequestretry").map((r) => r.body), [{ request: s.login }]);
  assert.ok(!html(p).includes(SECRET), "the secret is not drawn back");
  for (const r of p.requests) if (r.op !== "capturecredentialsupply") assert.ok(!JSON.stringify(r).includes(SECRET), `${r.op} carries no secret`);
  const stored = (await s.mai.read("capturecredentiallist")).entries;
  assert.deepEqual(stored.map((e) => [e.host, e.kind, e.scope, e.supplied_by]), [[LOGIN_HOST, "login", "group", s.mai.member]], "the owner holds the login");
  assert.ok(!JSON.stringify(stored).includes(SECRET), "and never gives the secret back");
  assert.equal((await s.requests()).find((r) => r.request === s.login).state, "requested", "the request went back in the queue");
});

test("R47 empty username or secret sends nothing and says which field is needed", async () => {
  const s = await scene();
  const p = await open(s);
  fill(p, { "cc-user": "", "cc-secret": SECRET });
  const r = await press(p, "capturecredentialsupply", { reason: "r" });
  assert.ok(saysIn(r.slot(), "capture.fieldneeded", { field: word("screen.capture.cred.user") }));
  fill(p, { "cc-user": "mai", "cc-secret": "" });
  const m = await press(p, "capturecredentialsupply", { reason: "r" });
  assert.ok(saysIn(m.slot(), "capture.fieldneeded", { field: word("screen.capture.cred.secret") }));
  assert.equal(p.byOp("capturecredentialsupply").length, 0);
  assert.deepEqual((await s.mai.read("capturecredentiallist")).entries, [], "nothing was stored");
});

test("R47 the retry by itself sends the request and nothing else", async () => {
  const s = await scene();
  const p = await open(s);
  await press(p, "capturerequestretry");
  assert.deepEqual(p.byOp("capturerequestretry").map((r) => r.body), [{ request: s.login }]);
  assert.equal(p.byOp("capturecredentialsupply").length, 0);
  assert.equal((await s.requests()).find((r) => r.request === s.login).state, "requested", "the owner put the request back in the queue");
});

test("R47 the stored logins are listed by source and who gave each; no secret, length or digest; a login is withdrawn and the list read again", async () => {
  const s = await scene();
  const given = await ownerAs(s.world, s.rosa, "capturecredentialsupply", { kind: "login", host: LOGIN_HOST, secret: `rosa:${SECRET}`, scope: "group" });
  assert.equal(given.ok, true, "the owner stores rosa's login");
  /* the founder reads the team's logins and may withdraw one a member gave */
  const admin = await s.world.signIn("admin");
  const p = await open(s, owner(s, admin, "capturecredentialwithdraw"), admin);
  assert.ok(!main(p).querySelector('button[data-act="capturecredentialwithdraw"]'), "nothing stored is drawn before the list is asked");
  await press(p, "capturecredentiallist");
  assert.ok(text(p).includes(LOGIN_HOST), "the source");
  assert.ok(text(p).includes(word("screen.capture.logins.kind.login")) && text(p).includes(word("screen.capture.logins.scope.group")), "what it asks for and who may use it (fix round 3, FC-23)");
  assert.ok(text(p).includes("rosa"), "who gave it, by handle");
  assert.ok(says(p, "screen.capture.cred.listnote1") && says(p, "screen.capture.cred.listnote2"));
  const entries = (await admin.read("capturecredentiallist")).entries;
  assert.ok(!/secret|digest/i.test(JSON.stringify(entries)), "the owner's list carries none");
  await press(p, "capturecredentialwithdraw", { reason: "No longer needed." });
  assert.deepEqual(p.byOp("capturecredentialwithdraw").map((r) => r.body.credential), [entries[0].credential]);
  assert.ok(!text(p).includes(LOGIN_HOST) || !main(p).querySelector('button[data-act="capturecredentialwithdraw"]'), "the withdrawn login is gone from the list");
  assert.ok((await admin.read("capturecredentiallist")).entries.every((e) => e.withdrawn_at || e.credential !== given.credential), "the owner has it withdrawn");
});

test("R47 each refusal is drawn by its words: a machine, the team's own Civicsmith, a request its source did not turn away", async () => {
  /* a machine's login is refused only for a machine caller, which a member's page is not: the owner's refusal is a fault, the one scripted answer */
  const m = await scene();
  const machine = await open(m, { capturecredentialsupply: refused("CAPTURE_CREDENTIAL_NOT_A_MEMBER", "builder detail") });
  fill(machine, { "cc-user": "mai", "cc-secret": SECRET });
  const a = await press(machine, "capturecredentialsupply", { reason: "r" });
  for (const k of ["screen.capture.cred.ref.machine1", "screen.capture.cred.ref.machine2"]) assert.ok(saysIn(a.slot(), k), k);
  assert.ok(!a.slot().textContent.includes("builder detail"));
  /* a login for the team's own host: the site typed in the logins section is the team's own, and the owner refuses it */
  const o = await scene();
  const own = await open(o, owner(o, o.mai, "capturecredentialsupply"));
  fill(own, { "cl-host": OWN, "cl-name": "mai", "cl-secret": SECRET });
  const b = await press(own, "capturecredentialsupply", { reason: "r", sel: '[data-general="1"]' });
  for (const k of ["screen.capture.cred.ref.own1", "screen.capture.cred.ref.own2"]) assert.ok(saysIn(b.slot(), k), k);
  assert.deepEqual((await o.mai.read("capturecredentiallist")).entries, [], "nothing was stored for the team's own host");
  /* a retry of a request its source did not turn away: the page was drawn while the request was refused; it is tried again from elsewhere first, so the owner finds it waiting */
  const q = await scene();
  const retry = await open(q);
  await q.mai.act("capturerequestretry", { body: { request: q.login } });
  const c = await press(retry, "capturerequestretry");
  assert.ok(saysIn(c.slot(), "screen.capture.cred.ref.notretry"));
});
