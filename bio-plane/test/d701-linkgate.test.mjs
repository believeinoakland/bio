/* D-701 — op=links AND op=navchanges ANSWER THROUGH THE VIEWER.
 *
 * BOB #35 ruled (2026-09-25 09:30Z, on SCHEDULER #23's question): a capture sha or page address belonging to a
 * bundle the caller cannot read discloses that the bundle exists and what it holds — the leak
 * MEMBER-KNOWLEDGE-DESIGN.md §5 closes for the lead (a caller who cannot see receives exactly the answer a
 * nonexistent row would give). So both ops pass every row through the viewer predicate BEFORE grouping or
 * counting, and no count includes a row the viewer cannot see.
 *
 * Before this landing both ops took no viewer at all: `Store#linksTo` listed every capture that links to an
 * address, `Store#resolveLinks` answered any capture's links and named each target's capture AND ITS BUNDLE,
 * and `Store#navChanges` sequenced every capture of a host with its page — so dave, a member of no project,
 * read carol's project's capture sha, the address it was captured at, its project's id, and counts that moved
 * with it.
 *
 * WHAT A CAPTURE'S VISIBILITY IS: `register` files a capture in ONE bundle, and the capture is seen exactly
 * when that bundle is (`#bundleGate`, the one compilation point). A capture filed in NO bundle (acquired and
 * never promoted) names no bundle and so discloses none — `#bundleGate`'s own NULL arm — and stays visible;
 * that arm is asserted below as the over-strictness control. An absent viewer sees nothing (fail closed).
 *
 * The fixture, one host:
 *   /shared1.html  nav [A, B], body -> /secret.html, /target.html         filed in INFO (open)
 *   /secret.html   nav [A, B] (same navigation), body -> /target.html,    filed in carol's PROJECT
 *                  /only-secret.html
 *   /shared2.html  nav [A] (lost B), body -> /target.html                 filed in INFO (open)
 *   /loose.html    no nav, body -> /target.html                           acquired, filed in NO bundle
 *
 * NEGATIVE CONTROL: (run 2026-09-25, D-701 worker) four arms, each ALONE, restored by cp from pristine copies and
 * verified by sha256 AND cmp (store.mjs 11bd1455... 3,489,808 bytes; index.mjs 34e533e8... 890,067 bytes); BASELINE
 * 30 pass 0 fail. Before the fix the same suite read 13 pass 17 fail: the leak, reproduced through both ops.
 * (a) DROP THE FILTER: `#captureGate` answers 1=1 for every non-DENY viewer -> 16 pass 14 fail, by name, among them
 * "an outsider sees the three sources outside the project, the unfiled one included", "a hidden capture's links
 * answer EXACTLY as a capture the record does not hold", "an outsider reads that link as one whose target the record
 * does not hold", "an outsider's sequence holds only what they may see", "and ONE for the outsider: no count moves
 * with a row they cannot see", and all three "nothing of the secret capture is in the outsider's answer".
 * (b) DROP THE STAMP: index.mjs sends no viewer on the three store calls -> 11 pass 19 fail: every viewer's answer
 * EMPTY, the machine credential's and the owner's included — the store fails CLOSED, an outage and never a leak (the
 * three leak guards stay GREEN, as declared). (c) SERVE THE STORED ROLL-UP: navChanges reads a record's
 * first/last/captures from `site_chrome` -> 28 pass 2 fail: "and ONE for the outsider: no count moves with a row they
 * cannot see", "its interval is the outsider's too". (d) OVER-STRICT: a capture filed in NO bundle is hidden too ->
 * 27 pass 3 fail: "the project's owner sees all four", "an outsider sees the three sources outside the project, the
 * unfiled one included", "and the COUNT is of what the outsider sees, not of what exists".
 */
import "./stdio.mjs";                 /* D-282: a suite's own exit must not discard the suite's own output */
import "./sandbox.mjs"; /* D-186: owns $TMPDIR for this process and removes it on exit */
import { Miniflare } from "miniflare";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { normalizeAddress } from "../src/subresources.mjs";

const SRC = fileURLToPath(new URL("../src/index.mjs", import.meta.url));

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${JSON.stringify(want)}\n         got  ${JSON.stringify(got)}`}`);
  ok ? pass++ : fail++;
};
const sha = (v) => createHash("sha256").update(v).digest("hex");

const HOST = "www.d701.example";
const U = (p) => `https://${HOST}${p}`;
const N = (p) => normalizeAddress(U(p));
const NAV_AB = `<nav><a href="/dept/a.html">A</a> <a href="/dept/b.html">B</a></nav>`;
const PAGES = {
  "/shared1.html": `<!doctype html><html><body>${NAV_AB}<main><a href="/secret.html">s</a> <a href="/target.html">t</a></main></body></html>`,
  "/secret.html": `<!doctype html><html><body>${NAV_AB}<main><a href="/target.html">t</a> <a href="/only-secret.html">o</a></main></body></html>`,
  "/shared2.html": `<!doctype html><html><body><nav><a href="/dept/a.html">A</a></nav><main><a href="/target.html">t</a></main></body></html>`,
  "/loose.html": `<!doctype html><html><body><main><a href="/target.html">t</a></main></body></html>`,
};

const mf = new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: SRC, script: readFileSync(SRC, "utf8"),
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
  r2Buckets: ["CAPTURES", "PUBLISHED"],
  bindings: { ADMIN_TOKEN: "adm-d701", MEMBER_TOKEN: "mem-d701", PROBE_TOKEN: "prb-d701", VERSION: "test",
              GOVERNOR_APPETITE_PER_MIN: "600000", GOVERNOR_SUBRESOURCE_STAGGER_MS: "0" },
  outboundService(request) {
    const u = new URL(request.url);
    if (u.hostname !== HOST || !PAGES[u.pathname]) return new Response("nope", { status: 404 });
    return new Response(PAGES[u.pathname], { headers: { "content-type": "text/html" } });
  },
});
const api = async (q, body) => (await mf.dispatchFetch(`http://x/api/?${q}`,
  body ? { method: "POST", body: JSON.stringify(body) } : {})).json();

/* ------------------------------------------------------------------ fixture */

const member = async (id, caps, role = "member") => {
  const add = await api("op=memberadd&token=adm-d701", { memberId: id, cover: `cover for ${id}`, role, capabilities: caps });
  if (!add.result?.invite) throw new Error(`memberadd ${id}: ${JSON.stringify(add)}`);
  const en = await api("op=enroll", { invite: add.result.invite, handle: id, password: `${id}-passphrase-1` });
  if (!en.result?.ok) throw new Error(`enroll ${id}: ${JSON.stringify(en)}`);
  const lg = await api("op=login", { role: `member:${id}`, password: `${id}-passphrase-1` });
  if (!lg.result?.token) throw new Error(`login ${id}: ${JSON.stringify(lg)}`);
  return lg.result.token;
};
await member("ruth", ["contribute"], "admin");
await member("gus", ["contribute"], "admin");
const carol = await member("carol", ["contribute", "create_projects"]);
const dave = await member("dave", ["contribute"]);

const acquire = async (p) => {
  const r = await api("op=acquire&token=mem-d701", { locator: U(p), authority: "D-701 fixture", subresources: true });
  const s = r.document && r.document.capture && r.document.capture.sha256;
  if (!r.ok || !s) throw new Error(`acquire ${p}: ${JSON.stringify(r).slice(0, 400)}`);
  /* Retrieval stamps are whole seconds: each capture must be observed LATER than the last. */
  await new Promise((res) => setTimeout(res, 1100));
  return s;
};
const S1 = await acquire("/shared1.html");
const SX = await acquire("/secret.html");
const S2 = await acquire("/shared2.html");
const SL = await acquire("/loose.html");

const md = (id, type) => `---\n${id === null ? "" : `id: ${id}\n`}object_type: ${type}\ncurrent_state: ${type === "project" ? "forming" : "collected"}\ncreated: "2026-07-01T00:00:00Z"\nlast_updated: "2026-07-01T00:00:00Z"\n---\n\n## Summary\n\nD-701 fixture.\n`;
const file = async (id, type, tok, shas, label) => {
  const text = md(id, type);
  const r = await api(`op=promote&token=${tok}`, {
    ...(id === null ? {} : { bundleId: id }), base: null, snapKey: `${label}-new`, author: "suite",
    files: [{ path: "bundle.md", text, bytes: text.length, sha256: sha(text) }],
    register: shas.map((s, i) => ({ sha256: s, path: `captures/page-${i}.html`, encoding: "text", bytes: 10 })),
    meta: { object_type: type, group: "believe-in-oakland", title: label,
            current_state: type === "project" ? "forming" : "collected",
            created: "2026-07-01T00:00:00Z", last_updated: "2026-07-01T00:00:00Z" } });
  if (!r.result?.ok) throw new Error(`promote ${label}: ${JSON.stringify(r)}`);
  return r.result.bundleId;
};
const INFO = await file("INFO-2026-0701-shared", "information", "mem-d701", [S1, S2], "INFO-2026-0701-shared");
const PROJ = await file(null, "project", carol, [SX], "d701-secret-project");

const listed = await api(`op=list&token=${dave}`);
t("FIXTURE: dave cannot see carol's project (op=list)",
  (listed.result || []).map((b) => b.bundle_id).includes(PROJ), false);
t("FIXTURE: dave can see the shared bundle", (listed.result || []).map((b) => b.bundle_id).includes(INFO), true);
t("FIXTURE: four distinct captures", new Set([S1, SX, S2, SL]).size, 4);

/* Everything the secret capture discloses, as strings: its sha, the page address it was captured at, the
   address only it links to, and its project's id. None may appear anywhere in an outsider's answer. */
const SECRETS = { sha: SX, page: N("/secret.html"), onlySecret: N("/only-secret.html"), project: PROJ };
const leaks = (answer) => Object.entries(SECRETS).filter(([, v]) => JSON.stringify(answer).includes(v)).map(([k]) => k);

/* ------------------------------------------------------ op=links, by address */

console.log("\n--- op=links&address: what points at an address, as the viewer may see it ---");
{
  const tgt = encodeURIComponent(U("/target.html"));
  const admin = await api(`op=links&token=mem-d701&address=${tgt}`);
  const owner = await api(`op=links&token=${carol}&address=${tgt}`);
  const out = await api(`op=links&token=${dave}&address=${tgt}`);
  t("the machine credential sees all four sources (the control: the row is really there)",
    [admin.count, (admin.sources || []).map((r) => r.source_capture).sort()], [4, [S1, SX, S2, SL].sort()]);
  t("the project's owner sees all four", (owner.sources || []).map((r) => r.source_capture).sort(), [S1, SX, S2, SL].sort());
  t("an outsider sees the three sources outside the project, the unfiled one included",
    (out.sources || []).map((r) => r.source_capture).sort(), [S1, S2, SL].sort());
  t("and the COUNT is of what the outsider sees, not of what exists", out.count, 3);
  t("nothing of the secret capture is in the outsider's answer", leaks(out), []);
  const only = await api(`op=links&token=${dave}&address=${encodeURIComponent(U("/only-secret.html"))}`);
  const never = await api(`op=links&token=${dave}&address=${encodeURIComponent(U("/never-linked.html"))}`);
  t("an address only the hidden capture links to answers EXACTLY as one nothing links to",
    { ...only, address_norm: null }, { ...never, address_norm: null });
  t("(the owner does see that one)", (await api(`op=links&token=${carol}&address=${encodeURIComponent(U("/only-secret.html"))}`)).count, 1);
}

/* ------------------------------------------------------ op=links, by capture */

console.log("\n--- op=links&capture: a capture's own links, and what each resolves to ---");
{
  const hidden = await api(`op=links&token=${dave}&capture=${SX}`);
  const absent = await api(`op=links&token=${dave}&capture=${sha("d701-no-such-capture")}`);
  t("a hidden capture's links answer EXACTLY as a capture the record does not hold",
    { ...hidden, sourceCapture: null }, { ...absent, sourceCapture: null });
  t("(the owner reads them)", (await api(`op=links&token=${carol}&capture=${SX}`)).resolved > 0, true);

  const admin = await api(`op=links&token=mem-d701&capture=${S1}`);
  const out = await api(`op=links&token=${dave}&capture=${S1}`);
  const toSecret = (a) => (a.links || []).find((l) => l.address_norm === N("/secret.html")) || {};
  t("the machine credential resolves shared1's link to the secret page, to the secret capture AND its project",
    [toSecret(admin).resolution, toSecret(admin).target_capture, toSecret(admin).target_bundle], ["linked", SX, PROJ]);
  t("an outsider reads that link as one whose target the record does not hold",
    [toSecret(out).resolution, toSecret(out).target_capture, toSecret(out).target_bundle],
    ["offsite", undefined, undefined]);
  t("and the tally moves with it: linked counts only what the outsider sees",
    [(admin.tally || {}).linked - (out.tally || {}).linked, (out.tally || {}).offsite - (admin.tally || {}).offsite], [1, 1]);
  t("nothing of the secret capture is in the outsider's answer but the address shared1 itself carries",
    leaks(out), ["page"]);
  const toTarget = (a) => (a.links || []).find((l) => l.address_norm === N("/target.html")) || {};
  t("a link to an address nobody captured is offsite for both", [toTarget(admin).resolution, toTarget(out).resolution],
    ["offsite", "offsite"]);
}

/* ------------------------------------------------------ op=navchanges */

console.log("\n--- op=navchanges: the host's navigation, as the viewer may see it ---");
{
  const admin = await api(`op=navchanges&token=mem-d701&host=${HOST}`);
  const owner = await api(`op=navchanges&token=${carol}&host=${HOST}`);
  const out = await api(`op=navchanges&token=${dave}&host=${HOST}`);
  t("the machine credential sequences all three navigations", (admin.sequence || []).map((o) => o.source_capture), [S1, SX, S2]);
  t("and names the secret capture as the last to carry B",
    ((admin.lost || [])[0] || {}).last_carried?.source_capture, SX);
  t("the owner sees the same", (owner.sequence || []).map((o) => o.source_capture), [S1, SX, S2]);
  t("an outsider's sequence holds only what they may see", (out.sequence || []).map((o) => o.source_capture), [S1, S2]);
  t("and the observation count is theirs", out.observations, 2);
  t("B is still lost, between the two captures the outsider can see",
    (out.lost || []).map((l) => [l.address_norm, l.last_carried?.source_capture, l.first_missing?.source_capture]),
    [[N("/dept/b.html"), S1, S2]]);
  const rec = (a) => (a.records || []).find((r) => (r.links || []).includes(N("/dept/b.html"))) || {};
  t("the shared navigation's record counts both captures for the machine credential", rec(admin).captures, 2);
  t("and ONE for the outsider: no count moves with a row they cannot see", rec(out).captures, 1);
  t("its interval is the outsider's too", [rec(out).first_observed, rec(out).last_observed],
    [((out.sequence || [])[0] || {}).first_observed, ((out.sequence || [])[0] || {}).last_observed]);
  t("nothing of the secret capture is in the outsider's answer", leaks(out), []);
}

console.log("\n--- fail closed: a store call with no viewer sees nothing ---");
{
  const ns = await mf.getDurableObjectNamespace("STORE");
  const st = ns.get(ns.idFromName("bio"));
  const store = async (path) => ((await (await st.fetch("http://x" + path)).json()) || {}).result || {};
  t("linksto with no viewer lists nothing", (await store(`/linksto?address=${encodeURIComponent(N("/target.html"))}`)).count, 0);
  t("resolvelinks with no viewer resolves nothing", (await store(`/resolvelinks?capture=${S1}`)).resolved, 0);
  t("navchanges with no viewer observes nothing", (await store(`/navchanges?host=${HOST}`)).observations, 0);
}

console.log(`\nd701-linkgate: ${pass} pass, ${fail} fail`);
await mf.dispose();
process.exit(fail ? 1 : 0);
