// Search utilities for client-side search functionality

export interface SearchResult {
  items: ContentItem[];
  total: number;
  query: string;
}

export interface ContentItem {
  id: string;
  title: string;
  type: string;
  tags: string[];
  date: string;
  score?: number;
}

// Load search index from API
export async function loadSearchIndex(): Promise<ContentItem[]> {
  try {
    const response = await fetch('/api/search-index');
    if (!response.ok) {
      throw new Error('Failed to load search index');
    }
    return await response.json();
  } catch (error) {
    console.error('Error loading search index:', error);
    return [];
  }
}

// Search content using API
export async function searchContent(query: string, type?: string): Promise<SearchResult> {
  try {
    const params = new URLSearchParams({ q: query });
    if (type) {
      params.append('type', type);
    }
    
    const response = await fetch(`/api/search?${params}`);
    if (!response.ok) {
      throw new Error('Search failed');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error searching content:', error);
    return { items: [], total: 0, query };
  }
}

// Client-side search using Lunr.js (if available)
export async function clientSideSearch(query: string, documents: ContentItem[]): Promise<ContentItem[]> {
  // This is a simplified implementation
  // In production, you would use Lunr.js for better search capabilities
  
  if (!query.trim()) {
    return documents;
  }
  
  const searchTerms = query.toLowerCase().split(' ').filter(term => term.length > 0);
  
  const scoredItems = documents.map(item => {
    let score = 0;
    const searchText = `${item.title} ${item.tags.join(' ')}`.toLowerCase();
    
    // Calculate relevance score
    for (const term of searchTerms) {
      if (item.title.toLowerCase().includes(term)) {
        score += 10; // Title matches are worth more
      }
      
      if (item.tags.some(tag => tag.toLowerCase().includes(term))) {
        score += 5; // Tag matches
      }
      
      if (searchText.includes(term)) {
        score += 1; // General text matches
      }
    }
    
    return { ...item, score };
  });
  
  // Sort by score (descending) and then by date (descending)
  return scoredItems
    .filter(item => item.score > 0)
    .sort((a, b) => {
      if (a.score !== b.score) {
        return b.score - a.score;
      }
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
}

// Highlight search terms in text
export function highlightSearchTerms(text: string, query: string): string {
  if (!query.trim()) {
    return text;
  }
  
  const searchTerms = query.toLowerCase().split(' ').filter(term => term.length > 0);
  let highlightedText = text;
  
  for (const term of searchTerms) {
    const regex = new RegExp(`(${escapeRegExp(term)})`, 'gi');
    highlightedText = highlightedText.replace(regex, '<mark>$1</mark>');
  }
  
  return highlightedText;
}

// Escape special regex characters
function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Get search suggestions based on available content
export function getSearchSuggestions(query: string, documents: ContentItem[]): string[] {
  if (!query.trim() || documents.length === 0) {
    return [];
  }
  
  const suggestions = new Set<string>();
  const queryLower = query.toLowerCase();
  
  // Add title suggestions
  for (const doc of documents) {
    const titleWords = doc.title.toLowerCase().split(' ');
    for (const word of titleWords) {
      if (word.startsWith(queryLower) && word.length > query.length) {
        suggestions.add(word);
      }
    }
  }
  
  // Add tag suggestions
  for (const doc of documents) {
    for (const tag of doc.tags) {
      const tagLower = tag.toLowerCase();
      if (tagLower.startsWith(queryLower) && tagLower.length > query.length) {
        suggestions.add(tag);
      }
    }
  }
  
  return Array.from(suggestions).slice(0, 5);
}