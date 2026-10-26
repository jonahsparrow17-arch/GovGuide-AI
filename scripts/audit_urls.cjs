const fs = require('fs');
const path = require('path');

function walk(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      if (!filePath.includes('node_modules') && !filePath.includes('.git') && !filePath.includes('dist')) {
        walk(filePath, fileList);
      }
    } else if (file.endsWith('.ts') || file.endsWith('.tsx') || file.endsWith('.json') || file.endsWith('.html')) {
      fileList.push(filePath);
    }
  }
  return fileList;
}

const files = walk('./src').concat(['./server.ts', './index.html']);
const urlRegex = /https?:\/\/[^\s"'`<>)]+/g;
const linksFound = [];

for (const file of files) {
  const content = fs.readFileSync(file, 'utf-8');
  let match;
  while ((match = urlRegex.exec(content)) !== null) {
    linksFound.push({ file, url: match[0].replace(/[,;]+$/, '') });
  }
}

console.log('Total link occurrences found:', linksFound.length);
const uniqueUrls = [...new Set(linksFound.map(l => l.url))];
console.log('Unique URLs count:', uniqueUrls.length);

const grouped = {};
for (const item of linksFound) {
  if (!grouped[item.url]) grouped[item.url] = [];
  grouped[item.url].push(item.file);
}

for (const [url, fileList] of Object.entries(grouped).sort()) {
  console.log(`\nURL: ${url}`);
  console.log(`  Found in (${fileList.length}): ${[...new Set(fileList)].join(', ')}`);
}
