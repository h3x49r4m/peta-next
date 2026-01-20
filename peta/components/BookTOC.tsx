import React, { useState, useEffect, useRef } from 'react';
import styles from '../styles/BookTOC.module.css';

interface BookSection {
  id: string;
  title: string;
  content: any[];
}

interface BookTOCProps {
  book: {
    id: string;
    title: string;
    author: string;
    description: string;
    date: string;
    tags: string[];
    coverImage?: string;
    sections: BookSection[];
  };
  snippets?: any[];
  snippetsLoading?: boolean;
  currentSectionId?: string;
  onSectionSelect?: (sectionId: string) => void;
}

export default function BookTOC({ book, snippets = [], snippetsLoading = false, currentSectionId = '', onSectionSelect }: BookTOCProps) {
  const [activeId, setActiveId] = useState<string>('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [expandedSnippets, setExpandedSnippets] = useState<Set<string>>(new Set());
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    // Handle initial hash scroll
    const handleHashScroll = () => {
      const hash = window.location.hash.slice(1); // Remove the # character
      if (hash) {
        // Check if it's a snippet hash
        if (hash.startsWith('snippet-')) {
          // Check if it's a snippet subheader (has multiple dashes after snippet-)
          const hashParts = hash.split('-');
          if (hashParts.length > 2) {
            // It's a subheader, find which snippet it belongs to
            // Need to handle snippet IDs that may contain hyphens
            const allSnippets = getAllSnippets();
            let snippet = null;
            
            // Find the snippet by checking if the hash starts with 'snippet-{snippetId}-'
            for (const s of allSnippets) {
              if (hash.startsWith(`snippet-${s.id}-`)) {
                snippet = s;
                break;
              }
            }
            
            if (snippet) {
              // Ensure the section containing this snippet is loaded
              const sectionPlaceholder = document.getElementById(`section-placeholder-${snippet.sectionId}`);
              if (sectionPlaceholder) {
                // Manually trigger the intersection observer by scrolling the placeholder into view briefly
                const originalScroll = window.pageYOffset;
                sectionPlaceholder.scrollIntoView({ behavior: 'auto', block: 'start' });
                setTimeout(() => {
                  window.scrollTo(0, originalScroll);
                  // Now try to scroll to the subheader
                  setTimeout(() => {
                    const element = document.getElementById(hash);
                    if (element) {
                      const offset = 100;
                      const elementPosition = element.getBoundingClientRect().top;
                      const offsetPosition = elementPosition + window.pageYOffset - offset;
                      window.scrollTo({
                        top: offsetPosition,
                        behavior: 'smooth'
                      });
                    }
                  }, 300);
                }, 100);
              } else {
                // Section might already be loaded, try scrolling directly
                setTimeout(() => {
                  const element = document.getElementById(hash);
                  if (element) {
                    const offset = 100;
                    const elementPosition = element.getBoundingClientRect().top;
                    const offsetPosition = elementPosition + window.pageYOffset - offset;
                    window.scrollTo({
                      top: offsetPosition,
                      behavior: 'smooth'
                    });
                  }
                }, 300);
              }
            }
          } else {
            // It's a main snippet
            const snippetId = hash.replace('snippet-', '');
            setTimeout(() => {
              scrollToSnippet(snippetId);
            }, 100); // Small delay to ensure DOM is ready
          }
        } else {
          // Regular section or heading scroll
          const element = document.getElementById(hash);
          if (element) {
            const offset = 100;
            const elementPosition = element.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - offset;
            window.scrollTo({
              top: offsetPosition,
              behavior: 'smooth'
            });
          }
        }
      }
    };

    // Initial hash scroll
    setTimeout(handleHashScroll, 500); // Wait longer for content to render

    // Add IDs to sections in the DOM
    const addIdsToDOM = () => {
      book.sections.forEach((section) => {
        const element = document.getElementById(`section-${section.id}`);
        if (element && !element.id) {
          element.id = `section-${section.id}`;
        }
      });
    };

    addIdsToDOM();

    // Clean up previous observer
    if (observerRef.current) {
      observerRef.current.disconnect();
    }
    
    if (book.sections.length === 0) return;
    
    // Set up intersection observer to track active section
    observerRef.current = new IntersectionObserver(
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

    // Observe all sections (both actual and placeholders)
    book.sections.forEach((section) => {
      // Try to observe the actual section first
      let element = document.getElementById(`section-${section.id}`);
      if (!element) {
        // If not found, observe the placeholder
        element = document.getElementById(`section-placeholder-${section.id}`);
      }
      if (element) {
        observerRef.current?.observe(element);
      }
    });

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [book.sections]);
  
    useEffect(() => {
      // Listen for hash changes
      const handleHashChange = () => {
        const hash = window.location.hash.slice(1);
        if (hash) {
          if (hash.startsWith('snippet-')) {
            // Check if it's a snippet subheader (has multiple dashes after snippet-)
            const hashParts = hash.split('-');
            if (hashParts.length > 2) {
            // It's a subheader, find which snippet it belongs to
            // Need to handle snippet IDs that may contain hyphens
            const allSnippets = getAllSnippets();
            let snippet = null;
            
            // Find the snippet by checking if the hash starts with 'snippet-{snippetId}-'
            for (const s of allSnippets) {
              if (hash.startsWith(`snippet-${s.id}-`)) {
                snippet = s;
                console.log(`Found snippet ${s.id} in section ${s.sectionId}`);
                break;
              }
            }
            
            if (snippet) {
              // Find which section contains this snippet
              console.log(`Looking for section-placeholder-${snippet.sectionId}`);
              const sectionPlaceholder = document.getElementById(`section-placeholder-${snippet.sectionId}`);
              console.log(`Section placeholder found:`, !!sectionPlaceholder);
              
              if (sectionPlaceholder) {
                // Load the section first
                console.log('Loading section first');
                const originalScroll = window.pageYOffset;
                sectionPlaceholder.scrollIntoView({ behavior: 'auto', block: 'start' });
                setTimeout(() => {
                  window.scrollTo(0, originalScroll);
                  // Now try to scroll to the header
                  setTimeout(() => {
                    console.log(`Looking for element with ID: ${hash}`);
                    const element = document.getElementById(hash);
                    console.log(`Element found:`, !!element);
                    if (element) {
                      console.log('Scrolling to element');
                      const offset = 100;
                      const elementPosition = element.getBoundingClientRect().top;
                      const offsetPosition = elementPosition + window.pageYOffset - offset;
                      window.scrollTo({
                        top: offsetPosition,
                        behavior: 'smooth'
                      });
                    } else {
                      console.error(`Element not found: ${hash}`);
                    }
                  }, 500);
                }, 100);
              } else {
                // Section might already be loaded, scroll directly
                console.log('Section might already be loaded');
                setTimeout(() => {
                  console.log(`Looking for element with ID: ${hash}`);
                  const element = document.getElementById(hash);
                  console.log(`Element found:`, !!element);
                  if (element) {
                    console.log('Scrolling to element');
                    const offset = 100;
                    const elementPosition = element.getBoundingClientRect().top;
                    const offsetPosition = elementPosition + window.pageYOffset - offset;
                    window.scrollTo({
                      top: offsetPosition,
                      behavior: 'smooth'
                    });
                  } else {
                    console.error(`Element not found: ${hash}`);
                  }
                }, 100);
              }
            } else {
              console.error('Snippet not found for hash:', hash);
            }
          }
            } else {
              // It's a main snippet
              const snippetId = hash.replace('snippet-', '');
              setTimeout(() => {
                scrollToSnippet(snippetId);
              }, 100);
            }
          } else {
            const element = document.getElementById(hash);
            if (element) {
              const offset = 100;
              const elementPosition = element.getBoundingClientRect().top;
              const offsetPosition = elementPosition + window.pageYOffset - offset;
              window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
              });
            }
          }
      };
  
      window.addEventListener('hashchange', handleHashChange);
      return () => {
        window.removeEventListener('hashchange', handleHashChange);
      };
    }, []);
  
    const scrollToSection = (sectionId: string) => {    const element = document.getElementById(`section-${sectionId}`);
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

  const scrollToSnippet = (snippetId: string) => {
    // Find which section contains this snippet
    const snippet = getAllSnippets().find(s => s.id === snippetId);
    if (!snippet) {
      console.warn(`Snippet not found in TOC: ${snippetId}`);
      return;
    }
    
    // Check if the snippet is in the current section
    if (snippet.sectionId !== currentSectionId) {
      // Switch to the section containing this snippet first
      if (onSectionSelect) {
        onSectionSelect(snippet.sectionId);
      }
      // Wait a bit for the section to load
      setTimeout(() => {
        scrollToElement(snippetId);
      }, 300);
    } else {
      // Snippet is in current section, scroll directly
      scrollToElement(snippetId);
    }
  };

  const scrollToElement = (elementId: string) => {
    // Try multiple times to find the element as it might be loading
    let attempts = 0;
    const maxAttempts = 10;
    const retryDelay = 100;
    
    const tryScroll = () => {
      attempts++;
      const element = document.getElementById(`snippet-${elementId}`);
      
      if (element) {
        // Check if the element is actually visible
        const computedStyle = window.getComputedStyle(element);
        const isVisible = computedStyle.opacity !== '0' && computedStyle.display !== 'none';
        
        if (isVisible) {
          const offset = 100; // Header offset
          const elementPosition = element.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - offset;

          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
          });
        } else if (attempts < maxAttempts) {
          // Element exists but not visible yet, retry
          setTimeout(tryScroll, retryDelay);
        }
      } else if (attempts < maxAttempts) {
        // Element not found yet, retry after a delay
        setTimeout(tryScroll, retryDelay);
      } else {
        console.warn(`Element not found after ${maxAttempts} attempts: snippet-${elementId}`);
      }
    };
    
    // Start trying immediately
    setTimeout(tryScroll, 50);
  };

  // Extract snippets from all sections
  const getAllSnippets = () => {
    const allSnippets: any[] = [];
    
    book.sections.forEach(section => {
      if (section.content) {
        section.content.forEach(item => {
          if (item.type === 'snippet-card-ref') {
            const snippetId = item.content;
            
            // Find the actual snippet
            const snippet = snippets.find((s: any) => {
              if (s.id === snippetId) return true;
              if (s.frontmatter?.snippet_id === snippetId) return true;
              if (s.frontmatter?.title === snippetId) return true;
              if (s.title === snippetId) return true;
              
              const snippetSlug = (s.frontmatter?.title || s.title || '').toLowerCase().replace(/[^a-z0-9]+/g, '-');
              if (snippetSlug === snippetId) return true;
              
              const title = (s.frontmatter?.title || s.title || '').toLowerCase();
              const searchTerm = snippetId.toLowerCase().replace(/-/g, ' ');
              if (title.includes(searchTerm) || searchTerm.includes(title)) return true;
              
              return false;
            });
            
            // Use the actual snippet title if available
            const snippetTitle = snippet?.frontmatter?.title || snippet?.title || snippetId.replace(/-/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase());
            
            allSnippets.push({
              id: snippetId,
              title: `Snippet: ${snippet ? (snippet.frontmatter?.title || snippet.title) : snippetTitle}`,
              sectionId: section.id,
              sectionTitle: section.title,
              children: [] // No subheaders
            });
          } else if (item.type === 'embedded-snippet') {
            const snippetTitle = item.title || item.id;
            const formattedTitle = snippetTitle.replace(/-/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase());
            const snippetId = item.id || `snippet-${Date.now()}`;
            
            allSnippets.push({
              id: snippetId,
              title: formattedTitle,
              sectionId: section.id,
              sectionTitle: section.title,
              children: [] // No subheaders
            });
          }
        });
      }
    });
    
    return allSnippets;
  };

  return (
    <div className={`${styles.bookTOC} ${isExpanded ? styles.expanded : ''}`}>
      {isExpanded && (
        <div className={styles.tocPanel}>
          <div className={styles.tocHeader}>
            <h3 className={styles.tocTitle}>{book.title}</h3>
            <div className={styles.tocNavigation}>
              <button 
                className={`${styles.navButton} ${styles.prevButton}`}
                onClick={() => {
                  const currentIndex = book.sections.findIndex(s => s.id === currentSectionId);
                  if (currentIndex > 0) {
                    const prevSection = book.sections[currentIndex - 1];
                    if (onSectionSelect) {
                      onSectionSelect(prevSection.id);
                    }
                  }
                }}
                disabled={!currentSectionId || book.sections.findIndex(s => s.id === currentSectionId) === 0}
              >
                ←
              </button>
              <button 
                className={`${styles.navButton} ${styles.nextButton}`}
                onClick={() => {
                  const currentIndex = book.sections.findIndex(s => s.id === currentSectionId);
                  if (currentIndex < book.sections.length - 1) {
                    const nextSection = book.sections[currentIndex + 1];
                    if (onSectionSelect) {
                      onSectionSelect(nextSection.id);
                    }
                  }
                }}
                disabled={!currentSectionId || book.sections.findIndex(s => s.id === currentSectionId) === book.sections.length - 1}
              >
                →
              </button>
            </div>
          </div>
          <ul className={styles.tocList}>
            {book.sections.map((section) => {
              const sectionSnippets = getAllSnippets().filter(s => s.sectionId === section.id);
              const isCurrentSection = section.id === currentSectionId || (!currentSectionId && section.id === 'index');
              
              return (
                <li key={section.id}>
                  <div className={styles.sectionGroup}>
                    <a 
                      href={`#section-${section.id}`}
                      className={`${styles.tocLink} ${styles.sectionLink} ${isCurrentSection ? styles.active : ''} ${activeId === `section-${section.id}` || activeId === `section-placeholder-${section.id}` ? styles.active : ''}`}
                      onClick={(e) => {
                        e.preventDefault();
                        if (onSectionSelect) {
                          onSectionSelect(section.id);
                        }
                        window.history.pushState(null, '', `#section-${section.id}`);
                        scrollToSection(section.id);
                      }}
                    >
                      {isCurrentSection && <span className={styles.currentIndicator}>▶</span>}
                      {section.title}
                    </a>
                    
                    {sectionSnippets.length > 0 && (
                      <ul className={styles.snippetList}>
                        {sectionSnippets.map((snippet) => (
                          <li key={snippet.id} className={styles.snippetItem}>
                            <a 
                              href={`#snippet-${snippet.id}`}
                              className={`${styles.tocLink} ${styles.snippetLink} ${activeId === `snippet-${snippet.id}` ? styles.active : ''}`}
                              onClick={(e) => {
                                e.preventDefault();
                                window.history.pushState(null, '', `#snippet-${snippet.id}`);
                                
                                // Scroll to the snippet
                                scrollToSnippet(snippet.id);
                              }}
                            >
                              <span className={styles.snippetIcon}>📄</span>
                              {snippet.title}
                            </a>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}
      
      <button 
        className={styles.tocIcon}
        onClick={() => setIsExpanded(!isExpanded)}
        aria-label={isExpanded ? 'Hide TOC' : 'Show TOC'}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="3" y1="6" x2="21" y2="6"></line>
          <line x1="3" y1="12" x2="21" y2="12"></line>
          <line x1="3" y1="18" x2="21" y2="18"></line>
        </svg>
      </button>
    </div>
  );
}