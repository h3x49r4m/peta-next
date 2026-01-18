Peta CLI Tools
=============

This directory contains command-line tools for the Peta static website engine.

Installation
------------

Add the tools directory to your PATH for easy access::

    # Add to your ~/.bashrc, ~/.zshrc, or equivalent
    export PATH="$PATH:/path/to/peta/tools"

    # Or create a symlink in a directory that's already in your PATH
    ln -s /path/to/peta/tools/peta /usr/local/bin/peta

Usage
-----

Creating Content
~~~~~~~~~~~~~~~~

The ``peta`` command provides a simple interface for creating new content::

    # Create a new article
    peta init article "My Article Title"

    # Create a new snippet
    peta init snippet "Useful Code Snippet"

    # Create a new project
    peta init project "My Awesome Project"

Development
~~~~~~~~~~~

::

    # Start the development server
    peta dev

    # Build the site for production
    peta build

Direct Node.js Usage
~~~~~~~~~~~~~~~~~~~~

You can also use the init script directly::

    node tools/init.js article "My Article Title"

Content Types
-------------

Articles
~~~~~~~~

Articles are the main content type, perfect for blog posts, documentation, or tutorials.

Snippets
~~~~~~~~

Snippets are reusable content chunks that can be embedded in articles using::

    .. snippet:: snippet-id

Projects
~~~~~~~~

Projects showcase your work with optional GitHub and demo links.

File Naming
-----------

Content files are automatically named using a slugified version of the title:

- "My Article Title" → ``my-article-title.rst``
- "Useful Code Snippet" → ``useful-code-snippet.rst``

Directory Structure
-------------------

Created files are placed in the appropriate directory under ``_content/``:

- Articles → ``_content/articles/``
- Snippets → ``_content/snippets/``
- Projects → ``_content/projects/``

Templates
---------

Each content type uses a template with:

- YAML frontmatter for metadata
- RST formatting for content
- Helpful comments and examples

You can customize the templates by editing ``tools/init.js``.