/* file-safety's tables (R1–R37). Each row about a file is keyed by the capture's digest and carries the capture's home
 * bundle once the register names one (`bundle_id`), so a bundle's purge removes its notes, holds, safe views and safe
 * copies (R25; record-core R22, R46). No table holds a member beside a file for an open, a view, a check or a copy
 * (R10): the only member a file's row names is the one who acted to release a hold (R17, an act of record). The tools'
 * rows name the administrator who added each, beside no file; their credentials are `credentials`' (R28). */

export const FILE_SAFETY_SCHEMA = `
-- R1: the scan and render queue, one row per digest.
CREATE TABLE IF NOT EXISTS fs_files (
  capture_sha TEXT PRIMARY KEY,
  bundle_id TEXT,
  queued_at TEXT NOT NULL,
  render_state TEXT NOT NULL DEFAULT 'queued',
  render_route TEXT,
  render_sha TEXT,
  render_pages INTEGER,
  render_source_pages INTEGER,
  render_truncated INTEGER,
  render_reason TEXT,
  render_detail TEXT,
  rendered_at TEXT
);
-- R2, R3: the verdict notes, append-only.
CREATE TABLE IF NOT EXISTS fs_notes (
  seq INTEGER PRIMARY KEY AUTOINCREMENT,
  note_id TEXT NOT NULL UNIQUE,
  capture_sha TEXT NOT NULL,
  bundle_id TEXT,
  kind TEXT NOT NULL,
  tool TEXT NOT NULL,
  engine TEXT,
  engine_version TEXT,
  signatures TEXT,
  scanned_at TEXT NOT NULL,
  result TEXT NOT NULL,
  findings TEXT NOT NULL,
  reason TEXT,
  checks TEXT,
  vendor_ref TEXT
);
CREATE INDEX IF NOT EXISTS fs_notes_capture ON fs_notes (capture_sha, seq);
-- R16–R19: scan holds and their release.
CREATE TABLE IF NOT EXISTS fs_holds (
  seq INTEGER PRIMARY KEY AUTOINCREMENT,
  capture_sha TEXT NOT NULL,
  bundle_id TEXT,
  names TEXT NOT NULL,
  engines TEXT NOT NULL,
  note_ids TEXT NOT NULL,
  placed_at TEXT NOT NULL,
  state TEXT NOT NULL,
  pending_by TEXT,
  pending_reason TEXT,
  pending_at TEXT,
  released_by TEXT,
  released_reason TEXT,
  released_how TEXT,
  release_note_id TEXT,
  release_tool TEXT,
  release_engine TEXT,
  released_at TEXT
);
CREATE INDEX IF NOT EXISTS fs_holds_capture ON fs_holds (capture_sha, state);
-- R13, R14, R36: deeper checks. Who asked is not kept (R10).
CREATE TABLE IF NOT EXISTS fs_deeper (
  check_id TEXT PRIMARY KEY,
  capture_sha TEXT NOT NULL,
  bundle_id TEXT,
  state TEXT NOT NULL,
  requested_at TEXT NOT NULL,
  started_at TEXT,
  done_at TEXT,
  checks TEXT NOT NULL DEFAULT '[]',
  pending TEXT NOT NULL DEFAULT '[]',
  note_id TEXT,
  releases TEXT
);
CREATE INDEX IF NOT EXISTS fs_deeper_capture ON fs_deeper (capture_sha, requested_at);
-- R33: safe copies. Who asked is not kept (R10).
CREATE TABLE IF NOT EXISTS fs_copies (
  capture_sha TEXT PRIMARY KEY,
  bundle_id TEXT,
  state TEXT NOT NULL,
  queued_at TEXT NOT NULL,
  tool_id TEXT,
  copy_sha TEXT,
  content_type TEXT,
  removed TEXT,
  reason TEXT,
  detail TEXT,
  note_id TEXT,
  made_at TEXT
);
-- R27–R32: the group's security tools, without credentials.
CREATE TABLE IF NOT EXISTS fs_tools (
  tool_id TEXT PRIMARY KEY,
  provider_id TEXT NOT NULL,
  kinds TEXT NOT NULL,
  use TEXT NOT NULL,
  state TEXT NOT NULL,
  handling TEXT NOT NULL,
  handling_digest TEXT NOT NULL,
  monthly_limit INTEGER NOT NULL,
  added_by TEXT NOT NULL,
  added_at TEXT NOT NULL,
  tested_at TEXT,
  off_reason TEXT,
  detail TEXT,
  region TEXT,
  host TEXT,
  config TEXT NOT NULL DEFAULT '{}',
  confirm_retention INTEGER NOT NULL DEFAULT 0,
  seq INTEGER NOT NULL
);
-- R13, R31: each tool's use in a calendar month (UTC), counts only.
CREATE TABLE IF NOT EXISTS fs_tool_usage (
  tool_id TEXT NOT NULL,
  month TEXT NOT NULL,
  used INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (tool_id, month)
);
-- R31: the administrators' notice of a tool's adds, tests, removals and switches; no file is named.
CREATE TABLE IF NOT EXISTS fs_tool_events (
  seq INTEGER PRIMARY KEY AUTOINCREMENT,
  tool_id TEXT NOT NULL,
  event TEXT NOT NULL,
  at TEXT NOT NULL
);
-- R35: this module's counts by UTC hour, kind and number only.
CREATE TABLE IF NOT EXISTS fs_counts (
  hour INTEGER NOT NULL,
  kind TEXT NOT NULL,
  n INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (hour, kind)
);
`;

/* R25 (record-core R21, R46): the tables, each declared with its classes. A file's rows are keyed to its home bundle
   and cleared by that bundle's purge; the tools, their use, their events and the counts are the group's, not any
   bundle's, and stay (record-core R23's exemption, as `credentials` keeps its tally). */
const fileRow = (name) => ({ name, keys: ["bundle_id"], purge: "clear", expunge: "none", export: "admin-only",
                             sight: "source", derive: "stored", version_chain: false });
const groupRow = (name) => ({ name, purge: "exempt", expunge: "none", export: "never", sight: "group", derive: "stored",
                              version_chain: false });
export const FILE_SAFETY_TABLES = Object.freeze([
  fileRow("fs_files"), fileRow("fs_notes"), fileRow("fs_holds"), fileRow("fs_deeper"), fileRow("fs_copies"),
  groupRow("fs_tools"), groupRow("fs_tool_usage"), groupRow("fs_tool_events"), groupRow("fs_counts"),
].map((d) => Object.freeze(d)));
