import { useState, useEffect } from 'react';
import TagFilter from '../../components/TagFilter';
import BookGrid from '../../components/BookGrid';
import styles from '../../styles/Articles.module.css'; // Reuse Articles styles
import MathRenderer from '../../components/MathRenderer';
import Link from 'next/link';
import { useRouter } from 'next/router';

interface Book {
  id: string;
  title: string;
  author: string;
  description: string;
  date: string;
  tags: string[];
  coverImage?: string;
  sections?: any[];
}

export default function Books() {
  const [books, setBooks] = useState<Book[]>([]);
  const [tags, setTags] = useState<any[]>([]);
  const [selectedTag, setSelectedTag] = useState<string>('');
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [renderedContent, setRenderedContent] = useState<string>('');
  const [showTOC, setShowTOC] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const router = useRouter();

  useEffect(() => {
    loadBooksContent();
  }, []);

  useEffect(() => {
    // Reset selected book when the route changes
    const handleRouteChange = (url: string) => {
      if (url === '/books' || url === '/books?') {
        setSelectedBook(null);
        setSelectedTag('');
        setShowTOC(false);
      }
    };
    
    router.events.on('routeChangeComplete', handleRouteChange);
    
    return () => {
      router.events.off('routeChangeComplete', handleRouteChange);
    };
  }, [router]);

  // Also check on mount
  useEffect(() => {
    if (router.asPath === '/books' || router.asPath === '/books?') {
      setSelectedBook(null);
      setSelectedTag('');
      setShowTOC(false);
    }
  }, [router.asPath]);

  useEffect(() => {
    // When a tag is selected, clear the selected book
    if (selectedTag) {
      setSelectedBook(null);
      setShowTOC(false);
      const url = `/books?tag=${encodeURIComponent(selectedTag)}`;
      window.history.pushState({}, '', url);
    }
  }, [selectedTag]);

  // Handle scroll to show/hide back to top button
  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.pageYOffset > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const loadBooksContent = async () => {
    try {
      const [booksResponse, tagsResponse] = await Promise.all([
        fetch('/api/content/book'),
        fetch('/api/tags?type=book')
      ]);
      
      const booksData = await booksResponse.json();
      const tagsData = await tagsResponse.json();
      
      setBooks(booksData);
      setTags(tagsData);
    } catch (error) {
      console.error('Error loading books:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredBooks = selectedTag
    ? books.filter(book => book.tags.includes(selectedTag))
    : books;

  const handleBookSelect = async (book: Book) => {
    setSelectedBook(book);
    setShowTOC(true);
    
    // Update URL
    const url = `/books?book=${encodeURIComponent(book.id)}`;
    window.history.pushState({}, '', url);
    
    // Render content with math
    if (book.content && book.content.length > 0) {
      const content = book.content
        .filter(block => block.type === 'text')
        .map(block => block.content)
        .join('\n');
      setRenderedContent(content);
    } else {
      setRenderedContent('');
    }
  };

  const handleBackToList = () => {
    setSelectedBook(null);
    setShowTOC(false);
    const url = selectedTag ? `/books?tag=${encodeURIComponent(selectedTag)}` : '/books';
    window.history.pushState({}, '', url);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) {
    return <div className={styles.loading}>Loading books...</div>;
  }

  if (selectedBook) {
    return (
      <div className={styles.pageContainer}>
        <header className={styles.pageHeader}>
          <div className={styles.headerSection}>
            <div className={styles.titleSection}>
              <Link href="/books" className={styles.titleLink}>
                <h1 className={styles.title}>Books</h1>
              </Link>
            </div>
            <div className={styles.tagsSection}>
              <TagFilter
                tags={tags}
                selectedTag={selectedTag}
                onTagSelect={setSelectedTag}
              />
            </div>
          </div>
        </header>

        <div className={styles.contentSection}>
          <aside className={styles.tocAside}>
            {showTOC && selectedBook && (
              <TableOfContents 
                content={selectedBook.content || []}
                onSectionClick={() => {}} // Books don't have section navigation yet
              />
            )}
          </aside>

          <main className={styles.mainContent}>
            <button className={styles.backButton} onClick={handleBackToList}>
              ← Back to Books
            </button>
            
            <article className={styles.article}>
              <div className={styles.articleHeader}>
                <h1>{selectedBook.title}</h1>
                <p className={styles.articleMeta}>
                  by {selectedBook.author} • {selectedBook.date}
                </p>
                <div className={styles.articleTags}>
                  {selectedBook.tags.map(tag => (
                    <span key={tag} className={styles.tag}>
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {renderedContent && (
                <MathRenderer content={renderedContent} />
              )}
            </article>
          </main>
        </div>

        {showBackToTop && (
          <button
            className={styles.backToTop}
            onClick={scrollToTop}
            aria-label="Back to top"
          >
            ↑
          </button>
        )}
      </div>
    );
  }

  return (
    <div className={styles.pageContainer}>
      <header className={styles.pageHeader}>
        <div className={styles.headerSection}>
          <div className={styles.titleSection}>
            <Link href="/books" className={styles.titleLink}>
              <h1 className={styles.title}>Books</h1>
            </Link>
          </div>
          <div className={styles.tagsSection}>
            <TagFilter
              tags={tags}
              selectedTag={selectedTag}
              onTagSelect={setSelectedTag}
            />
          </div>
        </div>
      </header>

      <main className={styles.mainContentFull}>
        {selectedTag && (
          <div className={styles.tagInfo}>
            <p>Showing books tagged with <strong>{selectedTag}</strong></p>
          </div>
        )}
        <BookGrid
          books={filteredBooks}
          onBookClick={handleBookSelect}
        />
      </main>
    </div>
  );
}