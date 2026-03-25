#!/usr/bin/env node

import * as fs from 'fs';
import * as path from 'path';

const versionMapping: Record<string, string[]> = {
  'ord-a': ['ord-2024-spring', 'ord-2023-spring', 'ord-2022-spring'],
  'ord-b': ['ord-2023-fall', 'ord-2022-fall', 'ord-2021-fall'],
  'ord-c': ['ord-2021-spring', 'ord-2020-fall'],
  'las-a': ['las-2024-spring', 'las-2023-spring', 'las-2022-spring'],
  'las-b': ['las-2023-fall', 'las-2022-fall', 'las-2021-fall'],
  'las-c': ['las-2021-spring', 'las-2020-fall'],
  'mek-a': ['mek-2024-spring', 'mek-2023-spring', 'mek-2022-spring'],
  'mek-b': ['mek-2023-fall', 'mek-2022-fall', 'mek-2021-fall'],
  'mek-c': ['mek-2021-spring', 'mek-2020-fall'],
  'xyz-a': ['xyz-2024-spring', 'xyz-2023-spring', 'xyz-2022-spring'],
  'xyz-b': ['xyz-2023-fall', 'xyz-2022-fall', 'xyz-2021-fall'],
  'xyz-c': ['xyz-2021-spring', 'xyz-2020-fall'],
  'kva-a': ['kva-2024-spring', 'kva-2023-spring', 'kva-2022-spring'],
  'kva-b': ['kva-2023-fall', 'kva-2022-fall', 'kva-2021-fall'],
  'kva-c': ['kva-2021-spring', 'kva-2020-fall'],
  'dtk-a': ['dtk-2024-spring', 'dtk-2023-spring', 'dtk-2022-spring'],
  'dtk-b': ['dtk-2023-fall', 'dtk-2022-fall', 'dtk-2021-fall'],
  'dtk-c': ['dtk-2021-spring', 'dtk-2020-fall'],
};

const filesToUpdate = [
  'constants/hogskoleprovet.ts',
  'constants/hogskoleprovet-questions.ts',
  'constants/hogskoleprovet-questions-extended.ts',
];

function updateFile(filePath: string) {
  console.log(`\n📝 Processing: ${filePath}`);
  
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  File not found: ${filePath}`);
    return;
  }

  let content = fs.readFileSync(filePath, 'utf-8');
  let changesMade = 0;

  // Update all testVersion values
  Object.entries(versionMapping).forEach(([oldVersion, newVersions]) => {
    // Use the first version in the array as the primary mapping
    const primaryVersion = newVersions[0];
    
    // Replace testVersion: 'ord-a' with testVersion: 'ord-2024-spring'
    const regex = new RegExp(`testVersion: '${oldVersion}'`, 'g');
    const matches = content.match(regex);
    
    if (matches) {
      content = content.replace(regex, `testVersion: '${primaryVersion}'`);
      changesMade += matches.length;
      console.log(`  ✅ Replaced ${matches.length} instances of '${oldVersion}' with '${primaryVersion}'`);
    }
  });

  if (changesMade > 0) {
    fs.writeFileSync(filePath, content, 'utf-8');
    console.log(`  ✨ Total changes: ${changesMade}`);
  } else {
    console.log(`  ℹ️  No changes needed`);
  }
}

console.log('🚀 Starting HP test version update...\n');
console.log('Mapping:');
Object.entries(versionMapping).forEach(([old, news]) => {
  console.log(`  ${old} → ${news[0]}`);
});

filesToUpdate.forEach(file => updateFile(file));

console.log('\n✅ Update complete!\n');
console.log('Note: The mapping in HogskoleprovetContext.tsx will handle fallback compatibility.');
