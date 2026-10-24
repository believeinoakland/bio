/* control-plane (fix round 9, K4842; R-SEAM, R-ONE, R-CLOCK, R-NOLOAD): THE DOCUMENTS SEAM. Sections 6, 8 (R135's part first), 4, 5 and 7 of `t51-round9-seam.test.mjs` (plan 3b), a member's own acts
   through the real plane under Miniflare (its Worker, object, alarm and R2), inputs made by those acts and never a hand-written answer; counts, rows and fields, never a wall time (R-CLOCK).
     6  G126f/G128f/G129e  an uploaded ZIP opened (DOCS A1); the same archive twice and fetched (A12); 17 and 30 members promoted together, all followed (A12, R133); a transient store error
                           never files a member away for good, a refusal for its own bytes stays and is not retried, the archive's `unpack` job row is registered (A10, A11, R134)
     8  G128a/b/h           R135: `op=reading` answers `job` from the job row; a 30-page scan is never "whole" before its last OCR (SCAN C1/C4); a text page with one large image counts the
                           image unread (SCAN C11/C10); a mark of a sheet found by `op=search`, the hit's extent containing its row (SHEET J-10)
     4  G128g              the comma CSV crossing the block cut is declared with its data rows only, no cell reading the header as data, and the tab twin's table sha (B.md:13)
     5  K4833 G127a/c      two members, two PDFs sharing a part: both held, each reads its own; the same file twice is refused for the WHOLE only
     7  G129a              an RC4-128 empty-password PDF and an AES-128 user-password PDF through the upload and the ticks
   Each test title begins `R9 seam §<n> (<cause ids>):` and names the requirement ids it proves. A test that needs a provider not yet merged keeps its real assertion and says
   `(red until <module> <job> merges)` in its title. A generator option the library lacks is built here and marked `// MOVE`. A wait is a test-side poll bounded by the test (R-CLOCK); a
   count or a state is asserted, never a duration (R-NOLOAD). A sentence a member reads is never copied: a key or a field is asserted. */
import { test, after } from "node:test";
import assert from "node:assert/strict";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { makeKit, MB } from "./r8-kit.mjs";
import { makeZip } from "../../make-zip.mjs";
import { generate as pdfGenerate } from "../../pdfgen.mjs";
import { generate as sheetGenerate } from "../../sheetgen.mjs";
import { CAPTURE_SCREEN } from "../../../src/screens-intake/capture.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const PLANE = join(HERE, "../../../src/plane/index.mjs");
const DEBUG = !!process.env.R9_DEBUG;
const enc = encodeURIComponent;
const body = (a) => (a && a.result !== undefined ? a.result : a);
const SHA = /^[0-9a-f]{64}$/;
const HELD_ELSEWHERE = "CAPTURE_HELD_BY_ANOTHER_BUNDLE";
const FIELDS = [{ name: "payer", type: "string" }, { name: "payee", type: "string" }, { name: "amount", type: "number" }];
const HEADER = FIELDS.map((f) => f.name);
const ROLES = { payer: { role: "payer", scheme: "ellery_person" }, payee: { role: "payee", scheme: "ellery_person" }, amount: { role: "amount" } };
const uniq = () => `${Date.now().toString(36)}${Math.floor(Math.random() * 1e6).toString(36)}`;

/* a Worker for a fault test: the plane's own Store, with R2 `put` of a named member failing `times` times and the object's `promote` of a named member failing (a throw: the object did not
   answer) or refused (the member's own bytes) -- an injection at the platform's seam, not an answer shape; the plane under it is the real one */
export const FAULT_SCRIPT = (cfg) => `import plane, { Store as Base } from ${JSON.stringify(PLANE)};
const CFG = ${JSON.stringify(cfg)};
const left = new Map();
const take = (key, times) => { const r = left.has(key) ? left.get(key) : times; if (r <= 0) return false; left.set(key, r - 1); return true; };
const wrappers = new WeakMap();
const guard = (b) => {
  if (!b || typeof b !== "object") return b;
  if (wrappers.has(b)) return wrappers.get(b);
  const w = new Proxy(b, { get(t, k) {
    const v = t[k];
    if (typeof v !== "function") return v;
    return (...a) => {
      if (k === "put" && typeof a[0] === "string") for (const f of CFG.putFail || []) if (a[0].includes(f.sha) && take("put" + f.sha, f.times ?? 1)) return Promise.reject(new Error("injected put failure"));
      return v.apply(t, a);
    };
  } });
  wrappers.set(b, w);
  return w;
};
export class Store extends Base {
  constructor(ctx, env) { super(ctx, new Proxy(env, { get(t, k) { return k === "CAPTURES" ? guard(t[k]) : t[k]; } })); }
  async fetch(req) {
    const u = new URL(req.url);
    if (u.pathname === "/promote" && req.method === "POST" && ((CFG.promoteFail || []).length || (CFG.promoteRefuse || []).length)) {
      const text = await req.clone().text();
      for (const f of CFG.promoteFail || []) if (text.includes('"' + f.sha + '"') && take("promote" + f.sha, f.times ?? 1)) throw new Error("injected promote failure");
      for (const f of CFG.promoteRefuse || []) if (text.includes('"' + f.sha + '"')) return new Response(JSON.stringify({ ok: false, reason: "INJECTED_OWN_REFUSAL" }), { status: 409, headers: { "content-type": "application/json" } });
    }
    return super.fetch(req);
  }
}
export default plane;
`;

export function sections(kit, counting) {
  const te = kit.te;

  /* ---- worlds of this module: a kit whose Worker can call itself (the plane's `SELF` and `DAEMON_TOKEN`, which the pending drain's `unpack` row needs), with a fault script when asked,
     and OCR / PDF members as plain functions the way the round-5 seam binds them ---- */
  const worlds = [];
  after(() => { for (const w of worlds) { try { w.mf.dispose(); } catch { /* gone */ } } });
  function world(tag, { faults = null, members = {} } = {}) {
    let k;
    k = makeKit({ tag, bindings: { DAEMON_TOKEN: `dmn-${tag}-0123456789abcdef` },
                  serviceBindings: { SELF: (req) => k.mf.dispatchFetch(req), ...members } });
    if (faults) k.ready = k.mf.setOptions({ ...k.OPTIONS, script: FAULT_SCRIPT(faults), scriptPath: join(HERE, "r9-fault-entry.worker.mjs") });
    else k.ready = Promise.resolve();
    worlds.push(k);
    return k;
  }
  let archivesOnce = null;
  const archives = () => (archivesOnce ??= world("r9docs"));

  /* ---- the member's acts ---- */
  async function upload(k, auth, bytes, { name, type }) {
    const res = await k.plane(`/api/?op=captureupload&statement=${enc(name)}&name=${enc(name)}&type=${enc(type)}`, { method: "POST", headers: auth, body: bytes });
    const json = await res.json();
    return { status: res.status, up: json.result ?? json, headers: res.headers };
  }
  const fileIt = async (k, auth, up, { title, project = "" }) => {
    const made = await CAPTURE_SCREEN.parts.promoteDocument(k.screenCall(auth), { doc: up.document, title, locator: up.document.locator, project });
    assert.equal(made.refused, undefined, "promoted: " + JSON.stringify(made).slice(0, 400));
    return made.bundleId;
  };
  const readingOf = async (k, auth, sha) => body(await k.get(auth, { op: "reading", sha256: sha }));
  const rowsOf = async (k, auth, sha) => (body(await k.get(auth, { op: "owedwork", sha })) || {}).owed || [];
  /* G164: a row that ended `finished` is no longer owed; the last run of its (digest, kind) stands in `last`. The rows a digest has are the owed ones plus its last runs. */
  const rowsAndLast = async (k, auth, sha) => { const w = body(await k.get(auth, { op: "owedwork", sha })) || {}; return [...(w.owed || []), ...(w.last || [])]; };
  const listOf = async (k, auth, archive) => body(await k.get(auth, { op: "archivelist", archive, limit: "1000" })) || {};
  /* "searchable" is asked of the member's find-in-this-document (op=search answers bundles by their own words, not a capture's units) */
  const findIn = async (k, auth, sha, term) => { const f = body((await k.post(auth, "findin", { scope: { capture: sha }, kinds: ["term"], term })).body); return ((f && f.kinds || [])[0] || {}).items || []; };
  const textOf = (r) => JSON.stringify(r || {});

  /* ======================================== 6 · G126f, G128f, G129e ======================================== */

  /* three text members, each with a marker word of its own (the digest is the run's: the same archive in two runs is two archives) */
  const zipOf = (tag, n = 3) => {
    const members = Array.from({ length: n }, (_, i) => ({ name: `m${String(i + 1).padStart(3, "0")}.txt`, mark: `ZIPWORD${i + 1}X${tag}`,
      data: te(`Member ${i + 1} of the archive ${tag}. The clerk filed the marker ZIPWORD${i + 1}X${tag} in the register.\n`.repeat(3)) }));
    return { members, bytes: makeZip(members.map((m) => ({ name: m.name, data: m.data }))) };
  };
  const memberEntries = (list) => (list.entries || []).filter((e) => e.kind === "file");

  test("R9 seam §6 (G126f, DOCS A1; R134 R130 R133 R135): an uploaded ZIP of 3 text members is opened like a fetched one: each member filed under the project, read, searchable; the archive is read separately", { timeout: 600000 }, async () => {
    const k = archives();
    await k.ready;
    const ann = (await k.ownerOf("r9d-ann")).auth;
    const project = await k.projectOf(ann, `R9 zip project ${uniq()}`);
    const tag = uniq();
    const z = zipOf(tag);
    const { up } = await upload(k, ann, z.bytes, { name: `archive-${tag}.zip`, type: "application/zip" });
    assert.equal(up.ok, true, JSON.stringify(up).slice(0, 400));
    const archiveSha = up.capture.sha256;
    /* capture registers the archive's `unpack` job in the filing transaction (R109/G126f): a row, or an end, but the work is registered */
    const archiveBundle = await fileIt(k, ann, up, { title: `archive-${tag}`, project });
    assert.ok(archiveBundle, "the archive is filed under the project");
    /* every member is filed under the project (its home is a bundle of the project), within the ticks */
    let list = {};
    const done = await k.until(async () => {
      list = await listOf(k, ann, archiveSha);
      const es = memberEntries(list);
      return es.length === 3 && es.every((e) => e.state === "filed" && typeof e.bundle === "string" && e.bundle) ? true : null;
    }, 150000, 2000);
    const states = memberEntries(list).map((e) => `${e.name}:${e.state}:${e.bundle ? "home" : "no home"}`).join(" ");
    assert.ok(done, `each member of the uploaded archive is filed and has a home (the archive is opened, as a fetched one is): ${states}`);
    const held = JSON.stringify(body(await k.get(ann, { op: "heldcaptures", project })));
    for (const e of memberEntries(list)) assert.ok(held.includes(e.sha256), `member ${e.name} is held under the project`);
    /* each member read and searchable: the marker word of each is found, and the hit is the member's own bundle */
    for (const [i, e] of memberEntries(list).entries()) {
      const found = await k.until(async () => { const r = await readingOf(k, ann, e.sha256); return r && r.found === true ? r : null; }, 90000, 2000);
      assert.ok(found, `member ${e.name} has a reading`);
      assert.ok(textOf(found).includes(z.members[i].mark), `member ${e.name}'s reading holds its words`);
      const hit = await k.until(async () => { const h = await findIn(k, ann, e.sha256, z.members[i].mark); return h.length ? h : null; }, 60000, 2000);
      assert.ok(hit, `finding ${z.members[i].mark} in member ${e.name}'s own document`);
    }
    /* the archive's own reading is made separately from its members: it holds none of their words */
    const own = await k.until(async () => { const r = await readingOf(k, ann, archiveSha); return r && r.found === true ? r : null; }, 90000, 2000);
    assert.ok(own, "the archive has a reading of its own");
    for (const m of z.members) assert.ok(!textOf(own).includes(m.mark), `the archive's own reading does not hold member ${m.name}'s words (they are read separately)`);
    /* R135: what the job state says agrees with the rows, for the archive and for each member */
    for (const sha of [archiveSha, ...memberEntries(list).map((e) => e.sha256)]) {
      const r = await readingOf(k, ann, sha);
      if (r && r.found === true) {
        assert.ok(r.job && typeof r.job === "object", "op=reading answers `job` beside a reading");
        const rows = (await rowsAndLast(k, await k.founder(), sha)).filter((x) => x.kind === "reading" || x.kind === "ocr");
        assert.equal(r.job.state === null, rows.length === 0, `job.state is null exactly when no reading row exists (state ${r.job.state}, rows ${rows.length})`);
      }
    }
  });

  /* the same archive uploaded twice, and fetched and uploaded: one set of members, none filed twice (A12) */
  test("R9 seam §6 (G126f, G128f, DOCS A12; R134 R130): the same archive uploaded twice, and fetched and uploaded, is one set of members", { timeout: 600000 }, async () => {
    const k = archives();
    await k.ready;
    const ann = (await k.ownerOf("r9d-ann")).auth;
    const project = await k.projectOf(ann, `R9 zip twice ${uniq()}`);
    const tag = uniq();
    const z = zipOf(tag);
    const first = (await upload(k, ann, z.bytes, { name: `twice-${tag}.zip`, type: "application/zip" })).up;
    assert.equal(first.ok, true, JSON.stringify(first).slice(0, 300));
    const archiveSha = first.capture.sha256;
    await fileIt(k, ann, first, { title: `twice-${tag}`, project });
    const homes = async () => { const l = await listOf(k, ann, archiveSha); return memberEntries(l).map((e) => ({ sha: e.sha256, bundle: e.bundle, state: e.state })); };
    const settled = await k.until(async () => { const h = await homes(); return h.length === 3 && h.every((x) => x.state === "filed" && x.bundle) ? h : null; }, 150000, 2000);
    assert.ok(settled, "the first upload's members are filed and have homes: " + JSON.stringify(await homes()));
    const again = (await upload(k, ann, z.bytes, { name: `twice-${tag}.zip`, type: "application/zip" })).up;
    assert.equal(again.ok, true, JSON.stringify(again).slice(0, 300));
    assert.equal(again.existed, true, "the same bytes uploaded again are held already");
    const name = `fetched-${tag}.zip`;
    k.serve(name, z.bytes, { type: "application/zip" });
    const fetched = await k.acquire(ann, { locator: `https://www.example.gov/files/${name}`, project });
    assert.equal(fetched.status, 200, JSON.stringify(fetched.body).slice(0, 400));
    await k.later(8000);
    const after = await homes();
    assert.deepEqual(after.map((x) => x.sha).sort(), settled.map((x) => x.sha).sort(), "the same three members after the second upload and the fetch");
    assert.deepEqual(after.map((x) => x.bundle).sort(), settled.map((x) => x.bundle).sort(), "no member was filed a second time: each keeps its one home");
  });

  /* N documents promoted together, as the capture screen promotes one with its reading left out (`promoteDocument`'s `readingDropped`), here with N documents in the one file: the door follows each */
  async function promoteTogether(k, auth, docs, { title, project }) {
    const cs = k.screenCall(auth);
    const now = new Date().toISOString().split(".")[0] + "Z";
    const minted = body(await cs.call("allocid", { query: { prefix: "INFO", year: now.slice(0, 4) } }));
    assert.ok(minted && minted.id, "an id: " + JSON.stringify(minted));
    const id = `${minted.id}-${title.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 30).replace(/-+$/, "")}`;
    const unread = docs.map((d) => { const { reading: _r, text_units: _u, text_units_over_bound: _o, text_units_skipped: _s, ...rest } = d; return rest; });
    const text = ["---", "id: " + id, "object_type: information", "schema: information@2", "title: " + JSON.stringify(title), "current_state: collected", "prior_state: null",
      "created: " + now, "last_updated: " + now, "produced_by:", "  mode: assisted", "  capability_tier: session", "references: []", "state_history: []", "annotations_open: 0",
      "reeval_pending:", "  flag: false", "  since: null", "  source: null", "visuals: []", "criticality: supporting", "source_status: unchanged",
      ...(project ? ["project: " + project] : []), "source:", "  locator: " + JSON.stringify("upload:together"), "  authority: member-entered", "  retrieved: " + now,
      "monitoring:", "  enabled: false", "  frequency: none", "---", "", "## Summary", "", title, "", "## Provenance Notes", "", "## Session Log", "", "## Review Notes", ""].join("\n");
    const prov = JSON.stringify({ documents: unread }, null, 1);
    const sized = (t) => ({ path: null, text: t, bytes: new TextEncoder().encode(t).length, sha256: kit.sha(te(t)) });
    const files = [{ ...sized(text), path: "bundle.md" }, { ...sized(prov), path: "data/provenance.json" },
      ...docs.map((d) => ({ path: d.file, blobSha: d.capture.sha256, sha256: d.capture.sha256, bytes: d.capture.bytes }))];
    const register = docs.map((d) => ({ sha256: d.capture.sha256, path: d.file, encoding: d.capture.encoding, bytes: d.capture.bytes }));
    const done = await cs.call("promote", { body: { bundleId: id, base: null, snapKey: now.replace(/[-:]/g, "") + "_" + uniq().padEnd(8, "0").slice(0, 8),
      meta: { object_type: "information", title, current_state: "collected", created: now, last_updated: now }, files, register } });
    return { answer: body(done), bundleId: id };
  }
  async function manyDocs(k, auth, n, tag) {
    const docs = [];
    for (let i = 0; i < n; i++) {
      const { up } = await upload(k, auth, te(`Document ${i + 1} of ${n} promoted together ${tag}. Marker TOGETHER${i + 1}X${tag} stands in the minutes.\n`), { name: `t${i + 1}-${tag}.txt`, type: "text/plain" });
      assert.equal(up.ok, true, JSON.stringify(up).slice(0, 300));
      docs.push(up.document);
    }
    return docs;
  }
  /* each digest is followed: it has a reading or a `reading` job row (R133; plane R97), asked as the member (she sees the documents she filed) */
  async function followedState(k, auth, shas) {
    const out = [];
    for (const sha of shas) {
      let r = await readingOf(k, auth, sha);
      if (r && r.found === true) { out.push({ sha, how: "reading" }); continue; }
      const rows = (await rowsOf(k, auth, sha)).filter((x) => x.kind === "reading" || x.kind === "ocr");
      if (rows.length) { out.push({ sha, how: "row", state: rows[0].job_state }); continue; }
      r = await readingOf(k, auth, sha);
      out.push(r && r.found === true ? { sha, how: "reading" } : { sha, how: "dropped" });
    }
    return out;
  }
  for (const n of [3, 17, 30]) {
    test(`R9 seam §6 (G128f, DOCS A12; R133 R123 R130): ${n} documents promoted together are all followed, each with a reading or a \`reading\` job row, none dropped${n === 3 ? " (control: a promotion of 3 follows 3)" : ""}`, { timeout: 600000 }, async () => {
      const ann = (await kit.ownerOf("r9d-bea")).auth;
      const project = await kit.projectOf(ann, `R9 together ${n} ${uniq()}`);
      const tag = uniq();
      const docs = await manyDocs(kit, ann, n, tag);
      const shas = docs.map((d) => d.capture.sha256);
      const { answer, bundleId } = await promoteTogether(kit, ann, docs, { title: `together ${n} ${tag}`, project });
      assert.equal(answer.ok, true, JSON.stringify(answer).slice(0, 400));
      assert.ok(!answer.reading_refused, "no document's owed reading is without a row: " + JSON.stringify(answer.reading_refused));
      const state = await followedState(kit, ann, shas);
      const dropped = state.filter((x) => x.how === "dropped");
      assert.equal(dropped.length, 0, `all ${n} are followed; dropped: ${dropped.map((x) => shas.indexOf(x.sha) + 1).join(",")} of ${n} (READING_FOLLOWED_MAX is the inline reads in a request, not a limit on what is followed)`);
      /* and the ticks read them: the last document's marker is searchable (R-STOP) */
      const last = await kit.until(async () => ((await findIn(kit, ann, shas[n - 1], `TOGETHER${n}X${tag}`)).length ? true : null), 150000, 3000);
      assert.ok(last, `the ${n}th document's last word is found in it once the ticks have read it (${bundleId})`);
    });
  }

  /* A10, A11: transient faults. The archive is fetched by address (the door promotes what the unpack files, in the member's own request, so its answer is read). */
  async function faulted(tag, entries, faults) {
    const cfg = faults(entries);
    const k = world(tag, { faults: cfg });
    await k.ready;
    return k;
  }
  const nEntries = 8;
  const entriesOf = (tag) => Array.from({ length: nEntries }, (_, i) => ({ name: `e${String(i + 1).padStart(3, "0")}.txt`, mark: `FAULTWORD${i + 1}X${tag}`,
    data: te(`Entry ${i + 1} of the fault archive ${tag}. Marker FAULTWORD${i + 1}X${tag} is in the register.\n`) }));

  test("R9 seam §6 (G129e, DOCS A11; R134 R130): a put fails for one entry and the promotion fails for entry 3: no member is `not_filed` for good, the archive's `unpack` job row is registered (`unpack_pending`), and the ticks file every member under the project", { timeout: 900000 }, async () => {
    const tag = uniq();
    const entries = entriesOf(tag);
    const sha = (i) => kit.sha(entries[i].data);
    const k = await faulted(`r9flt${tag.slice(0, 6)}`, entries, () => ({ putFail: [{ sha: sha(5), times: 1 }], promoteFail: [{ sha: sha(2), times: 1 }] }));
    const ann = (await k.ownerOf("r9f-ann")).auth;
    const project = await k.projectOf(ann, `R9 fault ${tag}`);
    const zip = makeZip(entries.map((e) => ({ name: e.name, data: e.data })));
    const name = `fault-${tag}.zip`;
    k.serve(name, zip, { type: "application/zip" });
    const seen = [];
    const press = await k.acquire(ann, { locator: `https://www.example.gov/files/${name}`, project });
    assert.equal(press.status, 200, JSON.stringify(press.body).slice(0, 500));
    const archiveSha = kit.sha(zip);
    const answer = press.body;
    const pending = (answer.not_promoted || []).filter((n) => n.transient === true);
    assert.ok(pending.some((n) => n.sha256 === sha(2)), `the member whose promotion failed (entry 3) is named transient in not_promoted: ${JSON.stringify(answer.not_promoted)}`);
    assert.equal(answer.unpack_pending, true, `the answer states that the archive's unpack job is registered: ${JSON.stringify({ unpack_pending: answer.unpack_pending, unpack_refused: answer.unpack_refused })}`);
    const rows = await rowsOf(k, ann, archiveSha);
    assert.ok(rows.some((r) => r.kind === "unpack"), `an \`unpack\` job row for the archive: ${JSON.stringify(rows.map((r) => [r.kind, r.state, r.job_state]))}`);
    /* never `not_filed` for good, at any look from the press to the end; and at the end every member is filed with a home in the project */
    let list = {};
    const done = await k.until(async () => {
      list = await listOf(k, ann, archiveSha);
      seen.push(memberEntries(list).map((e) => e.state));
      const es = memberEntries(list);
      return es.length === nEntries && es.every((e) => e.state === "filed" && e.bundle) ? true : null;
    }, 240000, 3000);
    const flat = seen.flat();
    assert.ok(!flat.includes("not_filed"), `no member is marked not_filed at any look: ${[...new Set(flat)].join(",")}`);
    assert.ok(done, `every member is filed and has a home in the end: ${memberEntries(list).map((e) => `${e.name}:${e.state}:${e.bundle ? "home" : "none"}`).join(" ")}`);
    const held = JSON.stringify(body(await k.get(ann, { op: "heldcaptures", project })));
    for (const i of [0, 2, 5, 7]) assert.ok(held.includes(sha(i)), `entry ${i + 1} is held under the project (a continuation or retried member keeps the project)`);
  });

  test("R9 seam §6 (G129e, DOCS A11 control; R134): a member refused for its own bytes stays named in `not_promoted` without `transient`, and no `unpack` row is registered for it", { timeout: 900000 }, async () => {
    const tag = uniq();
    const entries = entriesOf(tag).slice(0, 4);
    const sha = (i) => kit.sha(entries[i].data);
    const k = await faulted(`r9own${tag.slice(0, 6)}`, entries, () => ({ promoteRefuse: [{ sha: sha(1) }] }));
    const ann = (await k.ownerOf("r9o-ann")).auth;
    const project = await k.projectOf(ann, `R9 own refusal ${tag}`);
    const zip = makeZip(entries.map((e) => ({ name: e.name, data: e.data })));
    const name = `own-${tag}.zip`;
    k.serve(name, zip, { type: "application/zip" });
    const press = await k.acquire(ann, { locator: `https://www.example.gov/files/${name}`, project });
    assert.equal(press.status, 200, JSON.stringify(press.body).slice(0, 500));
    const refused = (press.body.not_promoted || []).find((n) => n.sha256 === sha(1));
    assert.ok(refused, `the refused member is named in not_promoted: ${JSON.stringify(press.body.not_promoted)}`);
    assert.notEqual(refused.transient, true, "a refusal for its own bytes is not transient");
    assert.ok(typeof refused.code === "string" && refused.code, "its code is stated");
    assert.notEqual(press.body.unpack_pending, true, "nothing is owed for a member refused for its own bytes");
    const rows = await rowsOf(k, ann, kit.sha(zip));
    if (DEBUG) console.log("OWN-REFUSAL rows", JSON.stringify(rows.map((r) => [r.kind, r.state])));
  });

  /* a continuation: more entries than one call files (UNPACK_CALL_ENTRIES = 100, acquisition R40), the rest filed by the daemon's `unpack` row: those members keep the project (G129e) */
  test("R9 seam §6 (G129e, DOCS A11/A10; R134): the members of a continuation (past the 100 entries a call files) are promoted into the archive's project as the first members are", { timeout: 900000 }, async () => {
    const k = archives();
    await k.ready;
    const ann = (await k.ownerOf("r9d-cat")).auth;
    const project = await k.projectOf(ann, `R9 continuation ${uniq()}`);
    const tag = uniq();
    const COUNT = 103;
    const members = Array.from({ length: COUNT }, (_, i) => ({ name: `c${String(i + 1).padStart(4, "0")}.txt`, data: te(`Continuation member ${i + 1} ${tag}.\n`) }));
    const zip = makeZip(members);
    const name = `cont-${tag}.zip`;
    k.serve(name, zip, { type: "application/zip" });
    const press = await k.acquire(ann, { locator: `https://www.example.gov/files/${name}`, project });
    assert.equal(press.status, 200, JSON.stringify(press.body).slice(0, 500));
    const archiveSha = kit.sha(zip);
    let list = {};
    const done = await k.until(async () => {
      list = await listOf(k, ann, archiveSha);
      const es = memberEntries(list);
      return es.length === COUNT && es.every((e) => e.state === "filed" && e.bundle) ? true : null;
    }, 300000, 4000);
    const tally = memberEntries(list).reduce((m, e) => { const key = `${e.state}${e.bundle ? "+home" : ""}`; m[key] = (m[key] || 0) + 1; return m; }, {});
    assert.ok(done, `all ${COUNT} members are filed with a home (the continuation's included): ${JSON.stringify(tally)}`);
    /* a member shows beside its archive in `heldcaptures` (rows are archives), so each is asked for its own copy: the project it is filed under */
    const last = memberEntries(list).slice(-3);
    for (const e of last) {
      const h = body(await k.get(ann, { op: "heldat", sha256: e.sha256 }));
      assert.ok(h && h.held === true && h.copy && h.copy.project === project, `continuation member ${e.name} is held under the archive's project: ${JSON.stringify(h && h.copy && h.copy.project)}`);
    }
  });

  /* ======================================== 8 · R135 (the job state), G128a, G128b, G128h ======================================== */

  test("R9 seam §8 (R135, G126; R135 R130 R100): `op=reading` answers `job` from the job row: a digest with a reading carries `job`, and its state agrees with the row; a digest nobody holds is `found: false` with `state: null`", { timeout: 600000 }, async () => {
    const ann = (await kit.ownerOf("r9r-ann")).auth;
        const project = await kit.projectOf(ann, `R9 job state ${uniq()}`);
    const tag = uniq();
    const { up } = await upload(kit, ann, te(`The register of job state ${tag}. Marker JOBSTATE${tag} is filed.\n`), { name: `job-${tag}.txt`, type: "text/plain" });
    assert.equal(up.ok, true, JSON.stringify(up).slice(0, 300));
    const sha = up.capture.sha256;
    await fileIt(kit, ann, up, { title: `job-${tag}`, project });
    const r = await kit.until(async () => { const x = await readingOf(kit, ann, sha); return x && x.found === true ? x : null; }, 90000, 1500);
    assert.ok(r, "the reading is found");
    assert.ok(r.job && typeof r.job === "object", `op=reading answers \`job\` beside a reading: ${JSON.stringify(Object.keys(r))}`);
    const admin = await kit.founder();
    const rows = (await rowsOf(kit, admin, sha)).filter((x) => x.kind === "reading" || x.kind === "ocr");
    assert.ok(rows.length >= 1, `the upload registered a reading row (R130): ${JSON.stringify(rows)}`);
    assert.equal(typeof r.job.state, "string", `the job state is the row's: ${JSON.stringify(r.job)}`);
    assert.equal(r.job.state, rows.find((x) => x.kind === "reading")?.job_state ?? rows[0].job_state, "the state is the row's job_state");
    for (const key of ["written", "skipped", "owed", "failed"]) assert.equal(typeof r.job[key], "number", `the counter ${key} is a number`);
    /* a digest nobody holds: absent, state null */
    const none = await readingOf(kit, ann, "0".repeat(63) + "1");
    assert.equal(none.found, false);
    assert.equal(none.job && none.job.state, null, "no row, no reading: state null");
  });

  /* ======================================== 4 · G128g ======================================== */

  const csvOf = (rows, tag, sep = ",") => {
    const lines = [HEADER.join(sep)];
    for (let i = 0; i < rows; i++) lines.push([`P${tag}${String(i).padStart(6, "0")}`, "P002", (i % 97) + 1].join(sep));
    return te(lines.join("\n") + "\n");
  };
  async function declareFile(k, auth, bytes, name) {
    const { up } = await upload(k, auth, bytes, { name, type: "text/csv" });
    assert.equal(up.ok, true, JSON.stringify(up).slice(0, 400));
    const made = await CAPTURE_SCREEN.parts.promoteDocument(k.screenCall(auth), { doc: up.document, title: name, locator: up.document.locator, project: "" });
    assert.equal(made.refused, undefined, JSON.stringify(made).slice(0, 400));
    const bundleId = made.bundleId || up.document.bundleId;
    assert.ok(bundleId, "the document's bundle: " + JSON.stringify(made).slice(0, 300));
    const minted = await k.post(auth, "contentmint", { bundleId });
    const contentId = minted.body.result && (minted.body.result.id || minted.body.result.content_id || minted.body.result.contentId);
    assert.ok(contentId, "content minted: " + JSON.stringify(minted.body).slice(0, 400));
    const declared = await k.post(auth, "tabledeclare", { source: contentId, schema: { fields: FIELDS }, header: HEADER, roles: ROLES });
    return { declared: declared.body.result || declared.body, contentId };
  }
  /* the walker's file is 18,098 rows (about 420 KB); the failure needs the file read in pieces, so the case is the smallest that crosses the CSV block cut: a header-and-data file of
     ROWS rows is over 128 KiB and holds more than one block (the header repeated at the second block's head was the extra row) */
  test("R9 seam §4 (G128g, B.md:13; R100 R123): a comma CSV past the 128 KiB block cut is declared from its bytes: `rows` is the data rows, no undetermined cell, and the tab twin has the same table sha (red until content 29, calculations 31 merge)", { timeout: 900000 }, async () => {
    const ann = await kit.person("r9c-ann");
    const ROWS = 8000;
    const bytes = csvOf(ROWS, "R9C", ",");
    assert.ok(bytes.length > 128 * 1024, `the case crosses the block cut (${bytes.length} B)`);
    const tab = (await declareFile(kit, ann, csvOf(ROWS, "R9C", "\t"), "r9c.tsv")).declared;
    const comma = (await declareFile(kit, ann, bytes, "r9c.csv")).declared;
    const facts = `comma: rows ${comma.rows}, undetermined ${comma.undetermined && comma.undetermined.count}, sha ${String(comma.sha).slice(0, 12)}; tab: rows ${tab.rows}, undetermined ${tab.undetermined && tab.undetermined.count}, sha ${String(tab.sha).slice(0, 12)}`;
    assert.equal(comma.ok, true, "the comma file is declared: " + JSON.stringify(comma).slice(0, 400));
    assert.equal(tab.ok, true, "the tab file is declared: " + JSON.stringify(tab).slice(0, 400));
    assert.equal(comma.rows, ROWS, `the comma file's table holds its ${ROWS} data rows and no repeated header line: ${facts}`);
    assert.equal(comma.undetermined.count, 0, `no cell reads the header text as data: ${facts}; first ${String(JSON.stringify(comma.undetermined.cells && comma.undetermined.cells[0])).slice(0, 200)}`);
    assert.equal(tab.rows, ROWS, `the tab file's table holds its ${ROWS} data rows: ${facts}`);
    assert.equal(tab.undetermined.count, 0, `no undetermined cell in the tab table: ${facts}`);
    assert.equal(comma.sha, tab.sha, `the same rows declared from the comma file and from the tab file are the one table: ${facts}`);
  });

  /* ======================================== 5 · K4833, G127a, G127c ======================================== */

  /* the repro's two PDFs: `pdfOf` of same-length words and the SAME filler stream (not randomised), ten MiB each, so part 2 (bytes 8 MiB to the end) is byte-equal and the wholes differ */
  async function press(auth, k, name, bytes) {
    k.serve(name, bytes, {});
    const locator = `https://www.example.gov/files/${name}`;
    return { r: await k.acquire(auth, { locator }), locator, auth };
  }
  const waitHeld = async (k, p) => { p.held = await k.until(async () => { const x = body(await k.get(p.auth, { op: "heldat", address: p.locator })); return x && x.held === true ? x : null; }, 540000, 2000); return p; };
  const pressed = async (auth, k, name, bytes) => waitHeld(k, await press(auth, k, name, bytes));
  test("R9 seam §5 (K4833, G127a, G127c; R120 R123 R125): two members' PDFs sharing an 8 MiB part are both held, each reads its own document, and no part is refused as held by another bundle (red until provenance 21, screens-intake 35 merge)", { timeout: 900000 }, async () => {
    const k = kit;
    const tag = "zebra";
    const W1 = `R9 ${tag}one the first page words`, W2 = `R9 ${tag}two the first page words`;
    assert.equal(W1.length, W2.length, "same-length words, so the filler stream and part 2 are the same");
    const a = k.pdfOf(W1, 10 * MB), b = k.pdfOf(W2, 10 * MB);
    assert.notEqual(k.sha(a), k.sha(b), "two distinct wholes");
    assert.equal(Buffer.compare(Buffer.from(a.subarray(8 * MB)), Buffer.from(b.subarray(8 * MB))), 0, "a byte-equal part 2 (the shape of K4833)");
    const m1 = await k.person("r9k-ann", "member", ["contribute"]), m2 = await k.person("r9k-bea", "member", ["contribute"]);
    const p1 = await press(m1, k, `r9-k1-${uniq()}.pdf`, a);
    const p2 = await press(m2, k, `r9-k2-${uniq()}.pdf`, b);
    await Promise.all([waitHeld(k, p1), waitHeld(k, p2)]);
    const admin = await k.founder();
    for (const [who, p] of [["first", p1], ["second", p2]]) {
      const session = p.r.body && p.r.body.fetch_pending && p.r.body.fetch_pending.session;
      const row = session ? (await rowsOf(k, admin, session)).find((x) => x.sha === session) : null;
      assert.ok(p.held, `the ${who} member's PDF is held${row ? ` (its fetch row: ${JSON.stringify(row).slice(0, 600)})` : ""}`);
      assert.notEqual(row && row.why, HELD_ELSEWHERE, `the ${who} member's fetch is not refused as held by another bundle`);
    }
    /* each reads its own: the words of its own first page, and not the other's, by the ticks */
    for (const [m, own, other, bytes] of [[m1, `${tag}one`, `${tag}two`, a], [m2, `${tag}two`, `${tag}one`, b]]) {
      const found = await k.until(async () => { const r = await readingOf(k, m, k.sha(bytes)); return r && r.found === true ? r : null; }, 240000, 3000);
      assert.ok(found, `the member reads her own document (${own})`);
      assert.ok(textOf(found).includes(own) && !textOf(found).includes(other), `her reading holds ${own} and not ${other}`);
    }
  });

  test("R9 seam §5 (K4833, G127a, G127c; R100 R123): the same two PDFs uploaded and promoted by two members: both held, each reads its own, no `CAPTURE_HELD_BY_ANOTHER_BUNDLE` for a part (red until provenance 21, capture 24, screens-intake 35 merge)", { timeout: 900000 }, async () => {
    const k = kit;
    const tag = "otter";
    const W1 = `R9 ${tag}one the first page words`, W2 = `R9 ${tag}two the first page words`;
    const a = k.pdfOf(W1, 10 * MB), b = k.pdfOf(W2, 10 * MB);
    const m1 = await k.person("r9k-cy", "member", ["contribute"]), m2 = await k.person("r9k-dee", "member", ["contribute"]);
    const filed = [];
    for (const [m, bytes, n] of [[m1, a, 1], [m2, b, 2]]) {
      const { up } = await upload(k, m, bytes, { name: `r9-${tag}-${n}.pdf`, type: "application/pdf" });
      assert.equal(up.ok, true, `upload ${n}: ` + JSON.stringify(up).slice(0, 300));
      const bundle = await fileIt(k, m, up, { title: `r9-${tag}-${n}`, project: "" });   /* the screen's promotion: refused here when a part is another bundle's row */
      filed.push({ m, bundle, sha: up.capture.sha256, own: `${tag}${n === 1 ? "one" : "two"}`, other: `${tag}${n === 1 ? "two" : "one"}` });
    }
    for (const f of filed) {
      assert.ok(f.bundle, "the document is filed");
      const found = await k.until(async () => { const r = await readingOf(k, f.m, f.sha); return r && r.found === true ? r : null; }, 240000, 3000);
      assert.ok(found, `the member reads her own document (${f.own})`);
      assert.ok(textOf(found).includes(f.own) && !textOf(found).includes(f.other), `her reading holds ${f.own} and not ${f.other}`);
    }
  });

  test("R9 seam §5 (K4833, G127c; R120 R123): the same file pressed by a second member is refused for the WHOLE only: `kind: whole` and the holder (red until provenance 21 merges)", { timeout: 900000 }, async () => {
    const k = kit;
    const tag = "heron";
    const a = k.pdfOf(`R9 ${tag}one the first page words`, 10 * MB);
    const m1 = await k.person("r9k-eli", "member", ["contribute"]), m2 = await k.person("r9k-fay", "member", ["contribute"]);
    const p1 = await pressed(m1, k, `r9-w1-${uniq()}.pdf`, a);
    assert.ok(p1.held, "the first member's copy is held");
    const second = `r9-w2-${uniq()}.pdf`;
    k.serve(second, a, {});
    const press = await k.acquire(m2, { locator: `https://www.example.gov/files/${second}` });
    assert.equal(press.status, 200, JSON.stringify(press.body).slice(0, 400));
    const session = press.body.fetch_pending && press.body.fetch_pending.session;
    const admin = await k.founder();
    let row = null;
    if (session) row = await k.until(async () => { const r = (await rowsOf(k, admin, session)).find((x) => x.sha === session); return r && r.state === "final" ? r : null; }, 120000, 2000);
    const text = JSON.stringify({ body: press.body, row });
    assert.ok(text.includes(HELD_ELSEWHERE), `the same bytes pressed by another member are refused as held by another bundle: ${text.slice(0, 500)}`);
    /* plane R97: the row keeps the refusal's facts in `failed_why[<code>]`, as provenance answered them (control-plane R124, G160) */
    const facts = (row && row.failed_why && row.failed_why[HELD_ELSEWHERE]) || {};
    assert.equal(facts.kind, "whole", `the refusal is for the whole only: ${JSON.stringify(row && row.failed_why)}`);
    assert.equal(facts.sha, k.sha(a), `and names the digest refused: ${JSON.stringify(facts)}`);
    /* D-15: provenance names the holder only to a caller who may see the holder's record; the second member shares no project with the first, so it is null */
    assert.equal(facts.holder ?? null, null, `the holder is not named to a member who cannot see it: ${JSON.stringify(facts)}`);
  });

  /* ======================================== 7 · G129a ======================================== */

  /* the tier-2 member (pdf-worker's R42/R43 contract for the range asked, from the generator's truth) and the OCR member, bound as the round-5 seam binds them */
  const jsonResponse = (o, status = 200) => new Response(JSON.stringify(o), { status, headers: { "content-type": "application/json" } });
  function pdfMember(truthOf) {
    const calls = [];
    return { calls, fn: async (req) => {
      let b = {};
      try { b = await req.json(); } catch { b = {}; }
      calls.push(b);
      const truth = truthOf(b);
      if (!truth) return jsonResponse({ ok: false, reason: "UNKNOWN" }, 404);
      if (truth.locked) {
        const marker = { page: null, reason: "password_required", font: null, codes: "", count: 0 };
        return jsonResponse({ ok: true, tier: 1, text: { document: "", pages: [], undetermined: [marker], counts: { chars: 0, undetermined: 1 } } });
      }
      const from = b.from ?? 0, last = Math.min(truth.pages, from + (b.count ?? truth.pages));
      const pages = [], undetermined = [];
      for (let i = from; i < last; i++) {
        const t = truth.page(i + 1);
        const text = t.lines.join("\n");
        const u = text ? [] : [{ page: i, reason: "no_text_layer", font: null, codes: "", count: 0 }];
        pages.push({ page: i, text, undetermined: u }); undetermined.push(...u);
      }
      const document = pages.map((p) => p.text).filter(Boolean).join("\n");
      return jsonResponse({ ok: true, tier: 2, text: { document, pages, undetermined, counts: { chars: document.length, undetermined: undetermined.length } } });
    } };
  }
  let encryptedOnce = null;
  const encryptedWorld = () => (encryptedOnce ??= (() => {
    const truths = new Map();
    const member = pdfMember(() => truths.get("current"));
    const k = world("r9enc", { members: { PDF_WORKER: member.fn } });
    return { k, truths, member };
  })());

  async function throughTicks(k, auth, sha, { max = 90000 } = {}) {
    /* the row of the digest, sampled until it ends: each sample is (attempts, state, cursor), the ticks the ledger ran between them */
    const samples = [];
    const end = Date.now() + max;
    for (;;) {
      const rows = (await rowsOf(k, await k.founder(), sha)).filter((x) => x.kind === "reading");
      const row = rows[0] || null;
      samples.push(row ? { attempts: row.attempts, state: row.state, job_state: row.job_state, cursor: JSON.stringify(row.cursor ?? (row.detail && row.detail.cursor) ?? null), why: row.why } : null);
      if (!row || row.state === "final" || row.job_state === "finished" || row.job_state === "final" || Date.now() > end) break;
      await k.later(800);
    }
    return samples;
  }
  const sameCursorTwice = (samples) => {
    const byAttempt = new Map();
    for (const s of samples) if (s && s.cursor !== "null") byAttempt.set(s.attempts, s.cursor);
    const cursors = [...byAttempt.values()];
    return cursors.length - new Set(cursors).size;
  };

  test("R9 seam §7 (G129a, PDF C14; R123 R130 R135): an AES-128 user-password PDF through the upload and the ticks ends in one tick `final` with PASSWORD_REQUIRED stated, never being read after (red until pdf-reader 7, reading-pipeline-1, extraction 28 are all merged)", { timeout: 600000 }, async () => {
    const { k, truths } = encryptedWorld();
    await k.ready;
    const f = pdfGenerate({ kind: "pdf", seed: `C14${uniq().slice(0, 4)}`, encryption: { method: "aes", user: "pw" }, size: { pages: 6, lines: 3 } });
    const bytes = await f.bytes();
    truths.set("current", { pages: f.truth.pages, page: f.truth.page, locked: true });
    const ann = (await k.ownerOf("r9e-ann")).auth;
    const { up } = await upload(k, ann, bytes, { name: "locked.pdf", type: "application/pdf" });
    assert.equal(up.ok, true, JSON.stringify(up).slice(0, 300));
    await fileIt(k, ann, up, { title: "locked", project: "" });
    const sha = up.capture.sha256;
    const samples = await throughTicks(k, ann, sha, { max: 60000 });
    const r = await k.until(async () => { const x = await readingOf(k, ann, sha); return x && x.found === true ? x : null; }, 60000, 1500);
    const flat = JSON.stringify(r || {});
    assert.ok(r, "the reading is stated (found)");
    assert.ok(flat.includes("PASSWORD_REQUIRED"), `PASSWORD_REQUIRED is stated; the reading says ${JSON.stringify([...flat.matchAll(/"(?:reason|failure|why)":"([^"]*)"/g)].map((m) => m[1]))}`);
    const live = samples.filter((s) => s && s.state !== "final" && s.job_state !== "finished" && s.job_state !== "final");
    assert.ok(samples.length < 1 || (samples[samples.length - 1] === null || samples[samples.length - 1].state === "final" || samples[samples.length - 1].job_state === "finished" || samples[samples.length - 1].job_state === "final"), `the row has ended: ${JSON.stringify(samples.slice(-3))}`);
    assert.ok(Math.max(0, ...samples.filter(Boolean).map((s) => s.attempts)) <= 1 || live.length === 0, `it ends in one tick: ${JSON.stringify(samples)}`);
    assert.equal(r.job && r.job.state !== "reading", true, "the job state is never `reading` after it");
  });

  test("R9 seam §7 (G129a, PDF C11; R123 R130 R135): an RC4-128 empty-password PDF (5 text pages, 2 scans) through the upload and the ticks: the text pages read, the scans stated unread, no cursor asked twice (red until pdf-reader 7, reading-pipeline-1, extraction 28 are all merged)", { timeout: 600000 }, async () => {
    const { k, truths } = encryptedWorld();
    await k.ready;
    const seed = `C11${uniq().slice(0, 4)}`;
    const f = pdfGenerate({ kind: "pdf", seed, encryption: { method: "rc4", user: "" }, kinds: ["text", "text", "scan", "text", "text", "scan", "text"], size: { pages: 7, lines: 3 } });
    const bytes = await f.bytes();
    truths.set("current", { pages: f.truth.pages, page: f.truth.page, locked: false });
    const ann = (await k.ownerOf("r9e-ann")).auth;
    const { up } = await upload(k, ann, bytes, { name: "empty-password.pdf", type: "application/pdf" });
    assert.equal(up.ok, true, JSON.stringify(up).slice(0, 300));
    await fileIt(k, ann, up, { title: "empty-password", project: "" });
    const sha = up.capture.sha256;
    const samples = await throughTicks(k, ann, sha, { max: 90000 });
    assert.equal(sameCursorTwice(samples), 0, `no tick is answered the cursor an earlier tick had: ${JSON.stringify(samples.slice(-8))}`);
    const last = samples[samples.length - 1];
    assert.ok(last === null || last.state === "final" || last.job_state === "finished" || last.job_state === "final", `the row ends within six ticks of the last sample: ${JSON.stringify(samples.slice(-3))}`);
    assert.ok(Math.max(0, ...samples.filter(Boolean).map((s) => s.attempts)) <= 6, `at most six ticks: ${JSON.stringify(samples.slice(-3))}`);
    const r = await k.until(async () => { const x = await readingOf(k, ann, sha); return x && x.found === true ? x : null; }, 60000, 1500);
    assert.ok(r, "a reading is held");
    const flat = JSON.stringify(r);
    for (const p of [1, 2, 4, 5, 7]) assert.ok(flat.includes(f.truth.page(p).lines[0].split(" ")[0]), `the text page ${p} is read`);
    for (const p of [3, 6]) assert.ok(!flat.includes(f.truth.page(p).ocr[0].split(" ")[0]), `the scanned page ${p} is not read (alpha: stated, not OCR'd)`);
    assert.ok(/unread|skipped|no_text|OCR|ocr/i.test(flat), "the scans are stated unread: " + flat.slice(0, 300));
  });

  /* ======================================== 8 · G128a, G128b, G128h ======================================== */

  /* the OCR member: one page per call, the generator's truth for the page asked (SCAN C1: 30 pages) */
  function ocrMember(truth) {
    const state = { calls: 0, pages: new Set(), seen: [] };
    return { state, fn: async (req) => {
      const b = await req.json();
      state.calls++;
      const asked = (b.pages || []).slice(0, 1);
      state.seen.push(asked.slice());
      await new Promise((r) => setTimeout(r, 150));
      for (const p of asked) state.pages.add(p);
      const out = asked.map((p) => {
        const t = truth.page(Number(p) + 1) && truth.page(Number(p) + 1).ocr.length ? truth.page(Number(p) + 1) : truth.page(Number(p));
        return { page: p, regions: [{ text: t.ocr.join("\n"), source: { kind: "pdf-page", ref: `p${p}`, page: p, rect: [0, 0, 10, 10] }, confidence: "none" }] };
      });
      return jsonResponse({ ok: true, engine: "tess", version: "5.3", cap: "C", measured_by: "M-1", confidence_floor: null, pages: out });
    } };
  }
  let scanOnce = null;
  const scanWorld = () => (scanOnce ??= (() => {
    const truths = { current: null };
    const ocr = ocrMember({ page: (n) => truths.current.page(n) });
    const k = world("r9scan", { members: { OCR_WORKER: ocr.fn } });
    return { k, truths, ocr };
  })());

  test("R9 seam §8 (G128a, SCAN C1/C4; R135 R125 R130): a 30-page scan with OCR for part: `completeness` is never \"whole\" before the last page is OCR'd, and the last page's words are searchable at the end (red until extraction-2 41 merges)", { timeout: 900000 }, async () => {
    const { k, truths, ocr } = scanWorld();
    await k.ready;
    const seed = `C1${uniq().slice(0, 5)}`;
    const f = pdfGenerate({ kind: "pdf", seed, kinds: ["scan"], size: { pages: 30, lines: 2 } });
    truths.current = f.truth;
    const bytes = await f.bytes();
    const ann = (await k.ownerOf("r9s-ann")).auth;
    const { up } = await upload(k, ann, bytes, { name: "scan30.pdf", type: "application/pdf" });
    assert.equal(up.ok, true, JSON.stringify(up).slice(0, 300));
    await fileIt(k, ann, up, { title: "scan30", project: "" });
    const sha = up.capture.sha256;
    const lastMark = f.truth.page(30).ocr[0].split(" ")[0];
    const looks = [];
    const end = Date.now() + 240000;
    for (;;) {
      const r = await readingOf(k, ann, sha);
      const doneAfter = ocr.state.pages.size;
      if (r && r.found === true) looks.push({ whole: JSON.stringify(r.completeness || {}).includes("whole"), doneAfter, state: r.completeness && r.completeness.state });
      if (r && r.found === true && doneAfter >= 30 && looks.length > 1 && r.completeness && r.completeness.state === "whole") break;
      if (Date.now() > end) break;
      await k.later(700);
    }
    const early = looks.filter((x) => x.state === "whole" && x.doneAfter < 30);
    assert.equal(early.length, 0, `completeness was \"whole\" before the 30th page was OCR'd in ${early.length} of ${looks.length} looks: ${JSON.stringify(early.slice(0, 3))}`);
    assert.ok(looks.some((x) => x.state === "whole" && x.doneAfter >= 30), `completeness is whole at the end: ${JSON.stringify(looks.slice(-3))}`);
    const hit = await k.until(async () => ((await findIn(k, ann, sha, lastMark)).length ? true : null), 60000, 2000);
    assert.ok(hit, `the last page's words (${lastMark}) are found in the document`);
  });

  test("R9 seam §8 (G128b, SCAN C11/C10; R125 R135): a text page with one large image counts the image unread: the reading names it and `completeness` is not \"whole\" (red until reading-pipeline-1/extraction-2 41 merge)", { timeout: 600000 }, async () => {
    const { k, truths } = scanWorld();
    await k.ready;
    const seed = `C11${uniq().slice(0, 4)}`;
    /* // MOVE: pdfgen's "mixed" page (half text lines, half a rasterised image of lines) is the nearest to "a picture of a table under a text title" */
    const f = pdfGenerate({ kind: "pdf", seed, kinds: ["mixed"], size: { pages: 2, lines: 6 } });
    truths.current = f.truth;
    const bytes = await f.bytes();
    const ann = (await k.ownerOf("r9s-ann")).auth;
    const { up } = await upload(k, ann, bytes, { name: "mixed.pdf", type: "application/pdf" });
    assert.equal(up.ok, true, JSON.stringify(up).slice(0, 300));
    await fileIt(k, ann, up, { title: "mixed", project: "" });
    const r = await k.until(async () => { const x = await readingOf(k, ann, up.capture.sha256); return x && x.found === true ? x : null; }, 60000, 1500);
    assert.ok(r, "a reading is held");
    const flat = JSON.stringify(r);
    assert.ok(/"tier3_candidate":true|"ocr_left":\{|"image_unread":[1-9]|"unread_pages":\[[^\]]|"image_content_undetermined":[1-9]/.test(flat), `the picture inside the text page is counted unread: ${flat.slice(0, 400)}`);
    assert.notEqual(r.completeness && r.completeness.state, "whole", `completeness does not say whole while the picture is unread: ${JSON.stringify(r.completeness)}`);
  });

  /* SHEET J-10: a mark in a non-header cell of the first, a middle and the last data row is found by `op=search`, the hit's extent contains the row */
  test("R9 seam §8 (G128h, SHEET J-10; R100 R123 R135): the first, a middle and the last marked cell of a CSV past the block cut are each found in the document, the hit's extent contains the row and the hit names its row", { timeout: 900000 }, async () => {
    const seed = `J10${uniq().slice(0, 4)}`;
    const g = sheetGenerate({ kind: "csv", seed, size: { rows: 6000, cols: 3 }, header: "one", types: ["text", "integer", "text"] });
    const bytes = await (async () => { const list = []; for await (const c of g.chunks()) list.push(c); const n = list.reduce((a, c) => a + c.length, 0); const out = new Uint8Array(n); let at = 0; for (const c of list) { out.set(c, at); at += c.length; } return out; })();
    assert.ok(bytes.length > 128 * 1024, `past the block cut (${bytes.length} B)`);
    const ann = (await kit.ownerOf("r9j-ann")).auth;
    const project = await kit.projectOf(ann, `R9 J-10 ${seed}`);
    const { up } = await upload(kit, ann, bytes, { name: "j10.csv", type: "text/csv" });
    assert.equal(up.ok, true, JSON.stringify(up).slice(0, 300));
    const bundle = await fileIt(kit, ann, up, { title: "j10", project });
    for (const m of g.truth.marks) {
      const item = await kit.until(async () => (await findIn(kit, ann, up.capture.sha256, m.text))[0] ?? null, 120000, 2500);
      assert.ok(item, `the mark ${m.text} (row ${m.row}) is found in the document (${bundle})`);
      const extent = item.extent || null;
      assert.ok(extent && typeof extent.range === "string", `the hit carries its extent: ${JSON.stringify(item).slice(0, 300)}`);
      const [from, to] = extent.range.split(":").map((c) => Number(/\d+/.exec(c)[0]));
      assert.ok(from <= m.row && m.row <= to, `the extent ${extent.range} contains row ${m.row}`);
      /* B75 (h; retrieval R96): a hit on a multi-row block may name no row (`row: null`); the extent then holds the mark's own cell: its row (above) and its column */
      const letters = (c) => [...c.replace(/[^A-Za-z]/g, "").toUpperCase()].reduce((a, ch) => a * 26 + ch.charCodeAt(0) - 64, 0);
      const [c0, c1] = extent.range.split(":").map(letters);
      assert.ok(c0 <= m.col && m.col <= c1, `the extent ${extent.range} holds the mark's column ${m.col}`);
      if (item.row !== null && item.row !== undefined) assert.ok(item.row === m.row || item.row === m.row - 1 || item.row.row === m.row, `a hit that names a row names the mark's (${m.row}): ${JSON.stringify(item.row)}`);
    }
  });
}
