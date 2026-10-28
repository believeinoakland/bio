// The refusal sentences the doorbell answers with, each as the product's own row (checks.mjs, K3810). A test compares
// with word(key) or localize(id, en) by equality, and never holds a sentence's text in a string of its own.
import { word, localize } from "../../../src/setup-words/index.mjs";

export const EXPECT = {
  NO_SUCH_KNOCK: word("refusal.NO_SUCH_KNOCK"),
  KNOCKER_SECRET_WEAK: word("refusal.KNOCKER_SECRET_WEAK"),
  KNOCK_DISCARDED: word("refusal.KNOCK_DISCARDED"),
  RESOLVE_NO_REASON: localize("doorbell.checks.changing_a_knocks_status_records", "Changing a knock's status records why, in your own words, and no reason was given, or it is longer than 2,000 characters. Write one. Nothing was written."),
  KNOCK_BYTES_CHANGED: word("screen.inbox.view.changed"),
  RATE_IP: localize("doorbell.checks.your_material_was_not_received", "Your material was not received. This team's inbox is not taking any more material from where you are sending it just now. It is a limit on how fast one sender may knock, not a judgement about you or about what you sent, and it lifts on its own shortly — the bound is published beside this message. Nothing was stored and nothing was read, so send the same material again a little later and it will arrive. The team can see how often its doorbell turns people away."),
  RATE_GLOBAL: word("refusal.RATE_GLOBAL"),
  KNOCK_ENVELOPE_TOO_LARGE: word("refusal.KNOCK_ENVELOPE_TOO_LARGE"),
  KNOCK_PAYLOAD_TOO_LARGE: localize("doorbell.checks.this_teams_inbox_read_your", "This team's inbox read your material and cannot keep it, because it is larger than this inbox stores. That is a fact about how this team has set its Civicsmith up rather than a judgement about what you sent — a team that has configured evidence storage can keep far more — and the size this one can keep is published beside this message. Nothing was stored. Send something smaller, or ask the team's members how to get the whole of it to them. The team can see how often its doorbell turns people away."),
  KNOCK_EMPTY: word("refusal.KNOCK_EMPTY"),
};
