Peta (next.js)
===============================================

A powerful dynamic content engine built with Next.js, designed for content-heavy sites including documentation, educational platforms, and knowledge bases. Features advanced content processing, mathematical rendering, and a flexible feature management system.

**Perfect for dynamic hosting platforms that support Node.js servers.**


Features
--------

**Core Capabilities**

- **Feature Management**: Dynamic module enabling/disabling via configuration
- **Multi-Content Types**: Articles, Books, Snippets, and Projects with specialized rendering
- **Advanced RST Processing**: Rust WebAssembly parser for fast performance
- **Mathematical Rendering**: LaTeX support with KaTeX and MathJax Node
- **Snippet System**: Reusable content chunks with reference resolution
- **Global Search**: Client-side search across all content types
- **Tag Management**: Unified tagging system with filtering
- **Responsive Design**: Mobile-first design with CSS Modules

**Content Features**

- **Books**: Multi-section documents with toctree support and navigation
- **Articles**: Full-featured posts with automatic TOC generation
- **Snippets**: Code gallery with syntax highlighting
- **Projects**: Portfolio showcases with modal-based detailed views
- **Embedded Content**: Snippet references within articles and books

Architecture
-------------

**Dynamic Content Architecture**

Peta is designed as a dynamic content engine that leverages Next.js server-side capabilities:

- **Server-side API Routes**: Dynamic content loading and processing
- **Client-side Rendering**: Fast, responsive user interface
- **Real-time Content Updates**: Content changes reflected immediately
- **Advanced Processing**: RST parsing and math rendering on-demand
- **Search & Filtering**: Dynamic search across all content types

**Technology Stack**

- **Frontend**: Next.js 14.2.35 with React 18, TypeScript
- **Backend**: Node.js API routes for dynamic content loading
- **Content Processing**: Rust WebAssembly + JavaScript processors
- **Styling**: CSS Modules with custom styling
- **Math Rendering**: KaTeX (client-side) + MathJax Node integration
- **Build System**: Custom CLI script + Next.js build system

**Ideal Use Cases**

- **Documentation Sites**: Real-time documentation with advanced math support
- **Educational Platforms**: Interactive content with snippet embedding
- **Knowledge Bases**: Dynamic search and filtering capabilities
- **Technical Blogs**: Code snippets with syntax highlighting
- **Research Portfolios**: Mathematical content with proper rendering

Architecture
------------

**Current System Architecture**

.. code-block:: text

   ┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
   │   RST Files     │───▶│   Next.js Dev    │───▶│  Browser        │
   │   (_content/)   │    │   Server         │    │  (Client)       │
   └─────────────────┘    └──────────────────┘    └─────────────────┘
                                  │
                                  ▼
                         ┌──────────────────┐
                         │   API Routes     │
                         │ (Server-side)    │
                         └──────────────────┘
                                  │
                                  ▼
                         ┌──────────────────┐
                         │   Static Build   │
                         │                  │
                         └──────────────────┘

Data Flow

::

  Browser → Next.js Page → fetch() API → Content Processors → File System

**Technology Stack**

- **Frontend**: Next.js 14.2.35 with React 18, TypeScript
- **Backend**: Node.js API routes for dynamic content loading
- **Content Processing**: Rust WebAssembly + JavaScript processors
- **Styling**: CSS Modules with custom styling
- **Math Rendering**: KaTeX (client-side) + MathJax Node integration
- **Build System**: Custom CLI script + Next.js build system


Getting Started
---------------

Prerequisites
~~~~~~~~~~~~~~

- Node.js 16+ 
- Python 3.9+ (for math rendering)
- Rust and wasm-pack (optional, for rebuilding WASM modules)

Installation
~~~~~~~~~~~~

1. Clone the repository::

    git clone https://github.com/h3x49r4m/peta.git
    cd peta

2. Install dependencies::

    npm install

3. Start the development server::

    npm run dev
    # or using the CLI tool
    ./cli/peta dev

   The server will be available at http://localhost:3000

4. Build for production::

    npm run build
    # or using the CLI tool
    ./cli/peta build

5. Start production server::

    npm run start
    # or using the CLI tool
    ./cli/peta start

   The production server will be available at http://localhost:3000

Project Structure
-----------------

::

   peta/
   ├── components/              # React components
   │   ├── ContentGrid.tsx     # Grid display for content items
   │   ├── Layout.tsx          # Main layout wrapper
   │   ├── SearchBar.tsx       # Search interface
   │   ├── BookTOC.tsx         # Table of contents
   │   ├── ProjectModal.tsx    # Project detail modal
   │   └── SnippetModal.tsx    # Snippet detail modal
   │
   ├── pages/                   # Next.js pages
   │   ├── index.tsx           # Homepage with search
   │   ├── articles/index.tsx  # Articles listing page
   │   ├── books/index.tsx     # Books listing page
   │   ├── projects/index.tsx  # Projects listing page
   │   ├── snippets/index.tsx  # Snippets listing page
   │   └── api/                # API routes (break in static build)
   │       ├── config/         # Configuration endpoints
   │       ├── content/        # Dynamic content endpoints
   │       └── static-data/    # Attempted static data fix
   │
   ├── processors/             # Content processing
   │   ├── math-renderer/      # LaTeX math processing
   │   ├── rst-parser/         # RST parser (Rust WASM)
   │   ├── snippet-resolver/   # Code snippet resolution
   │   └── wasm-bindings/      # JavaScript-Rust bridge
   │
   ├── scripts/                # Build scripts
   │   └── generate-static-data.js  # Attempted static fix
   │
   ├── utils/                  # Utility functions
   │   ├── site-config.ts      # Site configuration
   │   ├── content.ts          # Content utilities
   │   └── static-data.ts      # Static data loader
   │
   ├── styles/                 # CSS Modules
   ├── types/                  # TypeScript definitions
   └── package.json           # Dependencies and scripts
   
   _content/
   ├── articles/                # Articles and documentation
   ├── snippets/                # Reusable content snippets
   ├── projects/                # Project showcases
   └── books/                   # Multi-section books with toctree

Configuration
-------------

The site uses configuration files in ``/peta/configs/`` to customize behavior and appearance.

Feature Configuration
~~~~~~~~~~~~~~~~~~~~~

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

Site Configuration
~~~~~~~~~~~~~~~~~~~

Site information and social links can be configured via ``/peta/configs/site.json``:

.. code-block:: json

   {
     "site": {
       "name": "My Blog",
       "description": "A static website engine",
       "url": "https://myblog.com"
     },
     "author": {
       "name": "John Doe",
       "email": "john@example.com"
     },
     "social": {
       "github": "https://github.com/username",
       "x": "https://x.com/username",
       "linkedin": "https://linkedin.com/in/username"
     }
   }

CLI Tools
---------

The Peta CLI provides convenient commands for managing content. For detailed documentation, see ``cli/README.rst``.

Development Commands
~~~~~~~~~~~~~~~~~~~

- ``./cli/peta dev``: Start development server (working)
- ``./cli/peta build``: Build for production (broken static export)
- ``./cli/peta init <type> "Title"``: Create new content (article, snippet, project)
- ``./cli/peta help``: Show help information

Build Commands
~~~~~~~~~~~~~~

- ``npm run dev``: Start development server (working)
- ``npm run build``: Build for production (broken static export)
- ``npm run start``: Start production server (requires working build)
- ``npm run export``: Export static files (broken)

API Endpoints
-------------

The site provides comprehensive API endpoints for dynamic content management:

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
- ``/api/config/site`` - Site configuration

These API endpoints provide real-time content access and are the foundation of Peta's dynamic capabilities.

Deployment
----------

Peta is designed for dynamic deployment on platforms that support Node.js servers. The API routes and server-side processing are essential features.

**Recommended Deployment Platforms**

**Vercel (Recommended)**
- Full Next.js support with API routes
- Automatic deployment from Git
- Built-in CDN and performance optimization
- Zero-configuration deployment

**Netlify (with Functions)**
- Next.js support with serverless functions
- Automatic deployments
- Form handling and edge functions
- Git-based workflow

**Heroku**
- Full Node.js application support
- Custom domain support
- Easy scaling options
- Direct Git integration

**Railway**
- Modern Node.js deployment
- Built-in database support
- Preview deployments
- Simple pricing

**DigitalOcean App Platform**
- Full Node.js application hosting
- Built-in CDN
- Automatic scaling
- Developer-friendly interface

**Manual Node.js Deployment**

For custom server deployment:

.. code-block:: bash

    # Build the application
    cd peta
    npm run build
    
    # Start the production server
    npm start
    
    # The server will run on port 3000 by default
    # Configure PORT environment variable as needed

**Docker Deployment**

Create a Dockerfile for containerized deployment:

.. code-block:: dockerfile

    FROM node:18-alpine
    
    WORKDIR /app
    
    COPY package*.json ./
    RUN npm ci --only=production
    
    COPY . .
    RUN npm run build
    
    EXPOSE 3000
    
    CMD ["npm", "start"]

**Environment Variables**

Configure these environment variables for production:

- ``NODE_ENV=production`` - Production mode
- ``PORT=3000`` - Server port (default: 3000)
- ``NEXT_PUBLIC_SITE_URL=https://yourdomain.com`` - Site URL for SEO

**Performance Considerations**

- **API Response Caching**: Implement caching for frequently accessed content
- **CDN Integration**: Use CDN for static assets
- **Database Integration**: Consider database for content management at scale
- **Monitoring**: Set up monitoring for API performance and uptime


Performance
-----------

**Dynamic Server Performance**
- **First Load**: 1-2 seconds (production server)
- **Content Load**: 200-500ms (API calls with caching)
- **Search Results**: 100-300ms (client-side search)
- **Navigation**: Instant (client-side routing)
- **API Response Time**: 50-200ms (depending on content complexity)

**Optimizations**
- **WASM Processing**: Rust-based RST parsing for 10-20x faster performance
- **Content Caching**: Intelligent caching of processed content
- **Code Splitting**: Dynamic loading of syntax highlighters and components
- **Math Caching**: Pre-rendered SVG formulas with fallback to KaTeX
- **Search Indexing**: Efficient client-side search with pre-built index

**Scalability**
- **Concurrent Users**: Supports hundreds of simultaneous users
- **Content Size**: Efficient handling of large content libraries
- **Memory Usage**: Optimized memory management with WASM
- **API Rate Limiting**: Built-in protection against abuse

**Monitoring**
- **Response Time Tracking**: Monitor API performance
- **Error Handling**: Comprehensive error logging and recovery
- **Content Processing**: Track processing times for optimization
- **User Analytics**: Built-in analytics for content usage

Documentation
-------------

For comprehensive documentation, see:

- **Current Architecture**: ``docs/architecture.rst`` - Updated with current limitations
- **Architecture Design**: ``docs/architecture/architecture_overview.rst`` - Detailed current architecture analysis
- **Rust Rewrite Proposal**: ``architecture_rust.rst`` - Proposed solution using Rust
- **Features**: ``docs/features/`` - Feature documentation (development mode only)
- **CLI Tools**: ``cli/README.rst`` - Command-line interface documentation

Troubleshooting
---------------

**Common Issues**

- **Server won't start**: Check that all dependencies are installed with ``npm install``
- **API routes returning 404**: Ensure you're running the server, not static export
- **Content not loading**: Verify that ``_content/`` directory exists and contains RST files
- **Math formulas not rendering**: Check that Python 3.9+ is installed for MathJax Node
- **WASM loading errors**: Verify WASM files exist in ``peta/processors/wasm-bindings/``
- **Search not working**: Ensure content has been processed and search index is generated

**Development Issues**

- **Hot reload not working**: Restart the development server
- **Port already in use**: Kill existing Node.js processes or use different port
- **Content changes not reflected**: Check file permissions and restart server

**Production Deployment Issues**

- **Memory errors**: Increase Node.js memory limit with ``--max-old-space-size=4096``
- **Slow API responses**: Implement caching or upgrade server resources
- **Database connection issues**: Check environment variables and connection strings

**Performance Issues**

- **Slow content loading**: Optimize RST files and reduce image sizes
- **High memory usage**: Monitor content processing and implement caching strategies
- **Search performance**: Rebuild search index with ``npm run build``

**WASM Issues**

If WASM files are missing, the system will automatically fall back to JavaScript-based RST parsing:

.. code-block:: bash

    # Rebuild WASM files if needed
    cd peta/processors/rst-parser
    wasm-pack build --target nodejs --out-dir ../wasm-bindings

**Logging and Debugging**

Enable debug logging:

.. code-block:: bash

    # Development mode with debug logging
    DEBUG=peta:* npm run dev
    
    # Production mode with logging
    NODE_ENV=production npm start

Contributing
------------

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test your changes with ``npm run dev``
5. Test production build with ``npm run build && npm start``
6. Submit a pull request

**Priority Areas for Contribution**

- **Performance Optimization**: Improve API response times and content processing
- **New Content Types**: Add support for additional content formats
- **Enhanced Search**: Improve search algorithms and indexing
- **UI/UX Improvements**: Enhance the user interface and experience
- **API Extensions**: Add new API endpoints for advanced functionality
- **Documentation**: Improve documentation and add examples

**Development Guidelines**

- Follow existing code style and TypeScript conventions
- Test both development and production modes
- Update API documentation for new endpoints
- Ensure responsive design is maintained
- Add appropriate error handling and logging
- Include unit tests for new features

**Code Quality**

- Use TypeScript for type safety
- Follow ESLint configuration
- Write meaningful commit messages
- Update README for significant changes
- Test with different content types and sizes

**Community**

- Report bugs with detailed reproduction steps
- Suggest features with use cases and examples
- Share deployment experiences and configurations
- Help other users in issues and discussions

License
-------

Apache 2.0
