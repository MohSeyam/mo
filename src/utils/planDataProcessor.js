// planDataProcessor.js
// Node.js script to process plan data files (2_1.md to 2_8.md)
// Usage: node src/utils/planDataProcessor.js

const fs = require('fs');
const path = require('path');

const SRC_DIR = path.join(__dirname, '../');
const OUT_DIR = path.join(__dirname, '../planData');
const FILES = Array.from({ length: 8 }, (_, i) => `2_${i + 1}.md`);

// Ensure output directory exists
if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR);

function cleanJsonString(str) {
  // Remove trailing commas, fix brackets, and unescape
  return str
    .replace(/\\\[/g, '[')
    .replace(/\\\]/g, ']')
    .replace(/\\_/g, '_')
    .replace(/\r?\n/g, '\n')
    .replace(/,\s*}/g, '}')
    .replace(/,\s*]/g, ']')
    .trim();
}

function splitObjects(raw) {
  // Split by closing curly brace followed by optional whitespace and opening curly brace
  // Add braces to each part
  const parts = raw
    .split(/}\s*\n\s*{/)
    .map((part, idx, arr) => {
      if (idx === 0) return part + '}';
      if (idx === arr.length - 1) return '{' + part;
      return '{' + part + '}';
    });
  return parts;
}

function processFiles() {
  let allWeeks = [];
  for (const file of FILES) {
    const filePath = path.join(SRC_DIR, file);
    if (!fs.existsSync(filePath)) {
      console.warn(`File not found: ${file}`);
      continue;
    }
    const raw = fs.readFileSync(filePath, 'utf8');
    const cleaned = cleanJsonString(raw);
    const objects = splitObjects(cleaned);
    for (const objStr of objects) {
      try {
        const week = JSON.parse(objStr);
        allWeeks.push(week);
      } catch (e) {
        console.error(`Error parsing week in ${file}:`, e.message);
      }
    }
  }
  return allWeeks;
}

function splitByPhase(weeks) {
  const phases = {};
  for (const week of weeks) {
    const phase = week.phase || 1;
    if (!phases[phase]) phases[phase] = [];
    phases[phase].push(week);
  }
  return phases;
}

function writePhaseFiles(phases) {
  Object.entries(phases).forEach(([phase, weeks]) => {
    const outPath = path.join(OUT_DIR, `planPhase${phase}.js`);
    fs.writeFileSync(
      outPath,
      `// Auto-generated plan data for phase ${phase}\nmodule.exports = ${JSON.stringify(weeks, null, 2)};\n`
    );
    console.log(`Wrote ${outPath}`);
  });
}

function writeIndexFile(phases) {
  const lines = Object.keys(phases).map(
    (phase) => `const planPhase${phase} = require('./planPhase${phase}.js');`
  );
  lines.push('module.exports = {');
  Object.keys(phases).forEach((phase) => {
    lines.push(`  planPhase${phase},`);
  });
  lines.push('};\n');
  fs.writeFileSync(path.join(OUT_DIR, 'index.js'), lines.join('\n'));
  console.log('Wrote index.js');
}

function main() {
  const allWeeks = processFiles();
  const phases = splitByPhase(allWeeks);
  writePhaseFiles(phases);
  writeIndexFile(phases);
  console.log('Done!');
}

main();