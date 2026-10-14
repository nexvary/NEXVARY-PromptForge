import test from "node:test";import assert from "node:assert/strict";
import {buildPersonalPrompt,promptQuality,erasePersonal} from "../personal.mjs";
test("personal creation includes source, license and valid ID",()=>{
 const p=buildPersonalPrompt({category:"marketing",title:"إعلان منتج",template:"أنشئ إعلانًا احترافيًا عن المنتج مع أمثلة."},()=> "5efg-2");
 assert.equal(p.id,"user-5efg-2");assert.equal(p.category,"marketing");assert.equal(p.license,"CC0-1.0");
});
test("reject malformed personal prompts",()=>{
 assert.throws(()=>buildPersonalPrompt({title:"x",template:"Any large enough template here"}),/العنوان/);
 assert.throws(()=>buildPersonalPrompt({title:"Valid",template:"short"}),/البرومبت/);
 assert.throws(()=>buildPersonalPrompt({category:"nonexistent",title:"Valid",template:"A valid string is long enough"}),/غير صالح/);
});
test("quality reports missing sections without claiming an AI evaluation",()=>{
 const p=promptQuality("Hello");
 assert.equal(p.passed,0);assert.equal(p.total,6);assert.equal(p.advice.length,6);
 const complete=promptQuality("أنت خبير. اكتب للمستخدمين وفق متطلبات دقيقة، مع خطوات واضحة. تحقق من مصادر المعلومات ولا تختلق.");
 assert.ok(complete.passed>=4);
});
test("only personal templates may be removed",()=>{
 const data=[{id:"pf-001"},{id:"user-123"}];
 assert.deepEqual(erasePersonal(data,"user-123"),[{id:"pf-001"}]);
 assert.throws(()=>erasePersonal(data,"pf-001"));
});
