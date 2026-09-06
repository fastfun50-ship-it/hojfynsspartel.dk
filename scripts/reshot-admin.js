const puppeteer=require('puppeteer');
(async()=>{ const b=await puppeteer.launch({headless:true,executablePath:'/usr/bin/google-chrome',args:['--no-sandbox','--disable-dev-shm-usage']});
for (const w of [375,1280]){ const p=await b.newPage(); await p.setViewport({width:w,height:w===375?900:900});
await p.goto('http://127.0.0.1:3000/admin/upload',{waitUntil:'networkidle0'});
await p.screenshot({path:'evidence/admin-upload-'+w+'.png'}); console.log('ok',w); await p.close(); }
await b.close(); })().catch(e=>{console.error(e);process.exit(1)});
