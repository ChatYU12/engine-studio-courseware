import { build } from 'esbuild';
import { mkdir, readFile, writeFile } from 'node:fs/promises';

const result = await build({
  entryPoints: ['src/app.js'],
  bundle: true,
  format: 'iife',
  target: ['es2020'],
  minify: true,
  write: false,
  legalComments: 'inline'
});
let html = await readFile('src/index.html', 'utf8');
const css = await readFile('src/style.css', 'utf8');
const license = await readFile('src/vendor/THREE-LICENSE.txt', 'utf8');
const styleLink = '<link rel="stylesheet" href="./style.css">';
const appScript = '<script type="module" src="./app.js"></script>';
if (!html.includes(styleLink) || !html.includes(appScript)) throw new Error('Expected inline insertion points were not found.');
html = html.replace(styleLink, `<style>${css}</style>`);
html = html.replace(appScript, () => `<script>${result.outputFiles[0].text.replaceAll('</script', '<\\/script')}</script>`);
html = html.replace('<html lang="zh-CN">', `<!-- Third-party: Three.js r160 / OrbitControls, MIT license\n${license}\n-->\n<html lang="zh-CN">`);
await mkdir('dist', { recursive: true });
const out = '心脏解剖与泵血机制实训.html';
await writeFile(out, html);
console.log(`Built offline courseware: ${out} (${Buffer.byteLength(html)} bytes)`);
