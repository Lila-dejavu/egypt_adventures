const fs = require('fs');
const path = require('path');

const inPath = path.join(__dirname, '..', 'locales', 'en_missing_to_translate.csv');
const outPath = path.join(__dirname, '..', 'locales', 'en_missing_only.csv');
if (!fs.existsSync(inPath)) { console.error('Input CSV not found:', inPath); process.exit(1); }
const raw = fs.readFileSync(inPath, 'utf8');

function parseCSV(content) {
  const lines = content.split(/\r?\n/).filter(Boolean);
  return lines.map(line => {
    // simple CSV split for quoted values
    const parts = [];
    let cur = '';
    let inQ = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') { inQ = !inQ; continue; }
      if (ch === ',' && !inQ) { parts.push(cur); cur = ''; continue; }
      cur += ch;
    }
    parts.push(cur);
    return parts.map(p => p.trim());
  });
}

const rows = parseCSV(raw);
if (!rows.length) { console.error('No rows'); process.exit(1); }
const header = rows[0];
const keyIdx = header.indexOf('key');
const zhIdx = header.indexOf('zh');
const enIdx = header.indexOf('existing_en');
if (keyIdx === -1 || zhIdx === -1 || enIdx === -1) { console.error('CSV header missing expected columns'); process.exit(1); }

const outRows = [ ['key','zh'] ];
for (let i = 1; i < rows.length; i++) {
  const r = rows[i];
  const key = r[keyIdx] || '';
  const zh = r[zhIdx] || '';
  const en = r[enIdx] || '';
  if (en === '') {
    outRows.push([`"${key.replace(/"/g,'""')}"`, `"${zh.replace(/"/g,'""')}"`]);
  }
}

fs.writeFileSync(outPath, outRows.map(r => r.join(',')).join('\n'), 'utf8');
console.log('Wrote', outPath, 'with', outRows.length-1, 'entries');
