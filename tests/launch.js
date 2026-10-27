/* shared launcher: BROWSER=webkit node tests/x.js  (default chromium via system Chrome). WEBKIT_PATH overrides the WebKit binary. */
const pw=require('playwright-core'),fs=require('fs');
const WK=process.env.WEBKIT_PATH||[require('os').homedir()+'/.cache/ms-playwright/webkit-2370/pw_run.sh'].find(p=>fs.existsSync(p));
module.exports=function launch(){if(process.env.BROWSER==='webkit')return pw.webkit.launch(WK?{executablePath:WK}:{});
 return pw.chromium.launch({executablePath:'/usr/bin/google-chrome',args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']})};
