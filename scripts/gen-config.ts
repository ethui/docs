import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, basename,relative } from 'node:path';

const baseDir = './';
const outputFile = './config.json';

const exclude = (entry)=>!entry.name.startsWith('.') && entry.name !=="scripts";

const camelize = (str: string) => str.replace(/\s/g, '-').toLowerCase();

const getSections = (dir: string): any => {
  const entries = readdirSync(dir, { withFileTypes: true });
  const result = entries.filter(exclude).map(entry => {
    const fullPath = join(dir, entry.name);
    const title = entry.name;
      const slug = camelize(title);
    if (entry.isDirectory()) {
      return {
        title,
        slug,
        children: getSections(fullPath)
      };
    }
    if (entry.isFile() && entry.name.endsWith('.md')) {
      const content = readFileSync(fullPath, 'utf-8');
      const titleMatch = content.match(/^# (.+)$/m);
      const title = basename(fullPath, '.md');
      const slug = camelize(title);
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
  sections: getSections(baseDir)
};

writeFileSync(outputFile, JSON.stringify(config, null, 2));
console.log(`Config generated: ${outputFile}`);
