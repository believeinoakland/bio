# waits until the room is quiet: no error events for 120 s and every document indexed; gives up after 8 min (and says so)
import json,subprocess,time,os,sys
from tq import q
def stats():
    r=subprocess.run(["curl","-sS","-m","60","-x",os.environ["HTTPS_PROXY"],"--cacert","/root/.ccr/ca-bundle.crt","-H","Authorization: Bearer "+open('admin.tok').read().strip(),"https://plat-s1.believeinoakland.workers.dev/api/?op=stats"],capture_output=True,text=True)
    try: x=json.loads(r.stdout)['result']; return x['bundles'],x['indexed'],x['textUnits']
    except Exception: return None
f=[{"key":"$metadata.service","operation":"eq","type":"string","value":"plat-s1"},{"key":"$metadata.error","operation":"exists","type":"string"}]
t0=time.time(); status='quiet'
while True:
    now=int(time.time()*1000)
    es=q(now-120000,now,f,limit=5)['result']['events']['events']
    st=stats()
    if not es and st and st[0]==st[1]: break
    if time.time()-t0>480: status='gave up waiting (errors or unindexed documents persist)'; break
    time.sleep(20)
print(f"{time.strftime('%H:%M:%S',time.gmtime())}Z room {status} after {time.time()-t0:.0f} s; stats {st}")
