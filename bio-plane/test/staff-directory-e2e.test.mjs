/* NEGATIVE CONTROL: RUN 2026-09-23 by `node civicos-ui/test/nc-fw20.mjs` from the REPO ROOT — a baseline and 4 arms, 0 not as declared. Each arm edits the REAL source `docprofile/doctypes/staff-directory.mjs`, is armed ALONE, runs this suite, `doctype-breadth.test.mjs` and `bio-plane/test/staff-directory-e2e.test.mjs`, and is restored by `cp` from a uniquely-named per-arm pristine copy verified by sha256 AND `cmp` (13,259 bytes, floored; subject sha256 057df968…, re-run after the M-121 comment edits with the same verdicts). BASELINE all three green. (1) DECIDE — the deciding leg — density at one organisation's domain — neutered: this suite FAILED AS DECLARED at `directory_nss: reads as staff_directory (got generic)`, the plane at `the content-type registry chose staff_directory`, breadth GREEN. (2) REFERENCE — the schedule fence removed, so a document whose every row REFERENCES City staff reads as a directory: FAILED AS DECLARED at `neg_schedule: does NOT read as staff_directory (got staff_directory)` and in the plane at `and it is not a staff_directory`, while the plane's real directory still read as one; breadth GREEN. (3) ONEORG — the one-organisation share removed — the liar's pass: FAILED AS DECLARED at `neg_candidates: does NOT read as staff_directory (got staff_directory)`; breadth and plane GREEN. (4) OVERSTRICT — the schedule fence re-spelled against ALL addresses rather than the organisation's: all three GREEN AS DECLARED. Over-strictness on the landed types is also pinned in section 7: FW-18's five fixtures answer byte-identically to their verdicts read at origin/main 02603e88 before this type existed. */
/*
 * FW-20 — A STAFF DIRECTORY, FETCHED AND READ, THROUGH THE PLANE.
 *
 * `civicos-ui/test/staff-directory.test.mjs` drives the reader over the plane's own text.
 * This suite drives the PLANE: the real `src/index.mjs`, the COMMITTED pdf-worker bundle
 * bound as `PDF_WORKER` exactly as the fleet binds it, and the REAL bytes of two
 * documents from `s3://cao-94612` (fetched 2026-09-23; sha256 below) served by an
 * outbound stub, through `op=acquire` — the capture path a member's act takes.
 *
 * WHY THE TIER-2 MEMBER IS IN THE PATH, AND IT IS THE FINDING RATHER THAN A DETAIL. D-376
 * recorded the directory class as Tier-1 undecodable and withheld the type as "a tier-3
 * gap". FW-20 re-took that census: the markers on these documents are `no_tounicode` —
 * fonts with no Unicode map, tier 2's case — so tier 3 is never asked, and with the
 * tier-2 member bound they read. The WITHOUT-MEMBER arm below keeps the old fact
 * visible: the same bytes, the same plane, no member, and nothing is read.
 *
 *   nss-staff-directory-2022-06-14.pdf  8d7f6359…c78ce8  30,870 B  documents/Neighborhood-Services-Section-Directory-Rev-06-14-22.pdf
 *   ncpc-zoom-meeting-dates.pdf         6dd4a3c4…cf91e8f 151,412 B documents/NCPC-Zoom-Meeting-Dates-Final.pdf
 *
 * The second is the NEGATIVE: a meeting schedule whose every row names a City staff
 * address — reference-as-membership, M0-32's one defect class — which must NOT read as a
 * directory through the plane either.
 */
import "./stdio.mjs";                 /* D-282 */
import "./sandbox.mjs";               /* D-186 */
import { Miniflare } from "miniflare";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";

const SRC = fileURLToPath(new URL("../src/index.mjs", import.meta.url));
const PDFW = fileURLToPath(new URL("../../pdf-worker/dist/pdf-worker.bundled.mjs", import.meta.url));
const FX = (f) => new Uint8Array(readFileSync(fileURLToPath(new URL(`./fixtures/fw20/${f}`, import.meta.url))));
const DIR = FX("nss-staff-directory-2022-06-14.pdf");
const SCHED = FX("ncpc-zoom-meeting-dates.pdf");

let pass = 0, fail = 0, footReached = false;
process.on("exit", () => {
  if (!footReached) console.log(`\nstaff-directory-e2e: ${pass} passed, ${fail + 1} failed — SUITE ENDED BEFORE ITS OWN FOOT`);
});
const t = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${JSON.stringify(want)}\n         got  ${JSON.stringify(got)}`}`);
  ok ? pass++ : fail++;
};
const sha = (v) => createHash("sha256").update(v).digest("hex");

const serve = (request) => {
  const u = new URL(request.url);
  const bin = (b) => new Response(b, { headers: { "content-type": "application/pdf" } });
  if (u.pathname === "/documents/Neighborhood-Services-Section-Directory-Rev-06-14-22.pdf") return bin(DIR);
  if (u.pathname === "/documents/NCPC-Zoom-Meeting-Dates-Final.pdf") return bin(SCHED);
  return new Response("unscripted", { status: 500 });
};
const planeDef = (withMember) => ({
  name: "plane", modules: true, modulesRoot: "/", scriptPath: SRC, script: readFileSync(SRC, "utf8"),
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
  r2Buckets: ["CAPTURES", "PUBLISHED"],
  ...(withMember ? { serviceBindings: { PDF_WORKER: "pdf-worker" } } : {}),
  bindings: { ADMIN_TOKEN: "adm-sd", MEMBER_TOKEN: "mem-sd", PROBE_TOKEN: "prb-sd", VERSION: "test",
              GOVERNOR_APPETITE_PER_MIN: "600000", GOVERNOR_SUBRESOURCE_STAGGER_MS: "0" },
  outboundService: serve,
});
const pdfWorkerDef = {
  name: "pdf-worker", modules: true, modulesRoot: "/", scriptPath: PDFW, script: readFileSync(PDFW, "utf8"),
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"], r2Buckets: ["CAPTURES"],
  bindings: { VERSION: "test" },
};

const mf = new Miniflare({ workers: [planeDef(true), pdfWorkerDef] });
const mfBare = new Miniflare({ workers: [planeDef(false)] });
const acquire = async (m, path) => (await (await m.dispatchFetch("http://x/api/?op=acquire&token=mem-sd", {
  method: "POST", body: JSON.stringify({ locator: "https://cao-94612.s3.amazonaws.com" + path, authority: "City of Oakland" }),
})).json()).document;

try {
  console.log("\n1. the fixtures are the real bytes that were read");
  t("the directory's bytes are the ones the census read", sha(DIR), "8d7f6359060360f92456d594fe7523c84ed8d75faffb8f6ffd9695f606c78ce8");
  t("the schedule's bytes are the ones the census read", sha(SCHED), "6dd4a3c4c0843409145f9df4c6ca44463e4c8b1197c8af727aefd7883cf91e8f");

  console.log("\n2. the directory, acquired through the plane with the tier-2 member bound");
  const d = await acquire(mf, "/documents/Neighborhood-Services-Section-Directory-Rev-06-14-22.pdf");
  const r = (d && d.reading) || {};
  t("it was read from text", r.read_from_text, true);
  t("at tier 2 — the member recovered what tier 1 could not map", r.text_tier, 2);
  t("the content-type registry chose staff_directory", r.content_type, "staff_directory");
  t("and the reading carries the directory's twelve entries", Array.isArray(r.entities) ? r.entities.length : -1, 12);
  t("every entry is keyed by its address",
    (r.entities || []).every((e) => /^contact:[^@\s]+@oaklandca\.gov$/.test(e.key)), true);
  t("every entry carries where it was read (a pdf-page part)",
    (r.entities || []).every((e) => e.source && e.source.kind === "pdf-page"), true);
  t("the basis names the reader", /staff directory|staff_directory/.test(r.basis || ""), true);

  console.log("\n3. the same bytes with NO tier-2 member: D-376's fact, kept visible");
  const bare = await acquire(mfBare, "/documents/Neighborhood-Services-Section-Directory-Rev-06-14-22.pdf");
  const br = (bare && bare.reading) || {};
  t("tier 1 alone reads nothing from this directory", br.read_from_text, false);
  t("and says the text is undetermined for want of a Unicode map", /no_tounicode/.test(br.basis || ""), true);
  t("so no content type is claimed", br.content_type === "staff_directory", false);

  console.log("\n4. the meeting schedule that references staff in every row is NOT a directory");
  const s = await acquire(mf, "/documents/NCPC-Zoom-Meeting-Dates-Final.pdf");
  const sr = (s && s.reading) || {};
  t("it was read from text", sr.read_from_text, true);
  t("and it is not a staff_directory", sr.content_type === "staff_directory", false);
} finally {
  await mf.dispose();
  await mfBare.dispose();
}

footReached = true;
console.log(`\nstaff-directory-e2e: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
