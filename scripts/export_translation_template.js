const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const zhFile = path.join(root, 'locales', 'zh-TW.json');
const outFile = path.join(root, 'locales', 'en_to_translate.csv');

function escapeCsv(val) {
  if (val === null || typeof val === 'undefined') return '';
  const s = String(val);
  if (s.includes('"') || s.includes(',') || s.includes('\n') || s.includes('\r')) {
    return '"' + s.replace(/"/g, '""') + '"';
  }
  return s;
}

if (!fs.existsSync(zhFile)) {
  console.error('zh-TW.json not found at', zhFile);
  process.exit(1);
}

const data = JSON.parse(fs.readFileSync(zhFile, 'utf8'));
// support both {"zh-TW": {...}} and direct object
const zh = data['zh-TW'] || data;

const keys = Object.keys(zh).sort();
const header = 'key,zh_text,en_translation\n';
const rows = keys.map(k => `${escapeCsv(k)},${escapeCsv(zh[k])},`).join('\n');
fs.writeFileSync(outFile, header + rows, 'utf8');
console.log('Wrote', outFile, 'with', keys.length, 'entries');
