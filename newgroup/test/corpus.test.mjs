/* R75, R76, R77, R79's test: the installer's pages, streamed lines, finished panels and stops hold no sentence of English the keys
 * do not. `word` is the module's own import and cannot be swapped, so the stub the requirement describes is done from the other
 * side: every state of every run is drawn against the stateful fake account of `fixture.mjs`, the text of every key the module
 * reads (`KEYS`) is taken out of what was drawn (its placeholders standing for any value: a name, a version, an address, a count,
 * Cloudflare's own words), and what is left is searched for English. A sentence is never held here. */
import { test, after } from "node:test";
import assert from "node:assert/strict";
import { word, KEYS } from "../src/words.mjs";
import { STEP_KEYS } from "../src/steps/index.mjs";
import { RELEASE_VERSION } from "../src/release.mjs";
import { run, req, release, armWith, restoreSigners, SIGNER, bump, heldCopy, jres, begin, callback, parsePage, RUNNER, DESCRIPTOR } from "./fixture.mjs";
import { hostingControlBlock, HOSTING_CONTROL, HOSTING_RECOVERY_DEPLOYER } from "../../bio-plane/src/setup-fleet.mjs";
import { WORD_ROWS } from "../../bio-plane/src/setup-words/index.mjs";
import { readFileSync } from "node:fs";

after(restoreSigners);
const NEXT = bump(RELEASE_VERSION);

const unescape = (s) => s.replace(/&(lt|gt|quot|amp|#39);/g, (_, c) => ({ lt: "<", gt: ">", quot: '"', amp: "&", "#39": "'" }[c]));
const flatten = (html) => unescape(html.replace(/<script>[\s\S]*?<\/script>/g, " ").replace(/<style>[\s\S]*?<\/style>/g, " ")
  .replace(/<\/?(?:a|b|i|em|strong|code|span)\b[^>]*>/g, "").replace(/<[^>]*>/g, " ")).replace(/\s+/g, " ");

/* Every key's row as a pattern over the flattened text: markup in a row is dropped as the drawn text's is, a placeholder matches
   any value of one line. The longest rows come out first, so a row that holds another is taken whole. */
const rows = new Map(WORD_ROWS.map((r) => [r[0], r[1]]));
/* A placeholder between words stands for any value of one line; one at an end of the row, for a few words at most, so a row that
   begins or ends with one cannot take in the sentences beside it. */
const rowRe = (t) => {
  const parts = t.split(/\{[A-Za-z0-9_]+\}/).map((p) => p.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/\s+/g, "\\s+"));
  return new RegExp(parts.map((p, i) => (i === 0 ? p : (p === "" && i === parts.length - 1 ? "(?:\\S+\\s*){1,8}?" : (i === 1 && parts[0] === "" ? "\\S+" : ".{0,200}?") + p))).join(""), "g");
};
const longestFirst = (texts) => texts.map((t) => flatten(t).trim()).filter((t) => t.length >= 2).sort((a, b) => b.length - a.length).map(rowRe);
/* R84: the sentences the module writes first in code, `localize(id, en)`: the list wins when it holds a row, else the `en` is the sentence,
   so a drawn one is read as a key's word is. They are taken from the source's literal pairs, never copied here. */
const ready = readFileSync(new URL("../src/ready.mjs", import.meta.url), "utf8") + readFileSync(new URL("../src/index.mjs", import.meta.url), "utf8");
const written = [...ready.matchAll(/localize\(\s*"([^"]+)",\s*("(?:[^"\\]|\\.)*")/g)].map((m) => rows.get(m[1]) ?? JSON.parse(m[2]));
const PATTERNS = longestFirst([...[...KEYS, ...STEP_KEYS].map((k) => rows.get(k)).filter((t) => typeof t === "string"), ...written]);

/* What a drawn text holds beside the keys' words: the runs of three or more consecutive lower-case words are English. A name,
   a version, an address or a count is no word; Cloudflare's own text and the leaf text another module owns are exempt below. */
export function leftovers(drawn, exempt = []) {
  let rest = " " + flatten(drawn) + " ";
  for (const re of exempt.filter((r) => r.whole)) rest = rest.replace(re, " ◆ ");
  for (const re of PATTERNS) rest = rest.replace(re, " ◆ ");
  for (const re of exempt.filter((r) => !r.whole)) rest = rest.replace(re, " ◆ ");
  /* a word is a lower-case run standing alone: not part of a name (`pdf-worker-grp`), an address (`grp.workers.dev`) or a file name */
  return [...rest.matchAll(/(?:(?<![\w.-])[a-z][a-z'’]+(?![\w-]|\.\w)[ ,;:.\u2014]*){3,}/g)].map((m) => m[0].trim());
}

/* What is not this module's to key, and is exempt: the hosting-control block, instance-setup's (R40, `instance-setup` R97; the leaf's
   own text). The sentences of the account and fleet acts are `installer-steps`' keys and are read like any other (R36 of that module). */
const flat = (t) => flatten(t).trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/\s+/g, "\\s+");
const exemptions = { exempt: [...[true, false].map((deployer) => Object.assign(new RegExp(flat(hostingControlBlock("notice", { deployer })), "g"), { whole: true })), ...[...HOSTING_CONTROL.sentences, HOSTING_CONTROL.guide.sentence, HOSTING_RECOVERY_DEPLOYER].map((t) => Object.assign(new RegExp(flat(t), "g"), { whole: true }))] };
const everything = (w) => [w.page.words, ...w.page.waits, w.raw].join("\n");

async function states() {
  armWith(SIGNER.line);
  const rel = await release({ version: NEXT });
  const old = [{ type: "plain_text", name: "VERSION", text: "0.1.0" }];
  const planeBase = (slug, v = "0.1.0") => [{ type: "durable_object_namespace", name: "STORE", class_name: "Store" },
    { type: "plain_text", name: "VERSION", text: v }, { type: "secret_text", name: "ADMIN_TOKEN", text: "admin-kept" },
    { type: "secret_text", name: "PROBE_TOKEN", text: "probe-kept" }, { type: "service", name: "SELF", service: slug }];
  const h = heldCopy({ slug: "mine-one" });
  const out = {};
  const add = async (name, p) => { try { out[name] = await p; } catch (e) { out[name] = { error: e }; } };
  /* the install: finished, lagging, asleep, resumed, alongside, a second run, the plain stops */
  await add("install ok", run({ slug: "cor-ok", rel }));
  await add("install ai", run({ slug: "cor-ai", rel, ai: "sk-ant-api03-" + "x".repeat(40) }));
  await add("install lagging", run({ slug: "cor-lag", rel, copy: { storeVersion: "0.1.0" } }));
  // fixtures-own: platform a copy still waking: its self-check answers not-ok, the fake network's own double of a platform that is not up yet, not any module's answer
  await add("install asleep", run({ slug: "cor-asleep", copy: { selftest: () => jres({ ok: false }) } }));
  await add("install silent", run({ slug: "cor-silent", silentAddress: true }));
  await add("install resumed", run({ slug: "cor-res", ...heldCopy({ slug: "cor-res", finished: false, members: [], version: "0.1.0" }), group: null }));
  await add("install seed refused", run({ slug: "cor-seed", group: null, seedRefused: "GROUP_SLUG_MALFORMED" }));
  await add("install alongside", run({ slug: "cor-new", alongside: true, rel, ...heldCopy({ slug: "old-one", scheme: "legacy" }) }));
  await add("install exists", run({ slug: "cor-exists", ...h }));
  await add("install sourceflaky", run({ slug: "cor-flaky", sourceFlaky: 1 }));
  await add("install box", run({ slug: "cor-box", rel: await release({ version: NEXT, container: true }) }));
  await add("install box unasked", run({ slug: "cor-box2", rel: await release({ version: NEXT, container: true }), grantedScope: null, containers: "read" }));
  await add("install storage off", run({ slug: "cor-st", storage: "off" }));
  await add("install address ask", run({ slug: "cor-ad", subdomain: null }));
  await add("install address taken", run({ slug: "cor-ad", subdomain: null, taken: ["cor-ad"], choose: { subdomain: "cor-ad" } }));
  await add("install scopes", run({ slug: "cor-sc", grantedScope: "workers-scripts.write" }));
  await add("install accounts", run({ slug: "cor-ac", accounts: [{ id: "a", name: "One" }, { id: "b", name: "Two" }] }));
  await add("install containers odd", run({ slug: "cor-co", containersOdd: true }));
  await add("install box refused", run({ slug: "cor-box3", rel: await release({ version: NEXT, container: true }), containers: "create" }));
  await add("install scanner", run({ slug: "cor-scan", rel: await release({ version: NEXT, scanner: true }) }));
  for (const [k, opts] of Object.entries({ token: { tokenFail: true }, accounts: { accountsFail: true }, none: { accounts: [] }, free: { plan: "free" },
    plan: { plan: "unknown" }, r2: { r2: "refused" }, settings: { settingsFail: true }, containersOff: { containersOff: true },
    limit: { pre: Object.fromEntries([...Array(496)].map((_, i) => [`other-${i}`, []])) }, taken: { subdomain: null, taken: ["cor-stop"] },
    nolimits: { rel: await release({ version: NEXT, src: "export default {};" }) }, expire: { expireAfter: 3 }, down: { rel: null, builtInFleet: true, sourceDown: true },
    refused: { refuseAllPlane: true }, running: { pre: LOCK }, subd: { subdomainPut: "fail" }, enable: { enableFail: true },
    probe: { probeDelete: "fail" }, readback: { readBack: "differ" }, vpc: { vpc: "0123456789abcdef0123456789abcdef", refuseVpc: true },
    logpush: { logpush: "refused" }, sched: { rel: await release({ version: NEXT, scanner: true }), refuseSchedules: true } }))
    await add("install stop " + k, run({ slug: "cor-stop", ...opts }));
  /* the update */
  const base = { slug: "cor-up", mode: "update", rel, pre: { "cor-up": planeBase("cor-up"), "agent-worker": old } };
  await add("update ok", run(base));
  await add("update noop", run({ ...base, rel: await release({ version: NEXT }), pre: { "cor-up": planeBase("cor-up", NEXT) }, version: NEXT }));
  await add("update lagging", run({ ...base, copy: { storeVersion: "0.1.0" } }));
  await add("update blind", run({ ...base, subdomain: null }));
  await add("update ai", run({ ...base, ai: "sk-ant-api03-" + "x".repeat(40) }));
  await add("update unrecorded", run({ ...base, group: null }));
  await add("update silent", run({ ...base, group: "silent", silentAddress: true }));
  await add("update held", run({ slug: "mine-one", mode: "update", ...h }));
  await add("update box", run({ ...base, rel: await release({ version: NEXT, container: true }) }));
  for (const [k, opts] of Object.entries({ token: { tokenFail: true }, accounts: { accountsFail: true }, noteam: { pre: {} }, refused: { refuseUpdate: true },
    unreachable: { rel: null }, unsigned: { rel: await release({ version: NEXT, sig: "none" }) }, stranger: { rel: await release({ version: NEXT, sig: "stranger" }) },
    nolimits: { rel: await release({ version: NEXT, src: "export default {};" }) }, lookup: { lookupFail: ["cor-up"] }, r2: { r2: "refused" },
    foreign: { pre: { ...base.pre, [RUNNER]: old }, preClasses: { [RUNNER]: ["AgentRunner"] }, rel: await release({ version: NEXT, container: true }),
      preApps: [{ id: "a1", name: "mystery-box", durable_objects: { namespace_id: `ns-${RUNNER}-AgentRunner` }, configuration: { image: DESCRIPTOR.image } }] },
    expire: { expireAfter: 4 }, tamper: { rel: await release({ version: NEXT, tamper: "pdf-worker" }) } }))
    await add("update stop " + k, run({ ...base, ...opts }));
  /* the removal */
  await add("remove view", run({ slug: "mine-one", mode: "remove", ...h }));
  await add("remove silent", run({ slug: "mine-one", mode: "remove", ...h, copy: { silent: true } }));
  await add("remove confirmed", run({ slug: "mine-one", mode: "removeconfirm", typed: "mine-one", ...h, objects: { "bio-captures-mine-one": ["a"] } }));
  await add("remove refused", run({ slug: "mine-one", mode: "removeconfirm", typed: "mine-one", ...h, refuseDelete: ["pdf-worker-mine-one"] }));
  await add("remove running", run({ slug: "mine-one", mode: "removeconfirm", typed: "mine-one", ...h, pre: { ...h.pre, ...LOCK } }));
  await add("remove lookup", run({ slug: "mine-one", mode: "remove", ...h, lookupFail: ["mine-one"] }));
  await add("update running", run({ ...base, pre: { ...base.pre, ...LOCK } }));
  await add("remove none", run({ slug: "cor-nothing", mode: "remove" }));
  await add("remove token", run({ slug: "mine-one", mode: "remove", ...h, tokenFail: true }));
  await add("remove accounts", run({ slug: "mine-one", mode: "removeconfirm", typed: "mine-one", ...h, accountsFail: true }));
  restoreSigners();
  return out;
}

/* R69: another run holds the account's lock. */
const LOCK = { "bio-install-lock": [{ type: "plain_text", name: "T", text: String(Date.now() + 3600e3) }, { type: "plain_text", name: "ID", text: "another-run" }] };

const gets = async () => {
  const out = {};
  for (const p of ["/", "/update", "/update?version=" + NEXT, "/update?version=nonsense", "/nowhere"]) out["GET " + p] = { raw: await (await req(p)).text() };
  for (const body of [{ slug: "x" }, { slug: "Bad Name!" }, { slug: "ok-one", instanceAi: "nonsense" }, { slug: "ok-one", mode: "update" },
    { slug: "ok-one", mode: "removeconfirm", typed: "other" }, { slug: "ok-one", securityVpc: "nonsense" }, { slug: "ok-one", profiles: "nonsense" }]) {
    const r = await req("/begin", { method: "POST", body: JSON.stringify(body) });
    out["BEGIN " + JSON.stringify(body)] = { raw: String((await r.json()).error ?? "") };
  }
  const b = await begin("ok-one");
  out["callback denied"] = { raw: (await callback("error=access_denied&error_description=" + encodeURIComponent("User said no"), b.cookie)).raw };
  out["callback unverified"] = { raw: (await callback("code=X&state=wrong", b.cookie)).raw };
  out["callback bare"] = { raw: (await callback("code=X&state=wrong")).raw };
  return out;
};

test("R76 every state of every run draws its lines, checks, panels and counts by key: the progress page's lines, the finished panels and the partial-state lines hold no English the keys do not; control: a line with inline English is found", async () => {
  const s = await states();
  const bad = [];
  for (const [name, w] of Object.entries(s)) {
    if (w.error) { bad.push(`${name}: the run threw ${w.error.message}`); continue; }
    if (!w.page || w.page.events.length === 0) continue;
    const left = leftovers(everything(w), exemptions.exempt);
    if (left.length) bad.push(`${name}: ${JSON.stringify(left)}`);
  }
  assert.deepEqual(bad, []);
  /* Control: an inline sentence anywhere in what a run draws is found. */
  const w = s["install ok"];
  assert.ok(leftovers(everything(w) + "\n<p>Your files are all safe now.</p>").length > 0, "an inline sentence fails the test");
  assert.ok(leftovers(w.page.done + " <b>Nothing was lost today</b>").length > 0, "an inline sentence in the panel fails the test");
});

test("R75 every stop of an install, an update and a removal is one sentence by key: the stop holds no English the keys do not, and it is drawn whole; control: a stop with inline English is found", async () => {
  const s = await states();
  const bad = [], stops = [];
  for (const [name, w] of Object.entries(s)) {
    if (!w.page?.failed) continue;
    stops.push(name);
    const f = w.page.failed;
    const left = leftovers(`${f.said} ${f.d} ${f.s}`, exemptions.exempt);
    if (left.length) bad.push(`${name}: ${JSON.stringify(left)}`);
    assert.ok(f.said.length > 0, `${name}: the stop says something`);
  }
  assert.ok(stops.length >= 25, `the corpus holds the stops of the runs (${stops.length})`);
  assert.deepEqual(bad, []);
  const one = s["install stop free"].page.failed;
  assert.ok(leftovers(`${one.said} and nothing else happened to your account`).length > 0, "an inline sentence in a stop fails the test");
});

test("R77 the pages, the dialog and the refusals are read by key: GET /, GET /update, /begin's refusals, /callback's pages and the 404 page hold no English the keys do not; control: a page with inline English is found", async () => {
  const g = await gets();
  const bad = [];
  for (const [name, p] of Object.entries(g)) {
    const left = leftovers(p.raw, exemptions.exempt);
    if (left.length) bad.push(`${name}: ${JSON.stringify(left)}`);
  }
  assert.deepEqual(bad, []);
  assert.ok(leftovers(g["GET /"].raw.replace("</body>", "<p>Please be patient with us.</p></body>")).length > 0, "an inline sentence on a page fails the test");
  assert.ok(leftovers(g["BEGIN " + JSON.stringify({ slug: "x" })].raw + " this slug is not allowed").length > 0, "an inline refusal fails the test");
});
