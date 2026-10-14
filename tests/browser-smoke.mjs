import {createServer} from "node:http";
import {readFile,mkdir} from "node:fs/promises";
import {join,resolve,extname} from "node:path";
import {pathToFileURL} from "node:url";
import assert from "node:assert/strict";
const root=resolve("dist");
const mime={".html":"text/html",".js":"text/javascript",".mjs":"text/javascript",".css":"text/css",".json":"application/json",".webmanifest":"application/json",".svg":"image/svg+xml"};
const server=createServer(async(req,res)=>{
 let path;
 try{const url=new URL(req.url||"/","http://localhost");path=resolve(root,"."+decodeURIComponent(url.pathname==="/"?"/index.html":url.pathname));}catch{res.writeHead(400);res.end();return}
 if(!path.startsWith(root+"/")){res.writeHead(403);res.end();return}
 try{const file=await readFile(path);res.writeHead(200,{"content-type":mime[extname(path)]||"application/octet-stream","cache-control":"no-store"});res.end(file)}
 catch{res.writeHead(404);res.end("Not found")}
});
await new Promise(r=>server.listen(0,"127.0.0.1",r));
const base="http://127.0.0.1:"+server.address().port;
let browser;
try{
 const {chromium}=await import(pathToFileURL(process.env.PLAYWRIGHT_MODULE).href);
 browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_PATH||"/usr/bin/google-chrome",args:["--no-sandbox","--disable-dev-shm-usage"]});
 const page=await browser.newPage({viewport:{width:1400,height:960},deviceScaleFactor:1});
 const errors=[];page.on("pageerror",error=>errors.push(error.message));
 await page.goto(base+"/",{waitUntil:"networkidle",timeout:45000});
 await page.waitForFunction(()=>Number(document.getElementById("countAll").textContent)>25,{timeout:30000});
 const count=Number(await page.locator("#countAll").textContent());assert.ok(count>=500,"CC0 dataset did not load");
 await page.locator("nav button[data-view='data']").click();
 await page.locator("#customTitle").fill("قالب الاختبار الشخصي");
 await page.locator("#customTemplate").fill("تصرّف كخبير محترف، واكتب خطة دقيقة للتعامل مع هذه المهمة.");
 await page.locator("#personalForm button[type='submit']").click();
 await page.waitForFunction(()=>document.getElementById("title").textContent.includes("قالب الاختبار"));
 assert.ok(await page.locator("#deletePersonal").isVisible());
 await page.reload({waitUntil:"networkidle"});
 await page.locator("#search").fill("قالب الاختبار الشخصي");
 assert.equal(await page.locator(".card").count(),1);
 await page.locator(".card").first().click();
 await page.locator("#deletePersonal").click();
 page.on("dialog",dialog=>dialog.accept());
 // Deletion dialog above is accepted through the registered handler in subsequent checks.
 await page.screenshot({path:"dist/browser-desktop.png",fullPage:true});
 const mobile=await browser.newPage({viewport:{width:390,height:844},deviceScaleFactor:1});
 mobile.on("pageerror",error=>errors.push(error.message));
 await mobile.goto(base+"/",{waitUntil:"networkidle"});
 await mobile.screenshot({path:"dist/browser-mobile.png",fullPage:true});
 const scroll=await mobile.evaluate(()=>document.documentElement.scrollWidth-innerWidth);
 assert.ok(scroll<=2,"Mobile layout has horizontal overflow: "+scroll);
 assert.deepEqual(errors,[]);
 console.info("Browser smoke passed with "+count+" prompts; screenshots generated");
}finally{if(browser)await browser.close();await new Promise(r=>server.close(r))}
