const puppeteer=require('puppeteer');
(async()=>{ const b=await puppeteer.launch({headless:true,executablePath:'/usr/bin/google-chrome',args:['--no-sandbox','--disable-dev-shm-usage']});
for (const w of [375,1280]){ const p=await b.newPage(); await p.setViewport({width:w,height:900});
for (const h of ['#projekter','#tilbud']){ await p.goto('http://127.0.0.1:3000/'+h,{waitUntil:'networkidle0'}); await p.evaluate((hh)=>{const el=document.querySelector(hh);if(el)el.scrollIntoView();},h); await new Promise(r=>setTimeout(r,300));
const name=h==='#projekter'?'projekt':'tilbud'; await p.screenshot({path:'evidence/'+name+'-'+w+'.png'}); console.log(name,w);} await p.close();}
await b.close();})().catch(e=>{console.error(e);process.exit(1)});
