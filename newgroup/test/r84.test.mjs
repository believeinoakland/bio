/* R84 (fix round 9, K4937; G144-G150): the account made ready before anything is created. Each condition is driven through the
 * installer's own routes (`fresh`, the real entry path) against the stateful fake account of `fixture.mjs`, with Cloudflare's
 * answer shapes as documented (each "documented shape; BOB measures on the rehearsal account, K4942"; matched on codes). Each stops
 * before any write, says so in one sentence, and offers "Check again" (or, for a choice, the choice); controls: a ready account
 * passes all, a refusal of another kind is told as itself. A sentence is never held here (K3810): the tests compare drawn
 * sentences with one another and with the fixture's own words (Cloudflare's), never with a copy of English. */
import { test, after } from "node:test";
import assert from "node:assert/strict";
import { CFG } from "../src/index.mjs";
import { word } from "../src/words.mjs";
import { CONTAINERS_CODES, WORKER_SIZE_LIMIT } from "../src/ready.mjs";
import { run, begin, release, armWith, restoreSigners, SIGNER, bump, CAPABLE_SRC, MEMBER_SRC } from "./fixture.mjs";
import { RELEASE_VERSION } from "../src/release.mjs";

after(restoreSigners);
const NEXT = bump(RELEASE_VERSION);
/* What the run wrote to the account: everything but the sign-in exchange and the plan probe the plan check itself makes (and deletes). */
const writes = (w) => w.calls.filter((c) => c.method !== "GET" && c.u !== CFG.TOKEN && !/bio-plan-probe/.test(c.u)).map((c) => `${c.method} ${c.u.replace(CFG.API, "")}`);
const nothingCreated = (w, why, before = []) => {
  assert.deepEqual(writes(w), [], `${why}: before any write`);
  assert.deepEqual([...w.buckets], [], `${why}: no bucket`);
  assert.deepEqual([...w.acct.keys()].filter((k) => k !== "bio-plan-probe" && !before.includes(k)), [], `${why}: no script`);
  assert.ok(!w.page.steps.includes("install") && !w.page.steps.includes("r2"), `${why}: no creating step began`);
};
/* The "Check again" the stop offers begins the run again through /begin with the choices kept. */
const checkAgain = async (w, slug, why) => {
  assert.ok(w.page.retry && w.page.retry.label.length > 0, `${why}: it offers Check again`);
  assert.equal(w.page.retry.body.slug, slug, why);
  const { slug: s, mode, ...rest } = w.page.retry.body;
  assert.equal((await begin(s, mode, rest)).j.ok, true, `${why}: /begin takes it`);
};

test("R84 (1) storage: R2's entitlement is read without writing; refused as not entitled it stops before any write with the checkout walk-through and Check again, never blaming a payment method; any other refusal is told as itself; after the fixture changes it passes", async () => {
  const off = await run({ slug: "st-off", storage: "off" });
  assert.equal(off.page.status("ready"), "no");
  nothingCreated(off, "not entitled");
  assert.ok(off.page.failed.said.length > 0 && off.page.failed.d.length > 0, "the cause and the way on");
  assert.equal(/payment/i.test(off.page.failed.said + off.page.failed.d), false, "never told as a payment method");
  assert.ok(/R2/.test(off.page.failed.said + off.page.failed.d) && /checkout/i.test(off.page.failed.d), "the checkout walk-through");
  await checkAgain(off, "st-off", "not entitled");
  assert.ok(off.calls.some((c) => c.method === "GET" && c.u.endsWith("/r2/buckets")), "read, not written");
  /* After the founder has done it, the same run passes. */
  const on = await run({ slug: "st-off", storage: "ok" });
  assert.equal(on.page.status("room"), "ok");
  assert.ok(on.page.done, "the install finishes");
  /* Controls: a refusal of another kind is told as itself (Cloudflare's own words), not as the checkout; a 500 is waited out and is
     the lasting failure; a permission refusal asks to approve again. */
  const other = await run({ slug: "st-other", storage: "other" });
  assert.ok(other.page.failed.said.includes("The request could not be understood by R2"));
  assert.notEqual(other.page.failed.said, off.page.failed.said);
  assert.equal(/checkout/i.test(other.page.failed.d), false, "not told as the checkout");
  nothingCreated(other, "other refusal");
  await checkAgain(other, "st-other", "other refusal");
  const down = await run({ slug: "st-down", storage: "error" });
  assert.equal(down.page.failed.said, word("screen.install.stopped.lasting"), "a 500 is the lasting failure, never the checkout");
  nothingCreated(down, "500");
  const perm = await run({ slug: "st-perm", storage: "permission" });
  assert.ok(perm.page.done.includes("data-begin"), "approve again");
  nothingCreated(perm, "permission");
});

test("R84 (2) Containers: decided by Cloudflare's answer code, never its words: the plan code shows the plan's stop, a permission code asks to approve again, any other answer is could-not-tell, stated with Cloudflare's words and never read as on; a list that answers passes", async () => {
  /* The same words under a different code are a different answer: the decision is the code's. */
  assert.ok(CONTAINERS_CODES.plan.length > 0 && CONTAINERS_CODES.permission.length > 0);
  const plan = await run({ slug: "ct-plan", containersOff: true });
  assert.equal(plan.page.failed.said, word("screen.install.stopped.plan") + " " + word("installer.install.stopped.plan.why"));
  assert.equal(plan.page.retry.label, word("screen.install.stopped.plan.done"));
  nothingCreated(plan, "plan");
  const perm = await run({ slug: "ct-perm", containers: "read" });
  assert.equal(perm.page.status("room"), "no");
  assert.ok(perm.page.done.includes("data-begin"), "the page asks to approve again");
  assert.ok(perm.page.failed.said.length > 0);
  nothingCreated(perm, "permission");
  const odd = await run({ slug: "ct-odd", containersOdd: true });
  assert.ok(odd.page.failed.said.includes("Something unexpected happened with the request"), "Cloudflare's words, stated");
  await checkAgain(odd, "ct-odd", "could not tell");
  nothingCreated(odd, "could not tell");
  const ok = await run({ slug: "ct-ok" });
  assert.equal(ok.page.status("room"), "ok");
});

test("R84 (3) limits: Cloudflare's published ceilings of the plan (Workers 500, classes 500, buckets 1,000,000, cron triggers 250): 999 buckets pass, a Workers or cron count over its ceiling stops before any write naming the limit and offering Check again; controls: room passes", async () => {
  const buckets = await run({ slug: "lm-buckets", preBuckets: [...Array(999)].map((_, i) => `other-bucket-${i}`) });
  assert.equal(buckets.page.status("room"), "ok", "the old ceiling of 1000 is gone");
  const held = [...Array(499)].map((_, i) => `other-${i}`);
  const workers = await run({ slug: "lm-workers", pre: Object.fromEntries(held.map((k) => [k, []])) });
  assert.equal(workers.page.status("room"), "no");
  assert.ok(workers.page.failed.said.includes(word("installer.limit.workers.other", { n: 500 })));
  assert.equal(workers.page.failed.d, word("screen.install.stopped.limit.do"));
  nothingCreated(workers, "workers", held);
  await checkAgain(workers, "lm-workers", "workers");
  const crons = await run({ slug: "lm-crons", pre: { "other-job": [] }, crons: { "other-job": [...Array(249)].map((_, i) => `${i % 60} 4 * * *`) } });
  assert.equal(crons.page.status("room"), "no");
  assert.equal(crons.page.failed.d, word("screen.install.stopped.limit.do"));
  nothingCreated(crons, "crons", ["other-job"]);
  await checkAgain(crons, "lm-crons", "crons");
  const roomy = await run({ slug: "lm-roomy", pre: { "other-job": [] }, crons: { "other-job": [...Array(100)].map((_, i) => `${i % 60} 4 * * *`) } });
  assert.equal(roomy.page.status("room"), "ok", "a hundred scheduled jobs leave room");
});

test("R84 (4) the address: with no workers.dev prefix the founder is shown the proposed name, told it is permanent, may change it, and chooses it with a button; it is registered before any upload; a taken name asks for another; nothing is registered without the click", async () => {
  const ask = await run({ slug: "ad-ask", subdomain: null });
  assert.equal(ask.page.status("room"), "no");
  assert.match(ask.page.done, /id="address-name"[^>]*value="ad-ask"/, "the proposed name, editable");
  assert.match(ask.page.done, /data-sub-from="address-name"/, "chosen with a button");
  assert.ok(ask.page.done.includes("data-begin"), "the button begins the run again");
  assert.match(ask.page.done, /permanent/i);
  assert.equal(ask.prefix(), null, "nothing registered without the click");
  nothingCreated(ask, "ask");
  /* The click: a new /begin carrying the chosen name, which the run registers before its first upload. */
  const chosen = await run({ slug: "ad-ask", subdomain: null, choose: { subdomain: "my-team" } });
  assert.equal(chosen.prefix(), "my-team");
  const reg = chosen.calls.findIndex((c) => c.method === "PUT" && c.u.endsWith("/workers/subdomain"));
  const first = chosen.calls.findIndex((c) => c.method === "PUT" && /\/workers\/scripts\/(?!bio-plan-probe)[^/]+$/.test(c.u));
  assert.ok(reg >= 0 && reg < first, "registered before the first upload");
  assert.match(chosen.page.done, /https:\/\/ad-ask\.my-team\.workers\.dev/);
  /* Taken: another is asked, nothing is registered or created. */
  const taken = await run({ slug: "ad-ask", subdomain: null, taken: ["my-team"], choose: { subdomain: "my-team" } });
  assert.match(taken.page.done, /id="address-name"[^>]*value="my-team"/, "asks again, the taken name in the field");
  assert.notEqual(taken.page.status("room"), "ok");
  assert.equal(taken.prefix(), null);
  assert.deepEqual(writes(taken), ["PUT /accounts/A1/workers/subdomain"], "the one refused attempt, nothing else");
  assert.deepEqual([...taken.buckets], []);
  assert.deepEqual([...taken.acct.keys()].filter((k) => k !== "bio-plan-probe"), []);
  /* The choice rides the cookie like the others, and a name Cloudflare could not register is refused by name at /begin. */
  assert.equal((await begin("ad-ask", "install", { subdomain: "Not A Name!" })).r.status, 400);
  const ok = await begin("ad-ask", "install", { subdomain: "My-Team" });
  assert.equal(JSON.parse(Buffer.from(ok.cookie.split("=")[1], "base64url").toString()).sd, "my-team");
  /* Control: an account that has a prefix is asked nothing. */
  const had = await run({ slug: "ad-had" });
  assert.equal(had.page.status("room"), "ok");
});

test("R84 (5) the permission: the granted scopes are compared with those every install needs before the first call; a missing one asks to approve again and nothing is called; a token response stating none, or every scope, goes on", async () => {
  const lacking = await run({ slug: "sc-lack", grantedScope: "workers-scripts.write account-settings.read containers.write" });
  assert.ok(lacking.page.failed.said.includes("workers-r2.write"), "names the missing permission");
  assert.ok(lacking.page.done.includes("data-begin"), "asks to approve again");
  assert.deepEqual(lacking.calls.filter((c) => c.u.startsWith(CFG.API)).map((c) => c.u), [], "not one call to Cloudflare's API");
  nothingCreated(lacking, "scopes");
  /* The two scopes with a step of their own are not needed up front. */
  const some = await run({ slug: "sc-some", grantedScope: "workers-scripts.write workers-r2.write account-settings.read containers.write" });
  assert.ok(some.page.done && !some.page.failed, "logs and the VPC scope are judged by their own steps");
  const none = await run({ slug: "sc-none", grantedScope: null });
  assert.equal(none.page.status("room"), "ok");
  const all = await run({ slug: "sc-all" });
  assert.equal(all.page.status("room"), "ok");
});

test("R84 (6) the account: when the sign-in lists more than one, the founder chooses one by name, nothing is touched meanwhile, and the choice is kept with the others", async () => {
  const accounts = [{ id: "first", name: "The First" }, { id: "second", name: "The Second" }];
  const ask = await run({ slug: "ac-two", accounts });
  assert.equal(ask.page.status("acct"), "no");
  assert.ok(ask.page.done.includes("The First") && ask.page.done.includes("The Second"), "by name");
  assert.deepEqual(ask.calls.filter((c) => c.u.startsWith(CFG.API) && c.u !== CFG.API + "/accounts").map((c) => c.u), [], "no call on either account");
  /* The choice is kept: a later stop's Check again carries it. */
  const chosen = await run({ slug: "ac-two", accounts, choose: { account: "second" }, plan: "free" });
  assert.equal(chosen.page.retry.body.account, "second");
  assert.ok(chosen.calls.every((c) => !c.u.includes("/accounts/first")), "only the chosen account");
  const done = await run({ slug: "ac-two", accounts, choose: { account: "second" } });
  assert.ok(done.calls.some((c) => c.u.includes("/accounts/second/workers/scripts/ac-two")));
  /* A choice that names none of them is asked again; one account is used without asking. */
  const stale = await run({ slug: "ac-two", accounts, choose: { account: "third" } });
  assert.equal(stale.page.status("acct"), "no");
  const one = await run({ slug: "ac-one" });
  assert.equal(one.page.status("acct"), "ok");
});

test("R84 (7) size: a member's bundle over Cloudflare's 64 MiB uncompressed Worker limit is left out by name before any upload and the rest installs; the plane over it stops before anything is created; a normal member is not", async () => {
  armWith(SIGNER.line);
  const big = MEMBER_SRC + " ".repeat(WORKER_SIZE_LIMIT + 1);
  const rel = await release({ version: NEXT, memberSrc: { "pdf-worker": big } });
  const w = await run({ slug: "sz-member", rel });
  assert.ok(w.page.done, "the install finishes");
  assert.equal(w.calls.some((c) => c.method === "PUT" && c.u.endsWith("/workers/scripts/pdf-worker-sz-member")), false, "not uploaded");
  assert.ok(w.acct.has("ocr-worker-sz-member"), "the rest installed");
  assert.ok(w.page.label("fleet").includes("pdf-worker"), "named");
  const small = await run({ slug: "sz-small", rel: await release({ version: NEXT }) });
  assert.ok(small.acct.has("pdf-worker-sz-small"), "control: a normal member installs");
  const planeRel = await release({ version: NEXT, src: CAPABLE_SRC + "//" + " ".repeat(WORKER_SIZE_LIMIT) });
  const p = await run({ slug: "sz-plane", rel: planeRel });
  assert.ok(p.page.failed && !p.page.done, "the plane over the limit stops");
  nothingCreated(p, "plane size");
  restoreSigners();
});

test("R84 control: a ready account passes every check and installs; the checks write nothing before the install's own first creation", async () => {
  const w = await run({ slug: "rd-ready" });
  assert.ok(w.page.done && !w.page.failed);
  for (const id of ["acct", "fresh", "plan", "room"]) assert.equal(w.page.status(id), "ok", id);
  const firstWrite = w.calls.findIndex((c) => c.method !== "GET" && c.u !== CFG.TOKEN && !/bio-plan-probe/.test(c.u));
  const buckets = w.calls.findIndex((c) => c.method === "POST" && c.u.endsWith("/r2/buckets"));
  assert.equal(firstWrite, buckets, "the first write is the storage the install creates");
});
