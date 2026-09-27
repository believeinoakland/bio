/* T4 (legacy-tests), 2026-09-27: THE INTAKE REGISTER'S SHAPE FOR A FIXTURE THAT PROMOTES A READING CARRIER.
 *
 * Since provenance's extraction (T4-2, K72 (4), K121) the C-18 register arms run AT THE WRITE: a creation whose
 * `data/provenance.json` fails C-18.1 is refused `PROVENANCE_REGISTER_REFUSED` and nothing is written. Many old
 * suites plant a reading, a transcription chain or an entity list by promoting an information bundle whose register
 * document carries only `capture` and `reading` — a reading carrier, not an intake register — and C-18.1 refuses it
 * (no `file`, `locator`, `retrieved`, authority, `capture.method`/`grade`/`actor_class` or `origin`).
 *
 * `registerDoc(doc)` completes such a document into the shape op=acquire itself writes (`src/capture/acquire.mjs`):
 * the capture held in the bundle as `snapshots/<name>`, a blob addressed by the capture's own sha256; a locator and a
 * retrieval instant; the source authority stated UNDETERMINED with its basis (never an invented authority); the
 * capture's method, the direct letter `EARNED_CAPTURE_CEILING` (capture R18) and the `session` actor class; and a
 * `named_request` origin. Only the keys the fixture does not state are filled: a key the fixture states is kept as it
 * is, so what a suite asserts about its own document never moves. `registerFile(doc)` is the bundle's file entry for
 * that capture, which the promotion carries beside `data/provenance.json` so C-18.1's "names a file that does not
 * exist in the bundle" does not fire.
 *
 * `{ chain: true }` also gives the document the one first-party hop op=acquire records for a direct fetch
 * (`provenance_chain`), for a fixture whose bundle stands at or past `verified`, where C-18.9 refuses a document that
 * records no chain. Off by default: a suite that reads chains or route marks states its own.
 *
 * What it does NOT do: it never makes a register conform that a suite built non-conformant ON PURPOSE (a suite
 * testing C-18 itself), and it never touches a replay. Those fixtures are judged one by one. */
import { EARNED_CAPTURE_CEILING } from "../checks/bio-checks.mjs";

const isObj = (v) => v !== null && typeof v === "object" && !Array.isArray(v);
const nameOf = (sha) => `fixture-${String(sha || "unhashed").replace(/[^0-9A-Za-z]/g, "").slice(0, 16) || "unhashed"}.bin`;

/** The document, completed to C-18.1's shape; `at` is the retrieval instant when the document states none. */
export function registerDoc(doc, { at = "2026-01-01T00:00:00Z", file, chain = false } = {}) {
  const d = isObj(doc) ? doc : {};
  const cap = isObj(d.capture) ? d.capture : {};
  const retrieved = d.retrieved || cap.retrieved || (isObj(d.reading) && d.reading.at) || at;
  const out = {
    file: file || d.file || `snapshots/${nameOf(cap.sha256)}`,
    locator: `https://fixture.invalid/${nameOf(cap.sha256)}`,
    retrieved,
    ...(d.authority || d.authority_state ? {} : {
      authority_state: "undetermined",
      authority_basis: `a test fixture: no authority was asserted and none is determined; recorded ${retrieved}`,
    }),
    origin: { kind: "named_request" },
    ...(chain && !("provenance_chain" in d) ? { provenance_chain: [{
      who: "instance fixture (a test fixture's first-party fetch)",
      asserts: `these bytes were served for https://fixture.invalid/${nameOf(cap.sha256)} at ${retrieved}`,
      evidence: "first-party https fetch, hashed at receipt", bound: false, via: null }] } : {}),
    ...d,
    capture: {
      method: "bio-plane acquire, https fetch, hashed at receipt",
      ...(d.authored === true ? {} : { grade: EARNED_CAPTURE_CEILING }),
      actor_class: d.authored === true ? "member" : "session",
      ...cap,
    },
  };
  return out;
}

/** The promotion's file entry for the capture `registerDoc` named: a blob addressed by the capture's sha256. */
export function registerFile(doc, opts = {}) {
  const d = registerDoc(doc, opts);
  const sha = String(d.capture.sha256 || "").toLowerCase();
  const bytes = Number.isInteger(d.capture.bytes) && d.capture.bytes >= 0 ? d.capture.bytes : 0;
  return { path: d.file, blobSha: sha, sha256: sha, bytes };
}
