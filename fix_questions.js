const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'data', 'questions.js');
let content = fs.readFileSync(filePath, 'utf8');

// The user might paste `[ { ... } ]` or just `{ ... }, { ... }`
// We need to ensure `questions` is a single flat array.
// First, let's fix any `} \n [ \n {` or `} \n ] \n [ \n {` syntax.
// A safe way is to find all `{ id: ... }` objects and extract them, then rebuild the array.
// But that's complex since it contains JS code (String.raw).

// Instead, let's just do targeted string replacements for the boundaries they paste.
// 1. Remove all standalone `[` or `]` that are between objects.
content = content.replace(/\}\s*,?\s*\]\s*,?\s*\[\s*\{/g, '},\n  {');
content = content.replace(/\}\s*,?\s*\[\s*\{/g, '},\n  {');

// 2. Ensure the file ends properly
content = content.replace(/\}\s*\]?\s*\]?\s*;?\s*$/g, '}\n];');

// 3. Update the 2020 Image URLs
let lines = content.split('\n');
let isTargetYear = false;
let updatedCount = 0;

for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('year: 2020') || lines[i].includes('"year": 2020')) {
    isTargetYear = true;
  } else if (lines[i].match(/["']?year["']?:\s*(2021|2022|2023|2024|2025|2026)/)) {
    isTargetYear = false;
  }
  
  if (isTargetYear) {
    if (lines[i].includes('/images/')) {
      lines[i] = lines[i].replace(/\/images\//g, 'https://xxhbqsayrqprfrmeixhn.supabase.co/storage/v1/object/public/question-images-from2020/');
      updatedCount++;
    }
  }
}

fs.writeFileSync(filePath, lines.join('\n'));
console.log(`Syntax fixed and ${updatedCount} image URLs updated for 2020 questions.`);
