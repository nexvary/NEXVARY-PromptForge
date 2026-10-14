import test from "node:test";
import assert from "node:assert/strict";
import {createSearchIndex,rankedSearch} from "../search.mjs";
const data=[
 {id:"a",title:"تطوير أندرويد",description:"بناء تطبيق",template:"أنشئ تطبيق Android احترافي",category:"programming"},
 {id:"b",title:"Android Developer",description:"code",template:"تطبيق أندرويد",category:"programming"},
 {id:"c",title:"حملة تسويق",description:"إعلانات",template:"خطة تسويقية",category:"marketing"}
];
test("multilingual ranking favors title hits over long body",()=>{
 const results=rankedSearch(createSearchIndex(data),"أندرويد");
 assert.equal(results[0].id,"a");
 assert.equal(results[1].id,"b");
});
test("Arabic normalization, category and favorites work",()=>{
 const index=createSearchIndex(data);
 assert.equal(rankedSearch(index,"اعلانات","marketing")[0].id,"c");
 assert.deepEqual(rankedSearch(index,"android","marketing"),[]);
 assert.deepEqual(rankedSearch(index,"", "all",new Set(["a"])).map(x=>x.id),["a"]);
});
test("minor English typos are tolerated in titles",()=>{
 const r=rankedSearch(createSearchIndex(data),"developr");
 assert.equal(r[0].id,"b");
});
