import json,subprocess,sys,time,os
def q(frm,to,filters,limit=100,view="events",extra=None):
    body={"queryId":"plat3","timeframe":{"from":frm,"to":to},"view":view,"limit":limit,"parameters":{"filters":filters,"filterCombination":"and"}}
    if extra: body.update(extra)
    r=subprocess.run(["curl","-sS","-x",os.environ["HTTPS_PROXY"],"--cacert","/root/.ccr/ca-bundle.crt","-X","POST","-H","content-type: application/json","-d",json.dumps(body),
      "https://api.cloudflare.com/client/v4/accounts/20b533579290b9b93168345edd3b7f72/workers/observability/telemetry/query"],capture_output=True,text=True)
    return json.loads(r.stdout)
if __name__=="__main__":
    f=[{"key":"$metadata.service","operation":"eq","type":"string","value":"plat-s1"},{"key":"$metadata.error","operation":"exists","type":"string"}]
    now=int(time.time()*1000)
    j=q(now-3*3600*1000,now,f,limit=5)
    print(json.dumps(j)[:3000])
