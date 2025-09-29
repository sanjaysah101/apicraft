#!/usr/bin/env node
import { readFileSync } from 'fs';

function countExecutableLines(filePath) {
  const content = readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  
  let count = 0;
  let inMultilineComment = false;
  
  for (let line of lines) {
    const trimmed = line.trim();
    
    // Handle multiline comments
    if (trimmed.startsWith('/*')) {
      inMultilineComment = true;
    }
    if (trimmed.endsWith('*/')) {
      inMultilineComment = false;
      continue;
    }
    if (inMultilineComment) {
      continue;
    }
    
    // Skip empty lines and comments
    if (trimmed === '' || trimmed.startsWith('//')) {
      continue;
    }
    
    count++;
  }
  
  return count;
}

const lineCount = countExecutableLines('./index.js');
console.log(`\n📊 Line Count: ${lineCount} / 300`);

if (lineCount === 300) {
  console.log('✅ Perfect! Exactly 300 lines.\n');
  process.exit(0);
} else if (lineCount < 300) {
  console.log(`⚠️  Under limit by ${300 - lineCount} lines.\n`);
  process.exit(0);
} else {
  console.log(`❌ Over limit by ${lineCount - 300} lines!\n`);
  process.exit(1);
}