/* tasks' own refusal rows (requirements: `build/requirements/tasks.md`, R3, R4, R7), and the task grammar C-19.1 (R4).
 * DEC-49: every refusal this module answers carries its code, its row's check id and the member's translation, spread at
 * its site, so a surface shows the same sentence wherever the act is reached.
 *
 * Moved from `queue/checks.mjs` at the module's extraction (T16, N363; K6), each family under its own name (the DEC-49
 * guard and `ROW_CENSUS` read families by name) and each row with its check id and its words; only each row's `where`
 * names this module's file. `QUEUE_MACHINE_CHECKS` (C-32.10, C-32.11), `TASK_ACTOR_CHECKS` (C-76.1), and C-19.1
 * (`checkInboxGrammar`, the task grammar) with its refusal at the write, `QUEUE_INBOX_CHECKS` (C-19.2): this module
 * registers the one function with promotion (at the write, R4's `INBOX_REFUSED`) and with record-core's audit, and its
 * own drain runs it over every candidate task. */

import { isPublicHttpsLocator, ISO_TS_RE, BUNDLE_ID_RE } from "../record-grammar/index.mjs";

const at = (fn, region) => `src/tasks/index.mjs ${fn} > ${region}`;

/* C-32.10, C-32.11 — the machine fence on the two task acts (REC-28 / D-151): a machine credential may surface a task
 * and route it at drain time, and may neither re-address nor close one. Checked by shape before the row is read. */
export const QUEUE_MACHINE_CHECKS = Object.freeze({
  MACHINE_CANNOT_FORWARD: Object.freeze({
    check: 'C-32.10',
    where: at("taskForward", "is-machine-forward"),
    translation: 'Forwarding hands an obligation to a named person, and deciding who is better '
      + 'placed to answer it is a judgement about people rather than about records. The credential '
      + 'that asked here is an automated one: it can surface the work and route it as it arrives, '
      + 'and cannot re-address it. Sign in to forward it.',
  }),
  MACHINE_CANNOT_RESOLVE: Object.freeze({
    check: 'C-32.11',
    where: at("taskResolve", "is-machine-resolve"),
    translation: 'Closing an obligation says the thing the record asked for has been answered, and '
      + 'somebody has to be willing to say that. The credential that asked here is an automated '
      + 'one — it may surface the work and prepare what it needs, and closing work that is '
      + 'nobody\'s is still closing it. Sign in to resolve it.',
  }),
});


/* D-126 / C-76 — THE TASK-ACTOR FENCE'S REFUSAL (REC-4): a member who is neither a task's assignee nor an administrator
 * may not resolve or forward it, unless it is `unassigned` (R3). A selection can meet it, so it carries its sentence.
 * The `detail` names who holds the task; the translation does not, because it is canned. Its code is its own,
 * `TASK_NOT_YOURS` (N382, K606), apart from intent's `NOT_YOURS` (C-111.15), so the control plane's door, which keys rows
 * by code, finds this row and not intent's. */
export const TASK_ACTOR_CHECKS = Object.freeze({
  TASK_NOT_YOURS: Object.freeze({
    check: 'C-76.1',
    where: at("#refuseNotYours", "is-task-actor-fence"),
    translation: 'This task is not yours to act on: it is with another member now, so nothing was done to it. '
      + 'The record says below who holds it. Ask them, or an administrator, if it still needs you.',
  }),
});

/* C-19.2 — the task grammar's refusal at the write (R4; N325): a promotion carrying a `data/inbox.json` whose C-19.1
 * grammar finds an error. New with C-19.1's move out of the catalogue (T14), beside monitoring's `GATHERING_REFUSED`
 * (its C-18.5 refusal), so the code has its translation (DEC-49). The `findings` beside it name each C-19.1 error. */
export const QUEUE_INBOX_CHECKS = Object.freeze({
  INBOX_REFUSED: Object.freeze({
    check: 'C-19.2',
    where: at("inboxCheck", "is-inbox-refused"),
    translation: 'This was not saved: the list of tasks it carries is not written the way the record writes tasks, '
      + 'so a member could be shown something in it that the record cannot vouch for. The findings beside this say '
      + 'which entries and what is wrong with each. Nothing was changed.',
  }),
});

/* ---------------------------------------------------------------------------------------------------------------
 * C-19.1, the task grammar, moved from the catalogue (`checks/bio-checks.mjs`) with its comments (N325; R4).
 * --------------------------------------------------------------------------------------------------------------- */

/* The catalogue's finding shape (legacy-checks' private `f`), for the check that moved here. */
function f(check, severity, message, repairs) {
  const out = { check, severity, message };
  if (repairs) { out.repairable = true; out.repairs = repairs; }
  return out;
}
function asText(v) {
  if (typeof v === 'string') return v;
  return new TextDecoder().decode(v);
}

const TASK_ID_RE = /^TASK-\d{4}-\d{4}-[a-z0-9]+(-[a-z0-9]+)*$/;
const TASK_KIND_ENUM = ['authority-undetermined'];
const TASK_ROLE_ENUM = ['project-manager', 'group-admin', 'member'];
const TASK_STATUS_ENUM = ['open', 'resolved', 'forwarded'];
const TASK_EVENT_ENUM = ['created', 'forwarded', 'resolved', 'folded'];
const MEMBER_ID_RE = /^[a-z0-9][a-z0-9-]{1,40}$/;

/** C-19.1 (error): data/inbox.json task grammar (D-98, INBOX-GRAMMAR.md).
 *
 *  A SIBLING of C-18.5, not a new kind of thing. Bob's ruling puts an
 *  undetermined-authority capture in front of a member, and says the transport
 *  MIGHT ONE DAY BE EMAIL. That clause is the whole reason this is a grammar
 *  and not a table: an email renders in a client we do not control, where a
 *  plausible-looking instruction is exactly what phishing is. So the F5 split
 *  that governs the gathering queue governs this file unchanged: fields a
 *  member READS are length-bounded and newline-free so the exporter renders
 *  them as inert quoted data, and fields a MACHINE acts on are enum- or
 *  pattern-bounded so a malformed value is refused rather than obeyed.
 *
 *  Every bound below copies the C-18.5 pattern for the same kind of field
 *  rather than a similar one, and `refers_to` reuses BUNDLE_ID_RE, the C-1.2
 *  validator, rather than restating the canonical ID grammar. A second grammar
 *  pretending to be the same one is the mistake checkGatheringGrammar's own
 *  comment warns against.
 *
 *  Scoped by declared contract: enforced only where the file is present. One
 *  function at the three places it runs (R4): the promotion check, the audit
 *  check, and the drain's candidate task. */
export function checkInboxGrammar(ctx, findings) {
  const raw = ctx.files.get('data/inbox.json');
  if (!raw) return;
  let g;
  try { g = JSON.parse(asText(raw)); } catch { return; } // C-14.3 reports
  if (typeof g !== 'object' || g === null || Array.isArray(g)) {
    findings.push(f('C-19.1', 'error', 'data/inbox.json must be a JSON object'));
    return;
  }
  const tasks = Array.isArray(g.tasks) ? g.tasks : null;
  if (g.tasks !== undefined && !tasks) {
    findings.push(f('C-19.1', 'error', 'inbox.json tasks must be an array'));
    return;
  }
  const seen = new Set();
  for (let i = 0; i < (tasks || []).length; i++) {
    const tk = tasks[i];
    if (typeof tk !== 'object' || tk === null) { findings.push(f('C-19.1', 'error', `inbox.json tasks[${i}] is not an object`)); continue; }

    if (!TASK_ID_RE.test(tk.id || '')) findings.push(f('C-19.1', 'error', `inbox.json tasks[${i}].id '${tk.id}' does not match the TASK grammar`));
    else if (seen.has(tk.id)) findings.push(f('C-19.1', 'error', `inbox.json tasks[${i}] repeats id '${tk.id}'`));
    else seen.add(tk.id);

    if (!TASK_KIND_ENUM.includes(tk.kind)) findings.push(f('C-19.1', 'error', `inbox.json tasks[${i}].kind '${tk.kind}' must be one of: ${TASK_KIND_ENUM.join(', ')}`));

    /* The two fields a member actually reads. Bounded exactly as C-18.5 bounds
       target.text and target.description, character for character. */
    const sub = tk.subject;
    if (!sub || typeof sub !== 'object') findings.push(f('C-19.1', 'error', `inbox.json tasks[${i}] missing subject block`));
    else {
      if (typeof sub.text !== 'string' || sub.text.length === 0 || sub.text.length > 200 || /[\r\n]/.test(sub.text)) {
        findings.push(f('C-19.1', 'error', `inbox.json tasks[${i}].subject.text must be a nonempty single-line string under 200 chars`));
      }
      if (sub.description !== undefined && (typeof sub.description !== 'string' || sub.description.length > 2000)) {
        findings.push(f('C-19.1', 'error', `inbox.json tasks[${i}].subject.description must be a string under 2000 chars`));
      }
    }

    /* The task points AT a bundle, so this is the canonical ID grammar and not
       a locator. A substrate path here would be the C-6.1 mistake. */
    if (!BUNDLE_ID_RE.test(tk.refers_to || '')) {
      findings.push(f('C-19.1', 'error', `inbox.json tasks[${i}].refers_to '${String(tk.refers_to).slice(0, 40)}' is not a canonical record ID`));
    } else if (ctx.resolveTarget && !ctx.resolveTarget(tk.refers_to)) {
      findings.push(f('C-19.1', 'error', `inbox.json tasks[${i}].refers_to '${tk.refers_to}' does not resolve in the store`,
        ['re-point the task at the successor record', 'resolve the task with a reason if its subject is gone']));
    }

    if (tk.locators !== undefined) {
      if (!Array.isArray(tk.locators)) findings.push(f('C-19.1', 'error', `inbox.json tasks[${i}].locators must be an array`));
      else for (let L = 0; L < tk.locators.length; L++) {
        if (!isPublicHttpsLocator(tk.locators[L])) findings.push(f('C-19.1', 'error', `inbox.json tasks[${i}].locators[${L}] '${String(tk.locators[L]).slice(0, 40)}' is not an https public-host locator`));
      }
    }

    if (tk.assignee !== 'unassigned' && !MEMBER_ID_RE.test(tk.assignee || '')) {
      findings.push(f('C-19.1', 'error', `inbox.json tasks[${i}].assignee '${tk.assignee}' must be a member_id or the literal 'unassigned'`));
    }
    if (!TASK_ROLE_ENUM.includes(tk.assignee_role)) findings.push(f('C-19.1', 'error', `inbox.json tasks[${i}].assignee_role '${tk.assignee_role}' must be one of: ${TASK_ROLE_ENUM.join(', ')}`));
    if (!TASK_STATUS_ENUM.includes(tk.status)) findings.push(f('C-19.1', 'error', `inbox.json tasks[${i}].status '${tk.status}' must be one of: ${TASK_STATUS_ENUM.join(', ')}`));

    if (!ISO_TS_RE.test(tk.created || '')) findings.push(f('C-19.1', 'error', `inbox.json tasks[${i}].created must be an ISO 8601 UTC instant`));
    if (tk.resolved_at !== undefined && tk.resolved_at !== null && !ISO_TS_RE.test(tk.resolved_at)) {
      findings.push(f('C-19.1', 'error', `inbox.json tasks[${i}].resolved_at must be an ISO 8601 UTC instant`));
    }
    /* A resolved task without the instant it resolved at is a status nobody can
       audit, which is the same class of defect as a clock entry silently past
       due (C-11.1). */
    if (tk.status === 'resolved' && !ISO_TS_RE.test(tk.resolved_at || '')) {
      findings.push(f('C-19.1', 'error', `inbox.json tasks[${i}] is resolved but carries no resolved_at instant`));
    }

    /* Append-only, and shaped exactly like a member_expertise row: what
       happened, who did it, when. Who a task was taken FROM is as much a fact
       as who holds it now, so a forward ADDS here and never rewrites. */
    const hist = tk.history;
    if (!Array.isArray(hist) || hist.length === 0) {
      findings.push(f('C-19.1', 'error', `inbox.json tasks[${i}].history must be a nonempty append-only array`));
    } else {
      let prev = '';
      for (let h = 0; h < hist.length; h++) {
        const e = hist[h];
        if (typeof e !== 'object' || e === null) { findings.push(f('C-19.1', 'error', `inbox.json tasks[${i}].history[${h}] is not an object`)); continue; }
        if (!ISO_TS_RE.test(e.at || '')) findings.push(f('C-19.1', 'error', `inbox.json tasks[${i}].history[${h}].at must be an ISO 8601 UTC instant`));
        else { if (prev && e.at < prev) findings.push(f('C-19.1', 'error', `inbox.json tasks[${i}].history[${h}] is out of chronological order`)); prev = e.at; }
        if (!TASK_EVENT_ENUM.includes(e.event)) findings.push(f('C-19.1', 'error', `inbox.json tasks[${i}].history[${h}].event '${e.event}' must be one of: ${TASK_EVENT_ENUM.join(', ')}`));
        /* The actor is a name a member reads beside an event, so it is bounded
           like one rather than left free. */
        if (typeof e.actor !== 'string' || e.actor.length === 0 || e.actor.length > 64 || /[\r\n]/.test(e.actor)) {
          findings.push(f('C-19.1', 'error', `inbox.json tasks[${i}].history[${h}].actor must be a nonempty single-line string under 64 chars`));
        }
      }
      if (hist[0] && hist[0].event !== 'created') {
        findings.push(f('C-19.1', 'error', `inbox.json tasks[${i}].history does not begin with its creation`));
      }
    }
  }
}
