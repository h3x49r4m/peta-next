import { useEffect, useRef } from 'react';
import styles from '../styles/MathRenderer.module.css';

interface MathRendererProps {
  content: string;
}

export default function MathRenderer({ content }: MathRendererProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current && typeof window !== 'undefined') {
      // Set the HTML content directly
      containerRef.current.innerHTML = content;
      
      // Render math formulas
      if (window.katex && window.renderMathInElement) {
        try {
          window.renderMathInElement(containerRef.current, {
            delimiters: [
              { left: '$$', right: '$$', display: true },
              { left: '$', right: '$', display: false },
              { left: '\\[', right: '\\]', display: true },
              { left: '\\(', right: '\\)', display: false }
            ],
            throwOnError: false
          });
        } catch (error) {
          console.error('Error rendering math:', error);
        }
      }
    }
  }, [content]);

  return (
    <div 
      ref={containerRef} 
      className={styles.mathRenderer}
      style={{ overflowX: 'auto' }}
    />
  );
}