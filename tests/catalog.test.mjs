import test from "node:test";
import assert from "node:assert/strict";
import {parseCsv,buildLibrary,makeShards,categoryFor} from "../scripts/library-builder.mjs";
const csv=[
'act,prompt,for_devs,type,contributor',
'Python Developer,"Create a small program, then test it with a robust unit test.",TRUE,TEXT,alice',
'Graphic Artist,"Generate a realistic product, with ""accurate"" proportions and shadows.",FALSE,TEXT,bob',
'Duplicate,"Create a small program, then test it with a robust unit test.",TRUE,TEXT,x',
'Short,bad,FALSE,TEXT,x',
'Story Writer,"Write a story with a\\nline break and a clear, well-developed ending.",FALSE,TEXT,author'
].join("\r\n").replace("\\n","\n");
test("CSV parser handles quoted comma, quote, CRLF and multiline records",()=>{
 const rows=parseCsv("\uFEFF"+csv);
 assert.equal(rows[0][0],"act");
 assert.equal(rows[2][1],'Generate a realistic product, with "accurate" proportions and shadows.');
 assert.match(rows[5][1],/\n/);
 assert.throws(()=>parseCsv('act,prompt\nbroken,"unterminated'));
});
test("builder deduplicates and rejects invalid content",()=>{
 const {items,stats}=buildLibrary(csv);
 assert.equal(items.length,3);
 assert.equal(stats.duplicates,1);
 assert.equal(stats.invalid,1);
 assert.equal(items[0].category,"programming");
 assert.equal(items[1].category,"images");
 assert.ok(items.every(p=>p.license==="CC0-1.0"&&p.id.startsWith("community-")));
});
test("categories have predictable fallback",()=>{
 assert.equal(categoryFor("Contract Lawyer"),"legal");
 assert.equal(categoryFor("Unfamiliar Role"),"writing");
});
test("shards account for every imported prompt",()=>{
 const rows=buildLibrary(csv).items,{files,chunks,counts}=makeShards(rows,1);
 assert.equal(chunks.reduce((n,c)=>n+c.count,0),rows.length);
 assert.equal(Object.values(counts).reduce((n,c)=>n+c,0),rows.length);
 assert.equal(Object.values(files).flatMap(s=>JSON.parse(s)).length,rows.length);
});
test("unsupported CSV headers are rejected",()=>{
 assert.throws(()=>buildLibrary("title,body\nhello,world"),/act,prompt/);
});
