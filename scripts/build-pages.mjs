import { readdir, readFile, stat, copyFile, mkdir, writeFile } from 'node:fs/promises';
import { resolve, relative, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

// Copies only the game's runtime files. Never deletes or edits source assets.
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const output = resolve(root, 'dist');
const code = ['index.html', 'app.js', 'assets.js', 'teaching-video.js', 'style.css',
  'level1.js', 'level2.js', 'level2.css', 'level3.js', 'level3.css', 'final.js', 'final.css'];
const folders = ['Homepage', 'character', 'l1', 'l2', 'l3', 'final', 'Teaching Video'];
const files = [...code, 'tick.png'];
async function walk(folder) {
  for (const entry of await readdir(resolve(root, folder), { withFileTypes: true })) {
    const path = `${folder}/${entry.name}`;
    if (entry.isSymbolicLink()) throw new Error(`Symbolic link is not supported: ${path}`);
    if (entry.isDirectory()) await walk(path);
    else if (!entry.name.toLowerCase().endsWith('.zip')) files.push(path);
  }
}
for (const folder of folders) await walk(folder);
const exact = new Set(files);
const checked = new Set();
function requireFile(path) {
  path = path.replace(/^\.\//, '').split(/[?#]/)[0];
  if (!exact.has(path)) throw new Error(`Missing file or incorrect filename case: ${path}`);
  checked.add(path);
}
const metadataText = await readFile(resolve(root, 'assets.js'), 'utf8');
const metadata = JSON.parse(metadataText.slice(metadataText.indexOf('{'), metadataText.lastIndexOf('}') + 1));
for (const path of Object.keys(metadata)) requireFile(path);
const numbers = Array.from({ length: 10 }, (_, i) => String(i + 1));
const domains = {
  'state.character': ['lelaki', 'perempuan'],
  "state.music ? 'on' : 'off'": ['on', 'off'],
  'index === 0 ? 3 : 2': ['3', '2'],
  species: ['arnab', 'monyet', 'rusa'], animalKind: ['arnab', 'monyet', 'rusa'],
  'request.animal': ['arnab', 'monyet', 'rusa'],
  'request.food': ['lobak', 'pisang', 'epal'], 'food.dataset.kind': ['lobak', 'pisang', 'epal'],
};
function expand(template) {
  const match = /\$\{([^}]+)\}/.exec(template);
  if (!match) return [template];
  let values = domains[match[1]];
  if (match[1] === 'kind') values = template.includes('l3/') ? ['lobak', 'pisang', 'epal'] : ['arnab', 'monyet', 'rusa'];
  if (match[1] === 'level') values = template.includes('/lock (') ? ['2', '3', '4'] : ['1', '2', '3', '4'];
  if (['target', 'number', 'value', 'counted', 'packed', 'packed.length', 'request.quantity'].includes(match[1])) values = numbers;
  if (!values) throw new Error(`Unrecognised asset expression: ${template}`);
  return values.flatMap(value => expand(template.replace(match[0], value)));
}
for (const name of code) {
  const text = await readFile(resolve(root, name), 'utf8');
  if (name.endsWith('.js')) {
    const result = spawnSync(process.execPath, ['--input-type=module', '--check'], { input: text, encoding: 'utf8' });
    if (result.status !== 0) throw new Error(`${name}: ${result.stderr}`);
  }
  if (name === 'assets.js') continue;
  // Extract complete quoted asset/module references, including template literals.
  for (const match of text.matchAll(/(['"`])((?:(?!\1)[^\r\n])*?)\1/g)) {
    const path = match[2];
    if (!/^(?:\.\/|Homepage\/|character\/|l[123]\/|final\/|Teaching Video\/|tick\.png)/.test(path)) continue;
    if (!/\.(?:png|gif|mp3|mp4|js|css)(?:\?[^ ]*)?$/.test(path)) continue;
    for (const expanded of expand(path)) requireFile(expanded);
  }
  if (name === 'index.html') {
    for (const match of text.matchAll(/(?:src|href)="([^"]+)"/g)) requireFile(match[1]);
  }
  if (/(?:["'`])(?:https?:\/\/|\/[^/]|[A-Za-z]:\\)/.test(text)) {
    throw new Error(`Review non-relative URL in ${name} before publishing.`);
  }
}
let total = 0;
let largest = { path: '', size: 0 };
for (const path of files) {
  const info = await stat(resolve(root, path));
  if (info.size >= 100 * 1024 * 1024) throw new Error(`File exceeds GitHub's regular Git limit: ${path}`);
  total += info.size;
  if (info.size > largest.size) largest = { path, size: info.size };
}
if (!process.argv.includes('--check')) {
  // Fail rather than leave obsolete assets in a previously built deployment.
  // Use a fresh checkout/output folder for every release; original files are safe.
  try {
    const old = await readdir(output);
    if (old.length) throw new Error('dist/ already contains files. Move it aside before building a fresh release.');
  } catch (error) { if (error.code !== 'ENOENT') throw error; }
  await mkdir(output, { recursive: true });
  for (const path of files) {
    const destination = resolve(output, path);
    if (relative(output, destination).startsWith('..')) throw new Error(`Invalid output path: ${path}`);
    await mkdir(dirname(destination), { recursive: true });
    await copyFile(resolve(root, path), destination);
  }
  await writeFile(resolve(output, '.nojekyll'), '');
}
console.log(`Validated ${checked.size} exact-case references, including all numbers 1-10, animal/food variants and four teaching videos.`);
console.log(`${files.length} runtime files; ${(total / 1024 / 1024).toFixed(1)} MiB. Largest: ${largest.path} (${(largest.size / 1024 / 1024).toFixed(1)} MiB).`);
console.log(process.argv.includes('--check') ? 'Validation passed; no files changed.' : 'GitHub Pages output: dist/');
