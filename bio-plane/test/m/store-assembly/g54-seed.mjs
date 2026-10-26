/* store-assembly's copy of plane's test helper. G54 (fix round 6), the plane's seed: a case edition the way a ceremony's store half and the completing act leave it in the record (the modules' own commits:
   `storeCaseDocument`, `commitCaseEdition`, `commitEdition`), over the real `Store` of `fixture.mjs`; ported from ratification's `g54-entry.mjs` (the L seed), which runs the
   same calls inside workerd. `seedEdition(ctx, caseId)` leaves the edition not yet complete (its finding unsigned); `completeEdition(ctx, env, seed)` signs the finding, the act that
   completes it, and puts the finding's bytes in the published bucket. Nothing here is a hand-made row. `findingMd(id)` (G57) swaps the finding's text for one the ratify gate admits. */
import { recordOf } from "../../../src/record-core/index.mjs";
import { promotionOf } from "../../../src/promotion/index.mjs";
import { publicationOf } from "../../../src/publication/index.mjs";
import { materialsLines, materialAttestationLines } from "../../../src/case-grammar/index.mjs";

export const V = (id) => `member:${id}`;
export const NOW = "2026-10-22T20:00:00Z";
const KEY = "AAAAC3NzaC1lZDI1NTE5AAAAIKEY";
const projMd = (title) => ["---", "object_type: project", "schema: project@1", `title: "${title}"`, "current_state: forming",
  "prior_state: null", `created: "2026-09-27T00:00:00Z"`, `last_updated: "2026-09-27T00:00:00Z"`,
  "references: []", "state_history: []", 'objective: "Find out."', "---", "", "## Objective", "", "Find out.", ""].join("\n");
const inquiryMd = (id) => ["---", `id: ${id}`, "object_type: inquiry", "schema: inquiry@1", `title: "Is ${id} answered?"`,
  "current_state: open", "prior_state: null", `created: "2026-09-27T00:00:00Z"`, `last_updated: "2026-09-27T00:00:00Z"`,
  "references: []", "state_history: []", "surfaced_by: human", 'disposition_reason: ""', "---", "", "## Question", "",
  `Is ${id} answered?`, "", "## Session Log", "", "## Review Notes", ""].join("\n");
const caseDocText = (caseId, edition, project, target, pin, materials = []) => ["---", "format: bio-case-document/6", `case_id: ${caseId}`,
  `case_edition: ${edition}`, `case_project: ${project}`, "case_roles:", `  - target: ${target}`, `    version_sha: ${pin}`,
  "    edition: 1", "    role: load_bearing", "case_findings:", `  - ${target}`, "case_strength: []", "completeness:",
  "  author: member:olive", `  at: "${NOW}"`, "completeness_excluded: []", "case_citations: []",
  "method:", '  grading: "grading/1"', '  checks: "1.0.0"', ...materialsLines(materials), ...materialAttestationLines([]), "---", "",
  "## Scope", "", "The question.", "", "## What This Excludes", "", "Nothing else.", "", "## What Was Searched", "", "Everything.", ""].join("\n");

let n = 0;
const key = () => `k${Date.now()}-${++n}`;

const hex = (buf) => [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
const shaOf = async (bytes) => hex(await crypto.subtle.digest("SHA-256", bytes));

/** an owner, her project, one question and its case edition (document stored, commit made); the finding is not yet signed.
 *  `materials` documents of `kib` KiB (random bytes, so the edition is as heavy as stated) and their extracted texts are held in the published bucket
 *  (`env.PUBLISHED`) and listed in the case document, so the edition's case file has two files for each (ratification's L seed makes them the same way). */
export async function seedEdition(ctx, caseId, edition = 1, { env = null, materials = 0, kib = 1, findingMd = inquiryMd, findingSuffix = "" } = {}) {
  const record = recordOf(ctx), promotion = promotionOf(ctx), pub = publicationOf(ctx), F = `INQ-2026-${caseId.slice(-4)}${findingSuffix}`;
  ctx.storage.sql.exec(`INSERT OR IGNORE INTO members (member_id, cover, handle, role, status, capabilities, created, updated)
                        VALUES ('olive', 'Cover olive', 'h_olive', 'member', 'active', '["contribute"]', 't', 't')`);
  const proj = promotion.promote({ base: null, snapKey: key(), author: V("olive"), ownerMemberId: "olive",
    files: [{ path: "bundle.md", text: projMd(`Team ${caseId}`) }], meta: { object_type: "project" } });
  if (!proj.ok) throw new Error("project " + JSON.stringify(proj).slice(0, 300));
  const inq = promotion.promote({ bundleId: F, base: null, snapKey: key(), author: V("alice"),
    files: [{ path: "bundle.md", text: findingMd(F) }], meta: { object_type: "inquiry" } });
  if (!inq.ok) throw new Error("inquiry " + JSON.stringify(inq).slice(0, 300));
  const pin = record.head(F).bundleSha, rows = [];
  for (let i = 0; i < materials; i++) {
    const bytes = new Uint8Array(kib * 1024);
    for (let o = 0; o < bytes.length; o += 65536) crypto.getRandomValues(bytes.subarray(o, Math.min(o + 65536, bytes.length)));
    const t = new TextEncoder().encode(`extracted text of ${caseId} document ${i}\n`.repeat(20));
    const m = { ref: `INFO-2026-${String(i).padStart(4, "0")}-doc`, kind: "document", sha: await shaOf(bytes), text_sha: await shaOf(t),
                origin: `https://example.org/${i}`, archived_copy: null, included: true, rests_under: "load_bearing", title: null, obscured: null };
    await env.PUBLISHED.put(`bio/published/${m.sha}`, bytes); await env.PUBLISHED.put(`bio/published/${m.text_sha}`, t);
    rows.push(m);
  }
  const text = caseDocText(caseId, edition, proj.bundleId, F, pin, rows);
  const stored = pub.storeCaseDocument({ case: caseId, edition, text, author: V("olive"), at: NOW });
  if (!stored.ok) throw new Error("storeCaseDocument " + JSON.stringify(stored).slice(0, 300));
  const signed = record.transact(() => pub.commitCaseEdition({ case: caseId, edition, project: proj.bundleId,
    scope: "The question.", completeness: { statement: "It leaves out the minutes.", author: V("olive") },
    biasAcknowledgement: "none declared", bar: null, roster: [{ bundle_id: F, version_sha: pin, role: "load_bearing" }],
    sigArmored: "-----BEGIN SSH SIGNATURE-----\nsig\n-----END SSH SIGNATURE-----", attestorKey: KEY, attestorMember: "olive",
    gateVersion: "plane-gate/test", deliveredBy: V("olive"), at: NOW }));
  if (!signed.ok) throw new Error("commitCaseEdition " + JSON.stringify(signed).slice(0, 300));
  return { caseId, edition, finding: F, pin, project: proj.bundleId, materials: rows.length };
}

/** the act that completes the edition: the finding's own commit, and its bytes in the published bucket */
export async function completeEdition(ctx, env, s) {
  const record = recordOf(ctx), pub = publicationOf(ctx), F = s.finding, pin = record.head(F).bundleSha, text = record.readFile(F, "bundle.md").text;
  const done = record.transact(() => pub.commitEdition({ bundleId: F, bundleSha: pin, title: `Finding ${F}`, completeness: null, strength: null,
    memberCarriesBlocks: false, group: "test-group", edges: [], shas: [{ sha256: pin, path: "bundle.md", kind: "bundle", bytes: text.length }],
    attestorKey: KEY, attestorMember: "olive", gateVersion: "plane-gate/test", sigArmored: "-----BEGIN SSH SIGNATURE-----\nsig9\n-----END SSH SIGNATURE-----",
    deliveredBy: V("olive"), at: NOW }));
  if (!done.ok) throw new Error("commitEdition " + JSON.stringify(done).slice(0, 300));
  await env.PUBLISHED.put(`bio/published/${pin}`, new TextEncoder().encode(text));
  return done;
}

/** the edition's state as publication holds it */
export const stateOf = (ctx, s) => publicationOf(ctx).caseEditionState(s.caseId, s.edition, "test-group");
