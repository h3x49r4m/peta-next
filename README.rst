Peta - Static Website Engine
============================

A high-performance static website engine with RST content, math support, and snippet embedding capabilities. Designed for documentation sites, educational platforms, knowledge bases, and content-heavy websites.

Features
--------

- **Static Generation**: Fast builds with incremental updates (60-90 seconds)
- **RST Content**: Support for reStructuredText with YAML frontmatter
- **Math Rendering**: LaTeX math with KaTeX and pre-rendered SVG
- **Snippet System**: Reusable content chunks that can be embedded in articles
- **Search**: Client-side search with pre-built index
- **Tagging**: Unified tagging system across all content types
- **Responsive Design**: Mobile-first design with CSS Modules
- **Performance Optimized**: Code splitting, lazy loading, and caching
- **Multiple Content Types**: Support for articles, snippets, and projects
- **Flexible Architecture**: Suitable for documentation, educational sites, and knowledge bases

Architecture
------------

- **Frontend**: Next.js with static export
- **Content**: RST files processed by Rust WebAssembly
- **Styling**: CSS Modules with PostCSS
- **Math**: KaTeX (client-side) + pre-rendered SVG (build-time)
- **Search**: Client-side search with pre-built index
- **Processing**: Rust + WebAssembly + MathJax Node
- **Hosting**: GitHub Pages with Fastly CDN

Getting Started
---------------

Prerequisites
~~~~~~~~~~~~~~

- Node.js 16+ 
- Rust and wasm-pack (for RST processing)
- Python 3.9+ (for math rendering)

Installation
~~~~~~~~~~~~

1. Clone the repository::

    git clone https://github.com/h3x49r4m/peta.git
    cd peta

2. Install dependencies::

    npm install

3. (Optional) Add CLI tools to your PATH::

    export PATH="$PATH:$PWD/tools"

4. Start the development server::

    npm run dev
    # or using the CLI tool
    peta dev

   The server will be available at http://localhost:3000

5. Build for production::

    npm run build && npm run export
    # or using the CLI tool
    peta build

   The static files will be generated in the ``out/`` directory.

Content Structure
-----------------

::

   _content/
   ├── articles/       # Articles and documentation
   ├── snippets/       # Reusable content snippets
   └── projects/       # Project showcases

Content Format
~~~~~~~~~~~~~~

Each content file uses RST format with YAML frontmatter::

    ---
    title: "Article Title"
    date: 2023-01-15
    tags: ["tag1", "tag2"]
    ---

    Article Title
    =============

    Content here with math: $E=mc^2$

    .. snippet:: snippet-id

    More content...

Snippet Embedding
~~~~~~~~~~~~~~~~~

Embed snippets in articles using the RST directive::

    .. snippet:: snippet-id

Math Support
~~~~~~~~~~~~

The website engine supports LaTeX math expressions:

- **Inline math**: ``$E=mc^2$``
- **Block math**: ``$$\int_{-\infty}^{\infty} e^{-x^2} dx = \sqrt{\pi}$$``

Math is rendered to SVG during build time for optimal performance.

CLI Tools
---------

The Peta CLI provides convenient commands for managing content. For detailed documentation, see ``tools/README.rst``.

Creating Content
~~~~~~~~~~~~~~~~

Create new content files with templates::

    ./tools/peta init article "Article Title"
    ./tools/peta init snippet "Snippet Title"
    ./tools/peta init project "Project Title"

Content files are automatically created in the appropriate ``_content/`` directory with:
- Proper RST formatting
- YAML frontmatter
- Example content and math formulas
- Helpful comments

Development Commands
~~~~~~~~~~~~~~~~~~~

- ``peta dev``: Start development server
- ``peta build``: Build for production
- ``peta help``: Show help information

Build Commands
~~~~~~~~~~~~~~

- ``npm run dev``: Start development server
- ``npm run build``: Build for production
- ``npm run start``: Start production server
- ``npm run export``: Build and export static files

Note: The content processing pipeline is handled automatically during development and build.

Data Generation
~~~~~~~~~~~~~~~

The ``_build`` directory contains processed data and is generated automatically:

1. **During Development**: When you run ``npm run dev``, the content from ``_content/`` is processed and stored in ``_build/data/``

2. **During Build**: When you run ``npm run build``, all content is processed, math formulas are rendered to SVG, and the data is chunked for optimal performance

3. **Manual Processing**: To manually process content without starting the dev server::

    cd peta
    node scripts/process-content.js

The ``_build/data`` directory contains:

- ``content-chunks/`` - JSON files with 1K items each for efficient loading
- ``math-cache/`` - Pre-rendered SVG versions of math formulas
- ``*-index.json`` - Index files for articles, snippets, and projects
- ``search-index.json`` - Search index for client-side search
- ``tags.json`` - Tag information with counts

This structure enables the site to handle 10M+ articles efficiently through content chunking and caching.

Viewing Static Build
~~~~~~~~~~~~~~~~~~~

To view the static build directly::

    cd peta/out
    npx serve .
    # or
    python3 -m http.server 8000

   The static site will be available at http://localhost:8000

Deployment
----------

The site is designed for GitHub Pages deployment. The build output in ``peta/out/`` can be deployed to any static hosting service.

GitHub Actions
~~~~~~~~~~~~~~

The project includes a pre-configured GitHub Actions workflow in ``peta/.github/workflows/build.yml`` that automatically builds and deploys the site to GitHub Pages when changes are pushed to the main branch.

Performance
-----------

The architecture is optimized for handling 10M+ articles:

- **Build Time**: 60-90 seconds (incremental: 15-20 seconds)
- **Content Chunking**: 1K items per JSON file
- **Math Caching**: Reuse rendered formulas
- **Parallel Processing**: Multi-core RST conversion
- **Lazy Loading**: Content chunks loaded on demand
- **Scalable Architecture**: Suitable for various content-heavy websites

Contributing
------------

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test your changes with ``npm run dev``
5. Submit a pull request

For more information, see:

- Architecture documentation in ``docs/architecture.rst``
- CLI tools documentation in ``tools/README.rst``

License
-------

Apache 2.0
