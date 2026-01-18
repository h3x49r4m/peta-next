const fs = require('fs-extra');
const path = require('path');
const { renderMath } = require('../processors/math-renderer/math-renderer');

// Configuration
const DATA_DIR = path.join(__dirname, '../../_build/data');
const MATH_CACHE_DIR = path.join(DATA_DIR, 'math-cache');

async function renderMathInContent() {
  console.log('Rendering math formulas...');
  
  // Ensure math cache directory exists
  await fs.ensureDir(MATH_CACHE_DIR);
  
  // Process all content chunks
  const chunksDir = path.join(DATA_DIR, 'content-chunks');
  const chunkFiles = await fs.readdir(chunksDir);
  
  let totalFormulas = 0;
  let processedFiles = 0;
  
  for (const file of chunkFiles) {
    if (file.endsWith('.json')) {
      const filePath = path.join(chunksDir, file);
      const content = await fs.readJson(filePath);
      
      if (!Array.isArray(content)) {
        console.log(`Skipping ${file} - not an array`);
        continue;
      }
      
      // Render math in each item
      for (const item of content) {
        if (item.content && Array.isArray(item.content)) {
          for (const block of item.content) {
            if (block.type === 'text' && block.content && (block.content.includes('$') || block.content.includes('\\('))) {
              // Simple math detection and rendering
              const rendered = renderMath(block.content);
              totalFormulas += rendered.formulas;
              block.content = rendered.content;
            }
          }
        }
      }
      
      // Save updated content
      await fs.writeJson(filePath, content, { spaces: 2 });
      console.log(`Processed ${file}`);
      processedFiles++;
    }
  }
  
  console.log('Math rendering complete!');
  console.log(`- Processed ${processedFiles} files`);
  console.log(`- Rendered ${totalFormulas} formulas`);
}

// Run the renderer
renderMathInContent().catch(console.error);