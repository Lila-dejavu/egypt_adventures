const fs = require('fs');
const path = require('path');
const inPath = path.join(__dirname, '..', 'locales', 'en_missing_to_translate.csv');
const outPath = path.join(__dirname, '..', 'locales', 'en_for_translators.csv');
if (!fs.existsSync(inPath)) { console.error('Input not found', inPath); process.exit(1); }
let txt = fs.readFileSync(inPath, 'utf8');
// replace header existing_en -> en_translation for clarity
txt = txt.replace(/existing_en/, 'en_translation');
fs.writeFileSync(outPath, txt, 'utf8');
console.log('Wrote', outPath);