# BOB's own context, measured (K5158): the last model call's input (fresh + cache read + cache write) in this
# session's transcript, against the window. get_session's context_usage reads 0 during a turn, and estimates ran
# about half the true figure, so three BOBs passed 40 % unseen. Usage: python3 build/plan/context.py [window]
import glob,json,os,sys
win=int(sys.argv[1]) if len(sys.argv)>1 else 1000000
f=max(glob.glob(os.path.expanduser("~/.claude/projects/*/*.jsonl")),key=os.path.getmtime)
last=None
for l in open(f):
    try: m=json.loads(l).get("message")
    except Exception: continue
    if isinstance(m,dict) and m.get("usage"): last=m["usage"]
n=last["input_tokens"]+last.get("cache_read_input_tokens",0)+last.get("cache_creation_input_tokens",0)
print(f"context {n} of {win} = {100*n/win:.0f} %" + ("  REFRESH NOW (mechanics §5.8)" if n>=0.4*win else ""))
