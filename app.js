import {categories,seed,filter,vars,fill,compose,merge} from "./engine.mjs";
const el=id=>document.getElementById(id), KEY="nexvary-promptforge-v1";
let stored={};try{stored=JSON.parse(localStorage.getItem(KEY)||"{}")}catch{}
let prompts=seed.slice();let visibleLimit=48;try{if(Array.isArray(stored.added))prompts=merge(prompts,stored.added.slice(0,10000)).prompts}catch{}
let favorites=new Set(Array.isArray(stored.favorites)?stored.favorites:[]),cat="all",favOnly=false,selected=prompts[0]?.id||null,output="";
const titles=Object.fromEntries(categories);titles.all="كل الأقسام";
const node=(tag,cls,text)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(text!==undefined)e.textContent=text;return e};
const save=()=>{try{localStorage.setItem(KEY,JSON.stringify({added:prompts.filter(p=>!p.id.startsWith("pf-")&&!p.id.startsWith("community-")),favorites:[...favorites]}))}catch{alert("التخزين المحلي غير متاح")}};
let timer;function toast(s){el("toast").textContent=s;el("toast").hidden=false;clearTimeout(timer);timer=setTimeout(()=>el("toast").hidden=true,3500)}
function view(v){for(const name of ["library","create","data"])el("view-"+name).hidden=name!==v;document.querySelectorAll("nav button").forEach(b=>b.classList.toggle("active",b.dataset.view===v))}
document.querySelectorAll("nav button").forEach(b=>b.addEventListener("click",()=>view(b.dataset.view)));
function renderCats(){const target=el("categories");target.replaceChildren();for(const id of ["all",...categories.map(x=>x[0])]){const count=prompts.filter(p=>id==="all"||p.category===id).length;const b=node("button","category"+(id===cat?" selected":""),titles[id]);b.append(node("small","",String(count)));b.onclick=()=>{cat=id;visibleLimit=48;renderCats();renderCards()};target.append(b)}}
function found(){return filter(prompts,el("search").value,cat,favOnly?favorites:null)}
function renderCards(){const list=found(),target=el("cards");target.replaceChildren();el("countAll").textContent=prompts.length;el("countFound").textContent=list.length+" قالب متاح • يعرض "+Math.min(visibleLimit,list.length);el("more").hidden=list.length<=visibleLimit;el("empty").hidden=list.length>0;for(const p of list.slice(0,visibleLimit)){const card=node("article","card"+(p.id===selected?" selected":""));card.tabIndex=0;card.setAttribute("role","button");const top=node("div","card-top");top.append(node("span","","✦"),node("small","",titles[p.category]));card.append(top,node("h4","",p.title),node("p","",p.description));const bottom=node("div","card-bottom"),star=node("button","",favorites.has(p.id)?"★":"☆");star.type="button";star.setAttribute("aria-label","تبديل المفضلة");star.onclick=e=>{e.stopPropagation();favorites.has(p.id)?favorites.delete(p.id):favorites.add(p.id);save();renderCards()};bottom.append(node("small","","قالب قابل للتخصيص"),star);card.append(bottom);const choose=()=>{selected=p.id;renderCards();renderPreview()};card.onclick=choose;card.onkeydown=e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();choose()}};target.append(card)}if(!prompts.some(p=>p.id===selected)){selected=list[0]?.id||null;renderPreview()}}
const current=()=>prompts.find(p=>p.id===selected);
function currentValues(){return Object.fromEntries([...el("vars").querySelectorAll("input")].map(input=>[input.dataset.variable,input.value]))}
function renderPreview(){const p=current();el("title").textContent=p?.title||"اختر قالبًا";el("desc").textContent=p?.description||"";el("source").textContent=p?"المصدر: "+p.source+" • "+p.license:"";el("preview").textContent=p?.template||"";el("vars").replaceChildren();for(const v of vars(p?.template||"")){const label=node("label","",v.replaceAll("_"," ")),input=node("input");input.maxLength=1500;input.placeholder="أدخل "+v;input.dataset.variable=v;input.oninput=()=>el("preview").textContent=fill(p.template,currentValues());label.append(input);el("vars").append(label)}el("copyTemplate").disabled=!p;el("sendToCreator").disabled=!p}
async function copy(text){try{await navigator.clipboard.writeText(text);toast("تم النسخ")}catch{toast("تعذر النسخ التلقائي؛ حدّد النص وانسخه يدويًا")}}
el("copyTemplate").onclick=()=>copy(el("preview").textContent);
el("sendToCreator").onclick=()=>{el("goal").value=el("preview").textContent;view("create");el("goal").focus()};
el("search").oninput=()=>{visibleLimit=48;renderCards()};el("more").onclick=()=>{visibleLimit+=48;renderCards()};el("favorites").onclick=()=>{favOnly=!favOnly;visibleLimit=48;el("favorites").setAttribute("aria-pressed",String(favOnly));renderCards()};
document.addEventListener("keydown",e=>{if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==="k"){e.preventDefault();view("library");el("search").focus()}});
el("composeForm").onsubmit=e=>{e.preventDefault();try{output=compose({goal:el("goal").value,audience:el("audience").value,context:el("context").value,rules:el("rules").value,format:el("format").value,model:el("model").value,language:el("language").value});el("result").textContent=output;el("copyResult").disabled=false;toast("تم إنشاء البرومبت")}catch(err){toast(err.message)}};
el("copyResult").onclick=()=>copy(output);
el("file").onchange=async e=>{const file=e.target.files?.[0];if(!file)return;try{if(file.size>2*1024*1024)throw new Error("الملف يتجاوز 2 ميجابايت");const json=JSON.parse(await file.text()),rows=Array.isArray(json)?json:json.prompts;const result=merge(prompts,rows);prompts=result.prompts;save();renderCats();renderCards();el("importStatus").textContent="تمت إضافة "+result.added+" قالب وتجاوز "+result.skipped+" مكرر."}catch(err){el("importStatus").textContent="تعذر الاستيراد: "+err.message}e.target.value=""};
el("export").onclick=()=>{const blob=new Blob([JSON.stringify({prompts},null,2)],{type:"application/json"}),url=URL.createObjectURL(blob),a=node("a");a.href=url;a.download="nexvary-promptforge.json";document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),2000)};
renderCats();renderCards();renderPreview();
async function loadCommunityCatalog(){
 const info=el("catalogStatus");
 info.textContent="جاري فحص المكتبة المفتوحة...";
 try{
  const response=await fetch("./catalog-manifest.json",{cache:"no-store"});
  if(!response.ok)throw new Error("فهرس المجتمع غير منشور بعد");
  const manifest=await response.json();
  if(manifest.version!==1||manifest.source!=="prompts.chat"||manifest.license!=="CC0-1.0"||
     !Number.isInteger(manifest.count)||manifest.count<0||manifest.count>10000||
     !Array.isArray(manifest.chunks)||manifest.chunks.length>150)
    throw new Error("صيغة فهرس المجتمع غير معروفة");
  let next=0;const downloaded=[];const errors=[];
  async function worker(){
   while(next<manifest.chunks.length){
    const shard=manifest.chunks[next++], path=shard.file;
    if(typeof path!=="string"||!/^catalog\/[a-z-]+-\d{2,3}\.json$/.test(path)){
     errors.push("مسار غير صالح");return;
    }
    try{
     const r=await fetch("./"+path+"?v="+manifest.datasetSha256.slice(0,12));
     if(!r.ok)throw new Error("HTTP "+r.status);
     const rows=await r.json();
     if(!Array.isArray(rows)||rows.length!==shard.count)throw new Error("حجم الدفعة غير صحيح");
     downloaded.push(...rows);
    }catch(e){errors.push(e.message)}
   }
  }
  await Promise.all(Array.from({length:Math.min(4,manifest.chunks.length)},()=>worker()));
  if(errors.length)throw new Error("تعذر تنزيل "+errors.length+" دفعات");
  const merged=merge(prompts,downloaded);
  prompts=merged.prompts;
  renderCats();renderCards();renderPreview();
  info.textContent="مكتبة prompts.chat متصلة • "+merged.added+" قالب إضافي • CC0";
 }catch(e){info.textContent="المكتبة المحلية جاهزة • "+e.message}
}
loadCommunityCatalog();
if("serviceWorker" in navigator&&location.protocol==="https:")navigator.serviceWorker.register("./sw.js").catch(()=>{});
