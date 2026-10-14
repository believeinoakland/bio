// The sign-in's waits (R17, R18) and the hold they make (R25), shared by the image (src/signin.mjs) and the Worker's
// class (src/worker.mjs), which imports nothing else of the image.
export const ADDRESS_WAIT_MS = 30_000;
export const CODE_WAIT_MS = 10 * 60_000;
export const OUTCOME_WAIT_MS = 60_000;
// R25: from a `start` answered 200, the container is held awake until the code's outcome could at latest be known.
export const SIGNIN_HOLD_MS = CODE_WAIT_MS + OUTCOME_WAIT_MS + 30_000;
// The header every sign-in route's answer carries (R25): `1` while an attempt waits, `0` when none does. It names no
// member and carries no secret; it is how the class tells a 409 that ends an attempt from one that keeps it.
export const WAITING_HEADER = 'x-signin-waiting';
// The headers a caller sends (R29; agent-worker R83): the trace, and the member's salted reference (never the id).
export const TRACE_HEADER = 'x-civicsmith-trace';
export const MEMBER_REF_HEADER = 'x-civicsmith-member-ref';
