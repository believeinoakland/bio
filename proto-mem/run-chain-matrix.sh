#!/bin/bash
# the PROTO_WINDOW_BYTES / PROTO_CHAIN_BYTES matrix: cold process each, seed100, 1.9 MB (the seed's own owed reading) and 8 MB (--extra=8000000 --only-extra)
cd "$(dirname "$0")/.." || exit 1
CH="PROTO_CHAIN_BYTES=16777216,PROTO_CHAIN_REST_MS=20000"
for size in ${SIZES:-1.9mb 8mb}; do
  if [ $size = 8mb ]; then X="--prepared=/home/user/prep8mb"; else X=""; fi
  while IFS='|' read -r name envs; do
    node proto-mem/measure-chain.mjs --seed=/home/user/seed100 $X --env="$envs" --out="chain-$size-$name" 2>&1 | tail -1 | cut -c1-600
  done <<LIST
base|PROTO_NONE=1
p512|PROTO_PIECE_UNITS=512
p512-auto|PROTO_PIECE_UNITS=512,PROTO_WINDOW_BYTES=auto
p4096-auto|PROTO_PIECE_UNITS=4096,PROTO_WINDOW_BYTES=auto
base-chain|$CH
p512-chain|PROTO_PIECE_UNITS=512,$CH
p512-auto-chain|PROTO_PIECE_UNITS=512,PROTO_WINDOW_BYTES=auto,$CH
p4096-auto-chain|PROTO_PIECE_UNITS=4096,PROTO_WINDOW_BYTES=auto,$CH
LIST
done
echo MATRIX DONE
