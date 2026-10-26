/* screens-settings R59 (T51; K3807; DEC-330 A11; DEC-335, DEC-336 (8); census A11): Settings › Glossary, the registry's `glossary`,
   no act. It reads nothing and calls no op: the title and its sub-line, the sentence that says how a term explains itself, two groups
   of terms (money and budgets; how the record is kept honest) each with its name and its definition, what each of the sixteen item
   states allows (its chip, what it means, what a member can and cannot then do), and the note that a document brings terms of its own.
   Every sentence is a word read by key (R39). A term in text elsewhere explains itself on rest as a card and opens this page when
   chosen (the kit's `cs.term`, interface-shell R95). Reached from `account` (R57) and from terms; the Settings list (R17) does not
   name it, as the design's does not. Every function is self-contained (interface-shell R21). */

export const glossary = {
  id: "glossary",

  reads() { return {}; },

  render(cs) {
    const W = cs.w, S = "screen.glossary.";
    const MONEY = ["acfr", "cafr", "gpf", "fy"], HONEST = ["fingerprint", "timestamp", "signature", "manifest", "provenance"];
    const STATES = ["review", "reviewed", "retired", "open", "concluded", "deferred", "dismissed", "divided", "published", "waiting", "planned", "active", "resolved", "abandoned", "flagged", "watched"];
    // the words hold no `.cannot` for these states (the design's table)
    const NO_CANNOT = ["waiting", "planned", "active", "flagged", "watched"];
    const terms = (group, slugs) => cs.sheet(slugs.map((t) => cs.row("", `<b>${W("glossary.term." + t)}</b>`, "", W(S + group + "." + t))).join(""));
    // the state's chip, which explains itself (the kit's `cs.stateChip`, interface-shell R95, for each of the sixteen); the state's own name where the kit draws none
    const chip = (k) => (typeof cs.stateChip === "function" ? String(cs.stateChip(k) || "") : "") || `<b>${W("state.item." + k + ".name")}</b>`;
    const state = (k) => cs.row(chip(k), W("state.item." + k + ".means"), "", `${W("state.item." + k + ".can")}${NO_CANNOT.indexOf(k) < 0 ? " " + W("state.item." + k + ".cannot") : ""}`);
    return [
      cs.title(),
      `<p class="mk-small">${W(S + "sub")}</p>`,
      `<p>${W(S + "intro")}</p>`,
      cs.sec(S + "money.heading", terms("money", MONEY)),
      cs.sec(S + "honest.heading", terms("honest", HONEST)),
      cs.sec(S + "states.heading", cs.sheet(STATES.map(state).join(""))),
      `<p class="mk-note">${W(S + "documentterms")}</p>`,
    ].join("");
  },

  acts: [],
};
