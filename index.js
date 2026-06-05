const fs = require('fs');
const path = require('path');

const docsDir = path.join(__dirname, 'docs');
const outputFile = process.argv[2] || path.join(docsDir, 'result.json');

const results = [];

function walkDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      walkDir(filePath);
    } else if (file.endsWith('.md') || file.endsWith('.mdx')) {
      processFile(filePath);
    }
  }
}

function processFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  
  // Parse frontmatter
  const frontmatterRegex = /^---\r?\n([\s\S]+?)\r?\n---/;
  const match = content.match(frontmatterRegex);
  
  let title = '';
  let body = '';
  
  if (match) {
    const frontmatter = match[1];
    body = content.replace(match[0], ''); // Remove frontmatter from body
    
    // Extract title
    const titleMatch = frontmatter.match(/^title:\s*(.+)$/m);
    if (titleMatch) {
      title = titleMatch[1].replace(/['"]/g, '').trim();
    }
  } else {
    body = content;
  }
  
  // If no title from frontmatter, use filename
  if (!title) {
    title = path.basename(filePath, path.extname(filePath));
  }
  
  // Clean up body text for search indexing
  let cleanBody = body
    // Remove imports
    .replace(/^import\s+[\s\S]+?from\s+['"].+?['"];?/gm, '')
    // Remove code blocks
    .replace(/```[\s\S]+?```/g, '')
    // Remove JSX tags/components (e.g., <TimeTable ... />, <Vi />)
    .replace(/<[^>]+>/g, '')
    // Remove markdown headers
    .replace(/^#+\s+/gm, '')
    // Remove markdown links but keep text: [text](link) -> text
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    // Remove extra whitespaces
    .replace(/\s+/g, ' ')
    .trim();

  // Get relative path from docs directory
  const relativePath = path.relative(docsDir, filePath);
  // URL should be: /docs/path/to/file (stripped of extension)
  const urlPath = '/docs/' + relativePath.replace(/\.mdx?$/, '').replace(/\\/g, '/');

  results.push({
    url: urlPath,
    title,
    body: cleanBody
  });
}

walkDir(docsDir);

fs.writeFileSync(outputFile, JSON.stringify(results, null, 2), 'utf8');
console.log(`Successfully generated search index with ${results.length} pages at ${outputFile}`);
