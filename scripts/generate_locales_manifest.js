const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const localesDir = path.join(root, 'locales');
const outFile = path.join(localesDir, 'manifest.json');

if (!fs.existsSync(localesDir)) {
  console.error('No locales directory found at', localesDir);
  process.exit(1);
}

const files = fs.readdirSync(localesDir).filter(f => f.endsWith('.json') && f !== 'manifest.json');
const manifest = { files };
fs.writeFileSync(outFile, JSON.stringify(manifest, null, 2), 'utf8');
console.log('Wrote locales manifest with', files.length, 'files to', outFile);
