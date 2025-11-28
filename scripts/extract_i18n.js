const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const scanDir = path.join(root, 'js');
const outFile = path.join(root, 'i18n_extraction.json');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        const fp = path.join(dir, file);
        const stat = fs.statSync(fp);
        if (stat && stat.isDirectory()) {
            results = results.concat(walk(fp));
        } else if (fp.endsWith('.js')) {
            results.push(fp);
        }
    });
    return results;
}

function extractFromFile(fp) {
    const content = fs.readFileSync(fp, 'utf8');
    const lines = content.split(/\r?\n/);
    const results = [];
    const re = /showMessage\(\s*([`'"])([\s\S]*?)\1\s*\)/g;

    lines.forEach((line, i) => {
        let match;
        // We'll also search whole file to capture multiline template strings
        while ((match = re.exec(line)) !== null) {
            results.push({
                file: fp.replace(root + path.sep, ''),
                line: i + 1,
                text: match[2].trim()
            });
        }
    });

    // fallback: try to find multiline template literals by scanning whole file content
    const reMulti = /showMessage\(\s*`([\s\S]*?)`\s*\)/g;
    let m;
    while ((m = reMulti.exec(content)) !== null) {
        // find line number roughly
        const idx = content.substr(0, m.index).split(/\r?\n/).length;
        results.push({
            file: fp.replace(root + path.sep, ''),
            line: idx,
            text: m[1].trim()
        });
    }

    return results;
}

function main() {
    const files = walk(scanDir);
    const all = [];
    files.forEach(fp => {
        try {
            const ex = extractFromFile(fp);
            ex.forEach(e => all.push(e));
        } catch (err) {
            console.error('err reading', fp, err.message);
        }
    });

    // generate suggested keys (unique)
    const keys = {};
    all.forEach((item, idx) => {
        const base = (item.file + ':' + item.line).replace(/[/\\.]/g, '_').replace(/[^a-zA-Z0-9_]/g, '_');
        let key = 'evt_' + base;
        // ensure uniqueness
        let suffix = 1;
        while (keys[key]) {
            key = 'evt_' + base + '_' + suffix++;
        }
        keys[key] = true;
        item.suggested_key = key;
    });

    const out = { generated_at: new Date().toISOString(), items: all };
    fs.writeFileSync(outFile, JSON.stringify(out, null, 2), 'utf8');
    console.log('Wrote', outFile, 'with', all.length, 'entries');
}

main();
