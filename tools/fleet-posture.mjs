/* DIST-4 / DEC-43 (b) — the fleet-visibility report.
 *
 * WHICH INSTANCES STILL MONITOR ON THE ADMIN_TOKEN FALLBACK, AS A NUMBER.
 * `#monitorToken()` is DAEMON_TOKEN || ADMIN_TOKEN, so an instance that never
 * received the DAEMON_TOKEN binding spends the root-of-trust credential on
 * every monitoring tick, forever, and nothing reports it except an operator
 * opening op=selftest by hand. DEC-43 ruled the fallback stays until DIST-2
 * has landed (it has), one update cycle has passed, and THIS count is zero or
 * its remainder is knowingly accepted. This tool is what makes that third
 * condition a measurement instead of a hope.
 *
 * THE ANSWER IS WHAT EACH INSTANCE REPORTS, NEVER WHAT THE INSTALLER INTENDED
 * TO BIND. An intent is not a measurement — the same rule that makes
 * deploy.mjs read the bytes back from the account. The instance-side surface
 * is op=selftest (probe-gated, the weakest credential; the installer's own
 * verifyInstall already reads it), whose bindings.DAEMON_TOKEN is
 * liveToken-checked by the plane itself: true / false / "not configured".
 * Consuming an existing op's existing field is why this is a DIST-side read
 * and no IC was filed — the design note is in CLAIMS.md (DIST-4 claim).
 *
 * ONE CALL, BOTH OF D-116's HATS: selftest carries `version` beside the
 * bindings, so the report states version authority across the fleet and
 * credential posture across the fleet together, as the DIST-4 row asked to be
 * said if it was true. It is true and this is where it is said.
 *
 * POSTURES, and why "clean" is not among them:
 *   daemon          bindings.DAEMON_TOKEN === true  — scoped monitoring.
 *   admin-fallback  === "not configured"            — DEC-43's population, NAMED.
 *   daemon-revoked  === false                       — bound but dead: the value is
 *                   denylisted (tokens.mjs — publication is revocation), so the
 *                   credential the operator bound authenticates nothing. BROKEN,
 *                   not fallback, not clean.
 *                   **UPDATED BY D-334, and the update is a CORRECTION rather
 *                   than a softening.** This paragraph used to read "…
 *                   #monitorToken() still SELECTS it, classify() refuses it, and
 *                   monitoring 401s forever instead of falling back", which was
 *                   true when DIST-4 wrote it and is not true now: D-334 made
 *                   `#monitorToken()` ask `liveToken()` before selecting, so the
 *                   ticks are carried by the ADMIN_TOKEN fallback. A report that
 *                   describes a mechanism which no longer exists is the record
 *                   overclaiming, which is why the sentence moved.
 *                   **THE POSTURE AND ITS BROKEN COUNT DID NOT MOVE, and that is
 *                   the other half of D-334.** Monitoring running is not the
 *                   credential being fixed: the instance is spending the
 *                   root-of-trust ADMIN_TOKEN (DEC-43's own concern) on a posture
 *                   its operator did not choose, and the daemon credential they
 *                   DID choose is dead. Healing the symptom into a clean report
 *                   is the D-106 class. It stays BROKEN until the value is
 *                   rotated.
 *   unreachable     no HTTP answer — a stated absence, never counted clean.
 *   refused         answered but did not present bindings (bad token, refusal)
 *                   — a stated absence, never counted clean.
 *
 * NO TOKEN VALUE IN THE OUTPUT, STRUCTURALLY: the report is built from a
 * whitelist projection, and every string that came from an instance is
 * scrubbed against every credential this tool was given — an instance that
 * echoes a token back (hostile or buggy) has the value replaced with
 * "[REDACTED-CREDENTIAL]" and is flagged `echoedCredential: true`. tokens.mjs
 * makes a published value a revoked one, and a report is a publication.
 *
 * EXIT: 0 only when every instance ANSWERED (even all-fallback exits 0 — the
 * report is a measurement, not a gate). Any unreachable/refused instance makes
 * the exit nonzero, because a count with holes presented as a complete count
 * is the overclaim class this repository refuses.
 *
 * usage: node tools/fleet-posture.mjs --fleet <fleet.json>
 *   fleet.json: [{ "name": "...", "base": "https://...", "token": "<probe>" }]
 *   The fleet file holds credentials. It lives OUTSIDE the repository or in a
 *   gitignored path; committing a token value revokes it (tokens.mjs).
 */

import { readFileSync } from "node:fs";

const REDACTED = "[REDACTED-CREDENTIAL]";

/* Scrub every configured credential out of a string that came from an
   instance. The tool knows exactly which secrets it sent; nothing an instance
   echoes may carry one into the report. */
function scrub(value, tokens) {
  if (typeof value !== "string") return { value, echoed: false };
  let out = value, echoed = false;
  for (const t of tokens) {
    if (t && out.includes(t)) { out = out.split(t).join(REDACTED); echoed = true; }
  }
  return { value: out, echoed };
}

function postureOf(daemonField) {
  if (daemonField === true) return "daemon";
  if (daemonField === false) return "daemon-revoked";
  if (daemonField === "not configured") return "admin-fallback";
  return "refused"; /* absent or an unrecognised shape: the instance did not
                       present the field, so nothing here may guess. */
}

/** The report. `instances`: [{name, base, token}]. `fetchImpl` is injectable
 *  so the suite can present fixture fleets; the CLI passes global fetch. */
export async function fleetPosture(instances, { fetchImpl = fetch } = {}) {
  const allTokens = instances.map((i) => i.token).filter(Boolean);
  const rows = [];
  for (const inst of instances) {
    /* The projection is a WHITELIST: name comes from the operator's own fleet
       file, posture from the categoriser, version from the one echoed field we
       carry — scrubbed. Nothing else an instance sends reaches the report. */
    const row = { name: inst.name, posture: null, version: null, detail: null, echoedCredential: false };
    try {
      const r = await fetchImpl(`${inst.base}/api/?op=selftest&token=${encodeURIComponent(inst.token || "")}`);
      let j = null;
      try { j = await r.json(); } catch { /* non-JSON is an unpresented answer */ }
      if (!j || typeof j !== "object" || !("bindings" in j) || !j.bindings || typeof j.bindings !== "object") {
        row.posture = "refused";
        row.detail = `answered HTTP ${r.status} without presenting bindings — cannot say which credential carries monitoring, and saying so is the report`;
      } else {
        row.posture = postureOf(j.bindings.DAEMON_TOKEN);
        const v = scrub(typeof j.version === "string" ? j.version : null, allTokens);
        row.version = v.value; row.echoedCredential ||= v.echoed;
        if (row.posture === "admin-fallback")
          /* "when armed": whether ticks actually FIRE depends on the SELF
             binding, which selftest's bindings block does not carry — an
             instance without SELF holds this posture dormant. The report
             states the credential posture, and only that. */
          row.detail = "monitoring, when armed, spends the root-of-trust ADMIN_TOKEN — DEC-43's population";
        if (row.posture === "daemon-revoked")
          row.detail = "DAEMON_TOKEN bound but NOT LIVE: the value is denylisted, so the credential this operator bound is BROKEN and authenticates nothing. Since D-334 the ticks are carried by the ADMIN_TOKEN fallback — monitoring RUNS, and it runs on the root-of-trust credential, which is not the posture that was chosen. Rotate DAEMON_TOKEN";
        if (row.posture === "refused")
          row.detail = "selftest answered but bindings.DAEMON_TOKEN was not a recognised shape";
      }
    } catch (e) {
      row.posture = "unreachable";
      const m = scrub(String(e && e.message || e), allTokens);
      row.detail = `no answer: ${m.value}`; row.echoedCredential ||= m.echoed;
    }
    rows.push(row);
  }

  const counts = { daemon: 0, "admin-fallback": 0, "daemon-revoked": 0, unreachable: 0, refused: 0 };
  for (const r of rows) counts[r.posture]++;
  const unanswered = counts.unreachable + counts.refused;
  const versions = [...new Set(rows.filter((r) => r.version).map((r) => r.version))];

  return {
    statedAt: new Date().toISOString(),
    instances: rows,
    counts,
    /* THE NUMBER DEC-43 waits on, stated in a sentence a person reads. */
    fallbackCount: counts["admin-fallback"],
    brokenCount: counts["daemon-revoked"],
    complete: unanswered === 0,
    versionsSeen: versions,
    versionSkew: versions.length > 1,
    summary: unanswered > 0
      ? `INCOMPLETE: ${unanswered} of ${rows.length} instance(s) did not answer — this is not a count, and presenting it as one would be the overclaim the report exists to refuse`
      : counts["admin-fallback"] === 0 && counts["daemon-revoked"] === 0
        ? `all ${rows.length} instance(s) monitor on the scoped daemon credential — DEC-43's measured count is ZERO`
        : `${counts["admin-fallback"]} of ${rows.length} instance(s) still monitor on the ADMIN_TOKEN fallback`
          + (counts["daemon-revoked"] ? `; ${counts["daemon-revoked"]} instance(s) have monitoring BROKEN on a revoked daemon token` : ""),
  };
}

/* ------------------------------------------------------------------- CLI */
const isMain = process.argv[1] && import.meta.url.endsWith(process.argv[1].split("/").pop());
if (isMain) {
  const fi = process.argv.indexOf("--fleet");
  if (fi === -1 || !process.argv[fi + 1]) {
    console.error("REFUSED [NO_FLEET]: name the fleet file.");
    console.error("usage: node tools/fleet-posture.mjs --fleet <fleet.json>");
    process.exit(2);
  }
  const instances = JSON.parse(readFileSync(process.argv[fi + 1], "utf8"));
  const report = await fleetPosture(instances);
  /* The fleet file's tokens must not reach stdout even via a report bug: the
     whole serialisation is scrubbed once more at the door. Belt AND braces,
     because a report is a publication and tokens.mjs revokes what is published. */
  let text = JSON.stringify(report, null, 2);
  for (const t of instances.map((i) => i.token).filter(Boolean)) text = text.split(t).join(REDACTED);
  console.log(text);
  console.log("\n" + report.summary);
  for (const r of report.instances) {
    if (r.posture !== "daemon") console.log(`  ${r.posture.toUpperCase().padEnd(15)} ${r.name}${r.detail ? " — " + r.detail : ""}`);
  }
  process.exit(report.complete ? 0 : 1);
}
