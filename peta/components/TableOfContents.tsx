import React, { useState, useEffect, useRef } from 'react';
import styles from '../styles/TableOfContents.module.css';

interface TOCItem {
  id: string;
  title: string;
  level: number;
  children?: TOCItem[];
}

interface TableOfContentsProps {

  content: any[];

  postTitle?: string;

}



export default function TableOfContents({ content, postTitle }: TableOfContentsProps) {

  const [headings, setHeadings] = useState<TOCItem[]>([]);

  const [activeId, setActiveId] = useState<string>('');
  const [expandedSnippets, setExpandedSnippets] = useState<Set<string>>(new Set());

  const observerRef = useRef<IntersectionObserver | null>(null);

  const processedRef = useRef(false);



  useEffect(() => {

    if (!content || processedRef.current) return;

    

    processedRef.current = true;

    

    // Function to extract headings from RST content

    const extractHeadingsFromRST = () => {

      const extractedHeadings: TOCItem[] = [];

      let headingCounter = 0;

      

      content.forEach((item) => {

        if (item.type === 'text') {

          // Parse RST text to find headings

          const lines = item.content.split('\n');

          

          for (let i = 0; i < lines.length; i++) {

            const line = lines[i];

            const nextLine = lines[i + 1];

            

            // Handle headers with underlines

            if (nextLine && (nextLine.startsWith('=') || nextLine.startsWith('-') || nextLine.startsWith('~')) && 

                nextLine.trim().length > 0) {

              const underlineChar = nextLine.trim()[0];

              if (nextLine.trim() === underlineChar.repeat(nextLine.trim().length)) {

                let headerLevel = 2; // default for =

                if (underlineChar === '-') headerLevel = 3;

                else if (underlineChar === '~') headerLevel = 4;

                

                const headingText = line.trim();

                const id = `heading-${headingCounter++}`;

                

                extractedHeadings.push({

                  id,

                  title: headingText,

                  level: headerLevel

                });

              }

            }

          }

        } else if (item.type === 'embedded-snippet') {

          // Add snippet as a heading

          

                    const snippetTitle = item.title || item.id;

          

                    const formattedTitle = snippetTitle.replace(/-/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase());

          

                    const snippetId = item.id || `snippet-${Math.random().toString(36).substr(2, 9)}`;

          

                    

          

                    // Collect snippet headers

                    const snippetChildren: TOCItem[] = [];

          

                    // Add snippet's internal headings if they exist

          

                    if (item.content && Array.isArray(item.content)) {

          

                      item.content.forEach((c: any) => {

          

                        if (c.type === 'text') {

          

                          const snippetLines = c.content.split('\n');

          

                          

          

                          for (let j = 0; j < snippetLines.length; j++) {

          

                            const snippetLine = snippetLines[j];

          

                            const snippetNextLine = snippetLines[j + 1];

          

                            

          

                            if (snippetNextLine && (snippetNextLine.startsWith('=') || snippetNextLine.startsWith('-') || snippetNextLine.startsWith('~')) && 

          

                                snippetNextLine.trim().length > 0) {

          

                              const underlineChar = snippetNextLine.trim()[0];

          

                              if (snippetNextLine.trim() === underlineChar.repeat(snippetNextLine.trim().length)) {

          

                                let headerLevel = 2;

          

                                if (underlineChar === '-') headerLevel = 3;

          

                                else if (underlineChar === '~') headerLevel = 4;

          

                                

          

                                const headingText = snippetLine.trim();

          

                                const headingId = `${snippetId}-heading-${headingCounter++}`;

          

                                

          

                                snippetChildren.push({

          

                                  id: headingId,

          

                                  title: headingText,

          

                                  level: headerLevel + 1 // Nest under snippet

          

                                });

                              }

          

                            }

          

                          }

          

                        }

          

                      });

          

                    } else if (item.content && typeof item.content === 'string') {

          

                      // Handle single string content

          

                      const snippetLines = item.content.split('\n');

          

                      

          

                      for (let j = 0; j < snippetLines.length; j++) {

          

                        const snippetLine = snippetLines[j];

          

                        const snippetNextLine = snippetLines[j + 1];

          

                        

          

                        if (snippetNextLine && (snippetNextLine.startsWith('=') || snippetNextLine.startsWith('-') || snippetNextLine.startsWith('~')) && 

          

                            snippetNextLine.trim().length > 0) {

          

                          const underlineChar = snippetNextLine.trim()[0];

          

                          if (snippetNextLine.trim() === underlineChar.repeat(snippetNextLine.trim().length)) {

          

                            let headerLevel = 2;

          

                            if (underlineChar === '-') headerLevel = 3;

          

                            else if (underlineChar === '~') headerLevel = 4;

          

                            

          

                            const headingText = snippetLine.trim();

          

                            const headingId = `${snippetId}-heading-${headingCounter++}`;

          

                            

          

                            snippetChildren.push({

          

                              id: headingId,

          

                              title: headingText,

          

                              level: headerLevel + 1 // Nest under snippet

          

                            });

                          }

          

                        }

          

                      }

          

                    }

          

                    extractedHeadings.push({

          

                      id: snippetId,

          

                      title: `Snippet: ${formattedTitle}`,

          

                      level: 2,

          

                      children: snippetChildren // Store children directly with the snippet

                    });

        }

      });

      

      return extractedHeadings;

    };

    

    // Extract headings directly from RST content

    const extractedHeadings = extractHeadingsFromRST();
    
    if (extractedHeadings.length > 0) {
      setHeadings(extractedHeadings);
    } else {
      setHeadings([]);
    }

    

    return () => {

      processedRef.current = false;

    };

  }, [content]);

  useEffect(() => {
    // Add IDs to headings in the DOM
    const addIdsToDOM = () => {
      headings.forEach((heading) => {
        // Find the heading element by text content
        const allHeadings = document.querySelectorAll('h1, h2, h3, h4');
        const matchingHeading = Array.from(allHeadings).find(h => 
          h.textContent === heading.title && !h.id
        );
        
        if (matchingHeading) {
          matchingHeading.id = heading.id;
        }
      });
    };

    // Try to add IDs immediately
    addIdsToDOM();
    
    // If not all headings have IDs, retry a few times
    let retryCount = 0;
    const retryInterval = setInterval(() => {
      const allHeadings = document.querySelectorAll('h1, h2, h3, h4');
      const headingsWithIds = Array.from(allHeadings).filter(h => h.id);
      
      if (headingsWithIds.length === headings.length || retryCount >= 5) {
        clearInterval(retryInterval);
      } else {
        addIdsToDOM();
        retryCount++;
      }
    }, 200);

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
      clearInterval(retryInterval);
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

// Function to build hierarchical structure from flat headings array
    const buildHierarchy = (headings: TOCItem[]): TOCItem[] => {
      const result: TOCItem[] = [];
      const processed = new Set<string>();
      
      headings.forEach((heading, index) => {
        if (processed.has(heading.id)) return;
        
        // If it's a snippet, determine if it should be nested
        if (heading.title.includes('Snippet:')) {
          let parentHeading = null;
          let shouldNest = false;
          
          // Only nest if snippet appears AFTER a heading (not before)
          // Look for parent before the snippet
          for (let i = index - 1; i >= 0; i--) {
            const candidate = headings[i];
            if (!candidate.title.includes('Snippet:')) {
              // Check if snippet is close to this heading (within 1 position)
              if (index - i <= 1) {
                parentHeading = candidate;
                shouldNest = true;
              }
              break;
            }
          }
          
          // If snippet appears before any heading, it's standalone
          if (shouldNest && parentHeading) {
            // Find or create parent in result
            let parentInResult = result.find(item => item.id === parentHeading.id);
            
            if (!parentInResult) {
              parentInResult = {
                ...parentHeading,
                children: []
              };
              result.push(parentInResult);
              processed.add(parentHeading.id);
            }
            
            // Add snippet to parent with its children
            parentInResult.children!.push({
              ...heading,
              children: heading.children || []
            });
            processed.add(heading.id);
          } else {
            // Standalone snippet - add as top-level with its children
            result.push({
              ...heading,
              children: heading.children || []
            });
            processed.add(heading.id);
          }
        } else if (!heading.title.includes('Snippet:')) {
          // Regular heading - check if already added
          const isInResult = result.some(item => item.id === heading.id);
          
          if (!isInResult && !processed.has(heading.id)) {
            result.push({
              ...heading,
              children: []
            });
            processed.add(heading.id);
          }
        }
      });
      
      return result;
    };
  
  // Function to toggle snippet expansion
  const toggleSnippet = (snippetId: string) => {
    setExpandedSnippets(prev => {
      const newSet = new Set(prev);
      if (newSet.has(snippetId)) {
        newSet.delete(snippetId);
      } else {
        newSet.add(snippetId);
      }
      return newSet;
    });
  };

// Function to render TOC items recursively
  const renderTOCItem = (item: TOCItem, index: number, parentLevel: number = 0) => {
    const isActive = activeId === item.id;
    const isSnippet = item.title.includes('Snippet:');
    const isExpanded = expandedSnippets.has(item.id);
    const hasChildren = item.children && item.children.length > 0;
    
    // Calculate the actual level for styling
    const actualLevel = isSnippet ? parentLevel + 1 : item.level;
    const itemClass = `tocItem level-${actualLevel} ${isActive ? 'active' : ''}`;
    const snippetClass = isSnippet ? 'snippetItem' : '';

    // For snippets, use button with toggle
    if (isSnippet) {
      const snippetTitle = item.title.replace('Snippet: ', '');
      
      return (
        <li key={item.id || index} className={`${itemClass} ${snippetClass}`}>
          <button 
            className="tocLink snippetToggle" 
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              toggleSnippet(item.id);
              // Also scroll to snippet position
              scrollToHeading(item.id);
            }}
          >
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
              <span 
                style={{ 
                  display: 'inline-flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  width: '10px', 
                  height: '10px',
                  borderRadius: '1px',
                  backgroundColor: 'var(--primary-color)',
                  color: 'white',
                  fontSize: '9px',
                  fontWeight: 'bold',
                  marginRight: '3px',
                  transition: 'transform 0.2s ease'
                }}
              >
                {isExpanded ? '−' : '+'}
              </span>
              <span>Snippet: {snippetTitle}</span>
            </span>
          </button>
          {isExpanded && hasChildren && (
            <ul className="tocList">
              {item.children!.map((child, childIndex) => renderTOCItem(child, childIndex, actualLevel))}
            </ul>
          )}
        </li>
      );
    }

    // For regular headings
    return (
      <li key={item.id || index} className={itemClass}>
        <a href={`#${item.id}`} className="tocLink" onClick={(e) => {
          e.preventDefault();
          scrollToHeading(item.id);
        }}>
          {item.title}
        </a>
        {hasChildren && (
          <ul className="tocList">
            {item.children!.map((child, childIndex) => renderTOCItem(child, childIndex, actualLevel))}
          </ul>
        )}
      </li>
    );
  };
  
  const hierarchicalHeadings = buildHierarchy(headings);

  // Always render the component for debugging
  return (
    <div className={styles.tableOfContents}>
      <h3 className={styles.tocTitle}>{postTitle || 'Table of Contents'}</h3>
      {headings.length > 0 ? (
        <ul className={styles.tocList}>
          {hierarchicalHeadings.map((item, index) => renderTOCItem(item, index))}
        </ul>
      ) : (
        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
          No headings found
        </p>
      )}
    </div>
  );
}