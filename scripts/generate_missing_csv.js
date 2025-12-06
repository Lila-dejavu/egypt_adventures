const fs = require('fs');
const path = require('path');
const localesDir = path.join(__dirname, '..', 'locales');
const extraFile = path.join(localesDir, 'extra_in_en_json.txt');
const enJsonFile = path.join(localesDir, 'en.json');
const outCsv = path.join(localesDir, 'en_missing_to_translate.csv');

function csvEscape(s){
  if(s === null || s === undefined) return '""';
  const str = String(s);
  // escape double quotes by doubling them
  const esc = str.replace(/"/g, '""');
  return '"' + esc + '"';
}

try{
  if(!fs.existsSync(extraFile)){
    console.error('Missing', extraFile);
    process.exit(1);
  }
  if(!fs.existsSync(enJsonFile)){
    console.error('Missing', enJsonFile);
    process.exit(1);
  }

  const keys = fs.readFileSync(extraFile,'utf8').split(/\r?\n/).map(l=>l.trim()).filter(Boolean);
  const enJson = JSON.parse(fs.readFileSync(enJsonFile,'utf8'));
  const enMap = (enJson && enJson.en) || {};

  const header = ['key','zh','existing_en'];
  const rows = [header.map(csvEscape).join(',')];

  keys.forEach(k => {
    const existing = enMap[k];
    rows.push([csvEscape(k), csvEscape(''), csvEscape(existing !== undefined ? existing : '')].join(','));
  });

  fs.writeFileSync(outCsv, rows.join('\n'), 'utf8');
  console.log('Wrote', outCsv, 'with', keys.length, 'rows (excluding header)');
}catch(e){
  console.error('Error:', e.message);
  process.exit(2);
}
