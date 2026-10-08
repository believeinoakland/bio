/* file-safety R27–R32, R34, R35: the group's security tools, the reputation tool spec, and counts forwarded to the
   group's log tools. At the module's interface, over credentials' real keyed services (R28, R30) and the scripted
   scanner's provider routes. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, pdf, sha, T0 } from "./fixture.mjs";
import { FILE_SAFETY_CHECKS, PROVIDER_REASON_WORDS, DEEPER_CHECKS_PER_MONTH, LOG_COUNT_KINDS, FileSafety, onOwnServers }
  from "../../../src/file-safety/index.mjs";
import { PROVIDERS, REFUSED_PROVIDERS, HELD_PROVIDERS } from "../../../../file-scanner/src/providers/catalogue.mjs";
import { canonicalJson, sha256HexSync } from "../../../src/record-grammar/index.mjs";

const row = (code) => ({ check: FILE_SAFETY_CHECKS[code].check, translation: FILE_SAFETY_CHECKS[code].translation });
const digestOf = (id) => sha256HexSync(canonicalJson(PROVIDERS.find((d) => d.provider_id === id).handling));
const keyed = (w) => w.credentials.keyedServices().services.filter((s) => s.service.startsWith("security:"));

test("R27: `securityToolCatalogue` (administrators) answers {offered, refused, held} from file-scanner's catalogue, each offered entry with its handling and handling_digest (SHA-256 of its canonical JSON) and its config list as file-scanner R29 answers it ([{name, label, required}], empty when the tool reads none; a generic template's naming engine_family and handling), each refused or held one with its reason in member words; `securityTools` the group's tools without credentials; anyone else NOT_AN_ADMIN", async () => {
  const w = world();
  for (const v of ["member:m1", "class:admin", "", undefined]) {
    assert.equal(w.fs.securityToolCatalogue({ viewer: v }).code, "NOT_AN_ADMIN", String(v));
    assert.equal(w.fs.securityTools({ viewer: v }).code, "NOT_AN_ADMIN", String(v));
  }
  const c = w.fs.securityToolCatalogue({ viewer: "member:boss" });
  assert.deepEqual(c.offered.map((d) => d.provider_id), PROVIDERS.map((d) => d.provider_id));
  for (const d of c.offered) {
    const src = PROVIDERS.find((x) => x.provider_id === d.provider_id);
    assert.deepEqual(d.handling, src.handling);
    assert.equal(d.handling_digest, sha256HexSync(canonicalJson(src.handling)));
    assert.deepEqual(d.config, src.config.map((f) => ({ name: f.name, label: f.label, required: f.required })), d.provider_id);
    for (const f of d.config) assert.deepEqual(Object.keys(f), ["name", "label", "required"]);
    if (d.template) for (const n of ["engine_family", "handling"]) assert.equal(d.config.find((f) => f.name === n)?.required, true, `${d.provider_id}: ${n}`);
  }
  assert.ok(c.offered.some((d) => d.config.length === 0) && c.offered.some((d) => d.config.length > 0), "both kinds are read");
  assert.deepEqual(c.offered.find((d) => d.provider_id === "cloudflare-intel").config, [{ name: "account_id", label: "Cloudflare account ID", required: true }]);
  assert.deepEqual(c.refused.map((r) => [r.provider_id, r.reason]), REFUSED_PROVIDERS.map((r) => [r.provider_id, r.reason]));
  for (const r of c.refused) assert.equal(r.words, PROVIDER_REASON_WORDS[r.reason]);
  assert.deepEqual(c.held.map((h) => [h.provider_id, h.reason, h.words]), HELD_PROVIDERS.map((h) => [h.provider_id, h.missing, PROVIDER_REASON_WORDS.HANDLING_NOT_STATED]));
  const id = await w.tool("scanii", { credentials: { api_key: "K-very-secret", api_secret: "S-very-secret" } });
  const t = w.fs.securityTools({ viewer: "member:boss" });
  assert.deepEqual(Object.keys(t.tools[0]).sort(), ["added_at", "added_by", "handling", "handling_digest", "kinds", "monthly_limit", "off_reason", "provider_id", "state", "tested_at", "tool_id", "use"]);
  assert.deepEqual([t.tools[0].tool_id, t.tools[0].state, t.tools[0].added_by, t.tools[0].use], [id, "on", "boss", "on_request"]);
  assert.doesNotMatch(JSON.stringify(t), /very-secret/, "no credentials");
  assert.doesNotMatch(JSON.stringify(w.tables()), /very-secret/, "this module holds none");
});

test("R28: `securityToolAdd`, an active administrator's act, refuses (writing nothing) NOT_AN_ADMIN (a machine credential too), PROVIDER_REFUSED or PROVIDER_HELD with the reason, PROVIDER_UNKNOWN, a generic template's descriptor refusal, CONFIG_MISSING and CONFIG_UNKNOWN naming the field (host and region excepted, the spec's own), HANDLING_NOT_SHOWN, RETENTION_NOT_CONFIRMED, CREDENTIALS_MISSING, USE_NOT_ALLOWED and LIMIT_INVALID; success holds the credentials through credentials (service security:<tool_id>), writes the tool added (off) with its handling and added_by, and answers {ok, tool_id, state}", async () => {
  const w = world();
  const ok = { providerId: "scanii", config: { region: "eu1" }, credentials: { api_key: "k", api_secret: "s" }, handlingDigest: digestOf("scanii"), by: "boss" };
  const add = (over) => w.fs.securityToolAdd({ ...ok, ...over });
  const snap = () => JSON.stringify([w.tables(), keyed(w)]);
  const before = snap();
  const expect = async (over, code, extra = {}) => {
    const r = await add(over);
    assert.equal(r.code, code, JSON.stringify(over));
    if (FILE_SAFETY_CHECKS[code]) assert.deepEqual({ check: r.check, translation: r.translation }, row(code));
    for (const [k, v] of Object.entries(extra)) assert.equal(r[k], v, `${code}.${k}`);
    assert.equal(snap(), before, `${code} wrote nothing`);
  };
  await expect({ by: "m1" }, "NOT_AN_ADMIN");
  await expect({ by: "class:admin" }, "NOT_AN_ADMIN");
  await expect({ providerId: "virustotal-upload" }, "PROVIDER_REFUSED", { provider_reason: "PROVIDER_SHARES_SAMPLES" });
  await expect({ providerId: "any-run" }, "PROVIDER_REFUSED", { provider_reason: "NOT_OFFERED" });
  await expect({ providerId: "votiro" }, "PROVIDER_HELD", { provider_reason: "HANDLING_NOT_STATED" });
  await expect({ providerId: "no-such-tool" }, "PROVIDER_UNKNOWN");
  await expect({ providerId: "icap", template: {} }, "PROVIDER_UNKNOWN");
  await expect({ providerId: "icap", template: { host: "icap.example.org:1344" }, config: { engine_family: ["sophos"], handling: { sample_sharing: "public" } } }, "PROVIDER_SHARES_SAMPLES");
  await expect({ providerId: "icap", template: { host: "icap.example.org:1344" }, config: { engine_family: ["sophos"], handling: { sample_sharing: "not stated" } } }, "HANDLING_NOT_STATED");
  /* the settings, by the entry's config list: a required one absent or empty, or one the list does not name */
  const cf = { providerId: "cloudflare-intel", credentials: { api_token: "t" }, handlingDigest: digestOf("cloudflare-intel") };
  for (const v of [undefined, null, "", "  ", [], {}]) await expect({ ...cf, config: v === undefined ? {} : { account_id: v } }, "CONFIG_MISSING", { field: "account_id" });
  await expect({ ...cf, config: null }, "CONFIG_MISSING", { field: "account_id" });
  await expect({ ...cf, config: { account_id: "a", zone: "z" } }, "CONFIG_UNKNOWN", { field: "zone" });
  await expect({ config: { region: "eu1", api_key: "in the wrong place" } }, "CONFIG_UNKNOWN", { field: "api_key" });
  const ds = { providerId: "defender-storage", credentials: { client_id: "a", client_secret: "b" }, handlingDigest: digestOf("defender-storage") };
  await expect({ ...ds, config: { tenant_id: "t", storage_account: "s" } }, "CONFIG_MISSING", { field: "container" });
  const tpl = { providerId: "syslog-tls", template: { host: "logs.example.org:6514" }, handlingDigest: null };
  await expect({ ...tpl, config: { engine_family: ["syslog"] } }, "CONFIG_MISSING", { field: "handling" });
  await expect({ ...tpl, config: { engine_family: ["syslog"], handling: { recipient: "the organization" }, port: 1 } }, "CONFIG_UNKNOWN", { field: "port" });
  await expect({ handlingDigest: "0".repeat(64) }, "HANDLING_NOT_SHOWN", { handling_digest: digestOf("scanii") });
  await expect({ handlingDigest: null }, "HANDLING_NOT_SHOWN");
  await expect({ providerId: "sophos-intelix", credentials: { client_id: "a", client_secret: "b" }, handlingDigest: digestOf("sophos-intelix") }, "RETENTION_NOT_CONFIRMED");
  await expect({ credentials: { api_key: "k" } }, "CREDENTIALS_MISSING", { field: "api_secret" });
  await expect({ credentials: null }, "CREDENTIALS_MISSING");
  await expect({ use: "routine" }, "USE_NOT_ALLOWED");
  await expect({ use: "always" }, "USE_NOT_ALLOWED");
  for (const monthlyLimit of [0, 100_001, 1.5, "5", -1]) await expect({ monthlyLimit }, "LIMIT_INVALID");
  /* success */
  const r = await add({ monthlyLimit: 100_000 });
  assert.deepEqual(r, { ok: true, tool_id: r.tool_id, state: "added" });
  assert.match(r.tool_id, /^scanii-\d+$/);
  const k = keyed(w).find((s) => s.service === `security:${r.tool_id}`);
  assert.deepEqual([k.held, k.on], [true, true]);
  assert.deepEqual((await w.credentials.keyedServiceFor({ service: `security:${r.tool_id}` })).key, { api_key: "k", api_secret: "s" });
  const t = w.fs.securityTools({ viewer: "member:boss" }).tools[0];
  assert.deepEqual([t.state, t.added_by, t.monthly_limit, t.handling_digest, t.handling], ["added", "boss", 100_000, digestOf("scanii"), PROVIDERS.find((d) => d.provider_id === "scanii").handling]);
  /* the vendor that keeps samples, confirmed; the default allowance */
  const s = await add({ providerId: "sophos-intelix", credentials: { client_id: "a", client_secret: "b" }, handlingDigest: digestOf("sophos-intelix"), confirmRetention: true, monthlyLimit: undefined });
  assert.equal(s.ok, true);
  assert.equal(w.fs.securityTools({ viewer: "member:boss" }).tools.find((x) => x.tool_id === s.tool_id).monthly_limit, DEEPER_CHECKS_PER_MONTH);
  /* a generic template, completed by the administrator's statement (its digest that of the statement) */
  const g = await w.tool("icap", { template: { host: "icap.example.org:1344" }, config: { engine_family: ["sophos"], handling: { recipient: "the organization" } }, use: "routine" });
  assert.ok(g);
  /* host and region are the spec's own fields, never config's: accepted beside the named settings, and held apart */
  const h = await add({ providerId: "cloudflare-intel", credentials: { api_token: "t" }, handlingDigest: digestOf("cloudflare-intel"), config: { account_id: "acc", region: "eu", host: "h.example.org" } });
  assert.equal(h.ok, true, JSON.stringify(h));
  const row1 = w.row("SELECT config, region, host FROM fs_tools WHERE tool_id = ?", h.tool_id);
  assert.deepEqual([JSON.parse(row1.config), row1.region, row1.host], [{ account_id: "acc" }, "eu", "h.example.org"]);
  assert.equal((await add({ config: { region: "eu1" } })).ok, true, "a tool that reads no setting takes its region");
});

test("R28 (T38): a generic template (icap) added with its host and its handling stated in config: host and region where the entry's config list names them are the spec's own fields and count as given, a required one absent answers CONFIG_MISSING naming it; HANDLING_NOT_SHOWN compares handlingDigest with the template entry's catalogue handling_digest, and the tool's own handling_digest is computed by this module from the handling so stated", async () => {
  const w = world();
  const cat = w.fs.securityToolCatalogue({ viewer: "member:boss" });
  const entry = cat.offered.find((d) => d.provider_id === "icap");
  assert.deepEqual(entry.config.filter((f) => f.required).map((f) => f.name), ["host", "engine_family", "handling"]);
  const stated = { recipient: "the organization", region: "our own rack", file_retention: "none kept", result_retention: "30 days" };
  const config = { engine_family: ["sophos"], handling: stated };
  const ok = { providerId: "icap", template: { host: "icap.example.org:1344" }, config, handlingDigest: entry.handling_digest, use: "routine", by: "boss" };
  const snap = () => JSON.stringify(w.tables());
  const before = snap();
  /* the digest of the stated handling is the tool's, not what the administrator was shown */
  const resolvedDigest = sha256HexSync(canonicalJson({ ...PROVIDERS.find((d) => d.provider_id === "icap").handling, ...stated }));
  assert.notEqual(resolvedDigest, entry.handling_digest);
  const wrong = await w.fs.securityToolAdd({ ...ok, handlingDigest: resolvedDigest });
  assert.deepEqual([wrong.code, wrong.handling_digest], ["HANDLING_NOT_SHOWN", entry.handling_digest]);
  assert.equal(snap(), before, "HANDLING_NOT_SHOWN wrote nothing");
  /* the template's host given in template.host, or in config: never CONFIG_MISSING */
  for (const over of [{}, { template: null, config: { ...config, host: "icap.example.org:1344" } }, { template: {}, config: { ...config, host: "icap.example.org" } }]) {
    const r = await w.fs.securityToolAdd({ ...ok, ...over });
    assert.equal(r.ok, true, JSON.stringify([over, r]));
    const t = w.fs.securityTools({ viewer: "member:boss" }).tools.find((x) => x.tool_id === r.tool_id);
    assert.deepEqual([t.state, t.use, t.handling_digest], ["added", "routine", resolvedDigest]);
    assert.deepEqual(t.handling, { ...PROVIDERS.find((d) => d.provider_id === "icap").handling, ...stated });
    const row = w.row("SELECT config, host FROM fs_tools WHERE tool_id = ?", r.tool_id);
    assert.deepEqual(JSON.parse(row.config), config, "host is held apart from config");
    assert.match(row.host, /^icap\.example\.org/);
  }
  /* the tool works under its host: the spec carries it */
  const id = await w.tool("icap", { template: { host: "icap.example.org:1344" }, config });
  const spec = w.calls("/provider/test").at(-1).body.tool;
  assert.deepEqual([spec.tool_id, spec.host, spec.config], [id, "icap.example.org:1344", config]);
});

test("R28 (T38): an entry that needs an address (splunk-hec) added with its host, and a region-keyed one (scanii) with its region, each read as the spec's own field and counted as given; absent, CONFIG_MISSING names host or region; an entry whose host is not required (opswat-deep-cdr) is added without one", async () => {
  const w = world();
  const cat = w.fs.securityToolCatalogue({ viewer: "member:boss" });
  const digest = (id) => cat.offered.find((d) => d.provider_id === id).handling_digest;
  const required = (id) => cat.offered.find((d) => d.provider_id === id).config.filter((f) => f.required).map((f) => f.name);
  assert.deepEqual(required("splunk-hec"), ["host"]);
  assert.deepEqual(required("scanii"), ["region"]);
  assert.deepEqual(required("opswat-deep-cdr"), ["region"]);
  const splunk = { providerId: "splunk-hec", credentials: { hec_token: "t" }, handlingDigest: digest("splunk-hec"), by: "boss" };
  const before = JSON.stringify(w.tables());
  for (const config of [{}, { host: "" }, { host: "  " }, null]) {
    const r = await w.fs.securityToolAdd({ ...splunk, config });
    assert.deepEqual([r.code, r.field], ["CONFIG_MISSING", "host"], JSON.stringify(config));
  }
  const scanii = { providerId: "scanii", credentials: { api_key: "k", api_secret: "s" }, handlingDigest: digest("scanii"), by: "boss" };
  const nr = await w.fs.securityToolAdd({ ...scanii, config: {} });
  assert.deepEqual([nr.code, nr.field], ["CONFIG_MISSING", "region"]);
  assert.equal(JSON.stringify(w.tables()), before, "each refusal wrote nothing");
  const s = await w.fs.securityToolAdd({ ...splunk, config: { host: "splunk.example.org:8088" } });
  assert.deepEqual(s, { ok: true, tool_id: s.tool_id, state: "added" });
  const sr = w.row("SELECT config, host, region FROM fs_tools WHERE tool_id = ?", s.tool_id);
  assert.deepEqual([JSON.parse(sr.config), sr.host, sr.region], [{}, "splunk.example.org:8088", null]);
  const c = await w.fs.securityToolAdd({ ...scanii, config: { region: "eu1" } });
  assert.equal(c.ok, true);
  const cr = w.row("SELECT config, host, region FROM fs_tools WHERE tool_id = ?", c.tool_id);
  assert.deepEqual([JSON.parse(cr.config), cr.host, cr.region], [{}, null, "eu1"]);
  /* the spec carries them as its own fields */
  await w.fs.securityToolTest({ toolId: s.tool_id, by: "boss" });
  await w.fs.securityToolTest({ toolId: c.tool_id, by: "boss" });
  const specs = w.calls("/provider/test").map((x) => x.body.tool);
  assert.deepEqual([specs[0].host, specs[0].config], ["splunk.example.org:8088", {}]);
  assert.deepEqual([specs[1].region, specs[1].config], ["eu1", {}]);
  const o = await w.fs.securityToolAdd({ providerId: "opswat-deep-cdr", credentials: { api_key: "k" }, handlingDigest: digest("opswat-deep-cdr"), config: { region: "cloud" }, by: "boss" });
  assert.equal(o.ok, true, JSON.stringify(o));
});

test("R29: `securityToolTest` runs file-scanner's /provider/test with the tool's spec; passed sets on and tested_at, otherwise test_failed with the detail and the tool stays off; a tool is used only while on", async () => {
  const w = world({ scan: { test: { "joe-sandbox": { passed: false, detail: "the EICAR test file did not answer found" } } } });
  const add = async (id, creds) => w.fs.securityToolAdd({ providerId: id, credentials: creds, handlingDigest: digestOf(id), by: "boss",
                                                           config: id === "scanii" ? { region: "eu1" } : {} });
  const a = await add("scanii", { api_key: "k", api_secret: "s" });
  const b = await add("joe-sandbox", { api_key: "k" });
  assert.equal((await w.fs.securityToolTest({ toolId: a.tool_id, by: "m1" })).code, "NOT_AN_ADMIN");
  assert.equal((await w.fs.securityToolTest({ toolId: "nope", by: "boss" })).code, "NO_SUCH_TOOL");
  /* added, not yet tested: never used */
  const s = await w.capture(pdf(true, "t"));
  assert.equal(w.fs.requestDeeperCheck({ captureSha: s, viewer: "member:m1" }).code, "NO_OUTSIDE_TOOL");
  const ta = await w.fs.securityToolTest({ toolId: a.tool_id, by: "boss" });
  assert.deepEqual([ta.ok, ta.state, ta.passed, ta.detail], [true, "on", true, "the EICAR test file answered found"]);
  assert.equal(w.calls("/provider/test")[0].body.tool.tool_id, a.tool_id);
  assert.deepEqual(Object.keys(w.calls("/provider/test")[0].body), ["tool"]);
  const tb = await w.fs.securityToolTest({ toolId: b.tool_id, by: "boss" });
  assert.deepEqual([tb.state, tb.passed, tb.detail], ["test_failed", false, "the EICAR test file did not answer found"]);
  const tools = w.fs.securityTools({ viewer: "member:boss" }).tools;
  assert.ok(tools.find((t) => t.tool_id === a.tool_id).tested_at);
  assert.equal(tools.find((t) => t.tool_id === b.tool_id).state, "test_failed");
  /* only the tool that is on runs in a deeper check */
  w.fs.requestDeeperCheck({ captureSha: s, viewer: "member:m1" });
  await w.fs.deeperBatch({});
  assert.equal(w.calls("/provider/sandbox").length, 0);
  assert.equal(w.calls("/provider/scan").length, 1);
  /* no scanner bound: nothing can be tested */
  const n = world({ bound: false });
  const na = await n.fs.securityToolAdd({ providerId: "scanii", config: { region: "eu1" }, credentials: { api_key: "k", api_secret: "s" }, handlingDigest: digestOf("scanii"), by: "boss" });
  assert.equal((await n.fs.securityToolTest({ toolId: na.tool_id, by: "boss" })).code, "SCANNER_ABSENT");
});

test("R30: `securityToolRemove` sets the tool removed, removes its credentials (credentials' set with no key) and keeps its notes; a removed tool is never called again; unknown ids answer NO_SUCH_TOOL", async () => {
  const w = world({ scan: { provider: { "metadefender-core": () => [{ engine: "avira", result: "clean" }] } } });
  const id = await w.tool("metadefender-core", { use: "routine", config: { host: "md.example.org" } });
  const s = await w.capture(pdf(false, "x"));
  await w.fs.scanBatch({});
  const notes = w.fs.verdictNotes({ captureSha: s }).notes.filter((n) => n.tool === "metadefender-core");
  assert.equal(notes.length, 1);
  assert.equal((await w.fs.securityToolRemove({ toolId: id, by: "m1" })).code, "NOT_AN_ADMIN");
  assert.deepEqual(await w.fs.securityToolRemove({ toolId: id, by: "boss" }), { ok: true, tool_id: id, state: "removed" });
  assert.equal(keyed(w).some((k) => k.service === `security:${id}`), false, "its credentials are removed");
  assert.deepEqual(w.fs.verdictNotes({ captureSha: s }).notes.filter((n) => n.tool === "metadefender-core"), notes, "its notes are kept");
  await w.capture(pdf(false, "y"));
  w.tick(8 * 86_400_000);
  await w.fs.scanBatch({});
  assert.equal(w.calls("/provider/scan").length, 1, "never called again");
  assert.equal((await w.fs.securityToolTest({ toolId: id, by: "boss" })).code, "NO_SUCH_TOOL");
  assert.equal((await w.fs.securityToolRemove({ toolId: id, by: "boss" })).code, "NO_SUCH_TOOL");
  assert.equal((await w.fs.securityToolRemove({ toolId: "nope", by: "boss" })).code, "NO_SUCH_TOOL");
});

test("R31: a tool answering PRIVATE_MODE_NOT_HONOURED is set off with off_reason; `securityToolEvents({after, limit, viewer})` (administrators) answers {ok, events: [{tool_id, event, at, reason}], cursor, truncated}, one per switch off, test, add and removal, in order, after `after`, at most `limit` (default 200, clamped to 1–1,000); `reason` the off_reason for a switch off, else null; `cursor` the last event answered when more follow, else null; no file is named in an event", async () => {
  const w = world({ scan: { provider: { "metadefender-core": () => ({ code: "PRIVATE_MODE_NOT_HONOURED" }) } } });
  const id = await w.tool("metadefender-core", { use: "routine", config: { host: "md.example.org" } });
  const other = await w.tool("scanii");
  const s = await w.capture(pdf(false, "pm"));
  await w.fs.scanBatch({});
  const t = w.fs.securityTools({ viewer: "member:boss" }).tools.find((x) => x.tool_id === id);
  assert.deepEqual([t.state, t.off_reason], ["off", "PRIVATE_MODE_NOT_HONOURED"]);
  await w.fs.securityToolRemove({ toolId: other, by: "boss" });
  assert.equal(w.fs.securityToolEvents({ viewer: "member:m1" }).code, "NOT_AN_ADMIN");
  const e = w.fs.securityToolEvents({ viewer: "member:boss" });
  assert.deepEqual(e.events.map((x) => [x.tool_id, x.event]), [[id, "added"], [id, "test_passed"], [other, "added"], [other, "test_passed"], [id, "switched_off"], [other, "removed"]]);
  for (const x of e.events) assert.deepEqual(Object.keys(x).sort(), ["at", "event", "reason", "tool_id"]);
  assert.deepEqual(e.events.map((x) => x.reason), [null, null, null, null, "PRIVATE_MODE_NOT_HONOURED", null]);
  assert.deepEqual([e.ok, e.cursor, e.truncated], [true, null, false], "nothing follows: the cursor is null");
  assert.doesNotMatch(JSON.stringify(e), new RegExp(s.slice(0, 12)));
  const p = w.fs.securityToolEvents({ viewer: "member:boss", limit: 4 });
  assert.deepEqual([p.events.length, p.truncated, p.cursor], [4, true, String(w.rows("SELECT seq FROM fs_tool_events ORDER BY seq")[3].seq)]);
  const p2 = w.fs.securityToolEvents({ viewer: "member:boss", after: p.cursor });
  assert.deepEqual([p2.events.length, p2.cursor, p2.truncated], [2, null, false]);
  for (const [limit, n] of [[0, 1], [-3, 1], [1, 1], ["x", 6], [null, 6], [5000, 6]]) assert.equal(w.fs.securityToolEvents({ viewer: "member:boss", limit }).events.length, n, String(limit));
  /* off, it is not used again until tested on */
  await w.capture(pdf(false, "pm2"));
  const before = w.calls("/provider/scan").length;
  await w.fs.scanBatch({});
  assert.equal(w.calls("/provider/scan").length, before);
  /* a test after a switch off: an event with no reason, and the tool's off_reason cleared */
  await w.fs.securityToolTest({ toolId: id, by: "boss" });
  const last = w.fs.securityToolEvents({ viewer: "member:boss" }).events.at(-1);
  assert.deepEqual([last.tool_id, last.event, last.reason], [id, "test_passed", null]);
});

test("R32 (K1949): a tool's use is on_request (the default) or routine; on_request scan and sandbox tools run only in a deeper check and on_request CDR tools only on a member's ask; routine is accepted only for a tool whose recipient is the organization (its own servers)", async () => {
  const w = world();
  /* the catalogue's own-servers tools take routine use; vendor-run ones do not */
  for (const d of PROVIDERS.filter((x) => x.kinds.includes("scan") && !x.template)) {
    const r = await w.fs.securityToolAdd({ providerId: d.provider_id, credentials: Object.fromEntries(d.credentials.map((n) => [n, "v"])),
      handlingDigest: digestOf(d.provider_id), confirmRetention: true, use: "routine", by: "boss",
      config: { host: "h.example.org", ...Object.fromEntries(d.config.filter((f) => f.required).map((f) => [f.name, "v"])) } });
    assert.equal(r.ok === true, ["metadefender-core", "defender-storage"].includes(d.provider_id), d.provider_id);
    if (!r.ok) assert.equal(r.code, "USE_NOT_ALLOWED");
  }
  assert.equal(onOwnServers("the organization"), true);
  assert.equal(onOwnServers("the organization's own MetaDefender Core server"), true);
  assert.equal(onOwnServers("Microsoft (the organization's own Azure storage account)"), true);
  assert.equal(onOwnServers("OPSWAT, Inc. (Cloud), or the organization's own Core server"), false);
  assert.equal(onOwnServers("Uva Software, LLC"), false);
  /* the default is on_request, which no scan batch uses and no capture queues a copy for */
  const v = world();
  const a = await v.tool("scanii");
  const c = await v.tool("glasswall-halo", { config: { host: "halo.example.org" } });
  assert.deepEqual(v.fs.securityTools({ viewer: "member:boss" }).tools.map((t) => t.use), ["on_request", "on_request"]);
  const s = await v.capture(pdf(false, "o"));
  await v.fs.scanBatch({});
  await v.fs.renderBatch({});
  assert.deepEqual([v.calls("/provider/scan").length, v.calls("/provider/cdr").length], [0, 0]);
  assert.equal(v.rows("SELECT * FROM fs_copies").length, 0);
  v.fs.requestDeeperCheck({ captureSha: s, viewer: "member:m1" });
  await v.fs.deeperBatch({});
  assert.equal(v.calls("/provider/scan").length, 1, "in a deeper check");
  await v.fs.requestSafeCopy({ captureSha: s, viewer: "member:m1" });
  assert.equal(v.calls("/provider/cdr").length, 1, "on a member's ask");
  assert.ok(a && c);
});

test("R34: `reputationTool()` answers the tool spec of the first on url_reputation tool, with its credentials, or null; an in-plane call reached by no route", async () => {
  const w = world();
  assert.equal(await w.fs.reputationTool(), null);
  const id = await w.tool("cloudflare-intel", { credentials: { api_token: "cf-token" }, config: { account_id: "acc-1" } });
  const spec = await w.fs.reputationTool();
  assert.deepEqual(spec, { provider_id: "cloudflare-intel", tool_id: id, config: { account_id: "acc-1" }, credentials: { api_token: "cf-token" },
                           handling_confirmed: false, monthly_limit_left: DEEPER_CHECKS_PER_MONTH });
  await w.fs.securityToolRemove({ toolId: id, by: "boss" });
  assert.equal(await w.fs.reputationTool(), null);
  const { fileSafetyOps } = await import("../../../src/file-safety/index.mjs");
  const ops = Object.keys(fileSafetyOps(w.fs, new URL("http://x/"), null, w.env));
  assert.equal(ops.some((o) => /reputation/.test(o)), false, "no route reaches it");
});

test("R35: `forwardSecurityCounts` builds one counts record for the period, its keys exactly LOG_COUNT_KINDS (this module's and credentials' R44's, summed over countries), and sends it to every on log tool; it answers {ok, sent, failed}; a figure that could not be read is sent as absent, never as zero", async () => {
  const w = world({ scan: { clamav: (s) => (s === sha(pdf(false, "f")) ? { result: "found", findings: ["X.Y.Z"] } : { result: "clean" }), forward: (b) => (b.tool.provider_id === "elastic" ? { ok: false, code: "SERVICE_REFUSED" } : { ok: true, sent_at: "x" }) } });
  const a = await w.tool("splunk-hec", { config: { host: "splunk.example.org" } });
  const b = await w.tool("elastic", { config: { host: "es.example.org" } });
  await w.capture(pdf(false, "f")); await w.capture(pdf(false, "g"));
  await w.fs.scanBatch({});
  w.fs.releaseScanHold({ captureSha: sha(pdf(false, "f")), by: "m1", reason: "a" });
  w.fs.releaseScanHold({ captureSha: sha(pdf(false, "f")), by: "m2", reason: "b" });
  await w.fs.renderBatch({});
  await w.fs.safeView({ captureSha: sha(pdf(false, "g")), viewer: "member:m1" });
  for (const [kind, country] of [["signin", "US"], ["signin", "FR"], ["rate", null], ["handover", "US"]]) w.credentials.securityCount({ kind, country });
  const from = new Date(Math.min(T0, Date.now()) - 3_600_000).toISOString(), to = new Date(Math.max(T0, Date.now()) + 3_600_000).toISOString();
  const r = await w.fs.forwardSecurityCounts({ from, to });
  assert.deepEqual([r.ok, r.sent, r.failed], [true, [a], [{ tool_id: b, code: "SERVICE_REFUSED" }]]);
  const sent = w.calls("/provider/forward").map((c) => c.body);
  assert.equal(sent.length, 2, "to every on log tool");
  const record = sent[0].record;
  assert.deepEqual(Object.keys(record), ["period", "counts"]);
  assert.deepEqual(Object.keys(record.counts), [...LOG_COUNT_KINDS]);
  assert.deepEqual(record.counts, { files_scanned: 2, files_found: 1, holds_placed: 1, holds_released: 1, deeper_checks: 0, sandbox_submissions: 0,
                                    safe_views: 1, safe_copies: 0, reputation_listed: 0, signin: 2, credential: 0, rate: 1, handover: 1, through: 0 });
  assert.deepEqual(Object.keys(sent[0]).sort(), ["record", "tool"]);
  /* a period that names none */
  for (const [f, t] of [["x", to], [to, from], [null, to], [from, undefined]]) assert.equal((await w.fs.forwardSecurityCounts({ from: f, to: t })).code, "FORWARD_PERIOD_INVALID");
  /* figures that cannot be read are absent: credentials' totals refused, and this module's counts unreadable */
  const fs2 = new FileSafety({ sql: w.st.sql, record: w.record, membership: w.membership, provenance: w.prov, acquisition: w.acq, env: w.env, now: () => w.clock.now,
    credentials: { securityTotals: () => ({ ok: false, code: "SECURITY_COUNTS_UNREADABLE" }), keyedServiceFor: (x) => w.credentials.keyedServiceFor(x) } });
  await fs2.forwardSecurityCounts({ from, to });
  assert.deepEqual(Object.keys(w.calls("/provider/forward").at(-1).body.record.counts), LOG_COUNT_KINDS.slice(0, 9));
  w.exec("DROP TABLE fs_counts");
  await fs2.forwardSecurityCounts({ from, to });
  assert.deepEqual(w.calls("/provider/forward").at(-1).body.record.counts, {}, "absent, never zero");
});

test("R35 (T37): called with neither from nor to, it forwards from the end of the last period it forwarded with ok (never more than 24 hours back; at the first, the start of the previous whole UTC hour) to the start of the current whole UTC hour, keeps that end when it answers ok, and answers {ok, sent: [], failed: [], record: null} for an empty period, so no period is sent twice", async () => {
  const HOUR = 3_600_000;
  const w = world({ scan: { forward: (b) => (b.tool.provider_id === "elastic" ? { ok: false, code: "SERVICE_REFUSED" } : { ok: true, sent_at: "x" }) } });
  const a = await w.tool("splunk-hec", { config: { host: "splunk.example.org" } });
  const b = await w.tool("elastic", { config: { host: "es.example.org" } });
  const period = () => w.calls("/provider/forward").at(-1).body.record.period;
  const sends = () => w.calls("/provider/forward").length;
  /* the first, at 12:30: the previous whole hour, 11:00 to 12:00 */
  w.clock.now = T0 + HOUR / 2;
  await w.capture(pdf(false, "c")); await w.fs.scanBatch({});
  const r1 = await w.fs.forwardSecurityCounts({});
  assert.deepEqual([r1.ok, r1.sent, r1.failed], [true, [a], [{ tool_id: b, code: "SERVICE_REFUSED" }]]);
  assert.deepEqual(period(), { from: new Date(T0 - HOUR).toISOString(), to: new Date(T0).toISOString() });
  assert.equal(r1.record.counts.files_scanned, 0, "12:00's scan is not in 11:00–12:00");
  /* the same hour again: the period is empty, nothing is sent */
  const n = sends();
  assert.deepEqual(await w.fs.forwardSecurityCounts({}), { ok: true, sent: [], failed: [], record: null });
  assert.equal(sends(), n, "no period is sent twice");
  /* at 13:05: 12:00 to 13:00, holding 12:30's scan; one tool failing does not keep the period back */
  w.clock.now = T0 + HOUR + 300_000;
  const r2 = await w.fs.forwardSecurityCounts({ from: null, to: null });
  assert.deepEqual(period(), { from: new Date(T0).toISOString(), to: new Date(T0 + HOUR).toISOString() });
  assert.equal(r2.record.counts.files_scanned, 1);
  /* a period named by the caller forwards it and keeps nothing */
  await w.fs.forwardSecurityCounts({ from: new Date(T0 - 5 * HOUR).toISOString(), to: new Date(T0 - 4 * HOUR).toISOString() });
  /* three days later: never more than 24 hours back */
  w.clock.now = T0 + 3 * 24 * HOUR + 600_000;
  await w.fs.forwardSecurityCounts({});
  const to = Math.floor(w.clock.now / HOUR) * HOUR;
  assert.deepEqual(period(), { from: new Date(to - 24 * HOUR).toISOString(), to: new Date(to).toISOString() });
  /* the kept end survives a restart: a new instance on the same storage reads it */
  const { FileSafety } = await import("../../../src/file-safety/index.mjs");
  const again = new FileSafety({ sql: w.st.sql, record: w.record, membership: w.membership, credentials: w.credentials, provenance: w.prov,
                                 acquisition: w.acq, env: w.env, now: () => w.clock.now });
  assert.deepEqual(await again.forwardSecurityCounts({}), { ok: true, sent: [], failed: [], record: null });
  w.tick(HOUR);
  await again.forwardSecurityCounts({});
  assert.deepEqual(period(), { from: new Date(to).toISOString(), to: new Date(to + HOUR).toISOString() });
  /* an end that cannot be kept never fails the forward it belongs to */
  w.exec("DROP TABLE fs_wakes");
  w.tick(HOUR);
  const lost = await again.forwardSecurityCounts({});
  assert.deepEqual([lost.ok, lost.sent], [true, [a]]);
});

test("R41: `refreshReputationLists({at})`, reached by no route, asks file-scanner's /provider/refresh for each on url_reputation tool with that tool's spec and credentials and nothing else, and answers {ok, refreshed: [{tool_id, list_version, fetched_at}], failed: [{tool_id, code}], skipped: [tool_id]}; a tool answering NO_LOCAL_LIST is skipped and not asked again until tested again; a failed refresh is named; with no scanner bound SCANNER_ABSENT, asking nothing; it writes no note, names no file, address or member, and never throws", async () => {
  /* no scanner bound */
  const n = world({ bound: false });
  const na = await n.fs.refreshReputationLists({ at: new Date(T0).toISOString() });
  assert.deepEqual({ ok: na.ok, code: na.code, check: na.check }, { ok: false, code: "SCANNER_ABSENT", check: FILE_SAFETY_CHECKS.SCANNER_ABSENT.check });
  let gwr = { ok: true, list_version: "abc123", fetched_at: "2026-10-08T12:00:00.000Z" };
  const w = world({ scan: { refresh: { "cloudflare-intel": () => ({ ok: false, code: "NO_LOCAL_LIST" }), "google-web-risk": () => gwr } } });
  assert.deepEqual(await w.fs.refreshReputationLists({}), { ok: true, refreshed: [], failed: [], skipped: [] }, "no tool on: nothing asked");
  assert.equal(w.calls("/provider/refresh").length, 0);
  const cf = await w.tool("cloudflare-intel", { credentials: { api_token: "cf-token" }, config: { account_id: "acc-1" } });
  const g = await w.tool("google-web-risk", { credentials: { api_key: "gwr-key" } });
  await w.tool("scanii");
  const s = await w.capture(pdf(false, "rep"), { address: "https://secret-host.example/x.pdf" });
  const notes = w.rows("SELECT * FROM fs_notes").length;
  const r1 = await w.fs.refreshReputationLists({ at: new Date(T0).toISOString() });
  assert.deepEqual(r1, { ok: true, refreshed: [{ tool_id: g, list_version: "abc123", fetched_at: "2026-10-08T12:00:00.000Z" }], failed: [], skipped: [cf] });
  const calls = w.calls("/provider/refresh");
  assert.deepEqual(calls.map((c) => c.body.tool.tool_id), [cf, g], "each on url_reputation tool, scanii not");
  for (const c of calls) assert.deepEqual(Object.keys(c.body), ["tool"], "the tool's spec and nothing else");
  assert.deepEqual([calls[0].body.tool.credentials, calls[0].body.tool.config], [{ api_token: "cf-token" }, { account_id: "acc-1" }]);
  assert.deepEqual(calls[1].body.tool.credentials, { api_key: "gwr-key" });
  assert.doesNotMatch(JSON.stringify(calls), new RegExp(`${s.slice(0, 12)}|secret-host|boss|m1`), "no file, address or member");
  /* the tool with no local list is not asked again until it is tested again */
  gwr = { ok: false, list_version: "abc123", fetched_at: "2026-10-08T12:00:00.000Z", error: "LIST_CHECKSUM_MISMATCH:THREAT" };
  const r2 = await w.fs.refreshReputationLists({});
  assert.deepEqual(r2, { ok: true, refreshed: [], failed: [{ tool_id: g, code: "LIST_CHECKSUM_MISMATCH:THREAT" }], skipped: [cf] }, "a failed refresh is named");
  assert.deepEqual(w.calls("/provider/refresh").slice(2).map((c) => c.body.tool.tool_id), [g]);
  await w.fs.securityToolTest({ toolId: cf, by: "boss" });
  await w.fs.refreshReputationLists({});
  assert.deepEqual(w.calls("/provider/refresh").slice(3).map((c) => c.body.tool.tool_id), [cf, g], "tested again: asked again");
  /* a tool off or removed is not asked; credentials that cannot be read are named */
  await w.fs.securityToolRemove({ toolId: cf, by: "boss" });
  w.exec("DELETE FROM keyed_services WHERE service = ?", `security:${g}`);
  const r3 = await w.fs.refreshReputationLists({});
  assert.deepEqual(r3, { ok: true, refreshed: [], failed: [{ tool_id: g, code: "CREDENTIALS_UNAVAILABLE" }], skipped: [] });
  assert.equal(w.rows("SELECT * FROM fs_notes").length, notes, "it writes no note");
  /* in-plane only: no route reaches it; and it never throws */
  const { fileSafetyOps } = await import("../../../src/file-safety/index.mjs");
  assert.equal(Object.keys(fileSafetyOps(w.fs, new URL("http://x/"), null, w.env)).some((o) => /refresh|reputation/.test(o)), false);
  w.exec("DROP TABLE fs_tools");
  assert.deepEqual(await w.fs.refreshReputationLists({}), { ok: true, refreshed: [], failed: [], skipped: [] });
});
