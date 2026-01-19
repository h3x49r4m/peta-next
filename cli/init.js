#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Template for different content types
const templates = {
  article: `---
title: "{{title}}"
date: {{date}}
tags: []
author: "Anonymous"
---

{{title}}
{{#title}}

Write your article content here.

Math example: Inline math $E = mc^2$ and block math:

$$\\int_{-\\infty}^{\\infty} e^{-x^2} dx = \\sqrt{\\pi}$$

To include a snippet, use:

.. snippet:: snippet-id

`,
  
  snippet: `---
title: "{{title}}"
date: {{date}}
tags: []
---

{{title}}
{{#title}}

Write your snippet content here.

Math example: $f(x) = x^2$

List example:

- Item 1
- Item 2
  - Subitem 2.1
  - Subitem 2.2
- Item 3

`,
  
  project: `---
title: "{{title}}"
date: {{date}}
tags: []
github_url: ""
demo_url: ""
---

{{title}}
{{#title}}

Write your project description here.

Features
--------

- **Feature 1**: Description
- **Feature 2**: Description

Technical Details
-----------------

Explain the technical implementation here.

`,
};

function generateUnderline(text, char) {
  return char.repeat(text.length);
}

function processTemplate(template, title) {
  const date = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
  
  let content = template
    .replace(/{{title}}/g, title)
    .replace(/{{date}}/g, date);
  
  // Replace {{#title}} with underline
  content = content.replace(/{{#title}}/g, generateUnderline(title, '='));
  
  return content;
}

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-'); // Replace multiple hyphens with single
}

function createContentFile(type, title) {
  if (!templates[type]) {
    console.error(`Error: Unknown content type "${type}". Available types: ${Object.keys(templates).join(', ')}`);
    process.exit(1);
  }
  
  if (!title) {
    console.error('Error: Title is required');
    console.log('Usage: node cli/init.js <type> "<title>"');
    console.log('Example: node cli/init.js article "My First Article"');
    process.exit(1);
  }
  
  const slug = slugify(title);
  const contentDir = path.join(__dirname, '../_content', `${type}s`);
  const filePath = path.join(contentDir, `${slug}.rst`);
  
  // Check if file already exists
  if (fs.existsSync(filePath)) {
    rl.question(`File "${filePath}" already exists. Overwrite? (y/N) `, (answer) => {
      if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes') {
        writeFile();
      } else {
        console.log('Operation cancelled.');
        rl.close();
      }
    });
  } else {
    writeFile();
  }
  
  function writeFile() {
    // Create content directory if it doesn't exist
    if (!fs.existsSync(contentDir)) {
      fs.mkdirSync(contentDir, { recursive: true });
    }
    
    // Process template and write file
    const content = processTemplate(templates[type], title);
    fs.writeFileSync(filePath, content);
    
    console.log(`✅ Created ${type} "${title}" at:`);
    console.log(`   ${filePath}`);
    console.log(`\nSlug: ${slug}`);
    console.log(`\nYou can now edit the file and add your content.`);
    console.log(`Don't forget to update the tags in the frontmatter!`);
    
    rl.close();
  }
}

// Command line interface
const args = process.argv.slice(2);

if (args.length < 2) {
  console.log('Peta Content Initializer');
  console.log('========================');
  console.log('');
  console.log('Usage: node tools/init.js <type> "<title>"');
  console.log('');
  console.log('Available types:');
  Object.keys(templates).forEach(type => {
    console.log(`  ${type} - Create a new ${type}`);
  });
  console.log('');
  console.log('Examples:');
  console.log('  node cli/init.js article "My First Article"');
      console.log('  node cli/init.js snippet "Useful Code Snippet"');
      console.log('  node cli/init.js project "My Awesome Project"');  process.exit(0);
}

const [type, ...titleArgs] = args;
const title = titleArgs.join(' ');

createContentFile(type, title);
