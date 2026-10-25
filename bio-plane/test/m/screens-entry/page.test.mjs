/* screens-entry R1, R5–R9, R11 on the served page: `interface-shell`'s `interfacePage(SCREENS)` booted by its harness,
   for what only the page shows: the public and setup frames send no Authorization header and draw no rail, tabs or
   dock; the fragment leaves the address before any request; no secret reaches the browser's storage; a sign-in hands
   the session record over. */
import test from "node:test";
import assert from "node:assert/strict";
import { interfacePage, interfaceScriptHash } from "../../../src/interface-shell/index.mjs";
import { boot, STORE_KEY } from "../interface-shell/harness.mjs";
import { SCREENS } from "../../../src/screens-entry/index.mjs";
import { team, viaDoor } from "./kit.mjs";

/* The plane behind the served page is the real store (store-request's `storeWorld()`): `world.boot(null)` is the door a page with no
   session talks to, answering every op the page asks as the real door does (interface-shell R129). */
const planeOf = async () => { const { world } = await team({ name: "River Town", description: null, logo: false }); return { world, ...world.boot(null) }; };
const main = (p) => p.doc.getElementById("cs-main");
const storage = (p) => JSON.stringify([...p.local.entries(), ...p.store.entries()]);

test("R9 interfacePage composes the six screens (interface-shell R1, R2, R21, R38)", () => {
  /* one external script element loading the shell's versioned script, its integrity the hash of that script, no inline script */
  const page = interfacePage(SCREENS);
  const scripts = [...page.matchAll(/<script\b[^>]*>/gi)].map((m) => m[0]);
  assert.equal(scripts.length, 1, "one script element");
  assert.match(scripts[0], /^<script src="\/app\/shell-[^"]+\.js" integrity="sha256-[A-Za-z0-9+/=]+">$/);
  assert.ok(page.includes(`integrity="${interfaceScriptHash(SCREENS)}"`), "integrity is the hash of the shell's script");
});

test("R9 R11 each screen is served at its address with no session record: no Authorization header, no whoami, no rail, tabs or dock", async () => {
  const { door } = await planeOf();
  for (const [path, hash] of [["/", ""], ["/app/front", ""], ["/app/tour", ""], ["/app/tour/5", ""], ["/app/forgot", ""], ["/app/reset", "#reset=rl-1"], ["/app/setup", "#boot=otp-1"], ["/app/join", "#invite=inv-1"]]) {
    const p = await boot({ screens: SCREENS, door, session: null, path, hash });
    await p.settle(80);
    const m = main(p);
    assert.ok(m && m.querySelector("h1"), path + " drawn");
    assert.ok(p.requests.every((r) => !r.headers.Authorization), path + " sent a header");
    assert.ok(!p.requests.some((r) => r.op === "whoami"), path + " asked whoami");
    for (const sel of [".cs-rail", ".cs-tabs", ".cs-dock"]) assert.equal(p.doc.querySelectorAll(sel).length, 0, path + " " + sel);
    assert.deepEqual(p.assigned, [], path + " forwarded away");
  }
});

test("R3 tour walked on the page: no request but the shell's own bootstrap", async () => {
  const { door } = await planeOf();
  const p = await boot({ screens: SCREENS, door, session: null, path: "/app/tour" });
  await p.settle(80);
  for (let n = 2; n <= 6; n++) { await p.click(main(p).querySelector(`a[href="/app/tour/${n}"]`)); }
  assert.deepEqual(p.requests.map((r) => r.op).filter((op) => op !== "bootstrap"), []);
  // nothing stored, by the screen or the shell (interface-shell R33 stores nothing without a session; K3156)
  assert.deepEqual([...p.local.keys(), ...p.store.keys()], []);
});

test("R5 R8 the reset link: gone from the address before any request, only in passwordresetlook's body, never stored", async () => {
  const LINK = "rl-sentinel-page-9";
  const { door } = await planeOf();
  const p = await boot({ screens: SCREENS, door, session: null, path: "/app/reset", hash: "#reset=" + LINK });
  await p.settle(80);
  assert.equal(p.location.hash, "");
  for (const r of p.requests) {
    assert.ok(!r.url.includes(LINK));
    assert.equal(JSON.stringify(r.body || "").includes(LINK), r.op === "passwordresetlook", r.op);
  }
  assert.ok(!storage(p).includes(LINK));
  assert.ok(!main(p).innerHTML.includes(LINK));
});

test("R6 R7 R8 the one-time password and the invitation: gone from the address, in no request's address, never stored", async () => {
  const { door } = await planeOf();
  for (const [path, hash, secret] of [["/app/setup", "#boot=otp-sentinel-3", "otp-sentinel-3"], ["/app/join", "#invite=inv-sentinel-3", "inv-sentinel-3"]]) {
    const p = await boot({ screens: SCREENS, door, session: null, path, hash });
    await p.settle(80);
    assert.equal(p.location.hash, "", path);
    assert.ok(p.requests.every((r) => !r.url.includes(secret)), path);
    assert.ok(!storage(p).includes(secret), path);
  }
});

test("R2 R8 signing in on the page: login's body only, the record handed to the shell, the password in no storage or other request", async () => {
  const { world, door } = await planeOf();
  const mai = await world.signIn("mai");
  const PW = mai.password;
  const p = await boot({ screens: SCREENS, door, session: null, path: "/app/front" });
  await p.settle(80);
  p.doc.getElementById("fs-handle").value = "mai";
  p.doc.getElementById("fs-pw").value = PW;
  await p.click(main(p).querySelector('button[data-act="login"]'));
  await p.settle(80);
  const login = p.requests.filter((r) => r.op === "login");
  assert.deepEqual(login.map((r) => [r.body, r.headers.Authorization]), [[{ handle: "mai", password: PW, device: "own" }, undefined]]);
  const kept = JSON.parse(p.local.get(STORE_KEY)).t;
  assert.equal((await viaDoor(world, "whoami", {}, kept)).json.result.member, "mai", "the session the real login issued");
  assert.ok(!storage(p).includes(PW));
  assert.ok(p.requests.filter((r) => r.op !== "login").every((r) => !JSON.stringify(r.body || "").includes(PW) && !r.url.includes(PW)));
  // control: a refused sign-in writes no record
  const q = await boot({ screens: SCREENS, door, session: null, path: "/app/front" });
  await q.settle(80);
  q.doc.getElementById("fs-handle").value = "mai";
  q.doc.getElementById("fs-pw").value = "a password that is not hers";
  await q.click(main(q).querySelector('button[data-act="login"]'));
  await q.settle(80);
  assert.equal(q.local.get(STORE_KEY) ?? null, null);
  assert.ok(!storage(q).includes("a password that is not hers"));
});
