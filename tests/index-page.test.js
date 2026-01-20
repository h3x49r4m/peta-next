/**
 * Feature tests for the Index Page
 * Tests search functionality, navigation, and tag cloud features
 */

const { test, expect } = require('@playwright/test');

test.describe('Index Page Features', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3001');
  });

  test.describe('Search Functionality', () => {
    test('should display search box prominently', async ({ page }) => {
      const searchBox = page.locator('input[aria-label="Search"]');
      await expect(searchBox).toBeVisible();
      await expect(searchBox).toHaveAttribute('placeholder', 'Search...');
    });

    test('should perform real-time search with debouncing', async ({ page }) => {
      const searchBox = page.locator('input[aria-label="Search"]');
      
      // Type search query
      await searchBox.fill('quantum');
      
      // Wait for debounced search (300ms + some buffer)
      await page.waitForTimeout(500);
      
      // Check if search results appear
      const searchResults = page.locator('.searchResults');
      await expect(searchResults).toBeVisible();
      
      // Check if results contain search term
      const resultCards = page.locator('.card');
      await expect(resultCards).toHaveCount(6); // Expected number of quantum-related results
    });

    test('should search across all content types', async ({ page }) => {
      const searchBox = page.locator('input[aria-label="Search"]');
      
      await searchBox.fill('quantum');
      await page.waitForTimeout(500);
      
      // Check for different content types in results
      const articleType = page.locator('.card:has-text("Article")');
      const snippetType = page.locator('.card:has-text("Snippet")');
      const projectType = page.locator('.card:has-text("Project")');
      const bookType = page.locator('.card:has-text("Book")');
      
      await expect(articleType).toHaveCount(1);
      await expect(snippetType).toHaveCount(3);
      await expect(projectType).toHaveCount(1);
      await expect(bookType).toHaveCount(1);
    });

    test('should clear search results when query is cleared', async ({ page }) => {
      const searchBox = page.locator('input[aria-label="Search"]');
      
      // Perform search
      await searchBox.fill('quantum');
      await page.waitForTimeout(500);
      
      // Verify results are shown
      const searchResults = page.locator('.searchResults');
      await expect(searchResults).toBeVisible();
      
      // Clear search
      await searchBox.fill('');
      await page.waitForTimeout(500);
      
      // Verify results are hidden
      await expect(searchResults).not.toBeVisible();
    });

    test('should show loading state while searching', async ({ page }) => {
      const searchBox = page.locator('input[aria-label="Search"]');
      
      // Type quickly to trigger search
      await searchBox.fill('test');
      
      // Check for loading state (if implemented)
      // This would depend on the actual implementation
    });
  });

  test.describe('Navigation from Search Results', () => {
    test('should navigate to article page when article card is clicked', async ({ page }) => {
      const searchBox = page.locator('input[aria-label="Search"]');
      await searchBox.fill('calculus');
      await page.waitForTimeout(500);
      
      // Click on article card
      const articleCard = page.locator('.card:has-text("Article")').first();
      await articleCard.click();
      
      // Verify navigation to article page
      await expect(page).toHaveURL(/\/articles\?post=/);
      await expect(page.locator('h1')).toContainText('Articles');
    });

    test('should navigate to book page when book card is clicked', async ({ page }) => {
      const searchBox = page.locator('input[aria-label="Search"]');
      await searchBox.fill('deep learning');
      await page.waitForTimeout(500);
      
      // Click on book card
      const bookCard = page.locator('.card:has-text("Book")').first();
      await bookCard.click();
      
      // Verify navigation to book page
      await expect(page).toHaveURL(/\/books\?book=/);
      await expect(page.locator('h1')).toContainText('Books');
    });

    test('should navigate to snippet page when snippet card is clicked', async ({ page }) => {
      const searchBox = page.locator('input[aria-label="Search"]');
      await searchBox.fill('sql');
      await page.waitForTimeout(500);
      
      // Click on snippet card
      const snippetCard = page.locator('.card:has-text("Snippet")').first();
      await snippetCard.click();
      
      // Verify navigation to snippet page
      await expect(page).toHaveURL(/\/snippets\?snippet=/);
      await expect(page.locator('h1')).toContainText('Snippets');
    });

    test('should navigate to project page when project card is clicked', async ({ page }) => {
      const searchBox = page.locator('input[aria-label="Search"]');
      await searchBox.fill('quantum');
      await page.waitForTimeout(500);
      
      // Click on project card
      const projectCard = page.locator('.card:has-text("Project")').first();
      await projectCard.click();
      
      // Verify navigation to project page
      await expect(page).toHaveURL(/\/projects\?project=/);
      await expect(page.locator('h1')).toContainText('Projects');
    });

    test('should include correct content ID in URL parameters', async ({ page }) => {
      const searchBox = page.locator('input[aria-label="Search"]');
      await searchBox.fill('quantum-mechanics');
      await page.waitForTimeout(500);
      
      // Click on article card
      const articleCard = page.locator('.card:has-text("Introduction to Quantum Mechanics")');
      await articleCard.click();
      
      // Verify URL contains correct post parameter
      await expect(page).toHaveURL(/\/articles\?post=quantum-mechanics/);
    });
  });

  test.describe('Tag Cloud Feature', () => {
    test('should display tag cloud below search box', async ({ page }) => {
      const tagCloud = page.locator('.tagCloud');
      await expect(tagCloud).toBeVisible();
      
      // Check if tags are displayed
      const tags = page.locator('.tagCloud .tag');
      await expect(tags).toHaveCount.greaterThan(0);
    });

    test('should show tags in format "<tag> (<count>)"', async ({ page }) => {
      const tags = page.locator('.tagCloud .tag');
      const count = await tags.count();
      
      // Check first few tags for correct format
      for (let i = 0; i < Math.min(count, 5); i++) {
        const tagText = await tags.nth(i).textContent();
        // Should match format: tag name followed by count in parentheses
        expect(tagText).toMatch(/^.+ \(\d+\)$/);
      }
    });

    test('should order tags from most frequent to least frequent', async ({ page }) => {
      const tags = page.locator('.tagCloud .tag');
      const count = await tags.count();
      
      let tagCounts = [];
      for (let i = 0; i < Math.min(count, 5); i++) {
        const tagText = await tags.nth(i).textContent();
        // Extract count from parentheses
        const match = tagText.match(/\((\d+)\)/);
        if (match) {
          tagCounts.push(parseInt(match[1]));
        }
      }
      
      // Verify counts are in descending order
      for (let i = 0; i < tagCounts.length - 1; i++) {
        expect(tagCounts[i]).toBeGreaterThanOrEqual(tagCounts[i + 1]);
      }
    });

    test('should vary tag sizes based on frequency', async ({ page }) => {
      // Get font sizes of different tags
      const tags = page.locator('.tagCloud .tag');
      const count = await tags.count();
      
      let fontSizes = [];
      for (let i = 0; i < Math.min(count, 5); i++) {
        const fontSize = await tags.nth(i).evaluate(el => 
          window.getComputedStyle(el).fontSize
        );
        fontSizes.push(parseFloat(fontSize));
      }
      
      // Check if font sizes vary (not all the same)
      const uniqueSizes = [...new Set(fontSizes)];
      expect(uniqueSizes.length).toBeGreaterThan(1);
      
      // More frequent tags should have larger font sizes
      let tagCounts = [];
      for (let i = 0; i < Math.min(count, 5); i++) {
        const tagText = await tags.nth(i).textContent();
        const match = tagText.match(/\((\d+)\)/);
        if (match) {
          tagCounts.push(parseInt(match[1]));
        }
      }
      
      // Check correlation between count and font size (higher count = larger font)
      for (let i = 0; i < tagCounts.length - 1; i++) {
        if (tagCounts[i] > tagCounts[i + 1]) {
          expect(fontSizes[i]).toBeGreaterThanOrEqual(fontSizes[i + 1]);
        }
      }
    });

    test('should search for tag when clicked', async ({ page }) => {
      const firstTag = page.locator('.tagCloud .tag').first();
      const tagName = await firstTag.textContent();
      
      // Extract tag name without count
      const cleanTagName = tagName.replace(/\s*\(\d+\)$/, '');
      
      // Click on tag
      await firstTag.click();
      
      // Verify search box is updated with tag name
      const searchBox = page.locator('input[aria-label="Search"]');
      await expect(searchBox).toHaveValue(cleanTagName);
      
      // Verify search results are shown
      const searchResults = page.locator('.searchResults');
      await expect(searchResults).toBeVisible();
      
      // Verify results contain the tag
      const resultCards = page.locator('.card');
      const resultsCount = await resultCards.count();
      let foundTag = false;
      
      for (let i = 0; i < Math.min(resultsCount, 5); i++) {
        const cardTags = await resultCards.nth(i).locator('.tags .tag').allTextContents();
        if (cardTags.some(tag => tag.toLowerCase() === cleanTagName.toLowerCase())) {
          foundTag = true;
          break;
        }
      }
      
      expect(foundTag).toBe(true);
    });

    test('should display loading state while tags are loading', async ({ page }) => {
      // Navigate to page and check for loading state
      await page.goto('http://localhost:3001');
      
      // Check if loading message appears (if implemented)
      const loadingElement = page.locator('.loading');
      const isVisible = await loadingElement.isVisible().catch(() => false);
      
      if (isVisible) {
        await expect(loadingElement).toContainText('Loading tags');
        
        // Wait for loading to complete
        await expect(loadingElement).not.toBeVisible({ timeout: 5000 });
      }
    });

    test('should aggregate tags from all content types', async ({ page }) => {
      const tagCloud = page.locator('.tagCloud');
      await expect(tagCloud).toBeVisible();
      
      // Get all unique tags from tag cloud
      const cloudTags = page.locator('.tagCloud .tag');
      const cloudTagCount = await cloudTags.count();
      let cloudTagNames = [];
      
      for (let i = 0; i < cloudTagCount; i++) {
        const tagText = await cloudTags.nth(i).textContent();
        const tagName = tagText.replace(/\s*\(\d+\)$/, '');
        cloudTagNames.push(tagName.toLowerCase());
      }
      
      // Perform searches to verify tags come from different content types
      const testTags = ['quantum', 'physics', 'javascript'];
      
      for (const tag of testTags) {
        if (cloudTagNames.includes(tag)) {
          const searchBox = page.locator('input[aria-label="Search"]');
          await searchBox.fill(tag);
          await page.waitForTimeout(500);
          
          // Check if results have different content types
          const resultCards = page.locator('.card');
          const hasArticles = await resultCards.locator(':has-text("Article")').count() > 0;
          const hasSnippets = await resultCards.locator(':has-text("Snippet")').count() > 0;
          const hasProjects = await resultCards.locator(':has-text("Project")').count() > 0;
          const hasBooks = await resultCards.locator(':has-text("Book")').count() > 0;
          
          // At least one content type should have results
          expect(hasArticles || hasSnippets || hasProjects || hasBooks).toBe(true);
          
          // Clear search for next iteration
          await searchBox.fill('');
          await page.waitForTimeout(300);
        }
      }
    });

    test('should handle empty tag cloud gracefully', async ({ page }) => {
      // This test would require mocking an empty tags response
      // Implementation depends on error handling strategy
    });

    test('should update URL when tag is clicked', async ({ page }) => {
      const firstTag = page.locator('.tagCloud .tag').first();
      const tagName = await firstTag.textContent();
      const cleanTagName = tagName.replace(/\s*\(\d+\)$/, '');
      
      // Click on tag
      await firstTag.click();
      
      // Verify URL is updated
      await expect(page).toHaveURL(new RegExp(`[?&]q=${encodeURIComponent(cleanTagName)}`));
    });

    test('should be keyboard accessible', async ({ page }) => {
      // Tab to tag cloud
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      
      // Try to focus on first tag
      const firstTag = page.locator('.tagCloud .tag').first();
      await firstTag.focus();
      
      // Verify tag is focused
      await expect(firstTag).toBeFocused();
      
      // Press Enter to activate
      await page.keyboard.press('Enter');
      
      // Verify search is triggered
      const searchBox = page.locator('input[aria-label="Search"]');
      const hasValue = await searchBox.inputValue();
      expect(hasValue.length).toBeGreaterThan(0);
    });
  });

  test.describe('Responsive Design', () => {
    test('should adapt layout for mobile devices', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });
      
      // Check if elements are still visible and properly sized
      const searchBox = page.locator('input[aria-label="Search"]');
      await expect(searchBox).toBeVisible();
      
      // Perform search to check card layout
      await searchBox.fill('quantum');
      await page.waitForTimeout(500);
      
      // Check if cards are responsive
      const cards = page.locator('.card');
      await expect(cards.first()).toBeVisible();
    });

    test('should wrap tag cloud on smaller screens', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });
      
      // Check tag cloud layout
      const tagCloud = page.locator('.tagCloud');
      await expect(tagCloud).toBeVisible();
      
      // Get tag cloud dimensions
      const boundingBox = await tagCloud.boundingBox();
      expect(boundingBox.width).toBeLessThan(375);
    });

    test('should maintain usability on tablet devices', async ({ page }) => {
      // Set tablet viewport
      await page.setViewportSize({ width: 768, height: 1024 });
      
      // Test search functionality
      const searchBox = page.locator('input[aria-label="Search"]');
      await searchBox.fill('test');
      await page.waitForTimeout(500);
      
      // Verify results are displayed properly
      const searchResults = page.locator('.searchResults');
      await expect(searchResults).toBeVisible();
    });
  });

  test.describe('Error Handling', () => {
    test('should handle empty search results gracefully', async ({ page }) => {
      const searchBox = page.locator('input[aria-label="Search"]');
      
      // Search for non-existent term
      await searchBox.fill('nonexistentcontent12345');
      await page.waitForTimeout(500);
      
      // Check if empty state is shown
      const emptyMessage = page.locator('.empty');
      await expect(emptyMessage).toBeVisible();
      await expect(emptyMessage).toContainText('No content found');
    });

    test('should handle API errors gracefully', async ({ page }) => {
      // This test would require mocking API failures
      // Implementation depends on error handling strategy
    });
  });

  test.describe('Accessibility', () => {
    test('should have proper ARIA labels', async ({ page }) => {
      const searchBox = page.locator('input[aria-label="Search"]');
      await expect(searchBox).toHaveAttribute('aria-label', 'Search');
      
      // Check tag buttons have proper labels
      const tags = page.locator('.tagCloud .tag');
      const firstTag = tags.first();
      await expect(firstTag).toHaveAttribute('aria-label');
    });

    test('should be keyboard navigable', async ({ page }) => {
      // Tab to search box
      await page.keyboard.press('Tab');
      const searchBox = page.locator('input[aria-label="Search"]');
      await expect(searchBox).toBeFocused();
      
      // Type search query
      await page.keyboard.type('quantum');
      await page.waitForTimeout(500);
      
      // Tab to first result
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      
      // Press Enter to navigate
      await page.keyboard.press('Enter');
      
      // Verify navigation occurred
      await expect(page).toHaveURL(/\/(articles|books|snippets|projects)\?/);
    });
  });
});

// Helper function to wait for search results
async function waitForSearchResults(page) {
  await page.waitForSelector('.searchResults', { state: 'visible' });
  await page.waitForTimeout(100); // Small delay for cards to render
}