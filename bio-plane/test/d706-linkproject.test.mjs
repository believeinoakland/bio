/* D-706 — op=linkproject ANSWERS THROUGH THE VIEWER (the DISCLOSURE half).
 *
 * D-701's worker found it while closing op=links and op=navchanges: `Store#projectLinks` resolved ANY capture's links
 * with no viewer, so dave, a member of no project, called op=linkproject on a shared capture and received carol's
 * hidden project's capture sha (`edges[].target_capture`) and the PROJECT ID itself (`edges[].to`), and on the hidden
 * capture itself received its links and the project's id as `source_bundle`. BOB #35's ruling (2026-09-25 09:30Z)
 * and MEMBER-KNOWLEDGE-DESIGN §5 decide what he should have received: exactly the answer a nonexistent row gives.
 *
 * WHAT THIS SUITE HOLDS (the disclosure half):
 *   - the handler stamps the server-decided viewer, as op=links does;
 *   - a source capture the viewer cannot see answers EXACTLY as a capture the record does not hold, and writes nothing;
 *   - an edge whose target capture the viewer cannot see is not in `edges`, and no count moves with it: `projected`,
 *     `skipped_self` and `skipped_unregistered` count only visible targets, and `unresolved` is the viewer's own
 *     offsite count — a link whose only capture is hidden is unresolved, the answer an uncaptured target gets.
 * WHAT IT DOES NOT DECIDE (the WRITE half, with BOB #36): whether an outsider's act may WRITE an edge to a bundle they
 * cannot see. The write still resolves unfiltered, as D-701 left it, and the "write half" block below MEASURES what is
 * written rather than asserting what should be. Nor whether `bundle=` may name a bundle the caller cannot see.
 *
 * The fixture, one host:
 *   /mixed.html   first capture M1                                       filed in carol's PROJECT
 *   /shared1.html links -> /secret.html /open.html /loose.html /target.html /mixed.html   filed in INFO (open)
 *   /secret.html  links -> /target.html /only-secret.html /open.html                    filed in carol's PROJECT
 *   /open.html                                                           filed in OPEN2 (open)
 *   /loose.html                                                          acquired, filed in NO bundle
 *   /mixed.html   second capture M2, different bytes                     filed in OPEN2 (open)
 *   /target.html  never captured
 *
 * BEFORE THE FIX (2026-09-25, D-706 worker, on land/worker/D-701 @ 414439d2): 9 pass 8 fail — the leak, reproduced
 * through the op: the outsider's answer carried SX, M1 and the project's id, projected 3, and the hidden capture
 * answered with `source_bundle` = the project.
 *
 * NEGATIVE CONTROL: (run 2026-09-25, D-706 worker) four arms, each ALONE, anchor matched exactly once, restored by cp
 * from pristine copies and verified by sha256 AND cmp (store.mjs d2288c57... 3,491,743 bytes; index.mjs dcbb431f...
 * 890,257 bytes); BASELINE 20 pass 0 fail. (a) DROP THE STAMP: the handler sends no viewer -> 13 pass 7 fail, among
 * them "the outsider's edges name only a bundle they can see", "the machine credential sees the hidden edges" and
 * "WRITE HALF, measured not ruled" (nothing written): the store fails CLOSED, an outage and never a leak — both leak
 * guards stay GREEN, as declared. (b) DROP THE ANSWER FILTER (`visible` answers true) -> 17 pass 3 fail: "nothing of
 * the hidden project is in the outsider's answer", "the outsider's edges name only a bundle they can see", "and no
 * count moves with a row they cannot see". (c) DROP THE SOURCE GATE -> 15 pass 5 fail: "a hidden capture answers
 * EXACTLY as a capture the record does not hold", "nothing of the hidden project is in it", "and so it does when the
 * caller names a bundle to hang it on", "a store call with no viewer projects nothing", "a hidden SOURCE writes
 * nothing for the outsider". (d) OVER-STRICT: a capture filed in NO bundle is treated as hidden -> 18 pass 2 fail:
 * "and no count moves with a row they cannot see" (skipped_unregistered 0), "the machine credential sees the hidden
 * edges".
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

const HOST = "www.d706.example";
const U = (p) => `https://${HOST}${p}`;
const N = (p) => normalizeAddress(U(p));
const a = (p) => `<a href="${p}">${p}</a> `;
let mixedServed = 0;
const PAGES = {
  "/shared1.html": () => `<!doctype html><html><body><main>${a("/secret.html")}${a("/open.html")}${a("/loose.html")}${a("/target.html")}${a("/mixed.html")}</main></body></html>`,
  "/secret.html": () => `<!doctype html><html><body><main>${a("/target.html")}${a("/only-secret.html")}${a("/open.html")}</main></body></html>`,
  "/open.html": () => `<!doctype html><html><body><main><p>open</p></main></body></html>`,
  "/loose.html": () => `<!doctype html><html><body><main><p>loose</p></main></body></html>`,
  "/mixed.html": () => `<!doctype html><html><body><main><p>mixed version ${++mixedServed}</p></main></body></html>`,
};

const mf = new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: SRC, script: readFileSync(SRC, "utf8"),
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
  r2Buckets: ["CAPTURES", "PUBLISHED"],
  bindings: { ADMIN_TOKEN: "adm-d706", MEMBER_TOKEN: "mem-d706", PROBE_TOKEN: "prb-d706", VERSION: "test",
              GOVERNOR_APPETITE_PER_MIN: "600000", GOVERNOR_SUBRESOURCE_STAGGER_MS: "0" },
  outboundService(request) {
    const u = new URL(request.url);
    if (u.hostname !== HOST || !PAGES[u.pathname]) return new Response("nope", { status: 404 });
    return new Response(PAGES[u.pathname](), { headers: { "content-type": "text/html" } });
  },
});
const api = async (q, body) => (await mf.dispatchFetch(`http://x/api/?${q}`,
  body ? { method: "POST", body: JSON.stringify(body) } : {})).json();

/* ------------------------------------------------------------------ fixture */

const member = async (id, caps, role = "member") => {
  const add = await api("op=memberadd&token=adm-d706", { memberId: id, cover: `cover for ${id}`, role, capabilities: caps });
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
  const r = await api("op=acquire&token=mem-d706", { locator: U(p), authority: "D-706 fixture", subresources: true });
  const s = r.document && r.document.capture && r.document.capture.sha256;
  if (!r.ok || !s) throw new Error(`acquire ${p}: ${JSON.stringify(r).slice(0, 400)}`);
  /* Retrieval stamps are whole seconds: each capture must be observed LATER than the last. */
  await new Promise((res) => setTimeout(res, 1100));
  return s;
};
const M1 = await acquire("/mixed.html");
const S1 = await acquire("/shared1.html");
const SX = await acquire("/secret.html");
const SO = await acquire("/open.html");
const SL = await acquire("/loose.html");
const M2 = await acquire("/mixed.html");

const md = (id, type) => `---\n${id === null ? "" : `id: ${id}\n`}object_type: ${type}\ncurrent_state: ${type === "project" ? "forming" : "collected"}\ncreated: "2026-07-01T00:00:00Z"\nlast_updated: "2026-07-01T00:00:00Z"\n---\n\n## Summary\n\nD-706 fixture.\n`;
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
const INFO = await file("INFO-2026-0706-shared", "information", "mem-d706", [S1], "INFO-2026-0706-shared");
const OPEN2 = await file("INFO-2026-0706-open", "information", "mem-d706", [SO, M2], "INFO-2026-0706-open");
const PROJ = await file(null, "project", carol, [SX, M1], "d706-secret-project");

const listed = await api(`op=list&token=${dave}`);
t("FIXTURE: dave cannot see carol's project (op=list)",
  (listed.result || []).map((b) => b.bundle_id).includes(PROJ), false);
t("FIXTURE: dave can see both open bundles",
  [INFO, OPEN2].map((b) => (listed.result || []).map((r) => r.bundle_id).includes(b)), [true, true]);
t("FIXTURE: six distinct captures (the two of /mixed.html differ)", new Set([M1, S1, SX, SO, SL, M2]).size, 6);

/* Everything the hidden project discloses, as strings: its captures' shas, the address only the hidden capture
   links to, and the project's id. None may appear anywhere in an outsider's answer. (The ADDRESS /secret.html is
   not a secret here: shared1 itself carries it, and op=links hands it to anyone who can read shared1.) */
const SECRETS = { sx: SX, m1: M1, onlySecret: N("/only-secret.html"), project: PROJ };
const leaks = (answer) => Object.entries(SECRETS).filter(([, v]) => JSON.stringify(answer).includes(v)).map(([k]) => k);
const ns = await mf.getDurableObjectNamespace("STORE");
const st = ns.get(ns.idFromName("bio"));
const store = async (path) => ((await (await st.fetch("http://x" + path)).json()) || {}).result || {};
/* What the record holds pointing INTO the hidden project, read with the machine viewer, which D-15 does not filter. */
const intoProject = async () => ((await store(`/backlinks?target=${encodeURIComponent(PROJ)}&viewer=class:member`)).backlinks || [])
  .filter((b) => b.rel === "links_to").map((b) => b.from);
const lp = (tok, cap, extra = "") => api(`op=linkproject&token=${tok}&capture=${cap}${extra}`);
const shape = (r) => ({ projected: r.projected, skipped_self: r.skipped_self, skipped_unregistered: r.skipped_unregistered,
  unresolved: r.unresolved, to: (r.edges || []).map((e) => e.to).sort() });

/* ------------------------------------------------ a shared source capture */

console.log("\n--- op=linkproject on a SHARED capture: the answer is the viewer's ---");
{
  t("FIXTURE: before anyone projects, nothing links_to the hidden project", await intoProject(), []);
  const out = await lp(dave, S1);
  /* THE WRITE HALF, MEASURED (BOB #36 decides it; this does not): the outsider's own act wrote INFO -> PROJ. */
  t("WRITE HALF, measured not ruled: the outsider's act still writes a links_to edge INTO the hidden project",
    await intoProject(), [INFO]);
  t("the outsider's call is served (a member with contribute may project an open capture)", out.ok, true);
  t("nothing of the hidden project is in the outsider's answer", leaks(out), []);
  t("the outsider's edges name only a bundle they can see", shape(out).to, [OPEN2]);
  t("and no count moves with a row they cannot see: /secret.html reads as uncaptured (unresolved), the mixed "
    + "address as nothing", [out.projected, out.skipped_self, out.skipped_unregistered, out.unresolved], [1, 0, 1, 2]);
  t("the outsider's source bundle is the open one", out.source_bundle, INFO);

  const machine = await lp("mem-d706", S1);
  t("the machine credential sees the hidden edges (the control: the rows are really there)",
    shape(machine), { projected: 3, skipped_self: 0, skipped_unregistered: 1, unresolved: 1, to: [OPEN2, PROJ, PROJ].sort() });
  const owner = await lp(carol, S1);
  t("the project's owner sees what the machine sees", shape(owner), shape(machine));
  t("and the owner's answer names the hidden capture it resolved to",
    (owner.edges || []).some((e) => e.target_capture === SX), true);
}

/* ------------------------------------------------ a hidden source capture */

console.log("\n--- op=linkproject on a HIDDEN capture: the record's not-held answer ---");
{
  const hidden = await lp(dave, SX);
  const absent = await lp(dave, sha("d706-no-such-capture"));
  t("a hidden capture answers EXACTLY as a capture the record does not hold", hidden, absent);
  t("nothing of the hidden project is in it", leaks(hidden), []);
  const withBundle = await lp(dave, SX, `&bundle=${encodeURIComponent(INFO)}`);
  const absentB = await lp(dave, sha("d706-no-such-capture"), `&bundle=${encodeURIComponent(INFO)}`);
  t("and so it does when the caller names a bundle to hang it on", withBundle, absentB);
  const owner = await lp(carol, SX);
  t("(the owner projects it: the hidden capture's own source bundle is the project)",
    [owner.source_bundle, (owner.edges || []).map((e) => e.to)], [PROJ, [OPEN2]]);
}

/* ------------------------------------------------ the write half, measured */

console.log("\n--- the WRITE half (BOB #36): measured, not decided ---");
{
  /* The outsider's call on S1 above wrote INFO -> PROJ, as it did before this landing: the write resolves
     unfiltered (D-701's note, kept). Whether it may is the design question with BOB #36; this reads the machine's
     view of the edges so the report can state it, and pins that the outsider's DISCLOSURE does not depend on it. */
  const none = await store(`/projectlinks?capture=${S1}`);
  t("a store call with no viewer projects nothing and names nothing (fail closed)", none, { projected: 0, edges: [] });
  const hiddenWrite = await store(`/projectlinks?capture=${SX}&viewer=${encodeURIComponent("member:dave")}`);
  t("a hidden SOURCE writes nothing for the outsider: the not-held answer carries no write",
    hiddenWrite, { projected: 0, edges: [] });
  /* The control for the arm above: the SAME store call with the owner's viewer is served, so the outsider's empty
     answer is the gate and not a viewer string the predicate cannot parse (which would fail closed for free). */
  const ownerWrite = await store(`/projectlinks?capture=${SX}&viewer=${encodeURIComponent("member:carol")}`);
  t("(the same store call with the owner's viewer is served)", [ownerWrite.source_bundle, ownerWrite.projected], [PROJ, 1]);
}

console.log(`\nd706-linkproject: ${pass} pass, ${fail} fail`);
await mf.dispose();
process.exit(fail ? 1 : 0);
