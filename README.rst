Peta - High-Performance Static Website Engine
===============================================

A sophisticated static website engine designed for documentation sites, educational platforms, knowledge bases, and content-heavy websites. Built with Next.js, featuring advanced RST content processing, mathematical formula rendering, and a flexible feature management system.

Features
--------

**Core Capabilities**

- **Feature Management**: Dynamic module enabling/disabling via configuration
- **Multi-Content Types**: Articles, Books, Snippets, and Projects with specialized rendering
- **Advanced RST Processing**: Rust WebAssembly parser for 10-20x faster performance
- **Mathematical Rendering**: LaTeX support with KaTeX and pre-rendered SVG
- **Snippet System**: Reusable content chunks with circular reference detection
- **Global Search**: Client-side search with pre-built index across all content types
- **Tag Management**: Unified tagging system with frequency-based visualization
- **Responsive Design**: Mobile-first design with CSS Modules and touch support

**Content Features**

- **Books**: Multi-section documents with toctree support and sequential navigation
- **Articles**: Full-featured blog posts with automatic TOC generation
- **Snippets**: Code gallery with syntax highlighting for 20+ languages
- **Projects**: Portfolio showcases with modal-based detailed views
- **Embedded Content**: Snippet references within articles and books

**Performance & Architecture**

- **Static Generation**: Fast builds with incremental updates (60-90 seconds)
- **Content Chunking**: 1K items per JSON file for handling 10M+ articles
- **Code Splitting**: Lazy loading of syntax highlighters and content
- **WebAssembly**: Rust-based RST parser for optimal performance
- **Caching Strategy**: Math formula caching and efficient data structures

Architecture
------------

**System Architecture**

.. code-block:: text

   Layout --> FeatureContext --> withFeatureCheck --> Pages
       ↓
   Navigation (conditional based on features)
       ↓
   Main Pages --> API Endpoints --> Content Processors --> Data (_build/data)

**Technology Stack**

- **Frontend**: Next.js 14.2.35 with TypeScript, static export capability
- **Content Processing**: Rust WebAssembly (RST parser) + MathJax Node
- **Styling**: CSS Modules + PostCSS with responsive design
- **Math Rendering**: KaTeX (client-side) + pre-rendered SVG (build-time)
- **Search**: Client-side search with pre-built JSON index
- **Deployment**: GitHub Pages with Fastly CDN

**Feature Management System**

The site implements a sophisticated feature flag system:

- **Configuration**: ``/peta/configs/features.json`` for module control
- **Global State**: ``FeatureContext`` for application-wide feature awareness
- **Page Protection**: ``withFeatureCheck`` HOC for route-level feature gating
- **Dynamic Navigation**: Conditional menu items based on enabled features

Getting Started
---------------

Prerequisites
~~~~~~~~~~~~~~

- Node.js 16+ 
- Rust and wasm-pack (for RST processing)
- Python 3.9+ (for math rendering)

Installing Rust
~~~~~~~~~~~~~~~

1. Install Rust using rustup (recommended)::

    curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
    source ~/.cargo/env

2. Verify installation::

    rustc --version
    cargo --version

Installing wasm-pack
~~~~~~~~~~~~~~~~~~~

1. Install wasm-pack::

    curl https://rustwasm.github.io/wasm-pack/installer/init.sh -sSf | sh

2. Verify installation::

    wasm-pack --version

Note: The Rust and wasm-pack tools compile the RST parser to WebAssembly, providing 10-20x faster processing compared to JavaScript alternatives.

Installation
~~~~~~~~~~~~

**Option 1: Create a New Site**

Create a new Peta site with all directories and dependencies::

    ./cli/peta init site my-new-site
    cd my-new-site
    ./cli/peta dev

This creates a complete site structure and starts the development server at http://localhost:3000

**Option 2: Clone Existing Repository**

1. Clone the repository::

    git clone https://github.com/h3x49r4m/peta.git
    cd peta

2. Install dependencies::

    npm install

3. Start the development server::

    npm run dev
    # or using the CLI tool
    peta dev

   The server will be available at http://localhost:3000

4. Build for production::

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
   ├── projects/       # Project showcases
   └── books/          # Multi-section books with toctree

Content Format
~~~~~~~~~~~~~~

Each content file uses RST format with YAML frontmatter::

    ---
    title: "Content Title"
    date: 2023-01-15
    tags: ["tag1", "tag2"]
    author: "Author Name"
    ---

    Content Title
    =============

    Content here with math: $E=mc^2$

    .. snippet:: snippet-id

    More content...

**Books Structure**

Books support multi-section organization with toctree directives::

    ---
    title: "Book Title"
    author: "Author Name"
    ---

    Book Title
    ==========

    .. toctree::
       :maxdepth: 2

       section-1
       section-2
       section-3

Snippet Embedding
~~~~~~~~~~~~~~~~~

Embed snippets in any content using the RST directive::

    .. snippet:: snippet-id

Math Support
~~~~~~~~~~~~

The website engine supports LaTeX math expressions:

- **Inline math**: ``$E=mc^2$``
- **Block math**: ``$$\int_{-\infty}^{\infty} e^{-x^2} dx = \sqrt{\pi}$$``

Math is rendered to SVG during build time for optimal performance.

Feature Configuration
---------------------

The site's features can be configured via ``/peta/configs/features.json``:

.. code-block:: json

   {
     "modules": {
       "books": { "enabled": true },
       "articles": { "enabled": true },
       "snippets": { "enabled": true },
       "projects": { "enabled": true }
     }
   }

**Available Features**

- **books**: Multi-section book reader with navigation
- **articles**: Article browsing with full-text reading
- **snippets**: Code snippet gallery with syntax highlighting
- **projects**: Portfolio-style project showcase

CLI Tools
---------

The Peta CLI provides convenient commands for managing content and creating new sites. For detailed documentation, see ``cli/README.rst``.

Creating a New Site
~~~~~~~~~~~~~~~~~~~

Initialize a new Peta site with all directories and dependencies::

    ./cli/peta init site /path/to/my-site
    ./cli/peta init site ./my-blog

This creates a complete site structure with:
- ``_content/`` - Content directories with example content
- ``cli/`` - CLI tools for content management
- ``peta/`` - Next.js application with all dependencies installed
- ``LICENSE``, ``README.rst``, ``.gitignore`` - Project files

After creating a new site::

    cd my-blog
    ./cli/peta dev

Creating Content
~~~~~~~~~~~~~~~~

Create new content files with templates::

    ./cli/peta init article "Article Title"
    ./cli/peta init snippet "Snippet Title"
    ./cli/peta init project "Project Title"

Content files are automatically created in the appropriate ``_content/`` directory with:
- Proper RST formatting
- YAML frontmatter
- Example content and math formulas
- Helpful comments

Development Commands
~~~~~~~~~~~~~~~~~~~

- ``peta init site <path>``: Initialize a new Peta site
- ``peta init <type> "Title"``: Create new content (article, snippet, project)
- ``peta dev``: Start development server (automatically processes content)
- ``peta build``: Build for production
- ``peta test``: Run all tests
- ``peta help``: Show help information

Build Commands
~~~~~~~~~~~~~~

- ``npm run dev``: Start development server
- ``npm run build``: Build for production
- ``npm run start``: Start production server
- ``npm run export``: Build and export static files

Data Generation
~~~~~~~~~~~~~~~

The ``_build`` directory contains processed data and is generated automatically:

1. **During Development**: When you run ``npm run dev``, content from ``_content/`` is processed and stored in ``_build/data/``

2. **During Build**: When you run ``npm run build``, all content is processed, math formulas are rendered to SVG, and data is chunked for performance

3. **Manual Processing**: To manually process content without starting the dev server::

    cd peta
    node scripts/process-content.js

The ``_build/data`` directory contains:

- ``content-chunks/`` - JSON files with 1K items each for efficient loading
- ``math-cache/`` - Pre-rendered SVG versions of math formulas
- ``*-index.json`` - Index files for articles, snippets, projects, and books
- ``search-index.json`` - Search index for client-side search
- ``tags.json`` - Tag information with counts

This structure enables the site to handle 10M+ articles efficiently through content chunking and caching.

Viewing Static Build
~~~~~~~~~~~~~~~~~~~

To view the static build directly::

    cd _build
    npx serve .
    # or
    python3 -m http.server 8000

   The static site will be available at http://localhost:8000

API Endpoints
-------------

The site provides comprehensive API endpoints for content management:

**Content APIs**
- ``/api/content/book`` - Book content with section parsing and toctree
- ``/api/content/[type]`` - Dynamic content serving (articles, snippets, projects)
- ``/api/content/snippet`` - Dedicated snippet endpoint
- ``/api/content/recent`` - Recently updated content aggregation

**Search & Discovery**
- ``/api/search`` - Global full-text search across all content types
- ``/api/tags`` - Tag management and counting

**Configuration**
- ``/api/config/features`` - Feature flag management

For detailed API documentation, see ``docs/features/api-endpoints.rst``.

Deployment
----------

The site is designed for GitHub Pages deployment with automated CI/CD.

GitHub Pages Deployment
~~~~~~~~~~~~~~~~~~~~~~~

Automatic Deployment
-------------------

The project includes a pre-configured GitHub Actions workflow in ``peta/.github/workflows/build.yml`` that automatically builds and deploys the site to GitHub Pages when changes are pushed to the main branch.

To enable automatic deployment:

1. **Enable GitHub Pages** in your repository:

   - Go to your repository on GitHub
   - Click **Settings** → **Pages**
   - Under **Build and deployment**, set **Source** to **GitHub Actions**

2. **Configure Custom Domain** (optional):

   - Edit the ``cname`` field in ``peta/.github/workflows/build.yml``
   - Or configure it in **Settings** → **Pages** → **Custom domain**

3. **Push Changes**:

   - Any push to the main branch triggers the build and deployment
   - The workflow builds the site, processes content, renders math, and deploys

Deployment Workflow
------------------

The deployment process includes:

1. **Rust/WASM Build**: Compile RST parser to WebAssembly
2. **Content Processing**: Convert RST files to JSON with chunking
3. **Math Rendering**: Convert LaTeX formulas to SVG
4. **Snippet Resolution**: Process snippet references and embeddings
5. **Next.js Build**: Generate static site with optimized chunks
6. **Static Export**: Export to ``peta/out/`` directory
7. **GitHub Pages**: Deploy to GitHub Pages with Fastly CDN

Performance
-----------

The architecture is optimized for handling 10M+ articles:

**Build Metrics**
- **Full Build**: 60-90 seconds
- **Incremental Build**: 15-20 seconds
- **Content Capacity**: Designed for 10M+ articles
- **First Load**: <2 seconds (static shell)
- **Content Load**: 1-2 seconds (first chunk)
- **Search Results**: <500ms (client-side)

**Optimizations**
- Content chunking for efficient loading
- Math formula caching (SVG generation)
- Parallel RST processing with Rust WASM
- Code splitting and lazy loading
- Service worker caching support
- Feature-based code splitting

Documentation
-------------

For comprehensive documentation, see:

- **Architecture**: ``docs/architecture.rst`` - Detailed system architecture
- **Features**: ``docs/features/`` - Complete feature documentation
  - ``docs/features/overview.rst`` - Core architecture and shared features
  - ``docs/features/feature-management.rst`` - Feature flag system
  - ``docs/features/home-page.rst`` - Homepage features
  - ``docs/features/books-page.rst`` - Book reader features
  - ``docs/features/articles-page.rst`` - Article features
  - ``docs/features/projects-page.rst`` - Project showcase features
  - ``docs/features/snippets-page.rst`` - Snippet gallery features
  - ``docs/features/api-endpoints.rst`` - API documentation
  - ``docs/features/special-pages.rst`` - Error pages and testing tools
- **CLI Tools**: ``cli/README.rst`` - Command-line interface documentation

Troubleshooting
---------------

Common issues:

- **404 errors**: Ensure the ``basePath`` in ``next.config.js`` matches your repository name
- **Math not rendering**: Check that the math cache is properly generated during build
- **Content not loading**: Verify that API routes are correctly exported in the static build
- **Feature flags not working**: Check ``/api/config/features`` endpoint and configuration file
- **RST parsing errors**: Verify Rust and wasm-pack are properly installed

Contributing
------------

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test your changes with ``npm run dev``
5. Submit a pull request

When contributing:

- Follow the existing code style and patterns
- Update documentation for new features
- Test with different feature configurations
- Ensure responsive design is maintained

License
-------

Apache 2.0
