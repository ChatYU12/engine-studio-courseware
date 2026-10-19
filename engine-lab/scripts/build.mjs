import {build} from 'esbuild';
import {readFile,writeFile} from 'node:fs/promises';
const bundle=await build({entryPoints:['dist/app.js'],bundle:true,format:'iife',target:['es2020'],minify:true,write:false,legalComments:'inline'});
let html=await readFile('dist/index.html','utf8');const css=await readFile('dist/style.css','utf8');const license=await readFile('dist/vendor/THREE-LICENSE.txt','utf8');
html=html.replace('<link rel="stylesheet" href="./style.css">',`<style>${css}</style>`).replace('<script type="module" src="./app.js"></script>',()=>`<script>${bundle.outputFiles[0].text.replaceAll('</script','<\\/script')}</script>`);
html=html.replace('<html lang="zh-CN">',`<!-- Third-party: Three.js / OrbitControls, MIT license\n${license}\n-->\n<html lang="zh-CN">`);
await writeFile('发动机构造与原理实训.html',html);console.log(`Built offline HTML: ${Buffer.byteLength(html)} bytes`);
