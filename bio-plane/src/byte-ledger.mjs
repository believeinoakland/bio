/* The byte ledger, the one cap convention and the platform's measured figures (runtime-limits R32, R33, R34; fix round 9
 * G123a; K4838, K4840 (2)). Pure: a ledger keeps its counters inside the object its caller made; nothing here reads a
 * clock, a store, the network or the Markdown file the measured rows are recorded in. */

const MiB = 1048576;

const deepFreeze = (o) => { for (const v of Object.values(o)) if (v && typeof v === "object") deepFreeze(v); return Object.freeze(o); };

/* `source` is the ruling the value rests on until BOB records the measured row in PLATFORM.md; the same commit then
   changes `value` and sets `source` to `PLATFORM.md P-M<n>`. No entry changes its value without a source naming a row. */
export const PLATFORM_FIGURES = deepFreeze({
  isolate_memory_bytes: { value: 268435456, source: "K4838" },
  idle_bytes: { value: 52428800, source: "K4616" },
  cpu_ms: { value: 300000, source: "K4838" },
  LAND_BATCH_BYTES: { value: 1048576, source: "K4838" },
  request_body_max: { value: 104857600, source: "K4838" },
});

const count = (n) => {
  if (!Number.isSafeInteger(n) || n < 0) throw new TypeError(`a byte count is a non-negative integer, not ${String(n)}`);
  return n;
};

/* Counts the bytes of the backing stores (buffers, ranges, decoded copies) a reader holds, by tag. */
export const byteLedger = () => {
  const tags = new Map();
  let now = 0, peak = 0;
  return {
    hold(n, tag) {
      count(n);
      tags.set(tag, (tags.get(tag) ?? 0) + n);
      now += n;
      if (now > peak) peak = now;
    },
    release(n, tag) {
      count(n);
      const had = tags.get(tag) ?? 0, off = Math.min(n, had);
      tags.set(tag, had - off);
      now -= off;
    },
    peak: () => peak,
    held: () => now,
  };
};

/* The old-space cap, in whole megabytes, of a capped child holding `N` MB of backing bytes: the isolate's memory less the
   platform's idle figure less N. The one formula for a PDF run and a sheet run. */
export const capFor = (N) => {
  if (typeof N !== "number" || !Number.isFinite(N) || N < 0) throw new TypeError(`capFor takes a non-negative number of MB, not ${String(N)}`);
  const { isolate_memory_bytes, idle_bytes } = PLATFORM_FIGURES;
  return Math.max(0, Math.floor((isolate_memory_bytes.value - idle_bytes.value) / MiB - N));
};
