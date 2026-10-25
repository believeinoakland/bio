/* capture-sources' published fixtures (fix round 10, K4990): the failing answers the real render driver gives, made when a test
 * runs and never stored. Each runs `renderWithBinding` (`src/browserrender.mjs`, the driver the render arm calls) over this
 * module's own fake binding (`fake-binding.mjs`), so a user's test takes the answer the driver really gives, not a copy of it.
 * The time an answer states is the run's own measurement (R69), so no caller states it. */
import { renderWithBinding } from "../../../src/browserrender.mjs";
import { HOST, fakeBinding } from "./fake-binding.mjs";

/* The pages the failing renders reach, in the fake's own shape (`fake-binding.mjs`). */
const PAGES = {
  "/navfail": { navError: "net::ERR_CONNECTION_REFUSED" },
  "/navhang": { navHang: true },
  "/noserialise": { noHtml: true },
};

/* The least navigation bound the driver accepts (R20), so a failing render costs about a second. */
const NAV_MS = 1000;
const ask = (binding, path) => renderWithBinding(binding, { url: `https://${HOST}${path}`, navigation_timeout_ms: NAV_MS }, {});

/* A binding that never answers the session's opening: the open bound is spent (R69). */
const silentBinding = () => ({ fetch: () => new Promise(() => {}) });

const FAILURE_CLASSES = {
  /* the binding hands out a session with no id: no session was had (R19, R69: permanent) */
  no_session: () => fakeBinding(PAGES, { nosessionid: true }),
  /* the binding refuses a session: HTTP 503 (R69: transient) */
  session_refused: () => fakeBinding(PAGES, { noacquire: true }),
  /* the session is never opened within the navigation bound (R69: transient) */
  open_bound: silentBinding,
};

/** The failed answer the driver gives for one of the failure classes above:
 *  `{ok: false, error, elapsed_ms, failure_class, detail}` (R19, R69). `class` names which. */
export async function renderFailure({ class: failureClass }) {
  if (!Object.hasOwn(FAILURE_CLASSES, failureClass)) throw new Error(`renderFailure: no failure class "${failureClass}"`);
  return ask(FAILURE_CLASSES[failureClass](), "/navfail");
}

/* The render runner's refusals: each is the driver's own failing answer for one kind of refusal (R19, R20, R69). */
const REFUSALS = {
  /* the browser refuses the navigation outright (permanent) */
  connection_refused: () => ask(fakeBinding(PAGES), "/navfail"),
  /* no session could be had (transient) */
  session_refused: () => renderFailure({ class: "session_refused" }),
  /* the page answers no serialised document (permanent) */
  not_html: () => ask(fakeBinding(PAGES), "/noserialise"),
  /* the navigation does not answer within its bound, and fails by name (permanent) */
  navigation_timeout: () => ask(fakeBinding(PAGES), "/navhang"),
};

/** The failing answer the render runner gives for one kind of refusal: `connection_refused`, `session_refused`,
 *  `not_html` or `navigation_timeout` (R19, R20, R69). */
export async function renderRefusal({ kind }) {
  if (!Object.hasOwn(REFUSALS, kind)) throw new Error(`renderRefusal: no refusal kind "${kind}"`);
  return REFUSALS[kind]();
}
