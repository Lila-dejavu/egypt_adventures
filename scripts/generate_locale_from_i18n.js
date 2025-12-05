const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const i18nFile = path.join(root, 'i18n.js');
const outDir = path.join(root, 'locales');
const outFile = path.join(outDir, 'zh-TW.json');
const tempFile = path.join(__dirname, '._temp_i18n_export.js');

function extractZhTW(content) {
  const keyRe1 = "'zh-TW'";
  const keyRe2 = '"zh-TW"';
  let idx = content.indexOf(keyRe1);
  if (idx === -1) idx = content.indexOf(keyRe2);
  if (idx === -1) throw new Error('zh-TW key not found in i18n.js');

  // find the opening brace after the colon
  const colonIdx = content.indexOf(':', idx);
  if (colonIdx === -1) throw new Error('malformed TRANSLATIONS entry');
  const openIdx = content.indexOf('{', colonIdx);
  if (openIdx === -1) throw new Error('cannot find opening brace for zh-TW object');

  // parse braces
  let depth = 0;
  let endIdx = -1;
  for (let i = openIdx; i < content.length; i++) {
    const ch = content[i];
    if (ch === '{') depth++;
    else if (ch === '}') depth--;
    if (depth === 0) { endIdx = i; break; }
  }
  if (endIdx === -1) throw new Error('could not find end of zh-TW object');

  const extracted = content.substring(openIdx, endIdx + 1);
  return extracted;
}

function main() {
  if (!fs.existsSync(i18nFile)) {
    console.error('i18n.js not found at', i18nFile);
    process.exit(1);
  }

  const content = fs.readFileSync(i18nFile, 'utf8');
  let objStr;
  try {
    objStr = extractZhTW(content);
  } catch (err) {
    console.error('Extraction failed:', err.message);
    process.exit(1);
  }

  // create a temporary JS module that exports the object so we can require it safely
  const tempModule = `module.exports = { 'zh-TW': ${objStr} };`;
  fs.writeFileSync(tempFile, tempModule, 'utf8');

  // require the temp module
  let data;
  try {
    data = require(tempFile);
  } catch (err) {
    console.error('Require failed:', err.message);
    fs.unlinkSync(tempFile);
    process.exit(1);
  }

  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir);
  fs.writeFileSync(outFile, JSON.stringify(data, null, 2), 'utf8');
  fs.unlinkSync(tempFile);
  console.log('Wrote', outFile);
}

main();
