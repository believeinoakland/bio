/* control-plane R81 (T47; N897 (1); amends R75): THE END-TO-END SUITE'S ADDITIONS. Over Miniflare and the real plane
   (`src/plane/index.mjs`, the Worker the product deploys), the founder claimed and signed in through the real `login`,
   the real served `/app` page (the nine screen modules and screens-wizards' guide) booted on interface-shell's document
   stand-in, every request it makes answered by the same plane: Home's projects with their question counts, a wizard
   started from one of Home's front doors, and the doorbell's page handing over a file with no credential, read back
   through the real ops. */
import "../../sandbox.mjs";
import { test, after } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import { Miniflare } from "miniflare";
import { boot } from "../interface-shell/harness.mjs";
import { OPS } from "../../../src/op-declarations/index.mjs";

const SRC = fileURLToPath(new URL("../../../src/plane/index.mjs", import.meta.url));
const ADM = "adm-e2e47-0123456789abcdef", PASSWORD = "the founder's long password, T47";
const ORIGIN = "https://group.example";

const mf = new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: SRC, script: readFileSync(SRC, "utf8"),
  modulesRules: [{ type: "ESModule", include: ["**/*.mjs"] }],
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } }, r2Buckets: ["CAPTURES", "PUBLISHED"],
  bindings: { ADMIN_TOKEN: ADM, MEMBER_TOKEN: "mem-e2e47-0123456789abcdef", PROBE_TOKEN: "prb-e2e47-0123456789abcdef",
              VERSION: "4.7.0", INSTANCE_NAME: "e2e-town-47" },
});
after(() => mf.dispose());

/* A request the page makes, sent to the plane as it would leave a browser at the group's address. */
async function toPlane(url, init = {}) {
  const u = new URL(url, ORIGIN);
  let body = init.body;
  if (body instanceof Blob) body = new Uint8Array(await body.arrayBuffer());
  return mf.dispatchFetch(u.href, { method: init.method || "GET", headers: init.headers || {}, ...(body === undefined ? {} : { body }) });
}
/* The shell harness's answer shape (`{status, json}`, or bytes) from a real answer of the plane. */
async function answerOf(res) {
  const type = res.headers.get("content-type") || "";
  if (/json/.test(type)) return { status: res.status, json: await res.json() };
  return { status: res.status, bytes: new Uint8Array(await res.arrayBuffer()), type };
}
/* Every op the door declares, answered by the plane: the booted page's whole world is the real one. */
const real = Object.fromEntries(Object.keys(OPS).map((op) => [op, async (req) => answerOf(await toPlane(req.url, req.init))]));
const sha = (s) => createHash("sha256").update(s).digest("hex");

/* The instance claimed, as an installer leaves it, and the founder signed in through the real `login` (R83). */
let session = null;
async function signIn() {
  if (session) return session;
  const claimed = await mf.dispatchFetch(`${ORIGIN}/api/?op=claim`, { method: "POST", body: JSON.stringify({ bootstrapToken: ADM, password: PASSWORD }) });
  assert.equal(claimed.status, 200, await claimed.clone().text());
  await claimed.arrayBuffer();
  const signed = await (await toPlane("/api/?op=login", { method: "POST", headers: { "content-type": "application/json" },
    body: JSON.stringify({ handle: "admin", password: PASSWORD, device: "own" }) })).json();
  assert.equal(signed.ok, true, JSON.stringify(signed));
  const r = signed.result;
  assert.ok(r && r.ok === true && typeof r.token === "string" && r.token.length > 20, JSON.stringify(r));
  session = { t: r.token, e: r.expires, d: r.device };
  return session;
}
const auth = () => ({ authorization: `Bearer ${session.t}` });
const asFounder = async (url, init = {}) => (await toPlane(url, { ...init, headers: { ...auth(), ...(init.headers || {}) } })).json();

/* The real served page at `path`, booted with `who` (a session record, or null for none), every request answered by
   the plane. */
async function appAt(path, who = session) {
  const html = await (await mf.dispatchFetch(`${ORIGIN}${path}`)).text();
  const p = await boot({ html, session: who, path, plane: real });
  await run(p);
  return p;
}
/* Runs the page until `ok()` holds, at most `ms` of wall time (the plane is real, so its answers take real time). */
async function until(p, ok, ms = 15000) {
  const end = Date.now() + ms;
  while (Date.now() < end) { if (ok()) return true; await p.settle(20); await new Promise((r) => setTimeout(r, 10)); }
  return ok();
}
async function run(p, n = 30) { for (let i = 0; i < n; i++) { await p.settle(20); await new Promise((r) => setTimeout(r, 5)); } }
const main = (p) => p.doc.getElementById("cs-main");
const text = (el) => (el ? el.textContent : "").replace(/\s+/g, " ").trim();
const bearer = (r) => r.headers.Authorization || r.headers.authorization || "";
const answered = (p, op) => {
  const sent = p.byOp(op);
  assert.ok(sent.length > 0, `${op} was asked`);
  for (const r of sent) assert.equal(bearer(r), `Bearer ${session.t}`, `${op}: the session in the header`);
  return sent;
};

/* A bundle's file as promote takes it: its text, bytes and digest. */
const file = (path, t) => ({ path, text: t, bytes: Buffer.byteLength(t), sha256: sha(t) });
const stamp = () => new Date().toISOString().replace(/\.\d{3}Z$/, "Z");
let keys = 0;
const snapKey = (at) => `${at.replace(/[-:]/g, "")}_e2e47${String(++keys).padStart(3, "0")}`;

async function promoteInquiry(id, title) {
  const at = stamp();
  const md = ["---", `id: ${id}`, "object_type: inquiry", "schema: inquiry@1", `title: ${JSON.stringify(title)}`,
    "current_state: open", "prior_state: null", `created: "${at}"`, `last_updated: "${at}"`, "surfaced_by: human",
    "references: []", "state_history: []", "---", "", "## Question", "", `${title}`, "", "## Session Log", ""].join("\n");
  const r = await asFounder("/api/?op=promote", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({
    bundleId: id, base: null, snapKey: snapKey(at),
    meta: { object_type: "inquiry", title, current_state: "open", prior_state: null, created: at, last_updated: at },
    files: [file("bundle.md", md)], register: [] }) });
  assert.equal(r.ok && r.result?.ok, true, JSON.stringify(r).slice(0, 500));
  return r.result.bundleId ?? id;
}
async function promoteProject(title, cites) {
  const at = stamp();
  const md = ["---", "object_type: project", "schema: project@1", `title: ${JSON.stringify(title)}`, `objective: ${JSON.stringify(title)}`, "current_state: forming",
    "prior_state: null", `created: "${at}"`, `last_updated: "${at}"`,
    ...(cites.length ? ["references:", ...cites.flatMap((t) => ["  - rel: cites", `    target: ${t}`, "    status: confirmed", '    note: ""'])] : ["references: []"]),
    "state_history: []", "---", "", "## Objective", "", "Find out.", "", "## Session Log", ""].join("\n");
  const r = await asFounder("/api/?op=promote", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({
    base: null, snapKey: snapKey(at),
    meta: { object_type: "project", title, current_state: "forming", prior_state: null, created: at, last_updated: at },
    files: [file("bundle.md", md)], register: [] }) });
  assert.equal(r.ok && r.result?.ok, true, JSON.stringify(r).slice(0, 500));
  return r.result.bundleId;
}

test("R81 end to end: Home draws the group's projects from the real `projectlist`, each with its question count paged from the real `projectquestions`, every read under the founder's session", async () => {
  await signIn();
  const year = new Date().getUTCFullYear();
  const q1 = await promoteInquiry(`INQ-${year}-4701-e2e-lights`, "Who turned off the street lights on Seminary Ave?");
  const q2 = await promoteInquiry(`INQ-${year}-4702-e2e-budget`, "What did the lighting budget pay for?");
  const busy = await promoteProject("The dark streets", [q1, q2]);
  const quiet = await promoteProject("The library hours", []);
  /* the plane's own answers, as the founder reads them: what Home must draw */
  const listed = await asFounder("/api/?op=projectlist");
  assert.equal(listed.ok, true, JSON.stringify(listed).slice(0, 400));
  const ids = (listed.result.projects || []).map((p) => p.id);
  assert.ok(ids.includes(busy) && ids.includes(quiet), JSON.stringify(listed).slice(0, 400));
  const qs = await asFounder(`/api/?op=projectquestions&project=${encodeURIComponent(busy)}`);
  assert.deepEqual((qs.result.items || []).map((x) => x.inquiry).sort(), [q1, q2].sort(), JSON.stringify(qs).slice(0, 400));

  const p = await appAt("/app");
  /* the counts are read one after the list, each paged: wait for both to be drawn (or the time to run out) */
  /* screens-daily R10, R21: a count is drawn in the row's meta, and never at zero, so wait for the busy project's */
  await until(p, () => /2 questions/.test(text(main(p))));
  answered(p, "projectlist");
  const asked = answered(p, "projectquestions");
  assert.deepEqual([...new Set(asked.map((r) => r.query.project))].sort(), [busy, quiet].sort(), "each listed project's count is read");
  const m = main(p);
  const row = (id) => m.querySelectorAll("a").find((a) => (a.getAttribute("href") || "").includes(encodeURIComponent(id)) || (a.getAttribute("href") || "").includes(id));
  for (const [id, title] of [[busy, "The dark streets"], [quiet, "The library hours"]]) {
    const a = row(id);
    assert.ok(a, `${id} is drawn as a reference`);
    assert.match(text(a), new RegExp(title));
  }
  const rowText = (id) => { const r = row(id).closest(".cs-row") || row(id).parentElement.parentElement; return text(r); };
  assert.match(rowText(busy), /2 questions/, "the busy project's two questions");
  /* screens-daily R21 (DEC-219 (3)): no reading at zero, so the quiet project's row draws no count (and none says 'loading' or 'failed') */
  assert.doesNotMatch(rowText(quiet), /\bquestions?\b/i, "the quiet project's row draws no count at zero");
  assert.ok(m.querySelectorAll('[data-ladder="stage"]').length >= 2, "each row draws its stage");
  /* control: the same read with no session sees no project (the projects are the session's) */
  const bare = await (await toPlane("/api/?op=projectlist")).json();
  assert.equal(JSON.stringify(bare).includes(busy), false, JSON.stringify(bare).slice(0, 300));
});

test("R81 end to end: a wizard started from one of Home's front doors: the doors drawn from the real `startfrom`, the script read through the real `wizardread`, its start counted by the real `wizardprogress`, and the guide running in the dock on the step's own screen", async () => {
  await signIn();
  const SCRIPT = "WIZ-33b5887790b7561b"; // the Civicsmith library's "Check a claim", behind the problem, read and tip doors
  const offered = await asFounder("/api/?op=startfrom", { method: "POST", headers: { "content-type": "application/json" }, body: "{}" });
  assert.equal(offered.ok, true, JSON.stringify(offered).slice(0, 300));
  const door = (offered.result.doors || []).find((d) => d.scripts.includes(SCRIPT));
  assert.ok(door, "a front door offers the script on a fresh instance: " + JSON.stringify(offered.result.doors));
  const script = offered.result.scripts.find((s) => s.id === SCRIPT);
  assert.ok(script && script.version, JSON.stringify(offered.result.scripts).slice(0, 300));

  const p = await appAt("/app");
  answered(p, "startfrom");
  const m = main(p);
  const doors = m.querySelector('[data-front="doors"]');
  assert.ok(doors, "Home draws its front doors");
  const at = doors.querySelector(`[data-door="${door.door}"]`);
  assert.ok(at, `the ${door.door} door is drawn`);
  const button = at.querySelectorAll('button[data-act="startfrom"]').find((b) => b.getAttribute("data-script") === SCRIPT);
  assert.ok(button, "the door's script is a control");
  /* control: before the press, no wizard runs and no script was read */
  assert.equal(p.byOp("wizardread").length, 0);
  assert.equal(p.root().querySelector('[data-guide-state="running"]'), null, "no wizard runs before the press");
  const startfromBefore = p.byOp("startfrom").length;

  await p.click(button);
  await until(p, () => p.root().querySelector('[data-guide-state="running"]') && p.byOp("wizardprogress").length > 0);
  /* screens-daily R23: a script is started by the shell's `cs.wizard`; the press sends no act of its own. Home may read the
     doors again as it redraws (a GET), but no `startfrom` is ever a POST */
  assert.ok(p.byOp("startfrom").every((r) => r.method === "GET"), "the script button sends no act of its own");
  assert.ok(startfromBefore >= 1);
  const [read] = answered(p, "wizardread");
  assert.equal(read.query.script, SCRIPT);
  assert.equal(String(read.query.version), String(script.version));
  const counted = answered(p, "wizardprogress");
  assert.ok(counted.some((r) => r.body && r.body.script === SCRIPT && r.body.event === "start"), JSON.stringify(counted.map((r) => r.body)));
  assert.ok(counted.every((r) => r.method === "POST"));
  /* the plane answered the read and the count */
  const readBack = await asFounder(`/api/?op=wizardread&script=${SCRIPT}&version=${encodeURIComponent(script.version)}`);
  assert.equal(readBack.ok, true, JSON.stringify(readBack).slice(0, 300));
  const steps = readBack.result.version.steps;
  assert.ok(steps.length > 0);
  const guide = p.root().querySelector('[data-guide-state="running"]');
  assert.ok(guide, "the guide runs in the dock: " + text(p.root()).slice(0, 400));
  assert.ok(guide.closest('[data-panel="guide"]'), "drawn in the dock's guide panel");
  assert.match(text(guide), new RegExp(`1\\D+${steps.length}`), "step 1 of the script's steps");
  assert.match(p.location.pathname, new RegExp(`^/app/${steps[0].screen === "finder" ? "find" : steps[0].screen}`), "the step's screen is open");
  /* control: Stop sends nothing and the guide is gone */
  const n = p.requests.length;
  await p.click(guide.querySelector('[data-guide="stop"]'));
  await run(p, 5);
  assert.equal(p.root().querySelector('[data-guide-state="running"]'), null);
  assert.equal(p.requests.slice(n).filter((r) => r.method === "POST").length, 0, "stopping sends nothing");
});

test("R81 end to end: the doorbell's page at `/app/doorbell`, booted with no session, hands a file and a note over through the real `knock` with no credential; the plane answers it received, and the founder reads it in the real inbox", async () => {
  await signIn();
  /* the page is served on the public frame's address with no credential read (control: none is sent) */
  const served = await mf.dispatchFetch(`${ORIGIN}/app/doorbell`);
  assert.equal(served.status, 200);
  assert.equal(served.headers.get("cache-control"), "no-store");
  const html = await served.text();
  /* every answer the knock is given, as the plane gave it */
  const knocks = [];
  const plane = { ...real, knock: async (req) => { const a = await answerOf(await toPlane(req.url, req.init)); knocks.push(a); return a; } };
  const p = await boot({ html, session: null, path: "/app/doorbell", plane });
  await until(p, () => main(p) && main(p).querySelector('button[data-act="knock"]') && p.doc.getElementById("db-file")
    && /e2e-town-47/.test(text(main(p))));
  assert.equal(p.byOp("whoami").length, 0, "no session read on the public frame");
  assert.match(text(main(p)), /e2e-town-47/, "headed by the group's public name, read from the real plane");

  const bytes = new TextEncoder().encode("Inspection sheets for 2026, unique " + Date.now());
  const digest = sha(bytes);
  p.doc.getElementById("db-file").files = [{ name: "sheets.pdf", size: bytes.length, type: "application/pdf",
    arrayBuffer: async () => bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.length) }];
  const NOTE = "The inspection sheets the city did not publish.";
  p.doc.getElementById("db-note").value = NOTE;
  const b = main(p).querySelector('button[data-act="knock"]');
  await p.click(b);
  const slot = p.root().querySelector(`[data-slot="${b.getAttribute("data-ai")}"]`);
  const yes = slot && slot.querySelector('[data-shell="confirm"]');
  if (yes) await p.click(yes);
  await until(p, () => knocks.length > 0 && main(p).querySelector("[data-received]"));

  const sent = p.byOp("knock");
  assert.equal(sent.length, 1, "the knock was sent once");
  const [k] = sent;
  assert.equal(k.method, "POST");
  assert.equal(bearer(k), "", "the knock carries no Authorization header");
  assert.equal(JSON.stringify(k).includes(session.t), false, "the founder's token is in no part of the knock");
  for (const r of p.requests) assert.equal(bearer(r), "", `${r.op}: no credential on the public frame`);
  assert.equal(k.body.contentB64, Buffer.from(bytes).toString("base64"), "the file's bytes, whole");
  assert.equal(k.body.note, NOTE);
  assert.equal(knocks.length, 1);
  assert.equal(knocks[0].status, 200, JSON.stringify(knocks[0]).slice(0, 400));
  assert.equal(knocks[0].json.ok, true, JSON.stringify(knocks[0]).slice(0, 400));
  assert.notEqual(knocks[0].json.result?.ok, false, JSON.stringify(knocks[0]).slice(0, 400));
  assert.ok(main(p).querySelector("[data-received]"), "the page says it was received");

  /* read back through the plane, as the founder: the inbox holds it, its digest the file's and its note the knocker's */
  const inbox = await asFounder("/api/?op=inbox");
  assert.equal(inbox.ok, true, JSON.stringify(inbox).slice(0, 400));
  const rows = inbox.result.inbox || [];
  const row = rows.find((r) => r.sha256 === digest);
  assert.ok(row, "the knock is in the inbox: " + JSON.stringify(rows).slice(0, 400));
  assert.equal(row.note, NOTE);
  assert.equal(row.bytes, bytes.length);
  /* control: the inbox is not read without a session */
  const bare = await (await toPlane("/api/?op=inbox")).json();
  assert.equal(JSON.stringify(bare).includes(digest), false, JSON.stringify(bare).slice(0, 300));
});
