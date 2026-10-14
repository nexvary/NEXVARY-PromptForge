import {validate} from "./engine.mjs";
export function buildPersonalPrompt(fields,idFactory=()=>crypto.randomUUID()){
 const title=String(fields?.title||"").trim(),body=String(fields?.template||"").trim(),description=String(fields?.description||"").trim();
 if(title.length<3||title.length>160)throw new Error("العنوان يجب أن يكون بين 3 و160 حرفًا");
 if(body.length<12||body.length>12000)throw new Error("البرومبت يجب أن يكون بين 12 و12000 حرف");
 const id="user-"+String(idFactory()).replace(/[^a-zA-Z0-9-]/g,"").slice(0,65);
 return validate({id,category:String(fields.category||"writing"),title,
 description:description||"قالب أضفته إلى مكتبتي الشخصية",template:body,
 license:"CC0-1.0",source:"Personal / user-created"});
}
export function promptQuality(text){
 const value=String(text||"").trim(),lower=value.toLowerCase();
 const checks=[
  {id:"task",name:"هدف واضح",ok:value.length>=25},
  {id:"role",name:"دور أو اختصاص",ok:/\b(expert|role|act as|you are|specialist)\b|(?:خبير|تصرّف|المتخصص|الدور|بصفتك)/iu.test(lower)},
  {id:"audience",name:"الجمهور المستهدف",ok:/\b(audience|reader|target users)\b|(?:جمهور|مستخدمين|المستهدف)/iu.test(lower)},
  {id:"constraints",name:"الشروط والقيود",ok:/\b(must|avoid|constraints|do not)\b|(?:يجب|لا تقم|القيود|متطلبات|ممنوع)/iu.test(lower)},
  {id:"output",name:"شكل الناتج",ok:/\b(table|json|steps|format|bullet)\b|(?:جدول|خطوات|النتيجة|المخرجات|صيغة)/iu.test(lower)},
  {id:"verification",name:"التحقق من الحقائق",ok:/\b(verify|evidence|sources|fact.check)\b|(?:تحقق|مصادر|مراجع|لا تختلق|الأدلة)/iu.test(lower)}
 ];
 return {checks,passed:checks.filter(x=>x.ok).length,total:checks.length,
  advice:checks.filter(x=>!x.ok).map(x=>"أضف: "+x.name)};
}
export function erasePersonal(prompts,id){
 if(!String(id).startsWith("user-"))throw new Error("لا يمكن حذف قوالب النظام أو المكتبة العامة");
 return prompts.filter(p=>p.id!==id);
}
