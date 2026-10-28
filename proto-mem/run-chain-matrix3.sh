#!/bin/bash
# three 8 MB owed files (prepared room /home/user/prep3x8mb), cold process each; then recycle (workerd restarted on persisted state) and forced-GC probes
cd "$(dirname "$0")/.." || exit 1
CH="PROTO_CHAIN_BYTES=16777216,PROTO_CHAIN_REST_MS=20000"
P="--seed=/home/user/seed100 --prepared=/home/user/prep3x8mb"
run() { node proto-mem/measure-chain.mjs $P "$@" 2>&1 | tail -1 | cut -c1-400; }
while IFS='|' read -r name envs; do run --env="$envs" --out="chain-3x8mb-$name"; done <<LIST
base|PROTO_NONE=1
p512|PROTO_PIECE_UNITS=512
p512-auto|PROTO_PIECE_UNITS=512,PROTO_WINDOW_BYTES=auto
p4096-auto|PROTO_PIECE_UNITS=4096,PROTO_WINDOW_BYTES=auto
base-chain|$CH
p4096-auto-chain|PROTO_PIECE_UNITS=4096,PROTO_WINDOW_BYTES=auto,$CH
p512-auto-chain|PROTO_PIECE_UNITS=512,PROTO_WINDOW_BYTES=auto,$CH
LIST
# recycle: a new workerd process every 10 s of wall on the persisted state
run --env=PROTO_NONE=1 --recycle-ms=10000 --out=recycle-3x8mb-base
run --env=PROTO_PIECE_UNITS=512 --recycle-ms=10000 --out=recycle-3x8mb-p512
run --env=PROTO_PIECE_UNITS=512,PROTO_WINDOW_BYTES=auto --recycle-ms=10000 --out=recycle-3x8mb-p512-auto
# forced GC probes (workerd started with --expose-gc through the patched Miniflare)
export MF_PATH=/home/user/mfp/node_modules/miniflare/dist/src/index.js MF_V8_FLAGS=--expose-gc
run --env=PROTO_NONE=1 --gc-every-ms=2000 --out=gc-probe-3x8mb-base
run --env=PROTO_PIECE_UNITS=512,PROTO_WINDOW_BYTES=auto --gc-every-ms=2000 --out=gc-probe-3x8mb-p512-auto
run --env=PROTO_PIECE_UNITS=512,PROTO_WINDOW_BYTES=auto,$CH --gc-every-ms=5000 --out=gc-probe-3x8mb-p512-auto-chain
echo MATRIX DONE
