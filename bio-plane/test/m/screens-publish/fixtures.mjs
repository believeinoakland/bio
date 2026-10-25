/* screens-publish's tests: the scripted plane behind each screen, over interface-shell's served page (its tests'
 * harness, `harness.mjs`, and document stand-in, `dom.mjs`). Each fixture answers its screen's reads in their owners'
 * documented shapes (review, case-inputs, case-authoring, case-check, case-tensions, case-carriage, ratification,
 * publish-schedule, public-read, case-import, docket, doorbell); a test overrides any op. */
import { webcrypto } from "node:crypto";
import { SCREENS } from "../../../src/screens-publish/index.mjs";
import { word, hasWord } from "../../../src/setup-words/index.mjs";
import { boot, ok, refused, refusedIn, silent, pending, textNodes, settle, bytes, MEMBER } from "../interface-shell/harness.mjs";

export { SCREENS, ok, refused, refusedIn, silent, pending, settle, bytes, word, hasWord };

export const P = "PROJ-2026-0012";
export const DR = "RVD-2026-0001";
export const C = "CASE-2026-0012";
export const SHA = "3b9f" + "0".repeat(56) + "c210";
export const B1 = "7d0e" + "1".repeat(56) + "91ab";
export const E1 = "c41a" + "2".repeat(56) + "0f57";
export const PHOTO = "ab12" + "3".repeat(56) + "ef90";
export const DIGEST = "d".repeat(64);
export const GRANT_SECRET = "SENTINEL-GRANT-9f2cb7e1";
/** The end of 20 October 2099 in Los Angeles (PDT, UTC-7), the group's zone in `PREFLIGHT`. */
export const GRANT_UNTIL = "2099-10-21T06:59:59Z";

const projectMd = ["---", `id: ${P}`, "object_type: project", "title: \"The Coliseum lease\"", "---", ""].join("\n");

/** `review` R35: the member door's copy carries the team's zone at its top level, with or without a grant. */
export const COPY = (o = {}) => ({ kind: "review-copy", reader: "member", draft: DR, project: P, zone: "America/Los_Angeles",
  case: { case_id: C, edition: 2, identity: "The Coliseum lease", newCase: false },
  authored: { scope: "Rent adjustments under the Coliseum lease, 2024 to 2026.", statement: "The rents rose without the vote the lease requires.",
    excluded: [{ target: "INFO-9", description: "Whether the rents are fair", reason: "outside the lease's terms" }] },
  findings: [{ target: "FND-2026-0031", present: true, text: "The 2024 adjustments had no council vote.", role: "load_bearing" }],
  choices: { subject_positions: ["sought_and_answered", "sought_no_answer", "not_sought"], roles: ["load_bearing", "supporting"] },
  gates: "passed",
  statement_acknowledgements: { acknowledgements: [{ by: "mai", reason: "The fairness question is another project's.", at: "2026-10-05T10:00:00Z" }] },
  observations: [{ observation: "OBS-2026-0001", chosen: { level: "name" }, stated: "signed the March 2024 adjustment" },
    { observation: "OBS-2026-0002", chosen: null, stated: null }],
  comments: [{ comment_id: "RVC-1", author_kind: "recipient", author: "Prof. N. Iyer", grant_id: "GRT-1", recipient: "Prof. N. Iyer", text: "Finding 1 should say which schedule the council approved.", at: "2026-10-07T09:00:00Z" }],
  grants: [{ grant_id: "GRT-1", recipient: "Prof. N. Iyer · housing law", until: GRANT_UNTIL, zone: "America/Los_Angeles" }],
  ...o });

export const PREFLIGHT = (o = {}) => ({ wrote: false, ready: false,
  first: { ok: false, code: "PHOTO_CHECK_UNWORDED", reason: "PHOTO_CHECK_UNWORDED", translation: "Photo 1 is not yet checked." }, // a code the list holds no word for (every code case-disclosures answers today has a refusal.<CODE> row, DEC-418)
  blockers: [{ ok: false, code: "TENSION_NOT_DISCLOSED", translation: "A contradiction is not yet disclosed." }],
  steps: [{ case: C, edition: 2, pinned: [{ target: "FND-2026-0031", bundleSha: B1 }] }, { roles: {}, required: null }, { tensions: [] },
    { photos: [{ ref: "INFO-2026-0007", sha: PHOTO, taken_by: "dev", relied_on_by: [{ member: "FND-2026-0031", role: "relied" }], state: "unchecked", marks: [], copy: null, refused: false, words: "photo.refused.unchecked" }], unchecked: 1 },
    { case: C, edition: 2, minted: false }, { sentences: [] }, { rule: null }, { signer: "dev", open_requests: [], publish_at: { zone: "America/Los_Angeles" } }],
  ...o });

export const DOCUMENT = (o = {}) => ({ case_id: C, edition: 2, doc_sha: SHA, text: "…", published_at: null,
  sign: { namespace: "bio-ratify", statement: `bio-ratify-case ${C} 2 ${SHA}\n` },
  /* the shapes the real `casedocument` answers (publication; case-grammar R4, R6): `citations` is `{state, rows}`, and the roster the
     signed document pins is `findings`, `[{target, version_sha, role}]` */
  citations: { state: "signed", rows: [{ target: "INFO-2026-0004", version: "only_capture", capture: "c".repeat(64), bundle_sha: E1 }, { target: "FND-2026-0031", version: "no_bytes", capture: null }] },
  findings: [{ target: "FND-2026-0031", version_sha: B1, role: "load_bearing" }],
  ...o });

/** `casedetails`' standing values (case-inputs R23): each `{stated, value, set_by, set_at}`; every one not stated unless `o` sets it. */
export const DETAILS = (o = {}) => {
  const none = { stated: false, value: null, set_by: null, set_at: null };
  return { area: none, contact: none, related: none, relationships: none, ...o };
};
/** `casedetailspublic`' standing values (case-inputs R24): each `{stated, value, set_at}`, never who set it. */
export const DETAILS_PUBLIC = (o = {}) => {
  const none = { stated: false, value: null, set_at: null, says: "Not stated." };
  return { area: none, contact: none, related: none, relationships: none, ...o };
};

/** The case `publishedcase` answers for the public page (the edition, its findings, evidence and corrections). */
export const PUBLISHED_CASE = { caseId: C, edition: 2, scope: "The Coliseum lease", signed_at: "2026-11-18T10:00:00Z", published_at: "2026-11-19T14:00:00Z",
  editions: [1, 2], edition_index: [{ edition: 1, ratified_at: "2026-07-02T10:00:00Z", published_at: "2026-07-02T14:00:00Z" },
    { edition: 2, ratified_at: "2026-11-18T10:00:00Z", published_at: "2026-11-19T14:00:00Z" }], manifest_sha: SHA,
  files: [{ path: "FND-2026-0031/snapshots/minutes.pdf", sha256: E1, kind: "capture", bytes: 512, finding: "FND-2026-0031" }],
  findings: [{ bundle_id: "FND-2026-0031", body: { conclusion: "The 2024 adjustments were made without the council vote the lease requires." },
    strength: [{ axis: "capture", grade: "B" }, { axis: "connection", grade: "C" }],
    standing: { role: "load_bearing", bar: { capture: "B", connection: "C" }, meets: true, short: [], line: "" } }],
  method: { timeline: [{ what: "Council approves amendment 1", at: "2024-01-12" }] },
  people: [{ shown: "The City Administrator", reason: "signed the March 2024 adjustment" }],
  captures: [{ title: "Council minutes, 12 January 2024", sha256: E1 }], corrections: { count: 0, last: null } };

/** The plane every screen reads from, keyed by op. */
export function plane(o = {}) {
  /* publication R1: a case edition never authored answers NO_CASE_DOCUMENT; `publish` prepares it, and from then on the record holds its document */
  let prepared = false;
  return {
    whoami: ok({ ...MEMBER, member: "dev", handle: "dev", capabilities: ["contribute", "create_projects", "publish"] }),
    /* the roster the kit names members by (interface-shell R111): a member id is drawn as its handle */
    memberlist: ok({ members: [{ member_id: "dev", handle: "dev" }, { member_id: "mai", handle: "mai" }, { member_id: "rosa", handle: "rosa" }] }),
    image: ok({ "bundle.md": projectMd }),
    openoriginal: bytes("PNG", "image/png"),
    casedrafts: ok({ kind: "review-drafts", project: P, drafts: [{ draft_id: DR, case: { case_id: C, edition: 2, identity: "The Coliseum lease" }, created_by: "dev", updated_by: "dev" }] }),
    reviewcopy: ok(COPY()),
    casecheck: ok({ state: "held", case: C, edition: 2 }),
    casedocument: () => (prepared ? ok(DOCUMENT()) : refusedIn("NO_CASE_DOCUMENT")),
    whatchangeddrafts: ok({ case: C, truncated: false, drafts: [{ id: "WCD-2026-0001", text: "Adds the 2025 rent schedules.", label: { machine: true }, at: "2026-10-06T09:00:00Z" }] }),
    reviewcomments: ok({ kind: "review-comments", comments: [{ comment_id: "RVC-1", draft_id: DR, reviewer: "Prof. N. Iyer", reviewer_kind: "recipient", text: "Finding 1 should say which schedule the council approved.", at: "2026-10-07T09:00:00Z" }] }),
    publishpreflight: ok(PREFLIGHT()),
    publishtensions: ok({ wrote: false, project: P, count: 2, candidates: [{ candidate: "CAND-1", finding: "FND-2026-0031", says: "Two documents date the rent notice differently." }], says: "" }),
    photomarks: ok({ capture: PHOTO, photo: true, state: "unchecked", copy: null, refused: false, marks: [] }),
    publishschedule: ok({ editions: [], limit: 500, cursor: null }),
    publish: () => { prepared = true; return ok({ caseId: C, edition: 2, minted: false, caseDocument: { case_id: C, edition: 2, doc_sha: SHA, bytes: 10 }, findings: [{ target: "FND-2026-0031", bundleSha: B1 }] }); },
    caseratify: ok({ caseId: C, edition: 2, sitting: [{ bundleId: "FND-2026-0031" }, { bundleId: "INFO-2026-0004" }] }),
    publishat: ok({ case: C, edition: 2, state: "waiting", at: { date: "2026-11-19", time: "06:00", zone: "America/Los_Angeles" } }),
    /* the ceremony asks for a case's published editions by `caseId` alone: the draft under it has not been published, so the case answers NOT_PUBLISHED */
    publishedcase: (req) => ((req.query || {}).caseId && !(req.query || {}).id && !(req.query || {}).sha256 ? refusedIn("NOT_PUBLISHED") : ok(PUBLISHED_CASE)),
    publishedbytes: bytes("%PDF-1.7", "application/pdf"),
    verify: ok({ published: true, sha256: SHA, matches: [{ bundle_id: C, path: "manifest", kind: "manifest", published: true }] }),
    importedcases: ok({ imports: [{ import: "IMP-2026-0001", group: "West Oakland Neighbors", case: "CASE-2026-3549", scope: "Port lease revenue", latest_edition: 2,
      editions: [{ edition: 2, imported_by: "dev", imported_at: "2026-10-01T09:00:00Z", importer: { member: "dev", handle: "dev" }, findings: 3, recreated: 1, recreated_in_part: 1, did_not_recreate: 1 }] }], count: 1, wrote: false }),
    importedcase: ok({ import: "IMP-2026-0001", group: "West Oakland Neighbors", case: "CASE-2026-3549", scope: "Port lease revenue",
      edition: { edition: 2, imported_by: "dev", imported_at: "2026-10-01T09:00:00Z", importer: { member: "dev", handle: "dev" },
        group_fields: { group: "west-oakland", name: "West Oakland Neighbors", domain: "westoakland.example", domain_verified_at: null, stake: "We live beside the port.", detail: null,
          matter_stake: { stake: "Our block lies under the flight path.", set_by: "ana", set_at: "2026-09-01T09:00:00Z", source: "project" }, read_at: "2026-10-01T08:59:00Z" },
        findings: [{ finding: "FND-W-1", title: "Port lease revenue fell short of the adopted budget", result: "recreated" },
          { finding: "FND-W-2", title: "The shortfall was not reported to council", result: "partial" },
          { finding: "FND-W-3", title: "The 2025 calculation of arrears", result: "not_recreated" }] }, wrote: false }),
    heldcaptures: ok({ held: [{ bundle_id: "INFO-2026-0004", title: "Administrator's reply", since: "2026-10-15T10:00:00Z", capture: { sha256: E1 } },
      { bundle_id: "INFO-2026-0005", title: "Council statement", since: "2026-10-12T10:00:00Z", capture: { sha256: SHA } }] }),
    docket: ok({ case: C, project: P, entries: [
      { shelf: "public", entry: 1, kind: "edition", summary: "Edition 2 published, superseding Edition 1", published_at: "2026-11-19T14:00:00Z" },
      { shelf: "record", entry: 2, kind: "court-order", summary: "Order of 20 November: seal exhibit 4", proposed: "public", state: "filed", filed_at: "2026-11-20T09:00:00Z" }], wrote: false }),
    docketpublic: ok({ ok: true, case: C, group: "river-town", captures: {}, last_entry: "2026-11-20", entries: [
      { seq: 1, entry: 1, digest: DIGEST, signature: "-----BEGIN SSH SIGNATURE-----", published_at: "2026-11-19T14:00:00Z", taken_back: null,
        fields: { kind: "edition", date: "2026-11-19", summary: "Edition 2 published, superseding Edition 1" } },
      { seq: 2, entry: 2, digest: DIGEST, signature: "-----BEGIN SSH SIGNATURE-----", published_at: "2026-11-21T09:00:00Z", taken_back: null,
        fields: { kind: "court-order", date: "2026-11-20", summary: "Order of 20 November: seal exhibit 4" } }] }),
    accountdrafts: ok({ case: C, drafts: [], truncated: false }),
    docketprepare: ok({ entry: "{}", digest: DIGEST, statement: `bio-docket ${C} 3 ${DIGEST}\n`, warning: "Posting is public and permanent.", expires: "2999-01-01T00:00:00Z" }),
    docketpost: ok({ case: C, seq: 3, entry: 2, published_at: "2026-11-21T09:00:00Z" }),
    casedetails: ok({ ok: true, case: C, published: false, truncated: false, history: [], details: DETAILS() }),
    casedetailspublic: ok({ ok: true, case: C, group: "river-town", details: DETAILS_PUBLIC() }),
    projectlist: ok({ projects: [{ id: P, title: "The Coliseum lease" }, { id: "PROJ-2026-0013", title: "Potholes" }] }),
    list: ok({ bundles: [{ bundle_id: "INQ-2026-0001", title: "Is the city repairing reported potholes?" }] }),
    entitieskind: ok({ ok: true, kind: "body", entities: [{ entity_id: "ENT-1", kind: "body", label: "Oakland Rent Board" }], count: 1, truncated: false, next: null }),
    knock: ok({ ok: true, knockId: "KNOCK-1", sha256: SHA, bytes: 3, received: true, pseudonym: null }),
    ...o,
  };
}

/** An IndexedDB holding a signing key kept on this device (interface-shell R40's form), and its public wire key. */
export async function keptKey() {
  const pair = await webcrypto.subtle.generateKey({ name: "Ed25519" }, false, ["sign", "verify"]);
  const raw32 = new Uint8Array(await webcrypto.subtle.exportKey("raw", pair.publicKey));
  const idb = new Map([["civicsmith-signer", new Map([["keys", new Map([["own", { priv: pair.privateKey, raw32: raw32.buffer.slice(0), label: "bio-ratify" }]])]])]]);
  return idb;
}
/** Waits for the page's own work (WebCrypto, the kit's dialogs) until `f()` holds. */
export async function until(p, f) { for (let i = 0; i < 400 && !f(); i++) await new Promise((r) => setTimeout(r, 10)); await p.settle(); }
/** The kit's "What your key signs, exactly" dialog (interface-shell R41): its listed lines, then confirmed or declined. */
export const signDialog = (p) => p.root().querySelector('[data-overlay="sign"]');
export async function answerSign(p, yes = true, sent = null) {
  await until(p, () => signDialog(p));
  const lines = signDialog(p) ? signDialog(p).textContent : "";
  await p.click(`[data-shell="${yes ? "dialog-yes" : "dialog-no"}"]`);
  await until(p, () => (sent ? p.byOp(sent).length > 0 : !signDialog(p)));
  return lines;
}

/** The served page at `path` with this module's screens, over the plane. */
export async function open(path, o = {}) {
  const p = await boot({ screens: SCREENS, plane: plane(o.plane || {}), path, ...(o.boot || {}) });
  await p.settle();
  return p;
}

export const main = (p) => p.doc.getElementById("cs-main") || p.root();
export const norm = (s) => String(s).replace(/\s+/g, " ").trim();
export const text = (p, el = main(p)) => norm(el ? el.textContent : "");
/* R24: a sentence is asserted by its key, never by its English: `word(key, vars)` is what the page draws. */
export const drew = (p, key, vars = {}, el = main(p)) => text(p, el).includes(norm(word(key, vars)));
export const drewIn = (el, key, vars = {}) => norm(el.textContent).includes(norm(word(key, vars)));
/** The explanation an element carries (`data-tip`): its text, tags removed and entities read. */
export const tipOf = (el) => norm(String(el.getAttribute("data-tip") || "").replace(/<[^>]*>/g, "").replace(/&(amp|lt|gt|quot|#39);/g, (m, e) => ({ amp: "&", lt: "<", gt: ">", quot: '"', "#39": "'" }[e])));
/** The day as the page draws a date (`cs.date`, interface-shell R6): `date.daymonthyear` with the month's own word (DEC-333). */
const MONTHS = ["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"];
export const day = (iso) => { const [y, m, d] = String(iso).slice(0, 10).split("-").map(Number); return word("date.daymonthyear", { day: String(d), month: word("date.month." + MONTHS[m - 1]), year: String(y) }); };
/** A time of day `HH:MM` as the page draws it (`time.clock`, the 12-hour clock; DEC-299). */
export const clock = (hhmm) => { const [h, m] = String(hhmm).split(":").map(Number); return word("time.clock", { hour: String(h % 12 || 12), minute: String(m).padStart(2, "0"), ampm: word(h < 12 ? "time.am" : "time.pm") }); };
export const ops = (p, el = main(p)) => el.querySelectorAll("button[data-act]").map((b) => b.getAttribute("data-act"));
export const button = (p, op, nth = 0) => main(p).querySelectorAll(`button[data-act="${op}"]`)[nth] || null;
export function fill(p, values) {
  for (const [id, v] of Object.entries(values)) {
    const el = p.doc.getElementById(id);
    if (!el) throw new Error(`no field ${id}`);
    if (el.type === "checkbox" || el.type === "radio") el.checked = !!v; else el.value = v;
  }
}
/** Ticks the option `value` of a `cs.checks` group. */
export function tick(p, id, value) {
  const box = p.doc.getElementById(id).querySelectorAll("input").find((i) => i.getAttribute("value") === value);
  box.checked = true;
}
/** Presses an act: a reasoned act's reason field answered with `reason`, a dialog confirmed. */
export async function press(p, op, { nth = 0, values = {}, reason, confirm = true } = {}) {
  fill(p, values);
  const b = button(p, op, nth);
  if (!b) throw new Error(`no act ${op}`);
  await p.click(b);
  const slot = p.root().querySelector(`[data-slot="${b.getAttribute("data-ai")}"]`);
  const ta = slot && slot.querySelector('textarea[id^="cs-reason-"]');
  if (ta && reason !== undefined) { ta.value = reason; await p.click(slot.querySelector('[data-shell="reason-send"]')); }
  const ok2 = slot && slot.querySelector('[data-shell="confirm"]');
  if (ok2 && confirm) await p.click(ok2);
  await p.settle();
  return { b, slot: () => p.root().querySelector(`[data-slot="${b.getAttribute("data-ai")}"]`) };
}
export const last = (p, op) => p.byOp(op).at(-1);
/** Every text node drawn that reads as a word key: a key the page holds no word for is drawn as itself (interface-shell R5). */
export const rawKeys = (root) => textNodes(root).map((t) => String(t.data).trim()).filter((t) => /^[a-z][\w-]*(\.[\w-]+){2,}$/.test(t));
/** A file chosen in a file field (the stand-in's `files`). */
export function choose(p, id, bytes, name = "f.pdf", type) {
  const el = p.doc.getElementById(id);
  el.files = [{ name, ...(type ? { type } : {}), size: bytes.length, arrayBuffer: async () => bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.length) }];
}

/* ---------- T51-121: one finding's page, a reader's minimum, printing, the review copy as a file ---------- */

export const F1 = "FND-2026-0031";
export const F2 = "FND-2026-0032";
/** The signer's key as the answer states it (an SSH wire key, base64): its fingerprint is the SHA-256 of these bytes. */
export const SIGNER_KEY = Buffer.from("civicsmith-test-signer-key-bytes").toString("base64");
export const leg = (target, role, grade, axis, o = {}) => ({ target, role, grade, grade_axis: axis, grade_source: "case", target_edition: 1, served: false, cited_edition: null, detail: null, ...o });
/** A published finding entry of `publishedcase` (public-read R39), with the bytes it was published from. */
export const FINDING = (id, o = {}) => ({ bundle_id: id, title: "A finding", edition: 1, bundle_sha: B1, version_sha: B1, role: "load_bearing", ratified_at: "2026-11-18T10:00:00Z",
  attestor: { member: "rosa", key_b64: SIGNER_KEY }, delivered_by: "dev",
  body: { state: "published", from_sha: B1, question: "Were the 2024 rent adjustments lawful?", conclusion: "The 2024 adjustments were made without the council vote the lease requires.",
    authored: { conclusion: "x", falsifier: "A council vote on the 2024 adjustments, in the minutes of any meeting between January and March 2024.", falsifier_override: null } },
  strength: [{ axis: "capture", grade: "B" }, { axis: "connection", grade: "B" }],
  standing: { role: "load_bearing", bar: { capture: "B", connection: "B" }, meets: true, short: [], line: "" },
  basis: [], serves: [], names: [], unresolved: [], division: { parent: null, siblings: [], detail: null }, ...o });
/** A case answer holding `findings`, as `publishedcase` gives it for a case, or for one finding (`asked`). */
export const CASE_WITH = (findings, o = {}) => ({ caseId: C, edition: 2, scope: "The Coliseum lease", signed_at: "2026-11-18T10:00:00Z", published_at: "2026-11-19T14:00:00Z",
  editions: [{ edition: 1 }, { edition: 2 }], manifest_sha: SHA, files: [], findings, method: { timeline: [] }, people: [], captures: [], corrections: { count: 0, last: null }, ...o });
export const publishedPlane = (findings, o = {}) => ({ publishedcase: ok(CASE_WITH(findings, o)) });
/** The address of a finding's own page. */
export const findingPath = (id, edition = 2) => `/app/published/${encodeURIComponent(`${C}/${edition}/${id}`)}`;
