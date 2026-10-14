/* Settings › Security at the module's interface (R15). */
import test from "node:test";
import assert from "node:assert/strict";
import { acts, all, has, lacks, open, panelOf, said } from "./kit.mjs";
import { ADMIN, MEMBER, env, securityTable, CATALOGUE_ENTRY } from "./fixtures.mjs";

const ops = (o) => [...new Set(acts(o.tree).map((b) => b.attrs["data-act"]))].sort();

test("R15 security: an administrator's screen; any other member is told only that it is administrators', and nothing is read", async () => {
  const m = await open("security", { me: MEMBER, table: securityTable() });
  has(m, "screen.security.admins");
  assert.deepEqual(m.p.requests, []);
  assert.deepEqual(ops(m), []);
});

test("R15 the level for the period chosen, by kind against its usual, naming no address, country, role or member", async () => {
  const a = await open("security", { me: ADMIN, table: securityTable() });
  const q = a.p.requests.find((r) => r.op === "securitymap").query;
  assert.equal(Date.parse(q.to) - Date.parse(q.from), 7 * 86400000, "the last seven days by default");
  has(a, "screen.security.level.raised");
  assert.ok(!a.text.includes("XX-SENTINEL-COUNTRY"), "no country drawn");
  const r = await a.press("securitymap", { values: { "se-from": "2026-10-01", "se-to": "2026-10-10" } });
  assert.deepEqual(r.sent[0].query, { from: "2026-10-01T00:00:00.000Z", to: "2026-10-11T00:00:00.000Z" });
  assert.deepEqual(a.p.requests.filter((x) => x.op === "securitymap").at(-1).query, { from: "2026-10-01T00:00:00.000Z", to: "2026-10-11T00:00:00.000Z" }, "read again for that period");
  assert.deepEqual((await a.press("securitymap", { values: { "se-from": "2026-10-10", "se-to": "2026-10-01" } })).sent, []);
});

test("R15 what is built in is said only as part_scanner and part_safe_view answer it", async () => {
  const on = await open("security", { me: ADMIN, table: securityTable() });
  has(on, "instance.part.scanner.present");
  lacks(on, "instance.scanner.absent.step");
  const off = await open("security", { me: ADMIN, table: securityTable({ bootstrap: { ok: true, part_signin: true, part_scanner: false, part_safe_view: false } }) });
  has(off, "instance.part.scanner.absent");
  has(off, "instance.scanner.absent.step");
  lacks(off, "instance.part.scanner.present");
  assert.ok(!off.text.includes(said("screen.security.queue", { queued: 3, held: 1 })), "no sentence of scanning while no scanner");
  const unread = await open("security", { me: ADMIN, table: securityTable({ bootstrap: { ok: true, part_scanner: null, part_safe_view: null } }) });
  has(unread, "instance.part.unknown", { part: said("screen.security.part.scanner") });
});

test("R15 securitytooladd asks only the entry's config by its labels, its credentials in the body only, confirms the vendor's keeping, sends the handling's digest; then tests it and says whether it is on", async () => {
  const a = await open("security", { me: ADMIN, table: securityTable() });
  const panel = panelOf(a.tree, "acme-scan");
  assert.ok(said("screen.security.h.files") && a.text.includes("30 days"));
  assert.equal(all(panel, (e) => e.tag === "input" && /^sa-acme-scan-c-/.test(e.attrs.id || "")).length, 2, "only what its config lists");
  assert.equal(all(panel, (e) => e.attrs.id === "sa-acme-scan-every").length, 0, "every file only for a tool on the organization's own servers");
  assert.equal(all(panelOf(a.tree, "own-scan"), (e) => e.attrs.id === "sa-own-scan-every").length, 1);
  const KEY = "SENTINEL-TOOL-KEY";
  const r = await a.press("securitytooladd", { data: { provider: "acme-scan" }, values: { "sa-acme-scan-c-region": "eu", "sa-acme-scan-k-api_key": KEY, "sa-acme-scan-keep": true } });
  assert.deepEqual(r.sent[0].body, { providerId: "acme-scan", config: { region: "eu" }, credentials: { api_key: KEY }, handlingDigest: CATALOGUE_ENTRY.handling_digest, confirmRetention: true, use: "on_request" });
  assert.deepEqual(r.sent[1].op === "securitytooltest" && r.sent[1].body, { toolId: "T2" });
  has(a, "screen.security.tested.on");
  assert.ok(!a.html.includes(KEY) && a.b.requests.filter((x) => JSON.stringify(x).includes(KEY)).length === 1, "the credentials never drawn or sent again");
  const missing = await a.press("securitytooladd", { data: { provider: "acme-scan" }, values: { "sa-acme-scan-c-region": "", "sa-acme-scan-k-api_key": "k" } });
  assert.deepEqual(missing.sent, []);
  const own = await a.press("securitytooladd", { data: { provider: "own-scan" }, values: { "sa-own-scan-every": true } });
  assert.equal(own.sent[0].body.use, "routine");
  const fails = await open("security", { me: ADMIN, table: securityTable({ securitytooltest: (q, b) => env({ ok: true, tool_id: b.toolId, state: "test_failed", passed: false, detail: "the key was refused" }) }) });
  await fails.press("securitytooladd", { data: { provider: "own-scan" }, values: {} });
  has(fails, "screen.security.tested.off", { detail: "the key was refused" });
});

test("R15 securitytooltest and securitytoolremove from the tool's row panel; a refusal in file-safety's words", async () => {
  const a = await open("security", { me: ADMIN, table: securityTable() });
  for (const op of ["securitytooltest", "securitytoolremove"]) assert.ok(acts(panelOf(a.tree, "T1")).some((b) => b.attrs["data-act"] === op), op);
  assert.deepEqual((await a.press("securitytoolremove", { data: { tool: "T1" } })).sent[0].body, { toolId: "T1" });
  const r = await open("security", { me: ADMIN, table: securityTable({ securitytooltest: env({ ok: false, reason: "SCANNER_ABSENT", code: "SCANNER_ABSENT", translation: "file-safety's words" }) }) });
  await r.press("securitytooltest", { data: { tool: "T1" } });
  assert.equal(r.refused.text, "file-safety's words");
});
