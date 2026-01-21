// WebAssembly bindings for RST parser
let wasmModule = null;
let parserInstance = null;

// Load the WebAssembly module
export async function loadWasmModule() {
  if (wasmModule) return wasmModule;
  
  try {
    // Import the WebAssembly module
    const { default: init } = await import('./rst_parser.js');
    wasmModule = await init();
    const { RstParser } = wasmModule;
    parserInstance = new RstParser();
    return wasmModule;
  } catch (error) {
    console.error('Failed to load WebAssembly module:', error);
    throw error;
  }
}

// Parse RST content using WebAssembly
export async function parseRst(rstContent) {
  if (!parserInstance) {
    await loadWasmModule();
  }
  
  try {
    const result = parserInstance.parse(rstContent);
    console.log('Successfully parsed with WASM');
    return JSON.parse(result);
  } catch (error) {
    console.error('Failed to parse RST content with WASM, falling back to JavaScript parser:', error);
    return parseRstFallback(rstContent);
  }
}

// Fallback JavaScript parser for development
export function parseRstFallback(rstContent) {
  const lines = rstContent.split('\n');
  let frontmatterEnd = 0;
  let inFrontmatter = false;
  let frontmatterStr = '';
  const contentBlocks = [];
  const snippetRefs = [];
  const rstFields = new Map();
  let inRstFields = false;
  let title = '';

  // First, check for YAML frontmatter
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line === '---') {
      if (!inFrontmatter) {
        inFrontmatter = true;
        continue;
      } else {
        frontmatterEnd = i;
        break;
      }
    }
    if (inFrontmatter) {
      frontmatterStr += lines[i] + '\n';
    }
  }

  let frontmatter;
  if (inFrontmatter) {
    // Parse YAML frontmatter
    frontmatter = parseFrontmatter(frontmatterStr);
  } else {
    // No YAML frontmatter, look for RST fields and title
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Check for title (underlined with =)
      if (i > 0 && line.startsWith('=') && line.trim() !== '') {
        const prevLine = lines[i - 1].trim();
        if (prevLine !== '' && !prevLine.startsWith('.')) {
          title = prevLine;
          frontmatterEnd = i + 1;
        }
      }
      
      // Check for RST field directives
      if (line.trim().startsWith('.. ') && line.trim().includes('::')) {
        inRstFields = true;
        const match = line.trim().match(/\.\. (.+)::\s*(.*)/);
        if (match) {
          rstFields.set(match[1], match[2]);
        }
      } else if (inRstFields && (line.trim() === '' || line.startsWith('   '))) {
        // Continuation of field value
        if (line.startsWith('   ') && line.trim() !== '') {
          const lastField = Array.from(rstFields.keys()).pop();
          if (lastField) {
            const currentValue = rstFields.get(lastField);
            rstFields.set(lastField, currentValue + '\n' + line.trim());
          }
        }
      } else {
        inRstFields = false;
      }
    }
    
    // Parse RST fields
    frontmatter = parseRstFields(rstFields, title);
  }

  // Parse content
  let currentBlock = '';
  let inDirective = false;
  let directiveContent = '';
  let directiveType = '';

  for (let i = frontmatterEnd + 1; i < lines.length; i++) {
    const line = lines[i];
    
    if (line.startsWith('.. snippet-card::')) {
      // Save current text block if exists
      if (currentBlock.trim()) {
        contentBlocks.push({
          type: 'text',
          content: currentBlock.trim(),
          id: ''
        });
        currentBlock = '';
      }

      // Start snippet directive
      inDirective = true;
      directiveType = 'snippet-card';
      const snippetId = line.replace('.. snippet-card::', '').trim();
      snippetRefs.push(snippetId);
      directiveContent = '';
    } else if (line.startsWith('.. code-block::')) {
      // Save current text block if exists
      if (currentBlock.trim()) {
        contentBlocks.push({
          type: 'text',
          content: currentBlock.trim(),
          id: ''
        });
        currentBlock = '';
      }

      // Start code block directive
      inDirective = true;
      directiveType = 'code-block';
      const language = line.replace('.. code-block::', '').trim();
      directiveContent = '';
      // Store language for later use
      rstFields.set('currentLanguage', language);
    } else if (line.startsWith('.. toctree::')) {
      // Save current text block if exists
      if (currentBlock.trim()) {
        contentBlocks.push({
          type: 'text',
          content: currentBlock.trim(),
          id: ''
        });
        currentBlock = '';
      }
      
      // Start toctree directive
      inDirective = true;
      directiveType = 'toctree';
      directiveContent = '';
    } else if (inDirective) {
      if (line.startsWith('   ') || line.trim() === '') {
        // For code blocks, remove the 3 leading spaces that RST requires
        // For empty lines, keep them as-is
        const processedLine = line.startsWith('   ') ? line.substring(3) : line;
        directiveContent += processedLine + '\n';
      } else {
        // End of directive
        inDirective = false;
        
        if (directiveType === 'snippet-card') {
          contentBlocks.push({
            type: `${directiveType}-ref`,
            content: snippetRefs[snippetRefs.length - 1],
            id: ''
          });
          
          // Add the directive content as text
          if (directiveContent.trim()) {
            contentBlocks.push({
              type: 'text',
              content: directiveContent.trim(),
              id: ''
            });
          }
        } else if (directiveType === 'code-block') {
          // Get the language from the stored field
          const language = rstFields.get('currentLanguage') || 'text';
          
          contentBlocks.push({
            type: 'code-block',
            content: directiveContent.replace(/\n\s*$/, '\n'), // Only trim trailing whitespace, preserve internal indentation
            id: '',
            language: language
          });
          
          directiveContent = '';
          directiveType = '';
          rstFields.delete('currentLanguage');
        } else if (directiveType === 'toctree') {
          // Parse toctree content and create a table of contents
          const toctreeLines = directiveContent.split('\n');
          const tocSections = [];
          
          for (const toctreeLine of toctreeLines) {
            const trimmedLine = toctreeLine.trim();
            
            // Skip empty lines and options
            if (!trimmedLine || trimmedLine.startsWith(':')) {
              continue;
            }
            
            // Skip lines that don't look like section names
            if (trimmedLine.includes(' ') || trimmedLine.includes('"') || trimmedLine.includes("'")) {
              continue;
            }
            
            // Convert section-id to Title Case for display
            const title = trimmedLine.split('-').map(word => 
              word.charAt(0).toUpperCase() + word.slice(1)
            ).join(' ');
            
            tocSections.push(title);
          }
          
          if (tocSections.length > 0) {
            contentBlocks.push({
              type: 'toctree',
              content: tocSections,
              id: ''
            });
          }
          
          directiveContent = '';
          directiveType = '';
        }
        
        // Add current line to new text block
        currentBlock = line + '\n';
      }
    } else {
      currentBlock += line + '\n';
    }
  }

  // Add final text block if exists
  if (currentBlock.trim()) {
    contentBlocks.push({
      type: 'text',
      content: currentBlock.trim(),
      id: ''
    });
  }
  
  // If we're still in a directive at the end of the file, add it
  if (inDirective) {
    if (directiveType === 'code-block') {
      // Get the language from the stored field
      const language = rstFields.get('currentLanguage') || 'text';
      
      contentBlocks.push({
        type: 'code-block',
        content: directiveContent.replace(/\n\s*$/, '\n'), // Only trim trailing whitespace, preserve internal indentation
        id: '',
        language: language
      });
    }
  }

  return {
    frontmatter,
    content: contentBlocks,
    snippet_refs: snippetRefs
  };
}

// Parse RST field directives
function parseRstFields(fields, title) {
  const frontmatter = {
    title: title,
    date: '',
    tags: [],
    author: '',
    snippet_id: '',
    github_url: '',
    demo_url: '',
    description: '',
    cover_image: ''
  };

  if (fields.has('author')) {
    frontmatter.author = fields.get('author');
  }
  
  if (fields.has('date')) {
    frontmatter.date = fields.get('date');
  }
  
  if (fields.has('tags')) {
    frontmatter.tags = fields.get('tags').split(',').map(tag => tag.trim());
  }
  
  if (fields.has('snippet_id')) {
    frontmatter.snippet_id = fields.get('snippet_id');
  }
  
  if (fields.has('github_url')) {
    frontmatter.github_url = fields.get('github_url');
  }
  
  if (fields.has('demo_url')) {
    frontmatter.demo_url = fields.get('demo_url');
  }
  
  if (fields.has('description')) {
    frontmatter.description = fields.get('description');
  }
  
  if (fields.has('cover_image')) {
    frontmatter.cover_image = fields.get('cover_image');
  }

  return frontmatter;
}

// Simple YAML parser for frontmatter
function parseFrontmatter(frontmatterStr) {
  const frontmatter = {
    title: '',
    date: '',
    tags: [],
    author: '',
    snippet_id: '',
    github_url: '',
    demo_url: '',
    description: '',
    cover_image: ''
  };

  const lines = frontmatterStr.split('\n');
  for (const line of lines) {
    const colonIndex = line.indexOf(':');
    if (colonIndex > 0) {
      const key = line.substring(0, colonIndex).trim();
      let value = line.substring(colonIndex + 1).trim();

      // Remove quotes if present
      if (value.startsWith('"') && value.endsWith('"')) {
        value = value.slice(1, -1);
      }

      switch (key) {
        case 'title':
          frontmatter.title = value;
          break;
        case 'date':
          frontmatter.date = value;
          break;
        case 'author':
          frontmatter.author = value;
          break;
        case 'snippet_id':
          frontmatter.snippet_id = value;
          break;
        case 'github_url':
          frontmatter.github_url = value;
          break;
        case 'demo_url':
          frontmatter.demo_url = value;
          break;
        case 'description':
          frontmatter.description = value;
          break;
        case 'cover_image':
          frontmatter.cover_image = value;
          break;
        case 'tags':
          // Parse array format
          if (value.startsWith('[') && value.endsWith(']')) {
            value = value.slice(1, -1);
          }
          frontmatter.tags = value.split(',').map(tag => {
            tag = tag.trim();
            if (tag.startsWith('"') && tag.endsWith('"')) {
              tag = tag.slice(1, -1);
            }
            return tag;
          }).filter(tag => tag);
          break;
      }
    }
  }

  return frontmatter;
}