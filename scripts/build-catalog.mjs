import {writeFile,mkdir,rm,readFile} from "node:fs/promises";
import {createHash} from "node:crypto";
import {resolve,join} from "node:path";
import {fileURLToPath} from "node:url";
import {buildLibrary,makeShards} from "./library-builder.mjs";
export const SOURCE_URL="https://raw.githubusercontent.com/f/prompts.chat/main/prompts.csv";
export async function buildCatalog({source=SOURCE_URL,out="dist",fetcher=fetch}={}){
 if(source!==SOURCE_URL&&!source.startsWith("file:"))throw new Error("Unreviewed source");
 let csv;
 if(source.startsWith("file:"))csv=await readFile(fileURLToPath(source),"utf8");
 else{
  const res=await fetcher(source,{signal:AbortSignal.timeout(90000)});
  if(!res.ok)throw new Error("Source failed: HTTP "+res.status);
  if(Number(res.headers.get("content-length")||0)>25*1024*1024)throw new Error("CSV too large");
  csv=await res.text();
 }
 if(Buffer.byteLength(csv)>25*1024*1024)throw new Error("CSV too large");
 const {items,stats}=buildLibrary(csv);
 if(items.length<500)throw new Error("Source content unexpectedly small: "+items.length);
 const {files,chunks,counts}=makeShards(items),dest=resolve(out);
 await rm(join(dest,"catalog"),{recursive:true,force:true});await mkdir(join(dest,"catalog"),{recursive:true});
 for(const [path,data] of Object.entries(files))await writeFile(join(dest,path),data,"utf8");
 const manifest={version:1,source:"prompts.chat",sourceUrl:SOURCE_URL,license:"CC0-1.0",
  datasetSha256:createHash("sha256").update(csv).digest("hex"),generatedAt:new Date().toISOString(),count:items.length,stats,counts,chunks};
 await writeFile(join(dest,"catalog-manifest.json"),JSON.stringify(manifest,null,2),"utf8");
 console.log(JSON.stringify({accepted:items.length,sourceRows:stats.sourceRows,duplicates:stats.duplicates,shards:chunks.length}));
 return manifest;
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const arg=process.argv.indexOf("--out"),out=arg<0?"dist":process.argv[arg+1];
 buildCatalog({out}).catch(e=>{console.error(e);process.exitCode=1});
}
