/* The security tools step (R30; DEC-169 (6), (7)), at the page's interface: the bytes `pageOf` answers and its script run
   in the fixture's sandbox over a fake plane answering file-safety's ops in their documented shapes (its R27 catalogue
   and tools, R28's add with its refusals, R29's test, R30's removal). `onOwnServers` and `DEEPER_CHECKS_PER_MONTH` are
   file-safety's own (its R32, R21), read here to check the page offers what they say. */
import test from "node:test";
import assert from "node:assert/strict";
import { pageOf, PAGE_HTML } from "../../../src/setup-page/index.mjs";
import { onOwnServers, DEEPER_CHECKS_PER_MONTH } from "../../../src/file-safety/index.mjs";
import { pageOver, bearerOf, CATALOGUE } from "./fixture.mjs";

const tick = () => new Promise((r) => setTimeout(r, 0));
const settle = async () => { for (let i = 0; i < 30; i++) await tick(); };
const claimSection = (html) => (html.match(/<section id="s-claim">[^]*?<\/section>/) || [""])[0];
const ops = (sent, names) => sent.filter((c) => names.includes(c.op)).map((c) => [c.op, c.body]);

/* file-safety R28's refusals, each in the plane's words (its rows' translations stand in for them here) */
const WORDS = {
  HANDLING_NOT_SHOWN: "The tool's handling must be shown before it is added. Nothing was added.",
  RETENTION_NOT_CONFIRMED: "This vendor keeps files for its own research; confirm that before adding it. Nothing was added.",
  CREDENTIALS_MISSING: "A credential the tool names was not given. Nothing was added.",
  USE_NOT_ALLOWED: "Every file is checked only by a tool on the organization's own servers. Nothing was added.",
  LIMIT_INVALID: "A monthly limit is a whole number from 1 to 100,000. Nothing was added.",
};
function plane({ administer = true, refuse = {}, passes = true, catalogue = { result: CATALOGUE } } = {}) {
  const st = { tools: [] };
  const sent = [];
  const answer = (op, body) => {
    if (refuse[op]) return { result: { ok: false, ...refuse[op] } };
    switch (op) {
      case "stats": return { ok: true };
      case "bootstrap": return { claimed: false, bootstrapConfigured: true };
      case "claim": return { result: { ok: true, consumedAt: "2026-10-08T10:00:00Z" } };
      case "login": return { result: { ok: true, token: "sess-founder", expires: 0 } };
      case "whoami": return { result: { capabilities: ["contribute"], administer } };
      case "securitytoolcatalogue": return catalogue;
      case "securitytools": return { result: { ok: true, tools: st.tools.map((t) => ({ ...t })) } };
      case "securitytooladd": {
        const e = CATALOGUE.offered.find((x) => x.provider_id === body.providerId);
        const no = (code) => ({ result: { ok: false, reason: code, translation: WORDS[code] } });
        if (!e) return { result: { ok: false, reason: "PROVIDER_UNKNOWN" } };
        if (body.handlingDigest !== e.handling_digest) return no("HANDLING_NOT_SHOWN");
        if (e.handling.sample_sharing === "vendor_internal_research" && body.confirmRetention !== true) return no("RETENTION_NOT_CONFIRMED");
        if (e.credentials.some((n) => !(typeof body.credentials?.[n] === "string" && body.credentials[n].trim()))) return no("CREDENTIALS_MISSING");
        if (body.use === "routine" && !onOwnServers(e.handling.recipient)) return no("USE_NOT_ALLOWED");
        const limit = body.monthlyLimit ?? DEEPER_CHECKS_PER_MONTH;
        if (!Number.isSafeInteger(limit) || limit < 1 || limit > 100000) return no("LIMIT_INVALID");
        const tool_id = `${e.provider_id}-${st.tools.length + 1}`;
        st.tools.push({ tool_id, provider_id: e.provider_id, kinds: e.kinds, use: body.use, state: "added", handling: e.handling,
                        handling_digest: e.handling_digest, monthly_limit: limit, added_by: "admin", added_at: "2026-10-08T10:05:00Z", tested_at: null, off_reason: null });
        return { result: { ok: true, tool_id, state: "added" } };
      }
      case "securitytooltest": {
        const t = st.tools.find((x) => x.tool_id === body.toolId);
        if (!t) return { result: { ok: false, reason: "NO_SUCH_TOOL" } };
        t.state = passes ? "on" : "test_failed";
        return { result: { ok: true, tool_id: t.tool_id, state: t.state, passed: passes, detail: passes ? null : "the service answered 401", tested_at: "2026-10-08T10:06:00Z" } };
      }
      case "securitytoolremove": {
        const t = st.tools.find((x) => x.tool_id === body.toolId);
        if (!t) return { result: { ok: false, reason: "NO_SUCH_TOOL", translation: "No such tool." } };
        t.state = "removed"; return { result: { ok: true, tool_id: t.tool_id, state: "removed" } };
      }
      default: return { result: { ok: true } };
    }
  };
  const fetch = async (url, init) => {
    const u = new URL(url, "https://copy.example");
    const op = u.searchParams.get("op");
    const body = init && init.body ? JSON.parse(init.body) : null;
    sent.push({ op, body, url: String(url), method: (init && init.method) || "GET", token: bearerOf(init) });
    const out = answer(op, body);
    return { ok: true, status: 200, json: async () => out };
  };
  return { st, sent, fetch };
}
async function claimed(opts = {}) {
  const pl = plane(opts);
  const p = pageOver({ html: pageOf({ answered: true, result: { ok: true, group: "river-town" } }), hash: "#boot=one-time", fetch: pl.fetch });
  await settle();
  p.el("#cl-st-form").hidden = true; p.el("#cl-st-keepbox").hidden = true; p.el("#cl-st-everybox").hidden = true;   // as the markup carries them
  p.el("#pw1").value = "the-founders-password"; p.el("#pw2").value = "the-founders-password";
  await p.el("#do-claim").fire(); await settle();
  return { ...p, ...pl };
}
const pick = async (p, P, i) => { await p.drawn(`#${P}-st-cat .st-pick`, { i: String(i) }).fire(); await settle(); };

test("R30 in the claim's section, after R29 and R15–R18, the page offers the founder the optional step: what is built in first, that it can be skipped or done later in Settings › Security; skipped, it records nothing and asks no key", async () => {
  const claim = claimSection(PAGE_HTML);
  const after = (claim.match(/<div id="claim-after" hidden>[^]*$/) || [""])[0];
  const at = (id) => after.indexOf(`id="${id}"`);
  for (const id of ["cl-rc", "cl-ha", "cl-cn", "cl-gk", "cl-ka"]) assert.ok(at(id) >= 0 && at(id) < at("cl-st"), `${id} before the step`);
  const step = after.slice(at("cl-st"));
  for (const re of [/<b>Your organization's own security tools \(optional\)\.<\/b> Built in, with nothing to add:\s+the built-in scanner checks every file weekly and before it is first opened, and the safe view shows a file without\s+opening the original\./,
                    /You can skip this step, and adding nothing records nothing\./, /later, in Settings\s+&rsaquo; Security/])
    assert.match(step, re);
  assert.ok(step.indexOf("Built in") < step.indexOf('id="cl-st-cat"'), "what is built in comes first");
  assert.doesNotMatch(step.slice(0, step.indexOf('id="cl-st-form"')), /type="password"/, "no key is asked before a tool is chosen");
  const p = await claimed();
  const read = p.sent.filter((c) => c.op === "securitytoolcatalogue");
  assert.deepEqual(read.map((c) => [c.method, c.token]), [["GET", "sess-founder"]], "read under the founder's session");
  assert.equal(p.el("#cl-st-form").hidden, true);
  /* skipped: going on records nothing of it */
  await p.el("#claim-on").fire(); await settle();
  assert.deepEqual(ops(p.sent, ["securitytooladd", "securitytooltest", "securitytoolremove"]), []);
});

test("R30 it reads op=securitytoolcatalogue and shows each offered tool with its handling (what it is sent, who receives it, the region, how long it keeps files, whether it shares them) and the services not offered with their reasons in file-safety's words", async () => {
  const p = await claimed();
  const cat = p.el("#cl-st-cat").innerHTML;
  for (const t of CATALOGUE.offered) {
    assert.ok(cat.includes(`<b>${[t.vendor, t.product].filter(Boolean).join(" ")}</b>`), t.provider_id);
    const h = t.handling;
    for (const v of [h.recipient, h.region, h.file_retention, h.result_retention]) assert.ok(cat.includes(v), `${t.provider_id}: ${v}`);
  }
  for (const k of ["What it is sent", "Never sent", "Who receives it", "Where", "How long it keeps files", "Whether it shares them"]) assert.ok(cat.includes(`<span class="k">${k}</span>`), k);
  assert.ok(cat.includes("the file itself") && cat.includes("the file's name, who asked, any internet address of yours"), "what it is sent and never sent, in words");
  assert.ok(cat.includes("It does not share the files it is sent.") && cat.includes("The vendor keeps files it is sent for its own research."));
  assert.match(cat, /<h3>Services not offered<\/h3>/);
  for (const r of [...CATALOGUE.refused, ...CATALOGUE.held]) assert.ok(cat.includes(r.words) && cat.includes(r.provider_id), r.provider_id);
  /* an offered template is shown with a plain note, and no add */
  assert.equal(p.drawn("#cl-st-cat .st-pick", { i: "2" }), null);
  assert.match(cat, /This is a template for a tool your organization runs and describes itself\./);
  /* a catalogue that does not answer, or is refused, is said, and nothing is offered */
  for (const catalogue of [{ error: "x" }, { result: { ok: false, reason: "NOT_AN_ADMIN", translation: "Only an administrator reads the security tools offered." } }]) {
    const q = await claimed({ catalogue });
    assert.doesNotMatch(q.el("#cl-st-cat").innerHTML, /st-pick/);
    assert.match(q.el("#cl-st-cat").innerHTML, catalogue.error ? /could not be read just now/ : /Only an administrator reads the security tools offered\./);
  }
});

test("R30 adding a tool asks only what its entry needs: its credentials (no key otherwise), settings its vendor names, the retention confirmation only where the vendor keeps files, 'every file' only for a tool on the organization's own servers, and a monthly limit defaulting to DEEPER_CHECKS_PER_MONTH", async () => {
  const p = await claimed();
  for (const [i, t] of CATALOGUE.offered.entries()) {
    if (t.template) continue;
    await pick(p, "cl", i);
    const fields = p.el("#cl-st-fields").innerHTML;
    assert.equal(p.el("#cl-st-form").hidden, false);
    const asked = [...fields.matchAll(/<label for="cl-st-cred-(\d+)">([^<]*)<\/label><input id="cl-st-cred-\1" type="password"/g)].map((m) => m[2]);
    assert.deepEqual(asked, t.credentials, `${t.provider_id}: its credentials, and nothing else secret`);
    assert.equal((fields.match(/type="password"/g) || []).length, t.credentials.length);
    assert.equal(p.el("#cl-st-keepbox").hidden, t.handling.sample_sharing !== "vendor_internal_research", `${t.provider_id}: retention`);
    assert.equal(p.el("#cl-st-everybox").hidden, !onOwnServers(t.handling.recipient), `${t.provider_id}: every file`);
    assert.equal(p.el("#cl-st-limit").value, String(DEEPER_CHECKS_PER_MONTH));
  }
  assert.match(PAGE_HTML, new RegExp(`<input id="cl-st-limit" inputmode="numeric" value="${DEEPER_CHECKS_PER_MONTH}">`));
  assert.deepEqual(ops(p.sent, ["securitytooladd"]), [], "choosing sends nothing");
});

test("R30 it sends op=securitytooladd with the shown handling's handlingDigest and the credentials in the body only, never shown again, then op=securitytooltest, stating whether the test passed and the tool is on, or why it stays off", async () => {
  const KEY = "md-core-key-sentinel-41f9";
  const p = await claimed();
  await pick(p, "cl", 0);
  p.el("#cl-st-cred-0").value = ` ${KEY} `;
  p.el("#cl-st-cfg").value = "region = eu\n\nengine_family = metadefender";
  p.el("#cl-st-every").checked = true; p.el("#cl-st-limit").value = "250";
  await p.el("#cl-st-add").fire(); await settle();
  const e = CATALOGUE.offered[0];
  const add = p.sent.filter((c) => c.op === "securitytooladd");
  assert.deepEqual(add.map((c) => [c.method, c.token, c.body]), [["POST", "sess-founder", { providerId: e.provider_id, config: { region: "eu", engine_family: "metadefender" },
    credentials: { api_key: KEY }, handlingDigest: e.handling_digest, confirmRetention: false, use: "routine", monthlyLimit: 250 }]]);
  assert.deepEqual(ops(p.sent, ["securitytooltest"]), [["securitytooltest", { toolId: "metadefender-core-1" }]]);
  assert.equal(p.el("#cl-st-said").textContent, "The test passed: OPSWAT, Inc. MetaDefender Core is on.");
  assert.equal(p.el("#cl-st-form").hidden, true);
  /* never shown again: no address, no field, no drawn text, no later request holds it */
  assert.equal(p.sent.some((c) => c.url.includes(KEY)), false);
  assert.equal(p.el("#cl-st-cred-0").value, "");
  for (const s of ["#cl-st-cat", "#cl-st-tools", "#cl-st-fields", "#cl-st-said", "#cl-st-err"]) assert.equal(`${p.el(s).innerHTML}${p.el(s).textContent}`.includes(KEY), false, s);
  const later = p.sent.slice(p.sent.findIndex((c) => c.op === "securitytooladd") + 1);
  assert.ok(later.length >= 2 && later.every((c) => !JSON.stringify(c).includes(KEY)));
  assert.match(p.el("#cl-st-tools").innerHTML, /metadefender-core<\/span><span class="v">on &middot; checks every file &middot; up to 250 a month/);
  /* a test that does not pass: the tool stays off, and why */
  const q = await claimed({ passes: false });
  await pick(q, "cl", 1);
  q.el("#cl-st-cred-0").value = "id"; q.el("#cl-st-cred-1").value = "secret"; q.el("#cl-st-keep").checked = true;
  q.el("#cl-st-limit").value = "";
  await q.el("#cl-st-add").fire(); await settle();
  assert.deepEqual(ops(q.sent, ["securitytooladd"]).map(([, b]) => [b.use, b.confirmRetention, "monthlyLimit" in b]), [["on_request", true, false]], "empty limit: file-safety's default");
  assert.equal(q.el("#cl-st-said").textContent, "Sophos Ltd SophosLabs Intelix was added and stays off: its test did not pass (the service answered 401).");
  /* 'every file' is never sent for a tool not on the organization's own servers, even if the box was ticked before */
  const r = await claimed();
  await pick(r, "cl", 1);
  r.el("#cl-st-every").checked = true; r.el("#cl-st-cred-0").value = "id"; r.el("#cl-st-cred-1").value = "s"; r.el("#cl-st-keep").checked = true;
  await r.el("#cl-st-add").fire(); await settle();
  assert.equal(ops(r.sent, ["securitytooladd"])[0][1].use, "on_request");
});

test("R30 every refusal is stated in file-safety's words and the step goes on; a missing credential or a malformed setting sends nothing", async () => {
  const p = await claimed();
  await pick(p, "cl", 1);
  p.el("#cl-st-cred-0").value = "id"; p.el("#cl-st-cred-1").value = "";
  await p.el("#cl-st-add").fire(); await settle();
  assert.equal(p.el("#cl-st-err").textContent, "Fill in client_secret: the tool needs it. Nothing was sent.");
  await pick(p, "cl", 1);
  p.el("#cl-st-cred-0").value = "id"; p.el("#cl-st-cred-1").value = "s"; p.el("#cl-st-cfg").value = "not a setting";
  await p.el("#cl-st-add").fire(); await settle();
  assert.match(p.el("#cl-st-err").textContent, /^Write each setting as name = value/);
  assert.deepEqual(ops(p.sent, ["securitytooladd"]), []);
  /* the retention not confirmed: file-safety's refusal, and the form stays for another try */
  await pick(p, "cl", 1);
  p.el("#cl-st-cred-0").value = "id"; p.el("#cl-st-cred-1").value = "s";
  await p.el("#cl-st-add").fire(); await settle();
  assert.equal(p.el("#cl-st-err").textContent, WORDS.RETENTION_NOT_CONFIRMED);
  assert.equal(p.el("#cl-st-form").hidden, false, "the step goes on");
  assert.deepEqual(ops(p.sent, ["securitytooltest"]), [], "nothing tested when nothing was added");
  p.el("#cl-st-cred-0").value = "id"; p.el("#cl-st-cred-1").value = "s"; p.el("#cl-st-keep").checked = true; p.el("#cl-st-limit").value = "0";
  await p.el("#cl-st-add").fire(); await settle();
  assert.equal(p.el("#cl-st-err").textContent, WORDS.LIMIT_INVALID);
  p.el("#cl-st-cred-0").value = "id"; p.el("#cl-st-cred-1").value = "s"; p.el("#cl-st-keep").checked = true; p.el("#cl-st-limit").value = "12";
  await p.el("#cl-st-add").fire(); await settle();
  assert.equal(p.el("#cl-st-err").textContent, "");
  assert.match(p.el("#cl-st-said").textContent, /^The test passed/);
  /* the test refused: said, and the tool stays as file-safety left it */
  const q = await claimed({ refuse: { securitytooltest: { reason: "SCANNER_ABSENT", translation: "No scanner is bound, so no tool can be tested." } } });
  await pick(q, "cl", 0); q.el("#cl-st-cred-0").value = "k"; await q.el("#cl-st-add").fire(); await settle();
  assert.equal(q.el("#cl-st-said").textContent, "OPSWAT, Inc. MetaDefender Core was added and stays off: its test could not be run. No scanner is bound, so no tool can be tested.");
  /* not now: the form closes and nothing is sent */
  const r = await claimed();
  await pick(r, "cl", 0); await r.el("#cl-st-cancel").fire(); await settle();
  assert.deepEqual([r.el("#cl-st-form").hidden, ops(r.sent, ["securitytooladd"])], [true, []]);
});

test("R30 members and keys offers the same step to an administrator at any time, with the group's tools (op=securitytools, never a credential) and op=securitytoolremove; a member who does not administer is offered none of it", async () => {
  const pl = plane();
  pl.st.tools.push({ tool_id: "metadefender-core-1", provider_id: "metadefender-core", kinds: ["scan"], use: "on_request", state: "test_failed",
                     handling: {}, handling_digest: "a".repeat(64), monthly_limit: 900, added_by: "admin", off_reason: null });
  const p = pageOver({ html: pageOf(undefined), session: { t: "sess-1", e: 0, w: "admin" }, fetch: pl.fetch });
  await settle();
  await p.el("#go-members").fire(); await settle();
  assert.match(PAGE_HTML, /<h2>Security tools<\/h2>\s*<div class="card" id="mk-st">/);
  assert.match(p.el("#mk-st-tools").innerHTML, /metadefender-core<\/span><span class="v">off: its test did not pass &middot; up to 900 a month <button class="st-rm" data-id="metadefender-core-1">remove<\/button>/);
  assert.ok(pl.sent.some((c) => c.op === "securitytools" && c.token === "sess-1"));
  await p.drawn("#mk-st-tools .st-rm", { id: "metadefender-core-1" }).fire(); await settle();
  assert.deepEqual(ops(pl.sent, ["securitytoolremove"]), [["securitytoolremove", { toolId: "metadefender-core-1" }]]);
  assert.match(p.el("#mk-st-tools").innerHTML, /None added\. The built-in scanner and the safe view work without any\./);
  /* the same add, from members and keys */
  await pick(p, "mk", 0); p.el("#mk-st-cred-0").value = "k2"; await p.el("#mk-st-add").fire(); await settle();
  assert.equal(ops(pl.sent, ["securitytooladd"]).length, 1);
  assert.equal(p.el("#mk-st-said").textContent, "The test passed: OPSWAT, Inc. MetaDefender Core is on.");
  /* a refusal to remove, in file-safety's words */
  const q = plane({ refuse: { securitytoolremove: { reason: "NOT_AN_ADMIN", translation: "Only an administrator can remove a tool." } } });
  q.st.tools.push({ tool_id: "t-1", provider_id: "x", use: "on_request", state: "on", monthly_limit: 5 });
  const r = pageOver({ html: pageOf(undefined), session: { t: "sess-1", e: 0, w: "admin" }, fetch: q.fetch });
  await settle(); await r.el("#go-members").fire(); await settle();
  await r.drawn("#mk-st-tools .st-rm", { id: "t-1" }).fire(); await settle();
  assert.equal(r.el("#mk-st-err").textContent, "Only an administrator can remove a tool.");
  /* a member who does not administer: the section is not offered, and nothing of the step is read */
  const m = plane({ administer: false });
  const n = pageOver({ html: pageOf(undefined), session: { t: "sess-2", e: 0, w: "ruth" }, fetch: m.fetch });
  await settle();
  assert.equal(n.el("#go-members").hidden, true);
  assert.deepEqual(m.sent.filter((c) => /^securitytool/.test(c.op)), []);
});
