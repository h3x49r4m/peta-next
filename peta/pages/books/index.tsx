import { useState, useEffect } from 'react';
import TagFilter from '../../components/TagFilter';
import BookGrid from '../../components/BookGrid';
import BookTOC from '../../components/BookTOC';
import styles from '../../styles/Books.module.css'; // Use Books-specific styles
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

  const parseSimpleTable = (lines: string[], startIndex: number): { html: string; nextIndex: number } => {
    const tableLines: string[] = [];
    let i = startIndex;
    
    // Collect all table lines
    while (i < lines.length && (lines[i].includes('|') || lines[i].trim() === '')) {
      if (lines[i].trim()) {
        // Skip separator lines (lines with only |, -, and spaces)
        const trimmed = lines[i].replace(/\s/g, '');
        if (!trimmed.match(/^\|[-\|]+\|?$/)) {
          tableLines.push(lines[i]);
        }
      }
      i++;
    }
    
    if (tableLines.length < 2) {
      return { html: '', nextIndex: startIndex };
    }
    
    // Parse table rows
    const rows: string[][] = [];
    for (const line of tableLines) {
      const cells = line.split('|').map(cell => cell.trim()).filter(cell => cell);
      if (cells.length > 0) {
        rows.push(cells);
      }
    }
    
    if (rows.length === 0) {
      return { html: '', nextIndex: startIndex };
    }
    
    // Generate HTML table
    let html = '<table class="rst-table">\n';
    
    // First row is header
    if (rows.length > 0) {
      html += '<thead>\n<tr>\n';
      for (const cell of rows[0]) {
        const formattedCell = cell
          .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
          .replace(/\*(.*?)\*/g, '<em>$1</em>')
          .replace(/`(.*?)`/g, '<code>$1</code>');
        html += `<th>${formattedCell}</th>\n`;
      }
      html += '</tr>\n</thead>\n';
    }
    
    // Remaining rows are body
    html += '<tbody>\n';
    for (let r = 1; r < rows.length; r++) {
      html += '<tr>\n';
      for (const cell of rows[r]) {
        const formattedCell = cell
          .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
          .replace(/\*(.*?)\*/g, '<em>$1</em>')
          .replace(/`(.*?)`/g, '<code>$1</code>');
        html += `<td>${formattedCell}</td>\n`;
      }
      html += '</tr>\n';
    }
    html += '</tbody>\n</table>\n';
    
    return { html, nextIndex: i };
  };

  const parseRstSimpleTable = (lines: string[], startIndex: number): { html: string; nextIndex: number } => {
    // Handle RST simple tables with space-separated columns and dash separators
    const rows: string[][] = [];
    let i = startIndex;
    
    // Get header row
    const headerLine = lines[i];
    const headerCells = parseTableRow(headerLine);
    if (headerCells.length === 0) {
      return { html: '', nextIndex: startIndex };
    }
    
    // Check if the next line is a separator line (dashes)
    if (i + 1 >= lines.length || !lines[i + 1].trim().match(/^[=-]+(\s+[=-]+)*$/)) {
      return { html: '', nextIndex: startIndex };
    }
    
    // Skip the separator line (dashes)
    i += 2;
    
    // Parse data rows until we hit an empty line or a line that looks like another separator
    while (i < lines.length && lines[i].trim() !== '') {
      const line = lines[i].trim();
      
      // Stop if we encounter another separator line
      if (line.match(/^[=-]+(\s+[=-]+)*$/)) {
        break;
      }
      
      const rowCells = parseTableRow(lines[i]);
      if (rowCells.length > 0) {
        rows.push(rowCells);
      }
      i++;
    }
    
    // Generate HTML table
    let html = '<table class="rst-table">\n';
    
    // Generate header
    html += '<thead>\n<tr>\n';
    for (const cell of headerCells) {
      const formattedCell = cell
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/`(.*?)`/g, '<code>$1</code>');
      html += `<th>${formattedCell}</th>\n`;
    }
    html += '</tr>\n</thead>\n';
    
    // Generate body
    html += '<tbody>\n';
    for (const row of rows) {
      html += '<tr>\n';
      for (const cell of row) {
        const formattedCell = cell
          .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
          .replace(/\*(.*?)\*/g, '<em>$1</em>')
          .replace(/`(.*?)`/g, '<code>$1</code>');
        html += `<td>${formattedCell}</td>\n`;
      }
      html += '</tr>\n';
    }
    html += '</tbody>\n</table>\n';
    
    return { html, nextIndex: i };
  };

  const parseTableRow = (line: string): string[] => {
    // Parse a table row by identifying column boundaries
    // This handles both space-separated and tab-separated columns
    const cells: string[] = [];
    
    // First try to split on tabs (if any)
    if (line.includes('\t')) {
      const parts = line.split('\t');
      for (const part of parts) {
        const trimmed = part.trim();
        if (trimmed) {
          cells.push(trimmed);
        }
      }
    } else {
      // Split on multiple spaces (3 or more for better column detection)
      const parts = line.split(/\s{3,}/);
      
      // If that doesn't work well, try with 2 spaces
      if (parts.length === 1) {
        const fallbackParts = line.split(/\s{2,}/);
        for (const part of fallbackParts) {
          const trimmed = part.trim();
          if (trimmed) {
            cells.push(trimmed);
          }
        }
      } else {
        for (const part of parts) {
          const trimmed = part.trim();
          if (trimmed) {
            cells.push(trimmed);
          }
        }
      }
    }
    
    return cells;
  };

  const parseRSTTable = (lines: string[], startIndex: number): { html: string; nextIndex: number } => {
    // This handles more complex grid tables with +---+ borders
    const tableLines: string[] = [];
    let i = startIndex;
    
    // Find the start of the table (line with +---+ pattern)
    while (i < lines.length && !lines[i].includes('+---')) {
      i++;
    }
    
    if (i >= lines.length) {
      return { html: '', nextIndex: startIndex };
    }
    
    // Collect table lines
    while (i < lines.length && (lines[i].includes('+') || lines[i].includes('|'))) {
      tableLines.push(lines[i]);
      i++;
    }
    
    if (tableLines.length < 3) {
      return { html: '', nextIndex: startIndex };
    }
    
    // Parse grid table
    const rows: string[][] = [];
    for (const line of tableLines) {
      if (line.includes('|')) {
        // Remove borders and split by |
        const content = line.replace(/^\+\s*\|\s*|\s*\|\s*\+$/g, '').replace(/\s*\|\s*/g, '|');
        const cells = content.split('|').map(cell => cell.trim());
        if (cells.length > 0) {
          rows.push(cells);
        }
      }
    }
    
    if (rows.length === 0) {
      return { html: '', nextIndex: startIndex };
    }
    
    // Generate HTML table
    let html = '<table class="rst-table">\n';
    
    // Check if there's a header separator
    let hasHeader = false;
    let headerRowIndex = 0;
    
    for (let j = 0; j < tableLines.length; j++) {
      if (tableLines[j].includes('+') && tableLines[j].match(/\+=+/)) {
        hasHeader = true;
        headerRowIndex = j - 1;
        break;
      }
    }
    
    // Generate header
    if (hasHeader && headerRowIndex >= 0 && headerRowIndex < rows.length) {
      html += '<thead>\n<tr>\n';
      for (const cell of rows[headerRowIndex]) {
        const formattedCell = cell
          .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
          .replace(/\*(.*?)\*/g, '<em>$1</em>')
          .replace(/`(.*?)`/g, '<code>$1</code>');
        html += `<th>${formattedCell}</th>\n`;
      }
      html += '</tr>\n</thead>\n';
      
      // Skip header row in body
      rows.splice(headerRowIndex, 1);
    }
    
    // Generate body
    html += '<tbody>\n';
    for (const row of rows) {
      html += '<tr>\n';
      for (const cell of row) {
        const formattedCell = cell
          .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
          .replace(/\*(.*?)\*/g, '<em>$1</em>')
          .replace(/`(.*?)`/g, '<code>$1</code>');
        html += `<td>${formattedCell}</td>\n`;
      }
      html += '</tr>\n';
    }
    html += '</tbody>\n</table>\n';
    
    return { html, nextIndex: i };
  };

  const parseRST = (text: string): string => {
    // Convert RST to HTML while preserving math formulas
    const lines = text.split('\n');
    const output: string[] = [];
    let i = 0;
    let headingCounter = 0;
    
    while (i < lines.length) {
      const line = lines[i];
      const nextLine = lines[i + 1];
      
      // Handle RST tables (grid tables)
      if (line.includes('+') && line.includes('-')) {
        const tableResult = parseRSTTable(lines, i);
        if (tableResult.html) {
          output.push(tableResult.html);
          i = tableResult.nextIndex;
          continue;
        }
      }
      
      // Handle simple tables (with | separators)
      if (line.includes('|')) {
        const tableResult = parseSimpleTable(lines, i);
        if (tableResult.html) {
          output.push(tableResult.html);
          i = tableResult.nextIndex;
          continue;
        }
      }
      
      // Handle RST simple tables (with column headers and dash separators)
      if (nextLine && nextLine.trim().match(/^[=-]+(\s+[=-]+)*$/)) {
        const tableResult = parseRstSimpleTable(lines, i);
        if (tableResult.html) {
          output.push(tableResult.html);
          i = tableResult.nextIndex;
          continue;
        }
      }
      
      // Handle headers with underlines - this is the main RST heading format
      if (nextLine && (nextLine.startsWith('=') || nextLine.startsWith('-') || nextLine.startsWith('~') || nextLine.startsWith('^')) && 
          nextLine.trim().length > 0) {
        // Check if it's a valid underline (all same character)
        const underlineChar = nextLine.trim()[0];
        if (nextLine.trim() === underlineChar.repeat(nextLine.trim().length)) {
          // Determine header level based on underline character
          let headerLevel = 2; // default for =
          if (underlineChar === '-') headerLevel = 3;
          else if (underlineChar === '~') headerLevel = 4;
          else if (underlineChar === '^') headerLevel = 5;
          
          const headingText = line.trim();
          
          // Convert heading text to slug format for meaningful IDs
          const headingSlug = headingText.toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
            .replace(/\s+/g, '-'); // Replace spaces with hyphens
          
          const headingId = `heading-${headingSlug}`;
          output.push(`<h${headerLevel} id="${headingId}">${headingText}</h${headerLevel}>`);
          i += 2; // Skip the underline
          continue;
        }
      }
      
      // Handle lists - preserve indentation and create proper nested structures
      if (line.trim().match(/^(\d+\.|\*|\-)\s/)) {
        const isNumbered = line.trim().match(/^\d+\./);
        const tag = isNumbered ? 'ol' : 'ul';
        
        // Parse the entire list
        const listItems: string[] = [];
        let listIndent = line.match(/^(\s*)/)?.[1].length || 0;
        
        while (i < lines.length && lines[i].trim()) {
          const listLine = lines[i];
          if (listLine.trim().match(/^(\d+\.|\*|\-)\s/)) {
            let itemContent = listLine.trim().replace(/^(\d+\.|\*|\-)\s/, '');
            
            // Apply RST formatting to list items
            itemContent = itemContent
              .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // Bold text
              .replace(/\*(.*?)\*/g, '<em>$1</em>') // Italic text
              .replace(/`(.*?)`/g, '<code>$1</code>'); // Inline code
            
            listItems.push(`<li>${itemContent}</li>`);
          } else if (listLine.trim()) {
            // Continuation of list item - apply formatting
            let continuationContent = listLine.trim();
            continuationContent = continuationContent
              .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // Bold text
              .replace(/\*(.*?)\*/g, '<em>$1</em>') // Italic text
              .replace(/`(.*?)`/g, '<code>$1</code>'); // Inline code
            
            listItems[listItems.length - 1] = listItems[listItems.length - 1].replace('</li>', ` ${continuationContent}</li>`);
          } else {
            break;
          }
          i++;
        }
        
        output.push(`<${tag}>${listItems.join('')}</${tag}>`);
        continue;
      }
      
      // Handle regular paragraphs
      if (line.trim()) {
        let processedLine = line.trim();
        
        // Process the entire line to fix math formulas
        processedLine = processedLine
          // Fix broken display math formulas first
          .replace(/\$\$([^$]*(?:\$\$[^$]*\$\$)*[^$]*)\$\$/g, (match) => {
            // Remove extra $$ and fix the formula
            let formula = match.replace(/\$\$/g, '');
            // Fix common LaTeX syntax issues
            formula = formula
              .replace(/\\frac\{([^}]*)\}\{([^}]*)\}/g, '\\frac{$1}{$2}')
              .replace(/\^([^\s\}]+)/g, '^{$1}')
              .replace(/_\{([^}]*)\}/g, '_{$1}')
              .replace(/\{([^\}]+)\}/g, '{$1}');
            return `$$${formula}$$`;
          })
          // Process RST formatting
          .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // Bold text
          .replace(/\*(.*?)\*/g, '<em>$1</em>') // Italic text
          .replace(/`(.*?)`/g, '<code>$1</code>'); // Inline code
        
        output.push(`<p>${processedLine}</p>`);
      }
      
      i++;
    }
    
    // Post-process to combine broken math formulas
    let result = output.join('\n');
    
    // Fix broken display math with missing closing
    result = result.replace(/\$\$([^$]*\$\$[^$]*\$\$)/g, (match) => {
      const formula = match.replace(/\$\$/g, '');
      return `$$${formula}$$`;
    });
    
    return result;
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
              <BookTOC 
                book={selectedBook} 
              />
            )}
          </aside>

          <main className={styles.mainContent}>
            <article className={styles.article}>
              <header className={styles.articleHeader}>
                <h1 className={styles.articleTitle}>{selectedBook.title}</h1>
                <div className={styles.articleMeta}>
                  <span className={styles.articleAuthor}>
                    by {selectedBook.author}
                  </span>
                  <time className={styles.articleDate} dateTime={selectedBook.date}>
                    {new Date(selectedBook.date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </time>
                </div>
                {selectedBook.tags && selectedBook.tags.length > 0 && (
                  <div className={styles.articleTags}>
                    {selectedBook.tags.map(tag => (
                      <span key={tag} className={styles.articleTag}>
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
                {selectedBook.description && (
                  <p className={styles.articleDescription}>{selectedBook.description}</p>
                )}
              </header>

              <div className={styles.articleContent}>
                {/* Render introduction from index.rst */}
                {selectedBook.content && selectedBook.content.length > 0 && (
                  <section className={styles.bookSection}>
                    <h2>Introduction</h2>
                    {selectedBook.content.map((item, index) => {
                      if (item.type === 'text') {
                        const htmlContent = parseRST(item.content);
                        
                        return (
                          <MathRenderer 
                            key={index} 
                            content={htmlContent}
                          />
                        );
                      }
                      return null;
                    })}
                  </section>
                )}

                {/* Render each section */}
                {selectedBook.sections && selectedBook.sections.length > 0 && selectedBook.sections.map((section) => (
                  <section key={section.id} id={`section-${section.id}`} className={styles.bookSection}>
                    <h2>{section.title}</h2>
                    {section.content && section.content.map((item, index) => {
                      if (item.type === 'text') {
                        const htmlContent = parseRST(item.content);
                        
                        return (
                          <MathRenderer 
                            key={index} 
                            content={htmlContent}
                          />
                        );
                      }
                      return null;
                    })}
                  </section>
                ))}
              </div>
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