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
  const [isDetailsExpanded, setIsDetailsExpanded] = useState(true);
  const [expandedSnippets, setExpandedSnippets] = useState<Set<string>>(new Set());
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Initialize expanded sections with current section
  useEffect(() => {
    if (currentSectionId) {
      setExpandedSections(new Set([currentSectionId]));
    }
  }, [currentSectionId]);

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
            // Handle section headers
            if (!hash.startsWith('snippet-')) {
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
            } else {
              // Handle snippet navigation
              const snippetId = hash.replace('snippet-', '');
              scrollToSnippet(snippetId);
            }
          }
        };
      
        // Initial hash check
        handleHashChange();
        
        window.addEventListener('hashchange', handleHashChange);
        return () => {
          window.removeEventListener('hashchange', handleHashChange);
        };
      }, [currentSectionId]); // Add currentSectionId dependency  
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
    const maxAttempts = 20;
    const retryDelay = 100;
    
    const tryScroll = () => {
      attempts++;
      // Check both snippet and heading IDs
      let element = document.getElementById(`snippet-${elementId}`);
      if (!element) {
        element = document.getElementById(elementId);
      }
      
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
          return; // Success, exit
        }
      }
      
      if (attempts < maxAttempts) {
        // Element not found or not visible yet, retry after a delay
        setTimeout(tryScroll, retryDelay);
      } else {
        console.warn(`Element not found after ${maxAttempts} attempts: ${elementId}`);
        console.log('Available header IDs:', 
          Array.from(document.querySelectorAll('h2[id], h3[id], h4[id]')).map(el => el.id)
        );
      }
    };
    
    // Start trying immediately
    setTimeout(tryScroll, 50);
  };

  // Extract snippets from all sections (with proper header tracking)
  const getAllSnippets = () => {
    const allSnippets: any[] = [];
    
    book.sections.forEach(section => {
      if (section.content) {
        // Track the current header while scanning content
        let currentHeader = null;
        
        section.content.forEach(item => {
          // Check if this is a header (text block that looks like a header)
          if (item.type === 'text' && item.content) {
            const lines = item.content.split('\n');
            // Process all lines in the text block to find headers
            for (let j = 0; j < lines.length - 1; j++) {
              const line = lines[j];
              const nextLine = lines[j + 1];
              
              if (nextLine && (nextLine.startsWith('-') || nextLine.startsWith('~')) && 
                  nextLine.trim().length > 0) {
                const underlineChar = nextLine.trim()[0];
                if (nextLine.trim() === underlineChar.repeat(nextLine.trim().length)) {
                  // This is a header - update currentHeader
                  currentHeader = {
                    text: line.trim(),
                    level: underlineChar === '-' ? 2 : 3,
                    id: `${section.id}-${line.trim().toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-')}`
                  };
                }
              }
            }
          } else if (item.type === 'snippet-card-ref') {
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
            
            // Add the snippet (allow duplicates)
            allSnippets.push({
              id: snippetId,
              title: `Snippet: ${snippet ? (snippet.frontmatter?.title || snippet.title) : snippetTitle}`,
              sectionId: section.id,
              sectionTitle: section.title,
              header: currentHeader,
              children: [] // No subheaders
            });
          } else if (item.type === 'embedded-snippet') {
            const snippetTitle = item.title || item.id;
            const formattedTitle = snippetTitle.replace(/-/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase());
            const snippetId = item.id || `snippet-${Date.now()}`;
            
            // Add the embedded snippet (allow duplicates)
            allSnippets.push({
              id: snippetId,
              title: formattedTitle,
              sectionId: section.id,
              sectionTitle: section.title,
              header: currentHeader, // Add header information
              children: [] // No subheaders
            });
          }
        });
      }
    });
    
    return allSnippets;
  };

// Extract headers from section content (excluding h1/=== which is the section title)
  const getSectionHeaders = (section: BookSection) => {
    const headers: any[] = [];
    
    if (section.content) {
      section.content.forEach((item) => {
        if (item.type === 'text') {
          const lines = item.content.split('\n');
          
          for (let i = 0; i < lines.length - 1; i++) {
            const line = lines[i].trim();
            const nextLine = lines[i + 1].trim();
            
            if (line && nextLine) {
              let level = 0;
              
              // Skip h1 (===) as it's the section title
              // Check for h2 (---)
              if (nextLine === '-'.repeat(nextLine.length)) {
                level = 2;
              }
              // Check for h3 (~~~ or ~~~~)
              else if (nextLine.match(/^~+$/)) {
                level = 3;
              }
              
              if (level > 0) {
                const headerId = `${section.id}-${line.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-')}`;
                headers.push({
                  id: headerId,
                  title: line,
                  level: level
                });
              }
            }
          }
        }
      });
    }
    
    return headers;
  };

  return (
    <div className={`${styles.bookTOC} ${isExpanded ? styles.expanded : ''}`}>
      {isExpanded && (
        <div className={styles.tocPanel}>
          {/* Unified header with two rows */}
          <div className={styles.tocHeader}>
            <div className={styles.tocContent}>
              {/* First row: Book title */}
              <div className={styles.titleRow}>
                <h3 className={styles.tocTitle}>{book.title}</h3>
              </div>
              {/* Second row: Controls */}
              <div className={styles.controlsRow}>
                <button 
                  className={`${styles.toggleButton} ${!isDetailsExpanded ? styles.collapsed : ''}`}
                  onClick={() => {
                    setIsDetailsExpanded(!isDetailsExpanded);
                  }}
                >
                  {isDetailsExpanded ? '-' : '+'}
                </button>
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
            </div>
          </div>
          <ul className={styles.tocList}>
            {book.sections.map((section) => {
              const allSnippets = getAllSnippets();
              const sectionSnippets = allSnippets.filter(s => s.sectionId === section.id);
              const sectionHeaders = getSectionHeaders(section);
              const isCurrentSection = section.id === currentSectionId || (!currentSectionId && section.id === 'index');
              const hasSubContent = sectionHeaders.length > 0 || sectionSnippets.length > 0;
              
              return (
                <li key={section.id}>
                  <div className={styles.sectionGroup}>
                    <div className={styles.sectionHeader}>
                      {hasSubContent && (
                        <button 
                          className={`${styles.sectionToggle}`}
                          onClick={() => {
                            const newExpanded = new Set(expandedSections);
                            if (newExpanded.has(section.id)) {
                              newExpanded.delete(section.id);
                            } else {
                              newExpanded.add(section.id);
                            }
                            setExpandedSections(newExpanded);
                          }}
                        >
                          {expandedSections.has(section.id) ? '-' : '+'}
                        </button>
                      )}
                      <a 
                        href={`#section-${section.id}`}
                        className={`${styles.tocLink} ${styles.sectionLink} ${isCurrentSection ? styles.active : ''}`}
                        onClick={(e) => {
                          e.preventDefault();
                          if (onSectionSelect) {
                            onSectionSelect(section.id);
                          }
                          window.history.pushState(null, '', `#section-${section.id}`);
                          scrollToSection(section.id);
                        }}
                      >
                        
                        {section.title}
                      </a>
                    </div>
                    
                    {/* Show headers and their snippets within the section */}
                    {(isDetailsExpanded || expandedSections.has(section.id)) && sectionHeaders.length > 0 && (
                      <ul className={styles.headerList}>
                        {sectionHeaders.map((header) => {
                          // Find snippets that belong to this header
                          const headerSnippets = sectionSnippets.filter(s => 
                            s.header && s.header.id === header.id
                          );
                          
                          return (
                            <li key={header.id}>
                              <div className={styles.headerItem} style={{ marginLeft: `${(header.level - 1) * 16}px` }}>
                                <a 
                                  href={`#${header.id}`}
                                  className={`${styles.tocLink} ${styles.headerLink} ${activeId === header.id ? styles.active : ''}`}
                                  onClick={(e) => {
                                    e.preventDefault();
                                    window.history.pushState(null, '', `#${header.id}`);
                                    
                                    // Always ensure we're in the correct section first
                                    if (section.id !== currentSectionId) {
                                      // Switch to the section containing this header first
                                      if (onSectionSelect) {
                                        onSectionSelect(section.id);
                                      }
                                      // Wait for section to load and render
                                      setTimeout(() => {
                                        // Try multiple times as MathRenderer might need time
                                        let attempts = 0;
                                        const maxAttempts = 10;
                                        const tryScroll = () => {
                                          attempts++;
                                          const element = document.getElementById(header.id);
                                          if (element) {
                                            const offset = 100;
                                            const elementPosition = element.getBoundingClientRect().top;
                                            const offsetPosition = elementPosition + window.pageYOffset - offset;
                                            window.scrollTo({
                                              top: offsetPosition,
                                              behavior: 'smooth'
                                            });
                                          } else if (attempts < maxAttempts) {
                                            setTimeout(tryScroll, 100);
                                          }
                                        };
                                        tryScroll();
                                      }, 500);
                                    } else {
                                      // Header is in current section, but still wait for potential rendering
                                      setTimeout(() => {
                                        const element = document.getElementById(header.id);
                                        if (element) {
                                          const offset = 100;
                                          const elementPosition = element.getBoundingClientRect().top;
                                          const offsetPosition = elementPosition + window.pageYOffset - offset;
                                          window.scrollTo({
                                            top: offsetPosition,
                                            behavior: 'smooth'
                                          });
                                        }
                                      }, 100);
                                    }
                                  }}
                                >
                                  {header.title}
                                </a>
                              </div>
                              
                              {/* Show snippets under this header */}
                              {headerSnippets.length > 0 && (
                                <ul className={styles.snippetList} style={{ marginLeft: `${(header.level - 1) * 16 + 16}px` }}>
                                  {headerSnippets.map((snippet, index) => (
                                    <li key={`${section.id}-${snippet.id}-${index}`} className={styles.snippetItem}>
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
                            </li>
                          );
                        })}
                      </ul>
                    )}
                    
                    {/* Show snippets that are not under any header */}
                    {(isDetailsExpanded || expandedSections.has(section.id)) && (() => {
                      const standaloneSnippets = sectionSnippets.filter(s => !s.header);
                      if (standaloneSnippets.length === 0) return null;
                      
                      return (
                        <ul className={styles.snippetList}>
                          {standaloneSnippets.map((snippet, index) => (
                            <li key={`${section.id}-${snippet.id}-${index}`} className={styles.snippetItem}>
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
                      );
                    })()}
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