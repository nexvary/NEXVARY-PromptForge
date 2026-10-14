import test from "node:test";
import assert from "node:assert/strict";
import http from "node:http";
import {createHandler} from "../server/index.mjs";
async function withServer(handler,callback){
 const server=http.createServer(handler);
 await new Promise(r=>server.listen(0,"127.0.0.1",r));
 try{return await callback("http://127.0.0.1:"+server.address().port)}
 finally{await new Promise((r,j)=>server.close(e=>e?j(e):r()))}
}
test("health endpoint and no secrets in response",async()=>{
 await withServer(createHandler({env:{AI_API_KEY:"secret-key",AI_MODEL:"sample"}}),async(url)=>{
  const result=await (await fetch(url+"/health")).json();
  assert.deepEqual(result,{ok:true,modelReady:true});assert.ok(!JSON.stringify(result).includes("secret-key"));
 });
});
test("refine rejects invalid input, missing key and forbidden cross-origin",async()=>{
 await withServer(createHandler({env:{ALLOWED_ORIGIN:"https://example.test"}}),async(url)=>{
  const headers={"content-type":"application/json"};
  assert.equal((await fetch(url+"/api/refine",{method:"POST",headers,body:JSON.stringify({prompt:"short"})})).status,400);
  assert.equal((await fetch(url+"/api/refine",{method:"POST",headers,body:JSON.stringify({prompt:"I want to create a reusable study plan."})})).status,503);
  assert.equal((await fetch(url+"/api/refine",{method:"POST",headers:{...headers,origin:"https://other.test"},body:"{}"})).status,403);
 });
});
test("refine calls provider server-side and never exposes key",async()=>{
 const requests=[];
 const fetcher=async(url,options)=>{requests.push({url,options});return {ok:true,json:async()=>({choices:[{message:{content:"Better reusable prompt"}}]})}};
 await withServer(createHandler({env:{AI_API_KEY:"secret-key",AI_MODEL:"mock-model",ALLOWED_ORIGIN:"https://example.test"},requestAI:fetcher}),async(url)=>{
  const response=await fetch(url+"/api/refine",{method:"POST",headers:{"content-type":"application/json","origin":"https://example.test"},body:JSON.stringify({prompt:"Create an educational lesson plan with examples."})});
  assert.equal(response.status,200);
  const data=await response.json();assert.equal(data.refined,"Better reusable prompt");
  assert.ok(!JSON.stringify(data).includes("secret-key"));
 });
 assert.equal(requests.length,1);assert.match(requests[0].options.headers.authorization,/secret-key/);
});
test("request rate limit 10 per minute",async()=>{
 const fetcher=async()=>({ok:true,json:async()=>({choices:[{message:{content:"refined"}}]})});
 await withServer(createHandler({env:{AI_API_KEY:"x"},requestAI:fetcher,clock:()=>100000}),async(url)=>{
  const call=()=>fetch(url+"/api/refine",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({prompt:"Improve this prompt, keep all relevant facts."})});
  for(let i=0;i<10;i++)assert.equal((await call()).status,200);
  assert.equal((await call()).status,429);
 });
});
