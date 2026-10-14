/* installer R55 (T48-79; N1047; DEC-226 (4); K3158) and R43's T48 amendment, each at the module's interface: `GET /update?version=<V>`
 * and `POST /begin` driven with a request, the update run end to end by the fixture's stateful account and repository, and
 * the page's own script run as a browser runs it. The design stream's words (`words-t48.json`, `installer.update.*`) are
 * read from the file and compared with what the installer draws.
 */
import { test, after } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { ARMED_SIGNERS, CFG } from "../src/index.mjs";
import { UPDATE_WORDS, VERSION_RE } from "../src/ui.mjs";
import { RELEASE_VERSION } from "../src/release.mjs";
import { RELEASE_KEYS } from "../../bio-plane/src/sshsig.mjs";
import { pageWorld, req, run, begin, cookieValue, release, armWith, disarm, restoreSigners, SIGNER, bump, UNSTATED_SRC,
  BUILTIN_LIMITS, script, realFetch } from "./fixture.mjs";

after(restoreSigners);
const NEXT = bump(RELEASE_VERSION);
const text = async (path) => (await req(path)).text();
const planeBase = (slug, v = "0.70.0") => [{ type: "durable_object_namespace", name: "STORE", class_name: "Store" },
  { type: "plain_text", name: "VERSION", text: v }, { type: "secret_text", name: "ADMIN_TOKEN", text: "admin-kept" },
  { type: "secret_text", name: "PROBE_TOKEN", text: "probe-kept" }, { type: "service", name: "SELF", service: slug }];
const WORDS = Object.fromEntries(JSON.parse(readFileSync(new URL("../../docs/development/ux-substrate/screens/words-t48.json", import.meta.url), "utf8"))
  .map((w) => [w.key, w.en]));
const fill = (t, o) => t.replace(/\{(\w+)\}/g, (_, k) => o[k]);
const nonGet = (w) => w.calls.filter((c) => c.method !== "GET" && c.u.startsWith(CFG.API));
const plain = (html) => html.replace(/<[^>]+>/g, " ").replace(/&#39;/g, "'").replace(/\s+/g, " ").replace(/ ([.,;])/g, "$1");

test("R55 the words the update draws are the design stream's `installer.update.*`, to the character", () => {
  const V = "0.99.0", F = "0.98.0", A = "Group Account";
  assert.equal(UPDATE_WORDS.running(V), fill(WORDS["installer.update.running"], { version: V }));
  assert.equal(UPDATE_WORDS.chosen(V, "2026-10-20"), fill(WORDS["installer.update.chosen"], { version: V, date: "2026-10-20" }));
  assert.equal(UPDATE_WORDS.chosen(V), fill(WORDS["installer.update.chosen"], { version: V, date: "" }).replace(", , ", ", "),
    "without a date the clause is left out, nothing else");
  assert.equal(UPDATE_WORDS.only, WORDS["installer.update.only"]);
  assert.equal(UPDATE_WORDS.checked, WORDS["installer.update.checked"]);
  assert.equal(UPDATE_WORDS.progressTitle, WORDS["installer.update.progress.title"]);
  assert.equal(UPDATE_WORDS.progressSays(F, V, A), fill(WORDS["installer.update.progress.says"], { from: F, to: V, account: A }));
  assert.equal(UPDATE_WORDS.progressVerified(V), fill(WORDS["installer.update.progress.verified"], { to: V }));
  assert.equal(UPDATE_WORDS.progressRead(F), fill(WORDS["installer.update.progress.read"], { from: F }));
  assert.equal(UPDATE_WORDS.progressPlacing(V), fill(WORDS["installer.update.progress.placing"], { to: V }));
  assert.equal(UPDATE_WORDS.progressAnswers, WORDS["installer.update.progress.answers"]);
  assert.equal([UPDATE_WORDS.stoppedWhy("Cloudflare refused the upload"), UPDATE_WORDS.stoppedKept(V), UPDATE_WORDS.stoppedDo].join(" "),
    fill(WORDS["installer.update.stopped"], { version: V }));
  assert.equal(UPDATE_WORDS.tryAgain, WORDS["installer.update.tryagain"]);
  assert.equal(UPDATE_WORDS.doneTitle, WORDS["installer.update.done.title"]);
  assert.equal(UPDATE_WORDS.doneSays(V, F), fill(WORDS["installer.update.done.says"], { to: V, from: F }));
  assert.equal(UPDATE_WORDS.doneAnswers(V), fill(WORDS["installer.update.done.answers"], { to: V }));
  assert.equal(UPDATE_WORDS.doneKept, WORDS["installer.update.done.kept"]);
  assert.equal(UPDATE_WORDS.doneNote(V), fill(WORDS["installer.update.done.note"], { to: V }));
  assert.equal(UPDATE_WORDS.back, WORDS["installer.update.back"]);
});

test("R55 GET /update?version=<V> draws the one release chosen (the chosen line, \"this page installs that release and no other\", the checked line) and \"Continue to Cloudflare to update\"; its act sends /begin with V; any other value, or none, draws the page saying no release was chosen; nothing else is read from the address", async () => {
  const calls = script([]);
  const page = await text(`/update?version=${NEXT}`);
  const words = plain(page);
  assert.ok(words.includes(UPDATE_WORDS.chosen(NEXT) + "; " + UPDATE_WORDS.only + "."), words);
  assert.ok(words.includes(UPDATE_WORDS.checked + "."));
  assert.match(page, /<button id="go" class="cs-btn" data-tone="primary">Continue to Cloudflare to update<\/button>/);
  /* The act sends /begin carrying V and the slug typed, in update mode, and nothing from the address but V. */
  const w = pageWorld(page);
  w.el("slug").value = "river-keepers";
  await w.el("go").click();
  assert.equal(w.sent.length, 1);
  assert.deepEqual(w.sent[0].body, { slug: "river-keepers", mode: "update", version: NEXT });
  /* No credential is read from the address. */
  const SECRET = "SECRET-FROM-THE-ADDRESS-0123456789";
  const hostile = await text(`/update?version=${NEXT}&ADMIN_TOKEN=${SECRET}&token=${SECRET}&slug=${SECRET}`);
  assert.ok(!hostile.includes(SECRET));
  assert.equal(hostile, page, "only the version changes what is drawn");
  /* Controls: no release chosen, or one not of R47's form. */
  assert.match(VERSION_RE.source, /\\d/);
  for (const bad of [undefined, "", "1", "1.2", "1.2.3.4", "01.2.3", "1.02.3", "1.2.3-rc1", "1.2.3 ", " 1.2.3", "v1.2.3", "1.2.x", "latest",
                     "<script>alert(1)</script>", "../1.2.3", "1.2.3\n", "9".repeat(40) + ".0.0"]) {
    const p = await text(bad === undefined ? "/update" : `/update?version=${encodeURIComponent(bad)}`);
    const body = plain(p);
    assert.match(body, /No release was chosen\./, JSON.stringify(bad));
    assert.match(body, /Settings › Updates/);
    assert.ok(p.includes('id="back-settings"'), "a way back");
    assert.ok(!p.includes('id="go"') && !p.includes('mode:"update"') && !p.includes("<script>alert(1)"), `${JSON.stringify(bad)}: nothing to send`);
  }
  assert.deepEqual(calls, []);
  globalThis.fetch = realFetch;
  /* The way back: a link to the origin of the page the reader came from (their group's own address), none when there is none. */
  const none = await text("/update");
  const [js] = [...none.matchAll(/<script>([\s\S]*?)<\/script>/g)].map((m) => m[1]);
  const link = () => { const a = { href: "/", hidden: true }; return a; };
  for (const [referrer, href, hidden] of [["https://river-keepers.grp.workers.dev/app/settings?x=1", "https://river-keepers.grp.workers.dev/", false],
      ["", "/", true], ["not a url", "/", true], ["http://plain.example/app", "/", true]]) {
    const a = link();
    new Function("document", js)({ referrer, getElementById: (id) => id === "back-settings" ? a : null });
    assert.deepEqual([a.href, a.hidden], [href, hidden], JSON.stringify(referrer));
  }
});

test("R55 POST /begin in update mode carries V in the cookie; none, or any other value, is refused 400 by name with no cookie; an install takes no version", async () => {
  const a = await begin("river-keepers", "update", { version: NEXT });
  assert.equal(a.j.ok, true);
  assert.equal(cookieValue(a.cookie).r, NEXT);
  assert.equal(cookieValue(a.cookie).mode, "update");
  for (const bad of [undefined, "", "1.2", "01.2.3", "1.2.3-rc1", 123, null, ["1.2.3"], { v: "1.2.3" }, "1.2.3\n"]) {
    const r = await req("/begin", { method: "POST", body: JSON.stringify({ slug: "river-keepers", mode: "update", ...(bad === undefined ? {} : { version: bad }) }) });
    const j = await r.json();
    assert.deepEqual([r.status, j.ok], [400, false], JSON.stringify(bad));
    assert.match(j.error, /^No release was chosen\./);
    assert.equal(r.headers.get("set-cookie"), null);
  }
  const i = await begin("river-keepers", "install", { version: NEXT });
  assert.equal(i.j.ok, true);
  assert.ok(!("r" in cookieValue(i.cookie)), "an install installs no chosen release");
  /* A cookie for an update that names no release is not one /begin wrote: nothing is touched. */
  const calls = script([]);
  const { callback } = await import("./fixture.mjs");
  const forged = "bio_wiz=" + Buffer.from(JSON.stringify({ ...cookieValue(a.cookie), r: undefined })).toString("base64url");
  const out = await callback(`code=C&state=${a.state}`, forged);
  assert.match(out.raw, /No release was chosen\./);
  assert.deepEqual(calls, []);
  globalThis.fetch = realFetch;
});

test("R55 an update with V equal to a signed release installs that release, draws its states (updating: the lines as they run; finished: the release now running, and the way back), and reads the signature against the release keys", async () => {
  armWith(SIGNER.line);
  const rel = await release({ version: NEXT });
  const w = await run({ slug: "r55-ok", mode: "update", pre: { "r55-ok": planeBase("r55-ok") }, rel, version: NEXT });
  restoreSigners();
  assert.equal(w.page.failed, null, JSON.stringify(w.page.failed));
  assert.match(w.raw, new RegExp(`<title>${UPDATE_WORDS.progressTitle.replace(/'/g, "&#39;")}</title>`));
  assert.equal(w.page.status("rel"), "ok");
  assert.equal(w.page.label("rel"), UPDATE_WORDS.progressVerified(NEXT));
  assert.equal(w.page.label("read"), UPDATE_WORDS.progressRead("0.70.0"));
  assert.equal(w.page.says, UPDATE_WORDS.progressSays("0.70.0", NEXT, "Group Account"));
  assert.equal(w.page.label("up"), UPDATE_WORDS.progressPlacing(NEXT));
  assert.equal(w.page.label("verify") ?? UPDATE_WORDS.progressAnswers, UPDATE_WORDS.progressAnswers);
  assert.ok(w.page.steps.indexOf("rel") < w.page.steps.indexOf("read") && w.page.steps.indexOf("read") < w.page.steps.indexOf("up")
    && w.page.steps.indexOf("up") < w.page.steps.indexOf("verify"), w.page.steps.join());
  assert.equal(w.page.status("verify"), "ok");
  /* The release uploaded is the one chosen, byte for byte. */
  const put = w.planePuts[0];
  assert.equal(put.meta.bindings.find((b) => b.name === "VERSION").text, NEXT);
  assert.equal(put.source, rel.src);
  /* Finished. */
  const done = plain(w.page.done);
  for (const line of [UPDATE_WORDS.doneTitle, UPDATE_WORDS.doneSays(NEXT, "0.70.0"), UPDATE_WORDS.doneAnswers(NEXT), UPDATE_WORDS.doneKept,
                      UPDATE_WORDS.doneNote(NEXT), UPDATE_WORDS.back]) assert.ok(done.includes(line), line);
  assert.match(w.page.done, /<a class="cs-btn" data-tone="primary" id="update-back" href="https:\/\/r55-ok\.grp\.workers\.dev\/">/);
  assert.ok(!w.page.done.includes("Open your group"));
  /* A stop has no "Try again" until it stops; this one is the retry link's page. */
  assert.ok(!w.raw.includes('id="try-again"') || w.raw.includes(`href="/update?version=${NEXT}"`));
  /* The installer holds one verifier: the shipped keys are `signatures`' (R43). */
  assert.deepEqual([...ARMED_SIGNERS], [...RELEASE_KEYS]);
});

test("R55 an update of a version the installer cannot find installs nothing and draws the stop with \"Try again\", which begins again with the same V", async () => {
  armWith(SIGNER.line);
  const V = bump(NEXT), rel = await release({ version: NEXT });
  const pre = { "r55-none": planeBase("r55-none") };
  const w = await run({ slug: "r55-none", mode: "update", pre, rel, version: V });
  restoreSigners();
  assert.equal(w.page.status("rel"), "no");
  assert.equal(w.page.failed.h, `Stopped: the public repository holds no release ${V}.`);
  assert.equal(w.page.failed.p, UPDATE_WORDS.stoppedKept());
  assert.equal(w.page.failed.d, UPDATE_WORDS.stoppedDo);
  assert.equal(w.page.failed.s, "Checking release " + V + " is Civicsmith's own");
  assert.deepEqual([w.planePuts.length, nonGet(w).length], [0, 0], "nothing uploaded, created or removed");
  assert.deepEqual(w.acct.get("r55-none"), pre["r55-none"]);
  assert.equal(w.page.done, null);
  assert.ok(!w.page.steps.includes("up"));
  assert.ok(w.raw.includes(`<a class="cs-btn" data-tone="primary" id="try-again" href="/update?version=${V}">Try again</a>`));
  /* Try again begins again with the same V. */
  const again = pageWorld(await text(`/update?version=${V}`));
  again.el("slug").value = "r55-none";
  await again.el("go").click();
  assert.equal(again.sent[0].body.version, V);
});

test("R55 the newer-than-built-in rule of R8 does not choose for an update: V does (a newer release held, V older: not installed; V the built-in's own version: the built-in installs)", async () => {
  armWith(SIGNER.line);
  const newest = await release({ version: bump(NEXT) });
  const pre = { "r55-v": planeBase("r55-v") };
  /* The repository holds only a newer release than V: not installed in its place. */
  const older = await run({ slug: "r55-v", mode: "update", pre, rel: newest, version: NEXT });
  assert.equal(older.page.failed.h, `Stopped: the public repository holds no release ${NEXT}.`);
  assert.equal(older.planePuts.length, 0);
  /* V is the built-in's version: the built-in installs (whatever the repository holds), VERSION is V. */
  const b = await run({ slug: "r55-b", mode: "update", pre: { "r55-b": planeBase("r55-b") }, rel: newest, version: RELEASE_VERSION });
  restoreSigners();
  if (BUILTIN_LIMITS.ok) {
    assert.equal(b.page.failed, null, JSON.stringify(b.page.failed));
    assert.equal(b.planePuts[0].meta.bindings.find((x) => x.name === "VERSION").text, RELEASE_VERSION);
    assert.equal(b.page.label("rel"), UPDATE_WORDS.progressVerified(RELEASE_VERSION));
  } else {
    assert.match(b.page.failed.h, /states no limits/);
    assert.equal(b.planePuts.length, 0);
  }
});

test("R55 a release of V that fails a check is not installed, and the stop names why and that the group's Civicsmith runs as before: a key outside the release keys, no signature, a changed byte, a repository that does not answer, no keys to check against, stated limits missing", async () => {
  const pre = (slug, v) => ({ [slug]: planeBase(slug, v) });
  const cases = [];
  const stranger = await release({ version: NEXT, sig: "stranger" });
  const unsigned = await release({ version: NEXT, sig: "none" });
  const wrongNs = await release({ version: NEXT, sig: "wrong-ns" });
  const changed = await release({ version: NEXT, fleet: false }); changed.assets["bio-plane.bundled.mjs"] = "tampered";
  const unstated = await release({ version: NEXT, src: UNSTATED_SRC });
  const good = await release({ version: NEXT });
  cases.push(["a release of V signed by a key outside the release keys", stranger, /signed, but not by a key Civicsmith releases are signed with/],
    ["no signature", unsigned, /carries no signature/], ["a signature in another namespace", wrongNs, /signed, but not by a key/],
    ["a changed byte", changed, /did not pass its integrity check/], ["limits not stated", unstated, /states no limits/]);
  for (const [why, rel, m] of cases) {
    armWith(SIGNER.line);
    const slug = "r55-c" + cases.findIndex((c) => c[0] === why);
    const w = await run({ slug, mode: "update", pre: pre(slug), rel, version: NEXT });
    restoreSigners();
    assert.match(w.page.failed.h, m, why);
    assert.ok(w.page.failed.h.startsWith("Stopped: ") && w.page.failed.p === UPDATE_WORDS.stoppedKept(), why);
    assert.ok(w.raw.includes('id="try-again"'), why);
    assert.deepEqual([w.planePuts.length, nonGet(w).length], [0, 0], `${why}: nothing installed, nothing changed`);
    assert.equal(w.page.done, null, why);
  }
  /* No keys to check against: hashes alone never install an update. */
  disarm();
  const bare = await run({ slug: "r55-bare", mode: "update", pre: pre("r55-bare"), rel: good, version: NEXT });
  restoreSigners();
  assert.match(bare.page.failed.h, /lists no keys to check release/);
  assert.deepEqual([bare.planePuts.length, nonGet(bare).length], [0, 0]);
  /* The repository does not answer. */
  const gone = await run({ slug: "r55-gone", mode: "update", pre: pre("r55-gone"), rel: null, version: NEXT });
  assert.match(gone.page.failed.h, /was not reachable just now/);
  assert.deepEqual([gone.planePuts.length, nonGet(gone).length], [0, 0]);
  /* A release older than the one running is not refused (a group may need to roll back): V decides. */
  armWith(SIGNER.line);
  const back = await run({ slug: "r55-back", mode: "update", pre: pre("r55-back", bump(NEXT)), rel: good, version: NEXT });
  restoreSigners();
  assert.equal(back.page.failed, null, JSON.stringify(back.page.failed));
  assert.equal(back.planePuts[0].meta.bindings.find((b) => b.name === "VERSION").text, NEXT);
  /* Control: the same release, signed by a key the installer is armed with, installs. */
  armWith(SIGNER.line);
  const ok = await run({ slug: "r55-good", mode: "update", pre: pre("r55-good"), rel: good, version: NEXT });
  restoreSigners();
  assert.equal(ok.page.failed, null);
  assert.equal(ok.planePuts[0].meta.bindings.find((b) => b.name === "VERSION").text, NEXT);
});

test("R55 a refused upload is the stop with Cloudflare's own words, \"Try again\", and the release running named; the group's Civicsmith is as it was", async () => {
  armWith(SIGNER.line);
  const rel = await release({ version: NEXT });
  const slug = "r55-refused", before = planeBase(slug);
  const w = await run({ slug, mode: "update", pre: { [slug]: before }, rel, version: NEXT, refuseUpdate: true });
  restoreSigners();
  assert.equal(w.page.failed.h, "Stopped: Cloudflare refused the upload.");
  assert.equal(w.page.failed.p, UPDATE_WORDS.stoppedKept("0.70.0"));
  assert.ok(w.page.failed.d.startsWith(UPDATE_WORDS.stoppedDo + " (Cloudflare said: "));
  assert.equal([w.page.failed.h, w.page.failed.p, UPDATE_WORDS.stoppedDo].join(" "), fill(WORDS["installer.update.stopped"], { version: "0.70.0" }));
  assert.ok(w.raw.includes('id="try-again"'));
  assert.deepEqual(w.acct.get(slug), before);
});

test("R43 (T48) the installer's ARMED_SIGNERS are `signatures`' RELEASE_KEYS, the fresh release key and the offline recovery key and no other, read from there and held in no second list; arming a test key for one act never changes the shipped list", async () => {
  const fresh = await import("../src/signers.mjs?t48=" + Date.now());
  assert.deepEqual([...fresh.ARMED_SIGNERS], [...RELEASE_KEYS]);
  assert.equal(RELEASE_KEYS.length, 2);
  assert.deepEqual(RELEASE_KEYS.map((k) => k.split(" ")[2]), ["bio-release", "bio-release-recovery"]);
  assert.ok(Object.isFrozen(RELEASE_KEYS));
  assert.notEqual(fresh.ARMED_SIGNERS, RELEASE_KEYS, "an array of the installer's own, so a test arms one key for one act");
  armWith(SIGNER.line);
  assert.deepEqual([...RELEASE_KEYS].filter((k) => k === SIGNER.line), []);
  restoreSigners();
  assert.deepEqual([...ARMED_SIGNERS], [...RELEASE_KEYS]);
});
