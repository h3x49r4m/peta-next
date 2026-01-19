import React, { useEffect, useRef, useState } from 'react';
import styles from '../styles/CodeBlock.module.css';

interface CodeBlockProps {
  code: string;
  language: string;
}

export default function CodeBlock({ code, language }: CodeBlockProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [Prism, setPrism] = useState<any>(null);
  const [highlightedCode, setHighlightedCode] = useState<string>('');

  useEffect(() => {
    // Dynamically import Prism and required languages
    const loadPrism = async () => {
      const PrismModule = await import('prismjs');
      const Prism = PrismModule.default;
      
      // Load core languages first
      await import('prismjs/components/prism-clike');
      await import('prismjs/components/prism-javascript');
      
      // Load other languages as needed
      const languageMap: { [key: string]: Promise<any> } = {
        python: () => import('prismjs/components/prism-python'),
        typescript: () => import('prismjs/components/prism-typescript'),
        tsx: () => import('prismjs/components/prism-tsx'),
        jsx: () => import('prismjs/components/prism-jsx'),
        bash: () => import('prismjs/components/prism-bash'),
        json: () => import('prismjs/components/prism-json'),
        markdown: () => import('prismjs/components/prism-markdown'),
        css: () => import('prismjs/components/prism-css'),
        scss: () => import('prismjs/components/prism-scss'),
        rust: () => import('prismjs/components/prism-rust'),
        go: () => import('prismjs/components/prism-go'),
        java: () => import('prismjs/components/prism-java'),
        cpp: () => import('prismjs/components/prism-cpp'),
        sql: () => import('prismjs/components/prism-sql'),
        yaml: () => import('prismjs/components/prism-yaml'),
        docker: () => import('prismjs/components/prism-docker'),
        nginx: () => import('prismjs/components/prism-nginx'),
      };
      
      const normalizedLanguage = language.toLowerCase().replace(/^language-/, '');
      if (languageMap[normalizedLanguage]) {
        await languageMap[normalizedLanguage]();
      }
      
      setPrism(Prism);
    };
    
    loadPrism();
  }, [language]);

  useEffect(() => {
    if (Prism && code) {
      // Don't clean the code - use it as-is to preserve indentation
      const processedCode = code;
      
      // Create a temporary element to highlight the code
      const tempElement = document.createElement('code');
      tempElement.className = `language-${language.toLowerCase().replace(/^language-/, '')}`;
      tempElement.textContent = processedCode;
      
      // Apply highlighting
      Prism.highlightElement(tempElement);
      
      // Get the highlighted HTML and split into lines
      const highlightedHTML = tempElement.innerHTML;
      const lines = highlightedHTML.split('\n');
      
      // Add line numbers to each line
      const linesWithNumbers = lines.map((line, index) => {
        const lineNumber = index + 1;
        // Use the line as-is, even if empty
        return `<div class="${styles.line}">
          <span class="${styles.lineNumber}">${lineNumber}</span>
          <span class="${styles.lineContent}">${line || ' '}</span>
        </div>`;
      }).join('');
      
      setHighlightedCode(linesWithNumbers);
    }
  }, [code, Prism, language]);

  return (
    <div className={styles.codeBlock}>
      <pre className={styles.pre}>
        <code 
          className={`language-${language.toLowerCase().replace(/^language-/, '')}`}
          dangerouslySetInnerHTML={{ __html: highlightedCode }}
        />
      </pre>
    </div>
  );
}