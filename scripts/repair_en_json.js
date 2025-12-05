const fs = require('fs');
const path = require('path');
const fp = path.join(__dirname, '..', 'locales', 'en.json');
const outFp = fp; // overwrite
const s = fs.readFileSync(fp, 'utf8');
const regex = /"([^"]+)"\s*:\s*"((?:[^"\\]|\\.)*)"/g;
let m;
const obj = {};
while ((m = regex.exec(s)) !== null) {
  const k = m[1];
  const v = m[2].replace(/\\"/g, '"').replace(/\\n/g, '\n');
  // ignore accidental matches inside JSON structure like '"en"' at top-level
  if (k === 'en' || k === 'zh-TW') continue;
  obj[k] = v;
}
// write cleaned JSON with en wrapper
fs.writeFileSync(outFp, JSON.stringify({ en: obj }, null, 2), 'utf8');
console.log('Rebuilt', outFp, 'with', Object.keys(obj).length, 'entries');
