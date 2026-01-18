import { useEffect, useState } from 'react';
import MathRenderer from './MathRenderer';
import styles from '../styles/SnippetModal.module.css';

interface Snippet {
  id: string;
  title: string;
  date: string;
  content: any[];
  tags: string[];
}

interface SnippetModalProps {
  snippet: Snippet | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function SnippetModal({ snippet, isOpen, onClose }: SnippetModalProps) {
  const [renderedContent, setRenderedContent] = useState<string>('');

  useEffect(() => {
    if (snippet && isOpen) {
      renderSnippetContent(snippet.content).then(htmlContent => {
        setRenderedContent(htmlContent);
      });
    }
  }, [snippet, isOpen]);

  const parseRST = (text: string): string => {
    // Convert RST to HTML while preserving math formulas
    const lines = text.split('\n');
    const output: string[] = [];
    let i = 0;
    
    while (i < lines.length) {
      const line = lines[i];
      const nextLine = lines[i + 1];
      
      // Handle headers with underlines - this is the main RST heading format
      if (nextLine && (nextLine.startsWith('=') || nextLine.startsWith('-') || nextLine.startsWith('~')) && 
          nextLine.trim().length > 0) {
        // Check if it's a valid underline (all same character)
        const underlineChar = nextLine.trim()[0];
        if (nextLine.trim() === underlineChar.repeat(nextLine.trim().length)) {
          // Determine header level based on underline character
          let headerLevel = 2; // default for =
          if (underlineChar === '-') headerLevel = 3;
          else if (underlineChar === '~') headerLevel = 4;
          
          const headingText = line.trim();
          output.push(`<h${headerLevel}>${headingText}</h${headerLevel}>`);
          i += 2; // Skip the underline
          continue;
        }
      }
      
      // Handle lists - preserve indentation!
      if (line.trim().match(/^(\d+\.|\*|\-)\s/)) {
        const isNumbered = line.trim().match(/^\d+\./);
        const tag = isNumbered ? 'ol' : 'ul';
        const items = [];
        
        // Collect all list items, preserving their original indentation
        while (i < lines.length && lines[i].trim().match(/^(\d+\.|\*|\-)\s/)) {
          const currentLine = lines[i];
          const indent = currentLine.search(/\S/); // Count leading spaces
          
          // Preserve the original line with indentation
          let itemText = currentLine.replace(/^(\s*(\d+\.|\*|\-)\s+)/, '').trim();
          
          // Check if this is a nested item (starts with spaces)
          const isNested = indent > 0;
          
          // Process bold text in list items
          itemText = itemText.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
          
          if (isNested) {
            // For nested items, create a sub-list
            items.push(`<li class="nested">${itemText}</li>`);
          } else {
            items.push(`<li>${itemText}</li>`);
          }
          
          i++;
        }
        
        output.push(`<${tag}>${items.join('')}</${tag}>`);
        continue;
      }
      
      // Handle regular paragraphs
      if (line.trim()) {
        let processedLine = line.trim();
        
        // Process bold text
        processedLine = processedLine.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        
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
          // Fix inline math formulas
          .replace(/\$([^$\n]*(?:\$\$[^$\n]*\$\$)*[^$\n]*)\$/g, (match) => {
            // This is likely a broken formula, skip it if it contains display math
            if (match.includes('int_') || match.includes('sum_') || match.includes('lim_')) {
              return match; // Keep as is, will be handled by display math
            }
            return match;
          });
        
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

  const renderSnippetContent = async (content: any[]) => {
    const elements: string[] = [];
    
    for (const item of content) {
      if (item.type === 'text') {
        const htmlContent = parseRST(item.content);
        elements.push(htmlContent);
      }
    }
    
    return elements.join('\n');
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return dateString;
      }
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      return dateString;
    }
  };

  if (!isOpen || !snippet) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <div className={styles.headerContent}>
            <h2 className={styles.modalTitle}>{snippet.title}</h2>
            <div className={styles.headerMeta}>
              <time className={styles.modalDate} dateTime={snippet.date}>
                {formatDate(snippet.date)}
              </time>
              
              {snippet.tags && snippet.tags.length > 0 && (
                <div className={styles.modalTags}>
                  {snippet.tags.map((tag) => (
                    <span key={tag} className={styles.modalTag}>
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
          <button className={styles.closeButton} onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>
        
        <div className={styles.modalContent}>
          <MathRenderer content={renderedContent} />
        </div>
      </div>
    </div>
  );
}