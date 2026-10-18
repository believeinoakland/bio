# Sign-in harness (K3450): signs in as bob-test, starts a subscription sign-in, sends a fake code, times it, reads the trace.
import os,json,urllib.request,sys,time
op=urllib.request.build_opener(urllib.request.ProxyHandler({}))
B='https://biosmoke8.believeinoakland.workers.dev/'
UA='Mozilla/5.0 (X11; Linux x86_64) civicsmith-bob-harness'
def call(o,body,tok=None,timeout=150):
  h={'content-type':'application/json','user-agent':UA}
  if tok: h['authorization']='Bearer '+tok
  req=urllib.request.Request(B+'?op='+o,data=json.dumps(body).encode(),headers=h,method='POST')
  t0=time.time()
  try: r=op.open(req,timeout=timeout); t=r.read(); st=r.status
  except urllib.error.HTTPError as e: t=e.read(); st=e.code
  try: d=json.loads(t)
  except Exception: d={'raw':t[:300].decode('utf-8','replace')}
  return st,round(time.time()-t0,1),d
def scrub(d):
  s=json.dumps(d)
  for k in ('token','session','address'): pass
  return s
st,dt,d=call('login',{'handle':'bob-test','password':os.environ['JOURNEY_ADMIN_PASSWORD'],'device':'bob-harness'})
r=d.get('result',d); tok=r.get('session') or r.get('token') or (r.get('session_token'))
print('login',st,dt,'token' if tok else json.dumps(d)[:300])
if not tok: sys.exit(1)
def get(o,q,tok):
  h={'user-agent':UA,'authorization':'Bearer '+tok}
  req=urllib.request.Request(B+'?op='+o+'&'+q,headers=h)
  try: r=op.open(req,timeout=60); return json.loads(r.read())
  except urllib.error.HTTPError as e: return json.loads(e.read())
dis=get('disclosureof','member=bob-test',tok); dr=dis.get('result',dis); print('disclosure',json.dumps(dr)[:200])
if dr.get('shown') is not True:
  st,dt,d=call('disclosureshown',{'member':'member:bob-test','version':dr.get('version','')},tok); print('disclosureshown',st,json.dumps(d)[:200])
st,dt,d=call('reauth',{'password':os.environ['JOURNEY_ADMIN_PASSWORD']},tok); print('reauth',st,dt,(d.get('result',d) or {}).get('ok'))
st,dt,d=call('subscriptionsignin',{'step':'start'},tok)
r=d.get('result',d)
print('start',st,dt,{k:(v if k!='address' else str(v)[:60]+'…') for k,v in r.items()})
attempt=r.get('attempt')
code=sys.argv[1] if len(sys.argv)>1 else 'harnessFAKEcode0123456789abcdef#harnessstate01'
body={'step':'code','code':code}
if attempt: body['attempt']=attempt
st,dt,d=call('subscriptionsignin',body,tok)
print('code',st,dt,json.dumps(d.get('result',d))[:700])
st,dt,d=call('signintrace',{},tok)
print('trace',st,dt,json.dumps(d.get('result',d))[:1500])
