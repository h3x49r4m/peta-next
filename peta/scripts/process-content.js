const fs = require('fs-extra');
const path = require('path');
const glob = require('glob');
const { parseRstFallback } = require('../processors/wasm-bindings/rst-parser');
const SnippetResolver = require('../processors/snippet-resolver/snippet-resolver');

// Configuration - fix paths to point to the correct locations
const CONTENT_DIR = path.join(__dirname, '../../_content');
const OUTPUT_DIR = path.join(__dirname, '../../_build/data');
const CHUNK_SIZE = 1000; // Number of items per chunk

async function processContent() {
  console.log('Processing content...');
  console.log('Content directory:', CONTENT_DIR);
  console.log('Output directory:', OUTPUT_DIR);
  
  // Ensure output directory exists
  await fs.ensureDir(OUTPUT_DIR);
  await fs.ensureDir(path.join(OUTPUT_DIR, 'content-chunks'));
  
  // Initialize snippet resolver
  const snippetResolver = new SnippetResolver();
  const snippets = await snippetResolver.loadSnippets();
  
  // Process posts
  await processContentType('posts', snippets, snippetResolver);
  
  // Process snippets
  await processContentType('snippets', snippets);
  
  // Process projects
  await processContentType('projects', snippets);
  
  // Generate tags index
  await generateTagsIndex();
  
  // Generate search index
  await generateSearchIndex();
  
  console.log('Content processing complete!');
}

async function processContentType(type, snippets = [], snippetResolver = null) {
  console.log(`Processing ${type}...`);
  
  const contentDir = path.join(CONTENT_DIR, type);
  console.log('Looking in:', contentDir);
  
  const files = glob.sync(`${contentDir}/*.rst`);
  console.log(`Found ${files.length} files`);
  
  const items = [];
  
  for (const file of files) {
    const content = await fs.readFile(file, 'utf8');
    const parsed = await parseRst(content);
    
    // Process snippet references if this is a post and we have snippet resolver
    if (type === 'posts' && snippetResolver) {
      parsed.content = await snippetResolver.resolveSnippets(parsed.content, snippets);
    }
    
    items.push(parsed);
    
    const filename = path.basename(file, '.rst');
    console.log(`Processed ${filename}.rst`);
  }
  
  // Create chunks
  for (let i = 0; i < items.length; i += CHUNK_SIZE) {
    const chunk = items.slice(i, i + CHUNK_SIZE);
    const chunkNumber = Math.floor(i / CHUNK_SIZE) + 1;
    
    await fs.writeJson(
      path.join(OUTPUT_DIR, 'content-chunks', `${type}-chunk-${chunkNumber}.json`),
      chunk,
      { spaces: 2 }
    );
    
    console.log(`Created chunk ${chunkNumber} with ${chunk.length} items`);
  }
  
  // Create index file
  await fs.writeJson(
    path.join(OUTPUT_DIR, `${type}-index.json`),
    { items, total: items.length },
    { spaces: 2 }
  );
}

async function generateTagsIndex() {
  console.log('Generating tags index...');
  
  const tags = new Map();
  
  // Process all content types
  for (const type of ['posts', 'snippets', 'projects']) {
    const indexPath = path.join(OUTPUT_DIR, `${type}-index.json`);
    
    if (await fs.pathExists(indexPath)) {
      const { items } = await fs.readJson(indexPath);
      
      for (const item of items) {
        if (item.frontmatter && item.frontmatter.tags) {
          for (const tag of item.frontmatter.tags) {
            if (!tags.has(tag)) {
              tags.set(tag, { count: 0, items: [] });
            }
            tags.get(tag).count++;
            tags.get(tag).items.push(item.id);
          }
        }
      }
    }
  }
  
  // Convert to array and sort
  const tagsArray = Array.from(tags.entries())
    .map(([name, data]) => ({ name, ...data }))
    .sort((a, b) => a.name.localeCompare(b.name));
  
  await fs.writeJson(
    path.join(OUTPUT_DIR, 'tags.json'),
    tagsArray,
    { spaces: 2 }
  );
  
  console.log(`Generated tags index with ${tagsArray.length} tags`);
}

async function generateSearchIndex() {
  console.log('Generating search index...');
  
  const documents = [];
  
  // Process all content types
  for (const type of ['posts', 'snippets', 'projects']) {
    const indexPath = path.join(OUTPUT_DIR, `${type}-index.json`);
    
    if (await fs.pathExists(indexPath)) {
      const { items } = await fs.readJson(indexPath);
      
      for (const item of items) {
        documents.push({
          id: item.id,
          type,
          title: item.frontmatter?.title || 'Untitled',
          content: item.content ? item.content.join(' ').replace(/<[^>]*>/g, '') : '', // Strip HTML
          tags: item.frontmatter?.tags || [],
          date: item.frontmatter?.date || new Date().toISOString().split('T')[0],
          url: `/${type.slice(0, -1)}/${item.id}`
        });
      }
    }
  }
  
  await fs.writeJson(
    path.join(OUTPUT_DIR, 'search-index.json'),
    documents,
    { spaces: 2 }
  );
  
  console.log(`Generated search index with ${documents.length} documents`);
}

async function parseRst(content) {
  try {
    // Try WASM parser first
    return parseRstFallback(content);
  } catch (error) {
    console.error('Error parsing RST:', error);
    throw error;
  }
}

// Run the processor
processContent().catch(console.error);