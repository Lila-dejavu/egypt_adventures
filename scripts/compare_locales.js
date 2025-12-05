const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const zhFile = path.join(root, 'locales', 'zh-TW.json');
const enFile = path.join(root, 'locales', 'en.json');

function readJson(fp) {
  if (!fs.existsSync(fp)) return null;
  try { return JSON.parse(fs.readFileSync(fp, 'utf8')); } catch (e) { console.error('parse error', fp, e.message); return null; }
}

const zh = readJson(zhFile);
const en = readJson(enFile);
if (!zh) { console.error('Missing zh file'); process.exit(1); }
if (!en) { console.error('Missing en file'); process.exit(1); }

const zhObj = zh['zh-TW'] || zh;
const enObj = en['en'] || en;

const zhKeys = Object.keys(zhObj).sort();
const enKeys = Object.keys(enObj).sort();

const missingInEn = zhKeys.filter(k => typeof enObj[k] === 'undefined' || enObj[k] === '');
const extraInEn = enKeys.filter(k => typeof zhObj[k] === 'undefined');

console.log('zh total keys:', zhKeys.length);
console.log('en total keys:', enKeys.length);
console.log('missing in en (zh keys not present or empty in en):', missingInEn.length);
console.log('extra in en (present in en but not in zh):', extraInEn.length);
if (missingInEn.length) {
  console.log('\nFirst 200 missing keys:');
  missingInEn.slice(0,200).forEach(k=>console.log(k));
}
if (extraInEn.length) {
  console.log('\nFirst 200 extra keys in en:');
  extraInEn.slice(0,200).forEach(k=>console.log(k));
}
// write a small report file
const report = {
  zh_total: zhKeys.length,
  en_total: enKeys.length,
  missing_in_en_count: missingInEn.length,
  extra_in_en_count: extraInEn.length,
  missing_in_en: missingInEn,
  extra_in_en: extraInEn
};
fs.writeFileSync(path.join(root, 'locales', 'compare_report.json'), JSON.stringify(report, null, 2), 'utf8');
console.log('\nReport written to locales/compare_report.json');
