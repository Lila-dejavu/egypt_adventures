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

const txtPath = path.join(__dirname, '..', 'locales', 'EN.txt');
const outPath = path.join(__dirname, '..', 'locales', 'en.json');

if (!fs.existsSync(txtPath)) {
  console.error('EN.txt not found:', txtPath);
  process.exit(1);
}

const csv = fs.readFileSync(txtPath, 'utf8');
const rows = parseCSV(csv);
if (!rows.length) { console.error('No rows in EN.txt'); process.exit(1); }

const header = rows[0].map(h => h.trim());
console.log('Header columns:', header);

const keyIdx = header.indexOf('key');
const enIdx = header.indexOf('existing_en');
if (keyIdx === -1 || enIdx === -1) {
  console.error('EN.txt must contain header columns: key,existing_en');
  process.exit(1);
}

let enWrapper = {};
if (fs.existsSync(outPath)) {
  try { enWrapper = JSON.parse(fs.readFileSync(outPath, 'utf8')); } catch (e) { enWrapper = {}; }
}
if (!enWrapper.en) enWrapper.en = {};

let count = 0;
let updated = 0;
for (let i = 1; i < rows.length; i++) {
  const r = rows[i];
  const key = (r[keyIdx] || '').trim();
  const tr = (r[enIdx] || '').trim();
  if (!key) continue;
  // only set if translation is non-empty
  if (tr !== '') {
    if (enWrapper.en[key] !== tr) {
      updated++;
    }
    enWrapper.en[key] = tr;
    count++;
  }
}

fs.writeFileSync(outPath, JSON.stringify(enWrapper, null, 2), 'utf8');
console.log(`✅ Successfully processed ${count} translations (${updated} updated/added) to ${outPath}`);
