/* A RE-EXPORT, NOT A COPY (T33-57; plan Rules (9) item 4). The sub-session contracts moved to `agent-harness`
 * (T33-54, its R5, R7); this file holds none of that code and stays only so the importers that still name this path
 * (control-plane's `members-pin.test.mjs`) read through it until re-pointed. */
export * from "../../agent-harness/src/subsession.mjs";
