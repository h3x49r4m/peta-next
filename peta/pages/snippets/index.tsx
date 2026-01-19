import { useState, useEffect } from 'react';
import TagFilter from '../../components/TagFilter';
import SnippetGrid from '../../components/SnippetGrid';
import SnippetModal from '../../components/SnippetModal';
import Link from 'next/link';
import { useRouter } from 'next/router';
import styles from '../../styles/Snippets.module.css';

interface Snippet {
  id: string;
  title: string;
  date: string;
  content: any[];
  tags: string[];
}

export default function Snippets() {
  const [snippets, setSnippets] = useState<Snippet[]>([]);
  const [tags, setTags] = useState<any[]>([]);
  const [selectedTag, setSelectedTag] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [selectedSnippet, setSelectedSnippet] = useState<Snippet | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    loadSnippetsContent();
  }, []);

  useEffect(() => {
    // Check for snippet query parameter
    const snippetId = router.query.snippet as string;
    if (snippetId && snippets.length > 0) {
      const snippet = snippets.find(s => s.id === snippetId);
      if (snippet) {
        setSelectedSnippet(snippet);
        setIsModalOpen(true);
      }
    }
  }, [router.query.snippet, snippets]);

  useEffect(() => {
    // Reset selected snippet when the route changes (e.g., when clicking the Snippets link)
    const handleRouteChange = (url: string) => {
      // If navigating to /snippets without query params, clear selections
      if (url === '/snippets' || url === '/snippets?') {
        setSelectedTag('');
        setIsModalOpen(false);
      }
    };
    
    router.events.on('routeChangeComplete', handleRouteChange);
    
    return () => {
      router.events.off('routeChangeComplete', handleRouteChange);
    };
  }, [router]);

  // Also check on mount
  useEffect(() => {
    // If URL is just /snippets without query params, clear selections
    if (router.asPath === '/snippets' || router.asPath === '/snippets?') {
      setSelectedTag('');
    }
  }, [router.asPath]);

  useEffect(() => {
    // When a tag is selected, update URL
    if (selectedTag) {
      // Update URL to include tag
      const url = `/snippets?tag=${encodeURIComponent(selectedTag)}`;
      window.history.pushState({}, '', url);
    }
  }, [selectedTag]);

  const loadSnippetsContent = async () => {
    try {
      const [snippetsResponse, tagsResponse] = await Promise.all([
        fetch('/api/content/snippet'),
        fetch('/api/tags?type=snippet')
      ]);
      
      const snippetsData = await snippetsResponse.json();
      const tagsData = await tagsResponse.json();
      
      // Sort snippets by date (newest first)
      const sortedSnippets = Array.isArray(snippetsData) 
        ? snippetsData.sort((a: Snippet, b: Snippet) => {
            const dateA = new Date(a.date);
            const dateB = new Date(b.date);
            return dateB.getTime() - dateA.getTime(); // Newest first
          })
        : snippetsData;
      
      setSnippets(sortedSnippets);
      setTags(tagsData);
    } catch (error) {
      console.error('Error loading snippets:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredSnippets = selectedTag
    ? snippets.filter(snippet => snippet.tags.includes(selectedTag))
    : snippets;

  const handleSnippetClick = (snippet: Snippet) => {
    setSelectedSnippet(snippet);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedSnippet(null);
  };

  const handleTitleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setSelectedTag(''); // Clear selected tag when clicking title
    // Update the URL to just /snippets
    window.history.pushState({}, '', '/snippets');
  };

  return (
    <div className={styles.pageContainer}>
      {/* Section 1: Header with title and tags */}
      <header className={styles.pageHeader}>
        <div className={styles.headerSection}>
          <Link href="/snippets" onClick={handleTitleClick} className={styles.titleLink}>
            <h1 className={styles.title}>Snippets</h1>
          </Link>
          <div className={styles.tagsSection}>
            <TagFilter
              tags={tags}
              selectedTag={selectedTag}
              onTagSelect={setSelectedTag}
            />
          </div>
        </div>
      </header>
      
      {/* Section 2: Full-width cards grid */}
      <main className={styles.mainContentFull}>
        {selectedTag && (
          <div className={styles.tagInfo}>
            <p>Showing snippets tagged with <strong>{selectedTag}</strong></p>
          </div>
        )}
        
        {loading ? (
          <div className={styles.loading}>
            <p>Loading snippets...</p>
          </div>
        ) : (
          <SnippetGrid 
            snippets={filteredSnippets} 
            onSnippetClick={handleSnippetClick}
          />
        )}
      </main>
      
      {/* Modal for snippet details */}
      <SnippetModal
        snippet={selectedSnippet}
        isOpen={isModalOpen}
        onClose={handleModalClose}
      />
    </div>
  );
}