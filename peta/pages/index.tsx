import { useState, useEffect } from 'react';
import SearchBar from '../components/SearchBar';
import ContentGrid from '../components/ContentGrid';
import styles from '../styles/Home.module.css';

interface ContentItem {
  id: string;
  title: string;
  excerpt?: string;
  date: string;
  tags: string[];
  type: 'post' | 'snippet' | 'project';
}

interface TagData {
  name: string;
  count: number;
}

export default function Home() {
  const [searchResults, setSearchResults] = useState<ContentItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [articlesTags, setArticlesTags] = useState<TagData[]>([]);
  const [snippetsTags, setSnippetsTags] = useState<TagData[]>([]);
  const [projectsTags, setProjectsTags] = useState<TagData[]>([]);
  const [tagsLoading, setTagsLoading] = useState(true);

  useEffect(() => {
    loadTags();
  }, []);

  const loadTags = async () => {
    try {
      const [articlesResponse, snippetsResponse, projectsResponse] = await Promise.all([
        fetch('/api/tags?type=post'),
        fetch('/api/tags?type=snippet'),
        fetch('/api/tags?type=project')
      ]);
      
      const articlesData = await articlesResponse.json();
      const snippetsData = await snippetsResponse.json();
      const projectsData = await projectsResponse.json();
      
      // Sort tags by count (descending)
      const sortTags = (tags: TagData[]) => 
        tags.sort((a, b) => b.count - a.count);
      
      setArticlesTags(sortTags(articlesData));
      setSnippetsTags(sortTags(snippetsData));
      setProjectsTags(sortTags(projectsData));
    } catch (error) {
      console.error('Error loading tags:', error);
    } finally {
      setTagsLoading(false);
    }
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    
    if (!query) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
      const results = await response.json();
      setSearchResults(results);
    } catch (error) {
      console.error('Error searching:', error);
    }
  };

  const handleTagClick = (tag: string) => {
    setSearchQuery(tag);
    handleSearch(tag);
  };

  const renderTagCategory = (title: string, tags: TagData[]) => {
    if (tags.length === 0) return null;
    
    return (
      <div className={styles.tagCategory}>
        <h3 className={styles.categoryTitle}>{title}</h3>
        <div className={styles.tagCloud}>
          {tags.map((tag) => {
            const fontSize = Math.max(0.8, Math.min(1.5, 0.8 + (tag.count / 10) * 0.7));
            return (
              <button
                key={tag.name}
                onClick={() => handleTagClick(tag.name)}
                className={styles.tag}
                style={{ fontSize: `${fontSize}rem` }}
                aria-label={`Search for ${tag.name}`}
              >
                {tag.name} ({tag.count})
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className={styles.container}>
      <section className={styles.searchSection}>
        <SearchBar 
          value={searchQuery}
          onSearch={handleSearch} 
        />
      </section>

      {tagsLoading ? (
        <div className={styles.loading}>
          <p>Loading tags...</p>
        </div>
      ) : (
        <section className={styles.tagsSection}>
          <h2 className={styles.sectionTitle}>Browse by Tags</h2>
          <div className={styles.tagCategories}>
            {renderTagCategory('Articles', articlesTags)}
            {renderTagCategory('Snippets', snippetsTags)}
            {renderTagCategory('Projects', projectsTags)}
          </div>
        </section>
      )}

      {isSearching && (
        <section className={styles.searchResults}>
          <h2 className={styles.sectionTitle}>Search Results</h2>
          <ContentGrid items={searchResults} />
        </section>
      )}
    </div>
  );
}