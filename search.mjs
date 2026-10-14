import {normal} from "./engine.mjs";
const clean=s=>normal(s).replace(/[ـ]/g,"").replace(/[\u200c-\u200f]/g,"").replace(/[^a-z0-9\u0621-\u064a]+/g," ").replace(/\s+/g," ").trim();
function tokens(s){return clean(s).split(" ").filter(x=>x.length>1).map(x=>{
 if(/^[a-z]+$/.test(x)&&x.length>5)return x.replace(/(ing|ies|ed|es|s)$/,"");
 return x;
})}
const synonymGroups=[
 ["اعلان","اعلانات","ads","advertis","marketing","تسويق"],
 ["برمجه","كود","program","programming","code","coding","developer","تطوير"],
 ["صور","صوره","تصوير","image","photo","photography","illustration"],
 ["فيديو","video","film","movie","مونتاج"],
 ["عقد","عقود","contract","legal","قانون","law"],
 ["تعليم","تعلم","دراسه","education","study","learning","teacher"],
 ["امن","سيبراني","security","cybersecurity","حمايه"],
 ["تجاره","مبيعات","بيع","shop","sales","commerce"],
 ["بحث","research","دراسه","academic"],
 ["وكيل","agents","agent","automation","اوتوماتيكي"]
];
const synonyms=new Map();
for(const group of synonymGroups){
 const normalized=[...new Set(group.flatMap(tokens))];
 for(const word of normalized)synonyms.set(word,normalized.filter(x=>x!==word));
}
export function createSearchIndex(prompts){
 return prompts.map((p,pos)=>{
  const title=clean(p.title),description=clean(p.description),body=clean(p.template);
  return {p,pos,title,description,body,titleTokens:new Set(tokens(p.title)),descriptionTokens:new Set(tokens(p.description)),bodyTokens:new Set(tokens(p.template))};
 });
}
function near(a,b){
 if(Math.abs(a.length-b.length)>1||Math.min(a.length,b.length)<4)return false;
 if(a===b)return true;
 let i=0,j=0,n=0;
 while(i<a.length&&j<b.length){
  if(a[i]===b[j]){i++;j++;continue}
  if(++n>1)return false;
  if(a.length>b.length)i++;else if(b.length>a.length)j++;else{i++;j++}
 }
 return n+(i<a.length?1:0)+(j<b.length?1:0)<=1;
}
export function rankedSearch(index,query="",category="all",favorites=null){
 const q=clean(query),terms=tokens(q);
 const matches=[];
 for(const item of index){
  const p=item.p;
  if(category!=="all"&&p.category!==category)continue;
  if(favorites&&!favorites.has(p.id))continue;
  if(!terms.length){matches.push({p,score:0,pos:item.pos});continue}
  let score=0,miss=false;
  for(const term of terms){
   if(item.titleTokens.has(term)){score+=12;continue}
   if(item.title.includes(term)){score+=9;continue}
   if(item.descriptionTokens.has(term)){score+=6;continue}
   if(item.description.includes(term)){score+=4;continue}
   if(item.bodyTokens.has(term)){score+=2;continue}
   if(item.body.includes(term)){score+=1;continue}
   if([...item.titleTokens].some(w=>near(term,w))){score+=2;continue}
   const aliases=synonyms.get(term)||[];
   const alias=aliases.find(word=>item.titleTokens.has(word)||item.descriptionTokens.has(word)||item.bodyTokens.has(word));
   if(alias){score+=item.titleTokens.has(alias)?5:item.descriptionTokens.has(alias)?3:1;continue}
   miss=true;break;
  }
  if(!miss){if(item.title.includes(q))score+=12;matches.push({p,score,pos:item.pos})}
 }
 matches.sort((a,b)=>b.score-a.score||a.pos-b.pos);
 return matches.map(m=>m.p);
}
