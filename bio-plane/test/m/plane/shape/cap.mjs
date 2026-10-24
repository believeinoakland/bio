/* G123a (fix round 9): THE ONE CAP CONVENTION of the shape harness. A capped child holds `N` MB of backing bytes; its old space is `capFor(N)`. `128 - N` (the PDF runs) and `128 + 39 - N` (the sheet runs)
 * were two answers to one question; the platform's figure is `runtime-limits`' `capFor` (R33 there), computed from `PLATFORM_FIGURES` (R34): the harness takes THAT when it is merged and holds a minimal local
 * copy of the contract until then (plan 2c.2: "test against the stub or a minimal local implementation of the contract, never against code not yet merged"). The local copy states the one convention once:
 * the object's 128 MB, plus what the committed bundle idles above the platform's measured idle in a node child (`NODE_CHILD_IDLE_MB` 89 measured at the child's start, `idle_bytes` 50 MiB, K4616, GATED on
 * P-M2), less the held bytes. It is the convention the sheet runs passed under (167 - N), now the PDF runs' as well: the sheet runs' 39 is no longer a second constant but a difference of two named figures. */
export const OBJECT_MB = 128;
export const NODE_CHILD_IDLE_MB = 89;
const LOCAL_PLATFORM_FIGURES = { idle_bytes: { value: 52_428_800, source: "K4616" } };
let limits = null;
for (const file of ["byte-ledger.mjs", "read-bounds.mjs", "cpu.mjs"]) {
  try { const m = await import(`../../../../src/${file}`); if (typeof m.capFor === "function") { limits = m; break; } } catch { /* not merged yet */ }
}
/** where the convention comes from: the module `runtime-limits` merged, or this local copy of its contract */
export const CAP_SOURCE = limits ? "runtime-limits" : "local copy of runtime-limits R33 (not merged)";
export const PLATFORM_FIGURES = limits && limits.PLATFORM_FIGURES ? limits.PLATFORM_FIGURES : LOCAL_PLATFORM_FIGURES;
const localCapFor = (heldMiB) => Math.floor(OBJECT_MB + (NODE_CHILD_IDLE_MB - PLATFORM_FIGURES.idle_bytes.value / 1048576) - heldMiB);
/** the old-space cap in whole MB for a child that holds `heldMiB` MiB of backing bytes: the one convention, for a PDF run and a sheet run alike */
export const capFor = (heldMiB) => (limits ? limits.capFor(heldMiB) : localCapFor(heldMiB));
