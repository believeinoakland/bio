/* MK-2's OVER-STRICTNESS MEASUREMENT: does an ORDINARY basis read exactly as it
 * did before the testimony axis existed? Driven, not argued.
 *
 *     node test/mk2-pristine-probe.mjs <plane-root>     # prints one JSON document
 *
 * `<plane-root>` is a directory holding `src/` and `checks/` (and `../docprofile`
 * beside it) — the working tree's `bio-plane/`, or a pristine extraction of the
 * commit MK-2 was built on (`git archive f426f519 bio-plane/src bio-plane/checks
 * docprofile`). `nc-mk2.mjs`'s `preitem` arm runs it over both and compares the
 * two answers BYTE FOR BYTE, with the new tree's `testimony` keys removed first —
 * because the claim is exactly that nothing ELSE moved.
 *
 * NOT a `.test.mjs` and not a fleet suite: it asserts nothing on its own, and it
 * is only a measurement when the harness compares two runs of it.
 *
 * THE FIXTURE IS ORDINARY ON PURPOSE — no observation anywhere: an uploaded
 * document at the capture ceiling, a connection testimony leg (the existing
 * connection-axis use of `testimony`), a structured basis of two grounds, a
 * question resting on a question, an ungraded leg, and one published case's
 * frozen strength block. Every answer that could have moved is printed.
 */
import "./stdio.mjs";
import "./sandbox.mjs";
import { Miniflare } from "miniflare";
import { readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { createHash } from "node:crypto";
import { makePublishingProject, allLoadBearing } from "./publishingproject.mjs";

const ROOT = resolve(process.argv[2] || join(import.meta.dirname, ".."));
const IDX = join(ROOT, "src", "index.mjs");
const mf = new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: IDX, script: readFileSync(IDX, "utf8"),
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
  r2Buckets: ["CAPTURES", "PUBLISHED"],
  bindings: { ADMIN_TOKEN: "adm-p", MEMBER_TOKEN: "mem-p", PROBE_TOKEN: "prb-p", VERSION: "test" },
});
const sha = (v) => createHash("sha256").update(v).digest("hex");
const rP = (r) => (r && typeof r === "object" && "result" in r) ? r.result : r;
const post = async (op, body, tok, qs = "") => rP(await (await mf.dispatchFetch(
  `http://x/api/?op=${op}&token=${tok}${qs}`, { method: "POST", body: JSON.stringify(body ?? {}) })).json());
const get = async (op, qs, tok) => rP(await (await mf.dispatchFetch(
  `http://x/api/?op=${op}&token=${tok}&${qs}`)).json());
const NOW = "2026-09-18T00:00:00Z";
const out = {};
try {
  const add = await post("memberadd", { memberId: "ruth", cover: "c", role: "admin",
                                        capabilities: ["contribute", "publish"] }, "adm-p");
  await post("enroll", { invite: add.invite, handle: "ruth", password: "ruth-passphrase-1" });
  const RUTH = (await post("login", { role: "member:ruth", password: "ruth-passphrase-1" })).token;
  const infoMd = (id) => ["---", `id: ${id}`, "object_type: information", "schema: information@1",
    `title: "Info ${id}"`, "current_state: collected", "prior_state: null",
    `created: "${NOW}"`, `last_updated: "${NOW}"`, "produced_by:", "  mode: assisted", "  capability_tier: session",
    "group: believe-in-oakland", "references: []", "state_history: []", "annotations_open: 0",
    "reeval_pending:", "  flag: false", "  since: null", "  source: null",
    "visuals: []", "criticality: supporting", "source_status: unchanged",
    "source:", "  locator: in hand", "  authority: synthetic", `  retrieved: ${NOW}`,
    "monitoring:", "  enabled: false", "  frequency: none",
    "---", "", "## Summary", "", "A document.", "", "## Provenance Notes", "", "## Session Log", "", "## Review Notes", ""].join("\n");
  const fileOf = (path, text) => ({ path, text, bytes: Buffer.byteLength(text), sha256: sha(text) });
  let n = 0;
  const snapKey = () => `20260918T${String(600000 + (++n)).slice(-6)}Z_${sha(String(n)).slice(0, 8)}`;
  const doc = async (id) => {
    const s = sha(`probe-${id}`);
    return post("promote", { bundleId: id, base: null, snapKey: snapKey(),
      meta: { object_type: "information", group: "believe-in-oakland", title: `Info ${id}`,
              current_state: "collected", created: NOW, last_updated: NOW },
      files: [fileOf("bundle.md", infoMd(id)), fileOf("data/provenance.json", JSON.stringify({ documents: [{
        file: "snapshots/upload.pdf", locator: "handed to a member", retrieved: NOW,
        authority: "synthetic", authority_state: "determined", authority_basis: "fixture",
        capture: { method: "uploaded by a member", grade: "C", actor_class: "member", sha256: s, encoding: "binary", bytes: 10 },
        origin: { kind: "member" }, attestation_attempts: [] }] }))],
      register: [{ sha256: s, path: "snapshots/upload.pdf", encoding: "binary", bytes: 10 }] }, RUTH);
  };
  const qMd = (id, legs, grounds = []) => ["---", `id: ${id}`, "object_type: inquiry", "schema: inquiry@1",
    `title: "Q"`, "current_state: open", "prior_state: null", `created: "${NOW}"`, `last_updated: "${NOW}"`,
    "produced_by:", "  mode: agent", "  capability_tier: high", "group: believe-in-oakland",
    ...(legs.length ? ["references:", ...[...new Set(legs.map((l) => l.target))].flatMap((tg) => [`  - target: ${tg}`,
                       "    rel: cites", "    status: confirmed"])] : ["references: []"]),
    "state_history: []", "annotations_open: 0", "reeval_pending:", "  flag: false", "  since: null", "  source: null",
    "visuals: []", "surfaced_by: agent", 'disposition_reason: ""',
    "recheck_triggers:", "  - text: Revisit", "    description: The minutes may say otherwise.",
    ...(legs.length ? ["basis:", ...legs.flatMap((l) => [`  - target: ${l.target}`, "    role: supports",
                       ...(l.grade ? [`    grade: ${l.grade}`, `    grade_axis: ${l.axis}`, `    grade_source: ${l.source}`] : []),
                       ...(l.ground ? [`    ground: ${l.ground}`] : [])])] : []),
    ...(grounds.length ? ["grounds:", ...grounds.flatMap((g) => [`  - ground: ${g}`, "    asserted_by: ruth", `    at: "${NOW}"`])] : []),
    "---", "", "## Question", "", "Q?", "", "## What It Rests On", "", "## Conclusion", "",
    "## What Would Falsify This", "", "## Session Log", "", `### Session ${NOW} | Formation | agent`,
    "Trigger: surfacing", "Changes: created.", "", "## Review Notes", ""].join("\n");
  const q = (id, legs, grounds) => post("promote", { bundleId: id, base: null, snapKey: snapKey(),
    meta: { object_type: "inquiry", group: "believe-in-oakland", title: "Q", current_state: "open", created: NOW, last_updated: NOW },
    files: [fileOf("bundle.md", qMd(id, legs, grounds))] }, RUTH);
  const A = "INFO-2026-5303-a", B = "INFO-2026-5303-b";
  out.docs = [(await doc(A)).ok, (await doc(B)).ok];
  const cap = (t, extra = {}) => ({ target: t, grade: "B", axis: "capture", source: "capture", ...extra });
  const shapes = {
    "INQ-2026-5303-flat": [[cap(A)]],
    "INQ-2026-5303-conn": [[{ target: A, grade: "D", axis: "connection", source: "testimony" }]],
    "INQ-2026-5303-mixed": [[cap(A), { target: B, grade: "D", axis: "connection", source: "testimony" }, { target: B }]],
    "INQ-2026-5303-grounds": [[cap(A, { ground: "g1" }), cap(B, { ground: "g2", grade: "C" })], ["g1", "g2"]],
    "INQ-2026-5303-none": [[{ target: A }]],
    "INQ-2026-5303-up": [[{ target: "INQ-2026-5303-flat" }]],
  };
  out.promote = {};
  for (const [id, [legs, grounds]] of Object.entries(shapes)) out.promote[id] = (await q(id, legs, grounds || [])).ok;
  out.strength = {};
  for (const id of Object.keys(shapes)) out.strength[id] = await get("inquirystrength", `id=${id}`, RUTH);
  out.earned = await get("earnedbasis", `id=INQ-2026-5303-flat&targets=${encodeURIComponent(`${A},${B}`)}`, RUTH);
  /* One ordinary case: its answer and its frozen bytes. */
  const concl = await get("conclude", `target=INQ-2026-5303-mixed&conclusion=${encodeURIComponent("Yes.")}`
    + `&falsifier=${encodeURIComponent("A later log would overturn this.")}`, RUTH);
  const PROJECT = await makePublishingProject({ post: (qs, b) => rP(mf.dispatchFetch(`http://x/api/?${qs}`,
      { method: "POST", body: JSON.stringify(b ?? {}) }).then((r) => r.json())), mf, sha, machineToken: "adm-p",
    owner: "ruth", id: "PROJ-2026-5303-p", created: NOW, updated: NOW });
  const targets = ["INQ-2026-5303-mixed"];
  const pub = await post("publish", { project: PROJECT, targets, roles: allLoadBearing({ targets }),
    scope: "Whether it happened, on the documents in hand.", statement: "This case covers one question at edition 1.",
    excluded: [], subjectPosition: "sought_and_answered",
    subjectJustification: "We asked on 2026-06-20 and printed what came back.",
    biasAcknowledgement: "This group holds that contracts should be adopted in public session." }, RUTH);
  out.conclude = concl && concl.ok;
  out.publishStrength = pub && pub.findings ? pub.findings.map((f) => f.strength) : pub;
  const img = await get("image", "id=INQ-2026-5303-mixed", RUTH);
  const md = img && img["bundle.md"] || "";
  out.frozenBlock = (md.match(/\npublished_strength:\n(?:  .*\n)+/) || [null])[0];
} catch (e) {
  out.threw = String(e && e.stack || e);
}
await mf.dispose();
process.stdout.write(JSON.stringify(out) + "\n");
process.exit(0);
