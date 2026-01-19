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
}

export default function BookTOC({ book }: BookTOCProps) {
  const [activeId, setActiveId] = useState<string>('');
  const [isExpanded, setIsExpanded] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
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

    // Observe all sections
    book.sections.forEach((section) => {
      const element = document.getElementById(`section-${section.id}`);
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
    <div className={`${styles.bookTOC} ${isExpanded ? styles.expanded : ''}`}>
      <button 
        className={styles.tocIcon}
        onClick={() => setIsExpanded(!isExpanded)}
        aria-label={isExpanded ? 'Hide TOC' : 'Show TOC'}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="3" y1="6" x2="21" y2="6"></line>
          <line x1="3" y1="12" x2="21" y2="12"></line>
          <line x1="3" y1="18" x2="21" y2="18"></line>
        </svg>
      </button>
      
      {isExpanded && (
        <div className={styles.tocPanel}>
          <div className={styles.tocHeader}>
            <h3 className={styles.tocTitle}>{book.title}</h3>
          </div>
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
                    window.history.pushState(null, '', `#section-${section.id}`);
                    scrollToSection(section.id);
                  }}
                >
                  {section.title}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}