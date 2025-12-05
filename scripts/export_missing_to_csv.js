const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const reportFp = path.join(root, 'locales', 'compare_report.json');
const zhFp = path.join(root, 'locales', 'zh-TW.json');
const enFp = path.join(root, 'locales', 'en.json');
const outCsv = path.join(root, 'locales', 'en_missing_to_translate.csv');

function readJson(fp){ if(!fs.existsSync(fp)){ console.error('Missing', fp); process.exit(1);} return JSON.parse(fs.readFileSync(fp,'utf8')); }

const report = readJson(reportFp);
const zh = readJson(zhFp);
const en = readJson(enFp);
const zhObj = zh['zh-TW'] || zh;
const enObj = en['en'] || en;

const missing = report.missing_in_en || [];

// CSV header: key,zh,existing_en
const rows = [];
rows.push('key,zh,existing_en');
for(const k of missing){
  const zhText = (typeof zhObj[k] !== 'undefined') ? String(zhObj[k]).replace(/\"/g,'"').replace(/\n/g,'\\n') : '';
  const enText = (typeof enObj[k] !== 'undefined') ? String(enObj[k]).replace(/\"/g,'"').replace(/\n/g,'\\n') : '';
  // escape double quotes and wrap fields in double quotes
  const esc = (s) => '"' + String(s).replace(/"/g,'""') + '"';
  rows.push([esc(k), esc(zhText), esc(enText)].join(','));
}

fs.writeFileSync(outCsv, rows.join('\n'), 'utf8');
console.log('Wrote', outCsv, 'with', missing.length, 'rows');
