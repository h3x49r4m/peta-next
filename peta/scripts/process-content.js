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
  
  if (!await fs.pathExists(contentDir)) {
    console.log(`Directory ${contentDir} does not exist, skipping...`);
    return;
  }
  
  const files = glob.sync(`${contentDir}/*.rst`);
  console.log(`Found ${files.length} files`);
  
  const items = [];
  for (const file of files) {
    const relativePath = path.relative(contentDir, file);
    const id = relativePath.replace(/\.rst$/, '');
    
    try {
      const content = await fs.readFile(file, 'utf8');
      const parsed = await parseRst(content);
      
      items.push({
        id,
        ...parsed.frontmatter,
        content: parsed.content,
        snippet_refs: parsed.snippet_refs || []
      });
      
      console.log(`Processed ${relativePath}`);
    } catch (error) {
      console.error(`Error processing ${file}:`, error);
    }
  }
  
  // Write index file
  const indexFileName = outputType ? `${outputType}-index.json` : `${type}-index.json`;
  await fs.writeJson(path.join(OUTPUT_DIR, indexFileName), { items }, { spaces: 2 });
  
  // Write chunked files if needed
  if (items.length > CHUNK_SIZE) {
    const chunks = [];
    for (let i = 0; i < items.length; i += CHUNK_SIZE) {
      chunks.push(items.slice(i, i + CHUNK_SIZE));
    }
    
    for (let i = 0; i < chunks.length; i++) {
      await fs.writeJson(
        path.join(OUTPUT_DIR, 'content-chunks', `${outputType || type}-chunk-${i + 1}.json`),
        { items: chunks[i] },
        { spaces: 2 }
      );
    }
    
    console.log(`Created ${chunks.length} chunks with ${CHUNK_SIZE} items each`);
  } else {
    console.log(`Created chunk 1 with ${items.length} items`);
  }
}

async function processBooks() {
  console.log('Processing books...');
  
  const booksDir = path.join(CONTENT_DIR, 'books');
  if (!await fs.pathExists(booksDir)) {
    console.log('Books directory does not exist, skipping...');
    return;
  }
  
  const bookFolders = glob.sync(`${booksDir}/*/`);
  console.log(`Found ${bookFolders.length} book folders`);
  
  const books = [];
  for (const bookFolder of bookFolders) {
    const indexPath = path.join(bookFolder, 'index.rst');
    const bookName = path.basename(bookFolder);
    
    if (await fs.pathExists(indexPath)) {
      try {
        const content = await fs.readFile(indexPath, 'utf8');
        const parsed = await parseRst(content);
        
        // Read section files
        const sectionFiles = glob.sync(`${bookFolder}/*.rst`);
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
          id: bookName,
          ...parsed.frontmatter,
          content: parsed.content,
          snippet_refs: parsed.snippet_refs || [],
          sections: sections
        };
        
        books.push(bookItem);
        console.log(`Processed ${bookName}/index.rst with ${sections.length} sections`);
      } catch (error) {
        console.error(`Error processing ${indexPath}:`, error);
      }
    }
  }
  
  // Write books index
  await fs.writeJson(path.join(OUTPUT_DIR, 'books-index.json'), { items: books }, { spaces: 2 });
  console.log(`Created books index with ${books.length} books`);
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
        if (item.tags && Array.isArray(item.tags)) {
          for (const tag of item.tags) {
            if (!tags.has(tag)) {
              tags.set(tag, {
                name: tag,
                count: 0,
                items: []
              });
            }
            
            const tagData = tags.get(tag);
            tagData.count++;
            tagData.items.push({
              id: item.id,
              title: item.title,
              type: type.slice(0, -1) // Remove 's' from plural
            });
          }
        }
      }
    }
  }
  
  // Convert to array and sort
  const tagsArray = Array.from(tags.values())
    .sort((a, b) => b.count - a.count);
  
  await fs.writeJson(path.join(OUTPUT_DIR, 'tags-index.json'), tagsArray, { spaces: 2 });
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
        let contentText = '';
        
        if (item.content) {
          contentText = item.content.map(c => c.content || '').join(' ');
        }
        
        // For books, also include sections content
        if (type === 'books' && item.sections) {
          const sectionsText = item.sections.map(section => 
            section.content.map(c => c.content || '').join(' ')
          ).join(' ');
          contentText += ' ' + sectionsText;
        }
        
        documents.push({
          id: item.id,
          type,
          title: item.frontmatter?.title || 'Untitled',
          content: contentText.replace(/<[^>]*>/g, ''), // Strip HTML
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
    return {
      frontmatter: {},
      content: [],
      snippet_refs: []
    };
  }
}

// Run the processor
if (require.main === module) {
  processContent().catch(console.error);
}

module.exports = {
  processContent,
  processContentType,
  processBooks,
  generateTagsIndex,
  generateSearchIndex
};