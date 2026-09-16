/* THE ESTATE HOLD PREDICATE — one MACHINE develops this repository at a time.
 *
 * A MODULE rather than an inline arm for the reason `plancheck.mjs` already
 * states of its other predicates: plancheck self-executes and cannot be
 * imported, so an inline predicate would have to be COPIED into whatever drives
 * it, and two readers of one question is how two answers were allowed to differ.
 * `rowdesign.mjs` and `corpuscheck.mjs` are the shape.
 *
 * The rule it enforces, and why it is an instrument and not a convention:
 * claims keep two SESSIONS out of one tree and worktrees keep two out of one
 * checkout, and NEITHER KNOWS A SECOND MACHINE EXISTS. The file's first version
 * relied on a session releasing the hold at stand-down — a voluntary act by a
 * session that may be suspended before it gets there, which is what happened
 * within hours: the integrator was suspended mid-flight and the hold outlived
 * the machine's work by sixteen hours. An instrument that exists and is
 * OPTIONAL is the failure M0-41 measured; this one is not optional.
 *
 * TIME IS ISO 8601 UTC WITH THE Z. A bare date let two machines in different
 * zones disagree by a day about whether a hold had expired, and an expiry that
 * is not a fact in one clock is not an expiry.
 *
 * ONE LINE, because two claimants must COLLIDE. Spread across a table, two
 * machines claiming at once edit different rows and git auto-merges BOTH into a
 * file naming one machine and another's expiry — a textual merge of a semantic
 * conflict. One line forces the conflict git is good at. */
export const HOLD_RE =
  /^\s*HOLD:\s*machine=([^|]+?)\s*\|\s*account=([^|]+?)\s*\|\s*status=([A-Z]+)\s*\|\s*through=(\S+)\s*$/m;

/** Pure: text in, verdict out, so a control can drive every arm without a repository.
 *  Kinds: theirs · ours · ours-expired · free · unreadable · unparseable · badtime. */
export function estateVerdict(holdText, thisMachine, nowIso) {
  if (!holdText) return { kind: "unreadable" };
  const m = HOLD_RE.exec(holdText);
  if (!m) return { kind: "unparseable" };
  const [, machine, account, status, through] = m;
  /* STRICT, and the control is why. `Date.parse` accepts a date-time with NO zone
     and reads it as LOCAL time, so two machines in different zones would disagree
     about the same string — the very disagreement the Z was added to remove, coming
     back through the parser rather than through the prose. A bare DATE is unambiguous
     by spec (UTC) and still refused, because one form is cheaper to get right than
     two and the file states one. */
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?Z$/.test(through))
    return { kind: "badtime", through };
  const t = Date.parse(through);
  if (Number.isNaN(t)) return { kind: "badtime", through };
  const expired = t <= Date.parse(nowIso);
  if (status === "RELEASED" || expired) {
    if (machine === thisMachine && status !== "RELEASED")
      return { kind: "ours-expired", machine, through };
    return { kind: "free", machine, status, through };
  }
  return machine === thisMachine
    ? { kind: "ours", machine, account, through }
    : { kind: "theirs", machine, account, through };
}
