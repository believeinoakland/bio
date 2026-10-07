/* R26 (F1; K1874; admission R20): the session token leaves every address the page makes. Driven at the page's interface:
   the served page's script in the fixture's sandbox, through every section it draws signed in (the panel and its reads,
   the record browser, a record and its download, intake with a capture, a revision, the inbox, members and keys with
   every act of theirs, the claim's choices), every request recorded with its address, its body and its headers. A
   sentinel session is found in each signed-in request's `Authorization: Bearer` header and in no address, query, body,
   link the page draws or address it leaves in the browser's history. A `401` signs the page out. */
import test from "node:test";
import assert from "node:assert/strict";
import { pageOf, PAGE_HTML } from "../../../src/setup-page/index.mjs";
import { pageOver, bearerOf } from "./fixture.mjs";

const ORIGIN = "https://copy.example";
const tick = () => new Promise((r) => setTimeout(r, 0));
const settle = async () => { for (let i = 0; i < 30; i++) await tick(); };
const SENTINEL = "sentinel-session-7f3a9c41d2e8b605";
/* The ops a page signed out may send (R3): none of them is sent under a session. */
const PUBLIC = new Set(["bootstrap", "claim", "login", "invitelook", "joinlinkinvite", "enroll"]);
const blob = "c".repeat(64);

/* A plane answering every op the page drives with what draws its section fully; `log` records each request whole. */
function plane({ unauthorized = new Set(), login = SENTINEL } = {}) {
  const log = [];
  const answers = {
    stats: { ok: true }, bootstrap: { claimed: true, version: "v1" },
    whoami: { result: { capabilities: ["read", "contribute", "create_projects", "publish"], administer: true } },
    profiles: { result: { ok: true, profiles: [], conflicts: [], choices: [{ id: "p-one", name: "Profile One", covers: ["Somewhere"] }] } },
    entitieskind: { result: { ok: true, kind: "office", entities: [], count: 0, limit: 100, truncated: false, next: null } },
    assistantstate: { result: { ok: true, on: true, set_by: "admin", set_at: "2026-10-06T00:00:00Z" } },
    memberlanguage: { result: { language: null } }, placewantedstate: { result: { name: null } },
    list: { result: [{ bundle_id: "INFO-2026-0001-a", object_type: "information", current_state: "collected", title: "A", last_updated: "2026-10-01T00:00:00Z" }] },
    image: { result: { "bundle.md": '---\nid: INFO-2026-0001-a\ntitle: "A"\ncurrent_state: collected\n---\n\n## Summary\n\nA.\n',
                       "captures/doc.pdf": { blobSha: blob, sha256: blob, bytes: 3 },
                       "_history/manifest.json": JSON.stringify({ entries: [{ key: "k1", seq: 1, kind: "create", author: "ada" }] }) } },
    lease: { result: { ok: true, base: "b".repeat(64) } },
    inbox: { result: { inbox: [{ knock_id: "KNOCK-1", status: "new", received: "2026-10-01T00:00:00Z", sha256: blob, bytes: 3 }] } },
    memberlist: { result: { members: [{ member_id: "ada", cover: "volunteer-7", status: "active" }] } },
    signerlist: { result: { signers: [{ member_id: "ada", key_b64: "AAAAC3Nz", status: "active", attests: true }] } },
    memberadd: { result: { ok: true, invite: "inv-once" } }, allocid: { result: { id: "INFO-2026-0002" } },
    acquire: { ok: true, document: { file: "captures/doc.pdf", capture: { sha256: blob, bytes: 3, encoding: "binary" } } },
    attest: { attempts: [] }, promote: { result: { ok: true } },
    hostingaccess: { result: { ok: true, current: null } }, courtnotice: { result: { choice: null } },
    groupkeystate: { result: { held: false, on: false } }, groupdescription: { result: { description: null, history: [] } },
    recoverycodesissue: { result: { ok: true, codes: ["rc-1", "rc-2"], issuedAt: "2026-10-06T00:00:00Z" } },
    recoverycodesstate: { result: { ok: true, held: true, remaining: 2, issuedAt: "2026-10-06T00:00:00Z" } },
    adminrecoverystep: { result: { ok: true, administrators: 1, codes_held: true, remaining: 2, met: false } },
    claim: { result: { ok: true, consumedAt: "2026-10-06T00:00:00Z" } }, login: { result: { ok: true, token: login, expires: 0 } },
  };
  const fetch = async (url, init) => {
    const u = new URL(url, ORIGIN);
    const op = u.searchParams.get("op");
    log.push({ url: String(url), href: u.href, op, method: (init && init.method) || "GET", body: init && init.body !== undefined ? String(init.body) : null,
               headers: JSON.stringify((init && init.headers) || {}), bearer: bearerOf(init) });
    if (unauthorized.has(op)) return { ok: false, status: 401, json: async () => ({ ok: false, error: "not signed in" }) };
    return { ok: true, status: 200, json: async () => answers[op] ?? { result: { ok: true } }, blob: async () => new Blob(["the file's bytes"]) };
  };
  return { log, fetch };
}

/* Everything the page shows a member it could hand on: each drawn element's markup and text. */
const DRAWN = ["#browse-body", "#b-facts", "#b-md", "#b-files", "#b-history", "#b-ratify", "#inbox-body", "#m-list", "#k-list", "#m-invite",
  "#mk-sa-invite", "#cl-sa-invite", "#pf-active", "#pf-choices", "#of-list", "#of-why", "#as-state", "#mk-rc-codes", "#rs-now"];

test("R26 every request the page sends under a session carries the token only in its Authorization: Bearer header: never in its address, its query or its body, and never in a link the page draws", async () => {
  const pl = plane();
  const p = pageOver({ html: pageOf({ answered: true, result: { ok: true, group: "river-town" } }), session: { t: SENTINEL, e: 0, w: "admin" }, fetch: pl.fetch });
  await settle();
  /* the record: browse, a record, its download */
  await p.ui.openBrowse(); await settle();
  await p.ui.openBundle("INFO-2026-0001-a"); await settle();
  for (const b of p.dlbtns()) await b.fire();
  await settle();
  /* intake with a capture, then a revision of what was made */
  p.el("#n-type").value = "information"; p.el("#n-title").value = "Doc"; p.el("#n-body").value = "Body.";
  p.el("#n-loc").value = "https://records.example.org/doc.pdf"; p.el("#n-auth").value = "A records office";
  await p.el("#n-save").fire(); await settle();
  await p.el("#r-edit").fire(); await settle();
  await p.el("#e-save").fire(); await settle();
  /* the inbox and its resolve */
  await p.ui.openInbox(); await settle();
  p.el("#ir-0").value = "Spam."; for (const b of p.ibtns().slice(0, 1)) await b.fire();
  await settle();
  /* members and keys, with every act of theirs */
  await p.el("#go-members").fire(); await settle();
  p.el("#m-id").value = "bea"; p.el("#m-name").value = "volunteer-2"; await p.el("#m-add").fire(); await settle();
  p.el("#k-key").value = "ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIKGAY bio-ratify"; p.el("#k-who").value = "ada"; await p.el("#k-add").fire(); await settle();
  p.el("#mk-ha-holders").value = "Ada"; await p.el("#mk-ha-set").fire(); await settle();
  p.el("#mk-cn-tell").checked = true; await p.el("#mk-cn-set").fire(); await settle();
  p.el("#mk-ai-group").checked = true; p.el("#mk-ai-key").value = "sk-ant-key"; await p.el("#mk-ai-set").fire(); await settle();
  await p.el("#mk-rc-issue").fire(); await settle();
  p.el("#mk-sa-name").value = "Cy"; p.el("#mk-sa-id").value = "cy"; await p.el("#mk-sa-add").fire(); await settle();
  p.el("#gd-focus").value = "f"; await p.el("#gd-keep").fire(); await settle();
  p.el("#mln-tag").value = "es"; await p.el("#mln-set").fire(); await settle();
  /* the panel's acts */
  p.el("#pw-name").value = "Somewhere New"; await p.el("#pw-set").fire(); await settle();
  p.el("#of-label").value = "Clerk"; p.el("#of-note").value = "n"; await p.el("#of-set").fire(); await settle();
  await p.el("#as-toggle").fire(); await settle();
  await p.el("#pf-confirm").fire(); await settle();
  const ops = new Set(pl.log.map((c) => c.op));
  for (const op of ["stats", "whoami", "profiles", "entitieskind", "assistantstate", "list", "image", "capture", "allocid", "acquire", "attest",
                    "promote", "lease", "inbox", "inboxresolve", "memberlist", "signerlist", "memberadd", "signeradd", "hostingaccessset",
                    "courtnoticeset", "assistantset", "groupkeyset", "groupkeyswitch", "recoverycodesissue", "recoverycodesstate",
                    "adminrecoverystep", "groupdescriptionset", "memberlanguageset", "placewanted", "entitycreate", "profilesset"])
    assert.ok(ops.has(op), `not vacuous: the page sent ${op}`);
  const encoded = [SENTINEL, encodeURIComponent(SENTINEL)];
  for (const c of pl.log) {
    for (const v of encoded) {
      assert.equal(c.url.includes(v) || c.href.includes(v), false, `${c.op}: the session is in no address`);
      assert.equal(String(c.body ?? "").includes(v), false, `${c.op}: the session is in no body`);
    }
    assert.equal(new URL(c.href).searchParams.has("token"), false, `${c.op}: no token in the query`);
    if (!PUBLIC.has(c.op)) assert.equal(c.bearer, SENTINEL, `${c.op}: the session is in the header`);
  }
  for (const s of DRAWN) for (const v of encoded) assert.equal(`${p.el(s).innerHTML}${p.el(s).textContent}`.includes(v), false, s);
  assert.equal(p.replaced(), 0, "no address rewritten into the history while signed in");
});

test("R26 a captured file's download is a fetch with the header whose bytes the page hands to the browser as a file behind a short-lived object address, released once the download starts; no link carries the session", async () => {
  const pl = plane();
  const p = pageOver({ html: PAGE_HTML, session: { t: SENTINEL, e: 0, w: "admin" }, fetch: pl.fetch });
  await settle();
  await p.ui.openBundle("INFO-2026-0001-a"); await settle();
  assert.doesNotMatch(p.el("#b-files").innerHTML, /<a\b[^>]*href=[^>]*op=capture/, "the download is no link");
  const [b] = p.dlbtns();
  assert.deepEqual(b.dataset, { sha: blob, name: "doc.pdf" });
  await b.fire(); await settle();
  const got = pl.log.filter((c) => c.op === "capture");
  assert.equal(got.length, 1);
  const u = new URL(got[0].href);
  assert.deepEqual([got[0].method, got[0].bearer, u.searchParams.get("sha256"), u.searchParams.get("dl"), u.searchParams.has("token")],
                   ["GET", SENTINEL, blob, "doc.pdf", false]);
  assert.equal(p.files.length, 1);
  assert.deepEqual([p.files[0].name, p.files[0].clicked, await p.files[0].blob.text()], ["doc.pdf", true, "the file's bytes"]);
  assert.match(p.files[0].url, /^blob:/);
  assert.equal(p.files[0].url.includes(SENTINEL), false);
  assert.deepEqual(p.objectUrls.map((x) => [x.url, x.released]), [[p.files[0].url, true]], "the object address is released");
  /* the download refused: said, and nothing handed to the browser */
  const refused = plane();
  const fetch = async (url, init) => (new URL(url, ORIGIN).searchParams.get("op") === "capture"
    ? { ok: false, status: 404, json: async () => ({ ok: false, reason: "EVIDENCE_NOT_HELD", translation: "The record holds no stored copy of a document under this fingerprint." }) }
    : refused.fetch(url, init));
  const q = pageOver({ html: PAGE_HTML, session: { t: SENTINEL, e: 0, w: "admin" }, fetch });
  await settle();
  await q.ui.openBundle("INFO-2026-0001-a"); await settle();
  await q.dlbtns()[0].fire(); await settle();
  assert.equal(q.el("#dl-err").textContent, "The record holds no stored copy of a document under this fingerprint.");
  assert.equal(q.files.length, 0);
});

test("R26 a 401 answer signs the page out as today: a read, an act and a download each end the session kept for the tab and show sign-in", async () => {
  for (const op of ["list", "inboxresolve", "capture"]) {
    const pl = plane({ unauthorized: new Set([op]) });
    const p = pageOver({ html: PAGE_HTML, session: { t: SENTINEL, e: 0, w: "admin" }, fetch: pl.fetch });
    await settle();
    assert.ok(p.sandbox.sessionStorage.getItem("bio-session"), op);
    if (op === "list") { await p.ui.openBrowse(); await settle(); }
    if (op === "inboxresolve") { await p.ui.openInbox(); await settle(); p.el("#ir-0").value = "r"; await p.ibtns()[0].fire(); await settle(); }
    if (op === "capture") { await p.ui.openBundle("INFO-2026-0001-a"); await settle(); await p.dlbtns()[0].fire(); await settle(); }
    assert.ok(pl.log.some((c) => c.op === op), op);
    assert.equal(p.sandbox.sessionStorage.getItem("bio-session"), null, op);
    assert.deepEqual(p.shown(), ["#s-login"], op);
  }
  /* on load: a kept session the plane no longer honours is dropped and the page asks no more under it */
  const pl = plane({ unauthorized: new Set(["stats"]) });
  const p = pageOver({ html: PAGE_HTML, session: { t: SENTINEL, e: 0, w: "admin" }, fetch: pl.fetch });
  await settle();
  assert.deepEqual(pl.log.filter((c) => c.bearer).map((c) => c.op), ["stats"]);
  assert.equal(p.sandbox.sessionStorage.getItem("bio-session"), null);
});

test("R26 the founder's claim: the session login answers is kept for the tab and sent only in the header from then on, the claim's own requests carrying none", async () => {
  const pl = plane({ login: SENTINEL });
  const answers = pl.fetch;
  const fetch = async (url, init) => (new URL(url, ORIGIN).searchParams.get("op") === "bootstrap"
    ? (await answers(url, init), { ok: true, status: 200, json: async () => ({ claimed: false, bootstrapConfigured: true }) })
    : answers(url, init));
  const p = pageOver({ html: PAGE_HTML, hash: "#boot=one-time", fetch });
  await settle();
  p.el("#pw1").value = "the-founders-password"; p.el("#pw2").value = "the-founders-password";
  await p.el("#do-claim").fire(); await settle();
  p.el("#cl-ha-holders").value = "Ada"; await p.el("#cl-ha-set").fire(); await settle();
  await p.el("#claim-on").fire(); await settle();
  const at = pl.log.findIndex((c) => c.op === "login");
  assert.ok(at > 0);
  for (const c of pl.log.slice(0, at + 1)) assert.equal(c.bearer, null, c.op);
  const after = pl.log.slice(at + 1);
  assert.ok(after.length > 5);
  for (const c of after) {
    assert.equal(c.bearer, SENTINEL, c.op);
    assert.equal(c.href.includes(SENTINEL) || String(c.body ?? "").includes(SENTINEL), false, c.op);
  }
});
