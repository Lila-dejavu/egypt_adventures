const fs = require('fs');
const path = require('path');
const localesDir = path.join(__dirname, '..', 'locales');
const zhJsonFile = path.join(localesDir, 'zh-TW.json');
const enTxtFile = path.join(localesDir, 'EN.txt');
const csvFile = path.join(localesDir, 'en_missing_to_translate.csv');
const outCsv = path.join(localesDir, 'en_missing_to_translate_filled.csv');

function normalizeQuotes(s){
  return s ? s.replace(/[“”]/g, '"').replace(/[‘’]/g, "'") : s;
}

function parseENtxtToMap(raw){
  const lines = raw.split(/\r?\n/);
  const data = lines.slice(1).filter(l => l.trim().length>0);
  const map = {};
  data.forEach(line => {
    let ln = normalizeQuotes(line).trim();
    if(ln.startsWith('"') && ln.endsWith('"')) ln = ln.slice(1,-1);
    let parts = ln.split('\",\"');
    let key = '';
    let zh = '';
    if(parts.length >= 3){
      key = parts[0];
      zh = parts[1];
    } else {
      const cols = ln.split(',');
      key = cols[0] || '';
      zh = cols[1] || '';
    }
    key = key.trim().replace(/^\"|\"$/g, '').replace(/\"\"/g, '\"');
    zh = zh.trim().replace(/^\"|\"$/g, '');
    if(key) map[key] = zh;
  });
  return map;
}

function csvParseLines(lines){
  // assume first line header
  const header = lines[0];
  const rows = lines.slice(1).filter(l=>l.trim().length>0);
  return { header, rows };
}

function splitCsvRow(row){
  // simple CSV splitter for the 3-column format "key","zh","existing_en"
  // we'll parse by regex for quoted fields
  const regex = /\s*"((?:[^"]|"")*)"\s*,\s*"((?:[^"]|"")*)"\s*,\s*"((?:[^"]|"")*)"\s*/;
  const m = row.match(regex);
  if(m){
    const unq = s => s.replace(/""/g, '"');
    return [unq(m[1]), unq(m[2]), unq(m[3])];
  }
  return null;
}

function csvEscape(s){
  if(s === null || s === undefined) return '""';
  const str = String(s);
  const esc = str.replace(/"/g, '""');
  return '"' + esc + '"';
}

try{
  if(!fs.existsSync(csvFile)){
    console.error('Missing CSV:', csvFile);
    process.exit(1);
  }

  // build zh map from zh-TW.json
  let zhMap = {};
  if(fs.existsSync(zhJsonFile)){
    try{
      const zhJson = JSON.parse(fs.readFileSync(zhJsonFile,'utf8'));
      // zh-TW.json may have nested structure; flatten by collecting top-level keys if present
      // If file structure is { "en": {...} } or direct mapping, handle both
      const candidates = [];
      if(typeof zhJson === 'object'){
        if(zhJson['zh-TW']) candidates.push(zhJson['zh-TW']);
        if(zhJson['zh'] ) candidates.push(zhJson['zh']);
        if(zhJson['tw'] ) candidates.push(zhJson['tw']);
        // if top-level contains keys -> assume it's direct map
        candidates.push(zhJson);
      }
      // merge
      candidates.forEach(c => {
        if(c && typeof c === 'object'){
          Object.keys(c).forEach(k => {
            const v = c[k];
            if(typeof v === 'string') zhMap[k] = v;
            else if(v && v['zh-TW']) zhMap[k] = v['zh-TW'];
            else if(v && v['zh']) zhMap[k] = v['zh'];
          });
        }
      });
      console.log('zh-TW.json loaded, zhMap size:', Object.keys(zhMap).length);
    }catch(e){
      console.warn('Failed to parse zh-TW.json, skipping:', e.message);
    }
  } else {
    console.log('zh-TW.json not found; skipping this source');
  }

  // build zh map from EN.txt (zh column)
  let enTxtMap = {};
  if(fs.existsSync(enTxtFile)){
    try{
      const raw = fs.readFileSync(enTxtFile,'utf8');
      enTxtMap = parseENtxtToMap(raw);
      console.log('EN.txt parsed, enTxtMap size:', Object.keys(enTxtMap).length);
    }catch(e){
      console.warn('Failed to parse EN.txt:', e.message);
    }
  } else {
    console.log('EN.txt not found; skipping this source');
  }

  // read CSV
  const rawCsv = fs.readFileSync(csvFile,'utf8');
  const lines = rawCsv.split(/\r?\n/);
  const { header, rows } = csvParseLines(lines);

  let filled = 0;
  const outRows = [header];
  rows.forEach(r => {
    const parts = splitCsvRow(r);
    if(!parts){
      // keep as-is
      outRows.push(r);
      return;
    }
    const [key, zh, existing_en] = parts;
    let newZh = zh;
    if(!newZh){
      if(zhMap[key]) newZh = zhMap[key];
      else if(enTxtMap[key]) newZh = enTxtMap[key];
    }
    if(newZh && newZh.trim().length>0) filled++;
    outRows.push([csvEscape(key), csvEscape(newZh), csvEscape(existing_en)].join(','));
  });

  fs.writeFileSync(outCsv, outRows.join('\n'), 'utf8');
  console.log('Wrote', outCsv, '— filled zh count:', filled, 'of', rows.length);
  process.exit(0);
}catch(err){
  console.error('Error:', err.message);
  process.exit(2);
}
