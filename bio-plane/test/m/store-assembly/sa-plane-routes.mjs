/* store-assembly R6 (K5052; the route-map parity START asks): run as its own process, never imported. It builds plane's
   `Store` over plane's own fixture (its op declarations are registered once per process, op-declarations R81, so plane's
   class and this module's assembly cannot share one) and prints the sorted keys of `Store.routes` for the address given
   as its second argument, as JSON, so `sa-parity.test.mjs` compares them with `assembleStore`'s over the same fixture ctx.
   Plane is later in the order than this module (P4): it is never imported here; the test hands its fixture's path as the
   first argument, and this process runs it apart. */
const { store } = await import(process.argv[2]);
const path = process.argv[3] || "/x";
const p = await store();
process.stdout.write(JSON.stringify(Object.keys(p.routes(path, null)).sort()));
process.exit(0);
