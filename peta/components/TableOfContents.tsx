import { useEffect, useState, useRef } from 'react';
import styles from '../styles/TableOfContents.module.css';

interface TOCItem {
  id: string;
  title: string;
  level: number;
}

interface TableOfContentsProps {
  content: string;
  postTitle?: string;
}

export default function TableOfContents({ content, postTitle }: TableOfContentsProps) {
  const [headings, setHeadings] = useState<TOCItem[]>([]);
  const [activeId, setActiveId] = useState<string>('');
  const observerRef = useRef<IntersectionObserver | null>(null);
  const processedRef = useRef(false);

  useEffect(() => {
    if (!content || processedRef.current) return;
    processedRef.current = true;
    
    // Function to extract headings from the content string
    const extractHeadingsFromContent = () => {
      // Create a temporary div to parse the HTML
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = content;
      
      const extractedHeadings: TOCItem[] = [];
      
      // Extract all headings (h1, h2, h3, h4) from regular content
      const headingElements = tempDiv.querySelectorAll('h1, h2, h3, h4');
      
      headingElements.forEach((heading, index) => {
        // Skip headings that are inside snippet cards
        if (!heading.closest('.snippetCard')) {
          const level = parseInt(heading.tagName.charAt(1));
          const title = heading.textContent || '';
          const id = `heading-${index}`;
          
          extractedHeadings.push({
            id,
            title,
            level
          });
        }
      });
      
      // Extract embedded snippets as sections
      const snippetCards = tempDiv.querySelectorAll('.snippetCard');
      
      snippetCards.forEach((card, index) => {
        const headerElement = card.querySelector('.snippetHeader h3');
        if (headerElement) {
          const title = headerElement.textContent || '';
          const cardId = card.id || `snippet-${index}`;
          
          extractedHeadings.push({
            id: cardId,
            title: title.startsWith('Snippet:') ? title : `Snippet: ${title}`,
            level: 2
          });
        }
      });
      
      return extractedHeadings;
    };
    
    // Function to add IDs to headings in the DOM
    const addIdsToDOMHeadings = (extractedHeadings: TOCItem[]) => {
      // Find all headings in the article content
      const articleContent = document.querySelector('.articleContent');
      if (!articleContent) {
        // Retry once if content is not ready
        setTimeout(() => addIdsToDOMHeadings(extractedHeadings), 100);
        return;
      }
      
      // Add IDs to all headings (h1, h2, h3, h4)
      const headingElements = articleContent.querySelectorAll('h1, h2, h3, h4');
      
      headingElements.forEach((heading) => {
        // Only add IDs to regular headings, not snippet headers
        if (!heading.closest('.snippetHeader') && !heading.id) {
          // Find the corresponding heading in our extracted list
          const headingText = heading.textContent || '';
          const matchingItem = extractedHeadings.find(h => 
            h.title === headingText && h.id.startsWith('heading-')
          );
          
          if (matchingItem) {
            heading.id = matchingItem.id;
          }
        }
      });
    };
    
    // Extract headings from content
    const extractedHeadings = extractHeadingsFromContent();
    
    if (extractedHeadings.length > 0) {
      // Set the headings state immediately
      setHeadings(extractedHeadings);
      
      // Add IDs to DOM after a short delay to ensure content is rendered
      setTimeout(() => addIdsToDOMHeadings(extractedHeadings), 50);
    } else {
      // No headings found
      setHeadings([]);
    }
    
    return () => {
      processedRef.current = false;
    };
  }, [content]);

  useEffect(() => {
    // Clean up previous observer
    if (observerRef.current) {
      observerRef.current.disconnect();
    }
    
    if (headings.length === 0) return;
    
    // Set up intersection observer to track active heading
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

    // Observe all headings
    headings.forEach((heading) => {
      const element = document.getElementById(heading.id);
      if (element) {
        observerRef.current?.observe(element);
      }
    });

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [headings]);

  const scrollToHeading = (id: string) => {
    console.log(`Attempting to scroll to heading with ID: ${id}`);
    const element = document.getElementById(id);
    console.log(`Found element:`, element);
    
    if (element) {
      console.log('Element found, scrolling to position...');
      const offset = 100; // Header offset
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      console.log(`Scrolling to position: ${offsetPosition}`);

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    } else {
      console.error(`Element with ID ${id} not found`);
      // List all available IDs for debugging
      const allElementsWithIds = document.querySelectorAll('[id]');
      console.log('Available IDs:', Array.from(allElementsWithIds).map(el => el.id));
      
      // Try to find the element by text content if ID doesn't work
      const heading = Array.from(document.querySelectorAll('h1, h2, h3, h4')).find(
        h => h.textContent === headings.find(hh => hh.id === id)?.title
      );
      
      if (heading) {
        console.log('Found heading by text content, assigning ID and scrolling');
        heading.id = id;
        const offset = 100;
        const elementPosition = heading.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - offset;
        
        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    }
  };

  // Always render the component for debugging
  return (
    <div className={styles.tableOfContents}>
      <h3 className={styles.tocTitle}>{postTitle || 'Table of Contents'}</h3>
      {headings.length > 0 ? (
        <ul className={styles.tocList}>
          {headings.map((heading) => (
            <li
              key={heading.id}
              className={`${styles.tocItem} ${styles[`level-${heading.level}`]} ${
                activeId === heading.id ? styles.active : ''
              }`}
            >
              <button
                className={styles.tocLink}
                onClick={() => {
                  console.log(`Clicked on heading: ${heading.title} with ID: ${heading.id}`);
                  scrollToHeading(heading.id);
                }}
              >
                {heading.title}
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
          No headings found
        </p>
      )}
    </div>
  );
}