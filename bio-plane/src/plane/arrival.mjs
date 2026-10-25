/* plane R24 (d) (fix round 10, G5; K5050; R-LOG): the Worker's record of an upload's arrival. Four uploads in a walk were never answered and the Worker saw no request longer than 43 s, so they
   never reached it (the environment's route); for the redeploy (K4428), each request whose op is `captureupload` is stated in one structured line the moment the entry receives it: the size the
   caller declared (`content-length`, null when none), the instant it arrived and Cloudflare's `cf-ray` (null when none). It is written before the entry awaits anything, so it exists for a request that is
   never answered, and it holds nothing a caller sent but those three: no credential, no address, no statement, no name. A log that cannot be written changes no answer. */
export const ARRIVAL_EVENT = "plane.captureupload_arrival";

const declaredSize = (headers) => {
  const raw = headers.get("content-length");
  if (raw === null || raw.trim() === "") return null;
  const n = Number(raw);
  return Number.isSafeInteger(n) && n >= 0 ? n : null;
};

export function logArrival(req) {
  try {
    if (new URL(req.url).searchParams.get("op") !== "captureupload") return;
    console.log(JSON.stringify({ event: ARRIVAL_EVENT, size: declaredSize(req.headers), arrived_at: new Date().toISOString(), cf_ray: req.headers.get("cf-ray") }));
  } catch { /* no line, no change to the answer */ }
}
