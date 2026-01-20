import { GetStaticPaths, GetStaticProps } from 'next';
import fs from 'fs-extra';
import path from 'path';
import { useRouter } from 'next/router';
import Link from 'next/link';
import MathRenderer from '../../components/MathRenderer';
import CodeBlock from '../../components/CodeBlock';
import { useState, useEffect } from 'react';
import styles from '../../styles/Articles.module.css';

interface Book {
  id: string;
  title: string;
  author: string;
  description: string;
  date: string;
  tags: string[];
  coverImage?: string;
  content: any[];
  sections: Array<{
    id: string;
    title: string;
    content: any[];
  }>;
}

interface BookProps {
  book: Book;
}

export default function Book({ book }: BookProps) {
  const router = useRouter();
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [showTOC, setShowTOC] = useState(true);

  useEffect(() => {
    // Redirect to /books page with book parameter
    if (!router.isFallback && book) {
      router.replace(`/books?book=${book.id}`);
    }
  }, [router.isFallback, book, router]);

  // Highlight code blocks when book is loaded
  useEffect(() => {
    if (book) {
      setTimeout(() => {
        if (typeof window !== 'undefined' && window.highlightCodeBlocks) {
          window.highlightCodeBlocks();
        }
      }, 100);
    }
  }, [book]);

  

  if (router.isFallback) {
    return <div>Loading...</div>;
  }

  if (!book) {
    return <div>Book not found</div>;
  }

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    } catch (error) {
      return dateString;
    }
  };

  const renderContent = (content: any[]) => {
    const elements: JSX.Element[] = [];
    
    for (let i = 0; i < content.length; i++) {
      const item = content[i];
      
      if (item.type === 'text') {
        // Convert RST-style text to HTML, preserving math formulas
        const htmlContent = item.content
          .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // Bold text
          .replace(/\*(.*?)\*/g, '<em>$1</em>') // Italic text
          .replace(/`(.*?)`/g, '<code>$1</code>') // Inline code
          .replace(/\n\n/g, '</p><p>') // Paragraph breaks
          .replace(/\n/g, '<br />'); // Line breaks
        
        elements.push(
          <MathRenderer 
            key={i} 
            content={`<p>${htmlContent}</p>`}
          />
        );
      } else if (item.type === 'code-block') {
        elements.push(
          <CodeBlock 
            key={i}
            code={item.content}
            language={item.language || 'text'}
          />
        );
      }
    }
    
    return elements;
  };

  const BookTableOfContents = () => {
    const [activeId, setActiveId] = useState('');

    useEffect(() => {
      const addIdsToDOM = () => {
        // Add IDs to section headings
        book.sections.forEach((section) => {
          const element = document.getElementById(`section-${section.id}`);
          if (element && !element.id) {
            element.id = `section-${section.id}`;
          }
        });
      };

      addIdsToDOM();

      // Set up intersection observer to track active section
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setActiveId(entry.target.id);
            }
          });
        },
        {
          rootMargin: '-100px 0px -70% 0px'
        }
      );

      // Observe all sections
      book.sections.forEach((section) => {
        const element = document.getElementById(`section-${section.id}`);
        if (element) {
          observer.observe(element);
        }
      });

      return () => {
        observer.disconnect();
      };
    }, []);

    const scrollToSection = (sectionId: string) => {
      const element = document.getElementById(`section-${sectionId}`);
      if (element) {
        const offset = 100; // Header offset
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - offset;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    };

    return (
      <div className={styles.tableOfContents}>
        <h3 className={styles.tocTitle}>Table of Contents</h3>
        <ul className={styles.tocList}>
          {book.sections.map((section) => (
            <li 
              key={section.id} 
              className={`${styles.tocItem} ${activeId === `section-${section.id}` ? styles.active : ''}`}
            >
              <a 
                href={`#section-${section.id}`}
                className={styles.tocLink}
                onClick={(e) => {
                  e.preventDefault();
                  scrollToSection(section.id);
                }}
              >
                {section.title}
              </a>
            </li>
          ))}
        </ul>
      </div>
    );
  };

  return (
    <div className={styles.pageContainer}>
      {/* Header */}
      <header className={styles.pageHeader}>
        <div className={styles.headerSection}>
          <Link href="/books" className={styles.titleLink}>
            <h1 className={styles.title}>{book.title}</h1>
          </Link>
          <div className={styles.tagsSection}>
            {book.tags && book.tags.length > 0 && (
              <div className={styles.articleTags}>
                {book.tags.map((tag) => (
                  <span key={tag} className={styles.articleTag}>
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </header>
      
      {/* Content with TOC and main content */}
      <div className={styles.contentSection}>
        <aside className={styles.tocAside}>
          {showTOC && <BookTableOfContents />}
        </aside>
        
        <main className={styles.mainContent}>
          <article className={styles.article}>
            <header className={styles.articleHeader}>
              <div className={styles.articleMeta}>
                <span className={styles.articleAuthor}>by {book.author}</span>
                <time className={styles.articleDate} dateTime={book.date}>
                  {formatDate(book.date)}
                </time>
              </div>
              {book.description && (
                <p className={styles.articleDescription}>{book.description}</p>
              )}
            </header>
            
            <div className={styles.articleContent}>
              {/* Render introduction from index.rst */}
              {book.content && renderContent(book.content)}
              
              {/* Render each section */}
              {book.sections.map((section) => (
                <section key={section.id} id={`section-${section.id}`} className={styles.bookSection}>
                  <h2>{section.title}</h2>
                  {section.content && renderContent(section.content)}
                </section>
              ))}
            </div>
          </article>
        </main>
      </div>
    </div>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  try {
    const dataDir = path.join(process.cwd(), '../_build/data');
    const booksIndexPath = path.join(dataDir, 'books-index.json');
    
    if (!await fs.pathExists(booksIndexPath)) {
      return {
        paths: [],
        fallback: true,
      };
    }

    const booksIndex = await fs.readJson(booksIndexPath);
    const paths = booksIndex.items
      .filter((book: any) => book.id) // Filter out any items without id
      .map((book: any) => ({
        params: { slug: book.id },
      }));

    return {
      paths,
      fallback: true,
    };
  } catch (error) {
    console.error('Error generating paths for books:', error);
    return {
      paths: [],
      fallback: true,
    };
  }
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const slug = params?.slug;

  if (!slug || typeof slug !== 'string') {
    return { notFound: true };
  }

  try {
    const dataDir = path.join(process.cwd(), '../_build/data');
    const booksIndexPath = path.join(dataDir, 'books-index.json');
    
    if (!await fs.pathExists(booksIndexPath)) {
      return { notFound: true };
    }
    
    const booksIndex = await fs.readJson(booksIndexPath);
    const book = booksIndex.items.find((item: any) => item.id === slug);
    
    if (!book) {
      return { notFound: true };
    }

    return {
      props: { book },
    };
  } catch (error) {
    console.error(`Error loading book ${slug}:`, error);
    return { notFound: true };
  }
};