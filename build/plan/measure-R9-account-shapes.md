# R9 account shapes (ACCOUNT-MEASURE #5)
Real Cloudflare API answers on the throwaway rehearsal account. Ids, tokens and emails are `<redacted>`.

### GET /user/tokens/verify

| method | path | status | error code(s) | message |
|---|---|---|---|---|
| GET | `/user/tokens/verify` | 200 | - | - |

Body:

```json
{"result":{"id":"<redacted>","status":"active"},"success":true,"errors":[],"messages":[{"code":10000,"message":"This API Token is valid and active","type":null}]}
```

### GET /accounts

| method | path | status | error code(s) | message |
|---|---|---|---|---|
| GET | `/accounts` | 200 | - | - |

Body:

```json
{"result":[{"id":"<redacted>","name":"<redacted>'s Account","type":"standard","settings":{"enforce_twofactor":false,"api_access_enabled":null,"access_approval_expiry":null,"abuse_contact_email":null,"oauth_app_access_enabled":true},"legacy_flags":{"enterprise_zone_quota":{"maximum":0,"current":0,"available":0}},"created_on":"2026-10-24T13:42:26.848754Z"}],"result_info":{"page":1,"per_page":20,"total_pages":1,"count":1,"total_count":1},"success":true,"errors":[],"messages":[]}
```

### GET /accounts/<acct>/r2/buckets

| method | path | status | error code(s) | message |
|---|---|---|---|---|
| GET | `/accounts/<acct>/r2/buckets` | 403 | 10042 | Please enable R2 through the Cloudflare Dashboard. |

Body:

```json
{"success":false,"errors":[{"code":10042,"message":"Please enable R2 through the Cloudflare Dashboard."}],"messages":[],"result":null}
```

### GET /accounts/<acct>/containers/applications

| method | path | status | error code(s) | message |
|---|---|---|---|---|
| GET | `/accounts/<acct>/containers/applications` | 401 | 1000 | {"error":"Unauthorized: You do not have access to Cloudflare Containers. Deploying containers requires the Workers Paid plan. Upgrade your plan at https://dash.cloudflare.com/?to=/:account/workers/plans"} |

Body:

```json
{"success":false,"result":null,"messages":[],"errors":[{"code":1000,"message":"{\"error\":\"Unauthorized: You do not have access to Cloudflare Containers. Deploying containers requires the Workers Paid plan. Upgrade your plan at https://dash.cloudflare.com/?to=/:account/workers/plans\"}"}]}
```

### GET /accounts/<acct>/workers/subdomain

| method | path | status | error code(s) | message |
|---|---|---|---|---|
| GET | `/accounts/<acct>/workers/subdomain` | 404 | 10007 | You do not have a workers.dev subdomain. Please go to https://dash.cloudflare.com/?to=/:account/workers/workers-and-pages. Opening the Workers & Pages landing page for the first time will create a workers.dev subdomain automatically. |

Body:

```json
{
  "result": null,
  "success": false,
  "errors": [
    {
      "code": 10007,
      "message": "You do not have a workers.dev subdomain. Please go to https://dash.cloudflare.com/?to=/:account/workers/workers-and-pages. Opening the Workers \u0026 Pages landing page for the first time will create a workers.dev subdomain automatically."
    }
  ],
  "messages": []
}
```

### GET /accounts/<acct>/workers/scripts

| method | path | status | error code(s) | message |
|---|---|---|---|---|
| GET | `/accounts/<acct>/workers/scripts` | 200 | - | - |

Body:

```json
{
  "result": [],
  "success": true,
  "errors": [],
  "messages": []
}
```

### GET /accounts/<acct>/workers/durable_objects/namespaces?per_page=1000

| method | path | status | error code(s) | message |
|---|---|---|---|---|
| GET | `/accounts/<acct>/workers/durable_objects/namespaces?per_page=1000` | 200 | - | - |

Body:

```json
{
  "result": [],
  "success": true,
  "errors": null,
  "messages": null,
  "result_info": {
    "page": 1,
    "per_page": 1000,
    "count": 0,
    "total_count": 0
  }
}
```

### GET /accounts/<acct>/subscriptions

| method | path | status | error code(s) | message |
|---|---|---|---|---|
| GET | `/accounts/<acct>/subscriptions` | 403 | 10000 | Authentication error |

Body:

```json
{"success":false,"errors":[{"code":10000,"message":"Authentication error","documentation_url":"https://developers.cloudflare.com/api/resources/accounts/subresources/subscriptions/methods/get"}],"messages":[],"result":null}
```

### PUT /accounts/<acct>/workers/scripts/bio-plan-probe

| method | path | status | error code(s) | message |
|---|---|---|---|---|
| PUT | `/accounts/<acct>/workers/scripts/bio-plan-probe` | 400 | 100328 | CPU limits are not supported for the Free plan. Switch to a paid plan at https://dash.cloudflare.com/<redacted>/workers/plans to set CPU limits. |

Body:

```json
{
  "result": null,
  "success": false,
  "errors": [
    {
      "code": 100328,
      "message": "CPU limits are not supported for the Free plan. Switch to a paid plan at https://dash.cloudflare.com/<redacted>/workers/plans to set CPU limits.",
      "documentation_url": "https://developers.cloudflare.com/workers/platform/limits/#worker-limits"
    }
  ],
  "messages": []
}
```

### PUT /accounts/<acct>/workers/subdomain

| method | path | status | error code(s) | message |
|---|---|---|---|---|
| PUT | `/accounts/<acct>/workers/subdomain` | 403 | 10031 | Subdomain 'test' is unavailable. Please try a different one. |

Body:

```json
{
  "result": null,
  "success": false,
  "errors": [
    {
      "code": 10031,
      "message": "Subdomain 'test' is unavailable. Please try a different one."
    }
  ],
  "messages": []
}
```

### POST /accounts/<acct>/r2/buckets

| method | path | status | error code(s) | message |
|---|---|---|---|---|
| POST | `/accounts/<acct>/r2/buckets` | 403 | 10042 | Please enable R2 through the Cloudflare Dashboard. |

Body:

```json
{"success":false,"errors":[{"code":10042,"message":"Please enable R2 through the Cloudflare Dashboard."}],"messages":[],"result":null}
```
