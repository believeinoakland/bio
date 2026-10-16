// Fake Anthropic Messages API (SSE). Scripted: each non-trivial request gets the next step of SCRIPT.
import { createServer } from 'node:http';
export function fakeApi({ script, latencyMs = 0, cycle = false }) {
  const log = []; let step = 0;
  const server = createServer((req, res) => {
    const chunks = [];
    req.on('data', d => chunks.push(d));
    req.on('end', async () => {
      const t = Date.now(); const body = Buffer.concat(chunks).toString();
      let j = null; try { j = JSON.parse(body); } catch {}
      const url = req.url.split('?')[0];
      log.push({ t, url, model: j?.model, tools: j?.tools?.length, bytes: body.length, msgs: j?.messages?.length, stream: !!j?.stream, auth: !!(req.headers.authorization||req.headers['x-api-key']) });
      if (!url.startsWith('/v1/messages') || url.includes('count_tokens') || !j) { res.writeHead(200, {'content-type':'application/json'}); return res.end('{}'); }
      // side requests (haiku title/quota) get a plain text answer and do not consume the script
      const isMain = (j.tools?.length ?? 0) > 0 || !/haiku/.test(j.model||'');
      const s = isMain ? script[(cycle ? step++ % script.length : Math.min(step++, script.length-1))] : { text: 'x' };
      if (latencyMs) await new Promise(r => setTimeout(r, latencyMs));
      const ev = (e, d) => res.write(`event: ${e}\ndata: ${JSON.stringify({type:e,...d})}\n\n`);
      if (!j.stream) {
        res.writeHead(200, {'content-type':'application/json'});
        return res.end(JSON.stringify({id:'msg_1',type:'message',role:'assistant',model:j.model,content:[s.tool?{type:'tool_use',id:'toolu_'+step,name:s.tool,input:s.input}:{type:'text',text:s.text}],stop_reason:s.tool?'tool_use':'end_turn',usage:{input_tokens:10,output_tokens:5}}));
      }
      res.writeHead(200, {'content-type':'text/event-stream','cache-control':'no-cache'});
      ev('message_start',{message:{id:'msg_'+step,type:'message',role:'assistant',model:j.model,content:[],stop_reason:null,usage:{input_tokens:Math.ceil(body.length/4),output_tokens:1}}});
      if (s.tool) {
        ev('content_block_start',{index:0,content_block:{type:'tool_use',id:'toolu_'+step,name:s.tool,input:{}}});
        ev('content_block_delta',{index:0,delta:{type:'input_json_delta',partial_json:JSON.stringify(s.input)}});
      } else {
        ev('content_block_start',{index:0,content_block:{type:'text',text:''}});
        ev('content_block_delta',{index:0,delta:{type:'text_delta',text:s.text}});
      }
      ev('content_block_stop',{index:0});
      ev('message_delta',{delta:{stop_reason:s.tool?'tool_use':'end_turn',stop_sequence:null},usage:{output_tokens:5}});
      ev('message_stop',{});
      res.end();
    });
  });
  return { server, log, reset: () => { step = 0; }, listen: () => new Promise(r => server.listen(0, '127.0.0.1', () => r(server.address().port))) };
}
