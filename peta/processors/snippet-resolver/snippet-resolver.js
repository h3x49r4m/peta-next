const fs = require('fs-extra');
const path = require('path');

class SnippetResolver {
  constructor() {
    this.snippets = new Map();
    this.contentDir = path.join(__dirname, '../../../_content/snippets');
  }

  async loadSnippets() {
    console.log('Loading snippets...');
    
    const files = await fs.readdir(this.contentDir);
    const rstFiles = files.filter(file => file.endsWith('.rst'));
    
    for (const file of rstFiles) {
      const filePath = path.join(this.contentDir, file);
      const content = await fs.readFile(filePath, 'utf8');
      
      // Parse RST file (simplified parsing for demo)
      const id = path.basename(file, '.rst');
      const titleMatch = content.match(/^(.+)\n=+\n/m);
      const frontmatterMatch = content.match(/^---\n(.*?)\n---\n/s);
      
      let frontmatter = {};
      if (frontmatterMatch) {
        try {
          frontmatter = JSON.parse(frontmatterMatch[1].replace(/:\s*([^"\n]+)/g, ': "$1"'));
        } catch (e) {
          // Ignore parsing errors
        }
      }
      
      const title = titleMatch ? titleMatch[1].trim() : id;
      const tags = frontmatter.tags || [];
      
      this.snippets.set(id, {
        id,
        title,
        content: this.parseContent(content),
        tags
      });
    }
    
    console.log(`Loaded ${this.snippets.size} snippets`);
    return Array.from(this.snippets.values());
  }

  parseContent(content) {
    // Remove frontmatter
    content = content.replace(/^---\n.*?\n---\n/s, '');
    
    // Parse content into blocks
    const blocks = [];
    const lines = content.split('\n');
    let currentBlock = null;
    
    for (const line of lines) {
      if (line.startsWith('.. snippet-card::')) {
        // Save current block if exists
        if (currentBlock) {
          blocks.push(currentBlock);
        }
        
        // Start new snippet reference
        const snippetId = line.split('::')[1].trim();
        currentBlock = {
          type: 'snippet-ref',
          id: snippetId
        };
      } else if (currentBlock && currentBlock.type === 'snippet-ref') {
        // Skip lines after snippet directive
        continue;
      } else if (line.trim()) {
        // Regular content
        if (!currentBlock || currentBlock.type !== 'text') {
          if (currentBlock) {
            blocks.push(currentBlock);
          }
          currentBlock = {
            type: 'text',
            content: line
          };
        } else {
          currentBlock.content += '\n' + line;
        }
      }
    }
    
    // Add last block
    if (currentBlock) {
      blocks.push(currentBlock);
    }
    
    return blocks;
  }

  async resolveSnippets(content, snippets) {
    const resolvedContent = [];
    
    for (const block of content) {
      if (block.type === 'snippet-ref') {
        const snippet = snippets.find(s => s.id === block.id);
        if (snippet) {
          resolvedContent.push({
            type: 'embedded-snippet',
            id: snippet.id,
            title: snippet.title,
            content: snippet.content,
            tags: snippet.tags
          });
        }
      } else {
        resolvedContent.push(block);
      }
    }
    
    return resolvedContent;
  }
}

module.exports = SnippetResolver;