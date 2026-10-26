/* T51's L11 fold (T51-128): R74 what an update stops for as foreign, R78 the installer records the team's short name itself, and
 * R79's control that the invitation page is the keys' own output. The module at its interface, driven through its routes against
 * the stateful fake account of `fixture.mjs` (whose copy answers `op=instancegroup` and `op=instancegroupseed` as a plane does);
 * each requirement is named in its test's title and keeps its control beside it. A sentence is never held here: the stop and the
 * lines are read with `word`, by key. */
import { test, after } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { RELEASE_VERSION } from "../src/release.mjs";
import { word } from "../src/words.mjs";
import { invitePage } from "../scripts/invite-page.mjs";
import { run, release, armWith, restoreSigners, SIGNER, bump, heldCopy, bindingOf, DESCRIPTOR, RUNNER, IMAGE, like } from "./fixture.mjs";

after(restoreSigners);
const NEXT = bump(RELEASE_VERSION);
const h = (s) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const planeBase = (slug, v = "0.1.0") => [{ type: "durable_object_namespace", name: "STORE", class_name: "Store" },
  { type: "plain_text", name: "VERSION", text: v }, { type: "secret_text", name: "ADMIN_TOKEN", text: "admin-kept" },
  { type: "secret_text", name: "PROBE_TOKEN", text: "probe-kept" }, { type: "service", name: "SELF", service: slug }];
const told = (w) => w.page.done.includes(h(word("installer.team.unrecorded.head")));

/* ------------------------------------------------------------------------------------------------ R74 */

test("R74 an update stops, changing and deleting nothing, when the copy holds a container application on its own Workers under a name that is not the copy's own; the stop is `installer.update.stopped.foreign`; control: the same application on another copy's Workers stops nothing, and an application under the copy's names for a class the release dropped stops nothing", async () => {
  armWith(SIGNER.line);
  const rel = await release({ version: NEXT, container: true });
  const old = [{ type: "plain_text", name: "VERSION", text: "0.1.0" }];
  const slug = "r74-one";
  const pre = { [slug]: planeBase(slug), [RUNNER]: old, "agent-worker": old, "pdf-worker": old, "ocr-worker": old, "sheet-worker": old, "agent-runner-other": old };
  const own = { id: "app9", name: RUNNER, durable_objects: { namespace_id: `ns-${RUNNER}-AgentRunner` }, configuration: { image: DESCRIPTOR.image } };
  const common = { slug, mode: "update", rel, pre, preClasses: { [RUNNER]: ["AgentRunner"], "agent-runner-other": ["AgentRunner"] } };
  const writes = (w) => w.calls.filter((c) => c.method !== "GET" && c.u.startsWith("https://api.cloudflare.com")).map((c) => `${c.method} ${c.u}`);
  /* An extra application on a namespace of the copy's own Workers, named as no part of the copy is. */
  const foreign = await run({ ...common, preApps: [own, { id: "app10", name: "mystery-box", durable_objects: { namespace_id: `ns-${RUNNER}-AgentRunner` }, configuration: { image: IMAGE } }] });
  assert.equal(foreign.page.failed.said, word("installer.update.stopped.foreign"));
  assert.equal(foreign.planePuts.length, 0, "nothing uploaded");
  assert.deepEqual(writes(foreign), [], "nothing created, changed or deleted");
  assert.deepEqual(foreign.apps.map((a) => a.name), [RUNNER, "mystery-box"], "the application is left where it is");
  assert.equal(foreign.page.done, null);
  /* Control: the copy's own applications only, or none, update. */
  const clean = await run({ ...common, preApps: [own] });
  assert.equal(clean.page.failed, null);
  assert.ok(clean.planePuts.length >= 1, "the update ran");
  const none = await run({ ...common, preApps: [] });
  assert.equal(none.page.failed, null);
  /* Control: an application of another copy (its own Workers) is no concern of this update. */
  const another = await run({ ...common, preApps: [own, { id: "app11", name: "a-name-of-theirs", durable_objects: { namespace_id: "ns-agent-runner-other-AgentRunner" }, configuration: { image: IMAGE } }] });
  assert.equal(another.page.failed, null);
  /* Control: an application under the copy's names for a class the chosen release no longer has is a retired part: left, not a stop. */
  const retired = await run({ ...common, preClasses: { ...common.preClasses, "pdf-worker": ["Retired"] },
    preApps: [own, { id: "app12", name: "pdf-worker", durable_objects: { namespace_id: "ns-pdf-worker-Retired" }, configuration: { image: IMAGE } }] });
  assert.equal(retired.page.failed, null);
  assert.ok(retired.apps.some((a) => a.name === "pdf-worker"), "the retired part stays");
  assert.ok(retired.page.done.includes(h(word("installer.update.retired", { parts: "pdf-worker" }))), "the retired part is named once in the update's panel");
  assert.ok(!clean.page.done.includes('id="retired-parts"'), "control: no retired part, nothing named");
  restoreSigners();
});

test("R74 the Workers on the copy's member names are examined too: one that this installer did not upload (no VERSION) stops an update, and an install that continues an unfinished copy, with the same key and nothing changed; a marked Worker of a member the release dropped is named once and left; control: a Worker of another copy, or a copy's own, stops nothing", async () => {
  armWith(SIGNER.line);
  const rel = await release({ version: NEXT, members: ["agent-worker", "pdf-worker"] });
  const old = [{ type: "plain_text", name: "VERSION", text: "0.1.0" }];
  const slug = "r74-wk";
  const writes = (w) => w.calls.filter((c) => c.method !== "GET" && c.u.startsWith("https://api.cloudflare.com")).map((c) => `${c.method} ${c.u}`);
  const own = { [slug]: planeBase(slug), [`agent-worker-${slug}`]: old, [`pdf-worker-${slug}`]: old };
  const foreignWorker = await run({ slug, mode: "update", rel, pre: { ...own, [`pdf-worker-${slug}`]: [{ type: "plain_text", name: "OTHER", text: "x" }] } });
  assert.equal(foreignWorker.page.failed.said, word("installer.update.stopped.foreign"));
  assert.equal(foreignWorker.planePuts.length, 0, "nothing uploaded");
  assert.deepEqual(writes(foreignWorker).filter((x) => !/bio-install-lock/.test(x)), [], "nothing created, changed or deleted");
  assert.ok(foreignWorker.acct.has(`pdf-worker-${slug}`), "the Worker is left where it is");
  /* An install that continues an unfinished copy meets the same check. */
  const half = heldCopy({ slug: "r74-wk-resume", finished: false, members: [], version: "0.1.0" });
  const resumed = await run({ slug: "r74-wk-resume", rel, ...half, pre: { ...half.pre, "pdf-worker-r74-wk-resume": [] } });
  assert.equal(resumed.page.failed.said, word("installer.install.stopped.foreign"));
  assert.equal(resumed.planePuts.length, 0, "nothing uploaded");
  assert.ok(!resumed.page.steps.includes("install"), "the install did not begin");
  /* Control: the copy's own members update; a Worker of another copy (another slug) is not judged. */
  const clean = await run({ slug, mode: "update", rel, pre: { ...own, "pdf-worker-someone-else": [] } });
  assert.equal(clean.page.failed, null);
  assert.ok(!clean.page.done.includes('id="retired-parts"'));
  /* A Worker with the mark on the name of a member this release does not have is a retired part: named once, left. */
  const retired = await run({ slug, mode: "update", rel, pre: { ...own, [`sheet-worker-${slug}`]: old } });
  assert.equal(retired.page.failed, null);
  assert.ok(retired.page.done.includes(h(word("installer.update.retired", { parts: `sheet-worker-${slug}` }))));
  assert.ok(retired.acct.has(`sheet-worker-${slug}`), "left in place");
  restoreSigners();
});

/* ------------------------------------------------------------------------------------------------ R78 */

test("R78 an install, a resumed install and an update's read: an install and a resumed install of a copy that records no team record the run's short name themselves, once, with the ADMIN_TOKEN they generated in an Authorization header and in no address, and draw no telling; a copy that records its team is asked nothing more; an update never seeds", async () => {
  /* An install: the copy records none until the installer makes the root of trust's act. */
  const w = await run({ slug: "r78-install", group: null });
  const boot = bindingOf(w.planePuts[0], "ADMIN_TOKEN").text;
  assert.deepEqual(w.seeds.map((s) => JSON.parse(s.init.body)), [{ slug: "r78-install" }], "the act is made once, with the run's own slug");
  assert.equal(w.recorded(), "r78-install", "the group is recorded as the slug");
  assert.equal(w.seeds[0].init.headers.authorization, "Bearer " + boot, "the credential the run generated, in the header");
  for (const c of w.calls) assert.equal(c.u.includes(boot), false, `${c.method} ${c.u}: the credential is in no address`);
  assert.equal(w.page.status("record"), "ok");
  assert.equal(w.page.label("record"), word("installer.step.record.done", { slug: "r78-install" }));
  assert.ok(w.page.events.find((e) => e.k === "step" && e.id === "record").label === word("installer.step.record"));
  assert.ok(!told(w), "recorded: the telling is absent");
  assert.equal(w.raw.includes(boot), true, "(the one-time password is shown once, in the panel, R16)");
  assert.equal(w.page.done.split(boot).length - 1, 1, "once");
  /* A copy that already records its team is asked nothing more, and nothing is said. */
  const kept = await run({ slug: "r78-kept" });
  assert.deepEqual(kept.seeds, [], "no act when the group is already recorded");
  assert.equal(kept.page.steps.includes("record"), false, "no line is drawn for it");
  assert.ok(!told(kept));
  /* A resumed install (a copy begun under this short name and not finished) records it too. */
  const half = heldCopy({ slug: "r78-resume", finished: false, members: [], version: "0.1.0" });
  const resumed = await run({ slug: "r78-resume", ...half, group: null });
  assert.equal(resumed.recorded(), "r78-resume");
  assert.equal(resumed.seeds.length, 1);
  /* A refused act leaves the copy as it was and draws R18's telling in `installer.team.unrecorded.*`. */
  const refused = await run({ slug: "r78-refused", group: null, seedRefused: "GROUP_SLUG_MALFORMED" });
  assert.equal(refused.recorded(), null, "the copy is as it was");
  assert.equal(refused.page.status("record"), "no");
  assert.ok(refused.page.label("record").startsWith(word("installer.step.record.refused", { slug: "r78-refused", said: "\u0000" }).split("\u0000")[0]));
  assert.ok(told(refused));
  /* F12: the copy is finished (its mark is written): running the installer again would land on "already holds a copy" and record
     nothing, so that advice is not drawn; the head, the effect and the suggestion are. */
  assert.ok(!refused.page.done.includes(h(word("installer.team.unrecorded.how"))), "no loop: a finished copy is not told to run the installer again");
  assert.ok(refused.page.done.includes(h(word("installer.team.unrecorded.how.finished"))), "it is told what stays refused and who can set it");
  assert.ok(refused.page.done.includes(h(word("installer.team.unrecorded.effect"))));
  /* Control: a copy the install could not finish (its mark refused) is unfinished, and running the installer again resumes and records it. */
  const unfinished = await run({ slug: "r78-nomark", group: null, seedRefused: "GROUP_SLUG_MALFORMED", refuseMark: true });
  assert.ok(unfinished.page.done.includes(h(word("installer.team.unrecorded.how"))), "an unfinished copy is told the way");
  assert.ok(refused.page.done.includes(h(word("installer.team.unrecorded.suggest", { slug: "r78-refused" }))));
  assert.ok(refused.page.done.includes('id="out-boot"'), "the credentials are still handed over");
  /* A copy that does not answer the read: the same. */
  const silent = await run({ slug: "r78-silent", group: "silent" });
  assert.deepEqual(silent.seeds, [], "no act is made on a read that was not answered");
  assert.equal(silent.page.status("record"), "no");
  assert.ok(told(silent));
  /* The update never seeds, whatever the copy answers (it binds no new ADMIN_TOKEN, K3892). */
  const upd = await run({ slug: "r78-upd", mode: "update", pre: { "r78-upd": planeBase("r78-upd") }, group: null });
  assert.deepEqual(upd.seeds, []);
  assert.ok(told(upd), "an update of a copy answering `group: null` draws R18's telling");
  assert.ok(upd.page.done.includes(h(word("installer.team.unrecorded.how"))), "(this copy has no mark: unfinished, so run again resumes it)");
  /* F12: a finished copy (its mark written) is told the rest, never to run the installer again; nothing is seeded. */
  const fin = await run({ slug: "r78-fin", mode: "update", pre: { "r78-fin": [...planeBase("r78-fin"), { type: "secret_text", name: "INSTALL_COMPLETE" }] }, group: null });
  assert.ok(told(fin));
  assert.ok(!fin.page.done.includes(h(word("installer.team.unrecorded.how"))), "no loop");
  assert.ok(fin.page.done.includes(h(word("installer.team.unrecorded.how.finished"))));
  assert.ok(!upd.page.done.includes(h(word("installer.team.unrecorded.how.finished"))), "(an unfinished copy is told the other)");
  assert.ok(fin.page.done.includes(h(word("installer.team.unrecorded.suggest", { slug: "r78-fin" }))));
  assert.deepEqual(fin.seeds, []);
  /* Control: no request the installer makes carries a Claude credential (R36). */
  for (const c of [...w.calls, ...upd.calls]) assert.ok(!/sk-ant|claude/i.test(JSON.stringify(c.init?.headers || {}) + c.u), `${c.u}`);
});

test("R78 the group is read inside the copy's answer envelope `{ ok, result: { ok, group }, store }`: a recorded team in `result` is recorded (no act, nothing said), `result.group: null` is none, and a group at the top level of the answer, where a plane puts none, is not read as recorded", async () => {
  const real = await run({ slug: "r78-env" });
  assert.deepEqual(real.seeds, [], "recorded inside result: no act");
  assert.ok(!told(real));
  const none = await run({ slug: "r78-env-none", group: null });
  assert.equal(none.recorded(), "r78-env-none", "result.group null: the installer records it");
  /* Control: the same recorded team at the top level of the answer is not read; an update tells it could not read it. */
  const flat = await run({ slug: "r78-flat", mode: "update", pre: { "r78-flat": planeBase("r78-flat") }, groupFlat: true });
  assert.ok(told(flat), "unread is told, never taken for recorded");
});

test("R69 R33 (S9) a container member still serving the old build after the rollout is a named lag on an update, and no success is claimed over it; control: members on the release's build confirm", async () => {
  armWith(SIGNER.line);
  const rel = await release({ version: NEXT, container: true });
  const old = [{ type: "plain_text", name: "VERSION", text: "0.1.0" }];
  const slug = "s9-lag";
  const pre = { [slug]: planeBase(slug), [RUNNER]: old };
  const common = { slug, mode: "update", rel, pre, preClasses: { [RUNNER]: ["AgentRunner"] } };
  const lagging = await run({ ...common, copy: { memberVersion: "0.0.1" } });
  assert.ok(lagging.page.status("verify") === "no", "not confirmed");
  assert.ok(lagging.page.done.includes(h(word("installer.lag.member.version", { name: "agent-runner", version: "0.0.1" }))), "the lag is named");
  const fine = await run(common);
  assert.equal(fine.page.status("verify"), "ok");
  restoreSigners();
});

/* ------------------------------------------------------------------------------------------------ R79 */

test("R79 the invitation page is built from the keys: its committed file is exactly the output of `scripts/invite-page.mjs` over setup-words' rows, so it holds no sentence the keys do not; control: a page with another sentence is not the output", async () => {
  const committed = readFileSync(new URL("../../bio-plane/public/newgroup/index.html", import.meta.url), "utf8");
  assert.equal(committed, invitePage());
  assert.ok(committed.includes(h(word("installer.invite.title")).replace(/&#39;/g, "'")));
  assert.notEqual(committed.replace(word("installer.invite.button"), "Click here"), invitePage(), "an inline sentence is not the output");
});

/* ------------------------------------------------------------------------------------------------ R81 */

test("R81 `src/index.mjs` no longer re-exports MEMBER_OBJECTS (gone with installer-steps R37): its export list holds no MEMBER_OBJECTS; control: the list is read (it holds objectMigrations), and a list that does hold the name is found", async () => {
  const index = await import("../src/index.mjs");
  const names = Object.keys(index);
  assert.ok(names.includes("objectMigrations"), "control: the export list is read");
  assert.ok(!names.includes("MEMBER_OBJECTS"), "the export list holds no MEMBER_OBJECTS");
  assert.ok([...names, "MEMBER_OBJECTS"].includes("MEMBER_OBJECTS"), "control: a list with the name is found");
});

/* ------------------------------------------------------------------------------------------------ R80 */

const OLD_EXPORTS = ["ARMED_SIGNERS", "ASSISTANT_BINDING", "ASSISTANT_OWN_ACCOUNTS", "BROWSER_BINDING", "CFG", "CONTAINER_PART", "HANDOVER_PATH",
  "INSTANCE_AI_BINDING", "MEMBER_BINDING", "OWN_HOSTS_BINDING", "PER_REQUEST_DATASET", "PROFILES_BINDING", "RETIRED_BINDINGS",
  "RETIRED_CLAUDE_BINDING", "SEAL_BINDING", "SourceUnavailable", "VPC_BINDING", "VPC_MEMBER", "WORKER_PART", "assetResponse", "containerClasses",
  "containerDescriptor", "default", "filterExcludes", "instanceAiOk", "memberLimits", "objectMigrations", "planeLimits", "reportsBuilds",
  "vpcServiceOk", "workerDescriptor"];

test("R80 the installer delegates the account and the fleet to installer-steps and answers as before: `src/index.mjs` exports exactly the names it exported before the split, every moved one being the very value installer-steps exports (no copy); the module's own source and scripts stay under 4,000 lines; control: a name missing, or a copy of a moved name, is found", async () => {
  const index = await import("../src/index.mjs");
  const steps = await import("../src/steps/index.mjs");
  assert.deepEqual(Object.keys(index).sort(), [...OLD_EXPORTS].sort(), "the export names equal the old list");
  const moved = OLD_EXPORTS.filter((n) => n in steps);
  assert.ok(moved.length >= 20, `most of the old list moved (${moved.length})`);
  for (const n of moved) assert.ok(index[n] === steps[n], `${n} is installer-steps' own, not a copy`);
  /* No other file of the module's source holds a name installer-steps exports, except by re-exporting that same value. */
  const { readdirSync, readFileSync } = await import("node:fs");
  for (const f of readdirSync(new URL("../src/", import.meta.url)).filter((x) => /\.mjs$/.test(x) && x !== "release.mjs" && x !== "index.mjs")) {
    const mod = await import("../src/" + f);
    for (const [n, v] of Object.entries(mod)) if (n in steps) assert.ok(v === steps[n], `${f}: ${n} is a copy of installer-steps'`);
  }
  /* P6: the module's own source (not installer-steps') and its scripts. */
  const lines = (dir, skip = []) => readdirSync(new URL(dir, import.meta.url)).filter((x) => /\.mjs$/.test(x) && !skip.includes(x))
    .reduce((n, x) => n + readFileSync(new URL(dir + x, import.meta.url), "utf8").split("\n").length, 0);
  assert.ok(lines("../src/", ["release.mjs"]) + lines("../scripts/") < 4000, "under P6's size");
  /* Control: the list notices a name missing and a copy. */
  assert.notDeepEqual([...Object.keys(index), "extra"].sort(), [...OLD_EXPORTS].sort());
  const copied = (f) => (...a) => f(...a);
  assert.ok(copied(index.planeLimits) !== steps.planeLimits, "a copy of a moved function is a different value, which the loop above would name");
});

/* ------------------------------------------------------------------------------------------------ R69, R33 (F2: S2) */

/* The progress page's own script, run against a stand-in for the few elements it touches. */
function shellWorld(raw, clock = { now: 0 }) {
  const els = new Map(), logRows = [], listeners = {}, timers = [];
  const el = (sel) => { if (sel === "#handover") return null; if (!els.has(sel)) els.set(sel, { hidden: true, textContent: "", innerHTML: "", dataset: {}, appendChild(d) { if (sel === "#log") logRows.push(d); } }); return els.get(sel); };
  const make = () => { const d = { dataset: {}, className: "", id: "" };
    Object.defineProperty(d, "innerHTML", { set() { d.firstChild = { textContent: "" }; d.children = [d.firstChild, { textContent: "" }, { textContent: "" }]; } }); return d; };
  const document = { querySelector: el, querySelectorAll: (q) => (q === "#log .cs-row" ? logRows : []), createElement: make, getElementById: () => null };
  const window = { addEventListener: (k, f) => { (listeners[k] ||= []).push(f); } };
  const [js] = [...raw.matchAll(/<script>([\s\S]*?)<\/script>/g)].map((m) => m[1]);
  const DateStub = { now: () => clock.now };
  new Function("document", "window", "setInterval", "Date", "navigator", "location", "fetch", js + "\nglobalThis.__p = { step, ok, no, done, fail, waiting };")(document, window, (f) => timers.push(f), DateStub, {}, {}, () => {});
  return { el, p: globalThis.__p, load: () => (listeners.load || []).forEach((f) => f()), tick: () => timers.forEach((f) => f()), clock };
}

test("R69 R33 a progress stream that ends, or goes quiet, with neither a panel nor a stop is a named stop, never nothing: it says the step in progress and the way on (the installer's first page; a reopened run continues); control: a stream that ended with its panel or its stop draws no second stop, and a stream that is still speaking is not stopped", async () => {
  const w = await run({ slug: "shell-end" });
  const lostAt = (step) => word("installer.stopped.unexpected", { said: word("installer.stopped.at", { step }) });
  /* The stream ends (the page loads) with a step in progress and nothing after it. */
  const a = shellWorld(w.raw);
  a.p.step("fleet", "Step one");
  assert.equal(a.el("#fail").hidden, true);
  a.load();
  assert.equal(a.el("#fail").hidden, false, "a stop is drawn");
  assert.equal(a.el("#fail-p").textContent, lostAt("Step one"), "it names the step in progress and the way on");
  /* The stream goes quiet (a dropped connection fires no load) for longer than a wait it would draw. */
  const b = shellWorld(w.raw);
  b.p.step("fleet", "Step two");
  b.clock.now += 60e3; b.tick();
  assert.equal(b.el("#fail").hidden, true, "control: a minute of quiet is not a stop");
  b.clock.now += 9 * 60e3; b.tick();
  assert.equal(b.el("#fail-p").textContent, lostAt("Step two"));
  /* Control: the panel, or the stop, ended the stream: the load draws nothing more; a late panel replaces a stop drawn too early. */
  const c = shellWorld(w.raw);
  c.p.step("fleet", "Step three"); c.p.done("<p>x</p>"); c.load();
  assert.equal(c.el("#fail").hidden, true);
  const d = shellWorld(w.raw);
  d.p.step("fleet", "Step four"); d.p.fail("Stopped", "", ""); d.el("#fail-p").textContent = "Stopped"; d.load();
  assert.equal(d.el("#fail-p").textContent, "Stopped", "the stream's own stop is kept");
  const e = shellWorld(w.raw);
  e.p.step("fleet", "Step five"); e.load(); e.p.done("<p>y</p>");
  assert.equal(e.el("#fail").hidden, true, "a late panel takes the stop away");
});

/* ------------------------------------------------------------------------------------------------ G54 (fix round 6) */

/* The deploy of the plane must leave Workers Logs on: a script upload that does not send `observability` turns them off (the
 * 10-20 upload did, on biosmoke8), and then nothing the plane logs can be queried. So both uploads of the plane state
 * `observability: {enabled: true}` and the account's settings are read back for it. Through the real install and update runs. */
test("G54 the install and the update upload the plane with observability {enabled: true}, and a run whose account does not state it afterwards is not confirmed; control: an upload without it leaves the account stating none", async () => {
  armWith(SIGNER.line);
  const rel = await release({ version: NEXT });
  const slug = "g54-obs";
  const inst = await run({ slug, rel });
  assert.deepEqual(inst.planePuts.at(-1).meta.observability, { enabled: true }, "the install's metadata");
  const upd = await run({ slug: "g54-upd", mode: "update", rel, pre: { "g54-upd": planeBase("g54-upd") } });
  assert.deepEqual(upd.planePuts.at(-1).meta.observability, { enabled: true }, "the update's metadata");
  /* The read-back: the account states none after the upload, so neither run may end as done. */
  for (const w of [await run({ slug: "g54-lost-i", rel, observabilityDropped: true }),
    await run({ slug: "g54-lost-u", mode: "update", rel, pre: { "g54-lost-u": planeBase("g54-lost-u") }, observabilityDropped: true })]) {
    assert.ok(w.page.failed, "the run stops");
    assert.equal(w.page.done, null, "and is not reported done");
  }
  /* Control: the fake states what the upload sent, so a PUT without it states none (the shape the platform showed). */
  assert.equal((await run({ slug: "g54-ctl", rel })).page.failed ?? null, null, "an account that states it is not refused");
});

/* G54 (installer-steps J17): the read-back of the logs continues when the plane's settings cannot be read, and says so through
 * `opts.note`; the installer shows that sentence among the run's other notes. By key, through the real install and update. */
test("G54 an unreadable settings read-back shows the step's note on the install's and the update's page and the run continues; control: a read-back stating enabled shows none", async () => {
  armWith(SIGNER.line);
  const rel = await release({ version: NEXT });
  /* The sentence is installer-steps' (read by its own key); this run holds none of it: the page gains one notice the control page lacks. */
  const notices = (w) => new Set(w.page.done.match(/<div class="notice">[\s\S]*?<\/div>/g) || []);
  const extra = (w, c) => [...notices(w)].filter((n) => !notices(c).has(n));
  /* An unreadable read of the plane's settings also leaves its bindings unread, so the page may gain the members' own notice beside the logs one: the note is the one that names the logs. */
  const logsNote = (w, c) => extra(w, c).filter((n) => like("installer.fleet.logsunconfirmed").test(n.replace(/&#39;/g, "'")));
  const cleanI = await run({ slug: "g54-note-i", rel });
  const inst = await run({ slug: "g54-note-i", rel, observabilityUnreadable: true });
  assert.equal(inst.page.failed ?? null, null, "the install goes on");
  assert.equal(logsNote(inst, cleanI).length, 1, "the install's page shows the note");
  assert.equal(extra(cleanI, inst).length, 0, "control: the page that read enabled shows none");
  const pre = { "g54-note-u": planeBase("g54-note-u") };
  const cleanU = await run({ slug: "g54-note-u", mode: "update", rel, pre });
  const upd = await run({ slug: "g54-note-u", mode: "update", rel, pre, observabilityUnreadable: true });
  assert.equal(upd.page.failed ?? null, null, "the update goes on");
  assert.equal(logsNote(upd, cleanU).length, 1, "the update's page shows the note");
  assert.equal(extra(cleanU, upd).length, 0, "control: the page that read enabled shows none");
});
