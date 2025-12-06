const fs = require('fs');
const path = require('path');
const localesDir = path.join(__dirname, '..', 'locales');
const inputFile = path.join(localesDir, 'EN.txt');
const enJsonFile = path.join(localesDir, 'en.json');

function normalizeQuotes(s){
  return s.replace(/[“”]/g, '"').replace(/[‘’]/g, "'");
}

function parseENtxt(raw){
  const lines = raw.split(/\r?\n/);
  const data = lines.slice(1).filter(l => l.trim().length>0);
  const keys = [];
  data.forEach(line => {
    let ln = normalizeQuotes(line).trim();
    if(ln.startsWith('"') && ln.endsWith('"')) ln = ln.slice(1,-1);
    // try quoted-split
    let parts = ln.split('\",\"');
    let key = '';
    if(parts.length >= 1){
      key = parts[0];
    } else {
      const cols = ln.split(',');
      key = cols[0] || '';
    }
    key = key.trim().replace(/^\"|\"$/g, '').replace(/\"\"/g, '\"');
    if(key) keys.push(key);
  });
  return Array.from(new Set(keys));
}

try{
  const raw = fs.readFileSync(inputFile, 'utf8');
  const enTxtKeys = parseENtxt(raw);
  fs.writeFileSync(path.join(localesDir,'_enTxt_keys_count.txt'), String(enTxtKeys.length));
  // read en.json
  const enJson = JSON.parse(fs.readFileSync(enJsonFile, 'utf8'));
  const enJsonKeys = Object.keys((enJson && enJson.en) || {});

  // compare
  const missingInJson = enTxtKeys.filter(k => !enJsonKeys.includes(k));
  const extraInJson = enJsonKeys.filter(k => !enTxtKeys.includes(k));

  // write reports
  fs.writeFileSync(path.join(localesDir, 'missing_in_en_json.txt'), missingInJson.join('\n'));
  fs.writeFileSync(path.join(localesDir, 'extra_in_en_json.txt'), extraInJson.join('\n'));

  console.log('EN.txt keys:', enTxtKeys.length);
  console.log('en.json keys:', enJsonKeys.length);
  console.log('Missing in en.json (present in EN.txt but NOT in en.json):', missingInJson.length);
  console.log('Extra in en.json (present in en.json but NOT in EN.txt):', extraInJson.length);

  if(missingInJson.length>0){
    console.log('\nSample missing (up to 50):');
    missingInJson.slice(0,50).forEach(k=>console.log('  -',k));
  }
  if(extraInJson.length>0){
    console.log('\nSample extra (up to 50):');
    extraInJson.slice(0,50).forEach(k=>console.log('  -',k));
  }
  console.log('\nFull lists written to:', path.join(localesDir, 'missing_in_en_json.txt'), 'and', path.join(localesDir, 'extra_in_en_json.txt'));
}catch(err){
  console.error('Error:', err.message);
  process.exit(1);
}
