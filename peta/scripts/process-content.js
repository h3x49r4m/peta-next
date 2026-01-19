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
  
  // Process posts (from articles directory)
  await processContentType('articles', snippets, snippetResolver, 'articles');
  
  // Process snippets
  await processContentType('snippets', snippets);
  
  // Process projects
  await processContentType('projects', snippets);
  
  // Process books with special handling for folder structure
  await processBooks();
  
  // Generate tags index
  await generateTagsIndex();
  
  // Generate search index
  await generateSearchIndex();
  
  console.log('Content processing complete!');
}

async function processContentType(type, snippets = [], snippetResolver = null, outputType = null) {
  console.log(`Processing ${type}...`);
  
  const contentDir = path.join(CONTENT_DIR, type);
  console.log('Looking in:', contentDir);
  
  const files = glob.sync(`${contentDir}/*.rst`);
  console.log(`Found ${files.length} files`);
  
  const items = [];
  
  for (const file of files) {
    const content = await fs.readFile(file, 'utf8');
    const parsed = await parseRst(content);
    
    // Process snippet references if this is an article and we have snippet resolver
    const actualType = outputType || type;
    if (actualType === 'articles' && snippetResolver) {
      parsed.content = await snippetResolver.resolveSnippets(parsed.content, snippets);
    }
    
    items.push(parsed);
    
    const filename = path.basename(file, '.rst');
    console.log(`Processed ${filename}.rst`);
  }
  
  // Create chunks
  const actualType = outputType || type;
  for (let i = 0; i < items.length; i += CHUNK_SIZE) {
    const chunk = items.slice(i, i + CHUNK_SIZE);
    const chunkNumber = Math.floor(i / CHUNK_SIZE) + 1;
    
    await fs.writeJson(
      path.join(OUTPUT_DIR, 'content-chunks', `${actualType}-chunk-${chunkNumber}.json`),
      chunk,
      { spaces: 2 }
    );
    
    console.log(`Created chunk ${chunkNumber} with ${chunk.length} items`);
  }
  
  // Create index file
  await fs.writeJson(
    path.join(OUTPUT_DIR, `${actualType}-index.json`),
    { items, total: items.length },
    { spaces: 2 }
  );
}

async function generateTagsIndex() {
  console.log('Generating tags index...');
  
  const tags = new Map();
  
  // Process all content types
  for (const type of ['posts', 'snippets', 'projects', 'books']) {
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
  for (const type of ['posts', 'snippets', 'projects', 'books']) {
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

async function processBooks() {
  console.log('Processing books...');
  
  const booksDir = path.join(CONTENT_DIR, 'books');
  console.log('Looking in:', booksDir);
  
  if (!(await fs.pathExists(booksDir))) {
    console.log('Books directory not found, skipping...');
    return;
  }
  
  const bookFolders = await fs.readdir(booksDir);
  const items = [];
  
  for (const folder of bookFolders) {
    const folderPath = path.join(booksDir, folder);
    const stat = await fs.stat(folderPath);
    
    if (stat.isDirectory()) {
      const indexPath = path.join(folderPath, 'index.rst');
      
      if (await fs.pathExists(indexPath)) {
        const content = await fs.readFile(indexPath, 'utf8');
        const parsed = await parseRst(content);
        
        // Read section files
        const sectionFiles = glob.sync(`${folderPath}/*.rst`);
        const sections = [];
        
        for (const sectionFile of sectionFiles) {
          if (!sectionFile.endsWith('index.rst')) {
            const sectionContent = await fs.readFile(sectionFile, 'utf8');
            const sectionParsed = await parseRst(sectionContent);
            const sectionName = path.basename(sectionFile, '.rst');
            sections.push({
              id: sectionName,
              title: sectionParsed.frontmatter.title || sectionName,
              content: sectionParsed.content
            });
          }
        }
        
        // Create a single item with sections
        const bookItem = {
          frontmatter: parsed.frontmatter,
          content: parsed.content,
          snippet_refs: parsed.snippet_refs || [],
          sections: sections
        };
        
        items.push(bookItem);
        
        console.log(`Processed ${folder}/index.rst`);
      }
    }
  }
  
  // Create index file for books
  await fs.writeJson(
    path.join(OUTPUT_DIR, 'books-index.json'),
    { items, total: items.length },
    { spaces: 2 }
  );
  
  console.log(`Created books index with ${items.length} items`);
}

// Run the processor
processContent().catch(console.error);