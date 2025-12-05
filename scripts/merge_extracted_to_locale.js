const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const extractionFile = path.join(root, 'i18n_extraction.json');
const zhFile = path.join(root, 'locales', 'zh-TW.json');
const enFile = path.join(root, 'locales', 'en.json');

function readJson(fp) {
  if (!fs.existsSync(fp)) return null;
  try { return JSON.parse(fs.readFileSync(fp, 'utf8')); }
  catch (e) { console.error('Failed to parse', fp, e.message); process.exit(1); }
}

function main() {
  const extraction = readJson(extractionFile);
  if (!extraction || !Array.isArray(extraction.items)) {
    console.error('Extraction file missing or malformed:', extractionFile);
    process.exit(1);
  }

  const zhObjWrapper = readJson(zhFile) || {};
  if (!zhObjWrapper['zh-TW']) zhObjWrapper['zh-TW'] = {};
  const zh = zhObjWrapper['zh-TW'];

  // Merge each extracted item using suggested_key
  extraction.items.forEach(item => {
    const key = item.suggested_key || (item.file + '_' + item.line);
    if (!zh[key]) {
      // use raw text as the zh value
      zh[key] = item.text;
    }
  });

  // write back zh file
  fs.writeFileSync(zhFile, JSON.stringify(zhObjWrapper, null, 2), 'utf8');
  console.log('Updated', zhFile);

  // create en template: same keys, empty strings
  const enWrapper = readJson(enFile) || {};
  if (!enWrapper.en) enWrapper.en = {};
  const en = enWrapper.en;

  Object.keys(zh).forEach(k => {
    if (typeof en[k] === 'undefined') en[k] = '';
  });

  fs.writeFileSync(enFile, JSON.stringify(enWrapper, null, 2), 'utf8');
  console.log('Wrote translation template', enFile);
}

main();
