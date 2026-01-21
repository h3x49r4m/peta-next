#!/bin/bash

# Create WASM files from base64 encoding
# This is a fallback when WASM files are not available

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SITE_ROOT="$(dirname "$(dirname "$SCRIPT_DIR")")"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

print_error() {
    echo -e "${RED}Error: $1${NC}" >&2
}

print_success() {
    echo -e "${GREEN}$1${NC}"
}

print_info() {
    echo -e "${YELLOW}$1${NC}"
}

# Check if we're in a Peta site
if [ ! -d "$SITE_ROOT/peta" ]; then
    print_error "Not in a Peta site directory"
    exit 1
fi

# Create the directory
mkdir -p "$SITE_ROOT/peta/processors/wasm-bindings"

print_info "Creating WebAssembly files..."

# Create a minimal JavaScript fallback for rst-parser
cat > "$SITE_ROOT/peta/processors/wasm-bindings/rst-parser.js" << 'EOF'
// Fallback RST parser when WASM is not available
// This provides basic RST parsing functionality

function parseRstFallback(content) {
  const lines = content.split('\n');
  const frontmatter = {};
  const contentArray = [];
  let inFrontmatter = false;
  let frontmatterText = '';
  let currentSection = { type: 'text', content: '' };
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Handle frontmatter
    if (line === '---') {
      if (!inFrontmatter) {
        inFrontmatter = true;
        continue;
      } else {
        // Parse frontmatter
        try {
          frontmatterText.split('\n').forEach(item => {
            if (item.includes(':')) {
              const [key, ...valueParts] = item.split(':');
              const value = valueParts.join(':').trim();
              if (key && value) {
                // Handle arrays
                if (value.startsWith('[') && value.endsWith(']')) {
                  frontmatter[key.trim()] = JSON.parse(value);
                } else {
                  frontmatter[key.trim()] = value;
                }
              }
            }
          });
        } catch (e) {
          console.error('Error parsing frontmatter:', e);
        }
        inFrontmatter = false;
        continue;
      }
    }
    
    if (inFrontmatter) {
      frontmatterText += line + '\n';
      continue;
    }
    
    // Handle content
    if (line.trim()) {
      currentSection.content += line + '\n';
    }
  }
  
  if (currentSection.content) {
    contentArray.push(currentSection);
  }
  
  return {
    frontmatter,
    content: contentArray,
    snippet_refs: []
  };
}

module.exports = {
  parseRstFallback
};
EOF

# Create package.json
cat > "$SITE_ROOT/peta/processors/wasm-bindings/package.json" << 'EOF'
{
  "name": "rst-parser",
  "type": "module",
  "version": "0.1.0",
  "main": "rst-parser.js"
}
EOF

# Create TypeScript definitions
cat > "$SITE_ROOT/peta/processors/wasm-bindings/rst_parser.d.ts" << 'EOF'
export function parse_rst(content: string): any;
EOF

# Create the main JS file
cat > "$SITE_ROOT/peta/processors/wasm-bindings/rst_parser.js" << 'EOF'
// Re-export the fallback parser
const { parseRstFallback } = require('./rst-parser');

function parseRst(content) {
  return parseRstFallback(content);
}

module.exports = {
  parseRst
};
EOF

print_success "WebAssembly fallback files created!"
print_info "Note: This is a JavaScript fallback. For full performance, install the WASM files."
print_info "Download WASM files from: https://github.com/h3x49r4m/peta/releases"