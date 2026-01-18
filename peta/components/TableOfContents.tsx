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
  const retriesRef = useRef(0);
  const processedRef = useRef(false);
  const updateIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (processedRef.current) return;
    processedRef.current = true;
    
    // Function to extract headings from the content string first
    const extractHeadingsFromContent = () => {
      console.log('Extracting headings from content string...');
      console.log('Content length:', content.length);
      console.log('Content preview:', content.substring(0, 500));
      
      // Create a temporary div to parse the HTML
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = content;
      
      const extractedHeadings: TOCItem[] = [];
      
      // First, extract h2 and h3 headings from regular content
      const headingElements = tempDiv.querySelectorAll('h2, h3');
      console.log(`Found ${headingElements.length} headings (h2 and h3 only) in content string`);
      
      headingElements.forEach((heading, index) => {
        const level = parseInt(heading.tagName.charAt(1));
        const title = heading.textContent || '';
        const id = `heading-${index}`;
        
        extractedHeadings.push({
          id,
          title,
          level
        });
        
        console.log(`Added heading from content: ${title} (${level}) with id: ${id}`);
      });
      
      // Then, extract snippet cards as sections
      const snippetCards = tempDiv.querySelectorAll('.snippetCard');
      console.log(`Found ${snippetCards.length} snippet cards`);
      
      snippetCards.forEach((card, index) => {
        const headerElement = card.querySelector('.snippetHeader h3');
        if (headerElement) {
          const title = headerElement.textContent || '';
          const id = `snippet-${index}`;
          
          // Treat snippets as h2 level sections
          extractedHeadings.push({
            id,
            title: title.includes('Loading') ? `Snippet: ${card.id.replace('snippet-placeholder-', '')}` : title,
            level: 2
          });
          
          console.log(`Added snippet as section: ${title} with id: ${id}`);
        }
      });
      
      // Also extract snippet references (if any)
      const snippetRefs = tempDiv.querySelectorAll('.snippetRef');
      console.log(`Found ${snippetRefs.length} snippet references`);
      
      snippetRefs.forEach((ref, index) => {
        const text = ref.textContent || '';
        const match = text.match(/Snippet not found: (.+)/);
        if (match) {
          const title = `Snippet: ${match[1]}`;
          const id = `snippet-ref-${index}`;
          
          extractedHeadings.push({
            id,
            title,
            level: 2
          });
          
          console.log(`Added snippet reference as section: ${title} with id: ${id}`);
        }
      });
      
      return extractedHeadings;
    };
    
    // Function to add IDs to headings in the DOM
    const addIdsToDOMHeadings = (extractedHeadings: TOCItem[]) => {
      console.log('Adding IDs to DOM headings...');
      
      // Find all headings in the article content
      const articleContent = document.querySelector('.articleContent');
      if (!articleContent) {
        // Retry a few times if content is not ready
        if (retriesRef.current < 10) {
          retriesRef.current++;
          console.log(`Retry ${retriesRef.current}: Article content not found, retrying...`);
          setTimeout(() => addIdsToDOMHeadings(extractedHeadings), 300);
          return;
        }
        console.log('Article content not found after retries');
        return;
      }
      
      // Add IDs to h2 and h3 headings
      const headingElements = articleContent.querySelectorAll('h2, h3');
      console.log(`Found ${headingElements.length} headings (h2 and h3 only) in DOM`);
      
      let headingIndex = 0;
      headingElements.forEach((heading) => {
        if (headingIndex < extractedHeadings.length) {
          const item = extractedHeadings[headingIndex];
          // Only add IDs to regular headings, not snippet headers
          if (!heading.closest('.snippetHeader')) {
            const id = item.id;
            heading.id = id;
            console.log(`Added ID ${id} to heading: ${heading.textContent}`);
            headingIndex++;
          }
        }
      });
      
      // Add IDs to snippet cards - use the snippet ID from the card itself
      const snippetCards = articleContent.querySelectorAll('.snippetCard');
      console.log(`Found ${snippetCards.length} snippet cards in DOM`);
      
      snippetCards.forEach((card) => {
        // Use the card's existing ID if it has one
        if (card.id) {
          console.log(`Snippet card already has ID: ${card.id}`);
        }
      });
      
      // Add IDs to snippet references
      const snippetRefs = articleContent.querySelectorAll('.snippetRef');
      console.log(`Found ${snippetRefs.length} snippet references in DOM`);
      
      let refIndex = 0;
      snippetRefs.forEach((ref) => {
        // Find the corresponding snippet reference in our extracted list
        const refHeadings = extractedHeadings.filter(h => h.id.startsWith('snippet-ref-'));
        if (refIndex < refHeadings.length) {
          const id = refHeadings[refIndex].id;
          ref.id = id;
          console.log(`Added ID ${id} to snippet reference`);
          refIndex++;
        }
      });
    };
    
    // Function to update snippet titles
    const updateSnippetTitles = () => {
      const articleContent = document.querySelector('.articleContent');
      if (!articleContent) return;
      
      // Update snippet titles in TOC
      setHeadings(prevHeadings => {
        const updatedHeadings = [...prevHeadings];
        
        // Check each snippet card for title updates
        updatedHeadings.forEach((heading, index) => {
          if (heading.id.startsWith('snippet-')) {
            const card = document.getElementById(heading.id);
            if (card) {
              const headerElement = card.querySelector('.snippetHeader h3');
              if (headerElement) {
                const newTitle = headerElement.textContent || '';
                if (newTitle !== heading.title && !newTitle.includes('Loading')) {
                  console.log(`Updating snippet title from "${heading.title}" to "${newTitle}"`);
                  updatedHeadings[index] = { ...heading, title: newTitle };
                }
              }
            }
          }
        });
        
        return updatedHeadings;
      });
    };
    
    // First extract from content string
    const extractedHeadings = extractHeadingsFromContent();
    
    if (extractedHeadings.length > 0) {
      // Then add IDs to DOM
      addIdsToDOMHeadings(extractedHeadings);
      // Set the headings state
      setHeadings(extractedHeadings);
      
      // Set up interval to update snippet titles
      updateIntervalRef.current = setInterval(updateSnippetTitles, 500);
      
      // Clear interval after 5 seconds
      setTimeout(() => {
        if (updateIntervalRef.current) {
          clearInterval(updateIntervalRef.current);
          updateIntervalRef.current = null;
        }
      }, 5000);
    } else {
      // No headings found in content string
      setHeadings([]);
    }
    
    return () => {
      retriesRef.current = 0;
      processedRef.current = false;
      if (updateIntervalRef.current) {
        clearInterval(updateIntervalRef.current);
        updateIntervalRef.current = null;
      }
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
      const heading = Array.from(document.querySelectorAll('h2, h3')).find(
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