import {copyFile,mkdir,writeFile} from 'node:fs/promises';
await copyFile('engine-lab/发动机构造与原理实训.html','index.html');
await mkdir('heart-lab',{recursive:true});
await copyFile('heart-lab/心脏解剖与泵血机制实训.html','heart-lab/index.html');
await mkdir('pc-lab',{recursive:true});
await copyFile('pc-lab/电脑主机拆装实训.html','pc-lab/index.html');
await writeFile('.nojekyll','');
console.log('GitHub Pages entries updated: index.html, heart-lab/index.html, pc-lab/index.html');
