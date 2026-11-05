import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { execFileSync } from 'node:child_process';

const here = path.dirname(fileURLToPath(import.meta.url));
const temporary = fs.mkdtempSync(path.join(os.tmpdir(), 'pro86-review-'));
const harness = `<pre id="qa-result">Checking</pre><script>
(async()=>{
  await new Promise(resolve=>setTimeout(resolve,2000));
  for(const image of document.images) {
    if(!image.complete||!image.naturalWidth)throw Error('Local image did not load: '+image.src);
    const probe=document.createElement('canvas');probe.width=probe.height=1;
    probe.getContext('2d').drawImage(image,0,0,1,1);
  }
  const selector=document.getElementById('aspect'), aspects=[];
  for(const aspect of ['4x3','16x9','3x4']) {
    selector.value=aspect; selector.dispatchEvent(new Event('change'));
    const visible=[...document.querySelectorAll('[data-aspect]')].filter(s=>!s.hidden);
    if(visible.length!==1||visible[0].dataset.aspect!==aspect)throw Error('Aspect switch failed');
    aspects.push(aspect);
  }
  document.getElementById('native').click();
  if(!document.getElementById('comparisons').classList.contains('native'))throw Error('Native view failed');
  document.getElementById('native').click();
  document.querySelector('[data-swatch="#332540"]').click();
  if([...document.querySelectorAll('.checker')].some(e=>e.style.background!=='rgb(51, 37, 64)'))throw Error('Swatch failed');
  document.querySelector('[data-swatch="checker"]').click();
  document.getElementById('qa-result').textContent=JSON.stringify({imagesDecoded:document.images.length,brokenImages:[...document.images].filter(i=>!i.naturalWidth).length,aspects,nativeToggle:true,swatches:true,localOnly:[...document.images].every(i=>i.src.startsWith('file:'))});
})().catch(error=>document.getElementById('qa-result').textContent=JSON.stringify({error:error.stack}));
</script>`;
const entry = path.join(temporary, 'check.html');
const html = fs.readFileSync(path.join(here, 'review.html'), 'utf8').replace('<meta charset="utf-8">', `<meta charset="utf-8"><base href="${pathToFileURL(here + path.sep).href}">`).replace('</html>', harness + '</html>');
fs.writeFileSync(entry, html);
const browser = process.env.PROPOSAL_BROWSER || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const dom = execFileSync(browser, ['--headless', '--disable-gpu', '--no-first-run', '--no-default-browser-check', `--user-data-dir=${temporary}/profile`, '--virtual-time-budget=15000', '--dump-dom', pathToFileURL(entry).href], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
const match = dom.match(/<pre id="qa-result">([^<]+)<\/pre>/);
if (!match) throw new Error('No review check result');
const result = JSON.parse(match[1].replaceAll('&quot;', '"').replaceAll('&amp;', '&'));
if (result.error || result.brokenImages || !result.localOnly) throw new Error(JSON.stringify(result));
fs.writeFileSync(path.join(here, 'review-checks.json'), JSON.stringify(result, null, 2) + '\n');
console.log(JSON.stringify(result, null, 2));
