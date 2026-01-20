Index Page Features
===================

Overview
--------
The index page serves as the main entry point for the Peta application, providing users with search functionality and a tag cloud for content discovery.

Search Functionality
--------------------

Search Box
~~~~~~~~~~
- Located prominently at the top of the page
- Real-time search with debouncing (300ms delay)
- Searches across all content types: articles, books, snippets, and projects
- Search matches against: titles, content text, and tags

Search Results
~~~~~~~~~~~~~
- Displayed as responsive cards below the search box
- Each card shows:
  
  - Content type (Article, Book, Snippet, Project)
  - Title
  - Publication date
  - Associated tags
  
- Cards are clickable and navigate to the appropriate content page

Navigation from Search Results
-----------------------------

Articles
~~~~~~~~
- Clicking an article card (e.g., "Calculus Fundamentals") navigates to:
  
  - URL: ``/articles?post=<article-id>``
  - Example: ``http://localhost:3000/articles?post=calculus-fundamentals``
  - The articles page displays the full article content with table of contents

Books
~~~~~
- Clicking a book card (e.g., "Deep Learning with Python") navigates to:
  
  - URL: ``/books?book=<book-id>``
  - Example: ``http://localhost:3000/books?book=deep-learning-with-python``
  - The books page displays the book with table of contents and all sections

Snippets
~~~~~~~~
- Clicking a snippet card (e.g., "SQL Queries") navigates to:
  
  - URL: ``/snippets?snippet=<snippet-id>``
  - Example: ``http://localhost:3000/snippets?snippet=sql-queries``
  - The snippets page opens a modal with the snippet content

Projects
~~~~~~~~
- Clicking a project card (e.g., "Quantum Circuit Simulator") navigates to:
  
  - URL: ``/projects?project=<project-id>``
  - Example: ``http://localhost:3000/projects?project=quantum-circuit-simulator``
  - The projects page opens a modal with project details

Tag Cloud Feature
-----------------

Display
~~~~~~~
- Located below the search box
- Shows all tags from across the content
- Tags are displayed in the format: ``<tag> (<count>)``
- Tags are ordered from most frequent to least frequent
- Tag size varies based on frequency (more common tags appear larger)
- Each tag displays its count in parentheses

Interaction
~~~~~~~~~~~
- Clicking a tag:
  
  - Automatically searches for content with that tag
  - Updates the search box with the tag name
  - Displays filtered search results
  - Updates the URL to reflect the search

Technical Implementation
-----------------------

Data Sources
~~~~~~~~~~~~
- Content is loaded from processed JSON files in ``_build/data/``
- Search API: ``/api/search?q=<query>``
- Tags API: ``/api/tags?type=<content-type>``

Component Structure
~~~~~~~~~~~~~~~~~~~
- ``SearchBar``: Handles search input with debouncing
- ``ContentGrid``: Displays search results as clickable cards
- Tag cloud: Dynamically rendered from aggregated tag data

State Management
~~~~~~~~~~~~~~~~
- Search query state
- Search results state
- Loading states for tags and search
- Navigation state for URL updates

Responsive Design
-----------------
- Mobile-friendly layout
- Cards adapt to screen size
- Tag cloud wraps appropriately on smaller screens

Performance Optimizations
-------------------------
- Debounced search to reduce API calls
- Efficient tag aggregation
- Lazy loading of content sections (for books)

Error Handling
--------------
- Graceful handling of missing content
- Empty state displays when no results found
- Loading indicators during data fetching