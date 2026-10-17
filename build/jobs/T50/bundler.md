# bundler (T50)

**Status** · session_0113McfBYeb5TMfMs7CF8GJq · depth 2 · WORKING · handled B1

## J1 · REPORT

Installer change owed for R33 (N1170), for BOB; its job is T50-78 (layer 11).

`release-assemble.mjs` now writes `instance_type` into each class's `container` part (inside the signed bytes), read from the member's `wrangler.jsonc` `containers` block. The installer does not pass it on, in two places in `newgroup/src/index.mjs`:
1. `containerDescriptor(bytes)` (line 880) returns only `{class_name, image, max_instances, bind}`, so a part's `instance_type` is dropped on reading.
2. `placeContainer` (line 977) creates the Containers application with `configuration: { image: d.image }` alone, so a team's container runs at the platform's default size (1/16 vCPU, 256 MiB; agent-runner's first start took 27 s at that size, per its wrangler comment), not the declared `standard-1`. The create body wants `configuration: { image, instance_type }` where the part states one, and nothing where it states none. A rollout of an existing application (`target_configuration`) should carry the same field.
The value is a size name string (`standard-1`) or the platform's custom size block, copied as stated. The installer's tests (`newgroup/test/requirements.test.mjs` around lines 929 and 1046) pin the create body and will need the field in a case that states one.
