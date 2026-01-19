import React, { useState, useEffect, useRef } from 'react';
import styles from '../styles/TableOfContents.module.css';

interface BookSection {
  id: string;
  title: string;
  content: any[];
}

interface BookTableOfContentsProps {
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

export default function BookTableOfContents({ book }: BookTableOfContentsProps) {
  const [activeId, setActiveId] = useState<string>('');
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
    <div className={styles.tableOfContents}>
      <h3 className={styles.tocTitle}>{book.title}</h3>
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
  );
}