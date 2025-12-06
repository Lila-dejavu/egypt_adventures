const fs = require('fs');
const path = require('path');

const localesDir = path.join(__dirname, '..', 'locales');
const inputFile = path.join(localesDir, 'EN.txt');
const targetFile = path.join(localesDir, 'en.json');

function normalizeQuotes(s){
  return s.replace(/[“”]/g, '"').replace(/[‘’]/g, "'");
}

function safeTimestamp(){
  const d = new Date();
  return d.toISOString().replace(/[:]/g, '-');
}

try{
  const raw = fs.readFileSync(inputFile, 'utf8');
  const lines = raw.split(/\r?\n/);
  if(lines.length <= 1){
    console.error('No data lines in EN.txt');
    process.exit(1);
  }

  // Skip header
  const dataLines = lines.slice(1).filter(l => l.trim().length>0);
  const mapping = {};

  dataLines.forEach((line, idx) => {
    let ln = normalizeQuotes(line).trim();
    // If line begins and ends with a double quote, remove them before splitting
    if(ln.startsWith('"') && ln.endsWith('"')){
      ln = ln.slice(1, -1);
    }
    // Split into 3 parts on '","' which is safe after normalization
    const parts = ln.split('\",\"');
    // If split didn't produce 3 parts, try comma-split fallback
    let key = '', zh = '', en = '';
    if(parts.length >= 3){
      key = parts[0];
      zh = parts[1];
      en = parts.slice(2).join('\",\"'); // join back in case extra separators
    } else {
      // fallback: CSV by first two commas
      const cols = ln.split(',');
      key = cols[0] || '';
      zh = cols[1] || '';
      en = cols.slice(2).join(',') || '';
    }

    // Trim and unescape doubled quotes
    key = key.trim().replace(/^\"|\"$/g, '').replace(/\"\"/g, '\"');
    zh = zh.trim();
    en = en.trim().replace(/^\"|\"$/g, '').replace(/\"\"/g, '\"');

    if(key){
      mapping[key] = en;
    }
  });

  // Read existing en.json if present
  let current = { en: {} };
  if(fs.existsSync(targetFile)){
    try{
      current = JSON.parse(fs.readFileSync(targetFile, 'utf8'));
    }catch(e){
      console.error('Failed to parse existing en.json, aborting backup and write.');
      console.error(e);
      process.exit(2);
    }
  }

  // Backup existing file
  if(fs.existsSync(targetFile)){
    const bakName = path.join(localesDir, `en.json.bak_${safeTimestamp()}`);
    fs.copyFileSync(targetFile, bakName);
    console.log('Backed up existing en.json ->', bakName);
  }

  // Merge: keys from mapping overwrite existing; keep other existing keys
  const merged = Object.assign({}, current.en || {}, mapping);

  const out = { en: merged };
  fs.writeFileSync(targetFile, JSON.stringify(out, null, 2), 'utf8');
  console.log('Wrote', targetFile, 'with', Object.keys(merged).length, 'entries');
}catch(err){
  console.error('Error:', err.message);
  console.error(err);
  process.exit(3);
}
