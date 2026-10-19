import {copyFile,writeFile} from 'node:fs/promises';
await copyFile('engine-lab/发动机构造与原理实训.html','index.html');
await writeFile('.nojekyll','');
console.log('GitHub Pages entry updated: index.html');
