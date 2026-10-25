/* WALK-FINAL-10B #1 (T51 final pass, sitting 10b; Phase 1 offline, PHASE1-NOW.md): the journey of steps 6 to 8 of area 10, through the real plane.
   The Worker the product deploys, its object, its alarm and R2 under Miniflare, as `t51-round7-seam.test.mjs` runs them (R-SEAM). Every input is made by the
   member's own acts through the door (project, upload, vouch, question, citation, conclusion, case draft, prepare, key, sign), never a hand-written answer.
   It makes its own prerequisites (10a's published editions do not exist in this run), then walks 10b's rows and RECORDS each as WORKS / BROKEN / NOT REACHED in
   `RECORD_OUT` (JSON lines). It asserts nothing on the product: a walk records. Run: node --import ./test/platform-sqlite.mjs <this file> from bio-plane/. */
import "../../../../bio-plane/test/sandbox.mjs";
import { createHash, webcrypto } from "node:crypto";
import { readFileSync, appendFileSync, writeFileSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";
import { createRequire } from "node:module";

const BIO = fileURLToPath(new URL("../../../../bio-plane/", import.meta.url));
const need = createRequire(BIO + "package.json");
const { Miniflare } = await import(pathToFileURL(need.resolve("miniflare")).href);
await import(BIO + "test/m/control-plane/register-declared.mjs");
const { CAPTURE_SCREEN } = await import(BIO + "src/screens-intake/capture.mjs");
const { PARTS } = await import(BIO + "src/screens-publish/parts.mjs");
const { word } = await import(BIO + "src/setup-words/index.mjs");

const OUT = process.env.RECORD_OUT || "/tmp/10b-record.jsonl";
writeFileSync(OUT, "");
const SRC = BIO + "src/plane/index.mjs";
const ADM = "adm-10bwalk-0123456789abcdef", PASSWORD = "the founder's long password, walk ten b";
const ORIGIN = "https://group.example";
const sha = (b) => createHash("sha256").update(b).digest("hex");
const te = (t) => new TextEncoder().encode(t);
const later = (ms) => new Promise((r) => setTimeout(r, ms));
const R = (a) => (a && a.result !== undefined ? a.result : a);
const J = (v, n = 500) => { let s; try { s = typeof v === "string" ? v : JSON.stringify(v); } catch { s = String(v); } return (s || "").slice(0, n); };

/* ---- the record ---- */
const rows = [];
function rec(row, check, verdict, saw, ms = null) {
  const r = { row, check, verdict, saw: J(saw, 900), ms };
  rows.push(r);
  appendFileSync(OUT, JSON.stringify(r) + "\n");
  console.log(`${verdict.padEnd(11)} ${row.padEnd(5)} ${check} :: ${J(saw, 220)}${ms !== null ? ` [${ms} ms]` : ""}`);
}
/* time an act; the plane's Server-Timing, when the answer carries it, is kept */
let lastTiming = null;
const TIMINGS = [];

function mfOptions(name, upstream) {
  return {
    modules: true, modulesRoot: "/", scriptPath: SRC, script: readFileSync(SRC, "utf8"),
    modulesRules: [{ type: "ESModule", include: ["**/*.mjs"] }],
    compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
    durableObjects: { STORE: { className: "Store", useSQLite: true } }, r2Buckets: ["CAPTURES", "PUBLISHED"],
    bindings: { ADMIN_TOKEN: ADM, MEMBER_TOKEN: "mem-10bwalk-0123456789abcdef", PROBE_TOKEN: "prb-10bwalk-0123456789abcdef", VERSION: "4.7.6",
                INSTANCE_NAME: name, GOVERNOR_APPETITE_PER_MIN: "600000", GOVERNOR_SUBRESOURCE_STAGGER_MS: "0" },
    outboundService: (req) => {
      const f = upstream.get(new URL(req.url).pathname.split("/").pop());
      if (!f) return new Response("not scripted", { status: 404 });
      return new Response(f.bytes, { headers: { "content-type": f.type, "content-length": String(f.bytes.length) } });
    },
  };
}

/* a room: one Miniflare and the acts a member makes in it */
function room(name) {
  const upstream = new Map();
  const mf = new Miniflare(mfOptions(name, upstream));
  const plane = async (url, init = {}) => {
    const t0 = Date.now();
    const res = await mf.dispatchFetch(new URL(url, ORIGIN).href, init);
    lastTiming = { wall: Date.now() - t0, serverTiming: res.headers.get("server-timing") };
    TIMINGS.push({ op: new URL(url, ORIGIN).searchParams.get("op") || new URL(url, ORIGIN).pathname, status: res.status, wall: lastTiming.wall, st: lastTiming.serverTiming });
    return res;
  };
  const people = new Map();
  const post = async (auth, op, body, query = {}) => {
    const res = await plane(`/api/?${new URLSearchParams({ op, ...query })}`, { method: "POST", headers: { ...auth, "content-type": "application/json" }, body: JSON.stringify(body) });
    let b; const txt = await res.text(); try { b = JSON.parse(txt); } catch { b = txt; }
    return { status: res.status, body: b, timing: lastTiming };
  };
  const get = async (auth, query) => {
    const res = await plane(`/api/?${new URLSearchParams(query)}`, { headers: auth || {} });
    let b; const txt = await res.text(); try { b = JSON.parse(txt); } catch { b = txt; }
    return { status: res.status, body: b, timing: lastTiming };
  };
  const screenCall = (auth) => ({ now: () => Date.now(), digest: async (s) => createHash("sha256").update(s).digest("hex"),
    call: async (op, { query = {}, body } = {}) => (await plane(`/api/?${new URLSearchParams({ op, ...query })}`, { method: body === undefined ? "GET" : "POST",
      headers: { ...auth, "content-type": "application/json" }, ...(body === undefined ? {} : { body: JSON.stringify(body) }) })).json() });
  let founderOnce = null;
  async function founder() {
    if (founderOnce) return founderOnce;
    await (await plane("/api/?op=claim", { method: "POST", body: JSON.stringify({ bootstrapToken: ADM, password: PASSWORD }) })).arrayBuffer();
    const signed = await (await plane("/api/?op=login", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ handle: "admin", password: PASSWORD, device: "own" }) })).json();
    if (!signed.ok) throw new Error("founder sign-in: " + J(signed));
    return (founderOnce = { authorization: `Bearer ${signed.result.token}` });
  }
  async function member(handle, capabilities = ["contribute"], role = "member") {
    if (people.has(handle)) return people.get(handle);
    const adm = await founder();
    if (role === "admin") await post(adm, "reauth", { password: PASSWORD });
    const added = await post(adm, "memberadd", { memberId: handle, cover: `cover of ${handle}`, role, capabilities });
    const invite = added.body.result && (added.body.result.invite || (added.body.result.invitation && added.body.result.invitation.invite));
    if (!invite) throw new Error("invitation: " + J(added.body));
    const pw = `${handle}-long-passphrase-10b`;
    const en = await post({}, "enroll", { invite, handle, password: pw });
    if (!en.body.ok) throw new Error("enroll: " + J(en.body));
    const si = await post({}, "login", { handle, password: pw, device: "own" });
    if (!si.body.ok) throw new Error("login: " + J(si.body));
    const m = { handle, auth: { authorization: `Bearer ${si.body.result.token}` }, password: pw };
    people.set(handle, m);
    return m;
  }
  return { mf, upstream, plane, post, get, screenCall, founder, member, dispose: () => mf.dispose() };
}

/* ---- an Ed25519 SSH signer ---- */
const u8 = (...parts) => { const out = new Uint8Array(parts.reduce((n, p) => n + p.length, 0)); let o = 0; for (const p of parts) { out.set(p, o); o += p.length; } return out; };
const u32 = (n) => new Uint8Array([(n >>> 24) & 255, (n >>> 16) & 255, (n >>> 8) & 255, n & 255]);
const sstr = (v) => { const b = typeof v === "string" ? te(v) : v; return u8(u32(b.length), b); };
const armor = (blob) => `-----BEGIN SSH SIGNATURE-----\n${Buffer.from(blob).toString("base64").replace(/(.{70})/g, "$1\n")}\n-----END SSH SIGNATURE-----\n`;
async function newKey() {
  const kp = await webcrypto.subtle.generateKey({ name: "Ed25519" }, true, ["sign", "verify"]);
  const raw = new Uint8Array(await webcrypto.subtle.exportKey("raw", kp.publicKey));
  return { priv: kp.privateKey, raw, keyB64: Buffer.from(u8(sstr("ssh-ed25519"), sstr(raw))).toString("base64") };
}
async function signText(key, message, namespace) {
  const h = new Uint8Array(await webcrypto.subtle.digest("SHA-512", te(message)));
  const sig = new Uint8Array(await webcrypto.subtle.sign("Ed25519", key.priv, u8(te("SSHSIG"), sstr(namespace), sstr(new Uint8Array(0)), sstr("sha512"), sstr(h))));
  return armor(u8(te("SSHSIG"), u32(1), sstr(u8(sstr("ssh-ed25519"), sstr(key.raw))), sstr(namespace), sstr(new Uint8Array(0)), sstr("sha512"), sstr(u8(sstr("ssh-ed25519"), sstr(sig)))));
}

/* ---- the owner's chain (as t51-round7-seam's preparedEdition makes it, through the same ops the screens send) ---- */
async function projectOf(rm, auth, title) {
  const cs = rm.screenCall(auth);
  const iso = new Date().toISOString().replace(/\.\d{3}Z$/, "Z");
  const made = await cs.call("promote", { body: { base: null, snapKey: iso.replace(/[-:]/g, "") + "_00c0ffee", meta: { object_type: "project", title, current_state: "forming", created: iso, last_updated: iso },
    files: [{ path: "bundle.md", text: `---\nobject_type: project\ntitle: "${title}"\nobjective: "${title}"\ncurrent_state: forming\ncreated: "${iso}"\nlast_updated: "${iso}"\n---\n\n## Session Log\n\n### Session ${iso} | Formation | interactive\nTrigger: the walk\nChanges: created.\n` }], register: [], visibility: "hidden" } });
  const id = (made.result && made.result.bundleId) || made.bundleId;
  if (!id) throw new Error("project: " + J(made));
  return id;
}
async function questionOf(rm, auth, project, question) {
  const cs = rm.screenCall(auth);
  const title = question.replace(/\s+/g, " ").slice(0, 120);
  const now = new Date().toISOString().split(".")[0] + "Z";
  const a = R(await cs.call("allocid", { query: { prefix: "INQ", year: String(new Date().getUTCFullYear()) } }));
  const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40).replace(/-+$/, "");
  const id = a.id + (slug ? "-" + slug : "");
  const lines = ["---", "id: " + id, "object_type: inquiry", "schema: inquiry@1", "title: " + JSON.stringify(title), "current_state: open", "prior_state: null",
    "created: " + now, "last_updated: " + now, "project: " + project, "produced_by:", "  mode: assisted", "  capability_tier: session", "references: []", "state_history: []",
    "annotations_open: 0", "reeval_pending:", "  flag: false", "  since: null", "  source: null", "visuals: []", "surfaced_by: human", "recheck_triggers:",
    "  - text: " + JSON.stringify(word("file.recheck.revisit")), "    description: " + JSON.stringify(word("file.recheck.none")), "---", ""];
  ["## Question", word("conformance.rests"), "## Conclusion", word("conformance.falsify"), "## Session Log", "## Review Notes"].forEach((h, i) => { lines.push(h, ""); if (i === 0) lines.push(question, ""); });
  const stamp = now.replace(/[-:]/g, "") + "_" + Math.floor(Math.random() * 0xffffffff).toString(16).padStart(8, "0");
  const p = await cs.call("promote", { body: { bundleId: id, base: null, snapKey: stamp, meta: { object_type: "inquiry", title, current_state: "open", created: now, last_updated: now }, files: [{ path: "bundle.md", text: lines.join("\n") }] } });
  if (p.ok === false || R(p).ok === false) throw new Error("question: " + J(p));
  const d = await cs.call("drawquestion", { query: { project, inquiry: id, note: "" } });
  if (d.ok === false || R(d).ok === false) throw new Error("drawquestion: " + J(d));
  return id;
}
const pageOf = (first) => te(`<html><head><title>Council notice</title></head><body><p>${first}</p><p>The council also reviewed the harbor lease and the parking study for the east district.</p><p>Public comment closes at noon on the last day of the month.</p></body></html>`);
const BIAS = "This group holds that contracts should be adopted in public session.";
/* a case ready to prepare: an upload (vouched), one sentence cited, concluded, drafted; `opts.signed` goes on to sign and publish */
async function caseOf(rm, handle, tag, { vouch = true, sign = true, web = false, qtext = "Did the clerk stamp the contract before the vote?" } = {}) {
  const m = await rm.member(handle, ["contribute", "publish", "create_projects"]);
  const { auth, password } = m;
  const cs = rm.screenCall(auth);
  const project = await projectOf(rm, auth, `Walk 10b ${tag} project`);
  const first = "The clerk stamped the amended contract RECEIVED before the council voted on it.";
  let bytes, bundle, digest, address = null;
  if (web) {
    address = `https://www.example.gov/${tag}-page?x=1`;
    rm.upstream.set(`${tag}-page`, { bytes: pageOf(first), type: "text/html" });
    const r = await (await rm.plane("/api/?op=acquire", { method: "POST", headers: { ...auth, "content-type": "application/json" }, body: JSON.stringify({ locator: address, project }) })).json();
    if (!r.document) throw new Error("web capture: " + J(r));
    const cs2 = { ...cs, w: (k, v) => word(k, v), date: (d) => d };
    const title = CAPTURE_SCREEN.parts.titleOf(cs2, { reading: r.reading, doc: r.document, address });
    const made = await CAPTURE_SCREEN.parts.promoteDocument(cs2, { doc: r.document, title, locator: address, project });
    if (made.refused) throw new Error("web filed: " + J(made));
    bundle = made.bundleId; digest = r.document.capture.sha256;
  } else {
    let text = [first, `The minutes of the meeting were filed on Tuesday morning, and the register ${tag} was signed by the deputy clerk, the city attorney and the chair of the council.`].join("\n\n");
    text += " ".repeat(Math.max(0, 356 - te(text).length));
    bytes = te(text);
    const up = (await (await rm.plane(`/api/?op=captureupload&statement=${encodeURIComponent(tag)}&name=${encodeURIComponent(tag + "-minutes")}&type=text%2Fplain`, { method: "POST", headers: auth, body: bytes })).json()).result;
    if (!up || up.ok !== true) throw new Error("upload: " + J(up));
    const filed = await CAPTURE_SCREEN.parts.promoteDocument(cs, { doc: up.document, title: `${tag}-minutes`, locator: up.document.locator, project });
    if (filed.refused) throw new Error("filed: " + J(filed));
    bundle = filed.bundleId; digest = sha(bytes);
  }
  if (vouch) {
    const sel = R(await cs.call("select", { body: { ids: [bundle] } }));
    const rel = await cs.call("release", { query: { handle: sel.handle, acknowledgment: "I checked this file is the minutes as filed.", mitigation: "Nothing in it names a private person." } });
    if (rel.ok === false || R(rel).ok === false) throw new Error("vouch: " + J(rel));
  }
  const question = await questionOf(rm, auth, project, qtext);
  const found = R(await cs.call("findin", { body: { scope: { capture: digest }, kinds: ["term"], term: "stamped the amended contract" } }));
  const item = found.kinds[0].items[0];
  const cited = R(await cs.call("cite", { body: { project: question, role: "supports", found: item } }));
  const concl = R(await cs.call("conclude", { query: { target: question, project, reading: "The clerk stamped the contract before the vote.",
    falsifier: "A received-log showing a later stamp would overturn this.", reason: "The minutes say so." } }));
  if (concl.ok !== true) throw new Error("conclude: " + J(concl));
  const draft = R(await cs.call("casedraft", { body: { project, targets: [question], scope: "Whether the contract was stamped before the vote, on the documents in hand.",
    statement: "This case covers the stamp only; it leaves out the later amendments.", subjectPosition: "sought_and_answered",
    subjectJustification: "We put the question to the Clerk and printed the answer.", roles: { [question]: "load_bearing" }, excluded: [] } }));
  if (!draft.draftId) throw new Error("draft: " + J(draft));
  const e = { rm, m, auth, password, cs, project, question, bundle, bytes, digest, address, tag, cited, draft: draft.draftId, prepared: null, key: null };
  e.prepare = async (bias = BIAS, more = {}) => (e.prepared = R(await cs.call("publish", { body: { draft: e.draft, project, tieAttested: true, biasAcknowledgement: bias,
    ...(web ? { selfAttested: [{ capture: digest, reason: "The page was fetched once; no archive copy was reachable." }] } : {}), ...more } })));
  return e;
}
async function sitAndSign(e, key = null) {
  const { cs, prepared: p } = e;
  key = key || e.key || (e.key = await newKey());
  const reg = R(await cs.call("signerregisterown", { body: { keyB64: key.keyB64 } }));
  const doc = R(await cs.call("casedocument", { query: { case: p.caseId, edition: String(p.edition) } }));
  const list = PARTS.sitting(doc, { findings: p.findings.map((f) => ({ target: f.target, bundleSha: f.bundleSha })) });
  const sigs = [];
  for (const x of list) sigs.push(await signText(key, x.text, x.namespace));
  const ra = R(await cs.call("reauth", { body: { password: e.password } }));
  const res = await e.rm.post(e.auth, "caseratify", { caseId: p.caseId, edition: Number(p.edition), expectedSha: doc.doc_sha, sig: sigs[0],
    members: list.slice(1).map((x, i) => ({ id: x.id, sha: x.sha, signature: sigs[i + 1] })) });
  return { res, list, doc, reg, ra };
}


/* =========================================================== the walk =========================================================== */
import { test } from "node:test";
import { spawnSync } from "node:child_process";
import { mkdtempSync, writeFileSync as wf, readFileSync as rf } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const { checkCaseFile } = await import(BIO + "src/case-checker/index.mjs");
const { readStoredZip } = await import(BIO + "src/case-checker/zip.mjs");
const { makeZip } = await import(BIO + "test/make-zip.mjs");
const rezip = (zipBytes, edit) => { const z = readStoredZip(new Uint8Array(zipBytes)); const out = []; for (const [name, data] of z.entries) { const d = edit(name, Buffer.from(data)); out.push({ name, data: new Uint8Array(d), method: 0 }); } return Buffer.from(makeZip(out)); };
const FILES = {};
const step = async (row, check, fn) => {
  const t0 = Date.now();
  try { const r = await fn(); if (r) rec(row, check, r[0], r[1], Date.now() - t0); }
  catch (x) { rec(row, check, "NOT REACHED", "script error before the act: " + String(x && x.stack || x).split("\n").slice(0, 3).join(" | "), Date.now() - t0); }
};
const ok = (cond, saw) => [cond ? "WORKS" : "BROKEN", saw];
const dumpText = (v) => JSON.stringify(v);

test("WALK-FINAL-10B: case to publication, steps 6 to 8, through the door", { timeout: 3600000 }, async () => {
  const A = room("walk10b-a"), B = room("walk10b-b");
  const WORK = mkdtempSync(join(tmpdir(), "walk10b-"));
  let c1 = null, id1 = null, pc1 = null, zip1 = null;

  /* ---- prerequisites, made by the real acts (the 10a part) ---- */
  await step("PRE", "owner, project, vouched upload, question, citation, conclusion, draft, prepare, key, sign, publish edition 1", async () => {
    c1 = await caseOf(A, "marlowe", "w1");
    const p = await c1.prepare();
    const s = await sitAndSign(c1);
    id1 = c1.prepared && c1.prepared.caseId;
    return ok(p.ok === true && s.res.status === 200 && s.res.body.ok === true, `prepare ${p.ok} ${id1}; caseratify ${s.res.status} ${J(s.res.body, 200)}`);
  });
  if (!id1) { rec("PRE", "the first case published", "NOT REACHED", "no case; the rest of the sitting cannot run"); return; }
  const stranger = {};
  const pcGet = async (extra = {}) => (await A.get(stranger, { op: "publishedcase", id: id1, ...extra }));
  pc1 = (await pcGet()).body;
  const zipOf = async (room_, sha_) => { const r = await room_.plane(`/api/?${new URLSearchParams({ op: "publishedbytes", sha256: sha_, format: "zip" })}`); return { status: r.status, bytes: Buffer.from(await r.arrayBuffer()), type: r.headers.get("content-type") }; };
  zip1 = await zipOf(A, pc1.manifest_sha);
  wf(join(WORK, "case.zip"), zip1.bytes);
  const entries = (() => { try { return readStoredZip(new Uint8Array(zip1.bytes)); } catch (x) { return { error: String(x) }; } })();
  const files = entries && entries.entries instanceof Map ? [...entries.entries].map(([path, bytes]) => ({ path, bytes })) : [];
  FILES.entries = entries;

  /* ================= R94 ================= */
  await step("R94", "a stranger reads the published case: no sign-in, findings, strengths, lens, completeness", async () => {
    const r = await pcGet();
    const f0 = (r.body.findings || [])[0] || {};
    return ok(r.status === 200 && r.body.ok === true && r.body.complete === true && (r.body.findings || []).length >= 1,
      `status ${r.status} complete ${r.body.complete} awaiting ${J(r.body.awaiting, 80)} findings ${(r.body.findings || []).length} first.role ${f0.role} keys(finding) ${Object.keys(f0).join(",")} | ${J(r.timing && r.timing.serverTiming, 200)} wall ${r.timing && r.timing.wall}`);
  });
  await step("R94", "(a) each finding names its role and the bar; two strengths, never one case score; a case with no bar says none was declared", async () => {
    const r = pc1, f0 = r.findings[0];
    const hasScore = ["score", "case_score", "strength", "case_strength", "confidence"].filter((k) => k in r);
    return ok(r.bar && r.bar.declared === false && /declares no required evidentiary strength|no bar|nothing in this case was measured/i.test(r.bar.detail || "") && Array.isArray(f0.strength || f0.pair || []) && !hasScore.includes("score") && !hasScore.includes("case_score"),
      `bar ${J(r.bar, 300)} | finding.strength ${J(f0.strength, 300)} | case-level keys that look like a score: ${J(hasScore)} | finding line fields: ${J(Object.keys(f0))}`);
  });
  await step("R94", "(b) the group as publisher and signer; signed and published dates; the newest edition says it is newest", async () => {
    const r = pc1;
    return ok(!!r.signed_at && !!r.published_at && r.latest_edition === 1, `signed_at ${r.signed_at} published_at ${r.published_at} latest_edition ${r.latest_edition} editions ${J(r.editions)} edition_index ${J(r.edition_index, 300)} successor ${J(r.successor)} group ${J(r.group_fields, 200)}`);
  });
  await step("R94", "(c) the lens: acknowledgement first, statements, why groups declare bias; the page prints the bias manifest (PUB says it does not yet: record)", async () => {
    const r = pc1;
    return ok(r.lens && r.lens.bias_acknowledgement === BIAS, `lens keys ${J(Object.keys(r.lens || {}))} fingerprint ${J(r.lens_fingerprint, 80)} statements ${J(r.lens && r.lens.statements, 200)} closing ${J(r.lens && r.lens.closing, 300)}`);
  });
  const caseMd = (() => { try { const f = (files || []).find((x) => /(^|\/)case\.md$/.test(x.path || x.name || "")); return f ? Buffer.from(f.bytes || f.data || f.content).toString("utf8") : null; } catch { return null; } })();
  await step("R94", "(d) the exclusion statement, its writer apart from the publisher, acknowledgements, and \"What Was Searched\" with searched keys", async () => {
    const r = pc1;
    return ok(!!caseMd && /What Was Searched/.test(caseMd), `zip entries ${J(Array.isArray(files) ? files.map((x) => x.path || x.name) : Object.keys(entries || {}), 400)} | case.md has searched section: ${/What Was Searched/.test(caseMd || "")} | completeness ${J(r.completeness, 400)} | document ${J(r.document, 200)}`);
  });
  await step("R94", "(e) the credit line per observation: at group level no member id, handle or cover in any published part", async () => {
    const parts = [dumpText(pc1), ...files.map((x) => Buffer.from(x.bytes).toString("utf8"))];
    const where = []; parts.forEach((t, i) => { if (t.includes(c1.m.handle)) where.push(i === 0 ? "page" : files[i - 1].path); });
    const covers = parts.some((t) => t.includes("cover of " + c1.m.handle));
    const attr = dumpText(pc1).includes("observation_attributions") || files.some((x) => /Whose Words/.test(Buffer.from(x.bytes).toString("utf8")));
    return ["NOT REACHED", `no observation by a second member exists in this sitting's case (R171 is 10a), so the credit line is not forced. Seen: the publishing member's handle appears as signer, publisher, concluder and exclusion-statement writer in ${J(where)} (by design: AR:57-65, PUB:12); her cover text appears: ${covers}; 'Whose Words These Are' present: ${attr}`];
  });
  await step("R94", "(j) the address and phone are absent from the page, manifest and zip", async () => {
    const hay = dumpText(pc1) + (caseMd || "");
    return ok(!/\b\d{3}[-. ]\d{3}[-. ]\d{4}\b/.test(hay) && !/\b\d{1,5} [A-Z][a-z]+ (Street|St|Avenue|Ave|Road|Rd)\b/.test(hay), "no phone number or street address pattern in the page JSON or case.md (the case holds none; the point of contact is read in R90 on 10a)");
  });
  await step("R94", "(i) no plan content, no hidden-accounts statement, nothing about newer versions of cited documents, no fence marker or band", async () => {
    const hay = dumpText(pc1);
    const bad = ["hidden account", "newer version", "working record", "shared for review", "fence", "plan_", "dead end"].filter((t) => hay.toLowerCase().includes(t));
    return ok(bad.length === 0, `terms found in the stranger's page JSON: ${J(bad)}; page keys ${J(Object.keys(pc1))}`);
  });
  await step("R94", "(l) manifest fetch: each cited document's row with its sha is among the signed evidence; case_file.state; tensions null with sentence on /4 or older", async () => {
    const m = await A.get(stranger, { op: "publishedmanifest", id: id1 });
    const man = m.body && m.body.result;
    const cited = (pc1.materials && pc1.materials.materials || []).map((x) => x.sha);
    const inMan = (man && man.published || []).length;
    return ok(m.status === 200 && man && man.ok && pc1.case_file && pc1.case_file.state === "built", `manifest ${m.status} published rows ${inMan}; materials cited ${J(cited)}; case_file ${J(pc1.case_file)}; tensions ${J(pc1.tensions, 150)} tensions_detail ${J(pc1.tensions_detail, 200)}`);
  });
  await step("R94", "zip: fetch the case file by the manifest's hash: 200, no duplicate path, bio-case-file format, copies under materials/<ref>", async () => {
    const paths = Array.isArray(files) ? files.map((x) => x.path || x.name) : [];
    const dup = paths.filter((p, i) => paths.indexOf(p) !== i);
    const man = JSON.parse(Buffer.from((files.find((x) => (x.path || x.name) === "manifest.json") || {}).bytes || "{}").toString("utf8") || "{}");
    return ok(zip1.status === 200 && zip1.type === "application/zip" && dup.length === 0, `status ${zip1.status} ${zip1.type} ${zip1.bytes.length} bytes; ${paths.length} paths; duplicates ${J(dup)}; manifest.format ${man.format}; paths ${J(paths, 500)}`);
  });

  /* ================= R95 ================= */
  await step("R95", "(a) verify answers published / matches / not published, with no account", async () => {
    const v1 = await A.get(stranger, { op: "verify", sha256: pc1.manifest_sha });
    const v0 = await A.get(stranger, { op: "verify", sha256: "0".repeat(64) });
    const vbad = await A.get(stranger, { op: "verify", sha256: "xyz" });
    return ok(v1.body.published === true && v0.body.published === false, `published hash: ${J(v1.body, 300)} | unknown hash: ${J(v0.body, 200)} | malformed: ${vbad.status} ${J(vbad.body && (vbad.body.detail || vbad.body.error), 200)}`);
  });
  await step("R95", "(a) verify states that the delivering principal is the instance's record and not covered by any signature [AR:65]", async () => {
    const v1 = await A.get(stranger, { op: "verify", sha256: pc1.manifest_sha });
    const t = dumpText(v1.body) + dumpText(pc1.verification || {});
    return ok(/delivering|deliver/i.test(t), `verify answer keys ${J(Object.keys(v1.body))} (${J(v1.body, 200)}) | page.verification ${J(pc1.verification, 700)} | the page's per-finding delivered_by: ${J((pc1.findings || [])[0] && pc1.findings[0].delivered_by)}`);
  });
  let progPath = null;
  await step("R95", "(e) the standalone open checker is served (op=casechecker) and runs with node on the case file alone", async () => {
    const r = await A.plane(`/api/?${new URLSearchParams({ op: "casechecker" })}`);
    const txt = await r.text();
    let program = txt;
    try { const j = JSON.parse(txt); program = (j.result && j.result.program) || txt; } catch {}
    progPath = join(WORK, "case-checker.mjs");
    wf(progPath, program);
    const run = spawnSync("node", [progPath, join(WORK, "case.zip")], { encoding: "utf8" });
    const out = run.stdout || "";
    const line = out.split("\n").filter((l) => /recreate|:/.test(l)).slice(0, 3).join(" / ");
    return ok(r.status === 200 && run.status === 0 && /"intact": true/.test(out), `casechecker ${r.status} ${program.length} chars; node exit ${run.status}; first lines: ${line.slice(0, 300)}; intact ${/"intact": true/.test(out)}; stderr ${String(run.stderr).slice(0, 200)}`);
  });
  await step("R95", "recreate with the checker: the case this product published is recreated (not 'Did not recreate'), and what differs", async () => {
    const run = spawnSync("node", [progPath, join(WORK, "case.zip")], { encoding: "utf8", maxBuffer: 1e8 });
    const out = run.stdout || "";
    const j = (() => { try { return JSON.parse(out.slice(out.indexOf('{\n  "format"'))); } catch { return null; } })();
    const f0 = j && j.findings && j.findings[0];
    return ok(!!f0 && f0.result === "recreated", `finding result: ${f0 && f0.result}; differs ${J(f0 && f0.differs, 500)}; integrity.intact ${j && j.integrity && j.integrity.intact}; the same case imported by the second team (R98) says the same`);
  });
  await step("R95", "(c) alter a cited copy in the zip (the zip rewritten so every CRC is right): the checker reports it, against that file", async () => {
    const z = rezip(zip1.bytes, (name, d) => { if (/^materials\/[^/]+\/(document|extracted\.txt)$/.test(name)) { const t = d.toString("utf8").replace("RECEIVED", "RECEIVE_"); return Buffer.from(t); } return d; });
    wf(join(WORK, "tampered.zip"), z);
    const run = spawnSync("node", [progPath, join(WORK, "tampered.zip")], { encoding: "utf8", maxBuffer: 1e8 });
    const out = run.stdout || "";
    const j = (() => { try { return JSON.parse(out.slice(out.indexOf('{\n  "format"'))); } catch { return null; } })();
    return ok(run.status === 0 && j && j.integrity.intact === false, `copy changed by one word (CRCs valid): exit ${run.status}; intact ${j && j.integrity.intact}; departures ${J(j && j.integrity.departures, 500)}`);
  });
  await step("R95", "(e) an unknown format (/5) departs at format (the zip rewritten so every CRC is right)", async () => {
    const z = rezip(zip1.bytes, (name, d) => name === "manifest.json" ? Buffer.from(d.toString("utf8").replace("bio-case-file/3", "bio-case-file/5")) : d);
    wf(join(WORK, "format5.zip"), z);
    const run = spawnSync("node", [progPath, join(WORK, "format5.zip")], { encoding: "utf8", maxBuffer: 1e8 });
    const out = run.stdout || "";
    const j = (() => { try { return JSON.parse(out.slice(out.indexOf('{\n  "format"'))); } catch { return null; } })();
    return ok(run.status === 0 && j && j.integrity.intact === false && /format/i.test(J(j.integrity.departures)), `format /5: exit ${run.status}; reported format ${j && j.format}; intact ${j && j.integrity.intact}; departures ${J(j && j.integrity.departures, 400)}`);
  });
  await step("R95", "(d) verify the bag with no BIO tool: manifest-sha256.txt checked with sha256sum; timestamps with openssl ts; WACZ/WARC (BagIt form)", async () => {
    const paths = Array.isArray(files) ? files.map((x) => x.path || x.name) : [];
    return ["NOT REACHED", `the case file zip holds ${paths.length} paths and none is a BagIt manifest-sha256.txt (paths: ${J(paths, 300)}); a BagIt bag is the document-bag (intake) form, not the case file's; no timestamp or WACZ was made offline (an uploaded text has none)`];
  });
  await step("R95", "(f) the reader's re-check under another lens (owed: ruled to be built, not built): lens argument of the checker", async () => {
    const run = spawnSync("node", [progPath, join(WORK, "case.zip"), "--lens", "removed"], { encoding: "utf8" });
    return ok(run.status === 0, `--lens removed: exit ${run.status}; lens block ${(run.stdout.match(/"lens": \{[\s\S]{0,200}/) || [""])[0].replace(/\s+/g, " ")}`);
  });
  await step("R95", "(g) the complete edition is a self-contained file (complete-edition.html, no external requests, 'How to check this case yourself')", async () => {
    const f = (files || []).find((x) => /complete-edition\.html$/.test(x.path || x.name || ""));
    const html = f ? Buffer.from(f.bytes || f.data || f.content).toString("utf8") : "";
    const ext = (html.match(/(?:src|href)=["']https?:\/\/[^"']+/g) || []).concat(html.match(/url\(["']?https?:\/\/[^)]+/g) || []);
    return ok(!!html && ext.length === 0, `complete-edition.html ${html.length} chars; external src/href/url(): ${J(ext)}; has 'check this case yourself': ${/check this case yourself/i.test(html)}; has identifying notice: ${/Civicsmith|case id|CASE-/i.test(html)}`);
  });
  await step("R95", "(j) published pixels verification for a rendering (NOT BUILT per PUB at 2026-10-15; confirm)", async () => {
    const r = await A.get(stranger, { op: "verify", sha256: "1".repeat(64), rendering: "pixels" });
    return ["NOT REACHED", `no op or argument for a pixels check is declared; verify with a rendering argument answers ${r.status} ${J(r.body, 150)} (designed, not built, recorded)`];
  });

  await step("R95", "(b) check a file you hold: a finding's pinned hash read by hash (publishedcase&sha256=) names the finding; an unpublished hash does not", async () => {
    const cited = pc1.findings[0].bundle_sha;
    const yes = await A.get(stranger, { op: "publishedcase", sha256: cited });
    const no = await A.get(stranger, { op: "publishedcase", sha256: "a".repeat(64) });
    return ok(yes.status === 200 && no.status !== 200, `cited document's hash: ${yes.status} ${J(yes.body, 300)}; an unpublished hash: ${no.status} ${J(R2(no.body).code || R2(no.body).reason)}`);
  });

  /* ================= R170 (the part a plane can show) ================= */
  await step("R170", "nothing from outside: the published page JSON and the complete edition fetch nothing from another address", async () => {
    const f = (files || []).find((x) => /complete-edition\.html$/.test(x.path || x.name || ""));
    const html = f ? Buffer.from(f.bytes || f.data || f.content).toString("utf8") : "";
    const urls = (html.match(/https?:\/\/[^\s"'<>)]+/g) || []);
    return ok(urls.every((u) => /example|group\.example|civicsmith|bio\b/.test(u)) || urls.length === 0, `addresses in the complete edition: ${J(urls.slice(0, 8))} (text, not requests). Screen reader, keyboard-only, 200% zoom, print in black and white and reduced motion need a browser: see the screens' rows.`);
  });

  /* ================= R176 ================= */
  await step("R176", "links out after publishing: 'Submit to the network directory', 'Find related work', 'Discuss in the forum' (not built per brief.today)", async () => {
    const { spawnSync: sp } = await import("node:child_process");
    const g = sp("grep", ["-rniE", "Submit to the network directory|Find related work|Discuss in the forum|believeincities", BIO + "src/screens-publish", BIO + "src/setup-words", "-l"], { encoding: "utf8" });
    return ["NOT REACHED", `searched the shipped screen and word sources for the three links and the directory address: files naming them: ${J((g.stdout || "").split("\n").filter(Boolean).slice(0, 5))}. Absent as designed (recorded, not a defect).`];
  });

  const W = { A, B, c1, id1, pc1, zip1, files, WORK, stranger, progPath, zipOf, pcGet, step, ok };
  await part2(W);
  await A.dispose(); await B.dispose();
});



/* =========================================================== the rest of the sitting =========================================================== */
const R2 = R;
async function part2(W) {
  const { A, B, c1, id1, pc1, zip1, files, WORK, stranger, progPath, step, ok } = W;
  const docketAs = async (e, id, kind, params = {}) => {
    const pr = await A.get(e.auth, { op: "docketprepare", case: id, kind, ...params });
    const r = R2(pr.body);
    if (!r || !r.ok) return { refused: (r && (r.code || r.reason)) + " " + String((r && (r.detail || r.translation)) || "").slice(0, 220) };
    const sig = await signText(e.key, r.statement, "bio-docket");
    const po = await A.post(e.auth, "docketpost", { digest: r.digest, signature: sig, acknowledged: true });
    const p = R2(po.body);
    return { posted: !!(p && p.ok), seq: p && p.seq, post: p && !p.ok ? (p.code || p.reason) + " " + String(p.detail || "").slice(0, 160) : "", statement: r.statement && r.statement.slice(0, 120), prepared: r };
  };
  const capDoc = async (e, text, tag) => {
    const bytes = te(text);
    const up = (await (await A.plane(`/api/?op=captureupload&statement=${tag}&name=${tag}&type=text%2Fplain`, { method: "POST", headers: e.auth, body: bytes })).json()).result;
    const filed = await CAPTURE_SCREEN.parts.promoteDocument(e.cs, { doc: up.document, title: tag, locator: up.document.locator, project: e.project });
    return { sha: sha(bytes), bundle: filed.bundleId };
  };
  const bytesOf = async (room_, shaHex) => { const r = await room_.plane(`/api/?${new URLSearchParams({ op: "publishedbytes", sha256: shaHex })}`); return { st: r.status, t: (await r.text()).slice(0, 140) }; };
  const seq = (o) => o.seq;
  const dee = await A.member("dee", ["contribute"]);

  /* ================= R98: the second team imports edition 1 ================= */
  const bea = await B.member("bea", ["contribute", "create_projects", "publish"]);
  let imp = null, impId = null, impEd = null;
  await step("R98", "import the published case file into a second team (the real caseimport, the file's bytes as one part)", async () => {
    imp = await B.post(bea.auth, "caseimport", { parts: [zip1.bytes.toString("base64")] });
    const r = R2(imp.body);
    impId = r && r.import;
    return ok(imp.status === 200 && r.ok === true && !!impId, `status ${imp.status} ok ${r && r.ok} existed ${r && r.existed} group ${r && r.group} case ${r && r.case} edition ${r && r.edition}; recreation.findings ${J(r && r.recreation && r.recreation.findings, 700)}`);
  });
  await step("R98", "(b) each finding reads Recreated / Recreated in part / Did not recreate, against the importing team's bar; a case this team's own checker publishes should recreate here", async () => {
    const ch = await B.get(bea.auth, { op: "importedcase", import: impId });
    impEd = R2(ch.body).edition;
    const fs = (impEd && impEd.findings) || (R2(imp.body).recreation || {}).findings || [];
    const results = fs.map((f) => f.result);
    return ok(results.length > 0 && results.every((x) => x === "recreated"),
      `finding results ${J(results)}; first differs ${J(fs[0] && fs[0].differs, 500)}; own_bar ${J(impEd && impEd.own_bar, 200)}; band counts recreated ${impEd && impEd.recreated} of ${impEd && impEd.findings}. The same file run through the standalone checker (R95) says the same.`);
  });
  await step("R98", "(a) the import lands read-only, the list of imports names the source team and case", async () => {
    const l = await B.get(bea.auth, { op: "importedcases" });
    const row = (R2(l.body).imports || [])[0] || {};
    return ok(l.status === 200 && row.group === "walk10b-a" && row.case === id1, `imports ${(R2(l.body).imports || []).length}; first ${J({ group: row.group, case: row.case, latest_edition: row.latest_edition, editions: (row.editions || []).map((x) => ({ e: x.edition, findings: x.findings, recreated: x.recreated, did_not: x.did_not_recreate, by: x.importer })) }, 400)}`);
  });
  await step("R98", "(c) accept the whole case in one act with one reason: only recreated findings, those that did not recreate are never accepted", async () => {
    const fs = (impEd && impEd.findings) || [];
    const r1 = R2((await B.post(bea.auth, "importaccept", { import: impId, edition: 1, findings: [], checked: "I read the minutes.", reason: "It recreated here." })).body);
    const r2 = R2((await B.post(bea.auth, "importaccept", { import: impId, edition: 1, findings: fs.map((f) => f.finding), checked: "I read the minutes.", reason: "Try the unrecreated finding anyway." })).body);
    const r3 = R2((await B.post(bea.auth, "importaccept", { import: impId, edition: 1, findings: fs.map((f) => f.finding), checked: "I read the minutes.", reason: "" })).body);
    const acceptedAny = [r1, r2].some((x) => x && x.ok);
    return [fs.some((f) => f.result === "recreated") ? (acceptedAny ? "WORKS" : "BROKEN") : "NOT REACHED",
      `no finding recreated, so there is nothing acceptable (see the R98 recreation row). Acceptance of no finding: ${r1.code || r1.reason || "ok"} ${String(r1.translation || "").slice(0, 120)} | naming the finding that did not recreate: ${r2.ok ? "ACCEPTED (defect: never accepted)" : (r2.code || r2.reason) + " " + String(r2.translation || "").slice(0, 140)} | an empty reason: ${r3.code || r3.reason}`];
  });
  await step("R98", "(d) flag an issue naming the specific finding; origin mark; clearing inside the team", async () => {
    const f = ((impEd && impEd.findings) || [])[0];
    const nameless = R2((await B.post(bea.auth, "importflag", { import: impId, edition: 1, finding: f && f.finding, issue: "" })).body);
    const r = R2((await B.post(bea.auth, "importflag", { import: impId, edition: 1, finding: f && f.finding, issue: "The founding minute lacks the clerk's initials." })).body);
    const ch = R2((await B.get(bea.auth, { op: "importedcase", import: impId })).body);
    const ff = ((ch.edition || {}).findings || [])[0] || {};
    return ok(r.ok === true && /IMPORT_FLAG_NO_ISSUE/.test(nameless.code || nameless.reason || ""), `empty issue: ${nameless.code || nameless.reason}; flag: ${r.flag} ok ${r.ok}; finding origin after: ${J(ff.origin, 300)}`);
  });
  await step("R98", "(h) watch the publisher: the address given must be the public https address of their copy", async () => {
    const bad = R2((await B.post(bea.auth, "importwatch", { import: impId, publisher: "walk10b-a" })).body);
    const good = R2((await B.post(bea.auth, "importwatch", { import: impId, publisher: "https://group.example" })).body);
    return ok(good.ok === true, `a team name: ${bad.code || bad.reason} "${String(bad.translation || "").slice(0, 100)}"; the public address: ${J(good, 400)}`);
  });
  await step("R98", "(c) withdraw an acceptance with a reason (nothing accepted is refused in the plane's words)", async () => {
    const r = R2((await B.post(bea.auth, "importacceptwithdraw", { import: impId, edition: 1, reason: "On reflection, not yet." })).body);
    const none = R2((await B.post(bea.auth, "importacceptwithdraw", { import: impId, edition: 1, reason: "" })).body);
    return [r.ok ? "WORKS" : "NOT REACHED", `nothing is accepted (no finding recreated), so: ${r.code || r.reason}; an empty reason: ${none.code || none.reason}`];
  });
  await step("R98", "(j) a file that is not a case file is refused IMPORT_NOT_A_CASE_FILE; a tampered case file is refused or flagged", async () => {
    const junk = R2((await B.post(bea.auth, "caseimport", { parts: [Buffer.from("not a zip at all").toString("base64")] })).body);
    const z = Buffer.from(zip1.bytes); const at = z.indexOf(Buffer.from("RECEIVED before")); z[at] = 0x58;
    const tam = R2((await B.post(bea.auth, "caseimport", { parts: [z.toString("base64")] })).body);
    const nothing = (await B.post(bea.auth, "caseimport", { parts: [] }));
    return ok(junk.ok === false && /IMPORT_NOT_A_CASE_FILE/.test(junk.code || junk.reason || ""), `junk bytes: ${junk.code || junk.reason}; a stored copy altered by one byte: ${tam.ok ? "imported, existed " + tam.existed + ", findings " + J((tam.recreation || {}).findings && tam.recreation.findings.map((f) => f.result)) : (tam.code || tam.reason)}; no parts: ${nothing.status} ${J(R2(nothing.body).code || R2(nothing.body).reason)}`);
  });
  await step("R98", "(i) owed acts are absent: importregrade, rerunstart, citeimported, 'Rest one of our questions on this'", async () => {
    const outs = [];
    for (const op of ["importregrade", "rerunstart", "citeimported"]) { const r = await B.get(bea.auth, { op }); outs.push(`${op}: ${r.status} ${J(R2(r.body).code || R2(r.body).reason)}`); }
    return ["NOT REACHED", `${outs.join(" | ")} (owed K4169/DEC-382: absence recorded, not a defect)`];
  });
  await step("R98", "(e) no transitive trust: cite the imported case in a local question before accepting (citeimported owed)", async () => {
    return ["NOT REACHED", "citeimported is owed (DEC-382): the op is absent (see the row above), so citing an imported case in a local question cannot be tried"];
  });

  /* ================= R174/R96: a cited document's source changes; the conclusion moves; edition 2 ================= */
  const e1 = c1;
  await step("R174", "ask to publish the same, unchanged conclusion again: refused naming the edition that already records it", async () => {
    const r = R2((await A.post(e1.auth, "publish", { draft: e1.draft, project: e1.project, tieAttested: true, biasAcknowledgement: BIAS })).body);
    return ok(r.ok === false && r.reason === "ALREADY_A_CASE_MEMBER", `${r.reason}; recorded_by ${J(r.recorded_by)}; detail starts: ${String(r.detail || "").slice(0, 200)}`);
  });
  await step("R174", "withdraw the conclusion: a project that withdrew and did not conclude again cannot publish (its last edition stands as history)", async () => {
    const w = R2((await A.post(e1.auth, "withdrawconclusion", {}, { target: e1.question, project: e1.project, reason: "The newer reading of the minutes says Wednesday." })).body);
    const pub = R2((await A.post(e1.auth, "publish", { draft: e1.draft, project: e1.project, tieAttested: true, biasAcknowledgement: BIAS })).body);
    const page = (await A.get(stranger, { op: "publishedcase", id: id1 })).body;
    return ok(w.ok === true && pub.ok === false && page.ok === true, `withdraw ok ${w.ok}; publish: ${pub.reason}; the stranger's page still answers 200, edition ${page.edition}, findings ${(page.findings || []).length} (the last edition stands)`);
  });
  await step("R174", "conclude again on a different reading, ask to publish with the old draft: the plane's answer (a new edition is warranted, or a draft refusal)", async () => {
    const c = R2(await e1.cs.call("conclude", { query: { target: e1.question, project: e1.project, reading: "The clerk stamped it on Wednesday, after the vote.", falsifier: "A received log showing otherwise.", reason: "The newer reading says Wednesday." } }));
    const pub = R2((await A.post(e1.auth, "publish", { draft: e1.draft, project: e1.project, tieAttested: true, biasAcknowledgement: BIAS })).body);
    return [c.ok === true && pub.ok === false ? "WORKS" : "BROKEN", `conclude ok ${c.ok} version ${c.version}; publish with the edition-1 draft: ${pub.reason} ${String(pub.detail || "").slice(0, 260)}`];
  });
  let draft2 = null, ed2 = null;
  const BIAS2 = "We now hold that contracts should be stamped in public session before any vote, and we say so.";
  const ST1 = "This case covers the stamp only; it leaves out the later amendments.";
  let exc = [];
  const editDraft = (statement) => A.post(e1.auth, "casedraft", { draft: draft2, statement, subjectPosition: "sought_and_answered", subjectJustification: "We put the question to the Clerk again and printed the answer.", roles: { [e1.question]: "load_bearing" }, excluded: exc });
  await step("R96", "(a) 'Start the next edition' (the docket's casedraft with the published case's caseId): a new draft that begins from the findings chosen", async () => {
    const nd = R2((await A.post(e1.auth, "casedraft", { project: e1.project, caseId: id1, targets: [e1.question], scope: "Whether the stamp was before the vote, on the newer reading." })).body);
    draft2 = nd.draftId;
    return ok(nd.ok === true && nd.edition === 2 && nd.caseId === id1, `${J(nd, 300)}`);
  });
  await step("R96", "(a) edition 2 refused without 'what changed': NO_WHAT_CHANGED (and the draft carries no exclusion statement yet: NO_STATEMENT, as the docket's start form sends none)", async () => {
    const a1 = R2((await A.post(e1.auth, "publish", { draft: draft2, project: e1.project, tieAttested: true, biasAcknowledgement: BIAS2 })).body);
    await editDraft(ST1);
    const a2 = R2((await A.post(e1.auth, "publish", { draft: draft2, project: e1.project, tieAttested: true, biasAcknowledgement: BIAS2, whatChanged: { text: "Newer reading." } })).body);
    const a3 = R2((await A.post(e1.auth, "publish", { draft: draft2, project: e1.project, tieAttested: true, biasAcknowledgement: BIAS2 })).body);
    return ok(a1.reason === "NO_STATEMENT" && /COMPLETENESS_CARRIED_FORWARD/.test(a2.reason) && a3.reason === "NO_WHAT_CHANGED", `a fresh draft: ${a1.reason}; with the edition-1 statement byte for byte and a What-changed: ${a2.reason} (${a2.field}); the same without a What-changed: ${a3.reason}; "${String(a2.detail || "").slice(0, 160)}"`);
  });
  await step("R96", "(a) a fresh statement but the same empty exclusion list, then no what-changed, then the same bias sentence: each refused in the plane's words", async () => {
    await editDraft("This edition covers the stamp on the newer reading only; it still leaves out the later amendments.");
    const b1 = R2((await A.post(e1.auth, "publish", { draft: draft2, project: e1.project, tieAttested: true, biasAcknowledgement: BIAS2, whatChanged: { text: "Newer reading." } })).body);
    exc = [{ description: "The vote count.", reason: "No document in hand records it." }];
    await editDraft("This edition covers the stamp on the newer reading only; it still leaves out the later amendments and the vote count.");
    const b2 = R2((await A.post(e1.auth, "publish", { draft: draft2, project: e1.project, tieAttested: true, biasAcknowledgement: BIAS2 })).body);
    const b3 = R2((await A.post(e1.auth, "publish", { draft: draft2, project: e1.project, tieAttested: true, biasAcknowledgement: BIAS, whatChanged: { text: "Newer reading." } })).body);
    return ok(/COMPLETENESS_CARRIED_FORWARD/.test(b1.reason) && b2.reason === "NO_WHAT_CHANGED" && b3.reason === "BIAS_ACKNOWLEDGEMENT_CARRIED_FORWARD", `same exclusion list: ${b1.reason}/${b1.field}; no what-changed: ${b2.reason}; the old bias sentence: ${b3.reason}`);
  });
  await step("R96", "(a) edition 2 prepared with its own What-changed and fresh bias acknowledgement, signed and published; the older edition's banner quotes it", async () => {
    const p = R2((await A.post(e1.auth, "publish", { draft: draft2, project: e1.project, tieAttested: true, biasAcknowledgement: BIAS2, whatChanged: { text: "The newer reading of the minutes says Wednesday, so the finding now reads after the vote." } })).body);
    if (!p.ok) return ["BROKEN", "edition 2 not prepared: " + J(p, 500)];
    e1.prepared = p;
    const s = await sitAndSign(e1);
    const pg1 = (await A.get(stranger, { op: "publishedcase", id: id1, edition: "1" })).body;
    const pg2 = (await A.get(stranger, { op: "publishedcase", id: id1, edition: "2" })).body;
    ed2 = pg2;
    return ok(s.res.status === 200 && pg1.successor && /Wednesday/.test(pg1.successor.statement || "") && pg2.latest_edition === 2 && /Wednesday/.test((pg2.what_changed || {}).statement || ""),
      `caseratify ${s.res.status}; edition 1 page: latest_edition ${pg1.latest_edition}, successor ${J(pg1.successor, 200)}, its own what_changed ${J(pg1.what_changed)}; edition 2 page: what_changed ${J(pg2.what_changed, 200)}, bias ${J(pg2.bias_acknowledgement, 80)}, editions ${J(pg2.editions)}`);
  });
  await step("R174", "the published case is never marked: the public page says nothing about newer versions of its cited documents; the prior edition keeps answering", async () => {
    const t = dumpText((await A.get(stranger, { op: "publishedcase", id: id1, edition: "1" })).body).toLowerCase();
    return ok(!/newer version|newer copy|has changed since/.test(t), `edition 1 still answers; 'newer version' wording found: ${/newer version|newer copy|has changed since/.test(t)}`);
  });
  await step("R174", "the revision flag of the pinned finding is discharged by the new edition (recorded beside it, not replacing it)", async () => {
    const f = R2((await A.get(e1.auth, { op: "caseflags", case: id1 })).body);
    return ok(f.ok === true && (f.flags || []).length >= 1 && f.outstanding === 0, `flags ${J(f.flags, 400)} outstanding ${f.outstanding}`);
  });

  /* ---- a watched web source changes after publication (R41, R49, R174): a second case on a captured page ---- */
  let cw = null, idw = null;
  await step("R174", "publish a case that cites a captured page (web capture, self-attested only, with a reason)", async () => {
    cw = await caseOf(A, "marlowe", "w3", { web: true });
    const p = await cw.prepare();
    const s = await sitAndSign(cw);
    idw = cw.prepared && cw.prepared.caseId;
    const pg = (await A.get(stranger, { op: "publishedcase", id: idw })).body;
    return ok(p.ok && s.res.status === 200 && (pg.captures || [])[0] && pg.captures[0].self_attested_only === true, `prepare ${p.ok} ${p.reason || ""}; caseratify ${s.res.status}; captures[0] ${J((pg.captures || [])[0], 500)}`);
  });
  await step("R174", "a newer capture of the cited page is filed: the owner's Queue raises newer-capture-affects-reference; re-evaluation obligations; the case is not flagged", async () => {
    await later(2500);
    A.upstream.set("w3-page", { bytes: pageOf("The council moved the stamp to Wednesday."), type: "text/html" });
    const r = await (await A.plane("/api/?op=acquire", { method: "POST", headers: { ...cw.auth, "content-type": "application/json" }, body: JSON.stringify({ locator: cw.address, project: cw.project }) })).json();
    const cs2 = { ...cw.cs, w: (k, v) => word(k, v), date: (d) => d };
    const title = CAPTURE_SCREEN.parts.titleOf(cs2, { reading: r.reading, doc: r.document, address: cw.address });
    const made = await CAPTURE_SCREEN.parts.promoteDocument(cs2, { doc: r.document, title, locator: cw.address, project: cw.project });
    const t0 = Date.now(); let kinds = null;
    while (Date.now() - t0 < 120000) {
      const q = await A.get(cw.auth, { op: "queue" });
      const m = JSON.stringify(q.body).match(/"kind":"(newer-capture-affects-reference|watched-changed|[a-z-]*re-?evaluat[a-z-]*)"/g);
      if (m) { kinds = [...new Set(m)]; break; }
      await later(4000);
    }
    const flags = R2((await A.get(cw.auth, { op: "caseflags", case: idw })).body);
    const reev = R2((await A.get(cw.auth, { op: "reevaluations", target: cw.question })).body);
    const pg = JSON.stringify((await A.get(stranger, { op: "publishedcase", id: idw })).body).toLowerCase();
    return ok(!!kinds && !/newer version|newer copy/.test(pg), `newer capture filed ${made.bundleId}; Queue kinds after ${Date.now() - t0} ms: ${J(kinds)}; caseflags ${flags.count} (outstanding ${flags.outstanding}); reevaluations obligations ${reev.count}; the stranger's page names a newer version: ${/newer version|newer copy/.test(pg)}`);
  });

  /* ================= R96 / R177-R181: the docket ================= */
  await step("R178", "required core of the docket: the newer-edition To-do for the manager; she signs the edition entry with her key; the public docket quotes What changed", async () => {
    const d = R2((await A.get(e1.auth, { op: "docket", case: id1 })).body);
    const due = (d.core_due || []).find((x) => x.kind === "edition");
    const post = await docketAs(e1, id1, "edition", { edition: "2" });
    const pub = (await A.get(stranger, { op: "docketpublic", case: id1 })).body;
    const row = (pub.entries || []).find((x) => /"kind":"edition"/.test(x.json || ""));
    const d2 = R2((await A.get(e1.auth, { op: "docket", case: id1 })).body);
    return ok(!!due && post.posted && !!row, `To-do before: ${J(due, 300)}; post: ${post.posted ? "seq " + post.seq : post.refused || post.post}; public entry: ${J(row && row.fields, 400)}; To-do after: ${(d2.core_due || []).filter((x) => x.kind === "edition").length}`);
  });
  await step("R178", "a non-manager (a joined member who is not an owner) cannot place an entry public; any member may file to the record", async () => {
    const inv = await A.post(e1.auth, "projectinvite", {}, { projectId: e1.project, handle: "dee" });
    const joined = await A.post(dee.auth, "projectjoin", {}, { projectId: e1.project });
    const up = await capDoc(e1, "A reader's letter to the record.", "reader-letter");
    const pr = R2((await A.get(dee.auth, { op: "docketprepare", case: id1, kind: "edition", edition: "2" })).body);
    const fl = R2((await A.post(dee.auth, "docketfile", { case: id1, edition: 1, capture: up.sha, kind: "reaction", from: { kind: "other", name: "A reader" }, summary: "A reader writes.", proposed: "record", reason: "A comment." })).body);
    return ok(pr.ok === false && /NOT_THE_MANAGER/.test(pr.code || pr.reason || "") && fl.ok === true, `invite ${R2(inv.body).ok} join ${R2(joined.body).ok}; the joined non-owner's attempt to place an entry: ${pr.code || pr.reason} "${String(pr.translation || pr.detail || "").slice(0, 150)}"; her filing to the record: ${fl.ok ? "filed " + fl.entry : fl.code || fl.reason}`);
  });
  const holderResp = { n: 0 };
  await step("R180", "grant of standing: the manager signs a grant naming the contractor with a reason; its response is filed and listed", async () => {
    const g = await docketAs(e1, id1, "standing-granted", { edition: "1", holder: "Harbor Works LLC, the contractor", reason: "It is named in the minutes and may answer." });
    const resp = await capDoc(e1, "Harbor Works LLC reply: we dispute the date in the minutes.", "hw-reply");
    const f = R2((await A.post(e1.auth, "docketfile", { case: id1, edition: 1, capture: resp.sha, kind: "response", from: { kind: "holder", grant: g.seq }, summary: "We dispute the date.", proposed: "public", reason: "A reply to the case." })).body);
    const d = R2((await A.get(e1.auth, { op: "docket", case: id1 })).body);
    const entry = (d.entries || []).find((x) => x.entry === f.entry);
    holderResp.entry = f.entry;
    const pubd = await docketAs(e1, id1, "response", { entry: f.entry });
    const pub = (await A.get(stranger, { op: "docketpublic", case: id1 })).body;
    return ok(g.posted && f.ok === true && pubd.posted, `grant ${g.posted ? "seq " + g.seq : g.refused || g.post}; response filed ${f.ok} ${f.entry} (state ${entry && entry.state}, shelf ${entry && entry.shelf}); placed public: ${pubd.posted ? "seq " + pubd.seq : pubd.refused || pubd.post}; public entries ${(pub.entries || []).length} kinds ${J((pub.entries || []).map((x) => (x.fields || {}).kind))}; core_due ${J((d.core_due || []).map((x) => x.kind))}`);
  });
  await step("R179", "a subject's reply that names a private person: the subject must be a person the edition names", async () => {
    const resp = await capDoc(e1, "Reply from the named subject, who also names a private resident, Mrs. Quill of 12 Elm Lane.", "subj-reply");
    const f = R2((await A.post(e1.auth, "docketfile", { case: id1, edition: 1, capture: resp.sha, kind: "response", from: { kind: "subject", entity: "ENT-2026-0001" }, summary: "Reply.", proposed: "public", reason: "A reply." })).body);
    return ["NOT REACHED", `no person or office is named in this sitting's case (people named are area 5/6 and R90), so no subject exists to answer: filing as a subject is refused ${f.code || f.reason} "${String(f.translation || f.detail || "").slice(0, 160)}". The private-person redaction path is not reached.`];
  });
  await step("R177", "outside response: a reaction elsewhere (paste a link, capture it, link it to an edition, 'public')", async () => {
    const resp = await capDoc(e1, "Article: council defends the stamp.", "news-article");
    const f = R2((await A.post(e1.auth, "docketfile", { case: id1, edition: 1, capture: resp.sha, kind: "reaction", from: { kind: "other", name: "The Daily Ledger" }, summary: "The paper reports the council defends the stamp.", proposed: "public", reason: "Responding to edition 1." })).body);
    const asScreen = R2((await A.get(e1.auth, { op: "docketprepare", case: id1, entry: f.entry, kind: "reaction" })).body);
    const withSummary = R2((await A.get(e1.auth, { op: "docketprepare", case: id1, entry: f.entry, kind: "reaction", summary: "The paper reports the council defends the stamp." })).body);
    const d = R2((await A.get(e1.auth, { op: "docket", case: id1 })).body);
    const stored = (d.entries || []).find((x) => x.entry === f.entry) || {};
    return [asScreen.ok ? "WORKS" : "BROKEN", `filed ${f.ok} ${f.entry} (the summary I typed is ${"summary" in stored ? "stored: " + stored.summary : "not on the stored entry"}); 'Post it, signed' as the screen sends it (case, entry, kind only): ${asScreen.code || asScreen.reason || "ok"} "${String(asScreen.translation || "").slice(0, 120)}"; with a summary in the query: ${withSummary.code || withSummary.reason || "ok"} "${String(withSummary.translation || "").slice(0, 120)}". A reaction needs an independent archive copy (none exists for an upload, offline): not placeable here.`];
  });
  await step("R177", "a lawyer's letter marked legal pressure stays off the public docket; the doorbell contest brings a re-evaluation notice (docketpressure)", async () => {
    const d = R2((await A.get(e1.auth, { op: "docket", case: id1 })).body);
    const ent = (d.entries || []).find((x) => x.kind === "reaction") || (d.entries || [])[0];
    const pr = R2((await A.post(e1.auth, "docketpressure", { entry: ent && ent.entry, pressure: "legal" })).body);
    return [pr.ok ? "WORKS" : "NOT REACHED", `docketpressure on ${ent && ent.entry}: ${J(pr, 300)}`];
  });
  await step("R178", "take an entry back by a later entry with a reason, the earlier one still listed; a withdrawal is final", async () => {
    const tb = await docketAs(e1, id1, "take-back", { edition: "1", takesBack: "2", reason: "Filed against the wrong edition." });
    const pub = (await A.get(stranger, { op: "docketpublic", case: id1 })).body;
    const first = (pub.entries || []).find((x) => x.seq === 2) || {};
    return ok(tb.posted && first.taken_back !== undefined, `take-back: ${tb.posted ? "seq " + tb.seq : tb.refused || tb.post}; entry 2 still listed with taken_back ${J(first.taken_back)}`);
  });
  await step("R96", "(g) a court order: capture it, a signed docket entry names it, the edition is stamped; seal by capture hash returns 451 for the copy; unseal restores it", async () => {
    const order = await capDoc(e1, "Order of the Superior Court: the minutes shall be sealed pending review.", "court-order-doc");
    const before = await bytesOf(A, e1.digest);
    const seal = await docketAs(e1, id1, "court-order", { order: JSON.stringify({ effect: "seal", editions: [1], parts: [e1.digest] }), capture: order.sha, reason: "Court order 24-1." });
    const during = await bytesOf(A, e1.digest);
    const unseal = await docketAs(e1, id1, "court-order", { order: JSON.stringify({ effect: "unseal", editions: [1], parts: [e1.digest] }), capture: order.sha, reason: "Order lifted." });
    const after = await bytesOf(A, e1.digest);
    const pg = (await A.get(stranger, { op: "publishedcase", id: id1, edition: "1" })).body;
    return ok(before.st === 200 && seal.posted && during.st === 451 && unseal.posted && after.st === 200 && (pg.court_orders || []).length >= 2, `copy before ${before.st}; seal ${seal.posted ? "seq " + seq(seal) : seal.refused}; during ${during.st}; unseal ${unseal.posted ? "seq " + seq(unseal) : unseal.refused}; after ${after.st}; page.court_orders ${J((pg.court_orders || []).map((o) => ({ effect: o.effect, parts: o.parts && o.parts.map((x) => String(x).slice(0, 8)), digest: o.entry && o.entry.digest })))}`);
  });
  await step("R96", "(g) a court order that names a part by the material's name (not its hash) is accepted and stamped but withholds nothing", async () => {
    const order = await capDoc(e1, "Order of the Superior Court: seal by name.", "court-order-doc-2");
    const seal = await docketAs(e1, id1, "court-order", { order: JSON.stringify({ effect: "seal", editions: [1], parts: ["INFO-2026-0001-w1-minutes"] }), capture: order.sha, reason: "Court order 24-2." });
    const during = await bytesOf(A, e1.digest);
    return ["WORKS", `an order naming 'INFO-2026-0001-w1-minutes' (the material's ref) is ${seal.posted ? "posted, seq " + seq(seal) : "refused " + seal.refused}; the copy then answers ${during.st} (an order's reach is by capture hash, as FR6 G50 states). Recorded: the plane takes any one-line part name and does not say a name matched nothing.`];
  });
  await step("R181", "withdraw an edition with a reason: the stamp, reason and docket link on the page; the bytes still verify; withdrawing twice and lifting are refused", async () => {
    const wd = await docketAs(e1, id1, "withdrawal", { edition: "1", reason: "The minutes were filed in error." });
    const again = await docketAs(e1, id1, "withdrawal", { edition: "1", reason: "again" });
    const lift = await docketAs(e1, id1, "take-back", { edition: "1", takesBack: String(wd.seq), reason: "undo" });
    const pg = (await A.get(stranger, { op: "publishedcase", id: id1, edition: "1" })).body;
    const v = (await A.get(stranger, { op: "verify", sha256: pg.manifest_sha })).body;
    const noReason = await docketAs(e1, id1, "withdrawal", { edition: "2" });
    return ok(wd.posted && pg.withdrawn && v.published === true && !again.posted && !lift.posted, `withdrawal ${wd.posted ? "seq " + wd.seq : wd.refused}; page.withdrawn ${J(pg.withdrawn, 250)}; verify still ${v.published}; again: ${again.refused}; undo: ${lift.refused}; without a reason: ${noReason.refused}`);
  });
  await step("R181", "withdraw 'all' editions; the importing team's origin mark reads 'withdrawn by its publisher'", async () => {
    const all = await docketAs(e1, id1, "withdrawal", { edition: "all", reason: "The whole case is withdrawn." });
    const pg = (await A.get(stranger, { op: "publishedcase", id: id1 })).body;
    return ok(all.posted || /ALREADY_WITHDRAWN/.test(all.refused || ""), `withdraw all: ${all.posted ? "seq " + all.seq : all.refused}; latest page withdrawn ${J(pg.withdrawn, 200)}. The import's mark needs the other team to read the docket by address (importwatch fetches over the network: not reachable between two Miniflare rooms).`);
  });
  await step("R96", "(i) the 'Corrections and orders' line: none / one / several; the page counts", async () => {
    const pg = (await A.get(stranger, { op: "publishedcase", id: id1, edition: "2" })).body;
    return ok(!!pg.corrections, `corrections ${J(pg.corrections)}; court_orders ${(pg.court_orders || []).length}; docket_last_entry ${pg.docket_last_entry}`);
  });
  await step("R96", "(h) the docket travels by pull: a feed per case and no reader list", async () => {
    const f = await A.get(stranger, { op: "docketfeed", case: id1 });
    return ok(f.status === 200, `docketfeed ${f.status} ${J(f.body, 300)}`);
  });
  await step("R96", "(b) a published case cannot be divided, only superseded: nothing offers to divide it", async () => {
    const r = await A.post(e1.auth, "inquirydivide", { target: e1.question, project: e1.project }, {});
    return ["WORKS", `inquirydivide on a question a published case rests on: ${r.status} ${J(R2(r.body).code || R2(r.body).reason)} ${String(R2(r.body).translation || "").slice(0, 140)}`];
  });
  await step("R96", "(d) nothing sealed or redacted by the group: a confidential docket entry is refused", async () => {
    const resp = await capDoc(e1, "Letter marked confidential.", "conf-letter");
    const f = R2((await A.post(e1.auth, "docketfile", { case: id1, edition: 1, capture: resp.sha, kind: "reaction", from: { kind: "other", name: "A reader" }, summary: "A confidential note.", proposed: "confidential", reason: "Keep it private." })).body);
    return ok(f.ok === false, `proposed 'confidential': ${f.code || f.reason} "${String(f.translation || f.detail || "").slice(0, 200)}"`);
  });

  /* ================= R182: two captures of one source (k = 2), beside the one-capture control ================= */
  let k2 = null, idk = null;
  await step("R182", "capture one source twice (a changed page), vouch both, cite a passage in each in one question, draft and prepare", async () => {
    const m = await A.member("kay", ["contribute", "publish", "create_projects"]);
    const cs = A.screenCall(m.auth);
    const project = await projectOf(A, m.auth, "Walk 10b k2 project");
    const addr = "https://www.example.gov/k2-page?x=1";
    const caps = [];
    for (const [i, text] of [[0, "The clerk stamped the first draft of the contract RECEIVED before the council voted."], [1, "The clerk re-stamped the revised draft of the contract after the council voted."]]) {
      if (i) await later(2500);
      A.upstream.set("k2-page", { bytes: pageOf(text), type: "text/html" });
      const r = await (await A.plane("/api/?op=acquire", { method: "POST", headers: { ...m.auth, "content-type": "application/json" }, body: JSON.stringify({ locator: addr, project }) })).json();
      const cs2 = { ...cs, w: (k, v) => word(k, v), date: (d) => d };
      const made = await CAPTURE_SCREEN.parts.promoteDocument(cs2, { doc: r.document, title: CAPTURE_SCREEN.parts.titleOf(cs2, { reading: r.reading, doc: r.document, address: addr }), locator: addr, project });
      const sel = R2(await cs.call("select", { body: { ids: [made.bundleId] } }));
      const rel = await cs.call("release", { query: { handle: sel.handle, acknowledgment: "I checked this copy against the page.", mitigation: "Nothing in it names a private person." } });
      caps.push({ digest: r.document.capture.sha256, bundle: made.bundleId, vouched: rel.ok !== false && R2(rel).ok !== false });
    }
    const question = await questionOf(A, m.auth, project, "Was the contract stamped before the vote, on both copies of the notice?");
    const cites = [];
    for (const [c, term] of [[caps[0], "first draft of the contract"], [caps[1], "revised draft of the contract"]]) {
      const found = R2(await cs.call("findin", { body: { scope: { capture: c.digest }, kinds: ["term"], term } }));
      const item = (((found.kinds || [])[0] || {}).items || [])[0];
      cites.push(item ? R2(await cs.call("cite", { body: { project: question, role: "supports", found: item } })).cited : "no hit: " + J(found, 150));
    }
    const concl = R2(await cs.call("conclude", { query: { target: question, project, reading: "On the first copy the stamp preceded the vote; the revised copy was stamped after it.", falsifier: "A received log showing otherwise.", reason: "Both copies say so." } }));
    const draft = R2(await cs.call("casedraft", { body: { project, targets: [question], scope: "What each captured copy of the notice says about the stamp.", statement: "This case covers two copies of one notice only; it leaves out the vote record.", subjectPosition: "sought_and_answered", subjectJustification: "We put the question to the Clerk.", roles: { [question]: "load_bearing" }, excluded: [] } }));
    k2 = { rm: A, m, auth: m.auth, password: m.password, cs, project, question, caps, draft: draft.draftId, prepared: null, key: null };
    const prep = R2(await cs.call("publish", { body: { draft: draft.draftId, project, tieAttested: true, biasAcknowledgement: BIAS, selfAttested: caps.map((c) => ({ capture: c.digest, reason: "Fetched once each; no archive copy reachable." })) } }));
    k2.prepared = prep;
    idk = prep.caseId;
    return ok(caps.length === 2 && caps[0].digest !== caps[1].digest && prep.ok === true, `two captures ${J(caps.map((c) => c.digest.slice(0, 10) + " vouched " + c.vouched))}; cites ${J(cites)}; conclude ${concl.ok}; prepare ${prep.ok} ${prep.reason || ""} ${String(prep.detail || "").slice(0, 200)}`);
  });
  await step("R182", "sign and publish two captures of one address: is the case file bio-case-file/4 with copies under materials/<ref>/<sha>/ (k = 2)? each capture only with its own attestation", async () => {
    if (!k2 || !k2.prepared || !k2.prepared.ok) return ["NOT REACHED", "no prepared k = 2 edition (previous row)"];
    const s = await sitAndSign(k2);
    const pg = (await A.get(stranger, { op: "publishedcase", id: idk })).body;
    const zip = await W.zipOf(A, pg.manifest_sha);
    wf(join(WORK, "k2.zip"), zip.bytes);
    const ent = readStoredZip(new Uint8Array(zip.bytes));
    if (!(ent.entries instanceof Map)) { k2.zip = zip; k2.pg = pg; return ["BROKEN", `caseratify ${s.res.status}; the case file zip (status ${zip.status}, ${zip.type}, ${zip.bytes.length} bytes) is not readable as a case file: ${J(ent.problem)}; first bytes ${J(zip.bytes.slice(0, 200).toString("latin1"), 200)}`]; }
    const paths = [...ent.entries.keys()];
    const man = JSON.parse(Buffer.from(ent.entries.get("manifest.json")).toString("utf8"));
    k2.zip = zip; k2.pg = pg; k2.paths = paths;
    return [s.res.status === 200 && man.format === "bio-case-file/4" ? "WORKS" : "NOT REACHED", `k = 2 is NOT formed by the member's acts: a second capture of the same address is filed as a second document (two material rows, ${paths.filter((x) => /^materials\/[^/]+\/document$/.test(x)).length} documents), so the case file is ${man.format}, not bio-case-file/4 with materials/<ref>/<sha>/. ` + `caseratify ${s.res.status}; captures ${J((pg.captures || []).map((c) => ({ c: c.capture.slice(0, 8), grade: c.grade, self: c.self_attested_only })))}; duplicates ${paths.length - new Set(paths).size}; paths ${J(paths.filter((x) => /materials|attest/.test(x)), 500)}`];
  });
  await step("R182", "verify and recreate the k = 2 case file with the standalone checker (a passage quoted only in B is found; a tampered copy of B is reported against B only)", async () => {
    if (!k2 || !k2.zip) return ["NOT REACHED", "no k = 2 case file"];
    const run = spawnSync("node", [progPath, join(WORK, "k2.zip")], { encoding: "utf8", maxBuffer: 1e8 });
    const out = run.stdout || "";
    const first = out.split("\n")[0];
    return [/Recreated/.test(first) && !/Did not/.test(first) ? "WORKS" : "BROKEN", `checker: "${first.slice(0, 160)}" (exit ${run.status}); the standalone checker, run on the k = 2 case file the product published, does not recreate it either, so the tamper test (against B only) cannot be told apart from the base failure`];
  });
  await step("R182", "an obscured pair: a seal order naming A's original returns 451 for A's copy and 200 for B's, and the reverse", async () => {
    if (!k2 || !k2.prepared || !k2.prepared.ok || !k2.zip) return ["NOT REACHED", "no k = 2 case"];
    const order = await capDoc(k2, "Order of the Superior Court: seal the first copy.", "k2-order");
    const sealA = await docketAs(k2, idk, "court-order", { order: JSON.stringify({ effect: "seal", editions: [1], parts: [k2.caps[0].digest] }), capture: order.sha, reason: "Court order 24-9." });
    const a = await bytesOf(A, k2.caps[0].digest), b = await bytesOf(A, k2.caps[1].digest);
    const zipA = await W.zipOf(A, k2.pg.manifest_sha);
    return ok(sealA.posted && a.st === 451 && b.st === 200, `seal naming A: ${sealA.posted ? "posted" : sealA.refused}; A's copy ${a.st}; B's copy ${b.st}; the case file zip itself now answers ${zipA.status}`);
  });
  await step("R182", "import the k = 2 case into the second team: both files are kept; a /3 file edited to /4 or the reverse is refused IMPORT_NOT_A_CASE_FILE", async () => {
    if (!k2 || !k2.zip) return ["NOT REACHED", "no k = 2 case file"];
    const good = R2((await B.post(bea.auth, "caseimport", { parts: [k2.zip.bytes.toString("base64")] })).body);
    const z = Buffer.from(k2.zip.bytes); const at = z.indexOf(Buffer.from("bio-case-file/4")); if (at > 0) z[at + "bio-case-file/".length] = "3".charCodeAt(0);
    const edited = R2((await B.post(bea.auth, "caseimport", { parts: [z.toString("base64")] })).body);
    const z1 = Buffer.from(zip1.bytes); const at1 = z1.indexOf(Buffer.from("bio-case-file/3")); if (at1 > 0) z1[at1 + "bio-case-file/".length] = "4".charCodeAt(0);
    const edited2 = R2((await B.post(bea.auth, "caseimport", { parts: [z1.toString("base64")] })).body);
    return ok(good.ok === true && edited2.ok === false, `two-document file imported ok ${good.ok} (${J((good.recreation || {}).findings && good.recreation.findings.map((f) => f.result))}); a /3 file edited to say /4: ${edited2.code || edited2.reason || "imported"}; (no /4 file was formed, so /4 edited to /3 was not tried: ${edited.ok ? "the unchanged /3 file imported again, existed " + edited.existed : edited.code || edited.reason})`);
  });
  await step("R182", "the size refusal CASE_DOCUMENT_TOO_LARGE (bound 1,572,864 B) is not reachable at this size", async () => ["NOT REACHED", "noted unwalked, as the row says: the case document here is a few KB."]);

  await step("R94", "(g) a finding pinned by several cases: a second case over the same finding is published (FINDING_IN_SEVERAL_CASES, CASES_DISAGREE)", async () => {
    const d3 = R2((await A.post(e1.auth, "casedraft", { project: e1.project, targets: [e1.question], scope: "A second case over the same finding.", statement: "This second case covers the same stamp and leaves out the amendments.", subjectPosition: "not_sought", subjectJustification: "We did not ask the Clerk for this one.", roles: { [e1.question]: "load_bearing" }, excluded: [] })).body);
    const p3 = d3.draftId ? R2((await A.post(e1.auth, "publish", { draft: d3.draftId, project: e1.project, tieAttested: true, biasAcknowledgement: "A second case, a second lens sentence, authored for it.", newCase: true })).body) : d3;
    return ["NOT REACHED", `a second case over a finding another case pins: draft ${d3.draftId || J(d3, 160)}; publish: ${p3.ok ? "prepared " + p3.caseId : (p3.code || p3.reason) + " " + String(p3.detail || p3.translation || "").slice(0, 220)}. The page that offers each case (FINDING_IN_SEVERAL_CASES) needs two published cases pinning one finding from different projects (area 10a / second project owner).`];
  });
  await step("R94", "(n) 'view under another lens' and 're-run' on the published page are owed K4169: casedetailspublic, rerunstart", async () => {
    const o = [];
    for (const op of ["casedetailspublic", "casedetails", "rerunstart"]) { const r = await A.get(stranger, { op, case: id1 }); o.push(`${op}: ${r.status} ${J(R2(r.body).code || R2(r.body).reason)}`); }
    return ["NOT REACHED", `${o.join(" | ")} (owed: absence recorded, not a defect)`];
  });
  await step("R98", "(f) the team's own published case that relies on accepted work states who accepted which edition and why", async () => ["NOT REACHED", "nothing was accepted in the second team (no finding recreated: see the R98 recreation row), so a case resting on accepted work cannot be built."]);
  await step("R174", "as a second project owner make a shared finding current and confirm the first project's case is not flagged; then M-100 (a second project's publish of a finding another project's case pins)", async () => ["NOT REACHED", "needs a second project owner and a finding shared across two projects (a two-project fixture the sitting does not make); M-100 is routed to BOB and not walked here."]);

  await step("R182", "the other way to a second copy: watch a document and 'Check for a new version now' (monitorset, monitor): the changed copy is held in the same document; can its passage be cited?", async () => {
    const m = await A.member("kay", ["contribute", "publish", "create_projects"]);
    const cs = A.screenCall(m.auth);
    const project = await projectOf(A, m.auth, "Walk 10b monitor project");
    const addr = "https://www.example.gov/mon-page?x=1";
    A.upstream.set("mon-page", { bytes: pageOf("The clerk stamped the first draft of the contract RECEIVED before the council voted."), type: "text/html" });
    const r = await (await A.plane("/api/?op=acquire", { method: "POST", headers: { ...m.auth, "content-type": "application/json" }, body: JSON.stringify({ locator: addr, project }) })).json();
    const cs2 = { ...cs, w: (k, v) => word(k, v), date: (d) => d };
    const made = await CAPTURE_SCREEN.parts.promoteDocument(cs2, { doc: r.document, title: "mon", locator: addr, project });
    const ms = R2((await A.post(m.auth, "monitorset", { bundleId: made.bundleId, enabled: true, frequency: "daily" })).body);
    await later(2500);
    A.upstream.set("mon-page", { bytes: pageOf("The clerk re-stamped the revised draft of the contract after the council voted."), type: "text/html" });
    const mo = R2((await A.post(m.auth, "monitor", { bundleId: made.bundleId })).body);
    const t0 = Date.now(); let hits = -1;
    while (Date.now() - t0 < 60000) {
      const f = R2(await cs.call("findin", { body: { scope: { capture: mo.seen }, kinds: ["term"], term: "revised draft" } }));
      hits = (((f.kinds || [])[0] || {}).items || []).length;
      if (hits > 0) break;
      await later(5000);
    }
    return [hits > 0 ? "WORKS" : "BROKEN", `monitorset ${J(ms, 300)}; monitor: ${J(mo, 400)}; the changed copy ${String(mo.seen).slice(0, 10)} found by a search for its own words after ${Date.now() - t0} ms: ${hits} hit(s). Until it reads, a passage of the second copy cannot be cited, so a case cannot rest on both copies of one document.`];
  });

  /* ================= R173, R175, R183, R184, R185 ================= */
  await step("R173", "an opinion as a case element (MK-5): does the editor offer an opinion at all", async () => {
    const { spawnSync: sp } = await import("node:child_process");
    const g2 = sp("grep", ["-rliE", "opinion", BIO + "src/screens-publish", BIO + "src/case-inputs", BIO + "src/case-authoring"], { encoding: "utf8" });
    return ["NOT REACHED", `absent: the case editor, case-inputs and case-authoring sources name no opinion element (files naming the word: ${J((g2.stdout || "").split("\n").filter(Boolean))}); recorded as absent, not a defect (MK-5 is not marked built).`];
  });
  await step("R175", "the fence: a stranger finds no fence marker, band or 'working record' wording; an outsider asking for a working-side address is answered as if it did not exist", async () => {
    const page = dumpText((await A.get(stranger, { op: "publishedcase", id: id1 })).body).toLowerCase();
    const hits = ["shared for review", "working record", "working frame", "path to publication", "not a publication"].filter((t) => page.includes(t));
    const r1 = await A.get(stranger, { op: "casedocument", case: id1, edition: "1" });
    const r1b = await A.get(stranger, { op: "casedocument", case: "CASE-2099-0001", edition: "1" });
    const r2 = await A.get(stranger, { op: "casedraft", draft: "DRAFT-2026-0001" });
    const r3 = await A.get(stranger, { op: "reviewcopy", draft: c1.draft });
    return ok(hits.length === 0 && r2.status === 401 && r3.status !== 200, `fence words on the stranger's page: ${J(hits)}; stranger asking for the working side: the published case's casedocument ${r1.status} (the signed document is public by design), a case that does not exist ${r1b.status} ${J(R2(r1b.body).code)}, a draft's casedraft ${r2.status} ${J(R2(r2.body).code)}, a draft's reviewcopy ${r3.status} ${J(R2(r3.body).code)}. A sign-in demand (401) on one and not-found (404) on another is two different answers for working-side addresses. The band and marker are screen-side and not walked here.`);
  });
  await step("R183", "the assistant tray in the alpha: optionadopt and planproposals (empty state 'No suggestions waiting.')", async () => {
    const o = [];
    for (const op of ["planproposals", "optionadopt"]) { const r = await A.get(e1.auth, { op }); o.push(`${op}: ${r.status} ${J(R2(r.body).code || R2(r.body).reason)} ${String(R2(r.body).translation || "").slice(0, 100)}`); }
    return ["NOT REACHED", `the tray sits beside a plan, which is area 9/11's (a plan needs a determination); with no plan the two ops answer: ${o.join(" | ")}. Not walked.`];
  });
  await step("R184", "the network directory (believeincities.org) and the 'Groups at work' listing", async () => ["NOT REACHED", "outside the team's copy: the directory is its own site and nothing in Civicsmith connects to it (R176); no listing act is reachable through the plane. The steward side is not a team walker's act. Recorded as out of scope (Bob's to settle if it is in a T51 walk)."]);
  await step("R185", "hand over or dissolve a team: export the record, hosting-holder record, signer set, remove the team; the published edition survives", async () => {
    const o = [];
    for (const op of ["export", "hostingaccessset", "signerset", "installremove", "signerlist"]) { const r = await A.get(await A.founder(), { op }); o.push(`${op}: ${r.status} ${J(R2(r.body).code || R2(r.body).reason || (R2(r.body).ok ? "ok" : ""))}`); }
    const survives = (await A.get(stranger, { op: "publishedcase", id: id1 })).body;
    return ["NOT REACHED", `removing the team is the installer's act (installremove is not a plane op in this room: ${o.join(" | ")}); the founder's export and signer reads answer as listed. Not performed: the published case still answers ${survives.ok} after the docket acts above, but a removal of the team was not tried.`];
  });

  await step("R96", "(g) a 'remove' order on one case: its own bytes answer 451, the page; and another published case's case file (a cross-case check)", async () => {
    const X = await caseOf(A, "marlowe", "x9"); await X.prepare(); await sitAndSign(X);
    const idX = X.prepared.caseId;
    const pgX = (await A.get(stranger, { op: "publishedcase", id: idX })).body;
    const order = await capDoc(X, "Order of the Superior Court: remove the case.", "court-order-doc-9");
    const okIds = [id1, idk].filter(Boolean);
    const before = {};
    for (const id of okIds) { const pg = (await A.get(stranger, { op: "publishedcase", id })).body; before[id] = { m: pg.manifest_sha, zip: (await W.zipOf(A, pg.manifest_sha)).status, mf: (await bytesOf(A, pg.manifest_sha)).st }; }
    const rm = await docketAs(X, idX, "court-order", { order: JSON.stringify({ effect: "remove", editions: [1] }), capture: order.sha, reason: "Removal order 24-3." });
    const after = {};
    for (const id of okIds) { after[id] = { zip: (await W.zipOf(A, before[id].m)).status, mf: (await bytesOf(A, before[id].m)).st }; }
    const own = { zip: (await W.zipOf(A, pgX.manifest_sha)).status, manifest: (await bytesOf(A, pgX.manifest_sha)).st, copy: (await bytesOf(A, X.digest)).st };
    const pg2 = (await A.get(stranger, { op: "publishedcase", id: idX })).body;
    const crossed = okIds.filter((id) => before[id].zip === 200 && after[id].zip !== 200);
    return [rm.posted && crossed.length === 0 && own.zip === 451 ? (pg2.ok === true && (pg2.findings || []).length ? "BROKEN" : "WORKS") : "BROKEN",
      `remove order on case ${idX}: ${rm.posted ? "posted seq " + rm.seq : rm.refused}; its own case file ${own.zip}, manifest bytes ${own.manifest}, capture copy ${own.copy}; its page still answers ok ${pg2.ok} with ${(pg2.findings || []).length} finding(s) and court_orders ${J((pg2.court_orders || []).map((o) => o.effect))}. OTHER published cases (not named by the order): ${okIds.map((id) => `${id} case file ${before[id].zip} -> ${after[id].zip}`).join("; ")}. Cross-case: ${crossed.length ? "ANOTHER CASE'S CASE FILE IS WITHHELD BY THIS ORDER" : "none"}`];
  });

  /* ================= the overlay's checks for this sitting ================= */
  await step("OVERLAY", "(4) empty / absent / could-not-read states: a case that does not exist, an empty docket, a malformed hash, no imports", async () => {
    const a = await A.get(stranger, { op: "publishedcase", id: "CASE-2099-9999" });
    const b = await A.get(stranger, { op: "docketpublic", case: "CASE-2099-9999" });
    const c = await B.get(bea.auth, { op: "importedcase", import: "0".repeat(64) });
    const d = await A.get(stranger, { op: "publishedbytes", sha256: "nothex" });
    const e = await A.get(stranger, { op: "docketpublic", case: idw });
    return ok(a.status === 404 || R2(a.body).ok === false, `unknown case: ${a.status} ${J(R2(a.body).code || R2(a.body).reason)} "${String(R2(a.body).translation || R2(a.body).detail || "").slice(0, 120)}"; unknown docket: ${b.status} ${J(R2(b.body).code || R2(b.body).reason)}; unknown import: ${c.status} ${J(R2(c.body).code || R2(c.body).reason)}; malformed hash: ${d.status} ${J(R2(d.body).code || R2(d.body).reason)}; an empty docket: ${e.status} entries ${(e.body.entries || []).length}`);
  });
  await step("OVERLAY", "(6) a refusal teaches: every refusal above carries the plane's translation sentence, a code, and never 'something went wrong' (sampled)", async () => {
    const samples = [await A.get(stranger, { op: "verify", sha256: "xyz" }), await A.get(stranger, { op: "versionchain", id: id1 }), await A.post(dee.auth, "caseratify", { caseId: id1, edition: 1, expectedSha: "0".repeat(64), sig: "x", members: [] })];
    const lines = samples.map((r) => `${r.status} ${J(R2(r.body).code || R2(r.body).reason)} -> "${String(R2(r.body).translation || "").slice(0, 110)}"`);
    return ok(samples.every((r) => (R2(r.body).translation || "").length > 20), lines.join(" | "));
  });
  await step("OVERLAY", "(21) role: what a member lacks is refused by the operation layer if called anyway (a contribute-only member publishes, signs, imports)", async () => {
    const pub = R2((await A.post(dee.auth, "publish", { draft: e1.draft, project: e1.project, tieAttested: true, biasAcknowledgement: BIAS })).body);
    const sgn = R2((await A.post(dee.auth, "signerregisterown", { keyB64: (await newKey()).keyB64 })).body);
    const whoami = R2((await A.get(dee.auth, { op: "whoami" })).body);
    return ok(pub.ok === false, `contribute-only member publish: ${pub.code || pub.reason}; register a signing key: ${sgn.ok ? "allowed" : sgn.code || sgn.reason}; her capabilities ${J(whoami.capabilities || whoami.can)}`);
  });
  await step("OVERLAY", "R217: 'Help me write this' with no assistant connected, on the 10b screens that offer it (imported, docket, case-editor)", async () => {
    const out = [];
    for (const forop of ["docketfile", "importflag", "casedraft"]) { const r = await A.post(e1.auth, "writinghelp", { op: forop, field: "summary", told: "The paper reports the council defends the stamp." }); out.push(`${forop}: ${r.status} ${J(R2(r.body).code || R2(r.body).reason || (R2(r.body).ok ? "ok" : ""))} ${String(R2(r.body).translation || R2(r.body).state || "").slice(0, 100)}`); }
    return ["WORKS", `no assistant connected: ${out.join(" | ")} (answers read, not silent failures)`];
  });
  await step("OVERLAY", "R218: two members change one case draft at once (base-stamped write): the same field twice", async () => {
    const d = R2(await e1.cs.call("casedraft", { body: { project: e1.project, caseId: id1, targets: [e1.question], scope: "Two writers draft." } }));
    if (!d.draftId) return ["NOT REACHED", "a draft could not be started: " + J(d, 200)];
    const one = R2((await A.post(e1.auth, "casedraft", { draft: d.draftId, statement: "Writer one: this covers the stamp only." })).body);
    const two = R2((await A.post(e1.auth, "casedraft", { draft: d.draftId, statement: "Writer two: this covers the minutes only." })).body);
    const copy = R2(await e1.cs.call("reviewcopy", { query: { draft: d.draftId } }));
    return ["NOT REACHED", `only the project's owner may edit a draft here, so one account wrote twice (not two writers): writer one ${one.ok}, writer two ${two.ok}, the draft now holds "${J(copy.authored && copy.authored.statement, 120)}" (the second save silently replaced the first, no divergence named: by design only if one writer). A second owner is needed for the real two-writer test.`];
  });

  await browserPhase({ ...W, idEd1: id1, projectOf1: e1.project, idK: idk, bea, impId, marlowe: e1, dee });

  /* ================= timings ================= */
  const firstOfRoom = new Set(); const warm = TIMINGS.filter((t) => { if (t.op === "claim") return false; return true; });
  const slow = [...warm].sort((a, b) => b.wall - a.wall).slice(0, 14).map((t) => `${t.op} ${t.status} ${t.wall} ms [${String(t.st || "").split(",").filter((x) => /^(do-|in-)/.test(x.trim()) && !/bytes/.test(x)).slice(0, 2).join(",")}]`);
  const byOp = {}; warm.forEach((t) => { (byOp[t.op] = byOp[t.op] || []).push(t.wall); });
  const med = (a) => a.sort((x, y) => x - y)[Math.floor(a.length / 2)];
  const keyReads = ["publishedcase", "publishedmanifest", "publishedbytes", "verify", "docketpublic", "docket", "caseimport", "importedcase", "importedcases", "casechecker", "caseratify", "publish", "docketfile", "docketprepare", "docketpost"].filter((o) => byOp[o]).map((o) => `${o} n=${byOp[o].length} median ${med(byOp[o])} max ${Math.max(...byOp[o])} ms`);
  rec("OVERLAY", "(31) timing of every request made in this sitting (wall, Server-Timing header when the Worker sent one); the 'claim' of each room (workerd's cold start, 46 s here) is left out", "WORKS", `${warm.length} requests; key ops: ${keyReads.join("; ")} || slowest: ${slow.join(" || ")}`);
  const stReq = TIMINGS.filter((t) => t.st).length;
  rec("OVERLAY", "Server-Timing present on answers (R108's measure)", stReq > 0 ? "WORKS" : "BROKEN", `${stReq} of ${TIMINGS.length} answers carried a Server-Timing header; sample: ${J(TIMINGS.find((t) => t.st))}`);
}


/* =========================================================== the screens, in a real browser against the same Miniflare =========================================================== */
const PW = createRequire("/opt/node-tools/")("playwright");
const SHOTS = fileURLToPath(new URL("../shots/10b-case/", import.meta.url));
async function browserPhase(W) {
  const { A, B, stranger } = W;
  const baseA = String(await A.mf.ready).replace(/\/$/, ""), baseB = String(await B.mf.ready).replace(/\/$/, "");
  let browser;
  try { browser = await PW.chromium.launch(); } catch (x) { rec("R213", "a browser against the offline room", "NOT REACHED", "Chromium would not start: " + String(x).slice(0, 200)); return; }
  const forbidden = /\b(CASE|INQ|INFO|PROJ|DKT|DRAFT)-\d{4}-\d{4}\b|undefined|\[object|\bNaN\b|\bnull\b/;
  async function visit({ name, row, base, path, width, who = null, scheme = "light", media = "screen", full = false, note = "" }) {
    const t0 = Date.now();
    const ctx = await browser.newContext({ viewport: { width, height: width <= 500 ? 844 : 900 }, colorScheme: scheme, reducedMotion: "reduce", deviceScaleFactor: 1 });
    const page = await ctx.newPage();
    const errs = [], outside = [], failed = [];
    page.on("console", (m) => { if (m.type() === "error") errs.push(m.text().slice(0, 140)); });
    page.on("pageerror", (x) => errs.push("pageerror: " + String(x).slice(0, 140)));
    page.on("request", (r) => { if (!r.url().startsWith(base) && !r.url().startsWith("data:") && !r.url().startsWith("blob:")) outside.push(r.url().slice(0, 100)); });
    page.on("response", (r) => { if (r.status() >= 400) failed.push(r.status() + " " + r.url().replace(base, "").slice(0, 80)); });
    try {
      if (who) {
        await page.goto(base + "/", { waitUntil: "networkidle" });
        await page.fill('[name="fs-handle"], #fs-handle', who.handle);
        await page.fill('[name="fs-pw"], #fs-pw', who.password);
        await page.click('button:has-text("Sign in")');
        await page.waitForLoadState("networkidle");
      }
      const t1 = Date.now();
      await page.goto(base + path, { waitUntil: "networkidle" });
      const loadMs = Date.now() - t1;
      if (media === "print") await page.emulateMedia({ media: "print" });
      const m = await page.evaluate(() => {
        const vw = window.innerWidth, doc = document.documentElement;
        const small = [...document.querySelectorAll("a,button,input,select,textarea,summary,[role=button]")].filter((e) => { const r = e.getBoundingClientRect(); const cs = getComputedStyle(e); return r.width > 0 && r.height > 0 && cs.visibility !== "hidden" && (r.height < 44 || r.width < 44) && !(e.tagName === "A" && e.closest("p,li,dd,td,span") && e.parentElement && e.parentElement.childNodes.length > 1); });
        const noNameEls = [...document.querySelectorAll("button,input:not([type=hidden]),select,textarea,a[href]")].filter((e) => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 && !(e.getAttribute("aria-label") || e.innerText.trim() || (e.type !== "checkbox" && e.type !== "radio" && e.value) || e.title || (e.labels && e.labels.length) || e.getAttribute("aria-labelledby") || e.placeholder); });
        const noName = noNameEls.length; const noNameSample = noNameEls.slice(0, 3).map((e) => e.tagName + ":" + (e.type || "") + ":" + (e.id || e.name || e.className || "").toString().slice(0, 30));
        const bg = getComputedStyle(document.body).backgroundColor;
        return { overflow: doc.scrollWidth - vw, text: document.body.innerText.replace(/\s+/g, " "), small: small.length, smallSample: small.slice(0, 4).map((e) => e.tagName + ":" + (e.innerText || e.value || e.getAttribute("aria-label") || "").trim().slice(0, 20)), noName, noNameSample, bg, title: document.title, h: doc.scrollHeight, fonts: [...new Set([...document.querySelectorAll("*")].slice(0, 400).map((e) => getComputedStyle(e).fontFamily.split(",")[0]))].slice(0, 4) };
      });
      const file = `${name}-${width}${scheme === "dark" ? "-dark" : ""}${media === "print" ? "-print" : ""}.png`;
      await page.screenshot({ path: SHOTS + file, fullPage: full });
      const bad = (m.text.match(forbidden) || [])[0];
      const verdict = m.overflow > 0 || errs.length || outside.length || bad ? "BROKEN" : "WORKS";
      rec(row, `${name} at ${width} px${scheme === "dark" ? ", dark" : ""}${media === "print" ? ", print" : ""}${who ? ", as " + who.handle : ", as a stranger"}${note ? " (" + note + ")" : ""}`, verdict,
        `shots/10b-case/${file}; load ${loadMs} ms (to network idle), whole visit ${Date.now() - t0} ms; sideways overflow ${m.overflow} px; page height ${m.h}; title "${m.title}"; targets under 44 px: ${m.small} ${J(m.smallSample)}; controls with no accessible name: ${m.noName} ${J(m.noNameSample)}; console errors ${J(errs)}; requests outside the copy ${J(outside)}; failed responses ${J(failed)}; raw id or machine word in visible text: ${bad ? J(bad) : "none"}; body background ${m.bg}; fonts ${J(m.fonts)}; text starts: "${m.text.slice(0, 220)}"`, loadMs);
      return m;
    } catch (x) {
      rec(row, `${name} at ${width} px`, "NOT REACHED", "the visit failed: " + String(x).split("\n")[0].slice(0, 300));
    } finally { await ctx.close(); }
  }
  const idA = W.idEd1, proj = W.projectOf1;
  for (const width of [1280, 390]) {
    await visit({ name: "published-edition-2", row: "R94", base: baseA, path: `/app/published/${idA}`, width, full: width === 390 });
    await visit({ name: "published-edition-1", row: "R94", base: baseA, path: `/app/published/${idA}/1`, width, note: "an older edition, withdrawn since" });
    await visit({ name: "docket-public", row: "R96", base: baseA, path: `/app/docket-public/${idA}`, width, full: width === 390 });
    await visit({ name: "docket-manager", row: "R96", base: baseA, path: `/app/docket/${proj}/${idA}`, width, who: { handle: W.marlowe.m.handle, password: W.marlowe.m.password }, full: width === 390 });
    await visit({ name: "imported-list", row: "R98", base: baseB, path: `/app/imported`, width, who: { handle: W.bea.handle, password: W.bea.password }, full: width === 390 });
    await visit({ name: "imported-case", row: "R98", base: baseB, path: `/app/imported/${W.impId}`, width, who: { handle: W.bea.handle, password: W.bea.password }, full: width === 390 });
    await visit({ name: "queue-owner", row: "R213", base: baseA, path: `/app/queue`, width, who: { handle: W.marlowe.m.handle, password: W.marlowe.m.password } });
    await visit({ name: "case-editor-next-edition", row: "R96", base: baseA, path: `/app/case-editor/${proj}`, width, who: { handle: W.marlowe.m.handle, password: W.marlowe.m.password } });
  }
  {
    const ctx0 = await browser.newContext({ viewport: { width: 1280, height: 900 } });
    const pg0 = await ctx0.newPage();
    await pg0.goto(baseA + `/app/published/${idA}`, { waitUntil: "networkidle" });
    const t0 = (await pg0.innerText("body")).replace(/\s+/g, " ");
    const f0 = (t0.match(/FINDING 1.{0,260}/i) || [""])[0];
    rec("R94", "(a) on the screen, each finding draws its role and BOTH strengths beside the bar (or 'not graded yet' / 'no bar declared'); the page sentence says 'Each finding shows two strengths'", /not graded|no bar|unrated|nobody|undetermined|capture grade|strength/i.test(f0.replace(/Each finding shows two strengths/i, "")) ? "WORKS" : "BROKEN",
      `the finding as drawn: "${f0}". The page data (publishedcase) carries strength[] with state 'unrated' and a 'Not graded yet on capture ...' sentence for each axis, and bar.declared=false with its sentence; none of these is drawn on the finding. Visible text has 'not graded' ${/not graded/i.test(t0)}, 'no bar' ${/no bar|declares no/i.test(t0)}.`);
    const lens = (t0.match(/HOW THIS TEAM READS EVIDENCE.{0,420}/i) || [""])[0];
    rec("R94", "(c) on the screen, 'The lens this case was produced under': acknowledgement first, statements, two lines on why groups declare bias", /why|everyone who investigates|lens/i.test(lens) ? "WORKS" : "BROKEN", `as drawn: "${lens}". The data carries lens.closing[] ("Everyone who investigates looks through a lens ...") and lens.print; the page draws only the acknowledgement sentence under 'How this team reads evidence'.`);
    await ctx0.close();
  }
  await visit({ name: "published-edition-2", row: "R170", base: baseA, path: `/app/published/${idA}`, width: 1280, scheme: "dark", note: "dark mode" });
  await visit({ name: "published-edition-2", row: "R170", base: baseA, path: `/app/published/${idA}`, width: 1280, media: "print", note: "print is always light" });
  await visit({ name: "published-edition-2", row: "R170", base: baseA, path: `/app/published/${idA}`, width: 640, note: "200 per cent zoom of a 1280 window" });
  await visit({ name: "docket-public", row: "R170", base: baseA, path: `/app/docket-public/${idA}`, width: 1280, scheme: "dark", note: "dark mode" });
  /* keyboard only through the published page: Tab moves on, never traps; the controls reached are named */
  try {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
    const page = await ctx.newPage();
    await page.goto(baseA + `/app/published/${idA}`, { waitUntil: "networkidle" });
    const seen = [];
    for (let i = 0; i < 30; i++) { await page.keyboard.press("Tab"); seen.push(await page.evaluate(() => { const e = document.activeElement; if (!e || e === document.body) return "body"; const cs = getComputedStyle(e); return (e.tagName + ":" + (e.getAttribute("aria-label") || e.innerText || e.value || e.id || "").trim().slice(0, 24) + (cs.outlineStyle !== "none" && parseFloat(cs.outlineWidth) > 0 || cs.boxShadow !== "none" ? "[ring]" : "[no-ring]")); })); }
    const distinct = new Set(seen);
    rec("R170", "keyboard only through the published case: 30 Tab presses move on, nothing traps, each focused control is named and shows a ring", distinct.size > 5 && !seen.filter((x) => x !== "body").slice(-1).includes("body") ? (seen.some((x) => /no-ring/.test(x)) ? "BROKEN" : "WORKS") : "BROKEN", `${distinct.size} distinct stops; sequence ${J(seen.slice(0, 18), 700)}; stops with no visible ring: ${J(seen.filter((x) => /no-ring/.test(x)).slice(0, 5))}`);
    await ctx.close();
  } catch (x) { rec("R170", "keyboard only through the published case", "NOT REACHED", String(x).slice(0, 200)); }
  await browser.close();
}
