const {app,BrowserWindow,protocol,net,shell} = require("electron");
const path = require("node:path");
const {pathToFileURL} = require("node:url");
protocol.registerSchemesAsPrivileged([{scheme:"promptforge",privileges:{standard:true,secure:true,supportFetchAPI:true,stream:true}}]);
app.whenReady().then(()=>{
 const root=path.resolve(__dirname,"..","dist");
 protocol.handle("promptforge",request=>{
  const url=new URL(request.url);
  if(url.hostname!=="app")return new Response("Forbidden",{status:403});
  let pathname;
  try{pathname=decodeURIComponent(url.pathname)}catch{return new Response("Bad path",{status:400})}
  if(pathname==="/"||pathname==="")pathname="/index.html";
  const file=path.resolve(root,"."+pathname);
  if(file!==root&&!file.startsWith(root+path.sep))return new Response("Forbidden",{status:403});
  return net.fetch(pathToFileURL(file).href);
 });
 const win=new BrowserWindow({width:1380,height:880,minWidth:800,minHeight:560,backgroundColor:"#0a1020",
  autoHideMenuBar:true,webPreferences:{nodeIntegration:false,contextIsolation:true,sandbox:true,webSecurity:true}});
 win.webContents.setWindowOpenHandler(({url})=>{
  if(url.startsWith("https://github.com/nexvary/NEXVARY-PromptForge"))shell.openExternal(url);
  return {action:"deny"};
 });
 win.webContents.on("will-navigate",(event,url)=>{if(!url.startsWith("promptforge://app/")){event.preventDefault();if(url.startsWith("https://github.com/nexvary/NEXVARY-PromptForge"))shell.openExternal(url)}});
 win.loadURL("promptforge://app/index.html");
});
app.on("window-all-closed",()=>{if(process.platform!=="darwin")app.quit()});
