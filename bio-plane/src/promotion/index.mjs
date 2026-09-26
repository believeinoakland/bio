/* promotion — the one write path by which a bundle enters or changes in the record (requirements:
 * `build/requirements/promotion.md`). It holds the compare-and-swap, keeps history append-only, takes the document's
 * own bytes as the record's word on what it is, and refuses a whole promotion when any rule fails: the bundle advances
 * as one transaction (`record-core.transact`) or nothing is written. Later modules join a promotion by registering a
 * check and a projection (R39) and the facts it needs (R40); until a module is extracted, `legacy-store` registers its
 * share. It also runs the gate (`../gate.mjs`) and reopens a set-down inquiry.
 *
 * REACHED as `promotionOf(host, deps)`: one instance per host (the Durable Object's `ctx`), created on the first call
 * with `deps` and returned to every later caller. `deps`:
 *   record      record-core's services: transact, commit, head, manifestEntry, livePaths, readFile, mintOpaqueId,
 *               bundleInfo, listByType (head, manifestEntry, livePaths and commit's projection inputs: job record Q2).
 *   membership  sight, isProjectOwner, projectAuthority, projectCreated, visibilitySettingRefusal, projectVisibility.
 *   now         the module's clock, an ISO instant (default: the wall clock).
 *   order       the modules' total order (ids), which registered steps run in; unknown modules run last.
 */

import { parseFrontmatter, normalizeType, vocabFor, STATES, MECHANICAL_FIELD_SETS, createSha256,
         deriveInquiryTitle, inquiryQuestionOf, isMachineIdentity, projectNameKey, withProducingGroup,
         ACT_SHAPE_CHECKS, PROMOTED_TYPE_CHECKS, PROJECT_ID_CHECKS, PROJECT_CREATION_VISIBILITY_CHECKS,
         PROJECT_VISIBILITY_CHECKS, BIAS_CHECKS, INSTANCE_GROUP_CHECKS } from "../../checks/bio-checks.mjs";
import { PROMOTION_CHECKS } from "./checks.mjs";
import { appendStateHistory, setScalar, appendSessionLog } from "./text.mjs";

export { runGate, runCaseGate, CATALOG_VERSION, GATE_VERSION } from "../gate.mjs";
export { PROMOTION_CHECKS } from "./checks.mjs";

/** The empty-string SHA-256: the base a creation's manifest entry records (R3). */
export const EMPTY_STRING_SHA = "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855";
/** The instance's inline bound (R6): a file held as text is at most 1 MiB of UTF-8. */
export const INLINE_MAX = 1024 * 1024;
/** The dispositions an inquiry is reopened from (R24). */
export const REOPENABLE_FROM = ["deferred", "dismissed"];
/** The edge-reason bound a reopening's reason is held to (R22). */
export const EDGE_REASON_MAX = 160;

const te = new TextEncoder();
const hexOf = (text) => createSha256().update(te.encode(text)).hex();
const isObj = (v) => !!v && typeof v === "object" && !Array.isArray(v);
const has = (o, k) => isObj(o) && Object.prototype.hasOwnProperty.call(o, k);
const textStated = (v) => (typeof v === "string" && v.trim() !== "" ? v : null);
const typeStated = (v) => (typeof v === "string" && v.trim() !== "" ? normalizeType(v) : null);
const sameText = (a, b) => String(a).trim().replace(/\s+/g, " ") === String(b).trim().replace(/\s+/g, " ");
const sameInstant = (a, b) => {
  const x = Date.parse(String(a).trim()), y = Date.parse(String(b).trim());
  return Number.isFinite(x) && Number.isFinite(y) ? x === y : String(a).trim() === String(b).trim();
};
const cut = (v, n) => String(v).slice(0, n);
const rand = (n) => [...crypto.getRandomValues(new Uint8Array(n))].map((b) => b.toString(16).padStart(2, "0")).join("");

/* A refusal carrying a catalogue (or promotion) row: its reason, code, check id and translation. */
const rowRefusal = (row, code, detail, extra) =>
  ({ ok: false, reason: code, code, check: row.check, translation: row.translation, detail, ...(extra || {}) });

/* An inline file's digest (its UTF-8 text) or a blob's content address; null for neither. */
function fileDigestOf(f) {
  if (f && typeof f.text === "string") return hexOf(f.text);
  if (f && typeof f.blobSha === "string" && f.blobSha) return f.blobSha.toLowerCase();
  return null;
}
/* An inline file's size, the UTF-8 byte length of its text; null for a blob. */
function inlineBytesOf(f) {
  return f && typeof f.text === "string" ? te.encode(f.text).length : null;
}
/* R5: every stored digest is of the stored bytes; a supplied digest that differs is named. */
function digestFiles(files) {
  const disagree = [];
  const out = files.map((f) => {
    const computed = fileDigestOf(f);
    if (computed === null) return f;
    const supplied = f.sha256;
    if (supplied === undefined || supplied === null) return { ...f, sha256: computed };
    if (typeof supplied !== "string" || supplied.toLowerCase() !== computed) {
      disagree.push({ path: f.path ?? null, kind: typeof f.text === "string" ? "inline" : "blob",
                      supplied: typeof supplied === "string" ? supplied : String(supplied), computed });
      return f;
    }
    return supplied === computed ? f : { ...f, sha256: computed };
  });
  return { files: out, disagree };
}
/* R4: is this the promotion the held manifest entry records? Every file by name and digest (as a set), the base,
   kind, author, writer and operation. A digest either side does not state makes the answer no. */
function samePromotion(entry, want) {
  const norm = (v) => (v === undefined || v === null ? null : String(v));
  if (norm(entry.base) !== norm(want.base) || norm(entry.kind) !== norm(want.kind)
      || norm(entry.author) !== norm(want.author) || norm(entry.writer) !== norm(want.writer)
      || norm(entry.operation) !== norm(want.operation)) return false;
  const held = Array.isArray(entry.files) ? entry.files.filter(isObj) : [];
  if (!held.length || held.length !== want.files.length) return false;
  const digestOf = (v) => (typeof v === "string" && v !== "" ? v.toLowerCase() : null);
  const byName = new Map();
  for (const f of held) {
    const d = digestOf(f.sha256);
    if (typeof f.name !== "string" || d === null || byName.has(f.name)) return false;
    byName.set(f.name, d);
  }
  for (const f of want.files) {
    const d = f ? digestOf(f.sha256) : null;
    if (!f || typeof f.path !== "string" || d === null || byName.get(f.path) !== d) return false;
    byName.delete(f.path);
  }
  return byName.size === 0;
}
/* R13: the producing group written into a created document's bytes, rehashed from what is written. */
function stampGroup(files, slug) {
  return files.map((f) => {
    if (!f || f.path !== "bundle.md" || typeof f.text !== "string") return f;
    const text = withProducingGroup(f.text, slug);
    if (text === f.text) return f;
    return { ...f, text, bytes: te.encode(text).length, sha256: hexOf(text) };
  });
}

const ABSENT = () => ({ ok: false, reason: "ABSENT", detail: "update attempted against a bundle that does not exist" });

class Promotion {
  #record; #membership; #now; #order;
  #steps = [];            // {module, check, project, seq}
  #facts = new Map();     // name -> {module, fn}

  constructor({ record, membership, now, order } = {}) {
    this.#record = record;
    this.#membership = membership;
    this.#now = typeof now === "function" ? now : () => new Date().toISOString();
    this.#order = Array.isArray(order) ? order : [];
  }

  /* ---------------------------------------------------------------- R39, R40: the registry */

  registerStep(module, { check = null, project = null } = {}) {
    if (typeof module !== "string" || !module)
      return { ok: false, reason: "STEP_MODULE_UNNAMED", detail: "a step names the module that registers it" };
    if (this.#steps.some((s) => s.module === module))
      return { ok: false, reason: "STEP_DECLARED", module, detail: `${module} has already registered its step` };
    this.#steps.push({ module, check: typeof check === "function" ? check : null,
                       project: typeof project === "function" ? project : null, seq: this.#steps.length });
    const rank = (m) => { const i = this.#order.indexOf(m); return i === -1 ? Infinity : i; };
    this.#steps.sort((a, b) => (rank(a.module) - rank(b.module)) || (a.seq - b.seq));
    return { ok: true, module };
  }

  registerFact(name, module, fn) {
    if (typeof name !== "string" || !name || typeof module !== "string" || !module || typeof fn !== "function")
      return { ok: false, reason: "FACT_MALFORMED", detail: "a fact names itself, its module and its function" };
    const held = this.#facts.get(name);
    if (held) return { ok: false, reason: "STEP_DECLARED", fact: name, module: held.module,
                       detail: `the fact '${name}' is already provided by ${held.module}` };
    this.#facts.set(name, { module, fn });
    return { ok: true, fact: name, module };
  }

  /* A fact's value, or FACT_UNAVAILABLE naming it: never read as false (R40). */
  #fact(name, ...args) {
    const held = this.#facts.get(name);
    if (!held) return { unavailable: { ok: false, reason: "FACT_UNAVAILABLE", fact: name,
                                       detail: `no module provides the fact '${name}' this act needs, so the act is `
                                             + `refused rather than answered as if it were false. Nothing was written.` } };
    return { value: held.fn(...args) };
  }

  /* ---------------------------------------------------------------- promote */

  promote(pkg) {
    try { return this.#promote(pkg); }
    catch (e) {
      /* R20: never throws for any JSON package. The transaction has already rolled back when this is reached. */
      return { ok: false, reason: "PROMOTE_FAILED",
               detail: `the promotion could not complete and nothing was written: ${cut(e && e.message ? e.message : e, 200)}` };
    }
  }

  #promote(pkg) {
    if (!pkg || typeof pkg !== "object" || Array.isArray(pkg))
      return { ok: false, reason: "NO_BODY", detail: "promote requires a POSTed package" };
    const record = this.#record, membership = this.#membership;
    const { base = null, meta, snapKey, author } = pkg;
    const replay = !!pkg.replay;
    let { bundleId, files } = pkg;

    /* R8: a mechanical writer names an operation the catalogue declares a field set for. */
    const writer = pkg.writer === "mechanical" ? "mechanical" : null;
    const operation = writer ? pkg.operation : null;
    if (writer && !(typeof operation === "string" && Object.prototype.hasOwnProperty.call(MECHANICAL_FIELD_SETS, operation)))
      return { ok: false, reason: "UNDECLARED_OPERATION",
               detail: `a mechanical promotion names one of: ${Object.keys(MECHANICAL_FIELD_SETS).join(", ")}`,
               got: operation ?? null };
    /* R7: references and basis legs are read from bundle.md, never the payload. */
    if (Array.isArray(pkg.refs) && pkg.refs.length)
      return { ok: false, reason: "REFS_IN_PAYLOAD",
               detail: "references are read from bundle.md frontmatter, not from the promote payload; remove the refs field" };
    if (Array.isArray(pkg.basis) && pkg.basis.length)
      return { ok: false, reason: "BASIS_IN_PAYLOAD",
               detail: "basis legs are read from bundle.md frontmatter, not from the promote payload; remove the basis field" };

    /* R9, R11, R12: the document is the record's word on itself; the envelope only where it states nothing. */
    const sentMd = Array.isArray(files) ? files.find((f) => isObj(f) && f.path === "bundle.md") : null;
    const sentFm0 = sentMd && typeof sentMd.text === "string" ? parseFrontmatter(sentMd.text).data : null;
    const sentFm = isObj(sentFm0) ? sentFm0 : null;
    const envelope = isObj(meta) ? meta : null;
    const documentType = sentFm ? typeStated(sentFm.object_type) : null;
    const envelopeType = envelope ? typeStated(envelope.object_type) : null;
    let promotedType = documentType ?? envelopeType ?? undefined;
    const documentTitle = sentFm ? textStated(sentFm.title) : null;
    const documentQuestionTitle = documentType === "inquiry" && typeof sentMd?.text === "string"
      ? deriveInquiryTitle(inquiryQuestionOf(sentMd.text)) : null;
    const envelopeTitle = envelope ? textStated(envelope.title) : null;
    let promotedTitle = documentTitle ?? envelopeTitle ?? undefined;
    const documentState = sentFm ? textStated(sentFm.current_state) : null;
    const envelopeState = envelope ? textStated(envelope.current_state) : null;
    let promotedState = documentState ?? envelopeState ?? undefined;
    const promotedPriorState = has(sentFm, "prior_state") ? (sentFm.prior_state ?? null)
      : (envelope ? envelope.prior_state ?? null : null);
    const promotedClosedReason = has(sentFm, "closed_reason") ? (sentFm.closed_reason ?? null)
      : (envelope ? envelope.closed_reason : undefined);
    const documentCreated = sentFm ? textStated(sentFm.created) : null;
    const documentLastUpdated = sentFm ? textStated(sentFm.last_updated) : null;
    const envelopeCreated = envelope ? textStated(envelope.created) : null;
    const envelopeLastUpdated = envelope ? textStated(envelope.last_updated) : null;
    let promotedCreated = documentCreated ?? envelopeCreated ?? undefined;
    let promotedLastUpdated = documentLastUpdated ?? envelopeLastUpdated ?? undefined;

    /* R19: a project's creation names no id; the plane mints it and writes it into the document. */
    const idSupplied = bundleId !== undefined && bundleId !== null && bundleId !== "";
    const creatingProject = base === null && !!envelope
      && (promotedType === "project" || (typeof bundleId === "string" && /^PROJ-/.test(bundleId)));
    let projectMd = null;
    if (creatingProject) {
      const r = (code, detail) => rowRefusal(PROJECT_ID_CHECKS[code], code, detail);
      if (idSupplied)
        return r("PROJECT_ID_SUPPLIED",
          "a new project's id is minted by the plane and returned; send the creation with no bundleId. "
          + "A creation in the PROJ- namespace names no id, whatever type it claims. Nothing was created.");
      projectMd = sentMd;
      if (!sentFm)
        return r("PROJECT_DOCUMENT_UNREADABLE",
          "the new project's bundle.md must arrive as inline text beginning with a --- front matter block, "
          + "because the plane writes the minted id into it. Nothing was created.");
      if (has(sentFm, "id"))
        return r("PROJECT_ID_IN_BYTES",
          "the new project's bundle.md already carries a top-level id: line. The plane writes the id it mints; "
          + "remove the line and send it again. Nothing was created.");
    }
    /* R7 */
    if ((!idSupplied && !creatingProject) || !Array.isArray(files) || !envelope)
      return { ok: false, reason: "MALFORMED", detail: "bundleId, files and meta are required" };
    if (idSupplied && typeof bundleId !== "string")
      return { ok: false, reason: "MALFORMED", detail: "bundleId is a string" };

    /* R11: what the request must name, each refused by name before anything is read or written. */
    if (!((typeof snapKey === "string" && snapKey.trim() !== "") || (typeof snapKey === "number" && Number.isFinite(snapKey))))
      return rowRefusal(PROMOTION_CHECKS.PROMOTE_SNAP_KEY_UNSTATED, "PROMOTE_SNAP_KEY_UNSTATED",
        "this request names no snapKey (a non-blank string), so the revision has no name in the history. Nothing was written.");
    const pathless = files.map((f, i) => (isObj(f) && typeof f.path === "string" && f.path.trim() !== "" ? -1 : i))
                          .filter((i) => i >= 0);
    if (pathless.length)
      return rowRefusal(PROMOTION_CHECKS.PROMOTED_FILE_PATH_UNSTATED, "PROMOTED_FILE_PATH_UNSTATED",
        `files entr${pathless.length > 1 ? "ies" : "y"} ${pathless.join(", ")} (counting from 0) name no path `
        + "(a non-blank string), or are not file objects. Nothing was written.", { entries: pathless });
    const blobHeld = (f) => typeof f.text !== "string" && typeof f.blobSha === "string" && f.blobSha !== "";
    const empty = files.filter((f) => typeof f.text !== "string" && !blobHeld(f)).map((f) => f.path);
    if (empty.length)
      return rowRefusal(PROMOTION_CHECKS.PROMOTED_FILE_CONTENT_UNSTATED, "PROMOTED_FILE_CONTENT_UNSTATED",
        `${empty.join(", ")}: neither text (a string) nor a blobSha, so the record holds nothing it could digest. `
        + "Nothing was written.", { paths: empty });
    const sizeless = files.filter((f) => blobHeld(f) && !(Number.isInteger(f.bytes) && f.bytes >= 0)).map((f) => f.path);
    if (sizeless.length)
      return rowRefusal(PROMOTION_CHECKS.PROMOTED_FILE_BYTES_UNSTATED, "PROMOTED_FILE_BYTES_UNSTATED",
        `${sizeless.join(", ")}: held as a blob and stating no size (bytes, a whole number from 0). Nothing was written.`,
        { paths: sizeless });

    /* R7, R17: readability is judged before any fence that reads the document's content. */
    if (!sentMd) return { ok: false, reason: "NO_BUNDLE_MD", detail: "a promotion carries its bundle.md" };
    if (base !== null) {
      if (typeof sentMd.text !== "string" || !sentFm)
        return rowRefusal(PROMOTION_CHECKS.BUNDLE_MD_UNREADABLE, "BUNDLE_MD_UNREADABLE",
          typeof sentMd.text !== "string"
            ? "this revision's bundle.md is held as a blob, so no rule about the revision can read it. Nothing was written."
            : "this revision's bundle.md has no readable front matter block, so no rule about the revision can read it. "
              + "Nothing was written.",
          { why: typeof sentMd.text !== "string" ? "blob" : "front_matter" });
    }

    /* R19: `visibility` only on a project's creation, `discoverable` only with an owner. */
    let creationVisibility = null;
    if (pkg.visibility !== undefined && pkg.visibility !== null) {
      const r = (code, detail) => rowRefusal(PROJECT_CREATION_VISIBILITY_CHECKS[code], code, detail);
      if (base !== null || promotedType !== "project")
        return r("PROJECT_VISIBILITY_NOT_A_CREATION",
          "visibility is chosen when a project is created or forked, and this is not a project's creation. An "
          + "existing project's setting is its owners' act, op=projectvisibilityset. Nothing was written.");
      const unknown = membership.visibilitySettingRefusal(pkg.visibility);
      if (unknown) return unknown;
      const creator = typeof pkg.ownerMemberId === "string" && pkg.ownerMemberId ? pkg.ownerMemberId : null;
      if (!creator && pkg.visibility === "discoverable")
        return r("PROJECT_VISIBILITY_NO_OWNER",
          "whether a project can be found is its OWNERS' choice, and a project created by a machine credential has "
          + "no owner to choose it, so it is created hidden. Send the creation without visibility (or with "
          + "visibility=hidden). Nothing was created.");
      creationVisibility = creator ? pkg.visibility : null;
    }

    /* R5: every stored digest and size is of the stored bytes. */
    const digested = digestFiles(files);
    if (digested.disagree.length)
      return rowRefusal(ACT_SHAPE_CHECKS.FILE_DIGEST_MISMATCH, "FILE_DIGEST_MISMATCH",
        "the sha256 sent for " + digested.disagree.map((d) => d.path).join(", ")
        + " is not the SHA-256 of that file's bytes (an inline file's UTF-8 text, or a blob's content address). "
        + "The record stores a digest only of what it holds. Nothing was written.",
        { paths: digested.disagree.map((d) => d.path), files: digested.disagree });
    files = digested.files.map((f) => {
      const n = inlineBytesOf(f);
      return n === null || f.bytes === n ? f : { ...f, bytes: n };
    });

    /* R13: a creation's producing group. */
    let groupStamp = null, createdGroup = null;
    if (base === null) {
      const g = this.#fact("producingGroup");
      if (g.unavailable) return g.unavailable;
      const recorded = typeof g.value === "string" && g.value ? g.value : null;
      if (recorded && !replay) { groupStamp = recorded; createdGroup = recorded; }
      else {
        const said = sentFm ? sentFm.group : undefined;
        const stated = [said, envelope.group].find((x) => typeof x === "string" && x.trim() !== "");
        createdGroup = stated ? stated.trim() : recorded;
        if (!createdGroup)
          return rowRefusal(INSTANCE_GROUP_CHECKS.GROUP_UNDETERMINED, "GROUP_UNDETERMINED",
            "this store records no producing group, and this creation names none — neither a group: line in its "
            + "bundle.md nor a group in its meta. The record does not supply one. Nothing was created.",
            { act: "promote" });
      }
    }

    const ctx = { pkg, base, meta: envelope, snapKey, author: author ?? null, writer, operation, replay,
                  register: Array.isArray(pkg.register) ? pkg.register : [], state: {} };

    /* R2: one transaction; any refusal returned inside it rolls back every row written. */
    return record.transact(() => {
      /* R19: mint, write, then hash. */
      if (creatingProject) {
        const year = this.#now().slice(0, 4);
        const slug = String(promotedTitle ?? "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "")
          .slice(0, 40).replace(/-+$/, "") || "project";
        bundleId = record.mintOpaqueId("PROJ", year, `-${slug}`, (id) => !!record.bundleInfo(id));
        if (!bundleId) return { ok: false, reason: "MINT_EXHAUSTED",
                                detail: "the plane could not find a free project id in the current sequence" };
        const lines = projectMd.text.split("\n");
        lines.splice(1, 0, `id: ${bundleId}`);
        const text = lines.join("\n");
        const written = { ...files.find((f) => f.path === "bundle.md"), text, bytes: te.encode(text).length, sha256: hexOf(text) };
        files = files.map((f) => (f.path === "bundle.md" ? written : f));
      }
      if (groupStamp) files = stampGroup(files, groupStamp);
      const head = record.head(bundleId);

      /* R20: a revision the stamped actor may not see is answered as one of a bundle not held. */
      if (head && base !== null && pkg.actorIdentity != null) {
        const sight = membership.sight(bundleId, pkg.actorViewer ?? "");
        if (sight === "EXISTENCE" && pkg.actorViewer != null) {
          const info = record.bundleInfo(bundleId);
          return rowRefusal(PROJECT_VISIBILITY_CHECKS.PROJECT_SEEN_NOT_A_PARTICIPANT, "PROJECT_SEEN_NOT_A_PARTICIPANT",
            "this project is discoverable and you are not one of its participants. Its existence and name are all "
            + "it shows you; asking to join is the one act open to you.",
            { project: bundleId, name: info ? info.title ?? null : null });
        }
        if (sight !== "FULL") return ABSENT();
      }

      /* R4: a re-send of the promotion the record holds under this snap key is answered and writes nothing. */
      const held = record.manifestEntry(bundleId, snapKey);
      const kind = replay ? "promotion-replay" : "promotion";
      if (held && samePromotion(held, { base: base === null ? EMPTY_STRING_SHA : base, files, author: author ?? null,
                                        kind, writer, operation })) {
        const md = held.files.find((f) => f && f.name === "bundle.md");
        return { ok: true, bundleId, idempotent: true, wrote: false, snapKey: String(snapKey),
                 bundleSha: md ? md.sha256 : null,
                 recorded: { kind: held.kind, base: held.base, author: held.author, created: held.created },
                 current: head ? { bundleSha: head.bundleSha, rowVersion: head.rowVersion } : null,
                 detail: "the record already holds this promotion under this snap key, byte for byte; nothing was written" };
      }
      /* R1 */
      if (head && base === null)
        return { ok: false, reason: "EXISTS", detail: "creation attempted against an existing bundle" };
      if (!head && base !== null) return ABSENT();

      /* R11: a revision carries forward what it states nowhere, and says so; a creation stating none is refused. */
      if (head && (promotedTitle === undefined || promotedTitle === null || promotedTitle === "") && head.title)
        promotedTitle = head.title;
      let typeCarried = null;
      if (head && promotedType === undefined) { promotedType = normalizeType(head.type); typeCarried = promotedType; }
      if (!head && promotedType === undefined)
        return rowRefusal(PROMOTION_CHECKS.PROMOTED_TYPE_UNSTATED, "PROMOTED_TYPE_UNSTATED",
          `neither the document being promoted nor this request's meta states an object_type, and `
          + `${cut(bundleId, 80)} is new, so the record holds nothing that says what kind of thing it is. State the `
          + `type in the document. Nothing was written.`);
      const carriedFields = {};
      if (head) {
        if (promotedState === undefined) promotedState = carriedFields.current_state = head.currentState;
        if (promotedCreated === undefined) promotedCreated = carriedFields.created = head.created;
        if (promotedLastUpdated === undefined) promotedLastUpdated = carriedFields.last_updated = head.lastUpdated;
      } else {
        const unstated = [["current_state", promotedState], ["created", promotedCreated],
                          ["last_updated", promotedLastUpdated]].filter(([, v]) => v === undefined).map(([k]) => k);
        if (unstated.length)
          return rowRefusal(PROMOTION_CHECKS.PROMOTED_FIELD_UNSTATED, "PROMOTED_FIELD_UNSTATED",
            `neither the document being promoted nor this request's meta states ${unstated.join(", ")}, and `
            + `${cut(bundleId, 80)} is new, so the record holds nothing to carry. State `
            + `${unstated.length > 1 ? "them" : "it"} in the document. Nothing was written.`, { fields: unstated });
      }

      /* R19: a project's title is unique across the instance, deactivated projects included. */
      if (promotedType === "project") {
        const key = projectNameKey(promotedTitle);
        if (!key)
          return { ok: false, reason: "NO_TITLE", detail: "a project needs a name, and it must be unique across this instance" };
        let after = null, clash = false;
        for (;;) {
          const page = record.listByType({ type: "project", after, limit: 200 });
          for (const id of page.ids) {
            if (id === bundleId) continue;
            const info = record.bundleInfo(id);
            if (info && projectNameKey(info.title) === key) { clash = true; break; }
          }
          if (clash || page.ids.length < 200 || !page.cursor) break;
          after = page.cursor;
        }
        if (clash)
          return { ok: false, reason: "NAME_TAKEN",
                   detail: "a project by that name already exists on this instance, compared without regard to case "
                         + "or spacing. This holds for deactivated projects too, because their names are still cited." };
      }

      /* R19: only an owner deactivates or reactivates a project; every other revision needs a joined actor. */
      if (head && normalizeType(head.type) === "project") {
        const to = promotedState, from = head.currentState;
        const deactivating = from !== "closed" && to === "closed" && promotedClosedReason === "abandoned";
        const reactivating = from === "closed" && to === "investigating";
        if (deactivating || reactivating) {
          const actor = typeof pkg.actorMemberId === "string" && pkg.actorMemberId ? pkg.actorMemberId : null;
          if (!actor || !membership.isProjectOwner(bundleId, actor))
            return { ok: false, reason: "NOT_THE_OWNER", act: deactivating ? "deactivate" : "reactivate",
                     detail: deactivating
                       ? "only an owner of this project may deactivate it, which is what closing it as abandoned "
                         + "means. Closing it as resolved or superseded is ordinary record work."
                       : "only an owner of this project may reactivate it." };
        }
        const denied = membership.projectAuthority(bundleId, pkg.actorIdentity ?? null, "joined", "promote");
        if (denied) return denied;
      }

      /* R1: the compare-and-swap. A stale base is never merged and never taken as the new value. */
      if (head && head.bundleSha !== base)
        return rowRefusal(ACT_SHAPE_CHECKS.CAS_STALE, "CAS_STALE",
          "the base this revision names is not the bundle's current version: someone else changed it since it was read. "
          + "Nothing was written.", { expected: head.bundleSha, got: base });

      /* R10: a revision never retypes its bundle. */
      if (head && typeCarried === null && promotedType !== normalizeType(head.type) && !replay)
        return rowRefusal(PROMOTED_TYPE_CHECKS.REVISION_RETYPES_BUNDLE, "REVISION_RETYPES_BUNDLE",
          `${cut(bundleId, 80)} is '${normalizeType(head.type)}' and this revision says '${cut(promotedType, 40)}'. A `
          + `revision changes what a document says, never what kind of thing it is. Nothing was written.`,
          { head_type: normalizeType(head.type), revision_type: promotedType });
      /* R12: a revision never redates its creation. */
      if (head && !has(carriedFields, "created") && !sameInstant(promotedCreated, head.created) && !replay)
        return rowRefusal(PROMOTION_CHECKS.REVISION_REDATES_CREATION, "REVISION_REDATES_CREATION",
          `${cut(bundleId, 80)} was created '${cut(head.created, 40)}' and this revision says `
          + `'${cut(promotedCreated, 40)}'. A revision changes what a document says, never when it was made. Send it `
          + `again with the document's created as the record holds it, or with none. Nothing was written.`,
          { head_created: cut(head.created, 80), revision_created: cut(promotedCreated, 80) });
      /* R13: a revision never regroups its bundle. */
      const revisionGroup = sentFm && sentFm.group !== undefined && sentFm.group !== null
        && String(sentFm.group).trim() !== "" ? String(sentFm.group).trim() : null;
      if (head && revisionGroup !== null && revisionGroup !== String(head.groupId).trim() && !replay)
        return rowRefusal(PROMOTION_CHECKS.REVISION_REGROUPS_BUNDLE, "REVISION_REGROUPS_BUNDLE",
          `${cut(bundleId, 80)} was produced by '${cut(head.groupId, 40)}' and this revision says `
          + `'${cut(revisionGroup, 40)}'. A revision changes what a document says, never whose it is. Send it again `
          + `with the group the record holds, or with none. Nothing was written.`,
          { head_group: cut(head.groupId, 80), revision_group: cut(revisionGroup, 80) });
      /* R14: a document's id is the bundle it is filed under. */
      const finalMd = files.find((f) => f.path === "bundle.md");
      const finalFm0 = finalMd && typeof finalMd.text === "string" ? parseFrontmatter(finalMd.text).data : null;
      const finalFm = isObj(finalFm0) ? finalFm0 : null;
      if (!replay && finalFm && has(finalFm, "id") && finalFm.id !== null && String(finalFm.id).trim() !== bundleId)
        return rowRefusal(PROMOTION_CHECKS.BUNDLE_ID_DISAGREES, "BUNDLE_ID_DISAGREES",
          `the document states id '${cut(finalFm.id, 80)}' and it is being filed under '${cut(bundleId, 80)}'. A `
          + `document is filed under the id it states. Nothing was written.`,
          { document_id: cut(finalFm.id, 80), bundle_id: bundleId });

      /* R16: a move into `retired` asks retire's own question. */
      if (promotedState === "retired" && (!head || head.currentState !== "retired")
          && (head ? normalizeType(head.type) : promotedType) === "information") {
        const c = this.#fact("citedBy", bundleId);
        if (c.unavailable) return c.unavailable;
        const citedBy = Array.isArray(c.value) ? c.value : [];
        if (citedBy.length)
          return { ok: false, reason: "CITED", to: "retired", offenders: [{ id: bundleId, citedBy }],
                   detail: "these are still cited by live edges. Retiring them would leave those citations pointing "
                         + "at a retired item; sever or replace the citing edges first. Nothing was written." };
      }

      /* R6 */
      for (const f of files) {
        const n = inlineBytesOf(f);
        if (n !== null && n > INLINE_MAX) return { ok: false, reason: "OVERSIZE_INLINE", path: f.path, bytes: n };
      }

      /* R9, R12: an envelope stating a value the document contradicts is refused by name. Replay is exempt. */
      if (!replay) {
        if (documentType !== null && envelopeType !== null && documentType !== envelopeType)
          return rowRefusal(PROMOTED_TYPE_CHECKS.ENVELOPE_TYPE_DISAGREES, "ENVELOPE_TYPE_DISAGREES",
            `the document being promoted says object_type '${cut(sentFm.object_type, 40)}' and this request's meta says `
            + `'${cut(envelope.object_type, 40)}'. The record goes by the document. Send it again with the meta naming `
            + `the type the document names, or change the document first. Nothing was written.`,
            { document_type: documentType, envelope_type: envelopeType });
        if (envelopeTitle !== null && (documentTitle !== null || documentQuestionTitle !== null)
            && !(documentTitle !== null && sameText(envelopeTitle, documentTitle))
            && !(documentQuestionTitle !== null && sameText(envelopeTitle, documentQuestionTitle)))
          return rowRefusal(PROMOTED_TYPE_CHECKS.ENVELOPE_TITLE_DISAGREES, "ENVELOPE_TITLE_DISAGREES",
            `the document being promoted is titled '${cut(documentTitle ?? documentQuestionTitle, 80)}' and this `
            + `request's meta says '${cut(envelopeTitle, 80)}'. The record goes by the document. Send it again with the `
            + `meta naming the document's title, or with no title in the meta. Nothing was written.`,
            { document_title: cut(documentTitle ?? documentQuestionTitle, 200), envelope_title: cut(envelopeTitle, 200) });
        let stateContradiction = null;
        if (envelopeState !== null && documentState !== null && !sameText(envelopeState, documentState))
          stateContradiction = ["current_state", documentState, envelopeState];
        else for (const k of ["prior_state", "closed_reason"]) {
          if (!has(sentFm, k) || envelope[k] === undefined) continue;
          const d = sentFm[k] ?? null, e = envelope[k] ?? null;
          if (d === null && e === null) continue;
          if (d === null || e === null || !sameText(d, e)) { stateContradiction = [k, d, e]; break; }
        }
        if (stateContradiction) {
          const [field, said, asked] = stateContradiction;
          return rowRefusal(PROMOTED_TYPE_CHECKS.ENVELOPE_STATE_DISAGREES, "ENVELOPE_STATE_DISAGREES",
            `the document being promoted says ${field} '${said === null ? "null" : cut(said, 40)}' and this request's `
            + `meta says '${asked === null ? "null" : cut(asked, 40)}'. The record goes by the document. Nothing was written.`,
            { field, document_value: said === null ? null : cut(said, 80), envelope_value: asked === null ? null : cut(asked, 80) });
        }
        const dateContradiction = envelopeCreated !== null && documentCreated !== null
            && !sameInstant(envelopeCreated, documentCreated) ? ["created", documentCreated, envelopeCreated]
          : envelopeLastUpdated !== null && documentLastUpdated !== null
            && !sameInstant(envelopeLastUpdated, documentLastUpdated) ? ["last_updated", documentLastUpdated, envelopeLastUpdated]
          : null;
        if (dateContradiction) {
          const [field, said, asked] = dateContradiction;
          return rowRefusal(PROMOTION_CHECKS.ENVELOPE_DATES_DISAGREE, "ENVELOPE_DATES_DISAGREE",
            `the document being promoted says ${field} '${cut(said, 40)}' and this request's meta says `
            + `'${cut(asked, 40)}'. The record goes by the document. Nothing was written.`,
            { field, document_value: cut(said, 80), envelope_value: cut(asked, 80) });
        }
      }

      /* R15: a move of current_state goes along an edge the type's declared table carries. A creation is not a move;
         a replay is not exempt. The head's type and the promoted type are both asked where they differ. */
      if (head && promotedState !== undefined && promotedState !== null && promotedState !== head.currentState) {
        const machines = [...new Set([normalizeType(head.type), promotedType])]
          .filter((t) => typeof t === "string" && vocabFor(STATES, t));
        for (const mt of machines) {
          const edges = vocabFor(STATES, mt).edges || {};
          const legalFrom = Object.prototype.hasOwnProperty.call(edges, head.currentState) ? edges[head.currentState] : [];
          if (legalFrom.includes(promotedState)) continue;
          const bias = mt === "bias";
          const row = bias ? BIAS_CHECKS.BIAS_ILLEGAL_TRANSITION : PROMOTION_CHECKS.STATE_MOVE_UNDECLARED;
          return rowRefusal(row, bias ? "BIAS_ILLEGAL_TRANSITION" : "STATE_MOVE_UNDECLARED",
            `${cut(bundleId, 80)} stands at '${head.currentState}' and this promotion names '${cut(promotedState, 40)}'. `
            + `A ${mt} at '${head.currentState}' moves to ${legalFrom.length ? legalFrom.join(" or ") : "no other state"}, `
            + `and a revision that leaves it where it stands is always allowed. The table is the catalogue's. Nothing was written.`,
            { from: head.currentState, to: promotedState, object_type: mt, legal_from: legalFrom });
        }
      }

      /* R7: a non-replay revision names every path it drops. */
      if (head && !replay) {
        const now = new Set(files.map((f) => f.path));
        const declared = new Set(Array.isArray(pkg.drop) ? pkg.drop : []);
        const dropped = record.livePaths(bundleId).filter((p) => !now.has(p) && !declared.has(p));
        if (dropped.length)
          return { ok: false, reason: "FILES_DROPPED", paths: dropped.sort(),
                   detail: "this promotion would remove files the previous revision had. Carry them forward, or name "
                         + "them in drop[] to delete them on purpose." };
      }
      if (!finalMd) return { ok: false, reason: "NO_BUNDLE_MD", detail: "a promotion carries its bundle.md" };
      /* R4: a different promotion under a held snap key. */
      if (held)
        return rowRefusal(ACT_SHAPE_CHECKS.SNAP_KEY_TAKEN, "SNAP_KEY_TAKEN",
          `${bundleId} already holds a promotion under snap key ${String(snapKey)}, and this one is not it (a different `
          + `base, file, writer or author). The record does not rewrite a history entry; send this promotion under a `
          + `new snap key. Nothing was written.`, { snapKey: String(snapKey) });

      /* R39: the later modules' checks, in the modules' order. */
      Object.assign(ctx, { bundleId, files, head, creation: !head, promotedType, promotedTitle, promotedState,
                           promotedPriorState, promotedClosedReason, promotedCreated, promotedLastUpdated,
                           documentType, envelopeType, docFm: finalFm, bundleMd: finalMd });
      for (const s of this.#steps) {
        if (!s.check) continue;
        ctx.state[s.module] = ctx.state[s.module] || {};
        const refused = s.check(ctx);
        if (refused && refused.ok === false) return refused;
      }

      /* R3: the one write, through record-core. */
      const projectedTitle = promotedType === "inquiry"
        ? deriveInquiryTitle(inquiryQuestionOf(typeof finalMd.text === "string" ? finalMd.text : "")) ?? promotedTitle
        : promotedTitle;
      const committed = record.commit({
        bundleId, type: promotedType, title: projectedTitle, project: null, snapKey, kind,
        base: head ? base : EMPTY_STRING_SHA, author: author ?? null, writer, operation, files,
        state: promotedState, priorState: promotedPriorState, group: head ? head.groupId : createdGroup,
        created: promotedCreated, lastUpdated: promotedLastUpdated, criticality: envelope.criticality ?? null,
        at: promotedLastUpdated || this.#now() });

      /* R19: the creating member is the project's sole owner, in the same transaction. */
      const ownerMemberId = typeof pkg.ownerMemberId === "string" && pkg.ownerMemberId ? pkg.ownerMemberId : null;
      let owner = null;
      if (!head && ownerMemberId && promotedType === "project") {
        membership.projectCreated({ projectId: bundleId, ownerId: ownerMemberId, visibility: creationVisibility,
                                    by: ownerMemberId });
        owner = ownerMemberId;
      }

      /* R39: the later modules' projections, in order; each may add keys to the answer, never replace one. */
      Object.assign(ctx, { bundleSha: committed.bundleSha, rowVersion: committed.rowVersion });
      const extras = {};
      for (const s of this.#steps) {
        if (!s.project) continue;
        ctx.state[s.module] = ctx.state[s.module] || {};
        const out = s.project(ctx);
        if (out && out.ok === false) return out;
        if (isObj(out)) for (const [k, v] of Object.entries(out)) if (!(k in extras)) extras[k] = v;
      }
      const answer = { ok: true, bundleId, bundleSha: committed.bundleSha, rowVersion: committed.rowVersion, owner,
        ...(!head && promotedType === "project" ? { visibility: membership.projectVisibility({ projectId: bundleId }) } : {}),
        ...(typeCarried ? { type_carried: { object_type: typeCarried, from: "head",
          says: "neither the document nor the request stated a type, so this revision keeps the type the record "
              + "already held for it" } } : {}),
        ...(Object.keys(carriedFields).length ? { fields_carried: { fields: carriedFields, from: "head",
          says: "neither the document nor the request stated these, so this revision keeps the values the record "
              + "already held for it" } } : {}) };
      for (const [k, v] of Object.entries(extras)) if (!(k in answer)) answer[k] = v;
      return answer;
    });
  }

  /* ---------------------------------------------------------------- reopen */

  reopen({ target, reason = "", viewer = null, author = null } = {}) {
    try { return this.#reopen({ target, reason, viewer, author }); }
    catch (e) {
      return { ok: false, reason: "REOPEN_FAILED", target: target ?? null,
               detail: `the reopening could not complete and nothing was written: ${cut(e && e.message ? e.message : e, 200)}` };
    }
  }

  #reopen({ target, reason, viewer, author }) {
    const record = this.#record, membership = this.#membership;
    const who = String(author ?? "").trim();
    /* R21 */
    if (!who || isMachineIdentity(who))
      return { ok: false, reason: "MACHINE_CANNOT_REOPEN",
               detail: "reopening is a named member's judgement that a question the group set down has to be worked "
                     + "again. A machine credential may surface a question and pursue one, and may not overturn the "
                     + "group's own disposition. Sign in as a member." };
    /* R22 */
    const why = String(reason ?? "").trim();
    if (!why)
      return { ok: false, reason: "NO_REASON",
               detail: "reopening records WHY the disposition no longer holds. Nothing here is prefilled." };
    if (why.length > EDGE_REASON_MAX || /["\\\r\n]/.test(why))
      return { ok: false, reason: "BAD_REASON",
               detail: `a reason is at most ${EDGE_REASON_MAX} characters and cannot contain a quote, a backslash, or a `
                     + `newline: the restricted frontmatter grammar has no escapes` };
    /* R23 */
    if (!target) return { ok: false, reason: "NO_TARGET", detail: "reopening picks up ONE question: pass target=<inquiry id>" };
    const head = typeof target === "string" ? record.head(target) : null;
    if (!head || membership.sight(target, viewer ?? "") !== "FULL") return { ok: false, reason: "NO_SUCH_BUNDLE", target };
    if (normalizeType(head.type) !== "inquiry")
      return { ok: false, reason: "NOT_AN_INQUIRY", target, object_type: head.type,
               detail: "reopening picks a question back up, and only an inquiry carries one." };
    const live = record.readFile(target, "bundle.md");
    if (!live || typeof live.text !== "string")
      return { ok: false, reason: "NO_DOCUMENT", target,
               detail: "this inquiry has no readable bundle.md, so its state cannot be moved" };
    let text = live.text;
    const fm = parseFrontmatter(text).data || {};

    /* R24 */
    if (!REOPENABLE_FROM.includes(head.currentState)) {
      const m = this.#fact("caseMember", target);
      if (m.unavailable) return { ...m.unavailable, target };
      if (!m.value)
        return { ok: false, reason: "NOT_SET_DOWN", target, from: head.currentState, reopenable: REOPENABLE_FROM,
                 detail: "reopening picks up something the group SET DOWN (deferred or dismissed) or a finding that is "
                       + "a member of a published or prepared case. A concluded inquiry in no case moves forward by "
                       + "publishing a new edition rather than quietly reverting to open still wearing its conclusion." };
    }
    const declared = fm.object_type ?? head.type;
    const spec = vocabFor(STATES, declared);
    const legalFrom = (spec?.edges?.[head.currentState]) || [];
    if (!legalFrom.includes("open"))
      return { ok: false, reason: "ILLEGAL_TRANSITION", to: "open", target, from: head.currentState, object_type: declared,
               detail: "this is not a legal move in the catalogue's state table for this document's own vocabulary." };

    /* R25 */
    const when = this.#now().replace(/\.\d+Z$/, "Z");
    const withHistory = appendStateHistory(text, { timestamp: when, from_state: head.currentState, to_state: "open",
                                                  blurb: why, author: who });
    if (!withHistory)
      return { ok: false, reason: "UNSPLICEABLE_STATE_HISTORY", target,
               detail: "this document's state_history block cannot be extended in place, and a reopening recording no "
                     + "transition would leave prior_state pointing at a history the document does not carry (C-4.2)" };
    text = setScalar(withHistory, "prior_state", head.currentState);
    text = setScalar(text, "current_state", "open");
    text = setScalar(text, "disposition_reason", `""`);
    text = setScalar(text, "case_edition", "null");
    text = setScalar(text, "last_updated", `"${when}"`);
    text = appendSessionLog(text, `### Session ${when} | Reopened | ${who}\n`
                                  + `Trigger: op=reopen on ${target}\n`
                                  + `Changes: state ${head.currentState} to open. Reason: ${why}.\n`);
    const carried = [];
    for (const path of record.livePaths(target)) {
      if (path === "bundle.md") continue;
      const f = record.readFile(target, path);
      if (!f) continue;
      carried.push(typeof f.text === "string" ? { path, text: f.text, sha256: f.sha256 }
                                              : { path, blobSha: f.blobSha, sha256: f.sha256, bytes: f.bytes });
    }
    const promoted = this.promote({
      bundleId: target, base: head.bundleSha, snapKey: `${when.replace(/[-:]/g, "")}_${rand(4)}`, author: who,
      files: [{ path: "bundle.md", text }, ...carried],
      meta: { object_type: declared, title: fm.title, current_state: "open", prior_state: head.currentState,
              created: fm.created, last_updated: when, criticality: fm.criticality ?? null },
    });
    if (!promoted.ok) return { ...promoted, target };
    /* R26: a live edge citing the target does not refuse a reopening. */
    return { ok: true, target, from: head.currentState, to: "open", why, author: who, at: when, weight: "single" };
  }
}

const instances = new WeakMap();

/** The one promotion instance for `host` (the Durable Object's `ctx`); `deps` are read on the first call only. */
export function promotionOf(host, deps) {
  let p = instances.get(host);
  if (!p) { p = new Promotion(deps); instances.set(host, p); }
  return p;
}

/** What a registered step receives (R39): the promotion's context, as the promotion built it. */
export function stepContext(c) {
  return c;
}
