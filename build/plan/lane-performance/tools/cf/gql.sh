#!/bin/sh
# PERFORMANCE: read-only Cloudflare GraphQL analytics (the proxy injects the credential; never printed).
# usage: CF_ACCOUNT=<the one permitted account id> gql.sh <query-file>   (ACCOUNT in the file is replaced by it)
sed "s/ACCOUNT/$CF_ACCOUNT/" "$1" | python3 -c "import json,sys;print(json.dumps({'query':sys.stdin.read()}))" | curl -s https://api.cloudflare.com/client/v4/graphql -H 'content-type: application/json' --data @-
