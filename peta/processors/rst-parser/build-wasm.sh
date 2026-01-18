#!/bin/bash

# Build the Rust crate for WebAssembly
echo "Building RST parser for WebAssembly..."

# Install wasm-pack if not already installed
if ! command -v wasm-pack &> /dev/null; then
    echo "Installing wasm-pack..."
    curl https://rustwasm.github.io/wasm-pack/installer/init.sh -sSf | sh
fi

# Build the WebAssembly package
wasm-pack build --target web --out-dir ../wasm-bindings

echo "WebAssembly build complete!"