const fs = require('fs');
const path = require('path');
const fetch = global.fetch || require('node-fetch');

const root = path.resolve(__dirname, '..');
const inCsv = path.join(root, 'locales', 'en_missing_to_translate.csv');
const outCsv = path.join(root, 'locales', 'en_missing_translated.csv');

const LIBRE_ENDPOINT = process.env.LIBRE_ENDPOINT || 'https://libretranslate.de/translate';
const BATCH = parseInt(process.env.MT_BATCH || '50', 10);
const DELAY_MS = parseInt(process.env.MT_DELAY_MS || '400', 10);

function parseCsvLine(line){
  // very small CSV parser expecting fields wrapped in double quotes
  const parts = [];
  let i = 0;
  while(i < line.length){
    if(line[i] === '"'){
      i++;
      let buf = '';
      while(i < line.length){
        if(line[i] === '"' && line[i+1] === '"'){
          buf += '"'; i += 2; continue;
        }
        if(line[i] === '"') { i++; break; }
        buf += line[i++];
      }
      parts.push(buf);
      if(line[i] === ',') i++;
    } else {
      // unquoted
      const rest = line.slice(i).split(',');
      parts.push(rest[0]);
      break;
    }
  }
  return parts;
}

async function translateText(text){
  try{
    const res = await fetch(LIBRE_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ q: text, source: 'zh', target: 'en', format: 'text' })
    });
    if(!res.ok) throw new Error('HTTP '+res.status);
    const j = await res.json();
    return j.translatedText || '';
  } catch(e){
    console.error('translate error', e.message);
    return '';
  }
}

async function run(){
  if(!fs.existsSync(inCsv)){ console.error('Missing input CSV:', inCsv); process.exit(1); }
  const s = fs.readFileSync(inCsv,'utf8');
  const lines = s.split(/\r?\n/).filter(Boolean);
  const header = lines.shift();
  const rows = lines.map(parseCsvLine);
  const toTranslate = rows.slice(0, BATCH);

  const out = [];
  out.push(header + ',translated_en');

  for(let i=0;i<toTranslate.length;i++){
    const cols = toTranslate[i];
    const key = cols[0] || '';
    const zh = cols[1] || '';
    const existing = cols[2] || '';
    const zhText = zh;
    process.stdout.write(`Translating ${i+1}/${toTranslate.length}: ${key}\r`);
    const translated = await translateText(zhText);
    // escape double quotes
    const esc = (v)=>'"'+String(v).replace(/"/g,'""')+'"';
    out.push([esc(key), esc(zhText), esc(existing), esc(translated)].join(','));
    await new Promise(r=>setTimeout(r, DELAY_MS));
  }

  fs.writeFileSync(outCsv, out.join('\n'), 'utf8');
  console.log('\nWrote', outCsv, 'with', toTranslate.length, 'translations (batch)');
}

run().catch(e=>{ console.error(e); process.exit(1); });
