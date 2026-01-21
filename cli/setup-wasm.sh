#!/bin/bash

# Helper script to extract WASM files from the CLI package
# This script should be run after initializing a new site

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

# Check if WASM files already exist
if [ -f "$SITE_ROOT/peta/processors/wasm-bindings/rst_parser_bg.wasm" ]; then
    print_info "WASM files already exist"
    exit 0
fi

print_info "Setting up WebAssembly files..."

# Create the directory
mkdir -p "$SITE_ROOT/peta/processors/wasm-bindings"

# Try to find and copy WASM files from various locations
WASM_SOURCES=(
    "$SCRIPT_DIR/../peta/processors/wasm-bindings"
    "/usr/local/lib/peta/wasm-bindings"
    "$HOME/.peta/wasm-bindings"
)

FOUND=false
for source in "${WASM_SOURCES[@]}"; do
    if [ -d "$source" ] && [ -f "$source/rst_parser_bg.wasm" ]; then
        print_info "Found WASM files at: $source"
        cp -r "$source"/* "$SITE_ROOT/peta/processors/wasm-bindings/"
        FOUND=true
        break
    fi
done

if [ "$FOUND" = false ]; then
    print_info "WASM files not found. Creating JavaScript fallback..."
    "$SCRIPT_DIR/create-wasm-fallback.sh"
fi

print_success "WebAssembly files installed successfully!"