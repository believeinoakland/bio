/* answers' published fixtures (K4990, K4993, K4995, K5044): what answers answers to a caller that asks for an ask's
   account whose limits cannot be read, or that ends a standing question, made by answers' own code over its test world
   when the test runs and never stored. A user's test takes the answer from here and does not write it by hand. Each is
   called by a test of answers' own, `fixtures.test.mjs`, which checks the real answer. */
import { answersWorld, V } from "./fixture.mjs";

/* `askAccount` for a member served by an account whose paying limits cannot be judged (no `useCheck`): the refusal
   `{ok: false, reason: "LIMITS_UNREADABLE", detail}`, writing nothing (R30). */
export async function limitsUnreadable({ member = "bob" } = {}) {
  const w = answersWorld();
  const set = await w.accounts.accountReferenceSet({ member, kind: "apikey", secret: "sk-fixture-limits", by: V(member) });
  if (!set.ok) throw new Error(`limitsUnreadable: ${set.reason}`);
  w.a.deps.useCheck = null;
  return w.a.askAccount({ member: V(member) });
}

/* The standing questions' refusals, each from `answers`' own act (R16, R34): `noSuch` the end of a question that is not
   the author's (NO_SUCH_STANDING_QUESTION), for `standingQuestionEnd` and for `standingQuestionEndSet`; `ended` the
   end date asked of a question its author ended (STANDING_ENDED); `ending` the end act's own ok answer. */
export function standingQuestions({ author = V("bob"), other = V("carol") } = {}) {
  const w = answersWorld();
  const q = w.a.standingQuestionSet({ author, question: "Anything new on the budget?", query: "title:budget",
                                      cadence: "daily", ends: "2026-12-31" });
  if (!q.ok) throw new Error(`standingQuestions: ${q.reason}`);
  const noSuch = w.a.standingQuestionEnd({ id: q.id, author: other });
  const noSuchEndSet = w.a.standingQuestionEndSet({ id: q.id, ends: "2027-01-31", author: other });
  const ending = w.a.standingQuestionEnd({ id: q.id, author });
  const ended = w.a.standingQuestionEndSet({ id: q.id, ends: "2027-01-31", author });
  return { id: q.id, noSuch, noSuchEndSet, ending, ended };
}
