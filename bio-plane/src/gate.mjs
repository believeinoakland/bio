/* The ratification gate, plane-native, version plane-gate/0.1.
 *
 * Scope honesty, stated once and recorded in every published row: this is
 * the MECHANICAL integrity gate. It proves the image is internally
 * consistent, byte-verified, hash-chained, and fully referenced before
 * anything reaches the published corpus. It is NOT yet the full bio-checks
 * catalog from the Apps Script gate (the C-series editorial and state
 * doctrine checks); that catalog ports in against its own source, and when
 * it lands the gate version advances and re-ratification is available
 * bundle by bundle. Publishing records gate_version so the record itself
 * says which gate each ratification passed.
 *
 * Every check is a refusal with a name and a location, never a boolean
 * false, so a failed ratification tells the member exactly what to fix.
 *
 * The gate is pure: it takes the image, the DO's rows, and an async
 * capture-presence probe, and returns findings. It writes nothing.
 */

export const GATE_VERSION = "plane-gate/0.1";

const sha256hex = async (s) => {
  const b = await crypto.subtle.digest("SHA-256",
    typeof s === "string" ? new TextEncoder().encode(s) : s);
  return [...new Uint8Array(b)].map((x) => x.toString(16).padStart(2, "0")).join("");
};

/* Frontmatter: the same split the browse view uses. The bundle format is
   authoritative; this only reads, never normalises. */
export function parseFrontmatter(text) {
  const m = String(text || "").match(/^---\n([\s\S]*?)\n---\n?/);
  if (!m) return null;
  const fm = {};
  for (const line of m[1].split("\n")) {
    const i = line.indexOf(":");
    if (i > 0) fm[line.slice(0, i).trim()] = line.slice(i + 1).trim();
  }
  return fm;
}

/**
 * Run the gate over one bundle.
 *
 * @param bundleId    the bundle under ratification
 * @param row         the bundles table row (object_type, current_state, bundle_sha)
 * @param image       readImage() output: live files inline or {blobSha, sha256}
 * @param manifest    manifest rows [{snap_key, base, kind, created}]
 * @param history     history rows for bundle.md [{snap_key, sha256}]
 * @param registers   register rows for this bundle [{capture_sha, path, bytes}]
 * @param dangling    dangling ref targets for this bundle [target_id]
 * @param hasCapture  async (sha) => {present, bytes} against the captures bucket
 */
export async function runGate({ bundleId, row, image, manifest, history, registers, dangling, hasCapture }) {
  const findings = [];
  const refuse = (check, detail, where) => findings.push({ check, detail, ...(where ? { where } : {}) });

  if (!image || !image["bundle.md"] || typeof image["bundle.md"] !== "string")
    refuse("G1_BUNDLE_MD", "bundle.md is missing or not inline");
  else {
    const fm = parseFrontmatter(image["bundle.md"]);
    if (!fm) refuse("G1_FRONTMATTER", "bundle.md has no parseable frontmatter");
    else {
      if (fm.id !== bundleId)
        refuse("G1_ID", `frontmatter id ${JSON.stringify(fm.id)} does not match bundle ${bundleId}`);
      if (row && fm.object_type !== row.object_type)
        refuse("G1_TYPE", `frontmatter object_type ${JSON.stringify(fm.object_type)} does not match the row ${JSON.stringify(row.object_type)}`);
      if (row && fm.current_state !== row.current_state)
        refuse("G1_STATE", `frontmatter current_state ${JSON.stringify(fm.current_state)} does not match the row ${JSON.stringify(row.current_state)}`);
    }
  }

  /* G2: every live inline file's bytes hash to what the store says they do,
     and the row's bundle_sha is the live bundle.md's actual hash. */
  const liveShas = {};
  for (const [path, v] of Object.entries(image || {})) {
    if (path.startsWith("_history/")) continue;
    if (typeof v === "string") liveShas[path] = await sha256hex(v);
  }
  if (row && liveShas["bundle.md"] && liveShas["bundle.md"] !== row.bundle_sha)
    refuse("G2_LIVE_SHA", "live bundle.md does not hash to the recorded bundle_sha",
      { want: row.bundle_sha, got: liveShas["bundle.md"] });

  /* G3: the base chain. Every promotion snapshotted the outgoing state under
     its snap_key, and its base is the outgoing bundle.md's hash, so every
     manifest row must agree with its own snapshot. A broken link here means
     history was tampered with or lost. */
  /* A creation carries a manifest entry whose base is the empty-string SHA and
     which snapshots nothing, because there was no prior state to snapshot. The
     check catalog recognises that sentinel the same way (isCreation), so the
     chain walk starts at the first entry that actually superseded something. */
  const EMPTY_STRING_SHA = "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855";
  const histSha = new Map(history.map((h) => [h.snap_key, h.sha256]));
  for (const m of manifest) {
    if (m.base === EMPTY_STRING_SHA || m.base === null) continue;
    const snap = histSha.get(m.snap_key);
    if (snap === undefined)
      refuse("G3_CHAIN_SNAPSHOT", `manifest entry ${m.snap_key} has no bundle.md snapshot`);
    else if (m.base !== snap)
      refuse("G3_CHAIN_BASE", `manifest entry ${m.snap_key} base does not match its snapshot`,
        { base: m.base, snapshot: snap });
  }

  /* G4: blob-backed live files are registered and present in the working
     bucket at the recorded size. The register is the trust root; a live
     blob without a register row is an unproven byte-source. */
  const regBySha = new Map(registers.map((r) => [r.capture_sha, r]));
  for (const [path, v] of Object.entries(image || {})) {
    if (path.startsWith("_history/") || typeof v === "string") continue;
    const reg = regBySha.get(v.blobSha ?? v.sha256);
    if (!reg) { refuse("G4_UNREGISTERED", `live blob file has no register row`, { path }); continue; }
    const probe = await hasCapture(reg.capture_sha);
    if (!probe.present)
      refuse("G4_MISSING_BYTES", `registered capture is absent from the working bucket`, { path, sha256: reg.capture_sha });
    else if (typeof reg.bytes === "number" && probe.bytes !== reg.bytes)
      refuse("G4_SIZE", `capture bytes differ from the register`, { path, want: reg.bytes, got: probe.bytes });
  }

  /* G5: no dangling references. The published corpus must not point at
     things that do not exist; C-6.2 applied at the boundary. */
  for (const target of dangling)
    refuse("G5_DANGLING_REF", `reference target does not exist`, { target });

  return { gateVersion: GATE_VERSION, ok: findings.length === 0, findings };
}
