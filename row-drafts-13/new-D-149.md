### D-149 · queued — **A RECORDS REQUEST CANNOT SAY WHICH LAWS GOVERN IT: the action carries no citation of the federal, state or local records laws that apply to the agency asked, so the design reads jurisdiction-blind.** RULED by Bob, 2026-09-22: every records law governing the agency asked applies, layered by the agency's level. — owner RECORD.
order: directly after D-148, its sibling at M10 beside D-147 (SCHEDULER #12, 2026-09-22; BOB #26's inbox entry, item 2)
milestone: M10
interface: I3 and I5 — the action's citation list; the integrator mints and classifies the ICs.
design: `docs/architecture/BIO_Case_Making_v0_1.md` §2 (*A RECORDS REQUEST NAMES EVERY LAW THAT GOVERNS IT*, Bob's ruling of 2026-09-22).
depends-on: none — `action` is built.
scope: a records-request action carries a list of citations, each with its level (federal, state or local), set by a member's authored act; a machine credential is refused by name, and a machine PROPOSAL, if built, is labelled machine work. An empty list reads UNDETERMINED with its sentence, never a default; the plane encodes no law's rules; `cpra_request` actions read unchanged.
accepts-when: a member's list lands and reads back; an action with none reads undetermined, never federal; a machine credential's list is refused by name. How a liar passes it: a citation filled in at creation, so the empty-list arm reads the bytes. NEGATIVE CONTROL: default an empty list to a federal citation, and the undetermined arm fails by name.
added: 2026-09-22 · SCHEDULER #12 drafted it; SCHEDULER #13 placed it, re-verified on `8e2c146c` (BOB #26's inbox entry, item 2; D-149's DEBT row; keeps its `D-` id).
