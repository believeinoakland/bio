#!/bin/bash
# Watch job records in git (not doorbells); exit when a watched job has a new entry for BOB or is merge-ready.
cd /home/user/bio
while true; do
  out=$(node ${MAIL:-/home/user/cp-retire/tools/mail.mjs} --product /home/user/bio --tranche T51 check 2>&1 | grep -E "^($1) ")
  if echo "$out" | grep -qE "READ J|· COMPLETE ·.*→ nothing$"; then echo "$(date -u +%T)"; echo "$out"; exit 0; fi
  sleep 30
done
