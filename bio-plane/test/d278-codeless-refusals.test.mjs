/* NEGATIVE CONTROL: (declared and run 2026-09-23, branch land/worker/D-278, figures filled in below from the run)
   (a) BASELINE — nothing armed. MUST be green.
   (b) THE ROW'S NAMED ARM — the `unknown op` site's code stripped (`reason: "UNKNOWN_OP", ...dispatchRow("UNKNOWN_OP"),`
       deleted from `src/index.mjs`, `error` left in place). MUST FAIL naming the `unknown op` arms of section 3; MUST
       NOT move any other section, and the `queueAbsent` arm MUST stay green (the old plane's answer is exactly what
       it was written to recognise).
   (c) `error` NO LONGER BYTE-IDENTICAL — the site's `error: "unknown op"` rewritten to `error: "no such op"`. MUST
       FAIL on the byte-identity arm AND on the `queueAbsent` arm, by name: the code alone does not keep an older
       plane recognisable, the sentence does.
   Every restore verified by sha256 AND `cmp` against a uniquely-named per-arm pristine copy, each anchor required
   to match EXACTLY ONCE.
   CONTROL RUN 2026-09-23 (figures as the suite printed them): (a) GREEN 19/0 · (b) RED 16/3, the three FAILs
   exactly section 3's `unknown op` code, check and translation arms, `queueAbsent` GREEN · (c) RED 17/2, the
   byte-identity arm and the `queueAbsent` arm. index.mjs restored after each arm to sha256 eb82b72b… (726,540 B),
   `cmp`-identical to its per-arm pristine copy. ALL THREE AS DECLARED.
 * =========================================================================
 * d278-codeless-refusals.test.mjs — D-278. THE LAST CODELESS REFUSALS.
 *
 * THE RULING IS BOB #26's, PROVISIONAL, 2026-09-22, and its home is CITED rather than restated:
 * `docs/development/INTERFACES.md` I3, the **Answers** bullet, one determination per group.
 *   (4) the CAPABILITY complaints (503, no evidence storage bound) — CODED, one row, an INSTALLATION fact
 *       (C-68.1 `EVIDENCE_STORAGE_NOT_CONFIGURED`), at `capture`, `pdfstructure`, `acquire` and `attest`.
 *   (5) `unknown op` (400) — CODED (C-69.1 `UNKNOWN_OP`) with `error: "unknown op"` BYTE-IDENTICAL, because
 *       civicos-ui's `queueAbsent` reads that sentence to tell an older plane from a refusal.
 *   (2) the PRE-AUTHENTICATION complaints — the argument complaints of `verify`, `publishedbytes`,
 *       `publishedcase` and `knock` take C-61.1 (`REQUIRED_ARGUMENT_MISSING`); `claim`'s three bootstrap-credential
 *       complaints are installation facts like (4) (C-68.2–.4). Each says NO MORE than its `error` did.
 *   (1) is coded already (REC-79) and (3), the 405 method complaints, stays codeless BY DESIGN — not graded here.
 *
 * EVERY SITE IS GRADED THE SAME FOUR WAYS, and each is a different defect:
 *   - the CODE, by name per site (a count of coded refusals is satisfied by refusals of any op at all);
 *   - the CHECK and the TRANSLATION, against the IMPORTED row (a hand copy agrees with its original for free);
 *   - `error` BYTE-IDENTICAL to the sentence it carried before this item, typed here as a literal ON PURPOSE —
 *     it is the pre-D-278 wire, and the point of the arm is that the code is purely additive.
 *
 * WHAT IT CAN AND CANNOT SEE: it drives each site through the control plane (`dispatchFetch`, the route a real
 * caller takes), on Miniflare. It is NOT a live probe, and a green harness is not a serving build (D-108). It does
 * not see the 405 method complaints (codeless by design), `knock`'s pre-store oversize and empty refusals, or
 * `publishedbytes`' `NO_PUBLISHED_STORE`.
 *
 * CORRECTED BY D-513 (2026-09-24), NOT EXEMPTED. That last clause used to read "(coded already, outside D-278)"
 * and "(coded already)", AND "CODED" WAS CARRYING TWO CLAIMS WITH ONE WORD. It was true that each refusal named a
 * `reason` on the wire; it was false that any of them carried the canned translation this item's whole subject is.
 * `knock`'s two reached a stranger — the one caller in this plane guaranteed not to be a member, with no account
 * and no other way to find out what happened — as a bare machine token. That is the defect this repository ranks
 * above a missing feature, sitting inside the header of the suite written to end it. D-513 closes the knock half:
 * those refusals are now C-85.3 KNOCK_ENVELOPE_TOO_LARGE, C-85.4 KNOCK_PAYLOAD_TOO_LARGE and C-85.5 KNOCK_EMPTY,
 * each minted at one governed site and graded on the wire by `doorbell.test.mjs`, which is why they are still
 * outside this suite. `NO_PUBLISHED_STORE` IS NOT CLOSED: measured on this tree, it has a `reason` and no canned
 * translation, and `check-refusal-codes.mjs`'s arm F still partitions it as MULTI-SITE — the sentence is corrected
 * here to say only what is true, and the fix is reported rather than taken, because it is not this item's row.
 * ========================================================================= */
import "./stdio.mjs";                 /* D-282: a suite's own exit must not discard the suite's own output */
import "./sandbox.mjs";               /* D-186: owns $TMPDIR for this process and removes it on exit */
import { Miniflare } from "miniflare";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { INSTALLATION_CHECKS, DISPATCH_CHECKS, REQUIRED_ARGUMENT_CHECKS } from "../checks/bio-checks.mjs";

const SRC = fileURLToPath(new URL("../src/index.mjs", import.meta.url));
const INDEX_SRC = readFileSync(SRC, "utf8");
const APP = readFileSync(fileURLToPath(new URL("../../civicos-ui/app.html", import.meta.url)), "utf8");

/* A value that IS published in this repository (dist/SECRETS.txt, 0.2.0) — `installer.test.mjs`'s own. */
const PUBLISHED = "df362a63adbe5d1d96a2942e39fd60e3fbb412eaadf7317266c19a4efea658ba";

const mk = (bindings, { r2 }) => new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: SRC, script: INDEX_SRC,
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
  ...(r2 ? { r2Buckets: ["CAPTURES", "PUBLISHED"] } : {}),
  bindings: { VERSION: "test", ...bindings },
});

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${JSON.stringify(want)}\n         got  ${JSON.stringify(got)}`}`);
  ok ? pass++ : fail++;
};
const call = async (mf, q, body) => {
  const init = body === undefined ? {} : { method: "POST", body: typeof body === "string" ? body : JSON.stringify(body) };
  const res = await mf.dispatchFetch("http://x/api/?" + q, init);
  return { status: res.status, ...(await res.json()) };
};
/* The four facts every site is graded on, read off one answer. */
const facts = (r) => ({ status: r.status, reason: r.reason ?? null, check: r.check ?? null,
                        translation: r.translation ?? null, error: r.error ?? null });
const rowFacts = (family, code, status, error) =>
  ({ status, reason: code, check: family[code].check, translation: family[code].translation, error });

const mfs = [];
try {

/* ====================================================================== 1
 * THE ROWS — IMPORTED, AND THEIR SHAPE ASSERTED BEFORE ANY SITE IS GRADED AGAINST THEM.
 * A liar passes every site arm below by adding empty rows; the shape is what stops that.
 * ==================================================================== */
console.log("\n=== D-278 · the last codeless refusals ===");
console.log("\n--- 1. the rows, imported ---");
const ROWS = [
  ...Object.entries(INSTALLATION_CHECKS).map(([c, r]) => [c, r, /^C-68\.\d+$/]),
  ...Object.entries(DISPATCH_CHECKS).map(([c, r]) => [c, r, /^C-69\.\d+$/]),
];
console.log(`    INSTALLATION_CHECKS ${Object.keys(INSTALLATION_CHECKS).length} · DISPATCH_CHECKS ${Object.keys(DISPATCH_CHECKS).length}`);
t("the five rows D-278 mints all exist, by name",
  ["EVIDENCE_STORAGE_NOT_CONFIGURED", "BOOTSTRAP_CREDENTIAL_UNSET", "BOOTSTRAP_CREDENTIAL_PUBLISHED",
   "BOOTSTRAP_CREDENTIAL_MISMATCH", "UNKNOWN_OP"].filter((c) => !ROWS.some(([k]) => k === c)), []);
t("each carries its family's C-number and a translation long enough to be a sentence",
  ROWS.filter(([, r, re]) => !re.test(String(r.check || ""))
    || String(r.translation || "").trim().split(/\s+/).length < 10).map(([c]) => c), []);
t("no two rows share a C-number or a translation — two conditions under one sentence is DEC-49's own complaint",
  [new Set(ROWS.map(([, r]) => r.check)).size, new Set(ROWS.map(([, r]) => r.translation)).size], [ROWS.length, ROWS.length]);
/* SAYING NO MORE THAN TODAY (the ruling's words for `claim`). The mismatch row must not describe the token it
   failed to match; the plainest way it could is by quoting a length, a prefix or a hint. */
t("the MISMATCH row says no more than its sentence did — nothing about the held token's length, prefix or shape",
  /\b(length|characters|begins|starts|prefix|hint)\b/i.test(INSTALLATION_CHECKS.BOOTSTRAP_CREDENTIAL_MISMATCH.translation), false);

/* ====================================================================== 2
 * GROUP (4) — THE CAPABILITY COMPLAINTS, on a copy with NO evidence storage bound.
 * ==================================================================== */
console.log("\n--- 2. group (4): no evidence storage bound, four ops ---");
const bare = mk({ ADMIN_TOKEN: "t-admin-1", MEMBER_TOKEN: "t-member-1" }, { r2: false }); mfs.push(bare);
const SHA = "a".repeat(64);
const storage = {
  capture:      await call(bare, `op=capture&sha256=${SHA}&token=t-member-1`),
  pdfstructure: await call(bare, `op=pdfstructure&sha256=${SHA}&token=t-member-1`),
  acquire:      await call(bare, `op=acquire&token=t-member-1`, { address: "https://example.org/" }),
  attest:       await call(bare, `op=attest&token=t-member-1`, { sha256: SHA }),
};
/* The two sentences are DIFFERENT and stay different: the sites said two things before this item and the code
   is additive, so each keeps its own. */
const STORAGE_ERROR = {
  capture: "R2 is not configured on this instance",
  pdfstructure: "R2 is not configured on this instance",
  acquire: "this instance has no evidence storage configured",
  attest: "this instance has no evidence storage configured",
};
t("each of the four answers C-68.1 with its row's translation and its OWN pre-D-278 `error`, byte-identical, "
+ "at 503 — pinned BY NAME per op",
  Object.fromEntries(Object.keys(storage).map((o) => [o, facts(storage[o])])),
  Object.fromEntries(Object.keys(storage).map((o) =>
    [o, rowFacts(INSTALLATION_CHECKS, "EVIDENCE_STORAGE_NOT_CONFIGURED", 503, STORAGE_ERROR[o])])));
t("and each names the op that met the condition, which is what tells four sites apart under one code",
  Object.fromEntries(Object.keys(storage).map((o) => [o, storage[o].op])),
  Object.fromEntries(Object.keys(storage).map((o) => [o, o])));
/* THE OVER-STRICTNESS HALF: with storage BOUND the same requests must not be told storage is missing. */
const bound = mk({ ADMIN_TOKEN: "t-admin-1", MEMBER_TOKEN: "t-member-1" }, { r2: true }); mfs.push(bound);
const withStorage = [
  await call(bound, `op=capture&sha256=${SHA}&token=t-member-1`),
  await call(bound, `op=pdfstructure&sha256=${SHA}&token=t-member-1`),
];
t("and with storage BOUND neither read is told storage is missing — the code is a fact about the copy, not a "
+ "label on every failure of these ops",
  withStorage.map((r) => r.reason === "EVIDENCE_STORAGE_NOT_CONFIGURED"), [false, false]);

/* ====================================================================== 3
 * GROUP (5) — `unknown op`, and the older-plane test that reads its sentence.
 * ==================================================================== */
console.log("\n--- 3. group (5): unknown op ---");
/* The name is BUILT, not written as a literal: `op-claims.test.mjs` reads every `op=<name>` in the corpus as a claim
   that such an op exists, and this one exists precisely in order not to. */
const NOT_AN_OP = ["nosuch", "opd278"].join("");
const unknown = await call(bound, `op=${NOT_AN_OP}&token=t-member-1`);
const U = rowFacts(DISPATCH_CHECKS, "UNKNOWN_OP", 400, "unknown op");
t("`unknown op` answers the code UNKNOWN_OP", unknown.reason, U.reason);
t("`unknown op` carries C-69.1", unknown.check, U.check);
t("`unknown op` carries the row's canned translation", unknown.translation, U.translation);
t("`unknown op`'s `error` is BYTE-IDENTICAL, at 400, and still names the op asked for",
  [unknown.error, unknown.status, unknown.op], ["unknown op", 400, NOT_AN_OP]);
/* `queueAbsent` IS READ OUT OF THE SURFACE AND RUN, never retyped here — a copy of its regex agrees with the
   original for free. The accepts-when's own words: it must still tell an older plane apart. */
const qaSrc = (APP.match(/function queueAbsent\(e\)\{[^\n]*\}/) || [""])[0];
t("the surface's `queueAbsent` was found in app.html — asserted before it is used, so a failed read cannot pass",
  qaSrc.length > 30, true);
const queueAbsent = qaSrc ? new Function(`${qaSrc}; return queueAbsent;`)() : () => null;
t("civicos-ui's `queueAbsent` still recognises the coded `unknown op` answer as an older plane (I3)",
  queueAbsent(unknown), true);
t("and does NOT read a coded refusal of a KNOWN op as an older plane — the over-strictness half",
  queueAbsent(storage.capture), false);

/* ====================================================================== 4
 * GROUP (2) — THE PRE-AUTHENTICATION COMPLAINTS. No credential on any of these calls.
 * ==================================================================== */
console.log("\n--- 4. group (2): pre-authentication argument complaints (C-61.1) ---");
const R = REQUIRED_ARGUMENT_CHECKS;
const pre = {
  verify:          await call(bound, "op=verify"),
  publishedbytes:  await call(bound, "op=publishedbytes"),
  publishedcase:   await call(bound, "op=publishedcase"),
  knockNoContent:  await call(bound, "op=knock", { note: "no content" }),
  knockBadBase64:  await call(bound, "op=knock", { contentB64: "@@not base64@@" }),
};
const PRE_ERROR = {
  verify: "verify requires sha256=<64 lowercase hex>",
  publishedbytes: "publishedbytes requires sha256=<64 lowercase hex>. This surface answers BY HASH and never by path, "
    + "so there is nothing to walk.",
  publishedcase: "publishedcase requires id=<bundle id> (with an optional &edition=N, latest by default) or "
    + "sha256=<the bundle sha of an edition>",
  knockNoContent: "knock requires contentB64 or contentText, plus optional note and contact",
  knockBadBase64: "contentB64 is not valid base64",
};
t("each pre-authentication argument complaint answers C-61.1 with its row's translation and its pre-D-278 "
+ "`error` byte-identical, at 400 — pinned BY NAME per site",
  Object.fromEntries(Object.keys(pre).map((k) => [k, facts(pre[k])])),
  Object.fromEntries(Object.keys(pre).map((k) => [k, rowFacts(R, "REQUIRED_ARGUMENT_MISSING", 400, PRE_ERROR[k])])));
t("and each names the argument it wanted",
  Object.fromEntries(Object.keys(pre).map((k) => [k, pre[k].argument])),
  { verify: "sha256", publishedbytes: "sha256", publishedcase: "id or sha256",
    knockNoContent: "contentB64 or contentText", knockBadBase64: "contentB64" });

console.log("\n--- 5. group (2): claim's three bootstrap-credential complaints (C-68.2–.4) ---");
const unset = mk({}, { r2: true }); mfs.push(unset);
const pub = mk({ ADMIN_TOKEN: PUBLISHED }, { r2: true }); mfs.push(pub);
const CLAIM = { bootstrapToken: "not-the-token", password: "long-enough-password-1" };
const claim = {
  unset:     await call(unset, "op=claim", CLAIM),
  published: await call(pub, "op=claim", { ...CLAIM, bootstrapToken: PUBLISHED }),
  mismatch:  await call(bound, "op=claim", CLAIM),
};
/* CORRECTED 2026-09-23 (c17-unionfix), not exempted: the title said "its own C-68 row", and the section header's
   range "C-68.2–.4" spells only C-68.2 literally, so `coverage.mjs --strict` read C-68.3 and C-68.4 as NEVER NAMED
   and exited 1 on the train's union (and on c17-batch5 alone). This assertion always proved all three fire —
   `facts()` compares the live answer's `check` to each row's — so the ids are now in the title, literally. */
t("each of claim's three answers its own C-68 row (C-68.2 unset, C-68.3 published, C-68.4 mismatch) with its "
+ "pre-D-278 `error` byte-identical and its status unchanged — pinned BY NAME",
  Object.fromEntries(Object.keys(claim).map((k) => [k, facts(claim[k])])),
  { unset: rowFacts(INSTALLATION_CHECKS, "BOOTSTRAP_CREDENTIAL_UNSET", 409, "instance has no bootstrap credential set"),
    published: rowFacts(INSTALLATION_CHECKS, "BOOTSTRAP_CREDENTIAL_PUBLISHED", 409,
      "bootstrap credential is a published repository value and can never arm a claim; set a fresh ADMIN_TOKEN "
      + "in the Cloudflare dashboard"),
    mismatch: rowFacts(INSTALLATION_CHECKS, "BOOTSTRAP_CREDENTIAL_MISMATCH", 403, "bootstrap credential does not match") });
t("and a refused claim claimed nothing — the right token still claims afterwards",
  (await call(bound, "op=claim", { bootstrapToken: "t-admin-1", password: "long-enough-password-1" })).result?.ok ?? null, true);

/* ====================================================================== 6
 * THE SITES ARE WHERE THE ROWS SAY — each `where` resolves to a marker pair in the plane's own source.
 * ==================================================================== */
console.log("\n--- 6. the rows' `where` resolve ---");
const regionOf = (where) => (String(where).match(/> ([a-z0-9-]+)$/) || [])[1];
t("every new row's `where` names a DEC-49 REGION present, opened and closed, in src/index.mjs",
  ROWS.map(([c, r]) => [c, regionOf(r.where)]).filter(([, reg]) => !reg
    || !INDEX_SRC.includes(`DEC-49 REGION ${reg}`) || !INDEX_SRC.includes(`END DEC-49 REGION ${reg}`)).map(([c]) => c), []);

console.log(`\n${fail === 0 ? "OK" : "FAILED"}  ${pass} pass, ${fail} fail`);
} finally {
  for (const mf of mfs) await mf.dispose();
}
process.exit(fail === 0 ? 0 : 1);
