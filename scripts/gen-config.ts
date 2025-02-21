import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, basename,relative } from 'node:path';

const baseDir = './';
const outputFile = './config.json';

const exclude = (entry)=>!entry.name.startsWith('.') && entry.name !=="scripts";

const titleize = (str: string) => 
  str.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ').replace('Ethui', 'ethui');

const getMarkdownFiles = (dir: string): any => {
  const entries = readdirSync(dir, { withFileTypes: true });
  const result = entries.filter(exclude).map(entry => {
    const fullPath = join(dir, entry.name);
    const slug = entry.name;
    const title = titleize(slug);
    if (entry.isDirectory()) {
      return {
        title,
        slug,
        children: getMarkdownFiles(fullPath)
      };
    }
    if (entry.isFile() && entry.name.endsWith('.md')) {
      const content = readFileSync(fullPath, 'utf-8');
      const titleMatch = content.match(/^# (.+)$/m);
      const slug = basename(fullPath, '.md');
    const title = titleize(slug);
      return {
        title,
        slug
      };
    }
    return null;
  }).filter(Boolean);
  return result;
};

const config = {
  sections: getMarkdownFiles(baseDir)
};

writeFileSync(outputFile, JSON.stringify(config, null, 2));
console.log(`Config generated: ${outputFile}`);
console.log(JSON.stringify(config, null, 2));
