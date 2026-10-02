/* capture-requests' table (requirements: `build/requirements/capture-requests.md`, R35; K4, K23). Moved out of the
 * legacy `schema.mjs` at this module's extraction, with the comments that record why it is shaped as it is:
 * `capture_requests` and its three indexes. Its three additive columns (`lead_inquiry`, `run_woken_at`, `render`)
 * are in the table as created and are added to a store that predates them by `migrateCaptureRequests`, with R40's
 * `source_reason` and R45's `sweep`. The table is keyed to a bundle by `target` for purge (R35). */

export const CAPTURE_REQUESTS_SCHEMA = `
-- PL-4 / IS-4 / SWEEP section 4b.1: THE CAPTURE-REQUEST DOOR.
--
-- THE AI DOES NOT CAPTURE. IT REQUESTS, AND THE DAEMON CAPTURES. That is the
-- structural gate DEC-47 kept when it withdrew the authorisation gate, and this
-- table IS the gate: a row here is an ASK, it carries no bytes, no sha and no
-- provenance, and nothing that writes it can fetch anything. The daemon drains
-- it, and DEC-47's conduct rules are enforced at that drain and nowhere else.
--
-- WHY A TABLE RATHER THAN A CONTROL-PLANE ENQUEUE. The op declarations
-- (op-declarations) deliberately omit taskenqueue from the OPS table, with the reasoning written into the table
-- itself: no control-plane route may put an event in the queue on its own
-- account. A scoped enqueue op would have crossed that. The table keeps the door
-- the OPS comment closed still closed, keeps the daemon the sole fetcher, and
-- gives DEC-47's conduct ONE enforcement point.
--
-- SCRATCH-CLASS, in capture_sessions' and ai_runs' family and NOT record. It
-- holds no member act, nothing derived from one, and nothing a case is built on:
-- it is a work list with an expiry. The CAPTURE it produces is record and lands
-- exactly where the daemon's captures always have, at collected and never
-- higher.
--
-- BOTH PRINCIPALS ARE COLUMNS AND NEITHER IS NULLABLE (DEC-27(b), DEC-55.4).
-- They are RECORDED AT THE REQUEST rather than resolved at the drain (the plane
-- principal is the caller's stamp, REC-168; the Claude principal is the run's),
-- because a run is scratch with an expiry and the attribution must survive it:
-- an act attributable only while the run that asked is still alive is an act
-- nobody can account for afterwards. A record naming ONE of the two is the
-- defect DEC-27(b) names, so the drain refuses to compose an attribution that
-- cannot state both.
--
-- host IS DERIVED AT THE WRITE and stored, so the drain's rate rule reads one
-- column instead of re-parsing a locator inside the enforcement point. A URL
-- this plane cannot parse never becomes a row at all.
--
-- state IS THE FENCE AS WELL AS THE LIFECYCLE. requested -> draining -> captured
-- is the only route to bytes, and draining is set by the drain alone, inside the
-- tick that then fetches through capture's in-process arm (K58), which nothing
-- outside the drain can reach: op=acquire refuses via capture-request from any
-- caller, so the AI capturing directly rather than requesting is refused by
-- construction and not by a class list.
CREATE TABLE IF NOT EXISTS capture_requests (
  request           TEXT PRIMARY KEY,
  run               TEXT NOT NULL,    -- the run that asked. NO FOREIGN KEY, section 14b.7's rule for versions applied one level down
  target            TEXT NOT NULL,    -- the inquiry the run is working under: a bundle id, which is what purge's per-bundle arm can find
  address           TEXT NOT NULL,    -- the public https locator asked for
  host              TEXT NOT NULL,    -- derived at the write from address
  purpose           TEXT NOT NULL,    -- the user-agent purpose token this fetch will carry
  ua_mode           TEXT NOT NULL,    -- civicos, or member-browser (BOB-3, permitted for public documents)
  principal_plane   TEXT NOT NULL,    -- the caller's stamp (REC-168): whose scope the writes ran under
  principal_claude  TEXT NOT NULL,    -- the run's: WHICH LEVEL of the cascade paid
  state             TEXT NOT NULL,    -- requested | draining | captured | refused | expired (D-523, a C-83 render hold released UNDETERMINED at expires)
  code              TEXT,             -- the DEC-49 wire code, when the drain refused or held this row
  detail            TEXT,             -- what the drain said, so a held row explains itself without a second call
  capture_sha       TEXT,             -- what the daemon captured. WRITTEN BY THE DRAIN ONLY
  attempts          INTEGER NOT NULL DEFAULT 0,
  requested_at      TEXT NOT NULL,
  updated           TEXT NOT NULL,
  expires           TEXT NOT NULL,
  captured_at       TEXT,
  -- PL-15 / D-213: THE OTHER QUESTION. NULL on every ordinary request, and NULL
  -- is the honest answer there rather than a default -- a capture asked for
  -- under the question the run is working bears on that question and on nothing
  -- else until somebody says otherwise.
  --
  -- WHEN IT IS SET it names a DIFFERENT inquiry from 'target': the run met
  -- evidence for question B while working question A, and this column is the
  -- observation. 'target' stays A, because the request is still accountable to
  -- the question it was made under, while THIS column names what the evidence
  -- is ABOUT. The two may never be equal, and the door refuses that rather than
  -- storing a lead that leads back where it started.
  --
  -- IT IS A SECOND BUNDLE ID ON THIS ROW, which is why purge's PER-BUNDLE arm
  -- gained a predicate for it in the same turn. The whole-store arm already
  -- clears the table, while the per-bundle arm matched 'target' only, so purging
  -- inquiry B would have left a lead standing that points at a question no
  -- longer in the store -- D-113's class arriving through a column instead of
  -- through a table, and invisible to hygiene's structural check for exactly
  -- that reason.
  lead_inquiry      TEXT,
  -- FL-4 / IS-9 / section 14b.3: WHEN THE RUN WAS WOKEN FOR THIS COMPLETION,
  -- and NULL means the daemon has answered and the run has not been told yet.
  --
  -- IT IS ON THE REQUEST AND NOT ON THE RUN, because the thing that completes is
  -- a request and a run may be waiting on several. A flag on the run would make
  -- "this run has been woken" true while a second request was still owed an
  -- answer, and the wake would be consumed by the first completion to land.
  --
  -- AN INSTANT RATHER THAN A FLAG, on the same reasoning captured_at carries:
  -- the record can then say WHEN the run was told, which is what makes a lease
  -- extension accountable to something rather than an unexplained clock move.
  --
  -- NULL IS THE HONEST DEFAULT AND IT INVENTS NOTHING. A row written before this
  -- column existed was never woken -- nothing existed to wake it -- and the
  -- consumer's own predicate requires the run to still be running, so a request
  -- belonging to a run that has already ended is never woken retroactively.
  run_woken_at      TEXT,
  -- D-491 / IC-276 / CLIENT-RENDERED.md, BOB #32 item 3: DOES THIS REQUEST ASK
  -- FOR THE PAGE AS A VISITOR SAW IT. 0 is the served document, captured exactly
  -- as every request before this column was. 1 asks the drain for the rendered
  -- pair, and BOB #32 item 3 is what makes that askable at all -- an unattended
  -- sweep MAY render, within the allowance and through the host governor.
  --
  -- NOT NULL DEFAULT 0, AND THAT IS THE HONEST DEFAULT HERE WHERE IT WOULD NOT
  -- BE ON THE TWO COLUMNS ABOVE. lead_inquiry and run_woken_at are nullable
  -- because a legacy row had an unstated value that a default would invent. This
  -- column has no unstated value to invent: a request written before it existed
  -- could not ask for a render, because no door read the flag and no drain could
  -- have honoured one, so 0 states what was true of it rather than guessing.
  --
  -- IT IS THE ROW AND NOT THE CALL THAT CARRIES IT, for the reason address,
  -- purpose and ua_mode are on the row: capture's in-process arm is handed it by
  -- the drain from the row it judged, so what this instance renders is what
  -- the drain judged.
  --
  -- WHEN THE RENDER CANNOT HAPPEN THE ROW IS HELD, never captured: capture's arm
  -- answers a named C-83 refusal before anything is fetched, the drain records
  -- that code and leaves the row in requested, and the served shell is NEVER
  -- filed as though it were the content. That sentence is the whole of C-83 and
  -- the reason this column cannot be read as advisory.
  render            INTEGER NOT NULL DEFAULT 0,
  -- K103 (3), capture-requests R40: WHY THE SOURCE TURNED THIS REQUEST AWAY, when
  -- it did: login, paywall, user-agent or other. NULL when nothing the source
  -- said decided the row (conduct, pacing, a render this instance could not do),
  -- so a reason is never invented for a refusal that was ours.
  source_reason     TEXT,
  -- R45 (T23; Intake Doctrine §4): THE SWEEP THIS REQUEST ASKS TO BE FILED
  -- UNDER, as its full name "<bundle>#<id>", or NULL for an ordinary request.
  -- NULL is the honest value on every row written before it: no door read a
  -- sweep then, so none was asked. The drain files a request naming one under
  -- that sweep only when link-sweep's scope check admits it, and refuses it
  -- C-28.19 otherwise; it is never quietly filed as an ordinary request.
  sweep             TEXT
);
CREATE INDEX IF NOT EXISTS capture_requests_state ON capture_requests(state, requested_at);
CREATE INDEX IF NOT EXISTS capture_requests_target ON capture_requests(target);
CREATE INDEX IF NOT EXISTS capture_requests_run ON capture_requests(run);
-- D-581, R26-R27: the queue's producers read captured rows by completion and
-- held renders by their last update, each bounded; these let a bounded read
-- stop at its limit instead of sorting every terminal row the table holds.
CREATE INDEX IF NOT EXISTS capture_requests_completed ON capture_requests(state, captured_at, request);
CREATE INDEX IF NOT EXISTS capture_requests_renders ON capture_requests(render, state, updated, request);
-- R39 (N262): the drain finds the capture this table holds of an address (and
-- render flag) to fetch conditionally on, by one indexed read per fired row.
CREATE INDEX IF NOT EXISTS capture_requests_address ON capture_requests(address, render, state, captured_at);
`;

/** The columns added after the table was first created, each added to a store that predates it. A legacy row's value
 *  is the honest one each comment gives: NULL for an unstated lead, wake, source reason or sweep, 0 for a render nobody
 *  could have asked for. */
export const CAPTURE_REQUESTS_ADDITIVE = Object.freeze([
  ["lead_inquiry", "TEXT"],
  ["run_woken_at", "TEXT"],
  ["render", "INTEGER NOT NULL DEFAULT 0"],
  ["source_reason", "TEXT"],
  ["sweep", "TEXT"],
]);

export function migrateCaptureRequests(sql) {
  const have = [...sql.exec(`PRAGMA table_info(capture_requests)`)].map((r) => r.name);
  if (have.length)
    for (const [column, decl] of CAPTURE_REQUESTS_ADDITIVE)
      if (!have.includes(column)) sql.exec(`ALTER TABLE capture_requests ADD COLUMN ${column} ${decl}`);
  const bare = CAPTURE_REQUESTS_SCHEMA.split("\n").filter((l) => !l.trim().startsWith("--")).join("\n");
  for (const stmt of bare.split(";")) if (stmt.trim()) sql.exec(stmt);
}
