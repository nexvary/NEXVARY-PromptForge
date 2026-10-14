import test from "node:test";import assert from "node:assert/strict";import {categories,seed,filter,normal,vars,fill,compose,merge,validate} from "../engine.mjs";
test("starter prompts are valid and unique",()=>{assert.equal(seed.length,25);assert.equal(new Set(seed.map(p=>p.id)).size,25);assert.equal(new Set(seed.map(p=>p.category)).size,categories.length);seed.forEach(p=>assert.deepEqual(validate(p),p))});
test("Arabic search normalizes hamzas",()=>{assert.equal(normal("إِعلان"),"اعلان");assert.ok(filter(seed,"اعلان").length>0)});
test("category and favorites are respected",()=>{const p=seed[0];assert.deepEqual(filter(seed,"",p.category,new Set([p.id])),[p])});
test("variables and filling",()=>{assert.deepEqual(vars("{{product}} {{product}} {{audience}}"),["product","audience"]);assert.equal(fill("{{x}} {{y}}",{x:"Hello"}),"Hello {{y}}")});
test("generator requires goal and includes constraints",()=>{assert.throws(()=>compose({goal:""}));assert.match(compose({goal:"اختبر",rules:"لا تخمّن"}),/لا تخمّن/)});
test("import deduplicates and enforces licenses",()=>{const p={...seed[0],id:"new-unique-id",template:"نص جديد عن {{topic}}"};assert.equal(merge(seed,[p,p]).added,1);assert.throws(()=>merge(seed,[{...p,license:"unknown"}]))});

test("execution protocol available in writing without duplication",()=>{const p=seed.find(x=>x.id==="pf-025");assert.ok(p);assert.equal(p.category,"writing");assert.match(p.template,/HIGH PERFORMANCE AI/);assert.match(p.template,/Maximum Verified Progress/);assert.ok(p.template.length<12000);assert.deepEqual(validate(p),p);assert.equal(filter(seed,"HIGH PERFORMANCE AI","writing").length,1)});
