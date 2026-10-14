import {createHash} from "node:crypto";
import {categories,normal,validate} from "../engine.mjs";
const rules=[
["security",/\b(cyber.?security|penetration|vulnerability|malware|forensic|infosec|ethical hacker)\b/i],
["programming",/\b(developer|coding|programmer|javascript|python|software|algorithm|terminal|linux|sql|regex|debug|devops|frontend|backend)\b/i],
["images",/\b(image|illustrat|photograph|painting|graphic design|midjourney|stable diffusion|artist)\b/i],
["video",/\b(video|film|cinema|screenplay|storyboard|animation|movie|director)\b/i],
["marketing",/\b(marketing|seo|advertis|copywrit|social media|brand strateg|lead generation)\b/i],
["commerce",/\b(e.?commerce|shopping|retail|salesperson|product listing|dropship|merchant)\b/i],
["legal",/\b(legal|lawyer|attorney|contract|court|jurisprudence|compliance)\b/i],
["education",/\b(teacher|tutor|educat|curriculum|study coach|language instructor)\b/i],
["agents",/\b(ai agent|autonomous agent|workflow automati|agentic)\b/i],
["research",/\b(research|scientist|scientific|statistics|data analy|academic)\b/i],
["business",/\b(business|finance|financial|startup|entrepreneur|management|consultant|accountant)\b/i]
];
export function categoryFor(title,content=""){const value=String(title)+" "+String(content).slice(0,160);return rules.find(([,re])=>re.test(value))?.[0]??"writing"}
export function parseCsv(text){
 if(typeof text!=="string")throw new TypeError("CSV expected");
 const rows=[];let row=[],cell="",quoted=false,started=false,source=text.replace(/^\uFEFF/,"");
 for(let i=0;i<source.length;i++){
  const c=source[i];
  if(quoted){if(c==='"'){if(source[i+1]==='"'){cell+='"';i++}else quoted=false}else cell+=c}
  else if(c==='"'&&!started){quoted=true;started=true}
  else if(c===","){row.push(cell);cell="";started=false}
  else if(c==="\n"){row.push(cell.replace(/\r$/,""));if(row.some(v=>v.trim()))rows.push(row);row=[];cell="";started=false}
  else{cell+=c;started=true}
 }
 if(quoted)throw new Error("CSV quote not closed");
 if(started||row.length){row.push(cell.replace(/\r$/,""));if(row.some(v=>v.trim()))rows.push(row)}
 return rows;
}
export function buildLibrary(csv){
 const rows=parseCsv(csv),head=rows.shift()?.map(x=>x.trim().toLowerCase())||[];
 const titleIndex=head.indexOf("act"),textIndex=head.indexOf("prompt"),authorIndex=head.indexOf("contributor"),typeIndex=head.indexOf("type");
 if(titleIndex<0||textIndex<0)throw new Error("CSV must contain act,prompt");
 const seen=new Set(),items=[];let duplicates=0,invalid=0,nonText=0;
 for(const row of rows){
  const title=(row[titleIndex]||"").trim(),body=(row[textIndex]||"").trim(),type=(row[typeIndex]||"TEXT").trim().toUpperCase();
  if(type!=="TEXT"){nonText++;continue}
  if(!title||body.length<30||body.length>12000||title.length>160){invalid++;continue}
  const fingerprint=normal(body).replace(/\s+/g," ").trim();
  if(seen.has(fingerprint)){duplicates++;continue}
  const contributor=(row[authorIndex]||"unknown").replace(/[\x00-\x1f]/g," ").slice(0,110).trim();
  const id="community-"+createHash("sha256").update(title+"\n"+fingerprint).digest("hex").slice(0,24);
  try{
   items.push(validate({id,category:categoryFor(title,body),title,description:"قالب من المجتمع • النص باللغة الأصلية",template:body,license:"CC0-1.0",source:"prompts.chat / "+(contributor||"unknown")}));
   seen.add(fingerprint);
  }catch{invalid++}
 }
 return {items,stats:{sourceRows:rows.length,accepted:items.length,duplicates,invalid,nonText}};
}
export function makeShards(items,chunkSize=200){
 if(!Number.isSafeInteger(chunkSize)||chunkSize<1||chunkSize>2000)throw new Error("Invalid chunk size");
 const chunks=[],files={},counts={};
 for(const [category] of categories){
  const list=items.filter(x=>x.category===category);counts[category]=list.length;
  for(let i=0;i<list.length;i+=chunkSize){
   const path="catalog/"+category+"-"+String(i/chunkSize+1).padStart(2,"0")+".json";
   const subset=list.slice(i,i+chunkSize);files[path]=JSON.stringify(subset);chunks.push({file:path,category,count:subset.length});
  }
 }
 return {files,chunks,counts};
}
