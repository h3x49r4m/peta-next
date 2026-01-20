Peta Feature Tests
==================

This directory contains feature tests for the Peta application, specifically testing the index page functionality.

Test Coverage
-------------

The tests cover the following features:

Search Functionality
~~~~~~~~~~~~~~~~~~~~
- Search box visibility and functionality
- Real-time search with debouncing
- Search across all content types (articles, books, snippets, projects)
- Clear search results functionality
- Loading states (if implemented)

Navigation from Search Results
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
- Article card navigation to ``/articles?post=<id>``
- Book card navigation to ``/books?book=<id>``
- Snippet card navigation to ``/snippets?snippet=<id>``
- Project card navigation to ``/projects?project=<id>``
- URL parameter validation

Tag Cloud Feature
~~~~~~~~~~~~~~~~~
- Tag cloud display and visibility
- Tag counts in parentheses
- Variable tag sizes based on frequency
- Tag click interaction and search functionality

Responsive Design
~~~~~~~~~~~~~~~~~
- Mobile device layout adaptation
- Tablet device layout
- Tag cloud wrapping on smaller screens

Error Handling
~~~~~~~~~~~~~
- Empty search results display
- API error handling (if implemented)

Accessibility
~~~~~~~~~~~~~
- ARIA labels validation
- Keyboard navigation support

Prerequisites
-------------

1. Node.js installed
2. Peta application running on port 3001
3. Test data processed (run ``node scripts/process-content.js`` in peta directory)

Setup
-----

1. Install dependencies::

    cd tests
    npm install

2. Ensure the Peta application is running::

    cd ../peta
    npm run dev

   Or the tests will automatically start the server if configured.

Running Tests
--------------

Run all tests::

    npm test

Run tests in headed mode (shows browser window)::

    npm run test:headed

Debug tests::

    npm run test:debug

Run tests with UI mode::

    npm run test:ui

View test report::

    npm run report

Test Configuration
------------------

The tests are configured to run against multiple browsers:

- Chromium (Chrome)
- Firefox
- WebKit (Safari)
- Mobile Chrome
- Mobile Safari

Configuration is in ``playwright.config.js``.

Writing New Tests
-----------------

When adding new tests:

1. Follow the existing test structure
2. Use descriptive test names
3. Test both positive and negative cases
4. Include accessibility tests where relevant
5. Use appropriate assertions

Example test structure::

    test('should do something', async ({ page }) => {
      // Arrange
      await page.goto('/');
      
      // Act
      await page.locator('button').click();
      
      // Assert
      await expect(page.locator('.result')).toBeVisible();
    });

Troubleshooting
---------------

Tests failing with connection errors:
    - Ensure the Peta application is running on port 3001
    - Check if the content has been processed

Tests timing out:
    - Increase timeouts in playwright.config.js
    - Check if the application is slow to load

Element not found:
    - Verify selectors match actual DOM elements
    - Check if elements are loaded dynamically
    - Add wait conditions where necessary