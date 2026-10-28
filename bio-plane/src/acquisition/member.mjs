/* acquisition — T53, N824: ONE JOB FOR A MEMBER OF A CONTAINER (R136; C9 (2), C12 (d); `capture` R117, `provenance` R59, R84).
 *
 * A container is a file that holds files: a ZIP (opened by R38), or a message that carries attachments. Each member is filed as its own capture, and
 * the same function serves both: `fileMember` cuts member `index` out of a HELD container and files it. What differs by kind is only the receipt and the
 * document written (the archive's: `via: "unpacked"`, `#zip:<index>`; the message's: `via: "email-attachment"`, locator `email:<messageSha>!<index>`);
 * the outcome is always one of R41's states: `filed`, `already_held` (kept as a second sighting) or `not_filed` (with its code, its row, and `limit` for a
 * limit). The job's row is `memberRow(...)`, keyed by the capture session `<containerSha>!<index>`; a second registration for the same key leaves one row.
 * `fileMember` is idempotent: a member with an outcome is answered from it and never cut again, so a row run after R38 has already settled its entry (R38
 * registers the row as it records the entry's outcome) finishes at once.
 *
 * Every refusal is an answer `{ok: false, reason, ...}`, never a throw. A store failure that may pass leaves the member with no outcome (`WAITING`). */
import { attachmentBytes, readMessage } from "../mail-reader/index.mjs";
import { detectFormat, formatNameFor } from "../formats.mjs";
import { kindTable } from "../formats.mjs";
import { isMachineIdentity } from "../record-grammar/index.mjs";
import { EARNED_CAPTURE_CEILING } from "../record-grammar/index.mjs";
import { boundOf } from "../read-bounds.mjs";
import { localize } from "../setup-words/index.mjs";
import { partsWriter, ledgerOf, unpack, rowed } from "./unpack.mjs";
import { profileOf, profileView, refusedFacts, REFUSE_HEAD_BYTES, readRange } from "./index.mjs";
import { ARCHIVE_CHECKS, firstHopWho } from "./checks.mjs";

export const MEMBER_KIND = "member";
export const CONTAINER_KINDS = Object.freeze(["archive", "message"]);
/* R136, R117: a member's session key is the container's whole digest, `!`, the member's index (at most 200 characters) */
const SHA = /^[0-9a-f]{64}$/;
const MESSAGE_VIA = "email-attachment";
const MESSAGE_METHOD = "emailed-attachment";

const isObj = (x) => x !== null && typeof x === "object" && !Array.isArray(x);
const refuse = (reason, detail, extra = {}) => ({ ok: false, reason, ...extra, detail });
const second = (ms) => new Date(ms).toISOString().replace(/\.\d+Z$/, "Z");
const nowOf = (store) => { const h = store && store.env ? store.env.BIO_NOW_MS : undefined; return h !== undefined && h !== null && h !== "" && Number.isFinite(Number(h)) ? Number(h) : Date.now(); };
const cleanName = (v) => (typeof v === "string" && v.trim() ? v.trim().slice(0, 300) : null);

/** R136: the job row of one member of a held container: `{kind: "member", session, detail}`. `null` when the container is not a digest or the index is not a
 *  whole number. Pure; never throws. */
export function memberRow({ container, container_kind, index, name_stated = null, type_stated = null, project = null, within = 0 } = {}) {
  try {
    if (typeof container !== "string" || !SHA.test(container) || !Number.isSafeInteger(index) || index < 0 || !CONTAINER_KINDS.includes(container_kind)) return null;
    const session = `${container}!${index}`;
    if (session.length > 200) return null;
    return { kind: MEMBER_KIND, session, detail: { container, container_kind, index, name_stated: cleanName(name_stated), type_stated: cleanName(type_stated),
                                                    project: typeof project === "string" ? project.slice(0, 200) : null, within: Number.isSafeInteger(within) && within > 0 ? within : 0 } };
  } catch { return null; }
}

/** The registrar a caller hands in (R116's: the store's `registerJob`, else the call's). */
const registrarOf = (store, given) => (typeof given === "function" ? given : store && typeof store.registerJob === "function" ? (e) => store.registerJob(e) : null);

/* ---------------------------------------------------------------- reading a held container

   A message is held under its whole digest, whole or in parts (R113): read through the evidence store, whole when it is held whole. */
async function heldBytes(store, sha) {
  const ev = store && store.core && typeof store.core.evidenceStore === "function" ? store.core.evidenceStore() : null;
  if (!ev) return { fail: refuse("EVIDENCE_STORAGE_NOT_CONFIGURED", localize("acquisition.member.no_storage", "your team's Civicsmith has no evidence storage configured, so nothing was cut")) };
  let o = null;
  try { o = await ev.get(sha); } catch (e) { return { fail: { ok: false, reason: "WAITING", detail: String(e && e.message || e).slice(0, 120) } }; }
  if (o) return { ev, bytes: new Uint8Array(await o.arrayBuffer()) };
  return { ev, bytes: null };
}

/* A message held in parts only (a capture past what memory keeps whole): a range source `{size, readRange}` over its parts, read through the one reader of a
   capture's bytes by its whole digest (R113). `null` when the register names no parts. */
async function messageInput(store, sha) {
  const got = await heldBytes(store, sha);
  if (got.fail) return got;
  if (got.bytes) return { ev: got.ev, input: got.bytes };
  const p = store.provenance;
  let parts = null;
  try { parts = p && typeof p.partsOf === "function" ? await p.partsOf(sha) : null; } catch { parts = null; }
  const list = parts && Array.isArray(parts.parts) ? parts.parts : Array.isArray(parts) ? parts : null;
  const size = list ? list.reduce((n, x) => n + Number(x.bytes ?? x.size ?? 0), 0) : 0;
  if (!list || !list.length || !Number.isSafeInteger(size) || size <= 0) return { ev: got.ev, input: null };
  return { ev: got.ev, input: { size, readRange: async (offset, length) => {
    const r = await readRange(store, sha, offset, length);
    if (r instanceof Uint8Array) return r;
    throw new Error(String(r && r.reason || "STORE_FAILED"));
  } } };
}

/* the bound a kind states for one file's size (`format-registry` R42's table, from `READ_BOUNDS`), or null: CC6/N1267 */
function kindBytesBound(format) {
  try {
    const row = kindTable().find((r) => r.key === format);
    const f = row && row.limit && row.limit.figures.find((x) => x.what === "bytes");
    return f && Number.isFinite(f.bound) ? { bound: f.bound, key: f.key } : null;
  } catch { return null; }
}

/* ---------------------------------------------------------------- the message arm */

async function fileFromMessage(store, a, opts) {
  const { container, index } = a;
  const p = store.provenance;
  const address = `email:${container}!${index}`;
  const got = await messageInput(store, container);
  if (got.fail) return got.fail;
  if (!got.input) return refuse("CONTAINER_NOT_HELD", localize("acquisition.member.container_not_held", "the message is not held, so nothing was cut"), { container });
  const route = a.route === "address" ? "address" : "upload";
  const cut = await attachmentBytes(got.input, index, { route });
  /* DEC-49 REGION is-member-cut */
  const settleRefusal = (code, extra = {}) => ({ ok: true, outcome: "not_filed", container, index, address, ...rowed(code, extra) });
  if (!cut.ok) {
    if (cut.reason === "MAIL_ATTACHMENT_NO_SUCH") return refuse("NO_SUCH_MEMBER", localize("acquisition.member.no_such_member", "the message has no attachment {index}", { index: String(index) }), { container, index });
    return settleRefusal("MEMBER_NOT_CUT", { detail: String(cut.reason || cut.code || "MAIL_MALFORMED").slice(0, 80) });
  }
  /* END DEC-49 REGION is-member-cut */
  /* N1267, CC6: a member over its kind's bound is listed with its size and the bound and not filed; the message itself is filed already */
  const head = cut.bytes.subarray(0, REFUSE_HEAD_BYTES);
  const found = detectFormat(head, cut.type_stated, cut.name_stated);
  if (found && found.format === "refused") { const f = refusedFacts(found); return settleRefusal("FILE_TYPE_REFUSED", { detail: f.detail, kind: f.kind, kind_text: f.kind_text, reason_text: f.reason_text }); }
  const limit = found ? kindBytesBound(found.format) : null;
  if (limit && cut.size > limit.bound)
    return settleRefusal("MEMBER_MAX", { limit: limit.bound, size: cut.size, key: limit.key, detail: localize("acquisition.member.over_bound", "the attachment is larger than the most one file of its kind may be; it is listed and not filed") });
  /* stored in parts, each under its own digest, as R10 stores a capture */
  const w = partsWriter(got.ev);
  let stored;
  try { await w.write(cut.bytes); stored = await w.finish(); } catch (e) { return e && e.storeFailure ? { ok: false, reason: "WAITING", detail: String(e.message || e).slice(0, 120) } : refuse("MEMBER_UNREADABLE", String(e && e.message || e).slice(0, 120)); }
  const retrieved = second(nowOf(store));
  let before = false;
  try { const h = p && typeof p.registerHolds === "function" ? p.registerHolds({ sha: stored.sha256 }) : null; before = !!(h && (h.registered === true || h.acquired === true)); } catch { before = false; }
  const receipt = { address, addressNorm: address, captureSha: stored.sha256, retrieved, via: MESSAGE_VIA, retrievalLocator: address };
  try { await p?.recordReceipt?.(receipt); } catch { /* an unwritten receipt leaves the grade unanswered, never the cut undone */ }
  if (before) return { ok: true, outcome: "already_held", container, index, address, sha256: stored.sha256 };
  /* the document (capture R117): graded as its message by provenance R84 once the receipt is read, `container` as R117 states it */
  const multipart = stored.parts.length > 1;
  const ct = cut.type_stated && /^[a-z]+\/[a-z0-9.+-]+$/i.test(cut.type_stated) ? cut.type_stated.toLowerCase() : null;
  const profile = await profileOf({ ev: got.ev, sha: stored.sha256, ct, total: stored.bytes, multipart, headers: {}, locator: address, view: profileView(store.core), retrieved,
                                    origin: "fetch", name: cleanName(cut.name_stated), declaredType: ct, parts: stored.parts });
  let g = null;
  try { g = p && typeof p.captureGrade === "function" ? await p.captureGrade(stored.sha256) : null; } catch { g = null; }
  const isMember = (a.cls === "member" || a.member === true) && typeof a.by === "string" && a.by && !isMachineIdentity(a.by);
  const env = store.env || {};
  const name = `msg-${container}-${index}`;
  const document = {
    file: `snapshots/${name}`, locator: address, retrieved, profile,
    authority_state: "undetermined",
    authority_basis: localize("acquisition.member.authority_basis", "an attachment cut out of a message, {retrieved}", { retrieved }),
    provenance_chain: [{
      who: firstHopWho(env.INSTANCE_NAME, env.VERSION),
      asserts: localize("acquisition.member.message_first_hop", "these bytes are attachment {index} ({name}, the message's own claim) of the message {sha} held by your team's Civicsmith, cut out at {retrieved}", { index: String(index), name: String(cut.name_stated ?? ""), sha: String(container), retrieved }),
      evidence: localize("acquisition.member.message_evidence", "the message's capture {sha}; the attachment cut out of it unambiguously", { sha: String(container) }),
      bound: false, via: MESSAGE_VIA, message_sha256: container,
    }],
    capture: {
      method: MESSAGE_METHOD,
      ...(g && g.grade ? { grade: g.grade } : (() => { const basis = g && g.basis; return basis ? { grade_basis: basis } : {}; })()),
      actor_class: isMember ? "member" : (a.cls === "probe" ? "session" : "daemon"), actor: isMember ? a.by : null,
      sha256: stored.sha256, encoding: "binary", bytes: stored.bytes,
      ...(ct ? { content_type: ct } : {}),
    },
    container: { message_sha256: container, index, name_stated: cut.name_stated ?? null, type_stated: cut.type_stated ?? null, size: cut.size },
    ...(multipart ? { parts: stored.parts.map((x, i) => ({ file: `snapshots/${name}.part${String(i).padStart(3, "0")}`, sha256: x.sha256, bytes: x.bytes })) } : {}),
    origin: { kind: "named_request" },
    attestation_attempts: [],
  };
  void EARNED_CAPTURE_CEILING; void formatNameFor; void boundOf;
  return { ok: true, outcome: "filed", container, index, address, sha256: stored.sha256, document, format: profile && profile.format ? profile.format.format : null };
}

/* ---------------------------------------------------------------- the archive arm */

function archiveOutcome(r, index) {
  const doc = (r.documents || []).find((d) => d && d.container && d.container.index === index);
  if (doc) return { ok: true, outcome: "filed", index, sha256: doc.capture.sha256, document: doc, format: doc.profile && doc.profile.format ? doc.profile.format.format : null };
  const held = (r.already_held || []).find((x) => x.index === index);
  if (held) return { ok: true, outcome: "already_held", index, sha256: held.sha256 };
  const nf = (r.not_filed || []).find((x) => x.index === index);
  if (nf) { const { index: _i, ...rest } = nf; return { ok: true, outcome: "not_filed", index, ...rest }; }
  return null;
}

function archiveRecorded(row) {
  if (row.state === "filed") return { ok: true, outcome: "filed", index: row.idx, sha256: row.sha256, recorded: true };
  if (row.state === "already_held") return { ok: true, outcome: "already_held", index: row.idx, sha256: row.sha256, recorded: true };
  if (row.state === "not_filed") return { ok: true, outcome: "not_filed", index: row.idx, ...rowed(row.code ?? "ARCHIVE_UNREADABLE", row.detail ? { detail: row.detail } : {}), recorded: true };
  if (row.state === "folder" || row.state === "link") return { ok: true, outcome: "not_filed", index: row.idx, code: null, state: row.state, recorded: true };
  return null;
}

async function fileFromArchive(store, a) {
  const inst = ledgerOf(store);
  const row = inst ? inst.entryRows(a.container).find((r) => r.idx === a.index) : null;
  const done = row ? archiveRecorded(row) : null;
  if (done) return { ...done, container: a.container };
  const r = await unpack(store, { archiveSha: a.container, by: a.by, cls: a.cls, member: a.member }, { only: a.index, ...(a.registerJob ? { registerJob: a.registerJob } : {}) });
  if (!r.ok) return r;
  const out = archiveOutcome(r, a.index);
  if (out) return { ...out, container: a.container };
  /* the entry was reached by no one: it waits for a budget or a limit */
  return { ok: false, reason: "WAITING", container: a.container, index: a.index, detail: localize("acquisition.member.waiting", "the member is waiting for the next run") };
}

/**
 * R136: `fileMember(store, {container, container_kind, index, by, cls, member, registerJob, project, within, route})` cuts member `index` out of the held container
 * `container` (its whole digest) and files it. `container_kind` is `archive` (a ZIP, R38's cut) or `message` (an attachment, `mail-reader`'s cut; an attachment that is
 * itself a message, or a ZIP, is a container and registers its own rows when it is filed). Answers `{ok: true, outcome: "filed"|"already_held"|"not_filed", ...}`
 * (`filed` carries the document for the caller to promote; `not_filed` carries `code`, `check`, `translation` and `limit` for a limit), or a refusal
 * (`CONTAINER_NOT_HELD`, `NO_SUCH_MEMBER`, `BAD_MEMBER`), or `{ok: false, reason: "WAITING"}` when a store failure may pass. Each member filed registers its own `reading` row
 * and, when it is a container, its own `member` (or `unpack`) rows, through the registrar.
 */
export async function fileMember(store, args = {}, opts = {}) {
  try {
    const a = isObj(args) ? args : {};
    if (typeof a.container !== "string" || !SHA.test(a.container) || !Number.isSafeInteger(a.index) || a.index < 0 || !CONTAINER_KINDS.includes(a.container_kind))
      return refuse("BAD_MEMBER", localize("acquisition.member.bad_member", "a member is named by its container's digest, its kind (archive or message) and its index; nothing was cut"));
    const register = registrarOf(store, a.registerJob ?? (opts && opts.registerJob));
    const out = a.container_kind === "archive" ? await fileFromArchive(store, { ...a, registerJob: register }) : await fileFromMessage(store, a, opts);
    if (!out.ok || out.outcome !== "filed" || !register) return out;
    /* the member's own reading, and, when it is a container, its own rows (CC5's depth counts through the chain) */
    const rows = [];
    rows.push({ kind: "reading", sha: out.sha256 });
    if (out.format === "zip") rows.push({ kind: "unpack", sha: out.sha256 });
    if (out.format === "eml" || out.format === "msg") {
      const within = (Number.isSafeInteger(a.within) ? a.within : 0) + 1;
      let nest = 3;
      try { nest = boundOf("mail", "nest_max"); } catch { nest = 3; }
      if (within < nest) {
        const bytes = await (async () => { try { const o = await store.core.evidenceStore().get(out.sha256); return o ? new Uint8Array(await o.arrayBuffer()) : null; } catch { return null; } })();
        const msg = bytes ? await readMessage(bytes, { route: "upload", within }) : null;
        if (msg && msg.ok) for (const att of msg.attachments)
          rows.push(memberRow({ container: out.sha256, container_kind: "message", index: att.index, name_stated: att.name_stated, type_stated: att.type_stated, project: a.project, within }));
      }
    }
    let registered = 0, refused = 0;
    for (const row of rows) { if (!row) continue; let r = null; try { r = register(row); } catch { r = null; } if (r && r.ok === true) registered++; else refused++; }
    return { ...out, rows: { registered, not_registered: refused } };
  } catch (e) {
    return refuse("MEMBER_UNREADABLE", localize("acquisition.member.unreadable", "the member could not be filed ({why})", { why: String(e && e.message || e).slice(0, 120) }));
  }
}

void ARCHIVE_CHECKS;
