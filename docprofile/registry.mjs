/* docprofile's facade: the one entry its callers import.

   The host-stack axis, the shared registry and ladder, the three digests, fidelity, the
   profile record and the event catalogue are `site-profiles`' (split from this module,
   K653 BOB-2), which registers its four built-in handlers itself. Its names are
   re-exported here beside this module's own (the content-type axis, the layered
   `assess`, `readText`), so a caller reaches both through this file and the split moved
   no importer. */
export * from "../site-profiles/index.mjs";
export * from "./pipeline.mjs";
export * from "./readtext.mjs";
export * from "./doctypes/registry.mjs";
