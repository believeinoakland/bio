/* Drive-to-plane migration: front-door replay.
 *
 * Input is a local mirror of the CivicOS store root (the Drive folder,
 * downloaded as-is: information/ problems/ projects/ actions/ index/). Each
 * bundle's revision states are reconstructed from its _history, cross-checked
 * against the SHA-256s recorded in the original promotion records, and then
 * replayed in order through the plane's public promote op, so every migrated
 * write passes the same CAS and the same append-only history path a live
 * write does, and the Drive-side snapshot keys are preserved verbatim.
 *
 * Nothing is imported through a side door. Capture bytes travel through the
 * capture op, content-addressed and server-verified. The original promotion
 * records, the bundle's _history manifest, and its index entry are preserved
 * verbatim as a registered drive-provenance capture, so the Drive era remains
 * inspectable without polluting the live file image.
 *
 * Usage:
 *   node migrate/migrate.mjs --root <CivicOS dir> --url <https://instance>
 *        --token <admin-or-member token> [--store bio] [--only <bundleId>]
 *        [--index <path to index.json>] [--dry] [--verify-only]
 *
 * Exit 0 only if every selected bundle migrated and verified clean.
 */
import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { join, relative, sep } from "node:path";
import { createHash } from "node:crypto";

const EMPTY_SHA = "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855";
const TYPE_ROOTS = ["information", "problems", "projects", "actions"];
const SNAP_RE = /^(.+)_(\d{8}T\d{6}Z)_([0-9a-f]{8})(\.[^.]+)$/;

const sha256 = (buf) => createHash("sha256").update(buf).digest("hex");
const isUtf8 = (buf) => { try { new TextDecoder("utf-8", { fatal: true }).decode(buf); return true; } catch { return false; } };

/* ---------- mirror reading ---------- */

function walk(dir, base = dir) {
  const out = [];
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) out.push(...walk(p, base));
    else out.push(relative(base, p).split(sep).join("/"));
  }
  return out;
}

export function discoverBundles(root) {
  const found = [];
  for (const tr of TYPE_ROOTS) {
    const d = join(root, tr);
    if (!existsSync(d)) continue;
    for (const name of readdirSync(d)) {
      const p = join(d, name);
      if (statSync(p).isDirectory()) found.push({ bundleId: name, typeRoot: tr, dir: p });
    }
  }
  return found.sort((a, b) => a.bundleId.localeCompare(b.bundleId));
}

/* Read a bundle folder into { live, history, promotions, manifest, log }.
 * live:      Map path -> Buffer (twins resolved, _history excluded)
 * history:   Map snapKey -> Map origPath -> Buffer (archived replaced files)
 * promotions: sorted [{ stamp, hash8, key, record, raw }]
 */
export function loadBundle(dir) {
  const log = [];
  const paths = walk(dir);
  const live = new Map();
  const history = new Map();
  const promotions = [];
  const refusals = new Map(); // refusal key -> { record, files }
  let manifestRaw = null;

  for (const p of paths) {
    const buf = readFileSync(join(dir, p));
    if (p.startsWith("_history/")) {
      const rel = p.slice("_history/".length);
      /* Refused writes are part of the record: the gate said no and the
         refusal plus its package were archived. They are carried verbatim
         into the drive-provenance capture, never into live state or the
         replayed history. */
      const rm = rel.match(/^refused_(\d{8}T\d{6}Z_[0-9a-f]+)(\.json$|\/)(.*)$/);
      if (rm) {
        const [, rkey, kind, sub] = rm;
        if (!refusals.has(rkey)) refusals.set(rkey, { files: {} });
        if (kind === ".json") refusals.get(rkey).record = JSON.parse(buf.toString("utf8"));
        else refusals.get(rkey).files[sub] = buf.toString("utf8");
        continue;
      }
      const base = rel.split("/").pop();
      const dirPart = rel.slice(0, rel.length - base.length); // "" or "data/"
      if (base === "manifest.json") { manifestRaw = buf.toString("utf8"); continue; }
      const m = base.match(SNAP_RE);
      if (!m) { log.push({ level: "warn", what: "UNRECOGNIZED_HISTORY_FILE", path: p }); continue; }
      const [, stem, stamp, hash8, ext] = m;
      const key = `${stamp}_${hash8}`;
      if (base.startsWith("promotion_") && ext === ".json") {
        promotions.push({ stamp, hash8, key, raw: buf.toString("utf8"), record: JSON.parse(buf.toString("utf8")) });
        continue;
      }
      const origPath = `${dirPart}${stem}${ext}`;
      if (!history.has(key)) history.set(key, new Map());
      history.get(key).set(origPath, buf);
      continue;
    }
    live.set(p, buf);
  }

  /* .b64 files are transport remnants of the Apps Script era. Here they are
     only VERIFIED: each twin must decode to its binary sibling (a twin that
     lies aborts the bundle), and a lone twin has its binary recovered. They
     stay in the file set at this stage because the promotion records name
     them and reconstruction must see what history saw. Dropping the
     reproducible ones from the migrated live state is finalizeLive's job. */
  for (const p of [...live.keys()]) {
    if (!p.endsWith(".b64")) continue;
    const sibling = p.slice(0, -4);
    const decoded = Buffer.from(live.get(p).toString("utf8").replace(/\s+/g, ""), "base64");
    if (live.has(sibling) && sha256(decoded) !== sha256(live.get(sibling)))
      throw Object.assign(new Error(`TWIN_MISMATCH: ${p} does not decode to ${sibling}`), { finding: "TWIN_MISMATCH", path: p });
    if (!live.has(sibling)) {
      live.set(sibling, decoded);
      log.push({ level: "info", what: "BINARY_RECOVERED_FROM_B64", path: sibling });
    }
  }

  promotions.sort((a, b) => a.stamp.localeCompare(b.stamp) || a.hash8.localeCompare(b.hash8));
  return { live, history, promotions, manifestRaw, refusals, log };
}

/* ---------- revision reconstruction ---------- */

/* states[i] is the complete live file map immediately after promotion i.
 * states[N] is today's live set. Walking backward, the snapshot archived
 * under promotion i's key holds the files promotion i replaced, and any file
 * first written by promotion i did not exist before it. Every reconstructed
 * state is then cross-checked against the SHA-256s the original promotion
 * record wrote down at the time, and every base is cross-checked against the
 * prior state's bundle.md hash. A mismatch aborts the bundle: a record that
 * cannot be reproduced is a finding, not an inconvenience. */
export function reconstruct({ live, history, promotions, log = [] }) {
  const N = promotions.length - 1;
  if (N < 0) throw Object.assign(new Error("NO_PROMOTIONS"), { finding: "NO_PROMOTIONS" });

  /* A first surviving record whose base is not the empty hash means the
     bundle's earliest history was rotated away (the selftest bundle does
     this by design). That is truncation, not corruption: replay starts from
     the first surviving revision and the missing base is documented. */
  if (promotions[0].record.base && promotions[0].record.base !== EMPTY_SHA)
    log.push({ level: "warn", what: "HISTORY_TRUNCATED", missingBase: promotions[0].record.base });

  /* A .b64 twin never appears in a promotion record under its own name; it
     was created alongside its binary, so creation pruning follows the
     sibling. */
  const firstWrittenAt = new Map(); // record name -> promotion index
  promotions.forEach((p, i) => {
    for (const f of p.record.files || [])
      if (!firstWrittenAt.has(f.name)) firstWrittenAt.set(f.name, i);
  });
  const firstIdx = (path) =>
    firstWrittenAt.get(path) ?? firstWrittenAt.get(path.replace(/\.b64$/, ""));

  const states = new Array(N + 1);
  states[N] = new Map(live);
  for (let i = N; i >= 1; i--) {
    const prev = new Map(states[i]);
    const archived = history.get(promotions[i].key);
    if (archived) for (const [orig, buf] of archived) prev.set(orig, buf);
    for (const p of [...prev.keys()]) {
      const fi = firstIdx(p);
      if (fi !== undefined && fi >= i && !(archived && archived.has(p))) prev.delete(p);
    }
    states[i - 1] = prev;
  }

  /* Cross-check every reconstructed state against the SHA-256s the original
     promotion record wrote down. Three tolerances, each disclosed:
     - An entry marked encoding base64 hashed the transport text; re-encode
       and compare, falling back to a surviving twin's own bytes.
     - A recorded X.b64 that no longer exists is SYNTHESIZED as base64(X)
       and accepted only if it hashes to the record's value; the daemon's
       own record then proves the synthesis. Synthesized twins join the
       intermediate states so replayed history is complete; the final state
       stays disk truth.
     - A recorded file that is neither present nor derivable is logged with
       its recorded hash (the attestation survives even where bytes do not)
       and excluded. Present-but-wrong content still aborts, as does a
       broken base chain past the first surviving record. */
  for (let i = 0; i <= N; i++) {
    const rec = promotions[i].record;
    for (const f of rec.files || []) {
      let buf = states[i].get(f.name);
      let synthRejected = false;
      if (!buf && f.name.endsWith(".b64")) {
        const sib = states[i].get(f.name.slice(0, -4));
        if (sib) {
          const cand = Buffer.from(sib.toString("base64"), "utf8");
          if (!f.sha256 || sha256(cand) === f.sha256) {
            buf = cand;
            if (i < N) states[i].set(f.name, cand);
            log.push({ level: "info", what: "TWIN_SYNTHESIZED_FOR_HISTORY", key: promotions[i].key, path: f.name });
          } else synthRejected = true;
        }
      }
      if (!buf) {
        /* A sibling that re-encodes to a DIFFERENT hash means the sibling
           itself was later replaced (the daemon's member-attest pass
           re-issued timestamp tokens); the original bytes are gone either
           way, but the two situations are named apart. */
        log.push({ level: "warn",
          what: synthRejected ? "RECORDED_FILE_SUPERSEDED_ORIGINAL_LOST" : "RECORDED_FILE_UNRECOVERABLE",
          key: promotions[i].key, path: f.name, sha256: f.sha256 || null });
        continue;
      }
      if (f.sha256) {
        let got;
        if (f.encoding === "base64") {
          got = sha256(Buffer.from(buf.toString("base64"), "utf8"));
          const keptTwin = states[i].get(f.name + ".b64");
          if (got !== f.sha256 && keptTwin) got = sha256(keptTwin);
        } else got = sha256(buf);
        if (got !== f.sha256)
          throw Object.assign(new Error(`RECON_MISMATCH: ${f.name} at ${promotions[i].key} hashes ${got} (${f.encoding || "raw"}), record says ${f.sha256}`),
            { finding: "RECON_MISMATCH", key: promotions[i].key, path: f.name });
      }
    }
    const truncated = promotions[0].record.base && promotions[0].record.base !== EMPTY_SHA;
    const wantBase = i === 0 ? EMPTY_SHA : sha256(states[i - 1].get("bundle.md"));
    if (rec.base && rec.base !== wantBase && !(i === 0 && truncated))
      throw Object.assign(new Error(`BASE_MISMATCH at ${promotions[i].key}: record base ${rec.base}, reconstructed ${wantBase}`),
        { finding: "BASE_MISMATCH", key: promotions[i].key });
  }
  return states;
}

/* The migrated live state: disk truth minus reproducible transport twins.
   Each dropped twin's hash is logged as the reproducibility proof; a twin
   that decodes correctly but is not byte-reproducible is load-bearing for
   its RFC 3161 token and stays. */
export function finalizeLive(stateN, log = []) {
  const out = new Map(stateN);
  for (const p of [...out.keys()]) {
    if (!p.endsWith(".b64")) continue;
    const sib = out.get(p.slice(0, -4));
    if (!sib) continue;
    if (sib.toString("base64") === out.get(p).toString("utf8")) {
      log.push({ level: "info", what: "TWIN_REPRODUCIBLE_DROPPED", path: p, sha256: sha256(out.get(p)) });
      out.delete(p);
    } else {
      log.push({ level: "warn", what: "TWIN_KEPT_UNREPRODUCIBLE", path: p, sha256: sha256(out.get(p)) });
    }
  }
  return out;
}

/* ---------- frontmatter ---------- */

export function frontmatter(buf) {
  const text = buf.toString("utf8");
  const m = text.match(/^---\n([\s\S]*?)\n---/);
  if (!m) throw Object.assign(new Error("NO_FRONTMATTER"), { finding: "NO_FRONTMATTER" });
  const out = {}; const refs = [];
  let inRefs = false;
  for (const line of m[1].split("\n")) {
    if (/^\S/.test(line)) inRefs = false;
    const kv = line.match(/^([A-Za-z_][A-Za-z0-9_]*):\s*(.*)$/);
    if (kv) {
      const [, k, vRaw] = kv;
      let v = vRaw.trim();
      if (k === "references") { inRefs = v !== "[]" && v === ""; out[k] = []; continue; }
      if (v.startsWith('"') && v.endsWith('"')) v = v.slice(1, -1);
      if (v === "null") v = null;
      out[k] = v;
      continue;
    }
    if (inRefs) {
      const item = line.match(/^\s+-\s+(.*)$/);
      if (item) refs.push(item[1].trim().replace(/^["']|["']$/g, ""));
      const map = line.match(/^\s+(target|id):\s*(.*)$/);
      if (map && refs.length) refs[refs.length - 1] = map[2].trim().replace(/^["']|["']$/g, "");
    }
  }
  if (refs.length) out.references = refs;
  return out;
}

/* ---------- provenance verification ---------- */

/* The store's own intake register (data/provenance.json) records the binary
   SHA-256 of every attested capture. Verify each against the actual bytes,
   concatenating .pNNN split parts in order where the daemon had to split a
   large document. A capture that does not match its own provenance register
   must not migrate silently. An entry whose file is not present yet is a
   pending intake, noted rather than fatal. */
export function checkProvenance(state, log = []) {
  const provBuf = state.get("data/provenance.json");
  if (!provBuf) return log;
  let prov;
  try { prov = JSON.parse(provBuf.toString("utf8")); } catch { return log; }
  for (const doc of prov.documents || []) {
    const want = doc?.capture?.sha256;
    if (!want || doc.capture.encoding !== "binary" || !doc.file) continue;
    let bytes = state.get(doc.file);
    if (!bytes) {
      const parts = [...state.keys()].filter((k) => k.startsWith(doc.file + ".p") && /\.p\d+$/.test(k)).sort();
      if (parts.length) bytes = Buffer.concat(parts.map((k) => state.get(k)));
    }
    if (!bytes) { log.push({ level: "warn", what: "PROVENANCE_TARGET_ABSENT", path: doc.file }); continue; }
    const got = sha256(bytes);
    if (got !== want)
      throw Object.assign(new Error(`PROVENANCE_MISMATCH: ${doc.file} hashes ${got}, provenance register says ${want}`),
        { finding: "PROVENANCE_MISMATCH", path: doc.file });
    log.push({ level: "info", what: "PROVENANCE_VERIFIED", path: doc.file });
  }
  return log;
}

/* ---------- plane client ---------- */

export function planeClient({ url, token, store = "bio" }) {
  const call = async (op, { method = "GET", body, query = {}, raw = false } = {}) => {
    const u = new URL(url.replace(/\/$/, "") + "/api/" + op);
    u.searchParams.set("token", token);
    if (store !== "bio") u.searchParams.set("store", store);
    for (const [k, v] of Object.entries(query)) u.searchParams.set(k, v);
    const res = await fetch(u, { method, body });
    if (raw) return res;
    return res.json();
  };
  return {
    selftest: () => call("selftest"),
    image: (id) => call("image", { query: { id } }),
    promote: (pkg) => call("promote", { method: "POST", body: JSON.stringify(pkg) }),
    capturePut: (sha, bytes) => call("capture", { method: "PUT", body: bytes, query: { sha256: sha } }),
    captureGet: (sha) => call("capture", { query: { sha256: sha }, raw: true }),
  };
}

/* ---------- replay ---------- */

const isCapturePath = (p) => p.startsWith("snapshots/");

function fileEntries(state, captureShas) {
  const entries = [];
  for (const [path, buf] of [...state.entries()].sort((a, b) => a[0].localeCompare(b[0]))) {
    const sha = sha256(buf);
    if (isCapturePath(path) || !isUtf8(buf) || buf.length > 1024 * 1024) {
      captureShas.set(sha, buf);
      entries.push({ path, blobSha: sha, bytes: buf.length, sha256: sha });
    } else {
      entries.push({ path, text: buf.toString("utf8"), bytes: buf.length, sha256: sha });
    }
  }
  return entries;
}

export function buildPackages(bundleId, loaded, states, revisionFiles, provRegister) {
  const N = loaded.promotions.length - 1;
  const pkgs = [];
  for (let i = 0; i <= N; i++) {
    const fm = frontmatter(states[i].get("bundle.md"));
    const rec = loaded.promotions[i].record;
    pkgs.push({
      bundleId,
      snapKey: loaded.promotions[i].key,
      author: rec.author || "drive-migration",
      meta: {
        object_type: fm.object_type, group: fm.group || "believe-in-oakland",
        title: fm.title, current_state: fm.current_state, prior_state: fm.prior_state ?? null,
        created: fm.created, last_updated: fm.last_updated,
        criticality: fm.criticality ?? null, classification: fm.classification ?? null,
      },
      files: revisionFiles[i],
      refs: (fm.references || []).map((t) => ({ target: t })),
      register: i === N ? provRegister : [],
    });
  }
  return pkgs;
}

export async function migrateBundle(client, bundle, { indexEntry = null, dry = false } = {}) {
  const { bundleId } = bundle;
  const loaded = loadBundle(bundle.dir);
  const states = reconstruct(loaded);
  const N = loaded.promotions.length - 1;
  states[N] = finalizeLive(states[N], loaded.log);
  checkProvenance(states[N], loaded.log);
  const report = { bundleId, promotions: N + 1, log: loaded.log, captures: 0, ok: false };

  /* Provenance capture: the Drive era, verbatim, refusals included. */
  const provenance = {
    bundleId, migrated: new Date().toISOString(), source: "google-drive/CivicOS",
    indexEntry, manifest: loaded.manifestRaw ? JSON.parse(loaded.manifestRaw) : null,
    promotions: loaded.promotions.map((p) => ({ key: p.key, record: p.record })),
    refusals: [...loaded.refusals.entries()].map(([key, r]) => ({ key, ...r })),
    notes: loaded.log,
  };
  const provBuf = Buffer.from(JSON.stringify(provenance, null, 1), "utf8");
  const provSha = sha256(provBuf);

  const captureShas = new Map();
  const revisionFiles = states.map((s) => fileEntries(s, captureShas));
  captureShas.set(provSha, provBuf);

  if (dry) { report.ok = true; report.dry = true; report.captures = captureShas.size; return report; }

  /* Resume: a migration over a network can be interrupted, and a re-run must
     converge rather than collide. If the bundle already exists on the plane,
     its live bundle.md hash is located in this bundle's revision chain: at
     the final revision the bundle is already migrated; at an earlier one the
     replay continues from the next revision; at none of them the plane holds
     something this mirror did not produce, which is a hard stop. */
  const provRegister = [
    ...revisionFiles[N].filter((f) => f.blobSha).map((f) => ({ path: f.path, sha256: f.sha256, bytes: f.bytes, encoding: "binary" })),
    { path: "migration/drive-provenance.json", sha256: provSha, bytes: provBuf.length, encoding: "utf8" },
  ];
  const pkgs = buildPackages(bundleId, loaded, states, revisionFiles, provRegister);
  const revSha = (i) => revisionFiles[i].find((f) => f.path === "bundle.md").sha256;

  let startAt = 0;
  let base = null;
  const existing = (await client.image(bundleId)).result;
  if (existing) {
    const liveOnPlane = existing["bundle.md"];
    const planeSha = typeof liveOnPlane === "string" ? sha256(Buffer.from(liveOnPlane, "utf8")) : liveOnPlane?.sha256;
    const at = [...Array(N + 1).keys()].find((i) => revSha(i) === planeSha);
    if (at === undefined)
      throw Object.assign(new Error(`CONFLICT: ${bundleId} exists on the plane with live sha ${planeSha}, which matches no revision of this mirror`),
        { finding: "CONFLICT", planeSha });
    if (at === N) { report.ok = true; report.alreadyMigrated = true; report.finalSha = planeSha; return report; }
    startAt = at + 1;
    base = planeSha;
    report.resumedFrom = startAt;
  }

  for (const [sha, buf] of captureShas) {
    const r = await client.capturePut(sha, buf);
    if (!r.ok) throw Object.assign(new Error(`CAPTURE_PUT_FAILED ${sha}: ${JSON.stringify(r)}`), { finding: "CAPTURE_PUT_FAILED", sha });
    report.captures++;
  }

  for (let i = startAt; i <= N; i++) {
    const r = await client.promote({ ...pkgs[i], base });
    if (!r.result?.ok)
      throw Object.assign(new Error(`PROMOTE_FAILED ${bundleId} rev ${i}: ${JSON.stringify(r.result || r)}`),
        { finding: "PROMOTE_FAILED", rev: i });
    base = r.result.bundleSha;
  }
  report.finalSha = base;
  report.ok = true;
  return report;
}

/* ---------- verification ---------- */

export async function verifyBundle(client, bundle, { indexEntry = null } = {}) {
  const loaded = loadBundle(bundle.dir);
  const states = reconstruct(loaded);
  const N = loaded.promotions.length - 1;
  states[N] = finalizeLive(states[N]);
  try { checkProvenance(states[N]); } catch (e) { return { bundleId: bundle.bundleId, ok: false, findings: [e.message] }; }
  const findings = [];
  const img = (await client.image(bundle.bundleId)).result;
  if (!img) return { bundleId: bundle.bundleId, ok: false, findings: ["NO_IMAGE"] };

  for (const [path, buf] of states[N]) {
    const got = img[path];
    const want = sha256(buf);
    if (got === undefined) findings.push(`LIVE_MISSING ${path}`);
    else if (typeof got === "string") { if (sha256(Buffer.from(got, "utf8")) !== want) findings.push(`LIVE_TEXT_DIFFERS ${path}`); }
    else if (got.sha256 !== want && got.blobSha !== want) findings.push(`LIVE_BLOB_DIFFERS ${path}`);
  }
  for (const p of Object.keys(img))
    if (!p.startsWith("_history/") && !states[N].has(p)) findings.push(`LIVE_EXTRA ${p}`);

  for (let i = 1; i <= N; i++) {
    const key = loaded.promotions[i].key;
    for (const [path, ] of states[i - 1]) {
      /* Canonical snapshot path, matching the plane's projection and the
         check catalog: the snapshot key is a filename suffix. */
      const cut = path.lastIndexOf("/");
      const dir = cut === -1 ? "" : path.slice(0, cut + 1);
      const nm = cut === -1 ? path : path.slice(cut + 1);
      const dot = nm.lastIndexOf(".");
      const hp = dot === -1
        ? `_history/${dir}${nm}_${key}`
        : `_history/${dir}${nm.slice(0, dot)}_${key}${nm.slice(dot)}`;
      if (img[hp] === undefined) findings.push(`HISTORY_MISSING ${hp}`);
    }
  }

  if (indexEntry?.sha256) {
    const liveSha = sha256(states[N].get("bundle.md"));
    if (liveSha !== indexEntry.sha256) findings.push(`INDEX_SHA_DIFFERS local=${liveSha} index=${indexEntry.sha256}`);
    const imgLive = img["bundle.md"];
    const imgSha = typeof imgLive === "string" ? sha256(Buffer.from(imgLive, "utf8")) : imgLive?.sha256;
    if (imgSha !== indexEntry.sha256) findings.push(`INDEX_SHA_DIFFERS_ON_PLANE plane=${imgSha} index=${indexEntry.sha256}`);
  }

  for (const [path, buf] of states[N]) {
    if (!isCapturePath(path)) continue;
    const res = await client.captureGet(sha256(buf));
    if (res.status !== 200) { findings.push(`CAPTURE_UNREADABLE ${path}`); continue; }
    const back = Buffer.from(await res.arrayBuffer());
    if (sha256(back) !== sha256(buf)) findings.push(`CAPTURE_BYTES_DIFFER ${path}`);
  }

  return { bundleId: bundle.bundleId, ok: findings.length === 0, findings };
}

/* ---------- CLI ---------- */

function args(argv) {
  const a = {};
  for (let i = 2; i < argv.length; i++) {
    if (argv[i].startsWith("--")) {
      const k = argv[i].slice(2);
      const v = argv[i + 1] && !argv[i + 1].startsWith("--") ? argv[++i] : true;
      a[k] = v;
    }
  }
  return a;
}

async function main() {
  const a = args(process.argv);
  if (!a.root || !a.url || !a.token) {
    console.error("usage: node migrate/migrate.mjs --root <CivicOS dir> --url <instance> --token <token> [--store bio] [--only <bundleId>] [--index <index.json>] [--dry] [--verify-only]");
    process.exit(2);
  }
  const client = planeClient({ url: a.url, token: a.token, store: a.store || "bio" });
  const self = await client.selftest();
  if (!self.ok) { console.error("selftest failed on the target instance:", JSON.stringify(self)); process.exit(1); }
  console.log(`target: ${self.service} ${self.version}, store answers, tokenClass ${self.tokenClass}`);

  const index = a.index ? JSON.parse(readFileSync(a.index, "utf8")) : null;
  let bundles = discoverBundles(a.root);
  if (a.only) bundles = bundles.filter((b) => b.bundleId === a.only);
  if (!bundles.length) { console.error("no bundles selected"); process.exit(1); }
  console.log(`${bundles.length} bundle(s) selected`);

  let failed = 0;
  for (const b of bundles) {
    const indexEntry = index?.bundles?.[b.bundleId] || null;
    try {
      if (!a["verify-only"]) {
        const r = await migrateBundle(client, b, { indexEntry, dry: !!a.dry });
        const tag = r.dry ? "DRY MIGRATED" : r.alreadyMigrated ? "ALREADY MIGRATED" : r.resumedFrom ? `RESUMED at rev ${r.resumedFrom},` : "MIGRATED";
        console.log(`  ${tag} ${b.bundleId}: ${r.promotions} promotions, ${r.captures} captures${r.finalSha ? ", live " + r.finalSha.slice(0, 12) : ""}`);
        for (const l of r.log) console.log(`    note: ${l.what} ${l.path || ""}`);
      }
      if (!a.dry) {
        const v = await verifyBundle(client, b, { indexEntry });
        if (v.ok) console.log(`  VERIFIED ${b.bundleId}`);
        else { failed++; console.log(`  FAILED ${b.bundleId}:`); v.findings.forEach((f) => console.log(`    ${f}`)); }
      }
    } catch (e) {
      failed++;
      console.log(`  ABORTED ${b.bundleId}: ${e.message}`);
    }
  }
  console.log(failed ? `\n${failed} bundle(s) failed` : "\nall selected bundles migrated and verified clean");
  process.exit(failed ? 1 : 0);
}

if (import.meta.url === `file://${process.argv[1]}`) await main();
