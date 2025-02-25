import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { unified } from 'unified';
import { join } from 'node:path';
import markdown from 'remark-parse';
import frontmatter from 'remark-frontmatter';
import { visit } from 'unist-util-visit';
import * as yaml from 'js-yaml';

const baseDir = './';
const outputFile = './config.json';

const exclude = (entry: { name: string }) => !entry.name.startsWith('.') && entry.name !== "scripts" && entry.name !== "node_modules";

const titleize = (str: string) =>
  str.replace(/(?<=-)[a-z]|^[a-z]/, (match) => match.toUpperCase().replace('-', ' '));

const extractYAMLFrontMatter = (filePath: string): any => {
  const content = readFileSync(filePath, 'utf-8');
  const fileTree = unified()
    .use(markdown)
    .use(frontmatter)
    .parse(content);

  let yamlData: unknown;
  visit(fileTree, 'yaml', (node) => {
    yamlData = yaml.load(node.value);
  });

  return yamlData;
};

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
      const frontmatter = extractYAMLFrontMatter(fullPath);
      return {
        title: frontmatter.title,
        slug: frontmatter.slug
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
