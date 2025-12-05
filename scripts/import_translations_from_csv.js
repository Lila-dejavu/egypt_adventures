const fs = require('fs');
const path = require('path');

function parseCSV(content) {
  const rows = [];
  let cur = '';
  let inQuotes = false;
  let row = [];
  for (let i = 0; i < content.length; i++) {
    const ch = content[i];
    const nxt = content[i+1];
    if (inQuotes) {
      if (ch === '"' && nxt === '"') { cur += '"'; i++; }
      else if (ch === '"') { inQuotes = false; }
      else cur += ch;
    } else {
      if (ch === '"') { inQuotes = true; }
      else if (ch === ',') { row.push(cur); cur = ''; }
      else if (ch === '\r') { continue; }
      else if (ch === '\n') { row.push(cur); rows.push(row); row = []; cur = ''; }
      else cur += ch;
    }
  }
  // last
  if (cur !== '' || row.length) {
    row.push(cur);
    rows.push(row);
  }
  return rows;
}

const argv = process.argv.slice(2);
const csvPath = argv[0] || path.join(__dirname, '..', 'locales', 'en_to_translate.csv');
const outPath = argv[1] || path.join(__dirname, '..', 'locales', 'en.json');

if (!fs.existsSync(csvPath)) {
  console.error('CSV not found:', csvPath);
  process.exit(1);
}

const csv = fs.readFileSync(csvPath, 'utf8');
const rows = parseCSV(csv);
if (!rows.length) { console.error('No rows in CSV'); process.exit(1); }

const header = rows[0].map(h => h.trim());
const keyIdx = header.indexOf('key');
const zhIdx = header.indexOf('zh_text');
const enIdx = header.indexOf('en_translation');
if (keyIdx === -1 || enIdx === -1) {
  console.error('CSV must contain header columns: key,en_translation');
  process.exit(1);
}

let enWrapper = {};
if (fs.existsSync(outPath)) {
  try { enWrapper = JSON.parse(fs.readFileSync(outPath, 'utf8')); } catch (e) { enWrapper = {}; }
}
if (!enWrapper.en) enWrapper.en = {};

for (let i = 1; i < rows.length; i++) {
  const r = rows[i];
  const key = (r[keyIdx] || '').trim();
  const tr = (r[enIdx] || '').trim();
  if (!key) continue;
  // only set if translation is non-empty
  if (tr !== '') enWrapper.en[key] = tr;
}

fs.writeFileSync(outPath, JSON.stringify(enWrapper, null, 2), 'utf8');
console.log('Wrote', outPath);
