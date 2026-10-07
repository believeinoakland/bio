/* control-plane R58 (T35; N688, K1940 (1), K1943, K2042; acquisition R38–R41, capture R73): THE DOOR PROMOTES WHAT AN UNPACK
   FILES. After an `op=acquire` whose answer carries `unpack` (acquisition R40's automatic run) and after an `op=unpack`, the
   door promotes, Worker-side and through the store's own routes, first the archive's own document (when the answer carries
   it: an acquire's `document`), then each document of `unpack.documents` in the order answered: each an Information
   document at `collected`, in the archive's project (the request body's `project`, else none), held beside the archive,
   the caller its author with the door's stamps, each in its own promotion act. A refused promotion is named in the answer's
   `not_promoted` (`[{sha256, code}]`) and undoes neither the archive's promotion nor another file's; a later `op=unpack`
   of the archive, which files nothing twice, offers it again (acquisition R38's resume). The bytes are the captures the
   acquisition already holds: each file of the bundle is a blob reference to a digest, never bytes carried here. */
import { createSha256 } from "../record-grammar/index.mjs";

const enc = (text) => {
  const b = new TextEncoder().encode(text);
  return { text, bytes: b.length, sha256: createSha256().update(b).hex() };
};
const hex = (b) => [...b].map((x) => x.toString(16).padStart(2, "0")).join("");
const clean = (s, n) => String(s ?? "").replace(/[\p{Cc}]+/gu, " ").slice(0, n);

/* The bundle for one document (capture-requests R38's shape, as the doorbell's pull files it): `bundle.md`, the provenance
   document as `data/provenance.json`, the bytes as blob references at the document's own files, one register row each. */
function filing(id, doc, { project, archiveSha, at }) {
  const cap = doc.capture || {};
  const fromArchive = !!(doc.container && doc.container.archive_sha256);
  const path = fromArchive ? clean(doc.container.path ?? `entry ${doc.container.index}`, 200) : null;
  const title = clean(fromArchive ? `${path}, from the archive ${archiveSha}` : `Archive captured from ${doc.locator ?? cap.sha256}`, 200);
  const blobs = Array.isArray(doc.parts) && doc.parts.length
    ? doc.parts.map((p) => ({ path: p.file, sha256: p.sha256, bytes: p.bytes }))
    : [{ path: doc.file, sha256: cap.sha256, bytes: cap.bytes }];
  const md = ["---",
    `id: ${id}`, "object_type: information", "schema: information@2",
    `title: ${JSON.stringify(title)}`, "current_state: collected", "prior_state: null",
    ...(project ? [`project: ${JSON.stringify(project)}`] : []),
    `created: "${at}"`, `last_updated: "${at}"`,
    "references: []", "state_history: []", "criticality: supporting", "source_status: unchanged",
    `content_hash: sha256:${cap.sha256}`,
    "source:", `  locator: ${JSON.stringify(String(doc.locator ?? `zip:${archiveSha}`))}`, `  retrieved: ${doc.retrieved || at}`,
    "---", "", "## Summary", "",
    fromArchive
      ? `A file cut out of the archive \`${archiveSha}\` the record holds, as it sat in the archive. Its bytes are filed exactly as cut; nothing here summarises them.`
      : `An archive captured by the record, held beside the files cut out of it. Its bytes are filed exactly as captured; nothing here summarises them.`,
    "", "## Provenance Notes", "", "Filed at collected and never higher: releasing it is a named member's decision.", "",
    "## Session Log", "", `### Session ${at} | Collected`, "Changes: created from the archive's unpack.", "",
    "## Review Notes", ""].join("\n");
  return {
    md, title, blobs,
    files: [{ path: "bundle.md", ...enc(md) }, { path: "data/provenance.json", ...enc(JSON.stringify({ documents: [doc] }, null, 2)) },
            ...blobs.map((b) => ({ path: b.path, blobSha: b.sha256, sha256: b.sha256, bytes: b.bytes }))],
    register: blobs.map((b) => ({ sha256: b.sha256, path: b.path, encoding: "binary", bytes: b.bytes })),
  };
}

/** The documents to promote, in order: an acquire's own document (only when it carries `unpack`), then the documents the
 *  unpack filed. `answer` is the op's answer (an acquire's body, or an unpack's result). */
export function archiveDocuments(op, answer) {
  if (!answer || typeof answer !== "object" || answer.ok !== true) return [];
  const unpacked = op === "acquire" ? answer.unpack : answer;
  if (!unpacked || typeof unpacked !== "object" || unpacked.ok !== true) return [];
  const files = Array.isArray(unpacked.documents) ? unpacked.documents : [];
  const own = op === "acquire" && answer.document && typeof answer.document === "object" ? [answer.document] : [];
  return [...own, ...files].filter((d) => d && d.capture && /^[0-9a-f]{64}$/.test(String(d.capture.sha256 || "")));
}

/** Promotes each document, one act each, through the store `stub`: `who` is the door's promote stamps (`author`,
 *  `actorMemberId`, `actorIdentity`, `actorViewer`, `assistantPrincipal`, as `op=promote`'s), `doAnswer` the envelope's
 *  reader. Answers `{promoted: [{sha256, bundleId}], not_promoted: [{sha256, code}]}`. */
export async function promoteArchive({ stub, doAnswer, docs, project = null, archiveSha = null, who }) {
  const promoted = [], not_promoted = [];
  const proj = typeof project === "string" && project.trim() ? project.trim().slice(0, 200) : null;
  for (const doc of docs) {
    const sha = doc.capture.sha256;
    const at = new Date().toISOString().replace(/\.\d{3}Z$/, "Z");
    const fail = (code) => not_promoted.push({ sha256: sha, code: typeof code === "string" && code ? code : "PROMOTE_FAILED" });
    try {
      const alloc = await doAnswer(stub.fetch(new Request(`http://do/allocid?prefix=INFO&year=${at.slice(0, 4)}`, { method: "POST" })));
      const id = alloc.answered && alloc.result && typeof alloc.result.id === "string" ? `${alloc.result.id}-archive-file` : null;
      if (!id) { fail(alloc.result?.reason ?? alloc.reply?.body?.reason ?? "STORE_DID_NOT_ANSWER"); continue; }
      const f = filing(id, doc, { project: proj, archiveSha: archiveSha ?? doc.container?.archive_sha256 ?? sha, at });
      const raw = crypto.getRandomValues(new Uint8Array(4));
      const pkg = { bundleId: id, base: null, snapKey: `${at.replace(/[-:]/g, "")}_${hex(raw)}`, ...who, files: f.files,
                    meta: { object_type: "information", title: f.title, current_state: "collected", prior_state: null,
                            created: at, last_updated: at, criticality: "supporting" },
                    register: f.register };
      const out = await doAnswer(stub.fetch(new Request("http://do/promote", { method: "POST",
        headers: { "content-type": "application/json" }, body: JSON.stringify(pkg) })));
      const r = out.answered ? out.result : null;
      if (r && r.ok === true) promoted.push({ sha256: sha, bundleId: r.bundleId ?? id });
      else fail(r?.reason ?? r?.code ?? out.reply?.body?.reason ?? "STORE_DID_NOT_ANSWER");
    } catch { fail("PROMOTE_FAILED"); }
  }
  return { promoted, not_promoted };
}
