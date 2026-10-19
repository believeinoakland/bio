// The sentences a member reads from this image's answers (R41), read by key from the rows the image carries as data of its
// own (`./says-words.mjs`, written from the plane's word table by `scripts/build-words.mjs`): the image cannot import the
// plane's `setup-words`. A code is an identifier; the English lives only in the carried rows.
import { SAYS_WORDS } from './says-words.mjs';

// Each code's key: the connect screen's row (`screen.connect.refused.<CODE>`) or `refusal.<CODE>` where the table holds
// that, else this module's own row (`agent-runner.*`), one per arm where R31 requires the detail to name which arm it is.
export const SAYS_KEYS = Object.freeze({
  BAD_REQUEST: 'screen.connect.refused.BAD_REQUEST',
  BAD_MEMBER: 'agent-runner.signin.your_teams_civicsmith_could_not_2',
  NOT_THIS_MEMBER: 'screen.connect.refused.NOT_THIS_MEMBER',
  NO_SIGNIN_WAITING: 'refusal.NO_SIGNIN_WAITING',
  BAD_CODE: 'screen.connect.refused.BAD_CODE',
  ATTEMPT_SUPERSEDED: 'screen.connect.refused.ATTEMPT_SUPERSEDED',
  NO_BINARY: 'agent-runner.signin.your_teams_civicsmith_cannot_start',
  NO_ADDRESS: 'agent-runner.signin.claudes_sign_in_gave_no',
  EXITED: 'agent-runner.signin.claudes_sign_in_stopped_before',
  ENDED: 'agent-runner.signin.this_claude_sign_in_was',
  NOT_RUN: 'agent-runner.signin.your_teams_civicsmith_could_not_3',
  SIGNIN_ADDRESS_UNEXPECTED: 'refusal.SIGNIN_ADDRESS_UNEXPECTED',
  NO_OUTCOME: 'agent-runner.signin.claude_gave_no_answer_within',
  TOKEN_SHAPE: 'agent-runner.signin.claude_answered_the_code_but',
  REFUSED: 'agent-runner.signin.claude_did_not_accept_the',
  RUNNER_NOT_STARTED: 'agent-runner.worker.your_teams_civicsmith_could_not',
});

// The carried row of `code`, each `{name}` filled from `vars[name]`; a code or a fill with no row throws (never a blank).
export function says(code, vars = {}) {
  const key = SAYS_KEYS[code];
  const row = key === undefined ? undefined : SAYS_WORDS[key];
  if (typeof row !== 'string') throw new Error(`no carried row for ${code}`);
  return row.replace(/\{([A-Za-z0-9_]+)\}/g, (_, name) => {
    if (!Object.hasOwn(vars, name)) throw new Error(`${key} needs {${name}}`);
    return String(vars[name]);
  });
}
